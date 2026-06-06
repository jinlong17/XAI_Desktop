# P0 Carve-Out — xai-web-ai-tool-openai-compatible

**Date:** 2026-05-29
**Authority:** ADR-0010 §D4 — new feature plans require an explicit P0 carve-out commit.
**Triggering evidence:** SHIPPED tool layer was Anthropic-first (planner's-call #3 deferred openai-compatible tool support); operator directive 2026-05-29 to lift the deferral.
**Operator decision:** session directive 2026-05-29 — second of two AI enhancements (edit/delete SHIPPED first; this is the final one).

---

## 1. Background

The SHIPPED AI tool layer + edit/delete extension implement tool-use **Anthropic-first**. The codebase has explicit deferral markers for openai-compatible:
- `claudeStreamAdapter.ts:127-128` — `// Only send tools on Anthropic provider (planner's-call #3). const tools = config.provider === "anthropic" ? req.tools : undefined;`
- `llmProvider.ts:96` — `// OpenAI-compatible: tools are NOT sent (deferred per planner's-call #3).`

So when the user selects an openai-compatible provider (Groq etc.), the AI has NO tools — create/update/delete are silently unavailable. This carve-out lifts that deferral by implementing the openai-compatible tool-calling protocol.

**This is the cleanest of the AI carve-outs**: the confirmation → `web:*:*-requested` event → owning-module subscriber → reducer path is **provider-agnostic and already SHIPPED**. Only the adapter's request-serialization + streaming-response-parsing layer differs by provider. So this carve-out is **self-contained to the `plugin-web-ai-chat` adapter internals** — NO events.ts change, NO cross-plugin edits, NO new channels/subscribers.

## 2. Scope

**`xai-web-ai-tool-openai-compatible`** — Realistic v1

### In scope
- **buildBody (openai-compatible branch)**: serialize tool definitions in OpenAI function-calling format (`tools: [{ type: "function", function: { name, description, parameters } }]` + `tool_choice`); widen the openai-branch message serialization so tool round-trip turns carry assistant `tool_calls` + `tool`-role result messages (mirror the Anthropic content-block widening already SHIPPED).
- **Tool definition conversion**: a provider-agnostic tool registry → BOTH Anthropic (`{name, description, input_schema}`) and OpenAI (`{type:"function", function:{name, description, parameters}}`) serializations. Single source of truth for tool defs; two serializers. (The registry already holds the schemas; add the openai serializer.)
- **Streaming parse (openai-compatible branch)**: parse `choices[].delta.tool_calls` accumulation (index-keyed `function.arguments` string concatenation, accumulate-then-parse-once) — the openai analogue of the SHIPPED Anthropic `input_json_delta` handling. Read openai `finish_reason: "tool_calls"`.
- **Tool result round-trip (openai-compatible branch)**: format results as `tool`-role messages with `tool_call_id` (vs Anthropic's `tool_result` content block). Reuse the SHIPPED bounded round-trip orchestration (provider-agnostic above the adapter) — only the wire format differs.
- **Provider-agnostic above the seam**: the tool registry, confirmation card, event emit, subscribers, bounded round-trip counter, and no-silent-write invariant are UNCHANGED — they already operate on a normalized `toolUse` shape. This carve-out only adds the openai wire-format translation on both directions of the adapter.
- **Honest provider gating**: remove/replace the "tools not sent for openai-compatible" deferral comments with real implementation (anti-drift — comments must match code).

### Planner's call
- Whether to normalize both providers' tool-call representation into ONE internal `NormalizedToolUse` shape at the adapter boundary (preferred — keeps everything above the adapter provider-agnostic) vs branching higher up.
- openai `tool_choice` mapping from the SHIPPED Anthropic `toolChoice` ({type:"auto"|"any"|"none"|"tool"}) → openai ("auto"|"none"|"required"|{type:"function",function:{name}}).
- Streaming vs non-streaming for the openai tool path (default: match the SHIPPED streaming approach; mock golden SSE for tests).
- Test strategy for no real openai endpoint (mocked openai-format SSE golden, same as Anthropic tool-use tests).

### Out of scope
- New providers beyond the existing anthropic + openai-compatible. New tools (the 6 create/update/delete tools already SHIPPED — this carve-out makes them work on openai-compatible, adds none). events.ts / cross-plugin changes (none needed). Real-endpoint integration (operator smoke). Provider auto-detection / model-capability probing.

### Boundary (cleanest AI carve-out)
- **Self-contained to `packages/plugin-web-ai-chat/src/internal/`** (llmProvider, claudeStreamAdapter, sseParser, toolRegistry serializer) + tests + docs.
- **NO `packages/core/src/types/events.ts` edit** (provider-agnostic event path already SHIPPED).
- **NO cross-plugin edits** (tasks/calendar subscribers unchanged — they consume the same normalized events).
- The SHIPPED 4 lifelines (no-silent-write, additive events, route-independent subscriber, bounded round-trip) are PRESERVED unchanged — this carve-out operates entirely below them.

### NOT triggered
- ADR-0011 / P1 reprioritization / SHIPPED-archive reopening. New npm dep. `plugin-web-tokens`. `dev` branch. CSP (openai-compatible endpoint already allowed).

## 3. Impact

### Modified
- `packages/plugin-web-ai-chat/src/internal/llmProvider.ts` — openai-branch tools serialization + tool_choice mapping + message widening.
- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts` — lift the anthropic-only tools gate; openai tool_calls send + result round-trip.
- `packages/plugin-web-ai-chat/src/internal/sseParser.ts` (or adapter parse path) — openai `delta.tool_calls` accumulation + `finish_reason`.
- `packages/plugin-web-ai-chat/src/internal/toolRegistry.ts` — openai function-format serializer (provider-agnostic defs → 2 formats).
- `packages/xai-web-ai-chat/docs/` — design/api/test/dev_log extend.

### Created
- `docs/workflow/roadmap/xai-web-ai-tool-openai-compatible.md` (by feature-plan).

### NOT modified
- events.ts, tasks, calendar, apps/web/App.tsx (provider-agnostic path SHIPPED). Other plugins. plugin-web-tokens. registry keys. SHIPPED archives, ADR, `dev`. The Anthropic tool path (only add the openai branch; Anthropic behavior byte-stable).

## 4. Workflow path

carve-out commit → feature-plan (with current OpenAI function-calling + streaming tool_calls protocol research) → feature-review → feature-build (phases: tool-def serializer + buildBody / streaming parse / round-trip + gate-lift / tests + docs) → feature-verify → ship. Real openai-endpoint smoke DEFERRED per ADR-0008 §S3 (operator, needs a Groq/openai-compatible key).

## 5. Acceptance anchor

Satisfied when: with an openai-compatible provider + base URL + key configured, the AI offers the same create/update/delete tools (via mocked openai-format tool_calls in tests), routes them through the SAME confirmation → event → owning-reducer path (provider-agnostic), and the Anthropic path stays byte-stable — verified by automated tests (mocked openai-format SSE golden + provider-parity assertions + Anthropic-unchanged regression) + (deferred, operator) real openai-compatible-key smoke. The "tools not sent for openai" deferral comments are gone (code matches docs).
