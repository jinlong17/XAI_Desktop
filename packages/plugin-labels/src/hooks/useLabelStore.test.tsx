// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));

import { emitEvent } from "@repo/core/events";
import { LabelStoreProvider, useLabelStore } from "./useLabelStore";
import type { DataAdapter, Label, LabelStore } from "../types";

const emitEventMock = vi.mocked(emitEvent);

// ── In-memory adapter ─────────────────────────────────────────────────────────
function makeMemAdapter(seed: Label[] = []): DataAdapter<Label> {
  const store = new Map<string, Label>(seed.map((l) => [l.id, l]));
  return {
    getAll: async () => [...store.values()],
    getById: async (id) => store.get(id) ?? null,
    save: async (item) => { store.set(item.id, item); },
    delete: async (id) => { store.delete(id); },
  };
}

function makeLabel(overrides: Partial<Label> = {}): Label {
  const now = new Date().toISOString();
  return {
    id: "label-test-1",
    entityType: "labels.label",
    schemaVersion: 1,
    syncScope: "account-sync",
    name: "Test Label",
    color: "#2563eb",
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides,
  };
}

// ── Test harness ──────────────────────────────────────────────────────────────
let container: HTMLDivElement;
let root: Root;
let capturedStore: LabelStore | null = null;

function Capture() {
  capturedStore = useLabelStore();
  return null;
}

