/**
 * Sol jsdom fixture: the Dashboard Clock widget's style (`xai_clock_style`) and timezone (`xai_clock_tz`), and its
 * Dashboard departure participation (CP-CLOCK-01, contract docs/reviews/web-dashboard-clock-recovery-contract/
 * contract.md r2, sections 2–10 and 12).
 *
 * The product is loaded unmodified from the immutable archive under test: the real widget registration
 * (`dashboardWidgetRegistrations`), `DashboardModule` with the real grid, Header, WidgetShell and WidgetGhost, the
 * production Dashboard registration with the shared `DepartureCoordinator` inside the real `Shell` (AppRail and
 * Topbar), `settingsDeparture`, the real @repo/plugin-web-storage hooks, mutation engine, registry, codecs, ownership
 * and accountScope controller. Nothing in the persistence path is mocked. The fixture owns only:
 *   - an attempt-counting Storage injector that records every getItem/setItem/removeItem attempt on localStorage
 *     BEFORE delegating exactly once (and before any injected fault throws), with an F-B002 re-entrancy counter;
 *   - an exclusive, asynchronous Web Lock manager installed as navigator.locks, with programmable holds;
 *   - a window.confirm recorder that classifies each message by its exact text (rail / appearance / other);
 *   - an instrumented window.dispatchEvent (StorageEvent counter), a bus spy, a beforeunload probe, a download
 *     harness, network refusals and a render-error boundary;
 *   - a recording departure registration (a stand-in for the coordinator's single guard slot) and a probe widget
 *     registration that reads the render context;
 *   - real accountScope transitions.
 *
 * The Clock model below (keys, domains, defaults, labels, the normative recovery wording of contract section 5 and the
 * section 8 envelope) is written from the contract text and the protected label tables it cites. It never imports a
 * product helper; expected bytes are always the literal domain strings.
 *
 * F-B002 rule (contract section 12 rules 8–9): the storage wrappers record and then delegate exactly once. They never
 * call accountScope.physicalKey, getPref, readRawPref, any other Storage method or any product helper. Both Clock keys
 * are device keys (physical key = logical key) and their lock names are computed at module load, before any wrapper
 * is installed; the one account key an oracle names (the Header note) is computed by the case before mounting.
 * `storageSelfCheck()` proves it and `teardown()` re-asserts zero nested wrapper entries.
 *
 * Any error whose message starts with `PRECONDITION:` is a fixture or selector failure. It is never a product
 * failure. Business assertions carry an `H<n>`, `D<n>`, `A<n>` or `§<n>` tag in their message instead.
 */
import * as React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { expect, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { transferableAbortController } from "node:util";
import { accountScope, generationMarkerKey, prefMutationLockName, type AccountScope } from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";
import { Shell, WebShellProvider } from "@repo/xai-web-shell";
import { dashboardWidgetRegistrations } from "@repo/plugin-web-dashboard-widgets";
import { DashboardModule } from "@repo/plugin-web-dashboard-grid";

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

/** Waits real time (the Dashboard ticks `now` with a real one-second interval). */
export async function wait(ms: number): Promise<void> {
  await act(async () => { await new Promise<void>(resolve => setTimeout(resolve, ms)); });
}

/** Evidence line in the Vitest stdout (the runner keeps it in the log). */
export function observe(tag: string, data: unknown): void {
  console.info(`SOL-OBS ${tag} ${JSON.stringify(data)}`);
}

// ---------------------------------------------------------------------------
// Clock model, stated independently of the product (contract sections 2, 5 and 8)
// ---------------------------------------------------------------------------

export type Lang = "en" | "zh";
export type Field = "style" | "timezone";
export const FIELDS: readonly Field[] = ["style", "timezone"];
export const STYLE_KEY = "xai_clock_style";
export const TZ_KEY = "xai_clock_tz";
export const KEY: Readonly<Record<Field, string>> = { style: STYLE_KEY, timezone: TZ_KEY };
// Lock names computed at module load, before any Storage wrapper is installed (F-B002).
export const LOCK: Readonly<Record<Field, string>> = { style: prefMutationLockName(STYLE_KEY), timezone: prefMutationLockName(TZ_KEY) };
export const LOCK_EXPECTED: Readonly<Record<Field, string>> = { style: "xai:pref:v1:xai_clock_style", timezone: "xai:pref:v1:xai_clock_tz" };
export const RAIL_LOCK = prefMutationLockName("xai_rail_order");
export const THEME_LOCK = prefMutationLockName("xai_pref_theme");
export const RAIL_KEY = "xai_rail_order";
export const DASH_ORDER_KEY = "xai_dash_order";

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

/** Style button accessible names (their `title`, tokens i18n.ts EN :223–230, ZH :540–547). */
export const STYLE_TITLE: Readonly<Record<Lang, Readonly<Record<string, string>>>> = {
  en: { classic: "Classic", split: "Split", minimal: "Minimal", analog: "Analog" },
  zh: { classic: "经典", split: "分段", minimal: "极简", analog: "模拟" },
};
/** Timezone labels (Local time from tokens; city names and integer offsets from cityLibrary.ts:18–31). */
export const TZ_LABEL: Readonly<Record<Lang, Readonly<Record<string, string>>>> = {
  en: { local: "Local time", shanghai: "Shanghai", london: "London", new_york: "New York", tokyo: "Tokyo", sf: "San Francisco", paris: "Paris", sydney: "Sydney", berlin: "Berlin", dubai: "Dubai", singapore: "Singapore", hk: "Hong Kong", la: "Los Angeles" },
  zh: { local: "本地时间", shanghai: "上海", london: "伦敦", new_york: "纽约", tokyo: "东京", sf: "旧金山", paris: "巴黎", sydney: "悉尼", berlin: "柏林", dubai: "迪拜", singapore: "新加坡", hk: "香港", la: "洛杉矶" },
};
export const TZ_OFFSET: Readonly<Record<string, number>> = { shanghai: 8, london: 1, new_york: -4, tokyo: 9, sf: -7, paris: 2, sydney: 11, berlin: 2, dubai: 4, singapore: 8, hk: 8, la: -7 };
export const NOW = new Date(2026, 4, 22, 14, 5, 30);
/** Expected HH:MM:SS of the Classic face for a timezone at `now` (contract section 3 item 12: static offsets). */
export function expectedClassic(tz: string, now: Date = NOW): string {
  let shown = now;
  if (tz !== "local") shown = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + TZ_OFFSET[tz]! * 3600000);
  const two = (n: number): string => String(n).padStart(2, "0");
  return `${two(shown.getHours())}:${two(shown.getMinutes())}:${two(shown.getSeconds())}`;
}

