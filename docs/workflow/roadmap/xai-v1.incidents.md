# XAI v1 Incidents — 2026-05-19

## Incident 1

- Time: 2026-05-19 14:44 PDT
- Feature: click-through-matrix
- Symptom: Feature cannot satisfy full acceptance yet.
- Root cause if known: G0.3 still requires real macOS hit-test observations across `macOSPrivateApi=true` and `false`; default-runtime click-through, Grid item pointer delivery, and resize drag now have positive human evidence.
- Attempted fixes: Created a manual matrix template, filled static code-analysis findings, recorded human evidence for transparent-area clicks, resize handle drag, and item click flash, and documented the remaining private-API comparison. Avoided unsafe NSWindow/Tauri config changes without complete live validation.
- Current status: BLOCKED.
- Resume instruction: Run `pnpm --filter desktop tauri dev` with `macOSPrivateApi=false`, fill remaining rows in `docs/reviews/window-ground-truth/click-through-matrix/README.md`, then rerun feature-verify for `click-through-matrix`.

## Incident 2

- Time: 2026-05-19 14:47 PDT
- Feature: finder-dnd-path
- Symptom: Feature cannot satisfy full acceptance yet; human screenshots showed duplicate items first for file/folder and later for `.app`. Post-dedupe `.app` rerun now passes, and alias functional validation is reported as successful.
- Root cause if known: G0.4 still requires the exact Finder/Tauri alias path behavior to be recorded in ADR-0005. Duplicate items were caused by repeated drop handling paths/events; `.app` bundles still duplicated after the GridWindow-only fix, so Organizer needed path-level idempotency.
- Attempted fixes: Created a manual path-first matrix template, filled static code-analysis findings, added GridWindow `tauri://drag-drop` telemetry in `7e20ca8`, made GridWindow path-first only in `58c926d`, and added Organizer per-grid path dedupe in `18b48da`.
- Current status: BLOCKED on exact alias path-form evidence and ADR policy only.
- Resume instruction: Run `pnpm --filter desktop tauri dev`, drop alias into a Grid, capture the `Finder DnD` panel and `[G0 Finder DnD] path-first drop` logs, fill exact alias payload row in `docs/reviews/window-ground-truth/finder-dnd-path/README.md`, update ADR-0005 with alias path policy, then rerun feature-verify for `finder-dnd-path`.

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
- Current status: RESOLVED 2026-05-19. User confirmed runtime fixed after commits `7b7ff35`, `f65a1b5`, and `a33c74d`; Codex checks pass.
- Resume instruction: Restart `pnpm --filter desktop tauri dev`, click `+ New Grid`, and confirm terminal output includes `🪟 Creating grid window:` followed by a visible native Grid window.

## Incident 7

- Time: 2026-05-19 15:32 PDT
- Feature: grid-window-prototype
- Symptom: After Grid windows were successfully created, the user reported the small AI icon could not open settings or be dragged.
- Root cause if known: The control window was configured at desktop icon level +1 while Grid windows were configured at desktop icon level +3. Newly created Grid windows could cover the control window and intercept pointer input intended for the AI cube/settings panel.
- Attempted fixes: Raised the control window to desktop icon level +4 and added a startup log for its configured level.
- Current status: RESOLVED 2026-05-19. User confirmed runtime fixed after commits `7b7ff35`, `f65a1b5`, and `a33c74d`; Codex checks pass.
- Resume instruction: Restart `pnpm --filter desktop tauri dev`, confirm startup logs include `🎛️ Control window configured`, create a Grid, then verify the AI icon can still open settings and drag above the Grid window.

## Incident 8

- Time: 2026-05-19 15:47 PDT
- Feature: grid-window-prototype
- Symptom: User reported `+ New Grid` still did not generate a visible window in the latest runtime attempt, and the AI icon movement area felt limited.
- Root cause if known: The AI cube was still dragged as a DOM node inside the fixed 360x360 control window, so movement was bounded by that native window. The create-grid path also depended on the main window event/state sync path before a native window was guaranteed.
- Attempted fixes: Added native control-window dragging for the AI cube, changed `+ New Grid` to compute screen-relative Grid placement from the control window position, added direct `create_grid_window` invoke fallback using the same `gridId` as the main-window event, and updated EventMap/contracts for optional `gridId`.
- Current status: RESOLVED 2026-05-19. User confirmed runtime fixed after commits `7b7ff35`, `f65a1b5`, and `a33c74d`; Codex checks pass.
- Resume instruction: Restart `pnpm --filter desktop tauri dev`, drag the AI icon across the desktop, open settings, click `+ New Grid`, and confirm a visible Grid window plus terminal `create_grid_window` logs.

## Incident 9

- Time: 2026-05-19 20:34 PDT
- Feature: grid-shell-organizer-content
- Symptom: Production shell/content split cannot start.
- Root cause if known: G1.2 depends on G0 Go/Conditional Go and G1.1 Window Command Contract. Both remain blocked.
- Attempted fixes: Created safe-prep docs mapping current Host/Organizer boundary and target public Organizer content API. Avoided production source changes.
- Current status: BLOCKED.
- Resume instruction: Complete G0 evidence, implement G1.1, then rerun feature-build for `grid-shell-organizer-content`.

## Incident 10

- Time: 2026-05-19 20:37 PDT
- Feature: multi-grid-event-scope
- Symptom: Production Grid event migration cannot start.
- Root cause if known: G1.4 depends on G0 Go/Conditional Go and G1.1 Window Command Contract. Finder DnD payload shape is also unsettled.
- Attempted fixes: Created safe-prep docs auditing current event names, target contracts, and missing runtime `gridId` guard requirements. Avoided production source changes.
- Current status: BLOCKED.
- Resume instruction: Complete G0 evidence and G1.1, then rerun feature-build for `multi-grid-event-scope`.

## Incident 11

- Time: 2026-05-19 20:39 PDT
- Feature: native-dnd-path-first
- Symptom: Production path-first DnD implementation cannot start.
- Root cause if known: G1.3 depends on G0.4 real Finder payload observations and MAS sandbox/security-scope decisions.
- Attempted fixes: Created safe-prep docs mapping current drop behavior, target `DroppedFile[]` shape, and unresolved receiver/alias/security-scope decisions. Avoided production source changes.
- Current status: BLOCKED.
- Resume instruction: Complete G0.4 Finder matrix and MAS sandbox dry run, then rerun feature-build for `native-dnd-path-first`.

## Incident 12

- Time: 2026-05-19 20:41 PDT
- Feature: grid-persistence
- Symptom: Production Grid persistence implementation cannot start.
- Root cause if known: G1.5 depends on G1.1 window command lifecycle and G2 Repository v0/localStorage migration decisions.
- Attempted fixes: Created safe-prep docs mapping current localStorage behavior, target repository boundary, and deferred restore/migration tests. Avoided production source changes.
- Current status: BLOCKED.
- Resume instruction: Complete G1.1 and G2 Repository v0, then rerun feature-build for `grid-persistence`.
