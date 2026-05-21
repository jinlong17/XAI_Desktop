# plugin-console — API / Contract Notes

## Runtime Surface

This feature is expected to add or revise contracts in four places:

1. `@repo/core`
   - shared `ConsoleView` contract family
   - PluginRegistry slot accessors for Console shell consumption
   - typed `console:*` event definitions
   - manifest typings for `windows.console` and `ui.consoleSidebar`
2. `plugin-console`
   - shell host component(s) and registration entrypoint only
   - no direct business-domain types beyond shell-local state
3. `plugin-productivity` / `plugin-labels`
   - future `ConsoleView` exports plus optional search/settings/notification slot contributors
   - real integration is gated until each plugin has a canonical row in `docs/PLUGIN_MAP.md`
4. Desktop host / Tauri
   - console route registration and native console window lifecycle commands

## Upstream And Downstream Interfaces

| Interface | Direction | Planned contract |
|---|---|---|
| `PluginManifest.windows.console` | upstream into registry/host | Enables console-capable plugin registration |
| `PluginManifest.ui.consoleSidebar` | upstream into shell | Declares sidebar presence, order, icon, placeholder/disabled state |
| `ConsoleViewRegistration` | upstream from business plugins | Binds `moduleId` to `ConsoleView` component plus optional shell contributions |
| `ConsoleViewProps` | downstream from shell into business views | Frozen prop bag for route, selection, theme, query, and host capabilities |
| `console:*` typed events | bidirectional cross-window | Shell navigation, search/open state, selection changes, reconcile/ack notifications |
| Tauri `open/close/focus/get/set_console_window_frame` | host-only downstream | Native console window lifecycle and frame persistence |

Dependency authority note:

- The existence of `packages/plugin-productivity/` and `packages/plugin-labels/` is not sufficient authority for real ConsoleView integration.
- Until those plugins are registered in `docs/PLUGIN_MAP.md`, the only allowed Phase 2 contract is mocked `ConsoleViewRegistration` data owned by `plugin-console` tests/story fixtures.

## Key Contract Shapes

### `ConsoleViewProps`

Minimum fields expected in the frozen contract:

- `moduleId`: stable module identifier such as `tasks`, `pomodoro`, `habits`, `matrix`, `labels`
- `route`: serializable nav/list/detail state used for restore and deep-linking
- `selection`: serializable current entity selection for detail-pane rendering
- `query`: active shell search/filter text when applicable
- `theme`: resolved theme, density, and font-scale tokens
- `capabilities`: host actions for navigate, open command palette, focus panes, persist shell state, and request reconcile

### `ConsoleSidebarEntry`

Expected fields:

- `id`
- `label`
- `icon`
- `order`
- `group`
- `enabled`
- `placeholder`
- `moduleId`

### `ConsoleWindowFrame`

Expected persisted/native fields:

- `x`
- `y`
- `width`
- `height`
- `isFullscreen`
- `navStateVersion`

## Planned Typed Events

The discovery recommendation assumes new entries under `packages/core/src/types/events.ts` for at least:

- `console:navigate-module`
- `console:sidebar-toggled`
- `console:search-opened`
- `console:detail-selection-changed`
- `console:reconcile-requested`
- `console:ack-applied`

The shell also listens to existing business/global events rather than importing plugin internals directly:

- `productivity:*` task/pomodoro/habit events
- `labels:*` entity change events once stabilized
- `account:sync-*` sync status events

## Error Semantics

- Missing `ConsoleView` registration for an enabled console module must degrade to a shell-owned placeholder/error state, not crash the window.
- Search providers must hard-timeout at 200ms and return partial results; timeout is recoverable and should be visible in shell diagnostics/telemetry only.
- Reconcile/ack flows are revision-based and must be idempotent; duplicate ack or older revision events are no-ops.
- Native window commands should continue the repo's structured Tauri command-error pattern; no HTTP-style envelopes are introduced.

## Permission / Idempotency Notes

- Only host windows may invoke native console window commands.
- Plugin packages must not import `@tauri-apps/api`; all native capability access stays behind core hooks or host adapters.
- `plugin-console` must remain platform-neutral so the same shell code can later back the Web console host.
- Re-opening/focusing an existing Console window should be idempotent and restore the last persisted frame/nav state rather than spawning duplicates.
- Mock retirement is policy-gated: replacing mocked productivity/labels registrations with real plugin exports requires `docs/PLUGIN_MAP.md` reconciliation first, not just package-level code readiness.
