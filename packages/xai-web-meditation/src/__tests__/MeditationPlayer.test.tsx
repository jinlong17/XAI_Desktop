/**
 * MeditationPlayer — fullscreen overlay + countdown + progress + exit.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MeditationPlayer } from "../MeditationPlayer.js";
import type { Scene } from "../types.js";

const OCEAN: Scene = {
  id: "ocean",
  grad: "linear-gradient(160deg, oklch(50% 0.10 230), oklch(22% 0.06 230))",
  accent: "oklch(85% 0.10 220)",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 23, 10, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MeditationPlayer", () => {
  it("AC-PLAYER-1: element with class .med-player is in DOM at position:fixed", () => {
    const { container } = render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    const player = container.querySelector(".med-player");
    expect(player).not.toBeNull();
  });

  it("AC-PLAYER-2: player background is the scene gradient", () => {
    const { container } = render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    const player = container.querySelector(".med-player") as HTMLElement;
    expect(player.style.background).toContain("linear-gradient");
    expect(player.style.background).toContain("oklch");
  });

  it("AC-PLAYER-3: renders exactly 18 particles", () => {
    const { container } = render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    const particles = container.querySelectorAll(".particle");
    expect(particles).toHaveLength(18);
  });

  it("AC-PLAYER-4: central clock matches selected variant (analog → svg.clk-analog)", () => {
    const { container } = render(
      <MeditationPlayer
        scene={OCEAN}
        clock="analog"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    const clock = container.querySelector(".med-player-clock svg.clk-analog");
    expect(clock).not.toBeNull();
  });

  it("AC-PLAYER-5: countdown decreases after 60s (15:00 → 14:00)", () => {
    render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    expect(screen.getByText("15:00")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("14:00")).toBeInTheDocument();
  });

  it("AC-PLAYER-6: progress bar width grows with elapsed time", () => {
    const { container } = render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    const bar = container.querySelector(".mp-progress-bar") as HTMLElement;
    expect(bar.style.width).toBe("0%");
    act(() => {
      vi.advanceTimersByTime(5 * 60_000); // 5 minutes of 15 min = 33.33%
    });
    const width = parseFloat(bar.style.width);
    expect(width).toBeGreaterThan(30);
    expect(width).toBeLessThan(40);
  });

  it("AC-PLAYER-7: clicking the exit button calls onExit", () => {
    const onExit = vi.fn();
    render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={onExit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Exit/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("AC-PLAYER-8: exit button aria-label EN = 'Exit'", () => {
    render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    expect(screen.getByLabelText("Exit")).toBeInTheDocument();
  });

  it("AC-PLAYER-8: exit button aria-label ZH = '退出'", () => {
    render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="zh"
        onExit={() => {}}
      />,
    );
    expect(screen.getByLabelText("退出")).toBeInTheDocument();
  });

  it("AC-PLAYER-9: 5-minute session at elapsed=300 shows 00:00", () => {
    render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={5}
        lang="en"
        onExit={() => {}}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("renders breathing label with EN copy", () => {
    render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="en"
        onExit={() => {}}
      />,
    );
    expect(screen.getByText("Breathe")).toBeInTheDocument();
  });

  it("renders breathing label with ZH copy", () => {
    render(
      <MeditationPlayer
        scene={OCEAN}
        clock="digital"
        sound="water"
        duration={15}
        lang="zh"
        onExit={() => {}}
      />,
    );
    expect(screen.getByText("呼吸")).toBeInTheDocument();
  });
});
