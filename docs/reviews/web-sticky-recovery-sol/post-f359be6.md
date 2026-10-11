# Sticky recovery Sol reruns at `f359be6` (CP-STICKY-01, batch 13)

**Verdict: PASS (independent rerun only).** The frozen Sol oracles ran unchanged against an immutable `git archive` of the repaired product `f359be6`. All 109 Sol cases pass, and the archive's own ST1–ST10 pass 10/10. That is identical to the `fixed1` results at `210abdf`. No case went PASS → FAIL. The coordinator repair (`210abdf..f359be6`) did not affect these oracles.

This receipt is independent verification only. It is **not acceptance**. It implements and fixes nothing and modifies no existing file. It closes no 312 item: `SET-12`, `REL-05`, `QA-01`, `QA-03`, `QA-04`, `QA-09` and D2/REL/AI stay open. The batch-13 overview is in `../web-sticky-recovery-f1/post-f359be6.md`.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol-role verifier for batch 13, in an isolated worktree on a detached HEAD. It did not write the coordinator repair, the contract, these oracles or the implementation |
| Requested / resolved revision | `f359be6` / `f359be6d838393e0f9e93efd80b88b5b09f6144e`, as logged in every header |
| Runner checkout | Detached `518fa42053c0f65f745cb0e09d043b429c2b40b5`. The worktree was clean before the runs, and its product tree equals `f359be6` |
| Product delta vs `210abdf` | Only `apps/web/src/routes/modules/departureCoordinator.tsx` (modified) and its new test `__tests__/departureCoordinator.blocker.test.tsx` |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for both `XAI_DEPS_ROOT` and `git show f359be6:pnpm-lock.yaml` |
| Runtime | Node `v24.16.0`, Vitest `v3.2.7`, jsdom |
| Iterations | Each mode ran exactly once with suffix `post1`; no environment failure, so no `post2` |

## Commands

