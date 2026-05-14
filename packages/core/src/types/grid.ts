/** Rectangle with position and dimensions */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A Smart Container (grid) on the desktop */
export interface GridBox {
  id: string;
  title: string;
  rect: Rect;
  isLocked: boolean;
  isFolded: boolean;
  viewMode: 'grid' | 'list';
  itemIds: string[];
  themeColor?: string;
}

/** A file, folder, or app item on the desktop */
export interface DesktopItem {
  id: string;
  filename: string;
  filepath: string;
  type: 'file' | 'folder' | 'app';
  icon: string;
  size?: number;
  createdAt: number;
}

/** The persisted layout shape stored in localStorage */
export interface PersistedLayout {
  grids: GridBox[];
  items: DesktopItem[];
}
