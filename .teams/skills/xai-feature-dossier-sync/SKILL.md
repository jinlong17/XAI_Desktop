---
name: xai-feature-dossier-sync
description: Reverse-fill and reconcile a feature's product dossier (PRD + traceability) from existing evidence. Use when the user asks 反向补账, 文档追溯, 补 PRD, 追溯审计, feature dossier, backfill product docs, reverse-fill PRD, trace requirement to test, 已做的功能补文档, 把需求记回 PRD, or after several rounds of parallel changes that updated code but not the product spec.
---

# xai-feature-dossier-sync

A **reverse documentation / traceability** skill. It runs AFTER code already
changed (often after several parallel rounds) and asks: *for each user-facing
feature, is there a stable product fact (PRD) and an unbroken chain from
requirement → PRD → design → implementation → test → ship?*

This skill is the reverse counterpart of `xai-feature-brief` (which runs
forward, before work starts).

## Hard Constraints (三铁律 — non-negotiable)

1. **Default mode is `audit` (read-only).** Never write `prd.md` unless mode is
   explicitly `apply`. `audit` and `draft` must not touch any `prd.md`.
2. **Every requirement line MUST carry a `Source:`.** Allowed sources: a
   `dev_log.md` Iteration/Bugfix block, a commit SHA, a `*-feature-brief.md`, a
   `*-discovery-review.md`, a roadmap seed, or a release-log entry. **If no
   source exists, mark it `待确认` and DO NOT invent it.** Reconstructing a
   requirement from source code alone is forbidden — code shows *what was built*,
   not *what was asked for or why*.
3. **This skill never develops.** It does not change `apps/**` or
   `packages/*/src/**`, never edits tests, never "fixes" behavior. It only reads
   evidence and writes documentation under `docs/product/**` and
   `docs/reviews/**`.

## Read First

- `CLAUDE.md` §Documentation Contract / §Product module map & task routing
- `.agents/templates/feature-plan.md` §Increment (how iterations are recorded)
- `docs/PRODUCT_MODULE_MAP.md` (which surface a feature belongs to)
- `docs/workflow/project/release-log.md` (ship-level history)
- the target feature's `packages/<pkg>/docs/{dev_log,design,api,test}.md`
- `docs/reviews/<feature>/*` (brief / discovery / verify artifacts)

## Inputs

```text
Scope:    web | app | plugin | sync | site | admin | project-system  # product/support line
Features: <feature-1>, <feature-2>, ...     # product features, NOT npm packages
Mode:     audit | draft | apply             # default audit
Since:    <git ref>                          # e.g. origin/web~30 (optional)
```

If `Features` is omitted, derive the candidate list from changed paths
(`git status --short` + `git log Since..HEAD`) and the package→feature map below,
then confirm with the user before writing anything in `draft`/`apply`.

## PRD Ownership & Granularity (critical)

- **PRD granularity is a user-facing product feature, NOT an npm package.** One
  feature may span several packages.
  - 仪表盘 (dashboard) = `xai-web-dashboard-grid` + `xai-web-dashboard-widgets`
  - 看板 (board) = `xai-web-board-core` + `board-views` + `board-workspaces`
  - 清单/日历/番茄钟/倒数日/习惯/四象限/冥想/桌宠/AI对话/统计 = one feature each
- **Infrastructure packages do NOT get a PRD.** They keep `design/api/test` only.
  Treat these as infra (no `prd.md`): `xai-web-event-bus`,
  `xai-web-persistence-contract`, `xai-web-tokens-and-i18n`, `xai-web-shell`,
  `xai-web-cmdk`, `plugin-web-storage`, `xai-web-board-core`,
  `xai-web-build-form-adr`, and any package whose surface is a contract/runtime
  rather than a user-perceivable feature. When unsure, ask: *can an end user see
  or trigger this?* If no → infra → no PRD.
- **PRD location (project decision): `docs/product/<feature>/prd.md`** — organized
  by product feature, independent of package layout. Do NOT scatter PRDs into
  `packages/<pkg>/docs/`.

## Modes

| Mode | Writes | Use when |
|---|---|---|
| `audit` (default) | only `docs/reviews/<feature>/<YYYYMMDD>-traceability-audit.md` | first pass; find gaps; zero risk |
| `draft` | audit report + a `prd.draft.md` next to the audit report (NOT in `docs/product/`) | propose PRD content for human review before it becomes canonical |
| `apply` | `docs/product/<feature>/prd.md` (create or append Revision) | after a draft is reviewed/approved |

`apply` must never overwrite an existing PRD body — it **appends** a Revision
History row and updates the Traceability section; existing prose is preserved.

## Workflow

1. Resolve `Scope` + `Features` (use the package→feature map; confirm if derived).
   - `site` is PROPOSED: in `audit`/`draft`, document prototypes and impact notes only
     unless the operator has explicitly activated the line.
   - `admin` is operator-activated but roadmap-gated: production-facing dossiers must
     point at the admin roadmap slice and must not imply live admin writes before gates.
   - `project-system` is for dashboard / workflow / skill governance records, not user-facing
     product PRDs; use it for traceability audits and release-log consistency, not canonical
     customer-feature PRD creation unless a human-facing operator feature exists.
