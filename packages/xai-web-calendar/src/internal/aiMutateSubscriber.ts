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

import { useRef } from "react";
import { useWebEventListener } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";
import { updateEvent, deleteEvent } from "./eventStore/eventStore.js";
import type { UserCalEvent } from "./eventStore/types.js";

// ---- Type guards -----------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Builds startISO/endISO when date+startTime+durationMin are patched. */
function buildISOTimes(
  existing: UserCalEvent,
  patch: {
    date?: string;
    startTime?: string;
    durationMin?: number;
  },
): { startISO?: string; endISO?: string } {
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

  const newDate = typeof patch.date === "string" && DATE_RE.test(patch.date)
    ? patch.date
    : baseDate;
  const newStart = typeof patch.startTime === "string" && HHMM_RE.test(patch.startTime)
    ? patch.startTime
    : baseStartTime;
  const newDur = typeof patch.durationMin === "number" && patch.durationMin > 0
    ? Math.round(patch.durationMin)
    : baseDurationMin;

  const [hStr, mStr] = newStart.split(":");
  const h = parseInt(hStr ?? "9", 10);
  const m = parseInt(mStr ?? "0", 10);
  const startMin = h * 60 + m;
  const endMin = Math.min(startMin + newDur, 23 * 60 + 55);
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;

  const startISO = `${newDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const endISO = `${newDate}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

  return { startISO, endISO };
}

// ---- Idempotency seen-set bound (Rec4 pattern) ------------------------------
const MAX_SEEN = 100;

/**
 * useCalendarMutateRequestSubscriber — zero-UI React hook for delete + update.
 *
 * Mount ONCE in apps/web/src/App.tsx as a Shell-sibling to guarantee
 * route-independent liveness. Mounted alongside the SHIPPED
 * useCalendarCreateRequestSubscriber.
 *
 * @returns void — renders nothing; side-effect only.
 */
export function useCalendarMutateRequestSubscriber(): void {
  const seenDeleteRef = useRef<Set<string>>(new Set());
  const seenUpdateRef = useRef<Set<string>>(new Set());

  // ---- delete handler -------------------------------------------------------
  useWebEventListener("web:calendar:delete-requested", (payload) => {
    const requestId = typeof payload.requestId === "string" ? payload.requestId : "";
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) return;

    if (requestId) {
      if (seenDeleteRef.current.has(requestId)) return;
      if (seenDeleteRef.current.size >= MAX_SEEN) seenDeleteRef.current.clear();
      seenDeleteRef.current.add(requestId);
    }

    const rawStore = getPref("xai_calendar_events");
    const store: Record<string, UserCalEvent> =
      isObject(rawStore) ? (rawStore as Record<string, UserCalEvent>) : {};

    const next = deleteEvent(store, id);
    if (next !== store) {
      setPref("xai_calendar_events", next);
    }
  });

  // ---- update handler -------------------------------------------------------
  useWebEventListener("web:calendar:update-requested", (payload) => {
    const requestId = typeof payload.requestId === "string" ? payload.requestId : "";
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) return;

    if (requestId) {
      if (seenUpdateRef.current.has(requestId)) return;
      if (seenUpdateRef.current.size >= MAX_SEEN) seenUpdateRef.current.clear();
      seenUpdateRef.current.add(requestId);
    }

    const rawPatch = isObject(payload.patch) ? payload.patch : {};
    const newTitle = typeof rawPatch["title"] === "string" ? rawPatch["title"].trim() || undefined : undefined;
    const newDate = typeof rawPatch["date"] === "string" && DATE_RE.test(rawPatch["date"])
      ? rawPatch["date"]
      : undefined;
    const newStartTime = typeof rawPatch["startTime"] === "string" && HHMM_RE.test(rawPatch["startTime"])
      ? rawPatch["startTime"]
      : undefined;
    const newDurationMin = typeof rawPatch["durationMin"] === "number" && rawPatch["durationMin"] > 0
      ? rawPatch["durationMin"]
      : undefined;

    // Nothing actionable?
    if (newTitle === undefined && newDate === undefined && newStartTime === undefined && newDurationMin === undefined) {
      return;
    }

    const rawStore = getPref("xai_calendar_events");
    const store: Record<string, UserCalEvent> =
      isObject(rawStore) ? (rawStore as Record<string, UserCalEvent>) : {};

    const existing = store[id];
    if (!existing) return; // unknown id — no-op (safe silent no-op per §14.6)

    // Build ISO times if any time-related field changed.
    const isoTimes = buildISOTimes(existing, {
      date: newDate,
      startTime: newStartTime,
      durationMin: newDurationMin,
    });

    const patch: Partial<Omit<UserCalEvent, "id" | "createdAt">> = {};
    if (newTitle !== undefined) patch.title = newTitle;
    if (isoTimes.startISO !== undefined) patch.startISO = isoTimes.startISO;
    if (isoTimes.endISO !== undefined) patch.endISO = isoTimes.endISO;

    if (Object.keys(patch).length === 0) return; // nothing to apply

    const { next } = updateEvent(store, id, patch);
    if (next !== store) {
      setPref("xai_calendar_events", next);
    }
  });
}
