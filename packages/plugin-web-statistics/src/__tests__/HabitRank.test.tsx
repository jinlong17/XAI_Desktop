import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HabitRank } from "../HabitRank.js";

describe("HabitRank", () => {
  const ranking = [
    {
      id: "h1",
      titleEn: "Drink water",
      titleZh: "饮水",
      emoji: "💧",
      percent: 90,
      streak: 27,
    },
    {
      id: "h2",
      titleEn: "Run",
      titleZh: "跑步",
      emoji: "🏃",
      percent: 75,
      streak: 14,
    },
  ];

  it("HR1: renders rows for each habit (max 5)", () => {
    const { container } = render(<HabitRank ranking={ranking} lang="en" />);
    expect(container.querySelectorAll(".hrank-row").length).toBe(2);
  });

  it("HR2: shows index, emoji, EN title, streak", () => {
    render(<HabitRank ranking={ranking} lang="en" />);
    expect(screen.getByText("Drink water")).toBeInTheDocument();
    expect(screen.getByText("💧")).toBeInTheDocument();
  });

  it("HR3: empty ranking renders empty-state", () => {
    render(<HabitRank ranking={[]} lang="en" />);
    expect(screen.getByText(/No habit data/)).toBeInTheDocument();
  });

  it("HR4: lang=zh renders ZH titles", () => {
    render(<HabitRank ranking={ranking} lang="zh" />);
    expect(screen.getByText("饮水")).toBeInTheDocument();
    expect(screen.getByText("跑步")).toBeInTheDocument();
  });
});