2. For each feature, gather evidence (read-only):
   - `packages/<pkg>/docs/dev_log.md` — every Iteration / Bugfix / Work Log block
   - `docs/reviews/<feature>/*-feature-brief.md`, `*-discovery-review.md`
   - `packages/<pkg>/docs/{design,api,test}.md`
   - `git log [Since..HEAD] -- <feature paths>` — commit subjects + SHAs
   - `docs/workflow/roadmap/*<feature>*.md` — roadmap seeds
   - `docs/workflow/project/release-log.md` — ship entries
3. Extract a requirement list. Each item: `Requirement` + `Source:` (rule #2).
   Items with no traceable source are recorded as `待确认`, never invented.
4. Build the **Traceability Matrix** (below) and compute gaps:
   - requirements present only in `dev_log` / commits but absent from any PRD
   - implementation that drifted from `design.md` / `api.md`
   - acceptance criteria with no covering test ID in `test.md`
   - missing `prd.md` for a user-facing feature
   - ship-level increments missing from `release-log.md`
5. Write output per `Mode`. In `audit`, stop at the report — no PRD writes.
6. Emit the Handoff block.

## Traceability Matrix (core artifact)

For each feature, produce a table:

| Requirement | Source | Implementation | Tests | Doc status |
|---|---|---|---|---|
| 点击任务+可创建卡片 | dev_log Iter-2 / commit 5a1e606 / brief | TasksModule + TaskComposer | T-CR-1..3 | needs PRD entry |
| <requirement> | `待确认` (no source found) | <files> | <none> | gap: no acceptance |

Plus a gap summary: `Missing PRD`, `Requirement-not-in-PRD`,
`Design-drift`, `Acceptance-without-test`, `Ship-not-logged`, each with the
specific evidence path/SHA.

## PRD Schema (what `apply` writes to `docs/product/<feature>/prd.md`)

```markdown
# PRD — <feature display name>

## 1. Overview — why / problem solved
## 2. Target users & core scenarios
## 3. In Scope
## 4. Non-Goals (explicitly not doing)
## 5. Acceptance Criteria (binary, testable; each maps to a test ID)
## 6. Owning modules/packages   <!-- a feature may span multiple packages -->
## 7. Revision History
| Date | Iteration | User-visible change | Source (dev_log/commit/brief) | Acceptance delta |
## 8. Traceability               <!-- link the matrix above -->
```

Each Acceptance Criterion should reference a `test.md` ID; if none exists, flag
it as `Acceptance-without-test` rather than silently asserting coverage.

## Storage Rules

- `audit` report: `docs/reviews/<feature>/<YYYYMMDD>-traceability-audit.md`
- `draft` PRD: `docs/reviews/<feature>/<YYYYMMDD>-prd.draft.md`
- `apply` PRD: `docs/product/<feature>/prd.md` (canonical, long-lived)

Never write canonical PRD content from `audit`/`draft`. Never delete existing
PRD prose in `apply`.

## QA Gate (before finalizing any write)

1. Every requirement row has a real `Source:` or is marked `待确认`.
2. No requirement was reconstructed from source code alone.
3. Mode boundary respected (`audit`/`draft` wrote no `docs/product/**`).
4. Each feature is mapped to the correct product module (`PRODUCT_MODULE_MAP`).
5. Infra packages were excluded from PRD creation.
6. `apply` appended Revision History; it did not rewrite existing PRD prose.
7. Gaps are reported with concrete evidence (path or commit SHA), not vague prose.

If any fails, downgrade to `audit` and report instead of writing.

## Boundary with sibling skills

| Skill | Direction | Timing |
|---|---|---|
| `xai-feature-brief` | forward intake | before work starts |
| **`xai-feature-dossier-sync`** | **reverse backfill + traceability** | **after code changed / before ship** |
| `xai-release-log` | ship-level change notes | after a visible increment ships |
| `xai-dev-dashboard-sync` | cockpit freshness | dashboard refresh |

This skill produces the PRD layer the V2 workflow currently lacks
(`feature-plan` Required Output has no `prd.md`). It does not replace
`feature-plan`/`feature-build`; it reconciles their by-products into a product
fact and a traceable chain.

## Required Output

- `Mode` actually run
- Per-feature Traceability Matrix + gap summary
- Files written (audit report; draft/PRD only in the corresponding mode)
- A `Backfill plan`: which features need a PRD created, which need only a
  Revision-History append, ordered by user-impact
- Items left `待确认` with the question needed to resolve each

## Handoff Rule

End with a Handoff block stating: features audited, mode, gap counts, files
written, and the recommended next action (e.g. "run `apply` for tasks/calendar"
or "answer 待确认 items 1–3 then re-run"). Do not start development from this
skill; route real changes through `feature-plan` / `feature-build` or the
bugfix pipeline.
