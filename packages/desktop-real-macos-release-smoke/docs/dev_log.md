# desktop-real-macos-release-smoke — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-real-macos-release-smoke |
| Title | Real macOS Release Smoke Gate |
| Current Phase | FEATURE_BUILD |
| Status | BLOCKED |
| Suggested Next | feature-auto-build |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex inline) |
| Updated | 2026-05-28 01:32 PDT |
| Risks | Blocked by environment-only residuals: this non-interactive run cannot execute or observe the required real-macOS GUI/manual checks (network-disabled launch, Finder drag-install launch from `/Applications`, native menu clicks, monitor-topology relaunch). No repo defect reproduced. |

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#1`
- Seed: `docs/reviews/desktop-real-macos-release-smoke/20260528-roadmap-seed.md`
- Dependency baseline: `desktop-phase1-rc-release-gate` is already SHIPPED and treated as the repo-side Phase 1 RC baseline

## Phase Plan

### Phase 1 — Network-disabled Bundled `/app` Launch

Status: DONE (`BLOCKED_ENVIRONMENT`)

- Confirm the bundled app launches offline into `/app`.
- Confirm the default startup remains one normal window with no overlay/control/grid activation.
- Classify the residual directly from real-macOS evidence.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase1-network-disabled-bundled-app-launch.md`
- Classification: `BLOCKED_ENVIRONMENT`

### Phase 2 — Drag-install Launch from `/Applications`

Status: DONE (`BLOCKED_ENVIRONMENT`)

- Use the DMG/install path on real macOS hardware.
- Launch the drag-installed copy from `/Applications`.
- Confirm the same startup contract as the bundled app and classify the result.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase2-drag-install-applications-launch.md`
- Classification: `BLOCKED_ENVIRONMENT`

### Phase 3 — Native Menu Interactions

Status: DONE (`BLOCKED_ENVIRONMENT`)

- Exercise the macOS menu bar directly on the running app.
- Verify `Reveal Config Folder` and `Reset Main Window State`.
- Distinguish repo failures from environment limitations.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase3-native-menu-interactions.md`
- Classification: `BLOCKED_ENVIRONMENT`

### Phase 4 — Relaunch Across Monitor Topology Changes and Final Matrix

Status: DONE (`BLOCKED_ENVIRONMENT`)

- Validate relaunch behavior after a real topology change or documented equivalent hardware scenario.
- Confirm safe restore or fallback-to-default behavior.
- Publish the final four-row residual matrix with no unclassified items remaining.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase4-monitor-topology-relaunch-and-final-matrix.md`
- Classification: `BLOCKED_ENVIRONMENT`

## Review Notes

Verdict: APPROVED. 0 blockers, 2 recommendations.

Findings:

- Discovery is appropriately scoped as a release-smoke evidence feature rather than reopened Phase 1 implementation work. The three options are comparable, the recommendation is justified, and the roadmap hard constraints are preserved.
- `design.md`, `api.md`, and `test.md` stay aligned on the same four residual checks, the same four allowed classifications, the same normal-window/quarantined-overlay boundary, and the same minimal-fix-only escape hatch for reproduced repo defects.
- The plan is executable without architecture drift: no `packages/core/` changes are proposed, no manifest/routing changes are proposed, and no plugin-to-plugin or overlay/control/grid reactivation is introduced.

Recommendations for `feature-build`:

- Record deterministic feature-local evidence filenames as each phase starts so the final matrix can reference stable artifacts under `docs/reviews/desktop-real-macos-release-smoke/`.
- For every manual classification, capture exact artifact provenance and environment conditions used in the smoke step, especially whether the run used freshly built artifacts or previously shipped outputs and what monitor topology/network state was present.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 01:10 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: normalized the roadmap seed into a canonical feature brief, created the discovery review, and initialized the docs quartet for a real-macOS residual smoke gate. The plan keeps the shipped Phase 1 RC gate as the repo-side baseline, maps phases 1:1 to the four remaining hardware checks, and allows code changes only when a manual residual reproduces a public-contract defect. | — | feature-review |
| 2026-05-28 01:14 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — reviewed the brief, discovery, design, API, test, and dev_log artifacts against Workflow V2 gates and roadmap row #1 constraints. Confirmed the plan keeps `desktop-phase1-rc-release-gate` closed as the shipped baseline, limits this row to four real-macOS residual checks, preserves the normal-window plus quarantined overlay/control/grid boundary, and keeps repo blockers separate from environment limitations. Added two build-time recommendations for deterministic evidence filenames and explicit artifact/environment provenance. | — | feature-build |
| 2026-05-28 01:22 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 — created deterministic evidence artifact `20260528-phase1-network-disabled-bundled-app-launch.md`, regenerated fresh desktop artifacts on `dev`, and recorded exact provenance (build/test commands, hashes, mtimes, OS context). Manual residual classification is `BLOCKED_ENVIRONMENT` because this run is non-interactive and cannot provide trustworthy network-disabled GUI route observation. No repo defect reproduced; no product code changes. | `6432a8af` docs(desktop): Phase 1 network-disabled launch evidence | feature-auto-build (Phase 2) |
| 2026-05-28 01:24 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 — created deterministic evidence artifact `20260528-phase2-drag-install-applications-launch.md`, validated DMG mount + payload (`X Desktop.app` plus `Applications` alias), and recorded provenance including DMG hash/mtime. Residual remains `BLOCKED_ENVIRONMENT` because a true Finder drag-install + launch from `/Applications` was not directly observable in this non-interactive session. No repo defect reproduced; no product code changes. | `e5cf2271` docs(desktop): Phase 2 drag-install launch evidence | feature-auto-build (Phase 3) |
| 2026-05-28 01:27 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 — created deterministic evidence artifact `20260528-phase3-native-menu-interactions.md`, executed targeted Rust menu/config seam tests, and captured host config provenance. Residual remains `BLOCKED_ENVIRONMENT` because direct native menu interactions were not performed in this non-interactive session. No repo defect reproduced; no product code changes. | `ac1df100` docs(desktop): Phase 3 native menu interaction evidence | feature-auto-build (Phase 4) |
| 2026-05-28 01:31 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 4 — created deterministic evidence artifact `20260528-phase4-monitor-topology-relaunch-and-final-matrix.md`, ran targeted topology fallback contract tests, and published a final four-residual matrix with no unclassified items. All four residuals are `BLOCKED_ENVIRONMENT` due to missing interactive real-macOS execution conditions; no `BLOCKED_REPO` defect reproduced. | `972687d0` docs(desktop): Phase 4 topology matrix and blocked verdict | feature-auto-build |
