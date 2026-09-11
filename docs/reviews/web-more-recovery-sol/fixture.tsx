import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import { accountScope, accountLifecycleLockName, generationMarkerKey, PREF_REGISTRY, prefMutationLockName, type AccountScope } from "@repo/plugin-web-storage";
import { morePane } from "../../../packages/plugin-web-settings-rest/src/panes/morePane";
import { createTestLockManager } from "../web-board-workspace-astra-review/named-lock-fixture";

export type FieldId = "win_type" | "launch_at_login" | "minimize_on_launch" | "date_recognition" | "remove_date_text" | "remove_tags" | "url_parse" | "default_date" | "default_rem_due" | "default_rem_all" | "default_pri" | "default_tag" | "default_list" | "add_to" | "overdue_at";
export type Value = boolean | string;
export type FieldCase = Readonly<{ field: FieldId; key: keyof typeof PREF_REGISTRY; label: string; owner: "device" | "account"; default: Value; initial: Value; first: Value; latest: Value; domain: readonly Value[] }>;
const key = (field: FieldId) => `xai_pref_more_${field}` as keyof typeof PREF_REGISTRY;
export const cases: readonly FieldCase[] = [
  { field: "win_type", key: key("win_type"), label: "Choose window type when launching", owner: "device", default: "window", initial: "tray", first: "full", latest: "window", domain: ["window", "tray", "full"] },
  { field: "launch_at_login", key: key("launch_at_login"), label: "Launch at Login", owner: "device", default: false, initial: true, first: false, latest: true, domain: [false, true] },
  { field: "minimize_on_launch", key: key("minimize_on_launch"), label: "Minimize app when auto launching", owner: "device", default: false, initial: true, first: false, latest: true, domain: [false, true] },
  { field: "date_recognition", key: key("date_recognition"), label: "Date Recognition", owner: "device", default: true, initial: false, first: true, latest: false, domain: [false, true] },
  { field: "remove_date_text", key: key("remove_date_text"), label: "Remove text in tasks", owner: "device", default: false, initial: true, first: false, latest: true, domain: [false, true] },
  { field: "remove_tags", key: key("remove_tags"), label: "Remove tags from task name", owner: "device", default: true, initial: false, first: true, latest: false, domain: [false, true] },
  { field: "url_parse", key: key("url_parse"), label: "URL Parsing", owner: "device", default: true, initial: false, first: true, latest: false, domain: [false, true] },
  { field: "default_date", key: key("default_date"), label: "Default Date", owner: "device", default: "none", initial: "today", first: "tomorrow", latest: "none", domain: ["none", "today", "tomorrow"] },
  { field: "default_rem_due", key: key("default_rem_due"), label: "Default Reminders (Due time task)", owner: "device", default: "on_time", initial: "5min", first: "15min", latest: "on_time", domain: ["none", "on_time", "5min", "15min"] },
  { field: "default_rem_all", key: key("default_rem_all"), label: "Default Reminders (All day task)", owner: "device", default: "none", initial: "9am", first: "day_before", latest: "none", domain: ["none", "9am", "day_before"] },
  { field: "default_pri", key: key("default_pri"), label: "Default Priority", owner: "device", default: "none", initial: "low", first: "high", latest: "none", domain: ["none", "low", "med", "high"] },
  { field: "default_tag", key: key("default_tag"), label: "Default Tag", owner: "account", default: "none", initial: "study", first: "work", latest: "none", domain: ["none", "study", "work", "personal"] },
  { field: "default_list", key: key("default_list"), label: "Default List", owner: "account", default: "inbox", initial: "today", first: "inbox", latest: "today", domain: ["inbox", "today"] },
  { field: "add_to", key: key("add_to"), label: "Default Add to", owner: "device", default: "top", initial: "bottom", first: "top", latest: "bottom", domain: ["top", "bottom"] },
  { field: "overdue_at", key: key("overdue_at"), label: "Overdue Section shows at", owner: "device", default: "top", initial: "bottom", first: "top", latest: "bottom", domain: ["top", "bottom"] },
] as const;
export const deviceCases = cases.filter(entry => entry.owner === "device"), accountCases = cases.filter(entry => entry.owner === "account"), selectCases = cases.filter(entry => typeof entry.default === "string");
export const nativeGet = Storage.prototype.getItem, nativeSet = Storage.prototype.setItem, nativeRemove = Storage.prototype.removeItem;
export type Guard = { token: object; label?: string; isBlocking(): boolean; isCurrent(): boolean; exportDraft(): void; discardDraft(): void };
export const guards: Guard[] = [];

