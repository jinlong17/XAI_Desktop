# Tasks D1 remaining UI lifecycle repair — author evidence

Sol, product author; Web; 2026-09-09. The independent finding source is Astra commit `0143952`, which fixed the reviewed product at `3241529` and retained 12 PASS / 6 FAIL across 18 boundary assertions. The repair is fixed at `170c526`.

## Repair scope

- A detail session captures the original canonical task dataset and retains that baseline through quota failure and retry. A concurrent replacement or deletion now refuses the stale write while the local draft, detail panel, and recovery alert remain visible.
- Bulk delete captures its IDs and detail-session token. Completion removes only those IDs from the current selection and closes only the matching original detail session.
- List and tag deletion update references in both active and completed task collections before metadata deletion. Completed state and existing receipts remain intact.

Only `packages/xai-web-tasks/src/TasksModule.tsx` and its focused recovery test changed. Shared storage, Board, Calendar, AI subscribers, and Astra/root evidence were not modified.

## Fixed-revision verification

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d1-tasks.mjs 170c526 '' sol-after
pnpm --filter @repo/plugin-web-tasks typecheck
pnpm --filter @repo/plugin-web-tasks lint
```

| Evidence | Result |
| --- | --- |
| `author-after-parent8-170c526.log` | 8/8 PASS |
| `author-after-boundaries-170c526.log` | 18/18 PASS; the original six failures now pass unchanged |
| `author-after-package-170c526.log` | 19 files / 176 tests PASS |
| Typecheck and lint | PASS |

The three `author-reproduction-*-3241529.log` files retain the author's pre-fix reproduction: parent 8/8 PASS, Astra boundaries 12 PASS / 6 FAIL, and package 172/172 PASS. They are separate from Astra's original committed evidence.

## Remaining boundaries

This is author evidence for the four Tasks D1 defect groups only. It does not independently accept Tasks D1, native browser behavior, shared account-lifecycle coordination, Board/Calendar callers, D2, AI-02, deployment activation, or release readiness. Root and Astra own the fixed-revision native and non-author acceptance runs.
