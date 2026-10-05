/**
 * AC1..AC20 — the App-scoped Appearance controller (CP-APPEARANCE-01,
 * contract r3 A3–A7, §5–§8; test.md §A9).
 *
 * Real storage hook, engine, registry and codecs; jsdom gets the local
 * exclusive Web Lock fixture and attempt-logging Storage spies. The provider
 * cases mount one controller with `<AppearanceProvider>` and render the pane
 * and the Topbar status as its views, as App does.
 */
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { prefMutationLockName } from "@repo/plugin-web-storage";
import { AppearancePane } from "../AppearancePane.js";
import { AppearanceProvider, useAppearanceController } from "../internal/appearanceController.js";
import { AppearanceStatus } from "../internal/AppearanceStatus.js";
import type { AppearanceController } from "../types.js";
import { flushAppearance, installAppearanceLockFixture } from "./appearanceLockFixture.js";
import type { AppearanceLockFixture } from "./appearanceLockFixture.js";

const KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_accent_hue", "xai_bg_tone", "xai_rail_pos", "xai_pref_font_scale"] as const;
const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
type Attempt = { readonly op: "get" | "set" | "remove"; readonly key: string };
let log: Attempt[] = [];
let failSet = new Set<string>();
let denyAll = false;
let locks: AppearanceLockFixture;
const raw = (key: string) => nativeGet.call(localStorage, key);
const seed = (key: string, value: string) => nativeSet.call(localStorage, key, value);
const writes = (from: number) => log.slice(from).filter((item) => item.op !== "get").map((item) => `${item.op}:${item.key}`);

beforeEach(() => {
  log = [];
  failSet = new Set();
  denyAll = false;
  locks = installAppearanceLockFixture();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.style.cssText = "";
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) {
      log.push({ op: "get", key });
      if (denyAll) throw new Error("denied");
    }
    return nativeGet.call(this, key);
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
    if (this === localStorage) {
      log.push({ op: "set", key });
      if (denyAll || failSet.has(key)) throw new DOMException("quota", "QuotaExceededError");
    }
    return nativeSet.call(this, key, value);
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) {
      log.push({ op: "remove", key });
      if (denyAll) throw new Error("denied");
    }
    return nativeRemove.call(this, key);
  });
});

/** Mounts one controller and renders the pane, the Topbar status and a probe as its views. */
function Host({ children, onController }: { readonly children?: React.ReactNode; readonly onController?: (controller: AppearanceController) => void }) {
  const controller = useAppearanceController();
  onController?.(controller);
  return (
    <AppearanceProvider controller={controller}>
      <div data-testid="probe">{`${controller.values.lang}|${controller.values.theme}|${controller.values.density}`}</div>
      {children}
    </AppearanceProvider>
  );
}
const unload = () => {
  const from = log.length;
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return { warned: event.defaultPrevented, attempts: log.length - from };
};
const themeCard = (label: string) => screen.getAllByRole("button", { name: label }).find((element) => element.classList.contains("theme-card"))!;

// ---------------------------------------------------------------------------
// A3: one controller, two views; display values from stored bytes
// ---------------------------------------------------------------------------

