/**
 * aiCreateSubscriber.ts — always-on subscriber for web:calendar:create-requested.
 *
 * DESIGN:
 * - Executes the write IMPERATIVELY via getPref + createEvent + setPref,
 *   NOT through React hooks (so it works even when CalendarModule is not mounted).
 * - Mounted as a Shell-sibling in apps/web/src/App.tsx (route-independent liveness).
 * - Idempotent per requestId: bounded useRef seen-set (per Rec4).
 * - createEvent is PUBLICLY exported from this package's index.ts (used here
 *   via direct internal import for efficiency — valid since we are inside the same package).
 *
 * RED LINE: this module does NOT import from plugin-web-ai-chat.
 * Cross-plugin coupling goes ONLY through the typed event channel in @repo/core.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension §5.4
 * API contract: packages/xai-web-ai-chat/docs/api.md §13.5
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 CS tests
 *
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, getPref, setPref } from "@repo/plugin-web-storage";
import { isValidCivilDate } from "./civilDate.js";
import { createEvent } from "./eventStore/eventStore.js";
import type { UserCalEvent } from "./eventStore/types.js";

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MIN_DURATION_MINUTES = 5;
const LAST_END_MINUTE = 23 * 60 + 55;

function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---- Date helpers (local — no cross-plugin import) --------------------------

/**
 * Computes startISO and endISO from date + startTime + durationMin.
 * startISO: "YYYY-MM-DDTHH:MM" local-clock.
 * endISO: same day, startTime + durationMin.
 * Inputs are already validated. A request that would cross the supported
 * same-day boundary is rejected instead of silently changing its duration.
 */
function buildISOTimes(
  date: string,
  startTime: string,
  durationMin: number,
): { startISO: string; endISO: string } | null {
  const [hStr, mStr] = startTime.split(":");
  const h = parseInt(hStr ?? "9", 10);
  const m = parseInt(mStr ?? "0", 10);

  const startMinutes = h * 60 + m;
  const endMinutes = startMinutes + durationMin;
  if (endMinutes > LAST_END_MINUTE) return null;

  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;

  const startISO = `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const endISO = `${date}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

  return { startISO, endISO };
}

export function useCalendarCreateRequestSubscriber(): void {
  useWebEventListener("web:calendar:create-requested", payload => {
    const scope = accountScope.capture();
    executeToolWrite("web:calendar:create-requested", payload, scope, () => {
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      if (!title) return { ok: false, reason: "invalid" };
      // Defaults are only for fields genuinely omitted by a legacy producer.
      // Explicit malformed values must not be rewritten into another confirmed operation.
      const date = payload.date === undefined ? todayDateKey() : payload.date;
      const startTime = payload.startTime === undefined ? "09:00" : payload.startTime;
      const durationMin = payload.durationMin === undefined ? 60 : payload.durationMin;
      if (!isValidCivilDate(date)
        || typeof startTime !== "string"
        || !HHMM_RE.test(startTime)
        || typeof durationMin !== "number"
        || !Number.isFinite(durationMin)
        || !Number.isInteger(durationMin)
        || durationMin < MIN_DURATION_MINUTES) return { ok: false, reason: "invalid" };
      const times = buildISOTimes(date, startTime, durationMin);
      if (!times) return { ok: false, reason: "invalid" };
      const { startISO, endISO } = times;
      const raw = getPref("xai_calendar_events", scope);
      const store = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? raw as Record<string, UserCalEvent> : {};
      const { next, created } = createEvent(store, { title, startISO, endISO, colorPreset: "mint", recurrence: null });
      return setPref("xai_calendar_events", next, scope) ? { ok: true, targetId: created.id } : { ok: false, reason: "storage" };
    });
  });
}
