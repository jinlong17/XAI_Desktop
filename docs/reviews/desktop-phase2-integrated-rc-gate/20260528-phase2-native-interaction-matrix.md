# Phase 2 — Native Interaction Matrix (notifications/statusbar/hotkey/menu)

Date: 2026-05-28  
Executor: feature-auto-build (Codex)

## Scope

This phase classifies real-macOS native interaction outcomes for:
- notifications
- status bar quick actions
- global hotkey quick open
- full native menu polish

This run occurred in a non-interactive build environment (no direct GUI control/observation of native macOS interactions).

## Environment Constraint

The current environment can run automated tests/builds and compile/bundle artifacts, but cannot truthfully observe manual GUI interactions such as:
- permission dialogs
- tray icon/menu clicks
- global shortcut keypress behavior while app is backgrounded
- end-user menu ergonomics/actions through real desktop interaction

Per approved scope, these are classified as `BLOCKED_ENVIRONMENT` instead of `PASS`.

## Slice Matrix

| Slice | Real-macOS Required Checks | Repo-side Evidence | Classification | Notes |
|---|---|---|---|---|
| notifications | permission states; reminder delivery for tasks/pomodoro/calendar | Phase 1 reruns: `@repo/desktop-native-notifications-reminders` tests PASS; notification-pane tests PASS | `BLOCKED_ENVIRONMENT` | Repo contract passes, but no trustworthy GUI delivery/permission observation in this environment |
| statusbar | icon visibility; click/menu; quick actions focus behavior | Phase 1 reruns: `@repo/desktop-statusbar-quick-actions` tests PASS | `BLOCKED_ENVIRONMENT` | Build/test evidence is green; tray interaction requires real macOS session |
| hotkey | register/disable/persistence/conflict/recovery under real focus conditions | Phase 1 reruns: `@repo/desktop-global-hotkey-quick-open` tests PASS; hotkeys pane tests PASS | `BLOCKED_ENVIRONMENT` | Cannot validate live global key interception/focus recovery here |
| menu | top-level native sections/actions/support diagnostics with real UX | Phase 1 reruns: web/router/build/cargo/tauri baseline PASS; upstream row #5 remains READY_TO_SHIP | `BLOCKED_ENVIRONMENT` | Native menu interaction must be validated in interactive macOS session |

## Cross-slice Checks (Phase 2 scope)

Target cross-slice checks:
- status bar and hotkey focus only the normal `main` window
- hotkey recovery actions and Help-menu entries coexist correctly
- notification denied/disabled states do not break statusbar/hotkey/menu surfaces

Current run result:
- `BLOCKED_ENVIRONMENT` for direct interaction checks (not observable in this session).
- No repo-side automated regression signal was found in baseline reruns.

## Phase 2 Outcome

- Native-interaction matrix completed with honest classifications.
- No repo defect reproduced from available automated evidence.
- Manual/interactive completion is deferred to feature-verify / real-macOS verification context.
