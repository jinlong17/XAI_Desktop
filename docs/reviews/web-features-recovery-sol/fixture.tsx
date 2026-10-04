/**
 * Sol jsdom fixture: Settings Features caller, all 8 module toggles and Reset to defaults
 * (CP-FEATURES-01, contract docs/reviews/web-features-recovery-contract/contract.md section 12).
 *
 * The product is loaded unmodified from the immutable archive under test: the real Features pane
 * (`featuresPane` from @repo/plugin-web-settings-features-panel), the real @repo/plugin-web-storage hooks,
 * mutation engine, registry, codec, ownership and accountScope controller, and the real Settings shell
 * atoms. Nothing in the persistence path is mocked. The fixture owns only:
 *   - an attempt-counting Storage injector that records every getItem/setItem/removeItem attempt on
 *     localStorage BEFORE delegating (and before any injected fault throws);
 *   - an exclusive, asynchronous Web Lock manager installed as navigator.locks (a pass-through stub cannot
 *     prove a held lock);
 *   - a window.confirm recorder (the answer is chosen per case);
 *   - an instrumented window.dispatchEvent that records every dispatched StorageEvent and its key;
 *   - a host guard registry that mirrors the departure coordinator's token-keyed registration;
 *   - a download harness (object URLs, anchor append and click are observed, never navigated);
 *   - real accountScope transitions.
 *
 * Any error whose message starts with `PRECONDITION:` is a fixture or selector failure. It is never a product
 * failure. Business assertions carry an `H<n>:`, `D<n>:` or section tag in their message instead.
 */
import * as React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { expect, vi } from "vitest";
import { accountScope, generationMarkerKey, prefMutationLockName, type AccountScope } from "@repo/plugin-web-storage";
import { featuresPane } from "@repo/plugin-web-settings-features-panel";

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

// ---------------------------------------------------------------------------
// Field table (contract section 2). Stated independently of the product; bytes.test.tsx checks the
// product's featureIdOrder / featurePrefKey against it.
// ---------------------------------------------------------------------------

export type FieldId = "tasks" | "board" | "dashboard" | "calendar" | "matrix" | "pomodoro" | "habits" | "meditation";
export interface Field {
  readonly id: FieldId;
  readonly key: string;
  readonly label: string;
  readonly labelZh: string;
}
const keyOf = (id: FieldId) => `xai_pref_features_${id}`;
export const FIELDS: readonly Field[] = [
  { id: "tasks", key: keyOf("tasks"), label: "Tasks", labelZh: "任务" },
  { id: "board", key: keyOf("board"), label: "Boards", labelZh: "项目板" },
  { id: "dashboard", key: keyOf("dashboard"), label: "Dashboard", labelZh: "工作台" },
  { id: "calendar", key: keyOf("calendar"), label: "Calendar", labelZh: "日历" },
  { id: "matrix", key: keyOf("matrix"), label: "Matrix", labelZh: "四象限" },
  { id: "pomodoro", key: keyOf("pomodoro"), label: "Pomodoro", labelZh: "番茄钟" },
  { id: "habits", key: keyOf("habits"), label: "Habits", labelZh: "习惯" },
  { id: "meditation", key: keyOf("meditation"), label: "Meditation", labelZh: "冥想" },
];
export const IDS: readonly FieldId[] = FIELDS.map(field => field.id);
export const KEYS: readonly string[] = FIELDS.map(field => field.key);
export const byId = (id: FieldId): Field => {
  const field = FIELDS.find(entry => entry.id === id);
  pre(field, `field ${id} exists in the fixture table`);
  return field;
};
export const others = (field: Field): Field[] => FIELDS.filter(entry => entry !== field);
export const raw = (value: boolean): string => (value ? "true" : "false");
export const keyLock = (field: Field): string => prefMutationLockName(field.key);
export const tasks = byId("tasks");
export const board = byId("board");
export const dashboard = byId("dashboard");
export const calendar = byId("calendar");
export const matrix = byId("matrix");
export const pomodoro = byId("pomodoro");
export const habits = byId("habits");
export const meditation = byId("meditation");

// ---------------------------------------------------------------------------
// Normative wording (contract section 5 table)
// ---------------------------------------------------------------------------

