# window-command-contract — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; production implementation blocked by G0 |
| Review Doc Path | docs/reviews/window-command-contract/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1 contract planning |

## Frozen Assumptions

- G1 requires G0 Go or Conditional Go.
- Existing contract target in `docs/contracts/tauri-commands-v0.md` is the planning baseline.
- No production window command implementation should start until G0 evidence is reviewed.

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

