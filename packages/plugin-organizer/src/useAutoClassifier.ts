import type { GridEntity, GridItemEntity } from "@repo/core-data";
import { classifyGridItem, defaultClassificationRules } from "./autoClassify";
import type { DesktopItem, GridBox } from "./types";

function toGridEntity(grid: GridBox): GridEntity {
  const timestamp = new Date().toISOString();
  return {
    id: grid.id,
    entityType: "organizer.grid",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    title: grid.title,
    rect: grid.rect,
    isLocked: grid.isLocked,
    isFolded: grid.isFolded,
    viewMode: grid.viewMode,
    itemIds: grid.itemIds,
    themeColor: grid.themeColor,
  };
}

function toGridItemEntity(item: DesktopItem, gridId: string): GridItemEntity {
  const timestamp = new Date(item.createdAt).toISOString();
  return {
    id: item.id,
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    gridId,
    filename: item.filename,
    filepath: item.filepath,
    kind: item.type,
    icon: item.icon,
    size: item.size,
    url: item.url,
  };
}

export function useAutoClassifier() {
  const rules = defaultClassificationRules();

  return {
    classify(item: DesktopItem, grids: GridBox[], fallbackGridId?: string): string | null {
      const gridEntities = grids.map(toGridEntity);
      const candidateGridId = fallbackGridId ?? grids[0]?.id;
      if (!candidateGridId) return null;
      const result = classifyGridItem(rules, {
        item: toGridItemEntity(item, candidateGridId),
        grids: gridEntities,
      });
      return result?.gridId ?? candidateGridId;
    },
  };
}
