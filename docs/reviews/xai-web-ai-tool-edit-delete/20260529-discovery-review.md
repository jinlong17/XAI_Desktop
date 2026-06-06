# Discovery Review — xai-web-ai-tool-edit-delete

- **Date:** 2026-05-29
- **Planner:** Claude Opus 4.8 1M (feature-plan)
- **Carve-out:** `docs/reviews/_p0-carve-outs/20260529-ai-tool-edit-delete.md` (authority commit `e404a45`, ADR-0010 §D4)
- **Predecessor:** `xai-web-ai-tool-layer` (SHIPPED 2026-05-29) — create-only v1 of this same tool layer
- **Branch:** `web` (does NOT touch `dev`)
- **External research:** **None required.** This is internal business logic extending a SHIPPED path. The Anthropic tool-use wire protocol is already pinned (`toolUseTypes.ts`, api.md §13.0); no new library, provider, or technology-selection decision is in scope. WebSearch/WebFetch skipped per feature-plan protocol step 4 (purely-internal-business-logic clause).

---

## 1. Problem Framing

The SHIPPED AI tool layer gives the AI two **create-only** tools (`create_task`, `create_calendar_event`). The AI can add tasks/events but cannot edit or delete them, so it cannot fully manage the user's tasks/events. This carve-out extends the proven create path — confirmation card → write event → App.tsx Shell-sibling subscriber → owning reducer — with **edit + delete** tools.

The defining call set (the "what tools do we add and how") is constrained by four planner's calls in the carve-out §38. The defining technical pre-condition is **id targeting**: edit/delete require the model to reference an existing item by id, which means the injected context must expose stable ids. This discovery resolves all four calls and the targeting question against the live code.

### SHIPPED lifelines that MUST continue (non-negotiable)

These four invariants carried the create layer through verify and are the spine of this extension. Each new tool/channel/subscriber inherits them:

1. **No silent write** — a write event is emitted EXCLUSIVELY inside the Confirm handler. Cancel emits `tool_result(is_error:true)` with ZERO store mutation. (SHIPPED: `AiChatModule.handleConfirm` is the only `emitWebEvent` call site; IT-2/IT-3 enforce it.)
2. **`events.ts` additive-only** — new channels are added beside the existing `web:*` + create channels; no existing entry is modified. (SHIPPED: §13.4 added 2 entries without touching `web:ai:*`.)
3. **Route-independent subscriber** — subscribers execute imperatively via `getPref`/reducer/`setPref`, mounted as App.tsx Shell-siblings, so a write requested while the user is on `/app/ai` is never lost regardless of which module route is mounted.
4. **Bounded tool_result round-trip** — at most ONE `tool_result` turn per send; on Confirm a single success acknowledgement, on Cancel a single is_error turn; counter cap stays at 1, no agentic loop. (SHIPPED: `handleConfirm`/`handleCancel` both `break` on first `chunk.done`.)

### Lineage-drift hazard (the specific reason the prior feature was BLOCKED)

The carve-out §47 flags that the predecessor was BLOCKED once because the dev_log claimed a round-trip behaviour the code did not implement (docs/code drift). **This extension's docs MUST match the implementation exactly.** Concretely: every claim about reducer signatures, channel payloads, subscriber routing, confirmation copy, and round-trip behaviour in design.md/api.md/test.md must be implementable as written, and the build phases must produce code that matches. The test strategy (§ test.md) is written so verify can mechanically check doc-vs-code parity (reducer unit tests assert the exact documented signature; IT/integration tests assert the exact documented confirm-only emit).

---

## 2. Recon — live-code confirmation of carve-out claims

All recon claims in the carve-out were re-verified against HEAD on branch `web`.

### 2.1 Calendar — full CRUD ALREADY EXISTS (reuse directly, zero new store logic)

`packages/xai-web-calendar/src/internal/eventStore/eventStore.ts` — CONFIRMED:
- `updateEvent(store, id, patch)` — returns `{ next, updated }`. **Preserves `id` + `createdAt`, bumps `updatedAt`**, spreads `patch` over `prev`. Returns `{ next: store, updated: null }` (same reference) when `id` missing. Lines 46-64.
- `deleteEvent(store, id)` — returns the next store with `id` removed; **no-op (same reference) when `id` missing**. Lines 69-79.
- `getEvent(store, id)` — pure read by id, null when missing. Lines 82-87.

