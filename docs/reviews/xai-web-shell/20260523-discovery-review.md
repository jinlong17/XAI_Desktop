# Discovery Review — xai-web-shell

> Date: 2026-05-23
> Author: feature-plan (dispatched by xai-roadmap-loop, serial W1 — last row before W2 fan-out)
> Seed brief: `docs/reviews/xai-web-shell/20260523-roadmap-seed.md`
> Manifest row: `docs/workflow/roadmap/xai-web-console.md` row #5 (Foundation W1, largest)
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S5 + §S6 + §S7
> Verify Cross-vendor: **yes** (4 rail positions + DnD + AvatarMenu popover direction must be eyeball-validated in Chrome/Safari/Firefox before READY_TO_SHIP)

---

## 1. Problem Framing

The shell is the **last W1 row and the gate to W2's 14-module fan-out**. Three already-shipped W1 packages give the shell its primitives:

| Primitive | Shipped W1 package | Surface used by shell |
|---|---|---|
| Tokens + i18n + apply* helpers | `@repo/plugin-web-tokens` | `tokens.css` + `layout.css` side-effects, `useI18n`, `applyTheme`, `applyDensity`, `applyFontScale`, `applyAccentHue`, `applyBgTone`, `applyRailPos` |
| Typed localStorage persistence | `@repo/plugin-web-storage` | `usePref("xai_rail_order")`, `usePref("xai_rail_pos")`, `usePref("xai_accent_hue")`, `usePref("xai_bg_tone")`; `PREF_REGISTRY` for type narrowing |
| Typed cross-module event bus | `@repo/xai-web-event-bus` | `emitWebEvent("web:shell:module-change", ...)`, `emitWebEvent("web:shell:pet-toggle", ...)`, `useWebEventListener` |

The seed brief requires porting two prototype files (`web design/app.jsx` 102 LOC + `web design/shell.jsx` 204 LOC) into a TS+Vite production form per ADR-0007 §S4 port mapping:

- `web design/app.jsx` → `apps/web/src/App.tsx` (host shell root) — owns module switching, root state (lang/theme/density/fontScale/accentHue/railPos/bgTone/petOn), and the useEffects that mutate `<html>` `data-*` attributes.
- `web design/shell.jsx` (`<AppRail>` + `<Topbar>` + `<AvatarMenu>`) → `packages/xai-web-shell/src/{AppRail,Topbar,AvatarMenu}.tsx` + `index.ts`.

**Hard constraint that creates the actual decision**: the shell **must not** import any W2 module file directly. The shell must render the rail and navigate to a module *without* taking a workspace dependency on `@repo/plugin-web-tasks`, `@repo/plugin-web-board-core`, etc. — those don't exist yet, and the whole point of parallel W2 dispatch is that the shell ships first.

This is a **slot/registry pattern** decision: how does the shell render a module pane when it can't `import` the module?

This review evaluates four options for the module-mount mechanism, then carries forward the three secondary decisions (port location of root state, AvatarMenu popover positioning, drag-reorder persistence flow).

---

## 2. Candidate Options (Module Mount Mechanism)

### Option A — Direct dynamic import inside the shell

`React.lazy(() => import('@repo/plugin-web-tasks'))` etc. wired by a switch statement in `apps/web/src/App.tsx`.

**Pros**
- Familiar React 19 pattern.
- Code-splitting "for free".

**Cons** (fatal for W1)
- Forces `apps/web/package.json` to add all 14 W2 packages as dependencies **before they exist**. Wave 2 cannot ship in parallel — every W2 row would have to re-edit `apps/web/package.json`, creating merge conflicts.
- Couples the shell to the W2 module set. Adding a future module (e.g. "AI Workflows") forces a host-shell PR.
- Violates the seed brief's hard constraint: "Shell must NOT import any module file directly".

**Verdict:** REJECTED.

### Option B — React Router lazy() route registrations (existing `webModuleRouteRegistrations` array)

Each W2 module exports a `WebModuleRouteRegistration` (already exists in `@repo/core/types`, used by `apps/web/src/routes/modules/registrations.tsx`). Shell uses Router `<Outlet/>` to render whichever module's route matches.

