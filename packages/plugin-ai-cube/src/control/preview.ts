export const PREVIEW_STATUS_TEXT = "Phase 0-3 preview only - live AI is disabled until Phase 4.";

export const PREVIEW_TRANSCRIPT = [
  "Suggested cleanup queued. This is a preview transcript, not a live model response.",
  "You can tune Cube appearance and trigger organizer shortcuts from this shell.",
];

export type AiCubeActionId =
  | "create-grid"
  | "clear-grids"
  | "clipboard"
  | "pomodoro"
  | "search"
  | "settings";

export interface AiCubeActionDescriptor {
  id: AiCubeActionId;
  label: string;
  icon: "grid" | "list" | "file" | "task" | "folder" | "settings";
  enabled: boolean;
  note?: string;
}

export const PREVIEW_ACTIONS: AiCubeActionDescriptor[] = [
  { id: "create-grid", label: "Create Grid", icon: "grid", enabled: true },
  { id: "clear-grids", label: "Clear Grids", icon: "list", enabled: true },
  { id: "clipboard", label: "Clipboard", icon: "file", enabled: false, note: "Coming soon" },
  { id: "pomodoro", label: "Pomodoro", icon: "task", enabled: false, note: "Coming soon" },
  { id: "search", label: "Console", icon: "folder", enabled: true },
  { id: "settings", label: "Settings", icon: "settings", enabled: true },
];

export function isPreviewActionEnabled(id: AiCubeActionId): boolean {
  return PREVIEW_ACTIONS.find((action) => action.id === id)?.enabled ?? false;
}
