/**
 * PUB-1..PUB-4 + PUB-NO-FETCH-1 — PremiumUpgradeButton (test.md §6 P2)
 *
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PremiumUpgradeButton } from "../internal/premiumUpgradeButton.js";

// Mock window.location.assign
const mockAssign = vi.fn();
Object.defineProperty(window, "location", {
  value: { ...window.location, assign: mockAssign },
  writable: true,
  configurable: true,
});

describe("PremiumUpgradeButton", () => {
  beforeEach(() => {
    mockAssign.mockClear();
  });

  it("PUB-1: renders enabled button and calls window.location.assign when env var is set", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "https://buy.stripe.com/test_abc123");
    render(<PremiumUpgradeButton lang="en" />);
    const btn = screen.getByTestId("premium-upgrade-btn");
    expect(btn).toBeTruthy();
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(btn);
    expect(mockAssign).toHaveBeenCalledWith("https://buy.stripe.com/test_abc123");
    vi.unstubAllEnvs();
  });

  it("PUB-2: renders disabled button with tooltip when env var is not set", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "");
    render(<PremiumUpgradeButton lang="en" />);
    const btn = screen.getByTestId("premium-upgrade-btn-disabled");
    expect(btn).toBeTruthy();
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(btn);
    expect(mockAssign).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("PUB-3: bilingual — EN shows 'Upgrade Now'", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "https://buy.stripe.com/test_abc123");
    render(<PremiumUpgradeButton lang="en" />);
    expect(screen.getByText("Upgrade Now")).toBeTruthy();
    vi.unstubAllEnvs();
  });

  it("PUB-4: bilingual — ZH shows '立即升级'", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "https://buy.stripe.com/test_abc123");
    render(<PremiumUpgradeButton lang="zh" />);
    expect(screen.getByText("立即升级")).toBeTruthy();
    vi.unstubAllEnvs();
  });

  it("PUB-NO-FETCH-1: no fetch is called during Upgrade click", () => {
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "https://buy.stripe.com/test_abc123");
    const fetchSpy = vi.spyOn(window, "fetch");
    render(<PremiumUpgradeButton lang="en" />);
    const btn = screen.getByTestId("premium-upgrade-btn");
    fireEvent.click(btn);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });
});
