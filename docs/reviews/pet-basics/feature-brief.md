# G6-E5 Pet Basics Feature Brief

## Scope

Build a desktop pet scaffold:
- `PetEntity` with id, name, mood, energy, lastFed, and personality.
- Avatar, reminder bubble, and status panel.
- Local `usePetStore` with state machine: idle, remind, interact, rest.
- Non-intrusive hidden mode.
- Mock AI reminder generation for G7-E3.

## Non-goals

- No Lottie dependency.
- No real AI API.
- No cross-plugin event contract changes in Track A files.

## Cross-review fixes 2026-05-20

- `generateAiReminder` now short-circuits when state-machine rejects the `remind` transition (e.g. pet is resting), avoiding bubble/mood inconsistency.
