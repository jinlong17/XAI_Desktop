/**
 * sseParser — Parses an SSE (text/event-stream) Response body into events.
 *
 * Handles:
 * - Buffer accumulation across chunk boundaries.
 * - Comment lines (`:`) — skipped.
 * - `[DONE]` sentinel (OpenAI-compatible streams) — yields a synthetic done event.
 * - Server abort (stream error) — iterator throws.
 * - Empty stream — iterator completes without yielding.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-3 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §12.1
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (sseParser)
 */

export interface SseEvent {
  /** The `event` field value, if present; otherwise undefined. */
  event?: string;
  /** The `data` field value (raw string). */
  data: string;
}

const DEC = new TextDecoder();

/**
 * Parses a fetch Response body as SSE, yielding SseEvent objects.
 *
 * @throws if the underlying ReadableStream errors (stream abort).
 */
export async function* parseSseStream(response: Response): AsyncIterable<SseEvent> {
  if (!response.body) {
    // Empty stream — complete without yielding.
    return;
  }

  const reader = response.body.getReader();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += DEC.decode(value, { stream: true });

      // Split on double-newline (event boundary).
      const events = buffer.split(/\r?\n\r?\n/);
      // Last chunk may be incomplete — keep it in the buffer.
      buffer = events.pop() ?? "";

      for (const eventStr of events) {
        if (!eventStr.trim()) continue;

        const sseEvent = parseEventBlock(eventStr);
        if (sseEvent) {
          yield sseEvent;
        }
      }
    }

    // Flush any remaining content in the buffer.
    if (buffer.trim()) {
      const sseEvent = parseEventBlock(buffer);
      if (sseEvent) {
        yield sseEvent;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parses one SSE event block (lines separated by `\n`).
 * Returns null for comment-only or empty blocks.
 * Returns a synthetic done event for `[DONE]` sentinel.
 */
function parseEventBlock(block: string): SseEvent | null {
  let event: string | undefined;
  let data = "";

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith(": ") || line === ":") {
      // Comment line — skip.
      continue;
    }
    if (line.startsWith("event: ")) {
      event = line.slice("event: ".length).trim();
    } else if (line.startsWith("data: ")) {
      const raw = line.slice("data: ".length);
      // `[DONE]` sentinel (OpenAI-compatible streams).
      if (raw.trim() === "[DONE]") {
        return { event: "__done__", data: "[DONE]" };
      }
      data += (data ? "\n" : "") + raw;
    }
  }

  if (!data && !event) return null;
  return { event, data };
}
