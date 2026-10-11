/**
 * Parent-role jsdom host fixture for the Dashboard Clock caller (CP-CLOCK-01, control-plane batch 69; contract
 * docs/reviews/web-dashboard-clock-recovery-contract/contract.md r2, sections 3, 5, 6, 7, 9 host rows a-q, 12 "Parent
 * host baseline" and 14 item E3). Imported only by ./host.test.tsx. ./verify-fixed.mjs copies both files into an
 * immutable `git archive` of the product revision under test.
 *
 * Derived from the accepted AppRail parent fixture (../web-apprail-order-recovery-independent/host-fixture.tsx,
 * 314e2391...): the Storage injector, the Web Lock manager, the window.confirm recorder, the location stub, the history
 * counters, the jsdom shims, the production-App mount, the rail drag driver and the sign-out driver follow it. The
 * Clock, Header, coordinator, widget-drag, download, event and census helpers are new and written from the contract
 * text and the protected label tables it cites (no product helper is imported for an expectation).
 *
 * Product under test, loaded unmodified from the archive (nothing in the product or persistence path is mocked):
 *   - the production route table `webHostRouteObjects` behind a fresh memory data router per mount, rendered by
 *     `RouterProvider` from "react-router" (the accepted harness ruling). /app/dashboard renders
 *     ProtectedAppRouteElement -> App -> AccountStorageGate -> AccountDataGate -> CommandPaletteProvider ->
 *     AppearanceProvider + WebShellProvider + RailOrderProvider + Shell (AppRail, Topbar with the Appearance and rail
 *     status slots), DesktopPet and CommandPalette; the Dashboard registration mounts the shared DepartureCoordinator
 *     around DashboardModule (DashHeader, DashboardGrid, WidgetShell, WidgetGhost, the real widget registrations);
 *   - the real ClockWidget, the real storage hooks, engine, registry, codecs and accountScope.
 * The test file substitutes only the auth-session hook (useWebAuthSession).
 *
 * Test-owned instruments (this file; none is a product input):
 *   - an attempt-logging Storage injector. F-B002 rule (contract section 12 rules 8-9): each wrapper records the
 *     attempt and then delegates exactly once to the captured native method; an armed fault throws before delegating
 *     and never reaches storage; the wrappers never call accountScope.physicalKey, getPref, readRawPref, any other
 *     Storage method or any product helper. Every key is precomputed outside the wrappers (both Clock keys,
 *     `xai_rail_order`, `xai_dash_order` and the Appearance keys are device keys: physical key = logical key; the Header
 *     note's account key is computed in setup before the wrappers are installed). A re-entrancy counter is re-checked
 *     in teardown;
 *   - an exclusive/shared FIFO Web Lock manager installed as navigator.locks;
 *   - a window.confirm recorder (queued answers) that classifies each message by exact text as rail, appearance or
 *     other (contract section 12 rule 12), a window.location stub, router-commit and pushState/replaceState counters, a
 *     runtime-error recorder, a console recorder for "Invalid blocker state transition", and a beforeunload probe;
 *   - a StorageEvent dispatch counter (window.dispatchEvent wrapper that delegates), a bus recorder
 *     (web:shell:module-change and the other shell/dashboard events) and a capture-phase dragstart counter;
 *   - a download harness (URL.createObjectURL/revokeObjectURL and HTMLAnchorElement.click are observed; nothing
 *     navigates);
 *   - a read-only coordinator probe: it walks React's committed fiber tree from the render container to the
 *     DepartureCoordinator fiber and reads its guard ref and guardVersion state (the upstream registration counter of
 *     the protected, byte-unchanged coordinator). It never calls a guard member and changes nothing;
 *   - the Topbar census (contract section 12 rule 11) and per-case census and recorder records;
 *   - jsdom shims: Node's AbortController, ResizeObserver, requestAnimationFrame, matchMedia, a MouseEvent-based
 *     PointerEvent (as the dashboard-grid package's own setup), HTMLDialogElement showModal/close, and network refusals
 *     with attempt counters.
 *
 * Error vocabulary: an Error whose message starts with "PRECONDITION:" is a fixture or selector failure and never a
 * product result. Business assertions are Vitest expectations whose message names the contract clause or hypothesis
 * (H1-H6, section 5-7, row a-q...). "OBSERVED <label> <json>" console lines record facts; they never assert.
 */
import * as React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { expect, vi } from "vitest";
// RouterProvider comes from "react-router", the entry the production route modules import (accepted harness ruling).
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { transferableAbortController } from "node:util";
import { accountScope, generationMarkerKey, prefMutationLockName } from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";
// The protected coordinator component, imported only to identify its fiber (read-only probe).
import { DepartureCoordinator } from "../../../apps/web/src/routes/modules/departureCoordinator";

// ---------------------------------------------------------------------------------------------------
// Validity helpers
// ---------------------------------------------------------------------------------------------------

export function pre(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`PRECONDITION: ${message}`);
}
export function need<T>(value: T | null | undefined, message: string): T {
  pre(value !== null && value !== undefined, message);
  return value;
}
export async function flush(rounds = 12): Promise<void> {
  await act(async () => {
    for (let round = 0; round < rounds; round += 1) await new Promise<void>(resolve => setTimeout(resolve, 0));
  });
}
/** Real time passes (the Dashboard ticks `now` once per second through window.setInterval). */
export async function waitReal(ms: number): Promise<void> {
  await act(async () => { await new Promise<void>(resolve => setTimeout(resolve, ms)); });
  await flush();
}
/** A fact recorded in the log; never an assertion. */
export function observed(label: string, fact: unknown): void {
  console.info(`OBSERVED ${label} ${JSON.stringify(fact)}`);
}

// ---------------------------------------------------------------------------------------------------
// Identity, keys, domains and the contract's normative wording (stated independently)
// ---------------------------------------------------------------------------------------------------

export const OWNER = "clock-host-parent-A";
export const OTHER = "clock-host-parent-B";
export const GENERATION = "g1";
/** Precomputed outside every Storage wrapper (F-B002). */
export const MARKER_KEY = generationMarkerKey(OWNER);
export const DASHBOARD = "/app/dashboard";
export const TASKS = "/app/tasks";
export const CALENDAR = "/app/calendar";

export type Lang = "en" | "zh";
export type Field = "style" | "timezone";
export const FIELDS: readonly Field[] = ["style", "timezone"];
/** Contract section 2: device keys, physical key = logical key. */
export const STYLE_KEY = "xai_clock_style";
export const TZ_KEY = "xai_clock_tz";
export const KEY: Readonly<Record<Field, string>> = { style: STYLE_KEY, timezone: TZ_KEY };
export const CLOCK_KEYS: readonly string[] = [STYLE_KEY, TZ_KEY];
/** Per-key lock names (prefMutation.ts:153), computed at module load, before any wrapper is installed. */
export const LOCK: Readonly<Record<Field, string>> = { style: prefMutationLockName(STYLE_KEY), timezone: prefMutationLockName(TZ_KEY) };
export const RAIL_KEY = "xai_rail_order";
export const RAIL_LOCK = prefMutationLockName(RAIL_KEY);
export const THEME_KEY = "xai_pref_theme";
export const THEME_LOCK = prefMutationLockName(THEME_KEY);
export const APPEARANCE_KEYS: readonly string[] = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_accent_hue", "xai_bg_tone", "xai_rail_pos", "xai_pref_font_scale"];
export const DASH_ORDER_KEY = "xai_dash_order";
/** The Dashboard order used by every case (in-domain: two registered widget ids; the Mini Calendar carries goTo). */
export const DASH_ORDER: readonly string[] = ["clock", "mini-cal"];
export const NOTE_X_KEY = "xai_pref_dashboard_header_note_x";
/** The identity channel of AccountStorageGate.tsx:8, 39. */
export const IDENTITY_KEY = "xai:auth:identity-change";

/** Contract section 2 strict domains and defaults. */
export const STYLES: readonly string[] = ["classic", "split", "minimal", "analog"];
export const TZS: readonly string[] = ["local", "shanghai", "london", "new_york", "tokyo", "sf", "paris", "sydney", "berlin", "dubai", "singapore", "hk", "la"];
export const DOMAIN: Readonly<Record<Field, readonly string[]>> = { style: STYLES, timezone: TZS };
export const DEFAULTS: Readonly<Record<Field, string>> = { style: "classic", timezone: "local" };
/** Contract section 5 item 2: exactly these malformed bytes per key (source-truth cases only). */
export const MALFORMED: Readonly<Record<Field, readonly string[]>> = {
  style: ["bogus", "Analog", "", " classic", "\"analog\""],
  timezone: ["mars", "Shanghai", "UTC+8", "Asia/Shanghai", "new-york", "", "\"local\""],
};
export const inDomain = (field: Field, value: string): boolean => DOMAIN[field].includes(value);
/** Timezone labels (tokens i18n "Local time"; city names from cityLibrary.ts:18-31), EN only in this host. */
export const TZ_LABEL: Readonly<Record<string, string>> = { local: "Local time", shanghai: "Shanghai", london: "London", new_york: "New York", tokyo: "Tokyo", sf: "San Francisco", paris: "Paris", sydney: "Sydney", berlin: "Berlin", dubai: "Dubai", singapore: "Singapore", hk: "Hong Kong", la: "Los Angeles" };

