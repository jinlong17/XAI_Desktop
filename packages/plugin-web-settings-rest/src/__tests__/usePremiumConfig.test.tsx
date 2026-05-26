/**
 * PC-CONFIG-1..3 — usePremiumConfig hook (test.md §6 P1)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect, vi } from "vitest";
import { usePremiumConfig } from "../internal/usePremiumConfig.js";

describe("usePremiumConfig", () => {
  it("PC-CONFIG-1: returns configured=true and paymentLinkUrl when env var is set", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "https://buy.stripe.com/test_abc123");
    const config = usePremiumConfig();
    expect(config.configured).toBe(true);
    expect(config.paymentLinkUrl).toBe("https://buy.stripe.com/test_abc123");
    vi.unstubAllEnvs();
  });

  it("PC-CONFIG-2: returns configured=false and paymentLinkUrl=null when env var is empty", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "");
    const config = usePremiumConfig();
    expect(config.configured).toBe(false);
    expect(config.paymentLinkUrl).toBeNull();
    vi.unstubAllEnvs();
  });

  it("PC-CONFIG-3: returns configured=false when env var is whitespace only", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "   ");
    const config = usePremiumConfig();
    expect(config.configured).toBe(false);
    expect(config.paymentLinkUrl).toBeNull();
    vi.unstubAllEnvs();
  });
});