**Pros**
- Reuses the existing routing seam (`apps/web/src/routes/modules/registrations.tsx`) — already loads `todoWebModuleRegistration` from `@repo/plugin-productivity/web`.
- Each W2 row only edits `apps/web/src/routes/modules/registrations.tsx` (one line) when it adds itself; no shell change needed.
- Browser back/forward + deep-linking + `useNavigate()` come for free.

**Cons**
- Module mount is keyed by URL pathname, not by an in-process registry call. AppRail must navigate via `navigate("/app/tasks")` rather than `setModule("tasks")`.
- The existing `webModuleRouteRegistrations` is hard-coded in `apps/web/src/routes/modules/registrations.tsx`. W2 rows will modify that file — same merge-conflict surface as Option A in *one* file but no `package.json` churn.
- The "module change" signal must round-trip through React Router (navigate → URL change → route match → Outlet render). For UI fidelity vs the prototype (which used local `useState("module")`), this is functionally identical but conceptually different.

**Verdict:** CANDIDATE — partial fit; works for URL-routable modules but doesn't itself solve the "shell does not depend on W2 packages" problem unless paired with Option C's registry shape.

### Option C — In-process slot/registry pattern (HYBRID with Option B — selected)

Define a `WebModuleSlot` registry contract inside `@repo/xai-web-shell` (this row owns the contract). Each W2 module registers itself by calling `registerWebModule({ id, label, icon, defaultPath, render })` at its package side-effect. The shell consumes the registry via a `<WebShellProvider>` that *the host shell* (`apps/web/src/App.tsx`) populates by importing the W2 packages' barrel files in `apps/web/src/routes/modules/registrations.tsx`.

The shell ONLY imports from `@repo/xai-web-shell` (own package) + the 3 shipped W1 deps. The shell **never** imports `@repo/plugin-web-*`. The host (`apps/web/src/App.tsx`) is where W2 imports land — and the host is allowed to take W2 dependencies per ADR-0007 §S6 ("apps/web/src/ is host shell — connects providers + router + plugin registration").

Combined with React Router (Option B) for URL-routable navigation: the registry provides label/icon/order for the rail; React Router handles the actual mount. AppRail `onClick` → `navigate("/app/" + module.id)` → React Router routes to the matching registration's `render`.

**Pros**
- Shell is module-agnostic. `@repo/xai-web-shell` has ZERO dependencies on `@repo/plugin-web-*` packages.
- The host shell (`apps/web/src/App.tsx`) is the single place where W2 imports congregate — exactly as ADR-0007 §S6 specifies.
- AppRail iterates `useWebModuleRegistry()` to render its buttons; new W2 modules show up automatically when they register.
- Drag-reorder operates on `xai_rail_order` (an array of module ids), and the registry filters out unknown ids gracefully — surviving partial W2 deploys.
- Existing `webModuleRouteRegistrations` shape is extended (or replaced) with a richer `WebModuleSlotRegistration` that adds `icon` + `railOrder`.

**Cons**
- Two source-of-truth registries today: the existing `@repo/core/types` `WebModuleRouteRegistration` (used by `apps/web/src/routes/modules/registrations.tsx`) and a new `WebModuleSlotRegistration` in `@repo/xai-web-shell`. Mitigation: declare in design.md §3 that `WebModuleSlotRegistration extends WebModuleRouteRegistration` and the shell narrows it; the host array becomes the single physical list, just typed twice.
- Registration timing: the registry must be populated before AppRail renders. Mitigation: `<WebShellProvider modules={[...]}>` receives the registrations as an explicit prop from `apps/web/src/App.tsx` — synchronous, no lazy-import races.
- Adds one provider to `apps/web/src/main.tsx`'s provider tree. Trivial.

**Verdict:** CANDIDATE — selected (see §5).

### Option D — Custom-element / Web Components seam

Each W2 module ships a custom element (`<xai-tasks-module>`). Shell injects the element by tag name; modules register their tag at boot.

**Pros**
- Browser-native cross-package boundary.
- Strongest decoupling — modules could theoretically be loaded by URL rather than workspace dep.

