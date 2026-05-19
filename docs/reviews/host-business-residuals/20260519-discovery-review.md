# Discovery Review — host-business-residuals

## Summary

The Host currently contains several business-facing surfaces: AI Cube, Settings panel, Organizer Grid creation control, sync tray bridge, and Organizer-specific global DnD provider. G1.6 asks for a residual list so G1 can prevent new Host business state and sequence cleanup.

## Recommendation

Treat this feature as an audit-only slice and mark it READY_TO_SHIP when the inventory is complete. Production cleanup should happen later in G1.2/G1.6 after G0 decisions and the window command contract are stable.

## Evidence

Search command:

```bash
rg -n "AiCube|SettingsPanel|useSyncMenuBarStatus|OrganizerLayer|create-grid-request|useGridSystem" apps/desktop/src -g '*.{ts,tsx}'
```

Primary residual files:
- `apps/desktop/src/components/AiAssistant/AiCube.tsx`
- `apps/desktop/src/components/Settings/SettingsPanel.tsx`
- `apps/desktop/src/context/SettingsContext.tsx`
- `apps/desktop/src/providers/DndProvider.tsx`
- `apps/desktop/src/sync/useSyncMenuBarStatus.ts`
- `apps/desktop/src/windows/ControlWindow.tsx`
- `apps/desktop/src/windows/GridWindow.tsx`
- `apps/desktop/src/App.tsx`

