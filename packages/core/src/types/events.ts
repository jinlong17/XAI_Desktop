import type { GridBox, Rect } from './grid';

/** All event names → payload type mapping for type-safe cross-window communication */
export interface EventMap {
  // Organizer events
  'organizer:grid-update': { gridId: string; changes: Partial<GridBox> };
  'organizer:grid-close': { gridId: string };
  'organizer:file-drop': { gridId: string; files: string[] };
  'organizer:grid-window-ready': { gridId: string };
  'organizer:create-grid-request': { rect: Rect };

  // Global app events
  'app:interactive-mode-changed': { interactive: boolean };
  'app:settings-changed': { key: string; value: unknown };
}
