/**
 * PCANCEL-1..3 + PCANCEL-NO-FETCH-1 + PCANCEL-TOOLTIP-1 — PremiumCancelButton (test.md §6 P4)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PremiumCancelButton } from "../internal/premiumCancelButton.js";

describe("PremiumCancelButton", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("PCANCEL-1: renders null when effective tier is 'free'", () => {
    const { container } = render(<PremiumCancelButton lang="en" />);
    expect(container.querySelector("[data-testid='premium-cancel-btn']")).toBeNull();
  });

  it("PCANCEL-2: renders button when effective tier is 'premium_stub'", () => {
    localStorage.setItem("xai_pref_premium_tier", "premium_stub");
    localStorage.setItem("xai_pref_premium_started_at", String(Date.now()));
    render(<PremiumCancelButton lang="en" />);
    const btn = screen.queryByTestId("premium-cancel-btn");
    expect(btn).toBeTruthy();
  });

  it("PCANCEL-3: clicking Cancel flips tier back to 'free'", async () => {
    localStorage.setItem("xai_pref_premium_tier", "premium_stub");
    localStorage.setItem("xai_pref_premium_started_at", String(Date.now()));
    render(<PremiumCancelButton lang="en" />);
    const btn = screen.getByTestId("premium-cancel-btn");
    await act(async () => {
      fireEvent.click(btn);
    });
    const tierValue = localStorage.getItem("xai_pref_premium_tier");
    expect(tierValue).toBe("free");
  });

  it("PCANCEL-NO-FETCH-1: no fetch is called when Cancel is clicked", async () => {
    localStorage.setItem("xai_pref_premium_tier", "premium_stub");
    localStorage.setItem("xai_pref_premium_started_at", String(Date.now()));
    const fetchSpy = vi.spyOn(window, "fetch");
    render(<PremiumCancelButton lang="en" />);
    const btn = screen.getByTestId("premium-cancel-btn");
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("PCANCEL-TOOLTIP-1: Cancel button has a tooltip describing local-only behavior", () => {
    localStorage.setItem("xai_pref_premium_tier", "premium_stub");
    localStorage.setItem("xai_pref_premium_started_at", String(Date.now()));
    render(<PremiumCancelButton lang="en" />);
    const btn = screen.getByTestId("premium-cancel-btn");
    expect(btn.getAttribute("title")).toContain("billing.stripe.com");
  });
});
