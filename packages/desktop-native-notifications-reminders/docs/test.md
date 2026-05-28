# desktop-native-notifications-reminders — Test Plan

## Validation Goals

- confirm the desktop app can initialize the official Tauri notifications plugin and expose a desktop-only adapter without leaking native imports into the `apps/web` bundle
- confirm the browser-safe feature bridge mounts from `apps/web` and consumes only `window.__XAI_DESKTOP_NOTIFICATION__`
- confirm pomodoro completion can trigger a native notification path
- confirm task reminder-capable cases derived from the exact v1 task subset can trigger a native notification path
- confirm calendar reminder-capable cases derived from the exact v1 timed-event subset can trigger a native notification path
- confirm denied / disabled / unsupported states are explicit and non-crashing
- confirm no Phase 3 storage/sync behavior is introduced

## Contract Checks

- `apps/desktop/src-tauri/src/lib.rs`
  - initializes the notifications plugin
  - wires the desktop injection seam
- `apps/desktop/src-tauri/Cargo.toml`
  - includes the notification plugin dependency only as needed for this feature
- `apps/desktop/src-tauri/tauri.conf.json`
  - enables `withGlobalTauri` only if required by the frozen adapter plan
- `apps/desktop/src-tauri/capabilities/default.json`
  - grants only the notification permission set needed for the desktop runtime
- feature-owned package
  - exports a browser-safe `/web` bridge
  - owns the desktop adapter contract, permission mapping, quiet hours, dedup, and source normalization
- stable web packages
  - expose the additive task/calendar projector exports frozen in `api.md`
  - public export targets are `@repo/plugin-web-tasks` and `@repo/plugin-web-calendar` while directory paths remain `packages/xai-web-tasks/` and `packages/xai-web-calendar/`
- settings surface
  - includes calendar toggle/status wiring without regressing existing notification prefs

## Automated Checks

- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web build`
- `rg "@tauri-apps|__TAURI__" apps/web/dist/assets/*.js`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Web / Unit Coverage

### Browser-safety and adapter seam

- `apps/web` imports only `@repo/desktop-native-notifications-reminders/web`
- no `@tauri-apps/*` imports appear under `apps/web/src/**/*`
- built `apps/web/dist/assets/*.js` contains no `@tauri-apps` or `__TAURI__` strings
- bridge behavior with:
  - missing `window.__XAI_DESKTOP_NOTIFICATION__`
  - present adapter in `desktop-phase1-offline`
  - non-desktop runtime profile

### Notification bridge policy

- permission state mapping:
  - ready
  - permission-required
  - denied
  - disabled
  - unsupported
- quiet-hours evaluation:
  - outside quiet hours sends/arms
  - inside quiet hours suppresses or defers per design
- dedup:
  - duplicate occurrence key does not re-send within one bridge lifetime

### Pomodoro coverage

- `web:pomodoro:session-finished` creates one reminder candidate/send path
- master disabled suppresses send
- source toggle off suppresses send

### Task coverage

- `projectDesktopTaskReminderEntries(...)` supports only:
  - `TaskCard.date = "M/D"`
  - `TaskCard.date = "Mon D"`
- year-rollover heuristic is deterministic and covered
- `TaskDefaultReminderAll` handling is covered:
  - `none`
  - `9am`
  - `day_before`
- explicit unsupported results are covered for:
  - `dateLabel`-only cards
  - missing `date`
  - non-parseable `date`
  - due-time-pref path with no public due-time field

### Calendar coverage

- `projectDesktopCalendarReminderEntries(...)` supports only timed events (`time`)
- `endTime` optionality is covered
- explicit unsupported results are covered for:
  - all-day events with no `time`
  - entries outside the active month dataset

### Settings/UI coverage

- calendar notification toggle persists correctly
- permission denied / unsupported copy renders correctly
- existing notification prefs are not regressed
- habit toggle remains unchanged by this feature

## Mock Strategy

- mock `window.__XAI_DESKTOP_NOTIFICATION__` in web/unit tests
- do not trigger real macOS permission prompts in CI
- use deterministic fake time for reminder scheduling tests
- use explicit stable fixtures for task/calendar projector tests
- do not import `@tauri-apps/*` in web/unit tests

## Manual macOS Smoke

- launch the desktop app on macOS hardware
- verify permission flow:
  - first-run or promptable path
  - denied path
  - already-granted path
- verify pomodoro completion notification appears
- verify one task reminder scenario appears from a parseable absolute `TaskCard.date`
- verify one calendar reminder scenario appears from a timed event in the visible calendar dataset
- verify master disabled suppresses notifications
- verify unsupported task/calendar cases are visible and non-crashing
- verify no overlay/control/grid surface is revived

## Residual Risks

- task reminder quality is bounded by today’s stable public task shape
- calendar reminder quality is bounded by the current sample-data-backed month dataset
- the adapter seam must stay outside the `apps/web` bundle; browser-safety regressions should be treated as release blockers
- native permission UX and delivered-notification behavior still require real macOS confirmation before ship

## Implementation Evidence (2026-05-28)

- Executed:
  - `pnpm --filter @repo/desktop-native-notifications-reminders check-types`
  - `pnpm --filter @repo/plugin-web-tasks test -- src/__tests__/projectDesktopTaskReminderEntries.test.ts`
  - `pnpm --filter @repo/plugin-web-calendar test -- src/__tests__/projectDesktopCalendarReminderEntries.test.ts`
  - `pnpm --filter @repo/plugin-web-storage test -- src/__tests__/registry.test.ts`
  - `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/notificationsPane.test.tsx`
  - `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx`
  - `pnpm --filter @repo/web build`
  - `rg "@tauri-apps|__TAURI__" apps/web/dist/assets/*.js` (no matches)
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
  - `pnpm --filter desktop tauri build --debug --bundles app`
- Environment-deferred in this checkout:
  - `pnpm --filter @repo/plugin-web-storage test -- src/__tests__/parity-design-md.test.ts` (expects `web design/DESIGN.md`, which is absent here).
  - real macOS interactive smoke contract recorded as BLOCKED_ENVIRONMENT in `packages/desktop-native-notifications-reminders/docs/manual_smoke_evidence.md` (non-interactive shell provenance + per-scenario matrix, no PASS claims).

## Repair Evidence (2026-05-28 R2)

- Added denied/unsupported automated coverage required by verification contract:
  - `pnpm --filter @repo/desktop-native-notifications-reminders test -- src/runtime.test.ts`
    - asserts denied state via `requestDesktopNotificationPermission()`
    - asserts unsupported states for `adapter_unavailable` and `non_desktop_runtime`
  - `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/notificationsPane.test.tsx`
    - asserts denied copy
    - asserts unsupported copy
- Added deterministic manual-smoke artifact for non-interactive environment:
  - `packages/desktop-native-notifications-reminders/docs/manual_smoke_evidence.md`
