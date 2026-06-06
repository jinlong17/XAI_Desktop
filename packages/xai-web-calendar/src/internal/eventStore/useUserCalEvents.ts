/**
 * @internal — React hook bridging the pure EventStore API to `usePref`.
 *
 * Single source of truth for user calendar events. Stores the entire
 * `Record<string, UserCalEvent>` under the `xai_calendar_events` key.
 * CRUD methods produce a new snapshot via the pure helpers and persist
 * via `setPref` (which also fans out to other tabs via the storage
 * event). The hook returns stable function identities (via `useCallback`)
 * so consumers can memoize on them.
 *
 * Design: docs/design.md §16.7
 * API:    docs/api.md §11.4
 *
 * Notes on cross-tab sync (AC-PERSIST-CREATE-4):
 *   - `usePref` already attaches a `storage` event listener. When tab A
 *     calls `setPref`, tab B's `usePref` re-reads from localStorage and
 *     re-renders. This hook benefits transitively — no extra wiring.
 *   - Same-tab fan-out happens via React state (this hook owns the value
 *     reference; `setPref` updates the React state inside `usePref`).
 */

import { useCallback, useMemo } from "react";
import { usePref } from "@repo/plugin-web-storage";
import type { UserCalEvent } from "./types.js";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  listEvents,
} from "./eventStore.js";

export interface UserCalEventsApi {
  /** Live snapshot, reactive via usePref. */
  events: Record<string, UserCalEvent>;
  /** Array view sorted by createdAt ASC, then id ASC. */
  list: UserCalEvent[];
  /** Create + persist; returns the new entity. */
  create: (
    partial: Omit<UserCalEvent, "id" | "createdAt" | "updatedAt">,
  ) => UserCalEvent;
  /** Update + persist; returns the updated entity, or null when id missing. */
  update: (
    id: string,
    patch: Partial<Omit<UserCalEvent, "id" | "createdAt">>,
  ) => UserCalEvent | null;
  /** Remove + persist; no-op when id missing. */
  remove: (id: string) => void;
  /** Read by id. */
  getById: (id: string) => UserCalEvent | null;
}

/**
 * Bridge between the pure EventStore helpers and React state.
 *
 * Persistence key: `xai_calendar_events` (codec "json", default {}).
 */
export function useUserCalEvents(): UserCalEventsApi {
  // The registry default is `Record<string, unknown>`; cast to the
  // concrete UserCalEvent shape here (single point of truth).
  const [eventsRaw, setEventsRaw] = usePref("xai_calendar_events");
  const events = eventsRaw as Record<string, UserCalEvent>;

  const list = useMemo(() => listEvents(events), [events]);

  const create = useCallback(
    (partial: Omit<UserCalEvent, "id" | "createdAt" | "updatedAt">) => {
      const { next, created } = createEvent(events, partial);
      setEventsRaw(next);
      return created;
    },
    [events, setEventsRaw],
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<UserCalEvent, "id" | "createdAt">>) => {
      const { next, updated } = updateEvent(events, id, patch);
      if (updated) setEventsRaw(next);
      return updated;
    },
    [events, setEventsRaw],
  );

  const remove = useCallback(
    (id: string) => {
      const next = deleteEvent(events, id);
      if (next !== events) setEventsRaw(next);
    },
    [events, setEventsRaw],
  );

  const getById = useCallback(
    (id: string) => getEvent(events, id),
    [events],
  );

  return { events, list, create, update, remove, getById };
}
