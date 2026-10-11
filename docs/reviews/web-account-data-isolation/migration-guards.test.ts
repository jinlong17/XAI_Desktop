import { expect, it } from "vitest";
import { ACCOUNT_LOCAL_KEYS, accountMigrationIssue } from "../../../packages/plugin-web-storage/src/index.js";
import "../../../packages/xai-web-tasks/src/internal/accountMigration.js";
import "../../../packages/xai-web-habits/src/internal/accountMigration.js";
import "../../../packages/plugin-web-board-core/src/internal/accountMigration.js";
import "../../../packages/plugin-web-board-workspaces/src/internal/accountMigration.js";
import "../../../packages/plugin-web-pomodoro/src/internal/accountMigration.js";
import "../../../packages/plugin-web-countdown/src/internal/accountMigration.js";
import "../../../packages/xai-web-matrix/src/internal/accountMigration.js";
import "../../../packages/xai-web-calendar/src/internal/accountMigration.js";
import "../../../packages/xai-web-meditation/src/internal/accountMigration.js";
import "../../../packages/xai-web-dashboard-widgets/src/internal/accountMigration.js";
import "../../../packages/plugin-web-time-tracker/src/internal/storage.js";
import "../../../packages/plugin-web-bookkeeping/src/internal/storage.js";
import "../../../packages/plugin-web-metric-tracker/src/internal/storage.js";
import "../../../packages/plugin-web-time-tracker/src/TimeTrackerModule.js";

it.each(ACCOUNT_LOCAL_KEYS.filter(key => key !== 'xai_ai_convos'))('owner guard is registered for %s and never throws on JSON null', key => {
  const issue=accountMigrationIssue(key,'null');
  expect(issue ?? "").not.toMatch(/unavailable/);
});
it('imports valid empty owner collections without normalizing malformed blobs', () => {
 for (const key of ['xai_boards_v2','xai_board_workspaces','xai_board_inbox','xai_countdowns','xai_pomodoro_sessions','xai_tt_entries_v2','xai_tt_categories_v2']) {
  expect(accountMigrationIssue(key,'[]'),key).toBeNull();
  expect(accountMigrationIssue(key,'[{"invalid":true}]'),key).toMatch(/invalid/);
 }
 for (const key of ['xai_calendar_events','xai_dashboard_stickies','xai_board_filter_by_id']) expect(accountMigrationIssue(key,'{}'),key).toBeNull();
 expect(accountMigrationIssue('xai_dashboard_weather','null')).toBeNull();
});
