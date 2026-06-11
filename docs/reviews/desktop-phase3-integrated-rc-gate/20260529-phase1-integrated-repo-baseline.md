# Phase 1 - Integrated Repo-side Baseline and Dependency Ledger

- Feature: `desktop-phase3-integrated-rc-gate` (row `#18`)
- Date: 2026-05-29
- Executor: `feature-auto-build (Codex gpt-5.3-codex inline)`
- Scope: repo-side integrated baseline only (no manual real-macOS claim)

## Dependency Ledger (Rows #10-#17)

Source: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`

| Row | Slug | Status | Last Run (manifest) | Dependency Note |
|---|---|---|---|---|
| 10 | `desktop-local-first-sqlite-foundation` | `SHIPPED` | 2026-05-29 00:23 PDT | Foundation shipped; row #11 unblocked. |
| 11 | `desktop-local-first-repository-bridge` | `SHIPPED` | 2026-05-29 01:38 PDT | Canonical bridge shipped; rows #12/#13/#16/#17 unblocked. |
| 12 | `desktop-local-first-web-data-migration` | `SHIPPED` | 2026-05-29 02:27 PDT | Import/migration shipped with pushed commits. |
| 13 | `desktop-local-first-offline-edit-queue` | `SHIPPED` | 2026-05-29 03:05 PDT | Offline edit queue shipped with pushed commits. |
| 14 | `desktop-local-first-sync-reconnect` | `SHIPPED` | 2026-05-29 03:42 PDT | Reconnect replay shipped with pushed commits. |
| 15 | `desktop-ai-offline-provider-policy` | `SHIPPED` | 2026-05-29 04:22 PDT | AI offline/degraded policy shipped. |
| 16 | `desktop-calendar-sync-degraded-mode` | `SHIPPED` | 2026-05-29 05:02 PDT | Calendar degraded/reconnect behavior shipped. |
| 17 | `desktop-local-first-backup-export-import` | `SHIPPED` | 2026-05-29 05:37 PDT | Backup/export/import shipped and pushed. |

Conclusion: row `#18` is dependency-unblocked and can execute integrated RC evidence.

## Repo-side Gate Commands (Exact Results)

Execution batch: `.tmp/phase3_rc_phase1_commands.txt`
Result ledger: `.tmp/phase3_rc_phase1_command_results.tsv`
Per-command logs: `.tmp/phase3_rc_logs/*.log`

| # | Command | Exit Code | Duration (s) |
|---|---|---:|---:|
| 01 | `pnpm --filter @repo/core-data test` | 0 | 5 |
| 02 | `pnpm --filter @repo/core-data check-types` | 0 | 2 |
| 03 | `pnpm --filter @repo/plugin-web-storage test` | 0 | 7 |
| 04 | `pnpm --filter @repo/plugin-web-storage check-types` | 0 | 3 |
| 05 | `pnpm --filter @repo/plugin-web-tasks test` | 0 | 6 |
| 06 | `pnpm --filter @repo/plugin-web-board-core test` | 0 | 5 |
| 07 | `pnpm --filter @repo/plugin-web-board-core typecheck` | 0 | 3 |
| 08 | `pnpm --filter @repo/plugin-web-board-workspaces test` | 0 | 6 |
| 09 | `pnpm --filter @repo/plugin-web-board-workspaces typecheck` | 0 | 5 |
| 10 | `pnpm --filter @repo/plugin-web-habits test` | 0 | 6 |
| 11 | `pnpm --filter @repo/plugin-web-pomodoro test` | 0 | 7 |
| 12 | `pnpm --filter @repo/plugin-web-pet test` | 0 | 6 |
| 13 | `pnpm --filter @repo/plugin-web-settings-shell test` | 0 | 5 |
| 14 | `pnpm --filter @repo/plugin-web-settings-shell typecheck` | 0 | 3 |
| 15 | `pnpm --filter @repo/plugin-web-settings-rest test` | 0 | 12 |
| 16 | `pnpm --filter @repo/plugin-web-settings-rest typecheck` | 0 | 4 |
| 17 | `pnpm --filter @repo/plugin-web-ai-chat test` | 0 | 8 |
| 18 | `pnpm --filter @repo/plugin-web-ai-chat typecheck` | 0 | 4 |
| 19 | `pnpm --filter @repo/plugin-web-calendar test` | 0 | 8 |
| 20 | `pnpm --filter @repo/plugin-web-calendar check-types` | 0 | 4 |
| 21 | `pnpm --filter @repo/web test` | 0 | 8 |
| 22 | `pnpm --filter @repo/web check-types` | 0 | 7 |
| 23 | `pnpm --filter @repo/web build` | 0 | 5 |
| 24 | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` | 0 | 34 |
| 25 | `pnpm --filter desktop tauri build --debug --bundles app` | 0 | 38 |

## Baseline Verdict

- Repo-side integrated baseline verdict: `PASS`.
- Command summary: 25/25 commands exited `0`.
- This phase does **not** assert manual real-macOS interactive checks; those remain explicit residuals for integrated phase outputs and final verify.
