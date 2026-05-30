# desktop-real-macos-release-smoke — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-real-macos-release-smoke |
| Title | Real macOS Release Smoke Gate |
| Current Phase | SHIPPED |
| Status | SHIPPED |
| Suggested Next | public-release signing/notarization/updater gate |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | human operator + Codex recorder |
| Updated | 2026-05-29 23:32 PDT |
| Risks | Real macOS release-smoke residuals passed by direct human observation on the local machine: network-disabled launch, `/Applications` launch, native menus, reset/relaunch behavior, and normal-window/no-overlay startup were reported normal. Public release is still gated by placeholder updater credentials and unsigned/notarization-missing packaging evidence. |

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#1`
- Seed: `docs/reviews/desktop-real-macos-release-smoke/20260528-roadmap-seed.md`
- Dependency baseline: `desktop-phase1-rc-release-gate` is already SHIPPED and treated as the repo-side Phase 1 RC baseline

## Phase Plan

### Phase 1 — Network-disabled Bundled `/app` Launch

Status: DONE (`PASS`)

- Confirm the bundled app launches offline into `/app`.
- Confirm the default startup remains one normal window with no overlay/control/grid activation.
- Classify the residual directly from real-macOS evidence.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase1-network-disabled-bundled-app-launch.md`
- Classification: `PASS`

### Phase 2 — Drag-install Launch from `/Applications`

Status: DONE (`PASS`)

- Use the DMG/install path on real macOS hardware.
- Launch the drag-installed copy from `/Applications`.
- Confirm the same startup contract as the bundled app and classify the result.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase2-drag-install-applications-launch.md`
- Classification: `PASS`

### Phase 3 — Native Menu Interactions

Status: DONE (`PASS`)

