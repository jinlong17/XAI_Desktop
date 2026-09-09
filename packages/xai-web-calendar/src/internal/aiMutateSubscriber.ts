/**
 * aiMutateSubscriber.ts — always-on subscribers for web:calendar:update-requested
 * and web:calendar:delete-requested (xai-web-ai-tool-edit-delete).
 *
 * DESIGN:
 * - Reuses existing SHIPPED pure store functions: updateEvent + deleteEvent.
 * - Executes writes IMPERATIVELY via getPref + store fn + setPref.
 * - Mounted as a Shell-sibling in apps/web/src/App.tsx beside the SHIPPED
 *   create subscriber.
 * - Idempotent per requestId: bounded useRef seen-set (MAX_SEEN=100).
 *
 * RED LINE: this module does NOT import from plugin-web-ai-chat.
 * Cross-plugin coupling goes ONLY through the typed event channel in @repo/core.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Edit/Delete ED-4/ED-10
 * API contract: packages/xai-web-ai-chat/docs/api.md §14.4
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §9 CS-DEL/CS-UPD tests
 *
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, getPref, setPref } from "@repo/plugin-web-storage";
import { isValidCivilDate } from "./civilDate.js";
import { updateEvent, deleteEvent } from "./eventStore/eventStore.js";
import type { UserCalEvent } from "./eventStore/types.js";

// ---- Type guards -----------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MIN_DURATION_MINUTES = 5;
const LAST_END_MINUTE = 23 * 60 + 55;

/** Builds startISO/endISO when date+startTime+durationMin are patched. */
function buildISOTimes(
  existing: UserCalEvent,
  patch: {
    date?: string;
    startTime?: string;
    durationMin?: number;
  },
): { startISO?: string; endISO?: string } | null {
  // Only recompute if at least one time-related field is patched.
  if (patch.date === undefined && patch.startTime === undefined && patch.durationMin === undefined) {
    return {};
  }

  // Derive base values from the existing event, then override with patch.
  const baseDate = existing.startISO.slice(0, 10); // "YYYY-MM-DD"
  const baseStartTime = existing.startISO.slice(11, 16); // "HH:MM"
  const existingEndMin =
    parseInt(existing.endISO.slice(11, 13), 10) * 60 +
    parseInt(existing.endISO.slice(14, 16), 10);
  const existingStartMin =
    parseInt(existing.startISO.slice(11, 13), 10) * 60 +
    parseInt(existing.startISO.slice(14, 16), 10);
  const baseDurationMin = Math.max(5, existingEndMin - existingStartMin);

  const newDate = patch.date ?? baseDate;
  const newStart = patch.startTime ?? baseStartTime;
  const newDur = patch.durationMin ?? baseDurationMin;
  if (!isValidCivilDate(newDate)
    || !HHMM_RE.test(newStart)
    || !Number.isFinite(newDur)
    || !Number.isInteger(newDur)
    || newDur < MIN_DURATION_MINUTES) return null;

  const [hStr, mStr] = newStart.split(":");
  const h = parseInt(hStr ?? "9", 10);
  const m = parseInt(mStr ?? "0", 10);
  const startMin = h * 60 + m;
  const endMin = startMin + newDur;
  if (endMin > LAST_END_MINUTE) return null;
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;

  const startISO = `${newDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const endISO = `${newDate}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

  return { startISO, endISO };
}

export function useCalendarMutateRequestSubscriber(): void {
  useWebEventListener("web:calendar:delete-requested", payload => {
    const scope = accountScope.capture();
    executeToolWrite("web:calendar:delete-requested", payload, scope, () => {
      const id = typeof payload.id === "string" ? payload.id.trim() : "";
      if (!id) return { ok: false, reason: "invalid" };
      const raw = getPref("xai_calendar_events", scope);
      const store = isObject(raw) ? raw as Record<string, UserCalEvent> : {};
      if (!Object.hasOwn(store, id)) return { ok: false, reason: "not-found" };
      return setPref("xai_calendar_events", deleteEvent(store, id), scope) ? { ok: true, targetId: id } : { ok: false, reason: "storage" };
    });
  });
  useWebEventListener("web:calendar:update-requested", payload => {
    const scope = accountScope.capture();
    executeToolWrite("web:calendar:update-requested", payload, scope, () => {
      const id = typeof payload.id === "string" ? payload.id.trim() : "";
      if (!id || !isObject(payload.patch)) return { ok: false, reason: "invalid" };
      const p = payload.patch;
      if ((p.title !== undefined && (typeof p.title !== "string" || !p.title.trim()))
        || (p.date !== undefined && !isValidCivilDate(p.date))
        || (p.startTime !== undefined && (typeof p.startTime !== "string" || !HHMM_RE.test(p.startTime)))
        || (p.durationMin !== undefined && (!Number.isFinite(p.durationMin) || !Number.isInteger(p.durationMin) || p.durationMin < MIN_DURATION_MINUTES))) return { ok: false, reason: "invalid" };
      if (p.title === undefined && p.date === undefined && p.startTime === undefined && p.durationMin === undefined) return { ok: false, reason: "invalid" };
      const raw = getPref("xai_calendar_events", scope);
      const store = isObject(raw) ? raw as Record<string, UserCalEvent> : {};
      if (!Object.hasOwn(store, id)) return { ok: false, reason: "not-found" };
      const existing = store[id]!;
      const times = buildISOTimes(existing, p);
      if (times === null) return { ok: false, reason: "invalid" };
      const { next } = updateEvent(store, id, { ...(p.title !== undefined ? { title: p.title.trim() } : {}), ...times });
      return setPref("xai_calendar_events", next, scope) ? { ok: true, targetId: id } : { ok: false, reason: "storage" };
    });
  });
}
