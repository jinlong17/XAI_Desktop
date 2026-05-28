# desktop-auto-update-release-channel — Test Plan

## Validation Goals

- confirm the desktop app can integrate the official Tauri updater without turning placeholder config into a silent live path
- confirm the browser-safe desktop updater bridge stays out of the shared web bundle
- confirm release-channel metadata is explicit and internal-only
- confirm missing endpoint/public-key inputs surface honest disabled/unavailable states
- confirm update detection can surface `install_unavailable` without exposing an install flow
- confirm the default desktop build does not imply production updater readiness

## Contract Checks

- `apps/desktop/src-tauri/Cargo.toml`
  - adds `tauri-plugin-updater` only for this feature’s native transport
- `apps/desktop/src-tauri/src/lib.rs`
  - initializes updater transport and the host-owned adapter/command seam
- `apps/desktop/src-tauri/src/commands/` or equivalent updater module
  - owns runtime preflight, channel resolution, check/status-only behavior, and typed snapshot mapping
- `apps/desktop/src-tauri/capabilities/default.json`
  - grants explicit updater permissions only as needed for `check/status-only`
- `apps/desktop/package.json`
  - keeps default desktop build scripts intact
- browser-safe feature package
  - exports `/web`
  - owns updater snapshot/reason-code types
  - contains no direct `@tauri-apps/*` imports
- settings surface
  - exposes version, channel, updater state, explicit disabled/unavailable copy, and explicit install-unavailable copy

## Automated Checks

- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web build`
- `rg "@tauri-apps|__TAURI__" apps/web/dist/assets/*.js`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Web / Unit Coverage

### Browser safety and adapter seam

- `apps/web` imports only `@repo/desktop-auto-update-release-channel/web`
- no `@tauri-apps/*` imports appear under `apps/web/src/**/*` for this feature
- built `apps/web/dist/assets/*.js` contains no `@tauri-apps` or `__TAURI__` strings from this row
- bridge behavior with:
  - missing `window.__XAI_DESKTOP_UPDATER__`
  - non-desktop runtime
  - disabled channel

### Runtime preflight and status mapping

- placeholder endpoint maps to explicit disabled/unavailable reason
- placeholder public key maps to explicit disabled/unavailable reason
- valid internal channel metadata maps to `ready`
- `204` no-update response maps to `up-to-date`
- valid signed update metadata maps to `update-available` plus `install_unavailable`
- manifest/signature/network failures map to explicit `error` states

### Settings/UI coverage

- About (preferred) or `More` pane shows:
  - current version
  - channel
  - updater state
  - explicit disabled reason
  - explicit install-unavailable copy when update metadata is returned
- `Check for Updates` action:
  - disabled when updater is unavailable
  - calls bridge/runtime check when available
- no install action is rendered in this row

## Manual Internal macOS Smoke

- launch a normal desktop build with no real updater config
  - verify updater state is explicitly disabled/unavailable
  - verify no fake production-ready copy appears
- launch an internal updater-enabled build with real internal endpoint/public key and a controlled signed manifest
  - verify channel is shown as `internal-rc` or `internal-canary`
  - verify check result distinguishes:
    - no update
    - update available
    - network/signature failure
  - verify update-available state still explains that install is unavailable in this build

## Regression Checks

- default `pnpm --filter desktop build` remains valid even when updater-artifact prerequisites are absent
- placeholder updater values can no longer be mistaken for a live configuration
- no overlay/control/grid startup is reintroduced
- no production/public release claims are added to UI or docs without Apple signing/notarization evidence

## Mock Strategy

- mock `window.__XAI_DESKTOP_UPDATER__` in web/unit tests
- mock Rust-side updater responses for:
  - disabled
  - no update
  - update available
  - update available plus `install_unavailable`
  - signature/network failure
- do not hit real update infrastructure in CI
- keep real internal endpoint/manual smoke explicitly scoped

## Residual Risks

- Real internal update install still depends on controlled signing material, a real internal host, and future scoped work outside this row
- Apple signing/notarization remain separate release gates after this row
- permission scope can drift wider than intended if build accidentally adds install support despite the frozen `check/status-only` contract
