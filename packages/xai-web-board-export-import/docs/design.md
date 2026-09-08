# Design - xai-web-board-export-import

## Selected Model

Board export/import is a board-core data contract, not a UI row:

```text
xai_boards_v2 raw value
  -> readBoardStorage()
  -> BoardExportPayloadV1
  -> projectBoardStorageEntities()
  -> future export/import UI or encrypted bundle adapter
```

## User Behavior

No user-facing control is added in this row. The visible impact is future-proofing:
when an export/import surface is added later, it can include Board logical
entities without duplicating Board schema logic.

## Data Rules

- Export reads one raw `xai_boards_v2` value.
- Valid legacy arrays are exported as an envelope-backed payload.
- Valid v1 envelopes are exported without losing envelope metadata.
- Logical entities use the existing `project.board`, `project.list`, and
  `project.card` records from board-core.
- Import accepts only the v1 payload kind and schema version.
- Import returns a `BoardStorageValue` suitable for writing to `xai_boards_v2`.

## Delete Coverage

Account delete remains owned by `plugin-web-settings-rest`. This row adds
regression proof that Board keys are present in `PREF_REGISTRY` and therefore
included in the existing no-wildcard wipe loop.

## Ownership

- `plugin-web-board-core` owns Board export/import payload helpers.
- `plugin-web-storage` remains the generic registry and localStorage helper.
- `plugin-web-settings-rest` owns account-delete orchestration and wipe tests.

## Future Work

- Add `/app/settings/integrations` or account-level export/import controls.
- Wrap Board payloads into the encrypted export envelope.
- Add import merge/replace confirmation UX.
- Add backend sync snapshot export once sync records exist.
