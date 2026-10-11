# REL05 BoardCreator ordered persistence

Web scope. Product `885a111`, before `407259d`. Author verification; independent acceptance pending. No whole-Board or whole-REL05 closure.

## Caller inventory and bounded selection

| Entry | Before behavior | This batch |
| --- | --- | --- |
| BoardCreator → createBoard | ignored canonical setter, selected new id anyway, closed editor | Fixed |
| createBoard → activeBoardId | second key could fail after board existed; no partial result | Fixed |
| BoardSwitcher workspace composer → createWorkspace/writeWorkspaces | ignored result, cleared name and closed composer | Still open, next separate entry |
| BoardSwitcher onPick | ignored active id setter, closed switcher | Still open |
| rename/recolor/delete workspace and board deletion | other multi-operation flows | Not claimed fixed |
| Task link durable command | already separately verified | Unchanged |

## Before

Pinned native Storage quota: editorRetained=false, errorVisible=false, original board bytes unchanged, but **activeAttempts=2** (attempt to select nonexistent new id, then corrective selection). The correct business assertion exits 1. This demonstrates the actual false-success path, not merely a grep finding.

## Fix

A package-local create controller captures account owner and raw baseline. Failed canonical creation retains latest creator name/template/workspace and export; it never invokes the active-id write. On retry the proposal retains its id and original baseline, while latest editor values are used. Changed raw/owner are rejected.

After canonical success, the controller remembers committed id. If active selection fails, UI explicitly says the board was created but opening failed; controls freeze and Retry opening only selects the original board after verifying it still exists. It does not re-create or overwrite that board. Cancel/reload keeps the already-created board, discoverable in the switcher. This is ordered persistence, not a cross-key transaction.

JSON export includes latest form, stored bytes, and committedBoardId where applicable; old-account export fails visibly. Recovery buttons are 44px minimum. Public optional Creator props preserve existing callers.

## Verification

- Full Board package: **23 files / 292 tests PASS**; original TASK02 link tests remain passing and unchanged.
- typecheck + lint: exit 0.
- Fixed native: **5 groups PASS**, actual Module/Creator and native Storage with temporary synthetic accounts:
  1. Original failure corrected: editor/error retained, bytes unchanged, activeAttempts=0.
  2. Actual Chrome JSON download contains latest name and original bytes; retry creates exactly one board.
  3. Active-key failure after canonical success is explicitly partial; retry opens the same id, keeps canonical bytes unchanged and one board only.
  4. External newer raw survives obsolete retry.
  5. A→B old retry/export changes neither account and creates no download.
- Component regression additionally spies the partial retry and asserts **zero canonical writes** while selecting the committed id.

Commands:

```sh
node docs/reviews/web-board-create-recovery/verify-native.mjs
BOARD_VERIFY_COMMIT=885a111 node docs/reviews/web-board-create-recovery/verify-native.mjs
pnpm --filter @repo/plugin-web-board-workspaces test
```

First native command deliberately exits 1. Both native runs pin all product/@repo imports to Git archive; third-party deps are installed local libraries. Initial fixture build needed explicit PNG/SVG loaders for Leaflet imports; adding asset loaders changed no business oracle.

## Boundaries

Native uses actual DOM click/input handlers, native Storage and real file download, not human-pointer or production deployment certification. No global Storage replacement, network accounts, source test deletion, or assertion weakening. Baseline checking is synchronous, not cross-tab atomicity. Failed uncommitted drafts are not durable through browser reload; manual export is provided. The separate workspace/ordinary-switcher failures in the inventory remain open.
