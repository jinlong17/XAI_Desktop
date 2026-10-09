/**
 * Parent-role jsdom host fixture for the AppRail order caller (CP-APPRAIL-01, control-plane batch 57; contract
 * docs/reviews/web-apprail-order-recovery-contract/contract.md r1, sections 5, 6, 7, 9 host rows a, d, g-l, o,
 * 12 "Parent host baseline" and 15 item E3). Imported only by ./host.test.tsx. ./verify-fixed.mjs copies both files
 * into an immutable `git archive` of the product revision under test.
 *
 * Derived from the accepted Appearance parent fixture (../web-appearance-recovery-independent/host-fixture.tsx): the
 * Storage injector, the Web Lock manager, the recorders, the jsdom shims and the production-App mount follow it;
 * the rail, drag, status and sign-out helpers are new and written from the contract text only (no product helper is
 * imported for an expectation).
 *
 * Product under test, loaded unmodified from the archive (nothing in the product or persistence path is mocked):
 *   - the production route table `webHostRouteObjects` behind a fresh memory data router per mount, rendered by
 *     `RouterProvider` from "react-router" (the accepted harness ruling: one pinned React Router instance shared with
 *     the route modules; main.tsx's "react-router/dom" wrapper only adds flushSync). /app renders
 *     ProtectedAppRouteElement -> App -> AccountStorageGate -> AccountDataGate -> CommandPaletteProvider ->
 *     AppearanceProvider + WebShellProvider + Shell (AppRail, Topbar), DesktopPet and CommandPalette; the `app`
 *     route's errorElement is RouteErrorBoundary scope "app";
 *   - the real AppRail with its legacy usePref("xai_rail_order") binding, the real Features filter, the real
 *     Appearance controller, the real @repo/plugin-web-storage hooks, engine, registry, codecs and accountScope.
 * The test file substitutes only the auth-session hook (useWebAuthSession).
 *
 * Test-owned instruments (this file):
 *   - an attempt-logging Storage injector. F-B002 rule (contract section 12): each wrapper records the attempt and
 *     then delegates exactly once to the captured native method; an armed fault throws before delegating and never
 *     reaches storage; the wrappers never call accountScope.physicalKey, getPref, readRawPref, any other Storage
 *     method or any product helper. Every key is precomputed outside the wrappers (`xai_rail_order` and the
 *     Appearance keys are device keys: physical key = logical key). A re-entrancy counter is re-checked in teardown;
 *   - an exclusive/shared FIFO Web Lock manager installed as navigator.locks (the Appearance engine path needs it);
 *   - a window.confirm recorder with a queue of answers, a window.location stub (assign/replace/reload recorded,
 *     every read delegated to the real Location), router-commit and pushState/replaceState counters, a runtime-error
 *     recorder and a beforeunload probe;
 *   - an HTML5 drag driver that fires dragStart -> dragEnter -> dragOver -> drop -> dragEnd on the real rail nodes with
 *     one DataTransfer stub (contract section 12 event-sequence rule);
 *   - jsdom shims: Node's AbortController (router Requests), ResizeObserver, requestAnimationFrame, matchMedia,
 *     HTMLDialogElement showModal/close, and network refusals with attempt counters.
 *
 * Error vocabulary: an Error whose message starts with "PRECONDITION:" is a fixture or selector failure and never a
 * product result. Business assertions are Vitest expectations whose message names the contract clause or hypothesis
 * (H1, H2, H9, A6, section 7, row g...). "OBSERVED <label> <json>" console lines record facts; they never assert.
 */
import * as React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
// RouterProvider comes from "react-router", the entry the production route modules import, so the provider and the
// route elements share one module instance of React Router's contexts (accepted Appearance harness ruling).
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { transferableAbortController } from "node:util";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";

// ---------------------------------------------------------------------------------------------------
// Validity helpers
// ---------------------------------------------------------------------------------------------------

export function pre(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`PRECONDITION: ${message}`);
}

export async function flush(rounds = 12): Promise<void> {
  await act(async () => {
    for (let round = 0; round < rounds; round += 1) await new Promise<void>(resolve => setTimeout(resolve, 0));
  });
}

