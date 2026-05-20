# Plugin Project API

## Public Surface

- `ProjectStoreProvider`
- `useProjectStore`
- `BoardView`
- `CardDetail`
- `LocalStorageAdapter`

## Entities

- `Project`
- `ProjectList`
- `Card`
- `ChecklistItem`

## Persistence

The store accepts `projectAdapter` and `cardAdapter`, both defaulting to package-local `LocalStorageAdapter`.
