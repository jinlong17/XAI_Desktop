# Consistency Audit — 2026-06-02 (branch `web` @ first run)

> Produced by `xai-consistency-audit` (Mode: report, read-only). Rules: `docs/workflow/project/consistency-checks.json` + `module-classification.json` drift_checks.
> This is the inaugural run — it doubles as the skill's validation. **No writes were made** beyond this report.

**Verdict: DRIFT_FOUND** (6 record-drift findings; 0 blockers; boundary code-scan deferred)
**Scope:** full repo · **Snapshot fresh?:** dashboard generator/HTML are mid-refactor by a parallel agent → `apply` deferred (single-writer discipline).

## Findings

| # | check_id | group | sev | evidence | finding_type | owning_fix | action |
|---|---|---|---|---|---|---|---|
| 1 | feat_status_mismatch | ② feature | DRIFT | `packages/plugin-web-time-tracker/docs/dev_log.md` = **READY_TO_SHIP** vs `dashboard-state.json` web features「时间追踪 Time Tracker」= **in-dev** | record_drift | xai-dev-dashboard-sync | confirm→apply (dashboard) |
| 2 | feat_ghost | ② feature | DRIFT | `dashboard-state.json:773` plugin「快速记账 / 快速时间追踪挂件」(proposed) — **no PRD, no package** | record_drift | xai-dev-dashboard-sync | confirm→apply (remove or mark unspecced) |
| 3 | feat_ghost | ② feature | DRIFT | `dashboard-state.json` web「记账 Accounting」(proposed) — **no PRD, no package** (`plugin-account` = auth, not 记账) | record_drift | xai-dev-dashboard-sync | confirm→apply |
| 4 | fresh_snapshot_stale | ③ registration | DRIFT | `dashboard-state.json:68` kpis「固定 skill」= **10** vs real `.teams/skills/*` = **12** | record_drift | xai-dev-dashboard-sync | confirm→apply (kpis count) |
| 5 | reg_skill_unregistered | ③ registration | INFO | `xai-module-classify` — **0 hits** in CLAUDE.md Agent/Skill Tracking | record_drift | self (CLAUDE.md) | confirm→apply (doc, clean) |
| 6 | reg_skill_unregistered | ③ registration | INFO | `xai-consistency-audit` — not yet in CLAUDE.md tracking (added this session) | record_drift | self (CLAUDE.md) | confirm→apply (doc, clean) |

## Boundary group (①) — this pass

- `bnd_phantom_package`: `plugin-meditation`, `plugin-settings` — **already annotated** Planned-no-package this session (PLUGIN_MAP/CLAUDE.md/MODULE_BOUNDARIES). ✅ resolved.
- `bnd_same_name`: pet/widgets/grid/dashboard — disambiguated in MODULE_BOUNDARIES §4 + dashboard features (web pet tagged「网页内 DOM」). ✅ ok.
- `bnd_window_impl_in_plugin` (HR1) / `bnd_module_redo_in_plugin` (HR2) / `bnd_d3_bypass` (HR5): **deep code scan deferred** — these need scanning `packages/plugin-*/src` + `git log web..dev`; out of scope for this MVP record-drift pass. Run a full boundary scan via `xai-module-classify` scan when the plugin line unfreezes.

## Frozen-line hits (impact-note only)
- plugin / sync = P2 PAUSED; site / admin = PROPOSED. Findings #2 (plugin ghost) is on a frozen line → impact-note only, but a ghost record can be cleaned without unfreezing the line (it's a dashboard record, not source).

## Apply plan (on confirm)
- **Clean now (docs only, no concurrency risk):** #5 + #6 → register `xai-module-classify` + `xai-consistency-audit` in CLAUDE.md Agent/Skill Tracking.
- **Deferred until the parallel dashboard refactor lands (writes `dashboard-state.json`):** #1 (time-tracker → ready/shipped), #2 + #3 (remove ghost features), #4 (kpis 10→12). Route via `xai-dev-dashboard-sync`.

## Operator-gated (NEVER auto)
- None this pass. (No priority/branch/release/ship/roadmap drift detected.)

## Notes
- This run validates the skill end-to-end: it found a genuine status-mismatch (time-tracker further along than the board shows), two ghost features the operator created during the dashboard build, a stale skill count, and two unregistered skills — exactly the "real dev ↔ management surface" drift the audit exists to catch.
