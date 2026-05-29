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

/**
 * Human-readable description of the proposed action, shown in ConfirmationCard.
 *
 * `tone` is the SINGLE seam for destructive styling (ED-7). It rides on
 * ConfirmationSpec (the value returned by toConfirmation), NOT on a separate
 * ConfirmationCard prop. ConfirmationCardProps is UNCHANGED.
 *
 * Omitted / "default" tone = byte-for-byte SHIPPED rendering (CC-TONE-1 asserts).
 * "destructive" tone = distinct confirm styling/label (CC-TONE-2 asserts).
 */
export interface ConfirmationSpec {
  /** Short tool label, e.g. "Create task". */
  label: string;
  /** Human-readable description of the proposed action. */
  description: string;
  /**
   * NEW (additive, ED-7): visual + affordance tone.
   * Omitted / "default" = byte-for-byte SHIPPED rendering (create/update).
   * "destructive" = distinct confirm styling/label (delete tools only).
   *
   * api.md §14.2 — SINGLE tone seam; ConfirmationCardProps unchanged.
   */
  tone?: "default" | "destructive";
}

// ---- WriteEvent spec --------------------------------------------------------

/** The write event payload produced by a Confirm action. */
export interface WriteEventSpec {
  channel:
    | "web:tasks:create-requested"
    | "web:calendar:create-requested"
    | "web:tasks:delete-requested"
    | "web:calendar:delete-requested"
    | "web:tasks:update-requested"
    | "web:calendar:update-requested";
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

// ---- delete_task tool -------------------------------------------------------

const deleteTaskTool: AiToolDef = {
  name: "delete_task",
  description: [
    "Delete an existing task from the user's task list.",
    "Use this tool ONLY when the user explicitly asks to delete, remove, or discard an existing task.",
    "You MUST provide the exact task id from the context (shown as '(id: ...)' in the task list).",
    "Do NOT delete tasks the user did not explicitly ask to remove.",
  ].join(" "),
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The exact task id from the context (shown as '(id: ...)' in the task list). Required.",
      },
    },
    required: ["id"],
  },
  input_examples: [
    { id: "t-abc-123" },
  ],

  toConfirmation(input) {
    const id = safeString(input["id"] as unknown, "(unknown)");
    return {
      label: "Delete task",
      description: `Delete task (id: ${id})?`,
      tone: "destructive",
    };
  },

  toWriteEvent(input, toolUseId) {
    const id = safeString(input["id"] as unknown, "");
    return {
      channel: "web:tasks:delete-requested",
      payload: {
        requestId: toolUseId,
        id,
        requestedAt: new Date().toISOString(),
      },
    };
  },
};

// ---- delete_calendar_event tool ---------------------------------------------

const deleteCalendarEventTool: AiToolDef = {
  name: "delete_calendar_event",
  description: [
    "Delete an existing calendar event.",
    "Use this tool ONLY when the user explicitly asks to delete, remove, or cancel an existing event.",
    "You MUST provide the exact event id from the context (shown as '(id: ...)' in the calendar section).",
    "Do NOT delete events the user did not explicitly ask to remove.",
  ].join(" "),
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The exact event id from the context (shown as '(id: ...)' in the calendar section). Required.",
      },
    },
    required: ["id"],
  },
  input_examples: [
    { id: "ev-xyz-789" },
  ],

  toConfirmation(input) {
    const id = safeString(input["id"] as unknown, "(unknown)");
    return {
      label: "Delete event",
      description: `Delete calendar event (id: ${id})?`,
      tone: "destructive",
    };
  },

  toWriteEvent(input, toolUseId) {
    const id = safeString(input["id"] as unknown, "");
    return {
      channel: "web:calendar:delete-requested",
      payload: {
        requestId: toolUseId,
        id,
        requestedAt: new Date().toISOString(),
      },
    };
  },
};

// ---- update_task tool -------------------------------------------------------

