# XAI v1 — Next-phase targets (Codex cross-vendor review)

Generated: 2026-05-20 01:53 PDT
Branch: codex/track-a-desktop-foundation
Reviewer: codex `feature-review` · gpt-5.4 high reasoning

> **Update 2026-05-20 13:11 PDT — full P0/P1 fix cycle closed**
>
> Five Codex review rounds against Track A finished. All P0 are resolved.
> The only remaining open item is one P2 test-coverage gap on Foxtrot.
>
> | Round | Scope | Result |
> |---|---|---|
> | R1 | First-pass review of 10 Track A features | 3 BLOCKED (G1.2, G2.5, G2.6) + 7 REVISE |
> | R2 | P0 fixes (Alpha/Beta/Gamma) | **3/3 APPROVED** — commits `f818f0d` / `143bca5` / `c5b0e77` |
> | R3 | P1 fixes (4 sub-agents) | 3 APPROVED + **1 BLOCKED** (Delta path-authz escalated to a fresh P0) |
> | R4 | Echo bookmark-registry fix | **BLOCKED** — production wiring + basename-vs-absolute path |
> | R5 | Foxtrot native-DnD provenance closure | **REVISE** — production path honest, 1 P2 test-coverage gap |
>
> Production behavior at HEAD: real user drops on Grid windows produce
> absolute paths via Tauri native DnD → bookmark registration → reveal/open
> gate. G1.2 transparent click-through preserved; no regressions detected.
>
> Track A HEAD: `b28e991` after Foxtrot cherry-pick `a8c847b`.
> Tests: plugin-organizer 54/54 · core-data 76/76 · cargo +crypto 104/104 · desktop build green.

## Remaining open P2

1. **[Foxtrot test coverage]** Rust integration tests still drive `ensure_path_authorized` through `ensure_path_authorized_test_helper` directly instead of through `tauri::test::get_ipc_response` on `reveal_in_finder` / `open_path`. Add MockRuntime IPC coverage with one registered positive case and one unregistered negative case. Half-day work.

2. (All previous P2 items below remain — these are doc/test polish, not contract breaks.)

## Executive summary

Across 10 Codex cross-vendor reviews of the Track A commits, 3 features
returned **BLOCKED** verdicts and 7 returned **REVISE**. All three BLOCKED
calls were independently verified against the actual code and are real
contract breaks — not false positives. Most P1 issues cluster around
*doc/code alignment*, *runtime invariant enforcement* (regex / scope /
transactional atomicity), and *test-coverage holes* on the negative paths.

Recommended order for the next session: clear all P0 first (atomic, ≤ 1
half-day each), then tackle the runtime-validation P1 batch as a single
`core-data` hardening feature.

## P0 — Delta escalation (fresh, opened 2026-05-20 12:05)

**[G3-E3 reveal/open bookmark provenance]** The `commands/finder.rs` `reveal_in_finder` / `open_path` accept any path that passes the lexical shape gate (under `/Users/`, `/Applications/`, `/Volumes/`, `/tmp/` + no `..`). The contract requires every path access to come from a *user drop/open panel or authorized bookmark*. Currently any allowed window can ask the host to open `/Users/<victim>/.ssh/id_rsa` because nothing checks that the path actually originated from a user action.

Resolution path: Echo sub-agent (in flight) is adding a minimal in-memory `BookmarkRegistry` Tauri state populated by `register_path_bookmark` (called from `useFileDrop.onDrop`). `reveal_in_finder` / `open_path` then refuse paths that are not in the registry. The strict contract sentence is restored; the previous "deferred bookmark enforcement" caveat is removed.

Until Echo lands, the G3-E3 manifest row should be considered **PROVISIONAL** — the lexical gate is in place and meaningful, but the full contract is not satisfied.

## P0 — must fix before any further G2/G3 build

1. **[G1.2 plugin boundary leak]** `packages/plugin-organizer/src/OrganizerGridContent.tsx:2-3`
   imports `@tauri-apps/api/event` and `@tauri-apps/api/window` directly,
   violating red-line #4 (Plugin must not call Tauri APIs directly; use
   `@repo/core/hooks`). The G1.2 SHIPPED manifest row therefore certifies a
   product with a broken contract — fix the import, re-verify with the
   Host boundary scan, then either confirm SHIPPED or rollback to
   READY_TO_SHIP pending re-build.

2. **[G2.5 capability invariant lie]** `apps/desktop/src-tauri/src/commands/keychain.rs`
   `secret_set` / `secret_get` / `secret_del` have no `WebviewWindow`
   parameter and no `ensure_*_allowed` check, yet AUDIT.md and
   `docs/contracts/tauri-commands-v0.md` §6/§7 claim the runtime allow-list
   covers every JS-callable command. Either add the check or correct the
   doc. Same pattern check for `crypto_*` and `menubar_*` to make sure
   the audit table actually matches reality.

