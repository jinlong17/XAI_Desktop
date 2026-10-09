/**
 * RailOrderStatus — RS-* (CP-APPRAIL-01, contract A8 and §7 item 2).
 *
 *   RS-C  render conditions: nothing when clean or only pending; the draft
 *         status once settled unsuccessful (kept while its Retry is pending);
 *         the source status with no draft and an invalid or unreadable source;
 *   RS-P  the disclosure button and the non-modal panel by state, wording in
 *         EN and ZH, Tab order inside the slot;
 *   RS-F  focus targets: success/Discard → .topbar-pref-trigger, failed Retry
 *         → stays on Retry, Export → stays on Export, Escape → status button,
 *         outside mousedown;
 *   RS-E  memory-only export envelope and the export-failure line;
 *   RS-U  the unload warning and the sign-out step (confirm, Cancel, OK).
 */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import {
  KEY, LOCK, REVERSED, action, actionsShown, drag, flush, installRailLocks, installStorageProbe, message, messageRole, mountHarness,
  openPanel, panel, prefTrigger, raw, seed, status, warns,
} from "./railOrderFixture.js";
import { Topbar } from "../Topbar.js";
import { RailOrderStatus } from "../internal/RailOrderStatus.js";

const encode = (order: readonly string[]) => JSON.stringify(order);
const X = REVERSED[0]!;
const Y = REVERSED[3]!;

/** Replaces URL.createObjectURL / revokeObjectURL (jsdom has neither) for this test. */
function stubObjectUrls(create: (blob: Blob) => string): string[] {
  const revoked: string[] = [];
  const saved = ["createObjectURL", "revokeObjectURL"].map((name) => [name, Object.getOwnPropertyDescriptor(URL, name)] as const);
  Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: create });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: (url: string) => { revoked.push(url); } });
  onTestFinished(() => {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(URL, name, descriptor);
      else delete (URL as unknown as Record<string, unknown>)[name];
    }
  });
  return revoked;
}
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

async function failedDraft(options: { lang?: "en" | "zh" } = {}) {
  const locks = installRailLocks();
  const storage = installStorageProbe();
  seed(encode(REVERSED));
  const view = await mountHarness({ lang: options.lang });
  const quota = storage.fault("set", KEY);
  const order = await drag(X, [Y]);
  return { locks, storage, view, quota, order };
}

