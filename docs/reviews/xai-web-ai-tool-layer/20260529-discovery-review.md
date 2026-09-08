# Discovery Review — xai-web-ai-tool-layer

> **Status:** DRAFT for feature-review
> **Date:** 2026-05-29
> **Author:** claude-opus-4-8[1m] (feature-plan)
> **Feature:** `xai-web-ai-tool-layer` — give the AI chat (a) READ access to real app context and (b) PROPOSE→CONFIRM→EXECUTE write actions (create task / create calendar event), no silent writes.
> **Authority:** ADR-0010 §D4 (P0 maintenance carve-out). Carve-out commit `e101bc6`. Full scope: `docs/reviews/_p0-carve-outs/20260529-ai-tool-layer.md` (READ IN FULL).
> **Branch:** `web` (does NOT touch `dev`).
> **Code package:** `packages/plugin-web-ai-chat/` · **Docs package:** `packages/xai-web-ai-chat/docs/`.
> **Pipeline position:** this is the FINAL item-3 audit cluster (all other audit items SHIPPED).

---

## §1. Problem framing

`plugin-web-ai-chat` already ships a real streaming LLM stack (gap-closure row #2, SHIPPED 2026-05-25):
`claudeAdapter.completeChat` / `streamCompleteChat` (SSE), `llmProvider.resolveProvider` (Anthropic + openai-compatible via `ProviderConfig.buildBody`), `secretStore.aiKeyStorage` (IndexedDB + WebCrypto AES-GCM-256), `LlmError` taxonomy + `ErrorBanner`, conversation list persistence (`makeConvoFromUserText` / `isAiConvoRecord`), and a `demoReply` no-key fallback. Two `web:ai:*` event channels (`web:ai:rate-limited`, `web:ai:request-failed`) live in `packages/core/src/types/events.ts`.

The 3e usability gap: the AI is **blind and inert**.
- **Blind:** `buildBody` sends only `messages: [{ role, content: string }]`. The model has zero visibility into the user's real `xai_task_cols` / `xai_calendar_events` / `xai_pomodoro_sessions` / `xai_habits_state`. It cannot answer "what's on today?" / "summarize my day."
- **Inert:** there is no tool definition, no `tool_use` parse, no action execution, no confirmation. The AI cannot create anything.

This feature adds a **full tool layer**: context provider (read) + tool-use protocol on the adapter + a typed tool registry + a mandatory in-chat confirmation card for writes + a new typed event channel so the OWNING module (tasks / calendar) executes the write through its own reducer. v1 write tools = `create_task` + `create_calendar_event` (create-only; edit/delete deferred).

### Type of feature
**Business-orchestration + project-specific protocol integration.** Not a "pick a library" decision. The only external-technology research required is **pinning the current Anthropic Messages API tool-use wire protocol** (done in §2). No new npm dep, no new provider, no new CSP origin (Anthropic already allow-listed). Per SOP §1.5 the library-scan dimension is N/A; the protocol-pinning dimension is mandatory and is the bulk of this discovery.

---

## §2. RESEARCH — Anthropic Messages API tool-use protocol (pinned 2026-05-29)

Sources (all `platform.claude.com`, formerly `docs.anthropic.com` — 301 redirect observed 2026-05-29):
- Tool use overview — https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
- Define tools (schemas + tool_choice) — https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use
- Streaming messages (SSE tool_use sequence) — https://platform.claude.com/docs/en/api/messages-streaming

### §2.1 Tool definition shape (`tools` request param)
Each entry of the top-level `tools` array (client tool):

```json
{
  "name": "get_weather",
  "description": "Get the current weather in a given location",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": { "type": "string", "description": "The city and state, e.g. San Francisco, CA" }
    },
    "required": ["location"]
  }
}
```

- `name` MUST match `^[a-zA-Z0-9_-]{1,64}$`. (→ our tool ids `create_task` / `create_calendar_event` are valid.)
- `description` is the single highest-leverage field — Anthropic guidance: ≥3–4 sentences, say what it does / when to use / what each param means / caveats.
- `input_schema` is a JSON-Schema `type:"object"` with `properties` + `required`.
- Optional `input_examples` (array of valid example inputs) is supported on client tools and improves call quality for format-sensitive params; OPTIONAL for v1 (cheap, ~20–50 tokens each; planner recommends using it for the date/time params).

### §2.2 `tool_choice` (controls whether/which tool fires)
Four options: `auto` (default when tools present — model decides), `any` (must use some tool), `tool` (force a named tool), `none`. **Decision: `tool_choice` omitted → `auto`** for v1 (the AI must be free to answer read questions in plain text AND to choose a write tool when asked). NOTE pinned from docs: `any`/`tool` are incompatible with extended thinking and prefill the assistant (suppress preamble text) — we want neither, so `auto` is correct.

### §2.3 Non-streaming assistant response with a tool call
`stop_reason: "tool_use"` and a `tool_use` content block in `content[]`:

```json
{
  "role": "assistant",
  "content": [
    { "type": "text", "text": "I'll create that task for you." },
    { "type": "tool_use", "id": "toolu_01A09q90qw90lq917835lq9", "name": "create_task",
      "input": { "title": "Buy milk", "bucket": "next7" } }
  ]
}
```
A response may contain BOTH a leading `text` block (natural-language preamble) AND one or more `tool_use` blocks. Our parser MUST handle the text block (render it) and the tool_use block(s) (surface as confirmation card).

### §2.4 Follow-up `tool_result` round-trip
After the app executes the tool, it appends a **user** message whose content is a `tool_result` block referencing the `tool_use.id`:

```json
{
  "role": "user",
  "content": [
    { "type": "tool_result", "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
      "content": "Created task \"Buy milk\" in Next 7 Days.", "is_error": false }
  ]
}
```
- `tool_use_id` MUST equal the `tool_use.id` from the assistant turn.
- `content` is a string (or content-block array) describing the result; `is_error: true` signals failure.
- Conversation sequence: `user(prompt)` → `assistant(text + tool_use)` → `user(tool_result)` → `assistant(final text)`. The message array must carry the assistant tool_use turn verbatim before the tool_result turn.

### §2.5 Streaming SSE sequence for a `tool_use` block (PINNED — literal)
For `"stream": true`, a tool call arrives as:

```
event: content_block_start
data: {"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"toolu_01T1...","name":"get_weather","input":{}}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\"location\":"}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":" \"San Francisc"}}
... (more input_json_delta) ...

event: content_block_stop
data: {"type":"content_block_stop","index":1}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"tool_use","stop_sequence":null},"usage":{"output_tokens":89}}

event: message_stop
data: {"type":"message_stop"}
```

Pinned facts that drive our adapter design:
1. `content_block_start` carries `content_block:{type:"tool_use", id, name, input:{}}` (input starts EMPTY).
2. Tool input arrives as `delta:{type:"input_json_delta", partial_json:"..."}` — **partial JSON string fragments**. They must be **concatenated per content-block index** and `JSON.parse`d **once** at the block's `content_block_stop` (NOT per-delta — fragments are not individually valid JSON). Docs note: "the deltas are partial JSON strings, whereas the final `tool_use.input` is always an object."
3. `stop_reason: "tool_use"` appears in the `message_delta` event near the end — this is the streaming signal that the turn ended on a tool call.
4. A streaming response may interleave a `text` block (index 0) BEFORE the `tool_use` block (index 1). Our parser must track per-index block type.
5. Existing `sseParser.parseSseStream` already buffers across chunk boundaries and yields `{event, data}` — REUSE it. The change is in `claudeStreamAdapter` / `extractDelta`, which today only reads `delta.text` / `choices[0].delta.content`.

### §2.6 `buildBody` extension (the central wire-shape change)
Current `ProviderConfig.buildBody({ modelId, messages: Array<{role, content: string}>, stream, maxTokens })`. Two changes required:
1. **Accept tools.** Add optional `tools?: AnthropicToolDef[]` (+ optional `toolChoice`) → emit `tools` (+ `tool_choice`) in the Anthropic body. (openai-compatible: deferred — see §4.3.)
2. **Accept content-block messages.** The `messages[].content` type must widen from `string` to `string | ContentBlock[]` so the round-trip can carry an assistant `tool_use` turn and a user `tool_result` turn. The Anthropic API accepts `content` as either a plain string or an array of content blocks — so a string stays valid for normal turns; only tool round-trip turns use the array form. **Backward-compatible**: existing call sites that pass `content: "text"` are unaffected.

This is exactly the brief's flagged concern ("content is string, tool-use needs content blocks array"). Resolution: widen the union additively, keep string the default.

### §2.7 Model id note
The pinned `ANTHROPIC_MODEL_IDS` constants (`claude-haiku-4-5-20251101` / `claude-sonnet-4-5-20251001` / `claude-opus-4-5-20251001`) are unchanged by this feature. The current docs show newer models (e.g. `claude-opus-4-8`) but swapping model strings is OUT OF SCOPE (would be a separate, trivial constant bump). Tool use is supported on all pinned models (Haiku 4.5 / Sonnet 4.5 / Opus 4.5 all in the tool-use token table). v1 default model stays `xai_ai_model_default` (`haiku`).

---

## §3. Existing codebase anchors (verified by reading source)

| Anchor | Path | Relevance |
|---|---|---|
| `streamCompleteChat` generator | `plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts` | Today yields `{accumulated, done}` text-only; `extractDelta` only handles `text_delta` / openai `delta.content`. MUST be extended to surface tool_use blocks + `stop_reason:"tool_use"`. |
| `resolveProvider` + `buildBody` | `plugin-web-ai-chat/src/internal/llmProvider.ts` | `buildBody` signature widened per §2.6. Anthropic branch adds `tools`/`tool_choice`; messages content widened to blocks. |
| `parseSseStream` | `plugin-web-ai-chat/src/internal/sseParser.ts` | Reused unchanged (buffers across chunks, yields `{event,data}`). |
| `AiChatModule` FIFO queue processor | `plugin-web-ai-chat/src/AiChatModule.tsx` | `processQueue` consumes the stream + mutates a placeholder bubble. Must be extended to detect a tool-call result, render a confirmation card, and on Confirm run the bounded second round-trip. |
| Tasks create reducer | `xai-web-tasks/src/internal/tasksReducer.ts` `addCard(prev: TaskCol[], draft: NewTaskDraft, targetBucket: BucketId, now?)` | Pure. Persists into `xai_task_cols`. `addCard` is INTERNAL (not in tasks `index.ts`). `NewTaskDraft = { title, tag?, withDate }`; `BucketId = overdue|next7|later|nodate`; `TaskTagId = study|work|personal|todo|other`. |
| Tasks consumer pattern | `xai-web-tasks/src/TasksModule.tsx` | `const next = addCard(taskCols, draft, targetBucket); setRawCols(next);` via `usePref("xai_task_cols")`. |
| Calendar create reducer | `xai-web-calendar/src/internal/eventStore/eventStore.ts` `createEvent(store, partial)` + hook `useUserCalEvents` | Pure + React hook. Persists into `xai_calendar_events` (`Record<string, UserCalEvent>`). **`createEvent`, `useUserCalEvents`, `UserCalEvent` are ALREADY PUBLIC** via calendar `index.ts`. `UserCalEvent = { id, title, startISO("YYYY-MM-DDTHH:MM" local), endISO(same day, ≥+5min), colorPreset(mint default), recurrence(null default), createdAt, updatedAt }`. |
| Read-selector precedent (#3d/#3b) | `xai-web-dashboard-widgets/src/internal/dataReads/*` (`calUpcoming.ts`, `isUserCalEventMap.ts`) + `plugin-web-statistics/src/internal/narrowTaskCols.ts` | The canonical pattern: pure selector takes the raw `usePref(key)` value (`unknown`) + `now`, re-validates at the boundary with a LOCAL predicate (no cross-plugin import), drops malformed entries silently. Context provider COPIES this pattern. |
| Imperative store access | `plugin-web-storage` `getPref(key)` / `setPref(key, value)` | Non-React read/write. Used by `llmProvider` already (`getPref`). KEY for the write-subscriber design (§5.4). |
| Event bus | `xai-web-event-bus` `emitWebEvent(key,payload)` / `useWebEventListener(key,handler)` | Typed off `@repo/core/types/events.ts` EventMap. The new write channel is added here. |

**PLUGIN_MAP status check:** `plugin-web-ai-chat` Stable · `plugin-web-tasks` Stable · `plugin-web-calendar` Stable. All three may be depended on / extended (no mocking needed). All four context-source keys (`xai_task_cols`, `xai_calendar_events`, `xai_pomodoro_sessions`, `xai_habits_state`) are SHIPPED registry entries.

---

## §4. Candidate options + tradeoffs

### §4.1 OPTION A (RECOMMENDED) — Context-injection for READ + tool-use for WRITE; bounded single round-trip; new typed write event channel; subscribers execute via owning-module reducer over `setPref`

- **Read** = plain context injected into the system/first-user message (NOT a tool). A compact, token-budgeted snapshot built by a `contextProvider` that reuses the dataReads selector pattern.
- **Write** = `create_task` + `create_calendar_event` tools. On `stop_reason:"tool_use"`, render an in-chat **confirmation card**; on explicit Confirm, emit a typed write event; on Cancel, emit a `tool_result(is_error:true, "user declined")` and finish.
- **Round-trip** = bounded: ONE tool round-trip. After Confirm+execute, send ONE `tool_result` turn and stream the model's final acknowledgement. NO unbounded agentic loop (hard cap = 1 tool turn per send).
- **Cross-plugin write** = AI handler emits `web:*:create-requested` → owning module subscriber consumes → runs its own pure reducer (`addCard`/`createEvent`) → `setPref`. No cross-plugin import.

**Pros:** Minimal blast radius; reuses every SHIPPED seam (sseParser, resolveProvider, secretStore, dataReads pattern, both reducers); confirmation is structurally enforced (write event only emitted on Confirm); clean boundaries (events.ts channel + additive subscriber, both carve-out-authorized); honest no-key degradation preserved.
**Cons:** `buildBody` + adapter must learn content-blocks + tool_use parsing (real but contained, ~2 phases); the read context is a point-in-time snapshot (the model can be slightly stale if the user mutates mid-conversation — acceptable for v1).

### §4.2 OPTION B — Read also as a tool (`get_today_context` tool the model calls)
Make context retrieval a tool the model invokes when it needs data, instead of always injecting it.
**Pros:** Token-efficient when the user asks non-data questions; "agentic" feel.
**Cons:** Requires a 2-turn round-trip for EVERY data question (model calls read tool → result → answer), doubling latency + token cost for the most common case ("what's on today?"); pushes us toward a multi-turn loop (the brief explicitly wants bounded single round-trip); the read tool result would still need confirmation-free auto-execution, complicating the "no silent action" story (reads are safe but it blurs the line). **Rejected** — the carve-out default is "context injection, not a tool," and it is the simpler, lower-latency choice. (Recorded as planner's-call #2 below.)

### §4.3 OPTION C — Full openai-compatible tool parity now
Implement tool-calling for both Anthropic and openai-compatible providers in v1.
**Pros:** Feature-complete across both providers.
**Cons:** openai-compatible tool-calling uses a DIFFERENT wire shape (`tools:[{type:"function",function:{name,parameters}}]`, `tool_calls` in `choices[].delta`, `role:"tool"` result messages) — a whole second parser + builder + test matrix, roughly doubling P2+P3 cost, for a secondary provider that is BYO-endpoint and untested against real keys. **Rejected for v1** — Anthropic-first; openai-compatible tool support DEFERRED (documented as planner's-call #3). When a user has openai-compatible selected, tools are simply not sent and the AI behaves as today (read context still injected as plain text, which IS provider-agnostic; only the WRITE tools are Anthropic-gated in v1).

**Decision: OPTION A.**

---

## §5. OPTION A design detail

### §5.1 Context provider (READ — plain injection)
New `internal/contextProvider.ts`:
- `buildTodayContext(now: Date): { text: string; isEmpty: boolean }` — a pure function that reads the four keys via `getPref` and renders a compact, deterministic bilingual-neutral text block (English labels; the model localizes its reply to the chat `lang`). Token budget target: ≤ ~600 tokens.
- Each source is narrowed by a LOCAL predicate copied from the dataReads precedent (NO cross-plugin import):
  - `xai_task_cols` → narrow like `narrowTaskCols`; emit today's + overdue open tasks (title + bucket + done flag), capped (e.g. top 20).
  - `xai_calendar_events` → narrow like `isUserCalEventMap` + a local `todayEvents` selector (events whose `startISO` date === today, recurrence expanded for today only); emit title + time.
  - `xai_pomodoro_sessions` → narrow + sum today's focus minutes + count.
  - `xai_habits_state` → narrow + today's checked/total habits.
- Injection point: prepended to the FIRST user turn (or a `system` field) on every send when a key is configured. When all four are empty → `isEmpty:true` and a short "no data yet today" line (keeps the model honest instead of hallucinating).
- **No write.** Pure read. No new storage key.

### §5.2 Tool registry (WRITE)
New `internal/toolRegistry.ts`:
- `interface AiToolDef { name; description; input_schema; toConfirmation(input): ConfirmationSpec; toWriteEvent(input): { channel; payload } }` — typed registry, each tool owns its JSON schema + how to render the confirmation + which write event to emit.
- v1 entries (planner's-call #1):
  - **`create_task`** — `input_schema`: `{ title: string (req), bucket?: "overdue"|"next7"|"later"|"nodate" (default "next7"), tag?: "study"|"work"|"personal"|"todo"|"other" }`. Maps to `NewTaskDraft` + `BucketId`. Rich description per Anthropic guidance.
  - **`create_calendar_event`** — `input_schema`: `{ title: string (req), date: string "YYYY-MM-DD" (req), startTime?: "HH:MM" (default "09:00"), durationMin?: number (default 60) }`. Maps to `UserCalEvent` (compute `startISO`/`endISO` local-clock, same-day, ≥+5min; `colorPreset:"mint"`, `recurrence:null`). `input_examples` provided for date/time.
- The adapter pulls `tools` = `registry.map(t => ({name, description, input_schema}))` and passes to `buildBody` when provider===anthropic AND a key is set.
- **NO `summarize_today` tool** — read is context injection (§5.1), not a tool.

### §5.3 Confirmation layer (MANDATORY — no silent writes)
- New `ConfirmationCard.tsx` rendered inside the thread when a tool call is pending: shows tool label + the proposed action in human terms (e.g. "Create task: 'Buy milk' in Next 7 Days") + **Confirm** / **Cancel**.
- State machine (extends the SHIPPED FIFO/streaming machine; see design.md §state):
  `streaming → (stop_reason:"tool_use") → pendingConfirmation(toolUse) → [Confirm] execute+toolResult+finalStream → idle` OR `[Cancel] toolResult(is_error) + idle`.
- **Invariant (test-enforced):** the write event is emitted ONLY in the Confirm handler. A test asserts that reaching `pendingConfirmation` and NOT clicking Confirm emits ZERO write events and mutates ZERO store keys ("no silent write" — acceptance anchor).

### §5.4 Write mechanism — new typed event channel + owning-module subscriber
**Planner's-call #4 decision: PER-MODULE channels** (`web:tasks:create-requested`, `web:calendar:create-requested`), NOT a single generic `web:ai:action-confirmed`. Rationale: the existing convention in `events.ts` is strongly per-owner/per-domain (`web:pomodoro:*`, `web:habits:*`, `web:matrix:*`, `web:dashboard:*`, `web:board:*`), each with a precise typed payload owned by the producing/consuming module. A per-module channel gives each owning module a payload shaped exactly like its reducer input and keeps the type discriminated. (A generic channel would force a `kind` discriminator + a wide union payload — less idiomatic here.)

New EventMap entries in `packages/core/src/types/events.ts` (carve-out-authorized; `web:*` namespace, low dev-merge conflict but flagged):
```ts
// AI tool layer — task create request (producer: plugin-web-ai-chat tool handler after Confirm; consumer: xai-web-tasks subscriber)
'web:tasks:create-requested': {
  /** Correlation id = the Anthropic tool_use.id, so the AI can match the tool_result. */
  requestId: string;
  /** Trimmed, non-empty title. */
  title: string;
  /** Target bucket; defaults applied by producer. */
  bucket: 'overdue' | 'next7' | 'later' | 'nodate';
  /** Optional tag preset. */
  tag?: 'study' | 'work' | 'personal' | 'todo' | 'other';
  /** ISO timestamp at confirm. */
  requestedAt: string;
};
// AI tool layer — calendar event create request (producer: plugin-web-ai-chat; consumer: xai-web-calendar subscriber)
'web:calendar:create-requested': {
  requestId: string;
  title: string;
  /** "YYYY-MM-DD" local date. */
  date: string;
  /** "HH:MM" local start. */
  startTime: string;
  /** Minutes; producer clamps ≥5. */
  durationMin: number;
  requestedAt: string;
};
// (Optional, planner-deferred) result ack channel web:*:create-result so the AI can show the real outcome.
```

**Subscriber execution path (the key architectural resolution):**
The owning module's create reducer runs via React hooks (`usePref` / `useUserCalEvents`), but a `TasksModule`/`CalendarModule` subscriber would only be mounted when that route is active — so a write requested while the user is on `/app/ai` would be lost. RESOLUTION: each owning module ships a tiny **always-mountable subscriber** that executes the write IMPERATIVELY via the pure reducer + `getPref`/`setPref` (the same store the hooks read), NOT through a route-scoped component:
- `xai-web-tasks`: new `internal/aiCreateSubscriber.ts` exporting `subscribeTaskCreateRequests()` (or a `useTaskCreateRequestSubscriber()` hook mounted by a small always-on host sibling) that, on `web:tasks:create-requested`, runs `setPref("xai_task_cols", addCard(getPref("xai_task_cols"), draft, bucket))`. Because `usePref` re-reads on the storage event, any mounted `TasksModule` updates reactively.
- `xai-web-calendar`: analogous `internal/aiCreateSubscriber.ts` running `setPref("xai_calendar_events", createEvent(getPref(...), partial).next)`.
- **Mount point decision (planner's-call, resolved):** the subscribers are registered ONCE at app scope (a tiny always-on wiring, e.g. an effect in each module's slot registration or a dedicated zero-UI subscriber component mounted alongside the shell). The cleanest within-package option: export a `useAiCreateRequestSubscriber()` hook from each owning module and mount it in an always-present host shell location (analogous to how `plugin-web-pet` mounts as a top-level sibling). feature-review should sanity-check the exact mount site; the constraint to satisfy is "subscriber is live regardless of active route." This stays additive + within each owning package (carve-out §3).

This keeps the red-line intact: ai-chat NEVER imports tasks/calendar; tasks/calendar NEVER import ai-chat; the only coupling is the typed event name + payload in `@repo/core`.

### §5.5 Persistence (conversation record extension — backward-compatible)
- Extend the convo/message record additively so tool calls + confirmations + results are recorded: add optional fields to the message shape (e.g. `toolUse?`, `toolResult?`, `confirmation?: "pending"|"confirmed"|"cancelled"`). `isAiConvoRecord` stays backward-compatible (existing records without the new fields still validate; new optional fields are tolerated). NOTE: today only the convo LIST persists, not messages (design FA-7). v1 of this feature MAY keep messages non-persisted and only record tool-call state in-memory for the active session; persisting full message history is OPTIONAL and can be the polish-phase decision. The hard requirement is: `isAiConvoRecord` must not reject any old or new record (regression guard test).

### §5.6 No-key honesty
With no API key: tool-use unavailable (tools require the Anthropic provider + key), `streamCompleteChat` throws `BadKey(detail:"not-set")` → existing `ErrorBanner` path. Read context is not sent (no request made). Demo fallback unchanged. The composer/thread must not imply tools work without a key.

---

## §6. The 5 Planner's Calls (carve-out §"Planner's call") — decided + justified

| # | Question | Decision | Justification |
|---|---|---|---|
| **1** | Exact v1 tool set | `create_task` + `create_calendar_event` ONLY (create-only). | Carve-out's suggested minimum; each additional tool = more phases + more confirmation/subscriber surface. Edit/delete deferred (carve-out out-of-scope). Both map cleanly to existing pure reducers (`addCard`, `createEvent`). |
| **2** | Read/summarize: tool or context injection? | **Context injection** (NOT a tool). | Carve-out default; lower latency (no extra round-trip for the most common "what's on today?"); keeps reads provider-agnostic (works even on openai-compatible where write tools are deferred); avoids a read-tool that would muddy the "no silent action" story. Option B rejected (§4.2). |
| **3** | openai-compatible tool support now vs deferred | **Anthropic-first; openai-compatible tool WRITE support DEFERRED.** | Different wire protocol (function-calling) = a whole second parser+builder+tests for an untested BYO secondary (§4.3). Read context injection is still sent for openai-compatible (plain text, provider-agnostic). When openai-compatible is selected, `tools` are omitted and the AI behaves as today for writes. |
| **4** | Event-channel shape: per-module vs generic | **Per-module** (`web:tasks:create-requested`, `web:calendar:create-requested`). | Matches the dominant `events.ts` convention (per-owner channels with precise typed payloads: pomodoro/habits/matrix/dashboard/board). Generic `web:ai:action-confirmed` would need a `kind` discriminator + wide union — less idiomatic. (§5.4.) |
| **5** | Multi-turn tool loop depth | **Bounded single round-trip** (max 1 tool turn per send). | Carve-out default + out-of-scope bans unbounded agentic loops. After Confirm+execute, exactly ONE `tool_result` turn + final stream; no re-prompt loop. A hard counter enforces the cap in the queue processor. |

---

## §7. Risks + open questions

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | `buildBody` content-type widening (`string → string \| ContentBlock[]`) regresses the SHIPPED non-tool path | High | Additive union; string default preserved; all SHIPPED `claudeStreamAdapter`/`completeChat`/`llmProvider` tests stay green as P2 acceptance. New tool tests added separately. |
| R2 | Streaming `input_json_delta` accumulation bug (parse per-delta instead of per-block) | High | Pin §2.5: concatenate `partial_json` per content-block index, `JSON.parse` once at `content_block_stop`. Dedicated `sseParser`/`extractToolUse` tests with the literal multi-delta golden from §2.5. |
| R3 | "Silent write" — a write executes without explicit Confirm | **Critical** (acceptance anchor) | Write event emitted ONLY in Confirm handler; test asserts pending-but-not-confirmed → 0 write events + 0 store mutations; Cancel → tool_result(is_error) + 0 writes. |
| R4 | Subscriber not mounted when user is on `/app/ai` → write lost | High | Imperative `getPref`/`setPref` execution in an always-mounted subscriber (not route-scoped) — §5.4. feature-review to confirm mount site. |
| R5 | `events.ts` dev-branch merge surface | Medium | `web:*` namespace (different from `dev`'s `desktop:*`); low conflict but REAL. Flag in dev_log Blockers/Risks for the eventual main merge (carve-out §"dev-branch merge note"). |
| R6 | Context token bloat / stale snapshot | Medium | ≤~600 token budget; cap list lengths; point-in-time snapshot acceptable for v1 (documented). |
| R7 | `isAiConvoRecord` backward-compat break from record extension | Medium | New fields optional; predicate tolerates old + new; regression test with a SHIPPED-shape record. |
| R8 | Calendar `createEvent` is public but tasks `addCard` is internal — asymmetry | Low | tasks subscriber lives INSIDE `xai-web-tasks` and uses its own internal `addCard` (no export needed); calendar subscriber may reuse the already-public `createEvent`. Both stay within their packages. |
| R9 | openai-compatible user expects tool writes | Low | aiPane/thread copy: write actions require Anthropic in v1; read context still works. Documented limitation. |
| OQ1 | Persist full message history (with tool turns) now or defer? | — | Default: defer (v1 keeps messages in-memory; only `isAiConvoRecord` back-compat is mandatory). feature-review may elevate to in-scope. |
| OQ2 | Exact always-on subscriber mount site (slot-registration effect vs zero-UI sibling) | — | feature-review to confirm; constraint = route-independent liveness. |

---

## §8. Recommendation

Adopt **Option A**. Build in **5 phases** (each independently buildable + testable; one `feature-build` run each):

- **P1 — Context provider (read-only).** `contextProvider.ts` + local narrowing predicates (copied from dataReads precedent) + injection into the send path. No tools yet. Tests: per-source narrowing, today-filter, empty-state, token-budget, injection-present.
- **P2 — Adapter tool-use protocol.** Widen `buildBody` (tools + content-blocks); extend `claudeStreamAdapter`/`extractDelta` to surface a `tool_use` result + `stop_reason:"tool_use"`; reuse `sseParser`. NO UI/registry yet. Tests: §2.5 streaming golden, non-stream tool_use, content-block round-trip body shape, ALL SHIPPED adapter tests stay green.
- **P3 — Tool registry + confirmation UI.** `toolRegistry.ts` (create_task + create_calendar_event schemas) + `ConfirmationCard.tsx` + `AiChatModule` state-machine extension (pending→confirm/cancel). Tests: registry shape, confirmation render, Confirm/Cancel flow, **no-silent-write invariant**.
- **P4 — Write event channel + owning-module subscribers.** Add 2 EventMap entries to `core/types/events.ts`; `xai-web-tasks` + `xai-web-calendar` always-on subscribers executing via reducer+`setPref`; emit `tool_result` round-trip. Tests: event round-trip (emit→subscriber→store mutation), bounded single round-trip, tasks `addCard` + calendar `createEvent` invoked with mapped inputs, core typecheck.
- **P5 — Persistence back-compat + polish + docs.** Optional message/tool-call recording (or in-memory) with `isAiConvoRecord` back-compat regression test; no-key honesty; bilingual copy; PLUGIN_MAP note; full-suite green; verify-report + deferred cross-vendor + deferred real-key smoke (operator).

Cross-vendor smoke + real-LLM tool round-trip smoke are operator work (need a key), DEFERRED per ADR-0008 §S3 / ADR-0009 §D2-G2, consistent with the gap-closure row #2 precedent.

---

## Sources

- [Tool use with Claude — platform.claude.com](https://platform.claude.com/docs/en/docs/build-with-claude/tool-use)
- [Define tools (schema + tool_choice) — platform.claude.com](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)
- [Streaming messages (SSE tool_use sequence) — platform.claude.com](https://platform.claude.com/docs/en/api/messages-streaming)
