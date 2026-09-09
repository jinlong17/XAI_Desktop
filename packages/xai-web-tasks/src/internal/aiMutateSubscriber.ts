/**
 * Always-on durable subscribers for task update and delete commands.
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, commitCanonicalCommand } from "@repo/plugin-web-storage";
import { deleteCard, updateCard, moveCard } from "./tasksReducer.js";
import { isTaskColsArray } from "./validate.js";
import type { TaskCol, BucketId, TaskTagId } from "../types.js";

function isValidBucket(v: unknown): v is BucketId {
  return v === "overdue" || v === "next7" || v === "later" || v === "nodate";
}

function isValidTag(v: unknown): v is TaskTagId {
  return v === "study" || v === "work" || v === "personal" || v === "todo" || v === "other";
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function useTaskMutateRequestSubscriber(): void {
  useWebEventListener("web:tasks:delete-requested", payload => {
    const scope = accountScope.capture();
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) {
      void executeToolWrite("web:tasks:delete-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    void executeToolWrite("web:tasks:delete-requested", payload, scope, () => commitCanonicalCommand<TaskCol[]>({
      key: "xai_task_cols",
      scope,
      channel: "web:tasks:delete-requested",
      requestId: payload.requestId,
      operation: { id },
      validate: isTaskColsArray,
      mutate: cols => {
        if (!cols.some(col => col.tasks.some(task => task.id === id))) return { ok: false, reason: "not-found" };
        return { ok: true, data: deleteCard(cols, id), targetId: id };
      },
    }));
  });

  useWebEventListener("web:tasks:update-requested", payload => {
    const scope = accountScope.capture();
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id || !isObject(payload.patch)) {
      void executeToolWrite("web:tasks:update-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    const p = payload.patch;
    const title = typeof p.title === "string" ? p.title.trim() : undefined;
    if ((p.title !== undefined && !title)
      || (p.bucket !== undefined && !isValidBucket(p.bucket))
      || (p.tag !== undefined && !isValidTag(p.tag))
      || (title === undefined && p.bucket === undefined && p.tag === undefined)) {
      void executeToolWrite("web:tasks:update-requested", payload, scope, async () => ({ ok: false, reason: "invalid" }));
      return;
    }
    const patch = {
      ...(title !== undefined ? { title } : {}),
      ...(p.bucket !== undefined ? { bucket: p.bucket } : {}),
      ...(p.tag !== undefined ? { tag: p.tag } : {}),
    };
    void executeToolWrite("web:tasks:update-requested", payload, scope, () => commitCanonicalCommand<TaskCol[]>({
      key: "xai_task_cols",
      scope,
      channel: "web:tasks:update-requested",
      requestId: payload.requestId,
      operation: { id, patch },
      validate: isTaskColsArray,
      mutate: initial => {
        let cols = initial;
        const from = cols.find(col => col.tasks.some(task => task.id === id));
        if (!from) return { ok: false, reason: "not-found" };
        if (patch.bucket && from.id !== patch.bucket) {
          cols = moveCard(cols, id, from.id as BucketId, patch.bucket);
        }
        const next = updateCard(cols, id, {
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.tag !== undefined ? { tag: patch.tag } : {}),
        });
        return { ok: true, data: next, targetId: id };
      },
    }));
  });
}
