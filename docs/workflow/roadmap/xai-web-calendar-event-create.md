# Roadmap Manifest — xai-web-calendar-event-create

- Roadmap Source: `docs/reviews/xai-web-calendar-event-create/20260527-feature-brief.md` (operator brief 2026-05-27) + `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md` (P0 carve-out)
- Source Code Reference: `packages/xai-web-calendar/` (SHIPPED row #12 baseline 2026-05-23 + SHIPPED gap-closure row #4 extension 2026-05-25) + `packages/plugin-web-storage/` (registry only)
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit cited by operator: `bc573b1` (P0 carve-out doc dated 2026-05-27)
- Init Path: `single-feature` (no decomposition; one feature row spans 5 internal phases)
- Generated: 2026-05-27
- Default Automation Mode: **A-Claude** (inherited from `xai-web-console-gap-closure.md` 2026-05-23 user override; can be picked at feature-build dispatch time)
- Default Dependency Semantics: N/A (single row, no internal deps)
- Default Verify Cross-vendor: **yes** (Codex `gpt-5.5-thinking effort=medium` primary; Cursor fallback)
  - Per-phase: P1 skip (data layer only); P2 same-vendor smoke; P3 same-vendor smoke; **P4 Codex cold-read mandatory**; **P5 full XVENDOR-CREATE-1..6 + Codex 5 items**
- Cross-vendor Verifier Order: primary Codex `gpt-5.5-thinking effort=medium`; fallback Cursor. May DEFER 24h per ADR-0008 §S3 carve-out precedent if operator time-boxed; deferral must be recorded in `dev_log.md` verify section.
- BG Direct Verified: unreliable-for-feature-loops (inherited; per `xai-web-console-gap-closure.md` 2026-05-24 header — use serial / emit dispatch for `/xai-feature-full-loop` chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts)
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` or `xai-web-console-gap-closure.md` SHIPPED archives; it adds **one new feature** on top of the SHIPPED 24+9 = 33-row Web Console baseline.
- Interop with xai-web-console.md: row #12 stays SHIPPED; this feature extends but does not reopen it.
- Interop with xai-web-console-gap-closure.md: row #4 stays SHIPPED; this feature extends but does not reopen it.
- Interop with PLUGIN_MAP.md: row #12 `@repo/plugin-web-calendar` status STAYS `Stable`. P5 appends a feature note to the row's description column (NOT a status change).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-calendar-event-create | docs/reviews/xai-web-calendar-event-create/20260527-feature-brief.md | — | — | NEEDS_REVIEW | A-Claude (default) | yes (Codex `gpt-5.5-thinking medium` P4+P5; smoke per-phase from P2) | 2026-05-27 | Single-row Calendar event CRUD feature. Lifts design.md §15.2 HC8 ("no event-creation/editing UI") per ADR-0010 §D4 carve-out. 5-phase build (P1 data layer / P2 composer dialog / P3 toolbar+Month wire / P4 Week/Day+recurrence / P5 HC8 lift+verify). Realistic v1 — daily/weekly recurrence only, no monthly, no until-date, no cross-device sync, no external calendar. NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `plugin-web-tokens` edit. Uses `xai_calendar_events` new localStorage key (registry additive) + new internal `eventStore` directory in `packages/xai-web-calendar/src/internal/eventStore/` + new `EventComposer.tsx` native `<dialog>` mirroring `CardDetailDialog` pattern + local `internal/strings.ts` STR table for EN/ZH. State lifted into `CalendarModule` (no new `web:*` channel). Fixture `SAMPLE_EVENTS` becomes badged "Sample" (per Q9-E option) and stays non-editable. Banner hides when `userEvents.length > 0` (Q10-B). |

## Decomposition Rationale

### R1. Init path: single-feature

The operator brief is already a single coherent feature (event CRUD + simple recurrence + persistence). No PRD-to-rows decomposition is needed. The feature is internally phased (5 phases — P1 data layer / P2 dialog / P3 Month wire / P4 Week+Day+recurrence / P5 HC8 lift + verify), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run".

### R2. Why a roadmap manifest for one feature

Two reasons:

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → per-package dev_log) discoverable from `docs/workflow/roadmap/` index.
2. **Workflow V2 default.** All recent Web features under the gap-closure manifest had per-feature seed briefs + manifest rows. Keeping the same shape avoids special-casing this single feature.

### R3. Why NOT a new manifest for "Web post-carve-out work"

The brief explicitly says "this carve-out is a single-feature exception, not a strategic re-prioritization" (per P0 carve-out doc §2). Creating a `xai-web-post-carve-out.md` umbrella manifest would imply continued Web work — which the carve-out rejects. One manifest per single feature keeps the framing accurate.

### R4. AskUserQuestion ambiguity resolution

The brief presents 16 frozen assumptions in its acceptance set + open questions Q1..Q12 (all in discovery review). **No further AskUserQuestion is required by `feature-plan`** — the brief is unambiguous on Must / Should / Won't scope. `feature-review` may revise Q1..Q12 picks before approving.

### R5. AutomationMode / Verify Cross-vendor defaults

Per `xai-web-console-gap-closure.md` 2026-05-23 user override:

- Default Automation Mode: `A-Claude` (locked; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: `yes` (strict; cross-vendor cold-read mandatory at P4 + P5 per ADR-0009 §D2-G2 precedent).
- Reviewer may override at `feature-review` time.

### R6. Frozen assumptions + open uncertainties

**Frozen (from brief + discovery review §4 — 16 entries):**

1. Owning package = `@repo/plugin-web-calendar` (no new package).
2. New file directory = `packages/xai-web-calendar/src/internal/eventStore/`.
3. `UserCalEvent` schema = id / title / startISO / endISO / colorPreset / recurrence / createdAt / updatedAt.
4. Recurrence = `{ kind: "daily" | "weekly" }` only.
5. Recurrence expansion = render-time, pure helper, `maxInstances: 366` cap.
6. Persistence = `xai_calendar_events` (json codec, default `{}`, category "module").
7. Storage shape = `Record<string, UserCalEvent>` (id-indexed).
8. State lifted; NO new `web:*` channel.
9. Composer = native `<dialog>` per `CardDetailDialog` precedent + local `STR_EVENT_COMPOSER`.
10. Triggers = toolbar `+` + click-existing-user-event (right-click deferred).
11. 5 color presets: mint / amber / blue / violet / rose.
12. Fixture badged "Sample"; non-editable.
13. Banner hides when `userEvents.length > 0`.
14. Empty state = bilingual hint with arrow.
15. HC8 lift = inline footnote on §15.2 #8 + new §16.
16. Cross-vendor: Codex P4+P5 mandatory; per-phase smoke.

**Frozen guesses (recorded for review override):**

1. 5 colors (Q4-C) vs 4 (Q4-B) — reviewer may pick 4 if "rose" feels gratuitous.
2. Fixture disposition Q9-E (badge) vs Q9-B (auto-hide after first save).
3. HC8 lift mechanism Q11-A (inline footnote) vs Q11-B (addendum only).

These are 3 explicit alternatives flagged for the reviewer; the planner picked default = first option of each pair but accepts the alternates.

### R7. Cycle expectations

- Total estimated effort: **5-10 days** of build + verify time (operator brief said 1-2 weeks).
- Total estimated commits: **7-10** (1 phase commit + optional docs sync per phase).
- Test additions: **~110 new tests** (40 P1 + 25 P2 + 20 P3 + 20 P4 + 5 P5).
- SHIPPED tests stay green throughout: 197 (calendar) + 88 (storage) + 106 (web) = **391 tests**.
- New registry entries: 1 (`xai_calendar_events`).
- New CSS rules: ~10 (composer dialog + 5 ev-rose for the new color).
- New i18n keys via `plugin-web-tokens/i18n.ts`: **0** (constraint).
- New `packages/core/` event channels: **0** (constraint).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| P1 | All P1 helpers green + storage registry tests green + types-d clean | no |
| P2 | EventComposer 100% RTL coverage + bilingual STR parity + dialog open/close/save/delete | smoke recommended |
| P3 | Toolbar `+` wires; clicking opens composer; Month view shows user events + fixture (badged); HC1 / HC6 land | smoke recommended |
| P4 | Week + Day views show user events with recurrence; HC2/HC3/HC5/HC7 land; PB-CREATE-1 perf budget green; DST × recurrence test green | **Codex cold-read mandatory** |
| P5 | HC8 lift annotation landed; design.md §16 + api.md §11 + test.md §9 + dev_log block written; PLUGIN_MAP note appended; XVENDOR-CREATE-1..6 either pass or formally deferred per ADR-0008 carve-out; Codex 5 items either pass or deferred 24h | **full matrix + Codex** |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (P1).
- `READY_FOR_VERIFY` — all 5 phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-calendar-event-create.   # Phase P1 only
# review the diff + commit, then:
Start the feature-build agent for xai-web-calendar-event-create.   # Phase P2 only
# ...
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-calendar-event-create.   # auto-runs all 5 phases + verify
# then:
Start the ship agent for xai-web-calendar-event-create.
```

**Cross-vendor verify**: triggered automatically by `feature-verify` per the `Verify Cross-vendor: yes` cell. Codex dispatch happens in the feature-verify run; results land in `dev_log.md` verify section.

### R11. References

- Operator brief: `docs/reviews/xai-web-calendar-event-create/20260527-feature-brief.md`
- Discovery review: `docs/reviews/xai-web-calendar-event-create/20260527-discovery-review.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md`
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #2 (C-02)
- HC8 location: `packages/xai-web-calendar/docs/design.md:602`
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`
- ADR-0009 §D2-G2 (cross-vendor mandatory): `docs/adr/0009-web-to-desktop-pivot-plan.md`

## Open Operator Decisions (none blocking)

- None at manifest authoring time. All 12 questions (Q1..Q12) are resolved with planner picks in `discovery-review.md` §3 and frozen at §4. `feature-review` may revise.
