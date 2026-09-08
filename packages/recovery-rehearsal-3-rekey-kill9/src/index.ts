import {
  createSyncOutbox,
  pullBatch,
  pushBatch,
  type EntityRevisionReader,
  type EntityState,
  type EntityStateStore,
  type PullRecord,
  type PushBatchResponse,
  type PushRecordRequest,
  type SyncCryptoClient,
  type SyncPullTransport,
  type SyncPushTransport,
} from '../../plugin-account/src/sync-engine';
import {
  generateRecoverySigningKeypair,
  signRecoveryTranscript,
  verifyRecoveryTranscript,
} from '../../ed25519-recovery-signing/src';
import {
  InMemoryRekeyCheckpointStore,
  resumeTwoPhaseRekey,
  stageTwoPhaseRekey,
  startTwoPhaseRekey,
} from '../../rekey-two-phase/src';
import {
  InMemoryDevicePairingRegistry,
  generateDeviceKeypair,
  type RegisteredDevice,
} from '../../x25519-device-keypair/src';

export type RecoveryScenarioName =
  | 'server_wipe_client_resync'
  | 'local_wipe_mnemonic_restore'
  | 'rekey_kill9_resume'
  | 'device_revoke_write_rejection';

export interface RecoveryScenarioResult {
  name: RecoveryScenarioName;
  passed: boolean;
  details: string;
}

export async function rehearseServerWipeClientResync(
  options: { seedLocalOutbox?: boolean } = {},
): Promise<RecoveryScenarioResult> {
  const outbox = createSyncOutbox({
    nowMs: () => 1_700_000_001_000,
    generateMutationId: () => '018f0000-0000-7000-8000-000000000101',
  });
  const server = createInMemorySyncServer();

  try {
    if (options.seedLocalOutbox !== false) {
      outbox.enqueue({
        entityType: 'todos',
        entityId: 'todo-1',
        plaintext: encodeText('encrypted-local'),
      });
    }

    const entries = outbox.list();
    const pushResponse = await pushBatch(
      {
        crypto: createPassthroughCrypto(),
        revisions: zeroRevisionReader(),
        transport: server,
      },
      { entries },
    );
    outbox.remove(ackedMutationIds(pushResponse));

    const pulled = await pullBatch(
      {
        entityStates: createEntityStateStore(),
        applier: createPullApplier(),
        transport: server,
      },
      {
        sinceCommitSeq: 0n,
        lastSeenAccountCommitSeq: 0n,
      },
    );

    const passed = server.acceptedEnvelopeCount() > 0 && pulled.currentAccountCommitSeq > 0n;
    const details = passed
      ? `accepted=${server.acceptedEnvelopeCount()} pulledCommitSeq=${pulled.currentAccountCommitSeq.toString()}`
      : `accepted=${server.acceptedEnvelopeCount()} outboxEntries=${entries.length} pulledCommitSeq=${pulled.currentAccountCommitSeq.toString()}`;

    return {
      name: 'server_wipe_client_resync',
      passed,
      details,
    };
  } catch (error) {
    return {
      name: 'server_wipe_client_resync',
      passed: false,
      details: `sync replay failed: ${formatError(error)}`,
    };
  } finally {
    outbox.clear();
    server.clear();
  }
}

export async function rehearseLocalWipeMnemonicRestore(): Promise<RecoveryScenarioResult> {
  const originalKeypair = generateRecoverySigningKeypair();
  const restoredKeypair = {
    privateKeyPkcs8: new Uint8Array(originalKeypair.privateKeyPkcs8),
    publicKeySpki: new Uint8Array(originalKeypair.publicKeySpki),
  };
  const transcript = encodeText('acct-1:restore:todo-1');
  const tamperedTranscript = encodeText('acct-1:restore:todo-2');

  try {
    const signature = signRecoveryTranscript({
      privateKeyPkcs8: restoredKeypair.privateKeyPkcs8,
      transcript,
    });
    const validTranscript = verifyRecoveryTranscript({
      publicKeySpki: originalKeypair.publicKeySpki,
      transcript,
      signature,
    });
    const invalidTranscript = verifyRecoveryTranscript({
      publicKeySpki: originalKeypair.publicKeySpki,
      transcript: tamperedTranscript,
      signature,
    });
    const passed = validTranscript && !invalidTranscript;

    return {
      name: 'local_wipe_mnemonic_restore',
      passed,
      details: `validTranscript=${String(validTranscript)} tamperedTranscript=${String(invalidTranscript)}`,
    };
  } catch (error) {
    return {
      name: 'local_wipe_mnemonic_restore',
      passed: false,
      details: `recovery signing failed: ${formatError(error)}`,
    };
  } finally {
    originalKeypair.privateKeyPkcs8.fill(0);
    originalKeypair.publicKeySpki.fill(0);
    restoredKeypair.privateKeyPkcs8.fill(0);
    restoredKeypair.publicKeySpki.fill(0);
    transcript.fill(0);
    tamperedTranscript.fill(0);
  }
}

