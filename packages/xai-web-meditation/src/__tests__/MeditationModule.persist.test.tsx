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

/** Find the scene picker button whose label text matches `label`. */
function sceneButton(container: HTMLElement, label: string): HTMLButtonElement {
  const buttons = Array.from(container.querySelectorAll(".scene-card")) as HTMLButtonElement[];
  const match = buttons.find((b) => b.querySelector(".scene-label")?.textContent === label);
  if (!match) throw new Error(`No scene button with label "${label}"`);
  return match;
}

describe("MeditationModule persistence", () => {
  it("AC-PERSIST-1: clicking a picker writes the full blob to localStorage", () => {
    const { container } = render(<MeditationModule lang="en" />);
    fireEvent.click(sceneButton(container, "Forest"));

    const raw = localStorage.getItem("xai_meditation_prefs");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.scene).toBe("forest");
    expect(parsed.clock).toBe("split");
    expect(parsed.sound).toBe("water");
    expect(parsed.duration).toBe(15);
  });

  it("AC-PERSIST-2: unmount + remount restores last selection", () => {
    const first = render(<MeditationModule lang="en" />);
    fireEvent.click(sceneButton(first.container, "Night Sky"));
    fireEvent.click(screen.getByRole("button", { name: /Analog/i }));
    first.unmount();

    const second = render(<MeditationModule lang="en" />);
    expect(sceneButton(second.container, "Night Sky")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Analog/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("AC-PERSIST-3: cold mount applies DEFAULT_PREFS (ocean/split/water/15)", () => {
    const { container } = render(<MeditationModule lang="en" />);
    expect(sceneButton(container, "Ocean")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("button", { name: /Split/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByRole("button", { name: /Flowing Water/i })[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /^15/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PERSIST-4: corrupted JSON falls back to defaults without throwing", () => {
    localStorage.setItem("xai_meditation_prefs", "{not valid json");
    const { container } = render(<MeditationModule lang="en" />);
    expect(sceneButton(container, "Ocean")).toHaveAttribute("aria-pressed", "true");
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
    const { container } = render(<MeditationModule lang="en" />);
    expect(sceneButton(container, "Ocean")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Analog/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Soft Rain/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /^25/ })).toHaveAttribute("aria-pressed", "true");
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
    const { container } = render(<MeditationModule lang="en" />);
    expect(sceneButton(container, "Forest")).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PERSIST-7: cross-tab storage event updates UI", () => {
    const { container } = render(<MeditationModule lang="en" />);
    expect(sceneButton(container, "Ocean")).toHaveAttribute("aria-pressed", "true");

    const newBlob = JSON.stringify({
      schemaVersion: 1,
      scene: "void",
      clock: "minimal",
      sound: "none",
      duration: 10,
    });
    // Write to localStorage to mirror what a sibling tab would do.
    localStorage.setItem("xai_meditation_prefs", newBlob);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "xai_meditation_prefs",
          newValue: newBlob,
          storageArea: localStorage,
        }),
      );
    });

    expect(sceneButton(container, "Void")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Minimal/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
