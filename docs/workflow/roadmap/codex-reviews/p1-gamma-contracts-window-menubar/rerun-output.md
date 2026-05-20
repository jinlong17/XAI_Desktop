## Codex Post-fix Re-review

**Feature**: p1-gamma-contracts-window-menubar
**Original verdict**: BLOCKED
**Fix commit(s)**: 7e97dc3
**Reviewer**: codex feature-review · gpt-5.4 high reasoning
**New verdict**: APPROVED

### Was the original P0 resolved?
- Original issue (paraphrased): three contract claims were false: `data-repository-v0` still presented unfrozen entities as v0 surface; `organizer-layout-migration` claimed idempotency while reruns re-stamped `updatedAt`; `tauri-commands-v0` claimed runtime allow-list enforcement that `window.rs` and `menubar.rs` did not actually implement.
- Evidence the fix resolves it: the v0 entity table now stops at shipped entities and moves `productivity.pomodoro_session`, `widgets.widget`, and `account.device` into an explicit deferred section marked “not in v0” (`docs/contracts/data-repository-v0.md:36-56`). The migration now reads existing repo records, skips unchanged ones, reports them via `unchanged`, and avoids no-op `put`s that would re-stamp timestamps (`packages/core-data/src/organizer-layout-migration.ts:121-180`, `packages/core-data/src/organizer-layout-migration.ts:195-246`), with tests covering rerun convergence and `updatedAt` preservation (`packages/core-data/tests/organizer-layout-migration.test.ts:139-228`). Window lifecycle commands now enforce `WINDOW_ALLOWED_WINDOWS` at the IPC boundary (`apps/desktop/src-tauri/src/commands/window.rs:9-40`, `apps/desktop/src-tauri/src/commands/window.rs:106-115`, `apps/desktop/src-tauri/src/commands/window.rs:176-185`, `apps/desktop/src-tauri/src/commands/window.rs:234-293`), and `sync_set_menubar_status` now enforces `MENUBAR_ALLOWED_WINDOWS` (`apps/desktop/src-tauri/src/commands/menubar.rs:11-32`, `apps/desktop/src-tauri/src/commands/menubar.rs:84-90`). The contract doc was updated to match that runtime truth instead of overclaiming (`docs/contracts/tauri-commands-v0.md:53-68`, `docs/contracts/tauri-commands-v0.md:172-216`).
- Was the resolution honest (no smuggled scope-cut or stub-only fix)? Yes. The fix implements the missing runtime guards and explicitly narrows §7 to the command groups that truly have defence-in-depth checks, instead of silently deferring or leaving the old blanket claim in place.

### Remaining gaps (max 4 bullets, severity-tagged)
- [P2] §7 now correctly admits some host commands still rely on capability-file scope alone (`clipboard_*`, etc.), so broader runtime-hardening remains future work rather than a v0 guarantee (`docs/contracts/tauri-commands-v0.md:197-216`).

### Regressions introduced (max 3 bullets)
- `packages/core-data/tests/organizer-layout-migration.test.ts` now contains a duplicate `skipped` key in one expected object, which emits a Vite/esbuild warning during the test run, though it does not fail the suite (`packages/core-data/tests/organizer-layout-migration.test.ts:94-103`).

### Next action
- If APPROVED: re-mark the manifest row to READY_TO_SHIP and move on.