/**
 * claudeAdapter — completeChat tests (A1..A7).
 *
 * Verifies fail-closed behavior: no demo-success fallback on missing key,
 * unsupported local provider URL, or empty accumulated response.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { completeChat } from "../internal/claudeAdapter.js";
import { aiKeyStorage } from "../internal/secretStore.js";

describe("claudeAdapter (A)", () => {
  beforeEach(async () => {
    await aiKeyStorage.clearKey("anthropic");
    await aiKeyStorage.clearKey("openai-compatible");
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("A1: missing key fails closed with BadKey not-set", async () => {
    const fetchStub = vi.spyOn(globalThis, "fetch");
    await expect(completeChat("hi", "en")).rejects.toMatchObject({
      kind: "BadKey",
      status: 401,
      detail: "not-set",
    });
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("A2: openai-compatible without base URL fails before fetch", async () => {
    localStorage.setItem("xai_ai_provider", JSON.stringify("openai-compatible"));
    await aiKeyStorage.saveKey("openai-compatible", "sk-a2");
    const fetchStub = vi.spyOn(globalThis, "fetch");

    await expect(completeChat("hi", "en")).rejects.toMatchObject({
      kind: "BadKey",
      status: 401,
      detail: "no-url-configured",
    });
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("A3: loopback local URL is deferred and fails closed", async () => {
    localStorage.setItem("xai_ai_provider", JSON.stringify("openai-compatible"));
    localStorage.setItem("xai_ai_base_url", JSON.stringify("http://localhost:11434/v1"));
    await aiKeyStorage.saveKey("openai-compatible", "sk-a3");
    const fetchStub = vi.spyOn(globalThis, "fetch");

    await expect(completeChat("hi", "en")).rejects.toMatchObject({
      kind: "BadKey",
      status: 403,
      detail: "local-provider-not-enabled",
    });
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("A4: key configured + streaming response returns accumulated text", async () => {
    await aiKeyStorage.saveKey("anthropic", "sk-ant-a4");
    const enc = new TextEncoder();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(enc.encode('event: content_block_delta\ndata: {"delta":{"type":"text_delta","text":"Hi!"}}\n\n'));
            c.close();
          },
        }),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );

    await expect(completeChat("hello", "en")).resolves.toBe("Hi!");
  });

  it("A5: key configured + provider returns 401 re-throws BadKey", async () => {
    await aiKeyStorage.saveKey("anthropic", "sk-ant-a5");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"error":"Invalid key"}', { status: 401 }),
    );

    await expect(completeChat("hello", "en")).rejects.toMatchObject({
      kind: "BadKey",
      status: 401,
    });
  });

  it("A6: empty accumulated response throws Malformed instead of demo text", async () => {
    await aiKeyStorage.saveKey("anthropic", "sk-ant-a6");
    const enc = new TextEncoder();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(enc.encode("event: message_start\ndata: {}\n\n"));
            c.close();
          },
        }),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );

    await expect(completeChat("hello", "en")).rejects.toMatchObject({
      kind: "Malformed",
      where: "shape",
      detail: "empty accumulated assistant response",
    });
  });

  it("A7: adapter does not read or write window.claude", async () => {
    const w = globalThis as unknown as Record<string, unknown>;
    const before = "claude" in w ? w["claude"] : undefined;

    const fetchStub = vi.spyOn(globalThis, "fetch");
    await expect(completeChat("ping", "en")).rejects.toMatchObject({
      kind: "BadKey",
      status: 401,
    });
    expect(fetchStub).not.toHaveBeenCalled();

    const after = "claude" in w ? w["claude"] : undefined;
    expect(after).toBe(before);
  });
});
