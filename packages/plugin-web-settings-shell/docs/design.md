# Design Snapshot — @repo/plugin-web-settings-shell

> **Row**: xai-web-settings-shell (#21, W4a · chassis)
> **Package**: `@repo/plugin-web-settings-shell` (new runtime package at `packages/plugin-web-settings-shell/`)
> **Docs host**: `packages/xai-web-settings-shell/docs/`
> **Date**: 2026-05-23
> **Author**: feature-plan (Claude Opus 4.7 1M)

---

## 1. What this package is

The Settings outer chassis for XAI Web Console. Owns the 13-pane sidebar + pane-switch state + the atomic components (`Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter`) that sibling rows #22 / #23 / #24 consume to render their pane content.

This row ships a **functional but mostly empty** Settings module — every sidebar entry is clickable and renders a place­holder pane; sibling rows replace the placeholders with real content as they ship.

## 2. Axis B1 — One-paragraph summary

`@repo/plugin-web-settings-shell` exports a top-level `<SettingsModule lang>` component plus a `paneRegistry: Pane[]` array that sibling rows extend (via re-export + slot composition pattern documented in api.md). The chassis renders a left-side sidebar listing all 13 pane ids grouped per DESIGN.md §4.12, and a right-side detail container that calls `activePane.render({ lang })`. Atomic UI primitives (`Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter`) are exported for siblings to consume. The chassis also exports `resetAllPrefs(): void` which iterates `PREF_REGISTRY`, removes every `xai_*` key, then emits `web:settings:preference-changed` for each canonical preference at its default value — giving live modules a single subscription point for "user reset their settings".

## 3. Dependency overview

```
@repo/plugin-web-settings-shell
├─ @repo/core (types only)
├─ @repo/plugin-web-tokens (useI18n, Lang)
├─ @repo/plugin-web-storage (usePref, removePref, PREF_REGISTRY)
├─ @repo/xai-web-event-bus (emitWebEvent)
└─ @repo/xai-web-shell (WebModuleSlotRegistration, useWebShell, WebShellIconName)
```

No new top-level packages introduced (ADR-0007 §S4 rule 9 honored).

## 4. Architecture

```
                 ┌──────────────────────────────────────────────────┐
                 │            <SettingsModule lang>                 │
                 │  (this row — chassis only)                       │
                 │                                                  │
                 │  ┌─────────────────────┐  ┌────────────────────┐│
                 │  │ <SettingsSidebar/>  │  │  <SettingsDetail/> ││
                 │  │  13 entries × 4 grp │  │  active.render({}) ││
                 │  │  click → setActive  │  │                    ││
                 │  └─────────────────────┘  └────────────────────┘│
                 │                                                  │
                 │  paneRegistry: Pane[] (13 entries, all placeholder │
                 │   in this row; sibling rows REPLACE entries)     │
                 └──────────────────────────────────────────────────┘

                 Atomic exports (consumed by sibling rows):
                  ── <Toggle on onChange/>
                  ── <SettingRow label desc>children</SettingRow>
                  ── <SectionBlock>children</SectionBlock>
                  ── <SettingsFooter onSave onReset/> (emits the events)
                  ── resetAllPrefs() utility
                  ── type Pane, PaneRenderProps, SettingsPaneId
```

## 5. State + side-effects

| Concern | Implementation |
|---|---|
| Active pane id | Local `useState<SettingsPaneId>("account")` in `<SettingsModule>` |
| Bilingual labels | `useI18n(lang).s("settings.<key>")` per sidebar entry |
| Save action | `<SettingsFooter onSave>` callback returns `WebPreferenceChange[]`; chassis emits one `web:settings:preference-changed` event per item with `changedAt: new Date().toISOString()` then sets `saved=true` for 1800ms |
| Reset action | `<SettingsFooter onReset>` defaults to `resetAllPrefs()`; wrapped in `window.confirm` prompt (bilingual via `useI18n`) |
| `resetAllPrefs()` semantics | Iterate `PREF_REGISTRY` entries (excluding `proposed: true`) → for each entry where `key.startsWith("xai_")`, call `removePref(entry.key)`; then iterate the 7 canonical WebPreferenceKey values → emit `web:settings:preference-changed` with that key + its registry default |
| Live re-apply on Reset | NOT done by chassis (`apply*` helpers live in `apps/web/src/App.tsx` and respond to `usePref` value changes via the same-tab bus — since `removePref` publishes via the storage same-tab bus, listeners auto-update). The emitted events are the *broadcast layer* for non-pref consumers. |

## 6. Frozen assumptions

(Identical to discovery-review §5 — re-stated for breakpoint continuity.)

1. 10 of 13 panes ship as placeholders in this row.
2. Atomic API frozen at this row's commit.
3. `PaneRenderProps = { lang: Lang }` only.
4. Reset targets every PREF_REGISTRY key starting with `xai_`.
5. No new storage keys in this row.
6. Reuses existing `web:settings:preference-changed` event channel.
7. Save UI flash duration: 1800ms.
8. Sidebar 4-group structure per source.
9. `moduleId: "settings"`, `showInRail: false`, `railOrder: 99`, `icon: "sliders"`.
10. Initial active pane: `"account"`.
11. No URL routing for active pane.

## 7. JSX → TSX port rules applied (ADR-0007 §S5)

| Rule | Action |
|---|---|
| R1 strict typing | `SettingsPaneId` is a string-literal union, no `string` widening |
| R2 no `any` | `@typescript-eslint/no-explicit-any: error` in package eslint config |
| R3 explicit return types | All exported components return `React.ReactElement` |
| R4 props typed | `*Props` interfaces in `src/types.ts` |
| R5 hooks typed | `useState<SettingsPaneId>("account")`, `useI18n(lang)` |
| R6 no implicit any | tsconfig `strict: true` (extends `@repo/typescript-config/react-library.json`) |
| R7 prefer const | All component-local `let` removed |
| R8 no DOM globals | `window.confirm` wrapped in `confirmAction(message)` helper so a test can stub it |
| R9 events typed | Click handlers typed `React.MouseEventHandler<HTMLButtonElement>` |
| R10 i18n pure-fn | All bilingual strings via `useI18n(lang).s(path)` — no `lang === "zh" ? ... : ...` ternaries leak into JSX |

## 8. CSS strategy

Port `web design/layout.css` rules scoped under `.module-settings`:
- `.settings-shell.panel` (outer 2-col grid)
- `.settings-sidebar` + `.settings-h` + `.settings-group` + `.list-row[data-active]`
- `.settings-detail` (right column)
- `.setting-row` + `.sr-text` + `.sr-label` + `.sr-desc` + `.sr-ctrl`
- `.setting-block`
- `.toggle` + `.toggle.on` + `.toggle-knob`
- `.pane-footer` + `.pane-save.is-saved`

CSS is imported once globally via `src/index.ts` side-effect (`import "./styles.css"`) per the pattern used by `@repo/plugin-web-statistics`.

## 9. Test strategy summary

Full strategy in `test.md`. Highlights:
- **Unit**: predicates for `SettingsPaneId`, atom-level snapshot-free behavioral tests, `resetAllPrefs` mutation tests (mock `localStorage` + spy on `emitWebEvent`).
- **Integration**: `<SettingsModule>` smoke — clicking each of 13 sidebar entries switches the rendered pane, Save fires N events, Reset clears keys + fires 7 events.
- **No JSDOM canvas required** — no `<canvas>` in chassis.
- **Coverage target**: ≥ 90% lines (matches statistics peer).

## 10. Phase plan summary (full detail in `dev_log.md` Phase Plan)

3 phases — matches statistics / dashboard-grid peer pattern.

| Phase | Scope | Acceptance |
|---|---|---|
| P1 | Package scaffolding + pure layer (`types.ts`, `resetAllPrefs`, `paneRegistry`, atom interfaces, `confirmAction`) + atom-level tests | `pnpm --filter @repo/plugin-web-settings-shell lint test typecheck` exits 0 |
| P2 | Components (`Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter`, `SettingsSidebar`, `SettingsDetail`, `SettingsModule`) + CSS port + composition tests | Settings module renders 13 entries + Save/Reset behavior validated |
| P3 | `settingsShellWebModuleRegistration` + `apps/web/shellRegistrations.tsx` edit + `apps/web/package.json` dep edit + full integration test | `pnpm --filter @repo/web build` passes; Settings reachable at `/app/settings` |

Each phase commits independently; commit prefix `feat(plugin-web-settings-shell)` for P1/P2 and `feat(web): wire settings-shell registration` for P3.

## 11. Risk overview

(Mirrors discovery-review §4 — see that doc for mitigations.)

- Sibling rows may need extra `PaneRenderProps` fields → frozen at `{ lang }` this row, escalate via ADR if violated
- Co-ownership of `web:settings:preference-changed` channel → documented in api.md §3
- `window.confirm` UX → acceptable v1
- Empty chassis appearance → 13 functional placeholder panes provided
- `webShellModuleRegistrations` single-line swap → low-conflict (no sibling concurrent)

## 12. References

- Source: `web design/module-settings.jsx`
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S7 / §S8
- Peer (registration pattern): `packages/plugin-web-statistics/src/registration.tsx`
- Peer (atom pattern + slot reg): `packages/plugin-web-meditation/`
- API: `packages/xai-web-settings-shell/docs/api.md`
- Tests: `packages/xai-web-settings-shell/docs/test.md`