**Cons**
- React 19 `<custom-element>` integration is supported but ergonomically awkward (props vs attributes, no JSX child auto-forwarding, manual ref management).
- The prototype is pure React; W2 modules will be pure React TSX. Forcing them to wrap in a custom-element adapter doubles the surface area for no observable benefit.
- Type safety for module props is lost across the custom-element boundary.
- ADR-0007 §S6/§S7 implicitly assumes React component imports; introducing Web Components requires a new ADR.

**Verdict:** REJECTED. Disproportionate complexity vs Option C.

---

## 3. External Research

Web research was performed for two narrow questions where the project codebase did not provide an answer:

### 3.1 React 19 slot/registry patterns (no library research needed)

- React 19 ships `use()` + improved `Context`; the registry can be a plain `Context<WebModuleSlot[]>` populated at mount and consumed by `useContext`. No new library needed.
- This matches the project's existing pattern (see `apps/web/src/routes/modules/registrations.tsx` array-driven registration) and the W1 ADR's frozen assumption §4 ("禁止新的状态库 — `useState` + `useReducer` + `useContext` + 类型化事件总线是唯一的状态原语").

**Conclusion**: no library / dependency decision needed. The slot registry is hand-rolled React Context.

### 3.2 Drag-and-drop library?

The prototype `shell.jsx` lines 99-110 uses native HTML5 DnD (`draggable`, `onDragStart`, `onDragOver`, `onDragEnd`, `dataTransfer`). Three reasons to stay with native:

1. The DnD surface is **11 rail buttons reordering within a single list**. This is the simplest possible DnD case — no nested drop zones, no cross-list, no virtualization.
2. The project has no DnD library installed (verified by `grep -E "dnd|drag" apps/web/package.json packages/*/package.json` → 0 matches). Introducing `@dnd-kit/core` (~25KB) for 11 buttons is disproportionate.
3. The dashboard row #10 (`xai-web-dashboard-grid`) needs Stage-Manager-style FLIP-drag (DESIGN.md §4.4) — much more complex. That row may opt-in to `@dnd-kit/core` independently. The shell's choice does not bind dashboard's choice.

**Conclusion**: native HTML5 DnD ported as-is. No dependency added by this row.

### 3.3 No further external research required

All other decisions (state placement, AvatarMenu positioning, persistence flow) are pinned by:

- ADR-0007 §S4 port mapping table
- DESIGN.md §3 / §4.14 / §7
- The 3 shipped W1 packages' public APIs

These are internal-codebase decisions, not technology-selection decisions.

---

## 4. Tradeoff Matrix

| Criterion | A (direct import) | B (Router lazy alone) | C (slot registry + Router, HYBRID) | D (Web Components) |
|---|---|---|---|---|
| Shell ↛ W2 dep | FAIL | PASS (via existing array) | PASS | PASS |
| W2 parallel-shippable | FAIL | PASS | PASS | PASS |
| Type safety end-to-end | PASS | PASS | PASS | DEGRADED |
| Browser back/forward | FAIL | PASS | PASS | PASS |
| Deep-link compatible (`/app/tasks/cards/abc`) | FAIL | PASS | PASS | DEGRADED |
| Drag-reorder gracefully handles unknown ids | n/a | n/a | PASS | n/a |
| Adds new framework / library | n/a | n/a | none | custom-elements polyfill possible |
| ADR-0007 §S6 alignment | violates | partial | full | requires new ADR |
| Effort estimate | low | low | medium | high |

