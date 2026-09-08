/**
 * PB-BANNER-1..3 — PremiumDisclosureBanner (test.md §6 P4)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PremiumDisclosureBanner } from "../internal/premiumDisclosureBanner.js";

describe("PremiumDisclosureBanner", () => {
  it("PB-BANNER-1: renders EN text", () => {
    render(<PremiumDisclosureBanner lang="en" />);
    expect(screen.getByTestId("premium-disclosure-banner")).toBeTruthy();
    expect(screen.getByText(/v1 Premium is a UX preview/)).toBeTruthy();
  });

  it("PB-BANNER-2: renders ZH text", () => {
    render(<PremiumDisclosureBanner lang="zh" />);
    expect(screen.getByText(/v1 高级版仅为 UX 演示/)).toBeTruthy();
  });

  it("PB-BANNER-3: no close/dismiss button — non-dismissible", () => {
    const { container } = render(<PremiumDisclosureBanner lang="en" />);
    const closeButtons = container.querySelectorAll('button[aria-label*="close"], button[aria-label*="dismiss"]');
    expect(closeButtons.length).toBe(0);
    // Also check no "×" or "close" text button
    const allButtons = container.querySelectorAll("button");
    expect(allButtons.length).toBe(0);
  });
});
