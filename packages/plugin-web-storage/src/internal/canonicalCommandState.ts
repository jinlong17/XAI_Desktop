import type { AccountScope } from "./accountScope.js";
import { accountScope } from "./accountScope.js";

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
const MAX_RECEIPT_ID_LENGTH = 192;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function receiptIsValid(value: unknown): value is CanonicalCommandReceipt {
  if (!isRecord(value)) return false;
  if (
    value.operationVersion !== 1
    || typeof value.signature !== "string"
    || value.signature.length === 0
    || typeof value.committedAt !== "string"
    || !Number.isFinite(Date.parse(value.committedAt))
    || !isRecord(value.result)
  ) return false;
  return value.result.ok === true
    && typeof value.result.targetId === "string"
    && value.result.targetId.length > 0;
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
