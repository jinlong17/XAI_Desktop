/**
 * Parent-role jsdom host fixture for the Settings Appearance caller (CP-APPEARANCE-01, control-plane batch 38;
 * contract docs/reviews/web-appearance-recovery-contract/contract.md r3, sections 5, 7, 9 rows a-s, 12 "Parent host
 * baseline" and 14 item E3). Imported only by ./host.test.tsx. ./verify-fixed.mjs copies both files into an
 * immutable `git archive` of the product revision under test.
 *
 * Product under test, loaded unmodified from the archive (nothing in the product or persistence path is mocked):
 *   - the production route table `webHostRouteObjects` behind a fresh data router per case (createMemoryRouter with
 *     the case's initial path, as in the frozen Sol harness; main.tsx renders the same route table through
 *     createBrowserRouter), rendered by `RouterProvider` from "react-router" (main.tsx uses the "react-router/dom"
 *     wrapper, which only adds flushSync; see the import note below). /app
 *     renders ProtectedAppRouteElement -> App -> AccountStorageGate -> AccountDataGate -> CommandPaletteProvider ->
 *     WebShellProvider + Shell (AppRail, Topbar), DesktopPet and CommandPalette; /app/settings/* renders
 *     AppRouteElement -> ComposedSettings with the DepartureCoordinator and the settingsDeparture delegate that
 *     App.handleSignOut awaits;
 *   - the real Appearance package, the real @repo/plugin-web-storage hooks, engine, registry, codecs and
 *     accountScope.
 * The test file substitutes only the auth-session hook (useWebAuthSession).
 *
 * Test-owned instruments (this file):
 *   - an attempt-logging Storage injector. F-B002 rule (contract section 12): each wrapper records the attempt and
 *     then delegates exactly once to the captured native method; an armed fault throws before delegating and never
 *     reaches storage; the wrappers never call accountScope.physicalKey, getPref, readRawPref, any other Storage
 *     method or any product helper. Every physical key is precomputed outside the wrappers (all seven Appearance
 *     keys are device keys, so physical key = logical key). A re-entrancy counter is re-checked in teardown;
 *   - an exclusive/shared FIFO Web Lock manager installed as navigator.locks, with test-held locks;
 *   - a window.confirm recorder, a window.location stub (assign/replace/reload recorded, every read delegated to the
 *     real Location), router-commit and pushState/replaceState counters, a runtime-error recorder and a beforeunload
 *     probe;
 *   - jsdom shims: Node's AbortController (router Requests), ResizeObserver, requestAnimationFrame, matchMedia,
 *     HTMLDialogElement showModal/close, and network refusals with attempt counters.
 *
 * Error vocabulary: an Error whose message starts with "PRECONDITION:" is a fixture or selector failure and never a
 * product result. Business assertions are Vitest expectations whose message names the contract clause or hypothesis
 * (H11, H16, H17, A2.x, A5, section 7). "OBSERVED <label> <json>" console lines record facts; they never assert.
 */
import * as React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
// RouterProvider comes from "react-router", the entry the production route modules (router.tsx: Outlet, Navigate)
// import, so the provider and the route elements share one module instance of React Router's contexts. Diagnostic
// iterations 1 and 2 rendered it from "react-router/dom" (main.tsx's flushSync wrapper): every mount committed an
// empty tree — the router matched the route but the root route's <Outlet/> rendered nothing and the auth hook was
// never called (see README "Iteration history").
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { transferableAbortController } from "node:util";
import { accountScope, generationMarkerKey, prefMutationLockName } from "@repo/plugin-web-storage";

// ---------------------------------------------------------------------------------------------------
// Validity helpers
// ---------------------------------------------------------------------------------------------------

export function pre(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`PRECONDITION: ${message}`);
}

