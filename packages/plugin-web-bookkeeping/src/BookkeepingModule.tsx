import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent, ReactNode } from "react";
import { ACCOUNT_TYPES, CURRENCIES } from "./internal/defaults.js";
import {
  calendarDayTotals,
  categoryTotals,
  dayGroups,
  filterTransactions,
  ledgerTransactions,
  netWorth,
  parseNaturalLanguageDrafts,
  totalsForTransactions,
} from "./internal/analytics.js";
import { HUE_OPTIONS, ICON_OPTIONS, Icon } from "./internal/icons.js";
import { accountTypeOf, currencyOf, money, nowTime, todayKey, uid } from "./internal/money.js";
import {
  accountOf,
  categoriesByKind,
  categoryOf,
  deleteAccount,
  deleteLedger,
  deleteTransaction,
  ledgerOf,
  saveAccount,
  saveCategorySets,
  saveLedger,
  setPrefs,
  txInLedgerCurrency,
  upsertTransactions,
} from "./internal/state.js";
import { useBookkeepingState } from "./internal/storage.js";
import { Bar, CatCircle, Donut, Field, GREEN, Modal, MoneyText, RED, Toggle, ink, soft } from "./internal/ui.js";
import { Calculator } from "./Calculator.js";
import type {
  BillsView,
  BookkeepingAccount,
  BookkeepingCategory,
  BookkeepingInvestment,
  BookkeepingKind,
  BookkeepingLanguage,
  BookkeepingLedger,
  BookkeepingModal,
  BookkeepingRecurringRule,
  BookkeepingState,
  BookkeepingTransaction,
  CurrencyCode,
  NaturalLanguageDraft,
} from "./types.js";

type TabId = "dashboard" | "calendar" | "bills" | "insight" | "budget" | "assets" | "invest" | "recurring";
type TxFilterKind = BookkeepingKind | "all";

interface BookkeepingModuleProps {
  readonly lang: BookkeepingLanguage;
}

const TABS: readonly { readonly id: TabId; readonly icon: string; readonly zh: string; readonly en: string }[] = [
  { id: "dashboard", icon: "layout", zh: "总看板", en: "Home" },
  { id: "calendar", icon: "calendar", zh: "日历", en: "Calendar" },
  { id: "bills", icon: "list", zh: "明细", en: "Bills" },
  { id: "insight", icon: "chart", zh: "统计", en: "Insight" },
  { id: "budget", icon: "target", zh: "预算", en: "Budget" },
  { id: "assets", icon: "wallet", zh: "资产", en: "Assets" },
  { id: "invest", icon: "trendUp", zh: "投资", en: "Invest" },
  { id: "recurring", icon: "repeat", zh: "周期", en: "Recurring" },
];

const TYPE_TABS: readonly { readonly id: BookkeepingKind; readonly zh: string; readonly en: string }[] = [
  { id: "expense", zh: "支出", en: "Expense" },
  { id: "income", zh: "收入", en: "Income" },
  { id: "transfer", zh: "转账", en: "Transfer" },
  { id: "prepay", zh: "预付", en: "Prepay" },
];

const TYPE_FILTERS: readonly { readonly id: TxFilterKind; readonly zh: string; readonly en: string }[] = [
  { id: "all", zh: "全部", en: "All" },
  ...TYPE_TABS,
];

function t(lang: BookkeepingLanguage, zh: string, en: string): string {
  return lang === "zh" ? zh : en;
}

function nameOf(value: { readonly name: string; readonly en: string } | null | undefined, lang: BookkeepingLanguage): string {
  if (!value) return "";
  return lang === "zh" ? value.name : value.en;
}

function onNumberInput(setter: (value: string) => void) {
  return (event: ChangeEvent<HTMLInputElement>) => setter(event.target.value.replace(/[^0-9.-]/g, ""));
}

function splitInput(value: string): readonly string[] {
  return value.split(/[,\n，、]+/).map((item) => item.trim()).filter(Boolean);
}

function accountFallbackId(state: BookkeepingState): string {
  return state.accounts[0]?.id ?? "cash";
}

function categoryFallbackId(state: BookkeepingState, kind: BookkeepingKind): string {
  return categoriesByKind(state, kind)[0]?.id ?? (kind === "income" ? "other" : kind === "transfer" ? "tf_move" : kind === "prepay" ? "pp_sub" : "food");
}

