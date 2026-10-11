# POMO-04 exact source contract r1

**PROPOSED / NEEDS FRESH FULL REVIEW. SOURCE ADMISSION HELD at the explicit missing prerequisites below.** This is the complete conditional technical specification for the original Stop, Reset and departure obligation. It is not an implementation, usable runner, qualification, product-path grant, caller acceptance or release. It preserves the approved documentary basis and identifies exact prospective caller-local interfaces without selecting new timer, cancellation, ownership or recovery policy.

## 1. Fixed authority and permissible output

Module web; Workflow A; fresh source-contract author1/3 /root/parallel_a_pomo04_source_contract_r1, no prior caller authorship/review and no children. The registered model gpt-6-astra is configuration, not provider attestation or cross-vendor proof.

- Exact clean dispatch/commit parent P: 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7.
- Fixed input I: b21a2450e6d2607487ba3f5ae7663bdf7ad7c301.
- Machinery basis: a9054733b4f1179dac138b73031e3d0fd22b2416; review source 86de30ce7c16dd1823ccf9327f67993f45f193b5, preserved at I.
- Adopted full document source2: 9e2e6cf722171936dc8c085d588f0c047d968e92; independent full review d75a0d6de0521abde0128339049bd860bc0ec7a2.
- Original source1 59dae0b524e19e6d0c273174488b84d68fb323f3 and REVISE review1 0f2f5c1a155f8fda127758f7986010dd57335f21 remain retained.
- Product P0: f9eb4b1f207bc4b46f547b90afc250424b3c8695; original ordered scope O: e041c2bc293b70db367444c62c4300231976dbf7.
- Sole writable checkout: /Users/lijinlong/.codex/worktrees/audit-parallel-pomo04-source-contract1-20261010/XAI_Desktop.
- Exact card: P:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-pomo04-source-contract-r1.json. Only two ADDs in this directory: contract.md and inputs.sha256. All other paths, other worktrees and root controls remain protected.

Original POMO-04 action: 明确Stop、Reset及中途离开的保存规则. Original acceptance: 每个按钮的保存/放弃含义清楚；Reset不静默丢失用户以为已保存的记录. Priority P2, kind 决策, formal pending, original source 02-tasks-time-boards.md;05-visual-ux-audit.md; no new owner question. P-1 elsewhere is SHELL-05, not a Pomodoro policy choice.

The original 312 ordered TODO records and every original field are retained; scope-map.module is normalized and original_module restores exactly 39 literal labels (30 web（project-system）, 9 web（跨模块验证索引）). TODO.sections[].tasks, EXECUTION.items and execution-state.tasks (a list) are distinct schemas. Nonempty gate_obligations is 150, not TODO's 118 gated-policy rows. Original 933 references plus only six TT08 additions remain 939; formal counts remain 13 completed / 3 verification_pending / 3 in_progress / 293 pending, 299 unclosed. POMO04 evidence is still empty and is not a budget reset.

P0 parity is runtime/config/test parity with exactly four excluded owning TT08 documents: packages/plugin-web-time-tracker/docs/api.md, design.md, dev_log.md, test.md. It is not whole apps/packages equality. All eleven POMO conditional paths remain P0. Root alone preserves source remotely, adopts, receives, integrates, appends control/evidence and performs inventory/ancestry/sync; no child push/fetch/sync-check is authorized.

## 2. Exact existing source API and native ownership

All signatures below describe actual P0 source unless explicitly labelled proposed. Paths are immutable manifest entries; full controller/protocol/hook source is included in Appendix C. Public package exports are only @repo/plugin-web-pomodoro and @repo/plugin-web-pomodoro/session-host. No internal-controller public export is proposed.

| Source | Actual signature / semantics |
| --- | --- |
| session-host.tsx | PomodoroSessionHost(): null; effect retains the controller above route UI. |
| internal/sessionController.ts | retainPomodoroController(): () => void; subscribePomodoro(listener: () => void): () => void; getPomodoroSnapshot(): SessionSnapshot. Last observer release removes listeners/interval only. |
| internal/sessionController.ts | command(action: Command, options?: { mode: PomodoroMode; durationMs: number }, expectedId = snapshot.active?.sessionId, expectedRevision = snapshot.active?.revision): Promise<boolean>; Command is start/pause/resume/end/discard/reconcile. Captures scope and issuedAt before awaiting. |
| internal/sessionController.ts | retryPomodoro(): Promise<boolean>; reuses original captured execute closure. exportPomodoroRecovery(scope: AccountScope = accountScope.capture()): string; may throw, never silently fabricates unreadable bytes. |
| internal/sessionProtocol.ts | elapsedAt(session: ActiveSession, now: number): number; pendingSettlement(session: ActiveSession, now: number): ActiveSession; isActiveSession(value: unknown): value is ActiveSession. |
| internal/useTimerTick.ts | useTimerTick(options: UseTimerTickOptions = {}); start(durationMs?: number), pause(), resume(), retry() return Promise<boolean>; end() returns immediate numeric elapsed and fires command without awaiting; reset(mode: PomodoroMode, durationMs?: number) returns void and attaches then(setIdle). Neither immediate return proves durability. |
| plugin-web-storage/internal/accountScope.ts | capture(): AccountScope; assertCurrent(scope): void; isReady(scope = current): boolean; physicalKey(key, scope = current): string. Identity is object equality, not only matching strings. AccountScope has kind locked/account/demo, accountId, generation, epoch. |

Native POMO owner lock: navigator.locks.request('xai:timer:' + kind + ':' + encodeURIComponent(accountId) + ':' + encodeURIComponent(generation) + ':pomodoro', callback). The existing default exclusive Web Lock serializes real product commands in same-origin documents. Required observations use navigator.locks.query() held/pending lists and actual product-origin requests, with a separately owned held-lock document; release is controlled and recorded. No fake lock, two-hook surrogate, second history writer or activation switch proves this.

Logical keys ACTIVE_KEY=xai_pomodoro_active and HISTORY_KEY=xai_pomodoro_sessions remain. Physical prefix is xai:account:v1:<encoded-account>: or xai:demo:v1:<encoded-account>:; physical data key adds <encoded-generation>:<encoded-logical-key>. The committed-generation marker and deleted tombstone are account-level keys. Existing controller assertScope requires current ready scope, rejects a present mismatched generation marker, and calls physicalKey to check the tombstone. Do not silently strengthen the existing marker predicate or substitute auth IndexedDB generation. Native POMO command locking is DISTINCT from the closed canonical Task/Calendar activation gate. Only an actual dependent canonical-writer case inherits that hold.

## 3. Durable schemas, ordering, errors and result truth

ActiveSession is version1 with owner {kind: account|demo, accountId:string, generation:string}, safe nonnegative revision, nonempty sessionId, focus|short-break|long-break mode, positive finite durationMs, valid ISO sessionStartedAt, running|paused|settlement-pending phase, finite accumulatedElapsedMs in [0,durationMs], finite runStartedAt/deadline, optional pausedAt and settlement. Running deadline equals runStartedAt+durationMs-accumulatedElapsedMs; paused requires finite pausedAt; pending settlement must pass isPomodoroSession and match id/mode/duration. No schema or validator edit is granted.

PomodoroSession has nonempty id, mode, valid startedAt/finishedAt, positive durationMs, elapsedMs in [0,durationMs], boolean completed; optional schemaVersion:2, deadline and recordedAt. Actual validator tolerates extra fields and does not independently validate schemaVersion. Legacy rows remain accepted by existing rules. first recordedAt is created at first history append, never rewritten on matching replay. Matching existing history compares finishedAt, elapsedMs, mode and completed; do not invent additional conflict criteria. Raw history is an array whose EVERY row validates for settlement; filtered legacy display is not whole-history availability.

Under the real lock the existing order is: assert captured scope; read current; absent active plus recorded expectedId is successful no-op for non-start; ordinary non-start/non-reconcile identity gate (same id, same revision unless current same-id pending); frozenPending Retry recovery; pending or running expiry settlement; start/pause/resume/end/discard branch; clear retry/draft and publish authoritative active. Invalid ordinary identity throws StaleCommandError and refreshes winner without keeping obsolete retry. In-flight or unresolved retry refuses a new command. The retry execute closure retains frozen End and scope. No UI cancellation predicate is added under this lock.

| Cut | Existing durable truth / oracle |
| --- | --- |
| C1 | Early End freezes pendingSettlement(current, issuedAt) in memory, sets pendingDraft, then pending active write fails. Old durable running/paused remains; no history commit. Retry/export can use frozen memory while alive. Actual full-process forced loss loses that unsaved intention; reopen follows old durable activity. |
| C2 | Pending active write succeeds, history read/append fails. Pending contains original settlement; Retry/reopen settles same row without recomputing early End at a later wall clock. |
| C3 | History append succeeds, lastCommitted published and event attempted; active cleanup fails. Saved record is durable, cleanup is pending, first recordedAt unchanged. Retry does not append or emit another new-history event. Failure between durable append and best-effort event does not erase the ledger. |
| C4 | Existing matching row reused, active cleared; conflicting same-id content refuses without overwrite. Absent active plus recorded old id is a separate success/no-op, not discard or a new completion. |

End's issuedAt determines early-versus-completed even if lock grant is late; early elapsed clamps accumulated run segments and excludes pause. Reset/discard tests running expiry at grant time; same-id pending or expiry settles BEFORE discard. Natural completion finishedAt is original deadline. Unexpired running/paused Reset removes current active only and leaves previous history byte-for-byte. Idle reset changes presentation only. Completed callbacks may choose the next committed preset, never auto-start; break rows persist but do not count as focus. Stop early saves measured incomplete history, never increments completed rounds/streak.

Exact existing errors include: Web Locks unavailable message; Account storage is locked.; Account data generation changed. Reopen account storage before continuing.; Saved timer is unreadable. Export recovery data before making changes.; Saved timer belongs to a different account data generation. Export it for recovery.; Saved history contains unreadable records. Export recovery data before making changes.; Settlement is incomplete; recovery is required.; Conflicting history for this session. Export recovery data.; Session was saved, but pending timer cleanup failed. Retry cleanup.; This timer changed in another tab.; A timer is already active in this account.; Invalid timer duration. Existing catch paths preserve Timer could not be saved: / Timer recovery required: prefixes and conflict separately. New UI copy must distinguish these outcomes, not parse them as proof of an atomic commit.

## 4. S-POMO: proposed caller-local availability and exact result surface

This section is an exact prospective interface specification within the existing controller/hook paths, not a declaration that these APIs exist or are granted. Fresh full review, valid before, and a later exact subset card are required. No changes to public types.ts, sessionProtocol, storage/schema/account/host are included. If these local interfaces cannot preserve existing behavior, freeze the unit for independent diagnosis/finite technical exception rather than expand scope.

Proposed internal type PomodoroSourceRead<T> = {status:'readable'; value:T} | {status:'unavailable'; reason:'scope'|'read'|'invalid'|'owner'; message:string}. Proposed getPomodoroSourceAvailability(scope: AccountScope): {scope:AccountScope; active:PomodoroSourceRead<ActiveSession|null>; history:PomodoroSourceRead<readonly PomodoroSession[]>; locksAvailable:boolean}. This synchronous, read-only capture uses existing assertScope, physicalKey and validators; it does not acquire timer/history ownership, write, migrate, clear retry, emit storage/bus events or normalize bytes. Read active and the entire history independently, recheck captured scope before exposing either, never expose stale values after owner loss. A getter/parse/validation failure yields unavailable for that source; raw 'null' active follows existing accepted absence, absent history is readable []; invalid history row makes the WHOLE history unavailable. Independent key reads are observations, not a new multi-key atomic transaction or global cross-document consistency guarantee.

Proposed internal CommandReceipt = {accepted:boolean; action:Command; scope:AccountScope; expectedId:string|undefined; expectedRevision:number|undefined; issuedAt:number; outcome:'started'|'paused'|'resumed'|'discarded'|'settled'|'already-recorded'|'reconciled'|'no-change'|'refused'|'failed'; recordId:string|null; cleanup:'complete'|'pending'|'not-applicable'}. Scope and action identity remain captured at original invocation. The result is emitted only by the existing guarded branch and failure boundaries; no post-hoc boolean guessing. A C3 receipt can have accepted:false, outcome:'settled', recordId and cleanup:'pending'; this accurately records partial success without turning the boolean false into a rollback. A C1/C2 failed receipt never claims saved. In-flight/no-ready/no-lock refusal has no claimed durable branch. Ordinary stale identity is refused. Existing already-recorded success is explicit.

Proposed internal commandWithReceipt(action: Command, options: {mode:PomodoroMode;durationMs:number}|undefined, expectedId:string|undefined, expectedRevision:number|undefined): Promise<CommandReceipt>; existing command(...) remains Promise<boolean> as a compatibility adapter with identical existing return behavior. Proposed retryPomodoroWithReceipt(): Promise<CommandReceipt|null> exposes the SAME original retry result, null when no retry is admitted; existing retryPomodoro stays boolean. This is only branch/result exposure, not a second command executor, new queue, additional retry or changed branch priority. No default identity recapture in the captured Reset path. Before source approval, review its complete control-flow equivalence at every existing return/catch/finally and fault cut; lack of a faithful local implementation is BLOCKED, not an allowance to change semantics.

Proposed hook-only ResetDecision captures immutable scope, id, revision, mode, durationMs, unique token, initiating live focus target and hook/presentation sequence at dialog open. createResetDecision(mode,durationMs): ResetDecision|null is read-only; confirmResetDecision(decision): Promise<CommandReceipt|null> consumes once BEFORE dispatch and passes explicit identity; revokeResetDecision(decision): void revokes undispatched UI intent only. These hook-local names are prospective, not new package exports. Existing reset() idle/committed-next-preset call sites remain compatible and do not gain a confirmation on internal next-mode updates. Active user Reset goes through the decision path. No dialog token reaches the lock. Current hook availability booleans do not yet provide this interface.

Whole-history availability is shown separately from an empty history and locksAvailable. A source-unavailable banner prevents a false no-records/saved claim while preserving existing safe action/recovery rules. Existing consumer readers and storage codecs are not edited. If another consumer cannot show required truthful availability through its existing contract, P04-12 remains blocked pending its own exact protected exception; do not mislabel partial local truth as consumer acceptance.

## 5. Reset lifecycle, owner/export lifetimes and actual loss

Capture at opening, consume once at confirm, revoke before dispatch on Cancel/Escape/closure/replacement/route-hook disposal/account epoch/generation/tombstone loss. Opening never pauses the timer. Preserve same-id pending revision exception and absent-active recorded-id no-op; ordinary id/revision replacement rejects without retargeting. Cancel means zero OLD-INTENT command/write/delete/event; natural completion is compared with a time-equivalent control with identical lock release, initial bytes, host and competing authorized actions.

After dispatch, same-account End/Reset/pause/Continue/Retry survives view/dialog/hook teardown. Existing account authority still rejects stale owner at grant/every write. Returning A has fresh authority, not revived old permission. After await, old hook/account/decision/presentation/session cannot change idle/notice/focus; a successfully removed session need not still be active to acknowledge removal. Durable success remains true, stale UI remains inert. Fresh live observer may reflect true commit/error/cleanup. Full L1-L8 and P04-03/P04-09 matrices in Appendix A remain normative without weakening.

Reset explanation names discard current unfinished progress, prior saved records preserved, Stop/save alternative, pending/expiry may save rather than discard. EN/ZH normal/fullscreen controls must agree. Confirm/Cancel/Escape and trusted keyboard execute once; live initiating element restored, or meaningful live existing fallback when appropriate; removed-view disposal never promises focus in a detached view. Clean route departure keeps host timer; fullscreen Exit is presentation only; preference departure retains existing first-intent/rail/Appearance arbitration and only owns six preferences.

Timer export remains version1 {owner, uncommittedSettlement, active, history} with raw active/history strings and current-scope frozen memory, filename pomodoro-recovery.json; no format/import/schema change. Preferences remain version1 kind pomodoro-preference-draft with exactly preset/customMinutes/displayStyle/theme/sound/muted, filename pomodoro-preferences.json, device memory and no account timer/history ownership. Raw-read denial is unavailable, never an empty successful timer backup. Under denial preference export may still serialize all six in-memory values.

Capture export scope/lifetime, serialize using existing checked helper; revalidate immediately after Blob/URL/anchor setup and immediately before click; synchronous owner change injected at each real setup boundary must prevent stale A click under B. Revoke URL/best-effort cleanup on both success and error without erasing original save error/guard. Actual download bytes/schema/hash and absent-file negative are required. OS/browser denial after click is not app-acknowledged; preserve that limit and never turn setup success into actual disk proof. Missing append boundary in current timer source is source-not-applicable, not a claimed exercised append; qualify any actual later added append separately.

Actual full-process forced loss at C1/C2/C3, raw on-disk active/history, same-profile running and paused close1/reopen1/close2/reopen2 require new PID/start/document/loader and complete old-process/descendant absence. Closing a page target is insufficient. C1 memory cannot survive process death by contract; C2/C3 must follow original durable reconciliation. Browser closed JS/audio remains unavailable. Owner change mid-download, old permission, stale device drafts, ghost first-frame and fresh A/B actions are separate controls.

## 6. Managed host, SDK source closure and first-frame acquisition

The evidence host imports the archived actual apps/web/src/main.tsx after transparent pre-import observation. That source calls registerServiceWorker and bootstrapObservability, then StrictMode/createRoot/AppProviders/RouterProvider with tokens and global CSS. AppProviders uses live VITE_WEB_AUTH_MODE and nonempty loopback VITE_SUPABASE_URL / nonsecret VITE_SUPABASE_ANON_KEY; config null or fake context is legacy and cannot prove managed generations. Real public WebAuthSessionProvider constructs createAuthGenerationCoordinator, bootstrap/dispose and real SDK. AccountStorageGate calls AccountDataGate and public PomodoroSessionHost above routes. Preserve deletion notice/cleanup, DeviceSessionBridge, TodoWebRuntimeBridge, pending OAuth cleanup, observability imports and service-worker/cache effects.

Source-proven HTTP auxiliary contract: POST /rest/v1/rpc/device_register and /device_heartbeat; JSON {device_id}; Content-Type application/json, Authorization Bearer token, X-Device-Id and X-Sync-Version. Any ok response succeeds; 401 means unknown_device; 403 JSON code/error/message device_revoked maps revocation, other errors remain actual DeviceTransportError. Todo POST /rest/v1/rpc/fn_grant_nonce_lease carries p_account_id,p_key_id,p_count(default128), account/device/sync/Bearer and same-origin apikey headers; reply object or first array row has encryption_device_id numeric text, lease_start/lease_end nonnegative integers. Invalid/missing data remains todo_nonce_lease_invalid; failed HTTP includes status. Capture actual bridge cleanup and late-lease response guards after owner replacement; never stub away these effects.

Auth-generation client source uses storageKey xai.auth-client.v1:<encoded-base-key>:<encoded-auth-generation>, PKCE, persistSession:true, detectSessionInUrl:false, real configured autoRefreshToken. Session logical key and verifier/user handling, owner extraction, durable compare/publish, SDK locks/BroadcastChannel and stale writes are distinct from business generation. Existing clearSessionStorage revokes business authority before async local cleanup but does not claim completed durable sign-out. Delayed A login/refresh after B must not regain A permission. Account A/B fixtures use real sign-in/sign-out/coordinator UI paths; raw fixture preparation is only offline before host startup, separately identified, and never claimed product mutation.

Password/refresh/user/logout endpoint request and response schemas MUST be derived from the actual consumed SDK closure before source admission. This document does not invent a mock equivalent. Current parent includes immutable collection05e85144 and independent review6c3451ed: four roots,104 embedded files,7993322 bytes are partial integrity evidence. ReactDOM19.2.0 development/production client hashes b88ee1abef622d46a74419c53e73192bc68ea07e94772a0f8a1760740598e44f / c59e90f48ba6343343d378d9976b774be6af15a555ecf4ecf3810f62c4381997; SDK entry hash31afefdc05e0ed27b73863e807c5067f0a024f5e4c7d9c09b8b56f444c7aed3f. ReactDOM tracks via own Object.defineProperty/set.call/stopTracking delete. Wrapper ordering/forwarding must preserve original semantics; observed package version is not loaded-artifact proof.

Seven reported missing packages in collection1 are a wrong nested pnpm lookup; correct sibling links exist per the independent review. Five Supabase SDK transitive implementations remain uncaptured in that bundle; React and scheduler links resolve captured roots. Do not rebrand this as nonexistent dependencies or full SDK closure. Destination-copy hashes, actual browser exports/conditions/Vite transforms/cache and full dynamic serving closure remain mandatory. Read/validate consumed ReactDOM+React+SDK immutable source/config before claiming source qualified; do not use a blanket node_modules hash or Node resolver as substitute.

Acquisition must capture synchronous same-node value/checked/selected/text mutations, removed-node changes before observer delivery, actual native/default-action and React-controlled paths, timer text/six preferences/both export payloads/host source labels; preserve receiver/getter/setter/return/throw exactly once, reentrancy, loss and restoration. MutationObserver/Profiler/rAF alone misses transient wrong-owner property writes and cannot certify no flash. A finite immutable shared collector + actual browser/config coverage and all causal controls is an unavailable normative input today. P-LEDGER/I1 remains an acquisition admission hold. All transition rows retain source identity, document/loader, sequence, phase, auth owner/generation, business object+epoch/kind/id/generation, key/revision/session and immutable values; never filter out wrong-owner rows.

Shared final impact3 f667a0b6 and reviewbdc06bd5 are conditionally adopted at P, despite the older impact's historical UNADOPTED heading and compressed task-card wording. This is design adoption only; shared author3 is exhausted, usable source/method remains unadopted/unqualified and no author4 is granted. Current partial collection does not release final caller source slots. Missing existing enclosing root capture implementation is another explicit prerequisite, not an invitation to invent it inside this contract.

## 7. Finite machinery boundary, interfaces and commands

The twenty future ADD paths under docs/reviews/audit-parallel-pomo04-runner-source-r1/ remain exactly those in Appendix A §3. No source files are created by this contract. Their interfaces below are proposed machinery protocols; full fresh source review must prove implementation, not accept these declarations as executable evidence.

| File | Exact proposed entry / ownership |
| --- | --- |
| launch.mjs | main(argv:string[], inheritedOuterEnvelope:Readonly<OuterEnvelope>):Promise<LaunchReceipt>; parses only after enclosing root has reserved raw capture. Refuses absent/replayed/mismatched envelope before product import. |
| supervisor.mjs | createSupervisor(envelope):Supervisor; ownProcess(spec), ownTask(spec), ownWriter(spec), ownSocket(spec) register before start; abort(reason); finalize():Promise<TerminalReceipt> joins every owned resource. |
| source-gate.mjs | admitSource(envelope, sourceManifest, executionManifest):Promise<SourceReceipt>; streams immutable archive, binds requested/resolved SHA, lockfile, exports, tools, destinations and dynamic loaded closure. |
| driver.mjs | runMode(context, mode:Mode):Promise<ModeReceipt>; consumes only pre-expanded case-table, never discovers or drops cases at runtime. |
| fixture.tsx | installObservation(context):{stop():Promise<ObservationReceipt>}; transparent pre-import observers with exact collector identity; diagnostic direct internal reads labelled diagnostic, never business execution replacement. |
| host-fixture.tsx | startRealMain(context):Promise<HostReadyReceipt>; imports unchanged main and waits new non-null document/loader + managed coordinator/account-ready receipt. Paired uninstrumented main control. |
| auth-transport.mjs | createAuthTransport(context, frozenProtocol):Promise<{origin:string;close():Promise<TransportReceipt>}>; actual HTTP streams/request-response ledger, declared schemas/delays only; no private provider injection. |
| scenarios.ts | runScenario(context, frozenCase):Promise<CaseReceipt>; trusted actual UI, independent bytes/time/event oracles, no surrogate product writer. |
| case-table.json | schemaVersion1 with exact ordered cases and source-backed dispositions; each records id,row,mode,factors,preconditions,actions,oracle,expectedBefore,producer,artifactRoles,permanentPurposes. |
| native-adapter.mjs | createNative(context):Promise<NativeSession>; pipe CDP, own target/document/loader, trusted input, passive key audit, actual menu zoom/process cycles. |
| acquisition-adapter.mjs | admitAcquisition(context, exactMethodReceipt):Promise<AcquisitionHandle>; missing immutable source/config/qualification/adoption refuses, never fallback observer-only PASS. |
| focus-adapter.mjs | admitFocus(context, exactMethodReceipt):Promise<FocusHandle>; exact frozen method/context/probes/decoder and whole-document injective census. |
| disk-adapter.mjs | captureDownload(context, declaredSlot):Promise<DiskReceipt>; inspect actual disk source, hash/schema/owner, absent/wrong/truncated controls and cleanup. |
| vite.config.mjs | Actual archived Vite/browser/React/CSS config, source-bound env, reserved origin/cache/output; no product changes or main checkout server. |
| qualification-runner.mjs | runControls(context, mode:QualificationMode):Promise<QualificationReceipt>; real source-path positive/negative/causal pairs and no automatic retry. |
| qualification-controls.test.mjs | Export full frozen control definitions; filename does not license test execution. All actual controls in §9 must be implemented, not dummy stubs. |
| execution-manifest.json | schemaVersion1 mapping original→case→lane→producer→artifact→terminal, admission/budget/resource and qualified-method identities. |
| qualification.md | Full protocol/config/control expectations and actual command tables; only observed qualified receipts may later say PASS. |
| inputs.sha256 | All immutable closure, config, source, tool and method identities; no moving HEAD or symbolic package versions. |
| source.patch | Full-index binary patch of other19 files, excludes only itself; source review reproduces names/status/hash against exact parent. |

Proposed CLI is an argument array, never shell eval: [nodeExecutable, launchAbsolutePath, '--envelope', envelopeAbsolutePath, '--lane', lane, '--mode', mode]. nodeExecutable/launchAbsolutePath/envelopeAbsolutePath are mandatory exact absolute values from the immutable enclosing admission; no default cwd, PATH fallback, guessed source, or string placeholder may be accepted. lane is exactly before|fixed|integrated|affected|qualification. Mode is exactly meaning|elapsed|reset|completion|faults|lifecycle|preferences|departure|account|contention|disk|consumers|visual|focus|closure. One mode includes its full finite cases; splitting filenames or subprocesses does not reset purpose budgets. Driver internal reruns are prohibited.

Qualification CLI uses the same entry/envelope/lane=qualification; mode is the same business-mode context and frozen control group, selected through the immutable envelope controlGroup field, not a freeform bypass. Control groups: source, host, acquisition, native-lock, disk, focus, process, terminal. For every permitted combination the execution-manifest supplies exact argv, source/fixture/oracle hashes, permanent purposes, positive/negative pair, process/resource budget and all outputs BEFORE execution. Missing source-qualified combinations refuse admission. This contract author runs none.

All commands for reused originals remain the exact manifest-bound runner interfaces/modes in Appendix A and complete canonical §14/Rules; do not translate them into the new CLI. Package commands when later independently admitted are pnpm --filter @repo/plugin-web-pomodoro test; pnpm --filter @repo/plugin-web-pomodoro typecheck; pnpm --filter @repo/plugin-web-pomodoro lint. Actual affected package/host/storage/readers commands and all 16 F1 plus Clock/Header/accepted-caller modes must be copied from their bound original sources with fixed target/output arguments, preserving per-mode counts/refusal procedures. A contract table is not a process receipt, and incomplete original command/argv/resource history blocks that unit until exact reconstruction.

## 8. Full fifteen-row command, case and emitter relation

Each row below refers to the complete business oracle and L1-L8 in Appendix A; neither table narrows the other. Case identities are finite ordered tuples of the listed factors, and must be fully materialized and hash-bound in case-table.json before source review. The present contract fixes their factors and effect controls; source materialization cannot weaken/drop a tuple for convenience. A structural absence requires source-derived disposition naming exact control/source/state, never runtime missing treated as PASS. Every active family has unchanged positive controls and causal denial controls. Current new Reset dialog is absent in P0: that is an expected semantic BEFORE failure after valid startup, not a fixture refusal and not a control invented into P0.