describe("A3 the controller and its views", () => {
  it("AC1 a fresh mount displays and applies the stored values with zero writes (ruling 3)", async () => {
    seed("xai_pref_lang", '"zh"');
    seed("xai_pref_theme", '"dark"');
    seed("xai_pref_density", '"compact"');
    seed("xai_pref_font_scale", "1.1");
    seed("xai_accent_hue", "230");
    seed("xai_rail_pos", "right");
    seed("xai_bg_tone", "mist");
    const from = log.length;
    render(<Host><AppearancePane lang="zh" /></Host>);
    await flushAppearance();
    expect(writes(from)).toEqual([]);
    expect(themeCard("深色").classList.contains("active")).toBe(true);
    expect(screen.getByRole("button", { name: "紧凑" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("button", { name: "简体中文" }).getAttribute("aria-selected")).toBe("true");
    const root = document.documentElement;
    expect([root.getAttribute("data-theme"), root.getAttribute("data-density"), root.style.fontSize, root.style.getPropertyValue("--accent-hue"), root.getAttribute("data-bg-tone"), root.getAttribute("data-rail-pos")])
      .toEqual(["dark", "compact", "17.6px", "230", "mist", "right"]);
  });

  it("AC2 a pane edit is visible to every view of the same controller in the same frame, and vice versa", async () => {
    let controller: AppearanceController | null = null;
    render(<Host onController={(next) => { controller = next; }}><AppearancePane lang="en" /></Host>);
    await flushAppearance();
    fireEvent.click(themeCard("Dark"));
    expect(screen.getByTestId("probe").textContent).toBe("en|dark|comfortable");
    act(() => { controller!.setDensity("compact"); });
    expect(screen.getByRole("button", { name: "Compact" }).getAttribute("aria-selected")).toBe("true");
    await flushAppearance();
    expect([raw("xai_pref_theme"), raw("xai_pref_density")]).toEqual(['"dark"', '"compact"']);
  });

  it("AC3 the pane emits no web:settings:preference-changed and dispatches no StorageEvent", async () => {
    const dispatch = vi.spyOn(window, "dispatchEvent");
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    fireEvent.click(themeCard("Dark"));
    fireEvent.click(screen.getByRole("button", { name: "Ocean" }));
    await flushAppearance();
    expect(dispatch.mock.calls.filter(([event]) => event.type === "storage")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A6: strict domains — refuse, never repair, never throw
// ---------------------------------------------------------------------------

const MALFORMED: ReadonlyArray<readonly [string, string, string]> = [
  ["xai_pref_lang", '"fr"', "Language"], ["xai_pref_lang", "en", "Language"], ["xai_pref_lang", "", "Language"],
  ["xai_pref_lang", "null", "Language"], ["xai_pref_lang", "1", "Language"], ["xai_pref_lang", '"EN"', "Language"],
  ["xai_pref_theme", '"neon"', "Theme"], ["xai_pref_theme", "dark", "Theme"], ["xai_pref_theme", '"Dark"', "Theme"], ["xai_pref_theme", "123", "Theme"],
  ["xai_pref_density", '"cozy"', "Density"], ["xai_pref_density", "{}", "Density"], ["xai_pref_density", "compact", "Density"],
  ["xai_pref_font_scale", "0", "Font scale"], ["xai_pref_font_scale", "-1", "Font scale"], ["xai_pref_font_scale", "null", "Font scale"],
  ["xai_pref_font_scale", '"big"', "Font scale"], ["xai_pref_font_scale", "2", "Font scale"], ["xai_pref_font_scale", "0.5", "Font scale"], ["xai_pref_font_scale", '"1"', "Font scale"],
  ["xai_accent_hue", "abc", "Accent color"], ["xai_accent_hue", "Infinity", "Accent color"], ["xai_accent_hue", "-5", "Accent color"],
  ["xai_accent_hue", "361", "Accent color"], ["xai_accent_hue", "12.5", "Accent color"],
  ["xai_rail_pos", "diagonal", "Sidebar position"], ["xai_rail_pos", "Left", "Sidebar position"], ["xai_rail_pos", "", "Sidebar position"], ["xai_rail_pos", " left", "Sidebar position"],
  ["xai_bg_tone", "sage", "Background palette"], ["xai_bg_tone", "neon", "Background palette"], ["xai_bg_tone", "Mist", "Background palette"], ["xai_bg_tone", "", "Background palette"],
];

describe("A6 strict domains", () => {
  it.each(MALFORMED)("AC4 %s=%j at load: no throw, the default displayed and applied, a Reload-only source alert, zero writes, bytes kept", async (key, value, label) => {
    seed(key, value);
    const from = log.length;
    expect(() => render(<AppearancePane lang="en" />)).not.toThrow();
    await flushAppearance();
    expect(screen.getByText(`Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`)).toBeTruthy();
    expect(screen.getByRole("button", { name: `Reload ${label}` })).toBeTruthy();
    expect(screen.queryByRole("button", { name: `Retry ${label}` })).toBeNull();
    expect(screen.queryByRole("button", { name: `Discard ${label}` })).toBeNull();
    const root = document.documentElement;
    expect([root.getAttribute("data-theme"), root.getAttribute("data-density"), root.style.fontSize, root.style.getPropertyValue("--accent-hue"), root.getAttribute("data-bg-tone"), root.getAttribute("data-rail-pos")])
      .toEqual(["light", "comfortable", "16px", "165", null, "left"]);
    expect(unload().warned).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: `Reload ${label}` }));
    await flushAppearance();
    expect(writes(from)).toEqual([]);
    expect(raw(key)).toBe(value);
  });

  it("AC5 a throwing read is source-only too; Reload of repaired bytes clears the alert without a saved claim", async () => {
    seed("xai_pref_theme", '"dark"');
    denyAll = true;
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    denyAll = false;
    expect(screen.getByText("Saved Theme is unavailable. Reload it; this is not a new unsaved change.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reload Theme" }));
    await flushAppearance();
    expect(screen.queryByText("Saved Theme is unavailable. Reload it; this is not a new unsaved change.")).toBeNull();
    expect(themeCard("Dark").classList.contains("active")).toBe(true);
    expect(screen.getByTestId("appearance-status-line").textContent).toBe("");
  });

  it("AC6 the range bounds submit exact strict-domain bytes; each slider change is one edit and the final bytes equal the last value", async () => {
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    const font = screen.getByRole("slider", { name: "Font scale" });
    const accent = screen.getByRole("slider", { name: "Accent hue" });
    const held = await locks.hold(prefMutationLockName("xai_pref_font_scale"));
    for (const value of ["0.9", "1.15", "0.85"]) fireEvent.change(font, { target: { value } });
    fireEvent.change(accent, { target: { value: "360" } });
    await flushAppearance();
    expect(document.documentElement.style.fontSize).toBe("13.6px");
    await held.release();
    expect([raw("xai_pref_font_scale"), raw("xai_accent_hue")]).toEqual(["0.85", "360"]);
    expect(screen.getByTestId("appearance-status-line").textContent).toBe("Appearance settings saved.");
  });
});

// ---------------------------------------------------------------------------
// A5 / §7: Topbar status, unload, sign-out step
// ---------------------------------------------------------------------------

describe("A5 protection", () => {
  it("AC7 the Topbar status renders nothing while clean or only pending; a settled failure renders a named button that calls onReview exactly once", async () => {
    const onReview = vi.fn();
    render(<Host><AppearanceStatus onReview={onReview} /><AppearancePane lang="en" /></Host>);
    await flushAppearance();
    expect(screen.queryByTestId("appearance-status")).toBeNull();
    const held = await locks.hold(prefMutationLockName("xai_pref_theme"));
    fireEvent.click(themeCard("Dark"));
    await flushAppearance();
    expect(screen.queryByTestId("appearance-status")).toBeNull();
    failSet.add("xai_pref_theme");
    await held.release();
    const status = screen.getByRole("button", { name: "Appearance changes not saved. Review them in Settings." });
    expect(status.getAttribute("data-testid")).toBe("appearance-status");
    expect(status.textContent).toBe("Not saved");
    const from = log.length;
    fireEvent.click(status);
    expect(onReview).toHaveBeenCalledTimes(1);
    expect(log.slice(from)).toEqual([]);
    failSet.clear();
    fireEvent.click(screen.getByRole("button", { name: "Retry Theme" }));
    await flushAppearance();
    expect(screen.queryByTestId("appearance-status")).toBeNull();
  });

  it("AC8 the Topbar status in Chinese is named 外观更改未保存，前往设置查看。 with the visible text 未保存", async () => {
    seed("xai_pref_lang", '"zh"');
    render(<Host><AppearanceStatus onReview={() => undefined} /><AppearancePane lang="zh" /></Host>);
    await flushAppearance();
    failSet.add("xai_accent_hue");
    fireEvent.click(screen.getByRole("button", { name: "海洋" }));
    await flushAppearance();
    expect(screen.getByRole("button", { name: "外观更改未保存，前往设置查看。" }).textContent).toBe("未保存");
  });

  it("AC9 beforeunload warns while a draft exists (pending or failed) with zero storage attempts, and is removed afterwards", async () => {
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    expect(unload()).toEqual({ warned: false, attempts: 0 });
    const held = await locks.hold(prefMutationLockName("xai_pref_density"));
    fireEvent.click(screen.getByRole("button", { name: "Compact" }));
    await flushAppearance();
    expect(unload()).toEqual({ warned: true, attempts: 0 });
    await held.release();
    expect(unload()).toEqual({ warned: false, attempts: 0 });
    failSet.add("xai_pref_density");
    fireEvent.click(screen.getByRole("button", { name: "Comfortable" }));
    await flushAppearance();
    expect(unload()).toEqual({ warned: true, attempts: 0 });
  });

  it("AC10 the sign-out step: no drafts → true without a prompt or storage attempt; Cancel → false and everything kept; OK → drafts discarded with zero writes", async () => {
    const confirm = vi.spyOn(window, "confirm");
    let controller: AppearanceController | null = null;
    render(<Host onController={(next) => { controller = next; }}><AppearanceStatus onReview={() => undefined} /><AppearancePane lang="en" /></Host>);
    await flushAppearance();
    let from = log.length;
    await expect(controller!.confirmSignOut()).resolves.toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    expect(log.slice(from)).toEqual([]);
    failSet.add("xai_accent_hue");
    fireEvent.click(screen.getByRole("button", { name: "Ocean" }));
    await flushAppearance();
    confirm.mockReturnValue(false);
    let result = false;
    await act(async () => { result = await controller!.confirmSignOut(); });
    expect(result).toBe(false);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenLastCalledWith("Some appearance changes are not saved. Sign out and discard them?");
    expect(screen.getByText("Accent color was not saved.")).toBeTruthy();
    expect(screen.getByTestId("appearance-status")).toBeTruthy();
    expect(unload().warned).toBe(true);
    confirm.mockReturnValue(true);
    from = log.length;
    await act(async () => { result = await controller!.confirmSignOut(); });
    await flushAppearance();
    expect(result).toBe(true);
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(writes(from)).toEqual([]);
    expect(screen.queryByText("Accent color was not saved.")).toBeNull();
    expect(screen.queryByTestId("appearance-status")).toBeNull();
    expect(unload().warned).toBe(false);
  });

  it("AC11 the sign-out prompt follows the displayed language (ZH)", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    let controller: AppearanceController | null = null;
    render(<Host onController={(next) => { controller = next; }}><AppearancePane lang="en" /></Host>);
    await flushAppearance();
    failSet.add("xai_pref_lang");
    fireEvent.click(screen.getByRole("button", { name: "简体中文" }));
    await flushAppearance();
    expect(screen.getByTestId("probe").textContent).toBe("zh|light|comfortable");
    await act(async () => { await controller!.confirmSignOut(); });
    expect(confirm).toHaveBeenLastCalledWith("部分外观更改尚未保存。仍要退出并放弃这些更改吗？");
  });
});

// ---------------------------------------------------------------------------
// §5 item 8 recovery actions and keyboard continuity; §8 export
// ---------------------------------------------------------------------------

describe("recovery actions and export", () => {
  it("AC12 Discard rereads only its field with zero writes, returns display and document to the committed value and focuses the field's selected control", async () => {
    seed("xai_pref_theme", '"dark"');
    seed("xai_rail_pos", "top");
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    failSet.add("xai_pref_theme");
    fireEvent.click(themeCard("System"));
    await flushAppearance();
    const discard = screen.getByRole("button", { name: "Discard Theme" });
    act(() => { discard.focus(); });
    const from = log.length;
    fireEvent.click(discard);
    await flushAppearance();
    expect(writes(from)).toEqual([]);
    expect(log.slice(from).filter((item) => item.key !== "xai_pref_theme")).toEqual([]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.activeElement).toBe(themeCard("Dark"));
    expect(themeCard("Dark").classList.contains("active")).toBe(true);
  });

  it("AC13 Reload refuses to erase the same field's actual draft; a successful Retry returns focus from the unmounting block to the field's control", async () => {
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    failSet.add("xai_rail_pos");
    fireEvent.click(screen.getByRole("button", { name: "Right" }));
    await flushAppearance();
    expect(screen.queryByRole("button", { name: "Reload Sidebar position" })).toBeNull();
    failSet.clear();
    const retry = screen.getByRole("button", { name: "Retry Sidebar position" });
    act(() => { retry.focus(); });
    fireEvent.click(retry);
    await flushAppearance();
    expect(raw("xai_rail_pos")).toBe("right");
    expect(document.querySelector('[data-appearance-recovery="railPos"]')).toBeNull();
    const right = screen.getAllByRole("button", { name: "Right" }).find((element) => element.classList.contains("rail-pos-card"));
    expect(document.activeElement).toBe(right);
  });

  it("AC14 Export is memory-only (zero storage attempts under total denial) and uses the set/reset envelope; one URL created and revoked; the anchor removed", async () => {
    seed("xai_rail_pos", "top");
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    failSet.add("xai_pref_theme");
    fireEvent.click(themeCard("Dark"));
    await flushAppearance();
    const removeFault = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key: string) {
      if (this === localStorage) {
        log.push({ op: "remove", key });
        if (key === "xai_rail_pos") throw new Error("remove denied");
      }
      return nativeRemove.call(this, key);
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));
    await flushAppearance();
    removeFault.mockRestore();
    // The reset superseded the theme set; restore a sparse set + reset mix.
    fireEvent.click(themeCard("Dark"));
    await flushAppearance();
    const blobs: Blob[] = [];
    const created: string[] = [];
    const revoked: string[] = [];
    const clicks: string[] = [];
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: (blob: Blob) => { blobs.push(blob); created.push("blob:1"); return "blob:1"; } });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: (url: string) => { revoked.push(url); } });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { clicks.push(this.download); });
    try {
      denyAll = true;
      const from = log.length;
      fireEvent.click(screen.getByRole("button", { name: "Export Appearance draft" }));
      await flushAppearance(2);
      denyAll = false;
      expect(log.slice(from)).toEqual([]);
      expect(clicks).toEqual(["appearance-draft.json"]);
      expect(created).toEqual(["blob:1"]);
      expect(revoked).toEqual(["blob:1"]);
      expect(document.querySelectorAll("a[download]").length).toBe(0);
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blobs[0]!);
      });
      expect(JSON.parse(text)).toStrictEqual({ version: 1, kind: "appearance-draft", changes: { device: { theme: { operation: "set", value: "dark" }, railPos: { operation: "reset" } } } });
      expect(unload().warned).toBe(true);
    } finally {
      anchorClick.mockRestore();
      delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
      delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
    }
  });

  it("AC15 Reset never reads, writes or removes xai_pref_lang and keeps every other key byte-identical", async () => {
    seed("xai_pref_lang", '"zh"');
    seed("xai_pref_features_tasks", "false");
    seed("xai_pet_id", "pip");
    seed("xai_pref_theme", '"dark"');
    render(<AppearancePane lang="zh" />);
    await flushAppearance();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const from = log.length;
    fireEvent.click(screen.getByRole("button", { name: "恢复默认" }));
    await flushAppearance();
    expect(log.slice(from).filter((item) => item.key === "xai_pref_lang")).toEqual([]);
    expect(log.slice(from).filter((item) => !KEYS.includes(item.key as (typeof KEYS)[number]))).toEqual([]);
    expect([raw("xai_pref_lang"), raw("xai_pref_features_tasks"), raw("xai_pet_id"), raw("xai_pref_theme")]).toEqual(['"zh"', "false", "pip", null]);
    expect(screen.getByTestId("appearance-status-line").textContent).toBe("已恢复默认设置。");
  });

  it("AC16 a missing Web Lock capability refuses every write (never unfenced) with failed feedback", async () => {
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    locks.setMissing(true);
    fireEvent.click(themeCard("Dark"));
    await flushAppearance();
    expect(raw("xai_pref_theme")).toBeNull();
    expect(screen.getByText("Theme was not saved.")).toBeTruthy();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    locks.setMissing(false);
    fireEvent.click(screen.getByRole("button", { name: "Retry Theme" }));
    await flushAppearance();
    expect(raw("xai_pref_theme")).toBe('"dark"');
  });

  it("AC17 a success while no pane is mounted makes no success claim when a pane mounts later", async () => {
    let controller: AppearanceController | null = null;
    const view = render(<Host onController={(next) => { controller = next; }} />);
    await flushAppearance();
    act(() => { controller!.setTheme("dark"); });
    await flushAppearance();
    expect(raw("xai_pref_theme")).toBe('"dark"');
    view.rerender(<Host onController={(next) => { controller = next; }}><AppearancePane lang="en" /></Host>);
    await flushAppearance();
    expect(screen.getByTestId("appearance-status-line").textContent).toBe("");
  });
});
