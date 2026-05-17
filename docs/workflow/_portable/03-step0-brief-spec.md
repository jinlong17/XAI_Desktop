# 03 — Step 0: Requirement Brief Spec (Portable)

> **Portable layer.** Project-agnostic skeleton of the Step 0 requirement-brief gate.
> Source: extracted from the original `STEP0_REQUIREMENT_BRIEF_SPEC.md` (the paradigm parts).
> Project-specific examples (concrete classification options, subscription/billing example,
> the `a2k-feature-brief` landing) live in `../project/STEP0-brief-spec.project.md`.
> Placeholders: see `00-PORTABLE-MANIFEST.md`. Companion: `01-workflow-model.md` §4.0.

---

## 1. Goal

This spec defines **Step 0: Requirement Brief Normalization**, the gate that runs *before* `feature-plan`.

It does not answer "how to write a better plan". It answers:

- What counts as a qualified feature brief
- What information a human + AI must complete before entering `feature-plan`
- Which risks, dependencies, boundaries must be made explicit at the front gate
- When a requirement may enter `feature-plan`
- When it must first gather more info or trigger an ADR-lite

One-sentence definition:

**Step 0 defines the requirement and makes the input solid; `feature-plan` does solution design and the implementation plan on top of a qualified input.**

---

## 2. The problem Step 0 solves

`feature-plan` should be a **design-and-plan agent** — good at converging a design on known requirements, comparing options, fixing contracts and a phased plan. It should *not* spend effort guessing who the feature is for, which layers it touches, whether it affects release/rollback, or whether it triggers billing/permission/security/observability/model-cost concerns.

A common (bad) input flow is: write a freeform paragraph → have an LLM polish it → "feels good enough" → hand to `feature-plan`. This relies on a hidden assumption — *the brief author already thought through all the key boundaries* — which usually does not hold.

This input style fails systematically in these places:

1. **Missing requirement fields** — only motivation/goal/scope/constraints, no explicit frontend/backend/DB/model-API/third-party/release/rollback. The brief looks "good enough" but does not state the change boundary.
2. **One business sentence maps to many engineering implementations** — "support viewing plans and a renewal entry" might be pure frontend, or might mean a new backend status API, a third-party billing-portal integration, plan-mapping logic, trial/expiry/downgrade state handling, conversion analytics. Unless these are split up front, `feature-plan` just guesses.
3. **Requirement description vs engineering fact diverge** — "reuse existing X capability" does not mean X is actually reusable; X may still be in-dev, may only cover the happy path, may be architecturally off-limits. Without a dependency pre-scan, the plan rests on "assume the dependency is available".
4. **Muddled responsibility boundaries** — `feature-plan` ends up guessing requirements, doing design, and doing dependency scan all at once; it spends effort on "completing the input" instead of "doing good design".
5. **Humans miss key dimensions** — new feature / incremental feature / infra change / AI capability / consumer-facing feature each need different questions; writing a brief from memory makes omissions the norm. This is not a skill issue — freeform text has no hard constraint to a checklist.
6. **Requirements are not testable** — "clearer status", "better experience". Without acceptance criteria these sentences cannot drive design or verification.
7. **A wrong requirement is amplified by the whole pipeline** — plan → review → build → verify all operate on a design built from a wrong input: "executed correctly, but wrong direction".

### 2.1 Why Step 0

Step 0 does not add process — it converts what used to rely on experience, memory, and improvisation into fixed requirements:

- Classify first, do not write a long doc immediately
- Ask about boundaries first, do not assume the AI just knows
- Confirm dependency status first, do not assume existing modules are reusable
- Write testable acceptance criteria first, do not hand a vague wish to the planner

Essentially: **before design, turn the requirement into an engineering-usable object.**

### 2.2 ADR-lite in this flow

`ADR` = Architecture Decision Record — a *short* doc recording one important decision: what we decided, why, the context, the consequences. It is the "why we chose this back then" receipt for your future self and team. It records the trade-offs that are easy to forget, cause repeated arguments once forgotten, and ripple across modules when changed.

In this workflow:

- `feature brief` says "what we want to do"
- `feature-plan` says "how we plan to do it"
- `ADR` says "at a key fork, why this option and not the other"

In this spec:

- `ADR` = the full architecture/key-tech decision record
- `ADR-lite` = the lightweight trigger-and-record constraint at the Step 0 stage
- `ADR-lite Trigger` = the judgment that "this requirement is worth a standalone decision record at the planning stage"