/** Contract section 5 normative wording (EN). */
export const W = {
  label: { style: "Clock style", timezone: "Clock timezone" } as Readonly<Record<Field, string>>,
  notSaved: (label: string) => `${label} was not saved.`,
  source: (label: string) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
  retry: (label: string) => `Retry ${label}`,
  discard: (label: string) => `Discard ${label}`,
  reload: (label: string) => `Reload ${label}`,
  exportName: "Export Clock draft",
  participant: "Clock",
  combined: "Dashboard",
  header: "Dashboard header",
} as const;
/** The coordinator's existing templates (departureCoordinator.tsx:290-294). */
export const DIALOG = {
  text: (label: string) => `${label} has unsaved changes.`,
  aria: (label: string) => `Unsaved ${label} draft`,
  stay: "Stay",
  exportDraft: "Export current draft",
  discard: "Discard local changes and leave",
} as const;
/** Contract section 8 envelope (set entries only; style then timezone). */
export function envelope(changes: Partial<Record<Field, string>>): unknown {
  const device: Record<string, unknown> = {};
  if (changes.style !== undefined) device.style = { operation: "set", value: changes.style };
  if (changes.timezone !== undefined) device.timezone = { operation: "set", value: changes.timezone };
  return { version: 1, kind: "clock-draft", changes: { device } };
}
/** The protected sign-out confirm texts (railOrderCopy.ts:56/:73; appearanceRecoveryCopy.ts:71/:98), rule 12. */
export const CONFIRM_TEXT = {
  rail: ["Your sidebar order change is not saved. Sign out and discard it?", "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？"],
  appearance: ["Some appearance changes are not saved. Sign out and discard them?", "部分外观更改尚未保存。仍要退出并放弃这些更改吗？"],
} as const;
/** The rail-order status accessible name for a draft (railOrderCopy.ts statusDraftName, EN). */
export const RAIL_STATUS_DRAFT_NAME = "Sidebar order not saved. Review it.";
/** Accepted Header wording (DashHeader.tsx:134-135, :894) and the accepted Header fixture seeds. */
export const HEADER = { edit: "Edit dashboard note", save: "Save dashboard note", retry: "Retry note save" } as const;
export const HEADER_ORIGINAL = "Original note";
export const HEADER_DRAFT = "Latest unsaved note";
/** The Header's accepted export of the fixture's failed note save (version 1, noteOffset 0). */
export const HEADER_EXPORT = { version: 1, kind: "dashboard-note-draft", note: HEADER_DRAFT, noteOffset: 0 } as const;
/** plugin-web-tokens i18n `nav.*` (the rail buttons' accessible names) for the modules this host uses. */
export const NAV: Readonly<Record<string, string>> = { tasks: "Tasks", calendar: "Calendar", dashboard: "Dashboard", habits: "Habits", board: "Boards" };
/** Shell labels (avatar menu, sign-out dialog, Clock widget shell). */
export const SHELL = { avatar: "Open account menu", signOut: "Sign Out", clockShell: "Clock widget", removeClock: "Remove Clock widget from dashboard", search: "Search" } as const;

// ---------------------------------------------------------------------------------------------------
// Attempt-logging Storage injector (F-B002: record, then delegate exactly once)
// ---------------------------------------------------------------------------------------------------

export type StorageOp = "get" | "set" | "remove";
export interface Attempt { readonly seq: number; readonly op: StorageOp; readonly key: string; readonly value?: string; threw: boolean }
export interface Fault {
  readonly op: StorageOp | "any";
  readonly key: string | null;
  readonly label: string;
  remaining: number;
  fired: number;
  active: boolean;
  off(): void;
}

const NATIVE_GET = Storage.prototype.getItem;
const NATIVE_SET = Storage.prototype.setItem;
const NATIVE_REMOVE = Storage.prototype.removeItem;
let LOCAL: Storage | null = null;
export const ledger: { attempts: Attempt[]; faults: Fault[]; depth: number; nested: number; delegated: number } = { attempts: [], faults: [], depth: 0, nested: 0, delegated: 0 };

function intercept(op: StorageOp, area: Storage, key: unknown, value?: unknown): void {
  if (area !== LOCAL) return;
  const attempt: Attempt = op === "set"
    ? { seq: ledger.attempts.length, op, key: String(key), value: String(value), threw: false }
    : { seq: ledger.attempts.length, op, key: String(key), threw: false };
  ledger.attempts.push(attempt);
  for (const entry of ledger.faults) {
    if (!entry.active || entry.remaining === 0) continue;
    if (entry.op !== "any" && entry.op !== op) continue;
    if (entry.key !== null && entry.key !== attempt.key) continue;
    entry.fired += 1;
    if (entry.remaining > 0) entry.remaining -= 1;
    attempt.threw = true;
    throw op === "set"
      ? new DOMException(`clock-host fault: ${entry.label}`, "QuotaExceededError")
      : new DOMException(`clock-host fault: ${entry.label}`, "SecurityError");
  }
}
const wrappedGet = function getItem(this: Storage, key: string): string | null {
  ledger.depth += 1;
  if (ledger.depth > 1) ledger.nested += 1;
  try {
    intercept("get", this, key);
    ledger.delegated += 1;
    return NATIVE_GET.call(this, key);
  } finally {
    ledger.depth -= 1;
  }
};
const wrappedSet = function setItem(this: Storage, key: string, value: string): void {
  ledger.depth += 1;
  if (ledger.depth > 1) ledger.nested += 1;
  try {
    intercept("set", this, key, value);
    ledger.delegated += 1;
    NATIVE_SET.call(this, key, value);
  } finally {
    ledger.depth -= 1;
  }
};
const wrappedRemove = function removeItem(this: Storage, key: string): void {
  ledger.depth += 1;
  if (ledger.depth > 1) ledger.nested += 1;
  try {
    intercept("remove", this, key);
    ledger.delegated += 1;
    NATIVE_REMOVE.call(this, key);
  } finally {
    ledger.depth -= 1;
  }
};
function installStorage(): void {
  LOCAL = window.localStorage;
  Storage.prototype.getItem = wrappedGet;
  Storage.prototype.setItem = wrappedSet;
  Storage.prototype.removeItem = wrappedRemove;
}
function uninstallStorage(): void {
  Storage.prototype.getItem = NATIVE_GET;
  Storage.prototype.setItem = NATIVE_SET;
  Storage.prototype.removeItem = NATIVE_REMOVE;
}
export const storageInstalled = (): boolean => Storage.prototype.getItem === wrappedGet && Storage.prototype.setItem === wrappedSet && Storage.prototype.removeItem === wrappedRemove;

/** Arms a fault. `times` -1 (default) fires on every matching attempt until off(). */
export function fault(op: StorageOp | "any", key: string | null, label: string, times = -1): Fault {
  const entry: Fault = { op, key, label, remaining: times, fired: 0, active: true, off() { entry.active = false; } };
  ledger.faults.push(entry);
  return entry;
}
export function fired(entry: Fault, what: string, atLeast = 1): void {
  pre(entry.fired >= atLeast, `${what}: the fault "${entry.label}" was armed and observed (fired ${entry.fired}, expected >= ${atLeast})`);
}
export const mark = (): number => ledger.attempts.length;
const describeWrite = (item: Attempt): string => (item.op === "set" ? `set:${item.key}=${item.value}` : `remove:${item.key}`) + (item.threw ? "!threw" : "");
/** Every set/remove attempt since `from`, optionally restricted to the given keys. */
export function writesSince(from: number, keys?: readonly string[]): string[] {
  return ledger.attempts.slice(from).filter(item => item.op !== "get" && (!keys || keys.includes(item.key))).map(describeWrite);
}
/** Number of read attempts since `from` on the given keys (recorded only; contract ruling: reads are not "attempts"). */
export function readsSince(from: number, keys?: readonly string[]): number {
  return ledger.attempts.slice(from).filter(item => item.op === "get" && (!keys || keys.includes(item.key))).length;
}
/** Bytes read outside the injector (never counted). */
export const raw = (key: string): string | null => NATIVE_GET.call(window.localStorage, key);
export const bytesOf = (field: Field): string | null => raw(KEY[field]);
function nativeSeed(key: string, bytes: string): void {
  NATIVE_SET.call(window.localStorage, key, bytes);
  pre(raw(key) === bytes, `seeded bytes ${key}=${JSON.stringify(bytes)} present`);
}
/** Seed rule (contract section 12 rule 10): every seeded Clock byte is in-domain, except in source-truth cases. */
export function seedClock(field: Field, value: string): void {
  pre(inDomain(field, value), `the seeded ${KEY[field]} value ${JSON.stringify(value)} is in-domain`);
  nativeSeed(KEY[field], value);
}
/** A section 5 item 2 malformed value (source-truth cases only). */
export function seedMalformed(field: Field, value: string): void {
  pre(MALFORMED[field].includes(value) && !inDomain(field, value), `the seeded ${KEY[field]} value ${JSON.stringify(value)} is a section 5 item 2 malformed value`);
  nativeSeed(KEY[field], value);
}
/** Seeds a non-Clock key (Dashboard order, Header note fixture). Never a rail-order or Appearance key. */
export function seedOther(key: string, value: string): void {
  pre(key !== RAIL_KEY && !APPEARANCE_KEYS.includes(key) && !CLOCK_KEYS.includes(key), `${key} is not a Clock, rail-order or Appearance key`);
  nativeSeed(key, value);
}
/** Snapshot of every localStorage key except the excluded ones, read natively. */
export function snapshot(exclude: readonly string[] = CLOCK_KEYS): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const name = window.localStorage.key(index);
    if (name !== null && !exclude.includes(name)) out[name] = raw(name);
  }
  return Object.fromEntries(Object.entries(out).sort(([left], [right]) => left.localeCompare(right)));
}

