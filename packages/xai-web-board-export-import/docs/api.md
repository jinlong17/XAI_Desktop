# API Contract - xai-web-board-export-import

## Board Export Payload

```ts
interface BoardExportPayloadV1 {
  kind: "xai.web.board.export";
  schemaVersion: 1;
  exportedAt: string;
  storageKey: "xai_boards_v2";
  storageSource: "legacy-array" | "v1-envelope";
  storageValue: BoardStorageValue;
  boards: Board[];
  logicalEntities: BoardStorageLogicalEntities;
}
```

## Helper Surface

```ts
function createBoardExportPayload(
  raw: unknown,
  options: { exportedAt?: string },
): BoardExportPayloadResult;

function readBoardExportPayload(raw: unknown): BoardExportPayloadReadResult;

function boardImportStorageValueFromPayload(
  raw: unknown,
): BoardImportStorageValueResult;
```

Rules:

- `createBoardExportPayload` returns `status: "invalid"` for malformed or empty
  Board storage.
- `readBoardExportPayload` validates payload kind, schema version, storage key,
  Board schema, storage value, and logical entity object shape.
- `boardImportStorageValueFromPayload` returns a validated `BoardStorageValue`
  that can be written to `xai_boards_v2`.
- The helpers never touch `localStorage` directly.

## Non-Contracts

- No encrypted envelope.
- No file download/upload.
- No backend import/export API.
- No merge strategy.
