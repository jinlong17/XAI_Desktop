# grid-window-prototype — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | grid-window-prototype |
| Title | G0.2 alpha/beta Grid window prototype |
| Roadmap | xai-g0-window-spike · feature #2 · G0.2 |
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | G0.3 click-through-matrix |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (Codex inline) |
| Updated | 2026-05-19 20:25 PDT |
| Blockers | — |

## Phase Plan

### Phase 1 — GridWindow prototype fallback

- Add a G0 fallback panel to `apps/desktop/src/windows/GridWindow.tsx` for windows with no Organizer grid data.
- Read current window label, position, and size.
- Display `gridId`, label, and rect/size.
- Add a scoped-event button that targets the current window label with payload including `gridId`.
- Add evidence instructions under `docs/reviews/window-ground-truth/grid-window-prototype/README.md`.
- Update roadmap status docs.

Gate:
- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter desktop build`

Status: DONE. Commit: `6b121ea`.

Test results:
- `pnpm --filter @repo/plugin-organizer check-types`: PASS.
- `pnpm --filter desktop build`: PASS with existing Vite chunk-size warning.

## Review Notes

feature-review (Codex inline), 2026-05-19 14:38 PDT. Verdict: APPROVED.

- Discovery quality: PASS. The plan is grounded in existing local files and no external dependency decision is involved.
- Design alignment: PASS. The fallback panel only appears when GridWindow has no Organizer state and keeps normal `SmartContainer` rendering unchanged.
- Contract completeness: PASS. The existing `create_grid_window` command is reused unchanged; the spike event is not an EventMap or Tauri command contract.
- Phase plan quality: PASS. One implementation phase is sufficient and bounded to `GridWindow.tsx` plus evidence/docs.
- Architecture risk: PASS with one note: the spike code must remain visibly G0-only and must not add Host business state or Organizer persistence changes.

Deferred review gate: independent cross-vendor review is unavailable in this serial unattended run. Recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`.

## Verification Notes

feature-verify (Codex inline), 2026-05-19 14:41 PDT. Verdict: PASS -> READY_TO_SHIP.

Verification performed:
- Reviewed commit `6b121ea` and confirmed it has one implementation intent.
- Confirmed commit message follows `docs/conventions/COMMIT_CONVENTION.md`.
- Confirmed no diff in `apps/desktop/src-tauri/src/commands/window.rs`, `docs/contracts/tauri-commands-v0.md`, `docs/contracts/events-v0.md`, or `packages/core/src/events`.
- Re-ran `pnpm --filter @repo/plugin-organizer check-types`: PASS.
- Re-ran `pnpm --filter desktop build`: PASS with Vite chunk-size warning only.
- Confirmed `GridWindow.tsx` includes `data-g0-grid-prototype`, `g0-grid-prototype:scoped-ping`, `emitTo(...)`, and payload fields including `gridId` and `windowLabel`.

Residual risks:
- Real Tauri runtime proof for two simultaneous windows remains deferred.
- DevTools/log proof that alpha events are not delivered to beta remains deferred.
- Independent cross-vendor verify is deferred in this serial unattended run.

## Runtime Bugfix Follow-Up

User report, 2026-05-19 15:24 PDT: clicking `+ New Grid` did not create a native Grid window.

Patch:
- Commit `14e04c2 fix(grid-window): route new grid requests to main`.
- Commit `01e5167 fix(control-window): keep ai cube above grids`.
- Commit `b8c34fe fix(control-window): drag natively and harden grid creation`.
- ControlWindow now sends `organizer:create-grid-request` directly to the `main` window with a `{ rect }` payload.
- OrganizerLayer listens for the documented contract event, keeps a legacy fallback listener, and uses Tauri v2 runtime detection instead of relying on `window.__TAURI__`.
- The macOS control window now sits above Grid windows so the AI cube/settings panel remains clickable and draggable after Grid creation.
- The AI cube now moves the native control window instead of a DOM element bounded inside the 360x360 window.
- `+ New Grid` now uses a shared `gridId`, screen-relative placement, main-window state sync, and a direct no-duplicate `create_grid_window` fallback.

