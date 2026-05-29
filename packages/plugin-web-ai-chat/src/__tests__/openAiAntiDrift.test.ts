/**
 * openAiAntiDrift.test.ts — OAI-NODRIFT-1
 *
 * Source-text guard: asserts that the deferral comments are GONE from the
 * production source files after the xai-web-ai-tool-openai-compatible lift.
 *
 * The two deferral comment substrings were:
 * 1. llmProvider.ts:96  — "OpenAI-compatible: tools are NOT sent (deferred per planner's-call #3)"
 * 2. claudeStreamAdapter.ts:127-128 — "Only send tools on Anthropic provider (planner's-call #3)"
 *
 * Both were deleted in P1 (llmProvider) and P2 (claudeStreamAdapter) respectively.
 * This test reads the on-disk source files and asserts the substrings are absent,
 * so a future edit that accidentally re-introduces the deferral comment will fail CI.
 *
 * Implementation: fs.readFileSync (literal file read) + not.toContain assertions.
 * This is the same pattern as no-plaintext-key.test.ts but targeting source text
 * (not runtime values). Recommended by feature-review Rec2.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension §5
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §10.4 OAI-NODRIFT-1
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve paths relative to the test file — the internal src/ directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INTERNAL_DIR = resolve(__dirname, "..", "internal");

describe("OAI-NODRIFT-1: deferral comments are ABSENT from source files after lift", () => {
  it("llmProvider.ts does NOT contain the openai-tools-deferred comment", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "llmProvider.ts"), "utf-8");
    // The exact deferral comment substring that was deleted in P1.
    // If this comment is re-introduced, the test will fail, guarding against drift.
    expect(source).not.toContain("tools are NOT sent (deferred per planner's-call #3)");
    expect(source).not.toContain("OpenAI-compatible: tools are NOT sent");
  });

  it("claudeStreamAdapter.ts does NOT contain the anthropic-only-tools gate comment", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "claudeStreamAdapter.ts"), "utf-8");
    // The exact deferral comment substring that was deleted in P2.
    expect(source).not.toContain("Only send tools on Anthropic provider (planner's-call #3)");
    expect(source).not.toContain("Only send tools on Anthropic");
  });

  it("llmProvider.ts openai buildBody actually calls toOpenAiTools (confirms lift is not hollow)", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "llmProvider.ts"), "utf-8");
    // The lift added toOpenAiTools() call in the openai branch.
    // This assertion confirms the real serializer is present, not just a stub.
    expect(source).toContain("toOpenAiTools(tools)");
  });

  it("claudeStreamAdapter.ts does NOT have the provider==='anthropic' tools gate (confirms lift)", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "claudeStreamAdapter.ts"), "utf-8");
    // The old gate: const tools = config.provider === "anthropic" ? req.tools : undefined;
    // After P2, both providers receive the tools.
    expect(source).not.toContain('config.provider === "anthropic" ? req.tools : undefined');
    expect(source).not.toContain('"anthropic" ? req.tools : undefined');
  });
});
