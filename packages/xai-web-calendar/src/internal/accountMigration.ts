import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { validateUserCalEvent, type UserCalEventDraft } from "./eventStore/validators.js";
registerAccountMigrationValidator("xai_calendar_events", value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(event => event && typeof event === "object" && typeof event.id === "string" && typeof event.createdAt === "string" && typeof event.updatedAt === "string" && validateUserCalEvent(event as UserCalEventDraft).length === 0);
});
