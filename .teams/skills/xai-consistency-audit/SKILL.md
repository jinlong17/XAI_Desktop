---
name: xai-consistency-audit
description: Periodic/triggered consistency audit that keeps real development aligned with the management surface. Runs three check groups — (1) the Web/App/Plugin 3-surface BOUNDARY (越界/归属: plugin implementing native commands, plugin re-doing a Web module, device-local data going to cloud, Web→App bypassing D3, same-name trap, phantom packages), (2) FEATURE reconciliation across code/PRD/dashboard (ghost features, missing features, stale status), (3) skill/workflow REGISTRATION + dashboard snapshot freshness. Detects read-only → emits a report → on confirmation applies record-drift fixes to BOTH docs and the dashboard in one coherent pass so they never diverge. Code violations are report-only; priority/branch/release/ship are needs-operator. Triggers — 边界检查, boundary audit, consistency audit, 一致性检查, 越界检查, 看板和文档对账, 结构图缺 feature, 幽灵 feature, drift audit, feature vs code, 定期检查, post-merge audit, pre-release audit.
---

# xai-consistency-audit

Project-layer **consistency gate**. Use it after a feature ships, after a merge to web, weekly, or before a
release, to answer in one pass: *has real development drifted from the boundary table, the PRD, the
dashboard, or the skill registry — and what is the exact coherent fix?*

This skill is **detect-read-only + apply-on-confirm**. It NEVER writes during detection. Record-drift fixes
(when confirmed) are applied to **docs AND the dashboard together** so the two cannot diverge. It does NOT
fix code (code violations are reported to the feature workflow), and it NEVER auto-changes
priority/branch/release/ship/roadmap (those are `needs-operator`). It reuses existing engines rather than
re-implementing: `xai-module-classify` for boundary scanning, `xai-dev-dashboard-sync` for dashboard writes,
`xai-feature-dossier-sync` for PRD writes, `xai-account-sync-scope-check` for D4, `xai-web-to-desktop-sync`
for D3.

## Read First

- `docs/workflow/project/consistency-checks.json` — THE check table (3 groups, each check's scan/detect/finding_type/action/owning_fix), apply_targets, triggers, report format.
- `docs/MODULE_BOUNDARIES.md` — the human 3-surface boundary (capability table + A/B/C + same-name trap).
- `docs/workflow/project/module-classification.json` — machine taxonomy + `drift_checks` (incl. HR1/HR2/HR5 window_impl_in_plugin / module_redo_in_plugin / d3_bypass).
- `docs/workflow/project/dev-dashboard.md` — dashboard machine contract: what agents may write (links/rows/copy) vs must NOT (priority/branch/release/ship).
- `docs/PLUGIN_MAP.md` (status truth), `docs/PRODUCT_MODULE_MAP.md` (routing), `CLAUDE.md` Agent/Skill Tracking Contract.

## Inputs

```text
/xai-consistency-audit
Mode: report | apply            # default report (read-only). apply = act on a confirmed report.
Scope: full | changed | since <ref>   # default full; "changed"/"since" narrows to a delta
Groups: boundary,feature,registration  # default all three
Report: <path to a prior report when Mode=apply>
```

## The three check groups (run all by default)

1. **Boundary (越界/归属)** — run the `boundary` group of consistency-checks.json (HR1-5 + same_name + syncscope + phantom + frozen + unknown). This is the headline job. Delegate the scan engine to `xai-module-classify` scan mode where a drift_check already exists; apply HR1/HR2/HR5 from module-classification.json.
2. **Feature reconciliation** — for every package on disk and every `dashboard-state.json` `product_lines[].features[]` entry and every PRD §5.x feature: cross-check existence + status agreement. Flag ghost features (dashboard item with no PRD + no package), missing features (package/dev_log SHIPPED with no dashboard/PRD entry), status mismatch (dashboard vs PLUGIN_MAP/dev_log).
3. **Registration + freshness** — new `.teams/skills/*` registered in CLAUDE.md tracking + `.claude/.codex` mirrors + dashboard fixed-skill kpi; snapshot fresh (HEAD == snapshot commit).

## Flow

```
1. detect   [auto, READ-ONLY]   run the 3 groups against consistency-checks.json
2. report   [auto, writes only the report]  -> docs/reviews/<YYYYMMDD>-consistency-audit.md
3. classify each finding: code_violation (report-only) | record_drift (apply-on-confirm) | needs-operator
4. ⏸ STOP for operator confirmation
5. apply (Mode=apply, after confirm): for each record_drift, write ALL apply_targets in ONE pass —
   module-classification.json + MODULE_BOUNDARIES.md + dashboard-state.json features[] (+ CLAUDE.md for registration),
   delegating real writes to the owning skill where one exists. Code violations: leave a routed suggestion only.
```

## Apply targets (record-drift only, on confirm)

- **Boundary record** → `module-classification.json` + `MODULE_BOUNDARIES.md` + dashboard `features[]` (coherent triple).
- **Feature record** → dashboard `features[]` (via xai-dev-dashboard-sync rules) + `MODULE_BOUNDARIES.md §5` + PLUGIN_MAP reference.
- **Registration record** → `CLAUDE.md` Agent/Skill Tracking + `.claude/.codex` mirrors + dashboard kpis fixed-skill count.
- **NEVER auto**: product priority, branch creation, release/ship, roadmap authorization, any dev-line / ADR-0011 reconcile → report `needs-operator`.

## Output (report)

```text
## Consistency Audit — <YYYYMMDD>  (branch <b> @ <commit>)
Verdict: CLEAN | DRIFT_FOUND | NEEDS_OPERATOR | BLOCKED
Scope: <full | changed | since <ref>>   Snapshot fresh?: <HEAD==snapshot? dirty match?>
### Findings
| # | check_id | group | severity | evidence (path:line) | finding_type | owning_fix | action |
### Frozen-line hits (impact-note only)
### Apply plan (on confirm): <one coherent doc+dashboard edit set per record_drift>
### Operator-gated (NEVER auto): <priority/branch/release/ship/roadmap drift>
```

## Boundaries (MUST NOT)

- Do NOT write anything during detection (Mode=report is read-only except the report file).
- Do NOT fix code — code violations (HR1/HR2/HR5) are reported to the feature/app workflow.
- Do NOT auto-change priority/branch/release/ship/roadmap or touch the dev line — `needs-operator`.
- Do NOT land work on frozen lines (plugin/sync PAUSED, site/admin PROPOSED) — impact-note only.
- Do NOT bypass owning skills: dashboard writes go through xai-dev-dashboard-sync's allowed-field rules; PRD via xai-feature-dossier-sync; D4 via xai-account-sync-scope-check; D3 via xai-web-to-desktop-sync.
- On any ambiguous/multi-match classification, STOP and ask the operator.

## Triggers

- **after a feature ships** (dev_log → SHIPPED) → report-only.
- **after merge to web** → `.githooks/post-merge` appends a read-only audit line (after generate-state.mjs).
- **weekly** → `/loop 7d /xai-consistency-audit` or macOS launchd/cron, report-only (no write contention with parallel agents).
- **pre-release** → run as an RC/ship pre-flight; report then confirm before any apply.

> Concurrency note: when the dashboard generator/HTML are being refactored on the same branch, run report-only and defer `apply` (dashboard writes) until that lands — single-writer discipline.
