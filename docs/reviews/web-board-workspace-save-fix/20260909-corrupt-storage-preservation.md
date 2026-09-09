# Board workspace corrupt-storage preservation — author evidence

## Scope

Product commit `1053463` closes the two P1 implementation findings from the
independent Board workspace review without changing the review fixtures or
assertions. It changes only the workspace save-recovery hook and its focused
package tests.

The hook now distinguishes three storage states before a create, retry, normal
workspace pick, or workspace delete can write:

- **Absent**: the key is missing and the rendered stable state may use the
  existing default seed path.
- **Valid**: persisted workspaces must be a non-empty
  `isBoardWorkspaceArray` value matching the rendered state; persisted boards
  must be accepted by `readBoardStorage` and match the rendered state.
- **Corrupt**: a present `null`, empty array, schema-invalid value, parse
  failure, or invalid board storage is preserved verbatim and the action
  enters recovery instead of overwriting it.

This retains the existing deletion contract: a workspace may only be deleted
when it is non-final, has no valid board references, and no boards are moved
automatically.

## Verification

| Check | Result |
| --- | --- |
| Focused `WorkspaceSaveRecovery.test.tsx` | 6/6 passed |
| `pnpm --filter @repo/plugin-web-board-workspaces test` | 26 files / 305 tests passed |
| `pnpm --filter @repo/plugin-web-board-workspaces typecheck` | passed |
| `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` | passed |
| Existing author workspace-recovery assertions | 10/10 passed |

The focused tests cover schema-invalid workspaces on create and retry, present
JSON `null` and `[]`, a genuinely absent workspace key, invalid board storage
blocking delete and ordinary pick, and the valid-empty-workspace deletion
case.

## Fixed-snapshot native counterexamples

The unchanged reviewer scenario runner was replayed against the archived
product commit `1053463`. Its output is retained in
`native-astra-counterexamples-1053463.log`.

- Malformed workspace bytes remained byte-for-byte unchanged and create showed
  recovery.
- Malformed board membership left the workspace and board bytes unchanged and
  refused deletion.
- The run also records existing native recolor and delete retry checks as
  passing.

The reviewer-owned independent directory and assertions were not edited. This
is implementation evidence for the two storage-corruption findings; it does
not close the wider REL-05 Board release gate.
