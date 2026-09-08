import { assertRecoverySignature } from '../../ed25519-recovery-signing/src';

export interface RecoveryProofRecord {
  accountId: string;
  challengeId: string;
  transcript: Uint8Array;
  signature: Uint8Array;
}

export class InMemoryRecoveryProofEdgeFunction {
  private readonly publicKeys = new Map<string, Uint8Array>();
  private readonly usedChallenges = new Set<string>();

  registerAccount(accountId: string, publicKeySpki: Uint8Array): void {
    this.publicKeys.set(accountId, new Uint8Array(publicKeySpki));
  }

  verify(record: RecoveryProofRecord): { status: 'ok' } {
    const publicKeySpki = this.publicKeys.get(record.accountId);
    if (!publicKeySpki || this.usedChallenges.has(record.challengeId)) {
      throw new Error('E3014: recovery proof signature failed');
    }
    assertRecoverySignature({
      publicKeySpki,
      transcript: record.transcript,
      signature: record.signature,
    });
    this.usedChallenges.add(record.challengeId);
    return { status: 'ok' };
  }
}
