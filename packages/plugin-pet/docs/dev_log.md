# plugin-pet Dev Log

## 2026-05-20

Plan:
- Build pet entity and local mock state machine.
- Add avatar, bubble, panel, and AI reaction components.
- Support non-intrusive hidden mode.

Updates:
- Added `usePetStore`, `PetAvatar`, `PetBubble`, `PetPanel`, `PetAiReaction`, and personality config.
- 2026-05-20 Track D: added Pet state `DataAdapter`, `RepoAdapter`, `PetRepoProvider`, and localStorage fallback; passed `pnpm --filter @repo/plugin-pet check-types`.