3. **[G2.6 same-transaction guarantee unenforced on Tauri-SQLite]**
   `packages/core-data/src/sync-outbox.ts` calls
   `entityRepo.transaction(...)` and inside it
   `outboxRepo.transaction(...)`. The in-memory repo implements this with
   a snapshot (so the unit test passes), but
   `packages/core-data/src/tauri-sqlite.ts:148-159` explicitly documents
   that `transaction(fn)` is a non-atomic callback wrapper. The
   "same-transaction rollback is proved" claim in
   `packages/single-table-todos-e2e/docs/dev_log.md` is therefore false on
   the production driver path. Options: (a) add `db_transaction_begin` /
   `db_transaction_commit` Tauri commands and make `createTauriRepo` use
   them; (b) move the outbox into the SAME namespace as the entity so a
   single `db_put` covers both writes; (c) document the deferred-gate and
   stop claiming atomicity until the SQLite path lands.

## P1 — schedule into a single core-data + plugin-organizer hardening sprint

### A) Runtime validation gaps (originally claimed in docs)
- G2.1: `assertRepoRecord` only checks for `.` in `entityType`; enforce the
  documented `^[a-z]+\.[a-z_]+$` regex.
- G2.1: clipboard `device-local` invariant is type-only; add a runtime check.
- G2.3: corrupted-but-parseable blob slips through (`organizer.item` with
  missing required fields); tighten `isPersistedLayout` + entity validation.
- G2.4: `insert_kek_from_bytes` returns early on wrong length **before** scrubbing
  the caller buffer; also zeroize on the failure path.
- G2.4: stack-local `owned: [u8; 32]` is Copy and not zeroized after
  `vault.insert_kek(owned)` consumes a copy; sanitize the transient.

### B) Doc/code alignment
- G2.1: `docs/contracts/data-repository-v0.md` §2 still lists entities not
  frozen in code (`pomodoro_session`, `widgets.widget`, `account.device`).
- G2.1: `repository-v0-contract` dev_log Work Log still says "pending
  commit" instead of `744d578`.
- G2.3 (overstated idempotency): rerun rewrites every record with a fresh
  `updatedAt`; this will explode sync conflict logic later. Either skip
  unchanged rows or surface migration as a deterministic operation.
- G2.6 (false-claim cleanup): once P0 #3 lands, remove the "proved"
  language from `single-table-todos-e2e` dev_log.

### C) Plugin / UI correctness
- G1.5: `layoutStore.save()` upserts-then-culls outside `Repo.transaction()`;
  wrap in a transaction or skip the cull until SQLite supports it.
- G1.5: `useGridSystem` can clobber user edits if async hydrate resolves
  after the user has touched state. `hydrated` flag gates persistence but
  not the late `load()` result.
- G1.5: `entityToDesktopItem` maps `kind === "url"` back to `type: "file"`
  and drops the `url` payload — repository round-trip is lossy.
- G3-E1: `inferKindFromPath` only treats trailing `/` as folder; real Finder
  drops emit absolute paths without a slash. Folder drops will misclassify
  as file.
- G3-E3: `reveal_in_finder` / `open_path` validate label + empty/NUL only;
  any allowed window can pass an arbitrary absolute path, violating the
  "user-authorized path only" contract.

### D) Test-coverage holes
- G2.1: `tests/repository-contract.ts` does not cover corrupted JSON rows,
  invalid record payloads, migration version mismatch, or
  wrong-key/encrypted-driver failure.
- G2.6: add a real test that proves rollback semantics on the Tauri-SQLite
  path once P0 #3 lands.
- G3-E3: add a test that rejects `..` traversal / non-bookmarked absolute
  paths once the contract is tightened.

### E) Workflow / process
- G3-batch packed 5 features into a single `feature-build` commit despite
  the project's one-phase-per-run rule. Split into 5 separate commits
  retroactively (or accept the deviation in writing) so the next agent
  has a clean per-feature audit trail.
- `packages/plugin-organizer/docs/dev_log.md` (organizer plugin itself)
  was not updated when the G3 helpers landed.

## P2 — defer or document

Detailed P2 items live in the per-feature outputs below. They include the
naming-regex decision (`productivity.todo-list` rejected), URL scheme
edge cases (`data:`), classifier tie-breaking, larger-payload performance,
and the eventual `pnpm-lock.yaml` / dependency-graph review.

## Deferred external gates (re-confirmed, do not re-investigate)

