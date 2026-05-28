# desktop-global-hotkey-quick-open — API / Contract Notes

## Contract Summary

This feature is a native-host shortcut contract, not an HTTP/API feature.

Primary surfaces:

- Rust-owned global shortcut plugin initialization and registration lifecycle
- `default.json` main-window capability scope
- host-owned config migration and persistence
- browser-safe desktop hotkey package
- host-injected adapter contract for settings UI
- minimal native Help-menu recovery actions

## Upstream Interfaces

### Native global-shortcut transport

Expected transport:

- `tauri-plugin-global-shortcut` initialized in `apps/desktop/src-tauri/src/lib.rs`
- Rust-side registration/unregistration only
- no direct browser-side plugin usage from `apps/web`

Frozen capability boundary:

- capability file: `apps/desktop/src-tauri/capabilities/default.json`
- keep `windows: ["main"]`
- keep existing permissions used by the host-injected bridge path:
  - `core:default`
  - `core:event:default`
  - `opener:default`
  - `notification:default`
- do not add guest global-shortcut permissions in the selected design:
  - `global-shortcut:allow-is-registered`
  - `global-shortcut:allow-register`
  - `global-shortcut:allow-register-all`
  - `global-shortcut:allow-unregister`
  - `global-shortcut:allow-unregister-all`
- if build later attempts to expose `window.__TAURI__.globalShortcut` or `@tauri-apps/plugin-global-shortcut` to the web bundle, that is a contract change and must reopen review

Required scope discipline:

- show/focus the `main` window only
- no overlay/control/grid startup or toggle behavior
- no generic multi-shortcut registry in this row

### Host config contract

Current owner:

- `apps/desktop/src-tauri/src/app_config.rs`

Required evolution:

- support both schema v1 and schema v2 during load
- persist only the quick-open preference required by this row
- keep runtime registration failure state out of the persisted file

Recommended v2 Rust shape:

```rust
struct DesktopAppConfigV2 {
    schema_version: u32,
    updated_at: String,
    window: DesktopWindowConfigV1,
    quick_open: QuickOpenShortcutConfigV2,
}

struct QuickOpenShortcutConfigV2 {
    preset_id: String,
    accelerator: Option<String>,
    enabled: bool,
}
```

### Browser-safe package contract

Expected public entrypoint:

- `@repo/desktop-global-hotkey-quick-open/web`

Expected responsibility:

- expose runtime types and settings-facing hooks/components
- mount a bridge from `apps/web/src/providers/AppProviders.tsx`
- consume only a host-injected desktop adapter
- never import `@tauri-apps/*`
- never reference `window.__TAURI__`

Frozen lifecycle:

- `AppProviders` mounts the bridge once per app session
- the bridge performs `getSnapshot()` hydration on mount
- the bridge owns one `subscribe(...)` listener for host-originated updates
- `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx` reads feature state and calls feature actions; it does not read the adapter global directly

## Downstream Interfaces

### Feature-owned desktop adapter contract

Recommended shape:

```ts
type DesktopQuickOpenRuntimeState =
  | "ready"
  | "disabled"
  | "conflict"
  | "invalid_config"
  | "native_error";

type DesktopQuickOpenPresetId =
  | "default"
  | "alt-1"
  | "alt-2"
  | "disabled";

interface DesktopQuickOpenSnapshot {
  preference: {
    presetId: DesktopQuickOpenPresetId;
    accelerator: string | null;
    enabled: boolean;
  };
  runtime: {
    state: DesktopQuickOpenRuntimeState;
    label: string;
    errorCode?: string;
    recoverable: boolean;
  };
}

interface DesktopQuickOpenRuntimeAdapter {
  getSnapshot(): Promise<DesktopQuickOpenSnapshot>;
  setPreference(input: {
    presetId: DesktopQuickOpenPresetId;
    enabled: boolean;
  }): Promise<DesktopQuickOpenSnapshot>;
  subscribe(handler: (snapshot: DesktopQuickOpenSnapshot) => void): () => void;
}

declare global {
  interface Window {
    __XAI_DESKTOP_GLOBAL_HOTKEY__?: DesktopQuickOpenRuntimeAdapter;
  }
}
```

Recommended feature-owned DOM event name used by the host adapter implementation:

- `xai:desktop-global-hotkey-snapshot`

Recommended preset mapping:

- `default` → `CommandOrControl+Shift+Space`
- `alt-1` → `CommandOrControl+Shift+O`
- `alt-2` → `CommandOrControl+Option+O`
- `disabled` → no registration

### Native Tauri command boundary

Recommended commands:

- `desktop_global_hotkey_get_snapshot() -> Result<DesktopQuickOpenSnapshot, String>`
- `desktop_global_hotkey_set_preference(input) -> Result<DesktopQuickOpenSnapshot, String>`

Required semantics:

- `main`-window scoped only
- idempotent for repeated identical preference writes
- preference write path:
  - validate preset id
  - resolve accelerator
  - persist the desired preference
  - unregister previous shortcut if needed
  - attempt to register the new shortcut when enabled
  - return the new snapshot with runtime status
  - publish that same snapshot to the mounted bridge subscription channel

### Native menu contract

Recommended custom menu item IDs:

- `help.disable_quick_open_shortcut`
- `help.reset_quick_open_shortcut`

Required semantics:

- both actions reuse the same host apply path as settings writes
- disable action persists `enabled = false`
- reset action persists the default preset and retries registration
- after either action, Rust publishes the updated snapshot through the bridge subscription channel so the next pane render is already current

### Settings integration contract

Target surface:

- `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx`

Required semantics:

- current desktop state is visible inside the existing hotkeys pane
- changing the preset updates the host config and runtime state
- the pane obtains state from the `AppProviders`-mounted quick-open bridge rather than owning its own adapter subscription
- disabled state is explicit and persisted
- conflict/native-error state is explicit and recoverable
- existing web-only hotkeys list remains visible and unchanged

## Error Semantics

- Global-shortcut plugin initialization failure is a startup failure and should fail fast.
- Missing or corrupt config file still falls back through the host config default/migration path.
- Invalid persisted preset data should degrade to `invalid_config` and remain recoverable through reset/disable actions.
- Shortcut registration conflict must be treated as a recoverable runtime state, not a crash.
- Generic native registration failure must be surfaced as `native_error` with a user-visible label.
- A shortcut-triggered focus path that cannot obtain or recreate `main` should return/log a typed native error without reviving legacy windows.

## Permission Notes

- Keep all browser-side code free of direct Tauri imports.
- The selected contract preserves `apps/desktop/src-tauri/capabilities/default.json` as the only capability file in scope for this row.
- Preserve `windows: ["main"]` and layer a Rust-side `main` allowlist on top.
- Rust-owned registration means the web bundle does not need guest `plugin-global-shortcut` permissions.
- The host-injected adapter may use `globalThis.__TAURI__.core.invoke` and feature-owned DOM events internally, but that code stays outside the `apps/web` bundle.

## Idempotency Notes

- Repeated `get_snapshot` calls are safe.
- Repeated writes of the same preset are safe and should not leak duplicate registrations.
- Repeated disable actions are safe.
- Repeated reset-to-default actions are safe even if the default shortcut remains conflicted; the returned snapshot should still explain the current runtime state.
