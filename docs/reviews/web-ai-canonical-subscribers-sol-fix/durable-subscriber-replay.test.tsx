import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  accountScope,
  canonicalCommandReceiptId,
  generationMarkerKey,
  mutateCanonicalDataset,
  setCanonicalCommandActivationForTests,
} from "../../../packages/plugin-web-storage/src/index.js";
import { emitWebEvent, onWebEvent, type ToolWriteChannel, type WebEventMap } from "../../../packages/xai-web-event-bus/src/index.js";
import { useTaskCreateRequestSubscriber } from "../../../packages/xai-web-tasks/src/internal/aiCreateSubscriber.js";
import { useTaskMutateRequestSubscriber } from "../../../packages/xai-web-tasks/src/internal/aiMutateSubscriber.js";
import { isTaskColsArray } from "../../../packages/xai-web-tasks/src/internal/validate.js";
import type { TaskCol } from "../../../packages/xai-web-tasks/src/types.js";
import { useCalendarCreateRequestSubscriber } from "../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.js";
import { useCalendarMutateRequestSubscriber } from "../../../packages/xai-web-calendar/src/internal/aiMutateSubscriber.js";
import { isCalendarEventStore } from "../../../packages/xai-web-calendar/src/internal/aiCommandDomain.js";
import type { UserCalEvent } from "../../../packages/xai-web-calendar/src/internal/eventStore/types.js";

function Subscribers() {
  useTaskCreateRequestSubscriber();
  useTaskMutateRequestSubscriber();
  useCalendarCreateRequestSubscriber();
  useCalendarMutateRequestSubscriber();
  return null;
}

function taskSeed(): TaskCol[] {
  return [
    { id: "overdue", key: "overdue", count: 0, tasks: [] },
    { id: "next7", key: "next_7_days", count: 0, tasks: [] },
    { id: "later", key: "later", count: 0, tasks: [] },
    { id: "nodate", key: "no_date", count: 1, tasks: [{ id: "existing", title: { en: "Initial", zh: "Initial" }, tag: "study" }] },
  ];
}

function calendarSeed(): Record<string, UserCalEvent> {
  return {
    existing: {
      id: "existing",
      title: "Initial",
      startISO: "2026-09-09T09:00",
      endISO: "2026-09-09T10:00",
      colorPreset: "mint",
      recurrence: null,
      createdAt: "2026-09-09T00:00:00.000Z",
      updatedAt: "2026-09-09T00:00:00.000Z",
    },
  };
}

let lockTail: Promise<void>;

beforeEach(() => {
  localStorage.clear();
  setCanonicalCommandActivationForTests(true);
  lockTail = Promise.resolve();
  vi.stubGlobal("navigator", {
    locks: {
      request: vi.fn(<T,>(_name: string, callback: () => Promise<T>): Promise<T> => {
        const result = lockTail.then(callback);
        lockTail = result.then(() => undefined, () => undefined);
        return result;
      }),
    },
  });
});

