import { useMemo, useState } from "react";
import type { CostGuardState } from "../types";

const COST_KEY = "xai.ai-cube.cost.v1";

export interface CostGuardApi extends CostGuardState {
  canSend: boolean;
  setDailyLimit(limit: number): void;
  recordCall(): void;
  setOffline(offline: boolean): void;
}

export function useCostGuard(defaultLimit = 30): CostGuardApi {
  const initial = useMemo(() => readState(defaultLimit), [defaultLimit]);
  const [state, setState] = useState<CostGuardState>(initial);

  function persist(next: CostGuardState): void {
    setState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COST_KEY, JSON.stringify(next));
    }
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

function readState(defaultLimit: number): CostGuardState {
  if (typeof window === "undefined") {
    return { dailyLimit: defaultLimit, usedToday: 0, offline: false };
  }
  try {
    const raw = window.localStorage.getItem(COST_KEY);
    return raw ? (JSON.parse(raw) as CostGuardState) : { dailyLimit: defaultLimit, usedToday: 0, offline: false };
  } catch {
    return { dailyLimit: defaultLimit, usedToday: 0, offline: false };
  }
}
