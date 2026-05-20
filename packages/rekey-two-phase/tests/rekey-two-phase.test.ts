import { describe, expect, it } from 'vitest';

import {
  InMemoryRekeyCheckpointStore,
  completeTwoPhaseRekey,
  resumeTwoPhaseRekey,
  stageTwoPhaseRekey,
  startTwoPhaseRekey,
} from '../src';

describe('rekey two-phase checkpoints', () => {
  it('resumes from a kill-9 checkpoint and completes the swap', async () => {
    const store = new InMemoryRekeyCheckpointStore();
    const started = await startTwoPhaseRekey(store, beginInput('rekey-a'));
    await stageTwoPhaseRekey(store, started, [blob('todo-1')]);

    const completed = await resumeTwoPhaseRekey(store, 'rekey-a', {
      blobs: [blob('todo-1')],
      gate: { mnemonicConfirmed: true, oldRecoveryProofValid: true },
    });

    expect(completed.phase).toBe('after_swap');
    expect(completed.account.currentKeyId).toBe(2);
    expect(completed.session.swapped).toBe(true);
  });

  it('leaves quarantine in place when proof gate fails', async () => {
    const store = new InMemoryRekeyCheckpointStore();
    const started = await startTwoPhaseRekey(store, beginInput('rekey-b'));
    const staged = await stageTwoPhaseRekey(store, started, [blob('todo-1')]);

    await expect(
      completeTwoPhaseRekey(store, staged, { mnemonicConfirmed: false, oldRecoveryProofValid: true }),
    ).rejects.toThrow(/E3028/);
    await expect(store.load('rekey-b')).resolves.toMatchObject({ phase: 'before_swap' });
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
    devices: [{ deviceId: 'dev-a', devicePub: new Uint8Array(32).fill(3), status: 'active' as const }],
    nowMs: () => 1,
  };
}

function blob(entityId: string) {
  return {
    entityType: 'todos',
    entityId,
    revision: 1n,
    deletedFlag: 0,
    schemaVersion: 1,
    sourceMutationId: `mut-${entityId}`,
  };
}
