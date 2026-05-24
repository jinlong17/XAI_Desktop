# Test Strategy — plugin-web-settings-rest

> **Package**: `@repo/plugin-web-settings-rest`
> **Test runner**: Vitest 3 + jsdom + @testing-library/react
> **Status**: SHIPPED — all 81 tests pass

---

## §1 Environment

- `vitest.config.ts`: jsdom environment
- `vitest.setup.ts`: `@testing-library/jest-dom/vitest` + `afterEach` localStorage.clear
- All tests in `src/__tests__/`

## §2 Mock Strategy

- **localStorage**: real jsdom localStorage (cleared afterEach)
- **emitWebEvent**: `vi.spyOn(@repo/xai-web-event-bus, "emitWebEvent")` per test
- **dialog**: jsdom does not implement `showModal()`/`close()`; both calls are
  guarded by `typeof dialog.method === "function"` in the component

## §3 Test Matrix

### P1 — Scaffold + 5 simple panes

| Test ID | File | Description |
|---------|------|-------------|
| B1 | index-barrel.test.ts | All 11 panes exported with correct ids |
| B2 | index-barrel.test.ts | restPanesById has 11 entries |
| B3 | index-barrel.test.ts | applyRestPanesToRegistry exported as function |
| NH1 | no-hex-literals.test.ts | No hex literals in src ts and tsx files |
| AC1 | accountPane.test.tsx | Renders without error |
| AC2 | accountPane.test.tsx | ZH shows Chinese name |
| AC3 | accountPane.test.tsx | EN shows English name |
| AC4 | accountPane.test.tsx | Delete Account button present |
| AC5 | accountPane.test.tsx | Delete opens dialog |
| AC6 | accountPane.test.tsx | Cancel does not emit event |
| AC7 | accountPane.test.tsx | Confirm emits event exactly once |
| AC8 | accountPane.test.tsx | id + icon + i18nKey correct |
| PR1 | premiumPane.test.tsx | Renders without error |
| PR2 | premiumPane.test.tsx | Bilingual headline |
| PR3 | premiumPane.test.tsx | id + icon + i18nKey correct |
| CL1 | collaboratePane.test.tsx | Renders without error |
| CL2 | collaboratePane.test.tsx | EN labels present |
| CL3 | collaboratePane.test.tsx | ZH labels present |
| CL4 | collaboratePane.test.tsx | Toggle persists pref |
| HK1 | hotkeysPane.test.tsx | Renders without error |
| HK2 | hotkeysPane.test.tsx | 10 rows rendered |
| HK3 | hotkeysPane.test.tsx | id + icon + i18nKey correct |
| AB1 | aboutPane.test.tsx | Renders without error |
| AB2 | aboutPane.test.tsx | Shows version string |
| AB3 | aboutPane.test.tsx | Bilingual description |
| AB4 | aboutPane.test.tsx | id + icon + i18nKey correct |

### P2 — 5 mid-weight panes

