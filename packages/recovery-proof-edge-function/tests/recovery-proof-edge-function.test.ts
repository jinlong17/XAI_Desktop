import { describe, expect, it } from 'vitest';

import { generateRecoverySigningKeypair, signRecoveryTranscript } from '../../ed25519-recovery-signing/src';

import { InMemoryRecoveryProofEdgeFunction } from '../src';

describe('recovery proof edge function mock', () => {
  it('accepts a valid proof once and rejects replay', () => {
    const keypair = generateRecoverySigningKeypair();
    const transcript = new TextEncoder().encode('challenge:acct');
    const signature = signRecoveryTranscript({ privateKeyPkcs8: keypair.privateKeyPkcs8, transcript });
    const edge = new InMemoryRecoveryProofEdgeFunction();
    edge.registerAccount('acct', keypair.publicKeySpki);

    expect(edge.verify({ accountId: 'acct', challengeId: 'challenge-1', transcript, signature })).toEqual({ status: 'ok' });
    expect(() => edge.verify({ accountId: 'acct', challengeId: 'challenge-1', transcript, signature })).toThrow(/E3014/);
  });
});
