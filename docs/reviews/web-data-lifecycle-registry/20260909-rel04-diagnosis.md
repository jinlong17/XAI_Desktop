# REL-04 — lifecycle registration after REL-03

Module: **web**. Role: **bug-diagnose**, read-only product review. No source changes, account service calls or production storage access. Baseline includes REL-03 commits `fae9398`, `5ae7b7a`, consumer fixtures `23b83e4`, and production registration preservation `96d1914`. Other parallel owner changes are present in the shared checkout; this report describes the named files as read, not a separately deployed release.

## Verdict

REL-03 already fixes the original missing Time Tracker / Bookkeeping / Metrics **account-key enumeration** problem. All 114 earlier literal keys exist in the runtime ownership map: **38 account, 76 device**, zero missing. Do not implement another fixed deletion/export list or move device preferences into account scope to satisfy the old wording.

REL-04 still has a small, concrete product-contract gap: the current account download cannot reproduce device-controlled layout, and its artifact has no machine-readable declaration of exclusions. Device layout, historical unowned data and global raw archives need explicit lifecycle treatment and a separately chosen recovery export; they must not be silently included in another account's backup or removed during account deletion. The active account export must stay account-only.

## Scope and evidence

- Acceptance source: `docs/reviews/20260908-full-product-audit/TODO.md:68`: entity-to-key ownership complete; deletion/export covers all declared data.
- Full per-key reconciliation: [114-key table](key-lifecycle-coverage.md), [machine-readable matrix](key-lifecycle-coverage.json). Old PREF_REGISTRY registration and account lifecycle registration are different: independent repositories need not be forced through a codec registry to be covered.
- `packages/plugin-web-storage/src/internal/accountDataLifecycle.ts:14`: export enumerates the captured **current generation**, not PREF_REGISTRY; every owned logical key is serialized as its original string. `:29`: deletion enumerates the entire captured account prefix, clearing old/candidate/current generations and journals, retaining a tombstone.
- `packages/plugin-web-storage/src/internal/accountMigration.ts:29`: unowned inspection scans original `xai_*` values excluding known device keys. `:69`: selected legacy categories require known account ownership and owner validation. `:80`: existing generation enumeration preserves unknown owned `xai_pref_*` too. `:92`: raw global archive is explicitly `owner: unassigned`; `:98`: journal links it to the migration without declaring all archived contents account-owned.
- `packages/plugin-web-settings-rest/src/panes/accountPane.tsx:30`: current UI downloads only the account export object. The message at `:42` says this is not cloud backup, but neither the artifact nor the UI declares device/history/unowned/BYOK exclusions.
- `packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts:63`: resumed erasure clears captured account LS and AI ciphertext; pending receipt supports retry. This must remain intact; do not reintroduce origin-wide clear or fixed shared-IDB wipe.

## Feature-by-feature disposition

| Feature/data | Current keys and representation | Export / deletion / migration today | REL-04 disposition |
|---|---|---|---|
| Time Tracker records and categories | `xai_tt_entries_v2`, `xai_tt_categories_v2` | Account generation export; all generations erased; explicit import with owner guards | Covered; keep current implementation |
| Time Tracker insights and custom status cards | `xai_tt_insights_v1`, `xai_tt_time_status_custom_cards_v1`; category collapse IDs `xai_tt_category_collapsed_v1` | Same account lifecycle | Covered; category references remain private |
| Time Tracker presentation | mode, day collapse, sidebar/status hidden and standard status cards | Device keys retained on deletion, excluded from account export/import | Correct ownership; device-layout backup scope missing |
| Bookkeeping entities | `xai_bk_state_v2`: ledgers, accounts, expense/income/transfer/prepay, unified tx, recurring, investment, budgets and preferences in version-2 blob | Included as exact account raw blob, erased by account prefix, selected legacy import guarded | Covered at **key/blob** level; deep schema validation belongs to REL-11, not proven here |
| Bookkeeping live layout | `xai_bk_dash_order`, `xai_bk_dash_split`, `xai_bk_view`, `xai_bk_calendar_mode` | Device-scoped. `internal/storage.ts:96` overrides the corresponding `state.prefs` values on read. Account export omits authoritative device overrides | Reproduced layout mismatch when reconstructing raw account records in an empty browser-like store; needs separately declared device backup |
| Metrics | `xai_metric_tracker_state_v1`, schema-1 profile and records | Exact account blob export, account-prefix deletion, owner-validated legacy import | Covered; no separate registration patch needed |
| Tasks / Habits / Calendar / Matrix / Boards / Pomodoro / Countdown / Meditation / Dashboard / AI conversations | Listed individually in 114-key table | Account-key operations cover their active contents. Owner migration registrations survive production bundling after `96d1914` | Covered at key level; existing consumer tests do not prove export-to-import restoration |
| Device appearance, layout and toggles | Remaining 76 device keys collectively | Preserved on account deletion; omitted from account export | Correct default, but no separate declared device-settings export |
| Unknown new account prefs | `xai_pref_*` under account generation | Exported/copied dynamically even outside 114 literals; deleted with owner prefix | Covered; add family entry to lifecycle declaration |
| Unknown unowned prefs | Original unnamespaced `xai_pref_*` | Visible to legacy inspection, quarantined from automatic adoption, retained on account deletion | Correct privacy choice; raw recovery export unavailable |

