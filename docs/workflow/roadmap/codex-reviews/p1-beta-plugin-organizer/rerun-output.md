## Codex Post-fix Re-review

**Feature**: p1-beta-plugin-organizer
**Original verdict**: BLOCKED
**Fix commit(s)**: 1b34b54
**Reviewer**: codex feature-review · gpt-5.4 high reasoning
**New verdict**: APPROVED

### Was the original P0 resolved?
- Original issue (paraphrased): `repositoryLayoutStore.save()` was non-atomic; async hydrate could overwrite user-created state; URL items lost `url` metadata on round-trip; `inferKindFromPath()` treated Finder folders as files unless the path ended with `/`.
- Evidence the fix resolves it: save now wraps both grid and item upsert+cull passes in `Repo.transaction(...)` (`packages/plugin-organizer/src/layoutStore.ts:117`, `packages/plugin-organizer/src/layoutStore.ts:132`), with rollback coverage added (`packages/plugin-organizer/src/layoutStore.test.ts:213`). Hydrate now bails if `userTouched` flipped before load resolves, and every user-facing mutator marks that ref (`packages/plugin-organizer/src/useGridSystem.tsx:70`, `packages/plugin-organizer/src/useGridSystem.tsx:96`, `packages/plugin-organizer/src/useGridSystem.tsx:125`, `packages/plugin-organizer/src/useGridSystem.tsx:139`, `packages/plugin-organizer/src/useGridSystem.test.tsx:53`). URL round-trip is now symmetric by widening `DesktopItemType` and preserving `url` in both directions (`packages/plugin-organizer/src/types.ts:17`, `packages/plugin-organizer/src/layoutStore.ts:178`, `packages/plugin-organizer/src/layoutStore.ts:219`, `packages/plugin-organizer/src/layoutStore.test.ts:157`). Folder inference now recognizes extensionless basenames and supports explicit directory truth (`packages/plugin-organizer/src/gridItemFactory.ts:78`, `packages/plugin-organizer/src/gridItemFactory.test.ts:31`, `packages/plugin-organizer/src/gridItemFactory.test.ts:37`).
- Was the resolution honest (no smuggled scope-cut or stub-only fix)? Yes. The fixes land in production paths with regression tests, and the claimed commands exist (`packages/plugin-organizer/package.json:12`, `apps/desktop/package.json:6`) and passed locally: `pnpm --filter @repo/plugin-organizer test` (46/46), `pnpm --filter @repo/plugin-organizer check-types`, `pnpm --filter desktop build`.

### Remaining gaps (max 4 bullets, severity-tagged)
- [P2] `inferKindFromPath()` still falls back to a basename-without-dot heuristic when callers do not provide explicit FS truth, so extensionless regular files could now be labeled as folders; that is a follow-up quality issue, not the original P0 (`packages/plugin-organizer/src/gridItemFactory.ts:85`).

### Regressions introduced (max 3 bullets)
- No concrete regression found in the diff review or local verification pass.

### Next action
- If APPROVED: re-mark the manifest row to READY_TO_SHIP and move on.