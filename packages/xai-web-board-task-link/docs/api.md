# API Contract - xai-web-board-task-link

## 1. Board Card Link Field

```ts
interface BoardCardTaskLink {
  source: "xai-web-tasks";
  taskId: string;
  createdAt: string;
}

interface BoardCard {
  taskLink?: BoardCardTaskLink;
}
```

Rules:

- optional field; missing means unlinked
- `taskId` points to a task in `xai_task_cols`
- unlink clears only `taskLink`

## 2. Tasks Board-Link Helpers

Public exports from `@repo/plugin-web-tasks`:

```ts
interface BoardTaskLinkSource {
  type: "board-card";
  boardId: string;
  listId: string;
  cardId: string;
}

interface BoardLinkedTaskInput extends BoardTaskLinkSource {
  title: { en: string; zh: string };
  dueDate?: string;
}

interface BoardLinkedTaskLookup {
  task: TaskCard;
  bucketId: BucketId;
  completed: boolean;
}

function loadTaskColsOrSeed(raw: unknown): TaskCol[];
function boardLinkedTaskId(input: Pick<BoardTaskLinkSource, "boardId" | "cardId">): string;
function taskCardFromBoardLink(input: BoardLinkedTaskInput): TaskCard;
function upsertBoardLinkedTask(
  cols: readonly TaskCol[],
  task: TaskCard,
  bucketId?: BucketId,
): TaskCol[];
function findBoardLinkedTask(
  cols: readonly TaskCol[],
  source: BoardTaskLinkSource,
): BoardLinkedTaskLookup | null;
function bucketIdForBoardDueDate(dueDate: string | undefined, now?: Date): BucketId;
```

## 3. Detail Modal Props

```ts
interface BoardCardTaskLinkStatus {
  taskId: string;
  label: string;
  missing: boolean;
}

interface BoardCardDetailModalProps {
  taskLinkStatus?: BoardCardTaskLinkStatus;
  onCreateLinkedTask?: () => void;
  onUnlinkTask?: () => void;
}
```

## 4. Status Semantics

Labels:

- Overdue
- Next 7 Days
- Later
- No Date
- Completed
- Missing task

Status is derived from persisted `xai_task_cols`. It does not read the
in-memory checkbox state inside a mounted Tasks page.