## Dynamic and non-LS surfaces

| Surface | Owner / treatment | Gap classification |
|---|---|---|
| `xai:account:v1:<id>:<generation>:*`, committed-generation and migration journals | Captured account. Active generation exported; all generations/journals deleted. Pending tombstone persists intentionally | Add control-data vs user-record metadata to inventory; not business-key omission |
| `xai:demo:v1:<id>:*` | Separate demo scope | Declare separately; never adopt production legacy into demo |
| `xai:legacy:v1:archive:<migrationId>` | Raw snapshot may contain multiple unknown owners; deliberately **unassigned** | Do not delete merely because journal belonged to A. Add explicit device recovery export, retention description and a separate explicit local archive cleanup path if promised |
| Original unnamespaced known account keys | Ownership is not inferred from the current login, even after a selected copy is imported | Account deletion leaves originals by design. Clearly declare this; origin/device-wide erasure must be a different user action |
| `xai-web-ai-secrets` / scoped ciphertext and migration receipts | AI owner; `secretStore.ts:392` deletes captured account rows across generations (`:426` / `:431`) | Keep secrets out of ordinary JSON. Document BYOK exclusion and any dedicated encrypted recovery policy; do not silently export plaintext |
| Legacy provider-only AI rows and device encryption material | Unassigned / device-local, required for original encrypted data recovery | Remain outside account erasure; declare retained originals. Do not treat shared device material as account-owned |
| `xai-web-auth` session/device stores | Auth session lifecycle and device identity owner | Separate auth cleanup; not user content export |
| `xai_oauth_pending_<provider>` in sessionStorage | Temporary state bound to scope; cleared by host on identity changes and validated by Settings | Register dynamic temporary family; not durable backup material |
| `web-encrypted-cache-<namespace>-<accountId>` | Core-data repository supports scoped DB naming (`indexeddb-sync-blob.ts:370`) | No active Web consumer found in the current route/package graph. Inventory as dormant capability; require participant before activation, not a reason to unfreeze account sync or delete every matching database |
| `xai_todo_*` strings in AppProviders | Auth metadata field names used for runtime bridge, not standalone localStorage keys | Exclude from LS key counts; no missing 5-key registry defect |

## Reproduction results and limits

Run: `pnpm --filter @repo/plugin-web-storage exec vitest run --root ../.. --config docs/reviews/web-data-lifecycle-registry/rel04-scope.config.mjs`.

**3 diagnostic cases PASS** in isolated jsdom:

1. All 38 declared account keys export byte-identical; prior account generation is deleted while B survives.
2. Device layout, original unowned records and global raw archive remain after account deletion and are absent from account export.
3. Bookkeeping shows `quick-first` from a device override, but exporting/reconstructing only account records yields the blob's `bills-first` in an empty browser-like store.

These are characterization tests. Case 3 proves a device-layout backup gap, not failure of an existing restore UI: **no account-file restore UI/API exists**. Cases 1/2 validate enumeration boundaries with synthetic raw values; they do not validate entity semantics, all historical versions, encrypted backup restoration, a production auth deletion, or an end-to-end exported-file round trip. Existing 12 consumer suite passes likewise do not establish those outcomes.

## Minimum actual fix strategy

1. **Lifecycle declaration:** extend the current ownership source with explicit feature/entity grouping and data class (account current records; device preferences; temporary auth/control; unowned originals; recovery archives; encrypted secrets). Derive coverage from that one declaration rather than duplicating a third fixed key list. Keep open-ended families and dormant IDB status explicit.
2. **Account export manifest:** keep its default scope unchanged, add a format/version, active-generation scope, included categories and explicit exclusions/retention notes. UI should say account records are downloaded and device settings, legacy/archive history and BYOK are separate. Do not label it a complete recovery backup or cloud backup.
3. **Explicit device recovery export:** provide a separate action/choice for declared device preferences (covers authoritative Bookkeeping layout) and separately selected unowned/archive raw values. Do not attach unowned history to an account automatically. Keep auth tokens, device cryptographic material and plaintext BYOK excluded; report those exclusions. Raw corrupt/unknown bytes must remain raw, not seeded/normalized. If cleanup is exposed, it must be a separate explicit device-level operation with preview and scope, not account-delete expansion.
4. **Verification:** per-key coverage from the declaration; real download parse and category/count checks; Bookkeeping four layouts and TT device modes preserved in the chosen device section; A/B isolation and account deletion retain device/unowned data; optional raw archive selection preserves exact bytes. A public file restore path is a separate product capability: either explicitly not promised or implemented with validation/transactional commit and tested before calling the format round-trip capable. Do not stretch REL-04 into REL-05 save errors, REL-07 seed/corruption semantics, REL-08 cross-tab conflict resolution or REL-11 schema upgrades.

The smallest useful implementation is declaration + honest account export manifest + explicit device-settings recovery section/action. Full account isolation, BYOK staging, generation migration and prefix erasure are already implemented and must not be rewritten.
