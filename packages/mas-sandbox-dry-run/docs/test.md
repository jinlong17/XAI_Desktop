# mas-sandbox-dry-run — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`
- Temporary comparison already run: set `"macOSPrivateApi": false`, disable the Rust `macos-private-api` Cargo feature, run `pnpm --filter desktop tauri dev`, observe compile failure on `.transparent(true)`, restore `"macOSPrivateApi": true` and the Cargo feature
- Default path after fallback guard: `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Compile fallback path: temporarily set `"macOSPrivateApi": false`, temporarily disable Tauri dependency `macos-private-api`, then run `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --no-default-features --features mas-sandbox`; restore both defaults after the check

## Blocked Manual Checks

- Build/run the `mas-sandbox` fallback with `macOSPrivateApi=false`.
- Run sandboxed/signed build if Apple Developer prerequisites exist.
- Validate Grid creation, click-through, Finder path behavior, tray behavior, and file bookmark requirements.