export async function rehearseRekeyKill9Resume(): Promise<RecoveryScenarioResult> {
  const store = new InMemoryRekeyCheckpointStore();
  const sessionId = 'rekey-rehearsal';

  try {
    const started = await startTwoPhaseRekey(store, beginInput());
    await stageTwoPhaseRekey(store, started, [blob()]);
    const resumed = await resumeTwoPhaseRekey(store, sessionId, {
      blobs: [blob()],
      gate: { mnemonicConfirmed: true, oldRecoveryProofValid: true },
    });
    const passed = resumed.phase === 'after_swap' && resumed.account.currentKeyId === 2;

    return {
      name: 'rekey_kill9_resume',
      passed,
      details: `phase=${resumed.phase} currentKeyId=${resumed.account.currentKeyId}`,
    };
  } catch (error) {
    return {
      name: 'rekey_kill9_resume',
      passed: false,
      details: `rekey resume failed: ${formatError(error)}`,
    };
  } finally {
    await store.clear(sessionId);
  }
}

export async function rehearseDeviceRevokeWriteRejection(): Promise<RecoveryScenarioResult> {
  const firstOutbox = createSyncOutbox({
    nowMs: () => 1_700_000_002_000,
    generateMutationId: () => '018f0000-0000-7000-8000-000000000201',
  });
  const secondOutbox = createSyncOutbox({
    nowMs: () => 1_700_000_003_000,
    generateMutationId: () => '018f0000-0000-7000-8000-000000000202',
  });
  const deviceKeypair = generateDeviceKeypair();
  const registry = new InMemoryDevicePairingRegistry({
    maxDevices: 4,
    minRequestIntervalMs: 0,
    nowMs: () => 2_000,
  });
  let device: RegisteredDevice = registry.registerDevice({
    accountId: 'acct-1',
    deviceId: 'dev-old',
    publicKeySpki: deviceKeypair.publicKeySpki,
    status: 'active',
  });
  const transport: SyncPushTransport = {
    async pushBatch(request) {
      if (device.status === 'revoked') {
        throw new Error('E3030: revoked device cannot push mutations');
      }
      return {
        status: request.records.length > 0 ? 207 : 200,
        results: request.records.map((record) => ({
          mutationId: record.mutationId,
          status: 'ok' as const,
          appliedRevision: record.proposedRevision,
          commitSeq: '1',
        })),
      };
    },
  };

  try {
    firstOutbox.enqueue({
      entityType: 'todos',
      entityId: 'todo-1',
      plaintext: encodeText('first-write'),
    });
    const firstPush = await pushBatch(
      {
        crypto: createPassthroughCrypto(),
        revisions: zeroRevisionReader(),
        transport,
      },
      { entries: firstOutbox.list() },
    );
    firstOutbox.remove(ackedMutationIds(firstPush));

    device = { ...device, status: 'revoked' };

    secondOutbox.enqueue({
      entityType: 'todos',
      entityId: 'todo-1',
      plaintext: encodeText('revoked-write'),
    });

    let secondPushError = '';
    try {
      await pushBatch(
        {
          crypto: createPassthroughCrypto(),
          revisions: zeroRevisionReader(),
          transport,
        },
        { entries: secondOutbox.list() },
      );
    } catch (error) {
      secondPushError = formatError(error);
    }

    const firstPushSucceeded = firstPush.results.every((result) => result.status === 'ok');
    const secondPushRejected = secondPushError.includes('E3030');

    return {
      name: 'device_revoke_write_rejection',
      passed: firstPushSucceeded && secondPushRejected,
      details: `firstPushSucceeded=${String(firstPushSucceeded)} secondPushError=${secondPushError || 'none'}`,
    };
  } catch (error) {
    return {
      name: 'device_revoke_write_rejection',
      passed: false,
      details: `device revoke enforcement failed: ${formatError(error)}`,
    };
  } finally {
    firstOutbox.clear();
    secondOutbox.clear();
    deviceKeypair.privateKeyPkcs8.fill(0);
    deviceKeypair.publicKeySpki.fill(0);
  }
}

