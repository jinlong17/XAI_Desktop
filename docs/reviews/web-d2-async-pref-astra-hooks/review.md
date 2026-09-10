# Registered async preference hooks — independent rejection at d6184ee

Astra, Web, 2026-09-09. **Do not accept the registered-hook session slice at `d6184ee24eb1f72d826fc3548e4099845e5c628b`.** The independent nine-case supplement has **6 FAIL / 3 PASS**, including a planned functional/projection control that exposed a real false-conflict state. These are existing [a82efa0](../web-d2-async-pref-contract/contract.md) session, reset, validation, device and projection requirements. The [engine acceptance at 6504589](../web-d2-async-pref-astra-engine/review-6504589.md) remains intact.

## Fixed evidence and provenance

| Check | Result | Evidence |
| --- | --- | --- |
| Independent rendered-hook supplement | 6 FAIL / 3 PASS | [before log](independent-d6184ee-before.log), [assertions](hooks.test.tsx) |
| Isolated diagnostic of the failed functional/projection control | 1 FAIL, with physical/UI state observations | [diagnostic log](functional-diagnosis-d6184ee.log), [same scenario with observations](functional-diagnosis.test.tsx) |
| Original author hook contract, independently executed | 9/9 PASS | [original hook suite](independent-d6184ee-author-hooks.log) |
| Original fixed storage package | 22 files, 185/185 PASS | [package](independent-d6184ee-package.log) |
| Original fixed storage types | `tsc --noEmit`, exit 0 | [types](independent-d6184ee-types.log) |

Astra executed these runs against `git archive d6184ee`. The supplemental runner overlays only this review's independent test and test-only named shared/exclusive lock fixture into the archive. The package/type runner has no overlay. Actual React roots and product hooks are used, with real jsdom localStorage and exact persistence faults. The test component renders a value/status output where needed; no product mutation success is mocked. Native browser coverage remains a separate layer. Package output retains existing React/storage warning messages; exit is 0.

Parent reports fixed d6184ee hook2 and actual Chrome native5 plus whole-process reopen5 PASS (PID 45710 → 45819), including uncertain save Retry becoming Saved with one write. These are parent-owned executions in `web-d2-async-pref-independent` / `web-d2-async-pref-native` under `parent-hooks-after` suffixes. Their real UI scope is preserved, not relabeled as an Astra native run or used to dismiss the failures below.

The previously written acceptance-status document contains historical checkpoints. It is an inventory, not fresh proof that any still-open row passed. Sol's uncommitted open-ended binding work was visible in git status and excluded from every fixed run. No product/parent files or shared status table were modified.

Reproduce:

```sh
python3 docs/reviews/web-d2-async-pref-astra-hooks/run.py d6184ee
python3 docs/reviews/web-d2-async-pref-astra-hooks/run.py d6184ee functional-diagnosis.test.tsx
python3 docs/reviews/web-d2-async-pref-astra-hooks/run-package.py d6184ee
```

## Six failure oracles, five repair concerns

All are P2 user-state/API correctness issues in this observed slice; the functional case has correct durable increments, and the reset cases do not prove lost persisted data.

