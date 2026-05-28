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
| Updated | 2026-05-27 17:22 PDT |
| Risks | Residual manual gate: native menu interaction, `Reveal Config Folder` / `Reset Main Window State`, and relaunch behavior across real monitor topologies still need real macOS verification before ship. |

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

## Verification Notes

**Verdict: BLOCKED** — 2 blockers, 1 residual manual gate.

- Blocker 1 — `apps/desktop/src-tauri/src/app_config.rs` persists `outer_size()` / `outer_position()` values from Tauri, which are physical pixels, then restores them with `LogicalSize` / `LogicalPosition`. Tauri runtime types confirm `outer_position -> PhysicalPosition<i32>`, `outer_size -> PhysicalSize<u32>`, and `Monitor::work_area()` is physical. This breaks the feature's conservative restore contract on Retina or mixed-scale displays because saved physical geometry is reapplied as logical geometry.
- Blocker 2 — `packages/desktop-basic-macos-menu-config-store/docs/test.md` requires config-store coverage for missing-file defaults, save/load round-trip, corrupt JSON fallback, and unsupported `schemaVersion` fallback, but the shipped Rust tests only cover menu top-level labels/help IDs and geometry normalization helpers. The documented verification contract therefore does not match the implementation evidence yet.
- Residual manual gate — native menu interaction, `Reveal Config Folder` / `Reset Main Window State`, and relaunch behavior across real monitor topologies still need human verification on macOS hardware after the blockers are fixed.

Automated verification run:

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` — pass (53/53)
- `pnpm --filter @repo/web build` — pass
- `pnpm --filter desktop tauri build --debug --bundles app` — pass (`X Desktop.app` produced)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 16:52 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the feature brief, discovery review, and docs quartet for the Phase 1 native macOS app menu and host-owned local config store. Recommended Rust-owned menu construction plus a versioned JSON config file in Tauri `app_config_dir`, with the current tray/status bootstrap explicitly treated as deferred Phase 2 work rather than the Phase 1 menu solution. | — | feature-review |
| 2026-05-27 16:57 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — validated that the plan stays strictly inside P1 Phase 1, keeps the existing tray/status menubar out of scope as a deferred Phase 2 surface, constrains the host config schema/path to native window state only, requires conservative bounds restore behavior, and preserves overlay/control/grid code as inactive-by-default legacy boundaries. Recorded 3 non-blocking build recommendations covering explicit menubar gating, safe bounds clamping, and required Rust/build/manual verification evidence. | — | feature-build |
| 2026-05-27 20:35 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 implementation complete: added Rust-owned native app menu (`app`, `File`, `Edit`, `View`, `Window`, `Help`) and switched startup to install this menu in setup; removed active startup dependency on `install_sync_menubar(...)` while keeping tray/status code deferred and inactive on Phase 1 path. | `a7641d36` feat(desktop): Phase 1 — native app menu foundation | feature-auto-build (Phase 2) |
| 2026-05-27 20:42 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 implementation complete: added host-owned versioned JSON config store at `app_config_dir/app-config.json`, startup restore/apply for main-window state, centralized bounds normalization/clamping against monitor work areas, and lifecycle persistence hooks on move/resize/scale/close/destroy events. | `2f97c554` feat(desktop): Phase 2 — host config store persistence | feature-auto-build (Phase 3) |
| 2026-05-27 20:52 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 implementation complete: added practical help actions (`Reveal Config Folder`, `Reset Main Window State`), retained scope exclusions (no tray/status rollout, no notifications/hotkeys/updater, no SQLite/sync/web-pref migration), and recorded full build evidence. Real macOS manual checks remain deferred to verify due non-interactive session. Tests run: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` (53 passed), `pnpm --filter @repo/web build` (pass), `pnpm --filter desktop tauri build --debug --bundles app` (pass; app bundle produced). | `cfa21846` feat(desktop): Phase 3 — menu/config integration evidence | feature-verify |
| 2026-05-27 17:16 PDT | feature-verify (Codex, gpt-5.4 inline) | BLOCKED — reviewed commits `a7641d36`, `2f97c554`, `cfa21846`, and `92a95793`; reran the required build/test commands; confirmed native menu install and tray bootstrap removal on the Phase 1 startup path; found a restore-contract bug where physical geometry is persisted and later restored as logical geometry, plus missing config-store tests promised by `docs/test.md`. Real macOS menu/restore verification remains pending after code fixes. | `a7641d36`, `2f97c554`, `cfa21846`, `92a95793` | feature-build |
| 2026-05-27 17:22 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | BLOCKED repair complete (Phase 2/3 contract fix): normalized geometry contract to logical-unit capture + logical restore (no physical/logical mix), made monitor work-area normalization unit-consistent, added mixed-scale conservative fallback (drop persisted x/y), and added config-store contract tests required by `docs/test.md` (missing file defaults, save/load round-trip, corrupt JSON fallback, unsupported `schemaVersion` fallback). Tests run: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` (58 passed), `pnpm --filter @repo/web build` (pass), `pnpm --filter desktop tauri build --debug --bundles app` (pass; `X Desktop.app` produced). | `ce026ca3` fix(desktop): repair window config geometry contract | feature-verify |
