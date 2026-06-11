# desktop-native-notifications-reminders — API / Contract Notes

## Contract Summary

This feature is a desktop-native bridge contract, not an HTTP/API feature.

Primary surfaces:

- Tauri notifications plugin initialization and host injection
- feature-owned browser-safe bridge entrypoint
- global desktop adapter contract
- additive stable web-package projector exports for reminder candidates
- additive notification preference/status wiring in Settings

## Upstream Interfaces

### Native notification transport

Expected transport:

- `tauri-plugin-notification` initialized in `apps/desktop/src-tauri/src/lib.rs`
- `withGlobalTauri` enabled in `apps/desktop/src-tauri/tauri.conf.json`
- the desktop host injects a feature-owned init script that maps the Tauri notification guest surface into a global adapter

Frozen adapter contract:

```ts
type DesktopNotificationPermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale";

interface DesktopNotificationRuntimeAdapter {
  isPermissionGranted(): Promise<boolean>;
  requestPermission(): Promise<DesktopNotificationPermissionState>;
  sendNotification(input: {
    title: string;
    body?: string;
    tag?: string;
  }): Promise<void> | void;
}

declare global {
  interface Window {
    __XAI_DESKTOP_NOTIFICATION__?: DesktopNotificationRuntimeAdapter;
  }
}
```

Frozen ownership rule:

- `apps/web` must not import `@tauri-apps/*`
- `apps/web` must not reference `window.__TAURI__`
- only the desktop host init-script path may touch the Tauri notification guest surface

### Browser-safe feature entrypoint

Expected public entrypoint:

- `@repo/desktop-native-notifications-reminders/web`

Expected responsibility:

- mount the reminder bridge from `apps/web/src/providers/AppProviders.tsx`
- read `resolveWebRuntimeProfile(...)`
- consume `window.__XAI_DESKTOP_NOTIFICATION__` only when the runtime is `desktop-phase1-offline`
- return explicit unsupported/degraded states outside that runtime

### Stable web preference inputs

Existing prefs that remain authoritative:

- `xai_pref_notif_enabled`
- `xai_pref_notif_push_task`
- `xai_pref_notif_push_pomo`
- `xai_pref_notif_quiet`
- `xai_pref_notif_quiet_start`
- `xai_pref_notif_quiet_end`
- `xai_pref_more_default_rem_due`
- `xai_pref_more_default_rem_all`

Expected additive pref for this feature:

- `xai_pref_notif_push_calendar`

Existing but non-consumed-in-v1 pref:

- `xai_pref_notif_push_habit`

This is an additive registry/key contract only. It is **not** a storage migration.

### Stable reminder-source contracts

#### Pomodoro

Source:

- existing typed event `web:pomodoro:session-finished`

Payload already available:

- `mode`
- `durationMs`
- `finishedAt`

Desktop bridge contract:

- one completion notification per emitted session occurrence after policy checks

#### Tasks

Expected additive public surface on `@repo/plugin-web-tasks`:

- `projectDesktopTaskReminderEntries(...)`
- exported types:
  - `DesktopTaskReminderEntry`
  - `DesktopTaskReminderUnsupportedReason`

Frozen v1 input basis:

- `ReadonlyArray<TaskCol>`
- `TaskDefaultReminderAll`
- `TaskDefaultReminderDue`
- local `now`

Frozen v1 supported subset:

- only `TaskCard.date` values that are already public and parseable as:
  - `"M/D"`
  - `"Mon D"`
- derive the next upcoming local calendar date using:
  - current year first
  - next year on rollover
- output all-day reminder candidates only
- apply `TaskDefaultReminderAll` only:
  - `none`
  - `9am`
  - `day_before`

Frozen v1 unsupported semantics:

- `TaskCard.dateLabel` with no absolute `date` → `unsupported`
- missing `date` → `unsupported`
- non-parseable display date → `unsupported`
- any reminder path that would require a public due-time field → `unsupported`

Frozen rule:

- `TaskDefaultReminderDue` is explicitly ignored for current `xai_task_cols` cards because the stable public task shape exposes no due-time field
- this feature does not add such a field

Recommended output shape:

```ts
type DesktopTaskReminderUnsupportedReason =
  | "missing_absolute_date"
  | "relative_label_only"
  | "date_parse_failed"
  | "no_public_due_time";

type DesktopTaskReminderEntry =
  | {
      status: "candidate";
      occurrenceKey: string;
      taskId: string;
      title: string;
      triggerAtIso: string;
      allDay: true;
    }
  | {
      status: "unsupported";
      taskId: string;
      reason: DesktopTaskReminderUnsupportedReason;
    };
```

#### Calendar

Expected additive public surface on `@repo/plugin-web-calendar`:

