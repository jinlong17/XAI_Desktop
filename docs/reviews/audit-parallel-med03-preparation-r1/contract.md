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
