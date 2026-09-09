/**
 * Always-on durable subscriber for web:tasks:create-requested.
 * The task mutation and its receipt are committed in one canonical write.
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, commitCanonicalCommand } from "@repo/plugin-web-storage";
import { addCard } from "./tasksReducer.js";
import { SEED_TASK_COLS } from "./seed/tasksMock.js";
import { isTaskColsArray } from "./validate.js";
import type { TaskCol, BucketId, TaskTagId } from "../types.js";

function isValidBucket(v: unknown): v is BucketId {
  return v === "overdue" || v === "next7" || v === "later" || v === "nodate";
}

function isValidTag(v: unknown): v is TaskTagId {
  return v === "study" || v === "work" || v === "personal" || v === "todo" || v === "other";
}

function initialTaskCols(): TaskCol[] {
  return SEED_TASK_COLS.map(col => ({
    ...col,
    tasks: [...col.tasks],
    ...(col.completed ? { completed: [...col.completed] } : {}),
  }));
}

export function useTaskCreateRequestSubscriber(): void {
  useWebEventListener("web:tasks:create-requested", payload => {
    const scope = accountScope.capture();
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const bucket = payload.bucket === undefined
      ? "next7"
      : isValidBucket(payload.bucket) ? payload.bucket : undefined;
    const tag = isValidTag(payload.tag) ? payload.tag : undefined;
    if (!title || bucket === undefined || (payload.tag !== undefined && tag === undefined)) {
      void executeToolWrite("web:tasks:create-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    const operation = { title, bucket, ...(tag === undefined ? {} : { tag }) };
    void executeToolWrite("web:tasks:create-requested", payload, scope, () => commitCanonicalCommand<TaskCol[]>({
      key: "xai_task_cols",
      scope,
      channel: "web:tasks:create-requested",
      requestId: payload.requestId,
      operation,
      validate: isTaskColsArray,
      initialize: initialTaskCols,
      mutate: cols => {
        const next = addCard(cols, { title, tag, withDate: bucket !== "nodate" }, bucket);
        if (next === cols) return { ok: false, reason: "invalid" };
        const created = next.find(col => col.id === bucket)?.tasks[0];
        return created
          ? { ok: true, data: next, targetId: created.id }
          : { ok: false, reason: "invalid" };
      },
    }));
  });
}
