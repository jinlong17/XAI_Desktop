# G4-S9 Sequential Paste Queue Feature Brief

## Goal

Allow users to choose multiple clipboard entries and paste them sequentially with visible queue progress.

## Scope

- `usePasteQueue` hook for ordered queue state.
- `PasteQueue` component for selecting entries, starting, pausing, and manually pasting current item.
- Mock paste callback with automatic advancement.

## Out of Scope

- Real keyboard paste automation.
- App focus management.
- Native permissions.

## Validation

- `pnpm --filter @repo/plugin-clipboard check-types`
