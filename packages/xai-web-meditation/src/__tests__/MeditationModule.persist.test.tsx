/**
 * MeditationModule — persistence round-trip + corrupted blob recovery.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MeditationModule } from "../MeditationModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 23, 10, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MeditationModule persistence", () => {
  it("AC-PERSIST-1: clicking a picker writes the full blob to localStorage", () => {
    render(<MeditationModule lang="en" />);
    const forest = screen.getByRole("button", { name: /Forest/i });
    fireEvent.click(forest);

    const raw = localStorage.getItem("xai_meditation_prefs");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.scene).toBe("forest");
    // Other defaults persisted alongside
    expect(parsed.clock).toBe("split");
    expect(parsed.sound).toBe("water");
    expect(parsed.duration).toBe(15);
  });

  it("AC-PERSIST-2: unmount + remount restores last selection", () => {
    const { unmount } = render(<MeditationModule lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: /Night Sky/i }));
    fireEvent.click(screen.getByRole("button", { name: /Analog/i }));
    unmount();

    render(<MeditationModule lang="en" />);
    expect(screen.getByRole("button", { name: /Night Sky/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Analog/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("AC-PERSIST-3: cold mount with empty localStorage applies DEFAULT_PREFS (ocean/split/water/15)", () => {
    render(<MeditationModule lang="en" />);
    expect(screen.getAllByRole("button", { name: /Ocean/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByRole("button", { name: /Split/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByRole("button", { name: /Flowing Water/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /^15/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("AC-PERSIST-4: corrupted JSON in localStorage falls back to defaults without throwing", () => {
    localStorage.setItem("xai_meditation_prefs", "{not valid json");
    expect(() => render(<MeditationModule lang="en" />)).not.toThrow();
    // Default scene = ocean
    expect(screen.getAllByRole("button", { name: /Ocean/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("AC-PERSIST-5: unknown scene 'mars' clamps to ocean; other fields preserved", () => {
    localStorage.setItem(
      "xai_meditation_prefs",
      JSON.stringify({
        schemaVersion: 1,
        scene: "mars",
        clock: "analog",
        sound: "rain",
        duration: 25,
      }),
    );
    render(<MeditationModule lang="en" />);
    expect(screen.getAllByRole("button", { name: /Ocean/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Analog/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Soft Rain/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /^25/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("AC-PERSIST-6: schemaVersion mismatch still loads (clamps via validatePrefs)", () => {
    localStorage.setItem(
      "xai_meditation_prefs",
      JSON.stringify({
        schemaVersion: 999,
        scene: "forest",
        clock: "digital",
        sound: "waves",
        duration: 45,
      }),
    );
    render(<MeditationModule lang="en" />);
    expect(screen.getByRole("button", { name: /Forest/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("AC-PERSIST-7: cross-tab storage event updates UI", () => {
    render(<MeditationModule lang="en" />);
    expect(screen.getAllByRole("button", { name: /Ocean/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "xai_meditation_prefs",
          newValue: JSON.stringify({
            schemaVersion: 1,
            scene: "void",
            clock: "minimal",
            sound: "none",
            duration: 10,
          }),
        }),
      );
    });

    expect(screen.getByRole("button", { name: /Void/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Minimal/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
