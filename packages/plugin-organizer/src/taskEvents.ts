import { emitEvent, useEventListener } from "@repo/core/events";

export const ORGANIZER_GRID_CREATE_TASK_EVENT = "organizer:grid:create-task";

export interface OrganizerGridCreateTaskPayload {
  gridItemId: string;
  title: string;
  path?: string;
}

type EmitGridTask = (
  event: typeof ORGANIZER_GRID_CREATE_TASK_EVENT,
  payload: OrganizerGridCreateTaskPayload,
) => Promise<void>;

type ListenGridTask = (
  event: typeof ORGANIZER_GRID_CREATE_TASK_EVENT,
  handler: (payload: OrganizerGridCreateTaskPayload) => void,
) => void;

export function emitOrganizerGridCreateTask(payload: OrganizerGridCreateTaskPayload): Promise<void> {
  return (emitEvent as unknown as EmitGridTask)(ORGANIZER_GRID_CREATE_TASK_EVENT, payload);
}

export function useOrganizerGridCreateTaskEvent(
  handler: (payload: OrganizerGridCreateTaskPayload) => void,
): void {
  (useEventListener as unknown as ListenGridTask)(ORGANIZER_GRID_CREATE_TASK_EVENT, handler);
}
