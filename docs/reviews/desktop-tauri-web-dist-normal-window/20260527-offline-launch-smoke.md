# desktop-tauri-web-dist-normal-window — App Bundle / Offline Launch Smoke

Date: 2026-05-27
Executor: Codex gpt-5.4 inline fix
Scope: Feature verify blocker closure for app-bundle/static-dist launch.

## Commands

- `pnpm --filter @repo/web build` — PASS
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` — PASS, 47 tests
- `pnpm --filter desktop tauri build --debug --bundles app` — PASS

## Evidence

- App bundle produced at `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`.
- `feature-verify` launched the built app bundle and observed one standard `AI Smart Desktop` window with rendered local `tauri://localhost` content.
- `apps/web/dist` exists and contains `index.html`, `_headers`, `sw.js`, `.vite/manifest.json`, CSS, JS, and source maps.
- The generated `X Desktop.app` contains the executable, `Info.plist`, and icon resources; Tauri embeds the static web assets into the app binary for this debug app-bundle target.

## Offline Interpretation

This feature's offline acceptance gate is that the normal-window desktop host launches bundled static web content without a missing-dist crash or dev-server dependency. That gate is satisfied by the app-bundle smoke above.

The web payload still contains optional online origins for fonts and map tiles:

- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com`
- `https://tile.openstreetmap.org`
- `https://www.openstreetmap.org/copyright`

Those origins may degrade when network is unavailable. That is not a blocker for this feature because full authenticated `/app` offline entry and online-only panel degradation are owned by the follow-on `desktop-web-auth-offline-mode` and `web-external-runtime-offline-gates` features.

## Packaging Boundary

Default all-bundle DMG creation is not closed here. `pnpm --filter desktop tauri build --debug` gets past the web build and `.app` bundling but fails in the DMG bundling step. That packaging gate is deferred to `desktop-phase1-build-packaging-pipeline`.
