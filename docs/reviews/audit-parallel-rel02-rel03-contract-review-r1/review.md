# REL02+03 / CONTRACT-REVIEW r1

**Verdict: APPROVED — preparation contract only.** No blocking contract defect found. REL02 may advance to substantive other-vendor source/evidence verification once root registers that executor and reconciles the permanent budget. REL03 retains the bounded current Gate/BYOK integration gap: preserve N1, qualify its new runner separately, and execute it only after the V1 reconciliation and Q gates. Neither caller is accepted, implementation-ready, READY_TO_SHIP, or closed by this review.

## Identity, authority and method

- Module **web**, Workflow **D** independent review under the sole A-Codex controller. This workflow partition is not the external-executor Automation Mode D-Codex.
- Dispatch parent: `48b4b4de2421ce31e4aeb58654bb39c0f0afae0a`; card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/tasks-P6.json`, exact `REL02+03/CONTRACT-REVIEW` object. The dispatch named “exacttasks-P6” means this exact card, not a separate filename.
- Proposal source: `c6050091f21aca4f3003da8f67f92a41a4a528d4`; contract SHA-256 `cb5c1e9ed63e00192ebc9c3b5cf30d62448d4b9a0506e05d06b9fe4133bcab30`; original index SHA-256 `c81e60b6a21f9ec4cecc631dab6a299c169e83e6c2d32f877b0aedb24e611b31`.
- Product remains `f9eb4b1f207bc4b46f547b90afc250424b3c8695` (P0). The receipt/control HEAD is not a substitute product input.
- Read original goal first, then AGENTS/CLAUDE/shared workflow/multi-machine policy, authority overlay, r2 scheduler and fixed task card. Root's fixed control-plane adoption at `CURRENT-CONTROL-PLANE.md:577-579` resolves the scheduler's retained historical UNACCEPTED heading. This reviewer neither adopts pointers nor acquires controller authority.
- Fresh Codex reviewer, not author of these caller batches or the preparation; no children. Card requests `gpt-6-astra`; a requested role/model is metadata, not an attested engine or different vendor. This report is **not** cross-vendor evidence.
- Independently read all **5616** supplied identities: **5615 Git blobs + 1 original-goal file**. One binary-safe `git cat-file --batch` result was parsed by byte lengths, not line splitting of blob payloads; recomputed every blob SHA-1 identity and every SHA-256. Zero missing/mismatching blobs/files; complete consumption of 37,560,131 batch bytes. Hashing is not runtime verification.
- This review index preserves those 5616 records and adds 10 proposal/governance/card/adoption identities: **5626 records** total. Its SHA-256 is `67415e4c69627220ed0c269377250c7bd693942d5276a91cabf5b712d3058ece`. The index does not recursively include its own output or this report.
- Content review targeted both entire EXECUTION records, original actions/acceptances, complete diagnosis regression groups, relevant historical raw logs/assertion bodies and later source/native/acceptance chains. Identity checking all 5616 files does not claim a line-by-line code audit of that whole source envelope.

## Original obligations and source-equivalence decision

Original `ALL-TODO-CURRENT.md:87-88` obligations are retained in full: REL02 fixes shared Auth/device IndexedDB initialization, both fresh orders, concurrent initialization and data-preserving old-store migration. REL03 isolates business content/BYOK by account while retaining device preferences, prevents B reading A after sign-out, and provides explicit unowned migration choice and rollback. Full `EXECUTION.json` evidence arrays agree with proposal §1, including every commit and independent review path; neither history is reduced to its latest green report.

REL02: independently compared the full `packages/web-auth-device-session` tree at `8e50d8f3edae3a751826b02dd63bb2e10abe0395` and P0: both are `a73faa6ef0b3811488657326f0e6582618564d43`. Root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` also have empty diffs. `storage.ts` imports idb-keyval at runtime and Supabase SupportedStorage only as a type. The unchanged package includes session/provider and device consumers; this does not assert every downstream host path or a contemporary installed dependency environment is identical. Original native scope plus source/config equality is sufficient to reuse the REL02 evidence for V1; no new browser run is justified by vendor identity alone.

