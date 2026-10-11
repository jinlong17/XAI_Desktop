/**
 * Sol jsdom fixture: Settings Appearance caller — seven device fields, the App root-preference writer, the Topbar
 * quick switcher, Reset to defaults and the bottom Retry all (CP-APPEARANCE-01, contract
 * docs/reviews/web-appearance-recovery-contract/contract.md r3, sections 2, 5–10 and 12).
 *
 * The product is loaded unmodified from the immutable archive under test: the production route table and `App`
 * composition (AccountStorageGate, AccountDataGate, Shell with AppRail and Topbar, DesktopPet, CmdK, ComposedSettings
 * with the departure coordinator), the real Appearance package, the real @repo/plugin-web-storage hooks, mutation
 * engine, registry, codecs, ownership and accountScope controller. Nothing in the persistence path is mocked. The
 * test files substitute only the auth-session hook. The fixture owns only:
 *   - an attempt-counting Storage injector that records every getItem/setItem/removeItem attempt on localStorage
 *     BEFORE delegating exactly once (and before any injected fault throws), with an F-B002 re-entrancy counter;
 *   - an exclusive, asynchronous Web Lock manager installed as navigator.locks, with programmable holds (a
 *     pass-through stub cannot prove a held lock);
 *   - a window.confirm recorder (the answer is chosen per case);
 *   - an instrumented window.dispatchEvent that records every dispatched StorageEvent, and a bus spy for
 *     `web:settings:preference-changed`;
 *   - a beforeunload probe, a download harness, a controllable matchMedia, network refusals;
 *   - real accountScope transitions.
 *
 * F-B002 rule (contract section 12): the storage wrappers record and then delegate exactly once. They never call
 * accountScope.physicalKey, getPref, readRawPref, any other Storage method or any product helper. Every physical
 * key the oracles use is a device key (physical key = logical key) or an account-prefix string constant computed
 * outside any wrapper. `storageSelfCheck()` proves it and `teardown()` re-asserts zero nested wrapper entries.
 *
 * Any error whose message starts with `PRECONDITION:` is a fixture or selector failure. It is never a product
 * failure. Business assertions carry an `H<n>:`, `A2.<n>:`, `§<n>` or `R5` tag in their message instead.
 */
import * as React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { transferableAbortController } from "node:util";
import { accountScope, generationMarkerKey, prefMutationLockName, type AccountScope } from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";

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

/** A user-event instance for focus-sensitive pointer and keyboard input (real timers). */
export function user() {
  return userEvent.setup();
}

/** Real-time wait inside act (used only to observe timed UI such as the 1.8 s flash). */
export async function wait(ms: number): Promise<void> {
  await act(async () => { await new Promise<void>(resolve => setTimeout(resolve, ms)); });
}

/** Evidence line in the Vitest stdout (the runner keeps it in the log). */
export function observe(tag: string, data: unknown): void {
  console.info(`SOL-OBS ${tag} ${JSON.stringify(data)}`);
}

// ---------------------------------------------------------------------------
// Field table (contract section 2), stated independently of the product
// ---------------------------------------------------------------------------

export type Lang = "en" | "zh";
export type FieldId = "lang" | "theme" | "density" | "fontScale" | "accentHue" | "railPos" | "bgTone";
export type Value = string | number;
export interface Field {
  readonly id: FieldId;
  readonly key: string;
  readonly kind: "root" | "registered";
  readonly label: Readonly<Record<Lang, string>>;
  readonly defaultValue: Value;
  /** Exact stored bytes for a value. */
  encode(value: Value): string;
}
const json = (value: Value): string => JSON.stringify(value);
const text = (value: Value): string => String(value);
export const FIELDS: readonly Field[] = [
  { id: "lang", key: "xai_pref_lang", kind: "root", label: { en: "Language", zh: "语言" }, defaultValue: "en", encode: json },
  { id: "theme", key: "xai_pref_theme", kind: "root", label: { en: "Theme", zh: "主题" }, defaultValue: "light", encode: json },
  { id: "density", key: "xai_pref_density", kind: "root", label: { en: "Density", zh: "密度" }, defaultValue: "comfortable", encode: json },
  { id: "accentHue", key: "xai_accent_hue", kind: "registered", label: { en: "Accent color", zh: "主题色" }, defaultValue: 165, encode: text },
  { id: "bgTone", key: "xai_bg_tone", kind: "registered", label: { en: "Background palette", zh: "背景调子" }, defaultValue: "default", encode: text },
  { id: "railPos", key: "xai_rail_pos", kind: "registered", label: { en: "Sidebar position", zh: "侧栏位置" }, defaultValue: "left", encode: text },
  { id: "fontScale", key: "xai_pref_font_scale", kind: "root", label: { en: "Font scale", zh: "字体大小" }, defaultValue: 1, encode: json },
];
/** The pane's display order, which is also Retry all's order (A2.3). */
export const DISPLAY_ORDER: readonly FieldId[] = FIELDS.map(field => field.id);
export const byId = (id: FieldId): Field => {
  const field = FIELDS.find(entry => entry.id === id);
  pre(field, `field ${id} exists in the fixture table`);
  return field;
};
export const KEYS: readonly string[] = FIELDS.map(field => field.key);
export const LANG = byId("lang");
export const THEME = byId("theme");
export const DENSITY = byId("density");
export const ACCENT = byId("accentHue");
export const BG = byId("bgTone");
export const RAIL = byId("railPos");
export const FONT = byId("fontScale");
/** The six Reset fields (language is kept, section 6). */
export const RESET_FIELDS: readonly Field[] = [THEME, DENSITY, FONT, ACCENT, RAIL, BG];
export const others = (...excluded: Field[]): Field[] => FIELDS.filter(field => !excluded.includes(field));
export const enc = (field: Field, value: Value): string => field.encode(value);
export const keyLock = (field: Field): string => prefMutationLockName(field.key);

export const VALUES: Readonly<Record<FieldId, readonly Value[]>> = {
  lang: ["en", "zh"],
  theme: ["light", "dark", "system"],
  density: ["comfortable", "compact"],
  fontScale: [0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15],
  accentHue: [165, 230, 35, 355, 295, 75],
  railPos: ["left", "right", "top", "bottom"],
  bgTone: ["default", "cream", "mist", "lavender", "peach", "graphite"],
};
export const ACCENT_SLIDER_VALUES: readonly number[] = [0, 220, 360];
export const TONE_HUE: Readonly<Record<string, number>> = { default: 165, cream: 55, mist: 230, lavender: 295, peach: 35, graphite: 220 };

