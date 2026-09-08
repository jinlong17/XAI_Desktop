/**
 * @internal — buildIndex.ts
 *
 * Aggregates search hits from all registered adapters for a given query.
 * Pure function: no side effects; no I/O.
 *
 * Algorithm:
 * 1. Lowercase query.
 * 2. Iterate registered adapters in insertion order (deterministic).
 * 3. For each adapter, invoke adapter(lowerQuery, moduleStates[moduleId]).
 * 4. Catch any adapter throws — omit that adapter's hits, continue.
 * 5. Concatenate results, sort by score desc then moduleId asc (tie-break).
 * 6. Cap at 50 total hits.
 * 7. Return frozen array.
 *
 * api.md §6
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit } from "../types.js";
import { getRegisteredAdapters } from "./registry.js";

/**
 * Build the search result list from all registered adapters.
 *
 * @param query - Raw query string (may contain uppercase; buildIndex lowercases it).
 * @param moduleStates - State snapshot captured at palette-open time.
 * @returns Frozen array of up to 50 hits, sorted by score desc then moduleId asc.
 */
export function buildIndex(
  query: string,
  moduleStates: Readonly<Record<WebModuleId, unknown>>,
): readonly SearchHit[] {
  const lowerQuery = query.toLowerCase();
  const adapters = getRegisteredAdapters();
  const allHits: SearchHit[] = [];

  for (const [moduleId, adapter] of adapters) {
    const state = (moduleStates as Record<string, unknown>)[moduleId] ?? {};
    try {
      const hits = adapter(lowerQuery, state);
      for (const hit of hits) {
        allHits.push(hit);
      }
    } catch {
      // R6: silently omit this adapter's hits; other adapters still run.
      // In production we swallow; in development we could log.
      if (process.env.NODE_ENV === "development") {
        console.warn(`[xai-web-cmdk] buildIndex: adapter for "${moduleId}" threw`);
      }
    }
  }

  // Sort: score desc, then moduleId asc (deterministic tie-break — O4)
  allHits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.moduleId.localeCompare(b.moduleId);
  });

  // Cap at 50 hits
  const capped = allHits.slice(0, 50);

  return Object.freeze(capped);
}
