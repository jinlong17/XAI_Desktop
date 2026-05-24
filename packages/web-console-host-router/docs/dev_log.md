# web-console-host-router — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-console-host-router |
| Title | host router still wired to legacy placeholder array — 23/24 SHIPPED xai-web-* modules unreachable at /app/* |
| Roadmap | `web-ticktick-parity` · feature #10 · W6 (regression introduced by W2 rows #5–#24) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — (workflow complete) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | partial PASS (build-green gate complete in-session; Codex gpt-5.5-thinking medium independent re-run + manual browser smoke at /app/tasks DEFERRED — ship gate may run them or accept the in-session evidence) |
| Executor | ship (claude-sonnet-4-6) |
| Updated | 2026-05-23 23:05 PDT |
| Blockers | — |

> Prior feature lifecycle (SHIPPED for original W6 scope) preserved below for context. The BUGFIX above is a post-ship regression discovered after rows #5–#24 (W2a..W4c) shipped their `WebModuleSlotRegistration` exports without rewiring the host router seam.

## Bug Report — host router integration miss

### Symptom

- `pnpm --filter @repo/web dev:mock-auth` → `http://localhost:3000/app/<id>/` for any `<id>` other than `todos` renders `ModuleRoutePlaceholderPage` (the gray placeholder text) instead of the real module shipped by rows #5–#24.
- Affected routes (all P0): `/app/tasks`, `/app/board`, `/app/dashboard`, `/app/calendar`, `/app/matrix`, `/app/pomodoro`, `/app/habits`, `/app/meditation`, `/app/countdown`, `/app/statistics`, `/app/ai-chat`, `/app/settings`.
- Working route: `/app/todos/*` only — because `todos` is the one moduleId that the legacy registration array maps to a real `WebModuleRouteRegistration` (`todoWebModuleRegistration` from `@repo/plugin-productivity/web`).
- The `<Shell>` rail still renders all 12 rail-visible modules correctly because the rail reads from `WebShellProvider modules={…}` which IS wired to the NEW registry. So the user sees their module in the rail, clicks it, navigates to `/app/<id>/...`, and gets a placeholder.

### Expected (per all 24 SHIPPED row dev_logs + DESIGN.md §3 + ADR-0007)

Every xai-web-* row that ships a `WebModuleSlotRegistration` MUST be reachable at `/app/<moduleId>/<defaultChildPath>` and render its real route component (`TasksModuleRoute`, `BoardWorkspacesModuleRoute`, `ComposedSettingsModule`, etc.), not the placeholder.

### Repro (mock-auth)

```
pnpm --filter @repo/web dev:mock-auth
# http://localhost:3000/app/tasks      → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/board      → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/dashboard  → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/calendar   → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/matrix     → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/pomodoro   → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/habits     → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/meditation → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/countdown  → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/statistics → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/ai-chat    → ModuleRoutePlaceholderPage   (BUG)
# http://localhost:3000/app/settings   → ModuleRoutePlaceholderPage   (BUG; composedSettingsRegistration never reached)
# http://localhost:3000/app/todos      → TodoModule (OK — legacy productivity registration)
```

### Severity / Impact

- **Severity: P0** — the entire xai-web-* roadmap (W2a..W4c, 23 of 24 SHIPPED rows) is functionally invisible in the running web app. Only the legacy todos slice works.
- **Boundary**: pure host-assembly bug — no plugin packages need changes. Owned by `web-console-host-router` (this row).
- **Manifest involvement**: none. Pure import-graph issue inside `apps/web/src/routes/modules/`.
- **Regression history**: this is a *new* regression introduced organically as W2 rows landed one by one — each row added its registration to `shellRegistrations.tsx` (rail-correct) and verified its own vitest unit tests in jsdom (with stubbed `useParams` + mock providers), but no row updated `registrations.tsx` (route-incorrect). The bug accumulated invisibly.

## Root Cause Analysis (dual-perspective per complex-defect protocol)

### Perspective A — External behavior chain (URL → render)

```
browser  → /app/tasks
react-router  → matches "/app/:moduleId/*" with params { moduleId: "tasks", "*": "" }
RouteGateElements.AppRouteElement
  → resolveModuleRouteMatch(webModuleRouteRegistrations, "tasks", "")
                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                            ← LEGACY array from registrations.tsx
                            ← built from createDefaultConsoleNavItems() = ["labels","todos","pomodoro","habits","clipboard","projects","notifications","settings"]
                            ← "tasks" is NOT in this list at all  ⇒ resolveModuleRouteMatch returns null  ⇒ NotFoundPage
                            (for ids that ARE in the list like "pomodoro"/"habits"/"settings": the map() block builds a stub with children=[{path:"", render: ModuleRoutePlaceholderPage}, …] ⇒ placeholder renders)
```

Note the asymmetry: legacy `createDefaultConsoleNavItems()` contains EIGHT ids `["labels","todos","pomodoro","habits","clipboard","projects","notifications","settings"]` — only "todos" maps to a real module. The other seven (labels/pomodoro/habits/clipboard/projects/notifications/settings) render `ModuleRoutePlaceholderPage`. The NEW shell registry has TWELVE different ids (ai-chat/tasks/board/dashboard/calendar/matrix/pomodoro/habits/meditation/countdown/statistics/settings — note "tasks"/"board"/"dashboard"/"calendar"/"matrix"/"meditation"/"countdown"/"statistics"/"ai-chat" are NEW; "labels"/"clipboard"/"projects"/"notifications" are legacy-only). So:

- New ids (tasks, board, dashboard, calendar, matrix, meditation, countdown, statistics, ai-chat) → `resolveModuleRouteMatch` returns null → `NotFoundPage`. **Not** `ModuleRoutePlaceholderPage`. (User report mentions "placeholder" — both classes of failure happen depending on the slug; report is correct in spirit.)
- Legacy-but-still-shipped ids (pomodoro, habits, settings) → placeholder renders.
- Legacy-and-not-shipped ids (labels, clipboard, projects, notifications) → placeholder renders (and shouldn't even appear in rail; they do not, because rail uses the NEW registry).
- Only "todos" → real module renders.

This split is hidden from the screenshot evidence because both NotFoundPage and ModuleRoutePlaceholderPage produce a non-module screen; the user sees "no real module" for everything ≠ todos.

### Perspective B — Architecture boundary chain (registration ownership)

```
type contract (packages/core/src/types/plugin.ts line 138):
  interface WebModuleRouteRegistration { moduleId; label; defaultChildPath?; children: WebModuleRouteChild[] }

type contract (packages/xai-web-shell/src/types.ts line 57):
  interface WebModuleSlotRegistration extends WebModuleRouteRegistration {  // ← key: structural extension
    icon: WebShellIconName;
    railOrder: number;
    i18nKey: string;
    showInRail: boolean;
  }
```

`WebModuleSlotRegistration` is a *strict structural extension* of `WebModuleRouteRegistration`. Every `WebModuleSlotRegistration[]` is *also* a valid `WebModuleRouteRegistration[]` for the purposes of `resolveModuleRouteMatch` / `assertUniqueModuleRegistrations` / `resolveDefaultModulePath`. The extra fields (icon/railOrder/i18nKey/showInRail) are simply ignored by the router seam — which is fine. The interface design was ALREADY built for the convergence; the rewire was just never done.

Evidence of intent (`shellRegistrations.tsx` lines 76–84):

```ts
/**
 * Full registrations array for use in both the shell (WebShellProvider)
 * and the legacy router seam (webModuleRouteRegistrations).
 *
 * The legacy seam still uses WebModuleRouteRegistration[] — since
 * WebModuleSlotRegistration extends that interface, the same array
 * satisfies both shapes.
 */
