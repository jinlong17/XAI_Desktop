import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { accountScope, generationMarkerKey, readCanonicalCommandState, setCanonicalCommandActivationForTests, setPref } from "@repo/plugin-web-storage";
import { makeDefaultBoards, archiveCard, restoreCard, moveCardToList, archiveList, restoreList } from "@repo/plugin-web-board-core";
import type { Board, BoardCardData } from "@repo/plugin-web-board-core";
import { loadTaskColsOrSeed } from "@repo/plugin-web-tasks";
import type { TaskCol, TaskCard } from "@repo/plugin-web-tasks";
import { ensureBoardTaskLink } from "../internal/taskLinkCommand.js";
import { createTestLockManager } from "./webLocksHarness.js";

const boardKey = () => accountScope.physicalKey("xai_boards_v2");
const taskKey = () => accountScope.physicalKey("xai_task_cols");

function seed() { localStorage.setItem(boardKey(), JSON.stringify(makeDefaultBoards())); }
function card(): BoardCardData { return (JSON.parse(localStorage.getItem(boardKey())!) as Board[])[0]!.lists.flatMap((list) => list.cards).find((entry) => entry.id === "bc1")!; }
function taskCols(): TaskCol[] {
  const state = readCanonicalCommandState<TaskCol[]>(JSON.parse(localStorage.getItem(taskKey())!));
  if (state.status === "legacy" || state.status === "envelope") return state.data;
  throw Error("expected task columns");
}
function task(): TaskCard { return taskCols().flatMap((col) => [...col.tasks, ...(col.completed ?? [])]).find((entry) => entry.source?.cardId === "bc1")!; }

beforeEach(() => {
  setCanonicalCommandActivationForTests(true);
  localStorage.setItem(generationMarkerKey("consumer-test"), JSON.stringify({ generation: "fixture", migrationId: "test", previous: null }));
  vi.stubGlobal("navigator", { locks: createTestLockManager() });
});
afterEach(() => setCanonicalCommandActivationForTests(false));

it.each(["intent", "task", "acknowledgement"] as const)("%s write failure is honest and retry resumes the retained intent exactly once", async (phase) => {
  seed(); const scope = accountScope.capture(), native = Storage.prototype.setItem; let boardsWrites = 0;
  const fail = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === boardKey()) boardsWrites++;
    if ((phase === "intent" && key === boardKey()) || (phase === "task" && key === taskKey()) || (phase === "acknowledgement" && key === boardKey() && boardsWrites === 2)) throw new DOMException("quota", "QuotaExceededError");
    native.call(this, key, value);
  });
  const result = await ensureBoardTaskLink("b-default", "bc1", scope); expect(result).toMatchObject({ ok: false, phase });
  if (phase === "intent") { expect(card().taskLink).toBeUndefined(); expect(localStorage.getItem(taskKey())).toBeNull(); }
  else { expect(card().taskLink!.pending).toBeDefined(); if (phase === "task") expect(localStorage.getItem(taskKey())).toBeNull(); else expect(task()).toBeDefined(); }
  fail.mockRestore(); const saved = phase === "acknowledgement" ? task() : null;
  expect(await ensureBoardTaskLink("b-default", "bc1", scope)).toEqual({ ok: true }); expect(card().taskLink!.pending).toBeUndefined(); if (saved) expect(task()).toEqual(saved);
  expect(taskCols().flatMap((col) => col.tasks).filter((entry) => entry.source?.cardId === "bc1")).toHaveLength(1);
});

it("pending link follows stable card through move and card/list archive restoration", async () => {
  seed(); const scope = accountScope.capture(), native = Storage.prototype.setItem; const fail = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === taskKey()) throw Error("quota"); native.call(this, key, value); });
  await ensureBoardTaskLink("b-default", "bc1", scope); fail.mockRestore();
  const boards = JSON.parse(localStorage.getItem(boardKey())!) as Board[], board = boards[0]!, original = card().taskLink!;
  const target = board.lists[1]!.id;
  board.lists = moveCardToList(board.lists, "bc1", "b-backlog", target);
  board.lists = restoreCard(archiveCard(board.lists, target, "bc1"), target, "bc1");
  board.lists = restoreList(archiveList(board.lists, target, { template: board.template }), target, { template: board.template });
  localStorage.setItem(boardKey(), JSON.stringify(boards)); expect(card().taskLink).toEqual(original);
  expect(await ensureBoardTaskLink("b-default", "bc1", scope)).toEqual({ ok: true }); expect(task().source!.listId).toBe(target); expect(task().id).toBe(original.taskId);
});

it("old account callback cannot write B or erase A pending intent", async () => {
  seed(); const captured = accountScope.capture(), aKey = boardKey(), bytes = localStorage.getItem(aKey); accountScope.activate(accountScope.lock("other"), "fixture");
  expect((await ensureBoardTaskLink("b-default", "bc1", captured)).ok).toBe(false); expect(localStorage.getItem(boardKey())).toBeNull(); expect(localStorage.getItem(aKey)).toBe(bytes);
});

