import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';
import { Buffer } from 'node:buffer';

export const RECOVERY_PROOF_ERROR = 'E3014';

export interface RecoverySigningKeypair {
  privateKeyPkcs8: Uint8Array;
  publicKeySpki: Uint8Array;
}

export function generateRecoverySigningKeypair(): RecoverySigningKeypair {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    privateKeyPkcs8: new Uint8Array(privateKey.export({ format: 'der', type: 'pkcs8' })),
    publicKeySpki: new Uint8Array(publicKey.export({ format: 'der', type: 'spki' })),
  };
}

export function signRecoveryTranscript(input: {
  privateKeyPkcs8: Uint8Array;
  transcript: Uint8Array;
}): Uint8Array {
  const privateKey = createPrivateKey({ key: Buffer.from(input.privateKeyPkcs8), format: 'der', type: 'pkcs8' });
  return new Uint8Array(sign(null, input.transcript, privateKey));
}

export function verifyRecoveryTranscript(input: {
  publicKeySpki: Uint8Array;
  transcript: Uint8Array;
  signature: Uint8Array;
}): boolean {
  const publicKey = createPublicKey({ key: Buffer.from(input.publicKeySpki), format: 'der', type: 'spki' });
  return verify(null, input.transcript, publicKey, input.signature);
}

export function assertRecoverySignature(input: {
  publicKeySpki: Uint8Array;
  transcript: Uint8Array;
  signature: Uint8Array;
}): void {
  if (!verifyRecoveryTranscript(input)) {
    throw new Error(`${RECOVERY_PROOF_ERROR}: recovery proof signature failed`);
  }
}
