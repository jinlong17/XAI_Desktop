/**
 * AC-I18N-1..AC-I18N-4 — bilingual rendering via useI18n.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppearancePane } from "../AppearancePane.js";

describe("AppearancePane bilingual", () => {
  it("AC-I18N-1: lang='zh' shows Chinese strings in segmented controls", () => {
    render(<AppearancePane lang="zh" />);
    expect(screen.getByRole("button", { name: /简体中文/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /English/ })).toBeInTheDocument();
    // Density labels
    expect(screen.getByRole("button", { name: /舒适/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /紧凑/ })).toBeInTheDocument();
  });

  it("AC-I18N-2: lang='zh' renders Appearance i18n keys (accent / bg / sidebar)", () => {
    const { container } = render(<AppearancePane lang="zh" />);
    const labels = Array.from(container.querySelectorAll(".sr-label")).map((el) => el.textContent);
    expect(labels.some((l) => l?.includes("主题色"))).toBe(true);
    expect(labels.some((l) => l?.includes("背景"))).toBe(true);
    expect(labels.some((l) => l?.includes("侧栏"))).toBe(true);
  });

  it("AC-I18N-3: BG_TONES render zh names with lang='zh'; switch to en re-renders to en names", () => {
    const { rerender, container } = render(<AppearancePane lang="zh" />);
    const zhNames = Array.from(container.querySelectorAll(".bgt-name")).map((el) => el.textContent);
    expect(zhNames).toContain("鼠尾草");
    expect(zhNames).toContain("薄雾");

    rerender(<AppearancePane lang="en" />);
    const enNames = Array.from(container.querySelectorAll(".bgt-name")).map((el) => el.textContent);
    expect(enNames).toContain("Sage");
    expect(enNames).toContain("Mist");
  });

  it("AC-I18N-4: SettingsFooter is rendered with correct lang prop (chassis handles bilingual prompt)", () => {
    const { container } = render(<AppearancePane lang="zh" />);
    // Chassis SettingsFooter renders "恢复默认" for lang="zh"
    const resetBtn = container.querySelector("[data-testid='settings-footer-reset']");
    expect(resetBtn).not.toBeNull();
    // The button text changes to Chinese when lang="zh"
    expect(resetBtn?.textContent).toMatch(/恢复默认/);
  });
});
