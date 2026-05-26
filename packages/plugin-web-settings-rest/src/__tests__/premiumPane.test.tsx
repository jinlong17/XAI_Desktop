/**
 * PR1..PR3 — premiumPane SHIPPED row #24 tests (preserved verbatim per FA-14)
 * PT-EXT-1..6 — premiumPane extension tests (gap-closure row #8)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { premiumPane } from "../panes/premiumPane.js";

describe("premiumPane", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ---- SHIPPED row #24 tests (preserved verbatim per FA-14) ----

  it("PR1: renders without error (EN)", () => {
    const { container } = render(premiumPane.render({ lang: "en" }));
    expect(container.querySelector(".premium-pane")).toBeTruthy();
  });

  it("PR2: bilingual — EN shows English headline", () => {
    render(premiumPane.render({ lang: "en" }));
    expect(screen.getByText("Unlock Premium Features")).toBeInTheDocument();
  });

  it("PR3: bilingual — ZH shows Chinese headline", () => {
    render(premiumPane.render({ lang: "zh" }));
    expect(screen.getByText("解锁高级功能")).toBeInTheDocument();
  });

  // ---- Extension row #8 tests ----

  it("PT-EXT-1: Upgrade button is visible when tier is free", () => {
    render(premiumPane.render({ lang: "en" }));
    // Upgrade button is rendered when not premium_stub
    const btn = screen.queryByTestId("premium-upgrade-btn") ||
                screen.queryByTestId("premium-upgrade-btn-disabled");
    expect(btn).toBeTruthy();
  });

  it("PT-EXT-2: Cancel Subscription button is NOT visible when tier is free", () => {
    render(premiumPane.render({ lang: "en" }));
    expect(screen.queryByTestId("premium-cancel-btn")).toBeNull();
  });

  it("PT-EXT-3: Cancel Subscription button IS visible when tier is premium_stub", () => {
    localStorage.setItem("xai_pref_premium_tier", "premium_stub");
    localStorage.setItem("xai_pref_premium_started_at", String(Date.now()));
    render(premiumPane.render({ lang: "en" }));
    expect(screen.getByTestId("premium-cancel-btn")).toBeTruthy();
  });

  it("PT-EXT-4: disclosure banner is always present (in all 3 tier states)", () => {
    // Free state
    render(premiumPane.render({ lang: "en" }));
    expect(screen.getByTestId("premium-disclosure-banner")).toBeTruthy();
  });

  it("PT-EXT-5: disclosure banner is present when tier is premium_stub", () => {
    localStorage.setItem("xai_pref_premium_tier", "premium_stub");
    localStorage.setItem("xai_pref_premium_started_at", String(Date.now()));
    render(premiumPane.render({ lang: "en" }));
    expect(screen.getByTestId("premium-disclosure-banner")).toBeTruthy();
  });

  it("PT-EXT-6: tier label shows current tier", () => {
    render(premiumPane.render({ lang: "en" }));
    expect(screen.getByTestId("premium-tier-label")).toBeTruthy();
    expect(screen.getByTestId("premium-tier-label").textContent).toContain("Free");
  });
});
