import { describe, expect, it } from 'vitest';

import {
  assertCanPushWithKey,
  beginRekey,
  completeRekeySwap,
  resumeRekeyAfterCrash,
  stageRekeyBlobs,
  validateCurrentMnemonic,
  type RekeyAccountState,
  type RekeyBlobInput,
  type RekeyCrashPoint,
} from '../src';

const oldMnemonic = 'old '.repeat(24).trim();
const newMnemonic = 'new '.repeat(24).trim();

describe('two-phase rekey orchestration', () => {
  it('starts staging and quarantines the old active key immediately', () => {
    const { account, session } = beginRekey({
      accountId: 'account-1',
      account: accountState(),
      trigger: 'device_revocation',
      sessionId: 'rekey-1',
      newMnemonic,
      newRecoverySigningPub: bytes(2, 32),
      devices: [
        { deviceId: 'active-a', devicePub: bytes(10, 32), status: 'active' },
        { deviceId: 'revoked-a', devicePub: bytes(11, 32), status: 'revoked' },
      ],
      nowMs: () => 123,
    });

    expect(account.keyQuarantineAt).toBe(123);
    expect(account.keyring).toContainEqual({ keyId: 2, status: 'staging' });
    expect(session.activeDeviceIds).toEqual(['active-a']);
    expect(() => assertCanPushWithKey(account, 1)).toThrow(/E3033/);
  });

  it('preserves entity revision while staging blobs under the new key', () => {
    const started = beginRekey({
      accountId: 'account-1',
      account: accountState(),
      trigger: 'user',
      sessionId: 'rekey-2',
      newMnemonic,
      newRecoverySigningPub: bytes(3, 32),
      devices: [],
      nowMs: () => 1,
    });
    const staged = stageRekeyBlobs(started.session, [blob('todo-1', 7n), blob('todo-2', 3n)]);

    expect(staged.staged.map((item) => [item.entityId, item.revision, item.newKeyId, item.stagingOrder])).toEqual([
      ['todo-1', 7n, 2, 1],
      ['todo-2', 3n, 2, 2],
    ]);
  });

  it('requires mnemonic confirmation and old recovery proof before swap', () => {
    const started = beginRekey({
      accountId: 'account-1',
      account: accountState(),
      trigger: 'user',
      sessionId: 'rekey-3',
      newMnemonic,
      newRecoverySigningPub: bytes(4, 32),
      devices: [],
      nowMs: () => 1,
    });
    const session = stageRekeyBlobs(started.session, [blob('todo-1', 1n)]);

    expect(() =>
      completeRekeySwap(started.account, session, {
        mnemonicConfirmed: false,
        oldRecoveryProofValid: true,
      }),
    ).toThrow(/E3028/);
    expect(() =>
      completeRekeySwap(started.account, session, {
        mnemonicConfirmed: true,
        oldRecoveryProofValid: false,
      }),
    ).toThrow(/E3028/);
  });

  it('atomically retires old key, activates new key, clears quarantine, and rotates mnemonic', () => {
    const started = beginRekey({
      accountId: 'account-1',
      account: accountState(),
      trigger: 'user',
      sessionId: 'rekey-4',
      newMnemonic,
      newRecoverySigningPub: bytes(5, 32),
      devices: [],
      nowMs: () => 1,
    });
    const session = stageRekeyBlobs(started.session, [blob('todo-1', 1n)]);

    const completed = completeRekeySwap(started.account, session, {
      mnemonicConfirmed: true,
      oldRecoveryProofValid: true,
    });

    expect(completed.account.currentKeyId).toBe(2);
    expect(completed.account.keyQuarantineAt).toBeNull();
    expect(completed.account.keyring).toContainEqual({ keyId: 1, status: 'retired' });
    expect(completed.account.keyring).toContainEqual({ keyId: 2, status: 'active' });
    expect(validateCurrentMnemonic(completed.session, oldMnemonic)).toBe(false);
    expect(validateCurrentMnemonic(completed.session, newMnemonic)).toBe(true);
  });

  it.each<RekeyCrashPoint>(['init', 'staging_30', 'staging_70', 'before_swap'])(
    'retries after kill -9 at %s',
    (point) => {
      const started = beginRekey({
        accountId: 'account-1',
        account: accountState(),
        trigger: 'user',
        sessionId: 'rekey-5',
        newMnemonic,
        newRecoverySigningPub: bytes(6, 32),
        devices: [],
        nowMs: () => 1,
      });

      expect(resumeRekeyAfterCrash(started.session, point)).toBe('retry');
    },
  );

  it('continues dual-read path after kill -9 post-swap', () => {
    const started = beginRekey({
      accountId: 'account-1',
      account: accountState(),
      trigger: 'user',
      sessionId: 'rekey-6',
      newMnemonic,
      newRecoverySigningPub: bytes(7, 32),
      devices: [],
      nowMs: () => 1,
    });
    const session = stageRekeyBlobs(started.session, [blob('todo-1', 1n)]);
    const completed = completeRekeySwap(started.account, session, {
      mnemonicConfirmed: true,
      oldRecoveryProofValid: true,
    });

    expect(resumeRekeyAfterCrash(completed.session, 'after_swap')).toBe('continue_after_swap');
  });

  it('completeRekeySwap returns cleanup plan with old DEK wraps for all active devices', () => {
    const started = beginRekey({
      accountId: 'account-cleanup',
      account: accountState(),
      trigger: 'device_revocation',
      sessionId: 'rekey-7',
      newMnemonic,
      newRecoverySigningPub: bytes(8, 32),
      devices: [
        { deviceId: 'active-a', devicePub: bytes(12, 32), status: 'active' },
        { deviceId: 'active-b', devicePub: bytes(13, 32), status: 'active' },
        { deviceId: 'revoked-a', devicePub: bytes(14, 32), status: 'revoked' },
      ],
      nowMs: () => 1,
    });
    const session = stageRekeyBlobs(started.session, [blob('todo-1', 1n)]);

    const completed = completeRekeySwap(started.account, session, {
      mnemonicConfirmed: true,
      oldRecoveryProofValid: true,
    });

    expect(completed.cleanup).toEqual({
      oldKeyId: 1,
      deviceDekWrapsToDelete: [
        { accountId: 'account-cleanup', keyId: 1 },
        { accountId: 'account-cleanup', keyId: 1 },
      ],
      keyMaterialZeroized: false,
    });
  });

  it('completeRekeySwap zeroizes materialBuffer when present', () => {
    const materialBuffer = new Uint8Array([9, 8, 7, 6]);
    const started = beginRekey({
      accountId: 'account-zeroize',
      account: {
        ...accountState(),
        keyring: [{ keyId: 1, status: 'active', materialBuffer }],
      },
      trigger: 'user',
      sessionId: 'rekey-8',
      newMnemonic,
      newRecoverySigningPub: bytes(9, 32),
      devices: [],
      nowMs: () => 1,
    });
    const session = stageRekeyBlobs(started.session, [blob('todo-1', 1n)]);

    const completed = completeRekeySwap(started.account, session, {
      mnemonicConfirmed: true,
      oldRecoveryProofValid: true,
    });

    expect([...materialBuffer]).toEqual([0, 0, 0, 0]);
    expect(completed.cleanup.keyMaterialZeroized).toBe(true);
  });
});

function accountState(): RekeyAccountState {
  return {
    currentKeyId: 1,
    keyQuarantineAt: null,
    recoverySigningPub: bytes(1, 32),
    keyring: [{ keyId: 1, status: 'active' }],
  };
}

function blob(entityId: string, revision: bigint): RekeyBlobInput {
  return {
    entityType: 'todos',
    entityId,
    revision,
    deletedFlag: 0,
    schemaVersion: 1,
    sourceMutationId: `mutation-${entityId}`,
  };
}

function bytes(value: number, length: number): Uint8Array {
  return new Uint8Array(Array.from({ length }, () => value));
}
