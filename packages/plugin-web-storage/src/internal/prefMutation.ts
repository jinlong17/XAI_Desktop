import { decode, encode } from "./codec.js";
import { accountScope, AccountScopeError, hasCommittedGenerationMarker, type AccountScope } from "./accountScope.js";
import { accountLifecycleLockName, browserAccountLock, type AccountCoordinationLock } from "./accountCoordination.js";
import { ownershipForKey } from "./accountOwnership.js";
import { isCanonicalCommandKey } from "./canonicalCommandState.js";
import { publishSameTab } from "./sameTabBus.js";
import { PREF_REGISTRY, type PrefCodec } from "./registry.js";

export type PrefMutationReason = "lock-unavailable" | "account-changed" | "recovery-required" | "deleted" | "storage" | "invalid" | "conflict" | "unavailable" | "canonical" | "readback-uncertain";
export type PrefSource = "absent" | "valid" | "invalid" | "unavailable";
export type PrefMutationResult<T> =
  | Readonly<{ ok: true; value: T; raw: string | null; changed: boolean; source: "absent" | "valid" }>
  | Readonly<{ ok: false; reason: PrefMutationReason; source?: PrefSource; raw?: string | null }>;

export interface PrefMutationOptions<T> {
  readonly key: string;
  readonly codec: PrefCodec;
  readonly defaultValue: T;
  readonly validate: (value: unknown) => value is T;
  readonly scope?: AccountScope;
  readonly expectedRaw?: string | null;
  readonly next?: T | ((current: T) => T);
  readonly reset?: boolean;
  /** Only dynamic autosave removal may represent physical absence as undefined. */
  readonly allowAbsentDefault?: boolean;
  readonly accountLock?: AccountCoordinationLock;
  readonly keyLock?: AccountCoordinationLock;
}

/** Physical-key lock name: intentionally includes the entire scoped key. */
export function prefMutationLockName(physicalKey: string): string {
  return `xai:pref:v1:${encodeURIComponent(physicalKey)}`;
}

/**
 * Registry codecs alone are serializers, not runtime schemas. Keep the
 * primitive boundary strict here, and add the few closed domains that the
 * registry itself declares. Structured JSON remains deliberately open-ended.
 */
export function validateRegisteredPrefValue(key: string, value: unknown): boolean {
  const entry = PREF_REGISTRY[key as keyof typeof PREF_REGISTRY];
  if (!entry) return true;
  if (key === "xai_pref_collab_default_share") return value === "comment" || value === "edit" || value === "view";
  switch (entry.codec) {
    case "string": return typeof value === "string";
    case "number": return typeof value === "number" && Number.isFinite(value);
    case "boolean": return typeof value === "boolean";
    case "json": {
      const encoded = encode("json", value);
      return typeof encoded === "string";
    }
  }
}

type UncertainCommit = Readonly<{ raw: string | null; value: unknown }>;
const uncertainCommits = new Map<string, UncertainCommit>();

function rememberUncertain(physicalKey: string, raw: string | null, value: unknown): void {
  uncertainCommits.set(physicalKey, { raw, value });
}

function reconcileUncertain(physicalKey: string, raw: string | null, intendedRaw: string | null, key: string, value: unknown, scope: AccountScope): boolean {
  const uncertain = uncertainCommits.get(physicalKey);
  if (!uncertain) return false;
  if (uncertain.raw !== raw) {
    uncertainCommits.delete(physicalKey);
    return false;
  }
  if (uncertain.raw !== intendedRaw) return false;
  uncertainCommits.delete(physicalKey);
  publishSameTab(key, value, scope);
  return true;
}

function failure(error: unknown): PrefMutationResult<never> {
  if (error instanceof AccountScopeError) return { ok: false, reason: "account-changed" };
  const message = error instanceof Error ? error.message : "storage";
  if (message === "account-changed" || message === "recovery-required" || message === "deleted") return { ok: false, reason: message };
  return { ok: false, reason: message.includes("lock") ? "lock-unavailable" : "storage" };
}

function assertAccount(scope: AccountScope): void {
  accountScope.assertCurrent(scope);
  if ((scope.kind !== "account" && scope.kind !== "demo") || !scope.accountId || !scope.generation) throw new Error("account-changed");
  const prefix = `xai:${scope.kind === "demo" ? "demo" : "account"}:v1:${encodeURIComponent(scope.accountId)}:`;
  if (localStorage.getItem(`${prefix}deleted`) !== null) throw new Error("deleted");
  if (!hasCommittedGenerationMarker(localStorage.getItem(`${prefix}committed-generation`), scope.generation)) throw new Error("recovery-required");
}

function read<T>(physicalKey: string, codec: PrefCodec, validate: (value: unknown) => value is T): { source: PrefSource; raw: string | null; value?: T } {
  let raw: string | null;
  try { raw = localStorage.getItem(physicalKey); } catch { return { source: "unavailable", raw: null }; }
  if (raw === null) return { source: "absent", raw };
  const value = decode(codec, raw);
  return value !== null && validate(value) ? { source: "valid", raw, value } : { source: "invalid", raw };
}