- Live Supabase / 2-Mac sync E2E + zero-knowledge dump PoC (G2.6 follow-up).
- SQLCipher `PRAGMA key` wiring into `db_init` (depends on G2.4 KEK handle
  + the P0 #3 transaction fix).
- macOS signed-runtime / MAS sandbox smoke (G0.6, G2.7).
- Real macOS Finder runtime test for `reveal_in_finder` / `open_path`
  (covered by deferred-gates after P0 #2 lands).

## Verdict roll-up

| Feature | Verdict | Output |
|---|---|---|
| G2.1 Repository v0 contract | ⚠ MISSING | — |
| G1.2 Grid shell / Organizer content split (SHIPPED) | BLOCKED | [output](codex-reviews/grid-shell-organizer-content/output.md) |
| G1.4 Multi-Grid event scope (SHIPPED) | REVISE | [output](codex-reviews/multi-grid-event-scope/output.md) |
| G2.2 SQLite/SQLCipher driver | REVISE | [output](codex-reviews/core-data-sqlite-driver/output.md) |
| G2.3 localStorage migration | REVISE | [output](codex-reviews/localstorage-migration/output.md) |
| G2.4 Keychain opaque handle | REVISE | [output](codex-reviews/keychain-opaque-handle/output.md) |
| G2.5 Tauri capability allowlist | BLOCKED | [output](codex-reviews/tauri-capability-allowlist/output.md) |
| G2.6 Single-table sync baseline | BLOCKED | [output](codex-reviews/single-table-sync-baseline/output.md) |
| G1.5 Grid persistence | REVISE | [output](codex-reviews/grid-persistence/output.md) |
| G3 Organizer-loop batch (E1+S3+E2+E3+E4) | REVISE | [output](codex-reviews/g3-organizer-batch/output.md) |

## Per-feature review excerpts

### G2.1 Repository v0 contract

_Codex review missing — context at `codex-reviews/repository-v0-contract/context.md`._

### G1.2 Grid shell / Organizer content split (SHIPPED)

## Codex Cross-vendor Review

**Feature**: grid-shell-organizer-content
**Commit(s)**: 26d9f57 03ca86a 3751f43 653219b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: BLOCKED

### Strengths (max 4 bullets)
- Host thinning is real: `apps/desktop/src/windows/GridWindow.tsx` now renders through `OrganizerGridContent` and no longer imports `SmartContainer`, `GridBox`, `DesktopItem`, `useFileDrop`, or Organizer internal paths.
- The extracted component keeps the intended shell/content split clear: Host owns providers and native drag handoff; Organizer owns grid UI, drop behavior, and window-scoped state/event handling.
- Ship ledger hygiene is mostly coherent: `dev_log`, manifest row #2, and deferred-gate entries all point back to `26d9f57` and the later docs-only promotion commits.
- Validation evidence is at least reproducible: `pnpm --filter @repo/plugin-organizer check-types` and `pnpm --filter desktop build` pass, and the deferred manual smoke is explicitly tracked.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0] `packages/plugin-organizer/src/OrganizerGridContent.tsx` directly imports `@tauri-apps/api/event` and `@tauri-apps/api/window`, violating `docs/SYSTEM_ARCHITECTURE.md` red line #4 (`Plugin` must not call Tauri APIs directly; use `@repo/core/hooks`/adapter surface). This is a contract-integrity break introduced by the refactor.
- [P1] `packages/plugin-organizer/src/index.ts` exposes a much broader public surface than the contract implies (`SmartContainer`, `useFileDrop`, window hooks, etc.). The Host currently behaves, but the package API still leaves easy escape hatches, so the “only `OrganizerGridContent` + types” boundary is not actually enforced.
- [P1] Test coverage is thin for an extraction that moved event/listener/drop logic: there is no focused automated regression for `gridId` scoping, close/update isolation, duplicate drop suppression, or listener cleanup; only typecheck/build/grep plus deferred manual smoke.
- [P2] Workflow hygiene is inconsistent across the reviewed set: `653219b` has proper `Why/What/Scope/Risk`, but `26d9f57`, `03ca86a`, and `3751f43` do not.
- [P2] `docs/contracts/plugin-organizer-public-api-v0.md` is still marked `Status | Draft` even though the feature was promoted to `SHIPPED`, which weakens doc-code-state alignment.

### Concrete next-phase targets (max 6 bullets)
- Replace direct Tauri calls inside `OrganizerGridContent` with a Core-owned hook/adapter layer and re-review against red line #4.
- Split or narrow the Host-facing Organizer export surface so Grid window consumers get only `OrganizerGridContent` and its prop/types contract.
- Add focused automated tests for grid-scoped update/close/drop behavior and duplicate-drop guard behavior.
- Run the deferred manual two-Grid macOS smoke after the adapter fix and record the result in `packages/grid-shell-organizer-content/docs/dev_log.md`.
- Promote the public API contract from `Draft` to an accepted/shipped state once the API boundary is actually enforced.

### Out of scope confirmed
- Manual native two-Grid runtime smoke, including Finder path drop behavior, remains a valid deferred gate and should not be skipped.
- MAS sandbox / Apple-signing validation remains an external G0.6 gate and is not reopened by this review.
- G2/G3 repository, live Supabase, and security-handle gates remain deferred and should stay out of this G1.2 closure pass.
---

### G1.4 Multi-Grid event scope (SHIPPED)

## Codex Cross-vendor Review

**Feature**: multi-grid-event-scope
**Commit(s)**: 78aef01 59da1e5 44345cf 653219b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Scoped runtime event names are consistently adopted in production TS/TSX code; legacy create-request strings remain as listener-only compatibility constants.
- `packages/core/src/types/events.ts` and `docs/contracts/events-v0.md` are aligned on the new organizer surface, including `DroppedFile`.
- Guard insertion in `OrganizerLayer`, `OrganizerGridContent`, and `useMultiWindowGrids` materially improves resilience versus the pre-migration unguarded listeners.
- Workflow docs are generally coherent: deferred gates are recorded, `dev_log` commit lineage is traceable, and `653219b` has proper Why/What/Scope/Risk hygiene.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `packages/plugin-organizer/manifest.json` still declares the old event surface (`organizer:grid-update`, `organizer:grid-close`, `organizer:file-drop`, `organizer:grid-window-ready`, `organizer:create-grid-request`). That breaks the project’s stated EventMap → manifest → code lifecycle and makes the SHIPPED promotion premature.
- [P1] `isGridCreateRequestPayload` only validates `rect`; malformed optional fields such as non-string `gridId` or invalid `source` still pass and flow into `createGrid`. That does not meet the stated “reject malformed payloads” contract.
- [P2] Guard tests are too shallow for the claimed boundary: they do not cover malformed optional fields, handler-level rejection, or duplicate/listener-cleanup behavior.
- [P2] Two-grid isolation is still proven only by convention/manual smoke. `organizer:grid:state` is broadcast globally and filtered by `gridId` in-window, so cross-grid visibility is not actually constrained by targeted delivery.
- [P2] Commit hygiene is uneven: `78aef01`, `59da1e5`, and `44345cf` are subject-only commits, so the review trail does not consistently meet the requested Why/What/Scope/Risk standard.
- [P2] No new evidence suggests the migration widened Control-window listeners, but owner-only emit rules remain unenforced at runtime.

### Concrete next-phase targets (max 6 bullets)
- Update `packages/plugin-organizer/manifest.json` to the scoped event names and re-scan for manifest/code/doc parity.
- Add a compile-smoke check for organizer manifest event keys, mirroring the `plugin-account` pattern.
- Tighten `isGridCreateRequestPayload` to validate optional `gridId` and `source`, then add negative vitest cases.
- Add handler-focused tests proving invalid create requests do not call `createGrid`.
- Add a small regression test or explicit follow-up for two-grid isolation/listener cleanup.
- Backfill Why/What/Scope/Risk bodies on future feature/build/docs checkpoint commits.

### Out of scope confirmed
- Deferred manual two-Grid native runtime smoke and listener-cleanup verification remain valid and should not be re-litigated here.
- MAS sandbox/security-scope/bookmark behavior and real macOS Finder smoke remain deferred from adjacent rows; G1.4 correctly did not attempt to solve them.
---

### G2.2 SQLite/SQLCipher driver

## Codex Cross-vendor Review

**Feature**: core-data-sqlite-driver
**Commit(s)**: f3dd30b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- `packages/core-data/src/tauri-sqlite.ts` respects red line #4: the Tauri seam is injected, and `@tauri-apps/api` is not imported directly.
- The Rust side keeps payload JSON opaque, while the TS read path does `JSON.parse` plus `assertRepoRecord`, so full `RepoRecord` invariants are re-checked on round-trip.
- Namespace validation is tight enough for this phase, and SQL uses bound parameters, so the namespace/id path is not an obvious injection vector.
- Workflow hygiene is good: commit message has Why/What/Scope/Risk, and the roadmap/dev_log were advanced together.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `createTauriRepo` claims to return `Repo<T>`, but `transaction()` is not atomic and `migrate()` always throws. That violates the frozen Repository v0 contract and would fail the canonical rollback/migration cases in `packages/core-data/tests/repository-contract.ts`.
- [P1] `docs/contracts/tauri-commands-v0.md` documents an allowed-window boundary for `db_*`, but `f3dd30b` registers the commands globally in `lib.rs` and `database.rs` has no `WebviewWindow`/runtime allow-list enforcement. The documented IPC boundary is not actually enforced in this commit.
- [P2] `packages/core-data-sqlite-driver/docs/api.md` is stale. It still documents the older `createSqliteRepo`/migration surface, not `createTauriRepo`, `dbInit`, or the new `E1300`/`E1301`/`E1302` path.
- [P2] Coverage is too shallow for the new seam: no rollback-on-throw test for the Tauri repo, no malformed JSON readback test, no crypto-disabled/default-build failure test, and no `app_data_dir`/FS error mapping test for `E1302`.
- [P2] `DatabaseState` does not hold the mutex across `await`, so deadlock risk is low, but all DB work is serialized behind one `Mutex<Option<Connection>>` and concurrency behavior is untested.

### Concrete next-phase targets (max 6 bullets)
- Add `WebviewWindow` + runtime `ensure_database_window_allowed()` checks to all `db_*` commands, and land the matching capability/audit file in the same change.
- Make `createTauriRepo` honest: either implement rollback-capable transaction/migration support or narrow the exported type/surface so it no longer claims full `Repo<T>` semantics.
- Run the canonical `packages/core-data/tests/repository-contract.ts` suite against the Tauri-backed repo seam.
- Update `packages/core-data-sqlite-driver/docs/api.md` and the contract doc so the documented JS/Rust surface matches the shipped surface exactly.
- Add negative tests for malformed JSON, namespace/id boundaries, default-build missing-command behavior, and `app_data_dir`/backend `E1302` mapping.

### Out of scope confirmed
- SQLCipher `PRAGMA key` wiring, opaque KEK-handle plumbing, and wrong-key unreadable proof remain valid deferred work for G2.4/G2.6.
- Real macOS `app_data_dir` runtime smoke and MAS/signed capability validation remain deferred gates.
- Live Supabase/outbox integration and broader sync-transaction behavior remain later roadmap rows.
---

### G2.3 localStorage migration

## Codex Cross-vendor Review

**Feature**: localstorage-migration
**Commit(s)**: 2784397
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Core scope stays clean: the adapter lives in `@repo/core-data`, with no Host/Tauri/React boundary violations.
- Non-destructive default is correctly implemented; legacy `xai-desktop-layout` is only removed behind `removeLegacy: true`.
- Well-formed layout fields map as expected for the happy path, including `viewMode`, `themeColor`, `itemIds`, and item `size`.
- Targeted coverage exists for the main success/failure modes, and the focused Vitest suite plus `check-types` pass.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `LegacyDesktopItem.createdAt` is dropped. `toGridItemEntity()` stamps both `createdAt` and `updatedAt` with migration time instead of converting the legacy epoch, so item chronology is lost; the current repo→layout path also rehydrates `createdAt: 0`, confirming the round-trip hole.
- [P1] The “idempotent” claim is overstated. On a rerun with a later clock, the migration rewrites every existing record with a fresh `updatedAt`, creating false churn that will matter once sync/conflict logic lands.
- [P1] Validation is too weak for corrupted-but-parseable blobs. The code only checks top-level arrays and string ids, so partially malformed items can still be persisted as `organizer.item` records with missing required file metadata, violating the entity contract in practice.
- [P2] Orphan items are silently discarded with no `orphansDropped` count, warning hook, or audit note, which makes migration data loss opaque.
- [P2] The dev log inventory is inaccurate: Track A already has other `localStorage` writers (`plugin-labels`), so “No other production callers persist via localStorage” is not true as written.
- [P2] Workflow/doc hygiene is incomplete: the execution pack still says G2.3 acceptance is “UI readable after migration,” while this row is marked READY_TO_SHIP with UI cut-over deferred; the Work Log also still says `pending commit` after `2784397` exists.

### Concrete next-phase targets (max 6 bullets)
- Preserve legacy item `createdAt` by converting epoch ms to ISO for repo records, and restore numeric `createdAt` in the G1.5 repo-backed layout path.
- Make reruns true no-ops: skip unchanged records or preserve existing `updatedAt` when the migrated payload is identical.
- Add per-record guards for corrupted grids/items and tests for partial corruption, missing `filepath`, duplicate ownership, and malformed `rect`.
- Extend the migration result with `orphansDropped` and `recordsSkipped`, plus an optional warning callback/audit sink.
- Correct the dev log inventory and READY_TO_SHIP narrative so remaining label/localStorage work and deferred UI acceptance are explicit.
- Update the Work Log commit column from `pending commit` to `2784397`.

### Out of scope confirmed
- UI runtime cut-over to repository-backed Organizer state remains G1.5 `grid-persistence`.
- Live Supabase / multi-device sync validation remains a later G2.6+ gate.
- MAS sandbox / signed-runtime / real macOS Finder smoke are unchanged deferred runtime gates.
- Real SQLite/SQLCipher path smoke and secure-driver concerns remain under G2.2/G2.4, not this adapter review.
---

### G2.4 Keychain opaque handle

## Codex Cross-vendor Review

**Feature**: keychain-opaque-handle
**Commit(s)**: d1fe45a
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Isolates the Keychain → KeyVault crossing into one feature-gated Rust module, with no JS-visible surface expansion beyond existing `secret_*` and `crypto_*` contracts.
- Contract text in `docs/contracts/tauri-commands-v0.md` §6.0.1 matches the intended boundary well: JS gets `KeyHandleId`, not raw KEK bytes.
- `KeyVault` already stores resident keys in `Zeroizing<[u8; 32]>`, so the long-lived in-vault copy is protected on drop.
- Independent check passed: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto keychain_handle::` ran green (3/3).

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `insert_kek_from_bytes` returns early on wrong length before scrubbing the caller buffer (`apps/desktop/src-tauri/src/crypto/keychain_handle.rs`, length check branch). Malformed-but-secret material stays in memory, which contradicts the helper’s zeroization claim.
- [P1] The success path still leaves an unzeroized transient stack copy: `owned` is a `[u8; 32]` (Copy type), so `vault.insert_kek(owned)` copies it into the vault while the local `owned` remains on stack unsanitized. The “byte zeroization” claim is therefore incomplete.
- [P2] Doc/code hygiene drift: `packages/keychain-opaque-handle/docs/dev_log.md` says “E1200-E1202 error codes” were added, while the code and contract explicitly say these errors are Rust-internal and must be mapped by callers instead.
- [P2] Workflow hygiene drift: the same Work Log row still says `pending commit`, even though the reviewed commit is `d1fe45a`.
- [P2] Coverage is light on error behavior: there is no regression test for `KeychainHandleError::Keychain(AppError)` passthrough, so future `secret_get` mapping drift would be easy to miss.
- [P2] The contract says the rule is “machine-enforced,” but there is no CI guard preventing future `secret_get` use for KEK/DEK/device-private material outside this helper.

### Concrete next-phase targets (max 6 bullets)
- Zeroize `bytes` before returning `InvalidKeyLength`, and add a unit test asserting scrub-on-error.
- Remove transient Copy-based key remnants on the happy path, likely by changing the insert path to use a non-Copy zeroizing wrapper instead of raw `[u8; 32]`.
- Add a small `KeychainHandleError -> AppError` mapper and a unit test for `KeychainLocked` passthrough.
- Fix `dev_log.md` Work Log to record `d1fe45a` and drop the nonexistent `E1200-E1202` claim.
- Add a cheap CI grep/test guard for forbidden `secret_get` use on KEK/DEK/device-private flows.
- Document caller-owned synchronization explicitly where this helper is intended to be used with shared Tauri state.

### Out of scope confirmed
- Live macOS Keychain runtime smoke with signed bundle identity and `WhenUnlockedThisDeviceOnly` remains a deferred gate, not a blocker for this review.
- SQLCipher `db_init`/`PRAGMA key` wiring belongs to the G2.6 follow-up, not this feature.
- Supabase single-table sync gates and MAS sandbox/notarization evidence remain separate deferred tracks; they do not need re-investigation here.
---

### G2.5 Tauri capability allowlist

## Codex Cross-vendor Review

**Feature**: tauri-capability-allowlist
**Commit(s)**: ad5f1d3
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: BLOCKED

### Strengths (max 4 bullets)
- `db_*` now has a real defense-in-depth runtime gate in [`commands/database.rs`], and the admit/reject unit tests pass (`cargo test --features crypto database::`).
- `plugin-data-database.json` is placed in the canonical `src-tauri/capabilities/` location and mirrors the intended window scope cleanly.
- The commit message and new dev log are mostly Workflow V2-compliant: clear Why/What/Scope/Risk and a roadmap row promotion to `READY_TO_SHIP`.
- The database allowlist pattern scales to future seams such as Finder and additional plugin-owned command families.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0] `secret_set` / `secret_get` / `secret_del` still have no `WebviewWindow` parameter or `ensure_*_allowed` guard in `apps/desktop/src-tauri/src/commands/keychain.rs`, yet the audit and contract now state that `secret_*` is runtime-enforced. This breaks the claimed security boundary for custom commands and invalidates the core G2.5 invariant.
- [P1] `apps/desktop/src-tauri/capabilities/AUDIT.md` is not a full audit of `lib.rs` `invoke_handler!`: it omits `sync_set_menubar_status`, `reveal_in_finder`, and `open_path`, and it incorrectly says `commands::keychain` has a window-origin check.
- [P1] `docs/contracts/tauri-commands-v0.md` overclaims that “Every JS-callable command has a runtime `ensure_*_allowed(label)` check.” `window.rs`, `menubar.rs`, and `keychain.rs` do not satisfy that today.
- [P1] Contract/code drift remains in the database section: the command table allows `main/control/grid_*/account`, while runtime and `plugin-data-database.json` also allow `console`.
- [P2] The database file header comment still says `db_*` is gated via `capabilities/default.json`; after this commit that is stale and will mislead future reviewers.
- [P2] `packages/tauri-capability-allowlist/docs/dev_log.md` still records the work-log commit as “pending commit” even though `ad5f1d3` exists.

### Concrete next-phase targets (max 6 bullets)
- Add `WebviewWindow` + `ensure_keychain_window_allowed` to all `secret_*` commands, and add admit/reject tests matching `account/control`.
- Decide whether host/window/menubar commands are true exceptions; either add runtime guards there or narrow the universal invariant wording in the contract.
- Fix `AUDIT.md` so every `invoke_handler!` command is listed exactly once with its real capability file and runtime enforcement status.
- Align `docs/contracts/tauri-commands-v0.md` with actual `db_*` scope (`console` included) and remove false claims about already-complete coverage.
- Update the stale `database.rs` module comment to reference `plugin-data-database.json` instead of `default.json`.
- Patch the dev log Work Log row to record `ad5f1d3`.

### Out of scope confirmed
- MAS signed-runtime / sandbox validation remains a deferred G0.6 / G2.7 gate.
- Live Supabase single-table sync evidence remains a separate G2.6 concern.
- Real macOS Finder smoke and future Finder/window capability shaping remain outside this G2.5 review.
---

### G2.6 Single-table sync baseline

## Codex Cross-vendor Review

**Feature**: single-table-sync-baseline
**Commit(s)**: 43ffdda
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: BLOCKED

### Strengths (max 4 bullets)
- `sync-outbox.ts` keeps the outbox surface in `@repo/core-data` and re-exports it cleanly via `packages/core-data/src/index.ts:57-68`; no Host/plugin boundary violation in this diff.
- The API shape is small and composable: enqueue, ordered drain, and an injected commit-seq allocator seam instead of hard-wiring sync transport.
- The new vitest file covers the main happy-path behaviors plus failure, ordering, and delete paths (`packages/core-data/tests/sync-outbox.test.ts`).
- Workflow hygiene is solid: commit message includes Why/What/Scope/Risk/Docs/Tests, and the dev log / roadmap row were updated.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0] The core contract claim is not true on the desktop driver. `enqueueOutboxEntry()` nests `entityRepo.transaction(...)` and `outboxRepo.transaction(...)` (`packages/core-data/src/sync-outbox.ts:95-108`), but `createTauriRepo().transaction()` is explicitly a non-atomic callback wrapper (`packages/core-data/src/tauri-sqlite.ts:148-159`; `packages/core-data-sqlite-driver/docs/dev_log.md:54-56`). If `db_put` for the entity succeeds and the outbox write fails, the entity can persist alone. The feature/dev-log statements that same-transaction rollback is “proved” are therefore incorrect (`packages/single-table-todos-e2e/docs/dev_log.md:31-38,54-55`).
- [P1] The docs are materially out of sync with the shipped surface. `packages/single-table-todos-e2e/docs/api.md:3-24`, `design.md:7-19`, and `test.md:5-19` still describe the old `plugin-account` todo sync store, one-driver transaction grouping, plaintext outbox rows, and end-to-end push/pull coverage, none of which is what this commit added.
- [P1] `OutboxEntry.commitSeq` and `nextCommitSeq` are typed as `number` (`packages/core-data/src/sync-outbox.ts:33,61`), while the existing sync transport already standardizes commit seq as BIGINT strings (`packages/plugin-account/src/sync-engine.ts:57,81,93`). This bakes in a breaking contract change before the Rust/Supabase authority lands.
- [P2] Re-enqueueing the same `mutationId` overwrites `id: outbox_<mutationId>` and resets retry metadata (`packages/core-data/src/sync-outbox.ts:78-90`). That may be intended idempotency, but it is currently undocumented and untested.
- [P2] The payload security boundary is comment-only: `payload` is any string, with no guard/test ensuring encrypted-envelope-only input or forbidding cleartext/PII (`packages/core-data/src/sync-outbox.ts:42-43,57`).
- [P2] No test exercises `baseRevision` / conditional-write conflict semantics, despite the field being part of the contract (`packages/core-data/src/sync-outbox.ts:48-49`; tests only cover put/delete/order/failure).

### Concrete next-phase targets (max 6 bullets)
- Introduce a real shared-transaction seam for multi-repo writes, or hard-block `enqueueOutboxEntry()` from Tauri-backed repos until `db_transaction_begin/commit` exists.
- Add a regression test using the SQLite/Tauri driver boundary that proves entity rollback when the outbox write fails.
- Align `packages/single-table-todos-e2e/docs/{api,design,test}.md` with the actual G2.6 scope and remove stale sync-v1 claims.
- Change the outbox commit-seq surface to a typed authority interface returning BIGINT strings, matching `plugin-account` transport contracts.
- Define and test same-`mutationId` semantics: overwrite vs preserve `retryCount` / `lastAttemptAt`.
- Add one focused test for `baseRevision` propagation and one guard/doc for payload cleartext policy.

### Out of scope confirmed
- Live Supabase/PostgREST/Realtime verification remains deferred.
- Real 2-Mac sync smoke remains deferred.
- Real SQLCipher copied-file / dump verification remains deferred.
- DMG/MAS sandbox dry-run evidence remains a separate G2.7 gate.
---

### G1.5 Grid persistence

## Codex Cross-vendor Review

**Feature**: grid-persistence
**Commit(s)**: 91dc6b6
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- `LayoutStore` is a clean seam: default `localStorageLayoutStore()` preserves existing behavior while exposing a repository-backed path without touching Host runtime yet.
- Whiteout-safety is materially improved: both adapters swallow `load`/`save` failures, and `GridSystemProvider` keeps a defense-in-depth startup fallback to empty state.
- Contract integrity is mostly respected: no new Host business logic, no new plugin-side Tauri calls, and the new surface is exported through `packages/plugin-organizer/src/index.ts`.
- Targeted tests exist for the core happy-path and corrupt-load cases across both storage backends.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `packages/plugin-organizer/src/layoutStore.ts` saves grids/items via multi-step `put`/cull loops outside `Repo.transaction()`. If upsert succeeds and later cull/delete fails, the repo is left in a mixed generation while the error is swallowed. That is not safe enough for the eventual SQLite cut-over.
- [P1] `packages/plugin-organizer/src/useGridSystem.tsx` can clobber user edits made before async hydrate resolves. `hydrated` only gates persistence; it does not prevent late `load()` results from overwriting in-memory state after the UI has already rendered.
- [P1] `packages/plugin-organizer/src/layoutStore.ts` maps `GridItemEntity.kind === "url"` back to `DesktopItem.type === "file"` and drops `url` metadata. That makes repository round-trip lossy against the G2.1 entity contract and is a poor fit for the next URL-item phase.
- [P2] Doc/code alignment is stale: `packages/grid-persistence/docs/api.md` still says no production API changed, `packages/grid-persistence/docs/design.md` still says “safe prep only,” and `docs/workflow/roadmap/xai-g1-native-foundation.md` still says G1.5 remains blocked in the rationale section.
- [P2] Workflow hygiene is incomplete: `packages/grid-persistence/docs/dev_log.md` Work Log still records the production row as `pending commit` even though `91dc6b6` exists.
- [P2] Test coverage misses the highest-risk repository edges: no explicit missing-`items` malformed payload case, no repo-save failure callback case, and no rollback/partial-write proof.

### Concrete next-phase targets (max 6 bullets)
- Wrap repository save phases in `transaction()` and add a sabotaged-driver rollback test.
- Add a hydrate generation/dirty-state guard so late loads cannot overwrite pre-hydration user actions.
- Make Organizer runtime state URL-capable, or explicitly reject `url` entities until that support lands.
- Reconcile `grid-persistence` docs and roadmap rationale with the shipped scope.
- Record `91dc6b6` in the dev log Work Log row.
- Define cut-over order: run `migrateOrganizerLayoutToRepos` before enabling `repositoryLayoutStore`, and keep legacy localStorage until runtime smoke passes.

### Out of scope confirmed
- Actual Host wiring to pass `repositoryLayoutStore(...)` into `GridSystemProvider`.
- Live `tauri-sqlite` / macOS desktop runtime smoke for restart-restore behavior.
- MAS sandbox / security-scope validation for path-backed items.
- Live Supabase, 2-Mac sync, and SQLCipher dump/wrong-key gates from later G2 rows.
---

### G3 Organizer-loop batch (E1+S3+E2+E3+E4)

## Codex Cross-vendor Review

**Feature**: g3-organizer-batch
**Commit(s)**: 533391e
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Strong boundary discipline overall: TS Finder client stays on injected `invoke`, Rust command registration remains in host, and new plugin surfaces are exported through `packages/plugin-organizer/src/index.ts`.
- `createUrlGridItem` and `evaluateItemHealth` are typed, additive seams with useful deterministic test hooks (`nowIso`, `newId`) and good happy/error-path unit coverage.
- Auto-classification is implemented as a rule array rather than hard-coded branching, which is the right extensibility seam for later Repository-backed rules.
- Commit hygiene at the message level is solid: `Why/What/Scope/Risk/Tests` are explicit and easy to audit.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] G3-E1 folder inference does not match real Finder payloads. `inferKindFromPath` only returns `folder` for trailing `/`, but the recorded G0.4 evidence for folders is an absolute path without a trailing slash. The new bulk adapter will misclassify real folder drops as `file`.
- [P1] G3-E3 does not enforce the documented “user-authorized path only” boundary. `reveal_in_finder` / `open_path` check only window label + empty/NUL; any allowed window can pass an arbitrary absolute path. That violates the contract text and the test checklist for path authorization.
- [P1] Workflow V2 hygiene is incomplete. `packages/plugin-organizer/docs/dev_log.md` was not updated with a Status Panel / Work Log row for this run, and five features were bundled into one `feature-build` commit despite the project’s one-phase-per-run rule.
- [P2] Contract/audit docs are only partially updated. `tauri-commands-v0.md` was changed, but the capability audit table was not extended for the new Finder surface, and the organizer public API contract still does not reflect the newly exported non-UI public helpers.
- [P2] Coverage misses important boundary cases: no regression test for real folder-path shape, no explicit `data:` / custom-scheme rejection test, no multi-grid same-rule stability test, and no test around command blocking / shell failure behavior.

### Concrete next-phase targets (max 6 bullets)
- Fix folder inference using authoritative drop metadata or a non-trailing-slash folder heuristic, and add a regression test from the recorded G0.4 folder path form.
- Add provenance/root enforcement for Finder commands so only user-dropped, picker-selected, or authorized-bookmark paths can be opened/revealed; add cargo tests for reject/allow cases.
- Add a dedicated Finder capability/audit entry and update `docs/contracts/tauri-commands-v0.md` + `apps/desktop/src-tauri/capabilities/AUDIT.md` together.
- Repair Workflow V2 bookkeeping in `packages/plugin-organizer/docs/dev_log.md` and keep follow-up fixes split into small commits.
- Add URL rejection tests for `data:` and one custom non-http scheme, plus classifier determinism tests with multiple matching grids.
- Decide and document tie-break behavior and whether extension groups remain code-defined or become settings/repository data.

### Out of scope confirmed
- Actual UI cut-over in `SmartContainer.tsx` / `OrganizerGridContent.tsx` remains deferred and was correctly not reviewed here as shipped behavior.
- Real macOS manual runtime smoke for Finder commands and two-Grid interaction remains a valid deferred gate.
- MAS sandbox / security-scoped bookmark validation remains deferred external under the existing G0.6 / G1.3 tracks.
---