REL03: unchanged Gate/CSS/ownership/secret participant/host AccountStorageGate do not establish complete graph equality. The changed App sign-out integration, module registrations, migration validation, scope coordination and hooks are material. At P0, accountScope/migration/validation/coordination/secret bytes equal `c201a1d1f99537cd54112ccd99e59d11bb4281fa`; storage lifecycle/strict receipt/Settings recovery bytes equal `a1f73c9143b533fb1f70466ca5148039fcdaa83e`. Each named path was checked to exist at both snapshots before equality was claimed. The fixed review parent versus P0 differs within apps/packages only in the four disclosed Time Tracker docs; no runtime baseline substitution is needed.

## REL02 matrix and retained failures

Coordinates below use `docs/reviews/web-auth-store-independent/native.ts` and `20260909-native.log` at the historical snapshot; raw count9 is aggregate, not nine separately timestamped results. V1 must pair that count with the actual assertions.

| Row | Evidence/oracle | Review disposition |
|---|---|---|
| R2-01 | Native group1: session first; both values, v2/two stores | Reuse; package/config equality |
| R2-02 | Group2: device first; same persisted/schema postconditions | Reuse |
| R2-03 | Group3: concurrent first writes; both values/schema | Reuse |
| R2-04 | Group4: session-only v1 legacy preserved; device write succeeds | Reuse |
| R2-05 | Group5: device-only v1 legacy preserved; session write succeeds | Reuse |
| R2-06 | Group6: warm alpha old/new plus beta new survive concurrent extension; independent queue test adds warm read | Reuse |
| R2-07 | Group7: held native connection forces blocked rejection; released blocker allows retry and preserves original | Reuse; held connection is not complete multi-window UI proof |
| R2-08 | Group8: real abort rejects, aborted value absent, old value retained, next extension completes | Reuse with independent queue corroboration |
| R2-09 | Group9: native DataError rejects; later valid queued write persists | Reuse with independent queue corroboration |

The 0141ecb/f578ae8 initial five scenarios and 52 tests missed the warm extension race. f15aceb's whole-operation queue, six native scenarios/53 tests, independent queue3 and later native9 remain distinct evidence. Preserve the initial dump-dom RUNNING timeout, warm InvalidStateError, and Claude401 before review; missing standalone early raw logs remain a disclosed provenance limitation, not reconstructed evidence. Source inspection supports queue cleanup on rejected opening/callback and subsequent operation; no current defect was demonstrated in this static pass. Hosted login/server behavior remains outside this narrow original contract.

## REL03 matrix and current-combination necessity

J labels refer to `web-account-scope-current-independent/20260909-native.log` and the frozen joined assertion body; G labels to `20260909-native-gate.log` and `native-gate.tsx`. These historical artifacts test fixed `5803e86bc6dcde4906cee8eb27777407d59b1d13` with synthetic account identity; they are not hosted login.

| Row | Direct historical proof and later corroboration | Current disposition |
|---|---|---|
| R3-01 | J5/G7/G8: sign-out hides private children/key; B empty, old A handle rejects; AppRail corroborates actual sign-out/departure integration | Retain N1 current Gate/B boundary; AppRail alone insufficient |
| R3-02 | J5/J7/G6: late crypto refused, A private content/key retained/reopened | Retain N1 integration and late-publication oracle; unchanged secret code is not entire imported scope graph |
| R3-03 | J7/J8/G9: device theme/raw quarantine survive account operations; ownership unchanged | Reuse ownership/source proof and N1 byte-invariance observations; no new key policy |
| R3-04 | G1-G3: all unchecked, Decide later no mount, empty/Continue empty | Retain N1 current migration path |
| R3-05 | J1/J2/G4: normal production registration, exact raw/ciphertext archive, content and separately adopted key, preexisting data/key retained | Retain N1 current registrations plus canonical acceptance/refusal; no annotations bypass |
| R3-06 | J3: final-marker failure retains prior visible generation; later source7 detects source add/remove/change during awaited staging; native3 proves actual exclusive lifecycle adapter | Reuse within exact fault scopes; native3 has a synthetic secret participant and does not replace J3 multi-store assertions |
| R3-07 | J4/G5/G6: actual Undo restores prior generation/content/key and revokes old handles; G4 excludes children until Continue | Retain N1 actual UI plus changed lock/migration graph |
| R3-08 | J6 and unchanged Gate/secret plus explicit migration demo guard | Reuse bounded demo evidence; no extra native suite justified absent a specific remaining delta |
| R3-09 | J7/J8 plus later accepted a1f73c9 strict durable deletion chain/native4+reopen4 | Reuse bounded captured-owner/deletion proof; old synchronous helper runner is not current coordinated-caller proof; REL04/REL06 remain open |

