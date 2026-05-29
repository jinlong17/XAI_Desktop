import {
  createTauriRepo,
  NOTES_UNSUPPORTED_ERROR,
  type CardEntity,
  type DesktopBridgeError,
  type DesktopBridgeWriteResult,
  type HabitEntity,
  type PetStateEntity,
  type PomodoroSessionsEntity,
  type ProjectEntity,
  type ProjectWorkspaceStateEntity,
  type Repo,
  type RepoRecord,
  type SettingsPrefEntity,
  type TodoEntity,
} from "@repo/core-data";

type BridgedValue = unknown;

export const DESKTOP_REPO_NAMESPACE = "xai-web-desktop-local-first-bridge";

export const TASKS_STORAGE_KEY = "xai_task_cols" as const;
export const HABITS_STORAGE_KEY = "xai_habits_state" as const;
export const POMODORO_STORAGE_KEY = "xai_pomodoro_sessions" as const;
export const BOARDS_STORAGE_KEY = "xai_boards_v2" as const;

export const BOARD_AUX_KEYS = new Set([
  "xai_active_board",
  "xai_board_panels",
  "xai_board_inbox",
  "xai_board_view_by_id",
]);

export const PET_KEYS = new Set(["xai_pet_id", "xai_pet_pos"]);

const TASK_BUCKET_IDS = ["overdue", "next7", "later", "nodate"] as const;

const TASK_ENTITY_PREFIX = "task:";
const HABIT_ENTITY_PREFIX = "habit:";
const BOARD_ENTITY_PREFIX = "board:";
const CARD_ENTITY_PREFIX = "card:";

export type BridgedSurface =
  | "tasks"
  | "habits"
  | "pomodoro"
  | "board-workspace"
  | "pet"
  | "settings";

type BridgeRecord =
  | PomodoroSessionsEntity
  | ProjectWorkspaceStateEntity
  | PetStateEntity
  | SettingsPrefEntity;

type BridgeStatus = "disabled" | "active";

type TauriInternals = {
  invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
};

type BridgeState = {
  status: BridgeStatus;
  repo: Repo<RepoRecord> | null;
  cache: Map<string, BridgedValue>;
  errors: Map<string, DesktopBridgeError>;
  hydratePromise: Promise<void> | null;
  publish: ((key: string, value: unknown) => void) | null;
};

type TaskCardShape = {
  id: string;
  title: unknown;
  tag?: string;
  date?: string;
  dateZh?: string;
  dateLabel?: unknown;
  sub?: unknown;
  inbox?: boolean;
};

type TaskColShape = {
  id: string;
  key: "overdue" | "next_7_days" | "later" | "no_date";
  count: number;
  tasks: TaskCardShape[];
  completed?: TaskCardShape[];
};

type HabitViewShape = {
  id: string;
  emoji: string;
  title: {
    en: string;
    zh: string;
  };
  createdAt: string;
};

type HabitsViewState = {
  schemaVersion: 1;
  habits: HabitViewShape[];
  checkIns: Record<string, Record<string, true>>;
  diaries: Record<string, Record<string, string>>;
};

type BoardCardLike = {
  id: string;
  [key: string]: unknown;
};

type BoardListLike = {
  id: string;
  key: string | null;
  customName?: { en?: string; zh?: string };
  color?: unknown;
  cards: BoardCardLike[];
};

type BoardLike = {
  id: string;
  workspaceId: string;
  name: { en: string; zh: string };
  cover: string;
  template: "kanban" | "pm" | "blank";
  lists: BoardListLike[];
};

const state: BridgeState = {
  status: "disabled",
  repo: null,
  cache: new Map<string, BridgedValue>(),
  errors: new Map<string, DesktopBridgeError>(),
  hydratePromise: null,
  publish: null,
};

export function mountDesktopRepoBridge(options: {
  enabled: boolean;
  publish: (key: string, value: unknown) => void;
}): void {
  const { enabled, publish } = options;
  if (!enabled || typeof window === "undefined") {
    resetBridgeState();
    return;
  }

  const tauriInternals = (window as Window & {
    __TAURI_INTERNALS__?: TauriInternals;
  }).__TAURI_INTERNALS__;

  if (!tauriInternals?.invoke) {
    state.status = "active";
    state.repo = null;
    state.cache.clear();
    state.publish = publish;
    state.hydratePromise = null;
    state.errors.set("bridge", {
      kind: "repo_unavailable",
      surface: "pomodoro",
      message: "Desktop repository bridge is unavailable (missing invoke).",
    });
    return;
  }

  state.status = "active";
  state.repo = createTauriRepo<RepoRecord>(tauriInternals.invoke, {
    namespace: DESKTOP_REPO_NAMESPACE,
    schemaVersion: 1,
  });
  state.publish = publish;
  state.errors.clear();
  state.hydratePromise = hydrateCacheFromRepo();
}

