# plugin-ai-cube API

## Public Surface

F2 adds a desktop-integration surface on top of the existing mock conversation scaffold.

### Existing exports kept

- `AiCubePanel`
- `useAiConversation`
- `useCostGuard`
- `redactSecrets`
- `PrivacyGateDialog`
- `CostGuard`
- conversation / privacy / repo types

### Implemented F2 exports

- `registerAiCubePlugin(): void`
- `AiCubeControlProvider`
- `AiCubeControlWidget` zero-props `ControlWidget` entry consumed through `PluginRegistry`
- `AiCubeControlBridge` / `AiCubeTrayActions` adapter types for Host injection

## Host → Plugin Contract

`plugin-ai-cube` must not import Host context directly. Instead, Host injects a provider with three adapter groups:

### 1. Shell state / window interaction

Required capabilities:

- current expanded/collapsed state
- request open/close callback
- drag/click handoff signals needed by the control surface
- window drag handoff callback (`startWindowDrag`)

Semantics:

- plugin UI can request state changes, but native window resize / focus handling remains Host-owned.
- missing provider is a programmer error and should fail loudly in development.

### 2. Appearance settings bridge

Required fields:

- Cube appearance values and setters
- Grid appearance values and setters
- any section labels or capability flags needed to render settings sections cleanly

Semantics:

- values come from Host-owned state for now
- plugin treats them as adapter inputs only; persistence/location is not part of F2

### 3. Phase 0–3 tray actions

Required actions:

- `createGrid`
- `clearAllGrids`
- `openClipboard`
- `openPomodoro`
- `openSettings`
- `openSearch`

Semantics:

- `createGrid` / `clearAllGrids` are live Host bridges
- `openClipboard` / `openPomodoro` / `openSearch` may be placeholder or disabled adapters until their owning plugins become stable
- action failures should surface as non-crashing UI state, not unhandled exceptions

## Plugin Registration Contract

### `registerAiCubePlugin(): void`

- statically called from `apps/desktop/src/main.tsx` above `createRoot`
- internally calls `PluginRegistry.register(aiCubeManifest, { ControlWidget: AiCubeControlWidget })`
- must be idempotent like `registerAccountPlugin()`
- registration logic contains no business side effects beyond structural registration

### Manifest alignment

- `packages/plugin-ai-cube/manifest.json` remains the on-disk truth
- build must keep code registration aligned with:
  - `name`
  - `windows.control`
  - `events.emit` / `listen`
  - enabled/status expectations

## Conversation / Preview Contract

- F2 does not expose a real send-to-LLM API
- any visible conversation surface must render in preview mode
- if input remains visible, submit/send in Phase 0–3 must be disabled or intentionally no-op with explicit preview messaging
- `window.dispatchEvent("ai-cube:mock-action")` is legacy scaffold behavior and should not become the long-term desktop integration contract

## Upstream / Downstream Interfaces

### Upstream

- `@repo/ui/tokens` / `@repo/ui/icons`
- `@repo/core/registry`
- existing `@repo/core/events` types only; no EventMap expansion is planned in F2
- existing repo-provider surface in `plugin-ai-cube`

### Downstream

- `apps/desktop/src/main.tsx` static registration
- `apps/desktop/src/windows/ControlWindow.tsx` shell/provider composition
- real macOS manual verification script for click vs drag

## Error Semantics

- missing control provider: invariant error in development
- disabled preview send: explicit disabled state or preview notice, not silent pretend-success
- unavailable placeholder actions: explicit disabled or "coming soon" state, not thrown errors
- organizer create/clear bridge failures: log/report through Host callback boundary and keep UI recoverable

## Permission / Idempotency

- no new Tauri command permissions
- plugin UI must not call Tauri command/invoke APIs directly for control-window business actions
- `registerAiCubePlugin()` is idempotent
- repeated open/close requests must be safe and deterministic