function accountTypeName(type: BookkeepingAccount["type"], lang: BookkeepingLanguage): string {
  const meta = accountTypeOf(type);
  return lang === "zh" ? meta.zh : meta.en;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthCells(year: number, month: number): readonly (number | null)[] {
  const first = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00`).getDay();
  const offset = (first + 6) % 7;
  const cells: (number | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth(year, month); day += 1) cells.push(day);
  while (cells.length % 7) cells.push(null);
  return cells;
}

function buildTxFromDraft(state: BookkeepingState, draft: NaturalLanguageDraft): BookkeepingTransaction {
  const ledger = ledgerOf(state);
  return {
    id: uid("t"),
    ledger: state.activeLedger,
    type: draft.type,
    cat: draft.cat,
    sub: draft.sub,
    amount: draft.amount,
    currency: ledger.currency,
    account: draft.account,
    date: todayKey(),
    time: nowTime(),
    note: draft.note,
    tags: [],
    reimburse: ledger.reimburse,
    private: ledger.private,
    merchant: "",
    location: "",
  };
}

function Sidebar({
  state,
  lang,
  setState,
  setModal,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly setState: (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void;
  readonly setModal: (modal: BookkeepingModal) => void;
}) {
  const worth = netWorth(state);
  return (
    <aside className="module-sidebar bk-sidebar" data-testid="bookkeeping-sidebar">
      <div className="bk-networth">
        <div className="bk-networth-label">{t(lang, "净资产", "Net worth")} · {worth.currency}</div>
        <div className="mono bk-networth-val">{money(worth.total, worth.currency)}</div>
        <div className="bk-networth-sub">
          <span>{t(lang, "现金", "Cash")} <b className="mono">{money(worth.cash, worth.currency)}</b></span>
          <span>{t(lang, "投资", "Invest")} <b className="mono">{money(worth.investment, worth.currency)}</b></span>
        </div>
      </div>

      <div className="bk-side-sechead">
        <span className="sec-label">{t(lang, "账本", "Ledgers")}</span>
        <button type="button" className="bk-side-add" onClick={() => setModal({ kind: "ledger" })} aria-label={t(lang, "新建账本", "New ledger")}>
          <Icon name="plus" size={14} />
        </button>
      </div>
      <div className="sidebar-section">
        {state.ledgers.map((ledger) => (
          <button
            key={ledger.id}
            type="button"
            className="list-row bk-ledger-row"
            data-active={state.activeLedger === ledger.id}
            onClick={() => setState((prev) => ({ ...prev, activeLedger: ledger.id, updatedAt: new Date().toISOString() }))}
          >
            <span className="bk-acct-ico" style={{ background: soft(ledger.hue), color: ink(ledger.hue) }}><Icon name={ledger.icon} size={13} /></span>
            <span className="grow">{nameOf(ledger, lang)}</span>
            <span className="bk-cur-badge">{ledger.currency}</span>
            {ledger.private ? <Icon name="lock" size={11} /> : null}
            <span
              role="button"
              tabIndex={0}
              className="bk-row-edit"
              onClick={(event) => {
                event.stopPropagation();
                setModal({ kind: "ledger", payload: ledger });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") setModal({ kind: "ledger", payload: ledger });
              }}
            >
              <Icon name="edit" size={12} />
            </span>
          </button>
        ))}
      </div>

      <div className="bk-side-sechead">
        <span className="sec-label">{t(lang, "账户", "Accounts")}</span>
        <button type="button" className="bk-side-add" onClick={() => setModal({ kind: "account" })} aria-label={t(lang, "新建账户", "New account")}>
          <Icon name="plus" size={14} />
        </button>
      </div>
      <div className="sidebar-section">
        {state.accounts.map((account) => (
          <button key={account.id} type="button" className="list-row bk-acct-row" onClick={() => setModal({ kind: "account", payload: account })}>
            <span className="bk-acct-ico" style={{ background: soft(account.hue), color: ink(account.hue) }}><Icon name={account.icon} size={13} /></span>
            <span className="grow">{nameOf(account, lang)}{account.isDefault ? <span className="bk-def-dot" /> : null}</span>
            <span className="mono tiny" style={{ color: account.balance < 0 ? RED : "var(--text-2)" }}>{money(account.balance, account.currency)}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-section sidebar-footer">
        <button type="button" className="list-row" onClick={() => setModal({ kind: "categories" })}>
          <Icon name="grid4" size={16} />
          <span className="grow">{t(lang, "分类与备注", "Categories")}</span>
        </button>
        <button type="button" className="list-row" onClick={() => setModal({ kind: "import-export" })}>
          <Icon name="download" size={16} />
          <span className="grow">{t(lang, "导入 / 导出", "Import/Export")}</span>
        </button>
      </div>
    </aside>
  );
}

function TransactionRow({
  state,
  lang,
  tx,
  showDate = false,
  onOpen,
  onDelete,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly tx: BookkeepingTransaction;
  readonly showDate?: boolean;
  readonly onOpen: (tx: BookkeepingTransaction) => void;
  readonly onDelete: (id: string) => void;
}) {
  const category = categoryOf(state, tx.cat);
  const account = accountOf(state, tx.account);
  const toAccount = tx.toAccount ? accountOf(state, tx.toAccount) : null;
  const transfer = tx.type === "transfer";
  return (
    <button type="button" className="bk-tx-row" onClick={() => onOpen(tx)}>
      <CatCircle cat={category} size={34} />
      <span className="bk-tx-main">
        <span className="bk-tx-name">
          {category ? nameOf(category, lang) : tx.cat}
          {tx.sub ? <span className="bk-tx-sub"> · {tx.sub}</span> : null}
          {tx.reimburse ? <span className="bk-flag-chip reimb">{t(lang, "报销", "Reimb")}</span> : null}
          {tx.private ? <Icon name="lock" size={11} /> : null}
          {tx.recurring ? <Icon name="repeat" size={11} /> : null}
        </span>
        <span className="tiny bk-tx-meta">
          {transfer && toAccount ? `${nameOf(account, lang)} -> ${nameOf(toAccount, lang)}` : tx.note || "-"}
          {tx.merchant ? ` · ${tx.merchant}` : ""}
          {showDate ? ` · ${tx.date.slice(5)}` : tx.time ? ` · ${tx.time}` : ""}
        </span>
      </span>
      {!transfer && account ? <span className="pill bk-acct-pill">{nameOf(account, lang)}</span> : null}
      <MoneyText amount={tx.amount} type={tx.type} currency={tx.currency} />
      <span
        role="button"
        tabIndex={0}
        className="bk-tx-del icon-btn"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(tx.id);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") onDelete(tx.id);
        }}
      >
        <Icon name="trash" size={14} />
      </span>
    </button>
  );
}

function Header({
  lang,
  state,
  activeTab,
  setModal,
  setState,
}: {
  readonly lang: BookkeepingLanguage;
  readonly state: BookkeepingState;
  readonly activeTab: TabId;
  readonly setModal: (modal: BookkeepingModal) => void;
  readonly setState: (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void;
}) {
  const ledger = ledgerOf(state);
  const view = state.prefs.billsView;
  return (
    <header className="module-head bk-head">
      <div className="row gap-2">
        <Icon name="wallet" size={18} />
        <h1 className="module-title">{t(lang, "记账", "Money")}</h1>
        <button type="button" className="bk-ledger-btn" onClick={() => setModal({ kind: "ledger", payload: ledger })}>
          <Icon name={ledger.icon} size={13} />
          {nameOf(ledger, lang)}
          <span className="bk-cur-badge">{ledger.currency}</span>
          <Icon name="chevD" size={12} />
        </button>
      </div>
      <div className="row gap-2">
        {activeTab === "bills" ? (
          <div className="seg bk-viewseg" aria-label={t(lang, "明细视图", "Bills view")}>
            {(["detail", "overview"] as readonly BillsView[]).map((next) => (
              <button
                key={next}
                type="button"
                aria-selected={view === next}
                onClick={() => setState((prev) => setPrefs(prev, { billsView: next }))}
                title={next === "detail" ? t(lang, "详细", "Detail") : t(lang, "概览", "Overview")}
              >
                <Icon name={next === "detail" ? "list" : "grid4"} size={15} />
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" className="btn ghost" onClick={() => setModal({ kind: "import-export" })}>
          <Icon name="download" size={15} />
          {t(lang, "导入导出", "Import")}
        </button>
        <button type="button" className="btn primary" onClick={() => setModal({ kind: "record" })}>
          <Icon name="plus" size={15} />
          {t(lang, "记一笔", "Add")}
        </button>
      </div>
    </header>
  );
}

function DashboardView({
  state,
  lang,
  setState,
  setModal,
  openTx,
  deleteTx,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly setState: (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void;
  readonly setModal: (modal: BookkeepingModal) => void;
  readonly openTx: (tx: BookkeepingTransaction) => void;
  readonly deleteTx: (id: string) => void;
}) {
  const ledger = ledgerOf(state);
  const allTx = useMemo(() => ledgerTransactions(state), [state]);
  const [range, setRange] = useState<{ readonly mode: "all" | "day" | "month" | "year"; readonly value?: string }>({ mode: "all" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizingRef = useRef(false);
  const filteredTx = useMemo(() => {
    if (range.mode === "all") return allTx;
    if (range.mode === "day") return allTx.filter((tx) => tx.date === range.value);
    if (range.mode === "month") return allTx.filter((tx) => tx.date.slice(0, 7) === range.value);
    return allTx.filter((tx) => tx.date.slice(0, 4) === range.value);
  }, [allTx, range]);
  const totals = totalsForTransactions(state, filteredTx);
  const groups = dayGroups(state, filteredTx);
  const common = useMemo(() => {
    const freq = new Map<string, number>();
    for (const tx of allTx) {
      if (tx.type !== "transfer") freq.set(tx.cat, (freq.get(tx.cat) ?? 0) + 1);
    }
    return [...freq.entries()]
      .map(([id, count]) => ({ category: categoryOf(state, id), count }))
      .filter((item): item is { readonly category: BookkeepingCategory; readonly count: number } => item.category !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allTx, state]);
  const [quickKind, setQuickKind] = useState<BookkeepingKind>("expense");

  useEffect(() => {
    function onMove(event: globalThis.PointerEvent): void {
      if (!resizingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(28, Math.min(72, ((event.clientX - rect.left) / rect.width) * 100));
      setState((prev) => setPrefs(prev, { dashboardSplit: pct }));
    }
    function onUp(): void {
      resizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setState]);

  const onDividerDown = (event: PointerEvent<HTMLDivElement>) => {
    resizingRef.current = true;
    event.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  const rangeLabel = range.mode === "all" ? t(lang, "全部时间", "All time") : range.value ?? "";
  const openSeed = (payload: Partial<BookkeepingTransaction>) => setModal({ kind: "record", payload });

  const billsPanel = (
    <section className="panel bk-dash-bills">
      <div className="bk-dash-bills-head">
        <button type="button" className="bk-grip" onClick={() => setState((prev) => setPrefs(prev, { dashboardOrder: prev.prefs.dashboardOrder === "bills-first" ? "quick-first" : "bills-first" }))}>
          <Icon name="grip" size={15} />
        </button>
        <button type="button" className={`bk-dash-sumbtn ${range.mode !== "all" ? "active" : ""}`} onClick={() => setPickerOpen((open) => !open)}>
          <span className="bk-dash-sum">
            <span><span className="tiny">{t(lang, "支出", "Expense")}</span><b className="mono bk-sum" style={{ color: RED }}>{money(totals.expense, ledger.currency)}</b></span>
            <span><span className="tiny">{t(lang, "收入", "Income")}</span><b className="mono bk-sum" style={{ color: GREEN }}>{money(totals.income, ledger.currency)}</b></span>
            <span><span className="tiny">{t(lang, "结余", "Net")}</span><b className="mono bk-sum">{money(totals.net, ledger.currency)}</b></span>
          </span>
          <span className="bk-dash-rangechip"><Icon name="calendar" size={12} /> {rangeLabel}</span>
        </button>
        {pickerOpen ? (
          <DateFilterPopover state={state} lang={lang} rows={allTx} onClose={() => setPickerOpen(false)} onApply={(next) => { setRange(next); setPickerOpen(false); }} />
        ) : null}
        <span className="grow" />
        <span className="tiny">{filteredTx.length} {t(lang, "笔", "items")}</span>
      </div>
      <div className="bk-dash-bills-body">
        {groups.map((group) => (
          <DayGroupBlock key={group.date} state={state} lang={lang} group={group} onOpen={openTx} onDelete={deleteTx} />
        ))}
        {groups.length === 0 ? <div className="bk-empty">{t(lang, "该时间范围内没有记录", "No records in this range")}</div> : null}
      </div>
    </section>
  );

  const quickPanel = (
    <section className="panel bk-quick-panel">
      <div className="bk-quick-head">
        <button type="button" className="bk-grip" onClick={() => setState((prev) => setPrefs(prev, { dashboardOrder: prev.prefs.dashboardOrder === "bills-first" ? "quick-first" : "bills-first" }))}>
          <Icon name="grip" size={15} />
        </button>
        <h3>{t(lang, "快速记账", "Quick add")}</h3>
        <span className="grow" />
        <button type="button" className="btn primary bk-quick-full" onClick={() => setModal({ kind: "record" })}><Icon name="plus" size={14} /> {t(lang, "记一笔", "Add")}</button>
      </div>
      {common.length > 0 ? (
        <>
          <div className="bk-field-label">{t(lang, "常用", "Frequent")}</div>
          <div className="bk-quick-common">
            {common.map(({ category }) => (
              <button key={category.id} type="button" className="bk-qchip" onClick={() => openSeed({ type: category.kind, cat: category.id })}>
                <span className="bk-qchip-ico" style={{ background: soft(category.hue), color: ink(category.hue) }}><Icon name={category.icon} size={14} /></span>
                {nameOf(category, lang)}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <div className="seg bk-quick-seg">
        {TYPE_TABS.map((kind) => (
          <button key={kind.id} type="button" aria-selected={quickKind === kind.id} onClick={() => setQuickKind(kind.id)}>
            {t(lang, kind.zh, kind.en)}
          </button>
        ))}
      </div>
      <div className="bk-quick-grid">
        {categoriesByKind(state, quickKind).map((category) => (
          <button key={category.id} type="button" className="bk-qcat" onClick={() => openSeed({ type: quickKind, cat: category.id })}>
            <span className="bk-qcat-ico" style={{ background: soft(category.hue), color: ink(category.hue) }}><Icon name={category.icon} size={18} /></span>
            <span className="bk-qcat-name">{nameOf(category, lang)}</span>
          </button>
        ))}
        <button type="button" className="bk-qcat bk-qcat-add" onClick={() => setModal({ kind: "categories" })}>
          <span className="bk-qcat-ico bk-qcat-addico"><Icon name="plus" size={18} /></span>
          <span className="bk-qcat-name">{t(lang, "自定义", "Custom")}</span>
        </button>
      </div>
    </section>
  );

  const billsFirst = state.prefs.dashboardOrder === "bills-first";
  return (
    <div className="bk-dash" ref={containerRef}>
      <div className="bk-dash-slot" style={{ width: `${state.prefs.dashboardSplit}%` }}>{billsFirst ? billsPanel : quickPanel}</div>
      <div className="bk-dash-divider" onPointerDown={onDividerDown}>
        <span className="bk-divider-line" />
        <button type="button" className="bk-swap-btn" onPointerDown={(event) => event.stopPropagation()} onClick={() => setState((prev) => setPrefs(prev, { dashboardOrder: prev.prefs.dashboardOrder === "bills-first" ? "quick-first" : "bills-first" }))}>
          <Icon name="swap" size={13} />
        </button>
      </div>
      <div className="bk-dash-slot bk-dash-slot-flex">{billsFirst ? quickPanel : billsPanel}</div>
    </div>
  );
}

function DateFilterPopover({
  state,
  lang,
  rows,
  onApply,
  onClose,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly rows: readonly BookkeepingTransaction[];
  readonly onApply: (range: { readonly mode: "all" | "day" | "month" | "year"; readonly value?: string }) => void;
  readonly onClose: () => void;
}) {
  const [mode, setMode] = useState<"day" | "month" | "year">("day");
  const [cursor, setCursor] = useState(new Date(`${todayKey()}T00:00:00`));
  const dayAgg = calendarDayTotals(state, rows);
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const cells = monthCells(year, month);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const years = [year - 2, year - 1, year, year + 1];
  return (
    <>
      <span className="bk-pop-scrim" onClick={onClose} />
      <div className="bk-datepop bk-datepop-lg">
        <div className="bk-datepop-top">
          <div className="seg bk-datepop-seg">
            {(["day", "month", "year"] as const).map((item) => (
              <button key={item} type="button" aria-selected={mode === item} onClick={() => setMode(item)}>
                {item === "day" ? t(lang, "日", "Day") : item === "month" ? t(lang, "月", "Month") : t(lang, "年", "Year")}
              </button>
            ))}
          </div>
          <button type="button" className="bk-textbtn" onClick={() => onApply({ mode: "all" })}>{t(lang, "全部时间", "All")}</button>
        </div>
        {mode === "day" ? (
          <div>
            <div className="bk-dp-nav">
              <button type="button" className="icon-btn" onClick={() => setCursor(addMonths(cursor, -1))}><Icon name="chevL" size={15} /></button>
              <span className="mono bk-dp-period">{year}-{String(month).padStart(2, "0")}</span>
              <button type="button" className="icon-btn" onClick={() => setCursor(addMonths(cursor, 1))}><Icon name="chevR" size={15} /></button>
              <span className="grow" />
              <button type="button" className="bk-dp-whole" onClick={() => onApply({ mode: "month", value: monthKey(cursor) })}>{t(lang, "整月", "Whole month")}</button>
            </div>
            <div className="bk-dp-week">{(lang === "zh" ? ["一", "二", "三", "四", "五", "六", "日"] : ["M", "T", "W", "T", "F", "S", "S"]).map((item, index) => <span key={index}>{item}</span>)}</div>
            <div className="bk-dp-grid">
              {cells.map((day, index) => {
                if (day === null) return <span key={index} className="bk-dp-cell blank" />;
                const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const totals = dayAgg[key];
                return (
                  <button key={index} type="button" className={`bk-dp-cell ${totals ? "has" : ""}`} onClick={() => onApply({ mode: "day", value: key })}>
                    <span className="bk-dp-d mono">{day}</span>
                    <span className="bk-dp-amt">
                      {totals?.expense ? <i className="exp">-{Math.round(totals.expense)}</i> : null}
                      {totals?.income ? <i className="inc">+{Math.round(totals.income)}</i> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {mode === "month" ? (
          <div>
            <div className="bk-dp-nav">
              <button type="button" className="icon-btn" onClick={() => setCursor(new Date(year - 1, 0, 1))}><Icon name="chevL" size={15} /></button>
              <span className="mono bk-dp-period">{year}</span>
              <button type="button" className="icon-btn" onClick={() => setCursor(new Date(year + 1, 0, 1))}><Icon name="chevR" size={15} /></button>
              <span className="grow" />
              <button type="button" className="bk-dp-whole" onClick={() => onApply({ mode: "year", value: String(year) })}>{t(lang, "整年", "Whole year")}</button>
            </div>
            <div className="bk-dp-mgrid">
              {months.map((item) => (
                <button key={item} type="button" className="bk-dp-mcell" onClick={() => onApply({ mode: "month", value: `${year}-${String(item).padStart(2, "0")}` })}>
                  <span className="bk-dp-mname">{lang === "zh" ? `${item}月` : item}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {mode === "year" ? (
          <div className="bk-dp-years">
            {years.map((item) => (
              <button key={item} type="button" className="bk-dp-ycell" onClick={() => onApply({ mode: "year", value: String(item) })}>
                <span className="bk-dp-yname mono">{item}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

function DayGroupBlock({
  state,
  lang,
  group,
  onOpen,
  onDelete,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly group: ReturnType<typeof dayGroups>[number];
  readonly onOpen: (tx: BookkeepingTransaction) => void;
  readonly onDelete: (id: string) => void;
}) {
  const ledger = ledgerOf(state);
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][new Date(`${group.date}T00:00:00`).getDay()];
  return (
    <div className="bk-day-group">
      <div className="bk-day-head">
        <span className="bk-day-d">{Number(group.date.slice(8))} {t(lang, "日", "")}</span>
        <span className="tiny">{lang === "zh" ? `周${weekday}` : group.date.slice(5)}</span>
        <span className="grow" />
        {group.totals.expense > 0 ? <span className="tiny mono">{t(lang, "支", "-")} {money(group.totals.expense, ledger.currency)}</span> : null}
        {group.totals.income > 0 ? <span className="tiny mono">{t(lang, "收", "+")} {money(group.totals.income, ledger.currency)}</span> : null}
      </div>
      {group.items.map((tx) => <TransactionRow key={tx.id} state={state} lang={lang} tx={tx} onOpen={onOpen} onDelete={onDelete} />)}
    </div>
  );
}

function BillsView({
  state,
  lang,
  openTx,
  deleteTx,
  openRecord,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly openTx: (tx: BookkeepingTransaction) => void;
  readonly deleteTx: (id: string) => void;
  readonly openRecord: (payload?: Partial<BookkeepingTransaction>) => void;
}) {
  const [query, setQuery] = useState("");
  const [filterKind, setFilterKind] = useState<TxFilterKind>("all");
  const rows = useMemo(() => filterTransactions(ledgerTransactions(state), query, filterKind), [filterKind, query, state]);
  const ledger = ledgerOf(state);
  const totals = totalsForTransactions(state, rows);

  if (state.prefs.billsView === "overview") {
    const expenseTotals = categoryTotals(state, ledgerTransactions(state), "expense");
    const incomeTotals = categoryTotals(state, ledgerTransactions(state), "income");
    return (
      <div className="bk-scroll">
        <div className="bk-stat-row">
          <Kpi label={t(lang, "本月支出", "Expense")} value={money(totals.expense, ledger.currency)} color={RED} />
          <Kpi label={t(lang, "本月收入", "Income")} value={money(totals.income, ledger.currency)} color={GREEN} />
          <Kpi label={t(lang, "结余", "Net")} value={money(totals.net, ledger.currency)} />
        </div>
        <CategoryCardSection title={t(lang, "支出分类", "Expense")} state={state} lang={lang} rows={expenseTotals} kind="expense" currency={ledger.currency} openRecord={openRecord} />
        <CategoryCardSection title={t(lang, "收入分类", "Income")} state={state} lang={lang} rows={incomeTotals} kind="income" currency={ledger.currency} openRecord={openRecord} />
      </div>
    );
  }

  return (
    <div className="bk-list-wrap">
      <section className="panel bk-list-main">
        <div className="bk-list-head">
          <Kpi label={t(lang, "支出", "Exp")} value={money(totals.expense, ledger.currency)} color={RED} compact />
          <Kpi label={t(lang, "收入", "Inc")} value={money(totals.income, ledger.currency)} color={GREEN} compact />
          <Kpi label={t(lang, "结余", "Net")} value={money(totals.net, ledger.currency)} compact />
          <span className="grow" />
          <label className="bk-search">
            <Icon name="search" size={14} />
            <input value={query} placeholder={t(lang, "搜索备注、商家、标签", "Search note, merchant, tag")} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <select className="bk-input bk-filter-select" value={filterKind} onChange={(event) => setFilterKind(event.target.value as TxFilterKind)}>
            {TYPE_FILTERS.map((item) => <option key={item.id} value={item.id}>{t(lang, item.zh, item.en)}</option>)}
          </select>
        </div>
        <div className="bk-list-body">
          {dayGroups(state, rows).map((group) => <DayGroupBlock key={group.date} state={state} lang={lang} group={group} onOpen={openTx} onDelete={deleteTx} />)}
          {rows.length === 0 ? <div className="bk-empty">{t(lang, "没有匹配的流水", "No matching records")}</div> : null}
        </div>
      </section>
      <aside className="bk-list-side">
        <BudgetMini state={state} lang={lang} />
        <BreakdownMini state={state} lang={lang} />
      </aside>
    </div>
  );
}

function Kpi({ label, value, color, compact = false }: { readonly label: string; readonly value: string; readonly color?: string; readonly compact?: boolean }) {
  return (
    <div className={compact ? "bk-kpi-inline" : "panel bk-kpi"}>
      <div className="bk-kpi-label">{label}</div>
      <div className="mono bk-kpi-val" style={{ color }}>{value}</div>
    </div>
  );
}

function CategoryCardSection({
  title,
  state,
  lang,
  rows,
  kind,
  currency,
  openRecord,
}: {
  readonly title: string;
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly rows: readonly ReturnType<typeof categoryTotals>[number][];
  readonly kind: BookkeepingKind;
  readonly currency: CurrencyCode;
  readonly openRecord: (payload?: Partial<BookkeepingTransaction>) => void;
}) {
  const activeRows = rows.length > 0 ? rows : categoriesByKind(state, kind).map((category) => ({ category, amount: 0, pct: 0, count: 0 }));
  return (
    <>
      <div className="bk-sec-head"><span className="sec-label">{title}</span></div>
      <div className="bk-ccards">
        {activeRows.map(({ category, amount }) => (
          <button key={category.id} type="button" className="bk-ccard" onClick={() => openRecord({ type: kind, cat: category.id })}>
            <span className="bk-ccard-ico" style={{ background: soft(category.hue), color: ink(category.hue) }}><Icon name={category.icon} size={17} /></span>
            <span className="bk-ccard-name">{nameOf(category, lang)}</span>
            <span className="mono bk-ccard-amt">{money(amount, currency)}</span>
            {category.budget > 0 ? <span className="bk-ccard-bar"><span style={{ width: `${Math.min(100, (amount / category.budget) * 100)}%`, background: ink(category.hue) }} /></span> : null}
          </button>
        ))}
      </div>
    </>
  );
}

function BudgetMini({ state, lang }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage }) {
  const ledger = ledgerOf(state);
  const rows = ledgerTransactions(state);
  const total = totalsForTransactions(state, rows).expense;
  return (
    <section className="panel bk-side-panel">
      <div className="bk-side-head">
        <h3>{t(lang, "本月预算", "Budget")}</h3>
        <span className="grow" />
        <span className="mono tiny">{Math.round((total / state.budgetTotal) * 100)}%</span>
      </div>
      {categoriesByKind(state, "expense").filter((category) => category.budget > 0).slice(0, 5).map((category) => {
        const spent = rows.filter((tx) => (tx.type === "expense" || tx.type === "prepay") && tx.cat === category.id).reduce((sum, tx) => sum + txInLedgerCurrency(state, tx), 0);
        return (
          <div key={category.id} className="bk-budget-mini-row">
            <div className="bk-budline">
              <span>{nameOf(category, lang)}</span>
              <span className="grow" />
              <span className="mono tiny">{money(spent, ledger.currency)} / {money(category.budget, ledger.currency)}</span>
            </div>
            <Bar pct={category.budget ? (spent / category.budget) * 100 : 0} hue={category.hue} />
          </div>
        );
      })}
    </section>
  );
}

function BreakdownMini({ state, lang }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage }) {
  const ledger = ledgerOf(state);
  const totals = categoryTotals(state, ledgerTransactions(state), "expense");
  return (
    <section className="panel bk-side-panel bk-side-breakdown">
      <div className="bk-side-head"><h3>{t(lang, "支出构成", "Breakdown")}</h3></div>
      <div className="bk-donut-row">
        <Donut size={108} stroke={13} segs={totals.slice(0, 6).map((row) => ({ v: row.amount, color: ink(row.category.hue) }))}>
          <span className="mono bk-donut-label">{money(totals.reduce((sum, row) => sum + row.amount, 0), ledger.currency)}</span>
        </Donut>
        <ul className="bk-legend">
          {totals.slice(0, 5).map((row) => (
            <li key={row.category.id}><span className="dot" style={{ color: ink(row.category.hue) }} />{nameOf(row.category, lang)}<span className="grow" /><span className="mono tiny">{Math.round(row.pct)}%</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CalendarView({
  state,
  lang,
  setState,
  openTx,
  deleteTx,
  openRecord,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly setState: (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void;
  readonly openTx: (tx: BookkeepingTransaction) => void;
  readonly deleteTx: (id: string) => void;
  readonly openRecord: (payload?: Partial<BookkeepingTransaction>) => void;
}) {
  const now = new Date(`${todayKey()}T00:00:00`);
  const [cursor, setCursor] = useState(now);
  const [selected, setSelected] = useState(todayKey());
  const mode = state.prefs.calendarMode;
  const rows = ledgerTransactions(state).filter((tx) => tx.type !== "transfer");
  const dayAgg = calendarDayTotals(state, rows);
  const ledger = ledgerOf(state);
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const periodRows = mode === "month" ? rows.filter((tx) => tx.date.slice(0, 7) === monthKey(cursor)) : rows.filter((tx) => tx.date.slice(0, 4) === String(year));
  const periodTotals = totalsForTransactions(state, periodRows);
  return (
    <div className="bk-calx">
      <div className="bk-calx-head">
        <div className="seg bk-calx-modeseg">
          <button type="button" aria-selected={mode === "month"} onClick={() => setState((prev) => setPrefs(prev, { calendarMode: "month" }))}><Icon name="calendar" size={13} /> {t(lang, "月", "Month")}</button>
          <button type="button" aria-selected={mode === "year"} onClick={() => setState((prev) => setPrefs(prev, { calendarMode: "year" }))}><Icon name="grid4" size={13} /> {t(lang, "年", "Year")}</button>
        </div>
        <div className="bk-calx-nav">
          <button type="button" className="icon-btn" onClick={() => setCursor(mode === "month" ? addMonths(cursor, -1) : new Date(year - 1, 0, 1))}><Icon name="chevL" size={16} /></button>
          <span className="bk-calx-period mono">{mode === "month" ? `${year}-${String(month).padStart(2, "0")}` : year}</span>
          <button type="button" className="icon-btn" onClick={() => setCursor(mode === "month" ? addMonths(cursor, 1) : new Date(year + 1, 0, 1))}><Icon name="chevR" size={16} /></button>
        </div>
        <span className="grow" />
        <div className="bk-calx-totals">
          <span className="tiny">{t(lang, "支出", "Exp")} <b className="mono" style={{ color: RED }}>{money(periodTotals.expense, ledger.currency)}</b></span>
          <span className="tiny">{t(lang, "收入", "Inc")} <b className="mono" style={{ color: GREEN }}>{money(periodTotals.income, ledger.currency)}</b></span>
          <span className="tiny">{t(lang, "结余", "Net")} <b className="mono">{money(periodTotals.net, ledger.currency)}</b></span>
        </div>
      </div>
      {mode === "month" ? (
        <MonthCalendar state={state} lang={lang} rows={rows} dayAgg={dayAgg} year={year} month={month} selected={selected} setSelected={setSelected} openTx={openTx} deleteTx={deleteTx} openRecord={openRecord} />
      ) : (
        <YearCalendar lang={lang} dayAgg={dayAgg} year={year} onPickDay={(day) => { setSelected(day); setCursor(new Date(`${day.slice(0, 7)}-01T00:00:00`)); setState((prev) => setPrefs(prev, { calendarMode: "month" })); }} onPickMonth={(monthNo) => { setCursor(new Date(year, monthNo - 1, 1)); setState((prev) => setPrefs(prev, { calendarMode: "month" })); }} />
      )}
    </div>
  );
}

function MonthCalendar({
  state,
  lang,
  rows,
  dayAgg,
  year,
  month,
  selected,
  setSelected,
  openTx,
  deleteTx,
  openRecord,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly rows: readonly BookkeepingTransaction[];
  readonly dayAgg: Record<string, ReturnType<typeof totalsForTransactions>>;
  readonly year: number;
  readonly month: number;
  readonly selected: string;
  readonly setSelected: (day: string) => void;
  readonly openTx: (tx: BookkeepingTransaction) => void;
  readonly deleteTx: (id: string) => void;
  readonly openRecord: (payload?: Partial<BookkeepingTransaction>) => void;
}) {
  const ledger = ledgerOf(state);
  const selectedRows = rows.filter((tx) => tx.date === selected).sort((a, b) => (a.time < b.time ? 1 : -1));
  const selectedTotals = totalsForTransactions(state, selectedRows);
  return (
    <div className="bk-calx-body">
      <section className="panel bk-calx-grid-panel">
        <div className="bk-calx-week">{(lang === "zh" ? ["一", "二", "三", "四", "五", "六", "日"] : ["M", "T", "W", "T", "F", "S", "S"]).map((item, index) => <span key={index} className={index >= 5 ? "we" : ""}>{item}</span>)}</div>
        <div className="bk-calx-grid">
          {monthCells(year, month).map((day, index) => {
            if (day === null) return <span key={index} className="bk-calx-cell blank" />;
            const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const totals = dayAgg[key];
            return (
              <button key={index} type="button" className={`bk-calx-cell ${selected === key ? "on" : ""} ${totals ? "has" : ""}`} onClick={() => setSelected(key)}>
                <span className="bk-calx-d mono">{day}</span>
                <span className="bk-calx-amts">
                  {totals?.expense ? <span className="bk-calx-exp mono">-{Math.round(totals.expense)}</span> : null}
                  {totals?.income ? <span className="bk-calx-inc mono">+{Math.round(totals.income)}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="panel bk-calx-day">
        <div className="bk-cal-day-head">
          <div className="bk-cal-day-title"><span className="bk-cal-day-num">{Number(selected.slice(8))}</span><span className="muted">{selected.slice(5, 7)} {t(lang, "月", "/")}</span></div>
          <div className="bk-cal-day-total">
            <span className="tiny">{t(lang, "支出", "Exp")} <b className="mono" style={{ color: RED }}>{money(selectedTotals.expense, ledger.currency)}</b></span>
            <span className="tiny">{t(lang, "收入", "Inc")} <b className="mono" style={{ color: GREEN }}>{money(selectedTotals.income, ledger.currency)}</b></span>
          </div>
        </div>
        <div className="bk-cal-day-body">
          {selectedRows.map((tx) => <TransactionRow key={tx.id} state={state} lang={lang} tx={tx} onOpen={openTx} onDelete={deleteTx} />)}
          {selectedRows.length === 0 ? <div className="bk-empty">{t(lang, "这天还没有记录", "No records")}</div> : null}
        </div>
        <div className="bk-cal-day-foot">
          <button type="button" className="btn primary bk-full" onClick={() => openRecord({ date: selected })}><Icon name="plus" size={15} /> {t(lang, "在这天记一笔", "Add on this day")}</button>
        </div>
      </section>
    </div>
  );
}

function YearCalendar({
  lang,
  dayAgg,
  year,
  onPickDay,
  onPickMonth,
}: {
  readonly lang: BookkeepingLanguage;
  readonly dayAgg: Record<string, ReturnType<typeof totalsForTransactions>>;
  readonly year: number;
  readonly onPickDay: (day: string) => void;
  readonly onPickMonth: (month: number) => void;
}) {
  const max = Math.max(1, ...Object.entries(dayAgg).filter(([day]) => day.startsWith(String(year))).map(([, totals]) => totals.expense + totals.income));
  return (
    <div className="bk-yr365">
      {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
        const cells = monthCells(year, month);
        return (
          <section key={month} className="panel bk-yr-mini">
            <button type="button" className="bk-yr-mini-head" onClick={() => onPickMonth(month)}>
              <span className="bk-yr-mini-name">{lang === "zh" ? `${month}月` : month}</span>
            </button>
            <div className="bk-yr-mini-wk">{(lang === "zh" ? ["一", "二", "三", "四", "五", "六", "日"] : ["M", "T", "W", "T", "F", "S", "S"]).map((item, index) => <span key={index} className={index >= 5 ? "we" : ""}>{item}</span>)}</div>
            <div className="bk-yr-mini-grid">
              {cells.map((day, index) => {
                if (day === null) return <span key={index} className="bk-yr-day blank" />;
                const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const totals = dayAgg[key];
                const amount = totals ? totals.expense + totals.income : 0;
                const color = totals && totals.income > totals.expense ? GREEN : RED;
                return (
                  <button key={index} type="button" className={`bk-yr-day ${totals ? "has" : ""}`} style={totals ? { background: `color-mix(in oklch, ${color} ${Math.round(18 + (amount / max) * 62)}%, transparent)` } : undefined} onClick={() => onPickDay(key)}>
                    {day}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function InsightView({ state, lang }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage }) {
  const [range, setRange] = useState("lastMonth");
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState(todayKey());
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [drill, setDrill] = useState<string | null>(null);
  const ledger = ledgerOf(state);
  const today = todayKey();
  const rows = ledgerTransactions(state).filter((tx) => {
    if (tx.type === "transfer") return false;
    if (range === "all") return true;
    if (range === "30d") {
      const start = new Date(`${today}T00:00:00`);
      start.setDate(start.getDate() - 30);
      return tx.date >= todayKey(start) && tx.date <= today;
    }
    if (range === "year") return tx.date.slice(0, 4) === today.slice(0, 4);
    if (range === "month") return tx.date.slice(0, 7) === today.slice(0, 7);
    if (range === "lastMonth") return tx.date.slice(0, 7) === "2026-05";
    if (range === "last2") return tx.date.slice(0, 7) === "2026-04";
    return tx.date >= from && tx.date <= to;
  });
  const totals = totalsForTransactions(state, rows);
  const cats = categoryTotals(state, rows, kind);
  const byDay = [...dayGroups(state, rows)].reverse();
  const maxDay = byDay.reduce((max, group) => Math.max(max, group.totals.expense), 1);
  const drillRows = drill ? rows.filter((tx) => tx.cat === drill && (kind === "income" ? tx.type === "income" : tx.type !== "income")) : [];
  const ranges = [
    ["all", t(lang, "全部", "All")],
    ["30d", t(lang, "近30天", "30d")],
    ["year", t(lang, "今年", "Year")],
    ["month", t(lang, "本月", "This mo.")],
    ["lastMonth", t(lang, "上月", "Last mo.")],
    ["last2", t(lang, "上上月", "2 mo. ago")],
    ["custom", t(lang, "自定义", "Custom")],
  ] as const;
  return (
    <div className="bk-scroll bk-insight">
      <div className="bk-range-bar">
        {ranges.map(([id, label]) => <button key={id} type="button" className={`bk-range-pill ${range === id ? "on" : ""}`} onClick={() => setRange(id)}>{label}</button>)}
        {range === "custom" ? <span className="bk-range-custom"><input className="bk-input" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /><span className="tiny">&rarr;</span><input className="bk-input" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></span> : null}
      </div>
      <div className="bk-ins-kpis">
        <Kpi label={t(lang, "总收入", "Income")} value={money(totals.income, ledger.currency)} color={GREEN} />
        <Kpi label={t(lang, "总支出", "Expense")} value={money(totals.expense, ledger.currency)} color={RED} />
        <Kpi label={t(lang, "结余", "Net")} value={money(totals.net, ledger.currency)} />
      </div>
      <div className="bk-ins-charts">
        <section className="panel bk-ins-chart">
          <div className="bk-side-head"><h3>{t(lang, "每日支出趋势", "Daily expense")}</h3></div>
          <div className="bk-area-bars">
            {byDay.map((group) => <span key={group.date} style={{ height: `${Math.max(4, (group.totals.expense / maxDay) * 100)}%` }} title={`${group.date}: ${Math.round(group.totals.expense)}`} />)}
          </div>
        </section>
        <section className="panel bk-ins-chart bk-ins-chart-sm">
          <div className="bk-side-head"><h3>{t(lang, "收支占比", "In/Out")}</h3></div>
          <div className="bk-donut-row">
            <Donut segs={[{ v: totals.expense, color: RED }, { v: totals.income, color: GREEN }]}>
              <span className="tiny">{t(lang, "储蓄率", "Save")}</span>
              <b className="mono">{totals.income ? Math.round((totals.net / totals.income) * 100) : 0}%</b>
            </Donut>
          </div>
        </section>
      </div>
      <div className="bk-sec-head">
        <span className="sec-label">{t(lang, "分类分析", "Category breakdown")}</span>
        <div className="seg bk-anaseg">
          <button type="button" aria-selected={kind === "expense"} onClick={() => { setKind("expense"); setDrill(null); }}>{t(lang, "支出", "Expense")}</button>
          <button type="button" aria-selected={kind === "income"} onClick={() => { setKind("income"); setDrill(null); }}>{t(lang, "收入", "Income")}</button>
        </div>
      </div>
      <div className="bk-ana-wrap">
        <section className="panel bk-ana-donut">
          <Donut size={150} stroke={18} segs={cats.map((row) => ({ v: row.amount, color: ink(row.category.hue) }))}>
            <span className="mono bk-donut-label">{money(kind === "income" ? totals.income : totals.expense, ledger.currency)}</span>
          </Donut>
        </section>
        <section className="panel bk-ana-list">
          {cats.map((row) => (
            <div key={row.category.id}>
              <button type="button" className={`bk-ana-row ${drill === row.category.id ? "on" : ""}`} onClick={() => setDrill(drill === row.category.id ? null : row.category.id)}>
                <CatCircle cat={row.category} size={32} />
                <span className="bk-ana-main"><b>{nameOf(row.category, lang)}</b><Bar pct={row.pct} hue={row.category.hue} /></span>
                <span className="mono">{money(row.amount, ledger.currency)}</span>
                <span className="mono tiny">{row.pct.toFixed(1)}%</span>
              </button>
              {drill === row.category.id ? <div className="bk-ana-drill">{drillRows.map((tx) => <span key={tx.id} className="bk-ana-drill-row"><span className="tiny mono">{tx.date.slice(5)} {tx.time}</span><span className="grow">{tx.note}</span><MoneyText amount={tx.amount} type={tx.type} currency={tx.currency} /></span>)}</div> : null}
            </div>
          ))}
          {cats.length === 0 ? <div className="bk-empty">{t(lang, "此范围无数据", "No data")}</div> : null}
        </section>
      </div>
    </div>
  );
}

function BudgetView({
  state,
  lang,
  setState,
  setModal,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly setState: (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void;
  readonly setModal: (modal: BookkeepingModal) => void;
}) {
  const ledger = ledgerOf(state);
  const rows = ledgerTransactions(state);
  const spent = totalsForTransactions(state, rows).expense;
  const pct = state.budgetTotal ? Math.round((spent / state.budgetTotal) * 100) : 0;
  const [editing, setEditing] = useState(false);
  return (
    <div className="bk-scroll">
      <section className="panel bk-budget-hero">
        <Donut size={150} stroke={16} segs={[{ v: spent, color: pct > 100 ? RED : "var(--accent)" }, { v: Math.max(0, state.budgetTotal - spent), color: "var(--border-1)" }]}>
          <span className="tiny">{t(lang, "已用", "Used")} {pct}%</span>
          <b className="mono">{money(state.budgetTotal - spent, ledger.currency)}</b>
          <span className="tiny">{t(lang, "剩余", "Left")}</span>
        </Donut>
        <div className="bk-budget-meta">
          <div className="bk-budget-total-row">
            <span className="bk-field-label">{t(lang, "本月总预算", "Monthly budget")}</span>
            {editing ? (
              <input className="bk-input mono" autoFocus defaultValue={state.budgetTotal} onBlur={(event) => { setState((prev) => ({ ...prev, budgetTotal: Math.max(0, Number(event.target.value) || prev.budgetTotal), updatedAt: new Date().toISOString() })); setEditing(false); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
            ) : (
              <button type="button" className="bk-total-val mono" onClick={() => setEditing(true)}>{money(state.budgetTotal, ledger.currency)} <Icon name="edit" size={12} /></button>
            )}
          </div>
          <div className="bk-budget-stats">
            <span>{t(lang, "已支出", "Spent")} <b className="mono">{money(spent, ledger.currency)}</b></span>
            <span>{t(lang, "日均可用", "Daily left")} <b className="mono" style={{ color: GREEN }}>{money(Math.max(0, (state.budgetTotal - spent) / 30), ledger.currency)}</b></span>
          </div>
          {pct > 100 ? <div className="bk-over-warn"><Icon name="bell" size={13} /> {t(lang, "已超出预算，注意控制开支", "Over budget")}</div> : null}
        </div>
      </section>
      <div className="bk-sec-head"><span className="sec-label">{t(lang, "分类预算", "Category budgets")}</span><button type="button" className="bk-textbtn" onClick={() => setModal({ kind: "categories" })}><Icon name="edit" size={13} /> {t(lang, "调整", "Edit")}</button></div>
      <div className="bk-budget-list">
        {categoriesByKind(state, "expense").filter((category) => category.budget > 0).map((category) => {
          const amount = rows.filter((tx) => (tx.type === "expense" || tx.type === "prepay") && tx.cat === category.id).reduce((sum, tx) => sum + txInLedgerCurrency(state, tx), 0);
          return (
            <div key={category.id} className="panel bk-budget-item">
              <CatCircle cat={category} size={36} />
              <span className="bk-budget-main"><span className="bk-budline"><b>{nameOf(category, lang)}</b><span className="grow" /><span className="mono tiny">{money(amount, ledger.currency)} / {money(category.budget, ledger.currency)}</span></span><Bar pct={(amount / category.budget) * 100} hue={category.hue} height={6} /></span>
              <span className="mono bk-budget-pct">{Math.round((amount / category.budget) * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssetsView({ state, lang, setModal }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage; readonly setModal: (modal: BookkeepingModal) => void }) {
  const worth = netWorth(state);
  return (
    <div className="bk-scroll">
      <section className="panel bk-asset-big">
        <div className="bk-kpi-label">{t(lang, "总资产", "Total assets")} · {worth.currency}</div>
        <div className="mono bk-asset-total">{money(worth.total, worth.currency)}</div>
        <div className="bk-asset-split"><span>{t(lang, "现金及存款", "Cash")} <b>{money(worth.cash, worth.currency)}</b></span><span>{t(lang, "投资市值", "Invest")} <b>{money(worth.investment, worth.currency)}</b></span></div>
      </section>
      <div className="bk-sec-head"><span className="sec-label">{t(lang, "账户", "Accounts")}</span><button type="button" className="bk-textbtn" onClick={() => setModal({ kind: "account" })}><Icon name="plus" size={13} /> {t(lang, "新建账户", "Add")}</button></div>
      <div className="bk-acct-cards">
        {state.accounts.map((account) => (
          <button key={account.id} type="button" className="panel bk-acct-card" onClick={() => setModal({ kind: "account", payload: account })}>
            <span className="bk-acct-card-top"><span className="bk-acct-ico lg" style={{ background: soft(account.hue), color: ink(account.hue) }}><Icon name={account.icon} size={18} /></span><span className="grow"><b>{nameOf(account, lang)}</b><span className="tiny">{accountTypeName(account.type, lang)} · {account.currency}</span></span><Icon name="edit" size={13} /></span>
            <span className="mono bk-acct-bal" style={{ color: account.balance < 0 ? RED : "var(--text-1)" }}>{money(account.balance, account.currency)}</span>
            {account.type === "credit" ? <span className="tiny bk-acct-credit">{t(lang, "额度", "Limit")} {money(account.limit ?? 0, account.currency)} · {t(lang, "出账", "Bill")} {account.billDay} · {t(lang, "还款", "Due")} {account.repayDay}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function InvestView({
  state,
  lang,
  setState,
  setModal,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly setState: (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void;
  readonly setModal: (modal: BookkeepingModal) => void;
}) {
  const rows = state.invest.map((holding) => {
    const value = holding.shares * holding.price;
    const cost = holding.shares * holding.cost;
    return { ...holding, value, pl: value - cost, pct: cost ? ((value - cost) / cost) * 100 : 0 };
  });
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
  const totalPl = rows.reduce((sum, row) => sum + row.pl, 0);
  return (
    <div className="bk-scroll">
      <section className="panel bk-asset-big">
        <div className="bk-kpi-label">{t(lang, "持仓市值", "Holdings value")}</div>
        <div className="mono bk-asset-total">{money(totalValue, "CNY")}</div>
        <div className="bk-asset-split"><span>{t(lang, "总盈亏", "Total P/L")} <b style={{ color: totalPl >= 0 ? RED : GREEN }}>{totalPl >= 0 ? "+" : ""}{money(totalPl, "CNY")}</b></span></div>
      </section>
      <div className="bk-sec-head"><span className="sec-label">{t(lang, "持仓明细", "Holdings")}</span><button type="button" className="bk-textbtn" onClick={() => setModal({ kind: "invest" })}><Icon name="plus" size={13} /> {t(lang, "新增持仓", "Add")}</button></div>
      <section className="panel bk-invest-table">
        <div className="bk-invest-thead"><span>{t(lang, "名称", "Name")}</span><span>{t(lang, "份额", "Shares")}</span><span>{t(lang, "成本/现价", "Cost/Price")}</span><span>{t(lang, "市值", "Value")}</span><span>{t(lang, "盈亏", "P/L")}</span><span /></div>
        {rows.map((row) => (
          <button key={row.id} type="button" className="bk-invest-trow" onClick={() => setModal({ kind: "invest", payload: row })}>
            <span className="bk-ic-name"><span className="bk-invest-badge" style={{ background: soft(row.type === "stock" ? 25 : 195), color: ink(row.type === "stock" ? 25 : 195) }}>{row.type === "stock" ? t(lang, "股", "S") : t(lang, "基", "F")}</span><span><b>{row.name}</b><span className="tiny mono"> {row.code}</span></span></span>
            <span className="mono">{row.shares.toLocaleString()}</span>
            <span className="mono tiny">{row.cost} &rarr; {row.price}</span>
            <span className="mono">{money(row.value, "CNY")}</span>
            <span className="mono" style={{ color: row.pl >= 0 ? RED : GREEN }}>{row.pl >= 0 ? "+" : ""}{money(row.pl, "CNY")}<br /><span className="tiny">{row.pct.toFixed(1)}%</span></span>
            <span role="button" tabIndex={0} className="icon-btn bk-tx-del" onClick={(event) => { event.stopPropagation(); setState((prev) => ({ ...prev, invest: prev.invest.filter((item) => item.id !== row.id), updatedAt: new Date().toISOString() })); }}><Icon name="trash" size={13} /></span>
          </button>
        ))}
      </section>
    </div>
  );
}

function RecurringView({
  state,
  lang,
  setState,
  setModal,
  addTx,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly setState: (next: BookkeepingState | ((prev: BookkeepingState) => BookkeepingState)) => void;
  readonly setModal: (modal: BookkeepingModal) => void;
  readonly addTx: (rows: readonly BookkeepingTransaction[], editId?: string) => void;
}) {
  const rules = state.recurring.filter((rule) => rule.ledger === state.activeLedger);
  const labels = { daily: [t(lang, "每天", "Daily")], weekly: [t(lang, "每周", "Weekly")], monthly: [t(lang, "每月", "Monthly")], yearly: [t(lang, "每年", "Yearly")] };
  return (
    <div className="bk-scroll">
      <div className="bk-sec-head"><span className="sec-label">{t(lang, "周期记账", "Recurring")}</span><button type="button" className="bk-textbtn" onClick={() => setModal({ kind: "recurring" })}><Icon name="plus" size={13} /> {t(lang, "新建周期", "New")}</button></div>
      <div className="bk-recur-intro tiny">{t(lang, "房租、会员、定投、工资等固定收支，设一次后可立即记入或开关。", "Fixed income and expenses with run-now and toggle controls.")}</div>
      <div className="bk-recur-list">
        {rules.map((rule) => {
          const category = categoryOf(state, rule.cat);
          const account = accountOf(state, rule.account);
          return (
            <div key={rule.id} className={`panel bk-recur-item ${rule.active ? "" : "off"}`}>
              <CatCircle cat={category} size={38} />
              <span className="grow"><b>{rule.note}</b><span className="tiny">{nameOf(account, lang)} · {labels[rule.freq][0]} · {t(lang, "下次", "Next")} {rule.nextDate.slice(5)}</span></span>
              <MoneyText amount={rule.amount} type={rule.type} currency={rule.currency} />
              <button type="button" className="bk-run-btn" onClick={() => addTx([{ id: uid("t"), ledger: rule.ledger, type: rule.type, cat: rule.cat, sub: "", amount: rule.amount, currency: rule.currency, account: rule.account, date: todayKey(), time: nowTime(), note: `${rule.note}${t(lang, "（周期）", " (recurring)")}`, tags: [], reimburse: false, private: false, recurring: true, merchant: "", location: "" }])}><Icon name="check2" size={14} /></button>
              <button type="button" className="icon-btn" onClick={() => setModal({ kind: "recurring", payload: rule })}><Icon name="edit" size={14} /></button>
              <button type="button" className={`bk-toggle ${rule.active ? "on" : ""}`} onClick={() => setState((prev) => ({ ...prev, recurring: prev.recurring.map((item) => item.id === rule.id ? { ...item, active: !item.active } : item), updatedAt: new Date().toISOString() }))}><span /></button>
              <button type="button" className="icon-btn bk-tx-del" onClick={() => setState((prev) => ({ ...prev, recurring: prev.recurring.filter((item) => item.id !== rule.id), updatedAt: new Date().toISOString() }))}><Icon name="trash" size={13} /></button>
            </div>
          );
        })}
        {rules.length === 0 ? <div className="bk-empty">{t(lang, "此账本还没有周期记账", "No recurring rules")}</div> : null}
      </div>
    </div>
  );
}

function RecordModal({
  state,
  lang,
  editTx,
  seed,
  onClose,
  onSave,
  onAddNoteTemplate,
}: {
  readonly state: BookkeepingState;
  readonly lang: BookkeepingLanguage;
  readonly editTx?: BookkeepingTransaction;
  readonly seed?: Partial<BookkeepingTransaction>;
  readonly onClose: () => void;
  readonly onSave: (rows: readonly BookkeepingTransaction[], editId?: string) => void;
  readonly onAddNoteTemplate: (catId: string, text: string) => void;
}) {
  const init = editTx ?? seed ?? {};
  const currentLedger = ledgerOf(state, init.ledger ?? state.activeLedger);
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [ledger, setLedger] = useState(init.ledger ?? state.activeLedger);
  const [type, setType] = useState<BookkeepingKind>(init.type ?? "expense");
  const [cat, setCat] = useState(init.cat ?? categoryFallbackId(state, init.type ?? "expense"));
  const [sub, setSub] = useState(init.sub ?? "");
  const [amount, setAmount] = useState(init.amount ? String(init.amount) : "0");
  const [currency, setCurrency] = useState<CurrencyCode>(init.currency ?? currentLedger.currency);
  const [account, setAccount] = useState(init.account ?? currentLedger.defaultAccount);
  const [toAccount, setToAccount] = useState(init.toAccount ?? state.accounts.find((item) => item.id !== account)?.id ?? accountFallbackId(state));
  const [date, setDate] = useState(init.date ?? todayKey());
  const [timeValue, setTimeValue] = useState(init.time ?? nowTime());
  const [note, setNote] = useState(init.note ?? "");
  const [tagsText, setTagsText] = useState((init.tags ?? []).join(", "));
  const [reimburse, setReimburse] = useState(init.reimburse ?? currentLedger.reimburse);
  const [priv, setPriv] = useState(init.private ?? currentLedger.private);
  const [recurring, setRecurring] = useState(init.recurring ?? false);
  const [merchant, setMerchant] = useState(init.merchant ?? "");
  const [location, setLocation] = useState(init.location ?? "");
  const [showMore, setShowMore] = useState(Boolean(init.merchant || init.location || init.tags?.length));
  const [aiText, setAiText] = useState("");
  const [drafts, setDrafts] = useState<readonly NaturalLanguageDraft[] | null>(null);
  const cats = categoriesByKind(state, type);
  const category = categoryOf(state, cat) ?? cats[0] ?? null;
  const ledgerMeta = ledgerOf(state, ledger);

  const switchType = (next: BookkeepingKind) => {
    setType(next);
    setCat(categoryFallbackId(state, next));
    setSub("");
  };
  const buildRow = (): BookkeepingTransaction => ({
    id: editTx?.id ?? uid("t"),
    ledger,
    type,
    cat,
    sub,
    amount: Math.abs(Number(amount)) || 0,
    currency,
    account,
    ...(type === "transfer" ? { toAccount } : {}),
    date,
    time: timeValue,
    note: note || (category ? nameOf(category, lang) : ""),
    tags: splitInput(tagsText),
    reimburse,
    private: priv,
    recurring,
    merchant,
    location,
  });
  const submit = () => {
    if (!Number(amount)) return;
    if (type === "transfer" && account === toAccount) return;
    onSave([buildRow()], editTx?.id);
    onClose();
  };
  const parseAI = () => setDrafts(parseNaturalLanguageDrafts(state, aiText));
  const confirmDrafts = () => {
    if (!drafts?.length) return;
    onSave(drafts.map((draft) => buildTxFromDraft(state, draft)));
    onClose();
  };
  const footer = mode === "manual" ? (
    <>
      <span className="bk-rec-foot-info"><b>{t(lang, TYPE_TABS.find((item) => item.id === type)?.zh ?? "支出", TYPE_TABS.find((item) => item.id === type)?.en ?? "Expense")}</b><span className="mono bk-rec-foot-amt">{money(Number(amount) || 0, currency)}</span></span>
      <span className="grow" />
      <button type="button" className="btn ghost" onClick={onClose}>{t(lang, "取消", "Cancel")}</button>
      <button type="button" className="btn primary" onClick={submit} disabled={!Number(amount) || (type === "transfer" && account === toAccount)}>{t(lang, "保存", "Save")}</button>
    </>
  ) : (
    <>
      <span className="bk-rec-foot-hint"><Icon name="sparkle" size={13} /> {t(lang, "AI 解析在本地先按规则生成草稿，后续可接 LLM。", "Local parser creates drafts; LLM hook is reserved.")}</span>
      <span className="grow" />
      <button type="button" className="btn ghost" onClick={onClose}>{t(lang, "取消", "Cancel")}</button>
    </>
  );
  return (
    <Modal title={editTx ? t(lang, "编辑账目", "Edit Record") : t(lang, "记一笔", "Add Record")} icon="plus" width={760} className="bk-record-modal" onClose={onClose} footer={footer}>
      {!editTx ? <div className="seg bk-modeseg"><button type="button" aria-selected={mode === "manual"} onClick={() => setMode("manual")}><Icon name="edit" size={13} /> {t(lang, "手动", "Manual")}</button><button type="button" aria-selected={mode === "ai"} onClick={() => setMode("ai")}><Icon name="sparkle" size={13} /> {t(lang, "AI 智能", "AI")}</button></div> : null}
      {mode === "manual" ? (
        <div className="bk-rec">
          <div className="bk-rec-left">
            <div className="bk-typeseg bk-typeseg-4">{TYPE_TABS.map((item) => <button key={item.id} type="button" className={`${type === item.id ? "on" : ""} ${item.id}`} onClick={() => switchType(item.id)}>{t(lang, item.zh, item.en)}</button>)}</div>
            <Calculator symbol={currencyOf(currency).symbol} initial={amount === "0" ? "" : amount} onChange={setAmount} onConfirm={submit} />
            <div className="bk-cur-row"><span className="bk-field-label">{t(lang, "币种", "Currency")}</span><select className="bk-input bk-cur-select" value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}>{CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.symbol} {lang === "zh" ? item.name : item.en}</option>)}</select></div>
          </div>
          <div className="bk-rec-right">
            <Field label={t(lang, "账本", "Ledger")}><select className="bk-input" value={ledger} onChange={(event) => { const next = ledgerOf(state, event.target.value); setLedger(next.id); setCurrency(next.currency); setAccount(next.defaultAccount); }}>{state.ledgers.map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)} · {item.currency}</option>)}</select></Field>
            {type === "transfer" ? (
              <div className="bk-transfer-row"><Field label={t(lang, "从账户", "From")}><select className="bk-input" value={account} onChange={(event) => setAccount(event.target.value)}>{state.accounts.map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)}</option>)}</select></Field><span className="bk-transfer-arrow"><Icon name="arrowR" size={16} /></span><Field label={t(lang, "到账户", "To")}><select className="bk-input" value={toAccount} onChange={(event) => setToAccount(event.target.value)}>{state.accounts.map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)}</option>)}</select></Field></div>
            ) : (
              <Field label={t(lang, "账户", "Account")}><select className="bk-input" value={account} onChange={(event) => setAccount(event.target.value)}>{state.accounts.map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)} · {money(item.balance, item.currency)}</option>)}</select></Field>
            )}
            <div className="bk-field-label">{t(lang, "分类", "Category")}</div>
            <div className="bk-cat-grid bk-cat-grid-scroll">{cats.map((item) => <button key={item.id} type="button" className={`bk-cat-cell ${cat === item.id ? "on" : ""}`} onClick={() => { setCat(item.id); setSub(""); }}><CatCircle cat={item} size={36} /><span>{nameOf(item, lang)}</span></button>)}</div>
            {category?.subs.length ? <><div className="bk-field-label">{t(lang, "子分类", "Sub-category")}</div><div className="bk-sub-row">{category.subs.map((item) => <button key={item} type="button" className={`bk-sub-chip ${sub === item ? "on" : ""}`} onClick={() => setSub(sub === item ? "" : item)}>{item}</button>)}</div></> : null}
            <Field label={t(lang, "备注", "Note")}><span className="bk-note-wrap"><input className="bk-input" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t(lang, "点下方模板或手动输入", "Pick a template or type")} />{note.trim() && category && !category.notes.includes(note.trim()) ? <button type="button" className="bk-note-save" onClick={() => onAddNoteTemplate(category.id, note.trim())}><Icon name="plus" size={13} /> {t(lang, "存模板", "Save")}</button> : null}</span></Field>
            {category?.notes.length ? <div className="bk-note-templates">{category.notes.map((item) => <button key={item} type="button" className={`bk-note-chip ${note === item ? "on" : ""}`} onClick={() => setNote(note === item ? "" : item)}>{item}</button>)}</div> : null}
            <div className="bk-form-grid"><Field label={t(lang, "日期", "Date")}><input className="bk-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field><Field label={t(lang, "时间", "Time")}><input className="bk-input" type="time" value={timeValue} onChange={(event) => setTimeValue(event.target.value)} /></Field></div>
            <button type="button" className="bk-more-toggle" onClick={() => setShowMore((open) => !open)}><Icon name={showMore ? "chevD" : "chevR"} size={14} /> {t(lang, "更多选项", "More")}</button>
            {showMore ? <div className="bk-more"><Field label={t(lang, "标签", "Tags")}><input className="bk-input" value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder={t(lang, "逗号分隔", "Comma separated")} /></Field><div className="bk-form-grid"><Field label={t(lang, "商家", "Merchant")}><input className="bk-input" value={merchant} onChange={(event) => setMerchant(event.target.value)} /></Field><Field label={t(lang, "地点", "Location")}><input className="bk-input" value={location} onChange={(event) => setLocation(event.target.value)} /></Field></div><div className="bk-flags"><Toggle on={reimburse} onChange={setReimburse} label={t(lang, "需要报销", "Reimbursable")} /><Toggle on={priv} onChange={setPriv} label={t(lang, "私密账单", "Private")} /><Toggle on={recurring} onChange={setRecurring} label={t(lang, "周期账单", "Recurring")} /></div></div> : null}
          </div>
        </div>
      ) : (
        <div className="bk-ai-mode">
          <div className="bk-ai-hint"><Icon name="sparkle" size={14} />{t(lang, "用自然语言描述，可一次多笔，用「、」或「/」分隔。", "Describe naturally; split multiple records with / or commas.")}</div>
          <textarea className="bk-ai-input" value={aiText} rows={3} placeholder={t(lang, "例：午饭 35 微信、打车 18 支付宝、发工资 12000 招行", "e.g. lunch 35, taxi 18, salary 12000")} onChange={(event) => setAiText(event.target.value)} />
          <div className="bk-ai-examples">{(lang === "zh" ? ["早咖啡 32 微信", "超市 128、水果 26", "房租 2600 招行", "卖出基金到账 800"] : ["coffee 32", "groceries 128", "rent 2600", "salary 12000"]).map((item) => <button key={item} type="button" className="bk-sub-chip" onClick={() => setAiText(item)}>{item}</button>)}</div>
          <button type="button" className="btn primary bk-full" onClick={parseAI} disabled={!aiText.trim()}><Icon name="sparkle" size={15} /> {t(lang, "AI 识别", "Parse")}</button>
          {drafts ? <div className="bk-draft-wrap"><div className="bk-draft-head">{t(lang, `识别到 ${drafts.length} 笔，确认后入账`, `${drafts.length} parsed`)}</div>{drafts.map((draft, index) => { const draftCat = categoryOf(state, draft.cat); return <div key={index} className="bk-draft-row"><CatCircle cat={draftCat} size={32} /><span className="grow"><b>{nameOf(draftCat, lang)}</b><span className="tiny">{draft.note}</span></span><span className="mono">{draft.type === "income" ? "+" : "-"}{money(draft.amount, ledgerMeta.currency)}</span></div>; })}<button type="button" className="btn primary bk-full" onClick={confirmDrafts} disabled={!drafts.length}><Icon name="check2" size={15} /> {t(lang, "全部入账", "Add all")}</button></div> : null}
        </div>
      )}
    </Modal>
  );
}

function LedgerModal({ state, lang, ledger, onClose, onSave, onDelete }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage; readonly ledger?: BookkeepingLedger; readonly onClose: () => void; readonly onSave: (ledger: BookkeepingLedger) => void; readonly onDelete: (id: string) => void }) {
  const [name, setName] = useState(ledger?.name ?? "");
  const [icon, setIcon] = useState(ledger?.icon ?? "wallet");
  const [hue, setHue] = useState(ledger?.hue ?? 150);
  const [currency, setCurrency] = useState<CurrencyCode>(ledger?.currency ?? "CNY");
  const [defaultAccount, setDefaultAccount] = useState(ledger?.defaultAccount ?? accountFallbackId(state));
  const [priv, setPriv] = useState(ledger?.private ?? false);
  const [reimburse, setReimburse] = useState(ledger?.reimburse ?? false);
  const [desc, setDesc] = useState(ledger?.desc ?? "");
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ id: ledger?.id ?? uid("lg"), name: trimmed, en: ledger?.en ?? trimmed, icon, hue, currency, defaultAccount, private: priv, reimburse, desc: desc.trim() });
    onClose();
  };
  return (
    <Modal title={ledger ? t(lang, "编辑账本", "Edit Ledger") : t(lang, "新建账本", "New Ledger")} icon="wallet" width={520} onClose={onClose} footer={<><>{ledger && state.ledgers.length > 1 ? <button type="button" className="bk-del-link" onClick={() => { onDelete(ledger.id); onClose(); }}><Icon name="trash" size={13} /> {t(lang, "删除", "Delete")}</button> : null}</><span className="grow" /><button type="button" className="btn ghost" onClick={onClose}>{t(lang, "取消", "Cancel")}</button><button type="button" className="btn primary" onClick={submit} disabled={!name.trim()}>{t(lang, "保存", "Save")}</button></>}>
      <div className="bk-led-preview" style={{ background: soft(hue) }}><span className="bk-led-ico" style={{ background: ink(hue), color: "#fff" }}><Icon name={icon} size={22} /></span><span><b>{name || t(lang, "账本名称", "Ledger name")}</b><span className="tiny">{currency}{reimburse ? t(lang, " · 报销账本", " · reimburse") : ""}{priv ? t(lang, " · 私密", " · private") : ""}</span></span></div>
      <Field label={t(lang, "账本名称", "Name")}><input className="bk-input" autoFocus value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <div className="bk-form-grid"><Field label={t(lang, "默认币种", "Currency")}><select className="bk-input" value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}>{CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.code} {item.symbol}</option>)}</select></Field><Field label={t(lang, "默认账户", "Default account")}><select className="bk-input" value={defaultAccount} onChange={(event) => setDefaultAccount(event.target.value)}>{state.accounts.map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)}</option>)}</select></Field></div>
      <Picker label={t(lang, "图标", "Icon")} values={ICON_OPTIONS} selected={icon} render={(item) => <Icon name={item} size={17} />} onChange={setIcon} />
      <HuePicker hue={hue} setHue={setHue} />
      <div className="bk-flags"><Toggle on={priv} onChange={setPriv} label={t(lang, "私密账本", "Private")} /><Toggle on={reimburse} onChange={setReimburse} label={t(lang, "用于报销", "For reimbursement")} /></div>
      <Field label={t(lang, "说明", "Description")}><input className="bk-input" value={desc} onChange={(event) => setDesc(event.target.value)} /></Field>
    </Modal>
  );
}

function AccountModal({ state, lang, account, onClose, onSave, onDelete }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage; readonly account?: BookkeepingAccount; readonly onClose: () => void; readonly onSave: (account: BookkeepingAccount) => void; readonly onDelete: (id: string) => void }) {
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState(account?.type ?? "cash");
  const [currency, setCurrency] = useState<CurrencyCode>(account?.currency ?? "CNY");
  const [initial, setInitial] = useState(String(account?.initial ?? account?.balance ?? 0));
  const [balance, setBalance] = useState(String(account?.balance ?? 0));
  const [isDefault, setIsDefault] = useState(account?.isDefault ?? false);
  const [limit, setLimit] = useState(String(account?.limit ?? ""));
  const [billDay, setBillDay] = useState(String(account?.billDay ?? ""));
  const [repayDay, setRepayDay] = useState(String(account?.repayDay ?? ""));
  const meta = accountTypeOf(type);
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ id: account?.id ?? uid("a"), name: trimmed, en: account?.en ?? trimmed, type, currency, initial: Number(initial) || 0, balance: Number(balance) || 0, isDefault, icon: meta.icon, hue: meta.hue, ...(type === "credit" ? { limit: Number(limit) || 0, billDay: Number(billDay) || 1, repayDay: Number(repayDay) || 1 } : {}) });
    onClose();
  };
  return (
    <Modal title={account ? t(lang, "编辑账户", "Edit Account") : t(lang, "新建账户", "New Account")} icon="bank" width={500} onClose={onClose} footer={<>{account && state.accounts.length > 1 ? <button type="button" className="bk-del-link" onClick={() => { onDelete(account.id); onClose(); }}><Icon name="trash" size={13} /> {t(lang, "删除", "Delete")}</button> : null}<span className="grow" /><button type="button" className="btn ghost" onClick={onClose}>{t(lang, "取消", "Cancel")}</button><button type="button" className="btn primary" onClick={submit} disabled={!name.trim()}>{t(lang, "保存", "Save")}</button></>}>
      <Field label={t(lang, "账户名称", "Name")}><input className="bk-input" autoFocus value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <div className="bk-field-label">{t(lang, "账户类型", "Type")}</div>
      <div className="bk-accttype-grid">{ACCOUNT_TYPES.map((item) => <button key={item.id} type="button" className={`bk-accttype-cell ${type === item.id ? "on" : ""}`} onClick={() => setType(item.id)}><span className="bk-acct-ico" style={{ background: soft(item.hue), color: ink(item.hue) }}><Icon name={item.icon} size={15} /></span>{t(lang, item.zh, item.en)}</button>)}</div>
      <div className="bk-form-grid"><Field label={t(lang, "币种", "Currency")}><select className="bk-input" value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}>{CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.code} {item.symbol}</option>)}</select></Field><Field label={t(lang, "当前余额", "Current balance")}><input className="bk-input mono" value={balance} onChange={onNumberInput(setBalance)} /></Field></div>
      <Field label={t(lang, "初始余额", "Initial balance")}><input className="bk-input mono" value={initial} onChange={onNumberInput(setInitial)} /></Field>
      {type === "credit" ? <div className="bk-form-grid bk-form-grid-3"><Field label={t(lang, "额度", "Limit")}><input className="bk-input mono" value={limit} onChange={onNumberInput(setLimit)} /></Field><Field label={t(lang, "出账日", "Bill day")}><input className="bk-input mono" value={billDay} onChange={onNumberInput(setBillDay)} /></Field><Field label={t(lang, "还款日", "Due day")}><input className="bk-input mono" value={repayDay} onChange={onNumberInput(setRepayDay)} /></Field></div> : null}
      <Toggle on={isDefault} onChange={setIsDefault} label={t(lang, "设为默认账户", "Set as default")} />
    </Modal>
  );
}

function CategoryModal({ state, lang, onClose, onSave }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage; readonly onClose: () => void; readonly onSave: (patch: Pick<BookkeepingState, "expense" | "income" | "transfer" | "prepay">) => void }) {
  const [kind, setKind] = useState<BookkeepingKind>("expense");
  const [data, setData] = useState(() => ({ expense: [...state.expense], income: [...state.income], transfer: [...state.transfer], prepay: [...state.prepay] }));
  const list = [...data[kind]].sort((a, b) => a.order - b.order);
  const [selectedId, setSelectedId] = useState(list[0]?.id ?? "");
  const current = list.find((item) => item.id === selectedId) ?? list[0];
  const updateList = (next: readonly BookkeepingCategory[]) => setData((prev) => ({ ...prev, [kind]: next }));
  const update = (patch: Partial<BookkeepingCategory>) => {
    if (!current) return;
    updateList(data[kind].map((item) => item.id === current.id ? { ...item, ...patch } : item));
  };
  const addCategory = () => {
    const id = uid("c");
    const next: BookkeepingCategory = { id, kind, name: t(lang, "新分类", "New"), en: "New", icon: "tag", hue: 150, budget: kind === "expense" ? 300 : 0, order: data[kind].length, subs: [], notes: [] };
    updateList([...data[kind], next]);
    setSelectedId(id);
  };
  const delCategory = () => {
    if (!current || list.length <= 1) return;
    const next = data[kind].filter((item) => item.id !== current.id);
    updateList(next);
    setSelectedId(next[0]?.id ?? "");
  };
  const submit = () => {
    onSave(data);
    onClose();
  };
  return (
    <Modal title={t(lang, "分类与备注管理", "Categories & Notes")} icon="grid4" width={700} onClose={onClose} footer={<><button type="button" className="btn ghost" onClick={onClose}>{t(lang, "取消", "Cancel")}</button><button type="button" className="btn primary" onClick={submit}>{t(lang, "保存全部", "Save all")}</button></>}>
      <div className="seg bk-modeseg bk-kindseg">{TYPE_TABS.map((item) => <button key={item.id} type="button" aria-selected={kind === item.id} onClick={() => { setKind(item.id); setSelectedId(data[item.id][0]?.id ?? ""); }}>{t(lang, item.zh, item.en)}</button>)}</div>
      <div className="bk-cated">
        <div className="bk-cated-list">{list.map((item) => <button key={item.id} type="button" className={`bk-ca10-row ${current?.id === item.id ? "on" : ""}`} onClick={() => setSelectedId(item.id)}><CatCircle cat={item} size={26} /><span className="grow">{nameOf(item, lang)}</span></button>)}<button type="button" className="bk-ca10-add" onClick={addCategory}><Icon name="plus" size={14} /> {t(lang, "新建分类", "New")}</button></div>
        {current ? <div className="bk-cated-edit"><Field label={t(lang, "名称", "Name")}><input className="bk-input" value={lang === "zh" ? current.name : current.en} onChange={(event) => update(lang === "zh" ? { name: event.target.value } : { en: event.target.value })} /></Field>{kind === "expense" ? <Field label={t(lang, "月预算（0 = 不限）", "Budget (0 = none)")}><input className="bk-input mono" value={current.budget} onChange={(event) => update({ budget: Number(event.target.value) || 0 })} /></Field> : null}<Picker label={t(lang, "图标", "Icon")} values={ICON_OPTIONS} selected={current.icon} render={(item) => <Icon name={item} size={17} />} onChange={(next) => update({ icon: next })} /><HuePicker hue={current.hue} setHue={(next) => update({ hue: next })} /><Field label={t(lang, "子分类（逗号分隔）", "Sub-categories")}><input className="bk-input" value={current.subs.join(", ")} onChange={(event) => update({ subs: splitInput(event.target.value) })} /></Field><Field label={t(lang, "常用备注模板（逗号分隔）", "Note templates")}><input className="bk-input" value={current.notes.join(", ")} onChange={(event) => update({ notes: splitInput(event.target.value) })} /></Field>{list.length > 1 ? <button type="button" className="bk-del-link" onClick={delCategory}><Icon name="trash" size={13} /> {t(lang, "删除此分类", "Delete category")}</button> : null}</div> : null}
      </div>
    </Modal>
  );
}

function Picker<T extends string>({ label, values, selected, render, onChange }: { readonly label: string; readonly values: readonly T[]; readonly selected: string; readonly render: (item: T) => ReactNode; readonly onChange: (item: T) => void }) {
  return <><div className="bk-field-label">{label}</div><div className="bk-icon-pick">{values.map((item) => <button key={item} type="button" className={`bk-icon-cell ${selected === item ? "on" : ""}`} onClick={() => onChange(item)}>{render(item)}</button>)}</div></>;
}

function HuePicker({ hue, setHue }: { readonly hue: number; readonly setHue: (hue: number) => void }) {
  return <><div className="bk-field-label">{t("zh", "颜色", "Color")}</div><div className="bk-hue-pick">{HUE_OPTIONS.map((item) => <button key={item} type="button" className={`bk-hue-cell ${hue === item ? "on" : ""}`} style={{ background: ink(item) }} onClick={() => setHue(item)} />)}</div></>;
}

function RecurringModal({ state, lang, rule, onClose, onSave }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage; readonly rule?: BookkeepingRecurringRule; readonly onClose: () => void; readonly onSave: (rule: BookkeepingRecurringRule) => void }) {
  const ledger = ledgerOf(state);
  const [type, setType] = useState<Exclude<BookkeepingKind, "transfer">>(rule?.type ?? "expense");
  const [cat, setCat] = useState(rule?.cat ?? categoryFallbackId(state, "expense"));
  const [amount, setAmount] = useState(String(rule?.amount ?? ""));
  const [currency, setCurrency] = useState<CurrencyCode>(rule?.currency ?? ledger.currency);
  const [account, setAccount] = useState(rule?.account ?? ledger.defaultAccount);
  const [note, setNote] = useState(rule?.note ?? "");
  const [freq, setFreq] = useState(rule?.freq ?? "monthly");
  const [day, setDay] = useState(String(rule?.day ?? 1));
  const submit = () => {
    const value = Math.abs(Number(amount)) || 0;
    if (!value) return;
    onSave({ id: rule?.id ?? uid("r"), ledger: state.activeLedger, type, cat, amount: value, currency, account, note: note || nameOf(categoryOf(state, cat), lang), freq, day: Number(day) || 1, nextDate: rule?.nextDate ?? todayKey(), active: rule?.active ?? true });
    onClose();
  };
  return (
    <Modal title={rule ? t(lang, "编辑周期", "Edit Recurring") : t(lang, "新建周期记账", "New Recurring")} icon="repeat" width={460} onClose={onClose} footer={<><button type="button" className="btn ghost" onClick={onClose}>{t(lang, "取消", "Cancel")}</button><button type="button" className="btn primary" onClick={submit}>{t(lang, "保存", "Save")}</button></>}>
      <div className="bk-typeseg">{(["expense", "income", "prepay"] as const).map((item) => <button key={item} type="button" className={type === item ? "on" : ""} onClick={() => { setType(item); setCat(categoryFallbackId(state, item)); }}>{TYPE_TABS.find((tab) => tab.id === item)?.[lang === "zh" ? "zh" : "en"]}</button>)}</div>
      <div className="bk-form-grid"><Field label={t(lang, "金额", "Amount")}><input className="bk-input mono" value={amount} onChange={onNumberInput(setAmount)} /></Field><Field label={t(lang, "币种", "Currency")}><select className="bk-input" value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}>{CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}</select></Field><Field label={t(lang, "分类", "Category")}><select className="bk-input" value={cat} onChange={(event) => setCat(event.target.value)}>{categoriesByKind(state, type).map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)}</option>)}</select></Field><Field label={t(lang, "账户", "Account")}><select className="bk-input" value={account} onChange={(event) => setAccount(event.target.value)}>{state.accounts.map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)}</option>)}</select></Field><Field label={t(lang, "频率", "Frequency")}><select className="bk-input" value={freq} onChange={(event) => setFreq(event.target.value as BookkeepingRecurringRule["freq"])}><option value="daily">{t(lang, "每天", "Daily")}</option><option value="weekly">{t(lang, "每周", "Weekly")}</option><option value="monthly">{t(lang, "每月", "Monthly")}</option><option value="yearly">{t(lang, "每年", "Yearly")}</option></select></Field><Field label={t(lang, "每月几号", "Day")}><input className="bk-input mono" value={day} onChange={onNumberInput(setDay)} /></Field></div>
      <Field label={t(lang, "备注", "Note")}><input className="bk-input" value={note} onChange={(event) => setNote(event.target.value)} /></Field>
    </Modal>
  );
}

function InvestmentModal({ state, lang, holding, onClose, onSave }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage; readonly holding?: BookkeepingInvestment; readonly onClose: () => void; readonly onSave: (holding: BookkeepingInvestment) => void }) {
  const [name, setName] = useState(holding?.name ?? "");
  const [code, setCode] = useState(holding?.code ?? "");
  const [type, setType] = useState<"stock" | "fund">(holding?.type ?? "stock");
  const [shares, setShares] = useState(String(holding?.shares ?? ""));
  const [cost, setCost] = useState(String(holding?.cost ?? ""));
  const [price, setPrice] = useState(String(holding?.price ?? ""));
  const [account, setAccount] = useState(holding?.account ?? accountFallbackId(state));
  const submit = () => {
    if (!name.trim() || !Number(shares)) return;
    onSave({ id: holding?.id ?? uid("i"), name: name.trim(), code: code.trim(), type, shares: Number(shares) || 0, cost: Number(cost) || 0, price: Number(price) || 0, account });
    onClose();
  };
  return (
    <Modal title={holding ? t(lang, "编辑持仓", "Edit Holding") : t(lang, "新增持仓", "Add Holding")} icon="trendUp" width={460} onClose={onClose} footer={<><button type="button" className="btn ghost" onClick={onClose}>{t(lang, "取消", "Cancel")}</button><button type="button" className="btn primary" onClick={submit}>{t(lang, "保存", "Save")}</button></>}>
      <div className="bk-typeseg"><button type="button" className={type === "stock" ? "on" : ""} onClick={() => setType("stock")}>{t(lang, "股票", "Stock")}</button><button type="button" className={type === "fund" ? "on" : ""} onClick={() => setType("fund")}>{t(lang, "基金", "Fund")}</button></div>
      <div className="bk-form-grid"><Field label={t(lang, "名称", "Name")}><input className="bk-input" value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label={t(lang, "代码", "Code")}><input className="bk-input mono" value={code} onChange={(event) => setCode(event.target.value)} /></Field><Field label={t(lang, "持有份额", "Shares")}><input className="bk-input mono" value={shares} onChange={onNumberInput(setShares)} /></Field><Field label={t(lang, "账户", "Account")}><select className="bk-input" value={account} onChange={(event) => setAccount(event.target.value)}>{state.accounts.map((item) => <option key={item.id} value={item.id}>{nameOf(item, lang)}</option>)}</select></Field><Field label={t(lang, "成本价", "Cost")}><input className="bk-input mono" value={cost} onChange={onNumberInput(setCost)} /></Field><Field label={t(lang, "现价", "Price")}><input className="bk-input mono" value={price} onChange={onNumberInput(setPrice)} /></Field></div>
    </Modal>
  );
}

function ImportExportModal({ state, lang, onClose, onImport }: { readonly state: BookkeepingState; readonly lang: BookkeepingLanguage; readonly onClose: () => void; readonly onImport: (rows: readonly BookkeepingTransaction[]) => void }) {
  const [tab, setTab] = useState<"export" | "import">("export");
  const [report, setReport] = useState<readonly BookkeepingTransaction[] | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const rows = ledgerTransactions(state);
  const exportCsv = () => {
    const header = ["date", "time", "type", "category", "sub", "amount", "currency", "account", "note", "tags", "merchant", "ledger"];
    const body = rows.map((tx) => [tx.date, tx.time, tx.type, categoryOf(state, tx.cat)?.name ?? tx.cat, tx.sub, tx.amount, tx.currency, accountOf(state, tx.account)?.name ?? tx.account, tx.note.replace(/,/g, "，"), tx.tags.join("|"), tx.merchant, tx.ledger]);
    const blob = new Blob([`\ufeff${[header, ...body].map((row) => row.join(",")).join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bookkeeping_${state.activeLedger}_${todayKey()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const readFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result ?? "").replace(/^\ufeff/, "").split(/\r?\n/).filter(Boolean).slice(1);
      const ledger = ledgerOf(state);
      const parsed = lines.map((line) => {
        const parts = line.split(",");
        const type = (["income", "transfer", "prepay"].includes(parts[2] ?? "") ? parts[2] : "expense") as BookkeepingKind;
        const category = [...state.expense, ...state.income, ...state.transfer, ...state.prepay].find((item) => item.name === parts[3] || item.id === parts[3]);
        const account = state.accounts.find((item) => item.name === parts[7] || item.id === parts[7]);
        return { id: uid("t"), ledger: state.activeLedger, type, cat: category?.id ?? categoryFallbackId(state, type), sub: parts[4] ?? "", amount: Math.abs(Number(parts[5])) || 0, currency: (parts[6] as CurrencyCode | undefined) || ledger.currency, account: account?.id ?? ledger.defaultAccount, date: parts[0] || todayKey(), time: parts[1] || "12:00", note: parts[8] ?? "", tags: parts[9] ? parts[9].split("|").filter(Boolean) : [], reimburse: false, private: false, merchant: parts[10] ?? "", location: "" } satisfies BookkeepingTransaction;
      }).filter((tx) => tx.amount > 0);
      setReport(parsed);
    };
    reader.readAsText(file);
  };
  return (
    <Modal title={t(lang, "导入 / 导出", "Import / Export")} icon="download" width={480} onClose={onClose}>
      <div className="seg bk-modeseg"><button type="button" aria-selected={tab === "export"} onClick={() => setTab("export")}>{t(lang, "导出", "Export")}</button><button type="button" aria-selected={tab === "import"} onClick={() => setTab("import")}>{t(lang, "导入", "Import")}</button></div>
      {tab === "export" ? <div><div className="bk-ai-hint"><Icon name="download" size={14} />{t(lang, `将当前账本 ${rows.length} 笔流水导出为 CSV。`, `Export ${rows.length} records as CSV.`)}</div><div className="bk-export-card"><Icon name="doc" size={26} /><span className="grow"><b>CSV</b><span className="tiny">date · time · type · category · amount · currency · note</span></span><button type="button" className="btn primary" onClick={exportCsv}><Icon name="download" size={14} /> {t(lang, "导出", "Export")}</button></div></div> : <div><div className="bk-ai-hint"><Icon name="trendUp" size={14} />{t(lang, "支持微信、支付宝及通用 CSV 导入到当前账本。", "Import CSV into current ledger.")}</div><button type="button" className="bk-drop" onClick={() => fileRef.current?.click()}><Icon name="download" size={22} /><span>{t(lang, "点击选择 CSV 文件", "Choose CSV file")}</span><span className="tiny">date,time,type,category,sub,amount,currency,account,note</span></button><input ref={fileRef} type="file" accept=".csv,text/csv" className="bk-hidden-file" onChange={readFile} />{report ? <div className="bk-draft-wrap"><div className="bk-draft-head">{t(lang, `解析到 ${report.length} 笔`, `${report.length} parsed`)}</div>{report.slice(0, 4).map((tx) => <div key={tx.id} className="bk-draft-row"><CatCircle cat={categoryOf(state, tx.cat)} size={30} /><span className="grow">{tx.note}</span><MoneyText amount={tx.amount} type={tx.type} currency={tx.currency} /></div>)}<button type="button" className="btn primary bk-full" onClick={() => { onImport(report); onClose(); }}>{t(lang, "确认导入", "Import")}</button></div> : null}</div>}
    </Modal>
  );
}

