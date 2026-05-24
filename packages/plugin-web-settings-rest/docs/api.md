# API — plugin-web-settings-rest

> **Package**: `@repo/plugin-web-settings-rest`
> **Public surface**: `src/index.ts`

---

## §0 Public Exports

```typescript
// 11 individual Pane objects
export { accountPane }      from "./panes/accountPane.js";
export { premiumPane }      from "./panes/premiumPane.js";
export { smartListsPane }   from "./panes/smartListsPane.js";
export { notificationsPane }from "./panes/notificationsPane.js";
export { dateTimePane }     from "./panes/dateTimePane.js";
export { morePane }         from "./panes/morePane.js";
export { integrationsPane } from "./panes/integrationsPane.js";
export { collaboratePane }  from "./panes/collaboratePane.js";
export { stickyPane }       from "./panes/stickyPane.js";
export { hotkeysPane }      from "./panes/hotkeysPane.js";
export { aboutPane }        from "./panes/aboutPane.js";

// Aggregate map keyed by pane id
export { restPanesById } from "./internal/restPanesById.js";

// Composition helper
export { applyRestPanesToRegistry } from "./internal/applyRestPanesToRegistry.js";

// Type re-exports
export type { StickyColorId, StickyFontSize, StickyGridSpacing } from "./types.js";
```

## §1 Pane Contract

Each `Pane` object satisfies the chassis `Pane` interface from
`@repo/plugin-web-settings-shell`:

```typescript
interface Pane {
  id: SettingsPaneId;      // one of 13 closed union members
  icon: string;            // WebShellIconName
  i18nKey: string;         // e.g. "settings.account"
  render: (props: PaneRenderProps) => React.ReactElement;
}

interface PaneRenderProps {
  lang: Lang;              // "en" | "zh"
}
```

## §2 DeleteAccountConfirmModal (internal)

```typescript
interface DeleteAccountConfirmModalProps {
  open: boolean;
  lang: Lang;
  onCancel: () => void;
  onConfirm: () => void;
}
```

Uses native `<dialog>` with `showModal()` / `close()`. jsdom-safe: both calls
are guarded by `typeof dialog.showModal === "function"`.

Confirming emits `web:settings:rest:account-delete-confirmed` via `emitWebEvent`.
Canceling closes without emit. Clicking the backdrop cancels.

## §3 restPanesById

```typescript
const restPanesById: Readonly<Record<SettingsPaneId, Pane>>
```

Map of the 11 owned pane ids to their Pane objects. Keys: account, premium,
smart_lists, notifications, date_time, more, integrations, collaborate, sticky,
hotkeys, about.

## §4 applyRestPanesToRegistry

```typescript
function applyRestPanesToRegistry(
  registry: readonly Pane[]
): readonly Pane[]
```

Substitutes the 11 owned panes into a copy of `registry`, preserving order.
Idempotent — calling twice produces equivalent output. Does not mutate input.
Panes not in the owned set (e.g. appearance, features) are passed through
unchanged.

## §4.1–§4.11 Per-pane Controls

### §4.1 accountPane — id: "account"

Static avatar (SVG OKLCH fills), mock name/email, Upgrade/SignOut/Delete buttons.
Delete opens `DeleteAccountConfirmModal`. Confirm emits
`web:settings:rest:account-delete-confirmed`.

### §4.2 premiumPane — id: "premium"

Static render. Bilingual headline/body. Upgrade CTA is a no-op button.

### §4.3 smartListsPane — id: "smart_lists"

3 sections (Default lists / Organize / Others), 12 total items.
Each row has a `<select>` with 3 options: show / if-not-empty / hide.
Persists to `xai_pref_smart_lists` (JSON codec, object keyed by SmartListId).

### §4.4 notificationsPane — id: "notifications"

8 controls:
- `xai_pref_notif_enabled` — master toggle
- `xai_pref_notif_done_sound` — select (none/subtle/chime/bell/pop)
- `xai_pref_notif_push_task` / `_push_pomo` / `_push_habit` — toggles
- `xai_pref_notif_quiet` — quiet hours master toggle
- `xai_pref_notif_quiet_start` / `_quiet_end` — time inputs (visible only when quiet=true)

### §4.5 dateTimePane — id: "date_time"

5 controls:
- `xai_pref_dt_start_week` — select (monday/sunday/saturday)
- `xai_pref_dt_lunar` / `_week_numbers` / `_holidays` / `_timezone` — toggles

### §4.6 morePane — id: "more"

14 controls. Per-pane "Reset Default" link (`data-testid="more-reset-default"`)
calls `removePref` for each of the 14 owned keys + synthetic StorageEvent.
Language select is read-only (value: "follow").
"Remove text in tasks" checkbox placed in `<SettingRow>` children slot
(chassis label: string constraint — see design.md §6.1).

### §4.7 integrationsPane — id: "integrations"

17 placeholder cards in 3 groups: Featured (3), Calendar (10), Integrate (4).
All colors use OKLCH (no hex literals). Click is a no-op.

### §4.8 collaboratePane — id: "collaborate"

3 live-persist controls:
- `xai_pref_collab_show_avatars` (toggle, default: true)
- `xai_pref_collab_default_share` (select: comment/edit/view, default: "comment")
- `xai_pref_collab_mention_notify` (toggle, default: true)

No SettingsFooter (source uses live onChange).

### §4.9 stickyPane — id: "sticky"

StickyColorPalette (13 swatches) + font size select (4 options) +
pin-default toggle + restore-size toggle + 4 spacing buttons.
Keys: `xai_pref_sticky_color`, `_font`, `_pin_default`, `_restore_size`, `_grid_spacing`.

### §4.10 hotkeysPane — id: "hotkeys"

10-row read-only table (`HOTKEYS_TABLE` const). No edit affordance.

### §4.11 aboutPane — id: "about"

Hard-coded `APP_VERSION = "v 1.2.0"`, `BUILD_DATE = "2026.05.23"`.
4 link buttons (no-op). Bilingual description.

## §5 Error Semantics

- No thrown errors from pane render functions.
- `usePref` returns the registry default if localStorage is unavailable (SSR-safe).
- `dialog.showModal()` and `dialog.close()` are guarded by typeof checks.
