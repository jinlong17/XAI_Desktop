import { accountScope } from "@repo/plugin-web-storage";
/**
 * IN1..IN6 (PRESERVED) + IN-EXT-1..IN-EXT-12 — integrationsPane tests
 * (test.md §3 P2 + §5.3 P4)
 *
 * Note: IN1 now expects ≥17 cards (not strictly 17), because the wired-provider
 * cards in the placeholder groups can be filtered when connected. The placeholder
 * grid total is still 17 when all 3 are disconnected.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { integrationsPane } from "../panes/integrationsPane.js";
import * as eventBus from "@repo/xai-web-event-bus";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("integrationsPane — SHIPPED baseline (IN1..IN6)", () => {
  it("IN1: renders 17 integration cards in the placeholder grids (all 3 providers disconnected)", () => {
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const cards = container.querySelectorAll(".int-card");
    // 3 + 10 + 4 = 17 placeholder cards when all wired providers are disconnected
    expect(cards.length).toBe(17);
  });

  it("IN2: renders 3 placeholder section headers", () => {
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const headers = container.querySelectorAll(".int-h");
    // 4 total: "Connected providers" + "Featured" + "Calendar" + "Integrate"
    expect(headers.length).toBeGreaterThanOrEqual(3);
    // At minimum the 3 original groups are present
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Integrate")).toBeInTheDocument();
  });

  it("IN3: bilingual — EN section headers", () => {
    render(integrationsPane.render({ lang: "en" }));
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Integrate")).toBeInTheDocument();
  });

  it("IN4: bilingual — ZH section headers", () => {
    render(integrationsPane.render({ lang: "zh" }));
    expect(screen.getByText("精选")).toBeInTheDocument();
    expect(screen.getByText("日历")).toBeInTheDocument();
    expect(screen.getByText("集成")).toBeInTheDocument();
  });

  it("IN5: clicking a placeholder card is a no-op — does not throw and does not call console.warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const firstCard = container.querySelector<HTMLButtonElement>(".int-card");
    expect(firstCard).not.toBeNull();
    expect(() => fireEvent.click(firstCard!)).not.toThrow();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("IN6: clicking placeholder cards does NOT emit any event via emitWebEvent", () => {
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const cards = container.querySelectorAll<HTMLButtonElement>(".int-card");
    for (const card of Array.from(cards)) {
      fireEvent.click(card);
    }
    expect(emitSpy).not.toHaveBeenCalled();
  });
});

describe("integrationsPane — Extension tests (IN-EXT-1..IN-EXT-12)", () => {
  it("IN-EXT-1: 'Connected providers' section renders above the existing 3 groups", () => {
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const headers = Array.from(container.querySelectorAll(".int-h"));
    const texts = headers.map((h) => h.textContent?.trim());
    // "Connected providers" should be before "Featured"
    const connectedIdx = texts.indexOf("Connected providers");
    const featuredIdx = texts.indexOf("Featured");
    expect(connectedIdx).toBeGreaterThanOrEqual(0);
    expect(connectedIdx).toBeLessThan(featuredIdx);
  });

  it("IN-EXT-2: 3 Connect buttons render when all 3 prefs are false", () => {
    render(integrationsPane.render({ lang: "en" }));
    const connectBtns = screen.getAllByRole("button", { name: /Connect/i });
    // 3 connect buttons for notion, gcal, linear
    expect(connectBtns.filter((b) => b.textContent?.trim() === "Connect").length).toBe(3);
  });

  it("IN-EXT-3: flipping a pref to true renders Disconnect button + 'Connected (stub)' badge", () => {
    // Pre-set notion as connected
    localStorage.setItem(accountScope.physicalKey("xai_pref_integrations_connected_notion"), "true");
    render(integrationsPane.render({ lang: "en" }));
    // Should have a Disconnect button for notion
    expect(screen.getByRole("button", { name: /Disconnect Notion/i })).toBeInTheDocument();
    // Should have the "Connected (stub)" badge
    expect(screen.getByText("Connected (stub)")).toBeInTheDocument();
  });

  it("IN-EXT-4: stub disclosure banner renders at top of pane (EN)", () => {
    render(integrationsPane.render({ lang: "en" }));
    expect(screen.getByTestId("int-stub-banner")).toBeInTheDocument();
    expect(
      screen.getByText(/v1 stub mode/i),
    ).toBeInTheDocument();
  });

  it("IN-EXT-5: stub disclosure banner renders at top of pane (ZH)", () => {
    render(integrationsPane.render({ lang: "zh" }));
    expect(screen.getByTestId("int-stub-banner")).toBeInTheDocument();
    expect(
      screen.getByText(/v1 演示模式/),
    ).toBeInTheDocument();
  });

  it("IN-EXT-6: banner is not dismissible — no close button inside the banner", () => {
    render(integrationsPane.render({ lang: "en" }));
    const banner = screen.getByTestId("int-stub-banner");
    const closeBtn = banner.querySelector("[aria-label*='close'], [aria-label*='dismiss'], button");
    expect(closeBtn).toBeNull();
  });

  it("IN-EXT-7: provider labels bilingual (EN)", () => {
    render(integrationsPane.render({ lang: "en" }));
    // Provider labels appear in the connected section (and also in placeholder grids)
    const notionEls = screen.getAllByText("Notion");
    expect(notionEls.length).toBeGreaterThanOrEqual(1);
    const gcalEls = screen.getAllByText("Google Calendar");
    expect(gcalEls.length).toBeGreaterThanOrEqual(1);
    const linearEls = screen.getAllByText("Linear");
    expect(linearEls.length).toBeGreaterThanOrEqual(1);
  });

  it("IN-EXT-8: clicking Disconnect flips pref back to false", () => {
    localStorage.setItem(accountScope.physicalKey("xai_pref_integrations_connected_notion"), "true");
    render(integrationsPane.render({ lang: "en" }));
    const disconnectBtn = screen.getByRole("button", { name: /Disconnect Notion/i });
    fireEvent.click(disconnectBtn);
    const stored = localStorage.getItem(accountScope.physicalKey("xai_pref_integrations_connected_notion"));
    expect(stored).toBe("false");
  });

  it("IN-EXT-9: clicking Disconnect emits web:settings:integration-disconnected exactly once", () => {
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");
    localStorage.setItem(accountScope.physicalKey("xai_pref_integrations_connected_notion"), "true");
    render(integrationsPane.render({ lang: "en" }));
    const disconnectBtn = screen.getByRole("button", { name: /Disconnect Notion/i });
    fireEvent.click(disconnectBtn);
    const disconnectCalls = emitSpy.mock.calls.filter(
      (c) => c[0] === "web:settings:integration-disconnected",
    );
    expect(disconnectCalls.length).toBe(1);
    expect(disconnectCalls[0]![1]).toMatchObject({ providerId: "notion" });
  });

  it("IN-EXT-10: Disconnect tooltip mentions provider's account settings", () => {
    localStorage.setItem(accountScope.physicalKey("xai_pref_integrations_connected_linear"), "true");
    render(integrationsPane.render({ lang: "en" }));
    const disconnectBtn = screen.getByRole("button", { name: /Disconnect Linear/i });
    expect(disconnectBtn.getAttribute("title")).toContain("provider's account settings");
  });

  it("IN-EXT-11: per-provider state independent — flipping Notion does not change GCal pref", () => {
    localStorage.setItem(accountScope.physicalKey("xai_pref_integrations_connected_notion"), "true");
    render(integrationsPane.render({ lang: "en" }));
    const gcalRaw = localStorage.getItem(accountScope.physicalKey("xai_pref_integrations_connected_gcal"));
    // Should be null (not set) or false
    expect(gcalRaw === null || gcalRaw === "false").toBe(true);
  });

  it("IN-EXT-12: no-hex-literals guard — badge + banner styles are in CSS only (OKLCH), not inline TSX styles", () => {
    // This test verifies the NEW components don't introduce hex literals in their TSX.
    // The no-hex-literals source-text test covers this at the file level (NH1 extended).
    // Here we verify badge style is applied via class, not inline.
    localStorage.setItem(accountScope.physicalKey("xai_pref_integrations_connected_notion"), "true");
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const badge = container.querySelector(".int-badge-connected");
    expect(badge).not.toBeNull();
    // Badge should NOT have an inline style with hex color
    const inlineStyle = badge?.getAttribute("style") ?? "";
    expect(inlineStyle).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