/** Contract section 5 normative wording. */
export const W = {
  en: {
    label: { style: "Clock style", timezone: "Clock timezone" } as Record<Field, string>,
    notSaved: (label: string) => `${label} was not saved.`,
    source: (label: string) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
    retry: (label: string) => `Retry ${label}`,
    discard: (label: string) => `Discard ${label}`,
    reload: (label: string) => `Reload ${label}`,
    exportName: "Export Clock draft",
    exportError: "Export failed. Please retry.",
    participant: "Clock",
    combined: "Dashboard",
    header: "Dashboard header",
    dialogText: (label: string) => `${label} has unsaved changes.`,
    dialogAria: (label: string) => `Unsaved ${label} draft`,
    stay: "Stay",
    dialogExport: "Export current draft",
    dialogDiscard: "Discard local changes and leave",
  },
  zh: {
    label: { style: "时钟样式", timezone: "时钟时区" } as Record<Field, string>,
    notSaved: (label: string) => `${label}未保存。`,
    source: (label: string) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
    retry: (label: string) => `重试 ${label}`,
    discard: (label: string) => `放弃 ${label}`,
    reload: (label: string) => `重新读取 ${label}`,
    exportName: "导出时钟草稿",
    exportError: "导出失败，请重试。",
    participant: "时钟",
    combined: "工作台",
    header: "工作台备注",
    dialogText: (label: string) => `${label}有未保存的更改。`,
    dialogAria: (label: string) => `未保存的${label}草稿`,
    stay: "留下",
    dialogExport: "导出当前草稿",
    dialogDiscard: "放弃本地更改并离开",
  },
} as const;

/** Contract section 8 envelope (only `set` entries; style then timezone). */
export function envelope(changes: Partial<Record<Field, string>>): unknown {
  const device: Record<string, unknown> = {};
  if (changes.style !== undefined) device.style = { operation: "set", value: changes.style };
  if (changes.timezone !== undefined) device.timezone = { operation: "set", value: changes.timezone };
  return { version: 1, kind: "clock-draft", changes: { device } };
}

/** The exact sign-out confirm texts of the protected App steps (contract section 12 rule 12). */
export const CONFIRM_TEXT = {
  rail: ["Your sidebar order change is not saved. Sign out and discard it?", "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？"],
  appearance: ["Some appearance changes are not saved. Sign out and discard them?", "部分外观更改尚未保存。仍要退出并放弃这些更改吗？"],
} as const;

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
    throw op === "set" && !entry.generic ? new DOMException(`clock-sol ${entry.label}`, "QuotaExceededError") : new Error(`clock-sol ${entry.label}`);
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
/** Every set/remove attempt on one Clock field's key since `from`, as written bytes ("<remove>"; "!" if it threw). */
export const fieldWrites = (from: number, field: Field): string[] => attempts(from, [KEY[field]], ["set", "remove"]).map(item => (item.op === "set" ? item.value! : "<remove>") + (item.threw ? "!" : ""));
/** Every set/remove attempt on either Clock key since `from`. */
export const clockWrites = (from: number): string[] => attempts(from, [STYLE_KEY, TZ_KEY], ["set", "remove"]).map(describeWrite);
/** Every set/remove attempt on any key since `from`. */
export const writes = (from: number): string[] => attempts(from, undefined, ["set", "remove"]).map(describeWrite);
/** Every attempt (get/set/remove) on one key since `from`. */
export const touches = (from: number, key: string): string[] => attempts(from, [key]).map(item => `${item.op}:${item.key}${item.threw ? "!" : ""}`);
/** Attempts on account-namespaced keys (prefix constants; no product helper is called). */
export const accountTouches = (from = 0): string[] => store.log.slice(from).filter(item => item.key.startsWith("xai:account:v1:") || item.key.startsWith("xai:demo:v1:")).map(item => `${item.op}:${item.key}`);

/** Total denial for get/set/remove on every key, proven to fire through the attempt counter. */
export function denyAllStorage(): Fault {
  const denial = fault({ op: "any", label: "total storage denial" });
  const from = mark();
  let thrown = 0;
  for (const run of [() => localStorage.getItem("clock-sol-probe"), () => localStorage.setItem("clock-sol-probe", "x"), () => localStorage.removeItem("clock-sol-probe")]) {
    try { run(); } catch { thrown += 1; }
  }
  pre(thrown === 3 && denial.fired === 3 && attempts(from).length === 3, "total storage denial armed and observed for getItem, setItem and removeItem through the attempt counter");
  return denial;
}
/** A quota (or generic) setItem fault scoped to one Clock key; stays armed until the case turns it off. */
export function quota(field: Field, options: { generic?: boolean; value?: string; times?: number } = {}): Fault {
  return fault({ op: "set", key: KEY[field], generic: options.generic, value: options.value, times: options.times, label: `${field} ${options.generic ? "setItem throws" : "quota"}${options.value ? ` (${options.value})` : ""}` });
}