`createEvent` is publicly exported from the calendar barrel; `updateEvent`/`deleteEvent` are internal but the subscriber lives inside the same package, so it imports them directly (same precedent as the SHIPPED `aiCreateSubscriber.ts` which imports `createEvent` from `./eventStore/eventStore.js`). **No calendar store logic to write.**

### 2.2 Tasks — NO delete, NO update (must add 2 pure reducer actions)

`packages/xai-web-tasks/src/internal/tasksReducer.ts` — CONFIRMED: exports ONLY `moveCard`, `toggleComplete`, `addCard`. There is no `deleteCard` and no `updateCard`. This carve-out adds both, in the same pure/immutable style as `addCard`:

- `deleteCard(prev: TaskCol[], id: string): TaskCol[]` — find the card across all columns; if found, return a new `TaskCol[]` with the card filtered out and that column's `count` decremented; columns not containing the card are returned by reference (referential equality preserved, matching `toggleComplete`'s pattern). Return `prev` unchanged when the id is in no column.
- `updateCard(prev: TaskCol[], id: string, patch: TaskCardPatch): TaskCol[]` — find the card; merge `patch` over the existing card (`{ ...card, ...patch }`), **preserving all untouched fields including `done` (T-10), `tag`, `date`, `dateZh`, `inbox`**; columns not containing the card returned by reference. Return `prev` unchanged when the id is in no column OR when the patch is empty/no-op. `id` is never overwritten (the merge re-pins `id: card.id`).

`TaskCard` (types.ts) has stable `readonly id: string`, `readonly done?: boolean`, `readonly tag?: TaskTagId`, `readonly title: TaskTitleBundle`. `TaskCardPatch` is a NEW narrow type (see §4) — NOT the full card — to keep the AI's edit surface small and avoid letting a patch clobber `id`.

### 2.3 Targeting dependency — 🔴 THE CRITICAL FINDING

`packages/plugin-web-ai-chat/src/internal/contextProvider.ts` — CONFIRMED with a nuance the carve-out flagged to verify:

- The narrowing **types** already carry ids: `NarrowTaskCard.id` (line 35) and `NarrowCalEvent.id` (line 81) are read off the source records.
- **BUT the rendered context text does NOT include those ids.** The task lines are built as `` `- [${bucketId}] ${title}` `` (line 217) and the calendar lines as `` `- ${time}–${endTime}: ${e.title}` `` (line 231). **No id is emitted into the string the model sees.**

**Conclusion:** the model currently sees titles but NOT ids, so it has nothing to put in `delete_task({id})` / `update_calendar_event({id})`. **Edit/delete cannot work without exposing ids in the context text.** This is the prerequisite the carve-out §34/§20 told feature-plan to confirm — confirmed: ids must be added (additively) to the rendered snapshot.

**Decision (additive, minimal):** extend the rendered context lines to include a short id token the model can copy verbatim:
- Task line → `` `- [${bucketId}] (id: ${card.id}) ${title}` ``
- Calendar line → `` `- (id: ${e.id}) ${time}–${endTime}: ${e.title}` ``

This is a string-shape change inside `buildTodayContext` only. It is **additive** (titles + times unchanged; ids appended), preserves the ≤~600-token budget (ids are short — UUIDs for calendar, `t1`/`c1`-style for tasks; +~10 tokens per item; the existing TASK_CAP=20 + today-only calendar filter keeps total bounded), and adds NO new storage key and NO new read source. Tool descriptions/`input_schema` instruct the model: "to edit or delete, copy the exact id shown as `(id: …)` in the context." CP-targeting tests assert the id appears in the rendered text.

> **Why a visible `(id: …)` token rather than a separate machine field:** the SHIPPED context is a single injected text block (api.md §13.2), not a structured tool-state object. The model reads the same text a human would. A visible token the model copies verbatim is the lowest-surface change that makes targeting work without restructuring the context contract. The token is human-legible but unobtrusive.

### 2.4 SHIPPED P4 path — fully reusable, expansion points identified

