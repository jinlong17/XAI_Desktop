import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import type { DashboardHeaderDepartureGuard } from "../types.js";
import { DashHeader } from "../DashHeader.js";

const nativeSet = Storage.prototype.setItem;
const nativeGet = Storage.prototype.getItem;
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

  it("keeps the already-registered guard current during the edit turn", async () => {
    const ui = mount();
    const registeredBeforeEdit = ui.guard();
    fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
    fireEvent.change(ui.getByRole("textbox"), { target: { value: "Route before blur" } });
    expect(registeredBeforeEdit.isCurrent()).toBe(true);
    expect(registeredBeforeEdit.isBlocking()).toBe(true);
  });

  it("does not turn a guarded departure dialog focus into an implicit blur save", async () => {
    let pending = false;
    const holder: { current: DashboardHeaderDepartureGuard | null } = { current: null };
    const ui = render(<DashHeader lang="en" now={new Date()} isDeparturePending={() => pending} registerDepartureGuard={next => { holder.current = next; return () => undefined; }} />);
    fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
    const input = ui.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Held for departure" } });
    pending = true;
    fireEvent.blur(input);
    await new Promise(resolve => window.setTimeout(resolve, 0));
    expect(localStorage.getItem(noteKey)).toBe("Saved A");
    const currentGuard = holder.current;
    if (!currentGuard) throw new Error("Header guard was not registered");
    expect(currentGuard.isBlocking()).toBe(true);
  });

  it("persists an ordinary Tab-style blur after the current turn", async () => {
    const ui = mount();
    fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
    const input = ui.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Ordinary blur saved note" } });
    fireEvent.blur(input, { relatedTarget: ui.getByRole("button", { name: "Save dashboard note" }) });
    await waitFor(() => expect(localStorage.getItem(noteKey)).toBe("Ordinary blur saved note"));
  });

  it("keeps a moved position whose caller raw preflight rejects as a real draft", async () => {
    const ui = mount();
    const lane = ui.container.querySelector(".dash-note-lane")!;
    const note = ui.container.querySelector(".dash-note")!;
    Object.defineProperty(lane, "clientWidth", { value: 760 });
    Object.defineProperty(note, "offsetWidth", { value: 360 });
    fireEvent.pointerDown(note, { button: 0, pointerId: 9, clientX: 100 });
    fireEvent.pointerMove(note, { pointerId: 9, clientX: 160 });
    nativeSet.call(localStorage, "xai_pref_dashboard_header_note_x", "95");
    fireEvent.pointerUp(note, { pointerId: 9, clientX: 160 });
    await waitFor(() => expect(ui.guard().isBlocking()).toBe(true));
    expect(note.getAttribute("style")).toContain("60px");
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    ui.guard().discardDraft();
    await waitFor(() => expect(ui.guard().isBlocking()).toBe(false));
    expect(localStorage.getItem("xai_pref_dashboard_header_note_x")).toBe("95");
  });

  it("does not make an unavailable position source dirty on an unmoved press", async () => {
    const offsetKey = "xai_pref_dashboard_header_note_x";
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function(this: Storage, key: string) {
      if (key === offsetKey) throw new Error("denied");
      return nativeGet.call(this, key);
    });
    const ui = mount();
    const note = ui.container.querySelector(".dash-note")!;
    fireEvent.pointerDown(note, { button: 0, pointerId: 10, clientX: 100 });
    fireEvent.pointerUp(note, { pointerId: 10, clientX: 100 });
    expect(ui.guard().isBlocking()).toBe(false);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("holds a navigation-pointer blur across a slow click until the host reserves departure", async () => {
    let pending = false;
    const holder: { current: DashboardHeaderDepartureGuard | null } = { current: null };
    const ui = render(<DashHeader
      lang="en"
      now={new Date()}
      isDeparturePending={() => pending}
      isDepartureTarget={target => target instanceof Element && target.classList.contains("mc-jump")}
      registerDepartureGuard={next => { holder.current = next; return () => undefined; }}
    />);
    fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
    const input = ui.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Slow navigation draft" } });
    const navigationButton = document.createElement("button");
    navigationButton.className = "mc-jump";
    document.body.appendChild(navigationButton);
    fireEvent.pointerDown(navigationButton, { pointerId: 14 });
    fireEvent.blur(input);
    await new Promise(resolve => window.setTimeout(resolve, 5));
    expect(localStorage.getItem(noteKey)).toBe("Saved A");
    pending = true;
    fireEvent.pointerUp(navigationButton, { pointerId: 14 });
    await new Promise(resolve => window.setTimeout(resolve, 0));
    expect(localStorage.getItem(noteKey)).toBe("Saved A");
    expect(holder.current?.isBlocking()).toBe(true);
    navigationButton.remove();
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
