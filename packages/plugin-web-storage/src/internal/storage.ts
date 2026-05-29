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
import {
  calendarProviderStateRecordId,
  mountDesktopRepoBridge,
  patchCalendarProviderState,
  readCalendarProviderState,
  readDesktopRepoError,
  readDesktopRepoValue,
  unmountDesktopRepoBridge,
  writeDesktopRepoValue,
} from "./desktopRepoBridge.js";
import {
  preflightDesktopReconnectSync,
  runDesktopReconnectSyncOnce,
  setDesktopReconnectSyncRuntimeEnabled,
} from "./desktopReconnectSync.js";
import {
  getLastDesktopWebImportReport,
  runDesktopWebDataImport,
  scanDesktopWebImportEligibility,
  setDesktopWebImportRuntimeEnabled,
  type DesktopWebImportReport,
} from "./desktopWebDataMigration.js";
import type {
  CalendarProviderId,
  CalendarProviderStateEntity,
  DesktopWebImportSurface,
  ReconnectSyncPreflightStatus,
  ReconnectSyncReplayResult,
} from "@repo/core-data";

// ---------------------------------------------------------------------------
// Same-tab pub/sub bus
// ---------------------------------------------------------------------------

type Listener<T = unknown> = (value: T) => void;

// Map from storage key to Set of listeners
const _listeners = new Map<string, Set<Listener>>();

/**
 * Subscribe to same-tab writes for a single key.
 * Returns an unsubscribe function.
 */
export function subscribeSameTab(
  key: string,
  listener: Listener,
): () => void {
  let set = _listeners.get(key);
  if (!set) {
    set = new Set();
    _listeners.set(key, set);
  }
  set.add(listener);
  return () => {
    const s = _listeners.get(key);
    if (s) {
      s.delete(listener);
      if (s.size === 0) _listeners.delete(key);
    }
  };
}

/**
 * Publish to same-tab subscribers for a key.
 * Called by setPref after writing to localStorage.
 */
export function publishSameTab(key: string, value: unknown): void {
  const set = _listeners.get(key);
  if (!set) return;
  for (const listener of set) {
    listener(value);
  }
}

/**
 * @internal — exposed for test cleanup; not part of the public surface.
 */
export function _clearAllListeners(): void {
  _listeners.clear();
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

export function getPref<K extends WebPrefKey>(key: K): WebPrefValue<K> {
  const entry = PREF_REGISTRY[key];
  if (typeof window === "undefined") {
    return entry.default as WebPrefValue<K>;
  }

  const repoValue = readDesktopRepoValue(key);
  if (repoValue.hasValue) {
    return repoValue.value as WebPrefValue<K>;
  }

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return entry.default as WebPrefValue<K>;
  }
  if (raw === null) {
    return entry.default as WebPrefValue<K>;
  }
  const decoded = decode(entry.codec, raw);
  if (decoded === null) {
    console.warn(
      `[plugin-web-storage] decode failed for ${key}:`,
      new Error(`Cannot decode "${raw}" with codec "${entry.codec}"`),
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
    existing = localStorage.getItem(key);
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
  if (existing === encoded) {
    // Value unchanged — skip write. Same-tab subscribers do NOT get notified
    // (value didn't actually change).
    return true;
  }

  try {
    localStorage.setItem(key, encoded);
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
  publishSameTab(key, value);
  void writeDesktopRepoValue(key, value);
  return true;
}

// ---------------------------------------------------------------------------
// removePref
// ---------------------------------------------------------------------------

export function removePref<K extends WebPrefKey>(key: K): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
  const entry = PREF_REGISTRY[key];
  // Notify same-tab subscribers that the value is back to default
  publishSameTab(key, entry.default);
  void writeDesktopRepoValue(key, entry.default);
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
  const defaultValue = options?.defaultValue;
  const codec: PrefCodec = options?.codec ?? "json";

  if (!validateSuffix("getPrefAutosave", suffix)) {
    return defaultValue;
  }
  if (typeof window === "undefined") {
    return defaultValue;
  }

  const key = `xai_pref_${suffix}`;
  const repoValue = readDesktopRepoValue(key);
  if (repoValue.hasValue) {
    return repoValue.value as T;
  }

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
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
      new Error(`Cannot decode "${raw}" with codec "${codec}"`),
    );
    return defaultValue;
  }
  return decoded as T;
}

export interface SetPrefAutosaveOptions {
  /** Codec used to serialize. Default: "json". Must match the reader's codec. */
  codec?: PrefCodec;
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
    existing = localStorage.getItem(key);
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
    localStorage.setItem(key, encoded);
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

