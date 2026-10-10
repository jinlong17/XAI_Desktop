# MED-03 complete exact source-contract independent review r1

**Verdict: REVISE, whole conditional technical proposal only.** Three exact-contract corrections SC-R1 through SC-R3 below prevent adoption of the complete current source proposal. These are source-derived contract findings, not reproduced runtime failures. The original MED-03 action, acceptance and every required oracle remain intact. The reviewer repairs nothing and grants no API, product, machinery, qualification, runtime or caller acceptance.

## Fixed identity, authority and independence

Module web; workflow D under the sole A-Codex controller. Fresh independent reviewer /root/parallel_d_med03_source_contract_review_r1. Requested Astra role is dispatch metadata, not independent provider billing/model attestation and not different-vendor verification. No children.

Direct parent P=28ba1cf444f2545fb93dd0340204530e07f8f6f6; fixed input I=b643171fa4ef7a17a7c1cd6cde4c6dea1a509588; original source S=dc9f0046c431d1357d947884c282a53a6e257f30; P0=f9eb4b1f207bc4b46f547b90afc250424b3c8695; original audit O=e041c2bc293b70db367444c62c4300231976dbf7. Worktree /Users/lijinlong/.codex/worktrees/audit-parallel-med03-source-review1-20261010/XAI_Desktop was clean at exact P before review. Current registration is the MED-03/SOURCE-CONTRACT-REVIEW1 entry in execution-state.tasks LIST and task-med03-source-contract-review-r1.json, not the initial registry.

Only docs/reviews/audit-parallel-med03-source-contract-review-r1/review.md and adjacent inputs.sha256 are ADD-authorized. All original source/evidence/tests/runners/CSS/schema/storage/host/config/lockfile, controls/ledgers/inventory and other worktrees are protected. No push, merge/rebase, promotion, release/deploy/D3 or product probe. Root owns preservation/integration/remote ancestry/sync; ordinary child pnpm sync is outside this card. AGENTS, CLAUDE, shared workflow/multi-machine policy, commit convention, original goal attachment, parallel authority overlay and goal-D were read. Memory was used only to locate the conservative ledger/evidence boundary; current decisions are verified against fixed repository source.

The whole adopted impact5a8d7141d8e032ae08c56a7650cdf47597d717ff and impact review30e0a903196db8b11c3f30cc02f173bfe2a4bffd remain conditional technical basis. This is source-contract review1/3; it does not reset original author/reviewer/source/native families.

## Required corrections

### SC-R1 - P2: separate mutation admission from each recovery-export admission

Source contract section3, line35, includes export in the operation-boundary source capture and immediately says invalid/unavailable refuse. Section4 and M03-11 simultaneously require readable damaged session bytes, rejected preference proposals and raw account records to remain exportable. A blanket S-MED valid/absent prerequisite leaves two incompatible instructions.

Concrete source case: a failed preference proposal remains mounted, then the current preference key is replaced by malformed JSON or becomes unreadable while account/tombstone authorization remains provable. P0 useMeditationPrefs.snapshot() returns the owner-checked pending value, and Module exportDraft serializes that value plus the latest two editor drafts; it does not require valid committed preference JSON. Likewise controller.exportRecovery reads the active key and exports malformed active bytes, while exportAccountLocalData captures raw account records. An unrelated invalid preference source must not silently become authority to suppress these recovery channels. Total storage/owner denial still legitimately refuses where authorization or requested bytes cannot be established.

Required correction: freeze an explicit per-operation/per-emitter admission table. Start/commit/write Retry require usable authoritative preferences and preserve rejected intent/baseline on refusal. Session raw export requires readable active bytes and valid owner/lifetime, not active-schema validity or unrelated preference validity. Proposal export requires the captured authorized mounted pending value and latest drafts, without manufacturing committed backup or demanding readable committed preference data beyond actual authorization needs. Account export preserves the captured-owner library contract and raw-record inclusion, with separate current-caller click/lifetime checks. Define read-denied versus malformed-readable and owner-denied outcomes for each; add the finite cross-channel negative/positive controls to M03-09/11. Preserve setup failure, raw disk, no-write, mid-owner and forced-loss oracles. No implementation is requested here.

### SC-R2 - P2: make the new source classifier total when numeric coercion throws

Section3 line29 defines supported versions through Number(schemaVersion), with all other present versions invalid/version. Valid JSON can contain {"schemaVersion":{"toString":null}}. Ordinary numeric coercion of that object cannot obtain a primitive: inherited valueOf returns the object and the own non-callable toString shadows the fallback. Number therefore throws, rather than returning a non-member number. This is a language/source deduction; no product or JavaScript probe was executed.

The proposed read result is a readonly discriminated union and the source subscription/getSnapshot contract must remain usable under malformed input. The text catches storage/owner failure but does not define this classifier exception. Letting it escape can defeat rendering/source Retry; reporting it as read-denied would misdescribe a readable version value. The existing migration validator also uses Number, but it is a distinct protected compatibility surface and does not define the new reader's failure result.

Required correction: explicitly classify conversion failure as invalid/version with exact raw bytes and display-only normalization; preserve no-write refusal and stable snapshot behavior. Retain absent-version and successfully coercible supported versions (including numeric strings, true and other already admitted coercible values) and unchanged validatePrefs normalization; do not switch to a stricter numeric-only migration rule. Name the throwing-object specimen and a valid coercible counterpart in the finite source/SSR/recovery case set. Do not modify the existing migration validator, active validator or shared codec in this review.

### SC-R3 - P2: give all seven canonical reset events an explicit compatibility disposition

Section5 line57 says emit a canonical default only for its corresponding successful reset, while the finite Appendix RESET covers registered keys and explicitly excludes unregistered keys. Actual resetAllPrefs.ts emits the seven RESET_DEFAULTS entries. Only accentHue/railPos/bgTone map to its registered xai_accent_hue/xai_rail_pos/xai_bg_tone removal targets. theme/density/fontScale/lang have no corresponding entry in the87-key table.

defaults.ts and settings-shell API section5.1 explain the historical four non-usePref broadcast dimensions. That historical useState explanation is not current App truth: P0 App.tsx lines123-129 uses the Appearance controller, its open-ended xai_pref_theme/density/font_scale/lang bindings, and explicitly retires the preference-changed write path. A utility event, a confirmed storage removal and actual App state are therefore distinct facts. Source search finds no production default SettingsFooter instantiation; this does not erase its exported API or permit a new App reset button.

Required correction: enumerate exact disposition/payload/order and success/failure reporting for every RESET_DEFAULTS entry, including the four without registry removals, and the owner-change boundary during synchronous observers. Resolve whether those four remain compatibility notifications or are intentionally suppressed under an explicitly reviewed API change; do not silently invent registry/removal grants or claim they reset the current App. Keep the accepted Appearance controller/reset protected. Bind the finite existing/default/override caller census and dedicated compatibility oracles to that choice. The87 classification rows remain source-action proposals, never87 write grants.

## Whole source and API assessment

The exact proposed readMeditationPrefsSource(scope) and subscribeMeditationPrefsSource(scope,invalidate) APIs are local AV2 exports, not deployed package APIs. AV4 can only expose the existing unchanged subscribeSameTab(key,listener,scope?) observer through the public barrel. Native storage/remove/clear, same-tab advisory values, pageshow/visible return, scope changes and explicit read-only Retry must cause authoritative rereads. Scope capture/assert/physical-key/tombstone checks, a single preference raw sample, post-read same-scope check, stable cached useSyncExternalStore snapshots and idempotent cleanup are coherent requirements. They are not atomicity across future cross-document writes, new committed-marker authority, a global storage hook rewrite or method qualification. SC-R2 completes a missing result case.

The valid/absent/invalid/unavailable union distinguishes raw null from raw undefined and normalized display value from mutation authority. Supplied malformed known fields continue unchanged normalization. Supported schema-less/partial/coercible input is not required to equal a fully defaulted object. Migration separately compares every supplied non-version field recursively with its normalized counterpart; active migration remains null-only. The existing full-value commit tuple, failure/retry/discard/snapshot channels, rejected proposal/baseline/editor values and no automatic write-on-repair remain required. Unknown baseline is not confirmed absence. SC-R1 must remove export ambiguity without weakening any write boundary.

Original R1/R2/R3 remain resolved and preserved verbatim: session.error and recovery.failure already render exportFailed in separate alerts; absent/coercible migration version and supplied-field equality are recorded precisely; draft export is exactly version/kind/snapshot/sceneDraft/fixedDurationDraft with snapshot=pending.current.value. It is not a committed backup, baseline raw export or import API. Current source-contract findings do not reopen the old false missing-UI claim.

One account-owned device-local row retains version1, owner kind/accountId/generation, sessionId/revision/phase, durationMs, accumulatedElapsedMs, segment runStartedAt, deadline, endedAt/reason and the complete nested start preferences. Running absence counts; paused absence does not; expiry is recorded once at the original deadline; manual timing clamps rollback. Ended remains until explicit Dismiss, then new Start uses a new id/revision0/elapsed0/current prefs. Live player volume differs from immutable start prefs.volume. No history array, original-start timestamp, audible-time metric, archive/replay counter, statistics event or auto-replay is introduced. The original Chinese action/acceptance remain copied in the full proposal appendix. No new minimum product-owner question is established.

Actual main startup includes StrictMode, AppProviders, RouterProvider, service worker and observability; public App, AccountStorageGate/AccountDataGate, feature fallback and MeditationSlotHost preserve both real auth branches. PomodoroSessionHost is persistent; Meditation controller/timer/audio observation is route-local. Actual new loader/document and whole-process recovery cannot be replaced by remount. Managed proof requires non-null live configuration, real SDK/coordinator/device/nonce bridges and actual local HTTP transport; direct accountScope activation, config-null mock or swallowed auxiliary failure cannot prove readiness. Exact consumed SDK/config/ReactDOM/native forwarding and root outer capture remain local source prerequisites, not fabricated endpoint tables.

Controller locks and operation tokens do not fence all later UI callbacks. Module command results and Player resume.then require mount/scope/session/revision/lifetime checks before fresh audio or UI action, with actual delayed command and late resume controls. Preserve actual audio graph revision/cancellation/deadline gain and default browser policy. Native fullscreen/Escape is presentation-only; already-ended player End/Exit currently invokes dismiss and needs phase-accurate disclosure. Nothing here qualifies a method or establishes a reproduced lifecycle defect.

## Complete16-row assessment

Every full original oracle, finite expansion, emitter and healthy/causal fault pair is required. The following assessment covers the whole proposal, not just SC-R1 through SC-R3. All behavioral outcomes are UNRUN.

| Row | Independent assessment and retained acceptance |
| --- | --- |
| M03-01 | Bilingual actual visible/AX one-record disclosure and full Start/Pause/Resume/End/Dismiss/new-id sequence remain; wrong archive claim/reused id/early removal must fail. No invented history. |
| M03-02 | Preset/custom/infinite running/paused absence, before/at/after deadline and rollback retain independent elapsed oracle; product elapsedAt is not its own expected result. |
| M03-03 | Full raw/nested fields, current segment, live volume/start snapshot and once-only terminal meaning remain; extra first-start/listening/history fields are forbidden. |
| M03-04 | Real public root/wildcard routes, rail/history/feature disable and both managed/legacy branches retain actual departure Cancel/Leave and observer teardown. Helper-only or omitted-startup evidence fails provenance. |
| M03-05 | Running/paused/ended new-document and complete owned-process close/relaunch with same profile retain exact PID/loader/source, no-autoplay and no false remount proof. |
| M03-06 | Actual fullscreen enter/Escape/exitFullscreen preserves execution; running/paused End and ended Dismiss require distinct observable commands and phase labels. |
| M03-07 | A/locked/B/A, generation/tombstone, synchronous first frame, held A lock with B usability and pending command/retry/export/audio continuations retain full managed proof and stale-callback controls. |
| M03-08 | Two real documents/native locks/storage, all stale commands, concurrent expiry/end, one terminal revision and fresh usability remain. Same-document duplicates/stub locks cannot qualify. |
| M03-09 | Each actual command read/write/remove boundary, false versus throw, corrupt/unknown/foreign/denied/no-lock/absent/null and repaired/stale-event source remain. SC-R1/2 require precise export versus mutation and conversion-failure branches. Impossible effects need exact source proof, not blanket N/A. |
| M03-10 | Default-policy AudioContext, trusted gesture, rejection/nonsettling4s/retry/late success/deadline gain/disposal retain actual emitter controls; no autoplay-bypass or hardware certification. |
| M03-11 | Three distinct real emitters retain full actual disk bytes/filename/hash, five draft fields/latest editor, setup faults, owner changes during serialization/append/click, missing/wrong disk and forced loss. SC-R1 must preserve recovery under the correct per-emitter predicates. Requested download never proves saved bytes. |
| M03-12 | Deletion/generations/tombstones/late-write refusal and B/device/unassigned preservation, optional/coercible supplied-field migration and active-null-only remain. Complete registry-action classification is retained; SC-R3 closes event/caller compatibility. |
| M03-13 | Actual CmdK prefs scene/sound module jumps and consumer/key census remain; no active-history/Statistics/bus consumer inferred and unavailable never becomes known empty. |
| M03-14 | Full actual host/CSS EN/ZH375/414/768/1024/1440, real200percent zoom, all applicable player/error/disclosure states,44px new targets, pet-hidden after resize/pet-on, containment/hit/overflow and independently inspected pixels remain. |
| M03-15 | Full-shell forward/reverse Tab, trusted Enter/Space once/Escape, every focused/moved-on stop, injective DOM/AX, pipe/K-1 and passive isTrusted capture remain. No synthetic dispatch/outline/rectangles/adjacent-only substitute. |
| M03-16 | Full16 plus canonical E1-E25/E24/Rules, source/before/fixed/integrated/affected/vendor/fresh acceptance lineage and quiescent immutable artifact index remain mandatory; missing identity or unjoined stream refuses. |

Q-M01 through Q-M16, cross-cutting Q-A1 admission, Q-A2 loaded closure, Q-A3 ALL inherited A01-A14 synchronous/native property/ReactDOM acquisition, Q-A4 actual child/stream/finalizer faults and Q-A5 actual forced loss remain mandatory. Healthy and cause-specific negatives must run through real source emitters under later admission; parser-result tampering is auxiliary. No screenshot was rejudged and no control executed here.

## Finite paths, registry and proposed resource limits

All11 original conditional Meditation paths and23 AV9/RS8/EX6 candidates remain finite proposals; every exact path/purpose is retained verbatim below and checked from the actual source tables. The18 machinery source-role basenames likewise remain proposals, including declaration manifests, builtin-first run-unit, actual host, HTTP, acquisition, native/semantic/visual/command/oracle/control/qualification and source receipt. No timing/lock/schema/account-policy/global-hook/registry/sharedCSS/config/lockfile/source-original edit is granted. EX is caller authorization only; RS is shared preference-only prerequisite, not account deletion.

The entire actual explicit registry was matched by key, owner, category and proposed flag against Appendix RESET. Its dispositions preserve execution/entities/saved filters/weather and proposed entries, distinguish configuration/layout prefs and stub integration/premium flags, and exclude unknown/open-ended/foreign/old-generation data. That registry census is not mutation authorization. Current removePref returns false and may synchronously notify observers; report and owner-change truth cannot be inferred from absence or exception-only handling. SC-R3 requires the missing seven-event mapping. Default/override component lane and actual App reachability remain distinct.

Proposed interfaces runUnit/acquireDocument/flush/dispose/startManagedHttp/runNativeCase/runSemanticCase/captureVisualFocus/runCommandLane/judgeCase/runQualification are source-local promises and schemas, not existing exports. The ten explicit modes have no default/all; mixed wrappers reserve every permanent purpose. Before/fixed/integrated/affected use their own exact immutable source and cards. Every case/artifact/terminal receipt must retain actual producer, source, scope/auth generation, loader/profile/PID, raw events, artifact identities and closure status.

New ceilings are proposed maxima only: overall900s; archive90/dependency120/config15/build120/server45/bootstrap45/SDK45/document45; semantic30/native90/calibration120/capture30/artifact-write30/cancel10/drain20/finalize15 seconds; each stdout/stderr64MiB, journal64MiB, download8MiB, aggregate2GiB, at most2 owned Chrome processes/2 business documents plus1 HTTP/1 Vite server. Effective bound is min(inherited limit,new ceiling,remaining overall). Full matrices may split only into separately reserved finite invocations. Over-limit needs reviewed amendment, never truncation, retry or inherited allowance expansion.

## Methods, permanent history and downstream gate

Actual loaded browser/Vite/exports/transforms/optimized/dynamic/service-worker/CSS/fonts/assets/ReactDOM/SDK/config closure and immutable existing root capture must be bound. Version strings/installed-tree hashes/source prose are insufficient. Builtin-only bootstrap must validate root single-use typed reservation before imports, use exclusive realpaths, register every child/task/write/stream, enforce finite bounds, cancel and reap owned identities, drain both streams and join finalizers before sealing. Promise.race does not cancel. Independent post-close durable receipt is required; unknown descendants remain QUARANTINED_UNJOINED/UNKNOWN. No deliberately refusing placeholder runner or source-qualified claim is accepted.

All original preparation/review failures and later documentary passes remain immutable; all full historical commands, ten logs, duplicate artifacts,13 named-file comparisons and unknown-purpose classifications are retained in the complete appendix. The13 pairs are named-file applicability only, not whole host; logs are not launches. Author durable autoplay-bypass/DOM evidence remains distinct from independent genuine-default/trusted Retry. No original accepted MED01/02 proof is retroactively rejected or promoted to full MED03.

Permanent history includes meditation initial95/failing94of95/isolated13/three author95/three independent95/collision probe/later112,117,134; author native47047/47093 and missing earlier stall; independent native50081/50172 with duplicate logs; setup.ts no-suite failure then134of16; mounted two-download recovery plus unstyled probe/Controls correction; storage126 and lifecycle6 separately. Full lifetime classifications remain unknown, never fresh0of3. New semantic source purpose does not reset package/native/host/AV/RS/EX families.

Retention3of3,145checks/41of42 and last55checks/14of14 are not qualification; visual3of3, Q1focus1of3/other six0of3, development2/83, B70native12/6432/development40/4884, focusEN2/ZH2, F1formal2/180/development3/302, M8/REL unknown histories and closed production canonical activation remain. Five-row shared design adoption is not method qualification. Missing SDK/ReactDOM/config/forwarding/root capture and unknown/exhausted budgets hold only dependent work. No fourth author/measurement attempt, budget reset or caller waiver follows.

After a fresh bounded source-contract correction and WHOLE independent review, root may adopt exact hashes only. Actual complete source materialization with required bytes/root capture and independent source review must precede full method qualification, fresh independent qualification review/root adoption and complete valid original P0 before. Only then may a fresh bounded implementation author repair reproduced needs. Independent unchanged-oracle fixed AND integrated/affected/native/visual/trusted-key/account evidence, complete canonical G1 actual judging copies, actual different-vendor verification, fresh uninvolved Astra FULL original acceptance, root append-only evidence reconciliation with unchanged formal states, and inventory/remote original preservation/integration ancestry/sync remain required.

E1-E5 precede implementation; E25 is last; every E1-E24 identity is required. Clock IDs remain Clock proof or explicit valid reuse/prerequisite, never renamed MED proof. Full E15 sixteen F1/E16c1-c5/E17 Header fixed/P0 host5/5+5/5+2/2/native18/Astra/Sol, E24 callers, C-FB002/OE/C-RD1 judging versus C-FD1 observational, original failures, K-1/pipe/trusted drags and strict refusal/capacity copies remain. E19/E12 bound native exclusions. The complete canonical section is reproduced within the verbatim full proposal appendix and compared with its original source.

## Current execution, costs and limits

Review1/3; exactly one actual standard-library/Git documentary static checker. It reads and validates every inherited input and all explicitly indexed source/output identities, then constructs BOTH complete UTF-8 output buffers before any output write. Real static failure stops without retry. The checker command is python3 -u - with the exact here-document in the tool transcript. Its actual PID, owned git-cat-file PID/drain/exit, tool chunks/session/final exit and output hashes are provided externally. No self-referential output hash is embedded.

Current runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children/push/globalwrites/historical-reruns are all0. Requested role is not billing evidence; token/currency usage unavailable, not0. Read-only discovery included absent guessed hook/session/Settings paths and combined truncated output; corrected paths/narrow reads were used. Those are disclosed discovery errors, not launched checkers or product probes. No product/test/runner module was imported or executed.

A PASS of documentary preservation does not change the semantic REVISE verdict. No root adoption, source qualification, implementation grant, caller/business PASS, READY_TO_SHIP, formal312 closure, production activation, deployment or release is claimed. Exact staging and one hook-disabled commit preserve the two ADD files only; no amend/push or other-writer changes.

## Complete output-MD identity coverage

Every row below is explicitly indexed at its original, integration, I and P SHA; aliases do not substitute for one another. The source document never indexes its own output, so this review adds that identity itself. Historical manifest counts are measured from their full actual lists, not assumptions about extracted path subsets.

| Complete MD path | Original SHA | Integration SHA | SHA-256 | Bytes |
| --- | --- | --- | --- | --- |
| docs/reviews/audit-parallel-med03-preparation-r1/contract.md | 23bd8545b317e2d5565ad069aaabd0e65061737b | bf85a6b7677293d3c725e47edec6f6f9ee26bf40 | e4e4aa66c6e2e0fe1e93f2c695296f419fd7ae5b0981a8c5589367326beb0ee2 | 57442 |
| docs/reviews/audit-parallel-med03-contract-review-r1/review.md | a87f90c40490e3ac02d392fe9f89aa038e439ec5 | 711cfd8d7a587468d4ff133eb6d5911ad4dd79ef | 3bf64d35f46ab5b78d866d68bcd3a7976014b94425aea8b0c68b4a26e5a27d5c | 21934 |
| docs/reviews/audit-parallel-med03-preparation-r2/contract.md | 1e2d0ac42ecdc142c34291294fca09bce1f77dae | 0055fb42bf2e36de487a10654128522d5ef62ce3 | 64ed396106490e9ac5b4dbcbedb4e89b5c8ade9a9c56ae412d9d503ca9aaab7a | 65084 |
| docs/reviews/audit-parallel-med03-contract-review-r2/review.md | 291a4175d9ea237451bec9fe87cd9fc6cc736de7 | 4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d | 3c3d4fc457c259f67d6fa6fc0f21d4989ed23207f283c77f0437df38a83db39f | 37362 |
| docs/reviews/audit-parallel-med03-source-machinery-impact-r1/impact.md | 5a8d7141d8e032ae08c56a7650cdf47597d717ff | f8cc150544e050bbb8f38076b1e5d3c41ca47fac | d0740a7188a0086d25b015e594525913da74d1021bec143ba3f13005b4139ede | 150193 |
| docs/reviews/audit-parallel-med03-source-machinery-impact-review-r1/review.md | 30e0a903196db8b11c3f30cc02f173bfe2a4bffd | aed09103a71c7e939ffc71d23c7b9b802ac47b51 | 469dd5e8083bd405168cbb9a411dd75bd515b3bcf648dcb9362f645911e1c22f | 37338 |
| docs/reviews/audit-parallel-med03-source-contract-r1/contract.md | dc9f0046c431d1357d947884c282a53a6e257f30 | b643171fa4ef7a17a7c1cd6cde4c6dea1a509588 | e650b8b269cf4d85533bcd2638ea04a215afc53bb62983ff07023c048a2a5914 | 313900 |

## Actual complete documentary coverage receipt

The following data is derived from the whole actual source lists. Input hashing is byte coverage, not pixel adjudication or semantic re-execution of every dependency. Registry counts do not grant paths. All original and historical counts/failures in the appendix remain attributed to their own receipts.

{
  "inherited_manifest_counts_actual": {
    "preparation-r1": 649,
    "contract-review-r1": 688,
    "preparation-r2": 737,
    "contract-review-r2": 803,
    "source-machinery-impact-r1": 1216,
    "source-machinery-impact-review-r1": 1307,
    "source-contract-r1": 1697
  },
  "unique_indexed_identities": 2069,
  "total_indexed_bytes": 51177809,
  "original_items": 312,
  "formal_counts": {
    "completed": 13,
    "verification_pending": 3,
    "in_progress": 3,
    "pending": 293
  },
  "original_evidence": 933,
  "current_evidence": 939,
  "normalized_modules": {
    "web": 213,
    "app": 22,
    "plugin": 16,
    "sync": 41,
    "admin": 16,
    "site": 4
  },
  "literal_original_modules": {
    "web": 174,
    "web\uff08project-system\uff09": 30,
    "app": 22,
    "plugin": 16,
    "sync": 41,
    "admin": 16,
    "site": 4,
    "web\uff08\u8de8\u6a21\u5757\u9a8c\u8bc1\u7d22\u5f15\uff09": 9
  },
  "reversible_label_changes": 39,
  "nonempty_gate_obligations": 150,
  "TODO_gated_policy_population": 118,
  "MED_rows_actual": [
    "M03-01",
    "M03-02",
    "M03-03",
    "M03-04",
    "M03-05",
    "M03-06",
    "M03-07",
    "M03-08",
    "M03-09",
    "M03-10",
    "M03-11",
    "M03-12",
    "M03-13",
    "M03-14",
    "M03-15",
    "M03-16"
  ],
  "original_conditional_paths_actual": [
    "packages/xai-web-meditation/docs/design.md",
    "packages/xai-web-meditation/docs/api.md",
    "packages/xai-web-meditation/docs/test.md",
    "packages/xai-web-meditation/docs/dev_log.md",
    "packages/xai-web-meditation/src/MeditationModule.tsx",
    "packages/xai-web-meditation/src/MeditationPlayer.tsx",
    "packages/xai-web-meditation/src/internal/sessionController.ts",
    "packages/xai-web-meditation/src/internal/useAmbientAudio.ts",
    "packages/xai-web-meditation/src/styles.css",
    "packages/xai-web-meditation/src/__tests__/MeditationModule.med03.test.tsx",
    "packages/xai-web-meditation/src/__tests__/MeditationPlayer.med03.test.tsx"
  ],
  "additional_conditional_paths_actual": [
    [
      "AV1",
      "packages/xai-web-meditation/src/internal/useMeditationPrefs.ts"
    ],
    [
      "AV2",
      "packages/xai-web-meditation/src/internal/prefsSource.ts (ADD)"
    ],
    [
      "AV3",
      "packages/xai-web-meditation/src/__tests__/MeditationPrefs.med03-source.test.tsx (ADD)"
    ],
    [
      "AV4",
      "packages/plugin-web-storage/src/index.ts"
    ],
    [
      "AV5",
      "packages/plugin-web-storage/src/__tests__/meditation-source-public.test.ts (ADD)"
    ],
    [
      "AV6",
      "packages/xai-web-persistence-contract/docs/design.md"
    ],
    [
      "AV7",
      "packages/xai-web-persistence-contract/docs/api.md"
    ],
    [
      "AV8",
      "packages/xai-web-persistence-contract/docs/test.md"
    ],
    [
      "AV9",
      "packages/xai-web-persistence-contract/docs/dev_log.md"
    ],
    [
      "RS1",
      "packages/plugin-web-settings-shell/src/internal/resetAllPrefs.ts"
    ],
    [
      "RS2",
      "packages/plugin-web-settings-shell/src/SettingsFooter.tsx"
    ],
    [
      "RS3",
      "packages/plugin-web-settings-shell/src/__tests__/resetAllPrefs.rel10.test.ts (ADD)"
    ],
    [
      "RS4",
      "packages/plugin-web-settings-shell/src/__tests__/SettingsFooter.rel10.test.tsx (ADD)"
    ],
    [
      "RS5",
      "packages/plugin-web-settings-shell/docs/design.md"
    ],
    [
      "RS6",
      "packages/plugin-web-settings-shell/docs/api.md"
    ],
    [
      "RS7",
      "packages/plugin-web-settings-shell/docs/test.md"
    ],
    [
      "RS8",
      "packages/plugin-web-settings-shell/docs/dev_log.md"
    ],
    [
      "EX1",
      "packages/plugin-web-settings-rest/src/panes/accountPane.tsx"
    ],
    [
      "EX2",
      "packages/plugin-web-settings-rest/src/__tests__/accountPane.med03-export.test.tsx (ADD)"
    ],
    [
      "EX3",
      "packages/plugin-web-settings-rest/docs/design.md"
    ],
    [
      "EX4",
      "packages/plugin-web-settings-rest/docs/api.md"
    ],
    [
      "EX5",
      "packages/plugin-web-settings-rest/docs/test.md"
    ],
    [
      "EX6",
      "packages/plugin-web-settings-rest/docs/dev_log.md"
    ]
  ],
  "machinery_roles_actual": [
    [
      "contract.md",
      "Complete16-row/original action mapping, modes, phase limits, admission and protected boundaries."
    ],
    [
      "inputs.sha256",
      "Immutable source/dependency/authority identities; full inherited manifests, no circular output hash."
    ],
    [
      "cases.json",
      "All16 parent rows and finite named subcases with explicit oracle, controls, purpose, expected before classification and emitter."
    ],
    [
      "dependencies.json",
      "Requested/resolved SHA, lockfile, package exports/conditions, consumed build/SDK/ReactDOM/startup/CSS/assets and exact root envelope references."
    ],
    [
      "purpose-history.json",
      "Actual commands/modes/processes/duplicates/refusals/probes/unknown counts and root-resolved remaining allowance; never a self-issued admission token."
    ],
    [
      "run-unit.mjs",
      "Builtin-only bootstrap/supervisor, typed root receipt checking, no-clobber capture, time budgets, child/stream/write registry, quiescent sealing."
    ],
    [
      "host.html",
      "Real root element and prelude-before-product entry; no fake App/ready marker."
    ],
    [
      "host-entry.tsx",
      "Actual main startup/StrictMode/AppProviders/Router public host composition and untouched-main correspondence control."
    ],
    [
      "managed-http.mjs",
      "Source-bound disposable SDK transport fixture, declared endpoint schemas and real HTTP logs; no SDK/provider replacement."
    ],
    [
      "acquisition.mjs",
      "Preimport owner/DOM/native-property/departure/storage/audio observation with transparent single delegation and restore proof."
    ],
    [
      "native-driver.mjs",
      "CDP pipe/trusted actions/two-document/profile/reload/process/fullscreen/default-audio scenarios and real disk acquisition."
    ],
    [
      "semantic-fixture.tsx",
      "Narrow auxiliary deterministic elapsed/field/codec/command specimens; explicitly not actual-host or native acceptance."
    ],
    [
      "visual-focus.mjs",
      "Actual host/full CSS bilingual widths/real zoom/qualified synchronous first-frame and focus successor binding; no invented visual PASS."
    ],
    [
      "command-lane.mjs",
      "Exact inherited package/host/storage/G1 commands and source guards; refuses unknown/exhausted family before spawn."
    ],
    [
      "oracle.mjs",
      "Independent expected timing/field/raw bytes/history-free/download/owner checks and no silent row omissions."
    ],
    [
      "qualification-controls.test.mjs",
      "Real emitter positive/cause-specific negative pairs, finite subcases below, no import-time execution."
    ],
    [
      "qualify.mjs",
      "Admitted control driver through the actual supervisor/fixture/emitter paths; no synthetic result-only qualification."
    ],
    [
      "source-receipt.md",
      "Source-only coverage, complete role mapping, exact gaps/holds, output hashes supplied externally."
    ]
  ],
  "registry_rows_actual": 87,
  "historical_log_paths_actual": [
    "docs/reviews/20260908-full-product-audit/timer-test-existing.log",
    "docs/reviews/web-meditation-durable/20260909-native.log",
    "docs/reviews/web-meditation-durable/20260909-storage-tests.log",
    "docs/reviews/web-meditation-durable/20260909-tests.log",
    "docs/reviews/web-meditation-independent/native.log",
    "docs/reviews/web-meditation-independent/runner.log",
    "docs/reviews/web-meditation-independent/test-runner.log",
    "docs/reviews/web-meditation-independent/tests.log",
    "docs/reviews/web-save-consumer-inventory/20260909-med-reproduction.log",
    "docs/reviews/web-save-consumer-inventory/20260909-native-med-after.log"
  ],
  "applicability_pairs_actual": [
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/xai-web-meditation/src/internal/sessionController.ts",
      true
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/xai-web-meditation/src/internal/useAmbientAudio.ts",
      true
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/xai-web-meditation/src/MeditationModule.tsx",
      true
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/xai-web-meditation/src/MeditationPlayer.tsx",
      true
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/xai-web-meditation/src/internal/useMeditationPrefs.ts",
      true
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/xai-web-meditation/src/internal/accountMigration.ts",
      true
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/xai-web-meditation/src/types.ts",
      true
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/plugin-web-storage/src/internal/accountScope.ts",
      false
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "packages/plugin-web-storage/src/internal/accountDataLifecycle.ts",
      false
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "apps/web/src/App.tsx",
      false
    ],
    [
      "6887879f40be24d7b531f858366b5bc0481cb335",
      "apps/web/src/providers/AccountStorageGate.tsx",
      true
    ],
    [
      "da35b3b8175565f5e99ab9f88da2a788889494d4",
      "packages/xai-web-meditation/src/MeditationModule.tsx",
      false
    ],
    [
      "da35b3b8175565f5e99ab9f88da2a788889494d4",
      "packages/xai-web-meditation/src/internal/useMeditationPrefs.ts",
      true
    ]
  ],
  "source_contract_bytes": 313900,
  "source_contract_sha256": "e650b8b269cf4d85533bcd2638ea04a215afc53bb62983ff07023c048a2a5914",
  "source_manifest_bytes": 281317,
  "checker_pid": 41946,
  "owned_cat_file_pid": 41957,
  "owned_cat_file_exit": 0,
  "static_check": "PASS documentary identity and preservation; semantic verdict REVISE"
}