export interface SelfCheckResult {
  readonly nested: number;
  readonly tripwire: number;
  readonly delegatedPerStep: readonly number[];
  readonly threwPerStep: readonly boolean[];
  readonly logged: readonly string[];
  readonly faultsFired: readonly number[];
  readonly bytesAfterFaultedSet: string | null;
  readonly bytesAfterFaultedRemove: string | null;
  readonly sessionStorageLogged: boolean;
}
const SELF_KEY = "clock-host-selfcheck";
/** Expected self-check result: set, get, remove, faulted set, faulted remove, faulted get, plain get, sessionStorage set, faulted Clock-style set, faulted Clock-tz get. */
export const SELF_CHECK_EXPECTED: SelfCheckResult = {
  nested: 0,
  tripwire: 0,
  delegatedPerStep: [1, 1, 1, 0, 0, 0, 1, 1, 0, 0],
  threwPerStep: [false, false, false, true, true, true, false, false, true, true],
  logged: [
    `set:${SELF_KEY}=1`,
    `get:${SELF_KEY}`,
    `remove:${SELF_KEY}`,
    `set:${SELF_KEY}=2!threw`,
    `remove:${SELF_KEY}!threw`,
    `get:${SELF_KEY}!threw`,
    `get:${SELF_KEY}`,
    `set:${STYLE_KEY}=analog!threw`,
    `get:${TZ_KEY}!threw`,
  ],
  faultsFired: [1, 1, 1, 1, 1],
  bytesAfterFaultedSet: null,
  bytesAfterFaultedRemove: "3",
  sessionStorageLogged: false,
};
/**
 * F-B002 self-check: each wrapper records and delegates exactly once; a faulted attempt is recorded, throws and never
 * delegates (bytes unchanged), including the exact key-scoped Clock faults the cases arm (a quota on a style write and
 * a throwing read of the timezone key); sessionStorage is delegated but never counted; the wrappers never re-enter
 * Storage and never call accountScope.physicalKey or accountScope.capture (tripwires).
 */
export function storageSelfCheck(): SelfCheckResult & { readonly styleBytesAfterFault: string | null } {
  pre(storageInstalled(), "the attempt-logging Storage injector is installed");
  const scope = accountScope as unknown as Record<string, unknown>;
  const physicalKey = scope.physicalKey as (...args: unknown[]) => unknown;
  const capture = scope.capture as (...args: unknown[]) => unknown;
  let tripwire = 0;
  scope.physicalKey = (...args: unknown[]) => { tripwire += 1; return physicalKey(...args); };
  scope.capture = (...args: unknown[]) => { tripwire += 1; return capture(...args); };
  const nestedBefore = ledger.nested;
  const from = mark();
  const delegatedPerStep: number[] = [];
  const threwPerStep: boolean[] = [];
  const step = (run: () => void): void => {
    const before = ledger.delegated;
    let threw = false;
    try { run(); } catch { threw = true; }
    delegatedPerStep.push(ledger.delegated - before);
    threwPerStep.push(threw);
  };
  let bytesAfterFaultedSet: string | null = "unset";
  let bytesAfterFaultedRemove: string | null = "unset";
  let styleBytesAfterFault: string | null = "unset";
  let sessionStorageLogged = true;
  const faults: Fault[] = [];
  const styleBefore = raw(STYLE_KEY);
  try {
    step(() => localStorage.setItem(SELF_KEY, "1"));
    step(() => localStorage.getItem(SELF_KEY));
    step(() => localStorage.removeItem(SELF_KEY));
    faults.push(fault("set", SELF_KEY, "self-check set", 1));
    step(() => localStorage.setItem(SELF_KEY, "2"));
    bytesAfterFaultedSet = raw(SELF_KEY);
    NATIVE_SET.call(window.localStorage, SELF_KEY, "3");
    faults.push(fault("remove", SELF_KEY, "self-check remove", 1));
    step(() => localStorage.removeItem(SELF_KEY));
    bytesAfterFaultedRemove = raw(SELF_KEY);
    faults.push(fault("get", SELF_KEY, "self-check get", 1));
    step(() => localStorage.getItem(SELF_KEY));
    step(() => localStorage.getItem(SELF_KEY));
    const beforeSession = ledger.attempts.length;
    step(() => sessionStorage.setItem(SELF_KEY, "s"));
    sessionStorageLogged = ledger.attempts.length !== beforeSession;
    faults.push(fault("set", STYLE_KEY, "self-check Clock style quota"));
    step(() => localStorage.setItem(STYLE_KEY, "analog"));
    styleBytesAfterFault = raw(STYLE_KEY);
    faults.push(fault("get", TZ_KEY, "self-check Clock timezone read"));
    step(() => localStorage.getItem(TZ_KEY));
  } finally {
    scope.physicalKey = physicalKey;
    scope.capture = capture;
    NATIVE_REMOVE.call(window.localStorage, SELF_KEY);
    NATIVE_REMOVE.call(window.sessionStorage, SELF_KEY);
    for (const entry of faults) entry.off();
  }
  pre(styleBytesAfterFault === styleBefore, "the Clock style quota fault never reaches storage");
  const logged = ledger.attempts.slice(from).map(item => (item.op === "set" ? `set:${item.key}=${item.value}` : `${item.op}:${item.key}`) + (item.threw ? "!threw" : ""));
  return { nested: ledger.nested - nestedBefore, tripwire, delegatedPerStep, threwPerStep, logged, faultsFired: faults.map(entry => entry.fired), bytesAfterFaultedSet, bytesAfterFaultedRemove, sessionStorageLogged, styleBytesAfterFault };
}

// ---------------------------------------------------------------------------------------------------
// Exclusive/shared FIFO Web Lock manager
// ---------------------------------------------------------------------------------------------------

type LockMode = "exclusive" | "shared";
export type LockOwner = "product" | "test";
export interface LockRecord { readonly id: number; readonly name: string; readonly mode: LockMode; readonly owner: LockOwner; state: "waiting" | "held" | "released" | "aborted" | "not-granted" }
interface LockOptionsShape { mode?: string; ifAvailable?: boolean; steal?: boolean; signal?: AbortSignal }
interface Waiter { readonly record: LockRecord; readonly grant: () => void }

export function createLockManager() {
  let nextId = 0;
  const log: LockRecord[] = [];
  const errors: string[] = [];
  const queues = new Map<string, Waiter[]>();
  const holders = new Map<string, Set<LockRecord>>();
  const holdersOf = (name: string): Set<LockRecord> => {
    let set = holders.get(name);
    if (!set) { set = new Set(); holders.set(name, set); }
    return set;
  };
  const grantable = (name: string, mode: LockMode): boolean => {
    const set = holdersOf(name);
    if (set.size === 0) return true;
    return mode === "shared" && Array.from(set).every(record => record.mode === "shared");
  };
  const drain = (name: string): void => {
    const queue = queues.get(name) ?? [];
    while (queue.length > 0) {
      const head = queue[0]!;
      if (!grantable(name, head.record.mode)) return;
      queue.shift();
      head.grant();
      if (head.record.mode === "exclusive") return;
    }
  };
  const schedule = (name: string): void => { queueMicrotask(() => drain(name)); };

  function request<T>(owner: LockOwner, name: string, optionsOrCallback: unknown, maybeCallback?: unknown): Promise<T> {
    const options = (typeof optionsOrCallback === "function" ? {} : (optionsOrCallback ?? {})) as LockOptionsShape;
    const callback = (typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback) as ((lock: unknown) => T | Promise<T>) | undefined;
    if (typeof callback !== "function") {
      errors.push(`request(${String(name)}) without a callback`);
      return Promise.reject(new TypeError("clock-host lock fixture: a callback is required"));
    }
    if (options.steal) errors.push(`steal is unsupported by the fixture (${String(name)})`);
    if (options.mode !== undefined && options.mode !== "exclusive" && options.mode !== "shared") errors.push(`unknown lock mode ${String(options.mode)} (${String(name)})`);
    const mode: LockMode = options.mode === "shared" ? "shared" : "exclusive";
    const record: LockRecord = { id: ++nextId, name: String(name), mode, owner, state: "waiting" };
    log.push(record);
    return new Promise<T>((resolve, reject) => {
      const release = (): void => { holdersOf(record.name).delete(record); record.state = "released"; schedule(record.name); };
      const grant = (): void => {
        record.state = "held";
        holdersOf(record.name).add(record);
        let outcome: T | Promise<T>;
        try { outcome = callback({ name: record.name, mode }); } catch (error) { release(); reject(error); return; }
        Promise.resolve(outcome).then(value => { release(); resolve(value); }, error => { release(); reject(error); });
      };
      if (options.signal?.aborted) { record.state = "aborted"; reject(options.signal.reason ?? new DOMException("Aborted", "AbortError")); return; }
      const queue = queues.get(record.name) ?? [];
      queues.set(record.name, queue);
      if (options.ifAvailable) {
        queueMicrotask(() => {
          if (queue.length === 0 && grantable(record.name, mode)) grant();
          else { record.state = "not-granted"; Promise.resolve().then(() => callback(null)).then(resolve, reject); }
        });
        return;
      }
      const waiter: Waiter = { record, grant };
      options.signal?.addEventListener("abort", () => {
        const index = queue.indexOf(waiter);
        if (index >= 0) { queue.splice(index, 1); record.state = "aborted"; reject(options.signal!.reason ?? new DOMException("Aborted", "AbortError")); }
      }, { once: true });
      queue.push(waiter);
      schedule(record.name);
    });
  }

  return {
    api: {
      request: <T,>(name: string, optionsOrCallback: unknown, callback?: unknown): Promise<T> => request<T>("product", name, optionsOrCallback, callback),
      query: async () => ({
        held: Array.from(holders.values()).flatMap(set => Array.from(set)).map(record => ({ name: record.name, mode: record.mode })),
        pending: Array.from(queues.values()).flat().map(waiter => ({ name: waiter.record.name, mode: waiter.record.mode })),
      }),
    },
    log,
    errors,
    requestAs: request,
    heldBy(name: string): LockOwner | "shared" | null {
      const records = Array.from(holdersOf(name));
      if (records.length === 0) return null;
      return records.length === 1 && records[0]!.mode === "exclusive" ? records[0]!.owner : "shared";
    },
    waiting(name: string, owner?: LockOwner): number { return (queues.get(name) ?? []).filter(waiter => owner === undefined || waiter.record.owner === owner).length; },
    productRequests(from = 0, name?: string): number { return log.slice(from).filter(record => record.owner === "product" && (name === undefined || record.name === name)).length; },
  };
}
export type LockManager = ReturnType<typeof createLockManager>;
let lockManager: LockManager | null = null;
function installLocks(): void {
  const manager = createLockManager();
  lockManager = manager;
  Object.defineProperty(navigator, "locks", { configurable: true, enumerable: true, get: () => manager.api });
}
function uninstallLocks(): void {
  delete (navigator as unknown as { locks?: unknown }).locks;
}
export function locks(): LockManager {
  pre(lockManager, "the Web Lock fixture is installed");
  return lockManager;
}
export const locksInstalled = (): boolean => Boolean(lockManager && (navigator as unknown as { locks?: unknown }).locks === lockManager.api);
export interface Holder { readonly name: string; release(): Promise<void> }
/** The test holds `name` exclusively until release (a real held lock, proven by the fixture's own state). */
export async function hold(name: string): Promise<Holder> {
  const manager = locks();
  let open!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { open = resolve; });
  const ready = new Promise<void>(resolve => { entered = resolve; });
  const task = manager.requestAs<void>("test", name, { mode: "exclusive" }, () => { entered(); return gate; });
  await ready;
  pre(manager.heldBy(name) === "test", `the test exclusively holds ${name}`);
  let released = false;
  return {
    name,
    async release() {
      pre(!released, `${name} is released once`);
      released = true;
      await act(async () => { open(); await task; });
      await flush(24);
    },
  };
}

