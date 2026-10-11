# Test Strategy — xai-web-shell

> Acceptance criteria grid + concrete test mapping. Each AC row maps to one
> or more test cases under `packages/xai-web-shell/src/__tests__/` and
> `apps/web/src/__tests__/`. The Manual Verify section (§5) is the
> cross-vendor gate that READY_TO_SHIP depends on.

## §1 Toolchain

- Unit / component tests: Vitest + `@testing-library/react` (already in
  apps/web; will add to xai-web-shell devDeps in P1).
- Test environment: `jsdom@^26` (consistent with row #4 setup).
- React 19 + React Router 7 + StrictMode in every test root.
- Mock strategy:
  - `@repo/plugin-web-storage`'s `usePref` is consumed for REAL (real
    localStorage-backed). Tests use `beforeEach(() => localStorage.clear())`.
  - `@repo/xai-web-event-bus`'s `emitWebEvent` / `onWebEvent` are consumed
    for REAL (shared in-tab EventTarget). Tests collect emissions via
    `onWebEvent("web:shell:module-change", spy)` set up in `beforeEach`.
  - `@repo/plugin-web-tokens`'s `apply*` helpers are spied via
    `vi.spyOn(document.documentElement, "setAttribute")` to assert calls.
    Tests do NOT mock the helpers themselves — the apply* layer is shipped
    and trusted.
  - `react-router` is wrapped in `<MemoryRouter initialEntries={["/app/<id>"]}>`
    in component tests; the smoke test uses the real `createBrowserRouter`.
- Lint: 0 warnings (`pnpm --filter @repo/xai-web-shell lint`).
- Coverage target: ≥ 90% statements and branches inside
  `packages/xai-web-shell/src/` (excluding `__fixtures__/` and `__tests__/`).

## §2 Test File Inventory (planned)

| File | Tests | Purpose |
|---|---|---|
| `src/__tests__/index-barrel.test.ts` | B1..B3 | Public surface is exactly what api.md §0 lists; no deep imports succeed |
| `src/__tests__/registry.test.tsx` | R1..R6 | Provider populates, hooks return sorted/filtered list, throws outside provider |
| `src/__tests__/Topbar.test.tsx` | TP1..TP6 | All 3 segments + Settings icon + search input visible + i18n lang switch |
| `src/__tests__/AppRail.test.tsx` | AR1..AR12 | 4 positions, drag-reorder, click handler, active highlight, persistence, registry filter |
| `src/__tests__/AvatarMenu.test.tsx` | AV1..AV8 | Open/close, item handlers, popover direction per railPos, Escape key, click-outside |
| `src/__tests__/Shell.smoke.test.tsx` | S1..S4 | Composed Shell renders inside MemoryRouter; navigate updates active button |
| `src/__tests__/persistence.test.tsx` | P1..P4 | `xai_rail_order` persists across mount; reconciles with registry on read |
| `src/__tests__/event-emit.test.tsx` | E1..E5 | All five emit sites fire the right payload; emit precedes navigate |
| `apps/web/src/__tests__/shell.smoke.test.tsx` | A1..A4 | Cross-package: real App.tsx mounts, applies attributes, navigates, persists |
| `apps/web/src/__tests__/shell.theme.test.tsx` | T1..T3 | Theme switch updates `<html data-theme>`; system → matchMedia reactive |
| `src/__tests__/railOrderModel.test.ts` | RM-D, RM-V, RM-P1..P8 | CP-APPRAIL-01 pure model: the strict A5 domain table; the display reconcile D(S, R); the A2 index-slot merge properties P1–P7 (each toggleable module hidden, three hidden, unknown ids, `settings`, absent and `[]` bases) and non-permutations (no merge) |
| `src/__tests__/AppRail.railorder.test.tsx` | RO-M, RO-T, RO-R, RO-S, RO-F | CP-APPRAIL-01 AppRail with the real engine, a local exclusive Web Lock fixture and an attempt-counting Storage injector: zero-write mounts; one write at the drop, zero during dragover, zero on cancel, external drops ignored, R changing mid-drag; R-1 end to end; source truth and crash safety for every contract §5 item 2 value; failure, Retry, Discard, held lock, latest wins, verified no-op, unmount |
| `src/__tests__/RailOrderStatus.test.tsx` | RS-C, RS-P, RS-F, RS-E, RS-U, RS-T | CP-APPRAIL-01 Topbar status: A8 render conditions, panel states and EN/ZH wording, focus targets (success/Discard → `.topbar-pref-trigger`, failed Retry and Export keep focus, Escape, outside mousedown), memory-only export and its failure line, the unload warning and the sign-out step |
| `src/__tests__/railOrderFixture.tsx` | — | Shared rail-order fixtures (Web Lock manager, Storage probe, harness, drag driver); not a test file |
| `apps/web/src/__tests__/App.railorder.test.tsx` | APP-RO1..APP-RO9 | CP-APPRAIL-01 at App level: one controller, the Topbar slot after the Appearance status, crash safety at load, and the sign-out step before the Appearance step in both auth branches (alone, with an Appearance draft, with both, rail Cancel) |

