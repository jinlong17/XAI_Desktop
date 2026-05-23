# Discovery Review — xai-web-settings-shell

> **Feature**: xai-web-settings-shell (roadmap row #21, W4a · chassis)
> **Date**: 2026-05-23
> **Author**: feature-plan (Claude Opus 4.7 1M)
> **Seed**: `docs/reviews/xai-web-settings-shell/20260523-roadmap-seed.md`

---

## 1. Requirement Restate

Port the **Settings outer chassis** from `web design/module-settings.jsx` (1061 LOC source) into a typed Vite+React 19 package `@repo/plugin-web-settings-shell`. The chassis is the foundation for three sibling rows (#22 appearance / #23 features-panel / #24 rest) — only the chassis + atoms ship in this row; pane content is provided by the siblings.

**Scope (this row)**:
- `SettingsModule` outer chassis (13-pane sidebar + pane-switch navigation + per-pane footer slot)
- Atomic components: `Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter` (Save & apply + Reset to defaults pattern from source line 635-650)
- `Pane` interface + `paneRegistry` extensibility seam (so sibling rows register their panes)
- Save & apply MUST broadcast via `web:settings:preference-changed` (existing typed channel in `@repo/core/types/events`)
- Reset to defaults MUST clear every `xai_pref_*` key + re-apply defaults via the bus
- 13-pane sidebar bilingual (EN/ZH) via `useI18n` from `@repo/plugin-web-tokens`
- Module registers via `WebModuleSlotRegistration` slot pattern from `@repo/xai-web-shell` (icon=`sliders`, moduleId=`settings`, showInRail=`false`)

**Out of scope (handled by sibling rows)**:
- Account / Premium / Smart Lists / Notifications / Date&Time / More / Integrations / Collaborate / Sticky Note / Hotkeys / About pane content — row #24
- Appearance pane (theme/density/font/accent/railPos/bgTone controls) — row #22
- Features pane (8 module on/off + SVG thumbnails) — row #23

## 2. Decision Headline

**The defining call** — *how do sibling rows attach pane content to the chassis without prop-drilling theme/lang/setters down 13 levels?* — is decided as **"slot pattern via paneRegistry"**: the chassis exposes a typed `Pane` interface (`{ id: SettingsPaneId; icon: WebShellIconName; i18nKey: string; render(props: PaneRenderProps): ReactElement }`) and a `paneRegistry` array consumers extend. The chassis renders sidebar + active-pane container; pane modules from sibling rows export pane objects that the chassis assembles. `PaneRenderProps` carries `lang` only (no theme/density/font/etc — those siblings read directly from `usePref` per pref-registry contract).

**Atomic components are the only public surface** that sibling rows need to consume directly: `Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter`. Each has a tight, stable typed API that won't churn as sibling rows fill in pane content.

**Save & apply broadcast**: when `SettingsFooter` Save fires, it calls the consumer-provided `onSave(): WebPreferenceChange[]` callback (collected by the pane) — chassis then iterates and calls `emitWebEvent('web:settings:preference-changed', { ...change, changedAt: new Date().toISOString() })` per change. This keeps pane modules unaware of the event bus while still allowing live-broadcast.

**Reset to defaults**: chassis exposes `resetAllPrefs()` utility that:
1. Iterates `PREF_REGISTRY` (from `@repo/plugin-web-storage`) for entries in category `"appearance"` + `"pet"` + `"module"` + `"pref"` (any category whose key starts with `xai_`)
2. Calls `removePref(key)` for each
3. For each canonical preference (`theme`/`density`/`fontScale`/`accentHue`/`railPos`/`bgTone`/`lang`), emits `web:settings:preference-changed` with the registry default value so live modules pick up the reset
4. The action is wrapped in a confirm dialog (browser `window.confirm` for v1; design.md notes a future custom-modal upgrade)

**No new EventMap entries.** Reuses the existing `web:settings:preference-changed` channel declared in `packages/core/src/types/events.ts` line 193 (owner annotation already says `xai-web-settings-appearance row #22`; chassis is co-owner since it's the orchestrator).

**Concurrency**: this row is the W4a chassis — sequential dispatch (no siblings concurrent per task header). Sibling rows #22/#23/#24 dispatch after this row reaches READY_TO_SHIP per manifest dependency edges.

## 3. Alternatives Considered

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| **A. Slot pattern with paneRegistry array (CHOSEN)** | No prop-drilling; sibling rows extend cleanly; typed `Pane` interface | One indirection (consumer assembles array) | ✅ |
| B. Render-prop on `<SettingsModule>` | Sibling rows pass per-section renderers | 13 props × 3 siblings = prop bloat | ❌ |
| C. React context inside SettingsModule per pane | Hidden coupling | Lost type safety across consumer boundaries | ❌ |
| D. Each sibling row ships its own full `SettingsModule` clone | Total isolation | Massive duplication, sidebar drift | ❌ |

For Save semantics:

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| **A. onSave returns WebPreferenceChange[] (CHOSEN)** | Pane stays pure; chassis owns emit | Pane must collect changes locally first | ✅ |
| B. Pane emits directly | Decentralized | Pane modules learn event-bus surface | ❌ |
| C. Save = no-op (just visual) | Simplest | Violates seed brief constraint (Save MUST broadcast) | ❌ |

For Reset:

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| **A. Chassis-owned `resetAllPrefs()` utility (CHOSEN)** | Centralized; reuses PREF_REGISTRY | Tight coupling to plugin-web-storage | ✅ |
| B. Each pane resets its own keys | Loose coupling | "All" reset becomes coordination problem | ❌ |
| C. `localStorage.clear()` | Trivially simple | Wipes non-`xai_*` keys (third-party libs) | ❌ |

## 4. Risk & Trade-off

| Risk | Mitigation |
|---|---|
| Sibling rows #22/#23/#24 may need additional `PaneRenderProps` fields | Discovery review locks `PaneRenderProps = { lang: Lang }`; siblings read other prefs via `usePref`. If siblings need MORE, that's a chassis API change → SemVer bump → ADR follow-up. |
| `web:settings:preference-changed` channel was originally owned by row #22 — co-ownership ambiguity | Documented in api.md: chassis emits on Save / Reset; row #22 emits on direct toggle (legacy live-apply per source). Two emitters, one channel, well-typed payload. |
| `window.confirm` for Reset is UX-rough | v1 acceptable per seed brief (functional > polish); follow-up row may upgrade to custom modal |
| Pane content is rendered by sibling rows that don't exist yet — empty chassis appearance | Provide placeholder pane modules in chassis (one per pane id) so users see "This setting is not yet available" until sibling row ships — chassis remains self-sufficient until siblings land |
| 13-pane sidebar bilingual keys: existing `i18n.ts` already has all `settings.*` keys per `plugin-web-tokens`; verify no missing keys | Discovery confirmed all 13 keys present in `I18N.en.settings` + `I18N.zh.settings` (line 86-105 + 286-304 of plugin-web-tokens/src/i18n.ts) |
| `webShellModuleRegistrations` currently has `placeholder("settings", ...)` at index 13 | Build phase replaces that single line with `settingsShellWebModuleRegistration` import + array entry, same `railOrder: 99` + `showInRail: false` |

## 5. Frozen Assumptions

1. **Pane content gating**: 10 of 13 panes are placeholders in this row (Account/Premium/Smart Lists/Notifications/Date&Time/More/Integrations/Collaborate/Sticky Note/Hotkeys/About) until row #24 lands. Appearance is placeholder until #22 lands. Features is placeholder until #23 lands. All 13 panes are reachable; their content reads `{lang === "zh" ? "此设置面板暂未开放" : "This pane is not yet available."}`.
2. **Atomic API is frozen at this row's commit**: `Toggle`/`SettingRow`/`SectionBlock`/`SettingsFooter` types do not change in #22/#23/#24. Any change requires this row to be re-opened.
3. **`PaneRenderProps = { lang: Lang }`** — all other state read via `usePref` in pane bodies.
4. **Reset target categories**: `appearance` + `shell` + `pet` + `module` + `pref` (every PREF_REGISTRY entry whose key starts with `xai_`). The `xai_pref_*` family is captured by category `"pref"` per `plugin-web-storage` registry.
5. **No new storage keys** in this row. The chassis is pure orchestration over already-registered prefs.
6. **No new EventMap entries.** Reuses `web:settings:preference-changed` (already declared) — no `web:shell:preference-change` channel created.
7. **Save & apply UI flash**: when Save is clicked, the button shows "Saved" / "已保存" with a check icon for 1800ms (port of source line 643-644 `setTimeout`).
8. **Sidebar group structure (4 groups)** matches source line 27-50:
   - Group 1: account, premium
   - Group 2: features, smart_lists, notifications, date_time, appearance, more
   - Group 3: integrations, collaborate, sticky, hotkeys
   - Group 4: about
9. **Module registration**: `moduleId: "settings"`, `icon: "sliders"`, `railOrder: 99`, `showInRail: false`, `i18nKey: "nav.settings"`, `defaultChildPath: ""`, two `children` entries `{ path: "" }` + `{ path: "*" }`.
10. **Initial active pane**: `"account"` (matches source line 25 `useState("account")`).
11. **No URL routing for active pane** — chassis owns `useState` for active pane id, no URL params. A future row may URL-encode the active pane.

## 6. Touched Surfaces

| File | Read | Write | Notes |
|---|---|---|---|
| `packages/plugin-web-settings-shell/**` (new) | — | ✅ create | Runtime package — code + tests |
| `packages/xai-web-settings-shell/docs/*` (new) | — | ✅ create | Documentation (design/api/test/dev_log) |
| `docs/reviews/xai-web-settings-shell/20260523-discovery-review.md` | — | ✅ create | This document |
| `apps/web/src/routes/modules/shellRegistrations.tsx` | ✅ | ✅ edit | Replace `placeholder("settings", "Settings", "sliders", 99, false)` with `settingsShellWebModuleRegistration` (single-line replace + one import) |
| `apps/web/package.json` | ✅ | ✅ edit | Add `"@repo/plugin-web-settings-shell": "workspace:*"` to deps |
| `docs/PLUGIN_MAP.md` | ✅ | ❌ | Not edited — manifest is authoritative |
| `packages/core/src/types/events.ts` | ✅ | ❌ | Reuse existing `web:settings:preference-changed` |

## 7. Dependencies

| Package | Status | Notes |
|---|---|---|
| `@repo/core` | Stable | Reuses `EventMap['web:settings:preference-changed']` |
| `@repo/plugin-web-tokens` | Stable | `useI18n`, `Lang` type, applied tokens |
| `@repo/plugin-web-storage` | Stable | `usePref`, `setPref`, `removePref`, `PREF_REGISTRY` |
| `@repo/xai-web-event-bus` | Stable | `emitWebEvent`, `useWebEventListener` |
| `@repo/xai-web-shell` | Stable | `WebModuleSlotRegistration`, `useWebShell` |

All Stable; no mocks required.

## 8. Acceptance Criteria

1. `pnpm --filter @repo/plugin-web-settings-shell lint` exits 0 (`--max-warnings 0`).
2. `pnpm --filter @repo/plugin-web-settings-shell test` exits 0; all phase tests pass.
3. `pnpm --filter @repo/plugin-web-settings-shell typecheck` exits 0.
4. `pnpm --filter @repo/web build` succeeds with the new registration.
5. Settings module opens at `/app/settings`. All 13 sidebar entries are visible + clickable; selecting each switches the rendered pane.
6. Footer "Save & apply" emits one `web:settings:preference-changed` event per provided change; the button shows "Saved" / "已保存" for 1800ms.
7. Footer "Reset to defaults" clears every `xai_pref_*` key (verified via `localStorage.getItem` post-click) AND emits 7 `web:settings:preference-changed` events (one per canonical preference key — theme/density/fontScale/accentHue/railPos/bgTone/lang) with default values.
8. Sidebar bilingual: switching `lang` from `"en"` → `"zh"` re-renders all 13 entries with ZH labels.
9. Public API in `src/index.ts` exports: `SettingsModule`, `settingsShellWebModuleRegistration`, `Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter`, `resetAllPrefs` + types `SettingsPaneId`, `Pane`, `PaneRenderProps`, `SettingsModuleProps`, `ToggleProps`, `SettingRowProps`, `SectionBlockProps`, `SettingsFooterProps`.
10. Module slot registration appears in `webShellModuleRegistrations` array; `placeholder("settings", ...)` is removed.
11. No deep imports allowed — `eslint-plugin-import` (or boundary rule) blocks `@repo/plugin-web-settings-shell/src/internal/*`.

## 9. Open Questions

None — the seed brief + ADR-0007 §S4 + DESIGN.md §4.12 fully specify the surface.

## 10. References

- Seed brief: `docs/reviews/xai-web-settings-shell/20260523-roadmap-seed.md`
- Source code: `web design/module-settings.jsx` (1061 LOC; SettingsModule + Toggle/SettingRow/SectionBlock lines 23-100 + 1039-1059; AppearancePane footer template lines 635-650)
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map), §S5 (JSX→TSX rules), §S6 (Vite SPA), §S7 (event channels), §S8 (no new storage keys)
- DESIGN.md: §4.12 (Settings — 13 panes enumerated)
- Roadmap: `docs/workflow/roadmap/xai-web-console.md` row #21 (W4a · chassis · sequential dispatch)
- Peer pattern: `packages/plugin-web-statistics/src/registration.tsx` (slot registration model)
- Peer pattern: `packages/plugin-web-meditation/src/` (Topbar+useWebShell hookup)
- Storage registry: `packages/plugin-web-storage/src/internal/registry.ts`
- Event channel: `packages/core/src/types/events.ts` line 193
- Existing i18n: `packages/plugin-web-tokens/src/i18n.ts` lines 86-105 (en) + 286-304 (zh)