/**
 * Strict preference mutation. The entire read/validate/mutate/write/readback
 * segment is synchronous while the account and physical-key locks are held.
 */
export async function mutatePref<T>(options: PrefMutationOptions<T>): Promise<PrefMutationResult<T>> {
  const scope = options.scope ?? accountScope.capture();
  if (typeof window === "undefined" || isCanonicalCommandKey(options.key as never)) {
    return { ok: false, reason: isCanonicalCommandKey(options.key as never) ? "canonical" : "unavailable" };
  }
  let owner: ReturnType<typeof ownershipForKey>;
  try { owner = ownershipForKey(options.key); } catch { return { ok: false, reason: "invalid" }; }
  const registered = PREF_REGISTRY[options.key as keyof typeof PREF_REGISTRY];
  if (registered && registered.codec !== options.codec) return { ok: false, reason: "invalid" };
  const validate = (value: unknown): value is T => options.validate(value) && validateRegisteredPrefValue(options.key, value);
  if (!(options.reset && options.allowAbsentDefault) && !validate(options.defaultValue)) return { ok: false, reason: "invalid" };
  const run = async (): Promise<PrefMutationResult<T>> => {
    if (owner === "account") assertAccount(scope);
    const physicalKey = accountScope.physicalKey(options.key, scope);
    return (options.keyLock ?? browserAccountLock)(prefMutationLockName(physicalKey), "exclusive", async () => {
      if (owner === "account") assertAccount(scope);
      const current = read(physicalKey, options.codec, validate);
      const uncertain = uncertainCommits.get(physicalKey);
      if (uncertain && current.source !== "unavailable" && uncertain.raw !== current.raw) uncertainCommits.delete(physicalKey);
      if (current.source === "invalid" || current.source === "unavailable") return { ok: false, reason: current.source === "invalid" ? "invalid" : "unavailable", source: current.source, raw: current.raw };
      if (options.expectedRaw !== undefined && current.raw !== options.expectedRaw) return { ok: false, reason: "conflict", source: current.source, raw: current.raw };
      if (options.reset) {
        if (current.source === "absent") {
          reconcileUncertain(physicalKey, null, null, options.key, options.defaultValue, scope);
          return { ok: true, value: options.defaultValue, raw: null, changed: false, source: "absent" };
        }
        try { localStorage.removeItem(physicalKey); } catch { return { ok: false, reason: "storage" }; }
        const checked = read(physicalKey, options.codec, validate);
        if (checked.source !== "absent") {
          rememberUncertain(physicalKey, null, options.defaultValue);
          return { ok: false, reason: "readback-uncertain", source: checked.source, raw: checked.raw };
        }
        uncertainCommits.delete(physicalKey);
        publishSameTab(options.key, options.defaultValue, scope);
        return { ok: true, value: options.defaultValue, raw: null, changed: true, source: "absent" };
      }
      let next: T;
      try {
        const base = current.source === "absent" ? options.defaultValue : current.value as T;
        next = typeof options.next === "function" ? (options.next as (value: T) => T)(base) : options.next as T;
      } catch { return { ok: false, reason: "invalid", source: current.source, raw: current.raw }; }
      if (!validate(next)) return { ok: false, reason: "invalid", source: current.source, raw: current.raw };
      const encoded = encode(options.codec, next);
      if (typeof encoded !== "string") return { ok: false, reason: "invalid", source: current.source, raw: current.raw };
      if (encoded === current.raw) {
        const reconciled = reconcileUncertain(physicalKey, encoded, encoded, options.key, next, scope);
        return { ok: true, value: next, raw: encoded, changed: reconciled, source: current.source };
      }
      try { localStorage.setItem(physicalKey, encoded); } catch { return { ok: false, reason: "storage", source: current.source, raw: current.raw }; }
      const checked = read(physicalKey, options.codec, validate);
      if (checked.source !== "valid" || checked.raw !== encoded || checked.value === undefined) {
        rememberUncertain(physicalKey, encoded, next);
        return { ok: false, reason: "readback-uncertain", source: checked.source, raw: checked.raw };
      }
      uncertainCommits.delete(physicalKey);
      publishSameTab(options.key, checked.value, scope);
      return { ok: true, value: checked.value, raw: checked.raw, changed: true, source: "valid" };
    });
  };
  try {
    if (owner === "device") return await run();
    if (!scope.accountId || scope.kind === "locked") return { ok: false, reason: "account-changed" };
    return await (options.accountLock ?? browserAccountLock)(accountLifecycleLockName(scope.accountId, scope.kind === "demo"), "shared", run);
  } catch (error) { return failure(error) as PrefMutationResult<T>; }
}
