# API Contract - xai-web-board-storage-contract

> Board-core storage contract for `xai_boards_v2`.

## 0. Runtime Summary

The runtime remains local-first. This row adds typed helpers that can read,
migrate, preserve, and project the board storage shape without changing the
route or backend.

## 1. Constants

```ts
const BOARD_STORAGE_KEY = "xai_boards_v2";
const BOARD_STORAGE_SCHEMA_VERSION = 1;
const BOARD_STORAGE_ENVELOPE_KIND = "xai.web.board.storage";
const BOARD_STORAGE_ENTITY_SCHEMA_VERSION = 1;
```

## 2. Envelope

```ts
interface BoardStorageEnvelopeV1 {
  kind: typeof BOARD_STORAGE_ENVELOPE_KIND;
  schemaVersion: typeof BOARD_STORAGE_SCHEMA_VERSION;
  boards: Board[];
  migratedFrom: "legacy-array" | "v1-envelope";
  migratedAt?: string;
}
```

Rules:

- `boards` must pass `isBoardArray(...)`.
- only schema version `1` is accepted in this row.
- unsupported future versions must fail closed.

## 3. Read Contract

```ts
type BoardStorageReadResult =
  | {
      status: "valid";
      source: "legacy-array" | "v1-envelope";
      schemaVersion: 1;
      boards: Board[];
    }
  | {
      status: "invalid";
      source: "invalid";
      schemaVersion: null;
      boards: null;
      reason: string;
    };

function readBoardStorage(raw: unknown): BoardStorageReadResult;
```

`loadBoardsOrDefault(raw)` delegates to this helper and keeps current fallback
behavior.

## 4. Migration Contract

```ts
interface BoardStorageMigrationResult {
  status: "migrated" | "already-current" | "invalid";
  envelope: BoardStorageEnvelopeV1 | null;
  reason?: string;
}

function migrateBoardStorageRawToEnvelope(
  raw: unknown,
  options?: { migratedAt?: string },
): BoardStorageMigrationResult;
```

Rules:

- legacy valid `Board[]` -> `status: "migrated"`
- v1 envelope -> `status: "already-current"`
- invalid raw -> `status: "invalid"`
- helper is pure and never touches localStorage

## 5. Write Preservation

```ts
function createBoardStorageEnvelope(
  boards: readonly Board[],
  options?: { migratedAt?: string; migratedFrom?: "legacy-array" | "v1-envelope" },
): BoardStorageEnvelopeV1;

function preserveBoardStorageFormat(
  previousRaw: unknown,
  nextBoards: readonly Board[],
): Board[] | BoardStorageEnvelopeV1;
```

Rules:

- if `previousRaw` is a valid v1 envelope, the result is a v1 envelope
- otherwise the result is legacy `Board[]`
- result boards must be valid

## 6. Logical Entity Projection

```ts
type BoardStorageEntityType =
  | "project.board"
  | "project.list"
  | "project.card";

interface BoardStorageRecordBase {
  id: string;
  entityType: BoardStorageEntityType;
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  syncScope: "account-sync";
}

interface BoardStorageBoardEntity extends BoardStorageRecordBase {
  entityType: "project.board";
  workspaceId: string;
  title: string;
  listIds: string[];
  payload: Board;
}

interface BoardStorageListEntity extends BoardStorageRecordBase {
  entityType: "project.list";
  projectId: string;
  position: number;
  title: string;
  cardIds: string[];
  archived: boolean;
  payload: BoardList;
}

interface BoardStorageCardEntity extends BoardStorageRecordBase {
  entityType: "project.card";
  projectId: string;
  listId: string;
  position: number;
  title: string;
  labelIds: string[];
  memberIds: string[];
  archived: boolean;
  startDate?: string;
  dueDate?: string;
  payload: BoardCard;
}

function projectBoardStorageEntities(
  boards: readonly Board[],
  options: { now: string },
): {
  boards: BoardStorageBoardEntity[];
  lists: BoardStorageListEntity[];
  cards: BoardStorageCardEntity[];
  records: BoardStorageLogicalEntity[];
};
```

Rules:

- entity ids are namespaced from current ids:
  - board: `project.board:<board.id>`
  - list: `project.list:<board.id>:<list.id>`
  - card: `project.card:<board.id>:<list.id>:<card.id>`
- `records` order is boards, lists, cards in nested order.
- payloads are preserved for encrypted blob storage.

## 7. Compatibility

- No public UI changes.
- Existing localStorage data stays readable.
- Future rows may opt into writing envelopes or entity records after this helper
  contract is accepted.
