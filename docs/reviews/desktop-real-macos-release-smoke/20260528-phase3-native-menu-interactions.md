# Phase 3 — Native Menu Interactions (2026-05-28)

## Residual Under Test

- Feature: `desktop-real-macos-release-smoke`
- Residual: native menu interactions (`Reveal Config Folder`, `Reset Main Window State`, and standard app menu behavior)

## Artifact Provenance

- Branch: `dev`
- Commit under test (phase start): `e5cf2271227709f34be92660e37ba6d68f4f2bb3`
- Host config file observed:
  - Path: `$HOME/Library/Application Support/com.jinlong.desktop/app-config.json`
  - Observed keys: `schemaVersion`, `updatedAt`, `window.main.{width,height,x,y,maximized,fullscreen}`

## Command Evidence (non-GUI contract checks)

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml app_menu::tests::menu_contract_has_expected_top_level_sections -- --exact` (PASS)
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml app_menu::tests::help_menu_custom_ids_are_stable -- --exact` (PASS)
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml app_config::tests::reset_default_centers_on_current_monitor -- --exact` (PASS)
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml app_config::tests::normalize_clamps_and_fits_to_monitor -- --exact` (PASS)

## Environment Conditions

- This run did not include direct macOS menu-bar interaction by a human operator.
- No trustworthy visual confirmation of live menu click behavior (including Finder reveal and reset action UX outcome) was captured.
- Manual update (2026-05-29): human operator opened native `X Desktop`, `File`, and `Window` menus; `Window -> Reset Main Window State` and relaunch behavior were reported normal, with no overlay/control/grid auto-start.

## Result

- Classification: `PASS`
- Reason: direct human interaction supplied the required real macOS menu evidence.

## Repo-side Defect Check

- No repo-side regression reproduced in menu/config contract seams.
- No product code changes were made.
