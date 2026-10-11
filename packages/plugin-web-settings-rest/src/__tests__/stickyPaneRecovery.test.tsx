/**
 * SR1..SR14 — Sticky Note recovery caller tests (test.md §3 P3).
 *
 * Real storage hook and engine; jsdom gets an exclusive Web Locks fixture and
 * attempt-logging Storage spies. The frozen Sol/host oracles under
 * docs/reviews/web-sticky-recovery-* remain the acceptance matrix.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { PaneDepartureGuard } from "@repo/plugin-web-settings-shell";
import { accountScope, prefMutationLockName } from "@repo/plugin-web-storage";
import { stickyPane } from "../panes/stickyPane.js";
import { createSmartListsLockManager } from "./smartListsLockFixture.js";

const KEY = {
  color: "xai_pref_sticky_color",
  font: "xai_pref_sticky_font",
  pin: "xai_pref_sticky_pin_default",
  restore: "xai_pref_sticky_restore_size",
  spacing: "xai_pref_sticky_grid_spacing",
} as const;
const STICKY_KEYS: readonly string[] = Object.values(KEY);

const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
type Attempt = { op: "get" | "set" | "remove"; key: string; value?: string };
let attempts: Attempt[] = [];
/** Faulted writes: a key (any value) or `key=value`. */
let failSet = new Set<string>();
let failGet = new Set<string>();
let denyAll = false;
let locks = createSmartListsLockManager();
let restoreDownloads: (() => void) | null = null;

const raw = (key: string) => nativeGet.call(localStorage, key);
const seed = (key: string, value: string) => nativeSet.call(localStorage, key, value);
const writes = (from = 0) => attempts.slice(from).filter((item) => item.op !== "get" && STICKY_KEYS.includes(item.key));

beforeEach(() => {
  attempts = [];
  failSet = new Set();
  failGet = new Set();
  denyAll = false;
  locks = createSmartListsLockManager();
  Object.defineProperty(navigator, "locks", { configurable: true, value: locks });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) {
      attempts.push({ op: "get", key });
      if (denyAll || failGet.has(key)) throw new Error("read denied");
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
      if (denyAll) throw new Error("remove denied");
    }
    return nativeRemove.call(this, key);
  });
});
afterEach(() => {
  restoreDownloads?.();
  restoreDownloads = null;
  delete (navigator as unknown as { locks?: unknown }).locks;
});