it("legacy task ID collision never overwrites another source or publishes a false link", async () => {
  seed(); const cols = loadTaskColsOrSeed(null); cols[0] = { ...cols[0]!, tasks: [{ id: "bt-b-default-bc1", title: { en: "unrelated", zh: "unrelated" } }] };
  const bytes = JSON.stringify(cols); localStorage.setItem(taskKey(), bytes);
  expect(await ensureBoardTaskLink("b-default", "bc1", accountScope.capture())).toMatchObject({ ok: false, phase: "intent" });
  expect(localStorage.getItem(taskKey())).toBe(bytes); expect(card().taskLink).toBeUndefined();
});

it("adds a Board task through the canonical envelope while retaining durable receipts", async () => {
  seed(); const scope = accountScope.capture();
  const raw = JSON.stringify({ format: "xai-command-state", version: 1, revision: 2, data: loadTaskColsOrSeed(null), receipts: { "ai:task-create": { operationVersion: 1, signature: "tasks:create:v1", result: { ok: true, targetId: "older-task" }, committedAt: "2026-09-09T12:00:00.000Z" } } });
  localStorage.setItem(taskKey(), raw);
  expect(await ensureBoardTaskLink("b-default", "bc1", scope)).toEqual({ ok: true });
  const state = readCanonicalCommandState<TaskCol[]>(JSON.parse(localStorage.getItem(taskKey())!));
  expect(state.status).toBe("envelope");
  if (state.status === "envelope") expect(state.envelope.receipts["ai:task-create"]).toBeDefined();
  expect(task().id).toBe("bt-b-default-bc1");
});

it("serializes concurrent same-owner attempts and retries acknowledgement without another Task commit", async () => {
  seed();
  const scope = accountScope.capture();
  const locks = createTestLockManager();
  vi.stubGlobal("navigator", { locks });
  const taskWrites = vi.spyOn(Storage.prototype, "setItem");
  const [first, second] = await Promise.all([
    ensureBoardTaskLink("b-default", "bc1", scope),
    ensureBoardTaskLink("b-default", "bc1", scope),
  ]);

  expect([first, second].filter((result) => result.ok)).toHaveLength(1);
  expect([first, second].find((result) => !result.ok)).toMatchObject({ ok: false, phase: "acknowledgement" });
  expect(taskWrites.mock.calls.filter(([key]) => key === taskKey())).toHaveLength(1);
  expect(taskCols().flatMap((col) => [...col.tasks, ...(col.completed ?? [])]).filter((entry) => entry.source?.cardId === "bc1")).toHaveLength(1);
  expect(card().taskLink?.pending).toBeUndefined();
  expect(await ensureBoardTaskLink("b-default", "bc1", scope)).toEqual({ ok: true });
  expect(taskWrites.mock.calls.filter(([key]) => key === taskKey())).toHaveLength(1);
  expect(locks.calls.filter(({ name }) => name.endsWith(":lifecycle")).every(({ mode }) => mode === "shared")).toBe(true);
  expect(locks.calls.filter(({ name }) => name.includes(":xai_task_cols")).every(({ mode }) => mode === "exclusive")).toBe(true);
});

it.each([JSON.stringify(null), JSON.stringify({ format: "xai-command-state", version: 1, revision: 1, data: null, receipts: {} })])("invalid non-absent task bytes %s never save Board intent", async (raw) => {
  seed(); const scope = accountScope.capture(), before = localStorage.getItem(boardKey()); localStorage.setItem(taskKey(), raw);
  expect(await ensureBoardTaskLink("b-default", "bc1", scope)).toMatchObject({ ok: false, phase: "intent" });
  expect(localStorage.getItem(boardKey())).toBe(before); expect(localStorage.getItem(taskKey())).toBe(raw);
});

it("present JSON-null Board bytes refuse before publishing an intent or Task", async () => {
  const scope = accountScope.capture();
  localStorage.setItem(boardKey(), "null");
  expect(await ensureBoardTaskLink("b-default", "bc1", scope)).toMatchObject({ ok: false, phase: "intent" });
  expect(localStorage.getItem(boardKey())).toBe("null");
  expect(localStorage.getItem(taskKey())).toBeNull();
});

it("a newer same-ID pending intent is retained after the Task write", async () => {
  seed(); const scope = accountScope.capture(), native = Storage.prototype.setItem;
  let replaced = false;
  const replace = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    native.call(this, key, value);
    if (key !== taskKey() || replaced) return;
    replaced = true;
    const boards = JSON.parse(localStorage.getItem(boardKey())!) as Board[];
    const card = boards[0]!.lists.flatMap((list) => list.cards).find((entry) => entry.id === "bc1")!;
    card.taskLink = { ...card.taskLink!, pending: { title: { en: "New request", zh: "新请求" }, dueDate: "2026-10-10" } };
    expect(setPref("xai_boards_v2", boards, scope)).toBe(true);
  });
  expect(await ensureBoardTaskLink("b-default", "bc1", scope)).toMatchObject({ ok: false, phase: "acknowledgement" });
  replace.mockRestore();
  expect(card().taskLink?.pending).toEqual({ title: { en: "New request", zh: "新请求" }, dueDate: "2026-10-10" });
  expect(task().title).toEqual({ en: "Onboarding flow concepts", zh: "新人引导流程概念" });
});
