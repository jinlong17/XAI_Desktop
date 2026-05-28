# desktop-basic-macos-menu-config-store — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-basic-macos-menu-config-store |
| Title | Phase 1 Basic macOS App Menu and Local Config Store |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex inline) |
| Updated | 2026-05-27 20:52 PDT |
| Risks | Native menu behavior still needs real macOS verification; leaving `install_sync_menubar(...)` active would leak forbidden Phase 2 tray/status scope into Phase 1; persisted window coordinates need conservative validation so external-display changes do not restore unusable bounds. |

## Phase Plan

### Phase 1 — Native App Menu Foundation

Status: COMPLETED (`a7641d36`)

- Add a Rust-owned native app menu with macOS-correct submenu structure.
- Prefer predefined native items for standard app/edit/window actions.
- Stop the active startup path from relying on the existing tray/status bootstrap.

### Phase 2 — Host Config Store and Main-Window Persistence

Status: COMPLETED (`2f97c554`)

- Add the typed config-file module under `apps/desktop/src-tauri/src/`.
- Load/apply saved main-window state during setup.
- Persist validated main-window state on native window lifecycle changes.

### Phase 3 — Practical Integration and Verification

Status: COMPLETED (`cfa21846`)

- Add only minimal custom support items if they materially help Phase 1, such as config reveal/reset.
- Add Rust tests for menu/config helpers and narrow command seams only if needed.
- Record real macOS menu/persistence verification and explicit deferred notes for status bar / notifications / hotkeys / updater.

## Review Notes

**Verdict: APPROVED** — 0 blockers, 3 recommendations.

- Discovery, design, API, and test artifacts stay inside ADR-0011 Phase 1: the feature is limited to a Rust-owned app menu plus a host-owned config file, and explicitly defers status bar, notifications, hotkeys, updater, SQLite, sync, and web-pref migration.
- The current tray/status surface is correctly treated as a deferred Phase 2 concern rather than the menu solution. The build phase should make the startup-path decision explicit by removing or gating `install_sync_menubar(...)` without widening tray behavior.
- The config-store contract is conservative and usable: `app.path().app_config_dir()` plus a versioned JSON file, with persistence limited to main-window bounds/state and explicit exclusions for `xai_*` prefs, account/session secrets, sync data, and Phase 3 entities.

Recommendations for `feature-build`:

- In Phase 2, centralize bounds validation/clamping before applying persisted `x/y/width/height/maximized/fullscreen`, and fall back to defaults when monitor topology or saved values are unusable.
- Keep overlay/control/grid code on an inactive boundary only: no default startup hooks, no capability widening, and no new dependence on `control`/`grid_*` labels for menu or config behavior.
- Record one deterministic build-time proof alongside Rust tests: `cargo test`, `pnpm --filter @repo/web build`, `pnpm --filter desktop tauri build --debug --bundles app`, plus explicit real-macOS residual checks for menu behavior and restore semantics.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 16:52 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the feature brief, discovery review, and docs quartet for the Phase 1 native macOS app menu and host-owned local config store. Recommended Rust-owned menu construction plus a versioned JSON config file in Tauri `app_config_dir`, with the current tray/status bootstrap explicitly treated as deferred Phase 2 work rather than the Phase 1 menu solution. | — | feature-review |
| 2026-05-27 16:57 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — validated that the plan stays strictly inside P1 Phase 1, keeps the existing tray/status menubar out of scope as a deferred Phase 2 surface, constrains the host config schema/path to native window state only, requires conservative bounds restore behavior, and preserves overlay/control/grid code as inactive-by-default legacy boundaries. Recorded 3 non-blocking build recommendations covering explicit menubar gating, safe bounds clamping, and required Rust/build/manual verification evidence. | — | feature-build |
| 2026-05-27 20:35 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 implementation complete: added Rust-owned native app menu (`app`, `File`, `Edit`, `View`, `Window`, `Help`) and switched startup to install this menu in setup; removed active startup dependency on `install_sync_menubar(...)` while keeping tray/status code deferred and inactive on Phase 1 path. | `a7641d36` feat(desktop): Phase 1 — native app menu foundation | feature-auto-build (Phase 2) |
| 2026-05-27 20:42 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 implementation complete: added host-owned versioned JSON config store at `app_config_dir/app-config.json`, startup restore/apply for main-window state, centralized bounds normalization/clamping against monitor work areas, and lifecycle persistence hooks on move/resize/scale/close/destroy events. | `2f97c554` feat(desktop): Phase 2 — host config store persistence | feature-auto-build (Phase 3) |
| 2026-05-27 20:52 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 implementation complete: added practical help actions (`Reveal Config Folder`, `Reset Main Window State`), retained scope exclusions (no tray/status rollout, no notifications/hotkeys/updater, no SQLite/sync/web-pref migration), and recorded full build evidence. Real macOS manual checks remain deferred to verify due non-interactive session. Tests run: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` (53 passed), `pnpm --filter @repo/web build` (pass), `pnpm --filter desktop tauri build --debug --bundles app` (pass; app bundle produced). | `cfa21846` feat(desktop): Phase 3 — menu/config integration evidence | feature-verify |
