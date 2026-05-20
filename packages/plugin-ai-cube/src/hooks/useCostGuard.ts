import { useEffect, useMemo, useState } from "react";
import { useAiCubeRepoAdapters } from "../data/RepoProvider";
import type { CostGuardState, CostUsage } from "../types";

const COST_KEY = "xai.ai-cube.cost.v1";

export interface CostGuardApi extends CostGuardState {
  canSend: boolean;
  setDailyLimit(limit: number): void;
  recordCall(): void;
  setOffline(offline: boolean): void;
}

export function useCostGuard(defaultLimit = 30): CostGuardApi {
  const repoAdapters = useAiCubeRepoAdapters();
  const initial = useMemo(() => readState(defaultLimit), [defaultLimit]);
  const [state, setState] = useState<CostGuardState>(initial);

  useEffect(() => {
    if (!repoAdapters) return;
    let cancelled = false;
    void repoAdapters.costUsageAdapter.getById(costUsageId(todayKey())).then((usage) => {
      if (!cancelled && usage) {
        setState({ dailyLimit: usage.dailyLimit, usedToday: usage.used, offline: usage.offline, lastResetDate: usage.date });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [repoAdapters]);

  function persist(next: CostGuardState): void {
    setState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COST_KEY, JSON.stringify(next));
    }
    void repoAdapters?.costUsageAdapter.save(toCostUsage(next));
  }

  return {
    ...state,
    canSend: !state.offline && state.usedToday < state.dailyLimit,
    setDailyLimit(limit) {
      persist({ ...state, dailyLimit: Math.max(1, limit) });
    },
    recordCall() {
      persist({ ...state, usedToday: state.usedToday + 1 });
    },
    setOffline(offline) {
      persist({ ...state, offline });
    },
  };
}

function costUsageId(date: string): string {
  return `cost-${date}`;
}

function toCostUsage(state: CostGuardState): CostUsage {
  const timestamp = new Date().toISOString();
  const date = state.lastResetDate ?? todayKey();
  return {
    id: costUsageId(date),
    entityType: "ai-cube.cost-usage",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    date,
    dailyLimit: state.dailyLimit,
    used: state.usedToday,
    offline: state.offline,
    version: 1,
  };
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readState(defaultLimit: number): CostGuardState {
  const today = todayKey();
  if (typeof window === "undefined") {
    return { dailyLimit: defaultLimit, usedToday: 0, offline: false, lastResetDate: today };
  }
  try {
    const raw = window.localStorage.getItem(COST_KEY);
    if (!raw) {
      return { dailyLimit: defaultLimit, usedToday: 0, offline: false, lastResetDate: today };
    }
    const parsed = JSON.parse(raw) as CostGuardState;
    if (parsed.lastResetDate !== today) {
      return { ...parsed, usedToday: 0, lastResetDate: today };
    }
    return parsed;
  } catch {
    return { dailyLimit: defaultLimit, usedToday: 0, offline: false, lastResetDate: today };
  }
}
