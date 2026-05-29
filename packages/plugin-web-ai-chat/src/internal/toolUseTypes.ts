/**
 * toolUseTypes.ts — Anthropic tool-use wire protocol type definitions.
 *
 * Pinned from the Anthropic Messages API docs (2026-05-29):
 * https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
 * https://platform.claude.com/docs/en/api/messages-streaming
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension FA-5/6
 * API contract: packages/xai-web-ai-chat/docs/api.md §13.1
 *
 * @internal — not re-exported from index.ts
 */

// ---- Tool definition (sent in request) --------------------------------------

/**
 * Anthropic tool definition (client tool schema).
 * name MUST satisfy ^[a-zA-Z0-9_-]{1,64}$.
 */
export interface AnthropicToolDef {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  /** Optional input examples to improve call quality. */
  input_examples?: Array<Record<string, unknown>>;
}

// ---- Content blocks (sent in request and received in response) ---------------

/** Text content block. */
export interface TextBlock {
  type: "text";
  text: string;
}

/** Tool use content block (received from the model). */
export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

/** Tool result content block (sent back to the model after execution). */
export interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/** Union of all content block types accepted by the API. */
export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

// ---- Message with content blocks --------------------------------------------

/**
 * A message with content blocks (used for tool round-trip turns).
 * The standard string-content path is unchanged (backward-compatible).
 */
export interface MessageWithBlocks {
  role: "user" | "assistant";
  /** String for normal turns; ContentBlock[] for tool round-trip turns. */
  content: string | ContentBlock[];
}

// ---- Tool use result (surfaced from streamCompleteChat) ---------------------

/**
 * Parsed tool call result from the streaming adapter.
 * The adapter accumulates input_json_delta per block index, parses once
 * at content_block_stop, and yields this with the final StreamChunk.
 *
 * Per design FA-6 and discovery §2.5, this is ADDITIVE to StreamChunk
 * (optional field toolUse?) so text-only consumers stay byte-for-byte
 * unaffected (Rec1 from feature-review).
 */
export interface ToolUseResult {
  /** The Anthropic tool_use block id. Used for tool_result round-trip correlation. */
  id: string;
  /** Tool name (e.g. "create_task", "create_calendar_event"). */
  name: string;
  /** Fully parsed input (JSON.parsed once at content_block_stop). */
  input: Record<string, unknown>;
}
