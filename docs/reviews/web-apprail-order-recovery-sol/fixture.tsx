/**
 * Sol jsdom fixture: AppRail order (`xai_rail_order`), its drag writer and its App-lifetime protection
 * (CP-APPRAIL-01, contract docs/reviews/web-apprail-order-recovery-contract/contract.md r1, sections 2–10 and 12).
 *
 * The product is loaded unmodified from the immutable archive under test: the production route table and `App`
 * composition (AccountStorageGate, AccountDataGate, Shell with AppRail and Topbar, DesktopPet, CmdK, ComposedSettings
 * with the departure coordinator, the real Appearance and Features packages), the real @repo/plugin-web-storage hooks,
 * mutation engine, registry, codecs, ownership and accountScope controller. Nothing in the persistence path is mocked.
 * The test files substitute only the auth-session hook. A standalone AppRail is mounted inside the real
 * WebShellProvider with the production registrations filtered by the real Features filter. The fixture owns only:
 *   - an attempt-counting Storage injector that records every getItem/setItem/removeItem attempt on localStorage
 *     BEFORE delegating exactly once (and before any injected fault throws), with an F-B002 re-entrancy counter;
 *   - an exclusive, asynchronous Web Lock manager installed as navigator.locks, with programmable holds;
 *   - a window.confirm recorder, an instrumented window.dispatchEvent (StorageEvent counter) and a bus spy;
 *   - a beforeunload probe, a download harness, a controllable matchMedia, network refusals;
 *   - real accountScope transitions;
 *   - an HTML5 drag driver that fires the full jsdom sequence dragStart → dragEnter → dragOver (one or more) → drop
 *     → dragEnd on the real DOM nodes with a DataTransfer stub (cancellation omits drop; contract section 12).
 *
 * The rail model below (registry R, default order, display order D(S, R), the A2 index-slot merge, the A5 domain and
 * the reorder used to compute the expected preview) is written from the contract text. It never imports a product
 * helper; expected bytes always come from this file's own merge.
 *
 * F-B002 rule (contract section 12): the storage wrappers record and then delegate exactly once. They never call
 * accountScope.physicalKey, getPref, readRawPref, any other Storage method or any product helper. `xai_rail_order`
 * is a device key (physical key = logical key) and its lock name is computed at module load, before any wrapper is
 * installed. `storageSelfCheck()` proves it and `teardown()` re-asserts zero nested wrapper entries.
 *
 * Any error whose message starts with `PRECONDITION:` is a fixture or selector failure. It is never a product
 * failure. Business assertions carry an `H<n>`, `A<n>`, `P<n>` or `§<n>` tag in their message instead.
 */
import * as React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { transferableAbortController } from "node:util";
import { accountScope, generationMarkerKey, prefMutationLockName, type AccountScope } from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";
import { AppRail, WebShellProvider } from "@repo/xai-web-shell";
import { filterModulesByFeaturePrefs } from "@repo/plugin-web-settings-features-panel";

// ---------------------------------------------------------------------------
// Preconditions and generic helpers
// ---------------------------------------------------------------------------

export function pre(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`PRECONDITION: ${message}`);
}

/** Business presence assertion: fails as a product failure (not a precondition). */
export function need<T>(value: T | null | undefined, message: string): T {
  expect(value ?? null, message).not.toBeNull();
  return value as T;
}

export async function flush(rounds = 12): Promise<void> {
  await act(async () => {
    for (let index = 0; index < rounds; index += 1) await new Promise<void>(resolve => setTimeout(resolve, 0));
  });
}

/** Settles React work and microtasks without a timer turn: "the same frame" for jsdom observations. */
export async function sameFrame(): Promise<void> {
  await act(async () => { await Promise.resolve(); });
}

export function user() {
  return userEvent.setup();
}

/** Evidence line in the Vitest stdout (the runner keeps it in the log). */
export function observe(tag: string, data: unknown): void {
  console.info(`SOL-OBS ${tag} ${JSON.stringify(data)}`);
}

// ---------------------------------------------------------------------------
// Rail model, stated independently of the product (contract sections 2, 4 A2/A5 and 6)
// ---------------------------------------------------------------------------

export type Lang = "en" | "zh";
export const KEY = "xai_rail_order";
/** Computed at module load, before any Storage wrapper exists (F-B002). */
export const LOCK = prefMutationLockName(KEY);
export const LOCK_EXPECTED = "xai:pref:v1:xai_rail_order";

