/**
 * Always-on durable subscriber for web:calendar:create-requested.
 * The event mutation and its receipt are committed in one canonical write.
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, commitCanonicalCommand } from "@repo/plugin-web-storage";
import { isCalendarEventStore } from "./aiCommandDomain.js";
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

function buildISOTimes(date: string, startTime: string, durationMin: number): { startISO: string; endISO: string } | null {
  const [hStr, mStr] = startTime.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const endMinutes = h * 60 + m + durationMin;
  if (endMinutes > LAST_END_MINUTE) return null;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  return {
    startISO: `${date}T${startTime}`,
    endISO: `${date}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
  };
}

export function useCalendarCreateRequestSubscriber(): void {
  useWebEventListener("web:calendar:create-requested", payload => {
    const scope = accountScope.capture();
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const date = payload.date === undefined ? undefined : payload.date;
    const startTime = payload.startTime === undefined ? undefined : payload.startTime;
    const durationMin = payload.durationMin === undefined ? undefined : payload.durationMin;
    if (!title
      || (date !== undefined && !isValidCivilDate(date))
      || (startTime !== undefined && (typeof startTime !== "string" || !HHMM_RE.test(startTime)))
      || (durationMin !== undefined && (typeof durationMin !== "number"
        || !Number.isFinite(durationMin)
        || !Number.isInteger(durationMin)
        || durationMin < MIN_DURATION_MINUTES))) {
      void executeToolWrite("web:calendar:create-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    // Omitted defaults stay omitted in the durable signature. They are
    // materialized only if this identity reaches its first mutation.
    const operation = {
      title,
      date: date ?? null,
      startTime: startTime ?? null,
      durationMin: durationMin ?? null,
    };
    void executeToolWrite("web:calendar:create-requested", payload, scope, () => commitCanonicalCommand<Record<string, UserCalEvent>>({
      key: "xai_calendar_events",
      scope,
      channel: "web:calendar:create-requested",
      requestId: payload.requestId,
      operation,
      validate: isCalendarEventStore,
      initialize: () => ({}),
      mutate: store => {
        const resolvedDate = date ?? todayDateKey();
        const resolvedStart = startTime ?? "09:00";
        const resolvedDuration = durationMin ?? 60;
        const times = buildISOTimes(resolvedDate, resolvedStart, resolvedDuration);
        if (!times) return { ok: false, reason: "invalid" };
        const { next, created } = createEvent(store, {
          title,
          ...times,
          colorPreset: "mint",
          recurrence: null,
        });
        return { ok: true, data: next, targetId: created.id };
      },
    }));
  });
}