/** A fact recorded in the log; never an assertion. */
export function observed(label: string, fact: unknown): void {
  console.info(`OBSERVED ${label} ${JSON.stringify(fact)}`);
}

export function user() {
  return userEvent.setup();
}

// ---------------------------------------------------------------------------------------------------
// Identity, keys, the rail registry and the contract's display / reorder / merge rules (stated independently)
// ---------------------------------------------------------------------------------------------------

export const OWNER = "apprail-host-parent-A";
export const GENERATION = "g1";
/** Precomputed outside every Storage wrapper (F-B002). */
export const MARKER_KEY = generationMarkerKey(OWNER);
export const TASKS = "/app/tasks";
export const CALENDAR = "/app/calendar";
export const SETTINGS_APPEARANCE = "/app/settings/appearance";
export const SETTINGS_ABOUT = "/app/settings/about";

/** Contract section 2: device key, physical key = logical key. */
export const RAIL_KEY = "xai_rail_order";
export const THEME_KEY = "xai_pref_theme";
export const APPEARANCE_KEYS: readonly string[] = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_accent_hue", "xai_bg_tone", "xai_rail_pos", "xai_pref_font_scale"];

/** Contract section 2: the rail-visible registry R with all Features on, in railOrder order. */
export const RAIL_IDS: readonly string[] = ["ai", "tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "bookkeeping", "metrics", "habits", "meditation", "countdown", "statistics"];
/** Contract section 2: DEFAULT_RAIL_ORDER, 12 ids. */
export const DEFAULT_RAIL_ORDER: readonly string[] = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics"];
/** In-domain custom order (seed rule): all 14 rail ids, reversed. */
export const REVERSED: readonly string[] = [...RAIL_IDS].reverse();

/** Display order D(S, R) (contract section 2): ids of S in R, in S order; then ids of R not in S, in R order. */
export function display(stored: readonly string[], visible: readonly string[] = RAIL_IDS): string[] {
  const inR = new Set(visible);
  const out: string[] = [];
  for (const id of stored) if (inR.has(id) && !out.includes(id)) out.push(id);
  for (const id of visible) if (!out.includes(id)) out.push(id);
  return out;
}
/**
 * The preview after hovering `to` while dragging `from` (contract section 6 item 2, `reorderArray(P, X, Y)` with
 * dnd.ts's documented semantics: remove X, insert it at Y's original index). Written here, not imported.
 */
export function preview(order: readonly string[], from: string, to: string): string[] {
  if (from === to) return [...order];
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  if (fromIndex < 0 || toIndex < 0) return [...order];
  const next = [...order];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}
/** A2 merge S' = merge(S, R, P), written from the contract text (index slots). Null when P is not a permutation of D(S, R). */
export function merge(stored: readonly string[], visible: readonly string[], dropped: readonly string[]): string[] | null {
  const shown = display(stored, visible);
  if (shown.length !== dropped.length || [...shown].sort().join("\u0000") !== [...dropped].sort().join("\u0000")) return null;
  const inR = new Set(visible);
  const queue = [...dropped];
  const out: string[] = [];
  for (const id of stored) out.push(inR.has(id) ? queue.shift()! : id);
  out.push(...queue);
  return out;
}
export const encode = (order: readonly string[]): string => JSON.stringify(order);

/** plugin-web-tokens i18n `nav.*` (the rail buttons' accessible names). */
export const NAV: Record<"en" | "zh", Record<string, string>> = {
  en: { tasks: "Tasks", habits: "Habits", pomodoro: "Pomodoro", calendar: "Calendar", matrix: "Matrix", countdown: "Countdown", board: "Boards", dashboard: "Dashboard", meditation: "Meditation", statistics: "Statistics", timetrack: "Time Tracker", bookkeeping: "Bookkeeping", metrics: "Metrics", ai: "XAI Chat" },
  zh: { tasks: "任务", habits: "习惯", pomodoro: "番茄钟", calendar: "日历", matrix: "四象限", countdown: "倒计时", board: "项目板", dashboard: "工作台", meditation: "冥想", statistics: "统计", timetrack: "时间追踪", bookkeeping: "记账", metrics: "指标追踪", ai: "XAI 智谈" },
};
export type Lang = "en" | "zh";

/** Normative wording (contract section 5 table). */
export const W = {
  en: {
    statusDraft: "Sidebar order not saved. Review it.",
    statusSource: "Saved sidebar order is unavailable. Review it.",
    confirmSignOut: "Your sidebar order change is not saved. Sign out and discard it?",
  },
  zh: {
    statusDraft: "侧栏顺序未保存，点击查看。",
    statusSource: "已保存的侧栏顺序不可用，点击查看。",
    confirmSignOut: "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？",
  },
} as const;
/** The accepted Appearance caller's wording at 419e56d (appearanceRecoveryCopy.ts), used only to recognise its prompt and status. */
export const AP = {
  en: { confirmSignOut: "Some appearance changes are not saved. Sign out and discard them?", statusName: "Appearance changes not saved. Review them in Settings.", discardTheme: "Discard Theme" },
} as const;

/** Shell labels (plugin-web-tokens i18n `settings.*`, `avatar.*`; AppRail's avatar label). */
export const SHELL = {
  en: { about: "About", appearance: "Appearance", avatar: "Open account menu", signOut: "Sign Out", dark: "Dark" },
} as const;

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
      ? new DOMException(`apprail-host fault: ${entry.label}`, "QuotaExceededError")
      : new DOMException(`apprail-host fault: ${entry.label}`, "SecurityError");
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
/** Bytes read outside the injector (never counted). */
export const raw = (key: string = RAIL_KEY): string | null => NATIVE_GET.call(window.localStorage, key);
export function seed(key: string, bytes: string): void {
  NATIVE_SET.call(window.localStorage, key, bytes);
  pre(raw(key) === bytes, `seeded bytes ${key}=${JSON.stringify(bytes)} present`);
}
/** Seeds an in-domain order (seed rule): a JSON array of distinct strings. */
export function seedOrder(order: readonly string[]): void {
  pre(order.every(id => typeof id === "string") && new Set(order).size === order.length, `seed ${encode(order)} is in-domain (distinct strings)`);
  seed(RAIL_KEY, encode(order));
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
const SELF_KEY = "apprail-host-selfcheck";
/** Expected self-check result: set, get, remove, faulted set, faulted remove, faulted get, plain get, sessionStorage set, faulted rail set. */
export const SELF_CHECK_EXPECTED: SelfCheckResult = {
  nested: 0,
  tripwire: 0,
  delegatedPerStep: [1, 1, 1, 0, 0, 0, 1, 1, 0],
  threwPerStep: [false, false, false, true, true, true, false, false, true],
  logged: [
    `set:${SELF_KEY}=1`,
    `get:${SELF_KEY}`,
    `remove:${SELF_KEY}`,
    `set:${SELF_KEY}=2!threw`,
    `remove:${SELF_KEY}!threw`,
    `get:${SELF_KEY}!threw`,
    `get:${SELF_KEY}`,
    `set:${RAIL_KEY}=["selfcheck"]!threw`,
  ],
  faultsFired: [1, 1, 1, 1],
  bytesAfterFaultedSet: null,
  bytesAfterFaultedRemove: "3",
  sessionStorageLogged: false,
};
/**
 * F-B002 self-check: each wrapper records and delegates exactly once; a faulted attempt is recorded, throws and never
 * delegates (bytes unchanged), including the exact rail-order quota fault the cases arm; sessionStorage is delegated
 * but never counted; the wrappers never re-enter Storage and never call accountScope.physicalKey or
 * accountScope.capture (tripwires).
 */
export function storageSelfCheck(): SelfCheckResult & { readonly railBytesAfterFault: string | null } {
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
  let railBytesAfterFault: string | null = "unset";
  let sessionStorageLogged = true;
  const faults: Fault[] = [];
  const railBefore = raw(RAIL_KEY);
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
    faults.push(fault("set", RAIL_KEY, "self-check rail order quota"));
    step(() => localStorage.setItem(RAIL_KEY, encode(["selfcheck"])));
    railBytesAfterFault = raw(RAIL_KEY);
  } finally {
    scope.physicalKey = physicalKey;
    scope.capture = capture;
    NATIVE_REMOVE.call(window.localStorage, SELF_KEY);
    NATIVE_REMOVE.call(window.sessionStorage, SELF_KEY);
    for (const entry of faults) entry.off();
  }
  pre(railBytesAfterFault === railBefore, "the rail-order quota fault never reaches storage");
  const logged = ledger.attempts.slice(from).map(item => (item.op === "set" ? `set:${item.key}=${item.value}` : `${item.op}:${item.key}`) + (item.threw ? "!threw" : ""));
  return { nested: ledger.nested - nestedBefore, tripwire, delegatedPerStep, threwPerStep, logged, faultsFired: faults.map(entry => entry.fired), bytesAfterFaultedSet, bytesAfterFaultedRemove, sessionStorageLogged, railBytesAfterFault };
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
      return Promise.reject(new TypeError("apprail-host lock fixture: a callback is required"));
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
      await flush();
    },
  };
}

