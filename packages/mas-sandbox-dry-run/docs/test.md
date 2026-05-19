# mas-sandbox-dry-run — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`

## Blocked Manual Checks

- Build/run with `macOSPrivateApi=false`.
- Run sandboxed/signed build if Apple Developer prerequisites exist.
- Validate Grid creation, click-through, Finder path behavior, tray behavior, and file bookmark requirements.

