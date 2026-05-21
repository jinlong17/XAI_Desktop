import { useEventListener } from "@repo/core/events";
import type { TodoDraft } from "../types";

const ORGANIZER_GRID_CREATE_TASK_EVENT = "organizer:grid:create-task";

interface OrganizerGridCreateTaskPayload {
  gridItemId: string;
  title: string;
  path?: string;
}

type ListenGridTask = (
  event: typeof ORGANIZER_GRID_CREATE_TASK_EVENT,
  handler: (payload: OrganizerGridCreateTaskPayload) => void,
) => void;

export function useOrganizerGridTaskListener(createTodo: (input: TodoDraft) => Promise<unknown>): void {
  (useEventListener as unknown as ListenGridTask)(ORGANIZER_GRID_CREATE_TASK_EVENT, (payload) => {
    void createTodo({
      title: payload.title,
      description: payload.path ? `Created from Organizer Grid item ${payload.gridItemId}: ${payload.path}` : `Created from Organizer Grid item ${payload.gridItemId}`,
      labels: [],
    });
  });
}
