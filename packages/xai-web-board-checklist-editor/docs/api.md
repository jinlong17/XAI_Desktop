# API Contract - xai-web-board-checklist-editor

## 1. Data Contract

Existing type:

```ts
interface BoardChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface BoardCard {
  checklistItems?: BoardChecklistItem[];
  checklist?: { done: number; total: number };
}
```

Rules:

- UI writes `checklistItems` only.
- `mergeBoardCardPatch(...)` derives `checklist` from `checklistItems`.
- When `checklistItems.length === 0`, `checklist` is removed.
- Existing cards with only legacy `checklist` are converted into generated
  detail rows for editing by `BoardCardDetailModal`.

## 2. UI Contract

`BoardCardDetailModal` checklist section supports:

- add item
- toggle done
- edit text
- remove item
- display derived progress summary

Stable test ids:

```text
card-detail-checklist-input
card-detail-checklist-add
card-detail-check-<itemId>
card-detail-check-text-<itemId>
card-detail-check-remove-<itemId>
```

## 3. Persistence Contract

All checklist writes use `onPatchCard({ checklistItems })`, which flows through:

```text
BoardCardDetailModal -> BoardWorkspacesModule.patchActiveCard
  -> updateCardInList -> mergeBoardCardPatch -> xai_boards_v2
```

No storage registry changes are required.
