## Codex Post-fix Re-review

**Feature**: p1-alpha-core-data-validation
**Original verdict**: BLOCKED
**Fix commit(s)**: 0bc3afa
**Reviewer**: codex feature-review · gpt-5.4 high reasoning
**New verdict**: APPROVED

### Was the original P0 resolved?
- Original issue (paraphrased): `assertRepoRecord()` only required a dot instead of the documented `^[a-z]+\.[a-z_]+$`; `clipboard.item` rows were not runtime-enforced to stay `device-local`; organizer-layout migration accepted empty `filepath`; `insert_kek_from_bytes()` returned on wrong length without zeroizing the caller buffer and left a stack-local `[u8; 32]` copy unscrubbed.
- Evidence the fix resolves it: `ENTITY_TYPE_RE` now enforces the documented regex and throws on violations (`packages/core-data/src/repo-utils.ts:8-21`); `clipboard.item` now hard-fails unless `syncScope === "device-local"` (`packages/core-data/src/repo-utils.ts:37-44`); migration now rejects empty/missing `filepath` and unsupported kinds, increments `skipped`, and only persists validated records (`packages/core-data/src/organizer-layout-migration.ts:142-164`, `274-301`); the keychain bridge now zeroizes the wrong-length caller buffer before returning and wraps the stack-local copy in `Zeroizing` (`apps/desktop/src-tauri/src/crypto/keychain_handle.rs:86-105`). Targeted regression tests were added for each area (`packages/core-data/tests/entities.test.ts:166-200`, `packages/core-data/tests/organizer-layout-migration.test.ts:257-313`, `apps/desktop/src-tauri/src/crypto/keychain_handle.rs:147-162`).
- Was the resolution honest (no smuggled scope-cut or stub-only fix)? Yes. The invariants are enforced in production code, not deferred to docs/types, and the claimed verification commands exist and passed locally (`pnpm --filter @repo/core-data test`, `pnpm --filter @repo/core-data check-types`, `cargo test --features crypto keychain_handle::`, `cargo check --features crypto`).

### Remaining gaps (max 4 bullets, severity-tagged)
- [P2] The commit message says `OrganizerLayoutMigrationResult` only gains an “optional” field, but the exported interface makes `skipped` required (`packages/core-data/src/organizer-layout-migration.ts:75-92`). This is not a P0 and did not invalidate the fix.

### Regressions introduced (max 3 bullets)
- Added test warning: duplicate `skipped` key in one expectation object triggers a Vite/esbuild warning during `pnpm --filter @repo/core-data test` (`packages/core-data/tests/organizer-layout-migration.test.ts:94-103`).

### Next action
- If APPROVED: re-mark the manifest row to READY_TO_SHIP and move on.