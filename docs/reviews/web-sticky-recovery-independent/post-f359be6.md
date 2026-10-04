# Sticky actual-host jsdom rerun at `f359be6` (CP-STICKY-01, batch 13)

**Verdict: PASS (independent rerun only).** The frozen actual-host oracle ran unchanged against an immutable `git archive` of the repaired product `f359be6`, and all 28 cases pass, as they did at `210abdf`.
- The 23 cases that failed at `2023526` still pass: H1 at host level for each of the five fields, the H7 Settings sidebar route and voluntary sign-out for each field, and the seven H7 navigation forms plus the `beforeunload` warning on `color`.
- The two fixture checks and PC1–PC3 still pass.
- No case went PASS → FAIL.

This oracle composes the production `ComposedSettings`, its `DepartureCoordinator` and `settingsDeparture` over `createBrowserRouter`. It therefore exercises the repaired coordinator directly: held route, Back/Forward POP and sign-out departures, Stay, and the coordinator dialog.

This receipt is independent verification only. It is **not acceptance**. It implements and fixes nothing and modifies no existing file. It closes no 312 item: `SET-12`, `REL-05`, `QA-01`, `QA-03`, `QA-04`, `QA-09` and D2/REL/AI stay open. The batch-13 overview is in `../web-sticky-recovery-f1/post-f359be6.md`.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol-role verifier for batch 13. It is distinct from the host-baseline author, the coordinator repair author, Terra and every earlier verifier |
| Requested / resolved revision | `f359be6` / `f359be6d838393e0f9e93efd80b88b5b09f6144e`, as logged in the header |
| Runner checkout | `518fa42053c0f65f745cb0e09d043b429c2b40b5`, recorded as `runner_checkout_head`. The worktree was clean before the run; its product tree equals `f359be6` |
| Product delta vs `210abdf` | `M apps/web/src/routes/modules/departureCoordinator.tsx`, `A apps/web/src/routes/modules/__tests__/departureCoordinator.blocker.test.tsx` |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for both `XAI_DEPS_ROOT` and `git show f359be6:pnpm-lock.yaml` |
| Runtime | Node `v24.16.0` (from the header), Vitest `v3.2.7`, jsdom |
| Iterations | One `post1` run; no environment failure, so no `post2` |

## Command

Run from the worktree root:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-independent/verify-fixed.mjs f359be6 host post1
```

Console summary: `host: exit=0  Test Files  1 passed (1) |       Tests  28 passed (28)`. Runner exit status 0.

## Frozen integrity (checked before the run)

Every recomputed SHA-256 equals the value in `before-2023526.md` ("Files and SHA-256") or `fixed-210abdf.md` ("New log"). `git log --name-status` over this directory shows only additions.

| File | SHA-256 | Result |
| --- | --- | --- |
| `host.test.tsx` (oracle) | `7a4d3ff0cb8c4b6087307c9c7369340a7acea4c00589e6375fa236fbb7f9e8f3` | OK |
| `verify-fixed.mjs` (runner) | `5a8ea1ddf40f47e5650e82656a174ef786403d418b1dd9f5a0553e0213da7260` | OK |
| `host-before1-2023526.log` | `12f882cc23df89675b51e6edb14f64360c844451c1f833b7b39aa4a8443b90c4` | OK |
| `host-fixed1-210abdf.log` | `21c0dc19e39be9c9d3f9507fed3fecc3220feeefcc813c311bccc213266878a7` | OK |

The `post1` header's `oracle_sha256 host.test.tsx=7a4d3ff0… verify-fixed.mjs=5a8ea1dd…` equals the table. The runner also re-checked the SHA-256 of the oracle copy inside the archive before running.

## New log

| Log | SHA-256 | Lines | `stderr` |
| --- | --- | --- | --- |
| `host-post1-f359be6.log` | `9f108542cc616587ba9f9059b6e2efe1211d7fcbbf567a6e04e409cd8e9d6443` | 52 | empty |
| `post-f359be6.md` | this receipt | — | — |

The header records `requested_revision=f359be6`, `resolved_commit=f359be6d838393e0f9e93efd80b88b5b09f6144e`, `runner_checkout_head=518fa420…`, both lockfile hashes (`df05f2dd…`), the oracle and runner hashes, `node=v24.16.0` and `exit=0`.

## Results: before1 (`2023526`) → fixed1 (`210abdf`) → post1 (`f359be6`)

Cases were paired by exact Vitest title. The title set is the same in all three logs: no duplicate, missing or new title.

| Group | Cases | before1 PASS/FAIL | fixed1 PASS/FAIL | post1 PASS/FAIL |
| --- | --- | --- | --- | --- |
| FIXTURE validity | 2 | 2/0 | 2/0 | 2/0 |
| Positive controls PC1–PC3 | 3 | 3/0 | 3/0 | 3/0 |
| F-a, latest choice after a denied write [H1 host], five fields | 5 | 0/5 | 5/0 | 5/0 |
| F-b, Settings sidebar departure [H7 route], five fields | 5 | 0/5 | 5/0 | 5/0 |
| F-c, voluntary sign-out [H7 sign-out], five fields | 5 | 0/5 | 5/0 | 5/0 |
| N-*, navigation forms and `beforeunload` on `color` [H7] | 8 | 0/8 | 8/0 | 8/0 |
| **Total** | **28** | **5/23 (exit 1)** | **28/0 (exit 0)** | **28/0 (exit 0)** |

- **fixed1 → post1:** 28 PASS → PASS, 0 PASS → FAIL.
- **before1 → post1:** 23 FAIL → PASS, 5 PASS → PASS.
- **Clean log.**
  - Zero `PRECONDITION:` lines.
  - No unhandled error or rejection, and no line containing `Error`.
  - The `---- stderr ----` section is empty, and stdout has no console blocks.
- **Cleanup.** No `xai-sticky-host-*` temporary directory remained.

## Limitations

- jsdom history, not a browser. Chrome evidence for the same paths is in `../web-sticky-recovery-native/post-f359be6.md`: h1, 40/40 runtime gates. The double-Back race check is in `../web-sticky-recovery-f1/post-f359be6.md`.
- Sign-out uses the direct `requestSettingsDeparture("sign-out")` preflight. Auth gates are not mounted.
- The other limitations of `before-2023526.md` and `fixed-210abdf.md` carry over unchanged.
