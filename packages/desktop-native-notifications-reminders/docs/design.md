# desktop-native-notifications-reminders — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — official Tauri notification plugin plus a desktop-injected adapter and a feature-owned browser-safe bridge |
| Review Doc Path | `docs/reviews/desktop-native-notifications-reminders/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 (revise pass) |
| Feature Type | P1 Phase 2 desktop-native capability on top of the shipped normal-window Tauri host |

## Frozen Assumptions

- The active desktop product remains the ADR-0011 normal-window Tauri wrapper around `apps/web`; overlay/control/grid surfaces stay quarantined.
- This feature owns native notification delivery and reminder presentation only. It does **not** introduce new local-first entity storage, write queues, sync recovery, or schema migrations.
- Native delivery uses the official Tauri notifications plugin, but the desktop runtime seam is split:
  - `apps/web` imports only a browser-safe `/web` entrypoint from this feature package
  - the Tauri host injects a desktop-only notification adapter into `globalThis.__XAI_DESKTOP_NOTIFICATION__`
- `apps/web/src/**/*` and browser-shared packages remain free of `@tauri-apps/*` and `window.__TAURI__` references; the existing browser-safety build guard stays authoritative.
- Stable runtime sources are limited to shipped web packages and existing preference registry entries. `plugin-productivity` and `plugin-calendar` desktop packages remain non-stable and are not direct runtime dependencies for this row.
- Pomodoro completion is fully supported in v1 because `@repo/plugin-web-pomodoro` already emits `web:pomodoro:session-finished`.
- Task reminders are limited to the exact public subset available today:
  - `TaskCard.date` with absolute display formats already in use (`M/D`, `Mon D`)
  - all-day reminder policy only via `xai_pref_more_default_rem_all`
  - no due-time reminders until a future stable public time-bearing task field exists
- Calendar reminders are limited to the current public calendar subset:
  - current in-memory month dataset only
  - timed events only (`time: "HH:MM"`)
  - sample-data-backed support is allowed, but hidden persistence/sync semantics are not
- Any task/calendar item outside those exact subsets must be reported as `unsupported`, not silently approximated beyond the frozen heuristics.

## Dependency Overview

- Upstream authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row #2
  - `docs/reviews/desktop-native-notifications-reminders/20260528-roadmap-seed.md`
- Desktop/native preconditions:
  - `desktop-tauri-web-dist-normal-window` SHIPPED
  - `desktop-basic-macos-menu-config-store` SHIPPED
- Stable web/runtime dependencies:
  - `@repo/plugin-web-pomodoro`
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-calendar`
  - `@repo/plugin-web-settings-rest`
  - `@repo/plugin-web-storage`
  - `@repo/xai-web-event-bus`
  - `@repo/core` runtime-profile utilities
- Native implementation surfaces:
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/Cargo.toml`
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `apps/desktop/src-tauri/capabilities/default.json`

## Native Shape After This Feature

- The desktop app initializes the official Tauri notifications plugin.
- The desktop host injects a feature-owned notification adapter into the main webview runtime.
- The `apps/web` runtime mounts a browser-safe bridge that:
  - reads `resolveWebRuntimeProfile(...)`
  - consumes `globalThis.__XAI_DESKTOP_NOTIFICATION__` only when the profile is `desktop-phase1-offline`
  - otherwise degrades cleanly without native imports
- The desktop runtime can surface local macOS notifications for:
  - pomodoro completion
  - task reminder-capable cases derived from parseable absolute `TaskCard.date` values
  - calendar reminder-capable cases derived from timed events in the current month dataset
- The runtime exposes explicit non-success states:
  - `disabled`
  - `permission-required`
  - `denied`
  - `unsupported`
- No overlay window, tray-only surface, or Phase 3 data layer is reintroduced.

## Ownership Shape

Recommended owning slice:

- `packages/desktop-native-notifications-reminders/`

Recommended responsibilities:

- browser-safe `/web` entrypoint
- global adapter type contract for `__XAI_DESKTOP_NOTIFICATION__`
- permission state mapping
- reminder candidate normalization
- quiet-hours filtering
- dedup keys
- desktop-only notification bridge/service

Recommended thin host responsibilities:

- Rust plugin initialization and capability wiring
- Tauri `withGlobalTauri` enablement
- desktop init-script injection outside the `apps/web` bundle

## Planned Runtime Split

### Phase 1 — Native transport and injected adapter

- initialize `tauri-plugin-notification`
- enable `withGlobalTauri`
- inject a main-frame desktop notification adapter into `globalThis.__XAI_DESKTOP_NOTIFICATION__`
- create the feature-owned browser-safe `/web` bridge entrypoint
- centralize:
  - permission status
  - prompt gating
  - quiet hours
  - disabled / denied / unsupported state mapping

### Phase 2 — Source projectors and settings integration

- Pomodoro:
  - subscribe to `web:pomodoro:session-finished`
- Tasks:
  - add `projectDesktopTaskReminderEntries(...)` to `@repo/plugin-web-tasks`
  - support only absolute `TaskCard.date` strings already public today
- Calendar:
  - add `projectDesktopCalendarReminderEntries(...)` to `@repo/plugin-web-calendar`
  - support only timed events from the active month dataset
- Settings:
  - add calendar notification toggle and status copy
  - preserve current task/pomodoro prefs as authoritative
  - leave habit toggle untouched in this row

### Phase 3 — Verification surface

- automated tests with mocked desktop adapter/global seam
- web build gate proving no `@tauri-apps/*` / `__TAURI__` leak into `apps/web/dist`
- cargo/build verification
- real macOS smoke evidence for granted / denied / disabled / unsupported cases

## Implementation Snapshot (2026-05-28)

- Host transport and capability seam implemented on `apps/desktop/src-tauri`:
  - `tauri-plugin-notification` init
  - `app.withGlobalTauri = true`
  - injected host adapter `window.__XAI_DESKTOP_NOTIFICATION__`
  - `notification:default` capability permission
- Browser-safe bridge mounted from `apps/web` using only `@repo/desktop-native-notifications-reminders/web`.
- Reminder projector exports implemented on:
  - `@repo/plugin-web-tasks` (`projectDesktopTaskReminderEntries`)
  - `@repo/plugin-web-calendar` (`projectDesktopCalendarReminderEntries`)
- Settings Notifications pane now includes calendar toggle + runtime status copy/action while preserving existing habit toggle semantics.
