/**
 * FR1..FR20 — Settings → Features recovery caller (test.md §A3b).
 *
 * Real storage hook, engine, registry and accountScope; jsdom gets the local
 * exclusive Web Lock fixture and attempt-logging Storage spies. The frozen
 * Sol, host, native and F1 oracles under docs/reviews/web-features-recovery-*
 * remain the acceptance matrix; these are the package's own regression tests.
 */
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { PaneDepartureGuard } from "@repo/plugin-web-settings-shell";
import { accountScope, generationMarkerKey, prefMutationLockName, usePref } from "@repo/plugin-web-storage";
import { featuresPane } from "../internal/featuresPane.js";
import { featureIdOrder } from "../featureIds.js";
import { useFeaturePrefs } from "../useFeaturePrefs.js";
import type { FeatureId } from "../featureIds.js";
import { flushFeatures, installFeaturesLockFixture } from "./featuresLockFixture.js";
import type { FeaturesLockFixture } from "./featuresLockFixture.js";

const LABEL: Record<FeatureId, string> = {
  tasks: "Tasks", board: "Boards", dashboard: "Dashboard", calendar: "Calendar",
  matrix: "Matrix", pomodoro: "Pomodoro", habits: "Habits", meditation: "Meditation",
};
const keyOf = (id: FeatureId) => `xai_pref_features_${id}`;
const KEYS = featureIdOrder.map(keyOf);
const CONFIRM_EN = "Turn all 8 modules back on? This only changes which modules are shown; your data is kept.";
const CONFIRM_ZH = "将全部 8 个模块恢复为开启？这只改变显示哪些模块，数据会保留。";

const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
type Attempt = { readonly op: "get" | "set" | "remove"; readonly key: string; readonly value?: string };
let attempts: Attempt[] = [];
let failSet = new Set<string>();
let failRemove = new Set<string>();
let failGet = new Set<string>();
/** Keys whose next read (after a write or removal) throws once. */
let failReadOnce = new Set<string>();
let denyAll = false;
let locks: FeaturesLockFixture;
let confirmCalls: string[] = [];
let confirmAnswer = true;
let storageEvents: Array<string | null> = [];
let restoreDownloads: (() => void) | null = null;

const raw = (id: FeatureId) => nativeGet.call(localStorage, keyOf(id));
const seed = (id: FeatureId, value: string) => nativeSet.call(localStorage, keyOf(id), value);
const writes = (from = 0) => attempts.slice(from).filter((item) => item.op !== "get" && KEYS.includes(item.key));
const touchesOther = (from: number, id: FeatureId) => attempts.slice(from).filter((item) => KEYS.includes(item.key) && item.key !== keyOf(id));

beforeEach(() => {
  attempts = [];
  failSet = new Set();
  failRemove = new Set();
  failGet = new Set();
  failReadOnce = new Set();
  denyAll = false;
  confirmCalls = [];
  confirmAnswer = true;
  storageEvents = [];
  locks = installFeaturesLockFixture();
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) {
      attempts.push({ op: "get", key });
      if (denyAll || failGet.has(key)) throw new Error("read denied");
      if (failReadOnce.delete(key)) throw new Error("read denied once");
    }
    return nativeGet.call(this, key);
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
    if (this === localStorage) {
      attempts.push({ op: "set", key, value });
      if (denyAll || failSet.has(key) || failSet.has(`${key}=${value}`)) throw new DOMException("quota", "QuotaExceededError");
    }
    return nativeSet.call(this, key, value);
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) {
      attempts.push({ op: "remove", key });
      if (denyAll || failRemove.has(key)) throw new Error("remove denied");
    }
    return nativeRemove.call(this, key);
  });
  vi.spyOn(window, "confirm").mockImplementation((message?: string) => {
    confirmCalls.push(String(message));
    return confirmAnswer;
  });
  const dispatch = window.dispatchEvent.bind(window);
  vi.spyOn(window, "dispatchEvent").mockImplementation((event: Event) => {
    if (event.type === "storage") storageEvents.push((event as StorageEvent).key);
    return dispatch(event);
  });
});
afterEach(() => {
  restoreDownloads?.();
  restoreDownloads = null;
});

