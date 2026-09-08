/**
 * CountdownCardView.test.tsx — Tests CV1..CV6 + CV-extras + CV-fallback
 *
 * CV1: renders title (lang-correct)
 * CV2: renders days number
 * CV3: applies `cd-card light` class when variant=light (note: "light" variant = light class but "image" variant = no light class + "light" in className is NOT added)
 *      Wait: design.md says variant="image" is the gradient one; "light" variant is the plain one.
 *      The CSS class .cd-card.light is for the plain variant (variant="light").
 *      Actually re-reading CountdownCardView: isLight = card.variant === "image" — this is WRONG in the implementation.
 *      Let me re-check design.md §1.1:
 *      "image" — card uses a colored / gradient background ... "light" — card uses the default light panel background
 *      The ORIGINAL prototype: isLight = card.tone === "light" and it had background: card.bg for gradient cards.
 *      Looking at the CSS: .cd-card.light { border-color: transparent; color: #fff; } — this is for gradient cards.
 *      So the CSS class "light" applies to image/gradient cards. This is confusing naming but matches the prototype.
 *      In CountdownCardView: isLight = card.variant === "image" and we add .light class and the gradient bg.
 *      The variant="light" in our schema is the plain white card — NO .light class.
 *
 * CV3: variant="light" does NOT add ".light" class; variant="image" ADDS ".light" class
 * CV4: variant="image" applies inline background-image via preset lookup
 * CV5: past date shows "days since" label
 * CV6: click handler fires
 * CV-extras: NaN handling (shows "—")
 * CV-fallback: unknown preset falls back to IMAGE_PRESETS[0]
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CountdownCardView } from "../CountdownCardView.js";
import { FIXTURE_FUTURE, FIXTURE_PAST, FIXTURE_LIGHT } from "../__fixtures__/cards.js";
import { IMAGE_PRESETS } from "../internal/presets.js";

// System time is set to 2026-05-23 14:30 via vitest.setup.ts
// FIXTURE_FUTURE: target_date = "2026-05-30" → 7 days away
// FIXTURE_PAST: target_date = "2020-02-20" → far in the past
// FIXTURE_LIGHT: target_date = "2027-02-06" → in the future (variant=light)

describe("CountdownCardView", () => {
  it("CV1a: renders EN title when lang=en", () => {
    render(<CountdownCardView card={FIXTURE_FUTURE} lang="en" />);
    expect(screen.getByText("Weekend")).toBeInTheDocument();
  });

  it("CV1b: renders ZH title when lang=zh", () => {
    render(<CountdownCardView card={FIXTURE_FUTURE} lang="zh" />);
    expect(screen.getByText("周末")).toBeInTheDocument();
  });

  it("CV2: renders the days number", () => {
    render(<CountdownCardView card={FIXTURE_FUTURE} lang="en" />);
    // 2026-05-30 - 2026-05-23 = 7
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("CV3a: variant='image' adds .light class to .cd-card", () => {
    const { container } = render(<CountdownCardView card={FIXTURE_FUTURE} lang="en" />);
    const card = container.querySelector(".cd-card");
    expect(card?.classList.contains("light")).toBe(true);
  });

  it("CV3b: variant='light' does NOT add .light class to .cd-card", () => {
    const { container } = render(<CountdownCardView card={FIXTURE_LIGHT} lang="en" />);
    const card = container.querySelector(".cd-card");
    expect(card?.classList.contains("light")).toBe(false);
  });

  it("CV4: variant='image' applies backgroundImage style from preset lookup", () => {
    const { container } = render(<CountdownCardView card={FIXTURE_FUTURE} lang="en" />);
    const card = container.querySelector(".cd-card") as HTMLElement;
    expect(card.style.backgroundImage).toContain("gradient");
  });

  it("CV5: past date shows 'days since' label (EN)", () => {
    render(<CountdownCardView card={FIXTURE_PAST} lang="en" />);
    const foot = document.querySelector(".cd-foot");
    expect(foot?.textContent).toContain("Days since");
  });

  it("CV5b: past date shows 'days since' label (ZH)", () => {
    render(<CountdownCardView card={FIXTURE_PAST} lang="zh" />);
    const foot = document.querySelector(".cd-foot");
    expect(foot?.textContent).toContain("已过");
  });

  it("CV6: click handler fires", () => {
    const onClick = vi.fn();
    render(<CountdownCardView card={FIXTURE_FUTURE} lang="en" onClick={onClick} />);
    const card = document.querySelector(".cd-card") as HTMLElement;
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("CV-extras: NaN target_date renders '—' instead of a number", () => {
    const card = { ...FIXTURE_FUTURE, target_date: "invalid-date" };
    render(<CountdownCardView card={card} lang="en" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("CV-fallback: unknown preset cover_url falls back to IMAGE_PRESETS[0]", () => {
    // vitest.setup restores console mocks after each test
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const card = { ...FIXTURE_FUTURE, cover_url: "preset:unknown_preset_id" };
    const { container } = render(<CountdownCardView card={card} lang="en" />);
    const el = container.querySelector(".cd-card") as HTMLElement;
    // Should fall back to IMAGE_PRESETS[0].gradient (dusk)
    expect(el.style.backgroundImage).toContain(IMAGE_PRESETS[0]!.gradient);
    warnSpy.mockRestore();
  });
});
