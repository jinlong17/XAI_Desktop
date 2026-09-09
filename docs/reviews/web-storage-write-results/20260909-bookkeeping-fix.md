# REL-05 Bookkeeping owner fix

Diagnosis source: `aff8175`; original probe files are unmodified. Product owner: `plugin-web-bookkeeping`, module web. No shared storage, Tasks, Settings, auth or host implementation is changed in this owner patch.

The canonical `writeString` no longer catches and discards errors. `writeBookkeepingState` only proceeds to four device mirrors and a committed-state event after canonical storage succeeds. Each mirror can fail independently; the explicit result reports canonical success and the failed mirror keys. No multi-key atomicity is claimed.

The hook's original first tuple value remains committed state. Rejected proposals live in a separate pending snapshot with captured account and pre-write canonical baseline. Recovery rejects changed-account handlers and changed canonical bytes. A pending proposal cannot be replaced by additional edits. Partial-device retry writes preferences only, while full retry uses the same snapshot rather than re-running transaction creation/balance mutation. A recovery panel offers retry, draft download and explicit discard/keep-committed choice; editing pauses with inert while the original modal stays mounted.

All editor close-after-save/delete paths are conditional: records, ledgers, accounts, category sets, recurring rules, investment holdings and CSV import. Budget blur preserves the input on failure. Direct inline updates/deletes use the same boolean setter and retain their proposed state centrally.

Verification commands:

- `pnpm --filter @repo/plugin-web-bookkeeping test`
- `pnpm --filter @repo/plugin-web-bookkeeping check-types`
- `pnpm --filter @repo/plugin-web-bookkeeping lint`
- `node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-storage-write-results/independent-write-failure.config.mjs`
- `node docs/reviews/web-storage-write-results/verify-native-write-failure.mjs`

The unchanged component probe reports Bookkeeping `persistedBudget:100, renderedBudget:100, deviceView:"detail"`; unchanged native Chrome probe returns `pass:true`, preserves B and also observes the parallel Tasks draft correction. These are implementation-agent reruns, not the requested independent acceptance.

Limits: current-mount in-memory drafts with export, not close/reload persistence (REL-09); conservative baseline check, not entity transactions/cross-tab merges (REL-08); existing malformed-state normalization remains separate (REL-07/11). A device partial result means records are already stored and must never be described as fully rolled back.

Final owner checks: **21 tests PASS** (13 new fault/recovery cases plus 8 existing cases), `check-types` PASS and `lint --max-warnings 0` PASS. Unchanged joint component probe **2 PASS**; unchanged native Chrome probe `pass:true`. Independent verifier receives this commit separately.