// ---------------------------------------------------------------------------------------------------
// window.confirm recorder (queued answers), window.location stub, history counters, runtime errors, unload probe
// ---------------------------------------------------------------------------------------------------

/** Each call records its text and answers the next queued answer, else `fallback`. */
export const confirmer: { calls: string[]; answers: boolean[]; fallback: boolean } = { calls: [], answers: [], fallback: true };
const recordConfirm = (message?: string): boolean => {
  confirmer.calls.push(String(message));
  return confirmer.answers.length > 0 ? confirmer.answers.shift()! : confirmer.fallback;
};
let savedConfirm: unknown = null;
export const confirmInstalled = (): boolean => (window.confirm as unknown) === recordConfirm;

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

/**
 * Dispatches one cancelable beforeunload. A warning is a canceled event, or an assignment of a non-empty string or
 * `true` to returnValue. Counts the Storage attempts made while the listeners run.
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
  vi.stubGlobal("fetch", () => { network.fetch += 1; return Promise.reject(new TypeError("apprail-host: network disabled")); });
  vi.stubGlobal("XMLHttpRequest", class { constructor() { network.xhr += 1; throw new TypeError("apprail-host: network disabled"); } });
  vi.stubGlobal("WebSocket", class { constructor() { network.socket += 1; throw new TypeError("apprail-host: network disabled"); } });
  vi.stubGlobal("EventSource", class { constructor() { network.eventSource += 1; throw new TypeError("apprail-host: network disabled"); } });
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
  readonly commits: string[];
  pathname(): string;
  unmount(): void;
}
const routers: DataRouter[] = [];
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
/** Renders the production route table at `path` with no shell precondition (used where a crash is the subject, H1). */
export async function mountRaw(path: string): Promise<AppHandle> {
  assertInstruments();
  nativeReplaceState!(null, "", path);
  pre(window.location.pathname === path, `the document starts at ${path}`);
  const router = createMemoryRouter(routeObjects!, { initialEntries: [path] });
  routers.push(router);
  const commits: string[] = [];
  router.subscribe(state => { commits.push(state.location.key); });
  const result = render(<RouterProvider router={router} />);
  await flush(24);
  return { router, commits, pathname: () => router.state.location.pathname, unmount: () => { result.unmount(); router.dispose(); } };
}
/** Mounts the production App at `path`; its route-error check is a business assertion, the rest are preconditions. */
export async function mountApp(path: string): Promise<AppHandle> {
  const app = await mountRaw(path);
  expect(routeError(), "the production App renders without the route error boundary").toBeNull();
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER && scope.generation === GENERATION, `AccountDataGate keeps account ${OWNER}/${GENERATION} active (diagnostics ${mountDiagnostics(app.router)})`);
  pre(app.router.state.location.pathname === path, `the router committed ${path} (diagnostics ${mountDiagnostics(app.router)})`);
  pre(document.querySelector("header.topbar") !== null && railItems() !== null, `the production Shell (Topbar and AppRail) is mounted (diagnostics ${mountDiagnostics(app.router)})`);
  return app;
}
export interface HistoryMark { readonly pushes: number; readonly replaces: number; readonly commits: number; readonly key: string }
export const historyMark = (app: AppHandle): HistoryMark => ({ pushes: historyCounters.push, replaces: historyCounters.replace, commits: app.commits.length, key: app.router.state.location.key });
export const historyMutations = (app: AppHandle, from: HistoryMark): { navigations: number; pushes: number; replaces: number; locationChanged: boolean } => ({
  navigations: new Set(app.commits.slice(from.commits).filter(key => key !== from.key)).size,
  pushes: historyCounters.push - from.pushes,
  replaces: historyCounters.replace - from.replaces,
  locationChanged: app.router.state.location.key !== from.key,
});
export const NO_HISTORY_MUTATION = { navigations: 0, pushes: 0, replaces: 0, locationChanged: false } as const;
export async function back(app: AppHandle): Promise<void> {
  await act(async () => { await app.router.navigate(-1); });
  await flush();
}

