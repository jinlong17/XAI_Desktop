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

import { useRef } from "react";
import { useWebEventListener } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";
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

// ---- Idempotency seen-set bound (Rec4 pattern) ------------------------------
const MAX_SEEN = 100;

// ---- Helper: read current TaskCol[] imperatively ----------------------------

function readCols(): TaskCol[] {
  const rawCols = getPref("xai_task_cols") as unknown;
  return Array.isArray(rawCols) ? (rawCols as TaskCol[]) : [];
}

function writeCols(cols: TaskCol[]): void {
  setPref("xai_task_cols", cols as unknown as import("@repo/plugin-web-storage").TaskColsState);
}

/**
 * useTaskMutateRequestSubscriber — zero-UI React hook for delete + update.
 *
 * Mount ONCE in apps/web/src/App.tsx as a Shell-sibling to guarantee
 * route-independent liveness. Mounted alongside the SHIPPED
 * useTaskCreateRequestSubscriber (same precedent, same location).
 *
 * @returns void — renders nothing; side-effect only.
 */
export function useTaskMutateRequestSubscriber(): void {
  // Bounded seen-sets — one per channel.
  const seenDeleteRef = useRef<Set<string>>(new Set());
  const seenUpdateRef = useRef<Set<string>>(new Set());

  // ---- delete handler -------------------------------------------------------
  useWebEventListener("web:tasks:delete-requested", (payload) => {
    const requestId = typeof payload.requestId === "string" ? payload.requestId : "";
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) return;

    // Idempotency guard
    if (requestId) {
      if (seenDeleteRef.current.has(requestId)) return;
      if (seenDeleteRef.current.size >= MAX_SEEN) seenDeleteRef.current.clear();
      seenDeleteRef.current.add(requestId);
    }

    const cols = readCols();
    const next = deleteCard(cols, id);
    if (next !== cols) {
      // Only write if something actually changed (deleteCard returns prev ref on no-op).
      writeCols(next);
    }
  });

  // ---- update handler -------------------------------------------------------
  useWebEventListener("web:tasks:update-requested", (payload) => {
    const requestId = typeof payload.requestId === "string" ? payload.requestId : "";
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) return;

    // Idempotency guard
    if (requestId) {
      if (seenUpdateRef.current.has(requestId)) return;
      if (seenUpdateRef.current.size >= MAX_SEEN) seenUpdateRef.current.clear();
      seenUpdateRef.current.add(requestId);
    }

    // Parse the patch (from the event payload).
    const rawPatch = isObject(payload.patch) ? payload.patch : {};
    const newTitle = typeof rawPatch["title"] === "string" ? rawPatch["title"].trim() || undefined : undefined;
    const newBucket = isValidBucket(rawPatch["bucket"]) ? rawPatch["bucket"] : undefined;
    const newTag = isValidTag(rawPatch["tag"]) ? rawPatch["tag"] : undefined;

    // Nothing actionable?
    if (newTitle === undefined && newBucket === undefined && newTag === undefined) return;

    let cols = readCols();

    // ED-6: bucket change → moveCard composition at subscriber level.
    // moveCard moves the card AND rewrites its date fields for the new bucket.
    // Then updateCard handles any remaining title/tag delta.
    if (newBucket !== undefined) {
      // Find the card's current column.
      let fromColId: BucketId | undefined;
      for (const col of cols) {
        if (col.tasks.find((t) => t.id === id)) {
          fromColId = col.id as BucketId;
          break;
        }
      }
      if (fromColId !== undefined && fromColId !== newBucket) {
        cols = moveCard(cols, id, fromColId, newBucket);
      }
    }

    // Apply title/tag patch (if any).
    const patch: { title?: string; tag?: TaskTagId } = {};
    if (newTitle !== undefined) patch.title = newTitle;
    if (newTag !== undefined) patch.tag = newTag;
    const next = (patch.title !== undefined || patch.tag !== undefined)
      ? updateCard(cols, id, patch)
      : cols;

    // Only write if something changed.
    if (next !== cols || (newBucket !== undefined)) {
      writeCols(next);
    }
  });
}
