---
name: xai-sync-fanout-dispatch
description: After a core module is finished, classify the delta against docs/workflow/project/sync-registry.json semantic rules, decide which cross-module sync actions fire, order them into parallel/serial waves, and emit a dispatch plan (one copy-paste prompt per action, or a worktree/spawn plan). The single entry point for "Web 版本功能已完成，执行后续同步 workflow". Plan/route-only — it does not run D3/D4/brief/release/dashboard logic itself or write source; it hands each action to its owning skill. Triggers — sync fanout, dispatch downstream sync, 完成模块后同步, 扇出同步 workflow, which modules to sync, cross-module sync dispatch.
---

# xai-sync-fanout-dispatch

Project-layer **orchestration entry point** for ADR-0014 (Cross-Module Sync Orchestration).
Use this after finishing a core module (typically Web) to answer, in one shot: *which downstream
sync actions fire, in what order, and what is the exact prompt for each?*

This skill is a **classifier + planner/router only**. It does not itself run the D3 gate, the D4
check, a brief, a release-log append, or a dashboard regen, and it never writes product source. It
reads the registry, matches semantic rules, computes waves, and emits a dispatch plan that hands each
action to its owning skill. Execution happens in the per-action skills (in separate worktrees/windows
or spawned subagents).

## Read First

- `docs/workflow/project/sync-registry.json` — THE rule source (`actions`, `rules`, `file_ownership`, `dispatch`, `governance`)
- `docs/adr/0014-cross-module-sync-orchestration.md` — the decision + v1 rollout this dispatcher serves
- `docs/adr/0013-branch-sync-governance.md` — D2/D3/D4 governance hard rules
- `docs/PRODUCT_MODULE_MAP.md` — six-module routing + §维护 mirror contract
- `CLAUDE.md` Agent / Skill Tracking Contract; `AGENTS.md` Workflow V2 Handoff Display rules

## Inputs

```text
/xai-sync-fanout-dispatch
Source delta: <commit | range | PR | changed paths | "since last ship" | surface summary>
Mode: plan | dispatch
```

Natural-language trigger (equivalent): "Web 版本功能已完成，执行后续同步 workflow"
(同理可用于其它模块完成后的扇出)。If `Source delta:` is omitted, infer from `HEAD`, the current
branch diff vs `origin/web`, or named files. If it is ambiguous which actions fire, list the
candidates and ask — do not guess silently.

## Hard Constraints

1. **Plan/route-only.** Hand each fired action to its owning skill (see registry `actions[].skill`).
   Do not run the action logic inline and do not write product source.
2. **Honor `governance.hard_rules`.** `web→app` only via the D3 gate (never merge web into `dev`);
   frozen lines (`site` PROPOSED, `sync`/`plugin` P2 PAUSED) get receipt/draft actions only; admin is operator-activated but roadmap-gated and must route through its roadmap slices;
   creating `desktop-next`/`desktop-plugin-next`/`release/*` and any `dev` touch or line unfreeze are
   operator-confirmed steps that go in the operator-gated section, NOT a parallel wave.
3. **Single-writer waves.** Use registry `file_ownership[]`: never place two actions that write the
   same owned file in the same wave. The close-out action `release_and_dashboard_sync` always lands
   in the final wave, after every action that affects routing / release / dashboard / skill-surface.
4. **Semantic, not graph-magic.** Match via registry `rules[]` (changed paths + keywords +
   entityType/syncScope diff). Do not rely on `turbo --affected` as the only signal and do not
   fabricate a `web→sync` workspace dependency.
5. **Evidence-based.** Base rule matches on real changed paths / diff. If the delta cannot be
   resolved, stop with `Verdict: BLOCKED`.

## Dispatch Workflow

1. Resolve the source delta and extract signals:
   - changed paths: `git show --name-status <commit>` / `git diff --name-status <base>...<head>` / `git status --short`;
   - keywords in the diff/summary; `entityType` / `syncScope` additions or changes
     (`git diff <base>...<head> -- '*entities.ts' '*/types.ts' '*sync-outbox.ts'`).
2. Load `sync-registry.json` `rules[]`. For each rule, test `when_path` (glob), `and_diff_contains`,
   `or_keyword`, `when_event`. Collect the set of fired `fire` action ids (dedupe).
3. For each fired action, read its registry entry: `skill`, `output`, `parallel_safe`, `depends_on`,
   and its owned file(s) from `file_ownership[]`.
4. Compute waves:
   - topologically sort by `depends_on`;
   - within a wave, split any two actions that share a file owner into different waves;
   - put `release_and_dashboard_sync` in the final wave.
5. Emit the **Dispatch Plan** (format below): per fired action give the owning skill, a ready
   copy-paste prompt, the suggested worktree + short branch (`codex/<line>/<feature>`), the output
   artifact path, and its wave. In `dispatch` mode on a platform with subagent spawn, you MAY spawn
   one worktree-pinned subagent per parallel action in the current wave; otherwise emit the prompts
   for the operator's separate windows. List operator-gated items separately.

## Per-Action Prompt Templates (hand-off targets)

| Action id | Owning skill | Copy-paste prompt |
|---|---|---|
| `d3_web_to_desktop` | xai-web-to-desktop-sync | `/xai-web-to-desktop-sync`\n`Web delta: <delta>`\n`Mode: gate` |
| `web_deploy_preflight` | xai-web-deploy-preflight | `/xai-web-deploy-preflight`\n`Web delta: <delta>`\n`Target: preview | production | manual`\n`Mode: gate` |
| `desktop_release_gate` | xai-desktop-release-gate | `/xai-desktop-release-gate`\n`Desktop delta: <delta or D3 receipt>`\n`Release target: dev-rc | release/desktop/<version> | updater-handoff | site-download-handoff`\n`Mode: gate` |
| `d4_account_sync_scope_check` | xai-account-sync-scope-check | `/xai-account-sync-scope-check`\n`Entity delta: <delta>`\n`Mode: gate` |
| `frozen_line_impact_brief` | xai-feature-brief | `/xai-feature-brief` + `<line> impact note for <delta> (frozen line — brief/draft only)` |
| `release_and_dashboard_sync` | xai-release-log → xai-dev-dashboard-sync | `/xai-release-log` (append) then `/xai-dev-dashboard-sync` (regen + mirror lint) |

## Output Format

```text
Sync Fanout Dispatch Plan
  Verdict:        DISPATCH | NOTHING_FIRED | BLOCKED
  Source delta:   <commits / paths / summary>
  Signals:        paths=<globs hit>  keywords=<...>  entity-diff=<entityType/syncScope changes | none>
  Fired actions:  <action ids, or "none">
  Waves:
    Wave 1 (parallel, disjoint owners):
      - <action id> | skill: <skill> | worktree: ../xai-<line> codex/<line>/<feature> | out: <artifact>
        prompt: <copy-paste prompt>
      - ...
    Wave 2 (...):
      - ...
    Wave N (close-out): release_and_dashboard_sync | release-log append + dashboard regen
  Operator-gated (NOT auto-run): <create desktop-next | touch dev | unfreeze sync/plugin | merge to dev | none>
  Converge:       integration/web-sync-<date> → full check-types+lint+test → operator reconcile into main (ADR-0013 §D5)
  Next:           <run Wave 1 prompts | resolve ambiguity | nothing to sync>
```

If executed as a Workflow V2 spawned agent, wrap only this plan in the required `## Handoff` block and
do not append a conversational follow-up after it.
