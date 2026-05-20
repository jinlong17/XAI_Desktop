import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { ClipboardEntry, DataAdapter } from "../types";

const STORAGE_KEY = "xai.plugin-clipboard.entries";
const ClipboardRepoContext = createContext<DataAdapter<ClipboardEntry> | undefined>(undefined);

export interface ClipboardRepoProviderProps {
  adapter?: DataAdapter<ClipboardEntry>;
  repo?: Repo<ClipboardEntry>;
  seed?: ClipboardEntry[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function ClipboardRepoProvider({ adapter, repo, seed = [], children }: ClipboardRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<DataAdapter<ClipboardEntry>>(() => {
    if (adapter) return adapter;
    if (repo) return new RepoAdapter(repo, seed);
    if (canUseTauriRepo()) {
      return new RepoAdapter(createTauriRepo<ClipboardEntry>(invoke, { namespace: "plugin-clipboard", schemaVersion: 1 }), seed);
    }
    return new LocalStorageAdapter<ClipboardEntry>(STORAGE_KEY, seed);
  }, [adapter, invoke, repo, seed]);

  return <ClipboardRepoContext.Provider value={value}>{children}</ClipboardRepoContext.Provider>;
}

export function useClipboardRepoAdapter(): DataAdapter<ClipboardEntry> | undefined {
  return useContext(ClipboardRepoContext);
}
