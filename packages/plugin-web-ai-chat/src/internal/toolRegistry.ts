/**
 * toolRegistry.ts — AI tool definitions for v1 (create_task + create_calendar_event).
 *
 * Each AiToolDef owns:
 * - JSON-schema input_schema (Anthropic tool-use protocol)
 * - toConfirmation(input): human-readable description for ConfirmationCard
 * - toWriteEvent(input): { channel, payload } to emit on Confirm
 *
 * CRITICAL no-silent-write: toWriteEvent output is ONLY used by the Confirm handler.
 * The registry itself does NOT emit or execute. IT-2 enforces this.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension FA-2/7
 * API contract: packages/xai-web-ai-chat/docs/api.md §13.2
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 TR tests
 *
 * @internal — not re-exported from index.ts
 */

import type { AnthropicToolDef } from "./toolUseTypes.js";

// ---- ConfirmationSpec -------------------------------------------------------

/** Human-readable description of the proposed action, shown in ConfirmationCard. */
export interface ConfirmationSpec {
  /** Short tool label, e.g. "Create task". */
  label: string;
  /** Human-readable description of the proposed action. */
  description: string;
}

// ---- WriteEvent spec --------------------------------------------------------

/** The write event payload produced by a Confirm action. */
export interface WriteEventSpec {
  channel: "web:tasks:create-requested" | "web:calendar:create-requested";
  payload: Record<string, unknown>;
}

// ---- AiToolDef interface ----------------------------------------------------

export interface AiToolDef extends AnthropicToolDef {
  /**
   * Derive a human-readable ConfirmationSpec from the tool input.
   * Called when the model returns a tool_use block.
   */
  toConfirmation(input: Record<string, unknown>): ConfirmationSpec;

  /**
   * Derive the write event channel + payload from the tool input.
   * ONLY called by the Confirm handler (no silent execution allowed).
   *
   * @param input - The parsed tool input from the model's tool_use block.
   * @param toolUseId - The Anthropic tool_use.id for round-trip correlation.
   */
  toWriteEvent(input: Record<string, unknown>, toolUseId: string): WriteEventSpec;
}

// ---- Tool helpers -----------------------------------------------------------

function safeString(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
}

function safeNumber(v: unknown, fallback = 60): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : fallback;
}

// ---- create_task tool -------------------------------------------------------

const createTaskTool: AiToolDef = {
  name: "create_task",
  description: [
    "Create a new task in the user's task list.",
    "Use this tool when the user explicitly asks to create, add, or schedule a new task.",
    "Choose the appropriate bucket: 'overdue' for past-due items, 'next7' for tasks to do within the next 7 days (default), 'later' for further-future items, 'nodate' for items without a specific deadline.",
    "The 'tag' field is optional; choose the best-fit category from the closed set or omit if unclear.",
  ].join(" "),
  input_schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The task title (required, non-empty).",
      },
      bucket: {
        type: "string",
        enum: ["overdue", "next7", "later", "nodate"],
        description: "Target time bucket. Default 'next7'.",
      },
      tag: {
        type: "string",
        enum: ["study", "work", "personal", "todo", "other"],
        description: "Optional tag category.",
      },
    },
    required: ["title"],
  },
  input_examples: [
    { title: "Buy groceries", bucket: "next7" },
    { title: "Review PR", bucket: "next7", tag: "work" },
    { title: "Learn TypeScript generics", bucket: "later", tag: "study" },
  ],

  toConfirmation(input) {
    const title = safeString(input["title"], "(untitled)");
    const bucket = safeString(input["bucket"] as unknown, "next7");
    const tag = input["tag"] ? ` [${input["tag"]}]` : "";
    const bucketLabel: Record<string, string> = {
      overdue: "Overdue",
      next7: "Next 7 Days",
      later: "Later",
      nodate: "No Date",
    };
    const bucketDisplay = bucketLabel[bucket] ?? "Next 7 Days";
    return {
      label: "Create task",
      description: `"${title}" in ${bucketDisplay}${tag}`,
    };
  },

  toWriteEvent(input, toolUseId) {
    const title = safeString(input["title"], "Untitled task");
    const bucket = (["overdue", "next7", "later", "nodate"].includes(input["bucket"] as string)
      ? (input["bucket"] as string)
      : "next7") as "overdue" | "next7" | "later" | "nodate";
    const validTags = ["study", "work", "personal", "todo", "other"];
    const tag = validTags.includes(input["tag"] as string)
      ? (input["tag"] as string)
      : undefined;

    return {
      channel: "web:tasks:create-requested",
      payload: {
        requestId: toolUseId,
        title,
        bucket,
        ...(tag !== undefined ? { tag } : {}),
        requestedAt: new Date().toISOString(),
      },
    };
  },
};

// ---- create_calendar_event tool ---------------------------------------------

const createCalendarEventTool: AiToolDef = {
  name: "create_calendar_event",
  description: [
    "Create a new calendar event for the user.",
    "Use this tool when the user asks to schedule, book, or add a meeting/appointment/event to their calendar.",
    "The date must be in 'YYYY-MM-DD' format (local date). The startTime defaults to '09:00' if not specified.",
    "The durationMin defaults to 60 minutes if not specified; it must be a positive integer and the event must end on the same calendar day.",
    "Do not use this tool for reminders or recurring events — those require additional fields not available in v1.",
  ].join(" "),
  input_schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Event title (required, non-empty).",
      },
      date: {
        type: "string",
        description: "Local calendar date in 'YYYY-MM-DD' format (required).",
      },
      startTime: {
        type: "string",
        description: "Start time in 'HH:MM' 24h format. Default '09:00'.",
      },
      durationMin: {
        type: "number",
        description: "Duration in minutes (positive integer). Default 60. Event must end same day.",
      },
    },
    required: ["title", "date"],
  },
  input_examples: [
    { title: "Team standup", date: "2026-05-30", startTime: "09:30", durationMin: 30 },
    { title: "Dentist appointment", date: "2026-06-01", startTime: "14:00", durationMin: 60 },
  ],

  toConfirmation(input) {
    const title = safeString(input["title"], "(untitled)");
    const date = safeString(input["date"] as unknown, "");
    const startTime = safeString(input["startTime"] as unknown, "09:00");
    const durationMin = safeNumber(input["durationMin"] as unknown, 60);
    const timeDisplay = date ? ` on ${date} at ${startTime} (${durationMin} min)` : "";
    return {
      label: "Add calendar event",
      description: `"${title}"${timeDisplay}`,
    };
  },

  toWriteEvent(input, toolUseId) {
    const title = safeString(input["title"], "Untitled event");
    const date = safeString(input["date"] as unknown, "");
    const startTime = safeString(input["startTime"] as unknown, "09:00");
    const durationMin = safeNumber(input["durationMin"] as unknown, 60);

    return {
      channel: "web:calendar:create-requested",
      payload: {
        requestId: toolUseId,
        title,
        date,
        startTime,
        durationMin,
        requestedAt: new Date().toISOString(),
      },
    };
  },
};

// ---- Registry ---------------------------------------------------------------

/** v1 tool registry — create_task + create_calendar_event. */
export const AI_TOOLS: AiToolDef[] = [createTaskTool, createCalendarEventTool];

/** Look up a tool by name. Returns undefined if not found. */
export function findTool(name: string): AiToolDef | undefined {
  return AI_TOOLS.find((t) => t.name === name);
}