- `projectDesktopCalendarReminderEntries(...)`
- exported types:
  - `DesktopCalendarReminderEntry`
  - `DesktopCalendarReminderUnsupportedReason`

Frozen v1 input basis:

- `DisplayedMonth`
- `CalEventsByDay`
- local `now`

Frozen v1 supported subset:

- only events from the active in-memory month dataset
- only events with `time: "HH:MM"`
- `endTime` remains optional and is not required for reminders

Frozen v1 unsupported semantics:

- event has no `time` → `unsupported`
- event falls outside the currently projected month dataset → `unsupported`
- empty day slots yield no candidates

Frozen rule:

- current support is based on the visible calendar dataset, which is `SAMPLE_EVENTS` today
- the feature may surface native reminders from that dataset, but it may not invent persistence or syncing semantics behind it

Recommended output shape:

```ts
type DesktopCalendarReminderUnsupportedReason =
  | "event_has_no_time"
  | "outside_active_month_dataset";

type DesktopCalendarReminderEntry =
  | {
      status: "candidate";
      occurrenceKey: string;
      day: number;
      title: string;
      triggerAtIso: string;
    }
  | {
      status: "unsupported";
      day: number;
      title: string;
      reason: DesktopCalendarReminderUnsupportedReason;
    };
```

## Downstream Interfaces

### Desktop notification bridge contract

Recommended internal state shape:

```ts
type DesktopNotificationSource = "task" | "pomodoro" | "calendar";

type DesktopNotificationStatus =
  | "ready"
  | "disabled"
  | "permission-required"
  | "denied"
  | "unsupported";

interface ReminderCandidate {
  source: DesktopNotificationSource;
  occurrenceKey: string;
  title: string;
  body: string;
  triggerAtIso: string;
  sound: "none" | "subtle" | "chime" | "bell" | "pop";
}
```

Required semantics:

- evaluate prefs before scheduling/sending
- evaluate quiet hours before scheduling/sending
- dedup by `occurrenceKey`
- treat unsupported items/sources as non-fatal
- never block the app if notification send fails

### Settings/UI contract

The Settings Notifications pane must be able to reflect:

- master enabled/disabled
- per-source toggles including calendar
- permission-required / denied copy
- unsupported-source copy where applicable

Frozen UI rule:

- the pane should not auto-prompt on every render
- permission requests must be explicitly triggered from a user action
- habit toggle remains present but is not re-scoped by this feature

## Error Semantics

- plugin init failure is a desktop-host failure and should surface clearly during build/verify
- missing desktop adapter in a non-desktop runtime maps to `unsupported`, not crash
- permission state `prompt` / `prompt-with-rationale` becomes `permission-required` until the user explicitly acts
- permission state `denied` must not repeatedly auto-prompt
- missing or non-reminder-capable task/calendar items map to `unsupported`, not crash
- `sendNotification(...)` failure is non-fatal and should not corrupt app data

## Permission Notes

- notification capability scope must be explicit in Tauri capabilities
- prompting should remain user-aware and desktop-specific
- no unrelated capability widening should be introduced to force reminder behavior

## Idempotency Notes

- pomodoro: at most one native notification per `web:pomodoro:session-finished` occurrence
- task: at most one native notification per `(taskId, triggerAtIso)` while the bridge instance is active
- calendar: at most one native notification per `(occurrenceKey, triggerAtIso)` while the bridge instance is active
- reloading/remounting may re-arm future reminders, but should not duplicate already-fired notifications within the same running bridge instance

## Explicit Exclusions

- no new sync queue
- no new local-first reminder table
- no migration of web prefs into native storage
- no overlay notification surface
- no dependency on legacy overlay/control/grid startup behavior

## Implementation Notes (2026-05-28)

- Desktop host now initializes `tauri-plugin-notification`, enables `app.withGlobalTauri`, injects a host-owned `window.__XAI_DESKTOP_NOTIFICATION__` adapter via `desktop_notification_adapter.js`, and grants `notification:default` in `capabilities/default.json`.
- Browser-safe runtime mount is active at `apps/web/src/providers/AppProviders.tsx` through `@repo/desktop-native-notifications-reminders/web`.
- `@repo/plugin-web-tasks` now exports `projectDesktopTaskReminderEntries(...)` with v1 subset and `unsupported` reasons (`missing_absolute_date`, `relative_label_only`, `date_parse_failed`, `no_public_due_time`).
- `@repo/plugin-web-calendar` now exports `projectDesktopCalendarReminderEntries(...)` with v1 subset and `unsupported` reasons (`event_has_no_time`, `outside_active_month_dataset`).
- Settings Notifications pane adds `xai_pref_notif_push_calendar`, desktop delivery status copy, and explicit permission-request action; auto-prompt on render remains disabled.
