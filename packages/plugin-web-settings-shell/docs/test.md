# Test Strategy — @repo/plugin-web-settings-shell

> **Row**: xai-web-settings-shell (#21, W4a · chassis)
> **Coverage target**: ≥ 90% lines
> **Runner**: Vitest (jsdom env) — `pnpm --filter @repo/plugin-web-settings-shell test`

---

## 1. Layers + mock strategy

| Layer | Mock | Note |
|---|---|---|
| `localStorage` | jsdom built-in | `beforeEach: localStorage.clear()` via `vitest.setup.ts` |
| `emitWebEvent` | spy via `vi.mock("@repo/xai-web-event-bus", ...)` | Verify emit count + payload shape in Save/Reset specs |
| `window.confirm` | `vi.spyOn(window, "confirm").mockReturnValue(true)` per test | Wrap in `confirmAction` helper for testability |
| `setTimeout` (1800ms Save flash) | `vi.useFakeTimers()` + `vi.advanceTimersByTime(1800)` | Verify saved=true then auto-revert |
| `useI18n` | NOT mocked — real `@repo/plugin-web-tokens` bundle | Bundle is `In-Dev`-stable per W1; treat as Stable |
| `usePref` / `removePref` / `PREF_REGISTRY` | NOT mocked at integration level | Real `@repo/plugin-web-storage` — write to `localStorage`, observe via getPref |
| `<canvas>` | n/a | Chassis has no canvas |

## 2. Test files

| File | Subject | Specs |
|---|---|---|
| `src/__tests__/types-paneIds.test.ts` | `SettingsPaneId` enum order parity with DESIGN.md §4.12 | T1..T2 |
| `src/__tests__/Toggle.test.tsx` | atom — on/off + aria + click | TG1..TG4 |
| `src/__tests__/SettingRow.test.tsx` | atom — label/desc/children/style passthrough | SR1..SR4 |
| `src/__tests__/SectionBlock.test.tsx` | atom — children/style passthrough | SB1..SB2 |
| `src/__tests__/resetAllPrefs.test.ts` | utility — removes xai_* keys + emits 7 events | R1..R8 |
| `src/__tests__/paneRegistry.test.ts` | registry length + ordering + placeholder render | P1..P3 |
| `src/__tests__/confirmAction.test.ts` | confirm helper (stubbed window.confirm) | C1..C2 |
| `src/__tests__/SettingsFooter.test.tsx` | save+reset flow + 1800ms flash + bilingual labels | F1..F8 |
| `src/__tests__/SettingsModule.test.tsx` | 13 sidebar entries clickable, pane switch, default "account" | M1..M10 |
| `src/__tests__/registration.test.tsx` | slot fields match spec; route renders SettingsModule | RG1..RG3 |
| `src/__tests__/index-barrel.test.ts` | public surface enumeration | B1..B3 |

## 3. Acceptance specs (numbered)

### Atomic — Toggle (4)
- **TG1**: `<Toggle on={false} onChange={fn}/>` renders `aria-checked="false"`, no `on` class
- **TG2**: `<Toggle on={true} onChange={fn}/>` renders `aria-checked="true"` + `on` class on the button
- **TG3**: click invokes `onChange` once with no args
- **TG4**: `role="switch"` present (a11y)

### Atomic — SettingRow (4)
- **SR1**: label string rendered in `.sr-label`
- **SR2**: desc string rendered in `.sr-desc` only when provided
- **SR3**: children rendered in `.sr-ctrl`
- **SR4**: style prop applied to root `.setting-row`

### Atomic — SectionBlock (2)
- **SB1**: children rendered in `.setting-block`
- **SB2**: style prop passed to root

### resetAllPrefs (8)
- **R1**: Setting `xai_accent_hue` + `xai_rail_pos` + `xai_bg_tone` via `setPref` then calling `resetAllPrefs()` → all 3 keys absent from `localStorage`
- **R2**: Non-`xai_*` keys (e.g. `"other_app_pref"`) preserved
- **R3**: Emits exactly 7 events on `web:settings:preference-changed` (one per canonical WebPreferenceKey)
- **R4**: Each emitted event has a `changedAt` ISO string parseable by `new Date()`
- **R5**: Each emit payload `key` is one of theme/density/fontScale/accentHue/railPos/bgTone/lang (no duplicates, no extras)
- **R6**: Emit values match the compile-time defaults table (`theme:"light"`, `density:"comfortable"`, `fontScale:1`, `accentHue:165`, `railPos:"left"`, `bgTone:"default"`, `lang:"en"`)
- **R7**: Idempotent — calling twice yields same end state (keys removed, 7+7=14 emits when both calls count)
- **R8**: Skips entries with `proposed: true` (no removePref call for those keys)

### paneRegistry (3)
- **P1**: `paneRegistry.length === 13`
- **P2**: `paneRegistry.map(p => p.id)` deep-equals `["account","premium","features","smart_lists","notifications","date_time","appearance","more","integrations","collaborate","sticky","hotkeys","about"]`
- **P3**: Each `render({ lang: "en" })` returns an element whose text matches "This pane is not yet available."

### confirmAction (2)
- **C1**: `confirmAction("msg")` returns true when `window.confirm` returns true
- **C2**: Returns false when `window.confirm` returns false

### SettingsFooter (8)
- **F1**: Renders 2 buttons — Reset on the left, Save on the right; EN labels "Reset to defaults" / "Save & apply"
- **F2**: ZH labels "恢复默认" / "保存生效" when `lang="zh"`
- **F3**: Save click → calls `props.onSave()` once
- **F4**: Save click with `onSave` returning `[{key:"theme",value:"dark"}]` → emits 1 event on `web:settings:preference-changed` with that payload (+ changedAt)
- **F5**: Save click with `onSave` returning `[]` → 0 events but button still shows "Saved" flash
- **F6**: After Save click, button text becomes "Saved" / "已保存"; after 1800ms (fake timers), reverts
- **F7**: Reset click with `window.confirm` returning false → no resetAllPrefs call, no onReset call
- **F8**: Reset click with confirm true + no `onReset` prop → calls default `resetAllPrefs()` (verify via spy on `emitWebEvent`)

### SettingsModule (10)
- **M1**: Renders root `.module.module-settings > .settings-shell.panel`
- **M2**: Renders 13 sidebar entries (`.list-row`) inside 4 `.settings-group` containers
- **M3**: Sidebar entry order matches `paneRegistry`
- **M4**: Default active pane = "account" (its row has `data-active="true"`)
- **M5**: Clicking "appearance" entry → active changes; "appearance" row now `data-active="true"`, "account" row not
- **M6**: Detail container renders the active pane's `render({lang})` output
- **M7**: All 13 entries clickable in succession; each switches active without errors
- **M8**: Sidebar entries bilingual — EN labels per `I18N.en.settings.<key>`
- **M9**: Switching lang from EN → ZH re-renders all 13 labels
- **M10**: Settings title heading shows `I18N.<lang>.settings.title`

### registration (3)
- **RG1**: `settingsShellWebModuleRegistration.moduleId === "settings"`, `icon === "sliders"`, `railOrder === 99`, `showInRail === false`
- **RG2**: `children.length === 2`, both with `render: SettingsModuleRoute`
- **RG3**: Rendering the route through `<MemoryRouter>` + `<WebShellProvider>` produces a `<SettingsModule>` instance

### index barrel (3)
- **B1**: `index.ts` re-exports exactly the surface listed in api.md §0 (no extra/missing names)
- **B2**: `import { paneRegistry } from "@repo/plugin-web-settings-shell"` returns an array of length 13
- **B3**: `import { resetAllPrefs } from "@repo/plugin-web-settings-shell"` returns a function

## 4. Cross-vendor verification

This row's seed brief flags cross-vendor verify as queued for ship-time. Test cases that must pass on Codex (gpt-5.5-thinking medium) AND Cursor:

| Concern | Spec(s) | Why |
|---|---|---|
| `setTimeout` Save flash timing | F6 | fake-timer support varies by runner config |
| `window.confirm` stubbing | C1/C2/F7 | global stubbing varies |
| `emitWebEvent` spy semantics | R3/R5/F4/F8 | `vi.mock` hoisting differs across engines |
| `localStorage` jsdom isolation | R1/R2 | clear/cleanup pattern |
| Bilingual rendering | F1/F2/M9 | i18n unit consistency |

## 5. Manual smoke (not automated)

1. `pnpm --filter @repo/web dev` → navigate to `/app/settings` → see 13 sidebar entries.
2. Click each of 13 entries; each switches the right pane; all show placeholder text initially.
3. Inside Appearance pane (placeholder for now): no footer in this row's chassis (chassis exports `<SettingsFooter>` for siblings, but does not render one in the placeholder pane bodies).
4. In DevTools Application tab → set `xai_theme = "dark"` via direct setPref, then on Settings page (Reset button accessible only when a sibling pane invokes `<SettingsFooter>` — for this row, manual smoke just verifies the chassis renders).

> Smoke step 3+4 acknowledge: in this row, the chassis is "wired but minimally populated" — sibling rows fill in the visible Save/Reset flow. The unit + integration suite above is what gates this row.

## 6. CI gate

| Gate | Command | Pass criteria |
|---|---|---|
| Lint | `pnpm --filter @repo/plugin-web-settings-shell lint` | exit 0 (`--max-warnings 0`) |
| Typecheck | `pnpm --filter @repo/plugin-web-settings-shell typecheck` | exit 0 |
| Unit | `pnpm --filter @repo/plugin-web-settings-shell test` | exit 0; all listed specs pass |
| Web build | `pnpm --filter @repo/web build` | exit 0 with new registration wired |
| Web lint | `pnpm --filter @repo/web lint` | exit 0 (shellRegistrations edit stays clean) |
