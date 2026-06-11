# Phase 3 — Native Menu and Config Persistence Gate (2026-05-28)

## Scope

- Feature: `desktop-phase1-rc-release-gate`
- Gate item: native app menu + host config persistence contract on active Phase 1 shell

## Automated Evidence

### 1) Rust menu/config test suite

```bash
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Result:

- `60 passed; 0 failed`

Menu/config-relevant test coverage observed in run:

- `app_menu::tests::menu_contract_has_expected_top_level_sections`
- `app_menu::tests::help_menu_custom_ids_are_stable`
- `app_config::tests::save_and_load_round_trip_config`
- `app_config::tests::load_defaults_when_file_absent`
- `app_config::tests::corrupt_json_falls_back_to_defaults`
- `app_config::tests::unsupported_schema_falls_back_to_defaults`
- `app_config::tests::normalize_clamps_and_fits_to_monitor`
- `app_config::tests::reset_default_centers_on_current_monitor`

### 2) Host config file observation

```bash
cat "$HOME/Library/Application Support/com.jinlong.desktop/app-config.json"
```

Observed shape:

- `schemaVersion: 1`
- `window.main` includes `width`, `height`, `x`, `y`, `maximized`, `fullscreen`
- Values are present and parseable as expected host-owned main-window state

## Deferred Manual Items (to feature-verify / human macOS pass)

- Interactive menu-bar verification on running app (top-level menus and standard macOS behavior).
- Interactive `Reveal Config Folder` menu path check.
- Interactive `Reset Main Window State` action + relaunch persistence behavior across monitor topology.

## Phase 3 Classification

- Native menu contract (automated): `PASS`
- Host config schema/persistence contract (automated): `PASS`
- GUI interaction semantics: `DEFERRED_OUT_OF_SCOPE` for non-interactive build session; required in verify/manual gate.
