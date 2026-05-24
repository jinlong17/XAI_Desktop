# Test Strategy — @repo/plugin-web-settings-rest

> **Row**: xai-web-settings-rest (#24, W4b · Settings remaining 11 panes)
> **Coverage target**: ≥ 85% lines (long total LOC with decorative subcomponents)
> **Runner**: Vitest (jsdom env) — `pnpm --filter @repo/plugin-web-settings-rest test`

---

## 1. Layers + mock strategy

| Layer | Mock | Note |
|---|---|---|
| `localStorage` | jsdom built-in | `beforeEach: localStorage.clear()` via `vitest.setup.ts` |
| `emitWebEvent` | spy via `vi.mock("@repo/xai-web-event-bus", ...)` | Verify emit count + payload shape only for the delete-confirmed flow |
| `console.warn` | `vi.spyOn(console, "warn")` per test | Verify integration-card click in DEV |
| `import.meta.env.DEV` | not mocked — vitest jsdom default sets DEV=true | Validates the DEV branch; PROD branch covered by a `vi.stubEnv` test |
| `<dialog>` | jsdom 23+ ships `HTMLDialogElement` | If polyfill missing in CI, add `vitest-polyfills.ts` (one-line) — verified locally |
| `useI18n` | NOT mocked — real `@repo/plugin-web-tokens` bundle | Plus per-file `localI18n` for new strings — tested for EN/ZH parity |
| `usePref` / `removePref` / `PREF_REGISTRY` | NOT mocked at integration level | Real `@repo/plugin-web-storage` |
| Chassis atoms (Toggle / SettingRow / SectionBlock / SettingsFooter) | NOT mocked — real `@repo/plugin-web-settings-shell` | This row's contract is to consume them as-is |
| `<canvas>` | n/a | None of the 11 panes uses canvas |

## 2. Test files

| File | Subject | Specs |
|---|---|---|
| `src/__tests__/restPanesById.test.ts` | aggregate map keys + each entry is a `Pane` | RP1..RP3 |
| `src/__tests__/applyRestPanesToRegistry.test.ts` | helper substitution + idempotency | AP1..AP5 |
| `src/__tests__/accountPane.test.tsx` | render + delete-confirm modal open/close + emit on confirm | AC1..AC8 |
| `src/__tests__/premiumPane.test.tsx` | render + EN/ZH parity | PR1..PR3 |
| `src/__tests__/smartListsPane.test.tsx` | tri-state per row + persistence | SL1..SL6 |
| `src/__tests__/notificationsPane.test.tsx` | 8 controls + DND visibility gating | NF1..NF9 |
| `src/__tests__/dateTimePane.test.tsx` | 5 controls + EN/ZH labels | DT1..DT6 |
| `src/__tests__/morePane.test.tsx` | 14 keys + per-pane Reset Default | MP1..MP10 |
| `src/__tests__/integrationsPane.test.tsx` | 17 cards + DEV warn on click + no event emit | IN1..IN6 |
| `src/__tests__/collaboratePane.test.tsx` | 3 live-persist controls | CL1..CL4 |
| `src/__tests__/stickyPane.test.tsx` | 13 swatches + no-hex-in-tsx + active state + grid spacing | ST1..ST10 |
| `src/__tests__/hotkeysPane.test.tsx` | 10 rows, no edit affordance | HK1..HK3 |
| `src/__tests__/aboutPane.test.tsx` | version + bilingual description + links | AB1..AB4 |
| `src/__tests__/no-hex-literals.test.ts` | greps src/**/*.{ts,tsx} for `#[0-9a-fA-F]{3,6}\b` and expects zero | NH1 |
| `src/__tests__/i18n-parity.test.ts` | every per-file `localI18n` entry has matching EN+ZH | I18N1 |
| `src/__tests__/index-barrel.test.ts` | public surface enumeration | B1..B3 |

Plus one host-side integration test in `apps/web/src/__tests__/settingsPaneComposition.test.ts` (added in P3):

| File | Subject | Specs |
|---|---|---|
| `apps/web/src/__tests__/settingsPaneComposition.rest.test.ts` | composeSettingsPaneRegistry returns 11 substituted panes + 1 features pane + 1 appearance placeholder + ids preserved | CP1..CP3 |

## 3. Acceptance specs (numbered)

### restPanesById (3)
- **RP1**: `Object.keys(restPanesById).length === 11`
- **RP2**: Each key is one of the 11 owned `SettingsPaneId` literals (statically narrowed)
- **RP3**: For every key K, `restPanesById[K].id === K` (id parity)

### applyRestPanesToRegistry (5)
- **AP1**: Given the chassis `paneRegistry` (length 13), returns length 13
- **AP2**: For each of the 11 owned ids, the returned entry's `render` is NOT the chassis placeholder render (i.e. rendering doesn't produce text `"This pane is not yet available."`)
- **AP3**: For the 2 non-owned ids (`appearance`, `features`), the returned entry IS the chassis placeholder
- **AP4**: Idempotent — `apply(apply(reg))` deep-equals `apply(reg)` (compared by `id` + render reference)
- **AP5**: Order + length preserved (`returned.map(p => p.id)` matches `reg.map(p => p.id)`)

