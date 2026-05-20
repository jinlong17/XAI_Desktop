# Feature Brief — grid-persistence

| Field | Value |
|---|---|
| Feature | grid-persistence |
| Gate | G1 — native foundation |
| Source | docs/planning/execution/G1-native-foundation.md §G1.5 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Prepare the G1.5 Grid persistence feature so Grid rects, item placement, and open/last-active state can later move from `localStorage` to a repository-backed interface compatible with G2.

## Scope

- Audit current `localStorage` persistence in `plugin-organizer`.
- Identify the target repository boundary and migration blockers.
- Document recovery behavior for corrupt state and restart restore.
- Do not implement repository persistence while G1.1 and G2 are blocked.

## Non-goals

- No production persistence code changes.
- No repository interface changes.
- No SQLite/SQLCipher driver changes.
- No localStorage migration implementation.

## Acceptance

- Current persistence key/shape is documented.
- Target repository behavior and deferred tests are documented.
- Status remains BLOCKED by G1.1 and G2 repository direction.
- No production source files change.

## Tests

- `rg -n "PersistedLayout|localStorage|repository|Repository|Grid.*persist|restore|open Grid|last active|sqlite|sqlcipher|GridBox|DesktopItem" packages/plugin-organizer/src packages/core/src packages/core-data docs/contracts docs/planning/execution -g '*.{ts,tsx,rs,md}'`
- `test -f docs/reviews/grid-persistence/20260519-feature-brief.md`
- `test -f packages/grid-persistence/docs/dev_log.md`

## Contract Impact

Planning only. Later implementation must update `docs/contracts/data-repository-v0.md` or add an ADR if Grid repository methods extend the existing repository contract.
