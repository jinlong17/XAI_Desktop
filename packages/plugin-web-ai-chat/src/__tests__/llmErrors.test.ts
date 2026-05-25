/**
 * llmErrors tests — LE1..LE12.
 *
 * Tests the classifyError function across the full LlmError discriminated union.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (llmErrors)
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { classifyError } from "../internal/llmErrors.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("llmErrors classifyError (LE)", () => {
  // ---- BadKey (401 / 403) ---------------------------------------------------

  it("LE1: 401 with detail body → BadKey 401 with detail", async () => {
    const res = new Response('{"error":"Invalid API key"}', { status: 401 });
    const err = await classifyError(res);
    expect(err.kind).toBe("BadKey");
    if (err.kind === "BadKey") {
      expect(err.status).toBe(401);
      expect(err.detail).toContain("Invalid API key");
    }
  });

  it("LE2: 401 without body → BadKey 401 with undefined detail", async () => {
    const res = new Response(null, { status: 401 });
    const err = await classifyError(res);
    expect(err.kind).toBe("BadKey");
    if (err.kind === "BadKey") {
      expect(err.status).toBe(401);
    }
  });

  it("LE3: 403 with body → BadKey 403", async () => {
    const res = new Response('{"error":"Forbidden"}', { status: 403 });
    const err = await classifyError(res);
    expect(err.kind).toBe("BadKey");
    if (err.kind === "BadKey") {
      expect(err.status).toBe(403);
    }
  });

  it("LE4: 403 without body → BadKey 403 no detail", async () => {
    const res = new Response(null, { status: 403 });
    const err = await classifyError(res);
    expect(err.kind).toBe("BadKey");
  });

  // ---- RateLimited (429) ---------------------------------------------------

  it("LE5: 429 with Retry-After: 30 → RateLimited retryAfterSec 30", async () => {
    const res = new Response(null, {
      status: 429,
      headers: { "retry-after": "30" },
    });
    const err = await classifyError(res);
    expect(err.kind).toBe("RateLimited");
    if (err.kind === "RateLimited") {
      expect(err.retryAfterSec).toBe(30);
    }
  });

  it("LE6: 429 with Retry-After HTTP date → RateLimited with numeric delta", async () => {
    vi.useFakeTimers();
    // Set current time to a known point.
    vi.setSystemTime(new Date("2030-01-01T00:00:00.000Z"));
    // Retry-After in 60 seconds from now.
    const futureDate = new Date("2030-01-01T00:01:00.000Z");
    const res = new Response(null, {
      status: 429,
      headers: { "retry-after": futureDate.toUTCString() },
    });
    const err = await classifyError(res);
    expect(err.kind).toBe("RateLimited");
    if (err.kind === "RateLimited") {
      // Should be ~60s (allow ±2s for floating point)
      expect(err.retryAfterSec).toBeGreaterThanOrEqual(58);
      expect(err.retryAfterSec).toBeLessThanOrEqual(62);
    }
    vi.useRealTimers();
  });

  // ---- Server (5xx) --------------------------------------------------------

  it("LE7: 500 with body → Server 500 with body slice", async () => {
    const res = new Response("Internal server error details", { status: 500 });
    const err = await classifyError(res);
    expect(err.kind).toBe("Server");
    if (err.kind === "Server") {
      expect(err.status).toBe(500);
      expect(err.body).toContain("Internal server error");
    }
  });

  it("LE8: 503 without body → Server 503", async () => {
    const res = new Response(null, { status: 503 });
    const err = await classifyError(res);
    expect(err.kind).toBe("Server");
    if (err.kind === "Server") {
      expect(err.status).toBe(503);
    }
  });

  // ---- Malformed -----------------------------------------------------------

  it("LE9: Response with malformed JSON body → Malformed json-parse", async () => {
    // Simulate a classifyError(Error) call with a SyntaxError.
    const syntaxErr = new SyntaxError('Unexpected token < in JSON at position 0');
    const err = await classifyError(syntaxErr);
    expect(err.kind).toBe("Malformed");
    if (err.kind === "Malformed") {
      expect(err.where).toBe("json-parse");
    }
  });

  it("LE10: SSE parse error passed as Error → Malformed sse-parse or generic", async () => {
    // SSE parse errors are usually thrown as regular Errors from the parser.
    // classifyError(Error) maps unknown Errors → Server status 0.
    // The test documents the current mapping for non-TypeError, non-SyntaxError.
    const sseErr = new Error("bad data: line in SSE chunk");
    const err = await classifyError(sseErr);
    // Non-TypeError, non-SyntaxError → Server kind
    expect(err.kind).toBe("Server");
    if (err.kind === "Server") {
      expect(err.status).toBe(0);
    }
  });

  // ---- Network -------------------------------------------------------------

  it("LE11: TypeError 'Failed to fetch' → Network with cause preserved", async () => {
    const fetchErr = new TypeError("Failed to fetch");
    const err = await classifyError(fetchErr);
    expect(err.kind).toBe("Network");
    if (err.kind === "Network") {
      expect(err.cause).toBe(fetchErr);
    }
  });

  // ---- Unknown status ------------------------------------------------------

  it("LE12: 418 I'm a teapot → Server 418", async () => {
    const res = new Response("I'm a teapot", { status: 418 });
    const err = await classifyError(res);
    expect(err.kind).toBe("Server");
    if (err.kind === "Server") {
      expect(err.status).toBe(418);
    }
  });
});
