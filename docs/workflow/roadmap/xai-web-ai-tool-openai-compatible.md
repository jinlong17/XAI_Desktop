# Roadmap Manifest — xai-web-ai-tool-openai-compatible

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260529-ai-tool-openai-compatible.md` (P0 carve-out, operator directive 2026-05-29 — second of two AI enhancements, the FINAL one; lifts the openai-compatible tool deferral so the SHIPPED 6 tools work on openai-compatible providers)
- Discovery: `docs/reviews/xai-web-ai-tool-openai-compatible/20260529-discovery-review.md`
- Source Code Reference: `packages/plugin-web-ai-chat/src/internal/{toolUseTypes.ts, llmProvider.ts, claudeStreamAdapter.ts}` (SHIPPED Anthropic-first tool layer — the 3 adapter files this carve-out modifies) + `packages/plugin-web-ai-chat/src/internal/toolRegistry.ts` (single source of truth for the 6 tool defs, READ-ONLY here)
- Init Path: `single-feature multi-phase` (one feature slice, 4 build phases; NOT a multi-row decomposition)
- Generated: 2026-05-29
- Default Automation Mode: A-Claude (manual step-by-step per CLAUDE.md; planner does not pre-commit to a loop)
- Default Dependency Semantics: `shipped` (all deps Stable/SHIPPED; the Anthropic-first tool layer it extends is SHIPPED 2026-05-29 — both create-only and edit/delete lineages)
- Default Verify Cross-vendor: `yes` — primary Codex `gpt-5.x` cold-read of the openai tool_calls parse + provider-parity + Anthropic-byte-stable + deferral-comment removal; real openai-compatible-key tool round-trip + cross-vendor smoke DEFERRED 24h (operator, needs a Groq/openai-compatible key) per ADR-0008 §S3 / ADR-0009 §D2-G2, consistent with create-layer + edit/delete + gap-closure row #2 precedent.
- Authority Anchor: **ADR-0010 §D4** — P0 is maintenance-only; new P0 feature plans require an explicit P0 carve-out commit (`dd1519b`) citing D4. This manifest does NOT supersede ADR-0010 or any SHIPPED archive.
- Boundary (cleanest AI carve-out — NO authorized expansion needed): **self-contained to `packages/plugin-web-ai-chat/src/internal/`** (`toolUseTypes.ts` + `llmProvider.ts` + `claudeStreamAdapter.ts`) + tests + docs. **NO `packages/core/src/types/events.ts` edit** (the provider-agnostic event path is SHIPPED — unlike the edit/delete carve-out, this one adds NO channel). **NO cross-plugin edit** (`xai-web-tasks`/`xai-web-calendar` subscribers consume the SAME normalized events — unchanged). **NO `apps/web` edit** (no new subscriber to mount). **NO `index.ts` edit** (no new public export). **NO `sseParser.ts`/`toolRegistry.ts` edit.**
- Branch: `web` (does NOT touch `dev`).
- Manifest Review: REQUIRED at feature-review (review the OpenAI protocol pinning §2 + the 4 planner's calls + the Anthropic byte-stable guarantee + the 4 SHIPPED lifelines stay below the seam + the anti-drift commitments [delete 2 deferral comments + rewrite SHIPPED TU-7 + source-text guard] + OQ1/OQ2/OQ3 before build).

## Feature

| Slug | Source | Depends On | Dep Semantics | Status | Automation | Verify Cross-vendor | Note |
|------|--------|------------|---------------|--------|-----------|---------------------|------|
| xai-web-ai-tool-openai-compatible | docs/reviews/_p0-carve-outs/20260529-ai-tool-openai-compatible.md | plugin-web-ai-chat (Stable, SHIPPED Anthropic-first tool layer — create + edit/delete) | shipped | NEEDS_REVIEW | A-Claude | yes (real openai-key + cross-vendor DEFERRED 24h) | Lifts the openai-compatible tool deferral. Implements the OpenAI Chat Completions function-calling wire format (request tools/tool_choice + streaming delta.tool_calls index-keyed accumulation + finish_reason + tool-role result round-trip) on the adapter so the SHIPPED 6 create/edit/delete tools work on openai-compatible providers via the SAME provider-agnostic confirmation→event→owning-reducer path. Both providers converge on the SHIPPED internal ToolUseResult shape (NO new public type). Anthropic path byte-stable. Self-contained to 3 adapter files; NO events.ts/cross-plugin/apps/web/new-channel. Anti-drift: delete 2 deferral comments + rewrite SHIPPED TU-7. 4 phases. Carve-out `dd1519b`. |

## Phase Plan (4 phases — one `feature-build` run each)

> Each phase is independently buildable + testable; `feature-build` does ONE
> phase per run then stops for human confirmation (CLAUDE.md). Full per-phase
> scope/DoD lives in `packages/xai-web-ai-chat/docs/dev_log.md` Phase Plan.
> Request direction first (P1 serializers + buildBody tools), then streaming
> parse + gate-lift (P2), then response-direction round-trip + provider-parity
> (P3), then anti-drift + docs + verify-report (P4).

| Phase | Title | Primary scope | Touches events.ts? | Key tests |
|---|---|---|---|---|
| P1 | OpenAI tool-def serializers + buildBody tools branch (request direction) | `toolUseTypes.ts` (+`OpenAiToolDef` + pure `toOpenAiTools` + `toOpenAiToolChoice`) + `llmProvider.ts` openai branch (serialize tools + tool_choice; **delete the `:96` deferral comment**) | **NO** | OAI-FMT-1..3 (shape + input_examples drop), OAI-CHOICE-1..4 (mapping), OAI-TOOLS-1 (buildBody serializes) |
| P2 | Streaming delta.tool_calls parse + finish_reason + gate-lift | `claudeStreamAdapter.ts` (lift line-128 gate `provider==="anthropic"?req.tools:undefined` → `req.tools`; **delete the `:127-128` deferral comment**; openai else-branch loop-local index-keyed accumulator + read finish_reason → toolUseResult; generalize final-chunk emit) | **NO** | OAI-STREAM-1 (golden accumulation), OAI-STREAM-2 (first-delta-only id/name), OAI-STREAM-3 (text turn), OAI-STREAM-4 (defensive finish_reason) |
| P3 | Tool-role result round-trip (response direction) + provider-parity | `llmProvider.ts` openai branch (translate `priorMessages` ContentBlock[] → openai assistant `tool_calls` + `tool`-role result; string content unchanged) | **NO** | OAI-RT-1 (assistant tool_calls body), OAI-RT-2 (tool-role result body), OAI-RT-3 (string unchanged), **OAI-PARITY-1** (same normalized toolUse), **OAI-PARITY-2** (same write-event payload) |
| P4 | Anti-drift (rewrite TU-7 + deferral-comment guard) + docs + PLUGIN_MAP + verify-report | REWRITE SHIPPED `TU-7` (assert openai tools NOW serialized) + `OAI-NODRIFT-1` source-text guard (deferral substrings gone) + OAI-REG full Anthropic regression + BC-1 + PLUGIN_MAP note + verify report | **NO** | TU-7 (rewrite), OAI-NODRIFT-1, OAI-REG (full Anthropic suite), BC-1 |

## Acceptance anchor (carve-out §5)

Satisfied when: with an openai-compatible provider + base URL + key configured, the AI offers the same 6 create/update/delete tools (via mocked openai-format `tool_calls` in tests), routes them through the **SAME** confirmation → event → owning-reducer path (provider-agnostic — proven by OAI-PARITY-1/2), and the **Anthropic path stays byte-stable** (proven by OAI-REG + the Anthropic branch being untouched in source) — verified by automated tests (mocked openai-format SSE golden + provider-parity assertions + Anthropic-unchanged regression) + (deferred, operator) real openai-compatible-key smoke. The "tools not sent for openai" deferral comments are **gone** (TU-7 rewrite + OAI-NODRIFT-1 enforce code-matches-docs).

## Planner's Calls (decided in discovery §3/§4)

1. **Normalize at the adapter boundary onto the existing `ToolUseResult` shape** (vs branch higher up) — **NORMALIZE**. `ToolUseResult {id, name, input}` is ALREADY the normalized internal shape, surfaced via `StreamChunk.toolUse` and consumed provider-agnostically by `AiChatModule`. The openai branch produces the SAME shape. **NO new public type; `index.ts` surface byte-stable.** Cleanest possible seam (discovery §3.1).
2. **`tool_choice` mapping** — SHIPPED Anthropic `toolChoice` ({auto|any|none|tool}) → openai (`auto`|`required`|`none`|`{type:"function",function:{name}}`). Implemented as a pure `toOpenAiToolChoice` + unit-tested for correctness; v1 omits `toolChoice` (→ openai `auto` default), so the only exercised path is omitted→auto. Real code, not a comment (anti-drift) (discovery §2.2/§4.2).
3. **Streaming vs non-streaming for the openai tool path** — **STREAMING** (matches the SHIPPED Anthropic default + SHIPPED openai text path; `xai_ai_streaming` defaults on). Non-streaming `tool_calls` shape documented (discovery §2.4) but not the primary path; the non-streaming `completeChat` fallback is unchanged (discovery §4.3).
4. **Test strategy with no real openai endpoint** — **mocked openai-format SSE golden** (same technique as the SHIPPED Anthropic `toolUseProtocol.test.ts` golden) + **provider-parity** assertions (same input → same normalized toolUse → same write-event payload regardless of provider). Real openai-compatible-key smoke = operator work, DEFERRED per ADR-0008 §S3 (discovery §4.4).

## Lifelines continued (SHIPPED tool-layer spine — non-negotiable; this carve-out operates ENTIRELY BELOW them)

1. **No silent write** — write event emitted EXCLUSIVELY in the `AiChatModule` Confirm handler; this carve-out does NOT touch the emit site, the channels, or `AiChatModule`. The openai path only produces the SAME `StreamChunk.toolUse` that feeds the unchanged Confirm flow. UNTOUCHED.
2. **`events.ts` additive-only** — this carve-out adds NO channel (the provider-agnostic event path is SHIPPED). `events.ts` is NOT edited. UNTOUCHED.
3. **Route-independent subscriber** — the tasks/calendar subscribers consume the SAME normalized events; not touched. UNTOUCHED.
4. **Bounded tool_result round-trip** — counter cap=1, no agentic loop; the orchestration is provider-agnostic and unchanged. The openai branch only translates the round-trip wire format inside `buildBody` (v1 single-tool-per-turn parity — OQ3). UNTOUCHED.

## Anti-drift (the repeat-risk focus — 4th same-class feature; prior 3 had 2 BLOCKs for drift)

- **Delete both deferral comments**: `claudeStreamAdapter.ts:127-128` (`// Only send tools on Anthropic provider...`) + `llmProvider.ts:96` (`// OpenAI-compatible: tools are NOT sent...`). Replaced with real implementation.
- **`OAI-NODRIFT-1`** source-text guard asserts the substrings `"tools are NOT sent"` + `"Only send tools on Anthropic provider"` are ABSENT (mirrors the SHIPPED `no-plaintext-key.test.ts` source-guard pattern).
- **Rewrite the SHIPPED `TU-7`** (`toolUseProtocol.test.ts`) which currently asserts openai `body["tools"]` is undefined — that assertion encodes the now-lifted deferral and would be a contradiction if left as-is. TU-7 is rewritten to assert the new openai serialization (keeping the no-tools→undefined backward-compat assertion).
- **`OAI-PARITY-1/2`** make the load-bearing carve-out claim ("same confirmation→event path regardless of provider") a TEST, not prose.

