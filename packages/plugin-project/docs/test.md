# Plugin Project Test Notes

## Current Gate

- `pnpm --filter @repo/plugin-project check-types`

## Manual Coverage

- Create a card in each list.
- Drag a card to another list.
- Open card detail and edit title/description.
- Add checklist items and toggle completion.
- Confirm labels and due dates render.

---

## Phase: W0.B card typed events emit (2026-05-23)

### Test gates

- `pnpm --filter @repo/core check-types`
- `pnpm --filter @repo/plugin-project check-types`
- `pnpm --filter @repo/plugin-project test`

### Test file

Co-located at
`packages/plugin-project/src/hooks/useProjectStore.test.tsx`, mirroring
the sibling `packages/plugin-labels/src/hooks/useLabelStore.test.tsx`
structure.

### Mock strategy

```ts
vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));
```

- Mock factory at file top to satisfy the static-mock hoist requirement.
- In-memory `DataAdapter<Project>` and `DataAdapter<Card>` modeled on
  the labels sibling's `makeMemAdapter`.
- React 19 `act` + `createRoot` harness; capture the store via a
  `<Capture />` child that calls `useProjectStore`.
- `// @vitest-environment jsdom` directive at top of file (matches
  labels sibling).

### Binary acceptance scenarios

All scenarios assert `emitEvent` call count + event name + payload
shape via `vi.mocked(emitEvent).mock.calls`.

#### Created (C)

| AC | Scenario |
|---|---|
| AC-P-C1 | `createCard` success → emits `project:card-created` exactly once with `{id, listId, title, order, entityType: 'project.card', version: 1, createdAt}`. `createdAt` round-trips through `new Date(...).toISOString()`. |
| AC-P-C2 | `createCard` with whitespace title (`"  Plan  "`) → emitted `payload.title === "Plan"`. |
| AC-P-C3 | `createCard` with empty title → throws `"Card title is required"`, `emitEvent` not called. |
| AC-P-C4 | `createCard` when adapter `save` rejects → rejection propagates, `emitEvent` not called. |

#### Moved (M)

| AC | Scenario |
|---|---|
| AC-P-M1 | `moveCard` to a different list → emits `project:card-moved` exactly once with `{id, fromListId, toListId, fromOrder, toOrder, version: prev+1, updatedAt}`. Source / target list values match pre/post state. |
| AC-P-M2 | `moveCard` within the same list to a new `order` → emits exactly once with `fromListId === toListId` and `fromOrder !== toOrder`. |
| AC-P-M3 | `moveCard` no-op (same list, same order, dirty array empty) → `emitEvent` not called. |
| AC-P-M4 | `moveCard` with stale `cardId` (target not found) → silent no-op, `emitEvent` not called. |

#### Updated (U)

| AC | Scenario |
|---|---|
| AC-P-U1 | `updateCard({ title: "Renamed" })` on a seeded card → emits `project:card-updated` exactly once with `patchKeys: ["title"]`, bumped `version`, ISO `updatedAt`. |
| AC-P-U2 | `updateCard({ labels: ["x"], dueDate: "2026-06-01" })` → emits once with `patchKeys: ["dueDate", "labels"]` (sorted). |
| AC-P-U3 | `updateCard` filters out non-allow-list keys: caller passes `{ title: "X", id: "ignored", createdAt: "ignored", schemaVersion: 1 }` → `patchKeys: ["title"]` (only the allow-list survivor). |
| AC-P-U4 | `updateChecklist(cardId, [...])` wrapper → emits one `project:card-updated` with `patchKeys: ["checklist"]` (single emit at the inner `updateCard` outlet, not double). |
| AC-P-U5 | `updateCard` with stale id (`current` not found) → silent no-op, `emitEvent` not called. |

#### General (G)

| AC | Scenario |
|---|---|
| AC-P-G1 | Two successive `createCard` calls → `emitEvent` called twice with distinct card ids. |
| AC-P-G2 | Provider re-render without any action call (two consecutive `root.render` calls on the same adapter) → `emitEvent` not called (emit is action-coupled, not effect-coupled). |
| AC-P-G3 | Non-Tauri runtime: `emitEvent` rejects with `new Error("not tauri")` (via `mockImplementation`) → `createCard` still resolves with the created card; no unhandled-rejection warning. |

Scenario total: **16** (≥ 10 binary AC scenarios required by brief
§1.12).

### Manual verification

Not required for this row (no UI / multi-window / Tauri / native change).
Optional sanity check after build: open desktop dev and observe Tauri
event log for `project:card-*` emissions when interacting with
BoardView.

### Mock strategy summary

| Layer | Approach |
|---|---|
| `@repo/core/events` | `vi.mock` with `emitEvent: vi.fn()` returning resolved promise; `useEventListener: vi.fn()` |
| `DataAdapter<Project>` / `DataAdapter<Card>` | In-memory `Map` per adapter; supports `save` rejection injection via `vi.fn` override |
| React | Real React 19 `createRoot` + `act` (no shallow render) |
| Crypto | Real `crypto.randomUUID` via jsdom |
| Tauri | None — `@repo/core/events` is mocked, so no Tauri context required |

