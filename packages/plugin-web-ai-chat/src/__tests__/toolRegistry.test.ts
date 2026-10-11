/**
 * toolRegistry.test.ts — TR-1..TR-5
 *
 * Tests the AI tool registry shape, toConfirmation, toWriteEvent.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 TR tests
 */

import { describe, it, expect } from "vitest";
import { AI_TOOLS, findTool } from "../internal/toolRegistry.js";

describe("TR-1: registry contains 6 tools (P3 — create + delete + update)", () => {
  it("AI_TOOLS has all 6 tools", () => {
    expect(AI_TOOLS).toHaveLength(6);
    const names = AI_TOOLS.map((t) => t.name);
    expect(names).toContain("create_task");
    expect(names).toContain("create_calendar_event");
    expect(names).toContain("delete_task");
    expect(names).toContain("delete_calendar_event");
    expect(names).toContain("update_task");
    expect(names).toContain("update_calendar_event");
  });
});

describe("TR-2: all tool names satisfy Anthropic ^[a-zA-Z0-9_-]{1,64}$ constraint", () => {
  it("all tool names are valid (including delete tools)", () => {
    const regex = /^[a-zA-Z0-9_-]{1,64}$/;
    for (const tool of AI_TOOLS) {
      expect(tool.name).toMatch(regex);
    }
  });
});

describe("TR-3: create_task toConfirmation returns readable description", () => {
  it("formats title + bucket + optional tag", () => {
    const tool = findTool("create_task")!;
    expect(tool).toBeDefined();

    const spec1 = tool.toConfirmation({ title: "Buy groceries", bucket: "next7" });
    expect(spec1.label).toBe("Create task");
    expect(spec1.description).toContain("Buy groceries");
    expect(spec1.description).toContain("Next 7 Days");

    const spec2 = tool.toConfirmation({ title: "Study TS", bucket: "later", tag: "study" });
    expect(spec2.description).toContain("Study TS");
    expect(spec2.description).toContain("Later");
    expect(spec2.description).toContain("[study]");
  });

  it("defaults bucket to next7 when missing", () => {
    const tool = findTool("create_task")!;
    const spec = tool.toConfirmation({ title: "Task" });
    expect(spec.description).toContain("Next 7 Days");
  });
});

describe("TR-4: create_calendar_event toConfirmation returns readable description", () => {
  it("formats title + date + time", () => {
    const tool = findTool("create_calendar_event")!;
    expect(tool).toBeDefined();

    const spec = tool.toConfirmation({ title: "Team meeting", date: "2026-05-30", startTime: "10:00", durationMin: 45 });
    expect(spec.label).toBe("Add calendar event");
    expect(spec.description).toContain("Team meeting");
    expect(spec.description).toContain("2026-05-30");
    expect(spec.description).toContain("10:00");
    expect(spec.description).toContain("45 min");
  });
});

describe("TR-5: toWriteEvent produces correct channel + payload", () => {
  it("create_task produces web:tasks:create-requested payload", () => {
    const tool = findTool("create_task")!;
    const result = tool.toWriteEvent(
      { title: "Buy milk", bucket: "next7", tag: "personal" },
      "toolu_abc",
    );
    expect(result.channel).toBe("web:tasks:create-requested");
    expect(result.payload["requestId"]).toBe("toolu_abc");
    expect(result.payload["title"]).toBe("Buy milk");
    expect(result.payload["bucket"]).toBe("next7");
    expect(result.payload["tag"]).toBe("personal");
    expect(typeof result.payload["requestedAt"]).toBe("string");
  });

  it("create_calendar_event produces web:calendar:create-requested payload", () => {
    const tool = findTool("create_calendar_event")!;
    const result = tool.toWriteEvent(
      { title: "Standup", date: "2026-05-30", startTime: "09:30", durationMin: 30 },
      "toolu_xyz",
    );
    expect(result.channel).toBe("web:calendar:create-requested");
    expect(result.payload["requestId"]).toBe("toolu_xyz");
    expect(result.payload["title"]).toBe("Standup");
    expect(result.payload["date"]).toBe("2026-05-30");
    expect(result.payload["startTime"]).toBe("09:30");
    expect(result.payload["durationMin"]).toBe(30);
  });

  it("preserves explicit malformed calendar create input for subscriber validation", () => {
    const tool = findTool("create_calendar_event")!;
    const result = tool.toWriteEvent(
      { title: "Standup", date: "bad", startTime: "09:00", durationMin: "bad" },
      "toolu_calendar_invalid",
    );
    expect(result.payload["date"]).toBe("bad");
    expect(result.payload["durationMin"]).toBe("bad");
    expect(tool.toConfirmation({ title: "Standup", date: "bad", startTime: "09:00", durationMin: "bad" }).description).toContain("bad");
  });
});

