import type { DesktopItem, GridBox, Rect } from './grid';

export interface DroppedFile {
  path: string;
  name: string;
  kind: 'file' | 'folder' | 'app' | 'alias' | 'unknown';
  size?: number;
  securityScope?: 'none' | 'bookmark-required' | 'bookmark-granted';
}

/** All event names → payload type mapping for type-safe cross-window communication */
export interface EventMap {
  // Organizer events
  'organizer:grid:ready': { gridId: string };
  'organizer:grid:state': { gridId: string; grid: GridBox; items: Record<string, DesktopItem> };
  'organizer:grid:update': { gridId: string; changes: Partial<GridBox> };
  'organizer:grid:close': { gridId: string };
  'organizer:grid:create-request': {
    gridId?: string;
    rect: Rect;
    source?: 'control' | 'shortcut';
  };
  'organizer:file:drop': { gridId: string; files: DroppedFile[] };

  // Global app events
  'app:interactive-mode-changed': { interactive: boolean };
  'app:settings-changed': { key: string; value: unknown };

  // Account / Sync events (local-bus signals; PRD §5.7 FR-SY-39 — NOT network messages)
  // plugin-account is the sole owner/emitter; other plugins listen only.
  'account:logged-in': { userId: string };
  'account:logged-out': { userId: string };
  'account:sync-started': { kind: 'push' | 'pull' };
  'account:sync-completed': { kind: 'push' | 'pull'; durationMs: number };
  'account:sync-failed': { kind: 'push' | 'pull'; error: string };

  // Console shell events
  'console:navigate-module': {
    moduleId: string;
    listId?: string;
    detailId?: string;
    source: 'sidebar' | 'command-palette' | 'shortcut' | 'restore';
  };
  'console:sidebar-toggled': {
    collapsed: boolean;
  };
  'console:search-opened': {
    query?: string;
    source: 'shortcut' | 'click' | 'programmatic';
  };
  'console:detail-selection-changed': {
    moduleId: string;
    selection: Record<string, string | number | boolean | null>;
  };
  'console:reconcile-requested': {
    moduleId: string;
    reason?: string;
    revisionHint?: number;
  };
  'console:ack-applied': {
    moduleId: string;
    revision: number;
    acknowledgedAt: string;
  };
}
