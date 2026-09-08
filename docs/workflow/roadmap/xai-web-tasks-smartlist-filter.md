# Roadmap Manifest — xai-web-tasks-smartlist-filter

- Roadmap Source: `docs/reviews/xai-web-tasks-smartlist-filter/20260528-feature-brief.md` (operator brief 2026-05-28) + `docs/reviews/_p0-carve-outs/20260528-tasks-smartlist-filter.md` (P0 carve-out, commit `eacf1e5`)
- Source Code Reference: `packages/xai-web-tasks/` (SHIPPED row #6 baseline 2026-05-23 v1 + 2026-05-28 card-create + T-10 done-persist) — extension only; `packages/plugin-web-storage/` is read-only (registry key `xai_task_cols` reused, NO edit; NO new key)
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit `eacf1e5` (2026-05-28)
- Init Path: `single-feature` (no decomposition; one feature row spans 2 internal phases)
- Generated: 2026-05-28
- Default Automation Mode: **A-Claude** (inherited from `xai-web-tasks-card-create.md` 2026-05-28 precedent + `xai-web-console-gap-closure.md` user override; can be picked at feature-build dispatch time)
- Default Dependency Semantics: N/A (single row, no internal deps)
- Default Verify Cross-vendor: **yes** (Codex `gpt-5.5-thinking effort=medium` primary; Cursor fallback). MAY DEFER 24h per ADR-0008 §S3 carve-out — deferral recorded in `dev_log.md` verify section.
  - Per-phase: FP1 same-vendor smoke (data layer + lift); **FP2 full XVENDOR + Codex cold-read of `filterCardsByList` + lift** (or formally deferred per ADR-0008 §S3)
- BG Direct Verified: unreliable-for-feature-loops (inherited; use serial / emit dispatch for `/xai-feature-full-loop` chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts)
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` or `xai-web-console-gap-closure.md` SHIPPED archives; it adds **one new feature** on top of the SHIPPED 24+9 = 33-row Web Console baseline.
- Interop with PLUGIN_MAP.md: row #6 `@repo/plugin-web-tasks` status STAYS `Stable`. Ship appends a feature note to the row's description column (NOT a status change).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-tasks-smartlist-filter | docs/reviews/xai-web-tasks-smartlist-filter/20260528-feature-brief.md | — | — | NEEDS_REVIEW | A-Claude (default) | yes (Codex `gpt-5.5-thinking medium` FP2; smoke from FP1) | 2026-05-28 | Single-row Tasks smart-list-filter feature. Makes the sidebar smart-list rows (All/Today/Tomorrow/Next7/Inbox/Summary) REALLY filter the 4-bucket board — today they only flip a `data-active` highlight (`activeList` trapped in `TasksSidebar.tsx:56` local useState, never lifted to `TasksModule`, never applied → entire left sidebar is a cosmetic no-op, audit T-01). Lifts `activeList` into `TasksModule` via props+callback (controlled sidebar; NO new `web:*` channel — card-create Iteration-2 / Calendar Q5-A precedent). Adds ONE pure view selector `filterCardsByList(cols, list, now?)` in `internal/`. **THE load-bearing finding: `TaskCard.date` is a year-less display string in two formats (`"7/31"`/`"Jun 14"`) and the `next7` cards carry NO `date` at all (seed t11/t12 only have sub/dateLabel)** — so a precise date-string predicate is impossible without a forbidden schema change; the selector derives temporal class from BUCKET membership (the board's existing persisted `dateForCol` semantics). Predicates: all=identity / inbox=`card.inbox===true` across all buckets / next7=next7-bucket / today=overdue-bucket (bucket approx Q-T) / tomorrow=next7-bucket (bucket approx Q-T) / summary=identity (treat-as-all Q2). Honest board-level empty state via NEW local `internal/strings.ts` STR (en+zh). Custom-list/tag rows DEFERRED — non-selecting (Q1, no membership model). Session-only selection — NO registry key (Q3; existing `xai_pref_smart_lists` is owner `xai-web-settings-rest` + wrong shape). **VIEW-ONLY: absolutely NO `tasksReducer` move/toggle/create change, NO mutation of stored `xai_task_cols`** — proven by T-FILT-NOMUT (pure deep-equal) + T-FILT-COUNT (localStorage byte-identical). T-10 done-persist + #3 card-create + T-12 drag stay green. 2-phase build (FP1 lift + selector + structural lists / FP2 empty state + date-predicate confirm + tests + cross-vendor). NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `plugin-web-tokens` edit, NO `plugin-web-storage` registry edit, NO host-shell registration edit. |

## Decomposition Rationale

### R1. Init path: single-feature

The operator brief is a single coherent feature (lift `activeList` + pure `filterCardsByList` selector + honest empty state). No PRD-to-rows decomposition. The feature is internally phased (2 phases), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run".

### R2. Why a roadmap manifest for one feature

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → per-package dev_log) discoverable from `docs/workflow/roadmap/`.
2. **Workflow V2 default.** Identical shape to the sibling `xai-web-tasks-card-create.md` manifest — avoids special-casing.

### R3. Why NOT a new umbrella manifest

The carve-out is "a single-feature exception, not a strategic re-prioritization" (carve-out §2 "NOT triggered"). An umbrella "Web post-carve-out" manifest would imply continued Web work, which the carve-out rejects. One manifest per single feature keeps the framing accurate. (Context: item 3 local cluster #3 — T-10 done ✅ + dashboard-real-data ✅ already SHIPPED; downstream 3b Statistics → 3d-iii Weather/Mail → 3e AI(last).)

### R4. AskUserQuestion ambiguity resolution

The brief is unambiguous on Must / Planner's-call / Out scope. The three planner's-call items are resolved with rationale: Q1 custom/tag DEFER (inert rows), Q2 Summary treat-as-all, Q3 session-only no-key. **No further AskUserQuestion is required by `feature-plan`.** `feature-review` may revise the discovery open questions before approving — notably **Q-T** (the today/tomorrow bucket approximation, the one unavoidable date-semantics judgment).

### R5. AutomationMode / Verify Cross-vendor defaults

- Default Automation Mode: `A-Claude` (inherited; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: `yes` (Codex cold-read of `filterCardsByList` + lift at FP2; may defer 24h per ADR-0008 §S3).
- Reviewer may override at `feature-review` time.

### R6. Frozen assumptions + open uncertainties

**Frozen (from brief + discovery review §F):**

1. Owning package = `@repo/plugin-web-tasks` (no new package).
2. New files = `src/internal/filterCardsByList.ts` (+ test files).
3. New selector = `filterCardsByList(cols, list, now?)` — PURE view projection; never writes storage; never calls move/toggle/create.
4. `SmartListId` additive type in `types.ts` (lifted from TasksSidebar.tsx:39).
5. Persistence = reuse `xai_task_cols` READ-ONLY — NO registry edit, NO new key (session-only `activeList`).
6. `activeList` lifted into `TasksModule`; sidebar becomes controlled; NO new `web:*` channel.
7. Predicates bucket-derived (B1), NOT date-string parse (B2/B3 rejected — `TaskCard.date` year-less + `next7` cards dateless).
8. Empty-state strings via local `internal/strings.ts` STR (en+zh).
9. Custom-list + tag rows non-selecting (inert) — only 6 smart-list ids drive the filter.
10. Honest board-level empty state when a filter yields zero cards; per-column "drop here" hint suppressed under filter.
11. T-10 done-persist + #3 card-create + T-12 drag UNTOUCHED and green.

**Frozen guesses (recorded for reviewer override — discovery §6):**

1. **Q-T (headline):** today→overdue + tomorrow→next7 bucket approximation vs. union / empty-until-real-due-field.
2. Q1: custom/tag DEFER + inert rows vs. route-to-all.
3. Q2: Summary treat-as-all vs. defer-with-disabled-look.
4. Q3: session-only no-key vs. add `xai_pref_tasks_active_list` (would re-expand scope).
5. Q-PHASE: 2 phases vs. splitting lift / selector.

### R7. Cycle expectations

- Total estimated effort: **1-3 days** of build + verify (smaller than card-create — no new dialog/component, mostly one pure selector + a state lift).
- Total estimated commits: **2-4** (1 phase commit + optional docs sync per phase).
- Test additions: **~17-20 new tests** (FP1: T-FILT-1..8 + T-FILT-NOMUT + T-LIFT-1..4 ≈ 13; FP2: T-FILT-COUNT + T-EMPTY-1..2 + T-FILT-BAR + T-REG-NOMUT ≈ 5).
- SHIPPED tests stay green throughout: 76 (tasks, post-T-10) + storage + web suite — no regression.
- New registry entries: **0** (session-only; reuse `xai_task_cols` read-only).
- New CSS rules: ~2-4 (empty-state — appended to `styles.css`).
- New i18n keys via `plugin-web-tokens`: **0** (constraint — local STR only).
- New `packages/core/` event channels: **0** (constraint).
- New host-shell registration edits: **0** (slot already SHIPPED).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| FP1 | `filterCardsByList` + `SmartListId` land; lift wired (sidebar controlled); selector unit tests + T-FILT-NOMUT (pure no-mutation) green; T-LIFT-1..4 (filter applies, highlight syncs, All restores, custom/tag inert) green; tasks typecheck + lint clean; SHIPPED 76 still green | no |
| FP2 | T-FILT-COUNT (localStorage byte-identical after all filters) + T-EMPTY-1..2 (honest empty state, bilingual) + T-FILT-BAR (barrel) green; full tasks + web suites + build green; XVENDOR + Codex cold-read of selector+lift pass OR formally deferred per ADR-0008 §S3; dev_log verify section written; PLUGIN_MAP note appended at ship | **Codex cold-read mandatory (or deferred)** |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (FP1).
- `READY_FOR_VERIFY` — all 2 phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-tasks-smartlist-filter.   # Phase FP1 only
# review the diff + commit, then:
Start the feature-build agent for xai-web-tasks-smartlist-filter.   # Phase FP2 only
# ...
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-tasks-smartlist-filter.   # auto-runs both phases + verify
# then:
Start the ship agent for xai-web-tasks-smartlist-filter.
```

### R11. References

- Operator brief: `docs/reviews/xai-web-tasks-smartlist-filter/20260528-feature-brief.md`
- Discovery review: `docs/reviews/xai-web-tasks-smartlist-filter/20260528-discovery-review.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260528-tasks-smartlist-filter.md` (commit `eacf1e5`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.2 T-01 (+ 2026-05-28 usability recheck)
- Sibling precedent (closest): `docs/workflow/roadmap/xai-web-tasks-card-create.md` (same package, same Iteration-2 state-lift pattern)
- SHIPPED Tasks baseline: `packages/xai-web-tasks/docs/{design,api,test,dev_log}.md`
- Load-bearing source: `packages/xai-web-tasks/src/internal/dateForCol.ts` (bucket date semantics), `src/types.ts` (TaskCard.date display-string shape), `src/internal/tasksReducer.ts` (move/toggle/create — UNTOUCHED), `src/TasksSidebar.tsx:56` (trapped activeList), `src/TasksModule.tsx` (no filter today)
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`

## Open Operator Decisions (none blocking)

- None at manifest authoring time. The 5 open questions (discovery §6) carry planner picks and are flagged for `feature-review` override — most notably **Q-T** (the today/tomorrow bucket approximation, the one unavoidable date-semantics judgment given the SHIPPED card shape has no real per-day due dates).
