// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConsoleViewCapabilities } from "@repo/core/types";
import { TodoWebModuleRoute } from "./TodoWebModuleRoute";

type RuntimeRecord = {
  id: string;
  entityType: "productivity.todo";
  schemaVersion: 1;
  syncScope: "account-sync";
  title: string;
  done: boolean;
  labelIds: string[];
  dueAt?: string;
  notes?: string;
  projectId?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const repoByScope = new Map<string, Map<string, RuntimeRecord>>();
const repoInitCalls: Array<{ accountId: string; deviceId: string; fetchSync: typeof mockFetchSync }> = [];

let idCounter = 1;
let cryptoSnapshot: { dekBase64?: string; keyId?: number; encryptionDeviceId?: string } | null = null;

const mockFetchSync = vi.fn(async () => new Response(JSON.stringify({ rows: [] }), { status: 200 }));

function scopeKey(accountId: string, deviceId: string): string {
  return `${accountId}::${deviceId}`;
}

function ensureScope(accountId: string, deviceId: string): Map<string, RuntimeRecord> {
  const key = scopeKey(accountId, deviceId);
  const current = repoByScope.get(key);
  if (current) {
    return current;
  }

  const created = new Map<string, RuntimeRecord>();
  repoByScope.set(key, created);
  return created;
}

function isoDay(offsetDays = 0): string {
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString();
}

function seedTodoFixtureRows(accountId: string, deviceId: string, count: number): void {
  const store = ensureScope(accountId, deviceId);
  for (let index = 0; index < count; index += 1) {
    const done = index % 5 === 0;
    const deleted = index % 10 === 0;
    store.set(`fixture-${index}`, {
      id: `fixture-${index}`,
      entityType: "productivity.todo",
      schemaVersion: 1,
      syncScope: "account-sync",
      title: `Fixture Todo ${String(index + 1).padStart(2, "0")}`,
      done,
      labelIds: [],
      dueAt: index % 3 === 0 ? isoDay(0) : isoDay(1),
      notes: `fixture-note-${index}`,
      createdAt: new Date(Date.now() + index * 1000).toISOString(),
      updatedAt: new Date(Date.now() + index * 1000).toISOString(),
      deletedAt: deleted ? isoDay(0) : undefined,
    });
  }
}

vi.mock("./browserTodoRepo", () => ({
  createBrowserTodoRepo: ({
    accountId,
    deviceId,
    fetchSync,
  }: {
    accountId?: string;
    deviceId?: string;
    fetchSync?: typeof mockFetchSync;
  }) => {
    if (!accountId || !deviceId || !fetchSync) {
      throw new Error("todo_device_session_missing");
    }

    repoInitCalls.push({ accountId, deviceId, fetchSync });
    const store = ensureScope(accountId, deviceId);

    return {
      pull: async () => undefined,
      list: async ({ entityType }: { entityType: string }) =>
        Array.from(store.values())
          .filter((record) => record.entityType === entityType)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
      get: async (id: string) => store.get(id) ?? null,
      put: async (record: RuntimeRecord) => {
        store.set(record.id, { ...record });
      },
      delete: async (id: string) => {
        store.delete(id);
      },
    };
  },
  createWebTodoId: () => `todo-${idCounter++}`,
  isTodoWriteReady: () => Boolean(cryptoSnapshot?.dekBase64) && typeof cryptoSnapshot?.keyId === "number" && cryptoSnapshot.keyId > 0,
  isDeleted: (record: RuntimeRecord) => typeof record.deletedAt === "string" && record.deletedAt.length > 0,
  isToday: (dueAt?: string) => {
    if (!dueAt) {
      return false;
    }
    return dueAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
  },
}));

interface Mounted {
  container: HTMLDivElement;
  root: Root;
}

function createCapabilities(): ConsoleViewCapabilities {
  return {
    navigate: () => {},
    openSettings: () => {},
    openCommandPalette: () => {},
    focusPane: () => {},
    persistState: async () => {},
    requestReconcile: async () => {},
    download: async () => ({ ok: true, value: undefined }),
    notify: async () => ({ ok: true, value: undefined }),
    registerShortcut: () => ({ ok: true, value: () => {} }),
    beginDrag: async () => ({ ok: true, value: undefined }),
    invokeNativeCapability: async () => ({ ok: true, value: undefined }),
    status: () => "supported",
  };
}

async function mount(childPath: string): Promise<Mounted> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <TodoWebModuleRoute
        moduleId="todos"
        childPath={childPath}
        capabilities={createCapabilities()}
      />,
    );
  });

  return { container, root };
}

