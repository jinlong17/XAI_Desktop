import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { accountScope, setPref } from "../../../packages/plugin-web-storage/src/index.js";
import { emitWebEvent, onWebEvent, type WebEventMap } from "../../../packages/xai-web-event-bus/src/index.js";
import { useCalendarCreateRequestSubscriber } from "../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.js";
import { useCalendarMutateRequestSubscriber } from "../../../packages/xai-web-calendar/src/internal/aiMutateSubscriber.js";
import { findTool, type WriteEventSpec } from "../../../packages/plugin-web-ai-chat/src/internal/toolRegistry.js";

const seed = {
  event: {
    id: "event",
    title: "Existing",
    startISO: "2026-02-20T09:00",
    endISO: "2026-02-20T10:00",
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-02-20T00:00:00.000Z",
    colorPreset: "mint" as const,
    recurrence: null,
  },
};

beforeEach(() => {
  localStorage.clear();
  accountScope.activate(accountScope.lock("registry-subscriber-contract"), "fixture");
  setPref("xai_calendar_events", seed);
  renderHook(() => {
    useCalendarCreateRequestSubscriber();
    useCalendarMutateRequestSubscriber();
  });
});

afterEach(cleanup);

function emitCalendarSpec(spec: WriteEventSpec): void {
  if (spec.channel === "web:calendar:create-requested") {
    emitWebEvent(spec.channel, spec.payload as WebEventMap["web:calendar:create-requested"]);
    return;
  }
  if (spec.channel === "web:calendar:update-requested") {
    emitWebEvent(spec.channel, spec.payload as WebEventMap["web:calendar:update-requested"]);
    return;
  }
  throw new Error(`Unexpected Calendar channel: ${spec.channel}`);
}

function expectRejectedWithoutWrite(spec: WriteEventSpec): void {
  const key = accountScope.physicalKey("xai_calendar_events");
  const before = localStorage.getItem(key);
  const receipts: WebEventMap["web:ai:tool-write-receipt"][] = [];
  const off = onWebEvent("web:ai:tool-write-receipt", receipt => receipts.push(receipt));
  try {
    emitCalendarSpec(spec);
    expect(receipts).toHaveLength(1);
    expect(receipts[0]).toMatchObject({ ok: false, reason: "invalid" });
    expect(localStorage.getItem(key)).toBe(before);
  } finally {
    off();
  }
}

describe("calendar tool registry → subscriber contract", () => {
  it("applies documented create defaults only when the optional fields are omitted", () => {
    const tool = findTool("create_calendar_event")!;
    const input = { title: "Defaulted event", date: "2026-02-20" };
    const spec = tool.toWriteEvent(input, "create-omitted-defaults");
    expect(spec.payload["startTime"]).toBeUndefined();
    expect(spec.payload["durationMin"]).toBeUndefined();
    expect(tool.toConfirmation(input).description).toContain("09:00 (60 min)");

    emitCalendarSpec(spec);
    const store = JSON.parse(localStorage.getItem(accountScope.physicalKey("xai_calendar_events")) ?? "{}") as Record<string, { title?: string; startISO?: string; endISO?: string }>;
    const created = Object.values(store).find(event => event.title === "Defaulted event");
    expect(created?.startISO).toBe("2026-02-20T09:00");
    expect(created?.endISO).toBe("2026-02-20T10:00");
  });

  it.each([
    ["invalid date", { title: "Valid title", date: "bad", startTime: "09:00", durationMin: 30 }],
    ["non-number duration", { title: "Valid title", date: "2026-02-20", startTime: "09:00", durationMin: "bad" }],
    ["decimal duration", { title: "Valid title", date: "2026-02-20", startTime: "09:00", durationMin: 7.5 }],
  ])("create preserves explicit %s and the subscriber rejects it", (_name, input) => {
    const spec = findTool("create_calendar_event")!.toWriteEvent(input, `create-${_name}`);
    expectRejectedWithoutWrite(spec);
  });

  it.each([
    ["invalid date beside a valid title", { id: "event", title: "Changed title", date: "bad" }],
    ["decimal duration", { id: "event", durationMin: 7.5 }],
  ])("update preserves explicit %s and the subscriber rejects the whole patch", (_name, input) => {
    const spec = findTool("update_calendar_event")!.toWriteEvent(input, `update-${_name}`);
    expectRejectedWithoutWrite(spec);
  });
});