afterEach(() => {
  cleanup();
  setCanonicalCommandActivationForTests(false);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function nextReceipt(
  channel: ToolWriteChannel,
  requestId: string,
  emit: () => void,
): Promise<WebEventMap["web:ai:tool-write-receipt"]> {
  let off = () => {};
  const receipt = new Promise<WebEventMap["web:ai:tool-write-receipt"]>(resolve => {
    off = onWebEvent("web:ai:tool-write-receipt", value => {
      if (value.requestChannel === channel && value.requestId === requestId) resolve(value);
    });
  });
  try {
    emit();
    return await receipt;
  } finally {
    off();
  }
}

it.each(["tasks:create", "tasks:update", "tasks:delete", "calendar:create", "calendar:update", "calendar:delete"])(
  "%s replays its durable receipt after remount and a fresh same-generation owner",
  async name => {
    const task = name.startsWith("tasks");
    const accountId = `durable-${name.replace(":", "-")}`;
    const scope = accountScope.activate(accountScope.lock(accountId), "fixture");
    localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({
      generation: "fixture",
      migrationId: "subscriber-replay",
      previous: null,
    }));
    const storageKey = accountScope.physicalKey(task ? "xai_task_cols" : "xai_calendar_events", scope);
    localStorage.setItem(storageKey, JSON.stringify(task ? taskSeed() : calendarSeed()));
    const channel = `web:${name}-requested` as ToolWriteChannel;
    const requestId = `durable-${name}`;
    const common = {
      requestId,
      attemptId: "first",
      owner: scope,
      requestedAt: "2026-09-09T00:00:00.000Z",
    };
    const payload = name.endsWith("create")
      ? task
        ? { ...common, title: "Created once", bucket: "nodate", tag: "work" }
        : { ...common, title: "Created once", date: "2026-09-09", startTime: "11:00", durationMin: 30 }
      : name.endsWith("update")
        ? task
          ? { ...common, id: "existing", patch: { tag: "work", title: "Tool committed" } }
          : { ...common, id: "existing", patch: { durationMin: 30, title: "Tool committed" } }
        : { ...common, id: "existing" };

    const first = render(<Subscribers />);
    act(() => emitWebEvent(channel, payload as never));
    const receiptId = canonicalCommandReceiptId(channel, requestId)!;
    await waitFor(() => {
      const envelope = JSON.parse(localStorage.getItem(storageKey)!);
      expect(envelope.receipts[receiptId]).toBeDefined();
    });
    const committed = JSON.parse(localStorage.getItem(storageKey)!);
    const targetId = committed.receipts[receiptId].result.targetId as string;
    first.unmount();

    if (name.endsWith("update")) {
      if (task) {
        await expect(mutateCanonicalDataset<TaskCol[]>({
          key: "xai_task_cols",
          scope,
          validate: isTaskColsArray,
          mutate: cols => ({
            ok: true,
            data: cols.map(col => ({
              ...col,
              tasks: col.tasks.map(item => item.id === "existing"
                ? { ...item, title: { en: "Later human edit", zh: "Later human edit" } }
                : item),
            })),
          }),
        })).resolves.toMatchObject({ ok: true, changed: true });
      } else {
        await expect(mutateCanonicalDataset<Record<string, UserCalEvent>>({
          key: "xai_calendar_events",
          scope,
          validate: isCalendarEventStore,
          mutate: store => ({
            ok: true,
            data: { ...store, existing: { ...store.existing!, title: "Later human edit", updatedAt: "2026-09-09T12:00:00.000Z" } },
          }),
        })).resolves.toMatchObject({ ok: true, changed: true });
      }
    }

    const beforeReplay = localStorage.getItem(storageKey);
    const next = accountScope.activate(accountScope.lock(accountId), "fixture");
    expect(next.epoch).not.toBe(scope.epoch);
    const second = render(<Subscribers />);
    const replayPayload = name.endsWith("update")
      ? task
        ? { ...payload, patch: { title: "Tool committed", tag: "work" }, owner: next, attemptId: "recovery", requestedAt: "2026-09-10T00:00:00.000Z" }
        : { ...payload, patch: { title: "Tool committed", durationMin: 30 }, owner: next, attemptId: "recovery", requestedAt: "2026-09-10T00:00:00.000Z" }
      : { ...payload, owner: next, attemptId: "recovery", requestedAt: "2026-09-10T00:00:00.000Z" };
    const replay = await nextReceipt(channel, requestId, () => act(() => emitWebEvent(channel, replayPayload as never)));
    expect(replay).toMatchObject({ ok: true, targetId, owner: next, attemptId: "recovery" });
    expect(localStorage.getItem(storageKey)).toBe(beforeReplay);

    const changed = name.endsWith("create")
      ? { ...replayPayload, title: "Changed" }
      : { ...replayPayload, id: "changed-target" };
    const conflict = await nextReceipt(channel, requestId, () => act(() => emitWebEvent(channel, changed as never)));
    expect(conflict).toMatchObject({ ok: false, reason: "request-conflict" });
    expect(localStorage.getItem(storageKey)).toBe(beforeReplay);
    second.unmount();
  },
);

it("does not turn a prior page success into a replay after the persisted generation marker changes", async () => {
  const accountId = "marker-change";
  const scope = accountScope.activate(accountScope.lock(accountId), "fixture");
  const markerKey = generationMarkerKey(accountId);
  localStorage.setItem(markerKey, JSON.stringify({ generation: "fixture", migrationId: "initial", previous: null }));
  const storageKey = accountScope.physicalKey("xai_task_cols", scope);
  localStorage.setItem(storageKey, JSON.stringify(taskSeed()));
  render(<Subscribers />);
  const payload = {
    requestId: "marker-replay",
    attemptId: "first",
    owner: scope,
    title: "Committed",
    bucket: "nodate" as const,
    requestedAt: "2026-09-09T00:00:00.000Z",
  };
  await expect(nextReceipt("web:tasks:create-requested", payload.requestId, () => {
    act(() => emitWebEvent("web:tasks:create-requested", payload));
  })).resolves.toMatchObject({ ok: true });
  const before = localStorage.getItem(storageKey);
  localStorage.setItem(markerKey, JSON.stringify({ generation: "other", migrationId: "replacement", previous: "fixture" }));
  const rejected = await nextReceipt("web:tasks:create-requested", payload.requestId, () => {
    act(() => emitWebEvent("web:tasks:create-requested", { ...payload, attemptId: "retry" }));
  });
  expect(rejected).toMatchObject({ ok: false, reason: "account-changed", attemptId: "retry" });
  expect(localStorage.getItem(storageKey)).toBe(before);
});

it("reports quota failure and preserves exact legacy bytes without a success receipt", async () => {
  const accountId = "quota-failure";
  const scope = accountScope.activate(accountScope.lock(accountId), "fixture");
  localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation: "fixture", migrationId: "quota", previous: null }));
  const storageKey = accountScope.physicalKey("xai_task_cols", scope);
  const original = JSON.stringify(taskSeed(), null, 2);
  localStorage.setItem(storageKey, original);
  const nativeSet = Storage.prototype.setItem;
  const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
    if (key === storageKey) throw new DOMException("quota", "QuotaExceededError");
    return nativeSet.call(this, key, value);
  });
  render(<Subscribers />);
  const receipt = await nextReceipt("web:tasks:create-requested", "quota-request", () => {
    act(() => emitWebEvent("web:tasks:create-requested", {
      requestId: "quota-request",
      attemptId: "quota-attempt",
      owner: scope,
      title: "Must not persist",
      bucket: "nodate",
      requestedAt: "2026-09-09T00:00:00.000Z",
    }));
  });
  expect(receipt).toMatchObject({ ok: false, reason: "storage", attemptId: "quota-attempt" });
  set.mockRestore();
  expect(localStorage.getItem(storageKey)).toBe(original);
});

