## Codex Post-fix Re-review

**Feature**: p0-echo-bookmark-provenance
**Original verdict**: BLOCKED
**Fix commit(s)**: 520737c
**Reviewer**: codex feature-review · gpt-5.4 high reasoning
**New verdict**: BLOCKED

### Was the original P0 resolved?
- Original issue (paraphrased): `reveal_in_finder` / `open_path` accepted any allow-listed root path without proving it came from an actual user authorization event.
- Evidence the fix resolves it: the Rust side now does the right gate in isolation: both Finder commands call `ensure_path_authorized`, which runs `validate_user_path` and then `BookmarkRegistry` lookup (`apps/desktop/src-tauri/src/commands/finder.rs:131-157`, `apps/desktop/src-tauri/src/commands/finder.rs:186-193`). Bookmark registration itself is scoped to the mirrored allow-list and validates before insert (`apps/desktop/src-tauri/src/commands/bookmarks.rs:122-158`). The contract doc was restored to the strict provenance rule and the deferred caveat was removed (`docs/contracts/tauri-commands-v0.md:74-91`).
- Was the resolution honest (no smuggled scope-cut or stub-only fix)? No. The production JS wiring does not actually supply valid authorized paths to that registry. The only live `useFileDrop` call still omits `finderClient` entirely (`packages/plugin-organizer/src/OrganizerLayer.tsx:144-148`), and even if wired, the hook registers `file.name` values, not absolute paths (`packages/plugin-organizer/src/hooks/useFileDrop.ts:42-44`, `packages/plugin-organizer/src/hooks/useFileDrop.ts:136-175`), while `register_path_bookmark` requires an absolute path accepted by `validate_user_path` (`apps/desktop/src-tauri/src/commands/bookmarks.rs:124-136`, `apps/desktop/src-tauri/src/commands/finder.rs:79-115`). So the end-to-end contract is still false.

### Remaining gaps (max 4 bullets, severity-tagged)
- [P0] The registry population path is non-functional in production: `OrganizerLayer` does not pass a `finderClient`, so no bookmark registration occurs on user drop (`packages/plugin-organizer/src/OrganizerLayer.tsx:144-148`).
- [P0] The drop hook registers basenames, not absolute filesystem paths, so `register_path_bookmark` would reject them as non-absolute even if the client were passed (`packages/plugin-organizer/src/hooks/useFileDrop.ts:136-175`, `apps/desktop/src-tauri/src/commands/finder.rs:79-115`).
- [P1] The admit-path Rust test sidesteps the public authorization path by calling `insert_canonical` directly instead of exercising `register_path_bookmark` (`apps/desktop/src-tauri/src/commands/finder.rs:318-332`).
- [P2] Open-panel registration is still only a documented TODO, not implemented (`packages/plugin-organizer/src/hooks/useFileDrop.ts:30-31`, `packages/plugin-organizer/docs/dev_log.md:30`).

### Regressions introduced (max 3 bullets)
- Legitimate user drops in the current UI still cannot satisfy the new provenance gate, so subsequent reveal/open now fail with `E3004` instead of working for actual dropped items (`packages/plugin-organizer/src/OrganizerLayer.tsx:144-148`, `packages/plugin-organizer/src/hooks/useFileDrop.ts:171-175`).

### Next action
- Wire a real production `FinderClient` into `useFileDrop` from the organizer surface and prove the registration call is reached on actual user drop.
- Replace basename-based drop data with a real absolute-path source for desktop drops, then add one integration test that exercises `register_path_bookmark` -> `reveal/open` through the public path rather than `insert_canonical`.