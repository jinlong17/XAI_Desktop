# Codex Fix Brief — plugin-project

> Codex agent — cold start. **Touch only `packages/plugin-project/`.** Read this brief then the review file first.

## Working context

- **Working dir**: `/tmp/codex-fix-plugin-project` (worktree)
- **Branch**: `codex/track-b-fix-project`
- **Full review**: `docs/reviews/track-b-cross-review/claude-review.md` → "Plugin: plugin-project"

## Scope

- `packages/plugin-project/src/**`
- `packages/plugin-project/docs/dev_log.md`

## DO NOT TOUCH

- Other `packages/plugin-*/`
- `apps/`, `packages/core/`, `packages/core-data/`, `packages/ui/`

## Issues to fix

### P0 — `ProjectStoreProvider` adapter default-arg loop ×2

**File**: `packages/plugin-project/src/hooks/useProjectStore.tsx:93-97`

Two adapters (`projectAdapter` and `cardAdapter`) both use destructured-default `new LocalStorageAdapter(...)`. Apply the lazy-init pattern to **both**:
```tsx
export function ProjectStoreProvider({ projectAdapter, cardAdapter, children }: ProjectStoreProviderProps) {
  const [defaultProjectAdapter] = useState(
    () => new LocalStorageAdapter<Project>(PROJECT_STORAGE_KEY, seedProjects),
  );
  const [defaultCardAdapter] = useState(
    () => new LocalStorageAdapter<Card>(CARD_STORAGE_KEY, seedCards),
  );
  const stableProjectAdapter = projectAdapter ?? defaultProjectAdapter;
  const stableCardAdapter = cardAdapter ?? defaultCardAdapter;
  // refresh / createProject / createCard / updateCard / moveCard / etc.
  // all use stableProjectAdapter / stableCardAdapter, with both in deps
```

### P1.1 — `moveCard` re-saves all cards on every drag

**File**: `packages/plugin-project/src/hooks/useProjectStore.tsx:167-183`

**Issue**: each drop triggers `Promise.all(nextCards.map((card) => cardAdapter.save(card)))` — O(N) writes per move.

**Fix**: only persist cards whose `order` or `listId` actually changed.

```tsx
const moveCard = useCallback(
  async (cardId: string, listId: string, order = 0) => {
    const target = cards.find((card) => card.id === cardId);
    if (!target) return;

    const withoutTarget = cards.filter((card) => card.id !== cardId);
    const targetList = withoutTarget
      .filter((card) => card.listId === listId)
      .sort((a, b) => a.order - b.order);
    const clampedOrder = Math.min(Math.max(order, 0), targetList.length);
    targetList.splice(clampedOrder, 0, { ...target, listId, order: clampedOrder });
    const normalizedTargetList = targetList.map((card, index) => ({ ...card, order: index }));
    const sourceList = target.listId === listId ? [] : normalizeCardOrder(withoutTarget, target.listId);

    // Compute diff: only cards whose listId or order differs from their current value.
    const currentById = new Map(cards.map((c) => [c.id, c] as const));
    const merged = [...normalizedTargetList, ...sourceList];
    const dirty = merged.filter((card) => {
      const before = currentById.get(card.id);
      return !before || before.listId !== card.listId || before.order !== card.order;
    });

    await Promise.all(dirty.map((card) => stableCardAdapter.save(card)));

    // Update local state with full merged set
    const unaffected = withoutTarget.filter((card) => card.listId !== listId && card.listId !== target.listId);
    setCards([...unaffected, ...sourceList, ...normalizedTargetList]);
  },
  [cards, stableCardAdapter],
);
```

In the common case (drop into a different list at the end), this writes ~2-3 cards instead of N.

### P1.2 — `CardDetail` writes on every keystroke

**File**: `packages/plugin-project/src/components/CardDetail.tsx:29, 35`

**Issue**: title and description `onChange` call `updateCard` per keystroke → 1 localStorage write per char.

**Fix**: use uncontrolled "draft + commit on blur" pattern:
```tsx
import { useEffect, useState } from "react";

export function CardDetail({ card }: CardDetailProps) {
  const { updateCard, updateChecklist } = useProjectStore();
  const [titleDraft, setTitleDraft] = useState(card.title);
  const [descDraft, setDescDraft] = useState(card.description ?? "");

  // Sync external card changes back into drafts (e.g., when user opens a different card)
  useEffect(() => { setTitleDraft(card.title); }, [card.id, card.title]);
  useEffect(() => { setDescDraft(card.description ?? ""); }, [card.id, card.description]);

  return (
    <section ...>
      <input
        aria-label="Card title"
        onBlur={() => {
          const next = titleDraft.trim();
          if (next && next !== card.title) void updateCard(card.id, { title: next });
        }}
        onChange={(e) => setTitleDraft(e.target.value)}
        ...
        value={titleDraft}
      />
      <textarea
        aria-label="Card description"
        onBlur={() => {
          if (descDraft !== (card.description ?? "")) void updateCard(card.id, { description: descDraft });
        }}
        onChange={(e) => setDescDraft(e.target.value)}
        ...
        value={descDraft}
      />
```

