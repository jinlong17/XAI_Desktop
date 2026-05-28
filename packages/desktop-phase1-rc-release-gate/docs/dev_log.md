# desktop-phase1-rc-release-gate — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-phase1-rc-release-gate |
| Title | Phase 1 Desktop RC Release Gate |
| Current Phase | FEATURE_BUILD |
| Status | APPROVED |
| Suggested Next | feature-auto-build |
| Executor | feature-auto-build (Codex, gpt-5.3-codex) |
| Updated | 2026-05-28 00:26 PDT |
| Risks | DMG packaging and DMG mount payload checks succeeded in this run, but network-disabled GUI `/app` launch, drag-install launch from `/Applications`, native menu/config persistence interaction, and consolidated offline degradation evidence still need closure before verify; Phase 2/3 scope creep must remain excluded. |

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

## Phase Plan

### Phase 1 — DMG Reproduction and Blocker Classification

Status: DONE (2026-05-28, commit `d978bb76`).

- Re-run `pnpm --filter desktop build:dmg` as the first RC gate item.
- If the `.dmg` failure is repo-side, fix only the minimal packaging issue required for Phase 1.
- If the stall still occurs after `Running bundle_dmg.sh` / `osascript` while `.app` already exists, record it as blocker item R1 with exact evidence and classification.

### Phase 2 — Integrated App/Installer Offline Launch Gate

Status: DONE (2026-05-28, commit pending writeback).

- Verify `.app` output remains good and launches offline into `/app`.
- If a `.dmg` is produced, mount, drag-install, and launch once from the installed copy.
- Confirm the default runtime remains one normal main window with no overlay/control/grid startup.

### Phase 3 — Native Menu and Config Persistence Gate

Status: PLANNED.

- Exercise the native menu and practical support items on the active Phase 1 app.
- Verify host config persistence across relaunch, including reset behavior.
- Keep scope limited to the current main-window shell.

### Phase 4 — Online-only Surface Degradation and Final RC Verdict

Status: PLANNED.

- Verify offline AI/map/integrations/premium/account-delete behavior in the integrated desktop app.
- Apply only targeted blocker fixes if shipped offline gates prove incomplete.
- Publish a consolidated RC verification matrix plus blocker/risk register with a clear verdict.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 00:01 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the Step 0 brief, discovery review, and docs quartet for the integrated Phase 1 desktop RC gate. Anchored the plan on the five already-shipped first-wave features, made DMG reproduction/classification the first blocker item, and scoped the remaining RC work to offline launch, normal-window startup, native menu/config persistence, and offline degradation of online-only panels. | — | feature-review |
| 2026-05-28 00:18 PDT | feature-review (Claude Opus 4.7) | Reviewed brief + discovery + design + api + test + dev_log against Workflow V2 gates. Verdict APPROVED with 0 blockers and 2 non-blocking observations (N1 debug vs. release bundle path, N2 Phase Progress heading naming). Discovery options comparable; blocker-first ordering justified; ADR-0011 Phase 1 boundaries preserved; no SYSTEM_ARCHITECTURE red-line conflicts. | — | feature-build |
| 2026-05-28 00:24 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 1 complete: reran `pnpm --filter desktop build:dmg`, observed bundling complete with final DMG artifact emitted, and recorded reproduction evidence at `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase1-dmg-reproduction.md`. Classification updated from prior risk baseline to `PASS` for R1 in this run. | `d978bb76` | feature-auto-build (Phase 2) |
| 2026-05-28 00:26 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 2 complete: validated `.app` bundling (`pnpm --filter desktop build`), mounted/inspected DMG payload (`X Desktop.app` + `Applications` link), and captured standard-window startup probe output (`Main window configured for standard app behavior`). Wrote integrated evidence at `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase2-app-installer-offline-gate.md`; interactive network-disabled `/app` route check and drag-install launch are explicitly deferred to verify/manual macOS gate. | pending writeback (this commit) | feature-auto-build (Phase 3) |
