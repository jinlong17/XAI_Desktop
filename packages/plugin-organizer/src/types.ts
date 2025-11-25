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

export type DesktopItemType = "file" | "folder" | "app";

export interface DesktopItem {
  id: string;
  filename: string;
  filepath: string;
  type: DesktopItemType;
  icon: string;
  size?: number;
  createdAt: number;
}

export interface PersistedLayout {
  grids: GridBox[];
  items: DesktopItem[];
}