/** Contract section 2: the 14 rail modules of the production registry, in railOrder order. */
export const RAIL_IDS: readonly string[] = ["ai", "tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "bookkeeping", "metrics", "habits", "meditation", "countdown", "statistics"];
/** Contract section 2: DEFAULT_RAIL_ORDER, 12 ids. */
export const DEFAULT_ORDER: readonly string[] = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics"];
/** Contract section 2: the eight Features-toggleable ids. */
export const TOGGLEABLE: readonly string[] = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
/** All 14 rail ids in reverse (the Features oracles' in-domain custom order). */
export const REVERSED: readonly string[] = [...RAIL_IDS].reverse();
/** An in-domain custom order with `board` at index 2 (host row c). */
export const BOARD_AT_2: readonly string[] = ["calendar", "tasks", "board", ...RAIL_IDS.filter(id => !["calendar", "tasks", "board"].includes(id))];

export const NAV: Readonly<Record<Lang, Readonly<Record<string, string>>>> = {
  en: { tasks: "Tasks", habits: "Habits", pomodoro: "Pomodoro", calendar: "Calendar", matrix: "Matrix", countdown: "Countdown", board: "Boards", dashboard: "Dashboard", meditation: "Meditation", statistics: "Statistics", timetrack: "Time Tracker", bookkeeping: "Bookkeeping", metrics: "Metrics", ai: "XAI Chat" },
  zh: { tasks: "任务", habits: "习惯", pomodoro: "番茄钟", calendar: "日历", matrix: "四象限", countdown: "倒计时", board: "项目板", dashboard: "工作台", meditation: "冥想", statistics: "统计", timetrack: "时间追踪", bookkeeping: "记账", metrics: "指标追踪", ai: "XAI 智谈" },
};
export const FEATURE_LABEL: Readonly<Record<string, string>> = { tasks: "Tasks", board: "Boards", dashboard: "Dashboard", calendar: "Calendar", matrix: "Matrix", pomodoro: "Pomodoro", habits: "Habits", meditation: "Meditation" };

/** R for a set of Features-hidden ids, in railOrder order. */
export const visible = (hidden: readonly string[] = []): string[] => RAIL_IDS.filter(id => !hidden.includes(id));
/** Display order D(S, R) (contract section 2): the ids of S that are in R, in S order, then R \ S in R order. */
export function displayOf(stored: readonly string[], rail: readonly string[]): string[] {
  const shown: string[] = [];
  for (const id of stored) if (rail.includes(id) && !shown.includes(id)) shown.push(id);
  for (const id of rail) if (!shown.includes(id)) shown.push(id);
  return shown;
}
/** The preview step of contract section 6 item 2 (same splice semantics as the reused helper, written here). */
export function moveBefore(items: readonly string[], from: string, to: string): string[] {
  if (from === to) return [...items];
  const fromIndex = items.indexOf(from);
  const toIndex = items.indexOf(to);
  if (fromIndex < 0 || toIndex < 0) return [...items];
  const next = [...items];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}
/** True when `candidate` is a permutation of `base`. */
export const isPermutation = (candidate: readonly string[], base: readonly string[]): boolean =>
  candidate.length === base.length && [...candidate].sort().join("\u0000") === [...base].sort().join("\u0000");
/**
 * A2 index-slot merge S' = merge(S, R, P): walk S; an element in R is replaced by the next element of P; an element
 * not in R stays; then append the remaining elements of P. Returns null when P is not a permutation of D(S, R).
 */
export function merge(stored: readonly string[], rail: readonly string[], order: readonly string[]): string[] | null {
  if (!isPermutation(order, displayOf(stored, rail))) return null;
  const result: string[] = [];
  let next = 0;
  for (const id of stored) {
    if (rail.includes(id)) result.push(order[next++]!);
    else result.push(id);
  }
  while (next < order.length) result.push(order[next++]!);
  return result;
}
/** A5 strict domain: a JSON array of strings with no string twice. */
export function inDomain(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string") && new Set(value).size === value.length;
}
export const encode = (order: readonly string[]): string => JSON.stringify(order);

/** P1–P5 and P7 of contract A2, checked for one admitted merge. Returns the failed property names. */
export function propertyFailures(stored: readonly string[], rail: readonly string[], order: readonly string[], merged: unknown): string[] {
  const failures: string[] = [];
  if (!inDomain(merged)) return ["P3 domain (distinct strings)"];
  const filtered = merged.filter(id => rail.includes(id));
  if (JSON.stringify(filtered) !== JSON.stringify(order)) failures.push("P1 filter(S', R) = P");
  stored.forEach((id, index) => { if (!rail.includes(id) && merged[index] !== id) failures.push(`P2 ${id} keeps index ${index}`); });
  const union = new Set([...stored, ...rail]);
  if (merged.length !== union.size || !merged.every(id => union.has(id))) failures.push("P3 set(S') = S ∪ R");
  const expectedLength = stored.length + rail.filter(id => !stored.includes(id)).length;
  if (merged.length !== expectedLength) failures.push("P4 |S'| = |S| + |R \\ S|");
  return failures;
}

// ---------------------------------------------------------------------------
// Normative wording (contract section 5 table)
// ---------------------------------------------------------------------------

export const W = {
  en: {
    statusDraft: "Sidebar order not saved. Review it.",
    statusSource: "Saved sidebar order is unavailable. Review it.",
    panel: "Sidebar order",
    saving: "Sidebar order is saving.",
    notSaved: "Sidebar order was not saved.",
    unavailable: "Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.",
    exportFailed: "Export failed. Please retry.",
    retry: { label: "Retry", name: "Retry sidebar order" },
    discard: { label: "Discard", name: "Discard sidebar order change" },
    export: { label: "Export", name: "Export sidebar order draft" },
    reload: { label: "Reload", name: "Reload sidebar order" },
    confirmSignOut: "Your sidebar order change is not saved. Sign out and discard it?",
    appearanceConfirm: "Some appearance changes are not saved. Sign out and discard them?",
  },
  zh: {
    statusDraft: "侧栏顺序未保存，点击查看。",
    statusSource: "已保存的侧栏顺序不可用，点击查看。",
    panel: "侧栏顺序",
    saving: "侧栏顺序正在保存。",
    notSaved: "侧栏顺序未保存。",
    unavailable: "已保存的侧栏顺序不可用。请重新读取；这不是新的未保存更改。",
    exportFailed: "导出失败，请重试。",
    retry: { label: "重试", name: "重试 侧栏顺序" },
    discard: { label: "放弃", name: "放弃 侧栏顺序更改" },
    export: { label: "导出", name: "导出侧栏顺序草稿" },
    reload: { label: "重新读取", name: "重新读取 侧栏顺序" },
    confirmSignOut: "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？",
    appearanceConfirm: "部分外观更改尚未保存。仍要退出并放弃这些更改吗？",
  },
} as const;
export type Action = "retry" | "discard" | "export" | "reload";
/** Normative not-saved and saving phrases (section 5), removed before looking for a success claim. */
const NOT_SUCCESS_PHRASES: readonly string[] = ["Sidebar order was not saved.", "Sidebar order is saving.", "Order not saved", "侧栏顺序未保存。", "侧栏顺序正在保存。", "顺序未保存"];

// ---------------------------------------------------------------------------
// Attempt-counting Storage injector (F-B002: record, then delegate exactly once)
// ---------------------------------------------------------------------------

export type StorageOp = "get" | "set" | "remove";
export interface Attempt { readonly seq: number; readonly op: StorageOp; readonly key: string; readonly value?: string; threw: boolean }
export interface FaultSpec {
  readonly op: StorageOp | "any";
  readonly key?: string | ((key: string) => boolean);
  /** setItem only: fault only this exact value. */
  readonly value?: string;
  /** Number of times the fault may fire; omitted means unlimited. */
  readonly times?: number;
  /** Arm only after a successful setItem (op "set", optional exact value) or removeItem (op "remove") of this key. */
  readonly after?: { readonly op: "set" | "remove"; readonly key: string; readonly value?: string };
  /** setItem only: throw a generic Error instead of QuotaExceededError. */
  readonly generic?: boolean;
  readonly label: string;
}
export interface Fault extends FaultSpec { fired: number; armed: boolean; remaining: number; active: boolean; off(): void }

export const nativeGet = Storage.prototype.getItem;
export const nativeSet = Storage.prototype.setItem;
export const nativeRemove = Storage.prototype.removeItem;
export const store: { log: Attempt[]; faults: Fault[]; depth: number; nested: number; delegated: number } = { log: [], faults: [], depth: 0, nested: 0, delegated: 0 };

function intercept(op: StorageOp, area: Storage, key: unknown, value?: unknown): void {
  if (area !== localStorage) return;
  const attempt: Attempt = { seq: store.log.length, op, key: String(key), ...(op === "set" ? { value: String(value) } : {}), threw: false };
  store.log.push(attempt);
  for (const entry of store.faults) {
    if (!entry.active || !entry.armed || entry.remaining === 0) continue;
    if (entry.op !== "any" && entry.op !== op) continue;
    if (entry.key !== undefined && (typeof entry.key === "function" ? !entry.key(attempt.key) : entry.key !== attempt.key)) continue;
    if (entry.value !== undefined && attempt.value !== entry.value) continue;
    entry.fired += 1;
    if (entry.remaining > 0) entry.remaining -= 1;
    attempt.threw = true;
    throw op === "set" && !entry.generic ? new DOMException(`apprail-sol ${entry.label}`, "QuotaExceededError") : new Error(`apprail-sol ${entry.label}`);
  }
}
function arm(op: "set" | "remove", key: string, value?: string): void {
  for (const entry of store.faults) {
    if (!entry.active || entry.armed || !entry.after) continue;
    if (entry.after.op !== op || entry.after.key !== key) continue;
    if (op === "set" && entry.after.value !== undefined && entry.after.value !== value) continue;
    entry.armed = true;
  }
}
function enter(): void {
  store.depth += 1;
  if (store.depth > 1) store.nested += 1;
}
const wrappedGet = function getItem(this: Storage, key: string): string | null {
  enter();
  try {
    intercept("get", this, key);
    store.delegated += 1;
    return nativeGet.call(this, key);
  } finally { store.depth -= 1; }
};
const wrappedSet = function setItem(this: Storage, key: string, value: string): void {
  enter();
  try {
    intercept("set", this, key, value);
    store.delegated += 1;
    nativeSet.call(this, key, value);
    if (this === localStorage) arm("set", String(key), String(value));
  } finally { store.depth -= 1; }
};
const wrappedRemove = function removeItem(this: Storage, key: string): void {
  enter();
  try {
    intercept("remove", this, key);
    store.delegated += 1;
    nativeRemove.call(this, key);
    if (this === localStorage) arm("remove", String(key));
  } finally { store.depth -= 1; }
};
function installStorage(): void {
  Storage.prototype.getItem = wrappedGet;
  Storage.prototype.setItem = wrappedSet;
  Storage.prototype.removeItem = wrappedRemove;
}
function uninstallStorage(): void {
  Storage.prototype.getItem = nativeGet;
  Storage.prototype.setItem = nativeSet;
  Storage.prototype.removeItem = nativeRemove;
}
export const storageInstalled = (): boolean => Storage.prototype.getItem === wrappedGet && Storage.prototype.setItem === wrappedSet && Storage.prototype.removeItem === wrappedRemove;

export function fault(spec: FaultSpec): Fault {
  const created: Fault = { ...spec, fired: 0, armed: spec.after === undefined, remaining: spec.times ?? -1, active: true, off() { created.active = false; } };
  store.faults.push(created);
  return created;
}
export function fired(target: Fault, what: string, atLeast = 1): void {
  pre(target.fired >= atLeast, `${what}: fault "${target.label}" armed and observed (fired ${target.fired}, expected >= ${atLeast})`);
}
export const mark = (): number => store.log.length;
export function attempts(from: number, keys?: readonly string[], ops?: readonly StorageOp[]): Attempt[] {
  return store.log.slice(from).filter(item => (!keys || keys.includes(item.key)) && (!ops || ops.includes(item.op)));
}
const describeWrite = (item: Attempt): string => (item.op === "set" ? `set:${item.key}=${item.value}` : `remove:${item.key}`) + (item.threw ? "!threw" : "");
/** Every set/remove attempt on xai_rail_order since `from`, as written bytes ("<remove>" for removes; "!" if it threw). */
export const railWrites = (from: number): string[] => attempts(from, [KEY], ["set", "remove"]).map(item => (item.op === "set" ? item.value! : "<remove>") + (item.threw ? "!" : ""));
/** Every set/remove attempt on any key since `from`. */
export const writes = (from: number): string[] => attempts(from, undefined, ["set", "remove"]).map(describeWrite);
/** Every attempt (get/set/remove) on xai_rail_order since `from`. */
export const railTouches = (from: number): string[] => attempts(from, [KEY]).map(item => `${item.op}:${item.key}`);
/** Attempts on account-namespaced keys (prefix constants; no product helper is called). */
export const accountTouches = (from = 0): string[] => store.log.slice(from).filter(item => item.key.startsWith("xai:account:v1:") || item.key.startsWith("xai:demo:v1:")).map(item => `${item.op}:${item.key}`);

/** Total denial for get/set/remove on every key, proven to fire through the attempt counter. */
export function denyAllStorage(): Fault {
  const denial = fault({ op: "any", label: "total storage denial" });
  const from = mark();
  let thrown = 0;
  for (const run of [() => localStorage.getItem("apprail-sol-probe"), () => localStorage.setItem("apprail-sol-probe", "x"), () => localStorage.removeItem("apprail-sol-probe")]) {
    try { run(); } catch { thrown += 1; }
  }
  pre(thrown === 3 && denial.fired === 3 && attempts(from).length === 3, "total storage denial armed and observed for getItem, setItem and removeItem through the attempt counter");
  return denial;
}

/** The raw bytes of xai_rail_order, read without the injector. */
export const raw = (): string | null => nativeGet.call(localStorage, KEY);
export function seedRaw(value: string): void {
  nativeSet.call(localStorage, KEY, value);
  pre(nativeGet.call(localStorage, KEY) === value, `seeded bytes ${KEY}=${JSON.stringify(value)} present`);
}
/** Seeds an in-domain order (the seed rule: each case asserts the class of its seeds). */
export function seedOrder(order: readonly string[]): void {
  pre(inDomain(order), `the seeded order ${JSON.stringify(order)} is in-domain (A5)`);
  seedRaw(encode(order));
}
/** Seeds a malformed value from the section 5 item 2 table (only in H1/H7/H8/H10 and domain cases). */
export function seedMalformed(value: string): void {
  let decoded: unknown = undefined;
  let parsed = true;
  try { decoded = JSON.parse(value); } catch { parsed = false; }
  pre(!parsed || !inDomain(decoded), `the seeded value ${JSON.stringify(value)} is malformed (outside A5)`);
  seedRaw(value);
}
export function seedKey(key: string, value: string): void {
  nativeSet.call(localStorage, key, value);
  pre(nativeGet.call(localStorage, key) === value, `seeded bytes ${key}=${JSON.stringify(value)} present`);
}
export const featureKey = (id: string): string => `xai_pref_features_${id}`;
/** Seeds the eight Features keys as exactly "true"/"false" (seed rule), hiding the given ids. */
export function seedHidden(hidden: readonly string[]): void {
  pre(hidden.every(id => TOGGLEABLE.includes(id)), `only Features-toggleable ids are hidden (${hidden.join(",")})`);
  for (const id of TOGGLEABLE) seedKey(featureKey(id), hidden.includes(id) ? "false" : "true");
}
/** Snapshot of every localStorage key except the excluded ones, read without the injector. */
export function snapshot(exclude: readonly string[] = [KEY]): Record<string, string | null> {
  const names: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const name = localStorage.key(index);
    if (name !== null && !exclude.includes(name)) names.push(name);
  }
  names.sort();
  return Object.fromEntries(names.map(name => [name, nativeGet.call(localStorage, name)]));
}