/** Business presence assertion: a missing element is a product failure, never a precondition. */
export function need<T>(value: T | null | undefined, message: string): T {
  expect(value ?? null, message).not.toBeNull();
  return value as T;
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

/** A user-event instance (real timers) for focus-, pointer- and keyboard-sensitive input. */
export function user() {
  return userEvent.setup();
}

// ---------------------------------------------------------------------------------------------------
// Identity and the seven fields (contract section 2), stated independently of the product
// ---------------------------------------------------------------------------------------------------

export const OWNER = "appearance-host-parent-A";
export const GENERATION = "g1";
/** Precomputed outside every Storage wrapper (F-B002). */
export const MARKER_KEY = generationMarkerKey(OWNER);
export const SETTINGS_APPEARANCE = "/app/settings/appearance";
export const SETTINGS_ABOUT = "/app/settings/about";
export const TASKS = "/app/tasks";
export const CALENDAR = "/app/calendar";

export type Lang = "en" | "zh";
export type FieldId = "lang" | "theme" | "density" | "accentHue" | "bgTone" | "railPos" | "fontScale";
export type Value = string | number;
export interface Field {
  readonly id: FieldId;
  /** Physical key (device key: equal to the logical key). */
  readonly key: string;
  readonly label: Readonly<Record<Lang, string>>;
  /** Exact stored bytes for a value. */
  readonly bytes: (value: Value) => string;
  /** prefMutationLockName(<key>), precomputed outside every wrapper. */
  readonly lock: string;
  readonly defaultValue: Value;
}
const json = (value: Value): string => JSON.stringify(value);
const text = (value: Value): string => String(value);
function defineField(id: FieldId, key: string, en: string, zh: string, bytes: (value: Value) => string, defaultValue: Value): Field {
  return { id, key, label: { en, zh }, bytes, lock: prefMutationLockName(key), defaultValue };
}
export const LANG = defineField("lang", "xai_pref_lang", "Language", "语言", json, "en");
export const THEME = defineField("theme", "xai_pref_theme", "Theme", "主题", json, "light");
export const DENSITY = defineField("density", "xai_pref_density", "Density", "密度", json, "comfortable");
export const ACCENT = defineField("accentHue", "xai_accent_hue", "Accent color", "主题色", text, 165);
export const BG = defineField("bgTone", "xai_bg_tone", "Background palette", "背景调子", text, "default");
export const RAIL = defineField("railPos", "xai_rail_pos", "Sidebar position", "侧栏位置", text, "left");
export const FONT = defineField("fontScale", "xai_pref_font_scale", "Font scale", "字体大小", json, 1);
/** The pane's display order (contract A2.3). */
export const FIELDS: readonly Field[] = [LANG, THEME, DENSITY, ACCENT, BG, RAIL, FONT];
export const APPEARANCE_KEYS: readonly string[] = FIELDS.map(entry => entry.key);
export const labelOf = (field: Field, lang: Lang): string => field.label[lang];

// Option labels (contract section 2 accessible names; plugin-web-tokens i18n and the Appearance constants).
const THEME_LABEL: Record<Lang, Record<string, string>> = { en: { light: "Light", dark: "Dark", system: "System" }, zh: { light: "浅色", dark: "深色", system: "跟随系统" } };
const DENSITY_LABEL: Record<Lang, Record<string, string>> = { en: { comfortable: "Comfortable", compact: "Compact" }, zh: { comfortable: "舒适", compact: "紧凑" } };
const SWATCH_LABEL: Record<Lang, Record<string, string>> = {
  en: { 165: "Sage", 230: "Ocean", 35: "Sunset", 355: "Rose", 295: "Violet", 75: "Amber" },
  zh: { 165: "鼠尾草", 230: "海洋", 35: "日落", 355: "玫瑰", 295: "紫罗兰", 75: "琥珀" },
};
const TONE_LABEL: Record<Lang, Record<string, string>> = {
  en: { default: "Sage", cream: "Cream", mist: "Mist", lavender: "Lavender", peach: "Peach", graphite: "Graphite" },
  zh: { default: "鼠尾草", cream: "奶油", mist: "薄雾", lavender: "薰衣草", peach: "蜜桃", graphite: "石墨" },
};
const RAIL_LABEL: Record<Lang, Record<string, string>> = {
  en: { left: "Left", right: "Right", top: "Top", bottom: "Bottom (Dock)" },
  zh: { left: "左侧", right: "右侧", top: "顶部", bottom: "底部" },
};
const PANE_LANG_LABEL: Record<string, string> = { en: "English", zh: "简体中文" };
const TOPBAR_LANG_LABEL: Record<string, string> = { en: "English", zh: "中文" };
const SLIDER_LABEL: Record<"accentHue" | "fontScale", Record<Lang, string>> = {
  accentHue: { en: "Accent hue", zh: "主题色色相" },
  fontScale: { en: "Font scale", zh: "字体大小" },
};
const TOPBAR_VALUES: Partial<Record<FieldId, readonly Value[]>> = {
  lang: ["en", "zh"],
  theme: ["light", "dark", "system"],
  density: ["comfortable", "compact"],
};

/** Shell labels (plugin-web-tokens i18n `settings.*`, `nav.*`, `avatar.*`; AppRail's avatar label). */
export const SHELL: Record<Lang, { about: string; appearance: string; avatar: string; signOut: string; tasks: string; calendar: string; paneTitle: string }> = {
  en: { about: "About", appearance: "Appearance", avatar: "Open account menu", signOut: "Sign Out", tasks: "Tasks", calendar: "Calendar", paneTitle: "Appearance" },
  zh: { about: "关于", appearance: "外观", avatar: "打开账户菜单", signOut: "退出登录", tasks: "任务", calendar: "日历", paneTitle: "外观" },
};

/** Normative wording (contract section 5 table), in the language currently displayed. */
export const W = {
  en: {
    retryAll: "Retry all",
    retry: (label: string) => `Retry ${label}`,
    discard: (label: string) => `Discard ${label}`,
    notSaved: (label: string) => `${label} was not saved.`,
    notReset: (label: string) => `${label} was not reset to its default.`,
    saved: "Appearance settings saved.",
    restored: "Defaults restored.",
    retrying: "Retrying unsaved appearance changes…",
    count: (n: number) => (n === 1 ? "1 appearance change is not saved." : `${n} appearance changes are not saved.`),
    exportFailed: "Export failed. Please retry.",
    statusName: "Appearance changes not saved. Review them in Settings.",
    confirmSignOut: "Some appearance changes are not saved. Sign out and discard them?",
    reset: "Reset to defaults",
    oldSave: "Save & apply",
    oldSaved: "Saved",
  },
  zh: {
    retryAll: "全部重试",
    retry: (label: string) => `重试 ${label}`,
    discard: (label: string) => `放弃 ${label}`,
    notSaved: (label: string) => `${label}未保存。`,
    notReset: (label: string) => `${label}未恢复默认。`,
    saved: "外观设置已保存。",
    restored: "已恢复默认设置。",
    retrying: "正在重试未保存的外观更改…",
    count: (n: number) => `${n} 项外观更改未保存。`,
    exportFailed: "导出失败，请重试。",
    statusName: "外观更改未保存，前往设置查看。",
    confirmSignOut: "部分外观更改尚未保存。仍要退出并放弃这些更改吗？",
    reset: "恢复默认",
    oldSave: "保存生效",
    oldSaved: "已保存",
  },
} as const;

// ---------------------------------------------------------------------------------------------------
// Attempt-logging Storage injector (F-B002: record, then delegate exactly once)
// ---------------------------------------------------------------------------------------------------

export type StorageOp = "get" | "set" | "remove";
export interface Attempt { readonly seq: number; readonly op: StorageOp; readonly key: string; readonly value?: string; threw: boolean }
export interface Fault {
  readonly op: StorageOp | "any";
  /** Exact physical key; null matches every key. */
  readonly key: string | null;
  readonly label: string;
  /** Remaining firings; -1 means unlimited. */
  remaining: number;
  fired: number;
  active: boolean;
  off(): void;
}

const NATIVE_GET = Storage.prototype.getItem;
const NATIVE_SET = Storage.prototype.setItem;
const NATIVE_REMOVE = Storage.prototype.removeItem;
/** The localStorage object, captured at install time so the wrappers never touch window.localStorage. */
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
      ? new DOMException(`appearance-host fault: ${entry.label}`, "QuotaExceededError")
      : new DOMException(`appearance-host fault: ${entry.label}`, "SecurityError");
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
/** Every set/remove attempt since `from`, optionally restricted to the given physical keys. */
export function writesSince(from: number, keys?: readonly string[]): string[] {
  return ledger.attempts.slice(from).filter(item => item.op !== "get" && (!keys || keys.includes(item.key))).map(describeWrite);
}
/** Every attempt of any kind (get, set, remove) on the given physical keys since `from`. */
export function touchesSince(from: number, keys: readonly string[]): string[] {
  return ledger.attempts.slice(from).filter(item => keys.includes(item.key)).map(item => `${item.op}:${item.key}${item.threw ? "!threw" : ""}`);
}
/** Bytes read outside the injector (never counted). */
export const raw = (key: string): string | null => NATIVE_GET.call(window.localStorage, key);
export const rawAll = (): Record<FieldId, string | null> => Object.fromEntries(FIELDS.map(entry => [entry.id, raw(entry.key)])) as Record<FieldId, string | null>;
export function seed(key: string, bytes: string): void {
  NATIVE_SET.call(window.localStorage, key, bytes);
  pre(raw(key) === bytes, `seeded bytes ${key}=${JSON.stringify(bytes)} present`);
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
/** Expected self-check result: steps set, get, remove, faulted set, faulted remove, faulted get, plain get, sessionStorage set. */
export const SELF_CHECK_EXPECTED: SelfCheckResult = {
  nested: 0,
  tripwire: 0,
  delegatedPerStep: [1, 1, 1, 0, 0, 0, 1, 1],
  threwPerStep: [false, false, false, true, true, true, false, false],
  logged: [
    "set:appearance-host-selfcheck=1",
    "get:appearance-host-selfcheck",
    "remove:appearance-host-selfcheck",
    "set:appearance-host-selfcheck=2!threw",
    "remove:appearance-host-selfcheck!threw",
    "get:appearance-host-selfcheck!threw",
    "get:appearance-host-selfcheck",
  ],
  faultsFired: [1, 1, 1],
  bytesAfterFaultedSet: null,
  bytesAfterFaultedRemove: "3",
  sessionStorageLogged: false,
};
/**
 * F-B002 self-check: each wrapper records and delegates exactly once; a faulted attempt is recorded, throws and
 * never delegates (bytes unchanged); sessionStorage is delegated but never counted; the wrappers never re-enter
 * Storage and never call accountScope.physicalKey or accountScope.capture (tripwires).
 */
export function storageSelfCheck(): SelfCheckResult {
  pre(storageInstalled(), "the attempt-logging Storage injector is installed");
  const KEY = "appearance-host-selfcheck";
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
  let sessionStorageLogged = true;
  const faults: Fault[] = [];
  try {
    step(() => localStorage.setItem(KEY, "1"));
    step(() => localStorage.getItem(KEY));
    step(() => localStorage.removeItem(KEY));
    faults.push(fault("set", KEY, "self-check set", 1));
    step(() => localStorage.setItem(KEY, "2"));
    bytesAfterFaultedSet = raw(KEY);
    NATIVE_SET.call(window.localStorage, KEY, "3");
    faults.push(fault("remove", KEY, "self-check remove", 1));
    step(() => localStorage.removeItem(KEY));
    bytesAfterFaultedRemove = raw(KEY);
    faults.push(fault("get", KEY, "self-check get", 1));
    step(() => localStorage.getItem(KEY));
    step(() => localStorage.getItem(KEY));
    const beforeSession = ledger.attempts.length;
    step(() => sessionStorage.setItem(KEY, "s"));
    sessionStorageLogged = ledger.attempts.length !== beforeSession;
  } finally {
    scope.physicalKey = physicalKey;
    scope.capture = capture;
    NATIVE_REMOVE.call(window.localStorage, KEY);
    NATIVE_REMOVE.call(window.sessionStorage, KEY);
    for (const entry of faults) entry.off();
  }
  const logged = ledger.attempts.slice(from).map(item => (item.op === "set" ? `set:${item.key}=${item.value}` : `${item.op}:${item.key}`) + (item.threw ? "!threw" : ""));
  return { nested: ledger.nested - nestedBefore, tripwire, delegatedPerStep, threwPerStep, logged, faultsFired: faults.map(entry => entry.fired), bytesAfterFaultedSet, bytesAfterFaultedRemove, sessionStorageLogged };
}

// ---------------------------------------------------------------------------------------------------
// Exclusive/shared FIFO Web Lock manager with test-held locks
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
  // Grants are asynchronous, as in the browser lock manager.
  const schedule = (name: string): void => { queueMicrotask(() => drain(name)); };

  function request<T>(owner: LockOwner, name: string, optionsOrCallback: unknown, maybeCallback?: unknown): Promise<T> {
    const options = (typeof optionsOrCallback === "function" ? {} : (optionsOrCallback ?? {})) as LockOptionsShape;
    const callback = (typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback) as ((lock: unknown) => T | Promise<T>) | undefined;
    if (typeof callback !== "function") {
      errors.push(`request(${String(name)}) without a callback`);
      return Promise.reject(new TypeError("appearance-host lock fixture: a callback is required"));
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
/** The test takes the real named lock exclusively and keeps it until release(). */
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
// window.confirm recorder, window.location stub, history counters, runtime errors, beforeunload probe
// ---------------------------------------------------------------------------------------------------

export const confirmer: { calls: string[]; answer: boolean } = { calls: [], answer: true };
const recordConfirm = (message?: string): boolean => { confirmer.calls.push(String(message)); return confirmer.answer; };
let savedConfirm: unknown = null;
export const confirmInstalled = (): boolean => (window.confirm as unknown) === recordConfirm;

/** Redirects requested through window.location.assign/replace/reload or an href assignment. */
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
 * `true` to returnValue (captured on the instance so an empty-string assignment cannot cancel through jsdom's legacy
 * boolean returnValue). Counts the Storage attempts made while the listeners run.
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
  vi.stubGlobal("fetch", () => { network.fetch += 1; return Promise.reject(new TypeError("appearance-host: network disabled")); });
  vi.stubGlobal("XMLHttpRequest", class { constructor() { network.xhr += 1; throw new TypeError("appearance-host: network disabled"); } });
  vi.stubGlobal("WebSocket", class { constructor() { network.socket += 1; throw new TypeError("appearance-host: network disabled"); } });
  vi.stubGlobal("EventSource", class { constructor() { network.eventSource += 1; throw new TypeError("appearance-host: network disabled"); } });
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
// Production App mount: the production route table behind a fresh memory data router per case
// ---------------------------------------------------------------------------------------------------

let routeObjects: RouteObject[] | null = null;
let diagnosticProbe: () => unknown = () => null;
/**
 * The test file passes the production `webHostRouteObjects` after substituting the auth-session hook, and an
 * optional probe whose value is added to mount-precondition messages (diagnostics only).
 */
export function configureApp(routes: RouteObject[], probe?: () => unknown): void {
  routeObjects = routes;
  if (probe) diagnosticProbe = probe;
}
type DataRouter = ReturnType<typeof createMemoryRouter>;
export interface AppHandle {
  readonly router: DataRouter;
  /** Location keys committed by the router, in order (one entry per router state notification). */
  readonly commits: string[];
  pathname(): string;
  unmount(): void;
}
const routers: DataRouter[] = [];
/** Compact facts about what the mount rendered; added to a failing mount precondition's message. */
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
    pane: paneOrNull() !== null,
    body: (document.body.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
    markerBytes: raw(MARKER_KEY) !== null,
    probe: diagnosticProbe(),
  });
}
export async function mountApp(path: string): Promise<AppHandle> {
  pre(routeObjects, "the production route table was configured");
  pre(storageInstalled(), "the attempt-logging Storage injector is installed");
  pre(locksInstalled(), "the Web Lock fixture is installed as navigator.locks");
  pre(confirmInstalled(), "the window.confirm recorder is installed");
  pre(locationStubbed(), "the window.location stub is installed");
  pre(nativeReplaceState, "the history counters are installed");
  // Keep the document URL equal to the routed path for any reader of window.location (no history entry is added).
  nativeReplaceState(null, "", path);
  pre(window.location.pathname === path, `the document starts at ${path}`);
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  routers.push(router);
  const commits: string[] = [];
  router.subscribe(state => { commits.push(state.location.key); });
  const result = render(<RouterProvider router={router} />);
  await flush(24);
  expect(routeError(), "the production App renders without the route error boundary").toBeNull();
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER && scope.generation === GENERATION, `AccountDataGate keeps account ${OWNER}/${GENERATION} active (diagnostics ${mountDiagnostics(router)})`);
  pre(router.state.location.pathname === path, `the router committed ${path} (diagnostics ${mountDiagnostics(router)})`);
  pre(document.querySelector("header.topbar") !== null && document.querySelector(".app-rail") !== null, `the production Shell (Topbar and AppRail) is mounted (diagnostics ${mountDiagnostics(router)})`);
  if (path === SETTINGS_APPEARANCE) pre(paneOrNull() !== null, `the Appearance pane is mounted in the production Settings detail (diagnostics ${mountDiagnostics(router)})`);
  return { router, commits, pathname: () => router.state.location.pathname, unmount: () => result.unmount() };
}
export interface HistoryMark { readonly pushes: number; readonly replaces: number; readonly commits: number; readonly key: string }
export const historyMark = (app: AppHandle): HistoryMark => ({ pushes: historyCounters.push, replaces: historyCounters.replace, commits: app.commits.length, key: app.router.state.location.key });
/**
 * History mutations since a mark: `navigations` counts the distinct location keys the router committed after the
 * mark, excluding the key current at the mark (router notifications also fire for non-navigation state such as
 * blockers, so entries are counted by location key); `pushes`/`replaces` count direct History API calls.
 */
export const historyMutations = (app: AppHandle, from: HistoryMark): { navigations: number; pushes: number; replaces: number; locationChanged: boolean } => ({
  navigations: new Set(app.commits.slice(from.commits).filter(key => key !== from.key)).size,
  pushes: historyCounters.push - from.pushes,
  replaces: historyCounters.replace - from.replaces,
  locationChanged: app.router.state.location.key !== from.key,
});
export const NO_HISTORY_MUTATION = { navigations: 0, pushes: 0, replaces: 0, locationChanged: false } as const;
export async function navigateTo(app: AppHandle, path: string): Promise<void> {
  await act(async () => { await app.router.navigate(path); });
  await flush();
}

// ---------------------------------------------------------------------------------------------------
// Displayed state, controls and recovery UI through the section 2 / section 5 selectors and accessible names
// ---------------------------------------------------------------------------------------------------

export function routeError(): string | null {
  const heading = Array.from(document.querySelectorAll("main.host-page h1")).find(element => (element.textContent ?? "").startsWith("Route Error"));
  return heading ? (heading.textContent ?? "") : null;
}
/** The language currently displayed (the Topbar trigger title, else the pane title). */
export function uiLang(): Lang {
  const trigger = document.querySelector<HTMLElement>("header.topbar .topbar-pref-trigger");
  if (trigger) return trigger.getAttribute("title") === SHELL.zh.paneTitle ? "zh" : "en";
  const title = document.querySelector(".appearance-pane .pane-title");
  return title?.textContent === SHELL.zh.paneTitle ? "zh" : "en";
}
export function paneOrNull(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.settings-detail[data-pane="appearance"] .appearance-pane');
}
export function pane(): HTMLElement {
  const element = paneOrNull();
  pre(element, "the Appearance pane is mounted in the production Settings detail");
  return element;
}
const named = (root: HTMLElement, name: string, role = "button"): HTMLElement[] => within(root).queryAllByRole(role, { name }) as HTMLElement[];
function only(found: HTMLElement[], what: string): HTMLElement {
  pre(found.length === 1, `exactly one ${what} (found ${found.length})`);
  return found[0]!;
}
export function slider(field: Field, lang: Lang = uiLang()): HTMLInputElement {
  pre(field.id === "accentHue" || field.id === "fontScale", `${field.id} has a slider`);
  const name = SLIDER_LABEL[field.id as "accentHue" | "fontScale"][lang];
  return only(named(pane(), name, "slider"), `slider "${name}"`) as HTMLInputElement;
}
/** The pane control for a value (section 2 selectors and accessible names). */
export function paneControl(field: Field, value: Value, lang: Lang = uiLang()): HTMLElement {
  const root = pane();
  switch (field.id) {
    case "lang": return only(named(root, PANE_LANG_LABEL[String(value)]!), `language segment "${PANE_LANG_LABEL[String(value)]}"`);
    case "theme": return only(named(root, THEME_LABEL[lang][String(value)]!).filter(element => element.classList.contains("theme-card")), `.theme-card "${THEME_LABEL[lang][String(value)]}"`);
    case "density": return only(named(root, DENSITY_LABEL[lang][String(value)]!), `density segment "${DENSITY_LABEL[lang][String(value)]}"`);
    case "accentHue": return only(named(root, SWATCH_LABEL[lang][String(value)]!).filter(element => element.classList.contains("accent-sw")), `.accent-sw "${SWATCH_LABEL[lang][String(value)]}"`);
    case "bgTone": return only(named(root, TONE_LABEL[lang][String(value)]!).filter(element => element.classList.contains("bg-tone-card")), `.bg-tone-card "${TONE_LABEL[lang][String(value)]}"`);
    case "railPos": return only(named(root, RAIL_LABEL[lang][String(value)]!).filter(element => element.classList.contains("rail-pos-card")), `.rail-pos-card "${RAIL_LABEL[lang][String(value)]}"`);
    case "fontScale": return slider(FONT, lang);
  }
}
/** A pane choice: a click on the option control, or a change event on the font-scale range input. */
export function choose(field: Field, value: Value, lang: Lang = uiLang()): void {
  if (field.id === "fontScale") {
    fireEvent.change(slider(FONT, lang), { target: { value: String(value) } });
    return;
  }
  fireEvent.click(paneControl(field, value, lang));
}
/** The value the pane displays as selected, or a description when none or several are selected. */
export function shownInPane(field: Field, lang: Lang = uiLang()): Value | string {
  const root = pane();
  const pick = (selector: string, labels: Record<string, string>): Value | string => {
    const chosen = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(element => element.classList.contains("active"));
    if (chosen.length !== 1) return `selected:${chosen.length}`;
    const name = chosen[0]!.getAttribute("aria-label") ?? (chosen[0]!.textContent ?? "").trim();
    const entry = Object.entries(labels).find(([, label]) => label === name);
    return entry ? entry[0] : `unknown:${name}`;
  };
  switch (field.id) {
    case "lang": {
      const chosen = [...named(root, PANE_LANG_LABEL.en!), ...named(root, PANE_LANG_LABEL.zh!)].filter(element => element.getAttribute("aria-selected") === "true");
      if (chosen.length !== 1) return `selected:${chosen.length}`;
      return (chosen[0]!.textContent ?? "").trim() === PANE_LANG_LABEL.zh ? "zh" : "en";
    }
    case "theme": return pick(".theme-card", THEME_LABEL[lang]!);
    case "density": {
      const chosen = Object.entries(DENSITY_LABEL[lang]!).filter(([, label]) => named(root, label).some(element => element.getAttribute("aria-selected") === "true"));
      return chosen.length === 1 ? chosen[0]![0] : `selected:${chosen.length}`;
    }
    case "accentHue": return Number(slider(ACCENT, lang).value);
    case "bgTone": return pick(".bg-tone-card", TONE_LABEL[lang]!);
    case "railPos": return pick(".rail-pos-card", RAIL_LABEL[lang]!);
    case "fontScale": return Number(slider(FONT, lang).value);
  }
}
/** The value applied to the document (`<html>` attributes and inline style). */
export function applied(field: Field): Value | string | null {
  const root = document.documentElement;
  switch (field.id) {
    case "lang": return uiLang();
    case "theme": return root.getAttribute("data-theme");
    case "density": return root.getAttribute("data-density");
    case "fontScale": { const size = root.style.fontSize; return size ? Number.parseFloat(size) / 16 : null; }
    case "accentHue": { const hue = root.style.getPropertyValue("--accent-hue"); return hue === "" ? null : Number(hue); }
    case "bgTone": return root.getAttribute("data-bg-tone") ?? "default";
    case "railPos": return root.getAttribute("data-rail-pos");
  }
}

// Topbar quick switcher and the Topbar status
export function topbar(): HTMLElement {
  const element = document.querySelector<HTMLElement>("header.topbar");
  pre(element, "the production Topbar is mounted");
  return element;
}
function topbarTrigger(): HTMLElement {
  const trigger = topbar().querySelector<HTMLElement>(".topbar-pref-trigger");
  pre(trigger, "the Topbar appearance trigger is present");
  return trigger;
}
const topbarDialog = (): HTMLElement | null => topbar().querySelector<HTMLElement>('[role="dialog"]');
export function openTopbar(): HTMLElement {
  if (!topbarDialog()) fireEvent.click(topbarTrigger());
  const dialog = topbarDialog();
  pre(dialog, "the Topbar appearance popover opened");
  return dialog;
}
export function closeTopbar(): void {
  if (topbarDialog()) fireEvent.click(topbarTrigger());
  pre(!topbarDialog(), "the Topbar appearance popover closed");
}
function topbarLabel(field: Field, value: Value, lang: Lang): string {
  if (field.id === "lang") return TOPBAR_LANG_LABEL[String(value)]!;
  if (field.id === "theme") return THEME_LABEL[lang][String(value)]!;
  if (field.id === "density") return DENSITY_LABEL[lang][String(value)]!;
  throw new Error(`PRECONDITION: the Topbar has no ${field.id} option`);
}
export function chooseTopbar(field: Field, value: Value, lang: Lang = uiLang()): void {
  const dialog = openTopbar();
  const name = topbarLabel(field, value, lang);
  fireEvent.click(only(within(dialog).queryAllByRole("menuitemradio", { name }) as HTMLElement[], `Topbar menuitemradio "${name}"`));
}
/** The value the Topbar shows as checked (opens the popover when needed; the caller closes it). */
export function topbarChecked(field: Field, lang: Lang = uiLang()): Value | string {
  const dialog = openTopbar();
  const values = (TOPBAR_VALUES[field.id] ?? []).filter(value => (within(dialog).queryAllByRole("menuitemradio", { name: topbarLabel(field, value, lang) }) as HTMLElement[]).some(element => element.getAttribute("aria-checked") === "true"));
  return values.length === 1 ? values[0]! : `checked:${values.length}`;
}
/** Any element carrying the Topbar status test id (contract section 5 selector), whatever its name. */
export const topbarStatusAny = (): HTMLElement | null => document.querySelector<HTMLElement>('header.topbar [data-testid="appearance-status"]');
/** The Topbar status button with the section 5 accessible name in the displayed language. */
export function topbarStatusNamed(lang: Lang = uiLang()): HTMLElement | null {
  const root = document.querySelector<HTMLElement>("header.topbar");
  if (!root) return null;
  return (named(root, W[lang].statusName)).find(element => element.getAttribute("data-testid") === "appearance-status") ?? null;
}

// Pane recovery UI and the bottom action area
export function paneButton(name: string): HTMLButtonElement | null {
  const root = paneOrNull();
  if (!root) return null;
  return (named(root, name)[0] as HTMLButtonElement | undefined) ?? null;
}
export const retryOf = (field: Field, lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].retry(labelOf(field, lang)));
export const discardOf = (field: Field, lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].discard(labelOf(field, lang)));
/** Retry all by role and accessible name (A2.1); its test id and attributes are asserted separately. */
export const retryAll = (lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].retryAll);
export function resetButton(lang: Lang = uiLang()): HTMLButtonElement {
  const root = pane();
  return only(named(root, W[lang].reset), `"${W[lang].reset}" button`) as HTMLButtonElement;
}
export const recoveryBlock = (field: Field): HTMLElement | null => paneOrNull()?.querySelector<HTMLElement>(`[data-appearance-recovery="${field.id}"]`) ?? null;
export const statusLine = (): HTMLElement | null => paneOrNull()?.querySelector<HTMLElement>('[data-testid="appearance-status-line"]') ?? null;
export const statusText = (): string | null => {
  const line = statusLine();
  return line ? (line.textContent ?? "").replace(/\s+/g, " ").trim() : null;
};
export const paneText = (): string => (paneOrNull()?.textContent ?? "").replace(/\s+/g, " ").trim();
export const says = (message: string): boolean => paneText().includes(message);
/** The Retry all attributes the contract governs (A2.1, A2.2). */
export function retryAllState(button: HTMLElement): { ariaDisabled: string | null; disabledAttr: boolean; describedBy: string | null; describedByStatus: boolean; type: string | null; testid: string | null; tabIndex: number } {
  const line = statusLine();
  const ids = (button.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  return {
    ariaDisabled: button.getAttribute("aria-disabled"),
    disabledAttr: button.hasAttribute("disabled"),
    describedBy: button.getAttribute("aria-describedby"),
    describedByStatus: Boolean(line && line.id && ids.includes(line.id)),
    type: button.getAttribute("type"),
    testid: button.getAttribute("data-testid"),
    tabIndex: button.tabIndex,
  };
}
export const isDisabledState = (button: HTMLElement): boolean => button.getAttribute("aria-disabled") === "true" && !button.hasAttribute("disabled");
export const isEnabledState = (button: HTMLElement): boolean => (button.getAttribute("aria-disabled") === null || button.getAttribute("aria-disabled") === "false") && !button.hasAttribute("disabled");
/** Facts about the pane's last buttons (the bottom action area), for observation only. */
export function bottomButtons(count = 3): Array<{ text: string; ariaDisabled: string | null; disabled: boolean; testid: string | null; className: string }> {
  const root = paneOrNull();
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLButtonElement>("button")).slice(-count).map(button => ({
    text: (button.textContent ?? "").trim(),
    ariaDisabled: button.getAttribute("aria-disabled"),
    disabled: button.hasAttribute("disabled"),
    testid: button.getAttribute("data-testid"),
    className: button.className,
  }));
}

