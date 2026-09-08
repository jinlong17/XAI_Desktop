import { describe, expect, it } from 'vitest';

import {
  assertRecoverySignature,
  generateRecoverySigningKeypair,
  signRecoveryTranscript,
  verifyRecoveryTranscript,
} from '../src';

describe('ed25519 recovery signing', () => {
  it('signs and strictly verifies recovery transcripts', () => {
    const keypair = generateRecoverySigningKeypair();
    const transcript = new TextEncoder().encode('canonical recovery transcript');
    const signature = signRecoveryTranscript({ privateKeyPkcs8: keypair.privateKeyPkcs8, transcript });

    expect(verifyRecoveryTranscript({ publicKeySpki: keypair.publicKeySpki, transcript, signature })).toBe(true);
    expect(
      verifyRecoveryTranscript({
        publicKeySpki: keypair.publicKeySpki,
        transcript: new TextEncoder().encode('tampered'),
        signature,
      }),
    ).toBe(false);
    expect(() =>
      assertRecoverySignature({
        publicKeySpki: keypair.publicKeySpki,
        transcript: new TextEncoder().encode('tampered'),
        signature,
      }),
    ).toThrow(/E3014/);
  });
});
