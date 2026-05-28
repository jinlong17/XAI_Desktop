# Phase 1 — Integrated Repo-side Baseline (desktop-phase2-integrated-rc-gate)

Date: 2026-05-28  
Executor: feature-auto-build (Codex)

## Scope

This phase captures one integrated repo-side baseline across Phase 2 dependency rows and snapshots the current upstream status for rows #1-#7 before final integrated RC classification.

No new feature implementation was performed in this phase.

## Upstream Status Snapshot (Rows #1-#7)

Snapshot source A (roadmap manifest row state):
- File: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Manifest timestamp: 2026-05-28 (generated)

| Row | Slug | Manifest Status | Manifest Last Run |
|---|---|---|---|
| #1 | `desktop-real-macos-release-smoke` | `BLOCKED` | 2026-05-28 01:08 PDT |
| #2 | `desktop-native-notifications-reminders` | `READY_TO_SHIP` | 2026-05-28 01:26 PDT |
| #3 | `desktop-statusbar-quick-actions` | `READY_TO_SHIP` | 2026-05-28 02:46 PDT |
| #4 | `desktop-global-hotkey-quick-open` | `READY_TO_SHIP` | 2026-05-28 04:40 PDT |
| #5 | `desktop-full-macos-menu-polish` | `READY_TO_SHIP` | 2026-05-28 05:07 PDT |
| #6 | `desktop-auto-update-release-channel` | `READY_TO_SHIP` | 2026-05-28 06:07 PDT |
| #7 | `desktop-last-data-cache-polish` | `READY_TO_SHIP` | 2026-05-28 06:52 PDT |

Snapshot source B (upstream row dev_log status panels at build-time read):

| Row | Dev Log Path | Status | Suggested Next | Updated |
|---|---|---|---|---|
| #1 | `packages/desktop-real-macos-release-smoke/docs/dev_log.md` | `BLOCKED` | `feature-auto-build` | 2026-05-28 01:32 PDT |
| #2 | `packages/desktop-native-notifications-reminders/docs/dev_log.md` | `READY_TO_SHIP` | `ship` | 2026-05-28 02:45 PDT |
| #3 | `packages/desktop-statusbar-quick-actions/docs/dev_log.md` | `READY_TO_SHIP` | `ship` | 2026-05-28 03:34 PDT |
| #4 | `packages/desktop-global-hotkey-quick-open/docs/dev_log.md` | `READY_TO_SHIP` | `ship` | 2026-05-28 04:39 PDT |
| #5 | `packages/desktop-full-macos-menu-polish/docs/dev_log.md` | `READY_TO_SHIP` | `ship` | 2026-05-28 05:05 PDT |
| #6 | `packages/desktop-auto-update-release-channel/docs/dev_log.md` | `READY_TO_SHIP` | `ship` | 2026-05-28 06:06 PDT |
| #7 | `packages/desktop-last-data-cache-polish/docs/dev_log.md` | `READY_TO_SHIP` | `ship` | 2026-05-28 06:51 PDT |

Interpretation:
- Rows #2-#7 remain repo-ready baselines for this integrated gate.
- Row #1 remains explicitly blocked and is preserved as an external-release prerequisite (not merged into repo-ready success claims).

## Fresh Integrated Repo-side Baseline (Automated)

The following commands were rerun in this build session.

### 1) Slice package test baseline

| Command | Time Window | Result |
|---|---|---|
| `pnpm --filter @repo/desktop-native-notifications-reminders test` | 07:05:11-07:05:13 PDT | PASS (`6` tests) |
| `pnpm --filter @repo/desktop-statusbar-quick-actions test` | 07:05:13-07:05:15 PDT | PASS (`6` tests) |
| `pnpm --filter @repo/desktop-global-hotkey-quick-open test` | 07:05:15-07:05:18 PDT | PASS (`5` tests) |
| `pnpm --filter @repo/desktop-auto-update-release-channel test` | 07:05:18-07:05:20 PDT | PASS (`6` tests) |

### 2) Integrated web/plugin contract baseline

| Command | Time Window | Result |
|---|---|---|
| `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/notificationsPane.test.tsx src/__tests__/hotkeysPane.test.tsx src/__tests__/aboutPane.test.tsx` | 07:05:29-07:05:31 PDT | PASS (`22` tests) |
| `pnpm --filter @repo/plugin-web-pomodoro test` | 07:05:31-07:05:36 PDT | PASS (`124` tests) |
| `pnpm --filter @repo/plugin-web-tasks test` | 07:05:36-07:05:39 PDT | PASS (`49` tests) |
| `pnpm --filter @repo/plugin-web-board-workspaces test` | 07:05:39-07:05:44 PDT | PASS (`176` tests) |
| `pnpm --filter @repo/plugin-web-habits test` | 07:05:44-07:05:49 PDT | PASS (`121` tests) |
| `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx src/config/sourcemapPolicy.test.ts src/routes/router.integration.test.tsx` | 07:05:49-07:05:54 PDT | PASS (`12` tests) |

Observed warnings were non-failing and consistent with known fixtures/invalid-cache guard tests (expected decode warnings) and existing UI nesting warning logs in board test snapshots.

### 3) Web build + browser-safety baseline

| Command | Time Window | Result |
|---|---|---|
| `pnpm --filter @repo/web build` | 07:05:54-07:05:57 PDT | PASS; `sourcemaps:assert-clean` PASS; `browser-safety:assert-dist` PASS |
| `pnpm --filter @repo/web run build:secure` | 07:05:57-07:06:04 PDT | PASS; release/upload steps skipped as designed without Sentry env; final sourcemap clean + browser-safety PASS |

### 4) Rust and desktop bundle baseline

| Command | Time Window | Result |
|---|---|---|
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` | 07:06:11-07:06:39 PDT | PASS (`75` Rust tests + doc/main harness) |
| `pnpm --filter desktop tauri build --debug --bundles app` | 07:06:39-07:07:10 PDT | PASS; produced debug `.app` bundle at `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app` |

## Repo-side Baseline Verdict (Phase 1)

`PASS` for repo-side automated baseline.

Guardrails preserved:
- Normal-window desktop scope retained.
- No overlay/control/grid startup path reactivation introduced.
- No claim made here about real-macOS interactive success; that is handled in Phase 2/3 matrices.

## External-release Prerequisite Reminder

Row #1 `desktop-real-macos-release-smoke` remains `BLOCKED` and is still required for external-release readiness.
