# Design Snapshot — xai-web-cmdk

## Decision header

| Field | Value |
|---|---|
| Selected Option | **Option A** — Native React 19 palette inside a new `@repo/xai-web-cmdk` package; in-memory adapter registry; no third-party lib |
| Review Doc | `docs/reviews/xai-web-cmdk-search/20260525-discovery-review.md` |
| Review Date | 2026-05-25 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #3 (W1 · NEW package) |
| Source brief | `docs/reviews/xai-web-cmdk-search/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure scope) |
| Companion ADRs | ADR-0006 · ADR-0007 §S4/§S6/§S7 |
| Source PRD | `web design/DESIGN.md` §3 (IA) + §6 (component catalog) + §13 (planned extension) |
| Source prototype | `web design/shell.jsx` lines 168–200 |
| Target packages | NEW `packages/xai-web-cmdk/` + MODIFY `packages/xai-web-shell/src/Topbar.tsx` (input→button) + EXTEND `packages/core/src/types/events.ts` (+2 channels) + MODIFY `apps/web/src/App.tsx` (mount `<CommandPalette/>` sibling of `<Shell/>`) + UPDATE `docs/PLUGIN_MAP.md` (+1 row) |
| Pattern reference | `packages/xai-web-ai-chat/docs/design.md` §"2026-05-25 Extension" (new-package + EventMap-extension pattern) |
| Last Updated | 2026-05-25 |

## Frozen assumptions (lock at plan acceptance)

1. **Package name + path.** `@repo/xai-web-cmdk` at `packages/xai-web-cmdk/`. Follows `xai-web-*` convention (shell, event-bus, tokens shims).
2. **Overlay-only** (HC1). `<CommandPalette/>` is NOT a `WebModuleSlotRegistration`. No `railOrder`, no `i18nKey`, no `showInRail`, no entry in `apps/web/src/routes/modules/shellRegistrations.tsx`.
3. **In-memory index only** (HC2). No new storage keys. The palette opens, reads each module's already-persisted state via the SHIPPED `usePref`/`getPref` API, builds an array of `SearchHit[]`, filters by query, and discards on close.
4. **Adapter contract** is `type ModuleSearchAdapter = (query: string, state: unknown) => SearchHit[]`. Pure synchronous function. Never throws (each adapter wraps body in `try/catch` and returns `[]` on failure).
5. **11 adapters** under `src/adapters/<module>.ts`: tasks, board, dashboard, calendar, matrix, pomodoro, habits, meditation, countdown, statistics, settings (HC3).
6. **2 new EventMap channels** in `@repo/core/types/events.ts` (HC4):
   - `web:search:invoked` — emitted on palette open
   - `web:search:jump` — emitted on Enter (or click on result)
7. **Keyboard contract** (HC5): Cmd+K (mac) / Ctrl+K (other OS) opens; Esc closes; ↑/↓ navigates; Enter jumps; Cmd+Enter is documented as no-op aliased to Enter for v1 (SPA — no native new-tab semantics).
8. **DESIGN.md §6 frozen UI** (HC6): palette = centered modal (640×480 max), `.modal-scrim` backdrop with `backdrop-filter: blur(8px)`, `.card-modal` shell, **monospace input** using `JetBrains Mono` font stack (already imported via `@repo/plugin-web-tokens`), `aria-label` = i18n `common.search_placeholder`.
9. **XSS safety** (HC7). Every user-content match goes through `escapeHtml()` BEFORE `<mark>` wrapping; render via `dangerouslySetInnerHTML`. Helper has 12 unit-test cases. Codex cold-read mandatory verify gate.
10. **No third-party library.** React 19 + Web platform APIs only.
11. **No CSP edits.** No outbound network from palette.
12. **Topbar swap.** `packages/xai-web-shell/src/Topbar.tsx` lines 24–29 (`<input readOnly>` + `⌘K` span) become a single `<button class="search-box">` that calls `useCommandPalette().open({ source: "topbar-click" })`. The kbd `⌘K` span stays as a decorative child of the button.
13. **Bilingual matching.** Every adapter lowercases query + both `en` and `zh` candidates and uses `.includes()`. UI lang does NOT filter results.
14. **Result hit shape** is closed:
    - `kind: "module-jump"` — go to `/app/${moduleId}`
    - `kind: "entity"` — `entityId` + `moduleId`; navigate to `/app/${moduleId}` + emit `web:search:jump` with `entityId` so the module can scroll-into-view (consumer wires up scroll behaviour per-module; v1 only the pomodoro module is mandated by AS2)
    - `kind: "settings-pane"` — `paneId`; navigate to `/app/settings` + emit with `entityId = paneId`
15. **App-level mount.** `<CommandPalette/>` is mounted ONCE at app shell level (sibling of `<Shell/>` in `apps/web/src/App.tsx`). The global keyboard listener lives inside the component via `useEffect`.
16. **Performance budget**: <50 ms for index build (P5 unit test), <100 ms total open latency including modal mount + first paint (P5 manual cross-vendor check).
17. **No internal state in the cmdk registry** beyond a `Map<WebModuleId, ModuleSearchAdapter>`. Tests reset the registry between cases via `__resetCmdkRegistry()` test helper.
18. **Calendar + Statistics** adapters return module-jump entries only (no own searchable entity data). All 11 adapters are present per AS3.
19. **PLUGIN_MAP row** added in P5 with status `In-Dev` then flipped to `Stable` on ship (matches row #18 ai-chat pattern; see `docs/PLUGIN_MAP.md` line 114 as reference shape).
20. **Cross-vendor verify**: mandatory (per ADR-0009 D4 + roadmap default). Codex `gpt-5.5-thinking effort=medium` is primary verifier; Cursor fallback.

## Package structure

```
packages/xai-web-cmdk/
├── package.json                     — @repo/xai-web-cmdk, peerDep react/react-dom, dep @repo/core + @repo/plugin-web-storage + @repo/plugin-web-tokens + @repo/xai-web-event-bus + @repo/xai-web-shell (for useWebShell to read lang)
├── tsconfig.json                    — extends @repo/typescript-config/react-library.json
├── vitest.config.ts                 — jsdom; setupFiles vitest.setup.ts
├── vitest.setup.ts                  — RAF polyfill + localStorage.clear() afterEach + @testing-library/jest-dom
├── eslint.config.js                 — extends @repo/eslint-config/react-internal + no-explicit-any: error
├── docs/                            — this docs four-pack
│   ├── design.md
│   ├── api.md
│   ├── test.md
│   └── dev_log.md
└── src/
    ├── index.ts                     — PUBLIC SURFACE (the only allowed import path)
    ├── types.ts                     — SearchHit / SearchHitKind / ModuleSearchAdapter / RegisterAdapterFn / UseCommandPalette
    ├── styles.css                   — palette modal + scrim + result list + monospace input (reuses tokens; no hex)
    ├── CommandPalette.tsx           — top-level component; mounts modal + keyboard listener; consumes registry; emits web:search:* events
    ├── PaletteInput.tsx             — controlled monospace input + ↑/↓/Esc/Enter handler
    ├── PaletteList.tsx              — virtualized? NO (item count ≤200 typical); plain mapped list + scroll-into-active-row
    ├── PaletteResultRow.tsx         — single result row; renders escaped highlight; role="option"; aria-selected
    ├── registration.ts              — public hook `useCommandPalette()` returning {open, close, isOpen, query, setQuery} via Context
    ├── CommandPaletteProvider.tsx   — Context provider component (mounted in apps/web/src/App.tsx wrapping <Shell/>)
    ├── adapters/                    — 11 module adapter files; each calls registerSearchAdapter at import time
    │   ├── index.ts                 — barrel re-import of all 11 for side-effect registration
    │   ├── tasks.ts
    │   ├── board.ts
    │   ├── dashboard.ts
    │   ├── calendar.ts
    │   ├── matrix.ts
    │   ├── pomodoro.ts
    │   ├── habits.ts
    │   ├── meditation.ts
    │   ├── countdown.ts
    │   ├── statistics.ts
    │   └── settings.ts
    ├── internal/                    — private; never imported by consumers
    │   ├── registry.ts              — module-scoped Map<WebModuleId, ModuleSearchAdapter>; getRegisteredAdapters() test helper; __resetCmdkRegistry() test reset
    │   ├── escapeHtml.ts            — pure: escapeHtml(s: string): string
    │   ├── highlightMatch.ts        — pure: highlightMatch(text: string, query: string): string (escape-then-wrap)
    │   ├── buildIndex.ts            — pure: buildIndex(query: string, moduleStates: Record<WebModuleId, unknown>): SearchHit[]
    │   ├── readModuleStates.ts      — pure-ish: reads localStorage for all 11 known keys + returns Record<WebModuleId, unknown>
    │   ├── keyboardCombo.ts         — pure: matchesCmdK(e: KeyboardEvent): boolean
    │   └── navigateToHit.ts         — pure: navigateToHit(hit: SearchHit, navigate: NavigateFn, emit: EmitFn, query: string)
    └── __tests__/                   — vitest tree (see test.md)
        ├── escapeHtml.test.ts                              — 12 cases
        ├── highlightMatch.test.ts                          — 6 cases
        ├── keyboardCombo.test.ts                           — 8 cases (Cmd+K mac, Ctrl+K linux, ignored Cmd+J, Cmd+K with input focused, etc.)
        ├── registry.test.ts                                — 5 cases (register / dup-throws / reset / getRegisteredAdapters / __reset)
        ├── adapters/tasks.test.ts                          — T1..T6
        ├── adapters/board.test.ts                          — B1..B6
        ├── adapters/dashboard.test.ts                      — D1..D5
        ├── adapters/calendar.test.ts                       — C1..C4
        ├── adapters/matrix.test.ts                         — MX1..MX5
        ├── adapters/pomodoro.test.ts                       — PM1..PM6
        ├── adapters/habits.test.ts                         — H1..H5
        ├── adapters/meditation.test.ts                     — ME1..ME4
        ├── adapters/countdown.test.ts                      — CD1..CD5
        ├── adapters/statistics.test.ts                     — ST1..ST3
        ├── adapters/settings.test.ts                       — SE1..SE6
        ├── buildIndex.test.ts                              — BI1..BI8 (multi-adapter aggregation + cap + ordering)
        ├── CommandPalette.test.tsx                         — CP1..CP18 (open/close/keyboard nav/Esc/Enter/Cmd+Enter aliased)
        ├── PaletteInput.test.tsx                           — PI1..PI5
        ├── PaletteList.test.tsx                            — PL1..PL5
        ├── PaletteResultRow.test.tsx                       — PR1..PR4 (XSS-safe highlight in rendered DOM)
        ├── index-barrel.test.ts                            — IB1..IB5 (only the 6 public exports present; no internal leak)
        ├── perfBudget.test.ts                              — PB1 (buildIndex with realistic mock state across 11 keys < 50 ms)
        └── eventEmit.test.ts                               — EM1..EM4 (web:search:invoked on open; web:search:jump on Enter; payload shape)
