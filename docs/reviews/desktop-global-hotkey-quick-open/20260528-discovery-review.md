# Discovery Review — desktop-global-hotkey-quick-open

## Problem Framing

Phase 2 needs a native global shortcut that reveals or focuses the shipped normal desktop app window without reopening the old overlay architecture and without leaking Tauri shortcut APIs into `apps/web`.

The accepted requirement is narrower than "build a full shortcut system":

- register one desktop-global "quick open" shortcut
- show or focus the normal `main` window only
- persist the desired shortcut choice and disabled state across relaunch
- surface conflict or native registration failure clearly
- let the user recover through desktop settings and/or native menu affordances
- keep the feature scoped away from overlay/grid/control surfaces, generic shortcut registries, and Phase 3 storage work

Current repo reality:

- the active desktop runtime is the ADR-0011 normal-window Tauri app around `apps/web`
- `apps/desktop/src-tauri/src/app_config.rs` already owns a versioned host config file at `app_config_dir/app-config.json`
- `apps/desktop/src-tauri/src/app_menu.rs` already owns a native Rust menu and small support actions
- `apps/desktop/src-tauri/capabilities/default.json` is the active Phase 1 capability file and is already scoped to `windows: ["main"]`
- `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx` is still a read-only list, so user-visible desktop shortcut configuration does not exist yet
- `apps/web/src/**/*` remains browser-safety constrained and must not import `@tauri-apps/*` or touch `window.__TAURI__`
- the existing `desktop-statusbar-quick-actions` bridge pattern proves that a host-injected adapter plus a browser-safe package is already an accepted Phase 2 architecture in this repo

That leaves four planning questions:

1. Which native shortcut technology should own registration on Tauri 2/macOS?
2. How should the existing host config file evolve without becoming a new storage architecture?
3. Where should the user-visible disabled/conflict state live while keeping `apps/web` browser-safe?
4. What is the smallest configuration surface that still satisfies "changed shortcut state persists across relaunch"?

Review-driven refinements for this revise pass:

5. Which exact Tauri capability file and permission entries are part of this row, and which guest-side plugin permissions are intentionally not added?
6. Where is the desktop bridge mounted so native menu changes still reach the Settings UI even when the pane was not already open?

## Naming Rationale

Keep the roadmap slug `desktop-global-hotkey-quick-open`.

Why it fits:

- `desktop` keeps the scope on the native Tauri/macOS host on `dev`
- `global-hotkey` points at system-level registration, not in-page keyboard handlers
- `quick-open` describes the only behavior this row owns: bring the normal desktop app window forward

## External Research

This feature needs a real technology choice, so the discovery pass checked primary sources.

### Search Queries

- `site:v2.tauri.app plugin global shortcut tauri 2 register unregister isRegistered`
- `site:docs.rs tauri-plugin-global-shortcut 2.3.1 GlobalShortcutExt`
- `site:github.com tauri-apps plugins-workspace global-shortcut`
- `site:docs.rs global-hotkey latest rust crate`
- `site:github.com/tauri-apps/global-hotkey global-hotkey Apache-2.0 updated`

### Source Evidence

- Tauri v2 plugin docs: <https://v2.tauri.app/plugin/global-shortcut/>
  - The official global-shortcut plugin supports both Rust and JS entrypoints on desktop targets.
  - The docs call out permission scoping and note that `isRegistered()` does not tell you whether another application already owns the same shortcut, so conflict handling must treat registration failure as authoritative.
  - Tauri v2 positions the plugin as the supported replacement for older direct JS imports.
- Tauri plugins workspace repo: <https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/global-shortcut>
  - Official vendor-maintained plugin source under dual Apache-2.0/MIT licensing, current Tauri 2 lineage.
  - Confirms the plugin sits inside the maintained first-party plugins workspace rather than a one-off third-party integration.
- `tauri-plugin-global-shortcut` docs.rs: <https://docs.rs/tauri-plugin-global-shortcut/latest/tauri_plugin_global_shortcut/>
  - Exposes the Rust-side builder and runtime extension traits needed for host-owned registration/unregistration.
- `global-hotkey` crate docs.rs: <https://docs.rs/global-hotkey/latest/global_hotkey/>
  - Lower-level Rust crate supports macOS, Windows, and X11 and requires the event loop to stay on the main thread.
- `tauri-apps/global-hotkey` repo: <https://github.com/tauri-apps/global-hotkey>
  - Maintained by the Tauri org under dual Apache-2.0/MIT licensing, but it is a lower-level crate rather than the Tauri lifecycle-integrated plugin layer.

## Candidate Options

### Option A — Official Tauri global-shortcut plugin, Rust-owned registration, `default.json` main-only scope, app-level browser-safe bridge mount

Use the official Tauri v2 plugin from Rust only. Keep registration, unregistration, and shortcut-trigger handling inside `apps/desktop/src-tauri/`. Persist the desired shortcut preference in the existing host config file. Expose user-visible state through:

- native menu recovery items
- a browser-safe desktop hotkey package mounted once from `apps/web/src/providers/AppProviders.tsx` and consumed by the existing Settings hotkeys pane