// Option labels (contract section 2 accessible names; plugin-web-tokens i18n and the Appearance constants).
const THEME_LABEL: Record<Lang, Record<string, string>> = { en: { light: "Light", dark: "Dark", system: "System" }, zh: { light: "浅色", dark: "深色", system: "跟随系统" } };
const DENSITY_LABEL: Record<Lang, Record<string, string>> = { en: { comfortable: "Comfortable", compact: "Compact" }, zh: { comfortable: "舒适", compact: "紧凑" } };
const PRESET_LABEL: Record<Lang, Record<number, string>> = {
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

// ---------------------------------------------------------------------------
// Normative wording (contract section 5 table)
// ---------------------------------------------------------------------------

export const W = {
  en: {
    retry: (label: string) => `Retry ${label}`,
    discard: (label: string) => `Discard ${label}`,
    reload: (label: string) => `Reload ${label}`,
    reset: "Reset to defaults",
    exportDraft: "Export Appearance draft",
    discardAll: "Discard all changes",
    retryAll: "Retry all",
    saving: (label: string) => `${label} is saving.`,
    resetting: (label: string) => `${label} is being reset to its default.`,
    notSaved: (label: string) => `${label} was not saved.`,
    notReset: (label: string) => `${label} was not reset to its default.`,
    unavailable: (label: string) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
    saved: "Appearance settings saved.",
    restored: "Defaults restored.",
    exportFailed: "Export failed. Please retry.",
    retrying: "Retrying unsaved appearance changes…",
    count: (n: number) => (n === 1 ? "1 appearance change is not saved." : `${n} appearance changes are not saved.`),
    confirmReset: "Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.",
    statusName: "Appearance changes not saved. Review them in Settings.",
    confirmSignOut: "Some appearance changes are not saved. Sign out and discard them?",
    oldSave: "Save & apply",
    oldSaved: "Saved",
    paneTitle: "Appearance",
  },
  zh: {
    retry: (label: string) => `重试 ${label}`,
    discard: (label: string) => `放弃 ${label}`,
    reload: (label: string) => `重新读取 ${label}`,
    reset: "恢复默认",
    exportDraft: "导出外观草稿",
    discardAll: "放弃全部更改",
    retryAll: "全部重试",
    saving: (label: string) => `${label}正在保存。`,
    resetting: (label: string) => `${label}正在恢复默认。`,
    notSaved: (label: string) => `${label}未保存。`,
    notReset: (label: string) => `${label}未恢复默认。`,
    unavailable: (label: string) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
    saved: "外观设置已保存。",
    restored: "已恢复默认设置。",
    exportFailed: "导出失败，请重试。",
    retrying: "正在重试未保存的外观更改…",
    count: (n: number) => `${n} 项外观更改未保存。`,
    confirmReset: "将主题、密度、字体大小、主题色、背景调子和侧栏位置恢复为默认值？语言保持不变。",
    statusName: "外观更改未保存，前往设置查看。",
    confirmSignOut: "部分外观更改尚未保存。仍要退出并放弃这些更改吗？",
    oldSave: "保存生效",
    oldSaved: "已保存",
    paneTitle: "外观",
  },
} as const;
/** The confirmation text 5cd63ff shows (section 3 item 5), used only to describe observations. */
export const OLD_RESET_CONFIRM: Record<Lang, string> = {
  en: "Reset every preference to defaults? This clears saved theme, layout, and module toggles.",
  zh: "确定恢复所有设置为默认值？这会清除保存的主题、布局和模块开关。",
};
export const labelOf = (field: Field, lang: Lang): string => field.label[lang];
export const msg = {
  saving: (field: Field, lang: Lang = "en") => W[lang].saving(labelOf(field, lang)),
  resetting: (field: Field, lang: Lang = "en") => W[lang].resetting(labelOf(field, lang)),
  notSaved: (field: Field, lang: Lang = "en") => W[lang].notSaved(labelOf(field, lang)),
  notReset: (field: Field, lang: Lang = "en") => W[lang].notReset(labelOf(field, lang)),
  unavailable: (field: Field, lang: Lang = "en") => W[lang].unavailable(labelOf(field, lang)),
};
const SUCCESS_LINES: readonly string[] = [W.en.saved, W.en.restored, W.zh.saved, W.zh.restored];

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
    throw op === "set" ? new DOMException(`appearance-sol ${entry.label}`, "QuotaExceededError") : new Error(`appearance-sol ${entry.label}`);
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
/** Every set/remove attempt on one field since `from`, as written bytes ("<remove>" for removes; "!" suffix if it threw). */
export const writesOn = (from: number, field: Field): string[] => attempts(from, [field.key], ["set", "remove"]).map(item => (item.op === "set" ? item.value! : "<remove>") + (item.threw ? "!" : ""));
/** Every set/remove attempt on any key since `from`. */
export const writes = (from: number): string[] => attempts(from, undefined, ["set", "remove"]).map(describeWrite);
/** Every set/remove attempt on the seven Appearance keys since `from`. */
export const fieldWrites = (from: number): string[] => attempts(from, KEYS, ["set", "remove"]).map(describeWrite);
/** Every attempt (get/set/remove) on the given fields since `from`. */
export const touches = (from: number, fields: readonly Field[]): string[] => attempts(from, fields.map(field => field.key)).map(item => `${item.op}:${item.key}`);
/** Attempts on account-namespaced keys (prefix constants; no product helper is called). */
export const accountTouches = (from = 0): string[] => store.log.slice(from).filter(item => item.key.startsWith("xai:account:v1:") || item.key.startsWith("xai:demo:v1:")).map(item => `${item.op}:${item.key}`);

/** Total denial for get/set/remove on every key, proven to fire through the attempt counter. */
export function denyAllStorage(): Fault {
  const denial = fault({ op: "any", label: "total storage denial" });
  const from = mark();
  let thrown = 0;
  for (const run of [() => localStorage.getItem("appearance-sol-probe"), () => localStorage.setItem("appearance-sol-probe", "x"), () => localStorage.removeItem("appearance-sol-probe")]) {
    try { run(); } catch { thrown += 1; }
  }
  pre(thrown === 3 && denial.fired === 3 && attempts(from).length === 3, "total storage denial armed and observed for getItem, setItem and removeItem through the attempt counter");
  return denial;
}

export const bytes = (field: Field): string | null => nativeGet.call(localStorage, field.key);
export const bytesAll = (): Record<FieldId, string | null> => Object.fromEntries(FIELDS.map(field => [field.id, bytes(field)])) as Record<FieldId, string | null>;
export function seed(field: Field, raw: string): void {
  nativeSet.call(localStorage, field.key, raw);
  pre(nativeGet.call(localStorage, field.key) === raw, `seeded bytes ${field.key}=${JSON.stringify(raw)} present`);
}
export function seedValue(field: Field, value: Value): void { seed(field, enc(field, value)); }
export function seedKey(key: string, raw: string): void {
  nativeSet.call(localStorage, key, raw);
  pre(nativeGet.call(localStorage, key) === raw, `seeded bytes ${key}=${JSON.stringify(raw)} present`);
}
export function absent(field: Field): void { pre(nativeGet.call(localStorage, field.key) === null, `${field.key} starts absent`); }
/** Snapshot of every localStorage key except the excluded ones, read without the injector. */
export function snapshot(exclude: readonly string[] = KEYS): Record<string, string | null> {
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
    step(() => localStorage.setItem("appearance-sol-selfcheck", "1"));
    step(() => localStorage.getItem("appearance-sol-selfcheck"));
    const setFault = fault({ op: "set", key: "appearance-sol-selfcheck", times: 1, label: "selfcheck set" });
    step(() => localStorage.setItem("appearance-sol-selfcheck", "2"));
    const getFault = fault({ op: "get", key: "appearance-sol-selfcheck", times: 1, after: { op: "remove", key: "appearance-sol-selfcheck" }, label: "selfcheck read after remove" });
    step(() => localStorage.getItem("appearance-sol-selfcheck"));
    step(() => localStorage.removeItem("appearance-sol-selfcheck"));
    step(() => localStorage.getItem("appearance-sol-selfcheck"));
    step(() => localStorage.getItem("appearance-sol-selfcheck"));
    const denial = fault({ op: "any", label: "selfcheck denial" });
    step(() => localStorage.getItem("appearance-sol-selfcheck"));
    step(() => localStorage.setItem("appearance-sol-selfcheck", "3"));
    step(() => localStorage.removeItem("appearance-sol-selfcheck"));
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
  /** Product acquisitions still to be granted normally before the hold. */
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
  // Grants are always asynchronous, like the browser lock manager.
  const schedule = (name: string): void => { queueMicrotask(() => drain(name)); };

  function request<T>(owner: LockOwner, name: string, optionsOrCallback: unknown, maybeCallback?: unknown): Promise<T> {
    const options = (typeof optionsOrCallback === "function" ? {} : (optionsOrCallback ?? {})) as LockOptionsShape;
    const callback = (typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback) as LockCallback<T> | undefined;
    if (typeof callback !== "function") {
      errors.push(`request(${String(name)}) without a callback`);
      return Promise.reject(new TypeError("appearance-sol lock fixture: callback required"));
    }
    if (options.steal) errors.push(`steal is unsupported by the fixture (${String(name)})`);
    const mode: LockMode = options.mode === "shared" ? "shared" : "exclusive";
    if (owner === "product") {
      const plan = plans.find(entry => entry.name === String(name) && !entry.triggered);
      if (plan) {
        if (plan.grant > 0) plan.grant -= 1;
        else {
          // Insert a test-owned exclusive waiter ahead of this product request: it is granted when the name frees
          // and holds until the plan is released, so this product acquisition waits behind it.
          plan.triggered = true;
          void request<void>("test", plan.name, { mode: "exclusive" }, () => { plan.held = true; plan.entered(); return plan.gate; });
        }
      }
    }
    const record: LockRecord = { id: ++nextId, name: String(name), mode, owner, state: "waiting" };
    log.push(record);
    if (owner === "product" && denied.has(record.name)) {
      record.state = "rejected";
      return Promise.reject(new Error(`appearance-sol web lock request rejected (${record.name})`));
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
    /** Programs the manager: grant `grant` more product acquisitions of `name` normally, then hold the next one. */
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

export const OWNER_A = "appearance-sol-A";
export const OWNER_B = "appearance-sol-B";
export function marker(owner: string, generation: string, demo = false): void {
  nativeSet.call(localStorage, generationMarkerKey(owner, demo), JSON.stringify({ generation, migrationId: "appearance-sol", previous: null }));
}
export function activate(owner: string, generation = "g1", demo = false): AccountScope {
  marker(owner, generation, demo);
  const scope = accountScope.activate(accountScope.lock(owner), generation, demo);
  pre(accountScope.capture() === scope && scope.kind === (demo ? "demo" : "account") && scope.accountId === owner && scope.generation === generation, `${demo ? "demo" : "account"} scope ${owner}/${generation} active`);
  return scope;
}
export function lockAccount(owner: string | null = "appearance-sol-locked"): AccountScope {
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
/** StorageEvents dispatched by anyone other than the oracle since `from` (oracle-sent events are excluded). */
export const productStorageEvents = (from = 0): Dispatched[] => dispatched.slice(from).filter(event => !oracleSent.has(event));
const oracleSent = new Set<Dispatched>();
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
    const url = `blob:appearance-sol/${++counter}`;
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
export type Change = Readonly<{ operation: "set"; value: Value }> | Readonly<{ operation: "reset" }>;
export const SET = (value: Value): Change => ({ operation: "set", value });
export const RESET: Change = { operation: "reset" };
export const envelope = (device: Partial<Record<FieldId, Change>>) => ({ version: 1, kind: "appearance-draft", changes: { device } });
export async function expectSingleDownload(harness: Download, expected: unknown, tag: string): Promise<void> {
  expect(harness.clicks.length, `${tag}: exactly one download click`).toBe(1);
  expect(harness.clicks[0]?.download, `${tag}: filename appearance-draft.json`).toBe("appearance-draft.json");
  expect(harness.created.length, `${tag}: exactly one object URL created`).toBe(1);
  expect(harness.clicks[0]?.href, `${tag}: the anchor targets the created object URL`).toBe(harness.created[0]);
  expect(harness.revoked, `${tag}: that same object URL revoked`).toEqual([harness.created[0]]);
  expect(harness.anchorsInDocument().length, `${tag}: the anchor was removed`).toBe(0);
  expect(await harness.json(0), `${tag}: whole envelope (deep equality)`).toStrictEqual(expected);
}

// ---------------------------------------------------------------------------
// jsdom environment: controllable matchMedia, network refusals, dialog and location stubs
// ---------------------------------------------------------------------------

export const media: { dark: boolean; listeners: Set<(event: { matches: boolean }) => void> } = { dark: false, listeners: new Set() };
export function setSystemDark(dark: boolean): void {
  media.dark = dark;
  act(() => { for (const listener of Array.from(media.listeners)) listener({ matches: dark }); });
}
export const network = { fetch: 0, xhr: 0, socket: 0, eventSource: 0 };
export const networkAttempts = (): number => network.fetch + network.xhr + network.socket + network.eventSource;
function installEnvironment(): void {
  media.dark = false;
  media.listeners.clear();
  network.fetch = 0;
  network.xhr = 0;
  network.socket = 0;
  network.eventSource = 0;
  vi.stubGlobal("AbortController", transferableAbortController().constructor);
  vi.stubGlobal("ResizeObserver", class { observe(): void {} unobserve(): void {} disconnect(): void {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 0));
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => clearTimeout(handle));
  vi.stubGlobal("matchMedia", (query: string) => {
    const dark = query.includes("prefers-color-scheme: dark");
    const list = {
      get matches() { return dark ? media.dark : false; },
      media: query,
      onchange: null,
      addEventListener(type: string, listener: (event: { matches: boolean }) => void) { if (dark && type === "change") media.listeners.add(listener); },
      removeEventListener(type: string, listener: (event: { matches: boolean }) => void) { if (type === "change") media.listeners.delete(listener); },
      addListener(listener: (event: { matches: boolean }) => void) { if (dark) media.listeners.add(listener); },
      removeListener(listener: (event: { matches: boolean }) => void) { media.listeners.delete(listener); },
      dispatchEvent: () => false,
    };
    return list;
  });
  vi.stubGlobal("fetch", () => { network.fetch += 1; return Promise.reject(new TypeError("appearance-sol: network disabled")); });
  vi.stubGlobal("XMLHttpRequest", class { constructor() { network.xhr += 1; throw new TypeError("appearance-sol: network disabled"); } });
  vi.stubGlobal("WebSocket", class { constructor() { network.socket += 1; throw new TypeError("appearance-sol: network disabled"); } });
  vi.stubGlobal("EventSource", class { constructor() { network.eventSource += 1; throw new TypeError("appearance-sol: network disabled"); } });
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
// Production App mount (memory router over the production route table)
// ---------------------------------------------------------------------------

export const SETTINGS_APPEARANCE = "/app/settings/appearance";
let routeTable: RouteObject[] | null = null;
/** Each App test file passes the production `webHostRouteObjects` after substituting the auth-session hook. */
export function configureApp(routes: RouteObject[]): void { routeTable = routes; }
export interface App {
  readonly router: ReturnType<typeof createMemoryRouter>;
  readonly locations: Array<{ pathname: string; key: string; action: string }>;
  unmount(): void;
}
const routers: Array<ReturnType<typeof createMemoryRouter>> = [];
export async function mountApp(path = SETTINGS_APPEARANCE): Promise<App> {
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
/**
 * History mutations since a mark: the distinct location keys the router committed after `from`, excluding the key
 * current at the mark. Router subscribers also fire for non-navigation state (blockers, fetchers), so entries are
 * counted by location key, never by notification.
 */
export function historyMutations(app: App, from: number, startKey: string): string[] {
  return Array.from(new Set(app.locations.slice(from).map(entry => entry.key))).filter(key => key !== startKey);
}
export async function go(app: App, path: string | number): Promise<void> {
  await act(async () => { await (typeof path === "number" ? app.router.navigate(path) : app.router.navigate(path)); });
  await flush(12);
}
/** Standalone pane mount (no provider): `appearancePane.render({ lang })`, the registry entry the host composes. */
export function mountStandalone(node: React.ReactNode): ReturnType<typeof render> {
  pre(storageInstalled(), "attempt-counting Storage injector installed");
  pre(locksInstalled(), "exclusive Web Lock fixture installed as navigator.locks");
  return render(<>{node}</>);
}

// ---------------------------------------------------------------------------
// Displayed state, controls and recovery UI by stable selectors and accessible names (sections 2, 5, 9)
// ---------------------------------------------------------------------------

/** The route error boundary heading, if the `/app` route crashed. */
export function routeError(): string | null {
  const heading = Array.from(document.querySelectorAll("main.host-page h1")).find(element => (element.textContent ?? "").startsWith("Route Error"));
  return heading ? (heading.textContent ?? "") : null;
}
/** The language currently displayed, read from the Topbar trigger title ("Appearance"/"外观"). */
export function uiLang(): Lang {
  const trigger = document.querySelector<HTMLElement>(".topbar .topbar-pref-trigger");
  if (trigger) return trigger.getAttribute("title") === W.zh.paneTitle ? "zh" : "en";
  const title = document.querySelector(".appearance-pane .pane-title");
  return title?.textContent === W.zh.paneTitle ? "zh" : "en";
}
let paneScope: HTMLElement | null = null;
/** Restricts pane queries to a container (standalone mounts); null means the production Settings detail. */
export function usePaneRoot(container: HTMLElement | null): void { paneScope = container; }
export function paneOrNull(): HTMLElement | null {
  if (paneScope) return paneScope.querySelector<HTMLElement>(".appearance-pane");
  return document.querySelector<HTMLElement>('.settings-detail[data-pane="appearance"] .appearance-pane');
}
export function pane(): HTMLElement {
  const element = paneOrNull();
  pre(element, "the Appearance pane is mounted");
  return element;
}
const buttonsNamed = (root: HTMLElement, name: string, role = "button"): HTMLElement[] => within(root).queryAllByRole(role, { name }) as HTMLElement[];
function one(found: HTMLElement[], what: string): HTMLElement {
  pre(found.length === 1, `exactly one ${what} (got ${found.length})`);
  return found[0]!;
}
/** A pane option control for a value, by its section 2 selector and accessible name. */
export function paneControl(field: Field, value: Value, lang: Lang = uiLang()): HTMLElement {
  const root = pane();
  switch (field.id) {
    case "lang": return one(buttonsNamed(root, PANE_LANG_LABEL[String(value)]!), `language segment "${PANE_LANG_LABEL[String(value)]}"`);
    case "theme": return one(buttonsNamed(root, THEME_LABEL[lang][String(value)]!).filter(element => element.classList.contains("theme-card")), `.theme-card "${THEME_LABEL[lang][String(value)]}"`);
    case "density": return one(buttonsNamed(root, DENSITY_LABEL[lang][String(value)]!), `density segment "${DENSITY_LABEL[lang][String(value)]}"`);
    case "accentHue": return one(buttonsNamed(root, PRESET_LABEL[lang][Number(value)]!).filter(element => element.classList.contains("accent-sw")), `.accent-sw "${PRESET_LABEL[lang][Number(value)]}"`);
    case "bgTone": return one(buttonsNamed(root, TONE_LABEL[lang][String(value)]!).filter(element => element.classList.contains("bg-tone-card")), `.bg-tone-card "${TONE_LABEL[lang][String(value)]}"`);
    case "railPos": return one(buttonsNamed(root, RAIL_LABEL[lang][String(value)]!).filter(element => element.classList.contains("rail-pos-card")), `.rail-pos-card "${RAIL_LABEL[lang][String(value)]}"`);
    case "fontScale": return slider(FONT, lang);
  }
}
export function slider(field: Field, lang: Lang = uiLang()): HTMLInputElement {
  pre(field.id === "accentHue" || field.id === "fontScale", `${field.id} has a slider`);
  const name = SLIDER_LABEL[field.id as "accentHue" | "fontScale"][lang];
  return one(buttonsNamed(pane(), name, "slider"), `slider "${name}"`) as HTMLInputElement;
}
/** Makes a pane choice: a click on the option control, or a change event on the range input. */
export function choose(field: Field, value: Value, lang: Lang = uiLang()): void {
  if (field.id === "fontScale") { setSlider(FONT, value, lang); return; }
  fireEvent.click(paneControl(field, value, lang));
}
export function setSlider(field: Field, value: Value, lang: Lang = uiLang()): void {
  const input = slider(field, lang);
  fireEvent.change(input, { target: { value: String(value) } });
}
/** The value the pane displays as selected, or a description when none or several are selected. */
export function shown(field: Field, lang: Lang = uiLang()): Value | string {
  const root = pane();
  const pick = (selector: string, labels: Record<string, string>, active: (element: HTMLElement) => boolean): Value | string => {
    const chosen = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(active);
    if (chosen.length !== 1) return `selected:${chosen.length}`;
    const name = chosen[0]!.getAttribute("aria-label") ?? (chosen[0]!.textContent ?? "").trim();
    const entry = Object.entries(labels).find(([, label]) => label === name);
    return entry ? entry[0] : `unknown:${name}`;
  };
  switch (field.id) {
    case "lang": {
      const chosen = buttonsNamed(root, PANE_LANG_LABEL.en!).concat(buttonsNamed(root, PANE_LANG_LABEL.zh!)).filter(element => element.getAttribute("aria-selected") === "true");
      if (chosen.length !== 1) return `selected:${chosen.length}`;
      return (chosen[0]!.textContent ?? "").trim() === PANE_LANG_LABEL.zh ? "zh" : "en";
    }
    case "theme": return pick(".theme-card", THEME_LABEL[lang]!, element => element.classList.contains("active"));
    case "density": {
      const chosen = Object.entries(DENSITY_LABEL[lang]!).filter(([, label]) => buttonsNamed(root, label).some(element => element.getAttribute("aria-selected") === "true"));
      return chosen.length === 1 ? chosen[0]![0] : `selected:${chosen.length}`;
    }
    case "accentHue": return Number(slider(ACCENT, lang).value);
    case "bgTone": return pick(".bg-tone-card", TONE_LABEL[lang]!, element => element.classList.contains("active"));
    case "railPos": return pick(".rail-pos-card", RAIL_LABEL[lang]!, element => element.classList.contains("active"));
    case "fontScale": return Number(slider(FONT, lang).value);
  }
}
/** The accent and font readouts (section 2: the ° and % readouts). */
export function readout(field: Field): string {
  const input = slider(field);
  const row = input.closest(".accent-slider-row, .slider-row");
  pre(row, `${field.id} readout row`);
  const values = row.querySelectorAll(".slider-val");
  pre(values.length === 1, `${field.id} has one readout`);
  return (values[0]!.textContent ?? "").trim();
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
/** The `<html>` value expected for a displayed value (system resolves through matchMedia; default tone removes the attribute). */
export function appliedFor(field: Field, value: Value): Value | string | null {
  if (field.id === "theme" && value === "system") return media.dark ? "dark" : "light";
  if (field.id === "lang") return String(value);
  return value;
}
export const appRailPos = (): string | null => document.querySelector(".app")?.getAttribute("data-rail-pos") ?? null;
export function enabled(element: HTMLElement): boolean {
  return !(element as HTMLButtonElement).disabled && element.getAttribute("aria-disabled") !== "true";
}

// Topbar quick switcher
export function topbar(): HTMLElement {
  const element = document.querySelector<HTMLElement>("header.topbar");
  pre(element, "the production Topbar is mounted");
  return element;
}
export function topbarTrigger(): HTMLButtonElement {
  const trigger = topbar().querySelector<HTMLButtonElement>(".topbar-pref-trigger");
  pre(trigger, "the Topbar appearance trigger is present");
  return trigger;
}
export function topbarDialog(): HTMLElement | null {
  return topbar().querySelector<HTMLElement>('[role="dialog"]');
}
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
export function topbarLabel(field: Field, value: Value, lang: Lang = uiLang()): string {
  if (field.id === "lang") return TOPBAR_LANG_LABEL[String(value)]!;
  if (field.id === "theme") return THEME_LABEL[lang][String(value)]!;
  if (field.id === "density") return DENSITY_LABEL[lang][String(value)]!;
  throw new Error(`PRECONDITION: the Topbar has no ${field.id} option`);
}
export function topbarOption(field: Field, value: Value, lang: Lang = uiLang()): HTMLElement {
  const dialog = openTopbar();
  const name = topbarLabel(field, value, lang);
  return one(within(dialog).queryAllByRole("menuitemradio", { name }) as HTMLElement[], `Topbar menuitemradio "${name}"`);
}
export function chooseTopbar(field: Field, value: Value, lang: Lang = uiLang()): void {
  fireEvent.click(topbarOption(field, value, lang));
}
/** The value the Topbar shows as checked (opens the popover if needed). */
export function topbarChecked(field: Field, lang: Lang = uiLang()): Value | string {
  const dialog = openTopbar();
  const values = VALUES[field.id].filter(value => {
    const name = topbarLabel(field, value, lang);
    return (within(dialog).queryAllByRole("menuitemradio", { name }) as HTMLElement[]).some(element => element.getAttribute("aria-checked") === "true");
  });
  return values.length === 1 ? values[0]! : `checked:${values.length}`;
}
export function topbarSummary(): string {
  const summary = topbarTrigger().querySelector(".topbar-pref-summary");
  return (summary?.textContent ?? "").trim();
}
export function summaryFor(lang: Lang, theme: Value, density: Value): string {
  return `${lang === "zh" ? "中文" : "EN"} · ${THEME_LABEL[uiLang()][String(theme)] ?? String(theme)} · ${DENSITY_LABEL[uiLang()][String(density)] ?? String(density)}`;
}
/** The Topbar status (section 7 item 2): `[data-testid="appearance-status"]`. */
export function topbarStatus(): HTMLElement | null {
  return document.querySelector<HTMLElement>('header.topbar [data-testid="appearance-status"]');
}
export function topbarStatusNamed(lang: Lang = uiLang()): HTMLElement | null {
  const found = within(topbar()).queryAllByRole("button", { name: W[lang].statusName }) as HTMLElement[];
  return found.find(element => element.getAttribute("data-testid") === "appearance-status") ?? null;
}

// Pane recovery UI and the bottom action area
export function paneButton(name: string): HTMLButtonElement | null {
  const root = paneOrNull();
  if (!root) return null;
  return (buttonsNamed(root, name)[0] as HTMLButtonElement | undefined) ?? null;
}
export const retryOf = (field: Field, lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].retry(labelOf(field, lang)));
export const discardOf = (field: Field, lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].discard(labelOf(field, lang)));
export const reloadOf = (field: Field, lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].reload(labelOf(field, lang)));
export const exportButton = (lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].exportDraft);
export const discardAllButton = (lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].discardAll);
/** Retry all by role and name (A2.1); the testid is asserted separately as a business requirement. */
export const retryAll = (lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].retryAll);
/** Today's bottom primary action (section 3 item 4), present only at 5cd63ff. */
export const saveAndApply = (lang: Lang = uiLang()): HTMLButtonElement | null => paneButton(W[lang].oldSave) ?? paneButton(W[lang].oldSaved);
export function resetButtons(lang: Lang = uiLang()): HTMLButtonElement[] {
  const root = paneOrNull();
  return root ? (buttonsNamed(root, W[lang].reset) as HTMLButtonElement[]) : [];
}
export function resetButton(lang: Lang = uiLang()): HTMLButtonElement {
  const found = resetButtons(lang);
  pre(found.length === 1, `exactly one "${W[lang].reset}" button by role and name (got ${found.length})`);
  return found[0]!;
}
/** Activates Reset to defaults with the given confirmation answer; returns the confirm messages it produced. */
export function clickReset(answer: boolean, lang: Lang = uiLang()): string[] {
  const control = resetButton(lang);
  confirmer.answer = answer;
  const before = confirmer.calls.length;
  fireEvent.click(control);
  const produced = confirmer.calls.slice(before);
  expect(produced.length, "§6: one Reset to defaults activation asks window.confirm exactly once").toBe(1);
  return produced;
}
export function recoveryBlock(field: Field): HTMLElement | null {
  return paneOrNull()?.querySelector<HTMLElement>(`[data-appearance-recovery="${field.id}"]`) ?? null;
}
export function statusLine(): HTMLElement | null {
  return paneOrNull()?.querySelector<HTMLElement>('[data-testid="appearance-status-line"]') ?? null;
}
export const statusText = (): string | null => {
  const line = statusLine();
  return line ? (line.textContent ?? "").replace(/\s+/g, " ").trim() : null;
};
/** True when the status line shows a success line (A2.4 rule 4). */
export const successShown = (): boolean => SUCCESS_LINES.includes(statusText() ?? "") || SUCCESS_LINES.some(line => paneText().includes(line));
export const paneText = (): string => (paneOrNull()?.textContent ?? "").replace(/\s+/g, " ").trim();
export const pageText = (): string => (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
export const says = (message: string): boolean => paneText().includes(message);
/** Today's unconditional flash: a pane button that reads exactly "Saved"/"已保存" or carries `.is-saved`. */
export function flashShown(): boolean {
  const root = paneOrNull();
  if (!root) return false;
  return Array.from(root.querySelectorAll<HTMLElement>("button")).some(element => element.classList.contains("is-saved") || ([W.en.oldSaved, W.zh.oldSaved] as readonly string[]).includes((element.textContent ?? "").trim()));
}
/** Pane controls named "Save & apply"/"保存生效" (A2.1: never present after the caller). */
export function oldButtons(): HTMLElement[] {
  const root = paneOrNull();
  if (!root) return [];
  return [W.en.oldSave, W.zh.oldSave, W.en.oldSaved, W.zh.oldSaved].flatMap(name => buttonsNamed(root, name));
}
/** The Retry all attributes the contract governs (A2.1, A2.2). */
export function retryAllState(button: HTMLElement): { ariaDisabled: string | null; disabledAttr: boolean; describedBy: string | null; describedByStatus: boolean; tabIndex: number; type: string | null; testid: string | null; inert: boolean; hidden: boolean } {
  const line = statusLine();
  const ids = (button.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  return {
    ariaDisabled: button.getAttribute("aria-disabled"),
    disabledAttr: button.hasAttribute("disabled"),
    describedBy: button.getAttribute("aria-describedby"),
    describedByStatus: Boolean(line && line.id && ids.includes(line.id)),
    tabIndex: button.tabIndex,
    type: button.getAttribute("type"),
    testid: button.getAttribute("data-testid"),
    inert: button.hasAttribute("inert") || button.closest("[inert]") !== null,
    hidden: button.hasAttribute("hidden") || button.getAttribute("aria-hidden") === "true",
  };
}
export const isDisabledState = (button: HTMLElement): boolean => button.getAttribute("aria-disabled") === "true" && !button.hasAttribute("disabled");
export const isEnabledState = (button: HTMLElement): boolean => (button.getAttribute("aria-disabled") === null || button.getAttribute("aria-disabled") === "false") && !button.hasAttribute("disabled");

// Settings sidebar, AppRail and sign-out controls
export function sidebarRow(name: string): HTMLElement {
  const sidebar = document.querySelector<HTMLElement>(".settings-sidebar");
  pre(sidebar, "the Settings sidebar is mounted");
  return one(within(sidebar).queryAllByRole("button", { name }) as HTMLElement[], `Settings sidebar row "${name}"`);
}
export function railButton(name: string): HTMLElement {
  const rail = document.querySelector<HTMLElement>(".app-rail");
  pre(rail, "the production AppRail is mounted");
  return one(within(rail).queryAllByRole("button", { name }) as HTMLElement[], `AppRail button "${name}"`);
}
/** Opens the avatar menu, chooses Sign Out and confirms the existing sign-out dialog. */
export async function signOut(lang: Lang = uiLang()): Promise<void> {
  const rail = document.querySelector<HTMLElement>(".app-rail");
  pre(rail, "the production AppRail is mounted");
  // The avatar menu stays open after a cancelled sign-out; the trigger toggles it, so open it only when closed.
  if (!document.querySelector('.avatar-menu[role="menu"]')) {
    fireEvent.click(one(within(rail).queryAllByRole("button", { name: lang === "zh" ? "打开账户菜单" : "Open account menu" }) as HTMLElement[], "avatar menu button"));
  }
  const menu = document.querySelector<HTMLElement>('.avatar-menu[role="menu"]');
  pre(menu, "the avatar menu opened");
  const label = lang === "zh" ? "退出登录" : "Sign Out";
  fireEvent.click(one((within(menu).queryAllByRole("button", { name: label }) as HTMLElement[]).filter(element => element.classList.contains("avm-item")), `avatar menu "${label}"`));
  const dialog = document.querySelector<HTMLElement>("dialog.xai-sign-out-dialog[open]");
  pre(dialog, "the existing sign-out confirmation dialog opened");
  await act(async () => { fireEvent.click(one(within(dialog).queryAllByRole("button", { name: label }) as HTMLElement[], `sign-out dialog "${label}"`)); });
  await flush(24);
}

// ---------------------------------------------------------------------------
// Controller ruling 5: the inherited ordering of Features follow-up 2 (contract section 12, four named cases)
// ---------------------------------------------------------------------------

export interface Ruling5Case {
  readonly name: "fu2-retry-theme" | "fu2-retry-railPos" | "fu2-retry-all-theme" | "fu2-retry-all-railPos";
  readonly field: Field;
  /** Seeded baseline bytes. */
  readonly baseline: string;
  /** The pane choice made while the set is in flight. */
  readonly choice: Value;
  readonly recovery: "retry" | "retry-all";
}
export const RULING5: Readonly<Record<Ruling5Case["name"], Ruling5Case>> = {
  "fu2-retry-theme": { name: "fu2-retry-theme", field: THEME, baseline: '"system"', choice: "dark", recovery: "retry" },
  "fu2-retry-railPos": { name: "fu2-retry-railPos", field: RAIL, baseline: "bottom", choice: "right", recovery: "retry" },
  "fu2-retry-all-theme": { name: "fu2-retry-all-theme", field: THEME, baseline: '"system"', choice: "dark", recovery: "retry-all" },
  "fu2-retry-all-railPos": { name: "fu2-retry-all-railPos", field: RAIL, baseline: "bottom", choice: "right", recovery: "retry-all" },
};
const describeWriteOutcome = (item: Attempt): string => (item.op === "set" ? `setItem(${item.key}, ${item.value})` : `removeItem(${item.key})`) + (item.threw ? " threw" : " returned");

/**
 * Runs one ruling-5 case in EN in the production App with the exclusive Web Lock fixture, the attempt-level
 * Storage injector and the window.confirm recorder, exactly as contract section 12 steps 1–6 specify. A business
 * FAIL ends the case; later preconditions are then not evaluated.
 */
export async function runRuling5(spec: Ruling5Case): Promise<void> {
  const { field, baseline, choice, recovery } = spec;
  const choiceBytes = enc(field, choice);
  const five = RESET_FIELDS.filter(entry => entry !== field);
  seed(field, baseline);
  seedValue(LANG, "en");
  for (const other of five) absent(other);
  const initial = snapshot([field.key]);
  await mountApp();
  pre(uiLang() === "en", "the case runs in EN");
  const lockName = keyLock(field);
  const control = paneControl(field, choice);
  const successSeen: boolean[] = [];
  const sample = (): void => { successSeen.push(successShown()); };
  const start = mark();
  const lock = await hold(lockName);

  // Step 1 — a set in flight.
  fireEvent.click(control);
  await flush();
  expect(bytes(field), `R5 ${spec.name} step 1 (H8): while the per-key lock is held the bytes are still the baseline`).toBe(baseline);
  expect(writesOn(start, field), `R5 ${spec.name} step 1: zero set or remove attempts on ${field.key}`).toEqual([]);
  expect(says(msg.saving(field)), `R5 ${spec.name} step 1 (H12): "${msg.saving(field)}"`).toBe(true);
  sample();

  // Step 2 — Reset accepted while the set is in flight.
  const resetStart = mark();
  clickReset(true);
  await flush();
  expect(shown(field), `R5 ${spec.name} step 2: the field displays the default`).toBe(field.defaultValue);
  expect(applied(field), `R5 ${spec.name} step 2: the field applies the default`).toBe(appliedFor(field, field.defaultValue));
  expect(attempts(resetStart, five.map(other => other.key), ["remove"]).map(item => item.key), `R5 ${spec.name} step 2: the five absent keys complete as verified no-ops without removeItem`).toEqual([]);
  expect(five.filter(other => says(msg.resetting(other)) || says(msg.notReset(other))).map(other => other.id), `R5 ${spec.name} step 2: the five verified no-ops are complete`).toEqual([]);
  sample();

  // Step 3 — the in-flight set fails.
  const quota = fault({ op: "set", key: field.key, times: 1, label: `${spec.name} one-shot quota` });
  const step3 = mark();
  await lock.release();
  expect(attempts(step3, [field.key], ["set", "remove"]).map(describeWriteOutcome), `R5 ${spec.name} step 3: exactly one setItem(${field.key}, ${choiceBytes}) attempt, which threw, and zero removeItem`).toEqual([`setItem(${field.key}, ${choiceBytes}) threw`]);
  fired(quota, `${spec.name} step 3 in-flight set`);
  expect(bytes(field), `R5 ${spec.name} step 3: the bytes are still the baseline`).toBe(baseline);
  expect(says(msg.notReset(field)), `R5 ${spec.name} step 3: "${msg.notReset(field)}"`).toBe(true);
  expect(shown(field), `R5 ${spec.name} step 3: still displays the default`).toBe(field.defaultValue);
  expect(applied(field), `R5 ${spec.name} step 3: still applies the default`).toBe(appliedFor(field, field.defaultValue));
  expect(topbarStatusNamed("en"), `R5 ${spec.name} step 3: the Topbar status is shown`).not.toBeNull();
  expect(successShown(), `R5 ${spec.name} step 3: no success line`).toBe(false);
  let retryAllButton: HTMLButtonElement | null = null;
  if (recovery === "retry-all") {
    retryAllButton = need(retryAll("en"), `R5 ${spec.name} step 3 (H16): Retry all`);
    expect(isEnabledState(retryAllButton), `R5 ${spec.name} step 3: Retry all is enabled`).toBe(true);
  }
  sample();

  // Step 4 — recovery: grant the next acquisition of the key's lock and hold the one after it.
  const plan = locks().plan(lockName, 1);
  const step4 = mark();
  if (recovery === "retry") {
    fireEvent.click(need(retryOf(field, "en"), `R5 ${spec.name} step 4 (H12): ${W.en.retry(field.label.en)}`));
  } else {
    await user().click(retryAllButton!);
  }
  await plan.waitHeld();

  // Step 5 — transient write sequence while the queued removal is held.
  expect(attempts(step4, undefined, ["set", "remove"]).map(describeWriteOutcome), `R5 ${spec.name} step 5: the attempt log since step 4 is exactly the re-written superseded set`).toEqual([`setItem(${field.key}, ${choiceBytes}) returned`]);
  expect(bytes(field), `R5 ${spec.name} step 5: the bytes equal the superseded choice`).toBe(choiceBytes);
  expect(shown(field), `R5 ${spec.name} step 5: the field still displays the default`).toBe(field.defaultValue);
  expect(applied(field), `R5 ${spec.name} step 5: the field still applies the default`).toBe(appliedFor(field, field.defaultValue));
  expect(says(msg.resetting(field)), `R5 ${spec.name} step 5: "${msg.resetting(field)}"`).toBe(true);
  expect(successShown(), `R5 ${spec.name} step 5: no success line`).toBe(false);
  if (recovery === "retry-all") {
    expect(statusText(), `R5 ${spec.name} step 5: the pass is open`).toBe(W.en.retrying);
    expect(isDisabledState(retryAllButton!), `R5 ${spec.name} step 5: Retry all is disabled (aria-disabled, never disabled)`).toBe(true);
  }
  sample();

  // Step 6 — final bytes.
  await plan.release();
  expect(attempts(step4, undefined, ["set", "remove"]).map(describeWriteOutcome), `R5 ${spec.name} step 6: the attempt log since step 4 is the set then the removal, nothing on any other key`).toEqual([`setItem(${field.key}, ${choiceBytes}) returned`, `removeItem(${field.key}) returned`]);
  expect(attempts(start, [field.key], ["set", "remove"]).map(describeWriteOutcome), `R5 ${spec.name} step 6: over the whole case the log for ${field.key} is the failed set, the set, the removal`).toEqual([`setItem(${field.key}, ${choiceBytes}) threw`, `setItem(${field.key}, ${choiceBytes}) returned`, `removeItem(${field.key}) returned`]);
  expect(bytes(field), `R5 ${spec.name} step 6: the reset's verified absence`).toBeNull();
  expect(five.map(other => bytes(other)), `R5 ${spec.name} step 6: the other five Reset keys are absent`).toEqual(five.map(() => null));
  expect(snapshot([field.key]), `R5 ${spec.name} step 6: xai_pref_lang and every other key equal the snapshot`).toStrictEqual(initial);
  expect(says(msg.resetting(field)) || says(msg.notReset(field)), `R5 ${spec.name} step 6: the draft is cleared`).toBe(false);
  expect(successSeen, `R5 ${spec.name} step 6: no success line appeared before this point`).toEqual(successSeen.map(() => false));
  expect(paneText().includes(W.en.saved), `R5 ${spec.name} step 6: "${W.en.saved}" never appears`).toBe(false);
  if (recovery === "retry-all") expect(statusText(), `R5 ${spec.name} step 6: "${W.en.restored}" appears (A2.4 rule 4)`).toBe(W.en.restored);
  else expect(["", W.en.restored], `R5 ${spec.name} step 6: "${W.en.restored}" is the only permitted success line`).toContain(statusText() ?? "");
  expect(topbarStatus(), `R5 ${spec.name} step 6: no Topbar status`).toBeNull();
  expect(warns(), `R5 ${spec.name} step 6: beforeunload is removed`).toBe(false);
  if (recovery === "retry-all") {
    const current = retryAll("en");
    expect(current, `R5 ${spec.name} step 6: Retry all stays rendered`).toBe(retryAllButton);
    expect(isDisabledState(current!), `R5 ${spec.name} step 6: the pass has closed and Retry all is disabled`).toBe(true);
    expect(document.activeElement, `R5 ${spec.name} step 6: focus has not moved`).toBe(retryAllButton);
  }
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
  paneScope = null;
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
  paneScope = null;
  resetDocument();
  const errors = lockState.manager?.errors ?? [];
  lockState.missing = false;
  if (unmountFailure) throw unmountFailure;
  if (nested !== 0) throw new Error(`PRECONDITION: F-B002 the storage wrappers re-entered Storage ${nested} time(s)`);
  if (errors.length > 0) throw new Error(`PRECONDITION: the Web Lock fixture could not serve a request: ${errors.join("; ")}`);
}