/**
 * F-B002 self-check: each wrapper records and delegates exactly once, a faulted attempt never delegates, the
 * wrappers never re-enter Storage and never call accountScope.physicalKey or accountScope.capture.
 */
export function storageSelfCheck(): { nested: number; tripwire: number; delegatedPerCall: number[] } {
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  const scope = accountScope as unknown as Record<string, unknown>;
  const physicalKey = scope.physicalKey;
  const capture = scope.capture;
  let tripwire = 0;
  scope.physicalKey = (...args: unknown[]) => { tripwire += 1; return (physicalKey as (...a: unknown[]) => unknown)(...args); };
  scope.capture = (...args: unknown[]) => { tripwire += 1; return (capture as (...a: unknown[]) => unknown)(...args); };
  const nestedBefore = store.nested;
  const delegatedPerCall: number[] = [];
  const step = (run: () => void): void => {
    const before = store.delegated;
    try { run(); } catch { /* faulted attempts throw by design */ }
    delegatedPerCall.push(store.delegated - before);
  };
  try {
    step(() => localStorage.setItem(KEY, "[]"));
    step(() => localStorage.getItem(KEY));
    const setFault = fault({ op: "set", key: KEY, times: 1, label: "selfcheck set" });
    step(() => localStorage.setItem(KEY, '["tasks"]'));
    const getFault = fault({ op: "get", key: KEY, times: 1, after: { op: "remove", key: KEY }, label: "selfcheck read after remove" });
    step(() => localStorage.getItem(KEY));
    step(() => localStorage.removeItem(KEY));
    step(() => localStorage.getItem(KEY));
    step(() => localStorage.getItem(KEY));
    const denial = fault({ op: "any", label: "selfcheck denial" });
    step(() => localStorage.getItem(KEY));
    step(() => localStorage.setItem(KEY, "[]"));
    step(() => localStorage.removeItem(KEY));
    denial.off();
    pre(setFault.fired === 1 && getFault.fired === 1 && denial.fired === 3, "self-check faults fired exactly as programmed");
  } finally {
    scope.physicalKey = physicalKey;
    scope.capture = capture;
  }
  return { nested: store.nested - nestedBefore, tripwire, delegatedPerCall };
}
/** Expected delegate counts for the steps of storageSelfCheck (1 = delegated once; 0 = faulted, never delegated). */
export const SELF_CHECK_DELEGATION: readonly number[] = [1, 1, 0, 1, 1, 0, 1, 0, 0, 0];