## §3 Acceptance Criteria Grid

### AC-BOOT (App boots)

| AC | Statement | Test |
|---|---|---|
| AC-BOOT-1 | `/app` redirects to default module (first registry entry) | A1 |
| AC-BOOT-2 | `/app/<id>` mounts Shell with the matching module's content slot | A1 |
| AC-BOOT-3 | StrictMode double-mount does not double-emit or double-persist | A2 |

### AC-RAIL (App Rail)

| AC | Statement | Test |
|---|---|---|
| AC-RAIL-1 | Rail renders all registry items sorted by railOrder | AR1, R3 |
| AC-RAIL-2 | `data-pos="left" / "right" / "top" / "bottom"` is set from `useWebShell().railPos` | AR2 |
| AC-RAIL-3 | Clicking a button calls `onModuleClick(id)` | AR3, E1 |
| AC-RAIL-4 | Active highlight matches `activeModuleId` | AR4 |
| AC-RAIL-5 | Drag-reorder updates `xai_rail_order` through the rail-order controller: exactly one write at the drop, zero during dragover, zero on a cancelled gesture (CP-APPRAIL-01) | AR5, P1, RO-T1..T7 |
| AC-RAIL-6 | Drag-reorder during click — drag wins (click suppressed when dragId truthy) | AR6 |
| AC-RAIL-7 | Rail items whose id is missing from `xai_rail_order` are appended | AR7, P3 |
| AC-RAIL-8 | `xai_rail_order` entries not in the registry are skipped for display and kept at their stored index by every drop (R-1) | AR8, P4, RO-R1, RO-R2, RM-P2 |
| AC-RAIL-13 | Malformed or unreadable `xai_rail_order` never throws: default display, the Topbar source status with Reload, no rewrite (CP-APPRAIL-01) | RO-S1..S4, APP-RO2 |
| AC-RAIL-14 | A failed rail write keeps the dropped order with the Topbar status (Retry, Discard, Export), the unload warning and the sign-out step; no route guard | RO-F1..F8, RS-C, RS-P, RS-F, RS-E, RS-U, APP-RO1, APP-RO4..RO9 |
| AC-RAIL-9 | Pet button toggles `petOn` AND emits `web:shell:pet-toggle` | AR9, E2 |
| AC-RAIL-10 | Sync / Notif / Help buttons are visible but no-op (no errors thrown) | AR10 |
| AC-RAIL-11 | Tooltips (`data-tip`) use i18n labels from `useI18n(lang).t.nav` | AR11 |
| AC-RAIL-12 | Lang switch re-renders tooltips with the new language | AR12 |

### AC-TOPBAR (Topbar)

| AC | Statement | Test |
|---|---|---|
| AC-TOPBAR-1 | EN/中文 segment sets lang via setLang prop | TP1 |
| AC-TOPBAR-2 | Light/Dark/System segment sets theme via setTheme prop | TP2 |
| AC-TOPBAR-3 | Comfortable/Compact segment sets density via setDensity prop | TP3 |
| AC-TOPBAR-4 | Settings gear icon click calls `onOpenSettings()` | TP4, E3 |
| AC-TOPBAR-5 | Search input renders with placeholder (i18n: common.search_placeholder) | TP5 |
| AC-TOPBAR-6 | `⌘K` kbd hint is rendered (decorative; no handler) | TP6 |
| AC-TOPBAR-7 | `railOrderStatus` renders immediately after `appearanceStatus`, before `.topbar-pref`; an empty slot leaves `.topbar` `outerHTML` unchanged (CP-APPRAIL-01) | TP-RAIL-1, TP-RAIL-2, RS-T1 |