  publishSameTab(key, value);
  void writeDesktopRepoValue(key, value);
  return true;
}

/**
 * Remove an arbitrary `xai_pref_${suffix}` key.
 *
 * Notifies same-tab subscribers that the value is gone (publishes `undefined`).
 * SSR no-op. Returns nothing — there is no failure mode worth surfacing.
 */
export function removePrefAutosave(suffix: string): void {
  if (!validateSuffix("removePrefAutosave", suffix)) return;
  if (typeof window === "undefined") return;

  const key = `xai_pref_${suffix}`;
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
  publishSameTab(key, undefined);
  void writeDesktopRepoValue(key, null);
}

export function getDesktopLocalFirstCalendarProviderStateKey(
  providerId: CalendarProviderId,
): string {
  return calendarProviderStateRecordId(providerId);
}

export function getDesktopLocalFirstCalendarProviderState(
  providerId: CalendarProviderId,
): CalendarProviderStateEntity | null {
  return readCalendarProviderState(providerId);
}

export function patchDesktopLocalFirstCalendarProviderState(
  providerId: CalendarProviderId,
  patch: {
    connectionState?: CalendarProviderStateEntity["connectionState"];
    availability?: CalendarProviderStateEntity["availability"];
    lastAttemptAt?: string;
    lastSuccessAt?: string;
    lastFailureCode?: string;
    lastFailureMessage?: string;
    needsReconnectRefresh?: boolean;
  },
): Promise<CalendarProviderStateEntity | null> {
  return patchCalendarProviderState(providerId, patch);
}

export interface DesktopCalendarProviderReconnectFailure {
  providerId: CalendarProviderId;
  code: string;
  message: string;
}

export interface DesktopCalendarProviderReconnectResult {
  preflight: ReconnectSyncPreflightStatus;
  attemptedProviders: CalendarProviderId[];
  reconciledProviders: CalendarProviderId[];
  deferredProviders: CalendarProviderId[];
  failures: DesktopCalendarProviderReconnectFailure[];
}

type CalendarTransportResult =
  | {
      outcome: "reconciled";
    }
  | {
      outcome: "deferred" | "failed";
      code: string;
      message: string;
      availability?: CalendarProviderStateEntity["availability"];
    };

type CalendarReconnectTransport = {
  reconcileProvider: (
    providerId: CalendarProviderId,
  ) => Promise<CalendarTransportResult>;
};

function defaultProviderIds(
  providerIds: readonly CalendarProviderId[] | undefined,
): CalendarProviderId[] {
  if (!providerIds || providerIds.length === 0) {
    return ["gcal"];
  }
  return Array.from(new Set(providerIds));
}

function availabilityFromPreflight(
  preflight: ReconnectSyncPreflightStatus,
): CalendarProviderStateEntity["availability"] {
  if (preflight === "network_unavailable") {
    return "offline";
  }
  if (preflight === "account_required") {
    return "auth-required";
  }
  if (
    preflight === "device_required" ||
    preflight === "transport_unavailable"
  ) {
    return "transport-unavailable";
  }
  return "ready";
}

function resolveCalendarReconnectTransport():
  | CalendarReconnectTransport
  | undefined {
  const runtime = globalThis as typeof globalThis & {
    __XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__?: CalendarReconnectTransport;
  };
  return runtime.__XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__;
}

const DESKTOP_WEB_IMPORT_REPORT_EVENT = "xai:web:desktop-import-report";

function publishDesktopWebImportReport(report: DesktopWebImportReport): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(DESKTOP_WEB_IMPORT_REPORT_EVENT, {
      detail: report,
    }),
  );
}

export function mountDesktopLocalFirstRepositoryBridge(enabled: boolean): void {
  setDesktopWebImportRuntimeEnabled(enabled);
  setDesktopReconnectSyncRuntimeEnabled(enabled);
  if (!enabled) {
    unmountDesktopRepoBridge();
    return;
  }

  mountDesktopRepoBridge({
    enabled,
    publish: publishSameTab,
  });

  const bridgeError = readDesktopRepoError("bridge");
  if (bridgeError) {
    console.warn(
      `[plugin-web-storage] desktop repository bridge degraded: ${bridgeError.kind} (${bridgeError.message})`,
    );
  }

  void scanDesktopWebImportEligibility().then((report) => {
    publishDesktopWebImportReport(report);
  });
}

export async function runDesktopLocalFirstWebDataImport(input?: {
  boundaryKey?: string;
  surfaces?: readonly DesktopWebImportSurface[];
  allowBoundaryOverride?: boolean;
}): Promise<DesktopWebImportReport> {
  const report = await runDesktopWebDataImport(input);
  publishDesktopWebImportReport(report);
  return report;
}

