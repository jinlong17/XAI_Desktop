import { usePomodoroStore } from "../hooks/usePomodoroStore";

function compactTime(total: number): string {
  const minutes = Math.floor(total / 60).toString();
  const seconds = Math.max(0, total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function PomodoroOverlay() {
  const pomodoro = usePomodoroStore();
  return (
    <aside
      aria-label="Pomodoro overlay"
      style={{
        alignItems: "center",
        backdropFilter: "blur(12px)",
        background: "rgba(17,24,39,0.82)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 8,
        color: "#ffffff",
        display: "inline-flex",
        gap: 10,
        minHeight: 42,
        padding: "8px 10px",
      }}
    >
      <strong style={{ fontVariantNumeric: "tabular-nums" }}>{compactTime(pomodoro.remainingSeconds)}</strong>
      <span style={{ color: "#d1d5db", fontSize: 12 }}>{pomodoro.status}</span>
      <button
        aria-label={pomodoro.status === "running" ? "Pause pomodoro" : "Start pomodoro"}
        onClick={pomodoro.status === "running" ? pomodoro.pause : () => pomodoro.start()}
        style={{
          background: "rgba(255,255,255,0.14)",
          border: 0,
          borderRadius: 6,
          color: "#ffffff",
          cursor: "pointer",
          height: 26,
          padding: "0 8px",
        }}
        type="button"
      >
        {pomodoro.status === "running" ? "Pause" : "Start"}
      </button>
    </aside>
  );
}
