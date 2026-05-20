import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { DataAdapter, WidgetEntity } from "../types";

const STORAGE_KEY = "xai.widgets.v1";
const WidgetRepoContext = createContext<DataAdapter<WidgetEntity> | undefined>(undefined);

export interface WidgetRepoProviderProps {
  adapter?: DataAdapter<WidgetEntity>;
  repo?: Repo<WidgetEntity>;
  seed?: WidgetEntity[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function WidgetRepoProvider({ adapter, repo, seed = [], children }: WidgetRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<DataAdapter<WidgetEntity>>(() => {
    if (adapter) return adapter;
    if (repo) return new RepoAdapter(repo, seed);
    if (canUseTauriRepo()) {
      return new RepoAdapter(createTauriRepo<WidgetEntity>(invoke, { namespace: "plugin-widgets", schemaVersion: 1 }), seed);
    }
    return new LocalStorageAdapter<WidgetEntity>(STORAGE_KEY, seed);
  }, [adapter, invoke, repo, seed]);

  return <WidgetRepoContext.Provider value={value}>{children}</WidgetRepoContext.Provider>;
}

export function useWidgetRepoAdapter(): DataAdapter<WidgetEntity> | undefined {
  return useContext(WidgetRepoContext);
}