/** The route error boundary's heading and message, if a route crashed. */
export function routeError(): string | null {
  const heading = Array.from(document.querySelectorAll("main.host-page h1")).find(element => (element.textContent ?? "").startsWith("Route Error"));
  return heading ? `${heading.textContent ?? ""}: ${heading.nextElementSibling?.textContent ?? ""}` : null;
}

// ---------------------------------------------------------------------------------------------------
// The rail: displayed order, buttons and the HTML5 drag driver (contract sections 6 and 12)
// ---------------------------------------------------------------------------------------------------

export const railItems = (): HTMLElement | null => document.querySelector<HTMLElement>(".app-rail .rail-items");
export const railButtons = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(".app-rail .rail-items .rail-btn"));
const idOfLabel = (label: string): string => {
  for (const lang of ["en", "zh"] as const) {
    const entry = Object.entries(NAV[lang]).find(([, text]) => text === label);
    if (entry) return entry[0];
  }
  return `?${label}`;
};
/** The rail's displayed module ids in DOM order (accessible names mapped back through the nav labels). */
export const railIds = (): string[] => railButtons().map(element => idOfLabel(element.getAttribute("aria-label") ?? ""));
/** The rail button of a module, by role and accessible name inside `.rail-items` (exactly one). */
export function railButton(id: string, lang: Lang = "en"): HTMLElement {
  const items = railItems();
  pre(items, "the AppRail .rail-items is mounted");
  const name = NAV[lang][id] ?? id;
  const found = within(items).queryAllByRole("button", { name }) as HTMLElement[];
  pre(found.length === 1, `exactly one rail button "${name}" (found ${found.length})`);
  return found[0]!;
}
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
export interface DragRecord { readonly initial: string[]; readonly expected: string[]; readonly draggingAtStart: boolean; readonly payload: string }
/**
 * One complete jsdom drag gesture on the real rail nodes: dragStart on `from`; dragEnter and dragOver on the button
 * displayed at `to`'s slot (re-read before each event, as a browser targets whatever is under the pointer); drop on
 * the button at that slot; dragEnd on `from`. Returns the oracle's expected preview P (contract section 6 item 2).
 */