export function encode(value: Value) { return String(value); }
export function activate(owner: string, generation = "g1") {
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "more-sol", previous: null }));
  return accountScope.activate(accountScope.lock(owner), generation);
}
export function physical(entry: FieldCase, scope: AccountScope = accountScope.capture()) { return accountScope.physicalKey(entry.key, scope); }
export function seed(scope: AccountScope, values: (entry: FieldCase) => Value = entry => entry.initial) { for (const entry of cases) nativeSet.call(localStorage, physical(entry, scope), encode(values(entry))); }
export function setup() { localStorage.clear(); const scope = activate("more-sol-A"); seed(scope); guards.length = 0; vi.stubGlobal("navigator", { locks: createTestLockManager() }); return scope; }
export function mount(lang: "en" | "zh" = "en") { return render(morePane.render({ lang, registerDepartureGuard: next => { guards.push(next as Guard); return () => {}; } })); }
export const guard = () => guards.at(-1) ?? null;
export async function flush(rounds = 10) { await act(async () => { for (let i = 0; i < rounds; i += 1) await new Promise(resolve => setTimeout(resolve, 0)); }); }

function booleanControl(ui: ReturnType<typeof mount>, entry: FieldCase): HTMLElement {
  const byRole = ui.queryByRole("switch", { name: entry.label }) ?? ui.queryByRole("checkbox", { name: entry.label }) ?? ui.queryByRole("button", { name: entry.label });
  if (byRole) return byRole;
  const row = Array.from(ui.container.querySelectorAll(".setting-row")).find(node => node.textContent?.includes(entry.label === "Remove tags from task name" ? "Tag Recognition" : entry.label));
  const fallback = row?.querySelector<HTMLElement>(".check-inline"); if (!fallback) throw new Error(`Missing boolean control ${entry.field}`); return fallback;
}
export function controlValue(ui: ReturnType<typeof mount>, entry: FieldCase): Value {
  if (typeof entry.default === "string") return (ui.getByLabelText(entry.label) as HTMLSelectElement).value;
  const control = booleanControl(ui, entry), checked = control.getAttribute("aria-checked"), pressed = control.getAttribute("aria-pressed");
  if (checked !== null) return checked === "true"; if (pressed !== null) return pressed === "true"; if (control instanceof HTMLInputElement) return control.checked;
  return Boolean(control.querySelector(".cbx.checked"));
}
export function editField(ui: ReturnType<typeof mount>, entry: FieldCase, value: Value) {
  if (typeof entry.default === "string") fireEvent.change(ui.getByLabelText(entry.label), { target: { value } });
  else if (controlValue(ui, entry) !== value) fireEvent.click(booleanControl(ui, entry));
}
export async function hold(entry: FieldCase) {
  let release!: () => void, entered!: () => void; const ready = new Promise<void>(resolve => { entered = resolve; }); const gate = new Promise<void>(resolve => { release = resolve; });
  const task = navigator.locks.request(prefMutationLockName(physical(entry)), { mode: "exclusive" }, () => { entered(); return gate; }); await ready;
  return async () => { await act(async () => { release(); await task; }); };
}
export async function holdAccount(owner = "more-sol-A") {
  let release!: () => void, entered!: () => void; const ready = new Promise<void>(resolve => { entered = resolve; }); const gate = new Promise<void>(resolve => { release = resolve; });
  const task = navigator.locks.request(accountLifecycleLockName(owner), { mode: "exclusive" }, () => { entered(); return gate; }); await ready;
  return async () => { await act(async () => { release(); await task; }); };
}
export function expectedChange(entry: FieldCase, operation: "reset" | "set", value?: Value) { return operation === "reset" ? { operation } : { operation, value }; }
export function expectedDraft(entries: Array<{ entry: FieldCase; operation: "reset" | "set"; value?: Value }>) {
  const changes: { device?: Record<string, unknown>; account?: Record<string, unknown> } = {};
  for (const item of entries) { const bucket = item.entry.owner; (changes[bucket] ??= {})[item.entry.field] = expectedChange(item.entry, item.operation, item.value); }
  return { version: 1, kind: "more-draft", changes };
}
export function download() {
  let blob: Blob | null = null; const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {}); const revoke = vi.fn();
  vi.stubGlobal("URL", { createObjectURL: vi.fn((value: Blob) => { blob = value; return "blob:more-sol"; }), revokeObjectURL: revoke });
  return { click, revoke, read: async () => JSON.parse(await new Promise<string>((resolve, reject) => { if (!blob) throw new Error("No More Blob"); const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsText(blob); })) };
}
export function unload() { const event = new Event("beforeunload", { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; }
