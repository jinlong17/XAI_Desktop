# plugin-widgets Design

The widget host owns layout, density, visibility, and personalization. Individual plugins register `WidgetDefinition` values through a manifest-like object so the host can render a type without importing plugin internals.

State is intentionally device-local for this scaffold. The hook uses localStorage for browser persistence and an in-memory repo-compatible adapter for the same async shape as future data drivers.

Wallpaper contrast is mocked through a user preference. A future Tauri command should expose wallpaper tone or sampled colors.
