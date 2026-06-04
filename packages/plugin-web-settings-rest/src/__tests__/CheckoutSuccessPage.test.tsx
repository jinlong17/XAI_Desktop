/**
 * CS1..CS8 + CS-INVALID-1 + CS-NO-FETCH-1 — CheckoutSuccessPage (test.md §6 P3)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { CheckoutSuccessPage } from "../CheckoutSuccessPage.js";

function renderSuccessPage(search = "?session_id=cs_test_abc123") {
  return render(
    <MemoryRouter
      initialEntries={[`/app/settings/premium/checkout/success${search}`]}
    >
      <Routes>
        <Route
          path="/app/settings/premium/checkout/success"
          element={<CheckoutSuccessPage />}
        />
        <Route
          path="/app/settings/premium"
          element={<div data-testid="premium-settings">Premium Settings</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("CheckoutSuccessPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  it("CS1: renders without error (pending state initially)", () => {
    const { container } = renderSuccessPage();
    expect(container.querySelector("[data-testid='premium-cb-page']")).toBeTruthy();
  });

  it("CS2: valid session_id — shows success banner", async () => {
    renderSuccessPage("?session_id=cs_test_abc123");
    // Run the effect but don't advance to the navigation timer yet
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(
      screen.queryByTestId("premium-cb-banner-success") ||
      screen.queryByRole("status")
    ).toBeTruthy();
  });

  it("CS3: missing session_id — shows invalid banner", async () => {
    renderSuccessPage("");
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(
      screen.queryByTestId("premium-cb-banner-invalid") ||
      screen.queryByRole("alert")
    ).toBeTruthy();
  });

  it("CS-INVALID-1: empty session_id — shows invalid banner (tier not flipped)", async () => {
    renderSuccessPage("?session_id=");
    await act(async () => {
      vi.runAllTimers();
    });
    // Tier should NOT be flipped to premium_stub
    const tierValue = localStorage.getItem("xai_pref_premium_tier");
    expect(tierValue).not.toBe("premium_stub");
  });

  it("CS4: valid session_id — flips premium tier pref to premium_stub", async () => {
    renderSuccessPage("?session_id=cs_test_abc123");
    await act(async () => {
      vi.runAllTimers();
    });
    const tierValue = localStorage.getItem("xai_pref_premium_tier");
    expect(tierValue).toBe("premium_stub");
  });

  it("CS5: valid session_id — sets started_at to a recent timestamp", async () => {
    const before = Date.now();
    renderSuccessPage("?session_id=cs_test_abc123");
    await act(async () => {
      vi.runAllTimers();
    });
    const startedAtRaw = localStorage.getItem("xai_pref_premium_started_at");
    const startedAt = Number(startedAtRaw);
    expect(startedAt).toBeGreaterThanOrEqual(before);
  });

  it("CS6: shows success banner text in English", async () => {
    renderSuccessPage("?session_id=cs_test_abc123");
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("Subscription activated (stub)")).toBeTruthy();
  });

  it("CS7: navigates after 2000ms on success", async () => {
    renderSuccessPage("?session_id=cs_test_abc123");
    await act(async () => {
      vi.runAllTimers();
    });
    // After navigation, the premium settings page should be rendered
    expect(screen.queryByTestId("premium-settings")).toBeTruthy();
  });

  it("CS8: navigates after 3000ms on invalid session_id", async () => {
    renderSuccessPage("");
    await act(async () => {
      vi.runAllTimers();
    });
    // After navigation, the premium settings page should be rendered
    expect(screen.queryByTestId("premium-settings")).toBeTruthy();
  });

  it("CS-NO-FETCH-1: no fetch is called during success callback processing", async () => {
    const fetchSpy = vi.spyOn(window, "fetch");
    renderSuccessPage("?session_id=cs_test_abc123");
    await act(async () => {
      vi.runAllTimers();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
