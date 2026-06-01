/**
 * @internal — navigateToHit.ts
 *
 * Pure function that resolves the navigation path from a SearchHit, emits
 * web:search:jump, and calls the navigate function.
 *
 * api.md §9
 */

import type { SearchHit } from "../types.js";
import type { EventMap } from "@repo/core/types";

type NavigateFn = (path: string) => void;
type EmitFn = (event: "web:search:jump", payload: EventMap["web:search:jump"]) => void;

/**
 * Navigate to the hit's destination, emitting web:search:jump before navigation.
 *
 * - "module-jump" → /app/${moduleId}
 * - "entity" → /app/${moduleId} (module consumes jump event for entity scroll)
 * - "settings-pane" → /app/settings/:paneId
 */
export function navigateToHit(
  hit: SearchHit,
  navigate: NavigateFn,
  emit: EmitFn,
  query: string,
): void {
  const path =
    hit.kind === "settings-pane"
      ? `/app/settings/${encodeURIComponent(hit.entityId ?? "")}`
      : `/app/${hit.moduleId}`;

  // Emit jump event first (observers can scroll-into-view before navigation)
  emit("web:search:jump", {
    moduleId: hit.moduleId,
    hitKind: hit.kind,
    entityId: hit.entityId ?? null,
    query: query.slice(0, 256),
    jumpedAt: new Date().toISOString(),
  });

  // Then navigate
  navigate(path);
}
