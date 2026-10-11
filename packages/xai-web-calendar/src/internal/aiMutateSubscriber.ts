/**
 * Always-on durable subscribers for calendar update and delete commands.
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, commitCanonicalCommand } from "@repo/plugin-web-storage";
import { isCalendarEventStore } from "./aiCommandDomain.js";
import { isValidCivilDate } from "./civilDate.js";
import { updateEvent, deleteEvent } from "./eventStore/eventStore.js";
import type { UserCalEvent } from "./eventStore/types.js";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MIN_DURATION_MINUTES = 5;
const LAST_END_MINUTE = 23 * 60 + 55;

type TimePatch = { date?: string; startTime?: string; durationMin?: number };

function buildISOTimes(existing: UserCalEvent, patch: TimePatch): { startISO?: string; endISO?: string } | null {
  if (patch.date === undefined && patch.startTime === undefined && patch.durationMin === undefined) return {};
  const baseDate = existing.startISO.slice(0, 10);
  const baseStartTime = existing.startISO.slice(11, 16);
  const existingEndMin = Number(existing.endISO.slice(11, 13)) * 60 + Number(existing.endISO.slice(14, 16));
  const existingStartMin = Number(existing.startISO.slice(11, 13)) * 60 + Number(existing.startISO.slice(14, 16));
  const baseDurationMin = existingEndMin - existingStartMin;
  const newDate = patch.date ?? baseDate;
  const newStart = patch.startTime ?? baseStartTime;
  const newDur = patch.durationMin ?? baseDurationMin;
  if (!isValidCivilDate(newDate)
    || !HHMM_RE.test(newStart)
    || !Number.isFinite(newDur)
    || !Number.isInteger(newDur)
    || newDur < MIN_DURATION_MINUTES) return null;
  const [hStr, mStr] = newStart.split(":");
  const startMin = Number(hStr) * 60 + Number(mStr);
  const endMin = startMin + newDur;
  if (endMin > LAST_END_MINUTE) return null;
  return {
    startISO: `${newDate}T${newStart}`,
    endISO: `${newDate}T${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`,
  };
}

export function useCalendarMutateRequestSubscriber(): void {
  useWebEventListener("web:calendar:delete-requested", payload => {
    const scope = accountScope.capture();
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) {
      void executeToolWrite("web:calendar:delete-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    void executeToolWrite("web:calendar:delete-requested", payload, scope, () => commitCanonicalCommand<Record<string, UserCalEvent>>({
      key: "xai_calendar_events",
      scope,
      channel: "web:calendar:delete-requested",
      requestId: payload.requestId,
      operation: { id },
      validate: isCalendarEventStore,
      mutate: store => Object.hasOwn(store, id)
        ? { ok: true, data: deleteEvent(store, id), targetId: id }
        : { ok: false, reason: "not-found" },
    }));
  });

  useWebEventListener("web:calendar:update-requested", payload => {
    const scope = accountScope.capture();
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id || !isObject(payload.patch)) {
      void executeToolWrite("web:calendar:update-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    const p = payload.patch;
    const title = typeof p.title === "string" ? p.title.trim() : undefined;
    if ((p.title !== undefined && !title)
      || (p.date !== undefined && !isValidCivilDate(p.date))
      || (p.startTime !== undefined && (typeof p.startTime !== "string" || !HHMM_RE.test(p.startTime)))
      || (p.durationMin !== undefined && (typeof p.durationMin !== "number"
        || !Number.isFinite(p.durationMin)
        || !Number.isInteger(p.durationMin)
        || p.durationMin < MIN_DURATION_MINUTES))
      || (title === undefined && p.date === undefined && p.startTime === undefined && p.durationMin === undefined)) {
      void executeToolWrite("web:calendar:update-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    const timePatch: TimePatch = {
      ...(p.date !== undefined ? { date: p.date } : {}),
      ...(p.startTime !== undefined ? { startTime: p.startTime } : {}),
      ...(p.durationMin !== undefined ? { durationMin: p.durationMin } : {}),
    };
    const patch = { ...(title !== undefined ? { title } : {}), ...timePatch };
    void executeToolWrite("web:calendar:update-requested", payload, scope, () => commitCanonicalCommand<Record<string, UserCalEvent>>({
      key: "xai_calendar_events",
      scope,
      channel: "web:calendar:update-requested",
      requestId: payload.requestId,
      operation: { id, patch },
      validate: isCalendarEventStore,
      mutate: store => {
        const existing = store[id];
        if (!existing) return { ok: false, reason: "not-found" };
        const times = buildISOTimes(existing, timePatch);
        if (!times) return { ok: false, reason: "invalid" };
        const { next, updated } = updateEvent(store, id, { ...(title !== undefined ? { title } : {}), ...times });
        return updated
          ? { ok: true, data: next, targetId: id }
          : { ok: false, reason: "not-found" };
      },
    }));
  });
}
