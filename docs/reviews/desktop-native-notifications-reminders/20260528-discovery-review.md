# Discovery Review — desktop-native-notifications-reminders

## Problem Framing

Phase 2 needs native macOS reminder delivery without reopening Phase 3 storage or sync work.

The accepted requirement is narrower than "build a full reminder system":

- deliver native macOS notifications for task reminders, pomodoro completion, and calendar reminders
- respect permission prompts and show clear denied / disabled / unsupported states
- keep the active product surface as the shipped normal-window Tauri app around `apps/web`
- do not introduce local-first editing, offline write queues, new persistent reminder tables, or storage migrations

Current repo reality:

- the active desktop runtime is `apps/web` inside the Tauri `main` window (`apps/desktop/src-tauri/tauri.conf.json`) with `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- `apps/web/src/**/*` is under a browser-safety lint guard that forbids `@tauri-apps/*` imports (`apps/web/eslint.config.js`)
- the browser-safety verification pattern already expects `pnpm --filter @repo/web build` and `rg "@tauri-apps|__TAURI__" apps/web/dist/assets/*.js` to stay clean
- the shipped host already owns native menu/config behavior (`desktop-basic-macos-menu-config-store`)
- the desktop Rust app currently initializes `tauri-plugin-opener`, but not notifications (`apps/desktop/src-tauri/src/lib.rs`, `Cargo.toml`)
- stable web-side notification prefs already exist in `@repo/plugin-web-settings-rest` / `@repo/plugin-web-storage`:
  - `xai_pref_notif_enabled`
  - `xai_pref_notif_done_sound`
  - `xai_pref_notif_push_task`
  - `xai_pref_notif_push_pomo`
  - `xai_pref_notif_push_habit`
  - `xai_pref_notif_quiet`
  - `xai_pref_notif_quiet_start`
  - `xai_pref_notif_quiet_end`
- stable web-side reminder-adjacent prefs already exist in the More pane:
  - `xai_pref_more_default_rem_due`
  - `xai_pref_more_default_rem_all`
- stable event/data surfaces already available today:
  - `@repo/plugin-web-pomodoro` emits `web:pomodoro:session-finished`
  - `@repo/plugin-web-tasks` persists `xai_task_cols`, but the public task shape only exposes presentation-oriented dates (`date`, `dateZh`, `dateLabel`)
  - `@repo/plugin-web-calendar` renders `SAMPLE_EVENTS`; the current public surface exposes `CalEventsByDay`, `DisplayedMonth`, and related view types, but not a desktop reminder projection

That leaves two planning questions:

1. What desktop runtime seam allows native notifications without leaking `@tauri-apps/*` or `__TAURI__` into the `apps/web` bundle?
2. What is the exact reminder-capable subset of today's task/calendar data, and how does the feature report everything else honestly as `unsupported`?

## Naming Rationale

Use the roadmap slug `desktop-native-notifications-reminders`.

Why it fits:

- `desktop-native` keeps scope on the Tauri/macOS host rather than web-only browser notifications
- `notifications` is the user-visible capability
- `reminders` clarifies that this is driven by existing app reminder/due/completion data, not a generic status-bar or messaging feature

## External Research

This feature involves a current Tauri API decision, so the discovery pass checked primary sources.

### Search Queries

- `Tauri 2 notifications plugin macOS permission request official docs`
- `site:docs.rs tauri WebviewWindowBuilder initialization_script`
- `site:v2.tauri.app withGlobalTauri config official docs`
- `Web Notifications API MDN requestPermission Notification`
- `site:developer.apple.com UNUserNotificationCenter macOS documentation`

### Source Evidence

- Tauri notifications plugin docs: <https://v2.tauri.app/plugin/notification/>
  - The official plugin supports `macos`.
  - Setup is first-class in Tauri 2: add the Rust plugin, initialize it in `lib.rs`, optionally install the guest JS package, and the same guest surface is also available through `window.__TAURI__.notification` when `withGlobalTauri` is enabled.
- Tauri JS reference for notifications: <https://v2.tauri.app/reference/javascript/notification/>
  - The guest surface covers the v1 flow this feature needs: permission check/request plus send.
- Tauri `WebviewWindowBuilder` docs: <https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html>
  - Tauri supports an `initialization_script(...)` seam for injecting JS into the main frame before the page scripts run.
- Tauri config reference (`withGlobalTauri`): <https://v2.tauri.app/reference/config/>
  - `withGlobalTauri` exposes the Tauri JS guest API on `window.__TAURI__`.
- MDN Notifications API: <https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API>
  - Browser notifications require browser permission and are bound to browser runtime behavior, not the Tauri desktop host contract.
- Apple `UNUserNotificationCenter`: <https://developer.apple.com/documentation/usernotifications/unusernotificationcenter>
  - Apple’s current native notification framework is `UNUserNotificationCenter`.

## Candidate Options

### Option A — Official Tauri notification plugin plus a desktop-injected adapter and feature-owned bridge

Use `tauri-plugin-notification` on the desktop host and add a new feature-owned package layer that:

- keeps `apps/web` browser-safe
- reads a host-injected desktop notification adapter from a feature-owned global
- maps reminder candidates from stable existing app data
- applies desktop-only policy:
  - master enabled toggle
  - per-source enabled toggles
  - quiet hours
  - dedup
  - unsupported / unavailable states
- sends local macOS notifications through the Tauri plugin

Recommended split:

- Desktop host:
  - initialize `tauri_plugin_notification::init()` in Rust
  - enable `withGlobalTauri`
  - inject a main-frame init script that exposes `globalThis.__XAI_DESKTOP_NOTIFICATION__` by mapping the Tauri notification guest surface into a feature-owned adapter
- Browser-safe web host:
  - mount `@repo/desktop-native-notifications-reminders/web` from `apps/web/src/providers/AppProviders.tsx`
  - the `/web` entrypoint reads `resolveWebRuntimeProfile(...)` and talks only to `globalThis.__XAI_DESKTOP_NOTIFICATION__`
- Reminder sources:
  - Pomodoro:
    - reuse the existing stable `web:pomodoro:session-finished` event
  - Tasks:
    - add an additive public projector export in `@repo/plugin-web-tasks`
    - support only parseable absolute display dates already present in `TaskCard.date`
  - Calendar:
    - add an additive public projector export in `@repo/plugin-web-calendar`
    - support only timed events from the current in-memory month dataset

Pros:

- matches the active P1/P2 desktop architecture
- keeps `apps/web` and browser-shared packages free of `@tauri-apps/*`
- preserves the existing browser-safety verification contract
- uses official, current Tauri APIs instead of a custom native bridge
- allows honest disabled / denied / unsupported states
- avoids Phase 3 storage or sync work

Cons:

- requires an explicit host-injected adapter seam rather than a direct JS import in `apps/web`
- task/calendar reminder semantics are constrained by today’s public data shapes
- build/verify must carefully separate "native delivery works" from "all reminder sources are fully modeled"

### Option B — Browser Notification API from the bundled web app

Trigger notifications with `window.Notification` / `Notification.requestPermission()` entirely from the web runtime.

Pros:

- minimal Rust changes
- familiar browser API

Cons:

- wrong ownership for a Tauri desktop-native capability
- permission/state behavior is browser-centric, not desktop-host-centric
- does not solve the review requirement for a desktop-only Tauri seam
- would keep native delivery coupled to browser behavior instead of the desktop host

### Option C — Custom macOS-only native bridge around Apple User Notifications

Write direct Rust/macOS integration against Apple notification APIs and expose custom Tauri commands/events.

Pros:

- maximum native control

Cons:

- unnecessary custom bridge when Tauri already ships an official plugin
- larger maintenance surface
- easy to overbuild Phase 2 scope

## Recommendation

Choose Option A.

The official Tauri notification plugin is the correct transport layer, but the build must not import it into `apps/web` or any browser-shared package. The correct seam is:

> Tauri host injects a feature-owned global adapter; the `apps/web` runtime consumes only the browser-safe feature `/web` entrypoint.

This keeps the Phase 1/2 browser-safety contract intact while still enabling native notifications inside the wrapped runtime.

## Frozen Runtime Adapter Seam

### Browser-safe side

`apps/web` may import only:

- `@repo/desktop-native-notifications-reminders/web`

That entrypoint must remain browser-safe:

- no `@tauri-apps/*` imports
- no `window.__TAURI__` references
- no transitive browser-bundle leak of native code

Recommended mount point:

- `apps/web/src/providers/AppProviders.tsx`

Recommended responsibility:

- mount `DesktopNativeNotificationsBridge`
- read `resolveWebRuntimeProfile(...)`
- when profile is not `desktop-phase1-offline`, degrade to a no-op/browser-safe unsupported path
- when profile is `desktop-phase1-offline`, consume only `globalThis.__XAI_DESKTOP_NOTIFICATION__`

### Desktop-only side

Desktop ownership stays outside the `apps/web` bundle:

- `apps/desktop/src-tauri/src/lib.rs`
- `apps/desktop/src-tauri/tauri.conf.json`
- a new feature-owned desktop init-script asset/source loaded from the Tauri host

Frozen rule:

- the init script is the only place allowed to touch the Tauri notification guest surface (`window.__TAURI__.notification` / `@tauri-apps/plugin-notification` capability surface)
- it maps that surface into:

```ts
globalThis.__XAI_DESKTOP_NOTIFICATION__ = {
  isPermissionGranted,
  requestPermission,
  sendNotification,
};
```

Build/verify consequence:

- `apps/web/src/**/*` remains free of `@tauri-apps/*`
- `pnpm --filter @repo/web build` remains green
- `rg "@tauri-apps|__TAURI__" apps/web/dist/assets/*.js` remains zero-match

## Frozen Reminder-Source Contract

### Pomodoro

No additive export required in v1.

Source contract stays:

- typed event `web:pomodoro:session-finished`
- payload fields already present today:
  - `mode`
  - `durationMs`
  - `finishedAt`

V1 support:

- always reminder-capable for completion notifications after policy checks

### Tasks

Add one exact additive public export to `@repo/plugin-web-tasks`:

- `projectDesktopTaskReminderEntries(...)`

Recommended exported types:

- `DesktopTaskReminderEntry`
- `DesktopTaskReminderUnsupportedReason`

Frozen input contract for v1:

- `ReadonlyArray<TaskCol>`
- `TaskDefaultReminderAll`
- `TaskDefaultReminderDue`
- local `now`

Reminder-capable subset in v1:

- only task cards with `TaskCard.date` populated as an absolute display date already used today:
  - `"M/D"`
  - `"Mon D"`
- these dates are interpreted with a documented next-upcoming local-date heuristic:
  - try current year
  - if already elapsed, roll to next year
- because the public task shape has no time-bearing field, these become **all-day reminders only**
- only `xai_pref_more_default_rem_all` is applied in v1:
  - `none`
  - `9am`
  - `day_before`

Explicit unsupported fallback in v1:

- task has only `dateLabel` and no absolute `date` → `unsupported`
- task has no `date` → `unsupported`
- task would require a due-time-specific reminder (`xai_pref_more_default_rem_due`) but the public task shape exposes no due-time field → `unsupported`
- non-parseable display strings → `unsupported`

Frozen rule:

- `xai_pref_more_default_rem_due` is read but not used for current `xai_task_cols` cards unless a future public time-bearing field is added to the stable task contract
- this feature does not add that field

### Calendar

Add one exact additive public export to `@repo/plugin-web-calendar`:

- `projectDesktopCalendarReminderEntries(...)`

Recommended exported types:

- `DesktopCalendarReminderEntry`
- `DesktopCalendarReminderUnsupportedReason`

Frozen input contract for v1:

- `DisplayedMonth`
- `CalEventsByDay`
- local `now`

Reminder-capable subset in v1:

- only events in the active in-memory month dataset
- only events with a `time: "HH:MM"` field
- `endTime` is optional and not required for reminder scheduling

Explicit unsupported fallback in v1:

- all-day/sample events with no `time` → `unsupported`
- day slots with empty arrays → no candidate
- data outside the currently projected month dataset → `unsupported`

Frozen rule:

- the source of truth is the currently loaded calendar dataset, which is still `SAMPLE_EVENTS` today
- Phase 2 may schedule reminders from that visible dataset, but it must not claim persistence, syncing, or hidden calendar storage

## Selected Execution Notes

### Package ownership

Recommended owning slice:

- `packages/desktop-native-notifications-reminders/`

This package should own:

- browser-safe `/web` entrypoint
- global adapter type contract
- permission state mapping
- reminder candidate normalization
- quiet-hours policy
- dedup keys
- desktop-only status mapping

Host responsibilities stay thin:

- `apps/desktop/src-tauri/`: plugin init, `withGlobalTauri`, init-script injection
- `apps/web`: mount the feature package’s browser-safe bridge in the existing providers layer

### Stable dependencies only

Direct runtime dependencies may rely on:

- `@repo/plugin-web-pomodoro`
- `@repo/plugin-web-tasks`
- `@repo/plugin-web-calendar`
- `@repo/plugin-web-settings-rest`
- `@repo/plugin-web-storage`
- `@repo/xai-web-event-bus`
- existing native menu/config baseline (`desktop-basic-macos-menu-config-store`) — SHIPPED precondition

Do **not** make this feature depend directly on:

- `packages/plugin-productivity/`
- `packages/plugin-calendar/`
- overlay/control/grid legacy surfaces

### Settings contract impact

The Notifications pane currently covers task/pomodoro/habit. For this feature the Phase 2-safe delta is:

- add `xai_pref_notif_push_calendar`
- add desktop-native permission/status copy for:
  - `permission-required`
  - `denied`
  - `unsupported`
- leave `xai_pref_notif_push_habit` untouched in this feature; habit desktop reminders are out of scope for this row

This is an additive registry/key contract only. It is **not** a storage migration.

## Risks

- the task source remains semantically weak because its stable public shape exposes display dates, not canonical due/reminder timestamps
- the calendar source remains sample-data-backed, so reminder scheduling must stay honest about session/current-month limits
- the desktop adapter seam depends on careful Tauri host injection; build must not let native strings leak into the `apps/web` dist
- permission prompts can be disruptive if auto-triggered; prompting must remain explicit and user-initiated where feasible
- if the build starts adding new reminder persistence or sync semantics, it will violate the Phase 2 boundary

## Open Questions

- Should the Settings pane replace the habit toggle with calendar, or add calendar while leaving habit untouched? Recommendation: add calendar and leave habit unchanged in this row to avoid unnecessary product-surface churn.
- Should unsupported task/calendar rows surface per-item copy or only section-level copy? Recommendation: section-level copy is enough for Phase 2; per-item unsupported UI can wait for richer source semantics.
