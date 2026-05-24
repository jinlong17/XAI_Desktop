# Design Snapshot — xai-web-shell

> Decision crystal for the package. The discovery rationale lives in
> `docs/reviews/xai-web-shell/20260523-discovery-review.md`. This file is
> intentionally short — it locks the picked option + frozen assumptions only.

## Selected Option

**Option C — Slot/registry pattern combined with React Router URL navigation**
(Option B + Option C hybrid in the discovery review — single decision, two
mechanisms working together.)

- The shell defines `WebModuleSlotRegistration` (extends `@repo/core/types`
  `WebModuleRouteRegistration` with `icon` + `railOrder` + `i18nKey`).
- The host (`apps/web/src/App.tsx`) populates `<WebShellProvider modules={...}>`
  with an explicit array of registrations. The list is owned by
  `apps/web/src/routes/modules/registrations.tsx` and is the single physical
  source of the rail's contents.
- AppRail iterates `useWebModuleRegistry()` to render its 12 buttons. Click →
  `emitWebEvent("web:shell:module-change", ...)` THEN `navigate("/app/<id>")`.
- Module mount happens via React Router 7 `<AppRouteElement>` (existing seam),
  not via direct import inside the shell.

**Net effect**: `@repo/xai-web-shell` has zero W2 dependencies. W2 rows in
parallel can each edit only their own slot in `registrations.tsx` (one entry
swap from placeholder → real registration) without touching the shell.

## Review Doc Path

`docs/reviews/xai-web-shell/20260523-discovery-review.md`

## Review Date / Version

2026-05-23 · v1 (Foundation W1, last row before W2 fan-out)

## Frozen Assumptions (10)

1. **Package name** — `@repo/xai-web-shell` (matches roadmap row #5 + manifest
   slug). Lives at `packages/xai-web-shell/`.
2. **Public surface (index.ts)** — exports `Shell`, `AppRail`, `Topbar`,
   `AvatarMenu`, `WebShellProvider`, `useWebShell`, `useWebModuleRegistry`,
   type `WebModuleSlotRegistration`. No deep imports allowed (CLAUDE.md §Code
   Boundaries). `internal/` directory is forbidden territory for consumers.
3. **Module mount mechanism** — slot registry + React Router. Registry is a
   React Context with `modules: WebModuleSlotRegistration[]` populated at
   `<WebShellProvider>` mount. Module rendering goes through the existing
   `<AppRouteElement>` in `apps/web/src/routes/RouteGateElements.tsx`.
4. **Root state placement** — the 8 root state pieces (`lang`, `theme`,
   `density`, `fontScale`, `accentHue`, `railPos`, `bgTone`, `petOn`) live in
   `apps/web/src/App.tsx`, NOT inside `@repo/xai-web-shell`. The shell is
   stateless UI; the host owns state. The `module` slot is **derived** from
   `useParams().moduleId` (no separate state).
5. **DOM apply path** — `apps/web/src/App.tsx` `useEffect`s call the `apply*`
   helpers from `@repo/plugin-web-tokens` (`applyTheme`, `applyDensity`,
   `applyFontScale`, `applyAccentHue`, `applyBgTone`, `applyRailPos`). The
   shell package never touches `document.documentElement` directly.
6. **DnD strategy** — native HTML5 (`draggable`, `onDragStart`, `onDragOver`,
   `onDragEnd`). Port `web design/shell.jsx` lines 99-110 as-is. No DnD
   library added.
7. **Persistence flow** — every persisted state piece routes through
   `usePref(key)` from `@repo/plugin-web-storage`. Specifically:
   `usePref("xai_rail_order")` in `AppRail`, and `usePref("xai_rail_pos")` +
   `usePref("xai_accent_hue")` + `usePref("xai_bg_tone")` in
   `apps/web/src/App.tsx`. **Zero** direct `localStorage.*` calls in this row.
8. **Cross-module signaling** — `emitWebEvent` only.
   - `web:shell:module-change` — emitted by AppRail onClick + Topbar Settings
     icon + AvatarMenu Settings/Statistics entries.
   - `web:shell:pet-toggle` — emitted by rail-bottom Pet button.
   - The Pet component itself is row #19's concern; the shell only emits.
9. **Pet rendering out of scope** — for W1 ship, no `<DesktopPet>` mounts. The
   Pet rail button toggles `petOn` (local state) AND emits `web:shell:pet-toggle`.
   Row #19 (xai-web-pet) will later listen to the event and mount the
   component.
10. **Module placeholder coverage** — for W1 ship, all 12 module ids in
    `PREF_REGISTRY.xai_rail_order.default` (tasks/board/dashboard/calendar/
    matrix/pomodoro/habits/meditation/countdown/ai/statistics/settings) PLUS
    `search` get a placeholder route via `ModuleRoutePlaceholderPage` (already
    exists in `apps/web/src/pages/`). Each W2 row replaces only its own slot
    in `registrations.tsx`. The existing `todoWebModuleRegistration` from
    `@repo/plugin-productivity/web` is preserved for backward compatibility
    until row #6 (xai-web-tasks) ships and supersedes it.

## Out of Scope

