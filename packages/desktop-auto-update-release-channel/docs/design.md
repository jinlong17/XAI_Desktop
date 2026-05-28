# desktop-auto-update-release-channel — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option C — official Tauri updater with host-owned runtime guard and internal-only check/status release-channel contract |
| Review Doc Path | `docs/reviews/desktop-auto-update-release-channel/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 2 desktop-native updater/status capability with internal-only enablement |

## Frozen Assumptions

- The active desktop product remains the ADR-0011 normal-window Tauri wrapper around `apps/web`; overlay/control/grid surfaces stay quarantined.
- This row may integrate the official Tauri updater plugin for internal builds, but it must not claim production or public release readiness without separate Apple signing/notarization evidence.
- Install scope is frozen to `check/status-only` in this row; download/install and updater-artifact creation are deferred until real internal signing/private-key/release-host infrastructure exists.
- The current checked-in updater placeholders (`updates.example.invalid`, `DEFERRED_TAURI_UPDATER_PUBLIC_KEY`) are treated as non-live values and must never be interpreted as a real updater configuration.
- `apps/web/src/**/*` and shared web packages remain browser-safe; direct `@tauri-apps/*` imports do not enter the shared web bundle for this row.
- Release channel is host-owned metadata, not a user preference in this row.
- Internal-only channels are the only supported live channels in this feature:
  - `internal-rc`
  - `internal-canary`
- `disabled` is a first-class channel/state outcome when real endpoint/public-key inputs are absent.
- `install_unavailable` is a first-class reason outcome when an update is detected but this row intentionally stops short of install.
- Real updater artifacts require a non-placeholder updater signing key pair and a controlled internal update endpoint, but those artifacts are not owned by this row.
- Apple code signing/notarization remain separate release gates even if internal updater signing is functional.

## Dependency Overview

- Upstream authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row #6
  - `docs/release/versioning.md`
  - `docs/reviews/desktop-auto-update-release-channel/20260528-roadmap-seed.md`
- Desktop/native preconditions:
  - `desktop-phase1-rc-release-gate` SHIPPED
  - `desktop-phase1-build-packaging-pipeline` SHIPPED
  - `desktop-basic-macos-menu-config-store` SHIPPED
- Host/native implementation surfaces:
  - `apps/desktop/src-tauri/Cargo.toml`
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/commands/`
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `apps/desktop/src-tauri/capabilities/default.json`
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `apps/desktop/package.json`
- Browser-safe/UI surfaces:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/plugin-web-settings-rest/src/panes/aboutPane.tsx`
  - `packages/plugin-web-settings-rest/src/panes/morePane.tsx`

## Native Shape After This Feature

- The desktop app initializes the official Tauri updater plugin in Rust.
- The host owns runtime updater preflight:
  - validates channel
  - validates endpoint/public-key inputs
  - classifies missing or placeholder values explicitly
- The host injects a desktop updater adapter into the main webview runtime or exposes an equivalent host-owned bridge command surface.
- The `apps/web` runtime mounts only a browser-safe `/web` entrypoint from this feature package.
- The desktop runtime exposes explicit updater states:
  - `disabled`
  - `ready`
  - `checking`
  - `update-available`
  - `up-to-date`
  - `error`
- The desktop runtime exposes one frozen reason-code set:
  - `channel_disabled`
  - `missing_endpoint`
  - `placeholder_endpoint`
  - `missing_pubkey`
  - `placeholder_pubkey`
  - `updater_not_configured`
  - `install_unavailable`
  - `network_error`
  - `invalid_manifest`
  - `signature_error`
- The default desktop build remains a non-production updater promise. This row stops at status plus manual check; install/artifact paths stay deferred behind explicit downstream gates.

## Ownership Shape

Recommended owning slice:

- `packages/desktop-auto-update-release-channel/`

Recommended responsibilities:

- browser-safe `/web` entrypoint
- updater snapshot and reason-code types
- hook/bridge state management for desktop runtime
- Settings status integration helpers
- placeholder/config guard unit tests

Recommended thin host responsibilities:

- plugin initialization
- updater config resolution and guard logic
- channel resolution
- host-injected adapter or command seam

## Planned Runtime Split

### Phase 1 — Native updater foundation and guarded bridge

- add `tauri-plugin-updater`
- add explicit updater preflight in Rust
- expose a host-owned adapter to the webview
- ensure placeholder endpoint/public-key values map to disabled/unavailable states
- expose only snapshot plus `Check for Updates` behavior in this row
- avoid direct `@tauri-apps/*` imports in shared web code

### Phase 2 — Release-channel metadata and status UI

- freeze channel enum:
  - `disabled`
  - `internal-rc`
  - `internal-canary`
- expose snapshot fields:
  - version
  - channel
  - availability
  - reason code
  - last check metadata
- add Settings → About updater card (preferred) or `More` fallback
- provide explicit `Check for Updates` action and admin-facing copy
- do not expose an install action; show explicit install-unavailable copy when an update is found

### Phase 3 — Verification and deferred install gate

- verify placeholder rejection, `up-to-date`, `update-available`, and `install_unavailable` status mapping
- verify browser-safe bundle boundaries
- record full install/updater-artifact work as deferred behind real internal endpoint/public key/private signing inputs
