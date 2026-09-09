import { accountScope } from "@repo/plugin-web-storage";
/**
 * PCB-1..2 — PremiumTierBadge (test.md §6 P4)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PremiumTierBadge } from "../internal/PremiumTierBadge.js";

describe("PremiumTierBadge", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("PCB-1: renders 'Premium (stub)' badge when effective tier is premium_stub", () => {
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_tier"), "premium_stub");
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_started_at"), String(Date.now()));
    render(<PremiumTierBadge lang="en" />);
    const badge = screen.getByTestId("premium-tier-badge");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("Premium (stub)");
  });

  it("PCB-2: returns null (no rendering) when effective tier is 'free'", () => {
    const { container } = render(<PremiumTierBadge lang="en" />);
    expect(container.querySelector("[data-testid='premium-tier-badge']")).toBeNull();
  });
});
