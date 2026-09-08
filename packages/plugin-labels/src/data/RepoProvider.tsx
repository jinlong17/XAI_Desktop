import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { DataAdapter, Label } from "../types";

const STORAGE_KEY = "xai.plugin-labels.labels";
const NAMESPACE = "plugin-labels";

const LabelRepoContext = createContext<DataAdapter<Label> | undefined>(undefined);

export interface LabelRepoProviderProps {
  adapter?: DataAdapter<Label>;
  repo?: Repo<Label>;
  seed?: Label[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function LabelRepoProvider({ adapter, repo, seed = [], children }: LabelRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<DataAdapter<Label>>(() => {
    if (adapter) return adapter;
    if (repo) return new RepoAdapter(repo, { seed });
    if (canUseTauriRepo()) {
      return new RepoAdapter(createTauriRepo<Label>(invoke, { namespace: NAMESPACE, schemaVersion: 1 }), { seed });
    }
    return new LocalStorageAdapter<Label>(STORAGE_KEY, seed);
  }, [adapter, invoke, repo, seed]);

  return <LabelRepoContext.Provider value={value}>{children}</LabelRepoContext.Provider>;
}

export function useLabelRepoAdapter(): DataAdapter<Label> | undefined {
  return useContext(LabelRepoContext);
}
