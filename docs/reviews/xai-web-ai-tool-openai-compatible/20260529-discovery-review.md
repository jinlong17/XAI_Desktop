# Discovery Review — xai-web-ai-tool-openai-compatible

**Date:** 2026-05-29
**Author:** feature-plan (claude-opus-4-8[1m])
**Feature:** `xai-web-ai-tool-openai-compatible` — lift the openai-compatible tool deferral
**Authority:** ADR-0010 §D4 P0 carve-out (commit `dd1519b`)
**Carve-out (read in full):** `docs/reviews/_p0-carve-outs/20260529-ai-tool-openai-compatible.md`
**Predecessor lineages (SHIPPED):** `xai-web-ai-tool-layer` (create-only) + `xai-web-ai-tool-edit-delete` (edit/delete)
**Branch:** `web` (does NOT touch `dev`)

> This is the **2nd of two AI enhancements** (edit/delete shipped first; this is the **final** one).
> It is the **cleanest AI carve-out**: the confirmation → write-event → owning-module-subscriber →
> reducer path is **provider-agnostic and already SHIPPED**. Only the adapter's request-serialization
> + streaming-response-parsing differs by provider. The work is **self-contained to the
> `plugin-web-ai-chat` adapter internals** (4 files) + tests + docs.

---

## §1. Problem framing

The SHIPPED AI tool layer (create + edit + delete, 6 tools) implements tool-use **Anthropic-first**.
Two explicit deferral markers gate openai-compatible OFF:

- `claudeStreamAdapter.ts:128` — `const tools = config.provider === "anthropic" ? req.tools : undefined;`
  (comment: `// Only send tools on Anthropic provider (planner's-call #3).`)
- `llmProvider.ts:96` — openai-compatible `buildBody` comment `// OpenAI-compatible: tools are NOT sent (deferred per planner's-call #3).`; the openai branch only serializes `{model, messages, stream, max_tokens}`.

Consequence: when the user selects an openai-compatible provider (Groq, etc.) + base URL + key, the AI
has **NO tools** — create/update/delete are silently unavailable. This carve-out lifts the deferral by
implementing the **OpenAI Chat Completions function-calling protocol** on both directions of the adapter.

**Acceptance anchor (carve-out §5):** with an openai-compatible provider + base URL + key configured,
the AI offers the same 6 create/update/delete tools (via mocked openai-format `tool_calls` in tests),
routes them through the **SAME** confirmation → event → owning-reducer path (provider-agnostic), and the
**Anthropic path stays byte-stable** — verified by automated tests (mocked openai-format SSE golden +
provider-parity assertions + Anthropic-unchanged regression) + (deferred, operator) real openai-key
smoke. The "tools not sent for openai" deferral comments are **gone** (code matches docs).

### Why this is purely internal business logic — NO external research of *alternatives* required, but protocol research IS required

This carve-out introduces **no new npm dependency, no new provider, no library selection**. There is no
"which library" decision. BUT the carve-out explicitly mandates **protocol research**: pin the current
OpenAI function-calling wire format (request `tools`/`tool_choice`, streaming `delta.tool_calls`,
`tool`-role result round-trip) and contrast it with the SHIPPED Anthropic path. §2 below records that
research with source URLs. This is the same posture the predecessor lineages took (Anthropic tool-use
protocol was researched + pinned in `xai-web-ai-tool-layer` discovery §2). No `apps/web` host edits, no
`events.ts` edits, no cross-plugin edits.

---

## §2. Protocol research — OpenAI Chat Completions function calling (pinned 2026-05-29)

> Researched 2026-05-29 via WebSearch + WebFetch. The official `platform.openai.com/docs` guide is
> 403-blocked to automated fetch; the authoritative shapes below are pinned from the OpenAI Cookbook
> (`developers.openai.com/cookbook/...`) + the OpenAI API Reference streaming-events page
> (`developers.openai.com/api/reference/...`) + corroborating community/SDK sources. Sources listed in §9.
>
> **Endpoint already in use:** `resolveProvider` builds `${baseUrl}/chat/completions` for the
> openai-compatible branch (Chat Completions API, NOT the newer Responses API). All shapes below are the
> **Chat Completions** function-calling shapes — that is the API this carve-out integrates.