export function unmountDesktopRepoBridge(): void {
  resetBridgeState();
}

export function readDesktopRepoValue(key: string): {
  hasValue: boolean;
  value?: unknown;
} {
  if (state.status !== "active") {
    return { hasValue: false };
  }
  if (!isBridgedKey(key)) {
    return { hasValue: false };
  }
  if (!state.cache.has(key)) {
    return { hasValue: false };
  }
  return { hasValue: true, value: state.cache.get(key) };
}

export function readDesktopRepoError(key: string): DesktopBridgeError | null {
  return state.errors.get(key) ?? null;
}

export async function writeDesktopRepoValue(
  key: string,
  value: unknown,
): Promise<DesktopBridgeWriteResult> {
  if (key.startsWith("xai_note_")) {
    state.errors.set(key, NOTES_UNSUPPORTED_ERROR);
    return {
      status: "degraded",
      error: NOTES_UNSUPPORTED_ERROR,
    };
  }
  if (state.status !== "active" || !isBridgedKey(key)) {
    return { status: "ok" };
  }
  if (!state.repo) {
    const error: DesktopBridgeError = {
      kind: "repo_unavailable",
      surface: surfaceForKey(key),
      message: `Desktop repository unavailable for key "${key}".`,
    };
    state.errors.set(key, error);
    return { status: "degraded", error };
  }

  try {
    if (key === TASKS_STORAGE_KEY) {
      await writeTodoRecords(state.repo, value);
      publishBridgeValue(key, value);
      return { status: "ok" };
    }

    if (key === HABITS_STORAGE_KEY) {
      await writeHabitRecords(state.repo, value);
      publishBridgeValue(key, value);
      return { status: "ok" };
    }

    if (key === BOARDS_STORAGE_KEY) {
      await writeBoardAndCardRecords(state.repo, value);
      publishBridgeValue(key, value);
      return { status: "ok" };
    }

    const existing = await state.repo.get(key);
    const expectedEntityType = entityTypeForSingleRecordKey(key);

    if (existing && existing.entityType !== expectedEntityType) {
      const mismatch: DesktopBridgeError = {
        kind: "contract_mismatch",
        surface: surfaceForKey(key),
        message: `Expected "${expectedEntityType}" for "${key}" but got "${existing.entityType}".`,
      };
      state.errors.set(key, mismatch);
      return { status: "degraded", error: mismatch };
    }

    const nowIso = new Date().toISOString();
    const base = {
      id: key,
      schemaVersion: 1,
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
      syncScope: "device-local" as const,
    };

    const record = toBridgeRecord(key, value, base);
    await state.repo.put(record as RepoRecord);
    publishBridgeValue(key, value);
    return { status: "ok" };
  } catch (error) {
    const failed: DesktopBridgeError = {
      kind: "write_failed",
      surface: surfaceForKey(key),
      message: error instanceof Error ? error.message : String(error),
    };
    state.errors.set(key, failed);
    return { status: "degraded", error: failed };
  }
}