Run from the worktree root:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs f359be6 bytes post1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs f359be6 fields post1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs f359be6 queues post1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs f359be6 continuity-export post1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs f359be6 original post1
```

Console summaries; the runner exit status was 0 each time:

```text
bytes: exit=0  Test Files  1 passed (1) |       Tests  13 passed (13)
fields: exit=0  Test Files  1 passed (1) |       Tests  47 passed (47)
queues: exit=0  Test Files  1 passed (1) |       Tests  27 passed (27)
continuity-export: exit=0  Test Files  1 passed (1) |       Tests  22 passed (22)
original: exit=0  Test Files  1 passed (1) |       Tests  10 passed (10)
```

## Frozen integrity (checked before any run)

Every recomputed SHA-256 equals the value in `README.md` ("Files and SHA-256") or `fixed-210abdf.md` ("New logs"). `git log --name-status` over this directory shows only additions.

| File | SHA-256 | Result |
| --- | --- | --- |
| `fixture.tsx` | `8cc5993a08b4ccee7ff557601d2fe9085cd7f6e041940d5eeba64b3b62e390ca` | OK |
| `bytes.test.tsx` | `3774dfa9703578ae22fed8d862441481226b0bf28c704cab0cc20672dfdf5da9` | OK |
| `fields.test.tsx` | `2bf42fb6ddbe83bf54c574926fc8a7272bb6cdf073c746efea93012bbbd401bb` | OK |
| `queues.test.tsx` | `258aec9e5247f7c75c8a5b997683c7b5aa58c8a8b98117dc86df9ffa975c4983` | OK |
| `continuity-export.test.tsx` | `78f140f50306b91ff22eb116bc587ce30b2cac57390dcefc948e1f3e44ce828d` | OK |
| `verify-fixed.mjs` | `3fba4b3b181d13431db9fe632fd68b70a4e51c6357168ec29aa89dd7977864c3` | OK |
| `{bytes, fields, queues, continuity-export, original}-before1-2023526.log` | `1feda5e5…`, `a5c0efaa…`, `cdaded16…`, `35362e6f…`, `1a2265bc…` | OK |
| `{bytes, fields, queues, continuity-export, original}-fixed1-210abdf.log` | `a1cb353a…`, `56498c90…`, `ee6d205a…`, `979ee23e…`, `580030e7…` | OK |

Every `post1` header carries the `oracle_sha256` line `fixture.tsx=8cc5993a… … verify-fixed.mjs=3fba4b3b…`, identical to the `fixed1` headers. The logs were therefore produced by exactly these files.

## New logs

| Log | SHA-256 | Lines | `stderr` |
| --- | --- | --- | --- |
| `bytes-post1-f359be6.log` | `422d61b3bbe2a86b11cbfb94947c0d13560f26b99d5a8ed9754ffbde39c2dffe` | 35 | empty |
| `fields-post1-f359be6.log` | `75cfd385b7ec452ab169fab2bfa6be82444a14495116a89301b137c2efddec89` | 69 | empty |
| `queues-post1-f359be6.log` | `4b378cc5df7a49996abf2c27bc2b147430081b0f7d9ce62cbf8a5f98e8a505f0` | 49 | empty |
| `continuity-export-post1-f359be6.log` | `850af870007d4712c63293e753fac872b4ac12d5dc3ae61f9dfd85331f94a96c` | 44 | empty |
| `original-post1-f359be6.log` | `743ae8d842060e1ebf65de044ae4c2d8452fc10df12490e12785dba053c7b0db` | 32 | empty |
| `post-f359be6.md` | this receipt | — | — |

Each header records `requested_revision=f359be6`, `resolved_commit=f359be6d838393e0f9e93efd80b88b5b09f6144e`, the mode and suffix, both lockfile hashes (`df05f2dd…`), the oracle hashes and `exit=0`.

## Results: before1 (`2023526`) → fixed1 (`210abdf`) → post1 (`f359be6`)

Cases were paired by exact Vitest title. Every mode has the same title set in all three logs: no duplicate, missing or new title.

| Mode | before1 P/F/T | fixed1 P/F/T | post1 P/F/T | fixed1 → post1 | before1 → post1 | `PRECONDITION:` (post1) |
| --- | --- | --- | --- | --- | --- | --- |
| `bytes` | 13/0/13 | 13/0/13 | 13/0/13 | 13 PASS→PASS | 13 PASS→PASS | 0 |
| `fields` | 0/47/47 | 47/0/47 | 47/0/47 | 47 PASS→PASS | 47 FAIL→PASS | 0 |
| `queues` | 0/27/27 | 27/0/27 | 27/0/27 | 27 PASS→PASS | 27 FAIL→PASS | 0 |
| `continuity-export` | 3/19/22 | 22/0/22 | 22/0/22 | 22 PASS→PASS | 19 FAIL→PASS, 3 PASS→PASS | 0 |
| **Sol total** | **16/93/109** | **109/0/109** | **109/0/109** | **109 PASS→PASS** | **93 FAIL→PASS, 16 PASS→PASS** | **0** |
| `original` (ST1–ST10) | 10/0/10 | 10/0/10 | 10/0/10 | 10 PASS→PASS | 10 PASS→PASS | 0 |

- **Non-passing cases at `f359be6`:** none, and no case newly fails.
- **Clean logs.**
  - Zero `PRECONDITION:` lines, so every guarded fault was armed and observed before the business assertions ran.
  - No line contains `Error`, `Unhandled` or a console block.
  - Every `---- stderr ----` section is empty, and Vitest exited 0.
- **Cleanup.** The runner's temporary `xai-sticky-sol-*` directories were deleted (none remained).

## Limitations

- jsdom, not a browser. These oracles mostly exercise the pane, hook and engine, not the repaired coordinator. Chrome host and coordinator behaviour are covered by `../web-sticky-recovery-native/post-f359be6.md` and `../web-sticky-recovery-f1/post-f359be6.md`.
- The `original` mode runs the archive's own `packages/plugin-web-settings-rest/src/__tests__/stickyPane.test.tsx`. It is unchanged since `210abdf`; the only new product test in `f359be6` is the coordinator's, and these modes do not run it.
- The other limitations of `README.md` and `fixed-210abdf.md` carry over unchanged.
