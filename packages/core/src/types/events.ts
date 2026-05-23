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

  // Productivity events (emit-side owner: plugin-productivity)
  'productivity:pomodoro-completed': {
    /** The mode that just finished (focus | short-break | long-break). */
    mode: 'focus' | 'short-break' | 'long-break';
    /** Total focus cycles completed after the just-finished session (unchanged for break modes). */
    cyclesCompleted: number;
    /** Todo linked to the just-finished focus session; null for breaks or no-link focus. */
    linkedTodoId: string | null;
    /** ISO timestamp of completion (same value the store writes to lastCompletedAt). */
    completedAt: string;
    /** Configured duration of the just-finished session, in milliseconds. */
    durationMs: number;
  };
  'productivity:todo-due': {
    /** Todo whose dueDate boundary just crossed past now. */
    todoId: string;
    /** Snapshot of title at emit time (for downstream notifications). */
    title: string;
    /** Source dueDate value (YYYY-MM-DD). */
    dueDate: string;
    /** Eisenhower quadrant at emit time. */
    quadrant: 'do' | 'schedule' | 'delegate' | 'eliminate';
    /** ISO timestamp of the local-end-of-day boundary that was crossed. */
    dueBoundaryAt: string;
  };
  'productivity:habit-reminder': {
    /** Habit that just transitioned to completed-for-today (checkIn success). */
    habitId: string;
    /** Snapshot of name at emit time. */
    name: string;
    frequency: 'daily' | 'weekdays' | 'weekly';
    /** UTC day key the check-in applied to (YYYY-MM-DD). */
    date: string;
    /** Post-checkIn streak value. */
    streak: number;
    /** ISO timestamp of the check-in. */
    completedAt: string;
  };

  // Labels events (emit-side owner: plugin-labels)
  'labels:created': {
    /** Newly created label id. */
    id: string;
    /** Display name at create time (trimmed). */
    name: string;
    /** Hex color string assigned (caller-provided or fallback). */
    color: string;
    /** Optional icon glyph identifier if provided by caller. */
    icon?: string;
    /** Owning entity type — always 'labels.label' (constant). */
    entityType: 'labels.label';
    /** Version at create — always 1. */
    version: number;
    /** ISO timestamp the store stamped at creation (matches Label.createdAt). */
    createdAt: string;
  };
  'labels:updated': {
    /** Updated label id. */
    id: string;
    /** Post-update display name (trimmed). */
    name: string;
    /** Post-update hex color. */
    color: string;
    /** Post-update optional icon glyph identifier. */
    icon?: string;
    /** Bumped version (current.version + 1). */
    version: number;
    /** ISO timestamp the store stamped at update (matches Label.updatedAt). */
    updatedAt: string;
  };
  'labels:deleted': {
    /** Deleted label id. */
    id: string;
    /** Version at delete time — the live version just before deletion. */
    version: number;
    /** ISO timestamp the store sampled at delete time. Event timestamp, not a tombstone query. */
    deletedAt: string;
  };
}
