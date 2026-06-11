# Phase 2 — Integrated App/Installer Offline Launch Gate (2026-05-28)

## Scope

- Feature: `desktop-phase1-rc-release-gate`
- Gate item: integrated `.app` / `.dmg` installability and startup-shape checks

## Automated Evidence

### 1) App bundle generation

```bash
pnpm --filter desktop build
```

Observed key lines:

- `Bundling X Desktop.app`
- `Finished 1 bundle at: .../apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`

### 2) DMG mount and payload inspection

```bash
hdiutil attach apps/desktop/src-tauri/target/debug/bundle/dmg/X\ Desktop_1.0.0-rc.1_aarch64.dmg -nobrowse -readonly
ls -la /Volumes/X\ Desktop
```

Observed:

- Volume mounted at `/Volumes/X Desktop`
- Payload includes `X Desktop.app`
- Payload includes `Applications -> /Applications` link
- Detach succeeded (`hdiutil detach`)

### 3) Startup shape probe from built desktop binary

```bash
apps/desktop/src-tauri/target/debug/desktop
```

Observed runtime line:

- `🪟 Main window configured for standard app behavior`

Interpretation:

- Confirms active startup path is the normal-window shell (not overlay/control/grid boot path).

## Deferred Manual Items (to feature-verify / human macOS pass)

- Disable network and launch built app to confirm route reaches `/app` and does not redirect to `/auth/login`.
- Mount DMG and perform drag-install launch from `/Applications` copy (interactive GUI path).
- Confirm exactly one normal app window in GUI interaction.

## Phase 2 Classification

- `.app` artifact gate: `PASS`
- `.dmg` mount/payload gate: `PASS`
- Offline GUI `/app` route and drag-install launch: `DEFERRED_OUT_OF_SCOPE` for non-interactive build session; required in verify/manual gate.
