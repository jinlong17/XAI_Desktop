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

import { useRef } from "react";
import { useWebEventListener } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";
import { addCard } from "./tasksReducer.js";
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

// ---- Idempotency seen-set bound (Rec4) --------------------------------------
const MAX_SEEN = 100;

/**
 * useTaskCreateRequestSubscriber — zero-UI React hook.
 *
 * Mount ONCE in apps/web/src/App.tsx as a Shell-sibling to guarantee
 * route-independent liveness (R4 mitigation — TS-3 assertion).
 *
 * @returns void — renders nothing; side-effect only.
 */
export function useTaskCreateRequestSubscriber(): void {
  // Bounded seen-set — cleared on unmount (when the ref is GC'd with the component).
  const seenRef = useRef<Set<string>>(new Set());

  useWebEventListener("web:tasks:create-requested", (payload) => {
    const requestId = typeof payload.requestId === "string" ? payload.requestId : "";

    // Idempotency guard (Rec4: bounded seen-set).
    if (requestId) {
      if (seenRef.current.has(requestId)) return; // duplicate — skip
      // Bound the set size to prevent unbounded growth.
      if (seenRef.current.size >= MAX_SEEN) {
        // Clear the oldest entries by rebuilding (simple approach for bounded sessions).
        seenRef.current.clear();
      }
      seenRef.current.add(requestId);
    }

    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    if (!title) return;

    const bucket: BucketId = isValidBucket(payload.bucket) ? payload.bucket : "next7";
    const tag = isValidTag(payload.tag) ? payload.tag : undefined;
    // Rec3: derive withDate from bucket (bucket !== "nodate" → withDate=true).
    const withDate = bucket !== "nodate";

    // Read the current store imperatively (not via usePref hook).
    // Cast through unknown: the registry type (TaskColsState = Record<string, boolean>)
    // is a legacy placeholder; the real runtime value is TaskCol[].
    const rawCols = getPref("xai_task_cols") as unknown;
    const cols = Array.isArray(rawCols) ? (rawCols as TaskCol[]) : [];

    // Execute via the INTERNAL pure reducer.
    const next = addCard(cols, { title, tag, withDate }, bucket);

    // Write back via imperative setPref.
    // Cast through unknown for the same registry-type mismatch reason.
    setPref("xai_task_cols", next as unknown as import("@repo/plugin-web-storage").TaskColsState);
  });
}
