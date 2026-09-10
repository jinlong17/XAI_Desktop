# Astra decision: repair shared uncertainty authorization before accepting Date & Time

Fixed examined product `2c097197cc5cff869b875b5e1baa8b7656b5de76`; later caller-notificatione9213fb does not change storage. Generic bounded architecture review, not complete DateTime acceptance. Parent native files were protected; no product edits.

**Decision: authorize a narrow shared `prefMutation.ts` correction and the necessary `usePrefAsync.ts` retry-token lifetime correction. Do not implement a DateTime raw-preflight workaround.** Existing DateTime contract expressly requires a correct shared before oracle and impact review before modifying the accepted foundation; this report supplies them. DateTime still needs its complete caller/host/native acceptance after the shared fix and its separate scoped CSS issue.

## Correct independent before evidence

Solb64d499 `advanced-after2-2c09719.log` proves the real pane overwrites an external `true` after its own uncertain `false` write. Parent separately reproduced this through an actual Chrome Retry click with the application write count increasing from1 to2. Those remain Sol/parent execution.

Astra independently executes `uncertain-boundary.test.tsx` against immutable2c09719 via `verify-fixed.mjs`: `uncertain-baseline-2c09719.log` is **4correctFAIL/2PASS**. Tests use the real shared engine/public hook and a named-lock fixture, actual Storage fault injection and physical bytes/notification counts; no product hook is mocked:

- Absolute set: originaltrue → physically committedfalse/readback throw → externaltrue → token Retry. Required conflict, externaltrue, zero further writes/removes/notices. Actual success overwritesfalse and publishes.
- Reset: originaltrue → physically removed/readback throw → externaltrue → token Retry. Required conflict, externaltrue, no further mutations/notices. Actual success removes the external value and publishes.
- Invented token with current==expectedtrue: required refusal/no write. Actual ordinary setfalse succeeds. This exposes the missing token-mode boundary independently of DateTime.
- Public `usePrefAsync`: original uncertainfalse token → Retry encounters a temporary read denial → restored reads and unchanged Retry. Required verifyfalse with one total write and Saved. Actual token is lost and the final Retry falsely conflicts.
- Positive set/reset controls retain their original grant, verify once with no second set/remove and exactly one reconciliation notice, then reject consumed-token replay. Both already pass.

`uncertain-before-2c09719.log` was an initial test syntax/collection failure (zero tests), preserved only as runner-development history; it is not counted as a product failure.

## Cause and why caller preflight is the wrong layer

`usePrefAsync.run` supplies `controller.raw` as expected baseline for absolute/reset requests. An uncertain failure correctly does not advance that baseline, so it remains originaltrue. The engine records a token with originaltrue/intendedfalse (or intendednull for reset).

`mutatePref` observes the externaltrue, forgets the uncertain record because it differs from intended, and checks the token **only inside `current.raw !== expectedRaw` branches**. Since the restored external bytes equal the old baseline, it bypasses token validation and takes the ordinary mutation path. The engine-issued reconciliation grant has accidentally become fresh overwrite authority. This is observable external divergence from the known uncertain intended commit, not the contract's excluded unobservable ABA/revision problem.

A caller raw read is outside the key lock and races any external writer after that read. It also cannot authenticate engine-issued token identity, reset kind, consumed grant, account marker or physical binding. Adding it to every pane would duplicate incomplete engine semantics and leave public APIs and reset exposed. New caller sidecars/journals/envelopes are neither needed nor authorized.

Separately, `usePrefAsync.run` assigns `request.reconcileToken = result.retryToken` on every failure. A retry failure such as unavailable/lock refusal generally returns no new token, so the still-needed old grant disappears. A previously invalidated grant also must not disappear into an ordinary overwrite attempt on a subsequent click.

## Concrete shared repair contract