## Appendix - complete reviewed source proposal, verbatim

# MED-03 exact source contract r1

**PROPOSED / UNADOPTED. Complete technical source contract; no product, machinery, qualification, runtime or acceptance grant.**

## 1. Authority and exact scope

Module web, workflow A; fresh independent author /root/parallel_a_med03_source_contract_r1. Direct parent e8b29df83f34fc13a55a04d78c3db2002b2d5fb6; fixed input aed09103a71c7e939ffc71d23c7b9b802ac47b51; product P0 f9eb4b1f207bc4b46f547b90afc250424b3c8695. Worktree /Users/lijinlong/.codex/worktrees/audit-parallel-med03-source-contract1-20261010/XAI_Desktop. Root registration is execution-state.tasks LIST entry MED-03/SOURCE-CONTRACT1 and its exact task card, not the original registry. Requested Astra denotes dispatch role, not independently attested provider/model billing or different-vendor verification.

Only contract.md and inputs.sha256 in docs/reviews/audit-parallel-med03-source-contract-r1/ are ADD-authorized. All other paths, existing evidence/failures/contracts/runners/tests/CSS/storage/schema/account/host/config/lockfile and global controls/ledgers/inventory are protected. No children, push, merge/rebase, promotion, release/deploy/D3. Root owns remote preservation, integration and ordinary sync-check; no child pnpm execution. Full AGENTS/CLAUDE/workflow/multi-machine/goal attachment/authority overlay and control-plane are immutable inputs.

Root adopted the WHOLE conditional technical basis at 5a8d7141d8e032ae08c56a7650cdf47597d717ff plus 30e0a903196db8b11c3f30cc02f173bfe2a4bffd only. This new source-contract phase is author1/3, not a restart of earlier proposal/source/review budgets. All definitions below, including API/signatures/source predicate/schema/lifecycle/path/resources, need fresh WHOLE independent review and root exact-hash adoption before any later grant. Full adopted source2/review2, impact and independent impact review appear verbatim below; historical UNADOPTED wording preserves the state at its own date.

The original Chinese action and acceptance are reproduced without change in the appended source2 and original-item payload. Scope stays all16 M03 rows, full11 original +23 additional conditional paths and18 machinery candidates, ten log artifacts, thirteen source applicability comparisons, full canonical Clock section14 E1-E25/E24/Rules. Full1307/1216/803/737/688/649 immutable corpora are inherited, not sampled. Hashing is byte coverage, not visual adjudication of historical pixels or semantic reinterpretation of every dependency.

## 2. Normative owner and behavior contract

One account-owned, device-local running/paused/ended execution row at xai_meditation_active remains until explicit Dismiss. Running absence counts; paused absence does not; fixed expiry clamps at the original deadline exactly once; manual End uses issued command time with rollback clamp. Start after dismissal has a new id, revision0, elapsed0 and then-current preferences. No history list, archive, original-start timestamp, actual listening time, replay counter, pause/departure log, statistics aggregate, background execution or new owner policy. runStartedAt is only the latest running segment. Complete persisted fields and nested preferences in appended source2 remain normative.

Reopening is silent. Open running is an explicit user audio-consent action subject to default browser policy; Open paused remains silent until Resume. Ended cannot resume elapsed time. Live Player volume follows current preferences, while row.prefs.volume remains the immutable start snapshot. In-player End/Exit on an already-ended row currently dispatches Dismiss; disclosure and actual command must agree that the sole saved row is removed. Native fullscreen exit/Escape alone only changes presentation.

The actual public route is main.tsx startup -> StrictMode/AppProviders/RouterProvider -> protected App -> AccountStorageGate/AccountDataGate -> feature-gated MeditationSlotHost -> route-local MeditationModule. Actual service-worker and observability startup remain. PomodoroSessionHost is persistently mounted; Meditation is not. Route unmount removes its observers/timer/audio; durable execution remains and reconciles upon return. Same-document remount, new loader/document and complete Chrome process exit/relaunch are distinct cases. No global Meditation host is proposed.

## 3. S-MED exact proposed read-only source API

Proposed local file AV2 exports readMeditationPrefsSource(scope: AccountScope): MeditationPrefsSource and subscribeMeditationPrefsSource(scope: AccountScope, invalidate: () => void): () => void. These are module-internal exports, not a new package public API. AV4 adds only the existing subscribeSameTab barrel export; its source signature is subscribeSameTab(key: string, listener: (value: unknown) => void, scope?: AccountScope): () => void. Same-tab values are advisory, never the source receipt. No private cross-package import or generic hook/setter/bus/codec/ownership modification.

MeditationPrefsSource is readonly and discriminated: valid {status, scope, physicalKey, raw:string, value:MeditationPrefs}; absent {status, scope, physicalKey, raw:null, value:MeditationPrefs}; invalid {status, scope, physicalKey, raw:string, reason:json|shape|version, value:MeditationPrefs}; unavailable {status, scope, raw:undefined, reason:ssr|locked|owner-changed|deleted-or-scope|read-denied}. physicalKey is absent when key derivation failed. value on invalid is a display-only normalization, never mutation authority; unavailable has no value/physical source claim. Error reason is diagnostic, never secret/raw data in UI. These TypeScript shapes are proposals, not present exports.

Read algorithm: SSR returns unavailable without touching window; capture supplied scope and assert current/ready; derive the existing physicalKey (including its existing tombstone check); directly read localStorage.getItem once within try; reassert same scope and derive/check the physical key again before publishing. Any access/owner failure returns unavailable and discards the stale payload. Scope object identity/epoch plus kind/accountId/generation belong to the snapshot; auth generation is a separate acquisition field. No new marker/owner proof is invented and no read is a transaction with a future cross-document write. Canonical field values and raw bytes come from that same sampled read, not a hook cache or event payload. Authoritative operation reads occur again at the real operation boundary.

Classification predicate is exact: raw === null means absent and normalized defaults; invalid JSON means invalid/json; parsed null, primitive or array means invalid/shape; a non-null non-array object with schemaVersion absent, or Number(schemaVersion) in [1,2,3], means valid with validatePrefs(parsed); other present versions mean invalid/version. Supplied malformed known fields in a supported object still follow unchanged validatePrefs normalization (clamps/defaults/filtering); source availability must not import the stricter migration equality predicate. Schema-less partial {}, supported numeric/string/coercible versions including true ->1 where actual Number does so, and supported objects with normalized fields stay compatible. Unknown fields do not become a history schema and normalization itself writes nothing. Parsed fallback-only shapes retain the existing display normalization but cannot authorize overwrite/Start. This new admission distinction is explicitly proposed and subject to whole review; it is not claimed as an already-deployed writer rule.

Migration remains EXACT original R2: non-null non-array object, optional/coercible supported version, every supplied non-version value recursively equal to validatePrefs(raw)[key]; active migration null only. E.g. a clamped supplied duration can be readable/normalized yet fail migration; no equality-to-full-default requirement. Strict active-session validation remains the controller's own version1/owner/prefs/id/revision/phase validator. Unknown active schema, foreign owner, malformed bytes, read denial and missing native locks never become known empty.

Subscription algorithm: subscribe current scope to unchanged public subscribeSameTab; observe native storage (matching physical key OR key null clear, with storageArea access guarded), accountScope changes, pageshow and visible-return. Every notification calls a reread, never writes or retries. On scope invalidation invalidate synchronously and dispose old observation; new scope gets a new binding. Capture source before first render, use a stable cached snapshot per observed source for useSyncExternalStore, compare scope on getSnapshot so previous-owner value cannot survive one synchronous render. No object allocation loop in getSnapshot. SSR snapshot is stable unavailable. Unsubscribe is idempotent; no leaked listeners/timers; an event after disposal has no effect. Actual first-frame transparency, reentrant subscriber behavior and native-property forwarding need qualification, not just a hook test.

AV1 keeps the tuple [prefs, commit, recovery] and existing full-value commit(next, replacePending=false):boolean, recovery.failure/retry/discard/snapshot behavior; adds recovery.source and recovery.refreshSource():MeditationPrefsSource only. source Retry performs a read, zero writes/removes/bus mutations, preserves original failed proposal/error/baseline/editor drafts. A repaired source does not auto-commit. Immediately before Start, commit, write Retry and export, capture/validate the current source/lifetime. Valid/absent admit existing mutation path; invalid/unavailable refuse without replacing a pending baseline or losing the proposed value. Source availability and old write/conflict/account failure remain separate channels. Unknown baseline remains unknown (not proof of null absence); retry can proceed only under the existing reviewed conflict rule, never overwrite a different observed raw string. Discard clears only mounted proposal, not stored bytes/source error. No new durable draft or automatic replacement consent.

Module passes the coherent source.value to new Start, not a stale render's prefs, and preserves all current live preference consumers. Active row start snapshot is not rewritten when preference source changes. During unavailable preference source, existing execution duration/state stays controller-owned; recovered live volume must use valid current-owner data rather than cross-owner stale cache. No source repair may silently change execution state or create audio. Explicit source Retry is a new declared focus stop with bilingual unavailable/invalid disclosure; local CSS only within the original conditional path.

## 4. Exact export and lifecycle boundaries

R1 has two existing channels: session.error already renders exportFailed beside session export; recovery.failure separately renders preference export failure. Both must be observed. No duplicate error-UI repair is implied. R3 file meditation-unsaved-draft.json has exactly version=1, kind=meditation-unsaved-draft, snapshot=pending.current.value, sceneDraft=latest mounted editor and fixedDurationDraft=latest mounted editor. It carries no committed backup, baseline raw string or importer. Forced reload/crash can lose it; Cancel/Stay preserves memory; permitted Leave loses memory without changing the prior durable row.

Session recovery file meditation-session-recovery.json equals the captured raw string verbatim, or literal null only for confirmed absence; read denial is unavailable. Account export keeps exportAccountLocalData(capturedScope) semantics, including its ability to export that captured owner's current generation after auth changes. EX1 changes only current caller admission/lifetime if qualified before reproduces a needed repair. Scope/id/revision/lifetime token is captured by each invocation, checked after serialization/URL/append and immediately before invoking native click, with all owned URL/node cleanup joined. Reentrant owner change inside Blob/URL/append must refuse. A native-click/default-action boundary with owner mutation must be measured through real forwarding qualification; do not promise atomicity across arbitrary instrumented native calls or recall after dispatched download. Post-click result is Download requested, never Saved. Disk receipt is an external test oracle, not a product success acknowledgement.

All3 actual emitters require actual downloaded bytes, filenames, raw disk paths and hashes, plus missing/wrong file, Blob/URL/append/click setup failure, owner change, denied reads, latest draft, and forced loss at serialization/dispatch/ack boundaries. Old save error and raw bytes remain on export failure. Parent-controlled fixture faults happen at real platform entrypoints and must record single native delegation/cleanup; mutating result JSON is no substitute. Scope mismatch refuses old UI update/audio/writes, while ordinary captured-owner export library tests retain their authorized semantics.

UI callback fencing is a conditional proposal restricted to existing Module/Player/audio/controller candidate paths: mount lifetime monotonically invalidates on unmount/scope or displayed session identity replacement; capture expected scope/session/revision and lifetime before awaiting a command; after await, check still-mounted identity and command result before play/exit/setState. Audio graph revision/cancel/disposal remain authoritative; no controller timing or lock rewrite. Test actual delayed command and late AudioContext resume after unmount/A->B/new row. Controller locks do not by themselves fence post-await UI. New source-derived risks are predictions until qualified before reproduces them.

## 5. REL-10 exact preference-only proposal and reachability

RS1 keeps resetAllPrefs callable with zero arguments and existing index re-export. Proposed return is an inferred readonly report {ok:boolean, removed:readonly string[], failed:readonly {key:string, reason:false-result|exception|owner-changed}[], skipped:readonly string[]}; old void-ignoring callers remain valid, SettingsFooter onReset?:()=>void is unchanged and never interpreted as a result. RS2 inspects the report only for its default branch, rendering failure/partial truth, preserving confirmation and caller override invocation once. No public types/index additions beyond the already named candidate surface are assumed.

Appendix RESET enumerates every fixed registry key, owner/category/proposed flag and finite proposed disposition; no category===pref shortcut. Preferences/layout choices may be reset; execution, records, saved user content, entity-attached saved filters and proposed entries remain. Stub integration/premium state is explicitly a resettable preference per registry's comments, never real OAuth/entitlement deletion. Unregistered keys/auth/secrets, future unknown registry entries and foreign/old generations are excluded. Existing removePref ownership routing is retained; capture scope at operation start, stop on current-owner change, do not continue into B; no shared account algorithm changes.

For each eligible key require removePref return true, observe false versus throw truthfully, preserve failed raw value and report partial rather than all-saved. Existing canonical default events must not falsely advertise a failed key reset: emit a default only for its corresponding successful reset, preserving exact canonical value payloads; no new event types. These report/event changes require compatibility review and valid before; they are not implemented. Complete raw before/after census covers both Meditation keys and B/device/unassigned sentinels. Device preferences explicitly eligible for a settings reset are intentionally reset, while non-target device data remains; account deletion has a different preserve-device oracle.

Source search finds SettingsFooter only as its public component plus tests; AppearancePane uses its own AppearanceActions onReset, not this default footer. SettingsModule does not instantiate SettingsFooter globally. Thus utility/default component is a real API lane, but no actual public App default-reset reachability is proved. Do not add a production reset button or change accepted Appearance reset just to enable evidence. Future real-host census must confirm every actual caller/override; absence gets a source-qualified non-reachability disposition, not an App-reset PASS. Shared API tests and standalone actual exported component remain explicitly auxiliary; MED retention claim remains conditional on REL-10 acceptance and exact applicability.

## 6. Finite source interfaces, modes and resources

All11 original and23 AV/RS/EX candidate paths, plus18 machinery basenames/roles, are frozen exactly in the full impact appendix. They are PROPOSAL ONLY, not writes granted here. No root/global/SDK/accountScope/registry/validator/config/lockfile/sharedCSS changes. No wildcard product or output scope. Actual source writer must supply complete implementations, not deliberate refusal placeholders; this document supplies contracts while actual consumed byte/root-capture holds are resolved independently. Source-qualified is never claimed from this document.

Future machinery's exported interfaces are: runUnit(cardPath, mode):Promise<TerminalReceipt>; acquireDocument(context):Promise<AcquisitionHandle>; AcquisitionHandle.flush():Promise<void>/dispose():Promise<void>; startManagedHttp(config):Promise<{origin, requests, close:()=>Promise<void>}>; runNativeCase(caseSpec, context):Promise<CaseArtifacts>; runSemanticCase(caseSpec):Promise<CaseArtifacts>; captureVisualFocus(caseSpec,context):Promise<CaseArtifacts>; runCommandLane(invocation,context):Promise<ProcessReceipt>; judgeCase(spec,artifacts):CaseVerdict; runQualification(controlSpec,context):Promise<ControlVerdict>. All signatures are proposed source-local APIs; constructors/imports perform no product execution. Only run-unit bootstrap opens control capture, then imports adapters after admission. Production callbacks are observed, not replaced by these interfaces.

Exact CLI is node docs/reviews/audit-parallel-med03-machinery-source-r1/run-unit.mjs --card <immutable-root-card> --mode <one-enum>. Enum: source-selfcheck; qualify-host; qualify-acquisition; qualify-storage-export; qualify-audio; qualify-native-focus; business-before; candidate-fixed; integrated-fixed; affected-g1. No default/all. Source-selfcheck never launches app; qualify modes launch only root-admitted disposable controls; before uses P0; candidate/integrated require independently pinned full commits; affected-g1 uses exact canonical source copies and complete purpose reservations. Mixed modes reserve every exercised permanent unit. Every command is recorded before launch with argv/cwd/env-name-only, purpose/mode/actor/source, PID/start/parent/process group, stdout/stderr/exit/signal and end reason; copied logs are not new processes.

Case schema v1: id,parentRow,lane,mode,purpose,emitter,setup,actions,positiveControl,negativeControl,expectedDisposition,oracle,requiredArtifacts. Rows M03-01..16 are independently enumerated, not derived from emitter results. Artifact schema v1: invocation,caseId,producer,sourceSha,document/loader/profile/process identities,authGeneration,businessScope,actionSequence,monotonic/wall times,rawBefore/rawAfter,relativePath,sha256,bytes. Source field references name exact APIs and immutable files. TerminalReceipt: status PASS|FAIL|REFUSED|BLOCKED|QUARANTINED_UNJOINED|UNKNOWN, all-attempt cases, missing obligations, children/streams/writes join state, immutable sealed index, post-close receipt identity. PASS forbidden if any required row/artifact missing, stream incomplete, detached child uncertain, unknown request, failed cleanup or durable receipt missing.

Proposed new MED wrapper ceilings for review are overall900s per invocation; archive90s/dependency120s/config15s/build120s/server45s/bootstrap45s/SDK45s/document45s; each semantic case30s/native case90s; calibration120s; each screenshot/focus capture30s; artifact write30s; cancellation10s/drain20s/finalization15s. These are maxima, not guaranteed waits or a changed inherited limit: use min(existing frozen limit, new ceiling, remaining monotonic overall). Long complete matrices split into separately reserved finite invocations, never silently extend timeout or retry. Bytes: capture each stdout/stderr64MiB, journal64MiB, per raw download8MiB, aggregate artifacts2GiB, <=2 owned Chrome processes and <=2 business documents per invocation, one HTTP service, one Vite server. Measured archive streams with no invented legacy buffer increase; actual artifact needs exceeding ceilings require independently reviewed amendment, not truncation. At most one active case mutation per owner/resource; held-lock second-document scenarios are explicit exceptions with bounded release/drain.

Root-supplied card freezes actual paths, actual consumed dependency hashes, source/qualification/adoption receipts, finite subcase selection and numeric limits before launch. These proposed limits create no new budget allowance. Resources are MED account/generation prefs+active locks/audio, reset surface RS, caller-download EX, owned profile/server/ports/disk directories and actual native/menu method resources. Root serially reserves shared semantic resources across worktrees. Unknown history or exhausted method prevents only dependent execution, not documentary review.

## 7. Complete finite case and causal-control expansion

Appendix impact section6 supplies actual emitter and positive/fault pair for every16 row, retained verbatim. The following exact subcase sets refine that map; every named negative is executed against its actual emitter by qualify.mjs, with independent oracle detection and the healthy counterpart. Result-JSON tampering is only parser unit coverage. No subcase omission is hidden by one green parent row.

| Parent | Named subcases (finite expansion; all inherit matching Q-Mxx healthy/fault pair) |
| --- | --- |
| M03-01 | en-disclosure, zh-disclosure, start-pause-resume-end-dismiss-restart, ended-exit-removal; actual wrong disclosure/reused-id/early-remove specimens |
| M03-02 | preset, custom, infinite crossed with running-away/paused-away; fixed-before/at/after-deadline; rollback; independent known-time oracle and wrong-paused-expiry specimen |
| M03-03 | full-fields-start, pause-fields, resume-segment, manual-terminal, deadline-terminal-once, live-volume-versus-snapshot; actual extra-field/wrong-segment specimen |
| M03-04 | root-route, wildcard-route, rail, back, forward, feature-disable-enable, cancelled-departure, allowed-departure; each legacy and managed; omitted-startup/helper-only negative |
| M03-05 | document-running, document-paused, document-ended, process-running, process-paused, process-ended; same-profile/new identities/no-autoplay; false-remount/leaked-process specimen |
| M03-06 | fullscreen-enter, escape, exitFullscreen, running-end, paused-end, ended-dismiss; phase-aware labels; fullscreen-mutates-state negative |
| M03-07 | A-locked-B-A, deletion-tombstone, generation-change, held-A-B-usable, pending-start, pending-resume, pending-exit, pending-retry, pending-export; transient wrong-owner same-task and late continuation specimens |
| M03-08 | stale-start, stale-pause, stale-resume, stale-end, stale-dismiss, simultaneous-expiry-end, fresh-after-conflict; two documents/native locks; stub-lock/same-document negative |
| M03-09 | start/pause/resume/end/dismiss/reconcile crossed with read-denied/write-false/write-throw/remove-false/remove-throw where operation actually uses it; absent/null/bad-json/unknown-version/foreign/no-lock; prefs-repaired/stale-payload/native-clear/SSR; impossible effect marked source-inapplicable with exact branch proof, never blanket skip |
| M03-10 | trusted-start, no-gesture, resume-reject, nonsettling-4s, late-success-after-pause/unmount/scope/new-row, deadline-gain, dispose; default-policy only, bypass-flag refusal |
| M03-11 | session-raw, proposal-five-fields, account-manifest each healthy/Blob/URL/append/click-failure/owner-change-at-serialize-append-click/missing-disk/wrong-disk; session-denied/confirmed-null; proposal-latest-editor; forced-loss-before-dispatch/after-dispatch-before-ack |
| M03-12 | delete-A-preserve-B-device-unassigned, old-generation/tombstone, migration-missing/numeric/coercible-version, supplied-field-accept/reject, active-null-only; complete-reset-key-census, default-component, override-once/cancel, false/throw/owner-change; real-host reachable-or-source-proven-absent |
| M03-13 | cmdk-scene, cmdk-sound, consumer-key-census, no-history-statistics-bus, unavailable-not-empty; actual injected forbidden consumer/event negative |
| M03-14 | EN/ZH x 375/414/768/1024/1440 x normal/real200percent x disclosure/source-error/write-error/player; pet-hidden-after-resize and pet-on; wrong-DPR/occlusion/stale-resize negative; independent pixels |
| M03-15 | full-shell forward/reverse, each reached stop focus/moved-on, Enter/Space once/Escape, all source-retry/recovery controls; fake-input/collision/missing-outside/adjacent-only-ring/transient-value negative |
| M03-16 | full16/canonical-index, before/fixed/integrated/affected lineage, exact vendor/acceptance actor, stream/finalizer closure; missing-row/hash/wrong-source/forged-vendor/unjoined negative |

All source branches must have explicit active-phase variants; set algebra and emitted census are independently checked. Qualification-only deliberate fault specimens are disposable, never patched into product or accepted historical runner source. Q-A1 admission has malformed/replay/missing-envelope/path-escape/wx/unknown-budget controls; Q-A2 real loaded closure has wrong-root/dynamic-chunk/CSS/font/SDK/optimized/HTTP controls; Q-A3 includes ALL inherited A01-A14 native property/first-frame/reentrancy/ReactDOM forwarding controls; Q-A4 actually spawns timeout/late-stdout/late-stderr/late-write/delayed-descendant/cancel-close/final-durability specimens through runUnit; Q-A5 actual crash/reload/download uncertainty. Qualify these sources before using business-before. Transparent wrappers delegate native methods exactly once and preserve return/throw/this/descriptor semantics; observe source before any product import or synchronous publication.

## 8. Loaded source, native methods and terminal truth

Actual main composition, live non-null Supabase configuration, real ManagedAuthSessionProvider/SDK/coordinator, device REST and Todo nonce lease bridge remain. Mock-authenticated/config-null selects Legacy, never managed proof. Exact SDK endpoint method/path/query/header/body/response contracts must be derived from its consumed bytes and config. Already visible app nonce endpoint is POST /rest/v1/rpc/fn_grant_nonce_lease with p_account_id,p_key_id,p_count and encryption_device_id,lease_start,lease_end response; device register/heartbeat and auth endpoints retain actual transport/SDK semantics. Fixture denies external requests and unknown endpoints; swallowed nonce or recovery error cannot satisfy readiness. Do not invent the missing SDK request matrix. Actual SDK bytes/config remain a local source-author prerequisite, not a reason to generate an intentionally broken runner.

Freeze actual browser/Vite resolution, export conditions, transformed/optimized/dynamic modules, main startup, workers/service-worker, CSS/fonts/assets, ReactDOM and native input forwarding, SDK/config and tool dependencies plus exact root capture SOURCE. Version strings or installed-tree hashes alone cannot establish loaded closure. Requested/resolved full source SHA, streamed measured archive and lock hash df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9 remain. No install/shared dependency/main-checkout writes. Runtime-dependent source graphs are acquired only under later granted qualification, not claimed here.

Root outer envelope must exist before inner parse/import. Inner builtin-only bootstrap opens exclusive stdout/stderr/emergency/journal, validates immutable root single-use reservation and realpaths/symlinks before importing any app adapter. Real root capture bytes and retention are independent evidence, never worker self-authorization. Register actual archive/server/HTTP/Chrome/menu/tool descendants, tasks/writes/streams before starting them. Promise.race does not cancel. Stop/kill only owned PID+start-identity/process groups; await cancellation acknowledgements, child reaping, both stream close/drain, queued writes and all finalizers. Seal hashes only after quiescence; independent post-close durable receipt must follow. Late stderr/error/write or nonquiescent descendant forces failed/unknown quarantine, even after business assertions passed. Full actual tool session output is drained to terminal exit; timeout/yield is not PASS.

Native uses pipe, no nativeVirtualKeyCode, passive trusted-key audit, real trusted drags/fullscreen, default autoplay, actual Chrome profile/process and real menu zoom. Preserve authentic Appearance calibration and immutable pixelFocusWalk/native-focus-context-v1 source and hashes, full screenshot/clip/DPR/Retina/document-scale/focus successor pairing, whole-shell injective DOM/AX census and independent visual judgment. No outline/rectangle fallback. Complete seven-unit qualification -> fresh independent Q2/root adoption -> full valid P0 before -> two-CSS Clock geometry G2/G3 -> versioned baseline -> E1-E5 -> Clock fixed/final is retained. Root-adopted five-row shared design is not method qualification. Consumed ReactDOM/SDK/config/forwarding/root-capture holds, retention3/3, visual3/3, M8/REL unknown histories and production canonical activation closed all remain. MED native lock is distinct from canonical-command activation; qualification-only activation never proves production admission.

## 9. Preservation, budgets and next gate

Full312 ordered original fields are unchanged with39 reversible literal original_module labels; normalized web213/app22/plugin16/sync41/admin16/site4, while original web174+project-system30+cross-module9 remains literal. Nonempty gate_obligations150 is not TODO gated118, a different policy population. Original933 evidence plus6 accepted TT08=939; formal13/3/3/293 and299 unclosed; MED-03 pending/evidence empty. P0 runtime parity excludes exactly four accepted TT08 owning docs; no whole-apps/packages equality shortcut.

Historical actual commands, PIDs, modes, duplicate artifacts, refusals/probes/unknown counts and cap3 follow their permanent purposes in full appended documents. Old author autoplay bypass is distinct from independent genuine-default/trusted Retry evidence. Ten logs are not ten launches; thirteen file comparisons yield9equal/4different and no whole-host qualification. Prior author1 parse failure/review1 overbroad-boundary failure, corrected source2/review2 results, impact1/review results, shared source failures/unknowns and Clock costs all persist. Empty MED evidence never resets any allowance. Current source-contract iteration1/3 and sole semantic static1/1 are documentary only; runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children/push/globalwrites all0. Token/currency/provider usage unavailable, not zero.

Static receipt is emitted externally with actual checker PID/argv/chunk/session/exit, complete corpus counts/bytes and output hashes. No pretool assembly is called a launched checker. Both complete buffers and all inputs precede any write; a real checker failure stops without retry. Read discovery included absent guessed validatePrefs.ts, storage accountMigration/prefRegistry paths and SettingsShell.tsx plus truncated outputs; corrected paths were used. These are disclosed reads, not product probes or semantic passes.

Next: fresh uninvolved WHOLE source-contract review of all16/source predicate/signatures/codec/reset table/export/lifecycle/34paths/18roles/controls/resources/histories/canonical rules -> root exact adoption -> actual missing bytes/outer-capture closure -> complete source author and independent source review -> actual full source/method qualification with independent full review/root adoption -> full valid original P0 before -> separate exact implementation if reproduced need -> independent unchanged-oracle fixed AND integrated/affected/native/visual/trusted-key/account evidence -> complete canonical G1 actual judging copies and original failure records -> actual different-vendor verification -> fresh uninvolved Astra full original acceptance -> root append-only evidence reconciliation unchanged formal states -> fresh inventory/remote preservation/ancestry/sync. E1-E5 before implementation and E25 last; no accepted smaller slice, READY_TO_SHIP, deployment or release claim.


## Appendix RESET - complete fixed registry classification proposal

Source: e8b29df83f34fc13a55a04d78c3db2002b2d5fb6:packages/plugin-web-storage/src/internal/registry.ts; all 87 explicit registry entries. This finite table is proposed REL-10 selection, not current behavior or implementation permission. Open-ended keys outside these entries are not added. Existing broad reset includes every non-proposed xai_ entry; the retain rows are the proposed preservation correction. Saved board filters and dashboard weather are user-created records; board view/active-board/layout/timezone selections are configuration. Stub integration/premium rows retain their explicit resettable-stub contract.

| Key | Actual owner | Category | Proposed flag | Proposed disposition |
| --- | --- | --- | --- | --- |
| xai_accent_hue | xai-web-settings-appearance | appearance | false | reset: preference/configuration; preserve owner routing |
| xai_rail_pos | xai-web-settings-appearance | appearance | false | reset: preference/configuration; preserve owner routing |
| xai_bg_tone | xai-web-settings-appearance | appearance | false | reset: preference/configuration; preserve owner routing |
| xai_rail_order | xai-web-shell | shell | false | reset: preference/configuration; preserve owner routing |
| xai_pet_pos | xai-web-pet | pet | false | reset: preference/configuration; preserve owner routing |
| xai_pet_id | xai-web-pet | pet | false | reset: preference/configuration; preserve owner routing |
| xai_task_cols | xai-web-tasks | module | false | retain: execution/entity or saved user content |
| xai_boards_v2 | xai-web-board-core | module | false | retain: execution/entity or saved user content |
| xai_active_board | xai-web-board-core | module | false | reset: preference/configuration; preserve owner routing |
| xai_board_workspaces | plugin-web-board-workspaces | module | false | retain: execution/entity or saved user content |
| xai_board_panels | xai-web-board-core | module | false | retain: execution/entity or saved user content |
| xai_board_inbox | xai-web-board-core | module | false | retain: execution/entity or saved user content |
| xai_dash_order | xai-web-dashboard-grid | module | false | reset: preference/configuration; preserve owner routing |
| xai_clock_style | xai-web-dashboard-widgets | module | false | reset: preference/configuration; preserve owner routing |
| xai_clock_tz | xai-web-dashboard-widgets | module | false | reset: preference/configuration; preserve owner routing |
| xai_zones | xai-web-dashboard-widgets | module | false | reset: preference/configuration; preserve owner routing |
| xai_ai_convos | xai-web-ai-chat | module | false | retain: execution/entity or saved user content |
| xai_ai_insights | xai-web-ai-chat | module | false | reset: preference/configuration; preserve owner routing |
| xai_ai_voice | xai-web-ai-chat | module | false | reset: preference/configuration; preserve owner routing |
| xai_ai_provider | xai-web-ai-chat-real-llm-adapter | module | false | reset: preference/configuration; preserve owner routing |
| xai_ai_base_url | xai-web-ai-chat-real-llm-adapter | module | false | reset: preference/configuration; preserve owner routing |
| xai_ai_model_default | xai-web-ai-chat-real-llm-adapter | module | false | reset: preference/configuration; preserve owner routing |
| xai_ai_streaming | xai-web-ai-chat-real-llm-adapter | module | false | reset: preference/configuration; preserve owner routing |
| xai_pomodoro_active | xai-web-pomodoro | module | false | retain: execution/entity or saved user content |
| xai_pomodoro_sessions | xai-web-pomodoro | module | true | retain: proposed entry; no activation |
| xai_countdowns | xai-web-countdown | module | true | retain: proposed entry; no activation |
| xai_matrix_state | xai-web-matrix | module | true | retain: proposed entry; no activation |
| xai_habits_state | xai-web-habits | module | false | retain: execution/entity or saved user content |
| xai_pref_week_start | xai-web-calendar | pref | false | reset: preference/configuration; preserve owner routing |
| xai_board_view_by_id | xai-web-board-views row #8 | module | false | reset: preference/configuration; preserve owner routing |
| xai_board_filter_by_id | xai-web-board-saved-filters | module | false | retain: execution/entity or saved user content |
| xai_meditation_active | xai-web-meditation | module | false | retain: execution/entity or saved user content |
| xai_meditation_prefs | xai-web-meditation | module | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_tasks | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_board | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_dashboard | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_calendar | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_matrix | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_pomodoro | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_habits | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_features_meditation | xai-web-settings-features-panel | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_smart_lists | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_enabled | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_done_sound | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_push_task | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_push_pomo | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_push_habit | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_quiet | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_quiet_start | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_notif_quiet_end | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_dt_start_week | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_dt_lunar | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_dt_week_numbers | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_dt_holidays | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_dt_timezone | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_win_type | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_launch_at_login | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_minimize_on_launch | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_date_recognition | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_remove_date_text | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_remove_tags | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_url_parse | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_default_date | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_default_rem_due | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_default_rem_all | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_default_pri | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_default_tag | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_default_list | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_add_to | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_more_overdue_at | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_collab_show_avatars | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_collab_default_share | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_collab_mention_notify | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_sticky_color | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_sticky_font | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_sticky_pin_default | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_sticky_restore_size | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_sticky_grid_spacing | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_calendar_view | xai-web-calendar | module | false | reset: preference/configuration; preserve owner routing |
| xai_pref_integrations_connected_notion | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_integrations_connected_gcal | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_integrations_connected_linear | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_premium_tier | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_pref_premium_started_at | xai-web-settings-rest | pref | false | reset: preference/configuration; preserve owner routing |
| xai_calendar_events | xai-web-calendar | module | false | retain: execution/entity or saved user content |
| xai_dashboard_stickies | xai-web-dashboard-widgets | module | false | retain: execution/entity or saved user content |
| xai_dashboard_weather | xai-web-dashboard-widgets | module | false | retain: execution/entity or saved user content |