// ---------------------------------------------------------------------------
// Exclusive asynchronous Web Lock fixture with programmable holds
// ---------------------------------------------------------------------------

type LockMode = "exclusive" | "shared";
export type LockOwner = "test" | "product";
export interface LockRecord { readonly id: number; readonly name: string; readonly mode: LockMode; readonly owner: LockOwner; state: "waiting" | "held" | "released" | "rejected" | "aborted" | "not-granted" }
type LockCallback<T> = (lock: { name: string; mode: LockMode } | null) => T | Promise<T>;
interface LockOptionsShape { mode?: LockMode; ifAvailable?: boolean; steal?: boolean; signal?: AbortSignal }
interface Waiter { record: LockRecord; grant: () => void }
export interface Holder { readonly name: string; release(): Promise<void> }
export interface Plan {
  readonly name: string;
  grant: number;
  triggered: boolean;
  held: boolean;
  waitHeld(): Promise<void>;
  release(): Promise<void>;
}

export function createLockManager() {
  let nextId = 0;
  const log: LockRecord[] = [];
  const errors: string[] = [];
  const denied = new Set<string>();
  const queues = new Map<string, Waiter[]>();
  const holders = new Map<string, Set<LockRecord>>();
  const plans: Array<Plan & { open: () => void; gate: Promise<void>; entered: () => void; ready: Promise<void> }> = [];
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
    const callback = (typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback) as LockCallback<T> | undefined;
    if (typeof callback !== "function") {
      errors.push(`request(${String(name)}) without a callback`);
      return Promise.reject(new TypeError("apprail-sol lock fixture: callback required"));
    }
    if (options.steal) errors.push(`steal is unsupported by the fixture (${String(name)})`);
    const mode: LockMode = options.mode === "shared" ? "shared" : "exclusive";
    if (owner === "product") {
      const plan = plans.find(entry => entry.name === String(name) && !entry.triggered);
      if (plan) {
        if (plan.grant > 0) plan.grant -= 1;
        else {
          plan.triggered = true;
          void request<void>("test", plan.name, { mode: "exclusive" }, () => { plan.held = true; plan.entered(); return plan.gate; });
        }
      }
    }
    const record: LockRecord = { id: ++nextId, name: String(name), mode, owner, state: "waiting" };
    log.push(record);
    if (owner === "product" && denied.has(record.name)) {
      record.state = "rejected";
      return Promise.reject(new Error(`apprail-sol web lock request rejected (${record.name})`));
    }
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

  const api = {
    request: <T,>(name: string, optionsOrCallback: unknown, callback?: unknown): Promise<T> => request<T>("product", name, optionsOrCallback, callback),
    query: async () => ({
      held: Array.from(holders.values()).flatMap(set => Array.from(set)).map(record => ({ name: record.name, mode: record.mode })),
      pending: Array.from(queues.values()).flat().map(waiter => ({ name: waiter.record.name, mode: waiter.record.mode })),
    }),
  };
  return {
    api,
    log,
    errors,
    requestAs: request,
    deny(name: string): void { denied.add(name); },
    allow(name: string): void { denied.delete(name); },
    heldBy(name: string): LockOwner | "shared" | null {
      const records = Array.from(holdersOf(name));
      if (records.length === 0) return null;
      return records.length === 1 && records[0]!.mode === "exclusive" ? records[0]!.owner : "shared";
    },
    waiting(name: string, owner?: LockOwner): number { return (queues.get(name) ?? []).filter(waiter => owner === undefined || waiter.record.owner === owner).length; },
    productRequests(name?: string, from = 0): number { return log.slice(from).filter(record => record.owner === "product" && (name === undefined || record.name === name)).length; },
    productNames(from = 0): string[] { return Array.from(new Set(log.slice(from).filter(record => record.owner === "product").map(record => record.name))); },
    rejectedFor(name: string, from = 0): number { return log.slice(from).filter(record => record.name === name && record.state === "rejected").length; },
    plan(name: string, grant: number): Plan {
      let open!: () => void;
      let entered!: () => void;
      const gate = new Promise<void>(resolve => { open = resolve; });
      const ready = new Promise<void>(resolve => { entered = resolve; });
      let released = false;
      const plan = {
        name, grant, triggered: false, held: false, open, gate, entered, ready,
        async waitHeld() { await flush(); pre(plan.triggered && plan.held, `the programmed hold on ${name} engaged (triggered ${plan.triggered}, held ${plan.held})`); },
        async release() {
          pre(!released, `${name} programmed hold released once`);
          released = true;
          await act(async () => { open(); });
          await flush();
        },
      };
      plans.push(plan);
      return plan;
    },
  };
}
export type LockManagerFixture = ReturnType<typeof createLockManager>;
export const lockState: { manager: LockManagerFixture | null; missing: boolean; accesses: number } = { manager: null, missing: false, accesses: 0 };

function installLocks(): LockManagerFixture {
  const manager = createLockManager();
  lockState.manager = manager;
  lockState.missing = false;
  lockState.accesses = 0;
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    enumerable: true,
    get: () => { lockState.accesses += 1; return lockState.missing ? undefined : manager.api; },
  });
  return manager;
}
function uninstallLocks(): void { delete (navigator as unknown as { locks?: unknown }).locks; }
export function locks(): LockManagerFixture {
  pre(lockState.manager, "Web Lock fixture installed");
  return lockState.manager;
}
export function locksInstalled(): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "locks");
  return Boolean(descriptor?.get && lockState.manager);
}
/** The test takes the real named lock exclusively and keeps it until release(). */
export async function hold(name: string): Promise<Holder> {
  const manager = locks();
  let open!: () => void;
  let entered!: () => void;
  const ready = new Promise<void>(resolve => { entered = resolve; });
  const gate = new Promise<void>(resolve => { open = resolve; });
  const task = manager.requestAs<void>("test", name, { mode: "exclusive" }, () => { entered(); return gate; });
  await ready;
  pre(manager.heldBy(name) === "test", `the test exclusively holds ${name}`);
  let released = false;
  return {
    name,
    async release() {
      pre(!released, `${name} released once`);
      released = true;
      await act(async () => { open(); await task; });
      await flush();
    },
  };
}

// ---------------------------------------------------------------------------
// Real accountScope transitions
// ---------------------------------------------------------------------------

export const OWNER_A = "apprail-sol-A";
export const OWNER_B = "apprail-sol-B";
export function marker(owner: string, generation: string, demo = false): void {
  nativeSet.call(localStorage, generationMarkerKey(owner, demo), JSON.stringify({ generation, migrationId: "apprail-sol", previous: null }));
}
export function activate(owner: string, generation = "g1", demo = false): AccountScope {
  marker(owner, generation, demo);
  const scope = accountScope.activate(accountScope.lock(owner), generation, demo);
  pre(accountScope.capture() === scope && scope.kind === (demo ? "demo" : "account") && scope.accountId === owner && scope.generation === generation, `${demo ? "demo" : "account"} scope ${owner}/${generation} active`);
  return scope;
}
export function lockAccount(owner: string | null = "apprail-sol-locked"): AccountScope {
  const scope = accountScope.lock(owner);
  pre(accountScope.capture() === scope && scope.kind === "locked", "account scope locked");
  return scope;
}

