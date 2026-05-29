/**
 * toolRegistry.test.ts — TR-1..TR-5
 *
 * Tests the AI tool registry shape, toConfirmation, toWriteEvent.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 TR tests
 */

import { describe, it, expect } from "vitest";
import { AI_TOOLS, findTool } from "../internal/toolRegistry.js";

describe("TR-1: registry contains exactly 2 tools", () => {
  it("AI_TOOLS has create_task and create_calendar_event", () => {
    expect(AI_TOOLS).toHaveLength(2);
    const names = AI_TOOLS.map((t) => t.name);
    expect(names).toContain("create_task");
    expect(names).toContain("create_calendar_event");
  });
});

describe("TR-2: tool names satisfy Anthropic ^[a-zA-Z0-9_-]{1,64}$ constraint", () => {
  it("all tool names are valid", () => {
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
});
