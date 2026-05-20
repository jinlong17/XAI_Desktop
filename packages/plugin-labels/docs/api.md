# Plugin Labels API

## Entity

```ts
interface Label {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}
```

## Public Surface

- `LabelStoreProvider`
- `useLabelStore`
- `LabelPicker`
- `LabelBadge`
- `LocalStorageAdapter`
- Local types from `src/types.ts`
