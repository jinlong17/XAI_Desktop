import type { AccountScope } from "./accountScope.js";
import { accountPrefix, accountScope, generationKey, generationMarkerKey } from "./accountScope.js";
import { accountLifecycleLockName, browserAccountLock } from "./accountCoordination.js";
import { publishSameTab } from "./sameTabBus.js";

export const CANONICAL_COMMAND_KEYS = [
  "xai_task_cols",
  "xai_calendar_events",
] as const;

export type CanonicalCommandKey = (typeof CANONICAL_COMMAND_KEYS)[number];

export type CanonicalCommandReceipt = Readonly<{
  operationVersion: 1;
  signature: string;
  result: Readonly<{ ok: true; targetId: string }>;
  committedAt: string;
}>;

export type CanonicalCommandEnvelope<T = unknown> = Readonly<{
  format: "xai-command-state";
  version: 1;
  revision: number;
  data: T;
  receipts: Record<string, CanonicalCommandReceipt>;
}>;

export type CanonicalCommandRead<T = unknown> =
  | Readonly<{ status: "absent" }>
  | Readonly<{ status: "legacy"; data: T }>
  | Readonly<{ status: "envelope"; envelope: CanonicalCommandEnvelope<T>; data: T }>
  | Readonly<{ status: "corrupt"; reason: string }>
  | Readonly<{ status: "unsupported"; version: unknown }>
  | Readonly<{ status: "unavailable"; reason: string }>;

const MAX_RECEIPTS = 512;
const MAX_RECEIPT_ID_LENGTH = 512;
const MAX_COMMAND_PART_LENGTH = 192;
const MAX_SIGNATURE_LENGTH = 16_384;
const MAX_CANONICAL_RECORD_LENGTH = 4_000_000;
let commandActivation = false;

export function setCanonicalCommandActivationForTests(enabled: boolean): void {
  commandActivation = enabled;
}

export function isCanonicalCommandActivationEnabled(): boolean {
  return commandActivation;
}

export type CanonicalCommandFailureReason =
  | "activation-disabled"
  | "lock-unavailable"
  | "lock-failed"
  | "invalid"
  | "account-changed"
  | "recovery-required"
  | "missing-data"
  | "request-conflict"
  | "not-found"
  | "capacity"
  | "storage";

export type CanonicalCommitResult =
  | Readonly<{ ok: true; targetId: string; replay: boolean }>
  | Readonly<{ ok: false; reason: CanonicalCommandFailureReason }>;

export type CanonicalCommandMutation<T> =
  | Readonly<{ ok: true; data: T; targetId: string }>
  | Readonly<{ ok: false; reason: "invalid" | "not-found" }>;

export type CanonicalDatasetFailureReason = CanonicalCommandFailureReason | "conflict";
export type CanonicalDatasetResult<T> =
  | Readonly<{ ok: true; data: T; revision: number; changed: boolean }>
  | Readonly<{ ok: false; reason: CanonicalDatasetFailureReason }>;
export type CanonicalDatasetMutation<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; reason: "invalid" | "not-found" | "conflict" }>;
export type CanonicalDatasetInput<T> = Readonly<{
  key: CanonicalCommandKey;
  scope: AccountScope;
  validate: (value: unknown) => value is T;
  /** Used only for a physically absent key. Present invalid bytes are never repaired. */
  initialize?: () => T;
  /** Rejects a whole-snapshot edit if its captured canonical revision is stale. */
  expectedRevision?: number;
  mutate: (data: T) => CanonicalDatasetMutation<T>;
}>;

export type CanonicalCommandInput<T> = Readonly<{
  key: CanonicalCommandKey;
  scope: AccountScope;
  channel: string;
  requestId: string;
  /** Already validated semantic fields. Runtime owner/attempt/time do not belong here. */
  operation: unknown;
  validate: (value: unknown) => value is T;
  /** Used only when the physical record is truly absent. Never repairs null/corrupt data. */
  initialize?: () => T;
  mutate: (data: T) => CanonicalCommandMutation<T>;
}>;

