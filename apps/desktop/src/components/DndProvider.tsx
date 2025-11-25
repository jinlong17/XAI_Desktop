import { PropsWithChildren } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import { useGridSystem } from "@repo/plugin-organizer";
import { DesktopItem } from "@repo/plugin-organizer";

export function GlobalDndProvider({ children }: PropsWithChildren) {
  const { grids, items, moveItem } = useGridSystem();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeItem: DesktopItem | null = activeId ? items[activeId] ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    const itemId = event.active.id.toString();
    setActiveId(itemId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const itemId = event.active.id.toString();
    const overId = event.over?.id?.toString();

    if (itemId && overId) {
      const sourceGrid = grids.find((g) => g.itemIds.includes(itemId));
      if (sourceGrid && sourceGrid.id !== overId) {
        moveItem(itemId, sourceGrid.id, overId);
      }
    }
    setActiveId(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div
            style={{
              pointerEvents: "none",
              padding: "8px 10px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            {activeItem.filename}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default GlobalDndProvider;
