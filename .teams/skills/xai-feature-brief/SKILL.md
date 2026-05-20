---
name: xai-feature-brief
description: Normalize feature ideas into a structured, QA-gated brief before discovery or feature-plan. Use when user asks 需求规范化, feature brief, intake, requirement brief, 需求整理, 需求澄清, before feature-plan, or when a new feature/extension/refactor idea needs structured classification, dependency scanning, mock strategy guidance, and a planner handoff.
---

# xai-feature-brief

## Read First

- `docs/workflow/_portable/03-step0-brief-spec.md` (portable spec — until a project-layer
  `STEP0-brief-spec.project.md` is authored, this is the canonical brief schema)
- `docs/workflow/SUBAGENT_WORKFLOW_V2.md`
- `docs/workflow/SOP_NEW_FEATURE.md` (when present; project-layer SOP is on the post-instantiate
  checklist)
- `docs/PLUGIN_MAP.md`
- `CLAUDE.md` §Architecture / §Code Boundaries / §Documentation Contract
- `docs/adr/0003-three-faces-architecture.md`

## Purpose

Use this skill to run **Step 0 Requirement Brief Normalization**.

This skill does **not** produce the implementation plan. It produces:

- a standardized feature brief
- open questions / unknowns
- an ADR-lite trigger decision when needed
- a copy-paste-ready planner handoff

Step 0 is the input gate **before** discovery / planning:

- V2 subagent path:
  - `Idea -> Step 0 -> feature-plan -> feature-review -> ...`
