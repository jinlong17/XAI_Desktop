/**
 * PT1..PT4 — Premium tier type + constants (test.md §6 P1)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect } from "vitest";
import { PREMIUM_TIER_TTL_MS } from "../internal/premiumTier.js";
import type { PremiumTier } from "../internal/premiumTier.js";

describe("premiumTier", () => {
  it("PT1: PREMIUM_TIER_TTL_MS is 30 days in milliseconds", () => {
    expect(PREMIUM_TIER_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("PT2: PremiumTier type accepts 'free'", () => {
    const tier: PremiumTier = "free";
    expect(tier).toBe("free");
  });

  it("PT3: PremiumTier type accepts 'pending'", () => {
    const tier: PremiumTier = "pending";
    expect(tier).toBe("pending");
  });

  it("PT4: PremiumTier type accepts 'premium_stub'", () => {
    const tier: PremiumTier = "premium_stub";
    expect(tier).toBe("premium_stub");
  });
});