// ---------------------------------------------------------------------------
// TR-DEL-TOOL tests (xai-web-ai-tool-edit-delete P2)
// ---------------------------------------------------------------------------

describe("TR-DEL-TOOL-1: delete tools exist with correct schema", () => {
  it("TR-DEL-TOOL-1: delete_task + delete_calendar_event exist; each requires id", () => {
    const delTask = findTool("delete_task")!;
    const delCal = findTool("delete_calendar_event")!;
    expect(delTask).toBeDefined();
    expect(delCal).toBeDefined();

    const nameRegex = /^[a-zA-Z0-9_-]{1,64}$/;
    expect(delTask.name).toMatch(nameRegex);
    expect(delCal.name).toMatch(nameRegex);

    // Both require id
    expect(delTask.input_schema.required).toContain("id");
    expect(delCal.input_schema.required).toContain("id");
  });
});

describe("TR-DEL-TOOL-2: delete tool toWriteEvent produces correct channel + payload", () => {
  it("delete_task → web:tasks:delete-requested with requestId + id", () => {
    const tool = findTool("delete_task")!;
    const result = tool.toWriteEvent({ id: "t-abc-123" }, "toolu_del_1");
    expect(result.channel).toBe("web:tasks:delete-requested");
    expect(result.payload["requestId"]).toBe("toolu_del_1");
    expect(result.payload["id"]).toBe("t-abc-123");
    expect(typeof result.payload["requestedAt"]).toBe("string");
  });

  it("delete_calendar_event → web:calendar:delete-requested with requestId + id", () => {
    const tool = findTool("delete_calendar_event")!;
    const result = tool.toWriteEvent({ id: "ev-xyz-789" }, "toolu_del_2");
    expect(result.channel).toBe("web:calendar:delete-requested");
    expect(result.payload["requestId"]).toBe("toolu_del_2");
    expect(result.payload["id"]).toBe("ev-xyz-789");
    expect(typeof result.payload["requestedAt"]).toBe("string");
  });
});

describe("TR-DEL-TOOL-3: delete tool toConfirmation returns destructive tone + item-naming description", () => {
  it("delete_task toConfirmation → tone:'destructive' + description names the id", () => {
    const tool = findTool("delete_task")!;
    const spec = tool.toConfirmation({ id: "t-abc-123" });
    expect(spec.tone).toBe("destructive");
    expect(spec.label).toBe("Delete task");
    expect(spec.description).toContain("t-abc-123");
  });

  it("delete_calendar_event toConfirmation → tone:'destructive' + description names the id", () => {
    const tool = findTool("delete_calendar_event")!;
    const spec = tool.toConfirmation({ id: "ev-xyz-789" });
    expect(spec.tone).toBe("destructive");
    expect(spec.label).toBe("Delete event");
    expect(spec.description).toContain("ev-xyz-789");
  });

  it("create_task toConfirmation → tone NOT 'destructive' (SHIPPED create unaffected)", () => {
    const tool = findTool("create_task")!;
    const spec = tool.toConfirmation({ title: "Buy milk", bucket: "next7" });
    expect(spec.tone).not.toBe("destructive");
  });
});

// ---------------------------------------------------------------------------
// TR-UPD-TOOL tests (xai-web-ai-tool-edit-delete P3)
// ---------------------------------------------------------------------------

