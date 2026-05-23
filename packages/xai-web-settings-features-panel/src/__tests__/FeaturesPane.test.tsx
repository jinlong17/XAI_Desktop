/**
 * AC-PANE-1..AC-PANE-6 (test.md §A3).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeaturesPane } from "../FeaturesPane.js";
import { featureIdOrder } from "../featureIds.js";
import { getPref, setPref } from "@repo/plugin-web-storage";

beforeEach(() => {
  // SettingsFooter uses window.confirm for the Reset path; jsdom does not
  // implement it. Stub to always confirm.
  vi.spyOn(window, "confirm").mockImplementation(() => true);
});

describe("FeaturesPane", () => {
  it("AC-PANE-1: renders 8 feature cards in featureIdOrder", () => {
    const { container } = render(<FeaturesPane lang="en" />);
    const cards = container.querySelectorAll<HTMLElement>("[data-feature-id]");
    expect(cards.length).toBe(8);
    expect(Array.from(cards).map((c) => c.dataset["featureId"])).toEqual([
      ...featureIdOrder,
    ]);
  });

  it("AC-PANE-2: each row shows the nav.<id> i18n label (EN)", () => {
    render(<FeaturesPane lang="en" />);
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Boards")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Meditation")).toBeInTheDocument();
  });

  it("AC-PANE-3: clicking a Toggle flips the underlying pref", () => {
    const { container } = render(<FeaturesPane lang="en" />);
    const boardCard = container.querySelector<HTMLElement>(
      '[data-feature-id="board"]',
    );
    expect(boardCard).not.toBeNull();
    // Find the toggle (rendered by @repo/plugin-web-settings-shell — locate by aria-label prefix).
    const toggle = boardCard!.querySelector<HTMLElement>(
      'button[aria-label^="Boards"], [role="switch"][aria-label^="Boards"]',
    );
    expect(toggle, "toggle button must exist").not.toBeNull();
    expect(getPref("xai_pref_features_board")).toBe(true);
    fireEvent.click(toggle!);
    expect(getPref("xai_pref_features_board")).toBe(false);
  });

  it("AC-PANE-4: renders 8 distinct FeatureThumb SVGs (no img/network)", () => {
    const { container } = render(<FeaturesPane lang="en" />);
    const svgs = container.querySelectorAll<SVGElement>("svg[data-thumb-kind]");
    expect(svgs.length).toBe(8);
    const kinds = Array.from(svgs).map((s) => s.getAttribute("data-thumb-kind"));
    expect(new Set(kinds).size).toBe(8);
    // No <img> tags.
    expect(container.querySelectorAll("img").length).toBe(0);
  });

  it("AC-PANE-5: bilingual — lang='zh' shows Chinese strings", () => {
    render(<FeaturesPane lang="zh" />);
    expect(screen.getByText("任务")).toBeInTheDocument();
    expect(screen.getByText("项目板")).toBeInTheDocument();
    expect(screen.getByText("冥想")).toBeInTheDocument();
  });

  it("AC-PANE-6: SettingsFooter Reset restores all 8 prefs to true", () => {
    // Pre-flip 3 prefs to false.
    setPref("xai_pref_features_board", false);
    setPref("xai_pref_features_calendar", false);
    setPref("xai_pref_features_pomodoro", false);
    expect(getPref("xai_pref_features_board")).toBe(false);

    render(<FeaturesPane lang="en" />);
    // The Reset button is rendered by SettingsFooter — locate by EN label "Reset to defaults".
    const reset = screen.getByRole("button", { name: /reset to defaults/i });
    fireEvent.click(reset);

    // After reset: keys removed → readback returns default (true).
    expect(getPref("xai_pref_features_board")).toBe(true);
    expect(getPref("xai_pref_features_calendar")).toBe(true);
    expect(getPref("xai_pref_features_pomodoro")).toBe(true);
  });
});
