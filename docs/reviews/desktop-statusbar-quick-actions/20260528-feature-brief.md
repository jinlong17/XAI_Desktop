# Feature Brief — desktop-statusbar-quick-actions

| Field | Value |
|---|---|
| Feature | desktop-statusbar-quick-actions |
| Title | Phase 2 Desktop Status Bar Quick Actions |
| Date | 2026-05-28 |
| Source | Roadmap row #3 seed brief `docs/reviews/desktop-statusbar-quick-actions/20260528-roadmap-seed.md` on `dev` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Add a macOS status bar icon for the normal desktop app with quick actions to:

- open or focus the app
- start pomodoro
- view today's tasks
- expose basic app status

The active product remains the shipped ADR-0011 normal-window Tauri app around `apps/web`; this feature must not revive transparent overlay, control, or grid behavior.

## Naming Rationale

The provided slug already matches the job:

- `desktop` — scope is the native macOS/Tauri shell on `dev`
- `statusbar` — the affordance is the macOS status bar / tray surface, not the Dock or app menu
- `quick-actions` — the feature is a small native launcher/status surface, not a full background app rewrite

## Scope

- Native status bar icon and menu owned by `apps/desktop/src-tauri/`
- Main-window focus/open behavior for the shipped normal desktop app window only
- A browser-safe desktop bridge package boundary for host ↔ web quick-action/status coordination
- Additive quick-action contracts in the owning active web surfaces:
  - `@repo/plugin-web-pomodoro` for "start pomodoro"
  - `@repo/plugin-web-tasks` for "today's tasks"
- Clear unavailable/degraded native menu states when an action target is disabled, unsupported, or not ready

## Non-goals

- No transparent overlay, control-window, grid-window, or organizer revival
- No global hotkey work (separate row `desktop-global-hotkey-quick-open`)
- No full app-menu rewrite/polish (separate row `desktop-full-macos-menu-polish`)
- No updater/release-channel work (separate row `desktop-auto-update-release-channel`)
- No Phase 3 storage, sync, or schema work
- No hard dependency on `desktop-native-notifications-reminders`; notification status is optional only if a shared contract already exists
- No `@tauri-apps/*` imports or `window.__TAURI__` references inside `apps/web/src/**/*` or browser-shared packages

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The selected plan defines:
  - native tray/status-bar ownership
  - the quick-action dispatch boundary
  - how the main window is focused/opened
  - how "start pomodoro" and "today's tasks" stay owned by their web modules
  - how unavailable targets are shown clearly in the status bar menu
  - what "basic app status" means in v1
- The feature plan keeps the Tauri host as a native shell bridge only and does not move business logic out of the owning web/plugin surfaces
- Verification requirements cover Rust/menu tests, browser-safe web tests, build gates, and real macOS manual smoke for tray behavior

## Current Baseline

- `desktop-tauri-web-dist-normal-window` is SHIPPED and the active app is a single normal Tauri window loading `apps/web`
- `desktop-basic-macos-menu-config-store` is SHIPPED and already owns the native app menu plus host config persistence
- `desktop-native-notifications-reminders` is `READY_TO_SHIP`, but remains an optional sibling, not a hard dependency
- `apps/desktop/src-tauri/src/commands/menubar.rs` contains an older sync-specific tray/status implementation; it is prior art only and is not the current startup contract
- `apps/web` is guarded by browser-safety rules and currently imports browser-safe desktop bridges such as `@repo/desktop-native-notifications-reminders/web`
- `@repo/plugin-web-pomodoro` and `@repo/plugin-web-tasks` are the active stable Phase 1/P2 surfaces, but today they do not expose a dedicated desktop quick-action public contract:
  - pomodoro start is internal to `PomodoroModule`
  - the tasks sidebar's "today" smart list is internal UI state, not an externally addressable route contract

## Deferred Validation

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`
- Manual macOS verification for:
  - status bar icon visibility
  - left/right click behavior
  - open/focus app behavior when the window is backgrounded or hidden
  - start pomodoro action
  - today's tasks action
  - degraded/disabled menu states when the owning targets are unavailable