export type Lang = "en" | "zh";
export const W = {
  en: {
    retry: (label: string) => `Retry ${label}`,
    discard: (label: string) => `Discard ${label}`,
    reload: (label: string) => `Reload ${label}`,
    reset: "Reset to defaults",
    exportDraft: "Export Features draft",
    discardAll: "Discard all changes",
    saving: (label: string) => `${label} is saving.`,
    resetting: (label: string) => `${label} is being reset to its default.`,
    notSaved: (label: string) => `${label} was not saved.`,
    notReset: (label: string) => `${label} was not reset to its default.`,
    unavailable: (label: string) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
    saved: "Features settings saved.",
    restored: "Defaults restored.",
    exportFailed: "Export failed. Please retry.",
    confirm: "Turn all 8 modules back on? This only changes which modules are shown; your data is kept.",
    guardLabel: "Features",
  },
  zh: {
    retry: (label: string) => `重试 ${label}`,
    discard: (label: string) => `放弃 ${label}`,
    reload: (label: string) => `重新读取 ${label}`,
    reset: "恢复默认",
    exportDraft: "导出功能草稿",
    discardAll: "放弃全部更改",
    saving: (label: string) => `${label}正在保存。`,
    resetting: (label: string) => `${label}正在恢复默认。`,
    notSaved: (label: string) => `${label}未保存。`,
    notReset: (label: string) => `${label}未恢复默认。`,
    unavailable: (label: string) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
    saved: "功能设置已保存。",
    restored: "已恢复默认设置。",
    exportFailed: "导出失败，请重试。",
    confirm: "将全部 8 个模块恢复为开启？这只改变显示哪些模块，数据会保留。",
    guardLabel: "功能",
  },
} as const;
export const labelOf = (field: Field, lang: Lang): string => (lang === "zh" ? field.labelZh : field.label);
export const msg = {
  saving: (field: Field, lang: Lang = "en") => W[lang].saving(labelOf(field, lang)),
  resetting: (field: Field, lang: Lang = "en") => W[lang].resetting(labelOf(field, lang)),
  notSaved: (field: Field, lang: Lang = "en") => W[lang].notSaved(labelOf(field, lang)),
  notReset: (field: Field, lang: Lang = "en") => W[lang].notReset(labelOf(field, lang)),
  unavailable: (field: Field, lang: Lang = "en") => W[lang].unavailable(labelOf(field, lang)),
};

// ---------------------------------------------------------------------------
// Attempt-counting Storage injector
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
  readonly label: string;
}
export interface Fault extends FaultSpec { fired: number; armed: boolean; remaining: number; active: boolean; off(): void }

export const nativeGet = Storage.prototype.getItem;
export const nativeSet = Storage.prototype.setItem;
export const nativeRemove = Storage.prototype.removeItem;
export const store: { log: Attempt[]; faults: Fault[] } = { log: [], faults: [] };

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
    throw op === "set" ? new DOMException(`features-sol ${entry.label}`, "QuotaExceededError") : new Error(`features-sol ${entry.label}`);
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
const wrappedGet = function getItem(this: Storage, key: string): string | null {
  intercept("get", this, key);
  return nativeGet.call(this, key);
};
const wrappedSet = function setItem(this: Storage, key: string, value: string): void {
  intercept("set", this, key, value);
  nativeSet.call(this, key, value);
  if (this === localStorage) arm("set", String(key), String(value));
};
const wrappedRemove = function removeItem(this: Storage, key: string): void {
  intercept("remove", this, key);
  nativeRemove.call(this, key);
  if (this === localStorage) arm("remove", String(key));
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
/** Every set/remove attempt on one field since `from`, as written values ("<remove>" for removes). */
export const writesOn = (from: number, field: Field): string[] => attempts(from, [field.key], ["set", "remove"]).map(item => (item.op === "set" ? item.value! : "<remove>"));
export const removesOn = (from: number, field: Field): number => attempts(from, [field.key], ["remove"]).length;
/** Every set/remove attempt on the 8 Features keys since `from`. */
export const featureWrites = (from: number): string[] => attempts(from, KEYS, ["set", "remove"]).map(item => `${item.op}:${item.key}${item.op === "set" ? `=${item.value}` : ""}`);
/** Every attempt (get/set/remove) on the given fields since `from`. */
export const touches = (from: number, fields: readonly Field[]): string[] => attempts(from, fields.map(field => field.key)).map(item => `${item.op}:${item.key}`);
export const accountTouches = (): string[] => store.log.filter(item => /^xai:(account|demo):v1:/.test(item.key)).map(item => `${item.op}:${item.key}`);

/** Total denial for get/set/remove on every key, proven to fire through the attempt counter. */
export function denyAllStorage(): Fault {
  const denial = fault({ op: "any", label: "total storage denial" });
  const from = mark();
  let thrown = 0;
  for (const run of [() => localStorage.getItem("features-sol-probe"), () => localStorage.setItem("features-sol-probe", "x"), () => localStorage.removeItem("features-sol-probe")]) {
    try { run(); } catch { thrown += 1; }
  }
  pre(thrown === 3 && denial.fired === 3 && attempts(from).length === 3, "total storage denial armed and observed for getItem, setItem and removeItem through the attempt counter");
  return denial;
}

export const bytes = (field: Field): string | null => nativeGet.call(localStorage, field.key);
export const bytesAll = (): Record<FieldId, string | null> => Object.fromEntries(FIELDS.map(field => [field.id, bytes(field)])) as Record<FieldId, string | null>;
export function seed(field: Field, value: string): void {
  nativeSet.call(localStorage, field.key, value);
  pre(nativeGet.call(localStorage, field.key) === value, `seeded bytes ${field.key}=${JSON.stringify(value)} present`);
}
export function seedKey(key: string, value: string): void {
  nativeSet.call(localStorage, key, value);
  pre(nativeGet.call(localStorage, key) === value, `seeded bytes ${key}=${JSON.stringify(value)} present`);
}
/** Snapshot of every localStorage key except the 8 Features keys, read without the injector. */
export function unrelatedSnapshot(): Record<string, string | null> {
  const names: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const name = localStorage.key(index);
    if (name !== null && !KEYS.includes(name)) names.push(name);
  }
  names.sort();
  return Object.fromEntries(names.map(name => [name, nativeGet.call(localStorage, name)]));
}

