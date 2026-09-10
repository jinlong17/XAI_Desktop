import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";

import { DashHeader } from "../DashHeader.js";

let key = "";
const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;

function installImmediateLocks() {
  vi.stubGlobal("navigator", {
    locks: {
      request: async (_name: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) =>
        (typeof optionsOrRun === "function" ? optionsOrRun as () => Promise<unknown> : maybeRun!)(),
    },
  });
}

function mount() {
  const ui = render(<DashHeader lang="en" now={new Date("2026-09-09T10:00:00Z")} />);
  fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
  return {
    ...ui,
    input: () => ui.getByRole("textbox") as HTMLInputElement,
    save: () => fireEvent.click(ui.getByRole("button", { name: "Save dashboard note" })),
  };
}

beforeEach(() => {
  localStorage.clear();
  accountScope.activate(accountScope.lock("dash-async"), "g1");
  localStorage.setItem(generationMarkerKey("dash-async"), JSON.stringify({ generation: "g1", migrationId: "test", previous: null }));
  key = accountScope.physicalKey("xai_pref_dashboard_header_note");
  localStorage.setItem(key, "Original");
  installImmediateLocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DashHeader async note session", () => {
  it("keeps a newer draft open after an earlier pending operation completes", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    vi.stubGlobal("navigator", {
      locks: {
        request: async (_name: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) => {
          const run = typeof optionsOrRun === "function" ? optionsOrRun as () => Promise<unknown> : maybeRun!;
          await gate;
          return run();
        },
      },
    });
    const ui = mount();
    fireEvent.change(ui.input(), { target: { value: "First" } });
    ui.save();
    fireEvent.change(ui.input(), { target: { value: "Second" } });
    release();
    await waitFor(() => expect(localStorage.getItem(key)).toBe("First"));
    expect(ui.input().value).toBe("Second");
    fireEvent.keyDown(ui.input(), { key: "Enter" });
    await waitFor(() => {
      expect(localStorage.getItem(key)).toBe("Second");
      expect(ui.queryByRole("textbox")).toBeNull();
    });
  });

  it("retries an unchanged uncertain write through the hook token", async () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(function(this: Storage, storageKey: string) {
      if (storageKey === key && nativeGet.call(this, storageKey) === "Uncertain") return "Other bytes";
      return nativeGet.call(this, storageKey);
    });
    const ui = mount();
    fireEvent.change(ui.input(), { target: { value: "Uncertain" } });
    ui.save();
    await waitFor(() => expect(ui.getByRole("alert")).toBeTruthy());
    get.mockRestore();
    fireEvent.click(ui.getByText("Retry note save"));
    await waitFor(() => {
      expect(localStorage.getItem(key)).toBe("Uncertain");
      expect(ui.queryByRole("textbox")).toBeNull();
    });
  });

  it("refuses an external raw replacement before a local editor can overwrite it", async () => {
    const ui = mount();
    fireEvent.change(ui.input(), { target: { value: "Local" } });
    nativeSet.call(localStorage, key, "External");
    fireEvent.keyDown(ui.input(), { key: "Enter" });
    await waitFor(() => expect(ui.getByRole("alert")).toBeTruthy());
    expect(localStorage.getItem(key)).toBe("External");
    expect(ui.input().value).toBe("Local");
  });

  it("does not let Escape hide an active save", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    vi.stubGlobal("navigator", { locks: { request: async (_name: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) => {
      const run = typeof optionsOrRun === "function" ? optionsOrRun as () => Promise<unknown> : maybeRun!;
      await gate;
      return run();
    } } });
    const ui = mount();
    fireEvent.change(ui.input(), { target: { value: "Pending" } });
    ui.save();
    fireEvent.keyDown(ui.input(), { key: "Escape" });
    expect(ui.input().value).toBe("Pending");
    release();
    await waitFor(() => expect(localStorage.getItem(key)).toBe("Pending"));
  });
});
