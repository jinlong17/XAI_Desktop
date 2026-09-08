import type { Duration, DurationMode } from "../types.js";

export function resolveDurationSeconds(
  mode: DurationMode,
  duration: Duration,
  customDuration: number,
): number | null {
  if (mode === "infinite") return null;
  const minutes = mode === "custom" ? customDuration : duration;
  return Math.max(1, Math.round(minutes)) * 60;
}

export function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(safe / 3600);
  const mm = Math.floor((safe % 3600) / 60);
  const ss = safe % 60;
  if (hh > 0) {
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
