import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { dateTimePane } from "../../../packages/plugin-web-settings-rest/src/panes/dateTimePane";
import { prefMutationLockName } from "../../../packages/plugin-web-storage/src/internal/prefMutation";
import { createTestLockManager } from "../web-board-workspace-astra-review/named-lock-fixture";

export const keys = ["xai_pref_dt_start_week", "xai_pref_dt_lunar", "xai_pref_dt_week_numbers", "xai_pref_dt_holidays", "xai_pref_dt_timezone"] as const;
export const defaults = ["monday", "true", "true", "true", "true"] as const;
export type Guard = { token: object; label?: string; isBlocking(): boolean; isCurrent(): boolean; exportDraft(): void; discardDraft(): void };
export const guards: Guard[] = [];
export const nativeGet = Storage.prototype.getItem;
export const nativeSet = Storage.prototype.setItem;

export function activate(owner: string, generation = "g1") {
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "dt-sol", previous: null }));
  accountScope.activate(accountScope.lock(owner), generation);
}
export function setup() {
  localStorage.clear(); activate("dt-sol-A");
  keys.forEach((key, index) => nativeSet.call(localStorage, key, defaults[index]));
  guards.length = 0; vi.stubGlobal("navigator", { locks: createTestLockManager() });
}
export function mount() {
  const registerDepartureGuard = (next: Guard) => { guards.push(next); return () => {}; };
  const ui = render(dateTimePane.render({ lang: "en", registerDepartureGuard }));
  return { ...ui, select: () => ui.getByLabelText("Start week on") as HTMLSelectElement, toggle: (name: string) => ui.getByRole("switch", { name }) as HTMLButtonElement };
}
export const guard = () => guards.at(-1) ?? null;
export async function flush(rounds = 8) { await act(async () => { for (let i = 0; i < rounds; i += 1) await new Promise(resolve => setTimeout(resolve, 0)); }); }
export function changeAll(ui: ReturnType<typeof mount>) {
  fireEvent.change(ui.select(), { target: { value: "sunday" } });
  for (const label of ["Show Lunar Calendar", "Show Week Numbers (W)", "Show Holidays", "Time Zone"]) fireEvent.click(ui.toggle(label));
}
export function visible(ui: ReturnType<typeof mount>) { return [ui.select().value, ...["Show Lunar Calendar", "Show Week Numbers (W)", "Show Holidays", "Time Zone"].map(label => ui.toggle(label).getAttribute("aria-checked"))]; }
export function physical() { return keys.map(key => nativeGet.call(localStorage, key)); }
export function unload() { const event = new Event("beforeunload", { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; }
export async function hold(key: string) { let release!: () => void, entered!: () => void; const ready = new Promise<void>(r => entered = r), gate = new Promise<void>(r => release = r); const task = navigator.locks.request(prefMutationLockName(key), { mode: "exclusive" }, () => { entered(); return gate; }); await ready; return async () => { await act(async () => { release(); await task; }); }; }
export function download() { let blob: Blob | null = null; const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {}); const revoke = vi.fn(); vi.stubGlobal("URL", { createObjectURL: vi.fn((value: Blob) => { blob = value; return "blob:dt-sol"; }), revokeObjectURL: revoke }); return { click, revoke, read: async () => JSON.parse(await new Promise<string>((resolve, reject) => { if (!blob) throw new Error("No Date Time Blob"); const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsText(blob); })) }; }
