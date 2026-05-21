import {
  RECOVERY_PROOF_ERROR,
  type RecoveryMessage,
  type RecoveryProofVerifier,
  encodeRecoveryMessage,
  recoveryPayloadHash,
} from '../recovery-proof/handler';

export interface BackfillAcknowledgementRequest {
  accountId: string;
  challengeId: string;
  message: RecoveryMessage;
  signature: number[];
}

export interface BackfillAcknowledgementDatabase {
  getRecoverySigningPub(accountId: string): Promise<number[]>;
  setBackfillAcknowledged(accountId: string): Promise<void>;
}

export interface BackfillAcknowledgementDeps {
  db: BackfillAcknowledgementDatabase;
  verifier: RecoveryProofVerifier;
}

const BACKFILL_ACK_PAYLOAD = {
  mnemonicAcknowledged: true,
  secretKeyAcknowledged: true,
} as const;

export async function acknowledgeOnboardingBackfill(
  deps: BackfillAcknowledgementDeps,
  request: BackfillAcknowledgementRequest,
): Promise<{ status: 'ok' }> {
  if (
    request.message.msgV !== 1 ||
    request.message.accountId !== request.accountId ||
    request.message.challengeId !== request.challengeId
  ) {
    throw recoveryProofFailed();
  }

  const expectedHash = await recoveryPayloadHash(BACKFILL_ACK_PAYLOAD);
  if (!sameBytes(expectedHash, request.message.payloadCanonicalHash)) {
    throw recoveryProofFailed();
  }

  const publicKey = await deps.db.getRecoverySigningPub(request.accountId);
  const ok = await deps.verifier.verify({
    publicKey,
    message: encodeRecoveryMessage(request.message),
    signature: request.signature,
  });
  if (!ok) {
    throw recoveryProofFailed();
  }

  await deps.db.setBackfillAcknowledged(request.accountId);
  return { status: 'ok' };
}

export function onboardingBackfillAckPayload() {
  return BACKFILL_ACK_PAYLOAD;
}

function sameBytes(left: number[], right: number[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index]! ^ right[index]!;
  }
  return diff === 0;
}

function recoveryProofFailed(): Error {
  return new Error(`${RECOVERY_PROOF_ERROR}: onboarding backfill proof failed`);
}