export async function dragRail(from: string, to: string): Promise<DragRecord> {
  const initial = railIds();
  pre(initial.includes(from) && initial.includes(to) && from !== to, `the drag source ${from} and target ${to} are displayed and distinct (${initial.join(",")})`);
  const expected = preview(initial, from, to);
  pre(JSON.stringify(expected) !== JSON.stringify(initial), "the drag changes the order");
  const slot = initial.indexOf(to);
  const at = (): HTMLElement => {
    const button = railButtons()[slot];
    pre(button, `a rail button is displayed at slot ${slot}`);
    return button;
  };
  const data = transfer();
  fireEvent.dragStart(railButton(from), { dataTransfer: data });
  const draggingAtStart = railButton(from).classList.contains("dragging");
  pre(draggingAtStart, "dragStart reached the product's rail handler (the dragging class is applied to the source)");
  fireEvent.dragEnter(at(), { dataTransfer: data });
  fireEvent.dragOver(at(), { dataTransfer: data });
  fireEvent.drop(at(), { dataTransfer: data });
  fireEvent.dragEnd(railButton(from), { dataTransfer: data });
  await flush();
  pre(!railButton(from).classList.contains("dragging"), "dragEnd reached the product's rail handler (the dragging class is cleared)");
  return { initial, expected, draggingAtStart, payload: data.getData("text/plain") };
}