async function unmount(app: Mounted): Promise<void> {
  await act(async () => {
    app.root.unmount();
  });
  app.container.remove();
}

function findButton(container: HTMLElement, label: string): HTMLButtonElement {
  const buttons = Array.from(container.querySelectorAll("button"));
  const match = buttons.find((button) => button.textContent?.trim() === label);
  if (!match) {
    throw new Error(`missing_button:${label}`);
  }
  return match;
}

function setInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = Object.getPrototypeOf(element) as HTMLInputElement | HTMLTextAreaElement;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

async function waitFor(check: () => void, timeoutMs = 500): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      check();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  check();
}

function setRuntimeSession(input: {
  authState: string;
  accountId?: string;
  deviceId?: string;
  fetchSync?: typeof mockFetchSync;
}): void {
  const runtime = globalThis as {
    __XAI_WEB_TODO_SESSION__?: {
      authState: string;
      accountId?: string;
      deviceId?: string;
      fetchSync?: typeof mockFetchSync;
    };
  };
  runtime.__XAI_WEB_TODO_SESSION__ = {
    authState: input.authState,
    accountId: input.accountId,
    deviceId: input.deviceId,
    fetchSync: input.fetchSync,
  };
}

function setRuntimeCrypto(input: { dekBase64: string; keyId: number; encryptionDeviceId?: string } | null): void {
  cryptoSnapshot = input;
  const runtime = globalThis as {
    __XAI_WEB_TODO_CRYPTO__?: { dekBase64: string; keyId: number; encryptionDeviceId?: string };
  };
  if (input) {
    runtime.__XAI_WEB_TODO_CRYPTO__ = input;
    return;
  }
  delete runtime.__XAI_WEB_TODO_CRYPTO__;
}

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  repoByScope.clear();
  repoInitCalls.length = 0;
  idCounter = 1;
  setRuntimeCrypto(null);
  mockFetchSync.mockClear();
});

afterEach(() => {
  document.body.innerHTML = "";
  const runtime = globalThis as { __XAI_WEB_TODO_SESSION__?: unknown; __XAI_WEB_TODO_CRYPTO__?: unknown };
  delete runtime.__XAI_WEB_TODO_SESSION__;
  delete runtime.__XAI_WEB_TODO_CRYPTO__;
});

