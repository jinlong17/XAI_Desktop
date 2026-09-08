# plugin-project — Feature Brief: project:card-* typed events emit

| Field | Value |
|---|---|
| Status | READY_FOR_FEATURE_PLAN |
| Author | Claude (W0.B for plugin-project, third D-3 closer after productivity + labels) |
| Date | 2026-05-23 |
| Feature slug | `plugin-project` (next phase on existing dev_log) |
| Source seed | `docs/planning/3-sub-prd-pre-analysis-20260522.md` §2.4 D-3 |
| Predecessor work | 2026-05-20 Track B Codex (`Status: READY_FOR_VERIFY`) — superseded by this phase |
| Sibling rows | `plugin-productivity` (shipped 2026-05-23, commits `7ee5d6f`..`99b3de9`) · `plugin-labels` (shipped 2026-05-23, commits `c0a9cf8`..`3e27206`) — established the typed-events emit pattern this row reuses |

---

## 1. Structured Brief

### 1.1 Problem

`plugin-project` owns Kanban-style boards via a single store hook
(`useProjectStore`) covering project list / column / **card** CRUD plus card
movement. Per the dev_log "Pending" line, three card-specific typed events
are missing:

> Pending: emit `project:card-created` / `project:card-moved` /
> `project:card-updated` via `@repo/core/events`.

`@repo/core/events` is Stable (productivity + labels both shipped emits).
Downstream consumers (Console board surface, future statistics, Web cross-
tab Kanban) cannot observe card state transitions today. This row closes the
project portion of drift D-3.

Note: project-level CRUD (e.g. `project:created`) is **not** in scope —
only the three card events are listed as gaps.

### 1.2 User / Actor

- **Direct**: developers building Console board / Web cross-tab Kanban /
  productivity↔project linkage features.
- **Indirect (end-user)**: users expecting cross-window Kanban updates
  (card created in one window appears in another; drag-and-drop in one
  window reflects in another).

### 1.3 Goal

1. Declare three additive `EventMap` entries (`project:card-created`,
   `project:card-moved`, `project:card-updated`).
2. Wire `emitEvent(...)` at the card create / move / update mutation
   outlets in `useProjectStore`.
3. Cover each emit with vitest unit tests.
4. Close drift D-3 fully (productivity + labels + project all done).

### 1.4 Non-goals

- No UI changes (BoardView / CardDetail / Console board surface unchanged).
- No edits to `plugin-console`, `plugin-account`, `plugin-productivity`,
  `plugin-labels`, `plugin-calendar`, or `apps/desktop/**`.
- No Tauri command / Rust / native macOS changes.
- No persistence schema changes; no new permission prompts.
- No PLUGIN_MAP Stable promotion (that is W0.C; do not touch row 76).
- **No project-level CRUD events** (`project:created/updated/deleted` are
  outside the documented gap; defer to a future row if needed).
- No `project:card-deleted` event (the dev_log gap line names only
  created / moved / updated; if `useProjectStore.deleteCard` exists, a
  future row may add it).

### 1.5 Scope (file boundary)

- `packages/core/src/types/events.ts` — append three additive EventMap
  entries (declaration only) after the existing `labels:*` block.
- `packages/plugin-project/src/hooks/useProjectStore.tsx` — emit at three
  outlets:
  - `createCard` → `project:card-created`
  - `moveCard` → `project:card-moved` (carries source / target list+order)
  - `updateCard` (or equivalent mutator that changes title / description /
    labels / dueDate / checklist) → `project:card-updated`
- Co-located vitest test (`useProjectStore.test.tsx`) mocking
  `@repo/core/events`.

Out of scope:

- `packages/core/src/events/{emitter,listener,index}.ts` — Stable infra,
  no edits.
- `plugin-project/src/{components,data,utils,register-plugin}.*`.
- `useProjectStore` action handlers that do not match the three named
  card mutation outlets (e.g. project CRUD, list reorder, label set on
  project).

### 1.6 Classifications

| Dimension | Value |
|---|---|
| Architecture Kind | plugin slice |
| User Surface | API only (cross-window contract) |
| Change Type | extension |
| Impacted Layers | `packages/plugin-project/src/hooks/`, `packages/core/src/types/events.ts` |
| Target Plugin State | In-Dev (row 76) |
| Risk Level | low–medium (single hook + additive contract; `moveCard` payload needs careful design to carry source/target list+order) |

### 1.7 Dependencies

| Dependency | State | Direct use? |
|---|---|---|
| `@repo/core` typed events | Stable | Yes |
| `@repo/core-data` (RepoRecord) | In-Dev | Only via existing `Card` entity shape; this row does not extend it |
| `plugin-productivity` / `plugin-labels` (siblings) | In-Dev | Not depended on; same emit pattern reused |

### 1.8 Mock strategy