Step 0 only does the `ADR-lite Trigger` — it does not finalize a full ADR. It judges: is this requirement at the "needs a key-decision record" level; which decision point is worth recording; which alternatives must `feature-plan` compare.

---

## 3. Step 0's position

### 3.1 In the workflow

```text
Idea -> Step 0 Requirement Brief -> Discovery / Planning -> Review -> Build -> Verify -> Ship
```

**Step 0 is upstream of discovery / planning — a unified requirement-input gate.** It does not replace discovery, does not absorb planning. Responsibility split:

- `Step 0` — define input quality; expose boundaries, risks, unknowns; produce a standardized requirement description
- `Discovery` — external solution research, fork-first search, candidate comparison
- `Planning / feature-plan` — design, contracts, test strategy, phase plan, on top of Step 0 + discovery results

### 3.2 What Step 0 does NOT do

Not responsible for: 2-3 candidate comparison; fork-first / external research; final technology selection; deciding the canonical feature slug; phase decomposition; file-level implementation plan; initializing the feature docs four-piece set. Those belong to `feature-plan`.

### 3.3 What Step 0 MUST do

- Collapse a freeform requirement into a structured brief
- Force-collect the minimum required fields
- Conditional follow-up based on classification results
- Scan dependency status and key constraints
- Turn the goal into testable acceptance criteria
- Judge whether an ADR-lite is needed
- Produce a planner handoff that can feed `feature-plan` directly

### 3.4 Step 0 is multi-round collection, not "ask everything at once"

To avoid an overwhelming one-shot form, Step 0 collects in **two to three rounds**:

1. **Round 1: main-dimension multiple choice** — 4-6 main-dimension questions (architecture kind, target audience, impacted layers, new vs incremental, target feature state, rough risk level)
2. **Round 2: follow-up by what was checked** — only ask about dimensions that were hit; do not ask about unchecked dimensions
3. **Round 3: AI self-check then fill-in** — AI expands a full brief per template, self-checks against the QA Gate, bounces back for fill-in only if it finds a hard flaw

Full flow: `freeform requirement -> main-dimension choice -> conditional follow-up -> AI expand -> AI self-check -> fill-in if needed -> Final Brief`. In a skill-form landing, Rounds 1-2 should prefer a structured question UI with short explanations per option, and prefer small candidate sets over open-ended follow-ups.

### 3.5 Step 0 defaults to single-session

Step 0's default execution mode is **single-session** — not cross-executor cross-validation like discovery/planning. Step 0's goal is to make the input solid, not to run solution competition; its quality controls are multi-round intake + dependency scan + AI self-check + QA Gate. Adding dual-executor cross-review here would make it heavy and undermine its "lightweight input gate" value.

---

## 4. Mature target form

This spec does not chase "prettier docs" — it chases "more professional, stable, executable input". Mature teams satisfy four things at this layer: **templated** (unified fields, less freeform), **structured** (classification + conditional follow-up reduces omissions), **testable** (the requirement lands as acceptance criteria), **traceable** (key trade-offs trigger ADR-lite, not scattered in chat).

Step 0's formal outputs are a flat, hand-off-able set:

1. `Structured Brief`
2. `Open Questions / Unknowns`
3. `Planner Handoff`

Plus, when conditions are met: 4. `ADR-lite Trigger`

---

## 5. Step 0 output definitions

### 5.1 `Structured Brief`

The core output — the minimum qualified input before `feature-plan`. It serves human review, the QA Gate, and requirement archival. It is not a technical solution — it does not answer how the backend is implemented, what fields the API returns, which directories change, how phases are split. It solves: **state the requirement clearly, make boundaries explicit, expose the risks.**

### 5.2 `Open Questions / Unknowns`

Everything not yet confirmed but that will affect plan direction must be listed together. Rule: unknowns are allowed; disguising an unknown as a confirmed fact is not.

### 5.3 `Planner Handoff`

The only thing fed directly to `feature-plan`. The `Structured Brief` can be very complete, but `feature-plan` consumes the compressed core input in the handoff — it does not field-by-field parse the whole brief.

### 5.4 `Final Brief`

What the developer finally confirms is not the "raw expanded draft" but the `Final Brief` — the version that passed the AI self-check / QA Gate. `Structured Brief` is the structural spec; `Final Brief` is the post-QA-Gate delivery version; `Planner Handoff` is the compressed segment within it for `feature-plan`.

### 5.5 `ADR-lite Trigger`

