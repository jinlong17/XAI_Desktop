import type {
  BillsView,
  BookkeepingAccount,
  BookkeepingCategory,
  BookkeepingKind,
  BookkeepingLedger,
  BookkeepingState,
  BookkeepingTransaction,
  CalendarMode,
  DashboardOrder,
} from "../types.js";
import { convertCurrency } from "./money.js";

export function cloneState(state: BookkeepingState): BookkeepingState {
  return JSON.parse(JSON.stringify(state)) as BookkeepingState;
}

export function ledgerOf(state: BookkeepingState, id = state.activeLedger): BookkeepingLedger {
  const ledger = state.ledgers.find((item) => item.id === id) ?? state.ledgers[0];
  if (!ledger) throw new Error("Bookkeeping state has no ledgers");
  return ledger;
}

export function accountOf(state: BookkeepingState, id: string | undefined): BookkeepingAccount | null {
  return state.accounts.find((account) => account.id === id) ?? null;
}

export function categoriesByKind(state: BookkeepingState, kind: BookkeepingKind): readonly BookkeepingCategory[] {
  const list = kind === "income" ? state.income : kind === "transfer" ? state.transfer : kind === "prepay" ? state.prepay : state.expense;
  return [...list].sort((a, b) => a.order - b.order);
}

export function allCategories(state: BookkeepingState): readonly BookkeepingCategory[] {
  return [...state.expense, ...state.income, ...state.transfer, ...state.prepay];
}

export function categoryOf(state: BookkeepingState, id: string | undefined): BookkeepingCategory | null {
  return allCategories(state).find((category) => category.id === id) ?? null;
}

export function txInLedgerCurrency(state: BookkeepingState, tx: BookkeepingTransaction, ledgerId = tx.ledger): number {
  const ledger = ledgerOf(state, ledgerId);
  return convertCurrency(tx.amount, tx.currency, ledger.currency);
}

function stamp(state: BookkeepingState): BookkeepingState {
  return { ...state, updatedAt: new Date().toISOString() };
}

function sortTransactions(rows: readonly BookkeepingTransaction[]): readonly BookkeepingTransaction[] {
  return [...rows].sort((a, b) => {
    const left = `${a.date}${a.time ?? ""}`;
    const right = `${b.date}${b.time ?? ""}`;
    return left < right ? 1 : left > right ? -1 : 0;
  });
}

function applyAccountDelta(
  accounts: readonly BookkeepingAccount[],
  accountId: string | undefined,
  signedAmount: number,
  tx: BookkeepingTransaction,
): readonly BookkeepingAccount[] {
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return accounts;
  const delta = convertCurrency(signedAmount, tx.currency, account.currency);
  return accounts.map((item) => (item.id === account.id ? { ...item, balance: item.balance + delta } : item));
}

export function applyTransactionBalance(
  accounts: readonly BookkeepingAccount[],
  tx: BookkeepingTransaction,
  undo = false,
): readonly BookkeepingAccount[] {
  const sign = undo ? -1 : 1;
  if (tx.type === "income") {
    return applyAccountDelta(accounts, tx.account, sign * tx.amount, tx);
  }
  if (tx.type === "transfer") {
    const debited = applyAccountDelta(accounts, tx.account, -sign * tx.amount, tx);
    return applyAccountDelta(debited, tx.toAccount, sign * tx.amount, tx);
  }
  return applyAccountDelta(accounts, tx.account, -sign * tx.amount, tx);
}

export function upsertTransactions(
  state: BookkeepingState,
  rows: readonly BookkeepingTransaction[],
  editId?: string,
): BookkeepingState {
  let accounts = [...state.accounts];
  let tx = [...state.tx];
  if (editId) {
    const old = tx.find((item) => item.id === editId);
    if (old) accounts = [...applyTransactionBalance(accounts, old, true)];
    tx = tx.filter((item) => item.id !== editId);
  }
  for (const row of rows) {
    const existing = tx.find((item) => item.id === row.id);
    if (existing) {
      accounts = [...applyTransactionBalance(accounts, existing, true)];
      tx = tx.filter((item) => item.id !== row.id);
    }
    accounts = [...applyTransactionBalance(accounts, row, false)];
    tx.push(row);
  }
  return stamp({ ...state, accounts, tx: sortTransactions(tx) });
}

export function deleteTransaction(state: BookkeepingState, id: string): BookkeepingState {
  const old = state.tx.find((item) => item.id === id);
  const accounts = old ? applyTransactionBalance(state.accounts, old, true) : state.accounts;
  return stamp({ ...state, accounts, tx: state.tx.filter((item) => item.id !== id) });
}

export function saveLedger(state: BookkeepingState, ledger: BookkeepingLedger): BookkeepingState {
  const exists = state.ledgers.some((item) => item.id === ledger.id);
  return stamp({
    ...state,
    ledgers: exists ? state.ledgers.map((item) => (item.id === ledger.id ? ledger : item)) : [...state.ledgers, ledger],
    activeLedger: exists ? state.activeLedger : ledger.id,
  });
}

export function deleteLedger(state: BookkeepingState, id: string): BookkeepingState {
  if (state.ledgers.length <= 1) return state;
  const ledgers = state.ledgers.filter((ledger) => ledger.id !== id);
  return stamp({
    ...state,
    ledgers,
    activeLedger: state.activeLedger === id ? ledgers[0]?.id ?? state.activeLedger : state.activeLedger,
    tx: state.tx.filter((tx) => tx.ledger !== id),
    recurring: state.recurring.filter((rule) => rule.ledger !== id),
  });
}

export function saveAccount(state: BookkeepingState, account: BookkeepingAccount): BookkeepingState {
  const exists = state.accounts.some((item) => item.id === account.id);
  let accounts = exists ? state.accounts.map((item) => (item.id === account.id ? account : item)) : [...state.accounts, account];
  if (account.isDefault) {
    accounts = accounts.map((item) => (item.id === account.id ? item : { ...item, isDefault: false }));
  }
  return stamp({ ...state, accounts });
}

export function deleteAccount(state: BookkeepingState, id: string): BookkeepingState {
  if (state.accounts.length <= 1) return state;
  const fallback = state.accounts.find((account) => account.id !== id)?.id ?? state.accounts[0]?.id ?? id;
  return stamp({
    ...state,
    accounts: state.accounts.filter((account) => account.id !== id),
    ledgers: state.ledgers.map((ledger) =>
      ledger.defaultAccount === id ? { ...ledger, defaultAccount: fallback } : ledger,
    ),
    tx: state.tx.map((tx) => ({
      ...tx,
      account: tx.account === id ? fallback : tx.account,
      toAccount: tx.toAccount === id ? fallback : tx.toAccount,
    })),
  });
}

export function saveCategorySets(
  state: BookkeepingState,
  patch: Pick<BookkeepingState, "expense" | "income" | "transfer" | "prepay">,
): BookkeepingState {
  return stamp({ ...state, ...patch });
}

export function setPrefs(
  state: BookkeepingState,
  prefs: Partial<{
    dashboardOrder: DashboardOrder;
    dashboardSplit: number;
    billsView: BillsView;
    calendarMode: CalendarMode;
  }>,
): BookkeepingState {
  return stamp({ ...state, prefs: { ...state.prefs, ...prefs } });
}
