import "../internal/accountMigration.js";
import { describe, expect, it } from "vitest";
import {
  accountMigrationIssue,
  createAccountScopeController,
  generationKey,
  migrateAccount,
} from "@repo/plugin-web-storage";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";

describe("task canonical migration compatibility", () => {
  it("validates envelope data with the task owner validator and retains malformed bytes", () => {
    const valid = JSON.stringify({
      format: "xai-command-state", version: 1, revision: 0,
      data: SEED_TASK_COLS, receipts: {},
    });
    expect(accountMigrationIssue("xai_task_cols", valid)).toBeNull();
    const malformed = JSON.stringify({
      format: "xai-command-state", version: 1, revision: 0,
      data: SEED_TASK_COLS, receipts: { "bad": {} },
    });
    expect(accountMigrationIssue("xai_task_cols", malformed)).toMatch(/canonical command data is invalid/i);
  });

  it("imports a valid envelope as exact recovery bytes without stripping receipts", async () => {
    const raw = JSON.stringify({
      format: "xai-command-state", version: 1, revision: 4,
      data: SEED_TASK_COLS, receipts: {
        "ai:task-create": {
          operationVersion: 1, signature: "tasks:create:v1",
          result: { ok: true, targetId: "task-1" }, committedAt: "2026-09-09T12:00:00.000Z",
        },
      },
    });
    localStorage.setItem("xai_task_cols", raw);
    const controller = createAccountScopeController();
    const marker = await migrateAccount({
      storage: localStorage, controller, transition: controller.lock("canonical-test"),
      choice: "import", selectedKeys: ["xai_task_cols"], lock: async (_name, run) => run(),
      newId: () => "canonical-envelope",
    });
    expect(localStorage.getItem(generationKey("canonical-test", marker.generation, "xai_task_cols"))).toBe(raw);
  });
});
