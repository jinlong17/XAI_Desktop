import { memo } from "react";
import {
  DesktopItem,
  GridBox,
  SmartContainer,
  useGridSystem,
} from "@repo/plugin-organizer";

function OrganizerContent() {
  const { grids, items, updateGrid, deleteGrid, toggleFold, toggleLock, createGrid } =
    useGridSystem();
  const { gridOpacity, gridBlur } = useSettings();

  const resolveItems = (grid: GridBox): DesktopItem[] =>
    grid.itemIds.map((id) => items[id]).filter(Boolean);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {grids.map((grid) => (
        <SmartContainer
          key={grid.id}
          data={grid}
          items={resolveItems(grid)}
          onUpdate={updateGrid}
          onClose={deleteGrid}
          onToggleFold={toggleFold}
          onToggleLock={toggleLock}
          onFocus={() => {}}
          gridOpacity={gridOpacity}
          gridBlur={gridBlur}
        />
      ))}
      {grids.length === 0 && (
        <div style={{ position: "absolute", top: 12, left: 12, pointerEvents: "auto" }}>
          <button
            type="button"
            onClick={() => createGrid(64, 120)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(15,23,42,0.6)",
              color: "#e7ecf3",
              cursor: "pointer",
            }}
          >
            + New Grid
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * OrganizerLayer renders multiple SmartContainers on the host interactive layer.
 * It stays isolated so other plugins (Sticky Notes, Four Quadrants) remain unaffected.
 */
export const OrganizerLayer = memo(function OrganizerLayer() {
  return (
    <OrganizerContent />
  );
});

export default OrganizerLayer;
import { useSettings } from "../context/SettingsContext";