| Row / CLI mode | Exact finite factors and business oracle | Additional emitter / effects |
| --- | --- | --- |
| P04-01 / meaning | languages en,zh; surfaces normal,fullscreen; states idle,running,paused,pending,unavailable,C3. Actual Stop/save, Reset/discard, Pause/Continue, Exit and preference controls separately. | host+acquisition: visible/accessibility/enabled inventory, source availability, real first-frame values; native/focus on changed controls. |
| P04-02 / elapsed | focus25 run25s/pause300s/resume35s; zero elapsed End; paused End; preserved old sentinel. Exactly60000ms incomplete,list1:00,Statistics1m, completed count/streak unchanged. | scenarios+actual readers: independent clock input/raw history id/time, consumer before/after, no reader writes. |
| P04-03 / reset | running-unexpired,paused,idle × confirm,Cancel,Escape; opening/no implicit pause; all L1-L8. Same-id pending/recorded exceptions and time-equivalent control required. | host+native+acquisition+focus: captured authority/id/revision/token, zero old-intent effects, once-only dispatch, true result and live return. |
| P04-04 / completion | focus,short-break,long-break × on-time,late-recovery; predeadline queued End,late-grant Reset; completed focus counts1,2,3,4; default and custom duration. | scenarios: exact deadline/id/firstRecordedAt/WAL, next committed preset/no auto-start; break exclusion. Clock injection labelled and distinct from process-away elapsed. |
| P04-05 / faults | start,pause,resume,discard denial; C1,C2,C3,C4; active/history read-denied,invalid JSON,invalid member,foreign owner; no locks; competing winner. | per-key read/set/remove attempt+throw and raw bytes, source status/error, exact retry, events; missing history is valid empty control, invalid history never filtered into empty truth. |
| P04-06 / lifecycle | route away/remount,reload; running,paused × two whole-process reopen cycles; C1,C2,C3 forced loss. | native+supervisor: owned PID/start/descendant absence, same durable profile, new loader, original deadline/paused elapsed and actual raw disk each cycle. |
| P04-07 / preferences | preset,customMinutes,displayStyle,theme,sound,muted × pending,failure,conflict,unchanged-uncertainty,changed-uncertainty,same-value-successor; committed completion next-preset. | host+acquisition: actual six producers, latest-id completion and saved sibling controls; zero preference-attributed timer/history mutations. |
| P04-08 / departure | rail,POP-back,forward,programmatic,same-turn; route-first,signout-first; Stay,Escape,Export,discard,all-success; prior rail Cancel and Appearance veto. | actual App/coordinator+native/disk: one first intent, each release/location/identity count, zero non-live blocker/Invalid blocker transition errors; preference-only effects. |
| P04-09 / account | A→B→locked→A; epoch,generation,tombstone; L1-L8; queued End,Reset,pause,Continue,Retry; old export permission and retained device draft. | host+acquisition: complete transition ledger, no wrong-owner transient, no old attributed writes, fresh A reconciliation and B action positive controls. |
| P04-10 / contention | End/End,End/expiry,Start/Start,stale-pause,stale-Reset,stale-frozen-End-Retry,winner-then-fresh, each in two real same-origin documents. | native lock held/pending/query/product request+grant timeline, authoritative id/revision and stable firstRecordedAt; no surrogate lock or writer. |
| P04-11 / disk | preference,timer; C1,C2,C3 snapshots; full get/set denial; Blob,URL,actual append,click fault; synchronous owner change after setup/before click; denied,truncated,wrong-owner,absent disk. | disk+native+host: both exact filenames/formats, captured raw/memory payload, actual disk hash, guard/navigation/write/event negatives and cleanup; actual append only if source uses it. |
| P04-12 / consumers | FocusRecordList,PomodoroOverview,Statistics,StatPomos,CmdK × early,completed,break,unreadable,legacy; local finishedAt day boundaries and actual visible range. | actual reader modules/routes + acquisition: zero consumer write, elapsed not configured duration, unknown not zero; CmdK limitation/DASH06 separation retained. |
| P04-13 / visual | widths375,414,768,1024,1440; en,zh; styles digital,ring,clockwise,apple,minimal,focus; themes coral,amber,sage,teal,blue,violet,rose; actual changed idle/running/paused/pending/unavailable/C3/dialog/export-error states and normal/fullscreen; pet-hidden-after-resize/pet-on,Topbar statuses/overlays,actual menu200. | native+focus: full CSS/screenshots,44×44 new targets, containment/overflow/occlusion/center-hit, viewport height/DPR/zoom, independent visual review. Conditional structural absence is explicit before source approval. |
| P04-14 / focus | every actual new/changed control and supported state; en,zh; themes/style contexts as visual; trusted Tab,ShiftTab,Enter,Space,Escape; live initiating target,removed target,replacement view. | native+qualified focus: injective whole-document census, forward/reverse cycles, each focused+moved-on image, once-only effects and key audit; no fake keycode. |
| P04-15 / closure | every original and expanded row/emitter; lanes before,fixed,integrated,affected; full canonical E1-E25 including E24/Rules; source,qualification,vendor,full acceptance references. | supervisor/driver: no aggregate PASS on missing/unjoined/unqualified required item; immutable source/lineage/purpose/evidence matrix. |

Event oracle in every business mode records Storage.getItem/setItem/removeItem arguments/results/errors, raw active/history before/after, synthetic and real StorageEvent keys/newValue/storageArea, web:pomodoro:session-finished payload/count, auth/business transitions, preference engine operations, router location commits, sign-out invalidations, blocker calls/releases, download setup/click/files, runtime errors and actual source identity. Wrappers delegate unchanged cases exactly once. Settle newly-appended history emits the existing event then same-tab storage invalidation; events are best effort and not ledger durability. Discard/current Reset does not emit a history-finished event; preference guard discard does not write timer/history. Every zero-effect assertion attributes to a captured operation against its time-equivalent control.

Each case owns source.json,admission.json,actions.jsonl,effects.jsonl,scope-transitions.jsonl,raw-before.json,raw-after.json,runtime-errors.jsonl,stdout.log,stderr.log,result.json. Native adds process.jsonl,keys.jsonl,context.json plus declared PNG slots; disk adds downloads-index.json and exact declared filename slots; lifecycle adds cycle0/cycle1/cycle2 process/durable receipts; focus adds census.json and each pre-expanded focused/moved-on slot. Paths are runRoot/lane/mode/caseId/role, with root-bound immutable identifiers and collision checking. A source-expansion table supplies every numeric stop/capture slot before its run; runtime stop discovery disagreement refuses, never truncates. Full closed-cycle census may justify unused reserved structural slots; interrupted,late,missing,truncated slots remain MISSING. No fake PNG/unlisted file/wildcard output.

## 9. Actual-path qualification and terminal protocol

All qualification is UNRUN. Every positive/negative pair below must later execute the real archived application/machinery path with exact immutable controls, not only validate a JSON schema or generic dummy child. Controls are failures of machinery when expected; they may never be mistaken for the expected P0 product defect.

| Group | Exact causal pairs / observation |
| --- | --- |
| source | Valid streamed P0 archive versus requested/resolved SHA mismatch, changed lockfile, wrong @repo physical/export condition, outside-root module, changed transformed/served source, stale optimizer cache and dynamic-import escape. Same-buffer source→destination hash and actually loaded browser bytes/CSS/assets, not only Node resolution. |
| host | Unchanged real main with live non-null SDK/coordinator and exact HTTP versus null config, partial SDK import, failed HTTP, delayed ready, same old document, wrong loader and missing coordinator. Delayed A callback after B and deletion/device/Todo effects remain observed. |
| acquisition | Actual same-node wrong value then restore without attribute mutation; detached-node change before observer delivery; unchanged control; genuine native input/default action; React-controlled update/own tracker wrapper/untracking; reentrant access; unsupported descriptor; injected known loss. Assert preservation of native receiver,return,throw/order/exactly-once and fail closed on actual loss/unsupported path. Observer-only inability cannot self-certify a no-loss flag. |
| native-lock | Real POMO product request pending behind held lock in second document versus lock absent, wrong account/generation lock, wrong target owner, competing winner and invalid captured scope. Positive grant/winner/fresh operation proves liveness. Canonical activation seam is never substituted. |
| disk | Real actual saved file versus OS/browser denied, absent,truncated,wrong-owner file; Blob/createObjectURL/actual append/click failure; synchronous owner switch during setup; post-click non-acknowledgement remains a limitation. Closed-file size/hash/content checked, cleanup independently observed. |
| focus | Authentic Appearance calibration and original probes/decoder on actual Retina/full-vs-clip/scrolled cases; incorrect coordinate/context/outline-none adjacent control must reject. Genuine menu200/effective viewport and ownership transitions, whole-document census with alias/omitted stop negative, fonts/animation and actual nonfocusable anchor. No resampling/emulated zoom substitute. |
| process | Actual Vite/HTTP/Chrome/osascript/archive/setup child nonzero/signal/premature long-lived exit0; retained-descriptor descendant/late stdout+stderr; native transport malformed/unknown-ID/idle/error; actual closed-browser descendant survival and reopened loader. Registry ownership must prove what can be terminated. |
| terminal | Malformed/truncated envelope before parser/import; replay/resource collision; missing/late/truncated per-case file; delayed journals/file fsync/close; blocked terminal write; late writer after apparent completion; supervisor failure; unjoined descendant/stream/socket. Both unchanged full success and quarantined outcomes captured by enclosing root. |

OuterEnvelope must bind schemaVersion1, allocationId, rootCard SHA/hash, task/actor/source/target identity, adopted contract/method/source receipts, complete permanent-purpose ledger and cap, actual argv/cwd/env/tool hashes, owned resources, exact immutable output directory and stream descriptors, absolute deadline and reserved teardown interval, replay nonce and root reservation receipt. All are real root inputs, not defaults supplied by the child. Every unit is admitted before launch; malformed/missing envelope still has outer raw stdout/stderr. Inner exclusive-create is only a filesystem guard, not root anti-replay or budget authority.

One enclosing monotonic deadline covers allocation, parser, archive, dependency resolution/copy, Vite/auth/browser/menu startup, actions, observations, drain and final writes. Root must supply finite numeric bounds for total/startup/action/drain/TERM/KILL/finalize and concurrency/process/output quotas in its exact card; this task supplies none and authorizes no runtime. No stage escapes that deadline and no unexplained automatic retry. The supervisor joins owned child exit, both stdout/stderr EOF AND close, tasks, sockets, native transport, file writers and fsync/close; PID identity includes start time and lineage. TERM/KILL escalation targets only proved owned descendants. Promise.race timeout fences callbacks but is not cancellation or quiescence.

Provisional append journals retain failures, missing artifacts, signals and late tails. Immutable terminal complete/PASS is written only after all joins and final closed-file reconciliation; unjoined resources yield QUARANTINED_UNJOINED, never a prematurely immutable success. Terminal-write failure itself is captured by existing outer supervisor after inner death. Root receipt waits for supervisor exit and outer stream closure. Actual enclosing implementation/source identity is currently unidentified in the fixed corpus; a proposed root-supervisor filename, manual lease metadata or this API description cannot satisfy it. Source admission for dependent machinery stays BLOCKED until an independently reviewed existing capture or separately authorized finite solution exists.

## 10. Native visual/focus contract without weakening

Use pipe transport for every new native runner, trusted CDP keys/drags, passive key audit, no nativeVirtualKeyCode. Reused frozen sources follow complete canonical K-1/transport/capacity rules. Whole actual App/CSS must run; no injected outline, CSS/DOM patch, fake hue, rectangle-only acceptance, manual query-selector jump replacing Tab, emulated DPR or zoom/resampling. Observe ownership PID/start/window/foreground/CDP target/document/loader before and after menu/reload/resize/display change; ambiguous ownership refuses.

Preserve exact frozen pixelFocusWalk/block/function/probe/context hashes and decoder, or a fully qualified reviewed adopted versioned successor with its precise identity. Whole-document census is injective from full descriptor to node; tag-only/truncated-name aliases fail. Start from a genuine nonfocusable center-hit anchor; forward/reverse walk records every focused and moved-on capture, outside-stop and wrap behavior, once-only action/focus return. The actual ring predicate retains signed distance/band/interior/outside exclusions and outline-none adjacent controls.

Retain fonts/finite-animation stabilization, six captures spaced120ms with two identical frames,120 double-rAF font wait and less-than0.01 CSS-pixel alignment. Actual Retina CSS↔raster, full-versus-clip and scrolled controls plus authentic Appearance gradient/PNG decoder are qualification requirements. Native menu200 records effective viewport, DPR, zoom, viewport height and recalibration after context change. All seven actual Pomodoro hues and six display styles are explicit source factors, not permission to recolor calibration. Screenshots require independent visual judgment in addition to numerical method.

## 11. Permanent purposes, historical failures and local holds

Appendix A retains the full106-log census individually with immutable hash/byte identity, and the entire original purpose/applicability table. Families: departure Astra36, author2, independent18, native27; durable11, durable-independent6, preference3, Statistics3. 106 artifacts are not106 launches. Original failures, summaries versus raw duplication, geometry-only confidence followed by containment failure, empty unload build-refusal/diagnostic, e1/990 rejected expansions, later package/F1/host/close/export variants remain. Unknown PID/exit/probe/formal status and complete permanent totals remain UNKNOWN, never zero/success.

Durable diagnosis before7FAIL/1control and reproduction8PASS; package140 then independent stale correction143; main independent known≥2 and each running/paused close known≥2; preference-native known≥2 and disk≥1; departure repeated modes have more than three historical artifacts. These are retained known evidence limits, not a claim of compliant complete launch totals. Package122/129/140/143/146/148 histories, full native mode launches and author-versus-independent processes must retain their exact provenance. New source/actor/worktree/path/proposed CLI does not reset old purpose cap3.

New pre-action Reset consequence/Cancel/captured-confirm/Stop-versus-Reset/leave disclosure is source-grounded as a possible genuinely new semantic purpose only after root classification and qualification. Mixed package/native/process/export/affected invocations charge every older purpose they actually execute. No empty caller evidence→0/3 inference. Root must bind original formal/development/calibration/probe/refusal/unknown history, actual parent-child process grouping and known consumed/remaining≤3 per unit before any future invocation. Unknown older lifetime blocks that invocation; it does not block this documentary source work. Reuse only exact source/dependency/host/CSS/oracle-equivalent accepted evidence with limitations.

Current holds are LOCAL: I1/usable shared source+forwarding configuration and enclosing capture missing; retention3/3 and visual3/3 exhausted; M8 lifetime UNKNOWN (retained lower bound2), REL02/03 V1 UNKNOWN; canonical Task/Calendar production activation closed. These do not create a false global prohibition on genuine native POMO commands. Q1 focus1/3, other0/3, development2/83; B70 native12/6432, development40/4884, focusEN2/ZH2 and visual3/3; F1formal2/180 and development3/302 retain their historical accounting. No fourth method author/qualification attempt or renamed zero budget is granted.

Historical machinery author1 staticPASS and allowed-undefined/empty-no-files then absent-path stage refusal/literal unchanged-buffer closeout remain in the full appendix. Machinery review1 consumed attempt1/3 but functions.exec construction failed before shell/checker: actual launch0, staticUNRUN, no outputs; in-memory approval was not delivery. Review2 source86de/I is complete conditional approval. Those histories are not erased by this genuinely new exact source-contract iteration1/3/static1.

## 12. Complete canonical and downstream acceptance sequence

Appendix A reproduces complete adopted machinery impact including its complete immutable source2, canonical Clock r2 §14 and all106 logs; Appendix B separately preserves full canonical extraction through actual next-section boundary, including every E1-E25, E24 row AND Rules. Canonical8bf613962517ee9b80bf51373e8ad88960c570cc full contract hash214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. The actual boundary is inspected, not a guessed fixed byte length or truncated extraction. The original includes the separator placement after the surrounding source section; copied required section ends only immediately before §15.

Preserve all16 F1 invocations, new Clockc1-c5, Header source control/fixed/native18/Astra/Sol and capacity refusals/copies, AppRail eight modes+host, full package/static/host/readers/storage and original failure/judging-copy distinction. C-FB00210/10 judges More; OE26/26 judges Appearance beside frozen24/26; C-RD1 15/15 judges Features beside frozen13/15 and diagnostic C-FD1 14/15. No missing ID silently N/A. Exact no-rerun exclusions require unchanged specified source/shell/App/CSS bounds; any failed bound reopens the required regression.

Ordered gates remain: fresh FULL independent review of this exact source contract, including entire inherited basis and exact API proposal; root exact-hash conditional adoption/finite source grant only after source prerequisites; full source author and independent source review with all actual sources/configs/control cases/commands/artifacts; root complete-purpose/resource admission; actual positive/negative/causal qualification and independent review/root adoption; valid FULL unresolved original P0 before with positive controls and exact accepted reuse; fresh bounded product implementation on a later explicit subset card; independent unchanged-oracle fixed AND integrated/affected/account/host/native/disk/visual/consumer/full G1; actual full different-vendor verification with raw source/response/tool/refusal/cost receipts; fresh non-author full Astra acceptance; sole-root evidence append/reconciliation preserving formal312 and original evidence; fresh inventory and remote preservation/ancestry/sync.

M+G+B still requires qualification→root adoption→valid original full before→two-CSS geometry/independent acceptance→versioned baseline/E1-E5→complete Clock chain. No product implementation before complete valid before; no snapshot-only before or limited preference acceptance closes the full caller. A fresh Codex actor is independence only, not different vendor. Source/qualification/dependency gaps do not waive business acceptance.

## 13. Source-admission disposition and exact unresolved inputs

Prepared complete conditional source contract for fresh full review; no self-approval. The actual missing inputs are: (1) complete immutable consumed SDK transitive bytes plus configured/browser-loaded source and exact auth HTTP schemas; (2) reviewed usable synchronous acquisition source/config/forwarding/capability identity and its actual controls; (3) identified immutable enclosing root capture implementation and actual terminal/resource closure; (4) qualified native focus/context method with lawful remaining purpose capacity; (5) complete original per-purpose invocation census for every older unit requested anew. Items1-3 block dependent runner source admission; items2-5 block dependent qualification/launch. They are explicit missing facts, not incomplete code placeholders, installation instructions, invented policy or an API grant.

Current write authority remains exactly this contract and inputs.sha256. Eleven original conditional product paths and twenty machinery candidates remain ceilings for separate reviewed grants, not active authority. No additional protected exception is silently proposed: any genuinely required shared availability/storage/account/host/schema/coordinator/public export change must identify exact files and frozen defect in an independent impact/review before implementation. Preference recovery never acquires account timer/history ownership.

All3007/2979/2954/2932/2914/2900 inherited raw identities, complete prior source-output MDs, all106 logs and additional current parent/source inputs are read and hash-bound. Source-output documents are explicitly indexed in this manifest even when their own inherited index omitted themselves. Full-byte integrity is not semantic review of every dependency or visual acceptance of historical images. Complete immutable source2/machinery/review corpus remains accessible by those exact identities.

All inputs and BOTH full UTF-8 output buffers are constructed and validated before the first write. Exactly one actual concluding Git/standard-library static checker is allowed, and any failure stops with no semantic retry/correction. Static integrity checks scope/clean parent, all hashes and ordered prefixes, full canonical/Rules, original ledger/formal counts/parity, exact15/L1-L8/11/20 content and both buffers. Output/source commit hashes and actual checker command/PID/session/chunks/exit are external closeout receipts, avoiding circular hashes. Exact-path stage and one hook-disabled commit; no amend/push.

Current budgets: source-contract iteration1/3; concluding static1/1 (receipt appended only after actual outcome); runtime/tests/build/typecheck/lint/browser/native/server/qualification/probes/vendor/child launches0 each. Provider billing/token totals unavailable, not zero. No product or original runner imported/executed. Read-only discovery had three wrong guessed source paths (controller outside internal, provider outside providers, nonexistent usePomoPrefs); rg found actual paths, no runtime/probe or checker was launched by those reads. Several long displays were truncated; bounded follow-up reads and complete-byte buffers preserved integrity. Memory lookup found no relevant POMO entry and supplied no authority.

## Appendix A. Full immutable approved machinery basis and adopted source2

The following text is copied byte-for-byte from a9054733b4f1179dac138b73031e3d0fd22b2416:docs/reviews/audit-parallel-pomo04-source-machinery-impact-r1/impact.md. Its historical role, UNADOPTED heading and receipts describe that source's time. Current authority/holds are §§1/6 above. All fifteen rows, eight lifecycle cases, eleven paths, twenty machinery files, original purpose history, full source2/canonical/logs remain binding.
# POMO-04 full source-machinery technical impact r1

**PROPOSED / UNADOPTED.** Full POMO04 evidence machinery is source-feasible through the finite candidate and dependency boundaries below. This is technical-impact author **1/3**, static **1/1**, with no runtime grant. Shared first-frame acquisition remains I1-held; native focus and outer qualification are prerequisites. No product-owner policy or shared cancellation algorithm is invented. Full original acceptance remains open.

## 1. Fixed scope, current authority and independent role

Module **web**; workflow A under the sole root A-Codex controller. Fresh author /root/parallel_a_pomo04_machinery_impact_r1, no children; requested Astra is task configuration, not provider attestation or actual cross-vendor evidence. Sole writable checkout is /Users/lijinlong/.codex/worktrees/audit-parallel-pomo04-machinery-impact1-20261010/XAI_Desktop. Other authors and worktrees remain untouched.

| Identity | Exact value |
| --- | --- |
| Direct clean parent P | 6bcb03c31d7bcd50ac81bd2549f949276fa4d641 |
| Fixed input I | b52b5da64f1c7ff355b41e49d7972b6c8e8703d1 |
| Product P0 | f9eb4b1f207bc4b46f547b90afc250424b3c8695 |
| Adopted full document source2 | 9e2e6cf722171936dc8c085d588f0c047d968e92 |
| Full independent APPROVED review2 | d75a0d6de0521abde0128339049bd860bc0ec7a2 |
| Original source1 / REVISE review1 | 59dae0b524e19e6d0c273174488b84d68fb323f3 / 0f2f5c1a155f8fda127758f7986010dd57335f21 |
| Original ordered scope | e041c2bc293b70db367444c62c4300231976dbf7 |
| Later hold steering S, separately bound | 43ba9fcfadb1075bc117b4d75f8888573d1ae2f2 |

P's task-pomo04-source-machinery-impact-r1.json grants exactly this impact.md and inputs.sha256, two ADDs. Root's adoption of source2 covers the full conditional DOCUMENT basis only, not implementation, API, schema, host, method, source path or run authority. The historical UNADOPTED source heading in the verbatim appendix remains historical. Root P execution-state records the full review2 receipt and doc adoption; this author does not self-adopt.

S binds task-shared-native-host-focus-impact-r3.json and shared-impact-author2-failure-receipt.json without repinning I. Shared impact-author2 consumed FAILED static1/1, confused raw477/2663 records with normalized unique objects, wrote no outputs and made no commit; its full hash/patch/buffer/write assertions were UNRUN. The fresh final shared impact-author3 is running/unadopted per explicit controller steering; there is no received review2/adoption evidence here. I1 remains a hold. Impact1's four conditional bases P-HOST/P-ACT/P-FOCUS/P-OUTER do not erase P-LEDGER REVISE. No source3 or usable-method grant follows.

The full 2954 review2 records retain the exact ordered 2932 source2, 2914 review1 and 2900 original prefixes. Record counts precede alias normalization; unique Git blob objects and byte identities are reported separately in the static receipt. All106 retained raw log identities and original before/refusal/failed/unclassified histories remain bound. Reading/hash verification is integrity evidence, not semantic review of every transitive file or visual interpretation of every image.

All312 original TODO fields and order, the39 reversible original module labels (30 web（project-system）,9 web（跨模块验证索引）), original933 plus only6 accepted TT08 references=939, and formal13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed remain. EXECUTION has top-level items; TODO uses sections[].tasks. Runtime/config/test P0 parity is distinct from the four accepted TT08 owning docs under packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md. There is no whole apps/packages byte-equality claim.

## 2. Source findings and finite technical consequences

All references below are immutable P0 source unless an explicit historical revision is stated.

| Actual source / observed implementation | Consequence for proposed evidence |
| --- | --- |
| apps/web/src/main.tsx imports tokens/global CSS; registerServiceWorker and bootstrapObservability precede StrictMode→AppProviders→RouterProvider | Freeze original main as the production startup control. Candidate host imports it without replacing startup; instrumentation is installed before that import and has a paired untouched-main control. Preserve DEV SW/cache effects and asynchronous observability imports/errors. |
| AppProviders.tsx resolves live non-null config and composes AccountDeletionRecoveryBridge, DeviceSessionBridge and TodoWebRuntimeBridge; session.tsx:65–93 creates managed generation coordinator/bootstrap only with non-null config | Local real SDK/HTTP transport with source-bound response schemas is required. A fake client or config=null reaches legacy behavior and cannot prove managed account lifecycle. No private React auth context replacement. |
| AccountStorageGate.tsx synchronously locks identity, clears Todo globals and pending OAuth; AccountDataGate contains public PomodoroSessionHost above routed UI | Real route removal retains account-owned timer host; actual auth/epoch invalidation is a different event. Observe auxiliary bridge effects, both auth and business generations, and first-frame source identity. |
| sessionController.ts:134–215 captures scope/issuedAt, calls navigator.locks.request on xai:timer:kind:account:generation:pomodoro, guards at grant and each write | POMO queue proof uses this real lock path. It does NOT call mutateCanonicalDataset/commitCanonicalCommand, whose separate activation remains closed. Never enable canonical activation to make POMO queue proof work; unrelated canonical-writer cases inherit that dependency hold only. |
| sessionController.ts:123–129 last-observer cleanup removes listeners/interval; no queued-command cancellation | Same-account UI teardown must leave issued command semantics intact. A test that declares every disposal cancels writes would encode the rejected review1 ambiguity. |
| useTimerTick.ts:86–93 reset uses defaults and a .then(setIdle); Module:395–401 clears notice before bare reset | Need frozen before for missing pre-action disclosure/one-shot captured decision and stale continuation. A prospective capture/result seam is limited to the existing eleven paths after before/adoption, not an implementation in this report. |
| sessionController.ts:151–166 handles absent-active recorded-id no-op, same-id pending revision exception, and pending/expiry ahead of discard; End uses issuedAt while Reset uses grant time | Oracle table must distinguish no-op, discard and settlement. Boolean true alone cannot prove which branch ran. Use raw active/history, operation identity, clock boundary and events as independent evidence. |
| pendingSettlement/elapsedAt and settle() preserve C1 frozen memory, C2 durable pending, C3 history+failed cleanup, stable id and first recordedAt | Fault only the exact pending/history/remove boundary, retain before/after raw bytes and true error; C1 process loss never promises recovery of a memory-only End intent. |
| Module:499–549 maps pending to paused shape and timer export catches setup/click failures silently | Separate state/disclosure and export-boundary before assertions. Actual disk success, not Blob-only success; read denial is unavailable, not successful empty backup. |
| Existing independent-close fixture directly activates accountScope and imports internal controller; old native runners use esbuild, port transport, ignored child streams and buffered archive | Preserve their historical evidence/applicability. They cannot be relabelled managed full-App or newly qualified supervision/native proof. New driver is transparent versioned machinery, not an in-place repair or a reset of old purposes. |
| Pomodoro package public exports are '.' and './session-host'; no controller export | Public host/UI is required for product evidence. A separately declared white-box diagnostic harness may read internal symbols inside evidence source only; it cannot prove public SDK/host behavior or justify new product exports. |

Recorded source hypotheses are not newly reproduced defects. Unreadable history mapped to [] is not valid empty; any missing caller-owned source-status exposure first needs a fixed defect and narrow reviewed patch. Shared storage API/schema/host changes require their own exact protected technical exception, independent diagnosis/impact and owner; this report proposes none as already approved.

