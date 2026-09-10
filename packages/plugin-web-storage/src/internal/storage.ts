/**
 * @internal — storage.ts
 * Imperative getPref / setPref / removePref + same-tab pub/sub bus.
 *
 * Design notes:
 * - All functions are SSR-safe: they check `typeof window === "undefined"`.
 * - setPref compares-before-write to avoid spurious storage events (AC-IMP-11).
 * - Same-tab pub/sub: the browser `storage` event DOES NOT fire in the
 *   originating tab. We use an in-process subscriber bus so that React hooks
 *   in the same tab observe writes from sibling hooks (AC-HOOK-10).
 */

import {
  PREF_REGISTRY,
  type PrefCodec,
  type WebPrefKey,
  type WebPrefValue,
} from "./registry.js";
import { encode, decode } from "./codec.js";
import { AccountScopeError, accountScope, hasCommittedGenerationMarker, type AccountScope } from "./accountScope.js";
import { accountLifecycleLockName, browserAccountLock, type AccountCoordinationLock } from "./accountCoordination.js";
import { ownershipForKey } from "./accountOwnership.js";
import { isCanonicalCommandActivationEnabled, isCanonicalCommandKey, readCanonicalCommandState } from "./canonicalCommandState.js";
export { _clearAllListeners, publishSameTab, subscribeSameTab } from "./sameTabBus.js";
import { publishSameTab } from "./sameTabBus.js";
import { mutatePref } from "./prefMutation.js";

/** Decode one physical preference value into the domain projection readers expect. */
export function decodeStoredPrefValue<K extends WebPrefKey>(key: K, raw: string): WebPrefValue<K> | null {
  const decoded = decode(PREF_REGISTRY[key].codec, raw);
  if (decoded === null) return null;
  if (!isCanonicalCommandKey(key)) return decoded as WebPrefValue<K>;
  const state = readCanonicalCommandState(decoded);
  if (state.status === "legacy" || state.status === "envelope") {
    return state.data as WebPrefValue<K>;
  }
  return null;
}

function canonicalWriteBlocked<K extends WebPrefKey>(key: K, raw: string | null): boolean {
  if (!isCanonicalCommandKey(key)) return false;
  if (isCanonicalCommandActivationEnabled()) return true;
  if (raw === null) return false;
  const decoded = decode(PREF_REGISTRY[key].codec, raw);
  if (decoded === null) return true;
  const state = readCanonicalCommandState(decoded);
  return state.status === "envelope" || state.status === "corrupt" || state.status === "unsupported";
}

export function readRawPref(key: string, scope = accountScope.capture()): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(accountScope.physicalKey(key, scope)); } catch { return null; }
}

export type AccountWriteFailureReason = "lock-unavailable" | "account-changed" | "recovery-required" | "deleted" | "storage" | "invalid";
export type AccountWriteResult = Readonly<{ ok: true }> | Readonly<{ ok: false; reason: AccountWriteFailureReason }>;
export interface AccountWriteOptions { scope?: AccountScope; lock?: AccountCoordinationLock }

function assertCurrentAccountGeneration(scope: AccountScope): void {
  accountScope.assertCurrent(scope);
  if ((scope.kind !== "account" && scope.kind !== "demo") || !scope.accountId || !scope.generation) throw new Error("account-changed");
  const demo = scope.kind === "demo";
  const prefix = `xai:${demo ? "demo" : "account"}:v1:${encodeURIComponent(scope.accountId)}:`;
  if (localStorage.getItem(`${prefix}deleted`) !== null) throw new Error("deleted");
  const raw = localStorage.getItem(`${prefix}committed-generation`);
  if (raw === null) throw new Error("recovery-required");
  if (!hasCommittedGenerationMarker(raw, scope.generation)) throw new Error("recovery-required");
}

function accountWriteFailure(error: unknown): AccountWriteResult {
  if (error instanceof AccountScopeError) return { ok: false, reason: "account-changed" };
  const reason = error instanceof Error ? error.message : "storage";
  if (reason === "account-changed" || reason === "recovery-required" || reason === "deleted") return { ok: false, reason };
  return { ok: false, reason: reason.includes("lock") ? "lock-unavailable" : "storage" };
}

