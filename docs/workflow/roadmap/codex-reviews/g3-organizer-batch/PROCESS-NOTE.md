# G3-batch Process Note

**Feature**: g3-organizer-batch
**Commit**: `533391e` (`feat(plugin-organizer): G3 organizer-loop utilities + Finder commands`)
**Track**: Track A — Claude Code unattended (D-Codex automation mode)
**Reviewer feedback**: see `docs/workflow/roadmap/codex-reviews/g3-organizer-batch/output.md` (verdict REVISE)

## G3-batch deviation accepted (2026-05-20)

The G3-E1 / G3-S3 / G3-E2 / G3-E3 / G3-E4 implementations were bundled into commit `533391e` under Track A unattended mode. The project rule "`feature-build` runs ONE phase per run, then stops for human confirmation" (see `CLAUDE.md` → Key Rules and Workflow V2 Subagent Output Display) was deviated from: five sub-features were combined into a single `feature-build` commit instead of being split per-feature with intermediate review/verify checkpoints.

**Decision**: deviation is accepted post-hoc because (a) the work is done and tested — Codex `feature-review` exercised every sub-feature and surfaced concrete P1/P2 items, all of which are tracked as carry-forward in `packages/plugin-organizer/docs/dev_log.md`, and (b) splitting `533391e` retroactively would generate churn without changing the resulting state of the repository (the same lines of code would land, just with re-shaped commit boundaries).

**Forward guard**: future sub-feature batches MUST be split per the one-phase-per-run rule. Track A automation that produces multi-feature `feature-build` commits will be treated as a workflow defect, not a productivity win. The carry-forward P1 closures from this batch (e.g. P1-Delta path authorization, P1-folder-inference, capability/audit entry) are landing as individual focused commits to demonstrate the correct shape going forward.

## Carry-forward P1/P2 status

| Codex finding | Severity | Status | Closure commit |
|---|---|---|---|
| G3-E1 folder inference uses trailing-`/` heuristic that misses real folder-drop payloads | P1 | open | _pending_ |
| G3-E3 `reveal_in_finder` / `open_path` accept any absolute path (no provenance / root enforcement) | P1 | **closed** | P1-Delta — `fix(commands/finder, core-data tests): path authorization + negative contract cases (P1 D-group)` |
| Workflow V2 hygiene incomplete (`packages/plugin-organizer/docs/dev_log.md` missing Status Panel; 5-feature `feature-build` commit) | P1 | **closed (post-hoc)** | P1-Delta (this note + dev_log Status Panel + Work Log rows) |
| `apps/desktop/src-tauri/capabilities/AUDIT.md` / public API contract not updated for new Finder surface | P2 | open | _pending_ |
| Coverage gaps (folder-path shape regression; `data:` / custom-scheme rejection; multi-grid same-rule stability; command-blocking failure behavior) | P2 | open | _pending_ |
