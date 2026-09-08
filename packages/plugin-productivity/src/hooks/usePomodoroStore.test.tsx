// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));

import { emitEvent } from "@repo/core/events";
import { PomodoroStoreProvider, usePomodoroStore } from "./usePomodoroStore";
import type { PomodoroStore } from "./usePomodoroStore";
import type { DataAdapter, PomodoroSettings } from "../types";

const emitEventMock = vi.mocked(emitEvent);

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
};

// ── Minimal in-memory adapter ────────────────────────────────────────────────
interface PomodoroRecord {
  id: string;
  mode: "focus" | "short-break" | "long-break";
  status: "idle" | "running" | "paused" | "completed";
  activeTodoId: string | null;
  remainingSeconds: number;
  cyclesCompleted: number;
  lastCompletedTodoId: string | null;
  lastCompletedAt: string | null;
  settings: PomodoroSettings;
}

function makeMemAdapter(initial?: PomodoroRecord): DataAdapter<PomodoroRecord> {
  const store = new Map<string, PomodoroRecord>();
  if (initial) store.set(initial.id, initial);
  return {
    getAll: async () => [...store.values()],
    getById: async (id) => store.get(id) ?? null,
    save: async (item) => { store.set(item.id, item); },
    delete: async (id) => { store.delete(id); },
  };
}

function makeShortBreakAdapter(): DataAdapter<PomodoroRecord> {
  return makeMemAdapter({
    id: "pomodoro-session-current",
    mode: "short-break",
    status: "running",       // will be coerced to "paused" on hydration
    activeTodoId: null,
    remainingSeconds: DEFAULT_SETTINGS.shortBreakMinutes * 60,
    cyclesCompleted: 1,
    lastCompletedTodoId: null,
    lastCompletedAt: null,
    settings: DEFAULT_SETTINGS,
  });
}

function makeLongBreakAdapter(): DataAdapter<PomodoroRecord> {
  return makeMemAdapter({
    id: "pomodoro-session-current",
    mode: "long-break",
    status: "running",       // will be coerced to "paused" on hydration
    activeTodoId: null,
    remainingSeconds: DEFAULT_SETTINGS.longBreakMinutes * 60,
    cyclesCompleted: 4,
    lastCompletedTodoId: null,
    lastCompletedAt: null,
    settings: DEFAULT_SETTINGS,
  });
}

// ── Test harness ─────────────────────────────────────────────────────────────
let container: HTMLDivElement;
let root: Root;
let capturedStore: PomodoroStore | null = null;

function Capture() {
  capturedStore = usePomodoroStore();
  return null;
}

function renderProvider(adapter = makeMemAdapter()) {
  act(() => {
    root.render(
      <PomodoroStoreProvider adapter={adapter as never}>
        <Capture />
      </PomodoroStoreProvider>,
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

// ── Helper: advance the timer N seconds ──────────────────────────────────────
function advanceSeconds(n: number) {
  act(() => { vi.advanceTimersByTime(n * 1000); });
}

// ── AC-P1: focus completion emits once with correct payload ──────────────────
describe("AC-P1: focus session completion", () => {
  it("emits productivity:pomodoro-completed once with focus payload", async () => {
    renderProvider();
    // Wait for adapter hydration microtask
    await act(async () => { await Promise.resolve(); });

    act(() => { capturedStore!.start("todo-abc"); });

    // Advance 25 minutes (1500 ticks → completed)
    advanceSeconds(25 * 60);

    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("productivity:pomodoro-completed");
    expect(payload.mode).toBe("focus");
    expect(payload.cyclesCompleted).toBe(1);
    expect(payload.linkedTodoId).toBe("todo-abc");
    expect(payload.durationMs).toBe(25 * 60 * 1000);
    expect(typeof payload.completedAt).toBe("string");
    expect(() => new Date(payload.completedAt as string).toISOString()).not.toThrow();
  });
});

// ── AC-P2: short-break completion ────────────────────────────────────────────
describe("AC-P2: short-break completion", () => {
  it("emits with mode short-break and linkedTodoId null", async () => {
    // Seed adapter with a short-break session already in progress
    renderProvider(makeShortBreakAdapter() as never);
    // Wait for hydration (status becomes "paused")
    await act(async () => { await Promise.resolve(); });

    // Resume the break
    act(() => { capturedStore!.resume(); });

    // Advance 5 minutes
    advanceSeconds(5 * 60);
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("productivity:pomodoro-completed");
    expect(payload.mode).toBe("short-break");
    expect(payload.linkedTodoId).toBeNull();
    expect(payload.durationMs).toBe(5 * 60 * 1000);
  });
});

// ── AC-P3: long-break completion ─────────────────────────────────────────────
describe("AC-P3: long-break completion", () => {
  it("emits with mode long-break", async () => {
    // Seed adapter with a long-break session already in progress
    renderProvider(makeLongBreakAdapter() as never);
    await act(async () => { await Promise.resolve(); });

    // Resume the long-break
    act(() => { capturedStore!.resume(); });

    // Advance 15 minutes
    advanceSeconds(15 * 60);
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("productivity:pomodoro-completed");
    expect(payload.mode).toBe("long-break");
    expect(payload.durationMs).toBe(15 * 60 * 1000);
  });
});

// ── AC-P4: dedup — same lastCompletedAt does not re-emit ─────────────────────
describe("AC-P4: dedup on re-render / Strict-Mode-like double effect", () => {
  it("does not re-emit when state is rendered again with the same lastCompletedAt", async () => {
    renderProvider();
    await act(async () => { await Promise.resolve(); });

    act(() => { capturedStore!.start(); });
    advanceSeconds(25 * 60);
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);

    // Force a parent re-render without changing the session
    act(() => {
      root.render(
        <PomodoroStoreProvider>
          <Capture />
        </PomodoroStoreProvider>,
      );
    });
    await act(async () => { await Promise.resolve(); });

    // Still only 1 call
    expect(emitEventMock).toHaveBeenCalledTimes(1);
  });
});

// ── AC-P5: reset does NOT emit ────────────────────────────────────────────────
describe("AC-P5: reset does not emit", () => {
  it("calling reset() does not produce an emit", async () => {
    renderProvider();
    await act(async () => { await Promise.resolve(); });

    act(() => { capturedStore!.reset(); });
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-P6: skip does NOT emit ─────────────────────────────────────────────────
describe("AC-P6: skip does not emit", () => {
  it("calling skip() sets status idle (not completed) and does not emit", async () => {
    renderProvider();
    await act(async () => { await Promise.resolve(); });

    act(() => { capturedStore!.start(); });
    // Skip mid-session
    act(() => { capturedStore!.skip(); });
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});
