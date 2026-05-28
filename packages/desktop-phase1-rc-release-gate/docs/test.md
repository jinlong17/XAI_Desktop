# desktop-phase1-rc-release-gate — Test Plan

## Validation Goals

- Confirm the current desktop app can be defended as a Phase 1 release candidate or is blocked with exact classification.
- Confirm `.app` packaging remains good and `.dmg` packaging is either verified or explicitly classified as the first blocker item.
- Confirm offline launch reaches `/app` and keeps the app on one normal main window.
- Confirm native menu/config persistence works through practical interaction and relaunch.
- Confirm online-only surfaces degrade clearly and non-mutatingly offline.

## Contract Checks

- `apps/desktop/package.json`
  - `dev`, `build`, and `build:dmg` remain the canonical desktop entrypoints
- `apps/desktop/src-tauri/tauri.conf.json`
  - still owns the web-dist/offline desktop build contract
- `apps/desktop/src-tauri/src/lib.rs`
  - still installs the native menu and applies main-window config on the active startup path
- `apps/desktop/src-tauri/src/app_menu.rs`
  - support items remain scoped to Phase 1 main-window behavior
- `apps/desktop/src-tauri/src/app_config.rs`
  - host config persistence remains versioned and main-window scoped
- owning web packages
  - offline runtime gates still hold under desktop launch

## Automated Checks

- `pnpm --filter @repo/web build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop dev`
- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`

If a blocker fix changes only a smaller subset, re-run the smallest needed focused tests in addition to the full RC command matrix.

## Phase-by-Phase Test Boundaries

### Phase 1 — DMG Reproduction and Blocker Classification

Checks:

- run `pnpm --filter desktop build:dmg`
- record whether `.dmg` is emitted under `apps/desktop/src-tauri/target/debug/bundle/dmg/`
- if not emitted, capture:
  - exact command
  - last emitted stage
  - whether `.app` still built successfully
  - whether the failure appears repo-side or environment-side

Exit rule:

- do not treat DMG failure as a vague residual note; classify it as blocker item R1 when unresolved

### Phase 2 — Integrated App/Installer Offline Launch Gate

Checks:

- verify `.app` exists at `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- disable network and launch the built app
- verify the app reaches bundled `/app`
- verify no redirect back to `/auth/login`
- verify exactly one normal window launches
- verify no overlay shell, control window, or grid window auto-start occurs
- if a `.dmg` exists, mount and drag-install to `/Applications`, then launch once

### Phase 3 — Native Menu and Config Persistence Gate

Checks:

- verify the system menu bar shows the expected top-level menus
- exercise practical actions:
  - `Reveal Config Folder`
  - `Reset Main Window State`
  - standard minimize/fullscreen/quit behavior
- resize and/or move the main window, relaunch, and verify restore behavior
- confirm config reset restores defaults without touching web-owned preferences

### Phase 4 — Online-only Surface Degradation and RC Verdict

Checks:

- AI surface:
  - verify offline/demo behavior rather than live request attempts
- board map:
  - verify explicit unavailable state rather than live tile loading
- settings integrations:
  - verify connect actions are disabled offline
- settings premium:
  - verify upgrade flow is disabled offline
- direct callback routes:
  - verify OAuth and Stripe callback pages do not mutate local state offline
- account settings:
  - verify delete behavior is explicitly local-only or unavailable, with no live RPC
- write one RC matrix and blocker/risk register

## Manual macOS Checks

- Launch the built `.app` with network disabled and inspect the actual route and window count.
- If `.dmg` exists, mount it, drag-install, and launch from `/Applications`.
- Confirm Dock-visible normal-window behavior.
- Confirm the native menu behaves like a normal macOS app menu.
- Confirm relaunch persistence on the current monitor topology.
- Confirm offline degradation copy is clear and does not leave the UI in ambiguous loading states.

## Mock Strategy

- Reuse the shipped desktop runtime inputs:
  - `VITE_WEB_AUTH_MODE=mock-authenticated`
  - `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- Do not add new mock surfaces unless a blocker fix makes them necessary for focused tests.
- Prefer feature-local evidence docs over new broad integration mocks for installer behavior.

## RC Verdict Rules

- Hard blockers:
  - `.app` missing or build failure
  - offline `/app` launch failure
  - default startup creates extra overlay/control/grid windows
  - menu/config persistence breaks the current Phase 1 shell
  - online-only surfaces still mutate state or rely on live network behavior offline
- First blocker item:
  - `.dmg` stall or failure if it still reproduces
- Non-blocking only if clearly out of scope:
  - signing, notarization, updater rollout, and broader Phase 2/3 work

## Residual Risk

- Real macOS hardware remains mandatory for final RC confidence on installer and offline GUI behavior.
- DMG behavior may remain sensitive to local macOS image-tooling behavior even when repo packaging inputs are correct.
- This feature should end with exact classification, not with ambiguous "probably fine" release notes.
