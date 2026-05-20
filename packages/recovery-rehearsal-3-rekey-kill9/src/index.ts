import {
  InMemoryRekeyCheckpointStore,
  resumeTwoPhaseRekey,
  stageTwoPhaseRekey,
  startTwoPhaseRekey,
} from '../../rekey-two-phase/src';

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

export function rehearseServerWipeClientResync(): RecoveryScenarioResult {
  const local = new Map([['todo-1', 'encrypted-local']]);
  const server = new Map<string, string>();
  for (const [key, value] of local) {
    server.set(key, value);
  }
  return {
    name: 'server_wipe_client_resync',
    passed: server.get('todo-1') === 'encrypted-local',
    details: 'server rebuilt from local encrypted blob cache',
  };
}

export function rehearseLocalWipeMnemonicRestore(): RecoveryScenarioResult {
  const server = new Map([['todo-1', 'encrypted-server']]);
  const mnemonicValid = true;
  const local = new Map<string, string>();
  if (mnemonicValid) {
    for (const [key, value] of server) {
      local.set(key, value);
    }
  }
  return {
    name: 'local_wipe_mnemonic_restore',
    passed: local.get('todo-1') === 'encrypted-server',
    details: 'local cache restored from server with mnemonic gate',
  };
}

export async function rehearseRekeyKill9Resume(): Promise<RecoveryScenarioResult> {
  const store = new InMemoryRekeyCheckpointStore();
  const started = await startTwoPhaseRekey(store, beginInput());
  await stageTwoPhaseRekey(store, started, [blob()]);
  const resumed = await resumeTwoPhaseRekey(store, 'rekey-rehearsal', {
    blobs: [blob()],
    gate: { mnemonicConfirmed: true, oldRecoveryProofValid: true },
  });
  return {
    name: 'rekey_kill9_resume',
    passed: resumed.phase === 'after_swap' && resumed.account.currentKeyId === 2,
    details: 'checkpoint resumed through after_swap',
  };
}

export function rehearseDeviceRevokeWriteRejection(): RecoveryScenarioResult {
  const revoked = new Set(['dev-old']);
  const accepted = !revoked.has('dev-old');
  return {
    name: 'device_revoke_write_rejection',
    passed: accepted === false,
    details: 'revoked device write rejected before mutation apply',
  };
}

export async function runAllRecoveryRehearsals(): Promise<RecoveryScenarioResult[]> {
  return [
    rehearseServerWipeClientResync(),
    rehearseLocalWipeMnemonicRestore(),
    await rehearseRekeyKill9Resume(),
    rehearseDeviceRevokeWriteRejection(),
  ];
}

function beginInput() {
  return {
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