- Exercise the macOS menu bar directly on the running app.
- Verify `Reveal Config Folder` and `Reset Main Window State`.
- Distinguish repo failures from environment limitations.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase3-native-menu-interactions.md`
- Classification: `PASS`

### Phase 4 — Relaunch Across Monitor Topology Changes and Final Matrix

Status: DONE (`PASS`)

- Validate relaunch behavior after a real topology change or documented equivalent hardware scenario.
- Confirm safe restore or fallback-to-default behavior.
- Publish the final four-row residual matrix with no unclassified items remaining.
- Evidence: `docs/reviews/desktop-real-macos-release-smoke/20260528-phase4-monitor-topology-relaunch-and-final-matrix.md`
- Classification: `PASS`

## Review Notes

Verdict: APPROVED. 0 blockers, 2 recommendations.

Findings:

- Discovery is appropriately scoped as a release-smoke evidence feature rather than reopened Phase 1 implementation work. The three options are comparable, the recommendation is justified, and the roadmap hard constraints are preserved.
- `design.md`, `api.md`, and `test.md` stay aligned on the same four residual checks, the same four allowed classifications, the same normal-window/quarantined-overlay boundary, and the same minimal-fix-only escape hatch for reproduced repo defects.
- The plan is executable without architecture drift: no `packages/core/` changes are proposed, no manifest/routing changes are proposed, and no plugin-to-plugin or overlay/control/grid reactivation is introduced.

Recommendations for `feature-build`:

- Record deterministic feature-local evidence filenames as each phase starts so the final matrix can reference stable artifacts under `docs/reviews/desktop-real-macos-release-smoke/`.
- For every manual classification, capture exact artifact provenance and environment conditions used in the smoke step, especially whether the run used freshly built artifacts or previously shipped outputs and what monitor topology/network state was present.
- Verification update (2026-05-29): reviewed the staged release-readiness repair context plus `docs/audit/2026-05-29-desktop-roadmap-release-readiness-repair-review.md`. Confirmed the repair closes the repo-side plaintext DB blocker and makes DMG/app-data smoke materially stronger, but it does not satisfy this feature's direct-evidence contract for network-disabled launch, Finder drag-install launch, native menu clicks, or monitor-topology relaunch. Public release is also still gated by unsigned/notarized packaging and placeholder updater credentials.
- Manual smoke update (2026-05-29): human operator completed the real macOS checks and reported all required functional residuals normal. Codex observed `/Applications/X Desktop.app` launching as foreground app `com.jinlong.desktop`, local app data present under `$HOME/Library/Application Support/com.jinlong.desktop`, native menu screenshots for `X Desktop`, `File`, and `Window`, and user confirmation that offline launch, reset/relaunch, and remaining checks were normal.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 01:10 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: normalized the roadmap seed into a canonical feature brief, created the discovery review, and initialized the docs quartet for a real-macOS residual smoke gate. The plan keeps the shipped Phase 1 RC gate as the repo-side baseline, maps phases 1:1 to the four remaining hardware checks, and allows code changes only when a manual residual reproduces a public-contract defect. | — | feature-review |
| 2026-05-28 01:14 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — reviewed the brief, discovery, design, API, test, and dev_log artifacts against Workflow V2 gates and roadmap row #1 constraints. Confirmed the plan keeps `desktop-phase1-rc-release-gate` closed as the shipped baseline, limits this row to four real-macOS residual checks, preserves the normal-window plus quarantined overlay/control/grid boundary, and keeps repo blockers separate from environment limitations. Added two build-time recommendations for deterministic evidence filenames and explicit artifact/environment provenance. | — | feature-build |
| 2026-05-28 01:22 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 — created deterministic evidence artifact `20260528-phase1-network-disabled-bundled-app-launch.md`, regenerated fresh desktop artifacts on `dev`, and recorded exact provenance (build/test commands, hashes, mtimes, OS context). Manual residual classification is `BLOCKED_ENVIRONMENT` because this run is non-interactive and cannot provide trustworthy network-disabled GUI route observation. No repo defect reproduced; no product code changes. | `6432a8af` docs(desktop): Phase 1 network-disabled launch evidence | feature-auto-build (Phase 2) |
| 2026-05-28 01:24 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 — created deterministic evidence artifact `20260528-phase2-drag-install-applications-launch.md`, validated DMG mount + payload (`X Desktop.app` plus `Applications` alias), and recorded provenance including DMG hash/mtime. Residual remains `BLOCKED_ENVIRONMENT` because a true Finder drag-install + launch from `/Applications` was not directly observable in this non-interactive session. No repo defect reproduced; no product code changes. | `e5cf2271` docs(desktop): Phase 2 drag-install launch evidence | feature-auto-build (Phase 3) |
| 2026-05-28 01:27 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 — created deterministic evidence artifact `20260528-phase3-native-menu-interactions.md`, executed targeted Rust menu/config seam tests, and captured host config provenance. Residual remains `BLOCKED_ENVIRONMENT` because direct native menu interactions were not performed in this non-interactive session. No repo defect reproduced; no product code changes. | `ac1df100` docs(desktop): Phase 3 native menu interaction evidence | feature-auto-build (Phase 4) |
| 2026-05-28 01:31 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 4 — created deterministic evidence artifact `20260528-phase4-monitor-topology-relaunch-and-final-matrix.md`, ran targeted topology fallback contract tests, and published a final four-residual matrix with no unclassified items. All four residuals are `BLOCKED_ENVIRONMENT` due to missing interactive real-macOS execution conditions; no `BLOCKED_REPO` defect reproduced. | `972687d0` docs(desktop): Phase 4 topology matrix and blocked verdict | feature-auto-build |
| 2026-05-29 18:51 PDT | feature-verify (Codex, gpt-5.4 inline) | Verification BLOCKED. Reviewed row #1 build commits `6432a8af`, `e5cf2271`, `ac1df100`, and `972687d0` for single-intent phase boundaries and commit-body convention, inspected the staged release-readiness repair state, and re-ran focused cheap checks (`git diff --check --cached`, `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto database::tests::keychain_database_kek_roundtrip_uses_32_byte_secret -- --ignored --nocapture`, `pnpm audit --prod --audit-level moderate`). The repair meaningfully improves repo-side RC evidence, but this feature remains blocked because all four real-macOS residuals are still documented as `BLOCKED_ENVIRONMENT` and public-release signing/notarization remains unresolved. | `6432a8af`, `e5cf2271`, `ac1df100`, `972687d0` | feature-build |
| 2026-05-29 19:02 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Fix-mode reassessment against required context and staged repair audits. Determined there is no remaining row-scoped repository/code fix for this feature: unresolved gates are still manual real-macOS GUI residuals (network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, direct native menu interactions, monitor-topology relaunch) plus public-release signing/updater credential readiness outside this row's safe implementation scope. Stopped with `BLOCKED` and preserved prior phase evidence/commits unchanged. | None | feature-auto-build |
| 2026-05-29 21:53 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Re-read required workflow/audit context and revalidated blocker evidence (`packages/desktop-real-macos-release-smoke/docs/dev_log.md`, roadmap row #1, and release-readiness repair review). Confirmed unresolved work remains external/manual only: direct real-macOS GUI PASS evidence for network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, and monitor-topology relaunch. Also confirmed public-release signing/updater prerequisites are still external to this row's safe implementation scope. No repo defect reproduced and no safe row-scoped code/doc fix remained; no tests run in this reassessment. | None | feature-auto-build |
| 2026-05-29 21:57 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Fix-mode continuation against required context (`AGENTS.md`, `CLAUDE.md`, workflow usage guide, roadmap manifest row #1, row dev_log, release-readiness review, release-readiness repair review). Reconfirmed no executable repository phase remains: unresolved checks still require direct real-macOS GUI PASS evidence (network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, monitor-topology relaunch), and public release prerequisites (non-placeholder updater credentials plus codesign/notarization) remain external to this row's safe implementation scope. Stopped with `BLOCKED`; no code changes and no tests run. | None | feature-auto-build |
| 2026-05-29 22:11 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Re-ran required-context fix-mode assessment for this feature only (`AGENTS.md`, `CLAUDE.md`, `docs/workflow/project/usage-guide.md`, roadmap row #1 manifest, row dev_log, release-readiness review, release-readiness repair review). Verified the remaining blockers are still external/manual gates with no row-scoped repo defect to implement: direct real-macOS GUI PASS evidence is missing for network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, and monitor-topology relaunch; public-release prerequisites still require non-placeholder updater credentials plus codesign/notarization evidence. Kept status `BLOCKED`; no code changes and no tests run. | None | feature-auto-build |
| 2026-05-29 22:18 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Executed required-context reassessment for this worker run (`AGENTS.md`, `CLAUDE.md`, `docs/workflow/project/usage-guide.md`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`, row dev_log, `docs/audit/2026-05-29-desktop-roadmap-release-readiness-review.md`, `docs/audit/2026-05-29-desktop-roadmap-release-readiness-repair-review.md`) while preserving parent staged repair state. Confirmed there are still 0 actionable row-scoped PENDING/BLOCKED repo phases in this feature: remaining gates require direct real-macOS GUI PASS evidence for network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, and monitor-topology relaunch; public release prerequisites (non-placeholder updater credentials and signed/notarized packaging evidence) remain external to this row's safe implementation scope. Kept `Status = BLOCKED`; no code changes and no tests run. | None | feature-auto-build |
| 2026-05-29 22:38 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Ran required-context reassessment for `desktop-real-macos-release-smoke` only (`AGENTS.md`, `CLAUDE.md`, `docs/workflow/project/usage-guide.md`, roadmap row #1 manifest, row docs quartet, and both 2026-05-29 release-readiness audits) while preserving all staged parent-session repairs. No new row-scoped repository defect or executable phase emerged: unresolved gates still require direct real-macOS GUI `PASS` evidence for network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, and monitor-topology relaunch; public-release prerequisites (non-placeholder updater credentials plus signed/notarized packaging evidence) remain external to this row's safe implementation scope. Kept `Status = BLOCKED`; no code changes and no tests run. | None | feature-auto-build |
| 2026-05-29 22:43 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Executed this run's required-context reassessment (`AGENTS.md`, `CLAUDE.md`, `docs/workflow/project/usage-guide.md`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`, row docs quartet, and both 2026-05-29 release-readiness audits). Confirmed there are still no actionable row-scoped PENDING/BLOCKED implementation phases: all remaining blockers require direct real-macOS GUI `PASS` evidence (network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, monitor-topology relaunch), and public-release signing/notarization plus non-placeholder updater credentials remain external to this row's safe repo scope. Kept `Status = BLOCKED`; no code changes and no tests run. | None | feature-auto-build |
| 2026-05-29 22:53 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Executed the requested `desktop-real-macos-release-smoke` auto-build reassessment with required context (`AGENTS.md`, `CLAUDE.md`, `docs/workflow/project/usage-guide.md`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`, row docs quartet, `docs/audit/2026-05-29-desktop-roadmap-release-readiness-review.md`, and `docs/audit/2026-05-29-desktop-roadmap-release-readiness-repair-review.md`) while preserving the parent-session staged repair state. Confirmed there are still no safe row-scoped implementation phases or reproducible repo defects to fix: unresolved gates remain direct real-macOS GUI `PASS` evidence for network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, and monitor-topology relaunch; public-release prerequisites (non-placeholder updater credentials and signed/notarized packaging evidence) remain external to this row's safe repo scope. Kept `Status = BLOCKED`; no code changes and no tests run. | None | feature-auto-build |
| 2026-05-29 22:57 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Completed exactly one additional reassessment run against the required context (`AGENTS.md`, `CLAUDE.md`, `docs/workflow/project/usage-guide.md`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`, row docs quartet, and both 2026-05-29 release-readiness audits) while preserving all staged parent-session repairs. Result remained unchanged: no actionable row-scoped PENDING/BLOCKED repository phase and no reproducible row-scoped defect. Remaining blockers are still external/manual real-macOS GUI `PASS` evidence for network-disabled bundled `/app` launch, Finder drag-install launch from `/Applications`, native menu interactions, and monitor-topology relaunch, plus public-release signing/notarization and non-placeholder updater credentials outside this row's safe scope. Enforced max-3-retries principle: further auto-reassessments without new external evidence are not meaningful. Kept `Status = BLOCKED`; no code changes and no tests run. | None | feature-auto-build |
| 2026-05-29 23:32 PDT | human operator + Codex recorder | Manual real macOS smoke closed the row: launched from `/Applications/X Desktop.app`, confirmed foreground LaunchServices registration, normal app window/menu behavior, `Window -> Reset Main Window State` plus relaunch, offline launch, and no overlay/control/grid auto-start. User reported all functional checks normal. Public-release signing/notarization and real updater credentials remain downstream release gates, not row-scoped functional blockers. | manual evidence recorded in this commit | public-release gate |
