/**
 * @internal — React hook bridging the pure StickyStore API to `usePref`.
 *
 * Single source of truth for user sticky notes. Stores the entire
 * `Record<string, UserSticky>` under the `xai_dashboard_stickies` key.
 * CRUD methods produce a new snapshot via the pure helpers and persist
 * via `setPref` (which also fans out to other tabs via the storage event).
 * The hook returns stable function identities (via `useCallback`)
 * so consumers can memoize on them.
 *
 * Verbatim port of xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts
 * scaled down to the simpler sticky model (no update).
 *
 * Persistence key: `xai_dashboard_stickies` (codec "json", default {}).
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §E.3
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §E
 */

import { useCallback, useMemo } from "react";
import { usePref } from "@repo/plugin-web-storage";
import type { UserSticky, NewStickyDraft } from "./types.js";
import {
  createSticky,
  deleteSticky,
  listStickies,
} from "./stickiesStore.js";

export interface StickiesApi {
  /** Live snapshot, reactive via usePref. */
  stickies: Record<string, UserSticky>;
  /** Array view sorted by createdAt ASC, then id ASC. */
  list: UserSticky[];
  /** Create + persist; returns the new entity. */
  create: (draft: NewStickyDraft) => UserSticky;
  /** Remove + persist; no-op when id missing. */
  remove: (id: string) => void;
}

/**
 * Bridge between the pure StickyStore helpers and React state.
 *
 * Persistence key: `xai_dashboard_stickies` (codec "json", default {}).
 */
export function useStickies(): StickiesApi {
  // The registry default is `Record<string, unknown>`; cast to the
  // concrete UserSticky shape here (single point of truth).
  const [stickiesRaw, setStickiesRaw] = usePref("xai_dashboard_stickies");
  const stickies = stickiesRaw as Record<string, UserSticky>;

  const list = useMemo(() => listStickies(stickies), [stickies]);

  const create = useCallback(
    (draft: NewStickyDraft) => {
      const { next, created } = createSticky(stickies, draft);
      setStickiesRaw(next);
      return created;
    },
    [stickies, setStickiesRaw],
  );

  const remove = useCallback(
    (id: string) => {
      const next = deleteSticky(stickies, id);
      if (next !== stickies) setStickiesRaw(next);
    },
    [stickies, setStickiesRaw],
  );

  return { stickies, list, create, remove };
}