## 3. Proposed finite source candidate and ownership

Only AFTER full independent impact review and exact root adoption, root may register one new source-only candidate with exactly the twenty ADD paths below. This proposal grants none now. All sources are documentary evidence machinery under the named directory; product source and original evidence stay immutable. No wildcard outputs, generic extra helpers or intentionally incomplete final skeleton.

| Candidate filename (all under docs/reviews/audit-parallel-pomo04-runner-source-r1/) | Complete responsibility |
| --- | --- |
| launch.mjs | Minimal outer-entry protocol, raw stream ownership before card parse/dynamic imports, fail-closed missing-envelope refusal. |
| supervisor.mjs | Owned children/tasks/FDs/writers, enclosing deadline, cancellation/joins, durable provisional journals and immutable terminal/quarantine. |
| source-gate.mjs | Card/adoption/lineage/history/resources; streamed archive, lockfile and full @repo/dependency/tool/cache/loaded closure guards. |
| driver.mjs | Exact case dispatch; aggregate only after all required emitter/disposition joins. |
| fixture.tsx | Pre-import transparent observations and public diagnostic observation bridge; no private provider or second writer. |
| host-fixture.tsx | Import actual main startup, full host/router/providers, untouched/instrumented correspondence and new-document ready identity. |
| auth-transport.mjs | Local real HTTP auth/device/Todo response protocol, request ledger and independently qualified fail cases. |
| scenarios.ts | All P04/L cases, trusted UI producers, timed competing actions and byte/event/business oracles. |
| case-table.json | Finite expanded case identities, factors, expected P0 outcomes, permanent-purpose mapping and exact emitters. |
| native-adapter.mjs | Pipe CDP, owned process/target/loader, trusted input/key audit, actual close/reopen and genuine menu zoom. |
| acquisition-adapter.mjs | Versioned qualified shared acquisition integration and normative identity refusal; I1-held until usable successor reviewed/adopted. |
| focus-adapter.mjs | Qualified identity-bound original/successor method integration, full census/context, all captures; never custom weaker ring test. |
| disk-adapter.mjs | Actual downloads and raw file hashes/schema/owner, no-clobber content receipts, cleanup and denial observation. |
| vite.config.mjs | Archived real Vite React/browser/CSS/import conditions, own output/cache paths, fixed env/local endpoints. |
| qualification-runner.mjs | Exact paired real controls and permanent-purpose admission; zero automatic retry. |
| qualification-controls.test.mjs | Source of actual positive/negative/causal acquisition, host, lock, disk, process, closure controls; not test execution permission. |
| execution-manifest.json | Original→case→lane→producer→artifact→terminal relation plus separately blocked canonical dependencies. |
| qualification.md | Frozen control expectations, parameters, commands, timings and external prerequisites; no claimed runtime PASS. |
| inputs.sha256 | Full transitive immutable source, canonical, method and tool identities. |
| source.patch | Full-index binary patch of all other19 candidate files, excluding only itself. |

No extra product export, host test seam, production activation toggle or edited startup is presumed necessary. If authentic full-main transport cannot expose a required observation without a protected change, the source author must stop and propose exact additional technical scope before writing that change. A qualification-only test activation seam in another caller cannot certify POMO production semantics. The eleven conditional product paths remain exactly the quoted adopted contract §6, and still need a later separate implementation card.

## 4. Host, identity and acquisition feasibility

Serve an immutable P0/fixed archive from the actor's own reserved loopback origin/port with actual Vite conditions, tokens, all imported CSS/assets and public App. Local nonsecret VITE_SUPABASE_URL/ANON config supplies the real managed SDK and local transport. Capture every actual request including method/query/body/headers/schema/status/timing; endpoints alone are insufficient. Bind password/refresh/user/logout and device register/heartbeat, auth durable generation owner, account business generation marker and deletion tombstone. Keep AccountDeletionRecoveryBridge and Todo globals/nonce lease requests in their actual paths. Reject undeclared network requests and nonlocal endpoints. The test transport may control delays/failures as predeclared external causes; it cannot substitute auth or accountScope internals. Account sign-in/out uses real exported SDK/coordinator UI path and callback order. Any fixture preparation of raw data occurs in an isolated offline setup stage with a receipt, before host import/action; never manufacture a claimed product writer.

Managed reload must acquire a new non-null document+loader and a ready marker bound to that pair, source SHA, auth generation and business scope. Tolerate only expected navigation context destruction. Startup-ready alone cannot discard transition evidence. Include delayed-ready positive, same-old-document/wrong-loader/missing-coordinator negatives, stale delayed A response after B, locked first frame, A→B→locked→A, generation/tombstone and deletion/device/Todo cleanup. Public main effects, real requests, queue ownership and product actions stay visible.

I1 applies to this caller too: coordinator/account subscriptions, Profiler, MutationObserver and rAF cannot prove a same-node wrong-owner input property written and restored within one turn. No generic capture-incomplete flag can detect a silent miss. The acquisition adapter must refuse admission until the shared final source supplies a fully reviewed, qualified, adopted immutable collector/config/input identity. Required acquisition includes synchronous property/event/DOM boundary collection with native descriptor/getter/setter/receiver/return/throw semantics preserved exactly once, immutable detached-node capture, reentrancy/loss accounting and restoration. Before using it, qualify actual wrong value then corrected without attribute mutation; removed subtree property changes before observer delivery; unchanged node; genuine native input/default action and React-controlled update; and unsupported descriptor/loss. Preserve mutation, commit and paint distinctions and all earlier transition rows without owner filtering. This report neither implements that mechanism nor treats the running shared author3 proposal as available.

Pomo timer text, both exports, six preference values and host/account source labels must be covered by the finite observable inventory and same-node/detached controls. Ledger rows include document/loader/sequence/action, auth owner/generation, business scope object+epoch/kind/id/generation, source key/revision/session, immutable text/value/checked/selected where applicable, phase and raw effects. Return to A creates new authority and never revives an old decision. Source before/fixed observation must not add persistent product state or alter UI/CSS to make capture easier.

## 5. Full case-to-emitter matrix

For every case, the source author must expand a stable, finite list BEFORE execution. No runtime discovery may invent or drop cases. The following families partition obligations; cross-references are explicit additional proof, never replacement by a shared green summary. Every case emits common identity/admission/source/raw stdout+stderr/action timeline/runtime errors/byte snapshots and terminal disposition. Emitter aliases H=host-fixture+auth-transport, D=scenarios+driver, N=native-adapter, A=acquisition-adapter, F=focus-adapter, X=disk-adapter, S=supervisor/source-gate. All files are in the twenty-path candidate above.

| Row / finite case seeds | Independent expected effect and mandatory additional emission | Producer / dependencies |
| --- | --- | --- |
| P04-01 meaning: idle,running,paused,pending,unavailable,C3-cleanup × EN/ZH × normal/fullscreen (only actual controls) | Stop/save, Reset/current discard, Pause/Continue, exit-view and preference discard remain distinct; capture visible+accessible labels, enabled state and source truth. Idle Reset changes no durable bytes. Not-present controls explicitly justified by actual source, never treated tested. | H,D,A; changed surfaces N,F |
| P04-02 early: run25s/pause300s/resume35s; zero-elapsed; paused-End; prior-row sentinel | Exact60000ms incomplete history and1:00 list/1m Statistics, unchanged completed rounds/streak, saved sentinel unchanged; use independent elapsed inputs, not helper-under-test expected values. | D,H; consumer timeline; historical durable/Statistics units inherited |
| P04-03 Reset: running-unexpired,paused,idle × confirm,Cancel,Escape; plus L1–L8 | One-shot captured id/revision/owner, pre-action consequence and Stop alternative; no implicit pause. Cancel issues zero old-intent command/writes/delete/event; confirm only captured unfinished activity removed, prior history identical except independently authorized settlement. All lifetime events below required. | H,D,A,N,F; new-semantic and old durable units separately mapped |
| P04-04 completion: focus,short-break,long-break × on-time,late-recovery; queued predeadline-End vs late-grant-Reset | Exact deadline/elapsed/completed/id/first recordedAt, next committed preset only/no auto-start; End issuedAt remains early whereas Reset grant-time expiry settles. Break history excluded from focus count/list. | D,H; native controlled clock explicitly distinguished from actual close interval |
| P04-05 cuts: start,pause,resume,discard write-denial; C1,C2,C3,C4; malformed/denied/history/active/foreign-generation/missing-lock controls | True success/recovery/unavailable vs empty, exact frozen Retry, no duplicate/conflicting overwrite; C3 saved history survives failed cleanup. Emit per-key get/set/remove attempts, real throw and original bytes, recovered bytes/event order. | D,H,A; exact fault-boundary hooks transparently delegate other operations |
| P04-06 away: route/remount,reload; running/paused × close1/reopen1/close2/reopen2; C1/C2/C3 forced-loss | Account host persists route removal. Whole owned browser process+descendants fully exits, same durable profile reused twice with new PID/start/loader. Running deadline settles once; paused elapsed unchanged; C1 memory intention lost without inventing crash promise; C2/C3 reconcile. Emit physical close/absence/reopen timeline. | N,H,D,S; old process histories unknown until reconciled |
| P04-07 preferences: preset,customMinutes,displayStyle,theme,sound,muted × failure,pending,conflict,unchanged-uncertainty,changed-uncertainty,same-value-successor; completion-next-preset | Actual control writes preserve latest operation identity, saved siblings and guard; pending Retry inert; each timer/history diff attributable to authorized progression only. | H,D,A; inherited draft/dv2/completion suites |
| P04-08 departures: rail,POP-back,forward,programmatic,same-turn; route-first/signout-first; Stay,Escape,Export,discard,all-success; rail/Appearance veto | Real App first intent and preflight sequence; guard retention/release once, location commit/signout invalidation once, zero non-live blocker calls/Invalid blocker transition. Preference discard owns only preferences. | H,D,N,A,X; full old host/F1 unit mappings |
| P04-09 identity: A→B→locked→A,epoch,generation,tombstone; L1–L8 and stale export | Nonempty A/B sentinels and transition-wide first-frame proof; old denied intent contributes zero A/B mutation but natural A reconciliation permitted by paired control; fresh A/B remains live. Device draft persists with new permission. | H,D,A,N; shared I1 blocks acquisition-dependent proof |
| P04-10 contention: two real same-origin documents × End/End,End/expiry,Start/Start,stale-pause,stale-Reset,stale-End-Retry,winner-then-fresh | Real held/native pending lock query and product-origin request prove queue. One row/id and first recordedAt, winner intact, fresh controls work. Two targets do not replace full-close proof. | N,H,D; native Web Locks, no fake queue or second writer |
| P04-11 export: preference + timer; pending/history/clear cuts; full read denial; Blob,URL,append(if used),click failure; synchronous owner switch at URL and before click | Actual pomodoro-preferences.json six values/version/kind and pomodoro-recovery.json owner/raw active/history/memory settlement; disk hash/schema/content, no guard release/writes. Timer denied raw source unavailable, no empty backup. Errors independent, cleanup best effort. OS post-click acknowledgement limitation retained. | X,D,H,A,N; actual downloaded bytes and absent-download negative |
| P04-12 readers: FocusRecordList,PomodoroOverview,Statistics,StatPomos,CmdK × early/completed/break/unreadable/legacy | Read-only projection and session identity; completed-only rounds, all measured focus elapsed, browser-local finishedAt attribution. CmdK configured duration/optional completedAt is retained limitation, never elapsed oracle. DASH06 scale separately owned. | H,D,A; actual route/import reader closure and zero reader writes |
| P04-13 visuals:375,414,768,1024,1440 × EN/ZH × actual changed normal/fullscreen/dialog/error states; pet-hidden-after-resize/pet-on; Topbar status combinations; overlays; menu200 | All required actual source themes/selection states enumerated before source review,44×44 new targets, containment/overflow/occlusion/hit center, viewport height and effective zoom. Raw screenshot identities and independent human/visual judgment, no CSS injection. | N,F,H; qualified method/context and full CSS, old visual budgets retained |
| P04-14 keyboard: every new control × trusted Tab/ShiftTab/Enter/Space/Escape,normal/fullscreen/dialog; live/removed target return | Whole-document injective census, forward/reverse stops, once-only effect/key audit and per-stop focused/moved-on images; restore meaningful live control, not body/detached target. | N,F,A; no nativeVirtualKeyCode, exact qualified pixelFocusWalk |
| P04-15 full chain: source,controls,before,fixed,integrated,affected,G1,vendor,acceptance | Exact hashes/record coverage for every row, required original failure/judging-copy outcomes and all canonical IDs; no aggregate PASS while any required dependency is missing. | S plus every producer; fresh independent reviews/root gates |

### Lifetime submatrix, required for BOTH P04-03 and P04-09

The oracle uses a time-equivalent no-old-intent control with identical initial raw bytes, elapsed time, lock release, retained host and separately authorized competing operations. It counts attributed effects, not a permanent ban on all A activity. Each L case emits capture→invalidate/dispatch→lock grant→durable branch→UI continuation and control timeline, with account/id/revision and command/write/delete/event counts.

| Case | Stimulus and expected source-consistent result |
| --- | --- |
| L1 | Before dispatch: Cancel,Escape,unactivated close,decision replacement,route/hook disposal,account invalidation; zero old-command emission, repeated stale confirm inert, valid live focus return. |
| L2 | Already dispatch End,confirmed Reset,Retry behind actual held lock, then same-account route/dialog/hook teardown; issued command survives and settles/discards under existing rules, UI continuation inert. Include pause/Continue as command-lifetime controls without imposing dialog lifetime on them. |
| L3 | Dispatch then invalidate epoch/account/locked/generation/tombstone before grant; old captured command denied at guard/write, no A flash/B download, return-A fresh reconciliation separately attributable. |
| L4 | Competing new active id or ordinary same-id revision before dispatch/at wait; reject without recapture/rebase, winner untouched, fresh action live. |
| L5 | Same-id pending revision exception; otherwise expiry reached at Reset grant; settle frozen/original-deadline row before discard. End uses issuedAt/frozen Retry instead, preserving C1/C2/C3. Different pending id rejects. |
| L6 | Absent active and recorded old expected id: existing successful no-op, zero new row/deletion, history exact; new active id rejects; conflicting settled content preserves C4 refusal. No false discarded-progress notification. |
| L7 | Durable command succeeds/fails then hook/account/decision/presentation/session becomes obsolete before await continuation; no stale idle/notice/focus, durable success never relabelled cancelled or rolled back. |
| L8 | Fresh scoped action succeeds after each rejection/disposal/return; no poisoned retry/frozen intent, no duplicate, normal reconciliation preserved. |

Opening captures the ready scope object+epoch,kind/id/business generation,id/revision,reset presentation options,focus target and unique one-shot decision. Consume before dispatch, never obtain a fresh default identity on confirm. There is NO under-lock UI cancellation token. Any new public/result API is outside present authority; a future exact implementation may expose only existing branch identity within the conditional controller/hook bounds after reproducing the requirement.

## 6. Qualification, artifact relation and terminal closure

Before source authoring, freeze the matrix expansion and every expected P0 failure/control, source input identity, command argv/mode, maximum duration and permanent-unit membership. Apparent expected product failure cannot absorb startup/transport/precondition/acquisition failures. Normal unchanged controls must succeed; missing UI consequence must be an explicit business failure with valid host preconditions. Root must reserve an immutable no-clobber outer envelope and real stdout/stderr before launch/card parse/import. Root's own capture mechanism, resource/lineage/adoption/complete-budget receipt identities are mandatory normative inputs; missing ones refuse prelaunch. wx alone is not global reservation or anti-replay.

Finite evidence relation: every expanded case has exactly one case-id, lane-id, producer and artifact-role slot. Under a root-reserved run directory, each case owns source.json, admission.json, actions.jsonl, effects.jsonl, scope-transitions.jsonl, raw-before.json, raw-after.json, runtime-errors.jsonl, stdout.log, stderr.log and result.json. Native cases additionally own process.jsonl, keys.jsonl, context.json and declared screenshot slots; disk cases own downloads-index.json plus exactly the predeclared filename/content slots; close cases own cycle0/1/2 process+durable receipts; visual/focus cases own census.json and a source-expanded ordered table of paired focused/moved-on PNGs. Every original artifact path is mapped to an immutable original reference or an explicit new lane emitter, never overwritten. G1 identities point to canonical original artifacts and judging copies; equivalent reuse has exact scope/hash/environment proof. Nonapplicable structural slots require typed justified disposition; interrupted/expected stops are MISSING, never unused. Expanded manifest rejects duplicates, collisions, unbounded names, unlisted outputs, mismatched owner/loader and missing required paths. Histories count launches separately from artifacts.

Source qualification controls must execute real paths later: actual archived Vite+React+SDK success vs partial setup/import error/wrong root/fallback cache; malformed/truncated card before inner parser; requested/resolved SHA mismatch, @repo escape, wrong lock/export/loaded-source hash; resource reuse/replay; child fail/nonzero/signal/premature long-lived exit0; genuine late stdout/stderr and retained-descriptor descendant; delayed journal/fsync/terminal write; CDP malformed/unknown-ID/idle/page error; actual close survival/late writer; disk denied/truncated/wrong owner; wrong ready loader; missing/late/truncated artifact. Generic dummy-child or in-memory JSON controls cannot qualify actual Vite/browser/process integration. Paired source and actual cause/result/cleanup artifacts are required, including unchanged positives. All qualification work here is UNRUN.

Supervisor owns archive, setup, Vite, HTTP transport, Chrome, menu helper, child/FD/writer registrations before start. One bounded deadline covers bootstrap through final writes, with pre-reserved drain/cleanup; no archive or startup outside it. Capture actual argv,cwd,env,PID/start/group, stdout/stderr streams and exits/signals. Abort fences callbacks but Promise.race is not cancellation. TERM/KILL escalation joins owned descendants only, actual server sockets, native transport, tasks, streams EOF/close and file writers; do not kill unrelated Chrome or remove unproved profiles. Final terminal index follows all joins and post-close fsync/hash reconciliation, not an earlier green JSON. Unjoined resources or in-flight writers produce QUARANTINED_UNJOINED provisional evidence; never immutable complete PASS. Root receives only after supervisor exit/outer streams close and records any allocation/finalization refusal honestly.

Bind source archive stream bytes, source/destination same-buffer hashes, lockfile df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9, actual package-name/physical-directory/exports conditions, Node, pnpm launcher+implementation,git,tar,Chrome,osascript, controlled PATH/env/cwd and cache/optimizer/temp ownership. Full loaded serving closure includes transforms,CSS,assets,dynamic imports and real browser conditions. Node require resolution or a blanket node_modules hash alone cannot prove it. Main checkout is only a read-only dependency root; no server or outputs there.

## 7. Native visual method and local holds

The complete original focus block/function/probes and canonical method identity remain protected. A qualified/adopted versioned successor may be referenced only with its exact source, calibration, review and root-adoption receipts. Shared P-FOCUS technical approval is not those receipts. Preserve native pipe/no nativeVirtualKeyCode/passive trusted-key audit, actual App/full CSS, whole-document outside-stop census, injective descriptor→node identity, real nonfocusable click anchor/center-hit, Tab/reverse/once-only actions and deferred-fatal captures. Reject tag-only or truncated-name aliases.

Preserve original fonts/finite animation stabilization, six captures120ms/two identical frames,120 double-rAF font wait, <0.01 CSS-pixel alignment, signed distance and band/interior classifier including adjacent outline-none exclusion; no relaxed tolerances or fake hue. Authentic Appearance gradient/PNG decoder/full-vs-clip/scrolled controls and target recalibration must establish actual Retina CSS↔raster coordinates. Genuine native menu200 records effective viewport; DPR emulation/resampling is not evidence. Revalidate PID/start/window/foreground/CDP target/loader ownership before/after menu, reload, resize or display change. Ambiguous external state refuses.

Shared I1 and final impact3 unadopted block acquisition-dependent rows. Clock retention3/3 and visual3/3 exhausted, M8 prior-native history unknown, REL02/03 history unknown and canonical activation closed remain LOCAL dependency holds. They do not give POMO new budgets, and they do not prohibit independent documentary source work or POMO's established timer lock. Required rows remain blocked until lawful qualified capacity exists; no substitution with rectangles, CSS outline or limited accepted preference caller. M+G+B's complete qualification→root adoption→full original before→two-CSS geometry/independent acceptance→versioned baseline/E1–E5→full Clock chain stays intact.

## 8. Permanent purposes and novelty

The full inherited106-artifact census is copied in the appendix, along with exact historical applicability and all failures. The families are departure Astra36,author2,independent18,native27,durable11,durable-independent6,preferences3,Statistics3. These are NOT106 launches. Mixed modes, repeated summaries and original buffers/build refusals must be reconciled against actual command/process parent-child lineage and permanent purposes. Missing PID/exit/probe classification/complete lifetime remains UNKNOWN. No retroactive statement that old >3-artifact families complied with cap3 is made.

Durable React/WAL/lock/lifecycle/full-close, Statistics partial-record, preference-native/disk, draft/export/dv2/completion, production-host/advanced, native per-mode, package/F1 and canonical affected suites retain actual old counts/known minima/unknown totals. Exact byte-identical4868d0a controller/protocol/hook/host,2962b49 Module/preference hook/styles andab94f84 list/counters support limited accepted reuse only; old394efad Module differs. No transitive whole-host equivalence follows. Preserve native geometry-only false comfort and later containment failure, empty unload build-refusal+diagnostic, rejected e1/990 expansions and every nonzero/unclassified record.

Genuinely new proposed semantic purpose is pre-action Reset consequence + Cancel/identity-confirm + Stop-versus-Reset/leave disclosure: compared source/tests/accepted limited preference contract lacks this exact assertion. Root may classify that narrow new source/oracle purpose after review. Running a package, native browser, existing export/fault harness or close cycle around it inherits every old unit it executes; none becomes0/3 by new filename/actor/path. Timer pending wording/raw-export click error is separately source-compared and inherits raw-export/process history. No runtime remaining allowance is minted here. Before every later invocation root binds all original formal/development/calibration/probe/refusal/unknown executions, remaining≤3, completeness evidence, exact target/runner/fixture/oracle/command/mode and source-equivalence reuse. Unknown old unit blocks that invocation, not unrelated new source design.

## 9. Full canonical and ordered gates

Appendix A quotes the entire adopted source2 byte-for-byte, retaining all15P04 rows,11 conditional paths,L1–L8,106-log census and its full canonical Clock r2 §14. The canonical section was independently extracted through the next numbered section from the complete152183-byte8bf6139 body, not stopped after E24. Hash214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. All E1–E25, complete E24 rows and Rules stay verbatim. C-FB00210/10, OE26/26 and C-RD1 15/15 judge; frozen Appearance24/26 and Features13/15 remain recorded; C-FD1 14/15 judges nothing. Full16 F1, Clockc1–c5, Header control/fixed/native18/Astra/Sol, AppRail8 modes+host, full packages/host/readers/storage, original capacity refusals and exact registered copies remain. No missing ID silently N/A; native no-rerun exclusions require their exact bounds.

Next ordered gates: fresh independent FULL impact review→root exact-hash adoption/finite source card with method prerequisites→fresh source author and independent full source review→root actual-history/resource admission→real positive/negative/causal qualification→fresh qualification review/root adoption→complete valid unresolved frozen P0 before plus applicable accepted reuse→fresh bounded product implementation on exact later card→independent same-oracle fixed AND integrated product, native,disk,visual,host,consumer,affected/full G1→actual full different-vendor verification with raw launch/refusal/cost→fresh non-author full Astra acceptance→root evidence-only reconciliation with original statuses/evidence preserved→fresh inventory, remote preservation/ancestry/sync. No product repair starts before full valid before. A fresh Codex instance is not cross-vendor. Root alone integrates/pushes/control-writes; this child only supplies a scoped commit.

## 10. Current cost, truthful limitations and static receipt

Current technical impact1/3; one concluding semantic static pass1/1. Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children all0. No original runner/module was imported/executed. No product/test/runner/method implementation, global writes, push/fetch/sync, promotion/release/D3. Provider billing/token totals unavailable, not zero. One read-only lookup guessed nonexistent verify-whole-browser-close.mjs; rg located actual verify-independent-close.mjs, which was read. Combined read displays were truncated and supplemented by bounded reads/full-byte buffers. These are retained discovery issues, not runtime probes or semantic revalidation. Any concluding semantic failure stops without retry or output write.

Both complete output buffers and all immutable inputs are prepared before any filesystem write. The final single pass validates full hashes/prefixes/canonical body/ledger/parity/scope and both buffers; result/counts appended below. Exact-path stage and command-local disabled-hook commit produce an externally supplied parent/commit/hash/clean receipt. No self-referential commit identity or product PASS is invented.

Concluding static receipt: PASS1/1, documentary integrity only. Manifest has 2979 raw records / 2979 unique immutable identities, including1 attachment and2978 Git identities; 2575 unique Git blob objects, 108571852 total bytes read across recorded identities. Raw inherited counts2954/2932/2914/2900 were checked before alias/digest deduplication; aliases require identical content hashes. All106 retained log identities resolve and hash-check. Full312 ordered original fields/39 literal reversible labels/939 references/formal13,3,3,293 preserved. P0 runtime/config/test parity has exactly the4 accepted TT08 owning-document differences. Full13213-byte canonical §14 including all E24 rows and final Rules equals the independently extracted source and copied appendix. All15 P04 rows,11 conditional paths and8 lifetime cases retained. Both complete buffers existed before writing. Zero product/runtime/qualification/vendor claims.

## Appendix A — complete immutable adopted document basis, verbatim

The text below is the exact source2 contract, including its historical author identity, proposal heading and receipts. Current documentary adoption is as stated in §1 above; no quoted historical cost is recharged as this author's run. Its complete canonical checklist, Rules and106-log census are normative retained obligations.

# POMO-04 full original-obligation preparation r2 — PROPOSED / UNADOPTED

Module **web**; workflow C under the sole root **A-Codex** controller. Fresh independent bounded contract corrector `/root/parallel_c_pomo04_correct2`, not the original proposal author or reviewer; no children. Candidate author iteration **2/3**, addressing only review R1; review1 remains retained and fresh independent review2/3 is mandatory before root adoption. Dispatch requests Astra; this is a role/configuration fact, not provider-model attestation or cross-vendor evidence. Only this contract and `inputs.sha256` are authorized additions. No implementation, runner authoring, qualification, runtime, native, browser, test, build, lint, probe, vendor, push, fetch or sync-check is authorized or performed here.

## 1. Immutable authority and complete original scope

