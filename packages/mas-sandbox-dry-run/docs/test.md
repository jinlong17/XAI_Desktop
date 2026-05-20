# mas-sandbox-dry-run — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`
- Temporary comparison already run: set `"macOSPrivateApi": false`, disable the Rust `macos-private-api` Cargo feature, run `pnpm --filter desktop tauri dev`, observe compile failure on `.transparent(true)`, restore `"macOSPrivateApi": true` and the Cargo feature

## Blocked Manual Checks

- Implement a MAS fallback that avoids unconditional `.transparent(true)`, then build/run with `macOSPrivateApi=false`.
- Run sandboxed/signed build if Apple Developer prerequisites exist.
- Validate Grid creation, click-through, Finder path behavior, tray behavior, and file bookmark requirements.
