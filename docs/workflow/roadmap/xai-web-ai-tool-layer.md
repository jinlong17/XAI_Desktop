# Roadmap Manifest — xai-web-ai-tool-layer

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260529-ai-tool-layer.md` (P0 carve-out, operator directive 2026-05-29 — FULL tool layer; largest item-3 cluster; the final audit-driven Web cluster)
- Discovery: `docs/reviews/xai-web-ai-tool-layer/20260529-discovery-review.md`
- Source Code Reference: `packages/plugin-web-ai-chat/` (SHIPPED real-LLM adapter, gap-closure row #2) + `packages/xai-web-tasks/` (Stable) + `packages/xai-web-calendar/` (Stable) + `packages/core/src/types/events.ts`
- Init Path: `single-feature multi-phase` (one feature slice, 5 build phases; NOT a multi-row decomposition)
- Generated: 2026-05-29
- Default Automation Mode: A-Claude (manual step-by-step per CLAUDE.md; planner does not pre-commit to a loop)
- Default Dependency Semantics: `shipped` (all deps Stable/SHIPPED)
- Default Verify Cross-vendor: `yes` — primary Codex `gpt-5.x` cold-read; real-LLM tool round-trip + cross-vendor smoke DEFERRED 24h (operator, needs API key) per ADR-0008 §S3 / ADR-0009 §D2-G2, consistent with gap-closure row #2 precedent.
- Authority Anchor: **ADR-0010 §D4** — P0 is maintenance-only; new P0 feature plans require an explicit P0 carve-out commit (`e101bc6`) citing D4. This manifest does NOT supersede ADR-0010 or any SHIPPED archive.
- Boundary Expansion (carve-out-AUTHORIZED, NOTABLE): `packages/core/src/types/events.ts` MAY be edited (+2 `web:*` write channels). This is the ONE file prior item-3 features avoided. `dev`-branch merge note: `dev` (Desktop) may also extend `events.ts` with `desktop:*` channels; `web:*` additions are low-conflict (different namespace) but a REAL merge surface — flagged in dev_log Risks for the eventual main merge.
- Branch: `web` (does NOT touch `dev`).
- Manifest Review: REQUIRED at feature-review (review boundaries + the 5 planner's calls + the no-silent-write invariant + subscriber mount site before build).

## Feature

| Slug | Source | Depends On | Dep Semantics | Status | Automation | Verify Cross-vendor | Note |
|------|--------|------------|---------------|--------|-----------|---------------------|------|
| xai-web-ai-tool-layer | docs/reviews/_p0-carve-outs/20260529-ai-tool-layer.md | plugin-web-ai-chat (Stable), xai-web-tasks (Stable), xai-web-calendar (Stable) | shipped | NEEDS_REVIEW | A-Claude | yes (real-key + cross-vendor DEFERRED 24h) | Full tool layer — READ context injection + WRITE tool-use (create_task + create_calendar_event) + mandatory confirmation + per-module write event channels + owning-module subscribers. 5 phases. Carve-out `e101bc6`. |

## Phase Plan (5 phases — one `feature-build` run each)

> Each phase is independently buildable + testable; `feature-build` does ONE
> phase per run then stops for human confirmation (CLAUDE.md). Full per-phase
> scope/DoD lives in `packages/xai-web-ai-chat/docs/dev_log.md` Phase Plan.

| Phase | Title | Primary scope | Touches events.ts? | Key tests |
|---|---|---|---|---|
| P1 | Context provider (read-only) | `contextProvider.ts` + local narrowing predicates (dataReads precedent) + send-path injection | no | CP-1..CP-8 |
| P2 | Adapter tool-use protocol | `buildBody` (+tools/+content-blocks) + `claudeStreamAdapter`/`extractDelta` tool_use surfacing + `toolUseTypes.ts`; reuse `sseParser` | no | TU-1..TU-7 + TU-REG |
| P3 | Tool registry + confirmation UI | `toolRegistry.ts` (create_task + create_calendar_event) + `ConfirmationCard.tsx` + `AiChatModule` state machine | no | TR/CC + IT-1/IT-2(no-silent-write)/IT-3 |
| P4 | Write event channel + subscribers | +2 EventMap entries (`web:tasks:create-requested`, `web:calendar:create-requested`) + tasks/calendar always-on subscribers + tool_result round-trip | **YES (authorized)** | IT-4/IT-5(bounded) + TS/CS + CORE-1 |
| P5 | Persistence back-compat + polish + docs | `isAiConvoRecord` back-compat + no-key honesty + bilingual copy + PLUGIN_MAP + verify-report | no | BC-1/BC-2 + full suite |

## Acceptance anchor (carve-out §5)

Satisfied when: with a key set, the user can ask about real data ("what's on today?") and get a grounded answer (context correctness via tests; runtime grounded answer via deferred operator smoke); AND can ask to create a task/event → see a confirmation card → Confirm → real item created via the owning module's reducer (verified in the owner store) — with **no silent writes** and no action without explicit confirm (IT-2/IT-3). Automated tests + deferred operator real-key smoke.

## Planner's Calls (decided in discovery §6)

1. v1 tools = `create_task` + `create_calendar_event` only (create-only).
2. Read = context injection, NOT a tool.
3. Anthropic-first; openai-compatible tool WRITE support deferred (read context still injected).
4. Per-module write channels (`web:tasks:create-requested` / `web:calendar:create-requested`), not generic.
5. Bounded single round-trip (max 1 tool turn/send); no agentic loop.

## Interop

- Builds on plugin-web-ai-chat SHIPPED real-LLM adapter lineage (gap-closure row #2) — extends additively; does NOT mutate SHIPPED adapter decisions.
- tasks/calendar gain ADDITIVE subscribers within their own packages (no cross-plugin import; coupling only via typed `@repo/core` events).
- Anthropic origin already CSP-allow-listed (ADR-0008 §S3 D3, gap-closure row #2) — no new CSP origin.
