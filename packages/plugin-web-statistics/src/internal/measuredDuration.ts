import type { PomodoroSessionRecord } from './isPomodoroSession.js';

/** Missing or corrupt elapsed time is unknown, never the configured duration. */
export function measuredDurationMs(session: PomodoroSessionRecord): number | null {
  const elapsed = session.elapsedMs;
  return typeof elapsed === 'number' && Number.isFinite(elapsed) && elapsed >= 0
    && Number.isFinite(session.durationMs) && session.durationMs >= 0 && elapsed <= session.durationMs
    ? elapsed : null;
}

/** Presentation only: aggregators retain the unrounded measurement. */
export function formatFocusMinutes(minutes: number, lang: 'en' | 'zh'): string {
  return new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 2 }).format(minutes);
}
