import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { AiMessage, CostUsage, DataAdapter } from "../types";

const MESSAGE_STORAGE_KEY = "xai.ai-cube.messages.v1";
const COST_STORAGE_KEY = "xai.ai-cube.cost-usage.v1";

export interface AiCubeRepoAdapters {
  messageAdapter: DataAdapter<AiMessage>;
  costUsageAdapter: DataAdapter<CostUsage>;
}

const AiCubeRepoContext = createContext<AiCubeRepoAdapters | undefined>(undefined);

export interface AiCubeRepoProviderProps {
  messageAdapter?: DataAdapter<AiMessage>;
  costUsageAdapter?: DataAdapter<CostUsage>;
  messageRepo?: Repo<AiMessage>;
  costUsageRepo?: Repo<CostUsage>;
  seedMessages?: AiMessage[];
  seedCostUsage?: CostUsage[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function AiCubeRepoProvider({
  messageAdapter,
  costUsageAdapter,
  messageRepo,
  costUsageRepo,
  seedMessages = [],
  seedCostUsage = [],
  children,
}: AiCubeRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<AiCubeRepoAdapters>(() => {
    const resolvedMessageRepo = messageRepo ?? (canUseTauriRepo() ? createTauriRepo<AiMessage>(invoke, { namespace: "plugin-ai-cube-messages", schemaVersion: 1 }) : undefined);
    const resolvedCostRepo = costUsageRepo ?? (canUseTauriRepo() ? createTauriRepo<CostUsage>(invoke, { namespace: "plugin-ai-cube-cost", schemaVersion: 1 }) : undefined);
    return {
      messageAdapter:
        messageAdapter ??
        (resolvedMessageRepo
          ? new RepoAdapter<AiMessage>(resolvedMessageRepo, "ai-cube.message")
          : new LocalStorageAdapter<AiMessage>(MESSAGE_STORAGE_KEY, seedMessages)),
      costUsageAdapter:
        costUsageAdapter ??
        (resolvedCostRepo
          ? new RepoAdapter<CostUsage>(resolvedCostRepo, "ai-cube.cost-usage")
          : new LocalStorageAdapter<CostUsage>(COST_STORAGE_KEY, seedCostUsage)),
    };
  }, [costUsageAdapter, costUsageRepo, invoke, messageAdapter, messageRepo, seedCostUsage, seedMessages]);

  return <AiCubeRepoContext.Provider value={value}>{children}</AiCubeRepoContext.Provider>;
}

export function useAiCubeRepoAdapters(): AiCubeRepoAdapters | undefined {
  return useContext(AiCubeRepoContext);
}