### AC-AVM (AvatarMenu)

| AC | Statement | Test |
|---|---|---|
| AC-AVM-1 | Returns null when `open === false` | AV1 |
| AC-AVM-2 | Clicking Settings entry calls onOpenSettings then onClose | AV2, E4 |
| AC-AVM-3 | Popover anchor data-attribute matches railPos (left→left-top-right, right→right-top-left, top→top-bottom-left, bottom→bottom-top-left) | AV3 |
| AC-AVM-4 | Scrim click closes the menu | AV4 |
| AC-AVM-5 | Escape key closes the menu | AV5 |
| AC-AVM-6 | Statistics entry calls onOpenStatistics then onClose | AV6, E5 |
| AC-AVM-7 | Sign Out entry warns once in DEV and closes when onSignOut is undefined | AV7 |
| AC-AVM-8 | User name + email shows based on `lang` (Aki Chen / 百事可爱) | AV8 |

### AC-PET (Pet toggle, no Pet mount)

| AC | Statement | Test |
|---|---|---|
| AC-PET-1 | Pet button is rendered at the rail bottom | AR9 |
| AC-PET-2 | Pet button emits `web:shell:pet-toggle` with `{ on: <next>, source: "rail-bottom" }` | E2 |

### AC-PERSIST (Persistence across reload)

| AC | Statement | Test |
|---|---|---|
| AC-PERSIST-1 | `xai_rail_order` re-read on remount restores the user-defined order | P1 |
| AC-PERSIST-2 | `xai_rail_pos` re-read on remount sets `<html data-rail-pos>` correctly | A3, T1 |
| AC-PERSIST-3 | `xai_accent_hue` re-read on remount sets `<html style="--accent-hue: X">` | A3 |
| AC-PERSIST-4 | `xai_bg_tone` re-read on remount sets `<html data-bg-tone>` | A3 |

### AC-THEME (Theme + system)

| AC | Statement | Test |
|---|---|---|
| AC-THEME-1 | theme="light" / "dark" sets `<html data-theme>` accordingly | T1 |
| AC-THEME-2 | theme="system" resolves via matchMedia AND re-applies when OS preference changes | T2 |
| AC-THEME-3 | density="comfortable" / "compact" sets `<html data-density>` | T3 |

### AC-EMIT (Cross-module signals)

| AC | Statement | Test |
|---|---|---|
| AC-EMIT-1 | AppRail click emits `web:shell:module-change` with source "app-rail" | E1 |
| AC-EMIT-2 | Topbar Settings click emits `web:shell:module-change` with source "shortcut" | E3 |
| AC-EMIT-3 | AvatarMenu Settings click emits `web:shell:module-change` with source "shortcut" | E4 |
| AC-EMIT-4 | AvatarMenu Statistics click emits `web:shell:module-change` (moduleId: "statistics", source: "shortcut") | E5 |
| AC-EMIT-5 | Pet click emits `web:shell:pet-toggle` | E2 |
| AC-EMIT-6 | All emits happen BEFORE the corresponding `navigate()` call | E1, E3, E4, E5 |

### AC-SLOT (Registry mechanism)

| AC | Statement | Test |
|---|---|---|
| AC-SLOT-1 | `<WebShellProvider modules={[]}>` renders AppRail with zero buttons (no crash) | R1 |
| AC-SLOT-2 | `useWebShell()` outside provider throws | R2 |
| AC-SLOT-3 | `useWebModuleRegistry()` sorts by railOrder then id alphabetical | R3 |
| AC-SLOT-4 | Modules with `showInRail: false` (e.g. settings) do NOT appear in the rail | R4 |
| AC-SLOT-5 | Modules with missing icon / railOrder / i18nKey get safe defaults + DEV warn | R5 |
| AC-SLOT-6 | Re-rendering with a new `modules` array updates the rail synchronously | R6 |

### AC-BARREL (Public surface)

