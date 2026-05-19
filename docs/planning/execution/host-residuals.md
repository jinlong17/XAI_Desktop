# Host Business Residuals — G1.6 Audit

| Field | Value |
|---|---|
| Gate | G1 |
| Source | docs/planning/execution/G1-native-foundation.md §G1.6 |
| Date | 2026-05-19 |
| Status | Audit complete; production cleanup pending G0/G1 implementation gates |

## Summary

This audit identifies business-facing logic still living in `apps/desktop/src/`. It does not move code. The purpose is to give G1 implementation a precise cleanup list while preserving the current host behavior until G0 window decisions are reviewed.

## Residual Inventory

| Area | Current file(s) | Why it is residual business logic | Target owner | Recommended action |
|---|---|---|---|---|
| AI Cube controller | `apps/desktop/src/components/AiAssistant/AiCube.tsx`, `apps/desktop/src/windows/ControlWindow.tsx` | Product-specific control UI and panel behavior live in Host. | future `plugin-ai-cube` or control-shell plugin slot | Keep as temporary shell until G6/G7; migrate public component/hook surface out of Host. |
| Settings panel | `apps/desktop/src/components/Settings/SettingsPanel.tsx`, `apps/desktop/src/context/SettingsContext.tsx` | Settings include AI icon styling and Grid visual settings, which are plugin/product preferences. | future `plugin-settings` plus organizer public settings adapter | Split host-level window settings from plugin settings; expose plugin slot instead of hard-coded controls. |
| Grid creation button | `SettingsPanel.tsx`, `ControlWindow.tsx`, `OrganizerLayer` event listener | `+ New Grid` is Organizer business action routed through Host-specific controls. | `plugin-organizer` public action or control slot | Move action registration into plugin slot registry after G1 shell/content split. |
| Sync menu-bar state bridge | `apps/desktop/src/sync/useSyncMenuBarStatus.ts`, `apps/desktop/src/App.tsx` | Account/sync lifecycle events drive product-specific tray status in Host. | `plugin-account` public event adapter + Host tray capability adapter | Keep only capability adapter in Host; move lifecycle interpretation to plugin-account when account plugin stabilizes. |
| Global DnD provider | `apps/desktop/src/providers/DndProvider.tsx`, `apps/desktop/src/App.tsx` | Uses Organizer grid/item state directly from Host provider. | `plugin-organizer` or core DnD shell adapter | During G1.2, move Organizer-specific DnD business into plugin-organizer public component/hook. |
| Main overlay status label | `apps/desktop/src/App.tsx` | Product/debug text is embedded in Host shell. | dev-only diagnostic component or plugin debug slot | Remove or guard as dev-only after G1 window lifecycle stabilizes. |
| G0 prototype fallback | `apps/desktop/src/windows/GridWindow.tsx` | Spike UI shows Grid metadata and event button in Host window. | temporary G0 evidence only | Remove or guard after G0/G1 runtime validation. |

## Non-Residual Host Responsibilities

- Hash routing in `main.tsx`.
- Static plugin registration calls in `main.tsx`.
- Window root components (`GridWindow`, `ControlWindow`) as shells.
- Global providers that are not business-specific after split.
- Tauri command registration and capability adapters on the Rust side.

## Cleanup Sequencing

1. Finish G0 evidence and decide Go/Conditional Go/fallback.
2. Implement G1.1 window command contract.
3. Implement G1.2 Grid shell/content split.
4. Move Organizer-specific DnD and Grid controls behind `plugin-organizer` public exports.
5. Keep AI Cube, Settings, and Sync tray bridges as explicitly temporary until their later Gate owners exist.

## Constraints

- No Host cleanup should be bundled with native window command changes.
- No production Host migration should depend on unreviewed G0 evidence.
- Host must not gain new business state while these residuals are pending.