### §2.1 Request — `tools` array element (OpenAI function format)

```json
{
  "type": "function",
  "function": {
    "name": "create_task",
    "description": "Create a new task in the user's task list. ...",
    "parameters": {
      "type": "object",
      "properties": { "title": { "type": "string", "description": "..." } },
      "required": ["title"]
    }
  }
}
```

Contrast with the SHIPPED **Anthropic** tool def (`toolUseTypes.ts` `AnthropicToolDef`):

```json
{ "name": "create_task", "description": "...", "input_schema": { "type": "object", "properties": {...}, "required": [...] } }
```

**Mapping (mechanical):** Anthropic `{name, description, input_schema}` → OpenAI
`{type:"function", function:{name, description, parameters: input_schema}}`. The JSON-Schema object is
**identical** (`input_schema` ≡ `parameters`). Only the envelope differs. Anthropic's optional
`input_examples` field has **no** Chat-Completions equivalent → **dropped** in the OpenAI serialization
(examples are an Anthropic-only quality hint; not part of the OpenAI function schema).

### §2.2 Request — `tool_choice` parameter

OpenAI accepted values:
- `"auto"` — model decides (default).
- `"none"` — model will not call a function (user-facing message instead).
- `"required"` — model MUST call one of the provided functions.
- `{"type": "function", "function": {"name": "<fn>"}}` — force a specific function.

Contrast with the SHIPPED **Anthropic** `toolChoice` (`llmProvider.ts:59`):
`{type:"auto"|"any"|"none"}` | `{type:"tool"; name}`.

