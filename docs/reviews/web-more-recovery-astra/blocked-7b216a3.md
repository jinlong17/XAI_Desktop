# More recovery caller — independent Astra final review

Date: 2026-09-18. Module: `web`. **Verdict: BLOCKED (required evidence incomplete).**

This review does not establish a new product failure. It rejects the controller's claim that the complete contract now lacks only final acceptance: two mandatory evidence boundaries remain unproved. No product, test, runner, prior evidence, formal ledger, workflow, deployment or release file was changed, and no subagents were used.

## Fixed source and evidence boundary

- Contract: [`next-more-contract.md`](../web-notifications-recovery-astra/next-more-contract.md), especially lines 88, 94 and the six gate rows.
- Before product: `afbfb24d6f7311366b77852eda927d08467478c2`.
- Fixed product: `7b216a3d5a4947d0f66da042fb275302737fb762`.
- Evidence/controller snapshot: `7b9ef870433f226a520f2f6f194f08763aeff528`. This isolated worktree began clean at that detached HEAD. A fresh fetch of `origin/codex/web/full-product-audit-20260908` resolved to the same commit.
- The fixed/current More source blob is identically `cfe10f55f835343a9ffce936af9fd28728ab2c4f`. I read the production pane, its typed set/reset draft projection, exact-request settlement, predecessor retry handling, mount-captured reset scope, memory export, guard registration and scoped stylesheet delta.
- `git diff --name-only afbfb24 7b216a3 -- apps packages package.json pnpm-lock.yaml` contains exactly More's pane, stylesheet and product test file. Shared storage/hook/engine/registry/ownership, Notifications, DateTime, host/coordinator/auth and dependency manifests/lockfile have no delta. The 13 device / 2 account ownership declarations and registry defaults agree with the caller and contract.
- `7b216a3..7b9ef87` changes only three Calendar/Meditation test-support files under `apps`/`packages`; no production delta. The controller's `2023526` repository baseline is therefore distinguishable from the fixed More product SHA. Earlier reports' pending-next-step statements are historical, not fresh failures.

I reconciled the Sol review and all five final oracles/fixtures, authoritative before/final logs, the independent host directory, N1–N4 reports and native harness/runner, final regression receipt/runner/logs, and the control plane. All 23 listed evidence SHA-256 values matched their files: 17 final-regression, one independent host and five native logs. Before counts are 5 pass / 74 fail for Sol and 1 pass / 10 fail for the frozen host baseline; final counts are 79/79 and 11/11. Preliminary diagnostic runs are not added to those totals. The original product cases retain MP1–MP10 and both REL-03 assertions, with async/valid-fixture adjustments and three separately attributed additions.

## Six contract gates

| Gate | Verdict | Independent assessment |
| --- | --- | --- |
| All15 ordinary fields | PASS within caller boundary | Fields 22/22 plus source inspection cover all domains, defaults, exact codec/owner bytes, absent zero-write, invalid-source Reload, representative unavailable sources, six boolean latest-choice paths, malformed select errors and isolated recovery. N1 supplies real Chrome trusted edits and new-document persistence. Equivalent pressed-state buttons are permitted by the contract. |
| Full15 reset | PASS within caller boundary | Reset 20/20, boundaries and preserved REL-03 assertions cover 15 physical removals/refusals, no seeded defaults, unrelated/B/legacy preservation, locked/stale mounted-scope refusal and fresh reopen. The source admits typed intents before asynchronous settlement; reset drafts project defaults without treating displayed equality as removal. N1 confirms 15 unique native removals; N3 confirms partial removal and targeted Retry. |
| Mixed set/reset attribution | PASS at deterministic caller layer | Queues 14/14 and boundaries cover distinct set(default)/reset identities, both predecessor failure directions, repeated recovery, reset/edit/reset, duplicate pending actions, uncertainty/conflict and discard/new-work survival. Exact draft-object matching prevents a predecessor success from acknowledging the current draft. This does not itself prove host release ordering; see B2. |
| Owner and export | **BLOCKED — B1** | Owner/export 13/13 supports real scoped engine admission, device continuity, private capability invalidation, memory-only reset envelopes, setup/owner-change failures and cleanup. Actual Chrome downloads prove set-only sparse/mixed-owner/all15/locked envelopes. Required sparse-reset and mixed-operation disk exports are absent. |
| Production host/native | **BLOCKED — B2; B1 also limits native completeness** | Frozen host 11/11 and N2 verify real composition, route-first competition, AppRail, relative state, Back/Forward paths, two-field partial completion, Stay/Escape/focus, epoch cancellation and unmount. N1/N3 add trusted controls, physical reload/reset, native held locks, write uncertainty and second-document conflict. These are valid bounded results, but do not complete the specific host assertions listed below. N4 has two passing geometry/focus/hit logs and ten screenshots; I additionally inspected both 375px language screenshots, without claiming a new ten-image visual audit. |
| Final regression | PASS at recorded local verification boundary | Hash-verified fresh logs show Settings-rest 43 files/300 tests, Web 27/146, Notifications 41/24/15/12, DateTime 7, Settings/Web type and lint gates and storage types, all exit 0. No protected production/dependency delta requires reopening shared foundation acceptance. These are prior fresh executions independently inspected here, not reruns by this reviewer. |

