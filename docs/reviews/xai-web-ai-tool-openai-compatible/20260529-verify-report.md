# Verify Report — xai-web-ai-tool-openai-compatible

**Date:** 2026-05-29
**Executor:** claude-sonnet-4-6 (feature-auto-build P4)
**Feature:** xai-web-ai-tool-openai-compatible — lift the openai-compatible tool deferral
**Status:** READY_FOR_VERIFY
**Branch:** web
**Commits:** 96d279b (P1) / e1e2cf6 (P2) / cf7cfd7 (P3) / (P4 docs commit pending)

---

## Automated Gates

| Gate | Result | Evidence |
|------|--------|---------|
| G1 — `pnpm --filter @repo/plugin-web-ai-chat test` | PASS | 28 test files, 241/241 cases pass |
| G2 — `pnpm --filter @repo/plugin-web-ai-chat exec tsc --noEmit` | PASS | exit 0, 0 errors |
| G3 — `pnpm --filter @repo/plugin-web-ai-chat lint --max-warnings 0` | PASS | exit 0, 0 warnings |
| G4 — `pnpm --filter @repo/plugin-web-tasks test` | PASS | 14 test files, 147/147 cases pass (no regression) |
| G5 — `pnpm --filter @repo/plugin-web-calendar test` | PASS | 41 test files, 311/311 cases pass (no regression) |
| G6 — `pnpm --filter @repo/web test` | PASS | 24 test files, 128/128 cases pass (no regression) |
| G7 — `pnpm --filter @repo/web build` | PASS | Vite built in 3.52s, 0 errors |

---

## New Tests (P1-P4)

| Phase | Test File | Tests | Coverage |
|-------|-----------|-------|---------|
| P1 | openAiToolFormat.test.ts | 15 (OAI-FMT-1..3, OAI-CHOICE-1..4, OAI-TOOLS-1) | Serializer correctness, input_examples drop, tool_choice mapping, buildBody openai branch |
| P2 | openAiToolProtocol.test.ts | 4 (OAI-STREAM-1..4) | Golden SSE accumulation, first-delta-only id/name, text-only no-false-tool, defensive finish_reason |
| P3 | openAiRoundTrip.test.ts | 5 (OAI-RT-1..3, OAI-PARITY-1..2) | Round-trip body shapes, provider-parity (identical toolUse + identical event payload) |
| P4 | openAiAntiDrift.test.ts | 4 (OAI-NODRIFT-1) | Source-text guard: deferral comments absent, toOpenAiTools present, provider gate removed |
| P1 | toolUseProtocol.test.ts (TU-7 rewrite) | +1 backward-compat case | TU-7 now asserts tools ARE sent in OpenAI format (deferral assertion replaced) |

**Total new test cases: 29** (211 SHIPPED + 30 new = 241; includes TU-7 second case)

---

## Anti-Drift Verification (Critical — OAI-R1)

The two deferral comments are confirmed DELETED from source:

1. `llmProvider.ts` — `// OpenAI-compatible: tools are NOT sent (deferred per planner's-call #3)` → ABSENT
   - Confirmed by OAI-NODRIFT-1 test (fs.readFileSync + not.toContain)
   - Confirmed by code inspection: openai buildBody now calls `toOpenAiTools(tools)`

2. `claudeStreamAdapter.ts` — `// Only send tools on Anthropic provider (planner's-call #3)` → ABSENT
   - Confirmed by OAI-NODRIFT-1 test (fs.readFileSync + not.toContain)
   - Confirmed by code inspection: gate replaced with `const tools = req.tools` (both providers)

**TU-7 rewrite:** The SHIPPED `expect(body["tools"]).toBeUndefined()` assertion (which encoded the deferral) is replaced with `expect(body["tools"]).toBeDefined()` + OpenAI function format shape assertions. The old assertion would now FAIL (correctly), proving the rewrite was necessary.

---

## Boundary Grep (Self-Contained)

