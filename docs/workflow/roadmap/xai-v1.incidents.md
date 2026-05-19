# XAI v1 Incidents — 2026-05-19

## Incident 1

- Time: 2026-05-19 14:44 PDT
- Feature: click-through-matrix
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.3 requires real macOS hit-test observations across `macOSPrivateApi=true` and `false`; static code review and build checks cannot prove click-through behavior.
- Attempted fixes: Created a manual matrix template and documented the exact runtime evidence required. Avoided unsafe NSWindow/Tauri config changes without live validation.
- Current status: BLOCKED.
- Resume instruction: Run `pnpm --filter desktop tauri dev`, fill `docs/reviews/window-ground-truth/click-through-matrix/README.md`, then rerun feature-verify for `click-through-matrix`.

## Incident 2

- Time: 2026-05-19 14:47 PDT
- Feature: finder-dnd-path
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.4 requires real Finder drag/drop payload observations for file, folder, App bundle, and alias; static inspection cannot prove path payload behavior.
- Attempted fixes: Created a manual path-first matrix template and documented the exact runtime evidence required. Avoided speculative DnD implementation changes.
- Current status: BLOCKED.
- Resume instruction: Run `pnpm --filter desktop tauri dev`, fill `docs/reviews/window-ground-truth/finder-dnd-path/README.md`, then rerun feature-verify for `finder-dnd-path`.