1. Keep the existing lock order and full owner/marker/tombstone admission before reads/publication. Once a reconciliation token is supplied, treat the request as **verification of that specific uncertain commit**, never as a fallback ordinary write/reset, irrespective of equality with expectedRaw.
2. Under the physical-key lock, validate issued/unconsumed token, full physical binding, operation kind, original baseline and intended encoding. It may succeed only when the current strict physical snapshot equals that grant's intended result (including absent for reset). Return unchanged success, no set/remove, and exactly one reconciliation notification. Wrong/missing-from-map/consumed/mismatched tokens refuse; they must not become fresh mutation authority even when baseline==current.
3. An observed valid or invalid external divergence invalidates that grant and returns conflict/refusal without modifying bytes or publishing. Subsequent restoration of intended or original bytes cannot revive an invalidated grant. A temporary unavailable read or lock refusal retains the grant for a later verification attempt; no unverified notice is published. Invalid token requests against another key must not consume an unrelated valid grant.
4. Preserve a failed absolute/reset request's existing token across failures unless a new engine-issued token replaces it. The engine remains authoritative about validity: retaining an invalid token ensures repeated Retry keeps refusing rather than falling through to overwrite. A **new user edit/reset or explicit reload** has the existing separate intent/session semantics; never copy the old token to a genuinely different intent.
5. Keep no-token explicit set/remove and ordinary verified no-op semantics, including reconciliation of an unannounced own commit through the existing public APIs, and consumed-token refusal afterward. Do not invent a requirement that every deliberate replacement carries a token. Do not change the raw codec/default/key or registry ownership.
6. Preserve the original documented functional-updater contract: a retry of a functional mutation is a new updater attempt against current validated data, not a durable exactly-once command. Do not execute a supplied updater as a side effect of authenticating an absolute reconciliation token. Separate this explicit functional retry path from token verification; retain the existing functional ordering/retry tests. If implementation chooses a different functional uncertainty contract, pause that extension for explicit review rather than silently changing it while fixing this absolute/reset bug.
7. Keep request sequence, coalescing, duplicate pending Retry, disposal/reload/epoch invalidation and latest caller attribution. Do not “fix” the problem by advancing controller.raw to unverified intended bytes or rebasing all failed drafts to external sources. Conflict requires explicit recovery; it is not permission to overwrite.

## Ownership and affected verification

Terra may edit only the above two storage files and focused shared tests for this correction, alongside its already owned DateTime caller/CSS work. Storage ABI/types change only if demonstrably required; no need for a new public caller token API. Shared account coordination, registry/ownership, lifecycle/deletion, canonical engines, ordinary secret/timer code and reviewer evidence remain protected. Separate the shared product commit from unrelated visual changes so final delta attribution is clear.

| Required regression | Why it is affected |
| --- | --- |
| Astra six new shared assertions and Sol unchanged DateTime advanced conflict | Direct defect/positive controls; repeat at fixed final shared SHA without assertion weakening. Add invalidated/consumed token at restored original bytes, repeated Retry after conflict, reset equivalent and transient lock/read denial. |
| Original shared engine21, retry-token13 and repair-boundaries; storage package/types/lint | Token set/reset, wrong key/account/generation/intent/kind, full marker/tombstone, no-token public reconciliation and notification ownership are public engine behavior. Retain original immutable evidence and run current assertions at the new SHA. |
| Original independent hooks9, dynamic binding and functional diagnosis/contract suites | Request token retention, failed/reset→edit, unchanged/changed intent, one-write/remove sibling notification, queued/duplicate Retry, reload/disposal/owner; functional new-attempt semantics must remain compatible. |
| D2 foundation/admission/deletion and C/D1 protected-storage regression | The same engine is called by explicit account set/remove/autosave APIs. Confirm shared lock ordering and admission/refusal are unchanged and canonical keys still refuse; do not use the old c9 shared run as if it tested this new engine. Run the existing fixed foundation/admission/protected-storage oracles. |
| Accepted async callers | Header full Astra27 + Sol42/parent host and original account/device protocols; Pomodoro complete18/7/24/2 plus actual9/8; Collaborate complete37+5/host8; Smart original39 plus host10/entry3/wrapper5/export8/App5. Particularly rerun their unchanged/changed uncertainty and same-value/latest/partial recovery. They all consume the modified hook/engine, so the old source-unchanged reuse argument no longer applies to persistence outcomes. |
| DateTime full current matrix | All five fields, sparse/all-five export, source-only, mixed failures, old/fresh scope, all-clean host continuation fix and actual host12; native changed-external refusal plus unchanged one-write positive, read-denied recovery, physical/disk bytes and Runtime0. Retain old before logs. |
| Native/shared UI scope | New engine calls require real lock/storage/owner checks and actual DateTime browser retry. Existing unrelated Header/Pomo/Smart/Collab layout screenshots may retain prior versioned attribution if DOM/CSS unchanged; rerun persistence/host completion outcomes affected by the shared engine. DateTime's own scoped toggle visual repair still requires fresh native visual checks. |

Parent coordinates runners/agents to avoid duplicate edits and reports each executor honestly. Passing DateTime alone will not re-accept a modified shared foundation. Conversely, this new defect does not relabel previously run positives as fictitious; historical bounded accepts and their precise evidence remain. Current final acceptance must incorporate this newly known shared risk and the fixed regression chain. No global audit number or activation/release gate closes here.
