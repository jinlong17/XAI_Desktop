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

## REL-05 write outcomes and recoverable drafts

`writeBookkeepingState(state, capturedScope?)` / `BookkeepingStorageAdapter.write` now return `BookkeepingWriteResult`: `{ canonicalCommitted: true, devicePreferences: "complete" | "partial", failedDeviceKeys: readonly string[] }`. Canonical serialization/storage failure throws before any device mirror or commit event. Once canonical storage succeeds, each of the four device preferences is attempted and partial failures are explicitly reported. This is not an atomic multi-key transaction. `reset` throws a partial-outcome message if the records were reset but device mirrors failed.

The internal `useBookkeepingState` tuple retains committed state at index 0, returns a boolean setter at index 1, and adds recovery controls at index 2. A failed proposal is held separately as a pending snapshot. Further edits pause until retry/export/discard so the only pending draft cannot be replaced. Retry reuses that exact snapshot; an already-committed canonical record is not rewritten when retrying device mirrors. A changed canonical baseline or captured account rejects the retry. Draft JSON export is bound to that same captured account and explicitly identifies whether canonical records already committed.

Record, ledger, account, category, recurring, investment and CSV editor callbacks close only after full success. Budget blur keeps the entered input on failure. Error recovery offers same-account retry, explicit draft download, and discard (or “Keep saved records” for a partial device failure). Drafts remain in current component memory: keep the page open or export them before leaving. This is not a guarantee of recovery after browser close, refresh, or module unmount.
