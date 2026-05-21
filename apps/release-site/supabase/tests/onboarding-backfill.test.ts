import { describe, expect, it, vi } from 'vitest';

import {
  acknowledgeOnboardingBackfill,
  onboardingBackfillAckPayload,
  type BackfillAcknowledgementDatabase,
} from '../functions/onboarding-backfill/handler';
import {
  encodeRecoveryMessage,
  recoveryPayloadHash,
  type RecoveryMessage,
} from '../functions/recovery-proof/handler';

describe('onboarding backfill Edge Function core', () => {
  it('sets acknowledgement only after a valid Ed25519 proof seam', async () => {
    const db = createDb();
    const message = await ackMessage();
    const expectedMessage = encodeRecoveryMessage(message);
    const verifier = {
      verify: vi.fn(async ({ publicKey, message: signedMessage, signature }) => {
        expect(publicKey).toEqual([7, 7, 7]);
        expect(Array.from(signedMessage)).toEqual(Array.from(expectedMessage));
        expect(signature).toEqual([1, 2, 3]);
        return true;
      }),
    };

    await expect(
      acknowledgeOnboardingBackfill(
        { db, verifier },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1, 2, 3],
        },
      ),
    ).resolves.toEqual({ status: 'ok' });

    expect(db.acknowledgedAccountId).toBe('account-1');
  });

  it('rejects missing proof, mismatched payload hash, and bad signatures', async () => {
    const message = await ackMessage();
    await expect(
      acknowledgeOnboardingBackfill(
        { db: createDb(), verifier: { verify: vi.fn(async () => true) } },
        {
          accountId: 'account-1',
          challengeId: 'challenge-2',
          message,
          signature: [1],
        },
      ),
    ).rejects.toThrow('E3014');

    await expect(
      acknowledgeOnboardingBackfill(
        { db: createDb(), verifier: { verify: vi.fn(async () => true) } },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message: {
            ...message,
            payloadCanonicalHash: await recoveryPayloadHash({ mnemonicAcknowledged: true }),
          },
          signature: [1],
        },
      ),
    ).rejects.toThrow('E3014');

    await expect(
      acknowledgeOnboardingBackfill(
        { db: createDb(), verifier: { verify: vi.fn(async () => false) } },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1],
        },
      ),
    ).rejects.toThrow('E3014');
  });
});

async function ackMessage(): Promise<RecoveryMessage> {
  return {
    msgV: 1,
    accountId: 'account-1',
    challengeId: 'challenge-1',
    payloadCanonicalHash: await recoveryPayloadHash(onboardingBackfillAckPayload()),
    ts: 1000,
  };
}

function createDb() {
  const db: BackfillAcknowledgementDatabase & { acknowledgedAccountId?: string } = {
    async getRecoverySigningPub() {
      return [7, 7, 7];
    },
    async setBackfillAcknowledged(accountId) {
      db.acknowledgedAccountId = accountId;
    },
  };
  return db;
}
