# Discovery Review — xai-web-tasks-card-create

**Date:** 2026-05-28
**Author:** feature-plan (Claude Opus)
**Feature:** `xai-web-tasks-card-create` (extension of SHIPPED `@repo/plugin-web-tasks`, PLUGIN_MAP row #6)
**Authority:** ADR-0010 §D4 P0 carve-out (`docs/reviews/_p0-carve-outs/20260528-tasks-card-create.md`, commit `09673f8`)
**Feature brief:** `docs/reviews/xai-web-tasks-card-create/20260528-feature-brief.md`

> This is the human-review main document. Per SOP_NEW_FEATURE §1.5, discovery
> detail does NOT live in `design.md` — `design.md` carries only the decision
> snapshot. Reviewers should read this doc + the design snapshot together.

---

## 0. External research

**No external research required.** This feature is purely internal business logic added to an existing, SHIPPED package. It introduces:

- No new npm dependency (native `<dialog>` per existing precedent; no UI/dialog library).
- No new external service.
- No technology-selection decision.

The "candidate options" below are therefore **internal design alternatives** weighed against three already-SHIPPED in-repo precedents, not third-party library comparisons.

---

## 1. Problem framing

The Tasks board (`/app/tasks`) renders a 4-bucket DnD board (Overdue / Next 7 Days / Later / No Date). Three of the four columns (`next7`, `later`, `nodate`) render a `+` add-card button via `col.action === "add"` (`TaskColumn.tsx:68-74`), but the button has **no `onClick`** — it is decorative. There is **no UI path to create a task at all**; the only persistence write path is drag-drop reschedule (`moveCard` → `setRawCols`).

The audit (Top-10 #3, row T-09) flagged this as the largest real functional gap in the remaining Top-10. The operator chose a real feature (Realistic v1, create-only) over a DISABLE bug-fix.

### What already exists (recon 2026-05-28 — load-bearing)

| Asset | File | State | Implication |
|---|---|---|---|
| `TaskCard` model | `src/types.ts:38-55` | bilingual `title {en,zh}`, optional `sub`/`tag`/`date`/`dateZh`/`dateLabel`/`inbox`, `readonly` id | Create must produce a valid `TaskCard`; `validate.isTaskCard` requires non-empty `en`+`zh`. |
| `tasksReducer` | `src/internal/tasksReducer.ts` | `moveCard` + `toggleComplete` ONLY — **no create/add action** | **Must add a pure `addCard` action.** (Answer to brief's #1 discovery question.) |
| `dateForCol` | `src/internal/dateForCol.ts` | pure bucket→date helper (overdue=-3d / next7=+2d / later=+30d / nodate=null) | Reuse verbatim inside `addCard` for the optional-date-on-bucket case. |
| `validate` | `src/internal/validate.ts` | `isTaskColsArray` + `isTaskCard` boundary guards | Created card must pass `isTaskCard`; persisted array must pass `isTaskColsArray`. |
| `xai_task_cols` registry key | `plugin-web-storage/src/internal/registry.ts:197-204` | codec `json`, owner `xai-web-tasks`, default `{}` | **No new key needed.** (Answer to brief's registry-key question.) |
| Persistence boundary | `TasksModule.tsx:27-38,91-92` | `usePref` + `isTaskColsArray` + seed-fallback; `setRawCols(next as unknown as ...)` | Create result flows through the **same** write path → auto-persists + auto-rerenders. |
| Id scheme | `src/internal/seed/tasksMock.ts` | hardcoded "t1".."t26" / "c1".."c6" — **no generator** | **Must add `createTaskId()`.** (Answer to brief's id question.) |
| `+` button | `src/TaskColumn.tsx:68-74` | rendered, `aria-label`, no onClick | Add `onAddCard?(bucketId)` prop; thread to `TasksModule`. |
| `TaskCard.onClick` | `src/TaskCard.tsx:49,52` | bound to toggle-complete (click + Enter/Space) | **Collision risk for edit-on-click** → drives Edit/Delete deferral (D5). |

---

## 2. Candidate options (internal design alternatives)

### Axis A — Where does the create state machine live?

| Option | Description | Verdict |
|---|---|---|
| **A1 (chosen)** | Lift composer state (`open`, `targetBucket`, draft) into `TasksModule` via `useState`; `+` click sets `open=true` + `targetBucket=col.id`; save calls reducer `addCard` then `setRawCols`. No new event channel. | **Selected.** Mirrors Calendar Q5-A (React state lift, no `web:*` channel). `TasksModule` already owns `taskCols` + transient DnD state — this is the established home. |
| A2 | New `web:tasks:card-created` typed event channel in `packages/core/src/types/events.ts`. | Rejected. Carve-out forbids `core/events` edit. Re-render is local; no cross-window/cross-module consumer in scope (Matrix coupling is out of scope). |
| A3 | `useReducer` for the whole board. | Rejected. Over-engineering for a single additive action; the SHIPPED module uses `useState` + pure helpers (frozen assumption 5 of original design). |

### Axis B — Reducer create-action shape

| Option | Description | Verdict |
|---|---|---|
| **B1 (chosen)** | `addCard(prev: TaskCol[], draft: NewTaskDraft, targetBucket: BucketId, now?: Date): TaskCol[]` — pure; builds a `TaskCard` (id via `createTaskId()`, date via `dateForCol(targetBucket, now)`), prepends to target column's `tasks`, bumps `count`, returns referentially-equal untouched columns. | **Selected.** Symmetric with `moveCard`'s prepend + count + referential-equality discipline; pure + clock-injectable for deterministic tests. |
| B2 | Build the `TaskCard` inside `TaskComposer` and pass the finished card to a thin `insertCard(prev, card, bucket)`. | Acceptable but splits id/date responsibility across UI + reducer. B1 keeps all card-construction logic in the pure layer (one test target). Rejected for tidiness. |

`NewTaskDraft` shape (composer → reducer): `{ title: string; tag?: TaskTagId; withDate: boolean }`. The composer collects a single title string + optional tag + target bucket + an optional "give it a date" choice; `addCard` expands it into the immutable `TaskCard`.

### Axis C — Date handling on create

| Option | Description | Verdict |
|---|---|---|
| **C1 (chosen)** | Optional. If user leaves date off OR targets `nodate`, the card has no `date`/`dateZh`. If user opts in to a date AND target ≠ `nodate`, `addCard` calls `dateForCol(targetBucket, now)` to set `date`+`dateZh` (same per-bucket rule as DnD). | **Selected.** Reuses the SHIPPED `dateForCol` contract verbatim; consistent with what a DnD-into-that-bucket would produce. No free-form date entry in v1 (keeps composer minimal; matches carve-out "optional date label"). |
| C2 | Free-form `<input type="date">` like Calendar. | Rejected for v1. Tasks' date model is a display string keyed off bucket, not an ISO date; introducing a real date picker would diverge from the bucket-derived model and balloon scope. Deferred. |

### Axis D — Bilingual title input

| Option | Description | Verdict |
|---|---|---|
| **D1 (chosen)** | Single title input. The typed string fills **both** `title.en` and `title.zh`. Field label + placeholder follow active UI lang via local STR. | **Selected.** `validate.isTaskCard` requires non-empty `en`+`zh`; a single string satisfies both. Dual-field forces the user to type the same task twice — poor UX for a quick-create flow. Matches the brief's recommended default. |
| D2 | Two inputs (EN title + ZH title). | Rejected. Doubles input friction for a minimal quick-add; no evidence users maintain bilingual task titles. Can revisit if a future i18n requirement emerges. |

### Axis E — Composer affordance pattern

| Option | Description | Verdict |
|---|---|---|
| **E1 (chosen)** | Native `<dialog>` + `showModal()`/`close()` + `cancel` event (ESC) + backdrop-click (`e.target === dialogRef.current`) + `setTimeout(0)` autofocus, mirroring `EventComposer.tsx`. Tag picker = `role="radiogroup"` with a "none" option; bucket picker = `role="radiogroup"` over the 4 `BucketId`s. Inline title-required error. | **Selected.** Three SHIPPED precedents (EventComposer / BoardDeleteConfirmDialog / SignOutConfirmDialog); zero new dependency; jsdom-testable. |
| E2 | In-column inline composer (like board-core's add-card row). | Rejected. The `+` lives in the column header, not the body; a header-triggered modal is clearer and reuses the strongest (EventComposer) precedent. |

---

## 3. Decisions (frozen — answers to the brief's explicit questions)

- **D1 — Reducer already supports create?** **NO.** `tasksReducer.ts` has only `moveCard` + `toggleComplete`. → This feature ADDS a pure `addCard` action (Axis B1). *This is the headline discovery finding.*
- **D2 — State home / event channel?** State lifts into `TasksModule` (`useState`); **no** new `web:*` channel (Axis A1; Calendar Q5-A precedent). Carve-out forbids `core/events` edit.
- **D3 — Bilingual title?** Single title input fills both `en` + `zh` (Axis D1). Label follows active lang.
- **D4 — Id scheme?** New `internal/ids.ts` → `createTaskId()` mirroring calendar `eventStore/ids.ts` (`crypto.randomUUID()` with `t-<base36ts>-<rnd>` jsdom fallback). Seed ids ("t1"...) stay untouched; generated ids are guaranteed distinct from them.
- **D5 — Edit + Delete included?** **DEFERRED to a follow-up increment.** Rationale: `TaskCard` already binds click + Enter/Space to toggle-complete (`TaskCard.tsx:49,52,66,70`), so an edit-on-click affordance collides and needs a separate trigger; Edit also needs `updateCard` + bucket-change-detection, and Delete needs `deleteCard` + a confirm dialog (BoardDeleteConfirmDialog precedent) + a delete trigger on the card. That is 2 new reducer actions + a 2nd dialog + a card-affordance redesign — clearly above the "only if low-cost" bar. v1 ships **create-only** (3 phases). Edit/Delete is pre-scoped as the natural next increment.
- **D6 — Registry key?** Reuse `xai_task_cols` (registry.ts:197-204 confirmed present). No `plugin-web-storage` edit.
- **D7 — Target bucket default?** The clicked column's `id`. The bucket picker still lets the user retarget any of the 4 buckets — including `overdue` (whose header shows `postpone`, not `+`; it is reachable only by retargeting, which is acceptable since create is bucket-agnostic).
- **D8 — i18n?** Local `internal/strings.ts` STR table (en+zh), mirroring calendar. No `plugin-web-tokens` edit. Existing tokens keys (`common.add`, `tag.*`, column keys) continue via `useI18n`.

---

## 4. Tradeoffs accepted

- **Bucket-derived dates, not real dates** (C1): a created "Later" task shows "today+30d", identical to what dragging it there would show. Faithful to the SHIPPED date model; a real date picker is deferred.
- **Create-only v1** (D5): users still cannot rename/delete a task from the UI. Acceptable — the audit ask was specifically the missing create path; edit/delete is a clean follow-up with its own precedent (BoardDeleteConfirmDialog).
- **Single bilingual string** (D3): EN and ZH titles are identical for user-created cards. Acceptable for a quick-add; the seed's curated bilingual pairs are unaffected.
- **No event emission**: Statistics / Matrix do not see created tasks in real time. Out of scope per carve-out; matches the SHIPPED "no events in v1" stance (original design §6).

---

## 5. Recommendation

Proceed with **A1 + B1 + C1 + D1 + E1**, Edit/Delete **deferred** (D5). Add exactly:

- `src/internal/ids.ts` (`createTaskId`)
- `addCard` pure action in `src/internal/tasksReducer.ts`
- `NewTaskDraft` type in `src/types.ts` (additive, exported)
- `src/internal/strings.ts` (local STR table)
- `src/TaskComposer.tsx` (native `<dialog>`)
- `onAddCard` prop on `TaskColumn` + composer state in `TasksModule`
- composer styles appended to `src/styles.css`

Reuse the existing `xai_task_cols` persistence boundary unchanged. No registry edit, no host-shell edit, no `core` edit, no new dependency.

---

## 6. Risks & open questions

| ID | Risk | Mitigation |
|---|---|---|
| R1 | `addCard` count/immutability drift vs `moveCard` | Mirror `moveCard`'s exact prepend + `count+1` + referential-equality pattern; unit-test untouched-column identity. |
| R2 | Generated id collides with a seed id ("t1"…) | `createTaskId()` uses UUID / `t-<ts>-<rnd>` namespace — structurally disjoint from seed's `t<digit>` / `c<digit>`. Test asserts prefix shape. |
| R3 | `<dialog>` ESC/backdrop a11y differs in jsdom | Copy EventComposer's tested pattern verbatim (`cancel` listener + `e.target === dialogRef.current` + `setTimeout(0)` focus). |
| R4 | First-create on an empty install must materialize the seed array before inserting | `addCard` operates on the already-resolved `taskCols` (seed-or-persisted via `useMemo`), so the first write persists seed + new card together — same as the first DnD today. Persistence test covers empty-install create. |
| R5 | Composer opened from `overdue` (no `+`) reachable via bucket retarget only | Acceptable; documented (D7). `overdue` keeps its `postpone` header per original Q1 (decorative). |
| R6 | Title-only-whitespace passes naive check | `addCard`/validation `.trim()` the title and reject empty (mirrors EventComposer `validateUserCalEvent` title-required, inline error). |
| R7 | Cross-vendor manual smoke not run in-session | DEFERRED per ADR-0008 §S3 — joins the accumulated Web smoke batch before the next `xai-web-deploy-cloudflare` ship. Recorded in dev_log verify section at that time. |

### Open questions for `feature-review`

- **Q1**: Confirm Edit/Delete deferral (D5) — or does the reviewer want a minimal delete-only slice folded in (delete is cheaper than edit; could reuse BoardDeleteConfirmDialog without touching TaskCard's toggle binding if the delete trigger lives in the composer-as-edit... but composer-as-edit is itself deferred)? Planner recommends **full deferral**; flagging the cheaper delete-only variant for the reviewer.
- **Q2**: Confirm "optional date" UX (C1) — a single "Add a date for this bucket" checkbox vs always-on date for non-`nodate` buckets. Planner picks **checkbox (opt-in)**; reviewer may prefer auto-date matching DnD behavior.
- **Q3**: Confirm tag picker includes a visible "No tag" radio (default selected) vs a toggle-off-able row. Planner picks **explicit "None" radio** (matches EventComposer recurrence "none").
- **Q4**: Confirm 3 phases is right-sized (P1 data layer / P2 composer + wire / P3 tests + cross-vendor) vs splitting composer and wire. Planner picks **3 phases** (data layer is tiny — one reducer action + ids).