export function getDesktopLocalFirstWebDataImportReport():
  | DesktopWebImportReport
  | null {
  return getLastDesktopWebImportReport();
}

export function getDesktopLocalFirstWebDataImportReportEventName(): string {
  return DESKTOP_WEB_IMPORT_REPORT_EVENT;
}

export function getDesktopLocalFirstReconnectSyncPreflight():
  Promise<ReconnectSyncPreflightStatus> {
  return preflightDesktopReconnectSync();
}

export async function runDesktopLocalFirstCalendarProviderReconnect(input?: {
  providerIds?: readonly CalendarProviderId[];
}): Promise<DesktopCalendarProviderReconnectResult> {
  const providerIds = defaultProviderIds(input?.providerIds);
  const preflight = await preflightDesktopReconnectSync();
  const attemptedProviders: CalendarProviderId[] = [];
  const reconciledProviders: CalendarProviderId[] = [];
  const deferredProviders: CalendarProviderId[] = [];
  const failures: DesktopCalendarProviderReconnectFailure[] = [];

  const isPreflightEligible =
    preflight === "ready" || preflight === "queue_empty";
  if (!isPreflightEligible) {
    const availability = availabilityFromPreflight(preflight);
    for (const providerId of providerIds) {
      deferredProviders.push(providerId);
      failures.push({
        providerId,
        code: preflight,
        message: `Reconnect preflight is ${preflight}.`,
      });
      await patchCalendarProviderState(providerId, {
        availability,
        needsReconnectRefresh: true,
        lastFailureCode: preflight,
        lastFailureMessage: `Reconnect preflight is ${preflight}.`,
      });
    }
    return {
      preflight,
      attemptedProviders,
      reconciledProviders,
      deferredProviders,
      failures,
    };
  }

  const transport = resolveCalendarReconnectTransport();
  if (!transport?.reconcileProvider) {
    for (const providerId of providerIds) {
      deferredProviders.push(providerId);
      failures.push({
        providerId,
        code: "calendar_transport_unavailable",
        message: "Calendar reconnect transport is unavailable.",
      });
      await patchCalendarProviderState(providerId, {
        availability: "transport-unavailable",
        needsReconnectRefresh: true,
        lastFailureCode: "calendar_transport_unavailable",
        lastFailureMessage: "Calendar reconnect transport is unavailable.",
      });
    }
    return {
      preflight,
      attemptedProviders,
      reconciledProviders,
      deferredProviders,
      failures,
    };
  }

  for (const providerId of providerIds) {
    const currentState = readCalendarProviderState(providerId);
    const connectedByPref =
      providerId === "gcal"
        ? getPref("xai_pref_integrations_connected_gcal") === true
        : false;
    const shouldAttempt =
      currentState?.connectionState === "connected" ||
      currentState?.needsReconnectRefresh === true ||
      connectedByPref;
    if (!shouldAttempt) {
      deferredProviders.push(providerId);
      continue;
    }

    attemptedProviders.push(providerId);
    const attemptAt = new Date().toISOString();
    await patchCalendarProviderState(providerId, {
      lastAttemptAt: attemptAt,
      connectionState: "connected",
    });

    try {
      const outcome = await transport.reconcileProvider(providerId);
      if (outcome.outcome === "reconciled") {
        await patchCalendarProviderState(providerId, {
          availability: "ready",
          needsReconnectRefresh: false,
          lastSuccessAt: attemptAt,
          lastFailureCode: undefined,
          lastFailureMessage: undefined,
        });
        reconciledProviders.push(providerId);
      } else {
        await patchCalendarProviderState(providerId, {
          availability: outcome.availability ?? "ready",
          needsReconnectRefresh: true,
          lastFailureCode: outcome.code,
          lastFailureMessage: outcome.message,
        });
        deferredProviders.push(providerId);
        failures.push({
          providerId,
          code: outcome.code,
          message: outcome.message,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await patchCalendarProviderState(providerId, {
        availability: "transport-unavailable",
        needsReconnectRefresh: true,
        lastFailureCode: "calendar_transport_error",
        lastFailureMessage: message,
      });
      deferredProviders.push(providerId);
      failures.push({
        providerId,
        code: "calendar_transport_error",
        message,
      });
    }
  }

  return {
    preflight,
    attemptedProviders,
    reconciledProviders,
    deferredProviders,
    failures,
  };
}

export function runDesktopLocalFirstReconnectSync(input?: {
  limit?: number;
}): Promise<ReconnectSyncReplayResult> {
  return runDesktopReconnectSyncOnce(input);
}