The nine diagnosis regression groups remain mandatory reconciliation rows in V1: (1) sign-out/direct A-B/all repositories/search/widgets/statistics/AI/A return; (2) token refresh/loading/unconfigured/unauthenticated/demo; (3) pending saves/crypto/key-test/stream/tool/timers/stale-auth completions; (4) device versus account list/category state; (5) migration choices/invalid/empty/populated/duplicates/decrypt/repeat/rollback; (6) storage/quota/blocked-IDB/close/crash/commit/rollback/competing/legacy mutations; (7) same/different-account tabs and scoped notifications; (8) captured export/reset/delete/cache ownership; (9) package/types/browser synthetic identities with hosted-auth boundary separate. This contract does not claim every group has current end-to-end proof. V1 must name direct proof, bounded corroboration or residual for each sub-obligation. A genuine residual within the original local isolation/choice/rollback obligation blocks acceptance; broad D2 writer rollout cannot be silently closed or used to require unrelated implementation here.

Causality for N1 is concrete. `accountMigration.ts` now takes a generation-independent account-exclusive lifecycle lock, rechecks source sets/raw values after awaited secret staging, and validates canonical envelopes through changed migration validation. `web-account-coordination-native/native-probe.ts` exercises `choice:'empty'` with synthetic `stage/verify`; it observes native exclusive mode but never mounts Gate or uses actual BYOK. `migration-write-race.test.ts` source7 likewise proves acknowledged-source preservation/refusal at its seam, not actual Gate+crypto integration. Conversely, old actual Gate9 and joined8 precede that changed graph. P0 AppRail storage regression covers imperative/registry31, not migration/Gate/secrets. No inspected frozen artifact closes that combination; N1 is justified by an uncovered integration, not mere file drift.

The proposed single N1 suite therefore remains necessary unless V1 supplies an exact equivalent complete-closure artifact. Its original J/G oracles are read locks: the new runner must prove positive import and retention as well as Undo/isolation, not merely button completion or a green process exit. Use distinct private content and non-conflicting existing/legacy secret providers as in J2 (owned DeepSeek and legacy Anthropic), preserving the existing conflict-refusal policy. Canonical valid/refusal fixtures and all current declared owner-registration availability are original-scope compatibility checks; this is not authorization for every business lifecycle to be replayed. The proposal already requires preserving unknown/corrupt bytes, marker identity, lock name/mode, pre-Continue exclusion and late-crypto refusal. No weaker oracle or additional product decision is approved.

## Historical failure chain remains immutable

Reviewed the original local content/key leak characterization and diagnosis, host same-account/route guard fixes, joint pre-fix production sideEffects/validator failure, repaired normal-annotations joined8 and actual Gate9. The Gate's original populated-category fixture refusal remains a correct refusal, and the changed distinct-private-key fixture does not waive conflict behavior. Initial bundling/viewport/wait/directory preparation limitations remain attributed.

Later source failures (2dc5333, 946ded3) and repaired c201a1d source7 are retained. Native e9ff409 Illegal invocation and mode error remain failures; e9fb5e7/c201a1d native3+reopen1 have their own bounded oracles. Settings' initial admission/locking failure, same-context-only intermediate PASS, cross-context refusal, queued raw-token failure and final active-map fix remain the a1f73c9/5a97d53 accepted chain. That final acceptance expressly excludes server delivery, arbitrary old clients, crash exactly-once side effects and full D2. This review does not rename these failures, sum test counts into wider coverage, or rerun them.

## Stages, exact paths and admission

Proposal coordinates: §4 lines101-117, §5 lines119-136, N1 lines140-146, DAG lines150-159, runtime receipts line163, budgets/stops lines167-173. No required contract correction at these coordinates. Dependencies below are admission conditions, not worker write grants; root must register every future fixed parent, exact source/hash and remaining budget first.

