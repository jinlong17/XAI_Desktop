import { accountScope, mutateCanonicalDataset, readCanonicalCommandState, setPref, type AccountScope } from "@repo/plugin-web-storage";
import { loadBoardsOrDefault, readBoardStorage, preserveBoardStorageFormat, type Board, type BoardCardTaskLink } from "@repo/plugin-web-board-core";
import { bucketIdForBoardDueDate, findBoardLinkedTask, loadTaskColsOrSeed, taskCardFromBoardLink, upsertBoardLinkedTask, type TaskCol } from "@repo/plugin-web-tasks";

export type TaskLinkResult = { ok: true } | { ok: false; phase: "intent" | "task" | "acknowledgement"; message: string };

type LinkPhase = "intent" | "task" | "acknowledgement";

function isTaskCols(value: unknown): value is TaskCol[] {
  return Array.isArray(value) && loadTaskColsOrSeed(value) === value;
}

function sameTaskLink(left: BoardCardTaskLink | undefined, right: BoardCardTaskLink): boolean {
  return left?.source === right.source
    && left.taskId === right.taskId
    && left.createdAt === right.createdAt
    && left.pending?.title.en === right.pending?.title.en
    && left.pending?.title.zh === right.pending?.title.zh
    && left.pending?.dueDate === right.pending?.dueDate;
}

function taskMatchesIntent(task: ReturnType<typeof taskCardFromBoardLink>, intent: BoardCardTaskLink): boolean {
  return task.id === intent.taskId
    && task.title.en === intent.pending?.title.en
    && task.title.zh === intent.pending?.title.zh
    && task.dueDate === intent.pending?.dueDate;
}

/** A recoverable ordered command, not an atomic transaction across storage keys. */
export async function ensureBoardTaskLink(boardId: string, cardId: string, scope: AccountScope): Promise<TaskLinkResult> {
  let phase: LinkPhase = "intent";
  const read = (key: string): { present: boolean; value: unknown } => {
    accountScope.assertCurrent(scope);
    const raw = localStorage.getItem(accountScope.physicalKey(key, scope));
    return { present: raw !== null, value: raw === null ? null : JSON.parse(raw) };
  };
  const boardCard = () => {
    const stored = read("xai_boards_v2");
    if (!stored.present || readBoardStorage(stored.value).status !== "valid") throw Error("Board data needs recovery; original bytes were preserved.");
    const raw = stored.value;
    const boards = loadBoardsOrDefault(raw);
    const board = boards.find((entry) => entry.id === boardId);
    const list = board?.lists.find((entry) => entry.cards.some((card) => card.id === cardId));
    const card = list?.cards.find((entry) => entry.id === cardId);
    if (!board || !list || !card) throw Error("The source card no longer exists.");
    return { raw, boards, list, card };
  };
  const saveLink = (link: BoardCardTaskLink) => {
    const current = boardCard();
    const next: Board[] = current.boards.map((board) => board.id !== boardId ? board : {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) => card.id === cardId ? { ...card, taskLink: link } : card),
      })),
    });
    accountScope.assertCurrent(scope);
    if (!setPref("xai_boards_v2", preserveBoardStorageFormat(current.raw, next), scope)) {
      throw Error("Board link could not be saved.");
    }
  };
  const preflightTaskData = (): TaskCol[] | null => {
    accountScope.assertCurrent(scope);
    const raw = localStorage.getItem(accountScope.physicalKey("xai_task_cols", scope));
    const state = raw === null ? { status: "absent" as const } : readCanonicalCommandState(JSON.parse(raw));
    if (state.status === "corrupt" || state.status === "unsupported" || state.status === "unavailable") {
      throw Error("Task data needs recovery; original bytes were preserved.");
    }
    if (state.status === "absent") return null;
    if (!isTaskCols(state.data)) throw Error("Task data needs recovery; original bytes were preserved.");
    return state.data;
  };
  const failure = (error: unknown): TaskLinkResult => ({
    ok: false,
    phase,
    message: (phase === "acknowledgement" ? "Task saved; Board acknowledgement is pending. Retry to finish. " : "")
      + (error instanceof Error ? error.message : "Task link could not be saved."),
  });

  try {
    const initial = boardCard();
    const initialSource = { type: "board-card" as const, boardId, listId: initial.list.id, cardId };
    const initialCols = preflightTaskData();
    const existing = initialCols ? findBoardLinkedTask(initialCols, initialSource) : null;
    const draft = initial.card.taskLink?.pending ?? {
      title: initial.card.title,
      ...(initial.card.dueDate ? { dueDate: initial.card.dueDate } : {}),
    };
    const proposed = existing?.task ?? taskCardFromBoardLink({ ...initialSource, ...draft });
    if (!existing && initialCols?.some((col) => [...col.tasks, ...(col.completed ?? [])].some((row) => row.id === proposed.id))) {
      throw Error("Another task uses this identifier. Review the source before linking; existing data was preserved.");
    }
    const intent: BoardCardTaskLink = initial.card.taskLink?.pending
      ? initial.card.taskLink
      : { source: "xai-web-tasks", taskId: proposed.id, createdAt: initial.card.taskLink?.createdAt ?? new Date().toISOString(), pending: draft };
    if (!intent.pending || intent.taskId !== proposed.id) {
      throw Error("The stored link identity conflicts with the task. Original data was preserved.");
    }
    if (existing && !taskMatchesIntent(existing.task, intent)) {
      throw Error("The stored link intent conflicts with the existing task. Review the current card.");
    }
    if (!initial.card.taskLink?.pending) saveLink(intent);

    phase = "task";
    const taskResult = await mutateCanonicalDataset<TaskCol[]>({
      key: "xai_task_cols",
      scope,
      validate: isTaskCols,
      initialize: () => loadTaskColsOrSeed(null),
      mutate: (cols) => {
        let current;
        try { current = boardCard(); } catch { return { ok: false, reason: "conflict" as const }; }
        const liveLink = current.card.taskLink;
        if (!liveLink?.pending || !sameTaskLink(liveLink, intent)) return { ok: false, reason: "conflict" as const };
        const source = { type: "board-card" as const, boardId, listId: current.list.id, cardId };
        const linked = findBoardLinkedTask(cols, source);
        if (linked) return taskMatchesIntent(linked.task, intent) ? { ok: true, data: cols } : { ok: false, reason: "conflict" as const };
        if (cols.some((col) => [...col.tasks, ...(col.completed ?? [])].some((row) => row.id === intent.taskId))) {
          return { ok: false, reason: "conflict" as const };
        }
        const task = taskCardFromBoardLink({ ...source, ...liveLink.pending });
        if (task.id !== intent.taskId) return { ok: false, reason: "conflict" as const };
        return { ok: true, data: upsertBoardLinkedTask(cols, task, bucketIdForBoardDueDate(liveLink.pending.dueDate), true) };
      },
    });
    if (!taskResult.ok) {
      throw Error(taskResult.reason === "conflict"
        ? "The Board card or Tasks changed while linking. Retry from the current card."
        : "Link intent saved; task creation failed. Retry to finish.");
    }

    phase = "acknowledgement";
    const latest = boardCard().card.taskLink;
    if (!latest?.pending || !sameTaskLink(latest, intent)) throw Error("The link changed while saving. Review the current card.");
    const complete: BoardCardTaskLink = { ...latest };
    delete complete.pending;
    saveLink(complete);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
