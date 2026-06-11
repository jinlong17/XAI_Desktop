# Phase 3 — Update + Cache Matrix (updater status-only + offline relaunch truthfulness)

Date: 2026-05-28  
Executor: feature-auto-build (Codex)

## Scope

This phase classifies integrated outcomes for:
- updater `check/status-only` and update-disabled behavior
- cache readable/absent/malformed offline relaunch truthfulness

## Repo-side Evidence (from Phase 1 fresh reruns)

- Updater row evidence:
  - `pnpm --filter @repo/desktop-auto-update-release-channel test` PASS (`6` tests)
  - `pnpm --filter @repo/plugin-web-settings-rest test -- ...aboutPane.test.tsx` PASS (included in targeted settings test batch)
- Cache/offline behavior evidence:
  - `pnpm --filter @repo/plugin-web-tasks test` PASS (includes offline malformed cache tests)
  - `pnpm --filter @repo/plugin-web-board-workspaces test` PASS (includes offline malformed cache tests)
  - `pnpm --filter @repo/plugin-web-habits test` PASS (includes offline malformed cache tests)
  - `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx src/config/sourcemapPolicy.test.ts src/routes/router.integration.test.tsx` PASS
- Distribution/bundle evidence:
  - `pnpm --filter @repo/web build` PASS + browser-safety/sourcemap-clean checks
  - `pnpm --filter @repo/web run build:secure` PASS (Sentry release steps skipped without env as designed)
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS (`75` tests)
  - `pnpm --filter desktop tauri build --debug --bundles app` PASS (debug app bundle generated)

## Real-macOS Matrix Classification

| Slice | Real-macOS Required Checks | Classification | Rationale |
|---|---|---|---|
| updater | About-pane state rendering + disabled-reason UX + check result states in live desktop session | `BLOCKED_ENVIRONMENT` | This run cannot perform trustworthy interactive GUI/state observation in a real macOS app session |
| cache | offline relaunch with readable/absent/malformed cache and truthful `/app` continuity on real desktop launch | `BLOCKED_ENVIRONMENT` | Requires interactive relaunch/session behavior checks unavailable in this environment |

## Cross-slice (Updater + Cache)

Target checks:
- updater status copy and cache-degraded/offline copy do not conflict
- `/app` startup remains truthful while updater is disabled/check-only

Current result:
- Repo-side automated evidence remains green.
- Direct integrated GUI verification remains `BLOCKED_ENVIRONMENT`.

## Phase 3 Outcome

- Matrix completed with honest separation of repo-side evidence vs real-macOS interaction limits.
- No repo-owned regression was reproduced in available automated gates.