/** The raw bytes of a key, read without the injector. */
export const raw = (key: string): string | null => nativeGet.call(localStorage, key);
export const bytes = (field: Field): string | null => raw(KEY[field]);
/** Seeds an in-domain Clock value (seed rule, contract section 12 rule 10). */
export function seed(field: Field, value: string): void {
  pre(inDomain(field, value), `the seeded ${KEY[field]} value ${JSON.stringify(value)} is in-domain`);
  nativeSet.call(localStorage, KEY[field], value);
  pre(raw(KEY[field]) === value, `seeded bytes ${KEY[field]}=${JSON.stringify(value)} present`);
}
/** Seeds a malformed value from the contract section 5 item 2 table (source-truth cases only). */
export function seedMalformed(field: Field, value: string): void {
  pre(MALFORMED[field].includes(value) && !inDomain(field, value), `the seeded ${KEY[field]} value ${JSON.stringify(value)} is a section 5 item 2 malformed value`);
  nativeSet.call(localStorage, KEY[field], value);
  pre(raw(KEY[field]) === value, `seeded malformed bytes ${KEY[field]}=${JSON.stringify(value)} present`);
}
export function seedKey(key: string, value: string): void {
  nativeSet.call(localStorage, key, value);
  pre(raw(key) === value, `seeded bytes ${key}=${JSON.stringify(value)} present`);
}
/** Snapshot of every localStorage key except the excluded ones, read without the injector. */
export function snapshot(exclude: readonly string[] = [STYLE_KEY, TZ_KEY]): Record<string, string | null> {
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
    step(() => localStorage.setItem(STYLE_KEY, "split"));
    step(() => localStorage.getItem(STYLE_KEY));
    const setFault = fault({ op: "set", key: STYLE_KEY, times: 1, label: "selfcheck set" });
    step(() => localStorage.setItem(STYLE_KEY, "analog"));
    const getFault = fault({ op: "get", key: TZ_KEY, times: 1, after: { op: "remove", key: TZ_KEY }, label: "selfcheck read after remove" });
    step(() => localStorage.getItem(TZ_KEY));
    step(() => localStorage.removeItem(TZ_KEY));
    step(() => localStorage.getItem(TZ_KEY));
    step(() => localStorage.getItem(TZ_KEY));
    const denial = fault({ op: "any", label: "selfcheck denial" });
    step(() => localStorage.getItem(STYLE_KEY));
    step(() => localStorage.setItem(STYLE_KEY, "classic"));
    step(() => localStorage.removeItem(STYLE_KEY));
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
/** The F-B002 self-check every oracle file runs as its first case. */
export function assertSelfCheck(): void {
  const result = storageSelfCheck();
  observe("F-B002 self-check", result);
  pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(SELF_CHECK_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
  pre(LOCK.style === LOCK_EXPECTED.style && LOCK.timezone === LOCK_EXPECTED.timezone, `lock names computed before the wrappers: ${JSON.stringify(LOCK)}`);
}

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

export function createLockManager() {
  let nextId = 0;
  const log: LockRecord[] = [];
  const errors: string[] = [];
  const denied = new Set<string>();
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
    const callback = (typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback) as LockCallback<T> | undefined;
    if (typeof callback !== "function") {
      errors.push(`request(${String(name)}) without a callback`);
      return Promise.reject(new TypeError("clock-sol lock fixture: callback required"));
    }
    if (options.steal) errors.push(`steal is unsupported by the fixture (${String(name)})`);
    const mode: LockMode = options.mode === "shared" ? "shared" : "exclusive";
    const record: LockRecord = { id: ++nextId, name: String(name), mode, owner, state: "waiting" };
    log.push(record);
    if (owner === "product" && denied.has(record.name)) {
      record.state = "rejected";
      return Promise.reject(new Error(`clock-sol web lock request rejected (${record.name})`));
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
/** Lock fixture self-check: a test hold makes a product request wait until release (exclusive semantics). */
export async function lockSelfCheck(): Promise<{ waitedWhileHeld: boolean; grantedAfter: boolean }> {
  const manager = locks();
  const holder = await hold("clock-sol-selfcheck");
  let granted = false;
  const product = manager.api.request<void>("clock-sol-selfcheck", { mode: "exclusive" }, () => { granted = true; });
  await flush();
  const waitedWhileHeld = !granted && manager.waiting("clock-sol-selfcheck", "product") === 1;
  await holder.release();
  await product;
  return { waitedWhileHeld, grantedAfter: granted };
}

// ---------------------------------------------------------------------------
// Real accountScope transitions
// ---------------------------------------------------------------------------

export const OWNER_A = "clock-sol-A";
export const OWNER_B = "clock-sol-B";
export function marker(owner: string, generation: string, demo = false): void {
  nativeSet.call(localStorage, generationMarkerKey(owner, demo), JSON.stringify({ generation, migrationId: "clock-sol", previous: null }));
}
export function activate(owner: string, generation = "g1", demo = false): AccountScope {
  marker(owner, generation, demo);
  const scope = accountScope.activate(accountScope.lock(owner), generation, demo);
  pre(accountScope.capture() === scope && scope.kind === (demo ? "demo" : "account") && scope.accountId === owner && scope.generation === generation, `${demo ? "demo" : "account"} scope ${owner}/${generation} active`);
  return scope;
}
export function lockAccount(owner: string | null = "clock-sol-locked"): AccountScope {
  const scope = accountScope.lock(owner);
  pre(accountScope.capture() === scope && scope.kind === "locked", "account scope locked");
  return scope;
}

// ---------------------------------------------------------------------------
// window.confirm recorder (classified by exact text), StorageEvent counter, bus spy, dragstart counter
// ---------------------------------------------------------------------------

export type ConfirmClass = "rail" | "appearance" | "other";
export interface ConfirmRecord { readonly message: string; readonly kind: ConfirmClass; readonly answer: boolean }
export const confirmer: { calls: ConfirmRecord[]; answer: boolean; answers: boolean[] } = { calls: [], answer: true, answers: [] };
export function classifyConfirm(message: string): ConfirmClass {
  if ((CONFIRM_TEXT.rail as readonly string[]).includes(message)) return "rail";
  if ((CONFIRM_TEXT.appearance as readonly string[]).includes(message)) return "appearance";
  return "other";
}
const recordConfirm = (message?: string): boolean => {
  const answer = confirmer.answers.length > 0 ? confirmer.answers.shift()! : confirmer.answer;
  confirmer.calls.push({ message: String(message), kind: classifyConfirm(String(message)), answer });
  return answer;
};
let savedConfirm: unknown = null;
function installConfirm(): void {
  savedConfirm = window.confirm;
  (window as unknown as { confirm: unknown }).confirm = recordConfirm;
}
function uninstallConfirm(): void {
  (window as unknown as { confirm: unknown }).confirm = savedConfirm;
}
export const confirmInstalled = (): boolean => (window.confirm as unknown) === recordConfirm;
/** Confirm records by class (rule 12). */
export const confirmsByClass = (): Record<ConfirmClass, number> => ({
  rail: confirmer.calls.filter(call => call.kind === "rail").length,
  appearance: confirmer.calls.filter(call => call.kind === "appearance").length,
  other: confirmer.calls.filter(call => call.kind === "other").length,
});

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

export interface BusEvent { readonly type: string; readonly detail: unknown }
export const bus: BusEvent[] = [];
let busOff: Array<() => void> = [];
const BUS_TYPES = ["web:settings:preference-changed", "web:shell:module-change", "web:dashboard:add-widget-clicked", "web:dashboard:widget-added", "web:shell:pet-toggle"] as const;
function installBus(): void {
  busOff = BUS_TYPES.map(type => onWebEvent(type as never, (detail: unknown) => { bus.push({ type, detail }); }));
}
function uninstallBus(): void { for (const off of busOff.splice(0)) off(); }
/** Bus events since `from` other than navigation-caused shell module changes. */
export const nonNavigationBus = (from = 0): BusEvent[] => bus.slice(from).filter(event => event.type !== "web:shell:module-change");

export const drags = { starts: 0 };
const onDragStart = (): void => { drags.starts += 1; };

// ---------------------------------------------------------------------------
// beforeunload, runtime errors, unhandled rejections, render errors
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
export const renderErrors: string[] = [];
class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  componentDidCatch(error: unknown): void { renderErrors.push(String((error as Error)?.message ?? error)); }
  render(): React.ReactNode { return this.state.failed ? <div data-testid="clock-sol-render-error" /> : this.props.children; }
}

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
  jsonFor(name: string): Promise<unknown>;
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
  const urlBlob = new Map<string, Blob>();
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
    async jsonFor(name: string) {
      const click = harness.clicks.find(entry => entry.download === name);
      pre(click && click.href && urlBlob.has(click.href), `a download click for ${name} with a captured blob`);
      return JSON.parse(await readBlob(urlBlob.get(click.href)!));
    },
    anchorsInDocument() {
      return Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).filter(anchor => anchor.hasAttribute("download") || (anchor.getAttribute("href") ?? "").startsWith("blob:"));
    },
  };
  patchProperty(URL, "createObjectURL", (blob: Blob) => {
    harness.hooks.create?.();
    const url = `blob:clock-sol/${++counter}`;
    harness.blobs.push(blob);
    harness.created.push(url);
    urlBlob.set(url, blob);
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
/** One clock-draft.json download with the whole envelope, one URL created and revoked, the anchor removed. */
export async function expectClockDownload(harness: Download, expected: unknown, tag: string): Promise<void> {
  expect(harness.clicks.map(click => click.download), `${tag}: exactly one download, clock-draft.json`).toEqual(["clock-draft.json"]);
  expect(harness.created.length, `${tag}: exactly one object URL created`).toBe(1);
  expect(harness.clicks[0]?.href, `${tag}: the anchor targets the created object URL`).toBe(harness.created[0]);
  expect(harness.revoked, `${tag}: that same object URL revoked`).toEqual([harness.created[0]]);
  expect(harness.anchorsInDocument().length, `${tag}: the anchor was removed`).toBe(0);
  expect(await harness.json(0), `${tag}: whole envelope (deep equality)`).toStrictEqual(expected);
}

// ---------------------------------------------------------------------------
// jsdom environment: network refusals, dialog stubs
// ---------------------------------------------------------------------------

export const network = { fetch: 0, xhr: 0, socket: 0, eventSource: 0 };
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
  vi.stubGlobal("fetch", () => { network.fetch += 1; return Promise.reject(new TypeError("clock-sol: network disabled")); });
  vi.stubGlobal("XMLHttpRequest", class { constructor() { network.xhr += 1; throw new TypeError("clock-sol: network disabled"); } });
  vi.stubGlobal("WebSocket", class { constructor() { network.socket += 1; throw new TypeError("clock-sol: network disabled"); } });
  vi.stubGlobal("EventSource", class { constructor() { network.eventSource += 1; throw new TypeError("clock-sol: network disabled"); } });
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

// ---------------------------------------------------------------------------
// Surfaces: the standalone widget (through the real registration), DashboardModule, the production Dashboard route
// ---------------------------------------------------------------------------

type GuardShape = {
  readonly token: object;
  readonly label?: string;
  readonly isBlocking: () => boolean;
  readonly isCurrent: () => boolean;
  readonly exportDraft: () => void;
  readonly discardDraft: () => void;
};
type Registration = (guard: GuardShape) => () => void;
type AnyRegistration = { id: string; span: string; render: (ctx: never) => React.ReactNode; ariaLabel?: { en: string; zh: string } };

export function clockRegistration(): AnyRegistration {
  const found = (dashboardWidgetRegistrations as unknown as AnyRegistration[]).filter(entry => entry.id === "clock");
  pre(found.length === 1, `exactly one real "clock" widget registration (got ${found.length})`);
  return found[0]!;
}

export interface ClockMount {
  setNow(now: Date): Promise<void>;
  setLang(lang: Lang): Promise<void>;
  unmount(): void;
}
/** The real Clock registration rendered on its own, with a controllable context (contract A3 standalone use). */
export async function mountClock(options: { lang?: Lang; now?: Date; register?: Registration } = {}): Promise<ClockMount> {
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  const registration = clockRegistration();
  let setter: ((next: { lang: Lang; now: Date }) => void) | null = null;
  const noop = (): void => undefined;
  function Host(): React.ReactElement {
    const [ctx, setCtx] = React.useState<{ lang: Lang; now: Date }>({ lang: options.lang ?? "en", now: options.now ?? NOW });
    setter = setCtx;
    const context = { lang: ctx.lang, now: ctx.now, goTo: noop, ...(options.register ? { registerDepartureGuard: options.register } : {}) };
    return <div data-testid="clock-sol-standalone">{registration.render(context as never)}</div>;
  }
  const result = render(<Boundary><Host /></Boundary>);
  await flush();
  let lang: Lang = options.lang ?? "en";
  let now: Date = options.now ?? NOW;
  return {
    async setNow(next) { now = next; await act(async () => { setter?.({ lang, now }); }); await flush(2); },
    async setLang(next) { lang = next; await act(async () => { setter?.({ lang, now }); }); await flush(2); },
    unmount: () => result.unmount(),
  };
}

/** A recording stand-in for the coordinator's single guard slot (replace on register; clear on token match). */
export interface Recorder {
  readonly register: Registration;
  readonly calls: Array<{ readonly kind: "register" | "unregister"; readonly guard: GuardShape }>;
  current(): GuardShape | null;
  blocking(): boolean;
  label(): string | undefined;
  registrations(from?: number): number;
}
export function recorder(): Recorder {
  const calls: Recorder["calls"] = [];
  let current: GuardShape | null = null;
  const register: Registration = guard => {
    calls.push({ kind: "register", guard });
    current = guard;
    return () => {
      calls.push({ kind: "unregister", guard });
      if (current?.token === guard.token) current = null;
    };
  };
  return {
    register,
    calls,
    current: () => current,
    blocking: () => Boolean(current && current.isCurrent() && current.isBlocking()),
    label: () => current?.label,
    registrations: (from = 0) => calls.slice(from).length,
  };
}

/** A probe widget registration that records the departure registration its render context carries (§5, §6 item 3). */
export interface Probe { readonly registration: AnyRegistration; readonly seen: Array<Registration | undefined> }
export function probeWidget(): Probe {
  const seen: Array<Registration | undefined> = [];
  const registration: AnyRegistration = {
    id: "clock-sol-probe",
    span: "w-stat",
    ariaLabel: { en: "Clock Sol probe", zh: "Clock Sol probe" },
    render: ((ctx: { registerDepartureGuard?: Registration }) => { seen.push(ctx.registerDepartureGuard); return <div data-testid="clock-sol-probe" />; }) as never,
  };
  return { registration, seen };
}

export interface ModuleMount { readonly goTo: string[]; unmount(): void; rerender(lang: Lang): void }
/** DashboardModule with the real registrations (plus optional probes), optionally with a recording registration. */
export async function mountModule(options: { lang?: Lang; record?: Recorder; extra?: AnyRegistration[]; strict?: boolean } = {}): Promise<ModuleMount> {
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  const goTo: string[] = [];
  const onGoTo = (id: string): void => { goTo.push(id); };
  const widgets = [...(dashboardWidgetRegistrations as unknown as AnyRegistration[]), ...(options.extra ?? [])];
  const view = (lang: Lang) => {
    const tree = <Boundary><DashboardModule lang={lang} widgets={widgets as never} goTo={onGoTo} {...(options.record ? { registerDepartureGuard: options.record.register as never } : {})} /></Boundary>;
    return options.strict ? <React.StrictMode>{tree}</React.StrictMode> : tree;
  };
  const result = render(view(options.lang ?? "en"));
  await flush();
  return { goTo, unmount: () => result.unmount(), rerender: lang => result.rerender(view(lang)) };
}

/** The production Dashboard route (registration + coordinator) inside the real Shell, with a memory router. */
export interface RouteMount {
  readonly router: ReturnType<typeof createMemoryRouter>;
  readonly locations: Array<{ pathname: string; key: string; action: string }>;
  readonly startKey: string;
  unmount(): void;
}
let dashboardRoute: React.ComponentType | null = null;
let shellModules: unknown[] | null = null;
/** Each departure file passes the archive's production registrations. */
export function configureRoute(route: React.ComponentType, modules: unknown[]): void { dashboardRoute = route; shellModules = modules; }
const routers: Array<ReturnType<typeof createMemoryRouter>> = [];
export const DESTINATIONS = ["tasks", "calendar", "settings", "habits", "statistics"] as const;
export async function mountRoute(options: { lang?: Lang; entries?: string[]; index?: number; strict?: boolean } = {}): Promise<RouteMount> {
  pre(dashboardRoute && shellModules, "the production Dashboard route and shell registrations were configured");
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  pre(confirmInstalled(), "window.confirm recorder installed");
  pre(dispatchInstalled(), "window.dispatchEvent StorageEvent counter installed");
  const lang = options.lang ?? "en";
  const Route = dashboardRoute;
  const noop = (): void => undefined;
  const entries = options.entries ?? ["/app/dashboard"];
  const router = createMemoryRouter([
    {
      path: "/app",
      element: <Shell lang={lang} setLang={noop} theme="light" setTheme={noop} density="comfortable" setDensity={noop} />,
      children: [
        { path: "dashboard", element: <Route /> },
        ...DESTINATIONS.map(id => ({ path: id, element: <div data-testid={`clock-sol-destination-${id}`}>{id} destination</div> })),
      ],
    },
  ], { initialEntries: entries, initialIndex: options.index ?? entries.length - 1 });
  routers.push(router);
  const locations: RouteMount["locations"] = [];
  router.subscribe(state => { locations.push({ pathname: state.location.pathname, key: state.location.key, action: state.historyAction }); });
  const tree = (
    <Boundary>
      <WebShellProvider modules={shellModules as never} lang={lang} railPos="left" petOn={false} setPetOn={noop}>
        <RouterProvider router={router} />
      </WebShellProvider>
    </Boundary>
  );
  const result = render(options.strict ? <React.StrictMode>{tree}</React.StrictMode> : tree);
  await flush(24);
  pre(router.state.location.pathname === "/app/dashboard", `the production Dashboard route is mounted (at ${router.state.location.pathname})`);
  pre(document.querySelector(".module-dashboard"), "the Dashboard module rendered");
  return { router, locations, startKey: router.state.location.key, unmount: () => result.unmount() };
}
/** Distinct location keys committed since `from`, other than the start key (history mutations). */
export function historyMutations(app: RouteMount, from = 0): string[] {
  return Array.from(new Set(app.locations.slice(from).map(entry => entry.key))).filter(key => key !== app.startKey);
}
/** Router commits since `from` that changed the pathname away from the Dashboard. */
export const departures = (app: RouteMount, from = 0): string[] => app.locations.slice(from).filter(entry => entry.pathname !== "/app/dashboard").map(entry => `${entry.action}:${entry.pathname}`);

// ---------------------------------------------------------------------------
// The Clock's controls (existing selectors and accessible names, contract section 2)
// ---------------------------------------------------------------------------

/** The source Clock instance (never the drag ghost). */
export function clockRoot(): HTMLElement {
  const roots = Array.from(document.querySelectorAll<HTMLElement>(".w-clock-body")).filter(element => !element.closest('[data-testid="widget-ghost"]'));
  pre(roots.length === 1, `exactly one source Clock .w-clock-body is mounted (got ${roots.length})`);
  return roots[0]!;
}
export const clockMounted = (): boolean => Array.from(document.querySelectorAll(".w-clock-body")).some(element => !element.closest('[data-testid="widget-ghost"]'));
export const ghostClock = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-testid="widget-ghost"] .w-clock-body');
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
export function openPopover(root: HTMLElement = clockRoot()): HTMLElement {
  if (!popover(root)) fireEvent.click(trigger(root));
  const open = popover(root);
  pre(open, "the timezone popover opened");
  return open;
}
export function closePopover(root: HTMLElement = clockRoot()): void {
  const scrim = root.querySelector<HTMLElement>(".popover-scrim");
  if (scrim) fireEvent.click(scrim);
}
export function tzItem(id: string, root: HTMLElement = clockRoot()): HTMLButtonElement {
  const open = openPopover(root);
  const found = open.querySelectorAll<HTMLButtonElement>(`.popover-item[data-tz-id="${id}"]`);
  pre(found.length === 1, `exactly one timezone item [data-tz-id="${id}"] (got ${found.length})`);
  return found[0]!;
}
export function choose(field: Field, value: string): void {
  pre(inDomain(field, value), `${field} choice ${value} is in-domain`);
  if (field === "style") fireEvent.click(styleButton(value));
  else fireEvent.click(tzItem(value));
}
/** The displayed style: the single face and the single aria-selected button must agree. */
export function shownStyle(root: HTMLElement = clockRoot()): string {
  const faces = STYLES.filter(id => root.querySelector(`[data-testid="clock-${id}"]`));
  const selected = Array.from(root.querySelectorAll<HTMLElement>('.clk-style-toggle button[aria-selected="true"]')).map(element => element.getAttribute("data-clock-style"));
  if (faces.length === 1 && selected.length === 1 && faces[0] === selected[0]) return faces[0]!;
  return `mismatch face=${faces.join(",")} selected=${selected.join(",")}`;
}
const tzIdOf = (text: string): string => {
  for (const lang of ["en", "zh"] as const) {
    const entry = Object.entries(TZ_LABEL[lang]).find(([, label]) => label === text);
    if (entry) return entry[0];
  }
  return `?${text}`;
};
/** The displayed timezone: the trigger label and `.clock-sub` must agree. */
export function shownTz(root: HTMLElement = clockRoot()): string {
  const sub = (root.querySelector(".clock-sub")?.textContent ?? "").trim();
  const label = Array.from(trigger(root).querySelectorAll(":scope > span")).map(element => (element.textContent ?? "").trim()).join("|");
  if (sub === label) return tzIdOf(sub);
  return `mismatch sub=${sub} trigger=${label}`;
}
export const shown = (field: Field, root: HTMLElement = clockRoot()): string => (field === "style" ? shownStyle(root) : shownTz(root));
/** The Classic face text, without whitespace. */
export const classicText = (root: HTMLElement = clockRoot()): string => (root.querySelector('[data-testid="clock-classic"]')?.textContent ?? "").replace(/\s+/g, "");
/** Every Clock control is enabled. */
export function controlsEnabled(root: HTMLElement = clockRoot()): boolean {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(".clock-toolbar button")).every(button => !button.disabled && button.getAttribute("aria-disabled") !== "true");
}

// ---------------------------------------------------------------------------
// The recovery surface (contract section 5 stable selectors and normative wording)
// ---------------------------------------------------------------------------

export const region = (root: HTMLElement = clockRoot()): HTMLElement | null => root.querySelector<HTMLElement>('[data-testid="clock-recovery"]');
export const block = (field: Field, root: HTMLElement = clockRoot()): HTMLElement | null => root.querySelector<HTMLElement>(`[data-clock-recovery="${field}"]`);
export type Action = "retry" | "discard" | "reload";
const text = (element: Element | null): string => (element?.textContent ?? "").replace(/\s+/g, " ").trim();
/** A field action by its exact accessible name, inside that field's block. */
export function action(field: Field, kind: Action, lang: Lang = "en", root: HTMLElement = clockRoot()): HTMLButtonElement | null {
  const container = block(field, root);
  if (!container) return null;
  const name = W[lang][kind](W[lang].label[field]);
  return (within(container).queryAllByRole("button", { name })[0] as HTMLButtonElement | undefined) ?? null;
}
export function exportButton(lang: Lang = "en", root: HTMLElement = clockRoot()): HTMLButtonElement | null {
  const element = root.querySelector<HTMLButtonElement>('[data-testid="clock-export-draft"]');
  if (!element) return null;
  const named = within(root).queryAllByRole("button", { name: W[lang].exportName });
  return named.includes(element) ? element : null;
}
export interface BlockState { present: boolean; notSaved: boolean; source: boolean; retry: boolean; discard: boolean; reload: boolean }
export function blockState(field: Field, lang: Lang = "en", root: HTMLElement = clockRoot()): BlockState {
  const element = block(field, root);
  const content = text(element);
  const label = W[lang].label[field];
  return {
    present: element !== null,
    notSaved: content.includes(W[lang].notSaved(label)),
    source: content.includes(W[lang].source(label)),
    retry: action(field, "retry", lang, root) !== null,
    discard: action(field, "discard", lang, root) !== null,
    reload: action(field, "reload", lang, root) !== null,
  };
}
export const FAILED: BlockState = { present: true, notSaved: true, source: false, retry: true, discard: true, reload: false };
export const SOURCE: BlockState = { present: true, notSaved: false, source: true, retry: false, discard: false, reload: true };
export const NONE: BlockState = { present: false, notSaved: false, source: false, retry: false, discard: false, reload: false };
export const exportErrorShown = (lang: Lang = "en", root: HTMLElement = clockRoot()): boolean => text(region(root)).includes(W[lang].exportError);
/** No success claim inside the Clock (contract section 5 item 7): normative non-success phrases are removed first. */
export function successClaim(root: HTMLElement = clockRoot()): boolean {
  let content = text(root);
  for (const lang of ["en", "zh"] as const) {
    for (const field of FIELDS) {
      const label = W[lang].label[field];
      for (const phrase of [W[lang].notSaved(label), W[lang].source(label)]) content = content.split(phrase).join(" ");
    }
  }
  return /saved/i.test(content) || content.includes("已保存") || content.includes("保存成功");
}
export function click(element: HTMLElement): void { fireEvent.click(element); }

// ---------------------------------------------------------------------------
// The coordinator dialog, the AppRail, the Topbar census and the Header
// ---------------------------------------------------------------------------

export const dialog = (): HTMLElement | null => document.querySelector<HTMLElement>('.settings-departure-dialog[role="dialog"]');
export function dialogState(): { open: boolean; aria: string | null; text: string } {
  const element = dialog();
  return { open: element !== null, aria: element?.getAttribute("aria-label") ?? null, text: text(element?.querySelector("p") ?? null) };
}
/** The expected dialog for a participant label in a language. */
export const dialogFor = (label: string, lang: Lang = "en") => ({ open: true, aria: W[lang].dialogAria(label), text: W[lang].dialogText(label) });
export function dialogButton(name: string): HTMLButtonElement | null {
  const element = dialog();
  if (!element) return null;
  return (within(element).queryAllByRole("button", { name })[0] as HTMLButtonElement | undefined) ?? null;
}
export const NAV: Readonly<Record<Lang, Readonly<Record<string, string>>>> = {
  en: { tasks: "Tasks", calendar: "Calendar", habits: "Habits", statistics: "Statistics" },
  zh: { tasks: "任务", calendar: "日历", habits: "习惯", statistics: "统计" },
};
/** Rule 13: the AppRail module button by its accessible name, activated by a single click. */
export function clickRail(id: string, lang: Lang = "en"): void {
  const items = document.querySelector<HTMLElement>(".app-rail .rail-items");
  pre(items, "the AppRail .rail-items is mounted");
  const found = (within(items).queryAllByRole("button", { name: NAV[lang][id] ?? id }) as HTMLElement[]).filter(element => element.classList.contains("rail-btn"));
  pre(found.length === 1, `exactly one rail button "${NAV[lang][id]}" (got ${found.length})`);
  pre(!found[0]!.classList.contains("dragging"), "the rail button is not .dragging");
  pre(drags.starts === 0, `no rail gesture in progress (dragstart events since mount: ${drags.starts})`);
  fireEvent.click(found[0]!);
}
/** Rule 11: the Appearance and rail-order statuses are absent (precondition). */
export function census(tag: string): void {
  pre(document.querySelector('[data-testid="appearance-status"]') === null, `${tag}: the Appearance status is absent (Topbar census)`);
  pre(document.querySelector('[data-testid="rail-order-status"]') === null, `${tag}: the rail-order status is absent (Topbar census)`);
}
/** The Header note's account physical key, computed by the case before mounting (F-B002 rule 9). */
export function headerNoteKey(): string {
  return accountScope.physicalKey("xai_pref_dashboard_header_note");
}
export const HEADER = {
  en: { edit: "Edit dashboard note", save: "Save dashboard note", retry: "Retry note save" },
  zh: { edit: "编辑工作台备注", save: "保存工作台备注", retry: "重试备注保存" },
} as const;
export const HEADER_ORIGINAL = "Original note";
export const HEADER_DRAFT = "Latest unsaved note";
/** Seeds the accepted Header fixture bytes (the accepted Header departure suites' seeds). */
export function seedHeader(noteKey: string): void {
  seedKey(noteKey, HEADER_ORIGINAL);
  seedKey("xai_pref_dashboard_header_note_x", "0");
}
/** A failed Header note save through the Header's own UI (quota scoped to the note key). */
export async function failHeaderSave(noteKey: string, lang: Lang = "en"): Promise<Fault> {
  const header = document.querySelector<HTMLElement>(".module-dashboard");
  pre(header, "the Dashboard module is mounted");
  const edit = within(header).queryAllByRole("button", { name: HEADER[lang].edit });
  pre(edit.length === 1, "exactly one Edit dashboard note button");
  fireEvent.click(edit[0]!);
  const input = document.querySelector<HTMLInputElement>(".dash-note input");
  pre(input, "the Header note input opened");
  fireEvent.change(input, { target: { value: HEADER_DRAFT } });
  const noteQuota = fault({ op: "set", key: noteKey, label: "header note quota" });
  const save = within(header).queryAllByRole("button", { name: HEADER[lang].save });
  pre(save.length === 1, "exactly one Save dashboard note button");
  fireEvent.click(save[0]!);
  await flush();
  fired(noteQuota, "header note save");
  pre(raw(noteKey) === HEADER_ORIGINAL, "the Header note bytes are unchanged after the failed save");
  return noteQuota;
}
export function headerRetry(lang: Lang = "en"): HTMLButtonElement {
  const found = within(document.querySelector<HTMLElement>(".module-dashboard")!).queryAllByRole("button", { name: HEADER[lang].retry });
  pre(found.length === 1, "exactly one Header Retry note save button");
  return found[0] as HTMLButtonElement;
}
/** A failed Clock choice (quota scoped to that key; the fault stays armed until the case turns it off). */
export async function failChoice(field: Field, value: string, options: { generic?: boolean } = {}): Promise<Fault> {
  const injected = quota(field, options);
  choose(field, value);
  await flush();
  fired(injected, `${field} write of ${value}`);
  return injected;
}

// ---------------------------------------------------------------------------
// Widget drag (pointer events through the real WidgetShell, contract section 3 item 6)
// ---------------------------------------------------------------------------

export function clockShell(lang: Lang = "en"): HTMLElement {
  const name = lang === "zh" ? "时钟组件" : "Clock widget";
  const found = Array.from(document.querySelectorAll<HTMLElement>(".widget-shell")).filter(element => element.getAttribute("aria-label") === name);
  pre(found.length === 1, `exactly one Clock .widget-shell "${name}" (got ${found.length})`);
  return found[0]!;
}
/** Starts a widget drag on the Clock shell's own surface (not on a button or [data-no-drag]). */
export async function startWidgetDrag(lang: Lang = "en"): Promise<void> {
  const shell = clockShell(lang);
  fireEvent.pointerDown(shell, { button: 0, clientX: 5, clientY: 5, pointerId: 1 });
  await flush(2);
  pre(document.querySelector('[data-testid="widget-ghost"]'), "the widget ghost rendered after pointerdown on the Clock shell");
}
/** Moves the pointer away from every widget box (no reorder in jsdom), then releases. */
export async function moveWidgetDrag(): Promise<void> {
  await act(async () => { window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5000, clientY: 5000, pointerId: 1 } as PointerEventInit)); });
  await flush(2);
}
export async function endWidgetDrag(): Promise<void> {
  await act(async () => { window.dispatchEvent(new PointerEvent("pointerup", { clientX: 5000, clientY: 5000, pointerId: 1 } as PointerEventInit)); });
  await flush();
  pre(document.querySelector('[data-testid="widget-ghost"]') === null, "the widget ghost unmounted after pointerup");
}

