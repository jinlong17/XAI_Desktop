export const REKEY_PROOF_ERROR = 'E3028';
export const KEY_QUARANTINED_ERROR = 'E3033';

export type RekeyTrigger = 'user' | 'device_revocation';
export type RekeyCrashPoint = 'init' | 'staging_30' | 'staging_70' | 'before_swap' | 'after_swap';

export interface RekeyKeyringEntry {
  keyId: number;
  status: 'active' | 'staging' | 'retired';
}

export interface RekeyAccountState {
  currentKeyId: number;
  keyQuarantineAt: number | null;
  keyring: RekeyKeyringEntry[];
  recoverySigningPub: Uint8Array;
}

export interface RekeyDeviceGrant {
  deviceId: string;
  devicePub: Uint8Array;
  status: 'active' | 'pending_dek_wrap' | 'revoked';
}

export interface RekeyBlobInput {
  entityType: string;
  entityId: string;
  revision: bigint;
  deletedFlag: number;
  schemaVersion: number;
  sourceMutationId: string;
}

export interface RekeyStagedBlob extends RekeyBlobInput {
  rekeySessionId: string;
  newKeyId: number;
  stagingOrder: number;
}

export interface RekeyProofGate {
  mnemonicConfirmed: boolean;
  oldRecoveryProofValid: boolean;
}

export interface RekeySession {
  id: string;
  trigger: RekeyTrigger;
  oldKeyId: number;
  newKeyId: number;
  newMnemonic: string;
  newRecoverySigningPub: Uint8Array;
  activeDeviceIds: string[];
  staged: RekeyStagedBlob[];
  swapped: boolean;
}

export interface BeginRekeyInput {
  account: RekeyAccountState;
  trigger: RekeyTrigger;
  sessionId: string;
  newKeyId?: number;
  newMnemonic: string;
  newRecoverySigningPub: Uint8Array;
  devices: readonly RekeyDeviceGrant[];
  nowMs?: () => number;
}

export function beginRekey(input: BeginRekeyInput): { account: RekeyAccountState; session: RekeySession } {
  const oldKeyId = input.account.currentKeyId;
  const newKeyId = input.newKeyId ?? oldKeyId + 1;
  const nowMs = input.nowMs ?? Date.now;

  if (input.account.keyring.some((entry) => entry.keyId === newKeyId)) {
    throw new Error(`E3005: key_id ${newKeyId} already exists`);
  }

  return {
    account: {
      ...input.account,
      keyQuarantineAt: input.account.keyQuarantineAt ?? nowMs(),
      keyring: [...input.account.keyring, { keyId: newKeyId, status: 'staging' }],
    },
    session: {
      id: input.sessionId,
      trigger: input.trigger,
      oldKeyId,
      newKeyId,
      newMnemonic: input.newMnemonic,
      newRecoverySigningPub: new Uint8Array(input.newRecoverySigningPub),
      activeDeviceIds: input.devices
        .filter((device) => device.status === 'active')
        .map((device) => device.deviceId),
      staged: [],
      swapped: false,
    },
  };
}

export function assertRekeyProofGate(gate: RekeyProofGate): void {
  if (!gate.mnemonicConfirmed || !gate.oldRecoveryProofValid) {
    throw new Error(`${REKEY_PROOF_ERROR}: rekey proof or mnemonic confirmation missing`);
  }
}

export function stageRekeyBlobs(
  session: RekeySession,
  blobs: readonly RekeyBlobInput[],
): RekeySession {
  return {
    ...session,
    staged: blobs.map((blob, index) => ({
      ...blob,
      rekeySessionId: session.id,
      newKeyId: session.newKeyId,
      stagingOrder: index + 1,
    })),
  };
}

export function completeRekeySwap(
  account: RekeyAccountState,
  session: RekeySession,
  gate: RekeyProofGate,
): { account: RekeyAccountState; session: RekeySession } {
  assertRekeyProofGate(gate);
  if (session.staged.length === 0) {
    throw new Error('E3005: cannot swap before staging blobs');
  }

  return {
    account: {
      ...account,
      currentKeyId: session.newKeyId,
      keyQuarantineAt: null,
      recoverySigningPub: new Uint8Array(session.newRecoverySigningPub),
      keyring: account.keyring.map((entry) => {
        if (entry.keyId === session.oldKeyId) {
          return { ...entry, status: 'retired' };
        }
        if (entry.keyId === session.newKeyId) {
          return { ...entry, status: 'active' };
        }
        return entry;
      }),
    },
    session: { ...session, swapped: true },
  };
}

export function assertCanPushWithKey(account: RekeyAccountState, keyId: number): void {
  if (account.keyQuarantineAt !== null && keyId === account.currentKeyId) {
    throw new Error(`${KEY_QUARANTINED_ERROR}: key_quarantined`);
  }
}

export function resumeRekeyAfterCrash(session: RekeySession, point: RekeyCrashPoint): 'retry' | 'continue_after_swap' {
  if (point === 'after_swap' || session.swapped) {
    return 'continue_after_swap';
  }
  return 'retry';
}

export function validateCurrentMnemonic(session: RekeySession, phrase: string): boolean {
  return phrase.trim() === session.newMnemonic.trim();
}