// ---------------------------------------------------------------------------------------------------
// window.confirm recorder (rule 12), location stub, history counters, runtime errors, console, unload probe
// ---------------------------------------------------------------------------------------------------

export type ConfirmClass = "rail" | "appearance" | "other";
export interface ConfirmRecord { readonly message: string; readonly kind: ConfirmClass; readonly answer: boolean }
export function classifyConfirm(message: string): ConfirmClass {
  if ((CONFIRM_TEXT.rail as readonly string[]).includes(message)) return "rail";
  if ((CONFIRM_TEXT.appearance as readonly string[]).includes(message)) return "appearance";
  return "other";
}
/** Each call records its text, class and answer; it answers the next queued answer, else `fallback`. */
export const confirmer: { calls: ConfirmRecord[]; answers: boolean[]; fallback: boolean } = { calls: [], answers: [], fallback: false };
const recordConfirm = (message?: string): boolean => {
  const answer = confirmer.answers.length > 0 ? confirmer.answers.shift()! : confirmer.fallback;
  confirmer.calls.push({ message: String(message), kind: classifyConfirm(String(message)), answer });
  return answer;
};
let savedConfirm: unknown = null;
export const confirmInstalled = (): boolean => (window.confirm as unknown) === recordConfirm;
export const confirmsByClass = (records: readonly ConfirmRecord[] = confirmer.calls): Record<ConfirmClass, number> => ({
  rail: records.filter(call => call.kind === "rail").length,
  appearance: records.filter(call => call.kind === "appearance").length,
  other: records.filter(call => call.kind === "other").length,
});
export const ZERO_CONFIRMS: Record<ConfirmClass, number> = { rail: 0, appearance: 0, other: 0 };

export const redirects: string[] = [];
let savedLocation: PropertyDescriptor | undefined;
let locationStub: object | null = null;
function installLocation(): void {
  savedLocation = Object.getOwnPropertyDescriptor(window, "location");
  const real = window.location;
  const stub = {
    get href() { return real.href; },
    set href(value: string) { redirects.push(`href:${String(value)}`); },
    get origin() { return real.origin; },
    get protocol() { return real.protocol; },
    get host() { return real.host; },
    get hostname() { return real.hostname; },
    get port() { return real.port; },
    get pathname() { return real.pathname; },
    get search() { return real.search; },
    get hash() { return real.hash; },
    get ancestorOrigins() { return real.ancestorOrigins; },
    assign(url: string | URL) { redirects.push(String(url)); },
    replace(url: string | URL) { redirects.push(`replace:${String(url)}`); },
    reload() { redirects.push("reload"); },
    toString() { return real.href; },
  };
  locationStub = stub;
  Object.defineProperty(window, "location", { configurable: true, get: () => stub, set: (value: unknown) => { redirects.push(`set:${String(value)}`); } });
}
function restoreLocation(): void {
  if (savedLocation) Object.defineProperty(window, "location", savedLocation);
  else delete (window as unknown as { location?: unknown }).location;
  savedLocation = undefined;
  locationStub = null;
}
export const locationStubbed = (): boolean => locationStub !== null && (window.location as unknown) === locationStub;

export const historyCounters = { push: 0, replace: 0 };
let historyTarget: History | null = null;
let nativeReplaceState: ((data: unknown, unused: string, url?: string | URL | null) => void) | null = null;
function installHistoryCounters(): void {
  const target = window.history;
  const proto = Object.getPrototypeOf(target) as History;
  const nativePush = proto.pushState;
  const nativeReplace = proto.replaceState;
  nativeReplaceState = (data, unused, url) => nativeReplace.call(target, data, unused, url);
  Object.defineProperty(target, "pushState", { configurable: true, writable: true, value: function pushState(data: unknown, unused: string, url?: string | URL | null) { historyCounters.push += 1; return nativePush.call(target, data, unused, url); } });
  Object.defineProperty(target, "replaceState", { configurable: true, writable: true, value: function replaceState(data: unknown, unused: string, url?: string | URL | null) { historyCounters.replace += 1; return nativeReplace.call(target, data, unused, url); } });
  historyTarget = target;
}
function uninstallHistoryCounters(): void {
  if (historyTarget) {
    delete (historyTarget as unknown as Record<string, unknown>).pushState;
    delete (historyTarget as unknown as Record<string, unknown>).replaceState;
  }
  historyTarget = null;
}

export const runtimeErrors: string[] = [];
const onWindowError = (event: ErrorEvent): void => { runtimeErrors.push(`window error: ${String(event.error?.message ?? event.message)}`); };
const onRejection = (reason: unknown): void => { runtimeErrors.push(`unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}`); };

/** console.error/console.warn lines that mention a blocker state transition (F1 signature), recorded and delegated. */
export const blockerMessages: string[] = [];
let savedConsole: { error: typeof console.error; warn: typeof console.warn } | null = null;
function installConsole(): void {
  const error = console.error;
  const warn = console.warn;
  savedConsole = { error, warn };
  const watch = (args: unknown[]): void => {
    const text = args.map(value => (value instanceof Error ? value.message : String(value))).join(" ");
    if (/blocker state transition/i.test(text)) blockerMessages.push(text.slice(0, 300));
  };
  console.error = (...args: unknown[]) => { watch(args); error.apply(console, args as []); };
  console.warn = (...args: unknown[]) => { watch(args); warn.apply(console, args as []); };
}
function uninstallConsole(): void {
  if (savedConsole) { console.error = savedConsole.error; console.warn = savedConsole.warn; }
  savedConsole = null;
}

/**
 * Dispatches one cancelable beforeunload. A warning is a canceled event, or an assignment of a non-empty string or
 * `true` to returnValue. Counts the Storage attempts (every operation) made while the listeners run.
 */
export function probeUnload(): { warned: boolean; attempts: number } {
  const from = mark();
  const event = new Event("beforeunload", { cancelable: true });
  let assigned: unknown;
  Object.defineProperty(event, "returnValue", { configurable: true, get: () => (assigned === undefined ? true : assigned), set: (value: unknown) => { assigned = value; } });
  window.dispatchEvent(event);
  const warned = event.defaultPrevented || (typeof assigned === "string" && assigned !== "") || assigned === true;
  return { warned, attempts: ledger.attempts.length - from };
}

// ---------------------------------------------------------------------------------------------------
// StorageEvent dispatch counter, other-document writes, the bus recorder and the dragstart counter
// ---------------------------------------------------------------------------------------------------

export interface Dispatched { readonly key: string | null; readonly localArea: boolean; oracle: boolean }
export const dispatched: Dispatched[] = [];
let nativeDispatch: ((event: Event) => boolean) | null = null;
let oracleSending = false;
const countingDispatch = function dispatchEvent(this: unknown, event: Event): boolean {
  if (event && event.type === "storage") {
    const storageEvent = event as StorageEvent;
    dispatched.push({ key: storageEvent.key ?? null, localArea: storageEvent.storageArea === window.localStorage, oracle: oracleSending });
  }
  return nativeDispatch!.call(window, event);
};
function installDispatch(): void {
  nativeDispatch = window.dispatchEvent;
  (window as unknown as { dispatchEvent: unknown }).dispatchEvent = countingDispatch;
}
function uninstallDispatch(): void {
  if (nativeDispatch) (window as unknown as { dispatchEvent: unknown }).dispatchEvent = nativeDispatch;
  nativeDispatch = null;
}
/** StorageEvents dispatched by anyone but the oracle since `from`. */
export const productStorageEvents = (from = 0): Dispatched[] => dispatched.slice(from).filter(entry => !entry.oracle);
/** Another document's committed write or removal: native bytes change, then a StorageEvent arrives (observed). */
export async function external(key: string, newValue: string | null): Promise<void> {
  const oldValue = raw(key);
  if (newValue === null) NATIVE_REMOVE.call(window.localStorage, key);
  else NATIVE_SET.call(window.localStorage, key, newValue);
  await act(async () => {
    oracleSending = true;
    try { window.dispatchEvent(new StorageEvent("storage", { key, oldValue, newValue, storageArea: window.localStorage })); }
    finally { oracleSending = false; }
  });
  await flush(24);
}

