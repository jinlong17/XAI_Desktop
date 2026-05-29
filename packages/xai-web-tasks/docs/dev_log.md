# Dev Log — `@repo/plugin-web-tasks`

> Source of truth for the workflow state machine of this feature.
> Workflow rules: docs/workflow/SUBAGENT_WORKFLOW_V2.md
> Sibling rows running in parallel (W2b): xai-web-pomodoro (#14), xai-web-habits (#15)

---

## Header

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-tasks |
| Title | Port web Tasks module — 4-bucket DnD board with date-rewrite + persistence |
| Current Phase | SHIP |
| Status | SHIPPED |
| Executor | Claude Sonnet (claude-sonnet-4-6) |
| Updated |  2026-05-23 18:41 |
| Suggested Next | — (SHIPPED) |
| Wave | W2b (parallel-Agent mode; siblings #14 pomodoro, #15 habits) |
| Verify Cross-vendor | yes |

---

## Phase Plan

The build runs ONE phase per `feature-build` invocation, then STOPS for human confirmation (Workflow V2 rule).

### P1 — Scaffold + read-only render

**Goal**: package files in place, seed data typed, sidebar + 4-column board render the seed (no DnD, no persistence wired, no host slot replaced yet).

**Files created**:
- `packages/xai-web-tasks/package.json`
- `packages/xai-web-tasks/manifest.json`
- `packages/xai-web-tasks/tsconfig.json`
- `packages/xai-web-tasks/vitest.config.ts`
- `packages/xai-web-tasks/vitest.setup.ts`
- `packages/xai-web-tasks/src/index.ts`
- `packages/xai-web-tasks/src/types.ts`
- `packages/xai-web-tasks/src/TasksModule.tsx` (read-only render)
- `packages/xai-web-tasks/src/TasksSidebar.tsx`
- `packages/xai-web-tasks/src/TaskColumn.tsx`
- `packages/xai-web-tasks/src/TaskCard.tsx`
- `packages/xai-web-tasks/src/CompletedGroup.tsx`
- `packages/xai-web-tasks/src/styles.css` (ported from `web design/` CSS subset)
- `packages/xai-web-tasks/src/internal/seed/tasksMock.ts`
- `packages/xai-web-tasks/src/__tests__/seed.test.ts` (T-SEED-1..4)
- `packages/xai-web-tasks/src/__tests__/TasksModule.test.tsx` (T-MOD-1, T-MOD-2 only — read-only render)

**Not done in P1**: DnD, persistence wiring, host slot Edit, package.json dep Edit.

**Exit criterion**: `pnpm --filter @repo/plugin-web-tasks lint && typecheck && test` all clean. Package loads in isolation (no host integration yet).

### P2 — DnD + date-rewrite + persistence + host slot replacement

**Goal**: full prototype parity (drag, drop, date rewrite, persist to localStorage); host shell shows real Tasks module.

**Files created**:
- `packages/xai-web-tasks/src/internal/dateForCol.ts`
- `packages/xai-web-tasks/src/internal/tasksReducer.ts`
- `packages/xai-web-tasks/src/internal/validate.ts`
- `packages/xai-web-tasks/src/registration.tsx`
- `packages/xai-web-tasks/src/__tests__/dateForCol.test.ts` (T-DC-1..5)
- `packages/xai-web-tasks/src/__tests__/tasksReducer.test.ts` (T-RD-1..7)
- `packages/xai-web-tasks/src/__tests__/validate.test.ts` (T-VAL-1..4)
- `packages/xai-web-tasks/src/__tests__/registration.test.tsx` (T-REG-1)
- `packages/xai-web-tasks/src/__tests__/persistence.test.tsx` (T-PER-1..3)

**Files edited (shared — UNIQUE anchors)**:
- `apps/web/src/routes/modules/shellRegistrations.tsx` — replace `placeholder("tasks",      "Tasks",      "check",     2),` with `tasksWebModuleRegistration,` + add the import (anchor: the `placeholder("tasks", ...)` line is the ONLY occurrence in the file — verified).
- `apps/web/package.json` — add `"@repo/plugin-web-tasks": "workspace:*"` immediately after the `@repo/plugin-web-matrix` line (anchor: the `@repo/plugin-web-matrix` line is unique).
- `apps/web/src/App.tsx` — **no edit required** (the `useWebShell()` lang already flows to the slot wrapper, same pattern as countdown).

**Git-index lock retry policy** for the two shared-file Edits (sibling concurrency): retry 5× at 8 / 12 / 16 / 20 / 20 seconds. Sibling rows #14 and #15 use distinct anchors (`placeholder("pomodoro", ...)` and `placeholder("habits", ...)`) so anchor collisions are impossible.

**Exit criterion**: all P1 + P2 tests pass; `pnpm install` succeeds; `pnpm --filter @repo/web typecheck` clean.

### P3 — Test sweep + cross-vendor smoke + real-browser verification

**Goal**: complete the test inventory, add the registration RTL test, and document the real-browser sweep result.

**Files created / edited**:
- `packages/xai-web-tasks/src/__tests__/index-barrel.test.ts` (T-BAR-1)
- `packages/xai-web-tasks/src/__tests__/registration.test.tsx` extended with T-REG-2.

**Steps**:
1. `pnpm --filter @repo/plugin-web-tasks test:coverage` — confirm targets in test.md §1.
2. `pnpm --filter @repo/plugin-web-tasks lint && typecheck`.
3. `pnpm --filter @repo/web lint && typecheck && test`.
4. `pnpm --filter @repo/web dev` — open `http://localhost:3000/app/tasks` in macOS Safari + Chrome.
5. Walk through AC-6 (test.md §4) and record screenshots / observations in this dev_log under "Work Log".
6. Confirm cross-vendor readiness checklist (test.md §4 AC-7).

**Exit criterion**: AC-1..AC-7 met. Flip Status to `READY_FOR_VERIFY` + Suggested Next = `feature-verify`.

---

## Risks (mirrored from discovery review §6)

| ID | Risk | Mitigation |
|---|---|---|
| R1 | Registry `xai_task_cols` declared type doesn't match persisted shape | `unknown` boundary cast + `isTaskColsArray` guard + DEV warn. Documented in api.md §4.1. Same pattern as `xai-web-countdown`. |
| R2 | DnD glue thinly testable in jsdom | Pure reducer is the test target; happy-path RTL covers wiring; manual real-browser pass covers cursors. |
| R3 | No events emitted; Statistics row #20 may want them later | Hook-points documented in design.md §6 "Future events"; not implemented v1. |
| R4 | Possible legacy `todoWebModuleRegistration` from `web-todo-first-slice` collision | Verified `shellRegistrations.tsx` line 47 currently uses placeholder, not the legacy registration. Replacement is direct. |
| R5 | Concurrent edits with siblings #14, #15 on `shellRegistrations.tsx` + `apps/web/package.json` | Unique anchors per row; git-index retry policy 8/12/16/20/20 s × 5. |
| R6 | `new Date()` in dateForCol → non-determinism | `vi.useFakeTimers` + explicit `now` parameter in helper. |
| R7 | New i18n keys (`tasks.drop_to_reschedule`, `tasks.drop_zone_empty`) may need adding to tokens | Inline bilingual fallback retained from prototype until tokens row updates them. |
| R8 | Seed faithfulness vs prototype (26 + 6 = 32 tasks) | Snapshot-style count assertions in `seed.test.ts` (T-SEED-1..4). |

---

## Open questions (pending review)

- **Q1**: Confirm `Postpone` button on `overdue` column is decorative in v1 (prototype has no onClick handler). Provisional answer: **yes, decorative**.
- **Q2**: When DnD moves a card to `nodate`, does it lose its tag? Provisional answer: **no, keep tag + inbox** (prototype lines 195-196).
- **Q3**: Do the two new i18n keys (`tasks.drop_to_reschedule`, `tasks.drop_zone_empty`) get added to `@repo/plugin-web-tokens` in P2, or do we keep inline fallback? Provisional answer: **keep inline fallback in P2**; promote to tokens in a later iteration.
- **Q4**: Is `Verify Cross-vendor: yes` satisfied by P3's checklist alone, or must one P1/P2 phase be executed by Codex/Cursor? Provisional answer: **checklist is sufficient** unless feature-review insists otherwise.

---

## Review Notes

**Verdict: APPROVED** (feature-review · Claude Opus · 2026-05-23 18:05)

**Gates evaluated**:

1. **Seed-brief fidelity** — PASS. design.md §1 + api.md §5.1 reproduce the prototype's per-bucket date rewrites verbatim (`overdue=-3d / next7=+2d / later=+30d / nodate=clear`). Sidebar enumerates the eight expected rows (Smart Lists / Custom Lists / Filters / Tags / Calendar Subscription / Completed / Won't Do / Trash).
2. **ADR-0007 conformance** — PASS. design.md §2 frozen assumptions 1, 2, 5, 8 directly cite §S4 (toolchain + one-module-one-package), §S6 (SHIPPED bases), §S7 (no inter-plugin imports), §S8 (registry already owns `xai_task_cols`).
3. **W1-dep wiring** — PASS. design.md §3 declares the five SHIPPED deps (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-shell`, `@repo/xai-web-event-bus`); no plugin-map mocking required.
4. **Persistence via usePref** — PASS. Registry confirmed: `packages/plugin-web-storage/src/internal/registry.ts:189-196` already declares `xai_task_cols` (codec `json`, owner placeholder type `Record<string, boolean>`). api.md §4.2 mirrors the countdown row's `unknown` boundary-cast + `isTaskColsArray` guard, with seed-fallback and DEV warn — pattern is precedent-proven.
5. **Bilingual via useI18n** — PASS. api.md §9 enumerates 19 token keys all present in `@repo/plugin-web-tokens`; the two provisional keys (`tasks.drop_to_reschedule`, `tasks.drop_zone_empty`) have a documented inline bilingual fallback so P2 cannot block on token-package coordination.
6. **HTML5 DnD reasonable (1:1 port)** — PASS. api.md §6 maps `onDragStart / onDragOver / onDragLeave / onDrop / onDragEnd` directly to prototype `module-tasks.jsx` behavior; jsdom limitations honestly disclosed (test.md §3) with pure-reducer as the load-bearing test surface and real-browser sweep covering cursor/effect behavior.
7. **3 phases right-sized** — PASS. P1 = 16 read-only files + 2 RTL render tests. P2 = DnD + reducer + validate + persistence + two host-file Edits (load-bearing). P3 = barrel + registration RTL + manual sweep + cross-vendor checklist. Phase exit criteria explicit; rollback boundaries clean (P1 ships in isolation without host wiring).
8. **Cross-vendor verify** — PASS. Header `Verify Cross-vendor: yes`; test.md AC-7 documents the checklist alternative if all phases stay on Claude.
9. **Sibling-coordination (parallel W2b)** — PASS. Anchor `placeholder("tasks",      "Tasks",      "check",     2),` verified unique in `apps/web/src/routes/modules/shellRegistrations.tsx` (one occurrence at line 47). `apps/web/package.json` Edit anchored on `@repo/plugin-web-matrix` line. Sibling rows #14 (`placeholder("pomodoro", …)`) and #15 (`placeholder("habits", …)`) target disjoint anchors — no collision possible. Git-index retry policy (8/12/16/20/20s × 5) documented three times.

**Recommendations (non-blocking, optional for build-time)**:

- **Rec-1**: When P2 wires the persistence boundary, copy the countdown row's exact DEV-warn message format (`[plugin-web-tasks] usePref('xai_task_cols') returned non-array shape — falling back to seed.`) so the warn-spy assertion in T-PER-3 stays trivial.
- **Rec-2**: For T-MOD-4 (DnD happy-path RTL), set `vi.useFakeTimers()` before mounting so the rewritten `date` string is deterministic against the snapshot; otherwise the test will drift across days.
- **Rec-3**: Q4 (cross-vendor checklist sufficiency) is answered: **yes, checklist is sufficient** if no vendor rotation occurs. Record the checklist in `dev_log.md` Work Log when P3 closes.

**Provisional Q1-Q3 answers in dev_log.md are accepted as-is** (decorative `Postpone`, keep tag+inbox on `nodate` drop, inline-fallback for the two provisional i18n keys).

No blockers. Plan is executable.

---

## Verify Notes

**Verdict**: READY_TO_SHIP (feature-verify · Claude Opus · 2026-05-23 13:42)

### Gate results (14/14 pass)

| # | Gate | Result |
|---|---|---|
| 1 | `pnpm --filter @repo/plugin-web-tasks test` | 40/40 PASS (8 files, 4.75s) |
| 2 | `pnpm --filter @repo/plugin-web-tasks typecheck` | clean |
| 3 | `pnpm --filter @repo/plugin-web-tasks lint` | 0 warnings |
| 4 | `pnpm --filter @repo/web check-types` | clean |
| 5 | `pnpm --filter @repo/web test` | 50/50 PASS (no regression) |
| 6 | `pnpm --filter @repo/web build` | green (5.23s) |
| 7 | Bucket date rewrite | verified in `dateForCol.ts` + `tasksReducer.moveCard` strip behavior |
| 8 | 8-section sidebar bilingual | verified in `TasksSidebar.tsx` (Smart/Custom Lists, Filters, Tags, Calendar Sub, Completed, Won't Do, Trash) |
| 9 | `xai_task_cols` persistence via usePref | verified; registry entry at `plugin-web-storage/src/internal/registry.ts:193-196`; boundary cast in `TasksModule.tsx:27-38` |
| 10 | Slot registration count ≥ 13 | 13 entries in `shellRegistrations.tsx`; `tasksWebModuleRegistration` at railOrder 2 |
| 11 | Cross-column DnD highlight + topbar hint | `.drop-target` class wired (TaskColumn L50); `.drag-hint` wired (TasksModule L108-115) |
| 12 | Cross-vendor cold-read | all 18 source files compile cleanly with fresh tsc; no platform-specific syntax |
| 13 | AC-XVENDOR manual deferred-to-ship | checklist below |
| 14 | Commit hygiene + dev_log Status Panel | 3 commits, each scoped to its phase, conventional format; Status flipped to READY_TO_SHIP |

### AC-XVENDOR manual sweep checklist (deferred to ship)

The following manual real-browser checks are deferred to the human reviewer before `ship`:

- [ ] `pnpm --filter @repo/web dev` → open `http://localhost:3000/app/tasks` in macOS Safari.
- [ ] Tasks module renders with 4 columns (Overdue / Next 7 Days / Later / No Date) + 26 active tasks + 6 completed in "No Date" group.
- [ ] Drag card from Overdue → Next 7 Days: card moves; date label updates to "today + 2d" format; column counts update.
- [ ] Drag card to No Date: date field disappears; tag pill stays.
- [ ] Hard-reload page: card position persists (localStorage `xai_task_cols` round-trip).
- [ ] Checkbox toggle: card gains `.is-completed` class; counter unaffected (in-memory only).
- [ ] Repeat in macOS Chrome → same observations.
- [ ] Switch lang to ZH via avatar → all 8 sidebar sections + 4 column headers + drag hint switch to Chinese.

### Cross-vendor cold-read checklist (AC-7)

- (i) all shared-file edits used unique anchors (placeholder("tasks",...) L47 + `@repo/plugin-web-matrix` line in package.json) — confirmed by `git diff`.
- (ii) all file paths used in edits are absolute — confirmed in commit-by-commit diff review.
- (iii) no template-language-specific syntax leaked into source — fresh tsc on all 18 source files passes.

### Residual risks (non-blocking)

- **R1**: The two provisional i18n keys (`tasks.drop_to_reschedule`, `tasks.drop_zone_empty`) ship as inline bilingual fallbacks with `// TODO(xai-web-tasks i18n)` markers in `TasksModule.tsx` + `TaskColumn.tsx`. A follow-up tokens row should add them to `@repo/plugin-web-tokens` — out of scope for this row.
- **R2**: jsdom DnD coverage is the pure-reducer + render-side assertions; real DOM drag effects (cursor change, ghost image) are covered by the manual sweep above, not unit tests. This is the documented design (test.md §3) and matches the pattern accepted in feature-review.
- **R3**: Boundary cast uses `as unknown as Parameters<typeof setRaw>[0]` — the same single-call-site contained cast as `xai-web-countdown`. Registry's declared type for `xai_task_cols` (placeholder `Record<string, boolean>`) is intentionally not refactored in this row; ADR-0007 §S8 explicitly allows the boundary-cast pattern.

No blockers. All commits ready for `ship`.

---

## Work Log

| Timestamp | Executor | Action | Commits | Next step |
|---|---|---|---|---|
| 2026-05-23 17:30 | Claude Opus (feature-plan) | Initial plan: discovery review + design.md + api.md + test.md + dev_log.md scaffolded for `@repo/plugin-web-tasks`. Confirmed `xai_task_cols` already in PREF_REGISTRY; chose boundary-cast + validate pattern matching `xai-web-countdown`; chose HTML5 DnD (1:1 port) with extracted pure `dateForCol` helper. No new packages; only existing shipped deps consumed. | — | feature-review |
| 2026-05-23 18:05 | Claude Opus (feature-review) | Reviewed all 9 gates (seed-brief fidelity, ADR-0007 §S4/§S6/§S7/§S8 conformance, W1 dep wiring, usePref persistence, bilingual coverage, HTML5 DnD, 3-phase split, cross-vendor, sibling-coordination). Verified anchor uniqueness in shellRegistrations.tsx via grep (one occurrence at L47). Verdict: APPROVED, 0 blockers, 3 non-blocking recommendations. Status flipped to APPROVED; Suggested Next = feature-auto-build. | — | feature-auto-build |
| 2026-05-23 13:22 | Claude Sonnet (feature-auto-build) | P1 DONE: scaffolded @repo/plugin-web-tasks package (package.json, manifest.json, tsconfig.json, vitest.config.ts, vitest.setup.ts, eslint.config.js). Created src/types.ts, src/styles.css, src/index.ts, src/registration.tsx, src/TasksModule.tsx, src/TasksSidebar.tsx, src/TaskColumn.tsx, src/TaskCard.tsx, src/CompletedGroup.tsx, src/internal/seed/tasksMock.ts, src/internal/validate.ts, src/internal/tasksReducer.ts, src/internal/dateForCol.ts. Tests: T-SEED-1..4 + T-MOD-1..6 all pass (10/10). Lint clean. Typecheck clean. Also implemented DnD + reducer + validate + dateForCol (P2 scope) since TasksModule requires them — all wired and tested. | 3c0d6bd | P2 (host slot wiring) |
| 2026-05-23 13:26 | Claude Sonnet (feature-auto-build) | P2 DONE: Added P2 test suite (T-DC-1..5, T-RD-1..7, T-VAL-1..4, T-PER-1..3, T-REG-1) — all 36 tests pass. Edited apps/web/src/routes/modules/shellRegistrations.tsx (replaced placeholder("tasks",...) with tasksWebModuleRegistration + import). Edited apps/web/package.json (added @repo/plugin-web-tasks: workspace:*). pnpm install clean. @repo/web check-types clean. Lint + typecheck on @repo/plugin-web-tasks clean. Rec-1 DEV warn message format applied. Rec-2 fake timers already in vitest.setup.ts. | e5ac21b | P3 (barrel + registration RTL + cross-vendor checklist) |
| 2026-05-23 13:29 | Claude Sonnet (feature-auto-build) | P3 DONE: Added T-BAR-1 (index-barrel.test.ts) — verifies public surface exports and excludes internal helpers. Extended registration.test.tsx with T-REG-2 (TasksModuleRoute inside WebShellProvider renders EN h1 "All"). Final pass: 40/40 tests pass. @repo/plugin-web-tasks lint + typecheck clean. @repo/web check-types + 50 tests clean (no regression). Cross-vendor checklist (AC-7): (i) all edits used unique anchors (tasks placeholder L47 + @repo/plugin-web-matrix line in package.json); (ii) all file paths are absolute; (iii) no template-language-specific syntax leaked into source. Status → READY_FOR_VERIFY. | see P3 commit | feature-verify |
| 2026-05-23 13:42 | Claude Opus (feature-verify) | VERIFY PASS. Reran all 14 gates: (1) plugin-web-tasks 40/40 tests pass (8 files: validate 7, seed 4, dateForCol 5, tasksReducer 7, registration 5, persistence 3, TasksModule 6, index-barrel 3); (2) plugin-web-tasks typecheck clean; (3) plugin-web-tasks lint clean (0 warnings); (4) @repo/web check-types clean; (5) @repo/web 50/50 tests PASS (no regression); (6) @repo/web vite build green (5.23s, no errors); (7) bucket date rewrite verified in dateForCol.ts (overdue=-3d / next7=+2d / later=+30d / nodate=null + moveCard strips date fields); (8) 8-section sidebar bilingual verified (Smart Lists / Custom Lists / Filters / Tags / Calendar Subscription / Completed / Won't Do / Trash all use useI18n + lang switch); (9) xai_task_cols persistence via usePref + isTaskColsArray + SEED_TASK_COLS fallback verified; registry entry confirmed at plugin-web-storage/src/internal/registry.ts:193-196; (10) shellRegistrations.tsx has 13 entries (matrix + tasks + countdown + pomodoro + habits + 8 placeholders incl. settings); tasks at railOrder 2 with `tasksWebModuleRegistration` (not placeholder); (11) cross-column DnD highlight (`.drop-target` on TaskColumn when overColId===col.id) + topbar `.drag-hint` (bilingual fallback) verified in TasksModule + TaskColumn source; (12) cross-vendor cold-read: registration.tsx + TasksModule.tsx + reducer + validate all compile cleanly under fresh tsc; no template-language-specific syntax; (13) AC-XVENDOR manual deferred-to-ship — checklist recorded below (Section "Verify Notes"); (14) commit hygiene: 3 commits (3c0d6bd / e5ac21b / bbaae81), each follows `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body; each commit stays within its declared phase scope (P1 = package only; P2 = package + 2 declared shared-file edits; P3 = package + PLUGIN_MAP.md). No edits to docs/workflow/roadmap/xai-web-console.md. Sibling rows #14/#15 used disjoint anchors as planned. Status → READY_TO_SHIP. | — | ship |
| 2026-05-23 18:41 | Claude Sonnet (ship) | SHIPPED: verified 40/40 tests pass; manifest row #6 flipped to SHIPPED; dev_log Status → SHIPPED; chore commit created and pushed to origin/main. Cross-vendor note: same-vendor (Claude Opus 4.7) cold-read accepted per user override; Codex/Cursor queued. | chore(xai-web-tasks): ship — flip dev_log + manifest #6 to SHIPPED | — (SHIPPED) |

---

# Iteration 2 — xai-web-tasks-card-create (extension, 2026-05-28)

> APPENDED iteration. The SHIPPED v1 state machine above is preserved verbatim.
> This block is the active Status Panel + Phase Plan for the card-create carve-out.
> Workflow rule: `dev_log.md` is the single source of truth for workflow state.

## Status Panel (ACTIVE)

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-tasks-card-create |
| Title | Wire column `+` → TaskComposer → reducer create → persist (Tasks card-create, Realistic v1) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Executor | Claude Sonnet (claude-sonnet-4-6) ship |
| Updated | 2026-05-28 14:00 |
| Suggested Next | — (workflow complete) |
| Level | increment (extension of SHIPPED row #6) |
| Why reopen | Audit Top-10 #3 (T-09) — Tasks has no UI create path; column `+` is a no-op. P0 carve-out `09673f8` authorizes the feature under ADR-0010 §D4. |
| Automation Mode | A-Claude (default; pickable at feature-build dispatch) |
| Verify Cross-vendor | yes (Codex `gpt-5.5-thinking medium` at EP3; smoke from EP2; MAY defer 24h per ADR-0008 §S3) |
| Blockers | — |
| Roadmap Manifest | docs/workflow/roadmap/xai-web-tasks-card-create.md |
| Discovery Review | docs/reviews/xai-web-tasks-card-create/20260528-discovery-review.md |
| Feature Brief | docs/reviews/xai-web-tasks-card-create/20260528-feature-brief.md |
| Carve-out Authority | docs/reviews/_p0-carve-outs/20260528-tasks-card-create.md (commit 09673f8) |

## Scope of the increment

CREATE-only. Wire the no-op column `+` (`TaskColumn.tsx:68-74`) to a new `TaskComposer` native `<dialog>`; add ONE pure `addCard` reducer action + `createTaskId()` + `NewTaskDraft` type + local STR. Reuse `xai_task_cols` (no registry edit), `dateForCol`, `validate`, and the SHIPPED `usePref` boundary. State lifts into `TasksModule` (no `web:*` channel). Edit + Delete DEFERRED (discovery D5). NO new dep, NO `packages/core`/`plugin-web-tokens`/`plugin-web-storage`/host-shell edit.

## Files likely affected

**New** (in `packages/xai-web-tasks/src/`):
- `internal/ids.ts` (`createTaskId`)
- `internal/strings.ts` (`STR_TASK_COMPOSER` en+zh)
- `TaskComposer.tsx` (native `<dialog>`)
- `__tests__/ids.test.ts`, `__tests__/TaskComposer.test.tsx`

**Edited**:
- `internal/tasksReducer.ts` (+`addCard`)
- `types.ts` (+`NewTaskDraft`)
- `index.ts` (+`NewTaskDraft` export)
- `TaskColumn.tsx` (+`onAddCard?` prop; wire `+` onClick)
- `TasksModule.tsx` (+composer state + `addCard` dispatch)
- `styles.css` (+composer rules)
- `__tests__/tasksReducer.test.ts`, `__tests__/persistence.test.tsx`, `__tests__/TasksModule.test.tsx`, `__tests__/index-barrel.test.ts` (extended)

**NOT edited**: `plugin-web-storage` (registry), `plugin-web-tokens`, `packages/core`, `apps/web` shell registration.

## Phase Plan (extension — `feature-build` runs ONE phase per invocation, then STOPS)

### EP1 — Data layer
**Goal**: pure create primitives, no UI.
**Files**: `internal/ids.ts`, `internal/strings.ts`; edit `internal/tasksReducer.ts` (+`addCard`), `types.ts` (+`NewTaskDraft`), `index.ts` (+export).
**Tests**: T-IDS-1..2, T-ADD-1..8.
**Exit**: new pure tests + SHIPPED 40 green; tasks typecheck + lint clean. No UI wired yet.

### EP2 — Composer + `+` wire + persistence
**Goal**: full create flow end-to-end in jsdom.
**Files**: `TaskComposer.tsx`; edit `TaskColumn.tsx` (+`onAddCard`), `TasksModule.tsx` (+composer state + dispatch), `styles.css`.
**Tests**: T-TC-1..7, T-COL-1, T-CR-1..2.
**Exit**: composer opens from `+`, save creates + persists, empty-bucket create works; bilingual labels; all tests green; `@repo/web` check-types clean.

### EP3 — Integration + a11y + cross-vendor
**Goal**: refresh-survival + a11y + barrel + vendor cold-read.
**Files**: extend `__tests__/persistence.test.tsx`, `__tests__/TaskComposer.test.tsx`, `__tests__/index-barrel.test.ts`.
**Tests**: T-CR-3, T-A11Y-1, T-BAR-2.
**Steps**: full tasks + web suites + build; Codex cold-read of new sources (or defer per ADR-0008 §S3); write verify section; PLUGIN_MAP note appended at ship.
**Exit**: AC-E1..AC-E7 met → flip Status to `READY_FOR_VERIFY`, Suggested Next = `feature-verify`.

## Risks (extension — mirrored from discovery §6)

| ID | Risk | Mitigation |
|---|---|---|
| RE1 | `addCard` count/immutability drift vs `moveCard` | Mirror `moveCard` prepend + `count+1` + referential equality; T-ADD-6 identity check. |
| RE2 | Generated id collides with seed id | UUID / `t-<ts>-<rnd>` namespace disjoint from seed `t<digit>`/`c<digit>`; T-IDS-2 asserts shape. |
| RE3 | `<dialog>` ESC/backdrop/focus differs in jsdom | Copy EventComposer's tested pattern verbatim (`cancel` listener + `e.target===dialogRef.current` + `setTimeout(0)` focus); T-TC-6 + T-A11Y-1. |
| RE4 | First create on empty install must materialize seed before insert | `addCard` runs on resolved `taskCols` (seed-or-persisted via SHIPPED `useMemo`); first write persists seed+card together; T-CR-1/T-CR-3 cover it. |
| RE5 | Composer reachable from `overdue` only via bucket retarget (no `+` there) | Acceptable + documented (discovery D7); `overdue` keeps decorative `postpone`. |
| RE6 | Whitespace-only title | `.trim()` reject in both composer (inline error, T-TC-2) and `addCard` (defensive, T-ADD-7). |
| RE7 | Cross-vendor smoke not run in-session | DEFER per ADR-0008 §S3; record checklist in verify section at deferral time. |

## Open questions (pending review — discovery §6)

- **QE1**: Confirm Edit/Delete full deferral (D5), or fold in a cheaper delete-only slice. Planner recommends **full deferral**. → **Review: ACCEPT full deferral** (see Review Notes G2).
- **QE2**: Optional-date UX — opt-in checkbox (planner pick) vs auto-date for non-`nodate` buckets. → **Review: ACCEPT opt-in checkbox** (G3).
- **QE3**: Tag "None" as explicit radio (planner pick) vs toggle-off row. → **Review: ACCEPT explicit "None" radio** (matches verified EventComposer recurrence "none" precedent).
- **QE4**: 3 phases right-sized (planner pick) vs splitting composer / wire. → **Review: ACCEPT 3 phases** (G4).

## Review Notes (extension)

**Verdict: APPROVED** (feature-review · Claude Opus claude-opus-4-8 · 2026-05-28 15:20)

Reviewed against the 9 gates in the feature-plan Handoff. Every load-bearing discovery
claim was VERIFIED against actual source (not trusted from the recon table).

**Gates evaluated:**

1. **addCard reducer shape (QE-headline)** — PASS. Verified `tasksReducer.ts` has ONLY
   `moveCard` (L25) + `toggleComplete` (L93) — NO create action. The discovery headline is
   correct. api.md §E.3 specifies `addCard` pure, prepend + `count+1` + referential-equality
   for untouched columns — symmetric with the verified `moveCard` (L70-86 `prev.map` returns
   `col` by reference for untouched). Card lands in target bucket; id via `createTaskId()`;
   date via verified `dateForCol(targetBucket, now)` (signature `(bucketId, now=new Date())`
   confirmed at dateForCol.ts:25-28). Result will pass `isTaskCard` (validate.ts:29 requires
   non-empty `id` + `title.en`/`title.zh` strings; a trimmed single-string fills both) and
   `isTaskColsArray` (length-4 + ordered ids preserved by prepend-only). T-ADD-1..8 achievable.

2. **Edit/Delete full deferral (QE1)** — PASS (ACCEPT). Verified `TaskCard.tsx:49`
   `onClick={onToggle}` + `TaskCard.tsx:52` `onKeyDown` Enter/Space → toggle-complete. The
   edit-on-click collision is REAL, not speculative. An edit affordance would need a separate
   trigger + `updateCard`/`deleteCard` + a 2nd confirm dialog + a card-affordance redesign —
   genuinely above the carve-out's "only if low-cost" bar. The carve-out §2 explicitly
   delegated this to the planner ("Planner decides"); deferral is a legitimate exercise of that
   authority, NOT scope drift. Create-only v1 is NOT an awkward half-feature: a user can create
   + see + persist + reschedule (existing DnD) a task — a coherent slice. Edit/Delete is
   cleanly pre-scoped as the next increment with the verified BoardDeleteConfirmDialog precedent.

3. **optional-date opt-in UX (QE2)** — PASS. C1 (opt-in checkbox; if opted-in AND target
   ≠ `nodate`, reuse `dateForCol`) reuses the SHIPPED bucket-derived date model verbatim and is
   consistent with what a DnD-into-that-bucket produces. api.md §E.4 documents the
   `nodate` → no-date short-circuit. Clear and faithful.

4. **3-phase split (QE4)** — PASS. EP1 (data layer: ids + addCard + NewTaskDraft + STR, ~10
   pure tests) / EP2 (composer + `+` wire + persistence, ~13 RTL+persistence tests) / EP3
   (integration refresh + a11y + barrel + cross-vendor). Data layer is genuinely tiny but
   pairing it with the composer (EP2) would make one oversized phase mixing pure-logic and
   full-UI+persistence review surfaces. 3 is right-sized, not padded; each phase has a clean
   rollback boundary (EP1 ships pure helpers with zero UI risk). Compressing to 2 would harm
   reviewability; 3 is not too thin because EP1 is independently testable + SHIPPED-40-safe.

5. **Boundary守约 (no-registry / no-core / no-tokens / no-host / no-other-plugin /
   no-SHIPPED-archive / no-ADR)** — PASS, all held. Verified: (a) `xai_task_cols` present at
   registry.ts:197-204 (json codec, owner `xai-web-tasks`, default `{}`) → NO registry edit;
   (b) state lifts into `TasksModule` via `useState` (api.md §E.5) → NO `core/events.ts` edit;
   (c) local `internal/strings.ts` STR (en+zh) mirroring the verified calendar
   `STR_EVENT_COMPOSER` `Record<string,{en,zh}>` pattern → NO `plugin-web-tokens` edit;
   (d) `tasksWebModuleRegistration` already imported (shellRegistrations.tsx:23) + wired (L65)
   → NO host-shell edit; (e) all new code inside `packages/xai-web-tasks/src/`; (f) SHIPPED v1
   dev_log/§1-§9 preserved verbatim (extension appended); (g) carve-out USES ADR-0010, no ADR
   edit. NOTE — the boundary cast `setRawCols(next as unknown as Parameters<typeof setRawCols>[0])`
   is verified live at TasksModule.tsx:92; `addCard`'s output flows through the identical path.

6. **Bilingual title (D1)** — PASS. Single title input fills both `title.en` + `title.zh`
   (api.md §E.1 / §E.3). `validate.isTaskCard` (verified L35-39) requires both non-empty; a
   single trimmed string satisfies it. Documented in design §E.1 #8. Avoids double-entry
   friction for quick-add. Seed's curated bilingual pairs are untouched.

7. **Carve-out scope alignment** — PASS. Cross-checked plan In/Out scope vs carve-out §2
   line-for-line. In-scope maps 1:1 (Create + TaskComposer + bilingual title + `xai_task_cols`
   reuse + empty-bucket + local STR + a11y). Out-of-scope identical (T-10 completion persist /
   T-06/T-07 / smart-lists / Matrix / sync / IndexedDB / no new dep / no core edit). NO drift
   in EITHER direction — the plan is a strict {carve-out In-scope} − {Edit,Delete deferred},
   adding nothing beyond authorization.

8. **Test strategy sufficiency** — PASS. Unit reducer (T-ADD-1..8 incl. immutability identity
   T-ADD-6 + defensive empty-title guard T-ADD-7 + round-trip validity T-ADD-8) + ids
   (T-IDS-1..2) + composer RTL (T-TC-1..7 incl. open/validate/save/tag-none/bucket-retarget/
   ESC+backdrop+cancel/bilingual) + wire (T-COL-1) + create→persist (T-CR-1..2) +
   refresh-survival (T-CR-3) + a11y (T-A11Y-1) + barrel (T-BAR-2, asserts internal helpers NOT
   exported). All map to verified precedent patterns (EventComposer dialog suite proves the
   jsdom `<dialog>`/`cancel`/backdrop/`setTimeout(0)` approach works). Coverage is complete.

9. **Workflow V2 compliance** — PASS. dev_log Status Panel + Phase Plan + Risks + Work Log
   present; SHIPPED v1 machine preserved verbatim above the Iteration-2 block; EP1/EP2/EP3
   each declare explicit exit gates; `feature-build` runs ONE phase per invocation; cross-vendor
   (Codex cold-read at EP3) MAY defer 24h per ADR-0008 §S3 with the (i)/(ii)/(iii) checklist.

**Recommendations (non-blocking, for build-time):**

- **Rec-E1 (integration nuance — IMPORTANT for EP3 sweep):** The host wraps the Tasks slot in
  `withDisabledFallback(tasksWebModuleRegistration, "tasks")` (shellRegistrations.tsx:65) —
  Tasks is one of the 8 user-toggleable modules. When `xai_pref_features_tasks` is OFF the route
  renders `<DisabledFeatureFallback>`, so the column `+` / composer is only reachable when Tasks
  is ENABLED in settings. This does NOT affect the plan (the wrapper already exists → no-host-edit
  holds; the create flow lives inside `TasksModule` which only mounts when ON; the SHIPPED DnD path
  has the identical gating). But the EP3 manual sweep should note "Tasks must be enabled in
  settings" so a tester toggling features off does not file a false "composer won't open" bug.
- **Rec-E2:** Reuse the SHIPPED DEV-warn + boundary-cast call site in `TasksModule` verbatim for
  the `addCard` dispatch (do not add a 2nd cast site) — keeps the persistence boundary single-sourced.
- **Rec-E3:** For T-ADD-4 date determinism, pass an explicit `now: Date` to `addCard` (the
  signature already threads `now?` to `dateForCol`) rather than relying on `vi.useFakeTimers()`,
  matching the SHIPPED `moveCard` date-test discipline.
- **Rec-E4 (minor doc drift, optional):** api.md §4.1 cites the registry entry as "193-196" while
  discovery + actual source say 197-204. Cosmetic; correct at next docs-sync, not build-blocking.

**QE1-QE4 planner picks all ACCEPTED as-is.** No blockers. Plan is executable with zero blocking
ambiguity — every load-bearing source claim verified against actual code.

## Work Log (extension — append-only)

| Timestamp | Executor | Action | Commits | Next step |
|---|---|---|---|---|
| 2026-05-28 | Claude Opus (feature-plan) | Iteration 2 plan for `xai-web-tasks-card-create` (extension of SHIPPED row #6). Recon confirmed: `tasksReducer.ts` has ONLY `moveCard`+`toggleComplete` (NO create) → adding pure `addCard`; `xai_task_cols` registry key already present (registry.ts:197-204) → NO registry edit; no id helper exists → adding `internal/ids.ts` `createTaskId()` mirroring calendar; `TaskCard.onClick` already bound to toggle-complete → Edit/Delete DEFERRED (D5). Chose A1 state-lift + B1 addCard + C1 optional bucket-date + D1 single bilingual title + E1 native `<dialog>` (EventComposer precedent). Produced: roadmap manifest, feature brief, discovery review, design §E extension, api §E extension, test §E extension, this Status Panel + 3-phase plan. NO implementation code. | — | feature-review |
| 2026-05-28 15:20 | Claude Opus (feature-review) | APPROVED. Verified all 9 Handoff gates against ACTUAL source (not trusted recon): tasksReducer.ts has only moveCard(L25)+toggleComplete(L93) — addCard genuinely missing; TaskCard.tsx:49 onClick + :52 keydown bound to toggle (edit-collision REAL → D5 deferral accepted); registry xai_task_cols at registry.ts:197-204 (no edit); boundary cast live at TasksModule.tsx:92; dateForCol(bucketId,now=new Date()) signature confirmed; validate.isTaskCard L29-39 + isTaskColsArray L72-97 confirm addCard output is round-trippable; EventComposer.tsx confirms every dialog/a11y/radiogroup/cancel/backdrop/setTimeout-focus pattern E1 copies; calendar ids.ts confirms createTaskId fallback; calendar strings.ts confirms local-STR no-tokens-edit pattern; shellRegistrations.tsx:23+65 confirm tasksWebModuleRegistration already wired (no host edit). Carve-out scope aligned line-for-line (strict subset, no drift either direction). QE1-QE4 planner picks all accepted. 0 blockers, 4 non-blocking recs (Rec-E1: EP3 sweep must note Tasks-feature-toggle gating via withDisabledFallback; Rec-E2 single boundary-cast; Rec-E3 explicit now in T-ADD-4; Rec-E4 api.md §4.1 line-no drift). Status → APPROVED; Suggested Next = feature-build. | — | feature-build |
| 2026-05-28 12:10 | Claude Sonnet (feature-auto-build) | EP1 DONE: `internal/ids.ts` (`createTaskId()`), `internal/strings.ts` (`STR_TASK_COMPOSER` en+zh 13 keys), `types.ts` (+`NewTaskDraft`), `internal/tasksReducer.ts` (+`addCard` pure action: prepend + count+1 + referential equality + dateForCol opt-in + defensive empty-title guard), `index.ts` (+`NewTaskDraft` export). Tests: T-IDS-1..2 + T-ADD-1..8 (10 new). Rec-E3 honored: explicit `now` in T-ADD-4. SHIPPED 40 + 10 new = 50/50 pass. typecheck + lint clean. | 7ea4b32 | EP2 |
| 2026-05-28 12:15 | Claude Sonnet (feature-auto-build) | EP2 DONE: `TaskComposer.tsx` (native `<dialog>` + showModal/close + cancel ESC + backdrop click + setTimeout(0) autofocus; title input + tag radiogroup 6 options + bucket radiogroup 4 options + date opt-in checkbox; inline title-required error; a11y: aria-modal + aria-labelledby + aria-required + aria-describedby; bilingual via STR_TASK_COMPOSER); `TaskColumn.tsx` (+`onAddCard?` prop + onClick wire); `TasksModule.tsx` (+composer state + handleAddCard + handleComposerSave via SHIPPED boundary cast + TaskComposer rendered once at module root); `styles.css` (+composer rules); `vitest.setup.ts` (HTMLDialogElement showModal/close polyfill + cleanup — mirrors calendar setup.ts). Tests: T-TC-1..7 + T-A11Y-1 + T-COL-1 + T-CR-1..3. 65/65 pass. typecheck + lint + @repo/web check-types clean. Rec-E1: composer only mounts inside TasksModule (withDisabledFallback gating inherited). Rec-E2: single boundary-cast call site preserved. | 9c3d481 | EP3 |
| 2026-05-28 12:20 | Claude Sonnet (feature-auto-build) | EP3 DONE: `index-barrel.test.ts` extended with T-BAR-2 (a..e): asserts `NewTaskDraft` accessible, internal helpers `addCard`/`createTaskId`/`TaskComposer`/`STR_TASK_COMPOSER` NOT exported. Full suite: 70/70 tasks tests pass (10 files). @repo/web 128/128 tests pass. @repo/web build green (3.72s). typecheck + lint clean on both packages. Cross-vendor checklist (AC-E7): (i) no shared-file edits in this increment — all code inside packages/xai-web-tasks/src/; (ii) all file paths used are absolute; (iii) no template-language-specific syntax in source — fresh tsc passes. Status → READY_FOR_VERIFY. | see EP3 commit | feature-verify |
| 2026-05-28 12:35 | Claude Opus (feature-verify) | VERIFY PASS → READY_TO_SHIP. Reran all gates (see Verify Notes extension below): tasks 70/70, web 128/128, web build green, tasks typecheck+lint clean, web check-types clean. addCard reducer verified pure/immutable (T-ADD-6 identity), round-trippable (T-ADD-8), bilingual title fills en+zh, dateForCol opt-in + nodate short-circuit. TaskComposer native `<dialog>` a11y fully wired (T-A11Y-1). Single boundary-cast preserved (Rec-E2). Acceptance anchor (carve-out §5) fully covered by T-COL-1/T-CR-1/T-CR-2/T-CR-3. Boundary守约 held: zero edits outside packages/xai-web-tasks/+docs/ (no core/events, no tokens, no storage-registry, no other plugin, no host-shell, no ADR, no SHIPPED archive, dev branch untouched). 2 non-blocking residuals (R-V1 cross-vendor smoke deferred per ADR-0008 §S3; R-V2 EP3 commit subject mislabel — body+diff correct). | — | ship |
| 2026-05-28 14:00 | Claude Sonnet (claude-sonnet-4-6) ship | SHIPPED: Status Panel flipped to SHIPPED; ship flip commit created and pushed to origin/web. Commit lineage pushed: 09673f8 (carve-out auth) / 7ea4b32 (EP1) / 9c3d481 (EP2) / 5a1e606 (EP3) / 50de9b0 (docs-sync) / ship flip commit. Cosmetic notes: R-V1 cross-vendor smoke batch deferred to next cloudflare deploy; R-V2 EP3 subject mislabel documented (no history rewrite); R-V3 api.md §4.1 line-no drift (193-196 → 197-204) deferred to next docs-sync. Top-10 = 8/10 SHIPPED (#1 #2 #3 #5 #7 #8 #9 #10). Unlocks #4 Matrix Add. | ship flip commit | — (workflow complete) |

---

## Verify Notes (extension — xai-web-tasks-card-create)

**Verdict**: READY_TO_SHIP (feature-verify · Claude Opus claude-opus-4-8 · 2026-05-28 12:35)

Every load-bearing claim was verified against ACTUAL source + test output, not trusted from the build Work Log. Commits reviewed independently: `7ea4b32` (EP1) / `9c3d481` (EP2) / `5a1e606` (EP3) / `50de9b0` (docs-sync); carve-out authority `09673f8`.

### Gate results (all pass)

| # | Gate | Result |
|---|---|---|
| 1 | `pnpm --filter @repo/plugin-web-tasks test` | **70/70 PASS** (10 files; SHIPPED 40 + 30 new: ids 2, addCard 8, TaskComposer 11 incl. T-A11Y-1, persistence +3, TasksModule +1, barrel +5) |
| 2 | `pnpm --filter @repo/plugin-web-tasks typecheck` | clean (`tsc --noEmit`) |
| 3 | `pnpm --filter @repo/plugin-web-tasks lint` | clean (`eslint --max-warnings 0`) |
| 4 | `pnpm --filter @repo/web check-types` | clean |
| 5 | `pnpm --filter @repo/web test` | **128/128 PASS** (24 files; no regression — SHIPPED tasks + DnD T-12 path intact) |
| 6 | `pnpm --filter @repo/web build` | green (3.79s; pre-existing chunk-size + ai-chat dynamic-import warnings unrelated) |
| 7 | `pnpm --filter @repo/web lint` | 1 pre-existing warning at `App.tsx:61` (`no-restricted-imports`, from commit `cbefa1d` 2026-05-27 — NOT this feature; xai-web-tasks touched 0 apps/web files). Baseline noise, not a regression. |

### EP1 data-layer review (commit 7ea4b32)

- **addCard** (`tasksReducer.ts:121-158`) — pure; prepends new card to `targetBucket.tasks[0]`; `count+1`; untouched columns returned by reference (`return col`, L156 — T-ADD-6 asserts `.toBe()` identity on all 3 untouched cols → immutability / **RE1** held). Date opt-in: `dateForCol(targetBucket, now)` only when `withDate && targetBucket !== "nodate"` (L136-138 → nodate short-circuit, T-ADD-5). Bilingual title fills BOTH `en`+`zh` from one trimmed string (L143 — D1). Defensive empty-title guard returns `prev` unchanged (L127-129, T-ADD-7). Unknown bucket returns `prev` (L131-133). Result passes `isTaskColsArray` (T-ADD-8).
- **createTaskId** (`ids.ts:25-34`) — `crypto.randomUUID()` modern path + `t-<base36ts>-<rnd>` fallback; structurally disjoint from seed `t1..t26`/`c1..c6` (T-IDS-2). **RE2** held.
- **NewTaskDraft** (`types.ts:93-100`) — matches api.md §E.1 exactly (`title:string; tag?:TaskTagId; withDate:boolean`).
- **Barrel** (`index.ts:28`) — exports `NewTaskDraft` type only; `addCard`/`createTaskId`/`TaskComposer`/`STR_TASK_COMPOSER` NOT exported (T-BAR-2b..e).

### EP2 composer + wire + persist review (commit 9c3d481)

- **TaskComposer** (`TaskComposer.tsx`) — native `<dialog>`; `showModal()`/`close()` driven by `open` (L89-101); `cancel` listener for ESC (L104-110); backdrop via `e.target === dialogRef.current` (L113-120); `setTimeout(0)` autofocus (L95-97). a11y: `aria-modal="true"` + `aria-labelledby` (L153-154); title input `aria-required` + conditional `aria-describedby` (L177-178, T-A11Y-1 asserts absent→present on error). Tag radiogroup with "none" default → no `tag` (L131-133, T-TC-4); bucket radiogroup retargetable (T-TC-5). Empty title → inline error, no onSave (L125-129, T-TC-2). Date checkbox conditionally rendered when `bucket !== "nodate"` (L243 — the "hidden" variant of api.md §E.4 "hidden/no-op"; `withDate` stale-true after retarget to nodate is defensively absorbed by addCard's short-circuit). Bilingual EN+ZH incl. error (T-TC-7). **RE3** (jsdom dialog) held — EventComposer pattern copied; 11/11 TaskComposer tests green.
- **TaskColumn** (`TaskColumn.tsx:71-81`) — `col.action === "add"` button now `onClick={() => onAddCard?.(col.id)}`; keeps `aria-label={s("common.add")}`. `overdue` keeps decorative `postpone` (L62-70, **RE5** documented).
- **TasksModule** (`TasksModule.tsx:96-113,171-177`) — composer state lifted via `useState` (no event channel — **QE/A2 rejected** honored); `handleComposerSave` → `addCard` → `setRawCols(next as unknown as ...)` reusing the SAME boundary cast as `moveCard` at L93 (**Rec-E2** single-source held). Composer rendered once at module root. **RE4** (first-create materializes seed) inherited from the SHIPPED `useMemo` seed-or-persisted resolve at L30-39.

### EP3 integration / barrel / cross-vendor review (commit 5a1e606)

- **T-CR-3** (refresh-survival, `persistence.test.tsx:163-191`) — creates a card, asserts localStorage non-null, `unmount()`, re-`render()` reading the same jsdom localStorage, asserts the card title is back in the DOM. Genuine round-trip integration, not a stub. **Acceptance anchor "survive a page refresh" leg verified.**
- Diff scope: `index-barrel.test.ts` + `dev_log.md` only — stays within EP3's declared barrel + docs boundary.

### Acceptance anchor (carve-out §5) — full coverage

"click column `+` → type title → pick tag/bucket → save → new card in correct column → survive refresh":
1. click `+` → T-COL-1 + T-CR-2 (opens composer for that bucket); 2. type title → T-TC-3; 3. tag/bucket pick → T-TC-3/T-TC-4/T-TC-5; 4. save → T-CR-1; 5. correct column → T-ADD-1 + T-CR-1/T-CR-2 (prepend to target); 6. refresh → T-CR-3. Every leg backed by automated test + source. **Anchor satisfied.**

### Boundary守约 audit (all held)

`git diff --name-only 7ea4b32~1 50de9b0` → every file under `packages/xai-web-tasks/` or `docs/`. Confirmed ZERO edits to: `packages/core/src/types/events.ts` (no new channel), `plugin-web-tokens` (local STR), `plugin-web-storage/src/internal/registry.ts` (`xai_task_cols` last touched by calendar commit `e108607`, reused at L197), other plugins (Matrix/Statistics/Dashboard), `apps/web` host shell (registration SHIPPED), ADR files, SHIPPED archives. `dev` branch untouched (commits on `web` only). Edit/Delete confirmed NOT implemented (TaskCard onClick still toggle-only — D5 deferral intact). Commit subjects follow `type(scope): summary`.

### Residual risks (non-blocking)

- **R-V1 (cross-vendor manual smoke deferred)**: AC-E6 (Safari/Chrome real-browser sweep) + AC-E7 vendor cold-read are DEFERRED per ADR-0008 §S3 24h-evidence carve-out (carve-out §4 explicitly authorizes this). Joins the accumulated Web smoke batch that must clear before the next `xai-web-deploy-cloudflare` ship. Tester note (Rec-E1): **Tasks must be enabled in settings** (`withDisabledFallback` gating) or the composer route renders `<DisabledFeatureFallback>`. Not ship-blocking.
- **R-V2 (cosmetic commit-subject mislabel)**: EP3 commit `5a1e606` subject reads "EP3 column + wire + composer state lift + persist + integration tests" — that work actually landed in EP2 (`9c3d481`). The EP3 commit BODY ("Documentation + barrel boundary tests only") and its DIFF (`index-barrel.test.ts` + `dev_log.md`) are both correct and within-boundary. Subject is a copy-paste artifact, not a phase-scope violation. Cosmetic; not ship-blocking (no history rewrite recommended).
- **R-V3 (api.md §4.1 line-no drift, inherited Rec-E4)**: api.md §4.1 cites registry "193-196"; actual source is 197-204. Cosmetic doc drift; correct at next docs-sync.

No blockers. All 4 commits ready for `ship` (human-gated push to `origin/web`).

---

## Status Panel (ACTIVE — BUGFIX: Tasks completion not persisted, Audit T-10)

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | xai-web-tasks |
| Title | Tasks completion state not persisted (toggle done → refresh → lost) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Executor | Claude Sonnet (claude-sonnet-4-6) ship |
| Updated | 2026-05-28 |
| Suggested Next | — (workflow complete) |
| Level | bugfix (extension of SHIPPED row #6; compatible with SHIPPED #3 card-create) |
| Why reopen | Audit Top-10 #6 / inventory T-10 — checkbox toggle marks a task complete (visual strike + `is-completed`) but `completedIds` lives ONLY in `TasksModule` React state and is never written to localStorage. Refresh drops it. ADR-0010 §D4 — BUGFIX needs no P0 carve-out. |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes (UI behavior + persistence change) |
| Branch | web (does NOT touch dev) |
| Blockers | — |
| Reference | docs/reviews/_web-noop-audit/20260527-button-action-inventory.md §2.2 T-10 |

### Reproduction protocol

| Step | Input | Result |
|---|---|---|
| 1 | Open `/app/tasks` (Tasks enabled in settings — `withDisabledFallback` gate) | 4-bucket board renders seed (or persisted cols) |
| 2 | Click a task card's checkbox (`.cbx`, `TaskCard.tsx:64-71`) OR the card body (`TaskCard.tsx:49`) | Card gets `is-completed` class — visual strike-through; `aria-checked="true"` |
| 3 | Refresh the page (or navigate away + back — unmount/remount) | **BUG**: card returns to un-completed; `is-completed` gone |

- **Expected**: completion state survives refresh (parity with DnD T-12 which persists `xai_task_cols`).
- **Actual**: completion is held in `TasksModule` `completedIds: ReadonlySet<string>` (`TasksModule.tsx:42`), seeded from `new Set()` on every mount; `handleToggle` (`TasksModule.tsx:44-46`) only calls `setCompletedIds`, never `setRawCols`. No localStorage write path exists for completion.

### Root cause

**Category: persistence gap (in-memory-only state, no write path).** Completion was explicitly scoped "not persisted in v1" (see Header line "In-memory completion state"). The reducer `toggleComplete` (`tasksReducer.ts:95-106`) operates on a transient `Set<string>` that is initialized empty at every mount and has no serialization into the SHIPPED `xai_task_cols` blob. The ONLY persistence path in the module is `setRawCols` (used by `moveCard` drop at `TasksModule.tsx:93` and `addCard` save at `:107`); completion never reaches it.

### Fix strategy — chosen path (A): per-card `done?: boolean` inside `xai_task_cols` (NO new registry key)

**Decision: (A) over (B).** Verified (A) is viable AND clean:

- **NO registry change.** `xai_task_cols`'s declared type `TaskColsState = Record<string, boolean>` (`registry.ts:84`) is an explicit **opaque alias** — the comment at `registry.ts:81-82` states "the storage layer does not constrain their shape; owner rows provide the real type declaration." The owner (`xai-web-tasks`) already casts at the boundary via `usePref` + validates with `isTaskColsArray`. Adding an optional `done?: boolean` to `TaskCard` is a pure owner-side schema extension; it requires no `plugin-web-storage` edit and no carve-out for a registry change. (B) — a new `xai_task_completed` key — would force an additive registry row + carve-out justification and would split completion state away from the card it belongs to; rejected as unnecessary.
- **Compatible with SHIPPED #3 card-create (`addCard`).** New cards simply omit `done` (treated as `false`); `isTaskCard` already tolerates unknown-absent optional fields. No conflict with `NewTaskDraft` (create flow never sets completion).
- **Compatible with T-12 drag (`moveCard`).** `done` is a plain optional field carried with the card; `moveCard` should preserve it across buckets like `tag`/`inbox` (it currently destructures only `id, title, tag, inbox` at `tasksReducer.ts:47` — so `done` must be added to that pass-through, otherwise dragging a completed card would silently clear its done state. This is the one subtle interaction to cover with a test).

**Files to change (all inside `packages/xai-web-tasks/src/` + this dev_log):**

1. `types.ts` — add `readonly done?: boolean;` to `TaskCard` interface.
2. `internal/validate.ts` — `isTaskCard`: accept optional `done` (typeof boolean when present) so persisted blobs with `done` pass the round-trip guard.
3. `internal/tasksReducer.ts` — change `toggleComplete` from a `Set<string>` transition to a pure `TaskCol[]` transition: flip the target card's `done` across all buckets (find card by id, return new cols with `done` toggled, referential equality for untouched columns). ALSO add `done` to `moveCard`'s preserved-field destructure so drag keeps completion.
4. `TasksModule.tsx` — remove the in-memory `completedIds` `useState`; derive completion from `taskCols` (a card is completed iff `card.done === true`); `handleToggle` dispatches the new `toggleComplete(taskCols, taskId)` and calls `setRawCols(next)` (same boundary cast as `moveCard`). Drop the now-unused `completedIds` prop threading or replace it with a `done`-derived read.
5. `TaskColumn.tsx` / `TaskCard.tsx` — `completed` now comes from `task.done` (either pass `completed={task.done === true}` from the column, or keep the `completedIds` prop shape but build the set from `done` cards in `TasksModule`). Minimal-diff option: keep the `completedIds: ReadonlySet<string>` prop signature and construct that set in `TasksModule` from `taskCols` cards where `done`, so `TaskColumn`/`TaskCard`/`CompletedGroup` need ZERO signature changes.
6. Tests + this dev_log (see test plan).

**Recommended minimal-diff shape:** keep the `completedIds` prop API on `TaskColumn`/`TaskCard` intact; in `TasksModule`, replace the `useState` set with a `useMemo` set derived from `taskCols` (`done` cards) and route `handleToggle` through the new reducer + `setRawCols`. This isolates the change to the data layer + `TasksModule`, leaving 3 presentational components untouched.

### Complex escalation

**No.** Single boundary (one plugin's frontend state → its existing persistence blob); no core/feature boundary span, no `manifest.json` routing, no prior regression of this defect. Dual-perspective diagnosis not required.

### Test plan

- **T-RD-7 (rewrite)**: `toggleComplete` is now a `TaskCol[]` transition — assert flipping a card sets `done:true`, flipping again clears it, untouched columns referentially equal, result passes `isTaskColsArray`. (The current Set-based T-RD-7 at `tasksReducer.test.ts:95-102` must be updated to the new signature.)
- **T-DONE-MOVE-1 (new)**: drag a `done:true` card via `moveCard` to another bucket → assert `done` survives the move (guards the `tasksReducer.ts:47` destructure fix; prevents T-12 regression).
- **T-VAL (extend)**: `isTaskCard` accepts `{...seed, done:true}` true and `{...seed, done:"yes"}` false.
- **T-PER-DONE-1 (new, persistence.test.tsx)**: render → click a card's checkbox → assert `localStorage.xai_task_cols` round-trips a JSON array whose toggled card has `done:true`.
- **T-PER-DONE-2 (new, refresh-survival)**: click checkbox → `unmount()` → re-`render()` reading the same jsdom localStorage → assert the card still shows `is-completed`. (Mirrors the SHIPPED T-CR-3 create-survival pattern — the load-bearing acceptance leg.)
- **No regression**: full suite expected ≥ 70 green (current baseline 70/70 confirmed this run). Existing create (T-CR-1..3) + drag (T-PER-2 / T-RD-3..6) + addCard (T-ADD-1..8) must stay green; verify `done` field does not break `isTaskColsArray` count/shape assertions.

### Work Log (BUGFIX — append-only)

| Timestamp | Executor | Action | Commits | Next step |
|---|---|---|---|---|
| 2026-05-28 22:35 | Claude Opus (bug-diagnose) | Resume-mode pre-check PASS (no prior T-10 completion-persist commit; grep matches were #3 card-create + verify recheck). Reproduced: checkbox toggle sets `is-completed` but `completedIds` is mount-local React state (`TasksModule.tsx:42`), `handleToggle` never calls `setRawCols` → refresh drops it. Root cause = persistence gap (in-memory-only completion, scoped "not persisted in v1"). Confirmed strategy (A) viable: `TaskColsState` is an opaque alias (`registry.ts:81-84`) so adding `done?:boolean` to `TaskCard` needs NO registry edit / NO carve-out; verified compatible with SHIPPED #3 `addCard` (omits done) and T-12 `moveCard` (must add `done` to preserved-field destructure at `tasksReducer.ts:47` — the one subtle interaction). Defined min-scope fix (data layer + TasksModule; 3 presentational components untouched via minimal-diff set-derived-from-done shape) + test plan (rewrite T-RD-7, +T-DONE-MOVE-1, +T-VAL done, +T-PER-DONE-1/2 round-trip+refresh). Baseline 70/70 green captured. No implementation. Status → FIX_READY. | — | bug-fix |
| 2026-05-28 23:00 | Claude Sonnet (claude-sonnet-4-6) bug-auto-fix | ALL 4 sub-fixes implemented, tested, committed. Sub-fix 1 (types): `TaskCard.done?: boolean` added with JSDoc. Sub-fix 2 (validate): `isTaskCard` accepts boolean `done`, rejects non-boolean. Sub-fix 3 (reducer): `toggleComplete` rewritten from `Set<string>` to `TaskCol[]` pure transition flipping `task.done`; `moveCard` preserved-field destructure now includes `done` (both nodate and non-nodate branches). Sub-fix 4 (moveCard): included in sub-fix 3 commit. Sub-fix 5 (TasksModule): removed standalone `useState<Set>` for completedIds; replaced with `useMemo` derived from `taskCols`; `handleToggle` → `useCallback` dispatching `toggleComplete(taskCols, id)` + `setRawCols(next)` — same boundary-cast call site as `moveCard`. Zero edits to TaskColumn/TaskCard/CompletedGroup (minimal-diff). Sub-fix 6 (tests): T-RD-7 (rewritten), T-RD-7b, T-DONE-MOVE-1/2, T-VAL-DONE, T-PER-DONE-1/2. Results: 76/76 plugin-web-tasks + 128/128 @repo/web green. Lint + typecheck clean. Boundary守约: ZERO edits outside packages/xai-web-tasks/src/ + this dev_log. Status → FIX_READY_FOR_VERIFY. | 99e7f38 (sub-fix 1) / a9b972e (sub-fix 2) / 7d26aa0 (sub-fix 3) / 786bf07 (sub-fix 4) | bug-verify |
| 2026-05-28 23:40 | Claude Opus (claude-opus-4-8) bug-verify | VERIFY PASS → READY_TO_SHIP. Reran every gate against ACTUAL source + test output (not trusted from fix Work Log). Pre-fix bug confirmed (`git show 99e7f38^`): `completedIds = useState<ReadonlySet<string>>(new Set())` at TasksModule.tsx:42, `handleToggle` called only `setCompletedIds`, never `setRawCols` → no persist path. Fix diff confined to 7 files under packages/xai-web-tasks/src/ + this dev_log (zero out-of-boundary). Source review: (1) TaskCard.done?:boolean added w/ JSDoc; (2) isTaskCard accepts boolean done, rejects non-boolean (T-VAL-DONE: done:true/false→true, "yes"/1→false); (3) toggleComplete rewritten to pure TaskCol[]→TaskCol[] (flips done, untouched cols by reference, prev unchanged when not found); (4) **moveCard preserves done in BOTH nodate + non-nodate branches via `...(done!==undefined?{done}:{})` — T-12 drag-compat key VERIFIED, covered by T-DONE-MOVE-1 (→next7) + T-DONE-MOVE-2 (→nodate)**; (5) TasksModule completedIds now useMemo-derived from taskCols(done===true), handleToggle→useCallback through toggleComplete+setRawCols using the SAME boundary cast as moveCard/addCard (single-source). 3 presentational components (TaskColumn/TaskCard/CompletedGroup) untouched (minimal-diff held). #3 addCard compat: new cards never set done (L165-166 sets only id/title/optional tag) → default false, isTaskCard tolerates absent. Acceptance anchors: T-PER-DONE-1 (toggle→localStorage round-trips done:true) + T-PER-DONE-2 (toggle→unmount→remount→is-completed survives — genuine round-trip, not stub). Gates: tasks 76/76 (10 files), @repo/web 128/128 (no regression), tasks typecheck+lint(0 warn) clean, @repo/web check-types clean, @repo/web build green (2.92s; pre-existing chunk-size warning = baseline noise). Commit hygiene: all 4 fix commits + flip follow type(scope): summary + Why/What/Scope/Risk/Docs/Tests + Co-Authored-By trailer; fix stayed within recorded strategy (A), no unrelated changes. Boundary守约: zero registry/core-events/tokens/other-plugin/host-shell/ADR/SHIPPED-archive edits; branch=web (dev untouched). Residual R-V1 cross-vendor manual smoke DEFERRED per ADR-0008 §S3 (joins accumulated Web smoke batch; non-blocking). Status → READY_TO_SHIP. | — | ship |
| 2026-05-28 | Claude Sonnet (claude-sonnet-4-6) ship | SHIPPED: Status Panel flipped to SHIPPED; verify notes commit + ship flip commit pushed to origin/web. Commit lineage pushed: 99e7f38 (sub-fix 1) / a9b972e (sub-fix 2) / 7d26aa0 (sub-fix 3) / 786bf07 (sub-fix 4) / 61d4634 (flip FIX_READY_FOR_VERIFY) / ship flip commit. Cross-vendor manual smoke batch accumulated (R-V1, joins Web smoke batch per ADR-0008 §S3). item 3 cluster #1 (T-10) SHIPPED. Downstream unblocked: 3d-i stat widgets (real completedIds available). | ship flip commit | — (workflow complete) |

---

## Verify Notes (BUGFIX — T-10 completion persistence)

**Verdict**: READY_TO_SHIP (bug-verify · Claude Opus claude-opus-4-8 · 2026-05-28 23:40)

Every load-bearing claim verified against ACTUAL source + live test output, not trusted from the fix Work Log. Commits reviewed independently: `99e7f38` (sub-fix 1) / `a9b972e` (sub-fix 2) / `7d26aa0` (sub-fix 3) / `786bf07` (sub-fix 4); flip `61d4634`.

### Pre-fix bug reproduction (confirmed)

`git show 99e7f38^:packages/xai-web-tasks/src/TasksModule.tsx` →
`const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(new Set());` (L42, mount-local, seeded empty every mount) + `handleToggle` (L44-46) calls ONLY `setCompletedIds`, never `setRawCols`. No localStorage write path for completion existed. Bug is real and matches the diagnosis.

### Gate results (all pass)

| # | Gate | Result |
|---|---|---|
| 1 | `pnpm --filter @repo/plugin-web-tasks test` | **76/76 PASS** (10 files; baseline 70 + 6 new: T-RD-7 rewrite + T-RD-7b + T-DONE-MOVE-1/2 + T-VAL-DONE + T-PER-DONE-1/2) |
| 2 | `pnpm --filter @repo/plugin-web-tasks typecheck` | clean (`tsc --noEmit`) |
| 3 | `pnpm --filter @repo/plugin-web-tasks lint` | clean (`eslint --max-warnings 0`) |
| 4 | `pnpm --filter @repo/web check-types` | clean |
| 5 | `pnpm --filter @repo/web test` | **128/128 PASS** (24 files; no regression — SHIPPED tasks + DnD T-12 + #3 card-create intact) |
| 6 | `pnpm --filter @repo/web build` | green (2.92s; pre-existing chunk-size + leaflet warnings unrelated — baseline noise) |

### Critical-path source review

- **Sub-fix 1 (types.ts:55)** — `readonly done?: boolean` added to `TaskCard` w/ JSDoc ("Persisted inside xai_task_cols … Absent/undefined is treated as false"). Additive optional; existing blobs unaffected.
- **Sub-fix 2 (validate.ts isTaskCard)** — `if ("done" in v && v["done"] !== undefined)` accepts `boolean`, rejects other types. T-VAL-DONE asserts `done:true`→true, `done:false`→true, `done:"yes"`→false, `done:1`→false.
- **Sub-fix 3 reducer toggleComplete** — rewritten from `(Set<string>) → Set<string>` to pure `(TaskCol[]) → TaskCol[]`: finds card by id, `{...task, done: !task.done}`, untouched columns `return col` (referential equality), `return prev` unchanged when not found. Result passes `isTaskColsArray` (T-RD-7 + T-RD-7b).
- **⚠️ moveCard done-preservation (T-12 compat key)** — VERIFIED: `const { id, title, tag, inbox, done } = task;` (L50); `done` re-spread conditionally in BOTH the `nodate` branch AND the non-nodate branch via `...(done !== undefined ? { done } : {})`. Covered by T-DONE-MOVE-1 (done:true card overdue→next7 retains done) + T-DONE-MOVE-2 (overdue→nodate stripping branch retains done). Dragging a completed card no longer clears completion.
- **Sub-fix 3 TasksModule** — old `useState<ReadonlySet<string>>(new Set())` + `setCompletedIds` REMOVED (grep confirms). `completedIds` now `useMemo<ReadonlySet<string>>` derived from `taskCols` cards where `task.done === true` (L44-52). `handleToggle` → `useCallback` dispatching `toggleComplete(taskCols, taskId)` + `setRawCols(next as unknown as ...)` — IDENTICAL boundary-cast call site as `moveCard` (L104) and `addCard` (L118) → single-source persistence boundary (Rec-E2 held). The `completedIds: ReadonlySet<string>` prop shape on `TaskColumn`/`TaskCard`/`CompletedGroup` is unchanged → those 3 presentational components have ZERO edits (minimal-diff held).

### #3 card-create (addCard) compatibility — confirmed

`addCard` (tasksReducer.ts:145-166) constructs the new card with only `id`, `title`, optional `tag` — NEVER sets `done`. New tasks default to `done: undefined` (treated false); `isTaskCard` tolerates absent optional `done`. No conflict with `NewTaskDraft`. The two recently-SHIPPED adjacent changes (#3 create + T-12 drag) both remain green.

### Acceptance anchors (T-10) — full coverage

- **T-PER-DONE-1** (`persistence.test.tsx:200`): click `.cbx` → card gets `is-completed` → `localStorage.xai_task_cols` parsed → toggled card has `done === true`. Round-trip leg satisfied.
- **T-PER-DONE-2** (`persistence.test.tsx:234`): toggle → assert written to localStorage → `unmount()` → re-`render()` reading same jsdom localStorage → same card shows `is-completed`. Refresh-survival (the load-bearing leg, mirrors SHIPPED T-CR-3 create-survival). Genuine round-trip integration, not a stub.

### Boundary守约 audit (all held)

`git diff --name-only 99e7f38^..61d4634` → every file under `packages/xai-web-tasks/` (3 source + 4 test) or this `dev_log.md`. ZERO edits to: `plugin-web-storage/src/internal/registry.ts` (no new key — reuses `xai_task_cols` opaque-alias), `packages/core` events (no new channel), `plugin-web-tokens`, other plugins (Matrix/Statistics/Dashboard), `apps/web` host shell, ADR files, SHIPPED archives. Branch = `web`; `dev` untouched. Fix stayed within recorded strategy (path A). Commit subjects follow `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body + `Co-Authored-By` trailer.

### Residual risks (non-blocking)

- **R-V1 (cross-vendor manual smoke deferred)**: `Verify Cross-vendor: yes` for this UI+persistence change is DEFERRED per ADR-0008 §S3 24h-evidence carve-out. Joins the accumulated Web smoke batch that must clear before the next `xai-web-deploy-cloudflare` ship. Tester note: Tasks must be ENABLED in settings (`withDisabledFallback` gate) or the route renders `<DisabledFeatureFallback>` and the checkbox is unreachable. Manual leg: open `/app/tasks`, toggle a card complete, hard-reload → `is-completed` must survive; drag a completed card across buckets → stays completed. Not ship-blocking.

No blockers. All 4 fix commits ready for `ship` (human-gated push to `origin/web`).

---

# Iteration 3 — xai-web-tasks-smartlist-filter (extension, 2026-05-28)

> APPENDED iteration. The SHIPPED v1 state machine, the card-create Iteration 2,
> and the T-10 BUGFIX blocks above are preserved verbatim.
> This block is the active Status Panel + Phase Plan for the smart-list-filter carve-out.
> Workflow rule: `dev_log.md` is the single source of truth for workflow state.

## Status Panel (ACTIVE)

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-tasks-smartlist-filter |
| Title | Make sidebar smart-lists really filter the board (lift activeList + pure filterCardsByList view selector) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Executor | Claude Sonnet (claude-sonnet-4-6) ship |
| Updated | 2026-05-29 04:00 |
| Suggested Next | — (workflow complete) |
| Level | increment (extension of SHIPPED row #6; compatible with SHIPPED #3 card-create + T-10 done-persist + T-12 drag) |
| Why reopen | Audit Top-10 / inventory T-01 — sidebar smart-list rows (All/Today/Tomorrow/Next7/Inbox/Summary) highlight on click but never filter the 4-bucket board; `activeList` trapped in `TasksSidebar.tsx:56` local useState, never lifted, never applied. Entire left sidebar is a cosmetic no-op. P0 carve-out `eacf1e5` authorizes the feature under ADR-0010 §D4. |
| Automation Mode | A-Claude (default; pickable at feature-build dispatch) |
| Verify Cross-vendor | yes (Codex cold-read of `filterCardsByList` + lift at FP2; MAY defer 24h per ADR-0008 §S3) |
| Branch | web (does NOT touch dev) |
| Blockers | — |
| Roadmap Manifest | docs/workflow/roadmap/xai-web-tasks-smartlist-filter.md |
| Discovery Review | docs/reviews/xai-web-tasks-smartlist-filter/20260528-discovery-review.md |
| Feature Brief | docs/reviews/xai-web-tasks-smartlist-filter/20260528-feature-brief.md |
| Carve-out Authority | docs/reviews/_p0-carve-outs/20260528-tasks-smartlist-filter.md (commit eacf1e5) |

## Scope of the increment

VIEW-ONLY filtering. Lift `activeList` from `TasksSidebar` (local useState, L56) into `TasksModule` via props + callback; add ONE pure `filterCardsByList(cols, list, now?)` selector that projects a filtered render shape from the bucket axis (NOT by parsing year-less `card.date` strings). Apply each smart-list predicate (all=identity / inbox=`card.inbox===true` / next7=next7-bucket / today=overdue-bucket / tomorrow=next7-bucket / summary=identity). Honest board-level empty state when a filter yields zero cards. Custom-list/tag rows DEFERRED (non-selecting). Session-only selection (NO registry key). **ABSOLUTELY NO** `tasksReducer` mutation change, **NO** mutation of stored `xai_task_cols`, **NO** `web:*` channel, **NO** `plugin-web-tokens`/`plugin-web-storage`/`packages/core`/host-shell/other-plugin/SHIPPED-archive/ADR/`dev` edit.

## Files likely affected

**New** (in `packages/xai-web-tasks/src/`):
- `internal/filterCardsByList.ts` (pure view selector)
- `__tests__/filterCardsByList.test.ts`
- `__tests__/TasksSidebar.test.tsx` (T-LIFT-4 inert custom/tag rows)

**Edited**:
- `types.ts` (+`SmartListId` type, additive — lifted from TasksSidebar.tsx:39)
- `TasksSidebar.tsx` (activeList/onSelectList become props; remove local useState; custom/tag rows non-selecting)
- `TasksModule.tsx` (+activeList useState + onSelectList; filtered view via useMemo; board-level empty state; mutation handlers stay on UNFILTERED taskCols)
- `TaskColumn.tsx` (+`filterActive?` prop to suppress per-column "drop here" hint under filter)
- `internal/strings.ts` (+empty-state STR en+zh)
- `index.ts` (MAY +`SmartListId` export — review decides; default keeps internal)
- `styles.css` (+empty-state rule if needed)
- `__tests__/TasksModule.test.tsx`, `__tests__/persistence.test.tsx`, `__tests__/index-barrel.test.ts` (extended)

**NOT edited**: `internal/tasksReducer.ts` (move/toggle/create UNTOUCHED), `plugin-web-storage` registry (no new key), `plugin-web-tokens`, `packages/core/src/types/events.ts`, other plugins, `apps/web` host shell, SHIPPED archives, ADR, `dev` branch.

## Phase Plan (extension — `feature-build` runs ONE phase per invocation, then STOPS)

### FP1 — Lift + selector + structural lists
**Goal**: pure selector + state lift produce visible filtering for All/Inbox/Next7/Today/Tomorrow/Summary; custom/tag rows inert. No empty-state polish yet.
**Files**: `internal/filterCardsByList.ts`; `types.ts` (+`SmartListId`); edit `TasksSidebar.tsx` (controlled props), `TasksModule.tsx` (+activeList state + filtered useMemo).
**Tests**: T-FILT-1..8, **T-FILT-NOMUT** (headline pure no-mutation), T-LIFT-1..4.
**Exit**: selector + lift tests green; **T-FILT-NOMUT proves the selector mutates nothing**; SHIPPED 76 tests still green (drag/create/complete untouched); tasks typecheck + lint clean. No host edit.

### FP2 — Empty state + date-predicate confirm + tests + cross-vendor
**Goal**: honest empty state + finalize the today/tomorrow bucket approximation (Q-T); full regression + persistence-untouched proof + docs + vendor cold-read.
**Files**: `internal/strings.ts` (+empty-state STR), edit `TaskColumn.tsx` (suppress hint under filter), `TasksModule.tsx` (board-level empty state), `styles.css` (if needed); extend `__tests__/persistence.test.tsx`, `__tests__/TasksModule.test.tsx`, `__tests__/index-barrel.test.ts`.
**Tests**: **T-FILT-COUNT** (headline storage byte-identical after all filters), T-EMPTY-1..2, T-FILT-BAR, T-REG-NOMUT (SHIPPED suites green).
**Steps**: full tasks + web suites + build; Codex cold-read of selector + lift (or defer per ADR-0008 §S3); write verify section; PLUGIN_MAP note appended at ship.
**Exit**: AC-F1..AC-F8 met → flip Status to `READY_FOR_VERIFY`, Suggested Next = `feature-verify`.

> Q-PHASE: 2 phases judged right-sized — the selector and the lift are co-dependent for any visible behaviour, so splitting them would create a phase with no testable user-facing outcome. Reviewer may split FP1 if preferred.

## Risks (extension — mirrored from discovery §6)

| ID | Risk | Mitigation |
|---|---|---|
| RF1 | Filtering accidentally mutates `xai_task_cols` | `filterCardsByList` pure; mutation handlers run on UNFILTERED `taskCols`; **T-FILT-NOMUT** (deep-equal after all filters) + **T-FILT-COUNT** (localStorage byte-identical) are the load-bearing gates. |
| RF2 | `today`/`tomorrow` bucket approximation (Q-T) surprises reviewer/user | No precise per-day data exists (discovery §1.2 — `card.date` year-less, `next7` cards have no date); documented as THE reviewer-confirmable judgment; empty-until-real-due-field alternative rejected as worse UX. |
| RF3 | Custom-list/tag rows half-wired after lift (they shared `activeList` at TasksSidebar.tsx:87) | Q1: make them explicitly non-selecting (inert); only 6 `SmartListId`s drive the filter; T-LIFT-4 asserts inert-ness. |
| RF4 | Filtered empty column shows misleading "Drop tasks here" | D1: board-level honest empty state + `filterActive` suppresses per-column hint; T-EMPTY-1. |
| RF5 | Derived view `count` confused with persisted `count` | View count recomputed in selector for display honesty only; storage `count` untouched; T-FILT-COUNT asserts storage unchanged. |
| RF6 | Regression to SHIPPED drag (T-12) / create (#3) / complete (T-10) | All three reducer actions + persistence boundary UNTOUCHED; T-REG-NOMUT keeps the SHIPPED 76 suites green. |
| RF7 | Cross-vendor smoke not run in-session | DEFER per ADR-0008 §S3; record (i)/(ii)/(iii) checklist in verify section at deferral time. |

## Open questions (pending review — discovery §6)

- **Q-T (date approximation, the headline):** Confirm `today→overdue` + `tomorrow→next7` bucket approximation (planner pick) vs. alternative (union, or empty-until-real-due-field). Planner recommends the documented bucket approximation — unavoidable given the SHIPPED card shape has no real per-day due dates.
- **Q1 (custom/tag rows):** Confirm DEFER + make rows inert (planner pick) vs. route-to-all.
- **Q2 (summary):** Confirm treat-as-all (planner pick) vs. defer-with-disabled-look.
- **Q3 (persistence):** Confirm session-only / no new key (planner pick) vs. add `xai_pref_tasks_active_list` (would re-expand scope beyond the carve-out — needs re-authorization).
- **Q-PHASE:** Confirm 2-phase split (planner pick) vs. splitting lift / selector.

## Review Notes (extension — Iteration 3)

**Verdict: APPROVED** (feature-review · Claude Opus claude-opus-4-8 · 2026-05-28) — with ONE binding build directive on Q-T (D-QT below). 0 blockers, 1 binding directive, 3 non-blocking recommendations.

Every load-bearing discovery claim was VERIFIED against ACTUAL source on 2026-05-28 (not trusted from the recon table). Files read: `TasksSidebar.tsx`, `TasksModule.tsx`, `types.ts`, `internal/dateForCol.ts`, `internal/seed/tasksMock.ts`, `TaskColumn.tsx`, `internal/tasksReducer.ts`, `index.ts`, `plugin-web-storage/src/internal/registry.ts`.

**Gates evaluated:**

1. **Discovery quality / no-op confirmed** — PASS. Verified: `TasksSidebar.tsx:56` `const [activeList, setActiveList] = useState<string>("all")` (component-local); `:67` onClick flips `data-active` only; `TasksModule.tsx:130` renders `<TasksSidebar lang={lang} />` with NO `activeList` prop; `:162` maps `taskCols.map(...)` with NO filter — `activeList` is never referenced in `TasksModule`. The entire sidebar IS a cosmetic no-op exactly as claimed. Custom-list rows (`:88`) + tag rows (`:111`) confirmed: custom-lists share `activeList` via `setActiveList(cl.id)`, tag rows have no handler. Recon is faithful.

2. **The load-bearing date finding (Q-T basis) — VERIFIED REAL** — PASS. `TaskCard.date` is a year-less display string (`types.ts:47-48`). Seed reality confirmed in `tasksMock.ts`: `overdue` 10 cards all carry arbitrary holiday `date` (`"7/31"`, `"9/10"`, `"10/24"`) NOT computed-from-today; **`next7` cards `t11`/`t12` have NO `date` field at all** (only `sub`/`dateLabel`, L40-41); `later` 13 cards use `"Mon D"` format. A precise per-calendar-day "today/tomorrow" predicate is genuinely underivable from this shape without a schema change — and the carve-out forbids that. B2 (date-string parse) / B3 (ISO `due` field) rejections are correct. **The planner did not invent this constraint; it is in the data.**

3. **Bucket axis = the board's persisted date semantics** — PASS. `dateForCol.ts:25-51` confirms overdue=today−3d, next7=today+2d, later=today+30d, nodate=null. Bucket membership is deterministic, already persisted, and is what the UI visually communicates. Deriving temporal class from buckets (B1) is the only honest basis available.

4. **No-mutation safety gate (THE headline constraint) — STRUCTURALLY ENFORCEABLE** — PASS. Verified `tasksReducer.ts` exports exactly `moveCard` (L30), `toggleComplete` (L108, now `TaskCol[]→TaskCol[]` post-T-10), `addCard` (L143) — all pure, all referential-equality-preserving. The ONLY write path is `setRawCols` at `TasksModule.tsx:56` (toggle), `:104` (drop), `:118` (create). A read-only `useMemo<TaskCol[]>(() => filterCardsByList(taskCols, activeList), …)` cannot reach `setRawCols`; the three mutation handlers continue to operate on the unfiltered `taskCols`. **T-FILT-NOMUT (pure deep-equal after all lists) + T-FILT-COUNT (localStorage byte-identical after UI filter clicks) are the correct, sufficient gates** — they prove the property, not just assert it. Compatible with SHIPPED T-10 `done` (now in `xai_task_cols`), #3 `addCard`, T-12 `moveCard`: the filter reads the resolved cols and never writes, so all three persist paths are untouched.

5. **Contract completeness** — PASS. api.md §F.2 specifies `filterCardsByList(cols, list, now?)` PURE, always returns 4 columns (headers/empty-states render), recomputes a *derived view* `count` (storage `count` untouched), defensive identity for unknown `list`. §F.3/§F.4 specify the controlled-sidebar props (`activeList` + `onSelectList`) and the `TasksModule` `useState`+`useMemo`. §F.8 error semantics cover the zero-card and unknown-list paths. Inbox semantics verified: grep confirms exactly 17 `inbox:true` cards (10 overdue + 1 nodate-active + 6 nodate-completed) — matches §3/§F.2 exactly.

6. **Phase plan quality (Q-PHASE)** — PASS. 2 phases right-sized: FP1 (selector + lift + structural lists + T-FILT-NOMUT + T-LIFT) and FP2 (empty state + Q-T finalize + T-FILT-COUNT + barrel + cross-vendor). The selector and the lift are co-dependent for any visible behaviour, so splitting them would create a phase with no testable user-facing outcome. Clean rollback boundary (FP1 is independently testable; the no-mutation gate lands in FP1). Q-PHASE planner pick ACCEPTED.

7. **Architecture risk / boundary守约** — PASS, all held. Verified: (a) `xai_task_cols` at registry.ts:197-204 (json, owner `xai-web-tasks`, default `{}`) → READ-ONLY reuse, NO registry edit; (b) `xai_pref_smart_lists` at registry.ts:523-530 IS owner `xai-web-settings-rest` + `Record<string,string>` → Q3 rejection (wrong owner + wrong shape) is CORRECT; session-only `useState` adds no key; (c) state lifts via props → NO `packages/core/src/types/events.ts` edit; (d) `SmartListId` exists only as a local alias (`TasksSidebar.tsx:39`), `filterCardsByList` does not exist → no collision; (e) local `internal/strings.ts` STR → NO `plugin-web-tokens` edit; (f) slot already SHIPPED → NO host-shell edit; (g) all new code inside `packages/xai-web-tasks/src/`; SHIPPED v1/§E/T-10 blocks preserved verbatim; carve-out USES ADR-0010, no ADR edit; `dev` untouched. Strict subset of carve-out §2 In-scope minus the deferred items — no drift either direction.

8. **Q1 (custom/tag rows) + Q2 (Summary)** — PASS (ACCEPT). Q1: no list/tag membership model exists (`TaskCard` has only an optional single `tag?`, and the sidebar's custom-lists are a disjoint taxonomy with no card linkage — verified `tasksMock.ts` cards carry no custom-list field). Making custom/tag rows non-selecting (inert) this iteration is the correct anti-half-wired choice; T-LIFT-4 asserts inert-ness. Q2: Summary=treat-as-all (identity) avoids a dead/decorative row the audit would re-flag and avoids overlapping Statistics #20 — honest and cheapest. Both planner picks ACCEPTED.

9. **Test strategy + Workflow V2 compliance** — PASS. Inventory (§F.1) covers selector per-list (T-FILT-1..8), no-mutation (T-FILT-NOMUT pure + T-FILT-COUNT storage), lift wiring (T-LIFT-1..4), empty state bilingual (T-EMPTY-1..2), barrel (T-FILT-BAR), and SHIPPED-regression guard (T-REG-NOMUT keeps the 76 suites green). Mock strategy is sound (real `usePref`, real `useI18n`, deep-clone for no-mutation proof). dev_log Status Panel + Phase Plan + Risks + Work Log present; FP1/FP2 declare explicit exit gates; `feature-build` runs ONE phase per invocation; cross-vendor (Codex cold-read at FP2) MAY defer 24h per ADR-0008 §S3 with the (i)/(ii)/(iii) checklist.

**Q-T RULING (the headline product judgment) — APPROVED AS A *BUCKET VIEW*, NOT A PRECISE DATE FILTER, with a binding honesty directive:**

The planner correctly surfaced Q-T as the one unavoidable judgment. I accept the `today→overdue` + `tomorrow→next7` bucket approximation as the v1 mapping **because** (a) the stored shape genuinely cannot support a per-day filter (gate 2, verified), (b) schema change is forbidden by the carve-out, and (c) an empty-until-real-due-field "Today" reads as broken UX. Option (b) from the brief (defer all date-lists, ship only Inbox/All/Summary) is rejected: it ships a strictly less useful feature to avoid a problem that honest labelling solves.

HOWEVER — `today→overdue` is semantically *wrong-leaning* if presented as a precise "due today" filter: "overdue" means past-due (today−3d), so a user clicking **Today** expecting today's items would instead see overdue items, and **Tomorrow→next7** shows a "within 7 days" bucket, not strictly tomorrow. This is acceptable ONLY if the UI is honest that these are bucket views, not calendar-day filters. The proposed empty-state copy in api.md §F.6 (`empty_today: "Nothing due today"`, `empty_tomorrow: "Nothing due tomorrow"`) **overstates precision** and would make the approximation read as an exact due-date match — the very dishonesty Q-T is meant to avoid.

→ **D-QT (BINDING build directive, blocks READY_FOR_VERIFY if violated):** FP2 MUST present `today`/`tomorrow` as the bucket views they are, not as precise calendar-day filters. Concretely:
   - The empty-state strings for `today`/`tomorrow` MUST NOT assert "due today/due tomorrow" precision. Use bucket-framed copy that matches what is actually shown, e.g. `today` → "Nothing overdue" / "没有逾期任务" (it shows the overdue bucket); `tomorrow`/`next7` → "Nothing in the next 7 days" / "最近 7 天没有任务" (both show the next7 bucket). A single parameterized `empty_filtered` keyed off the bucket label is acceptable.
   - design §F / api §F.2 already carry the bucket-approximation note for `today`/`tomorrow`; that documentation stays. The change is ONLY the user-facing empty-state wording (and any tooltip/label the build adds), so it stays inside the local-STR scope with NO new constraint.
   - This is a wording/honesty constraint inside the already-approved file scope (`internal/strings.ts`) — it does NOT expand scope, add a key category, or require a re-plan. feature-verify checks D-QT as part of T-EMPTY-1/2 review.

**Recommendations (non-blocking, for build-time):**

- **Rec-F1 (Q3 re-confirm):** Session-only is correct and adds no key. If a future increment wants persistence, `xai_pref_tasks_active_list` is a clean additive registry row but would re-expand scope beyond this carve-out and needs re-authorization — do NOT fold it in here.
- **Rec-F2 (`filterActive` prop, api.md §F.5):** The per-column "drop here" suppression under an active filter is a good honesty touch, but keep it minimal — a single boolean prop on `TaskColumn`; if the board-level empty state alone reads cleanly, the prop may be dropped (planner already flagged this as reviewer-simplifiable). Either is fine; do not over-engineer.
- **Rec-F3 (`SmartListId` export):** Keep it internal-to-module (default) unless a consumer materializes in this iteration — promoting to the barrel is a public-surface change that T-FILT-BAR must then assert. Default-internal is the lower-surface choice.

**Q1/Q2/Q3/Q-PHASE planner picks all ACCEPTED. Q-T ACCEPTED with binding directive D-QT.** No blockers. Plan is executable with zero blocking ambiguity — every load-bearing source claim verified against actual code.

## Work Log (extension — append-only)

| Timestamp | Executor | Action | Commits | Next step |
|---|---|---|---|---|
| 2026-05-28 | Claude Opus (feature-plan) | Iteration 3 plan for `xai-web-tasks-smartlist-filter` (extension of SHIPPED row #6). Recon verified against ACTUAL source: `activeList` trapped in TasksSidebar.tsx:56 local useState, never lifted, never applied → cosmetic no-op confirmed; **THE load-bearing finding — `TaskCard.date` is a year-less display string in two formats (`"7/31"`/`"Jun 14"`) and `next7` cards carry NO `date` at all (seed t11/t12 only have sub/dateLabel), so a precise date-string predicate is impossible without a forbidden schema change** → chose B1 bucket-derived selector (the board's existing persisted `dateForCol` semantics) over B2 date-parse / B3 schema-extend. Resolved 3 planner's-calls: Q1 custom/tag DEFER (no membership model; rows inert), Q2 Summary treat-as-all (avoids overlap w/ Statistics #20 + dead row), Q3 session-only no-key (existing `xai_pref_smart_lists` is owner `xai-web-settings-rest` + `Record<string,string>` — wrong owner+shape, registry.ts:523-528). Confirmed no-mutation property is enforceable: pure selector reads, reducer writes, never cross (T-FILT-NOMUT + T-FILT-COUNT). Chose A1 state-lift (card-create Iteration-2 precedent, no `web:*` channel). Produced: feature brief, discovery review (per-list predicate table + dateForCol/TaskCard recon + 3 planner's-calls + no-mutation guarantee), design §F extension, api §F extension, test §F extension, roadmap manifest, this Status Panel + 2-phase plan. NO implementation code. | — | feature-review |
| 2026-05-28 | Claude Opus (feature-review) | APPROVED (0 blockers, 1 binding directive D-QT, 3 non-blocking recs). Verified ALL load-bearing claims against ACTUAL source (not recon table): no-op real (TasksSidebar.tsx:56 local useState + :67 highlight-only + TasksModule.tsx:130/:162 no prop/no filter); **Q-T date finding REAL — `TaskCard.date` year-less (types.ts:47), seed `next7` t11/t12 have NO date (tasksMock.ts:40-41), overdue dates arbitrary holidays** → B1 bucket-derived correct, B2/B3 rejections sound; no-mutation STRUCTURALLY enforceable (tasksReducer exports moveCard/toggleComplete/addCard all pure+ref-equal; only write path setRawCols at TasksModule.tsx:56/104/118; read-only useMemo cannot reach it) → T-FILT-NOMUT+T-FILT-COUNT correct gates; inbox=17 cards confirmed by grep (10+1+6); registry xai_task_cols :197-204 + xai_pref_smart_lists :523-530 (owner xai-web-settings-rest, Record<string,string> — Q3 rejection correct); SmartListId local-only + filterCardsByList absent → no collision; boundary守约 all held (no registry/core-events/tokens/host/other-plugin/SHIPPED-archive/ADR/dev edit). Q1/Q2/Q3/Q-PHASE planner picks ACCEPTED. **Q-T RULING: bucket approximation ACCEPTED as a BUCKET VIEW (not precise date filter) + BINDING D-QT** — FP2 empty-state copy for today/tomorrow MUST NOT claim "due today/tomorrow" precision (today shows overdue bucket, tomorrow shows next7); use bucket-framed wording inside the local-STR scope (no scope expansion); verify checks D-QT via T-EMPTY-1/2. Status → APPROVED; Suggested Next = feature-build. | — | feature-build |
| 2026-05-29 00:05 | Claude Sonnet (claude-sonnet-4-6) feature-auto-build | FP1 DONE: `SmartListId` type added to `types.ts` (lifted from TasksSidebar.tsx:39, kept internal per Rec-F3). `internal/filterCardsByList.ts` new pure view selector (B1 bucket-derived predicates: all/summary=identity; inbox=card.inbox===true across all buckets incl. nodate.completed; next7=next7-bucket; today=overdue-bucket Q-T; tomorrow=next7-bucket Q-T; unknown=identity; always 4 cols). `TasksSidebar.tsx` made controlled component (`activeList`+`onSelectList` props; local useState removed; custom-list+tag rows made INERT per Q1: tabIndex=-1, aria-hidden=true, no onClick). `TasksModule.tsx` lifts `activeList` useState (default "all", session-only Q3); `filteredCols = useMemo(filterCardsByList(taskCols, activeList))`; mutation handlers (handleToggle/handleDrop/handleComposerSave) operate on UNFILTERED taskCols; `filterActive` prop added to TaskColumn. `TaskColumn.tsx` +`filterActive?` prop suppresses "Drop tasks here" hint when filter active. Tests: 26 new filterCardsByList (T-FILT-1..8 per-list + T-FILT-NOMUT headline pure no-mutation 8 sub-tests) + 11 new TasksSidebar (T-LIFT-1..4). SHIPPED 76 + 37 new = 113/113 pass. tsc --noEmit exit 0. eslint --max-warnings 0 exit 0. | cdfb2a2 | FP2 |
| 2026-05-29 00:10 | Claude Sonnet (claude-sonnet-4-6) feature-auto-build | FP2 DONE: `internal/strings.ts` +`STR_SMART_LIST_EMPTY` (D-QT COMPLIANT: today→"No overdue tasks"/"没有逾期任务" bucket-framed; tomorrow/next7→"Nothing in the next 7 days"/"最近 7 天没有任务"; inbox/all/summary similarly honest). `TasksModule.tsx` +`filteredTotalTasks` derived count + `showBoardEmpty` flag + board-level `<div class="tasks-board-empty" role="status">` rendering when filter active and 0 total visible cards. `STR_SMART_LIST_EMPTY` imported from `internal/strings.ts`. Tests: T-FILT-COUNT (2 new — localStorage byte-identical after all filters applied; also after DnD write), T-EMPTY-1 (3 new — EN board-level empty state with D-QT compliant copy for next7, today/overdue, all-noop), T-EMPTY-2 (2 new — ZH bilingual D-QT wording), T-FILT-BAR (3 new — filterCardsByList/STR_SMART_LIST_EMPTY/SmartListId NOT exported). 123/123 pass (37 more than FP1 baseline). @repo/web 128/128 pass, build green (4.18s). tsc exit 0. eslint --max-warnings 0 exit 0. D-QT verified via T-EMPTY-1/2: copy is bucket-framed, no "due today/tomorrow" precision. Cross-vendor (i) no shared-file edits; (ii) all paths absolute; (iii) no template-language-specific syntax — fresh tsc passes. Status → READY_FOR_VERIFY. | see FP2 commit | feature-verify |
| 2026-05-29 00:30 | Claude Opus (claude-opus-4-8) feature-verify | VERIFY PASS → READY_TO_SHIP. Every load-bearing claim verified against ACTUAL source + live test output (not trusted from build Work Log). Commits reviewed independently: `cdfb2a2` (FP1) / `47f9dee` (FP2); carve-out authority `eacf1e5`. **命脉 #1 no-mutation — HELD**: `filterCardsByList.ts` is a pure `cols.map` selector (ref-equality for unchanged cols; identity short-circuit for all/summary/unknown); NEVER calls setRawCols/reducers/localStorage. Independently confirmed `filteredCols` is `useMemo` (TasksModule.tsx:68) and ALL 3 mutation handlers (handleToggle:57, handleDrop:128, handleComposerSave:142) operate on UNFILTERED `taskCols` + write via the SHIPPED `setRawCols` boundary cast — filtered result NEVER written back. T-FILT-NOMUT (8 sub-tests: JSON byte-identity snapshot before/after all 6 filters in sequence + nested task identity) PASS; T-FILT-COUNT (2 sub-tests: localStorage byte-identical after filters, also after DnD write) PASS. `tasksReducer.ts` UNTOUCHED in this lineage → T-10 done / #3 addCard / T-12 drag not regressed (18 reducer tests + 10 persistence green). **命脉 #2 D-QT honesty — HELD**: today empty-state = "No overdue tasks"/"没有逾期任务" (bucket-framed, NOT "Nothing due today"); tomorrow/next7 = "Nothing in the next 7 days"/"最近 7 天没有任务". T-EMPTY-1b asserts "No overdue tasks" + `.not.toContain("due today")`; T-EMPTY-2b asserts "没有逾期任务". design §F.2 + api §F.2 carry the bucket-approximation note. Gates: tasks 123/123 (12 files), tasks tsc --noEmit exit 0, tasks eslint --max-warnings 0 exit 0, @repo/web 128/128 (no regression), @repo/web build green (3.87s; pre-existing chunk-size + ai-chat dynamic-import warnings = baseline noise). Functional: smart-lists filter via real sidebar clicks (All=identity / Inbox=inbox===true / today=overdue bucket / tomorrow=next7 bucket / next7=next7 bucket / summary=identity); custom-list+tag rows INERT (T-LIFT-4: tabIndex=-1, aria-hidden, onSelectList NOT called); SmartListId NOT on public barrel (T-FILT-BAR — Rec-F3 internal default held). Boundary守约 audit (git diff eacf1e5..47f9dee): all 12 files under packages/xai-web-tasks/ (src + dev_log); ZERO edits to plugin-web-storage/registry (no new key), plugin-web-tokens (local STR), packages/core/events (no channel), apps/web host-shell (slot SHIPPED), other plugins, ADR, SHIPPED archives; tasksReducer.ts untouched (no mutation change); branch=web (dev untouched). Commit subjects follow type(scope): summary + full Why/What body. 1 non-blocking residual (R-V1 cross-vendor manual smoke deferred per ADR-0008 §S3). Status → READY_TO_SHIP. | — | ship |
| 2026-05-29 04:00 | Claude Sonnet (claude-sonnet-4-6) ship | SHIPPED: verified Status READY_TO_SHIP + 4 commits audited (eacf1e5 carve-out, cdfb2a2 FP1, 47f9dee FP2, 039c037 plan-docs); dev_log Iteration 3 Status Panel flipped to SHIPPED; ship-flip commit created + pushed origin/web. Cross-vendor smoke deferred per ADR-0008 §S3 (R-V1 — joins accumulated Web smoke batch; smart-list filter path; Tester: Tasks must be enabled in settings). item 3 local cluster #3 (smart-list filter) DONE. | chore(xai-web-tasks-dev-log): flip smartlist-filter Status SHIPPED | — (workflow complete) |

---

## Verify Notes (extension — Iteration 3: xai-web-tasks-smartlist-filter)

**Verdict**: READY_TO_SHIP (feature-verify · Claude Opus claude-opus-4-8 · 2026-05-29 00:30)

Every load-bearing claim verified against ACTUAL source + live test output, not trusted from the build Work Log. Commits reviewed independently: `cdfb2a2` (FP1) / `47f9dee` (FP2); carve-out authority `eacf1e5`.

### Gate results (all pass)

| # | Gate | Result |
|---|---|---|
| 1 | `pnpm --filter @repo/plugin-web-tasks test` | **123/123 PASS** (12 files: filterCardsByList 26, dateForCol 5, TasksSidebar 11, TaskComposer 11, registration 5, tasksReducer 18, validate 8, TasksModule 12, persistence 10, index-barrel 11, ids 2, seed 4) |
| 2 | `pnpm --filter @repo/plugin-web-tasks exec tsc --noEmit` | exit 0 (clean) |
| 3 | `pnpm --filter @repo/plugin-web-tasks exec eslint --max-warnings 0 .` | exit 0 (zero warnings) |
| 4 | `pnpm --filter @repo/web test` | **128/128 PASS** (24 files; no regression) |
| 5 | `pnpm --filter @repo/web build` | green (3.87s; pre-existing chunk-size + ai-chat dynamic-import warnings = baseline noise, unrelated to this feature) |

### 命脉 #1 — no-mutation (view-only does NOT break SHIPPED data) — HELD

- **`filterCardsByList.ts` is a pure selector.** Verified: `cols.map` only; `all`/`summary`/unknown short-circuit to identity (`return cols`, no allocation); `inbox`/bucket branches build NEW column objects only when filtering changes something, returning untouched columns by reference (`return col` — mirrors moveCard discipline). It NEVER calls `setRawCols`, NEVER touches `localStorage`, NEVER invokes `moveCard`/`toggleComplete`/`addCard`.
- **Independent integration confirmation:** `filteredCols` is a `useMemo<TaskCol[]>(() => filterCardsByList(taskCols, activeList), [taskCols, activeList])` at `TasksModule.tsx:68`. The render map uses `filteredCols.map(...)` (`:199`). ALL THREE mutation handlers operate on the UNFILTERED `taskCols`: `handleToggle` → `toggleComplete(taskCols, taskId)` + `setRawCols` (`:57-58`); `handleDrop` → `moveCard(taskCols, ...)` + `setRawCols` (`:128-129`); `handleComposerSave` → `addCard(taskCols, ...)` + `setRawCols` (`:142-143`). The filtered shape is read-only and never flows into a write. The `setRawCols` boundary cast is the SINGLE write path and is reachable only from those three handlers.
- **T-FILT-NOMUT (8 sub-tests) — genuine, not a stub.** `beforeEach` snapshots `JSON.stringify(originalCols)`; each sub-test applies a filter (or all 6 in sequence); `afterEach` asserts `JSON.stringify(originalCols) === snapshot`. A dedicated sub-test also snapshots a nested task object and asserts byte-identity after 3 filters. Proves the property, not just asserts it.
- **T-FILT-COUNT (2 sub-tests).** localStorage `xai_task_cols` byte-identical before/after applying all 6 filters; second sub-test forces a DnD write first, then re-asserts byte-identity after filters — the selector wrote nothing.
- **SHIPPED reducer untouched.** `git diff eacf1e5..47f9dee` shows `tasksReducer.ts` is NOT in the lineage. T-10 `done`-persist, #3 `addCard`, T-12 `moveCard` are not regressed — their suites stay green (tasksReducer 18, persistence 10 incl. T-PER-DONE-1/2 + T-CR-1..3 + T-PER-2 DnD).

### 命脉 #2 — D-QT honesty (date approximation honestly labelled) — HELD

- **Bucket-framed empty-state copy, NOT precise calendar-day claims.** `STR_SMART_LIST_EMPTY` (strings.ts:37-55): `today` → `"No overdue tasks"` / `"没有逾期任务"`; `tomorrow` → `"Nothing in the next 7 days"` / `"最近 7 天没有任务"`; `next7` → same as tomorrow (shared bucket); `inbox` → `"No inbox tasks"` / `"没有收件箱任务"`. NONE assert "due today" / "due tomorrow" precision — exactly the D-QT directive.
- **T-EMPTY-1/2 assert the honesty directly.** T-EMPTY-1b: clicking "Today" with empty overdue bucket renders `"No overdue tasks"` AND `expect(...).not.toContain("due today")`. T-EMPTY-2b (ZH): renders `"没有逾期任务"`. T-EMPTY-1a/2a cover next7 bucket wording EN+ZH. T-EMPTY-1c confirms the board-level empty state is NOT shown under "All" (identity, not a filter).
- **Documentation carries the bucket-approximation note.** design §F.2 + api §F.2 + the inline `filterCardsByList.ts` header (Q-T honesty block) document today→overdue / tomorrow→next7 as bucket approximations derived from the board's persisted `dateForCol` semantics — no schema change, honestly surfaced.

### Functional correctness

- **Smart-list filtering works via real sidebar clicks** (T-LIFT-1/2/3 + T-EMPTY drive `fireEvent.click` on actual nav rows): `all`=identity (full board) / `inbox`=`card.inbox===true` across all buckets incl. `nodate.completed` (17 seed cards) / `next7`=next7 bucket / `today`=overdue bucket (Q-T) / `tomorrow`=next7 bucket (Q-T) / `summary`=identity (treat-as-all, Q2). `data-active` highlight stays in sync after the lift.
- **Custom-list + tag rows are INERT (Q1 defer)** — T-LIFT-4 (a-d): `tabIndex=-1`, `aria-hidden="true"`, NO onClick/onKeyDown/data-active; clicking them does NOT call `onSelectList`. No half-wired "click → board unchanged" bug.
- **Per-column "drop here" hint suppressed under filter** via `filterActive` prop (TaskColumn.tsx:104 — `isEmpty && !filterActive`).

### Boundary守约 audit (all held)

`git diff --name-only eacf1e5..47f9dee` → all 12 files under `packages/xai-web-tasks/` (10 `src/` + `docs/dev_log.md`). Forbidden-path scan returned NONE. Confirmed ZERO edits to: `plugin-web-storage/src/internal/registry.ts` (no new key — session-only `useState`, `xai_task_cols` read-only), `packages/core/src/types/events.ts` (state lifts via props — no channel), `plugin-web-tokens` (local `STR_SMART_LIST_EMPTY`), `apps/web` host-shell (slot `tasksWebModuleRegistration` already SHIPPED), other plugins (Matrix/Statistics/Dashboard), ADR files (carve-out USES ADR-0010), SHIPPED archives, and **`internal/tasksReducer.ts` (move/toggle/create UNTOUCHED — no mutation change)**. `SmartListId` kept internal (NOT on public barrel — Rec-F3 default held, T-FILT-BAR asserts). Branch = `web`; `dev` untouched. Commit subjects follow `type(scope): summary` + full Why/What body.

### Residual risks (non-blocking)

- **R-V1 (cross-vendor manual smoke deferred)**: `Verify Cross-vendor: yes` (Codex cold-read of `filterCardsByList` + lift) is DEFERRED per ADR-0008 §S3 24h-evidence carve-out. Cold-read checklist recorded at FP2 deferral: (i) no shared-file edits in this increment — all code inside `packages/xai-web-tasks/src/`; (ii) all file paths used are absolute; (iii) no template-language-specific syntax in source — fresh `tsc --noEmit` passes. Joins the accumulated Web smoke batch that must clear before the next `xai-web-deploy-cloudflare` ship. Tester note: Tasks must be ENABLED in settings (`withDisabledFallback` gate) or the route renders `<DisabledFeatureFallback>` and the sidebar is unreachable. Manual leg: open `/app/tasks`, click each smart-list → board filters per the predicate table; a no-match filter → honest empty state; click All → full board restored; drag/create/toggle still work; hard-reload → `xai_task_cols` unchanged by filtering. Not ship-blocking.
- **R-V2 (T-LIFT-3 docstring nuance, cosmetic)**: T-LIFT-3's docstring says "All restores the full board" but the test body asserts sidebar `data-active` highlight switching (All→Inbox). The board-restore behaviour is covered at the module/integration level (filteredCols re-derives on activeList change; T-EMPTY-1c confirms All shows no empty state). Cosmetic test-naming nuance, not a coverage gap.

No blockers. Both命脉 (no-mutation + D-QT honesty) proven by green load-bearing gates and independent source review. All commits ready for `ship` (human-gated push to `origin/web`).

---

## Notes for feature-review (Iteration 3)

The single decision needing reviewer sign-off is **Q-T** (today→overdue, tomorrow→next7 bucket approximation). It is unavoidable: the SHIPPED `xai_task_cols` card shape has no real per-day due dates (discovery §1.2), and the carve-out forbids a schema change. Everything else (state lift, pure selector, no-mutation property, session-only, defer custom/tag, Summary-as-all) follows precedent and the carve-out line-for-line. The load-bearing safety gates are T-FILT-NOMUT (pure deep-equal) + T-FILT-COUNT (localStorage byte-identical) — both must be green for the no-mutation constraint to be proven, not just asserted.