describe("TodoWebModuleRoute", () => {
  it("wires account/device/fetch and supports CRUD plus deep-link restore", async () => {
    setRuntimeSession({
      authState: "authenticated",
      accountId: "account-1",
      deviceId: "device-1",
      fetchSync: mockFetchSync,
    });
    setRuntimeCrypto({
      dekBase64: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      keyId: 2,
      encryptionDeviceId: "device-1",
    });

    const app = await mount("smart:inbox");

    await waitFor(() => {
      expect(app.container.textContent).toContain("todo_runtime_ready");
    });

    expect(repoInitCalls[0]).toMatchObject({
      accountId: "account-1",
      deviceId: "device-1",
      fetchSync: mockFetchSync,
    });

    const titleInput = app.container.querySelector("input[placeholder='Title']") as HTMLInputElement;
    const notesInput = app.container.querySelector("textarea[placeholder='Notes']") as HTMLTextAreaElement;

    await act(async () => {
      setInputValue(titleInput, "Ship W7");
      setInputValue(notesInput, "Route + repo wiring");
      findButton(app.container, "Create").click();
    });

    await waitFor(() => {
      expect(app.container.textContent).toContain("Ship W7");
    });

    await act(async () => {
      findButton(app.container, "Complete").click();
    });

    const todoScope = ensureScope("account-1", "device-1");
    const createdRecord = Array.from(todoScope.values()).find((record) => record.title === "Ship W7");
    expect(createdRecord?.done).toBe(true);

    await unmount(app);

    const doneDetail = await mount(`smart:done/${createdRecord?.id}`);
    await waitFor(() => {
      expect(doneDetail.container.textContent).toContain(`todoId: ${createdRecord?.id}`);
      expect(doneDetail.container.textContent).toContain("Ship W7");
    });

    const detailTitleInput = doneDetail.container.querySelector("input[aria-label='Selected todo title']") as HTMLInputElement;
    await act(async () => {
      setInputValue(detailTitleInput, "Ship W7 patched");
    });

    await waitFor(() => {
      expect(doneDetail.container.textContent).toContain("Ship W7 patched");
    });

    await act(async () => {
      findButton(doneDetail.container, "Delete").click();
    });

    const deletedRecord = todoScope.get(createdRecord?.id ?? "");
    expect(typeof deletedRecord?.deletedAt).toBe("string");

    await unmount(doneDetail);

    const app2 = await mount("smart:inbox");
    const titleInput2 = app2.container.querySelector("input[placeholder='Title']") as HTMLInputElement;
    await act(async () => {
      setInputValue(titleInput2, "Deep link todo");
      findButton(app2.container, "Create").click();
    });

    const deepLinkRecord = Array.from(todoScope.values()).find((record) => record.title === "Deep link todo");
    expect(deepLinkRecord).toBeDefined();

    await unmount(app2);

    const restored = await mount(`smart:inbox/${deepLinkRecord?.id}`);
    await waitFor(() => {
      expect(restored.container.textContent).toContain(`todoId: ${deepLinkRecord?.id}`);
      expect(restored.container.textContent).toContain("Deep link todo");
    });
    await unmount(restored);
  });

  it("stays locked when crypto snapshot is unavailable", async () => {
    setRuntimeSession({
      authState: "authenticated",
      accountId: "account-2",
      deviceId: "device-2",
      fetchSync: mockFetchSync,
    });
    setRuntimeCrypto(null);

    const app = await mount("smart:inbox");
    await waitFor(() => {
      expect(app.container.textContent).toContain("todo_crypto_locked:unlock_required_for_writes");
    });

    const createButton = findButton(app.container, "Create");
    expect(createButton.disabled).toBe(true);

    await unmount(app);
  });

  it("covers 0-row and 50-row fixture matrix for downstream seed lanes", async () => {
    const accountId = "fixture-account";
    const deviceId = "fixture-device";

    setRuntimeSession({
      authState: "authenticated",
      accountId,
      deviceId,
      fetchSync: mockFetchSync,
    });
    setRuntimeCrypto({
      dekBase64: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      keyId: 3,
      encryptionDeviceId: deviceId,
    });

    const empty = await mount("smart:inbox");
    await waitFor(() => {
      expect(empty.container.textContent).toContain("todo_runtime_ready");
    });
    expect(empty.container.querySelectorAll("article").length).toBe(0);
    expect(empty.container.textContent).toContain("No todo selected.");
    await unmount(empty);

    seedTodoFixtureRows(accountId, deviceId, 50);

    const inbox = await mount("smart:inbox");
    await waitFor(() => {
      expect(inbox.container.textContent).toContain("Fixture Todo 50");
    });
    expect(inbox.container.querySelectorAll("article").length).toBe(40);
    await unmount(inbox);

    const done = await mount("smart:done");
    await waitFor(() => {
      expect(done.container.textContent).toContain("Fixture Todo");
    });
    expect(done.container.querySelectorAll("article").length).toBe(5);
    await unmount(done);

    const today = await mount("smart:today");
    await waitFor(() => {
      expect(today.container.textContent).toContain("Fixture Todo");
    });
    expect(today.container.querySelectorAll("article").length).toBe(13);
    await unmount(today);
  });
});