### accountPane (8)
- **AC1**: Renders `.acct-avatar` SVG + `.acct-name` + `.acct-email` (EN: "Aki Chen", ZH: "百事可爱")
- **AC2**: Renders Sign Out button + Delete Account button
- **AC3**: Delete Account button click opens `<dialog>` (`dialog.open === true` after click)
- **AC4**: Modal Cancel button click closes dialog AND does NOT emit `web:settings:rest:account-delete-confirmed`
- **AC5**: Modal Confirm button click emits exactly 1 `web:settings:rest:account-delete-confirmed` event
- **AC6**: Emit payload has `confirmedAt` parseable by `new Date()`
- **AC7**: Modal Confirm closes the dialog after emit (`dialog.open === false`)
- **AC8**: Modal labels bilingual — EN "Delete account?" / ZH "注销账号？"

### premiumPane (3)
- **PR1**: Renders `.premium-emblem` + bilingual headline
- **PR2**: Renders Upgrade CTA button (no-op click)
- **PR3**: EN/ZH parity (body text switches on lang)

### smartListsPane (6)
- **SL1**: Renders 3 grouped sections (Default lists / Organize / Others)
- **SL2**: All rows render with default visibility (`show` except `assigned`/`wont_do` which start `if-not-empty`)
- **SL3**: Changing a `<select>` value calls `setPref("xai_pref_smart_lists", { ...prev, [id]: newValue })`
- **SL4**: Mode labels bilingual: EN "Show / Show if not empty / Hide" / ZH "显示 / 不空显示 / 隐藏"
- **SL5**: Default `xai_pref_smart_lists` entry registers in PREF_REGISTRY with `codec: "json"`, `default: {}` (verified post-P1)
- **SL6**: `<select>` value reflects persisted state on next mount

### notificationsPane (9)
- **NF1**: Master toggle persists to `xai_pref_notif_enabled`
- **NF2**: Task / Pomo / Habit toggles persist to their respective keys
- **NF3**: Completion-sound `<select>` shows 5 options + persists to `xai_pref_notif_done_sound`
- **NF4**: Default `xai_pref_notif_done_sound === "subtle"`
- **NF5**: Quiet hours toggle off → time-range inputs NOT in DOM
- **NF6**: Quiet hours toggle on → 2 `<input type="time">` visible
- **NF7**: Time inputs persist to `xai_pref_notif_quiet_start` / `xai_pref_notif_quiet_end`
- **NF8**: Default time-range = `"22:00"` / `"07:00"` (matches source)
- **NF9**: Section headers bilingual ("Notification types" / "Completion sound" / "Do not disturb" vs "提醒类型" / "完成音效" / "勿扰")

