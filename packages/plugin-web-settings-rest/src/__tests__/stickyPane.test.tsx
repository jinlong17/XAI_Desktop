/**
 * ST1..ST10 — stickyPane tests (test.md §3 P3)
 */
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { stickyPane } from "../panes/stickyPane.js";
import { getPref } from "@repo/plugin-web-storage";
import { createSmartListsLockManager } from "./smartListsLockFixture.js";

// jsdom has no Web Locks; the Sticky writes hold the real per-key lock.
beforeEach(() => {
  Object.defineProperty(navigator, "locks", { configurable: true, value: createSmartListsLockManager() });
});
afterEach(() => {
  delete (navigator as unknown as { locks?: unknown }).locks;
});

describe("stickyPane", () => {
  it("ST1: renders without error", () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    expect(container.querySelector(".sticky-pane")).toBeTruthy();
  });

  it("ST2: 13 color swatch buttons rendered", () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    const swatches = container.querySelectorAll(".sn-sw");
    expect(swatches.length).toBe(13);
  });

  it("ST3: 12 non-random swatches use var(--sticky-note-color-<id>) background", () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    const swatches = container.querySelectorAll<HTMLButtonElement>("[data-color-id]");
    const nonRandom = Array.from(swatches).filter(
      (s) => s.dataset["colorId"] !== "random",
    );
    expect(nonRandom.length).toBe(12);
    for (const swatch of nonRandom) {
      const id = swatch.dataset["colorId"];
      expect(swatch.style.background).toContain(`var(--sticky-note-color-${id})`);
    }
  });

  it("ST4: random swatch uses conic-gradient", () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    const randomSwatch = container.querySelector<HTMLButtonElement>(
      '[data-color-id="random"]',
    );
    expect(randomSwatch).not.toBeNull();
    expect(randomSwatch!.style.background).toContain("conic-gradient");
  });

  it("ST5: no hex literals in swatch inline styles", () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    const swatches = container.querySelectorAll<HTMLButtonElement>("[data-color-id]");
    for (const swatch of Array.from(swatches)) {
      expect(swatch.style.background).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    }
  });

  it("ST6: clicking a swatch persists xai_pref_sticky_color", async () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    const mintSwatch = container.querySelector<HTMLButtonElement>(
      '[data-color-id="mint"]',
    );
    expect(mintSwatch).not.toBeNull();
    fireEvent.click(mintSwatch!);
    await waitFor(() => expect(getPref("xai_pref_sticky_color")).toBe("mint"));
  });

  it("ST7: 4 spacing buttons rendered", () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    const spacingBtns = container.querySelectorAll(".sn-sp");
    expect(spacingBtns.length).toBe(4);
  });

  it("ST8: clicking a spacing button persists xai_pref_sticky_grid_spacing", async () => {
    const { container } = render(stickyPane.render({ lang: "en" }));
    const xlBtn = container.querySelector<HTMLButtonElement>(
      '[data-spacing-id="xl"]',
    );
    expect(xlBtn).not.toBeNull();
    fireEvent.click(xlBtn!);
    await waitFor(() => expect(getPref("xai_pref_sticky_grid_spacing")).toBe("xl"));
  });

  it("ST9: bilingual — ZH font size options", () => {
    render(stickyPane.render({ lang: "zh" }));
    expect(screen.getByText("默认颜色")).toBeInTheDocument();
    expect(screen.getByText("字体大小")).toBeInTheDocument();
    expect(screen.getByText("默认网格间距")).toBeInTheDocument();
  });

  it("ST10: pane id, icon, i18nKey are correct", () => {
    expect(stickyPane.id).toBe("sticky");
    expect(stickyPane.icon).toBe("pin");
    expect(stickyPane.i18nKey).toBe("settings.sticky");
  });
});
