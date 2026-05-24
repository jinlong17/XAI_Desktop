# Design — plugin-web-settings-rest

> **Feature**: xai-web-settings-rest (roadmap row #24, W4b)
> **Status**: SHIPPED
> **Last Updated**: 2026-05-23

---

## 1. Purpose

Port the remaining 11 Settings panes from `web design/module-settings.jsx` into a typed
Vite+React 19 sibling package `@repo/plugin-web-settings-rest`. Panes are:
account, premium, smart_lists, notifications, date_time, more, integrations,
collaborate, sticky, hotkeys, about.

Consumes chassis atoms from `@repo/plugin-web-settings-shell` (row #21) via the
slot pattern. Registered via `settingsPaneComposition.ts` created by row #23.

## 2. Package Boundary

- **Package**: `packages/plugin-web-settings-rest/`
- **Exports** (`src/index.ts`): 11 `Pane` objects, `restPanesById`, `applyRestPanesToRegistry`
- **Consumes**: `@repo/plugin-web-settings-shell` chassis atoms via barrel only
- **Peers**: `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`

## 3. Pane Inventory

| id | File | Controls | Footer |
|----|------|----------|--------|
| account | panes/accountPane.tsx | SVG avatar, name, email, Upgrade/SignOut/Delete | None |
| premium | panes/premiumPane.tsx | Static headline + Upgrade CTA | None |
| smart_lists | panes/smartListsPane.tsx | 12 rows × tri-state select | None (live persist) |
| notifications | panes/notificationsPane.tsx | 8 controls + conditional time inputs | None (live persist) |
| date_time | panes/dateTimePane.tsx | 5 controls | None (live persist) |
| more | panes/morePane.tsx | 14 controls + per-pane reset | None (live persist) |
| integrations | panes/integrationsPane.tsx | 17 placeholder cards (3 groups) | None |
| collaborate | panes/collaboratePane.tsx | 3 live-persist controls | None |
| sticky | panes/stickyPane.tsx | 13-color palette + font + pin + spacing | None (live persist) |
| hotkeys | panes/hotkeysPane.tsx | 10-row read-only table | None |
| about | panes/aboutPane.tsx | Version, build, 4 link buttons | None |

## 4. Internal Modules

| File | Purpose |
|------|---------|
| `src/internal/localI18n.ts` | Typed bilingual STR table; `localI18n(lang)` factory |
| `src/internal/DeleteAccountConfirmModal.tsx` | Native `<dialog>` confirm modal |
| `src/internal/StickyColorPalette.tsx` | 13-swatch component (CSS vars + conic-gradient) |
| `src/internal/restPanesById.ts` | Aggregate map keyed by SettingsPaneId |
| `src/internal/applyRestPanesToRegistry.ts` | Idempotent paneRegistry substitutor |

## 5. Storage Keys (37 new entries)

All 37 keys have `category: "pref"`, `owner: "xai-web-settings-rest"`, `schemaVersion: 1`.
Appended in one labeled block at the tail of `packages/plugin-web-storage/src/internal/registry.ts`.

Keys: `xai_pref_smart_lists`, `xai_pref_notif_enabled`, `xai_pref_notif_done_sound`,
`xai_pref_notif_push_task`, `xai_pref_notif_push_pomo`, `xai_pref_notif_push_habit`,
`xai_pref_notif_quiet`, `xai_pref_notif_quiet_start`, `xai_pref_notif_quiet_end`,
`xai_pref_dt_start_week`, `xai_pref_dt_lunar`, `xai_pref_dt_week_numbers`,
`xai_pref_dt_holidays`, `xai_pref_dt_timezone`,
`xai_pref_more_win_type`, `xai_pref_more_launch_at_login`, `xai_pref_more_minimize_on_launch`,
`xai_pref_more_date_recognition`, `xai_pref_more_remove_date_text`, `xai_pref_more_remove_tags`,
`xai_pref_more_url_parse`, `xai_pref_more_default_date`, `xai_pref_more_default_rem_due`,
`xai_pref_more_default_rem_all`, `xai_pref_more_default_pri`, `xai_pref_more_default_tag`,
`xai_pref_more_default_list`, `xai_pref_more_add_to`, `xai_pref_more_overdue_at`,
`xai_pref_collab_show_avatars`, `xai_pref_collab_default_share`, `xai_pref_collab_mention_notify`,
`xai_pref_sticky_color`, `xai_pref_sticky_font`, `xai_pref_sticky_pin_default`,
`xai_pref_sticky_restore_size`, `xai_pref_sticky_grid_spacing`.

## 6. Chassis Contract Notes

### 6.1 SettingRow label constraint

`SettingRowProps.label` is typed as `string`, not `ReactNode`. The source's
"Remove text in tasks" inline-checkbox (source line 725) uses a JSX fragment as
label — this row works around it by placing the checkbox in the `<SettingRow>`
children slot instead of the `label` prop. Functional parity preserved.

### 6.2 Collaborate pane: no footer

Source uses live `onChange` directly (no save button). Confirmed correct per
Design Review O2.

### 6.3 Reset semantics

Per-pane reset (More pane "Reset Default") calls `removePref` for only the pane's
owned keys. Does NOT call chassis `resetAllPrefs()`. A `resetKey` state counter
forces re-render after reset.

## 7. Event Declarations

`web:settings:rest:account-delete-confirmed: { confirmedAt: string }` — declared
in `packages/core/src/types/events.ts`. Declaration-only; no consumer in this row.

## 8. Sticky-note Color Palette

13 OKLCH custom properties declared in `src/styles.css`:

| id | Approx hex (source) | OKLCH |
|----|---------------------|-------|
| sun | #FFE066 | oklch(90% 0.12 90) |
| peach | #FFB347 | oklch(78% 0.14 68) |
| coral | #FF6B6B | oklch(65% 0.18 27) |
| sky | #74C0FC | oklch(72% 0.12 230) |
| indigo | #4263EB | oklch(45% 0.22 270) |
| lilac | #CC5DE8 | oklch(55% 0.22 310) |
| mint | #51CF66 | oklch(72% 0.18 145) |
| white | #F8F9FA | oklch(97% 0 0) |
| silver | #ADB5BD | oklch(73% 0.005 240) |
| graphite | #495057 | oklch(35% 0.005 240) |
| navy | #1864AB | oklch(30% 0.12 250) |
| midnight | #1A1B1E | oklch(14% 0.005 240) |
| random | (sentinel) | conic-gradient of above |

## 9. Frozen Assumptions

1. Panes shipped (11): account, premium, smart_lists, notifications, date_time, more,
   integrations, collaborate, sticky, hotkeys, about.
2. Composition seam: `settingsPaneComposition.ts` — 11 new switch cases.
3. No tokens.css edit (FA #15 from discovery review).
4. Delete-account: native `<dialog>` confirm-modal; confirm emits
   `web:settings:rest:account-delete-confirmed` (declaration-only).
5. Hotkeys: read-only 10-row table. No rebinding.
6. Integrations: 17 placeholder cards; click is no-op.
7. Sticky palette: `--sticky-note-color-<id>` OKLCH vars in scoped styles.css.
8. Reset: per-pane; `removePref` per owned key only.
9. About version: hard-coded `v 1.2.0 · build 2026.05.23`.
