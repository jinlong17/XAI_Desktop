/**
 * sseParser tests — SP1..SP8.
 *
 * Tests SSE protocol edge cases including buffer accumulation, comment lines,
 * DONE sentinel, server abort, and empty stream.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (sseParser)
 */

import { describe, it, expect } from "vitest";
import { parseSseStream } from "../internal/sseParser.js";

// ---- Helper: build a Response from SSE text --------------------------------

function makeSseResponse(chunks: string[], errorAfter?: boolean): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      if (errorAfter) {
        controller.error(new Error("Stream aborted by server"));
      } else {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "content-type": "text/event-stream" },
  });
}

async function collectEvents(res: Response) {
  const events = [];
  for await (const e of parseSseStream(res)) {
    events.push(e);
  }
  return events;
}

describe("sseParser (SP)", () => {
  it("SP1: single complete event — yields one event with parsed data", async () => {
    const res = makeSseResponse([
      'event: content_block_delta\ndata: {"delta":{"text":"hi"}}\n\n',
    ]);
    const events = await collectEvents(res);
    expect(events).toHaveLength(1);
    expect(events[0]?.event).toBe("content_block_delta");
    expect(events[0]?.data).toBe('{"delta":{"text":"hi"}}');
  });

  it("SP2: multiple events in one chunk — yields N events in order", async () => {
    const res = makeSseResponse([
      'data: first\n\ndata: second\n\ndata: third\n\n',
    ]);
    const events = await collectEvents(res);
    expect(events).toHaveLength(3);
    expect(events[0]?.data).toBe("first");
    expect(events[1]?.data).toBe("second");
    expect(events[2]?.data).toBe("third");
  });

  it("SP3: event split across two chunks — yields one event after second chunk", async () => {
    // The event boundary (\n\n) is split between chunks.
    const res = makeSseResponse([
      "data: hel",
      'lo\n\n',
    ]);
    const events = await collectEvents(res);
    expect(events).toHaveLength(1);
    expect(events[0]?.data).toBe("hello");
  });

  it("SP4: empty lines in middle — ignored", async () => {
    const res = makeSseResponse([
      '\n\n\ndata: signal\n\n',
    ]);
    const events = await collectEvents(res);
    expect(events).toHaveLength(1);
    expect(events[0]?.data).toBe("signal");
  });

  it("SP5: comment line at start — ignored", async () => {
    const res = makeSseResponse([
      ': keepalive\ndata: real\n\n',
    ]);
    const events = await collectEvents(res);
    expect(events).toHaveLength(1);
    expect(events[0]?.data).toBe("real");
  });

  it("SP6: [DONE] sentinel — yields one synthetic done event", async () => {
    const res = makeSseResponse([
      'data: {"content":"hello"}\n\ndata: [DONE]\n\n',
    ]);
    const events = await collectEvents(res);
    expect(events).toHaveLength(2);
    expect(events[1]?.event).toBe("__done__");
    expect(events[1]?.data).toBe("[DONE]");
  });

  it("SP7: server abort (controller.error) — iterator throws", async () => {
    const res = makeSseResponse(["data: partial\n\n"], true /* errorAfter */);
    // Iterate the stream; the error fires after the first event chunk.
    // The parseSseStream should throw when the stream errors.
    await expect(async () => {
      for await (const _e of parseSseStream(res)) {
        // consume — will error on second read
      }
    }).rejects.toThrow("Stream aborted by server");
  });

  it("SP8: empty stream — iterator completes without yielding", async () => {
    const res = makeSseResponse([]);
    const events = await collectEvents(res);
    expect(events).toHaveLength(0);
  });
});
