# Roadmap Manifest — xai-web-ai-tool-edit-delete

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260529-ai-tool-edit-delete.md` (P0 carve-out, operator directive 2026-05-29 — first of two AI enhancements; extends the SHIPPED create-only tool layer with edit/delete)
- Discovery: `docs/reviews/xai-web-ai-tool-edit-delete/20260529-discovery-review.md`
- Source Code Reference: `packages/plugin-web-ai-chat/` (SHIPPED AI tool layer, create-only) + `packages/xai-web-tasks/` (Stable) + `packages/xai-web-calendar/` (Stable) + `packages/core/src/types/events.ts`
- Init Path: `single-feature multi-phase` (one feature slice, 4 build phases; NOT a multi-row decomposition)
- Generated: 2026-05-29
- Default Automation Mode: A-Claude (manual step-by-step per CLAUDE.md; planner does not pre-commit to a loop)
- Default Dependency Semantics: `shipped` (all deps Stable/SHIPPED; the create-layer lineage it extends is SHIPPED 2026-05-29)
- Default Verify Cross-vendor: `yes` — primary Codex `gpt-5.x` cold-read; real-LLM edit/delete tool round-trip + cross-vendor smoke DEFERRED 24h (operator, needs API key) per ADR-0008 §S3 / ADR-0009 §D2-G2, consistent with create-layer + gap-closure row #2 precedent.
- Authority Anchor: **ADR-0010 §D4** — P0 is maintenance-only; new P0 feature plans require an explicit P0 carve-out commit (`e404a45`) citing D4. This manifest does NOT supersede ADR-0010 or any SHIPPED archive.
- Boundary Expansion (carve-out-AUTHORIZED): `packages/core/src/types/events.ts` MAY be edited (+4 `web:*` update/delete channels, additive, beside the SHIPPED create channels). `dev`-branch merge note: `dev` (Desktop) may also extend `events.ts` with `desktop:*` channels; `web:*` additions are low-conflict (different namespace) but a REAL merge surface — flagged in dev_log Risks for the eventual main merge.
- Branch: `web` (does NOT touch `dev`).
- Manifest Review: REQUIRED at feature-review (review boundaries + the 4 planner's calls + the 4 SHIPPED lifelines + the id-targeting context exposure + the bucket-change composition OQ1 + subscriber mount sites before build).

## Feature

| Slug | Source | Depends On | Dep Semantics | Status | Automation | Verify Cross-vendor | Note |
|------|--------|------------|---------------|--------|-----------|---------------------|------|
| xai-web-ai-tool-edit-delete | docs/reviews/_p0-carve-outs/20260529-ai-tool-edit-delete.md | plugin-web-ai-chat (Stable, SHIPPED tool layer), xai-web-tasks (Stable), xai-web-calendar (Stable) | shipped | NEEDS_REVIEW | A-Claude | yes (real-key + cross-vendor DEFERRED 24h) | Extends SHIPPED create-only tool layer with edit/delete. 4 new tools (delete_task, delete_calendar_event, update_task, update_calendar_event) + tasks deleteCard/updateCard pure reducer actions + reuse calendar updateEvent/deleteEvent + 4 per-op event channels + owning-module update/delete subscribers + context id exposure for targeting. Delete phased before update. 4 phases. Carve-out `e404a45`. |

## Phase Plan (4 phases — one `feature-build` run each)

> Each phase is independently buildable + testable; `feature-build` does ONE
> phase per run then stops for human confirmation (CLAUDE.md). Full per-phase
> scope/DoD lives in `packages/xai-web-ai-chat/docs/dev_log.md` Phase Plan.
> Delete is phased before update (planner's call #1): P1+P2 land a complete
> delete capability before update's field-patch complexity in P3.

| Phase | Title | Primary scope | Touches events.ts? | Key tests |
|---|---|---|---|---|
| P1 | Tasks reducer (deleteCard + updateCard) + 4 event channels + context id exposure | `tasksReducer.ts` (+deleteCard/+updateCard/+TaskCardPatch) + `events.ts` (+4 channels) + `contextProvider.ts` (id tokens in rendered text) | **YES (authorized)** | TR-DEL, TR-UPD (incl. preserve-done + referential-equality), CP-ID, CORE-1 |
| P2 | Delete tools + confirmation (destructive) + delete subscribers + round-trip | `toolRegistry.ts` (+delete_task/+delete_calendar_event; +`ConfirmationSpec.tone?` field) + `ConfirmationCard.tsx` (read `spec.tone`; props unchanged) + `AiChatModule.handleConfirm` (delete branches; render site unchanged) + tasks/calendar delete subscribers + App.tsx mounts | no | TR-DEL-TOOL, CC-TONE, IT-DEL (no-silent-write + bounded), TS-DEL, CS-DEL |
| P3 | Update tools + update subscribers + bucket-change composition | `toolRegistry.ts` (+update_task/+update_calendar_event) + `AiChatModule.handleConfirm` (update branches) + tasks/calendar update subscribers (incl. moveCard composition for bucket change) | no | TR-UPD-TOOL, IT-UPD (no-silent-write + bounded + preserve-done), TS-UPD, CS-UPD |
| P4 | Back-compat + no-regression + polish + docs + PLUGIN_MAP + verify-report | `isAiConvoRecord` back-compat check + bilingual confirm copy + full-suite regression (create path untouched) + PLUGIN_MAP note + verify report | no | BC-1, regression (full create-path suite), id-targeting end-to-end |

## Acceptance anchor (carve-out §5)

Satisfied when: with an API key set, the user can ask the AI to delete or edit an existing task/event (referenced from the injected context by id), see a confirmation card, Confirm it, and have the real item updated/removed via the owning module's reducer (verified in the store) — with **no silent writes**, delete/update never executing without explicit confirmation, and `done`/other fields preserved on task update. Verified by automated tests (mocked LLM edit/delete tool-use + event round-trip + reducer unit tests incl. preserve-done + id-targeting) + (deferred, operator) real-key smoke.

## Planner's Calls (decided in discovery §3)

1. **Tool set + phasing:** all 4 tools (delete + update × task/event); **delete phased before update** (delete = minimum high-value, lowest complexity; update concentrates drift risk in its own phase). Both ship in this single feature.
2. **Channel shape:** **4 per-op channels** (`web:tasks:{update,delete}-requested`, `web:calendar:{update,delete}-requested`), NOT a consolidated `mutate {op}` — follows SHIPPED per-op create precedent; tighter payload types; single-purpose subscribers.
3. **`update_task` fields:** **title + bucket + tag** (all optional; ≥1 required). `update_calendar_event` = title + date + startTime + durationMin. `updateCard` preserves `done` + all untouched fields regardless of patch.
4. **Delete confirmation:** **destructive copy + 1-click Confirm** (exact item named), NOT a type-DELETE gate (proportional for single low-blast-radius item; type-gate reserved for account-delete). Tone rides on `ConfirmationSpec.tone?` (returned by `toConfirmation`, default/omitted = SHIPPED rendering); `ConfirmationCard` reads `spec.tone` with no prop or render-site change (unified per feature-review B1 — see design ED-7 / api §14.2/§14.6).

## Lifelines continued (SHIPPED tool-layer spine — non-negotiable)

1. **No silent write** — write event emitted EXCLUSIVELY in the Confirm handler; Cancel → `tool_result(is_error:true)` + ZERO store mutation.
2. **`events.ts` additive-only** — 4 new channels beside SHIPPED create channels; no existing entry modified.
3. **Route-independent subscriber** — imperative `getPref`→reducer→`setPref`, mounted as App.tsx Shell-siblings.
4. **Bounded tool_result round-trip** — ≤1 `tool_result` turn/send; counter cap=1; no agentic loop.

## Interop

- Builds on the plugin-web-ai-chat SHIPPED tool layer (create-only) — extends additively; does NOT mutate SHIPPED create tools, channels, or the round-trip plumbing. `streamCompleteChat` signature is UNCHANGED (`StreamRequest` already carries `tools?` + `priorMessages?`); only the tool registry, the Confirm-handler channel branches, the event channels, and the subscribers grow.
- tasks gains 2 ADDITIVE pure reducer actions (`deleteCard`, `updateCard`); calendar REUSES its existing `updateEvent`/`deleteEvent` (zero new store logic). Both gain ADDITIVE subscribers within their own packages (no cross-plugin import; coupling only via typed `@repo/core` events).
- Context provider gains ADDITIVE id exposure (visible `(id: …)` token in the rendered today-context) so the model can target update/delete — the prerequisite for edit/delete to work. No new storage key, no new read source.
- Anthropic origin already CSP-allow-listed (ADR-0008 §S3 D3, gap-closure row #2) — no new CSP origin. No new npm dep, no new provider, no model-id change.

## Context

This is the FIRST of two planned AI enhancements (edit/delete). The SECOND (openai-compatible tool support) is a separate carve-out. Cross-vendor + real-key smoke is operator work, DEFERRED per ADR-0008 §S3.
