# Roadmap Manifest — xai-web-dashboard-stickies-create

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md` (P0 carve-out, commit `baaf3e1`) + `docs/reviews/xai-web-dashboard-stickies-create/20260528-discovery-review.md`
- Source Code Reference: `packages/xai-web-dashboard-widgets/` (SHIPPED row #11 baseline 2026-05-23, manifest `status: Stable`) — EXTENSION only. `packages/plugin-web-storage/` gets ONE additive registry key `xai_dashboard_stickies` (AUTHORIZED by carve-out §2) + its registry test. `packages/core/` read-only (NO event channel — React state lift). `packages/plugin-web-tokens/` NOT edited (local STR table chosen — discovery Q3).
- Closest Precedent (store-from-scratch): `xai-web-calendar-event-create` (commits `e108607` P1 data layer → `90ca6d8`) — Stickies builds a `Record<id, Entity>` store + new registry key from scratch, same as Calendar. NOT the Tasks/Matrix wire-to-existing-store pattern. Composer mirrors `EventComposer`/`TaskComposer`/`MatrixComposer` (all SHIPPED native `<dialog>`).
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit `baaf3e1` (2026-05-28)
- Init Path: `single-feature` (no decomposition; one feature row spans 4 internal phases — store-from-scratch cadence)
- Generated: 2026-05-28
- Default Automation Mode: **A-Claude** (inherited from sibling Web carve-outs `xai-web-matrix-card-create.md` + `xai-web-tasks-card-create.md` 2026-05-28; can be picked at feature-build dispatch time)
- Default Dependency Semantics: N/A (single row, no internal deps)
- Default Verify Cross-vendor: **yes** (Codex `gpt-5.5-thinking effort=medium` primary; Cursor fallback). MAY DEFER 24h per ADR-0008 §S3 carve-out — deferral recorded in `dev_log.md` verify section.
  - Per-phase: SP1 skip (data layer + registry only); SP2 same-vendor smoke; SP3 smoke recommended; **SP4 full XVENDOR-STICKY-1..N + Codex cold-read** (or formally deferred per ADR-0008 §S3)
- BG Direct Verified: unreliable-for-feature-loops (inherited; use serial / emit dispatch for any auto-loop chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts)
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives, nor the SHIPPED `xai-web-dashboard-widgets` row #11 FEATURE_DEV lineage, nor the SHIPPED dashboard-grid Top-10 #9 BUGFIX lineage. It adds **one new feature** on top of all of those.
- Interop with PLUGIN_MAP.md: row #11 `@repo/plugin-web-dashboard-widgets` status STAYS `Stable`. Ship appends a feature note to the row's description column (NOT a status change). Registry-owning row `@repo/plugin-web-storage` stays unchanged (additive key only).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-dashboard-stickies-create | docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md | — | — | NEEDS_REVIEW | A-Claude (default) | yes (MAY defer 24h per ADR-0008 §S3; XVENDOR-STICKY-1..N in dev_log) | 2026-05-28 | Single-row store-from-scratch sticky-create feature (CLOSEST precedent = SHIPPED `xai-web-calendar-event-create`, NOT Tasks/Matrix). Wires the no-op StickiesWidget header `+` (`StickiesWidget.tsx:24-27`, D-21 / Audit #6) to a new `StickyComposer` native `<dialog>` mirroring `EventComposer`/`TaskComposer`/`MatrixComposer`. Builds a from-scratch store under a NEW authorized registry key `xai_dashboard_stickies` (codec json, default `{}`, owner `xai-web-dashboard-widgets`, category module, schemaVersion 1, proposed false — byte-parallel to `xai_calendar_events` registry.ts:943-950) + 2 parity-array updates (`registry.test.ts:230` OWNER_ROW_ADDITIONS + `parity-design-md.test.ts:165`) + new `AC-REGISTRY-STICKIES-1/2` test. New `internal/stickiesStore/{types,ids,stickiesStore,useStickies}.ts` (verbatim-port of calendar `eventStore/`): pure CRUD `createSticky`/`deleteSticky`/`listStickies` + `useStickies()` hook wrapping `usePref("xai_dashboard_stickies")` + `createStickyId()` (`sticky-<base36ts>-<rnd>` fallback). Sticky model = `{ id, text: string (SINGLE string — discovery Q5), color: StickyColor (5-preset token), createdAt }` — `STICKY_COLORS` palette `{sun,mint,peach,sky,lilac}`, default `sun`. **Scope = CREATE + DELETE (discovery Q1 — delete IN scope; per-sticky × button + immediate remove; DIVERGES from Matrix which deferred delete, justified: sticky value collapses without delete + delete is a 4-line key-omit).** Composer = native `<dialog>` (discovery Q2 — modal over inline-add; justified: widget body is a drag surface). i18n = LOCAL `internal/strings.ts` STR table (discovery Q3 — NO `plugin-web-tokens` edit; existing `dashboard.sticky_notes` title key REUSED; 0 new token keys — strictly lower churn than the authorized tokens exception). Fixture disposition = merge-as-sample-until-first-user-sticky (discovery Q4 — empty store renders 3 read-only fixture samples + create hint; non-empty renders user stickies only; fixtures never persist; mirrors Calendar Q9/Q10). Composer + `useStickies` state live INSIDE `StickiesWidget` (discovery H1 — NO `WidgetRenderContext` edit, NO module, NO state lift; widget is a stable React component across grid re-renders like ClockWidget). State persisted via `usePref` (no new `web:*` channel — honors carve-out constraint). 4-phase build (SP1 data layer + registry / SP2 composer / SP3 wire+render+persist / SP4 docs+barrel+verify). Public surface UNCHANGED (`src/index.ts` exports `dashboardWidgetRegistrations` only — `StickyComposer`/`useStickies`/`UserSticky` stay internal; index-barrel test still asserts single export). NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `plugin-web-tokens` edit, NO host-shell registration edit, NO `dev` branch. |

## Decomposition Rationale

### R1. Init path: single-feature

The carve-out is a single coherent feature (build store from scratch → wire `+` → composer → create/delete → persist). No PRD-to-rows decomposition. The feature is internally phased (4 phases — the store-from-scratch cadence borrowed from `xai-web-calendar-event-create`), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run".

### R2. Why a roadmap manifest for one feature

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → per-package dev_log) discoverable from `docs/workflow/roadmap/`.
2. **Workflow V2 default.** Identical shape to the sibling `xai-web-matrix-card-create.md` / `xai-web-tasks-card-create.md` manifests — avoids special-casing the final Top-10 item.

### R3. Why 4 phases (not 3 like Matrix/Tasks)

Tasks (#3) and Matrix (#4) were 3-phase because the store + persistence key already existed (they only added a reducer action + composer + wire). Stickies has **no store and no key** — SP1 is a dedicated data-layer + registry phase (exactly like Calendar's "P1 data layer" commit `e108607`). Folding SP1 into a composer phase would make a single commit touch two packages (`plugin-web-storage` registry + `dashboard-widgets` store + composer) — larger and harder to review than the Calendar-style split. SP4 (docs+verify) MAY fold into SP3 if the barrel surface truly stays single-export (likely) — flagged for reviewer.

### R4. AskUserQuestion ambiguity resolution

The carve-out is explicit on In / Out scope and hands the planner 5 named calls (Q1 delete, Q2 modal-vs-inline, Q3 i18n, Q4 fixture, Q5 text-model). All 5 are resolved with rationale in discovery §6. **No further AskUserQuestion is required by `feature-plan`.** `feature-review` may override the 5 calls (most notably Q1 delete-scope and Q2 modal-vs-inline) before approving — see discovery §8 OQ1-OQ5.

### R5. AutomationMode / Verify Cross-vendor defaults

- Default Automation Mode: `A-Claude` (inherited from sibling Web carve-outs; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: `yes` (Codex cold-read at SP4; may defer 24h per ADR-0008 §S3).
- Reviewer may override at `feature-review` time.

### R6. Frozen assumptions + open uncertainties

**Frozen (from carve-out + discovery review §0/§3/§6):**

1. Owning package = `@repo/plugin-web-dashboard-widgets` (no new package; EXTENSION of SHIPPED row #11).
2. New files = `src/internal/stickiesStore/{types.ts, ids.ts, stickiesStore.ts, useStickies.ts}`, `src/internal/strings.ts`, `src/StickyComposer.tsx`.
3. New registry key = `xai_dashboard_stickies` (codec json, default `{}`, owner `xai-web-dashboard-widgets`, category module, schemaVersion 1, proposed false) — AUTHORIZED additive edit + 2 parity arrays + `AC-REGISTRY-STICKIES-1/2` test.
4. Sticky model = `{ id: string; text: string; color: StickyColor; createdAt: string }`. `StickyColor` = `"sun" | "mint" | "peach" | "sky" | "lilac"`. `NewStickyDraft = { text: string; color: StickyColor }`.
5. Pure CRUD = `createSticky(store, draft)`, `deleteSticky(store, id)`, `listStickies(store)` (sorted createdAt ASC, id tiebreak) — verbatim port of calendar `eventStore.ts`. NO `updateSticky` in v1 (edit deferred).
6. `useStickies()` returns `{ list, create, remove }` (+ `stickies` raw + `getById` optional) — wraps `usePref("xai_dashboard_stickies")`.
7. id via `createStickyId()` — `crypto.randomUUID()` + `sticky-<base36ts>-<rnd>` fallback.
8. Persistence = NEW key `xai_dashboard_stickies` (default `{}`). NO new `web:*` channel; create/delete do NOT emit any event.
9. Composer = native `<dialog>` `StickyComposer` (textarea + 5-preset color radiogroup + Save/Cancel; ESC/backdrop/autofocus/aria-modal) per `EventComposer`/`TaskComposer` precedent + local `STR_STICKY_COMPOSER`.
10. i18n = local STR table; 0 new `plugin-web-tokens` keys; existing `dashboard.sticky_notes` REUSED for the widget title.
11. Fixture disposition = sample-until-first-user-sticky (G1). Empty store → 3 read-only fixture samples (`data-sample`) + create hint; non-empty → user stickies only; fixtures never persisted. `internal/fixtures.ts` `STICKIES` unchanged.
12. Scope = CREATE + DELETE. Per-sticky `×` delete (native `<button>` + `data-no-drag`). Edit / reorder / pin / rich-text / reminders DEFERRED.
13. Composer + hook state live inside `StickiesWidget` (H1) — NO `WidgetRenderContext` edit, NO `packages/core/` edit, NO module.
14. Public surface UNCHANGED — `src/index.ts` exports `dashboardWidgetRegistrations` only; `StickyComposer`/`useStickies`/`UserSticky` stay internal; index-barrel test asserts single export.
15. Cross-vendor: Codex SP4; per-phase smoke from SP2; may defer 24h per ADR-0008 §S3.

**Frozen guesses (recorded for reviewer override — discovery §8 OQ1-OQ5):**

1. CREATE + DELETE scope (OQ1) vs create-only — DIVERGES from Matrix (delete justified: domain value collapses without delete + 4-line key-omit).
2. Modal native `<dialog>` (OQ2) vs inline-add textarea — divergence the carve-out invited; modal chosen for drag-surface safety.
3. Registry parity via exclusion-list only, NO DESIGN.md §9.2 edit (OQ3) — follows calendar precedent.
4. 4 phases (OQ4) vs compressing SP4→SP3 if barrel unchanged.
5. Public surface stays single-export, NO `UserSticky` barrel export (OQ5).

### R7. Cycle expectations

- Total estimated effort: **1.5-3 days** of build + verify (comparable to Calendar's data-layer + composer; smaller model than Calendar — no recurrence/validation matrix).
- Total estimated commits: **4-6** (1 phase commit + optional docs sync per phase).
- Test additions: **~35-50 new tests** (~10-14 SP1 store+ids+registry / ~14-18 SP2 composer+a11y / ~10-14 SP3 wire+render+persist+delete / ~4 SP4 barrel+integration).
- SHIPPED tests stay green throughout: 93 (dashboard-widgets) + storage suite (registry parity AC-REG-8 count auto-derives) + web suite — no regression.
- New registry entries: **1** (`xai_dashboard_stickies`).
- New CSS rules: ~10 (`.sticky-composer*` dialog + `.sticky-del` + `.sticky--sample` — appended to `styles.css`; base `.sticky` kept).
- New i18n keys via `plugin-web-tokens`: **0** (local STR only — discovery Q3).
- New `packages/core/` event channels: **0** (constraint).
- New host-shell registration edits: **0** (slot SHIPPED in row #11).
- New `WidgetRenderContext` fields: **0** (H1).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| SP1 | `createSticky`/`deleteSticky`/`listStickies` (`internal/stickiesStore/stickiesStore.ts`) + `createStickyId` (`ids.ts`) + `useStickies` (`useStickies.ts`) + `UserSticky`/`StickyColor`/`NewStickyDraft` (`types.ts`) + `STICKY_COLORS` land; `xai_dashboard_stickies` added to registry.ts + 2 parity arrays + `AC-REGISTRY-STICKIES-1/2` test; store/ids unit tests green; storage suite green (AC-REG-8 count auto-derives); widgets typecheck + lint clean; SHIPPED 93 widget tests still green | no |
| SP2 | `StickyComposer` RTL coverage (open/close/save/empty-text-validation/a11y) + bilingual STR parity (`STR_STICKY_COMPOSER` every key has en+zh) + `internal/strings.ts` + composer CSS; lint + typecheck clean | same-vendor smoke |
| SP3 | StickiesWidget `+` wired → composer; user stickies render (single-string text + preset color) with per-sticky `×` delete; fixture-as-sample-until-first disposition; create→persist→refresh + delete→persist→refresh tests green; fixture-sample rows have no delete button (RS6); composer survives a ctx.now tick (RS5); user-sticky render does not crash on string text (RS4) | smoke recommended |
| SP4 | index-barrel test still green (single export unchanged); full widgets + storage + web suites green; `pnpm -w build` green; XVENDOR-STICKY matrix + Codex cold-read pass OR formally deferred per ADR-0008 §S3; dev_log verify section written; PLUGIN_MAP note appended at ship | **Codex cold-read mandatory (or formal defer)** |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (SP1).
- `READY_FOR_VERIFY` — all 4 phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-dashboard-stickies-create.   # Phase SP1 only
# review the diff + commit, then:
Start the feature-build agent for xai-web-dashboard-stickies-create.   # Phase SP2 only
# ...
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-dashboard-stickies-create.   # auto-runs all 4 phases + verify
# then:
Start the ship agent for xai-web-dashboard-stickies-create.
```

