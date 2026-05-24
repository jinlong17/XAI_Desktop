/**
 * IN1..IN6 — integrationsPane tests (test.md §3 P2)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { integrationsPane } from "../panes/integrationsPane.js";
import * as eventBus from "@repo/xai-web-event-bus";

describe("integrationsPane", () => {
  it("IN1: renders 17 integration cards (3+10+4)", () => {
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const cards = container.querySelectorAll(".int-card");
    expect(cards.length).toBe(17);
  });

  it("IN2: renders 3 section headers", () => {
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const headers = container.querySelectorAll(".int-h");
    expect(headers.length).toBe(3);
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

  it("IN5: clicking a card is a no-op — does not throw and does not call console.warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const firstCard = container.querySelector<HTMLButtonElement>(".int-card");
    expect(firstCard).not.toBeNull();
    expect(() => fireEvent.click(firstCard!)).not.toThrow();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("IN6: clicking cards does NOT emit any event via emitWebEvent", () => {
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");
    const { container } = render(integrationsPane.render({ lang: "en" }));
    const cards = container.querySelectorAll<HTMLButtonElement>(".int-card");
    for (const card of Array.from(cards)) {
      fireEvent.click(card);
    }
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
