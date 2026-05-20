## Codex Post-fix Re-review

**Feature**: p0-foxtrot-native-dnd  
**Original verdict**: BLOCKED  
**Fix commit(s)**: a8c847b  
**Reviewer**: codex feature-review · gpt-5.4 high reasoning  
**New verdict**: REVISE

### Was the original P0 resolved?
- Original issue (paraphrased): the real Grid drop path never registered bookmarks, and the fallback HTML5 path only produced basenames, so `validate_user_path` would reject the would-be provenance.
- Evidence the fix resolves it: `GridWindow` now constructs and passes a real `FinderClient` into `OrganizerGridContent` (`apps/desktop/src/windows/GridWindow.tsx:18-25`, `86-91`); `OrganizerGridContent` listens to native `tauri://drag-drop`, extracts `payload.paths`, and calls `registerBookmark(path)` before emitting the cross-window drop event (`packages/plugin-organizer/src/OrganizerGridContent.tsx:302-355`, `376-384`); the Rust command validates absolute paths and inserts them into `BookmarkRegistry` (`apps/desktop/src-tauri/src/commands/bookmarks.rs:133-142`), and Finder actions still require that bookmark gate (`apps/desktop/src-tauri/src/commands/finder.rs:131-143`, `165-207`); the HTML5 hook is now explicitly visual-only and no longer tries to register basenames (`packages/plugin-organizer/src/hooks/useFileDrop.ts:16-44`, `60-76`, `158-180`). Defensive duplicate registration on the receiver is also present (`packages/plugin-organizer/src/OrganizerLayer.tsx:104-123`).
- Was the resolution honest (no smuggled scope-cut or stub-only fix)? On the production path, yes: the fix moved provenance to the only surface that actually receives absolute paths. The remaining problem is in test coverage, not runtime behavior.

### Remaining gaps (max 4 bullets, severity-tagged)
- [P2] The new Rust integration tests still do not drive `reveal_in_finder` or `open_path` through `get_ipc_response`; the mock app only registers bookmark commands, and the admit/reject checks call `ensure_path_authorized_test_helper` directly instead (`apps/desktop/src-tauri/src/commands/bookmarks.rs:325-331`, `351-367`, `377-405`, `445-460`). That closes the old `insert_canonical` shortcut, but it still partially sidesteps the public IPC contract this rerun asked for.

### Regressions introduced (max 3 bullets)
- No material regression found in the reviewed scope. G1.2 click-through behavior is preserved because the main window drag architecture was not changed, and the claimed JS/Rust test/build commands do exist and passed locally.

### Next action
- Add MockRuntime IPC coverage for `reveal_in_finder` and/or `open_path` via `get_ipc_response`, with one registered positive case and one unregistered negative case.
- Keep the platform shell-out mocked or factored behind the existing pre-shell authorization seam, but make the command entrypoint itself part of the exercised IPC path.