async function coordinateAccountWrite(
  key: string,
  scope: AccountScope,
  lock: AccountCoordinationLock | undefined,
  write: () => boolean,
): Promise<AccountWriteResult> {
  try {
    if (ownershipForKey(key) === "device") return write() ? { ok: true } : { ok: false, reason: "storage" };
    if (!scope.accountId || scope.kind === "locked") return { ok: false, reason: "account-changed" };
    return await (lock ?? browserAccountLock)(accountLifecycleLockName(scope.accountId, scope.kind === "demo"), "shared", async () => {
      assertCurrentAccountGeneration(scope);
      return write() ? { ok: true } : { ok: false, reason: "storage" };
    });
  } catch (error) {
    return accountWriteFailure(error);
  }
}


// ---------------------------------------------------------------------------
// One-shot warn for localStorage unavailability (e.g. Safari Private Mode)
// ---------------------------------------------------------------------------

let _storageUnavailableWarned = false;

/**
 * Try to access localStorage; returns false and warns on failure.
 * NOT called for every read/write — only as a fallback guard.
 */
function guardStorage(action: () => void): boolean {
  try {
    action();
    return true;
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      return false; // caller handles QuotaExceededError separately
    }
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// getPref
// ---------------------------------------------------------------------------

export function getPref<K extends WebPrefKey>(key: K, scope = accountScope.capture()): WebPrefValue<K> {
  const entry = PREF_REGISTRY[key];
  if (typeof window === "undefined") {
    return entry.default as WebPrefValue<K>;
  }
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(accountScope.physicalKey(key, scope));
  } catch {
    return entry.default as WebPrefValue<K>;
  }
  if (raw === null) {
    return entry.default as WebPrefValue<K>;
  }
  const decoded = decodeStoredPrefValue(key, raw);
  if (decoded === null) {
    console.warn(
      `[plugin-web-storage] decode failed for ${key}:`,
      new Error(`Cannot decode stored value with codec "${entry.codec}"`),
    );
    return entry.default as WebPrefValue<K>;
  }
  return decoded as WebPrefValue<K>;
}

// ---------------------------------------------------------------------------
// setPref
// ---------------------------------------------------------------------------

export function setPref<K extends WebPrefKey>(
  key: K,
  value: WebPrefValue<K>,
  scope = accountScope.capture(),
): boolean {
  if (typeof window === "undefined") {
    console.warn(
      "[plugin-web-storage] setPref called during SSR; no-op.",
    );
    return false;
  }

  const entry = PREF_REGISTRY[key];
  const encoded = encode(entry.codec, value);
  if (encoded === null) {
    console.warn(`[plugin-web-storage] encode failed for ${key}.`);
    return false;
  }

  // Compare-before-write: avoid spurious storage events (AC-IMP-11)
  let existing: string | null = null;
  try {
    existing = localStorage.getItem(accountScope.physicalKey(key, scope));
  } catch {
    // localStorage unavailable
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }
  if (canonicalWriteBlocked(key, existing)) {
    console.warn(`[plugin-web-storage] refusing legacy write over protected canonical ${key}.`);
    return false;
  }
  if (existing === encoded) {
    // Value unchanged — skip write. Same-tab subscribers do NOT get notified
    // (value didn't actually change).
    return true;
  }

  try {
    localStorage.setItem(accountScope.physicalKey(key, scope), encoded);
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      console.warn(`[plugin-web-storage] quota exceeded for ${key}.`);
      return false;
    }
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }

  // Publish to same-tab subscribers
  publishSameTab(key, value, scope);
  return true;
}

/** Coordinated account-pref write. Existing synchronous callers retain their boolean contract. */
export async function setPrefAccount<K extends WebPrefKey>(key: K, value: WebPrefValue<K>, options?: AccountWriteOptions): Promise<AccountWriteResult> {
  const scope = options?.scope ?? accountScope.capture();
  const entry = PREF_REGISTRY[key];
  const result = await mutatePref({ key, codec: entry.codec, defaultValue: entry.default as WebPrefValue<K>, validate: (candidate): candidate is WebPrefValue<K> => encode(entry.codec, candidate) !== null, next: value, scope, accountLock: options?.lock, keyLock: options?.lock });
  return result.ok ? { ok: true } : { ok: false, reason: result.reason === "canonical" || result.reason === "conflict" || result.reason === "unavailable" || result.reason === "readback-uncertain" ? "storage" : result.reason };
}

// ---------------------------------------------------------------------------
// removePref
// ---------------------------------------------------------------------------