const updateTaskTool: AiToolDef = {
  name: "update_task",
  description: [
    "Update an existing task in the user's task list.",
    "Use this tool when the user asks to rename, retag, or move (reschedule) an existing task.",
    "You MUST provide the exact task id from the context (shown as '(id: ...)' in the task list).",
    "Provide the id plus AT LEAST one of: title, bucket, or tag. All other fields are optional.",
    "Omitting a field means it will NOT be changed.",
    "Bucket values: 'overdue', 'next7', 'later', 'nodate'.",
    "Tag values: 'study', 'work', 'personal', 'todo', 'other'.",
  ].join(" "),
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The exact task id from the context (shown as '(id: ...)' in the task list). Required.",
      },
      title: {
        type: "string",
        description: "New task title (optional; fills both EN and ZH titles).",
      },
      bucket: {
        type: "string",
        enum: ["overdue", "next7", "later", "nodate"],
        description: "Target time bucket (optional).",
      },
      tag: {
        type: "string",
        enum: ["study", "work", "personal", "todo", "other"],
        description: "Tag category (optional).",
      },
    },
    required: ["id"],
  },
  input_examples: [
    { id: "t-abc-123", title: "Updated task name" },
    { id: "t-abc-123", bucket: "later" },
    { id: "t-abc-123", title: "Renamed + moved", bucket: "next7", tag: "work" },
  ],

  toConfirmation(input) {
    const id = safeString(input["id"] as unknown, "(unknown)");
    const parts: string[] = [];
    if (input["title"]) parts.push(`title: "${input["title"]}"`);
    if (input["bucket"]) parts.push(`bucket: ${input["bucket"]}`);
    if (input["tag"]) parts.push(`tag: ${input["tag"]}`);
    const detail = parts.length > 0 ? ` — ${parts.join(", ")}` : "";
    return {
      label: "Update task",
      description: `Update task (id: ${id})${detail}`,
      tone: "default",
    };
  },

  toWriteEvent(input, toolUseId) {
    const id = safeString(input["id"] as unknown, "");
    const validBuckets = ["overdue", "next7", "later", "nodate"];
    const validTags = ["study", "work", "personal", "todo", "other"];

    const patch: Record<string, unknown> = {};
    if (typeof input["title"] === "string" && input["title"].trim()) {
      patch["title"] = input["title"].trim();
    }
    if (validBuckets.includes(input["bucket"] as string)) {
      patch["bucket"] = input["bucket"];
    }
    if (validTags.includes(input["tag"] as string)) {
      patch["tag"] = input["tag"];
    }

    return {
      channel: "web:tasks:update-requested",
      payload: {
        requestId: toolUseId,
        id,
        patch,
        requestedAt: new Date().toISOString(),
      },
    };
  },
};

// ---- update_calendar_event tool ---------------------------------------------

const updateCalendarEventTool: AiToolDef = {
  name: "update_calendar_event",
  description: [
    "Update an existing calendar event.",
    "Use this tool when the user asks to rename, reschedule, or change the duration of an existing event.",
    "You MUST provide the exact event id from the context (shown as '(id: ...)' in the calendar section).",
    "Provide the id plus AT LEAST one of: title, date, startTime, or durationMin.",
    "Omitting a field means it will NOT be changed.",
  ].join(" "),
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The exact event id from the context. Required.",
      },
      title: {
        type: "string",
        description: "New event title (optional).",
      },
      date: {
        type: "string",
        description: "New date in 'YYYY-MM-DD' format (optional).",
      },
      startTime: {
        type: "string",
        description: "New start time in 'HH:MM' 24h format (optional).",
      },
      durationMin: {
        type: "number",
        description: "New duration in minutes (positive integer, optional).",
      },
    },
    required: ["id"],
  },
  input_examples: [
    { id: "ev-xyz-789", title: "Updated meeting name" },
    { id: "ev-xyz-789", date: "2026-06-02", startTime: "15:00" },
    { id: "ev-xyz-789", durationMin: 90 },
  ],

  toConfirmation(input) {
    const id = safeString(input["id"] as unknown, "(unknown)");
    const parts: string[] = [];
    if (input["title"]) parts.push(`title: "${input["title"]}"`);
    if (input["date"]) parts.push(`date: ${input["date"]}`);
    if (input["startTime"]) parts.push(`at: ${input["startTime"]}`);
    if (input["durationMin"]) parts.push(`${input["durationMin"]} min`);
    const detail = parts.length > 0 ? ` — ${parts.join(", ")}` : "";
    return {
      label: "Update event",
      description: `Update event (id: ${id})${detail}`,
      tone: "default",
    };
  },

  toWriteEvent(input, toolUseId) {
    const id = safeString(input["id"] as unknown, "");
    const patch: Record<string, unknown> = {};
    if (typeof input["title"] === "string" && input["title"].trim()) {
      patch["title"] = input["title"].trim();
    }
    if (typeof input["date"] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input["date"])) {
      patch["date"] = input["date"];
    }
    if (typeof input["startTime"] === "string" && /^\d{2}:\d{2}$/.test(input["startTime"])) {
      patch["startTime"] = input["startTime"];
    }
    if (typeof input["durationMin"] === "number" && input["durationMin"] > 0) {
      patch["durationMin"] = Math.round(input["durationMin"]);
    }

    return {
      channel: "web:calendar:update-requested",
      payload: {
        requestId: toolUseId,
        id,
        patch,
        requestedAt: new Date().toISOString(),
      },
    };
  },
};

// ---- Registry ---------------------------------------------------------------

/**
 * v1 tool registry.
 * P1: create_task + create_calendar_event (SHIPPED).
 * P2 (xai-web-ai-tool-edit-delete): +delete_task + delete_calendar_event.
 * P3 (xai-web-ai-tool-edit-delete): +update_task + update_calendar_event.
 */
export const AI_TOOLS: AiToolDef[] = [
  createTaskTool,
  createCalendarEventTool,
  deleteTaskTool,
  deleteCalendarEventTool,
  updateTaskTool,
  updateCalendarEventTool,
];

/** Look up a tool by name. Returns undefined if not found. */
export function findTool(name: string): AiToolDef | undefined {
  return AI_TOOLS.find((t) => t.name === name);
}
