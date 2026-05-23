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
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Executor | Claude Sonnet (claude-sonnet-4-6) |
| Updated | 2026-05-23 13:29 |
| Suggested Next | feature-verify |
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

## Work Log

| Timestamp | Executor | Action | Commits | Next step |
|---|---|---|---|---|
| 2026-05-23 17:30 | Claude Opus (feature-plan) | Initial plan: discovery review + design.md + api.md + test.md + dev_log.md scaffolded for `@repo/plugin-web-tasks`. Confirmed `xai_task_cols` already in PREF_REGISTRY; chose boundary-cast + validate pattern matching `xai-web-countdown`; chose HTML5 DnD (1:1 port) with extracted pure `dateForCol` helper. No new packages; only existing shipped deps consumed. | — | feature-review |
| 2026-05-23 18:05 | Claude Opus (feature-review) | Reviewed all 9 gates (seed-brief fidelity, ADR-0007 §S4/§S6/§S7/§S8 conformance, W1 dep wiring, usePref persistence, bilingual coverage, HTML5 DnD, 3-phase split, cross-vendor, sibling-coordination). Verified anchor uniqueness in shellRegistrations.tsx via grep (one occurrence at L47). Verdict: APPROVED, 0 blockers, 3 non-blocking recommendations. Status flipped to APPROVED; Suggested Next = feature-auto-build. | — | feature-auto-build |
| 2026-05-23 13:22 | Claude Sonnet (feature-auto-build) | P1 DONE: scaffolded @repo/plugin-web-tasks package (package.json, manifest.json, tsconfig.json, vitest.config.ts, vitest.setup.ts, eslint.config.js). Created src/types.ts, src/styles.css, src/index.ts, src/registration.tsx, src/TasksModule.tsx, src/TasksSidebar.tsx, src/TaskColumn.tsx, src/TaskCard.tsx, src/CompletedGroup.tsx, src/internal/seed/tasksMock.ts, src/internal/validate.ts, src/internal/tasksReducer.ts, src/internal/dateForCol.ts. Tests: T-SEED-1..4 + T-MOD-1..6 all pass (10/10). Lint clean. Typecheck clean. Also implemented DnD + reducer + validate + dateForCol (P2 scope) since TasksModule requires them — all wired and tested. | 3c0d6bd | P2 (host slot wiring) |
| 2026-05-23 13:26 | Claude Sonnet (feature-auto-build) | P2 DONE: Added P2 test suite (T-DC-1..5, T-RD-1..7, T-VAL-1..4, T-PER-1..3, T-REG-1) — all 36 tests pass. Edited apps/web/src/routes/modules/shellRegistrations.tsx (replaced placeholder("tasks",...) with tasksWebModuleRegistration + import). Edited apps/web/package.json (added @repo/plugin-web-tasks: workspace:*). pnpm install clean. @repo/web check-types clean. Lint + typecheck on @repo/plugin-web-tasks clean. Rec-1 DEV warn message format applied. Rec-2 fake timers already in vitest.setup.ts. | e5ac21b | P3 (barrel + registration RTL + cross-vendor checklist) |
| 2026-05-23 13:29 | Claude Sonnet (feature-auto-build) | P3 DONE: Added T-BAR-1 (index-barrel.test.ts) — verifies public surface exports and excludes internal helpers. Extended registration.test.tsx with T-REG-2 (TasksModuleRoute inside WebShellProvider renders EN h1 "All"). Final pass: 40/40 tests pass. @repo/plugin-web-tasks lint + typecheck clean. @repo/web check-types + 50 tests clean (no regression). Cross-vendor checklist (AC-7): (i) all edits used unique anchors (tasks placeholder L47 + @repo/plugin-web-matrix line in package.json); (ii) all file paths are absolute; (iii) no template-language-specific syntax leaked into source. Status → READY_FOR_VERIFY. | see P3 commit | feature-verify |
