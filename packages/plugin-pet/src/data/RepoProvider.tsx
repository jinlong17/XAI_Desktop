import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { DataAdapter, PetEntity } from "../types";

const STORAGE_KEY = "xai.pet.v1";
const PetRepoContext = createContext<DataAdapter<PetEntity> | undefined>(undefined);

export interface PetRepoProviderProps {
  adapter?: DataAdapter<PetEntity>;
  repo?: Repo<PetEntity>;
  seed?: PetEntity[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function PetRepoProvider({ adapter, repo, seed = [], children }: PetRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<DataAdapter<PetEntity>>(() => {
    if (adapter) return adapter;
    if (repo) return new RepoAdapter(repo);
    if (canUseTauriRepo()) {
      return new RepoAdapter(createTauriRepo<PetEntity>(invoke, { namespace: "plugin-pet", schemaVersion: 1 }));
    }
    return new LocalStorageAdapter<PetEntity>(STORAGE_KEY, seed);
  }, [adapter, invoke, repo, seed]);

  return <PetRepoContext.Provider value={value}>{children}</PetRepoContext.Provider>;
}

export function usePetRepoAdapter(): DataAdapter<PetEntity> | undefined {
  return useContext(PetRepoContext);
}
