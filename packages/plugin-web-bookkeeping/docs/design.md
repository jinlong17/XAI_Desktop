# Bookkeeping Design

Source: `/Users/lijinlong/Desktop/AI_Desktop/web design/记账模块-需求与设计.md` plus Cloud Design source files listed there: `module-bookkeeping.jsx`, `bk-data.js`, `bk-record.jsx`, `bk-dashboard.jsx`, `bk-calendar.jsx`, `bk-insight.jsx`, `bk-tabs.jsx`, `bk-modals.jsx`, `bk-calc.jsx`, `bk.css`.

This implementation ports the Cloud Design bookkeeping module into the Web Console as a formal rail module at `/app/bookkeeping`.

## Ported Surfaces

- Left sidebar with net worth, ledgers, accounts, category entry, recurring rules, investments, and import/export.
- Header ledger switcher, import/export action, and primary "记一笔" action.
- Eight tabs: 总看板, 日历, 明细, 统计, 预算, 资产, 投资, 周期.
- Record modal with expense, income, transfer, and prepay modes.
- Calculator-style amount keypad with keyboard support.
- Ledger, account, category/note, recurring rule, investment, and import/export modals.
- Dashboard quick-entry, recent bills, cashflow, budget, assets, recurring, and investment cards.
- Calendar month/year views with per-day income and expense.
- Bills detail and overview modes with search and type filter.
- Insight charts for trend, category split, income/expense ratio, and category drill-down.
- Budget, assets, investment, and recurring management views.

## Adaptations

- Cloud Design storage keys are preserved: `xai_bk_state_v2`, `xai_bk_dash_order`, `xai_bk_dash_split`, `xai_bk_view`, and `xai_bk_calendar_mode`.
- The implementation lives in package `@repo/plugin-web-bookkeeping` instead of a standalone demo file, following the Web module registration pattern used by other Web modules.
- Sync is represented by a storage adapter contract with `syncStatus: "device-local"`. No account cloud-sync entity writes are claimed in this release.
- Charts are implemented with CSS/SVG primitives so the package remains self-contained and aligned with the current Web shell dependency shape.

## Non-Goals

- No backend account-sync push/pull implementation in this package.
- No server-side exchange-rate feed; Cloud Design static rates are used.
- No production payment, tax, bank-import, or brokerage API integration.
- No Desktop/App promotion in this branch; any Web to App movement must pass the D3 gate.