export interface BusEvent { readonly type: string; readonly detail: unknown }
export const bus: BusEvent[] = [];
let busOff: Array<() => void> = [];
const BUS_TYPES = ["web:shell:module-change", "web:settings:preference-changed", "web:dashboard:add-widget-clicked", "web:dashboard:widget-added", "web:shell:pet-toggle"] as const;
function installBus(): void {
  busOff = BUS_TYPES.map(type => onWebEvent(type as never, ((detail: unknown) => { bus.push({ type, detail }); }) as never) as unknown as () => void);
}
function uninstallBus(): void { for (const off of busOff.splice(0)) { try { off(); } catch { /* best effort */ } } }
export const navigationEvents = (from = 0): unknown[] => bus.slice(from).filter(event => event.type === "web:shell:module-change").map(event => event.detail);
export const nonNavigationBus = (from = 0): BusEvent[] => bus.slice(from).filter(event => event.type !== "web:shell:module-change");

export const drags = { starts: 0 };
const onDragStart = (): void => { drags.starts += 1; };

// ---------------------------------------------------------------------------------------------------
// Download harness (object URL and anchor click observed; nothing navigates)
// ---------------------------------------------------------------------------------------------------

export const downloads: { created: string[]; revoked: string[]; clicks: Array<{ name: string; href: string | null; connected: boolean }>; blobs: Map<string, Blob> } = { created: [], revoked: [], clicks: [], blobs: new Map() };
let downloadRestore: Array<() => void> = [];
function patch(target: object, property: string, value: unknown): void {
  const previous = Object.getOwnPropertyDescriptor(target, property);
  Object.defineProperty(target, property, { configurable: true, writable: true, value });
  downloadRestore.push(() => {
    if (previous) Object.defineProperty(target, property, previous);
    else delete (target as Record<string, unknown>)[property];
  });
}
function installDownloads(): void {
  downloads.created.length = 0;
  downloads.revoked.length = 0;
  downloads.clicks.length = 0;
  downloads.blobs.clear();
  let counter = 0;
  patch(URL, "createObjectURL", (blob: Blob) => {
    const url = `blob:clock-host/${++counter}`;
    downloads.created.push(url);
    downloads.blobs.set(url, blob);
    return url;
  });
  patch(URL, "revokeObjectURL", (url: string) => { downloads.revoked.push(String(url)); });
  patch(HTMLAnchorElement.prototype, "click", function click(this: HTMLAnchorElement) {
    downloads.clicks.push({ name: this.download, href: this.getAttribute("href"), connected: this.isConnected });
  });
}
function uninstallDownloads(): void {
  for (const restore of downloadRestore.reverse()) restore();
  downloadRestore = [];
}
function readBlob(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}
export const downloadNames = (from = 0): string[] => downloads.clicks.slice(from).map(click => click.name);
export async function downloadJson(name: string, from = 0): Promise<unknown> {
  const click = downloads.clicks.slice(from).find(entry => entry.name === name);
  pre(click && click.href && downloads.blobs.has(click.href), `a download click for ${name} with a captured blob`);
  return JSON.parse(await readBlob(downloads.blobs.get(click.href)!));
}

// ---------------------------------------------------------------------------------------------------
// jsdom environment shims (no product input) and network refusals
// ---------------------------------------------------------------------------------------------------

export const network = { fetch: 0, xhr: 0, socket: 0, eventSource: 0 };
export const networkAttempts = (): number => network.fetch + network.xhr + network.socket + network.eventSource;
function installEnvironment(): void {
  network.fetch = 0;
  network.xhr = 0;
  network.socket = 0;
  network.eventSource = 0;
  vi.stubGlobal("AbortController", transferableAbortController().constructor);
  vi.stubGlobal("ResizeObserver", class { observe(): void {} unobserve(): void {} disconnect(): void {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 0));
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => clearTimeout(handle));
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
  // jsdom has no PointerEvent. The same MouseEvent-based shim as the dashboard-grid package's own test setup
  // (xai-web-dashboard-grid/src/__tests__/setup.ts), so WidgetShell's pointerdown carries `button` and coordinates.
  if (typeof (globalThis as { PointerEvent?: unknown }).PointerEvent === "undefined") {
    vi.stubGlobal("PointerEvent", class PointerEventShim extends MouseEvent {
      readonly pointerId: number;
      readonly pointerType: string;
      readonly isPrimary: boolean;
      constructor(type: string, init: MouseEventInit & { pointerId?: number; pointerType?: string; isPrimary?: boolean } = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
        this.pointerType = init.pointerType ?? "mouse";
        this.isPrimary = init.isPrimary ?? true;
      }
    });
  }
  vi.stubGlobal("fetch", () => { network.fetch += 1; return Promise.reject(new TypeError("clock-host: network disabled")); });
  vi.stubGlobal("XMLHttpRequest", class { constructor() { network.xhr += 1; throw new TypeError("clock-host: network disabled"); } });
  vi.stubGlobal("WebSocket", class { constructor() { network.socket += 1; throw new TypeError("clock-host: network disabled"); } });
  vi.stubGlobal("EventSource", class { constructor() { network.eventSource += 1; throw new TypeError("clock-host: network disabled"); } });
}
const dialogProto = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
const nativeShowModal = dialogProto.showModal;
const nativeClose = dialogProto.close;
function installDialog(): void {
  dialogProto.showModal = function showModal(this: HTMLDialogElement) { this.setAttribute("open", ""); };
  dialogProto.close = function close(this: HTMLDialogElement) { this.removeAttribute("open"); };
}
function uninstallDialog(): void {
  dialogProto.showModal = nativeShowModal;
  dialogProto.close = nativeClose;
}

// ---------------------------------------------------------------------------------------------------
// Production App mount: the production route table behind a fresh memory data router per mount
// ---------------------------------------------------------------------------------------------------

let routeObjects: RouteObject[] | null = null;
let diagnosticProbe: () => unknown = () => null;
export function configureApp(routes: RouteObject[], probe?: () => unknown): void {
  routeObjects = routes;
  if (probe) diagnosticProbe = probe;
}
type DataRouter = ReturnType<typeof createMemoryRouter>;
export interface AppHandle {
  readonly router: DataRouter;
  readonly commits: Array<{ key: string; pathname: string; action: string }>;
  readonly container: HTMLElement;
  pathname(): string;
  location(): { pathname: string; key: string; state: unknown };
  unmount(): void;
}
const routers: DataRouter[] = [];
let currentContainer: HTMLElement | null = null;
function mountDiagnostics(router: DataRouter): string {
  const text = (selector: string): string | null => {
    const element = document.querySelector(selector);
    return element ? (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120) : null;
  };
  return JSON.stringify({
    routerPath: router.state.location.pathname,
    matches: router.state.matches.map(match => match.route.id),
    scope: accountScope.capture(),
    accountGate: text(".account-data-gate"),
    hostPage: text("main.host-page"),
    topbar: document.querySelector("header.topbar") !== null,
    rail: document.querySelector(".app-rail") !== null,
    body: (document.body.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
    probe: diagnosticProbe(),
  });
}
function assertInstruments(): void {
  pre(routeObjects, "the production route table was configured");
  pre(storageInstalled(), "the attempt-logging Storage injector is installed");
  pre(locksInstalled(), "the Web Lock fixture is installed as navigator.locks");
  pre(confirmInstalled(), "the window.confirm recorder is installed");
  pre(locationStubbed(), "the window.location stub is installed");
  pre(nativeReplaceState, "the history counters are installed");
}
/** Renders the production route table with no shell precondition (used where a crash is a possible subject). */
export async function mountRaw(entries: readonly string[], index = entries.length - 1): Promise<AppHandle> {
  assertInstruments();
  const path = entries[index]!;
  nativeReplaceState!(null, "", path);
  pre(window.location.pathname === path, `the document starts at ${path}`);
  const router = createMemoryRouter(routeObjects!, { initialEntries: [...entries], initialIndex: index });
  routers.push(router);
  const commits: AppHandle["commits"] = [];
  router.subscribe(state => { commits.push({ key: state.location.key, pathname: state.location.pathname, action: String(state.historyAction) }); });
  const result = render(<RouterProvider router={router} />);
  currentContainer = result.container;
  await flush(24);
  return {
    router,
    commits,
    container: result.container,
    pathname: () => router.state.location.pathname,
    location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key, state: router.state.location.state ?? null }),
    unmount: () => { result.unmount(); router.dispose(); },
  };
}
/** Mounts the production App; its route-error check is a business assertion, the rest are preconditions. */
export async function mountApp(entries: readonly string[] = [DASHBOARD], index = entries.length - 1): Promise<AppHandle> {
  const app = await mountRaw(entries, index);
  expect(routeError(), "§5.2 §10.4 the production App renders without the route error boundary").toBeNull();
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER && scope.generation === GENERATION, `AccountDataGate keeps account ${OWNER}/${GENERATION} active (diagnostics ${mountDiagnostics(app.router)})`);
  pre(app.router.state.location.pathname === entries[index], `the router committed ${entries[index]} (diagnostics ${mountDiagnostics(app.router)})`);
  pre(document.querySelector("header.topbar") !== null && railItems() !== null, `the production Shell (Topbar and AppRail) is mounted (diagnostics ${mountDiagnostics(app.router)})`);
  return app;
}
export interface HistoryMark { readonly pushes: number; readonly replaces: number; readonly commits: number; readonly key: string }
export const historyMark = (app: AppHandle): HistoryMark => ({ pushes: historyCounters.push, replaces: historyCounters.replace, commits: app.commits.length, key: app.router.state.location.key });
export const historyMutations = (app: AppHandle, from: HistoryMark): { navigations: number; pushes: number; replaces: number; locationChanged: boolean } => ({
  navigations: new Set(app.commits.slice(from.commits).map(commit => commit.key).filter(key => key !== from.key)).size,
  pushes: historyCounters.push - from.pushes,
  replaces: historyCounters.replace - from.replaces,
  locationChanged: app.router.state.location.key !== from.key,
});
export const NO_HISTORY_MUTATION = { navigations: 0, pushes: 0, replaces: 0, locationChanged: false } as const;
/** Router location commits (distinct keys) since a mark, as "<action>:<pathname>". */
export const departures = (app: AppHandle, from: HistoryMark): string[] => {
  const seen = new Set<string>([from.key]);
  const out: string[] = [];
  for (const commit of app.commits.slice(from.commits)) {
    if (seen.has(commit.key)) continue;
    seen.add(commit.key);
    out.push(`${commit.action}:${commit.pathname}`);
  }
  return out;
};
/** Back and Forward in the memory data router (router.navigate(-1|1); the router commits a POP). */
export async function go(app: AppHandle, delta: -1 | 1): Promise<void> {
  await act(async () => { await app.router.navigate(delta); });
  await flush(24);
}
/** The route error boundary's heading and message, if a route crashed. */
export function routeError(): string | null {
  const heading = Array.from(document.querySelectorAll("main.host-page h1")).find(element => (element.textContent ?? "").startsWith("Route Error"));
  return heading ? `${heading.textContent ?? ""}: ${heading.nextElementSibling?.textContent ?? ""}` : null;
}

