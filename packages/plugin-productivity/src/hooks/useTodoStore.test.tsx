// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));

import { emitEvent } from "@repo/core/events";
import { TodoStoreProvider, useTodoStore } from "./useTodoStore";
import type { TodoStore } from "./useTodoStore";
import type { DataAdapter, Todo } from "../types";

const emitEventMock = vi.mocked(emitEvent);

// ── Date helpers ──────────────────────────────────────────────────────────────
function isoDay(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// ── Minimal in-memory adapter ────────────────────────────────────────────────
function makeMemAdapter(seed: Todo[] = []): DataAdapter<Todo> {
  const store = new Map<string, Todo>(seed.map((t) => [t.id, t]));
  return {
    getAll: async () => [...store.values()],
    getById: async (id) => store.get(id) ?? null,
    save: async (item) => { store.set(item.id, item); },
    delete: async (id) => { store.delete(id); },
  };
}

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  const now = new Date().toISOString();
  return {
    id: "todo-test-1",
    entityType: "productivity.todo",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: "Test todo",
    description: "",
    status: "open",
    priority: "medium",
    quadrant: "schedule",
    labels: [],
    pomodoroCount: 0,
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides,
  };
}

// ── Test harness ─────────────────────────────────────────────────────────────
let container: HTMLDivElement;
let root: Root;
let capturedStore: TodoStore | null = null;

function Capture() {
  capturedStore = useTodoStore();
  return null;
}

function renderProvider(adapter: DataAdapter<Todo>) {
  act(() => {
    root.render(
      <TodoStoreProvider adapter={adapter}>
        <Capture />
      </TodoStoreProvider>,
    );
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"] });
  emitEventMock.mockClear();
  capturedStore = null;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => { root.unmount(); });
  container.remove();
  vi.useRealTimers();
});

// ── AC-T1: mount scan emits for already-past dueDate ─────────────────────────
describe("AC-T1: mount scan emits for past-due todo", () => {
  it("emits productivity:todo-due exactly once on mount for a yesterday todo", async () => {
    const yesterday = isoDay(-1);
    const adapter = makeMemAdapter([makeTodo({ dueDate: yesterday })]);

    renderProvider(adapter);
    // Wait for adapter getAll() to resolve
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event] = emitEventMock.mock.calls[0] as [string, unknown];
    expect(event).toBe("productivity:todo-due");
  });
});

// ── AC-T2: future boundary scheduled emit ────────────────────────────────────
describe("AC-T2: scheduled emit fires when future boundary is crossed", () => {
  it("emits when fake time advances past end-of-today boundary", async () => {
    // Set system time to start of today so end-of-day is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    vi.setSystemTime(today);

    const todayStr = today.toISOString().slice(0, 10);
    const adapter = makeMemAdapter([makeTodo({ dueDate: todayStr, status: "open" })]);

    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    // End-of-day boundary is 23:59:59 — advance past it
    act(() => { vi.advanceTimersByTime(24 * 60 * 60 * 1000); });
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event] = emitEventMock.mock.calls[0] as [string, unknown];
    expect(event).toBe("productivity:todo-due");
  });
});

// ── AC-T3: re-render does not re-emit ────────────────────────────────────────
describe("AC-T3: re-render does not re-emit for same (todoId, dueDate)", () => {
  it("does not emit again on unrelated parent state change", async () => {
    const yesterday = isoDay(-1);
    const adapter = makeMemAdapter([makeTodo({ dueDate: yesterday })]);

    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    emitEventMock.mockClear();

    // Re-render with same adapter (simulates parent state change)
    act(() => {
      root.render(
        <TodoStoreProvider adapter={adapter}>
          <Capture />
        </TodoStoreProvider>,
      );
    });
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-T4: status → done does not re-emit ────────────────────────────────────
describe("AC-T4: status done prevents re-emit", () => {
  it("no emit after status is set to done", async () => {
    const yesterday = isoDay(-1);
    const adapter = makeMemAdapter([makeTodo({ dueDate: yesterday })]);

    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    // Emitted once at mount
    expect(emitEventMock).toHaveBeenCalledTimes(1);
    emitEventMock.mockClear();

    // Mark done
    await act(async () => { await capturedStore!.setStatus("todo-test-1", "done"); });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-T5: new dueDate re-emits under new key ─────────────────────────────────
describe("AC-T5: updating dueDate produces a new emit when boundary crosses", () => {
  it("emits again after dueDate updated to a new future date and boundary crossed", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    vi.setSystemTime(today);

    // Start with a past-due todo — emits immediately at mount
    const yesterday = isoDay(-1);
    const adapter = makeMemAdapter([makeTodo({ dueDate: yesterday, status: "open" })]);

    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    emitEventMock.mockClear();

    // Update dueDate to tomorrow (future)
    const tomorrow = isoDay(1);
    await act(async () => {
      await capturedStore!.updateTodo("todo-test-1", { dueDate: tomorrow });
    });

    // Advance past the new end-of-day boundary (tomorrow 23:59:59)
    act(() => { vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000); });
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.dueDate).toBe(tomorrow);
  });
});

// ── AC-T6: todo without dueDate never emits ──────────────────────────────────
describe("AC-T6: no dueDate means no emit", () => {
  it("does not emit for a todo without a dueDate", async () => {
    const adapter = makeMemAdapter([makeTodo({ dueDate: undefined })]);

    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-T7: payload shape ──────────────────────────────────────────────────────
describe("AC-T7: payload contains required fields", () => {
  it("payload has todoId, title, dueDate, quadrant, dueBoundaryAt", async () => {
    const yesterday = isoDay(-1);
    const adapter = makeMemAdapter([
      makeTodo({ id: "todo-shape", title: "Shape test", dueDate: yesterday, quadrant: "do" }),
    ]);

    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("productivity:todo-due");
    expect(payload.todoId).toBe("todo-shape");
    expect(payload.title).toBe("Shape test");
    expect(payload.dueDate).toBe(yesterday);
    expect(payload.quadrant).toBe("do");
    expect(typeof payload.dueBoundaryAt).toBe("string");
    expect(() => new Date(payload.dueBoundaryAt as string).toISOString()).not.toThrow();
  });
});