## Interop

- Builds on the plugin-web-ai-chat SHIPPED Anthropic-first tool layer — extends additively; does NOT mutate SHIPPED Anthropic behavior, the tool registry, the event channels, the subscribers, the confirmation card, or the round-trip orchestration. `streamCompleteChat`/`StreamRequest`/`StreamChunk`/`ToolUseResult` signatures are UNCHANGED. Only the openai branch of `buildBody`, the openai streaming else-branch + the line-128 gate, and the 2 new pure serializers change.
- The tool registry (`AI_TOOLS`, 6 Anthropic-shaped defs) stays the **single source of truth**; the Anthropic serialization is the existing identity pass-through, the OpenAI serialization is the new pure `toOpenAiTools` (drops Anthropic-only `input_examples`).
- The round-trip `priorMessages` (built unchanged by `AiChatModule` in Anthropic content-block shape) are translated to openai `tool_calls`/`tool`-role messages INSIDE the openai `buildBody` (discovery §2.6) — keeping ALL provider divergence below the adapter and `AiChatModule` byte-stable.
- openai-compatible endpoint already CSP-allowed (the openai branch already issues `${baseUrl}/chat/completions` for text). No new CSP origin. No new npm dep, no new provider, no model-id change, no new storage key, no new event channel.

## Context

This is the SECOND of two planned AI enhancements (openai-compatible tool support) and the FINAL one — the capstone of the audit-driven Web work + AI enhancements. The FIRST (edit/delete) is SHIPPED 2026-05-29 (`xai-web-ai-tool-edit-delete`). This is the **cleanest** AI carve-out: the confirmation→event→subscriber→reducer path is provider-agnostic and already SHIPPED, so the work is confined to the adapter's request-serialization + streaming-response-parsing layer (3 internal files). Lifeline continuity + Anthropic byte-stable + anti-drift (4th same-class feature; the prior-BLOCK lesson) are the non-negotiables. Real openai-key smoke + cross-vendor cold-read = operator work, DEFERRED per ADR-0008 §S3.