// ---- Host guard registry (mirrors the departure coordinator's token-keyed registration) ----
let current: PaneDepartureGuard | null = null;
const registered: PaneDepartureGuard[] = [];
const registerDepartureGuard = (guard: PaneDepartureGuard) => {
  registered.push(guard);
  current = guard;
  return () => { if (current?.token === guard.token) current = null; };
};
const blocking = () => Boolean(current && current.isCurrent() && current.isBlocking());
beforeEach(() => { current = null; registered.length = 0; });

function mount(lang: "en" | "zh" = "en", extra: React.ReactNode = null) {
  const tree = (next: "en" | "zh") => (
    <>
      {featuresPane.render({ lang: next, registerDepartureGuard })}
      {extra}
    </>
  );
  const ui = render(tree(lang));
  return { ...ui, rerenderPane: (next: "en" | "zh") => ui.rerender(tree(next)) };
}
const switchOf = (id: FeatureId) => document.querySelector<HTMLElement>(`[data-feature-id="${id}"] [role="switch"]`)!;
const shown = (id: FeatureId) => switchOf(id).getAttribute("aria-checked") === "true";
const button = (name: string) => screen.queryByRole("button", { name });
const says = (text: string) => (document.body.textContent ?? "").replace(/\s+/g, " ").includes(text);
function unload(): { warned: boolean; attempts: number } {
  const from = attempts.length;
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return { warned: event.defaultPrevented, attempts: attempts.length - from };
}
function clickReset(answer: boolean, name = "Reset to defaults"): string[] {
  confirmAnswer = answer;
  const before = confirmCalls.length;
  fireEvent.click(screen.getByRole("button", { name }));
  return confirmCalls.slice(before);
}
function activate(owner: string, generation: string) {
  nativeSet.call(localStorage, generationMarkerKey(owner), JSON.stringify({ generation, migrationId: "features-test", previous: null }));
  return accountScope.activate(accountScope.lock(owner), generation);
}

/** Observes object URLs, anchor clicks and revokes; jsdom has no object URLs of its own. */
function stubDownloads(options: { failCreate?: boolean } = {}) {
  const blobs: Blob[] = [];
  const created: string[] = [];
  const revoked: string[] = [];
  const clicks: Array<{ download: string; href: string | null }> = [];
  const saved = ["createObjectURL", "revokeObjectURL"].map((name) => [name, Object.getOwnPropertyDescriptor(URL, name)] as const);
  const savedClick = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, "click");
  Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: (blob: Blob) => {
    if (options.failCreate) throw new Error("url setup");
    blobs.push(blob);
    created.push(`blob:features/${blobs.length}`);
    return created.at(-1);
  } });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: (url: string) => { revoked.push(url); } });
  Object.defineProperty(HTMLAnchorElement.prototype, "click", { configurable: true, writable: true, value(this: HTMLAnchorElement) {
    clicks.push({ download: this.download, href: this.getAttribute("href") });
  } });
  restoreDownloads = () => {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(URL, name, descriptor);
      else delete (URL as unknown as Record<string, unknown>)[name];
    }
    if (savedClick) Object.defineProperty(HTMLAnchorElement.prototype, "click", savedClick);
    else delete (HTMLAnchorElement.prototype as unknown as Record<string, unknown>).click;
  };
  const json = (index = 0) => new Promise<unknown>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(JSON.parse(String(reader.result)));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blobs[index]!);
  });
  return { created, revoked, clicks, json };
}
const envelope = (device: Record<string, unknown>) => ({ version: 1, kind: "features-draft", changes: { device } });

