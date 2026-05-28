# desktop-phase1-rc-release-gate — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-phase1-rc-release-gate |
| Title | Phase 1 Desktop RC Release Gate |
| Current Phase | FEATURE_VERIFY |
| Status | READY_TO_SHIP |
| Suggested Next | ship |
| Executor | feature-verify (Codex, gpt-5.4 inline) |
| Updated | 2026-05-28 00:42 PDT |
| Risks | No repo-side Phase 1 RC blocker reproduced in verify. Residual real-macOS GUI verification remains limited to network-disabled `/app` launch, drag-install launch from `/Applications`, and interactive menu/config reset/relaunch checks on hardware. |

## Review Notes

Verdict: APPROVED. 0 blockers, 2 non-blocking observations.

Findings:

- Discovery is comparable across three options (A/B/C) with recommendation justified; blocker-first ordering (DMG -> offline launch -> menu/config -> degradation+verdict) matches the integrated RC-gate requirement.
- design.md frozen assumptions, dependency overview, and four implementation phases align with the discovery recommendation and ADR-0011 Phase 1 boundaries; quarantined overlay/control/grid scope is preserved.
- api.md correctly treats this as an evidence/verification contract (not a new business API), names the four classification states (PASS / BLOCKED_REPO / BLOCKED_ENVIRONMENT / DEFERRED_OUT_OF_SCOPE), and forbids Phase 2/3 widening and capability widening.
- test.md covers DMG reproduction, `.app` + `.dmg` offline launch, single normal-window startup (no overlay/control/grid), native menu + host config persistence across relaunch, and the five online-only surfaces (AI / map / integrations / premium / account-delete + OAuth/Stripe callbacks). Manual macOS checks and mock strategy are explicit.
- dev_log.md initialized with Workflow / Target / Current Phase / Status / Suggested Next / Executor / Updated / Risks / Phase Plan / Work Log; four phases PLANNED with consistent numbering across all four docs.
- No SYSTEM_ARCHITECTURE red-line conflicts: no `packages/core/` changes, no manifest routing changes, no cross-plugin direct imports, no overlay reactivation. ADR-0011 §D1 Phase 1 scope respected; Phase 2/3 explicitly excluded.

Non-blocking observations (do not require revision; surface during build if encountered):

- N1: `test.md` references `apps/desktop/src-tauri/target/debug/bundle/...` for both `.app` and `.dmg` outputs, mirroring the upstream packaging-pipeline evidence. If Phase 1 surfaces a need for `target/release/...` for a real RC artifact, that becomes a Phase 1 R1 sub-finding rather than a planning defect.
- N2: The four PLANNED phases live under `## Phase Plan` rather than a dedicated `Phase Progress` heading. This satisfies the template intent; feature-build may rename the heading on first run if desired.

## Verification Notes

Verdict: PASS. Independent verify reran the repo-side Phase 1 RC matrix successfully and found no repo-side blocker on packaging, startup shape, config persistence contract, or offline-surface degradation.

Checks rerun in this verify pass:

- `pnpm --filter @repo/plugin-web-tokens test` -> PASS (51/51)
- `pnpm --filter @repo/web test -- src/routes/router.integration.test.tsx src/providers/AppProviders.test.tsx` -> PASS (9/9)
- `pnpm --filter @repo/web build` -> PASS
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS (60/60)
- `pnpm --filter desktop build` -> PASS
- `pnpm --filter desktop build:dmg` -> PASS
- `hdiutil attach .../X Desktop_1.0.0-rc.1_aarch64.dmg` + `ls -la /Volumes/X Desktop` -> PASS (`X Desktop.app` + `Applications` link present)
- `apps/desktop/src-tauri/target/debug/desktop` startup probe -> PASS (`Main window configured for standard app behavior`)
- `pnpm --filter @repo/plugin-web-ai-chat test -- src/__tests__/claudeStreamAdapter.test.ts src/__tests__/secretStore.test.ts` -> PASS (20/20)
- `pnpm --filter @repo/plugin-web-board-views test -- src/__tests__/MapView.test.tsx` -> PASS (16/16, existing React `act(...)` warnings only)
- `pnpm --filter @repo/plugin-web-settings-rest test -- ...` -> PASS (97/97, existing `act(async ...)` warning only)
- `pnpm --filter @repo/web-auth-device-session test -- src/guards.test.ts src/device-transport.test.ts src/auth-actions.test.ts` -> PASS (20/20)

Commit review:

- `5c8e8849` was reviewed as a pre-phase implementation fix for desktop offline-root launch and token CSS side effects. Focused tests and build outputs re-passed in this verify run, so the change is consistent with Phase 1 RC scope.
- `d978bb76`, `578c9efa`, `e72a2c7e`, `f689c44b`, and `41eadac9` stay within their declared docs/state-write intents and preserve phase ordering.
- The previously reported DMG stall did not reproduce: this verify run emitted `apps/desktop/src-tauri/target/debug/bundle/dmg/X Desktop_1.0.0-rc.1_aarch64.dmg` and mounted it successfully.
- Remaining manual gaps are unchanged from plan scope and are carried as residual ship risks rather than repo blockers.

