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
import { createEvent } from "./eventStore/eventStore.js";
import type { UserCalEvent } from "./eventStore/types.js";

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---- Date helpers (local — no cross-plugin import) --------------------------

/**
 * Computes startISO and endISO from date + startTime + durationMin.
 * startISO: "YYYY-MM-DDTHH:MM" local-clock.
 * endISO: same day, startTime + durationMin (clamped to 23:55 same day).
 * Minimum duration = 5 min (clamp per UserCalEvent invariant).
 */
function buildISOTimes(
  date: string,
  startTime: string,
  durationMin: number,
): { startISO: string; endISO: string } {
  // Validate / default
  const safeDate = DATE_RE.test(date) ? date : todayDateKey();
  const safeStart = HHMM_RE.test(startTime) ? startTime : "09:00";
  const safeDur = Math.max(5, Math.round(typeof durationMin === "number" ? durationMin : 60));

  const [hStr, mStr] = safeStart.split(":");
  const h = parseInt(hStr ?? "9", 10);
  const m = parseInt(mStr ?? "0", 10);

  const startMinutes = h * 60 + m;
  let endMinutes = startMinutes + safeDur;
  // Clamp to same day: max 23*60 + 55 = 1435 minutes
  endMinutes = Math.min(endMinutes, 23 * 60 + 55);

  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;

  const startISO = `${safeDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const endISO = `${safeDate}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

  return { startISO, endISO };
}

export function useCalendarCreateRequestSubscriber(): void {
  useWebEventListener("web:calendar:create-requested", payload => {
    const scope = accountScope.capture();
    executeToolWrite("web:calendar:create-requested", payload, scope, () => {
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      if (!title) return { ok: false, reason: "invalid" };
      const { startISO, endISO } = buildISOTimes(payload.date, payload.startTime, payload.durationMin);
      if (endISO <= startISO || !Number.isFinite(Date.parse(startISO)) || !Number.isFinite(Date.parse(endISO))) return { ok: false, reason: "invalid" };
      const raw = getPref("xai_calendar_events", scope);
      const store = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? raw as Record<string, UserCalEvent> : {};
      const { next, created } = createEvent(store, { title, startISO, endISO, colorPreset: "mint", recurrence: null });
      return setPref("xai_calendar_events", next, scope) ? { ok: true, targetId: created.id } : { ok: false, reason: "storage" };
    });
  });
}