```

## Component graph

```
apps/web/src/App.tsx
└── <CommandPaletteProvider>          ← NEW (from @repo/xai-web-cmdk)
    └── <Shell/>                       ← SHIPPED (from @repo/xai-web-shell)
    │   └── <Topbar/>                 ← MODIFIED: input→button (calls useCommandPalette().open)
    └── <CommandPalette/>             ← NEW (sibling of <Shell/>; mounts modal + keyboard listener)
```

`<CommandPaletteProvider>` owns the open/close/query state via React Context.
`useCommandPalette()` is the public hook. The Topbar button is a consumer.
`<CommandPalette/>` is a consumer + the modal renderer. The keyboard listener
is set up inside `<CommandPalette/>`'s effect.

## State machine

```
   [ closed ] ── user presses Cmd+K OR clicks topbar button ──► [ opening ]
                                                                  │ (1 RAF; modal mount)
                                                                  ▼
                                                             [ open, query="" ]
                                                                  │ user types
                                                                  ▼
                                                          [ open, query="t" ]
                                                          ├─ buildIndex runs synchronously
                                                          ├─ result list renders (max 50 hits, scored)
                                                          │
                                                          ├ user presses ↑/↓ ─► activeIndex updates
                                                          ├ user presses Enter ─► navigate + close + emit web:search:jump
                                                          ├ user presses Esc OR clicks scrim ─► close
                                                          └ user clicks result row ─► same as Enter
