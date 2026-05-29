/**
 * openAiAntiDrift.test.ts — OAI-NODRIFT-1
 *
 * Source-text guard: asserts that ALL deferral comments are GONE from the
 * production source files after the xai-web-ai-tool-openai-compatible lift.
 *
 * Original deferral comment substrings deleted in P1/P2:
 * 1. llmProvider.ts:96  — "OpenAI-compatible: tools are NOT sent (deferred per planner's-call #3)"
 * 2. claudeStreamAdapter.ts:127-128 — "Only send tools on Anthropic provider (planner's-call #3)"
 *
 * Residual deferral docstring substrings fixed in verify-B1 fix (2026-05-29):
 * 3. claudeStreamAdapter.ts StreamRequest.tools JSDoc — "Omitted for openai-compatible (planner's-call #3 — deferred)"
 * 4. llmProvider.ts ProviderConfig.buildBody JSDoc — "Optional tools array (Anthropic branch only)"
 * 5. llmProvider.ts ProviderConfig.buildBody JSDoc — "Optional toolChoice (Anthropic branch only)"
 *
 * All five deferral phrases must be ABSENT — both the old code-comment form
 * and the JSDoc form — so this guard catches any future re-introduction of
 * ANY deferral language in these two files.
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
  it("llmProvider.ts does NOT contain the openai-tools-deferred comment (original P1 deletion)", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "llmProvider.ts"), "utf-8");
    // Original deferral comment deleted in P1.
    expect(source).not.toContain("tools are NOT sent (deferred per planner's-call #3)");
    expect(source).not.toContain("OpenAI-compatible: tools are NOT sent");
  });

  it("claudeStreamAdapter.ts does NOT contain the anthropic-only-tools gate comment (original P2 deletion)", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "claudeStreamAdapter.ts"), "utf-8");
    // Original deferral comment deleted in P2.
    expect(source).not.toContain("Only send tools on Anthropic provider (planner's-call #3)");
    expect(source).not.toContain("Only send tools on Anthropic");
  });

  it("claudeStreamAdapter.ts StreamRequest.tools JSDoc does NOT contain residual deferral language (verify-B1 fix)", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "claudeStreamAdapter.ts"), "utf-8");
    // Residual deferral docstring fixed in verify-B1: the JSDoc for StreamRequest.tools
    // previously said "Omitted for openai-compatible (planner's-call #3 — deferred)".
    // Both the exact phrase and its key substrings must be absent.
    expect(source).not.toContain("Omitted for openai-compatible");
    expect(source).not.toContain("planner's-call #3 — deferred");
    expect(source).not.toContain("planner's-call #3");
  });

  it("llmProvider.ts ProviderConfig.buildBody JSDoc does NOT say tools/toolChoice are Anthropic-branch-only (verify-B1 fix)", () => {
    const source = readFileSync(resolve(INTERNAL_DIR, "llmProvider.ts"), "utf-8");
    // Residual deferral docstrings fixed in verify-B1: the buildBody JSDoc previously
    // described tools and toolChoice as "(Anthropic branch only)". Both providers now
    // serialize these fields, so the phrase must be absent.
    expect(source).not.toContain("Anthropic branch only");
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
