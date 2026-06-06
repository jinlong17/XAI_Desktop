# Discovery Review — xai-web-matrix-card-create

**Date:** 2026-05-28
**Author:** feature-plan (Claude Opus claude-opus-4-8)
**Authority:** ADR-0010 §D4 P0 carve-out — `docs/reviews/_p0-carve-outs/20260528-matrix-card-create.md` (commit `b9334f7`)
**Audit trigger:** `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #4 + §2.6 rows M-01 / M-03
**Mirror precedent:** `xai-web-tasks-card-create` (SHIPPED 2026-05-28, ship commit `0ba69f0`; lineage `09673f8`→`7ea4b32`→`9c3d481`→`5a1e606`→`50de9b0`→`0ba69f0`)

> Discovery detail lives here, NOT in `design.md`. `design.md` carries the decision snapshot only.

---

## 1. Problem framing

The Matrix module (Eisenhower 2×2) renders an add (`+`) button in two places, **both with no `onClick`**:

- **M-01** — header `+` at `MatrixModule.tsx:39-41` (VERIFIED: `<button type="button" className="icon-btn" aria-label={...}>` with a `<PlusIcon/>` child and no handler).
- **M-03** — per-quadrant `+` at `Quadrant.tsx:81-83` (VERIFIED: same shape, `<PlusIcon size={14}/>`, no handler).

Consequence: a user cannot add a card to the matrix. Every visible card comes from `internal/seed.ts` (8 cards, all in Q4). The **only** write path today is drag-between-quadrant (`moveCardTo` reducer → `setState` → `emitPriorityTagged`).

This feature is the **structural mirror** of the just-SHIPPED `xai-web-tasks-card-create`: add the missing CREATE UI (a `MatrixComposer` native `<dialog>`) and wire it to a new pure `addCard` action in the existing persisted-state layer. The architecture is parallel (own store, own persisted hook, own typed card model), so the plan reuses the Tasks decisions and phase split nearly verbatim, with the divergences called out in §3 and §6.

### Feature naming

- **Feature Title:** Matrix card-create — wire header/quadrant `+` → MatrixComposer → addCard → persist
- **Canonical `<feature_name>`:** `xai-web-matrix-card-create`
- **Owning package:** `@repo/plugin-web-matrix` (directory `packages/xai-web-matrix/`) — extension only, NOT a new package.
- **Rationale:** matches the sibling `xai-web-tasks-card-create` naming exactly (`<owning-package-slug>-card-create`); the carve-out doc, audit, and operator brief all use this slug.

---

## 2. External research

**No external research required.** This is purely internal business logic on a SHIPPED package. No technology selection, no new npm dependency, no open-source alternative evaluation. The carve-out explicitly forbids new deps ("NO new npm dependency", carve-out §2). The implementation pattern is already proven in-repo three times (EventComposer, TaskComposer, BoardDeleteConfirmDialog) — the discovery is a *reuse* analysis, not a *selection* analysis.

---

## 3. Current-state recon (VERIFIED against source 2026-05-28)

| # | Question | Finding | Source (verified) |
|---|---|---|---|
| R1 | Does `usePersistedMatrix` have a create/add action? | **NO.** Exposes only `{ state, setState, moveCard }`. `moveCard` is the sole write path (calls `moveCardTo` + `emitPriorityTagged`). | `internal/usePersistedMatrix.ts:27-31, 60-67` |
| R2 | Is there a pure create reducer? | **NO.** `internal/move.ts` has only `moveCardTo`. No `addCard`. (Same as Tasks: `tasksReducer` had only `moveCard`+`toggleComplete` before its create feature.) | `internal/move.ts:32` |
| R3 | Is there an id generator? | **NO.** Seed ids are hard-coded literals `seed-1`..`seed-8`. No `createMatrixId()`. (Tasks added `internal/ids.ts`.) | `internal/seed.ts:15-61` |
| R4 | What is the persistence write boundary? | `setState(next: MatrixState)` — a typed setter that wraps the storage blob cast (`setRawState(next as unknown as RawBlob)`). **Cleaner than Tasks** (which only exposed raw `setRawCols`). `addCard` can flow through `setState` directly. | `internal/usePersistedMatrix.ts:38` |
| R5 | Bilingual title — single input or two? | `MatrixCard.title = { en: string; zh: string }`, both required. Mirror Tasks D1: **single input fills both en+zh**. Seed pairs untouched. | `types.ts:17-30` |
| R6 | M-01 (header `+`) default quadrant? | No existing default — the button is a no-op. **Planner pick: default to `q1`** (Urgent+Important — the natural "what should I add" default); MatrixComposer exposes a quadrant radiogroup so the user can retarget any of q1..q4. | resolved §6 QE-D |
| R7 | M-06 (card click) — is the card onClick free? | **YES — FREE.** `Card.tsx` wires `onDragStart`/`onDragEnd`/`onKeyDown` (Ctrl/⌘+Arrow move) but **NO `onClick`**. This is the KEY divergence from Tasks (whose `TaskCard.tsx:49` onClick was bound to toggle-complete, forcing Edit/Delete deferral). See §6 QE-A. | `Card.tsx:58-82` (no onClick) |
| R8 | Does the create path need to emit `web:matrix:priority-tagged`? | **NO.** That channel is move-specific (`from`/`to` payload), consumer-less, and the carve-out says "existing emit stays consumer-less; wiring a consumer is out of scope" + "do not touch". Create persists via `setState` only — no emit. | `internal/emit.ts:19-36`, carve-out §2 |
| R9 | Registry key — reuse or add? | **Reuse `xai_matrix_state`** (already registered; owner `xai-web-matrix`, `MatrixStateBlob = unknown`). NO `plugin-web-storage` edit. | `usePersistedMatrix.ts:21`, manifest `status: Production` |
| R10 | Local STR pattern available? | **YES.** Mirror Tasks `internal/strings.ts` → new `STR_MATRIX_COMPOSER` `Record<string,{en,zh}>`. NO `plugin-web-tokens` edit. Tag labels keep flowing through the in-file `translateTag` helper (`Card.tsx:86-95`) / `useI18n`. | `Card.tsx:86-95`, Tasks `internal/strings.ts` |
| R11 | Native `<dialog>` precedent? | **YES, proven 3×.** `TaskComposer.tsx` (closest mirror), `EventComposer.tsx`, `BoardDeleteConfirmDialog.tsx`, `SignOutConfirmDialog.tsx`. `showModal()`/`close()` + `cancel`(ESC) + backdrop (`e.target===dialogRef.current`) + `setTimeout(0)` autofocus. | `xai-web-tasks/src/TaskComposer.tsx:67-277` |
| R12 | What tags does the matrix recognize? | `Card.tsx` `translateTag` knows `study|work|personal|todo|other` (same 5 presets as Tasks `TaskTagId`). Composer tag radiogroup uses these 5 + "None". | `Card.tsx:86-95` |
| R13 | Is the module feature-gated? | Matrix mounts via `matrixSlotRegistration` (railOrder 6). Discovery did NOT confirm a `withDisabledFallback` wrapper (Tasks had one — Rec-E1). **Flag for build:** verify whether matrix is in the 8 toggleable set; if so, note "Matrix must be enabled" in the EP3 manual sweep. | `shellRegistrations.tsx` (build-time confirm) |

**Headline:** the Matrix data layer mirrors Tasks almost exactly, with **two divergences in our favor**:
1. `usePersistedMatrix` already exposes a typed `setState` (Tasks only had raw `setRawCols`) → the create dispatch is cleaner.
2. `Card.tsx` has a **free onClick** → Edit/Delete is genuinely cheaper than it was for Tasks (where the click was occupied). This re-opens the planner's-call (carve-out §2 delegated Edit/Delete to the planner). See §6 QE-A.

---

## 4. Candidate options + tradeoffs

Because this mirrors a just-SHIPPED feature, the option space is narrow. Each axis lists the option taken and why the alternative was rejected.

### Axis A — Where does composer state live?

| Option | Description | Verdict |
|---|---|---|
| **A1 (TAKEN)** | Composer `{open, targetQuadrant}` state lifts into `MatrixModule` via `useState`; created card dispatched through `usePersistedMatrix`. | **Selected.** Mirrors Tasks A1 + Calendar Q5-A ("React state lift, no event channel"). Carve-out forbids a new `web:*` channel. |
| A2 | New `web:matrix:card-created` event channel. | Rejected — violates carve-out ("NO new event channel — React state lift"). |

### Axis B — Create primitive

| Option | Description | Verdict |
|---|---|---|
| **B1 (TAKEN)** | One new pure `addCard(state, draft, targetQuadrant)` in a reducer module, symmetric with `moveCardTo` (append to target quadrant, return prev unchanged on empty-title / unknown-quadrant, referential equality for untouched quadrants). | **Selected.** Mirrors Tasks `addCard`. Pure + unit-testable. |
| B2 | Inline the create logic inside `MatrixModule`. | Rejected — untestable in isolation; breaks the pure-reducer discipline the package already follows (`move.ts`). |

**Placement decision (QE-E, §6):** `addCard` goes in a new `internal/create.ts` (NOT inside `move.ts`). Rationale: `move.ts` is named for and documents only the move reducer; Tasks co-located `addCard` in `tasksReducer.ts` because that file was already the generic "reducer" module, but the matrix's equivalent file is specifically `move.ts`. A sibling `create.ts` keeps each pure module single-purpose and the diff reviewable. **Flagged for review** — a reviewer who prefers renaming `move.ts`→`reducer.ts` and co-locating may override.

### Axis C — Dispatch wiring in the hook

| Option | Description | Verdict |
|---|---|---|
| **C1 (TAKEN)** | Add an `addCard(draft, to)` method to `usePersistedMatrix` that calls the pure `addCard` + `setState` (NO emit). Hook returns `{ state, setState, moveCard, addCard }`. | **Selected.** Keeps the persistence boundary single-sourced inside the hook (mirrors how `moveCard` is wrapped). Component calls `addCard(draft, to)` — symmetric with `moveCard(cardId, to)`. |
| C2 | Component calls pure `addCard` then `setState` directly (bypass the hook). | Rejected — splits the persistence boundary; the hook is the established single write surface. |

### Axis D — Bilingual title

| Option | Description | Verdict |
|---|---|---|
| **D1 (TAKEN)** | Single title input fills both `title.en` + `title.zh`; field label follows active UI lang. | **Selected.** Identical to Tasks D1 (SHIPPED + review-approved). Quick-add ergonomics; both langs satisfied; seed's curated pairs untouched. |
| D2 | Two inputs (en + zh). | Rejected — double-entry friction for a quick-add; Tasks review explicitly accepted single-input. |

### Axis E — Composer mechanism

| Option | Description | Verdict |
|---|---|---|
| **E1 (TAKEN)** | Native `<dialog>` mirroring `TaskComposer.tsx` verbatim (showModal/close, cancel/ESC, backdrop, setTimeout(0) autofocus, title-required inline error, tag radiogroup + quadrant radiogroup). | **Selected.** Proven 3× in-repo; jsdom-testable; a11y-complete. |
| E2 | Inline panel / popover. | Rejected — no precedent; loses modal a11y semantics; more CSS. |

### Axis F — Edit / Delete (planner's call per carve-out §2)

This is the one axis where Matrix genuinely differs from Tasks. See §6 QE-A for the full decision.

| Option | Description | Verdict |
|---|---|---|
| **F1 (TAKEN — v1)** | **CREATE-only.** Defer Edit + Delete to a follow-up increment. | **Selected for v1.** See QE-A rationale: even though card onClick is free (cheaper than Tasks), Edit needs `updateCard` + a pre-filled composer mode + a delete affordance + a confirm dialog (BoardDeleteConfirmDialog precedent) — a meaningfully larger surface than the carve-out's "low-cost only" bar, and it would roughly double the build. Create-only is a coherent slice (create + see + persist + reschedule-via-existing-DnD). |
| F2 | Fold in delete-only (card hover × → confirm → remove). | **Documented as the recommended NEXT increment** (cheaper here than Tasks because onClick is free). NOT in v1. |
| F3 | Full Edit + Delete now. | Rejected for v1 — above the carve-out bar; doubles the phase count. |

---

## 5. Recommendation

Implement **A1 + B1 + C1 + D1 + E1 + F1** — the strict Tasks mirror, CREATE-only, with the new pure `addCard` in `internal/create.ts`, dispatched through a new `usePersistedMatrix().addCard(draft, to)`, surfaced by a native `<dialog>` `MatrixComposer` wired to both M-01 (default `q1`) and M-03 (default = clicked quadrant). No emit on create. Reuse `xai_matrix_state`. Local `STR_MATRIX_COMPOSER`. 3-phase build (EP1 data layer / EP2 composer + wire + persistence / EP3 integration + a11y + cross-vendor) mirroring the Tasks split.

**Acceptance anchor (carve-out §5):** a user clicks the header `+` or a quadrant `+`, types a title, picks a tag/quadrant, saves, sees the card in the correct quadrant (including a previously empty one), and it survives a refresh.

---

## 6. Open questions for feature-review (planner picks recorded)

- **QE-A (HEADLINE) — Edit/Delete scope.** Matrix `Card.tsx` has a FREE onClick (verified §3 R7), unlike Tasks. The carve-out §2 delegates Edit/Delete to the planner ("only if low-cost"). **Planner pick: DEFER both to a follow-up increment (F1).** Even with the free click, Edit requires a `updateCard` reducer + a composer "edit mode" (pre-fill + title change) + a delete affordance + a confirm dialog (BoardDeleteConfirmDialog precedent) — a larger surface than the "low-cost" bar, ~doubling the build. Create-only is coherent. **Reviewer may override** to fold in a delete-only slice (genuinely cheaper here than it was for Tasks — flag this explicitly for the reviewer).
- **QE-B — M-01 header `+` default quadrant.** No existing default. **Planner pick: `q1`** (Urgent+Important = the natural default for "what do I need to do"). The composer's quadrant radiogroup lets the user retarget. **Reviewer may prefer** a different default (e.g. last-touched, or forcing an explicit pick with no preselect).
- **QE-C — M-03 per-quadrant `+` default.** **Planner pick: default = the clicked quadrant** (carve-out §2; matches the "add here" affordance). No ambiguity; recorded for completeness.
- **QE-D — `addCard` no emit.** **Planner pick: create does NOT emit `web:matrix:priority-tagged`** (that channel is move-specific + consumer-less; carve-out says don't touch). Recorded; reviewer confirms.
- **QE-E — Pure reducer placement.** **Planner pick: new `internal/create.ts`** (keep `move.ts` single-purpose) vs co-locating in a renamed `internal/reducer.ts`. Reviewer may prefer co-location to match the Tasks `tasksReducer.ts` single-file convention.
- **QE-F — 3-phase split.** **Planner pick: 3 phases** (EP1 data / EP2 composer+wire+persist / EP3 integration+a11y+xvendor), mirroring the review-approved Tasks split. Reviewer may compress to 2.

---

## 7. Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RE1 | `addCard` immutability / referential-equality drift vs `moveCardTo` | Medium | Mirror `moveCardTo`: rebuild only the target quadrant array, return untouched quadrants by reference; identity assertion test (T-ADD immutability). |
| RE2 | Generated id collides with seed ids (`seed-1..8`) | Medium | `createMatrixId()` = `crypto.randomUUID()` + `m-<base36ts>-<rnd>` fallback — namespace disjoint from `seed-<digit>`; T-IDS shape assertion. |
| RE3 | `<dialog>` ESC/backdrop/focus differs in jsdom | Medium | Copy `TaskComposer` pattern verbatim (proven across EventComposer + TaskComposer test suites); T-MC a11y tests. |
| RE4 | First create on a fresh install must materialize seed before insert | Medium | `addCard` runs on the resolved `state` (seed-or-persisted via the SHIPPED `usePersistedMatrix` seed-hydration `useEffect`); first write persists seed+card together. T-CR integration covers it. |
| RE5 | Append-vs-prepend ordering mismatch | Low | `moveCardTo` **appends** to the target (`[...next[to], card]`, move.ts:73) — Matrix v1 convention is append (unlike Tasks `addCard` which prepends). Mirror the **Matrix** convention: `addCard` **appends** to keep ordering consistent with drag. Documented in api.md; T-ADD asserts position. |
| RE6 | Whitespace-only title | Low | `.trim()` reject in both the composer (inline error) and `addCard` (defensive guard returning prev unchanged). |
| RE7 | Module feature-gating unknown (§3 R13) | Low | Confirm at build whether matrix has a `withDisabledFallback` wrapper; if so, EP3 manual sweep notes "Matrix must be enabled". No plan impact (create lives inside `MatrixModule` which only mounts when ON). |
| RE8 | Cross-vendor smoke not run in-session | Low | DEFER per ADR-0008 §S3; record checklist in verify section at deferral time. Joins the accumulated Web smoke batch before next `xai-web-deploy-cloudflare`. |

---

## 8. Frozen assumptions (carry into design.md §E.1)

1. No new package — all code in `packages/xai-web-matrix/src/`.
2. New files: `src/internal/ids.ts` (`createMatrixId`), `src/internal/create.ts` (`addCard`), `src/internal/strings.ts` (`STR_MATRIX_COMPOSER`), `src/MatrixComposer.tsx`.
3. One new pure action `addCard(state, draft, targetQuadrant)` — **appends** to the target quadrant (Matrix move-convention), returns `prev` on empty-title / unknown-quadrant, referential equality for untouched quadrants.
4. New exported type `NewMatrixCardDraft = { title: string; tag?: string }` (additive in `types.ts`; NO `withDate` — Matrix has no bucket-derived date model; date stays `undefined` on user-created cards in v1).
5. Persistence reuse — `xai_matrix_state` (registry; owner `xai-web-matrix`). NO `plugin-web-storage` edit. Flows through the hook's existing `setState` boundary cast.
6. No new event channel — composer state lifts into `MatrixModule` via `useState`; NO `packages/core/src/types/events.ts` edit. Existing `web:matrix:priority-tagged` untouched; create does NOT emit.
7. Composer = native `<dialog>` mirroring `TaskComposer.tsx` (showModal/close, cancel/ESC, backdrop, setTimeout(0) autofocus). Tag picker + quadrant picker = `role="radiogroup"`.
8. Single bilingual title — one input fills both `title.en` + `title.zh`; label follows active UI lang.
9. Local STR — `src/internal/strings.ts` (en+zh). NO `plugin-web-tokens` edit. Tag labels reuse the in-file `translateTag` map / `useI18n`.
10. id via `createMatrixId()` — `crypto.randomUUID()` + `m-<base36ts>-<rnd>` fallback; disjoint from `seed-<digit>`.
11. `addCard` dispatched via a new `usePersistedMatrix().addCard(draft, to)` method (hook returns `{ state, setState, moveCard, addCard }`); NO emit on create.
12. M-01 header `+` defaults targetQuadrant to `q1`; M-03 quadrant `+` defaults to the clicked quadrant; composer exposes a 4-quadrant radiogroup to retarget.
13. Edit + Delete DEFERRED to a follow-up increment (QE-A) — recorded as the recommended next slice (cheaper here than Tasks because card onClick is free).
14. No host-shell edit — `matrixSlotRegistration` (railOrder 6) already SHIPPED; create needs no registration change.
15. `MatrixCard.taskId` stays `undefined` (reserved for the future Tasks join — do NOT touch; separate ADR).