export function canonicalCommandSignature(value: unknown): string | null {
  const visiting = new WeakSet<object>();
  const visit = (entry: unknown): string | null => {
    if (entry === null || typeof entry === "boolean" || typeof entry === "string") return JSON.stringify(entry);
    if (typeof entry === "number") return Number.isFinite(entry) ? JSON.stringify(entry) : null;
    if (typeof entry !== "object" || entry === null || visiting.has(entry)) return null;
    visiting.add(entry);
    let result: string | null = null;
    if (Array.isArray(entry)) {
      const parts: string[] = [];
      for (let index = 0; index < entry.length; index += 1) {
        if (!Object.hasOwn(entry, index)) return null;
        const part = visit(entry[index]);
        if (part === null) return null;
        parts.push(part);
      }
      result = `[${parts.join(",")}]`;
    } else {
      const prototype = Object.getPrototypeOf(entry);
      if ((prototype === Object.prototype || prototype === null) && isRecord(entry)) {
        const keys = Object.keys(entry).sort();
        const parts: string[] = [];
        for (const key of keys) {
          const part = visit(entry[key]);
          if (part === null) { parts.length = 0; result = null; break; }
          parts.push(`${JSON.stringify(key)}:${part}`);
          result = `{${parts.join(",")}}`;
        }
        if (keys.length === 0) result = "{}";
      }
    }
    visiting.delete(entry);
    return result;
  };
  try {
    const signature = visit(value);
    return signature !== null && signature.length <= MAX_SIGNATURE_LENGTH ? signature : null;
  } catch {
    return null;
  }
}

function commandPartIsSafe(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= MAX_COMMAND_PART_LENGTH
    && !/[\u0000-\u001f\u007f]/.test(value);
}

/** Durable receipt identity is the request channel plus request id inside one dataset. */
export function canonicalCommandReceiptId(channel: string, requestId: string): string | null {
  if (!commandPartIsSafe(channel) || !commandPartIsSafe(requestId)) return null;
  const id = JSON.stringify([channel, requestId]);
  return receiptIdIsSafe(id) ? id : null;
}

type DatasetCheck =
  | { ok: true; physicalKey: string }
  | { ok: false; reason: "account-changed" | "recovery-required" | "storage" };

/** Must run after the canonical lock is acquired and again before the sole write. */
function checkCurrentDataset(scope: AccountScope, key: CanonicalCommandKey): DatasetCheck {
  try {
    accountScope.assertCurrent(scope);
  } catch {
    return { ok: false, reason: "account-changed" };
  }
  if ((scope.kind !== "account" && scope.kind !== "demo") || !scope.accountId || !scope.generation) {
    return { ok: false, reason: "account-changed" };
  }
  const demo = scope.kind === "demo";
  let tombstone: string | null;
  let markerRaw: string | null;
  try {
    tombstone = localStorage.getItem(`${accountPrefix(scope.accountId, demo)}deleted`);
    markerRaw = localStorage.getItem(generationMarkerKey(scope.accountId, demo));
  } catch {
    return { ok: false, reason: "storage" };
  }
  if (tombstone !== null) return { ok: false, reason: "account-changed" };
  if (markerRaw === null) return { ok: false, reason: "account-changed" };
  try {
    const marker: unknown = JSON.parse(markerRaw);
    if (!isRecord(marker)
      || typeof marker.generation !== "string"
      || marker.generation.length === 0
      || typeof marker.migrationId !== "string"
      || !Object.hasOwn(marker, "previous")
      || (marker.previous !== null && typeof marker.previous !== "string")) {
      return { ok: false, reason: "recovery-required" };
    }
    if (marker.generation !== scope.generation) return { ok: false, reason: "account-changed" };
  } catch {
    return { ok: false, reason: "recovery-required" };
  }
  return { ok: true, physicalKey: generationKey(scope.accountId, scope.generation, key, demo) };
}

