# desktop-phase2-integrated-rc-gate — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — dedicated integrated Phase 2 RC gate with split repo-side and external-release verdict planes |
| Review Doc Path | `docs/reviews/desktop-phase2-integrated-rc-gate/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 2 integrated RC evidence and blocker-classification gate |

## Frozen Assumptions

- Rows `#2` through `#7` are the implementation baseline for this row and are not reopened as planning targets here.
- Row `#1` `desktop-real-macos-release-smoke` remains a required external-release condition and must be reported separately from repo-side readiness.
- The active product is still the ADR-0011 normal-window desktop app on branch `dev`.
- Overlay/control/grid startup remains quarantined and must not re-enter the default startup path.
- This row may apply only minimal verifier-owned fixes when integrated smoke reproduces a repo-side defect in an owning surface.
- `ship` is human-only and out of scope for this plan run.

## Dependency Overview

- Roadmap and authority:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
- Upstream baseline rows:
  - `packages/desktop-phase1-rc-release-gate/docs/dev_log.md`
  - `packages/desktop-real-macos-release-smoke/docs/dev_log.md`
- Phase 2 dependency rows:
  - `packages/desktop-native-notifications-reminders/docs/dev_log.md`
  - `packages/desktop-statusbar-quick-actions/docs/dev_log.md`
  - `packages/desktop-global-hotkey-quick-open/docs/dev_log.md`
  - `packages/desktop-full-macos-menu-polish/docs/dev_log.md`
  - `packages/desktop-auto-update-release-channel/docs/dev_log.md`
  - `packages/desktop-last-data-cache-polish/docs/dev_log.md`
- Likely owning surfaces if a minimal blocker fix is reproduced:
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/app_menu.rs`
  - `apps/desktop/src-tauri/src/commands/statusbar.rs`
  - `apps/desktop/src-tauri/src/commands/global_hotkey.rs`
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/plugin-web-settings-rest/src/panes/`
  - `packages/xai-web-shell/` and the slice-owned browser-safe bridge packages

## Gate Shape

- One integrated row owns the composed Phase 2 RC gate for six slices:
  - notifications
  - status bar
  - hotkey
  - menu
  - updater
  - cache
- Each slice must end with one explicit classification:
  - `PASS`
  - `BLOCKED_REPO`
  - `BLOCKED_ENVIRONMENT`
  - `DEFERRED_OUT_OF_SCOPE`
- The final report must also carry a separate external-release prerequisite section for row `#1`.

## Evidence Shape

Preferred outputs under `docs/reviews/desktop-phase2-integrated-rc-gate/` during build/verify:

- `20260528-phase1-integrated-repo-baseline.md`
- `20260528-phase2-native-interaction-matrix.md`
- `20260528-phase3-update-cache-matrix.md`
- `20260528-phase4-integrated-rc-verdict.md`

The final verdict artifact should include:

- repo-side readiness summary
- six-slice classification matrix
- cross-slice interaction notes
- explicit external-release prerequisite section mirroring row `#1`

## Implementation Phases

### Phase 1 — Integrated Repo-side Baseline and Evidence Ledger

- Confirm rows `#2`-`#7` remain `READY_TO_SHIP` or `SHIPPED`.
- Record the exact rerun command set, artifact provenance, and current row `#1` status.
- Keep this as a repo-side readiness section, not a real-macOS success claim.

### Phase 2 — Native Interaction Matrix

- Run the real-macOS interaction matrix for:
  - notifications
  - status bar
  - hotkey
  - menu
- Confirm coexistence on the normal `main` window and no overlay/control/grid reactivation.
- If a repo defect reproduces, fix only the owning seam and rerun focused evidence.

### Phase 3 — Update-disabled and Cache Offline Matrix

- Run the real-macOS integrated matrix for:
  - updater `check/status-only` and explicit install-unavailable behavior
  - cache readable/absent/malformed offline relaunch states
- Confirm `/app` stays reachable and truthful during these checks.

### Phase 4 — Final Integrated RC Verdict

- Publish one final integrated Phase 2 RC report with:
  - six-slice classifications
  - cross-slice notes
  - repo-side readiness summary
  - external-release prerequisite status for row `#1`

## Explicit Deferrals

- no new Phase 2 feature design
- no Phase 3 local-first/storage/sync work
- no updater install/download ownership
- no reopening of Phase 1 residual smoke scope beyond explicit row `#1` status reporting