export async function runAllRecoveryRehearsals(): Promise<RecoveryScenarioResult[]> {
  return [
    await rehearseServerWipeClientResync(),
    await rehearseLocalWipeMnemonicRestore(),
    await rehearseRekeyKill9Resume(),
    await rehearseDeviceRevokeWriteRejection(),
  ];
}

function beginInput() {
  return {
    accountId: 'acct-1',
    account: {
      currentKeyId: 1,
      keyQuarantineAt: null,
      recoverySigningPub: new Uint8Array(32).fill(1),
      keyring: [{ keyId: 1, status: 'active' as const }],
    },
    trigger: 'device_revocation' as const,
    sessionId: 'rekey-rehearsal',
    newMnemonic: 'new '.repeat(24).trim(),
    newRecoverySigningPub: new Uint8Array(32).fill(2),
    devices: [{ deviceId: 'dev-new', devicePub: new Uint8Array(32).fill(3), status: 'active' as const }],
    nowMs: () => 1,
  };
}

function blob() {
  return {
    entityType: 'todos',
    entityId: 'todo-1',
    revision: 1n,
    deletedFlag: 0,
    schemaVersion: 1,
    sourceMutationId: 'mut-1',
  };
}

function encodeText(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function createPassthroughCrypto(): SyncCryptoClient {
  return {
    async encryptFor(input) {
      const envelope = new Uint8Array(input.plaintext.length + 1);
      envelope.set(input.plaintext, 0);
      envelope[envelope.length - 1] = Number(input.proposedRevision & 0xffn);
      return envelope;
    },
  };
}

function zeroRevisionReader(): EntityRevisionReader {
  return {
    async maxSeenRevision() {
      return 0n;
    },
  };
}

function ackedMutationIds(response: PushBatchResponse): string[] {
  return response.results
    .filter((result) => result.status === 'ok' || result.status === 'duplicate')
    .map((result) => result.mutationId);
}

function createEntityStateStore(): EntityStateStore {
  const states = new Map<string, EntityState>();

  return {
    async get(entity) {
      return states.get(entityStorageKey(entity));
    },
    async put(state) {
      states.set(entityStorageKey(state), {
        ...state,
      });
    },
  };
}

function createPullApplier() {
  return {
    async apply() {
      return;
    },
  };
}

function createInMemorySyncServer(): SyncPushTransport &
  SyncPullTransport & {
    acceptedEnvelopeCount(): number;
    clear(): void;
  } {
  let currentAccountCommitSeq = 0n;
  const acceptedEnvelopes: number[][] = [];
  const records = new Map<string, PullRecord>();

  return {
    async pushBatch(request) {
      const results = request.records.map((record) => {
        currentAccountCommitSeq += 1n;
        acceptedEnvelopes.push([...record.envelope]);
        records.set(entityStorageKey(record), {
          entityType: record.entityType,
          entityId: record.entityId,
          revision: record.proposedRevision,
          commitSeq: currentAccountCommitSeq.toString(),
          blobHash: blobHash(record),
          keyId: 1,
          envelope: [...record.envelope],
        });
        return {
          mutationId: record.mutationId,
          status: 'ok' as const,
          appliedRevision: record.proposedRevision,
          commitSeq: currentAccountCommitSeq.toString(),
        };
      });

      return {
        status: results.length > 0 ? 207 : 200,
        results,
      };
    },

    async pullBatch(request) {
      const sinceCommitSeq = BigInt(request.sinceCommitSeq);
      const pulledRecords = [...records.values()]
        .filter((record) => BigInt(record.commitSeq) > sinceCommitSeq)
        .sort((left, right) => compareBigIntStrings(left.commitSeq, right.commitSeq))
        .slice(0, request.limit)
        .map(clonePullRecord);

      return {
        currentAccountCommitSeq: currentAccountCommitSeq.toString(),
        records: pulledRecords,
      };
    },

    acceptedEnvelopeCount() {
      return acceptedEnvelopes.length;
    },

    clear() {
      acceptedEnvelopes.length = 0;
      records.clear();
      currentAccountCommitSeq = 0n;
    },
  };
}

function entityStorageKey(entity: { entityType: string; entityId: string }): string {
  return `${entity.entityType}\u0000${entity.entityId}`;
}

function blobHash(record: PushRecordRequest): string {
  return record.envelope.join('-');
}

function compareBigIntStrings(left: string, right: string): number {
  const leftValue = BigInt(left);
  const rightValue = BigInt(right);
  if (leftValue === rightValue) {
    return 0;
  }
  return leftValue < rightValue ? -1 : 1;
}

function clonePullRecord(record: PullRecord): PullRecord {
  return {
    ...record,
    envelope: [...record.envelope],
  };
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