async function hydrateCacheFromRepo(): Promise<void> {
  if (!state.repo) {
    return;
  }

  try {
    const rows = await state.repo.list();

    hydrateCanonicalTasks(rows);
    hydrateCanonicalHabits(rows);
    hydrateCanonicalBoards(rows);

    for (const row of rows) {
      const key = row.id;
      if (!isSingleRecordBridgedKey(key)) {
        continue;
      }
      const expectedEntityType = entityTypeForSingleRecordKey(key);
      if (row.entityType !== expectedEntityType) {
        state.errors.set(key, {
          kind: "contract_mismatch",
          surface: surfaceForKey(key),
          message: `Hydration mismatch for "${key}": expected "${expectedEntityType}", got "${row.entityType}".`,
        });
        continue;
      }
      const decoded = readBridgeRecordValue(row as BridgeRecord);
      state.cache.set(key, decoded);
      state.publish?.(key, decoded);
    }
  } catch (error) {
    state.errors.set("bridge", {
      kind: "repo_unavailable",
      surface: "pomodoro",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function resetBridgeState(): void {
  state.status = "disabled";
  state.repo = null;
  state.cache.clear();
  state.errors.clear();
  state.hydratePromise = null;
  state.publish = null;
}

function isBridgedKey(key: string): boolean {
  return (
    key === TASKS_STORAGE_KEY ||
    key === HABITS_STORAGE_KEY ||
    key === POMODORO_STORAGE_KEY ||
    key === BOARDS_STORAGE_KEY ||
    BOARD_AUX_KEYS.has(key) ||
    PET_KEYS.has(key) ||
    /^xai_pref_/.test(key)
  );
}

export function isSingleRecordBridgedKey(key: string): boolean {
  return (
    key === POMODORO_STORAGE_KEY ||
    BOARD_AUX_KEYS.has(key) ||
    PET_KEYS.has(key) ||
    /^xai_pref_/.test(key)
  );
}

export function entityTypeForSingleRecordKey(
  key: string,
): BridgeRecord["entityType"] {
  if (key === POMODORO_STORAGE_KEY) return "productivity.pomodoro_sessions";
  if (BOARD_AUX_KEYS.has(key)) return "project.workspace_state";
  if (PET_KEYS.has(key)) return "pet.state";
  return "settings.pref";
}

export function surfaceForKey(key: string): BridgedSurface {
  if (key === TASKS_STORAGE_KEY) return "tasks";
  if (key === HABITS_STORAGE_KEY) return "habits";
  if (key === POMODORO_STORAGE_KEY) return "pomodoro";
  if (key === BOARDS_STORAGE_KEY || BOARD_AUX_KEYS.has(key)) return "board-workspace";
  if (PET_KEYS.has(key)) return "pet";
  return "settings";
}

export function toBridgeRecord(
  key: string,
  value: unknown,
  base: {
    id: string;
    schemaVersion: number;
    createdAt: string;
    updatedAt: string;
    syncScope: "device-local";
  },
): BridgeRecord {
  const entityType = entityTypeForSingleRecordKey(key);

  if (entityType === "productivity.pomodoro_sessions") {
    return {
      ...base,
      entityType,
      storageKey: POMODORO_STORAGE_KEY,
      sessions: Array.isArray(value) ? value : [],
    };
  }

  if (entityType === "project.workspace_state") {
    return {
      ...base,
      entityType: "project.workspace_state",
      storageKey: key as ProjectWorkspaceStateEntity["storageKey"],
      value,
    };
  }

  if (entityType === "pet.state") {
    return {
      ...base,
      entityType: "pet.state",
      storageKey: key as PetStateEntity["storageKey"],
      value,
    };
  }

  return {
    ...base,
    entityType: "settings.pref",
    storageKey: key as SettingsPrefEntity["storageKey"],
    value,
  };
}

function readBridgeRecordValue(record: BridgeRecord): unknown {
  if (record.entityType === "productivity.pomodoro_sessions") {
    return record.sessions;
  }
  return record.value;
}

function publishBridgeValue(key: string, value: unknown): void {
  state.cache.set(key, value);
  state.publish?.(key, value);
  state.errors.delete(key);
}

async function writeTodoRecords(repo: Repo<RepoRecord>, value: unknown): Promise<void> {
  const todos = buildTodoEntities(value);
  await replaceEntityFamily(repo, "productivity.todo", todos);
}

async function writeHabitRecords(repo: Repo<RepoRecord>, value: unknown): Promise<void> {
  const habits = buildHabitEntities(value);
  await replaceEntityFamily(repo, "productivity.habit", habits);
}

async function writeBoardAndCardRecords(
  repo: Repo<RepoRecord>,
  value: unknown,
): Promise<void> {
  const boards = buildBoardEntities(value);
  const cards = buildCardEntities(value);
  await replaceEntityFamily(repo, "project.board", boards);
  await replaceEntityFamily(repo, "project.card", cards);
}

async function replaceEntityFamily(
  repo: Repo<RepoRecord>,
  entityType: string,
  nextRecords: RepoRecord[],
): Promise<void> {
  const nowIso = new Date().toISOString();
  const existing = await repo.list({ entityType });
  const existingById = new Map(existing.map((record) => [record.id, record]));
  const nextIds = new Set<string>();

  for (const record of nextRecords) {
    nextIds.add(record.id);
    const prev = existingById.get(record.id);
    await repo.put({
      ...record,
      entityType,
      schemaVersion: 1,
      createdAt: prev?.createdAt ?? record.createdAt ?? nowIso,
      updatedAt: nowIso,
    });
  }

  for (const stale of existing) {
    if (!nextIds.has(stale.id)) {
      await repo.delete(stale.id);
    }
  }
}

export function buildTodoEntities(value: unknown): TodoEntity[] {
  const nowIso = new Date().toISOString();
  const columns = parseTaskColumns(value);
  const records: TodoEntity[] = [];
  const usedIds = new Set<string>();

  for (const column of columns) {
    records.push(
      ...buildTodosFromCards({
        cards: column.tasks,
        done: false,
        bucketId: column.id,
        nowIso,
        usedIds,
      }),
    );

    if (Array.isArray(column.completed)) {
      records.push(
        ...buildTodosFromCards({
          cards: column.completed,
          done: true,
          bucketId: column.id,
          nowIso,
          usedIds,
        }),
      );
    }
  }

  return records;
}

function buildTodosFromCards(input: {
  cards: TaskCardShape[];
  done: boolean;
  bucketId: string;
  nowIso: string;
  usedIds: Set<string>;
}): TodoEntity[] {
  const { cards, done, bucketId, nowIso, usedIds } = input;
  const rows: TodoEntity[] = [];

  for (const card of cards) {
    const sourceId = card.id || `${bucketId}-${rows.length}`;
    const entityId = uniqueId(`${TASK_ENTITY_PREFIX}${sourceId}`, usedIds);
    const title = readTaskTitle(card.title) ?? "Untitled Task";
    const notesPayload = {
      source: TASKS_STORAGE_KEY,
      bucket: bucketId,
      card,
    };
    const notes = stringifyJson(notesPayload);

    rows.push({
      id: entityId,
      entityType: "productivity.todo",
      schemaVersion: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
      syncScope: "account-sync",
      title,
      done,
      labelIds: card.tag ? [card.tag] : [],
      dueAt: undefined,
      notes,
      projectId: `bucket:${bucketId}`,
      deletedAt: undefined,
    });
  }

  return rows;
}

export function buildHabitEntities(value: unknown): HabitEntity[] {
  const nowIso = new Date().toISOString();
  const stateBlob = asObject(value);
  const habits = Array.isArray(stateBlob?.habits) ? stateBlob.habits : [];
  const checkIns = asObject(stateBlob?.checkIns);
  const rows: HabitEntity[] = [];

  for (const entry of habits) {
    const habit = asObject(entry);
    if (!habit) {
      continue;
    }

    const rawId = asString(habit.id) ?? `habit-${rows.length}`;
    const entityId = `${HABIT_ENTITY_PREFIX}${rawId}`;
    const titleBundle = asObject(habit.title);
    const title =
      asString(titleBundle?.en) ??
      asString(titleBundle?.zh) ??
      asString(habit.title) ??
      "Untitled Habit";
    const cadenceValue = asString(habit.cadence);
    const cadence: HabitEntity["cadence"] =
      cadenceValue === "weekly" || cadenceValue === "custom"
        ? cadenceValue
        : "daily";

    const perHabitCheckIn = asObject(checkIns?.[rawId]);
    const completions = Object.entries(perHabitCheckIn ?? {})
      .filter(([, checked]) => checked === true)
      .map(([dateKey]) => dateKey)
      .sort();

    rows.push({
      id: entityId,
      entityType: "productivity.habit",
      schemaVersion: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
      syncScope: "account-sync",
      title,
      cadence,
      completions,
      labelIds: [],
    });
  }

  return rows;
}

export function buildBoardEntities(value: unknown): ProjectEntity[] {
  const nowIso = new Date().toISOString();
  const boards = parseBoardArray(value);
  return boards.map((board) => {
    const title = board.name.en || board.name.zh || board.id;
    const snapshot = stringifyJson({
      source: BOARDS_STORAGE_KEY,
      board,
    });

    return {
      id: `${BOARD_ENTITY_PREFIX}${board.id}`,
      entityType: "project.board",
      schemaVersion: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
      syncScope: "account-sync",
      title,
      description: snapshot,
      archivedAt: undefined,
      labelIds: [],
    };
  });
}

export function buildCardEntities(value: unknown): CardEntity[] {
  const nowIso = new Date().toISOString();
  const boards = parseBoardArray(value);
  const cards: CardEntity[] = [];

  for (const board of boards) {
    const projectId = `${BOARD_ENTITY_PREFIX}${board.id}`;
    const normalizedLists = Array.isArray(board.lists) ? board.lists : [];

    normalizedLists.forEach((list, listIndex) => {
      const status = mapListStatus(list.key);
      const listCards = Array.isArray(list.cards) ? list.cards : [];

      listCards.forEach((card, cardIndex) => {
        const cardId = card.id || `card-${listIndex}-${cardIndex}`;
        const title = readTaskTitle(card.title) ?? "Untitled Card";
        const position = listIndex * 1_000 + cardIndex;
        const labels = Array.isArray(card.labels)
          ? card.labels.filter((entry): entry is string => typeof entry === "string")
          : [];
        const members = Array.isArray(card.members)
          ? card.members.filter((entry): entry is string => typeof entry === "string")
          : [];

        cards.push({
          id: `${CARD_ENTITY_PREFIX}${board.id}:${cardId}`,
          entityType: "project.card",
          schemaVersion: 1,
          createdAt: nowIso,
          updatedAt: nowIso,
          syncScope: "account-sync",
          projectId,
          title,
          description: stringifyJson({
            source: BOARDS_STORAGE_KEY,
            boardId: board.id,
            listId: list.id,
            listKey: list.key,
            card,
          }),
          status,
          position,
          assigneeId: members[0],
          labelIds: labels,
        });
      });
    });
  }

  return cards;
}

function hydrateCanonicalTasks(rows: RepoRecord[]): void {
  const taskRows = rows.filter((row) => row.entityType === "productivity.todo");
  if (taskRows.length === 0) {
    return;
  }

  const byBucket = new Map<string, TaskColShape>();
  for (const bucketId of TASK_BUCKET_IDS) {
    byBucket.set(bucketId, createEmptyTaskColumn(bucketId));
  }

  for (const row of taskRows) {
    const todo = row as TodoEntity;
    const bucket = readTodoBucket(todo);
    if (!byBucket.has(bucket)) {
      byBucket.set(bucket, createEmptyTaskColumn(bucket));
    }
    const column = byBucket.get(bucket);
    if (!column) {
      continue;
    }

    const restored = restoreTaskCard(todo);
    if (todo.done) {
      if (!column.completed) {
        column.completed = [];
      }
      column.completed.push(restored);
    } else {
      column.tasks.push(restored);
    }
  }

  const output: TaskColShape[] = Array.from(byBucket.values())
    .filter((column) => column.tasks.length > 0 || (column.completed?.length ?? 0) > 0)
    .map((column) => ({
      ...column,
      count: column.tasks.length,
    }));

  if (output.length === 0) {
    return;
  }

  publishBridgeValue(TASKS_STORAGE_KEY, output);
}

function hydrateCanonicalHabits(rows: RepoRecord[]): void {
  const habitRows = rows.filter((row) => row.entityType === "productivity.habit");
  if (habitRows.length === 0) {
    return;
  }

  const stateValue: HabitsViewState = {
    schemaVersion: 1,
    habits: [],
    checkIns: {},
    diaries: {},
  };

  for (const row of habitRows) {
    const habit = row as HabitEntity;
    const localId = stripPrefix(habit.id, HABIT_ENTITY_PREFIX);
    stateValue.habits.push({
      id: localId,
      emoji: "✅",
      title: {
        en: habit.title,
        zh: habit.title,
      },
      createdAt: habit.createdAt,
    });

    const checkIns: Record<string, true> = {};
    for (const completion of habit.completions) {
      checkIns[completion] = true;
    }
    stateValue.checkIns[localId] = checkIns;
    stateValue.diaries[localId] = {};
  }

  publishBridgeValue(HABITS_STORAGE_KEY, stateValue);
}

function hydrateCanonicalBoards(rows: RepoRecord[]): void {
  const boardRows = rows.filter((row) => row.entityType === "project.board");
  if (boardRows.length === 0) {
    return;
  }

  const cardsByBoard = new Map<string, CardEntity[]>();
  for (const row of rows) {
    if (row.entityType !== "project.card") {
      continue;
    }
    const card = row as CardEntity;
    const boardId = stripPrefix(card.projectId, BOARD_ENTITY_PREFIX);
    const bucket = cardsByBoard.get(boardId) ?? [];
    bucket.push(card);
    cardsByBoard.set(boardId, bucket);
  }

  const hydratedBoards: BoardLike[] = [];

  for (const row of boardRows) {
    const boardEntity = row as ProjectEntity;
    const localBoardId = stripPrefix(boardEntity.id, BOARD_ENTITY_PREFIX);
    const snapshot = parseBoardSnapshot(boardEntity.description);
    if (snapshot && snapshot.id === localBoardId) {
      hydratedBoards.push(snapshot);
      continue;
    }

    hydratedBoards.push(buildBoardFromCardRows({
      boardId: localBoardId,
      title: boardEntity.title,
      cards: cardsByBoard.get(localBoardId) ?? [],
    }));
  }

  if (hydratedBoards.length === 0) {
    return;
  }

  publishBridgeValue(BOARDS_STORAGE_KEY, hydratedBoards);
}

function createEmptyTaskColumn(bucketId: string): TaskColShape {
  return {
    id: bucketId,
    key: taskColumnKey(bucketId),
    count: 0,
    tasks: [],
  };
}

function taskColumnKey(bucketId: string): TaskColShape["key"] {
  if (bucketId === "overdue") return "overdue";
  if (bucketId === "next7") return "next_7_days";
  if (bucketId === "later") return "later";
  return "no_date";
}

function mapListStatus(listKey: string | null): CardEntity["status"] {
  if (listKey === "done" || listKey === "completed") {
    return "done";
  }
  if (listKey === "blocked") {
    return "blocked";
  }
  if (listKey === "doing" || listKey === "in_progress" || listKey === "progress") {
    return "doing";
  }
  return "todo";
}

function readTaskTitle(value: unknown): string | null {
  const titleObj = asObject(value);
  const fromBundle = asString(titleObj?.en) ?? asString(titleObj?.zh);
  if (fromBundle) {
    return fromBundle;
  }
  return asString(value) ?? null;
}

function readTodoBucket(todo: TodoEntity): string {
  if (typeof todo.projectId === "string" && todo.projectId.startsWith("bucket:")) {
    return todo.projectId.slice("bucket:".length);
  }

  const parsed = parseJson(todo.notes);
  const source = asObject(parsed);
  const bucket = asString(source?.bucket);
  if (bucket) {
    return bucket;
  }

  return "nodate";
}

function restoreTaskCard(todo: TodoEntity): TaskCardShape {
  const parsed = parseJson(todo.notes);
  const source = asObject(parsed);
  const card = asObject(source?.card);

  if (card && typeof card.id === "string") {
    return {
      ...card,
      id: card.id,
    } as TaskCardShape;
  }

  const fallbackId = stripPrefix(todo.id, TASK_ENTITY_PREFIX);
  return {
    id: fallbackId,
    title: { en: todo.title, zh: todo.title },
    tag: todo.labelIds[0],
  };
}

function parseTaskColumns(value: unknown): TaskColShape[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const output: TaskColShape[] = [];
  for (const entry of value) {
    const col = asObject(entry);
    if (!col) {
      continue;
    }

    const id = asString(col.id);
    if (!id) {
      continue;
    }

    output.push({
      id,
      key: taskColumnKey(id),
      count: 0,
      tasks: parseTaskCards(col.tasks),
      completed: parseTaskCards(col.completed),
    });
  }

  return output;
}

function parseTaskCards(value: unknown): TaskCardShape[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const cards: TaskCardShape[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const cardObj = asObject(value[index]);
    if (!cardObj) {
      continue;
    }

    const id = asString(cardObj.id) ?? `task-${index}`;
    cards.push({
      id,
      title: cardObj.title,
      tag: asString(cardObj.tag) ?? undefined,
      date: asString(cardObj.date) ?? undefined,
      dateZh: asString(cardObj.dateZh) ?? undefined,
      dateLabel: cardObj.dateLabel,
      sub: cardObj.sub,
      inbox: typeof cardObj.inbox === "boolean" ? cardObj.inbox : undefined,
    });
  }

  return cards;
}

function parseBoardArray(value: unknown): BoardLike[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const boards: BoardLike[] = [];
  for (let boardIndex = 0; boardIndex < value.length; boardIndex += 1) {
    const boardObj = asObject(value[boardIndex]);
    if (!boardObj) {
      continue;
    }

    const boardId = asString(boardObj.id) ?? `board-${boardIndex}`;
    const nameObj = asObject(boardObj.name);
    const titleEn = asString(nameObj?.en) ?? asString(boardObj.name) ?? boardId;
    const titleZh = asString(nameObj?.zh) ?? titleEn;
    const workspaceId = asString(boardObj.workspaceId) ?? "personal";
    const templateValue = asString(boardObj.template);
    const template: BoardLike["template"] =
      templateValue === "pm" || templateValue === "blank"
        ? templateValue
        : "kanban";

    const listValue = Array.isArray(boardObj.lists) ? boardObj.lists : [];
    const lists: BoardListLike[] = [];
    for (let listIndex = 0; listIndex < listValue.length; listIndex += 1) {
      const listObj = asObject(listValue[listIndex]);
      if (!listObj) {
        continue;
      }

      const listId = asString(listObj.id) ?? `${boardId}-list-${listIndex}`;
      const customNameObj = asObject(listObj.customName);
      const cards: BoardCardLike[] = [];

      if (Array.isArray(listObj.cards)) {
        for (let cardIndex = 0; cardIndex < listObj.cards.length; cardIndex += 1) {
          const cardObj = asObject(listObj.cards[cardIndex]);
          if (!cardObj) {
            continue;
          }
          const cardId = asString(cardObj.id) ?? `${listId}-card-${cardIndex}`;
          cards.push({
            ...cardObj,
            id: cardId,
          });
        }
      }

      lists.push({
        id: listId,
        key: asString(listObj.key) ?? null,
        customName: customNameObj
          ? {
              en: asString(customNameObj.en),
              zh: asString(customNameObj.zh),
            }
          : undefined,
        color: listObj.color,
        cards,
      });
    }

    boards.push({
      id: boardId,
      workspaceId,
      name: {
        en: titleEn,
        zh: titleZh,
      },
      cover: asString(boardObj.cover) ?? "",
      template,
      lists,
    });
  }

  return boards;
}

function parseBoardSnapshot(description: string | undefined): BoardLike | null {
  if (!description) {
    return null;
  }
  const parsed = parseJson(description);
  const root = asObject(parsed);
  const board = root ? root.board : undefined;
  const parsedBoards = parseBoardArray(board ? [board] : []);
  return parsedBoards[0] ?? null;
}

function buildBoardFromCardRows(input: {
  boardId: string;
  title: string;
  cards: CardEntity[];
}): BoardLike {
  const { boardId, title, cards } = input;
  const listsById = new Map<string, BoardListLike>();

  for (const card of cards) {
    const snapshot = parseJson(card.description);
    const payload = asObject(snapshot);
    const listId = asString(payload?.listId) ?? "list-todo";
    const listKey = asString(payload?.listKey) ?? "todo";

    if (!listsById.has(listId)) {
      listsById.set(listId, {
        id: listId,
        key: listKey,
        cards: [],
      });
    }

    const list = listsById.get(listId);
    if (!list) {
      continue;
    }

    const localCardId = stripCardEntityId(card.id, boardId);
    const payloadCard = asObject(payload?.card);
    if (payloadCard && typeof payloadCard.id === "string") {
      list.cards.push({
        ...payloadCard,
        id: payloadCard.id,
      });
      continue;
    }

    list.cards.push({
      id: localCardId,
      title: {
        en: card.title,
        zh: card.title,
      },
      labels: card.labelIds,
      members: card.assigneeId ? [card.assigneeId] : [],
    });
  }

  const lists = Array.from(listsById.values());

  return {
    id: boardId,
    workspaceId: "personal",
    name: {
      en: title,
      zh: title,
    },
    cover: "",
    template: "kanban",
    lists,
  };
}

function stripCardEntityId(entityId: string, boardId: string): string {
  const prefix = `${CARD_ENTITY_PREFIX}${boardId}:`;
  if (entityId.startsWith(prefix)) {
    return entityId.slice(prefix.length);
  }
  return stripPrefix(entityId, CARD_ENTITY_PREFIX);
}

function uniqueId(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let index = 1;
  while (used.has(`${base}:${index}`)) {
    index += 1;
  }
  const next = `${base}:${index}`;
  used.add(next);
  return next;
}

function stripPrefix(value: string, prefix: string): string {
  if (value.startsWith(prefix)) {
    return value.slice(prefix.length);
  }
  return value;
}

function stringifyJson(value: unknown): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

function parseJson(value: string | undefined): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
