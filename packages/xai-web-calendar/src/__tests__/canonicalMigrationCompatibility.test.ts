import "../internal/accountMigration.js";
import { describe, expect, it } from "vitest";
import { accountMigrationIssue } from "@repo/plugin-web-storage";

const event = {
  id: "event-1", title: "Review", startISO: "2026-09-09T09:00",
  endISO: "2026-09-09T10:00", colorPreset: "mint", recurrence: null,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};

describe("calendar canonical migration compatibility", () => {
  it("validates envelope data with the calendar owner validator and retains unknown versions", () => {
    const valid = JSON.stringify({
      format: "xai-command-state", version: 1, revision: 0,
      data: { [event.id]: event }, receipts: {},
    });
    expect(accountMigrationIssue("xai_calendar_events", valid)).toBeNull();
    const unknown = JSON.stringify({ ...JSON.parse(valid), version: 2 });
    expect(accountMigrationIssue("xai_calendar_events", unknown)).toMatch(/version is unsupported/i);
  });

  it("uses the A1 civil-date contract for low-year and leap-day migration data", () => {
    const accepted = JSON.stringify({
      format: "xai-command-state", version: 1, revision: 0,
      data: { low: { ...event, id: "low", startISO: "0004-02-29T09:00", endISO: "0004-02-29T10:00" } }, receipts: {},
    });
    expect(accountMigrationIssue("xai_calendar_events", accepted)).toBeNull();
    const rejected = JSON.stringify({
      format: "xai-command-state", version: 1, revision: 0,
      data: { invalid: { ...event, id: "invalid", startISO: "2026-04-31T09:00", endISO: "2026-04-31T10:00" } }, receipts: {},
    });
    expect(accountMigrationIssue("xai_calendar_events", rejected)).toMatch(/module format is invalid/i);
  });

  it("keeps the map key and event identity contract instead of renaming imported records", () => {
    const mismatched = JSON.stringify({
      format: "xai-command-state", version: 1, revision: 0,
      data: { wrong: event }, receipts: {},
    });
    expect(accountMigrationIssue("xai_calendar_events", mismatched)).toMatch(/module format is invalid/i);
  });
});