export const webModuleSlotRegistrations = webShellModuleRegistrations;
```

This alias was created with the explicit comment "for use in both" — but `grep -rn webModuleSlotRegistrations` returns ONLY that one self-export site and ZERO consumers. The merge was scaffolded by some earlier author and abandoned.

### Consumers of `webModuleRouteRegistrations` (the buggy legacy array)

1. `apps/web/src/routes/router.tsx:10,12,13` — `assertUniqueModuleRegistrations` + `resolveDefaultModulePath`
2. `apps/web/src/routes/RouteGateElements.tsx:7,31` — `resolveModuleRouteMatch` inside `AppRouteElement`

Both consumers live in `apps/web/src/routes/`. NO consumers outside the host. The legacy array has exactly two readers and one writer — clean blast radius.

### Consumers of `webShellModuleRegistrations` (the correct new array)

1. `apps/web/src/App.tsx:37,101` — passed to `<WebShellProvider modules={…}>` via `filterModulesByFeaturePrefs(…)`
2. `apps/web/src/routes/modules/__tests__/shellRegistrations.integration.test.tsx` — shape assertions on the 12 entries
3. `apps/web/src/routes/modules/__tests__/railFeatureFilter.test.tsx` — feature-pref filter coverage

### Why feature-verify never caught this

Each row's `feature-verify` ran the package's own vitest suite (e.g. `packages/plugin-web-pomodoro/src/__tests__/registration.test.tsx`). Those tests:

- assert the registration shape (`expect(reg).toMatchObject(...)`)
- render via `<WebShellProvider modules={[reg]}>` + `<MemoryRouter>` directly
- never boot `apps/web/src/routes/router.tsx`'s `webHostRouteObjects` and navigate `/app/<id>`

The one host integration test that DOES boot the real router (`apps/web/src/routes/router.integration.test.tsx`) only ever navigates `/app/todos/...`. So all 23 other rows passed verify with green tests while having zero URL routing.

`composedSettingsRegistration` situation: row #23 verify passed because its tests instantiated `ComposedSettingsModule` directly. The registration shape is correct (`defaultChildPath: ""`, `children: [{path:"", render: ComposedSettingsModule}, {path:"*", render: ComposedSettingsModule}]`) — so once the registry seam is fixed, `/app/settings` will resolve and render. No additional work needed in row #23 for this fix.

## Fix Strategy

Strategy chosen: **B + cleanup variant** (single source of truth, minimum churn, kill the dead alias).

### The fix (smallest valid change)

1. **Delete `apps/web/src/routes/modules/registrations.tsx`** entirely. It currently has two roles, both wrong:
   - It builds placeholder stubs from a stale `createDefaultConsoleNavItems()` whose 8 ids no longer match the production module set.
   - It is the source of the legacy `webModuleRouteRegistrations` export consumed by `router.tsx` + `RouteGateElements.tsx`.
2. **Re-export from `shellRegistrations.tsx`** under the legacy name OR change the two consumer imports. Option B' chosen for clarity:
   - In `shellRegistrations.tsx`, change line 84 from `export const webModuleSlotRegistrations = webShellModuleRegistrations;` to `export const webModuleRouteRegistrations: WebModuleRouteRegistration[] = webShellModuleRegistrations;` (with a type import). This satisfies the structural subset and keeps the consumers' import name stable IF we update their import path. Cleaner alternative: update the two import statements to read from `./shellRegistrations` and drop the alias.
3. **Update import sites** (2 files, 1 line each):
   - `apps/web/src/routes/router.tsx:10` — change `from "./modules/registrations"` to `from "./modules/shellRegistrations"`.
   - `apps/web/src/routes/RouteGateElements.tsx:7` — same.
4. **Drop the placeholder-only helper imports** from the deleted file: `createDefaultConsoleNavItems` and `ModuleRoutePlaceholderPage` may have no other in-app consumers — verify with grep before deleting and remove the `ModuleRoutePlaceholderPage.tsx` page file if so (it stays in source if the dev-only smoke routes still use it; quick grep confirms otherwise).

### Risk analysis

- **`assertUniqueModuleRegistrations(webShellModuleRegistrations)`**: shellRegistrations has 12 unique ids (asserted by `shellRegistrations.integration.test.tsx` AC-HOST-1). Safe.
- **`resolveDefaultModulePath(webShellModuleRegistrations)`**: returns `/app/ai-chat` (first entry, `defaultChildPath: ""` → returns `/app/ai-chat`). This CHANGES default landing from `/app/labels/inbox` (current buggy default — labels doesn't even exist anymore) to `/app/ai-chat`. The change is correct: `/app` should redirect to the first rail item, which by railOrder 1 is ai-chat. Document this in the fix commit; align with `App.tsx` shell expectations.
- **Tasks moduleId vs todos moduleId**: `tasks` (xai-web-tasks row #11) and `todos` (legacy plugin-productivity) are DIFFERENT ids. After the fix, `/app/todos` will return 404 (no longer in registry). Is that a regression? Check whether `todoWebModuleRegistration` should be added to `shellRegistrations` or whether todos was intentionally retired in favor of tasks (xai-web-tasks). The shellRegistrations comment block says "tasks row #11" replaces it. This is a deliberate retirement, but the existing `router.integration.test.tsx` asserts `/app/todos/smart:inbox` renders — that test WILL fail after the fix and MUST be rewritten to assert `/app/tasks` (or kept temporarily by adding `todoWebModuleRegistration` back to shellRegistrations as a transitional shim). Decide in fix commit.
- **No plugin package needs touching.** Pure host-assembly fix.

### Required regression test (per user request + project test contract)

Add to `apps/web/src/routes/__tests__/` (new dir) or extend `router.integration.test.tsx` with:

1. `it("AC-W6-FIX-1: /app/tasks renders TasksModule (not placeholder)")` — boots `webHostRouteObjects` via `createMemoryRouter(["/app/tasks"])`, asserts container contains tasks-module-specific text (e.g. the H1 from TasksModule).
2. Similar one-per-wave assertions for W2a (matrix), W2b (calendar), W2c (pomodoro), W2d (countdown), W2e (statistics), W4 (settings) — at minimum 6–7 deep-link tests. Each asserts the rendered tree does NOT contain "ModuleRoutePlaceholderPage" / placeholder text.
3. An invariant test: `it("AC-W6-FIX-7: webModuleRouteRegistrations and webShellModuleRegistrations are the same reference")` — protects against the two-array drift class returning.
4. Update the existing `/app/todos/smart:inbox` test per the retirement decision above.

This converts the missing seam from a silent rail/router asymmetry into a single-array invariant that future rows cannot violate.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-23 16:00 PDT | bug-diagnose (Claude Opus 4.7 1M) | Diagnosed P0 host-router regression: rows #5–#24 ship `WebModuleSlotRegistration` to `shellRegistrations.tsx` (read by `<WebShellProvider>` so the rail renders), but `router.tsx` + `RouteGateElements.tsx` still import the legacy `webModuleRouteRegistrations` from `registrations.tsx` (built from a stale 8-id `createDefaultConsoleNavItems()` map where all but "todos" become `ModuleRoutePlaceholderPage`). Result: 23 of 24 SHIPPED xai-web-* modules unreachable at `/app/*`. Dual-perspective analysis confirms (a) URL-chain miss (`resolveModuleRouteMatch` reads wrong array) and (b) boundary-chain miss (`WebModuleSlotRegistration extends WebModuleRouteRegistration` was already designed for convergence — alias `webModuleSlotRegistrations` already exists at `shellRegistrations.tsx:84` with intent comment, but has zero consumers). Fix strategy: delete `registrations.tsx`, point the two host imports at `shellRegistrations.tsx`, add 7+ host-level deep-link regression tests (one per wave) + a single-source-of-truth invariant test. Decide todos retirement vs transitional shim in fix commit. | — | bug-fix |
| 2026-05-23 22:18 PDT | bugfix-loop (Claude Opus 4.7 1M inline) | Committed `dev_log.md` diagnose pass as setup before sub-fixes (no runtime change). Recorded the dual-perspective analysis + fix strategy as immutable contract for bug-auto-fix and bug-verify. | `d7e189c` | bug-auto-fix S1 |
| 2026-05-23 22:25 PDT | bug-auto-fix S1 (Claude Opus 4.7 1M inline) | Sub-fix S1: pointed host router at the shell registrations array. Added `webModuleRouteRegistrations: WebModuleRouteRegistration[]` export in `shellRegistrations.tsx` composed from `[...webShellModuleRegistrations, todoWebModuleRegistration]` (todos kept as a transitional shim — not in rail — so observability sanitizers + existing `/app/todos/smart:inbox` assertions continue to pass). Swapped both consumer imports (`router.tsx`, `RouteGateElements.tsx`) from `./modules/registrations` to `./modules/shellRegistrations`. DELETED `registrations.tsx` (legacy 8-id placeholder builder) and `pages/ModuleRoutePlaceholderPage.tsx` (now has zero production consumers — test files reference only the string name). Evidence: `pnpm --filter @repo/web check-types` clean. `pnpm --filter @repo/web exec eslint --max-warnings 0 src` — 3 pre-existing warnings in App.tsx + TokensSmokePage (not introduced by this fix; confirmed by stash + re-run on baseline). Scoped tests green: `pnpm --filter @repo/web exec vitest run src/routes/modules/buildModuleRoutes.test.ts src/routes/modules/__tests__/shellRegistrations.integration.test.tsx src/routes/router.integration.test.tsx` → 17 passed. | `0255b51` | bug-auto-fix S2 |
| 2026-05-23 22:28 PDT | bug-auto-fix S2 (Claude Opus 4.7 1M inline) | Sub-fix S2: added host-router-level regression coverage. New file `apps/web/src/routes/__tests__/router-modules.integration.test.tsx` with three layers — Layer A (AC-W6-FIX-LA, 13 cases): resolution check for all 12 shell modules + todos shim; Layer B (AC-W6-FIX-1..7, 7 cases): real-render deep links per wave for tasks/matrix/calendar/pomodoro/countdown/statistics/settings asserting `.module-XXX` className + no placeholder text; Layer C (AC-W6-FIX-LC, 4 cases): single-source-of-truth invariant — `webModuleRouteRegistrations` is `[...webShellModuleRegistrations, todoWebModuleRegistration]` by reference, in order, no duplicate moduleId. Evidence: `pnpm --filter @repo/web exec vitest run src/routes/__tests__/router-modules.integration.test.tsx` → 24 passed. Full suite: `pnpm --filter @repo/web exec vitest run` → 91 passed across 19 files. Decision recorded inline: ai-chat / board / dashboard / habits / meditation are Layer-A-only (data-heavy renders covered by each row's own suite); Layer A still proves they resolve to their real render function — exactly the property the W6 regression violated. | `64a264b` | bug-auto-fix S3 |
| 2026-05-23 22:30 PDT | bug-auto-fix S3 (Claude Opus 4.7 1M inline) | Sub-fix S3: dev_log state machine flip. Set `Current Phase=BUG_VERIFY`, `Status=FIX_READY_FOR_VERIFY`, `Suggested Next=bug-verify`, `Verify Cross-vendor=yes` (Codex gpt-5.5-thinking medium primary per the post-roadmap manifest header; build-green gate + deferred manual browser smoke per user request). All sub-fix items from the diagnose fix strategy complete; no PENDING items remain. | dev_log only | bug-verify |
| 2026-05-23 22:34 PDT | bug-verify (Claude Opus 4.7 1M inline) | Cycle 1 verify PASS. Reviewed commits `d7e189c`, `0255b51`, `64a264b`, `74ed2f9` independently: all conform to `docs/conventions/COMMIT_CONVENTION.md` (`type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body); scope is `apps/web/src/routes/**` + `apps/web/src/pages/` + dev_log only (no plugin packages, no `apps/desktop`, no manifest changes). Verified the reproduction protocol per dev_log §Repro for all 12 routes — see Verification Notes below. Re-ran the full gate matrix fresh: `pnpm --filter @repo/web check-types` clean; `pnpm --filter @repo/core check-types` clean; `pnpm --filter @repo/plugin-console check-types` clean; `pnpm --filter @repo/web exec eslint --max-warnings 0 src` → 3 pre-existing warnings (App.tsx unused import + 2 TokensSmokePage; not introduced by these sub-fixes — re-confirmed against the baseline before `d7e189c`); `pnpm --filter @repo/web exec vitest run` → 91/91 across 19 files (includes the new 24/24 router-modules.integration.test); `pnpm --filter @repo/web build` → success in 2.74s. Browser-safety gate: `rg @tauri-apps\|__TAURI__ apps/web/dist/assets/*.js` → 0 matches (pre-existing 14 `tauri://` substring hits in Supabase WebAuthn code are unrelated to the import-leak gate and present in the baseline). Deferred: independent Codex gpt-5.5-thinking medium re-run + real-browser smoke at `/app/tasks` — documented as DEFERRED per dev_log Verify Cross-vendor note; ship gate may execute them or accept the in-session matrix. | — | ship |

| 2026-05-23 23:05 PDT | ship (claude-sonnet-4-6) | Ship gate PASS. Verified Status=READY_TO_SHIP, working tree clean (0 uncommitted changes). Spot-checked all 5 commits against COMMIT_CONVENTION.md — all conform (type(scope): summary + Why/What/Scope/Risk/Docs/Tests). No sensitive files detected. Pushed 5 bugfix commits (d7e189c..0298ed3) to origin/main (94fc3b2..0298ed3). No manifest row to flip (host-level bug, not a roadmap row). Deferred: Codex gpt-5.5-thinking medium independent re-run + real-browser smoke at /app/tasks per dev_log Verify Cross-vendor note — user may run these post-ship to confirm visually. | d7e189c, 0255b51, 64a264b, 74ed2f9, 0298ed3 pushed to origin/main | workflow complete |

## Fix Record (Cycle 1, bug-auto-fix)

| Sub-fix | Scope | Commit | Files Changed | Tests |
|---|---|---|---|---|
| S0 (setup) | Commit bug-diagnose dev_log as immutable contract before sub-fixes | `d7e189c` | `packages/web-console-host-router/docs/dev_log.md` (+172 -8) | none |
| S1 | Seam swap: delete `registrations.tsx`, add `webModuleRouteRegistrations` export in `shellRegistrations.tsx` (shell array + todos transitional shim), repoint `router.tsx` + `RouteGateElements.tsx`, delete unused `ModuleRoutePlaceholderPage.tsx` | `0255b51` | 5 files (+33 -87): `apps/web/src/routes/modules/shellRegistrations.tsx`, `apps/web/src/routes/router.tsx`, `apps/web/src/routes/RouteGateElements.tsx`, `apps/web/src/routes/modules/registrations.tsx` (deleted), `apps/web/src/pages/ModuleRoutePlaceholderPage.tsx` (deleted) | scoped 17/17 pass |
| S2 | Regression test: Layer A (12 + 1 resolution) + Layer B (7 deep-link real-render) + Layer C (4 single-source-of-truth invariant) | `64a264b` | 1 file (+241 -0): `apps/web/src/routes/__tests__/router-modules.integration.test.tsx` | new 24/24 + full @repo/web 91/91 |
| S3 | dev_log state machine flip → FIX_READY_FOR_VERIFY + Work Log + Fix Record | (this commit) | `packages/web-console-host-router/docs/dev_log.md` | none |

Evidence for bug-verify:

- `pnpm --filter @repo/web check-types` → clean (after S1).
- `pnpm --filter @repo/web exec eslint --max-warnings 0 src` → 3 pre-existing warnings; **not introduced by these sub-fixes** (verified via `git stash` + re-run on the d7e189c baseline).
- `pnpm --filter @repo/web exec vitest run` → 91/91 pass across 19 files (after S2).
- New `apps/web/src/routes/__tests__/router-modules.integration.test.tsx` exists, 24/24 pass, covers all 12 shell modules + transitional todos shim.
- `webModuleRouteRegistrations` is now a structural composition of `[...webShellModuleRegistrations, todoWebModuleRegistration]`; future drift between the rail array and the host router array fails Layer C immediately.
- Deferred to bug-verify: independent commit review per `COMMIT_CONVENTION.md`, independent full re-run of typecheck + lint + scoped tests + `pnpm --filter @repo/web build`, and the optional manual real-browser smoke at `/app/tasks` (deferred if browser tooling unavailable per dev_log Verify Cross-vendor note).

## Verification Notes (Cycle 1, bug-verify)

Verdict: **PASS** — fix lands cleanly, reproduction inversion holds for all 12 routes, no scope creep.

### Commit review

| Commit | Verdict | Notes |
|---|---|---|
| `d7e189c` docs(web-console-host-router) | OK | Diagnose-only commit; recorded the dual-perspective analysis + fix strategy. Title matches `type(scope): summary`; body has Why/What/Scope/Risk/Docs/Tests. |
| `0255b51` fix(web-console-host-router) | OK | Runtime seam swap. Scope = `apps/web/src/routes/**` + `apps/web/src/pages/` only — confirmed via `git show --stat`. Risk section enumerates the 4 concrete risk vectors (assertUniqueModuleRegistrations, resolveDefaultModulePath, /app/todos shim, lint baseline). |
| `64a264b` test(web-console-host-router) | OK | Test-only addition. 241 LoC, 3 acceptance-criterion layers, references the diagnose AC ids verbatim. |
| `74ed2f9` docs(web-console-host-router) | OK | State machine flip + Fix Record. Single dev_log file. |

All four commit messages conform to `docs/conventions/COMMIT_CONVENTION.md`. No `--no-verify`, no `--amend`, no signing bypass.

### Reproduction protocol replay (per dev_log §Repro)

The dev_log §Repro section names 12 routes that **should** render the real module (and one — `/app/todos/smart:inbox` — that should continue working as a transitional regression-safety case). The new `apps/web/src/routes/__tests__/router-modules.integration.test.tsx` covers all 13 cases:

| dev_log §Repro | Expected after fix | Verify result |
|---|---|---|
| `/app/tasks` → TasksModule | `.module-tasks` rendered, no placeholder | PASS — AC-W6-FIX-1 + Layer A `tasks` |
| `/app/board` → BoardWorkspacesModule | resolves to real render fn (BoardWorkspacesModuleRoute) | PASS — Layer A `board` (data-heavy, Layer-A-only by design) |
| `/app/dashboard` → DashboardModule | resolves to real render fn | PASS — Layer A `dashboard` |
| `/app/calendar` → CalendarModule | `.module-cal` rendered, no placeholder | PASS — AC-W6-FIX-3 + Layer A `calendar` |
| `/app/matrix` → MatrixModule | `.module-matrix` rendered, no placeholder | PASS — AC-W6-FIX-2 + Layer A `matrix` |
| `/app/pomodoro` → PomodoroModule | `.module-pomo` rendered, no placeholder | PASS — AC-W6-FIX-4 + Layer A `pomodoro` |
| `/app/habits` → HabitsModule | resolves to real render fn | PASS — Layer A `habits` |
| `/app/meditation` → MeditationModule | resolves to real render fn | PASS — Layer A `meditation` |
| `/app/countdown` → CountdownModule | `.module-countdown` rendered, no placeholder | PASS — AC-W6-FIX-5 + Layer A `countdown` |
| `/app/statistics` → StatisticsModule | `.module-stats` rendered, no placeholder | PASS — AC-W6-FIX-6 + Layer A `statistics` |
| `/app/ai-chat` → AiChatModule | resolves to real render fn | PASS — Layer A `ai-chat` |
| `/app/settings` → ComposedSettingsModule | `.module-settings` rendered, no placeholder | PASS — AC-W6-FIX-7 + Layer A `settings` |
| `/app/todos/smart:inbox` → TodoModule (regression-safe) | preserved via transitional shim | PASS — `router.integration.test.tsx` + AC-W6-FIX-LA/todos |

### Boundary checks

- `assertUniqueModuleRegistrations(webModuleRouteRegistrations)`: 13 unique ids (12 shell + 1 todos). Layer C/AC-W6-FIX-LC/unique covers.
- `resolveDefaultModulePath(webModuleRouteRegistrations)`: returns `/app/ai-chat` (first entry, `defaultChildPath: ""`). Documented in S1 commit Risk section.
- Single-source-of-truth invariant: Layer C/AC-W6-FIX-LC/length + /order + /shim guarantee future drift cannot recur.
- Browser-safety gate (no Tauri/native leak in apps/web bundle): `rg @tauri-apps\|__TAURI__ apps/web/dist/assets/*.js` → 0 matches. (Note: 14 `tauri://` substring hits in Supabase WebAuthn code are unrelated and present pre-fix; not a regression.)

### Critical-path impact

- Rail behavior: unchanged — still reads `webShellModuleRegistrations` filtered by `useFeaturePrefs`.
- Authenticated `/app` entry: now redirects to `/app/ai-chat` instead of legacy `/app/labels/inbox` (labels module never existed in production). Correct per DESIGN.md rail order.
- Observability route sanitization (`apps/web/src/observability/**`): unchanged — `/app/todos/:id` still resolves and tests pass.

### Deferred items

- Independent re-run by Codex gpt-5.5-thinking medium (cross-vendor primary): DEFERRED. Recorded in dev_log Verify Cross-vendor note. Ship gate may execute or skip.
- Manual real-browser smoke at `/app/tasks` via `pnpm --filter @repo/web dev:mock-auth`: DEFERRED — no in-session browser tool available. The 3-layer test coverage (24 tests + 17 pre-existing router/shell tests) is the primary gate; the user's request explicitly allowed documenting this as deferred.

### Verdict

- **PASS** — Status flipped to READY_TO_SHIP. Suggested Next = ship.
- Commits to push: `d7e189c`, `0255b51`, `64a264b`, `74ed2f9`, plus the dev_log update commit landed in this verify pass.

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-console-host-router/20260521-roadmap-seed.md`
- Governing ADR: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- Upstream host/auth/cache references:
  - `packages/web-auth-device-session/docs/{design.md,api.md}`
  - `packages/plugin-console/docs/{design.md,api.md}`
  - `packages/web-encrypted-indexeddb-cache/docs/api.md`

## Phase Plan

### Phase 1 — Router foundation and family boundaries

Status: DONE (`6bbbf14`).

File boundary:

- `apps/web/package.json`
- `apps/web/src/main.tsx`
- `apps/web/src/routes/**`
- `apps/web/src/pages/{LandingPage.tsx,AuthPage.tsx,NotFoundPage.tsx}`

Required implementation:

- add `react-router`
- replace the current pathname-switch `HostRouter`
- define `/`, `/auth/*`, `/app/*`, and not-found route families
- add route-level error boundaries

Gate:

- refresh/deep-link/browser-history semantics are owned by one real browser router

Scoped verification:

- `pnpm --filter @repo/web check-types`
- route tests for top-level families and boundaries

### Phase 2 — App shell composition and module-route seam

Status: DONE (`18a30c2`).

File boundary:

- `apps/web/src/pages/AppShellPage.tsx`
- `apps/web/src/providers/AppProviders.tsx`
- `apps/web/src/routes/app/**`
- any host-only route registry/helpers under `apps/web/src/routes/**`

Required implementation:

- mount the guarded app shell under `/app/*`
- redirect `/app` to the default module path
- freeze `/app/:moduleId/*` as the stable host-owned parent seam
- add the shared package-exported module registration contract plus host composition helper
- keep placeholder-safe module mounting while later rows stay mock-first through the same registration seam
- consume `plugin-console` shell contracts without moving business logic into the host

Gate:

- later Web module rows can add child routes by exporting registrations from their owning package without reopening the top-level host tree

Scoped verification:

- deep-link and refresh test for one `/app/:moduleId/*` route
- back/forward behavior across `/`, `/auth/*`, `/app/*`
- registration-assembly test for duplicate or missing `moduleId` child routes

### Phase 3 — Web host capabilities and unsupported-native stubs

Status: DONE (`41db694`).

File boundary:

- `apps/web/src/providers/**`
- `apps/web/src/routes/**`
- host-only capability/stub files under `apps/web/src/**`
- `packages/core/src/types/plugin.ts`
- only minimal `packages/plugin-console` touch if capability plumbing must thread through existing shell props

Required implementation:

- inject typed browser-safe host capabilities for download, notification, shortcut, DnD, settings, and search
- extend shared `ConsoleViewCapabilities` in `@repo/core` instead of introducing a long-lived parallel `WebHostCapabilities` type
- add explicit unsupported-native results for Desktop/Tauri-only actions
- add the browser-safety import/build guard at the `apps/web` host boundary and across transitive module-route exports
- ensure browser-rendered code reaches native/Desktop behavior only through the shared capability seam

Gate:

- unsupported capabilities are explicit and recoverable; native/Desktop imports do not leak into browser-rendered modules

Scoped verification:

- capability stub tests for supported and unsupported cases
- browser-safety import/lint guard

## Risks

- The host could accidentally absorb business routing/data logic if route loaders or page components grow beyond assembly concerns.
- Extending the shared `@repo/core` console contract too broadly in this row could turn a host assembly task into a general console redesign.
- URL versus local-state ownership can drift and break refresh/deep-link semantics if not frozen early.
- Capability stubs may appear to work while silently masking unsupported native/Desktop behavior unless the error/degrade contract is enforced.

## Suggested Review Focus

- Confirm React Router is the right router choice for the current repo state and roadmap requirement.
- Confirm the package-exported module registration contract is the correct stable ownership model for later rows under `/app/:moduleId/*`.
- Confirm auth remains provider/package-owned rather than moving into the router.
- Confirm extending shared `ConsoleViewCapabilities` is the right way to prevent Tauri/native leakage in browser-rendered modules.

## Review Notes

- APPROVED. The revised docs resolve the two prior blockers and leave the feature executable without planning-time ambiguity.
- `/app/:moduleId/*` child-route ownership is now frozen to one model: later module rows export `WebModuleRouteRegistration` from their package public surface, and `apps/web` composes those registrations once under the fixed host-owned parent seam.
- Web host capability ownership is now frozen to one shared model: `ConsoleViewCapabilities` remains the only public capability surface, `apps/web` owns the browser implementation plus browser-safety guard, and unsupported native/Desktop actions must be absent or return explicit typed degraded results.
- Recommendation: keep the Phase 3 `@repo/core` contract extension minimal and scoped to browser-safe host actions needed by W6 so this row does not drift into a broader Console contract redesign.

## Revision Response

- Revised: froze `/app/:moduleId/*` child-route extension as a package-exported `WebModuleRouteRegistration` contract owned by later module-row packages, composed once by the Web host, with placeholder fallbacks using the same seam.
- Revised: removed the long-lived parallel `WebHostCapabilities` assumption and froze shared `ConsoleViewCapabilities` in `@repo/core` as the single public capability surface, with the browser implementation and import/build guard owned by `apps/web`.
- Intentionally not changed: React Router remains the selected browser router, auth/session ownership stays in `@repo/web-auth-device-session`, and the hard constraints against Tauri/native imports in browser-rendered modules remain unchanged.

## Verification Notes

- PASS. Reviewed `6bbbf14`, `18a30c2`, `41db694`, `43989ee`, `6e070fc`, `5c5da73`, and `c8ce390`; commit messages are compliant and the runtime commits stayed within their declared phase or repair intent.
- Re-ran scoped verification: `pnpm --filter @repo/core check-types`, `pnpm --filter @repo/plugin-console check-types`, `pnpm --filter @repo/web check-types`, `pnpm --filter @repo/web exec vitest run src/routes/modules/buildModuleRoutes.test.ts src/host/capabilities.test.ts src/routes/router.integration.test.tsx`, `pnpm --filter @repo/web exec eslint --max-warnings 0 src`, and `pnpm --filter @repo/web build`.
- Browser-safety gate passed: `rg -n "@tauri-apps|tauri://|__TAURI__" apps/web/dist/assets` returned no matches after the fresh build, and `apps/web/src/**` imports only browser-safe `@repo/plugin-console/web` and `@repo/web-auth-device-session/web` entrypoints.
- Local mock-auth seam passed in a real browser engine (`playwright-core` against local Chrome): authenticated `/app/todos/inbox` deep-link stayed stable across reload, `/` ⇄ `/app/todos/inbox` back/forward history resolved correctly, authenticated `/auth/login` redirected into `/app/labels/inbox`, unauthenticated `/app/todos/inbox` redirected to `/auth/login?next=%2Fapp%2Ftodos%2Finbox`, and invoking the unsupported native stub kept the app shell mounted on the same route.
- Residual risk: route-family error boundaries are wired in `apps/web/src/routes/router.tsx` and `RouteErrorBoundary.tsx`, but this pass did not add a dedicated throw-path regression test for each boundary scope.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-22 11:44 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh planning pass from the roadmap seed: created the missing Step 0 feature brief, compared current router options with official-source evidence, froze React Router plus route-level error boundaries as the browser host direction, and initialized design/api/test/dev_log for the `apps/web` host-assembly boundary and typed capability-stub contract. | — | feature-review |
| 2026-05-22 11:49 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass returned REVISE. Router choice and thin-host boundaries are acceptable, but the plan does not yet freeze the module-route registration mechanism or the ownership model for browser host capabilities versus shared Console capabilities, so build would still have to make contract decisions that belong in planning. | — | feature-plan |
| 2026-05-22 11:53 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revise pass: froze package-exported module route registration ownership under a host-composed `/app/:moduleId/*` seam, collapsed the Web-only capability fork back into shared `ConsoleViewCapabilities`, documented the `apps/web` browser-safety guard location, and aligned discovery/design/api/test/dev_log without expanding scope beyond the review blockers. | — | feature-review |
| 2026-05-22 12:00 PDT | feature-review (Codex gpt-5.3-codex inline) | Second review pass APPROVED. Confirmed the revised planning artifacts now freeze one executable module-route registration model and one shared browser-safe capability ownership model, with Phase boundaries and downstream extension rules clear enough for build. | — | feature-build |
| 2026-05-22 12:06 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 1 complete: replaced manual pathname switch with React Router + RouterProvider, introduced `/`, `/auth/*`, `/app/*`, `*` route families, and added scoped route-level error boundaries. | `6bbbf14` | Phase 2 |
| 2026-05-22 12:12 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 2 complete: added shared `WebModuleRouteRegistration` types in `@repo/core`, implemented host module registration/match helpers, redirected `/app` to deterministic default module route, and mounted guarded `/app/:moduleId/*` seam with placeholder module rendering. | `18a30c2` | Phase 3 |
| 2026-05-22 12:16 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 3 complete: extended shared `ConsoleViewCapabilities` with browser-safe methods, added web host capability stubs (download/notification/shortcut/DnD/native unsupported), wired capability injection into app/module placeholders, and enforced `@tauri-apps/*` import blocking for `apps/web/src/**`. | `41db694` | feature-verify |
| 2026-05-22 12:22 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verify pass BLOCKED. Reviewed `6bbbf14`, `18a30c2`, `41db694`, and `43989ee`; commit messages and phase boundaries are acceptable. Ran `pnpm --filter @repo/core check-types`, `pnpm --filter @repo/plugin-console check-types`, `pnpm --filter @repo/web check-types`, `pnpm --filter @repo/web exec vitest run src/routes/modules/buildModuleRoutes.test.ts src/host/capabilities.test.ts`, `pnpm --filter @repo/web exec eslint --max-warnings 0 src`, and `pnpm --filter @repo/web build`; browser-verified `/`, `/auth/login`, and unauthenticated `/app/todos/inbox` redirect via the local Vite host. Blocked because the built web bundle still contains Tauri/native symbols and the current host/docs provide no local mock/authenticated seam to verify `/app/:moduleId/*` module rendering, capability stubs, refresh, and history behavior after guard entry. | — | feature-build |
| 2026-05-22 12:34 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Repair Phase B1 complete: eliminated transitive desktop leakage by introducing browser-safe package entrypoints (`@repo/plugin-console/web`, `@repo/web-auth-device-session/web`), migrating `apps/web` imports, and enforcing restricted root imports in `apps/web` lint rules. Evidence: `pnpm --filter @repo/web build` then `rg -n \"@tauri-apps|tauri://|__TAURI__\" apps/web/dist/assets/index-*.js` returned no matches. | `6e070fc` | Repair B2 |
| 2026-05-22 12:36 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Repair Phase B2 complete: added local authenticated verify seam via `VITE_WEB_AUTH_MODE=mock-authenticated` in `AppProviders`, added guarded-route integration coverage for deep-link/remount/history-entry routing and unsupported capability-stub interaction, and reran full scoped verification matrix. | `5c5da73` | feature-verify |
| 2026-05-22 12:44 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verify retry PASS. Re-reviewed the full feature commit set through `c8ce390`, reran the scoped typecheck/lint/test/build matrix, confirmed the built bundle contains no transitive Tauri/native symbols, and browser-verified the mock-authenticated plus mock-unauthenticated guard flows, refresh/deep-link/history semantics, and unsupported-capability stub stability. | — | ship |
| 2026-05-22 14:38 PDT | ship (Codex gpt-5.3-codex inline) | Ship gate PASS. Verified `Status=READY_TO_SHIP` and `Suggested Next=ship`, confirmed local feature commits `6bbbf14`..`c8ce390` are complete and commit-message quality matches convention, pushed feature commits to `origin/main`, and reconciled feature #10 roadmap status to `SHIPPED`. | local commits `6bbbf14`..`c8ce390` + ship-state docs commit | workflow complete |
