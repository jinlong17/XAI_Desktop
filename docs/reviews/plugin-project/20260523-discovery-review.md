# plugin-project — Discovery Review: `project:card-*` typed events emit

| Field | Value |
|---|---|
| Status | NEEDS_REVIEW |
| Author | feature-plan (Claude) |
| Date | 2026-05-23 |
| Feature slug | `plugin-project` |
| Brief | `docs/reviews/plugin-project/20260523-feature-brief.md` |
| Sibling pattern source | `plugin-productivity` (shipped 2026-05-23 `7ee5d6f`..`99b3de9`) · `plugin-labels` (shipped 2026-05-23 `c0a9cf8`..`3e27206`) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| ADR-lite | not required (additive entries to ADR-0003-governed typed-event contract) |

---

## 1. Problem Framing

`plugin-project` is the third and final D-3 drift closer. Productivity + labels
already emit their domain mutations via `@repo/core/events`. Card-level state
transitions in `useProjectStore` (`createCard` / `moveCard` / `updateCard`)
emit nothing — Console board, Web cross-tab Kanban, and future
productivity↔project linkage cannot observe Kanban changes.

Scope is strictly **card events**:

- `project:card-created`
- `project:card-moved`
- `project:card-updated`

Out of scope (per brief §1.4):

- Project-level CRUD events (`project:created/updated/deleted`).
- `project:card-deleted` (not listed in the dev_log "Pending" line; deferred
  to a future row if/when needed).
- Any UI / Tauri / Rust / native macOS change.
- PLUGIN_MAP row 76 promotion (W0.C scope).

---

## 2. Open Question Resolution

Resolved by reading `packages/plugin-project/src/hooks/useProjectStore.tsx`
(lines 1–272) and `packages/plugin-project/src/types.ts` (lines 1–64).

### Q1. Exact card mutation action names

| Action | Lines | Mutates |
|---|---|---|
| `createCard(input: CardDraft)` | 157–184 | inserts new `Card` with `siblingCount`-based `order`, `version: 1` |
| `moveCard(cardId, listId, order = 0)` | 205–232 | clamps order, re-normalizes source + target lists, bumps `version` on dirty rows |
| `updateCard(id, patch)` | 186–195 | merges `patch`, bumps `version`, stamps `updatedAt` |
| `updateChecklist(cardId, checklist)` | 234–237 | thin wrapper → `updateCard(cardId, { checklist })` |
| `deleteCard(id)` | 197–203 | out of scope (no `project:card-deleted` event) |

**Decision**: emit at three outlets — `createCard` (post-`save`),
`moveCard` (after `dirty` calculation, before `setCards`), `updateCard`
(post-`save`). `updateChecklist` automatically inherits the emit via the
inner `updateCard` call — no extra emit needed at the wrapper.

### Q2. `moveCard` no-op suppression

Current implementation (lines 205–232) does **NOT** short-circuit no-op
moves explicitly. When `fromListId == toListId && fromOrder == toOrder`,
the `dirty` array is empty (no card has changed `listId` or `order`),
so the `Promise.all(...save)` loop is a no-op but `setCards(nextCards)`
still runs (replacing each card with a new object reference even when
`updatedAt` / `version` are not bumped, because the `.map` always returns
new objects — but the `dirtyIds.has(card.id)` guard ensures unchanged
cards pass through untouched).

**Decision**: gate the emit on `dirty.length > 0`. Compute
`fromListId = target.listId`, `fromOrder = target.order` before the
re-normalization, then emit only when at least one row was dirtied
(equivalent to "card actually moved"). This satisfies AC "No-op moves do
not emit" without changing the existing store logic.

### Q3. Coalesced vs split `updateCard`

`updateCard` is a **single coalesced action** accepting
`Partial<Omit<Card, "id">>` (line 187). Title / description / labels /
dueDate / checklist edits all flow through this one mutator (including
via the `updateChecklist` wrapper).

**Decision**: emit one `project:card-updated` per `updateCard` call. The
payload carries the post-merge `{id, listId, version, updatedAt}` plus
the explicit `patchKeys: string[]` listing which top-level fields were
in the caller's `patch` (e.g. `["title"]`, `["checklist"]`,
`["labels", "dueDate"]`). This gives consumers cheap targeted re-render
hints without paying for a full per-field event split.

### Q4. `projectId` on the payload

`Card` (types.ts:35–50) **does not carry `projectId`**. Cards reference
only `listId`; the store has no card-to-project lookup. `activeProjectId`
is UI state only and is irrelevant to `createCard` (cards can be created
into any list regardless of which project is "active").

The brief explicitly forbids edits to
`plugin-project/src/{components,data,utils,register-plugin}.*` or
`types.ts`. Adding `projectId` to `Card` would change the entity shape
and break that constraint.

