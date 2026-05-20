# native-dnd-path-first — API

## Planning Contract

No production API was changed in this slice.

## Target Payload

```ts
interface DroppedFile {
  path: string;
  name: string;
  kind: "file" | "folder" | "app" | "alias" | "unknown";
  size?: number;
  aliasInfo?: {
    rawPath: string;
    resolvedPath?: string;
  };
  securityScope?: "none" | "bookmark-required" | "bookmark-granted";
}
```

## Candidate Event

```ts
type OrganizerFileDropEvent = {
  "organizer:file:drop": {
    gridId: string;
    files: DroppedFile[];
  };
};
```

Final shape must be reconciled with `docs/contracts/events-v0.md`.