| Oracle | Observed behavior | Minimum repair contract |
| --- | --- | --- |
| Reset failure after a clean external projection | Mount at `view`, receive physical/storage-event `edit`, then fail actual remove. Physical bytes remain `edit`; hook status is error but displayed value returns to stale `view`. | `usePrefAutosaveAsync.ts` only updates its separate draft on edit/binding initialization. A clean projected value must become the current draft baseline before reset can fail. Preserve the latest visible value, not a historical local edit. |
| Pending operation after a completed reset | Save `view`, successfully reset to absent/default `comment`, then hold the next Retry. While pending the wrapper displays discarded `view`; final persistence returns to `comment`. | Reset success/reload must retire the obsolete draft. A later pending/error state must not resurrect it. This test's existing title mentions “failed save,” but the actual oracle is the held pending interval; it does not inject a second write failure or claim one occurred. |
| Registered default projection without a custom validator | Store `corrupt-permission`; call `usePrefAsync('xai_pref_collab_default_share')` without options. Source is `valid`, rather than invalid/error with safe default. | Compose the existing storage-owned registered/domain/codec validation into hook reads and input validation. Optional caller validators supplement that boundary. Do not require every public caller to duplicate a schema already enforced by the engine. |
| Edit validator exception | A custom validator throws only for proposed `view`; the hook setter throws synchronously instead of returning its declared Promise of typed refusal. Physical `comment` remains unchanged. | Catch validation exceptions throughout hook initialization/projection/perform and return/display an appropriate typed error. Neither a synchronous exception nor an unhandled Promise rejection may bypass the save-recovery contract. Reuse the accepted engine boundary, without removing validation. |
| Device pending write during account switch | Hold the device key lock for `xai_accent_hue`, enqueue `166`, switch accounts, release. The result is `{ok:false, reason:'invalid'}`; the device write is canceled. | `usePrefAsync.ts` currently binds every key to `scope.epoch` and requires current account-scope object identity in its live validator. Use ownership-aware binding and invalidation: account changes invalidate account drafts, but do not cancel a device operation or introduce an account dependency. Keep key/session/unmount invalidation for both classes. |
| Two successful functional updates leave a false conflict that blocks later projection | Actual values advance `165 → 166 → 167` with one call per updater. First hook remains `165 / conflict`; second is `167 / saved`. After physical `170` plus storage event, first stays `165 / conflict`, second becomes `170 / idle`. | `observedRaw !== result.raw` currently marks a successfully committed request as failed, even when it has no uncommitted absolute draft. Distinguish a newer observed committed value after a completed functional operation from a real dirty/queued absolute conflict. Re-read/project the latest valid state for the clean completed operation; do not offer its already-applied updater as failed work to replay. Preserve genuine dirty conflicts and newer draft ordering. |

The functional [diagnostic](functional-diagnosis-d6184ee.log) confirms both hook states and physical bytes immediately after successful writes and again after the later event. It reproduces only the already failed control with added observations. It is not a harness namespace/lock-signature failure. Code inspection points to `run`'s observed-conflict branch and `project`'s unconditional preservation of conflict status. Retrying an already-applied functional request is a source-derived risk; this review does not claim to have run a duplicate-increment retry scenario.

## Retained successful scope

The independent supplement passes same-key unmount/remount isolation for queued work, actual uncertain **reset** with duplicate Retry/one removal plus clean sibling update, and a real dirty absolute baseline conflict followed by explicit reload. The unmount control's label mentions owner switch, but its own steps cover disposal/remount only; account A→B is covered by the independently rerun original author suite and the parent's stated native scope.

The original nine tests independently retain their valid outcomes: two functional increments persist, A→B hides old drafts, queued unmount/remount cannot write, edit→reset→new edit ordering succeeds, earlier completion does not replace a newer visible draft, active retries share one write, clean/dirty storage projection and reload subscription work for the tested sequence, clean same-tab siblings update, and uncertain set retry publishes without a second write. A passing durable functional count does not prove the first hook's final displayed status, which is why the new failing control matters.

No engine C/D1/D2 reopen is justified: the fixed change concerns hooks, and the new oracles demonstrate wrapper/controller failures rather than an accepted engine regression. No provider, Board, deletion or open-ended-domain investigation was added.

## Repair ownership and next acceptance

Sol owns `usePrefAsync.ts`, `usePrefAutosaveAsync.ts` and their focused hook tests. Reuse existing exported/internal storage validation and ownership classification; do not patch `prefMutation.ts` to compensate for stale wrapper state or hook exception handling. Keep the pending open-ended binding delivery independently fixed and attributed, then apply these six business oracles against the resulting fixed repair. Do not convert device position/preferences into account ownership to make cancellation appear correct.

Re-run the unchanged independent nine and isolated functional diagnostic, preserve this before output, and retain the original nine/package/type results. Add only repair-specific coverage needed to distinguish clean functional completion from truly dirty conflicts and reset/reload draft retirement. The parent can rerun its unchanged native5 when the fixed integration is ready. A green author package alone remains insufficient.

The future DashHeader account-note consumer remains a separate caller batch after these hook failures are fixed. Parent evidence `9557005` records its unconverted early-write/editor-close and absent-mount seeding baselines; this review did not execute those scenarios. Keep its account content and device position classifications, existing failed-draft/export/beforeunload protections and business assertions when that caller is assigned. This is not an added blocker for the current hook repair.

Only owned review/test/log files were written; no push and no shared-ledger change. Full async-pref acceptance, open-ended binding/callers, D2, AI-02 and REL-05 remain open. Previously accepted engine, Settings durable deletion and Board detail remain accepted within their existing bounds.
