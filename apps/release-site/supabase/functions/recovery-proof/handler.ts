export const RECOVERY_CHALLENGE_TTL_MS = 5 * 60 * 1000;
export const RECOVERY_PROOF_ERROR = 'E3014';

export interface RecoveryChallenge {
  challengeId: string;
  accountId: string;
  challenge: number[];
  expiresAtMs: number;
  usedAtMs?: number;
}

export interface RecoveryMessage {
  msgV: 1;
  challengeId: string;
  accountId: string;
  payloadCanonicalHash: number[];
  ts: number;
}

export type RecoveryPayloadValue = string | number | boolean | null | number[];
export type RecoveryPayload = Record<string, RecoveryPayloadValue>;

export interface RecoveryPatchRequest {
  accountId: string;
  challengeId: string;
  message: RecoveryMessage;
  signature: number[];
  newPayload: RecoveryPayload;
}

export interface RecoveryProofDatabase {
  createChallenge(challenge: RecoveryChallenge): Promise<void>;
  getChallenge(challengeId: string): Promise<RecoveryChallenge | undefined>;
  markChallengeUsed(challengeId: string, usedAtMs: number): Promise<void>;
  getRecoverySigningPub(accountId: string): Promise<number[]>;
  updateAccount(accountId: string, payload: RecoveryPayload): Promise<void>;
}

export interface RecoveryProofVerifier {
  verify(input: {
    publicKey: number[];
    message: Uint8Array;
    signature: number[];
  }): Promise<boolean>;
}

export interface IssueRecoveryChallengeDeps {
  db: RecoveryProofDatabase;
  nowMs?: () => number;
  randomBytes?: (length: number) => Uint8Array;
  randomId?: () => string;
}

export interface VerifyRecoveryPatchDeps {
  db: RecoveryProofDatabase;
  verifier: RecoveryProofVerifier;
  nowMs?: () => number;
}

const RECOVERY_PAYLOAD_ALLOWLIST = new Set([
  'encryptedDisplayName',
  'kekSalt',
  'kekKdfVersion',
  'secretKeyCheck',
  'dekCheck',
  'recoverySigningPub',
  'mnemonicAcknowledged',
  'secretKeyAcknowledged',
  'mfaEnabled',
]);

export async function issueRecoveryChallenge(
  deps: IssueRecoveryChallengeDeps,
  accountId: string,
): Promise<RecoveryChallenge> {
  const nowMs = deps.nowMs?.() ?? Date.now();
  const challenge: RecoveryChallenge = {
    challengeId: deps.randomId?.() ?? createChallengeId(),
    accountId,
    challenge: Array.from((deps.randomBytes ?? defaultRandomBytes)(32)),
    expiresAtMs: nowMs + RECOVERY_CHALLENGE_TTL_MS,
  };
  if (challenge.challenge.length !== 32) {
    throw new Error('E3005: recovery challenge must be 32 bytes');
  }
  await deps.db.createChallenge(challenge);
  return challenge;
}

export async function verifyRecoveryPatch(
  deps: VerifyRecoveryPatchDeps,
  request: RecoveryPatchRequest,
): Promise<{ status: 'ok' }> {
  const nowMs = deps.nowMs?.() ?? Date.now();
  const challenge = await deps.db.getChallenge(request.challengeId);
  if (
    !challenge ||
    challenge.usedAtMs !== undefined ||
    challenge.expiresAtMs < nowMs ||
    challenge.accountId !== request.accountId
  ) {
    throw recoveryProofFailed();
  }

  if (
    request.message.msgV !== 1 ||
    request.message.challengeId !== request.challengeId ||
    request.message.accountId !== request.accountId
  ) {
    throw recoveryProofFailed();
  }

  assertPayloadAllowlist(request.newPayload);
  const payloadHash = await sha256(encodeCanonicalCbor(request.newPayload));
  if (!bytesEqual(payloadHash, request.message.payloadCanonicalHash)) {
    throw recoveryProofFailed();
  }

  const messageCbor = encodeRecoveryMessage(request.message);
  const recoverySigningPub = await deps.db.getRecoverySigningPub(request.accountId);
  const ok = await deps.verifier.verify({
    publicKey: recoverySigningPub,
    message: messageCbor,
    signature: request.signature,
  });
  if (!ok) {
    throw recoveryProofFailed();
  }

  await deps.db.markChallengeUsed(request.challengeId, nowMs);
  await deps.db.updateAccount(request.accountId, request.newPayload);
  return { status: 'ok' };
}

