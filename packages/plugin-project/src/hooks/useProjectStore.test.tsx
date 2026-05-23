// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));

import { emitEvent } from "@repo/core/events";
import { ProjectStoreProvider, useProjectStore } from "./useProjectStore";
import type { Card, DataAdapter, Project } from "../types";
import type { ProjectStore } from "./useProjectStore";

const emitEventMock = vi.mocked(emitEvent);

// ── In-memory adapters ─────────────────────────────────────────────────────────
function makeProjectAdapter(seed: Project[] = []): DataAdapter<Project> {
  const store = new Map<string, Project>(seed.map((p) => [p.id, p]));
  return {
    getAll: async () => [...store.values()],
    getById: async (id) => store.get(id) ?? null,
    save: async (item) => { store.set(item.id, item); },
    delete: async (id) => { store.delete(id); },
  };
}

function makeCardAdapter(seed: Card[] = []): DataAdapter<Card> {
  const store = new Map<string, Card>(seed.map((c) => [c.id, c]));
  return {
    getAll: async () => [...store.values()],
    getById: async (id) => store.get(id) ?? null,
    save: async (item) => { store.set(item.id, item); },
    delete: async (id) => { store.delete(id); },
  };
}

function makeCard(overrides: Partial<Card> = {}): Card {
  const now = new Date().toISOString();
  return {
    id: "card-seed-1",
    entityType: "project.card",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: "Seed Card",
    listId: "list-a",
    order: 0,
    labels: [],
    checklist: [],
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides,
  };
}

// ── Test harness ──────────────────────────────────────────────────────────────
let container: HTMLDivElement;
let root: Root;
let capturedStore: ProjectStore | null = null;

function Capture() {
  capturedStore = useProjectStore();
  return null;
}

