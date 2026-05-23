/**
 * @internal — useDaysUntil.ts
 *
 * Hook that returns the number of whole days until (positive) or since
 * (negative) the given `target_date`.
 *
 * Strategy:
 * - Compute synchronously on mount (initial value).
 * - Schedule ONE `setTimeout` per hook instance to fire at the next local
 *   midnight + 1s; on fire, recompute and reschedule (one timer, not per-card).
 * - Add a `visibilitychange` listener that recomputes immediately when the
 *   tab becomes visible again.
 * - On unmount: clear the timeout and remove the listener.
 *
 * Returns `NaN` if `target_date` is not a valid "YYYY-MM-DD" string.
 *
 * Design: packages/xai-web-countdown/docs/design.md §5
 * API contract: packages/xai-web-countdown/docs/api.md §6
 */

import { useState, useEffect } from "react";
import { computeDaysUntil } from "./computeDaysUntil.js";

function msUntilLocalMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

export function useDaysUntil(target_date: string): number {
  const [days, setDays] = useState<number>(() =>
    computeDaysUntil(target_date, new Date()),
  );

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    function recompute(): void {
      setDays(computeDaysUntil(target_date, new Date()));
    }

    function scheduleNext(): void {
      // +1000ms to avoid midnight-race edge cases
      timerId = setTimeout(() => {
        recompute();
        scheduleNext();
      }, msUntilLocalMidnight() + 1000);
    }

    function handleVisibility(): void {
      if (document.visibilityState === "visible") {
        recompute();
      }
    }

    scheduleNext();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [target_date]);

  return days;
}