- **Event channels:** `web:tasks:create-requested` + `web:calendar:create-requested` exist in `events.ts` (lines 314-340), each carrying `requestId` (= Anthropic `tool_use.id` for round-trip correlation). The new update/delete channels mirror this shape exactly.
- **Confirm handler expansion point:** `AiChatModule.handleConfirm` (lines 486-595) currently has a two-branch `if (writeEvent.channel === "web:tasks:create-requested") … else if (… "web:calendar:create-requested") …`. This is the single place new channel branches are added. The `priorMessages` round-trip block below it is channel-agnostic and reused as-is.
- **Round-trip plumbing already supports it:** `StreamRequest` (claudeStreamAdapter.ts line 30) already has `tools?` and `priorMessages?`. `streamCompleteChat` needs NO signature change — only the tool REGISTRY grows and the confirm/cancel handlers learn the new channels. (This is a meaningful de-risk: the hardest SHIPPED plumbing — SSE tool_use accumulation, bounded round-trip — is untouched.)
- **Subscriber pattern:** both `aiCreateSubscriber.ts` files are the exact template — bounded `seenRef` idempotency (MAX_SEEN=100), imperative `getPref`→reducer→`setPref`, no cross-plugin import, mounted in `App.tsx` (lines 98-99). The new update/delete subscribers follow byte-for-byte.
- **Confirmation UI:** `ConfirmationCard.tsx` is reused; the only delta is the proposed-change copy (delete vs update wording, and a slightly stronger delete affordance — see planner's call #4).

---

## 3. Planner's Calls (the four decisions the carve-out delegated)

### Call #1 — Exact tool set + phasing

**Decision:** ship all four tools — `delete_task`, `delete_calendar_event`, `update_task`, `update_calendar_event` — but **phase delete before update**. Delete is the minimum high-value, lowest-complexity addition (id only, no field patch). Update adds field-patch complexity (which fields, validation, preserve-untouched semantics). Phasing delete first means P1+P2 land a complete, shippable delete capability even if update needs iteration.

**Justification:** the carve-out §39 explicitly authorizes phasing update after delete. Delete reuses the create round-trip with the simplest possible payload (`{requestId, id}`). Update is where the doc-drift risk is highest (preserve-done, preserve-untouched-fields), so it gets its own phase with dedicated reducer unit tests. Both ship in this single feature (not split into two carve-outs) — the phasing is internal sequencing, not a scope cut.

### Call #2 — Event-channel shape: per-op vs consolidated

**Decision:** **four per-op channels** — `web:tasks:update-requested`, `web:tasks:delete-requested`, `web:calendar:update-requested`, `web:calendar:delete-requested` — NOT a consolidated `web:tasks:mutate-requested {op}`.

**Justification:** follows the SHIPPED per-op create-channel precedent (`web:tasks:create-requested` / `web:calendar:create-requested` are already separate per module). A consolidated `{op}` channel would (a) break the precedent, (b) force the subscriber to branch on `op` inside one handler (more logic per handler = more drift surface), and (c) give each channel a less-precise payload type (a mutate channel's payload would be a union, weakening type-narrowing). Per-op channels keep each payload tight and each subscriber single-purpose, matching the create channels' `requestId`-correlated shape. Cost is 4 EventMap entries vs 1 — acceptable; `events.ts` additions are additive and low-conflict (`web:*` ≠ dev's `desktop:*`).

### Call #3 — `update_task` field set

**Decision:** **`title` + `bucket` + `tag`** (all optional in the patch; at least one required). NOT title-only.

**Justification:** bucket-move and re-tag are natural "edit this task" requests ("move the groceries task to Later", "tag the PR review as work"). The tasks reducer already models all three as first-class card fields, and `updateCard` merges a partial patch, so supporting all three is no harder than title-only at the reducer level — the cost is only in `update_task`'s `input_schema` (3 optional properties + a "at least one of title/bucket/tag" instruction in the description). Critically, `updateCard` **preserves `done` and every untouched field** (the T-10 lifeline) regardless of which fields the patch carries. `update_calendar_event` mirrors this: `title` + `date` + `startTime` + `durationMin` (all optional; at least one required), mapped to `eventStore.updateEvent`'s patch which preserves `createdAt`/`id` and bumps `updatedAt`.

> Note on bucket change semantics: changing a task's `bucket` via `updateCard` is a field merge, NOT a `moveCard` (moveCard rewrites date fields + count on both columns). For v1 `update_task`, a bucket change moves the card to the target column and adjusts both columns' counts — this is documented as a `deleteCard`+`addToBucket` composition inside `updateCard` OR `updateCard` handling cross-column relocation explicitly. **Resolved in design.md §D3:** `updateCard` handles same-column field patches; a bucket change is delegated to the existing `moveCard` semantics (re-pin date for the new bucket) to avoid duplicating column-relocation logic. This keeps `updateCard` honest about referential equality. (Feature-review should sanity-check this composition.)

### Call #4 — Stricter confirmation for delete (destructive)

**Decision:** delete uses the **same ConfirmationCard component** but with **destructive copy + a distinct confirm affordance** (e.g. confirm label "Delete" with a destructive visual variant, and the description names the exact item being deleted, e.g. `Delete task "Buy groceries"?`). No second-step type-to-confirm gate (that is reserved for account-delete-level actions; a single explicit Confirm click on a clearly-worded destructive card is proportional for a single task/event that has no undo-but-is-cheap-to-recreate).

**Justification:** the carve-out §42 asks whether delete needs stricter confirmation than update. A single per-item delete is reversible-by-recreation and low-blast-radius; a type-DELETE gate (as used for whole-account deletion in `xai-web-settings-rest` row #9) would be disproportionate friction. The mandatory single-click Confirm + destructive wording + exact-item naming is the right proportionality. The destructive tone rides on **`ConfirmationSpec.tone`** (the value `toConfirmation` returns) — `ConfirmationSpec` gains an optional `tone?: "default" | "destructive"` field (additive; default/omitted preserves SHIPPED rendering for create/update) and `ConfirmationCard` reads `spec.tone`; `ConfirmationCardProps` is UNCHANGED, so the existing `spec={spec}` render-site pass-through carries it with no render-site edit. (This unifies the seam per feature-review B1; see design ED-7 + api §14.2/§14.6.) No-silent-write is identical: delete still emits ONLY on Confirm.

---

## 4. Solution Sketch (carried into design.md / api.md)

### Tasks reducer (NEW pure actions — `tasksReducer.ts`)

```ts
export interface TaskCardPatch {
  title?: string;           // fills BOTH title.en + title.zh (single-input bilingual, mirrors addCard)
  tag?: TaskTagId;
  // bucket change is handled via moveCard composition (design §D3), not a raw field
}
export function deleteCard(prev: TaskCol[], id: string): TaskCol[];
export function updateCard(prev: TaskCol[], id: string, patch: TaskCardPatch): TaskCol[];
```
- Immutable; untouched columns returned by reference; `prev` returned unchanged on not-found / empty-patch.
- `updateCard` preserves `done` + all untouched fields; never overwrites `id`.

### Calendar (REUSE — no new store code)

`updateEvent` / `deleteEvent` already exist and satisfy the contract. Subscribers call them directly.

### New event channels (`packages/core/src/types/events.ts` — additive, CARVE-OUT AUTHORIZED)

```ts
'web:tasks:update-requested':  { requestId: string; id: string; patch: { title?: string; bucket?: BucketId; tag?: TaskTag }; requestedAt: string };
'web:tasks:delete-requested':  { requestId: string; id: string; requestedAt: string };
'web:calendar:update-requested': { requestId: string; id: string; patch: { title?: string; date?: string; startTime?: string; durationMin?: number }; requestedAt: string };
'web:calendar:delete-requested': { requestId: string; id: string; requestedAt: string };
```
(`requestId` = `tool_use.id`, identical correlation discipline to create channels.)

### Tool registry (`toolRegistry.ts` — grows from 2 → 6 tools)

`delete_task`, `delete_calendar_event`, `update_task`, `update_calendar_event` each implement `toConfirmation` (destructive tone for deletes) + `toWriteEvent` (returns the matching new channel + payload). `WriteEventSpec.channel` union widens to include the 4 new channels. `AI_TOOLS` array grows to 6.

### Confirm/Cancel handler (`AiChatModule.tsx` — additive branches)

`handleConfirm`'s channel `if/else` chain gains 4 branches (one per new channel) that `emitWebEvent` the typed payload. The round-trip block below is unchanged. `WriteEventSpec.channel` type widening is the only signature change. Cancel path unchanged (channel-agnostic).

### Context provider (`contextProvider.ts` — additive id exposure)

Render `(id: …)` tokens in task + calendar lines (§2.3). Tool descriptions reference this token for targeting.

### Subscribers (NEW, mirror SHIPPED `aiCreateSubscriber.ts`)

- `xai-web-tasks`: a subscriber for `web:tasks:update-requested` (→ `updateCard`) + `web:tasks:delete-requested` (→ `deleteCard`). May be one hook with two `useWebEventListener` calls or two hooks; bounded `seenRef` idempotency each.
- `xai-web-calendar`: a subscriber for `web:calendar:update-requested` (→ `updateEvent`) + `web:calendar:delete-requested` (→ `deleteEvent`).
- Both mounted as new lines in `App.tsx` beside the existing create subscribers.

---

## 5. Tradeoffs Considered

| Decision point | Chosen | Alternative | Why chosen |
|---|---|---|---|
| Tool set | 4 tools (delete + update × task/event) | delete-only v1 | Carve-out wants full management; update reducer cost is low; phasing de-risks |
| Phasing | delete (P1+P2) before update (P3) | all at once | Delete is shippable-complete sooner; update concentrates drift risk in its own phase |
| Channel shape | 4 per-op channels | 1 consolidated `mutate {op}` | Follows SHIPPED per-op create precedent; tighter payload types; single-purpose subscribers |
| `update_task` fields | title + bucket + tag | title-only | Natural edit requests; reducer cost identical; `done` preserved regardless |
| Bucket change | delegate to `moveCard` | duplicate relocation in `updateCard` | Avoids re-implementing column-move + count + date-rewrite; keeps `updateCard` referential-equality-honest |
| Delete confirmation | destructive copy + 1-click Confirm | type-DELETE gate | Proportional for single low-blast-radius item; type-gate reserved for account-delete |
| Id exposure | visible `(id: …)` token in context text | separate structured id field | Context is a single text block by contract; visible token is lowest-surface change |

---

## 6. Risks & Open Questions

### Risks

- **R1 — Docs/code drift (the prior-BLOCK cause).** Mitigation: test.md asserts exact documented reducer signatures + confirm-only emit; build phases produce code matching each documented contract; verify can mechanically diff doc-vs-code. **Highest-priority risk.**
- **R2 — `events.ts` is a real `dev`-branch merge surface.** `dev` may add `desktop:*` channels. `web:*` additions are different-namespace (low conflict) but a genuine merge surface. Flagged in dev_log Risks for the eventual main merge. Additive-only discipline keeps the diff a clean append.
- **R3 — `updateCard` referential-equality regressions.** A naive `map` could break untouched-column reference identity (tasks consumers may rely on it for memoization, mirroring `toggleComplete`/`moveCard`). Mitigation: reducer unit tests assert `result[i] === prev[i]` for untouched columns.
- **R4 — Bucket-change composition.** Delegating `update_task` bucket changes to `moveCard` is a composition that must rewrite date fields + counts correctly. Mitigation: dedicated reducer test for cross-column update; feature-review sanity-checks the composition.
- **R5 — Id-targeting accuracy at runtime.** The model must copy the exact id from context into the tool call. Automated tests can prove the id is present in context + that a correctly-targeted tool_use round-trips to the right store mutation; runtime accuracy of the model's id-copying is covered by the DEFERRED operator real-key smoke (ADR-0008 §S3).
- **R6 — Confirmation tone prop.** Adding `tone?` to `ConfirmationCard` must default to SHIPPED rendering so create/update visuals are byte-for-byte unchanged. Mitigation: CC test asserts default tone renders the SHIPPED markup.
- **R7 — `isAiConvoRecord` back-compat.** Unchanged from create layer (no new persisted message shape required in v1); BC test confirms no regression.

### Open Questions (for feature-review)

- **OQ1 — Bucket-change-via-moveCard composition** (Call #3 / R4): is delegating to `moveCard` inside the update subscriber (rather than inside `updateCard`) the cleaner seam? Planner's lean: the subscriber decides — if `patch.bucket` differs from the card's current column, the subscriber calls `moveCard` then `updateCard` for remaining fields; otherwise `updateCard` only. This keeps the pure reducer free of column-discovery logic. Review to confirm.
- **OQ2 — One subscriber hook per package (two listeners) vs two hooks.** Planner's lean: one hook per package with two `useWebEventListener` calls (one update, one delete), matching the single-hook-per-package shape already mounted in App.tsx. Review to confirm mount-count expectation.
- **OQ3 — Should `update_task` allow clearing a tag** (set tag to none)? Planner's lean: NO in v1 — patch only sets provided fields; tag-removal is out of scope (a future increment). Review to confirm.

---

## 7. Recommendation

Proceed with the four-tool extension (delete + update × task/event), **phasing delete before update**, four per-op event channels, `update_task` = title+bucket+tag, destructive-tone single-click delete confirmation, and additive `(id: …)` context exposure. Reuse the SHIPPED confirmation → write-event → Shell-sibling-subscriber → reducer path and all four lifelines (no-silent-write, additive events, route-independent subscriber, bounded round-trip) without modification. Add `deleteCard`/`updateCard` pure reducer actions to tasks; reuse calendar's existing `updateEvent`/`deleteEvent`. No new store logic in calendar, no new storage key, no new CSP origin, no new npm dep, no `dev`-branch touch.

Phase plan (4 phases) is recorded in `packages/xai-web-ai-chat/docs/dev_log.md`.