// ---------------------------------------------------------------------------
// Exclusive asynchronous Web Lock fixture
// ---------------------------------------------------------------------------

type LockMode = "exclusive" | "shared";
export type LockOwner = "test" | "product";
export interface LockRecord { readonly id: number; readonly name: string; readonly mode: LockMode; readonly owner: LockOwner; state: "waiting" | "held" | "released" | "rejected" | "aborted" | "not-granted" }
type LockCallback<T> = (lock: { name: string; mode: LockMode } | null) => T | Promise<T>;
interface LockOptionsShape { mode?: LockMode; ifAvailable?: boolean; steal?: boolean; signal?: AbortSignal }
interface Waiter { record: LockRecord; grant: () => void }

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
  // Grants are always asynchronous, like the browser lock manager.
  const schedule = (name: string): void => { queueMicrotask(() => drain(name)); };

  function request<T>(owner: LockOwner, name: string, optionsOrCallback: unknown, maybeCallback?: unknown): Promise<T> {
    const options = (typeof optionsOrCallback === "function" ? {} : (optionsOrCallback ?? {})) as LockOptionsShape;
    const callback = (typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback) as LockCallback<T> | undefined;
    if (typeof callback !== "function") {
      errors.push(`request(${String(name)}) without a callback`);
      return Promise.reject(new TypeError("features-sol lock fixture: callback required"));
    }
    if (options.steal) errors.push(`steal is unsupported by the fixture (${String(name)})`);
    const mode: LockMode = options.mode === "shared" ? "shared" : "exclusive";
    const record: LockRecord = { id: ++nextId, name: String(name), mode, owner, state: "waiting" };
    log.push(record);
    if (owner === "product" && denied.has(record.name)) {
      record.state = "rejected";
      return Promise.reject(new Error(`features-sol web lock request rejected (${record.name})`));
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
    productNames(): string[] { return Array.from(new Set(log.filter(record => record.owner === "product").map(record => record.name))); },
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

export interface Holder { readonly name: string; release(): Promise<void> }
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

export const OWNER_A = "features-sol-A";
export const OWNER_B = "features-sol-B";
export function activate(owner: string, generation = "g1"): AccountScope {
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "features-sol", previous: null }));
  const scope = accountScope.activate(accountScope.lock(owner), generation);
  pre(accountScope.capture() === scope && scope.kind === "account" && scope.accountId === owner && scope.generation === generation, `account scope ${owner}/${generation} active`);
  return scope;
}
export function lockAccount(owner = "features-sol-locked"): AccountScope {
  const scope = accountScope.lock(owner);
  pre(accountScope.capture() === scope && scope.kind === "locked", "account scope locked");
  return scope;
}

// ---------------------------------------------------------------------------
// Host guard registry (mirrors departureCoordinator.registerDepartureGuard)
// ---------------------------------------------------------------------------

