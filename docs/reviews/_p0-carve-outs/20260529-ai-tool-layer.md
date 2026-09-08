# P0 Carve-Out — xai-web-ai-tool-layer

**Date:** 2026-05-29
**Authority:** ADR-0010 §D4 — new feature plans require an explicit P0 carve-out commit.
**Triggering evidence:** usability recheck — "AI returns a canned demo reply until a key is added; no tool-calling; cannot read app context or perform actions." Audit 3e (item 3 final cluster).
**Operator decision:** session directive 2026-05-29 — **FULL tool layer** (context provider + multi-tool registry + confirmation + structured tool-use). Largest item-3 cluster.

---

## 1. Background

`plugin-web-ai-chat` already ships a real streaming LLM stack: `claudeAdapter`/`claudeStreamAdapter` (SSE), `llmProvider` (anthropic + openai-compatible via `ProviderConfig.buildBody`), `secretStore` (API key), conversation persistence (`makeConvoFromUserText`/`isAiConvoRecord`), and a `demoReply` fallback. `web:ai:rate-limited` + `web:ai:request-failed` event channels already exist in `packages/core/src/types/events.ts`.

What is missing (the 3e gap): the AI is **blind and inert** — it cannot see the user's real app data, and it cannot do anything in the app. `buildBody` sends text-only `{role, content: string}` messages; there is no tool definition, no tool-use parsing, no action execution, no confirmation.

This carve-out adds a **full tool layer**: the AI can (a) READ real app context and (b) PROPOSE actions that the user CONFIRMS before they execute.

## 2. Scope

**`xai-web-ai-tool-layer`** — Realistic v1 (multi-phase)

### In scope
- **Context provider (read-only)**: inject a compact snapshot of real app state into the model — today's tasks (`xai_task_cols` incl. `done`), today's calendar events (`xai_calendar_events`), recent pomodoro (`xai_pomodoro_sessions`), habits (`xai_habits_state`). Reuse the read-selector pattern from #3d/#3b (usePref + key string; NO plugin import). Lets the AI answer "what's on today?" / "summarize my day."
- **Adapter tool-use**: extend `llmProvider.buildBody` + the adapter response path to support the Anthropic Messages API tool-use protocol (`tools` param, `tool_use` content blocks, `stop_reason: "tool_use"`, `tool_result` round-trip). feature-plan MUST research the current Anthropic tool-use doc (WebSearch/WebFetch) and pin the exact shape. **Anthropic-first**: openai-compatible tool support MAY be deferred to a later phase if the two protocols diverge significantly (planner decides + documents).
- **Tool registry**: a small, typed registry of tools, each with a JSON-schema input + a handler. v1 tools (planner finalizes the set):
  - `create_task` (title + optional bucket/tag) → write path below.
  - `create_calendar_event` (title + date + time) → write path below.
  - `summarize_today` / read-style tools MAY be plain context rather than tools (planner decides).
- **Confirmation layer (MANDATORY for writes)**: any tool that mutates app state renders an in-chat confirmation card (proposed action + Confirm/Cancel) and executes ONLY on explicit user Confirm. No silent writes. (Mirrors the SHIPPED native-`<dialog>` confirm precedents.)
- **Write mechanism — new event channels (AUTHORIZED, see §3)**: tool handlers do NOT import other plugins. On Confirm, they emit a new typed event (`web:tasks:create-requested`, `web:calendar:create-requested`, or a generic `web:ai:action-confirmed`) that the OWNING module (`xai-web-tasks` / `xai-web-calendar`) subscribes to and executes via its own reducer/validation. This keeps boundaries clean and reuses each module's create logic.
- **Persistence**: tool calls + results + confirmations recorded in the conversation history (extend the existing convo record shape; keep `isAiConvoRecord` backward-compatible).
- **Honest no-key state**: with no API key, tool-use is unavailable; the demo fallback stays honest about it.

### Planner's call
- Exact v1 tool set (create_task + create_calendar_event is the suggested minimum; more = more phases).
- Whether read/summarize is a tool or just context injection (default: context injection, not a tool).
- openai-compatible tool support now vs deferred (default: Anthropic-first, openai-compatible deferred).
- Event-channel shape: per-module (`web:tasks:create-requested`) vs generic (`web:ai:action-confirmed`) — pick the one that best fits the existing event conventions.
- Multi-turn tool loop depth (single tool round-trip v1 vs full agentic loop — default: bounded single round-trip + result, no unbounded loop).

### Out of scope
- Unbounded agentic loops / autonomous multi-step execution without confirmation.
- Tools that delete/modify existing data (v1 = create-only; edit/delete tools deferred).
- New LLM providers / new external deps / CSP changes beyond the already-allowed Anthropic + openai-compatible endpoints.
- Cross-device sync.

### Boundary EXPANSION authorized by this carve-out (NOTABLE)
- **`packages/core/src/types/events.ts` MAY be edited** to add the new tool/action event channel(s). This is the ONE file the prior item-3 features deliberately avoided. The full tool layer legitimately requires it for clean cross-plugin writes. **dev-branch merge note:** the `dev` branch (Desktop, another machine) may also extend `events.ts` with `desktop:*` channels; adding `web:*`/`web:ai:*` channels is low-conflict (different namespace) but a real merge-surface — flag in the dev_log so the owner coordinates the eventual main merge.
- The OWNING modules `xai-web-tasks` + `xai-web-calendar` MAY get a small subscriber (consume the new event → call their existing create reducer). This is additive + within their own packages.

### NOT triggered
- ADR-0011 / P1 reprioritization / SHIPPED-archive reopening. New npm dep. `plugin-web-tokens` edit (local STR). `dev` branch edits.

## 3. Impact

### Modified
- `packages/plugin-web-ai-chat/src/internal/` — `llmProvider` (tools in buildBody), adapter (tool-use parse + tool_result round-trip), NEW tool registry + context provider + confirmation state, conversation record shape.
- `packages/plugin-web-ai-chat/src/` — chat components (confirmation card UI), local STR, styles.
- `packages/core/src/types/events.ts` — NEW tool/action event channel(s) (AUTHORIZED).
- `packages/xai-web-tasks/src/` + `packages/xai-web-calendar/src/` — small event subscriber → existing create reducer (additive).
- respective `docs/`.

### Created
- `docs/workflow/roadmap/xai-web-ai-tool-layer.md` (by feature-plan).

### NOT modified
- Other plugins. `plugin-web-tokens`. Registry storage keys (unless a new ai-tool pref is justified — default none). SHIPPED archives, ADR, `dev` branch. Existing `web:ai:rate-limited`/`request-failed` channels (only add, never change).

## 4. Workflow path

carve-out commit → feature-plan (with Anthropic tool-use protocol research) → feature-review → feature-build (MULTI-phase: context provider / adapter tool-use / tool registry + confirmation / write-channel + subscribers / persistence + polish) → feature-verify → ship. Cross-vendor smoke DEFERRED per ADR-0008 §S3; real-LLM tool round-trip smoke is operator work (needs a key).

## 5. Acceptance anchor

Satisfied when: with an API key set, the user can ask the AI about their real data ("what's on today?") and get an answer grounded in actual task/event/pomodoro state; AND the user can ask the AI to create a task/event, see a confirmation card, Confirm it, and have the real item created via the owning module's reducer (verified in the owning module's store) — with no silent writes and no action executed without explicit confirmation. Verified by automated tests (mocked LLM tool-use responses + event round-trip) + (deferred, operator) real-key smoke.