// ---------------------------------------------------------------------------------------------------
// Read-only coordinator probe (React's committed fiber tree)
// ---------------------------------------------------------------------------------------------------

interface FiberLike { type: unknown; child: FiberLike | null; sibling: FiberLike | null; memoizedState: HookLike | null; stateNode?: unknown }
interface HookLike { memoizedState: unknown; next: HookLike | null }
function committedRoot(): FiberLike {
  pre(currentContainer, "a render container exists");
  const key = Object.keys(currentContainer).find(name => name.startsWith("__reactContainer$"));
  pre(key, "the render container carries React's root fiber");
  const hostRoot = (currentContainer as unknown as Record<string, FiberLike>)[key];
  const fiberRoot = hostRoot.stateNode as { current?: FiberLike } | undefined;
  pre(fiberRoot?.current, "the FiberRoot exposes its committed (current) tree");
  return fiberRoot.current;
}
export interface CoordinatorState { readonly version: number; readonly guard: { readonly token?: unknown; readonly label?: unknown } | null; readonly intent: unknown }
/**
 * Finds the mounted DepartureCoordinator in the committed tree and reads hook 2 (guardRef), hook 3 (guardVersion) and
 * hook 4 (intentRef) of the protected, byte-unchanged coordinator (departureCoordinator.tsx:73-79). Null when no
 * Dashboard coordinator is mounted.
 */
export function coordinatorState(): CoordinatorState | null {
  const stack: FiberLike[] = [committedRoot()];
  let found: FiberLike | null = null;
  while (stack.length > 0 && !found) {
    const fiber = stack.pop()!;
    if (fiber.type === DepartureCoordinator) { found = fiber; break; }
    if (fiber.sibling) stack.push(fiber.sibling);
    if (fiber.child) stack.push(fiber.child);
  }
  if (!found) return null;
  const hooks: HookLike[] = [];
  for (let hook = found.memoizedState; hook; hook = hook.next) hooks.push(hook);
  const guardRef = hooks[2]?.memoizedState as { current?: unknown } | undefined;
  const intentRef = hooks[4]?.memoizedState as { current?: unknown } | undefined;
  pre(hooks.length >= 6 && guardRef && typeof guardRef === "object" && "current" in guardRef && typeof hooks[3]!.memoizedState === "number"
    && intentRef && typeof intentRef === "object" && "current" in intentRef && typeof hooks[5]!.memoizedState === "number",
  `the DepartureCoordinator hook shape (refs at 2 and 4, versions at 3 and 5; ${hooks.length} hooks)`);
  return { version: hooks[3]!.memoizedState as number, guard: (guardRef.current ?? null) as CoordinatorState["guard"], intent: intentRef.current ?? null };
}
export function coordinator(): CoordinatorState {
  return need(coordinatorState(), "the Dashboard DepartureCoordinator is mounted");
}

// ---------------------------------------------------------------------------------------------------
// The Clock's controls (existing selectors and accessible names, contract section 2)
// ---------------------------------------------------------------------------------------------------

const textOf = (element: Element | null): string => (element?.textContent ?? "").replace(/\s+/g, " ").trim();
/** The source Clock instance (never the drag ghost). */
export function clockRoot(): HTMLElement {
  const roots = Array.from(document.querySelectorAll<HTMLElement>(".w-clock-body")).filter(element => !element.closest('[data-testid="widget-ghost"]'));
  pre(roots.length === 1, `exactly one source Clock .w-clock-body is mounted (got ${roots.length})`);
  return roots[0]!;
}
export const clockMounted = (): boolean => Array.from(document.querySelectorAll(".w-clock-body")).some(element => !element.closest('[data-testid="widget-ghost"]'));
export const ghost = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-testid="widget-ghost"]');
export function styleButton(id: string, root: HTMLElement = clockRoot()): HTMLButtonElement {
  const found = root.querySelectorAll<HTMLButtonElement>(`.clk-style-toggle button[data-clock-style="${id}"]`);
  pre(found.length === 1, `exactly one style button [data-clock-style="${id}"] (got ${found.length})`);
  return found[0]!;
}
export function trigger(root: HTMLElement = clockRoot()): HTMLButtonElement {
  const found = root.querySelectorAll<HTMLButtonElement>(".clk-tz-btn");
  pre(found.length === 1, `exactly one timezone trigger .clk-tz-btn (got ${found.length})`);
  return found[0]!;
}
export const popover = (root: HTMLElement = clockRoot()): HTMLElement | null => root.querySelector<HTMLElement>(".clk-tz-popover");
export function tzItem(id: string, root: HTMLElement = clockRoot()): HTMLButtonElement {
  if (!popover(root)) fireEvent.click(trigger(root));
  const open = popover(root);
  pre(open, "the timezone popover opened");
  const found = open.querySelectorAll<HTMLButtonElement>(`.popover-item[data-tz-id="${id}"]`);
  pre(found.length === 1, `exactly one timezone item [data-tz-id="${id}"] (got ${found.length})`);
  return found[0]!;
}
/** One valid choice through the UI (closure-bound values only; contract section 5 item 3). */
export async function choose(field: Field, value: string): Promise<void> {
  pre(inDomain(field, value), `${field} choice ${value} is in-domain`);
  if (field === "style") fireEvent.click(styleButton(value));
  else fireEvent.click(tzItem(value));
  await flush(24);
}
/** The displayed style: the single face and the single aria-selected button must agree. */
export function shownStyle(root: HTMLElement = clockRoot()): string {
  const faces = STYLES.filter(id => root.querySelector(`[data-testid="clock-${id}"]`));
  const selected = Array.from(root.querySelectorAll<HTMLElement>('.clk-style-toggle button[aria-selected="true"]')).map(element => element.getAttribute("data-clock-style"));
  if (faces.length === 1 && selected.length === 1 && faces[0] === selected[0]) return faces[0]!;
  return `mismatch face=${faces.join(",")} selected=${selected.join(",")}`;
}
/** The displayed timezone: the trigger label and `.clock-sub` must agree. */
export function shownTz(root: HTMLElement = clockRoot()): string {
  const sub = textOf(root.querySelector(".clock-sub"));
  const label = Array.from(trigger(root).querySelectorAll(":scope > span")).map(element => textOf(element)).join("|");
  if (sub !== label) return `mismatch sub=${sub} trigger=${label}`;
  const entry = Object.entries(TZ_LABEL).find(([, text]) => text === sub);
  return entry ? entry[0] : `?${sub}`;
}
export const shown = (field: Field, root: HTMLElement = clockRoot()): string => (field === "style" ? shownStyle(root) : shownTz(root));
export const faceText = (root: HTMLElement = clockRoot()): string => textOf(root.querySelector('[data-testid^="clock-"]')).replace(/\s+/g, "");
export function controlsEnabled(root: HTMLElement = clockRoot()): boolean {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(".clock-toolbar button")).every(button => !button.disabled && button.getAttribute("aria-disabled") !== "true");
}

// ---------------------------------------------------------------------------------------------------
// The recovery surface (contract section 5 stable selectors and normative wording)
// ---------------------------------------------------------------------------------------------------