export interface Guard {
  readonly token: object;
  readonly label?: string;
  isBlocking(): boolean;
  isCurrent(): boolean;
  exportDraft(): void;
  discardDraft(): void;
}
export const host: { current: Guard | null; registered: Guard[]; unregistered: Guard[] } = { current: null, registered: [], unregistered: [] };
export function registerDepartureGuard(next: Guard): () => void {
  host.registered.push(next);
  host.current = next;
  return () => {
    host.unregistered.push(next);
    if (host.current?.token === next.token) host.current = null;
  };
}
export const guard = (): Guard | null => host.current;
/** Mirrors the coordinator's canBlock(): current registration, current and blocking. */
export const blocking = (): boolean => {
  const current = host.current;
  return Boolean(current && current.isCurrent() && current.isBlocking());
};

// ---------------------------------------------------------------------------
// window.confirm recorder and StorageEvent dispatch counter
// ---------------------------------------------------------------------------

export const confirmer: { calls: string[]; answer: boolean } = { calls: [], answer: true };
const recordConfirm = (message?: string): boolean => { confirmer.calls.push(String(message)); return confirmer.answer; };
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
/** StorageEvents with key === null dispatched since `from` (an index into `dispatched`). */
export const nullStorageEvents = (from = 0): number => dispatched.slice(from).filter(event => event.key === null).length;

// ---------------------------------------------------------------------------
// Mounting, controls and displayed state
// ---------------------------------------------------------------------------

export type Ui = ReturnType<typeof render> & { lang: Lang; rerenderPane(lang?: Lang): void };
export interface MountOptions { readonly guard?: boolean; readonly extra?: React.ReactNode }
export function mount(lang: Lang = "en", options: MountOptions = {}): Ui {
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  pre(confirmInstalled(), "window.confirm recorder installed");
  pre(dispatchInstalled(), "window.dispatchEvent StorageEvent counter installed");
  const withGuard = options.guard !== false;
  const tree = (current: Lang) => (
    <>
      {featuresPane.render(withGuard ? { lang: current, registerDepartureGuard } : { lang: current })}
      {options.extra ?? null}
    </>
  );
  const ui = render(tree(lang)) as Ui;
  ui.lang = lang;
  ui.rerenderPane = (next: Lang = ui.lang) => { ui.lang = next; ui.rerender(tree(next)); };
  return ui;
}

/** The stable switch selector `[data-feature-id="<id>"] [role="switch"]` (contract section 12). */
export function switchOf(ui: Ui, field: Field): HTMLElement {
  const found = ui.container.querySelectorAll<HTMLElement>(`[data-feature-id="${field.id}"] [role="switch"]`);
  pre(found.length === 1, `exactly one switch at [data-feature-id="${field.id}"] [role="switch"] (got ${found.length})`);
  return found[0]!;
}
/** The displayed value: the switch's aria-checked. */
export function shown(ui: Ui, field: Field): boolean | string {
  const checked = switchOf(ui, field).getAttribute("aria-checked");
  return checked === "true" ? true : checked === "false" ? false : `aria-checked:${String(checked)}`;
}
export const shownAll = (ui: Ui): Record<FieldId, boolean | string> => Object.fromEntries(FIELDS.map(field => [field.id, shown(ui, field)])) as Record<FieldId, boolean | string>;
export function enabled(ui: Ui, field: Field): boolean {
  const element = switchOf(ui, field) as HTMLButtonElement;
  return !element.disabled && element.getAttribute("aria-disabled") !== "true";
}
export function toggle(ui: Ui, field: Field): void { fireEvent.click(switchOf(ui, field)); }
/** Clicks the switch only when the displayed value differs from `value`. */
export function setTo(ui: Ui, field: Field, value: boolean): void {
  if (shown(ui, field) !== value) toggle(ui, field);
}

// ---------------------------------------------------------------------------
// Recovery UI by role and name, Reset to defaults, and visible text (contract section 5 wording)
// ---------------------------------------------------------------------------