/** Returns whether physical removal completed; callers must not infer success from a missing read fallback. */
export function removePref<K extends WebPrefKey>(key: K, scope = accountScope.capture()): boolean {
  if (typeof window === "undefined") return false;
  if (isCanonicalCommandKey(key)) {
    let existing: string | null;
    try {
      existing = localStorage.getItem(accountScope.physicalKey(key, scope));
    } catch {
      console.warn(`[plugin-web-storage] refusing canonical removal because ${key} could not be read.`);
      return false;
    }
    if (canonicalWriteBlocked(key, existing)) {
      console.warn(`[plugin-web-storage] refusing legacy removal of protected canonical ${key}.`);
      return false;
    }
  }
  try {
    localStorage.removeItem(accountScope.physicalKey(key, scope));
  } catch {
    return false;
  }
  const entry = PREF_REGISTRY[key];
  // Notify same-tab subscribers that the value is back to default
  publishSameTab(key, entry.default, scope);
  return true;
}

/** Coordinated account-pref removal with an explicit committed/refused result. */
export async function removePrefAccount<K extends WebPrefKey>(key: K, options?: AccountWriteOptions): Promise<AccountWriteResult> {
  const scope = options?.scope ?? accountScope.capture();
  const entry = PREF_REGISTRY[key];
  const result = await mutatePref({ key, codec: entry.codec, defaultValue: entry.default as WebPrefValue<K>, validate: (candidate): candidate is WebPrefValue<K> => encode(entry.codec, candidate) !== null, reset: true, scope, accountLock: options?.lock, keyLock: options?.lock });
  return result.ok ? { ok: true } : { ok: false, reason: result.reason === "canonical" || result.reason === "conflict" || result.reason === "unavailable" || result.reason === "readback-uncertain" ? "storage" : result.reason };
}

// Suppress unused variable warning for guardStorage
void guardStorage;

// ---------------------------------------------------------------------------
// isPrefKey (open-ended xai_pref_* family)
// ---------------------------------------------------------------------------

export function isPrefKey(s: string): s is `xai_pref_${string}` {
  return /^xai_pref_/.test(s);
}

// ---------------------------------------------------------------------------
// Open-ended xai_pref_* family — typed read / write / remove
//
// These helpers mirror the `usePrefAutosave<T>(suffix, value)` contract so
// consumers can seed React state at mount via `getPrefAutosave<T>(suffix, ...)`.
// Without these the autosave path is write-only (Codex 2026-05-24 BLOCKED:
// `xai_pref_*` autosave read-path is closed).
//
// Constraints (match `usePrefAutosave`):
// - `suffix` MUST NOT contain `/` (dev-mode throw; runtime no-op + warn in prod).
// - Default codec is `"json"`.
// - SSR-safe: returns `defaultValue` when `typeof window === "undefined"`.
// ---------------------------------------------------------------------------

function validateSuffix(fnName: string, suffix: string): boolean {
  if (suffix.includes("/")) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `[plugin-web-storage] ${fnName}: suffix must not contain "/". Got: "${suffix}"`,
      );
    }
    console.warn(
      `[plugin-web-storage] ${fnName}: suffix must not contain "/"; ignoring "${suffix}".`,
    );
    return false;
  }
  return true;
}

export interface GetPrefAutosaveOptions<T> {
  scope?: AccountScope;
  /** Codec used to deserialize. Must match the codec passed to `usePrefAutosave`. Default: "json". */
  codec?: PrefCodec;
  /** Value returned when the key is absent, decode fails, or running under SSR. */
  defaultValue?: T;
}

/**
 * Read an arbitrary `xai_pref_${suffix}` key written by `usePrefAutosave`.
 *
 * Returns `options.defaultValue` (or `undefined` if none) when the key is
 * absent, the stored value cannot be decoded with the given codec, or the
 * function runs during SSR.
 *
 * The codec MUST match the codec passed to the corresponding `usePrefAutosave`
 * call. There is no per-key registry for the `xai_pref_*` family — the
 * consumer pair (`usePrefAutosave` write + `getPrefAutosave` read) is the
 * authoritative contract for that suffix.
 */
export function getPrefAutosave<T>(
  suffix: string,
  options?: GetPrefAutosaveOptions<T>,
): T | undefined {
  const scope = options?.scope ?? accountScope.capture();
  const defaultValue = options?.defaultValue;
  const codec: PrefCodec = options?.codec ?? "json";

  if (!validateSuffix("getPrefAutosave", suffix)) {
    return defaultValue;
  }
  if (typeof window === "undefined") {
    return defaultValue;
  }

  const key = `xai_pref_${suffix}`;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(accountScope.physicalKey(key, scope));
  } catch {
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return defaultValue;
  }
  if (raw === null) {
    return defaultValue;
  }

  const decoded = decode(codec, raw);
  if (decoded === null) {
    console.warn(
      `[plugin-web-storage] decode failed for ${key}:`,
      new Error(`Cannot decode stored value with codec "${codec}"`),
    );
    return defaultValue;
  }
  return decoded as T;
}

