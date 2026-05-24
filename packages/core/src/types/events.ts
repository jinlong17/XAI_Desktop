import type { DesktopItem, GridBox, Rect } from './grid';

// ── Web event supporting types ──────────────────────────────────────────────

/** All navigable module ids in the Web SPA. */
export type WebModuleId =
  | 'tasks' | 'habits' | 'pomodoro' | 'calendar' | 'matrix'
  | 'countdown' | 'settings' | 'board' | 'dashboard' | 'meditation'
  | 'statistics' | 'ai' | 'search';

/** Discriminated key for all user-configurable preferences. */
export type WebPreferenceKey =
  | 'theme' | 'density' | 'fontScale' | 'accentHue'
  | 'railPos' | 'bgTone' | 'lang';

/**
 * Discriminated union: narrowing on `key` gives a concrete `value` type.
 * Use `WebPreferenceChange` as the payload for `web:settings:preference-changed`.
 */
export type WebPreferenceChange =
  | { key: 'theme'; value: 'light' | 'dark' | 'system' }
  | { key: 'density'; value: 'comfortable' | 'compact' }
  | { key: 'fontScale'; value: number }
  | { key: 'accentHue'; value: number }
  | { key: 'railPos'; value: 'left' | 'right' | 'top' | 'bottom' }
  | { key: 'bgTone'; value: 'default' | 'sage' | 'cream' | 'mist' | 'lavender' | 'peach' | 'graphite' }
  | { key: 'lang'; value: 'en' | 'zh' };

export interface DroppedFile {
  path: string;
  name: string;
  kind: 'file' | 'folder' | 'app' | 'alias' | 'unknown';
  size?: number;
  securityScope?: 'none' | 'bookmark-required' | 'bookmark-granted';
}

/** Eisenhower quadrant id used by web:matrix:* channels. */
export type WebMatrixQuadrant = 'q1' | 'q2' | 'q3' | 'q4';

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

  // Web shell navigation + deep-links + pet toggle (owner: xai-web-shell row #5)
  'web:shell:module-change': {
    /** Target module id (e.g. "tasks" | "calendar" | "dashboard" | "settings"). */
    moduleId: WebModuleId;
    /** Optional deep-link payload — e.g. MiniCal → Calendar focus date in "YYYY-MM-DD". */
    focusDate?: string;
    /** Optional detail entity id (e.g. board card id, task id) — module-specific opaque string. */
    detailId?: string;
    /** What triggered the change. */
    source: 'app-rail' | 'mini-cal' | 'shortcut' | 'restore' | 'programmatic';
  };
  'web:shell:pet-toggle': {
    /** New on/off state after the toggle. */
    on: boolean;
    /** Where the toggle originated. */
    source: 'rail-bottom' | 'settings' | 'shortcut';
  };

  // Settings live-broadcast (owner: xai-web-settings-appearance row #22)
  'web:settings:preference-changed': WebPreferenceChange & {
    /** ISO timestamp of when the change was committed. */
    changedAt: string;
  };

  // Dashboard add-widget click (owner: xai-web-dashboard-grid row #10) — declaration only; row #11 may consume
  'web:dashboard:add-widget-clicked': {
    /** Where the click originated. */
    source: 'add-widget-button' | 'empty-state-cta';
  };

  // Pomodoro session completion (owner: xai-web-pomodoro row #14) — declaration only in W1
  'web:pomodoro:session-finished': {
    /** Mode that just finished. */
    mode: 'focus' | 'short-break' | 'long-break';
    /** Duration in ms of the just-finished session. */
    durationMs: number;
    /** ISO timestamp at completion. */
    finishedAt: string;
  };

  // Habits check-in (owner: xai-web-habits row #15) — declaration only in W1
  'web:habits:checkin-recorded': {
    /** Habit id whose check-in was just recorded. */
    habitId: string;
    /** UTC day key the check-in applied to (YYYY-MM-DD). */
    date: string;
    /** Post-checkIn streak value. */
    streak: number;
    /** ISO timestamp at check-in. */
    recordedAt: string;
  };

  // Matrix priority-tagged (owner: xai-web-matrix row #13) — declaration only in W2
  'web:matrix:priority-tagged': {
    /** Card id whose quadrant just changed. */
    cardId: string;
    /** Source quadrant; null is reserved (v1 never emits null). */
    from: WebMatrixQuadrant | null;
    /** Destination quadrant. */
    to: WebMatrixQuadrant;
    /** ISO timestamp at the moment of the drag-end / kbd-move commit. */
    taggedAt: string;
  };

  // Project events (emit-side owner: plugin-project)
  'project:card-created': {
    /** Newly created card id (createId("card") result). */
    id: string;
    /** List the card was placed in at creation time. */
    listId: string;
    /** Trimmed, non-empty title (post-validation). */
    title: string;
    /** Position within the list at insert time (== sibling count before insertion). */
    order: number;
    /** Owning entity type — always 'project.card' (constant). */
    entityType: 'project.card';
    /** Version at create — always 1. */
    version: number;
    /** ISO timestamp matching Card.createdAt. */
    createdAt: string;
  };
  'project:card-moved': {
    /** Moved card id. */
    id: string;
    /** Pre-move list id (captured before re-normalization). */
    fromListId: string;
    /** Post-move list id (argument passed to moveCard). */
    toListId: string;
    /** Pre-move order within the source list. */
    fromOrder: number;
    /** Clamped order in the target list (Math.min(Math.max(order, 0), targetList.length)). */
    toOrder: number;
    /** Bumped version: target.version + 1 (same value written to the dirty row). */
    version: number;
    /** ISO movedAt timestamp (same value the store writes to all dirty rows). */
    updatedAt: string;
  };
  'project:card-updated': {
    /** Updated card id. */
    id: string;
    /** Post-merge listId (from the saved Card.listId). */
    listId: string;
    /**
     * Sorted, deduplicated subset of Object.keys(patch) filtered to the
     * allow-list: ["checklist", "description", "dueDate", "labels", "listId", "order", "title"].
     * Keys outside the allow-list (id, entityType, schemaVersion, syncScope,
     * createdAt, updatedAt, version, deletedAt) are excluded.
     */
    patchKeys: string[];
    /** Bumped version: current.version + 1. */
    version: number;
    /** ISO timestamp matching Card.updatedAt. */
    updatedAt: string;
  };

  // Settings — Account delete confirm (owner: xai-web-settings-rest row #24)
  // Declaration-only: no consumer ships in this row.
  // Pattern precedent: web:pomodoro:session-finished (row #14), web:habits:checkin-recorded (row #15).
  'web:settings:rest:account-delete-confirmed': {
    /** ISO timestamp of when the user clicked confirm. */
    confirmedAt: string;
  };
}