// ---------------------------------------------------------------------------
// window.confirm recorder, StorageEvent dispatch counter and bus spy
// ---------------------------------------------------------------------------

export const confirmer: { calls: string[]; answer: boolean; answers: boolean[] } = { calls: [], answer: true, answers: [] };
const recordConfirm = (message?: string): boolean => { confirmer.calls.push(String(message)); return confirmer.answers.length > 0 ? confirmer.answers.shift()! : confirmer.answer; };
let savedConfirm: unknown = null;
function installConfirm(): void {
  savedConfirm = window.confirm;
  (window as unknown as { confirm: unknown }).confirm = recordConfirm;
}
function uninstallConfirm(): void {
  (window as unknown as { confirm: unknown }).confirm = savedConfirm;
}
export const confirmInstalled = (): boolean => (window.confirm as unknown) === recordConfirm;

export interface Dispatched { readonly type: string; readonly key: string | null; readonly localArea: boolean }
export const dispatched: Dispatched[] = [];
let nativeDispatch: ((event: Event) => boolean) | null = null;
const countingDispatch = function dispatchEvent(event: Event): boolean {
  if (event && event.type === "storage") {
    const storageEvent = event as StorageEvent;
    dispatched.push({ type: event.type, key: storageEvent.key ?? null, localArea: storageEvent.storageArea === localStorage });
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
export const dispatchInstalled = (): boolean => (window.dispatchEvent as unknown) === countingDispatch;
const oracleSent = new Set<Dispatched>();
/** StorageEvents dispatched by anyone other than the oracle since `from` (oracle-sent events are excluded). */
export const productStorageEvents = (from = 0): Dispatched[] => dispatched.slice(from).filter(event => !oracleSent.has(event));
/** Simulates another document's committed write or removal: native bytes change, then a StorageEvent arrives. */
export async function external(key: string, newValue: string | null): Promise<void> {
  const oldValue = nativeGet.call(localStorage, key);
  if (newValue === null) nativeRemove.call(localStorage, key);
  else nativeSet.call(localStorage, key, newValue);
  const before = dispatched.length;
  await act(async () => { window.dispatchEvent(new StorageEvent("storage", { key, oldValue, newValue, storageArea: localStorage })); });
  for (const entry of dispatched.slice(before)) oracleSent.add(entry);
  await flush();
}

export interface BusEvent { readonly key: string; readonly value: unknown }
export const bus: { preference: BusEvent[]; moduleChange: Array<{ moduleId: string; source: string }> } = { preference: [], moduleChange: [] };
let busOff: Array<() => void> = [];
function installBus(): void {
  busOff = [
    onWebEvent("web:settings:preference-changed", detail => { bus.preference.push({ key: String((detail as { key: unknown }).key), value: (detail as { value: unknown }).value }); }),
    onWebEvent("web:shell:module-change", detail => { bus.moduleChange.push({ moduleId: String((detail as { moduleId: unknown }).moduleId), source: String((detail as { source: unknown }).source) }); }),
  ];
}
function uninstallBus(): void { for (const off of busOff.splice(0)) off(); }

// ---------------------------------------------------------------------------
// beforeunload, runtime errors and unhandled rejections
// ---------------------------------------------------------------------------

/** Dispatches a cancelable beforeunload; a warning is a canceled event or an assigned non-empty returnValue. */
export function unload(): { warned: boolean; attempts: number } {
  const from = mark();
  const event = new Event("beforeunload", { cancelable: true });
  let assigned: unknown;
  Object.defineProperty(event, "returnValue", { configurable: true, get: () => (assigned === undefined ? true : assigned), set: value => { assigned = value; } });
  window.dispatchEvent(event);
  const warned = event.defaultPrevented || (assigned !== undefined && assigned !== null && assigned !== "" && assigned !== false);
  return { warned, attempts: store.log.length - from };
}
export const warns = (): boolean => unload().warned;
export const rejections: unknown[] = [];
const onRejection = (reason: unknown): void => { rejections.push(reason); };
export const runtimeErrors: string[] = [];
const onWindowError = (event: ErrorEvent): void => { runtimeErrors.push(String(event.error?.message ?? event.message)); };

// ---------------------------------------------------------------------------
// Download harness (object URL, anchor append and click observed; nothing navigates)
// ---------------------------------------------------------------------------

export interface Download {
  readonly created: string[];
  readonly revoked: string[];
  readonly blobs: Blob[];
  readonly clicks: Array<{ download: string; href: string | null; connected: boolean }>;
  hooks: {
    blob?: (phase: "before" | "after") => void;
    create?: () => void;
    beforeAppend?: (node: Node) => void;
    afterAppend?: (node: Node) => void;
    click?: () => void;
  };
  json(index?: number): Promise<unknown>;
  anchorsInDocument(): HTMLAnchorElement[];
}
let restoreDownloadPatches: Array<() => void> = [];
export function restoreDownload(): void {
  for (const restoreOne of restoreDownloadPatches.reverse()) restoreOne();
  restoreDownloadPatches = [];
}
function readBlob(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}
function patchProperty(target: object, property: string, value: unknown): void {
  const previous = Object.getOwnPropertyDescriptor(target, property);
  Object.defineProperty(target, property, { configurable: true, writable: true, value });
  restoreDownloadPatches.push(() => {
    if (previous) Object.defineProperty(target, property, previous);
    else delete (target as Record<string, unknown>)[property];
  });
}
export function download(): Download {
  restoreDownload();
  let counter = 0;
  const harness: Download = {
    created: [],
    revoked: [],
    blobs: [],
    clicks: [],
    hooks: {},
    async json(index = 0) {
      const blob = harness.blobs[index];
      pre(blob, `download blob #${index} captured`);
      return JSON.parse(await readBlob(blob));
    },
    anchorsInDocument() {
      return Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).filter(anchor => anchor.hasAttribute("download") || (anchor.getAttribute("href") ?? "").startsWith("blob:"));
    },
  };
  patchProperty(URL, "createObjectURL", (blob: Blob) => {
    harness.hooks.create?.();
    const url = `blob:apprail-sol/${++counter}`;
    harness.blobs.push(blob);
    harness.created.push(url);
    return url;
  });
  patchProperty(URL, "revokeObjectURL", (url: string) => { harness.revoked.push(String(url)); });
  patchProperty(HTMLAnchorElement.prototype, "click", function click(this: HTMLAnchorElement) {
    harness.clicks.push({ download: this.download, href: this.getAttribute("href"), connected: this.isConnected });
    harness.hooks.click?.();
  });
  const nativeAppendChild = Node.prototype.appendChild;
  const nativeInsertBefore = Node.prototype.insertBefore;
  const nativeAppend = Element.prototype.append;
  const visit = <T,>(nodes: readonly unknown[], run: () => T): T => {
    const anchors = nodes.filter((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement);
    for (const anchor of anchors) harness.hooks.beforeAppend?.(anchor);
    const result = run();
    for (const anchor of anchors) harness.hooks.afterAppend?.(anchor);
    return result;
  };
  patchProperty(Node.prototype, "appendChild", function appendChild<T extends Node>(this: Node, node: T): T {
    return visit([node], () => nativeAppendChild.call(this, node) as T);
  });
  patchProperty(Node.prototype, "insertBefore", function insertBefore<T extends Node>(this: Node, node: T, child: Node | null): T {
    return visit([node], () => nativeInsertBefore.call(this, node, child) as T);
  });
  patchProperty(Element.prototype, "append", function append(this: Element, ...nodes: Array<Node | string>): void {
    visit(nodes, () => nativeAppend.apply(this, nodes));
  });
  return harness;
}
/** Replace the global Blob so the harness can fault or observe Blob construction. */
export function stubBlob(harness: Download): void {
  const NativeBlob = globalThis.Blob;
  class HookedBlob extends NativeBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      harness.hooks.blob?.("before");
      super(parts, options);
      harness.hooks.blob?.("after");
    }
  }
  vi.stubGlobal("Blob", HookedBlob);
}
/** Contract section 8 envelope (only `set` occurs). */
export const envelope = (value: readonly string[]) => ({ version: 1, kind: "rail-order-draft", changes: { device: { railOrder: { operation: "set", value: [...value] } } } });
export async function expectSingleDownload(harness: Download, expected: unknown, tag: string): Promise<void> {
  expect(harness.clicks.length, `${tag}: exactly one download click`).toBe(1);
  expect(harness.clicks[0]?.download, `${tag}: filename rail-order-draft.json`).toBe("rail-order-draft.json");
  expect(harness.created.length, `${tag}: exactly one object URL created`).toBe(1);
  expect(harness.clicks[0]?.href, `${tag}: the anchor targets the created object URL`).toBe(harness.created[0]);
  expect(harness.revoked, `${tag}: that same object URL revoked`).toEqual([harness.created[0]]);
  expect(harness.anchorsInDocument().length, `${tag}: the anchor was removed`).toBe(0);
  expect(await harness.json(0), `${tag}: whole envelope (deep equality)`).toStrictEqual(expected);
}