// ---------------------------------------------------------------------------------------------------
// The Topbar rail-order status (contract section 5 stable selectors) and the Appearance draft
// ---------------------------------------------------------------------------------------------------

/** Any element carrying the rail status test id, whatever its name. */
export const railStatusAny = (): HTMLElement | null => document.querySelector<HTMLElement>('header.topbar [data-testid="rail-order-status"]');
/** The rail status button with the section 5 accessible name for a draft or a source issue. */
export function railStatusNamed(kind: "draft" | "source", lang: Lang = "en"): HTMLElement | null {
  const header = document.querySelector<HTMLElement>("header.topbar");
  if (!header) return null;
  const name = kind === "draft" ? W[lang].statusDraft : W[lang].statusSource;
  return (within(header).queryAllByRole("button", { name }) as HTMLElement[]).find(element => element.getAttribute("data-testid") === "rail-order-status") ?? null;
}
export const appearanceStatus = (): HTMLElement | null => document.querySelector<HTMLElement>('header.topbar [data-testid="appearance-status"]');
function topbarTrigger(): HTMLElement {
  const trigger = document.querySelector<HTMLElement>("header.topbar .topbar-pref-trigger");
  pre(trigger, "the Topbar appearance trigger is present");
  return trigger;
}
const topbarDialog = (): HTMLElement | null => document.querySelector<HTMLElement>('header.topbar [role="dialog"]');
/**
 * An Appearance draft through the accepted Appearance controller's own path: a Topbar theme choice "Dark" whose
 * write of `xai_pref_theme` is denied (QuotaExceededError), proven to fire; the popover is closed afterwards. The
 * accepted Topbar Appearance status is a precondition that the draft exists.
 */
export async function appearanceDraft(): Promise<Fault> {
  const quota = fault("set", THEME_KEY, "Appearance theme write denied");
  if (!topbarDialog()) fireEvent.click(topbarTrigger());
  const dialog = topbarDialog();
  pre(dialog, "the Topbar appearance popover opened");
  const options = within(dialog).queryAllByRole("menuitemradio", { name: SHELL.en.dark }) as HTMLElement[];
  pre(options.length === 1, `exactly one Topbar menuitemradio "${SHELL.en.dark}" (found ${options.length})`);
  fireEvent.click(options[0]!);
  await flush();
  fired(quota, "the Appearance theme write");
  if (topbarDialog()) fireEvent.click(topbarTrigger());
  pre(!topbarDialog(), "the Topbar appearance popover closed");
  pre(appearanceStatus() !== null, "the accepted Appearance controller shows its Topbar status for the Appearance draft");
  return quota;
}
/** Discards the Appearance theme draft in the Appearance pane ("Discard Theme"), on /app/settings/appearance. */
export async function discardAppearanceTheme(): Promise<void> {
  const paneRoot = document.querySelector<HTMLElement>('.settings-detail[data-pane="appearance"] .appearance-pane');
  pre(paneRoot, "the Appearance pane is mounted");
  const found = within(paneRoot).queryAllByRole("button", { name: AP.en.discardTheme }) as HTMLElement[];
  pre(found.length === 1, `exactly one "${AP.en.discardTheme}" button (found ${found.length})`);
  fireEvent.click(found[0]!);
  await flush();
  pre(appearanceStatus() === null, "the Appearance draft was discarded (its Topbar status is gone)");
}

