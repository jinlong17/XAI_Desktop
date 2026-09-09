/**
 * aiCreateSubscriber.ts — always-on subscriber for web:tasks:create-requested.
 *
 * DESIGN:
 * - Executes the write IMPERATIVELY via getPref + addCard + setPref,
 *   NOT through React hooks (so it works even when TasksModule is not mounted).
 * - Mounted as a Shell-sibling in apps/web/src/App.tsx (route-independent liveness).
 * - Idempotent per requestId: a bounded useRef seen-set (per Rec4) prevents
 *   double-execution on React StrictMode double-effect or rapid re-mounts.
 * - addCard is INTERNAL to this package — no export needed (R8 resolved).
 *
 * RED LINE: this module does NOT import from plugin-web-ai-chat.
 * Cross-plugin coupling goes ONLY through the typed event channel in @repo/core.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension §5.4
 * API contract: packages/xai-web-ai-chat/docs/api.md §13.5
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 TS tests
 *
 * @internal
 */

import { executeToolWrite, useWebEventListener } from "@repo/xai-web-event-bus";
import { accountScope, getPref, setPref } from "@repo/plugin-web-storage";
import { addCard } from "./tasksReducer.js";
import { SEED_TASK_COLS } from "./seed/tasksMock.js";
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

export function useTaskCreateRequestSubscriber(): void {
  useWebEventListener("web:tasks:create-requested", payload => {
    const scope = accountScope.capture();
    executeToolWrite("web:tasks:create-requested", payload, scope, () => {
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      if (!title) return { ok: false, reason: "invalid" };
      const bucket: BucketId = isValidBucket(payload.bucket) ? payload.bucket : "next7";
      const tag = isValidTag(payload.tag) ? payload.tag : undefined;
      const raw = getPref("xai_task_cols", scope) as unknown;
      const cols = Array.isArray(raw) && raw.length ? raw as TaskCol[] : SEED_TASK_COLS as TaskCol[];
      const next = addCard(cols, { title, tag, withDate: bucket !== "nodate" }, bucket);
      if (next === cols) return { ok: false, reason: "invalid" };
      const created = next.find(col => col.id === bucket)?.tasks[0];
      if (!created) return { ok: false, reason: "invalid" };
      return setPref("xai_task_cols", next as unknown as import("@repo/plugin-web-storage").TaskColsState, scope)
        ? { ok: true, targetId: created.id } : { ok: false, reason: "storage" };
    });
  });
}
