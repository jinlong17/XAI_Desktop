import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { DashHeader } from "../../../packages/xai-web-dashboard-grid/src/DashHeader";
import { createTestLockManager } from "../web-board-workspace-astra-review/named-lock-fixture";

export type HeaderGuard = {
  token: object;
  label?: string;
  isBlocking(): boolean;
  isCurrent(): boolean;
  exportDraft(): void;
  discardDraft(): void;
};

export const nativeGet = Storage.prototype.getItem;
export const nativeSet = Storage.prototype.setItem;
export const offsetKey = "xai_pref_dashboard_header_note_x";
export let noteKey = "";
export const guards: HeaderGuard[] = [];

export function activate(owner: string, generation = "g1") {
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "sol-fixture", previous: null }));
  accountScope.activate(accountScope.lock(owner), generation);
  return accountScope.capture();
}

export function setup() {
  localStorage.clear();
  activate("header-sol-A");
  noteKey = accountScope.physicalKey("xai_pref_dashboard_header_note");
  nativeSet.call(localStorage, noteKey, "Original A");
  nativeSet.call(localStorage, offsetKey, "0");
  guards.length = 0;
  Object.defineProperty(navigator, "locks", { configurable: true, value: createTestLockManager() });
}

export function mount() {
  const registerDepartureGuard = (guard: HeaderGuard) => {
    guards.push(guard);
    return () => {};
  };
  const props = { lang: "en", now: new Date("2026-09-10T10:00:00Z"), registerDepartureGuard } as React.ComponentProps<typeof DashHeader>;
  const ui = render(<DashHeader {...props} />);
  const lane = ui.container.querySelector(".dash-note-lane") as HTMLElement;
  const note = ui.container.querySelector(".dash-note") as HTMLElement;
  Object.defineProperty(lane, "clientWidth", { configurable: true, value: 760 });
  Object.defineProperty(note, "offsetWidth", { configurable: true, value: 360 });
  return {
    ...ui,
    note,
    input: () => ui.getByRole("textbox") as HTMLInputElement,
    edit: () => fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" })),
    save: () => fireEvent.click(ui.getByRole("button", { name: "Save dashboard note" })),
  };
}

export function guard() { return guards.at(-1) ?? null; }
export function changeNote(ui: ReturnType<typeof mount>, value: string) {
  ui.edit();
  fireEvent.change(ui.input(), { target: { value } });
}
export function beginMove(note: HTMLElement, pointerId = 7) {
  fireEvent.pointerDown(note, { button: 0, clientX: 200, pointerId });
}
export function move(note: HTMLElement, delta: number, pointerId = 7) {
  fireEvent.pointerMove(note, { clientX: 200 + delta, pointerId });
}
export function finishMove(note: HTMLElement, delta: number, pointerId = 7) {
  fireEvent.pointerUp(note, { clientX: 200 + delta, pointerId });
}
export function unload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}
export async function flush(rounds = 10) {
  await act(async () => { for (let index = 0; index < rounds; index += 1) await Promise.resolve(); });
}

export function captureDownload(onCreate?: () => void) {
  let blob: Blob | null = null;
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const revoke = vi.fn();
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn((next: Blob) => { blob = next; onCreate?.(); return "blob:header-sol"; }),
    revokeObjectURL: revoke,
  });
  return {
    click,
    revoke,
    read: async () => JSON.parse(await new Promise<string>((resolve, reject) => {
      if (!blob) throw new Error("No Header recovery Blob was created");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    })),
  };
}
