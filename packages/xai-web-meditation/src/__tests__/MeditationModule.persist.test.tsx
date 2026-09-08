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

function clockButton(container: HTMLElement, label: string): HTMLButtonElement {
  const buttons = Array.from(container.querySelectorAll(".clock-card")) as HTMLButtonElement[];
  const match = buttons.find((b) => b.querySelector(".cc-label")?.textContent === label);
  if (!match) throw new Error(`No clock button with label "${label}"`);
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
    expect(parsed.schemaVersion).toBe(3);
    expect(parsed.clock).toBe("split");
    expect(parsed.sound).toBe("water");
    expect(parsed.duration).toBe(15);
    expect(parsed.customFixedDurations).toEqual([]);
    expect(parsed.durationMode).toBe("preset");
    expect(parsed.clockScale).toBe("normal");
    expect(parsed.customScenes).toEqual([]);
  });

  it("AC-PERSIST-2: unmount + remount restores last selection", () => {
    const first = render(<MeditationModule lang="en" />);
    fireEvent.click(sceneButton(first.container, "Night Sky"));
    fireEvent.click(clockButton(first.container, "Analog"));
    first.unmount();

    const second = render(<MeditationModule lang="en" />);
    expect(sceneButton(second.container, "Night Sky")).toHaveAttribute("aria-pressed", "true");
    expect(clockButton(second.container, "Analog")).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PERSIST-3: cold mount applies DEFAULT_PREFS (ocean/split/water/15)", () => {
    const { container } = render(<MeditationModule lang="en" />);
    expect(sceneButton(container, "Ocean")).toHaveAttribute("aria-pressed", "true");
    expect(clockButton(container, "Split")).toHaveAttribute("aria-pressed", "true");
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
    expect(clockButton(container, "Analog")).toHaveAttribute("aria-pressed", "true");
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
      schemaVersion: 3,
      scene: "void",
      clock: "minimal",
      sound: "none",
      duration: 10,
      customFixedDurations: [],
      volume: 0.55,
      durationMode: "preset",
      customDuration: 20,
      clockScale: "normal",
      clockColors: {
        digits: "#f8fafc",
        hands: "#e5edf4",
        ring: "#c7d2dd",
        background: "#0f1720",
        highlight: "#9bd8f0",
      },
      customScenes: [],
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
    expect(clockButton(container, "Minimal")).toHaveAttribute("aria-pressed", "true");
  });

  it("persists custom duration and infinite mode separately from fixed duration", () => {
    render(<MeditationModule lang="en" />);
    const customInput = screen.getByLabelText("Custom minutes");
    fireEvent.change(customInput, { target: { value: "37" } });
    let parsed = JSON.parse(localStorage.getItem("xai_meditation_prefs")!);
    expect(parsed.durationMode).toBe("custom");
    expect(parsed.customDuration).toBe(37);

    fireEvent.click(screen.getByRole("button", { name: /Infinite mode/i }));
    parsed = JSON.parse(localStorage.getItem("xai_meditation_prefs")!);
    expect(parsed.durationMode).toBe("infinite");
    expect(parsed.duration).toBe(15);
  });

  it("adds and removes a user fixed duration", () => {
    render(<MeditationModule lang="en" />);
    const addInput = screen
      .getAllByLabelText("Add fixed duration")
      .find((element) => element.tagName === "INPUT") as HTMLInputElement;
    fireEvent.change(addInput, { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: "Add fixed duration" }));

    let parsed = JSON.parse(localStorage.getItem("xai_meditation_prefs")!);
    expect(parsed.durationMode).toBe("preset");
    expect(parsed.duration).toBe(60);
    expect(parsed.customFixedDurations).toEqual([60]);
    expect(screen.getByRole("button", { name: /^60/ })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByLabelText("Remove fixed duration 60"));
    parsed = JSON.parse(localStorage.getItem("xai_meditation_prefs")!);
    expect(parsed.customFixedDurations).toEqual([]);
    expect(parsed.duration).toBe(15);
  });

  it("saves, selects, edits, and deletes a custom scene", () => {
    const { container } = render(<MeditationModule lang="en" />);
    fireEvent.change(screen.getByLabelText("Scene name"), { target: { value: "Deep focus" } });
    fireEvent.click(screen.getByRole("button", { name: /Save scene/i }));

    let parsed = JSON.parse(localStorage.getItem("xai_meditation_prefs")!);
    expect(parsed.customScenes).toHaveLength(1);
    expect(parsed.customScenes[0].name).toBe("Deep focus");
    expect(parsed.scene).toMatch(/^custom:/);
    expect(sceneButton(container, "Deep focus")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByLabelText("Edit scene"));
    fireEvent.change(screen.getByLabelText("Scene name"), { target: { value: "Evening calm" } });
    fireEvent.click(screen.getByRole("button", { name: /Save scene/i }));
    parsed = JSON.parse(localStorage.getItem("xai_meditation_prefs")!);
    expect(parsed.customScenes[0].name).toBe("Evening calm");

    fireEvent.click(screen.getByLabelText("Delete scene"));
    parsed = JSON.parse(localStorage.getItem("xai_meditation_prefs")!);
    expect(parsed.customScenes).toEqual([]);
    expect(parsed.scene).toBe("ocean");
  });
});