// ---------------------------------------------------------------------------
// jsdom environment: controllable matchMedia, network refusals, dialog and location stubs
// ---------------------------------------------------------------------------

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
    matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  }));
  vi.stubGlobal("fetch", () => { network.fetch += 1; return Promise.reject(new TypeError("apprail-sol: network disabled")); });
  vi.stubGlobal("XMLHttpRequest", class { constructor() { network.xhr += 1; throw new TypeError("apprail-sol: network disabled"); } });
  vi.stubGlobal("WebSocket", class { constructor() { network.socket += 1; throw new TypeError("apprail-sol: network disabled"); } });
  vi.stubGlobal("EventSource", class { constructor() { network.eventSource += 1; throw new TypeError("apprail-sol: network disabled"); } });
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
export const redirects: string[] = [];
let savedLocation: PropertyDescriptor | undefined;
/** Replaces window.location with a recorder (jsdom cannot navigate). Restored by teardown. */
export function stubLocation(): void {
  if (savedLocation) return;
  savedLocation = Object.getOwnPropertyDescriptor(window, "location");
  const original = window.location;
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { href: original.href, origin: original.origin, protocol: original.protocol, host: original.host, hostname: original.hostname, port: original.port, pathname: original.pathname, search: original.search, hash: original.hash, assign: (url: string) => { redirects.push(String(url)); }, replace: (url: string) => { redirects.push(String(url)); }, reload: () => { redirects.push("reload"); } },
  });
}
function restoreLocation(): void {
  if (savedLocation) Object.defineProperty(window, "location", savedLocation);
  savedLocation = undefined;
}

// ---------------------------------------------------------------------------
// Production App mount (memory router over the production route table) and standalone AppRail
// ---------------------------------------------------------------------------

export const ROUTES = ["/app/tasks", "/app/settings/appearance", "/app/dashboard"] as const;
let routeTable: RouteObject[] | null = null;
/** Each App test file passes the production `webHostRouteObjects` after substituting the auth-session hook. */
export function configureApp(routes: RouteObject[]): void { routeTable = routes; }
export interface App {
  readonly router: ReturnType<typeof createMemoryRouter>;
  readonly locations: Array<{ pathname: string; key: string; action: string }>;
  unmount(): void;
}
const routers: Array<ReturnType<typeof createMemoryRouter>> = [];
export async function mountApp(path: string = "/app/tasks"): Promise<App> {
  pre(routeTable, "the production route table was configured");
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  pre(confirmInstalled(), "window.confirm recorder installed");
  pre(dispatchInstalled(), "window.dispatchEvent StorageEvent counter installed");
  const router = createMemoryRouter(routeTable, { initialEntries: [path] });
  routers.push(router);
  const locations: App["locations"] = [];
  router.subscribe(state => { locations.push({ pathname: state.location.pathname, key: state.location.key, action: state.historyAction }); });
  const result = render(<RouterProvider router={router} />);
  await flush(24);
  return { router, locations, unmount: () => result.unmount() };
}
export function historyMutations(app: App, from: number, startKey: string): string[] {
  return Array.from(new Set(app.locations.slice(from).map(entry => entry.key))).filter(key => key !== startKey);
}
export async function go(app: App, path: string | number): Promise<void> {
  await act(async () => { await (typeof path === "number" ? app.router.navigate(path) : app.router.navigate(path)); });
  await flush(12);
}

/** The production registrations, imported by each test file from the archive (`webShellModuleRegistrations`). */
let registrations: ReadonlyArray<{ moduleId: string; showInRail?: boolean; railOrder?: number }> | null = null;
export function configureRegistrations(list: ReadonlyArray<{ moduleId: string; showInRail?: boolean; railOrder?: number }>): void { registrations = list; }
/** The modules App would pass to WebShellProvider for these hidden ids (the real Features filter). */
export function modulesFor(hidden: readonly string[] = []): never[] {
  pre(registrations, "the production registrations were configured");
  const prefs = Object.fromEntries(TOGGLEABLE.map(id => [id, !hidden.includes(id)]));
  return filterModulesByFeaturePrefs(registrations as Array<{ moduleId: string }>, prefs as never) as never[];
}
export interface Standalone { readonly clicks: string[]; setHidden(hidden: readonly string[]): void; unmount(): void }
/** A standalone AppRail inside the real WebShellProvider (no App, no gate, no rail-order provider; contract A3). */
export async function mountStandalone(hidden: readonly string[] = [], lang: Lang = "en"): Promise<Standalone> {
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  const clicks: string[] = [];
  const noop = (): void => undefined;
  const view = (mods: never[]) => (
    <WebShellProvider modules={mods} lang={lang} railPos="left" petOn={false} setPetOn={noop}>
      <AppRail activeModuleId={null} onModuleClick={(id: string) => { clicks.push(id); }} onPetToggle={noop} onAvatarOpenSettings={noop} onAvatarOpenStatistics={noop} onSignOut={noop} />
    </WebShellProvider>
  );
  const result = render(view(modulesFor(hidden)));
  await flush();
  return {
    clicks,
    setHidden(next) { result.rerender(view(modulesFor(next))); },
    unmount: () => result.unmount(),
  };
}

// ---------------------------------------------------------------------------
// The rail: displayed order, buttons and the HTML5 drag driver
// ---------------------------------------------------------------------------