async function flush(rounds = 10): Promise<void> {
  await act(async () => {
    for (let index = 0; index < rounds; index += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

/** The test takes the real per-key lock and keeps it until the returned release. */
async function hold(key: string): Promise<() => Promise<void>> {
  let open!: () => void;
  let entered = false;
  const task = locks.request(prefMutationLockName(key), { mode: "exclusive" }, () => {
    entered = true;
    return new Promise<void>((resolve) => { open = resolve; });
  });
  for (let index = 0; index < 20 && !entered; index += 1) await Promise.resolve();
  expect(entered).toBe(true);
  return async () => {
    await act(async () => { open(); await task; });
    await flush();
  };
}

/** Observes object URLs, anchor clicks and revokes; jsdom has no object URLs of its own. */
function stubDownloads(options: { failCreate?: boolean } = {}) {
  const created: Blob[] = [];
  const revoked: string[] = [];
  const clicks: Array<{ download: string; href: string | null }> = [];
  const saved = ["createObjectURL", "revokeObjectURL"].map((name) => [URL, name, Object.getOwnPropertyDescriptor(URL, name)] as const);
  const savedClick = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, "click");
  Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: (blob: Blob) => {
    if (options.failCreate) throw new Error("url setup");
    created.push(blob);
    return `blob:sticky/${created.length}`;
  } });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: (url: string) => { revoked.push(url); } });
  Object.defineProperty(HTMLAnchorElement.prototype, "click", { configurable: true, writable: true, value(this: HTMLAnchorElement) {
    clicks.push({ download: this.download, href: this.getAttribute("href") });
  } });
  restoreDownloads = () => {
    for (const [target, name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(target, name, descriptor);
      else delete (target as unknown as Record<string, unknown>)[name];
    }
    if (savedClick) Object.defineProperty(HTMLAnchorElement.prototype, "click", savedClick);
    else delete (HTMLAnchorElement.prototype as unknown as Record<string, unknown>).click;
  };
  return { created, revoked, clicks };
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function mountSticky(lang: "en" | "zh" = "en") {
  const guards: { current: PaneDepartureGuard | null } = { current: null };
  const registerDepartureGuard = (guard: PaneDepartureGuard) => {
    guards.current = guard;
    return () => { if (guards.current?.token === guard.token) guards.current = null; };
  };
  const ui = render(stickyPane.render({ lang, registerDepartureGuard }));
  const rerender = () => ui.rerender(stickyPane.render({ lang, registerDepartureGuard }));
  const blocking = () => Boolean(guards.current?.isCurrent() && guards.current.isBlocking());
  return { ui, guards, blocking, rerender };
}

const swatch = (id: string) => document.querySelector<HTMLButtonElement>(`[data-color-id="${id}"]`)!;
const card = (id: string) => document.querySelector<HTMLButtonElement>(`[data-spacing-id="${id}"]`)!;
const pressed = (attribute: "data-color-id" | "data-spacing-id") =>
  Array.from(document.querySelectorAll(`[${attribute}][aria-pressed="true"]`)).map((node) => node.getAttribute(attribute));
const fontSelect = (label = "Font Size") => document.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
const toggleNamed = (name: string) => screen.getByRole("switch", { name });
const button = (name: string) => screen.queryByRole("button", { name });
const says = (text: string) => (document.body.textContent ?? "").includes(text);
const warns = () => {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};

describe("Sticky Note recovery caller", () => {
  it("SR1: absent and valid sources (including the random sentinel) mount with zero writes and no recovery or Saved", async () => {
    const first = mountSticky();
    await flush();
    expect(pressed("data-color-id")).toEqual(["sun"]);
    expect(fontSelect().value).toBe("large");
    expect(toggleNamed("Pin by Default")).toHaveAttribute("aria-checked", "true");
    expect(toggleNamed("Restore Default Size")).toHaveAttribute("aria-checked", "false");
    expect(pressed("data-spacing-id")).toEqual(["normal"]);
    first.ui.unmount();
    seed(KEY.color, "random");
    seed(KEY.font, "small");
    seed(KEY.pin, "false");
    seed(KEY.restore, "true");
    seed(KEY.spacing, "none");
    const second = mountSticky();
    await flush();
    second.rerender();
    await flush();
    expect(pressed("data-color-id")).toEqual(["random"]);
    expect(fontSelect().value).toBe("small");
    expect(toggleNamed("Pin by Default")).toHaveAttribute("aria-checked", "false");
    expect(toggleNamed("Restore Default Size")).toHaveAttribute("aria-checked", "true");
    expect(pressed("data-spacing-id")).toEqual(["none"]);
    expect(writes()).toEqual([]);
    expect(button("Export Sticky Note draft")).toBeNull();
    expect(says("Sticky Note settings saved.")).toBe(false);
    expect(second.blocking()).toBe(false);
    expect(warns()).toBe(false);
  });

  it("SR2: a failed write keeps the latest choice with Retry, Discard, export and guard; Retry saves exact bytes and Saved", async () => {
    seed(KEY.color, "sky");
    const { blocking } = mountSticky();
    await flush();
    failSet.add(KEY.color);
    fireEvent.click(swatch("mint"));
    await flush();
    expect(pressed("data-color-id")).toEqual(["mint"]);
    expect(raw(KEY.color)).toBe("sky");
    expect(says("Default Color was not saved.")).toBe(true);
    expect(button("Discard Default Color")).not.toBeNull();
    expect(button("Export Sticky Note draft")).not.toBeNull();
    expect(button("Discard all changes")).not.toBeNull();
    expect(says("Sticky Note settings saved.")).toBe(false);
    expect(blocking()).toBe(true);
    expect(warns()).toBe(true);
    failSet.clear();
    const from = attempts.length;
    fireEvent.click(button("Retry Default Color")!);
    await flush();
    expect(writes(from).map((item) => item.value)).toEqual(["mint"]);
    expect(raw(KEY.color)).toBe("mint");
    expect(button("Retry Default Color")).toBeNull();
    expect(blocking()).toBe(false);
    expect(warns()).toBe(false);
    expect(says("Sticky Note settings saved.")).toBe(true);
  });

  it("SR3: invalid string and boolean bytes show the default with a Reload-only alert and are never normalized", async () => {
    seed(KEY.color, "purple");
    seed(KEY.pin, "TRUE");
    const { blocking } = mountSticky();
    await flush();
    expect(pressed("data-color-id")).toEqual(["sun"]);
    expect(toggleNamed("Pin by Default")).toHaveAttribute("aria-checked", "true");
    expect(says("Saved Default Color is unavailable. Reload it; this is not a new unsaved change.")).toBe(true);
    expect(says("Saved Pin by Default is unavailable. Reload it; this is not a new unsaved change.")).toBe(true);
    expect(button("Retry Default Color")).toBeNull();
    expect(button("Discard Default Color")).toBeNull();
    expect(button("Export Sticky Note draft")).toBeNull();
    expect(blocking()).toBe(false);
    expect(warns()).toBe(false);
    seed(KEY.pin, "false");
    fireEvent.click(button("Reload Pin by Default")!);
    fireEvent.click(button("Reload Default Color")!);
    await flush();
    expect(toggleNamed("Pin by Default")).toHaveAttribute("aria-checked", "false");
    expect(says("Saved Pin by Default is unavailable.")).toBe(false);
    expect(says("Saved Default Color is unavailable.")).toBe(true);
    expect(says("Sticky Note settings saved.")).toBe(false);
    expect(writes()).toEqual([]);
    expect(raw(KEY.color)).toBe("purple");
  });

  it("SR4: a throwing read is a Reload-only source issue; a valid edit over it stays a failed draft that never writes", async () => {
    seed(KEY.restore, "true");
    failGet.add(KEY.restore);
    const { blocking } = mountSticky();
    await flush();
    expect(toggleNamed("Restore Default Size")).toHaveAttribute("aria-checked", "false");
    expect(says("Saved Restore Default Size is unavailable.")).toBe(true);
    fireEvent.click(toggleNamed("Restore Default Size"));
    await flush();
    expect(toggleNamed("Restore Default Size")).toHaveAttribute("aria-checked", "true");
    expect(says("Restore Default Size was not saved.")).toBe(true);
    expect(button("Reload Restore Default Size")).toBeNull();
    expect(blocking()).toBe(true);
    fireEvent.click(button("Discard Restore Default Size")!);
    await flush();
    expect(writes()).toEqual([]);
    expect(raw(KEY.restore)).toBe("true");
    expect(button("Reload Restore Default Size")).not.toBeNull();
    expect(blocking()).toBe(false);
  });

  it("SR5: a malformed font DOM value keeps the prior value with an input error and zero writes; a valid choice clears it", async () => {
    seed(KEY.font, "normal");
    const { blocking } = mountSticky();
    await flush();
    const select = fontSelect();
    const injected = document.createElement("option");
    injected.value = "huge";
    select.appendChild(injected);
    select.value = "huge";
    fireEvent.change(select);
    await flush();
    expect(fontSelect().value).toBe("normal");
    expect(says("Font Size has an invalid value.")).toBe(true);
    expect(writes()).toEqual([]);
    expect(blocking()).toBe(false);
    expect(warns()).toBe(false);
    fireEvent.change(fontSelect(), { target: { value: "xl" } });
    await flush();
    expect(says("Font Size has an invalid value.")).toBe(false);
    expect(raw(KEY.font)).toBe("xl");
    expect(says("Sticky Note settings saved.")).toBe(true);
  });

  it("SR6: two same-turn switch activations invert the latest intent through two operations", async () => {
    seed(KEY.pin, "false");
    mountSticky();
    await flush();
    const control = toggleNamed("Pin by Default");
    act(() => { control.click(); control.click(); });
    await flush();
    expect(toggleNamed("Pin by Default")).toHaveAttribute("aria-checked", "false");
    expect(writes().map((item) => item.value)).toEqual(["true", "false"]);
    expect(raw(KEY.pin)).toBe("false");
  });

  it("SR7: a held per-key lock shows pending work immediately; coalesced choices settle only the latest", async () => {
    seed(KEY.color, "sky");
    const { blocking } = mountSticky();
    await flush();
    const release = await hold(KEY.color);
    fireEvent.click(swatch("coral"));
    fireEvent.click(swatch("mint"));
    fireEvent.click(swatch("navy"));
    await flush();
    expect(pressed("data-color-id")).toEqual(["navy"]);
    expect(raw(KEY.color)).toBe("sky");
    expect(says("Default Color is saving.")).toBe(true);
    expect(swatch("sun").disabled).toBe(false);
    expect(blocking()).toBe(true);
    await release();
    expect(writes().map((item) => item.value)).toEqual(["coral", "navy"]);
    expect(raw(KEY.color)).toBe("navy");
    expect(says("Default Color is saving.")).toBe(false);
    expect(blocking()).toBe(false);
    expect(says("Sticky Note settings saved.")).toBe(true);
  });

  it("SR8: a failed predecessor keeps the queued latest; Retry advances it without acknowledging the latest", async () => {
    seed(KEY.spacing, "large");
    const { blocking } = mountSticky();
    await flush();
    const release = await hold(KEY.spacing);
    fireEvent.click(card("none"));
    fireEvent.click(card("xl"));
    await flush();
    failSet.add(`${KEY.spacing}=none`);
    failSet.add(`${KEY.spacing}=xl`);
    await release();
    expect(pressed("data-spacing-id")).toEqual(["xl"]);
    expect(raw(KEY.spacing)).toBe("large");
    expect(says("Default Grid Spacing was not saved.")).toBe(true);
    failSet.delete(`${KEY.spacing}=none`);
    fireEvent.click(button("Retry Default Grid Spacing")!);
    await flush();
    expect(raw(KEY.spacing)).toBe("none");
    expect(pressed("data-spacing-id")).toEqual(["xl"]);
    expect(button("Retry Default Grid Spacing")).not.toBeNull();
    expect(says("Sticky Note settings saved.")).toBe(false);
    expect(blocking()).toBe(true);
    failSet.delete(`${KEY.spacing}=xl`);
    fireEvent.click(button("Retry Default Grid Spacing")!);
    await flush();
    expect(raw(KEY.spacing)).toBe("xl");
    expect(button("Retry Default Grid Spacing")).toBeNull();
    expect(blocking()).toBe(false);
  });

  it("SR9: Discard is zero-write and rereads only its field; Discard all visits only actual drafts", async () => {
    seed(KEY.color, "sky");
    seed(KEY.pin, "false");
    mountSticky();
    await flush();
    failSet.add(KEY.color);
    failSet.add(KEY.pin);
    fireEvent.click(swatch("mint"));
    fireEvent.click(toggleNamed("Pin by Default"));
    await flush();
    let from = attempts.length;
    fireEvent.click(button("Discard Default Color")!);
    await flush();
    expect(attempts.slice(from).map((item) => `${item.op}:${item.key}`)).toEqual([`get:${KEY.color}`]);
    expect(pressed("data-color-id")).toEqual(["sky"]);
    expect(button("Retry Pin by Default")).not.toBeNull();
    from = attempts.length;
    fireEvent.click(button("Discard all changes")!);
    await flush();
    expect(attempts.slice(from).map((item) => `${item.op}:${item.key}`)).toEqual([`get:${KEY.pin}`]);
    expect(toggleNamed("Pin by Default")).toHaveAttribute("aria-checked", "false");
    expect(button("Discard all changes")).toBeNull();
    expect(raw(KEY.color)).toBe("sky");
    expect(raw(KEY.pin)).toBe("false");
  });

  it("SR10: the export is a sparse memory-only sticky-draft.json under total storage denial", async () => {
    const downloads = stubDownloads();
    seed(KEY.restore, "false");
    const { blocking } = mountSticky();
    await flush();
    failSet.add(KEY.color);
    failSet.add(KEY.restore);
    fireEvent.click(swatch("mint"));
    fireEvent.click(toggleNamed("Restore Default Size"));
    await flush();
    denyAll = true;
    const from = attempts.length;
    fireEvent.click(button("Export Sticky Note draft")!);
    await flush(2);
    expect(attempts.length - from).toBe(0);
    expect(downloads.clicks).toEqual([{ download: "sticky-draft.json", href: "blob:sticky/1" }]);
    expect(downloads.revoked).toEqual(["blob:sticky/1"]);
    expect(document.querySelectorAll("a[download]").length).toBe(0);
    expect(JSON.parse(await readBlob(downloads.created[0]!))).toStrictEqual({ version: 1, kind: "sticky-draft", values: { device: { color: "mint", restore_size: true } } });
    expect(warns()).toBe(true);
    expect(blocking()).toBe(true);
    expect(button("Retry Default Color")).not.toBeNull();
    denyAll = false;
  });

  it("SR11: an export setup failure shows the localized error and keeps drafts, guard and warning", async () => {
    stubDownloads({ failCreate: true });
    const { blocking } = mountSticky("zh");
    await flush();
    failSet.add(KEY.spacing);
    fireEvent.click(card("xl"));
    await flush();
    fireEvent.click(button("导出便签草稿")!);
    await flush(2);
    expect(says("导出失败，请重试。")).toBe(true);
    expect(button("重试 默认网格间距")).not.toBeNull();
    expect(document.querySelectorAll("a[download]").length).toBe(0);
    expect(blocking()).toBe(true);
    expect(warns()).toBe(true);
  });

  it("SR12: an epoch change refuses old capabilities before rerender; a fresh guard protects the surviving device draft", async () => {
    seed(KEY.color, "sky");
    const { guards, blocking } = mountSticky();
    await flush();
    failSet.add(KEY.color);
    fireEvent.click(swatch("mint"));
    await flush();
    const old = guards.current!;
    expect(old.label).toBe("Sticky Note");
    expect(blocking()).toBe(true);
    const retry = button("Retry Default Color")!;
    const discard = button("Discard Default Color")!;
    failSet.clear();
    const from = attempts.length;
    // The scope changes outside act on purpose: old capabilities must refuse before React rerenders.
    const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      accountScope.activate(accountScope.lock("sticky-B"), "g-b");
      expect(old.isCurrent()).toBe(false);
      expect(old.isBlocking()).toBe(false);
      old.discardDraft();
      discard.click();
      retry.click();
    } finally {
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
    await flush();
    expect(attempts.slice(from)).toEqual([]);
    const fresh = guards.current!;
    expect(fresh.token).not.toBe(old.token);
    expect(blocking()).toBe(true);
    expect(pressed("data-color-id")).toEqual(["mint"]);
    fireEvent.click(button("Retry Default Color")!);
    await flush();
    expect(raw(KEY.color)).toBe("mint");
    expect(blocking()).toBe(false);
    expect(attempts.filter((item) => /^xai:(account|demo):v1:/.test(item.key))).toEqual([]);
  });

  it("SR13: unmount removes the guard and the beforeunload listener and detaches old callbacks", async () => {
    seed(KEY.color, "sky");
    const { ui, guards } = mountSticky();
    await flush();
    failSet.add(KEY.color);
    fireEvent.click(swatch("mint"));
    await flush();
    const old = guards.current!;
    expect(warns()).toBe(true);
    ui.unmount();
    expect(guards.current).toBeNull();
    expect(warns()).toBe(false);
    expect(old.isCurrent()).toBe(false);
    expect(old.isBlocking()).toBe(false);
    const from = attempts.length;
    old.exportDraft();
    old.discardDraft();
    await flush();
    expect(attempts.length - from).toBe(0);
    expect(raw(KEY.color)).toBe("sky");
  });

  it("SR14: ZH wording for pending, source, input-error, actions, Saved and the guard label", async () => {
    seed(KEY.restore, "yes");
    const { guards } = mountSticky("zh");
    await flush();
    expect(says("已保存的恢复默认尺寸不可用。请重新读取；这不是新的未保存更改。")).toBe(true);
    expect(button("重新读取 恢复默认尺寸")).not.toBeNull();
    const release = await hold(KEY.spacing);
    fireEvent.click(card("xl"));
    await flush();
    expect(says("默认网格间距正在保存。")).toBe(true);
    expect(button("放弃 默认网格间距")).not.toBeNull();
    expect(button("放弃全部更改")).not.toBeNull();
    expect(guards.current?.label).toBe("便签");
    await release();
    const select = fontSelect("字体大小");
    select.value = "bogus";
    fireEvent.change(select);
    await flush();
    expect(says("字体大小格式无效。")).toBe(true);
    fireEvent.change(fontSelect("字体大小"), { target: { value: "small" } });
    await flush();
    seed(KEY.restore, "true");
    fireEvent.click(button("重新读取 恢复默认尺寸")!);
    await flush();
    expect(says("便签设置已保存。")).toBe(true);
  });
});
