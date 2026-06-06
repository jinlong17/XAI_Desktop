import type {
  BookkeepingCategoryTotal,
  BookkeepingDayGroup,
  BookkeepingKind,
  BookkeepingState,
  BookkeepingTotals,
  BookkeepingTransaction,
  CurrencyCode,
  NaturalLanguageDraft,
} from "../types.js";
import { categoryOf, categoriesByKind, ledgerOf, txInLedgerCurrency } from "./state.js";

export function ledgerTransactions(state: BookkeepingState, ledgerId = state.activeLedger): readonly BookkeepingTransaction[] {
  return state.tx.filter((tx) => tx.ledger === ledgerId);
}

export function totalsForTransactions(state: BookkeepingState, rows: readonly BookkeepingTransaction[]): BookkeepingTotals {
  let expense = 0;
  let income = 0;
  for (const tx of rows) {
    if (tx.type === "income") income += txInLedgerCurrency(state, tx);
    if (tx.type === "expense" || tx.type === "prepay") expense += txInLedgerCurrency(state, tx);
  }
  return { expense, income, net: income - expense, count: rows.length };
}

export function dayGroups(state: BookkeepingState, rows: readonly BookkeepingTransaction[]): readonly BookkeepingDayGroup[] {
  const grouped = new Map<string, BookkeepingTransaction[]>();
  for (const tx of rows) {
    grouped.set(tx.date, [...(grouped.get(tx.date) ?? []), tx]);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => ((a.time ?? "") < (b.time ?? "") ? 1 : -1)),
      totals: totalsForTransactions(state, items),
    }));
}

export function categoryTotals(
  state: BookkeepingState,
  rows: readonly BookkeepingTransaction[],
  kind: "expense" | "income",
): readonly BookkeepingCategoryTotal[] {
  const map = new Map<string, { amount: number; count: number }>();
  for (const tx of rows) {
    if (kind === "expense" && tx.type !== "expense" && tx.type !== "prepay") continue;
    if (kind === "income" && tx.type !== "income") continue;
    const current = map.get(tx.cat) ?? { amount: 0, count: 0 };
    map.set(tx.cat, { amount: current.amount + txInLedgerCurrency(state, tx), count: current.count + 1 });
  }
  const total = [...map.values()].reduce((sum, item) => sum + item.amount, 0);
  return [...map.entries()]
    .map(([cat, item]) => {
      const category = categoryOf(state, cat);
      return category
        ? { category, amount: item.amount, pct: total > 0 ? (item.amount / total) * 100 : 0, count: item.count }
        : null;
    })
    .filter((item): item is BookkeepingCategoryTotal => item !== null)
    .sort((a, b) => b.amount - a.amount);
}

export function calendarDayTotals(state: BookkeepingState, rows: readonly BookkeepingTransaction[]): Record<string, BookkeepingTotals> {
  const out: Record<string, BookkeepingTotals> = {};
  for (const tx of rows) {
    if (tx.type === "transfer") continue;
    const current = out[tx.date] ?? { expense: 0, income: 0, net: 0, count: 0 };
    const amount = txInLedgerCurrency(state, tx);
    const nextExpense = current.expense + (tx.type === "income" ? 0 : amount);
    const nextIncome = current.income + (tx.type === "income" ? amount : 0);
    out[tx.date] = { expense: nextExpense, income: nextIncome, net: nextIncome - nextExpense, count: current.count + 1 };
  }
  return out;
}

export function filterTransactions(
  rows: readonly BookkeepingTransaction[],
  query: string,
  type: BookkeepingKind | "all",
): readonly BookkeepingTransaction[] {
  const q = query.trim().toLocaleLowerCase();
  return rows.filter((tx) => {
    if (type !== "all" && tx.type !== type) return false;
    if (!q) return true;
    return [tx.note, tx.merchant, tx.location, tx.sub, tx.cat, tx.account, ...tx.tags]
      .join(" ")
      .toLocaleLowerCase()
      .includes(q);
  });
}

export function netWorth(state: BookkeepingState): { readonly cash: number; readonly investment: number; readonly total: number; readonly currency: CurrencyCode } {
  const ledger = ledgerOf(state);
  const cash = state.accounts.reduce((sum, account) => {
    const fakeTx = { amount: account.balance, currency: account.currency, ledger: ledger.id } as BookkeepingTransaction;
    return sum + txInLedgerCurrency(state, fakeTx);
  }, 0);
  const investmentCny = state.invest.reduce((sum, holding) => sum + holding.shares * holding.price, 0);
  const investment = ledger.currency === "CNY" ? investmentCny : investmentCny / 7.15;
  return { cash, investment, total: cash + investment, currency: ledger.currency };
}

const INCOME_WORDS = ["工资", "收入", "到账", "赚", "退款", "分红", "salary", "income", "refund", "bonus"];
const ACCOUNT_HINTS: ReadonlyArray<readonly [string, string]> = [
  ["微信", "wx"],
  ["wechat", "wx"],
  ["支付宝", "ali"],
  ["alipay", "ali"],
  ["招行", "cmb"],
  ["银行", "cmb"],
  ["cash", "cash"],
  ["现金", "cash"],
  ["信用卡", "cc"],
  ["paypal", "paypal"],
];
const CATEGORY_HINTS: ReadonlyArray<readonly [string, string, BookkeepingKind]> = [
  ["咖啡", "food", "expense"],
  ["午饭", "food", "expense"],
  ["早餐", "food", "expense"],
  ["晚饭", "food", "expense"],
  ["外卖", "food", "expense"],
  ["lunch", "food", "expense"],
  ["coffee", "food", "expense"],
  ["打车", "trans", "expense"],
  ["地铁", "trans", "expense"],
  ["uber", "trans", "expense"],
  ["taxi", "trans", "expense"],
  ["超市", "shop", "expense"],
  ["购物", "shop", "expense"],
  ["房租", "home", "expense"],
  ["会员", "pp_sub", "prepay"],
  ["工资", "salary", "income"],
  ["salary", "salary", "income"],
  ["退款", "other", "income"],
  ["bonus", "bonus", "income"],
];

export function parseNaturalLanguageDrafts(state: BookkeepingState, text: string): readonly NaturalLanguageDraft[] {
  const ledger = ledgerOf(state);
  return text
    .split(/[、/;；\n]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const amount = Math.abs(Number(chunk.match(/\d+(?:\.\d+)?/)?.[0] ?? 0));
      if (amount <= 0) return null;
      const lower = chunk.toLocaleLowerCase();
      const income = INCOME_WORDS.some((word) => lower.includes(word));
      const hintedCategory = CATEGORY_HINTS.find(([hint]) => lower.includes(hint));
      const type: "expense" | "income" = income || hintedCategory?.[2] === "income" ? "income" : "expense";
      const cat =
        hintedCategory && (type === "income" ? hintedCategory[2] === "income" : hintedCategory[2] !== "income")
          ? hintedCategory[1]
          : categoriesByKind(state, type)[0]?.id;
      const account = ACCOUNT_HINTS.find(([hint]) => lower.includes(hint))?.[1] ?? ledger.defaultAccount;
      return {
        type,
        amount,
        cat: cat ?? (type === "income" ? state.income[0]?.id ?? "other" : state.expense[0]?.id ?? "food"),
        sub: "",
        account,
        note: chunk.replace(/\d+(?:\.\d+)?/, "").trim() || chunk,
      };
    })
    .filter((item): item is NaturalLanguageDraft => item !== null);
}
