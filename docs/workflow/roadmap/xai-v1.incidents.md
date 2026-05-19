# XAI v1 Incidents — 2026-05-19

## Incident 1

- Time: 2026-05-19 14:44 PDT
- Feature: click-through-matrix
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.3 requires real macOS hit-test observations across `macOSPrivateApi=true` and `false`; static code review and build checks cannot prove click-through behavior.
- Attempted fixes: Created a manual matrix template, filled static code-analysis findings, and documented the exact runtime evidence required. Avoided unsafe NSWindow/Tauri config changes without live validation.
- Current status: BLOCKED.
- Resume instruction: Run `pnpm --filter desktop tauri dev`, fill `docs/reviews/window-ground-truth/click-through-matrix/README.md`, then rerun feature-verify for `click-through-matrix`.

## Incident 2

- Time: 2026-05-19 14:47 PDT
- Feature: finder-dnd-path
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.4 requires real Finder drag/drop payload observations for file, folder, App bundle, and alias; static inspection cannot prove path payload behavior.
- Attempted fixes: Created a manual path-first matrix template, filled static code-analysis findings, and documented the exact runtime evidence required. Avoided speculative DnD implementation changes.
- Current status: BLOCKED.
- Resume instruction: Run `pnpm --filter desktop tauri dev`, fill `docs/reviews/window-ground-truth/finder-dnd-path/README.md`, then rerun feature-verify for `finder-dnd-path`.

## Incident 3

- Time: 2026-05-19 15:02 PDT
- Feature: spaces-multimonitor-matrix
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.5 requires real Mission Control, Spaces, fullscreen-app, and multi-display observations; static inspection cannot prove window placement/recovery behavior.
- Attempted fixes: Created a manual matrix template and documented the exact runtime evidence required. Avoided speculative window behavior changes.
- Current status: BLOCKED.
- Resume instruction: Run `pnpm --filter desktop tauri dev`, fill `docs/reviews/window-ground-truth/spaces-multimonitor-matrix/README.md`, then rerun feature-verify for `spaces-multimonitor-matrix`.

## Incident 4

- Time: 2026-05-19 15:05 PDT
- Feature: mas-sandbox-dry-run
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.6 requires real `macOSPrivateApi=false`, sandbox entitlement, and likely signed-build validation; static notes cannot prove MAS feasibility.
- Attempted fixes: Created MAS sandbox notes, entitlement draft, and risk matrix. Avoided speculative Tauri config/Cargo/capability changes.
- Current status: BLOCKED.
- Resume instruction: Run private-API-disabled and sandbox/signed validation, update `docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`, then rerun feature-verify for `mas-sandbox-dry-run`.

## Incident 5

- Time: 2026-05-19 15:08 PDT
- Feature: window-command-contract
- Symptom: Production implementation is blocked.
- Root cause if known: G1 requires G0 Go or Conditional Go, and G0 still has unresolved manual/native validation blockers.
- Attempted fixes: Created G1.1 contract-planning docs and G1 manifest without touching production window command code.
- Current status: BLOCKED.
- Resume instruction: Complete G0 evidence and decide Go/Conditional Go, then rerun feature-build for `window-command-contract`.

## Incident 6

- Time: 2026-05-19 15:24 PDT
- Feature: grid-window-prototype
- Symptom: User reported clicking `+ New Grid` did not create a native Grid window; startup logs showed main-window configuration but no `create_grid_window` Rust command log.
- Root cause if known: Likely frontend routing issue. `OrganizerLayer` enabled native window sync by checking `window.__TAURI__`, but this Tauri v2 app does not enable `withGlobalTauri`, so the global is absent even in the runtime. The control window also emitted the legacy unscoped `create-grid-request` event instead of the documented `organizer:create-grid-request` contract event.
- Attempted fixes: Patched ControlWindow to `emitTo("main", "organizer:create-grid-request", { rect })`; patched OrganizerLayer to listen to the contract event, keep a legacy listener, and use Tauri v2 runtime detection via `isTauri()` / `__TAURI_INTERNALS__`; updated organizer API/design docs.
- Current status: PATCHED in commit `14e04c2`; `pnpm --filter @repo/plugin-organizer check-types` and `pnpm --filter desktop build` pass. Human runtime confirmation is still required.
- Resume instruction: Restart `pnpm --filter desktop tauri dev`, click `+ New Grid`, and confirm terminal output includes `🪟 Creating grid window:` followed by a visible native Grid window.

## Incident 7

- Time: 2026-05-19 15:32 PDT
- Feature: grid-window-prototype
- Symptom: After Grid windows were successfully created, the user reported the small AI icon could not open settings or be dragged.
- Root cause if known: The control window was configured at desktop icon level +1 while Grid windows were configured at desktop icon level +3. Newly created Grid windows could cover the control window and intercept pointer input intended for the AI cube/settings panel.
- Attempted fixes: Raised the control window to desktop icon level +4 and added a startup log for its configured level.
- Current status: PATCHED in commit `01e5167`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` and `pnpm --filter desktop build` pass. Human runtime confirmation is still required.
- Resume instruction: Restart `pnpm --filter desktop tauri dev`, confirm startup logs include `🎛️ Control window configured`, create a Grid, then verify the AI icon can still open settings and drag above the Grid window.
