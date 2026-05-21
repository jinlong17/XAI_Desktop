export interface GridBox {
  id: string;
  title: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isLocked: boolean;
  isFolded: boolean;
  viewMode: "grid" | "list";
  itemIds: string[];
  themeColor?: string;
}

export type DesktopItemType = "file" | "folder" | "app" | "url";

export type FinderTagColor = "gray" | "green" | "purple" | "blue" | "yellow" | "red" | "orange";

export interface FinderTag {
  name: string;
  color?: FinderTagColor;
}

export interface DesktopItem {
  id: string;
  filename: string;
  filepath: string;
  type: DesktopItemType;
  icon: string;
  size?: number;
  createdAt: number;
  finderTags?: FinderTag[];
  /**
   * Populated when `type === "url"`. Behaviour-preserving widening from
   * the original file/folder/app union — code that only reads `type`
   * keeps working, but URL payloads now round-trip through the
   * Repository v0 GridItemEntity.url shape (see G3-E1).
   */
  url?: {
    href: string;
    title?: string;
    description?: string;
    favicon?: string;
  };
}

export interface PersistedLayout {
  grids: GridBox[];
  items: DesktopItem[];
}
