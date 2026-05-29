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

import { useRef } from "react";
import { useWebEventListener } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";
import { createEvent } from "./eventStore/eventStore.js";
import type { UserCalEvent } from "./eventStore/types.js";

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
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
  const safeStart = /^\d{2}:\d{2}$/.test(startTime) ? startTime : "09:00";
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

// ---- Idempotency seen-set bound (Rec4) --------------------------------------
const MAX_SEEN = 100;

/**
 * useCalendarCreateRequestSubscriber — zero-UI React hook.
 *
 * Mount ONCE in apps/web/src/App.tsx as a Shell-sibling to guarantee
 * route-independent liveness (R4 mitigation — CS-3 assertion).
 *
 * @returns void — renders nothing; side-effect only.
 */
export function useCalendarCreateRequestSubscriber(): void {
  // Bounded seen-set — cleared on unmount.
  const seenRef = useRef<Set<string>>(new Set());

  useWebEventListener("web:calendar:create-requested", (payload) => {
    const requestId = typeof payload.requestId === "string" ? payload.requestId : "";

    // Idempotency guard (Rec4: bounded seen-set).
    if (requestId) {
      if (seenRef.current.has(requestId)) return;
      if (seenRef.current.size >= MAX_SEEN) {
        seenRef.current.clear();
      }
      seenRef.current.add(requestId);
    }

    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    if (!title) return;

    const date = typeof payload.date === "string" ? payload.date : "";
    const startTime = typeof payload.startTime === "string" ? payload.startTime : "09:00";
    const durationMin = typeof payload.durationMin === "number" ? payload.durationMin : 60;

    const { startISO, endISO } = buildISOTimes(date, startTime, durationMin);

    const partial: Omit<UserCalEvent, "id" | "createdAt" | "updatedAt"> = {
      title,
      startISO,
      endISO,
      colorPreset: "mint",
      recurrence: null,
    };

    // Read the current store imperatively (not via usePref hook).
    const rawStore = getPref("xai_calendar_events");
    const store: Record<string, UserCalEvent> =
      typeof rawStore === "object" && rawStore !== null && !Array.isArray(rawStore)
        ? (rawStore as Record<string, UserCalEvent>)
        : {};

    // Execute via the pure createEvent reducer.
    const { next } = createEvent(store, partial);

    // Write back via imperative setPref (storage-event → useUserCalEvents in mounted CalendarModule updates reactively).
    setPref("xai_calendar_events", next);
  });
}