**Decision**: **omit `projectId` from all three event payloads**. Emit
`{id, listId, ...}` only. Consumers that need the owning project must
resolve it externally (e.g. via the list's containing project lookup
when project-level state is needed). The brief's §1.5 / §1.12 mentioning
`projectId` in payload is a pre-discovery assumption — the discovery
review formally drops it. Future row may add a `projectId` field to
`Card` (entity-shape change) and to event payloads in a single coupled
change.

### Q5. Re-emit on re-render

All three emits live inside `useCallback` action closures, invoked only
when the caller (BoardView / CardDetail / external consumer) calls the
action. They are NOT inside `useEffect`. Provider re-render without any
action call cannot trigger an emit.

**Decision**: no dedup ref needed; mirrors the labels sibling row
behaviour. Covered by an AC-P-G2 re-render-without-action test.

---

## 3. Candidate Options

### Option A — Mirror labels: one emit per coalesced action (RECOMMENDED)

Three emits at three call sites inside `useProjectStore`, mirroring the
exact sibling pattern from `useLabelStore` (productivity + labels both
use this shape).

- `createCard`: emit `project:card-created` after `stableCardAdapter.save`.
- `moveCard`: capture `fromListId` / `fromOrder` pre-mutation; emit
  `project:card-moved` only when `dirty.length > 0`; payload carries
  source + target list + order.
- `updateCard`: emit `project:card-updated` after `save`; payload carries
  the post-merge identity + `patchKeys`.

Pros:
- Direct sibling-pattern reuse (productivity + labels): mechanical, low
  risk, fast review.
- Single coalesced `card-updated` matches the single coalesced
  `updateCard` action — semantically clean.
- `patchKeys` gives consumers a cheap field-change hint without paying
  full delta cost.

Cons:
- Consumers expecting per-field events (e.g. dedicated `card-renamed`)
  must filter on `patchKeys`. Acceptable trade-off for D-3 closure.

### Option B — Split `card-updated` into per-field events

Add `project:card-renamed`, `project:card-labels-changed`,
`project:card-due-date-changed`, `project:card-description-changed`,
`project:card-checklist-changed`. Five EventMap entries plus three
already-listed.

Pros:
- Consumers can subscribe to only the field they care about.

Cons:
- 5× the EventMap surface for one in-scope dev_log line ("card-updated").
- Brief §1.4 lists only three card events; this option violates the
  documented scope.
- Single coalesced `updateCard` would need to detect which fields
  changed pre-merge and emit one event per dirtied field — more code,
  more tests, more drift risk.

**Rejected**: out of brief scope and disproportionate cost for D-3
closure.

### Option C — Defer `card-moved` to a separate row

Ship `card-created` + `card-updated` now; ship `card-moved` later under
a dedicated row because its payload is the richest (5 positional
fields).

Pros:
- Smaller diff per phase.

Cons:
- Brief §1.12 binary AC lists all three as one acceptance set.
- Sibling rows shipped 3-event sets in 2 BUILD phases; this row should
  match.
- Splitting D-3's third closer into two rows complicates the roadmap.

**Rejected**: violates brief AC granularity and the established D-3
pattern.

---

## 4. Recommendation

**Option A** — single emit per coalesced action, mirroring the labels
sibling pattern, omitting `projectId` from payloads (Q4 resolution).

### Final payload shapes

#### `project:card-created`
```ts
{
  id: string;             // card.id
  listId: string;         // initial list
  title: string;          // trimmed title (post-validation)
  order: number;          // siblingCount at insert time
  entityType: 'project.card'; // constant
  version: number;        // always 1 at create
  createdAt: string;      // ISO; matches Card.createdAt
}
```

#### `project:card-moved`
```ts
{
  id: string;             // card.id
  fromListId: string;     // pre-move listId
  toListId: string;       // post-move listId
  fromOrder: number;      // pre-move order
  toOrder: number;        // post-move clamped order
  version: number;        // bumped: target.version + 1
  updatedAt: string;      // ISO; matches the `movedAt` stamp
}
```

Emit gate: only when `dirty.length > 0`.

#### `project:card-updated`
```ts
{
  id: string;             // card.id
  listId: string;         // post-merge listId
  patchKeys: string[];    // top-level keys of caller's patch, sorted, dedup'd
  version: number;        // bumped: current.version + 1
  updatedAt: string;      // ISO; matches Card.updatedAt
}
```

`patchKeys` is computed from `Object.keys(patch).sort()` filtered to
known `Card` mutable fields (`title`, `description`, `labels`,
`dueDate`, `checklist`, `listId`, `order`). System-managed fields
(`createdAt`, `updatedAt`, `version`, `entityType`, `schemaVersion`,
`syncScope`, `id`) are excluded even if the caller passes them.

### Non-Tauri swallow

Each `emitEvent(...)` call uses `.catch(() => undefined)` to swallow
non-Tauri runtime rejections (e.g. unit tests, web preview). Mirrors
labels sibling.

