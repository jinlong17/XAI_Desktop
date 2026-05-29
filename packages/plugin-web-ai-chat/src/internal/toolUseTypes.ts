/**
 * toolUseTypes.ts — Tool-use wire protocol type definitions and serializers.
 *
 * Covers the Anthropic Messages API tool-use protocol AND the OpenAI Chat
 * Completions function-calling protocol. Both providers converge on the
 * normalized ToolUseResult shape which is consumed provider-agnostically
 * by AiChatModule above the adapter boundary.
 *
 * Anthropic protocol pinned from Anthropic Messages API docs (2026-05-29):
 * https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
 * https://platform.claude.com/docs/en/api/messages-streaming
 *
 * OpenAI Chat Completions function-calling protocol pinned (2026-05-29):
 * https://developers.openai.com/cookbook/examples/how_to_call_functions_with_chat_models
 * https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension FA-5/6
 * API contract: packages/xai-web-ai-chat/docs/api.md §13.1, §15.1-15.2
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

// ---- OpenAI Chat Completions tool definition --------------------------------

/**
 * OpenAI Chat Completions function-calling tool definition.
 *
 * Mechanical mapping from AnthropicToolDef:
 *   { name, description, input_schema } →
 *   { type:"function", function:{ name, description, parameters: input_schema } }
 *
 * `input_examples` (Anthropic-only quality hint) is DROPPED — it has no
 * Chat Completions equivalent.
 *
 * @internal — not exported from index.ts
 */
export interface OpenAiToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

/**
 * Convert an array of Anthropic tool definitions to OpenAI function format.
 * Pure serializer — drops `input_examples`, wraps in `{type:"function", function:{...}}`.
 *
 * @param defs - Anthropic tool definitions (from toolRegistry.AI_TOOLS).
 * @returns OpenAI Chat Completions function tool definitions.
 */
export function toOpenAiTools(defs: AnthropicToolDef[]): OpenAiToolDef[] {
  return defs.map((def) => ({
    type: "function",
    function: {
      name: def.name,
      description: def.description,
      parameters: def.input_schema,
    },
  }));
}

/**
 * Convert an Anthropic tool_choice to OpenAI tool_choice.
 *
 * Mapping (per discovery §2.2 + api §15.2):
 *   {type:"auto"}       → "auto"
 *   {type:"any"}        → "required"
 *   {type:"none"}       → "none"
 *   {type:"tool",name}  → {type:"function", function:{name}}
 *   omitted             → omitted (caller passes undefined → caller does not add tool_choice)
 *
 * In v1 the only exercised path is "omitted → auto" (the SHIPPED tool layer
 * never sets toolChoice). The full mapping is implemented for correctness and
 * tested so a future increment that sets toolChoice is already covered.
 *
 * @param choice - Anthropic toolChoice or undefined.
 * @returns OpenAI tool_choice value or undefined (omit from body when undefined).
 */
export function toOpenAiToolChoice(
  choice:
    | { type: "auto" | "any" | "none" }
    | { type: "tool"; name: string }
    | undefined,
): string | { type: "function"; function: { name: string } } | undefined {
  if (choice === undefined) return undefined;
  if (choice.type === "auto") return "auto";
  if (choice.type === "any") return "required";
  if (choice.type === "none") return "none";
  // type === "tool"
  return { type: "function", function: { name: (choice as { type: "tool"; name: string }).name } };
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
