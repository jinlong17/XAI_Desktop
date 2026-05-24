# API Contract — @repo/plugin-web-settings-rest

> **Row**: xai-web-settings-rest (#24, W4b · Settings remaining 11 panes)
> **Date**: 2026-05-23
> **Public surface**: `packages/plugin-web-settings-rest/src/index.ts` is the ONLY allowed import path. Never import from `src/internal/*` or `src/panes/*`.

---

## 0. Surface map

```ts
// Side-effect global CSS
import "./styles.css";

// Per-pane Pane objects (sibling rows / composition seam consume one or more)
export { accountPane }       from "./panes/accountPane.js";
export { premiumPane }       from "./panes/premiumPane.js";
export { smartListsPane }    from "./panes/smartListsPane.js";
export { notificationsPane } from "./panes/notificationsPane.js";
export { dateTimePane }      from "./panes/dateTimePane.js";
export { morePane }          from "./panes/morePane.js";
export { integrationsPane }  from "./panes/integrationsPane.js";
export { collaboratePane }   from "./panes/collaboratePane.js";
export { stickyPane }        from "./panes/stickyPane.js";
export { hotkeysPane }       from "./panes/hotkeysPane.js";
export { aboutPane }         from "./panes/aboutPane.js";

// Aggregate (every Pane keyed by its SettingsPaneId)
export { restPanesById }     from "./internal/restPanesById.js";

// Composition helper for the host seam
export { applyRestPanesToRegistry } from "./internal/applyRestPanesToRegistry.js";

// Public types (small set — most live inside panes; only those crossing the seam are exported)
export type {
  SmartListId,
  SmartListVisibility,
  StickyColorId,
  StickyFontSize,
  StickyGridSpacing,
  WindowType,
  TaskDefaultDate,
  TaskDefaultReminderDue,
  TaskDefaultReminderAll,
  TaskDefaultPriority,
  TaskDefaultTagId,
  TaskDefaultListId,
  AddTo,
  OverdueAt,
  DefaultShare,
  IntegrationCardId,
} from "./types.js";
```

Side-effect global CSS: `import "./styles.css"` at the top of `src/index.ts`.

## 1. Types

### 1.1 Pane id mapping (consumed from chassis)

This package does NOT extend `SettingsPaneId` — the closed union from `@repo/plugin-web-settings-shell` already enumerates all 13 ids. Each exported `Pane` object's `id` matches one of the 11 ids this row owns (account/premium/smart_lists/notifications/date_time/more/integrations/collaborate/sticky/hotkeys/about).

### 1.2 New literal unions

```ts
// Smart Lists — tri-state visibility per built-in list
export type SmartListId =
  | "all" | "today" | "tomorrow" | "next7" | "assigned"
  | "inbox" | "summary" | "tags" | "filters"
  | "completed" | "wont_do" | "trash";

export type SmartListVisibility = "show" | "if-not-empty" | "hide";

// Sticky Note
export type StickyColorId =
  | "sun" | "peach" | "coral" | "sky" | "indigo" | "lilac" | "mint"
  | "white" | "silver" | "graphite" | "navy" | "midnight"
  | "random";  // sentinel — renders as conic-gradient

export type StickyFontSize = "small" | "normal" | "large" | "xl";
export type StickyGridSpacing = "none" | "normal" | "large" | "xl";

// More pane — selects
export type WindowType = "window" | "tray" | "full";
export type TaskDefaultDate = "none" | "today" | "tomorrow";
export type TaskDefaultReminderDue = "none" | "on_time" | "5min" | "15min";
export type TaskDefaultReminderAll = "none" | "9am" | "day_before";
export type TaskDefaultPriority = "none" | "low" | "med" | "high";
export type TaskDefaultTagId = "none" | "study" | "work" | "personal";
export type TaskDefaultListId = "inbox" | "today";
export type AddTo = "top" | "bottom";
export type OverdueAt = "top" | "bottom";

// Collaborate
export type DefaultShare = "comment" | "edit" | "view";

// Integrations (placeholder cards)
export type IntegrationCardId =
  | "wechat" | "gcal" | "notion"
  | "local" | "outlook" | "exchange" | "icloud" | "wecom" | "dingtalk" | "feishu" | "caldav" | "url"
  | "slack" | "linear" | "gh" | "todoist";
```

### 1.3 `Pane` objects (re-using chassis `Pane` interface)

Each exported `Pane` object has shape:

```ts
{
  readonly id: SettingsPaneId;       // one of the 11 this row owns
  readonly icon: WebShellIconName;   // same icon the chassis placeholder used (preserves sidebar parity)
  readonly i18nKey: `settings.${string}`;
  readonly render: (props: PaneRenderProps) => React.ReactElement;
}
```

The `icon` + `i18nKey` are preserved byte-for-byte from chassis `paneRegistry.tsx` lines 47-65 so the sidebar visual stays identical when `composeSettingsPaneRegistry()` swaps in this row's panes.

### 1.4 `restPanesById`

```ts
export const restPanesById: Readonly<Record<
  | "account" | "premium" | "smart_lists" | "notifications" | "date_time"
  | "more" | "integrations" | "collaborate" | "sticky" | "hotkeys" | "about",
  Pane
>>;
```

Useful for callers that want to look up by id without an `if/else` ladder.

### 1.5 `applyRestPanesToRegistry`

```ts
/**
 * Returns a new pane registry array with the 11 placeholder panes from the chassis
 * substituted by this row's panes. Preserves order, length, ids, icons, i18nKeys.
 *
 * The host composition seam at apps/web/src/routes/modules/settingsPaneComposition.ts
 * uses this helper to apply all 11 substitutions in one call. Alternatively, the
 * host can switch case per id — both forms are supported.
 */
export function applyRestPanesToRegistry(
  registry: readonly Pane[],
): readonly Pane[];
```

Idempotent: calling on an already-substituted registry returns equivalent output.

## 2. Component contracts

### 2.1 `<DeleteAccountConfirmModal>` (internal — NOT exported)

```tsx
interface DeleteAccountConfirmModalProps {
  open: boolean;
  lang: Lang;
  onCancel: () => void;
  onConfirm: () => void;  // caller decides whether to emit; accountPane wires emit + close here
}
```

Implementation: a `<dialog ref={dialogRef}>` element + `useEffect` that calls `dialogRef.current?.showModal()` / `.close()` in response to the `open` prop. Cancel = `dialog.close()` + `onCancel()`. Confirm = `onConfirm()` then `dialog.close()`.

Bilingual labels:

| Slot | EN | ZH |
|---|---|---|
| Title | `"Delete account?"` | `"注销账号？"` |
| Body | `"This action is permanent. All cloud data will be removed and the account cannot be restored."` | `"此操作不可撤销。所有云端数据将被删除，账号无法恢复。"` |
| Cancel button | `"Cancel"` | `"取消"` |
| Confirm button | `"Delete account"` | `"确认注销"` (with `.danger` className) |

### 2.2 `<StickyColorPalette>` (internal)

```tsx
interface StickyColorPaletteProps {
  selected: StickyColorId;
  onSelect: (id: StickyColorId) => void;
}
```

Renders 13 buttons. Each non-random button's `style` is `{ background: \`var(--sticky-note-color-${id})\` }`. The `random` button's style is `{ background: CONIC_RANDOM }` where `CONIC_RANDOM` is the literal string `"conic-gradient(from 0deg, var(--sticky-note-color-coral), var(--sticky-note-color-sun), var(--sticky-note-color-mint), var(--sticky-note-color-indigo), var(--sticky-note-color-lilac), var(--sticky-note-color-coral))"`. Active state via `data-active="true"` attribute. No hex literals in this component.

### 2.3 `<HotkeysTable>` (internal)

Pure render of 10 rows. `lang` prop controls action labels. Keys are split by space and rendered as `<kbd>` children, matching source line 1004.

### 2.4 `<IntegrationCardGrid>` + `<IntegrationCard>` (internal)

`IntegrationCardGrid` accepts `cards: IntegrationCardSpec[]` and `lang: Lang` props; renders a `.int-grid` flex grid. Each `<IntegrationCard>` is a `<button type="button">` with logo (`background: card.color`) + first-letter or icon + name. Click handler:

```ts
const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  if (import.meta.env.DEV) {
    console.warn("[settings-rest] integration card is a placeholder", card.id);
  }
};
```

NO event emit, NO state mutation.

### 2.5 `<TaskTemplateCard>` (internal)

Pure render of source line 808-818. `template.items` is the bilingual list.

## 3. Event contracts

This row **emits** but does not **subscribe** to events.

### 3.1 `web:settings:rest:account-delete-confirmed` (NEW — declaration-only)

```ts
'web:settings:rest:account-delete-confirmed': {
  /** ISO timestamp of when the user clicked confirm. */
  confirmedAt: string;
};
```

Emitted exactly once when the user clicks "Confirm delete" inside `<DeleteAccountConfirmModal>`. No consumer ships in this row; declared so future rows can subscribe without an EventMap edit.

Pattern precedent: `web:pomodoro:session-finished` (row #14), `web:habits:checkin-recorded` (row #15).

### 3.2 No other emits

Smart Lists / Notifications / Date & Time / More / Sticky Note / Collaborate panes persist via `setPref` and do NOT emit on `web:settings:preference-changed` (their keys are not part of the canonical 7 `WebPreferenceKey` union). The chassis Save / Reset paths still pass through (Save flash + Reset clears these row's keys via the `xai_*` prefix filter — verified against chassis api.md §5.1).

## 4. Pane-by-pane summary

### 4.1 `accountPane`

| Slot | Type | Source line | Persist key |
|---|---|---|---|
| Avatar | SVG | 107-118 | — (mock) |
| Name | text | 120 | — (mock — `"百事可爱" / "Aki Chen"`) |
| Email | text | 121 | — (mock — `aki.chen@xai.app`) |
| Free-tier line | text + inline button | 122-124 | — |
| Sign Out button | btn ghost | 126 | — (no-op v1; future row plugs auth) |
| Delete Account button | btn danger | 127 | — (opens DeleteAccountConfirmModal) |

### 4.2 `premiumPane`

Static render. No persisted state. CTA button is a no-op v1.

### 4.3 `smartListsPane`

3 grouped sections × N rows × `<select>`. Persists via single `xai_pref_smart_lists` JSON key (record from `SmartListId` to `SmartListVisibility`). Defaults: every list `"show"` except `assigned` and `wont_do` which default to `"if-not-empty"` (source lines 316, 332).

### 4.4 `notificationsPane`

| Control | Persist key | Type |
|---|---|---|
| Enable notifications | `xai_pref_notif_enabled` | boolean |
| Task due toggle | `xai_pref_notif_push_task` | boolean |
| Pomodoro complete toggle | `xai_pref_notif_push_pomo` | boolean |
| Habit reminder toggle | `xai_pref_notif_push_habit` | boolean |
| Completion sound | `xai_pref_notif_done_sound` | string |
| Quiet hours toggle | `xai_pref_notif_quiet` | boolean |
| Quiet start time | `xai_pref_notif_quiet_start` | string ("HH:MM") |
| Quiet end time | `xai_pref_notif_quiet_end` | string ("HH:MM") |

Time-range inputs are visible only when quiet=true (matches source line 430).

### 4.5 `dateTimePane`

5 controls; 5 keys (`xai_pref_dt_start_week` + 4 booleans). Time-zone toggle's description is a multi-line string matching source line 483.

### 4.6 `morePane`

The heaviest pane — 14 persisted keys. Sections:

1. Language (read-only "follow system" — source line 700-705)
2. Window + Launch (3 keys)
3. Smart Recognition (4 keys; one row uses inline-checkbox in `children`)
4. Task Default — Reminders (3 selects, 3 keys)
5. Task Default — Defaults (3 selects, 3 keys)
6. Add to / Overdue at (2 selects, 2 keys)
7. Reset Default link — clears the 14 More-owned keys via `removePref(key)` then forces a re-mount (key list hardcoded inside `morePane.tsx`)
8. Task Template — 3 cards rendered from `TEMPLATES` (source line 676-695) — read-only

### 4.7 `integrationsPane`

3 sections. 17 cards total. Each card render uses `<IntegrationCard>` per §2.4.

### 4.8 `collaboratePane`

3 controls; 3 keys. Live-persist on every change (no Save footer per source line 879-895).

### 4.9 `stickyPane`

| Control | Persist key | Type |
|---|---|---|
| Color palette (13 swatches) | `xai_pref_sticky_color` | string (`StickyColorId`) |
| Font size | `xai_pref_sticky_font` | string |
| Default pin | `xai_pref_sticky_pin_default` | boolean |
| Restore default size | `xai_pref_sticky_restore_size` | boolean |
| Grid spacing | `xai_pref_sticky_grid_spacing` | string |

### 4.10 `hotkeysPane`

Read-only. 10 rows from a constant `HOTKEYS_TABLE` (source line 984-995).

### 4.11 `aboutPane`

Static. Logo, version (`v 1.2.0`), build (`2026.05.23`), bilingual description, 4 link buttons (no-op v1).

## 5. Error semantics

- `<DeleteAccountConfirmModal>` open/close transitions are idempotent; calling `showModal()` on an already-open dialog is a no-op (per HTML spec). Wrap in try/catch in dev to silence the warning if the polyfill is absent.
- `restPanesById["unknown" as SettingsPaneId]` returns `undefined` — caller must narrow. The 11 owned ids are statically enumerated in the Record key set.
- `applyRestPanesToRegistry([])` returns `[]` (empty input → empty output; not an error).
- `applyRestPanesToRegistry(reg)` where `reg` has a pane id not in this row's 11 (e.g. `appearance`/`features`) leaves that entry untouched.

## 6. Stability + versioning

- This package is `In-Dev` until row #24 ships (per PLUGIN_MAP audit at ship-time).
- 11 `Pane` exports + `restPanesById` + `applyRestPanesToRegistry` are the public surface; freezing after row #24 ship.
- Adding a new pane (e.g. if DESIGN.md grows to 14) requires the chassis `SettingsPaneId` to be extended (SemVer minor on chassis) — this package would then add another `Pane` export (SemVer minor here).
- The 37 new `xai_pref_*` registry keys are `schemaVersion: 1`; any shape change requires bumping that field + registering a migration in `@repo/plugin-web-storage`'s `migrate` helper.

## 7. Migration guidance for the host

`apps/web/src/routes/modules/settingsPaneComposition.ts` — extend the switch:

```ts
import {
  accountPane, premiumPane, smartListsPane, notificationsPane, dateTimePane,
  morePane, integrationsPane, collaboratePane, stickyPane, hotkeysPane, aboutPane,
} from "@repo/plugin-web-settings-rest";

export function composeSettingsPaneRegistry(): readonly Pane[] {
  return paneRegistry.map((p) => {
    if (p.id === "features") return featuresPane;                  // row #23
    // ---- xai-web-settings-rest row #24 (line-disjoint with #22) ----
    if (p.id === "account")       return accountPane;
    if (p.id === "premium")       return premiumPane;
    if (p.id === "smart_lists")   return smartListsPane;
    if (p.id === "notifications") return notificationsPane;
    if (p.id === "date_time")     return dateTimePane;
    if (p.id === "more")          return morePane;
    if (p.id === "integrations")  return integrationsPane;
    if (p.id === "collaborate")   return collaboratePane;
    if (p.id === "sticky")        return stickyPane;
    if (p.id === "hotkeys")       return hotkeysPane;
    if (p.id === "about")         return aboutPane;
    // ---- xai-web-settings-appearance row #22 will add `appearance` here ----
    return p;
  });
}
```

Alternatively use `applyRestPanesToRegistry(reg)` then layer the other rows' substitutions:

```ts
const afterRest = applyRestPanesToRegistry(paneRegistry);
return afterRest.map((p) => {
  if (p.id === "features") return featuresPane;
  if (p.id === "appearance") return appearancePane;  // row #22
  return p;
});
```

Both forms are valid; the project may pick whichever feels more readable post-W4b.

## 8. Dependencies

- `react ^19.2.0` (peerDep)
- `react-dom ^19.2.0` (peerDep)
- `@repo/core workspace:*` — `EventMap` types via `@repo/xai-web-event-bus`
- `@repo/plugin-web-tokens workspace:*` — `useI18n`, `Lang`
- `@repo/plugin-web-storage workspace:*` — `usePref`, `setPref`, `removePref`, `PREF_REGISTRY`
- `@repo/xai-web-event-bus workspace:*` — `emitWebEvent`
- `@repo/xai-web-shell workspace:*` — `WebShellIconName` (type-only)
- `@repo/plugin-web-settings-shell workspace:*` — chassis atoms + `Pane` type

DevDeps: `@repo/eslint-config`, `@repo/typescript-config`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `jsdom`.

## 9. References

- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S7 / §S8
- Chassis API: `packages/xai-web-settings-shell/docs/api.md` §1.2 (`Pane`), §1.3 (`PaneRenderProps`), §8 (sibling guidance)
- Source: `web design/module-settings.jsx` (per-pane line ranges in design.md §1)
- Sibling precedent: `packages/xai-web-settings-features-panel/docs/api.md`
- Composition seam: `apps/web/src/routes/modules/settingsPaneComposition.ts`
- Event channel: `packages/core/src/types/events.ts` (new declaration)
- Discovery: `docs/reviews/xai-web-settings-rest/20260523-discovery-review.md`
- Design: `packages/xai-web-settings-rest/docs/design.md`
- Tests: `packages/xai-web-settings-rest/docs/test.md`