Option C wins all the must-have criteria with a contained cost. Option B alone (without C's registry abstraction) would still couple `apps/web/src/routes/modules/registrations.tsx` to every W2 row by manual edit — Option C lets the host array be auto-derived from W2 imports without the shell knowing.

---

## 5. Recommendation

**Adopt Option C (slot registry) combined with Option B (React Router for URL navigation).**

The shell defines `WebModuleSlotRegistration` (extending the existing `@repo/core/types` `WebModuleRouteRegistration` with `icon` + `railOrder` + `i18nKey`). The host (`apps/web/src/App.tsx`) wires a `<WebShellProvider modules={...}>` around the existing `<RouterProvider router={router}>`. AppRail consumes the registry; module mounting goes through the existing `<AppRouteElement>` (already in `apps/web/src/routes/RouteGateElements.tsx`).

### Concrete impl outline

1. **Package** — `packages/xai-web-shell/src/`:
   - `index.ts` — public surface (sole entry per CLAUDE.md §Code Boundaries).
   - `types.ts` — `WebModuleSlotRegistration` type.
   - `registry.tsx` — `WebShellProvider`, `useWebShell()`, `useWebModuleRegistry()` hooks.
   - `AppRail.tsx` — rail with 4 positions, drag-reorder, bottom buttons (Pet/Sync/Notif/Help).
   - `Topbar.tsx` — search placeholder + EN/中文 + Light/Dark/System + Comfortable/Compact + Settings icon.
   - `AvatarMenu.tsx` — direction-aware popover (Left=top-right / Right=top-left / Top=bottom-left / Bottom=top-left).
   - `Shell.tsx` — composes `AppRail` + `Topbar` + `<main>` slot.
   - `internal/` — DnD reducer + popover geometry helpers (NOT exported).

2. **Host shell** — `apps/web/src/App.tsx` (new) + edits to `apps/web/src/routes/router.tsx`:
   - `App.tsx` owns the 8 root state pieces from `web design/app.jsx` lines 7-22.
   - `useEffect` calls `applyTheme(theme)`, `applyDensity(density)`, `applyFontScale(fontScale)`, `applyAccentHue(accentHue)`, `applyBgTone(bgTone)`, `applyRailPos(railPos)` from `@repo/plugin-web-tokens`.
   - `accentHue` / `railPos` / `bgTone` are bound via `usePref` (auto-persist).
   - Pet on/off is local `useState` for v1 (pet pos/id is the pet row's concern — row #19).
   - The `<App>` component wraps `<WebShellProvider modules={[...]}>` and `<Shell>` around `<Outlet/>`.
   - `webModuleRouteRegistrations` in `apps/web/src/routes/modules/registrations.tsx` is extended to satisfy `WebModuleSlotRegistration` (additive — adds `icon` + `railOrder` + `i18nKey` to existing entries). For W1 ship, all 14 W2 module slots are pre-registered with placeholder render components; the existing `todoWebModuleRegistration` from `@repo/plugin-productivity/web` is preserved.

3. **Persistence flow** (uses `@repo/plugin-web-storage`):
   - `usePref("xai_rail_order")` in `AppRail.tsx` — drag-reorder writes through hook.
   - `usePref("xai_rail_pos")` in `App.tsx` (or settings-appearance row #22 later; here for v1).
   - `usePref("xai_accent_hue")`, `usePref("xai_bg_tone")` in `App.tsx`.
   - The registry already declares these keys (verified in `packages/plugin-web-storage/src/internal/registry.ts` lines 130-166).

4. **Cross-module signals** (uses `@repo/xai-web-event-bus`):
   - AppRail `onClick(moduleId)` → `emitWebEvent("web:shell:module-change", { moduleId, source: "app-rail" })` THEN `navigate("/app/" + moduleId)`. The emit is informational for statistics / AI Chat listeners; the navigate does the actual mount.
   - Pet toggle button → `emitWebEvent("web:shell:pet-toggle", { on: !petOn, source: "rail-bottom" })`. The pet row #19 listens. The shell does NOT directly mount any pet component.
   - AvatarMenu "Settings" / "Statistics" entries → `navigate("/app/settings")` / `navigate("/app/statistics")` (no emit needed; these are intentional nav by the user).

### Why this satisfies all hard constraints

| Constraint | How satisfied |
|---|---|
| Shell ↛ direct module import | Registry pattern. `@repo/xai-web-shell` package.json lists only `@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`, `react`, `react-dom`, `react-router`. Zero W2 deps. |
| Drag-reorder persists to `xai_rail_order` | `usePref("xai_rail_order")` already typed in registry as `RailItemId[]`. AppRail uses `setValue([...next])` in `onDragOver`. |
| AvatarMenu popover direction per DESIGN.md §4.14 | `AvatarMenu.tsx` receives `railPos` prop; CSS data-attr `[data-pos]` already implements the 4 directions in `packages/plugin-web-tokens/src/layout.css` lines 105-171. The TSX just sets the attribute correctly. |
| Pet toggle uses event bus | Rail-bottom Pet button calls `emitWebEvent("web:shell:pet-toggle", ...)`. No direct pet-code call. |
| Search `⌘K` is placeholder | Topbar renders the input + `<span class="kbd">⌘K</span>` decoration verbatim; no keyboard handler wired in this row. (Search row is deferred per DESIGN.md §11.) |

### Frozen assumptions (10) — locked by this discovery

1. **Package name** — `@repo/xai-web-shell` (matches manifest slug + roadmap row #5).
2. **Public surface** — `index.ts` exports `Shell`, `AppRail`, `Topbar`, `AvatarMenu`, `WebShellProvider`, `useWebShell`, `useWebModuleRegistry`, type `WebModuleSlotRegistration`. No deep imports.
3. **Module mount mechanism** — slot registry (Option C) + React Router (Option B). The registry is React Context; the array of registrations is owned by `apps/web/src/routes/modules/registrations.tsx` and passed to `<WebShellProvider modules={...}>`.
4. **Root state placement** — the 8 root state pieces (`module`, `lang`, `theme`, `density`, `fontScale`, `accentHue`, `railPos`, `bgTone`, `petOn`) live in `apps/web/src/App.tsx`, NOT inside `@repo/xai-web-shell`. The shell is stateless UI; the host owns state. `module` becomes derived state (`useParams().moduleId`).
5. **DOM apply path** — `apps/web/src/App.tsx` `useEffect` calls the `apply*` helpers from `@repo/plugin-web-tokens`. The shell does not touch `document.documentElement`.
6. **DnD strategy** — native HTML5 (port shell.jsx lines 99-110 as-is). No DnD library.
7. **Persistence flow** — every persisted state piece goes through `usePref(key)` from `@repo/plugin-web-storage`. No direct `localStorage.*` calls in this row.
8. **Cross-module signaling** — `emitWebEvent` only. No prop-drilling of `setModule` across the rail boundary (the prototype's `goTo={setModule}` lives only inside `apps/web/src/App.tsx`; emit happens for observability + W2 listeners).
9. **Pet rendering** — out of scope for this row. The Pet toggle button is rendered + emits event; actually mounting `<DesktopPet>` is row #19's job. For W1, the shell ships with NO pet component on screen; the toggle is observable via emitted event + dev_log.
10. **Module placeholder** — all 14 W2 module ids (`tasks`, `board`, `dashboard`, `calendar`, `matrix`, `pomodoro`, `habits`, `meditation`, `countdown`, `ai`, `statistics`, `settings`, plus `search`) get a placeholder `<ModuleRoutePlaceholderPage>` so the shell smokes end-to-end before W2 ships. Each W2 row swaps its own placeholder for the real module.

### Dependency overview

```
apps/web/src/App.tsx
  ├── @repo/xai-web-shell                  (this row — Shell, AppRail, Topbar, AvatarMenu)
  ├── @repo/plugin-web-tokens              (SHIPPED — apply* + useI18n + CSS)
  ├── @repo/plugin-web-storage             (SHIPPED — usePref + PREF_REGISTRY)
  ├── @repo/xai-web-event-bus              (SHIPPED — emitWebEvent + useWebEventListener)
  ├── @repo/web-auth-device-session/web    (SHIPPED — AppRouteGate + AuthRouteGate)
  ├── @repo/core/types                     (SHIPPED — WebModuleRouteRegistration + EventMap)
  ├── react-router@^7.15                   (existing)
  └── (W2 placeholder imports via apps/web/src/routes/modules/registrations.tsx — extended, not replaced)
```

The shell package itself depends ONLY on the 3 W1 shipped packages + `@repo/core` (for the `WebModuleId` / `RailPos` types it re-uses) + `react@^19` + `react-dom@^19` + `react-router@^7.15` (peer for `useNavigate`). Zero W2 deps.

---

## 6. Risks & Mitigations

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | feature-review rejects "slot registry on top of existing `WebModuleRouteRegistration`" as over-engineering | low | The existing `webModuleRouteRegistrations` array is the physical list; the slot registry is a typed view over it (one extension of one interface). Cost is one type + one provider; benefit is the shell has zero W2 deps. Documented in this review §2/§5. Fallback if rejected: collapse `WebModuleSlotRegistration` back into `WebModuleRouteRegistration` and pass the host array directly — no behavioral change. |
| R2 | React Router 7 `<Outlet/>` rendering inside `<Shell>` breaks AppShellPage's existing usage of nav buttons | low | The existing `AppShellPage` is host-shell scaffolding (top-of-page debug nav). It WILL be replaced by `<Shell>` in this row. Verified by reading `apps/web/src/pages/AppShellPage.tsx` — no module code depends on it. |
| R3 | Drag-reorder while another tab is open causes `usePref` cross-tab reactivity to flicker | medium | `@repo/plugin-web-storage` `usePref` already handles cross-tab via `storage` event (verified in `packages/plugin-web-storage/src/internal/usePref.ts` lines 145-184). Test in `test.md` covers this. |
| R4 | AvatarMenu popover position regresses when `railPos` switches at runtime (e.g. from Settings) | medium | AvatarMenu reads `railPos` from props (passed from `App.tsx`). When `App.tsx` switches `railPos`, `useEffect` calls `applyRailPos(railPos)` AND re-renders `<AvatarMenu railPos={railPos}>`. The popover direction CSS is data-attribute driven (already in `layout.css`); no JS recompute needed. Smoke verified in `test.md` AC-AVM-3. |
| R5 | Theme = "system" + OS preference change → `<html data-theme>` doesn't update | low | `applyTheme("system")` reads `matchMedia` AT call time. The shell wires a `matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ...)` in `App.tsx` `useEffect` to re-call `applyTheme` on system change. Test AC-THEME-2 covers this. |
| R6 | Cross-vendor: HTML5 DnD `dataTransfer.setData` behavior differs in Safari (synthetic touch events) | medium | Native HTML5 DnD is the prototype's choice — Safari 17+ supports `draggable` for desktop mouse DnD reliably. Touch DnD is out-of-scope for this row (touch UX is a future row). Manual verify gate (Verify Cross-vendor = yes) explicitly checks Safari rail-drag in `test.md` §Manual Verify. |
| R7 | `<WebShellProvider>` wraps the router, so `useNavigate()` from `react-router` is unavailable inside `AppRail` | low | Solved by placing `<WebShellProvider>` INSIDE the router (inside `<App>` which is rendered by a route), not outside. Standard React Router pattern. Documented in design.md §2. |
| R8 | Module switching loses unsaved module-local state when navigation re-mounts the module | accepted | Prototype's `key={module + "_" + lang}` re-mounts on every switch (web design/app.jsx line 73). React Router behavior matches by default. Modules persist state via `usePref` if needed. |
| R9 | The hard-coded prototype `DEFAULT_ITEMS` list (11 items) and the registry default (`DEFAULT_RAIL_ORDER` in `packages/plugin-web-storage/src/internal/registry.ts` line 97, 12 items including `statistics`/`settings`) DIFFER | medium | Registry is the source of truth (declared by row #3, SHIPPED). Shell uses `PREF_REGISTRY.xai_rail_order.default` to drive `DEFAULT_ITEMS`. The 11-vs-12 mismatch in prototype is acknowledged and the registry list wins (12 ids: tasks/board/dashboard/calendar/matrix/pomodoro/habits/meditation/countdown/ai/statistics/settings). The prototype's `search` is NOT in the registry rail order — it's a Topbar-only feature. Confirmed by re-reading registry: line 96-110 lists 12 ids, no `search`. |

---

## 7. Open Questions for feature-review

- **Q1** — `WebModuleSlotRegistration` vs. extending `WebModuleRouteRegistration` in-place: should this row add `icon` + `railOrder` + `i18nKey` directly to `WebModuleRouteRegistration` in `@repo/core/types`, OR create a parallel `WebModuleSlotRegistration` in `@repo/xai-web-shell`?
  - Planner recommendation: **add to `@repo/core/types`** (one type, one source of truth) as an additive change to `WebModuleRouteRegistration`. The shell just re-exports a narrower view.
  - Rationale: avoids a second interface that 14 W2 rows have to learn.

- **Q2** — Should `apps/web/src/App.tsx` use one `useState` per root field, OR a single `useReducer` for all 8 fields?
  - Planner recommendation: **`useState` per field** (matches prototype 1:1; per ADR §S5 rule 6 — typed `useState`).
  - `useReducer` would be an unforced abstraction; the fields are independent.

- **Q3** — Should `petOn` be a `usePref` key (cross-tab synced) or transient `useState` (per-tab)?
  - Planner recommendation: **`useState` for v1**. The prototype defaults `petOn = true` and the toggle is rail-local. Adding `xai_pet_on` to the registry is row #19's call (pet row).

- **Q4** — Topbar Settings icon click — does it `navigate("/app/settings")` or `emitWebEvent("web:shell:module-change", { moduleId: "settings" })` THEN navigate?
  - Planner recommendation: **both** — emit FIRST (for observability), then navigate. AvatarMenu Settings entry uses the same path.

- **Q5** — Where does the system-theme media query listener live (R5)?
  - Planner recommendation: **`apps/web/src/App.tsx`**, alongside the other root effects. Single source of truth for "OS preference changed". The `applyTheme` helper is called from there.

---

## 8. Acceptance Signal Mapping (vs seed brief)

| Seed brief acceptance | Where verified |
|---|---|
| App boots to a working shell at `apps/web/src/` | smoke route + `pnpm --filter @repo/web build` |
| Modules can register via the slot | `WebShellProvider` + `registrations.tsx` extension + AppRail iterates `useWebModuleRegistry()` |
| Switching modules updates URL/route | React Router `navigate("/app/" + moduleId)` |
| All 4 rail positions render correctly | `applyRailPos` + AppRail `data-pos` attribute + manual cross-vendor verify P4 |
| Avatar menu opens in the right corner per position | `AvatarMenu` reads `railPos`; data-attr drives CSS popover direction |
| Reload preserves rail order + railPos + theme + density | `usePref` for each key — automatic; AC-PERSIST suite in `test.md` |

---

## 9. Phase Plan Preview

Four phases (recorded canonically in `packages/xai-web-shell/docs/dev_log.md`):

- **P1** — Root state in `apps/web/src/App.tsx` + `<Topbar>` (port `web design/app.jsx` lines 7-42 root state + useEffects; port `web design/shell.jsx` `<Topbar>` lines 168-200).
- **P2** — `<AppRail>` + drag-reorder + 4 rail positions (port `web design/shell.jsx` lines 69-166; `usePref("xai_rail_order")`).
- **P3** — `<AvatarMenu>` (direction-aware popover) + slot registry (`WebShellProvider`, `useWebModuleRegistry`, `WebModuleSlotRegistration` type).
- **P4** — Routing wire-up + cross-vendor smoke (extend `apps/web/src/routes/modules/registrations.tsx` + replace `AppShellPage` usage with `<Shell>` + manual verify Chrome/Safari/Firefox).

Each phase is a single `feature-build` run, then stops for confirmation per CLAUDE.md.

---

## 10. Related

- ADR-0007 §S4 — port mapping table (drives the shell.jsx → AppRail/Topbar/AvatarMenu split).
- ADR-0007 §S5 — TSX strategy (rule 1-10 govern the JSX→TSX conversion).
- ADR-0007 §S6 — `apps/web/src/` host shell role.
- ADR-0007 §S7 — cross-module event bus rules (this row uses `@repo/xai-web-event-bus`).
- ADR-0007 §S8 — persistence key registry (this row reads `xai_rail_order`, `xai_rail_pos`, `xai_accent_hue`, `xai_bg_tone`).
- ADR-0003 — three-faces architecture (shell is the Web face's host integration point).
- ADR-0006 — Web-face hybrid reuse boundary (shell is a new Vite SPA component; no new data contract).
- `web design/DESIGN.md` §3 (信息架构), §4.14 (Avatar Menu), §7 (个性化与主题), §9.2 (持久化键).