describe("TR-UPD-TOOL-1: update tools exist with correct schema (P3)", () => {
  it("TR-UPD-TOOL-1: update_task + update_calendar_event exist; each requires id; optional fields correct", () => {
    const updTask = findTool("update_task")!;
    const updCal = findTool("update_calendar_event")!;
    expect(updTask).toBeDefined();
    expect(updCal).toBeDefined();

    const nameRegex = /^[a-zA-Z0-9_-]{1,64}$/;
    expect(updTask.name).toMatch(nameRegex);
    expect(updCal.name).toMatch(nameRegex);

    // Both require id
    expect(updTask.input_schema.required).toContain("id");
    expect(updCal.input_schema.required).toContain("id");

    // update_task has optional title + bucket + tag
    const updTaskProps = updTask.input_schema.properties as Record<string, { enum?: string[] }>;
    expect(updTaskProps["title"]).toBeDefined();
    expect(updTaskProps["bucket"]?.enum).toContain("overdue");
    expect(updTaskProps["bucket"]?.enum).toContain("next7");
    expect(updTaskProps["tag"]?.enum).toContain("work");

    // update_calendar_event has optional title + date + startTime + durationMin
    const updCalProps = updCal.input_schema.properties as Record<string, unknown>;
    expect(updCalProps["title"]).toBeDefined();
    expect(updCalProps["date"]).toBeDefined();
    expect(updCalProps["startTime"]).toBeDefined();
    expect(updCalProps["durationMin"]).toBeDefined();
  });
});

describe("TR-UPD-TOOL-2: update_task toWriteEvent — only provided fields in patch", () => {
  it("title-only input → patch contains only title", () => {
    const tool = findTool("update_task")!;
    const result = tool.toWriteEvent({ id: "t-abc", title: "New name" }, "toolu_upd_1");
    expect(result.channel).toBe("web:tasks:update-requested");
    expect(result.payload["requestId"]).toBe("toolu_upd_1");
    expect(result.payload["id"]).toBe("t-abc");
    const patch = result.payload["patch"] as Record<string, unknown>;
    expect(patch["title"]).toBe("New name");
    expect(patch["bucket"]).toBeUndefined();
    expect(patch["tag"]).toBeUndefined();
    expect(typeof result.payload["requestedAt"]).toBe("string");
  });

  it("bucket-only input → patch contains only bucket", () => {
    const tool = findTool("update_task")!;
    const result = tool.toWriteEvent({ id: "t-abc", bucket: "later" }, "toolu_upd_2");
    const patch = result.payload["patch"] as Record<string, unknown>;
    expect(patch["bucket"]).toBe("later");
    expect(patch["title"]).toBeUndefined();
    expect(patch["tag"]).toBeUndefined();
  });

  it("all three fields → patch contains all three", () => {
    const tool = findTool("update_task")!;
    const result = tool.toWriteEvent({ id: "t-abc", title: "Full update", bucket: "next7", tag: "work" }, "toolu_upd_3");
    const patch = result.payload["patch"] as Record<string, unknown>;
    expect(patch["title"]).toBe("Full update");
    expect(patch["bucket"]).toBe("next7");
    expect(patch["tag"]).toBe("work");
  });
});

describe("TR-UPD-TOOL-3: update_calendar_event toWriteEvent — only provided fields in patch", () => {
  it("title-only → patch has title only", () => {
    const tool = findTool("update_calendar_event")!;
    const result = tool.toWriteEvent({ id: "ev-xyz", title: "New title" }, "toolu_upd_cal_1");
    expect(result.channel).toBe("web:calendar:update-requested");
    const patch = result.payload["patch"] as Record<string, unknown>;
    expect(patch["title"]).toBe("New title");
    expect(patch["date"]).toBeUndefined();
    expect(patch["startTime"]).toBeUndefined();
    expect(patch["durationMin"]).toBeUndefined();
  });

  it("preserves explicit malformed update fields for subscriber validation", () => {
    const tool = findTool("update_calendar_event")!;
    const result = tool.toWriteEvent({ id: "ev-xyz", title: "Changed", date: "bad", durationMin: 7.5 }, "toolu_upd_cal_invalid");
    const patch = result.payload["patch"] as Record<string, unknown>;
    expect(patch).toEqual({ title: "Changed", date: "bad", durationMin: 7.5 });
    expect(tool.toConfirmation({ id: "ev-xyz", title: "Changed", date: "bad", durationMin: 7.5 }).description).toContain("7.5 min");
  });

  it("date + startTime → patch has date + startTime; no title or durationMin", () => {
    const tool = findTool("update_calendar_event")!;
    const result = tool.toWriteEvent({ id: "ev-xyz", date: "2026-06-01", startTime: "14:00" }, "toolu_upd_cal_2");
    const patch = result.payload["patch"] as Record<string, unknown>;
    expect(patch["date"]).toBe("2026-06-01");
    expect(patch["startTime"]).toBe("14:00");
    expect(patch["title"]).toBeUndefined();
    expect(patch["durationMin"]).toBeUndefined();
  });
});