// ---------------------------------------------------------------------------------------------------
// Settings sidebar, departure dialog and the voluntary sign-out
// ---------------------------------------------------------------------------------------------------

export function sidebarRow(name: string): HTMLElement {
  const sidebar = document.querySelector<HTMLElement>(".settings-sidebar");
  pre(sidebar, "the Settings sidebar is mounted");
  const found = within(sidebar).queryAllByRole("button", { name }) as HTMLElement[];
  pre(found.length === 1, `exactly one Settings sidebar row "${name}" (found ${found.length})`);
  return found[0]!;
}
export const departureDialog = (): Element | null => document.querySelector(".settings-departure-dialog");
/**
 * Opens the avatar menu (only when closed), chooses Sign Out and confirms the existing SignOutConfirmDialog, which
 * calls App.handleSignOut.
 */
export async function signOut(): Promise<void> {
  const rail = document.querySelector<HTMLElement>(".app-rail");
  pre(rail, "the production AppRail is mounted");
  if (!document.querySelector('.avatar-menu[role="menu"]')) {
    const avatar = Array.from(rail.querySelectorAll<HTMLElement>("button.rail-avatar")).filter(element => element.getAttribute("aria-label") === SHELL.en.avatar);
    pre(avatar.length === 1, `exactly one avatar menu button (found ${avatar.length})`);
    fireEvent.click(avatar[0]!);
  }
  const menu = document.querySelector<HTMLElement>('.avatar-menu[role="menu"]');
  pre(menu, "the avatar menu opened");
  const items = Array.from(menu.querySelectorAll<HTMLElement>("button.avm-item")).filter(element => (element.textContent ?? "").trim() === SHELL.en.signOut);
  pre(items.length === 1, `exactly one avatar menu item "${SHELL.en.signOut}" (found ${items.length})`);
  fireEvent.click(items[0]!);
  const dialog = document.querySelector<HTMLElement>("dialog.xai-sign-out-dialog[open]");
  pre(dialog, "the existing sign-out confirmation dialog opened");
  const confirmButton = dialog.querySelector<HTMLElement>(".xai-sign-out-dialog__btn--confirm");
  pre(confirmButton && (confirmButton.textContent ?? "").trim() === SHELL.en.signOut, `the sign-out dialog's "${SHELL.en.signOut}" button`);
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
  confirmer.fallback = true;
  redirects.length = 0;
  runtimeErrors.length = 0;
  historyCounters.push = 0;
  historyCounters.replace = 0;
  resetDocument();
  installEnvironment();
  installDialog();
  installLocks();
  savedConfirm = window.confirm;
  (window as unknown as { confirm: unknown }).confirm = recordConfirm;
  installLocation();
  installHistoryCounters();
  // Account A has a committed generation marker and is active before mount (a returning signed-in user).
  NATIVE_SET.call(window.localStorage, MARKER_KEY, JSON.stringify({ generation: GENERATION, migrationId: "apprail-host-parent", previous: null }));
  const active = accountScope.activate(accountScope.lock(OWNER), GENERATION);
  pre(accountScope.capture() === active && active.kind === "account" && active.accountId === OWNER, `account ${OWNER}/${GENERATION} active before mount`);
  installStorage();
  process.on("unhandledRejection", onRejection);
  window.addEventListener("error", onWindowError);
}
export function teardown(caseName: string): void {
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
  uninstallDialog();
  vi.unstubAllGlobals();
  process.off("unhandledRejection", onRejection);
  window.removeEventListener("error", onWindowError);
  resetDocument();
  if (runtimeErrors.length > 0) console.info(`RUNTIME-ERRORS ${caseName} ${JSON.stringify(runtimeErrors)}`);
  if (unmountFailure) throw unmountFailure;
  if (nested !== 0) throw new Error(`PRECONDITION: F-B002 the Storage wrappers saw ${nested} nested Storage call(s)`);
  if (lockErrors.length > 0) throw new Error(`PRECONDITION: the Web Lock fixture could not serve a request: ${lockErrors.join("; ")}`);
}
