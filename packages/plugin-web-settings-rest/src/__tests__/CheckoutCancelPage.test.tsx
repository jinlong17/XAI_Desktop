/**
 * CC1..CC4 + CC-DIRECT-1 + CC-NO-FETCH-1 — CheckoutCancelPage (test.md §6 P3)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { CheckoutCancelPage } from "../CheckoutCancelPage.js";

function renderCancelPage() {
  return render(
    <MemoryRouter
      initialEntries={["/app/settings/premium/checkout/cancel"]}
    >
      <Routes>
        <Route
          path="/app/settings/premium/checkout/cancel"
          element={<CheckoutCancelPage />}
        />
        <Route
          path="/app/settings/premium"
          element={<div data-testid="premium-settings">Premium Settings</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("CheckoutCancelPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  it("CC1: renders without error", () => {
    const { container } = renderCancelPage();
    expect(container.querySelector("[data-testid='premium-cb-page']")).toBeTruthy();
  });

  it("CC2: shows cancelled banner text", async () => {
    renderCancelPage();
    // Run the effect but don't advance to the navigation timer yet
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("Checkout cancelled — tier unchanged")).toBeTruthy();
  });

  it("CC3: navigates after 3000ms", async () => {
    renderCancelPage();
    await act(async () => {
      vi.runAllTimers();
    });
    // After navigation, the premium settings page should be rendered
    expect(screen.queryByTestId("premium-settings")).toBeTruthy();
  });

  it("CC4: tier is NOT changed (idempotent — no pref mutation)", async () => {
    // Set premium_stub before rendering cancel page
    localStorage.setItem("xai_pref_premium_tier", "premium_stub");
    renderCancelPage();
    await act(async () => {
      vi.runAllTimers();
    });
    // Tier should remain premium_stub — cancel page must not touch it
    const tierValue = localStorage.getItem("xai_pref_premium_tier");
    expect(tierValue).toBe("premium_stub");
  });

  it("CC-DIRECT-1: visiting cancel route directly without prior Upgrade is idempotent", async () => {
    // No prior pref set — tier defaults to "free"
    renderCancelPage();
    await act(async () => {
      vi.runAllTimers();
    });
    // No tier mutation should have occurred
    const tierValue = localStorage.getItem("xai_pref_premium_tier");
    expect(tierValue).toBeNull(); // Key was never set
  });

  it("CC-NO-FETCH-1: no fetch is called during cancel page rendering", async () => {
    const fetchSpy = vi.spyOn(window, "fetch");
    renderCancelPage();
    await act(async () => {
      vi.runAllTimers();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
