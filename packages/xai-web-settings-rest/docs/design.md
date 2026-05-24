# Design Snapshot — @repo/plugin-web-settings-rest

> **Row**: xai-web-settings-rest (#24, W4b · Settings remaining 11 panes)
> **Package**: `@repo/plugin-web-settings-rest` (new runtime package at `packages/plugin-web-settings-rest/`)
> **Docs host**: `packages/xai-web-settings-rest/docs/`
> **Date**: 2026-05-23
> **Author**: feature-plan (Claude Opus 4.7 1M)

---

## 1. What this package is

The sibling pane content for 11 of the 13 Settings panes: Account, Premium, Smart Lists, Notifications, Date & Time, More, Integrations, Collaborate, Sticky Note, Hotkeys, About. Consumes the chassis from row #21 (`@repo/plugin-web-settings-shell`) via the `Pane` slot pattern; substituted into the host's composed pane registry via the line-disjoint seam created by row #23.

The remaining 2 panes (Appearance #22 + Features #23) are owned by sibling rows and are NOT this row's concern.

## 2. Axis B1 — One-paragraph summary

`@repo/plugin-web-settings-rest` exports 11 `Pane` objects (one per pane id) plus a single `restPanesById: Record<SettingsPaneId, Pane>` map for callers that prefer table lookup. Each pane's `render({ lang })` returns a TSX subtree built from chassis atoms (`<SettingRow>`, `<Toggle>`, `<SectionBlock>`, `<SettingsFooter>`) plus pane-specific subcomponents (e.g. `<DeleteAccountConfirmModal>`, `<StickyColorPalette>`, `<HotkeysTable>`, `<IntegrationCardGrid>`). All persistable state binds to `xai_pref_*` registry entries via `usePref`. The Account pane's delete button opens a bilingual native `<dialog>` and emits a typed `web:settings:rest:account-delete-confirmed` local-bus event on confirm (declaration-only; no consumer in this row). Sticky-note 13-color palette is sourced from per-row `--sticky-note-color-<id>` OKLCH vars declared in this package's scoped `src/styles.css` — never from hex literals or shared tokens.css. Integrations cards are placeholders (DEV `console.warn` on click; PROD no-op). Hotkeys table is read-only. Host wiring is a single switch-case extension to `apps/web/src/routes/modules/settingsPaneComposition.ts`.

## 3. Dependency overview

```
@repo/plugin-web-settings-rest
├─ @repo/core (types only — one new EventMap declaration)
├─ @repo/plugin-web-tokens (useI18n, Lang)
├─ @repo/plugin-web-storage (usePref, setPref, removePref, PREF_REGISTRY)
├─ @repo/xai-web-event-bus (emitWebEvent — only used by delete-confirm flow)
├─ @repo/xai-web-shell (WebShellIconName — type-only)
└─ @repo/plugin-web-settings-shell (Pane, PaneRenderProps, Toggle, SettingRow, SectionBlock, SettingsFooter)
```

No new top-level packages introduced (ADR-0007 §S4 rule 9 honored).

## 4. Architecture

```
                ┌──────────────────────────────────────────────────────┐
                │   @repo/plugin-web-settings-rest                     │
                │                                                      │
                │   ┌──────────────────────────────────────────────┐   │
                │   │  Public surface (src/index.ts)               │   │
                │   │  ── restPanesById: Record<SettingsPaneId,Pane>│   │
                │   │  ── accountPane, premiumPane, smartListsPane,│   │
                │   │     notificationsPane, dateTimePane, morePane,│   │
                │   │     integrationsPane, collaboratePane,        │   │
                │   │     stickyPane, hotkeysPane, aboutPane        │   │
                │   │  ── applyRestPanesToRegistry(reg) helper      │   │
                │   └──────────────────────────────────────────────┘   │
                │                                                      │
                │   per-pane files: src/panes/<id>Pane.tsx              │
                │   per-pane styles: src/styles.css (scoped)            │
                │   subcomponents: src/internal/                        │
                │     ── DeleteAccountConfirmModal.tsx (native <dialog>)│
                │     ── StickyColorPalette.tsx                         │
                │     ── HotkeysTable.tsx                               │
                │     ── IntegrationCardGrid.tsx + IntegrationCard.tsx  │
                │     ── TaskTemplateCard.tsx                           │
                │     ── localI18n.ts (bilingual STR table for keys     │
                │       not yet in @repo/plugin-web-tokens)             │
                └──────────────────────────────────────────────────────┘

                Host wiring (line-disjoint with row #22):
                ── apps/web/src/routes/modules/settingsPaneComposition.ts
                     adds 11 switch cases (one per pane id) + 1 import
                ── apps/web/package.json
                     adds "@repo/plugin-web-settings-rest": "workspace:*"
```

## 5. State + side-effects

| Concern | Implementation |
|---|---|
| Per-control persistence | `usePref(xai_pref_*)` per chassis pattern; setter writes immediately on change (live persist) |
| Footer Save | Returns `[]` (no canonical `WebPreferenceKey` changes); chassis still flashes "Saved" 1800ms per chassis api.md §2.3 F5 |
| Per-pane Reset (More pane) | Iterates the 14 More-owned keys, calls `removePref(key)` for each; no chassis-wide reset triggered |
| Delete-account modal | Native `<dialog>` open via `ref.showModal()`; confirm calls `emitWebEvent("web:settings:rest:account-delete-confirmed", { confirmedAt: new Date().toISOString() })` then `dialog.close()` |
| Sticky color palette | Each swatch is a `<button>` whose inline style is `{ background: id === "random" ? CONIC_RANDOM : "var(--sticky-note-color-" + id + ")" }`; active state via `data-active="true"` |
| Integration card click | `onClick={() => import.meta.env.DEV && console.warn("[settings-rest] integration card is a placeholder", id)}` — strictly typed `(e: React.MouseEvent) => void` |
| Hotkeys | Pure render — `KEYS.map(k => <tr>...<kbd>{c}</kbd></tr>)`; no state |
| Smart Lists tri-state | `usePref("xai_pref_smart_lists", DEFAULT_MAP)` where `DEFAULT_MAP: Record<SmartListId, "show" \| "if-not-empty" \| "hide">` is built from source defaults at module init |

## 6. Frozen assumptions

(Identical to discovery-review §5 — re-stated for breakpoint continuity.)

1. 11 panes shipped: account, premium, smart_lists, notifications, date_time, more, integrations, collaborate, sticky, hotkeys, about.
2. Composition seam edit: 11 switch cases added to `apps/web/src/routes/modules/settingsPaneComposition.ts`.
3. Chassis atoms consumed as-is — no extension to `SettingRowProps.label` typing (workaround documented below).
4. Delete-account is a `<dialog>`-based confirm-modal — no `window.confirm`.
5. Hotkeys is read-only.
6. Integrations are placeholders — no real OAuth wiring.
7. Sticky-note 13-color palette via per-row `--sticky-note-color-<id>` OKLCH vars in `src/styles.css`; "random" is conic-gradient sentinel.
8. Per-pane reset (More pane only — that's the only pane with a "Reset Default" affordance in the source); never chassis-wide.
9. About: hard-coded `v 1.2.0 · build 2026.05.23`.
10. 37 new `xai_pref_*` entries in `PREF_REGISTRY`.
11. 1 new declaration-only EventMap entry: `web:settings:rest:account-delete-confirmed`.
12. EN/ZH bilingual via `useI18n` where keys exist + per-file `localI18n.STR` table for new ones.
13. Module registration NOT touched — chassis's `composedSettingsRegistration` already mounts Settings via `composeSettingsPaneRegistry()`.
14. One workspace dep added to `apps/web/package.json`.
15. NO edit to `packages/plugin-web-tokens/src/tokens.css`.
16. Initial active pane stays `"account"` (chassis owns).

## 6.1 SettingRowProps.label type workaround

Chassis `SettingRowProps.label: string`. Source line 725 uses `<><span className="cbx" /> {label} </>` as a fragment label. This row does **NOT** widen the chassis type (preserves the chassis API freeze). Instead, the inline-checkbox is moved into the `children` slot of `<SettingRow>`:

```tsx
// AVOIDS chassis type widening:
<SettingRow label={lang === "zh" ? "移除任务中的文本" : "Remove text in tasks"}>
  <label className="check-inline" onClick={() => setRemoveDateText(!removeDateText)}>
    <span className={"cbx" + (removeDateText ? " checked" : "")} />
  </label>
</SettingRow>
```

Functional parity preserved (toggle + label + visual). Chassis API frozen.

## 7. JSX → TSX port rules applied (ADR-0007 §S5)

| Rule | Action |
|---|---|
| R1 strict typing | `SettingsPaneId` re-imported from chassis (closed union); new `SmartListId`, `StickyColorId`, `StickyFontSize`, `StickyGridSpacing`, `IntegrationCardId`, `TaskDefaultDate`, `TaskDefaultReminder*`, `TaskDefaultPriority`, `WindowType`, `DefaultShare`, `OverdueAt` literal unions in `src/types.ts` |
| R2 no `any` | `@typescript-eslint/no-explicit-any: error` in package eslint config |
| R3 explicit return types | All exported `Pane.render` impls return `React.ReactElement` |
| R4 props typed | `*Props` interfaces in `src/types.ts` |
| R5 hooks typed | `usePref<string \| number \| boolean>(key)` per registry entry codec |
| R6 no implicit any | tsconfig `strict: true` (extends `@repo/typescript-config/react-library.json`) |
| R7 prefer const | All component-local `let` removed |
| R8 no DOM globals | `dialogRef.current?.showModal()` typed via `HTMLDialogElement` |
| R9 events typed | `onClick: React.MouseEventHandler<HTMLButtonElement>` |
| R10 i18n pure-fn | All bilingual strings via `useI18n(lang).s(path)` OR a typed `localI18n(lang, key)` helper — never `lang === "zh" ? ... : ...` literals directly in JSX (matches chassis rule R10) |

## 8. Sticky-note color palette

Source line 902-905 hex literals → OKLCH conversion (this row's `src/styles.css`):

| id | source hex | OKLCH approximation (display-p3-safe) |
|---|---|---|
| `sun` | `#fdee87` | `oklch(94% 0.12 95)` |
| `peach` | `#fcd6c8` | `oklch(88% 0.06 35)` |
| `coral` | `#f5a3a3` | `oklch(76% 0.10 20)` |
| `sky` | `#cfe7f5` | `oklch(90% 0.04 230)` |
| `indigo` | `#bbcef8` | `oklch(82% 0.08 255)` |
| `lilac` | `#d6c2f5` | `oklch(82% 0.08 295)` |
| `mint` | `#cfeed6` | `oklch(90% 0.06 145)` |
| `white` | `#ffffff` | `oklch(100% 0 0)` |
| `silver` | `#e8e8e8` | `oklch(92% 0 0)` |
| `graphite` | `#414141` | `oklch(35% 0 0)` |
| `navy` | `#1c2335` | `oklch(22% 0.04 265)` |
| `midnight` | `#0e1730` | `oklch(15% 0.06 270)` |
| `random` | n/a — sentinel | conic-gradient inline (rendered, not vars) |

**Acceptance**: `grep -E '#[0-9a-fA-F]{3,6}\b'` against `src/**/*.{ts,tsx}` returns **zero matches** (palette lives in `src/styles.css`, not in JSX/TS).

## 9. CSS strategy

Port pane-specific rules from `web design/layout.css` scoped under `.module-settings` (chassis already provides the outer scope; this row's styles cascade inside). New scoped vars + rule blocks land in `src/styles.css`:

- 13 `--sticky-note-color-<id>` OKLCH vars
- `.acct-avatar`, `.acct-edit`, `.acct-name`, `.acct-email`, `.acct-status`, `.acct-actions`, `.acct-upgrade`, `.acct-danger`
- `.premium-pane`, `.premium-card`, `.premium-emblem`
- `.sl-section`, `.sl-group`, `.sl-rows`, `.sl-row`, `.sl-name`, `.sl-select`
- `.notif-pane`, `.time-range`
- `.dt-pane`
- `.more-pane`, `.pane-h-block`, `.reset-link`, `.check-inline`, `.template-grid`, `.template-card`
- `.int-pane`, `.int-h`, `.int-grid`, `.int-card`, `.int-logo`, `.int-name`
- `.collab-pane`
- `.sticky-pane`, `.pane-sub`, `.sn-colors`, `.sn-sw`, `.sn-crown`, `.sn-spacing`, `.sn-sp`, `.sn-sp-row`, `.sn-sp-tile`, `.sn-sp-label`
- `.hotkeys-pane`, `.hk-list`, `.hk-row`, `.hk-combo`, `kbd` (scoped)
- `.about-pane`, `.about-logo`, `.about-mark`, `.about-ver`, `.about-desc`, `.about-links`
- `dialog.delete-account-modal` + `dialog.delete-account-modal::backdrop`

CSS is imported once globally via `src/index.ts` side-effect (`import "./styles.css"`).

## 10. Test strategy summary

Full strategy in `test.md`. Highlights:
- **Unit**: each pane's render output + state mutations + lint-style hex-literal check
- **Modal**: native `<dialog>` open/close + emit-on-confirm (vi.spyOn on `emitWebEvent`)
- **i18n**: ZH/EN parity per pane
- **Integration**: composition substitution returns the right `Pane` object for each id
- **Coverage target**: ≥ 85% lines (slightly lower than chassis since 11 panes have a long total LOC count, and decorative subcomponents don't have meaningful branch coverage)

## 11. Phase plan summary (full detail in `dev_log.md` Phase Plan)

3 phases — clustered by pane complexity + line-disjoint host edits.

| Phase | Scope | Acceptance |
|---|---|---|
| P1 | Package scaffolding + 37 storage keys + i18n adds + 1 EventMap declaration + 5 simple panes (Account / Premium / Hotkeys / About / Collaborate) + DeleteAccountConfirmModal subcomponent + unit tests | `pnpm --filter @repo/plugin-web-settings-rest lint test typecheck` exits 0; PREF_REGISTRY +37; events.ts +1; i18n.ts +block; account-modal open/confirm flow validated |
| P2 | 5 middle-weight panes (Smart Lists / Notifications / Date & Time / More / Integrations) + per-pane reset logic for More + IntegrationCardGrid placeholder click + tests | Same gates; all 5 panes validated by render+mutation tests |
| P3 | Sticky Note pane (13-color palette + grid spacing) + host wiring (composition substitution + apps/web dep) + integration test + scoped `src/styles.css` finalization | Same gates; `pnpm --filter @repo/web build` passes; Settings → Sticky reachable; 11 sidebar entries each open non-placeholder content |

Each phase commits independently; commit prefix `feat(plugin-web-settings-rest)` for P1/P2 and `feat(plugin-web-settings-rest): P3 sticky + host wiring` for P3.

## 12. Risk overview

(Mirrors discovery-review §4 — see that doc for mitigations.)

- W4b concurrent edits with row #22 → labeled-block append pattern
- Chassis `SettingRowProps.label: string` workaround → checkbox in `children` slot
- Sticky palette no-hex constraint → all hex in `src/styles.css` only
- 37 new keys need `parity-design-md.test.ts` update → P1 includes it
- Delete-account event has no consumer → "declaration-only" precedent (#14/#15)
- About hard-coded version → frozen as v1; future-row note

## 13. References

- Source: `web design/module-settings.jsx`
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S6 / §S7 / §S8
- Chassis: `packages/xai-web-settings-shell/docs/api.md` §8 (sibling composition pattern)
- Sibling precedent: `packages/xai-web-settings-features-panel/` (row #23)
- Composition seam: `apps/web/src/routes/modules/settingsPaneComposition.ts`
- Token vars precedent: `packages/plugin-web-board-core/src/styles.css` (`--board-list-color-<id>`)
- Discovery: `docs/reviews/xai-web-settings-rest/20260523-discovery-review.md`
- API: `packages/xai-web-settings-rest/docs/api.md`
- Tests: `packages/xai-web-settings-rest/docs/test.md`
