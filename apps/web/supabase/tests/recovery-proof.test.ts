import { describe, expect, it, vi } from 'vitest';

import {
  encodeRecoveryMessage,
  issueRecoveryChallenge,
  recoveryPayloadHash,
  verifyRecoveryPatch,
  type RecoveryChallenge,
  type RecoveryPayload,
  type RecoveryProofDatabase,
} from '../functions/recovery-proof/handler';

describe('recovery proof Edge Function core', () => {
  it('issues a 32 byte challenge with five minute TTL', async () => {
    const db = createRecoveryDb();
    const challenge = await issueRecoveryChallenge(
      {
        db,
        nowMs: () => 1000,
        randomId: () => 'challenge-1',
        randomBytes: (length) => new Uint8Array(Array.from({ length }, (_, index) => index)),
      },
      'account-1',
    );

    expect(challenge).toMatchObject({
      challengeId: 'challenge-1',
      accountId: 'account-1',
      expiresAtMs: 301000,
    });
    expect(challenge.challenge).toHaveLength(32);
  });

  it('verifies payload hash, signature seam, and marks challenge single-use', async () => {
    const db = createRecoveryDb();
    await db.createChallenge({
      challengeId: 'challenge-1',
      accountId: 'account-1',
      challenge: Array.from({ length: 32 }, () => 1),
      expiresAtMs: 10_000,
    });
    const payload: RecoveryPayload = {
      kekSalt: [1, 2, 3],
      secretKeyCheck: [4, 5, 6],
      recoverySigningPub: [7, 8, 9],
    };
    const message = {
      msgV: 1 as const,
      challengeId: 'challenge-1',
      accountId: 'account-1',
      payloadCanonicalHash: await recoveryPayloadHash(payload),
      ts: 1000,
    };
    const expectedMessage = encodeRecoveryMessage(message);
    const verifier = {
      verify: vi.fn(async ({ publicKey, message: signedMessage, signature }) => {
        expect(publicKey).toEqual([9, 9, 9]);
        expect(Array.from(signedMessage)).toEqual(Array.from(expectedMessage));
        expect(signature).toEqual([1, 1, 1]);
        return true;
      }),
    };

    await expect(
      verifyRecoveryPatch(
        { db, verifier, nowMs: () => 2000 },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1, 1, 1],
          newPayload: payload,
        },
      ),
    ).resolves.toEqual({ status: 'ok' });

    expect(db.updatedPayload).toEqual(payload);
    await expect(
      verifyRecoveryPatch(
        { db, verifier, nowMs: () => 2001 },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1, 1, 1],
          newPayload: payload,
        },
      ),
    ).rejects.toThrow('E3014');
  });

  it('rejects tampered payload hash, disallowed fields, expired challenge, and bad signature', async () => {
    const payload: RecoveryPayload = { kekSalt: [1] };
    const message = {
      msgV: 1 as const,
      challengeId: 'challenge-1',
      accountId: 'account-1',
      payloadCanonicalHash: await recoveryPayloadHash(payload),
      ts: 1000,
    };

    await expect(
      verifyRecoveryPatch(
        { db: createRecoveryDb(challenge({ expiresAtMs: 10_000 })), verifier: okVerifier(), nowMs: () => 1000 },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1],
          newPayload: { kekSalt: [2] },
        },
      ),
    ).rejects.toThrow('E3014');

    await expect(
      verifyRecoveryPatch(
        { db: createRecoveryDb(challenge({ expiresAtMs: 10_000 })), verifier: okVerifier(), nowMs: () => 1000 },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1],
          newPayload: { forbidden: [1] },
        },
      ),
    ).rejects.toThrow('E3014');

    await expect(
      verifyRecoveryPatch(
        { db: createRecoveryDb(challenge({ expiresAtMs: 999 })), verifier: okVerifier(), nowMs: () => 1000 },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1],
          newPayload: payload,
        },
      ),
    ).rejects.toThrow('E3014');

    await expect(
      verifyRecoveryPatch(
        { db: createRecoveryDb(challenge({ expiresAtMs: 10_000 })), verifier: { verify: vi.fn(async () => false) }, nowMs: () => 1000 },
        {
          accountId: 'account-1',
          challengeId: 'challenge-1',
          message,
          signature: [1],
          newPayload: payload,
        },
      ),
    ).rejects.toThrow('E3014');
  });
});

function challenge(overrides: Partial<RecoveryChallenge> = {}): RecoveryChallenge {
  return {
    challengeId: 'challenge-1',
    accountId: 'account-1',
    challenge: Array.from({ length: 32 }, () => 1),
    expiresAtMs: 10_000,
    ...overrides,
  };
}

function okVerifier() {
  return { verify: vi.fn(async () => true) };
}

function createRecoveryDb(initial?: RecoveryChallenge) {
  const challenges = new Map<string, RecoveryChallenge>();
  if (initial) {
    challenges.set(initial.challengeId, initial);
  }
  const db: RecoveryProofDatabase & { updatedPayload?: RecoveryPayload } = {
    async createChallenge(next) {
      challenges.set(next.challengeId, next);
    },
    async getChallenge(challengeId) {
      return challenges.get(challengeId);
    },
    async markChallengeUsed(challengeId, usedAtMs) {
      const current = challenges.get(challengeId);
      if (current) {
        challenges.set(challengeId, { ...current, usedAtMs });
      }
    },
    async getRecoverySigningPub() {
      return [9, 9, 9];
    },
    async updateAccount(_accountId, payload) {
      db.updatedPayload = payload;
    },
  };
  return db;
}
