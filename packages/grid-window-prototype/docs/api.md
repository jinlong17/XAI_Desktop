# grid-window-prototype — API / Contract Notes

## Runtime API

No new public API is added.

## Existing Command Used

The prototype uses the existing command:

```ts
invoke("create_grid_window", {
  gridId: "alpha",
  rect: { x: 80, y: 140, width: 320, height: 220 },
});
```

The command signature is unchanged.

## Spike Event

| Field | Value |
|---|---|
| Event name | `g0-grid-prototype:scoped-ping` |
| Transport | Tauri window event, targeted with `emitTo(windowLabel, ...)` |
| Scope | Spike-only, current Grid window label |
| Contract status | Not part of `@repo/core` EventMap |

Payload:

```ts
interface G0GridPrototypePing {
  gridId: string;
  windowLabel: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  count: number;
  sentAt: string;
}
```

## Contract Impact

| Contract | Impact |
|---|---|
| `docs/contracts/events-v0.md` | None |
| `docs/contracts/data-repository-v0.md` | None |
| `docs/contracts/tauri-commands-v0.md` | None |
| ADRs | None in G0.2 |

## Error Semantics

If window metadata cannot be read, the fallback panel displays `unknown` fields and logs the error to the current window console. The spike does not surface a user-facing error contract.

