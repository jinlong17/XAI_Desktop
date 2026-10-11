# Board queued active-selection guard — author evidence

## Fixed product snapshot

Product commit `b353cbb` closes the queued active-selection race identified in
the `034ef46` re-review. A stale active id may still be corrected when its
Board source is valid and stable. At scheduling time, the Module captures the
owner, physical Board and active-selection keys, exact Board and active bytes,
rendered Board source, and correction target. The microtask repeats all of
those checks before writing.

A same-account replacement or deletion of the Board key, a changed active id,
an invalid source, or an owner/key change cancels the stale correction. This is
a narrow queued-write guard; it does not claim cross-tab atomicity.

## Verification

| Check | Result |
| --- | --- |
| Focused Module regression | 93/93 passed |
| `pnpm --filter @repo/plugin-web-board-workspaces test` | 26 files / 313 tests passed |
| `pnpm --filter @repo/plugin-web-board-workspaces typecheck` | passed |
| `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` | passed |
| Archived Chrome queue replay | 3/3 passed in `native-selection-queue-b353cbb.log` |

The package regression covers normal stable-source correction and the three
same-account layout-effect races: active-only replacement, valid Board-source
replacement, and Board-source removal. The Chrome runner archives `b353cbb`
and uses the reviewer-owned fixture unchanged. No reviewer assertion or log was
edited.

This evidence is limited to the queued correction. Board, REL-05, and release
acceptance remain under the independent review process.
