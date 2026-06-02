/**
 * llmProvider tests — LP1..LP6.
 *
 * Tests provider resolution logic: URL, headers, body shape, model mapping.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (llmProvider)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { resolveProvider, ANTHROPIC_MODEL_IDS } from "../internal/llmProvider.js";

beforeEach(() => {
  // Reset prefs to defaults before each test.
  localStorage.clear();
});

describe("llmProvider resolveProvider (LP)", () => {
  it("LP1: Anthropic provider + model 'haiku' — correct URL/headers/body", () => {
    // Default: anthropic (no prefs set).
    const config = resolveProvider("sk-ant-test-key");

    expect(config.provider).toBe("anthropic");
    expect(config.url).toBe("https://api.anthropic.com/v1/messages");
    expect(config.headers["x-api-key"]).toBe("sk-ant-test-key");
    expect(config.headers["anthropic-version"]).toBeTruthy();
    expect(config.headers["anthropic-dangerous-direct-browser-access"]).toBe("true");

    const body = config.buildBody({
      modelId: ANTHROPIC_MODEL_IDS["haiku"],
      messages: [{ role: "user", content: "hi" }],
      stream: true,
    });
    expect(body["model"]).toBe(ANTHROPIC_MODEL_IDS["haiku"]);
    expect((body["messages"] as unknown[])).toHaveLength(1);
    expect(body["stream"]).toBe(true);
    expect(body["max_tokens"]).toBe(1024);
  });

  it("LP2: OpenAI-compatible provider — correct URL/headers/body", () => {
    localStorage.setItem("xai_ai_provider", JSON.stringify("openai-compatible"));
    localStorage.setItem("xai_ai_base_url", JSON.stringify("https://api.groq.com/openai/v1"));

    const config = resolveProvider("gsk_test");

    expect(config.provider).toBe("openai-compatible");
    expect(config.url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(config.headers["authorization"]).toBe("Bearer gsk_test");

    const body = config.buildBody({
      modelId: "haiku",
      messages: [{ role: "user", content: "hi" }],
      stream: true,
    });
    expect(body["model"]).toBe("haiku");
    expect(body["stream"]).toBe(true);
  });

  it("LP3: OpenAI-compatible with empty base URL — throws config error", () => {
    localStorage.setItem("xai_ai_provider", JSON.stringify("openai-compatible"));
    localStorage.setItem("xai_ai_base_url", JSON.stringify(""));

    expect(() => resolveProvider("key")).toThrow(/base URL/i);
  });

  it("LP4: Provider switch via xai_ai_provider pref", () => {
    // Start anthropic (default).
    const anthropicConfig = resolveProvider("key-a");
    expect(anthropicConfig.provider).toBe("anthropic");

    // Switch to openai-compatible.
    localStorage.setItem("xai_ai_provider", JSON.stringify("openai-compatible"));
    localStorage.setItem("xai_ai_base_url", JSON.stringify("https://api.groq.com/openai/v1"));
    const oaiConfig = resolveProvider("key-b");
    expect(oaiConfig.provider).toBe("openai-compatible");
    expect(oaiConfig.url).toContain("api.groq.com");
  });

  it("LP5: Model picker override — body.model is sonnet real id", () => {
    const config = resolveProvider("sk-ant-test");
    const modelId = config.resolveModelId("sonnet");
    expect(modelId).toBe(ANTHROPIC_MODEL_IDS["sonnet"]);

    const body = config.buildBody({
      modelId,
      messages: [{ role: "user", content: "test" }],
      stream: true,
    });
    expect(body["model"]).toBe(ANTHROPIC_MODEL_IDS["sonnet"]);
  });

  it("LP6: Stream pref OFF — body.stream is false", () => {
    localStorage.setItem("xai_ai_streaming", "false");
    const config = resolveProvider("sk-ant-test");
    const body = config.buildBody({
      modelId: ANTHROPIC_MODEL_IDS["haiku"],
      messages: [{ role: "user", content: "test" }],
      stream: false,
    });
    expect(body["stream"]).toBe(false);
  });
});
