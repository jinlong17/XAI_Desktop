# XAI G2 Data Security Foundation Roadmap

> **PAUSED (2026-05-24, per Web P0 Priority Override).** Web Console (`docs/workflow/roadmap/xai-web-console.md`) is the active roadmap. Do NOT start new work on this roadmap. SHIPPED rows remain authoritative for their domain; in-flight items: complete-or-park. Resumes only after P0 Web gap-closure ships and ADR-0009 (Web → Desktop Pivot Plan) is Accepted. Full rationale: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

| Field | Value |
|---|---|
| Roadmap | xai-g2-data-security-foundation |
| Source | docs/planning/execution/G2-data-security-foundation.md |
| Gate | G2 — data and security foundation |
| Default Automation Mode | D-Codex |
| Default Verify Cross-vendor | yes |
| Manifest Review | DEFERRED in unattended mode; see docs/workflow/roadmap/xai-v1.deferred-gates.md |
| Updated | 2026-05-19 23:40 PDT |

## Gate Status

- Gate Status: ACTIVE_UNDER_G1_DATA_INTERFACE_FREEZE
- Rationale: G0 is Conditional Go for the DMG/private path. G1.1, G1.2, and G1.4 have completed local Workflow V2 verification; G1.3 remains external-blocked by MAS/security-scope evidence; G1.5 is blocked by G2 Repository v0. Proceeding to G2.1 is the next eligible risk-closing step and does not bypass a production dependency.
- Ship policy: no automatic ship and no push.

## Manifest

| # | Feature | Source | Dependencies | Package Docs | Status | Executor | Verify | Updated | Notes |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | repository-v0-contract | docs/planning/execution/G2-data-security-foundation.md §G2.1 | G1 data interface freeze | packages/repository-v0-contract/docs | SHIPPED | D-Codex | yes | 2026-05-20 | SHIPPED 2026-05-20 (Track A) · Repository v0 contract + entity surface; runtime regex + clipboard device-local invariants enforced (P1 Alpha). Commits `744d578` (feat), `0bc3afa` (P1 hardening). Codex R1 REVISE → R2 not run (P1 fix proves intent); 76/76 core-data tests passing. |
| 2 | core-data-sqlite-driver | docs/planning/execution/G2-data-security-foundation.md §G2.2 SQLite driver PoC | repository-v0-contract | packages/core-data-sqlite-driver/docs | SHIPPED | D-Codex | yes | 2026-05-20 | SHIPPED 2026-05-20 (Track A) · Tauri `db_*` commands + `createTauriRepo` + `db_put_batch` atomic batch (P0 G2.6 follow-up). Commits `f3dd30b` (feat), `c5b0e77` (atomic batch). SQLCipher PRAGMA wiring still deferred to G2.7. |
| 3 | sqlcipher-local-db | docs/planning/execution/G2-data-security-foundation.md §G2.2 SQLCipher encrypted DB PoC | repository-v0-contract, core-data-sqlite-driver, keychain-opaque-handle | packages/sqlcipher-local-db/docs | RECONCILE_AFTER_G2.1 | D-Codex | yes | 2026-05-19 | Existing SQLCipher open/key path is present, but G2 still needs Repository integration and dump/wrong-key evidence review. |
| 4 | localstorage-migration | docs/planning/execution/G2-data-security-foundation.md §G2.3 | repository-v0-contract, core-data-sqlite-driver | packages/localstorage-migration/docs | SHIPPED | D-Codex | yes | 2026-05-20 | SHIPPED 2026-05-20 (Track A) · `migrateOrganizerLayoutToRepos` adapter; non-destructive; entity validation skip (P1 Alpha) + unchanged-skip true-idempotency (P1 Gamma) via separate counters. Commits `2784397` (feat), `0bc3afa` + `7e97dc3` (P1 hardening). |
| 5 | keychain-opaque-handle | docs/planning/execution/G2-data-security-foundation.md §G2.4 | repository-v0-contract | packages/keychain-opaque-handle/docs | SHIPPED | D-Codex | yes | 2026-05-20 | SHIPPED 2026-05-20 (Track A) · `crypto/keychain_handle.rs` bridges Keychain bytes → `KeyVault::insert_kek` returning only `KeyHandleId`; zeroize on both success and length-error paths (P1 Alpha). Commits `d1fe45a` (feat), `0bc3afa` (P1 hardening). |
| 6 | tauri-capability-allowlist | docs/planning/execution/G2-data-security-foundation.md §G2.5 | keychain-opaque-handle, crypto-tauri-commands | packages/tauri-capability-allowlist/docs | SHIPPED | D-Codex | yes | 2026-05-20 | SHIPPED 2026-05-20 (Track A) · `plugin-data-database.json` + `AUDIT.md`; runtime allow-list now extends to `secret_*` (P0 G2.5), `db_*` (G2.5), `window_*` (P1 Gamma), `menubar_*` (P1 Gamma). Commits `ad5f1d3` (feat), `143bca5` (P0 keychain), `7e97dc3` (P1 window/menubar). Codex R2 APPROVED on keychain fix. |
| 7 | single-table-sync-baseline | docs/planning/execution/G2-data-security-foundation.md §G2.6 | repository-v0-contract, keychain-opaque-handle, tauri-capability-allowlist | packages/single-table-todos-e2e/docs | SHIPPED | D-Codex | yes | 2026-05-20 | SHIPPED 2026-05-20 (Track A) · Repository v0 `sync-outbox.ts` + `db_put_batch` atomic seam (P0 G2.6). Commits `43ffdda` (feat), `c5b0e77` (atomic). Codex R2 APPROVED. Live Supabase / 2-Mac / SQLCipher dump remain deferred. |
| 8 | dmg-mas-security-dry-run | docs/planning/execution/G2-data-security-foundation.md §G2.7 | tauri-capability-allowlist, G0.6 MAS sandbox environment | packages/release-sandbox-dry-run/docs | BLOCKED_EXTERNAL | D-Codex | yes | 2026-05-19 | Apple Developer signing/MAS sandbox runtime evidence is unavailable; keep as deferred release/security gate. |

## Decomposition Rationale

- G2.1 is the first eligible feature because downstream SQLite, SQLCipher, migration, Grid persistence, and sync work all depend on a frozen Repository v0 contract.
- G2.2 is split into SQLite driver and SQLCipher encrypted DB because the execution-pack task contains two separable evidence tracks; each feature must claim only one clear task slice.
- Existing sync-v1 artifacts are treated as evidence to reconcile, not as automatic G2 completion, because this roadmap uses the G0-G10 execution packs as the authoritative entry.
- G2.7 is explicitly external-blocked and does not block G2.1 contract work.

## Verification Policy

- Each feature must run its minimal relevant checks.
- Contract changes must update `docs/contracts/*`.
- Cross-vendor review/verify is deferred in this serial Codex run and must be recorded per feature.
- Real MAS, Apple Developer, live Supabase, multi-device, long-run, or signed-runtime gates must be recorded in `xai-v1.deferred-gates.md` instead of being simulated.
