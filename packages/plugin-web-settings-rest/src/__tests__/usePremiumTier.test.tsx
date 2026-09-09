import { accountScope } from "@repo/plugin-web-storage";
/**
 * PHK1..PHK6 — usePremiumTier hook (test.md §6 P1)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePremiumTier } from "../internal/usePremiumTier.js";
import { PREMIUM_TIER_TTL_MS } from "../internal/premiumTier.js";

describe("usePremiumTier", () => {
  it("PHK1: returns 'free' when no pref is stored (default)", () => {
    const { result } = renderHook(() => usePremiumTier());
    expect(result.current.effectiveTier).toBe("free");
  });

  it("PHK2: returns 'premium_stub' within 30-day window", () => {
    const now = Date.now();
    // string codec: store raw string value (no JSON quotes)
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_tier"), "premium_stub");
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_started_at"), String(now));

    const { result } = renderHook(() => usePremiumTier());
    expect(result.current.effectiveTier).toBe("premium_stub");
  });

  it("PHK3: returns 'free' when 30-day window has expired", () => {
    const thirtyOneDaysAgo = Date.now() - (PREMIUM_TIER_TTL_MS + 1000);
    // string codec: store raw string value (no JSON quotes)
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_tier"), "premium_stub");
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_started_at"), String(thirtyOneDaysAgo));

    const { result } = renderHook(() => usePremiumTier());
    expect(result.current.effectiveTier).toBe("free");
  });

  it("PHK4: returns 'pending' when tier is pending (transitional state)", () => {
    // string codec: store raw string value (no JSON quotes)
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_tier"), "pending");
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_started_at"), "0");

    const { result } = renderHook(() => usePremiumTier());
    expect(result.current.effectiveTier).toBe("pending");
  });

  it("PHK5: setTier updates the stored tier value", () => {
    const { result } = renderHook(() => usePremiumTier());
    expect(result.current.effectiveTier).toBe("free");

    act(() => {
      result.current.setStartedAt(Date.now());
      result.current.setTier("premium_stub");
    });

    expect(result.current.effectiveTier).toBe("premium_stub");
  });

  it("PHK6: setTier to 'free' resets from premium_stub", () => {
    const now = Date.now();
    // string codec: store raw string value (no JSON quotes)
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_tier"), "premium_stub");
    localStorage.setItem(accountScope.physicalKey("xai_pref_premium_started_at"), String(now));

    const { result } = renderHook(() => usePremiumTier());
    expect(result.current.effectiveTier).toBe("premium_stub");

    act(() => {
      result.current.setTier("free");
      result.current.setStartedAt(0);
    });

    expect(result.current.effectiveTier).toBe("free");
  });
});
