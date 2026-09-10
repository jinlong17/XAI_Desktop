import { decode, encode } from "./codec.js";
import { accountScope, AccountScopeError, hasCommittedGenerationMarker, type AccountScope } from "./accountScope.js";
import { accountLifecycleLockName, browserAccountLock, type AccountCoordinationLock } from "./accountCoordination.js";
import { ownershipForKey } from "./accountOwnership.js";
import { isCanonicalCommandKey } from "./canonicalCommandState.js";
import { publishSameTab } from "./sameTabBus.js";
import type { PrefCodec } from "./registry.js";

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
  readonly accountLock?: AccountCoordinationLock;
  readonly keyLock?: AccountCoordinationLock;
}

/** Physical-key lock name: intentionally includes the entire scoped key. */
export function prefMutationLockName(physicalKey: string): string {
  return `xai:pref:v1:${encodeURIComponent(physicalKey)}`;
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
  const owner = ownershipForKey(options.key);
  const run = async (): Promise<PrefMutationResult<T>> => {
    if (owner === "account") assertAccount(scope);
    const physicalKey = accountScope.physicalKey(options.key, scope);
    return (options.keyLock ?? browserAccountLock)(prefMutationLockName(physicalKey), "exclusive", async () => {
      if (owner === "account") assertAccount(scope);
      const current = read(physicalKey, options.codec, options.validate);
      if (current.source === "invalid" || current.source === "unavailable") return { ok: false, reason: current.source === "invalid" ? "invalid" : "unavailable", source: current.source, raw: current.raw };
      if (options.expectedRaw !== undefined && current.raw !== options.expectedRaw) return { ok: false, reason: "conflict", source: current.source, raw: current.raw };
      if (options.reset) {
        if (current.source === "absent") return { ok: true, value: options.defaultValue, raw: null, changed: false, source: "absent" };
        try { localStorage.removeItem(physicalKey); } catch { return { ok: false, reason: "storage" }; }
        const checked = read(physicalKey, options.codec, options.validate);
        if (checked.source !== "absent") return { ok: false, reason: "readback-uncertain", source: checked.source, raw: checked.raw };
        publishSameTab(options.key, options.defaultValue, scope);
        return { ok: true, value: options.defaultValue, raw: null, changed: true, source: "absent" };
      }
      let next: T;
      try {
        const base = current.source === "absent" ? options.defaultValue : current.value as T;
        next = typeof options.next === "function" ? (options.next as (value: T) => T)(base) : options.next as T;
      } catch { return { ok: false, reason: "invalid", source: current.source, raw: current.raw }; }
      if (!options.validate(next)) return { ok: false, reason: "invalid", source: current.source, raw: current.raw };
      const encoded = encode(options.codec, next);
      if (encoded === null) return { ok: false, reason: "invalid", source: current.source, raw: current.raw };
      if (encoded === current.raw) return { ok: true, value: next, raw: encoded, changed: false, source: current.source };
      try { localStorage.setItem(physicalKey, encoded); } catch { return { ok: false, reason: "storage", source: current.source, raw: current.raw }; }
      const checked = read(physicalKey, options.codec, options.validate);
      if (checked.source !== "valid" || checked.raw !== encoded || checked.value === undefined) return { ok: false, reason: "readback-uncertain", source: checked.source, raw: checked.raw };
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