function renderProvider(
  projectAdapter: DataAdapter<Project>,
  cardAdapter: DataAdapter<Card>,
) {
  act(() => {
    root.render(
      <ProjectStoreProvider projectAdapter={projectAdapter} cardAdapter={cardAdapter}>
        <Capture />
      </ProjectStoreProvider>,
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

// ─────────────────────────────────────────────────────────────────────────────
// C bucket — createCard
// ─────────────────────────────────────────────────────────────────────────────

// ── AC-P-C1: createCard success emits project:card-created ───────────────────
describe("AC-P-C1: createCard success emits project:card-created", () => {
  it("emits project:card-created with correct payload", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    let card: Card | undefined;
    await act(async () => {
      card = await capturedStore!.createCard({ title: "New Task", listId: "list-a" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("project:card-created");
    expect(payload.id).toBe(card!.id);
    expect(payload.listId).toBe("list-a");
    expect(payload.title).toBe("New Task");
    expect(payload.order).toBe(0);
    expect(payload.entityType).toBe("project.card");
    expect(payload.version).toBe(1);
    expect(typeof payload.createdAt).toBe("string");
    expect(new Date(payload.createdAt as string).toISOString()).toBe(payload.createdAt);
  });
});

// ── AC-P-C2: createCard whitespace title is trimmed in payload ───────────────
describe("AC-P-C2: createCard trims whitespace in emitted payload", () => {
  it("payload.title is trimmed", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.createCard({ title: "  Plan  ", listId: "list-a" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.title).toBe("Plan");
  });
});

// ── AC-P-C3: createCard with empty title throws and does not emit ─────────────
describe("AC-P-C3: createCard with empty title — no emit", () => {
  it("throws and emitEvent is not called", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await expect(
        capturedStore!.createCard({ title: "", listId: "list-a" }),
      ).rejects.toThrow("Card title is required");
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-P-C4: createCard when adapter.save rejects — no emit ─────────────────
describe("AC-P-C4: createCard when adapter.save rejects — no emit", () => {
  it("propagates rejection and does not emit", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    const saveError = new Error("save failed");
    cardAdapter.save = vi.fn(async () => { throw saveError; });
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await expect(
        capturedStore!.createCard({ title: "Fail Card", listId: "list-a" }),
      ).rejects.toThrow("save failed");
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// M bucket — moveCard
// ─────────────────────────────────────────────────────────────────────────────

// ── AC-P-M1: moveCard to different list emits project:card-moved ─────────────
describe("AC-P-M1: moveCard to a different list emits project:card-moved", () => {
  it("emits once with correct from/to list and order values", async () => {
    const seed = makeCard({ id: "card-1", listId: "list-a", order: 0, version: 2 });
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter([seed]);
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.moveCard("card-1", "list-b", 0);
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("project:card-moved");
    expect(payload.id).toBe("card-1");
    expect(payload.fromListId).toBe("list-a");
    expect(payload.toListId).toBe("list-b");
    expect(payload.fromOrder).toBe(0);
    expect(payload.toOrder).toBe(0);
    expect(payload.version).toBe(3); // 2 + 1
    expect(typeof payload.updatedAt).toBe("string");
    expect(new Date(payload.updatedAt as string).toISOString()).toBe(payload.updatedAt);
  });
});

// ── AC-P-M2: moveCard within same list to different order emits once ──────────
describe("AC-P-M2: moveCard within the same list to a new order emits project:card-moved", () => {
  it("emits once with fromListId === toListId, fromOrder !== toOrder", async () => {
    const card0 = makeCard({ id: "card-a", listId: "list-x", order: 0, version: 1 });
    const card1 = makeCard({ id: "card-b", listId: "list-x", order: 1, version: 1, title: "Card B" });
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter([card0, card1]);
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    // Move card-a from order 0 to order 1 (after card-b)
    await act(async () => {
      await capturedStore!.moveCard("card-a", "list-x", 1);
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("project:card-moved");
    expect(payload.fromListId).toBe("list-x");
    expect(payload.toListId).toBe("list-x");
    expect(payload.fromOrder).toBe(0);
    expect(payload.toOrder).toBe(1);
  });
});

// ── AC-P-M3: moveCard no-op (same list, same order) does not emit ─────────────
describe("AC-P-M3: moveCard no-op — emitEvent not called", () => {
  it("dirty array is empty so emitEvent is not called", async () => {
    // Single card in list-a at order 0 — moving to same position is a no-op
    const seed = makeCard({ id: "card-1", listId: "list-a", order: 0, version: 1 });
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter([seed]);
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.moveCard("card-1", "list-a", 0);
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-P-M4: moveCard with stale cardId — silent no-op, no emit ──────────────
describe("AC-P-M4: moveCard with stale cardId — no emit", () => {
  it("silent no-op when target not found", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.moveCard("nonexistent-card", "list-a", 0);
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// U bucket — updateCard
// ─────────────────────────────────────────────────────────────────────────────

// ── AC-P-U1: updateCard({ title }) emits project:card-updated ────────────────
describe("AC-P-U1: updateCard({ title }) emits project:card-updated", () => {
  it("emits once with patchKeys: ['title'], bumped version, ISO updatedAt", async () => {
    const seed = makeCard({ id: "card-1", listId: "list-a", version: 3 });
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter([seed]);
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.updateCard("card-1", { title: "Renamed" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("project:card-updated");
    expect(payload.id).toBe("card-1");
    expect(payload.listId).toBe("list-a");
    expect(payload.patchKeys).toEqual(["title"]);
    expect(payload.version).toBe(4); // 3 + 1
    expect(new Date(payload.updatedAt as string).toISOString()).toBe(payload.updatedAt);
  });
});

// ── AC-P-U2: updateCard with multiple keys emits sorted patchKeys ─────────────
describe("AC-P-U2: updateCard({ labels, dueDate }) emits sorted patchKeys", () => {
  it("patchKeys is ['dueDate', 'labels'] (sorted)", async () => {
    const seed = makeCard({ id: "card-1" });
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter([seed]);
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.updateCard("card-1", { labels: ["lbl-x"], dueDate: "2026-06-01" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.patchKeys).toEqual(["dueDate", "labels"]);
  });
});

// ── AC-P-U3: updateCard filters out non-allow-list keys ──────────────────────
describe("AC-P-U3: updateCard filters non-allow-list keys from patchKeys", () => {
  it("only allow-list survivor 'title' appears in patchKeys", async () => {
    const seed = makeCard({ id: "card-1" });
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter([seed]);
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      // Pass extra keys not in the allow-list; TypeScript will flag id/createdAt/schemaVersion
      // so cast through unknown to simulate a runtime call with extra keys.
      await capturedStore!.updateCard(
        "card-1",
        { title: "X", updatedAt: "ignored", version: 99 } as unknown as Partial<Omit<Card, "id">>,
      );
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.patchKeys).toEqual(["title"]);
  });
});

// ── AC-P-U4: updateChecklist routes through updateCard — single emit ──────────
describe("AC-P-U4: updateChecklist wrapper produces single project:card-updated emit", () => {
  it("emits once with patchKeys: ['checklist']", async () => {
    const seed = makeCard({ id: "card-1" });
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter([seed]);
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.updateChecklist("card-1", [
        { id: "ci-1", text: "Step 1", done: true },
      ]);
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("project:card-updated");
    expect(payload.patchKeys).toEqual(["checklist"]);
  });
});

// ── AC-P-U5: updateCard with stale id — silent no-op, no emit ────────────────
describe("AC-P-U5: updateCard with stale id — no emit", () => {
  it("silent no-op when card not found", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.updateCard("nonexistent-card", { title: "Whatever" });
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// G bucket — General
// ─────────────────────────────────────────────────────────────────────────────

// ── AC-P-G1: two successive createCard calls emit twice with distinct ids ─────
describe("AC-P-G1: two successive createCard calls emit twice with distinct ids", () => {
  it("emitEvent called twice, payloads have distinct ids", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.createCard({ title: "Alpha", listId: "list-a" });
      await capturedStore!.createCard({ title: "Beta", listId: "list-a" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(2);
    const [, p1] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    const [, p2] = emitEventMock.mock.calls[1] as [string, Record<string, unknown>];
    expect(p1.id).toBeTruthy();
    expect(p2.id).toBeTruthy();
    expect(p1.id).not.toBe(p2.id);
  });
});

// ── AC-P-G2: provider re-render without action does not emit ─────────────────
describe("AC-P-G2: provider re-render without action does not emit", () => {
  it("no emit between two successive root.render calls with same adapters", async () => {
    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();

    // Re-render same tree without any store action
    act(() => {
      root.render(
        <ProjectStoreProvider projectAdapter={projectAdapter} cardAdapter={cardAdapter}>
          <Capture />
        </ProjectStoreProvider>,
      );
    });
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-P-G3: non-Tauri runtime — emitEvent rejects, createCard still resolves ─
describe("AC-P-G3: non-Tauri runtime — emitEvent rejects, createCard still resolves", () => {
  it("operation succeeds even when emitEvent returns a rejected promise", async () => {
    // Use mockImplementation so the rejection is created lazily (when called),
    // allowing .catch(() => undefined) in the store to attach before microtask
    // processing — preventing an unhandled-rejection warning.
    emitEventMock.mockImplementation(() => Promise.reject(new Error("not tauri")));

    const projectAdapter = makeProjectAdapter();
    const cardAdapter = makeCardAdapter();
    renderProvider(projectAdapter, cardAdapter);
    await act(async () => { await Promise.resolve(); });

    let card: Card | undefined;
    // Must not throw or cause unhandled rejection
    await act(async () => {
      card = await capturedStore!.createCard({ title: "Test", listId: "list-a" });
    });

    expect(card).toBeDefined();
    expect(card!.title).toBe("Test");
    expect(emitEventMock).toHaveBeenCalledTimes(1);
  });
});
