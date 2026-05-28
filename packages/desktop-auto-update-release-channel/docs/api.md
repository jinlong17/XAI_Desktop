# desktop-auto-update-release-channel — API / Contract Notes

## Contract Summary

This feature is a desktop-native updater/status bridge contract, not an HTTP feature.

Primary surfaces:

- official Tauri updater plugin initialization
- host-owned runtime preflight and release-channel resolution
- browser-safe desktop updater bridge
- updater snapshot/status contract
- explicit install-unavailable semantics for this row
- Settings status/action integration

## Upstream Interfaces

### Native updater transport

Expected transport:

- `tauri-plugin-updater` initialized in `apps/desktop/src-tauri/src/lib.rs`
- updater runtime built from Rust using `UpdaterExt` / `updater_builder()`
- updater capability permission enabled explicitly in `apps/desktop/src-tauri/capabilities/default.json`

Frozen rule:

- static placeholders in `tauri.conf.json` are not sufficient to mark the updater as live
- the host must perform a runtime/config preflight before exposing `ready`

### Browser-safe feature entrypoint

Expected public entrypoint:

- `@repo/desktop-auto-update-release-channel/web`

Expected responsibility:

- mount updater bridge from `apps/web/src/providers/AppProviders.tsx`
- consume only a host-owned desktop adapter surface
- degrade cleanly outside the desktop runtime or when updater is disabled

### Release-channel metadata contract

Frozen minimum channel set:

```ts
type DesktopReleaseChannel =
  | "disabled"
  | "internal-rc"
  | "internal-canary";
```

Frozen reason-code set:

```ts
type DesktopUpdaterReasonCode =
  | "channel_disabled"
  | "missing_endpoint"
  | "placeholder_endpoint"
  | "missing_pubkey"
  | "placeholder_pubkey"
  | "updater_not_configured"
  | "install_unavailable"
  | "network_error"
  | "invalid_manifest"
  | "signature_error";
```

Production/public channel names are intentionally excluded in this row.

## Downstream Interfaces

### Desktop updater bridge contract

Recommended adapter contract:

```ts
type DesktopUpdaterAvailability =
  | "disabled"
  | "ready"
  | "checking"
  | "update-available"
  | "up-to-date"
  | "error";

interface DesktopUpdaterSnapshot {
  channel: DesktopReleaseChannel;
  currentVersion: string;
  availability: DesktopUpdaterAvailability;
  reasonCode?: DesktopUpdaterReasonCode;
  updateVersion?: string;
  updateNotes?: string;
  lastCheckedAt?: string;
}

interface DesktopUpdaterRuntimeAdapter {
  getSnapshot(): Promise<DesktopUpdaterSnapshot>;
  check(): Promise<DesktopUpdaterSnapshot>;
  subscribe(handler: (snapshot: DesktopUpdaterSnapshot) => void): () => void;
}

declare global {
  interface Window {
    __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter;
  }
}
```

Required semantics:

- `disabled`
  - updater is intentionally off or preflight failed before any live check
- `ready`
  - updater config passed preflight and no live check is running
- `checking`
  - check is in progress
- `update-available`
  - a valid signed update manifest exists for the active internal channel
  - this row must pair that state with `reasonCode = "install_unavailable"` until install work is explicitly planned later
- `up-to-date`
  - the active internal channel returned no update
- `error`
  - live check failed after preflight

### Build contract

Default desktop build contract remains unchanged:

- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`

Required behavior:

- missing or placeholder inputs must fail explicitly or resolve to a disabled status
- updater install/artifact creation is out of scope for this row and must remain unavailable
- the default build path must not silently start promising updater readiness

### Settings status contract

Preferred integration point:

- `packages/plugin-web-settings-rest/src/panes/aboutPane.tsx`

Required user/admin-visible fields:

- current desktop version
- current internal release channel
- updater state text
- explicit reason when disabled/unavailable
- `Check for Updates` action
- explicit install-unavailable copy when an update is detected

Fallback integration point:

- `More` pane, only if `About` becomes impractical during build

## Error Semantics

- Placeholder endpoint or public key is not a soft warning; it is a feature-owned disabled/unavailable state.
- `install_unavailable` is the frozen reason when a valid update is detected but this row intentionally does not own install.
- Missing updater signing private key remains a downstream prerequisite for future install/artifact work, even if the app can otherwise launch.
- Successful internal updater integration does not imply Apple signing/notarization readiness for external release.
- Network, manifest, or signature failures must surface explicit status rather than crash the app.

## Permission Notes

- Updater permission scope must be explicit in Tauri capabilities.
- Prefer the narrowest updater permission set that still matches `check/status-only` behavior in this row.
- If the plugin requires a coarse updater capability such as `updater:default`, the bridge/UI contract must still keep install unavailable.
- No direct `@tauri-apps/*` imports should enter `apps/web/src/**/*`.

## Idempotency Notes

- Re-running snapshot retrieval with unchanged config should return the same channel/availability classification.
- Re-running check with placeholder config should remain `disabled` or `error` with the same reason until config changes.
- Re-running a check that finds the same update should keep surfacing `update-available` plus `install_unavailable` until later install work changes the contract.
