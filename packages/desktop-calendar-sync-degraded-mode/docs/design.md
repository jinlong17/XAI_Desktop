# desktop-calendar-sync-degraded-mode - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A - active-surface-first degraded mode: keep local calendar UI state in `@repo/plugin-web-calendar`, add explicit device-local provider sync state, and reconcile only after real reconnect eligibility. |
| Review Doc Path | `docs/reviews/desktop-calendar-sync-degraded-mode/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P1 Phase 3 degradable provider-sync row |
| Governing ADRs | `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`, `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- The active desktop product is still `apps/web` wrapped by Tauri under `desktop-phase1-offline`.
- `@repo/plugin-web-calendar` is the active calendar owner; `plugin-calendar` is evidence only.
- Provider sync remains online-only. This row must not imply offline provider writes are durable success.
- Local calendar state remains usable offline.
- Provider sync state must be stored separately from local calendar state.
- Reconnect reconciliation must reuse the shipped repository bridge and reconnect seams rather than inventing a host-owned parallel state machine.
- The only wired provider in current repo truth is `gcal`; placeholder calendar providers stay placeholders unless build explicitly broadens scope later.

## Dependency Overview

- active feature owners:
  - `packages/xai-web-calendar/`
  - `packages/plugin-web-settings-rest/`
  - `packages/plugin-web-storage/`
- shared contract seam:
  - `packages/core-data/`
- thin runtime mount only:
  - `apps/web/src/providers/AppProviders.tsx`
- adjacent evidence/consumers:
  - `packages/desktop-native-notifications-reminders/`
  - `packages/desktop-local-first-repository-bridge/`
  - `packages/desktop-local-first-sync-reconnect/`

## Boundary Decision

- Keep `packages/desktop-calendar-sync-degraded-mode/` as the workflow/docs anchor only.
- Put calendar-specific business logic in the owning packages:
  - local calendar UX in `@repo/plugin-web-calendar`
  - provider controls/status copy in `@repo/plugin-web-settings-rest`
  - durable bridge/reconnect glue in `@repo/plugin-web-storage`
- Limit `@repo/core-data` to typed provider-state contracts and shared helpers only.
- Keep `AppProviders` as a thin runtime mount/gating surface only.

## State Split

### Local calendar state

Remains usable offline:

- `xai_calendar_view`
- `xai_pref_week_start`
- module-local active/focused date state
- local reminder projection from whatever calendar-visible dataset is currently available

### Provider sync state

Recommended new device-local contract:

- one `calendar.provider_state` record per wired provider
- stores connection/sync availability, last attempt/success/failure, and reconnect-needed state
- does not store or imply authoritative remote provider events

## Offline Behavior

- Local calendar views continue to render and navigate.
- Provider sync affordances do not claim success offline.
- Provider sync actions are either:
  - disabled with clear messaging, or
  - allowed only to mark a reconnect-needed local flag
- No offline provider mutation queue is introduced in this row.

## Reconnect Behavior

- Reconnect follow-up runs only after the shipped row `#14` gating says the runtime is eligible.
- Row `#16` may clear reconnect-needed state only after a real successful provider refresh/reconcile step.
- Conflict/failure messaging must remain explicit; reconnect is not silent success.

## Implementation Phases

### Phase 1 - Shared provider-state contract

- add `calendar.provider_state` typing and minimal helpers in `@repo/core-data`
- extend desktop repo bridge in `@repo/plugin-web-storage`
- preserve existing local calendar prefs as-is

### Phase 2 - UI separation

- `@repo/plugin-web-calendar`
  - render degraded-mode state without blocking local calendar navigation
- `@repo/plugin-web-settings-rest`
  - separate `connected` from `syncable`
  - surface offline-disabled and reconnect-needed states clearly

### Phase 3 - Reconnect follow-up

- wire calendar-provider reconciliation through the shipped reconnect runtime/mount seam
- persist last-attempt / last-success / last-failure fields
- clear reconnect-needed state only on real success

### Phase 4 - Verification and smoke

- rerun touched package tests and type checks
- rerun browser-safe `@repo/web` gates
- rerun desktop bundle gate
- record manual offline/reconnect smoke if runtime behavior changes in desktop mode