**Mapping (planner's-call #2 — see §4.2):**

| Anthropic `toolChoice`            | OpenAI `tool_choice`                                  |
|-----------------------------------|-------------------------------------------------------|
| `{type:"auto"}` (or omitted)      | `"auto"` (or omitted)                                 |
| `{type:"any"}`                    | `"required"`                                          |
| `{type:"none"}`                   | `"none"`                                              |
| `{type:"tool", name}`             | `{type:"function", function:{name}}`                  |

**Note for v1:** the SHIPPED tool layer never sets `toolChoice` — it relies on the Anthropic default
(`auto`). So in practice the openai branch will also omit `tool_choice` (→ `auto`). The mapping is
documented + tested for completeness/correctness, but v1's only exercised path is "omitted → auto".

### §2.3 Streaming response — `choices[].delta.tool_calls` (the critical-correctness piece)

```json
// chunk 1 (first delta of a tool call — carries id/type/name):
{ "choices": [ { "index": 0, "delta": { "tool_calls": [
  { "index": 0, "id": "call_abc123", "type": "function",
    "function": { "name": "create_task", "arguments": "" } } ] }, "finish_reason": null } ] }

// chunk 2..N (subsequent deltas — arguments fragments only, keyed by index):
{ "choices": [ { "index": 0, "delta": { "tool_calls": [
  { "index": 0, "function": { "arguments": "{\"title\":" } } ] }, "finish_reason": null } ] }
{ "choices": [ { "index": 0, "delta": { "tool_calls": [
  { "index": 0, "function": { "arguments": "\"Buy milk\"}" } } ] }, "finish_reason": null } ] }

// final chunk (finish_reason signals the tool turn):
{ "choices": [ { "index": 0, "delta": {}, "finish_reason": "tool_calls" } ] }

// stream terminator (SSE sentinel — already handled by sseParser):
data: [DONE]
```

**Critical accumulation rules (pinned — these are where same-class features drift):**
1. **`index` keys the tool call.** Only the **FIRST** delta of each tool call carries `id`, `type`,
   and `function.name`. Subsequent deltas carry **only** `function.arguments` fragments + the same
   `index`. Clients MUST track by `index`, NOT by re-reading `id` (which is `null`/absent on later
   chunks). (This is the openai analogue of Anthropic's per-content-block-index accumulation.)
2. **`function.arguments` is a string, accumulated by concatenation per `index`.** Parse with
   `JSON.parse` **ONCE** after the stream completes (never per-fragment — fragments are partial JSON).
   Direct analogue of the SHIPPED Anthropic `input_json_delta.partial_json` rule (R2 in the predecessor).
3. **`finish_reason: "tool_calls"`** on the final chunk signals the model called tool(s) — the openai
   analogue of Anthropic's `message_delta.stop_reason: "tool_use"`. The loop must read `finish_reason`
   off `choices[0]` (today the openai branch only breaks on the `[DONE]` sentinel and never reads
   `finish_reason`).
4. **Text vs tool:** if `finish_reason` is `"stop"` (or `"length"`), it's a normal text turn (today's
   `extractDeltaOpenAI` path). `"tool_calls"` ⇒ surface a tool result.

### §2.4 Non-streaming response (for completeness; v1 defaults to streaming — see §4.3)

```json
{ "choices": [ { "message": { "role": "assistant", "content": null, "tool_calls": [
  { "id": "call_abc123", "type": "function",
    "function": { "name": "create_task", "arguments": "{\"title\":\"Buy milk\"}" } } ] },
  "finish_reason": "tool_calls" } ] }
```

`function.arguments` is a complete JSON string here (no accumulation). v1 matches the SHIPPED Anthropic
**streaming-default** approach, so the non-streaming tool path is documented but not the primary path
(see §4.3).

### §2.5 Round-trip — `tool`-role result message (the second wire-shape difference)

After the user confirms and the tool executes, the round-trip turn is sent as:

```json
// assistant message that initiated the call:
{ "role": "assistant", "content": null, "tool_calls": [
  { "id": "call_abc123", "type": "function",
    "function": { "name": "create_task", "arguments": "{\"title\":\"Buy milk\"}" } } ] }

// follow-up result message (role:"tool", correlated by tool_call_id):
{ "role": "tool", "tool_call_id": "call_abc123", "content": "Tool 'create_task' executed successfully." }
```

Contrast with the SHIPPED **Anthropic** round-trip (`AiChatModule.tsx:577-591`), which uses
**content blocks** inside `user`/`assistant` messages:

```json
{ "role": "assistant", "content": [ { "type": "tool_use", "id": "toolu_01", "name": "create_task", "input": {...} } ] }
{ "role": "user", "content": [ { "type": "tool_result", "tool_use_id": "toolu_01", "content": "...", "is_error": false } ] }
```

**Key structural difference:**
- Anthropic: `tool_use`/`tool_result` are **content blocks** inside `assistant`/`user` messages.
- OpenAI: the assistant carries a top-level **`tool_calls`** array; the result is a separate
  **`tool`-role** message with a top-level `tool_call_id`. (`is_error` has no OpenAI field — a declined
  tool's result is conveyed as plain content text, e.g. `"user declined"`.)

### §2.6 The load-bearing finding — where the round-trip is built today

`AiChatModule.handleConfirm` / `handleCancel` build `priorMessages` in **Anthropic content-block shape**
(`AiChatModule.tsx:577-591` for confirm; `:421-433` for cancel) and pass them into `streamCompleteChat`.
So "provider-agnostic above the seam" is **true for the orchestration** (when to send, bounded cap=1,
single emit site) but the **wire shape of `priorMessages` is currently Anthropic-specific**. Therefore
the openai-compatible translation MUST happen **inside the adapter** (translate the incoming
Anthropic-shaped `priorMessages` content blocks into OpenAI `tool_calls`/`tool`-role messages on the
openai branch). This keeps `AiChatModule` byte-for-byte unchanged (it keeps emitting Anthropic-shaped
content blocks) and confines ALL provider divergence to the adapter — consistent with the carve-out's
"self-contained to adapter internals" boundary. (See §3 design, the `priorMessages` translator.)

---

## §3. Recommended design

### §3.1 Normalize at the adapter boundary (planner's-call #1 — **selected: normalize**)

The SHIPPED `StreamChunk.toolUse: ToolUseResult` is **already the normalized internal shape**:
`{ id: string; name: string; input: Record<string, unknown> }` (`toolUseTypes.ts:82`). It is consumed
provider-agnostically by `AiChatModule` (`chunk.toolUse` at `AiChatModule.tsx:255`). The openai branch
must produce the **SAME `ToolUseResult` shape** from `delta.tool_calls`:
- `tool_call.id` → `ToolUseResult.id` (used verbatim as the round-trip `tool_call_id`)
- `tool_call.function.name` → `ToolUseResult.name`
- `JSON.parse(accumulated function.arguments)` → `ToolUseResult.input`

So **no new public type is introduced.** `ToolUseResult` IS `NormalizedToolUse`. The adapter's two
provider branches converge on it; everything above the adapter (`StreamChunk.toolUse`, `AiChatModule`,
`toolRegistry.toConfirmation`/`toWriteEvent`, confirmation card, event emit, subscribers, bounded
round-trip) is **untouched and stays provider-agnostic**. This is the cleanest possible seam and the
reason the carve-out calls this the cleanest AI enhancement.

> Rejected alternative (branch higher up): forking provider logic in `AiChatModule` would (a) duplicate
> the state machine, (b) break the "AiChatModule unchanged" boundary, (c) leak wire-format concerns above
> the adapter. The normalized-at-adapter approach is strictly better and matches the SHIPPED design.

### §3.2 Tool definition — single source of truth, two serializers

`toolRegistry.AI_TOOLS` holds 6 `AiToolDef extends AnthropicToolDef` (Anthropic-shaped `{name,
description, input_schema}` + `toConfirmation` + `toWriteEvent`). Today `buildBody` receives
`tools: AnthropicToolDef[]` and the Anthropic branch passes them through verbatim.

Add a **pure serializer** `toolUseTypes.ts` (or a small `toolSerializers.ts` internal) :
`toOpenAiTools(defs: AnthropicToolDef[]): OpenAiToolDef[]` mapping each `{name, description,
input_schema}` → `{type:"function", function:{name, description, parameters: input_schema}}` (drop
`input_examples`). The registry stays the **single source of truth**; the Anthropic serialization is the
identity pass-through that already exists; the OpenAI serialization is the new pure function. The openai
`buildBody` branch calls `toOpenAiTools(tools)` when tools are present.

New internal type `OpenAiToolDef` in `toolUseTypes.ts` (alongside `AnthropicToolDef`), `@internal`,
NOT exported from `index.ts`.

### §3.3 `buildBody` openai branch (lift the deferral)

Replace the `// tools are NOT sent` body with: when `tools?.length`, add
`body["tools"] = toOpenAiTools(tools)` and, when `toolChoice` provided, `body["tool_choice"] =
toOpenAiToolChoice(toolChoice)` (the §2.2 mapping; omitted → openai default `auto`). Also widen the
openai branch's **message serialization** so `content: string | ContentBlock[]` round-trip turns are
translated: an assistant turn whose `content` is `[{type:"tool_use",...}]` becomes
`{role:"assistant", content:null, tool_calls:[{id,type:"function",function:{name,arguments:JSON.stringify(input)}}]}`;
a user turn whose `content` is `[{type:"tool_result", tool_use_id, content, is_error}]` becomes
`{role:"tool", tool_call_id, content}`. Plain string-content turns pass through unchanged. This is the
§2.6 translator, living at the `buildBody` seam (pure, testable).

The openai `buildBody` signature already accepts `tools?`/`toolChoice?` (they were added in the SHIPPED
P2 widening but ignored on the openai branch) — **no signature change**, only the body changes.

### §3.4 Streaming parse — openai `delta.tool_calls` branch (lift the gate)

In `streamCompleteChat`, the openai path (`claudeStreamAdapter.ts:292-297`) today only handles
`delta.content` text. Extend it with a **loop-local accumulator** mirroring the Anthropic one
(`toolAccum` map keyed by tool-call `index`):
- On each chunk, for each `choices[0].delta.tool_calls[k]`: if it carries `id`/`name` (first delta),
  record `{id, name, argsJson:""}` at its `index`; always append `function.arguments` to
  `argsJson[index]`.
- Read `choices[0].finish_reason`; when it equals `"tool_calls"`, `JSON.parse` the accumulated
  `argsJson` (the FIRST/lowest index for v1 — single tool per turn, matching the Anthropic "keep the
  last/only tool" behavior) **once**, set `toolUseResult = {id, name, input}`, and break.
- `"stop"`/`"length"`/`null` → normal text accumulation (unchanged `extractDeltaOpenAI`).
- The existing `[DONE]` sentinel handling stays.

Lift the `config.provider === "anthropic" ? req.tools : undefined` gate at line 128 to
`const tools = req.tools;` (both providers now receive the tools; each `buildBody` branch serializes
appropriately — Anthropic verbatim, openai via `toOpenAiTools`). The final-chunk emit
(`stopReason === "tool_use" && toolUseResult` → `{...,toolUse}`) generalizes to "tool turn detected by
either provider" (Anthropic `stop_reason:"tool_use"` OR openai `finish_reason:"tool_calls"` set
`toolUseResult`).

### §3.5 `sseParser` — unchanged

`sseParser.parseSseStream` already handles the openai `[DONE]` sentinel and yields `{event, data}`
generically. No change. (The carve-out lists sseParser as a candidate edit site "or adapter parse path"
— the parse-path work lands in `claudeStreamAdapter`, not sseParser; sseParser stays byte-stable. Noted
in §6 boundaries.)

### §3.6 What stays byte-stable (the Anthropic guarantee)

- `llmProvider` Anthropic branch: **untouched** (only the openai branch body changes).
- `claudeStreamAdapter` Anthropic event handling (`content_block_*` / `message_delta` /
  `input_json_delta`): **untouched**; only the openai branch (the `else` path) grows + the line-128 gate
  is generalized.
- `toolRegistry`: the 6 tool defs + `toConfirmation`/`toWriteEvent` are **untouched**; only a pure
  `toOpenAiTools` serializer is added.
- `StreamChunk` / `StreamRequest` / `ToolUseResult` / public `index.ts` surface: **unchanged** (no new
  public export).
- `AiChatModule`, `ConfirmationCard`, `contextProvider`, the 2 subscribers, `events.ts`: **untouched**.

---

## §4. Planner's calls (decisions + justification)

### §4.1 Normalize both providers into one internal shape vs branch higher — **NORMALIZE (at adapter)**

Selected: normalize at the adapter boundary onto the existing `ToolUseResult`. Justification in §3.1 —
the normalized shape already exists and is already consumed provider-agnostically; this is the minimal,
boundary-preserving choice and keeps `AiChatModule` byte-stable. No new public type.

### §4.2 `tool_choice` mapping — documented + tested, default-omitted in v1

Selected mapping table in §2.2 (`auto→auto`, `any→required`, `none→none`, `tool→{type:function,...}`).
v1 never sets `toolChoice` (relies on `auto` default), so the only **exercised** path is "omitted →
auto". The full mapping is implemented as a pure `toOpenAiToolChoice` + unit-tested for correctness so a
future increment that sets `toolChoice` is already covered (anti-drift: the mapping is real code, not a
comment).

### §4.3 Streaming vs non-streaming for the openai tool path — **STREAMING (match SHIPPED)**

Selected: streaming, matching the SHIPPED Anthropic default and the SHIPPED openai text path. The
`xai_ai_streaming` pref already defaults to streaming. The non-streaming `tool_calls` shape (§2.4) is
documented for completeness; the existing non-streaming `completeChat` fallback returns the demo string
and is out of the tool path (consistent with how the Anthropic non-streaming fallback behaves today). No
new non-streaming tool path is built in v1. Tests use mocked openai-format **SSE golden** streams (same
technique as the SHIPPED Anthropic `toolUseProtocol.test.ts` golden).

### §4.4 Test strategy with no real openai endpoint — **mocked openai-format SSE golden**

Selected: mock `fetch` with a `ReadableStream` of openai-format SSE chunks (the §2.3 golden), exactly
mirroring the SHIPPED `toolUseProtocol.test.ts` `makeStream`/`sseEvent`/`collectChunks` helpers. Assert
`StreamChunk.toolUse` equals the expected normalized `{id, name, input}`. Add **provider-parity**
assertions: the SAME tool input produces the SAME `web:*:*-requested` event payload regardless of
provider (drives the carve-out's "same confirmation→event path" guarantee). Real openai-compatible-key
smoke = operator work, **deferred** per ADR-0008 §S3 (consistent with the create + edit/delete lineages'
RR2). No new endpoint, no new dep.

---

## §5. Anti-drift commitments (the repeat-risk focus — 4th same-class feature)

The prior 3 same-class features had drift risk; 2 of the 3 were BLOCKED at least once for **docs/code
drift** (claimed-but-absent behavior). This carve-out's #1 risk is the same class. Commitments:

1. **Delete the two deferral comments.** `claudeStreamAdapter.ts:127-128` (`// Only send tools on
   Anthropic provider...`) and `llmProvider.ts:96` (`// OpenAI-compatible: tools are NOT sent...`) MUST
   be removed and replaced with real implementation. A test (or grep gate in the verify-report) asserts
   these comment substrings are GONE (code matches docs).
2. **Update the SHIPPED `TU-7` test.** `toolUseProtocol.test.ts` TU-7 currently asserts
   `body["tools"]).toBeUndefined()` for openai-compatible — that assertion encodes the deferral and will
   be **false** after this carve-out. TU-7 must be rewritten (or superseded by a new OAI-* test) to
   assert the openai branch now serializes `tools` in OpenAI function format. This is called out
   explicitly so the builder does not leave a contradictory SHIPPED test.
3. **Provider-parity assertions** prove the two providers converge on the same normalized event — the
   carve-out's load-bearing claim is a *test*, not prose.
4. **Anthropic-unchanged regression** (run the full SHIPPED Anthropic tool suite — TU-1..TU-6 minus the
   rewritten TU-7, IT-*, TS-*, CS-*) green at every phase DoD.

---

## §6. Boundaries (cleanest AI carve-out)

**Self-contained to `packages/plugin-web-ai-chat/src/internal/`** (`llmProvider.ts`,
`claudeStreamAdapter.ts`, `toolUseTypes.ts` [serializer + OpenAiToolDef type]) + tests + docs.

NOT modified (and the carve-out forbids):
- `packages/core/src/types/events.ts` — provider-agnostic event path SHIPPED; **NO new channel**.
- Cross-plugin: `xai-web-tasks`, `xai-web-calendar` subscribers + reducers — they consume the SAME
  normalized events; **unchanged**.
- `apps/web/src/App.tsx`, `apps/web/package.json` — no mount/dep change (no new subscriber).
- `sseParser.ts` — the `[DONE]` sentinel already covers openai; parse work lands in the adapter.
- `AiChatModule.tsx`, `ConfirmationCard.tsx`, `contextProvider.ts` — unchanged.
- `index.ts` public surface — no new export (`ToolUseResult`/`OpenAiToolDef` stay `@internal`).
- `plugin-web-tokens`, CSP (openai-compatible endpoint already allowed), storage registry (no new pref),
  ADR, SHIPPED archives, `dev` branch.

The **4 SHIPPED lifelines** (no-silent-write / additive events / route-independent subscriber / bounded
round-trip) are PRESERVED unchanged — this carve-out operates entirely **below** them (it only adds
openai wire-format translation; the write-emit site, the event channels, the subscribers, and the
bounded round-trip counter are all untouched).

---

## §7. Risk register

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| OAI-R1 | **docs/code drift — the repeat-BLOCK cause** (deferral comments left in / claimed-but-absent) | **CRITICAL** | §5 commitments: delete both comments + grep gate; rewrite TU-7; provider-parity + Anthropic-regression are real tests, not prose. |
| OAI-R2 | openai `delta.tool_calls` accumulation bug (parsing per-fragment / reading `id` on later chunks) | **High** | §2.3 pinned rules: track by `index`, `id`/`name` first-delta-only, `JSON.parse` ONCE after stream. OAI golden test asserts multi-fragment accumulation. |
| OAI-R3 | Anthropic path regresses (gate generalization touches shared code) | **High** | Anthropic branch byte-stable; only openai `else`-branch + line-128 gate change; full Anthropic suite green at every DoD (TU-1..TU-6, IT-*, TS-*, CS-*). |
| OAI-R4 | `priorMessages` round-trip translation wrong (content-block → tool_calls/tool-role) | **High** | §2.6 + §3.3 translator at `buildBody`; golden round-trip body test asserts assistant `tool_calls` + `tool`-role message shape. |
| OAI-R5 | `tool_choice` mapping wrong | Medium | §2.2 table; pure `toOpenAiToolChoice` + unit tests; v1 only exercises omitted→auto. |
| OAI-R6 | `finish_reason` not read (loop only breaks on `[DONE]`) | Medium | §3.4: read `choices[0].finish_reason`; `"tool_calls"` sets toolUse; OAI golden asserts. |
| OAI-R7 | `input_examples` leaks into openai schema (invalid field) | Low | `toOpenAiTools` drops `input_examples`; serializer unit test asserts the field is absent. |
| OAI-R8 | real openai-key behavior differs from mocked golden | Low | Deferred operator smoke (ADR-0008 §S3); automated proves wire-shape correctness; real-key exercises the live endpoint only. |

---

## §8. Open questions (for feature-review)

- **OQ1 — serializer file location:** add `toOpenAiTools` + `toOpenAiToolChoice` + `OpenAiToolDef` to the
  existing `toolUseTypes.ts`, or a new sibling `internal/openAiToolFormat.ts`? Planner's lean:
  **`toolUseTypes.ts`** (keeps the wire-protocol types co-located; it already holds `AnthropicToolDef`).
  Review to confirm.
- **OQ2 — `priorMessages` translation seam:** translate Anthropic-shaped content blocks → openai shape
  **inside the openai `buildBody`** (planner's lean — pure, co-located with the rest of the openai body
  build) vs a separate pre-adapter normalizer. Review to confirm `buildBody` is the right seam.
- **OQ3 — multi-tool-call in one openai turn:** OpenAI can stream multiple `tool_calls` (different
  `index`es) in one turn; the SHIPPED Anthropic path keeps only the last/only tool (v1 = single tool per
  turn). Planner's lean: **match SHIPPED** — accumulate all indices but surface only the first (lowest
  index) as `toolUse` (single-tool v1); a multi-tool agentic loop is a future increment. Review to
  confirm v1 single-tool parity is acceptable.

---

## §9. Sources (protocol research, accessed 2026-05-29)

- [Function calling | OpenAI API](https://platform.openai.com/docs/guides/function-calling) (canonical guide; 403 to automated fetch — shapes corroborated below)
- [How to call functions with chat models — OpenAI Cookbook](https://developers.openai.com/cookbook/examples/how_to_call_functions_with_chat_models) (request `tools` shape, `tool_choice`, non-streaming `tool_calls` + `finish_reason`, `tool`-role round-trip)
- [Chat Completions streaming events | OpenAI API Reference](https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events) (streaming `delta.tool_calls` shape; first-delta vs subsequent-delta fields; `finish_reason:"tool_calls"`)
- [Streaming API responses | OpenAI API](https://developers.openai.com/api/docs/guides/streaming-responses) (delta accumulation pattern, index-keyed)
- [New API feature: forcing function calling via `tool_choice: "required"` — OpenAI Developer Community](https://community.openai.com/t/new-api-feature-forcing-function-calling-via-tool-choice-required/731488) (`tool_choice:"required"` confirmation)
- [OpenAI-compatible streaming tool calls fail when function.name arrives in a later chunk — opencode #24137](https://github.com/anomalyco/opencode/issues/24137) (corroborates: `id`/`name` first-delta-only; track by `index`)
- [OpenAI-compatible streaming: finish_reason incorrectly returned as "stop" after streaming tool_calls — open-webui #21768](https://github.com/open-webui/open-webui/issues/21768) (corroborates: `finish_reason:"tool_calls"` is the tool-turn signal; some compat servers get this wrong — defensive note for OAI-R6)

> Compatibility note (for the operator smoke, OAI-R8): some openai-*compatible* servers (Groq, vLLM,
> etc.) have historically mis-set `finish_reason` to `"stop"` even when `tool_calls` were present (see
> open-webui #21768 / vLLM tool-calling docs). The adapter's parse therefore treats "any
> `delta.tool_calls` accumulated by stream end" as a tool turn even if `finish_reason` is not exactly
> `"tool_calls"` — a defensive fallback that the operator smoke validates against the real chosen
> provider. (Pinned as a parse robustness note; the golden test uses the canonical
> `finish_reason:"tool_calls"`.)