export function BookkeepingModule({ lang }: BookkeepingModuleProps) {
  const [state, setState] = useBookkeepingState();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [modal, setModal] = useState<BookkeepingModal>(null);
  const addTx = useCallback((rows: readonly BookkeepingTransaction[], editId?: string) => setState((prev) => upsertTransactions(prev, rows, editId)), [setState]);
  const openTx = (tx: BookkeepingTransaction) => setModal({ kind: "record", payload: tx });
  const removeTx = (id: string) => setState((prev) => deleteTransaction(prev, id));
  const addNoteTemplate = (catId: string, text: string) => {
    const updateList = (list: readonly BookkeepingCategory[]) => list.map((category) => category.id === catId ? { ...category, notes: [...new Set([...category.notes, text])] } : category);
    setState((prev) => saveCategorySets(prev, { expense: updateList(prev.expense), income: updateList(prev.income), transfer: updateList(prev.transfer), prepay: updateList(prev.prepay) }));
  };
  return (
    <div className="module module-bk" data-testid="bookkeeping-module">
      <Sidebar state={state} lang={lang} setState={setState} setModal={setModal} />
      <main className="bk-main">
        <Header lang={lang} state={state} activeTab={tab} setModal={setModal} setState={setState} />
        <nav className="bk-tabs">
          {TABS.map((item) => <button key={item.id} type="button" className={`bk-tab ${tab === item.id ? "on" : ""}`} onClick={() => setTab(item.id)}><Icon name={item.icon} size={15} /> {t(lang, item.zh, item.en)}</button>)}
        </nav>
        <div className="bk-content">
          {tab === "dashboard" ? <DashboardView state={state} lang={lang} setState={setState} setModal={setModal} openTx={openTx} deleteTx={removeTx} /> : null}
          {tab === "calendar" ? <CalendarView state={state} lang={lang} setState={setState} openTx={openTx} deleteTx={removeTx} openRecord={(payload) => setModal({ kind: "record", payload })} /> : null}
          {tab === "bills" ? <BillsView state={state} lang={lang} openTx={openTx} deleteTx={removeTx} openRecord={(payload) => setModal({ kind: "record", payload })} /> : null}
          {tab === "insight" ? <InsightView state={state} lang={lang} /> : null}
          {tab === "budget" ? <BudgetView state={state} lang={lang} setState={setState} setModal={setModal} /> : null}
          {tab === "assets" ? <AssetsView state={state} lang={lang} setModal={setModal} /> : null}
          {tab === "invest" ? <InvestView state={state} lang={lang} setState={setState} setModal={setModal} /> : null}
          {tab === "recurring" ? <RecurringView state={state} lang={lang} setState={setState} setModal={setModal} addTx={addTx} /> : null}
        </div>
      </main>
      {modal?.kind === "record" ? <RecordModal state={state} lang={lang} editTx={modal.payload?.id ? modal.payload as BookkeepingTransaction : undefined} seed={modal.payload?.id ? undefined : modal.payload} onClose={() => setModal(null)} onSave={addTx} onAddNoteTemplate={addNoteTemplate} /> : null}
      {modal?.kind === "ledger" ? <LedgerModal state={state} lang={lang} ledger={modal.payload} onClose={() => setModal(null)} onSave={(ledger) => setState((prev) => saveLedger(prev, ledger))} onDelete={(id) => setState((prev) => deleteLedger(prev, id))} /> : null}
      {modal?.kind === "account" ? <AccountModal state={state} lang={lang} account={modal.payload} onClose={() => setModal(null)} onSave={(account) => setState((prev) => saveAccount(prev, account))} onDelete={(id) => setState((prev) => deleteAccount(prev, id))} /> : null}
      {modal?.kind === "categories" ? <CategoryModal state={state} lang={lang} onClose={() => setModal(null)} onSave={(patch) => setState((prev) => saveCategorySets(prev, patch))} /> : null}
      {modal?.kind === "recurring" ? <RecurringModal state={state} lang={lang} rule={modal.payload} onClose={() => setModal(null)} onSave={(rule) => setState((prev) => ({ ...prev, recurring: prev.recurring.some((item) => item.id === rule.id) ? prev.recurring.map((item) => item.id === rule.id ? rule : item) : [...prev.recurring, rule], updatedAt: new Date().toISOString() }))} /> : null}
      {modal?.kind === "invest" ? <InvestmentModal state={state} lang={lang} holding={modal.payload} onClose={() => setModal(null)} onSave={(holding) => setState((prev) => ({ ...prev, invest: prev.invest.some((item) => item.id === holding.id) ? prev.invest.map((item) => item.id === holding.id ? holding : item) : [...prev.invest, holding], updatedAt: new Date().toISOString() }))} /> : null}
      {modal?.kind === "import-export" ? <ImportExportModal state={state} lang={lang} onClose={() => setModal(null)} onImport={(rows) => addTx(rows)} /> : null}
    </div>
  );
}