## Appendix ORIGINAL-ITEM - exact registered immutable item

{
  "id": "MED-03",
  "priority": "P2",
  "kind": "决策",
  "action": "定义冥想历史记录、离开修正和重新播放规则",
  "acceptance": "是否计入离开时长、是否续播和实际记录字段有可测试合同",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "MED-03",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:MED-03"
  ],
  "source_section": "MED",
  "acceptance_evidence": {
    "business_acceptance": "是否计入离开时长、是否续播和实际记录字段有可测试合同",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "MED-03/prepare",
    "MED-03/contract-review",
    "MED-03/before",
    "MED-03/implement",
    "MED-03/verify",
    "MED-03/accept",
    "MED-03/reconcile",
    "MED-03/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}

## Appendix FULL IMPACT: complete source2 and review2 embedded verbatim

# MED-03 complete source-machinery and protected-dependency impact r1

**PROPOSED technical basis; fresh FULL independent impact review required.** This document defines finite source authoring, protected exception candidates and the complete evidence chain. It grants no implementation, runner/test creation, source qualification, business before, runtime or MED-03 acceptance.

## 1. Identity, scope and preservation

Module web; workflow A under the sole A-Codex controller. Fresh actor /root/parallel_a_med03_machinery_impact_r1; own worktree /Users/lijinlong/.codex/worktrees/audit-parallel-med03-machinery-impact1-20261010/XAI_Desktop. Requested Astra role is dispatch metadata, not provider billing/model attestation. No children. Direct parent P=3ee736788a5d488505cd322a95ae61e2c0d76715; fixed input I=4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d; product P0=f9eb4b1f207bc4b46f547b90afc250424b3c8695; original audit O=e041c2bc293b70db367444c62c4300231976dbf7.

Exact card: docs/reviews/20260908-full-product-audit/parallel-control-r1/task-med03-source-machinery-impact-r1.json at P. Exactly two ADD outputs: this impact.md and adjacent inputs.sha256. No other writable path, temporary source file, product/test/runner/config change, push, merge/rebase, release/deploy/promotion/D3 or global write is granted. Root owns remote preservation, integration, reconciliation and sync. All complete inputs and both UTF-8 output buffers precede first write. One syntax-only compile precedes the sole semantic checker; a parser failure would leave its body UNRUN and would not be retried or called PASS.

Full source2 S=1e2d0ac42ecdc142c34291294fca09bce1f77dae and full review2 R=291a4175d9ea237451bec9fe87cd9fc6cc736de7 are the adopted documentary basis at P. Their historical PROPOSED/UNADOPTED statements remain unedited in Appendices A/B. S contains all737 identities including review1's688 and author1's649; R contains803. Every identity is validated, not sampled. Hash closure is byte coverage, not visual inspection or semantic review of every dependency line.

Original312 task IDs/order/fields,39 reversible literal module labels (30 web project-system and9 web cross-module verification index labels retained exactly in original_module),933 original evidence prefixes plus6 TT08 additions=939, formal13 completed/3 verification_pending/3 in_progress/293 pending and299 unclosed remain. MED-03 is pending with empty evidence. TODO uses sections[].tasks; EXECUTION uses items; scope-map uses items; current dynamic registration uses execution-state.tasks plus the exact card, not the initial task-registry. P0 runtime source parity is checked separately from exactly four accepted TT08 owning documentation changes; no whole-apps/packages equality claim.

Original MED action and acceptance, all16 M03 rows,11 conditional paths,10 retained log artifacts,13 applicability entries and complete canonical Clock r2 section14 E1-E25/E24/Rules are retained verbatim in full S/R copies below. They are normative obligations; this impact adds acquisition detail without replacing any original row.

Additional later controller context L=b7324936f5880c2050e6eecc8c22567fade05444 is independently hash-bound in inputs.sha256 (CURRENT-CONTROL-PLANE.md and execution-state.json only). L records root adoption of the complete five-row shared design basis. This is explicitly additional steering, NOT a repin of I/P or a runtime admission. Historical shared impact3 UNADOPTED wording describes its own frozen time. Missing consumed ReactDOM/SDK forwarding/config bytes and existing outer root-capture identity, unqualified methods, retention3/3, visual3/3, M8/REL unknown-history and production-activation holds remain. Installed version strings are not consumed-source proof.

## 2. Source-feasible owner contract and host

The owning package is physical packages/xai-web-meditation, exported as @repo/plugin-web-meditation. No planned Desktop plugin-meditation package is implemented. Runtime source references in this section are fixed P0 bytes, also unchanged at P.

Actual public entry is apps/web/src/main.tsx: StrictMode, AppProviders, RouterProvider, registerServiceWorker and bootstrapObservability; routes/router.tsx routes the protected App; App.tsx supplies AccountStorageGate and the shell/departure owners; RouteGateElements.tsx and actual feature fallback select the public slot. registration.tsx mounts MeditationSlotHost through root and wildcard children and passes shell language. Exercise /app/meditation, /app/meditation/<child>, rail, Back/Forward and feature disable/reenable through this public graph, not a replacement route.

AccountStorageGate mounts PomodoroSessionHost persistently. Meditation creates its controller inside MeditationModule and retains observers only while the route mounts. Route departure releases timer/pageshow/visibility/storage observers and audio; raw execution persists. Returning reconciles a running deadline or recovers paused state. No global Meditation timer host, background service, paused-on-leave policy or closed-process JS is promised.

AppProviders live mode with nonempty VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY sends non-null config to the actual exported WebAuthSessionProvider; session.tsx then selects ManagedAuthSessionProvider. Mock-authenticated/config-null selects the legacy path and remains a separately labelled control, never proof of managed host. Retain actual SDK, auth generation coordinator, AccountDeletionRecoveryBridge, DeviceSessionBridge with REST transport, TodoWebRuntimeBridge and startup observability/service-worker effects. A local disposable HTTP service may replace the remote endpoint only. It must not replace provider, SDK, coordinator, business scope, or private React context.

The HTTP adapter's finite endpoint table must be derived from actual consumed SDK bytes and app transport: auth login/refresh/user/logout only when invoked; device_register/device_heartbeat with actual headers and body; declared Todo nonce lease with encryption_device_id/lease_start/lease_end; recovery cleanup only in its distinct disposable scenario. Unknown request, swallowed auxiliary failure, wrong session owner, malformed/expired token or late A response after B fails readiness. Bind method/path/query/headers/body/response schemas. No external production request or credentials. SDK source not yet available means a source-author prerequisite hold, not a fabricated response table or intentionally incomplete skeleton.

Track auth IndexedDB generation separately from business account/demo generation. Public generation-store candidate/session/publish admission and real AccountDataGate own activation; fixtures may seed valid disposable bytes with public key helpers but cannot call accountScope.activate as a substitute for public managed readiness. Keep device settings unscoped and all foreign/old/candidate/unassigned sentinels. StrictMode duplicate starts are retained, not normalized away.

## 3. Durable meanings and concrete risk boundaries

S's full stored-field table remains exact: version1; captured owner kind/accountId/generation; id; revision; phase; durationMs; accumulatedElapsedMs; runStartedAt; deadline; endedAt/reason; complete start prefs including nested scenes/colors. runStartedAt is the current running segment, not original session start. Running absence counts, paused absence does not. Fixed expiry clamps elapsed and terminalizes at the original deadline; infinite sessions have no deadline. No actual-listening duration, first-start timestamp, pause/departure interval log, replay count, archive, history array, statistics total or bus history event is introduced.

One running/paused/ended row is retained until explicit Dismiss. New Start after Dismiss has a new id, revision0, elapsed0 and current configuration. Saved running Open is an explicit gesture granting playback consent subject to browser policy; saved paused Open stays silent until Resume; ended cannot resume old time. Synthesized sound has no media seek offset. In-player End/Exit currently delegates onExit: when the observed row is already ended it sends dismiss. Each control must therefore be identified with its actual phase, accessible name and command, and must clearly disclose removal if used as dismissal. Do not assert all controls labelled End merely terminalize.

Controller command captures scope, expected id/revision and issuedAt; native Web Locks serialize authoritative reread. Due precedence uses issuedAt for pause/end and lock-time now for reconcile/start. Successful durable write/remove precedes publication. Failures retain old bytes and retry intent; conflict refreshes winner. Real two-document locks/storage and held A lock while B acts are required. Controller generation/tombstone checks and stale operationToken protect command publication; these do not automatically prove that onStart/onExit or Player resume.then cannot continue after unmount or replacement.

Ambient graph uses shared playback revision/context. Inspect pending resume, deadline gain scheduling, cancellation and disposal through real calls. A late successful command after unmount may initiate another play unless fenced; this is a source-derived risk to freeze with a valid before, not a reproduced bug claimed here. Default audio policy is mandatory. Source read failures and no Web Locks differ from confirmed absent/null active data. Existing session.error and preference recovery.failure alerts both already render exportFailed; no missing-error-UI fiction or duplicate repair.

Player volume is current prefs.volume; session.prefs.volume is the start snapshot. Source/prefs fallback can display normalized defaults after denied/malformed raw data. It cannot authorize new Start or a write over unreadable source, and isDefault/readRawPref(null) cannot prove known absence because readRawPref catches denial as null. Legacy usePref consumes event payloads; qualification must challenge stale payload versus current storage and scope, not accept fallback as an authoritative source receipt.

Preference migration is exactly: non-null non-array object; missing schemaVersion allowed; present version admitted only when Number(version) is1/2/3; every supplied non-version entry recursively equals validatePrefs(raw)[key]. Schema-less partial and coercible supported values remain admitted where the complete supplied-field predicate passes. This is migration admission, not the normalizing read codec or strict active validator. Unscoped active import admits null only. There is no history/session import, new key, schema bump or account-sync grant.

Session recovery exports the current raw active string to meditation-session-recovery.json (confirmed absence is literal null); denied read must remain unavailable. Preference draft exports exactly {version, kind, snapshot, sceneDraft, fixedDurationDraft}, version1/kind meditation-unsaved-draft; snapshot is rejected pending.current.value, editor drafts are latest mounted values. It has no separate committed backup or baseline raw string and no importer. Capture and compare actual disk bytes, not only Blob construction/anchor clicks.

Account export intentionally accepts explicitly captured owner/generation through exportAccountLocalData even after current auth changes. AccountPane asserts current scope at entry and displays Download requested rather than Saved. Preserve that library contract; a caller-level recheck immediately before download is a separate dependency. For all three exports, retain owner/id/generation/lifetime from invocation to serialization, append, actual click and post-dispatch result. Inject a mid-owner transition at the real boundary and prove refusal/no A disclosure to B where caller authorization expired. Browser/OS no-ack after click remains disclosed uncertainty, not guaranteed disk success.

Generic resetAllPrefs removes all registered non-proposed xai_* keys; both Meditation prefs and active use category module. REL-10 requires preference-only reset, so a category===pref filter is insufficient: it would exclude genuine module preferences too. Freeze a complete explicit key-purpose classification from existing owners (prefs versus execution/entity/credentials/layout as actually governed), preserve other callers' accepted resets and refuse uncategorized keys. This is a reviewed shared technical dependency, not a new right to erase execution. The default SettingsFooter branch is real, but production caller reachability must be traced; utility-only evidence cannot become App evidence. Failed removePref may return false rather than throw; a truthful reset result must observe that path if an adopted repair requires it.

Forced reload/crash loses mounted unsaved drafts. Departure Cancel/Stay must retain them; accepted Leave/crash must preserve old durable bytes without claiming draft durability. Record real history location/blocker sequence and dialog, export/discard/retry effects, then new-document/process loss. Do not invent a durable draft stash or migrate it into session history. Account deletion remains captured-owner/all-owned-generations with receipt/tombstone and no resurrection; no shared owner rewrite is proposed.

## 4. Finite protected exception candidates

Every path remains PROTECTED today. The following is the complete proposed technical delta map for fresh full review; a later root card selects one exact set and source hashes. No wildcard or permission to edit all necessary files. Inability to fit the selected set stops for additive independent impact review.

S's11 Meditation-local conditional paths are retained exactly in Appendix A section6. Four owning docs plus Module/Player/controller/audio/styles/two med03 tests remain the core conditional subset. Existing tests are never overwritten. Controller timing/schema/lock algorithm is protected; an exposed identity or disposal token can only serve the adopted lifecycle fence after a valid before. Styles are append-only module disclosure/recovery scope with tokens, no shared CSS or geometry/focus method edit.

| Exception | Exact additional path | Proposed narrow purpose |
| --- | --- | --- |
| AV1 | packages/xai-web-meditation/src/internal/useMeditationPrefs.ts | Local authoritative source classification/owner-bound refresh and write/start admission; preserve full-value setter/rejected proposal/baseline/retry behavior and legacy codec compatibility. No global hook change. |
| AV2 | packages/xai-web-meditation/src/internal/prefsSource.ts (ADD) | Pure scoped read-result adapter using public accountScope plus authoritative raw storage; valid/absent/invalid/unavailable discriminated result, no writes and no account ownership logic replacement. |
| AV3 | packages/xai-web-meditation/src/__tests__/MeditationPrefs.med03-source.test.tsx (ADD) | Public module/hook source guards, denied/invalid/repair/events/scope/draft/no-write controls and actual codec compatibility. |
| AV4 | packages/plugin-web-storage/src/index.ts | Additive public export of unchanged subscribeSameTab observer only; no setter or existing signature/engine change. |
| AV5 | packages/plugin-web-storage/src/__tests__/meditation-source-public.test.ts (ADD) | Public observer import/unsubscribe/scope filtering and compatibility; original suites untouched. |
| AV6 | packages/xai-web-persistence-contract/docs/design.md | Additive observer exposure and zero-writer ownership constraints. |
| AV7 | packages/xai-web-persistence-contract/docs/api.md | Existing subscription semantics exposed without stronger source-truth promise; caller rereads. |
| AV8 | packages/xai-web-persistence-contract/docs/test.md | Additive export compatibility and source-read caller obligations. |
| AV9 | packages/xai-web-persistence-contract/docs/dev_log.md | Separate storage public-surface prerequisite, no self-acceptance. |
| RS1 | packages/plugin-web-settings-shell/src/internal/resetAllPrefs.ts | Separately owned REL-10 preference-only target selection and truthful per-key outcome, subject to complete owner classification and compatibility review. |
| RS2 | packages/plugin-web-settings-shell/src/SettingsFooter.tsx | Only if shared reset result needs visible failure/partial truth; preserve explicit overrides, confirmation and existing departure contracts. |
| RS3 | packages/plugin-web-settings-shell/src/__tests__/resetAllPrefs.rel10.test.ts (ADD) | Frozen complete target classification, pref-only removal, entity/active/foreign retention and false/throw failures; not replacement for original tests. |
| RS4 | packages/plugin-web-settings-shell/src/__tests__/SettingsFooter.rel10.test.tsx (ADD) | Actual default/override/Cancel/error route and once-only confirmation; no claim of production reachability from this test alone. |
| RS5 | packages/plugin-web-settings-shell/docs/design.md | Additive REL-10 correction and caller compatibility decisions. |
| RS6 | packages/plugin-web-settings-shell/docs/api.md | Result and preference-only semantics without silently reclassifying registry schemas. |
| RS7 | packages/plugin-web-settings-shell/docs/test.md | Full reset target/caller/owner/race/failure obligations. |
| RS8 | packages/plugin-web-settings-shell/docs/dev_log.md | Shared prerequisite workflow only, no MED closure. |
| EX1 | packages/plugin-web-settings-rest/src/panes/accountPane.tsx | If qualified before reproduces it, captured invocation lifetime/current authorization recheck at download click; preserve captured-owner export API and requested-download disclosure. |
| EX2 | packages/plugin-web-settings-rest/src/__tests__/accountPane.med03-export.test.tsx (ADD) | Setup failures/mid-owner click/old mounted caller, full manifest/raw disk boundary mapping; new suite, original tests retained. |
| EX3 | packages/plugin-web-settings-rest/docs/design.md | Caller download authority and lifetime only. |
| EX4 | packages/plugin-web-settings-rest/docs/api.md | Current-caller admission versus captured-owner library distinction. |
| EX5 | packages/plugin-web-settings-rest/docs/test.md | Three export scopes remain separately tested. |
| EX6 | packages/plugin-web-settings-rest/docs/dev_log.md | Shared export prerequisite state, no account lifecycle acceptance. |

There are23 additional exact candidates (AV9 + RS8 + EX6), not23 authorized edits. Union with S's11 is34 conditional product/docs/test paths. AV reuses existing normalization unchanged: validatePrefs, accountMigration, types, constants and registry stay read-only. The adapter must not use migration admission as the normal reader codec or silently reject known legacy/coercible content. Invalid/unavailable evidence inhibits destructive writes/start while retaining latest draft; returning to valid does not automatically commit a rejected proposal. P0 index.ts does not expose subscribeSameTab: AV4 exports that existing scoped observer unchanged and AV2 consumes it through the public barrel. Reread authoritative physical bytes on same-tab notification, native storage key/removal/clear, scope/generation invalidation, pageshow/visible return, explicit read-only source Retry and immediately before Start/commit/retry/export. Ignore event payload as authority, catch access failures including event filtering, and publish source/value/raw tied to one captured scope with a post-read scope check. Module's proposed explicit source Retry only rereads; it cannot retry a write or remove bytes. This adds a declared recovery focus stop to the full native/visual census; it does not borrow a no-new-stop Dashboard assumption. AV tests preserve valid legacy normalization and separate parse/version/source classification from mutation admission. Missing imported observer or incompatible callback behavior stops for revised exact impact, never a private cross-package import.

Alternative shared availability basis audit-parallel-dash06-source-availability-impact-r1 is an inherited design dependency, not an adopted MED storage API. Do not silently import its proposed usePrefRead before its own full review/adoption/implementation/qualification. Selecting a shared API instead of AV requires an explicit MED delta amendment and independent full review. The sole storage exception is AV4's additive export of the unchanged observer plus its named test/docs. No generic getPref/usePref/storage.ts/sameTabBus.ts/codec/registry/accountScope/exportAccountLocalData/deletion algorithm change is proposed here.

RS leaves registry keys/categories/defaults untouched. A source contract must enumerate every actual reset target and classify all accepted caller overrides before selecting implementation. Existing mixed module category does not resolve eligibility. If a compatible result requires public types/index or other file edits beyond RS, that is a new finite amendment, not permission here. No new Settings reset product decision is needed: original REL-10 preference-only obligation governs.

Hold read locks on main/auth/route/accountLifecycle/ownership/declaration/config/package exports/lockfile, source guard semantics, session lock and raw bytes. Exclusive future resources: local MED prefs+active scope/generation and audio lifetime; RS shared reset surface; EX account download caller; any shared availability API owner. Separate worktrees do not remove semantic collisions. Root serially reserves these. All global ledgers/control/inventory, originals/failures/runner sources, other worktrees, shared CSS/tokens and cloud/desktop surfaces remain protected.

## 5. Exact machinery source and emitter-role candidates

Future source author writes only a separately adopted source card. Candidate directory is docs/reviews/audit-parallel-med03-machinery-source-r1/. The following18 exact files are proposed, not created by this task. No runtime outputs are included in this source grant.

| Basename under candidate directory | Sole role |
| --- | --- |
| contract.md | Complete16-row/original action mapping, modes, phase limits, admission and protected boundaries. |
| inputs.sha256 | Immutable source/dependency/authority identities; full inherited manifests, no circular output hash. |
| cases.json | All16 parent rows and finite named subcases with explicit oracle, controls, purpose, expected before classification and emitter. |
| dependencies.json | Requested/resolved SHA, lockfile, package exports/conditions, consumed build/SDK/ReactDOM/startup/CSS/assets and exact root envelope references. |
| purpose-history.json | Actual commands/modes/processes/duplicates/refusals/probes/unknown counts and root-resolved remaining allowance; never a self-issued admission token. |
| run-unit.mjs | Builtin-only bootstrap/supervisor, typed root receipt checking, no-clobber capture, time budgets, child/stream/write registry, quiescent sealing. |
| host.html | Real root element and prelude-before-product entry; no fake App/ready marker. |
| host-entry.tsx | Actual main startup/StrictMode/AppProviders/Router public host composition and untouched-main correspondence control. |
| managed-http.mjs | Source-bound disposable SDK transport fixture, declared endpoint schemas and real HTTP logs; no SDK/provider replacement. |
| acquisition.mjs | Preimport owner/DOM/native-property/departure/storage/audio observation with transparent single delegation and restore proof. |
| native-driver.mjs | CDP pipe/trusted actions/two-document/profile/reload/process/fullscreen/default-audio scenarios and real disk acquisition. |
| semantic-fixture.tsx | Narrow auxiliary deterministic elapsed/field/codec/command specimens; explicitly not actual-host or native acceptance. |
| visual-focus.mjs | Actual host/full CSS bilingual widths/real zoom/qualified synchronous first-frame and focus successor binding; no invented visual PASS. |
| command-lane.mjs | Exact inherited package/host/storage/G1 commands and source guards; refuses unknown/exhausted family before spawn. |
| oracle.mjs | Independent expected timing/field/raw bytes/history-free/download/owner checks and no silent row omissions. |
| qualification-controls.test.mjs | Real emitter positive/cause-specific negative pairs, finite subcases below, no import-time execution. |
| qualify.mjs | Admitted control driver through the actual supervisor/fixture/emitter paths; no synthetic result-only qualification. |
| source-receipt.md | Source-only coverage, complete role mapping, exact gaps/holds, output hashes supplied externally. |

Future runtime cards must enumerate exact immutable output paths per invocation, not directory wildcards. Required payload roles: outer stdout/stderr/emergency receipt; supervisor journal/child registry; environment/loaded closure; per-case raw events and all-attempt results; full-page and cropped screenshots/AX/key audits; raw original/recovery/account files and download metadata; independent post-close durable outcome; full final item index. Each role has one producing source file above and an independently checked payload schema. Generate case IDs and source scripts from the same frozen case manifest but validate an independently derived expected16-row/subcase census; an emitter cannot validate itself merely by echoing its own expected list.

Modes are disjoint declarations, never budget resets: source-selfcheck (static future card only), qualify-host, qualify-acquisition, qualify-storage-export, qualify-audio, qualify-native-focus, business-before, candidate-fixed, integrated-fixed, affected-g1. One wrapper exercising multiple families reserves every family's actual purpose history before launch. Exact command form is node <frozen run-unit.mjs> --card <root immutable card> --mode <one declared mode>; it is a proposed interface, UNIMPLEMENTED/UNRUN. No unspecified all/default mode.

## 6. Complete case-to-acquisition/control mapping

All rows inherit the full literal contract oracles in Appendix A, not these shorter labels. Every emitted row must include source SHA, actual host/auxiliary lane, document/loader/profile/PID, scope/auth generation/business generation, seed/raw before/after, action/command identity, raw artifact hashes, exact oracle and honest disposition. A blocked method emits BLOCKED/missing, never N/A or PASS.

| Row | Actual acquisition and emitter | Positive and causal negative controls; hard boundary |
| --- | --- | --- |
| M03-01 | native-driver + host-entry + acquisition capture EN/ZH actual visible/AX disclosure and complete Start/Pause/Resume/End/Dismiss/new Start with raw row snapshots; oracle checks independent field sequence. | Valid new id/revision0/elapsed0 after explicit removal; deliberately wrong displayed archive/start-time claim in disposable qualification must fail disclosure oracle, reused id or early delete fails row oracle. No added history to make it pass. |
| M03-02 | Semantic auxiliary finite known-time fixtures and native real route-away/reload monotonic/wall timestamps for preset/custom/infinite/before-at-after deadline/rollback. | Running adds absence, paused remains unchanged, exact deadline terminal; wrong paused expiry or measured segment math is detected. Timer oracle cannot call product elapsedAt as its expected implementation. Synthetic Date.now is labelled auxiliary. |
| M03-03 | Acquisition records full active JSON/prefs before/after every transition and live volume gesture; oracle enumerates exact permitted fields/nested values. | Resume changes segment start, live volume changes without rewriting snapshot; altered first-start/listening field claim or extra history write is detected. No fabricated audible-time inference from AudioContext state. |
| M03-04 | Actual main/public route/rail/history/feature actions with App departure recorder, controller listener lifecycle and raw key census. Both real managed and legacy branches separately identified. | Route-away teardown + saved return; helper-only/omitted startup/public branch must fail host-provenance admission. Cancelled departure retains row and pending draft; real allowed departure records exactly one navigation. |
| M03-05 | Real new document loader/nonce, whole owned Chrome exit/new launch same profile for running and paused; native-driver writes launch/exit/drain evidence and recovery card/audio ledger. | New loader and process identity with raw persistence/no automatic play; same-document remount masquerading as reload, leaked process, silent auto-play or repeated terminal write fail. Ended has no Resume. |
| M03-06 | Trusted native fullscreen enter/Escape/exitFullscreen plus actual CSS player, accessible End/Exit/Dismiss and command log. | Presentation-only action leaves id/phase/raw intact; mutation on fullscreen exit fails. Running End terminalizes; already-ended End/Exit is measured as current dismiss and must match explicit disclosure, not misclassified as record retention. |
| M03-07 | Real managed A/locked/B/A, first-boundary property/DOM publication, retained A lock request, auth/business generation/tombstone and pending UI/audio/retry/export operations. | B independently usable while A held, stale A stays refused; same-task wrong A content then correction must be captured. Actual delayed continuation after unmount/new row/owner must not create audio/write/UI. Direct fabricated accountScope event cannot prove managed transition. |
| M03-08 | Two owned same-origin actual documents and native Web Locks; stale Start/Pause/Resume/End/Dismiss and concurrent expiry/end. | Winner preserved exactly, one terminal revision, loser refresh then fresh command succeeds; same-document duplicate or stub locks fail acquisition control. Real held request recorded before release; release/cancel occurs once. |
| M03-09 | Storage fault at each start/pause/resume/end/dismiss/reconcile read/write/remove, source absent/null/malformed/unknown/foreign/denied/no-lock; raw snapshots + real alert/AX + retry behavior. | Successful control writes exactly once; failed write retains prior bytes/draft and truthful error. Return false versus throw, source repair, stale event payload and denial after initial good read each observed. Forcing oracle result JSON alone does not qualify fault capture. |
| M03-10 | Real default-policy AudioContext graph/playback revision/resume4s rejection/nonsettling/late success, user gesture and deadline gain, pause/unmount/account transitions. | Trusted gesture can start eligible graph; no gesture/cancelled request/late disposed success never restarts. Autoplay bypass flags refuse the judging lane. Gain scheduling/actual context closure observed; hardware/OS output not asserted without separate proof. |
| M03-11 | Three distinct real download emitters: raw session, exactly five-field mounted proposal, captured-account export. Full disk bytes + filenames + no-write/key census; setup and mid-owner faults at actual Blob/URL/append/click boundaries. | Valid malformed raw preserved, pending snapshot/latest drafts exact; denied source cannot export manufactured null. Injected owner change before click refuses stale caller, original save error retained. File missing/wrong content or post-click unacknowledged result cannot be Saved. |
| M03-12 | Actual account public management/deletion/generation/tombstone/migration paths plus separately admitted real Settings default reset reachability. Semantic codec table distinguishes normalizer, migration and active validation. | A cleanup preserves B/device/unassigned; late old write refused; pref-only reset retains active/entities and detects false remove result. Schema-less/coercible versions with valid supplied fields accepted; forbidden supplied/unknown/active legacy rejected. No independent owner/schema rewrite. |
| M03-13 | Actual CmdK public search module jump, source consumer/key registration scan, no owner-history/statistics bus write; raw source classification receipt. | Existing preferences scene/sound alias resolves; injection of active-history consumer/event or unavailable-as-empty definitive claim detected. No derived Meditation Statistics measurement manufactured. |
| M03-14 | Real host/full CSS EN/ZH375/414/768/1024/1440, genuine200% native menu zoom, all disclosure/error/player states, pet-hidden after resize and pet-on,44px/new targets, containment/hit/overflow/full screenshots. | Exact viewport/DPR/zoom/source/calibration; wrong coordinate/DPR/stale resize or actual occluded target fails. Qualified method and independent screenshot judgment required; existing exhausted visual family remains held. |
| M03-15 | Full-shell forward/reverse Tab, trusted Enter/Space once/Escape, injective AX/DOM descriptors, every stop raw focused/moved-on pixels and passive isTrusted key audit through pipe. | Real own focus change and once-only action; adjacent-only ring, restored wrong transient value, repeated descriptor, missing outside stop, fake dispatchEvent or nativeVirtualKeyCode fail. No outline/rect substitute. |
| M03-16 | run-unit/command-lane/oracle aggregate all16 and full canonical E1-E25/E24/Rules, source/candidate/integrated/affected/native/vendor/acceptance lineage and every raw artifact. | Complete valid index; omitted row/hash, wrong fixed SHA, reused actor, incomplete streams, unknown purpose or forged vendor result refuses. Clock-specific IDs map to Clock reuse/prerequisite, never relabelled Meditation. |

Qualification controls have explicit identities Q-M01 through Q-M16 matching rows above, with named finite expansions recorded in cases.json before source acceptance. Cross-cutting Q-A1 admission covers malformed card/missing capture/wrong hash/wrong role/unknown or exhausted family/replayed reservation/path escape/wx collision. Q-A2 covers actual wrong-root Vite resolution, missing dynamic chunk/CSS/font/SDK, stale optimized output and undeclared HTTP. Q-A3 covers synchronous same-task property restoration/detached mutation/React native input forwarding/descriptor conflict/channel overflow and source-before-prelude. Q-A4 covers actual worker timeout, archive/config failure, late stdout/stderr, late artifact write, delayed descendant, cancellation/close races and failed final persistence. Q-A5 covers actual forced loss between serialization/click/disk acknowledgement and between pending draft/save/departure/reload; complete durable pre/post and honest lost-memory result. Each has a healthy counterpart and intended failure classification, not arbitrary injected exception plus green summary.

Shared synchronous-acquisition-v1's full A01-A14 and complete focus/raster/decoder/real menu context obligations remain normative via the fixed shared impact and additional adoption identity. These controls are not shortened to Q-A3. Missing consumed ReactDOM/native descriptor forwarding/config or outer capture prevents final source materialization/admission. Disposable negative specimens must cause the actual effect at the real entrypoint; edits to parser input/checkOracle JSON are auxiliary unit checks only.

## 7. Source closure, process lifecycle and method holds

Source author freezes requested/resolved full Git SHA, streamed git archive with measured bytes, lockfile df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9, exact package.json exports and runtime tool versions/hashes. Main checkout is read-only dependency root only. Candidate runtime installs nothing, mutates no shared node_modules, and writes optimizer/build/cache/temp/profile/server artifacts only at root-reserved paths. Resolve browser/import via actual Vite resolver, record original/transformed/optimized module graph, dynamic imports, workers/service worker, CSS/fonts/assets, ReactDOM/SDK/tool configs and real consumed files; require actual served/runtime closure plus approved build inputs, not a recursive node_modules hash alone.

One enclosing root capture envelope exists before inner card parse/import; exact existing root machinery source must be bound. If absent, no child launch. Inner supervisor opens wx stdout/stderr/emergency/journal before dynamic imports, verifies root once-only typed reservation/actor/history/resource/adoption/qualification receipts and output realpaths/symlinks. A worker cannot mint global authority. Builtin-only preflight protects malformed card, missing cwd, syntax/import error and initial output refusal. Runtime commands are registered before start, including archive/build/server/Chrome/HTTP/native-menu/command tools and detached descendants; real parent stdout/stderr and exit/signal are retained.

Allocate finite overall monotonic deadline plus phase bounds for archive/dependency copy/config/build/server/bootstrap/SDK/document/calibration/matrix/artifact write/cancel/drain/finalization, retaining original source limits. Root's later card supplies exact numbers before execution; an absent number refuses. This impact does not invent or enlarge any historic limit. Promise.race alone is not cancellation. Register async task and stream/write joins; use owned process group and acknowledged PID/start identity for unavoidable detached children. Never kill unrelated Chrome or delete uncertain output.

Terminal success requires all children terminated/reaped, stdout and stderr closed/drained, finalizers and queued writes joined, source/matrix completeness, immutable sealed artifact hashes and independent post-close durable receipt. Retain late events and failed cleanup/persistence even after business PASS. Nonquiescent/uncertain descendants produce QUARANTINED_UNJOINED/UNKNOWN, never sealed success. Prelaunch filesystem failure is recorded by already-owned root receipt; impossible final durability cannot be promised away.

The shared five-row design (P-HOST/P-ACT/P-LEDGER/P-FOCUS/P-OUTER) is conditionally adopted only at additional L. P-ACT remains qualification-only for existing canonical-command test activation, with production gate closed. Meditation active controller uses its separate native lock; do not enable a canonical dataset gate merely to create a MED queue. Shared Tasks/Metrics canonical queue proof cannot serve Meditation, and successful Meditation locking cannot waive production canonical activation. Source qualification for MED must cover its actually consumed adapters even if identical to shared source; explicit accepted reuse requires exact environment/source/applicability review.

Retain authentic Appearance calibration, untouched pixelFocusWalk originals and versioned native-focus-context-v1 source, full per-document scale/clip/full screenshot checks, real display/Retina/zoom identity, whole-shell injective focus census, all reached stop pairs, original stable capture/alignment limits and independent visual review. No rectangle/outline fallback or new fourth retention/visual attempt. The method dependency chain remains complete seven-unit qualification -> fresh Q2/root adoption -> full valid P0 before -> two-CSS Clock geometry G2/G3 -> versioned baseline -> E1-E5 -> Clock fixed/final. Local holds never delete M03-14/15 or canonical rows.

## 8. Permanent actual purpose, commands and costs

The complete source-grounded histories in Appendix A section9/Appendices B/C and Appendix B review history remain verbatim. Source/applicability equality is only named-file reuse:13 comparisons,9 equal/4 different; older App/accountScope/accountLifecycle and REL05 Module differences prevent whole-host reuse. Ten logs are artifacts, not ten processes. Accepted MED01/02 stays accepted within its original bounds.

| Actual permanent unit | Commands/modes and retained budget disposition |
| --- | --- |
| Current technical impact | impact1/3, exactly one semantic static check. One syntax-only compile is not behavioral qualification. Failure stops without retry. This source/document task consumes no runtime family. |
| Meditation package | pnpm --filter @repo/plugin-web-meditation test; initial95, failing94/95, isolated13, three author95 plus three independent95 and collision probe, later112/117/134. Lifetime formal/development/probe partition UNKNOWN; never a fresh0/3 because a MED03 filename is new. |
| Author durable native | node docs/reviews/web-meditation-durable/verify-native-meditation.mjs; final7 groups, Chrome47047/47093, starts2/stops2; earlier no-bypass stall missing raw/PID; at least2 wrappers. Final autoplay bypass/DOM action lane not judging default-policy evidence. |
| Independent durable native | node docs/reviews/web-meditation-independent/verify-native.mjs; fixed6887879,8 groups, Chrome50081/50172. Genuine default/no bypass and trusted Retry preserved; native.log/runner.log duplicate one wrapper/two process launches, not two passes. Exact total still unknown. |
| Independent package wrapper | node docs/reviews/web-meditation-independent/verify-tests.mjs; setup.ts no-suite failure then134/16. tests.log/test-runner.log duplicate final run. Missing earlier raw exit/PID remains unknown. |
| Mounted proposal recovery | node docs/reviews/web-save-consumer-inventory/verify-native-med.mjs; fixed da35b3b,2 downloaded files/latest scene/delete/conflict/B/390px/player. Earlier unstyled probe/Controls correction remain; source does not qualify full host/timer/history. Reproduction green asserts old lost scene, not fixed behavior. |
| Storage/lifecycle/reset/export/auth | Meditation134, storage126 and lifecycle6 are distinct historical purposes. Underlying REL05/source classification/account export/reset/public-host units inherit actual commands and histories. Lifetime counts unknown until root source reconciliation; AV/RS/EX labels do not grant0/3. |
| Novel semantic assertion source | One-record/End-Dismiss/new-id bilingual meaning and no-first-start/no-listening/history declaration is source-proven absent as a combined old oracle. Can be a separately registered new source purpose; not a new full package/native/host allowance. |
| Method qualification/native/visual/focus | Clock retention3/3 exhausted145checks/41of42; last55checks14of14 PASS not qualification; visual3/3 exhausted; Q1focus1/3 other six0/3; development2/83; B70native12/6432/development40/4884; focusEN2/ZH2; F1formal2/180/development3/302. Preserve refusal/error/unknown details; no fourth attempt through MED. |
| M8/REL/production gates | Unknown historical classification/cap availability remains UNKNOWN/local HOLD, not0. Qualification-only canonical activation cannot admit production queue claims. These holds affect dependent units, not unrelated documentary work. |
| G1/affected commands | Exact full canonical E15 sixteen F1, E16 c1-c5, Header fixed/P0 host5/5+5/5+2/2/native18/Astra/Sol, E24 all accepted callers retain their own immutable runner/command/mode histories, original failures and refusal/capacity rules. No blanket new regression budget. |
| Vendor/full acceptance | TT08 vendor3 is neither a new MED vendor grant nor automatic consumption of a distinct real purpose. Root binds actual command/provider/actor/source/raw output/time/cost and permanent history before launch. Another Codex actor is not cross-vendor. |

Author1 static1 parser FAILED before body/writes; review1 static1 FAILED on overbroad apps/packages comparison; their later identity-only closures did not change verdicts. Author2 static1 and full review2 static1 PASS documentary-only remain distinct consumed attempts. Shared impact-author2 failed raw-versus-unique comparison and final impact-author3/3 exhaustion remain. Missing histories are not reconciled by assertions/count arithmetic, reusing log copies, source SHA, renamed mode, actor, checkout or path. Cap3 follows the actual permanent purpose and every mixed wrapper reserves all exercised units. No claimed unused tries based on empty MED evidence.

Current costs: runtime0/tests0/build0/lint0/browser0/native0/server0/qualification0/probes0/vendor0/children0/push0/globalwrites0; technical impact1/3; semantic static1/1. Provider token/currency costs unavailable, not0. Read-only discovery included nonexistent guessed source paths and truncated output subsequently narrowed; those are disclosed read issues, not runtime attempts. No product/test/runner was imported or executed.

## 9. Fresh full review and downstream chain

Fresh independent impact reviewer (not this actor, never repairs) must review the WHOLE original action/acceptance, full S/R, all803 inherited input identities, all16 rows/11 original paths/23 proposed additional exceptions/18 source files, owner/codec/export/reset/lifecycle/host feasibility, actual histories and every canonical ID. A three-finding-only or hash-only review is insufficient. Return explicit technical APPROVED or REVISE per entire proposal and exact exception set; root alone may adopt exact hashes. No new owner decision has been established; if an actual contradictory owner contract emerges, cite both immutable rules and route only the minimum unresolved question to root.

Required order remains: complete technical impact review/root adoption -> exact complete source card with actual dependency bytes and existing root capture -> fresh source author -> independent complete source review -> actual complete source/method qualification and independent full qualification review/root adoption -> source/history-admitted complete valid original P0 before with predicted failures and positive controls -> fresh bounded product author only for reproduced needed repair -> independent unchanged-oracle fixed AND integrated/affected/full native/visual/keyboard/account evidence -> full canonical G1 actual judging copies and original failures -> actual different-vendor verification -> fresh uninvolved Astra full original acceptance -> root evidence-only append-only reconciliation with formal states unchanged -> fresh inventory/remote original preservation/integration ancestry/sync.

Protected prerequisite source contract/implementation for AV/RS/EX is independently reviewed and admitted before dependent before/fixed claims; source-found risks are not permission to patch. A no-product-code result still requires full accepted contract/evidence, not waiver of rows. E1-E5 precede any product author, E25 last with all E1-E24 commits/artifacts/hashes/verdicts; missing item blocks. Clock IDs stay Clock evidence, exact valid reuse or explicit dependency, never fabricated MED results. C-FB002/OE/C-RD1 judge; C-FD1 observational; E19/E12 bounds and complete native exclusion/capacity/transport rules are preserved verbatim below.

This proposal may be independently reviewed while method/history holds remain local. It does not claim full MED03 business PASS, new formal closure, READY_TO_SHIP, production activation or release. Exact output hashes/count/commit/parent/clean status are external to avoid self-reference.

Original action: 定义冥想历史记录、离开修正和重新播放规则

Original acceptance: 是否计入离开时长、是否续播和实际记录字段有可测试合同


## 10. Current documentary static receipt

Static1 PASS for fixed documentary identity/preservation/source design checks only. 1216 unique immutable input identities / 34181397 bytes validated; inherited803/737/688/649 complete. 312 ordered original records,39 literal labels,939 evidence,formal13/3/3/293,299 unclosed;16 MED rows,11 original conditional paths,10 logs,13 applicability entries(9 equal/4 different),23 additional exception candidates,18 source candidates; whole canonical section14 checked verbatim. All buffers assembled before first write. No runtime qualification or independent review is implied. The external tool receipt supplies PID/exit/output hashes. Prior failed and unrun histories remain unchanged.

## Appendix A - full adopted source2 document, verbatim historical text

# MED-03 full original-obligation preparation r2 — PROPOSED / UNADOPTED

Module **web**, workflow C under the sole A-Codex controller. Fresh documentary corrector /root/parallel_c_med03_correct2; requested role Astra, not provider-model attestation or cross-vendor evidence. No children. This document defines the complete original obligation for independent review; it grants no product writes or execution.

## 0. Correction2 fixed identity and authority

Current writable worktree: /Users/lijinlong/.codex/worktrees/audit-parallel-med03-correct2-20261010/XAI_Desktop, detached HEAD direct parent b9ed5f63256620b1135ba9e782f08992923bd3c4. Fixed input711cfd8d7a587468d4ff133eb6d5911ad4dd79ef; product P0=f9eb4b1f207bc4b46f547b90afc250424b3c8695. Task card: docs/reviews/20260908-full-product-audit/parallel-control-r1/task-med03-preparation-correct2.json. Independent author2/3 is neither original author nor reviewer; requested Astra role is not runtime/provider attestation.

Immutable original preparation23bd8545b317e2d5565ad069aaabd0e65061737b and reviewa87f90c40490e3ac02d392fe9f89aa038e439ec5 are protected. This r2 is exactly two new ADDs, contract.md and inputs.sha256. The root task card supersedes the review's suggested in-place r1 paths. All649 original preparation identities and all688 review identities are retained and validated; unchanged sections preserve complete obligations,16 oracle rows,11 conditional paths,10 historical log artifacts, source-purpose commands and complete canonical G1. A manifest identity is byte coverage, not a claim of independent semantic analysis of every dependency line.

R1 corrects the already-present session and preference export-error rendering. R2 records the precise legacy predicate. R3 records the exact five-field rejected-proposal export. These three source-description corrections authorize no UI, storage, migration or schema repair and introduce no owner question.

P0 through current parent differs under apps/packages only at the four already accepted TT08 owning documents: packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md. Runtime/product source, tests, runners, CSS, configuration and lockfile remain unchanged; documentation delta is not runtime parity drift or authority to waive a future product check. The original39 reversible labels are exactly30 web（project-system） and9 web（跨模块验证索引）, projected to web while original_module preserves each original label. The original input source is sections[].tasks; scope-map uses items.

## 1. Fixed authority and preserved audit

Original r1 worktree (historical, protected): /Users/lijinlong/.codex/worktrees/audit-parallel-med03-preparation-20261010/XAI_Desktop. Original r1 parent P=535ba372116f6be333e529bfd6f8b9ca725ec3be; discovery I=e5caddc1abb1b12afb8802960d6e2b993c0c365a; original audit O=e041c2bc293b70db367444c62c4300231976dbf7; product P0=f9eb4b1f207bc4b46f547b90afc250424b3c8695. Fixed parent remains unchanged while the root progresses.

Original goal attachment /Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md was read first; SHA-256 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. The fixed parallel authority-overlay/goal-C and adopted scheduler pointer supersede only authorized global serial constraints; original evidence, ownership, costs, modules and acceptance continue.

Registration 11d1d67e67719cf331217786e60fa24ae487e12b mistakenly embedded POMO-04 in original_item while header, four acceptance requirements and allowed files correctly named MED-03. Original card hash b37086d113a8456a0a7c29fe2d6e031c0f42f7e3af071ff1a37e48884a3465de remains preserved. Root explicitly stopped writes and supplied additive amendment A=7eb8280736e0c30a908120704ea081d43cd12f16, same card path hash 2cc625a2034431da7b44215468d52090cbf8f7973d425fea0ae9c100de82b2ff and CURRENT-CONTROL-PLANE checkpoint. Amended original_item equals immutable scope-map MED-03. This fixes controller metadata only: no repin, author reset, extra static pass, product choice or scope expansion. Both versions are inputs.

**MED-03 · P2 · 决策 · pending · web · 当前范围 · workflow C**:
**定义冥想历史记录、离开修正和重新播放规则**.
Acceptance: **是否计入离开时长、是否续播和实际记录字段有可测试合同**.
Sources: 02-tasks-time-boards.md;05-visual-ux-audit.md. Every original item field/order and original_module remains binding. Full312 scope,39 reversible module labels,933 original evidence +6 accepted TT08 =939 current entries,13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed remain unchanged. Empty MED03 evidence does not imply zero historical invocations. MED01/02 acceptance is retained as limited existing authority, not renamed MED03 full acceptance.

## 2. Existing owner rules resolve the semantic choice

Owning package is physical packages/xai-web-meditation, package name @repo/plugin-web-meditation; plugin-meditation is a paused planned Desktop package and unrelated to this Web task. PLUGIN_MAP's old Web row and design base contain stale no-audio/no-resume/schema1 descriptions. June configurable upgrade and September API MED-01/02 addendum explicitly supersede those portions; obsolete prose is not a product choice.

Primary explicit rules: owning docs/api.md §MED-01/02 durable execution, author 6887879 and independent acceptance 797b4b4 at source6887879, plus EXECUTION.md recorded MED01/02 closure. Existing design §12 and later API both exclude a session-history ledger. The original MED03 wording requires defining history/replay/fields, not necessarily adding a history list. Therefore proposed resolution uses the following already explicit rules:

- Running time includes absence; paused time excludes absence. Reopening derives elapsed/deadline from saved state. No manual away-time correction/editor exists or is granted; no assumed pause at route departure, tab hiding, lockscreen or process exit.
- Reopening shows a saved-session card and never starts audio automatically. Opening a saved running session is explicit audio consent subject to browser policy; opening paused state leaves it paused/silent until Resume. An ended session cannot resume its old elapsed time.
- One active/ended execution row is retained, with terminal reason/time, until explicit Dismiss. This is recoverable current execution evidence, not an append-only history, past-session archive, statistics source or cloud-synced ledger.
- Start after dismissal creates a new session identity with current preferences and elapsed zero. No historical replay button, media seek position, recorded sound file or automatic restart is promised. Synthesized ambient sound starts a new graph; “resume audio” means resume playback, not resuming a recorded audio offset.
- Fixed expiry clamps elapsed at configured duration and records the original deadline, exactly once; infinite sessions have no deadline and end only explicitly. Manual End records measured elapsed and reason manual. End and Dismiss are different operations.

**No source-proven minimum unresolved product-owner question is identified.** Fresh independent review must challenge this conclusion against the original obligation and later accepted rules. Do not ask the user from this draft. If review finds an actual contradictory explicit rule, cite both immutable sources, isolate the minimum remaining decision and send it only to the root; do not reopen already decided away-time/autoplay rules or import Pomodoro semantics. This proposal still requires complete evidence and may need narrowly scoped disclosure/documentation corrections.

## 3. Actual data owner, fields and consumers

The sole session state-machine writer is internal/sessionController.ts. ACTIVE_KEY=xai_meditation_active, JSON version1, account-owned device-local storage. xai_meditation_prefs is schemaVersion3, also account-owned; “device-local execution” does not mean device ownership. Physical key and Web Lock name include captured account/demo scope and business generation. Auth IndexedDB generation is distinct.

| Actual persisted field | Contract and limits |
| --- | --- |
| version | Exactly1. Unknown schema remains unreadable recovery data; never normalize then overwrite. |
| owner.kind/accountId/generation | account or demo; nonempty accountId/generation must match captured business scope. Locked scope cannot read/write. |
| sessionId | Stable nonempty id during this execution; new Start uses crypto.randomUUID, revision0. Dismiss/new Start cannot be mistaken for resume. |
| revision | Nonnegative safe integer; increments on durable state transitions, no repeat terminal increment. Used with id for stale command exclusion. |
| phase | running, paused or ended; paused is not completed and ended is not a history list entry. |
| durationMs | Positive finite fixed/custom duration or null infinite. Preferences constrain UI duration1..240min. |
| accumulatedElapsedMs | Nonnegative segment sum, capped at duration for fixed sessions. On running row it excludes current running segment; displayed effective elapsed is derived. |
| runStartedAt | Current running segment wall timestamp. Resume replaces it; **not an original session-start timestamp**. No original-start field can be reconstructed honestly after pauses. |
| deadline | Fixed absolute deadline; null only for infinite. Rebuilt on resume from remaining duration. Paused rows may retain the old fixed deadline but do not expire while paused. |
| endedAt | Terminal wall timestamp; expiry equals original deadline. Manual end clamps rollback to current runStartedAt. Required in ended state. |
| reason | Terminal elapsed or manual. Not a completed boolean, quality/engagement score or listened duration. |
| prefs | Validated full start snapshot: schemaVersion,scene,clock,sound,volume,duration,customFixedDurations,durationMode,customDuration,clockScale,clockColors,customScenes. Custom scenes include id/name/background/gradientFrom/gradientTo/animation/sound/clock/clockScale/clockColors/durationMode/duration/customDuration. |

Clock colors carry digits/hands/ring/background/highlight. Scene/sound/clock IDs and duration resolver retain their current enums and validation. Live player volume comes from current prefs.volume, whereas stored row prefs.volume remains the start snapshot: do not label the latter final volume or a listening log. No persisted pause intervals, departure intervals, total paused duration, first start/recordedAt/completedAt, replay count, actual audible duration, history array, statistics event or manual correction exists. A field's current TypeScript shape alone is not permission to promise semantics; API explicit start snapshot/elapsed/end rules provide authority.

elapsedAt(row,t)=min(durationMs or infinity, accumulatedElapsedMs + (running ? max(0,t-runStartedAt) :0)). Display floors to seconds; storage retains milliseconds. Clock rollback is clamped, not a trusted real-time clock. Arbitrary clock changes/OS suspension and hardware output are not precision-certified.

Mutation order: command captures expected session id/revision, scope and issuedAt; busy/retry prevents a second unresolved intent. Native Web Locks acquires xai:meditation:<physicalKey>, rereads authoritative bytes, rejects stale non-reconcile commands. Scope, generation and deletion tombstone are checked by key()/physicalKey immediately before mutation. Pause/End use issuedAt for predeadline decisions; reconcile/Start use current lock-time due precedence. A due current row can settle instead of starting another session. Only successful set/remove publishes committed next state; failed save retains previous durable bytes and retry intent. Conflict refreshes winner without permanent latch; late old-scope finally cannot clear B busy.

Producer/reader map:
- Module start/pause/resume/end/dismiss/retry and controller reconcile are execution producers; pageshow/visibility/storage/timer observations request reconcile.
- MeditationModule useSyncExternalStore and MeditationPlayer read the row; ClockDisplay is a wall-clock renderer, not activity accounting.
- useMeditationPrefs/custom-scene controls produce configuration, not session history. Failed preference proposals retain mounted-memory draft/Retry/export/discard; no durable draft recovery promise.
- CmdK readModuleStates reads prefs only; adapters/meditation.ts yields module-jump by scene/sound aliases, never session records. Statistics/dashboard source scan has no Meditation active consumer; no measured meditation totals may be inferred.
- Registry/ownership/lifecycle declarations register both keys. Account export and deletion are additional lifecycle writers/readers; generic reset and migration are external mutation boundaries, not new session-state-machine owners.

## 4. Real public host and lifecycle contract

Actual route: apps/web/src/routes/router.tsx /app/:moduleId/* → ProtectedAppRouteElement/App → AccountStorageGate/AccountDataGate → AppRouteElement → withDisabledFallback(meditationSlotRegistration) → MeditationSlotHost → MeditationModule. Slot reads shell language; App owns shell/router/departure coordination. Both root and wildcard child paths resolve the module. Feature disable hides/blocks the route but must not erase its data.

@repo/web-auth-device-session/web resolves src/web.ts → session.tsx and guards.tsx. Public WebAuthSessionProvider selects ManagedAuthSessionProvider only with config; explicit mock/client path is LegacyAuthSessionProvider. Future evidence must exercise actual public routing and label the real branch; a helper adapter or directly activated scope is not a managed-auth host proof. AccountStorageGate mounts PomodoroSessionHost only. Meditation controller is created per route module and retained by its effect; it has no independent global host timer.

| Boundary | Required meaning, observations and no-loss oracle |
| --- | --- |
| Running/paused route departure | Actual route removes observers/audio and preserves saved row. Return opens recovery card; running absence counts, paused absence does not. Missing route observer delays persistence of expiry until return, never changes business end deadline. No closed-route JS claim. |
| Native fullscreen | CSS player overlay and document.requestFullscreen are separate. Browser Escape/exitFullscreen changes presentation only, retains id/phase/elapsed. Player End exits fullscreen and sends End; an ended-state End/Dismiss may remove terminal evidence. Distinguish each exact control by accessible name and resulting command. |
| Reload/tab/new document | In-memory player flag resets; original durable id/phase/elapsed/deadline survive. Zero automatic audio; no fabricated history append or default write. New document must be proved, not React remount labelled reload. |
| Entire browser process close/reopen | Actual owned process exit and new launch with same isolated profile; running deadline reconciles, paused unchanged. No JS/audio executes in closed process. Preserve launch identity/PID/source evidence and both running/paused cases, actual OS exit distinct from graceful app navigation. |
| Manual End | Running elapsed includes counted absence, paused elapsed frozen; terminal raw record persists with reason/time. Failure leaves activity and truthful retry state, never reports saved completion. |
| Dismiss ended / Start again | Only explicit dismissal removes current ended row. Proposed EN/ZH disclosure states this is the only saved execution record and removal is not archiving. Dismiss failure preserves it. Subsequent Start has new id/zero elapsed/current configuration; no replay of old completed time. |
| A→B→locked→A | No first-frame A data/audio flash in B, no old queued commands/retry/export/post-await UI/audio continuation; returning A recovers its row only. Stale generation/tombstone refuses, no resurrected deleted account. Held A lock must not block B. |
| Two real same-origin documents | Native shared Web Locks and storage; stale pause/resume/end/dismiss/start cannot mutate winner/replacement, fresh command remains usable; concurrent End/expiry one terminal revision. A second hook in same document is insufficient. |
| Audio errors/late callbacks | Resume rejection/nonsettling4s visibly retryable; pause/unmount/scope change cancels pending play, closes graphs; fixed gain scheduled at deadline even with JS throttle. Late controller Promise resolving after unmount must not call a fresh play through a disposed hook or alter new session. Source post-await continuation is a verification risk, not a new reproduced failure. |
| Source errors | Valid absent/null active differs from bad JSON/version/prefs/owner/read denial/missing locks. Raw bad bytes stay unchanged, errors visible, Start disabled/refused, raw export only if readable. No defaults-as-empty proof. Preference usePref/validatePrefs can display defaults after read errors: not permission to overwrite an unknown source. |

Controller retain cleanup currently removes observers/timer but does not separately mark every issued UI callback disposed; onStart/onExit and player resume.then require explicit lifecycle verification. Full scope does not waive this by citing old controller tests. Any reproduced real defect freezes before evidence and dispatches a fresh bounded author. No new command, observer host, global timer bar or persistence schema is assumed.

## 5. Export, deletion, reset and migration boundaries

Session recovery exports raw active string as meditation-session-recovery.json, not preferences or a history ledger. No active row returns literal null; read failure must surface unavailable rather than manufacture null. Current export serializes against current scope before URL creation but lacks a separately captured scope recheck at the actual download click. Proposed requirement is owner/lifetime-bound click and truthful visible export failure, preserving original save error and raw bytes. Native disk receipt must parse actual downloaded file; Blob/anchor simulation alone cannot prove disk. Browser/OS failure after dispatched click may lack acknowledgement; disclose instead of claiming guaranteed save. Existing exportFailed rendering has two sites in fixed P0 MeditationModule.tsx:330-336 and345-351: the session.error alert renders Export failed beside Export session data when exportFailed is true, and the recovery.failure preference alert independently renders its export-failure message under the same exportFailed flag. Session-only error UI is already present; do not invent a missing-UI before failure or add duplicate UI. Actual DOM/failure observations remain required. The click-boundary scope recheck and post-dispatch download acknowledgement are separate unproved matters; neither is established by these rendering sites.

Preference recovery meditation-unsaved-draft.json serializes exactly five top-level fields: {version, kind, snapshot, sceneDraft, fixedDurationDraft}. version is1 and kind is meditation-unsaved-draft. snapshot comes from owner-checked recovery.snapshot(), which returns pending.current.value: the rejected proposed preferences value, including any unchanged fields carried in that proposal. sceneDraft is the latest mounted scene editor draft; fixedDurationDraft is the latest mounted fixed-duration editor draft. There is no separate committed preferences backup, prior raw-byte copy or pending baseline string in this download, and no import API. Source: fixed P0 MeditationModule.tsx:314-320 and internal/useMeditationPrefs.ts:59. These mounted-memory values can be lost on forced reload/crash; export is not durable save or independent committed-version recovery. Owner checking at snapshot acquisition does not prove a scope/lifetime recheck at the actual download click. Account export exportAccountLocalData(capturedScope) intentionally exports the explicitly captured owner's current generation even if auth later changes; do not rewrite this shared contract as current-scope-only. Caller authorization/download boundary must remain explicit. Raw damaged values are included; other accounts, earlier/candidate generations, device prefs, auth/secrets are excluded under existing manifest.

Account deletion uses captured owner, lifecycle lock/receipt/tombstone and erases all owned generations, preserving other users/device/unassigned originals. Session late writes must respect tombstone/generation; no resurrection. Full delete participant chain/legacy atomicity remain separate owner prerequisites where required, not waived MED guarantees.

Settings shell resetAllPrefs iterates registered non-proposed xai_* keys and removePref, including both Meditation keys. It is not a Meditation Reset control or archive mechanism. Original REL-10 explicitly requires limiting this default reset to preferences; the observed broad reset is an unresolved shared defect/risk, not an accepted right to delete business records. Preserve REL-10 as a prerequisite for any claim that global default reset safely retains Meditation execution; do not invent a new owner choice. Full MED disclosure must distinguish this destructive global data reset from End/Dismiss and cannot promise indefinite retention across account deletion, explicit reset or browser eviction. Actual reset failure/race/result truth requires shared owner evidence; no SettingsFooter/resetAllPrefs/registry/storage edit is granted here. If safe retention relies on a shared repair, register independent impact/review/chosen exact scope first, keep MED dependent gate blocked.

Legacy preference migration admission in fixed P0 internal/accountMigration.ts:9-14 first requires a non-null, non-array object. An absent schemaVersion (raw.schemaVersion === undefined) is allowed; a present value is admitted only when Number(raw.schemaVersion) belongs to [1,2,3]. After validatePrefs(value), Object.entries(raw).every checks each supplied field: schemaVersion is excluded from equality, and every other supplied value must recursively match normalized[key] via sameValue. The entire raw object need not equal the fully defaulted normalized object, so schema-less partial objects and coercible supported versions can be admitted when all supplied fields satisfy this predicate. This records existing source behavior, not a broad new compatibility permission, executed probe or request to change the validator. Preference normalization, legacy migration admission and strict active-row validation are distinct contracts. The unscoped active validator at line18 accepts only null; never imports an unassigned legacy execution session. Active import/history import/new key/cloud sync are absent and protected. Refresh/export/read is not migration consent. Compatible existing rows and start snapshots must survive any disclosure-only correction byte-for-byte.

## 6. Exact conditional scope and semantic reservations

Current grant is exactly contract.md and inputs.sha256 in this preparation directory. Product allowlist is EMPTY until fresh review/root adoption/before/method admission. Proposed future subset is finite:

| Exact conditional path | Sole proposed purpose |
| --- | --- |
| packages/xai-web-meditation/docs/design.md | Reconcile superseded base prose with explicit durable/history/away/replay contract, without deleting historical decisions. |
| packages/xai-web-meditation/docs/api.md | Exact stored-field meanings, absence/end/dismiss/restart and lifecycle/source/export limits. |
| packages/xai-web-meditation/docs/test.md | MED03 full oracle traceability and inherited evidence limits. |
| packages/xai-web-meditation/docs/dev_log.md | Only adopted MED03 workflow evidence/status section; preserve historical body, no false ship. |
| packages/xai-web-meditation/src/MeditationModule.tsx | If qualified before proves a missing disclosure or a separate error/lifecycle/click-boundary defect (existing session export error rendering is not missing): local EN/ZH record/away/restart meaning and captured lifecycle handling. No history writer or new global guard. |
| packages/xai-web-meditation/src/MeditationPlayer.tsx | Explicit End/fullscreen/paused/audio meanings and disposed late-resume continuation if reproduced. No clock algorithm rewrite. |
| packages/xai-web-meditation/src/internal/sessionController.ts | Only source-proven adopted lifecycle/identity exposure needed for stale UI command safety; retain state machine/schema/timing/locks. Any semantic change requires fresh impact. |
| packages/xai-web-meditation/src/internal/useAmbientAudio.ts | Only adopted disposed/late callback protection proved necessary; preserve graph/timing/sound design and shared playback revision. |
| packages/xai-web-meditation/src/styles.css | Append narrowly scoped disclosure/recovery layout only if needed; token-only, no shell geometry or focus measurement changes. |
| packages/xai-web-meditation/src/__tests__/MeditationModule.med03.test.tsx | New finite disclosure/record meaning/original-field and current-command UI oracles after source review; no rewrite of existing tests. |
| packages/xai-web-meditation/src/__tests__/MeditationPlayer.med03.test.tsx | New explicit replay/fullscreen/late-result UI contracts where absent, preserving original tests. |

Any needed source-availability guard in useMeditationPrefs/storage or shared host/reset/export/migration repair is a separately registered prerequisite, not implicitly included above. Choosing no code delta still needs an accepted documentary decision plus full applicable verification; choosing a patch requires exact before/fixed oracles and review.

Reserve semantic resources: Meditation active per-account generation/lock, prefs and mounted draft, module/player audio singleton/lifetime, recovery download owner, and host route/account lifecycle shared read dependencies. Shared mutation coordination is root-owned. Protect all other packages/apps, tokens/i18n/shared CSS, schemas/keys/registry, lockfile/config, existing tests/runners/failures/evidence, global control/ledgers/inventory, other worktrees, deployment/release/promotion/D3. No wildcard evidence authoring; future runner paths/output names are separate cards.

## 7. Complete acceptance oracle matrix

Each row needs a source-qualified frozen expected result, raw observation, exact source/artifact hashes, historical applicability or new lawful invocation. Tests can falsify but cannot replace full acceptance.

| ID | Required oracle |
| --- | --- |
| M03-01 | EN/ZH visible/accessibly named explanation of one execution record, End versus Dismiss and new Start; no history/archive/real-listening promise. Start→Pause→Resume→End→Dismiss→Start has correct ids/revisions and field values. |
| M03-02 | Fixed preset/custom/infinite; known elapsed independent oracle at before/at/after deadline; running away included, paused away excluded, rollback clamped. No manual correction/paused-expiry invented. |
| M03-03 | Exact field table and nested prefs; resume overwrites runStartedAt not first-start, live volume versus start snapshot distinguished; terminal persisted once at original deadline, manual timing preserved, no absent history fields fabricated. |
| M03-04 | Actual public host route, rail navigation, Back/Forward, feature disable/reenable, same-page remount, saved running/paused return; preserve row while observers/audio stop. Both real auth branches identified, helper-only lanes labelled auxiliary. |
| M03-05 | New-document reload plus actual complete process close/reopen for running and paused, exact profile/source/PID/exit evidence. Recovery card, no autoplay, explicit Open/Resume; ended cannot resume and needs Dismiss/new Start. |
| M03-06 | CSS overlay and native fullscreen Enter/Escape/exit versus End; same session/phase across presentation-only transitions, explicit End persisted once; no accidental restart or dismiss. |
| M03-07 | Account A/B/locked/A and business generation/tombstone, first-render isolation, held A lock while B starts, late UI command/resume/retry/export/unmount callbacks, current user can still act. No old sound graph or disposed state mutation. |
| M03-08 | Two native documents: stale Start/Pause/Resume/End/Dismiss, concurrent end and expiry, newer session wins; one terminal revision, conflict refresh then fresh action works. |
| M03-09 | Distinct write failures start/pause/resume/end/dismiss/reconcile; prior bytes preserved, truthful visible recovery, retry same lawful intent, no false saved/end/remove/empty signal. Corrupt/unknown/foreign source and denied reads preserved; absent/null separate. |
| M03-10 | Default browser audio policy, trusted actual gesture, denied/nonsettling resume visible4s, retry; pause/unmount/account change and JS throttle stop graph/deadline gain, late resume fenced. No hardware/OS certification claimed without separate evidence. |
| M03-11 | Session raw disk export and preference latest-draft export separately, full account export coverage; inspect exactly {version, kind, snapshot, sceneDraft, fixedDurationDraft}, snapshot=rejected proposal with latest mounted editor drafts and no separate committed backup; real downloaded bytes/filename and malformed data preserved, no writes/guard release/history creation. URL/Blob/append/click failure and owner change before click visible/refused; read denial not empty backup. |
| M03-12 | Account generation deletion, same-account reset semantics, foreign B/device/unassigned preservation, tombstone rejection, failure/late-write boundary; prefs migration compatibility for the actual absent/coercible-version and supplied-field predicate, plus unscoped active refusal. Shared lifecycle proofs are dependencies, no scope escape. |
| M03-13 | Actual CmdK prefs search module-jump, no active/history reader invented; Statistics/dashboard remain unrelated, no bus history event. Both keys owner/registry/export/delete consistent. Source-unavailable prefs cannot be represented as known empty history. |
| M03-14 | Actual host/full CSS EN/ZH at375/414/768/1024/1440 and200% zoom; record explanation/recovery/player/controls all applicable states,44px new targets, containment/hit-test/no overlap, pet-hidden resize procedure and pet-on, actual screenshots inspected. |
| M03-15 | Trusted Tab/ShiftTab/Enter/Space once/Escape; labels, focus visibility/restore, fullscreen and error/retry order; pipe/no nativeVirtualKeyCode/passive isTrusted key audit; qualified per-stop pixelFocusWalk at required themes/states, no CSS-outline-only substitute. |
| M03-16 | Complete before/source qualification/fixed/affected/canonical r2 G1/actual vendor/fresh full Astra acceptance/root evidence-only reconcile/inventory. Exact original full obligation retained, no missing row renamed REL-only or only eight old native checks counted as complete. |

Source-gap handling is mandatory: active errors are explicit; prefs fallback isn't a verified raw-source receipt. If row M03-09/13 requires a shared availability contract, map to frozen audit-parallel-dash06-source-availability-impact-r1 and independent review/chosen technical contract, or register a separately reviewed Meditation-specific prerequisite. An unadopted impact proposal does not authorize shared mutation or supply runtime qualification.

## 8. Gates, evidence ownership and qualified methods

G0 fresh independent contract review of original action/acceptance, no-question rationale, schema meanings, actual host, full16 rows and finite scope. G1 separately registered source machinery implements all oracles/controls, immutable source/dependency/admission manifests. G2 independent source review and actual qualification before any business before. G3 freeze full valid before at P0 with expected failures and positive controls before product correction. G4 fresh implementation author exact adopted subset and fixed diff, only needed repair. G5 independent same-oracle fixed plus affected package/storage/host/auth/reset/export/CmdK/Features/audio/timer and full native/visual/keyboard. G6 actual cross-vendor full-scope verifier, finite budget/time/launch/raw tool output/cost; another Codex agent is not cross-vendor. G7 fresh uninvolved Astra full acceptance, every M03 row and canonical ID with independently rederived hash. G8 sole root evidence reconciliation with unchanged original fields/states. G9 fresh inventory after acceptance, source commit remote preservation, integration ancestry and sync receipt. No gate implies deployment, formal312 closure or release.

Use streamed immutable git archive, full requested/resolved SHA, lockfile df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9, @repo actual exports and physical directory mappings with fail-closed guards. Main checkout is read-only dependency root only; server/profile/process belong to registered evidence worker. Future qualified runner reserves unique immutable names/launch ids, captures original stdout/stderr/exit/signal and refuses overwrite. Bound startup/archive/build/CDP/full matrix/exit/drain/finalizers separately; Promise.race does not cancel operations. No terminal PASS before owned child quiescence, both streams drained/closed and independent post-close durable receipt. Keep late events and cleanup/persistence faults, don't kill unrelated Chrome or delete uncertain descendants.

Canonical Clock r2 is 8bf613962517ee9b80bf51373e8ad88960c570cc, contract hash214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. Appendix A copies complete §14 unchanged: E1–E25, every E24 accepted caller and judging copy/rule. E1–E5 before author; E25 last; each item commit/path/hash/verdict/applicability, no absent ID N/A by omission. Clock-specific evidence stays in Clock node, not fabricated as MED03. Root maps each ID to valid reuse, pending shared prerequisite or separately admitted affected invocation.

E15 all16 F1 runs plus E16 Clock c1–c5; E17 Header control/fixed host5/5+5/5+2/2/native18/Astra/Sol; E24 AppRail eight modes26/31/21/18/24/22/33/123+host31, rail165/104, Appearance K-1 135/123; frozen More boundaries+C-FB00210/10 judging, Appearance24/26(006/007)+OE26/26 judging, Features13/15+C-FD1 14/15 observational+C-RD1 15/15 judging. Preserve original failures and no weakening of assertions. Capacity-only copies require refusal transcript/pre-registration/exact diff/source equality; no global rerun merely to obtain newer logs. E19 protected paths/E12 invariance are required to reuse exclusions.

Method dependency at frozen correction-impact-r2: retention3/3 exhausted,145checks/41of42cases, last55checks14of14PASS not qualification; source correction remains UNQUALIFIED/REVISE R1–R6. Q1 focus1/3, other six0/3; development2/83; B70 native12/6432/development40/4884, responsive visual3/3 exhausted, focusEN2/ZH2; F1formal2/180/development3/302. Same counters persist. M+G+B remains conditional on complete seven-unit qualification→fresh Q2/root adoption→valid full P0before→two-CSS geometry G2/G3→versioned baseline→E1–E5→Clock full fixed/final acceptance. No fourth retention attempt is available through MED03.

TASK06 source-review-r2 and latest amendment checkpoint also retain public-host/managed-branch acquisition, zoom factor-vs-percent, raster/DPR/calibration/full frozen context/causal negative/supervision gaps. Copying their unqualified adapter doesn't produce a usable MED03 method. Static MED03 preparation may proceed while dependent visual/native runtime is blocked; complete acceptance cannot. Existing pixel measurements stay protected; new method requires separate technical impact/source review/full qualification/adoption, no outline/rectangles fallback.

## 9. Permanent execution-unit history and budget

This is a source-bound retained census, not a complete lifetime process ledger. Appendix B lists retained artifacts and hashes, separate from actual launches. Log duplicates, assertions, report summaries and repeated copies never count as new processes or erase originals. Missing raw failure/PID/classification remains unknown. Formal cap3 applies per permanent unit, independent of author/path/worktree/name; probes/calibration disclosed separately. Historical undocumented probes do not create known-zero formal budget. Every future run requires root's complete unit-purpose mapping/count/remaining capacity or stays blocked only for that unit.

| Permanent purpose / exact command | Retained launches and truth |
| --- | --- |
| Original meditation package tests; pnpm --filter @repo/plugin-web-meditation test | May initial95 suite; May28 failing94/95 + isolated13PASS + three author95PASS + three independent95PASS plus forced collision probe from dev_log; June/September112/117/134 generations. Actual total/formal-probe classification unknown, no fresh3/3. timer-test-existing.log is shared old package history. |
| Author durable native; node docs/reviews/web-meditation-durable/verify-native-meditation.mjs | One retained passing wrapper, Chrome PID47047 then47093 same profile restart;7 assertion groups, starts2/stops2. Report admits an earlier stalled run without autoplay bypass, raw/PID unknown. Known at least2 wrapper attempts, not7 attempts; final uses autoplay bypass and DOM interactions, insufficient for default-policy trusted-host proof. |
| Independent durable native; node docs/reviews/web-meditation-independent/verify-native.mjs | Source6887879,8 groups, actual PID50081/50172, default autoplay/no bypass, trusted CDP Retry and actual module controls; two-document controller assertions auxiliary. native.log and runner.log embed the same result/PIDs: one known wrapper,2 process launches, not two verification runs. Whole historical total unknown. |
| Independent package; node docs/reviews/web-meditation-independent/verify-tests.mjs | First configuration included setup.ts as test and failed no-suite; corrected invocation134/16 PASS. tests.log/test-runner.log describe same final run, not separate passes. Known at least2 wrapper launches, first raw exit/PID unknown; no discarded test or oracle weakened. |
| Mounted prefs recovery; node docs/reviews/web-save-consumer-inventory/verify-native-med.mjs | Source da35b3b; actual2 downloads/latest-scene/delete/conflict/B/390px/player controls. Report admits unstyled initial probe without CSS and Controls-path correction; final retained log only. At least one earlier probe plus final, exact total/classification unknown. This proves mounted draft recovery only, not current timer history/host lifecycle. |
| Original save defect / package134 / storage126 / lifecycle6 | 20260909-med-reproduction.log green asserts old lost scene; inverse acceptance must differ. Author meditation-tests and storage-tests separately; lifecycle accountDataLifecycle6 distinct purpose from full storage126. Old all-suite counts inherit unit history; no assertion-count arithmetic. |
| Shared host/Features/accepted-caller/G1/visual/focus/vendor | Actual frozen source/report histories and canonical ledgers bind inherited units. Clock blocked measurement history retained; TT08 vendor3 exhaustion does not grant or consume an unrelated new MED vendor run automatically. Register actual purpose/history rather than sharing generic allowance. |
| Genuinely new MED03 semantic source purpose | Existing tests/accepted native cover persistence/time/audio but not one combined user-visible exact-record/End-vs-Dismiss/restart-with-new-id explanation and no-original-start/no-history assertion. This narrow new oracle-source purpose may be separately registered after fresh review. It is not a new full meditation suite/native/host budget. Mixed wrapper must reserve every inherited exercised unit. |

Read source and applicability before reuse, not rerun. Historical native is module fixture, not App/actual router/PWA/full auth/OS audio qualification. Independent runner hardcodes6887879,100MiB archive buffer, WebSocket CDP port; current qualified new runners require pipe/streaming and stricter provenance/lifecycle, so copying it unchanged cannot establish fresh current proof. Retain its accepted scope; no retroactive rejection of MED01/02 or claim all scope remains current. Byte equality table below proves only named source, not dependencies or environment/oracle universality.

## 10. Preserved original r1 disposition, costs and next step (historical)

Preparation iteration1/3; static pass1 FAILED at Python parser before execution/writes (non-UTF-8 stdin payload); author assertions were not reached; runtime/tests/build/lint/browser/native/qualification/probes/vendor/children/push all0. Read-only discovery returned several wrong guessed paths and one shell unmatched glob; corrected to actual package paths/public sources, no runtime. Root metadata correction is preserved, no author retry/reset. No test/runner module imported or executed.

The attempted first standard-library/Git pass failed before execution (SyntaxError: Non-UTF-8 stdin payload), leaving the worktree clean. Root explicitly authorized deterministic encoding-safe two-document construction and immutable input-index/parent/scope/hash/clean closure only; no second author acceptance pass. The constructor reads and hashes immutable inputs, checks fixed parent/clean scope and the two card identities, assembles both complete buffers before writes, then writes exactly two ADDs. The failed suite's ordered312/39labels/933+6evidence/formal-count assertions, full product/source acceptance assertions, all16-row assertion and complete canonical-ID assertion were NOT reached or rerun. Those remain for fresh independent review/root verification; documentary input identity closure cannot retroactively turn author static1 into PASS. Failed static1 remains consumed and FAILED. No second acceptance validation or behavior redesign occurred. Exact staging and command-local hook-disabled commit remain required. Output hashes and commit supplied externally to avoid self-reference.

Outstanding: fresh full independent review; adopted exact contract/scope; full source machinery/review/qualification; old-unit history admission where genuinely needed; usable focus/native host method; original valid before; any bounded documentary/UI correction; independent fixed/affected/full G1/actual vendor/fresh Astra acceptance; root evidence-only reconcile/inventory/remote ancestry/sync. No user question now. No full MED03 acceptance, READY_TO_SHIP, formal item closure or release claim.

Root alone receives/checks/preserves source remotely/integrates/pushes/globalwrites/syncs and archives owned worktree. Child never writes other worktrees or edits existing original files. inputs.sha256 records immutable Git-object bytes using fullSHA:path blob labels and rawtree:fullSHA:path tree labels, plus external: absolute attachment; indexing a dependency hash is identity coverage, not a claim of semantic review of every line.

## 10a. Current correction2 receipt and remaining gates

Author2/3 uses one separately registered static pass for this fixed input/scope. Its source-reading and documentary preservation checks run before any writes; both complete UTF-8 output buffers are assembled before first write. A failed check stops this attempt without a second semantic checker. Author1 static1 FAILED (non-UTF-8 parser refusal) and reviewer1 static1 FAILED (overbroad apps/packages boundary check including four TT08 docs) remain permanently FAILED; neither identity-only closure nor this new correction converts either to PASS or resets historical runtime units.

The completed current static pass checks: exact clean parent and task grant; every immutable source/review identity; original312 ordered tasks/fields,39 exact reversible labels,933 original evidence prefixes plus only6 TT08 additions=939,13/3/3/293 formal states and MED03 pending/empty evidence; current product boundary classified as the exact four accepted TT08 documents;16 ordered oracle rows,11 conditional paths,10 historical log hashes and13 applicability comparisons; complete canonical Clock r2 section14 byte equality; source-grounded R1/R2/R3 predicates and retained no-question/full acceptance boundaries. Static documentary checks are not business, runtime or independent-review acceptance.

Current author costs: preparation iteration2/3; static1 PASS for documentary correction only; runtime/tests/build/lint/browser/native/qualification/probes/vendor/children/push all0. Read-only discovery initially guessed an absent review-directory name; corrected using the immutable commit's file list. No product/test/runner import or execution occurred. Provider/dollar costs are unavailable, not reported as zero. Historical full-suite and mixed-purpose process counts remain unknown where section9 records unknown; no actor/path/worktree reset is granted.

R1-R3 are corrected documentary findings awaiting fresh full independent review2, not self-adopted. All16 behavioral oracles and full source machinery/review/qualification, valid full P0 before, any separately admitted correction, independent fixed/affected/native/visual/trusted-keyboard/account/vendor verification, fresh uninvolved full Astra acceptance and root reconciliation/inventory/remote ancestry/sync are UNRUN here. Source availability, REL-10 generic reset, forced-loss limits, real public host/auth and account/generation boundaries remain explicit prerequisites. No acceptance reduction follows from retaining earlier MED01/02 proofs or the current static result.

Output hashes, exact parent/commit and clean status are supplied in the external handoff to avoid self-reference. Root alone owns remote preservation, integration, push, global writes and sync-check. Stop on any protected/runtime/product-decision need. No adoption, product implementation, full MED03 acceptance, READY_TO_SHIP, formal312 closure, deployment or release is claimed.

## Appendix A - complete canonical Clock r2 G1, verbatim

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- **Judging copies.** The frozen More `boundaries`, Features `downstream` (cases 012 and 014) and Appearance `continuity-export` (cases 006 and 007) failures are judged by their copies: C-FB002, C-RD1 and OE. C-FD1 runs beside them with its predicted outcome and judges nothing. A judging copy that fails is a regression.
- **K-1 and transport.** Every native runner written for this caller uses pipe transport, sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged, with their frozen transport (AppRail acceptance §6 item 10).
- **Drags.** Native drags use trusted CDP input only (§12 rule 14).
- **Product-delta preconditions.** A reused frozen runner may refuse at a precondition bound to an earlier caller's product delta. The verifier then commits that refusal log, and runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance and AppRail E24/E25 precedents, and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.
- **Capacity copies (pre-registered; AppRail acceptance §6 item 10).**
  - **When.** A reused frozen runner aborts with `ENOBUFS` (or any buffer-capacity error) while reading `git archive`, before any test runs.
  - **What the verifier does.** It commits the refusal transcript. It then runs a copy that differs from the frozen runner only in the archive buffer (sized from the measured archive, at least twice its size, or replaced by streaming) and, if the copy lives in a deeper directory, in its `root` depth, plus a header comment.
  - **Requirements.** The copy's diff against the frozen runner is committed. Staged test and fixture files must be byte-identical to the frozen ones. Counts must equal the accepted receipts and the `f9eb4b1` control.
  - **Pre-registered for:** the four Dashboard Header runners (E17), whose 100 MiB buffer is below the `f9eb4b1` archive.
  - **Applies on refusal to:** the three 200 MiB F1 runners `verify-f1.mjs`, `verify-f1-callers.mjs` and `verify-f1-race.mjs` (E15). Their buffer, 209,715,200 bytes, exceeds the 173,905,920-byte archive at the r2 docs head, but later evidence may outgrow it.
  - **Status.** The copy procedure is not a contract revision and needs no separate ruling batch; acceptance reviews each copy.
- **Not rerun.** The Features native host and downstream suites (Features E12/E13) and the AppRail native E9–E14 are not rerun. Their subjects (Features rail departures and drags, and AppRail's own surfaces) are outside the Dashboard packages, and the empty shell, `App.tsx` and tokens diff (E19) plus the `.app-rail`/`.topbar` invariance (E12) bound them. If either bound fails, they must be rerun.


## Appendix B - immutable source applicability and retained artifact census

Historical source 6887879f40be24d7b531f858366b5bc0481cb335; independent evidence 797b4b4b1469ff7e0bef6ddaad3de4bcdebf235d; REL05 source da35b3b8175565f5e99ab9f88da2a788889494d4. Equality below is documentary identity per file, not transitive host/method acceptance.

| Source | Exact path compared with P0 | Byte applicability |
| --- | --- | --- |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/sessionController.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/useAmbientAudio.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/MeditationModule.tsx | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/MeditationPlayer.tsx | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/useMeditationPrefs.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/accountMigration.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/types.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/plugin-web-storage/src/internal/accountScope.ts | DIFFERENT; exact delta review required |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/plugin-web-storage/src/internal/accountDataLifecycle.ts | DIFFERENT; exact delta review required |
| 6887879f40be24d7b531f858366b5bc0481cb335 | apps/web/src/App.tsx | DIFFERENT; exact delta review required |
| 6887879f40be24d7b531f858366b5bc0481cb335 | apps/web/src/providers/AccountStorageGate.tsx | byte-identical; limited historical reuse candidate |
| da35b3b8175565f5e99ab9f88da2a788889494d4 | packages/xai-web-meditation/src/MeditationModule.tsx | DIFFERENT; REL05 remains historical source-bound |
| da35b3b8175565f5e99ab9f88da2a788889494d4 | packages/xai-web-meditation/src/internal/useMeditationPrefs.ts | byte-identical; limited REL05 reuse candidate |

Retained artifact files (10) are NOT process counts. Original unretained failures/probes remain unknown as section9 records. P in this historical table is original r1 parent535ba372116f6be333e529bfd6f8b9ca725ec3be.

| P:path | SHA-256 | Raw summary; no inferred process exit/classification |
| --- | --- | --- |
| docs/reviews/20260908-full-product-audit/timer-test-existing.log | 34fa1cac14661478bb9d1bf99dbcecaf136ed72c981a075180905d0089518842 | packages/plugin-web-time-tracker test:  Test Files  3 passed (3) ; packages/plugin-web-time-tracker test:       Tests  28 passed (28) ; packages/plugin-web-pomodoro test:  Test Files  16 passed (16) |
| docs/reviews/web-meditation-durable/20260909-native.log | ad9ac9cee6ac2039eda8f64f82fdfef6f6915626ad588b6643c80e297bb9a10a | "pass": true, ; "pids": [ |
| docs/reviews/web-meditation-durable/20260909-storage-tests.log | 983035d964d57cb014be62268eb2be9fb78f06c41d7fa5c34eeca934bad076e5 | Test Files  16 passed (16) ; Tests  126 passed (126) |
| docs/reviews/web-meditation-durable/20260909-tests.log | 085fd6caedff295a0f5bab98a1ca0a4b909ad2712bf92e5c93136637828bf092 | Test Files  16 passed (16) ; Tests  134 passed (134) |
| docs/reviews/web-meditation-independent/native.log | 88e077920b32477db5a122098b60bc8a4d0ac35d2827f252d157dc154ee49a8b | "pass": true, ; "pids": [ |
| docs/reviews/web-meditation-independent/runner.log | d37ab032978ebe026c17e017a92d6025e5d31d43746757b7e403ffaa0db71f65 | "pass": true, ; "pids": [ |
| docs/reviews/web-meditation-independent/test-runner.log | 67cd82a90bce8521af84210cf87d04b5e303e66c470bc9262908dbf13c27ec17 | Test Files  16 passed (16) ; Tests  134 passed (134) |
| docs/reviews/web-meditation-independent/tests.log | 4d74b5a562ba2264946d20fe506c684a6e7836b5d85d6bb7513d41efa57fe840 | Test Files  16 passed (16) ; Tests  134 passed (134) |
| docs/reviews/web-save-consumer-inventory/20260909-med-reproduction.log | 582e69df147f92d6a2ad5e16df2ac3814a7c824127cbd38a1e653c12410dc33a | Test Files  1 passed (1) ; Tests  1 passed (1) |
| docs/reviews/web-save-consumer-inventory/20260909-native-med-after.log | eed91f29925b0eb10e4677df44e06b52db83186cbadcb017963f22432cf2cd20 | {"name":"PASS","downloads":2,"scope":"actual module latest scene, delete, conflict, B isolation, configuration/player volume and 390px recovery panel"} |

## Appendix C - preserved original author1 failed static receipt and identity closure

Static1 FAILED before Python execution: SyntaxError: Non-UTF-8 code starting with byte0xe8 in stdin line121, no encoding declared. No output existed; git status remained clean. No author semantic assertions were reached. Full ordered312/39label/evidence939/formal counts, MED16 completeness, product-boundary acceptance and complete canonical-ID assertions were NOT rerun. Fresh independent reviewer/root must check these; no author PASS claimed.

Root explicitly permitted only deterministic encoding-safe output construction and documentary identity/parent/scope/hash closure, with no second static acceptance pass or behavioral redesign. This constructor read 638 immutable blobs, 10 raw Git tree objects and one attachment (649 identities), matched parent-file bytes and pinned authority hashes, and assembled both output buffers before first write. Appendix source equality compares bytes only. Entire original canonical section is copied without algorithm/requirement change. Identity closure is not acceptance or qualification. Author1/3, static1 FAILED; all runtime categories0.


## End source2 verbatim copy

## Appendix B - full independent review2 document, verbatim historical text

# MED-03 full original-proposal independent review r2

**Verdict: APPROVED, conditional documentary contract basis only.** The complete source2 proposal is suitable for root's exact-hash adoption as the MED-03 contract basis. R1–R3 are resolved against immutable product source. No further author correction is requested. This does not adopt the proposal, approve product/runner/test paths, qualify machinery, execute any behavioral oracle, accept MED-03, or close any original audit item.

## Identity, independence and authority

Module **web**; workflow D review responsibility under the sole A-Codex controller. Fresh reviewer /root/parallel_d_med03_full_review_r2, never repair, no children. Requested Astra role is role metadata, not a provider/model billing attestation or different-vendor verdict.

| Identity | Fixed value |
| --- | --- |
| Review direct parent P | 6bcb03c31d7bcd50ac81bd2549f949276fa4d641 |
| Review fixed input I | b52b5da64f1c7ff355b41e49d7972b6c8e8703d1 |
| Product P0 | f9eb4b1f207bc4b46f547b90afc250424b3c8695 |
| Reviewed full proposal S2 | 1e2d0ac42ecdc142c34291294fca09bce1f77dae |
| S2 direct parent | b9ed5f63256620b1135ba9e782f08992923bd3c4 |
| Original full proposal S1 | 23bd8545b317e2d5565ad069aaabd0e65061737b |
| Original independent review R1 | a87f90c40490e3ac02d392fe9f89aa038e439ec5 |
| Original audit O | e041c2bc293b70db367444c62c4300231976dbf7 |
| Canonical Clock r2 | 8bf613962517ee9b80bf51373e8ad88960c570cc |
| Later controller metadata L, read-only steering | 43ba9fcfadb1075bc117b4d75f8888573d1ae2f2 |

Task: docs/reviews/20260908-full-product-audit/parallel-control-r1/task-med03-contract-review-r2.json. Only this review.md and inputs.sha256 are ADD outputs in audit-parallel-med03-contract-review-r2. Own worktree: /Users/lijinlong/.codex/worktrees/audit-parallel-med03-full-review2-20261010/XAI_Desktop. Existing source, evidence, controls, ledgers, inventory, tests, CSS, schema, host, storage, configurations, lockfile and other worktrees are protected. No push, integration, merge/rebase, promotion, release, deployment or D3 is granted.

AGENTS, CLAUDE, shared workflow, multi-machine rules and commit convention were read first; the original goal attachment and parallel authority overlay remain binding. Explicit task no-push/no-runtime boundaries supersede ordinary child sync commands; root owns preservation and sync. The historical mistaken POMO-04 nested card and corrected 7eb8280736e0c30a908120704ea081d43cd12f16 card remain immutable. The corrected MED-03 item equals the original scope-map item.

## Full source and preservation result

The single current static pass read and validated every inherited manifest identity before writing: **737 source2, including all688 review1 and all649 author1**. Manifest closure is **803 unique immutable identities / 25994135 bytes**, with no mismatches. Hashing all inputs is byte coverage; it does not claim that every inherited screenshot was visually inspected or every source line independently reinterpreted.

The full S2 contract and both original documents were read; S1→S2 differences were also inspected. S2 has exactly two ADDs. The proposal at S2, I and P is byte-identical. This review covers the whole original obligation rather than treating R1–R3 as the entire review.

| Preservation check | Current independent static observation |
| --- | --- |
| Original ordered scope | All312 TODO sections[].tasks and all scope-map items retain IDs/order and every original field; original_module restores the literal labels. |
| Original module labels | Exactly39 reversible changes:30 web（project-system） and9 web（跨模块验证索引）; projection to web changes neither action nor ownership gates. |
| Execution schema and states | EXECUTION.items retains ordered IDs/status:13 completed,3 verification_pending,3 in_progress,293 pending;299 unclosed. MED-03 remains pending with empty evidence. |
| Evidence | All933 original entries retained as exact per-item prefixes, only6 accepted TT08 additions,939 total. |
| Product boundary | P0→P apps/packages changes are exactly the four accepted TT08 owning documents, separately classified; executable product/source/tests/CSS and root package/config/lockfile parity remains. No whole-package-equality assertion. |
| Complete MED proposal |16 ordered M03 rows,11 finite conditional paths,10 retained log artifacts and13 source-applicability comparisons preserved. |
| Applicability |9 byte-equal named-file candidates and4 differences. Equality is not host/environment/measurement qualification. |
| Canonical G1 | Entire Clock r2 section14 is retained verbatim as contiguous bytes, including E1–E25, E24 and Rules; source2 only adds a blank separator outside that section. Full canonical text is also appended below. |

**Permanent failure truth:** author1 static1 FAILED at non-UTF-8 Python parsing before assertions/writes; reviewer1 static1 FAILED on its overbroad apps/packages comparison including accepted TT08 documentation. Their unrun tail assertions remain unrun for those actors. Subsequent authorized identity-only construction did not convert either to PASS. Author2 static1 PASS is documentary-only. Current review2 static1 PASS is a distinct registered independent pass; it neither repairs prior attempts nor resets any purpose budget.

## Original decision and actual persisted record

Original action: **定义冥想历史记录、离开修正和重新播放规则**.
Original acceptance: **是否计入离开时长、是否续播和实际记录字段有可测试合同**.
Priority P2, kind 决策, current scope, module web, primary workflow C, sources 02-tasks-time-boards.md and05-visual-ux-audit.md are preserved.

The September MED-01/02 API addendum, author6887879, independent797b4b4 and execution acceptance support running absence included, paused absence excluded, explicit recovery/audio consent and one active/ended row retained until Dismiss. Older no-audio/no-resume prose is superseded by the configurable upgrade and durable execution rules. Design's no-session-history/statistics-ledger exclusion is consistent with the later terminal row. The original audit's completion-record concern does not itself require an append-only archive.

Start→Pause→Resume→End→Dismiss→new Start has an existing semantic resolution: preserve elapsed during pause, rebuild the running deadline on resume, terminalize once at original expiry or manual command time, explicitly remove the ended row, then create a new session identity at elapsed zero using current configuration. Audio synthesis has no recorded media offset. No pause-on-departure, manual away correction editor, history archive, auto-replay, new historical fields or statistics ownership is invented. No conflicting explicit owner rule requiring a new product decision was found.

The source-grounded field table correctly includes version1, owner.kind/accountId/generation, sessionId, revision, phase, durationMs, accumulatedElapsedMs, runStartedAt, deadline, optional terminal endedAt/reason, and the complete prefs snapshot. runStartedAt is the current running segment, not first start; paused fixed rows may retain a deadline without expiring. Expiry clamps elapsed and uses original deadline; manual end clamps rollback. Stored milliseconds differ from floored display seconds. Start-snapshot prefs.volume differs from live player volume. Nested custom scene and color fields are enumerated; no original-start, pause/departure interval, actual-listening, completedAt, replay count, history array or bus/statistics event is inferred.

The controller owns session transitions; captured account/generation/id/revision and native Web Locks guard durable reread/mutation. Failed writes preserve old bytes and retry intent; conflicts refresh the winner. Storage registry/export/delete and generic reset are external lifecycle boundaries, not permission to add another session writer. CmdK reads preferences and produces a module jump, with no active-session/history aggregation.

## R1–R3 complete source correction assessment

| Finding | Source verification and disposition |
| --- | --- |
| R1 | **Resolved.** MeditationModule.tsx session.error alert at330–336 already renders Export failed; recovery.failure independently renders preference export failure at345–351. S2 names both real branches. No absent-UI before failure or duplicate UI is implied. Actual download failure/error visibility, raw-byte preservation, captured click lifetime and unavailable-read oracles remain mandatory. |
| R2 | **Resolved.** accountMigration.ts admits only a non-null non-array object; absent schemaVersion passes that version gate, otherwise Number(schemaVersion) must be1/2/3. Object.entries(raw).every excludes schemaVersion and recursively compares every other supplied value with normalized[key]. It does not require the whole raw object to equal a fully defaulted versioned blob. Schema-less partial/coercible-version admission is described as actual source behavior, distinct from prefs normalization and strict active-row validation. Active legacy admission remains null only. No validator execution occurred. |
| R3 | **Resolved.** Draft wire keys are exactly version,kind,snapshot,sceneDraft,fixedDurationDraft; version1/kind meditation-unsaved-draft. snapshot is pending.current.value returned by the owner-checked hook, the rejected proposal; editor values are current mounted drafts. There is no independent committed backup, baseline raw string, import API or durable forced-loss guarantee. Session recovery remains a separate raw-string file. |

S2's M03-11/12 and conditional module path now use these corrected premises. The API's loose “committed-context” phrase cannot establish a separately recoverable committed object; S2 explicitly prevents that overclaim without modifying the API. Full source accuracy does not imply successful native downloads or post-click acknowledgement.

## Complete16-row review

Every row below is **approved as a required contract oracle; behavioral execution and acceptance are UNRUN**.

| Row | Independent whole-obligation assessment |
| --- | --- |
| M03-01 | Preserve bilingual visible/accessibly named one-record meaning, End/Dismiss/new Start and full id/revision sequence. Current ended-player End/Exit can call dismiss; exact controls/commands must be observed rather than assuming every End preserves the row. |
| M03-02 | Preset/custom/infinite, independent elapsed before/at/after deadline, running/paused absence and rollback are retained. No wall-clock/hardware precision certification follows. |
| M03-03 | Full persisted/nested field semantics, segment start, start volume versus live volume and once-only terminal time are testable without new schema. |
| M03-04 | Public protected App router, shell registration, language, AccountStorageGate/AccountDataGate, Back/Forward, disable/re-enable and both managed/legacy provider branches remain required; direct module fixtures are auxiliary. |
| M03-05 | Real new-document reload and actual complete owned-process close/reopen for running and paused, same isolated profile, recorded PID/exit/source, saved card and explicit audio consent; no closed-process execution claim. |
| M03-06 | CSS overlay and document fullscreen are separate. Native Escape/exit is presentation-only; actual End/Dismiss semantics need their own controls. |
| M03-07 | A/B/locked/A, first-frame isolation, generation/tombstone, held A lock while B operates, pending UI/audio/retry/export after unmount and fresh usability retain full source/host obligations. |
| M03-08 | Two real same-origin documents, real storage/locks and stale Start/Pause/Resume/End/Dismiss plus concurrent termination require independent proof; same-document hook duplication is insufficient. |
| M03-09 | Every command save failure and absent/null versus corrupt/unknown/foreign/read-denied/no-lock source are distinct. Old bytes, visible errors and lawful retry are preserved; prefs fallback does not prove source availability. |
| M03-10 | Genuine default browser policy/trusted action, rejected or nonsettling4s audio resume/retry, cancellation/unmount/account transitions and deadline silence remain. Source late callback risks are not newly reproduced failures. |
| M03-11 | Session raw, mounted proposal and full-account disk export remain separate. Exact five draft fields and actual filename/bytes, setup failures, unavailable source and click lifetime must be observed, not inferred from Blob creation. |
| M03-12 | Captured-owner deletion, generation/tombstone, foreign/device/unassigned preservation and late writes remain; REL-10 preference-only default reset and actual migration predicate are required boundaries. |
| M03-13 | CmdK prefs-only jump and absent history/Statistics consumer are preserved; registry/ownership/export/delete and unavailable-source distinctions remain. |
| M03-14 | Actual host/full CSS EN/ZH375/414/768/1024/1440, genuine200% zoom, all relevant states,44px new targets, hit-tests/containment/pet-hidden resize/pet-on and human-inspected screenshots remain. |
| M03-15 | Trusted forward/reverse Tab, Enter/Space once, Escape, focus restoration/order, pipe/K-1 passive key audit and qualified per-stop pixelFocusWalk remain; outline/rectangle substitutes are forbidden. |
| M03-16 | Full original before/source qualification, fixed and integrated evidence, affected regressions, canonical G1, actual vendor, independent fresh full acceptance and root reconciliation/inventory are mandatory. |

## Finite scope and technical dependency disposition

The11 future conditional Meditation-local paths are exactly four owning docs, MeditationModule.tsx, MeditationPlayer.tsx, internal/sessionController.ts, internal/useAmbientAudio.ts, styles.css and the two new med03 tests. They remain proposals with **zero current product allowlist**. The source-controller entry permits only separately adopted lifecycle/identity exposure, not timing/schema/lock semantics. No module/sourceavailability, shared storage/auth/reset/export/migration, original runner/test or global control repair is silently granted. A no-code result still requires an accepted decision plus full applicable evidence.

Real host and source freshness matter: Meditation's controller is route-local; AccountStorageGate mounts PomodoroSessionHost globally, not Meditation. Language is passed through MeditationSlotHost. Active/session errors and preference recovery already have distinct localized UI. onStart/onExit and player resume.then still require mounted/lifetime verification; audio hook cancellation of an existing request is not proof that a later disposed callback cannot initiate another request.

Session raw export uses current scope at serialization; source does not independently recheck captured owner at actual click. Preference snapshot validates owner at acquisition but has the same click-lifetime proof gap. Full account export deliberately uses the explicitly captured owner/generation even if auth later changes; do not rewrite that source contract to current-scope-only. Native disk receipts and truthful setup/post-dispatch limits remain distinct. Forced reload/crash can lose mounted drafts; raw unreadable backup availability is not manufactured.

Generic resetAllPrefs removes registered non-proposed xai_* entries, including execution keys. REL-10 explicitly requires preference-only reset. That is a shared technical prerequisite, not a new approved destructive policy or a reason to ask the user again. Neither the generic function's existence nor SettingsFooter's default branch proves a particular production caller reaches it; a future claim needs exact caller reachability, reset outcome/race/failure evidence and separate scope. Appearance/Features existing safe behavior remains protected. Source availability likewise needs an adopted shared or Meditation-specific technical contract, not defaults-as-empty evidence.

Shared native/first-frame/focus machinery remains **UNQUALIFIED / I1 open**. The fixed parent contains impact1/review1 and queued impact2 only. Explicit later controller steering bound L's task-shared-native-host-focus-impact-r3.json and shared-impact-author2-failure-receipt.json. Shared impact-author2 consumed FAILED static1 due to normalized-unique versus raw477/2663 counts; no output/commit and all unrun checks remain unrun. L corrects an earlier metadata product_sha typo without repinning this review. Final impact-author3/3 is source-only, not an adopted method; its dispatch was reported by root, and no result is inferred. P-HOST/P-ACT/P-FOCUS/P-OUTER limited technical approvals do not close P-LEDGER. Qualified activation seam never opens the production gate.

Clock retention3/3 and visual3/3 remain exhausted;145checks/41of42 and the last55checks14of14 are not qualification. Q1focus1/3, other six0/3, development2/83; B70native12/6432 and development40/4884; focusEN2/ZH2; F1formal2/180 and development3/302 remain source-bound historical counters. M8/REL and MED historical unknown-purpose holds remain unknown, not0. Holds block dependent work only, without weakening any full acceptance row or creating a fourth attempt.

## Historical evidence and permanent purpose budgets

All10 retained log files were independently hashed; they are artifacts, not ten process runs. All13 applicability entries were compared to P0:9 equal/4 different. App/accountScope/accountDataLifecycle differences and REL05 Module difference prevent unconditional whole-host reuse. The all688/all649 inherited history remains in the new manifest.

| Historical purpose / command | Retained truth |
| --- | --- |
| pnpm --filter @repo/plugin-web-meditation test | Initial95; failing94/95; isolated13; three author95 and three independent95 plus forced-collision probe; later112/117/134. Whole lifetime/formal/probe classification UNKNOWN; no fresh three-run budget. |
| node docs/reviews/web-meditation-durable/verify-native-meditation.mjs |7 groups; final Chrome47047/47093, starts2/stops2; prior stalled no-bypass attempt disclosed with missing raw/PID. At least2 wrappers. Final author DOM clicks/autoplay bypass do not establish genuine default-policy acceptance. |
| node docs/reviews/web-meditation-independent/verify-native.mjs | Fixed6887879,8 groups, Chrome50081/50172, genuine default policy/no bypass, trusted retry and actual module controls. native.log/runner.log duplicate one result/two launches, not two independent passes. Direct controller cases remain auxiliary to UI host. |
| node docs/reviews/web-meditation-independent/verify-tests.mjs | First setup.ts no-suite failure, corrected134/16. tests.log/test-runner.log duplicate final run; earlier raw process gap remains unknown. |
| node docs/reviews/web-save-consumer-inventory/verify-native-med.mjs | Fixed da35b3b,2 real downloads/latest scene/delete/conflict/B/390px/player; earlier unstyled probe/Controls correction retained. Mounted recovery only; green reproduction asserts original lost-scene defect. |
| Storage/lifecycle/accepted callers | Meditation134,Storage126 and accountDataLifecycle6 have separate actual purposes. Full shared/G1/focus/native suites keep all inherited units and refusal histories. |
| Future genuinely new semantic oracle | Exact one-record/End-Dismiss/new-id disclosure source may be separately registered; no renamed full suite/native/host reset. A mixed wrapper reserves all exercised permanent purposes. |
| Vendor | TT08vendor3 does not create or automatically consume a different MED vendor purpose. Actual command/source/purpose/history/actor and raw provider result must be registered; another Codex instance is not cross-vendor. |

No assertions/report copies/count arithmetic erase launches. Cap3 follows actual permanent purpose across actor, path, filename, source SHA and worktree. Unknown missing PID/exit/refusal/probe history cannot become zero; root must resolve or hold that unit. Accepted MED01/02 remains valid within its source-bound scope and is not upgraded to MED03 full acceptance. Historical Date.now-offset module fixtures are not actual public managed-host, PWA, lockscreen or hardware-output certification. Old WebSocket/100MiB runners do not qualify the required pipe/streaming machinery.

## Complete downstream gates and root action

Root may adopt only the exact S2 contract and this full review hashes after checking this receipt and preserving the source commit. The next useful work is a separately registered **complete MED source-machinery/technical prerequisite design**, not author4 or a product patch. It must resolve applicability, host/sourceavailability/reset/export/lifecycle dependencies, exact source paths/resources and permanent-purpose admission without implementing the reviewer findings here.

Required chain remains: full source machinery → independent source review → complete actual qualification with fresh independent qualification review and root adoption → complete valid original P0 before → any exact scoped implementation needed → independent same-oracle fixed plus candidate/integrated/affected/native/visual/trusted-keyboard/account evidence → full canonical G1 with actual judging copies → real different-vendor verification → fresh uninvolved Astra original full acceptance → root evidence-only append-only reconciliation → fresh inventory, remote preservation, integration ancestry and sync. Clock-specific IDs remain Clock evidence; root must map each to valid reuse, pending prerequisite or separately admitted affected purpose, never fabricate MED proof.

E1–E5 precede implementation and E25 is last. Acceptance independently rederives item identities and blocks any missing ID. E15 all16 F1, E16 c1–c5, Header host5/5+5/5+2/2/native18/Astra/Sol, complete E24 caller rows, original failures, C-FB002/OE/C-RD1 judging versus C-FD1 observational, K-1, refusal/capacity copies and E19/E12 native-exclusion bounds all remain intact. No newer-log global rerun or exhausted-method fallback is granted. AppendixA below retains the entire canonical section rather than a shortened list.

## Costs, static read issues and closeout

Review iteration2/3, semantic static1/1 **PASS** for documentary preservation/source checks only. Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children/historical reruns/push/global writes all0. No product, test or runner module was imported or executed. Provider token/currency cost unavailable, not zero.

Read-only discovery guessed absent03-save-storage-reliability.md, Meditation slot.tsx and xai-web-settings-shell paths; actual source paths were located and read. Some combined tool output was truncated and narrowed; these were read errors, not semantic-static attempts, tests or qualification. No static retry occurred. This review's bounded standard-library/Git validation builds both UTF-8 buffers in memory only after all immutable input checks, then writes the exact two ADDs. Tool output/session completion is retained in the session transcript; no asynchronous result is abandoned or reported UNKNOWN. Exact static PID/count/hash/exit receipt is external to the document to avoid self-reference.

One command-local hook-disabled commit stages only the two output paths. Commit/parent/output hashes and clean status are returned externally. Root alone preserves remotely, integrates, updates global controls, runs sync and archives its worktree. No adoption, MED03 business PASS, READY_TO_SHIP, formal312 closure, deployment or release is claimed.

## Appendix A — complete canonical Clock r2 section14, verbatim

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- **Judging copies.** The frozen More `boundaries`, Features `downstream` (cases 012 and 014) and Appearance `continuity-export` (cases 006 and 007) failures are judged by their copies: C-FB002, C-RD1 and OE. C-FD1 runs beside them with its predicted outcome and judges nothing. A judging copy that fails is a regression.
- **K-1 and transport.** Every native runner written for this caller uses pipe transport, sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged, with their frozen transport (AppRail acceptance §6 item 10).
- **Drags.** Native drags use trusted CDP input only (§12 rule 14).
- **Product-delta preconditions.** A reused frozen runner may refuse at a precondition bound to an earlier caller's product delta. The verifier then commits that refusal log, and runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance and AppRail E24/E25 precedents, and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.
- **Capacity copies (pre-registered; AppRail acceptance §6 item 10).**
  - **When.** A reused frozen runner aborts with `ENOBUFS` (or any buffer-capacity error) while reading `git archive`, before any test runs.
  - **What the verifier does.** It commits the refusal transcript. It then runs a copy that differs from the frozen runner only in the archive buffer (sized from the measured archive, at least twice its size, or replaced by streaming) and, if the copy lives in a deeper directory, in its `root` depth, plus a header comment.
  - **Requirements.** The copy's diff against the frozen runner is committed. Staged test and fixture files must be byte-identical to the frozen ones. Counts must equal the accepted receipts and the `f9eb4b1` control.
  - **Pre-registered for:** the four Dashboard Header runners (E17), whose 100 MiB buffer is below the `f9eb4b1` archive.
  - **Applies on refusal to:** the three 200 MiB F1 runners `verify-f1.mjs`, `verify-f1-callers.mjs` and `verify-f1-race.mjs` (E15). Their buffer, 209,715,200 bytes, exceeds the 173,905,920-byte archive at the r2 docs head, but later evidence may outgrow it.
  - **Status.** The copy procedure is not a contract revision and needs no separate ruling batch; acceptance reviews each copy.
- **Not rerun.** The Features native host and downstream suites (Features E12/E13) and the AppRail native E9–E14 are not rerun. Their subjects (Features rail departures and drags, and AppRail's own surfaces) are outside the Dashboard packages, and the empty shell, `App.tsx` and tokens diff (E19) plus the `.app-rail`/`.topbar` invariance (E12) bound them. If either bound fails, they must be rerun.

End of verbatim canonical section14.

Metadata-only closeout: the first staged whitespace check returned exit2 for a blank line at EOF, caused by the intact canonical section separator. Root explicitly authorized appending this neutral end marker after the complete13215-byte section. Both final output buffers were retained before this formatting write; no semantic check, runtime run, review iteration or acceptance was repeated. The original static1 PASS is unchanged.


## End review2 verbatim copy


## Appendix FULL INDEPENDENT IMPACT REVIEW

# MED-03 complete source-machinery independent impact review r1

**Verdict: APPROVED as a conditional technical design basis only.** The whole impact proposal at 5a8d7141d8e032ae08c56a7650cdf47597d717ff, integrated unchanged at f8cc150544e050bbb8f38076b1e5d3c41ca47fac, is suitable for root exact-hash adoption. This is neither adoption nor an API/path/implementation/source-execution grant. No new product decision or author correction is required by this review.

## Identity and authority

Module web; workflow D under the sole A-Codex controller. Fresh uninvolved reviewer /root/parallel_d_med03_machinery_full_review_r1, never repair, no children. Requested Astra is role metadata, not provider/model billing attestation or different-vendor verification.

Direct parent P=26f7875d3dd318d62a08afbf5946036af4b19692; fixed input I=f8cc150544e050bbb8f38076b1e5d3c41ca47fac; product P0=f9eb4b1f207bc4b46f547b90afc250424b3c8695; original audit O=e041c2bc293b70db367444c62c4300231976dbf7. Worktree /Users/lijinlong/.codex/worktrees/audit-parallel-med03-machinery-review1-20261010/XAI_Desktop. Registered MED-03/SOURCE-MACHINERY-IMPACT-REVIEW1 is read from P execution-state.tasks LIST and its exact task card, not the initial registry.

AGENTS.md, CLAUDE.md, project workflow, multi-machine policy, current control plane, original immutable goal attachment, authority overlay and workflow-D prompt govern this task. Current authorization is exactly two ADDs: this review.md and inputs.sha256. All original evidence, source/test/runner/CSS/schema/storage/host/config/lockfile, global control/ledgers/inventory and other worktrees are protected. Root owns remote preservation, integration and sync. Child push and ordinary pnpm sync execution are outside this zero-runtime card.

## Complete inputs and preservation

The single semantic static pass validates every inherited 1216 immutable identity and the complete803/737/688/649 manifests, including historical raw Git trees and the original external goal attachment. It separately binds current authority, actual consulted source and the full impact/source/reviews. The exact final unique identity count, byte total, checker PID, output hashes and command exit are supplied by the external receipt. Hash coverage is not a claim that inherited screenshots were visually rejudged or every dependency line was independently reinterpreted.

All312 original TODO sections[].tasks remain ordered and retain every field; scope-map.items retains the literal original_module and original acceptance. Literal web174 plus web（project-system）30 plus web（跨模块验证索引）9 normalizes to web213; app22/plugin16/sync41/admin16/site4. The39 reversible labels are not replaced with guessed ASCII labels. Nonempty gate_obligations150 is distinct from the118 different gate-policy population, never an equality assertion between them. EXECUTION.items retains ordered IDs/statuses,933 original evidence prefixes plus6 TT08 additions=939, formal13 completed/3 verification_pending/3 in_progress/293 pending and299 unclosed. MED-03 remains pending with empty evidence.

P0 runtime source parity is checked separately from exactly four accepted TT08 owning documents. There is no whole apps/packages equality guard. Full original action and acceptance, all16 M03 rows,11 original conditional paths,23 additional candidates,18 source-role candidates,10 retained logs and13 applicability rows are preserved. The entire canonical Clock r2 section14 is copied verbatim below, including all E24 rows and Rules.

## Original contract and source feasibility

Original action: 定义冥想历史记录、离开修正和重新播放规则. Original acceptance: 是否计入离开时长、是否续播和实际记录字段有可测试合同. The adopted full documentary basis is source2 1e2d0ac42ecdc142c34291294fca09bce1f77dae and review2 291a4175d9ea237451bec9fe87cd9fc6cc736de7, not three isolated corrected sentences.

The MED-01/02 API addendum and historical independent evidence support running absence included, paused absence excluded, explicit recovery gesture and one current running/paused/ended row until Dismiss. They do not require a history list. No original-start timestamp, actual-listening duration, pause/departure log, replay counter, archive, statistics aggregate or history event is introduced. Full nested start preferences, version1, owner kind/accountId/generation, sessionId/revision/phase, durationMs, accumulatedElapsedMs, runStartedAt, deadline and endedAt/reason have source-defined meanings. runStartedAt is the latest running segment; displayed seconds differ from stored milliseconds. Player volume follows live preferences while row.prefs.volume is the start snapshot.

Actual main.tsx invokes service-worker/observability startup and renders StrictMode/AppProviders/RouterProvider. Public route, protected App, AccountStorageGate/AccountDataGate, feature fallback and MeditationSlotHost must remain the acquisition path. AccountStorageGate persistently mounts PomodoroSessionHost; Meditation creates and retains its controller inside the route module. Route unmount removes observers/timer/audio while durable execution remains; no persistent Meditation host or closed-process execution is invented. New document/process identity is required for recovery claims.

AppProviders selects real ManagedAuthSessionProvider only with live non-null configuration; a mock client/config-null fixture selects Legacy. Actual SDK/coordinator, device REST bridge, recovery bridge and Todo startup/nonce lease remain dependencies. An endpoint-only disposable HTTP replacement is technically coherent, conditional on the exact consumed SDK/ReactDOM/config and root capture bytes. No SDK/private-context replacement, direct accountScope activation as managed proof, swallowed auxiliary failure or unknown request can pass readiness. Auth generation is distinct from business scope/generation.

Controller transitions capture scope and expected session/revision, use native Web Locks, reread authoritative bytes, preserve failed-write bytes and refresh conflicts. Start/expiry/reconcile and issued pause/end time retain distinct precedence. Scope/operation tokens do not themselves prove stale UI callbacks are safe: onStart/onExit and Player resume.then can outlive their mount. This remains a source-derived risk for qualified before, not a newly reproduced bug. Existing audio cancellation does not prove that a late callback cannot initiate a new play. Browser default autoplay policy, real trusted gesture, pending/rejected resume and deadline graph shutdown remain required; hardware output is not inferred.

R1 remains resolved: Module session.error and recovery.failure both already render exportFailed. R2 remains resolved: migration admits only a non-null non-array object, absent schemaVersion or Number(version) in1/2/3, then recursively compares every supplied non-version field with validatePrefs(raw)[key]. Normalizing reads, migration admission and strict active validation remain different contracts; unscoped active migration accepts null only. R3 remains resolved: preference download has exactly version/kind/snapshot/sceneDraft/fixedDurationDraft, with snapshot=pending.current.value and latest mounted drafts, no separate committed/raw backup or importer.

Session export preserves the actual raw string, with confirmed absence null and read denial unavailable. Account export intentionally supports an explicitly captured owner/generation after current auth changes; EX concerns current caller authorization immediately before download, not rewriting the shared export API. All three downloads require real disk-byte capture, source coherence, setup failures and real mid-owner transition at serialization/append/click boundaries. Browser/OS acknowledgement after click stays uncertain; forced reload/crash can lose mounted drafts. Cancel/Stay must retain them; permitted loss does not manufacture durable draft storage.

REL-10 already requires preference-only generic reset. resetAllPrefs currently removes registered non-proposed xai_* entries; both Meditation keys have category module. A category===pref shortcut is wrong. RS requires a complete key-purpose table, accepted override/reachability mapping and truthful false/throw outcomes. Utility/SettingsFooter default-branch existence alone does not prove actual App reachability. No new destructive-reset decision or shared owner rewrite is implied.

## Whole16-row acquisition and qualification assessment

All rows below are approved as mandatory technical obligations; behavioral results are UNRUN.

| Row | Independent assessment of actual emitter and falsification control |
| --- | --- |
| M03-01 | Public native visible/AX bilingual record explanation plus full Start/Pause/Resume/End/Dismiss/new-id sequence; wrong archive disclosure, reused id and early deletion must fail. End/Exit already on ended state is observed as dismiss with explicit removal disclosure. |
| M03-02 | Independent known-time auxiliary fixtures plus real route/new-document timestamps cover preset/custom/infinite, before/at/after deadline and rollback. Product elapsedAt cannot supply its own expected oracle; paused expiry and wrong segment math controls are causal. |
| M03-03 | Acquisition records exact full active/nested prefs and live volume. Extra history fields or first-start/listening claims fail; resume segment and immutable start snapshot remain distinct. |
| M03-04 | Actual startup/public route/rail/history/feature transitions and departure recorder cover both real auth branches. Helper-only/omitted-startup negatives cannot establish host proof; cancellation versus one allowed location commit remains visible. |
| M03-05 | New loader/document and complete owned Chrome exit/relaunch with same profile distinguish recovery from remount. Running/paused/ended, zero autoplay, leaked process and repeated terminal writes have explicit controls. |
| M03-06 | Actual native fullscreen Enter/Escape/exitFullscreen and CSS player controls remain separate. Presentation-only mutation fails; phase-aware End versus Dismiss must match disclosure and command. |
| M03-07 | Managed A/locked/B/A, first synchronous publication, generation/tombstone, held A lock and B usability cover raw/UI/audio/retry/export continuations. Same-task restored foreign content must be caught; fabricated scope events alone are not managed evidence. |
| M03-08 | Two real documents with native storage/Web Locks prove winner, stale Start/Pause/Resume/End/Dismiss, one terminal revision and usable fresh action. Stub locks/same-document duplicates are negative acquisition controls. |
| M03-09 | Faults at every command read/write/remove, no-lock, malformed/foreign/unknown/denied/absent/null and repaired/stale-event sources remain distinct. Old bytes/draft/error and false-versus-throw outcomes are acquired at real effects. |
| M03-10 | Default-policy real AudioContext and trusted gesture cover rejection/nonsettling4s/late success/deadline gain/disposal. Autoplay bypass refuses judging admission; hardware audio is outside demonstrated evidence. |
| M03-11 | Three real emitters produce raw session, exactly five-field proposal and account export disk bytes. Blob/URL/append/click setup faults, owner change, missing/wrong file and post-click uncertainty cannot become Saved. |
| M03-12 | Actual deletion/generation/tombstone/migration plus separately admitted real reset reachability preserve B/device/unassigned data. Complete codec table and pref-only key classification retain compatibility and detect false removals. |
| M03-13 | Public CmdK prefs jump, storage declarations/consumers and key census preserve no-history/no-statistics contract. Fabricated history consumer or unavailable-as-known-empty must fail. |
| M03-14 | Full real CSS/host EN/ZH375/414/768/1024/1440, genuine200% zoom, player/error/disclosure states,44px new targets, pet-hidden after resize and pet-on, hit/containment/overflow/screenshots require qualified method and independent visual judgment. |
| M03-15 | Full-shell forward/reverse Tab, trusted Enter/Space once/Escape, injective DOM/AX descriptors and every stop's focused/moved-on pixels retain pipe/K-1. Fake events, missing outside stops, adjacent-only ring, transient wrong value and descriptor collision must fail. |
| M03-16 | Supervisor/oracle index covers every16 row and canonical evidence identity, fixed/integrated/affected/native/vendor/fresh acceptance lineage. Missing row/hash, wrong source, reused actor, unjoined stream or forged vendor refuses. |

Q-M01..Q-M16 need finite independently derived subcases in the future exact source contract. Q-A1 admission, Q-A2 actual loaded/source/HTTP closure, Q-A3 synchronous acquisition, Q-A4 real process/stream/finalizer failures and Q-A5 actual forced loss are not result-JSON-only tests. Each requires healthy and cause-specific negative specimens at the genuine emitting entrypoint. Full inherited A01-A14 synchronous acquisition and complete raster/focus/real-menu controls remain mandatory; they are not shortened to Q-A3.

## Finite protected exceptions and source roles

All34 candidate paths remain protected pending a later exact card. The original11 remain four owning docs, Module, Player, sessionController, useAmbientAudio, styles and two new med03 tests; no timing/schema/lock rewrite, original-test replacement, shared CSS or measurement edit is authorized. The additional23 are exactly AV1-AV9, RS1-RS8, EX1-EX6 from the proposal, independently assessed as follows:

| Candidate group | Technical disposition and limits |
| --- | --- |
| AV1-AV9 | Local useMeditationPrefs plus pure prefsSource and new tests are feasible consumers of a narrowly additive public subscribeSameTab export and four persistence docs. The existing observer uses captured physical scope and payload notifications; it supplies no authoritative read receipt. Caller rereads raw bytes with pre/post scope checks on same-tab/native clear/removal/visibility/pageshow/scope/explicit source Retry and immediately before operations. Preserve normalizing codec compatibility, pending proposal/baseline and no automatic retry-write on recovery. Source Retry is read-only and adds a declared focus stop. The generic reader/setter/bus/accountScope/registry remain protected. |
| RS1-RS8 | Existing reset utility, optional footer feedback, two additive tests and four owning docs are a finite REL-10 prerequisite. Complete target classification, source reachability, caller overrides and truthful partial/false failure must be frozen before implementation. Registry category/default changes and public types/index are not included; needing them requires fresh finite impact review. |
| EX1-EX6 | AccountPane caller-only lifetime/current-authorization recheck, additive test and four owning docs preserve captured-owner exportAccountLocalData semantics. Requires reproduced qualified before, real click-boundary race and disk evidence; no shared auth/deletion/export engine rewrite. |

All18 machinery candidates under audit-parallel-med03-machinery-source-r1 have bounded roles: contract/inputs/cases/dependencies/purpose-history are declarative source; run-unit is builtin-first supervision; host.html/host-entry preserve actual main correspondence; managed-http replaces endpoint transport only; acquisition owns transparent preimport observation; native-driver owns trusted pipe/profile/document/disk actions; semantic-fixture is auxiliary; visual-focus binds qualified real-host capture; command-lane gates every inherited family; oracle independently checks expected semantics; qualification-controls supplies real causal specimens; qualify uses actual emitters/supervisor; source-receipt discloses closure and holds. None is created or executed here.

Mode declarations source-selfcheck, qualify-host/acquisition/storage-export/audio/native-focus, business-before, candidate-fixed, integrated-fixed and affected-g1 are proposed interfaces. No default/all mode; mixed wrappers reserve every actual permanent purpose before launch. Future exact immutable output names and independent payload schemas must identify a producer for raw streams/journal/environment/cases/disk/screenshots/keys/final index/post-close receipt. No wildcard output grant or emitter self-certification follows.

## Acquisition, lifecycle and source admission

The proposal requires actual resolved browser/Vite loaded closure, transformed/optimized/dynamic modules, service worker, CSS/fonts/assets, SDK/ReactDOM/config and approved build inputs, not version strings or a recursive installed-tree hash alone. Requested/resolved full Git SHA, streamed measured archive and lock hash df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9 remain fixed. No install or main-checkout writes. Exact root capture must already exist before card parsing; missing bytes/outer capture are source-admission holds.

Builtin-only bootstrap opens exclusive stdout/stderr/emergency/journal before imports and checks root-issued single-use reservation, source/adoption/qualification/history/resources and realpaths. Finite overall and phase limits must be explicit in the later card; absence refuses, and no historical limit is enlarged here. Parent/child/descendant identity, stream drains, queued writes, cancellation and finalizers are joined; Promise.race is not cancellation. PASS cannot precede terminated/reaped children, both closed streams, immutable sealed artifacts and independent post-close durable receipt. Uncertain descendants remain QUARANTINED_UNJOINED/UNKNOWN; failed final persistence remains failed.

First-frame/property acquisition includes same-task restoration, detached mutation and actual ReactDOM input forwarding. Native/focus keeps authentic calibration, full document/screen scale/clip/DPR/zoom/Retina context, injective whole-shell stop census and genuine menu zoom; no rectangle/outline fallback. New source/method qualification must finish and be independently adopted before business before. Shared five-row P-HOST/P-ACT/P-LEDGER/P-FOCUS/P-OUTER design adoption at additional b732493 does not qualify a method. Historical impact3 UNADOPTED wording remains immutable historical truth. Missing consumed bytes/config/root capture and retention3/3, visual3/3, M8/REL unknown histories stay local holds. Canonical activation remains qualification-only, production closed; Meditation's own native lock neither needs nor clears that gate.

## Historical purposes and immutable costs

All historical sources/logs and source1/review1/source2/review2 remain bound. The13 applicability rows independently yield9 equal named-file candidates and4 differences (old App/accountScope/accountDataLifecycle and REL05 Module); they cannot grant whole-host/environment reuse. Ten log files are artifacts, not ten processes.

| Permanent unit | Retained source-grounded history; no new allowance |
| --- | --- |
| Meditation package | pnpm --filter @repo/plugin-web-meditation test: initial95; failing94/95; isolated13; three author95 and three independent95 plus forced-collision probe; later112/117/134. Lifetime formal/probe partition UNKNOWN. |
| Author durable native | node docs/reviews/web-meditation-durable/verify-native-meditation.mjs:7 groups, Chrome47047/47093, starts2/stops2; earlier no-bypass stall lacks raw/PID. At least2 wrappers; final autoplay bypass/DOM clicks do not judge genuine defaults. |
| Independent durable native | node docs/reviews/web-meditation-independent/verify-native.mjs:fixed6887879,8 groups, Chrome50081/50172, genuine default policy/trusted retry. native.log/runner.log duplicate one wrapper/two launches. Direct-controller rows remain auxiliary to full host. |
| Independent package wrapper | verify-tests.mjs first setup.ts no-suite failure then134/16; tests.log/test-runner.log duplicate final run, earlier raw process gap remains unknown. |
| Mounted proposal recovery | verify-native-med.mjs fixedda35b3b,2 actual files/latest scene/delete/conflict/B/390px/player. Earlier unstyled probe/Controls correction retained. Green original reproduction asserts lost scene, not recovery acceptance. |
| Shared storage/lifecycle/reset/export/auth | Storage126 and lifecycle6 retain distinct purposes and actual histories; AV/RS/EX labels do not create0/3. Unknown family history stays held. |
| Native/method/focus/G1 | Retention3/3,145checks/41of42 and last55checks14of14 do not qualify. Visual3/3; Q1focus1/3 othersix0/3; development2/83; B70native12/6432/development40/4884; focusEN2/ZH2; F1formal2/180/development3/302 persist. All canonical commands/refusals/judging copies retain their own purpose history. |
| Vendor | TT08vendor3 neither grants MED attempts nor automatically consumes a distinct MED purpose. Actual provider/command/source/actor/raw result/time/cost and historical purpose must be registered. Fresh Codex is not cross-vendor. |

Author1 static parser FAILED before body; review1 static FAILED overbroad apps/packages guard; identity-only closures did not repair them. Source2/review2 static PASS remain distinct documentary attempts. Shared author2 failed raw-versus-unique assertion and final author3 exhaustion remain. POMO review1 pretool JavaScript construction failure is checker0, not an actual checker launch; DASH final unsupported118 predicate failure and BK unknown session remain unchanged control-plane history. Actor/path/worktree/mode/source rename, duplicate log or asserted count never resets an actual-purpose cap. Novel record-disclosure oracle source is not a fresh full-suite/native/host budget.

## Required downstream chain and current limits

Root may adopt only exact complete impact plus this review hashes. Next is a separately registered complete source contract with required consumed bytes/root capture and finite path/resource/history admission, then fresh source author and independent full source review; actual whole qualification, fresh independent qualification review and root adoption; valid full original P0 before with predicted failures and positive controls; fresh exact scoped implementation only if needed; unchanged-oracle fixed AND integrated/affected/native/visual/trusted-keyboard/account evidence; full canonical G1 with actual judging copies; real different-vendor verification; fresh uninvolved Astra original full acceptance; root append-only evidence reconciliation; inventory and remote original/integration ancestry/sync. No source/runtime start is implied by this technical APPROVED.

E1-E5 precede implementation, E25 is last and enumerates E1-E24; missing ID blocks. Complete E15 sixteen F1, E16 c1-c5, E17 Header fixed/P0 host5/5+5/5+2/2/native18/Astra/Sol and E24 counts remain mandatory. C-FB002/OE/C-RD1 judge, C-FD1 observes; frozen failures/refusal/capacity-only copies/K-1/pipe/trusted drag and E19/E12 exclusion bounds remain unchanged below. A blocked method never silently changes a row to N/A.

Review1/3, static1/1 PASS means documentary identities/preservation and conditional technical review only. All inputs and both final UTF-8 buffers were held before any filesystem write. Standard-library/Git reads do not import product/tests/runners. Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children/push/globalwrites all0. Provider token/currency unavailable, not0. Some combined read output was truncated then narrowed; these read issues were not checker attempts. No semantic retry occurred. Actual command/PID/session/chunk/exit and final artifact hashes are retained externally, avoiding self-reference.

Exactly two paths are staged in one command-local hook-disabled commit with Why/What/Scope/Risk/Docs/Tests. Root alone preserves remotely, integrates, updates controls and runs sync. MED-03 business acceptance, READY_TO_SHIP, formal312 closure, deployment and release remain unclaimed.

## Appendix A - complete canonical Clock r2 section14, verbatim
## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- **Judging copies.** The frozen More `boundaries`, Features `downstream` (cases 012 and 014) and Appearance `continuity-export` (cases 006 and 007) failures are judged by their copies: C-FB002, C-RD1 and OE. C-FD1 runs beside them with its predicted outcome and judges nothing. A judging copy that fails is a regression.
- **K-1 and transport.** Every native runner written for this caller uses pipe transport, sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged, with their frozen transport (AppRail acceptance §6 item 10).
- **Drags.** Native drags use trusted CDP input only (§12 rule 14).
- **Product-delta preconditions.** A reused frozen runner may refuse at a precondition bound to an earlier caller's product delta. The verifier then commits that refusal log, and runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance and AppRail E24/E25 precedents, and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.
- **Capacity copies (pre-registered; AppRail acceptance §6 item 10).**
  - **When.** A reused frozen runner aborts with `ENOBUFS` (or any buffer-capacity error) while reading `git archive`, before any test runs.
  - **What the verifier does.** It commits the refusal transcript. It then runs a copy that differs from the frozen runner only in the archive buffer (sized from the measured archive, at least twice its size, or replaced by streaming) and, if the copy lives in a deeper directory, in its `root` depth, plus a header comment.
  - **Requirements.** The copy's diff against the frozen runner is committed. Staged test and fixture files must be byte-identical to the frozen ones. Counts must equal the accepted receipts and the `f9eb4b1` control.
  - **Pre-registered for:** the four Dashboard Header runners (E17), whose 100 MiB buffer is below the `f9eb4b1` archive.
  - **Applies on refusal to:** the three 200 MiB F1 runners `verify-f1.mjs`, `verify-f1-callers.mjs` and `verify-f1-race.mjs` (E15). Their buffer, 209,715,200 bytes, exceeds the 173,905,920-byte archive at the r2 docs head, but later evidence may outgrow it.
  - **Status.** The copy procedure is not a contract revision and needs no separate ruling batch; acceptance reviews each copy.
- **Not rerun.** The Features native host and downstream suites (Features E12/E13) and the AppRail native E9–E14 are not rerun. Their subjects (Features rail departures and drags, and AppRail's own surfaces) are outside the Dashboard packages, and the empty shell, `App.tsx` and tokens diff (E19) plus the `.app-rail`/`.topbar` invariance (E12) bound them. If either bound fails, they must be rerun.


End of unchanged canonical section14.

Validated corpus: 1307 unique identities / 37463698 bytes; inherited1216/803/737/688/649 complete.


## Appendix FULL ORIGINAL REVIEW: R1/R2/R3 and failed-pass truth

# MED-03 complete original-contract independent review r1

**Verdict: REVISE, documentation proposal only.** Three source-description corrections are required before adoption. The original away-time, explicit audio recovery and no-history-ledger choices are supported by existing accepted rules; no new owner question is established. This review does not accept or close MED-03, grant product writes, or authorize runtime execution.

## Fixed identity and independence

Module web, workflow D; fresh reviewer /root/parallel_d_med03_contract_review_r1, never repair. Task-card Astra role is requested role metadata, not provider-model attestation or cross-vendor evidence. Review1/3, no children.

| Identity | Fixed value |
| --- | --- |
| Review parent | 2236ab6b87d2ec423e7e5920e6dfdd3ef0f7c8ad |
| Review fixed input | a489adcb1205c56623738a8fa54696e40f22d17a |
| Product P0 | f9eb4b1f207bc4b46f547b90afc250424b3c8695 |
| Preparation source | 23bd8545b317e2d5565ad069aaabd0e65061737b |
| Preparation direct parent | 535ba372116f6be333e529bfd6f8b9ca725ec3be |
| Preparation contract SHA-256 | e4e4aa66c6e2e0fe1e93f2c695296f419fd7ae5b0981a8c5589367326beb0ee2 |
| Explicit metadata amendment | 7eb8280736e0c30a908120704ea081d43cd12f16 |

Preparation is exactly two ADDs, contract.md and inputs.sha256. Both the original nested POMO-04 metadata mistake and the explicit corrected MED-03 card are preserved. The amendment does not repin original inputs, reset cost or alter the original item. Current writes are exactly this directory's new review.md and inputs.sha256. All product, tests, runners, CSS, schema/storage/account/host/config/lockfile, original evidence, global control/ledgers/inventory and other worktrees remain protected. Child push/integration/promotion/release/D3 is forbidden.

## Failed static pass and authorized documentary closure

The preparation author's static1 remains **FAILED before Python execution/assertions/writes**, with the recorded non-UTF-8 stdin SyntaxError. Root's earlier deterministic output assembly did not convert that into author PASS. This reviewer independently attempted the full preservation/source pass once. **Reviewer static1 also remains FAILED**, before any output writes: its final fail-closed check rejected `product_boundary_empty` because the predicate compared all apps/packages paths, including previously accepted documentation. It did not discover a runtime code delta.

The exact diagnostic command was `git diff --name-status f9eb4b1f207bc4b46f547b90afc250424b3c8695 2236ab6b87d2ec423e7e5920e6dfdd3ef0f7c8ad -- apps packages pnpm-lock.yaml package.json pnpm-workspace.yaml`. Its entire result was these four modifications:

- packages/plugin-web-time-tracker/docs/api.md
- packages/plugin-web-time-tracker/docs/design.md
- packages/plugin-web-time-tracker/docs/dev_log.md
- packages/plugin-web-time-tracker/docs/test.md

These are accepted TT08 documentation baseline changes. The worktree remained clean; no review output existed. Root explicitly authorized deterministic documentary-only two-output construction and immutable input/output/parent/scope/hash closure within review1, while permanently retaining static1 FAILED and prohibiting a second static/semantic assertion pass or retroactive PASS. That instruction is the sole basis for this subsequent assembly. It grants no changed acceptance predicate or runtime work.

All **649 preparation identities** were read and hashed:638 Git blobs,10 raw Git trees,1 original attachment. This review index has **688 unique immutable inputs** including independently consulted fixed inputs. All indexed bytes and both complete output buffers were prepared before the first write. Hash closure is documentary identity, not qualification or a second static review. No product/test/runner module was imported or executed.

The following assertions were reached and evaluated true in the failed reviewer pass; they are retained observations, **not an overall static PASS**:

| Reached check | Observed result before failure |
| --- | --- |
| Ordered original scope |312 original tasks, scope-map items and execution records in the same order; all original task fields match with original_module restoring original labels. |
| Reversible modules |39 changed labels; original TODO unchanged. |
| Formal execution |All IDs/order/status unchanged;13 completed,3 verification_pending,3 in_progress,293 pending;299 unclosed. |
| Original evidence |933 original entries remain exact prefixes;6 TT08 additions only;939 total. MED-03 remains pending with empty evidence. |
| Corrected metadata |Amended original_item equals immutable MED-03 scope-map item; original POMO-04 card preserved. |
| Proposal coverage |All16 M03 rows ordered and11 unique finite conditional paths inside Meditation. |
| Canonical G1 |Full Clock r2 section14 equals copied appendix, including E1-E25 in order, E24 rows and all Rules. |
| Historical logs |All10 AppendixB log entries and hashes match source. |
| Applicability |All13 named historical source comparisons:9 equal,4 different. |
| Failure honesty/source identity |Author FAILED/unrun statements retained; source contract equals fixed-input and review-parent contract. |

The overbroad boundary assertion evaluated false. All checks after that fail-closed point, output construction in that attempted pass and its success receipt were unrun. Subsequent constructor performs identity closure only. A fresh review2 must independently assess the appropriately classified product/documentation boundary and rerun all required preservation/contract assertions after author2 correction. No product drift waiver or static budget reset is inferred.

## Required corrections

### R1 - P2: session export error visibility already exists

Preparation contract section5 says exportFailed rendering is inside preference recovery and session-only error visibility may need correction. Fixed P0 `packages/xai-web-meditation/src/MeditationModule.tsx:330-336` already renders Export failed under the session.error block beside Export session data. Lines345-351 independently render preference-recovery failure. This Module file is byte-identical to accepted durable source6887879. The incorrect current-state premise could produce a fabricated before failure and unnecessary product repair.

Correct the source description to name both rendering sites and conditions. Preserve M03-11's real disk bytes/filename, thrown URL/Blob/append/click errors, original save-error preservation, owner/lifetime-bound click and read-denial requirements. A click-boundary scope recheck and post-dispatch download acknowledgement remain separate unproved matters; existing text does not establish them. Do not add duplicate UI or weaken an oracle. No runtime defect was reproduced.

### R2 - P2: retain the actual legacy migration admission predicate

Preparation contract section5 says supported prefs v1/v2/v3 are accepted only when raw values agree with normalized values. Fixed P0 `internal/accountMigration.ts:9-14` also accepts an absent schemaVersion; present values use Number(schemaVersion) membership in1/2/3. The schemaVersion field is explicitly excluded from equality checks. Every other supplied raw field must match its normalized counterpart; the entire raw object need not equal a fully defaulted object. Schema-less partial objects can therefore be admitted when every supplied field is valid. This is source deduction, not an executed probe. Active migration at line18 still admits only null.

State absent-version handling, numeric coercion and supplied-field comparison explicitly. Distinguish preference normalization, legacy migration admission and strict active-row validation. Preserve M03-12 coverage of currently admitted legacy values rather than silently narrowing compatibility. Do not change the validator or raise a new product-owner policy question; any desired change would need separate authorization.

### R3 - P2: identify the rejected preference snapshot without promising a separate committed backup

Preparation contract section5 describes committed-context settings/scenes plus the rejected proposal/latest editor but does not name the actual export wire fields. Fixed P0 `MeditationModule.tsx:314-320` serializes exactly version, kind, snapshot, sceneDraft and fixedDurationDraft. `internal/useMeditationPrefs.ts:59` returns pending.current.value: snapshot is the rejected proposed preferences value. There is no separate committed preference object, prior raw-byte copy or pending baseline string in this download. Unchanged fields may be carried within the proposed value; they do not constitute an independently recoverable committed version. The API's loose committed-context prose is not authority to invent absent backup fields.

Enumerate all five top-level fields and the source/lifetime of snapshot/editor drafts. Explicitly exclude a separate committed copy and import API; preserve forced reload/crash loss and owner-checked export limits. M03-11 must inspect those exact downloaded values without demanding new fields or schema changes. Session raw export remains a distinct raw-string artifact. This is a documentation ambiguity with a source-defined resolution, not an unresolved owner decision.

## Full original obligation and existing authority

MED-03 remains the original action **定义冥想历史记录、离开修正和重新播放规则** and acceptance **是否计入离开时长、是否续播和实际记录字段有可测试合同**. This review does not reduce that obligation to copy-only completion. Empty item evidence does not imply zero historical processes.

The explicit MED-01/02 API addendum, author6887879 receipt, independent797b4b4 acceptance and EXECUTION.md establish running absence included, paused absence excluded, explicit silent recovery until audio consent, and one active/ended account-owned device-local row without a session-history ledger. Earlier no-audio/no-resume design prose is superseded; no-history/statistics-consumer exclusions remain consistent. The original September audit asks for completion evidence, not necessarily an append-only archive; the accepted terminal row resolves that distinction in kind. MED-03 still requires its own complete acceptance.

The controller supports fixed expiry at original deadline once, pause accumulation, resume's new runStartedAt/deadline, manual end with rollback clamp, infinite sessions and id/revision conflicts. runStartedAt is a running-segment start, not first start. Stored prefs.volume is a start snapshot while the actual player uses live prefs.volume. The proposal enumerates session fields and nested preference/custom-scene/color fields without inventing listened duration, pause intervals, original start, completedAt, replay count, statistics events or history arrays. End persists a terminal row; Dismiss removes it. Current player's End/Exit delegates to dismiss when already ended, so exact visible naming and resulting commands must be verified. New Start after dismissal has a new identity/zero elapsed; ambient synthesis has no saved media offset.

No conflicting explicit source establishes a minimum owner question for these already decided choices. R1-R3 require source-accurate documentation; no draft question was sent to the user and no destructive reset/history policy is inferred.

## Full16 acceptance-row assessment

These are contract-content observations; behavioral/native/fixed acceptance for every row remains **UNRUN**.

| Row | Required scope retained and review observation |
| --- | --- |
| M03-01 |EN/ZH record meaning, End/Dismiss/new Start, id/revision/field sequence; explain current ended-state End/Exit rather than assuming it preserves terminal bytes. |
| M03-02 |Preset/custom/infinite, independent elapsed before/at/after deadline, running/paused absence, rollback, no invented pause-on-departure or correction editor. |
| M03-03 |Exact session/nested prefs fields; segment start vs first start; milliseconds vs display seconds; original expiry/manual timing and live volume vs snapshot. |
| M03-04 |Actual public host/router, rail/Back/Forward/feature gating, saved return, Managed/Legacy auth branches. Route-local Meditation differs from globally mounted PomodoroSessionHost. |
| M03-05 |Real new-document reload and complete owned browser-process close/reopen for running and paused, exact profile/PID/id/deadline, silent recovery and explicit consent. |
| M03-06 |CSS overlay vs native fullscreen; presentation-only Escape/exit retains session; actual End and Dismiss exact command consequences. |
| M03-07 |A/B/locked/A, generation/tombstone/first frame, held A lock/B independence, late UI/audio/retry/export/unmount. Source continuation risks are not reproduced failures. |
| M03-08 |Two real documents/native locks/storage, stale Start/Pause/Resume/End/Dismiss, concurrent termination one revision and fresh commands usable. |
| M03-09 |Every write-action failure and corrupt/unknown/foreign/read-denied/no-lock source; original bytes, absence distinction and truthful retry. Pref defaults do not prove available data. |
| M03-10 |Default audio policy, actual trusted gesture, rejected/nonsettling4s retry, pause/unmount/scope cancellation/deadline silence; no hardware certification claim. |
| M03-11 |Separate session/prefs/full-account disk exports and failure/lifetime oracles; R1/R3 correct premises/payload, without import or durable draft guarantee. |
| M03-12 |Deletion/generations/tombstone/foreign preservation, reset dependencies and migration; R2 corrects legacy admission description. |
| M03-13 |CmdK prefs-only module jump, no active/history/stats consumer; source availability remains a separately adopted prerequisite. |
| M03-14 |Actual host/full CSS EN/ZH375/414/768/1024/1440 and200% zoom, applicable states,44px new targets, containment/hit-tests/pet-hidden resize/pet-on and inspected screenshots. |
| M03-15 |Trusted Tab/ShiftTab/Enter/Space once/Escape, focus restoration/order, pipe/K-1 passive audit and qualified per-stop pixelFocusWalk; no outline/rectangle substitution. |
| M03-16 |Complete before/source qualification/fixed/affected/native/canonical G1/actual vendor/fresh independent original acceptance/root reconciliation/inventory. |

## Finite scope and shared prerequisites

The future conditional list has exactly11 Meditation-local paths: docs/design.md,docs/api.md,docs/test.md,docs/dev_log.md; src/MeditationModule.tsx,src/MeditationPlayer.tsx,src/internal/sessionController.ts,src/internal/useAmbientAudio.ts,src/styles.css; src/__tests__/MeditationModule.med03.test.tsx and src/__tests__/MeditationPlayer.med03.test.tsx. These are proposals, not granted edits. Any timer/schema/lock semantic change, useMeditationPrefs availability guard, shared host/auth/reset/export/migration change or new evidence runner requires separate impact/review/adopted exact scope.

REL-10 already requires preference-only default reset. Current generic resetAllPrefs removes registered non-proposed xai_* keys including both Meditation keys; this is an unresolved technical prerequisite, not accepted permission to destroy execution rows. Account export intentionally supports the captured owner's current generation even across later auth change; deletion has separate lifecycle lock/receipt/tombstone prerequisites. M03-12 cannot claim retention from disclosure alone. Browser eviction/account deletion/reset/forced loss are not indefinite archive guarantees. Unreadable preference-source handling needs adopted technical scope, not a default-as-empty oracle. Reviewer performs no shared repair.

## Canonical G1 and full future gates

The failed static pass compared entire canonical Clock r2 section14, not just IDs: ordered E1-E25, complete E24 rows and Rules matched. E1-E5 precede implementation, E25 is last, every ID must carry producing commit/artifact/hash/verdict/applicability and independently rederived identity; no missing-ID waiver. Clock evidence retains Clock attribution; root maps valid reuse/dependency/new admitted purpose without fabricating MED03 proof.

E15 retains all16 F1 invocations and E16 c1-c5. E17 retains Header host5/5+5/5+2/2,18native modes and Astra/Sol controls. E24 retains AppRail26/31/21/18/24/22/33/123+host31; Appearance65/89/34/56/33/48/187+host33/package137; Features17/49/31/40/26/6+host40/package45/readers17; More22/20/14/13+original15/host11; Sticky109/10/28; Notifications41/24/15/12; DateTime7; accepted SmartLists/Collaborate/Pomodoro host copies; settings-shell54/rest314. More frozen+C-FB00210/10, Appearance24/26+OE26/26, Features13/15+observational C-FD1 14/15+judging C-RD1 15/15 stay distinct. Rail165/104, Appearance K-1 135/123, refusal/capacity-only exact copies, unchanged assertions and E19/E12 exclusion bounds remain. No global rerun merely for fresh logs.

Full source machinery/review/qualification precedes valid full original P0 before, exact scoped implementation if needed, independent fixed/affected/native/visual/keyboard, actual cross-vendor verification, fresh uninvolved full Astra acceptance, root-only append-only evidence reconciliation and inventory/remote ancestry/sync. Another Codex instance is not cross-vendor.

Shared method remains UNQUALIFIED/REVISE: retention3/3 exhausted,145checks/41of42passing; last55checks14of14 is not qualification. Q1focus1/3, other six0/3, development2/83; B70native12/6432 and development40/4884, responsive3/3exhausted,focusEN2/ZH2; F1formal2/180 and development3/302 remain. Complete seven-unit qualification, Q2/root adoption and the remaining M+G+B sequence remain mandatory. No fourth retention attempt or new measurement fallback is granted.

## Historical artifacts, processes and permanent budgets

All10 AppendixB retained log artifacts were hashed; artifact count is not process count. Original package history includes initial95, failing94/95, isolated13,3author95+3independent95 and forced-collision probe, later112/117/134. Lifetime total/formal-vs-probe classification is UNKNOWN. Cap3 follows permanent purpose across author/path/worktree/name changes; no renamed native or whole-suite budget reset.

| Retained purpose | Preserved process truth and limitations |
| --- | --- |
| Author durable native |7 groups; Chrome47047/47093,starts2/stops2; autoplay bypass and DOM clicks. Earlier stalled no-bypass attempt admitted with missing raw PID/exit; at least2 wrappers, not7 runs. No default-policy acceptance from this author fixture. |
| Independent durable native |Fixed6887879,8 groups; Chrome50081/50172; genuine default policy/no bypass, trusted Retry and real module controls. native.log/runner.log embed one final result with2 launches, not2 independent passes. Direct controller two-document portion is auxiliary, not full host. |
| Independent package |Setup.ts no-suite failure then corrected134/16; tests.log/test-runner.log duplicate one final run. Missing first raw process evidence remains unknown. |
| REL05 mounted prefs native |Source da35b3b,two real downloads/latest scene/delete/conflict/B/390px/player; earlier unstyled probe/Controls-path correction disclosed. Mounted draft recovery only; green reproduction asserts original lost-scene behavior. |
| Package/storage/lifecycle |Meditation134,Storage126,accountDataLifecycle6 retain actual separate purposes and inherited history; no assertion arithmetic. |
| Shared/G1/visual/vendor |Frozen histories bind inherited units. TT08vendor3 neither grants nor automatically consumes a genuine separate MED vendor purpose; actual new purpose must be registered. |
| New combined semantic oracle |May be separately registered after review for exact record/End-Dismiss/restart disclosure; not a reset of full suite/native/host units. Mixed wrappers reserve every inherited unit. |

The13 source applicability rows yielded9 byte-equal candidates and4 differences. Byte equality does not establish transitive host/environment/method applicability. Historical native fixtures use Date.now offsets and module mounting, not full public routing/auth/PWA/lockscreen/hardware proof. Old WebSocket/100MiB machinery is not current pipe/streaming qualification. Preserve valid MED01/02 acceptance without upgrading it to MED03.

## Costs and exact bounded next step

Review1/3 and reviewer static1 **FAILED**, permanently consumed. Author1/3 static1 **FAILED**, permanently consumed. Subsequent authorized deterministic documentary identity closure is not a second acceptance pass. Runtime/tests/build/lint/browser/native/qualification/probes/vendor/children/push all0. Read-only discovery included guessed nonexistent test/storage paths and an unmatched optional glob; corrected reads did not run product code or tests. No provider or dollar-cost attestation is invented.

Root should register author correction2 with exactly these two existing preparation paths, then fresh full review2:

1. docs/reviews/audit-parallel-med03-preparation-r1/contract.md
2. docs/reviews/audit-parallel-med03-preparation-r1/inputs.sha256

Correct R1-R3; preserve original source23bd854 by committed lineage, all649 original identities, original and amended metadata, author/reviewer failures,16rows,11conditional paths,full canonical copy,10log census,312fields/evidence/formal states and every unrun gate. Update the corrected immutable input index; no source/output replacement, product edits or runtime reruns are authorized by this recommendation. Review2 must independently check the complete original contract and appropriately classified boundary, not only three corrected sentences. Stop any protected-write/runtime need and report to root.

Root alone owns remote preservation/integration/push/global state/inventory/sync. Review commit parent/output hashes and clean status appear externally in the handoff to avoid self-reference. No adoption, business PASS, READY_TO_SHIP, formal312 closure, deployment or release is claimed.


## Appendix FULL ORIGINAL PREPARATION: historical corrected-by-source2 text

# MED-03 full original-obligation preparation r1 — PROPOSED / UNADOPTED

Module **web**, workflow C under the sole A-Codex controller. Fresh preparer /root/parallel_c_med03_prepare_r1; requested role Astra, not provider-model attestation or cross-vendor evidence. No children. This document defines the complete original obligation for independent review; it grants no product writes or execution.

## 1. Fixed authority and preserved audit

Writable worktree: /Users/lijinlong/.codex/worktrees/audit-parallel-med03-preparation-20261010/XAI_Desktop. Direct parent P=535ba372116f6be333e529bfd6f8b9ca725ec3be; discovery I=e5caddc1abb1b12afb8802960d6e2b993c0c365a; original audit O=e041c2bc293b70db367444c62c4300231976dbf7; product P0=f9eb4b1f207bc4b46f547b90afc250424b3c8695. Fixed parent remains unchanged while the root progresses.

Original goal attachment /Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md was read first; SHA-256 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. The fixed parallel authority-overlay/goal-C and adopted scheduler pointer supersede only authorized global serial constraints; original evidence, ownership, costs, modules and acceptance continue.

Registration 11d1d67e67719cf331217786e60fa24ae487e12b mistakenly embedded POMO-04 in original_item while header, four acceptance requirements and allowed files correctly named MED-03. Original card hash b37086d113a8456a0a7c29fe2d6e031c0f42f7e3af071ff1a37e48884a3465de remains preserved. Root explicitly stopped writes and supplied additive amendment A=7eb8280736e0c30a908120704ea081d43cd12f16, same card path hash 2cc625a2034431da7b44215468d52090cbf8f7973d425fea0ae9c100de82b2ff and CURRENT-CONTROL-PLANE checkpoint. Amended original_item equals immutable scope-map MED-03. This fixes controller metadata only: no repin, author reset, extra static pass, product choice or scope expansion. Both versions are inputs.

**MED-03 · P2 · 决策 · pending · web · 当前范围 · workflow C**:
**定义冥想历史记录、离开修正和重新播放规则**.
Acceptance: **是否计入离开时长、是否续播和实际记录字段有可测试合同**.
Sources: 02-tasks-time-boards.md;05-visual-ux-audit.md. Every original item field/order and original_module remains binding. Full312 scope,39 reversible module labels,933 original evidence +6 accepted TT08 =939 current entries,13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed remain unchanged. Empty MED03 evidence does not imply zero historical invocations. MED01/02 acceptance is retained as limited existing authority, not renamed MED03 full acceptance.

## 2. Existing owner rules resolve the semantic choice

Owning package is physical packages/xai-web-meditation, package name @repo/plugin-web-meditation; plugin-meditation is a paused planned Desktop package and unrelated to this Web task. PLUGIN_MAP's old Web row and design base contain stale no-audio/no-resume/schema1 descriptions. June configurable upgrade and September API MED-01/02 addendum explicitly supersede those portions; obsolete prose is not a product choice.

Primary explicit rules: owning docs/api.md §MED-01/02 durable execution, author 6887879 and independent acceptance 797b4b4 at source6887879, plus EXECUTION.md recorded MED01/02 closure. Existing design §12 and later API both exclude a session-history ledger. The original MED03 wording requires defining history/replay/fields, not necessarily adding a history list. Therefore proposed resolution uses the following already explicit rules:

- Running time includes absence; paused time excludes absence. Reopening derives elapsed/deadline from saved state. No manual away-time correction/editor exists or is granted; no assumed pause at route departure, tab hiding, lockscreen or process exit.
- Reopening shows a saved-session card and never starts audio automatically. Opening a saved running session is explicit audio consent subject to browser policy; opening paused state leaves it paused/silent until Resume. An ended session cannot resume its old elapsed time.
- One active/ended execution row is retained, with terminal reason/time, until explicit Dismiss. This is recoverable current execution evidence, not an append-only history, past-session archive, statistics source or cloud-synced ledger.
- Start after dismissal creates a new session identity with current preferences and elapsed zero. No historical replay button, media seek position, recorded sound file or automatic restart is promised. Synthesized ambient sound starts a new graph; “resume audio” means resume playback, not resuming a recorded audio offset.
- Fixed expiry clamps elapsed at configured duration and records the original deadline, exactly once; infinite sessions have no deadline and end only explicitly. Manual End records measured elapsed and reason manual. End and Dismiss are different operations.

**No source-proven minimum unresolved product-owner question is identified.** Fresh independent review must challenge this conclusion against the original obligation and later accepted rules. Do not ask the user from this draft. If review finds an actual contradictory explicit rule, cite both immutable sources, isolate the minimum remaining decision and send it only to the root; do not reopen already decided away-time/autoplay rules or import Pomodoro semantics. This proposal still requires complete evidence and may need narrowly scoped disclosure/documentation corrections.

## 3. Actual data owner, fields and consumers

The sole session state-machine writer is internal/sessionController.ts. ACTIVE_KEY=xai_meditation_active, JSON version1, account-owned device-local storage. xai_meditation_prefs is schemaVersion3, also account-owned; “device-local execution” does not mean device ownership. Physical key and Web Lock name include captured account/demo scope and business generation. Auth IndexedDB generation is distinct.

| Actual persisted field | Contract and limits |
| --- | --- |
| version | Exactly1. Unknown schema remains unreadable recovery data; never normalize then overwrite. |
| owner.kind/accountId/generation | account or demo; nonempty accountId/generation must match captured business scope. Locked scope cannot read/write. |
| sessionId | Stable nonempty id during this execution; new Start uses crypto.randomUUID, revision0. Dismiss/new Start cannot be mistaken for resume. |
| revision | Nonnegative safe integer; increments on durable state transitions, no repeat terminal increment. Used with id for stale command exclusion. |
| phase | running, paused or ended; paused is not completed and ended is not a history list entry. |
| durationMs | Positive finite fixed/custom duration or null infinite. Preferences constrain UI duration1..240min. |
| accumulatedElapsedMs | Nonnegative segment sum, capped at duration for fixed sessions. On running row it excludes current running segment; displayed effective elapsed is derived. |
| runStartedAt | Current running segment wall timestamp. Resume replaces it; **not an original session-start timestamp**. No original-start field can be reconstructed honestly after pauses. |
| deadline | Fixed absolute deadline; null only for infinite. Rebuilt on resume from remaining duration. Paused rows may retain the old fixed deadline but do not expire while paused. |
| endedAt | Terminal wall timestamp; expiry equals original deadline. Manual end clamps rollback to current runStartedAt. Required in ended state. |
| reason | Terminal elapsed or manual. Not a completed boolean, quality/engagement score or listened duration. |
| prefs | Validated full start snapshot: schemaVersion,scene,clock,sound,volume,duration,customFixedDurations,durationMode,customDuration,clockScale,clockColors,customScenes. Custom scenes include id/name/background/gradientFrom/gradientTo/animation/sound/clock/clockScale/clockColors/durationMode/duration/customDuration. |

Clock colors carry digits/hands/ring/background/highlight. Scene/sound/clock IDs and duration resolver retain their current enums and validation. Live player volume comes from current prefs.volume, whereas stored row prefs.volume remains the start snapshot: do not label the latter final volume or a listening log. No persisted pause intervals, departure intervals, total paused duration, first start/recordedAt/completedAt, replay count, actual audible duration, history array, statistics event or manual correction exists. A field's current TypeScript shape alone is not permission to promise semantics; API explicit start snapshot/elapsed/end rules provide authority.

elapsedAt(row,t)=min(durationMs or infinity, accumulatedElapsedMs + (running ? max(0,t-runStartedAt) :0)). Display floors to seconds; storage retains milliseconds. Clock rollback is clamped, not a trusted real-time clock. Arbitrary clock changes/OS suspension and hardware output are not precision-certified.

Mutation order: command captures expected session id/revision, scope and issuedAt; busy/retry prevents a second unresolved intent. Native Web Locks acquires xai:meditation:<physicalKey>, rereads authoritative bytes, rejects stale non-reconcile commands. Scope, generation and deletion tombstone are checked by key()/physicalKey immediately before mutation. Pause/End use issuedAt for predeadline decisions; reconcile/Start use current lock-time due precedence. A due current row can settle instead of starting another session. Only successful set/remove publishes committed next state; failed save retains previous durable bytes and retry intent. Conflict refreshes winner without permanent latch; late old-scope finally cannot clear B busy.

Producer/reader map:
- Module start/pause/resume/end/dismiss/retry and controller reconcile are execution producers; pageshow/visibility/storage/timer observations request reconcile.
- MeditationModule useSyncExternalStore and MeditationPlayer read the row; ClockDisplay is a wall-clock renderer, not activity accounting.
- useMeditationPrefs/custom-scene controls produce configuration, not session history. Failed preference proposals retain mounted-memory draft/Retry/export/discard; no durable draft recovery promise.
- CmdK readModuleStates reads prefs only; adapters/meditation.ts yields module-jump by scene/sound aliases, never session records. Statistics/dashboard source scan has no Meditation active consumer; no measured meditation totals may be inferred.
- Registry/ownership/lifecycle declarations register both keys. Account export and deletion are additional lifecycle writers/readers; generic reset and migration are external mutation boundaries, not new session-state-machine owners.

## 4. Real public host and lifecycle contract

Actual route: apps/web/src/routes/router.tsx /app/:moduleId/* → ProtectedAppRouteElement/App → AccountStorageGate/AccountDataGate → AppRouteElement → withDisabledFallback(meditationSlotRegistration) → MeditationSlotHost → MeditationModule. Slot reads shell language; App owns shell/router/departure coordination. Both root and wildcard child paths resolve the module. Feature disable hides/blocks the route but must not erase its data.

@repo/web-auth-device-session/web resolves src/web.ts → session.tsx and guards.tsx. Public WebAuthSessionProvider selects ManagedAuthSessionProvider only with config; explicit mock/client path is LegacyAuthSessionProvider. Future evidence must exercise actual public routing and label the real branch; a helper adapter or directly activated scope is not a managed-auth host proof. AccountStorageGate mounts PomodoroSessionHost only. Meditation controller is created per route module and retained by its effect; it has no independent global host timer.

| Boundary | Required meaning, observations and no-loss oracle |
| --- | --- |
| Running/paused route departure | Actual route removes observers/audio and preserves saved row. Return opens recovery card; running absence counts, paused absence does not. Missing route observer delays persistence of expiry until return, never changes business end deadline. No closed-route JS claim. |
| Native fullscreen | CSS player overlay and document.requestFullscreen are separate. Browser Escape/exitFullscreen changes presentation only, retains id/phase/elapsed. Player End exits fullscreen and sends End; an ended-state End/Dismiss may remove terminal evidence. Distinguish each exact control by accessible name and resulting command. |
| Reload/tab/new document | In-memory player flag resets; original durable id/phase/elapsed/deadline survive. Zero automatic audio; no fabricated history append or default write. New document must be proved, not React remount labelled reload. |
| Entire browser process close/reopen | Actual owned process exit and new launch with same isolated profile; running deadline reconciles, paused unchanged. No JS/audio executes in closed process. Preserve launch identity/PID/source evidence and both running/paused cases, actual OS exit distinct from graceful app navigation. |
| Manual End | Running elapsed includes counted absence, paused elapsed frozen; terminal raw record persists with reason/time. Failure leaves activity and truthful retry state, never reports saved completion. |
| Dismiss ended / Start again | Only explicit dismissal removes current ended row. Proposed EN/ZH disclosure states this is the only saved execution record and removal is not archiving. Dismiss failure preserves it. Subsequent Start has new id/zero elapsed/current configuration; no replay of old completed time. |
| A→B→locked→A | No first-frame A data/audio flash in B, no old queued commands/retry/export/post-await UI/audio continuation; returning A recovers its row only. Stale generation/tombstone refuses, no resurrected deleted account. Held A lock must not block B. |
| Two real same-origin documents | Native shared Web Locks and storage; stale pause/resume/end/dismiss/start cannot mutate winner/replacement, fresh command remains usable; concurrent End/expiry one terminal revision. A second hook in same document is insufficient. |
| Audio errors/late callbacks | Resume rejection/nonsettling4s visibly retryable; pause/unmount/scope change cancels pending play, closes graphs; fixed gain scheduled at deadline even with JS throttle. Late controller Promise resolving after unmount must not call a fresh play through a disposed hook or alter new session. Source post-await continuation is a verification risk, not a new reproduced failure. |
| Source errors | Valid absent/null active differs from bad JSON/version/prefs/owner/read denial/missing locks. Raw bad bytes stay unchanged, errors visible, Start disabled/refused, raw export only if readable. No defaults-as-empty proof. Preference usePref/validatePrefs can display defaults after read errors: not permission to overwrite an unknown source. |

Controller retain cleanup currently removes observers/timer but does not separately mark every issued UI callback disposed; onStart/onExit and player resume.then require explicit lifecycle verification. Full scope does not waive this by citing old controller tests. Any reproduced real defect freezes before evidence and dispatches a fresh bounded author. No new command, observer host, global timer bar or persistence schema is assumed.

## 5. Export, deletion, reset and migration boundaries

Session recovery exports raw active string as meditation-session-recovery.json, not preferences or a history ledger. No active row returns literal null; read failure must surface unavailable rather than manufacture null. Current export serializes against current scope before URL creation but lacks a separately captured scope recheck at the actual download click. Proposed requirement is owner/lifetime-bound click and truthful visible export failure, preserving original save error and raw bytes. Native disk receipt must parse actual downloaded file; Blob/anchor simulation alone cannot prove disk. Browser/OS failure after dispatched click may lack acknowledgement; disclose instead of claiming guaranteed save. Existing exportFailed rendering is inside preference-recovery UI, so session-only failure visibility needs actual source/DOM proof and possibly bounded correction.

Preference recovery meditation-unsaved-draft.json contains committed-context settings/scenes plus rejected proposal and latest editor, with no import API. Mounted-memory export is not durable save or protection across reload/crash. Account export exportAccountLocalData(capturedScope) intentionally exports the explicitly captured owner's current generation even if auth later changes; do not rewrite this shared contract as current-scope-only. Caller authorization/download boundary must remain explicit. Raw damaged values are included; other accounts, earlier/candidate generations, device prefs, auth/secrets are excluded under existing manifest.

Account deletion uses captured owner, lifecycle lock/receipt/tombstone and erases all owned generations, preserving other users/device/unassigned originals. Session late writes must respect tombstone/generation; no resurrection. Full delete participant chain/legacy atomicity remain separate owner prerequisites where required, not waived MED guarantees.

Settings shell resetAllPrefs iterates registered non-proposed xai_* keys and removePref, including both Meditation keys. It is not a Meditation Reset control or archive mechanism. Original REL-10 explicitly requires limiting this default reset to preferences; the observed broad reset is an unresolved shared defect/risk, not an accepted right to delete business records. Preserve REL-10 as a prerequisite for any claim that global default reset safely retains Meditation execution; do not invent a new owner choice. Full MED disclosure must distinguish this destructive global data reset from End/Dismiss and cannot promise indefinite retention across account deletion, explicit reset or browser eviction. Actual reset failure/race/result truth requires shared owner evidence; no SettingsFooter/resetAllPrefs/registry/storage edit is granted here. If safe retention relies on a shared repair, register independent impact/review/chosen exact scope first, keep MED dependent gate blocked.

Migration validator accepts supported prefs v1/v2/v3 only when raw values agree with normalized values, and accepts only null for unscoped active; never imports an unassigned legacy execution session. Active import/history import/new key/cloud sync are absent and protected. Refresh/export/read is not migration consent. Compatible existing rows and start snapshots must survive any disclosure-only correction byte-for-byte.

## 6. Exact conditional scope and semantic reservations

Current grant is exactly contract.md and inputs.sha256 in this preparation directory. Product allowlist is EMPTY until fresh review/root adoption/before/method admission. Proposed future subset is finite:

| Exact conditional path | Sole proposed purpose |
| --- | --- |
| packages/xai-web-meditation/docs/design.md | Reconcile superseded base prose with explicit durable/history/away/replay contract, without deleting historical decisions. |
| packages/xai-web-meditation/docs/api.md | Exact stored-field meanings, absence/end/dismiss/restart and lifecycle/source/export limits. |
| packages/xai-web-meditation/docs/test.md | MED03 full oracle traceability and inherited evidence limits. |
| packages/xai-web-meditation/docs/dev_log.md | Only adopted MED03 workflow evidence/status section; preserve historical body, no false ship. |
| packages/xai-web-meditation/src/MeditationModule.tsx | If before proves missing disclosure/error visibility or stale callback/export boundary: local EN/ZH record/away/restart meaning and captured lifecycle handling. No history writer or new global guard. |
| packages/xai-web-meditation/src/MeditationPlayer.tsx | Explicit End/fullscreen/paused/audio meanings and disposed late-resume continuation if reproduced. No clock algorithm rewrite. |
| packages/xai-web-meditation/src/internal/sessionController.ts | Only source-proven adopted lifecycle/identity exposure needed for stale UI command safety; retain state machine/schema/timing/locks. Any semantic change requires fresh impact. |
| packages/xai-web-meditation/src/internal/useAmbientAudio.ts | Only adopted disposed/late callback protection proved necessary; preserve graph/timing/sound design and shared playback revision. |
| packages/xai-web-meditation/src/styles.css | Append narrowly scoped disclosure/recovery layout only if needed; token-only, no shell geometry or focus measurement changes. |
| packages/xai-web-meditation/src/__tests__/MeditationModule.med03.test.tsx | New finite disclosure/record meaning/original-field and current-command UI oracles after source review; no rewrite of existing tests. |
| packages/xai-web-meditation/src/__tests__/MeditationPlayer.med03.test.tsx | New explicit replay/fullscreen/late-result UI contracts where absent, preserving original tests. |

Any needed source-availability guard in useMeditationPrefs/storage or shared host/reset/export/migration repair is a separately registered prerequisite, not implicitly included above. Choosing no code delta still needs an accepted documentary decision plus full applicable verification; choosing a patch requires exact before/fixed oracles and review.

Reserve semantic resources: Meditation active per-account generation/lock, prefs and mounted draft, module/player audio singleton/lifetime, recovery download owner, and host route/account lifecycle shared read dependencies. Shared mutation coordination is root-owned. Protect all other packages/apps, tokens/i18n/shared CSS, schemas/keys/registry, lockfile/config, existing tests/runners/failures/evidence, global control/ledgers/inventory, other worktrees, deployment/release/promotion/D3. No wildcard evidence authoring; future runner paths/output names are separate cards.

## 7. Complete acceptance oracle matrix

Each row needs a source-qualified frozen expected result, raw observation, exact source/artifact hashes, historical applicability or new lawful invocation. Tests can falsify but cannot replace full acceptance.

| ID | Required oracle |
| --- | --- |
| M03-01 | EN/ZH visible/accessibly named explanation of one execution record, End versus Dismiss and new Start; no history/archive/real-listening promise. Start→Pause→Resume→End→Dismiss→Start has correct ids/revisions and field values. |
| M03-02 | Fixed preset/custom/infinite; known elapsed independent oracle at before/at/after deadline; running away included, paused away excluded, rollback clamped. No manual correction/paused-expiry invented. |
| M03-03 | Exact field table and nested prefs; resume overwrites runStartedAt not first-start, live volume versus start snapshot distinguished; terminal persisted once at original deadline, manual timing preserved, no absent history fields fabricated. |
| M03-04 | Actual public host route, rail navigation, Back/Forward, feature disable/reenable, same-page remount, saved running/paused return; preserve row while observers/audio stop. Both real auth branches identified, helper-only lanes labelled auxiliary. |
| M03-05 | New-document reload plus actual complete process close/reopen for running and paused, exact profile/source/PID/exit evidence. Recovery card, no autoplay, explicit Open/Resume; ended cannot resume and needs Dismiss/new Start. |
| M03-06 | CSS overlay and native fullscreen Enter/Escape/exit versus End; same session/phase across presentation-only transitions, explicit End persisted once; no accidental restart or dismiss. |
| M03-07 | Account A/B/locked/A and business generation/tombstone, first-render isolation, held A lock while B starts, late UI command/resume/retry/export/unmount callbacks, current user can still act. No old sound graph or disposed state mutation. |
| M03-08 | Two native documents: stale Start/Pause/Resume/End/Dismiss, concurrent end and expiry, newer session wins; one terminal revision, conflict refresh then fresh action works. |
| M03-09 | Distinct write failures start/pause/resume/end/dismiss/reconcile; prior bytes preserved, truthful visible recovery, retry same lawful intent, no false saved/end/remove/empty signal. Corrupt/unknown/foreign source and denied reads preserved; absent/null separate. |
| M03-10 | Default browser audio policy, trusted actual gesture, denied/nonsettling resume visible4s, retry; pause/unmount/account change and JS throttle stop graph/deadline gain, late resume fenced. No hardware/OS certification claimed without separate evidence. |
| M03-11 | Session raw disk export and preference latest-draft export separately, full account export coverage; real downloaded bytes/filename and malformed data preserved, no writes/guard release/history creation. URL/Blob/append/click failure and owner change before click visible/refused; read denial not empty backup. |
| M03-12 | Account generation deletion, same-account reset semantics, foreign B/device/unassigned preservation, tombstone rejection, failure/late-write boundary; prefs migration compatibility and unscoped active refusal. Shared lifecycle proofs are dependencies, no scope escape. |
| M03-13 | Actual CmdK prefs search module-jump, no active/history reader invented; Statistics/dashboard remain unrelated, no bus history event. Both keys owner/registry/export/delete consistent. Source-unavailable prefs cannot be represented as known empty history. |
| M03-14 | Actual host/full CSS EN/ZH at375/414/768/1024/1440 and200% zoom; record explanation/recovery/player/controls all applicable states,44px new targets, containment/hit-test/no overlap, pet-hidden resize procedure and pet-on, actual screenshots inspected. |
| M03-15 | Trusted Tab/ShiftTab/Enter/Space once/Escape; labels, focus visibility/restore, fullscreen and error/retry order; pipe/no nativeVirtualKeyCode/passive isTrusted key audit; qualified per-stop pixelFocusWalk at required themes/states, no CSS-outline-only substitute. |
| M03-16 | Complete before/source qualification/fixed/affected/canonical r2 G1/actual vendor/fresh full Astra acceptance/root evidence-only reconcile/inventory. Exact original full obligation retained, no missing row renamed REL-only or only eight old native checks counted as complete. |

Source-gap handling is mandatory: active errors are explicit; prefs fallback isn't a verified raw-source receipt. If row M03-09/13 requires a shared availability contract, map to frozen audit-parallel-dash06-source-availability-impact-r1 and independent review/chosen technical contract, or register a separately reviewed Meditation-specific prerequisite. An unadopted impact proposal does not authorize shared mutation or supply runtime qualification.

## 8. Gates, evidence ownership and qualified methods

G0 fresh independent contract review of original action/acceptance, no-question rationale, schema meanings, actual host, full16 rows and finite scope. G1 separately registered source machinery implements all oracles/controls, immutable source/dependency/admission manifests. G2 independent source review and actual qualification before any business before. G3 freeze full valid before at P0 with expected failures and positive controls before product correction. G4 fresh implementation author exact adopted subset and fixed diff, only needed repair. G5 independent same-oracle fixed plus affected package/storage/host/auth/reset/export/CmdK/Features/audio/timer and full native/visual/keyboard. G6 actual cross-vendor full-scope verifier, finite budget/time/launch/raw tool output/cost; another Codex agent is not cross-vendor. G7 fresh uninvolved Astra full acceptance, every M03 row and canonical ID with independently rederived hash. G8 sole root evidence reconciliation with unchanged original fields/states. G9 fresh inventory after acceptance, source commit remote preservation, integration ancestry and sync receipt. No gate implies deployment, formal312 closure or release.

Use streamed immutable git archive, full requested/resolved SHA, lockfile df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9, @repo actual exports and physical directory mappings with fail-closed guards. Main checkout is read-only dependency root only; server/profile/process belong to registered evidence worker. Future qualified runner reserves unique immutable names/launch ids, captures original stdout/stderr/exit/signal and refuses overwrite. Bound startup/archive/build/CDP/full matrix/exit/drain/finalizers separately; Promise.race does not cancel operations. No terminal PASS before owned child quiescence, both streams drained/closed and independent post-close durable receipt. Keep late events and cleanup/persistence faults, don't kill unrelated Chrome or delete uncertain descendants.

Canonical Clock r2 is 8bf613962517ee9b80bf51373e8ad88960c570cc, contract hash214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. Appendix A copies complete §14 unchanged: E1–E25, every E24 accepted caller and judging copy/rule. E1–E5 before author; E25 last; each item commit/path/hash/verdict/applicability, no absent ID N/A by omission. Clock-specific evidence stays in Clock node, not fabricated as MED03. Root maps each ID to valid reuse, pending shared prerequisite or separately admitted affected invocation.

E15 all16 F1 runs plus E16 Clock c1–c5; E17 Header control/fixed host5/5+5/5+2/2/native18/Astra/Sol; E24 AppRail eight modes26/31/21/18/24/22/33/123+host31, rail165/104, Appearance K-1 135/123; frozen More boundaries+C-FB00210/10 judging, Appearance24/26(006/007)+OE26/26 judging, Features13/15+C-FD1 14/15 observational+C-RD1 15/15 judging. Preserve original failures and no weakening of assertions. Capacity-only copies require refusal transcript/pre-registration/exact diff/source equality; no global rerun merely to obtain newer logs. E19 protected paths/E12 invariance are required to reuse exclusions.

Method dependency at frozen correction-impact-r2: retention3/3 exhausted,145checks/41of42cases, last55checks14of14PASS not qualification; source correction remains UNQUALIFIED/REVISE R1–R6. Q1 focus1/3, other six0/3; development2/83; B70 native12/6432/development40/4884, responsive visual3/3 exhausted, focusEN2/ZH2; F1formal2/180/development3/302. Same counters persist. M+G+B remains conditional on complete seven-unit qualification→fresh Q2/root adoption→valid full P0before→two-CSS geometry G2/G3→versioned baseline→E1–E5→Clock full fixed/final acceptance. No fourth retention attempt is available through MED03.

TASK06 source-review-r2 and latest amendment checkpoint also retain public-host/managed-branch acquisition, zoom factor-vs-percent, raster/DPR/calibration/full frozen context/causal negative/supervision gaps. Copying their unqualified adapter doesn't produce a usable MED03 method. Static MED03 preparation may proceed while dependent visual/native runtime is blocked; complete acceptance cannot. Existing pixel measurements stay protected; new method requires separate technical impact/source review/full qualification/adoption, no outline/rectangles fallback.

## 9. Permanent execution-unit history and budget

This is a source-bound retained census, not a complete lifetime process ledger. Appendix B lists retained artifacts and hashes, separate from actual launches. Log duplicates, assertions, report summaries and repeated copies never count as new processes or erase originals. Missing raw failure/PID/classification remains unknown. Formal cap3 applies per permanent unit, independent of author/path/worktree/name; probes/calibration disclosed separately. Historical undocumented probes do not create known-zero formal budget. Every future run requires root's complete unit-purpose mapping/count/remaining capacity or stays blocked only for that unit.

| Permanent purpose / exact command | Retained launches and truth |
| --- | --- |
| Original meditation package tests; pnpm --filter @repo/plugin-web-meditation test | May initial95 suite; May28 failing94/95 + isolated13PASS + three author95PASS + three independent95PASS plus forced collision probe from dev_log; June/September112/117/134 generations. Actual total/formal-probe classification unknown, no fresh3/3. timer-test-existing.log is shared old package history. |
| Author durable native; node docs/reviews/web-meditation-durable/verify-native-meditation.mjs | One retained passing wrapper, Chrome PID47047 then47093 same profile restart;7 assertion groups, starts2/stops2. Report admits an earlier stalled run without autoplay bypass, raw/PID unknown. Known at least2 wrapper attempts, not7 attempts; final uses autoplay bypass and DOM interactions, insufficient for default-policy trusted-host proof. |
| Independent durable native; node docs/reviews/web-meditation-independent/verify-native.mjs | Source6887879,8 groups, actual PID50081/50172, default autoplay/no bypass, trusted CDP Retry and actual module controls; two-document controller assertions auxiliary. native.log and runner.log embed the same result/PIDs: one known wrapper,2 process launches, not two verification runs. Whole historical total unknown. |
| Independent package; node docs/reviews/web-meditation-independent/verify-tests.mjs | First configuration included setup.ts as test and failed no-suite; corrected invocation134/16 PASS. tests.log/test-runner.log describe same final run, not separate passes. Known at least2 wrapper launches, first raw exit/PID unknown; no discarded test or oracle weakened. |
| Mounted prefs recovery; node docs/reviews/web-save-consumer-inventory/verify-native-med.mjs | Source da35b3b; actual2 downloads/latest-scene/delete/conflict/B/390px/player controls. Report admits unstyled initial probe without CSS and Controls-path correction; final retained log only. At least one earlier probe plus final, exact total/classification unknown. This proves mounted draft recovery only, not current timer history/host lifecycle. |
| Original save defect / package134 / storage126 / lifecycle6 | 20260909-med-reproduction.log green asserts old lost scene; inverse acceptance must differ. Author meditation-tests and storage-tests separately; lifecycle accountDataLifecycle6 distinct purpose from full storage126. Old all-suite counts inherit unit history; no assertion-count arithmetic. |
| Shared host/Features/accepted-caller/G1/visual/focus/vendor | Actual frozen source/report histories and canonical ledgers bind inherited units. Clock blocked measurement history retained; TT08 vendor3 exhaustion does not grant or consume an unrelated new MED vendor run automatically. Register actual purpose/history rather than sharing generic allowance. |
| Genuinely new MED03 semantic source purpose | Existing tests/accepted native cover persistence/time/audio but not one combined user-visible exact-record/End-vs-Dismiss/restart-with-new-id explanation and no-original-start/no-history assertion. This narrow new oracle-source purpose may be separately registered after fresh review. It is not a new full meditation suite/native/host budget. Mixed wrapper must reserve every inherited exercised unit. |

Read source and applicability before reuse, not rerun. Historical native is module fixture, not App/actual router/PWA/full auth/OS audio qualification. Independent runner hardcodes6887879,100MiB archive buffer, WebSocket CDP port; current qualified new runners require pipe/streaming and stricter provenance/lifecycle, so copying it unchanged cannot establish fresh current proof. Retain its accepted scope; no retroactive rejection of MED01/02 or claim all scope remains current. Byte equality table below proves only named source, not dependencies or environment/oracle universality.

## 10. Disposition, costs and next step

Preparation iteration1/3; static pass1 FAILED at Python parser before execution/writes (non-UTF-8 stdin payload); author assertions were not reached; runtime/tests/build/lint/browser/native/qualification/probes/vendor/children/push all0. Read-only discovery returned several wrong guessed paths and one shell unmatched glob; corrected to actual package paths/public sources, no runtime. Root metadata correction is preserved, no author retry/reset. No test/runner module imported or executed.

The attempted first standard-library/Git pass failed before execution (SyntaxError: Non-UTF-8 stdin payload), leaving the worktree clean. Root explicitly authorized deterministic encoding-safe two-document construction and immutable input-index/parent/scope/hash/clean closure only; no second author acceptance pass. The constructor reads and hashes immutable inputs, checks fixed parent/clean scope and the two card identities, assembles both complete buffers before writes, then writes exactly two ADDs. The failed suite's ordered312/39labels/933+6evidence/formal-count assertions, full product/source acceptance assertions, all16-row assertion and complete canonical-ID assertion were NOT reached or rerun. Those remain for fresh independent review/root verification; documentary input identity closure cannot retroactively turn author static1 into PASS. Failed static1 remains consumed and FAILED. No second acceptance validation or behavior redesign occurred. Exact staging and command-local hook-disabled commit remain required. Output hashes and commit supplied externally to avoid self-reference.

Outstanding: fresh full independent review; adopted exact contract/scope; full source machinery/review/qualification; old-unit history admission where genuinely needed; usable focus/native host method; original valid before; any bounded documentary/UI correction; independent fixed/affected/full G1/actual vendor/fresh Astra acceptance; root evidence-only reconcile/inventory/remote ancestry/sync. No user question now. No full MED03 acceptance, READY_TO_SHIP, formal item closure or release claim.

Root alone receives/checks/preserves source remotely/integrates/pushes/globalwrites/syncs and archives owned worktree. Child never writes other worktrees or edits existing original files. inputs.sha256 records immutable Git-object bytes using fullSHA:path blob labels and rawtree:fullSHA:path tree labels, plus external: absolute attachment; indexing a dependency hash is identity coverage, not a claim of semantic review of every line.

## Appendix A - complete canonical Clock r2 G1, verbatim

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- **Judging copies.** The frozen More `boundaries`, Features `downstream` (cases 012 and 014) and Appearance `continuity-export` (cases 006 and 007) failures are judged by their copies: C-FB002, C-RD1 and OE. C-FD1 runs beside them with its predicted outcome and judges nothing. A judging copy that fails is a regression.
- **K-1 and transport.** Every native runner written for this caller uses pipe transport, sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged, with their frozen transport (AppRail acceptance §6 item 10).
- **Drags.** Native drags use trusted CDP input only (§12 rule 14).
- **Product-delta preconditions.** A reused frozen runner may refuse at a precondition bound to an earlier caller's product delta. The verifier then commits that refusal log, and runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance and AppRail E24/E25 precedents, and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.
- **Capacity copies (pre-registered; AppRail acceptance §6 item 10).**
  - **When.** A reused frozen runner aborts with `ENOBUFS` (or any buffer-capacity error) while reading `git archive`, before any test runs.
  - **What the verifier does.** It commits the refusal transcript. It then runs a copy that differs from the frozen runner only in the archive buffer (sized from the measured archive, at least twice its size, or replaced by streaming) and, if the copy lives in a deeper directory, in its `root` depth, plus a header comment.
  - **Requirements.** The copy's diff against the frozen runner is committed. Staged test and fixture files must be byte-identical to the frozen ones. Counts must equal the accepted receipts and the `f9eb4b1` control.
  - **Pre-registered for:** the four Dashboard Header runners (E17), whose 100 MiB buffer is below the `f9eb4b1` archive.
  - **Applies on refusal to:** the three 200 MiB F1 runners `verify-f1.mjs`, `verify-f1-callers.mjs` and `verify-f1-race.mjs` (E15). Their buffer, 209,715,200 bytes, exceeds the 173,905,920-byte archive at the r2 docs head, but later evidence may outgrow it.
  - **Status.** The copy procedure is not a contract revision and needs no separate ruling batch; acceptance reviews each copy.
- **Not rerun.** The Features native host and downstream suites (Features E12/E13) and the AppRail native E9–E14 are not rerun. Their subjects (Features rail departures and drags, and AppRail's own surfaces) are outside the Dashboard packages, and the empty shell, `App.tsx` and tokens diff (E19) plus the `.app-rail`/`.topbar` invariance (E12) bound them. If either bound fails, they must be rerun.


## Appendix B - immutable source applicability and retained artifact census

Historical source 6887879f40be24d7b531f858366b5bc0481cb335; independent evidence 797b4b4b1469ff7e0bef6ddaad3de4bcdebf235d; REL05 source da35b3b8175565f5e99ab9f88da2a788889494d4. Equality below is documentary identity per file, not transitive host/method acceptance.

| Source | Exact path compared with P0 | Byte applicability |
| --- | --- | --- |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/sessionController.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/useAmbientAudio.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/MeditationModule.tsx | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/MeditationPlayer.tsx | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/useMeditationPrefs.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/internal/accountMigration.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/xai-web-meditation/src/types.ts | byte-identical; limited historical reuse candidate |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/plugin-web-storage/src/internal/accountScope.ts | DIFFERENT; exact delta review required |
| 6887879f40be24d7b531f858366b5bc0481cb335 | packages/plugin-web-storage/src/internal/accountDataLifecycle.ts | DIFFERENT; exact delta review required |
| 6887879f40be24d7b531f858366b5bc0481cb335 | apps/web/src/App.tsx | DIFFERENT; exact delta review required |
| 6887879f40be24d7b531f858366b5bc0481cb335 | apps/web/src/providers/AccountStorageGate.tsx | byte-identical; limited historical reuse candidate |
| da35b3b8175565f5e99ab9f88da2a788889494d4 | packages/xai-web-meditation/src/MeditationModule.tsx | DIFFERENT; REL05 remains historical source-bound |
| da35b3b8175565f5e99ab9f88da2a788889494d4 | packages/xai-web-meditation/src/internal/useMeditationPrefs.ts | byte-identical; limited REL05 reuse candidate |

Retained artifact files (10) are NOT process counts. Original unretained failures/probes remain unknown as section9 records. P is full parent above.

| P:path | SHA-256 | Raw summary; no inferred process exit/classification |
| --- | --- | --- |
| docs/reviews/20260908-full-product-audit/timer-test-existing.log | 34fa1cac14661478bb9d1bf99dbcecaf136ed72c981a075180905d0089518842 | packages/plugin-web-time-tracker test:  Test Files  3 passed (3) ; packages/plugin-web-time-tracker test:       Tests  28 passed (28) ; packages/plugin-web-pomodoro test:  Test Files  16 passed (16) |
| docs/reviews/web-meditation-durable/20260909-native.log | ad9ac9cee6ac2039eda8f64f82fdfef6f6915626ad588b6643c80e297bb9a10a | "pass": true, ; "pids": [ |
| docs/reviews/web-meditation-durable/20260909-storage-tests.log | 983035d964d57cb014be62268eb2be9fb78f06c41d7fa5c34eeca934bad076e5 | Test Files  16 passed (16) ; Tests  126 passed (126) |
| docs/reviews/web-meditation-durable/20260909-tests.log | 085fd6caedff295a0f5bab98a1ca0a4b909ad2712bf92e5c93136637828bf092 | Test Files  16 passed (16) ; Tests  134 passed (134) |
| docs/reviews/web-meditation-independent/native.log | 88e077920b32477db5a122098b60bc8a4d0ac35d2827f252d157dc154ee49a8b | "pass": true, ; "pids": [ |
| docs/reviews/web-meditation-independent/runner.log | d37ab032978ebe026c17e017a92d6025e5d31d43746757b7e403ffaa0db71f65 | "pass": true, ; "pids": [ |
| docs/reviews/web-meditation-independent/test-runner.log | 67cd82a90bce8521af84210cf87d04b5e303e66c470bc9262908dbf13c27ec17 | Test Files  16 passed (16) ; Tests  134 passed (134) |
| docs/reviews/web-meditation-independent/tests.log | 4d74b5a562ba2264946d20fe506c684a6e7836b5d85d6bb7513d41efa57fe840 | Test Files  16 passed (16) ; Tests  134 passed (134) |
| docs/reviews/web-save-consumer-inventory/20260909-med-reproduction.log | 582e69df147f92d6a2ad5e16df2ac3814a7c824127cbd38a1e653c12410dc33a | Test Files  1 passed (1) ; Tests  1 passed (1) |
| docs/reviews/web-save-consumer-inventory/20260909-native-med-after.log | eed91f29925b0eb10e4677df44e06b52db83186cbadcb017963f22432cf2cd20 | {"name":"PASS","downloads":2,"scope":"actual module latest scene, delete, conflict, B isolation, configuration/player volume and 390px recovery panel"} |

## Appendix C - honest failed static receipt and identity closure

Static1 FAILED before Python execution: SyntaxError: Non-UTF-8 code starting with byte0xe8 in stdin line121, no encoding declared. No output existed; git status remained clean. No author semantic assertions were reached. Full ordered312/39label/evidence939/formal counts, MED16 completeness, product-boundary acceptance and complete canonical-ID assertions were NOT rerun. Fresh independent reviewer/root must check these; no author PASS claimed.

Root explicitly permitted only deterministic encoding-safe output construction and documentary identity/parent/scope/hash closure, with no second static acceptance pass or behavioral redesign. This constructor read 638 immutable blobs, 10 raw Git tree objects and one attachment (649 identities), matched parent-file bytes and pinned authority hashes, and assembled both output buffers before first write. Appendix source equality compares bytes only. Entire original canonical section is copied without algorithm/requirement change. Identity closure is not acceptance or qualification. Author1/3, static1 FAILED; all runtime categories0.


## Current author documentary receipt

Sole semantic static1 PASS for complete immutable hash closure and documentary preservation, not source qualification or behavioral verification. Corpus 1697 identities / 42106559 bytes. Complete1307/1216/803/737/688/649 inherited sets;16 MED rows;11+23 candidate paths;18 machinery roles;10 logs;13 applicability pairs (9 equal/4 different); all87 explicit registry keys classified for proposal. Full canonical section14 and R1/R2/R3 remain verbatim. No runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children/push. Actual external checker PID/chunk/session/exit and output hashes are supplied by the parent-visible tool receipt.

End of complete source-contract proposal.