### `updateChecklist` behaviour

`updateChecklist` calls `updateCard(cardId, { checklist })`. The emit
fires from `updateCard` with `patchKeys: ["checklist"]`. No additional
emit at the wrapper — keeps single-source-of-truth semantics.

---

## 5. Risks and Open Questions (post-discovery)

| Risk | Severity | Mitigation |
|---|---|---|
| Cards lack `projectId`; consumers needing project context must derive externally. | Medium | Documented in design.md as a known limit. Future row can add `projectId` to Card entity + event payloads together. |
| `moveCard` no-op emit guard depends on `dirty.length > 0`. If a future refactor changes the diff strategy, the guard could silently break. | Low | Add explicit test (AC-P-M3) for the no-op case; comment the guard in code. |
| `patchKeys` introduces a payload shape consumers must keep stable. Changes to the allow-list (e.g. adding a new mutable field) bump the contract. | Low | Document the allow-list in api.md as part of the contract; treat additions as additive (non-breaking). |
| `plugin-project`'s `package.json` uses `vitest` directly (not the borrowed `../core/node_modules/vitest/vitest.mjs` shim labels uses). The new test file needs jsdom — labels relies on hoisted jsdom via `@vitest-environment jsdom` directive. | Low | Build phase confirms `pnpm --filter @repo/plugin-project test` resolves jsdom (likely via workspace hoist from `plugin-organizer`'s devDeps). If not, add the directive plus an explicit dep — defer the dependency edit to the build phase if needed. |
| Plug-in is In-Dev (PLUGIN_MAP row 76); downstream consumers must still mock it. | Low | Not promoting in this row; W0.C handles promotion. |

### Open questions deferred to a future row

1. Should `project:card-deleted` be added? Not in current dev_log
   "Pending" line; defer.
2. Should `project:list-*` events be added (list create / rename /
   reorder)? Not in scope; defer.
3. Should `projectId` be added to `Card`? Requires entity-shape change;
   defer with cross-window contract revision.

---

## 6. External Research

No external research required. The change is purely internal: additive
EventMap entries + three emit call sites + co-located vitest. No new
libraries, no technology selection. `@repo/core/events` is Stable.

---

## 7. Implementation Outline

### Phase B1 — EventMap declaration + design/api/test doc updates

1. Append three additive `EventMap` entries to
   `packages/core/src/types/events.ts` after the `labels:deleted` block
   (line 143). Include JSDoc per-field comments mirroring the labels
   block.
2. Run `pnpm --filter @repo/core check-types`.

Exit gate:
- types.ts diff is strictly additive; no existing entries touched.
- `@repo/core` type-check passes.

### Phase B2 — `useProjectStore` emits + vitest

1. Import `emitEvent` from `@repo/core/events`.
2. In `createCard` (post-`save`, before `setCards`): emit
   `project:card-created` with full identity + position payload.
3. In `moveCard`: capture `fromListId = target.listId` and
   `fromOrder = target.order` before the re-normalization; after `dirty`
   is computed, emit `project:card-moved` only when `dirty.length > 0`,
   carrying source + target + bumped version + `movedAt`.
4. In `updateCard` (post-`save`, before `setCards`): compute
   `patchKeys` from `Object.keys(patch)` filtered to the allow-list
   (`title`, `description`, `labels`, `dueDate`, `checklist`, `listId`,
   `order`), sorted; emit `project:card-updated` with the merged
   identity + `patchKeys`.
5. Add `useProjectStore.test.tsx` co-located with the hook.

Test file mirrors labels sibling structure:
- `// @vitest-environment jsdom` directive at top.
- `vi.mock("@repo/core/events", () => ({ emitEvent: vi.fn(...),
  useEventListener: vi.fn() }))` factory.
- React 19 `act` + `createRoot` harness.
- In-memory adapters for `Project` + `Card`.
- AC-bucketed `describe` blocks (≥ 10 binary AC scenarios; see test.md
  for the full list).

Exit gate:
- `pnpm --filter @repo/core check-types` passes.
- `pnpm --filter @repo/plugin-project check-types` passes.
- `pnpm --filter @repo/plugin-project test` passes (all AC-P-* scenarios
  green).
- No edits outside the declared scope (events.ts + useProjectStore.tsx +
  useProjectStore.test.tsx).

---

## 8. Sources

- `docs/reviews/plugin-project/20260523-feature-brief.md`
- `packages/plugin-project/src/hooks/useProjectStore.tsx:1–272`
- `packages/plugin-project/src/types.ts:1–64`
- `packages/core/src/types/events.ts:106–143` (labels block — pattern source)
- `packages/plugin-labels/src/hooks/useLabelStore.tsx:120–202` (emit pattern)
- `packages/plugin-labels/src/hooks/useLabelStore.test.tsx:1–304` (test pattern)
- `docs/PLUGIN_MAP.md:76` (project plugin row — In-Dev)
