import { ACCOUNT_TYPES, CURRENCIES } from "./defaults.js";
import type { AccountType, AccountTypeMeta, CurrencyCode, CurrencyMeta } from "../types.js";

const FALLBACK_CURRENCY: CurrencyMeta = { code: "CNY", symbol: "¥", name: "人民币", en: "Chinese Yuan", rate: 1 };
const FALLBACK_ACCOUNT_TYPE: AccountTypeMeta = { id: "other", zh: "其他", en: "Other", icon: "wallet", hue: 330 };

export function currencyOf(code: CurrencyCode | string | undefined): CurrencyMeta {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0] ?? FALLBACK_CURRENCY;
}

export function accountTypeOf(id: AccountType | string | undefined): AccountTypeMeta {
  return ACCOUNT_TYPES.find((type) => type.id === id) ?? ACCOUNT_TYPES[ACCOUNT_TYPES.length - 1] ?? FALLBACK_ACCOUNT_TYPE;
}

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  return (amount * currencyOf(from).rate) / currencyOf(to).rate;
}

export function formatAmount(amount: number): string {
  return (Math.round(amount * 100) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function money(amount: number, code: CurrencyCode = "CNY"): string {
  return `${currencyOf(code).symbol}${formatAmount(Math.abs(amount))}`;
}

export function todayKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nowTime(now = new Date()): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
