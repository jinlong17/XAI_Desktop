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

import { useCallback, useMemo, useState } from "react";
import { accountScope, mutateCanonicalDataset, usePref } from "@repo/plugin-web-storage";
import type { UserCalEvent } from "./types.js";
import { isCalendarEventStore } from "../aiCommandDomain.js";
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
  ) => Promise<UserCalEvent | null>;
  /** Update + persist; returns the updated entity, or null when id missing. */
  update: (
    id: string,
    patch: Partial<Omit<UserCalEvent, "id" | "createdAt">>,
    expected?: UserCalEvent,
  ) => Promise<UserCalEvent | null>;
  /** Remove + persist; no-op when id missing. */
  remove: (id: string, expected?: UserCalEvent) => Promise<boolean>;
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
  const [eventsRaw] = usePref("xai_calendar_events");
  const events = eventsRaw as Record<string, UserCalEvent>;
  const [scope] = useState(() => accountScope.capture());
  const valid = useCallback(isCalendarEventStore, []);
  const commit = useCallback(async (mutate: (current: Record<string, UserCalEvent>) => { ok: true; data: Record<string, UserCalEvent> } | { ok: false; reason: "not-found" | "conflict" }) => {
    if (!accountScope.isReady(scope)) return null;
    const result = await mutateCanonicalDataset({ key: "xai_calendar_events", scope, validate: valid, initialize: () => ({}), mutate });
    if (!result.ok) return null;
    return result.data;
  }, [scope, valid]);

  const list = useMemo(() => listEvents(events), [events]);

  const create = useCallback(
    async (partial: Omit<UserCalEvent, "id" | "createdAt" | "updatedAt">) => {
      const { created } = createEvent({}, partial);
      const saved = await commit(current => current[created.id] ? { ok: false, reason: "conflict" } : { ok: true, data: { ...current, [created.id]: created } });
      return saved ? created : null;
    },
    [commit],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<UserCalEvent, "id" | "createdAt">>, expected?: UserCalEvent) => {
      let updated: UserCalEvent | null = null;
      const saved = await commit(current => {
        if (expected && JSON.stringify(current[id]) !== JSON.stringify(expected)) return { ok: false, reason: "conflict" };
        const result = updateEvent(current, id, patch);
        updated = result.updated;
        return result.updated ? { ok: true, data: result.next } : { ok: false, reason: "not-found" };
      });
      return saved ? updated : null;
    },
    [commit],
  );

  const remove = useCallback(
    async (id: string, expected?: UserCalEvent) => {
      const saved = await commit(current => !current[id] ? { ok: false, reason: "not-found" }
        : expected && JSON.stringify(current[id]) !== JSON.stringify(expected) ? { ok: false, reason: "conflict" }
          : { ok: true, data: deleteEvent(current, id) });
      return saved !== null;
    },
    [commit],
  );

  const getById = useCallback(
    (id: string) => getEvent(events, id),
    [events],
  );

  return { events, list, create, update, remove, getById };
}
