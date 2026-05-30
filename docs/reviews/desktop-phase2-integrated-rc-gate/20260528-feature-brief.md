# Feature Brief — desktop-phase2-integrated-rc-gate

| Field | Value |
|---|---|
| Feature | desktop-phase2-integrated-rc-gate |
| Title | Phase 2 Integrated Desktop RC Gate |
| Date | 2026-05-28 |
| Source | Roadmap row `#8` in `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` plus seed `docs/reviews/desktop-phase2-integrated-rc-gate/20260528-roadmap-seed.md` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Run one integrated Phase 2 RC gate for the normal-window desktop app across:

- native notifications/reminders
- status bar quick actions
- global hotkey quick open
- full macOS menu polish
- auto-update check/status-only and update-disabled behavior
- last-known data cache offline relaunch smoke

The deliverable is an integrated evidence/report path that shows repo-side readiness and real-macOS classifications honestly, while keeping `desktop-real-macos-release-smoke` as a separate required external-release condition.

## Naming Rationale

The provided slug already matches the job:

- `desktop` keeps the scope on the Tauri/macOS app on branch `dev`
- `phase2` anchors this to the current roadmap wave, not Phase 1 residual smoke or Phase 3 local-first work
- `integrated-rc-gate` states that this row aggregates already-built slices into one release-candidate gate instead of introducing a new end-user capability

## Scope

- Create the canonical Phase 2 feature brief, discovery review, and docs quartet for one integrated RC gate
- Treat rows `#2` through `#7` as the implementation baseline and compose their repo-side and manual-macOS evidence into one gate
- Define one final integrated report under `docs/reviews/desktop-phase2-integrated-rc-gate/` that includes:
  - repo-side build/test readiness
  - per-slice real-macOS smoke classifications
  - explicit cross-slice interaction checks
  - a separate external-release prerequisite section for row `#1` `desktop-real-macos-release-smoke`
- Permit only minimal verifier-owned fixes if real-macOS smoke reproduces a repo-side defect in an owning slice

## Non-goals

- No new Phase 2 feature implementation beyond minimal blocker fixes
- No reopening of the already-shipped Phase 1 integrated RC gate except as upstream evidence
- No folding row `#1` into this row or pretending its blocked manual release smoke is complete
- No Phase 3 storage, migration, sync, offline queue, backup, or overlay/file-organizer work
- No ship, push, or PR activity

## Acceptance

- Planning artifacts exist for this row: feature brief, discovery review, design, api, test, and dev_log
- The plan defines one integrated RC evidence path for the six Phase 2 slices
- Repo-side readiness and external-release readiness are reported separately
- The final integrated report can classify each Phase 2 slice as:
  - `PASS`
  - `BLOCKED_REPO`
  - `BLOCKED_ENVIRONMENT`
  - `DEFERRED_OUT_OF_SCOPE`
- The plan keeps the desktop app scoped to the normal `main` window and preserves the quarantined overlay/control/grid boundary

## Current Baseline

- Roadmap rows `#2` through `#7` are `READY_TO_SHIP`
- Row `#1` `desktop-real-macos-release-smoke` is currently `BLOCKED` and remains a required external-release condition
- `desktop-phase1-rc-release-gate` is already `SHIPPED` and remains the upstream repo-side baseline for packaging, startup shape, and offline degradation
- Dependency rows already provide slice-level repo-side verification and residual manual expectations for:
  - notifications permission/delivery states
  - status bar visibility, focus, and quick actions
  - global hotkey registration, persistence, and conflict recovery
  - full native menu coverage and support/diagnostic items
  - updater `check/status-only` states and explicit install-unavailable behavior
  - desktop-offline cache readable/absent/malformed relaunch behavior

## Deferred Validation

- Actual real-macOS GUI interaction across all six Phase 2 slices
- Cross-slice coexistence checks that require a running desktop app session
- External-release readiness closure for row `#1`
- Any targeted rebuild/retest beyond the planned baseline only if a repo-side defect is reproduced during integrated smoke
