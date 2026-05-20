import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { CalendarEvent, DataAdapter } from "../types";

const STORAGE_KEY = "xai.plugin-calendar.events";
const CalendarRepoContext = createContext<DataAdapter<CalendarEvent> | undefined>(undefined);

export interface CalendarRepoProviderProps {
  adapter?: DataAdapter<CalendarEvent>;
  repo?: Repo<CalendarEvent>;
  seed?: CalendarEvent[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function CalendarRepoProvider({ adapter, repo, seed = [], children }: CalendarRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<DataAdapter<CalendarEvent>>(() => {
    if (adapter) return adapter;
    if (repo) return new RepoAdapter(repo, seed);
    if (canUseTauriRepo()) {
      return new RepoAdapter(createTauriRepo<CalendarEvent>(invoke, { namespace: "plugin-calendar-events", schemaVersion: 1 }), seed);
    }
    return new LocalStorageAdapter<CalendarEvent>(STORAGE_KEY, seed);
  }, [adapter, invoke, repo, seed]);

  return <CalendarRepoContext.Provider value={value}>{children}</CalendarRepoContext.Provider>;
}

export function useCalendarRepoAdapter(): DataAdapter<CalendarEvent> | undefined {
  return useContext(CalendarRepoContext);
}
