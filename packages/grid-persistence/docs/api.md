# grid-persistence — API

## Planning Contract

No production API was changed in this slice.

## Candidate Repository Boundary

```ts
interface GridLayoutRepository {
  loadLayout(): Promise<PersistedLayout | null>;
  saveLayout(layout: PersistedLayout): Promise<void>;
  clearLayout(): Promise<void>;
  markActiveGrid(gridId: string): Promise<void>;
}
```

## Migration Candidate

```ts
interface LocalStorageLayoutMigration {
  sourceKey: "xai-desktop-layout";
  readOnly: true;
  importOnce(): Promise<"imported" | "empty" | "invalid" | "skipped">;
}
```

Final API must be reconciled with `docs/contracts/data-repository-v0.md`.