// ---------------------------------------------------------------------------
// Per-test setup and teardown
// ---------------------------------------------------------------------------

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
  renderErrors.length = 0;
  confirmer.calls.length = 0;
  confirmer.answer = true;
  confirmer.answers.length = 0;
  dispatched.length = 0;
  oracleSent.clear();
  bus.length = 0;
  drags.starts = 0;
  installEnvironment();
  installDialog();
  installLocks();
  const scope = activate(OWNER_A, "g1");
  installStorage();
  installConfirm();
  installDispatch();
  installBus();
  document.addEventListener("dragstart", onDragStart, true);
  process.on("unhandledRejection", onRejection);
  window.addEventListener("error", onWindowError);
  return scope;
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
  restoreDownload();
  vi.unstubAllGlobals();
  document.removeEventListener("dragstart", onDragStart, true);
  process.off("unhandledRejection", onRejection);
  window.removeEventListener("error", onWindowError);
  const errors = lockState.manager?.errors ?? [];
  lockState.missing = false;
  if (unmountFailure) throw unmountFailure;
  if (nested !== 0) throw new Error(`PRECONDITION: F-B002 the storage wrappers re-entered Storage ${nested} time(s)`);
  if (errors.length > 0) throw new Error(`PRECONDITION: the Web Lock fixture could not serve a request: ${errors.join("; ")}`);
}
/** The common end-of-case gates: no render error, no runtime error, no unhandled rejection (business). */
export function expectQuiet(tag: string): void {
  expect({ render: renderErrors, runtime: runtimeErrors, rejections: rejections.map(String) }, `${tag}: zero render errors, runtime errors and unhandled rejections`).toStrictEqual({ render: [], runtime: [], rejections: [] });
}