Verification performed:
- `pnpm --filter @repo/plugin-organizer check-types`: PASS.
- `pnpm --filter @repo/core check-types`: PASS.
- `pnpm --filter desktop build`: PASS with Vite chunk-size warning only.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`: PASS with existing dead-code warnings.

Runtime status at 2026-05-19 15:47 PDT: BLOCKED until human runtime confirmation. Superseded by the 2026-05-19 20:25 PDT runtime recovery confirmation below.

## Runtime Recovery Confirmation

User report, 2026-05-19 20:25 PDT: runtime issues are fixed and committed.

Confirmed commits:
- `7b7ff35 fix(window-runtime): unblock AI cube drag, grid window render, and silent IPC failures`.
- `f65a1b5 feat(control-window): live-resize, cascade spawn, focus-dismiss, clear-all UX`.
- `a33c74d fix(grid-window): use OS-native startDragging so grid moves freely across the full screen`.

Verification performed after these commits:
- `pnpm --filter desktop exec tsc --noEmit`: PASS.
- `pnpm --filter @repo/plugin-organizer check-types`: PASS.
- `pnpm --filter desktop build`: PASS with Vite chunk-size warning only.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`: PASS with existing dead-code warnings.

Status: READY_TO_SHIP. Deferred gates remain recorded for independent review/verify and any deeper alpha/beta scoped-event evidence.

## Deferred Gates

- Human ship for `window-ground-truth` is deferred; G0.2 is proceeding from local READY_TO_SHIP evidence only.
- Runtime Tauri alpha/beta window evidence is deferred until a human can run the app and inspect DevTools logs.
- Cross-vendor review/verify is deferred in serial unattended mode.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 14:36 PDT | feature-plan (Codex inline) | Fresh plan: selected existing-command plus GridWindow fallback approach; wrote Step 0, discovery, design/api/test/dev_log. | — | feature-review |
| 2026-05-19 14:38 PDT | feature-review (Codex inline) | Approved the G0.2 plan: existing command unchanged, bounded GridWindow fallback, no contract or persistence changes. | — | feature-build |
| 2026-05-19 14:40 PDT | feature-build (Codex inline) | Phase 1: added GridWindow G0 fallback panel with window metadata and targeted scoped-event button; added manual evidence instructions. Tests passed: plugin-organizer check-types; desktop build (chunk-size warning only). | 6b121ea | feature-verify |
| 2026-05-19 14:41 PDT | feature-verify (Codex inline) | Verified commit boundary, no command/contract/EventMap diff, reran plugin-organizer check-types and desktop build, and recorded runtime evidence as deferred. Status -> READY_TO_SHIP. | verify-status docs commit | ship |
| 2026-05-19 15:24 PDT | bug-fix (Codex inline) | Patched `+ New Grid` request routing and Tauri runtime detection after user reported no native window. Automated checks pass; runtime confirmation still required. Status -> BLOCKED. | 14e04c2 | runtime verify |
| 2026-05-19 15:32 PDT | bug-fix (Codex inline) | Raised the control window above Grid windows after user reported the AI icon could not open settings or drag once Grid windows existed. Rust/frontend checks pass; runtime confirmation still required. | 01e5167 | runtime verify |
| 2026-05-19 15:47 PDT | bug-fix (Codex inline) | Added native control-window dragging and direct same-`gridId` Rust fallback for `+ New Grid` after user reported movement bounds and no generation. Type/build checks pass; runtime confirmation still required. | b8c34fe | runtime verify |
| 2026-05-19 20:25 PDT | runtime-verify (human + Codex checks) | User confirmed runtime fixed; reviewed commits `7b7ff35`, `f65a1b5`, `a33c74d`; reran desktop/plugin/Cargo checks. Status -> READY_TO_SHIP. | 7b7ff35, f65a1b5, a33c74d | G0.3 |
