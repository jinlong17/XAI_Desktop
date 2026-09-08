/**
 * Deep-link receive — AC-DEEPLINK-1..6.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { CalendarModule } from "../CalendarModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 4, 22)));
});

afterEach(() => {
  vi.useRealTimers();
});

function emit(focusDate: string | undefined, moduleId = "calendar") {
  act(() => {
    emitWebEvent("web:shell:module-change", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      moduleId: moduleId as any,
      focusDate,
      source: "mini-cal",
    });
  });
}

describe("CalendarModule deep-link", () => {
  it("AC-DEEPLINK-1: focusDate sets focusedDate (same month)", () => {
    const { container } = render(<CalendarModule lang="en" />);
    emit("2026-05-23");
    const focused = container.querySelector('[data-focused="true"]');
    expect(focused).toBeTruthy();
    expect(focused?.getAttribute("data-date")).toBe("2026-05-23");
  });

  it("AC-DEEPLINK-2: matching cell receives data-focused=true", () => {
    const { container } = render(<CalendarModule lang="en" />);
    emit("2026-05-15");
    expect(container.querySelector('[data-date="2026-05-15"][data-focused="true"]')).toBeTruthy();
  });

  it("AC-DEEPLINK-3: click on < clears focusedDate", () => {
    const { container } = render(<CalendarModule lang="en" />);
    emit("2026-05-23");
    expect(container.querySelector('[data-focused="true"]')).toBeTruthy();
    act(() => {
      screen.getByTestId("cal-prev-month").click();
    });
    expect(container.querySelector('[data-focused="true"]')).toBeNull();
  });

  it("AC-DEEPLINK-4: non-calendar moduleId is ignored", () => {
    const { container } = render(<CalendarModule lang="en" />);
    emit("2026-05-23", "tasks");
    expect(container.querySelector('[data-focused="true"]')).toBeNull();
  });

  it("AC-DEEPLINK-5: cross-month focusDate navigates displayedMonth", () => {
    render(<CalendarModule lang="en" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("May 2026");
    emit("2026-06-15");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Jun 2026");
  });

  it("AC-DEEPLINK-6: malformed focusDate logs warn and does not crash", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<CalendarModule lang="en" />);
    emit("not-a-date");
    expect(container.querySelector('[data-focused="true"]')).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("missing focusDate is a no-op (no warn)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<CalendarModule lang="en" />);
    emit(undefined);
    expect(container.querySelector('[data-focused="true"]')).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
