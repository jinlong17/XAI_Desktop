import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { ConsoleNotification, DataAdapter } from "../types";

const STORAGE_KEY = "xai.plugin-console.notifications";
const ConsoleRepoContext = createContext<DataAdapter<ConsoleNotification> | undefined>(undefined);

export interface ConsoleRepoProviderProps {
  adapter?: DataAdapter<ConsoleNotification>;
  repo?: Repo<ConsoleNotification>;
  seed?: ConsoleNotification[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function ConsoleRepoProvider({ adapter, repo, seed = [], children }: ConsoleRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<DataAdapter<ConsoleNotification>>(() => {
    if (adapter) return adapter;
    if (repo) return new RepoAdapter(repo, seed);
    if (canUseTauriRepo()) {
      return new RepoAdapter(createTauriRepo<ConsoleNotification>(invoke, { namespace: "plugin-console-notifications", schemaVersion: 1 }), seed);
    }
    return new LocalStorageAdapter<ConsoleNotification>(STORAGE_KEY, seed);
  }, [adapter, invoke, repo, seed]);

  return <ConsoleRepoContext.Provider value={value}>{children}</ConsoleRepoContext.Provider>;
}

export function useConsoleRepoAdapter(): DataAdapter<ConsoleNotification> | undefined {
  return useContext(ConsoleRepoContext);
}