## B1 — native reset export requirement has no disk evidence

Contract line 88 explicitly requires actual Chrome disk JSON for **sparse set, sparse reset, mixed set/reset, all15 and locked device-only export**.

The authoritative [`N3 log`](../web-more-recovery-native/native-7b216a3-control-plane-20260917-n3-v2-recovery-owner.log) contains exactly four `disk-export` records:

| Log line | Entries | Operation types actually downloaded |
| --- | ---: | --- |
| 9 | 1 device | `set` |
| 11 | 1 device + 1 account, departure dialog | `set` only |
| 25 | 13 device + 2 account | `set` only |
| 31 | 1 device, locked permission | `set` |

No downloaded entry has `operation:"reset"`. In [`verify-native.mjs`](../web-more-recovery-native/verify-native.mjs), lines 395–411 build only set drafts; lines 413–426 retry the failed reset directly without downloading it. The `mixedDialog:true` record means mixed owners, not mixed operations. The separate Sol reset/mixed export tests intercept Blob/anchor operations in jsdom (`fixture.tsx`'s `download()`); they cannot substitute for this explicitly native disk gate.

Frozen N3 log SHA-256: `14512c1913ef71396759d62d057c4e96e094b5d6c4c4bb9a11fff1d8c2719283`.

Frozen native runner SHA-256: `6d840e1fcb4fa96ea64cfc5ed8ab17cc77426320150c09c0f74b420244945ce7` (at controller snapshot above).

Impact: native reset-intent serialization/download remains unknown, not demonstrated broken. This blocks complete owner/export acceptance and contradicts the controller's “only final acceptance remains” conclusion. The N3 report's narrower statement about three export shapes is valid as far as it goes.

## B2 — the More host matrix does not prove the complete required release/history surface

Contract line 94 requires actual Settings sidebar navigation, Back/Forward **location key preservation**, protection of newer edits, and latest matching completion releasing **exactly once**.

The complete More host test file and native runner have no actual Settings-sidebar click or location-key assertion. N2's history block (runner lines 213–228) checks path destinations; those assertions cannot distinguish restoration of the original history entry from recreation of an entry at the same path. Its `partial-latest-release` block (lines 230–246) releases one device write and then a different account write. It does not enqueue a newer operation on the same field, complete the predecessor while holding/failing that newer operation, or count departure commits. The frozen 11-test host baseline also has no such scenario. Sol's isolated queue/guard assertions establish caller behavior, but do not observe production-router release count or history identity.

Frozen N2 log SHA-256: `1c66866b4943143138e88dc5aec18ede599d88fe62273fa965c035a48d1e4582`.

Impact: the existing bounded N2 PASS remains valid; complete host-contract acceptance is unproved. I have not observed premature navigation, duplicate departure or corrupted history. The unchanged shared host and accepted Notifications regressions reduce risk but do not provide the contract's requested More-specific evidence.

## Limitations and required next evidence

No full matrices were repeated: these blockers are directly reproducible by inspecting the frozen runner and JSON log records. A subsequent separately authorized evidence task can add only the missing native sparse-reset/mixed-operation downloads and More host assertions, retaining this source SHA and all prior logs. If a product failure then appears, freeze it for a separate repair decision. This review does not authorize changes to protected source or weaken the contract.

The Chrome evidence uses a real headless Chrome browser, native Web Locks and disk downloads, with synthetic local accounts and deliberate Storage fault injection. It is not Tauri-native execution or production authentication. `signout()` calls the real departure preflight directly; it does not execute a live provider logout. Local dependency trees are reused by the archive runners; unchanged tracked manifests/lockfile do not make those executions hermetic supply-chain attestations. Synthetic beforeunload dispatch proves handler protection, not crash durability. N4 geometry/screenshots do not establish full accessibility conformance. These are retained non-blocking scope limitations, distinct from B1/B2.

**Accepting this caller does not close SET-09 or any 312 item, D2/REL/AI, Tasks default consumption, template CRUD, native launch/tray/window behavior, deployment, or release.** This BLOCKED review accepts none of those scopes and changes no formal counts, controller state or caller schedule. Sticky remains outside this task. Only this report is to be committed; the task stops at the isolated review commit without branch promotion or repair.