export interface SetPrefAutosaveOptions {
  scope?: AccountScope;
  /** Codec used to serialize. Default: "json". Must match the reader's codec. */
  codec?: PrefCodec;
  /** Optional runtime domain validator for explicit coordinated async writers. */
  validate?: (value: unknown) => boolean;
}

/**
 * Imperatively write an arbitrary `xai_pref_${suffix}` key.
 *
 * Mirrors `setPref` semantics (compare-before-write, same-tab pub/sub on
 * change, SSR no-op + warn) but for the open-ended `xai_pref_*` family.
 *
 * Primary use case: non-React contexts (event handlers, migrations,
 * dev-tools) that need to mutate an autosave key without mounting a hook.
 * React consumers should keep using `usePrefAutosave`.
 */
export function setPrefAutosave<T>(
  suffix: string,
  value: T,
  options?: SetPrefAutosaveOptions,
): boolean {
  const scope = options?.scope ?? accountScope.capture();
  const codec: PrefCodec = options?.codec ?? "json";

  if (!validateSuffix("setPrefAutosave", suffix)) {
    return false;
  }
  if (typeof window === "undefined") {
    console.warn(
      "[plugin-web-storage] setPrefAutosave called during SSR; no-op.",
    );
    return false;
  }

  const key = `xai_pref_${suffix}`;
  const encoded = encode(codec, value);
  if (encoded === null) {
    console.warn(`[plugin-web-storage] encode failed for ${key}.`);
    return false;
  }

  let existing: string | null = null;
  try {
    existing = localStorage.getItem(accountScope.physicalKey(key, scope));
  } catch {
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }
  if (existing === encoded) {
    return true;
  }

  try {
    localStorage.setItem(accountScope.physicalKey(key, scope), encoded);
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      console.warn(`[plugin-web-storage] quota exceeded for ${key}.`);
      return false;
    }
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }

  publishSameTab(key, value, scope);
  return true;
}

/** Coordinated account autosave write. The legacy boolean API remains unchanged. */
export async function setPrefAutosaveAccount<T>(suffix: string, value: T, options?: SetPrefAutosaveOptions & AccountWriteOptions): Promise<AccountWriteResult> {
  const scope = options?.scope ?? accountScope.capture();
  const key = `xai_pref_${suffix}`;
  if (!validateSuffix("setPrefAutosave", suffix)) return { ok: false, reason: "invalid" };
  const codec = options?.codec ?? "json";
  const valid = (candidate: unknown): candidate is T => (options?.validate?.(candidate) ?? encode(codec, candidate) !== null);
  const result = await mutatePref({ key, codec, defaultValue: value, validate: valid, next: value, scope, accountLock: options?.lock, keyLock: options?.lock });
  return result.ok ? { ok: true } : { ok: false, reason: result.reason === "canonical" || result.reason === "conflict" || result.reason === "unavailable" || result.reason === "readback-uncertain" ? "storage" : result.reason };
}

/**
 * Remove an arbitrary `xai_pref_${suffix}` key.
 *
 * Notifies same-tab subscribers that the value is gone (publishes `undefined`).
 * SSR no-op. Returns nothing — there is no failure mode worth surfacing.
 */
export function removePrefAutosave(suffix: string, scope = accountScope.capture()): void {
  if (!validateSuffix("removePrefAutosave", suffix)) return;
  if (typeof window === "undefined") return;

  const key = `xai_pref_${suffix}`;
  try {
    localStorage.removeItem(accountScope.physicalKey(key, scope));
  } catch {
    return;
  }
  publishSameTab(key, undefined, scope);
}

/** Coordinated account autosave removal. */
export async function removePrefAutosaveAccount(suffix: string, options?: SetPrefAutosaveOptions & AccountWriteOptions): Promise<AccountWriteResult> {
  const scope = options?.scope ?? accountScope.capture();
  const key = `xai_pref_${suffix}`;
  if (!validateSuffix("removePrefAutosave", suffix)) return { ok: false, reason: "invalid" };
  const codec = options?.codec ?? "json";
  const result = await mutatePref<unknown>({ key, codec, defaultValue: undefined, validate: (value): value is unknown => options?.validate?.(value) ?? value !== undefined, reset: true, scope, accountLock: options?.lock, keyLock: options?.lock });
  return result.ok ? { ok: true } : { ok: false, reason: result.reason === "canonical" || result.reason === "conflict" || result.reason === "unavailable" || result.reason === "readback-uncertain" ? "storage" : result.reason };
}
