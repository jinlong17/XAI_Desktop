# XAI v1 Incidents — 2026-05-19

## Incident 1

- Time: 2026-05-19 14:44 PDT
- Feature: click-through-matrix
- Symptom: Initially could not satisfy full acceptance; private-API comparison was missing.
- Root cause if known: Default-runtime hit-testing works. The private-API-disabled comparison fails at compile time because the current transparent Grid/control window builders call `.transparent(true)`, which is unavailable without private API support.
- Attempted fixes: Created a manual matrix template, filled static code-analysis findings, recorded human evidence for transparent-area clicks, resize handle drag, and item click flash, then temporarily tested with private API disabled and restored the default config/Cargo feature.
- Current status: RESOLVED for G0.3; feature is READY_TO_SHIP.
- Resume instruction: No G0.3 action required. Continue with G0.5 Spaces/fullscreen/multi-display evidence and G0.6 MAS fallback/sandbox validation.

## Incident 2

- Time: 2026-05-19 14:47 PDT
- Feature: finder-dnd-path
- Symptom: Initially could not satisfy full acceptance; human screenshots showed duplicate items first for file/folder and later for `.app`. Post-dedupe `.app` rerun now passes, and alias path-form evidence is captured.
- Root cause if known: Duplicate items were caused by repeated drop handling paths/events; `.app` bundles still duplicated after the GridWindow-only fix, so Organizer needed path-level idempotency. Alias behavior is now recorded as preserving the alias file path returned by Finder/Tauri.
- Attempted fixes: Created a manual path-first matrix template, filled static code-analysis findings, added GridWindow `tauri://drag-drop` telemetry in `7e20ca8`, made GridWindow path-first only in `58c926d`, and added Organizer per-grid path dedupe in `18b48da`.
- Current status: RESOLVED for G0.4; feature is READY_TO_SHIP.
- Resume instruction: No G0.4 action required. Continue with remaining G0 blockers: `spaces-multimonitor-matrix` and `mas-sandbox-dry-run`.

## Incident 3

- Time: 2026-05-19 15:02 PDT
- Feature: spaces-multimonitor-matrix
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.5 requires real Mission Control, Spaces, fullscreen-app, and multi-display observations; static inspection cannot prove window placement/recovery behavior.
- Attempted fixes: Created a manual matrix template, documented the exact runtime evidence required, recorded current display facts, recorded source-level collection behavior/window level findings, and recorded user manual confirmation that Grid follows across Spaces/multi-display on the DELL setup. Avoided speculative window behavior changes.
- Current status: RESOLVED for G0.5; feature is READY_TO_SHIP.
- Resume instruction: No G0.5 action required for G1. Optional: replay `pnpm --filter desktop tauri dev` and attach screenshots before ship.

## Incident 4

- Time: 2026-05-19 15:05 PDT
- Feature: mas-sandbox-dry-run
- Symptom: Feature cannot satisfy acceptance in unattended mode.
- Root cause if known: G0.6 requires signed/sandbox validation. The original transparent implementation could not compile with the private API path disabled because `.transparent(true)` is unavailable on `WebviewWindowBuilder`.
- Attempted fixes: Created MAS sandbox notes, entitlement draft, and risk matrix. Temporarily tested with private API disabled, captured compile failure, added the `mas-sandbox` compile fallback guard, verified the private-API-disabled compile path, and restored the default config/Cargo feature.
- Current status: BLOCKED_EXTERNAL; not blocking G1 DMG/private path under G0 Conditional Go.
- Resume instruction: When Apple Developer/signing or equivalent sandbox environment exists, run private-API-disabled `mas-sandbox` fallback in a signed/sandbox environment, validate runtime UX/file access/bookmarks/tray behavior, update `docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`, then rerun feature-verify for `mas-sandbox-dry-run`.

## Incident 5

- Time: 2026-05-19 15:08 PDT
- Feature: window-command-contract
- Symptom: Production implementation is blocked.
- Root cause if known: G1 required G0 Go or Conditional Go. G0 has now reached Conditional Go for DMG/private path; MAS remains a deferred external release gate.
- Attempted fixes: Created G1.1 contract-planning docs, reconciled G0 Conditional Go, implemented structured window lifecycle commands, and verified Rust/TS/desktop/contract consistency.
- Current status: RESOLVED; `window-command-contract` is READY_TO_SHIP for the DMG/private path. Cross-vendor verify remains deferred.
- Resume instruction: Human may review `dce4fb9` and run ship manually; roadmap continuation has proceeded beyond G1.4 and should continue with G2 because G1.5 depends on G2 Repository v0.

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
- Root cause if known: G1.2 depends on G0 Go/Conditional Go and G1.1 Window Command Contract. Both are now satisfied for unattended DMG/private-path continuation because G0 is Conditional Go and G1.1 is READY_TO_SHIP.
- Attempted fixes: Created safe-prep docs, then implemented public `OrganizerGridContent`, thinned Host `GridWindow.tsx`, and verified TypeScript/build/boundary checks.
- Current status: RESOLVED; `grid-shell-organizer-content` is READY_TO_SHIP for the DMG/private path. Cross-vendor verify and manual runtime smoke remain deferred.
- Resume instruction: Human may review `26d9f57` and run ship manually; roadmap continuation has proceeded beyond G1.4 and should continue with G2 because G1.5 depends on G2 Repository v0.

## Incident 10

- Time: 2026-05-19 20:37 PDT
- Feature: multi-grid-event-scope
- Symptom: Production Grid event migration cannot start.
- Root cause if known: G1.4 depends on a stable Host/Grid shell boundary. G1.2 is now READY_TO_SHIP.
- Attempted fixes: Created safe-prep docs, migrated production Grid events to `organizer:grid:*` / `organizer:file:drop`, added runtime guards and guard tests, and updated EventMap/contracts.
- Current status: RESOLVED; `multi-grid-event-scope` is READY_TO_SHIP for the DMG/private path. Cross-vendor verify and manual runtime smoke remain deferred.
- Resume instruction: Human may review `78aef01` and run ship manually; roadmap continuation should proceed to G2 because G1.5 depends on G2 Repository v0.

## Incident 11

- Time: 2026-05-19 20:39 PDT
- Feature: native-dnd-path-first
- Symptom: Production path-first DnD implementation cannot start.
- Root cause if known: G1.3 now has G0.4 real Finder payload observations, but still depends on MAS sandbox/security-scope decisions.
- Attempted fixes: Created safe-prep docs mapping current drop behavior, target `DroppedFile[]` shape, and unresolved receiver/security-scope decisions. Avoided production source changes.
- Current status: BLOCKED_EXTERNAL.
- Resume instruction: Complete MAS sandbox dry run, then rerun feature-build for `native-dnd-path-first`.

## Incident 12

- Time: 2026-05-19 20:41 PDT
- Feature: grid-persistence
- Symptom: Production Grid persistence implementation cannot start.
- Root cause if known: G1.5 depends on G2 Repository v0/localStorage migration decisions.
- Attempted fixes: Created safe-prep docs mapping current localStorage behavior, target repository boundary, and deferred restore/migration tests. Avoided production source changes.
- Current status: BLOCKED.
- Resume instruction: Complete G2 Repository v0, then rerun feature-build for `grid-persistence`.
