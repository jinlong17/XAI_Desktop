// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));

import { emitEvent } from "@repo/core/events";
import { HabitStoreProvider, useHabitStore } from "./useHabitStore";
import type { HabitStore } from "./useHabitStore";
import type { DataAdapter, Habit } from "../types";

const emitEventMock = vi.mocked(emitEvent);

// ── UTC day helper ────────────────────────────────────────────────────────────
function utcDay(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// ── Minimal in-memory adapter ────────────────────────────────────────────────
function makeMemAdapter(seed: Habit[] = []): DataAdapter<Habit> {
  const store = new Map<string, Habit>(seed.map((h) => [h.id, h]));
  return {
    getAll: async () => [...store.values()],
    getById: async (id) => store.get(id) ?? null,
    save: async (item) => { store.set(item.id, item); },
    delete: async (id) => { store.delete(id); },
  };
}

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  const now = new Date().toISOString();
  return {
    id: "habit-test-1",
    entityType: "productivity.habit",
    schemaVersion: 1,
    syncScope: "account-sync",
    name: "Morning run",
    frequency: "daily",
    streak: 0,
    history: [],
    labels: [],
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides,
  };
}

// ── Test harness ─────────────────────────────────────────────────────────────
let container: HTMLDivElement;
let root: Root;
let capturedStore: HabitStore | null = null;

function Capture() {
  capturedStore = useHabitStore();
  return null;
}

function renderProvider(adapter: DataAdapter<Habit>) {
  act(() => {
    root.render(
      <HabitStoreProvider adapter={adapter}>
        <Capture />
      </HabitStoreProvider>,
    );
  });
}

beforeEach(() => {
  emitEventMock.mockClear();
  capturedStore = null;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => { root.unmount(); });
  container.remove();
});

// ── AC-H1: checkIn emits once with correct payload ────────────────────────────
describe("AC-H1: checkIn emits productivity:habit-reminder with correct payload", () => {
  it("emits exactly once with habitId, name, frequency, date, streak, completedAt", async () => {
    const adapter = makeMemAdapter([makeHabit()]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    const today = utcDay(0);
    await act(async () => { await capturedStore!.checkIn("habit-test-1", today); });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("productivity:habit-reminder");
    expect(payload.habitId).toBe("habit-test-1");
    expect(payload.name).toBe("Morning run");
    expect(payload.frequency).toBe("daily");
    expect(payload.date).toBe(today);
    expect(typeof payload.streak).toBe("number");
    expect(typeof payload.completedAt).toBe("string");
    expect(() => new Date(payload.completedAt as string).toISOString()).not.toThrow();
  });
});

// ── AC-H2: same-day duplicate checkIn does not re-emit ───────────────────────
describe("AC-H2: same-day checkIn twice emits only once", () => {
  it("second checkIn on same date does not produce a second emit", async () => {
    const adapter = makeMemAdapter([makeHabit()]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    const today = utcDay(0);
    await act(async () => { await capturedStore!.checkIn("habit-test-1", today); });
    expect(emitEventMock).toHaveBeenCalledTimes(1);

    emitEventMock.mockClear();

    // Second checkIn on same day (increments count past 1)
    await act(async () => { await capturedStore!.checkIn("habit-test-1", today); });
    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-H3: different dates produce two separate emits ────────────────────────
describe("AC-H3: different dates produce separate emits", () => {
  it("checkIn on two different dates emits twice", async () => {
    const adapter = makeMemAdapter([makeHabit()]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    const day1 = utcDay(0);
    const day2 = utcDay(1);

    await act(async () => { await capturedStore!.checkIn("habit-test-1", day1); });
    await act(async () => { await capturedStore!.checkIn("habit-test-1", day2); });

    expect(emitEventMock).toHaveBeenCalledTimes(2);
    const firstCall = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    const secondCall = emitEventMock.mock.calls[1] as [string, Record<string, unknown>];
    expect(firstCall[1].date).toBe(day1);
    expect(secondCall[1].date).toBe(day2);
  });
});

// ── AC-H4: updateHabit / deleteHabit / createHabit do NOT emit ───────────────
describe("AC-H4: non-checkIn operations do not emit", () => {
  it("createHabit does not emit", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      await capturedStore!.createHabit({ name: "New habit", frequency: "weekly" });
    });
    expect(emitEventMock).not.toHaveBeenCalled();
  });

  it("updateHabit does not emit", async () => {
    const adapter = makeMemAdapter([makeHabit()]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      await capturedStore!.updateHabit("habit-test-1", { name: "Updated name" });
    });
    expect(emitEventMock).not.toHaveBeenCalled();
  });

  it("deleteHabit does not emit", async () => {
    const adapter = makeMemAdapter([makeHabit()]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      await capturedStore!.deleteHabit("habit-test-1");
    });
    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-H5: streak in payload is post-persist value ───────────────────────────
describe("AC-H5: streak reflects post-checkIn value", () => {
  it("streak in payload is >= 1 after first checkIn", async () => {
    // Seed with a habit that has yesterday's check-in so streak will be 1 after today's
    const yesterday = utcDay(-1);
    const adapter = makeMemAdapter([
      makeHabit({
        streak: 1,
        history: [{ date: yesterday, count: 1, completedAt: new Date().toISOString() }],
      }),
    ]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    const today = utcDay(0);
    await act(async () => { await capturedStore!.checkIn("habit-test-1", today); });

    const [, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    // Streak should now be 2 (yesterday + today consecutive)
    expect(payload.streak).toBe(2);
  });

  it("streak value matches the store's post-persist value", async () => {
    const adapter = makeMemAdapter([makeHabit({ streak: 0, history: [] })]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    const today = utcDay(0);
    await act(async () => { await capturedStore!.checkIn("habit-test-1", today); });

    const [, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    // After first check-in today streak is 1 (or 0 if calculated from scratch)
    expect(typeof payload.streak).toBe("number");
    // The payload streak must be >= 0
    expect(payload.streak as number).toBeGreaterThanOrEqual(0);

    // Cross-check with the store
    const storeHabit = capturedStore!.getHabitById("habit-test-1");
    expect(payload.streak).toBe(storeHabit?.streak);
  });
});