describe("RS-C — render conditions (A8)", () => {
  it("RS-C1 — no DOM node in a clean state or while a first attempt is only pending", async () => {
    const locks = installRailLocks();
    installStorageProbe();
    seed(encode(REVERSED));
    await mountHarness();
    expect(status()).toBeNull();
    expect(document.querySelector(".rail-order-status")).toBeNull();
    const lock = await locks.hold(LOCK);
    await drag(X, [Y]);
    expect(status()).toBeNull();
    await lock.release();
    expect(status()).toBeNull();
  });

  it("RS-C2 — a settled failure renders the draft status; it stays while its Retry is pending; success removes it", async () => {
    const { locks, quota } = await failedDraft();
    expect(status()?.getAttribute("aria-label")).toBe("Sidebar order not saved. Review it.");
    quota.off();
    const lock = await locks.hold(LOCK);
    openPanel();
    fireEvent.click(action("retry")!);
    await flush();
    expect(status()).not.toBeNull();
    expect(message()).toBe("Sidebar order is saving.");
    expect(messageRole()).toBe("status");
    expect(action("retry")!.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(action("retry")!);
    await lock.release();
    expect(status()).toBeNull();
    expect(locks.requests.filter((name) => name === LOCK).length).toBe(2);
  });

  it("RS-C3 — an invalid source with no draft renders the source status", async () => {
    installRailLocks();
    installStorageProbe();
    seed('["tasks","tasks"]');
    await mountHarness();
    expect(status()?.getAttribute("aria-label")).toBe("Saved sidebar order is unavailable. Review it.");
    expect(status()?.textContent).toContain("Order unavailable");
  });
});

describe("RS-P — the button and the panel", () => {
  it("RS-P1 — a native disclosure button toggles a labelled non-modal dialog without storage attempts", async () => {
    const { storage } = await failedDraft();
    const button = status()!;
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("rail-order-panel");
    expect(button.textContent).toContain("Order not saved");
    const from = storage.mark();
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const dialog = screen.getByRole("dialog", { name: "Sidebar order" });
    expect(dialog.id).toBe("rail-order-panel");
    expect(dialog.getAttribute("aria-modal")).toBeNull();
    expect(button.compareDocumentPosition(dialog) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(message()).toBe("Sidebar order was not saved.");
    expect(messageRole()).toBe("alert");
    expect(actionsShown()).toEqual(["retry", "discard", "export"]);
    expect(action("retry")!.getAttribute("aria-label")).toBe("Retry sidebar order");
    expect(action("discard")!.getAttribute("aria-label")).toBe("Discard sidebar order change");
    expect(action("export")!.getAttribute("aria-label")).toBe("Export sidebar order draft");
    fireEvent.click(button);
    expect(panel()).toBeNull();
    expect(storage.all(from)).toEqual([]);
  });

  it("RS-P2 — the source panel offers Reload only, in an alert", async () => {
    installRailLocks();
    installStorageProbe();
    seed("{}");
    await mountHarness();
    openPanel();
    expect(message()).toBe("Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.");
    expect(messageRole()).toBe("alert");
    expect(actionsShown()).toEqual(["reload"]);
    expect(action("reload")!.getAttribute("aria-label")).toBe("Reload sidebar order");
  });

  it("RS-P3 — Chinese wording", async () => {
    await failedDraft({ lang: "zh" });
    expect(status()?.getAttribute("aria-label")).toBe("侧栏顺序未保存，点击查看。");
    expect(status()?.textContent).toContain("顺序未保存");
    openPanel();
    expect(screen.getByRole("dialog", { name: "侧栏顺序" })).toBeTruthy();
    expect(message()).toBe("侧栏顺序未保存。");
    expect(action("retry")!.textContent).toBe("重试");
    expect(action("retry")!.getAttribute("aria-label")).toBe("重试 侧栏顺序");
    expect(action("discard")!.getAttribute("aria-label")).toBe("放弃 侧栏顺序更改");
    expect(action("export")!.getAttribute("aria-label")).toBe("导出侧栏顺序草稿");
  });

  it("RS-P4 — the status root sits in .topbar-controls before .topbar-pref", async () => {
    await failedDraft();
    const root = status()!.parentElement!;
    expect(root.classList.contains("rail-order-status")).toBe(true);
    expect(root.parentElement?.classList.contains("topbar-controls")).toBe(true);
    expect(root.nextElementSibling?.classList.contains("topbar-pref")).toBe(true);
  });
});

describe("RS-F — focus targets", () => {
  it("RS-F1 — a successful Retry unmounts the status and focuses .topbar-pref-trigger", async () => {
    const { quota } = await failedDraft();
    openPanel();
    quota.off();
    action("retry")!.focus();
    fireEvent.click(action("retry")!);
    await flush();
    expect(status()).toBeNull();
    expect(document.activeElement).toBe(prefTrigger());
  });

  it("RS-F2 — a failed Retry keeps focus on Retry; Export keeps focus on Export", async () => {
    await failedDraft();
    openPanel();
    action("retry")!.focus();
    fireEvent.click(action("retry")!);
    await flush();
    expect(document.activeElement?.getAttribute("data-testid")).toBe("rail-order-retry");
    stubObjectUrls(() => "blob:rail");
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    action("export")!.focus();
    fireEvent.click(action("export")!);
    expect(document.activeElement?.getAttribute("data-testid")).toBe("rail-order-export");
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it("RS-F3 — Discard unmounts the status and focuses .topbar-pref-trigger", async () => {
    await failedDraft();
    openPanel();
    action("discard")!.focus();
    fireEvent.click(action("discard")!);
    await flush();
    expect(status()).toBeNull();
    expect(document.activeElement).toBe(prefTrigger());
    expect(raw()).toBe(encode(REVERSED));
  });

  it("RS-F4 — Escape closes the panel and returns focus to the status button", async () => {
    await failedDraft();
    openPanel();
    action("discard")!.focus();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(status());
  });

  it("RS-F5 — an outside mousedown closes the panel; focus moves only when it was inside the panel", async () => {
    await failedDraft();
    const button = status()!;
    button.focus();
    fireEvent.click(button);
    fireEvent.mouseDown(document.querySelector(".app-main")!);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(button);
    openPanel();
    action("retry")!.focus();
    fireEvent.mouseDown(document.querySelector(".app-main")!);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(status());
  });
});

describe("RS-E — memory-only export", () => {
  it("RS-E1 — the set envelope with the full merged order, zero storage attempts, cleanup", async () => {
    const { storage } = await failedDraft();
    const blobs: Blob[] = [];
    const revoked = stubObjectUrls((blob) => { blobs.push(blob); return "blob:rail"; });
    const downloads: string[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { downloads.push(this.download); });
    openPanel();
    const from = storage.mark();
    fireEvent.click(action("export")!);
    expect(storage.all(from)).toEqual([]);
    expect(downloads).toEqual(["rail-order-draft.json"]);
    expect(revoked).toEqual(["blob:rail"]);
    expect(document.querySelectorAll("a[download]").length).toBe(0);
    const text = await readBlob(blobs[0]!);
    const moved = (() => { const next = [...REVERSED]; next.splice(0, 1); next.splice(3, 0, X); return next; })();
    expect(JSON.parse(text)).toStrictEqual({ version: 1, kind: "rail-order-draft", changes: { device: { railOrder: { operation: "set", value: moved } } } });
    expect(status()).not.toBeNull();
    expect(warns()).toBe(true);
    click.mockRestore();
  });

  it("RS-E2 — a setup failure shows the export error until the next panel action", async () => {
    await failedDraft();
    stubObjectUrls(() => { throw new Error("url"); });
    openPanel();
    fireEvent.click(action("export")!);
    expect(panel()!.textContent).toContain("Export failed. Please retry.");
    expect(status()).not.toBeNull();
    expect(warns()).toBe(true);
    fireEvent.click(action("retry")!);
    await flush();
    expect(panel()!.textContent).not.toContain("Export failed. Please retry.");
    expect(message()).toBe("Sidebar order was not saved.");
  });
});

describe("RS-U — unload warning and the sign-out step", () => {
  it("RS-U1 — no draft: confirmSignOut resolves true with zero confirm calls", async () => {
    installRailLocks();
    installStorageProbe();
    const view = await mountHarness();
    const confirm = vi.spyOn(window, "confirm");
    await expect(view.controller().confirmSignOut()).resolves.toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it("RS-U2 — a draft: Cancel keeps it; OK discards it with zero writes and removes the warning", async () => {
    const { view, storage } = await failedDraft();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    let result: boolean | undefined;
    await act(async () => { result = await view.controller().confirmSignOut(); });
    expect(result).toBe(false);
    expect(confirm.mock.calls).toEqual([["Your sidebar order change is not saved. Sign out and discard it?"]]);
    expect(status()).not.toBeNull();
    expect(warns()).toBe(true);
    confirm.mockReturnValue(true);
    const from = storage.mark();
    await act(async () => { result = await view.controller().confirmSignOut(); });
    await flush();
    expect(result).toBe(true);
    expect(storage.railWrites(from)).toEqual([]);
    expect(status()).toBeNull();
    expect(warns()).toBe(false);
    confirm.mockRestore();
  });

  it("RS-U3 — the Chinese sign-out confirmation", async () => {
    const { view } = await failedDraft({ lang: "zh" });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await act(async () => { await view.controller().confirmSignOut(); });
    expect(confirm.mock.calls).toEqual([["侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？"]]);
    confirm.mockRestore();
  });
});

describe("RS-T — Topbar slot", () => {
  it("RS-T1 — without a provider <RailOrderStatus /> renders nothing and the controls are unchanged", () => {
    const props = { lang: "en" as const, setLang: vi.fn(), theme: "light" as const, setTheme: vi.fn(), density: "comfortable" as const, setDensity: vi.fn(), onOpenSettings: vi.fn() };
    const first = render(<Topbar {...props} />);
    const before = first.container.querySelector(".topbar")!.outerHTML;
    first.unmount();
    const second = render(<Topbar {...props} railOrderStatus={<RailOrderStatus />} />);
    expect(second.container.querySelector(".topbar")!.outerHTML).toBe(before);
    expect(within(second.container).queryByTestId("rail-order-status")).toBeNull();
  });
});
