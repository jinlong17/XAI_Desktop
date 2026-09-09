import { accountScope, registerAccountMigrationValidator } from "@repo/plugin-web-storage";
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
import type { BillsView, BookkeepingWriteResult, BookkeepingState, BookkeepingStorageAdapter, CalendarMode, DashboardOrder } from "../types.js";

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

function readString(key: string, scope = accountScope.capture()): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(accountScope.physicalKey(key, scope));
  } catch {
    return null;
  }
}

function writeString(key: string, value: string, scope = accountScope.capture()): void {
  if (typeof window === "undefined") throw new Error("Bookkeeping storage is unavailable.");
  accountScope.assertCurrent(scope);
  window.localStorage.setItem(accountScope.physicalKey(key, scope), value);
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

export function readBookkeepingState(scope = accountScope.capture()): BookkeepingState {
  const parsed = safeParse(readString(BOOKKEEPING_STATE_KEY, scope));
  return normalizeState(isBookkeepingState(parsed) ? parsed : createSeedBookkeepingState());
}
function writeDevicePreferences(state: BookkeepingState, scope: ReturnType<typeof accountScope.capture>): BookkeepingWriteResult {
  accountScope.assertCurrent(scope);
  const failedDeviceKeys: string[]=[];
  const mirrors = [
    [BOOKKEEPING_DASH_ORDER_KEY,state.prefs.dashboardOrder],
    [BOOKKEEPING_DASH_SPLIT_KEY,String(state.prefs.dashboardSplit)],
    [BOOKKEEPING_VIEW_KEY,state.prefs.billsView],
    [BOOKKEEPING_CALENDAR_MODE_KEY,state.prefs.calendarMode],
  ] as const;
  for (const [key,value] of mirrors) {
    try { writeString(key,value,scope); } catch { failedDeviceKeys.push(key); }
  }
  return {canonicalCommitted:true,devicePreferences:failedDeviceKeys.length ? "partial" : "complete",failedDeviceKeys};
}
export function writeBookkeepingState(state: BookkeepingState, scope = accountScope.capture()): BookkeepingWriteResult {
  accountScope.assertCurrent(scope);
  // Canonical failure stops here: no mirror writes and no committed-state event.
  writeString(BOOKKEEPING_STATE_KEY, JSON.stringify(state), scope);
  const result=writeDevicePreferences(state,scope);
  dispatchStorageEvent();
  return result;
}
export const localBookkeepingStorageAdapter: BookkeepingStorageAdapter = {
  kind: "localStorage",
  syncStatus: "device-local",
  read: readBookkeepingState,
  write: writeBookkeepingState,
  reset() { const state = createSeedBookkeepingState(); const result=this.write(state); if(result.devicePreferences === "partial") throw new Error("Records reset, but some device preferences were not saved."); return state; },
};

type StateUpdate = BookkeepingState | ((prev: BookkeepingState) => BookkeepingState);
type PendingSave = { value: BookkeepingState; baseline: string | null | undefined; canonicalCommitted: boolean; failure: "write" | "device" | "conflict" | "account" };
export interface BookkeepingSaveRecovery {
  readonly pending: PendingSave | null;
  retry(): boolean;
  discard(): void;
  exportDraft(): string;
}
export function useBookkeepingState(): readonly [BookkeepingState, (next: StateUpdate) => boolean, BookkeepingSaveRecovery] {
  const scope = useRef(accountScope.capture()).current;
  const [state, setState] = useState<BookkeepingState>(() => readBookkeepingState(scope));
  const stateRef = useRef(state);
  const pendingRef = useRef<PendingSave | null>(null);
  const [pending,setPending]=useState<PendingSave | null>(null);
  const publishPending=(value: PendingSave | null)=>{pendingRef.current=value;setPending(value);};
  useEffect(() => {
    function refresh(): void {
      if (!accountScope.isReady(scope) || pendingRef.current) return;
      const next = readBookkeepingState(scope);
      stateRef.current = next; setState(next);
    }
    window.addEventListener("storage", refresh);
    window.addEventListener(BOOKKEEPING_STORAGE_EVENT, refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener(BOOKKEEPING_STORAGE_EVENT, refresh); };
  }, [scope]);

  const attempt=useCallback((draft: PendingSave, retry: boolean): boolean=>{
    if (!accountScope.isReady(scope)) { publishPending({...draft,failure:"account"}); return false; }
    try {
      const key=accountScope.physicalKey(BOOKKEEPING_STATE_KEY,scope);
      const current=window.localStorage.getItem(key);
      if (retry && (draft.baseline===undefined || current!==draft.baseline)) { publishPending({...draft,failure:"conflict"}); return false; }
      draft={...draft,baseline:current};
      publishPending(draft);
      const result=draft.canonicalCommitted ? writeDevicePreferences(draft.value,scope) : writeBookkeepingState(draft.value,scope);
      const committed=normalizeState(draft.value);
      stateRef.current=committed;setState(committed);
      if(result.devicePreferences==="partial") {
        publishPending({...draft,canonicalCommitted:true,baseline:JSON.stringify(draft.value),failure:"device"});return false;
      }
      publishPending(null);dispatchStorageEvent();return true;
    } catch { publishPending({...draft,failure:"write"});return false; }
  }, [scope]);
  const setPersistedState = useCallback((next: StateUpdate): boolean => {
    if (!accountScope.isReady(scope) || pendingRef.current) return false;
    const value=typeof next==="function" ? next(stateRef.current) : next;
    return attempt({value,baseline:undefined,canonicalCommitted:false,failure:"write"},false);
  }, [attempt, scope]);
  const recovery: BookkeepingSaveRecovery={
    pending,
    retry:()=>pendingRef.current ? attempt(pendingRef.current,true) : true,
    discard:()=>{publishPending(null); if(accountScope.isReady(scope)){const next=readBookkeepingState(scope);stateRef.current=next;setState(next);}},
    exportDraft:()=>{
      accountScope.assertCurrent(scope);
      if(!pendingRef.current) throw new Error("No pending bookkeeping draft.");
      return JSON.stringify({version:1,kind:"bookkeeping-unsaved-draft",accountId:scope.accountId,canonicalCommitted:pendingRef.current.canonicalCommitted,state:pendingRef.current.value},null,2);
    },
  };
  return [state,setPersistedState,recovery];
}

registerAccountMigrationValidator(BOOKKEEPING_STATE_KEY, isBookkeepingState);
