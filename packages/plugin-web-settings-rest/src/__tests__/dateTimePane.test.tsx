/**
 * DT1..DT6 — dateTimePane tests (test.md §3 P2)
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { dateTimePane } from "../panes/dateTimePane.js";
import { getPref } from "@repo/plugin-web-storage";

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
});
