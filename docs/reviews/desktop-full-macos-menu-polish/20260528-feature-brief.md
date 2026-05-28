# Feature Brief — desktop-full-macos-menu-polish

| Field | Value |
|---|---|
| Feature | desktop-full-macos-menu-polish |
| Title | Full macOS App Menu Polish for the Normal Desktop Host |
| Date | 2026-05-28 |
| Source | `docs/reviews/desktop-full-macos-menu-polish/20260528-roadmap-seed.md`; roadmap manifest row #5 in `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Upgrade the current basic native app menu into a fuller macOS-standard `File` / `Edit` / `View` / `Window` / `Help` menu for the Phase 1 desktop host, with standard app actions, window actions, diagnostics/help entries, and correct disabled states, while keeping the active surface as the normal `main` window.

## Naming Rationale

`desktop-full-macos-menu-polish` is the canonical roadmap slug and matches the actual gap:

- `desktop` — the work is owned by the Tauri/macOS desktop host on branch `dev`
- `full-macos-menu` — the baseline menu exists, but it still needs fuller macOS-standard sections and action coverage
- `polish` — this is an incremental host-shell refinement on top of a shipped baseline, not a new tray/statusbar/hotkey feature

## Scope

- Extend `apps/desktop/src-tauri/src/app_menu.rs` from a minimal shipped contract into a fuller native menu structure
- Keep native menu construction and event handling in the Rust/Tauri shell
- Route business actions only through existing stable host/plugin seams
- Define section-by-section behavior for:
  - app submenu
  - `File`
  - `Edit`
  - `View`
  - `Window`
  - `Help`
- Add a menu-state model for correct enabled/disabled behavior on custom items
- Add support/diagnostics entries only where they help real desktop operations or verification
- Preserve current normal-window startup and legacy overlay quarantine

## Non-goals

- No new status bar product scope, notification UX, updater UX, or hotkey product expansion
- No reactivation of overlay/control/grid startup or window surfaces
- No redesign of the shipped config-store schema beyond tiny fields needed to support menu state or support actions
- No plugin-to-plugin direct imports or host business-logic migration into `apps/desktop/src/`
- No changes to macOS window-level constants or transparent overlay behavior

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The plan stays incremental to `desktop-basic-macos-menu-config-store` and does not reopen its Phase 1 menu/config decisions
- The recommended build phases clearly separate:
  - menu structure and native standard actions
  - custom command wiring and disabled-state logic
  - support/diagnostics entries, tests, and manual macOS residual checks
- The plan explicitly constrains hotkey/statusbar interactions to tiny reuse of existing seams only
- Verification requirements cover automated Rust/build checks and real macOS manual menu checks

## Current Baseline

- `desktop-basic-macos-menu-config-store` is SHIPPED and already established:
  - Rust-owned app menu install in `apps/desktop/src-tauri/src/app_menu.rs`
  - host-owned versioned config in `apps/desktop/src-tauri/src/app_config.rs`
  - `Help -> Reveal Config Folder`
  - `Help -> Reset Main Window State`
- The current baseline already includes small quick-open menu integrations:
  - `Help -> Disable Quick Open Shortcut`
  - `Help -> Reset Quick Open Shortcut to Default`
- `apps/desktop/src-tauri/src/lib.rs` still installs the status bar, so menu work must coexist with that runtime without widening tray scope
- Disabled-state management already exists in `commands/statusbar.rs` for tray items, which provides a native precedent for menu-state updates without requiring a new architecture
- Legacy overlay/control/grid code remains quarantined under `legacy_overlay.rs` and must remain inactive

## Deferred Validation

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`
- Manual macOS verification for:
  - expected menu sections and ordering
  - enabled/disabled correctness for support/diagnostic items
  - window actions on the normal `main` window
  - no overlay/control/grid reactivation
