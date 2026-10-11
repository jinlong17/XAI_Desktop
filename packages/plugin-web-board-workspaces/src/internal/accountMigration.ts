import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { isBoardPanelState, isInboxCardArray } from "./guards.js";
registerAccountMigrationValidator("xai_board_panels", value => isBoardPanelState(value) || (Array.isArray(value) && value.length === 1 && isBoardPanelState(value[0])));
registerAccountMigrationValidator("xai_board_inbox", isInboxCardArray);
registerAccountMigrationValidator("xai_board_filter_by_id", value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(filter => {
    if (!filter || typeof filter !== "object") return false;
    return Array.isArray(filter.labels) && filter.labels.every((item: unknown) => typeof item === "string")
      && Array.isArray(filter.members) && filter.members.every((item: unknown) => typeof item === "string")
      && Array.isArray(filter.priorities) && filter.priorities.every((item: unknown) => ["urgent", "high", "medium", "low"].includes(String(item)))
      && ["all", "overdue", "today", "week"].includes(filter.dueRange);
  });
});
