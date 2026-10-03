/**
 * Sol jsdom fixture: Settings Sticky Note all5 recovery caller (CP-STICKY-01, contract section 12).
 *
 * The product is loaded unmodified from the archive under test: the real Sticky pane, the real
 * @repo/plugin-web-storage hooks, mutation engine, registry, ownership and accountScope controller.
 * Nothing in the persistence path is mocked. The fixture owns only:
 *   - an exclusive, asynchronous Web Lock manager (a pass-through stub cannot prove a held lock);
 *   - an attempt-counting Storage injector that logs every getItem/setItem/removeItem attempt on
 *     localStorage BEFORE delegating (and before any injected fault throws);
 *   - a host guard registry that mirrors the departure coordinator's token-keyed registration;
 *   - a download harness (object URLs, anchor append and click are observed, never navigated).
 *
 * Any error whose message starts with `PRECONDITION:` is a fixture or selector failure. It is never a
 * product failure. Business assertions carry an `H<n>:` or section tag in their message instead.
 */
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { expect, vi } from "vitest";
import { accountScope, generationMarkerKey, prefMutationLockName, type AccountScope } from "@repo/plugin-web-storage";
import { stickyPane } from "../../../packages/plugin-web-settings-rest/src/panes/stickyPane";

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
// Field table (contract section 2)
// ---------------------------------------------------------------------------

export type FieldId = "color" | "font" | "pin_default" | "restore_size" | "grid_spacing";
export type Value = string | boolean;
export type Kind = "palette" | "select" | "switch" | "cards";
export interface FieldCase {
  readonly field: FieldId;
  readonly key: string;
  readonly label: string;
  readonly labelZh: string;
  readonly kind: Kind;
  readonly default: Value;
  readonly domain: readonly Value[];
  /** A valid non-default stored value used as the starting state. */
  readonly seed: Value;
  /** The value one ordinary edit from `seed` produces (one click for a switch). */
  readonly alt: Value;
}

const keyOf = (field: FieldId) => `xai_pref_sticky_${field}`;
export const COLOR_IDS = ["sun", "peach", "coral", "sky", "indigo", "lilac", "mint", "white", "silver", "graphite", "navy", "midnight", "random"] as const;
export const cases: readonly FieldCase[] = [
  { field: "color", key: keyOf("color"), label: "Default Color", labelZh: "默认颜色", kind: "palette", default: "sun", domain: COLOR_IDS, seed: "sky", alt: "mint" },
  { field: "font", key: keyOf("font"), label: "Font Size", labelZh: "字体大小", kind: "select", default: "large", domain: ["small", "normal", "large", "xl"], seed: "small", alt: "xl" },
  { field: "pin_default", key: keyOf("pin_default"), label: "Pin by Default", labelZh: "默认置顶", kind: "switch", default: true, domain: [true, false], seed: false, alt: true },
  { field: "restore_size", key: keyOf("restore_size"), label: "Restore Default Size", labelZh: "恢复默认尺寸", kind: "switch", default: false, domain: [true, false], seed: true, alt: false },
  { field: "grid_spacing", key: keyOf("grid_spacing"), label: "Default Grid Spacing", labelZh: "默认网格间距", kind: "cards", default: "normal", domain: ["none", "normal", "large", "xl"], seed: "large", alt: "xl" },
];
export const byField = (field: FieldId): FieldCase => {
  const entry = cases.find(item => item.field === field);
  pre(entry, `field ${field} exists in the fixture table`);
  return entry;
};
export const color = byField("color");
export const font = byField("font");
export const pin = byField("pin_default");
export const restore = byField("restore_size");
export const spacing = byField("grid_spacing");
export const stickyKeys: readonly string[] = cases.map(entry => entry.key);
export const others = (entry: FieldCase): FieldCase[] => cases.filter(item => item !== entry);
export const raw = (value: Value): string => String(value);
export const keyLock = (entry: FieldCase): string => prefMutationLockName(entry.key);

// ---------------------------------------------------------------------------
// Normative wording (contract section 5, item 8)
// ---------------------------------------------------------------------------

