import { describe, expect, it } from "vitest";
import { calendarDayTotals, categoryTotals, ledgerTransactions, parseNaturalLanguageDrafts, totalsForTransactions } from "../internal/analytics.js";
import { createSeedBookkeepingState } from "../internal/defaults.js";
import { deleteTransaction, upsertTransactions } from "../internal/state.js";
import type { BookkeepingTransaction } from "../types.js";

describe("bookkeeping state and analytics", () => {
  it("updates account balances and derived totals when a record is added or removed", () => {
    const seed = createSeedBookkeepingState();
    const beforeWx = seed.accounts.find((account) => account.id === "wx")?.balance ?? 0;
    const tx: BookkeepingTransaction = {
      id: "test-food",
      ledger: "daily",
      type: "expense",
      cat: "food",
      sub: "午餐",
      amount: 42,
      currency: "CNY",
      account: "wx",
      date: "2026-06-02",
      time: "12:05",
      note: "测试午餐",
      tags: ["test"],
      reimburse: false,
      private: false,
      merchant: "Test Cafe",
      location: "",
    };

    const next = upsertTransactions(seed, [tx]);
    const afterWx = next.accounts.find((account) => account.id === "wx")?.balance ?? 0;
    const rows = ledgerTransactions(next, "daily");

    expect(afterWx).toBe(beforeWx - 42);
    expect(rows.some((row) => row.id === "test-food")).toBe(true);
    expect(totalsForTransactions(next, rows).expense).toBeGreaterThan(42);
    expect(categoryTotals(next, rows, "expense").find((item) => item.category.id === "food")?.amount).toBeGreaterThanOrEqual(42);
    expect(calendarDayTotals(next, rows)["2026-06-02"]?.expense).toBe(42);

    const removed = deleteTransaction(next, "test-food");
    expect(removed.accounts.find((account) => account.id === "wx")?.balance).toBe(beforeWx);
    expect(ledgerTransactions(removed, "daily").some((row) => row.id === "test-food")).toBe(false);
  });

  it("upserts by transaction id so repeated save calls stay idempotent", () => {
    const seed = createSeedBookkeepingState();
    const tx: BookkeepingTransaction = {
      id: "stable-id",
      ledger: "daily",
      type: "expense",
      cat: "food",
      sub: "",
      amount: 45,
      currency: "CNY",
      account: "wx",
      date: "2026-06-02",
      time: "12:05",
      note: "StrictMode probe",
      tags: [],
      reimburse: false,
      private: false,
      merchant: "",
      location: "",
    };

    const once = upsertTransactions(seed, [tx]);
    const twice = upsertTransactions(once, [tx]);

    expect(ledgerTransactions(twice, "daily").filter((row) => row.id === "stable-id")).toHaveLength(1);
    expect(twice.accounts.find((account) => account.id === "wx")?.balance).toBe(3235);
  });

  it("parses natural language drafts into deterministic record candidates", () => {
    const drafts = parseNaturalLanguageDrafts(createSeedBookkeepingState(), "午饭 23 微信；工资 12000 招行");

    expect(drafts).toHaveLength(2);
    expect(drafts[0]).toMatchObject({ type: "expense", amount: 23, cat: "food", account: "wx" });
    expect(drafts[1]).toMatchObject({ type: "income", amount: 12000, cat: "salary", account: "cmb" });
  });
});