### P1.3 — Add `createdAt` / `updatedAt` to Project and Card

**File**: `packages/plugin-project/src/types.ts`

```ts
export interface Project {
  id: string;
  name: string;
  lists: ProjectList[];
  labels: string[];
  createdAt: string;   // ADD
  updatedAt: string;   // ADD
}

export interface Card {
  // existing...
  createdAt: string;   // ADD
  updatedAt: string;   // ADD
}
```

Update sites:
- `useProjectStore.tsx` `createProject`: `createdAt: now, updatedAt: now`.
- `useProjectStore.tsx` `createCard`: same.
- `updateCard`, `moveCard`, `updateChecklist`: bump `updatedAt: new Date().toISOString()` on save.
- `seedProjects`, `seedCards`: backfill (use `"2026-05-20T00:00:00.000Z"`).

### P1.4 — Drop-zone always inserts at end

**File**: `packages/plugin-project/src/components/BoardView.tsx:67-71`

Today: `onDrop={(event) => moveCard(cardId, list.id, cards.length)}` — drop always lands at end.

**Fix**: allow drop ON a `CardTile` to insert above that tile. Add an `onDrop` handler to `CardTile`:
```tsx
function CardTile({ card, onOpen, onDropAbove }: { card: Card; onOpen: (card: Card) => void; onDropAbove: (draggedId: string, beforeCard: Card) => void }) {
  return (
    <article
      draggable
      onClick={() => onOpen(card)}
      onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.stopPropagation();
        const draggedId = event.dataTransfer.getData("text/plain");
        if (draggedId && draggedId !== card.id) onDropAbove(draggedId, card);
      }}
      ...
```

Then in `BoardView`:
```tsx
<CardTile
  card={card}
  key={card.id}
  onDropAbove={(draggedId, beforeCard) => void moveCard(draggedId, list.id, beforeCard.order)}
  onOpen={(c) => setSelectedCardId(c.id)}
/>
```

Keep the list-level drop as the "append to end" fallback.

### P2.1 — Memoize sorted lists in `BoardView`

**File**: `packages/plugin-project/src/components/BoardView.tsx:59-61`

`activeProject.lists.slice().sort(...)` runs on every render. Wrap in `useMemo` keyed on `activeProject.lists`.

### P2.2 — Use shared `createId` helper for `ChecklistItem.id`

**File**: `packages/plugin-project/src/components/CardDetail.tsx:17`

Today: `check-${Date.now()}-${Math.random()...}`. Lift the `createId` helper from `useProjectStore.tsx` into a small `src/utils/id.ts` and import it into both files. (Or copy the function — but exporting from `useProjectStore.tsx` is fine too as long as it's not exposed in `index.ts`.)

### P2.3 — Document event-emit gaps

`docs/dev_log.md`: `Pending: emit project:card-created / card-moved / card-updated via @repo/core/events.`

## Acceptance criteria

1. `pnpm --filter @repo/plugin-project check-types` → **PASS**
2. `git diff --stat` only `packages/plugin-project/**`.
3. Drag a card from "Active" to "Done" on the seed board → only the dragged card's localStorage entry is rewritten (verify with `localStorage.getItem("xai.plugin-project.cards")` before/after — only `card-console-shell` should have moved listId).
4. Typing in CardDetail title field → no localStorage write until blur.
5. `index.ts` public surface unchanged.

## Commit plan

```
fix(plugin-project): stop ProjectStoreProvider adapter default-arg loop (both adapters)
perf(plugin-project): only persist moved cards in moveCard
perf(plugin-project): commit CardDetail edits on blur instead of every keystroke
feat(plugin-project): drop card above another to insert at position
feat(plugin-project): add createdAt/updatedAt to Project and Card
chore(plugin-project): memoize BoardView list sort, share createId helper, document event-emit gap
```

## After commits

`docs/dev_log.md`:
- Status: `READY_FOR_VERIFY`
- Suggested Next: `Cross-review verification (claude-review-fix-pass)`
- Work Log per commit.

**Do not push.**