function renderProvider(adapter: DataAdapter<Label>) {
  act(() => {
    root.render(
      <LabelStoreProvider adapter={adapter}>
        <Capture />
      </LabelStoreProvider>,
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

// ── AC-L-C1: createLabel success emits labels:created ────────────────────────
describe("AC-L-C1: createLabel success emits labels:created", () => {
  it("emits labels:created with correct payload", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.createLabel({ name: "Focus", color: "#2563eb" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("labels:created");
    expect(payload.id).toBeTruthy();
    expect(payload.name).toBe("Focus");
    expect(payload.color).toBe("#2563eb");
    expect(payload.entityType).toBe("labels.label");
    expect(payload.version).toBe(1);
    expect(() => new Date(payload.createdAt as string)).not.toThrow();
    expect(new Date(payload.createdAt as string).toISOString()).toBe(payload.createdAt);
  });
});

// ── AC-L-C2: createLabel with whitespace name — trimmed in payload ────────────
describe("AC-L-C2: createLabel trims whitespace in emitted payload", () => {
  it("payload.name is trimmed and color is a non-empty hex fallback", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.createLabel({ name: "  Focus  " });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.name).toBe("Focus");
    expect(typeof payload.color).toBe("string");
    expect((payload.color as string).length).toBeGreaterThan(0);
  });
});

// ── AC-L-C3: createLabel with empty name throws and does not emit ─────────────
describe("AC-L-C3: createLabel with empty name — no emit", () => {
  it("throws and emitEvent is not called", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await expect(capturedStore!.createLabel({ name: "" })).rejects.toThrow("Label name is required");
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-L-C4: createLabel with adapter.save rejection — no emit ───────────────
describe("AC-L-C4: createLabel when adapter.save rejects — no emit", () => {
  it("propagates rejection and does not emit", async () => {
    const adapter = makeMemAdapter();
    const saveError = new Error("save failed");
    adapter.save = vi.fn(async () => { throw saveError; });
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await expect(capturedStore!.createLabel({ name: "Focus" })).rejects.toThrow("save failed");
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-L-U1: updateLabel success emits labels:updated ────────────────────────
describe("AC-L-U1: updateLabel success emits labels:updated", () => {
  it("emits labels:updated with correct bumped version and name", async () => {
    const seed = makeLabel({ id: "label-1", name: "Original", version: 3 });
    const adapter = makeMemAdapter([seed]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.updateLabel("label-1", { name: "Renamed" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("labels:updated");
    expect(payload.id).toBe("label-1");
    expect(payload.name).toBe("Renamed");
    expect(payload.version).toBe(4); // bumped: 3 + 1
    expect(payload.color).toBe(seed.color);
    expect(() => new Date(payload.updatedAt as string)).not.toThrow();
    expect(new Date(payload.updatedAt as string).toISOString()).toBe(payload.updatedAt);
  });
});

// ── AC-L-U2: updateLabel with stale id — silent no-op, no emit ───────────────
describe("AC-L-U2: updateLabel with stale id — no emit", () => {
  it("silent no-op: emitEvent not called for missing id", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.updateLabel("missing-id", { name: "Whatever" });
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-L-D1: deleteLabel success emits labels:deleted ────────────────────────
describe("AC-L-D1: deleteLabel success emits labels:deleted", () => {
  it("emits labels:deleted with pre-read version and parseable deletedAt", async () => {
    const seed = makeLabel({ id: "label-2", version: 5 });
    const adapter = makeMemAdapter([seed]);
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.deleteLabel("label-2");
    });

    expect(emitEventMock).toHaveBeenCalledTimes(1);
    const [event, payload] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(event).toBe("labels:deleted");
    expect(payload.id).toBe("label-2");
    expect(payload.version).toBe(5); // pre-read version, not bumped
    expect(() => new Date(payload.deletedAt as string)).not.toThrow();
    expect(new Date(payload.deletedAt as string).toISOString()).toBe(payload.deletedAt);
  });
});

// ── AC-L-D2: deleteLabel with stale id — silent no-op, no emit ───────────────
describe("AC-L-D2: deleteLabel with stale id — no emit", () => {
  it("silent no-op: emitEvent not called for missing id", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.deleteLabel("missing-id");
    });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-L-G1: two successive createLabel calls emit twice ─────────────────────
describe("AC-L-G1: two successive createLabel calls emit twice with distinct ids", () => {
  it("emitEvent called twice, payloads have distinct ids", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();
    await act(async () => {
      await capturedStore!.createLabel({ name: "Alpha" });
      await capturedStore!.createLabel({ name: "Beta" });
    });

    expect(emitEventMock).toHaveBeenCalledTimes(2);
    const [, p1] = emitEventMock.mock.calls[0] as [string, Record<string, unknown>];
    const [, p2] = emitEventMock.mock.calls[1] as [string, Record<string, unknown>];
    expect(p1.id).toBeTruthy();
    expect(p2.id).toBeTruthy();
    expect(p1.id).not.toBe(p2.id);
  });
});

// ── AC-L-G2: provider re-render without action does not emit ─────────────────
describe("AC-L-G2: provider re-render without action does not emit", () => {
  it("no emit between two successive root.render calls with same adapter", async () => {
    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    emitEventMock.mockClear();

    // Re-render same tree without any store action
    act(() => {
      root.render(
        <LabelStoreProvider adapter={adapter}>
          <Capture />
        </LabelStoreProvider>,
      );
    });
    await act(async () => { await Promise.resolve(); });

    expect(emitEventMock).not.toHaveBeenCalled();
  });
});

// ── AC-L-G3: non-Tauri runtime — emitEvent rejects, operation still succeeds ─
describe("AC-L-G3: non-Tauri runtime — emitEvent rejects, createLabel still resolves", () => {
  it("operation succeeds even when emitEvent returns a rejected promise", async () => {
    // Use mockImplementation so the rejection is created lazily (when called),
    // allowing .catch(() => undefined) in the store to attach before microtask
    // processing — preventing an unhandled-rejection warning in the test runner.
    emitEventMock.mockImplementation(() => Promise.reject(new Error("not tauri")));

    const adapter = makeMemAdapter();
    renderProvider(adapter);
    await act(async () => { await Promise.resolve(); });

    let label: Label | undefined;
    // Must not throw or cause unhandled rejection
    await act(async () => {
      label = await capturedStore!.createLabel({ name: "Test" });
    });

    expect(label).toBeDefined();
    expect(label!.name).toBe("Test");
    expect(emitEventMock).toHaveBeenCalledTimes(1);
  });
});