A lightweight decision-record trigger. At the Step 0 stage it only answers: does a key decision need a standalone record; what is the decision topic; which options/trade-offs must `feature-plan` compare. It is not a design conclusion.

---

## 6. Step 0 pipeline

Step 0 runs in four stages.

### 6.1 Stage A: classification questionnaire

Do main-dimension classification first, then conditional follow-up. Round 1 asks only the main dimensions; every option must carry a brief explanation; the goal is not "to test the person" but "to help the person classify correctly".

The recommended main dimensions (the *concrete option values* are project-specific — see `../project/STEP0-brief-spec.project.md` for one project's enumeration):

1. **Architecture Kind** — which architectural bucket the change lands in
2. **User Surface** — end user / admin-operator / internal-only / mixed
3. **Change Type** — new feature / extension / refactor / schema migration / architecture migration
4. **Impacted Layers** — frontend / backend / database / model API / sandbox execution / third-party integration / auth-or-permission / analytics-observability / registration-loading boundary
5. **Target Feature State** — required only for extension/refactor/migration; the lifecycle state of the target module (Planned / Migrating / In-Dev / Testing / Stable / Production / Deprecated). Purpose: **not every "existing module" can be reused by default.**
6. **Risk Level** — low / medium / high. `high` if any of: touches shared infra/core; changes the config-manifest / module-loading / routing-registration boundary; cross-module direct import bypassing the established boundary; introduces a new dependency / SaaS / execution infrastructure; changes a Stable/Production module's public contract or compatibility semantics; involves a high-sensitivity domain.

### 6.2 Stage B: conditional follow-up

Trigger limited follow-up based on classification results — do not make everyone fill a full long form. Stage B's goal is not "ask more questions" but "ask the hit dimensions deeper, help the developer understand what each dimension is confirming, and offer suggested options rather than only open questions". Stage B should also carry **explanatory guidance**.

Example: for `mock strategy`, do not just ask "what is your mock strategy?" — explain that `mock` means using a controlled substitute when a dependency is not stable / not done / not convenient to integrate, and let the developer pick from:

1. **No Mock** — dependency is Stable/Production, can integrate this round
2. **Static Mock** — fixed return values / fake data; frontend builds the page first
3. **Contract Mock** — mock data shaped to the expected interface; the contract is mostly clear but the real service is not ready
4. **Feature Flag Fallback** — a flag keeps the old path; falls back when the new path is not ready; for incremental replacement / gray rollout / migration
5. **Deferred Integration** — explicitly "no integration this round, verified separately later"; for dependencies still in-dev/testing

Key line for developers who do not know `mock`: **mock is not laziness — it is using a controlled substitute when a dependency is unstable, so the current requirement can still be developed and verified.**

### 6.3 Stage C: dependency & constraint scan

Step 0 does a pre-scan; it does not leave all of this to `feature-plan`. Scan at least:

1. **Existing dependency status** — the lifecycle state of related modules; if a dependency is In-Dev/Testing/Migrating, explicitly write the mock strategy / waiting condition / integration strategy; if a dependency is Stable/Production but this requirement changes its public contract, declare the compatibility strategy. Suggested: In-Dev → prefer Contract Mock or Deferred Integration; Testing → can integrate but write the fallback / verification boundary; Migrating → state the compatibility path and old-path retention.
2. **Architecture boundary** — does the requirement land in the feature/plugin/frontend layers, or wrongly point at shared infra/core; any core change needs a standalone justification.
3. **Release boundary** — compile-time flag? runtime activation or tier gating? extra rollout-strategy design? backward compatibility with old data/interfaces?
4. **Ops boundary** — how to tell the release succeeded; can it degrade / roll back on a problem.

### 6.4 Stage D: AI expansion + QA Gate

AI may: summarize user input, complete the structure, rewrite natural language into clearer acceptance criteria, flag gaps. AI may NOT: fabricate unconfirmed facts, assume a dependency is stable, invent a schema / API / billing rule / security constraint. Anything unconfirmable is written as `待确认 / TBD`.

### 6.5 Stage E: AI self-check + fill-in loop

After expansion, the AI does not hand the draft straight to the developer — it runs one self-check round: (1) AI generates the full `Structured Brief` per template; (2) AI self-checks line by line against the QA Gate; (3) if it finds a hard flaw, bounce back for fill-in; (4) if no hard flaw, output the `Final Brief`. The ideal output the developer sees is **a Final Brief that already passed the QA Gate**, not "the AI's first draft".

---

## 7. Structured Brief standard fields

Fields are tiered — not every requirement needs every field filled.

### 7.1 Required fields

`Problem / Motivation`, `Target User / Actor`, `Desired Outcome`, `Scope`, `Non-goals`, `Architecture Kind`, `User Surface`, `Change Type`, `Impacted Layers`, `Acceptance Criteria`.

### 7.2 Conditionally-triggered fields

`Target Feature State` (only for extension/refactor/migration); `Touched Systems / Candidate Modules`; `Dependencies & Constraints`; `Data Impact` (only if `database` checked); `Auth / Permission Impact` (only if `auth_or_permission` checked); `Security / Compliance Notes` (sensitive data / billing / permission / third-party integration); `Observability Notes` (only if `analytics_observability` checked); `Cost / Usage Impact` (only if `model_api` / `sandbox_execution` / `third_party_integration` checked); `Release Strategy`; `Rollback / Degrade Strategy`.

### 7.3 Optional fields

`Success Signals` (recommended for consumer-facing / growth / rollout-sensitive / cost-sensitive features); `Open Questions / Unknowns`; `ADR-lite Needed?`.

---

## 8. QA Gate

Only a brief that passes the QA Gate may enter `feature-plan`. Fixed at 12 checks:

1. **Problem clear** — states what problem to solve, not just "want to add a feature"
2. **User/actor clear** — end-user, admin, internal operator, or external API consumer
3. **Scope & non-goals clear** — has a scope and explicit non-goals
4. **Classification consistent with details** — checked impacted layers have matching explanations; unchecked layers are not implicitly relied on in the body; risk level matches the change boundary
5. **Dependency status clear** — dependency lifecycle states are noted; mock / integration / compatibility strategy stated
6. **Data / permission / security assessed** — new tables, migrations, privacy, auth/authz, audit requirements declared
7. **Release strategy clear** — compile-time flag, runtime gating, compatibility strategy, or extra rollout design
8. **Rollback / degrade clear** — the fallback when something goes wrong is stated
9. **Acceptance criteria testable** — every criterion is binary-decidable
10. **Unknowns explicitly listed** — unconfirmed items are listed together, not hidden in the body
11. **ADR-lite trigger condition judged** — this step cannot be skipped
12. **Meets the minimum input quality for `feature-plan`** — the requirement can be compressed into a planner-consumable handoff

Failing any single check → must not enter `feature-plan` directly.

---

## 9. ADR-lite trigger rules

`ADR` = the full architecture/key-tech decision record; `ADR-lite` = the lightweight trigger mechanism at the Step 0 stage; `ADR-lite Trigger` = the judgment that "a key decision needs a standalone record at the planning stage". Step 0 only judges **whether to trigger**, **which decision point**, and **which options the planner must compare**.

Not every feature needs an ADR-lite trigger, but Step 0 **must** trigger it if any of these hold:

1. Introduces a new external dependency or new technology selection
2. Changes the config-manifest, loading mechanism, routing registration, or feature/plugin boundary
3. Involves cross-layer coupling changes (frontend / backend / DB / model API / sandbox)
4. Involves schema, contract, or compatibility changes
5. Involves a significant cost / performance / security trade-off
6. Involves a high-risk release or hard-to-roll-back change
7. Involves a shared-infra / core change

At Step 0, the `ADR-lite Trigger` only records: `Decision Topic`, `Why Decision Is Needed`, `Options To Evaluate`, `Risks If Deferred`. The actual comparison, trade-off explanation, and finalization stay with `feature-plan`. First-version landing suggestion: record the ADR conclusion in `design.md`'s decision snapshot; do not yet require a standalone ADR infrastructure.

---

## 10. Step 0 vs feature-plan boundary

**Step 0 owns:** turning a requirement from "idea" to "structured input"; collecting boundaries that must be declared; the dependency & risk pre-scan; testable acceptance criteria; flagging unknowns; judging whether an ADR-lite is needed.

**`feature-plan` owns:** solution research; candidate comparison; technology-selection advice; canonical feature name / slug; directory landing points; the design/api/test/dev_log four-piece set; phase decomposition and implementation order.

**Hard rule:** Step 0 defines the requirement, `feature-plan` designs the implementation, `feature-review` reviews the solution. The three cannot substitute for each other.

### 10.1 Output Status

Step 0's final output status is fixed to one of three enum values:

- `READY_FOR_DISCOVERY` — input quality met; next step should be discovery first (new feature, needs fork-first / external research, has technology-selection / candidate comparison needs)
- `READY_FOR_FEATURE_PLAN` — input quality met; no standalone discovery needed; can go directly to `feature-plan` (incremental requirement on an existing feature, clear structure and tech path)
- `BLOCKED` — a blocking gap remains; QA Gate not passed

Decision rule: QA Gate not passed → `BLOCKED`; passed and needs research first → `READY_FOR_DISCOVERY`; passed and ready for planning → `READY_FOR_FEATURE_PLAN`.

---

## 11. Planner Handoff format

Step 0's final goal is not "produce a description" but a handoff that can feed `feature-plan` directly. The full output has three segments: `Structured Brief` (kept fairly complete, for archival + review), `Open Questions / Unknowns`, `Planner Handoff` (compressed for direct planner consumption).

Recommended format:

```md
## Structured Brief

### Problem / Motivation
- ...

### Target User / Actor
- ...

### Desired Outcome
- ...

### Scope
- ...

### Non-goals
- ...

### Feature Classification
- Architecture Kind: ...
- User Surface: ...
- Change Type: ...
- Risk Level: ...
- Target Feature State: ... (if applicable)

### Impacted Layers
- Frontend: Yes/No
- Backend: Yes/No
- Database: Yes/No
- Model API: Yes/No
- Sandbox Execution: Yes/No
- Third-party Integration: Yes/No
- Auth / Permission: Yes/No
- Analytics / Observability: Yes/No
- Registration / Loading Boundary: Yes/No

### Candidate Modules / Dependencies
- ...

### Constraints
- ...

### Data / Security / Cost / Release Notes
- ...

### Acceptance Criteria
1. ...
2. ...
3. ...

### Success Signals
- ...

## Open Questions / Unknowns
- ...

## ADR-lite Trigger
- Needed: Yes/No
- Topic: ...
- Planner must decide: ...

## Planner Handoff
Start the feature-plan agent.
Motivation: ...
Goal: ...
Scope: ...
Non-goals: ...
Constraints: ...
Dependencies: ...
Acceptance Criteria:
- ...
- ...
- ...
Open Questions:
- ...
```

---

## 12. Landing the spec

Recommended landing artifacts:

1. `<step0-skill>` skill — runs the Step 0 questionnaire, scan, QA Gate
2. `FEATURE_BRIEF_TEMPLATE.md` — the Step 0 output contract
3. The project-local `SUBAGENT_WORKFLOW_V2.md` — adds Step 0's position before the Feature Dev workflow
4. The project skill registry — registers the Step 0 skill into the team skill overview

### 12.1 Where the standardized requirement description is stored

The `Final Brief` must not stay only in the chat window — it needs an explicit repo landing point:

1. **Primary location:** `<review_root>/<feature>/<YYYYMMDD>-feature-brief.md` — consistent with the existing discovery-review doc system; does not get confused with `design.md` / `api.md` / `test.md`. Co-exists with `*-discovery-review.md` in the same directory but with a distinct role: `*-feature-brief.md` = the Step 0 standardized requirement input ("what we want, what the boundaries are, what the risks are"); `*-discovery-review.md` = the discovery-stage solution research ("what candidates, why this one").
2. **Reference in `dev_log.md`:** `feature-plan` or a later step records Brief Path, Brief Version/Date, whether the Step 0 QA Gate passed.
3. **If the feature has no canonical name yet:** allow a temporary path `<review_root>/_intake/<YYYYMMDD>-<topic>-feature-brief.md`; once `feature-plan` fixes the canonical name, planning migrates/renames it into `<review_root>/<feature>/`. Step 0 only generates and saves the currently-usable brief; it does not own final archival naming.
4. **Who lands it:** when Step 0 runs as a skill, the skill writes the file directly — do not leave "copy markdown and save manually" as an extra developer step.

### 12.2 Why not put it in `feature-review`

`feature-review`'s job is to review the planner's output, not to carry the raw requirement intake. The cleaner relationship: the Step 0 brief is the front input for `feature-plan`; discovery or `feature-plan` produces `discovery-review.md`; `feature-plan` then produces design/api/test/dev_log; `feature-review` then reviews those planning artifacts.

---

## 13. Bottom line

The thing most worth standardizing is not "how to make `feature-plan` write prettier" — it is **what kind of brief counts as a professional, complete, testable requirement input ready to enter the design stage.** So Step 0's formal definition is **Requirement Brief Normalization + Qualification Gate**, not **a pre-polisher for feature-plan**.
