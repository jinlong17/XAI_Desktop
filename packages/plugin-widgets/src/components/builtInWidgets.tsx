import type { CSSProperties } from "react";
import type { HabitHistoryDay, WidgetDefinition, WidgetManifestRegistration } from "../types";

type ProgressMode = "day" | "week" | "month" | "year";

interface TimeProgressConfig extends Record<string, unknown> {
  mode: ProgressMode;
}

interface CountdownConfig extends Record<string, unknown> {
  title: string;
  targetDate: string;
}

const ringStyle: CSSProperties = {
  width: 112,
  height: 112,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  margin: "0 auto",
};

export function TimeProgressWidget({ config }: { config: TimeProgressConfig }) {
  const progress = calculateProgress(config.mode);
  return (
    <div style={{ display: "grid", gap: 12, textAlign: "center" }}>
      <div
        style={{
          ...ringStyle,
          background: `conic-gradient(var(--xai-widget-accent) ${progress.percent}%, rgba(148,163,184,0.24) 0)`,
        }}
      >
        <strong style={{ fontSize: 24 }}>{Math.round(progress.percent)}%</strong>
      </div>
      <div>
        <strong>{progress.label}</strong>
        <p style={{ color: "var(--xai-widget-muted)", marginTop: 4 }}>{progress.remainingLabel}</p>
      </div>
    </div>
  );
}

export function CountdownWidget({ config }: { config: CountdownConfig }) {
  const target = new Date(config.targetDate);
  const days = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <span style={{ color: "var(--xai-widget-muted)", fontSize: 12 }}>Countdown</span>
      <strong style={{ fontSize: 28 }}>{days} days</strong>
      <span>{config.title}</span>
      <span style={{ color: "var(--xai-widget-muted)", fontSize: 12 }}>{target.toLocaleDateString()}</span>
    </div>
  );
}

export function HabitStreakChart({ history = mockHabitHistory() }: { history?: HabitHistoryDay[] }) {
  const currentStreak = calculateCurrentStreak(history);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <strong>{currentStreak} day streak</strong>
      <div style={{ display: "flex", alignItems: "end", gap: 4, height: 56 }}>
        {history.slice(-14).map((day) => (
          <span
            key={day.date}
            title={`${day.date}: ${day.completed}/${day.target}`}
            style={{
              width: 10,
              height: 12 + 38 * completionRate(day),
              borderRadius: 4,
              background: completionRate(day) >= 1 ? "#16a34a" : "rgba(100,116,139,0.32)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function HabitWeeklySummary({ history = mockHabitHistory() }: { history?: HabitHistoryDay[] }) {
  const current = averageCompletion(history.slice(-7));
  const previous = averageCompletion(history.slice(-14, -7));
  const delta = Math.round((current - previous) * 100);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <strong>{Math.round(current * 100)}% this week</strong>
      <span style={{ color: delta >= 0 ? "#15803d" : "var(--xai-widget-danger)" }}>
        {delta >= 0 ? "+" : ""}
        {delta}% vs last week
      </span>
    </div>
  );
}

export function HabitCalendarHeatmap({ history = mockHabitHistory(180) }: { history?: HabitHistoryDay[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(26, 8px)", gap: 3 }}>
      {history.slice(-156).map((day) => {
        const rate = completionRate(day);
        return (
          <span
            key={day.date}
            title={`${day.date}: ${Math.round(rate * 100)}%`}
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: rate > 0.9 ? "#15803d" : rate > 0.5 ? "#86efac" : rate > 0 ? "#dcfce7" : "#e2e8f0",
            }}
          />
        );
      })}
    </div>
  );
}

export const timeProgressDefinition: WidgetDefinition<TimeProgressConfig> = {
  type: "time-progress",
  title: "Time progress",
  defaultSize: { width: 260, height: 230 },
  defaultConfig: { mode: "day" },
  render: ({ config }) => <TimeProgressWidget config={config} />,
};

export const countdownDefinition: WidgetDefinition<CountdownConfig> = {
  type: "countdown",
  title: "Countdown",
  defaultSize: { width: 260, height: 180 },
  defaultConfig: { title: "Next milestone", targetDate: "2026-06-01" },
  render: ({ config }) => <CountdownWidget config={config} />,
};

export const habitStatsDefinition: WidgetDefinition = {
  type: "habit-stats",
  title: "Habit stats",
  defaultSize: { width: 320, height: 220 },
  defaultConfig: {},
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <HabitWeeklySummary />
      <HabitStreakChart />
    </div>
  ),
};

export const builtInWidgetManifest: WidgetManifestRegistration = {
  pluginName: "widgets",
  widgets: [timeProgressDefinition, countdownDefinition, habitStatsDefinition],
};

function calculateProgress(mode: ProgressMode): { percent: number; label: string; remainingLabel: string } {
  const now = new Date();
  const start = new Date(now.getTime());
  const end = new Date(now.getTime());
  if (mode === "day") {
    start.setHours(0, 0, 0, 0);
    end.setHours(24, 0, 0, 0);
  } else if (mode === "week") {
    const day = (now.getDay() + 6) % 7;
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 7);
  } else if (mode === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(start.getMonth() + 1, 1);
    end.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setFullYear(start.getFullYear() + 1, 0, 1);
    end.setHours(0, 0, 0, 0);
  }
  const percent = Math.min(100, Math.max(0, ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100));
  return {
    percent,
    label: `${mode[0]?.toUpperCase() ?? "D"}${mode.slice(1)} progress`,
    remainingLabel: `${Math.ceil((end.getTime() - now.getTime()) / 3_600_000)} hours remaining`,
  };
}

function mockHabitHistory(days = 28): HabitHistoryDay[] {
  const result: HabitHistoryDay[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const completed = date.getDay() === 0 ? 0 : date.getDate() % 3 === 0 ? 1 : 2;
    result.push({ date: date.toISOString().slice(0, 10), completed, target: 2 });
  }
  return result;
}

function completionRate(day: HabitHistoryDay): number {
  return Math.min(1, day.completed / Math.max(1, day.target));
}

function averageCompletion(days: HabitHistoryDay[]): number {
  return days.reduce((sum, day) => sum + completionRate(day), 0) / Math.max(1, days.length);
}

function calculateCurrentStreak(days: HabitHistoryDay[]): number {
  let streak = 0;
  for (const day of [...days].reverse()) {
    if (completionRate(day) < 1) {
      break;
    }
    streak += 1;
  }
  return streak;
}
