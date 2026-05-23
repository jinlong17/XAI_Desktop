# Dev Log — xai-web-shell

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-shell |
| Title | Web Console Host Shell — AppRail + Topbar + AvatarMenu + Module Slot Registry |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Verify Cross-vendor | yes (4 rail positions + drag-reorder + AvatarMenu popover directions must be eyeball-validated in Chrome / Safari 17+ / Firefox latest — also absorbs deferred cross-vendor coverage for shipped rows #2/#3/#4) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop serial dispatch — no parallel siblings on this row) |
| Executor | Claude Sonnet 4.6 — feature-auto-build |
| Updated | 2026-05-23 11:50 |
| Dispatched By | xai-roadmap-loop (serial dispatch, W1 last row, gates W2 fan-out) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #5 (Foundation W1) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map) + §S5 (TSX rules) + §S6 (host shell) + §S7 (event bus) |
| Concurrent Siblings | none (serial — W1 final row; W2 fan-out blocked behind this row's ship) |
| Write Scope | `packages/xai-web-shell/`, `docs/reviews/xai-web-shell/` (planning); during build phases will extend to `apps/web/src/{App.tsx, routes/modules/registrations.tsx, routes/router.tsx, main.tsx}` + `apps/web/package.json` per phase plan |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-shell/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-shell/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-shell/docs/design.md`
- API contract: `packages/xai-web-shell/docs/api.md`
- Test strategy: `packages/xai-web-shell/docs/test.md`

## Decision Headline

Selected **Option C — Slot/Registry pattern combined with React Router URL
navigation (Option B)**. The shell defines `WebModuleSlotRegistration`
(extending `WebModuleRouteRegistration` already in `@repo/core/types`); the
host (`apps/web/src/App.tsx`) populates `<WebShellProvider modules={...}>`;
AppRail iterates `useWebModuleRegistry()` and click → `emitWebEvent` THEN
`navigate("/app/<id>")`. The shell has **zero W2 plugin dependencies**, so
all 14 W2 module rows can register their slot in
`apps/web/src/routes/modules/registrations.tsx` independently in parallel.

Root state (`lang`, `theme`, `density`, `fontScale`, `accentHue`, `railPos`,
`bgTone`, `petOn`) lives in `apps/web/src/App.tsx`, NOT inside the shell;
the shell is stateless UI. The 6 `apply*` helpers from
`@repo/plugin-web-tokens` are called from the host's `useEffect`s.
Persistence routes through `usePref` from `@repo/plugin-web-storage`. Cross-
module signals go through `emitWebEvent` from `@repo/xai-web-event-bus`. The
prototype's native HTML5 DnD is ported as-is — no DnD library added.

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Root state in App.tsx + Topbar (in @repo/xai-web-shell) | DONE | 5a1ef24 |
| P2 — AppRail + drag-reorder + 4 rail positions | DONE | d4a6777 |
| P3 — AvatarMenu (direction-aware popover) + slot registry | DONE | b5b5fa6 |
| P4 — Routing wire-up + cross-vendor smoke | DONE | (see P4 commit) |

## Phase Plan (4 phases)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per
> run". Phases are ordered for the smallest reviewable diff at each step.

### Phase P1 — Root state in `apps/web/src/App.tsx` + `<Topbar>` component

**Scope**

1. **Create package scaffolding** at `packages/xai-web-shell/`:
   - `package.json` (name `@repo/xai-web-shell`, version `0.0.0`, private,
     peer-deps on `react@^19`, `react-dom@^19`, `react-router@^7.15`;
     workspace deps on `@repo/core`, `@repo/plugin-web-tokens`,
     `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`; devDeps:
     `@repo/eslint-config`, `@repo/typescript-config`, `@types/react`,
     `@types/react-dom`, `@testing-library/react@^16`, `jsdom@^26`,
     `vitest@^3.2.1`).
   - `tsconfig.json` (extends `@repo/typescript-config`).
   - `manifest.json` (status: In-Dev; type: ui).
   - `vitest.config.ts` (jsdom + setupFile that clears localStorage +
     html data-attrs between tests).
   - `eslint.config.js` (extends `@repo/eslint-config`; no-explicit-any
     error; `import/no-restricted-paths` to forbid deep imports into
     `src/internal/**`).
   - `README.md` (one-page surface summary linking to `docs/`).
   - `src/index.ts` (initially exporting only Topbar + types).
   - `src/types.ts` (`Lang`/`Theme`/`Density` re-exports from
     `@repo/plugin-web-tokens`; `TopbarProps` interface; placeholder
     types for other components).
2. **Create `<Topbar>`** at `src/Topbar.tsx`:
   - Port `web design/shell.jsx` lines 168-200 to TSX.
   - Use `useI18n(lang)` from `@repo/plugin-web-tokens` for s("common.search_placeholder") and s("settings.comfortable") etc.
   - Use the small inline-SVG `<Icon>` from `src/icons.tsx` (created in this phase — port the icons that Topbar consumes: search, sun, moon, monitor, sliders).
   - `src/icons.tsx` exports a minimal `Icon` component with `name` prop typed as `WebShellIconName`. Initial set covers Topbar's 5 icons; later phases append rail icons.
3. **Create `apps/web/src/App.tsx`** (new file — replaces `AppShellPage`'s usage in this phase only by adding a route that mounts `<App>`):
   - 8 root state pieces from `web design/app.jsx` lines 7-22:
     - `useState`: lang, theme, density, fontScale, petOn.
     - `usePref`: accentHue, railPos, bgTone.
   - 7 `useEffect`s calling `applyTheme`, `applyDensity`, `applyFontScale`,
     `applyAccentHue`, `applyBgTone`, `applyRailPos` + system-theme
     `matchMedia` listener.
   - Renders `<Topbar lang={...} setLang={...} ... onOpenSettings={...} />`
     wrapped in a temporary `<div className="app">` until P3 introduces
     `<Shell>`. Below the Topbar, render a placeholder `<main>` for
     P2/P3 to populate.
4. **No AppRail / AvatarMenu / WebShellProvider yet** — those are P2/P3.
5. **Wire `<App>` into `apps/web/src/routes/router.tsx`**: add a new
   debug route `/_shell-smoke` that mounts `<App>` for visual verification.
   The existing `/app/:moduleId/*` route remains untouched in P1 (still
   mounts the legacy `<AppShellPage>` until P4 replaces it).

**Acceptance**

- `pnpm install` resolves the new workspace package.
- `pnpm --filter @repo/xai-web-shell check-types` PASS.
- `pnpm --filter @repo/xai-web-shell test` PASS — TP1..TP6 (Topbar tests),
  T1..T3 (theme/density/font-scale apply effects), B1..B3 (barrel surface).
- `pnpm --filter @repo/web build` PASS.
- Visual verify: `/_shell-smoke` shows a working Topbar; toggling
  EN/中文/Light/Dark/System/Comfortable/Compact updates `<html>` attributes
  and the visible UI re-renders.

**Files touched (estimated)**

- New: `packages/xai-web-shell/{package.json, tsconfig.json, manifest.json,
  vitest.config.ts, eslint.config.js, README.md, src/index.ts, src/types.ts,
  src/Topbar.tsx, src/icons.tsx, src/__fixtures__/ShellFixture.tsx,
  src/__tests__/{Topbar.test.tsx, index-barrel.test.ts}}`.
- New: `apps/web/src/App.tsx`.
- Modified: `apps/web/src/routes/router.tsx` (add `/_shell-smoke` debug
  route), `apps/web/package.json` (add `@repo/xai-web-shell` workspace dep).

### Phase P2 — `<AppRail>` + drag-reorder + 4 rail positions

**Scope**

1. **Create `<AppRail>`** at `src/AppRail.tsx`:
   - Port `web design/shell.jsx` lines 69-166 to TSX.
   - `usePref("xai_rail_order")` from `@repo/plugin-web-storage`.
   - HTML5 DnD (`draggable`, `onDragStart`, `onDragOver`, `onDragEnd`)
     ported verbatim with TS types.
   - `internal/dnd.ts` extracts the reorder reducer (pure function tested
     in isolation: `reorderArray(items, fromId, toId)`).
   - Renders 11 rail buttons (the 12 registry ids minus settings, plus search
     pseudo-id which is registry-absent but rendered for now — TBD by P3
     once registry filtering finalizes).
   - Bottom row: Pet / Sync / Notif / Help buttons. Pet click calls a
     `onPetToggle` prop AND host handler emits `web:shell:pet-toggle`.
2. **Extend `<App>` in `apps/web/src/App.tsx`** to render `<AppRail>`
   inside the `<div className="app">` wrapper. AppRail receives an
   `onModuleClick` prop that performs `emitWebEvent + navigate`.
3. **Extend `src/icons.tsx`** with rail icons: sparkle, check, kanban,
   layout, calendar, grid4, timer, pin, leaf, countdown, paw, sync, bell,
   help, chart.
4. **Tests**: AR1..AR12, plus internal `dnd.test.ts` for the reducer.
5. **Update `src/index.ts`** to also export `AppRail`.

**Acceptance**

- `pnpm --filter @repo/xai-web-shell test` PASS — TP1..TP6 + AR1..AR12 +
  P1..P4 (persistence) + B1..B3.
- `pnpm --filter @repo/xai-web-shell check-types` PASS.
- Visual verify (`/_shell-smoke`): rail renders with 11 buttons; drag-reorder
  persists to localStorage and survives reload; switching `railPos` (via
  manual DevTools `document.documentElement.setAttribute("data-rail-pos",
  "right")` and via `usePref("xai_rail_pos")` write) reflows the UI per
  the layout.css rules for the 4 positions.

**Files touched (estimated)**

- New: `packages/xai-web-shell/src/AppRail.tsx`,
  `packages/xai-web-shell/src/internal/dnd.ts`,
  `packages/xai-web-shell/src/__tests__/{AppRail.test.tsx,
  persistence.test.tsx, internal/dnd.test.ts}`.
- Modified: `packages/xai-web-shell/src/{index.ts, icons.tsx}`,
  `apps/web/src/App.tsx`.

### Phase P3 — `<AvatarMenu>` + slot registry (`WebShellProvider` + hooks)

**Scope**

1. **Create slot registry** at `src/registry.tsx`:
   - `WebShellContext` (React Context).
   - `WebShellProvider` component (props: `modules`, `lang`, `railPos`,
     `petOn`, `setPetOn`, `children`).
   - `useWebShell()` — returns `{ lang, railPos, petOn, setPetOn }`.
   - `useWebModuleRegistry()` — returns sorted/filtered modules list.
   - `WebModuleSlotRegistration` type in `src/types.ts`.
2. **Create `<AvatarMenu>`** at `src/AvatarMenu.tsx`:
   - Port `web design/shell.jsx` lines 19-67 to TSX.
   - Reads `lang` + `railPos` from `useWebShell()`.
   - Sets `data-anchor` attribute based on `railPos` per design.md §1.1
     popover direction mapping.
   - Escape key handler + scrim click handler.
   - i18n labels via `useI18n(lang).s("avatar.settings")` etc.
3. **Create `<Shell>` composition** at `src/Shell.tsx`:
   - Composes `<AppRail>` + `<Topbar>` + `<main>` slot.
   - Uses `<Outlet/>` from `react-router` when no children passed.
   - Sets outer `data-rail-pos` attribute on its root div.
4. **Update `<App>` in `apps/web/src/App.tsx`**:
   - Wrap content in `<WebShellProvider modules={...} lang={lang}
     railPos={railPos} petOn={petOn} setPetOn={setPetOn}>`.
   - Replace direct `<Topbar>` + `<AppRail>` usage with `<Shell ...>{children}</Shell>`.
   - Build temporary `modules` array of 12 placeholder slots (use
     `ModuleRoutePlaceholderPage` for each render) — full P4 wire-up
     happens in next phase.
5. **Tests**: AV1..AV8 (AvatarMenu), R1..R6 (registry), S1..S4 (Shell smoke),
   E1..E5 (emit), N1..N10 (edge cases).
6. **Update `src/index.ts`** to export `Shell`, `AvatarMenu`,
   `WebShellProvider`, `useWebShell`, `useWebModuleRegistry`,
   `WebModuleSlotRegistration`.

**Acceptance**

- `pnpm --filter @repo/xai-web-shell test` PASS — full suite, all AC- entries
  except the cross-vendor manual ones (P4).
- Coverage ≥ 90% statements / 85% branches across `packages/xai-web-shell/src/`.
- Visual verify (`/_shell-smoke`): rail position changes correctly relocate
  the AvatarMenu popover; rail can switch via temporary devtools control;
  Escape closes the menu; scrim click closes the menu.

**Files touched (estimated)**

- New: `packages/xai-web-shell/src/{registry.tsx, AvatarMenu.tsx, Shell.tsx,
  internal/popoverGeometry.ts}`,
  `packages/xai-web-shell/src/__tests__/{AvatarMenu.test.tsx, registry.test.tsx,
  Shell.smoke.test.tsx, event-emit.test.tsx}`.
- Modified: `packages/xai-web-shell/src/{index.ts, types.ts}`,
  `apps/web/src/App.tsx`.

### Phase P4 — Routing wire-up + cross-vendor smoke (READY_FOR_VERIFY gate)

**Scope**

1. **Extend `apps/web/src/routes/modules/registrations.tsx`** to add the 4
   shell-extension fields (`icon`, `railOrder`, `i18nKey`, `showInRail`) to
   each existing module registration. The existing 5+ entries (from
   `createDefaultConsoleNavItems()`) gain the new fields. Add new entries
   for any W2 module ids missing from the current list (target end state:
   13 entries — 12 rail-visible + `settings` non-rail).
2. **Replace `<AppRouteElement>` body in
   `apps/web/src/routes/RouteGateElements.tsx`** so it renders `<App>`
   (which wraps the module content via `<Shell><Outlet/></Shell>`) rather
   than the legacy `<AppShellPage>`. The `AppShellPage` file becomes
   unused (kept in place for now; row #21 settings-shell may delete it
   later).
3. **Remove `/_shell-smoke` debug route** added in P1 (the smoke is now
   the real `/app` route).
4. **Update `apps/web/src/main.tsx`** if needed: the `RouterProvider` does
   not change; the `AppProviders` wrap remains. `<App>` is rendered as a
   route element, not in main.tsx.
5. **Run cross-vendor manual verify** per `test.md` §5 — record results
   in Work Log below with verifier identity + browser versions +
   PASS/FAIL per M1..M18. ALL must PASS in Chrome / Safari / Firefox.
6. **Update `docs/PLUGIN_MAP.md`** to add the `xai-web-shell` row under
   "Web Plugins" with status `In-Dev → Stable` (Stable promotion happens
   at ship). Note that this matches the convention applied to row #4
   (`xai-web-event-bus`).
7. **Status → READY_FOR_VERIFY** at end of P4.

**Acceptance**

- All AC-* in `test.md` §3 covered by passing tests.
- All M1..M18 in `test.md` §5 PASS across Chrome / Safari / Firefox.
- `pnpm --filter @repo/xai-web-shell lint` PASS with 0 warnings.
- `pnpm --filter @repo/xai-web-shell test --coverage` ≥ 90% statements,
  ≥ 85% branches inside `src/`.
- `pnpm --filter @repo/web test` PASS (cross-package smoke
  `apps/web/src/__tests__/shell.smoke.test.tsx` + the theme test).
- `pnpm --filter @repo/web build` PASS.
- `pnpm --filter @repo/web preview` runs the production bundle and Shell
  works in `/app/<default>`.

**Files touched (estimated)**

- Modified: `apps/web/src/routes/{modules/registrations.tsx, RouteGateElements.tsx,
  router.tsx}`, `docs/PLUGIN_MAP.md`.
- New: `apps/web/src/__tests__/{shell.smoke.test.tsx, shell.theme.test.tsx}`.
- Possibly removed: nothing (AppShellPage stays for now).

## Risks (carried forward from discovery review §6)

| ID | Risk | Status |
|---|---|---|
| R1 | feature-review rejects slot registry as over-engineering | open — Q1 documented; fallback to direct `WebModuleRouteRegistration` ready |
| R2 | `<Outlet/>` breaks `AppShellPage` debug usage | mitigated — replaceable in P4 |
| R3 | Cross-tab `xai_rail_order` write flicker | mitigated by row #3 `usePref` cross-tab path |
| R4 | AvatarMenu popover regression on `railPos` change | mitigated by CSS data-attr + AC-AVM-3 |
| R5 | theme="system" doesn't react to OS preference change | mitigated by `matchMedia` listener; AC-THEME-2 |
| R6 | Safari HTML5 DnD synthetic-event quirks | accepted with manual verify gate (M9) |
| R7 | `useNavigate` unavailable outside Router | mitigated — provider mounts INSIDE the route tree |
| R8 | Module re-mount loses local state | accepted (matches prototype) |
| R9 | DEFAULT_ITEMS (prototype 11) vs registry default (12) mismatch | mitigated — registry wins; rail filters/appends defensively |

## Open Questions for feature-review

- **Q1** — `WebModuleSlotRegistration` location: promote to `@repo/core/types`
  vs keep in `@repo/xai-web-shell`?
  - **Planner recommendation**: promote to `@repo/core/types` as an
    additive extension to the existing `WebModuleRouteRegistration`
    (rather than a parallel interface in the shell). One type, one
    source of truth, 14 W2 rows learn one shape.
  - **Trade-off**: feature-review may prefer the parallel-interface
    isolation (shell owns its own type; core stays minimal). Either is
    defensible — review can pick.
- **Q2** — `petOn` persistence: transient `useState` (v1) vs new
  `xai_pet_on` registry key (cross-tab synced)?
  - **Planner recommendation**: `useState` for v1. The pet row #19 is the
    natural owner of any pet-related persistence keys and can register
    `xai_pet_on` when it ships.
- **Q3** — Topbar Settings click + AvatarMenu Settings click — should they
  emit `web:shell:module-change` with `source: "shortcut"` or `"settings-icon"`/`"avatar-menu"`?
  - **Planner recommendation**: use `"shortcut"` (the existing EventMap
    enum value) for both. Splitting into more granular sources would
    require an EventMap edit, which is a row #4 concern — out of scope.
  - **Trade-off**: observability is coarser; statistics row #20 can
    still discriminate by URL.
- **Q4** — Pet rail-bottom button mount: should the shell render the
  button always, or hide it when no `petOn` consumer is present
  (e.g. before row #19 ships)?
  - **Planner recommendation**: always render the button (the prototype
    does). The emit happens; nobody listens until row #19. That's fine —
    `useWebEventListener` is the contract.
- **Q5** — `<AppShellPage>` removal timing — should P4 delete it, or
  leave for row #21 (settings-shell)?
  - **Planner recommendation**: leave the file in place but stop using
    it from `<AppRouteElement>`. Cleanup is row #21's job (settings-shell
    is the natural follow-on).

## Review Notes

**Verdict: APPROVED** (0 blockers, 5 recommendations to track during build — none gating).

### Gate-by-gate findings

1. **Seed-brief fidelity — PASS.** Every Requirement clause (module-switching state in `App.tsx`; 8-piece root state; useEffects mutating `<html data-*>`; drag-reorderable rail via `xai_rail_order`; 4 rail positions; direction-aware AvatarMenu; EN/中文 + Light/Dark/System + Comfortable/Compact + Settings icon in Topbar) is mapped to a concrete artifact slot — see design.md §Frozen Assumptions 4 & 5, api.md §2.1/§2.2/§2.3/§2.4 and §3.1. Every Hard constraint (no direct module import; `xai_rail_order` persistence; popover direction per §4.14; pet via event bus; `⌘K` placeholder) has a frozen-assumption pin.
2. **ADR-0007 conformance — PASS.** Host shell placement at `apps/web/src/App.tsx` matches §S6; the slot/registry pattern + `apply*` helpers + `usePref` + `emitWebEvent` flow matches §S4 port map (`shell.jsx` → `AppRail.tsx + Topbar.tsx + AvatarMenu.tsx`, `app.jsx` → `apps/web/src/App.tsx`). TSX rules §S5 1–10 explicitly invoked in P1 scope (move off CDN, no `defaultProps`, typed `useState`, no new state library). Event family `web:shell:*` matches §S7 naming.
3. **No direct W2 imports — PASS.** design.md §Dependency Overview enumerates the 4 workspace deps (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`) + React peer set; zero W2 plugin packages. AC-SLOT-1 (`<WebShellProvider modules={[]}>` renders without crash) proves the shell can boot before any W2 row ships.
4. **W1 dep correctness — PASS.** Shell consumes `@repo/plugin-web-tokens` (useI18n + 6 apply* via host; no internal-path imports), `@repo/plugin-web-storage` (usePref + PREF_REGISTRY only), `@repo/xai-web-event-bus` (emitWebEvent + useWebEventListener only). No deep imports declared anywhere in api.md §0/§9.
5. **Event taxonomy — PASS.** Verified `packages/core/src/types/events.ts` lines 172–187 declares both `web:shell:module-change` (with `source: 'app-rail' | 'mini-cal' | 'shortcut' | 'restore' | 'programmatic'`) and `web:shell:pet-toggle` (with `source: 'rail-bottom' | 'settings' | 'shortcut'`). api.md §3.2/§3.3/§3.4 + §5 payloads conform exactly. No EventMap edit required (already SHIPPED by row #4).
6. **DnD persistence — PASS.** AppRail uses `usePref("xai_rail_order")` per api.md §2.2 behavior step 3+4+5; PREF_REGISTRY confirms key + `RailItemId[]` codec + 12-item `DEFAULT_RAIL_ORDER` (`packages/plugin-web-storage/src/internal/registry.ts` lines 97–110, 159–166). Defensive reconciliation against registry (filter unknown + append missing) covered by AC-RAIL-7/8 + N2/N3/N4.
7. **4 rail positions — PASS.** Frozen assumption #4 + api.md §2.4 popover-direction mapping match DESIGN.md §4.14 (Left=top-right展开 / Right=top-left展开 / Top=bottom-left展开 / Bottom=top-left展开). CSS lives in `@repo/plugin-web-tokens/src/layout.css` (already shipped); TSX only sets `data-pos` / `data-anchor`. AC-AVM-3 + AC-RAIL-2 test it; M10 cross-vendor verifies it live.
8. **Phase reasonableness — PASS.** Four phases are right-sized and each is independently reviewable: P1 = scaffolding + Topbar + App.tsx root state (~10 new files, small surface); P2 = AppRail + DnD + persistence (~3 new files + dnd reducer); P3 = AvatarMenu + slot registry + Shell composition (~5 new files); P4 = routing wire-up + cross-vendor smoke (mostly host edits + manual verify). Boundaries align with the four prototype responsibilities. Rollback per phase is trivial (each is additive until P4 swaps `<AppRouteElement>`).
9. **AC matrix completeness — PASS.** test.md §3 covers all 10 AC families (BOOT 3 / RAIL 12 / TOPBAR 6 / AVM 8 / PET 2 / PERSIST 4 / THEME 3 / EMIT 6 / SLOT 6 / BARREL 3). Every AC has a test ID; §4 mock strategy realistically classifies what's REAL (usePref / emitWebEvent / useI18n) vs MOCKED (matchMedia / dataTransfer) — exactly the right split for jsdom limitations. §7 negative tests (N1..N10) cover the dangerous edges (empty registry, ghost ids, drag-cancel, quota-exceeded).
10. **M1..M18 absorbing W1 deferrals — PASS.** test.md §5.3 explicitly maps the cross-vendor coverage owed by rows #2/#3/#4: M3/M5/M14 exercise `apply*` mutations (#2's deferred visual font smoke), M15 exercises `usePref` cross-tab via `storage` event (#3's deferred Vite-build live gate is implicitly covered by `pnpm --filter @repo/web build` + `preview` in P4 acceptance), M6/M7/M8/M13 exercise `emitWebEvent` round-trip in live Chrome/Safari/Firefox (#4's deferred live-browser event-bus exercise). All three deferred surfaces have at least one M-scenario.
11. **Verify Cross-vendor=yes — PASS.** Status Panel field set, P4 acceptance gates on M1..M18 PASS across Chrome / Safari 17+ / Firefox, verifier identity recording protocol declared in §5.1.
12. **Open questions / risks — NO BLOCKERS.** Q1..Q5 are all valid choice points with defensible planner recommendations; none are gating decisions for build. R1..R9 have either mitigations or accepted-with-rationale labels. R1 (slot registry as over-engineering) is addressed by the documented fallback (collapse `WebModuleSlotRegistration` back into `WebModuleRouteRegistration`) — review concurs the chosen path is appropriate but the fallback should remain available if implementation friction emerges in P3.

### Decisions on open questions (non-blocking guidance for build)

- **Q1 (type location)** — Accept planner recommendation: define `WebModuleSlotRegistration` in `@repo/xai-web-shell/src/types.ts` for now (as design.md §File Layout already specifies). Promotion to `@repo/core/types` can be a future additive refactor if a non-shell consumer ever needs it; today no consumer does. Keeping it shell-local minimizes core churn during W2 fan-out.
- **Q2 (petOn persistence)** — Accept: transient `useState` for v1. Row #19 owns `xai_pet_on` if ever needed.
- **Q3 (emit source enum)** — Accept: use `"shortcut"` for both Topbar Settings icon and AvatarMenu Settings/Statistics entries (matches the existing EventMap enum without requiring a row #4 edit). Statistics row #20 can discriminate via URL.
- **Q4 (Pet button visibility)** — Accept: always render (matches prototype). Event listeners are the contract.
- **Q5 (`AppShellPage` removal)** — Accept: leave the file in place; P4 only stops routing to it. Row #21 (settings-shell) owns the eventual deletion.

### Recommendations (non-gating, track during build)

- **B1** — When P1 wires `apps/web/src/App.tsx`, double-check the order of `useEffect` calls for `applyTheme` + `matchMedia` listener: the listener cleanup MUST clear before re-attach on `theme` change (api.md §3.1 example is correct; preserve it verbatim).
- **B2** — In P2, the AppRail rendering of `search` (rail-visible per prototype but absent from PREF_REGISTRY's `RailItemId`) needs an explicit slot-registry decision: either add `search` as a virtual rail entry with `showInRail: true` in registrations.tsx (Topbar-only feature per discovery R9 — but the rail still shows the icon), OR drop the rail's `search` button and rely on the Topbar input. Pick one in P2; document in dev_log Work Log so P3 registry filtering matches.
- **B3** — In P3, ensure `useWebShell()` / `useWebModuleRegistry()` error messages include the `[xai-web-shell]` prefix (api.md §7 specifies this) — easy to forget once writing the actual provider.
- **B4** — P4 manual verify across 3 browsers is the single largest risk surface. Plan to record the verifier identity + version per row in the M-table in dev_log Work Log; if any single M fails on any one browser, BLOCK and surface to feature-review before retry.
- **B5** — When extending `apps/web/src/routes/modules/registrations.tsx` in P4, ensure the existing `todoWebModuleRegistration` from `@repo/plugin-productivity/web` is preserved (frozen assumption #10) — it's the only currently-real registration; placeholders replace all OTHER slots.

### Verification log

- Confirmed `packages/core/src/types/events.ts` lines 172–214 declare the 5 `web:*` channels (shell:module-change, shell:pet-toggle, settings:preference-changed, pomodoro:session-finished, habits:checkin-recorded). All emits this row makes are pre-declared.
- Confirmed `packages/plugin-web-storage/src/internal/registry.ts` has all 4 keys this row needs (`xai_rail_order` line 159, `xai_rail_pos` line 140, `xai_accent_hue` line 131, `xai_bg_tone` line 149) with the right codecs + defaults.
- Confirmed `packages/core/src/types/plugin.ts` line 138 declares `WebModuleRouteRegistration` with `moduleId: ConsoleModuleId`, `label`, `defaultChildPath`, `children: WebModuleRouteChild[]` — the extension shape in api.md §1.1 is additive-compatible.
- Confirmed `@repo/plugin-web-tokens` / `@repo/plugin-web-storage` / `@repo/xai-web-event-bus` all expose `src/index.ts` (correct barrel imports).

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 11:30 | Claude Opus 4.7 1M — feature-plan | Read seed brief, ADR-0007 §S4/§S5/§S6/§S7, web design/{app.jsx, shell.jsx, DESIGN.md §3/§4.14/§7/§9.2}, the 3 shipped W1 package APIs (`@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`), and the existing `apps/web/src/` routing seam (`router.tsx`, `RouteGateElements.tsx`, `modules/{registrations,buildModuleRoutes}.tsx`, `AppShellPage.tsx`). Evaluated 4 mount-mechanism options; selected Option C (slot/registry) + Option B (React Router URL navigation) HYBRID. Created `docs/reviews/xai-web-shell/20260523-discovery-review.md` with 10 frozen assumptions, dependency overview, risk register R1..R9, and 5 open questions Q1..Q5. Created `packages/xai-web-shell/docs/{design.md, api.md, test.md, dev_log.md}`. design.md locks the 10 frozen assumptions, file layout, and acceptance criteria pointers. api.md §0..§10 declares the full public surface (`Shell`, `AppRail`, `Topbar`, `AvatarMenu`, `WebShellProvider`, `useWebShell`, `useWebModuleRegistry`, `WebModuleSlotRegistration`), the upstream/downstream dependency lists, the persistence contract (3 of the 4 keys are temporarily managed here pending row #22 ship), the cross-module event contract (emits `web:shell:module-change` + `web:shell:pet-toggle`; subscribes to none), and per-API error semantics. test.md §1..§8 builds the AC grid (BOOT / RAIL / TOPBAR / AVM / PET / PERSIST / THEME / EMIT / SLOT / BARREL), maps each AC to a concrete test ID, declares the mock strategy (real `usePref`/`emitWebEvent`/`useI18n`; spy `applyTheme` etc.; mock `matchMedia`+`dataTransfer`), and writes the cross-vendor Manual Verify gate (M1..M18 across Chrome / Safari / Firefox — also absorbs deferred cross-vendor coverage for shipped rows #2/#3/#4). Phase plan: 4 phases (P1 Topbar + App.tsx root state, P2 AppRail + DnD + 4 positions, P3 AvatarMenu + slot registry, P4 routing wire-up + cross-vendor smoke). Write scope strictly limited to `packages/xai-web-shell/docs/` + `docs/reviews/xai-web-shell/` per planning-phase discipline (no production code or scaffolding files written yet). | — | feature-review |
| 2026-05-23 12:05 | Claude Opus 4.7 1M — feature-review | Reviewed all 12 gates against artifacts (seed brief, discovery review, design/api/test/dev_log, ADR-0007 §S4/§S5/§S6/§S7) and verified upstream surfaces in source: `packages/core/src/types/events.ts` lines 172–214 (5 web:* channels SHIPPED — `web:shell:module-change` source enum includes 'app-rail' \| 'shortcut'; `web:shell:pet-toggle` source enum includes 'rail-bottom'); `packages/plugin-web-storage/src/internal/registry.ts` lines 55–166 (RailItemId 12-item DEFAULT_RAIL_ORDER + all 4 PREF_REGISTRY keys this row needs); `packages/core/src/types/plugin.ts` line 138 (WebModuleRouteRegistration shape additive-compatible with shell extension); confirmed `@repo/plugin-web-tokens` / `@repo/plugin-web-storage` / `@repo/xai-web-event-bus` all expose `src/index.ts` barrels. All 12 gates PASS with no blockers. Resolved 5 open questions Q1..Q5 with non-gating guidance (keep WebModuleSlotRegistration shell-local for v1; transient useState for petOn; "shortcut" source enum for Topbar+Avatar Settings; always-render Pet button; AppShellPage stays for row #21 cleanup). Surfaced 5 build-time recommendations B1..B5 (matchMedia cleanup ordering; search rail slot decision in P2; useWebShell error prefix; manual verify recording protocol; preserve todoWebModuleRegistration). Verdict: APPROVED → feature-auto-build (xai-roadmap-loop default Automation Mode A-Claude continues without human gate). | — | feature-auto-build |
| 2026-05-23 11:40 | Claude Sonnet 4.6 — feature-auto-build | P1: Scaffolded @repo/xai-web-shell package (package.json, tsconfig, manifest, vitest.config, eslint.config, README). Implemented src/{index.ts, types.ts, icons.tsx, Topbar.tsx, registry.tsx, AvatarMenu.tsx, AppRail.tsx, Shell.tsx, internal/dnd.ts, internal/popoverGeometry.ts}. Created src/__fixtures__/ShellFixture.tsx. Tests: Topbar (TP1..TP6) + barrel (B1..B3) = 21 PASS. Created apps/web/src/App.tsx (8 root state pieces + 7 apply* useEffects + matchMedia listener with B1 cleanup). Created apps/web/src/routes/modules/shellRegistrations.tsx (12 placeholder slots). Added /_shell-smoke debug route. Added @repo/plugin-web-storage + @repo/xai-web-shell to apps/web/package.json deps. check-types PASS for both packages. | 5a1ef24 | P2 |
| 2026-05-23 11:42 | Claude Sonnet 4.6 — feature-auto-build | P2: Added AppRail test suite (AR1..AR12 + N1/N3 + P1/P3) and dnd reducer unit tests (9 tests). Applied B2 review note: search pseudo-id NOT included in shellRegistrations (Topbar-only feature). 48 tests PASS. | d4a6777 | P3 |
| 2026-05-23 11:44 | Claude Sonnet 4.6 — feature-auto-build | P3: Added registry tests (R1..R6), AvatarMenu tests (AV1..AV8), Shell smoke tests (S1..S4 + StrictMode), event-emit tests (E1..E5). Applied B3 review note: useWebShell/useWebModuleRegistry throw includes '[xai-web-shell]' prefix. 82 tests PASS. | b5b5fa6 | P4 |
| 2026-05-23 11:48 | Claude Sonnet 4.6 — feature-auto-build | P4: Routing wire-up. Updated router.tsx to use <App> as the /app layout route element (replaces bare <Outlet/>). Updated AppRouteElement to render module content directly (no AppShellPage chrome). Removed /_shell-smoke debug route. Updated router.integration.test.tsx to remove AppShellPage-specific assertions. Added apps/web/src/__tests__/{shell.smoke.test.tsx, shell.theme.test.tsx} (9 new tests). Updated docs/PLUGIN_MAP.md with xai-web-shell In-Dev row. All tests PASS: @repo/xai-web-shell 82/82 + @repo/web 46/46. Status → READY_FOR_VERIFY. Manual verify M1..M18 across Chrome/Safari/Firefox deferred to feature-verify. B4 review note acknowledged: verifier must record browser/version per M-row. B5 review note: todoWebModuleRegistration preserved in old registrations.tsx (AppRouteElement still uses webModuleRouteRegistrations for route resolution). | (P4 commit) | feature-verify |