### dateTimePane (6)
- **DT1**: Start-week `<select>` shows 3 options (Mon/Sun/Sat); persists to `xai_pref_dt_start_week`
- **DT2**: 4 toggles persist to their 4 keys (`xai_pref_dt_lunar`/`xai_pref_dt_week_numbers`/`xai_pref_dt_holidays`/`xai_pref_dt_timezone`)
- **DT3**: Time-zone toggle row has a bilingual description (source line 483)
- **DT4**: All defaults = true (per source line 450-454)
- **DT5**: EN labels: "Start week on" / "Show Lunar Calendar" / "Show Week Numbers (W)" / "Show Holidays" / "Time Zone"
- **DT6**: ZH labels: "周开始" / "显示农历" / "显示周数 (W)" / "显示节假日" / "时区"

### morePane (10)
- **MP1**: Language `<select>` is a single read-only option "follow system" / "跟随系统"
- **MP2**: Window-type select persists to `xai_pref_more_win_type`
- **MP3**: Smart Recognition: Date Recognition toggle persists to `xai_pref_more_date_recognition`
- **MP4**: Smart Recognition: Tag Recognition inline-checkbox row uses `<SettingRow label={...string}>` with checkbox in `children` (NOT in label — see design.md §6.1)
- **MP5**: Smart Recognition: URL Parsing toggle persists to `xai_pref_more_url_parse`
- **MP6**: 6 Task Default `<select>` controls (Default Date / Default Reminders (Due) / Default Reminders (All day) / Default Priority / Default Tag / Default List) each persists to its own key
- **MP7**: Add-to + Overdue-at selects persist to `xai_pref_more_add_to` / `xai_pref_more_overdue_at`
- **MP8**: "Reset Default" link click → calls `removePref` for the 14 More-owned keys + leaves OTHER row's keys (e.g. `xai_pref_notif_enabled`) untouched
- **MP9**: Task Template grid renders 3 cards from `TEMPLATES`; items bilingual
- **MP10**: Reset Default does NOT call `resetAllPrefs` from chassis (verified by spy returning 0 invocations on `removePref` for non-More keys)

### integrationsPane (6)
- **IN1**: 3 sections rendered with headers (EN "Featured" / "Calendar" / "Integrate" — ZH "精选" / "日历" / "集成")
- **IN2**: Total of 17 `.int-card` buttons (3 + 10 + 4)
- **IN3**: Each card has `.int-logo` background = the spec color + `.int-name` text
- **IN4**: Card click in DEV calls `console.warn` once with the card id; no event emit; no setPref call
- **IN5**: Card click in PROD (via `vi.stubEnv("DEV", false)`) is a no-op (`console.warn` not called; no event emit)
- **IN6**: `vi.spyOn(emitWebEvent)` receives 0 calls from this pane

### collaboratePane (4)
- **CL1**: 3 controls render (Show avatars / Default share / Mention notify)
- **CL2**: Each control's mutation persists to the corresponding `xai_pref_collab_*` key
- **CL3**: Default-share select has 3 options (Can comment / Can edit / View only) — bilingual
- **CL4**: Defaults: `xai_pref_collab_show_avatars=true`, `xai_pref_collab_default_share="comment"`, `xai_pref_collab_mention_notify=true`

### stickyPane (10)
- **ST1**: Renders 13 `.sn-sw` buttons
- **ST2**: 12 of 13 buttons have inline style starting with `"background: var(--sticky-note-color-"`
- **ST3**: The 13th button (`random`) has inline style starting with `"background: conic-gradient(`
- **ST4**: Clicking a swatch sets `xai_pref_sticky_color` to that id
- **ST5**: Default color = `"sun"`
- **ST6**: Font-size `<select>` has 4 options + persists to `xai_pref_sticky_font` (default `"large"`)
- **ST7**: Pin-by-default toggle persists to `xai_pref_sticky_pin_default` (default `true`)
- **ST8**: Restore-default-size toggle persists to `xai_pref_sticky_restore_size` (default `false`)
- **ST9**: Grid-spacing has 4 buttons (None / Normal / Large / Extra-Large); click persists to `xai_pref_sticky_grid_spacing`
- **ST10**: Active swatch shows `data-active="true"`

### hotkeysPane (3)
- **HK1**: Renders 10 `<li.hk-row>` entries
- **HK2**: No `<input>` / `<button>` / "edit" affordance (read-only)
- **HK3**: Each row's combo splits into `<kbd>` elements (e.g. `⌘ ⇧ A` → 3 kbds)

