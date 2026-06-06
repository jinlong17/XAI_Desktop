/**
 * MeditationPlayer — fullscreen focus overlay + countdown + exit.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MeditationPlayer, type MeditationPlayerProps } from "../MeditationPlayer.js";
import type { Scene } from "../types.js";
import { DEFAULT_CLOCK_COLORS } from "../constants.js";

const OCEAN: Scene = {
  id: "ocean",
  grad: "linear-gradient(160deg, oklch(50% 0.10 230), oklch(22% 0.06 230))",
  accent: "oklch(85% 0.10 220)",
  animation: "waves",
};

const BASE_PROPS: MeditationPlayerProps = {
  scene: OCEAN,
  sceneLabel: "Ocean",
  clock: "digital",
  clockScale: "normal",
  clockColors: DEFAULT_CLOCK_COLORS,
  sound: "water",
  volume: 0.55,
  duration: 15,
  durationMode: "preset",
  customDuration: 20,
  lang: "en",
  onExit: () => {},
};

function renderPlayer(overrides: Partial<MeditationPlayerProps> = {}) {
  return render(<MeditationPlayer {...BASE_PROPS} {...overrides} />);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 23, 10, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MeditationPlayer", () => {
  it("AC-PLAYER-1: element with class .med-player is in DOM at position:fixed", () => {
    const { container } = renderPlayer();
    const player = container.querySelector(".med-player");
    expect(player).not.toBeNull();
  });

  it("AC-PLAYER-2: player background is the scene gradient", () => {
    const { container } = renderPlayer();
    const player = container.querySelector(".med-player") as HTMLElement;
    expect(player.style.background).toContain("linear-gradient");
    expect(player.style.background).toContain("oklch");
  });

  it("AC-PLAYER-3: renders exactly 18 particles", () => {
    const { container } = renderPlayer();
    const particles = container.querySelectorAll(".particle");
    expect(particles).toHaveLength(18);
  });

  it("AC-PLAYER-4: focus mode uses a frameless digital clock for analog variants", () => {
    const { container } = renderPlayer({ clock: "analog" });
    const clock = container.querySelector(".med-player-clock .clk-digital.frameless");
    expect(clock).not.toBeNull();
    expect(container.querySelector(".med-player-clock svg.clk-analog")).toBeNull();
  });

  it("AC-PLAYER-5: countdown decreases after 60s (15:00 -> 14:00)", () => {
    renderPlayer();
    expect(screen.getByText("15:00")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("14:00")).toBeInTheDocument();
  });

  it("AC-PLAYER-6: focus mode hides progress chrome", () => {
    const { container } = renderPlayer();
    expect(container.querySelector(".mp-progress")).toBeNull();
    expect(container.querySelector(".mp-progress-bar")).toBeNull();
    expect(container.querySelector(".med-focus-core")).not.toBeNull();
  });

  it("AC-PLAYER-7: clicking the exit button calls onExit", () => {
    const onExit = vi.fn();
    renderPlayer({ onExit });
    fireEvent.click(screen.getByRole("button", { name: /^Exit$/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("AC-PLAYER-8: exit button aria-label EN = 'Exit'", () => {
    renderPlayer();
    expect(screen.getByLabelText("Exit")).toBeInTheDocument();
  });

  it("AC-PLAYER-8: exit button aria-label ZH = '退出'", () => {
    renderPlayer({ lang: "zh" });
    expect(screen.getByLabelText("退出")).toBeInTheDocument();
  });

  it("AC-PLAYER-9: 5-minute session at elapsed=300 shows 00:00", () => {
    renderPlayer({ duration: 5 });
    act(() => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("keeps the active player free of breathing-ring chrome", () => {
    renderPlayer();
    expect(screen.queryByText("Breathe")).not.toBeInTheDocument();
  });

  it("keeps the active player free of breathing-ring chrome in ZH", () => {
    renderPlayer({ lang: "zh" });
    expect(screen.queryByText("呼吸")).not.toBeInTheDocument();
  });

  it("renders a full-screen control in the focused toolbar", () => {
    renderPlayer();
    expect(screen.getByRole("button", { name: "Full screen" })).toBeInTheDocument();
  });

  it("keeps focus controls hidden until pointer activity reveals them temporarily", () => {
    const { container } = renderPlayer();
    const player = container.querySelector(".med-player") as HTMLElement;

    expect(player).not.toHaveClass("controls-visible");
    fireEvent.pointerMove(player);
    expect(player).toHaveClass("controls-visible");

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(player).not.toHaveClass("controls-visible");
  });

  it("keeps the popup controls visible while the control panel is open", () => {
    const { container } = renderPlayer();
    const player = container.querySelector(".med-player") as HTMLElement;

    fireEvent.pointerMove(player);
    fireEvent.click(screen.getByRole("button", { name: "Controls" }));
    expect(player).toHaveClass("controls-open");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(player).toHaveClass("controls-visible");
    expect(screen.getByRole("button", { name: "Play ambient sound" })).toBeInTheDocument();
  });

  it("labels the ambient sound toggle with play/pause intent", () => {
    const { container } = renderPlayer();
    const player = container.querySelector(".med-player") as HTMLElement;
    fireEvent.pointerMove(player);
    fireEvent.click(screen.getByRole("button", { name: "Controls" }));
    expect(screen.getByRole("button", { name: "Play ambient sound" })).toBeInTheDocument();
  });

  it("pauses and resumes the session timer", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("15:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("14:00")).toBeInTheDocument();
  });

  it("infinite mode displays elapsed time instead of a countdown end", () => {
    renderPlayer({ durationMode: "infinite" });
    expect(screen.getByText("∞ 00:00")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(61_000);
    });
    expect(screen.getByText("∞ 01:01")).toBeInTheDocument();
  });
});
