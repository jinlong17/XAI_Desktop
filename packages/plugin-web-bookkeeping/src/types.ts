import type { Lang } from "@repo/plugin-web-tokens";

export type { Lang };

export type BookkeepingLanguage = Lang;
export type CurrencyCode = "CNY" | "USD" | "EUR" | "GBP" | "JPY" | "HKD" | "KRW" | "SGD" | "AUD" | "CAD";
export type BookkeepingKind = "expense" | "income" | "transfer" | "prepay";
export type AccountType = "cash" | "bank" | "credit" | "alipay" | "wechat" | "paypal" | "invest" | "other";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type DashboardOrder = "bills-first" | "quick-first";
export type BillsView = "detail" | "overview";
export type CalendarMode = "month" | "year";
export type InsightRange = "all" | "30d" | "year" | "month" | "lastMonth" | "last2" | "custom";

export interface CurrencyMeta {
  readonly code: CurrencyCode;
  readonly symbol: string;
  readonly name: string;
  readonly en: string;
  readonly rate: number;
}

export interface AccountTypeMeta {
  readonly id: AccountType;
  readonly zh: string;
  readonly en: string;
  readonly icon: string;
  readonly hue: number;
}

export interface BookkeepingLedger {
  readonly id: string;
  readonly name: string;
  readonly en: string;
  readonly icon: string;
  readonly hue: number;
  readonly currency: CurrencyCode;
  readonly defaultAccount: string;
  readonly private: boolean;
  readonly reimburse: boolean;
  readonly desc: string;
}

export interface BookkeepingAccount {
  readonly id: string;
  readonly name: string;
  readonly en: string;
  readonly type: AccountType;
  readonly currency: CurrencyCode;
  readonly initial: number;
  readonly balance: number;
  readonly isDefault: boolean;
  readonly icon: string;
  readonly hue: number;
  readonly limit?: number;
  readonly billDay?: number;
  readonly repayDay?: number;
}

export interface BookkeepingCategory {
  readonly id: string;
  readonly kind: BookkeepingKind;
  readonly name: string;
  readonly en: string;
  readonly icon: string;
  readonly hue: number;
  readonly budget: number;
  readonly order: number;
  readonly subs: readonly string[];
  readonly notes: readonly string[];
}

export interface BookkeepingTransaction {
  readonly id: string;
  readonly ledger: string;
  readonly type: BookkeepingKind;
  readonly cat: string;
  readonly sub: string;
  readonly amount: number;
  readonly currency: CurrencyCode;
  readonly account: string;
  readonly toAccount?: string;
  readonly date: string;
  readonly time: string;
  readonly note: string;
  readonly tags: readonly string[];
  readonly reimburse: boolean;
  readonly private: boolean;
  readonly recurring?: boolean;
  readonly merchant: string;
  readonly location: string;
}

export interface BookkeepingRecurringRule {
  readonly id: string;
  readonly ledger: string;
  readonly type: Exclude<BookkeepingKind, "transfer">;
  readonly cat: string;
  readonly amount: number;
  readonly currency: CurrencyCode;
  readonly account: string;
  readonly note: string;
  readonly freq: RecurringFrequency;
  readonly day: number;
  readonly nextDate: string;
  readonly active: boolean;
}

export interface BookkeepingInvestment {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly type: "stock" | "fund";
  readonly shares: number;
  readonly cost: number;
  readonly price: number;
  readonly account: string;
}

export interface BookkeepingPrefs {
  readonly dashboardOrder: DashboardOrder;
  readonly dashboardSplit: number;
  readonly billsView: BillsView;
  readonly calendarMode: CalendarMode;
}

export interface BookkeepingState {
  readonly version: 2;
  readonly activeLedger: string;
  readonly ledgers: readonly BookkeepingLedger[];
  readonly expense: readonly BookkeepingCategory[];
  readonly income: readonly BookkeepingCategory[];
  readonly transfer: readonly BookkeepingCategory[];
  readonly prepay: readonly BookkeepingCategory[];
  readonly accounts: readonly BookkeepingAccount[];
  readonly tx: readonly BookkeepingTransaction[];
  readonly recurring: readonly BookkeepingRecurringRule[];
  readonly invest: readonly BookkeepingInvestment[];
  readonly budgetTotal: number;
  readonly prefs: BookkeepingPrefs;
  readonly updatedAt: string;
}

export type BookkeepingModal =
  | { readonly kind: "record"; readonly payload?: Partial<BookkeepingTransaction> }
  | { readonly kind: "ledger"; readonly payload?: BookkeepingLedger }
  | { readonly kind: "account"; readonly payload?: BookkeepingAccount }
  | { readonly kind: "categories" }
  | { readonly kind: "recurring"; readonly payload?: BookkeepingRecurringRule }
  | { readonly kind: "invest"; readonly payload?: BookkeepingInvestment }
  | { readonly kind: "import-export" }
  | null;

export interface BookkeepingTotals {
  readonly expense: number;
  readonly income: number;
  readonly net: number;
  readonly count: number;
}

export interface BookkeepingDayGroup {
  readonly date: string;
  readonly items: readonly BookkeepingTransaction[];
  readonly totals: BookkeepingTotals;
}

export interface BookkeepingCategoryTotal {
  readonly category: BookkeepingCategory;
  readonly amount: number;
  readonly pct: number;
  readonly count: number;
}

export interface NaturalLanguageDraft {
  readonly type: "expense" | "income";
  readonly amount: number;
  readonly cat: string;
  readonly sub: string;
  readonly account: string;
  readonly note: string;
}

export interface BookkeepingStorageAdapter {
  readonly kind: "localStorage";
  readonly syncStatus: "device-local";
  read(): BookkeepingState;
  write(state: BookkeepingState): void;
  reset(): BookkeepingState;
}