### R11. References

- Discovery review: `docs/reviews/xai-web-dashboard-stickies-create/20260528-discovery-review.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md` (commit `baaf3e1`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #6 (D-21)
- Closest precedent (store-from-scratch): `packages/xai-web-calendar/src/internal/eventStore/{eventStore,ids,useUserCalEvents}.ts` + `packages/xai-web-calendar/src/EventComposer.tsx` + registry.ts:931-950 (`xai_calendar_events`) + `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md`
- Composer templates: `packages/xai-web-tasks/src/TaskComposer.tsx`, `packages/xai-web-matrix/src/MatrixComposer.tsx`, `packages/xai-web-calendar/src/EventComposer.tsx`
- Local-STR precedent: `packages/xai-web-calendar/src/internal/strings.ts`, `packages/xai-web-tasks/src/internal/strings.ts`
- SHIPPED baseline being extended: `packages/xai-web-dashboard-widgets/docs/{design,api,test,dev_log}.md` + `src/widgets/StickiesWidget.tsx` + `src/internal/fixtures.ts`
- Registry parity tests to update: `packages/plugin-web-storage/src/__tests__/registry.test.ts` + `parity-design-md.test.ts`
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`
- Sibling manifests: `docs/workflow/roadmap/xai-web-matrix-card-create.md`, `docs/workflow/roadmap/xai-web-tasks-card-create.md`

## Open Operator Decisions (none blocking)

- None at manifest authoring time. The 5 planner's-call items (discovery §6 Q1-Q5) carry planner picks and are flagged for `feature-review` override (discovery §8 OQ1-OQ5) — most notably Q1 (delete-scope; DIVERGES from Matrix) and Q2 (modal-vs-inline; the carve-out invited inline). This is the **last of the Audit Top-10**; ship closes 10/10.
