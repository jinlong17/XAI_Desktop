# desktop-native-notifications-reminders — Manual Smoke Evidence

## Scope

Phase 3 macOS smoke cases required by `docs/test.md`:

- permission granted
- permission denied
- disabled
- task reminder
- pomodoro completion
- calendar reminder
- unsupported

## Provenance (2026-05-28 02:37 PDT)

- Host snapshot:
  - `uname -a` → `Darwin ... 25.5.0 ... arm64`
  - `sw_vers` → `macOS 26.5 (25F71)`
- Session constraints:
  - `stdin_tty=no`
  - shell `tty=??`
  - `TERM=dumb`
- Build verification in this run:
  - `pnpm --filter desktop tauri build --debug --bundles app` → `exit=0`
  - produced app bundle:
    - `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`

## Classification Matrix

| Scenario | Result | Reason | Evidence Type |
|---|---|---|---|
| Permission granted | BLOCKED_ENVIRONMENT | Requires interactive app launch + visible macOS permission flow confirmation. This run is non-interactive (`stdin_tty=no`, `TERM=dumb`). | Deferred manual smoke |
| Permission denied | BLOCKED_ENVIRONMENT | Requires interactive denial path and System Settings verification. Not executable from this shell-only run. | Deferred manual smoke |
| Disabled | BLOCKED_ENVIRONMENT | Contract requires real macOS delivery suppression check; cannot observe system notification center in this run. | Deferred manual smoke |
| Task reminder | BLOCKED_ENVIRONMENT | Requires visible native notification delivery from running app instance. Non-interactive shell cannot capture UI-level delivery proof. | Deferred manual smoke |
| Pomodoro completion | BLOCKED_ENVIRONMENT | Requires driving pomodoro completion in running app and observing native delivery. Non-interactive shell cannot execute that user flow. | Deferred manual smoke |
| Calendar reminder | BLOCKED_ENVIRONMENT | Requires running app with calendar reminder candidate and visual native delivery check. Not executable in this run. | Deferred manual smoke |
| Unsupported | BLOCKED_ENVIRONMENT | Contract requires real runtime/UI visibility proof for unsupported path in desktop app session. Shell-only run cannot produce UI evidence. | Deferred manual smoke |

## Notes

- This artifact intentionally records no fake PASS claims.
- Automated/runtime and unit evidence is tracked separately in `docs/test.md` and `docs/dev_log.md`.
