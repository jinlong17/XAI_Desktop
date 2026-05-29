# desktop-local-first-backup-export-import - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-local-first-backup-export-import |
| Title | Desktop Local-First Backup Export Import |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex inline fallback) |
| Updated | 2026-05-29 05:30 PDT |
| Brief | `docs/reviews/desktop-local-first-backup-export-import/20260529-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-local-first-backup-export-import/20260529-discovery-review.md` |
| Risks | Repo-side build gates passed for native/core-data/web/runtime surfaces. Residual risk is limited to independent feature-verify review plus manual real-device restore UX smoke outside this build phase. |
| Blockers | — |
| Review Notes | Approved. The partial-restore strategy is conservative enough for this row: restore only representative canonical local-first records, keep `sync.outbox` plus `desktop.web_import_*` as explicit audit/partial metadata, and keep raw DB swap/cloud backup/queue-rewrite/notes/overlay scope out. Export may remain available when unresolved queue or import-audit state exists because blocking backup exactly when the repo is dirty weakens recovery; however, build must surface that state during export/verify and must refuse restore-apply into a live repo that still has unresolved target `sync.outbox` rows, so restored canonical records cannot drift away from pending queued mutations. |

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#17`
- Seed: `docs/reviews/desktop-local-first-backup-export-import/20260528-roadmap-seed.md`
- Dependency baseline:
  - row `#11` `desktop-local-first-repository-bridge` is `SHIPPED`
  - rows `#12`, `#13`, `#14`, and `#16` are also `SHIPPED` and provide adjacent contract evidence
  - ADR authority exists at `docs/adr/0012-phase3-local-first-storage.md`

## Phase Plan

### Phase 1 - Bundle contract and restore classification

Status: DONE (`82441369`)

- add bundle manifest/result types and restorable-vs-excluded classifiers in `@repo/core-data`
- freeze supported representative entity families
- freeze explicit partial semantics for excluded queue/import-ledger state

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`

### Phase 2 - Native backup-safe file and verify surface

Status: DONE (`889f080a`)

- add host-owned backup directory resolution under app data
- add native read/write/verify command surface for bundle files
- keep live DB replacement out of scope

Exit gates:

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`

### Phase 3 - Import/apply runtime bridge and post-restore verification

Status: DONE (`d586ca96`)

- add minimal desktop-only runtime bridge if needed
- verify before apply, then restore supported records transactionally
- run post-apply verification and report `restored` vs `restored_partial`

Exit gates:

- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`

### Phase 4 - Cross-stack verification and scope audit

Status: DONE

- rerun native, core-data, web, and desktop bundle gates
- confirm no row `#12/#13/#14/#16` scope was rewritten
- confirm no raw DB swap path, no cloud backup, and no hidden notes model leaked in

Exit gates:

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Explicit Deferrals

- no raw `xai-repo-v0.db` file export/restore workflow
- no cloud backup or remote account backup
- no rewrite of row `#13` queue semantics or row `#14` reconnect logic
- no rehydration of `sync.outbox` or `desktop.web_import_*` into live state as if they were safe user data
- no hidden notes persistence model
- no broad settings/dashboard UX redesign beyond a minimal controlled desktop tool surface
- no organizer/overlay/control/grid restoration work

## Review Focus

- Is the partial-restore recommendation conservative enough: restorable canonical records only, with `sync.outbox` and import-ledger state excluded from live restore?
- Should managed backup/export remain available when unresolved queue state exists, or should review require blocking export until the queue is empty?
- Is one artifact format for both managed backup and explicit export the right simplification for this row?
- Are the build phases concrete enough for `feature-build` to land one intent per run without drifting into raw DB swapping or row `#13/#14` rewrites?

## Work Log

| Timestamp | Executor | Action | Commits | Tests | Next |
|---|---|---|---|---|---|
| 2026-05-29 05:08 PDT | feature-plan (Codex, gpt-5 inline) | Fresh planning pass. Normalized the roadmap seed into a formal feature brief, reviewed ADR-0012 plus the shipped row `#11/#12/#13/#14/#16` seams, inspected the actual desktop bridge/import/outbox/runtime code, and wrote discovery/design/api/test/dev_log artifacts. Recommended a repo-managed backup bundle with staged validation and post-restore verification, using the app-data backup location, restoring only representative canonical local-first records, and treating `sync.outbox` plus import-ledger state as explicit excluded/audit-only data with partial-restore semantics instead of unsafe live replay. | — | Not run (planning docs only) | feature-review |
| 2026-05-29 05:15 PDT | feature-review (Codex, gpt-5 inline) | Review pass approved the plan. Validated ADR-0012 alignment, confirmed one bundle format plus app-data backup location, confirmed no raw DB swap/cloud backup/row `#13/#14` rewrite/notes or overlay drift, and accepted export while dirty-source queue/import-audit state exists because restore remains explicit partial-only. Added one build-time guard in Review Notes: refuse restore-apply when the target live repo still has unresolved `sync.outbox` rows. | — | Not run (review/docs only) | feature-auto-build |
| 2026-05-29 05:22 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 1 by adding a shared desktop backup bundle contract in `@repo/core-data`: restorable/excluded entity matrix, deterministic fingerprinting, verify/full-vs-partial/corrupt/incompatible classification, unresolved outbox counting, transactional apply helper, and post-apply live verification helper. | `82441369` | `pnpm --filter @repo/core-data test` PASS; `pnpm --filter @repo/core-data check-types` PASS | feature-auto-build |
| 2026-05-29 05:25 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 2 by adding native backup-safe command surface in Tauri: managed backup path under `app_data_dir()/backups`, bundle write/read/verify commands, absolute-path validation, managed-path detection, and helper tests in `database_runtime.rs` + `database.rs`; kept raw DB replacement out of scope. | `889f080a` | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS | feature-auto-build |
| 2026-05-29 05:27 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 3 by wiring desktop backup runtime bridge in `@repo/plugin-web-storage` with verify-before-apply and busy lock, exposing create/verify/import + report access via storage exports and `AppProviders` desktop globals, and enforcing restore refusal when target unresolved `sync.outbox` rows exist. | `d586ca96` | `pnpm --filter @repo/plugin-web-storage test` PASS; `pnpm --filter @repo/plugin-web-storage check-types` PASS; `pnpm --filter @repo/web test` PASS; `pnpm --filter @repo/web check-types` PASS | feature-auto-build |
| 2026-05-29 05:30 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 4 cross-stack verification and scope audit. Re-ran native/core-data/plugin/web/desktop gates, confirmed export remains allowed with explicit partial metadata, confirmed restore-apply refusal on unresolved target outbox, and confirmed no raw DB swap/cloud backup/row `#13/#14` rewrite/notes/overlay leakage. | — | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS; `pnpm --filter @repo/core-data test` PASS; `pnpm --filter @repo/core-data check-types` PASS; `pnpm --filter @repo/plugin-web-storage test` PASS; `pnpm --filter @repo/plugin-web-storage check-types` PASS; `pnpm --filter @repo/web test` PASS; `pnpm --filter @repo/web check-types` PASS; `pnpm --filter @repo/web build` PASS; `pnpm --filter desktop tauri build --debug --bundles app` PASS | feature-verify |
