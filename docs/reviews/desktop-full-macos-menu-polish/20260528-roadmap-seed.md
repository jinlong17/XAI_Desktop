# Roadmap Seed - desktop-full-macos-menu-polish

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase2
> Branch: dev

## Requirement

Upgrade the basic shipped menu into a fuller File/Edit/View/Window/Help macOS menu with standard app actions, window actions, diagnostics/help entries, and correct disabled states.

## Hard constraints

- Build on `desktop-basic-macos-menu-config-store`; do not rewrite its shipped contract unless an explicit defect is found.
- Keep native menu wiring in the Tauri shell and keep business actions routed through stable app/plugin boundaries.
- Do not add status bar, notifications, hotkeys, or updater scope beyond small integration points needed for menu state.

## Acceptance signal

The menu presents expected macOS sections and disabled states, routes support/config/window actions correctly, and has automated or manual smoke evidence for the critical menu commands.

## Dependencies (advisory - manifest is authoritative)

Precondition: `desktop-basic-macos-menu-config-store` SHIPPED.
