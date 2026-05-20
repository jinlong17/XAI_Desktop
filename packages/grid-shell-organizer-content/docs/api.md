# grid-shell-organizer-content — API

## Production Contract

Production API was added in `packages/plugin-organizer/src/index.ts` and documented in `docs/contracts/plugin-organizer-public-api-v0.md`.

## Public Surface

```ts
export interface OrganizerGridContentProps {
  gridId: string;
  gridOpacity?: number;
  gridBlur?: boolean;
}

export function OrganizerGridContent(props: OrganizerGridContentProps): JSX.Element;
```

## Contract Checks

- `packages/plugin-organizer/src/index.ts` is the only Host import surface for Organizer content.
- Host does not import Organizer internal files.
- Grid event payloads must remain scoped by `gridId`.
- No event names changed in G1.2.
- No new Tauri command usage was added in G1.2.
