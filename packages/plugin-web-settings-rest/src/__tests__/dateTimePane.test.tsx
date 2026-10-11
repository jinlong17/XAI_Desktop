/**
 * DT1..DT6 — dateTimePane tests (test.md §3 P2)
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { dateTimePane } from "../panes/dateTimePane.js";
import { getPref } from "@repo/plugin-web-storage";
import { prefMutationLockName } from "../../../plugin-web-storage/src/internal/prefMutation.js";

beforeEach(() => {
  vi.stubGlobal("navigator", { locks: { request: async (_name: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) => (typeof optionsOrRun === "function" ? optionsOrRun as () => Promise<unknown> : maybeRun!)() } });
});
afterEach(() => vi.unstubAllGlobals());

describe("dateTimePane", () => {
  it("DT1: renders without error", () => {
    const { container } = render(dateTimePane.render({ lang: "en" }));
    expect(container.querySelector(".dt-pane")).toBeTruthy();
  });

  it("DT2: bilingual — EN labels", () => {
    render(dateTimePane.render({ lang: "en" }));
    expect(screen.getByText("Start week on")).toBeInTheDocument();
    expect(screen.getByText("Show Lunar Calendar")).toBeInTheDocument();
  });

  it("DT3: bilingual — ZH labels", () => {
    render(dateTimePane.render({ lang: "zh" }));
    expect(screen.getByText("周开始")).toBeInTheDocument();
    expect(screen.getByText("显示农历")).toBeInTheDocument();
  });

  it("DT4: start-week select has 3 options (monday/sunday/saturday)", () => {
    const { container } = render(dateTimePane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Start week on"]',
    );
    expect(sel).not.toBeNull();
    expect(sel!.options.length).toBe(3);
    const vals = Array.from(sel!.options).map((o) => o.value);
    expect(vals).toContain("monday");
    expect(vals).toContain("sunday");
    expect(vals).toContain("saturday");
  });

  it("DT5: changing start-week persists xai_pref_dt_start_week", async () => {
    const { container } = render(dateTimePane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Start week on"]',
    );
    fireEvent.change(sel!, { target: { value: "sunday" } });
    await waitFor(() => expect(getPref("xai_pref_dt_start_week")).toBe("sunday"));
  });

  it("DT6: toggling lunar flips xai_pref_dt_lunar", async () => {
    const { container } = render(dateTimePane.render({ lang: "en" }));
    expect(getPref("xai_pref_dt_lunar")).toBe(true);
    const toggle = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show Lunar Calendar"]',
    );
    fireEvent.click(toggle!);
    await waitFor(() => expect(getPref("xai_pref_dt_lunar")).toBe(false));
  });

  it("DT7: an actual draft never exposes source Reload for that same field", async () => {
    localStorage.setItem("xai_pref_dt_start_week", "invalid-week");
    try {
      const { container } = render(dateTimePane.render({ lang: "en" }));
      const select = container.querySelector<HTMLSelectElement>('select[aria-label="Start week on"]');
      fireEvent.change(select!, { target: { value: "sunday" } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Retry Start week on" })).toBeInTheDocument());
      expect(screen.queryByRole("button", { name: "Reload Start week on" })).toBeNull();
    } finally {
      localStorage.removeItem("xai_pref_dt_start_week");
    }
  });

  it("DT8: retry advances a failed predecessor without acknowledging the queued latest choice", async () => {
    let tail = Promise.resolve();
    function request<T>(_name: string, options: { mode?: string } | (() => T | Promise<T>), callback?: () => T | Promise<T>): Promise<T> {
      const run = typeof options === "function" ? options : callback!;
      const result = tail.then(() => run());
      tail = result.then(() => undefined, () => undefined);
      return result;
    }
    vi.stubGlobal("navigator", { locks: { request } });
    let release!: () => void;
    let entered!: () => void;
    const enteredLock = new Promise<void>(resolve => { entered = resolve; });
    const held = new Promise<void>(resolve => { release = resolve; });
    const key = "xai_pref_dt_start_week";
    void navigator.locks.request(prefMutationLockName(key), { mode: "exclusive" }, () => { entered(); return held; });
    await enteredLock;

    const nativeSet = Storage.prototype.setItem;
    let failSunday = true;
    let failSaturday = true;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, target: string, value: string) {
      if (target === key && ((value === "sunday" && failSunday) || (value === "saturday" && failSaturday))) throw new Error("quota");
      nativeSet.call(this, target, value);
    });
    const { container } = render(dateTimePane.render({ lang: "en" }));
    const select = container.querySelector<HTMLSelectElement>('select[aria-label="Start week on"]')!;
    fireEvent.change(select, { target: { value: "sunday" } });
    fireEvent.change(select, { target: { value: "saturday" } });
    release();
    await waitFor(() => expect(screen.getByRole("button", { name: "Retry Start week on" })).toBeInTheDocument());

    failSunday = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry Start week on" }));
    await waitFor(() => expect(localStorage.getItem(key)).toBe("sunday"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Export Date & Time draft" })).toBeInTheDocument());
    expect(select.value).toBe("saturday");

    failSaturday = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry Start week on" }));
    await waitFor(() => expect(localStorage.getItem(key)).toBe("saturday"));
    expect(screen.queryByRole("button", { name: "Export Date & Time draft" })).toBeNull();
  });
});
