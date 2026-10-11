/**
 * RA1..RA26 — Retry all at the hook layer (CP-APPEARANCE-01, contract r3
 * A2.1–A2.7, §5 item 9; test.md §A8).
 *
 * Real storage hook, engine, registry and codecs; jsdom gets the local
 * exclusive Web Lock fixture and attempt-logging Storage spies. The pane runs
 * standalone (it owns its controller). jsdom cannot synthesize the browser's
 * Enter/Space → click activation of a native button, so keyboard activation is
 * modelled as focus + click; the frozen Sol `retry-all` oracle and the native
 * E15/E26 evidence remain the acceptance matrix — these complement them.
 */
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { prefMutationLockName } from "@repo/plugin-web-storage";
import { AppearancePane } from "../AppearancePane.js";
import { flushAppearance, installAppearanceLockFixture } from "./appearanceLockFixture.js";
import type { AppearanceLockFixture } from "./appearanceLockFixture.js";

const KEY = {
  lang: "xai_pref_lang",
  theme: "xai_pref_theme",
  density: "xai_pref_density",
  accentHue: "xai_accent_hue",
  bgTone: "xai_bg_tone",
  railPos: "xai_rail_pos",
  fontScale: "xai_pref_font_scale",
} as const;
const ALL_KEYS: readonly string[] = Object.values(KEY);
const lockOf = (key: string) => prefMutationLockName(key);

const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
type Attempt = { readonly op: "get" | "set" | "remove"; readonly key: string; readonly value?: string; threw: boolean };
let log: Attempt[] = [];
/** Keys (or `key=value`) whose setItem throws QuotaExceededError. */
let failSet = new Set<string>();
/** Keys whose removeItem throws. */
let failRemove = new Set<string>();
/** Keys whose next getItem after a write throws once (readback uncertainty). */
let failReadOnce = new Set<string>();
let locks: AppearanceLockFixture;

const raw = (key: string) => nativeGet.call(localStorage, key);
const seed = (key: string, value: string) => nativeSet.call(localStorage, key, value);
/** set/remove attempts since `from`, e.g. `set:xai_accent_hue=230` (`!` when it threw). */
const writes = (from: number) => log.slice(from).filter((item) => item.op !== "get")
  .map((item) => (item.op === "set" ? `set:${item.key}=${item.value}` : `remove:${item.key}`) + (item.threw ? "!" : ""));

beforeEach(() => {
  log = [];
  failSet = new Set();
  failRemove = new Set();
  failReadOnce = new Set();
  locks = installAppearanceLockFixture();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.style.cssText = "";
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) {
      const attempt: Attempt = { op: "get", key, threw: false };
      log.push(attempt);
      if (failReadOnce.has(key) && log.some((item) => item.op === "set" && item.key === key && !item.threw)) {
        failReadOnce.delete(key);
        attempt.threw = true;
        throw new Error("read denied once");
      }
    }
    return nativeGet.call(this, key);
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
    if (this === localStorage) {
      const attempt: Attempt = { op: "set", key, value, threw: false };
      log.push(attempt);
      if (failSet.has(key) || failSet.has(`${key}=${value}`)) {
        attempt.threw = true;
        throw new DOMException("quota", "QuotaExceededError");
      }
    }
    return nativeSet.call(this, key, value);
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) {
      const attempt: Attempt = { op: "remove", key, threw: false };
      log.push(attempt);
      if (failRemove.has(key)) {
        attempt.threw = true;
        throw new Error("remove denied");
      }
    }
    return nativeRemove.call(this, key);
  });
});

async function mount(lang: "en" | "zh" = "en") {
  const view = render(<AppearancePane lang={lang} />);
  await flushAppearance();
  return view;
}
const retryAll = () => screen.getByTestId("appearance-retry-all");
const statusLine = () => screen.getByTestId("appearance-status-line");
const line = () => statusLine().textContent ?? "";
const isDisabled = (button: HTMLElement) => button.getAttribute("aria-disabled") === "true" && !button.hasAttribute("disabled");
const isEnabled = (button: HTMLElement) => button.getAttribute("aria-disabled") === null && !button.hasAttribute("disabled");
const describedByLine = (button: HTMLElement) => {
  const id = statusLine().id;
  return id !== "" && (button.getAttribute("aria-describedby") ?? "").split(/\s+/).includes(id);
};
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const themeCard = (label: string) => screen.getAllByRole("button", { name: label }).find((element) => element.classList.contains("theme-card"))!;
const fontSlider = () => screen.getByRole("slider", { name: "Font scale" });
const accentSlider = () => screen.getByRole("slider", { name: "Accent hue" });
/** A field write that fails and stays failed (the fault is lifted afterwards when asked). */
async function failEdit(key: string, act: () => void, lift = true): Promise<void> {
  failSet.add(key);
  act();
  await flushAppearance();
  if (lift) failSet.delete(key);
}
const focusables = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>("button, input, select, textarea, [tabindex]"))
  .filter((element) => !(element as HTMLButtonElement).disabled && element.tabIndex >= 0 && element.closest("[inert]") === null && !element.hidden);