/** The route error boundary heading, if the `/app` route crashed. */
export function routeError(): string | null {
  const heading = Array.from(document.querySelectorAll("main.host-page h1")).find(element => (element.textContent ?? "").startsWith("Route Error"));
  return heading ? `${heading.textContent ?? ""}: ${heading.nextElementSibling?.textContent ?? ""}` : null;
}
/** The language currently displayed, read from the Topbar trigger title ("Appearance"/"外观"). */
export function uiLang(): Lang {
  const trigger = document.querySelector<HTMLElement>(".topbar .topbar-pref-trigger");
  return trigger?.getAttribute("title") === "外观" ? "zh" : "en";
}
export const railItems = (): HTMLElement | null => document.querySelector<HTMLElement>(".app-rail .rail-items");
export const railButtons = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(".app-rail .rail-items .rail-btn"));
const idOfLabel = (label: string): string => {
  for (const lang of ["en", "zh"] as const) {
    const entry = Object.entries(NAV[lang]).find(([, text]) => text === label);
    if (entry) return entry[0];
  }
  return `?${label}`;
};
/** The rail's displayed module ids, in DOM order (accessible names mapped back through the nav labels). */
export const railIds = (): string[] => railButtons().map(element => idOfLabel(element.getAttribute("aria-label") ?? ""));
/** The rail button of a module, by its accessible name in the displayed language. */
export function railButton(id: string, lang: Lang = uiLang()): HTMLElement {
  const items = railItems();
  pre(items, "the AppRail .rail-items is mounted");
  const name = NAV[lang][id] ?? id;
  const found = within(items).queryAllByRole("button", { name }) as HTMLElement[];
  pre(found.length >= 1, `the rail button "${name}" is present (got ${found.length})`);
  return found[0]!;
}

