# Bookkeeping API

Package: `@repo/plugin-web-bookkeeping`

## Public Exports

- `bookkeepingWebModuleRegistration`
- `BookkeepingModule`
- storage helpers: `readBookkeepingState`, `writeBookkeepingState`, `localBookkeepingStorageAdapter`
- seed/default helpers: `createSeedBookkeepingState`
- analytics helpers: `ledgerTransactions`, `totalsForTransactions`, `categoryTotals`, `calendarDayTotals`, `dayGroups`, `parseNaturalLanguageDrafts`
- state helpers: `upsertTransactions`, `deleteTransaction`, `saveLedger`, `saveAccount`, `saveCategorySets`, `txInLedgerCurrency`
- public types: `BookkeepingState`, `BookkeepingLedger`, `BookkeepingAccount`, `BookkeepingCategory`, `BookkeepingTransaction`, `BookkeepingRecurringRule`, `BookkeepingInvestment`

## Storage Keys

- `xai_bk_state_v2` — canonical bookkeeping state.
- `xai_bk_dash_order` — dashboard card order preference.
- `xai_bk_dash_split` — dashboard split preference.
- `xai_bk_view` — bills view preference.
- `xai_bk_calendar_mode` — calendar month/year preference.

## Data Model

The canonical state stores:

- ledgers
- accounts
- expense categories
- income categories
- transfer categories
- prepay categories
- transactions
- recurring rules
- investment holdings
- budget total
- user preferences

Transactions support `expense`, `income`, `transfer`, and `prepay`. Balance effects are applied by `upsertTransactions` and reversed by `deleteTransaction`.

## Sync Scope

Current adapter: `localStorage`, `syncStatus: "device-local"`.

The package does not write account-sync entities and does not unpause the sync line. Future cloud sync should replace or wrap `BookkeepingStorageAdapter` with an encrypted account-sync driver while preserving `BookkeepingState` versioning.
