# XAI v1 Incidents — 2026-05-19

## Incident 1

- Time: 2026-05-19 14:44 PDT
- Feature: click-through-matrix
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.3 requires real macOS hit-test observations across `macOSPrivateApi=true` and `false`; static code review and build checks cannot prove click-through behavior.
- Attempted fixes: Created a manual matrix template and documented the exact runtime evidence required. Avoided unsafe NSWindow/Tauri config changes without live validation.
- Current status: BLOCKED.
- Resume instruction: Run `pnpm --filter desktop tauri dev`, fill `docs/reviews/window-ground-truth/click-through-matrix/README.md`, then rerun feature-verify for `click-through-matrix`.
