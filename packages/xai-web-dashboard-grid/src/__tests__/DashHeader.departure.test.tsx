import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import type { DashboardHeaderDepartureGuard } from "../types.js";
import { DashHeader } from "../DashHeader.js";

const nativeSet = Storage.prototype.setItem;
let noteKey = "";

function activate(owner: string, generation: string) {
  accountScope.activate(accountScope.lock(owner), generation);
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "test", previous: null }));
  return accountScope.physicalKey("xai_pref_dashboard_header_note");
}

beforeEach(() => {
  localStorage.clear();
  noteKey = activate("header-A", "one");
  nativeSet.call(localStorage, noteKey, "Saved A");
  nativeSet.call(localStorage, "xai_pref_dashboard_header_note_x", "0");
  vi.stubGlobal("navigator", { locks: { request: async (_key: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) => (typeof optionsOrRun === "function" ? optionsOrRun as () => Promise<unknown> : maybeRun!)() } });
});

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function mount() {
  let guard: DashboardHeaderDepartureGuard | null = null;
  const ui = render(<DashHeader lang="en" now={new Date()} registerDepartureGuard={next => { guard = next; return () => undefined; }} />);
  return { ...ui, guard: () => guard as DashboardHeaderDepartureGuard };
}

describe("DashHeader departure capability", () => {
  it("does not treat an invalid device source as a host draft or unload warning", async () => {
    nativeSet.call(localStorage, "xai_pref_dashboard_header_note_x", "null");
    const ui = mount();
    await waitFor(() => expect(ui.getByText("Reload note position")).toBeTruthy());
    expect(ui.guard().isBlocking()).toBe(false);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("keeps a real editor draft guarded, discards only that field, and rereads it", async () => {
    const ui = mount();
    fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
    fireEvent.change(ui.getByRole("textbox"), { target: { value: "Unsaved current note" } });
    await waitFor(() => expect(ui.guard().isBlocking()).toBe(true));
    const writes = vi.spyOn(Storage.prototype, "setItem");
    ui.guard().discardDraft();
    await waitFor(() => expect(ui.guard().isBlocking()).toBe(false));
    expect(writes.mock.calls.filter(([key]) => key === noteKey)).toEqual([]);
    expect(ui.queryByRole("textbox")).toBeNull();
  });

  it("rejects a captured A capability after account B becomes current", async () => {
    const ui = mount();
    fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
    fireEvent.change(ui.getByRole("textbox"), { target: { value: "A draft" } });
    await waitFor(() => expect(ui.guard().isBlocking()).toBe(true));
    const old = ui.guard();
    act(() => { const key = activate("header-B", "two"); nativeSet.call(localStorage, key, "Saved B"); });
    await waitFor(() => expect(old.isCurrent()).toBe(false));
    expect(old.isBlocking()).toBe(false);
    old.discardDraft();
    expect(localStorage.getItem(noteKey)).toBe("Saved A");
  });

  it("does not capture a pointer until movement, so a normal pointer click opens the editor", () => {
    const ui = mount();
    const button = ui.getByRole("button", { name: "Edit dashboard note" });
    fireEvent.pointerDown(button, { button: 0, pointerId: 1, clientX: 50 });
    fireEvent.pointerUp(button, { button: 0, pointerId: 1, clientX: 50 });
    fireEvent.click(button);
    expect(ui.getByRole("textbox")).toBeTruthy();
  });
});