## Phase Plan

### Phase 1 — DMG Reproduction and Blocker Classification

Status: DONE (2026-05-28, commit `d978bb76`).

- Re-run `pnpm --filter desktop build:dmg` as the first RC gate item.
- If the `.dmg` failure is repo-side, fix only the minimal packaging issue required for Phase 1.
- If the stall still occurs after `Running bundle_dmg.sh` / `osascript` while `.app` already exists, record it as blocker item R1 with exact evidence and classification.

### Phase 2 — Integrated App/Installer Offline Launch Gate

Status: DONE (2026-05-28, commit `578c9efa`).

- Verify `.app` output remains good and launches offline into `/app`.
- If a `.dmg` is produced, mount, drag-install, and launch once from the installed copy.
- Confirm the default runtime remains one normal main window with no overlay/control/grid startup.

### Phase 3 — Native Menu and Config Persistence Gate

Status: DONE (2026-05-28, commit `e72a2c7e`).

- Exercise the native menu and practical support items on the active Phase 1 app.
- Verify host config persistence across relaunch, including reset behavior.
- Keep scope limited to the current main-window shell.

### Phase 4 — Online-only Surface Degradation and Final RC Verdict

Status: DONE (2026-05-28, commit `f689c44b`).

- Verify offline AI/map/integrations/premium/account-delete behavior in the integrated desktop app.
- Apply only targeted blocker fixes if shipped offline gates prove incomplete.
- Publish a consolidated RC verification matrix plus blocker/risk register with a clear verdict.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 00:01 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the Step 0 brief, discovery review, and docs quartet for the integrated Phase 1 desktop RC gate. Anchored the plan on the five already-shipped first-wave features, made DMG reproduction/classification the first blocker item, and scoped the remaining RC work to offline launch, normal-window startup, native menu/config persistence, and offline degradation of online-only panels. | — | feature-review |
| 2026-05-28 00:18 PDT | feature-review (Claude Opus 4.7) | Reviewed brief + discovery + design + api + test + dev_log against Workflow V2 gates. Verdict APPROVED with 0 blockers and 2 non-blocking observations (N1 debug vs. release bundle path, N2 Phase Progress heading naming). Discovery options comparable; blocker-first ordering justified; ADR-0011 Phase 1 boundaries preserved; no SYSTEM_ARCHITECTURE red-line conflicts. | — | feature-build |
| 2026-05-28 00:24 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 1 complete: reran `pnpm --filter desktop build:dmg`, observed bundling complete with final DMG artifact emitted, and recorded reproduction evidence at `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase1-dmg-reproduction.md`. Classification updated from prior risk baseline to `PASS` for R1 in this run. | `d978bb76` | feature-auto-build (Phase 2) |
| 2026-05-28 00:26 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 2 complete: validated `.app` bundling (`pnpm --filter desktop build`), mounted/inspected DMG payload (`X Desktop.app` + `Applications` link), and captured standard-window startup probe output (`Main window configured for standard app behavior`). Wrote integrated evidence at `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase2-app-installer-offline-gate.md`; interactive network-disabled `/app` route check and drag-install launch are explicitly deferred to verify/manual macOS gate. | `578c9efa` | feature-auto-build (Phase 3) |
| 2026-05-28 00:28 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 3 complete: ran `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` (60 passed) and captured menu/config-focused contract evidence plus live host config snapshot from `~/Library/Application Support/com.jinlong.desktop/app-config.json`. Added Phase 3 evidence doc `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase3-menu-config-persistence-gate.md`; interactive menu/reveal/reset verification remains deferred to manual verify gate. | `e72a2c7e` | feature-auto-build (Phase 4) |
| 2026-05-28 00:31 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 4 complete: consolidated offline degradation evidence across AI/map/integrations/premium/OAuth/Stripe/account-delete surfaces and produced one RC matrix + risk register at `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase4-offline-degradation-rc-verdict.md`. Automated checks passed (`@repo/web` build, desktop build/dmg, targeted web/plugin/auth test suites). No repo-side blocker reproduced; residual checks are manual GUI items for `feature-verify`. | `f689c44b` | feature-verify |
| 2026-05-28 00:42 PDT | feature-verify (Codex, gpt-5.4 inline) | Independent verify reran the repo-side RC matrix, reviewed commits `5c8e8849` + `d978bb76` + `578c9efa` + `e72a2c7e` + `f689c44b` + `41eadac9`, and confirmed the prior DMG stall no longer reproduces. Desktop build, DMG build, startup probe, mount inspection, Rust tests, and targeted offline-surface suites all passed again; only real-macOS GUI launch/install/menu interactions remain residual ship risks. | `5c8e8849`, `d978bb76`, `578c9efa`, `e72a2c7e`, `f689c44b`, `41eadac9` | ship |
