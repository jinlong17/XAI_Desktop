# API Contract - xai-web-board-share-contract

## Mock Envelope

```ts
interface BoardShareEnvelope {
  schemaVersion: 1;
  mode: "mock";
  boardId: string;
  url: string;
  permission: "view";
  expiresAt: null;
  backend: "unimplemented";
}
```

Rules:

- `url` remains deterministic for the same board id.
- `permission` is fixed to `"view"` in this row.
- `expiresAt` is `null`; no expiry editing exists.
- `backend` explicitly states that no backend access grant exists.

## Event Payload

`web:board:share-requested` extends the existing payload:

```ts
{
  boardId: string;
  url: string;
  source: "header";
  mode: "mock";
  permission: "view";
  expiresAt: null;
  backend: "unimplemented";
}
```

Existing consumers remain compatible because the original fields are unchanged.

## Non-Contracts

- No persistent share record.
- No backend token issuance.
- No route-level share resolution.