```

`buildIndex` is pure and synchronous. On open:

1. `<CommandPalette/>` sets `isOpen = true` via context setState.
2. Same render pass: the modal mounts, `<PaletteInput/>` autofocuses.
3. On every `query` change: call `buildIndex(query, moduleStates)` (memoized
   on `query` AND `moduleStates`). `moduleStates` is captured ONCE at open
   time — module updates while the palette is open are intentionally NOT
   reflected (acceptable v1 tradeoff — user closes & reopens to refresh).
4. `web:search:invoked` is emitted once per open.
5. On Enter / click: `navigateToHit()` → emit `web:search:jump` → call
   `navigate("/app/${moduleId}")` → close palette.

## Dependencies

| Dep | Kind | Why |
|---|---|---|
| `@repo/core` | dep (workspace) | `WebModuleId` type + new EventMap entries `web:search:invoked` / `web:search:jump` |
| `@repo/plugin-web-tokens` | dep (workspace) | `useI18n(lang)` for placeholder + empty-state copy; `Lang` type |
| `@repo/plugin-web-storage` | dep (workspace) | `getPref("xai_*")` synchronous read in `readModuleStates.ts` |
| `@repo/xai-web-event-bus` | dep (workspace) | `emitWebEvent` + `useWebEventListener` |
| `@repo/xai-web-shell` | dep (workspace) | `useWebShell()` to read current `lang` (the palette renders bilingual labels) |
| `react-router` | peerDep | `useNavigate` for jump |
| `react`, `react-dom` | peerDep | components |
| `@testing-library/react`, `vitest`, `jsdom`, `@testing-library/jest-dom`, `@types/react`, `@types/react-dom`, `typescript`, `@repo/eslint-config`, `@repo/typescript-config` | devDep | sibling standard scaffolding |

**Reverse-deps** (consumers added in this row):

- `@repo/xai-web-shell` consumes `useCommandPalette` from `@repo/xai-web-cmdk` (`Topbar.tsx` button click). This is a one-way dep that introduces a cmdk←shell edge. **Acceptable** because cmdk does not depend on shell at runtime for the registry (it depends on shell only for `useWebShell` lang reading inside its own component); cycle risk is none because the dep direction at runtime is cmdk imports shell (for lang) and shell imports cmdk (for the open hook) — these resolve at module-load via ES module hoisting. Verify by typecheck in P4.

- An alternative considered: pass the `open` callback as a `Topbar` prop and wire it up in `apps/web/src/App.tsx` (no cmdk←shell dep). **Decision**: Pass callback as prop. Cleaner, avoids the cyclic-appearing edge. New `TopbarProps.onOpenSearch?: () => void` (optional, backwards-compatible). The default rendering with `onOpenSearch === undefined` keeps the readOnly input as a fallback; tests assert button when prop provided, input when not. This preserves all 46 SHIPPED tests with minimal edits.

**Final dep direction**: cmdk → shell (lang reading via `useWebShell` is one-way; shell does NOT import cmdk). The wiring of "click → open" lives in `apps/web/src/App.tsx` which imports both packages.

## Files plan (delta)

```
packages/xai-web-cmdk/                            — NEW (see structure above; ~20 source files + ~20 test files)