// Settings sidebar, AppRail, departure dialog and the voluntary sign-out
export function sidebarRow(name: string): HTMLElement {
  const sidebar = document.querySelector<HTMLElement>(".settings-sidebar");
  pre(sidebar, "the Settings sidebar is mounted");
  return only(named(sidebar, name), `Settings sidebar row "${name}"`);
}
export function railButton(name: string): HTMLElement {
  const rail = document.querySelector<HTMLElement>(".app-rail");
  pre(rail, "the production AppRail is mounted");
  return only(named(rail, name), `AppRail button "${name}"`);
}
export const departureDialog = (): Element | null => document.querySelector(".settings-departure-dialog");
/**
 * Opens the avatar menu (only when it is closed: the trigger toggles it and it stays open after a cancelled
 * sign-out), chooses Sign Out and confirms the existing SignOutConfirmDialog, which calls App.handleSignOut.
 */
export async function signOut(lang: Lang): Promise<void> {
  const rail = document.querySelector<HTMLElement>(".app-rail");
  pre(rail, "the production AppRail is mounted");
  if (!document.querySelector('.avatar-menu[role="menu"]')) {
    const avatar = Array.from(rail.querySelectorAll<HTMLElement>("button.rail-avatar")).filter(element => element.getAttribute("aria-label") === SHELL[lang].avatar);
    fireEvent.click(only(avatar, `avatar menu button "${SHELL[lang].avatar}"`));
  }
  const menu = document.querySelector<HTMLElement>('.avatar-menu[role="menu"]');
  pre(menu, "the avatar menu opened");
  const items = Array.from(menu.querySelectorAll<HTMLElement>("button.avm-item")).filter(element => (element.textContent ?? "").trim() === SHELL[lang].signOut);
  fireEvent.click(only(items, `avatar menu item "${SHELL[lang].signOut}"`));
  const dialog = document.querySelector<HTMLElement>("dialog.xai-sign-out-dialog[open]");
  pre(dialog, "the existing sign-out confirmation dialog opened");
  const confirmButton = dialog.querySelector<HTMLElement>(".xai-sign-out-dialog__btn--confirm");
  pre(confirmButton && (confirmButton.textContent ?? "").trim() === SHELL[lang].signOut, `the sign-out dialog's "${SHELL[lang].signOut}" button`);
  await act(async () => { fireEvent.click(confirmButton); });
  await flush(24);
  pre(document.querySelector("dialog.xai-sign-out-dialog[open]") === null, "the sign-out dialog closed after its confirmation");
}
/** Whether the voluntary sign-out sequence proceeded (identity invalidated, redirect requested, auth sign-out). */
export function signOutOutcome(backendSignOuts: number): { identityInvalidated: boolean; redirected: boolean; backendSignOuts: number } {
  const scope = accountScope.capture();
  return { identityInvalidated: scope.kind === "locked" || scope.accountId !== OWNER, redirected: redirects.includes("/"), backendSignOuts };
}
export const scopeSummary = (): { kind: string; accountId: string | null; generation: string | null; epoch: number } => {
  const scope = accountScope.capture();
  return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
};

// ---------------------------------------------------------------------------------------------------
// Per-test setup and teardown
// ---------------------------------------------------------------------------------------------------

export function resetDocument(): void {
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
  confirmer.answer = true;
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
  // Account A has a committed generation marker and is active before mount (a returning signed-in user); the
  // production AccountDataGate re-locks and re-activates it from the marker.
  NATIVE_SET.call(window.localStorage, MARKER_KEY, JSON.stringify({ generation: GENERATION, migrationId: "appearance-host-parent", previous: null }));
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