// ---------------------------------------------------------------------------
// A2.1 / A2.2 render, enabled and disabled states
// ---------------------------------------------------------------------------

describe("A2.2 render and enabled state", () => {
  it("RA1 clean: rendered with aria-disabled=\"true\" (never disabled), no description, a Tab stop between the font slider and Reset; activation is inert", async () => {
    const { container } = await mount();
    const button = retryAll();
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.textContent).toBe("Retry all");
    expect(isDisabled(button)).toBe(true);
    expect(button.getAttribute("aria-describedby")).toBeNull();
    expect(button.hasAttribute("title")).toBe(false);
    expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    const order = focusables(container as HTMLElement);
    const reset = screen.getByRole("button", { name: "Reset to defaults" });
    expect(order.indexOf(button)).toBe(order.indexOf(fontSlider()) + 1);
    expect(order.indexOf(reset)).toBe(order.indexOf(button) + 1);
    act(() => { button.focus(); });
    expect(document.activeElement).toBe(button);
    const from = log.length;
    const lockFrom = locks.requests.length;
    fireEvent.click(button);
    fireEvent.click(button);
    await flushAppearance();
    expect(log.slice(from)).toEqual([]);
    expect(locks.requests.length).toBe(lockFrom);
    expect(document.activeElement).toBe(button);
    expect(line()).toBe("");
    expect(isDisabled(button)).toBe(true);
  });

  it("RA2 pending only (write held behind the real per-key lock): disabled, not described, inert", async () => {
    await mount();
    const held = await locks.hold(lockOf(KEY.theme));
    fireEvent.click(themeCard("Dark"));
    await flushAppearance();
    expect(screen.getByText("Theme is saving.")).toBeTruthy();
    const button = retryAll();
    expect(isDisabled(button)).toBe(true);
    expect(button.getAttribute("aria-describedby")).toBeNull();
    const lockFrom = locks.requests.length;
    const from = log.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(writes(from)).toEqual([]);
    expect(locks.requests.length).toBe(lockFrom);
    expect(line()).toBe("");
    await held.release();
    expect(raw(KEY.theme)).toBe('"dark"');
    expect(isDisabled(button)).toBe(true);
  });

  it("RA3 source only (malformed bytes): disabled and inert; nothing is rewritten", async () => {
    seed(KEY.railPos, "diagonal");
    await mount();
    expect(screen.getByRole("button", { name: "Reload Sidebar position" })).toBeTruthy();
    const button = retryAll();
    expect(isDisabled(button)).toBe(true);
    const from = log.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(log.slice(from)).toEqual([]);
    expect(raw(KEY.railPos)).toBe("diagonal");
    expect(line()).toBe("");
  });

  it("RA4 one failed field: enabled (no aria-disabled), described by the count line", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const button = retryAll();
    expect(isEnabled(button)).toBe(true);
    expect(describedByLine(button)).toBe(true);
    expect(line()).toBe("1 appearance change is not saved.");
  });

  it("RA5 ZH: label 全部重试 in every state and the ZH count line for one and two fields", async () => {
    seed(KEY.lang, '"zh"');
    await mount("zh");
    expect(retryAll().textContent).toBe("全部重试");
    await failEdit(KEY.accentHue, () => click("海洋"));
    expect(line()).toBe("1 项外观更改未保存。");
    await failEdit(KEY.railPos, () => click("右侧"));
    expect(line()).toBe("2 项外观更改未保存。");
    expect(retryAll().textContent).toBe("全部重试");
  });

  it("RA6 an open pass with E empty: disabled, described by the in-flight line, inert; it settles to disabled with no description", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const held = await locks.hold(lockOf(KEY.accentHue));
    const button = retryAll();
    const from = log.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(line()).toBe("Retrying unsaved appearance changes…");
    expect(isDisabled(button)).toBe(true);
    expect(describedByLine(button)).toBe(true);
    fireEvent.click(button);
    await flushAppearance();
    await held.release();
    expect(writes(from)).toEqual(["set:xai_accent_hue=230"]);
    expect(isDisabled(button)).toBe(true);
    expect(button.getAttribute("aria-describedby")).toBeNull();
    expect(line()).toBe("Appearance settings saved.");
  });

  it("RA7 an open pass plus a newly failed field: enabled again; the second activation retries only that field", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const held = await locks.hold(lockOf(KEY.accentHue));
    fireEvent.click(retryAll());
    await flushAppearance();
    await failEdit(KEY.railPos, () => click("Right"));
    const button = retryAll();
    expect(isEnabled(button)).toBe(true);
    expect(line()).toBe("Retrying unsaved appearance changes…");
    const from = log.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_rail_pos=right"]);
    await held.release();
    expect(writes(from)).toEqual(["set:xai_rail_pos=right", "set:xai_accent_hue=230"]);
    expect(line()).toBe("Appearance settings saved.");
  });
});