### aboutPane (4)
- **AB1**: Renders `XAI` mark + heading
- **AB2**: Version text contains `"v 1.2.0"` and `"2026.05.23"`
- **AB3**: Description bilingual (EN: "A focused, bilingual productivity workspace." / ZH: "一款轻盈、专注、面向中英双语用户的生产力工作台。")
- **AB4**: 4 link buttons render (Changelog / Privacy / Terms / Feedback — bilingual)

### no-hex-literals (1)
- **NH1**: Reading every `.ts` / `.tsx` file under `src/` and matching against `/#[0-9a-fA-F]{3,6}\b/` returns ZERO matches. (Only `src/styles.css` may contain hex; that's allowed by the constraint.)

### i18n-parity (1)
- **I18N1**: Iterate every per-file `localI18n` object — every EN key has a ZH twin and vice versa

### index-barrel (3)
- **B1**: `index.ts` re-exports exactly the surface listed in api.md §0 (no extra/missing names)
- **B2**: `restPanesById` is an object with 11 keys
- **B3**: `applyRestPanesToRegistry` is a function

### composeSettingsPaneRegistry (3 — host-side, P3)
- **CP1**: After P3 wiring, `composeSettingsPaneRegistry()` returns 13 panes
- **CP2**: Each of the 11 rest panes is substituted (verified by `id` + non-placeholder render)
- **CP3**: `appearance` placeholder still present (until row #22 lands)

## 4. Cross-vendor verification

Per row #21/#23 precedent. Test cases that must pass on Codex (gpt-5.5-thinking medium) AND Cursor:

| Concern | Spec(s) | Why |
|---|---|---|
| Native `<dialog>` showModal/close | AC3, AC7 | jsdom version differs |
| `emitWebEvent` spy semantics | AC5, IN6 | `vi.mock` hoisting differs |
| `import.meta.env.DEV` toggling | IN4, IN5 | `vi.stubEnv` API |
| `localStorage` jsdom isolation | SL3, NF1, ST4 | clear/cleanup pattern |
| Bilingual rendering | AC8, NF9, DT5/DT6, AB3 | i18n unit consistency |
| Hex-literal regex sweep | NH1 | Node fs vs Vite import.meta.glob |
| Composition idempotency | AP4 | object identity vs deep-equal |

## 5. Manual smoke (not automated)

1. `pnpm --filter @repo/web dev` → navigate to `/app/settings`.
2. For each of the 11 sidebar entries, click it; the right pane shows non-placeholder content matching the source PRD §4.12.
3. Open Account → click "Delete Account" → modal appears → click "Cancel" → modal closes, no toast. Re-open → click "Delete account" (confirm) → modal closes, no toast (declaration-only emit).
4. Open Sticky Note → click each of 13 swatches → active state moves; reload page → last selection persists.
5. Open More → click "Reset Default" → all 14 More-owned controls revert; Smart Lists settings (other pane) remain unchanged.
6. Open Integrations → click any card → DevTools console shows `[settings-rest] integration card is a placeholder <id>`.
7. Switch lang EN → ZH via topbar; every visible label translates.
8. Open Hotkeys → confirm no edit affordance, 10 rows visible.

## 6. CI gate

| Gate | Command | Pass criteria |
|---|---|---|
| Lint | `pnpm --filter @repo/plugin-web-settings-rest lint` | exit 0 (`--max-warnings 0`) |
| Typecheck | `pnpm --filter @repo/plugin-web-settings-rest typecheck` | exit 0 |
| Unit | `pnpm --filter @repo/plugin-web-settings-rest test` | exit 0; all listed specs pass |
| Web typecheck | `pnpm --filter @repo/web check-types` | exit 0 |
| Web build | `pnpm --filter @repo/web build` | exit 0 with new dep + 11 substitutions |
| Web lint | `pnpm --filter @repo/web lint` | exit 0 (settingsPaneComposition + package.json edits stay clean) |
| Storage parity | `pnpm --filter @repo/plugin-web-storage test` | exit 0 — parity-design-md.test.ts updated to include the 37 new keys |