export function button(ui: Ui, name: string): HTMLButtonElement | null {
  return (ui.queryAllByRole("button", { name })[0] as HTMLButtonElement | undefined) ?? null;
}
export const retryOf = (ui: Ui, field: Field): HTMLButtonElement | null => button(ui, W[ui.lang].retry(labelOf(field, ui.lang)));
export const discardOf = (ui: Ui, field: Field): HTMLButtonElement | null => button(ui, W[ui.lang].discard(labelOf(field, ui.lang)));
export const reloadOf = (ui: Ui, field: Field): HTMLButtonElement | null => button(ui, W[ui.lang].reload(labelOf(field, ui.lang)));
export const exportButton = (ui: Ui): HTMLButtonElement | null => button(ui, W[ui.lang].exportDraft);
export const discardAllButton = (ui: Ui): HTMLButtonElement | null => button(ui, W[ui.lang].discardAll);
/** Every "Reset to defaults"/"恢复默认" button, by role and name. */
export const resetButtons = (ui: Ui): HTMLButtonElement[] => ui.queryAllByRole("button", { name: W[ui.lang].reset }) as HTMLButtonElement[];
export function resetButton(ui: Ui): HTMLButtonElement {
  const found = resetButtons(ui);
  pre(found.length === 1, `exactly one "${W[ui.lang].reset}" button by role and name (got ${found.length})`);
  return found[0]!;
}
/** Activates Reset to defaults with the given confirmation answer; returns the confirm messages it produced. */
export function clickReset(ui: Ui, answer: boolean): string[] {
  const control = resetButton(ui);
  confirmer.answer = answer;
  const before = confirmer.calls.length;
  fireEvent.click(control);
  const produced = confirmer.calls.slice(before);
  expect(produced.length, "§6: one Reset to defaults activation asks window.confirm exactly once").toBe(1);
  return produced;
}
export const pageText = (): string => (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
export const says = (message: string): boolean => pageText().includes(message);

// ---------------------------------------------------------------------------
// beforeunload and unhandled rejections
// ---------------------------------------------------------------------------

/** Dispatches a cancelable beforeunload; a warning is a canceled event. Counts storage attempts in the handler. */
export function unload(): { warned: boolean; attempts: number } {
  const from = mark();
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return { warned: event.defaultPrevented, attempts: store.log.length - from };
}
export const warns = (): boolean => unload().warned;
export const rejections: unknown[] = [];
const onRejection = (reason: unknown): void => { rejections.push(reason); };

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
    const url = `blob:features-sol/${++counter}`;
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

/** Contract section 8 set/reset envelope. */
export type Change = Readonly<{ operation: "set"; value: boolean }> | Readonly<{ operation: "reset" }>;
export const SET = (value: boolean): Change => ({ operation: "set", value });
export const RESET: Change = { operation: "reset" };
export const envelope = (device: Partial<Record<FieldId, Change>>) => ({ version: 1, kind: "features-draft", changes: { device } });
export async function expectSingleDownload(harness: Download, expected: unknown, tag: string): Promise<void> {
  expect(harness.clicks.length, `${tag}: exactly one download click`).toBe(1);
  expect(harness.clicks[0]?.download, `${tag}: filename features-draft.json`).toBe("features-draft.json");
  expect(harness.created.length, `${tag}: exactly one object URL created`).toBe(1);
  expect(harness.clicks[0]?.href, `${tag}: the anchor targets the created object URL`).toBe(harness.created[0]);
  expect(harness.revoked, `${tag}: that same object URL revoked`).toEqual([harness.created[0]]);
  expect(harness.anchorsInDocument().length, `${tag}: the anchor was removed`).toBe(0);
  expect(await harness.json(0), `${tag}: whole envelope (deep equality)`).toStrictEqual(expected);
}

// ---------------------------------------------------------------------------
// Per-test setup and teardown
// ---------------------------------------------------------------------------

export function setup(): AccountScope {
  restoreDownload();
  uninstallStorage();
  localStorage.clear();
  store.log.length = 0;
  store.faults.length = 0;
  host.current = null;
  host.registered.length = 0;
  host.unregistered.length = 0;
  rejections.length = 0;
  confirmer.calls.length = 0;
  confirmer.answer = true;
  dispatched.length = 0;
  installLocks();
  installStorage();
  installConfirm();
  installDispatch();
  process.on("unhandledRejection", onRejection);
  return activate(OWNER_A, "g1");
}
export function teardown(): void {
  let unmountFailure: unknown = null;
  try { cleanup(); } catch (error) { unmountFailure = error; }
  uninstallStorage();
  uninstallLocks();
  uninstallConfirm();
  uninstallDispatch();
  restoreDownload();
  vi.unstubAllGlobals();
  process.off("unhandledRejection", onRejection);
  const errors = lockState.manager?.errors ?? [];
  lockState.missing = false;
  if (unmountFailure) throw unmountFailure;
  if (errors.length > 0) throw new Error(`PRECONDITION: the Web Lock fixture could not serve a request: ${errors.join("; ")}`);
}
