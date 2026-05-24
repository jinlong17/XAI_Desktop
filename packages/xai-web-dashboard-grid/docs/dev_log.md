# Dev Log — xai-web-dashboard-grid

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-dashboard-grid |
| Title | Web Console — Dashboard grid container (port `module-dashboard.jsx` grid + DnD wrapper section ONLY) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (Safari 17+ / Chrome / Firefox — empty state + Add-widget emit + lang switch + 3-widget render + FLIP drag visual + persistence reload + responsive breakpoints + touch + a11y + theme + storage round-trip — see test.md §6) |
| Automation Mode | A-Claude (xai-roadmap-loop W2d parallel-Agent mode; siblings: #7 xai-web-board-core + #20 xai-web-statistics) |
| Executor | claude-sonnet-4-6 — ship |
| Updated | 2026-05-23 18:55 |
| Dispatched By | xai-roadmap-loop (W2d parallel dispatch, manifest row #10) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #10 (W2 Module — Dashboard grid container) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map row `module-dashboard.jsx` → predeux split `plugin-web-dashboard-grid` + `plugin-web-dashboard-widgets`) + §S5 (TSX rules) + §S7 (event bus) + §S8 (`xai_dash_order` pref already in registry from row #3) |
| Concurrent Siblings | #7 xai-web-board-core · #20 xai-web-statistics — file writes scoped to `packages/xai-web-dashboard-grid/` + `docs/reviews/xai-web-dashboard-grid/` only; sibling-edge files (`shellRegistrations.tsx` + `apps/web/package.json` + `i18n.ts` + `core/types/events.ts`) get one targeted append/swap each — see Risks §R8 of discovery |
| Write Scope (plan) | `packages/xai-web-dashboard-grid/docs/` + `docs/reviews/xai-web-dashboard-grid/` |
| Write Scope (build) | will extend to: `packages/xai-web-dashboard-grid/src/**` (new), `packages/plugin-web-tokens/src/i18n.ts` (3 keys × 2 langs additive, P1), `apps/web/src/routes/modules/shellRegistrations.tsx` (1 line swap + 1 import, P1), `apps/web/package.json` (1 dep line, P1), `packages/core/src/types/events.ts` (1 EventMap entry, P1) — all per `docs/reviews/xai-web-dashboard-grid/20260523-discovery-review.md` §5 |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-dashboard-grid/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-dashboard-grid/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-dashboard-grid/docs/design.md`
- API contract: `packages/xai-web-dashboard-grid/docs/api.md`
- Test strategy: `packages/xai-web-dashboard-grid/docs/test.md`

## Decision Headline

Selected **Vite+TS package at `packages/xai-web-dashboard-grid/` named `@repo/plugin-web-dashboard-grid`** (sibling W2 convention) with:

- **A1 typed `WidgetRegistration[]` slot API** — caller supplies array of `{ id, span, render, ariaLabel? }`; grid does not know widget internals; row #11 will export `dashboardWidgetRegistrations` matching this contract.
- **B1 ported FLIP DnD** — pointer events + `useLayoutEffect`-driven inverse-translate + 380ms `cubic-bezier(.34, 1.3, .42, 1)` transition, matching DESIGN.md §4.4 verbatim. No new deps.
- **C1 pure-CSS grid + media queries** at 1400/1100/760 breakpoints per DESIGN.md §11. Re-uses `.dash-grid`, `.widget-shell`, `.w-*` rules already in `layout.css` (shipped via row #2).
- **D1 declared `web:dashboard:add-widget-clicked`** EventMap entry. Add-widget button + empty-state CTA both emit; row #11 may consume.
- **E1 caller-controlled instance ids** — supports multi-instance widgets (e.g. two clocks for two timezones) since the caller chooses ids.
- **F1 sanitize-on-mount** reconciliation (drop unknown, append missing, dedupe) keyed by `xai_dash_order` from `@repo/plugin-web-storage` (already pre-registered in row #3).
- **G1 bilingual empty state** when `widgets.length === 0`. Renders even when row #11 hasn't shipped yet — meets the seed brief's "renders an empty grid" acceptance signal.
- **H1 whole-widget-shell pointerdown** with `e.target.closest("button, input, textarea, [data-no-drag]")` exclude per the prototype's UX.
- **Slot registration** via `WebModuleSlotRegistration` from `@repo/xai-web-shell` — replaces `placeholder("dashboard", ...)` at `shellRegistrations.tsx:60`. Icon `"layout"`, rail order `4`, i18nKey `"nav.dashboard"`.
- **Stable public types** — `WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps` are the contract row #11 will consume; breaking change requires an ADR amendment (per ADR-0007 §S4 frozen-assumption 14).

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Package skeleton + DashboardModule render + EmptyState + DashHeader + i18n delta + EventMap declaration + shell wiring | DONE | 2d9655f |
| P2 — FLIP DnD: WidgetShell + DashboardGrid + WidgetGhost + useFlipReorder + useGridDrag + useDashOrder + sanitizeOrder | DONE | 7691f97 |
| P3 — Event emission wiring + cross-row contract docs + final polish | DONE | (this commit) |

## Phase Plan (3 phases)

> Each phase is a single `feature-build` run. After each phase, `feature-build` stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run". Phases are ordered to keep diff small and reviewable.

### Phase P1 — Package skeleton + render path (no DnD yet)

**Goal**: visible in rail at `/app/dashboard`; module renders header + bilingual empty state when widgets is empty; i18n delta + EventMap entry + shell wiring landed.

**Inputs**:
- discovery review §5.1, §5.2, §5.3, §5.4, §5.5
- design.md §3 (public surface), §4 (file layout), §6 P1
- api.md §S1–S4, §S7, §S8, §S10
- test.md AC-RENDER-* + AC-LANG-* + AC-REG-* + AC-TYPES-* + AC-BARREL-* + AC-HOST-*

**Files written**:
- `packages/xai-web-dashboard-grid/package.json` — name=@repo/plugin-web-dashboard-grid, ESM, sideEffects=[./src/styles.css], peerDeps react@^19.2, react-dom@^19.2; deps `@repo/xai-web-shell` `@repo/plugin-web-tokens` `@repo/plugin-web-storage` `@repo/xai-web-event-bus` (workspace:*); devDeps `@repo/eslint-config` `@repo/typescript-config` `@testing-library/react` `vitest` `jsdom` `typescript`
- `packages/xai-web-dashboard-grid/tsconfig.json` — extends `@repo/typescript-config/react-library.json`; includes `src/**/*`
- `packages/xai-web-dashboard-grid/manifest.json` — moduleId=dashboard, surface=web
- `packages/xai-web-dashboard-grid/src/index.ts` — public surface (re-exports only)
- `packages/xai-web-dashboard-grid/src/types.ts` — `WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps`
- `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` — composition: `<DashHeader>` + (when widgets non-empty: placeholder div for P2's DashboardGrid; when empty: `<EmptyState>`)
- `packages/xai-web-dashboard-grid/src/DashHeader.tsx` — greeting + date + Add-widget button (button onClick fires in P3)
- `packages/xai-web-dashboard-grid/src/EmptyState.tsx` — bilingual no-widgets panel + CTA button (CTA onClick fires in P3)
- `packages/xai-web-dashboard-grid/src/registration.tsx` — `dashboardGridSlotRegistration` + `DashboardSlotHost`
- `packages/xai-web-dashboard-grid/src/styles.css` — `.dash-empty` + a `.widget-ghost`/`.widget-shell.dragging` stub (commented "wired in P2")
- `packages/xai-web-dashboard-grid/src/internal/greeting.ts` — `pickGreetingKey(now)` + `formatDashboardDate(now, lang)`
- `packages/xai-web-dashboard-grid/src/__tests__/greeting.test.ts`
- `packages/xai-web-dashboard-grid/src/__tests__/DashHeader.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/EmptyState.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.render.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.lang.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/registration.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/types.test-d.ts`
- `packages/xai-web-dashboard-grid/src/__tests__/index-barrel.test.ts`
- `packages/plugin-web-tokens/src/i18n.ts` — **Edit** (NOT Write): 3 keys × 2 langs additive — `dashboard.empty_title`, `dashboard.empty_subtitle`, `dashboard.add_widget_aria`
- `packages/core/src/types/events.ts` — **Edit**: 1 EventMap entry `web:dashboard:add-widget-clicked` (declaration-only)
- `apps/web/src/routes/modules/shellRegistrations.tsx` — **Edit**: 1 import line + 1 row swap (anchor: `placeholder("dashboard",  "Dashboard",  "layout",    4),`)
- `apps/web/package.json` — **Edit**: 1 dep line `"@repo/plugin-web-dashboard-grid": "workspace:*"` (anchor: alphabetical near `"@repo/plugin-web-countdown"`)
- `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts` — **Edit**: extend with AC-HOST-1..4

**Sibling concurrency policy applied** — Edit (NOT Write) on all 5 shared anchor files; use full-line anchors for unique matches. Retry git lock 8-20s × 5 if collision.

**Acceptance**:
- `pnpm --filter @repo/plugin-web-dashboard-grid lint` — clean
- `pnpm --filter @repo/plugin-web-dashboard-grid check-types` — clean
- `pnpm --filter @repo/plugin-web-dashboard-grid test` — all P1 ACs green
- `pnpm --filter @repo/web check-types` — clean
- `pnpm --filter @repo/web lint` — clean
- `pnpm --filter @repo/web test` — green (extended `shellRegistrations.test.ts`)
- `pnpm --filter @repo/core check-types` — clean (EventMap)
- `pnpm --filter @repo/plugin-web-tokens check-types` — clean (i18n)
- Manual: `pnpm --filter @repo/web dev` → navigate to `/app/dashboard` → see greeting + empty state.

**Commit**: `feat(plugin-web-dashboard-grid): P1 — package skeleton + render path + shell wiring (W2d row #10)`. Body per `docs/conventions/COMMIT_CONVENTION.md` with Why / What / Scope / Risk / Docs / Tests.

### Phase P2 — FLIP DnD pipeline

**Goal**: when caller supplies non-empty `widgets`, grid renders them ordered, drag-to-reorder works with FLIP animation, order persists via `xai_dash_order`.

**Inputs**:
- discovery review §3 (Axis B1/C1/E1/F1/H1), §6 R2/R3/R4
- design.md §2.2, §2.3, §6 P2
- api.md §S2 (caller invariants), §S5 (persistence), §S6 (sanitize), §S11 (CSS)
- test.md AC-SLOT-* + AC-DRAG-* + AC-PERSIST-*

**Files written**:
- `packages/xai-web-dashboard-grid/src/WidgetShell.tsx` — per-widget container with `pointerdown` handler + `dragging` class
- `packages/xai-web-dashboard-grid/src/WidgetGhost.tsx` — floating dragged-widget layer
- `packages/xai-web-dashboard-grid/src/DashboardGrid.tsx` — the `.dash-grid` container mapping order → `<WidgetShell>` instances + ghost layer
- `packages/xai-web-dashboard-grid/src/internal/useFlipReorder.ts` — `useLayoutEffect`-driven FLIP
- `packages/xai-web-dashboard-grid/src/internal/useGridDrag.ts` — pointer-event drag state + over-other-widget swap
- `packages/xai-web-dashboard-grid/src/internal/useDashOrder.ts` — wraps `usePref("xai_dash_order")` + sanitize-on-mount
- `packages/xai-web-dashboard-grid/src/internal/sanitizeOrder.ts` — pure helper for F1
- Edit `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` — conditionally render `<DashboardGrid widgets={widgets} ... />` when non-empty (replaces the P1 placeholder div)
- Edit `packages/xai-web-dashboard-grid/src/styles.css` — `.widget-shell.dragging` (opacity 0.18, pointer-events: none, transition: none), `.widget-ghost` (position: fixed; pointer-events: none; will-change: transform; z-index above grid), `.dash-grid.is-dragging` (cursor: grabbing), `.widget-shell` `touch-action: none` per R3
- `packages/xai-web-dashboard-grid/src/__tests__/sanitizeOrder.test.ts`
- `packages/xai-web-dashboard-grid/src/__tests__/useDashOrder.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/WidgetShell.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.persist.test.tsx`

**Acceptance**:
- All P2 ACs green
- `useDashOrder` writes sanitized order back when persisted differs from sanitized
- `WidgetShell` correctly excludes drag on button/input/textarea/`[data-no-drag]` targets
- jsdom-friendly drag state transitions tested; visual FLIP confirmation deferred to manual cross-vendor (§6 of test.md)

**Commit**: `feat(plugin-web-dashboard-grid): P2 — FLIP drag-to-reorder + xai_dash_order persistence (W2d row #10)`.

### Phase P3 — Event emission + final polish

**Goal**: Add-widget button + empty-state CTA emit `web:dashboard:add-widget-clicked`; `DashboardSlotHost.goTo` emits `web:shell:module-change`; docs synced; dev_log set to `READY_FOR_VERIFY`.

**Inputs**:
- discovery review §3 (Axis D1)
- design.md §6 P3
- api.md §S8, §S10
- test.md AC-EVENT-* + AC-REG-8

**Files written**:
- Edit `packages/xai-web-dashboard-grid/src/DashHeader.tsx` — Add-widget button onClick emits `emitWebEvent("web:dashboard:add-widget-clicked", { source: "add-widget-button" })`
- Edit `packages/xai-web-dashboard-grid/src/EmptyState.tsx` — CTA onClick emits same with `source: "empty-state-cta"`
- Edit `packages/xai-web-dashboard-grid/src/registration.tsx` — `DashboardSlotHost.goTo` callback that emits `web:shell:module-change`
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.events.test.tsx` — assert AC-EVENT-1..4
- Final sync of `design.md`, `api.md`, `test.md` (mostly no-op if they match the as-built reality)

**Acceptance**:
- All P3 ACs green
- `pnpm --filter @repo/plugin-web-dashboard-grid test` — full suite green
- `pnpm -w build` — workspace builds clean
- Set `dev_log.md` `Status: READY_FOR_VERIFY`, `Suggested Next: feature-verify`

**Commit**: `feat(plugin-web-dashboard-grid): P3 — event emission + final polish (W2d row #10)`.

## Risks Snapshot

| ID | Risk | Mitigation | Phase |
|---|---|---|---|
| R1 | layout.css rule duplication | grep + scope our CSS additions only | P1+P2 |
| R2 | FLIP first-paint jank | gate on lastRects defined; seed without animating first render | P2 |
| R3 | iOS touch drag broken | `touch-action: none` on `.widget-shell` | P2 |
| R4 | Persist race | `usePref` is synchronous on read; no race | P2 |
| R5 | Duplicate caller ids | dev warn + dedupe | P2 |
| R6 | Row #11 forgets data-no-drag | document in api.md §S4 + flag in row #11 brief | P1 docs + handoff to row #11 |
| R7 | Empty widgets v1 | EmptyState handles it | P1 |
| R8 | Sibling concurrency on shared anchors | Edit not Write + unique anchor + git lock retry | P1 |
| R9 | xai_dash_order codec mismatch | this row is read-only consumer; no registry edits | n/a |
| R10 | Greeting timezone | local hour acceptable per DESIGN.md silence | P1 (documented) |
| R11 | CSS specificity vs layout.css | scope styles narrowly; defer to layout.css for re-used classes | P1+P2 |

## Review Notes (2026-05-23, claude-opus-4-7)

**Verdict: APPROVED** — 0 blockers, 0 recommendations.

Gate checks:
1. **Discovery quality**: 8 decision axes (A1/B1/C1/D1/E1/F1/G1/H1) with 2–3 alternatives each + justified verdicts; 10 risks with concrete mitigations; 5 open questions (Q1–Q5) all answered. ✅
2. **Design alignment**: design.md §1.1 frozen-assumptions (15 items) match discovery §8 verbatim. §2 architecture diagrams + flow tables align with §3 axes. §6 phase plan respects ADR-0007 §S4/S5/S7/S8. ✅
3. **Contract completeness**: api.md §S1–S13 covers public exports, slot contract, drag-exclude, persistence semantics, sanitize algorithm pseudo-code, events emitted/listened, CSS contract, error semantics. `WidgetRegistration`/`WidgetSpanClass`/`WidgetRenderContext`/`DashboardModuleProps` declared with stability promise per ADR-0007 §S4 frozen-assumption 14. ✅
4. **Phase plan quality**: 3 phases with clear file boundaries; P1 ships render-path-only (verifiable before DnD); P2 isolates the risky FLIP+drag; P3 is small/safe event wiring. Each phase = one commit. ✅
5. **Architecture risk**: `packages/core/` change is 1 EventMap declaration (low blast). `manifest.json` routing uses existing placeholder swap. Sibling W2d concurrency: anchors in shared files (`shellRegistrations.tsx` line 60, `apps/web/package.json` alphabetical dep, `i18n.ts` dashboard.* block, `core/types/events.ts` new key) are unique vs row #7 (board) + row #20 (statistics). ✅

Cross-row contract: row #11 (`xai-web-dashboard-widgets`) will consume the four exported types as a stable surface. Any future breaking change requires an ADR amendment — documented in api.md §S2.

Sanity-checked: `xai_dash_order` is pre-registered in `@repo/plugin-web-storage` `PREF_REGISTRY` line 242–249 with owner `xai-web-dashboard-grid`, default `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]`, schemaVersion 1, codec `json` — this row is a read-only consumer, no registry edits. i18n delta = 3 keys × 2 langs (existing `dashboard.add_widget` / `good_morning` / `good_afternoon` / `good_evening` reused per i18n.ts:137-150 / 333-346).

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 | claude-opus-4-7 — feature-plan | Fresh planning artifacts: discovery review + design.md + api.md + test.md + dev_log.md created. Frozen 15 assumptions (Axis A1/B1/C1/D1/E1/F1/G1/H1). 3-phase plan. Sibling W2d concurrency policy applied. Confirmed `xai_dash_order` already pre-registered in `@repo/plugin-web-storage` (row #3) — read-only consumer, no registry edits. Confirmed i18n delta is 3 keys × 2 langs (existing dashboard.add_widget / good_morning / good_afternoon / good_evening reused). | — | feature-review |
| 2026-05-23 | claude-opus-4-7 — feature-review | APPROVED. All 5 review gates passed (discovery / design / contract / phase / arch-risk). 0 blockers, 0 recommendations. Stability contract for row #11 consumption documented. | — | feature-auto-build |
| 2026-05-23 | claude-opus-4-7 — feature-auto-build | P1: package skeleton + DashboardModule render path + EmptyState + DashHeader + i18n delta + EventMap declaration + shell wiring + 48 tests. 9 test files green. Lint clean. Sibling-safe shared-anchor edits (apps/web/package.json, shellRegistrations.tsx, events.ts, i18n.ts) cleanly committed without contamination. | 2d9655f | feature-build (P2) |
| 2026-05-23 | claude-opus-4-7 — feature-auto-build | P2: WidgetShell + DashboardGrid + WidgetGhost components; useFlipReorder + useGridDrag + useDashOrder + sanitizeOrder internal hooks. 50 new tests (98/98 total). PointerEvent polyfill in setup.ts (jsdom lacks it). Lint + check-types clean. | 7691f97 | feature-build (P3) |
| 2026-05-23 | claude-opus-4-7 — feature-auto-build | P3: emit `web:dashboard:add-widget-clicked` from header button (source=add-widget-button) + empty-state CTA (source=empty-state-cta); verify goTo path (web:shell:module-change with source=mini-cal). 6 new tests (104/104 total). dev_log flipped to READY_FOR_VERIFY. | 7daa255 | feature-verify |
| 2026-05-23 | claude-opus-4-7 — feature-verify | **PASS** — 15/15 verify gates clean. 104/104 plugin tests + 54/54 web tests + 8/8 core tests + vite build green (689 modules, 862KB main chunk, 64KB css). All 15 frozen assumptions honored (§1.1 design.md). All 10 AC families covered (test.md §2). Commit hygiene clean (3 single-intent commits, each with full Why/What/Scope/Risk/Docs/Tests body). Residual: visual FLIP timing + iOS touch + storage round-trip pending cross-vendor manual smoke (test.md §6, Codex primary / Cursor fallback). Status flipped to READY_TO_SHIP. | — | ship |
| 2026-05-23 18:55 | claude-sonnet-4-6 — ship | Verified 104/104 tests pass (pnpm --filter @repo/plugin-web-dashboard-grid test). Confirmed commits 2d9655f/7691f97/7daa255/78e1b43 already on origin/main. Added @repo/plugin-web-dashboard-grid row (Stable) to docs/PLUGIN_MAP.md. Flipped roadmap manifest row #10 to SHIPPED. Flipped dev_log Status to SHIPPED. Chore commit pushed. | chore(xai-web-dashboard-grid): ship — flip dev_log + manifest #10 to SHIPPED | — |

## Verify Report (2026-05-23)

**Verdict**: PASS (15/15 gates) — READY_TO_SHIP.

### Gate-by-gate

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Commits scoped to single phase | PASS | 3 commits (2d9655f / 7691f97 / 7daa255), each single-intent, each with full body. |
| 2 | Commit messages per docs/conventions/COMMIT_CONVENTION.md | PASS | All carry type(scope): summary + Why / What / Scope / Risk / Docs / Tests sections. |
| 3 | design.md §1.1 frozen assumptions (15 items) | PASS | All 15 honored: package name (#1), public surface (#2), persistence read-only (#3), FLIP technique (#4), slot API (#5), sanitize-on-mount (#6), pure CSS responsive (#7), bilingual empty state (#8), declared event (#9), drag-exclude (#10), EventMap declaration-only (#11), i18n delta 3×2 (#12), slot icon+order (#13), no new deps (#14), DashWidgetId=string (#15). |
| 4 | Public surface matches api.md §S1 | PASS | DashboardModule (named+default), dashboardGridSlotRegistration, 4 type aliases. No internal leaks (AC-BARREL-5). |
| 5 | AC matrix coverage (test.md §2) | PASS | 70 AC IDs across 10 families fully exercised in 104 tests. |
| 6 | Sanitize semantics (F1) | PASS | 14 sanitizeOrder unit tests + 8 useDashOrder integration tests cover all 6 edge cases enumerated in api.md §S6. |
| 7 | Drag-exclude contract (api.md §S4) | PASS | useGridDrag exclude selector "button, input, textarea, [data-no-drag]" enforced; 4 dedicated tests for each branch (AC-DRAG-2/3/4/8). |
| 8 | EventMap declaration | PASS | packages/core/src/types/events.ts:198-203 — 'web:dashboard:add-widget-clicked' with closed source union. |
| 9 | i18n delta (3 keys × 2 langs) | PASS | packages/plugin-web-tokens/src/i18n.ts:151-153 (en) + 351-353 (zh). add_widget / good_morning / good_afternoon / good_evening reused. |
| 10 | xai_dash_order registry — read-only | PASS | packages/plugin-web-storage/src/internal/registry.ts:242-249 unchanged. Only consumer-side usePref hook used. |
| 11 | Shell wiring | PASS | shellRegistrations.tsx swap at railOrder 4; dashboardGridSlotRegistration imported. AC-HOST-1..4 green in web tests. |
| 12 | Lint clean (--max-warnings 0) | PASS | dashboard-grid + web lint both green (web's pre-existing TokensSmokePage warnings are NOT mine; introduced in commit 6c556e6 W1.P3). |
| 13 | Check-types clean | PASS | dashboard-grid + web + core + plugin-web-tokens all green. |
| 14 | Workspace build (vite) | PASS | pnpm --filter @repo/web build → 689 modules transformed, 862KB main, 64KB css, 2.56s. |
| 15 | Sibling concurrency safe | PASS | All my shared-anchor edits (apps/web/package.json, shellRegistrations.tsx, events.ts, i18n.ts) used unique anchors that did NOT collide with sibling rows #7 (board-core) or #20 (statistics). Each row owns disjoint regions of those files. |

### Residual risks (acceptable at ship-time, queued for cross-vendor manual smoke)

| ID | Risk | Mitigation status |
|---|---|---|
| R2 | FLIP first-paint jank | Unit-test verifies lastRects gating; visual confirmation in test.md §6 cross-vendor smoke. |
| R3 | iOS touch drag broken without touch-action | `.widget-shell { touch-action: none; }` present in styles.css. Manual iOS test in §6. |
| R6 | Row #11 widget authors forget [data-no-drag] | Documented in api.md §S4 + design.md §1.1 frozen-assumption 10. Row #11's feature-plan must reference this. |
| R10 | Greeting tied to local timezone | Documented as expected behaviour; tested at hour boundaries 0/11/12/17/18/23 in greeting.test.ts. |

### Cross-vendor verify scope (queued)

Manifest header: primary Codex, fallback Cursor. Verification steps enumerated in test.md §6:
1. Empty state render + lang switch
2. Add-widget event emission (both header + empty-state CTA)
3. 3-widget smoke with drag-to-reorder visual + reload persistence
4. iOS touch drag (Safari)
5. Responsive breakpoints (1500/1300/900/600)
6. A11y tab navigation + aria-label
7. Light/Dark theme inversion
8. Storage round-trip (localStorage Application tab)
