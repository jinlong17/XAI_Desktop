# Step 1 – Transparent Canvas & AI Assistant

## Pointer Events: Click-Through Behavior
- Host shell (`src/App.tsx`) and background layer use `pointer-events: none` so desktop clicks pass through by default.
- Any interactive plugin surface must explicitly add `pointer-events: auto`. Place it inside the interactive layer (see `AiCube` and `SettingsPanel` for examples).
- Quick recipe for a new plugin surface:
  1. Render the plugin container inside `AppInner` (or via a plugin loader).
  2. Give the container a class or style with `pointer-events: auto; position: fixed|absolute;`.
  3. Keep surrounding wrappers `pointer-events: none` to preserve click-through elsewhere.

## Adding New Settings to the Panel
- Edit `src/components/Settings/SettingsPanel.tsx`.
- Find the comment `Plugin teams: inject plugin-specific controls below.` and insert your control(s) under it.
- Wire the control to shared state via `useSettings()` or to your plugin store. Keep console logging while debugging (matches the MVP traceability pattern).
- Keep glassmorphism styling consistent by reusing the existing `settings-row` and `settings-label` classes, or extend them if you need new UI patterns.