- `<DesktopPet>` mount and pet sprite rendering (row #19 `xai-web-pet`).
- The actual Settings panel content (rows #21..#24 `xai-web-settings-*`).
- The Search command palette / `⌘K` handler (deferred per DESIGN.md §11; the
  shell renders the input + kbd hint only).
- AI Chat aurora / orb / window.claude.complete adapter (row #18).
- Statistics aggregation (row #20).
- Any business module logic.
- Touch DnD (mouse-only HTML5 DnD for v1 — Safari touch is a future row).
- `xai_pet_on` registry key (row #19's call; v1 uses transient `useState`).

## Dependency Overview

```
@repo/xai-web-shell            (this row)
  ├── @repo/core                (workspace:* — types only: WebModuleId, RailPos, EventMap)
  ├── @repo/plugin-web-tokens   (workspace:* — useI18n; CSS already in apps/web bundle)
  ├── @repo/plugin-web-storage  (workspace:* — usePref + PREF_REGISTRY)
  ├── @repo/xai-web-event-bus   (workspace:* — emitWebEvent, useWebEventListener)
  ├── react                     (peer ^19)
  ├── react-dom                 (peer ^19)
  └── react-router              (peer ^7.15 — for useNavigate / useParams in AppRail / Shell)

apps/web/src/App.tsx           (host integration — new file)
  ├── @repo/xai-web-shell       (Shell, WebShellProvider)
  ├── @repo/plugin-web-tokens   (apply* helpers)
  ├── @repo/plugin-web-storage  (usePref)
  ├── @repo/xai-web-event-bus   (not directly — used inside Shell)
  └── @repo/web-auth-device-session/web  (already present — for AppRouteGate)
```

The package depends on the three W1 SHIPPED packages plus React + React Router.
**Zero W2 plugin dependencies**.

## File Layout

```
packages/xai-web-shell/
├── package.json
├── tsconfig.json
├── manifest.json                       # status: In-Dev
├── README.md                           # one-page surface summary
├── eslint.config.js
├── vitest.config.ts
├── docs/
│   ├── design.md                       # THIS FILE
│   ├── api.md                          # contract details
│   ├── test.md                         # acceptance grid
│   └── dev_log.md                      # workflow state
└── src/
    ├── index.ts                        # ONLY public surface
    ├── types.ts                        # WebModuleSlotRegistration (+ re-exports)
    ├── registry.tsx                    # WebShellProvider + hooks
    ├── Shell.tsx                       # composes AppRail + Topbar + <main slot>
    ├── AppRail.tsx                     # 4 positions, drag-reorder, bottom buttons
    ├── Topbar.tsx                      # search input + EN/中文 + Light/Dark/System + Comfortable/Compact + Settings icon
    ├── AvatarMenu.tsx                  # direction-aware popover
    ├── icons.tsx                       # 8 inline SVG icons (port web design/icons.jsx subset used by shell)
    ├── internal/
    │   ├── dnd.ts                      # drag-reorder reducer helper
    │   └── popoverGeometry.ts          # railPos → popover anchor mapping
    ├── __fixtures__/
    │   └── ShellFixture.tsx            # for tests + storybook
    └── __tests__/
        ├── AppRail.test.tsx
        ├── Topbar.test.tsx
        ├── AvatarMenu.test.tsx
        ├── registry.test.tsx
        ├── Shell.smoke.test.tsx
        └── index-barrel.test.ts
```

`icons.tsx` is included here (not in a separate `plugin-web-icons` package
even though ADR-0007 §S4 reserved that slot) because the shell uses only
~8 of the prototype's icons and adding a separate package for 8 SVGs is
disproportionate. If a future row needs cross-package icons, the row
extracting them will move `icons.tsx` to `@repo/plugin-web-icons` as a
non-breaking refactor (the shell will switch its import path). Recorded
as **planned future refactor** — not a v1 blocker.

## Risk Register (carried forward from discovery review §6)

| ID | Risk | Status |
|---|---|---|
| R1 | feature-review rejects slot-registry as over-engineering | open — discovery §5 + Q1 + fallback documented |
| R2 | `<Outlet/>` breaks existing `AppShellPage` debug usage | mitigated — `AppShellPage` is replaceable scaffolding |
| R3 | Cross-tab `xai_rail_order` write causes flicker | mitigated — `usePref` cross-tab path verified in W1 |
| R4 | AvatarMenu popover regression on `railPos` change | mitigated — CSS data-attr drives direction; test AC-AVM-3 covers |
| R5 | `theme="system"` doesn't react to OS preference change | mitigated — `matchMedia` listener in `App.tsx`; test AC-THEME-2 |
| R6 | Safari HTML5 DnD synthetic-event quirks | accepted with manual verify gate |
| R7 | `useNavigate` unavailable outside Router | mitigated — provider goes INSIDE the route tree |
| R8 | Module re-mount loses local state | accepted — matches prototype `key={module + "_" + lang}` |
| R9 | `DEFAULT_ITEMS` (prototype 11) vs registry default (12) mismatch | mitigated — registry wins; documented in design |

## Acceptance Criteria (links to test.md)

- **AC-BOOT-1..3** — App boots; route `/app` redirects to default module; `<Shell>` renders.
- **AC-RAIL-1..6** — 4 rail positions, drag-reorder, bottom buttons, active highlight, label tooltips, registry-driven items.
- **AC-TOPBAR-1..4** — EN/中文 segment, Light/Dark/System segment, Comfortable/Compact segment, Settings icon emits+navigates.
- **AC-AVM-1..4** — AvatarMenu opens, items navigate, popover direction matches `railPos`, click-outside closes.
- **AC-PET-1..2** — Rail Pet button toggles local state AND emits `web:shell:pet-toggle`.
- **AC-PERSIST-1..4** — `xai_rail_order` / `xai_rail_pos` / `xai_accent_hue` / `xai_bg_tone` survive reload.
- **AC-THEME-1..2** — Theme switch updates `<html data-theme>`; `theme=system` reacts to OS preference change.
- **AC-EMIT-1..3** — `web:shell:module-change` fires on rail click, Topbar Settings, and Avatar→Settings.
- **AC-SLOT-1..3** — Registry populates; AppRail renders the registry's items; unknown ids in `xai_rail_order` are filtered.

Full acceptance grid + test mapping lives in `test.md` §3.