describe("FeaturesPane recovery", () => {
  it("FR1: absent and valid mounts and rerenders make zero writes; the guard registers clean and never blocks", async () => {
    seed("board", "false");
    seed("habits", "true");
    const ui = mount();
    await flushFeatures();
    ui.rerenderPane("zh");
    await flushFeatures();
    ui.rerenderPane("en");
    await flushFeatures();
    expect(writes()).toEqual([]);
    expect(featureIdOrder.map(shown)).toEqual(featureIdOrder.map((id) => id !== "board"));
    expect(current?.label).toBe("Features");
    expect(blocking()).toBe(false);
    expect(unload().warned).toBe(false);
    expect(button("Export Features draft")).toBeNull();
    expect(says("Features settings saved.")).toBe(false);
    expect(says("Defaults restored.")).toBe(false);
    expect(button("Save & apply")).toBeNull();
    expect(document.querySelector('[data-testid="settings-footer-save"]')).toBeNull();
  });

  it("FR2: every switch stores exact unscoped bytes; on is stored as true, never a removal; Saved after a genuine success", async () => {
    mount();
    await flushFeatures();
    for (const id of featureIdOrder) {
      fireEvent.click(switchOf(id));
      await flushFeatures();
      expect(raw(id)).toBe("false");
      expect(switchOf(id).classList.contains("on")).toBe(false);
      fireEvent.click(switchOf(id));
      await flushFeatures();
      expect(raw(id)).toBe("true");
    }
    expect(writes().filter((item) => item.op === "remove")).toEqual([]);
    expect(Object.keys(localStorage).filter((key) => key.includes("xai_pref_features")).sort()).toEqual([...KEYS].sort());
    expect(says("Features settings saved.")).toBe(true);
    expect(storageEvents).toEqual([]);
  });

  it("FR3: a failed write keeps the latest choice with feedback, Retry, Discard, Export, guard and warning; Retry writes once", async () => {
    mount();
    await flushFeatures();
    failSet.add(keyOf("calendar"));
    fireEvent.click(switchOf("calendar"));
    await flushFeatures();
    expect(shown("calendar")).toBe(false);
    expect(raw("calendar")).toBeNull();
    expect(says("Calendar was not saved.")).toBe(true);
    expect(button("Retry Calendar")).not.toBeNull();
    expect(button("Discard Calendar")).not.toBeNull();
    expect(button("Export Features draft")).not.toBeNull();
    expect(button("Discard all changes")).not.toBeNull();
    expect(blocking()).toBe(true);
    expect(unload()).toEqual({ warned: true, attempts: 0 });
    expect(says("Saved")).toBe(false);
    failSet.clear();
    const from = attempts.length;
    fireEvent.click(button("Retry Calendar")!);
    await flushFeatures();
    expect(writes(from).map((item) => item.value)).toEqual(["false"]);
    expect(raw("calendar")).toBe("false");
    expect(button("Retry Calendar")).toBeNull();
    expect(blocking()).toBe(false);
    expect(unload().warned).toBe(false);
    expect(says("Features settings saved.")).toBe(true);
  });

  it("FR4: unreadable and malformed sources show the default with a Reload-only alert; Reload rereads only its field and never writes", async () => {
    seed("pomodoro", "TRUE");
    seed("matrix", "false");
    failGet.add(keyOf("matrix"));
    mount();
    await flushFeatures();
    for (const id of ["pomodoro", "matrix"] as const) {
      expect(shown(id)).toBe(true);
      expect(says(`Saved ${LABEL[id]} is unavailable. Reload it; this is not a new unsaved change.`)).toBe(true);
      expect(button(`Reload ${LABEL[id]}`)).not.toBeNull();
      expect(button(`Retry ${LABEL[id]}`)).toBeNull();
    }
    expect(button("Export Features draft")).toBeNull();
    expect(blocking()).toBe(false);
    expect(unload().warned).toBe(false);
    failGet.clear();
    const from = attempts.length;
    fireEvent.click(button("Reload Matrix")!);
    await flushFeatures();
    expect(writes(from)).toEqual([]);
    expect(touchesOther(from, "matrix")).toEqual([]);
    expect(shown("matrix")).toBe(false);
    expect(says("Saved Matrix is unavailable.")).toBe(false);
    expect(document.activeElement).toBe(switchOf("matrix"));
    fireEvent.click(button("Reload Pomodoro")!);
    await flushFeatures();
    expect(raw("pomodoro")).toBe("TRUE");
    expect(says("Saved Pomodoro is unavailable.")).toBe(true);
    expect(says("Features settings saved.")).toBe(false);
    expect(writes()).toEqual([]);
  });

  it("FR5: two same-turn activations invert the latest intent and return to the original through two operations", async () => {
    mount();
    await flushFeatures();
    const control = switchOf("habits");
    act(() => { control.click(); control.click(); });
    await flushFeatures();
    expect(shown("habits")).toBe(true);
    expect(writes().map((item) => item.value)).toEqual(["false", "true"]);
    expect(button("Retry Habits")).toBeNull();
  });

  it("FR6: a held per-key lock shows the latest choice at once with pending feedback; the switch stays enabled", async () => {
    mount();
    await flushFeatures();
    const lock = await locks.hold(prefMutationLockName(keyOf("board")));
    fireEvent.click(switchOf("board"));
    await flushFeatures();
    expect(shown("board")).toBe(false);
    expect(raw("board")).toBeNull();
    expect(locks.waiting(prefMutationLockName(keyOf("board")))).toBeGreaterThan(0);
    expect(says("Boards is saving.")).toBe(true);
    expect((switchOf("board") as HTMLButtonElement).disabled).toBe(false);
    expect(blocking()).toBe(true);
    await lock.release();
    expect(raw("board")).toBe("false");
    expect(says("Boards is saving.")).toBe(false);
    expect(says("Features settings saved.")).toBe(true);
  });

  it("FR7: a failed predecessor blocks the queued latest; Retry advances it without acknowledging the latest", async () => {
    seed("board", "false");
    mount();
    await flushFeatures();
    const lock = await locks.hold(prefMutationLockName(keyOf("board")));
    failSet.add(`${keyOf("board")}=true`);
    failSet.add(`${keyOf("board")}=false`);
    fireEvent.click(switchOf("board"));
    fireEvent.click(switchOf("board"));
    await flushFeatures();
    await lock.release();
    expect(shown("board")).toBe(false);
    expect(raw("board")).toBe("false");
    expect(says("Boards was not saved.")).toBe(true);
    failSet.delete(`${keyOf("board")}=true`);
    fireEvent.click(button("Retry Boards")!);
    await flushFeatures();
    expect(raw("board")).toBe("true");
    expect(shown("board")).toBe(false);
    expect(button("Retry Boards")).not.toBeNull();
    expect(says("Features settings saved.")).toBe(false);
    failSet.clear();
    fireEvent.click(button("Retry Boards")!);
    await flushFeatures();
    expect(raw("board")).toBe("false");
    expect(button("Retry Boards")).toBeNull();
    expect(says("Features settings saved.")).toBe(true);
  });

  it("FR8: an uncertain write keeps Retry and reconciles with exactly one total write", async () => {
    mount();
    await flushFeatures();
    vi.mocked(Storage.prototype.setItem).mockImplementation(function (this: Storage, key: string, value: string) {
      if (this === localStorage) {
        attempts.push({ op: "set", key, value });
        if (key === keyOf("dashboard")) failReadOnce.add(key);
      }
      return nativeSet.call(this, key, value);
    });
    fireEvent.click(switchOf("dashboard"));
    await flushFeatures();
    expect(raw("dashboard")).toBe("false");
    expect(button("Retry Dashboard")).not.toBeNull();
    expect(says("Features settings saved.")).toBe(false);
    fireEvent.click(button("Retry Dashboard")!);
    await flushFeatures();
    expect(writes().map((item) => item.value)).toEqual(["false"]);
    expect(button("Retry Dashboard")).toBeNull();
    expect(says("Features settings saved.")).toBe(true);
  });

  it("FR9: Reset to defaults asks the truthful confirmation; declining makes zero storage attempts", async () => {
    for (const id of featureIdOrder) seed(id, "false");
    mount();
    await flushFeatures();
    const reset = screen.getByRole("button", { name: "Reset to defaults" });
    expect(reset.getAttribute("data-testid")).toBe("features-reset-defaults");
    const from = attempts.length;
    expect(clickReset(false)).toEqual([CONFIRM_EN]);
    expect(attempts.slice(from)).toEqual([]);
    await flushFeatures();
    expect(writes(from)).toEqual([]);
    expect(featureIdOrder.map(shown)).toEqual(featureIdOrder.map(() => false));
    expect(storageEvents).toEqual([]);
  });

  it("FR10: an accepted reset removes all 8 keys through verified absence, never writes, dispatches no StorageEvent and restores defaults", async () => {
    for (const id of featureIdOrder) seed(id, "false");
    nativeSet.call(localStorage, "xai_accent_hue", "210");
    mount();
    await flushFeatures();
    expect(clickReset(true)).toEqual([CONFIRM_EN]);
    await flushFeatures(24);
    expect(featureIdOrder.map(raw)).toEqual(featureIdOrder.map(() => null));
    expect(featureIdOrder.map(shown)).toEqual(featureIdOrder.map(() => true));
    expect(writes().filter((item) => item.op === "set")).toEqual([]);
    expect(writes().filter((item) => item.op === "remove").length).toBe(8);
    expect(nativeGet.call(localStorage, "xai_accent_hue")).toBe("210");
    expect(storageEvents).toEqual([]);
    expect(says("Defaults restored.")).toBe(true);
    expect(blocking()).toBe(false);
  });

  it("FR11: an already-absent reset completes through verified no-ops with zero removes", async () => {
    mount();
    await flushFeatures();
    clickReset(true);
    await flushFeatures(24);
    expect(writes()).toEqual([]);
    expect(says("Defaults restored.")).toBe(true);
  });

  it("FR12: a refused removal keeps a reset draft (on, not reset, Retry, export reset); Retry removes once and never writes true", async () => {
    for (const id of featureIdOrder) seed(id, "false");
    failRemove.add(keyOf("habits"));
    mount();
    await flushFeatures();
    clickReset(true);
    await flushFeatures(24);
    expect(raw("habits")).toBe("false");
    expect(shown("habits")).toBe(true);
    expect(says("Habits was not reset to its default.")).toBe(true);
    expect(says("Defaults restored.")).toBe(false);
    expect(blocking()).toBe(true);
    const downloads = stubDownloads();
    fireEvent.click(button("Export Features draft")!);
    await flushFeatures(2);
    expect(downloads.clicks).toEqual([{ download: "features-draft.json", href: downloads.created[0] }]);
    expect(downloads.revoked).toEqual(downloads.created);
    expect(await downloads.json()).toStrictEqual(envelope({ habits: { operation: "reset" } }));
    failRemove.clear();
    const from = attempts.length;
    fireEvent.click(button("Retry Habits")!);
    await flushFeatures();
    expect(writes(from)).toEqual([{ op: "remove", key: keyOf("habits") }]);
    expect(touchesOther(from, "habits")).toEqual([]);
    expect(raw("habits")).toBeNull();
    expect(says("Defaults restored.")).toBe(true);
    expect(blocking()).toBe(false);
  });

  it("FR13: a duplicate Reset to defaults while the batch is pending enqueues no duplicate removes", async () => {
    for (const id of featureIdOrder) seed(id, "false");
    mount();
    await flushFeatures();
    const lock = await locks.hold(prefMutationLockName(keyOf("calendar")));
    clickReset(true);
    await flushFeatures();
    expect(says("Calendar is being reset to its default.")).toBe(true);
    clickReset(true);
    await flushFeatures();
    await lock.release();
    for (const key of KEYS) expect(writes().filter((item) => item.key === key).length).toBe(1);
    expect(says("Defaults restored.")).toBe(true);
  });

  it("FR13b: a repeated Reset to defaults never rebases a failed reset: it re-attempts only that removal, also after an intervening edit", async () => {
    seed("board", "false");
    seed("tasks", "false");
    failRemove.add(keyOf("board"));
    mount();
    await flushFeatures();
    clickReset(true);
    await flushFeatures(24);
    expect(says("Boards was not reset to its default.")).toBe(true);
    // Duplicate activation while the batch is unresolved: the refused removal is re-attempted once, nothing else.
    let from = attempts.length;
    clickReset(true);
    await flushFeatures();
    expect(writes(from)).toEqual([{ op: "remove", key: keyOf("board") }]);
    expect(raw("board")).toBe("false");
    expect(says("Boards was not reset to its default.")).toBe(true);
    // An intervening edit supersedes the batch; the next Reset adopts the failed reset instead of rebasing it.
    fireEvent.click(switchOf("tasks"));
    await flushFeatures();
    expect(raw("tasks")).toBe("false");
    failRemove.clear();
    from = attempts.length;
    clickReset(true);
    await flushFeatures(24);
    expect(writes(from).filter((item) => item.key === keyOf("board"))).toEqual([{ op: "remove", key: keyOf("board") }]);
    expect(writes(from).filter((item) => item.op === "set")).toEqual([]);
    expect(featureIdOrder.map(raw)).toEqual(featureIdOrder.map(() => null));
    expect(says("Defaults restored.")).toBe(true);
    expect(blocking()).toBe(false);
  });

  it("FR14: an invalid source refuses the reset and keeps the intent; Retry never purges; Discard returns to Reload-only", async () => {
    seed("tasks", "yes");
    mount();
    await flushFeatures();
    clickReset(true);
    await flushFeatures(24);
    expect(raw("tasks")).toBe("yes");
    expect(says("Tasks was not reset to its default.")).toBe(true);
    fireEvent.click(button("Retry Tasks")!);
    await flushFeatures();
    expect(raw("tasks")).toBe("yes");
    expect(writes()).toEqual([]);
    fireEvent.click(button("Discard Tasks")!);
    await flushFeatures();
    expect(button("Reload Tasks")).not.toBeNull();
    expect(says("Saved Tasks is unavailable.")).toBe(true);
    expect(blocking()).toBe(false);
    expect(document.activeElement).toBe(switchOf("tasks"));
  });

  it("FR15: set→reset and reset→set orderings: the latest intent governs and the superseded one never surfaces", async () => {
    seed("matrix", "false");
    mount();
    await flushFeatures();
    let lock = await locks.hold(prefMutationLockName(keyOf("matrix")));
    fireEvent.click(switchOf("matrix"));
    await flushFeatures();
    clickReset(true);
    await flushFeatures();
    expect(says("Matrix is being reset to its default.")).toBe(true);
    await lock.release();
    expect(raw("matrix")).toBeNull();
    expect(says("Matrix was not saved.")).toBe(false);
    expect(says("Defaults restored.")).toBe(true);
    fireEvent.click(switchOf("pomodoro"));
    await flushFeatures();
    expect(raw("pomodoro")).toBe("false");
    lock = await locks.hold(prefMutationLockName(keyOf("pomodoro")));
    clickReset(true);
    await flushFeatures();
    expect(shown("pomodoro")).toBe(true);
    fireEvent.click(switchOf("pomodoro"));
    await flushFeatures();
    expect(shown("pomodoro")).toBe(false);
    await lock.release();
    expect(raw("pomodoro")).toBe("false");
    expect(says("Pomodoro was not reset to its default.")).toBe(false);
    expect(says("Pomodoro was not saved.")).toBe(false);
    expect(says("Defaults restored.")).toBe(false);
    expect(blocking()).toBe(false);
  });

  it("FR16: export is memory-only under total denial with the set/reset envelope; a setup failure shows the export error and keeps drafts", async () => {
    seed("board", "false");
    failRemove.add(keyOf("board"));
    mount();
    await flushFeatures();
    clickReset(true);
    await flushFeatures(24);
    failSet.add(keyOf("tasks"));
    fireEvent.click(switchOf("tasks"));
    await flushFeatures();
    const downloads = stubDownloads();
    denyAll = true;
    const from = attempts.length;
    fireEvent.click(button("Export Features draft")!);
    await flushFeatures(2);
    expect(attempts.slice(from)).toEqual([]);
    expect(await downloads.json()).toStrictEqual(envelope({ board: { operation: "reset" }, tasks: { operation: "set", value: false } }));
    expect(document.querySelectorAll("a[download]").length).toBe(0);
    expect(unload()).toEqual({ warned: true, attempts: 0 });
    expect(blocking()).toBe(true);
    denyAll = false;
    restoreDownloads?.();
    stubDownloads({ failCreate: true });
    fireEvent.click(button("Export Features draft")!);
    await flushFeatures(2);
    expect(says("Export failed. Please retry.")).toBe(true);
    expect(button("Retry Tasks")).not.toBeNull();
    expect(blocking()).toBe(true);
  });

  it("FR17: an epoch change renews the guard; old capabilities refuse before rerender; fresh permission guards surviving device work", async () => {
    // The account change below is deliberately outside act(): the old capabilities must refuse before rerender.
    const consoleError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (!String(args[0]).includes("not wrapped in act")) consoleError(...args);
    });
    activate("features-test-A", "g1");
    mount();
    await flushFeatures();
    failSet.add(keyOf("pomodoro"));
    fireEvent.click(switchOf("pomodoro"));
    await flushFeatures();
    const old = current!;
    const retry = button("Retry Pomodoro")!;
    expect(blocking()).toBe(true);
    const downloads = stubDownloads();
    activate("features-test-B", "g1");
    expect(old.isCurrent()).toBe(false);
    expect(old.isBlocking()).toBe(false);
    old.exportDraft();
    old.discardDraft();
    failSet.clear();
    const from = attempts.length;
    retry.click();
    expect(downloads.clicks).toEqual([]);
    await flushFeatures();
    expect(writes(from)).toEqual([]);
    expect(shown("pomodoro")).toBe(false);
    expect(current).not.toBe(old);
    expect(current?.token).not.toBe(old.token);
    expect(blocking()).toBe(true);
    act(() => { current!.discardDraft(); });
    await flushFeatures();
    expect(shown("pomodoro")).toBe(true);
    expect(blocking()).toBe(false);
    expect(attempts.filter((item) => /^xai:(account|demo):v1:/.test(item.key) && item.op !== "get")).toEqual([]);
    expect(locks.requests.filter((name) => !name.startsWith("xai:pref:v1:xai_pref_features_"))).toEqual([]);
  });

  it("FR18: unmount removes the guard and the unload listener and never undoes committed writes", async () => {
    const ui = mount();
    await flushFeatures();
    fireEvent.click(switchOf("tasks"));
    await flushFeatures();
    failSet.add(keyOf("board"));
    fireEvent.click(switchOf("board"));
    await flushFeatures();
    const old = current!;
    expect(unload().warned).toBe(true);
    ui.unmount();
    expect(current).toBeNull();
    expect(old.isCurrent()).toBe(false);
    expect(unload().warned).toBe(false);
    expect(raw("tasks")).toBe("false");
  });

  it("FR19: focus lands on the field's switch after Discard and stays in the pane after Discard all", async () => {
    mount();
    await flushFeatures();
    failSet.add(keyOf("calendar"));
    failSet.add(keyOf("habits"));
    fireEvent.click(switchOf("calendar"));
    fireEvent.click(switchOf("habits"));
    await flushFeatures();
    const discard = button("Discard Calendar")!;
    discard.focus();
    fireEvent.click(discard);
    await flushFeatures();
    expect(document.activeElement).toBe(switchOf("calendar"));
    const discardAll = button("Discard all changes")!;
    discardAll.focus();
    fireEvent.click(discardAll);
    await flushFeatures();
    expect(button("Discard all changes")).toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.querySelector(".features-pane")!.contains(document.activeElement)).toBe(true);
    failSet.clear();
    failSet.add(keyOf("matrix"));
    fireEvent.click(switchOf("matrix"));
    await flushFeatures();
    failSet.clear();
    const retry = button("Retry Matrix")!;
    retry.focus();
    fireEvent.click(retry);
    await flushFeatures();
    expect(button("Retry Matrix")).toBeNull();
    expect(document.activeElement).toBe(switchOf("matrix"));
  });

  it("FR20: committed bytes only reach readers; mounted legacy readers of other keys are never repainted by a reset", async () => {
    nativeSet.call(localStorage, "xai_rail_pos", "right");
    for (const id of featureIdOrder) seed(id, "false");
    failRemove.add(keyOf("calendar"));
    function Probe(): React.ReactElement {
      const prefs = useFeaturePrefs();
      const [railPos] = usePref("xai_rail_pos");
      return <output data-testid="probe">{JSON.stringify({ calendar: prefs.calendar, board: prefs.board, railPos })}</output>;
    }
    mount("en", <Probe />);
    await flushFeatures();
    clickReset(true);
    await flushFeatures(24);
    expect(JSON.parse(screen.getByTestId("probe").textContent!)).toEqual({ calendar: false, board: true, railPos: "right" });
    expect(shown("calendar")).toBe(true);
    expect(storageEvents).toEqual([]);
  });

  it("FR21: ZH wording for confirmation, recovery, export, statuses and the guard label", async () => {
    seed("matrix", "yes");
    mount("zh");
    await flushFeatures();
    expect(current?.label).toBe("功能");
    expect(says("已保存的四象限不可用。请重新读取；这不是新的未保存更改。")).toBe(true);
    expect(button("重新读取 四象限")).not.toBeNull();
    failSet.add(keyOf("tasks"));
    fireEvent.click(switchOf("tasks"));
    await flushFeatures();
    expect(says("任务未保存。")).toBe(true);
    expect(button("重试 任务")).not.toBeNull();
    expect(button("放弃 任务")).not.toBeNull();
    expect(button("导出功能草稿")).not.toBeNull();
    expect(button("放弃全部更改")).not.toBeNull();
    failSet.clear();
    nativeSet.call(localStorage, keyOf("matrix"), "true");
    fireEvent.click(button("重新读取 四象限")!);
    fireEvent.click(button("重试 任务")!);
    await flushFeatures();
    expect(says("功能设置已保存。")).toBe(true);
    expect(clickReset(true, "恢复默认")).toEqual([CONFIRM_ZH]);
    await flushFeatures(24);
    expect(says("已恢复默认设置。")).toBe(true);
  });
});
