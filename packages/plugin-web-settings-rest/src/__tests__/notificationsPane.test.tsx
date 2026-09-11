/**
 * NF1..NF9 — notificationsPane tests (test.md §3 P2)
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { notificationsPane } from "../panes/notificationsPane.js";
import { getPref } from "@repo/plugin-web-storage";

beforeEach(() => {
  vi.stubGlobal("navigator", { locks: { request: async (_name: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) => (typeof optionsOrRun === "function" ? optionsOrRun as () => Promise<unknown> : maybeRun!)() } });
});
afterEach(() => vi.unstubAllGlobals());

describe("notificationsPane", () => {
  it("NF1: renders without error", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    expect(container.querySelector(".notif-pane")).toBeTruthy();
  });

  it("NF2: bilingual — EN labels", () => {
    render(notificationsPane.render({ lang: "en" }));
    expect(screen.getByText("Enable notifications")).toBeInTheDocument();
    expect(screen.getByText("Enable quiet hours")).toBeInTheDocument();
  });

  it("NF3: bilingual — ZH labels", () => {
    render(notificationsPane.render({ lang: "zh" }));
    expect(screen.getByText("启用通知")).toBeInTheDocument();
    expect(screen.getByText("启用勿扰")).toBeInTheDocument();
  });

  it("NF4: time-range inputs are hidden when quiet=false (default)", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const timeInputs = container.querySelectorAll('input[type="time"]');
    expect(timeInputs.length).toBe(0);
  });

  it("NF5: enabling quiet hours shows time inputs", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const quietToggle = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Enable quiet hours"]',
    );
    expect(quietToggle).not.toBeNull();
    fireEvent.click(quietToggle!);
    const timeInputs = container.querySelectorAll('input[type="time"]');
    expect(timeInputs.length).toBe(2);
  });

  it("NF6: toggling enabled toggle flips xai_pref_notif_enabled pref", async () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    expect(getPref("xai_pref_notif_enabled")).toBe(true);
    const toggle = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Enable notifications"]',
    );
    fireEvent.click(toggle!);
    await waitFor(() => expect(getPref("xai_pref_notif_enabled")).toBe(false));
  });

  it("NF7: sound select has 5 options (none/subtle/chime/bell/pop)", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Sound"]',
    );
    expect(sel).not.toBeNull();
    expect(sel!.options.length).toBe(5);
  });

  it("NF8: changing sound select persists xai_pref_notif_done_sound", async () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Sound"]',
    );
    fireEvent.change(sel!, { target: { value: "chime" } });
    await waitFor(() => expect(getPref("xai_pref_notif_done_sound")).toBe("chime"));
  });

  it("NF9: pane id, icon, i18nKey are correct", () => {
    expect(notificationsPane.id).toBe("notifications");
    expect(notificationsPane.icon).toBe("bell");
    expect(notificationsPane.i18nKey).toBe("settings.notifications");
  });

  it("NF10: a failed hidden quiet-start draft stays recoverable until its own Retry succeeds", async () => {
    const guardRef: { current: { isBlocking: () => boolean } | null } = { current: null };
    const nativeSet = Storage.prototype.setItem;
    const failure = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "xai_pref_notif_quiet_start") throw new Error("quota");
      nativeSet.call(this, key, value);
    });
    const { container } = render(notificationsPane.render({ lang: "en", registerDepartureGuard: next => { guardRef.current = next; return () => {}; } }));
    fireEvent.click(container.querySelector<HTMLButtonElement>('button[aria-label="Enable quiet hours"]')!);
    await waitFor(() => expect(container.querySelectorAll('input[type="time"]')).toHaveLength(2));
    fireEvent.change(screen.getByLabelText("Quiet hours start"), { target: { value: "23:15" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Retry Quiet hours start" })).toBeInTheDocument());
    fireEvent.click(container.querySelector<HTMLButtonElement>('button[aria-label="Enable quiet hours"]')!);
    await waitFor(() => expect(container.querySelectorAll('input[type="time"]')).toHaveLength(0));
    expect(guardRef.current?.isBlocking()).toBe(true);
    expect(screen.getByRole("button", { name: "Export Notifications draft" })).toBeInTheDocument();
    failure.mockRestore();
    fireEvent.click(screen.getByRole("button", { name: "Retry Quiet hours start" }));
    await waitFor(() => expect(getPref("xai_pref_notif_quiet_start")).toBe("23:15"));
    await waitFor(() => expect(guardRef.current?.isBlocking()).toBe(false));
  });
});
