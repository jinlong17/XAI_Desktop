import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { isValidCivilDate } from "./civilDate.js";
import { validateUserCalEvent, type UserCalEventDraft } from "./eventStore/validators.js";

const EVENT_COLORS = new Set(["mint", "amber", "blue", "violet", "rose"]);
const LOCAL_ISO = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)$/;

function isCalendarEvent(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const event = value as Record<string, unknown>;
  if (
    typeof event.id !== "string" || !event.id
    || typeof event.title !== "string"
    || typeof event.startISO !== "string"
    || typeof event.endISO !== "string"
    || !EVENT_COLORS.has(event.colorPreset as string)
    || typeof event.createdAt !== "string" || !Number.isFinite(Date.parse(event.createdAt))
    || typeof event.updatedAt !== "string" || !Number.isFinite(Date.parse(event.updatedAt))
  ) return false;
  if (event.recurrence !== null && (
    !event.recurrence || typeof event.recurrence !== "object"
    || ((event.recurrence as Record<string, unknown>).kind !== "daily"
      && (event.recurrence as Record<string, unknown>).kind !== "weekly")
  )) return false;
  const start = LOCAL_ISO.exec(event.startISO);
  const end = LOCAL_ISO.exec(event.endISO);
  if (!start || !end || start[1] !== end[1] || !isValidCivilDate(start[1])) return false;
  const draft: UserCalEventDraft = {
    title: event.title,
    date: start[1]!,
    startTime: `${start[2]}:${start[3]}`,
    endTime: `${end[2]}:${end[3]}`,
    colorPreset: event.colorPreset as UserCalEventDraft["colorPreset"],
    recurrence: event.recurrence as UserCalEventDraft["recurrence"],
  };
  return validateUserCalEvent(draft).length === 0;
}

registerAccountMigrationValidator("xai_calendar_events", value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(([id, event]) => (
    id.length > 0
    && isCalendarEvent(event)
    && (event as { id: string }).id === id
  ));
});