Recommended v1 UX model:

- default preset enabled on first run
- two curated fallback presets plus `disabled`
- runtime state shows `ready`, `disabled`, `conflict`, `invalid_config`, or `native_error`

Pros:

- best alignment with the current Tauri 2 desktop stack and official maintenance path
- keeps the actual global shortcut ownership in Rust where the app lifecycle already lives
- keeps capability scope on the existing `apps/desktop/src-tauri/capabilities/default.json` `main` window only
- avoids adding guest-side `global-shortcut:*` permissions because the web bundle never calls the plugin directly
- avoids any browser-side Tauri imports in `apps/web`
- pairs naturally with the existing `app_config.rs` and `app_menu.rs` ownership boundaries
- matches the existing desktop bridge lifecycle pattern already mounted from `AppProviders`
- makes conflict handling explicit by treating register failures as the source of truth

Cons:

- still requires a small browser-safe package plus injected adapter so the user can see and change state in Settings
- requires config migration work in the existing host config module
- adds one more native support surface in the menu even though the full menu-polish row is separate

### Option B — Rust-owned shortcut registration plus pane-local adapter flow inside `hotkeysPane.tsx`

Keep Rust-owned shortcut registration, but let `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx` own the adapter reads and subscription lifecycle directly.

Pros:

- smaller apparent surface in `apps/web/src/providers/AppProviders.tsx`
- the hotkeys pane can fetch only when rendered

Cons:

- menu-driven disable/reset changes would not have a stable always-mounted subscriber
- pane open/close cycles would own native subscription churn and stale-snapshot recovery
- duplicates bridge bootstrapping in a Settings leaf instead of the app-level desktop-runtime boundary
- diverges from the accepted `AppProviders` desktop bridge pattern used by sibling rows

### Option C — Direct `global-hotkey` Rust crate integration without the Tauri plugin layer

Use the lower-level `global-hotkey` crate directly from the desktop host.

Pros:

- still native-first and browser-safe
- maximum control over registration details

Cons:

- duplicates lifecycle and integration concerns that the official Tauri plugin already solves
- raises review and maintenance cost with no clear Phase 2 product gain
- requires more bespoke event-loop plumbing on macOS

### Option D — Custom macOS Carbon/CGEvent-based shortcut registration

Implement shortcut registration directly against macOS APIs.

Pros:

- full macOS-specific control
- no additional crate/plugin dependency

Cons:

- highest native maintenance cost
- easiest path to subtle macOS regressions and permission edge cases
- least aligned with the repo’s current Tauri-first host architecture
- unnecessary for a single quick-open shortcut in Phase 2

## Recommendation

Choose Option A.

This row should use the official Tauri global-shortcut plugin, but only from the Rust host. The implementation rule is:

> Rust owns registration and trigger handling; `default.json` stays `main`-only; host config owns persistence; `AppProviders` mounts one browser-safe desktop bridge that exposes state and configuration to the existing settings UI.

That keeps native ownership where it belongs, avoids inventing a general shortcut platform, and stays inside the current desktop-host plus browser-safe-web pattern already used by sibling Phase 2 features.

## Recommended Architecture

### 1. Native host and capability boundary

Recommended Rust ownership:

- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/capabilities/default.json`
- `apps/desktop/src-tauri/src/lib.rs`
- new `apps/desktop/src-tauri/src/commands/global_hotkey.rs` (or equivalent dedicated module)
- `apps/desktop/src-tauri/src/commands/mod.rs`
- `apps/desktop/src-tauri/src/app_menu.rs`

Recommended responsibilities:

- initialize the official Tauri global-shortcut plugin during app startup
- keep the active shortcut registered only for the normal desktop app
- on trigger:
  - show the existing `main` window if hidden or minimized
  - focus the `main` window
  - if the process is still alive but `main` is absent, recreate the normal `main` window only from the current Phase 1 host contract
- never show, focus, or recreate overlay/grid/control windows
- expose narrow Tauri commands for settings-driven config reads/writes
- classify registration outcome into runtime states:
  - `ready`
  - `disabled`
  - `conflict`
  - `invalid_config`
  - `native_error`

Capability and permission rule:

- The only capability file this row may touch is `apps/desktop/src-tauri/capabilities/default.json`.
- Preserve `windows: ["main"]`; do not add `control`, `console`, `grid_*`, overlay, or any other window labels.
- Preserve existing Phase 1 permissions already attached to `default.json`:
  - `core:default`
  - `core:event:default`
  - `opener:default`
  - `notification:default`
- Do not add guest-facing global-shortcut permissions in this row. The selected design explicitly avoids:
  - `global-shortcut:allow-is-registered`
  - `global-shortcut:allow-register`
  - `global-shortcut:allow-register-all`
  - `global-shortcut:allow-unregister`
  - `global-shortcut:allow-unregister-all`
  because it does not expose `window.__TAURI__.globalShortcut` or `@tauri-apps/plugin-global-shortcut` to `apps/web`.
- Main-window-only scope is preserved in two layers:
  - capability file scope remains `windows: ["main"]`
  - Rust command handlers must still reject non-`main` callers via an explicit allowlist check, mirroring the existing statusbar pattern

Recommended v1 menu support:

- add minimal native recovery items only, not a full menu redesign
- preferred support actions:
  - `Help -> Disable Quick Open Shortcut`
  - `Help -> Reset Quick Open Shortcut to Default`

These keep recovery possible even when the shortcut cannot be registered.

### 2. Persistence boundary

Recommended owner:

- extend the existing host config in `apps/desktop/src-tauri/src/app_config.rs`

Recommended config evolution:

- migrate `schemaVersion` from `1` to `2`
- preserve the existing `window.main` contract untouched
- add only one new host-owned section:

```json
{
  "schemaVersion": 2,
  "updatedAt": "host-owned timestamp",
  "window": { "main": { "...": "existing shape" } },
  "quickOpen": {
    "presetId": "default",
    "accelerator": "CommandOrControl+Shift+Space",
    "enabled": true
  }
}
```

Recommended semantics:

- migrate v1 configs to v2 on first load
- persist only:
  - desired preset id
  - resolved accelerator string
  - enabled boolean
- do not persist transient runtime failure details
- on startup:
  - load the desired config
  - attempt registration if enabled
  - derive runtime state in memory from the attempt result

This satisfies persistence requirements without inventing a new storage architecture.

### 3. User-visible configuration boundary and lifecycle

Recommended owning slice:

- `packages/desktop-global-hotkey-quick-open/`

Recommended public surface:

- browser-safe `/web` entrypoint
- feature-owned runtime types and hooks
- an app-level bridge component mounted from `apps/web/src/providers/AppProviders.tsx`
- a small settings-facing component or hook consumed by the existing Settings hotkeys pane

Recommended adapter contract:

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

Recommended v1 configuration surface:

- extend `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx`
- keep the existing 10-row web shortcut table
- prepend a new desktop card/section that shows:
  - current quick-open shortcut label
  - runtime badge (`Ready`, `Disabled`, `Conflict`, `Error`)
  - curated preset selector
  - disable/reset action(s)
  - conflict/help text when registration failed

Recommended preset set:

- `default` → `CommandOrControl+Shift+Space`
- `alt-1` → `CommandOrControl+Shift+O`
- `alt-2` → `CommandOrControl+Option+O`
- `disabled` → no registration

This avoids building a general free-form shortcut recorder while still satisfying changed-state persistence.

Mount-point decision:

- Chosen: mount the feature bridge from `apps/web/src/providers/AppProviders.tsx`, alongside the existing desktop notification and statusbar bridges.
- Rejected: a pane-local adapter flow inside `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx`.

Why this mount is frozen:

- `AppProviders` is already the canonical desktop-runtime mount point in the web app.
- the bridge must remain subscribed even when the user closes Settings, because native Help-menu disable/reset actions must still push the latest snapshot into the next pane render
- `hotkeysPane.tsx` should stay a consumer of feature state, not the owner of native adapter bootstrapping

Lifecycle rule:

1. `AppProviders` mounts `<DesktopGlobalHotkeyQuickOpenBridge />` once for the app session
2. the bridge calls `getSnapshot()` on mount and stores the current snapshot in feature state
3. the bridge installs one `subscribe(handler)` listener for host-originated snapshot updates
4. `hotkeysPane.tsx` reads the feature state and calls `setPreference(...)`; it does not touch `window.__XAI_DESKTOP_GLOBAL_HOTKEY__` directly
5. native menu disable/reset and settings writes both route through the same Rust apply path
6. after any native change, Rust emits the next snapshot through the adapter subscription channel so the mounted bridge updates the pane state

### 4. Trigger and visibility flow

Recommended success path:

1. app starts
2. host config loads and migrates if needed
3. Rust registers the configured shortcut if enabled
4. settings UI reads a snapshot through the browser-safe adapter
5. user presses the shortcut
6. Rust shows/focuses the normal `main` window only

Recommended conflict path:

1. app starts or user changes the preset
2. Rust attempts to register the shortcut
3. registration fails because the combination is unavailable
4. runtime snapshot becomes `conflict`
5. settings card and native recovery actions remain available
6. user disables the shortcut or resets to the default preset

## Risks

- The exact macOS behavior when the app process remains alive but the `main` window label is absent needs real-hardware verification; recreate-vs-reveal logic must stay on the normal-window path only.
- Browser-safe settings integration must not leak `@tauri-apps/*` or `window.__TAURI__` into `apps/web/dist`.
- The curated preset set must avoid obvious macOS conflicts; manual smoke is still required even with native error classification.
- `desktop-statusbar-quick-actions` may later want the same main-window focus helper, but this row cannot assume that sibling feature ships first.

## Open Questions

1. Should the hotkey recreate `main` when the process is alive but the window was closed, or should it only reveal hidden/minimized windows?
   - Recommendation: recreate the normal `main` window if absent, using the same Phase 1 contract and persisted frame restore path.
2. Is a curated preset list acceptable for Phase 2, or does review require free-form shortcut capture?
   - Recommendation: curated presets only in v1; free-form recording is out of scope for this row and belongs to a later desktop-shortcut-management feature if needed.