| AC | Statement | Test |
|---|---|---|
| AC-BARREL-1 | `index.ts` exports exactly the symbols api.md §0 lists | B1 |
| AC-BARREL-2 | No symbol is exported from `src/internal/*` | B2 |
| AC-BARREL-3 | `WebModuleSlotRegistration` extends `WebModuleRouteRegistration` (type-only assertion) | B3 |

---

## §4 Mock Strategy

### What we mock

| Dependency | Real vs Mock | Why |
|---|---|---|
| `@repo/plugin-web-storage` `usePref` | REAL | localStorage backing is in jsdom; need to assert real persistence semantics |
| `@repo/xai-web-event-bus` `emitWebEvent` / `onWebEvent` | REAL | EventTarget works in jsdom; we assert the actual emit payload |
| `@repo/plugin-web-tokens` `useI18n` | REAL | Pure function; mocking would lose i18n coverage |
| `@repo/plugin-web-tokens` `apply*` helpers | SPIED | Side effects on `document.documentElement`; spy via `vi.spyOn(document.documentElement, "setAttribute")` for assertions but keep originals running |
| `react-router` `useNavigate` / `useParams` | REAL | Wrap test root in `<MemoryRouter>` with controlled `initialEntries` |
| `window.matchMedia` | MOCKED | jsdom does not implement `matchMedia`; use `vi.stubGlobal("matchMedia", ...)` with controllable `matches` + `addEventListener` |
| `HTMLElement.dataTransfer` (HTML5 DnD) | MOCKED | jsdom DnD is incomplete; tests use a minimal `dataTransfer` shim and dispatch `dragstart` / `dragover` / `dragend` events manually |

### Globals reset per test

```ts
// vitest setupFile
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.style.cssText = "";
  vi.clearAllMocks();
});
```

---

## §5 Manual Verify (Cross-vendor gate — Verify Cross-vendor: yes)

