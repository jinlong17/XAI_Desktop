# grid-shell-organizer-content — API

## Planning Contract

No production API was added in this slice.

## Candidate Public Surface

```ts
export interface OrganizerGridContentProps {
  gridId: string;
}

export function OrganizerGridContent(props: OrganizerGridContentProps): JSX.Element;
```

## Later Contract Checks

- `packages/plugin-organizer/src/index.ts` should be the only Host import surface for Organizer content.
- Host should not import Organizer internal files.
- Grid event payloads must remain scoped by `gridId`.
- Any new event names must update `docs/contracts/events-v0.md`.
- Any new Tauri command usage must update `docs/contracts/tauri-commands-v0.md`.
