# window-command-contract — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Implement G1.1 window command contract under G0 Conditional Go for DMG/private path |
| Review Doc Path | docs/reviews/window-command-contract/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1 contract planning |

## Frozen Assumptions

- G1 requires G0 Go or Conditional Go; this prerequisite is now satisfied for DMG/private path.
- Existing contract target in `docs/contracts/tauri-commands-v0.md` is the planning baseline.
- MAS signed/sandbox runtime behavior remains deferred external and must not be mixed into G1.1.

## Target Contract Shape

```ts
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GridWindowSnapshot {
  gridId: string;
  label: `grid_${string}`;
  rect: Rect;
  visible: boolean;
}

interface CommandError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}
```

## Build Notes

- Rust remains the only Grid label generation authority via `grid_{gridId}`.
- `gridId` validation accepts ASCII letters, numbers, `-`, and `_`.
- `list_grid_windows` is state-backed and reports visibility from the native window when present.
- `focus_grid_window` focuses by `gridId` and returns the same snapshot shape.