This row's manifest entry `Verify Cross-vendor = yes` is the gate that
READY_TO_SHIP requires. The four prior W1 rows deferred their cross-vendor
manual gate to this row (see W1 #4 dev_log Work Log). Therefore THIS ROW
exercises the full live-browser surface — both this row's deliverables AND
the deferred coverage from rows #2, #3, #4.

### §5.1 Browser matrix

Each scenario below MUST be exercised in **all three** browsers:

- Chrome stable (latest, macOS).
- Safari 17+ (macOS).
- Firefox latest (macOS).

Record the verifier's name + browser version + PASS/FAIL per row in the
Work Log of `dev_log.md` during P4.

### §5.2 Manual scenarios

| ID | Scenario | Expected |
|---|---|---|
| M1 | `pnpm --filter @repo/web dev` → open `http://localhost:3000/app` | Redirects to default module; Shell renders with rail-left default |
| M2 | Toggle EN → 中文 in Topbar | Rail tooltips + AvatarMenu labels switch language live |
| M3 | Toggle Light → Dark → System | `<html data-theme>` flips; UI re-themes; System resolves to OS preference |
| M4 | Change OS theme preference while theme="system" | `<html data-theme>` flips automatically; no reload needed (AC-THEME-2) |
| M5 | Toggle Comfortable → Compact | `<html data-density>` flips; row heights shrink visibly |
| M6 | Click Topbar Settings gear | Navigates to `/app/settings`; emits `web:shell:module-change` (verify in console with `onWebEvent("web:shell:module-change", console.log)`) |
| M7 | Click Avatar → Settings | Same as M6 |
| M8 | Click Avatar → Statistics | Navigates to `/app/statistics` |
| M9 | Drag rail item Tasks above Board | Order updates visually; localStorage `xai_rail_order` updates; reload preserves order |
| M10 | Switch rail position Left → Right → Top → Bottom (via inline test via `document.documentElement.setAttribute("data-rail-pos", "right")` etc., until row #22 lands) | Layout reflows correctly per `layout.css` rules; AvatarMenu popover direction changes accordingly |
| M11 | Open AvatarMenu, press Escape | Menu closes |
| M12 | Open AvatarMenu, click scrim | Menu closes |
| M13 | Click Pet button at rail bottom | Button toggles `.active`; `web:shell:pet-toggle` emitted (verify in console) |
| M14 | Reload page after setting `theme=dark`, `density=compact`, `accentHue=210`, `bgTone=lavender`, `railPos=top`, rail-order custom | All five persisted; UI restores exact previous state on reload |
| M15 | Open the app in two tabs; reorder rail in tab A | Tab B's rail reorders on its next render (cross-tab sync via `usePref`) |
| M16 | Lighthouse a11y audit on `/app/<default>` | ≥ 95 score; no rail tooltip / button label violations |
| M17 | Tab through rail items with keyboard | Tab order follows DOM order; Enter activates each button (NOTE: arrow-key cycling is NOT in scope for v1; documented in dev_log Known Limitations) |
| M18 | Tab through Topbar controls | All segments + Settings icon are reachable; Enter / Space activates each |

### §5.3 Deferred-row cross-vendor coverage (rolled forward)

| Row | Concern | Where it's exercised in this row |
|---|---|---|
| #2 plugin-web-tokens | `apply*` actually mutates `<html>` in live browsers | M3, M5, M14 |
| #3 plugin-web-storage | `usePref` cross-tab sync via `storage` event | M15 |
| #4 xai-web-event-bus | `emitWebEvent` actually delivers in live browsers (jsdom equivalence claim) | M6, M7, M8, M13 (verified via console listener) |

### §5.4 Performance smoke (informational, non-blocking)

- Cold load of `/app/<default>` on Chrome: TTI < 2s on a M-series Mac.
- Rail drag-reorder: 60fps observed in Performance tab (no main-thread
  stutter > 16ms per frame during drag).

If these regress significantly, log in dev_log Work Log; do NOT block ship
on them (a future perf row will own bundle/perf hardening).

---

## §6 Coverage Targets

- `src/Shell.tsx` — ≥ 95% statements (small composition file).
- `src/AppRail.tsx` — ≥ 90% statements / 85% branches.
- `src/AvatarMenu.tsx` — ≥ 95% statements (small component).
- `src/Topbar.tsx` — ≥ 95% statements.
- `src/registry.tsx` — ≥ 95% statements / 90% branches.
- `src/internal/*` — ≥ 85% statements (lower bar because these are pure
  helpers exercised indirectly through component tests).

Coverage measured via `vitest --coverage` (c8 backend). The `pnpm --filter
@repo/xai-web-shell test:coverage` command MUST report ≥ 90% aggregate
inside `src/` for READY_TO_SHIP.

---

## §7 Negative / Edge Tests

| ID | Edge case | Expected |
|---|---|---|
| N1 | `<WebShellProvider modules={[]}>` | AppRail renders an empty `.rail-items`; no errors |
| N2 | `xai_rail_order = ["ghost-module", "tasks"]` | Filter "ghost-module" out; warn once; show Tasks first then registry-default order for the rest |
| N3 | `xai_rail_order = []` | Use registry default rail order |
| N4 | Registry has 14 modules but `xai_rail_order` has only 5 | Show the 5 first; append remaining 9 in registry order |
| N5 | Quick double-click on a rail button | Emits `web:shell:module-change` twice (matches React event semantics); navigate runs twice (idempotent) |
| N6 | AvatarMenu open while rail position switches Left → Top | Menu re-anchors via new `data-anchor` attribute; remains visible |
| N7 | Drag a rail item ONTO itself | Reducer returns same order; no re-render |
| N8 | Drag-cancel (Escape mid-drag) | dragId clears; order unchanged |
| N9 | localStorage quota exceeded during rail-reorder write | `usePref` returns false from `setPref`; the hook's value remains the previous order; warn surfaces in DEV |
| N10 | `lang` switched to a third value (e.g. "ja") | TypeScript would prevent it; runtime: useI18n throws TypeError per its contract |

---

## §8 Out-of-scope tests (deferred to other rows)

- DesktopPet rendering (row #19).
- Settings panel UI (rows #21..#24).
- AI Chat `window.claude.complete` adapter (row #18).
- Statistics aggregation reading `web:shell:module-change` events (row #20).
- Actual module pane content (rows #6..#24 each).
- `⌘K` search command palette (deferred per DESIGN.md §11).
- Touch DnD on iOS Safari (future row).
- Mobile responsive layout (future row).
