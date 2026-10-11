import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { notificationsPane } from "../../../packages/plugin-web-settings-rest/src/panes/notificationsPane";
import { prefMutationLockName } from "../../../packages/plugin-web-storage/src/internal/prefMutation";
import { createTestLockManager } from "../web-board-workspace-astra-review/named-lock-fixture";

export type FieldId = "enabled" | "done_sound" | "push_task" | "push_pomo" | "push_habit" | "quiet" | "quiet_start" | "quiet_end";
export type FieldValue = boolean | string;
export type FieldCase = Readonly<{ field: FieldId; key: string; label: string; initial: FieldValue; first: FieldValue; latest: FieldValue }>;

export const cases: readonly FieldCase[] = [
  { field: "enabled", key: "xai_pref_notif_enabled", label: "Enable notifications", initial: true, first: false, latest: true },
  { field: "done_sound", key: "xai_pref_notif_done_sound", label: "Sound", initial: "subtle", first: "chime", latest: "bell" },
  { field: "push_task", key: "xai_pref_notif_push_task", label: "Task due", initial: true, first: false, latest: true },
  { field: "push_pomo", key: "xai_pref_notif_push_pomo", label: "Pomodoro complete", initial: true, first: false, latest: true },
  { field: "push_habit", key: "xai_pref_notif_push_habit", label: "Habit reminder", initial: false, first: true, latest: false },
  { field: "quiet", key: "xai_pref_notif_quiet", label: "Enable quiet hours", initial: false, first: true, latest: false },
  { field: "quiet_start", key: "xai_pref_notif_quiet_start", label: "Quiet hours start", initial: "22:00", first: "23:15", latest: "21:45" },
  { field: "quiet_end", key: "xai_pref_notif_quiet_end", label: "Quiet hours end", initial: "07:00", first: "06:30", latest: "08:45" },
] as const;

export const keys = cases.map(entry => entry.key);
export const nativeGet = Storage.prototype.getItem;
export const nativeSet = Storage.prototype.setItem;
export type Guard = { token: object; label?: string; isBlocking(): boolean; isCurrent(): boolean; exportDraft(): void; discardDraft(): void };
export const guards: Guard[] = [];

export function encode(value: FieldValue): string { return typeof value === "boolean" ? String(value) : value; }
export function activate(owner: string, generation = "g1") {
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "notif-sol", previous: null }));
  accountScope.activate(accountScope.lock(owner), generation);
}
export function setup() {
  localStorage.clear(); activate("notif-sol-A");
  for (const entry of cases) nativeSet.call(localStorage, entry.key, encode(entry.initial));
  guards.length = 0;
  vi.stubGlobal("navigator", { locks: createTestLockManager() });
}
export function mount() {
  const registerDepartureGuard = (next: Guard) => { guards.push(next); return () => {}; };
  return render(notificationsPane.render({ lang: "en", registerDepartureGuard }));
}
export const guard = () => guards.at(-1) ?? null;
export async function flush(rounds = 8) { await act(async () => { for (let index = 0; index < rounds; index += 1) await new Promise(resolve => setTimeout(resolve, 0)); }); }
export async function ensureQuiet(ui: ReturnType<typeof mount>) {
  if (!ui.queryByLabelText("Quiet hours start")) { fireEvent.click(ui.getByRole("switch", { name: "Enable quiet hours" })); await flush(12); }
}
export function controlValue(ui: ReturnType<typeof mount>, entry: FieldCase): FieldValue {
  if (typeof entry.latest === "boolean") return ui.getByRole("switch", { name: entry.label }).getAttribute("aria-checked") === "true";
  return (ui.getByLabelText(entry.label) as HTMLInputElement | HTMLSelectElement).value;
}
export function editField(ui: ReturnType<typeof mount>, entry: FieldCase, value: FieldValue) {
  if (typeof value === "boolean") {
    const control = ui.getByRole("switch", { name: entry.label });
    if ((control.getAttribute("aria-checked") === "true") !== value) fireEvent.click(control);
  } else fireEvent.change(ui.getByLabelText(entry.label), { target: { value } });
}
export function unload() { const event = new Event("beforeunload", { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; }
export async function hold(key: string) {
  let release!: () => void, entered!: () => void;
  const ready = new Promise<void>(resolve => { entered = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  const task = navigator.locks.request(prefMutationLockName(key), { mode: "exclusive" }, () => { entered(); return gate; });
  await ready;
  return async () => { await act(async () => { release(); await task; }); };
}
export function download() {
  let blob: Blob | null = null;
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const revoke = vi.fn();
  vi.stubGlobal("URL", { createObjectURL: vi.fn((value: Blob) => { blob = value; return "blob:notif-sol"; }), revokeObjectURL: revoke });
  return {
    click,
    revoke,
    read: async () => JSON.parse(await new Promise<string>((resolve, reject) => {
      if (!blob) throw new Error("No Notifications Blob");
      const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsText(blob);
    })),
  };
}