it("keeps command activation closed and emits an honest failure without touching bytes", async () => {
  const accountId = "activation-closed";
  const scope = accountScope.activate(accountScope.lock(accountId), "fixture");
  localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation: "fixture", migrationId: "closed", previous: null }));
  const storageKey = accountScope.physicalKey("xai_task_cols", scope);
  const original = JSON.stringify(taskSeed());
  localStorage.setItem(storageKey, original);
  setCanonicalCommandActivationForTests(false);
  render(<Subscribers />);

  const receipt = await nextReceipt("web:tasks:create-requested", "closed-request", () => {
    act(() => emitWebEvent("web:tasks:create-requested", {
      requestId: "closed-request",
      attemptId: "closed-attempt",
      owner: scope,
      title: "Must stay closed",
      bucket: "nodate",
      requestedAt: "2026-09-09T00:00:00.000Z",
    }));
  });

  expect(receipt).toMatchObject({ ok: false, reason: "storage", attemptId: "closed-attempt" });
  expect(localStorage.getItem(storageKey)).toBe(original);
});

it("replays an omitted Calendar default across midnight without recomputing or reseeding", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-09T18:00:00-07:00"));
  const accountId = "calendar-default-replay";
  const scope = accountScope.activate(accountScope.lock(accountId), "fixture");
  localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation: "fixture", migrationId: "defaults", previous: null }));
  const storageKey = accountScope.physicalKey("xai_calendar_events", scope);
  expect(localStorage.getItem(storageKey)).toBeNull();
  const first = render(<Subscribers />);
  const payload = {
    requestId: "calendar-default-request",
    attemptId: "first",
    owner: scope,
    title: "Stable omitted defaults",
    requestedAt: "2026-09-09T18:00:00-07:00",
  };

  const created = await nextReceipt("web:calendar:create-requested", payload.requestId, () => {
    act(() => emitWebEvent("web:calendar:create-requested", payload));
  });
  expect(created).toMatchObject({ ok: true, attemptId: "first" });
  const committed = localStorage.getItem(storageKey);
  expect(committed).not.toBeNull();
  const firstEnvelope = JSON.parse(committed!);
  expect(firstEnvelope.data[created.targetId!]).toMatchObject({
    startISO: "2026-09-09T09:00",
    endISO: "2026-09-09T10:00",
  });
  first.unmount();

  vi.setSystemTime(new Date("2026-09-10T18:00:00-07:00"));
  const next = accountScope.activate(accountScope.lock(accountId), "fixture");
  const second = render(<Subscribers />);
  const replay = await nextReceipt("web:calendar:create-requested", payload.requestId, () => {
    act(() => emitWebEvent("web:calendar:create-requested", {
      ...payload,
      attemptId: "retry-after-midnight",
      owner: next,
      requestedAt: "2026-09-10T18:00:00-07:00",
    }));
  });
  expect(replay).toMatchObject({ ok: true, targetId: created.targetId, attemptId: "retry-after-midnight" });
  expect(localStorage.getItem(storageKey)).toBe(committed);
  second.unmount();
});
