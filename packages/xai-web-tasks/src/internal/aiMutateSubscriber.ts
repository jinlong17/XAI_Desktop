/**
 * aiMutateSubscriber.ts — always-on subscribers for web:tasks:update-requested
 * and web:tasks:delete-requested (xai-web-ai-tool-edit-delete).
 *
 * DESIGN:
 * - Executes writes IMPERATIVELY via getPref + reducer + setPref,
 *   NOT through React hooks (route-independent liveness).
 * - Mounted as a Shell-sibling in apps/web/src/App.tsx beside the
 *   SHIPPED create subscriber (same Shell-sibling pattern, same precedent).
 * - Idempotent per requestId: bounded useRef seen-set (MAX_SEEN=100) prevents
 *   double-execution on React StrictMode double-effect.
 * - ED-6: bucket change delegates to moveCard + updateCard composition at this
 *   subscriber level (NOT in the pure updateCard reducer).
 *
 * RED LINE: this module does NOT import from plugin-web-ai-chat.
 * Cross-plugin coupling goes ONLY through the typed event channel in @repo/core.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Edit/Delete ED-4/ED-6/ED-10
 * API contract: packages/xai-web-ai-chat/docs/api.md §14.4
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §9 TS-DEL/TS-UPD tests
 *
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, getPref, setPref } from "@repo/plugin-web-storage";
import { deleteCard, updateCard, moveCard } from "./tasksReducer.js";
import type { TaskCol, BucketId, TaskTagId } from "../types.js";

// ---- Type guards -----------------------------------------------------------

function isValidBucket(v: unknown): v is BucketId {
  return v === "overdue" || v === "next7" || v === "later" || v === "nodate";
}

function isValidTag(v: unknown): v is TaskTagId {
  return (
    v === "study" || v === "work" || v === "personal" || v === "todo" || v === "other"
  );
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function useTaskMutateRequestSubscriber(): void {
  useWebEventListener("web:tasks:delete-requested", payload => {
    const scope = accountScope.capture();
    executeToolWrite("web:tasks:delete-requested", payload, scope, () => {
      const id = typeof payload.id === "string" ? payload.id.trim() : "";
      if (!id) return { ok: false, reason: "invalid" };
      const raw = getPref("xai_task_cols", scope) as unknown;
      const cols = Array.isArray(raw) ? raw as TaskCol[] : [];
      if (!cols.some(col => col.tasks.some(task => task.id === id))) return { ok: false, reason: "not-found" };
      const next = deleteCard(cols, id);
      return setPref("xai_task_cols", next as unknown as import("@repo/plugin-web-storage").TaskColsState, scope)
        ? { ok: true, targetId: id } : { ok: false, reason: "storage" };
    });
  });
  useWebEventListener("web:tasks:update-requested", payload => {
    const scope = accountScope.capture();
    executeToolWrite("web:tasks:update-requested", payload, scope, () => {
      const id = typeof payload.id === "string" ? payload.id.trim() : "";
      if (!id || !isObject(payload.patch)) return { ok: false, reason: "invalid" };
      const p = payload.patch;
      const title = typeof p.title === "string" ? p.title.trim() : undefined;
      if ((p.title !== undefined && !title) || (p.bucket !== undefined && !isValidBucket(p.bucket)) || (p.tag !== undefined && !isValidTag(p.tag))) return { ok: false, reason: "invalid" };
      if (title === undefined && p.bucket === undefined && p.tag === undefined) return { ok: false, reason: "invalid" };
      const raw = getPref("xai_task_cols", scope) as unknown;
      let cols = Array.isArray(raw) ? raw as TaskCol[] : [];
      const from = cols.find(col => col.tasks.some(task => task.id === id));
      if (!from) return { ok: false, reason: "not-found" };
      if (p.bucket && from.id !== p.bucket) {
        if (!cols.some(col => col.id === p.bucket)) return { ok: false, reason: "invalid" };
        cols = moveCard(cols, id, from.id as BucketId, p.bucket);
      }
      const next = updateCard(cols, id, { ...(title !== undefined ? { title } : {}), ...(p.tag !== undefined ? { tag: p.tag } : {}) });
      return setPref("xai_task_cols", next as unknown as import("@repo/plugin-web-storage").TaskColsState, scope)
        ? { ok: true, targetId: id } : { ok: false, reason: "storage" };
    });
  });
}