export const region = (root: HTMLElement = clockRoot()): HTMLElement | null => root.querySelector<HTMLElement>('[data-testid="clock-recovery"]');
export const block = (field: Field, root: HTMLElement = clockRoot()): HTMLElement | null => root.querySelector<HTMLElement>(`[data-clock-recovery="${field}"]`);
export type Action = "retry" | "discard" | "reload";
export function action(field: Field, kind: Action, root: HTMLElement = clockRoot()): HTMLButtonElement | null {
  const container = block(field, root);
  if (!container) return null;
  const name = W[kind](W.label[field]);
  return (within(container).queryAllByRole("button", { name })[0] as HTMLButtonElement | undefined) ?? null;
}
export function exportButton(root: HTMLElement = clockRoot()): HTMLButtonElement | null {
  const element = root.querySelector<HTMLButtonElement>('[data-testid="clock-export-draft"]');
  if (!element) return null;
  return (within(root).queryAllByRole("button", { name: W.exportName }) as HTMLElement[]).includes(element) ? element : null;
}
export interface BlockState { present: boolean; notSaved: boolean; source: boolean; retry: boolean; discard: boolean; reload: boolean }
export function blockState(field: Field, root: HTMLElement = clockRoot()): BlockState {
  const element = block(field, root);
  const content = textOf(element);
  return {
    present: element !== null,
    notSaved: content.includes(W.notSaved(W.label[field])),
    source: content.includes(W.source(W.label[field])),
    retry: action(field, "retry", root) !== null,
    discard: action(field, "discard", root) !== null,
    reload: action(field, "reload", root) !== null,
  };
}
export const FAILED: BlockState = { present: true, notSaved: true, source: false, retry: true, discard: true, reload: false };
export const SOURCE: BlockState = { present: true, notSaved: false, source: true, retry: false, discard: false, reload: true };
export const NONE: BlockState = { present: false, notSaved: false, source: false, retry: false, discard: false, reload: false };
/** No success claim inside the Clock (contract section 5 item 7): the normative non-success phrases are removed first. */
export function successClaim(root: HTMLElement = clockRoot()): boolean {
  let content = textOf(root);
  for (const field of FIELDS) for (const phrase of [W.notSaved(W.label[field]), W.source(W.label[field])]) content = content.split(phrase).join(" ");
  return /saved/i.test(content) || content.includes("已保存") || content.includes("保存成功");
}
/** The whole observable Clock state (used to prove "unchanged"). */
export function clockSnapshot(): unknown {
  const root = clockRoot();
  return {
    style: shownStyle(root),
    timezone: shownTz(root),
    region: region(root) !== null,
    blocks: { style: blockState("style", root), timezone: blockState("timezone", root) },
    exportButton: exportButton(root) !== null,
    popover: popover(root) !== null,
  };
}
export async function click(element: HTMLElement): Promise<void> {
  fireEvent.click(element);
  await flush(24);
}

// ---------------------------------------------------------------------------------------------------
// The coordinator dialog, the AppRail, the Topbar census and the Header
// ---------------------------------------------------------------------------------------------------

export const dialog = (): HTMLElement | null => document.querySelector<HTMLElement>('.settings-departure-dialog[role="dialog"]');
export function dialogState(): { open: boolean; aria: string | null; text: string } {
  const element = dialog();
  return { open: element !== null, aria: element?.getAttribute("aria-label") ?? null, text: textOf(element?.querySelector("p") ?? null) };
}
export const dialogFor = (label: string) => ({ open: true, aria: DIALOG.aria(label), text: DIALOG.text(label) });
export const NO_DIALOG = { open: false, aria: null, text: "" } as const;
export function dialogButton(name: string): HTMLButtonElement {
  const element = dialog();
  pre(element, `the departure dialog is open (for "${name}")`);
  const found = within(element).queryAllByRole("button", { name }) as HTMLButtonElement[];
  pre(found.length === 1, `exactly one dialog button "${name}" (got ${found.length})`);
  return found[0]!;
}
export const railItems = (): HTMLElement | null => document.querySelector<HTMLElement>(".app-rail .rail-items");
export const railButtons = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(".app-rail .rail-items .rail-btn"));
export const railLabels = (): string[] => railButtons().map(element => element.getAttribute("aria-label") ?? "");
/** The rail button of a module, by role and accessible name inside `.rail-items` (exactly one). */
export function railButton(id: string): HTMLElement {
  const items = railItems();
  pre(items, "the AppRail .rail-items is mounted");
  const name = NAV[id] ?? id;
  const found = (within(items).queryAllByRole("button", { name }) as HTMLElement[]).filter(element => element.classList.contains("rail-btn"));
  pre(found.length === 1, `exactly one rail button "${name}" (found ${found.length})`);
  return found[0]!;
}
/** Rule 13: the AppRail departure, selected by accessible name, activated by a single click (never a drag). */
export async function clickRail(id: string): Promise<void> {
  const button = railButton(id);
  pre(!button.classList.contains("dragging"), "the rail button is not .dragging");
  pre(drags.starts === 0, `no rail gesture since mount (dragstart events: ${drags.starts})`);
  fireEvent.click(button);
  await flush(24);
}
export const railStatusAny = (): HTMLElement | null => document.querySelector<HTMLElement>('header.topbar [data-testid="rail-order-status"]');
export const appearanceStatus = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-testid="appearance-status"]');
export type RailExpectation = "absent" | "failed-closed";
export const censusLog: Array<{ tag: string; rail: RailExpectation }> = [];
/**
 * Rule 11: the Appearance status is absent; the rail-order status is absent, except where a case seeds a rail draft on
 * purpose (row q), where it is present with the draft name, closed. A violation is a precondition failure.
 */
export function census(tag: string, rail: RailExpectation = "absent"): void {
  pre(document.querySelector('[data-testid="appearance-status"]') === null, `${tag}: the Appearance status is absent (Topbar census)`);
  const status = document.querySelector<HTMLElement>('[data-testid="rail-order-status"]');
  if (rail === "absent") pre(status === null, `${tag}: the rail-order status is absent (Topbar census)`);
  else pre(status !== null && status.getAttribute("aria-label") === RAIL_STATUS_DRAFT_NAME && status.getAttribute("aria-expanded") === "false", `${tag}: the rail-order status is present for the failed rail draft and closed (Topbar census, row q)`);
  censusLog.push({ tag, rail });
}
/** The Header note's account physical key, computed in setup before the wrappers are installed (F-B002 rule 9). */
export let noteKey = "";
/** A failed Header note save through the Header's own UI (quota scoped to the note key; it stays armed). */
export async function failHeaderSave(): Promise<Fault> {
  const module = document.querySelector<HTMLElement>(".module-dashboard");
  pre(module, "the Dashboard module is mounted");
  const edit = within(module).queryAllByRole("button", { name: HEADER.edit });
  pre(edit.length === 1, `exactly one "${HEADER.edit}" button (got ${edit.length})`);
  fireEvent.click(edit[0]!);
  await flush();
  const input = module.querySelector<HTMLInputElement>(".dash-note input");
  pre(input, "the Header note input opened");
  fireEvent.change(input, { target: { value: HEADER_DRAFT } });
  const noteQuota = fault("set", noteKey, "Header note write denied");
  const save = within(module).queryAllByRole("button", { name: HEADER.save });
  pre(save.length === 1, `exactly one "${HEADER.save}" button (got ${save.length})`);
  fireEvent.click(save[0]!);
  await flush(24);
  fired(noteQuota, "the Header note save");
  pre(raw(noteKey) === HEADER_ORIGINAL, "the Header note bytes are unchanged after the failed save");
  return noteQuota;
}
export function headerRetry(): HTMLElement {
  const module = document.querySelector<HTMLElement>(".module-dashboard");
  pre(module, "the Dashboard module is mounted");
  const found = within(module).queryAllByRole("button", { name: HEADER.retry }) as HTMLElement[];
  pre(found.length === 1, `exactly one "${HEADER.retry}" button (got ${found.length})`);
  return found[0]!;
}
/** A failed Clock choice: a quota fault scoped to that key, armed for every attempt and proven to fire; it stays armed. */
export async function failChoice(field: Field, value: string): Promise<Fault> {
  const injected = fault("set", KEY[field], `${KEY[field]} write denied`);
  await choose(field, value);
  fired(injected, `the ${field} write of ${value}`);
  return injected;
}

// ---------------------------------------------------------------------------------------------------
// Widget drag and removal (pointer events through the real WidgetShell, contract section 3 items 6 and 10)
// ---------------------------------------------------------------------------------------------------

export function clockShell(): HTMLElement {
  const found = Array.from(document.querySelectorAll<HTMLElement>(".dash-grid .widget-shell")).filter(element => element.getAttribute("aria-label") === SHELL.clockShell);
  pre(found.length === 1, `exactly one Clock .widget-shell "${SHELL.clockShell}" (got ${found.length})`);
  return found[0]!;
}
/** Starts a widget drag on the Clock shell's own surface (not on a button or [data-no-drag]). */
export async function startWidgetDrag(): Promise<void> {
  fireEvent.pointerDown(clockShell(), { button: 0, clientX: 5, clientY: 5, pointerId: 1 });
  await flush(2);
  pre(ghost(), "the widget ghost rendered after pointerdown on the Clock shell");
}
/** Moves the pointer away from every (zero-size jsdom) widget box, so no reorder happens, then releases. */
export async function moveWidgetDrag(): Promise<void> {
  await act(async () => { window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5000, clientY: 5000, pointerId: 1 } as PointerEventInit)); });
  await flush(2);
}
export async function endWidgetDrag(): Promise<void> {
  await act(async () => { window.dispatchEvent(new PointerEvent("pointerup", { clientX: 5000, clientY: 5000, pointerId: 1 } as PointerEventInit)); });
  await flush(24);
  pre(ghost() === null, "the widget ghost unmounted after pointerup");
}
export function removeClockButton(): HTMLElement {
  const found = within(clockShell()).queryAllByRole("button", { name: SHELL.removeClock }) as HTMLElement[];
  pre(found.length === 1, `exactly one "${SHELL.removeClock}" button (got ${found.length})`);
  return found[0]!;
}

