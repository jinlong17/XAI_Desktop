# desktop-tauri-web-dist-normal-window — Test Plan

## Validation Goals

- Confirm the desktop host now loads `apps/web` for both Tauri dev and build.
- Confirm the main window is a normal Mac app window, not a transparent overlay.
- Confirm no `control`, `console`, or `grid_*` windows are created on startup.
- Confirm bundled static assets can launch without network access.

## Contract Checks

- `apps/desktop/src-tauri/tauri.conf.json`
  - `beforeDevCommand` targets `apps/web`
  - `devUrl` targets the `apps/web` dev server
  - `beforeBuildCommand` targets `apps/web`
  - `frontendDist` points to `apps/web/dist`
  - main window flags remove transparent/overlay/click-through assumptions
- `apps/desktop/package.json`
  - desktop scripts reflect the host/wrapper role
- `apps/desktop/src/App.tsx`
  - no organizer overlay imports on the active path
- `apps/desktop/src-tauri/src/lib.rs`
  - no overlay/control/grid startup path
- `apps/desktop/src-tauri/capabilities/*`
  - no active Phase 1 scope for `control`, `console`, `grid_*`

## Automated Checks

- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`

Default all-bundle DMG creation (`pnpm --filter desktop tauri build --debug`
without `--bundles app`) is intentionally outside this feature's acceptance
gate and belongs to `desktop-phase1-build-packaging-pipeline`. This feature
must prove the normal-window host can compile, bundle the `.app`, and load the
`apps/web` static dist handoff; it must not require final DMG packaging.

## Manual Desktop Checks

- `pnpm --filter desktop tauri dev`
- Verify the app opens as a normal resizable window with standard chrome.
- Verify the app appears in Dock/task switcher and is not hidden as a background overlay.
- Verify startup does not spawn a control bubble, console, or any grid windows.
- Verify resizing the main window behaves like a standard app window.

## Offline Launch Checks

- Build the app bundle, then launch it with network unavailable or otherwise
  verify that the launched app uses local `tauri://localhost` content from the
  bundled static handoff rather than a dev server or missing-dist fallback.
- Verify bundled static assets render without hitting a missing-dist failure.
- Verify the window still opens offline even if `/app` auth/session policy remains pending.
- Record whether offline launch reaches:
  - static shell only
  - login gate
  - full `/app`

The first two outcomes are acceptable for this feature if clearly attributed to the follow-on `desktop-web-auth-offline-mode` work; a missing bundle or startup crash is not.

### 2026-05-27 App Bundle / Offline Smoke Evidence

- `pnpm --filter desktop tauri build --debug --bundles app` passed and produced `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`.
- `feature-verify` launched the built app bundle and observed one standard `AI Smart Desktop` window with rendered local `tauri://localhost` content.
- `apps/web/dist` exists and contains `index.html`, `_headers`, `sw.js`, the Vite manifest, CSS, JS, and source maps.
- External URLs remain in the web payload for optional online content (`fonts.googleapis.com`, `fonts.gstatic.com`, OpenStreetMap tiles/attribution). Those can degrade while offline and are not a missing-dist failure for this feature.
- Outcome for this feature: **static bundled shell launches from local Tauri content**. Full authenticated `/app` offline entry is deferred to `desktop-web-auth-offline-mode`.

## Regression Checks

- No click-through behavior on the main window.
- No full-monitor forced sizing/positioning.
- No accidental dependency on the legacy desktop Vite bundle.
- No tray/status-bar requirement introduced as part of this Phase 1 feature.

## Mock Strategy

- No new mocks are required for feature-plan.
- For later build/verify, rely on the existing `apps/web` dev/build outputs and local network-disable manual smoke rather than creating a fake web dist.