packages/xai-web-shell/
├── src/Topbar.tsx                                — MODIFY: input(readOnly)+span(kbd) → button(class="search-box") + onOpenSearch?: () => void prop (optional)
├── src/types.ts                                  — MODIFY: add `onOpenSearch?: () => void;` to TopbarProps
├── src/Shell.tsx                                 — MODIFY: pass `onOpenSearch` through to <Topbar/> (host can pass undefined for backwards compat)
├── src/__tests__/Topbar.test.tsx                 — MODIFY: TP5 (input renders) → split into TP5a (no prop → input fallback), TP5b (prop → button). Add TP7 (button click calls onOpenSearch). TP6 (kbd hint) stays unchanged.
└── (46 SHIPPED tests stay green; net delta ~+3 cases, ~3 edits)

packages/core/
└── src/types/events.ts                           — MODIFY: +2 EventMap entries (web:search:invoked + web:search:jump). +1 new exported type SearchHitKind (mirror of cmdk's kind, kept in core to avoid cycle if non-cmdk consumers want to type-listen)

apps/web/
├── package.json                                  — MODIFY: + "@repo/xai-web-cmdk": "workspace:*" dep
├── src/App.tsx                                   — MODIFY: wrap <Shell/> in <CommandPaletteProvider/>; mount <CommandPalette/> as sibling; pass onOpenSearch = useCommandPalette().open to <Shell/>
└── src/__tests__/App.test.tsx (if exists)       — MODIFY/ADD: assert palette opens on Cmd+K

docs/
├── PLUGIN_MAP.md                                 — UPDATE: +1 row for @repo/xai-web-cmdk (In-Dev → Stable on ship; sibling pattern: line 114 ai-chat)
└── reviews/xai-web-cmdk-search/20260525-discovery-review.md   — THIS PLAN'S REVIEW (already written above)
```

## Adapter behaviour spec (per-module)

| Module | Storage source | Searchable fields | Hit kind emitted |
|---|---|---|---|
| `tasks` | `xai_task_cols` (`Record<BucketId, TaskCard[]>`) | per-card `title.en`, `title.zh`, `sub.en`, `sub.zh`, `tag` | `entity` (entityId = card id) |
| `board` | `xai_boards_v2` (`BoardsState`) | board name `{en,zh}`; per-card title `{en,zh}` + labels | `entity` (entityId = card id; cardId resolves the active board too) |
| `dashboard` | `xai_dash_order` (`DashWidgetId[]`) | widget id + i18n label | `module-jump` (no entity; widget surfaces don't have own routes) |
| `calendar` | none (no own data) | module name aliases (calendar / 日历 / 月历) | `module-jump` |
| `matrix` | `xai_matrix_state` (`MatrixStateBlob`, opaque) | per-quadrant item titles (defensive predicate) | `entity` (entityId = card id within quadrant) |
| `pomodoro` | `xai_pomodoro_sessions` (`PomodoroSession[]`) | per-session `id` (label TBD; v1 matches on id substring + mode) | `entity` (entityId = session id) — supports AS2 |
| `habits` | `xai_habits_state` (`HabitsStateBlob`, opaque) | per-habit name (defensive read of `habits[].name.{en,zh}`) | `entity` (entityId = habit id) |
| `meditation` | `xai_meditation_prefs` (`MeditationPrefsBlob`) | scene name + sound name aliases | `module-jump` (single-screen module) |
| `countdown` | `xai_countdowns` (`Countdown[]`) | per-countdown title `{en,zh}` (defensive predicate) | `entity` (entityId = countdown id) |
| `statistics` | none (read-only aggregator) | module name aliases (statistics / 统计 / graph / chart) | `module-jump` |
| `settings` | `paneRegistry` from `@repo/plugin-web-settings-shell` (NOT a storage key — this is a typed const array) | pane label `{en,zh}` | `settings-pane` (entityId = pane id) |

## Phase plan (5 phases — one `feature-build` run each)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".

### Phase P1 — Package scaffold + types + adapter contract + EventMap extension (no UI)

**Scope**

1. Create `packages/xai-web-cmdk/` with `package.json`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `eslint.config.js`.
2. Create `src/types.ts` (SearchHit / SearchHitKind / ModuleSearchAdapter / UseCommandPalette).
3. Create `src/internal/registry.ts` (Map + register + reset + getRegisteredAdapters).
4. Create `src/internal/escapeHtml.ts` + `src/internal/highlightMatch.ts`.
5. Create `src/internal/keyboardCombo.ts` (Cmd+K detection).
6. Create `src/index.ts` exporting types + registry helpers (UI components added in P3).
7. Extend `packages/core/src/types/events.ts` with `web:search:invoked` + `web:search:jump`.
8. Add `pnpm-workspace.yaml` registration (if needed — usually picked up by `packages/*` glob).
9. Tests (P1 subset): `escapeHtml.test.ts` (12 cases), `highlightMatch.test.ts` (6), `keyboardCombo.test.ts` (8), `registry.test.ts` (5), `index-barrel.test.ts` (IB1–IB3 — only P1-stage exports).

**Acceptance**

- `pnpm --filter @repo/xai-web-cmdk lint` exits 0 (`--max-warnings 0`).
- `pnpm --filter @repo/xai-web-cmdk test` exits 0; all P1 tests pass.
- `pnpm --filter @repo/xai-web-cmdk typecheck` exits 0.
- `pnpm --filter @repo/core typecheck` exits 0 (new EventMap entries).
- `pnpm --filter @repo/core test` exits 0 (no regressions).
- Commit: `feat(xai-web-cmdk): P1 scaffold + types + adapter registry + EventMap extension (gap-closure row #3)`.

### Phase P2 — 11 module adapter pure functions + per-adapter unit tests

**Scope**

1. Implement 11 adapter files under `src/adapters/`:
   - `tasks.ts`, `board.ts`, `dashboard.ts`, `calendar.ts`, `matrix.ts`, `pomodoro.ts`, `habits.ts`, `meditation.ts`, `countdown.ts`, `statistics.ts`, `settings.ts`.
   - Each adapter is a single pure function: `(query, state) => SearchHit[]`.
   - Each adapter file ends with `registerSearchAdapter("<moduleId>", adapterFn)`.
2. Implement `src/adapters/index.ts` barrel that re-imports all 11 for side-effect registration.
3. Implement `src/internal/buildIndex.ts` and `src/internal/readModuleStates.ts`.
4. Tests (P2 subset): 11 adapter test files + `buildIndex.test.ts` (8 cases for aggregation + cap + ordering).
5. Export `<CommandPalette/>` is still NOT added — that lands in P3.

**Acceptance**

- `pnpm --filter @repo/xai-web-cmdk lint` exits 0.
- `pnpm --filter @repo/xai-web-cmdk test` exits 0; all P1+P2 tests pass (~60 cases total).
- `pnpm --filter @repo/xai-web-cmdk typecheck` exits 0.
- Commit: `feat(xai-web-cmdk): P2 — 11 module adapters + buildIndex + per-adapter tests (gap-closure row #3)`.

### Phase P3 — Palette modal UI + DESIGN.md §6 styling + keyboard nav

**Scope**

1. Implement `src/styles.css` (modal-scrim + card-modal + monospace input + result list; reuse tokens; zero hex).
2. Implement `src/PaletteInput.tsx`, `src/PaletteList.tsx`, `src/PaletteResultRow.tsx`.
3. Implement `src/CommandPaletteProvider.tsx` (Context provider + useCommandPalette hook).
4. Implement `src/CommandPalette.tsx`:
   - Mounts/unmounts `<dialog>` via context state.
   - Global keyboard listener via `useEffect` (uses `keyboardCombo.matchesCmdK`).
   - On open: read `moduleStates` via `readModuleStates()`; emit `web:search:invoked`.
   - On query change: call `buildIndex` (memoized).
   - On Enter / row click: `navigateToHit` → emit `web:search:jump` → close.
   - On Esc / scrim click: close.
   - Cmd+Enter aliased to Enter (no-op for v1 — comment in code references HC5).
5. Implement `src/internal/navigateToHit.ts`.
6. Export `<CommandPaletteProvider/>` + `<CommandPalette/>` + `useCommandPalette` + `<PaletteInput/>` (test convenience) from `src/index.ts`.
7. Tests (P3 subset): `CommandPalette.test.tsx` (CP1..CP18), `PaletteInput.test.tsx`, `PaletteList.test.tsx`, `PaletteResultRow.test.tsx` (incl. XSS-safe highlight rendering), `eventEmit.test.ts` (4 cases).

**Acceptance**

- `pnpm --filter @repo/xai-web-cmdk lint` exits 0.
- `pnpm --filter @repo/xai-web-cmdk test` exits 0; all P1+P2+P3 tests pass.
- `pnpm --filter @repo/xai-web-cmdk typecheck` exits 0.
- `pnpm --filter @repo/xai-web-event-bus typecheck` exits 0 (new event keys typed).
- Commit: `feat(xai-web-cmdk): P3 — palette modal + DESIGN §6 UI + keyboard nav + XSS-safe highlight (gap-closure row #3)`.

### Phase P4 — `xai-web-shell` topbar swap + apps/web wire-up

**Scope**

1. Modify `packages/xai-web-shell/src/types.ts`: add `onOpenSearch?: () => void` to `TopbarProps` and `ShellProps`.
2. Modify `packages/xai-web-shell/src/Topbar.tsx`: if `onOpenSearch` is provided, render `<button class="search-box" type="button" onClick={onOpenSearch} aria-label={s("common.search_placeholder")}>` containing the existing icon + label-as-text + kbd span; otherwise render the existing readOnly input (backwards-compat fallback).
3. Modify `packages/xai-web-shell/src/Shell.tsx`: accept + pass `onOpenSearch` through to `<Topbar/>`.
4. Modify `packages/xai-web-shell/src/__tests__/Topbar.test.tsx`: split TP5 into TP5a/TP5b (input fallback / button); add TP7 (button click calls `onOpenSearch`). Net delta: +3 cases.
5. Add `apps/web/package.json` dep `"@repo/xai-web-cmdk": "workspace:*"`.
6. Modify `apps/web/src/App.tsx`: wrap `<Shell/>` in `<CommandPaletteProvider/>`; mount `<CommandPalette/>` as a sibling inside the provider; pass `onOpenSearch = () => commandPaletteOpenFn()` to `<Shell/>` (resolved via the provider's hook).
7. Tests:
   - 46 SHIPPED `xai-web-shell` tests stay green (TP5 split delta only).
   - Add `apps/web/src/__tests__/cmdkIntegration.test.tsx`: Cmd+K opens palette; Esc closes; Enter navigates.

**Acceptance**

- `pnpm --filter @repo/xai-web-shell lint` exits 0.
- `pnpm --filter @repo/xai-web-shell test` exits 0; 46+3 cases pass.
- `pnpm --filter @repo/xai-web-shell typecheck` exits 0.
- `pnpm --filter @repo/web lint` exits 0.
- `pnpm --filter @repo/web typecheck` exits 0.
- `pnpm --filter @repo/web build` exits 0.
- `pnpm --filter @repo/web test` exits 0; integration test passes.
- Manual: `pnpm --filter @repo/web dev` — Cmd+K (mac) opens palette; type "tomato" → see pomodoro hits; Enter jumps to `/app/pomodoro`.
- Commit: `feat(xai-web-shell+apps/web): P4 — topbar input→button + palette mount + apps/web wire-up (gap-closure row #3)`.

### Phase P5 — PLUGIN_MAP row + perf-budget test + cross-vendor verify checklist

**Scope**

1. Update `docs/PLUGIN_MAP.md`:
   - Add a new row under "Web Platform Shims" (the `@repo/xai-web-cmdk` is a shim, not a `plugin-*` business plugin — same section as `xai-web-event-bus` and `xai-web-shell` per the convention at line 133–136).
   - Status `In-Dev` at P5 commit time; flipped to `Stable` at ship.
2. Add `src/__tests__/perfBudget.test.ts` (PB1):
   - Pre-populate `localStorage` with realistic mock state for all 11 keys (5 tasks/bucket × 4 buckets = 20 cards; 10 board cards; 8 dash widgets; 10 pomodoro sessions; 5 habits; 10 countdowns; 12 settings panes; matrix 5/quadrant × 4 = 20; meditation prefs).
   - Call `buildIndex("t", readModuleStates())`.
   - Assert `performance.now()` delta < 50 ms.
   - Run 100 iterations for stability; assert p95 < 50 ms.
3. Write `docs/reviews/xai-web-cmdk-search/20260525-cross-vendor-smoke.md`:
   - Chrome 120 / Safari 17 / Firefox 121 manual checklist (Cmd+K open latency, Esc close, ↑/↓ nav, Enter jump, scrim click close, XSS injected query screenshot).
   - 100 ms open-latency observation (DevTools Performance flame chart).
   - Theme × density × bgTone matrix (4 representative combos).
   - Codex cold-read XSS audit prompt + expected output.
4. Add `apps/web/src/__tests__/csp.test.ts` confirmation that NO new CSP entries were added (in-memory only, no network).

**Acceptance**

- `pnpm --filter @repo/xai-web-cmdk lint` exits 0.
- `pnpm --filter @repo/xai-web-cmdk test` exits 0; all P1..P5 tests pass; PB1 perf budget holds.
- `pnpm --filter @repo/xai-web-cmdk typecheck` exits 0.
- `pnpm --filter @repo/web lint` exits 0.
- `pnpm --filter @repo/web typecheck` exits 0.
- `pnpm --filter @repo/web build` exits 0.
- `pnpm --filter @repo/web test` exits 0.
- Manual cross-vendor checklist queued at `docs/reviews/xai-web-cmdk-search/20260525-cross-vendor-smoke.md` for ship-time human verifier.
- Codex cold-read invoked: confirms no XSS path in highlight rendering.
- Commit: `feat(xai-web-cmdk): P5 — PLUGIN_MAP row + perf-budget test + cross-vendor verify checklist + Codex audit (gap-closure row #3)`.

## Risk register

R1 (adapter drift), R2 (keyboard conflict), R3 (100 ms budget), R4 (XSS), R5 (theme drift), R6 (46 shell tests), R7 (bilingual search), R8 (calendar/statistics adapters). All from discovery review §6; all mitigated in phase plan above.

## Out-of-scope (deferred)

Per discovery review §9. Notable: recent-searches, pinned shortcuts, fuzzy matching, real-time index updates, multi-window Cmd+Enter semantics, non-`/app/*` route support, server-side search, inline previews, voice input.

## Decision rationale recap

Option A wins on HC compliance (HC1–HC10), pattern alignment with row #2,
zero dep churn, trivial 100 ms budget, and clean test isolation. The plan is
5 phases × ~1 commit each = expected delivery in 1–2 build-loop iterations
before verify.