| Stage | Reviewed readiness |
|---|---|
| V1 | CR approved here; after root receipt, actual fresh other-vendor executor and permanent-budget reconciliation, one static full source/evidence matrix pass. REL03 may carry an integration residual; “no unproven combination” applies to a REL03 PASS, not an invented precondition preventing V1 from assessing N1. Authentication/launch/model label alone never passes V1. |
| Q author / separate Q reviewer | N1 necessity retained, but §6 requires V1's full matrix first. Root separately freezes oracle and exact inputs; author creates a new runner/fixture, fresh reviewer qualifies source/oracles/transport. No existing approved runner or runtime readiness claimed. |
| V2 | Blocked until Q approval, own qualified immutable P0 runtime, runner/fixture hashes, resolved dependency/lock identity, native resource and reconciled remaining unit budget. One bounded N1 suite, substantive actual other-vendor verification and preserved raw receipt. |
| A | Blocked until V1 and required V2 results with all original rows reconciled; fresh independent full acceptance, never repair. Contract approval or a single native PASS cannot substitute. |
| Root receipt/reconcile | Sole root under recurring exclusive resource. Preserve source remotely, verify/integrate exact files and hashes, then push/sync-check. No worker global status writes. |

Exact proposed ADD paths (all relative to `docs/reviews/`; no glob expansion):

- V1: `audit-parallel-rel02-rel03-cross-vendor-r1/review.md`, `audit-parallel-rel02-rel03-cross-vendor-r1/inputs.sha256`, `audit-parallel-rel02-rel03-cross-vendor-r1/stdout.jsonl`, `audit-parallel-rel02-rel03-cross-vendor-r1/stderr.log`, `audit-parallel-rel02-rel03-cross-vendor-r1/receipt.json`, `audit-parallel-rel02-rel03-cross-vendor-r1/matrix.json`.
- Q author: `audit-parallel-rel03-current-integration-r1/verify.mjs`, `audit-parallel-rel03-current-integration-r1/fixture.tsx`, `audit-parallel-rel03-current-integration-r1/contract.md`, `audit-parallel-rel03-current-integration-r1/inputs.sha256`.
- Q reviewer: `audit-parallel-rel03-current-integration-review-r1/review.md`, `audit-parallel-rel03-current-integration-review-r1/inputs.sha256`.
- V2: `audit-parallel-rel03-current-integration-r1/result.json`, `audit-parallel-rel03-current-integration-r1/stdout.log`, `audit-parallel-rel03-current-integration-r1/stderr.log`, `audit-parallel-rel03-current-integration-r1/receipt.json`, `audit-parallel-rel03-current-integration-r1/review.md`.
- A: `audit-parallel-rel02-rel03-acceptance-r1/acceptance.md`, `audit-parallel-rel02-rel03-acceptance-r1/inputs.sha256`.

Future N1 must stream archive extraction, prove every @repo resolution and real lockfile/dependency identity, use CDP pipe and a disposable own profile/server, reject overwrites and record requested/resolved P0, command/cwd, timing/exit/timeout, browser/transport, synthetic identity seam, input/output hashes and every oracle/PRECONDITION outcome. DOM programmatic controls establish functional UI behavior only; trusted-input claims need their own receipt. Old buffered 100MiB/TCP runners are frozen evidence, not launch recipes. A runtime or fixture failure consumes the registered cost and must be preserved; correction needs an independently scoped author, not reviewer edits.

## Cost, protected state and limitations

This task consumes static contract review **1/3**, one bounded pass; runtime0, browser0, native0, package tests0, probes0, historical reruns0, children0. Static Git/hash/diff/source inspections only. Reused failure/refusal/iteration counts are not reset by the new actor, path or filename. Before any next launch root must reconcile permanent per-caller/per-unit counts; missing counts block launch rather than imply zero. V1 maximum900s/USD12 where externally metered, zero runtime; V2 one suite per formal attempt, family maximum3 and maximum900s/USD12 per attempt, bounded own shutdown2s+2s, subject to the smaller remaining budget. CR/Q review/A remain one static pass per dispatched iteration. This does not grant Q exploratory probes or bypass any exhausted Clock cap.

Only this report and its input index were authored. Product/source/tests/CSS/runner, original contract/report/logs, global control/registry/three ledgers/inventory and other worktrees remain protected. Stop on hash/scope/dirty conflicts, unavailable source, missing admissible runner, true current product failure, new owner semantics, irreproducible receipt, exhausted budget or credential/module/cloud/schema demand. Freeze the affected task; reviewer does not repair. Clock's independent blocked descendants do not block this static account review.

No hosted Supabase two-account flow, provider request, cloud sync, deployment, release, Web-to-Desktop promotion or universal lifecycle proof was performed or claimed. No external executor was launched here. Formal counts remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**. REL02 and REL03 keep `functional_status=passed`, `workflow_status=cross_tool_verification_pending`, composite `verification_pending`. This is an approved evidence plan, not caller acceptance.