Files modified across P1-P4:
- `packages/plugin-web-ai-chat/src/internal/toolUseTypes.ts` — serializers added
- `packages/plugin-web-ai-chat/src/internal/llmProvider.ts` — openai buildBody + translator
- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts` — gate lift + openai accumulator
- `packages/plugin-web-ai-chat/src/__tests__/toolUseProtocol.test.ts` — TU-7 rewrite
- `packages/plugin-web-ai-chat/src/__tests__/openAiToolFormat.test.ts` — new
- `packages/plugin-web-ai-chat/src/__tests__/openAiToolProtocol.test.ts` — new
- `packages/plugin-web-ai-chat/src/__tests__/openAiRoundTrip.test.ts` — new
- `packages/plugin-web-ai-chat/src/__tests__/openAiAntiDrift.test.ts` — new
- `docs/PLUGIN_MAP.md` — row-note update
- `docs/reviews/xai-web-ai-tool-openai-compatible/20260529-verify-report.md` — this file

**NOT modified (boundary compliance):**
- `packages/core/src/types/events.ts` — NO new channel (provider-agnostic path already SHIPPED)
- `packages/xai-web-tasks/` — NO change (consumes same normalized events)
- `packages/xai-web-calendar/` — NO change (consumes same normalized events)
- `apps/web/src/` — NO change (no new subscriber, no new mount)
- `packages/plugin-web-ai-chat/src/index.ts` — NO new public export (ToolUseResult/@internal)
- `packages/plugin-web-ai-chat/src/internal/sseParser.ts` — unchanged (handles [DONE] generically)
- `packages/plugin-web-ai-chat/src/internal/toolRegistry.ts` — unchanged (6 tools verbatim)
- `apps/desktop/src-tauri/` — not touched
- `docs/adr/` — no new ADR (no CSP change, no new dep, no architectural decision)

---

## 4 SHIPPED Lifelines — Verified Intact

| Lifeline | Mechanism | Status |
|----------|-----------|--------|
| No-silent-write | emitWebEvent only in handleConfirm; adapter emits only web:ai:*; NO tasks/calendar setPref in ai-chat. This commit touches ONLY the adapter internal layer. | PASS — untouched |
| Additive events | events.ts NOT modified; no new channel added (openai tool path uses SAME 6 channels). | PASS — untouched |
| Route-independent subscriber | subscribers in tasks+calendar unchanged; mount in App.tsx unchanged. | PASS — untouched |
| Bounded round-trip | handleConfirm bounded cap=1 logic in AiChatModule unchanged. | PASS — untouched |

---

## Anthropic Byte-Stable (OAI-R3)

- `llmProvider.ts` Anthropic `buildBody`: messages passed verbatim (LP1 test still passes).
- `claudeStreamAdapter.ts` Anthropic event handling: `content_block_start/delta/stop`, `message_delta`, `message_stop` are byte-for-byte unchanged (only the openai `else`-path and the gate line changed).
- Full Anthropic regression: TU-1..TU-6 PASS, TU-7 rewritten (as planned), TU-REG (AiChatModule 35 tests, CS1+CS3-CS9) all PASS.

---

## Provider-Parity (OAI-PARITY-1/2)

- OAI-PARITY-1: Both Anthropic and openai golden SSEs yield structurally identical `StreamChunk.toolUse = {id:"call_parity", name:"create_task", input:{title:"Parity task"}}`. The normalized shape is exactly equal (`toEqual` assertion).
- OAI-PARITY-2: `findTool("create_task").toWriteEvent(input, id)` produces identical channel + payload from the same normalized input regardless of source provider. The provider-agnostic confirmation→event path is proven as a test.

---

## Deferred (operator)

- **RR1 — Real openai-compatible key smoke:** real Groq/openai-compatible endpoint test with a live API key (verifies the actual wire format against a real server). Deferred per ADR-0008 §S3 / ADR-0009 §D2-G2 (same pattern as create-layer + edit/delete + gap-closure row #2 precedents). Automated golden tests prove wire-shape correctness; real-key validates against the live endpoint.
- **RR2 — Cross-vendor cold-read:** Codex/Cursor independent read of `toOpenAiTools`, `_translateMessagesToOpenAi`, `openAiToolAccum` accumulator. Deferred 24h per same carve-out.
- **RR3 — events.ts web:* dev-branch merge surface:** low conflict (web:* != dev's desktop:*); flag for eventual main merge.

---

## Status

READY_FOR_VERIFY