// ---------------------------------------------------------------------------------------------------
// The rail drag driver (row q only, contract section 12 rule 14: the full jsdom sequence on the real rail nodes)
// ---------------------------------------------------------------------------------------------------

interface TransferStub {
  effectAllowed: string;
  dropEffect: string;
  readonly types: string[];
  readonly files: never[];
  readonly items: never[];
  setData(type: string, value: string): void;
  getData(type: string): string;
  clearData(type?: string): void;
  setDragImage(): void;
}
function transfer(): TransferStub {
  const data = new Map<string, string>();
  return {
    effectAllowed: "uninitialized",
    dropEffect: "none",
    get types() { return Array.from(data.keys()); },
    files: [],
    items: [],
    setData(type, value) { data.set(type, value); },
    getData(type) { return data.get(type) ?? ""; },
    clearData(type) { if (type === undefined) data.clear(); else data.delete(type); },
    setDragImage() {},
  };
}
/**
 * One complete rail drag gesture: dragStart on the button at slot `fromSlot`; dragEnter and dragOver on the button
 * displayed at `toSlot` (re-read before each event); drop on that button (it bubbles to `.rail-items`); dragEnd on the
 * dragged button. Returns the displayed labels before the gesture.
 */
export async function dragRail(fromSlot: number, toSlot: number): Promise<{ initial: string[] }> {
  const initial = railLabels();
  pre(initial.length > Math.max(fromSlot, toSlot) && fromSlot !== toSlot, `rail slots ${fromSlot} and ${toSlot} are displayed and distinct`);
  const fromName = initial[fromSlot]!;
  const byName = (name: string): HTMLElement => {
    const found = railButtons().filter(element => element.getAttribute("aria-label") === name);
    pre(found.length === 1, `exactly one rail button "${name}"`);
    return found[0]!;
  };
  const at = (): HTMLElement => {
    const button = railButtons()[toSlot];
    pre(button, `a rail button is displayed at slot ${toSlot}`);
    return button;
  };
  const data = transfer();
  fireEvent.dragStart(byName(fromName), { dataTransfer: data });
  pre(byName(fromName).classList.contains("dragging"), "dragStart reached the product's rail handler (the dragging class is applied to the source)");
  fireEvent.dragEnter(at(), { dataTransfer: data });
  fireEvent.dragOver(at(), { dataTransfer: data });
  fireEvent.drop(at(), { dataTransfer: data });
  fireEvent.dragEnd(byName(fromName), { dataTransfer: data });
  await flush(24);
  pre(!byName(fromName).classList.contains("dragging"), "dragEnd reached the product's rail handler (the dragging class is cleared)");
  return { initial };
}

// ---------------------------------------------------------------------------------------------------
// The voluntary sign-out and identity
// ---------------------------------------------------------------------------------------------------

/**
 * Opens the avatar menu (only when closed), chooses Sign Out and confirms the existing SignOutConfirmDialog, which
 * calls App.handleSignOut. It does not wait for the sign-out sequence to resolve.
 */
export async function signOut(): Promise<void> {
  const rail = document.querySelector<HTMLElement>(".app-rail");
  pre(rail, "the production AppRail is mounted");
  if (!document.querySelector('.avatar-menu[role="menu"]')) {
    const avatar = Array.from(rail.querySelectorAll<HTMLElement>("button.rail-avatar")).filter(element => element.getAttribute("aria-label") === SHELL.avatar);
    pre(avatar.length === 1, `exactly one avatar menu button (found ${avatar.length})`);
    fireEvent.click(avatar[0]!);
  }
  const menu = document.querySelector<HTMLElement>('.avatar-menu[role="menu"]');
  pre(menu, "the avatar menu opened");
  const items = Array.from(menu.querySelectorAll<HTMLElement>("button.avm-item")).filter(element => (element.textContent ?? "").trim() === SHELL.signOut);
  pre(items.length === 1, `exactly one avatar menu item "${SHELL.signOut}" (found ${items.length})`);
  fireEvent.click(items[0]!);
  const signOutDialog = document.querySelector<HTMLElement>("dialog.xai-sign-out-dialog[open]");
  pre(signOutDialog, "the existing sign-out confirmation dialog opened");
  const confirmButton = signOutDialog.querySelector<HTMLElement>(".xai-sign-out-dialog__btn--confirm");
  pre(confirmButton && (confirmButton.textContent ?? "").trim() === SHELL.signOut, `the sign-out dialog's "${SHELL.signOut}" button`);
  await act(async () => { fireEvent.click(confirmButton); });
  await flush(24);
  pre(document.querySelector("dialog.xai-sign-out-dialog[open]") === null, "the sign-out dialog closed after its confirmation");
}
export const scopeSummary = (): { kind: string; accountId: string | null; generation: string | null; epoch: number } => {
  const scope = accountScope.capture();
  return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
};
export const identityInvalidated = (): boolean => {
  const scope = accountScope.capture();
  return scope.kind === "locked" || scope.accountId !== OWNER;
};

// ---------------------------------------------------------------------------------------------------
// Per-test setup and teardown
// ---------------------------------------------------------------------------------------------------

function resetDocument(): void {
  const root = document.documentElement;
  for (const name of ["data-theme", "data-density", "data-rail-pos", "data-bg-tone", "data-lang"]) root.removeAttribute(name);
  root.style.cssText = "";
}
export function setup(): void {
  uninstallStorage();
  window.localStorage.clear();
  window.sessionStorage.clear();
  ledger.attempts.length = 0;
  ledger.faults.length = 0;
  ledger.depth = 0;
  ledger.nested = 0;
  ledger.delegated = 0;
  confirmer.calls.length = 0;
  confirmer.answers.length = 0;
  confirmer.fallback = false;
  redirects.length = 0;
  runtimeErrors.length = 0;
  blockerMessages.length = 0;
  historyCounters.push = 0;
  historyCounters.replace = 0;
  dispatched.length = 0;
  bus.length = 0;
  drags.starts = 0;
  censusLog.length = 0;
  currentContainer = null;
  resetDocument();
  installEnvironment();
  installDialog();
  installLocks();
  savedConfirm = window.confirm;
  (window as unknown as { confirm: unknown }).confirm = recordConfirm;
  installLocation();
  installHistoryCounters();
  installDispatch();
  installBus();
  installDownloads();
  installConsole();
  document.addEventListener("dragstart", onDragStart, true);
  // Account A has a committed generation marker and is active before mount (a returning signed-in user).
  NATIVE_SET.call(window.localStorage, MARKER_KEY, JSON.stringify({ generation: GENERATION, migrationId: "clock-host-parent", previous: null }));
  const active = accountScope.activate(accountScope.lock(OWNER), GENERATION);
  pre(accountScope.capture() === active && active.kind === "account" && active.accountId === OWNER, `account ${OWNER}/${GENERATION} active before mount`);
  // Precomputed before the wrappers are installed (F-B002 rule 9): the Header note's account physical key.
  noteKey = accountScope.physicalKey("xai_pref_dashboard_header_note");
  pre(noteKey.startsWith("xai:account:v1:") && noteKey.endsWith("xai_pref_dashboard_header_note"), `the Header note's account physical key (${noteKey})`);
  // The accepted Header fixture seeds and an in-domain Dashboard order (seed table, README).
  seedOther(noteKey, HEADER_ORIGINAL);
  seedOther(NOTE_X_KEY, "0");
  seedOther(DASH_ORDER_KEY, JSON.stringify(DASH_ORDER));
  installStorage();
  process.on("unhandledRejection", onRejection);
  window.addEventListener("error", onWindowError);
}
export function teardown(caseName: string): void {
  observed(`census-recorder ${caseName}`, {
    censusChecks: censusLog.length,
    railExpectations: [...new Set(censusLog.map(entry => entry.rail))],
    confirms: confirmsByClass(),
    confirmTexts: confirmer.calls.map(call => `${call.kind}:${call.answer ? "OK" : "Cancel"}`),
    blockerMessages: blockerMessages.length,
  });
  let unmountFailure: unknown = null;
  try { cleanup(); } catch (error) { unmountFailure = error; }
  for (const router of routers.splice(0)) router.dispose();
  const nested = ledger.nested;
  const lockErrors = lockManager?.errors.slice() ?? [];
  uninstallStorage();
  uninstallLocks();
  (window as unknown as { confirm: unknown }).confirm = savedConfirm;
  restoreLocation();
  uninstallHistoryCounters();
  uninstallDispatch();
  uninstallBus();
  uninstallDownloads();
  uninstallConsole();
  uninstallDialog();
  vi.unstubAllGlobals();
  document.removeEventListener("dragstart", onDragStart, true);
  process.off("unhandledRejection", onRejection);
  window.removeEventListener("error", onWindowError);
  resetDocument();
  currentContainer = null;
  if (runtimeErrors.length > 0) console.info(`RUNTIME-ERRORS ${caseName} ${JSON.stringify(runtimeErrors)}`);
  if (unmountFailure) throw unmountFailure;
  if (nested !== 0) throw new Error(`PRECONDITION: F-B002 the Storage wrappers saw ${nested} nested Storage call(s)`);
  if (lockErrors.length > 0) throw new Error(`PRECONDITION: the Web Lock fixture could not serve a request: ${lockErrors.join("; ")}`);
}