- Sole writable worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-pomo04-correct2-20261010/XAI_Desktop`.
- Exact clean dispatch parent **53a961aaa4ae87e1453f27d91af3c8edd6ddaeeb** (P); task fixed input **d39d8a9a32bf9e66310535c8622355daefb6b280** (I); registration **cc012a5976919fb6cca8e0f19d0d6a628b033bc4**. Original proposal **59dae0b524e19e6d0c273174488b84d68fb323f3**, parent **876552e9024cbc816a811ea98cbb0888cf956317**, discovery **28ced47ca7a324caead3f67ca31a0e048ec1d98c**; independent REVISE R1 review **0f2f5c1a155f8fda127758f7986010dd57335f21**, review parent **11d1d67e67719cf331217786e60fa24ae487e12b**. Original scope-map baseline **e041c2bc293b70db367444c62c4300231976dbf7** (O); product **f9eb4b1f207bc4b46f547b90afc250424b3c8695** (P0). These are distinct immutable namespaces. Never follow moving root HEAD. All 2,900 original and 2,914 review input identities are retained unchanged in order; the current manifest adds the correction sources and registration without overwriting history.
- Original goal attachment `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md`, SHA-256 **40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615**, read first. The parallel overlay changes global serialization, not product/acceptance/cost boundaries. r2 scheduler authority is its root-adopted pointer in fixed `parallel-control-r1/execution-state.json`, not the stale UNACCEPTED heading in the immutable authored resource.
- Exact dispatch: P:`docs/reviews/20260908-full-product-audit/parallel-control-r1/task-pomo04-preparation-correct2.json`. Preparation author iteration **2/3**, concluding static validation **1**; every runtime category **0**. Original author1/static1 and review1/static1 remain consumed; this candidate does not reset any budget or certify its own adoption.
- **POMO-04**, P2 / 决策 / pending / web / 当前范围 / primary workflow C: **明确Stop、Reset及中途离开的保存规则**. Original acceptance: **每个按钮的保存/放弃含义清楚；Reset不静默丢失用户以为已保存的记录**. Sources: `02-tasks-time-boards.md;05-visual-ux-audit.md`. All original fields, including `original_module`, remain binding. Empty POMO04 evidence is not a fresh execution budget.
- All **312** original items retain id/order/priority/kind/action/acceptance/status/source/gate; **39** module labels were reversibly normalized with exact `original_module`. Original **933** evidence entries are retained; only the previously accepted six TT08 additions produce current **939**. Formal **13 completed / 3 verification_pending / 3 in_progress / 293 pending**, **299 unclosed**, unchanged. This task neither closes POMO04 nor reopens accepted POMO01/02/03, and cannot rewrite global control, ledgers or inventory.

The numbered item is broader than the accepted six-preference departure caller. Neither that acceptance, a timer package PASS, a documentary contract, a new UI test, nor an owner statement alone discharges the full original obligation. `P-1` in the original goal is **SHELL-05 pet hidden state/position**, not a Pomodoro rule choice. No repeat request for W1/C1/F2/R1 or P1 is appropriate here.

## 2. Existing rules resolve the product behavior first

Read authorities at their manifest-bound versions, applying explicit later amendments rather than obsolete base prose:

| Existing authority | Established rule and applicability |
| --- | --- |
| P0 Pomodoro `docs/api.md` durable addendum; `web-pomodoro-durable-session/{20260909-diagnosis,20260909-fix,dev_log}.md`; independent `web-pomodoro-independent/20260909-independent-review.md` at accepted 4868d0a682e27a7789fe58168ee6f7006e5946bb | Account-private durable active session; absolute wall-clock deadline; pause excludes away time; Stop/End saves measured incomplete record; pending→history→clear; stable id; first recordedAt; no fabricated atomic transaction or guaranteed closed-browser sound. Stale intent rejected, winner refreshed, fresh action works. |
| P0 `docs/api.md` POMO03 amendment and `web-statistics-time-independent/20260909-independent-review.md` | Early-ended focus records are visible and labelled incomplete; duration includes measured partial focus, completed round/streak counts do not. Old design completed-only list/duration text is superseded. |
| `web-pomodoro-departure-contract/contract.md` and full `web-pomodoro-departure-astra/acceptance-2962b49.md` | Six device preferences retain latest draft/uncertainty/conflict/epoch rules; current preference-only guards and complete six-value disk export. Running timer alone is clean for this preference guard; preference recovery cannot settle/reset/export account timer/history. |
| `web-pomodoro-prefs-independent/20260909-independent.md`, original Dv2/ completion tests | Six actual controls, physical failure/retry, source handling and actual disk supplement. Blob-only original was explicitly limited, then disk supplemented. These are not timer raw-export acceptance. |
| P0 package design/API and original audit §Pomodoro | Existing Reset discards unexpired current activity, not previous history. Audit specifically requires explaining End/Reset saving and preserving apparently saved records; it does not ask to change Reset into a new Save operation, create undo history, auto-start rounds or pause all route departures. |
| P0 host/provider/departure coordinator; accepted F1 and full Clock r2 G1 | One host timer and one reusable departure arbitration mechanism; first intent, scope cancellation, release once, affected consumer/regression rules remain. |

**Proposed resolution: no genuine new product-owner choice is presently needed.** Preserve these established semantics and make them explicit before destructive action. Add accessible EN/ZH action explanations; present an explicit current-session discard confirmation with Cancel, so Reset cannot silently discard the active progress a user mistakes for saved history. Confirmation is the proposed implementation of the original non-silent requirement, not permission to change settlement semantics. Independent contract review must challenge this resolution and the exact finite scope before adoption. Only a newly located contradictory explicit rule justifies a minimal centralized owner question, with both immutable citations; no generic “should Stop save?” or “should leaving pause?” question.

## 3. Actual source owner, writers and transaction cut points

At P0, `sessionController.ts` owns mutations; module/observer code cannot become a second writer. `ACTIVE_KEY=xai_pomodoro_active`, `HISTORY_KEY=xai_pomodoro_sessions` use captured accountScope physical keys. Lock name contains account kind/id/business generation/pomodoro. `owner/assertScope` check scope, generation marker and deletion tombstone, then reread active under the lock. This is distinct from auth IndexedDB generation.

`command(action, options, expectedId, expectedRevision)` captures scope and **issuedAt** before awaiting Web Locks. In-flight or unresolved retry returns false. After grant, for non-start/non-reconcile the current id must match; revision must match except when that same current id is settlement-pending. Before that mismatch gate, absent active plus expectedId already present in history is the existing successful no-op, with no new record or deletion. A replacement active id does not take that absent-active no-op. Stale/competing commands clear obsolete retry/frozen intent and refresh winner rather than poisoning future controls. Every durable write rechecks scope. No Web Locks means explicit unavailable/read-only, not localStorage compare-and-swap fallback.

| Cut / real action | Durable bytes and visible truth to preserve |
| --- | --- |
| Start | Write active version1 with stable id, mode, duration, original start, running segment/deadline; publish only after write. Failure must not look running/saved. |
| Pause / Continue | Write revision+1 with accumulated elapsed / new deadline; failed pause remains durable running, failed resume durable paused. Pause itself creates no history. |
| Stop / manual early End | `handleStop`→`useTimerTick.end`→`command(end)`; original issuedAt freezes `completed=false`, elapsed excluding pauses, finishedAt. The hook's immediate numeric elapsed return is not commit proof; caller currently ignores it. Running-at-deadline End is completed; predeadline queued End remains early even if grant is late. |
| C1: pending write fails | Prior durable running/paused remains; no history/event/saved claim. `pendingDraft` holds frozen End only in current controller memory for Retry/export. Full process loss can lose this unsaved intention; old durable activity survives. Do not promise crash recovery for an unpersisted intent. |
| C2: pending exists, history append fails | Persistent settlement-pending preserves original settlement; no success/advance. Retry/reload/reopen reconciles same id. |
| C3: history succeeds, active removal fails | History is saved; `lastCommitted` and best-effort event may already exist. Explicit cleanup error; Retry only cleans up, never duplicates or revises first recordedAt. Do not falsely call the saved history unsaved, and do not report complete cleanup. |
| C4: history exists, repeat settlement | Matching existing id/finishedAt/elapsed/mode/completed is reused; conflicting same id refuses and preserves bytes. Event is not the ledger; crash between commit and event can miss notification. |
| Reset before deadline / paused | `handleReset` clears completion notice, calls hook reset→`command(discard)`→remove active; no history append, no completion event, existing history unchanged. Idle mode updated only on command success. Current UI has bare Reset and no consequence explanation/confirmation. |
| Reset with expiry/pending | Controller handles settlement-pending or running expired at lock-grant time **before** discard branch. An already-due record is settled, never deleted as an unrecorded current timer. Reset issued before deadline but granted after it follows this current precedence (different from End's issuedAt rule). Proposed disclosure must say completed/saved history is retained; no new precedence is invented. |
| Normal completion / break | Controller's 100ms reconciliation and retained app host settle at original deadline; route callback on new committed completed record selects next preset, sound best-effort, idle next mode; no automatic Start. Early End does not advance cycle. Break rows persist but are excluded from focus counts/list; completed focus cycle remains nextMode. |

`useTimerTick` retains controller and subscribes via useSyncExternalStore; visibility is bound to its captured account scope. A settlement-pending active maps to the hook's paused shape with zero remaining, so current stateLabel says Paused while error/pending may mean “finished, saving/recovering”. Source-grounded wording gap, not a runtime-tested defect in this pass. Scope gating and first render must remain correct. `reset(...).then(setIdle)` needs a post-await UI fence for old scope, disposed hook or superseded decision/session; that fence cannot cancel an already-issued account-owned command or reinterpret durable success as cancellation. The decision capture, dispatch and notification boundaries are defined in §4.1. Refs prevent duplicate new-record callbacks but are not a substitute for durable idempotency.

`retainPomodoroController` keeps one interval/listeners while observers exist; the public lightweight `session-host` is mounted inside AccountDataGate in `AccountStorageGate.tsx`, above route UI. Last observer removal stops interval/listeners while preserving durable bytes; it does not cancel an already-issued command waiting for its account lock. Same-account route/dialog/hook teardown is distinct from account scope/generation/tombstone invalidation. pageshow/visibility/storage refresh authoritative active. `elapsedAt` clamps 0..duration and excludes pause; wall-clock forward/back shifts do not create negative elapsed, but cross-clock-edit precision is not promised. Background throttling changes observation time, never the original due instant. Full process close stops JS/audio; running deadline is reconciled on reopen, paused activity retains accumulated time.

## 4. Complete action/lifetime contract proposed for adoption

Every row applies to normal and focus-fullscreen surfaces wherever that action exists, both languages, focus/short-break/long-break, configured/custom duration, and idle/running/paused/pending/error/conflict as applicable.

| Action or boundary | Required user meaning and oracle |
| --- | --- |
| Start, Pause, Continue | Start creates durable activity; Pause keeps progress without saving a completed round; Continue resumes same id and remaining duration. Explain that activity is recoverable separately from a history record. Disabled/error states do not imply successful command. |
| Stop, including focus fullscreen | Before activation, accessible/visible meaning states stop and save elapsed time. Early stop creates one incomplete record, including zero measured elapsed where valid; completion count does not increase. After durable commit say saved; on C1/C2 show recovery; on C3 say history saved but cleanup pending. Manual “Add manually” is an existing no-op, not a second completion path authorized by POMO04. |
| Reset idle | Restore configured idle timer without touching history/preferences or fabricating a saved record. No destructive confirmation needed when no activity exists. |
| Reset active | Explicit pre-action explanation and confirm/cancel: discard **current unfinished progress only**, does not save an early-End record; offer existing Stop/save alternative. Capture the one-shot decision and its scope/id/revision/focus target at opening (§4.1). Cancel/Escape or disposal before dispatch issues no command and has zero intent-attributable writes/deletes/history/events; restore valid initiating focus. Opening never pauses time. Confirm never recaptures a replacement and obeys the same-id pending revision exception, absent-active recorded-id no-op and existing pending/expiry precedence. Unexpired running/paused discard preserves saved history byte-for-byte; natural or required settlement is compared against a time-equivalent control. Failure preserves existing WAL/recovery truth and Retry. After dispatch, same-account UI teardown fences UI only. No new undo schema. |
| Exit fullscreen | Leaves presentation only, same running/paused activity and history; Escape and visible Exit equivalent, no hidden Stop/Reset. Keyboard Space acts only where accepted, ignores interactive targets/repeat; Enter/Space on controls executes once. |
| Clean route away / remount | Timer continues via existing host and returns/reconciles same id. No preference draft means no preference warning. Copy distinguishes leaving view from Stop/save and Reset/discard. Router first-intent/back/forward behavior remains host-owned. |
| Preference-draft departure | Existing Stay/Escape retains six drafts, timer and first intent; Export stays and retains guard; discard-and-leave discards only current preference drafts, replays captured route once, never clears activity/history. All latest successful saves release once; one sibling success cannot release another failure. |
| Reload/tab/browser close | Durable running state continues by deadline; paused does not count away time. Preference draft warning is browser-controlled, not a promise to preserve memory through crash/forced auth. C1 unsaved End intention is explicitly distinguished from prior saved active. Export/Retry before leaving is available when possible; no storage write during unload. |
| Account A→B→locked→A, sign-out | A durable timer remains in A namespace; B/locked sees none and no transient A frame. An undispatched Reset decision is revoked by its scope/epoch, generation/tombstone invalidation or UI disposal. An already-issued account command, including Retry, uses existing captured-scope checks at grant/every write: account-invalid queued work is denied; same-account route/dialog teardown alone is not cancellation (§4.1). Export permissions and late UI callbacks have their own lifetime fences. A return creates fresh authority and reconciles its own deadline; old denied intent cannot mutate A/B, while authorized natural reconciliation is permitted and separately attributed. Device preferences survive mounted owner change, old departure capability revoked, fresh decision permitted. Host sign-out preflights rail→Appearance→shared coordinator remain ordered; Cancel in earlier prompt touches no Pomodoro draft. |
| Two tabs / late queued work | Real same-origin tabs contend native Web Lock, not two hooks pretending to be independent documents. Double End/expiry writes one row; Start conflict and stale Reset/Stop/pause reject harmlessly; fresh operation remains usable. Late Retry never overwrites winner or a new session. No actor/lock shortcut. |
| Malformed/read-denied source | Distinguish valid empty history/absent active from unavailable/invalid/foreign-generation source; preserve raw bytes and never claim no saved records merely because legacy `usePref` fallback rendered empty. Module currently filters invalid history for display; it cannot prove source was empty. Any needed caller-owned availability receipt must use existing scope/codec guards; if shared storage contract changes are required, freeze as dependency, do not silently enlarge scope or accept false empty. |

The original full item remains blocked if any user-facing saved/discarded meaning or non-loss invariant cannot be satisfied; calling such a gap “REL-only” cannot waive POMO04. Conversely, cloud sync, import, new recovery journal, changed away-time policy, global timer bar/POMO05, dashboard scale/DASH06, audio delivery, schema migration and browser eviction handling are not implicitly implemented here.

### 4.1 R1 correction: decision, issued command and UI notification are distinct

Immutable source basis: `f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-pomodoro/src/internal/sessionController.ts:123–129` removes last-observer listeners only; `:134–178` captures account scope/issuedAt and applies lock-grant identity and settlement rules; `:180–215` preserves discard, failure attribution and Retry. `f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-pomodoro/src/internal/useTimerTick.ts:86–93` exposes the Reset Promise/UI continuation boundary. These source bytes match accepted durable revision `4868d0a682e27a7789fe58168ee6f7006e5946bb`; accepted API/durable reports in §2 establish the existing product semantics. Review `0f2f5c1a155f8fda127758f7986010dd57335f21:docs/reviews/audit-parallel-pomo04-contract-review-r1/review.md` §3 requests this clarification, not a new cancellation policy.

**Capture and dispatch.** Opening the active Reset dialog captures the current ready account scope object/epoch, kind/id/business generation, session id and revision, initiating focus element, and a unique one-shot decision identity tied to that dialog/hook lifetime. It snapshots the intended reset presentation options; subsequent confirm never obtains a replacement session by reading a fresh default expectedId/revision. Opening is read-only and never pauses. Cancel/Escape consumes/revokes the undispatched decision; closing, route unmount, hook disposal, replacing the decision, or account authority invalidation before dispatch also makes it inert. Cancel/Escape restores the initiating element when it still belongs to the live view; a detached/foreign target cannot steal focus from a replacement view. Applicable live-view fallback must be a meaningful existing control, not body, and needs native proof. Disposal without a surviving view cannot promise focus in the removed view.

Confirm may consume this decision only once. Immediately before calling the controller, require the captured decision still live, one-shot unused, account scope/epoch still current and generation/tombstone valid. For captured session identity, retain the existing controller predicate: same id plus matching revision for ordinary running/paused; same id now settlement-pending permits its existing revision exception; absent active with that old id already recorded permits the existing harmless no-op. A replacement active id or an ordinary same-id revision change rejects without recapture. Unknown/unreadable state is not an invented absent/recorded case. Passing these UI checks is not durable success: dispatch invokes the existing account-owned command with that captured id/revision, and its authoritative lock-grant/write guards still decide. Mark the confirmation consumed before dispatch so double activation cannot issue a second intent; a refused/in-flight dispatch is not success. Existing storage failure Retry remains the original controller intention, not a replayable confirmation capability.

**After dispatch.** Once the controller has been invoked with a valid captured intent, route/dialog/hook removal alone does not revoke it. Same-account already-issued End/Reset/pause/Continue/Retry may finish under the existing account lock even with the initiating UI gone. End retains its original issuedAt through lock delay and frozen Retry; Reset uses existing grant-time expiry/pending precedence. Scope/epoch loss, account change/lock, business-generation change or deletion tombstone remains a separate authority failure checked by the existing controller before writes. Returning to A does not revive a capability from A's old epoch; fresh A reconciliation is separately authorized. No dialog token or cancellation predicate is introduced under the lock. The last-observer cleanup does not roll back a command either; ordinary route departure keeps the account host retained as already contracted.

**Resolution and UI notification.** Durable acknowledgement and permission to mutate the initiating UI are separate facts. After await, require a live originating hook and current captured account, the same unsuperseded decision/operation, and no replacement session or newer presentation intent before applying local idle selection, notices or focus. Do not require the discarded id still be active to acknowledge its successful removal; do not confuse legitimate pending revision changes with a replacement. A stale continuation is UI-inert even when the durable command succeeded. It cannot apply A's old idle mode to B, erase a newer decision, focus a detached control or announce a replacement session as discarded. A fresh live observer may reflect the authoritative durable result. If the command settled expiry/pending or returned an already-recorded no-op, feedback cannot claim it discarded unfinished progress. Existing boolean acknowledgement is not proof of which branch ran; any necessary reviewed identity/result exposure stays inside §6. Successful history/cleanup is never retroactively reported as cancelled or rolled back; C1/C2/C3 retain their distinct truth.

The following finite cases refine both P04-03 and P04-09, without adding another top-level P04 row. Each uses the same captured fixture, raw account active/history bytes, attributed command/write/delete/event counts, durable outcome and UI/focus observations. Compare a **time-equivalent no-old-intent control** with the same elapsed time, initial bytes, lock release, host retention and independently authorized competing actions. This excludes ordinary tick/reconciliation writes from the denied-intent zero-write assertion, while still detecting any unauthorized deletion or duplicate record.

| Case | Required boundary and finite expected outcome |
| --- | --- |
| L1 — cancelled/invalidated before dispatch | Cancel, Escape, unactivated closure, decision replacement, route/hook disposal or account invalidation while confirmation remains undispatched: the old capability issues zero commands and produces zero attributed writes/deletes/events. Repeated activation is inert; live Cancel/Escape returns valid initiating focus. Natural completion can still settle exactly as in the time-equivalent control. |
| L2 — same-account queued command, UI teardown | With a real held account lock, issue End, confirmed Reset, or existing Retry before same-account route/dialog/hook disposal, then grant. UI teardown itself adds no cancellation: existing controller identity/time/WAL rules determine outcome. Predeadline End remains incomplete at issuedAt; valid unexpired/paused Reset removes only its captured activity; retry preserves the exact original settlement/cleanup. Pending/expiry follows L5; stale identity follows L4. No stale UI continuation. |
| L3 — account-invalid queued command | After valid dispatch but before real lock grant, change A→B/locked, epoch, business generation or tombstone. Existing captured authority rejects writes by that old command; no old-intent mutation of either namespace, no A flash or download under B. Returning A permits separately authorized fresh reconciliation; do not require blanket permanent A-byte equality. |
| L4 — replacement id or ordinary revision | Before dispatch or during the lock wait, a competing permitted command replaces the id or changes the same running/paused id revision. The old decision/command is rejected rather than rebased; winner bytes are preserved and fresh controls remain live. Same-id settlement-pending revision is explicitly L5, not a strict revision rejection. Repeat confirm never captures the replacement. |
| L5 — same-id pending or expiry | Same captured id becomes settlement-pending: allow the existing revision exception and settle its frozen record before discard. Otherwise same-id running at deadline by Reset grant settles at original deadline before discard; End still uses issuedAt and its existing frozen Retry. Original id, elapsed, completed, first recordedAt and WAL pending→history→clear remain; no fake discard success, no duplicate. A different pending id still fails L4. |
| L6 — settled old id | With no active and captured old id already in history, existing successful no-op leaves history byte-identical, appends no row and deletes nothing. This is not a new discard or new completion; late UI feedback is fenced. If a new active id exists, L4 applies instead. Conflicting settlement content remains the existing refusal in C4. |
| L7 — post-await stale UI | Resolve a valid command, then replace decision/session/presentation or invalidate/dispose its hook/account before continuation. Its durable result stands; the old callback performs zero local idle/notice/focus mutation on the replacement/new account, and cannot relabel a saved record cancelled. Fresh observer can display the actual commit/error/cleanup truth. |
| L8 — fresh liveness | Following each rejection/disposal/account return above, a fresh live decision/action in the current scope operates normally under the accepted lock/WAL rules. B can act only on B; returned A reconciles its own timer and can issue a fresh action. No old retry/frozen settlement poisons a winner, no duplicate or lost prior history, and no blanket suppression of normal reconciliation. |

R1 requirements 1–3 map to capture/dispatch, after-dispatch, and UI-notification paragraphs respectively; requirement4 maps to §3/C1–C4 and L4–L6; requirement5 maps to L1–L8 and the attribution/control paragraph; requirement6 maps to revised §4 rows, §6 and P04-03/09. This correction selects existing accepted controller rules. No contradictory explicit product authority was found and no owner question is opened. If implementation proves a new under-lock cancellation/settlement mechanism is needed, stop that unit for a separately frozen defect/impact/corrective card and fresh review; the current contract and eleven-path ceiling grant no such mechanism.

## 5. Two different exports and uncertainty

**Preferences:** preserve `pomodoro-preferences.json`, version1, kind `pomodoro-preference-draft`, exact six-value `values` names preset/customMinutes/displayStyle/theme/sound/muted; full current snapshot, memory usable under get/set denial, no timer/account ids. Accepted `usePreferenceDepartureRecovery` latest operation id, settledFailure gating, same-value successor, per-field discard/source reload and original uncertain token semantics remain. Discard/reload does not cancel an already-issued engine write; settle and attribute the real result without reclassifying it as new saved user intent. Recovery exports are not save success and do not clear guards.

**Timer:** `exportPomodoroRecovery(capturedScope)` currently returns `{version:1, owner, uncommittedSettlement, active, history}`, raw account-private strings plus frozen memory End; filename `pomodoro-recovery.json`. It is recovery material, not the device-preference format, an importer or cloud backup. The UI currently catches Blob/URL/click exceptions silently and only checks scope inside the serialization helper; source shows no second live owner check at the actual click. Proposal requires truthful independent export error and before-click scope/lifetime revalidation, best-effort cleanup, unchanged original save failure/bytes. Native disk success must inspect actual saved file; Blob inspection alone is insufficient. Under full read denial raw stored bytes cannot be honestly exported—report unavailable and retain the in-memory material without inventing an empty backup. No broader format change or memory-only raw account backup is preapproved. URL setup synchronously changing owner must cancel click; stale A bytes must never be downloaded under B permission. Browser/OS failure after click lacks application acknowledgement; preserve this stated limitation and distinguish it from caught setup/click failures.

## 6. Exact finite conditional product allowlist

**Current write grant: only the two preparation additions. Product grant is empty until independent review, registered before/source gates and root adoption.** A later implementation card may activate only the necessary subset below, citing the failing row and exact patch; no wildcard authoring authority.

| Exact path | Conditional reason / narrow limit |
| --- | --- |
| `packages/plugin-web-pomodoro/src/PomodoroModule.tsx` | Button/action/state/leave explanations, local Reset confirm/cancel and timer export feedback/click scope protection; no history writer, preference semantics rewrite or new manual-record feature. |
| `packages/plugin-web-pomodoro/src/internal/useTimerTick.ts` | Only captured explicit undispatched Reset decision identity and separate post-await UI lifetime/result exposure required by P04-03/09 and §4.1; preserve already-issued account-owned commands, timing and accepted callbacks. No general timer refactor or implicit End/pause/Retry dialog lifetime. |
| `packages/plugin-web-pomodoro/src/internal/sessionController.ts` | Only reviewed caller-owned source status or existing command identity/result exposure necessary for P04-03/05/09; lock/WAL/owner/expiry/Stop issuedAt/order/schema frozen. No new under-lock UI disposal/cancellation predicate or retroactive durable rollback. Same-id settlement-pending revision exception and absent-active already-recorded-id no-op remain exact. A changed command-lifetime/settlement algorithm requires a separate frozen defect and reviewed corrective card, not this row. |
| `packages/plugin-web-pomodoro/src/styles.css` | Append only `.module-pomo` / `.pomo-`-scoped rules for new explanation/confirmation/error controls; no tokens, shared selector changes or broad redesign. Actual host containment/focus proof required. |
| `packages/plugin-web-pomodoro/src/__tests__/PomodoroModule.test.tsx` | Focused full action semantic assertions preserving all prior ones. |
| `packages/plugin-web-pomodoro/src/__tests__/useTimerTick.test.tsx` | Only observer/Reset identity/lifetime assertions if hook changes. |
| `packages/plugin-web-pomodoro/src/__tests__/durableSession.test.ts` | Only relevant guarded command/byte conservation/commit-cut regressions if controller changes; original failure oracles unchanged. |
| `packages/plugin-web-pomodoro/docs/api.md` | Exact action/save/discard/recovery amendment, not rewrite prior evidence. |
| `packages/plugin-web-pomodoro/docs/design.md` | Explicit superseding action contract; preserve historical assumptions as history. |
| `packages/plugin-web-pomodoro/docs/test.md` | Full original acceptance-to-evidence mapping. |
| `packages/plugin-web-pomodoro/docs/dev_log.md` | Later authorized phase receipt with actual commands/limits; no historical status rewrite. |

Eleven finite paths, conditional, not eleven mandatory edits. A helper/new test/fixture/runner/evidence file not named above needs its own exact source-author card before creation. Tests and runtime stay forbidden in this preparer. No optional path silently authorizes capability additions that alter public types.

Protected: active/history logical/physical keys, schemas/validators/migration/lifecycle/export/delete registry; six preference key names/codecs/domains/defaults; sessionProtocol, accountMigration, shared `plugin-web-storage`, tokens, auth/device store, events, account Gate, App, all registration/coordinator/router/delegate files, shell/AppRail/Topbar, all other product packages and dashboard projection; lockfile/config/dependencies; original contracts, runners, before/failed logs, screenshots, hashes; global control/ledgers/inventory and other worktrees. No module activation, main/web/dev promotion, deployment, release or D3. Any protected delta or real shared defect freezes that unit and requires independent diagnosis/impact; no direct parent repair.

## 7. Independent full business oracles (before and same frozen fixed)

Each P04 row needs explicit expected values derived independently from rule/fixture, actual raw durable bytes, action/attempt/event counts and visible semantics. A source walk is not a runtime PASS. Retain valid historical evidence with the exact source/dependency applicability table, and schedule only unresolved/new or affected proof. Source qualification must precede reliance on new machinery; original failures are never rewritten.

| ID | Complete independent business oracle |
| --- | --- |
| P04-01 | EN/ZH initial and active action meanings clearly distinguish Stop/save, Reset/discard, Pause/Continue, Exit view and preference discard; normal/fullscreen/keyboard agree. State chip distinguishes running/paused/settlement-pending/unavailable/cleanup saved. Idle reset preserves all bytes. Bare labels alone cannot PASS. |
| P04-02 | 25-minute focus: run25s, pause5min, resume35s, Stop→one incomplete 60,000ms row; round count unchanged, list1:00/incomplete, Pomodoro and Statistics actual focus duration1m; configured time is not elapsed. Zero elapsed control and paused Stop; all existing rows preserved. |
| P04-03 | Reset unexpired running/paused: pre-action consequence plus Stop/save alternative; captured account scope/epoch/id/revision/focus/one-shot decision. Cancel/Escape/no activation has zero intent-attributed command/write/delete/event and live focus return; no implicit pause/save. Valid confirm removes only identified unfinished activity with prior history byte-identical. Require every L1–L8 case in §4.1, including same-account queued UI teardown, account-invalid grant, ordinary replacement/revision refusal, pending revision exception, expiry settlement, recorded-old-id no-op and post-await UI fence. Repeat activation cannot retarget; attribute natural reconciliation against the time-equivalent control. |
| P04-04 | Automatic focus/short/long-break expiry at exact deadline; late recovery retains finishedAt, elapsed, first recordedAt; one history id, completed=true; next-mode rules only after commit/no automatic start. Break persistence not misrepresented as focus count/list. Stop predeadline queued beyond deadline remains incomplete at issuedAt. |
| P04-05 | Fail start/pause/resume/discard and C1 pending/C2 history/C3 active-clear separately; no false success or lost previously saved record. Restore storage→Retry exact prior intent; after deadline early End remains early; conflicting same-id rejects. Source corruption/read denial/missing locks/foreign generation preserve bytes and truth. Distinguish unknown source from zero records. |
| P04-06 | Actual host route away/back/remount, reload, two complete browser-process reopen cycles, running and paused; independent expected time/id/history; host stays while route removed; closed JS/sound explicitly unavailable. C1 unsaved intent limits vs C2/C3 durable recovery disclosed, no crash-durability claim for device drafts. |
| P04-07 | All six real preference producers failure/pending/conflict/unchanged-uncertainty/changed-uncertainty, same-value predecessor/new intent and completion-next-preset; latest-only success, pending Retry inert, saved siblings untouched; timer/history invariant except intentional normal deadline progression. |
| P04-08 | Production App route/AppRail click/Back/Forward/programmatic/same-turn first-intent and sign-out-first/route-first; actual rail then Appearance preflights, clean zero confirms, Stay/Escape, Export stays, preference-only discard leaves once, all-success releases once, old permission/disposal cleanup. Zero non-live blocker calls and no Invalid blocker state transition. |
| P04-09 | A→B→locked→A, generation/tombstone, first-frame isolation and retained device draft; every finite L1–L8 boundary in §4.1. Real-lock queued End/Reset/pause/Retry obey captured account authority; same-account UI disposal alone never cancels an issued durable command. Account-invalid old intent has zero attributed A/B writes, while separately authorized A return/expiry reconciliation matches a time-equivalent control. Undispatched confirmation, stale UI result and export permissions are independently fenced; B never sees A records; fresh A/B actions remain live. No blanket A-byte freeze or retroactive saved-record rollback. |
| P04-10 | Two actual tabs same origin: double End vs auto expiry, duplicate Start, stale revision and fresh Resume, stale frozen End retry loses to winner; one row/id, stable first recordedAt; no second writer surrogate. Separate browser process reopen is independently evidenced, not confused with two targets. |
| P04-11 | Actual disk both filenames/schema and owner separation; pending/history/clear raw recovery content, six-value memory preference export under full storage denial, no writes/navigation/guard release; Blob/URL/append/click failure cleanup and separate error; synchronous owner change before click zero download; denied raw source is not empty success. |
| P04-12 | Owner mutation → actual FocusRecordList/PomodoroOverview/Statistics/StatPomos/CmdK read consistency and preserved legacy unknowns/local finishedAt attribution, zero reader writes; valid empty vs unreadable source separate. DASH06 owns true count/dots scale and any fix: this task has only non-regression projection proof, no duplicate owner/algorithm or goal design. |
| P04-13 | Real App/full CSS EN/ZH375/414/768/1024/1440, all changed timer states, normal/fullscreen/confirmation/recovery; new controls44×44, containment/no overflow/overlap/hit occlusion, pet-hidden at wide then resize with assertion; pet-on new controls, both Topbar statuses and global overlays. Zoom200% and keyboard exposure/wrapping recorded. Visually inspect actual screenshots. |
| P04-14 | Trusted native Tab/ShiftTab/Enter/Space once/Escape and focus restore (never body), all new control states and themes; passive key audit/no nativeVirtualKeyCode/pipe, active target isTrusted proof; qualified identity-checked per-stop pixelFocusWalk. Inherited blocked method cannot be replaced by outline CSS or rectangles. |
| P04-15 | Full immutable source/dependency/cost qualification; unchanged protected-path proof; complete original timer/package/device/departure/host/consumer and canonical r2 G1 coverage with all judging copies; reuse rationale row-by-row, zero missing gate. Full actual cross-vendor verification and a fresh non-author Astra acceptance of every P04 row; not a renamed Codex instance. |

## 8. Evidence chain, source qualification and gates

| Gate | Required receipt / stop |
| --- | --- |
| G0 contract review | Fresh non-author independently reviews full original acceptance, existing-rule/no-question conclusion, allowlist, before oracles, all histories/dependencies. Proposal has no self-adoption. Any genuine question goes to sole root only after review. |
| G1 source-only machinery | Separately registered finite evidence paths and frozen driver/fixtures/expected oracle table/full case enumeration; code-read review first. Product failure already suspected is reproduced/frozen before correction. No build as disguised source check in this task. |
| G2 qualification/admission | Permanent unit ledger and exact remaining capacity; streamed immutable archive; requested/resolved full SHA, lockfile df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9, @repo exports including physical-directory/package-name mapping; dependencies readonly, no main checkout server. Positive/negative/causal controls prove missing/late/truncated artifacts and wrong source fail closed. Source-only APPROVED is not qualified. |
| G3 complete before | Registered unresolved P04 assertions on P0 with correct failure/control outcomes, raw source/byte/event observations and screenshots. Freeze before author implementation; reuse inherited valid acceptance only through exact applicability. No expected-bad assertion inverted to manufacture green. |
| G4 bounded implementation | Fresh author exact adopted subset plus separately registered run logs, fixed commit/diff and hashes; original failures untouched; no self-acceptance. Stop on unregistered real product defect/protected need. |
| G5 independent fixed/affected | Fresh verifier same frozen oracles + full host/account/native/disk/visual/consumer/canonical G1 dependencies; exact integrated product if other accepted changes land, never assume moving root equivalent. Unit-test green does not close missing business proof. |
| G6 actual vendor | Register actual tool/vendor, fixed entire adopted contract/diff/source/before/fixed/dependency scope, finite time/cost and inherited budget first. Preserve actual launch/refusal/raw response/tool calls/failure/cost, full coverage not smoke. Missing vendor capacity or history blocks only this gate; fresh Codex is not cross-vendor. |
| G7 fresh Astra acceptance | Different from contract/source/product/verifier authors; reconcile P04-01..15 and every canonical dependency, hashes/actual reached assertions/failures/unrun limits. Full original obligation accepted only when all required proofs apply; not a limited preference caller renamed complete. |
| G8 root reconciliation | Sole root under adopted exclusive controller resource validates parent/scope/clean/source/output hashes, remotely preserves source, receives only reviewed commit, appends accepted evidence without changing any formal status or original933+TT08 evidence. |
| G9 inventory/handoff | Fresh inventory only after acceptance and reconciliation, actual AST/writer scope unchanged unless proved; preserve original inventory. Root pushes, checks remote ancestry and normal sync receipt; deep residuals retained, no cleanup for green. No deployment/release/formal312 closure implied. |

Every new evidence invocation reserves exclusive immutable output names and process launch identity **before** work, preserves both raw stdout/stderr and original nonzero exit/signal. Bounded archive/build/browser/CDP waits and process/pipe/journal-close barriers; capture actual owned children, partial startup and cleanup independently. No terminal PASS before quiescent child exit, stream drainage and post-close durable receipt; deadline fences late callbacks without pretending Promise.race cancelled them. Preserve failure/refusal/probe journals, raw screenshots and hashes even on cleanup fault. Never terminate unrelated Chrome or remove unproven descendant profiles. New copies require exact source patch, fixtures byte-identical when only capacity/root depth changes; no weakening assertion, tolerance, CSS/DOM injection or filtering matrix for green.

## 9. Full canonical Clock r2 G1 dependency, not r1 shorthand

Canonical **8bf613962517ee9b80bf51373e8ad88960c570cc**, `web-dashboard-clock-recovery-contract/contract.md` SHA-256 **214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae**. Appendix A reproduces the complete §14 Required evidence and rules unchanged. It binds E1–E25, AppRail additions, Header control/fixed/native18/Astra/Sol, F1 twelve originals plus Appearance K-1 two plus rail two, new Clock c1–c5, full package/static/host suites and receipts; the earlier r1 subset cannot substitute.

This is a dependency mapping: POMO04 does not implement Clock, manufacture Clock E1–E25 or treat its known P0 recovery failures as new Pomodoro regressions. Root binds each canonical item to valid exact historical evidence/reuse, the shared Clock node still pending, or the separate affected POMO04 fixed invocation. No absent ID silently N/A; full acceptance remains conditional on unresolved required dependency. Common POMO04 changed-product regressions are enumerated through this complete list; finite lawful budget determines launch, not desire to recollect known evidence.

Judging outcomes: More frozen boundaries recorded as observed + **C-FB00210/10** judging; Appearance frozen continuity-export24/26 cases006/007 + **OE26/26** judging; Features downstream frozen13/15 and **C-FD1 14/15 recorded only**, **C-RD1 15/15 judging**. AppRail eight modes26/31/21/18/24/22/33/123 and host31, rail selfcheck165/rail104. No dropping original failures. Appearance F1 K-1 selfcheck135/appearance123, full sixteen F1 invocations plus Clock before/fixed c1–c5 remain separately attributed. Header100MiB refusal/capacity copy and F1conditional200MiB copies require frozen refusal/diff, not silent patch. Reuse no-rerun exclusions only when their exact source/host/CSS bounds hold; new POMO04 surface changes require its own visuals.

Method status from fixed correction impact: Clock retention validation **3/3 exhausted**, candidate REVISE/UNQUALIFIED R1–R6; no fourth automatic attempt. Original Q1 focus1/3, others0/3; development2/83; B70 native12/6432, development40/4884, visual3/3 exhausted, focus EN2/ZH2; F1formal2/180, development3/302 retained. These are their historical families, not POMO budgets and not a license to change measurement by renaming it. Pixel/geometry-dependent POMO rows wait for independently qualified/adopted usable method or a separately reviewed lawful method path under existing authority; static source preparation can proceed. M+G+B remains conditional: full qualification/Q2→root adoption→valid original P0before→two-CSS geometry/G2/G3→versioned baseline→E1–E5→Clock fixed/full final acceptance. No POMO preparation changes it.

## 10. Permanent history census, reuse and novelty

Appendix B is a source-bound retained-artifact census, not a count of assertions or a proof that every process launch was retained. Original runner commands/modes and reports determine correspondence; one multi-mode wrapper can invoke several child units, duplicate reports are not extra launches, empty build-refusal logs still consume formal admission where applicable. Formal/probe classification is **unknown** where the source does not establish it. Absence of PID/exit cannot become code0 or count0. No actor, filename, suffix, transport, new worktree or new suite resets old balances.

| Permanent purpose | Retained actual history and present admission |
| --- | --- |
| Durable original React diagnosis | `20260909-before.log`7FAIL/1control, reproduction-after8PASS; package-after140, original independent stale correction143 later. These are different invocations, not an aggregate score. Original diagnosis native collects expectationFailures3 but intentionally exits0: not business PASS. Lifetime total beyond retained corpus unknown. |
| Durable browser lifecycle/WAL/process-close | Original native-before; recovery/lifecycle/crash/close-after separately; main independent ce4b767conflict and4868d0aafter; separate running close and paused close baseline/after. Main old failures include stale-Pause and duplicate-Start liveness. Real closed-browser variants reuse profile across actual process exit twice. Existing purpose, known≥2 main independent and≥2 per close variant; complete permanent counts unknown, launch blocked pending root census/cap proof. |
| POMO03 partial record/Statistics | Actual `web-statistics-time-independent` before/after and originalSTAT01three logs; incomplete visibility failure retained, after fix correct. Reuse for untouched consumer semantics, not Reset UX or unreadable-empty truth. Unknown lifetime including package/shared runs. |
| Device preference native and disk | 45a2a06beforeFAIL;394efadafterPASS; separate real download supplement after URL failure. Original Blob-only limitation retained. Known≥2 preference native and≥1 disk, complete lifetime unknown. Dv2 later regressions inherit their actual unit. |
| Departure draft/export/dv2/completion | Original c604951 failures,0d7f885 failures,e1a69fb rejection,990ac52 expanded rejection,2962b49 acceptance and mixed follow-on; post-header/retry/F1/author reruns all retained. Far more than three historical artifacts in several modes, no fresh3/3 allowance; exact launch grouping/permanent mapping must be reconstructed before another run. Existing cap not retrospectively declared compliant. |
| Actual parent departure/advanced host | c6049518FAIL/1 and7FAIL/1,0dafter,990final,2962final,author/sharedretry/header/F1post logs plus accepted buffer-copy later run logs. Lifetime unknown; valid historical source-equivalence reuse preferred. |
| Native departure modes | Original c604951 unload build-loader refusal (empty log + diagnostic) retained; route/unload/signout correct failures;0d geometry PASS later contradicted by containment/hit-test failure; e1 bilingual repair; b01owner/pending,990pending;2962ten modes all bounded accepted. A stronger oracle does not erase original failed launch. Appendix B maps raw files; complete per-mode lifetime/refusals/probes unknown. |
| Full packages, F1, host/affected suites | Old package122/129/140/143/146/148 reports, later final regression receipts and actual per-mode logs are inherited unit histories, not fresh POMO04 tests. Canonical r2 G1 uses their own ledgers. Missing lifetime blocks that invocation; valid source-bound reuse remains possible. |
| New POMO04 semantic purpose | Actual compared Module tests cover Stop persistence/mode/sound/fullscreen and durableSession tests cover WAL/queued End/conflicts; accepted departure source explicitly excludes timer Reset meaning. No matching assertion for **pre-action Reset consequence + Cancel/identity-bound confirm + Stop-vs-Reset/leave disclosure** was located in those source/tests/reports. Root may register this genuinely new finite semantic source/review/qualification purpose; do not block merely because POMO04 evidence[] is empty, and do not label all inherited package/native invocations0/3. Mixed executions inherit each old unit they actually exercise. |
| Timer export boundary / pending wording | Existing raw recovery export and pending errors are implemented and partly covered in durable history; new visible wording/actual-download-boundary purpose is narrower and separately compared to preference-export purpose. Device export PASS is not account export PASS. Source task may be new; reused fault/process machinery keeps original qualification and launch counts. |

For every future invocation root must freeze runner+fixture+oracle hashes, immutable target, permanent caller/unit/purpose correspondence, all known original failure/refusal/probe/calibration launches (actual process IDs when retained), consumed count and remaining≤3, source of completeness, command/mode and artifacts. Unknown old history remains unknown and blocks that **old unit**, not unrelated new semantic source work. A source re-registration can classify genuinely new assertions but cannot reset whole-suite history. A historical accepted PASS may be reused only with exact product/dependency/host/CSS/oracle applicability and retained limitations, without rerun merely to collect a fresh log.

## 11. Preparation disposition and explicit gaps

Prepared corrected candidate2 of the complete original obligation, not accepted or implementation-ready. Review1 REVISE remains retained. No product question is sent; next is fresh independent full contract review2/3 of this candidate and the full original/review corpus. The six R1 requirements are reconciled in §4.1; this author does not self-adopt or claim that R1 is independently closed. The review must decide whether the existing-rule resolution suffices and challenge all inferred UI correction scope, especially Reset confirmation's identity/lifetime guard, pending/cleanup wording and timer export read/click boundaries. Unsupported semantics stop rather than become defaults.

Outstanding: actual POMO04 before; reviewed/qualified new machinery; old-unit exhaustive process history/cap reconciliation where a rerun is genuinely needed; adopted focus method; implementation; unchanged-oracle fixed and affected proofs; actual cross-vendor; fresh full Astra acceptance; root evidence-only reconciliation and inventory/remote handoff. Existing limited acceptance is reused only where applicable. Source-discovered risks are hypotheses until frozen reproduction, not claimed new runtime failures. Original preparation read errors (wrong guessed registry/impact paths, then corrected to actual `internal/` and `web-dashboard-clock-recovery-correction-impact-r2`) remain historical read-only errors, not erased probes/qualifications. This correction does not reclassify them or reset their history. Commands run only Git reads, rg/cat/sed, standard-library document/hash/census construction, exact staging and hook-disabled commit. No source generator or imported runner executed.

Root owns original source remote preservation, receipt/integration/global writes/push/ancestry/sync and cleanup; this child does not independently push under general multi-Mac rules. Other agents/trees remain untouched. Input manifest hashes exact immutable Git bytes, not claims of semantic review for every indexed dependency. Output/commit hashes are reported outside these outputs to avoid self-reference.


## Appendix A — canonical r2 complete G1 checklist verbatim

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


## Appendix B — retained invocation artifacts and source applicability

Each path below is relative to `docs/reviews/`. All bytes and the corresponding runner/fixture sources are hashed in the input manifest. A row is a retained artifact, not necessarily a distinct parent process; `unknown` never means zero. Test counts are outcomes, not invocation budgets. Dates/suffixes/PIDs preserved in raw files govern deduplication. No artifact was executed.

| Retained log | Raw receipt observation (bounded excerpt) |
| --- | --- |
| `web-pomodoro-departure-astra/completion-0d7f885.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/completion-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/completion-990ac52.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/completion-author-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/completion-e1a69fb.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/completion-f1post1-f359be6.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/completion-header-parent-c9a388d.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/completion-shared-retry-96c4915.log` | exit=0; Test Files  1 passed (1); Tests  2 passed (2) |
| `web-pomodoro-departure-astra/draft-0d7f885.log` | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Reload preferences"; FAIL  docs/reviews/web-pomodoro-departure-astra/draft-attribution.test.tsx > old epoch and disposed discard capabilities cannot clear survivi |
| `web-pomodoro-departure-astra/draft-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  16 passed (16) |
| `web-pomodoro-departure-astra/draft-990ac52.log` | exit=0; Test Files  1 passed (1); Tests  14 passed (14) |
| `web-pomodoro-departure-astra/draft-author-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  16 passed (16) |
| `web-pomodoro-departure-astra/draft-baseline-c604951.log` | AssertionError: real component must publish its public preference departure capability: expected undefined to be defined; FAIL  docs/reviews/web-pomodoro-departure-astra/draft-attribution.test.tsx > completion-driven failed next preset is a draft; successful r |
| `web-pomodoro-departure-astra/draft-e1a69fb.log` | AssertionError: the newer violet choice failed and is still a real unsaved draft: expected false to be true // Object.is equality; FAIL  docs/reviews/web-pomodoro-departure-astra/draft-attribution.test.tsx > old epoch and disposed discard capabilities cannot c |
| `web-pomodoro-departure-astra/draft-expanded-990ac52.log` | AssertionError: a revoked decision cannot claim current departure authority: expected true to be false // Object.is equality; FAIL  docs/reviews/web-pomodoro-departure-astra/draft-attribution.test.tsx > targeted conflict discard preserves another latest quota- |
| `web-pomodoro-departure-astra/draft-f1post1-f359be6.log` | exit=0; Test Files  1 passed (1); Tests  18 passed (18) |
| `web-pomodoro-departure-astra/draft-header-parent-c9a388d.log` | exit=0; Test Files  1 passed (1); Tests  18 passed (18) |
| `web-pomodoro-departure-astra/draft-mixed-followon-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  18 passed (18) |
| `web-pomodoro-departure-astra/draft-shared-retry-96c4915.log` | exit=0; Test Files  1 passed (1); Tests  18 passed (18) |
| `web-pomodoro-departure-astra/dv2-0d7f885.log` | AssertionError: expected null not to be null; FAIL  docs/reviews/web-d2-pomo-device-astra/contracts.test.tsx > reloading repaired invalid sound cannot discard unrelated latest failed theme draft or its retry; TestingLibraryElementError: Unable to find an acces |
| `web-pomodoro-departure-astra/dv2-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  24 passed (24) |
| `web-pomodoro-departure-astra/dv2-990ac52.log` | exit=0; Test Files  1 passed (1); Tests  24 passed (24) |
| `web-pomodoro-departure-astra/dv2-author-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  24 passed (24) |
| `web-pomodoro-departure-astra/dv2-e1a69fb.log` | exit=0; Test Files  1 passed (1); Tests  24 passed (24) |
| `web-pomodoro-departure-astra/dv2-f1post1-f359be6.log` | exit=0; Test Files  1 passed (1); Tests  24 passed (24) |
| `web-pomodoro-departure-astra/dv2-header-parent-c9a388d.log` | exit=0; Test Files  1 passed (1); Tests  24 passed (24) |
| `web-pomodoro-departure-astra/dv2-shared-retry-96c4915.log` | exit=0; Test Files  1 passed (1); Tests  24 passed (24) |
| `web-pomodoro-departure-astra/export-0d7f885.log` | ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯; FAIL  docs/reviews/web-pomodoro-departure-astra/export-boundary.test.tsx > owner change during actual URL setup revokes the export before click and leaves surviving device work guarded; AssertionError: expected [ 'pomodoro-prefe |
| `web-pomodoro-departure-astra/export-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  7 passed (7) |
| `web-pomodoro-departure-astra/export-990ac52.log` | exit=0; Test Files  1 passed (1); Tests  7 passed (7) |
| `web-pomodoro-departure-astra/export-author-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  7 passed (7) |
| `web-pomodoro-departure-astra/export-baseline-c604951.log` | AssertionError: expected [ 'pomodoro-preferences.json' ] to have a length of +0 but got 1; FAIL  docs/reviews/web-pomodoro-departure-astra/export-boundary.test.tsx > partial success exports complete current values without turning saved siblings into discard ta |
| `web-pomodoro-departure-astra/export-e1a69fb.log` | ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯; FAIL  docs/reviews/web-pomodoro-departure-astra/export-boundary.test.tsx > owner change during actual URL setup revokes the export before click and leaves surviving device work guarded; AssertionError: expected [ 'pomodoro-prefe |
| `web-pomodoro-departure-astra/export-f1post1-f359be6.log` | exit=0; Test Files  1 passed (1); Tests  7 passed (7) |
| `web-pomodoro-departure-astra/export-header-parent-c9a388d.log` | exit=0; Test Files  1 passed (1); Tests  7 passed (7) |
| `web-pomodoro-departure-astra/export-shared-retry-96c4915.log` | exit=0; Test Files  1 passed (1); Tests  7 passed (7) |
| `web-pomodoro-departure-author/types-lint-author-final-2962b49.log` | exit=0 |
| `web-pomodoro-departure-author/web-test-author-final-2962b49.log` | exit=0 |
| `web-pomodoro-departure-independent/advanced-author-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-departure-independent/advanced-baseline-c604951.log` | TestingLibraryElementError: Unable to find an accessible element with the role "dialog"; FAIL  docs/reviews/web-pomodoro-departure-independent/advanced.test.tsx > unmount cancels pending signout and restores original router method and delegate; AssertionError: |
| `web-pomodoro-departure-independent/advanced-f1post1-f359be6.log` | exit=0; Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-departure-independent/advanced-header-parent-c9a388d.log` | exit=0; Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-departure-independent/advanced-parent-after-0d7f885.log` | exit=0; Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-departure-independent/advanced-parent-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-departure-independent/advanced-parent-final-990ac52.log` | exit=0; Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-departure-independent/advanced-shared-retry-96c4915.log` | exit=0; Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-departure-independent/departure-author-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  9 passed (9) |
| `web-pomodoro-departure-independent/departure-baseline-c604951.log` | AssertionError: expected '/app/dashboard' to be '/app/pomodoro' // Object.is equality; FAIL  docs/reviews/web-pomodoro-departure-independent/departure.test.tsx > App signout preflight remains pending behind actual Pomodoro draft decision; AssertionError: expec |
| `web-pomodoro-departure-independent/departure-f1post1-f359be6.log` | exit=0; Test Files  1 passed (1); Tests  9 passed (9) |
| `web-pomodoro-departure-independent/departure-header-parent-c9a388d.log` | exit=0; Test Files  1 passed (1); Tests  9 passed (9) |
| `web-pomodoro-departure-independent/departure-parent-after-0d7f885.log` | exit=0; Test Files  1 passed (1); Tests  9 passed (9) |
| `web-pomodoro-departure-independent/departure-parent-final-2962b49.log` | exit=0; Test Files  1 passed (1); Tests  9 passed (9) |
| `web-pomodoro-departure-independent/departure-parent-final-990ac52.log` | exit=0; Test Files  1 passed (1); Tests  9 passed (9) |
| `web-pomodoro-departure-independent/departure-shared-retry-96c4915.log` | exit=0; Test Files  1 passed (1); Tests  9 passed (9) |
| `web-pomodoro-departure-independent/package-f1post1-f359be6.log` | exit=0; Test Files  44 passed (44); Tests  314 passed (314) |
| `web-pomodoro-departure-independent/package-shared-retry-96c4915.log` | exit=0; Test Files  43 passed (43); Tests  293 passed (293) |
| `web-pomodoro-departure-native/native-0d7f885-containment-visual.log` | {"name":"departure","pass":false,"error":"AssertionError [ERR_ASSERTION]: Recovery target outside its container Retry preferences"} |
| `web-pomodoro-departure-native/native-0d7f885-export-denied.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-0d7f885-rail.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-0d7f885-visual.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-conflict.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-export-denied.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-owner.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-pending.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-rail.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-route.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-signout.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-unload.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-visual-zh.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-2962b49-visual.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-357d862-rail.log` | {"name":"departure","pass":false,"error":"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n+ actual - expected\n\n+ '/app/dashboard'\n- '/app/pomodoro'\n        ^\n"} |
| `web-pomodoro-departure-native/native-990ac52-pending.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-b01b67c-owner.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-b01b67c-pending.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-c604951-route.log` | {"name":"departure","pass":false,"error":"AssertionError [ERR_ASSERTION]: Actual registration left the failed preference draft\n+ actual - expected\n\n+ '/app/dashboard'\n- '/app/pomodoro'\n        ^\n"} |
| `web-pomodoro-departure-native/native-c604951-signout.log` | {"name":"departure","pass":false,"error":"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n+ actual - expected\n\n+ true\n- 'unresolved'\n"} |
| `web-pomodoro-departure-native/native-c604951-unload-build-diagnostic.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-c604951-unload.log` | {"name":"departure","pass":false,"error":"AssertionError [ERR_ASSERTION]: Actual failed preference draft lacks browser unload warning"} |
| `web-pomodoro-departure-native/native-e1a69fb-route.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-e1a69fb-signout.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-e1a69fb-unload.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-e1a69fb-visual-zh.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-departure-native/native-e1a69fb-visual.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-durable-session/20260909-before.log` | AssertionError: expected <div class="pomo-notice" …(2)></div> to be null; Test Files  1 failed (1); Tests  7 failed \| 1 passed (8) |
| `web-pomodoro-durable-session/20260909-host-bundle.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-durable-session/20260909-native-before.log` | {"diagnosis":true,"results":[{"case":"real page reload running session","expected":"running","actual":"idle"},{"case":"real page reload paused session","expected":"paused","actual":"idle"},{"case":"second browser window same account observes active session","e |
| `web-pomodoro-durable-session/20260909-native-close-after.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-durable-session/20260909-native-crash-after.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-durable-session/20260909-native-lifecycle-after.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-durable-session/20260909-native-recovery-after.log` | {"diagnosis":true,"results":[{"case":"real page reload running session","expected":"running","actual":"running"},{"case":"real page reload paused session","expected":"paused","actual":"paused"},{"case":"second browser window same account observes active sessio |
| `web-pomodoro-durable-session/20260909-package-after.log` | Test Files  17 passed (17); Tests  140 passed (140) |
| `web-pomodoro-durable-session/20260909-reproduction-after.log` | Test Files  1 passed (1); Tests  8 passed (8) |
| `web-pomodoro-durable-session/20260909-storage-after.log` | [plugin-web-storage] decode failed for xai_ai_insights: Error: Cannot decode stored value with codec "boolean"; Test Files  16 passed (16); Tests  126 passed (126) |
| `web-pomodoro-durable-session/20260909-web-after.log` | Test Files  27 passed (27); Tests  143 passed (143) |
| `web-pomodoro-independent/20260909-independent-after.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-independent/20260909-independent-conflict.log` | {"name":"stale-pause","active":{"version":1,"owner":{"kind":"account","accountId":"independent-POMO-A","generation":"g1"},"revision":1,"sessionId":"pomo_06bf5034-5848-4669-8759-7dc965d06f97","mode":"focus","durationMs":60000,"sessionStartedAt":"2026-09-09T20:0 |
| `web-pomodoro-independent/20260909-independent-paused-close.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-independent/20260909-independent-whole-close.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-independent/20260909-paused-close-after.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-independent/20260909-whole-close-after.log` | raw observations; no normalized terminal count/exit identified |
| `web-pomodoro-prefs-independent/20260909-after.log` | "pids": [ |
| `web-pomodoro-prefs-independent/20260909-before.log` | "pass": false,; "pids": [ |
| `web-pomodoro-prefs-independent/20260909-download-after.log` | "pids": [ |
| `web-statistics-time-independent/20260909-native-stat-after.log` | raw observations; no normalized terminal count/exit identified |
| `web-statistics-time-independent/20260909-native-stat-before.log` | {"name":"pomo-list-after-early-end","persisted":{"id":"pomo_b201f431-d191-4f3e-b15d-a5c5a1994bc6","mode":"focus","startedAt":"2026-09-09T17:00:00.000Z","finishedAt":"2026-09-09T17:06:00.000Z","durationMs":1500000,"elapsedMs":60000,"completed":false,"deadline": |
| `web-statistics-time-independent/20260909-original-stat01-three.log` | Test Files  1 passed (1); Tests  3 passed \| 1 skipped (4) |

### Historical byte applicability (source comparison, not fresh runtime)

Equality below covers each named source only; host/storage/dependency/oracle qualification remains separately required. A differing source requires reviewed delta mapping, not a transitive accepted-PASS assertion.

| Historical source revision | Compared P0 source | Result |
| --- | --- | --- |
| `4868d0a682e27a7789fe58168ee6f7006e5946bb` | `packages/plugin-web-pomodoro/src/internal/sessionController.ts` | byte-identical |
| `4868d0a682e27a7789fe58168ee6f7006e5946bb` | `packages/plugin-web-pomodoro/src/internal/sessionProtocol.ts` | byte-identical |
| `4868d0a682e27a7789fe58168ee6f7006e5946bb` | `packages/plugin-web-pomodoro/src/internal/useTimerTick.ts` | byte-identical |
| `4868d0a682e27a7789fe58168ee6f7006e5946bb` | `packages/plugin-web-pomodoro/src/session-host.tsx` | byte-identical |
| `2962b49bd63fa351a2c17b406456ea1b987eca8f` | `packages/plugin-web-pomodoro/src/PomodoroModule.tsx` | byte-identical |
| `2962b49bd63fa351a2c17b406456ea1b987eca8f` | `packages/plugin-web-pomodoro/src/internal/usePreferenceDepartureRecovery.ts` | byte-identical |
| `2962b49bd63fa351a2c17b406456ea1b987eca8f` | `packages/plugin-web-pomodoro/src/styles.css` | byte-identical |
| `ab94f8473435f4138bd3e96e5da07fa43ab23cc6` | `packages/plugin-web-pomodoro/src/FocusRecordList.tsx` | byte-identical |
| `ab94f8473435f4138bd3e96e5da07fa43ab23cc6` | `packages/plugin-web-pomodoro/src/internal/derivedCounters.ts` | byte-identical |
| `394efad7b467413fcbde789cc8469e40766b8c5c` | `packages/plugin-web-pomodoro/src/PomodoroModule.tsx` | DIFFERENT; prior evidence limited to historical revision until exact delta review |

### Consumer ownership limits

`FocusRecordList` shows ended focus, completed or incomplete, measured elapsed; overview sums all focus elapsed but rounds/streak count completed only. `StatisticsModule` narrows history and aggregates elapsed under its accepted unknown/range limitations. `StatPomos` reads the same history but counts completed focus by browser-local finishedAt (not recordedAt or completedAt); DASH06 owns scale and accessible-count presentation. `CmdK` reads via readModuleStates and its legacy adapter uses configured durationMs and optional completedAt, with id/mode/alias search; it is **not** an elapsed-duration oracle. Preserve/search the persisted session identity without falsely claiming all CmdK metadata matches POMO03. If full POMO04 wording relies on it as saved-time proof, freeze that mismatch as an affected-owner dependency, never alter CmdK in this allowlist. Readers do not become writers. No duplicate Dashboard projection owner or new global source-availability implementation is granted.

## Appendix C — candidate2 single concluding static validation receipt

One standard-library/Git-only static pass fully read and SHA-256 validated **2932 immutable input identities**, including all **2,914** review identities with the original **2,900** entries retained in exact order. The dependency byte closure and all106 historical logs were read, not sampled; this is integrity evidence, not semantic review of every package or fresh runtime proof. Full original proposal and review remain immutable at their source commits; original author1/static1 and review1/static1 receipts and all failures remain retained.

Validated the exact clean starting parent, registered card and two-ADD output ceiling before any write; constructed both complete output buffers in memory before creating either file. All312 ordered original task fields and39 reversible labels/original_module remain; all933 original execution evidence plus exactly6 prior TT08 entries are939. Non-TT08 records and top metadata are unchanged; current TODO equals original, current EXECUTION equals fixed discovery and task input; formal13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed remain. Full canonical Clock r2 hash and complete copied §14 are exact; Appendix A and all Appendix B bytes are preserved from the original proposal. All15 P04 rows and all11 conditional paths remain; only R1 lifecycle requirements and this candidate identity/receipt are revised. The seven conditional runtime/test paths equal P0 and the listed accepted historical byte-applicability checks remain true; no broader all-package-doc equality is asserted.

Current cost: preparation author **2/3**, static **1**; runtime/test/build/lint/browser/native/qualification/probe/vendor/child invocations **0**. Review1 retained; fresh independent review2 is next. Git whitespace/exact-path scope, staging, command-local disabled-hook commit and clean receipt complete this same documentary integrity pass; they are not product execution. All permanent histories, unknown totals, exhausted budgets, full before/qualification/native focus/canonical/vendor/final acceptance/root reconciliation/inventory gates remain as §§8–11. No push/fetch/sync, original-file edit, product/test/runner mutation, global control write, adoption, formal closure or release occurred. Full source/parent/output hashes and final clean status are supplied externally to avoid self-reference.


## Appendix B. Complete canonical Clock r2 section14 through final Rules, verbatim

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


## Appendix C. Actual P0 controller, protocol and hook source (read-only)

### packages/plugin-web-pomodoro/src/internal/sessionController.ts

```typescript
import { accountScope, readGeneration, type AccountScope } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { PomodoroMode, PomodoroSession } from "../types.js";
import { isPomodoroSession } from "./validate.js";
import { elapsedAt, isActiveSession, pendingSettlement, type ActiveSession, type SessionOwner } from "./sessionProtocol.js";

export const ACTIVE_KEY = "xai_pomodoro_active";
export const HISTORY_KEY = "xai_pomodoro_sessions";
export interface SessionSnapshot {
  scope: AccountScope | null;
  active: ActiveSession | null;
  now: number;
  error: string | null;
  conflict: boolean;
  available: boolean;
  lastCommitted: PomodoroSession | null;
}
type Command = "start" | "pause" | "resume" | "end" | "discard" | "reconcile";
class SettlementCleanupError extends Error {}
class StaleCommandError extends Error {}
const unavailable = "This browser cannot safely save shared timers because Web Locks is unavailable. Use a browser with Web Locks support.";
const listeners = new Set<() => void>();
let snapshot: SessionSnapshot = { scope: null, active: null, now: 0, error: null, conflict: false, available: false, lastCommitted: null };
let mounted = 0;
let stopScope: (() => void) | undefined;
let interval: ReturnType<typeof setInterval> | undefined;
let inFlight = false;
let pendingDraft: { scope: AccountScope; candidate: ActiveSession } | null = null;
let retryAction: (() => Promise<boolean>) | null = null;
let observedScope: AccountScope | null = null;
function publish(delta: Partial<SessionSnapshot>) {
  snapshot = { ...snapshot, ...delta };
  for (const listener of listeners) listener();
}
function owner(scope: AccountScope): SessionOwner {
  accountScope.assertCurrent(scope);
  if (scope.kind === "locked" || !scope.accountId || !scope.generation) throw Error("Account storage is locked.");
  return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation };
}
function assertScope(scope: AccountScope) {
  const context = owner(scope);
  const marker = readGeneration(localStorage, context.accountId, context.kind === "demo");
  if (marker && marker.generation !== context.generation) throw Error("Account data generation changed. Reopen account storage before continuing.");
  // physicalKey also checks the deletion tombstone; no auth database generation is involved.
  accountScope.physicalKey(ACTIVE_KEY, scope);
}
function activeFor(scope: AccountScope): ActiveSession | null {
  assertScope(scope);
  const raw = localStorage.getItem(accountScope.physicalKey(ACTIVE_KEY, scope));
  if (raw === null || raw === "null") return null;
  const value: unknown = JSON.parse(raw);
  if (!isActiveSession(value)) throw Error("Saved timer is unreadable. Export recovery data before making changes.");
  const expected = owner(scope);
  if (value.owner.kind !== expected.kind || value.owner.accountId !== expected.accountId || value.owner.generation !== expected.generation) throw Error("Saved timer belongs to a different account data generation. Export it for recovery.");
  return value;
}
function historyFor(scope: AccountScope): PomodoroSession[] {
  assertScope(scope);
  const raw = localStorage.getItem(accountScope.physicalKey(HISTORY_KEY, scope));
  const value: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(isPomodoroSession)) throw Error("Saved history contains unreadable records. Export recovery data before making changes.");
  return value;
}
function writeActive(scope: AccountScope, active: ActiveSession | null) {
  assertScope(scope);
  const key = accountScope.physicalKey(ACTIVE_KEY, scope);
  if (active) localStorage.setItem(key, JSON.stringify(active));
  else localStorage.removeItem(key);
}
function changed(scope: AccountScope) {
  const key = accountScope.physicalKey(HISTORY_KEY, scope);
  window.dispatchEvent(new StorageEvent("storage", { key, newValue: localStorage.getItem(key), storageArea: localStorage }));
}
function settle(scope: AccountScope, pending: ActiveSession): void {
  const record = pending.settlement;
  if (!record) throw Error("Settlement is incomplete; recovery is required.");
  const history = historyFor(scope);
  const existing = history.find(row => row.id === pending.sessionId);
  if (existing && (existing.finishedAt !== record.finishedAt || existing.elapsedMs !== record.elapsedMs || existing.mode !== record.mode || existing.completed !== record.completed)) throw Error("Conflicting history for this session. Export recovery data.");
  if (!existing) {
    const committed: PomodoroSession = { ...record, recordedAt: new Date(Date.now()).toISOString() };
    assertScope(scope);
    localStorage.setItem(accountScope.physicalKey(HISTORY_KEY, scope), JSON.stringify([...history, committed]));
    // The record is now durable. Events are a best-effort invalidation, never the ledger.
    publish({ lastCommitted: committed });
    assertScope(scope);
    emitWebEvent("web:pomodoro:session-finished", { sessionId: committed.id, mode: committed.mode, durationMs: committed.elapsedMs, finishedAt: committed.finishedAt, recordedAt: committed.recordedAt });
    changed(scope);
  }
  try { writeActive(scope, null); } catch { throw new SettlementCleanupError("Session was saved, but pending timer cleanup failed. Retry cleanup."); }
}
function refresh() {
  const scope = accountScope.capture();
  if (!accountScope.isReady(scope)) {
    observedScope = scope; retryAction = null; pendingDraft = null;
    publish({ scope, active: null, error: null, conflict: false, lastCommitted: null, now: Date.now(), available: false });
    return;
  }
  if (scope !== observedScope) { observedScope = scope; retryAction = null; pendingDraft = null; publish({ scope, lastCommitted: null, conflict: false, error: null }); }
  const available = typeof navigator !== "undefined" && !!navigator.locks;
  try { publish({ scope, active: activeFor(scope), now: Date.now(), available, ...(available ? {} : { error: unavailable }) }); }
  catch (error) { publish({ active: null, error: String(error), available }); }
}
function notifyStorage(event: StorageEvent) {
  if (event.storageArea !== localStorage) return;
  // Re-read scoped authoritative state; unrelated account events cannot publish their values.
  refresh();
}
export function retainPomodoroController(): () => void {
  if (++mounted === 1) {
    stopScope = accountScope.subscribe(refresh);
    window.addEventListener("storage", notifyStorage);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    refresh();
    interval = setInterval(() => {
      if (Math.floor(snapshot.now / 1000) !== Math.floor(Date.now() / 1000)) publish({ now: Date.now() });
      if (!snapshot.error && snapshot.active && (snapshot.active.phase === "settlement-pending" || snapshot.active.phase === "running" && Date.now() >= snapshot.active.deadline)) void command("reconcile");
    }, 100);
    if (snapshot.active && !snapshot.error) void command("reconcile");
  }
  return () => {
    if (--mounted !== 0) return;
    stopScope?.(); clearInterval(interval);
    window.removeEventListener("storage", notifyStorage);
    window.removeEventListener("pageshow", refresh);
    document.removeEventListener("visibilitychange", refresh);
    // Durable state stays intact when the last observer leaves.
  };
}
export const subscribePomodoro = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getPomodoroSnapshot = () => snapshot;

export async function command(action: Command, options?: { mode: PomodoroMode; durationMs: number }, expectedId = snapshot.active?.sessionId, expectedRevision = snapshot.active?.revision): Promise<boolean> {
  const scope = accountScope.capture();
  const issuedAt = Date.now();
  if (inFlight || retryAction) return false;
  if (!accountScope.isReady(scope)) return false;
  if (!navigator.locks) { publish({ error: unavailable, available: false }); return false; }
  inFlight = true;
  let frozenPending: ActiveSession | undefined;
  const execute = async (): Promise<boolean> => {
    try {
      const identity = owner(scope);
      await navigator.locks.request(`xai:timer:${identity.kind}:${encodeURIComponent(identity.accountId)}:${encodeURIComponent(identity.generation)}:pomodoro`, () => {
        assertScope(scope);
        const current = activeFor(scope);
        const now = Date.now();
        if (!current && expectedId && action !== "start" && historyFor(scope).some(row => row.id === expectedId)) {
          retryAction = null; pendingDraft = null; publish({ scope, active: null, error: null, conflict: false, now }); return;
        }
        if (action !== "start" && action !== "reconcile" && (!current || current.sessionId !== expectedId || current.phase !== "settlement-pending" && current.revision !== expectedRevision)) throw new StaleCommandError("This timer changed in another tab.");
        if (frozenPending && current && current.phase !== "settlement-pending") {
          writeActive(scope, frozenPending); settle(scope, frozenPending);
        } else if (current?.phase === "settlement-pending" || current?.phase === "running" && (action === "end" ? issuedAt : now) >= current.deadline) {
          const pending = current.phase === "settlement-pending" ? current : pendingSettlement(current, now);
          if (current.phase !== "settlement-pending") writeActive(scope, pending);
          settle(scope, pending);
        } else if (action === "start") {
          if (current) throw new StaleCommandError("A timer is already active in this account.");
          if (!options || !Number.isFinite(options.durationMs) || options.durationMs <= 0) throw Error("Invalid timer duration.");
          writeActive(scope, { version: 1, owner: identity, revision: 0, sessionId: `pomo_${crypto.randomUUID()}`, mode: options.mode, durationMs: options.durationMs, sessionStartedAt: new Date(now).toISOString(), phase: "running", accumulatedElapsedMs: 0, runStartedAt: now, deadline: now + options.durationMs });
        } else if (current && action === "pause" && current.phase === "running") {
          writeActive(scope, { ...current, phase: "paused", revision: current.revision + 1, accumulatedElapsedMs: elapsedAt(current, now), pausedAt: now });
        } else if (current && action === "resume" && current.phase === "paused") {
          writeActive(scope, { ...current, phase: "running", revision: current.revision + 1, runStartedAt: now, deadline: now + current.durationMs - current.accumulatedElapsedMs });
        } else if (current && action === "end") {
          frozenPending ??= pendingSettlement(current, issuedAt);
          pendingDraft = { scope, candidate: frozenPending };
          writeActive(scope, frozenPending);
          settle(scope, frozenPending);
        } else if (current && action === "discard") {
          writeActive(scope, null);
        }
        retryAction = null; pendingDraft = null;
        publish({ scope, active: activeFor(scope), now, error: null, conflict: false });
      });
      return true;
    } catch (error) {
      if (accountScope.isReady(scope)) {
        if (error instanceof StaleCommandError) {
          // A revision mismatch is an obsolete intent, not a failed write.
          // Drop its captured revision/settlement; never replay it over the winner.
          retryAction = null; pendingDraft = null; frozenPending = undefined;
          try { publish({ active: activeFor(scope), error: null, conflict: true, now: Date.now() }); }
          catch (readError) { publish({ active: null, error: `Timer recovery required: ${String(readError)}`, conflict: false }); }
          return false;
        }
        retryAction = execute;
        try { publish({ active: activeFor(scope), error: error instanceof SettlementCleanupError ? error.message : `Timer could not be saved: ${String(error)}`, now: Date.now() }); }
        catch { publish({ error: `Timer recovery required: ${String(error)}` }); }
      }
      return false;
    } finally { inFlight = false; }
  };
  return execute();
}
export function retryPomodoro(): Promise<boolean> { if (!retryAction || inFlight) return Promise.resolve(false); inFlight = true; return retryAction(); }
export function exportPomodoroRecovery(scope: AccountScope = accountScope.capture()): string {
  assertScope(scope);
  return JSON.stringify({ version: 1, owner: owner(scope), uncommittedSettlement: pendingDraft?.scope === scope ? pendingDraft.candidate : null, active: localStorage.getItem(accountScope.physicalKey(ACTIVE_KEY, scope)), history: localStorage.getItem(accountScope.physicalKey(HISTORY_KEY, scope)) }, null, 2);
}
```

### packages/plugin-web-pomodoro/src/internal/sessionProtocol.ts

```typescript
import { isPomodoroSession } from "./validate.js";
import type { PomodoroMode, PomodoroSession } from "../types.js";
export interface SessionOwner { kind: "account" | "demo"; accountId: string; generation: string }
export interface ActiveSession {
  version: 1;
  owner: SessionOwner;
  revision: number;
  sessionId: string;
  mode: PomodoroMode;
  durationMs: number;
  sessionStartedAt: string;
  phase: "running" | "paused" | "settlement-pending";
  accumulatedElapsedMs: number;
  runStartedAt: number;
  deadline: number;
  pausedAt?: number;
  settlement?: Omit<PomodoroSession, "recordedAt">;
}
export function elapsedAt(session: ActiveSession, now: number): number {
  return Math.min(session.durationMs, Math.max(0, session.accumulatedElapsedMs + (session.phase === "running" ? Math.max(0, now - session.runStartedAt) : 0)));
}
export function isActiveSession(value: unknown): value is ActiveSession {
  if (!value || typeof value !== "object") return false;
  const row = value as ActiveSession;
  return row.version === 1 && !!row.owner && ["account", "demo"].includes(row.owner.kind)
    && typeof row.owner.accountId === "string" && !!row.owner.accountId && typeof row.owner.generation === "string" && !!row.owner.generation
    && Number.isSafeInteger(row.revision) && row.revision >= 0 && typeof row.sessionId === "string" && !!row.sessionId
    && ["focus", "short-break", "long-break"].includes(row.mode) && ["running", "paused", "settlement-pending"].includes(row.phase)
    && Number.isFinite(row.durationMs) && row.durationMs > 0 && typeof row.sessionStartedAt === "string" && Number.isFinite(Date.parse(row.sessionStartedAt))
    && Number.isFinite(row.accumulatedElapsedMs) && row.accumulatedElapsedMs >= 0 && row.accumulatedElapsedMs <= row.durationMs
    && Number.isFinite(row.runStartedAt) && Number.isFinite(row.deadline)
    && (row.phase !== "running" || row.deadline === row.runStartedAt + row.durationMs - row.accumulatedElapsedMs)
    && (row.phase !== "paused" || Number.isFinite(row.pausedAt))
    && (row.phase !== "settlement-pending" || isPomodoroSession(row.settlement) && row.settlement.id === row.sessionId && row.settlement.mode === row.mode && row.settlement.durationMs === row.durationMs);
}
export function pendingSettlement(session: ActiveSession, now: number): ActiveSession {
  if (session.phase === "settlement-pending") return session;
  const completed = session.phase === "running" && now >= session.deadline;
  return { ...session, phase: "settlement-pending", revision: session.revision + 1, settlement: {
    id: session.sessionId, mode: session.mode, startedAt: session.sessionStartedAt,
    finishedAt: new Date(completed ? session.deadline : now).toISOString(),
    durationMs: session.durationMs, elapsedMs: completed ? session.durationMs : elapsedAt(session, now),
    completed, deadline: new Date(session.deadline).toISOString(), schemaVersion: 2,
  } };
}
```

### packages/plugin-web-pomodoro/src/internal/useTimerTick.ts

```typescript
import { accountScope } from "@repo/plugin-web-storage";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { PomodoroMode, PomodoroSession } from "../types.js";
import { DEFAULT_DURATIONS_MS } from "./durations.js";
import { command, exportPomodoroRecovery, getPomodoroSnapshot, retainPomodoroController, retryPomodoro, subscribePomodoro } from "./sessionController.js";
import { elapsedAt } from "./sessionProtocol.js";
export type TimerState =
  | { kind: "idle"; mode: PomodoroMode; remainingMs: number; durationMs: number }
  | {
      kind: "running";
      mode: PomodoroMode;
      /** configured duration for this session */
      durationMs: number;
      /** epoch ms of when this run-segment started */
      startedAt: number;
      /** ms remaining when this run-segment started */
      remainingAtStartMs: number;
      /** ISO instant when the session was first started (for PomodoroSession.startedAt) */
      sessionStartedAt: string;
      /** stable session id (for dedup guard) */
      sessionId: string;
      /** ms accumulated during previous pause segments */
      elapsedBeforePauseMs: number;
    }
  | {
      kind: "paused";
      mode: PomodoroMode;
      /** configured duration for this session */
      durationMs: number;
      /** ms remaining at the moment of pause */
      remainingMs: number;
      sessionStartedAt: string;
      sessionId: string;
      /** ms elapsed across all run-segments up to this pause */
      elapsedSoFarMs: number;
    };


export interface UseTimerTickOptions {
  dotRef?: React.RefObject<SVGCircleElement | null>;
  dotProgressMode?: "elapsed" | "remaining";
  onTickToZero?: (mode: PomodoroMode, durationMs: number, elapsedMs: number, sessionId: string, sessionStartedAt: string) => void;
  onCommitted?: (session: PomodoroSession) => void;
}
export function useTimerTick(options: UseTimerTickOptions = {}) {
  const scope = useRef(accountScope.capture()).current;
  const snapshot = useSyncExternalStore(subscribePomodoro, getPomodoroSnapshot, getPomodoroSnapshot);
  const visible = snapshot.scope === scope && accountScope.isReady(scope);
  const [idle, setIdle] = useState({ mode: "focus" as PomodoroMode, durationMs: DEFAULT_DURATIONS_MS.focus });
  useEffect(retainPomodoroController, []);
  const seen = useRef(snapshot.lastCommitted?.id);
  const callbacks = useRef(options); callbacks.current = options;
  useEffect(() => {
    const record = snapshot.lastCommitted;
    if (!visible || !accountScope.isReady(scope) || !record || record.id === seen.current) return;
    seen.current = record.id;
    callbacks.current.onCommitted?.(record);
    if (record.completed) callbacks.current.onTickToZero?.(record.mode, record.durationMs, record.elapsedMs, record.id, record.startedAt);
  }, [snapshot.lastCommitted, visible, scope]);
  const active = visible ? snapshot.active : null;
  const timerState = useMemo<TimerState>(() => {
    if (!active) return { kind: "idle", ...idle, remainingMs: idle.durationMs };
    if (active.phase === "running") return { kind: "running", mode: active.mode, durationMs: active.durationMs, startedAt: active.runStartedAt, remainingAtStartMs: active.durationMs - active.accumulatedElapsedMs, sessionStartedAt: active.sessionStartedAt, sessionId: active.sessionId, elapsedBeforePauseMs: active.accumulatedElapsedMs };
    return { kind: "paused", mode: active.mode, durationMs: active.durationMs, remainingMs: active.phase === "settlement-pending" ? 0 : active.durationMs - active.accumulatedElapsedMs, sessionStartedAt: active.sessionStartedAt, sessionId: active.sessionId, elapsedSoFarMs: active.accumulatedElapsedMs };
  }, [active, idle]);
  const remaining = active ? active.phase === "settlement-pending" ? 0 : active.durationMs - elapsedAt(active, snapshot.now) : idle.durationMs;
  useEffect(() => {
    const dot = options.dotRef?.current;
    if (!dot) return;
    let frame = 0;
    const draw = () => {
      const elapsed = active ? elapsedAt(active, Date.now()) / active.durationMs : 0;
      const progress = options.dotProgressMode === "remaining" ? 1 - elapsed : elapsed;
      const angle = (progress * 360 - 90) * Math.PI / 180;
      dot.setAttribute("cx", String(160 + 140 * Math.cos(angle)));
      dot.setAttribute("cy", String(160 + 140 * Math.sin(angle)));
      if (active?.phase === "running") frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [options.dotRef, options.dotProgressMode, active]);

  const start = useCallback((durationMs?: number) => accountScope.isReady(scope) ? command("start", { mode: idle.mode, durationMs: durationMs ?? idle.durationMs }) : Promise.resolve(false), [idle, scope]);
  const pause = useCallback(() => accountScope.isReady(scope) ? command("pause") : Promise.resolve(false), [scope]);
  const resume = useCallback(() => accountScope.isReady(scope) ? command("resume") : Promise.resolve(false), [scope]);
  const end = useCallback(() => { if (!accountScope.isReady(scope)) return 0; const current = getPomodoroSnapshot(); const elapsed = current.active ? elapsedAt(current.active, Date.now()) : 0; void command("end"); return elapsed; }, [scope]);
  const reset = useCallback((mode: PomodoroMode, durationMs?: number) => {
    if (!accountScope.isReady(scope)) return;
    const duration = durationMs ?? DEFAULT_DURATIONS_MS[mode];
    if (getPomodoroSnapshot().active) { void command("discard").then(ok => { if (ok) setIdle({ mode, durationMs: duration }); }); }
    else setIdle(prev => prev.mode === mode && prev.durationMs === duration ? prev : { mode, durationMs: duration });
  }, [scope]);
  return { timerState, displayedRemainingMs: remaining, start, pause, resume, end, reset, error: visible ? snapshot.error : null, conflict: visible && snapshot.conflict, available: visible && snapshot.available, settlementPending: active?.phase === "settlement-pending", retry: () => accountScope.isReady(scope) ? retryPomodoro() : Promise.resolve(false), exportRecovery: () => exportPomodoroRecovery(scope) };
}
export type UseTimerTickReturn = ReturnType<typeof useTimerTick>;
```


## Appendix D. Full immutable independent machinery review2

# POMO-04 / SOURCE-MACHINERY-IMPACT-REVIEW2

**APPROVED: complete conditional technical basis only.** Zero blocking design findings in immutable source `a9054733b4f1179dac138b73031e3d0fd22b2416`. This approves the full source-machinery proposal as a basis for later exact registration, subject to the source, budget, method and qualification prerequisites below. It is not source implementation approval, a product/API/path grant, qualified machinery, caller acceptance, or permission to run anything. The original full Stop/Reset/departure obligation remains open.

## 1. Fixed authority, scope and independence

Module `web`; workflow D, fresh independent reviewer `/root/parallel_d_pomo04_machinery_full_review_r2`, no prior POMO author or reviewer role and no children. The registered Astra configuration is not provider attestation or cross-vendor evidence. Sole writable checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-pomo04-machinery-review2-20261010/XAI_Desktop`. Other authors, changes and worktrees remain untouched.

- Direct clean parent P: `26f7875d3dd318d62a08afbf5946036af4b19692`.
- Fixed input I: `e96543bed85056d9a2581a0681ff44a7f1d0583e`.
- Reviewed machinery source S: `a9054733b4f1179dac138b73031e3d0fd22b2416`; its parent `6bcb03c31d7bcd50ac81bd2549f949276fa4d641`.
- Adopted document source2: `9e2e6cf722171936dc8c085d588f0c047d968e92`; independent contract review2: `d75a0d6de0521abde0128339049bd860bc0ec7a2`.
- Original preparation1: `59dae0b524e19e6d0c273174488b84d68fb323f3`; original contract review1: `0f2f5c1a155f8fda127758f7986010dd57335f21`.
- Product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`; ordered scope O: `e041c2bc293b70db367444c62c4300231976dbf7`.
- Canonical Clock r2: `8bf613962517ee9b80bf51373e8ad88960c570cc`, full contract SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`.

AGENTS, CLAUDE, project workflow and multi-machine rules, original goal attachment, fixed control plane, authority overlay, goal-D and the exact review2 task card were read. Attachment SHA-256 remains `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`. The task is registered in `execution-state.tasks` (a list) and its exact card; the initial task-registry is not a complete dynamic task inventory. Only the two ADD paths `review.md` and `inputs.sha256` in this directory are writable. Root alone preserves the source remotely, receives it, writes control/ledgers, pushes and performs sync checks.

## 2. Historical failure and current shared authority

Prior machinery review1 consumed attempt1/3 but its functions.exec source construction raised `SyntaxError: Unexpected token '^'` before shell/checker launch. Its receipt records chunk `cee8d8`, actual checker launches0, no session/exit, all concluding semantics and writes UNRUN, no outputs/commit and clean worktree. An in-memory APPROVED draft was not delivered evidence. This review consumes review2/3 and one actual concluding static pass1/1; no budget reset or automatic semantic retry.

The reviewed S heading and §§1/4/7 describe shared final author3 as running/UNADOPTED at S's frozen time. That is historical, not a current global hold. Fixed parent P already includes `b7324936f5880c2050e6eecc8c22567fade05444` and the shared root adoption: exact full five-row conditional design source `f667a0b6996b4039d2c4e5ca28657953703e830b`, independent review `bdc06bd5b57f026caf6d7838563bfdae6f8684c9`. This later authority is separately bound; I and S are not repinned or rewritten.

Shared conditional design approval does not establish consumed ReactDOM/React and SDK source/config/forwarding coverage, browser support, existing root-capture closure, a usable collector, qualification or method adoption. Those source prerequisites and actual real-path controls remain binding. Installed version labels or partial collected bytes do not prove the complete consumed closure. Shared author3 is exhausted; no author4, disguised repair or incomplete final caller source3 is authorized. The I1 measurement problem remains a qualification/admission hold where those proofs are needed, while its conditional design has been reviewed.

## 3. Complete corpus, original scope and source parity

The concluding receipt below records full reads and SHA-256 verification of all2979 inherited immutable identities, with exact2954/2932/2914/2900 ordered prefixes, all106 historical logs, and additional fixed source/authority inputs. Raw identity records, unique identities, Git blob objects and byte counts are kept separate. This is complete byte integrity, full proposal/case/source technical review and retained history analysis; it is not behavioral review of every transitive package byte or visual acceptance of every historical image.

All312 original TODO task records and field order remain. Scope-map reconstructs each original module through `original_module`: normalized web213/app22/plugin16/sync41/admin16/site4, original web174 plus30 literal project-system labels and9 literal cross-module labels. Those39 labels are reversible. Nonempty `gate_obligations` occurs on150 records; TODO's118 gated-policy rows are a different measure and are not substituted. EXECUTION uses top-level `items`, TODO uses `sections[].tasks`. Original933 evidence references plus exactly6 accepted TT-08 additions remain939; formal13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed. POMO-04 remains pending with no acceptance evidence.

Runtime/config/test parity is checked against P0 separately from documentation: the four allowed differences under apps/packages are TT08 `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md`. There is no whole apps/packages equality claim. All eleven conditional POMO product paths equal P0. Source2 retains original Appendix A/B byte-for-byte, S embeds complete source2 unchanged, and canonical §14 through its final Rules is preserved. The prior author's13213-byte trimmed extraction is checked from real section boundaries rather than assumed.

## 4. Actual source feasibility and protected boundaries

| Source finding | Review consequence |
| --- | --- |
| Real `main.tsx` runs SW registration/observability before StrictMode/AppProviders/Router and imports full CSS | Preserve actual main startup with pre-import observation and an untouched-main paired control. Async imports, cache and setup failures are real outcomes. |
| AppProviders live non-null config creates real auth SDK, DeviceSessionBridge, TodoWebRuntimeBridge and deletion recovery | A real local HTTP transport with exact schemas/headers/queries and all auxiliary effects is feasible evidence architecture. Mock context or config=null cannot qualify managed generation behavior. Actual consumed SDK bytes and controls remain prerequisites. |
| AccountStorageGate synchronously locks scope, clears Todo globals/OAuth and hosts public PomodoroSessionHost above routes | Route removal and account invalidation differ. Capture auth generation, business scope/epoch/generation, physical keys and actual first-frame owner transitions. Returning A creates fresh authority. |
| `sessionController.ts:134-215` captures scope and issuedAt and requests `xai:timer:<kind>:<account>:<generation>:pomodoro` | This established timer lock is distinct from closed canonical Task/Calendar activation. Genuine POMO queue proof must use it; no production activation toggle, fictional global hold or test seam. |
| Last observer cleanup at123-129 removes interval/listeners only | Same-account issued commands survive view/dialog/hook teardown. No under-lock UI cancellation token may be added under this review. |
| Hook reset86-93 uses current identity defaults and a `.then(setIdle)`; Module reset clears notice and has bare Reset | Frozen before must establish consequence/capture and stale UI gaps. Only later narrow captured-decision/result exposure may address them under an exact card. |
| Controller absent-active recorded-id no-op; same-id pending revision exception; pending/expiry before discard | Boolean success does not identify discard vs settlement/no-op. Independent raw bytes, identity and event/time oracles must establish the actual branch and truthful feedback. |
| End freezes issuedAt; discard tests expiry at lock grant; pending/history/cleanup are separate cuts | Preserve C1 memory-only unsaved intent, C2 durable pending, C3 saved history/failed cleanup, C4 conflicting-id refusal and first recordedAt. No crash promise for unpersisted C1 intention. |
| Public exports are package root and session-host only | Public App/UI evidence cannot be replaced by internal controller fixture success. Diagnostic internal reads may be declared as such but cannot become a public API grant. |
| Module legacy filtered history can appear empty; raw timer export catches setup/click failure | Unknown/unreadable is not valid empty. Caller-local status/error work requires a frozen defect; shared source API/schema changes require a separate finite protected-scope review. |
| Historical close/native fixtures directly activate scope/use internal controller/esbuild or incomplete supervision | Their actual accepted limited applicability remains; they are not managed-full-App qualification, new process counts, or newly observed business PASS. |

Original action: **明确Stop、Reset及中途离开的保存规则**. Original acceptance: **每个按钮的保存/放弃含义清楚；Reset不静默丢失用户以为已保存的记录**. Existing durable and POMO03 rules establish early Stop saves measured incomplete time, Reset discards only unfinished current activity, clean route departure does not pause, running reopen uses the original deadline and paused reopen excludes away time. No contradictory accepted authority requiring a new owner question was found. Accepted six-preference recovery alone never closes this full caller.

The eleven paths are conditional ceilings, not present grants: Module; useTimerTick; sessionController; scoped styles; existing Module/hook/durable tests; owning api/design/test/dev_log docs. Keys/schema/protocol/accountMigration/preferences/shared storage/auth/device/events/host/App/coordinator/router/shell/tokens/readers/lockfile/config and all originals remain protected. Preference recovery never acquires account timer/history ownership. No new owner, cancellation, rollback, away-time, cloud-sync or completion policy is selected.

## 5. Full fifteen-row case-to-emitter review

All proposed row families must become finite source-expanded case identities, actual command/mode arrays and exact artifact slots before source approval/execution. Scope-state controls, not merely nominal action names, decide applicability; unavailable/hidden controls require source-backed dispositions, not fabricated tests. Expected product failure cannot absorb transport/startup/precondition/acquisition failure.

| Row | Complete retained oracle and producer obligation |
| --- | --- |
| P04-01 | EN/ZH normal/fullscreen actual controls distinguish Stop/save, Reset/discard, Pause/Continue, exit-view and preference discard; idle/running/paused/pending/unavailable/C3 truth. host/scenario/acquisition plus native/focus on changed controls. |
| P04-02 | Independent25s + paused300s +35s inputs yield60000ms incomplete history, list1:00/Statistics1m, unchanged completed counts/streak and old sentinel. Zero/paused End controls, actual readers and durable old units retained. |
| P04-03 | Running-unexpired/paused/idle, consequence/Stop alternative, confirm/Cancel/Escape, no implicit pause, one-shot scope/id/revision and all L1-L8. Cancel effects attributable against time-equivalent controls; native live focus and unchanged prior history. |
| P04-04 | Focus/short-break/long-break on-time/late expiry and queued End vs Reset: deadline/id/elapsed/completed/first recordedAt, committed next preset/no auto-start, break exclusion. Controlled clocks are distinguished from actual close time. |
| P04-05 | Start/pause/resume/discard denial; C1/C2/C3/C4; malformed/denied history/active/foreign generation/missing locks. Exact fault boundary throws/raw reads/write/delete/events; Retry/error/recovery truth, no duplicate or fabricated empty source. |
| P04-06 | Route/remount and reload; running/paused close1-reopen1-close2-reopen2 in the same durable profile with new actual PID/start/document/loader. Forced loss at C1/C2/C3, complete owned process/descendant absence and original durable expectations. |
| P04-07 | All six real preferences across pending/failure/conflict/changed-unchanged uncertainty/same-value successor; completion-next-preset. Latest-operation and sibling protection; no preference-attributed timer/history writes. |
| P04-08 | Real production App first intent for rail/POP/back/forward/programmatic/same-turn, route/signout ordering and rail then Appearance veto; Stay/Escape/export/discard/all-success/release once, zero non-live blocker calls/runtime transition errors. |
| P04-09 | Nonempty A/B/locked/A scope/epoch/generation/tombstone and complete transition first-frame, ghost/export/queued/UI lifetime including L1-L8. Device drafts survive with fresh permission; old intent denied without banning fresh A reconciliation. |
| P04-10 | Two real same-origin documents, native held/pending lock query and product-origin request; End/End, End/expiry, Start/Start, stale pause/Reset/frozen Retry/winner and fresh success. Stable id/first recordedAt, no surrogate writer. |
| P04-11 | Actual disk for pomodoro-preferences.json and pomodoro-recovery.json, distinct schemas/ownership, raw active/history/memory cuts and six-value memory export. Denied/truncated/wrong-owner/absent download plus Blob/URL/append/click and synchronous owner-change controls; guard stays and cleanup/error truthful. |
| P04-12 | Actual FocusRecordList/Overview/Statistics/StatPomos/CmdK before/after projections, unknown/range/local finishedAt limits and zero reader writes. CmdK configured duration is not elapsed proof; DASH06 owns count scale. |
| P04-13 | Actual full App/CSS, five widths375/414/768/1024/1440, EN/ZH all changed states/normal/fullscreen/dialog/error/themes; pet-hidden-after-resize/pet-on, Topbar/overlays,44px controls, containment/overflow/occlusion/hit testing and genuine menu200. Raw screenshots plus independent visual judgment. |
| P04-14 | Trusted Tab/ShiftTab/Enter/Space/Escape once-only actions on every new control/state and meaningful live focus return. Whole-document injective census/forward-reverse cycles and every focused/moved-on capture; qualified pixel method and passive key audit, no nativeVirtualKeyCode. |
| P04-15 | Every row/lane/producer/artifact/original failure/full canonical item maps to immutable source, qualification, before, fixed, integrated, affected/native/vendor/full fresh acceptance receipts. Missing dependencies cannot yield aggregate PASS. |

## 6. L1-L8 lifecycle review

| Case | Source-consistent required distinction |
| --- | --- |
| L1 | Cancel/Escape/closure/replacement/route-hook disposal/account invalidation before dispatch revokes captured decision; zero old command/writes/deletes/events, repeat inert, valid live focus. |
| L2 | Valid already-issued End/confirmed Reset/Retry behind real timer lock survives same-account UI teardown; pause/Continue are lifetime controls. Existing End time/WAL/expiry rules still determine business result; obsolete UI callback inert. |
| L3 | Captured authority invalidated before grant by account/epoch/locked/generation/tombstone denies old command at actual guards. Fresh returned-A reconciliation is separately attributed, never old-capability revival. |
| L4 | Different id or ordinary same-id revision rejects without recapture/rebase; winner remains, new action live. |
| L5 | Same-id pending revision exception settles frozen row; otherwise Reset grant-time expiry settles at original deadline. End issuedAt/frozen Retry, stable id and first recordedAt remain; different pending id rejects. |
| L6 | Absent active plus recorded expected id is existing successful no-op, no new row/delete. Replacement active rejects and conflicting settlement refuses. Feedback cannot claim a discard. |
| L7 | After actual durable success/failure, stale hook/account/decision/session/presentation cannot set idle/notice/focus; durable success is not relabelled cancelled/rolled back. Removed id need not remain active to acknowledge removal. |
| L8 | Fresh scoped actions after rejection/disposal/return work; no poisoned old Retry/intention, duplicate or blanket reconciliation suppression. |

The paired control preserves initial raw bytes, elapsed time, lock release, retained host and independently authorized competing actions. This makes zero effects an attribution assertion, not an impossible permanent freeze of A. Capture is at dialog opening; consume once before dispatch; no fresh default identity at confirm; authoritative grant/write guards remain. A future result seam must identify no-op/settlement/discard without changing the controller algorithm.

## 7. Finite candidate, actual controls and quiescence

The twenty proposed ADDs under `docs/reviews/audit-parallel-pomo04-runner-source-r1/` form a coherent finite source boundary: launch.mjs, supervisor.mjs, source-gate.mjs, driver.mjs, fixture.tsx, host-fixture.tsx, auth-transport.mjs, scenarios.ts, case-table.json, native-adapter.mjs, acquisition-adapter.mjs, focus-adapter.mjs, disk-adapter.mjs, vite.config.mjs, qualification-runner.mjs, qualification-controls.test.mjs, execution-manifest.json, qualification.md, inputs.sha256, source.patch. The full-index/binary patch includes the other19 files and excludes only itself. This review does not create them or authorize skeletons, wildcard helpers or new product exports.

The host plan requires real managed SDK/HTTP schemas, password/refresh/user/logout, register/heartbeat/Todo nonce/deletion effects, delayed A-after-B negatives, new non-null document/loader ready and actual main controls. Acquisition must cover timer text, six values, both exports and host/source labels, synchronous transient same-node/detached changes with semantics-preserving forwarding, native default actions/React controlled paths and actual loss/unsupported controls. Observer/Profiler/rAF alone cannot prove same-turn wrong-owner property writes. Consumed source/config/root capture must be substantiated before a dependent source card; design approval alone cannot manufacture it.

Exact original-to-case/lane/producer/artifact/terminal mappings are required, with common source/admission/actions/effects/transitions/raw snapshots/errors/stdout/stderr/result and typed native process/key/context/capture, disk content, close-cycle and focus-census slots. Missing/late/truncated interrupted slots are missing, not unused; successful closed-cycle unused reservations need census proof. No wildcard names, collision, placeholder bytes, fake PNG or unlisted output. Preserve all original emitters and reuse only with exact applicability.

Qualification must exercise actual archived Vite/React/SDK/root/cache and source-resolution controls, malformed pre-parser input, wrong source/lock/export/loaded closure, resource replay, child nonzero/signal/premature long-lived exit0, late stdout/stderr/retained descriptor, CDP errors, delayed journals/fsync/terminal writes, missing loader, failed download and surviving descendant. Generic dummy/JSON controls cannot qualify the real integration. Bind Node/pnpm launcher and implementation/git/tar/Chrome/osascript, PATH/env/cwd and ownership, destination bytes/transforms/CSS/assets/browser conditions and dynamic closure. No Node-only resolver or blanket node_modules hash substitutes.

Root reserves immutable outer allocation/card/adoption/lineage/budget/resource identities and real stdout/stderr before inner parsing/import. An inner wx file is not root anti-replay. One enclosing deadline includes archive/setup/auth/Vite/browser/menu/action/drain/finalize with reserved teardown. Supervisor registers and joins owned processes/tasks/FDs/writers/sockets; TERM/KILL only proved owned descendants, retains late tails and failures. Promise.race is not cancellation. Terminal complete status follows process exits, both stream EOF/close and file write/fsync/close reconciliation; actual unjoined resources mean QUARANTINED_UNJOINED provisional evidence, not complete immutable PASS. No missing outer machinery may be silently implemented by root while recording adoption.

Native/focus retains pipe transport, trusted keys/drags, no nativeVirtualKeyCode, actual app/full CSS and ownership revalidation at resize/reload/display/menu changes. Preserve frozen full method/context/probes/decoder, signed distance/band/interior/outside exclusions, font/animation waits, six captures120ms/two identical frames,120 double-rAF and <0.01 CSS alignment. Real Retina/full-vs-clip/scrolled controls and actual menu200/effective viewport precede use. Rectangles, outline CSS, emulated zoom, resampling or fabricated hue cannot replace method qualification and independent screenshot judgment.

## 8. Permanent histories, local holds and complete downstream order

All106 artifacts are retained: departure Astra36/author2/independent18/native27; durable11/independent6; preference3; Statistics3. They are not106 launches. Original before failures, e1/990 expanded rejections, summary/raw duplication, native geometry-only false confidence followed by containment failure, empty unload build refusal/diagnostic, package/host/disk/process results and unknown exits/probe status remain permanent. Raw logs are read and bound individually below; no lifetime completeness or retroactive cap3 compliance is inferred.

Source comparison supports only a genuinely new pre-action Reset consequence/Cancel/captured-confirm/Stop-versus-Reset/leave disclosure purpose after root classification and source qualification. Mixed older durable/native/export/close/package/F1/consumer units inherit all old formal/probe/calibration/refusal histories; new actor/path/label does not start0/3. Accepted4868d0a controller/protocol/hook/host,2962b49 Module/preference hook/styles andab94f84 list/counters support local byte applicability only; older394efad Module differs. No host/dependency equivalence follows.

Clock retention3/3 and visual3/3 exhausted, M8 and REL unknown lifetimes, and canonical activation remain local dependency holds. No fourth attempt or standard waiver is granted. POMO's native timer lock remains usable in principle but needs actual source-qualified admitted commands with complete permanent histories; it is not licensed by this approval. Original Q1/B70/F1 counters and M+G+B qualification/root adoption/full original before/two-CSS geometry/independent acceptance/versioned baseline/E1-E5/full Clock chain remain.

The full canonical §14 is reproduced below, including E1-E25, every E24 row and final Rules. C-FB00210/10, OE26/26 and C-RD1 15/15 judge; frozen Appearance24/26 and Features13/15 plus diagnostic C-FD1 14/15 remain. Preserve all16 F1, Clockc1-c5, Header control/fixed/native18/Astra/Sol/refusal copies, AppRail8 modes+host, all full package/static/host/readers/storage and exact bounded native exclusions. Counts are inherited obligations, not new PASS.

Required order: independent complete impact review and root exact-hash conditional adoption; substantiate consumed-source/config/root/method prerequisites and register exact finite source; fresh source author/full independent source review; root complete-purpose/resource admission; real positive/negative/causal qualification and fresh review/root adoption; full valid unresolved original P0 before plus exact accepted reuse; fresh bounded implementation; independent same-oracle fixed AND integrated/affected/account/host/native/disk/visual/consumer/full G1; actual full different-vendor verification with raw receipt/refusals/cost; fresh non-author full Astra acceptance; root evidence-only reconciliation preserving formal states and prior evidence; fresh inventory and root remote preservation/ancestry/sync. No implementation before full valid before and no partial caller acceptance.

## 9. Cost and closeout limits

Review2/3; one actual static pass1/1. Prior failed pretool attempt1/3 remains staticUNRUN/actual checker0. Machinery author remains1/3/static1PASS; its deterministic closeout allowed-undefined/no-files, absent-path staging refusal and literal unchanged-buffer write remain documented, not a semantic rerun or qualification. Runtime/tests/build/typecheck/lint/browser/native/server/qualification/probes/vendor/child launches are0 each. Provider billing/token totals unavailable, not zero. No product module/runner/test was imported or executed.

One read-only lookup guessed nonexistent machinery contract.md (chunk0ea5ac, exit1); immutable source stat identified impact.md. Several long displays were truncated and supplemented by targeted reads plus full-byte corpus reads. These are discovery issues, not actual checker retries. Memory was used only to locate the prior control-plane/caller-versus-formal distinction, then current authority was verified; no historic memory verdict is accepted.

All immutable inputs and both full output buffers are validated before any filesystem write. The one static pass checks scope, clean parent, original ledger/order, parity, full prefixes/logs/canonical/appendices/candidate mappings and current authority. On failure it stops with no semantic retry. Exact-path staging, whitespace/diff checks, command-local disabled-hook commit and mechanical final hash/clean checks complete closeout. Push/fetch/sync-check/integration/global writes/product repair/method adoption are unrun. Output/commit hashes and actual checker PID/session/chunk/exit are supplied externally to avoid self-reference.

**Final disposition: APPROVED full conditional technical basis; zero requested author corrections.** Root may receive/preserve and decide exact conditional adoption. Unmet source and qualification prerequisites remain holds on their descendants; no source author4 or product/runtime/method grant, new owner question, full caller acceptance, release or formal312 closure follows.


## 10. Single concluding static receipt

PASS1/1, documentary integrity only. Exact corpus statistics: {"candidate_paths": 20, "canonical_section_trimmed_bytes": 13213, "checker_pid": 89940, "conditional_product_paths": 11, "gate_obligations_nonempty": 150, "inherited_bytes": 108571852, "inherited_records": 2979, "inherited_unique_git_blobs": 2575, "inherited_unique_identities": 2979, "logs": 106, "original_rows": 312, "todo_gated_policy_rows": 118, "total_bytes": 112233874, "total_records": 3007, "total_unique_git_blobs": 2589, "total_unique_identities": 3007}. All raw prefixes, individual hashes, source/parent identity, full appendices/canonical Rules, all106 logs,15 cases/L1-L8/20 candidate paths and11 conditional paths passed. Both complete buffers were constructed and validated before the first write. The checker PID above identifies this command; outer tool chunk/session/final exit are reported externally. Runtime and qualification remain UNRUN.

| Frozen input | SHA-256 |
| --- | --- |
| S impact.md | 9729f7dc8947f232d1c431c99d7a31685fe792ba568f5a92303cb9def398e417 |
| S inputs.sha256 | 23e10b817761e949e9b7cbf97e851afd20f79506d38c2630a5e7ba702d2961a9 |
| P review2 card | a29247f93ec58850dce36ee4c1541a7426ce2ea2bcd1d75be73eb07a366e0498 |
| P prior pretool failure receipt | 124396031a55e91f645f8bf68b8d72c122de796b51ff051b39b3d6e4fd201a8d |
| P current execution-state | b1d773845c9a764f4fddcc538f9794a1690c01fdf2fa136b7c458bcfaf620a39 |

## Appendix A. Full canonical Clock r2 section14 including Rules, verbatim

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

## Appendix B. All106 inherited raw logs: exact bytes bound, no launch-count inference

| Original path under docs/reviews | SHA-256 | Bytes |
| --- | --- | ---: |
| web-pomodoro-departure-astra/completion-0d7f885.log | 0caefa659065dbe55ed9ffac745533267e997a6856c2369ef6c157f158de834f | 574 |
| web-pomodoro-departure-astra/completion-2962b49.log | bec914b72688209f42526d18b181106dbb6252a45017f0b040dfb308419ea1f2 | 574 |
| web-pomodoro-departure-astra/completion-990ac52.log | ee1e9323ddafeffb7c8ce3e4b1ec5a180c2e64a37a9d8227cd95ed57c2e54cfa | 573 |
| web-pomodoro-departure-astra/completion-author-final-2962b49.log | e538ccc31f7820ee9b5879338c9e59f9dfdac99567c69ed9851e46ea3afbe84b | 574 |
| web-pomodoro-departure-astra/completion-e1a69fb.log | 0f6f18fe8a174ec58a18c6d11bf442402bfc1d6adee8c107430a2b45ecc4fd6a | 573 |
| web-pomodoro-departure-astra/completion-f1post1-f359be6.log | 26edb3ab901c480290a30be20f74e0623b47601937b30dfeffc2d2fff8d5cfc0 | 573 |
| web-pomodoro-departure-astra/completion-header-parent-c9a388d.log | d23a773b97e35f66e4e95fc5cf9ea2fd4d81e8e7f07eeb30a8582a9ec195da50 | 573 |
| web-pomodoro-departure-astra/completion-shared-retry-96c4915.log | 2475b3865b3701ee338a724150b36076ceb3536792d1ad6d5d1cafdecd281cee | 576 |
| web-pomodoro-departure-astra/draft-0d7f885.log | b2e1f25dcd69109f285a1aeec2dd9b55fbc8936fca3231fce68ff1f5e4ccd599 | 39736 |
| web-pomodoro-departure-astra/draft-2962b49.log | 55739ef46ff9fe574f2699a890ec15fd40e1d9a7b2206851ca97cb61f4730cf7 | 1021 |
| web-pomodoro-departure-astra/draft-990ac52.log | 8b4be1025d3c6601d495086a3f707b1b5474d550c6a68b2f0c61bce058181c2d | 444 |
| web-pomodoro-departure-astra/draft-author-final-2962b49.log | 8e5235ed8c9b35d00753f85957f9c5d5455126ec8aaefa42fb6e5aa4630727ab | 573 |
| web-pomodoro-departure-astra/draft-baseline-c604951.log | e6c368d9d74d51f17a07e9a314754a8a628c3a9c4d0e9dc26baec80f278bb585 | 12112 |
| web-pomodoro-departure-astra/draft-e1a69fb.log | 5bbaaa090e94a04bf7b898f9abdf1fa17efc324e246941389c0bd2318724fcf6 | 3238 |
| web-pomodoro-departure-astra/draft-expanded-990ac52.log | 98757dd92d2c66c088e61b104dbbcedf2be855edb6d3c8e97cf7edc2f0191e2a | 3552 |
| web-pomodoro-departure-astra/draft-f1post1-f359be6.log | afea810c0e9925ec5a4a89772a0a5c5dee045025bebc61d2532c98514ebca4d4 | 444 |
| web-pomodoro-departure-astra/draft-header-parent-c9a388d.log | 474823f5cd24e68759054852d91d02a2b5105ecc997f9ee0303b72cc6c610e4d | 445 |
| web-pomodoro-departure-astra/draft-mixed-followon-2962b49.log | 107bc5c94f86db794324cc508a9332f2af5d64f0f8512c7a13e524caa4b5f75b | 573 |
| web-pomodoro-departure-astra/draft-shared-retry-96c4915.log | 0f95ca780b1c289fb289afcf8cca086715cf5a196c00836906873fbccf108e4d | 812 |
| web-pomodoro-departure-astra/dv2-0d7f885.log | a970b66c6eead866b03583007d0414d0e9ffaffa34133d349ff33eb073d73cf7 | 41196 |
| web-pomodoro-departure-astra/dv2-2962b49.log | 9fb23709085094293ac560e60a369c06f8799df94a08a6d0ee1092078da38fe2 | 554 |
| web-pomodoro-departure-astra/dv2-990ac52.log | 67181bbe1d9e99bfeea73cb0dadf7f1cdee0397233eeb3784aa804e5fb281cc8 | 432 |
| web-pomodoro-departure-astra/dv2-author-final-2962b49.log | 84b2acb6690efde84c39e18e4c90987e27caf01421411e3af6a5a5a91f418fa4 | 432 |
| web-pomodoro-departure-astra/dv2-e1a69fb.log | aa4f84ea6f15c478d3ffb9615f8d41590348379681259b88025dfb4f44883186 | 432 |
| web-pomodoro-departure-astra/dv2-f1post1-f359be6.log | 84bb1f0f5a685344ef90e199671d71173358dd0494bc3da7cee6237c93d40c37 | 432 |
| web-pomodoro-departure-astra/dv2-header-parent-c9a388d.log | ccdf26b982e33d49afe0372c78f4ba09943406d8b15c791442bd1e4f52387ab4 | 433 |
| web-pomodoro-departure-astra/dv2-shared-retry-96c4915.log | 37cbe00256ff9d06e11b53c694eb7d227f9813a40b585df93394ade89773f382 | 669 |
| web-pomodoro-departure-astra/export-0d7f885.log | 34e4984d0c7ee99741ba281cc3520a7549172bbaf06befd4cdefabbbde6f37d0 | 1942 |
| web-pomodoro-departure-astra/export-2962b49.log | c91874489e29609f8ad67c81d94f82317bc4c3c28ad1fdb6e1de87d519b5b5a9 | 934 |
| web-pomodoro-departure-astra/export-990ac52.log | 4f2d8ecbe466baea81b0f7d0503afdbc39c2a5f0f2ace5aea9ffff73aa1f5583 | 933 |
| web-pomodoro-departure-astra/export-author-final-2962b49.log | 1d1a5d53ed3a77ddc06934cb384008d6a3769e2163181b3bce7b21c3dd4810aa | 933 |
| web-pomodoro-departure-astra/export-baseline-c604951.log | f8938c21cb7285cb91fe812cd3ca565c850005acb593d16a70c205cc64c50c03 | 8559 |
| web-pomodoro-departure-astra/export-e1a69fb.log | 51f2c4af4e78b1951d1fcf9a2e06b8c2bd03350ffe7d04485fa1cff5ec6b7322 | 1940 |
| web-pomodoro-departure-astra/export-f1post1-f359be6.log | 05fc953833b906b982a9da3717d2f88f295b0383ccfbc0e855d8e486192903b5 | 933 |
| web-pomodoro-departure-astra/export-header-parent-c9a388d.log | 697d6a134941d0b28c5ec8f525510a5942a6bebbba3d8b31468b187526f40d68 | 933 |
| web-pomodoro-departure-astra/export-shared-retry-96c4915.log | 4f9375fe6fc5da671c8e08b254254c31c8365df4699285c87fc33bb51852b393 | 1063 |
| web-pomodoro-departure-author/types-lint-author-final-2962b49.log | 9faf62f37345261d934732ed1395dc443d09cbc8d25cebaed9dc4905d0863cfa | 358 |
| web-pomodoro-departure-author/web-test-author-final-2962b49.log | 1b77e1baeba545ff225a5faa9b73fe98f3d4690494986f0f77a78e67102c12d7 | 135 |
| web-pomodoro-departure-independent/advanced-author-final-2962b49.log | 6438d314117f1fadf8248be96b5282ec2234e1a02fb9d08d0376fcf542b5a003 | 531 |
| web-pomodoro-departure-independent/advanced-baseline-c604951.log | adc68c060c3d93cbe40083ac240adf6e47d7efe901159e1ab824481700783561 | 82294 |
| web-pomodoro-departure-independent/advanced-f1post1-f359be6.log | 2cd06ee63ae2c15cfc3704c92433b18d4773e31d7c0ad44e290064d47336992e | 438 |
| web-pomodoro-departure-independent/advanced-header-parent-c9a388d.log | 0a3884ab8ce75ad7a7947acac204c5fb1fc4f18c501f4c3c4e6c11db35effb34 | 438 |
| web-pomodoro-departure-independent/advanced-parent-after-0d7f885.log | d652c79e144624f1588b8aaaf1c6c659e26f6f871f0b1b273b26d64dec817cc0 | 439 |
| web-pomodoro-departure-independent/advanced-parent-final-2962b49.log | e1b6f3a7f93d00591774c488535b244bf363d750b85b87bbf3916e225c1175f8 | 530 |
| web-pomodoro-departure-independent/advanced-parent-final-990ac52.log | 9fb77f7fc444c66ef5379a3c74f816ddc0cf889cc899b29ef102a259178ea93a | 439 |
| web-pomodoro-departure-independent/advanced-shared-retry-96c4915.log | c94145566de616ed933b77650d215d3b84e2dd1061450283ac09a731ee4235f3 | 800 |
| web-pomodoro-departure-independent/departure-author-final-2962b49.log | 560db48266b6b03c5382b53e3945e4ae1e572cf8b76187b8d513ed1b0ef67ccf | 441 |
| web-pomodoro-departure-independent/departure-baseline-c604951.log | f87fce4bcb0acc498db25120875f7875abedb43eee6eb0441b54606796746b78 | 3719 |
| web-pomodoro-departure-independent/departure-f1post1-f359be6.log | 86708154ba4b9d867105dcb3d85fb40e9b26b7805b24dbc3001df82c1a008261 | 439 |
| web-pomodoro-departure-independent/departure-header-parent-c9a388d.log | 396ac1af41b80a6d7c46879211fee5072652a6512344ba8c8a24e39ca704da08 | 440 |
| web-pomodoro-departure-independent/departure-parent-after-0d7f885.log | c806d9200b0b6d00065f1d3a581f747eae2c240bf835bf0cd0e9c780f1c10a63 | 440 |
| web-pomodoro-departure-independent/departure-parent-final-2962b49.log | af7e407c24ab33e576097b24519f05e4ad402d82c243a253e99f021b787e85f5 | 442 |
| web-pomodoro-departure-independent/departure-parent-final-990ac52.log | a3290c95c239657c86eb120a3672c76dbf5d7e5243a32b55199c0894f9a5f5ba | 440 |
| web-pomodoro-departure-independent/departure-shared-retry-96c4915.log | 8f30713f343f29846a2f17c09b3ef899caa65f6428f6f99a7613ef1c84bc6471 | 442 |
| web-pomodoro-departure-independent/package-f1post1-f359be6.log | ba42efbc2a81c97d248b10e98277ebdff17fff3e8dfeddddc6ce37a1a593f5db | 5062 |
| web-pomodoro-departure-independent/package-shared-retry-96c4915.log | 8d66fcf67fe48ab51b9c8dec9978d340491e3f2d68cf945783c261f8df2a2ac2 | 17533 |
| web-pomodoro-departure-native/native-0d7f885-containment-visual.log | e4509747d9da56d31fa578c00ef6ed08ee7c1a81a00f1286981ad5ce62ba3490 | 915 |
| web-pomodoro-departure-native/native-0d7f885-export-denied.log | d623d6ab0dfc0627f3945d8ea9607f33124debef12a12c06b56a2e4fab73817a | 407 |
| web-pomodoro-departure-native/native-0d7f885-rail.log | 42f32d3ab533c46f99178e4d065b1490462a5c1ceb9ca2c7bfe86ebfbc1df452 | 202 |
| web-pomodoro-departure-native/native-0d7f885-visual.log | ee5605c2bb0863c6239fe15161a0450d998fde23bdbef129ce3610898a372b38 | 3915 |
| web-pomodoro-departure-native/native-2962b49-conflict.log | 7800c8dd04170ce3f6bb4b6001f89aee39ed1e66c87ad15002dcaca830bdd553 | 523 |
| web-pomodoro-departure-native/native-2962b49-export-denied.log | 246df118a1f623fd7a03f47564c88294c7f303a705774aae6084175ddb0ab2dd | 407 |
| web-pomodoro-departure-native/native-2962b49-owner.log | f0ce7464d6af9548aa490b6040390dfb8fc71a5bd08fdde046c5bd281d3226b7 | 391 |
| web-pomodoro-departure-native/native-2962b49-pending.log | f5e3cd42ea6806d91e8ead5d29f218ff2cefcf71bf2149aca8bd3a3bca75dd31 | 395 |
| web-pomodoro-departure-native/native-2962b49-rail.log | 92d33571096a02665c481f40dcf9be203bada59fa32eaea78862ba4e4b95902c | 202 |
| web-pomodoro-departure-native/native-2962b49-route.log | f8a71ea7b08ec5f0a321a9a7e87b1e00b04d29722b8690c01f2651033b4082d0 | 204 |
| web-pomodoro-departure-native/native-2962b49-signout.log | 7a08904552c7d9491bee45c7e5044050e1f0fdf4cf42439f2b276aab7dca4cf4 | 208 |
| web-pomodoro-departure-native/native-2962b49-unload.log | eca77d3f986fdc0b90e3ccfcb88accf52f9f6231224e7200761837e29bfc33ac | 184 |
| web-pomodoro-departure-native/native-2962b49-visual-zh.log | a4e163a0c3e5186428c33369027620f3424a45a29d193adb51899a65d3ac3027 | 3990 |
| web-pomodoro-departure-native/native-2962b49-visual.log | dde1fe46c5d5dbcc2a4d69fa8bfa1662f673c137764e9bf95c56ca1f01941bdf | 4173 |
| web-pomodoro-departure-native/native-357d862-rail.log | 4ff0801c98121dc4ec883a46fc21c9c3e450bcbc10d5c85f185d1405f411f22e | 328 |
| web-pomodoro-departure-native/native-990ac52-pending.log | 9808df4bbda6c74e019a17ec8f13ee804df37eeb46bcea97413f0eb3a9f8b1ab | 395 |
| web-pomodoro-departure-native/native-b01b67c-owner.log | dc8be1ac931af628011c8c8bfb08e72b591bdffeb6ed00b094efe71b7d137957 | 391 |
| web-pomodoro-departure-native/native-b01b67c-pending.log | e80324c7794782c81f1f0e6f94dcd23083159a03467aebded0b665ff87d243b2 | 395 |
| web-pomodoro-departure-native/native-c604951-route.log | e03b8fcc8415ff4b0e47d705e5e74bac4a19103cd54ff1e69d8f394510f1bdb8 | 344 |
| web-pomodoro-departure-native/native-c604951-signout.log | 939b8e1f10a4adfc0d79b0de988e6dd687002e1e9dd74fcb317a17fad0e047ad | 296 |
| web-pomodoro-departure-native/native-c604951-unload-build-diagnostic.log | 01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b | 1 |
| web-pomodoro-departure-native/native-c604951-unload.log | e5645fb15e1960c65a5c1108d1165a4a5699759e7cafa14ba9aa01ca5c032fea | 254 |
| web-pomodoro-departure-native/native-e1a69fb-route.log | 4506e014a9de938c48bda5c77b54359ebfd512f90704a694007d0d02c7618d51 | 204 |
| web-pomodoro-departure-native/native-e1a69fb-signout.log | 4a0bdfe5745102c6df2ea2548a107d31a6684fc330a3d6fde63a8704355ec77e | 208 |
| web-pomodoro-departure-native/native-e1a69fb-unload.log | 311d86c407c9943326fcfef4d86e4a190bcc60b261c675fa7d7070a2ac9c8068 | 184 |
| web-pomodoro-departure-native/native-e1a69fb-visual-zh.log | f3d77e11aefa8fbbb1f05086d0a68bc471efcd50c93afb26859a5e1967df16b4 | 3974 |
| web-pomodoro-departure-native/native-e1a69fb-visual.log | 8d140d49138a0d69d8365fbf29150278f8118714131c85c0d0713df3ffdd4ea9 | 4213 |
| web-pomodoro-durable-session/20260909-before.log | a9e6301aa6e6b8adc1b247d4e83fd42c87e179b000ed2c57109b752daa55cd2e | 7741 |
| web-pomodoro-durable-session/20260909-host-bundle.log | c39aa30ee9f9bba8e0bc711c1becf3c16fee12d414aa8cbc983c69c621e74cfa | 93 |
| web-pomodoro-durable-session/20260909-native-before.log | 9fa5bb230386f259e2f626bdb400fa6bab1b272d880b937f9cf014aaad49db59 | 322 |
| web-pomodoro-durable-session/20260909-native-close-after.log | 2dd5a7fe18ab8b48f4748f0cb22d9fc6328842b670d2d6afd2d4fe128973b3af | 425 |
| web-pomodoro-durable-session/20260909-native-crash-after.log | 7e17550b241179ee9b4a2a37f55343d911b52cd491cd3f537b8700cdb59651c5 | 305 |
| web-pomodoro-durable-session/20260909-native-lifecycle-after.log | d042ae056ad0844c2c0215848cf490a2419ae0901a66bc13daec12b4259a4cc2 | 952 |
| web-pomodoro-durable-session/20260909-native-recovery-after.log | 9a55e98df52171273644322ad2a8d731eb4621a07eee356e032cd41237d2b6eb | 330 |
| web-pomodoro-durable-session/20260909-package-after.log | ddb4cfe095a2ad7c73247b7a08dafb08c8d7d2964f1339c650f32c98d03c4fab | 1450 |
| web-pomodoro-durable-session/20260909-reproduction-after.log | fce14b00a4410798edca572d1d6b4b75a179deb9bad3ae13614f3bf0065e9d53 | 364 |
| web-pomodoro-durable-session/20260909-storage-after.log | 0649386e11a248e67dcdc123da76d7aa3909f7e93614b649448a85582b97ef62 | 26378 |
| web-pomodoro-durable-session/20260909-web-after.log | d82f8331463b361ad3a88ac4f60cc519123800cf3db5cc363bb7f7fe6dd35565 | 2224 |
| web-pomodoro-independent/20260909-independent-after.log | 3d791d2dd55e97e8dec33f44d9f9d693d974c735bdedcc206b3cfcc3bfdb03c4 | 2682 |
| web-pomodoro-independent/20260909-independent-conflict.log | d5ee608e732564e90c529ead542452c8584ed855294669f79b301035c1197f8a | 2987 |
| web-pomodoro-independent/20260909-independent-paused-close.log | 172343f6f920c29da000bd5c218a6622bafe1a3b37772cb320fc09fca5fe6c12 | 1294 |
| web-pomodoro-independent/20260909-independent-whole-close.log | eba62151e8cfcc2f8947a93226c222978bdcaa8a16f37388b769da4aa860d87a | 1136 |
| web-pomodoro-independent/20260909-paused-close-after.log | 2337ef49e47351d4f56c8b2dc570f083883822e0c26abb3f573574b3915e431d | 1294 |
| web-pomodoro-independent/20260909-whole-close-after.log | aafd626797922273300eee00ac71238687576463d627520d700a61c72bf85aec | 1136 |
| web-pomodoro-prefs-independent/20260909-after.log | 055fb5a64074a775ac253ea1c29a70425ba441da4a833e3aba02af8882001556 | 3104 |
| web-pomodoro-prefs-independent/20260909-before.log | 8ee47c33468f164e9df89f7c3d63e43ab20db7d9bed46cda2f42f593b10e1d99 | 2547 |
| web-pomodoro-prefs-independent/20260909-download-after.log | e0d7a34b59e9fb3137016de92116074aa29877bf6f343a83d88a2b9f8dc5b0f8 | 2906 |
| web-statistics-time-independent/20260909-native-stat-after.log | 9d1c5c7bee6aca8d5052ae257b617300fcb2c46a0f7b3557014de2f4de96138f | 1198 |
| web-statistics-time-independent/20260909-native-stat-before.log | 08b9b14d8d41417ed8170da9ab7751e027520c13e24cb94faa06a36f157504a1 | 1098 |
| web-statistics-time-independent/20260909-original-stat01-three.log | 95abf2ff95250a58d23c4805fe3c599efd0141e928997176975a2e1f6e2614e3 | 380 |


## Appendix F. Exact single checker source (standard library and Git only)

Command: python3 -c, with this exact source as its one code argument and the two preconstructed document buffers plus immutable identity list on stdin. No shell interpolation or temporary source file. stdout/stderr and process close are awaited before closeout.

```python
import sys,json,subprocess,hashlib,re,os,base64,collections,pathlib
payload=json.load(sys.stdin)
wt=pathlib.Path(payload['wt']); P=payload['P']; I=payload['I']; P0=payload['P0']; O=payload['O']
os.chdir(wt)
def git(*args): return subprocess.check_output(['git',*args])
def sha(b): return hashlib.sha256(b).hexdigest()
def check(ok,why):
    if not ok: raise RuntimeError(why)
check(git('rev-parse','HEAD').decode().strip()==P,'HEAD drift')
check(git('status','--porcelain')==b'','dirty before static pass')
records=payload['records']; doc=payload['doc']; index=payload['index']
check(len({r['id'] for r in records})==len(records),'duplicate identity')
expected_index=''.join(r['hash']+'  '+r['id']+'\n' for r in records)
check(index.endswith(expected_index),'complete index buffer mismatch')
data={}; blob_ids=set(); totalbytes=0
cat=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
for r in records:
    ident=r['id']
    if ident.startswith('git:'):
        cat.stdin.write((ident[4:]+'\n').encode());cat.stdin.flush()
        header=cat.stdout.readline().decode().rstrip('\n').split()
        check(len(header)==3 and header[1]=='blob','missing/nonblob input '+ident)
        size=int(header[2]); b=cat.stdout.read(size); check(cat.stdout.read(1)==b'\n','cat-file boundary')
        blob_ids.add(header[0])
    else:
        check(ident.startswith('attachment:'),'unknown input identity')
        b=pathlib.Path(ident[len('attachment:'):]).read_bytes()
    check(sha(b)==r['hash'],'input hash drift '+ident)
    data[ident]=b;totalbytes+=len(b)
cat.stdin.close(); cat_tail=cat.stdout.read(); cat_err=cat.stderr.read(); cat_exit=cat.wait()
check(cat_exit==0 and not cat_tail and not cat_err,'cat-file did not cleanly close')
def inp(s,p):
    key='git:'+s+':'+p
    check(key in data,'unindexed input '+key)
    return data[key]
base='docs/reviews/'; root=base+'20260908-full-product-audit/'
card=json.loads(inp(P,root+'parallel-control-r1/task-pomo04-source-contract-r1.json'))
allowed=['docs/reviews/audit-parallel-pomo04-source-contract-r1/contract.md','docs/reviews/audit-parallel-pomo04-source-contract-r1/inputs.sha256']
check(card['allowed_files']==allowed,'allowlist differs')
check(card['fixed_input']==I and card['product_sha']==P0,'card identities')
check(all(not pathlib.Path(p).exists() for p in allowed),'ADD target exists')
prefixes=[('59dae0b524e19e6d0c273174488b84d68fb323f3','audit-parallel-pomo04-preparation-r1',2900),('0f2f5c1a155f8fda127758f7986010dd57335f21','audit-parallel-pomo04-contract-review-r1',2914),('9e2e6cf722171936dc8c085d588f0c047d968e92','audit-parallel-pomo04-preparation-r2',2932),('d75a0d6de0521abde0128339049bd860bc0ec7a2','audit-parallel-pomo04-contract-review-r2',2954),('a9054733b4f1179dac138b73031e3d0fd22b2416','audit-parallel-pomo04-source-machinery-impact-r1',2979),(I,'audit-parallel-pomo04-source-machinery-impact-review-r2',3007)]
all_lines=[r['hash']+'  '+r['id'] for r in records]
for s,d,n in prefixes:
    lines=[l for l in inp(s,base+d+'/inputs.sha256').decode().splitlines() if re.match(r'^[0-9a-f]{64}  ',l)]
    check(len(lines)==n and lines==all_lines[:n],'ordered prefix '+str(n))
for s,p in payload['source_outputs']: inp(s,base+p)
state=json.loads(inp(P,root+'parallel-control-r1/execution-state.json'))
check(isinstance(state['tasks'],list) and any(t['id']=='POMO-04/SOURCE-CONTRACT1' for t in state['tasks']),'dynamic task registration')
todo=json.loads(inp(P,root+'TODO.json')); original=json.loads(inp(O,root+'TODO.json'))
rows=[t for section in todo['sections'] for t in section['tasks']]
original_rows=[t for section in original['sections'] for t in section['tasks']]
check(len(rows)==312 and rows==original_rows,'original312 ordered fields')
scope=json.loads(inp(P,root+'parallel-control-r1/scope-map.json'))['items']
check([r['id'] for r in scope]==[r['id'] for r in rows],'scope order')
for row,mapped in zip(rows,scope):
    check(all((mapped['original_module'] if k=='module' else mapped[k])==v for k,v in row.items()),'scope field equality '+row['id'])
labels=collections.Counter(r['original_module'] for r in scope if r['module']!=r['original_module'])
check(labels=={'web（project-system）':30,'web（跨模块验证索引）':9},'39 original labels')
check(sum(bool(r['gate_obligations']) for r in scope)==150,'gate obligations (not policy count)')
execution=json.loads(inp(P,root+'EXECUTION.json')); old_execution=json.loads(inp(O,root+'EXECUTION.json'))
check({k:v for k,v in execution.items() if k!='items'}=={k:v for k,v in old_execution.items() if k!='items'},'execution metadata')
check([r['id'] for r in execution['items']]==[r['id'] for r in old_execution['items']],'execution item order')
for now,old in zip(execution['items'],old_execution['items']):
    if now['id']=='TT-08':
        check({k:v for k,v in now.items() if k!='evidence'}=={k:v for k,v in old.items() if k!='evidence'},'TT08 fields')
        check(now['evidence'][:len(old['evidence'])]==old['evidence'] and len(now['evidence'])==len(old['evidence'])+6,'TT08 only six append')
    else: check(now==old,'unallowed execution mutation '+now['id'])
counts=dict(collections.Counter(r['status'] for r in execution['items']))
check(counts=={'completed':13,'verification_pending':3,'in_progress':3,'pending':293},'formal counts')
check(sum(len(r['evidence']) for r in execution['items'])==939,'939 evidence references')
check(sum(len(r['evidence']) for r in old_execution['items'])==933,'933 original evidence references')
changed=git('diff','--name-only',P0,P,'--','apps','packages','package.json','pnpm-lock.yaml').decode().splitlines()
ttdocs=['packages/plugin-web-time-tracker/docs/'+n+'.md' for n in ['api','design','dev_log','test']]
check(set(changed)==set(ttdocs),'P0 parity exceptions')
s2=inp('9e2e6cf722171936dc8c085d588f0c047d968e92',base+'audit-parallel-pomo04-preparation-r2/contract.md').decode()
impact=inp('a9054733b4f1179dac138b73031e3d0fd22b2416',base+'audit-parallel-pomo04-source-machinery-impact-r1/impact.md').decode()
review=inp(I,base+'audit-parallel-pomo04-source-machinery-impact-review-r2/review.md').decode()
check(impact in doc and s2 in doc and review in doc,'complete source output appendices')
scope_section=s2[s2.index('## 6. Exact finite conditional product allowlist'):s2.index('## 7. Independent full business oracles')]
product_paths=re.findall(r'^\| `(packages/[^`]+)`',scope_section,re.M)
check(len(product_paths)==11 and len(set(product_paths))==11,'eleven conditional paths')
check(not git('diff','--name-only',P0,P,'--',*product_paths),'conditional product source drift')
candidate=['launch.mjs','supervisor.mjs','source-gate.mjs','driver.mjs','fixture.tsx','host-fixture.tsx','auth-transport.mjs','scenarios.ts','case-table.json','native-adapter.mjs','acquisition-adapter.mjs','focus-adapter.mjs','disk-adapter.mjs','vite.config.mjs','qualification-runner.mjs','qualification-controls.test.mjs','execution-manifest.json','qualification.md','inputs.sha256','source.patch']
check(len(candidate)==20 and all(n in doc for n in candidate),'twenty machinery candidates')
check(all('P04-'+str(i).zfill(2) in doc for i in range(1,16)) and all('L'+str(i) in doc for i in range(1,9)),'15 rows/8 lifecycle cases')
canon=inp('8bf613962517ee9b80bf51373e8ad88960c570cc',base+'web-dashboard-clock-recovery-contract/contract.md')
check(sha(canon)=='214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae','canonical full hash')
ct=canon.decode(); start=ct.index('## 14. Required evidence checklist');end=ct.index('\n## 15.',start);section=ct[start:end]
check(section in doc and '**Rules.**' in section and '**E24 rows**' in section,'full canonical section/Rules')
check(all('| E'+str(i)+' |' in section for i in range(1,26)),'all E1-E25')
logs=re.findall(r'^\| (web-[^|]+\.log) \| ([0-9a-f]{64}) \| (\d+) \|',review,re.M)
check(len(logs)==106,'full106 raw log census')
check(all('`'+path+'`' in s2 for path,h,n in logs),'source2 full106 log mapping')
for path,h,n in logs:
    hits=[r for r in records if r['id'].endswith(':'+base+path) and r['hash']==h]
    check(bool(hits) and all(len(data[r['id']])==int(n) for r in hits),'log binding '+path)
bundle=json.loads(inp('05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d',base+'audit-parallel-shared-source-byte-collection-r1/source-bytes.json'))
embedded_bytes=0
for ent in bundle['entries']:
    content=ent['content'];b=content['data'].encode('utf8') if content['encoding']=='utf8' else base64.b64decode(content['data'],validate=True)
    check(len(b)==ent['byte_count'] and sha(b)==ent['sha256'],'embedded byte source '+ent['logical_package_path']);embedded_bytes+=len(b)
check(len(bundle['entries'])==104 and embedded_bytes==7993322,'partial source byte inventory')
check(git('rev-parse','HEAD').decode().strip()==P and git('status','--porcelain')==b'','final prewrite parent/scope')
stats={'checker_pid':os.getpid(),'result':'PASS','static_pass':1,'records':len(records),'unique_identities':len(data),'unique_git_blobs':len(blob_ids),'input_bytes':totalbytes,'inherited_records':3007,'logs':len(logs),'original_rows':len(rows),'gate_obligations_nonempty':150,'todo_gated_policy_rows':todo['gated'],'evidence_references':939,'formal_counts':counts,'conditional_paths':len(product_paths),'machinery_candidates':len(candidate),'canonical_section_bytes_actual':len(section.encode()),'embedded_source_files':104,'embedded_source_bytes':embedded_bytes,'runtime':0}
receipt='\n\n## Appendix E. Single concluding static integrity receipt\n\nPASS1/1; source-contract author1/3. Documentary integrity only; source admission and all runtime/qualification remain HELD/UNRUN as above. All inputs and both complete buffers were validated before the first output write. Actual receipt: '+json.dumps(stats,ensure_ascii=False,sort_keys=True)+'.\n'
doc_bytes=(doc+receipt).encode('utf8');index_bytes=index.encode('utf8')
check(doc_bytes and index_bytes and all(p in card['allowed_files'] for p in allowed),'both full buffers before write')
outdir=pathlib.Path(allowed[0]).parent;outdir.mkdir(parents=True,exist_ok=False)
for name,buf in zip(allowed,[doc_bytes,index_bytes]):
    with open(name,'xb') as f: f.write(buf);f.flush();os.fsync(f.fileno())
print(json.dumps({'stats':stats,'outputs':{allowed[0]:sha(doc_bytes),allowed[1]:sha(index_bytes)},'bytes':{allowed[0]:len(doc_bytes),allowed[1]:len(index_bytes)}},ensure_ascii=False,sort_keys=True))
```


## Appendix E. Single concluding static integrity receipt

PASS1/1; source-contract author1/3. Documentary integrity only; source admission and all runtime/qualification remain HELD/UNRUN as above. All inputs and both complete buffers were validated before the first output write. Actual receipt: {"canonical_section_bytes_actual": 13214, "checker_pid": 38180, "conditional_paths": 11, "embedded_source_bytes": 7993322, "embedded_source_files": 104, "evidence_references": 939, "formal_counts": {"completed": 13, "in_progress": 3, "pending": 293, "verification_pending": 3}, "gate_obligations_nonempty": 150, "inherited_records": 3007, "input_bytes": 122634845, "logs": 106, "machinery_candidates": 20, "original_rows": 312, "records": 3031, "result": "PASS", "runtime": 0, "static_pass": 1, "todo_gated_policy_rows": 118, "unique_git_blobs": 2601, "unique_identities": 3031}.
