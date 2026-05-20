import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  InMemoryRekeyCheckpointStore,
  completeTwoPhaseRekey,
  stageTwoPhaseRekey,
  startTwoPhaseRekey,
} from '../../../../packages/rekey-two-phase/src';
import { processPushBatch, type ConflictShadowInput, type PushDatabase, type PushRecordResult, type StoredBlob } from '../functions/sync-push/handler';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');
const accountId = 'acct-rekey';
const deviceId = 'dev-rekey';

describe('rekey two-phase server primitives mock', () => {
  it('quarantines old key and rejects old-key push with E3033', async () => {
    const store = new InMemoryRekeyCheckpointStore();
    const started = await startTwoPhaseRekey(store, beginInput('rekey-a'));

    expect(started.account.keyQuarantineAt).not.toBeNull();
    const response = await processPushBatch(pushDb({ currentDekKeyId: 1, keyQuarantineAt: 'now' }), {
      accountId,
      records: [record({ entityId: 'blocked-by-handler', mutationId: 'mut-rekey-e3033' })],
    });
    expect(response.results[0]).toMatchObject({ status: 'error', errorCode: 'E3033' });
  });

  it('keeps quarantine on failed proof gates and atomically swaps staged blobs', async () => {
    const store = new InMemoryRekeyCheckpointStore();
    const started = await startTwoPhaseRekey(store, beginInput('rekey-b'));
    const staged = await stageTwoPhaseRekey(store, started, [blob('todo-1')]);

    await expect(
      completeTwoPhaseRekey(store, staged, { mnemonicConfirmed: false, oldRecoveryProofValid: true }),
    ).rejects.toThrow(/E3028/);
    await expect(store.load('rekey-b')).resolves.toMatchObject({ phase: 'before_swap' });

    const completed = await completeTwoPhaseRekey(store, staged, {
      mnemonicConfirmed: true,
      oldRecoveryProofValid: true,
    });
    expect(completed.account.currentKeyId).toBe(2);
    expect(completed.account.keyQuarantineAt).toBeNull();
    expect(completed.session.swapped).toBe(true);
  });

  it('keeps rekey SQL migration parseable for local review', () => {
    const sql = readFileSync(path.join(migrationsDir, '20260519000010_rekey_two_phase.sql'), 'utf8');

    expect(sql).toContain('fn_start_rekey');
    expect(sql).toContain('fn_complete_rekey_swap');
    expect(sql).not.toContain('TODO');
  });
});

function beginInput(sessionId: string) {
  return {
    account: {
      currentKeyId: 1,
      keyQuarantineAt: null,
      recoverySigningPub: new Uint8Array(32).fill(1),
      keyring: [{ keyId: 1, status: 'active' as const }],
    },
    trigger: 'device_revocation' as const,
    sessionId,
    newMnemonic: 'new '.repeat(24).trim(),
    newRecoverySigningPub: new Uint8Array(32).fill(2),
    devices: [{ deviceId, devicePub: new Uint8Array(32).fill(3), status: 'active' as const }],
    nowMs: () => 1,
  };
}

function blob(entityId: string) {
  return {
    entityType: 'todos',
    entityId,
    revision: 7n,
    deletedFlag: 0,
    schemaVersion: 1,
    sourceMutationId: `mut-${entityId}`,
  };
}

function pushDb(quarantine: { currentDekKeyId: number; keyQuarantineAt: string | null }): PushDatabase & { nextCommitSeq: bigint } {
  const dedup = new Map<string, PushRecordResult>();
  const blobs = new Map<string, StoredBlob>();
  const conflictShadow: ConflictShadowInput[] = [];
  return {
    nextCommitSeq: 1n,
    async transaction(fn) {
      return fn();
    },
    async getKeyQuarantine() {
      return quarantine;
    },
    async getMutationDedup(_accountId, mutationId) {
      return dedup.get(mutationId);
    },
    async putMutationDedup(_accountId, mutationId, result) {
      dedup.set(mutationId, result);
    },
    async getCurrentBlob(_accountId, entityType, entityId) {
      return blobs.get(`${entityType}:${entityId}`);
    },
    async upsertBlob(blobInput) {
      blobs.set(`${blobInput.entityType}:${blobInput.entityId}`, blobInput);
    },
    async insertConflictShadow(input) {
      conflictShadow.push(input);
    },
    async allocCommitSeq() {
      const seq = this.nextCommitSeq;
      this.nextCommitSeq += 1n;
      return seq;
    },
  };
}

function record(overrides: Partial<{ entityId: string; mutationId: string }> = {}) {
  return {
    entityType: 'todos',
    entityId: 'todo-new',
    mutationId: 'mut-1',
    baseRevision: null,
    proposedRevision: '1',
    clientUpdatedAtMs: 1,
    originatorDeviceId: deviceId,
    envelope: envelope(1),
    ...overrides,
  };
}

function envelope(keyId: number): number[] {
  return [
    1,
    1,
    ...u32Le(keyId),
    ...u64Le(6001n),
    ...u32Le(1),
    ...Array.from({ length: 20 }, () => 7),
  ];
}

function u32Le(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
}

function u64Le(value: bigint): number[] {
  const out: number[] = [];
  let next = value;
  for (let index = 0; index < 8; index += 1) {
    out.push(Number(next & 0xffn));
    next >>= 8n;
  }
  return out;
}
