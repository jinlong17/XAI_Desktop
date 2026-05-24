# Discovery Review — xai-web-settings-rest

> **Feature**: xai-web-settings-rest (roadmap row #24, W4b · Settings remaining 10 panes)
> **Date**: 2026-05-23
> **Author**: feature-plan (Claude Opus 4.7 1M)
> **Seed**: `docs/reviews/xai-web-settings-rest/20260523-roadmap-seed.md`
> **Sibling in flight (W4b)**: xai-web-settings-appearance (#22). Write scope is line-disjoint per row.

---

## 1. Requirement Restate

Port the **remaining 10 Settings panes** from `web design/module-settings.jsx` (1061 LOC) into a typed Vite+React 19 sibling pane package `@repo/plugin-web-settings-rest`. The package consumes the chassis from row #21 (`@repo/plugin-web-settings-shell`) via the slot pattern (`paneRegistry` substitution through `apps/web/src/routes/modules/settingsPaneComposition.ts`, the line-disjoint seam created by row #23).

**Scope (this row — 10 panes)**:

| # | Pane id | Source lines (module-settings.jsx) | Notable controls |
|---|---------|------------------------------------|------------------|
| 1 | `account` | 102-131 | SVG avatar + name + email + free-tier line + Upgrade / Sign out / **Delete (confirm-modal)** |
| 2 | `premium` | 136-151 | Emblem + bilingual headline + body + Upgrade CTA |
| 3 | `smart_lists` | 306-371 | 3 groups (Default lists / Organize / Others) × tri-state select per row (Show / Show if not empty / Hide) |
| 4 | `notifications` | 376-442 | Master toggle + 3 type toggles + 5-option completion-sound select + DND master toggle + start/end `<input type="time">` |
| 5 | `date_time` | 447-489 | Start-week select (Mon/Sun/Sat) + lunar / week-numbers / holidays / time-zone toggles |
| 6 | `more` | 658-822 | Language (read-only "follow system") + window type (window/tray/full) + Launch-at-login + Min-on-launch + Smart Recognition (4 toggles) + Task Default (3+3+2 selects) + Task Template (3 read-only cards) |
| 7 | `integrations` | 827-873 | 3 grouped sections (Featured / Calendar / Integrate) — **placeholder cards, no real OAuth** |
| 8 | `collaborate` | 878-895 | 3 settings: avatar toggle + default-share select + @-mention toggle |
| 9 | `sticky` | 900-977 | **13-color palette inc. "random"** + font size + default-pin + restore-default-size + 4 grid spacings |
| 10 | `hotkeys` | 982-1010 | **10-row read-only table** (no rebinding) |
| 11 | `about` | 1015-1034 | XAI logo + version + build + bilingual description + 4 link buttons |

(11 entries because `about` is one of the 10 + we count the placeholder seed list — DESIGN.md / seed says "10 remaining"; actual source has 11. Re-reading the seed: Account/Premium/Smart Lists/Notifications/Date & Time/More/Integrations/Collaborate/Sticky Note/Hotkeys/About = **11 panes**. The chassis seed copy said "10 remaining" because Appearance + Features are owned by #22/#23, leaving 11 — likely a typo in the seed. Treating the **enumerated 11** as authoritative.)

**Out of scope (handled by sibling rows / future rows)**:
- Appearance pane → row #22
- Features pane → row #23 (already shipped)
- Custom hotkey rebinding → deferred (DESIGN.md §4.12 future row)
- Real OAuth / integration wiring → deferred (placeholder cards only this row)
- "Open as Sticky Note" runtime behavior (right-click context) → out of scope; this row only ships preferences
- Account email/avatar editing (the source shows hard-coded mock data) → keep mock data this row; future row plugs in `@repo/web-auth-device-session`

## 2. Decision Headline

**The defining call** — *how do 11 mostly-pref-driven panes share atomic UI without each pane re-implementing Toggle/SettingRow/SectionBlock?* — is decided as **"each pane is a thin `Pane.render`-style function from `@repo/plugin-web-settings-rest`, consuming chassis atoms from `@repo/plugin-web-settings-shell`"**. The package exports 11 `Pane` objects (one per pane id) AND a single `restPanesById` map; `apps/web/src/routes/modules/settingsPaneComposition.ts` switch-cases each pane id to the corresponding object. Each pane's `render({ lang })` returns its TSX subtree; bilingual via `useI18n(lang).s("settings.<key>")` or per-file `STR` table when an i18n key is not yet in the shared bundle.

**Storage strategy**: every persistable control uses an existing or new `xai_pref_*` registry entry (per ADR-0007 §S8 family + seed). For pref keys NOT yet in `PREF_REGISTRY`, this row APPENDS them in a single labeled block — line-disjoint with rows #22 (Appearance) and #23 (Features, already shipped). The full new-key list is in §5.

**Delete-account UX**: per seed hard constraint, "delete" MUST be a confirm-modal (not instant destructive). Reuses `confirmAction` from chassis (already exposed via `@repo/plugin-web-settings-shell/src/internal/confirmAction.ts`, but NOT exported in the public surface — therefore this row implements its own bilingual `<DeleteAccountConfirmModal>` component using a native `<dialog>` element to match the pattern used by `@repo/plugin-web-ai-chat` (modal dialog) and `@repo/plugin-web-countdown` (add/edit modal). NO actual account deletion — the modal's confirm button is a typed no-op that closes the modal and emits a `web:settings:rest:account-delete-confirmed` local-bus event for any future downstream listener. This row's acceptance is the modal flow, not the deletion side effect.

**Sticky-note 13-color palette**: seed hard constraint says "use tokens.css label/list colors (no hard-coded hex)". `tokens.css` currently has 5 tag colors + 10 board-list colors. Neither set has 13 entries matching the source. The decision: **declare the 13-color palette as OKLCH custom properties in this row's scoped `src/styles.css`** as `--sticky-note-color-<id>` vars (parallel to `@repo/plugin-web-board-core`'s `--board-list-color-<id>` precedent). No edits to `packages/plugin-web-tokens/src/tokens.css`. The 13 ids follow the source order (`sun`/`peach`/`coral`/`sky`/`indigo`/`lilac`/`mint`/`white`/`silver`/`graphite`/`navy`/`midnight` + `random`). "random" is a sentinel id (not a color var); render uses the source's conic-gradient inline-style — that's not a hex literal, just a `conic-gradient(from 0deg, var(--sticky-note-color-coral), ...)` chain, satisfying the constraint.

**Hotkeys is read-only**: hard constraint per seed. Custom rebinding deferred to DESIGN.md §13 (future row). This row renders the 10-row table from source lines 984-995, no edit affordance.

**Integrations is placeholder**: hard constraint per seed. 3 grouped sections × 17 total cards rendered as buttons with logo + name; click triggers `console.warn` in DEV and a no-op in PROD (since this row does NOT need to emit anything for placeholder cards).

**Save & Reset semantics**: 4 panes have meaningful persisted state and use `<SettingsFooter onSave>` from chassis — Smart Lists, Notifications, Date & Time, More, Sticky Note. The remaining 6 panes (Account / Premium / Integrations / Collaborate / Hotkeys / About) either:
- have no per-pane persistable state (Account / Premium / About / Hotkeys / Integrations); OR
- write live on every toggle change (Collaborate — the source uses Toggle `onChange` directly without a save button).

For the 5 footer-enabled panes, the `onSave: () => WebPreferenceChange[]` callback returns an **empty array** (since none of this row's keys map to one of the 7 canonical `WebPreferenceKey` values in the EventMap). The footer still flashes "Saved" for 1800ms per chassis contract (acceptable per chassis api.md §2.3 F5 — empty array = 0 events but flash still shows). Live changes still persist via `usePref` immediately on every control mutation — Save is a UX confirmation, not a commit gate.

**Reset semantics**: per pane that has a "Reset Default" affordance (More pane has one at source line 805). Implement per-pane reset by:
1. Iterating the pane's owned keys
2. Calling `removePref(key)` on each
3. NOT calling `resetAllPrefs()` from chassis (that would clobber other panes' state)

The chassis-level "Reset to defaults" footer button (when surfaced) keeps its global-reset semantics — this row's per-pane resets are pane-scoped buttons placed inside the pane body.

**Concurrency with W4b sibling row #22**: parallel-Agent mode. Write scope is line-disjoint by file:
- `packages/plugin-web-storage/src/internal/registry.ts` — this row appends a labeled `// ---- Rest panes (§S8 — declared by xai-web-settings-rest #24) ----` block at the tail; #22's entries go in its own block. No edit collision.
- `packages/plugin-web-tokens/src/i18n.ts` — this row appends labeled block; #22's `settings.theme/density/light/dark/...` keys already exist (per `i18n.ts` lines 98-102).
- `apps/web/src/routes/modules/settingsPaneComposition.ts` — both rows add one switch case each (already line-disjoint per row #23's design).
- `apps/web/package.json` — both rows add one workspace dep line each (alphabetical placement; row #22 inserts before `plugin-web-settings-rest`, row #24 inserts after).
- `packages/core/src/types/events.ts` — this row adds ONE local-bus event (`web:settings:rest:account-delete-confirmed`); #22 does not touch this file (reuses existing `web:settings:preference-changed`).

## 3. Alternatives Considered

| # | Approach | Pros | Cons | Decision |
|---|---|---|---|---|
| A | **Single sibling package with 11 panes (CHOSEN)** | One workspace dep; one composition switch; shared atom import; one bilingual STR table | 11 panes in one src/ — file count higher | ✅ |
| B | One sibling row per pane (11 packages) | Strict isolation | 11× package.json + 11× dep edits; defeats W4b parallel gain | ❌ |
| C | Chassis owns pane content directly | Zero new packages | Violates row #21 frozen-assumption #1 ("10 of 13 panes ship as placeholders in this row") + frozen-assumption #2 (atomic API frozen at chassis ship) | ❌ |

For delete-account UX:

| # | Approach | Pros | Cons | Decision |
|---|---|---|---|---|
| A | **Native `<dialog>` modal (CHOSEN)** | Accessible + bilingual + no extra deps | Slightly heavier than `confirmAction` | ✅ |
| B | Reuse chassis `confirmAction` (window.confirm wrapper) | Trivial | Browser `window.confirm` is ugly + non-stylable | ❌ |
| C | No modal — just a destructive button | Simplest | Violates seed hard constraint ("delete MUST be a confirm-modal") | ❌ |

For sticky-note palette:

| # | Approach | Pros | Cons | Decision |
|---|---|---|---|---|
| A | **Per-row `src/styles.css` with `--sticky-note-color-<id>` (CHOSEN)** | No edit to shared tokens.css; mirrors board-core precedent | One more local CSS file | ✅ |
| B | Add 13 vars to `packages/plugin-web-tokens/src/tokens.css` | Globally referenceable | Edits Stable shared package — invites cross-row merge conflicts in W4 | ❌ |
| C | Use existing `--tag-*` + `--board-list-color-*` mix | Reuses live vars | Only 15 unique colors total + visual mismatch with prototype + introduces foreign semantics (a sticky note is not a board list) | ❌ |
| D | Hard-coded hex array per source | Trivial | Violates seed hard constraint ("no hard-coded hex") | ❌ |

For integrations clicks:

| # | Approach | Pros | Cons | Decision |
|---|---|---|---|---|
| A | **DEV-only `console.warn`; PROD no-op (CHOSEN)** | Honest placeholder + no event-bus pollution | None — that's exactly "placeholder" | ✅ |
| B | Emit `web:settings:rest:integration-clicked` | "Demo" telemetry | Pollutes EventMap with a channel nobody listens to | ❌ |

## 4. Risk & Trade-off

| Risk | Mitigation |
|---|---|
| **W4b concurrent edits** with row #22 to `registry.ts`, `i18n.ts`, `settingsPaneComposition.ts`, `apps/web/package.json` | Each row appends a labeled block at the **tail** of registry.ts + i18n.ts; each row adds exactly one switch case (different `p.id`) in `settingsPaneComposition.ts`; deps are alphabetically distinct (`...settings-appearance` < `...settings-rest`). Verified line-disjoint. |
| **Source uses inline `style={{verticalAlign:"middle"}}` etc** that violate the chassis lint (`@typescript-eslint/no-explicit-any: error`) | Per-pane styles are kept verbatim from source where they don't trip lint. The inline `style={{ background: "conic-gradient(...)" }}` in the source's random-swatch is acceptable (it's a literal CSS function call, not hex). |
| **Smart Recognition row in source uses a `<><span/> {label} </>` JSX fragment as the SettingRow `label` prop** (source line 725) — chassis's `SettingRowProps.label: string` is typed as string, not ReactNode | Chassis api.md §1.5 declares `label: string`. This row needs `label: React.ReactNode`. **Mitigation**: avoid the fragment-as-label pattern; render the "[ ] Remove text in tasks" inline-checkbox as a `<SettingRow>` child instead of as the label. Functional parity preserved; chassis contract preserved. (Documented in design.md §6.) |
| **Sibling rows may want `xai_pref_features_*` keys reset to true on this row's per-pane reset** | Out of scope. This row's reset is pane-scoped — only this row's owned keys. Cross-pane reset is the chassis `resetAllPrefs` (which covers everything per category contract). |
| **About pane version + build are hard-coded** (`v 1.2.0 · build 2026.05.23` in source line 1022) | Accept as a literal display string for v1. Future row may wire `package.json#version` via Vite `define`. Documented as Frozen Assumption #9. |
| **Sticky-note random swatch uses `conic-gradient` — confirm browser support** | `conic-gradient` is Baseline (Chromium 69+, Safari 12.1+, Firefox 83+). Acceptable for the Web Console (modern browsers per ADR-0007 §S6). |
| **`web:settings:rest:account-delete-confirmed` event has no consumer in this row** | Declared "declaration-only" per the pattern used by row #14 (`web:pomodoro:session-finished`) + #15 (`web:habits:checkin-recorded`). Pattern is already accepted in the codebase. |
| **The seed says "10 remaining" but enumerates 11 panes** | Resolution: treat the enumerated 11 as authoritative; the "10 remaining" phrase in the seed §Requirement is a count typo. Documented in §1 above. |

## 5. Frozen Assumptions

1. **Panes shipped (11)**: account, premium, smart_lists, notifications, date_time, more, integrations, collaborate, sticky, hotkeys, about.
2. **Composition seam**: `apps/web/src/routes/modules/settingsPaneComposition.ts` switch — this row adds 11 case branches (line-disjoint with row #22's `appearance` branch).
3. **Atomic API consumption**: every per-pane row uses `<SettingRow>` + `<Toggle>` + `<SectionBlock>` + `<SettingsFooter>` from `@repo/plugin-web-settings-shell` (chassis atoms frozen at row #21 ship).
4. **Delete-account UX**: native `<dialog>` confirm-modal with bilingual labels; confirm button emits `web:settings:rest:account-delete-confirmed` (declaration-only) + closes the dialog; **no actual account deletion**.
5. **Hotkeys is read-only**: 10-row table per source lines 984-995. No rebinding affordance.
6. **Integrations are placeholders**: 17 cards across 3 sections render as buttons; click is DEV `console.warn` / PROD no-op. NO event emitted.
7. **Sticky-note 13-color palette**: declared as `--sticky-note-color-<id>` OKLCH vars in this row's scoped `src/styles.css`. NOT added to shared tokens.css. "random" is a sentinel id rendering as a `conic-gradient` of the other 12 colors.
8. **Reset semantics**: per-pane reset buttons (e.g. More pane's "Reset Default" at source line 805) call `removePref` for that pane's owned keys only; **NOT** `resetAllPrefs`.
9. **About pane content**: version + build hard-coded as `v 1.2.0 · build 2026.05.23` per source line 1022. Acceptable v1; future row may wire via Vite `define`.
10. **New PREF_REGISTRY entries (this row owns)** — appended in one labeled block at the tail of `registry.ts`:

    | Key | Codec | Default | Category |
    |---|---|---|---|
    | `xai_pref_smart_lists` | json | `{}` (tri-state map per source line 337-338) | pref |
    | `xai_pref_notif_enabled` | boolean | `true` | pref |
    | `xai_pref_notif_done_sound` | string | `"subtle"` | pref |
    | `xai_pref_notif_push_task` | boolean | `true` | pref |
    | `xai_pref_notif_push_pomo` | boolean | `true` | pref |
    | `xai_pref_notif_push_habit` | boolean | `false` | pref |
    | `xai_pref_notif_quiet` | boolean | `false` | pref |
    | `xai_pref_notif_quiet_start` | string | `"22:00"` | pref |
    | `xai_pref_notif_quiet_end` | string | `"07:00"` | pref |
    | `xai_pref_dt_start_week` | string | `"monday"` ("monday"/"sunday"/"saturday") | pref |
    | `xai_pref_dt_lunar` | boolean | `true` | pref |
    | `xai_pref_dt_week_numbers` | boolean | `true` | pref |
    | `xai_pref_dt_holidays` | boolean | `true` | pref |
    | `xai_pref_dt_timezone` | boolean | `true` | pref |
    | `xai_pref_more_win_type` | string | `"window"` | pref |
    | `xai_pref_more_launch_at_login` | boolean | `false` | pref |
    | `xai_pref_more_minimize_on_launch` | boolean | `false` | pref |
    | `xai_pref_more_date_recognition` | boolean | `true` | pref |
    | `xai_pref_more_remove_date_text` | boolean | `false` | pref |
    | `xai_pref_more_remove_tags` | boolean | `true` | pref |
    | `xai_pref_more_url_parse` | boolean | `true` | pref |
    | `xai_pref_more_default_date` | string | `"none"` | pref |
    | `xai_pref_more_default_rem_due` | string | `"on_time"` | pref |
    | `xai_pref_more_default_rem_all` | string | `"none"` | pref |
    | `xai_pref_more_default_pri` | string | `"none"` | pref |
    | `xai_pref_more_default_tag` | string | `"none"` | pref |
    | `xai_pref_more_default_list` | string | `"inbox"` | pref |
    | `xai_pref_more_add_to` | string | `"top"` | pref |
    | `xai_pref_more_overdue_at` | string | `"top"` | pref |
    | `xai_pref_collab_show_avatars` | boolean | `true` | pref |
    | `xai_pref_collab_default_share` | string | `"comment"` | pref |
    | `xai_pref_collab_mention_notify` | boolean | `true` | pref |
    | `xai_pref_sticky_color` | string | `"sun"` (one of the 13 ids) | pref |
    | `xai_pref_sticky_font` | string | `"large"` | pref |
    | `xai_pref_sticky_pin_default` | boolean | `true` | pref |
    | `xai_pref_sticky_restore_size` | boolean | `false` | pref |
    | `xai_pref_sticky_grid_spacing` | string | `"normal"` | pref |

    **37 new keys** — all `category: "pref"`, `owner: "xai-web-settings-rest"`, `schemaVersion: 1`, `proposed: false`. All caught by chassis `resetAllPrefs()` via the existing `key.startsWith("xai_")` filter (verified against chassis api.md §5.1).

11. **New `EventMap` entry**: `web:settings:rest:account-delete-confirmed` — payload `{ confirmedAt: string }`. Declaration-only; no consumer ships in this row.
12. **i18n adds**: per-pane labels appended in `i18n.ts` under a labeled block. EN/ZH parity enforced by the bundle's `as const` shape.
13. **Module registration**: NOT this row's responsibility. The chassis's `composedSettingsRegistration` in `apps/web/src/routes/modules/composedSettingsRegistration.tsx` already wires Settings into the rail (showInRail: false). This row only extends `settingsPaneComposition.ts`.
14. **Workspace dep**: `apps/web/package.json` adds `"@repo/plugin-web-settings-rest": "workspace:*"` (alphabetical placement: between `plugin-web-settings-features-panel` and `plugin-web-statistics`).
15. **No tokens.css edit** by this row.
16. **Initial pane focus**: chassis owns the default `"account"` — this row's account pane just renders.

## 6. Touched Surfaces

| File | Read | Write | Notes |
|---|---|---|---|
| `packages/plugin-web-settings-rest/**` (new runtime package) | — | ✅ create | All pane components, styles, tests |
| `packages/xai-web-settings-rest/docs/{design.md, api.md, test.md, dev_log.md}` (new) | — | ✅ create | Planning artifacts |
| `docs/reviews/xai-web-settings-rest/20260523-discovery-review.md` | — | ✅ create | This document |
| `packages/plugin-web-storage/src/internal/registry.ts` | ✅ | ✅ append | 37 entries in one labeled block (line-disjoint with #22) |
| `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` | ✅ | ✅ extend | Add 37 keys to the expected list |
| `packages/plugin-web-tokens/src/i18n.ts` | ✅ | ✅ append | Per-pane labels under a labeled block |
| `packages/core/src/types/events.ts` | ✅ | ✅ append | One declaration: `web:settings:rest:account-delete-confirmed` |
| `apps/web/src/routes/modules/settingsPaneComposition.ts` | ✅ | ✅ edit | Add 11 switch cases (one per pane id) + 1 import |
| `apps/web/package.json` | ✅ | ✅ edit | One workspace dep line |
| `docs/PLUGIN_MAP.md` | ✅ | ❌ | Not edited — manifest is authoritative; PLUGIN_MAP row added at ship-time per the project audit pattern |
| `packages/plugin-web-tokens/src/tokens.css` | ✅ | ❌ | NOT edited (per Frozen Assumption #15) |
| `apps/web/src/routes/modules/shellRegistrations.tsx` | ✅ | ❌ | NOT edited — chassis registration already in place; this row only adds composition cases |
| `apps/web/src/routes/modules/composedSettingsRegistration.tsx` | ✅ | ❌ | NOT edited — already mounts `composeSettingsPaneRegistry()` |

## 7. Dependencies

| Package | Status | Notes |
|---|---|---|
| `@repo/core` | Stable | One new EventMap declaration (declaration-only) |
| `@repo/plugin-web-tokens` | Stable | `useI18n`, `Lang` |
| `@repo/plugin-web-storage` | Stable | `usePref`, `setPref`, `removePref`, `PREF_REGISTRY` (37 new entries appended) |
| `@repo/xai-web-event-bus` | Stable | `emitWebEvent` (used only by delete-confirm modal) |
| `@repo/xai-web-shell` | Stable | `WebShellIconName` for sidebar icons (already in chassis paneRegistry) |
| `@repo/plugin-web-settings-shell` | In-Dev → READY_TO_SHIP at chassis row #21 | `Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter`, `Pane`, `PaneRenderProps` |

All consumed packages are READY_TO_SHIP or shipped. The chassis row #21 is the only In-Dev row this depends on; per CLAUDE.md PLUGIN_MAP policy that's a sibling-row dep that is allowed in W4 parallel waves (per row #23's discovery review §5 R1 precedent).

## 8. Web Research

No external research required — purely internal port + new pref keys + new declaration-only event. Same status as row #23's discovery (§6 there). Sticky-note color decisions are sourced from `web design/module-settings.jsx` line 902-905 (the hex literals are the source-of-truth for **palette identity**; we re-express them as OKLCH custom properties to satisfy the "no hard-coded hex" constraint). The OKLCH conversion table is documented in design.md §8.

## 9. Acceptance Criteria

1. `pnpm --filter @repo/plugin-web-settings-rest lint` exits 0 (`--max-warnings 0`).
2. `pnpm --filter @repo/plugin-web-settings-rest test` exits 0; all phase specs pass.
3. `pnpm --filter @repo/plugin-web-settings-rest typecheck` exits 0.
4. `pnpm --filter @repo/web build` succeeds with new dep + composition substitutions.
5. Settings module's 11 sidebar entries each open a non-placeholder pane.
6. All controls bilingual: switching `lang` re-renders every visible label / button / option.
7. Sticky-note palette renders 13 buttons; all 12 non-random buttons get their background from `var(--sticky-note-color-<id>)`; "random" button uses the conic-gradient sentinel. No hex literals appear in the pane TSX (verified via `grep -E '#[0-9a-fA-F]{3,6}\b'`).
8. Hotkeys table renders 10 rows; no edit affordance.
9. Integrations grid renders 17 cards (3+10+4); each card click in DEV produces a `console.warn`, in PROD is a no-op (no event emit).
10. Delete-account click in Account pane opens a native `<dialog>`; confirming the dialog emits `web:settings:rest:account-delete-confirmed` exactly once + closes the dialog; canceling closes without emit.
11. Every persistable control writes to its registered `xai_pref_*` key on change (verified via spy on `setPref`).
12. More pane's "Reset Default" link clears the 14 More-owned keys and leaves other rows' keys untouched.
13. PREF_REGISTRY has +37 entries after this row's P1 commit; `parity-design-md.test.ts` updated to include them.
14. Public API in `src/index.ts` exports: `restPanesById` map, individual `Pane` exports (one per id), `applyRestPanesToRegistry(paneRegistry: readonly Pane[]): readonly Pane[]` helper; no others.
15. `apps/web/src/routes/modules/settingsPaneComposition.ts` has 11 new switch cases (verified against `git diff`).
16. Cross-vendor verify checklist passes (Codex / Cursor — same patterns as row #21/#23).

## 10. Open Questions

None — the seed brief + ADR-0007 §S4 + row #21/#23 precedents + DESIGN.md §4.12 specify the full surface. The seed's "10 remaining" count typo is resolved in §1 by counting the enumerated panes (11) as authoritative.

## 11. References

- Seed brief: `docs/reviews/xai-web-settings-rest/20260523-roadmap-seed.md`
- Source code: `web design/module-settings.jsx` lines 102-131 (Account), 136-151 (Premium), 306-371 (SmartLists), 376-442 (Notifications), 447-489 (DateTime), 658-822 (More), 827-873 (Integrations), 878-895 (Collaborate), 900-977 (Sticky), 982-1010 (Hotkeys), 1015-1034 (About), 1039-1059 (atoms — DO NOT reimplement; consume from chassis)
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map), §S5 (JSX→TSX rules), §S6 (Vite SPA), §S7 (event channels), §S8 (no new tokens/storage edits without justification)
- DESIGN.md: §4.12 (Settings — 13 panes enumerated)
- Roadmap: `docs/workflow/roadmap/xai-web-console.md` row #24 (W4b · sequential after chassis row #21; parallel-Agent-safe with row #22 per write-scope isolation)
- Chassis: `packages/xai-web-settings-shell/docs/api.md` §8 (sibling-row composition guidance) + §1.3 (`PaneRenderProps = { lang }` frozen)
- Sibling precedent: `packages/xai-web-settings-features-panel/docs/{design.md, api.md, test.md}` (row #23 — already shipped — first sibling to compose paneRegistry)
- Storage registry: `packages/plugin-web-storage/src/internal/registry.ts`
- Event channel: `packages/core/src/types/events.ts` (one new declaration this row)
- Composition seam: `apps/web/src/routes/modules/settingsPaneComposition.ts` (created by row #23; this row extends)
- Token vars precedent: `packages/plugin-web-board-core/src/styles.css` (10 `--board-list-color-<id>` vars — sets the pattern this row follows)