export function canonicalDatasetLockName(scope: AccountScope, key: CanonicalCommandKey): string {
  return `xai:canonical:${scope.kind}:${scope.accountId ?? ""}:${scope.generation ?? ""}:${key}`;
}

function readPhysicalCommandState(physicalKey: string): CanonicalCommandRead {
  let raw: string | null;
  try {
    raw = localStorage.getItem(physicalKey);
  } catch {
    return { status: "unavailable", reason: "storage unavailable" };
  }
  if (raw === null) return { status: "absent" };
  try {
    return readCanonicalCommandState(JSON.parse(raw));
  } catch {
    return { status: "corrupt", reason: "invalid JSON" };
  }
}

function currentLocks(): LockManager | null {
  try { return typeof navigator !== "undefined" && navigator.locks ? navigator.locks : null; } catch { return null; }
}

/**
 * The ordinary human writer for receipt-bearing datasets. It shares the command
 * lock and envelope format, never creates a receipt, and publishes only after
 * the single physical write has committed.
 */
export async function mutateCanonicalDataset<T>(input: CanonicalDatasetInput<T>): Promise<CanonicalDatasetResult<T>> {
  if (!commandActivation) return { ok: false, reason: "activation-disabled" };
  let key: CanonicalCommandKey;
  let scope: AccountScope;
  let validate: (value: unknown) => value is T;
  let initialize: (() => T) | undefined;
  let expectedRevision: number | undefined;
  let mutate: (data: T) => CanonicalDatasetMutation<T>;
  try {
    ({ key, scope, validate, initialize, expectedRevision, mutate } = input);
    if (!isCanonicalCommandKey(key) || !scope || typeof validate !== "function" || typeof mutate !== "function"
      || (initialize !== undefined && typeof initialize !== "function")
      || (expectedRevision !== undefined && (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0))) {
      return { ok: false, reason: "invalid" };
    }
  } catch { return { ok: false, reason: "invalid" }; }
  if ((scope.kind !== "account" && scope.kind !== "demo") || !scope.accountId) return { ok: false, reason: "account-changed" };
  const locks = currentLocks();
  if (!locks) return { ok: false, reason: "lock-unavailable" };
  try {
    return await browserAccountLock(accountLifecycleLockName(scope.accountId, scope.kind === "demo"), "shared", async () => locks.request(canonicalDatasetLockName(scope, key), async (): Promise<CanonicalDatasetResult<T>> => {
      const first = checkCurrentDataset(scope, key);
      if (!first.ok) return first;
      const state = readPhysicalCommandState(first.physicalKey);
      if (state.status === "corrupt" || state.status === "unsupported" || state.status === "unavailable") {
        return { ok: false, reason: state.status === "unavailable" ? "storage" : "recovery-required" };
      }
      let data: T;
      let envelope: CanonicalCommandEnvelope<T> | null = null;
      if (state.status === "absent") {
        if (!initialize) return { ok: false, reason: "missing-data" };
        try { data = initialize(); } catch { return { ok: false, reason: "invalid" }; }
      } else {
        data = state.data as T;
        if (state.status === "envelope") envelope = state.envelope as CanonicalCommandEnvelope<T>;
      }
      try { if (!validate(data)) return { ok: false, reason: state.status === "absent" ? "invalid" : "recovery-required" }; }
      catch { return { ok: false, reason: "recovery-required" }; }
      const revision = envelope?.revision ?? 0;
      if (expectedRevision !== undefined && expectedRevision !== revision) return { ok: false, reason: "conflict" };
      let originalEncoded: string;
      try { originalEncoded = JSON.stringify(data); } catch { return { ok: false, reason: "recovery-required" }; }
      let outcome: CanonicalDatasetMutation<T>;
      try { outcome = mutate(data); } catch { return { ok: false, reason: "invalid" }; }
      if (!outcome || typeof outcome !== "object" || typeof outcome.ok !== "boolean") return { ok: false, reason: "invalid" };
      if (!outcome.ok) return { ok: false, reason: outcome.reason };
      try { if (!validate(outcome.data)) return { ok: false, reason: "invalid" }; }
      catch { return { ok: false, reason: "invalid" }; }
      let outcomeEncoded: string;
      try { outcomeEncoded = JSON.stringify(outcome.data); } catch { return { ok: false, reason: "invalid" }; }
      const changed = originalEncoded !== outcomeEncoded || state.status === "absent";
      if (!changed) {
        const final = checkCurrentDataset(scope, key);
        if (!final.ok) return final;
        if (final.physicalKey !== first.physicalKey) return { ok: false, reason: "account-changed" };
        return { ok: true, data, revision, changed: false };
      }
      if (revision >= Number.MAX_SAFE_INTEGER) return { ok: false, reason: "capacity" };
      const next: CanonicalCommandEnvelope<T> = {
        format: "xai-command-state", version: 1, revision: revision + 1, data: outcome.data,
        receipts: envelope ? copyReceipts(envelope.receipts) : Object.create(null) as Record<string, CanonicalCommandReceipt>,
      };
      let encoded: string;
      try {
        encoded = JSON.stringify(next);
        const decoded = readCanonicalCommandState<T>(JSON.parse(encoded));
        if (decoded.status !== "envelope" || !validate(decoded.data)) return { ok: false, reason: "invalid" };
      } catch { return { ok: false, reason: "invalid" }; }
      if (encoded.length > MAX_CANONICAL_RECORD_LENGTH) return { ok: false, reason: "capacity" };
      const final = checkCurrentDataset(scope, key);
      if (!final.ok) return final;
      if (final.physicalKey !== first.physicalKey) return { ok: false, reason: "account-changed" };
      try { localStorage.setItem(first.physicalKey, encoded); } catch { return { ok: false, reason: "storage" }; }
      publishSameTab(key, outcome.data, scope);
      return { ok: true, data: outcome.data, revision: next.revision, changed: true };
    }));
  } catch (error) {
    return { ok: false, reason: error instanceof Error && error.message.includes("lock unavailable") ? "lock-unavailable" : "lock-failed" };
  }
}