| Test ID | File | Description |
|---------|------|-------------|
| SL1 | smartListsPane.test.tsx | Renders without error |
| SL2 | smartListsPane.test.tsx | 12 rows rendered |
| SL3 | smartListsPane.test.tsx | EN section headers |
| SL4 | smartListsPane.test.tsx | ZH section headers |
| SL5 | smartListsPane.test.tsx | Changing select persists pref |
| SL6 | smartListsPane.test.tsx | id + icon + i18nKey correct |
| NF1 | notificationsPane.test.tsx | Renders without error |
| NF2 | notificationsPane.test.tsx | Master toggle present |
| NF3 | notificationsPane.test.tsx | EN labels present |
| NF4 | notificationsPane.test.tsx | ZH labels present |
| NF5 | notificationsPane.test.tsx | Toggle persists notif_enabled |
| NF6 | notificationsPane.test.tsx | Sound select persists notif_done_sound |
| NF7 | notificationsPane.test.tsx | Quiet hours toggle shows time inputs |
| NF8 | notificationsPane.test.tsx | Time inputs hidden when quiet=false |
| NF9 | notificationsPane.test.tsx | id + icon + i18nKey correct |
| DT1 | dateTimePane.test.tsx | Renders without error |
| DT2 | dateTimePane.test.tsx | Start week select present |
| DT3 | dateTimePane.test.tsx | EN labels present |
| DT4 | dateTimePane.test.tsx | ZH labels present |
| DT5 | dateTimePane.test.tsx | Changing start week persists pref |
| DT6 | dateTimePane.test.tsx | id + icon + i18nKey correct |
| MP1 | morePane.test.tsx | Renders without error |
| MP2 | morePane.test.tsx | EN labels present |
| MP3 | morePane.test.tsx | ZH labels present |
| MP4 | morePane.test.tsx | SettingRow label is plain string |
| MP5 | morePane.test.tsx | Language select read-only |
| MP6 | morePane.test.tsx | Window type select persists pref |
| MP7 | morePane.test.tsx | 3 template cards rendered |
| MP8 | morePane.test.tsx | Reset clears More keys, leaves others |
| MP9 | morePane.test.tsx | ZH template names |
| MP10 | morePane.test.tsx | id + icon + i18nKey correct |
| IN1 | integrationsPane.test.tsx | 17 integration cards rendered |
| IN2 | integrationsPane.test.tsx | 3 section headers rendered |
| IN3 | integrationsPane.test.tsx | EN section headers |
| IN4 | integrationsPane.test.tsx | ZH section headers |
| IN5 | integrationsPane.test.tsx | Card click is no-op (no console.warn) |
| IN6 | integrationsPane.test.tsx | No emitWebEvent on card click |

### P3 — Sticky pane + host wire-up

| Test ID | File | Description |
|---------|------|-------------|
| ST1 | stickyPane.test.tsx | Renders without error |
| ST2 | stickyPane.test.tsx | 13 color swatch buttons rendered |
| ST3 | stickyPane.test.tsx | 12 non-random swatches use var(--sticky-note-color-id) |
| ST4 | stickyPane.test.tsx | Random swatch uses conic-gradient |
| ST5 | stickyPane.test.tsx | No hex literals in swatch inline styles |
| ST6 | stickyPane.test.tsx | Clicking swatch persists xai_pref_sticky_color |
| ST7 | stickyPane.test.tsx | 4 spacing buttons rendered |
| ST8 | stickyPane.test.tsx | Clicking spacing button persists pref |
| ST9 | stickyPane.test.tsx | ZH font size options |
| ST10 | stickyPane.test.tsx | id + icon + i18nKey correct |
| RP1 | restPanesById.test.ts | Contains exactly 11 entries |
| RP2 | restPanesById.test.ts | Each entry has correct id, icon, i18nKey |
| RP3 | restPanesById.test.ts | Each pane render is a function |
| AP1 | applyRestPanesToRegistry.test.ts | Returns same length as input |
| AP2 | applyRestPanesToRegistry.test.ts | Substitutes all 11 owned pane ids |
| AP3 | applyRestPanesToRegistry.test.ts | Does not substitute appearance/features |
| AP4 | applyRestPanesToRegistry.test.ts | Idempotent |
| AP5 | applyRestPanesToRegistry.test.ts | Preserves original order |

## §4 Acceptance Criteria

1. `pnpm --filter @repo/plugin-web-settings-rest lint` exits 0 (`--max-warnings 0`)
2. `pnpm --filter @repo/plugin-web-settings-rest typecheck` exits 0
3. All 81 tests pass (15 test files)
4. `pnpm --filter @repo/plugin-web-storage test` passes (parity test +37 keys)
5. `pnpm --filter @repo/core test` passes (EventMap declaration)
6. `pnpm --filter @repo/web build` succeeds (new dep + 11 composition cases)