export function encodeRecoveryMessage(message: RecoveryMessage): Uint8Array {
  return encodeCanonicalCbor(
    new Map<number, unknown>([
      [1, message.msgV],
      [2, message.challengeId],
      [3, message.accountId],
      [4, new Uint8Array(message.payloadCanonicalHash)],
      [5, message.ts],
    ]),
  );
}

export async function recoveryPayloadHash(payload: RecoveryPayload): Promise<number[]> {
  assertPayloadAllowlist(payload);
  return Array.from(await sha256(encodeCanonicalCbor(payload)));
}

export function encodeCanonicalCbor(value: unknown): Uint8Array {
  const out: number[] = [];
  writeCbor(value, out);
  return new Uint8Array(out);
}

function assertPayloadAllowlist(payload: RecoveryPayload): void {
  for (const key of Object.keys(payload)) {
    if (!RECOVERY_PAYLOAD_ALLOWLIST.has(key)) {
      throw recoveryProofFailed();
    }
  }
}

function recoveryProofFailed(): Error {
  return new Error(`${RECOVERY_PROOF_ERROR}: recovery proof signature failed`);
}

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const input = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', input);
  return new Uint8Array(digest);
}

function defaultRandomBytes(length: number): Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

function createChallengeId(): string {
  return Array.from(defaultRandomBytes(16))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function bytesEqual(left: Uint8Array | number[], right: Uint8Array | number[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index]! ^ right[index]!;
  }
  return diff === 0;
}

function writeCbor(value: unknown, out: number[]): void {
  if (value === null) {
    out.push(0xf6);
    return;
  }
  if (typeof value === 'boolean') {
    out.push(value ? 0xf5 : 0xf4);
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error('E3005: canonical CBOR only supports non-negative safe integers here');
    }
    writeUint(0, value, out);
    return;
  }
  if (typeof value === 'string') {
    const bytes = new TextEncoder().encode(value);
    writeUint(3, bytes.length, out);
    out.push(...bytes);
    return;
  }
  if (value instanceof Uint8Array) {
    writeUint(2, value.length, out);
    out.push(...value);
    return;
  }
  if (Array.isArray(value) && value.every((item) => typeof item === 'number')) {
    const bytes = new Uint8Array(value);
    writeUint(2, bytes.length, out);
    out.push(...bytes);
    return;
  }
  if (value instanceof Map) {
    writeMap([...value.entries()], out);
    return;
  }
  if (typeof value === 'object' && value !== null) {
    writeMap(Object.entries(value), out);
    return;
  }
  throw new Error('E3005: unsupported canonical CBOR value');
}

function writeMap(entries: Array<[unknown, unknown]>, out: number[]): void {
  const encoded = entries.map(([key, value]) => ({
    key: encodeCanonicalCbor(key),
    value: encodeCanonicalCbor(value),
  }));
  encoded.sort((left, right) => compareBytes(left.key, right.key));
  writeUint(5, encoded.length, out);
  for (const entry of encoded) {
    out.push(...entry.key, ...entry.value);
  }
}

function compareBytes(left: Uint8Array, right: Uint8Array): number {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const diff = left[index]! - right[index]!;
    if (diff !== 0) {
      return diff;
    }
  }
  return left.length - right.length;
}

function writeUint(major: number, value: number, out: number[]): void {
  const prefix = major << 5;
  if (value < 24) {
    out.push(prefix | value);
  } else if (value <= 0xff) {
    out.push(prefix | 24, value);
  } else if (value <= 0xffff) {
    out.push(prefix | 25, (value >> 8) & 0xff, value & 0xff);
  } else if (value <= 0xffff_ffff) {
    out.push(prefix | 26, (value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
  } else {
    const bigint = BigInt(value);
    out.push(prefix | 27);
    for (let shift = 56n; shift >= 0n; shift -= 8n) {
      out.push(Number((bigint >> shift) & 0xffn));
    }
  }
}