function copyReceipts(receipts: Record<string, CanonicalCommandReceipt>): Record<string, CanonicalCommandReceipt> {
  const copy = Object.create(null) as Record<string, CanonicalCommandReceipt>;
  for (const [id, receipt] of Object.entries(receipts)) {
    Object.defineProperty(copy, id, { value: receipt, enumerable: true, configurable: true, writable: true });
  }
  return copy;
}

/** Single-record durable command primitive. Production activation remains closed until D. */
export async function commitCanonicalCommand<T>(input: CanonicalCommandInput<T>): Promise<CanonicalCommitResult> {
  if (!commandActivation) return { ok: false, reason: "activation-disabled" };
  let key: CanonicalCommandKey;
  let scope: AccountScope;
  let validate: (value: unknown) => value is T;
  let initialize: (() => T) | undefined;
  let mutate: (data: T) => CanonicalCommandMutation<T>;
  let receiptId: string | null;
  let signature: string | null;
  let lockName: string;
  try {
    key = input.key;
    scope = input.scope;
    validate = input.validate;
    initialize = input.initialize;
    mutate = input.mutate;
    if (!isCanonicalCommandKey(key)
      || (typeof scope !== "object" || scope === null)
      || typeof validate !== "function"
      || (initialize !== undefined && typeof initialize !== "function")
      || typeof mutate !== "function") return { ok: false, reason: "invalid" };
    receiptId = canonicalCommandReceiptId(input.channel, input.requestId);
    signature = canonicalCommandSignature(input.operation);
    lockName = canonicalDatasetLockName(scope, key);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (receiptId === null || signature === null) return { ok: false, reason: "invalid" };
  if ((scope.kind !== "account" && scope.kind !== "demo") || !scope.accountId) return { ok: false, reason: "account-changed" };
  const locks = currentLocks();
  if (!locks) return { ok: false, reason: "lock-unavailable" };
  try {
    return await browserAccountLock(accountLifecycleLockName(scope.accountId, scope.kind === "demo"), "shared", async () => locks.request(lockName, async (): Promise<CanonicalCommitResult> => {
      const firstCheck = checkCurrentDataset(scope, key);
      if (!firstCheck.ok) return firstCheck;
      const state = readPhysicalCommandState(firstCheck.physicalKey);
      if (state.status === "corrupt" || state.status === "unsupported" || state.status === "unavailable") {
        return { ok: false, reason: state.status === "unavailable" ? "storage" : "recovery-required" };
      }

      let data: unknown;
      let envelope: CanonicalCommandEnvelope | null = null;
      if (state.status === "absent") {
        if (!initialize) return { ok: false, reason: "missing-data" };
        try { data = initialize(); } catch { return { ok: false, reason: "invalid" }; }
      } else {
        data = state.data;
        if (state.status === "envelope") envelope = state.envelope;
      }
      let existingDataIsValid = false;
      try { existingDataIsValid = validate(data); } catch { return { ok: false, reason: "recovery-required" }; }
      if (!existingDataIsValid) return { ok: false, reason: state.status === "absent" ? "invalid" : "recovery-required" };

      const receipt = envelope && findCanonicalCommandReceipt(envelope, receiptId);
      if (receipt) {
        return receipt.signature === signature
          ? { ok: true, targetId: receipt.result.targetId, replay: true }
          : { ok: false, reason: "request-conflict" };
      }
      if (envelope && envelope.revision >= Number.MAX_SAFE_INTEGER) return { ok: false, reason: "capacity" };
      const receipts = envelope ? copyReceipts(envelope.receipts) : Object.create(null) as Record<string, CanonicalCommandReceipt>;
      if (Object.keys(receipts).length >= MAX_RECEIPTS) return { ok: false, reason: "capacity" };

      let mutation: unknown;
      try { mutation = mutate(data as T); } catch { return { ok: false, reason: "invalid" }; }
      let mutationData: T;
      let targetId: string;
      try {
        if (!isRecord(mutation) || typeof mutation.ok !== "boolean") return { ok: false, reason: "invalid" };
        if (!mutation.ok) {
          return mutation.reason === "not-found"
            ? { ok: false, reason: "not-found" }
            : { ok: false, reason: "invalid" };
        }
        mutationData = mutation.data as T;
        targetId = mutation.targetId as string;
      } catch {
        return { ok: false, reason: "invalid" };
      }
      if (typeof targetId !== "string" || targetId.length === 0 || targetId.length > MAX_COMMAND_PART_LENGTH) {
        return { ok: false, reason: "invalid" };
      }
      let mutationDataIsValid = false;
      try { mutationDataIsValid = validate(mutationData); } catch { return { ok: false, reason: "invalid" }; }
      if (!mutationDataIsValid) return { ok: false, reason: "invalid" };

      Object.defineProperty(receipts, receiptId, {
        value: { operationVersion: 1, signature, result: { ok: true, targetId }, committedAt: new Date().toISOString() },
        enumerable: true,
        configurable: true,
        writable: true,
      });
      const next: CanonicalCommandEnvelope<T> = {
        format: "xai-command-state",
        version: 1,
        revision: (envelope?.revision ?? 0) + 1,
        data: mutationData,
        receipts,
      };
      let encoded: string;
      try {
        encoded = JSON.stringify(next);
        const persisted = readCanonicalCommandState<T>(JSON.parse(encoded));
        if (persisted.status !== "envelope" || !validate(persisted.data)) return { ok: false, reason: "invalid" };
      } catch {
        return { ok: false, reason: "invalid" };
      }
      if (encoded.length > MAX_CANONICAL_RECORD_LENGTH) return { ok: false, reason: "capacity" };
      const finalCheck = checkCurrentDataset(scope, key);
      if (!finalCheck.ok) return finalCheck;
      if (finalCheck.physicalKey !== firstCheck.physicalKey) return { ok: false, reason: "account-changed" };
      try {
        localStorage.setItem(firstCheck.physicalKey, encoded);
      } catch {
        return { ok: false, reason: "storage" };
      }
      publishSameTab(key, mutationData, scope);
      return { ok: true, targetId, replay: false };
    }));
  } catch (error) {
    return { ok: false, reason: error instanceof Error && error.message.includes("lock unavailable") ? "lock-unavailable" : "lock-failed" };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function receiptIsValid(value: unknown): value is CanonicalCommandReceipt {
  if (!isRecord(value)) return false;
  if (
    value.operationVersion !== 1
    || typeof value.signature !== "string"
    || value.signature.length === 0
    || value.signature.length > MAX_SIGNATURE_LENGTH
    || typeof value.committedAt !== "string"
    || !Number.isFinite(Date.parse(value.committedAt))
    || !isRecord(value.result)
  ) return false;
  return value.result.ok === true
    && typeof value.result.targetId === "string"
    && value.result.targetId.length > 0
    && value.result.targetId.length <= MAX_COMMAND_PART_LENGTH;
}

function receiptIdIsSafe(value: string): boolean {
  return value.length > 0
    && value.length <= MAX_RECEIPT_ID_LENGTH
    && !/[\u0000-\u001f\u007f]/.test(value);
}

export function isCanonicalCommandKey(key: string): key is CanonicalCommandKey {
  return (CANONICAL_COMMAND_KEYS as readonly string[]).includes(key);
}

/**
 * Result-bearing decoder for the two future receipt-bearing datasets.
 * It is read-only in B1: callers decide whether legacy data satisfies their
 * domain schema, and no decoder branch materializes or rewrites a seed.
 */
export function readCanonicalCommandState<T = unknown>(
  value: unknown,
): CanonicalCommandRead<T> {
  if (!isRecord(value) || value.format !== "xai-command-state") {
    return { status: "legacy", data: value as T };
  }
  if (value.version !== 1) return { status: "unsupported", version: value.version };
  const revision = value.revision;
  if (typeof revision !== "number" || !Number.isSafeInteger(revision) || revision < 0) {
    return { status: "corrupt", reason: "invalid revision" };
  }
  if (!Object.hasOwn(value, "data")) return { status: "corrupt", reason: "missing data" };
  if (!isRecord(value.receipts)) return { status: "corrupt", reason: "invalid receipts" };
  const entries = Object.entries(value.receipts);
  if (entries.length > MAX_RECEIPTS) return { status: "corrupt", reason: "receipt capacity exceeded" };
  for (const [id, receipt] of entries) {
    if (!receiptIdIsSafe(id) || !receiptIsValid(receipt)) {
      return { status: "corrupt", reason: "invalid receipt" };
    }
  }
  return {
    status: "envelope",
    data: value.data as T,
    envelope: value as unknown as CanonicalCommandEnvelope<T>,
  };
}

export function findCanonicalCommandReceipt<T>(
  envelope: CanonicalCommandEnvelope<T>,
  requestId: string,
): CanonicalCommandReceipt | null {
  if (!Object.hasOwn(envelope.receipts, requestId)) return null;
  const receipt = Object.getOwnPropertyDescriptor(envelope.receipts, requestId)?.value;
  return receiptIsValid(receipt) ? receipt : null;
}

/** Read physical bytes without projecting corrupt or unknown formats to a seed. */
export function readCanonicalCommandSnapshot(
  key: CanonicalCommandKey,
  scope: AccountScope = accountScope.capture(),
): CanonicalCommandRead {
  try {
    const raw = localStorage.getItem(accountScope.physicalKey(key, scope));
    if (raw === null) return { status: "absent" };
    let decoded: unknown;
    try {
      decoded = JSON.parse(raw);
    } catch {
      return { status: "corrupt", reason: "invalid JSON" };
    }
    return readCanonicalCommandState(decoded);
  } catch {
    return { status: "unavailable", reason: "storage unavailable" };
  }
}