export type Lang = "en" | "zh";
export const W = {
  en: {
    retry: (label: string) => `Retry ${label}`,
    discard: (label: string) => `Discard ${label}`,
    reload: (label: string) => `Reload ${label}`,
    exportDraft: "Export Sticky Note draft",
    discardAll: "Discard all changes",
    saving: (label: string) => `${label} is saving.`,
    notSaved: (label: string) => `${label} was not saved.`,
    unavailable: (label: string) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
    invalid: (label: string) => `${label} has an invalid value.`,
    saved: "Sticky Note settings saved.",
    exportFailed: "Export failed. Please retry.",
    guardLabel: "Sticky Note",
  },
  zh: {
    retry: (label: string) => `重试 ${label}`,
    discard: (label: string) => `放弃 ${label}`,
    reload: (label: string) => `重新读取 ${label}`,
    exportDraft: "导出便签草稿",
    discardAll: "放弃全部更改",
    saving: (label: string) => `${label}正在保存。`,
    notSaved: (label: string) => `${label}未保存。`,
    unavailable: (label: string) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
    invalid: (label: string) => `${label}格式无效。`,
    saved: "便签设置已保存。",
    exportFailed: "导出失败，请重试。",
    guardLabel: "便签",
  },
} as const;
export const labelOf = (entry: FieldCase, lang: Lang): string => (lang === "zh" ? entry.labelZh : entry.label);

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
  /** Arm only after a successful setItem of this key (and value, when given). */
  readonly afterSet?: { readonly key: string; readonly value?: string };
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
  for (const fault of store.faults) {
    if (!fault.active || !fault.armed || fault.remaining === 0) continue;
    if (fault.op !== "any" && fault.op !== op) continue;
    if (fault.key !== undefined && (typeof fault.key === "function" ? !fault.key(attempt.key) : fault.key !== attempt.key)) continue;
    if (fault.value !== undefined && attempt.value !== fault.value) continue;
    fault.fired += 1;
    if (fault.remaining > 0) fault.remaining -= 1;
    attempt.threw = true;
    throw op === "set" ? new DOMException(`sticky-sol ${fault.label}`, "QuotaExceededError") : new Error(`sticky-sol ${fault.label}`);
  }
}
function armAfterSet(key: string, value: string): void {
  for (const fault of store.faults) {
    if (fault.active && !fault.armed && fault.afterSet && fault.afterSet.key === key && (fault.afterSet.value === undefined || fault.afterSet.value === value)) fault.armed = true;
  }
}
const wrappedGet = function getItem(this: Storage, key: string): string | null {
  intercept("get", this, key);
  return nativeGet.call(this, key);
};
const wrappedSet = function setItem(this: Storage, key: string, value: string): void {
  intercept("set", this, key, value);
  nativeSet.call(this, key, value);
  if (this === localStorage) armAfterSet(String(key), String(value));
};
const wrappedRemove = function removeItem(this: Storage, key: string): void {
  intercept("remove", this, key);
  nativeRemove.call(this, key);
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
  const created: Fault = { ...spec, fired: 0, armed: spec.afterSet === undefined, remaining: spec.times ?? -1, active: true, off() { created.active = false; } };
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
export const writesOn = (from: number, entry: FieldCase): string[] => attempts(from, [entry.key], ["set", "remove"]).map(item => (item.op === "set" ? item.value! : "<remove>"));
export const stickyWrites = (from: number): string[] => attempts(from, stickyKeys, ["set", "remove"]).map(item => `${item.op}:${item.key}${item.op === "set" ? `=${item.value}` : ""}`);
export const touches = (from: number, entries: readonly FieldCase[]): string[] => attempts(from, entries.map(entry => entry.key)).map(item => `${item.op}:${item.key}`);
export const accountTouches = (): string[] => store.log.filter(item => /^xai:(account|demo):v1:/.test(item.key)).map(item => `${item.op}:${item.key}`);

/** Total denial for get/set/remove on every key, proven to fire through the attempt counter. */
export function denyAllStorage(): Fault {
  const denial = fault({ op: "any", label: "total storage denial" });
  const from = mark();
  let thrown = 0;
  for (const run of [() => localStorage.getItem("sticky-sol-probe"), () => localStorage.setItem("sticky-sol-probe", "x"), () => localStorage.removeItem("sticky-sol-probe")]) {
    try { run(); } catch { thrown += 1; }
  }
  pre(thrown === 3 && denial.fired === 3 && attempts(from).length === 3, "total storage denial armed and observed for getItem, setItem and removeItem through the attempt counter");
  return denial;
}

export const bytes = (entry: FieldCase): string | null => nativeGet.call(localStorage, entry.key);
export const bytesAll = (): Record<FieldId, string | null> => Object.fromEntries(cases.map(entry => [entry.field, bytes(entry)])) as Record<FieldId, string | null>;
export function seed(entry: FieldCase, value: string): void {
  nativeSet.call(localStorage, entry.key, value);
  pre(nativeGet.call(localStorage, entry.key) === value, `seeded bytes ${entry.key}=${JSON.stringify(value)} present`);
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
      return Promise.reject(new TypeError("sticky-sol lock fixture: callback required"));
    }
    if (options.steal) errors.push(`steal is unsupported by the fixture (${String(name)})`);
    const mode: LockMode = options.mode === "shared" ? "shared" : "exclusive";
    const record: LockRecord = { id: ++nextId, name: String(name), mode, owner, state: "waiting" };
    log.push(record);
    if (owner === "product" && denied.has(record.name)) {
      record.state = "rejected";
      return Promise.reject(new Error(`sticky-sol web lock request rejected (${record.name})`));
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

export function activate(owner: string, generation = "g1"): AccountScope {
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "sticky-sol", previous: null }));
  const scope = accountScope.activate(accountScope.lock(owner), generation);
  pre(accountScope.capture() === scope && scope.kind === "account" && scope.accountId === owner && scope.generation === generation, `account scope ${owner}/${generation} active`);
  return scope;
}
export function lockAccount(owner = "sticky-sol-locked"): AccountScope {
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
// Mounting, controls and displayed state
// ---------------------------------------------------------------------------

export type Ui = ReturnType<typeof render> & { lang: Lang; rerenderPane(lang?: Lang): void };
export function mount(lang: Lang = "en", options: { guard?: boolean } = {}): Ui {
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  const withGuard = options.guard !== false;
  const props = (current: Lang) => (withGuard ? { lang: current, registerDepartureGuard } : { lang: current });
  const ui = render(stickyPane.render(props(lang))) as Ui;
  ui.lang = lang;
  ui.rerenderPane = (next: Lang = ui.lang) => { ui.lang = next; ui.rerender(stickyPane.render(props(next))); };
  return ui;
}

export function swatch(ui: Ui, id: string): HTMLButtonElement {
  const element = ui.container.querySelector<HTMLButtonElement>(`[data-color-id="${id}"]`);
  pre(element, `swatch [data-color-id="${id}"] found`);
  return element;
}
export function card(ui: Ui, id: string): HTMLButtonElement {
  const element = ui.container.querySelector<HTMLButtonElement>(`[data-spacing-id="${id}"]`);
  pre(element, `spacing card [data-spacing-id="${id}"] found`);
  return element;
}
export function fontSelect(ui: Ui): HTMLSelectElement {
  const label = labelOf(font, ui.lang);
  const element = ui.container.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`);
  pre(element, `font select [aria-label="${label}"] found`);
  return element;
}
export function switchOf(ui: Ui, entry: FieldCase): HTMLElement {
  pre(entry.kind === "switch", `${entry.field} is a switch field`);
  const name = labelOf(entry, ui.lang);
  const found = ui.queryAllByRole("switch", { name });
  pre(found.length === 1, `exactly one switch named "${name}" found (got ${found.length})`);
  return found[0] as HTMLElement;
}
function groupControls(ui: Ui, entry: FieldCase): HTMLElement[] {
  const attribute = entry.kind === "palette" ? "data-color-id" : "data-spacing-id";
  const all = Array.from(ui.container.querySelectorAll<HTMLElement>(`[${attribute}]`));
  pre(all.length === entry.domain.length, `${entry.domain.length} [${attribute}] controls found (got ${all.length})`);
  return all;
}
/** The displayed value: pressed swatch/card id, select value, or switch aria-checked. */
export function shown(ui: Ui, entry: FieldCase): Value | null | string {
  if (entry.kind === "palette" || entry.kind === "cards") {
    const attribute = entry.kind === "palette" ? "data-color-id" : "data-spacing-id";
    const pressed = groupControls(ui, entry).filter(element => element.getAttribute("aria-pressed") === "true").map(element => element.getAttribute(attribute)!);
    if (pressed.length === 1) return pressed[0]!;
    return pressed.length === 0 ? null : `multiple:${pressed.join(",")}`;
  }
  if (entry.kind === "select") return fontSelect(ui).value;
  const checked = switchOf(ui, entry).getAttribute("aria-checked");
  return checked === "true" ? true : checked === "false" ? false : `aria-checked:${String(checked)}`;
}
export const shownAll = (ui: Ui): Record<FieldId, Value | null | string> => Object.fromEntries(cases.map(entry => [entry.field, shown(ui, entry)])) as Record<FieldId, Value | null | string>;
export function enabled(ui: Ui, entry: FieldCase): boolean {
  const elements: HTMLElement[] = entry.kind === "palette" || entry.kind === "cards" ? groupControls(ui, entry) : entry.kind === "select" ? [fontSelect(ui)] : [switchOf(ui, entry)];
  return elements.every(element => !(element as HTMLButtonElement).disabled && element.getAttribute("aria-disabled") !== "true");
}

/** Choose a value through the public control (switches click only when the shown state differs). */
export function choose(ui: Ui, entry: FieldCase, value: Value): void {
  if (entry.kind === "palette") fireEvent.click(swatch(ui, String(value)));
  else if (entry.kind === "cards") fireEvent.click(card(ui, String(value)));
  else if (entry.kind === "select") {
    const select = fontSelect(ui);
    pre(Array.from(select.options).some(option => option.value === value), `font option "${String(value)}" exists`);
    fireEvent.change(select, { target: { value } });
  } else {
    pre(typeof value === "boolean", `${entry.field} target is a boolean`);
    if (shown(ui, entry) !== value) fireEvent.click(switchOf(ui, entry));
  }
}
export function toggle(ui: Ui, entry: FieldCase): void { fireEvent.click(switchOf(ui, entry)); }
/** One ordinary edit from `seed` to `alt` (one click for a switch). */
export function chooseAlt(ui: Ui, entry: FieldCase): void {
  if (entry.kind === "switch") toggle(ui, entry);
  else choose(ui, entry, entry.alt);
}
/** Malformed DOM input on the font select (contract section 5, item 3). */
export function malformFont(ui: Ui, variant: "injected" | "empty" | "unmatched" = "injected"): void {
  const select = fontSelect(ui);
  if (variant === "unmatched") {
    select.value = "bogus";
    pre(select.selectedIndex === -1 && select.value === "", "an unmatched font assignment leaves no selected option");
  } else {
    const option = document.createElement("option");
    option.value = variant === "injected" ? "huge" : "";
    option.textContent = variant === "injected" ? "Huge" : "(empty)";
    select.appendChild(option);
    select.value = option.value;
    pre(select.selectedOptions[0] === option, `${variant} font option selected before the change event`);
  }
  fireEvent.change(select);
}

// ---------------------------------------------------------------------------
// Recovery UI by role and name, and visible text (contract section 5 wording)
// ---------------------------------------------------------------------------

export function button(ui: Ui, name: string): HTMLButtonElement | null {
  return (ui.queryAllByRole("button", { name })[0] as HTMLButtonElement | undefined) ?? null;
}
export const retryOf = (ui: Ui, entry: FieldCase): HTMLButtonElement | null => button(ui, W[ui.lang].retry(labelOf(entry, ui.lang)));
export const discardOf = (ui: Ui, entry: FieldCase): HTMLButtonElement | null => button(ui, W[ui.lang].discard(labelOf(entry, ui.lang)));
export const reloadOf = (ui: Ui, entry: FieldCase): HTMLButtonElement | null => button(ui, W[ui.lang].reload(labelOf(entry, ui.lang)));
export const exportButton = (ui: Ui): HTMLButtonElement | null => button(ui, W[ui.lang].exportDraft);
export const discardAllButton = (ui: Ui): HTMLButtonElement | null => button(ui, W[ui.lang].discardAll);
export const pageText = (): string => (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
export const says = (message: string): boolean => pageText().includes(message);
export const msg = {
  saving: (entry: FieldCase, lang: Lang = "en") => W[lang].saving(labelOf(entry, lang)),
  notSaved: (entry: FieldCase, lang: Lang = "en") => W[lang].notSaved(labelOf(entry, lang)),
  unavailable: (entry: FieldCase, lang: Lang = "en") => W[lang].unavailable(labelOf(entry, lang)),
  invalid: (entry: FieldCase, lang: Lang = "en") => W[lang].invalid(labelOf(entry, lang)),
};

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
    const url = `blob:sticky-sol/${++counter}`;
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
export const envelope = (values: Record<string, Value>) => ({ version: 1, kind: "sticky-draft", values: { device: values } });
export async function expectSingleDownload(harness: Download, expected: unknown, tag: string): Promise<void> {
  expect(harness.clicks.length, `${tag}: exactly one download click`).toBe(1);
  expect(harness.clicks[0]?.download, `${tag}: filename sticky-draft.json`).toBe("sticky-draft.json");
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
  installLocks();
  installStorage();
  process.on("unhandledRejection", onRejection);
  return activate("sticky-sol-A", "g1");
}
export function teardown(): void {
  let unmountFailure: unknown = null;
  try { cleanup(); } catch (error) { unmountFailure = error; }
  uninstallStorage();
  uninstallLocks();
  restoreDownload();
  vi.unstubAllGlobals();
  process.off("unhandledRejection", onRejection);
  const errors = lockState.manager?.errors ?? [];
  lockState.missing = false;
  if (unmountFailure) throw unmountFailure;
  if (errors.length > 0) throw new Error(`PRECONDITION: the Web Lock fixture could not serve a request: ${errors.join("; ")}`);
}