- Future skill path (when XAI's discovery / planning skills exist):
  - `Idea -> Step 0 -> xai-new-feature-discovery -> xai-feature-planning -> ...`

## Execution Rules

1. Start from the user's freeform idea, not from a preformatted template.
2. Run the intake in **2 to 3 rounds**, not one giant questionnaire:
   - Round 1: main classification questions
   - Round 2: conditional follow-up questions based on selected layers / change type / risk
   - Round 3: only if QA detects hard gaps that require 补答
3. Use `AskUserQuestion` for Round 1 classification and Round 2 conditional follow-up whenever possible, so each option can be presented with a short inline explanation.
4. Every classification option should be explained briefly in plain language while asking.
5. When the user is unsure, prefer offering a small set of suggested options instead of asking only open-ended questions.
6. Read `docs/PLUGIN_MAP.md` before finalizing dependency assumptions; only Stable / Production
   plugins may be depended on directly — In-Dev / Migrating plugins must be mocked.
7. Never invent confirmed facts. Unknown items must be marked `待确认`.

## Session Mode

This skill is intentionally **single-session**.

Unlike discovery or planning, Step 0 intake does not require cross-executor validation. The combination of:

- structured multi-round intake
- AI self-check
- QA Gate

is the primary quality control mechanism for this step.

## Workflow

1. Capture the raw idea:
   - problem / motivation
   - desired outcome
   - rough scope or constraints if already known
2. Run Round 1 classification:
   - `Architecture Kind` — which of the three faces (host shell / core / plugin slice) is touched
   - `User Surface` — desktop overlay / control window / grid window / settings / API only
   - `Change Type` — new feature / extension / refactor / bug fix
   - `Impacted Layers` — `apps/desktop/src/` (host) / `apps/desktop/src-tauri/` (Rust backend) / `packages/core/` (infra) / `packages/plugin-*` (business slice) / `packages/ui/` (shared UI)
   - `Target Plugin State` when extending — Stable / Production / In-Dev / Migrating
   - `Risk Level` — multi-window, macOS native APIs, persistence schema changes raise this
3. Run Round 2 conditional follow-up questions only for hit dimensions.
4. Scan dependencies and constraints using:
   - `docs/PLUGIN_MAP.md`
   - relevant plugin docs (`packages/plugin-<name>/docs/`) when needed
   - `apps/desktop/src-tauri/` Rust modules when touching native code
5. Explain mock strategy options if dependencies are not `Stable` / `Production`:
   - `No Mock`
   - `Static Mock`
   - `Contract Mock`
   - `Feature Flag Fallback`
   - `Deferred Integration`
6. Expand the answers into a full `Structured Brief`.
7. Run a self-QA pass against the QA Gate below.
8. If there are hard blockers or missing required inputs, ask only the minimum follow-up questions needed to close them.
9. Determine final output status:
   - `READY_FOR_DISCOVERY`
   - `READY_FOR_FEATURE_PLAN`
   - `BLOCKED`
10. Write the final brief to the review path defined by the storage rules below.
11. Produce the final output package:
    - `Structured Brief`
    - `Open Questions / Unknowns`
    - `ADR-lite Trigger`
    - `Planner Handoff`
    - saved brief path

## Storage Rules

The skill should write the final brief directly. Do not leave storage as a manual follow-up for the developer.

Default storage target for the final brief:

- `docs/reviews/<feature>/<YYYYMMDD>-feature-brief.md`

If canonical feature name is not yet stable:

- `docs/reviews/_intake/<YYYYMMDD>-<topic>-feature-brief.md`

Do not write discovery review content here. `*-feature-brief.md` and `*-discovery-review.md` may coexist in the same review directory, but they serve different purposes.

> XAI naming convention: plugin slices use `plugin-<name>` (e.g. `plugin-organizer`,
> `plugin-launcher`). The `<feature>` slug for a plugin slice = the full `plugin-<name>` string.

## QA Gate

Before finalizing, verify at least:

1. Problem is explicit.
2. User / actor is explicit.
3. Scope and non-goals are explicit.
4. Chosen classifications and described details are consistent.
5. Dependency states are checked against `PLUGIN_MAP.md`.
6. Data / permission / security impact is addressed when applicable (macOS Accessibility,
   ScreenCapture, FullDiskAccess prompts; persistence schema changes; cross-window state).
7. Release strategy is addressed when applicable (dual-track per `0002-dual-track-release.md`).
8. Rollback / degrade strategy is addressed when applicable.
9. Acceptance criteria are binary and testable.
10. Unknowns are explicitly listed.
11. ADR-lite trigger decision is made.
12. The brief can be compressed into a planner-consumable handoff.
13. **Three-faces boundary check** (per `0003-three-faces-architecture.md`): the brief explicitly
    states which face owns each change (host / core / plugin), and confirms no business logic is
    being smuggled into `apps/desktop/src/` or `packages/core/`.

If any of these fail, do not finalize the brief yet.

## Required Output

- Final brief status:
  - `READY_FOR_DISCOVERY`
  - `READY_FOR_FEATURE_PLAN`
  - or `BLOCKED` with missing answers
- Standardized `Structured Brief`
- `Open Questions / Unknowns`
- `ADR-lite Trigger`
  - `Needed: Yes/No`
  - if `Yes`, include:
    - `Decision Topic`
    - `Why Decision Is Needed`
    - `Options To Evaluate`
    - `Risks If Deferred`
- `Planner Handoff`
  - 必须包含字段 `Three-faces decision`：哪一面（host / core / plugin slice）拥有本变更
  - 必须包含字段 `Target plugin slice`（如适用）：`plugin-<name>` 全名 + 当前 PLUGIN_MAP 状态
  - 必须包含字段 `Mock strategy`：从上面 5 个选项中选一个并解释为什么
  - 必须包含字段 `Cross-window contract impact`：是否要新增/修改 `packages/core/src/events/` 下的
    typed events，或 Tauri command 签名变更
- `Saved brief path`

## Handoff Rule

When this skill finishes successfully, the developer should be able to:

1. inspect the saved final brief in the review path
2. send the `Planner Handoff` directly to:
   - `feature-plan`, or
   - `xai-new-feature-discovery` first, then `xai-feature-planning` (when those project-layer
     skills are landed)

Keep the skill lean. All detailed definitions, examples, option explanations, and field semantics live in:

- `docs/workflow/_portable/03-step0-brief-spec.md` (portable canonical) — and, when authored,
  `docs/workflow/STEP0-brief-spec.project.md` (project overlay)
