import { useCallback, useEffect, useRef, useState } from "react";
import {
  BOOKKEEPING_CALENDAR_MODE_KEY,
  BOOKKEEPING_DASH_ORDER_KEY,
  BOOKKEEPING_DASH_SPLIT_KEY,
  BOOKKEEPING_STATE_KEY,
  BOOKKEEPING_STORAGE_EVENT,
  BOOKKEEPING_VIEW_KEY,
  DEFAULT_PREFS,
  createSeedBookkeepingState,
} from "./defaults.js";
import type { BillsView, BookkeepingState, BookkeepingStorageAdapter, CalendarMode, DashboardOrder } from "../types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeParse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readString(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeString(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function readDashboardOrder(): DashboardOrder {
  const value = readString(BOOKKEEPING_DASH_ORDER_KEY);
  return value === "quick-first" ? "quick-first" : "bills-first";
}

function readDashboardSplit(): number {
  const value = Number(readString(BOOKKEEPING_DASH_SPLIT_KEY));
  return Number.isFinite(value) && value >= 28 && value <= 72 ? value : DEFAULT_PREFS.dashboardSplit;
}

function readBillsView(): BillsView {
  const value = readString(BOOKKEEPING_VIEW_KEY);
  return value === "overview" ? "overview" : "detail";
}

function readCalendarMode(): CalendarMode {
  const value = readString(BOOKKEEPING_CALENDAR_MODE_KEY);
  return value === "year" ? "year" : "month";
}

function isBookkeepingState(value: unknown): value is BookkeepingState {
  return (
    isRecord(value) &&
    value["version"] === 2 &&
    typeof value["activeLedger"] === "string" &&
    Array.isArray(value["ledgers"]) &&
    Array.isArray(value["accounts"]) &&
    Array.isArray(value["expense"]) &&
    Array.isArray(value["income"]) &&
    Array.isArray(value["transfer"]) &&
    Array.isArray(value["prepay"]) &&
    Array.isArray(value["tx"]) &&
    Array.isArray(value["recurring"]) &&
    Array.isArray(value["invest"]) &&
    typeof value["budgetTotal"] === "number"
  );
}

function normalizeState(value: BookkeepingState): BookkeepingState {
  const seed = createSeedBookkeepingState();
  const activeLedger = value.ledgers.some((ledger) => ledger.id === value.activeLedger)
    ? value.activeLedger
    : value.ledgers[0]?.id ?? seed.activeLedger;
  return {
    ...seed,
    ...value,
    activeLedger,
    prefs: {
      ...DEFAULT_PREFS,
      ...value.prefs,
      dashboardOrder: readDashboardOrder(),
      dashboardSplit: readDashboardSplit(),
      billsView: readBillsView(),
      calendarMode: readCalendarMode(),
    },
    updatedAt: value.updatedAt || seed.updatedAt,
  };
}

function dispatchStorageEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BOOKKEEPING_STORAGE_EVENT));
}

export const localBookkeepingStorageAdapter: BookkeepingStorageAdapter = {
  kind: "localStorage",
  syncStatus: "device-local",
  read() {
    const parsed = safeParse(readString(BOOKKEEPING_STATE_KEY));
    return normalizeState(isBookkeepingState(parsed) ? parsed : createSeedBookkeepingState());
  },
  write(state) {
    writeString(BOOKKEEPING_STATE_KEY, JSON.stringify(state));
    writeString(BOOKKEEPING_DASH_ORDER_KEY, state.prefs.dashboardOrder);
    writeString(BOOKKEEPING_DASH_SPLIT_KEY, String(state.prefs.dashboardSplit));
    writeString(BOOKKEEPING_VIEW_KEY, state.prefs.billsView);
    writeString(BOOKKEEPING_CALENDAR_MODE_KEY, state.prefs.calendarMode);
    dispatchStorageEvent();
  },
  reset() {
    const state = createSeedBookkeepingState();
    this.write(state);
    return state;
  },
};

export function readBookkeepingState(): BookkeepingState {
  return localBookkeepingStorageAdapter.read();
}

export function writeBookkeepingState(state: BookkeepingState): void {
  localBookkeepingStorageAdapter.write(state);
}

export function useBookkeepingState(): readonly [BookkeepingState, (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void] {
  const [state, setState] = useState<BookkeepingState>(() => localBookkeepingStorageAdapter.read());
  const stateRef = useRef(state);

  useEffect(() => {
    function refresh(): void {
      const next = localBookkeepingStorageAdapter.read();
      stateRef.current = next;
      setState(next);
    }
    window.addEventListener("storage", refresh);
    window.addEventListener(BOOKKEEPING_STORAGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(BOOKKEEPING_STORAGE_EVENT, refresh);
    };
  }, []);

  const setPersistedState = useCallback((next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => {
    const value = typeof next === "function" ? next(stateRef.current) : next;
    stateRef.current = value;
    localBookkeepingStorageAdapter.write(value);
    setState(value);
  }, []);

  return [state, setPersistedState];
}