export interface TransferStub {
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
export function transfer(initial: Record<string, string> = {}): TransferStub {
  const data = new Map<string, string>(Object.entries(initial));
  const stub: TransferStub = {
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
  return stub;
}
export type DropTarget = string | "gap" | "outside";
export interface Gesture {
  readonly transfer: TransferStub;
  /** The display order captured at dragstart (D0). */
  readonly initial: string[];
  /** The preview order the oracle expects after each dragover (contract section 6 item 2). */
  expected: string[];
}
/** dragStart on the source button (contract section 6 item 1). */
export function dragStart(from: string): Gesture {
  const gesture: Gesture = { transfer: transfer(), initial: railIds(), expected: railIds() };
  fireEvent.dragStart(railButton(from), { dataTransfer: gesture.transfer });
  return gesture;
}
/**
 * The pointer enters the slot where `to` is displayed, then hovers there (contract section 6 item 2). Like a real
 * browser, each event targets the button currently displayed at that slot, re-read after every event: so the result
 * is the same whether a product reorders on dragenter, on dragover or on both (after the first reorder the dragged
 * button itself occupies the slot and further events there are no-ops), and no event is fired at a node the
 * pointer has left. The oracle's expected preview moves `from` before `to` exactly once per hovered slot.
 */
export function dragOver(gesture: Gesture, from: string, to: string): void {
  const slot = railIds().indexOf(to);
  pre(slot >= 0, `the hover target ${to} is displayed`);
  const at = (): HTMLElement => {
    const button = railButtons()[slot];
    pre(button, `a rail button is displayed at slot ${slot}`);
    return button;
  };
  fireEvent.dragEnter(at(), { dataTransfer: gesture.transfer });
  fireEvent.dragOver(at(), { dataTransfer: gesture.transfer });
  gesture.expected = moveBefore(gesture.expected, from, to);
}
/** dragEnter then dragOver on a gap of `.rail-items` (the container itself). */
export function dragOverGap(gesture: Gesture): void {
  const items = railItems();
  pre(items, "the AppRail .rail-items is mounted");
  fireEvent.dragEnter(items, { dataTransfer: gesture.transfer });
  fireEvent.dragOver(items, { dataTransfer: gesture.transfer });
}
export function drop(gesture: Gesture, target: DropTarget): void {
  if (target === "outside") {
    const main = document.querySelector<HTMLElement>(".app-main") ?? document.body;
    fireEvent.dragEnter(main, { dataTransfer: gesture.transfer });
    fireEvent.dragOver(main, { dataTransfer: gesture.transfer });
    fireEvent.drop(main, { dataTransfer: gesture.transfer });
    return;
  }
  const element = target === "gap" ? railItems() : railButton(target);
  pre(element, `drop target ${target} present`);
  fireEvent.drop(element, { dataTransfer: gesture.transfer });
}
export function dragEnd(gesture: Gesture, from: string): void {
  fireEvent.dragEnd(railButton(from), { dataTransfer: gesture.transfer });
}
/**
 * A complete drag gesture: dragStart(from) → for each target dragEnter+dragOver → drop on `dropOn` (default: the last
 * target; null cancels: no drop) → dragEnd(from). Returns the oracle's expected preview order P.
 */
export async function drag(from: string, targets: readonly string[], dropOn: DropTarget | null = targets.at(-1) ?? "gap"): Promise<string[]> {
  const gesture = dragStart(from);
  for (const to of targets) dragOver(gesture, from, to);
  if (dropOn !== null) drop(gesture, dropOn);
  dragEnd(gesture, from);
  await flush();
  return gesture.expected;
}

// ---------------------------------------------------------------------------
// The Topbar rail-order status and panel (contract sections 5 and 7 item 2: stable selectors)
// ---------------------------------------------------------------------------

export function topbar(): HTMLElement {
  const element = document.querySelector<HTMLElement>("header.topbar");
  pre(element, "the production Topbar is mounted");
  return element;
}
export const status = (): HTMLButtonElement | null => document.querySelector<HTMLButtonElement>('header.topbar [data-testid="rail-order-status"]');
/** The status by role and accessible name for a state ("draft" or "source"). */
export function statusNamed(kind: "draft" | "source", lang: Lang = uiLang()): HTMLButtonElement | null {
  const name = kind === "draft" ? W[lang].statusDraft : W[lang].statusSource;
  const header = document.querySelector<HTMLElement>("header.topbar");
  if (!header) return null;
  const found = within(header).queryAllByRole("button", { name }) as HTMLButtonElement[];
  return found.find(element => element.getAttribute("data-testid") === "rail-order-status") ?? null;
}
export const panel = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-testid="rail-order-panel"]');
export const panelOpen = (): boolean => panel() !== null && !(panel()!.hidden);
/** Opens the panel through the status (business: the status must exist). */
export function openPanel(tag: string): HTMLElement {
  const button = need(status(), `${tag}: the Topbar rail-order status ([data-testid="rail-order-status"])`);
  if (!panelOpen()) fireEvent.click(button);
  return need(panelOpen() ? panel() : null, `${tag}: the rail-order panel opens from the status`);
}
export function closePanel(): void {
  const button = status();
  if (button && panelOpen()) fireEvent.click(button);
}
export const TESTID: Readonly<Record<Action, string>> = { retry: "rail-order-retry", discard: "rail-order-discard", export: "rail-order-export", reload: "rail-order-reload" };
export const action = (kind: Action): HTMLButtonElement | null => document.querySelector<HTMLButtonElement>(`[data-testid="${TESTID[kind]}"]`);
/** The panel's actions present, in DOM order. */
export const actionsShown = (): Action[] => (["retry", "discard", "export", "reload"] as const)
  .map(kind => ({ kind, element: action(kind) }))
  .filter((entry): entry is { kind: Action; element: HTMLButtonElement } => entry.element !== null)
  .sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
  .map(entry => entry.kind);
/** Opens the panel and returns an action by its testid and its normative accessible name (business presence). */
export function panelAction(kind: Action, tag: string, lang: Lang = uiLang()): HTMLButtonElement {
  const root = openPanel(tag);
  const element = need(action(kind), `${tag}: the panel action ${TESTID[kind]}`);
  const named = within(root).queryAllByRole("button", { name: W[lang][kind].name }) as HTMLElement[];
  expect(named.includes(element), `${tag}: ${TESTID[kind]} has the accessible name "${W[lang][kind].name}"`).toBe(true);
  return element;
}
export const message = (): string | null => {
  const element = document.querySelector<HTMLElement>('[data-testid="rail-order-message"]');
  return element ? (element.textContent ?? "").replace(/\s+/g, " ").trim() : null;
};
export const messageRole = (): string | null => document.querySelector<HTMLElement>('[data-testid="rail-order-message"]')?.getAttribute("role") ?? null;
export const pageText = (): string => (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
/** No success claim anywhere in the rail or the rail status (contract section 5 item 6). */
export function railSuccessClaim(): boolean {
  const scopes = [document.querySelector(".app-rail"), status()?.parentElement ?? null, panel()].filter((element): element is Element => element !== null);
  return scopes.some(element => {
    let text = element.textContent ?? "";
    for (const phrase of NOT_SUCCESS_PHRASES) text = text.split(phrase).join(" ");
    return /saved/i.test(text) || text.includes("已保存");
  });
}
export const prefTrigger = (): HTMLElement | null => document.querySelector<HTMLElement>(".topbar .topbar-pref-trigger");

/** A quota-failed drop: the set fault stays armed (unlimited) until the case turns it off. */
export async function failedDrop(from: string, targets: readonly string[], options: { generic?: boolean; dropOn?: DropTarget } = {}): Promise<{ order: string[]; quota: Fault }> {
  const quota = fault({ op: "set", key: KEY, generic: options.generic, label: options.generic ? "rail order setItem throws" : "rail order quota" });
  const order = await drag(from, targets, options.dropOn ?? targets.at(-1) ?? "gap");
  return { order, quota };
}

// ---------------------------------------------------------------------------
// Settings sidebar, Features pane, Appearance draft and sign-out controls
// ---------------------------------------------------------------------------

export function sidebarRow(name: string): HTMLElement {
  const sidebar = document.querySelector<HTMLElement>(".settings-sidebar");
  pre(sidebar, "the Settings sidebar is mounted");
  const found = within(sidebar).queryAllByRole("button", { name }) as HTMLElement[];
  pre(found.length === 1, `exactly one Settings sidebar row "${name}" (got ${found.length})`);
  return found[0]!;
}
/** The real Features pane switch for a module (`/app/settings/features`). */
export function featureSwitch(id: string): HTMLElement {
  const root = document.querySelector<HTMLElement>('.settings-detail[data-pane="features"] .features-pane');
  pre(root, "the Features pane is mounted in the production Settings detail");
  const found = root.querySelectorAll<HTMLElement>(`[data-feature-id="${id}"] [role="switch"]`);
  pre(found.length === 1, `exactly one switch at [data-feature-id="${id}"] [role="switch"] (got ${found.length})`);
  return found[0]!;
}
export function featureButton(name: string): HTMLButtonElement | null {
  const detail = document.querySelector<HTMLElement>('.settings-detail[data-pane="features"]');
  pre(detail, "the production Settings detail shows the Features pane");
  return (within(detail).queryAllByRole("button", { name })[0] as HTMLButtonElement | undefined) ?? null;
}
/** Creates an Appearance draft: a failed Topbar theme choice (the accepted Appearance controller's own path). */
export async function appearanceDraft(): Promise<Fault> {
  const quota = fault({ op: "set", key: "xai_pref_theme", label: "appearance theme quota" });
  const trigger = prefTrigger();
  pre(trigger, "the Topbar appearance trigger is present");
  if (!document.querySelector('header.topbar [role="dialog"]')) fireEvent.click(trigger);
  const dialog = document.querySelector<HTMLElement>('header.topbar [role="dialog"]');
  pre(dialog, "the Topbar appearance popover opened");
  const options = within(dialog).queryAllByRole("menuitemradio", { name: uiLang() === "zh" ? "深色" : "Dark" }) as HTMLElement[];
  pre(options.length === 1, "exactly one Topbar Dark option");
  fireEvent.click(options[0]!);
  await flush();
  fired(quota, "appearance theme write");
  if (document.querySelector('header.topbar [role="dialog"]')) fireEvent.click(trigger);
  pre(document.querySelector('header.topbar [data-testid="appearance-status"]') !== null, "the Appearance draft shows the Appearance status");
  return quota;
}
/** Opens the avatar menu, chooses Sign Out and confirms the existing sign-out dialog. */
export async function signOut(lang: Lang = uiLang()): Promise<void> {
  const rail = document.querySelector<HTMLElement>(".app-rail");
  pre(rail, "the production AppRail is mounted");
  if (!document.querySelector('.avatar-menu[role="menu"]')) {
    const avatar = within(rail).queryAllByRole("button", { name: lang === "zh" ? "打开账户菜单" : "Open account menu" }) as HTMLElement[];
    pre(avatar.length === 1, "exactly one avatar menu button");
    fireEvent.click(avatar[0]!);
  }
  const menu = document.querySelector<HTMLElement>('.avatar-menu[role="menu"]');
  pre(menu, "the avatar menu opened");
  const label = lang === "zh" ? "退出登录" : "Sign Out";
  const item = (within(menu).queryAllByRole("button", { name: label }) as HTMLElement[]).filter(element => element.classList.contains("avm-item"));
  pre(item.length === 1, `exactly one avatar menu "${label}"`);
  fireEvent.click(item[0]!);
  const dialog = document.querySelector<HTMLElement>("dialog.xai-sign-out-dialog[open]");
  pre(dialog, "the existing sign-out confirmation dialog opened");
  const confirm = within(dialog).queryAllByRole("button", { name: label }) as HTMLElement[];
  pre(confirm.length === 1, `exactly one sign-out dialog "${label}"`);
  await act(async () => { fireEvent.click(confirm[0]!); });
  await flush(24);
}

// ---------------------------------------------------------------------------
// Per-test setup and teardown
// ---------------------------------------------------------------------------

export function resetDocument(): void {
  const root = document.documentElement;
  for (const name of ["data-theme", "data-density", "data-rail-pos", "data-bg-tone", "data-lang"]) root.removeAttribute(name);
  root.style.cssText = "";
}
export function setup(): AccountScope {
  restoreDownload();
  uninstallStorage();
  localStorage.clear();
  sessionStorage.clear();
  store.log.length = 0;
  store.faults.length = 0;
  store.depth = 0;
  store.nested = 0;
  store.delegated = 0;
  rejections.length = 0;
  runtimeErrors.length = 0;
  confirmer.calls.length = 0;
  confirmer.answer = true;
  confirmer.answers.length = 0;
  dispatched.length = 0;
  oracleSent.clear();
  bus.preference.length = 0;
  bus.moduleChange.length = 0;
  redirects.length = 0;
  resetDocument();
  installEnvironment();
  installDialog();
  installLocks();
  installStorage();
  installConfirm();
  installDispatch();
  installBus();
  process.on("unhandledRejection", onRejection);
  window.addEventListener("error", onWindowError);
  return activate(OWNER_A, "g1");
}
export function teardown(): void {
  let unmountFailure: unknown = null;
  try { cleanup(); } catch (error) { unmountFailure = error; }
  for (const router of routers.splice(0)) router.dispose();
  const nested = store.nested;
  uninstallStorage();
  uninstallLocks();
  uninstallConfirm();
  uninstallDispatch();
  uninstallBus();
  uninstallDialog();
  restoreLocation();
  restoreDownload();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  process.off("unhandledRejection", onRejection);
  window.removeEventListener("error", onWindowError);
  resetDocument();
  const errors = lockState.manager?.errors ?? [];
  lockState.missing = false;
  if (unmountFailure) throw unmountFailure;
  if (nested !== 0) throw new Error(`PRECONDITION: F-B002 the storage wrappers re-entered Storage ${nested} time(s)`);
  if (errors.length > 0) throw new Error(`PRECONDITION: the Web Lock fixture could not serve a request: ${errors.join("; ")}`);
}