`No Mock` for runtime. Unit tests mock `emitEvent` to assert call shape.

### 1.9 Data / permission / security

Cross-window typed events are local Tauri IPC. Payloads carry domain
identifiers and Kanban-domain field values only — no PII, no secrets.

For `project:card-moved`, payload should carry:

- `id` (card id)
- `fromListId`, `toListId`
- `fromOrder`, `toOrder` (pre/post state)
- `version`, `updatedAt`

so consumers can perform local list re-sort without re-fetching the whole
board.

### 1.10 Release strategy

Standard V2 path (`feature-plan → feature-review → feature-build →
feature-verify → ship`).

### 1.11 Rollback / degrade

- Rollback: revert emit call sites + EventMap entries.
- Degrade: reuse `.catch(() => undefined)` non-Tauri swallow pattern from
  sibling rows.

### 1.12 Acceptance criteria (binary)

- [ ] `packages/core/src/types/events.ts` adds three additive entries
      after the `labels:*` block. Existing entries unchanged.
- [ ] `useProjectStore.createCard` emits `project:card-created` exactly
      once per successful create with full card identity + position
      (`{id, projectId, listId, title, order, version, createdAt}`).
- [ ] `useProjectStore.moveCard` emits `project:card-moved` exactly once
      per successful move with source + target position
      (`{id, projectId, fromListId, toListId, fromOrder, toOrder, version,
      updatedAt}`).
- [ ] `useProjectStore.updateCard` (or whichever name the store uses for
      title / description / labels / dueDate / checklist edits) emits
      `project:card-updated` exactly once per successful update with
      `{id, projectId, listId, version, updatedAt}` plus the changed
      field(s) per discovery review's payload finalization.
- [ ] Each emit uses `.catch(() => undefined)`.
- [ ] No-op moves (`fromListId == toListId && fromOrder == toOrder`)
      do not emit.
- [ ] `useProjectStore.test.tsx` covers all three triggers + payload
      schema with mocked `emitEvent` (≥ 10 binary AC scenarios spanning
      C / M / U).
- [ ] `pnpm --filter @repo/core check-types` passes.
- [ ] `pnpm --filter @repo/plugin-project check-types` passes.
- [ ] `pnpm --filter @repo/plugin-project test` passes.
- [ ] dev_log reaches `READY_TO_SHIP`.

---

## 2. Open Questions / Unknowns (resolved during feature-plan discovery)

1. **Exact `useProjectStore` API surface** for card mutations — feature-plan
   should read `useProjectStore.tsx` to confirm action names
   (`createCard` / `moveCard` / `updateCard`?) and where each mutation
   resolves (adapter `save` vs in-memory only).
2. **`project:card-moved` no-op suppression** — confirm via store
   `moveCard` implementation; if the store already short-circuits
   no-op moves, the emit naturally never fires; otherwise add a guard
   at the emit site.
3. **Card mutation that combines title + description + labels + dueDate
   + checklist** — is there a single `updateCard` action or multiple
   (`renameCard`, `setCardDescription`, `setCardLabels`, etc.)? feature-
   plan resolves; brief assumes a single coalesced action for clean
   `card-updated` payload semantics.
4. **`projectId` in payload** — confirm `Card` entity carries a
   `projectId` field or that the store knows which project each card
   belongs to. If not directly on `Card`, derive from store context.
5. **Re-emit on re-render** — emits are action-coupled (same as labels);
   re-render dedup likely not needed. Confirm in discovery.

---

## 3. ADR-lite Trigger

| Field | Value |
|---|---|
| Needed | No |
| Rationale | Additive entries to an existing typed-event contract governed by ADR-0003. Two sibling rows already established the pattern. No new architectural decision. |

---

## 4. Planner Handoff

| Field | Value |
|---|---|
| Feature slug | `plugin-project` |
| Three-faces decision | plugin slice owns the change; core change is declaration only. |
| Target plugin slice | `plugin-project` (In-Dev per `docs/PLUGIN_MAP.md:76`; this row does not promote it). |
| Mock strategy | No Mock runtime; unit tests mock `emitEvent`. |
| Cross-window contract impact | Yes — additive only. Three new EventMap entries after the `labels:*` block; no existing entries modified. |
| Automation Mode | `A-Claude` |
| Verify Cross-vendor | `no` |
| Roadmap Manifest | none (standalone D-3 drift fix row, final of three) |
| Real-hardware verification | Not required for this row (no multi-window navigation, no native API, no Tauri command signature change). |
| Pattern reuse | Sibling rows productivity + labels (shipped 2026-05-23) used same emit + non-Tauri swallow pattern; expect 2 BUILD phases (EventMap declaration + store emit + tests). |

---

## 5. Saved brief path

`docs/reviews/plugin-project/20260523-feature-brief.md`