// ---------------------------------------------------------------------------
// A2.3 scope, exclusions, exactly one attempt per member, no duplicates
// ---------------------------------------------------------------------------

describe("A2.3 scope and attempts", () => {
  it("RA8 set drafts: exactly one write per member in display order and none elsewhere", async () => {
    await mount();
    await failEdit(KEY.railPos, () => click("Right"));
    await failEdit(KEY.accentHue, () => click("Ocean"));
    await failEdit(KEY.theme, () => fireEvent.click(themeCard("Dark")));
    expect(line()).toBe("3 appearance changes are not saved.");
    const from = log.length;
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual(['set:xai_pref_theme="dark"', "set:xai_accent_hue=230", "set:xai_rail_pos=right"]);
    expect(line()).toBe("Appearance settings saved.");
  });

  it("RA9 a background choice with both writes failing is two members; with only the tone failing it is one", async () => {
    await mount();
    failSet.add(KEY.bgTone);
    failSet.add(KEY.accentHue);
    click("Mist");
    await flushAppearance();
    failSet.clear();
    let from = log.length;
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_accent_hue=230", "set:xai_bg_tone=mist"]);
    await failEdit(KEY.bgTone, () => click("Peach"));
    expect(raw(KEY.accentHue)).toBe("35");
    from = log.length;
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_bg_tone=peach"]);
  });

  it("RA10 failed Reset items: one removal each, never a write; a reset-only pass ends with 'Defaults restored.'", async () => {
    seed(KEY.railPos, "top");
    seed(KEY.accentHue, "230");
    await mount();
    failRemove.add(KEY.railPos);
    failRemove.add(KEY.accentHue);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    click("Reset to defaults");
    await flushAppearance();
    expect(screen.getByText("Sidebar position was not reset to its default.")).toBeTruthy();
    expect(line()).toBe("2 appearance changes are not saved.");
    failRemove.clear();
    const from = log.length;
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual(["remove:xai_accent_hue", "remove:xai_rail_pos"]);
    expect(line()).toBe("Defaults restored.");
  });

  it("RA11 a valid edit over malformed bytes is refused again and kept; a conflict is kept and never overwritten", async () => {
    seed(KEY.railPos, "diagonal");
    seed(KEY.theme, '"dark"');
    await mount();
    click("Right");
    const held = await locks.hold(lockOf(KEY.theme));
    fireEvent.click(themeCard("System"));
    await flushAppearance();
    seed(KEY.theme, '"light"');
    await held.release();
    expect(line()).toBe("2 appearance changes are not saved.");
    const from = log.length;
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual([]);
    expect(raw(KEY.railPos)).toBe("diagonal");
    expect(raw(KEY.theme)).toBe('"light"');
    expect(isEnabled(retryAll())).toBe(true);
    expect(line()).toBe("2 appearance changes are not saved.");
  });

  it("RA12 an uncertain write reconciles with exactly one total write", async () => {
    await mount();
    const from = log.length;
    failReadOnce.add(KEY.accentHue);
    click("Ocean");
    await flushAppearance();
    expect(screen.getByText("Accent color was not saved.")).toBeTruthy();
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_accent_hue=230"]);
    expect(line()).toBe("Appearance settings saved.");
  });

  it("RA13 a failed predecessor with a queued latest: the predecessor once, then the latest's own attempt", async () => {
    await mount();
    const held = await locks.hold(lockOf(KEY.accentHue));
    failSet.add(`${KEY.accentHue}=230`);
    click("Ocean");
    click("Violet");
    await flushAppearance();
    await held.release();
    expect(raw(KEY.accentHue)).toBeNull();
    expect(line()).toBe("1 appearance change is not saved.");
    failSet.clear();
    const from = log.length;
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_accent_hue=230", "set:xai_accent_hue=295"]);
    expect(raw(KEY.accentHue)).toBe("295");
    expect(Number((accentSlider() as HTMLInputElement).value)).toBe(295);
  });

  it("RA14 exclusions: pending, source-only and draft-free fields get zero attempts", async () => {
    seed(KEY.railPos, "diagonal");
    await mount();
    click("Compact");
    await flushAppearance();
    expect(raw(KEY.density)).toBe('"compact"');
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const held = await locks.hold(lockOf(KEY.theme));
    fireEvent.click(themeCard("Dark"));
    await flushAppearance();
    const from = log.length;
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_accent_hue=230"]);
    await held.release();
    expect(writes(from)).toEqual(["set:xai_accent_hue=230", 'set:xai_pref_theme="dark"']);
    expect(raw(KEY.railPos)).toBe("diagonal");
  });

  it("RA15 no duplicates: a same-turn double activation, an activation while pending and a per-field Retry during a pass add zero attempts", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    await failEdit(KEY.railPos, () => click("Right"));
    const heldAccent = await locks.hold(lockOf(KEY.accentHue));
    const button = retryAll();
    const from = log.length;
    act(() => { button.click(); button.click(); });
    await flushAppearance();
    fireEvent.click(button);
    click("Retry Accent color");
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_rail_pos=right"]);
    await heldAccent.release();
    expect(writes(from)).toEqual(["set:xai_rail_pos=right", "set:xai_accent_hue=230"]);
  });

  it("RA16 a Retry all during a pending per-field Retry skips that field", async () => {
    await mount();
    await failEdit(KEY.theme, () => fireEvent.click(themeCard("Dark")));
    const held = await locks.hold(lockOf(KEY.theme));
    const from = log.length;
    click("Retry Theme");
    await flushAppearance();
    expect(isDisabled(retryAll())).toBe(true);
    fireEvent.click(retryAll());
    await flushAppearance();
    await held.release();
    expect(writes(from)).toEqual(['set:xai_pref_theme="dark"']);
  });
});

// ---------------------------------------------------------------------------
// A2.3 attribution and late completions
// ---------------------------------------------------------------------------

describe("A2.3 attribution and late completions", () => {
  it("RA17 a pane edit supersedes a held member; the old completion never makes the newer choice look saved", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const held = await locks.hold(lockOf(KEY.accentHue));
    fireEvent.click(retryAll());
    await flushAppearance();
    click("Violet");
    await flushAppearance();
    expect(line()).not.toBe("Retrying unsaved appearance changes…");
    const secondHold = locks.hold(lockOf(KEY.accentHue));
    await held.release();
    const blocker = await secondHold;
    expect(Number((accentSlider() as HTMLInputElement).value)).toBe(295);
    expect(screen.getByText("Accent color is saving.")).toBeTruthy();
    expect(screen.queryByText("Appearance settings saved.")).toBeNull();
    await blocker.release();
    expect(raw(KEY.accentHue)).toBe("295");
    expect(line()).toBe("Appearance settings saved.");
  });

  it("RA18 Discard during an open pass detaches the member: its late completion never writes and no success is claimed", async () => {
    seed(KEY.accentHue, "75");
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const held = await locks.hold(lockOf(KEY.accentHue));
    fireEvent.click(retryAll());
    await flushAppearance();
    click("Discard Accent color");
    await flushAppearance();
    const from = log.length;
    await held.release();
    expect(writes(from)).toEqual([]);
    expect(Number((accentSlider() as HTMLInputElement).value)).toBe(75);
    expect(line()).toBe("");
  });

  it("RA19 Discard all during an open pass closes it, focus goes to Reset, late completions write nothing", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    await failEdit(KEY.railPos, () => click("Right"));
    const heldAccent = await locks.hold(lockOf(KEY.accentHue));
    const heldRail = await locks.hold(lockOf(KEY.railPos));
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(line()).toBe("Retrying unsaved appearance changes…");
    click("Discard all changes");
    await flushAppearance();
    expect(line()).toBe("");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Reset to defaults" }));
    const from = log.length;
    await heldAccent.release();
    await heldRail.release();
    expect(writes(from)).toEqual([]);
  });

  it("RA20 unmount during an open pass detaches the members: the late completion writes nothing", async () => {
    const view = await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const held = await locks.hold(lockOf(KEY.accentHue));
    fireEvent.click(retryAll());
    await flushAppearance();
    view.unmount();
    const from = log.length;
    await held.release();
    expect(writes(from)).toEqual([]);
    expect(raw(KEY.accentHue)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// A2.4 feedback and its precedence; A2.5 focus
// ---------------------------------------------------------------------------

describe("A2.4 feedback and A2.5 focus", () => {
  it("RA21 rule 1 wins while a pass is open even when a member already failed again; then rule 3", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    await failEdit(KEY.railPos, () => click("Right"), false);
    const held = await locks.hold(lockOf(KEY.accentHue));
    const button = retryAll();
    fireEvent.click(button);
    await flushAppearance();
    expect(line()).toBe("Retrying unsaved appearance changes…");
    expect(isEnabled(button)).toBe(true);
    expect(describedByLine(button)).toBe(true);
    await held.release();
    expect(line()).toBe("1 appearance change is not saved.");
  });

  it("RA22 ZH lines: in flight 正在重试未保存的外观更改…, then 外观设置已保存。", async () => {
    seed(KEY.lang, '"zh"');
    await mount("zh");
    await failEdit(KEY.accentHue, () => click("海洋"));
    const held = await locks.hold(lockOf(KEY.accentHue));
    fireEvent.click(retryAll());
    await flushAppearance();
    expect(line()).toBe("正在重试未保存的外观更改…");
    await held.release();
    expect(line()).toBe("外观设置已保存。");
  });

  it("RA23 rule 2: a failed Export while a draft exists shows the export line; the next pane action clears it; never shown once clean", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"), false);
    const createObjectURL = vi.fn(() => { throw new Error("url setup"); });
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectURL });
    try {
      click("Export Appearance draft");
      await flushAppearance();
      expect(line()).toBe("Export failed. Please retry.");
      fireEvent.click(retryAll());
      await flushAppearance();
      expect(line()).toBe("1 appearance change is not saved.");
      click("Export Appearance draft");
      await flushAppearance();
      expect(line()).toBe("Export failed. Please retry.");
      click("Discard all changes");
      await flushAppearance();
      expect(line()).toBe("");
      expect(isDisabled(retryAll())).toBe(true);
    } finally {
      delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
      delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
    }
  });

  it("RA24 focus stays on Retry all when a full-success pass disables it (never <body>, never Reset)", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    const button = retryAll();
    act(() => { button.focus(); });
    fireEvent.click(button);
    await flushAppearance();
    expect(raw(KEY.accentHue)).toBe("230");
    expect(isDisabled(button)).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(retryAll()).toBe(button);
    expect(line()).toBe("Appearance settings saved.");
  });

  it("RA25 a partial result keeps focus on the enabled button, described by the count line", async () => {
    await mount();
    await failEdit(KEY.accentHue, () => click("Ocean"));
    await failEdit(KEY.railPos, () => click("Right"), false);
    const button = retryAll();
    act(() => { button.focus(); });
    const from = log.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(writes(from)).toEqual(["set:xai_accent_hue=230", "set:xai_rail_pos=right!"]);
    expect(isEnabled(button)).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(describedByLine(button)).toBe(true);
    expect(line()).toBe("1 appearance change is not saved.");
  });

  it("RA26 a member held behind the lock fails on release: the disabled button becomes enabled, focus stays, the count line describes it", async () => {
    await mount();
    await failEdit(KEY.theme, () => fireEvent.click(themeCard("Dark")), false);
    const held = await locks.hold(lockOf(KEY.theme));
    const button = retryAll();
    act(() => { button.focus(); });
    fireEvent.click(button);
    await flushAppearance();
    expect(isDisabled(button)).toBe(true);
    expect(document.activeElement).toBe(button);
    await held.release();
    expect(isEnabled(button)).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(describedByLine(button)).toBe(true);
    expect(line()).toBe("1 appearance change is not saved.");
  });
});

// Every key named above is one of the seven Appearance keys (no other key is ever written).
it("RA27 no Retry all activation writes any key outside the seven Appearance keys", async () => {
  await mount();
  await failEdit(KEY.accentHue, () => click("Ocean"));
  await failEdit(KEY.fontScale, () => fireEvent.change(fontSlider(), { target: { value: "1.1" } }));
  const from = log.length;
  fireEvent.click(retryAll());
  await flushAppearance();
  expect(log.slice(from).filter((item) => item.op !== "get" && !ALL_KEYS.includes(item.key))).toEqual([]);
  expect(writes(from)).toEqual(["set:xai_accent_hue=230", "set:xai_pref_font_scale=1.1"]);
});
