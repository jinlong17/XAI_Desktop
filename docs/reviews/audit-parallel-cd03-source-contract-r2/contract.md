# CD-03 complete source contract r2

**PROPOSED / NEEDS FRESH WHOLE INDEPENDENT REVIEW.** This is author2/3 of the new technical source-contract phase, from the root-adopted complete conditional impact basis. It is not implementation, method adoption, qualification, a product-write grant, caller acceptance, or a product-owner decision. No author4 is authorized.

## 1. Immutable authority and complete obligation

Module web; workflow A under the sole A-Codex root. Fresh author /root/parallel_a_cd03_source_contract_r2. Sole writable checkout /Users/lijinlong/.codex/worktrees/audit-parallel-cd03-source-contract2-20261010/XAI_Desktop. Direct parent 2d68848094b9e24744a97f74be0c11496f7c4334; fixed input 61b6644d2eac5af6c70749bf672839ba7ba79bca; P0 f9eb4b1f207bc4b46f547b90afc250424b3c8695; original O e041c2bc293b70db367444c62c4300231976dbf7. No moving-head repin. The requested Astra role is not provider attestation or actual cross-vendor evidence.

Exact approved technical basis: b5e6843bce9a6feb62afb6c451451e626b51c999 complete impact and a8a75d15c9c482547e50905dc237344c9b49d9c2 complete independent review. Original full preparation 2a35488361bfbad596473fc355bd18d8feb5b164 and review fda069eb300704f24384eccacfd74ffc147aef37 remain binding. Full inherited 5857/5807/3351/3326 identities and shared2808 plus DASH649 are retained, not sampled. Appendices contain the complete impact and review, including the full prepared fourteen rows and original review. Their historical headings remain historical. Root adopted their complete conditional basis at fixed I; no title or subset substitutes for it.

AGENTS.md, CLAUDE.md, project workflow/multi-machine rules, CURRENT-CONTROL-PLANE, original goal attachment, authority overlay, goal-A and task-cd03-source-contract-r2.json govern. The task is in dynamic execution-state.tasks (a LIST) plus its exact card; the initial task-registry is not required to duplicate later registrations. Only contract.md and inputs.sha256 in this directory may be added. All other paths, global ledgers, original evidence and other worktrees are protected. Specific no-push and zero-runtime card overrides generic child handoff commands; root alone preserves and integrates the original commit, pushes, checks ancestry and sync.

Original CD-03 action and acceptance remain verbatim in Appendix A. Existing date-difference/no-reminder authority supports continuation without a new owner question. No JOB, reminder, recurrence, completion, date algorithm, CD01/CD02 deduplication, storage schema or account policy is introduced. Mounted preset merge may update hidden/deleted dates and attempt persistence; custom elapsed cards may overlap current/history. Restore may move date and must say to check it. Missing target_time retains local-midnight behavior despite the older end-of-day comment. Calendar-day and absolute remainder assertions stay distinct; CNY fallback is approximate, not astronomical proof.

All312 original fields/order and evidence remain. Scope-map module is normalized web213/app22/plugin16/sync41/admin16/site4; original_module has web174 plus exact Unicode project-system30 and cross-module9 labels, and the same other modules. The39 reversible labels are checked in original_module, not normalized module. Nonempty gate_obligations150 is not the118 gated-policy count. EXECUTION.items preserves original933 ordered references plus six accepted TT08 additions=939, formal13 completed/3 verification_pending/3 in_progress/293 pending. CD-03 stays pending with evidence[]. P0 runtime parity and the four TT08 owning-doc deltas are separate; no whole apps/packages equality claim.

Author1 sole static command failed at stdin109, chunk b94d30 exit1 (0.300388792s), on the wrong literal-label Counter over normalized module. Full hash loop, canonical checks, buffers, all writes and terminal cat-file drain were UNRUN; no artifact/commit exists. The53479-character memory draft is not an input artifact. Failure receipt b701c0e3bce274a4115fe659119549fb0c43993b5d14a5a9e1a1cc0d5e56f338 remains. This author has one actual concluding static invocation; pre-tool text construction is not a checker launch. An actual failure freezes this task without retry.

## 2. Exact S-CD public read-only surface

The selected additive domain is exactly xai_countdowns. Storage imports only its own scope, codec and bus helpers; it never imports Countdown internals. Countdown passes a stable owning predicate through its public storage import. No arbitrary key, injected storage backend, controller, setter, Retry, reset, seed, migration or repair parameter is exposed. DASH sessions-only drafts confer no CD API.

Proposed named exports from packages/plugin-web-storage/src/index.ts, implemented only in the new internal/useCountdownPrefSource.ts:

```ts
type CountdownSourcePredicate = (value: unknown) => boolean;
type CountdownSourceReason = 'ssr' | 'locked' | 'stale-owner' | 'deleted'
  | 'marker' | 'access' | 'decode-or-null' | 'root' | 'required-row' | 'predicate';
type CountdownSourceBase = Readonly<{ key: 'xai_countdowns'; owner: AccountScope;
  physicalKey: string | null; observation: number }>;
type CountdownPrefSource =
  | (CountdownSourceBase & Readonly<{ status: 'absent'; raw: null }>)
  | (CountdownSourceBase & Readonly<{ status: 'valid'; raw: string; value: readonly unknown[] }>)
  | (CountdownSourceBase & Readonly<{ status: 'invalid'; raw: string;
      reason: 'decode-or-null' | 'root' | 'required-row' | 'predicate' }>)
  | (CountdownSourceBase & Readonly<{ status: 'unavailable'; raw: null;
      reason: 'ssr' | 'locked' | 'stale-owner' | 'deleted' | 'marker' | 'access' }>);
function readCountdownPrefSource(predicate: CountdownSourcePredicate, owner?: AccountScope): CountdownPrefSource;
function useCountdownPrefSource(predicate: CountdownSourcePredicate): Readonly<{
  source: CountdownPrefSource; refresh: () => void
}>;
```

AccountScope is the existing public type. Optional owner defaults to accountScope.capture(); it cannot select a different current identity. observation is an in-memory monotonically increasing sample identity, never a storage revision or CAS token. The valid branch deliberately exposes unknown[] rather than claiming that admission has normalized all optional V2 fields. Every branch is a fresh immutable observation; no raw bytes are copied into logs. Valid value is a recursively frozen JSON-only tree derived from the single observed raw string. Raw is never reconstructed from normalized values. Result identity is memoized by the hook snapshot store until a real reread; getSnapshot cannot allocate endlessly.

Ordering: capture owner and browser availability; capture localStorage access inside try; assert current object identity; require account/demo, nonempty accountId/generation; read tombstone and committed-generation marker; validate hasCommittedGenerationMarker; resolve physical key through unchanged accountScope.physicalKey; read that physical key ONCE; decode with unchanged decode('json', raw); classify; recheck current identity, tombstone and marker before publication. Compare marker bytes as well as generation validity across the observation; changed marker invalidates even if generation text matches. A failed final ownership/access check discards any raw/value and returns unavailable, never leaks the previous owner data. Tombstone is accountPrefix(owner, demo)+'deleted'; committed marker is generationMarkerKey(owner, demo); physical record is generationKey(accountId,generation,'xai_countdowns',demo). Neither isReady nor a captured key alone proves ownership.

raw=null from a successful getItem means absent. JSON parse failure and JSON null both become decode-or-null under the existing decoder; do not pretend to distinguish them without new parsing. A nonarray decoded root is root. A false whole-array predicate is required-row; a thrown predicate is predicate. All exceptions are contained into the declared classification, with no raw-value error string, browser Error object or diagnostic record exposed. Predicate failure cannot escape render. Invalid readable raw can be exported only while same-owner reads/markers remain valid. Unavailable exposes no stale raw. SSR does not access window/localStorage, returns stable unavailable/ssr from the hook's server snapshot; refresh is a no-op there. No read synchronously writes or emits business events.

Owner predicate in new internal/countdownSource.ts is exported locally as isCountdownSource(value: unknown): boolean. It returns Array.isArray(value) && value.every(current owning isCountdownCard). Its acceptance is exactly normalizeCountdownCard's required-record predicate. Nonnull objects suffice; no prototype/plain-object, nonwhitespace-ID, unique-ID or stricter time/schema condition is added. id is a nonempty string; title.en/title.zh strings may be empty; target_date passes the current regex and local Date round trip. Variant normalizes to light if not image/light; light requires literal null cover_url, image requires a string (empty accepted). Dates in years0-99 retain the existing round-trip behavior. Required-invalid invisible rows invalidate the whole source. No partial filtering or normalized-array rewrite is authorized.

Optional target_time invalid becomes null; category defaults custom; color/icon/style defaults depend on normalized category; invalid start_date becomes today's local date; note/string timestamps/default created_at, boolean flags, finite sort_order/MAX_SAFE_INTEGER, layout stacked, status active, source custom, optional preset/deleted strings all retain their current normalization. Unknown extras remain in raw. No optional coercion or stricter rejection beyond current code. isCountdownCard may issue existing DEV diagnostics; this proposal adds no raw logging and does not alter protected validate.ts. Parity tests bind admission at a frozen now, compare required/optional variants including invalid unknown-enum+null cover and numeric/string booleans, and confirm raw byte preservation. Normalized projection uses existing merge only after valid/absent; it never asserts raw optional fields already satisfy CountdownCard.

Hook triggers are mount, same-tab public bus invalidation, native storage, accountScope publication, visible return and explicit refresh. subscribeSameTab receives the logical xai_countdowns plus captured owner (it resolves physical keys itself). A denied subscription is not marked bound: once readable, rebind, then reread after subscribing. Native StorageEvent uses captured storage identity acquired in try, ignores sessionStorage and unrelated keys/accounts/generations, handles key=null clear, exact value/marker/tombstone keys. Event newValue is advisory only. On identity change render synchronously masks old source; disposal tokens prevent any old callback/error publication. Mount/read-subscribe-read and validity restoration require actual qualification. Raw native same-tab writes outside public bus have no promised immediate event; explicit refresh/visibility provides the finite recovery trigger. No polling SLA, cross-tab transaction, arbitrary ABA or atomic multi-key claim.

Recovery consumes this observation for truth while retaining usePref solely for its existing captured setter. Valid/absent allow existing projection and reconcile. Invalid/unavailable disable new mutations and automatic preset reconcile; show capability explanation plus source-error state, never empty-history/saved/zero-card claims. The held latest controlled editor and original raw baseline survive read-only refresh. Refresh cannot call Retry, seed defaults, clear pending, replace latestDraft or release save/departure guards. After recovery, saving still requires owner/current marker, original raw baseline and editor identity. A changed raw baseline stays conflict even if the new source is valid. Retry retains action IDs; actual writes remain synchronous existing setPref semantics, not a new queue/CAS/lock.

Backward proof covers all old barrel exports/types, SSR/import behavior, all legacy usePref/usePrefAsync/storage/migration/export/delete consumers, absent/empty/V1/V2 normalization and no-write event counts. Focused source tests must spy on set/remove/owner commands/bus, denial after first read, owner switch inside predicate, marker change, tombstone, native clear, cross-tab and denied-key rebinding. These are later tests, UNRUN now; P0 before cannot import an absent future API and silently pretend to test it.

## 3. Captured export, actual event boundary and disk truth

Proposed package-local signature: exportCountdownDraft(input: Readonly<{ snapshot: () => unknown; latestDraft: unknown; assertCurrent: () => void; isMounted: () => boolean }>): Readonly<{ handoff: 'attempted' | 'blocked' | 'failed'; cleanup: Promise<Readonly<{ anchorRemoved: boolean; revokeAttempted: boolean; failures: readonly string[] }>> }>. The helper may throw a bounded setup failure before it owns resources; the caller catches and publishes only to the same still-current mounted instance. No browser/disk success result exists. snapshot's actual typed recovery payload remains version1/kind/countdown-unsaved-change/stored/pending. Export JSON remains {recovery, latestDraft}, filename countdown-unsaved-change.json, JSON MIME and pretty two-space encoding. No invented wire revision.

Obtain one same-owner recovery snapshot and latest controlled draft, serialize once after ownership checks, and retain immutable serialized bytes; never reread B. A readable invalid raw string is preserved exactly in stored; denied read aborts. Pending includes original kind/next/baseline and latestDraft is independent. Assert owner/marker before and after snapshot/serialization/Blob/URL/anchor creation and each href/download setter, immediately before invoking click, and inside the owned target click listener before default action. isMounted must be checked at the same boundaries; ownership assertion includes actual committed marker, tombstone and captured object identity. Product helper creates one detached anchor; **no appendChild is selected in this contract**. Thus inherited append fault is conditional NOT-APPLICABLE-with-source-proof for this exact helper, not a skipped required actual path. Changing to attached anchor requires an exact source-contract amendment and append controls.

Owned target listener uses preventDefault on stale owner/disposal and records local blocked status; no global event-handler or account coordinator change. The exact actual click primitive, event bubbles/cancelable/composed/defaultPrevented, target listener order, detached-path behavior and native default activation must be acquired in qualification. The listener is necessary but not a universal atomicity claim. A wrapper that changes owner before delegating to the actual native click must encounter the target guard and be canceled; a switch before helper preguard must avoid invocation entirely. Inject an additional actual click handler that changes owner AFTER the owned listener but before default activation as a separate qualification negative. If it still downloads, record STALE_DEFAULT_ACTION and HOLD the stronger CD03-07/09 assertion; do not call this post-handoff or accept a weak helper. Source/config closure must prove whether that path is reachable in the genuine product environment before a bounded implementation grant. This contract does not authorize arbitrary monkeypatch exclusion as a waiver.

Native handoff is the irreversibility boundary. DownloadWillBegin correlated with the exact action/URL/document/guid is evidence of handoff, not disk completion. A switch only after actual activation cannot recall captured A bytes and cannot be labelled cancellation. A wrapper that switches after calling native click has a different causal order from a handler before its default action; logs must retain both, not infer order from a pre-click guard or click return. No promise to cancel all future files after signout, no B read, no second dispatch, no automatic retry, no cleared B error/pending and no save/guard release. Unsupported atomicity remains a named full-row blocker for independent adjudication.

Resource ownership begins immediately at each allocation. Finally schedules URL revoke once (1000ms from completed/failed dispatch, preserving current delayed lifetime) and removes the target listener; detached anchor has no DOM parent but any unexpectedly attached owned anchor is removed only when ownership is proved. Cleanup timer is joined by the evidence supervisor; revoke throw is retained as cleanup failure, never successful revoke. Setup/click/owner error cannot bypass URL cleanup. Handler/default action faults, cleanup promise rejection and delayed timer errors remain separate. Never mask primary failure with cleanup failure. Route disposal/Cancel/scrim/Escape/reload/process death preserve current in-memory draft-loss limits; no durability/route-guard/import promise.

Disk oracle: root reserves an empty per-action directory; record actionId, owner identity, captured generation, document/loader, export URL, download GUID and expected filename. Browser.setDownloadBehavior eventsEnabled and downloadWillBegin/downloadProgress are acquired through the owned pipe. Wait for actual completed state and zero partials, enumerate exact file-count delta, lstat then open with nofollow/regular-file/containment checks, read once and hash/parse bytes. Validate latest title/note/full draft, stored raw and pending baseline/identity. No payload.json is fabricated on missing file. Correlate response and final bytes; wrong GUID/old file/canceled/denied/partial/delayed/wrong payload are targeted negatives through the same path. Product cannot observe general destination/disk outcomes and never reports download complete. External disk evidence does not add a product acknowledgement API.

## 4. Exact conditional path scope

All eleven original paths plus twelve additive candidate paths are enumerated in Appendix A section5 and its embedded original section6: exactly23 unique paths. The additive set is storage internal/useCountdownPrefSource.ts, storage index.ts, storage __tests__/useCountdownPrefSource.test.tsx, four xai-web-persistence-contract owning docs, Countdown internal/useCountdownSaveRecovery.ts, internal/countdownSource.ts, internal/exportCountdownDraft.ts and the two local helper tests. The eleven original Module/CardView/Dialog/styles/three tests/four owning docs stay finite. No path is currently writable except this card's two ADDs.

Module and existing Dialog/tests need an explicit semantic amendment for S-CD error/refresh/export integration beyond the old copy-only grant. The later implementation card selects a finite needed subset of23 and names exact behavior per path; enumeration alone grants nothing. Existing validator/types/math/presets/reducers/registration, generic storage/getPref/usePref/usePrefAsync/codec/registry/scope/lifecycle/export/delete, App/providers/router/startup, configs/manifests/lockfile, notification/JOB/SW, shared CSS/tokens/Clock and originals stay protected. No broad package equality claim, test seam in product or capture hook is introduced. Shared storage barrel/docs writes serialize with DASH; Countdown semantics serialize with CD01/CD02/REL05. Integrated SHA has its own applicability review.

## 5. Whole public managed host and real HTTP contract

Source-only machinery contains exactly the eighteen files enumerated below under docs/reviews/audit-parallel-cd03-machinery-r1/. It must implement complete lanes after prerequisites are supplied and reviewed. A permanently refusing required lane is not source completion. Public-host imports archived AppProviders from apps/web/src/providers/AppProviders.tsx and router from routes/router, public Countdown registration via shellRegistrations, original full CSS/tokens, React StrictMode and RouterProvider. It preserves main.tsx order registerServiceWorker then bootstrapObservability then createRoot.render. Untouched archived main is the correspondence control; no fullscreen fixture, private provider, direct accountScope.activate as managed transition, config=null or mock-authenticated lane proves business acceptance.

AppProviders resolves VITE_WEB_AUTH_MODE=live (or absent), VITE_SUPABASE_URL loopback admitted base and VITE_SUPABASE_ANON_KEY disposable fixture anon value, detectSessionInUrl=false, persistSession=true, autoRefreshToken=true. No actual credential is read. Instrumentation freezes MODE/DEV, RELEASE, observability consent/DSN and cache/profile roots. DEV unregister/cache deletion is acquired; production local build preserves /sw.js load registration as a distinct admitted mode. Observability initializes its real controller/transport and web-vitals dynamic import before/after render effects; swallowed promise errors require actual request/work/import record, not only unhandledrejection or ready selector. All production imports precede none of the prelude.

Managed auth uses the actual createAuthGenerationClient and consumed SDK browser condition. Logical session key is session; SDK storageKey is xai.auth-client.v1:<encoded baseKey>:<encoded auth generation>; -user reads map user; -code-verifier is transient sessionStorage gated by pkce-participant. Unsupported SDK keys and unsupported user writes retain existing errors. Auth lease generation/owner and business accountId/generation/epoch are separate. Public createCandidate, setSessionItem, publish establish only initial disposable fixture. Actual coordinator/UI sign-in/signout owns later A-locked-B-A, expiry and deletion. Both accounts have nonempty distinctive records plus legacy/other-generation/other-account sentinels; demo is separately labelled and never substitutes.

Admission config must freeze actual consumed SDK method/path/query/body/header/response source closure. Proposed finite service rows: POST /auth/v1/token?grant_type=password with email/password; POST token?grant_type=refresh_token with refresh_token; GET /auth/v1/user; POST /auth/v1/logout with actual SDK scope query; existing actual device POST /rest/v1/rpc/device_register and device_heartbeat with Authorization Bearer, X-Device-Id, X-Sync-Version, Content-Type and body {device_id}; success2xx,401 unknown_device and403 device_revoked with actual parsed code/error/message. SDK rows are candidate contracts pending byte-proven exact forwarding/config, not claims that package version proves request schemas. Missing source fields block source grant, never generic all200 fallback. Session responses require actual SDK consumed access_token/refresh_token/token_type/expires_in/expires_at/user fields with consistent owner and timing; malformed, expired, wrong-owner and stale-A responses are qualification controls.

Keep DeviceSessionBridge, AccountDeletionRecoveryBridge, TodoWebRuntimeBridge and retained PomodoroSessionHost. Todo with declared crypto metadata uses real POST /rest/v1/rpc/fn_grant_nonce_lease, p_account_id/p_key_id/p_count(default128), device-bound headers plus X-Account-Id/apikey for matching origin. Accept source-defined array-first-row/object payload with encryption_device_id numeric-text and lease_start/lease_end nonnegative; errors stay recorded despite catch. Baseline without crypto metadata is explicit and does not prove the nonce branch. Auth/device/Todo/observability/SW traffic each has cause and owner attribution. Unknown outbound origin/method/path or hidden auxiliary failure refuses complete host admission. Service is a local disposable remote-boundary specimen, not production backend qualification.

## 6. Source module signatures, ownership and sealing

All following are proposed source contracts, not existing exports. Each asynchronous method takes immutable Context {registration, sourceClosure, resources, journal, deadline, abortSignal, capturedOwner, phase}; it returns joined work receipts or throws a typed nonzero LaneFailure. No module forces exit0. No module may mint root admission/adoption or mutate product. Entrypoint imports only builtins until outer receipt checked.

| Exact source file | Export/signature and contract |
| --- | --- |
| manifest.json | Version1 JSON: full P/I/P0/O/source/review/adoption hashes, product candidate subset,18-path source set, acquisitionContract, hostConfig, resources, command and permanent-unit maps, limits and prerequisites. No unknown field silently defaulted. |
| cases.json | Full C01-C14 concrete IDs, phase/source tuples, factors, expected business result, emitting mode/files and obligations, including blocked/reused records. No regex-only declaration in delivered machinery. |
| controls.json | Full Q01-Q18 paired positives/faults, cause hook, actual effect counter, rejection and raw-output relation; imports all sharedA01-A14 and original acquisition controls with source hashes. |
| inputs.sha256 | Complete immutable requested/resolved product/original/third-party/tool/fixture/canonical identities. Consumed closure is independently recorded at each actual run. |
| source.patch | Binary full-index ADD patch for the other17 exact files, complete18 manifest and self-exclusion rationale; actual reconstructed bytes equal sources. No circular self-hash fiction. |
| README.md | Exact admissible commands/modes, prerequisites, source review, purpose histories, lifecycle/error and output schema. No permission via example. |
| root-supervisor.mjs | export async function run(envelopePath); sole CLI validates reserved root envelope then admits one declared command/phase/control, supervises/seals. Actual process.exitCode follows result only after drain. |
| archive-command.mjs | export async function acquireArchive(ctx, fullSha); export async function snapshotDependencies(ctx, closure); real archive/tar streaming and captured-once bytes/destination hash. |
| local-services.mjs | export async function startServices(ctx, hostConfig); returns immutable origins plus stop():Promise<exit receipts>; real bound HTTP request validation, explicit state machine and fault cause. |
| public-host.tsx | export function mountObservedPublicHost(container, capture); starts real public composition with declared passive marks; returns unmount receipt. No alternative auth provider. |
| passive-prelude.js | export function installPrelude(config, sink); returns restore():receipt and stickyFailure():record; synchronous pre-import interception with original descriptor semantics. Installed as addScriptToEvaluateOnNewDocument before navigate. |
| transition-capture.js | export function attachTransitionCapture(ctx, publicSources); returns flush/close promises; epoch ledger joins prelude, public scope, React commit, DOM/rAF and native event channels without relabelling. |
| native-driver.mjs | export async function runCase(ctx, caseRecord); finite mode dispatch and real trusted pipe-CDP input/route/time/lifetime/account/copy acquisition. Reject undeclared mode/case. |
| download-observer.mjs | export async function observeDownload(ctx, action); returns handoff/disk/cleanup receipts from actual CDP+filesystem only; no intercepted Blob-only PASS. |
| focus-adapter.mjs | export async function qualifyContext(ctx, specimen); export async function walk(ctx, caseRecord); frozen-compatible full focus successor, actual native zoom/calibration and pairs. |
| command-lane.mjs | export async function runCommand(ctx, commandRecord); argv/env/cwd fixed, actual child/streams/closure/exit, no shell-eval arbitrary command. |
| qualification.mjs | export async function runPair(ctx, controlRecord); positive and actual fault share acquisition and terminal cleanup; validates intended rejection, not any nonzero. |
| evidence-index.mjs | export function reconcile(obligations, artifacts, histories); export async function seal(ctx, receipt); verify every ID/hash/purpose and no unjoined writer before final index. |

Proposed CLI: node docs/reviews/audit-parallel-cd03-machinery-r1/root-supervisor.mjs --envelope <root-reserved-absolute-json>. Envelope contains exact phase (qualification|before|fixed|integrated|affected), lane (native|command|qualification|receipt-import), mode, case/control/command ID and immutable sources. There are no hidden default run-all, alternate wrappers or automatic retry modes. outputBase derives only from reserved resource record; workdir is owned checkout/archive. A matrix expansion does not multiply permission: every actual process and child unit consumes its historical purpose admission.

Root must reserve capture and emergency channels before supervisor parsing/import. Existing outer capture executable/path/hash, actual stdout/stderr descriptors, root launch/PID/start/ancestry and journal are prerequisites; local wx alone is not global anti-replay. Missing root capture stays HOLD, not a planned source3 skeleton. Root supplies no inferred auth by creating a directory. Full requested/resolved Git SHA, streaming archive byte counts, git/tar exits, dependency read-only root, package aliases/export conditions and consumed tool/cache/environment closure are bound. Read consumed third-party bytes once, copy and hash destination; mutable package versions and a lock hash alone are insufficient.

Each run has one monotonic total deadline covering bootstrap through final writes, cleanup reserve and owned resource table (PID/start/pgid, CDP pipes, server/listeners/ports, browser profile/download dirs, files/descriptors, workers/timers/promises). Child acknowledgement precedes product work. Stop prevents new scheduling then joins/terminates owned groups only, bounded TERM then KILL, drains actual stdout/stderr EOF and preserves late errors. Server/browser premature exit0 is failure; archive/build exit0 has different meaning. Promise.race timeout is not cancellation. Descendant-retained pipes, idle CDP error, late parser event, pending download and write/fsync/close failures prevent COMPLETE. Quarantine/UNKNOWN cannot be promoted by renaming. Root hard crash/disk failure does not create invented durable proof. Source receipt and outer joined process/streams must both exist before adoption.

## 7. Complete finite C/K/Q relation and method holds

Appendix A section7 is retained in full and fixes every C01-C14 factor, file emitter, modes and positive/negative. Required phase set is before/fixed/integrated, with affected mappings for changed dependencies. cases.json IDs deterministically encode all factor values, not numerical gaps: C01-<lang>-<surface>; C02-<datecase>-<zone>; C03-<preset>-<visibility>-<write> plus edit-date/edit-time; C04-<action>-<write> plus overlapping-expiry/restore boundaries; C05-<lifetime>-<pending>; C06-<permission>-<setting>-<dnd>-<expiry-or-reopen>; C07-<transition>-<cause>; C08-<source>-<initial-or-recovery> plus denial-rebind/other-key/clear; C09-<setup-or-owner-or-disk-cause>; C10-<rawkind>-<lifecycle> plus cmdk; C11-<lang>-<theme>-<width>-<zoom>-<surface>-<pet>-<topbar>-<overlay>; C12-<lang>-<theme>-<surface>-<zoom>-<direction>-<stop>; C13-<K-or-E-command>-<mode>; C14-<external-receipt>. Source delivery expands these into literal unique records; a manifest with only family titles fails review.

C01=12 base tuples; C02=32; C03=42 plus2 edit cases; C04=16 plus4 explicit expiry/restore cases; C05=8; C06=32; C07=25 (five transition families by five causes); C08=24 plus denial-rebind/other-key/clear controls; C10=16 plusCmdK. C09 includes stable, each Blob/URL/anchor-create/setter/click/raw/revoke/disk fault, switch after snapshot/Blob/URL/before click, inside click before and after target guard, native-default ordering and after-dispatch; append is source-qualified inactive only for the detached helper. C11 surfaces are five views/editor/save-error/source-error/empty-history=9, two Topbar states and two overlays; its full Cartesian count=2880. C12 surfaces are five views/editor/error=7;2languages*2themes*7*2zooms=56 walks, each forward/reverse with N0..139 bounded per-stop acquisition, actual cycle proof and independent census. No fake PNG fills unused slots. Each omitted unreachable stop needs source/native reachability proof; an unexpected reachable141st stop fails, not silently truncates.

The base table cannot infer selected widths/themes/control deltas cover every other tuple. Many-to-one artifact reuse requires explicit compatible source/cause/phase/geometry mapping and independent approval. Every obligation emits source.json/events.jsonl/result.json plus its complete named outputs from Appendix A. Missing/canceled files remain explicit failed/unrun/blocked records with raw cause, never invented payload/screenshot. C14 imports only independently produced actual vendor/acceptance/root/inventory/remote receipts; this machinery cannot self-issue them.

K01 pnpm --filter @repo/plugin-web-countdown test; K02 same filter typecheck; K03 lint. K04 pnpm --filter @repo/plugin-web-storage test; K05 check-types. K06 pnpm --filter @repo/web test; K07 check-types; K08 lint; K09 build. K10 pnpm --filter @repo/xai-web-cmdk test; K11 check-types; K12 lint. K13 pnpm --filter @repo/web-auth-device-session test; K14 check-types. Exact argv arrays and cwd/env/source fields are stored, no invented storage lint. K09 is local build only. These commands and their child units inherit existing purposes.

Canonical E1-E25 plus every E24 row and full Rules are copied verbatim below through the immutable prepared source. Full F1 sixteen mode invocations, Clock c1-c5, Header18native/host/Astra/Sol, AppRail eight modes and parent/selfcheck/rail, all affected package/storage/readers/settings/host suites remain. evidence-index maps actual historical command/source/mode/env/archive-copy diff/fixture hashes and raw stdout/stderr to each E obligation. Where exact argv or complete history cannot be recovered from retained receipts, mark COMMAND_OR_HISTORY_HOLD; never emit a fabricated command or waive an E row. This source contract admits no execution while that hold persists.

Q01 source/SHA/lock/export resolver; Q02 streamed archive late-failure/tar/capacity; Q03 real Vite/SDK/browser-condition/cache/path closure; Q04 public managed auth/expiry/malformed/401/403/staleA; Q05 actual marker/tombstone/denial/bus/native/rebind; Q06 whole synchronous first-frame capture; Q07 genuine reload/new IDs; Q08 date/time seam/real visibility/no-job attribution; Q09 actual quota/latest draft/Retry/action IDs; Q10 real setup/click/default-owner ordering; Q11 actual disk negative set; Q12 Retina/menu200/crop/wrong coordinates; Q13 full focus census/pixels/stability; Q14 trusted once-only keys/late errors; Q15 actual early exit/pipe-descendant/TERM resistance; Q16 malformed/truncated/oversize/unknown-id/idle/late CDP+EOF; Q17 actual partial/zero journal writes/fsync/close/late-writer/pre-ack death; Q18 full enumeration/vendor/adoption/replay/unknown/exhausted refusal. Each requires a normal real acquired positive and exact fault through the same path with cause counter, expected rejection code, underlying raw output and independent cleanup result. A manipulated result JSON or unrelated failure cannot qualify.

Shared final f667a0b + bdc06bd review are conditionally adopted at I only as five-row design basis. Actual consumed ReactDOM instance-tracker forwarding, SDK source/config/endpoint closure and existing root outer capture are still prerequisites. Later byte collection outside fixedI is not silently imported or adopted here. Unknown or missing bytes are HOLD; installed versions are not proof. Synchronous capture must preserve own/inherited descriptors, native receiver/brand, arguments without coercion, return/throw identity and one delegation; native group/reset/default ordering, detached subtree/fragment history, reentrancy and sticky loss channel. A01-A14 causal pairs from the full shared review remain mandatory; MO/Profiler/rAF/final snapshots alone fail.

Frozen bacdbbc whole file/block/pixelFocusWalk identities and original decoder/hue/scroll/timing/predicate remain. Independent consumed-source/native-focus-context qualification is required: real Retina CSS/raster mapping, actual View-menu200 on owned PID/start/window/tab, revalidation after every reload/resize/scroll/display/zoom, target full/crop equality, whole forward/reverse injective descriptor census, shell/pet/Topbar/overlays and every per-stop focused/moved pair. No CSS zoom, DPR override, synthetic gradient, tolerances relaxation or self-approved screenshots. Native keys use pipe/isTrusted/passive audit/no nativeVirtualKeyCode; drags trusted only. Shared final-author3 exhausted/ noauthor4 and missing-method holds remain. Closed canonical Tasks/Calendar activation is not a Countdown queue.

## 8. Historical purposes, zero execution and full next gates

Permanent registry fields for each future invocation: purpose/unit, exact original command+mode, source/config, all launch/refusal/probe/child IDs and duplicated-artifact relation, historical completeness source, consumed and remaining cap3, proposed actual command, phase/case/control, admitted envelope/resources, actual PID/start/parent/streams/exit and cost. Unknown totals remain null/HOLD, never0. The original REL05 before/fixed author+independent launches are at least four overlapping save-recovery launches; JSON and same-directory runner stdout are paired observations. Keep author7groups/independent8groups, package128/14, owning110/115/118/host135 and initial restore fixture correction. New disclosure/source truth/mid-export predicates are genuinely new narrow proposals only; mixed execution inherits old native/package/storage/visual units and cannot reset them.

Full canonical histories remain: C-FB00210/10 judging, OE26/26 judging beside frozen24/26, C-RD1 15/15 judging beside frozen13/15 and predicted C-FD1 14/15 judging nothing. AppRail eight mode counts26/31/21/18/24/22/33/123, parent31, selfcheck165, rail104; F1 sixteen invocations, Header native18 and capacity-refusal copies. Original refusal and exact diff to judging/capacity/product-delta copies are retained. No immutable original is overwritten.

Clock correction REVISE R1-R6/UNQUALIFIED remains, retention3/3 exhausted145assertions41/42cases final14/14/55, Q1focus1/3 other six0/3 development2/83. B70native12/6432/development40/4884/visual3/3 exhausted/focusEN2ZH2/F1formal2/180 development3/302. Full seven-unit qualification, freshQ2/rootadoption, complete validP0before, exact-two-CSS M+G+B geometry/G2G3/versionedbaseline/E1-E5 and full original fixed/final remain. No fourth renamed actor/unit/path attempt is created.

Next requires fresh whole independent review of this entire proposal, root adoption of exact hashes, prerequisite source/config/capture closure, exact finite source-writer card, complete real machinery and independent source review, lawful per-purpose qualification with causal controls and root adoption, complete valid original P0 before, fresh bounded implementation within explicitly granted candidate subset, unchanged-oracle full fixed/integrated/affected/native/trusted-keyboard/visual/G1 evidence, actual different-vendor review, fresh non-author Astra complete original caller acceptance, sole-root unchanged-state evidence append, inventory and remote ancestry/sync. Missing ReactDOM/SDK/root capture/focus/history holds block dependent lanes; they neither waive full rows nor stop unrelated work. No new owner question is needed by the established no-reminder rule.

Current costs: source-contract author2/3; exactly one concluding standard-library/Git-only static pass permitted. All runtime/tests/typecheck/build/lint/browser/native/server/qualification/probes/vendor/children/push/fetch/sync=0. No product module/runner imported or executed. Read discovery guessed two missing AppProviders/config paths and corrected to actual providers/AppProviders.tsx and client.ts; oversized output was truncated and critical sections reread. These are read-discovery mistakes, not static reruns. Hash validation covers whole immutable corpus, not semantic acceptance of every historical byte or image. No source qualification, API implementation, disk/native proof or vendor acceptance is claimed.

Both complete output buffers and every input hash/scope/canonical constraint are validated before ANY output write. Actual static failure stops all later steps with no retry. Final process PID, invocation, session/chunk/exit, manifest counts and exact output hashes are supplied by the external receipt to avoid self-reference.

## Single static integrity receipt

All 5940 immutable identities verified; total bytes 223318222. Full5857/5807/3351/3326/shared2808/DASH649 and sharedreview2863 retained. All312 ordered original fields,39 reversible labels,939 current evidence and13/3/3/293 unchanged. Runtime boundary differs only in four accepted TT08 owning docs. Exact canonical fullsection14/E1-E25/E24/Rules present verbatim. Cat-file input closed, stdout/stderr EOF and actual exit0 observed before buffers/writes. Author2/3/static1 of1; all runtime categories0. PID 91770; command CD03-SOURCE-CONTRACT2-STATIC1. Final tool session/chunk/exit and output hashes are external.

## Appendix A - complete immutable impact, including original preparation and review

# CD-03 source machinery and protected dependency impact r1

**PROPOSED / NEEDS FRESH FULL INDEPENDENT TECHNICAL REVIEW / UNADOPTED.** This proposes a complete source-feasible evidence system and finite protected exceptions for the full original CD-03. No product, runner, source API, host, qualification, runtime or rerun permission follows from this document. The root adopted only the full conditional documentary contract; no fourteen-row subset can close CD-03. No new owner question, reminder, recurrence or date policy is proposed.

## 1. Identity, authority and unchanged scope

Module **web**; project-system technical prerequisite, workflow A; sole A-Codex root. Fresh author `/root/parallel_a_cd03_machinery_impact_r1`, requested Astra role; configured model is not provider attestation or actual cross-vendor evidence. Sole checkout `/Users/lijinlong/.codex/worktrees/audit-parallel-cd03-machinery-impact1-20261010/XAI_Desktop`.

| Binding | Exact value |
| --- | --- |
| Dispatch parent P | 7b890e0f027c5a1d258954bfc002731b23950c15 |
| Fixed input I | 04797e39f0a6c42051601207f0429deef3300a6a |
| Product P0 | f9eb4b1f207bc4b46f547b90afc250424b3c8695 |
| Complete conditional preparation | 2a35488361bfbad596473fc355bd18d8feb5b164 |
| Complete independent documentary review | fda069eb300704f24384eccacfd74ffc147aef37 |
| Canonical Clock r2 | 8bf613962517ee9b80bf51373e8ad88960c570cc |
| Canonical contract SHA-256 | 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae |
| Lockfile SHA-256 | df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9 |
| Original scope O | e041c2bc293b70db367444c62c4300231976dbf7 |

Card `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-cd03-source-machinery-impact-r1.json` authorizes exactly this report and its adjacent input manifest. AGENTS, CLAUDE, shared workflow, multi-machine rules, original goal, authority overlay and goal-A were read. Specific no-push/zero-runtime card governs this child; root must preserve the commit remotely, integrate, verify ancestry and sync. No sibling worktree is read or written.

Original CD-03 action **定义重复/到期动作及是否提供提醒**; acceptance **无后台动作时明确只是日期差展示；新增提醒接JOB统一机制**. Original fields/order of all312 and original939-current evidence relationship remain unchanged: original933 entries plus the accepted6 TT08 entries; formal **13 completed /3 verification_pending /3 in_progress /293 pending**,299 unclosed. CD-03 pending, evidence[] empty does not mean historical invocation count0. TODO uses actual `sections[].tasks`; EXECUTION uses actual `items[]`. Parent clarified an initial dispatch prose filename error before the concluding pass. Scope-map retains all original_module values and exactly39 changed mappings: raw literal `web（project-system）`30 and `web（跨模块验证索引）`9, never ASCII-rewritten labels.

P0→P under apps/packages/package.json/lockfile has only four accepted Time Tracker owning docs: `packages/plugin-web-time-tracker/docs/{api,design,test,dev_log}.md`. Runtime/test/CSS/host/storage/config/package/lockfile parity is separate from document delta; **the entire apps/packages tree is not claimed equal**. Fixed input and parent documentary governance can differ only as the explicit task registration; there is no moving-root repin.

Appendix A preserves the full prepared contract verbatim (its historical PROPOSED heading is its authored state, superseded only by root's fixed documentary adoption). Appendix B preserves the full review. Thus all14 rows,11 conditional paths, complete canonical §14 E1–E25/E24/Rules and complete inherited restrictions stay present, not a title-only dependency list. All3351 review identities, including all3326 source identities, are rehashed in the single concluding pass. Additional shared-impact and DASH review input sets are retained, but neither grants CD implementation.

## 2. Actual source and precise technical gaps

The only external Countdown entry is `@repo/plugin-web-countdown` via public index/registration. Actual shellRegistrations registers /app/countdown and child route; App owns providers, rail, Appearance, CmdK, pet and shared statuses. Countdown is not feature-toggleable. No private provider, direct owner-internal fixture import, fake authenticated context, runtime feature activation or Countdown fullscreen fixture is admissible.

`CountdownModule` samples wall clock at60000ms and visible return, and removes both on unmount. Its todayKey effect merges presets and attempts a recovery mutation; display also merges. All create/edit/delete/pin/hide/duplicate/restore/reorder writes use `useCountdownSaveRecovery`; existing setPref compares before synchronous writes. There is no Countdown async lock queue to borrow from Tasks. The owning types, math, preset and reducer algorithms remain fixed, including local midnight fallback, DST calendar-day/absolute-remainder distinction, overlapping visible/history past cards, dynamic hidden/deleted preset dates, approximate post2036 CNY fallback, and explicit Restore's date bump.

The authoritative no-reminder rule permits truthful capability copy; it does not imply that inaccessible data means empty, saved or zero. Existing `usePref` calls getPref and readRawPref separately; denied reads and parse failure return defaults, isDefault can be true on denial, invalid event payload may fall back, and previous state is masked while account is not ready. Registry xai_countdowns is schema1/json/default[]/owner xai-web-countdown and account-owned. `readRawPref` catches everything as null. `decodeStoredPrefValue` is internal, and JSON codec parsing is not whole-card validation.

Recovery captures one accountScope object. key() asserts current and resolves a physical key (which checks locked/account/generation and tombstone); persist compares original raw baseline and parsed shape with rawCards. This rejects stale owner and many conflicts, but does not give display a coherent source result. Mixed invalid arrays can pass raw equality while merge filters their invalid rows; same-byte normalization is not proof of preserved malformed input. Rendered merged presets are not durable save evidence. `accountScope.isReady` alone does not validate committed-generation bytes. Host AccountDataGate checks the marker and remounts on kind/id/generation/epoch, but a consumer must not call a swallowed raw fallback an ownership proof.

Required-record admission must match current `normalizeCountdownCard`, not invent a stricter schema: nonnull object, nonempty string id, object title with both string en/zh, round-trip-valid YYYY-MM-DD target, variant normalized with light fallback, then light requires cover_url null or image requires string. Optional V2 fields are normalized/defaulted, not all rejected: target_time invalid→null, category/color/icon/style/layout/status/source default, start date fallback, booleans/defaults, finite sort_order, strings/timestamps retained as currently handled. Plain-record helper is actually nonnull object, not a new plain-prototype restriction. Whole array.every(current predicate) must reject any invalid required row, including one outside the currently visible history. Empty array and truly absent source are valid cases; JSON null, wrong root and mixed required-invalid rows are not. No Date.parse policy, unique-ID rewrite, optional-field strictness, deduplication or migration rewrite is proposed.

Current export builds JSON with recovery.snapshot()/latestDraft, Blob, URL, detached anchor click, then delayed1000ms revoke. There is **no appendChild in current product**; append is a proposed transport cleanup choice and its fault case must be labelled proposed. snapshot checks owner before its raw read, but no owner recheck follows Blob/URL/anchor setup or click; a thrown click can leak its URL because cleanup is scheduled only afterward. Browser click return is not actual disk completion. Account-data export intentionally permits captured owner records after auth changes and remains a separate public API/policy; do not force its policy onto Countdown draft export or rewrite it.

## 3. Source availability alternatives and selected finite candidate

**Candidate S-CD is selected for independent technical review, not implementation.** Add a key-restricted public read-only adapter inside storage and use it in the existing Countdown recovery owner. It avoids broad legacy getPref/usePref changes and does not borrow the sessions-only DASH observer draft or treat that draft as a CD-key API grant. DASH's approved impact basis is only contract preparation, and its owner default0 discussion proves nothing about Countdown.

Proposed public surface names are `readCountdownPrefSource` and `useCountdownPrefSource`, in one new storage internal file with additive public barrel exports. Their domain is exactly `xai_countdowns`; callers cannot pass arbitrary strings, canonical task/calendar envelopes, Pomodoro sessions or storage backends. This avoids silently expanding a generic API. The result is discriminated `absent | valid | invalid | unavailable`, binding immutable captured scope identity, logical/physical key, raw bytes where actually read, and validated value only in the valid branch. No fallback[] is exposed as valid on error. SSR/locked/deleted/stale/marker-denied is unavailable. Reasons may distinguish parse/root/required-row/access/owner without logging raw user data.

One observation captures scope, validates current identity/tombstone/committed marker using existing public/internal storage-owned helpers, resolves the physical key, reads that key once, decodes JSON with unchanged codec, invokes a pure current-owner whole-array predicate supplied by Countdown, then rechecks current identity and ownership markers before publishing. Markers/read denial invalidate the observation even if the value bytes were read. The reader retains invalid raw for same-owner local recovery but never seeds, repairs, writes, removes, calls owner commands, emits business events, or promises multi-tab atomicity. Rechecking is a conservative coherence bound, not CAS; arbitrary external ABA mutation is not silently declared solved.

Countdown provides stable `Array.isArray(value) && value.every(isCountdownCard)` from its own internal dependency (no cross-package deep import). A finite new local helper may encapsulate this, with parity tests over current required/optional normalization. Preserve raw independently of normalized projected cards. Successful absence/[] may continue existing preset projection/reconciliation; unavailable/invalid **must not merge a fictitious empty source**, claim empty history, or auto-reconcile. Capability copy remains visible; a localized source error and existing recovery controls communicate kept data. A failed editor proposal remains controlled in the mounted editor, retains its latest fields and original baseline; read-only refresh is not Retry-save and never implicitly writes. Re-enabled save still checks same owner, original baseline and latest editor identity.

The observer subscribes inside storage to the unchanged physical same-tab bus plus native StorageEvent and accountScope. Event payloads only invalidate; it rereads authoritative bytes. It rebinds after an initially denied key resolves, does not compare localStorage outside try, and ignores other-account/other-generation keys. Relevant marker/clear/tombstone events invalidate; scope change synchronously hides old publication and clears instance bindings before replacement data can appear. Explicit read-only refresh, mount and real visible-return are finite recovery triggers; no polling SLA. An invalid→valid repair publishes only after a successful current observation. Denied→valid without a declared trigger remains unavailable honestly. subscribe/read ordering includes a post-subscribe reread to close the render-to-subscribe gap. All delayed callbacks carry captured owner and instance token; disposal and scope mismatch prevent publishing stale value/error into B.

Recovery may retain usePref solely as its existing setter, but no display or truth decision takes its fallback value. Recovery's mutate/persist/Retry must consume the adapter's same-owner validated observation and original proposal baseline; no new writer, transaction, queue or lock is added. Every actual setPref remains captured-owner existing code and whole valid required records only. Broad direct same-tab native writes are outside the storage API's notification promise; explicit refresh/visibility catches them. Real second-tab native events are covered. Repeated public read calls do not mutate or turn an absent record into a schema migration.

Alternatives considered: **local-only** raw reader using public accountScope is sufficient for one snapshot but public barrel exposes no subscribeSameTab, and using usePref as an availability signal inherits swallowed/default and event issues; without a proven bounded trigger contract it cannot replace S-CD's complete live-source claims. **usePrefAsync adapter** offers source/raw/reload but retry/reset/setter can write and its error/conflict projection can retain old source; it needs separately proved recovery/subscription semantics and is not selected. **general engine/API rewrite** affects all legacy callers and is rejected here. **DASH sessions adapter extension** needs its own accepted exact key-domain amendment and owner validation; it is not available just because its filename exists in a draft.

## 4. Export ownership, actual disk and forced-loss boundary

Propose a package-local export helper plus captured-owner assertion supplied by recovery; no account exporter or host rewrite. It snapshots stored raw/pending/latestDraft once under captured owner, uses an immutable local payload, and never changes recovery state or marks a save successful. Raw denied means snapshot failure, not stored:null fiction. Invalid raw may be exported as the actual raw string with pending/draft when ownership/readability is proved; it is not normalized or silently dropped.

State machine: validate captured owner/marker → snapshot → serialize/Blob → create URL → create/configure anchor → optional actual DOM append → **immediate current-owner guard before click** → actual click → schedule cleanup → remove owned anchor → revoke exactly once. Recheck after each potentially reentrant boundary (snapshot raw read, serialization/Blob, URL, anchor setters/append) and before any UI publication. finally owns URL/anchor from allocation onward, so failed create/configure/append/click, owner change or component disposal cannot skip cleanup. Late revoke is an operation owned by the captured export; it must not read B data, retry click, clear B errors or release draft/departure state. Module error publication needs captured owner plus mounted-instance guard. If owner changed, shared gate provides isolation and no stale module publication is allowed.

A guard immediately before browser handoff can prevent dispatch after an already observed owner change. **After native anchor activation has handed bytes to the browser, web code cannot guarantee recall of an in-flight download on later signout.** Keep this physical limit explicit: that download remains A's already-captured payload; no B bytes can enter it, no automatic second dispatch, no new success/save claim. Inject switch before calling click (must block), inside the actual click event/default-action boundary, and after native handoff as distinct causal boundaries. A synthetic wrapper that changes owner after the product's final guard and then delegates cannot be labelled a preventable pre-guard case; preserve the observed handoff ordering. No last-guard-to-native-call atomicity against arbitrary reentrant wrappers is claimed. Source author must inspect actual anchor event/default-action propagation and qualify it; any original-row guarantee requiring a stronger atomic handoff remains blocked for exact independent review. Blanket “zero files after any future owner change” is infeasible and is not silently weakened into a PASS. If independent original-scope review interprets CD03-07/09 to require revocation after handoff, that assertion remains BLOCKED and returns for exact technical adjudication, not a new reminder/product policy or impossible implementation promise.

Actual-disk evidence is external oracle acknowledgement, **not a new product promise**: root-reserved clean download directory, unique click/action/document/owner ID; CDP Browser.downloadWillBegin/downloadProgress tied to guid/filename/url and bounded completion; no .crdownload left; open actual regular file without symlink escape, capture size/hash and parse payload bytes. Verify exact latest editor title/note, raw stored string and pending identity/baseline, and ensure file count changes match action. Pair canceled/denied destination/delayed incomplete download and wrong-owner/old-file controls; click success and Blob interception alone never PASS. A canceled/failed disk transfer leaves draft/error/save state unchanged; page cannot reliably observe disk error and must not say “saved/download complete”. Source setup errors remain visible locally while the same owner instance exists.

Explicit Cancel/scrim/Escape discard, route unmount, reload and full process termination can lose in-memory draft; preserve current limits. No draft durability, forced-close guarantee, automatic import, route guard or sign-out coordinator change is proposed. Export does not release Appearance/rail/settings guards; actual host tests retain their ordering and distinguish draft loss from an unsupported guard expectation.

## 5. Exact proposed protected exceptions

Existing11 conditional paths are retained verbatim in Appendix A. Their original copy/test/docs permission remains **conditional**, and recovery/source/export behavior is an additional amendment requiring separate explicit root scope. The following **12 additional paths** are finite candidates (ADD where marked); nothing is written now.

| Path | Only proposed purpose |
| --- | --- |
| packages/plugin-web-storage/src/internal/useCountdownPrefSource.ts (ADD) | Restricted raw/source reader and read-only hook, existing codec/scope/marker/bus reused |
| packages/plugin-web-storage/src/index.ts | Add only named CD read exports/types; no existing export behavior change |
| packages/plugin-web-storage/src/__tests__/useCountdownPrefSource.test.tsx (ADD) | Coherent observation/subscription/denial/identity/no-write controls |
| packages/xai-web-persistence-contract/docs/design.md | Restricted read source and ownership contract |
| packages/xai-web-persistence-contract/docs/api.md | Exact read-only CD API/domain/result/refresh |
| packages/xai-web-persistence-contract/docs/test.md | Read/whole-array/consumer compatibility evidence |
| packages/xai-web-persistence-contract/docs/dev_log.md | Honest scoped phase and evidence record |
| packages/plugin-web-countdown/src/internal/useCountdownSaveRecovery.ts | Read classification, guarded current-owner mutation/snapshot export integration; preserve writer semantics |
| packages/plugin-web-countdown/src/internal/countdownSource.ts (ADD) | Pure whole-source predicate using unchanged local current-owner guard |
| packages/plugin-web-countdown/src/internal/exportCountdownDraft.ts (ADD) | Captured payload transport, pre-dispatch fences, local cleanup |
| packages/plugin-web-countdown/src/__tests__/countdownSource.test.ts (ADD) | Required-record parity and optional normalization compatibility |
| packages/plugin-web-countdown/src/__tests__/exportCountdownDraft.test.ts (ADD) | Actual helper boundary/control tests; native disk still separate |

The combined proposed product surface is **23 unique paths** (11+12). CountdownModule and its existing tests, already among11, need an explicit semantic amendment for error presentation, observation integration and export helper use; being named for copy does not itself grant those behaviors. Existing Dialog/test may wire source failure/read-only refresh without changing validation/date submission. Package CSS remains only narrowly justified wrapping/error/disclosure styles. No extra index/registration/types/math/preset/reducer/validator/accountMigration changes. Config/manifests/lockfile, storage engine/usePref/usePrefAsync/codec/registry/scope/lifecycle/deletion/exports, provider/router/startup, generic notifications/JOB/SW, shared CSS/Clock styles, global ledgers and original evidence remain protected.

S-CD adapter lives on shared storage's sole-writer boundary; sibling DASH source contract cannot write index/docs simultaneously. Source owner must pin accepted siblings and independent integrated SHA before claiming compatibility. CD01/CD02/REL05 writers share Countdown semantics and must serialize. Changed dependency invalidates reuse; no broad “docs-only” waiver. If12 candidates prove insufficient, stop and return within original impact cap3 for a precise independent amendment; do not add generic storage/schema/account repair.

## 6. Complete source machinery architecture (proposal only)

Proposed source-only package `docs/reviews/audit-parallel-cd03-machinery-r1/` contains the following **18 exact ADD files**; no current source-writer card exists:

`manifest.json`, `cases.json`, `controls.json`, `inputs.sha256`, `source.patch`, `README.md`, `root-supervisor.mjs`, `archive-command.mjs`, `local-services.mjs`, `public-host.tsx`, `passive-prelude.js`, `transition-capture.js`, `native-driver.mjs`, `download-observer.mjs`, `focus-adapter.mjs`, `command-lane.mjs`, `qualification.mjs`, `evidence-index.mjs`.

Root-supervisor is the only launcher/sealer; public-host imports archived public AppProviders and router (host exports), startup functions and full production token/global/module CSS; native-driver imports no private owner module. Vite's actual browser/import condition pipeline resolves the complete @repo export graph inside the immutable archive. Actual main.tsx startup is the untouched control: registerServiceWorker then bootstrapObservability then StrictMode/AppProviders/RouterProvider. The instrumented composition adds only declared passive capture. Retained PomodoroSessionHost, DeviceSessionBridge, AccountDeletionRecoveryBridge, TodoWebRuntimeBridge, rail/Appearance/CmdK/pet remain. DEV unregister/cache cleanup and production SW registration are different admitted lanes, observed rather than omitted. Actual swallowed startup/bridge promise errors are recorded via transport/work registration, not inferred from a ready selector.

Use live mode with nonnull config and a loopback HTTP endpoint; real SDK/managed coordinator/auth generation IndexedDB are unchanged. Local services are an explicit disposable remote-boundary specimen, not fabricated production credentials or auth qualification. It must freeze method/path/query/request/response schema for real SDK auth token-password/refresh/user/logout when used; disposable sessions must satisfy actual SDK user/token/expiry fields. Real device RPC POST /rest/v1/rpc/device_register and device_heartbeat require Authorization, X-Device-Id, X-Sync-Version and JSON device_id; success,401 unknown_device and403 device_revoked are distinct. Todo nonce lease, when crypto fixture is declared, uses POST /rest/v1/rpc/fn_grant_nonce_lease with p_account_id/p_key_id/p_count and encryption_device_id/lease_start/lease_end. Do not hide it by replacing a bridge; absent crypto metadata is explicit baseline, separately qualify crypto lease effects if claimed. Unknown outbound URLs fail. Bind actual observed endpoint closure before business use; a generic all200 service is invalid.

Initial fixtures use public auth-generation createCandidate/setSessionItem/publish with real persisted SDK session schema; business markers use public generationKey/generationMarkerKey helpers and valid marker migrationId/previous fields. UI sign-in/real coordinator transitions own subsequent A→locked→B→A; merely calling accountScope.activate is not an auth-host transition. Demo gets a separate qualification partition and remains labelled demo, never managed proof. Device-owned language/theme/density keys stay unscoped; record auth lease and account business generation/epoch separately. Both A and B have nonempty distinctive valid sentinels plus legacy/other-generation/other-account records.

Source/time fixtures seed exact raw before import and freeze cause IDs. Time progression uses a separately qualified page clock seam controlling Date and timer scheduling coherently, retaining real browser event/lifetime behavior; wrong timezone/clock controls detect it. Real native zone observations LA/UTC/Shanghai/Lord_Howe are bound to browser settings or qualified timezone override with its limitation; no changed host system clock. Expiry test zero writes excludes permitted attributed preset reconciliation, fixture writes, real host/device heartbeat and unrelated Pomodoro settlement; all attempts, including throws/no-op, are preserved by owner/key/cause, not filtered away.

First-frame acceptance uses a whole-transition monotonic ledger starting before identity invalidation and ending after complete settle. Public coordinator/accountScope subscriptions, actual React commit markers, MutationObserver oldValue/reconstruction, removed subtree snapshots and pre-paint frames are independent channels. DOM node identity alone is insufficient. **Shared host/focus impact remains PROPOSED and pending adoption; root dispatch reports review REVISE I1 on synchronous input-property capture.** Its written deferred snapshots cannot establish a transient .value/.checked change restored within one task. A future corrected acquisition must synchronously observe original property setters/mutators (input/textarea/select/option value/checked/selected/defaults, valueAs*, stepUp/down, setRangeText, form.reset as applicable), preserve descriptors/this/return/throw and delegate once, capture before/after with current owner/epoch, and capture trusted input/change/reset events synchronously. Qualification uses real same-node wrong property then same-task correction, wrong text then correction, detached wrong subtree, locked flash, wrong epoch before remount, A→B→A, delayed first ready and overflow. Missing interception coverage, ambiguous order or inaccessible native property path means CAPTURE_INCOMPLETE; no final-state-only PASS. Instrumentation must prove transparent storage/routing/state behavior against untouched main; no product mutation for proof.

Reload requires actual Page.reload and context destruction followed by new nonnull loader **and** new nonnull document ID and ready tied to both. null != old is never success. Full browser close/reopen retains only authorized profile/persisted data, gets new PID/start/document, and waits for real managed startup. No fake visibility event substitutes for true background/foreground; capture Page lifecycle and document visibility. Route departure uses actual rail/CmdK/history/trusted input; real dialog close actions retain documented discard behavior. No Clock focus budget or Tasks activation workaround is borrowed.

Focus adapter is blocked until a fully reviewed/qualified/adopted frozen-compatible method or separately reviewed equally strong successor is available. Preserve original bacdbbc pixelFocusWalk/function/block/file hashes, decoder/hue/scroll selftests, font/animation settle, stable-capture limits, thresholds, whole-document forward/reverse census, injective semantic descriptors and every per-stop pair. The shared native-focus-context-v1 proposal is not an existing qualified library; no boolean selftest transfer, synthetic hue box or relaxed tolerance. Real Retina raster/CSS mapping needs target-specific crop/full-image byte agreement after reload/resize/scroll/real zoom. Real Chrome View-menu200% is a supervised native child tied to owned PID/start/window/tab/CDP identity; no CSS zoom, pinch or deviceScaleFactor=1 fiction. Lost foreground/ambiguous window refuses, never touches another browser. Full shell includes outside controls, pet, both Topbar statuses and overlays; inspect screenshots, not only selectors.

## 7. Fourteen-row exact emitter and case relation

The later source card must expand this finite relation into cases.json before any write/run, assign every subcase a unique ID and exact path, and independently review the entire expansion. This impact does not reserve runtime destinations. For each concrete id Cxx-suffix and each phase in **before / fixed / integrated** the proposed active base is `docs/reviews/audit-parallel-cd03-evidence-r1/<phase>/<id>/`; root must replace phase source placeholders with immutable full SHAs in its registration. Common files are `source.json`, `events.jsonl`, `result.json`; producing module below additionally emits named files. Every unrun/reused/blocked obligation stays in index with exact source/hash and reason. No missing output becomes N/A or an empty success file.

| Original row; finite subcase domain | Producing mode/source; exact additional outputs | Causal positive/negative control; inherited overlap |
| --- | --- | --- |
| CD03-01 C01: EN/ZH × cards/list/timeline/calendar/history/editor | native-driver mode disclosure, public-host; dom.json, ax.json, screen.png, copy.json | Actual correct capability association vs remove one disclosure/label in isolated qualification specimen; P0 missing copy expected before failure, never source-search UI PASS |
| CD03-02 C02: future/exact/same-day-past/past-day/leap/year/DST-forward/DST-back × LA/UTC/Shanghai/Lord_Howe | native-driver date-custom; raw-before.json, raw-after.json, metrics.json, effects.json | Independently frozen expected local-day and instant values vs one wrong clock/target or deliberate forbidden due-write; math/REL historical family inherited |
| CD03-03 C03: day/month/quarter/year/annual/CNY-table/CNY-fallback × visible/hidden/deleted × writable/quota | native-driver preset; projection.json, raw-before.json, raw-after.json, effects.json, retry.json | Real preset projection/write vs swallowed quota/changed-id/marker; date-edit-to-custom additional C03-edit-date,C03-edit-time; original preset recovery overlaps REL05 |
| CD03-04 C04: create/edit/delete/hide/pin/duplicate/reorder/restore × writable/quota plus expired-visible-and-history and restore same-day/leap/past-year | native-driver actions; draft.json, raw-before.json, raw-after.json, effects.json, history.json | Real retained draft/action ID/retry vs regenerated ID/false completed write; real trusted reorder, fixed source algorithm unchanged |
| CD03-05 C05: route-out-back/new-document-reload/background-return/process-close-reopen × clean/pending | native-driver lifetime; lifecycle.jsonl, loaders.json, raw-before.json, raw-after.json, drafts.json, screen.png | New document/settled host vs stale/null loader; missing draft after forced loss recorded as limitation, not durability PASS |
| CD03-06 C06: Notification absent/default/granted/denied × setting-on/off × DND-on/off × expiry/reopen | native-driver no-job; permissions.json, scheduling.jsonl, network.jsonl, effects.json | Separately attributed real harmless notification/request observer control vs missed/suppressed intercepted invocation; absent API has guarded-method control, no fake permission grant |
| CD03-07 C07: A-locked-B-A/signout/generation-replace/tombstone/delete × interval/visibility/preset/retry/export cause | transition-capture + native-driver account; transitions.jsonl, properties.jsonl, commits.jsonl, mutations.jsonl, frames.jsonl, namespaces.json, effects.json | Actual managed state transition vs synchronous wrong property/locked flash/stale callback; no invented Countdown queued lock; REL02/03/05 and shared I1 remain dependencies |
| CD03-08 C08: absent/empty/validV1/validV2/denied-get/parse/null/wrong-root/mixed-required-invalid/newer-tab/quota/preset-failure × initial/recovery | native-driver source; source-observations.jsonl, raw-before.json, raw-after.json, draft.json, retry.json | Real current read success vs retained-error/default[]/stale event payload; subscribe-denial-rebind and other-key/account sentinels; S-CD required, cannot claim old[] proves source truth |
| CD03-09 C09: export stable/Blob-throw/URL-throw/anchor-create/setter/append-throw/click-throw/raw-denied/switch-after-snapshot/switch-in-Blob/switch-in-URL/switch-in-append/switch-before-click/switch-after-dispatch/revoke-throw/disk-denied/disk-cancel/disk-delayed | download-observer + native-driver export; exports.jsonl, downloads.jsonl, disk.json, payload.json (only actual file), cleanup.json | Known actual completed file vs preexisting unrelated file/missing completion/wrong payload; pre-guard cancellation, click reentrancy ordering and post-handoff captured A distinguished; append-only case conditional on adopted helper |
| CD03-10 C10: legacyV1/V2/malformed/mixed × explicit-import/rollback/account-export/account-delete plus CmdK-read-only | native-driver lifecycle-data + command-lane; migration.json, manifests.json, raw-before.json, raw-after.json, reader.json | Real public lifecycle/current owner records vs unintended raw rewrite/wrong namespace; account exporter preserves intentional captured-owner behavior; no restoreSupported fiction |
| CD03-11 C11: EN/ZH × light/dark ×375/414/768/1024/1440 ×100/200 × five views/editor/save-error/source-error/empty-history × pet-hidden/on | native-driver visual + focus-adapter; screen.png, geometry.json, viewport.json, native-zoom.json, hit-tests.json, visual-review.md | Real same-browser menu zoom/correct mapping vs wrong DPR/zoom/occlusion; both Topbar statuses and shell overlay closed/open are separate declared states added to each tuple; no screenshot self-approval |
| CD03-12 C12: EN/ZH × light/dark × five views/editor/error ×100/200; all reached whole-document forward/reverse stops | native-driver keyboard + focus-adapter; census.json, keys.jsonl, focus.json, stop-N-focused.png, stop-N-moved.png | Once-only trusted Enter/Space/Escape/Tab/ShiftTab and real focus restore vs adjacent-only ring/untrusted or duplicate action; N0..139 finite slots, unvisited expected stops missing, unused only with complete cycle proof |
| CD03-13 C13: exact command IDs below + complete canonical E1–E25 relation | command-lane + evidence-index; command.json, stdout.log, stderr.log, exit.json, g1-index.json | Real command/closure/count with correct source vs wrong-root/lock/package/launcher/cache; full historical suites and judging copies never replaced by a selected subset |
| CD03-14 C14: actual-vendor/full-independent-acceptance/root-reconcile/inventory/remote | evidence-index imports independently produced signed/bound receipts; vendor.json, acceptance.json, root-reconcile.json, inventory.json, remote.json | Actual independent required provider/source/task receipt vs self-review/missing original row/fake vendor/ancestor mismatch; root alone produces reconciliation/inventory/remote actions |

All C11 combinations are finite required inspection obligations, not permission to spend one process per screenshot or to reset a visual unit. Cases may share one physical artifact only with explicit many-obligations-to-one-file mapping and full compatible cause/source/phase. Focus stops get full success/failure pairs, no fake PNG for unused slots. Disk payload files cannot be emitted if no file exists; record actual missing capture/refusal with raw events. Source author must implement all emitters, not a skeleton with permanently unavailable native lanes.

Command identity table (unchanged package scripts, no execution now): K01 `pnpm --filter @repo/plugin-web-countdown test`; K02 same filter `typecheck`; K03 `lint`; K04 `pnpm --filter @repo/plugin-web-storage test`; K05 same filter `check-types`; K06 `pnpm --filter @repo/web test`; K07 same filter `check-types`; K08 `lint`; K09 `build` (local artifact only; never secure/deploy commands); K10 `pnpm --filter @repo/xai-web-cmdk test`; K11 same filter `check-types`; K12 `lint`; K13 `pnpm --filter @repo/web-auth-device-session test`; K14 same filter `check-types`. These are candidates subject to inherited budgets, not fresh0 allocations. No nonexistent storage lint script is invented. E20–E24 add the exact canonical widgets/grid/settings/reader/host suite command families from their bound receipts; E15 sixteen invocations, E16 Clock c1–c5 and E17 Header native18/host/Astra/Sol remain exact canonical commands, not “run regression”. evidence-index must enumerate each inherited command/mode and producing source from Appendix A Rules and the manifest-bound original receipts before admission; an unresolved command is blocked, never silently skipped.

## 8. Enclosing lifecycle, source closure and qualification controls

Root reserves actual outer stdout/stderr/emergency receipt **before** supervisor parsing/import, binds role graph, registration/adoption/review/caller/purpose/source/budget/resource IDs and consumes/reports admission in its permanent ledger. Supervisor imports only Node builtins until envelope validated. Worker cannot mint root/adoption receipts. A wx output claim prevents local collisions but does not replace global anti-replay or permit copied actor/worktree reset. Malformed card, syntax/import failure and output collision need retained real streams; outer allocation failure means root refusal/no child.

Archive uses real streaming git archive→tar with both exits/streams, measured bytes and immutable requested/resolved SHA, not100MiB buffering. Third-party dependency snapshot is read-only from declared XAI_DEPS_ROOT, capturing each consumed file bytes once and hash-checking destination; package versions are derived from consumed package.json. Own cache/optimizer/tmp/env roots, @repo source within archive, tool binaries and Node/pnpm implementation closure are hash-bound. Actual Vite resolver/browser import conditions and transformed assets/CSS/module serving closure are recorded. A bare node_modules hash or build summary JSON is not source closure. Lockfile matches above. Future source.patch must enumerate all18 source outputs and preserve protected originals.

One monotonic total deadline includes bootstrap/archive/dependency/build/server/browser/CDP/business/capture/download/teardown/journal/final writes with reserved cleanup slice. All children and detached browser/native groups register PID/start/pgid and acknowledgement before work. Actual stdout/stderr are captured to EOF; archive/build exit0 differs from premature server/browser exit0. Timers, fetches, CDP pending calls, callback captures, download completion and artifact writes are owned joinable operations. Cancel fences further scheduling, joins/terminates only owned groups (TERM then KILL bounded), drains both pipe ends and descriptors, retains late errors and still cleans independent resources after one cleanup failure. Timeout/Promise.race is not cancellation.

Terminal success follows all work joins, actual child exits, CDP/parser/runtime/idle/after-last-command errors collected, journal flush/fsync/close and every file writer finished; then supervisor seals index, exits and outer root joins its process/streams before adoption. Unjoined/late writer means QUARANTINED_UNJOINED, never immutable complete. Root hard crash/disk unavailable cannot yield durable proof; preserve partial namespace/unknown failure through existing root channel, never forced exit0. First nonzero/primary error plus cleanup/finalization errors all remain.

Finite qualification groups Q01–Q18 each require a genuine positive acquired case and targeted negative through the same path, exact cause counter/rejection code/raw artifacts, and teardown proof. Parser-only constructed reports do not qualify acquisition.
Q01 source/SHA/lock/export resolver; Q02 real streamed archive late failure/capacity and tar exit; Q03 actual Vite SDK-host import/cache/path escape; Q04 public managed auth/session owner/expiry/malformed/device401/403 and stale A response; Q05 real marker/tombstone/same-tab/second-tab/source-denial-rebind; Q06 synchronous same-node property/text/locked/detached/epoch first-frame faults (I1); Q07 actual reload old/null loader/wrong ready; Q08 time seam/date-zone/real visibility and no-job attribution; Q09 actual save failure/latest editor/ID-stable retry and writer attribution; Q10 actual Blob/URL/append/click owner reentrancy plus pre/post-handoff distinction; Q11 actual disk canceled/denied/partial/wrong-file/late completion; Q12 actual Retina/menu zoom/target crop and wrong DPR/origin/stale calibration; Q13 whole-shell descriptor/census/anchor/own-vs-adjacent pixels and stable animation; Q14 trusted keys/once-only effects/late runtime errors; Q15 actual premature server exit0/late stderr/retained pipe descendant/TERM-resistant browser; Q16 CDP malformed/truncated/oversize/unknown-id/idle/late-error and EOF; Q17 actual partial/zero journal write/fsync/close/late final writer/driver killed before child ack; Q18 exact all14 obligation enumeration/vendor role/adoption/replayed reservation/unknown exhausted unit refusals. Every child unit inherits its actual permanent history. No Q group is permission to run here.

## 9. Historical purpose map and full acceptance barriers

REL05 source `179e6d570fda291a58be2ed8972d151fb21e1cd6` Countdown package is byte-identical to P0; shared source/environment applicability still needs per-row proof. Historical author default3cd8870 native failed create/delete retained UI; fixed7 groups passed. Independent before failed and fixed8 groups passed, adding preset quota/Retry. Four before/fixed logs are at least four retained launches over overlapping save-recovery family; same-directory runner stdout and JSON are duplicate observations of those launches. No PID, launch token or complete probe/refusal/child history is available: totals remain unknown, not0 or “four is allowed”. Before assertion error is retained (Node24.16.0/Chrome152 in logs), not harness-valid PASS. Package128/14 author and independent report,110/115/118 owning history/host135 and initial no-op restore fixture correction all remain; assertion counts are not process counts.

| Permanent purpose | CD rows / exact reuse limit and budget |
| --- | --- |
| REL05 original create/delete retention/retry/latest-draft/pin/newer raw/pre-snapshot A→B | CD03-04/08/09 subassertions only at exact old fixture/source/environment; old7/8-group result is not actual App/trusted input/mid-export/first-frame proof |
| REL05 preset failed reconcile | CD03-03/08 successful raw[] quota/Retry subcase only; not malformed source truth, midnight/date policy or full preset census |
| Countdown math/preset/restore/package and data lifecycle/REL02/03 | CD03-02/03/04/07/08/10/13; inherited exact command families, launch totals unknown; no new “CD package run1” |
| New coherent CD current-source classification | Narrow C08 source truth and required-record/marker invalidation assertion, source-grounded absent in P0; may be separately registered only after technical review, not generic shared storage budget reset |
| New visible complete capability/repeat/expiry copy | Narrow C01 business assertion absent in current Module/CardView/Dialog, separately registrable purpose; mixed suite still inherits every old unit |
| Mid-export captured-owner fences | Specific C07/C09 reentrant boundary oracle not old pre-snapshot proof; source registration may be novel but full export/native family history remains attached |
| Public managed host/first-frame/native/reload/focus/raster/lifecycle | Shared REL and Clock histories apply; source architecture adds no caller0 allowance. Shared focus REVISE I1 and all unqualified method gates remain blocked |
| Full G1 and actual vendor | All canonical original units/commands/refusals/judging-copy controls and actual vendor attempts inherited; another Codex actor is not actual vendor |

Permanent formal cap3 includes refusal/aborted startup across paths/actors/SHAs/worktrees; development probes separate and never substitute for a fourth formal run. Root must reconcile all known commands, modes, PID/parent-child records and duplicate artifacts before any actual invocation; source log count cannot supply missing lifetime completeness. A genuinely new **assertion-purpose registration** is only proposed here, not a new runner family's balance. Mixed suites inherit every exercised old family and unknown/exhausted family blocks its invocation.

Retain canonical More C-FB00210/10 judging, Appearance frozen24/26 vs OE26/26 judging, Features frozen13/15, predicted C-FD1 14/15 (judges nothing), C-RD1 15/15 judging; AppRail all eight modes26/31/21/18/24/22/33/123, parent31, selfcheck165/rail104; F1 sixteen invocations and Clock c1–c5; Header host/native18/Astra/Sol controls and every100MiB refusal/pre-registered capacity copy. Full source-bound G1 §14 is appended verbatim. No later receipt replaces E1–E5 and E25 enumerates producing commit/path/hash for all IDs; originals and exact archive-copy diffs/closure are separate. Reuse is row-specific, hash/environment/source/semantic applicable and independently accepted; not blanket rerun or blanket exemption.

Clock method history remains REVISE R1–R6 / UNQUALIFIED: retention3/3 exhausted145 assertions,41/42 executions, final14/14/55; Q1 focus1/3, other six0/3, development2/83; B70 native12/6432, development40/4884, visual3/3 exhausted, focusEN2/ZH2, F1formal2/180 and development3/302. Full seven-unit M qualification→freshQ2/root adoption→complete valid original P0before→exact-two-CSS M+G+B geometry/G2/G3→versionedbaseline/E1–E5→original Clock fixed/final gates still apply. CD machinery may not borrow exhausted Clock capacity or relabel its method.

## 10. Disposition, accounting and next gate

Approve only this **complete technical basis** after fresh full independent review of every S-CD/export/host/property-capture/method/18-file source/14-row emitter/history condition. There is no partial A1 adoption, source-writer authorization or product scope grant. Then root may explicitly adopt exact hashes and register finite source-only contract/machinery authors with the exact proposed exceptions and full matrices; independent source review precedes qualification. Qualification itself requires lawful exact purpose admission, full causal controls and fresh review/adoption. Complete valid original P0 before precedes product work; fresh bounded product author then unchanged-oracle fixed/affected/integrated/native/visual/full G1, actual vendor, fresh non-author Astra original-scope acceptance, root evidence-only reconciliation, inventory, remote ancestry and sync.

This author used impact **1/3**, one concluding standard-library/Git-only static pass **1/1**. No runtime/test/typecheck/build/lint/browser/native/server/qualification/probe/vendor/child/push/fetch/sync invocation. The static result/corpus totals are appended below; output hashes and commit/parent/clean receipt are external to avoid self-reference. Corpus reads/hashes are integrity coverage, not semantic reading or execution of every corpus file. Semantic review covers the entire CD contract/review, relevant real source/dependencies, owner rules, histories and full canonical G1.

Read-discovery mistakes were nonexistent prefEngine.ts, codecs.ts (actual codec.ts), guessed author review filename (actual20260909-author-verification.md), overlay.md and goals.md (actual authority-overlay.md/goal-A.md); corrected by actual directory/source discovery. Several oversized views were truncated and relevant sections reread. These are disclosed read-only discovery errors, not failed static or runtime passes. No missing input is silently waived. All input validation and both complete UTF-8 buffers are built before either write; a failed concluding checker stops without a semantic rerun. No control-plane, ledger, product, source runner or other-worktree edits are allowed.

## Single static integrity receipt

PASS: all3351 inherited review identities (including all3326 preparation identities) verified; shared2808 and DASH649 manifest inputs also validated. Combined output manifest contains **5807 identities**, inherited input byte reads **202809698** (overlap retained by identity, not unique execution). Original312 ordered fields, unique mapping,39 reversible labels,933+6=939 evidence and13/3/3/293 states preserved; CD03 pending. Canonical full§14 matches; source commits each exactly two ADD paths; fixed parent/root documentary adoption and four-TT08-doc/runtime boundary verified. Both complete output buffers built before writes. Static1/1 consumed, no static failure or rerun; runtime categories all0.

## Appendix A — immutable full preparation source

# CD-03 full original-obligation preparation r1 — PROPOSED / UNADOPTED

Module **web**, workflow C, sole root **A-Codex** controller. Fresh preparer `/root/parallel_c_cd03_prepare_r1`; requested Astra role/configuration is not provider attestation or cross-vendor evidence. Only this contract and `inputs.sha256` are authorized additions. This is preparation, not product acceptance, a reminder decision, implementation permission, qualified machinery, or audit-item closure.

## 1. Immutable authority and original obligation

- Sole writable worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-cd03-preparation-20261010/XAI_Desktop`.
- Parent **7eb8280736e0c30a908120704ea081d43cd12f16** (P), fixed discovery **e5caddc1abb1b12afb8802960d6e2b993c0c365a** (I), original scope **e041c2bc293b70db367444c62c4300231976dbf7** (O), product **f9eb4b1f207bc4b46f547b90afc250424b3c8695** (P0). Product source equality is checked separately; the moving root HEAD is never an input.
- Original goal attachment read first: `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md`, SHA-256 **40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615**. AGENTS, CLAUDE, workflow, multi-machine rules and parallel overlay apply. Root's adopted r2 scheduler pointer in fixed execution-state overrides that immutable authored scheduler's stale UNACCEPTED heading; no automated scheduler is claimed.
- Task card `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-cd03-preparation-r1.json`: original registration **11d1d67e67719cf331217786e60fa24ae487e12b** retained. P explicitly corrects only stale nested POMO04 original-item metadata. Amended card SHA-256 **c9afdcb0f8b29b0851b9426eb27ffc5f1b456734622e1839d641026d8a59e1da**, superseded **d2413a79d1635264a86af9ef4fb7c63962bc7cc1fb8f3bace9116064460244e7**. I, P0, author1 and static1 remain unchanged; no silent repin or budget reset.
- **CD-03**, P2 / 决策 / pending / web / 当前范围 / workflow C: **定义重复/到期动作及是否提供提醒**. Acceptance verbatim: **无后台动作时明确只是日期差展示；新增提醒接JOB统一机制**. Sources `02-tasks-time-boards.md;05-visual-ux-audit.md`. Complete original fields and CD-03 evidence[] remain, including original_module. Empty evidence is not zero historical executions.
- All **312** original item fields/order and unique attribution remain; **39** reversible module-label changes retain original_module. Original **933** evidence entries + the already accepted six TT08 entries = **939** current. Formal **13 completed / 3 verification_pending / 3 in_progress / 293 pending**, **299 unclosed**, unchanged. No global-control/ledger/inventory writes.

## 2. Existing owner rules resolve the current product contract

| Binding source, at manifest-fixed revision | Rule and limit |
| --- | --- |
| `packages/xai-web-countdown/docs/design.md`, Selected Option, assumptions and Out of Scope | Single local calendar-date display, direction derived at render; v1 has no countdown events and explicitly excludes notification at zero. V2 amendment supersedes v1 layout, fields and preset/history details, but contains no reminder authorization. |
| Owning `api.md` §12, `test.md` §10–11 and `dev_log.md` V2/V2.1 | Optional V2 fields preserve V1 records; nine dynamic presets; five views; soft delete/history/restore/copy; date changes can make a preset custom. Existing SHIPPED/history claims are limited, not CD-03 acceptance. |
| Original audit §Countdown and CD-01/02/03 | Real module uses 60s wall-clock plus visibility, not obsolete useDaysUntil assumptions; no explicit timezone or reminder. CD-01 owns new date-only/zoned deadline types; CD-02 owns preset deduplication and card-operation cleanup. CD-03 must explain repeat/expiry/reminder semantics fully without absorbing those sibling designs. |
| `web-countdown-independent/20260909-review.md`, product179e6d5 | Bounded REL05 save-recovery PASS only; explicit exclusions include calculation, seed policy, bad-schema UI, deployment. DOM-click browser tests are not trusted keyboard/pointer, complete host or full CD-03 proof. |
| JOB-01/02/03 in original audit | Any newly authorized reminder uses unified jobs/outbox, persistence, idempotency/retry, permission/DND and real delivery/closed-client proof; service worker longevity is not assumed. |
| Current actual Countdown source | No recurrence, occurrence, delivery, reminder, reminder-enabled, timezone, completion-event or notification-permission field/consumer. Current behavior is computation and page-local persistence reconciliation, not scheduled background execution. |

**Proposed continuation: use the existing no-reminder rule and add truthful, visible EN/ZH explanation of date-difference display, dynamic presets, expiry/history and manual restore. No new product-owner question is justified by the located sources.** A visual-audit suggestion to show repeat rules does not grant a recurrence writer. A prototype, note saying Annual, restore date-bump or host notification API does not authorize reminders.

Current scope remains no automatic due action for custom cards: no background task, notification, sound, completion record, auto-delete/archive, or custom-card recurrence. The current preset projection may change target/start dates and attempt persistence while the module is mounted; therefore “Countdown never writes automatically” would be false. Proposed short copy:
- EN: “Shows the date difference and progress using this device’s local time. It does not send reminders or run tasks after the page is closed.”
- ZH: “按此设备的当地时间显示日期差和进度。不会发送提醒，也不会在关闭页面后执行任务。”
- EN: “Custom dates do not repeat automatically. Preset dates update when this view refreshes. Passing a date changes the display; it does not mark a task complete.”
- ZH: “自定义日期不会自动重复；预设日期会在此视图刷新时更新。超过日期只改变显示，不会完成任务。”

Exact wording remains subject to fresh independent review and actual UI verification. It must not promise whole-hour accuracy from calendar-day counts or refer to Clock widget timezone. New reminder capability would require separate operator authorization, JOB owner contract, occurrence/cancellation/timezone/offline/reopen semantics, service and actual vendor gates. That inactive future branch is not a present owner question and not an unbounded optional implementation.

## 3. Full actual source graph and persistence ownership

Runtime owner `packages/plugin-web-countdown/`; planning owner `packages/xai-web-countdown/docs/`. Public index registers the migration validator and loads package CSS. `registration.tsx` reads WebShell language and mounts real CountdownModule at `/app/countdown` and wildcard child; actual App imports it through shellRegistrations. Countdown is not feature-toggleable. There is no Countdown fullscreen/player, retained Countdown host or background Countdown process. Modal showModal is not a fullscreen timer. AccountStorageGate retains PomodoroSessionHost only; that is not Countdown execution.

| Producer/writer/reader | Actual responsibility and acceptance boundary |
| --- | --- |
| CountdownModule | Owns modal/view/now/calendar month/drag state. 60,000ms interval and visible-return set now; unmount cleans both. No count of interval ticks determines elapsed days. |
| `mergePresetCountdowns` | Normalizes raw array, filters invalid required rows, makes nine current presets, merges matching preset_id, refreshes dates for source=preset, retains other current fields, then appends non-preset custom rows. Missing presets are injected. This is called for display and before mutations. |
| Daily effect | On todayKey (including mount) computes merge and compares JSON; if changed calls recovery.mutate(...,'presets'). Source comment says once per local day / failure explicit Retry. This is page reconciliation, not a job, recurrence occurrence or notification. Rerender/new mount/StrictMode and no-op comparisons must be recorded, not presumed single physical write. |
| All user writers | Create/update/delete, pin/hide/duplicate, history restore/copy, reorder and editor save route through useCountdownSaveRecovery, then the captured-scope usePref setter. Editor saves compare original entity; failed save does not close dialog. |
| Save recovery | Captures owner once. Reads scoped raw before proposal and again before persist; original raw baseline rejects newer data. Failed action Retry reuses next/IDs; editor changes replace proposal with latest draft. Failure blocks incompatible proposals. No Web Lock/CAS or durable draft; unmount/process close loses pending memory. |
| Store | Registry xai_countdowns: schema1 JSON default[] proposed, owner=xai-web-countdown. Ownership table marks account. Physical key is generation-scoped account/demo; stale identity or deletion tombstone rejects. Not device-local, account cloud-sync or live server state. |
| Views | Cards/list/timeline/calendar use nondeleted/nonhidden rows, including expired custom cards. History also includes hidden/deleted/past. Same expired custom card can appear in active view and history; no archive move or completed durable status. |
| CmdK | readModuleStates reads committed xai_countdowns; adapter reads id/title and old targetDate, not target_date. It does not merge presets, filter deleted/hidden or compute due status. Treat it as title/identity search, not reliable date/status oracle; no CmdK rewrite granted. |
| Account export/delete/migration | Generic account lifecycle reads/erases captured account generations; AccountDataGate imports selected legacy category under migration validation. These are separate legitimate writers/deleters outside card CRUD, never replacement recurrence owners. |

Countdown draft export `countdown-unsaved-change.json` contains `{recovery:{version:1,kind:'countdown-unsaved-change',stored,pending},latestDraft}`. snapshot checks owner via key before reading. URL/click setup catches and displays separate export failure; no live owner recheck after createObjectURL, no durable-download acknowledgement, and timeout revokes URL after1s. Existing A→B rejection before snapshot does not prove an owner change injected during URL setup safe; preserve this as a source-bound boundary requiring freeze/independent impact if implicated, not an accepted fix or automatic expanded scope. Export is not successful save, import or a scheduled operation.

## 4. Dates, repetition, expiry and history: exact present behavior

| Domain | Established/source-observed meaning; what continuation may claim |
| --- | --- |
| Date and time fields | target_date YYYY-MM-DD, optional target_time HH:mm/null; start_date for progress; created_at/updated_at/deleted_at are UTC ISO timestamps. No zoned deadline/offset/recurrence rule. Editing UI requires target time although old/default rows may omit it. Changing preset target date or time sets source=custom and clears preset_id. |
| Local calendar difference | computeCountdownMetrics combines numeric local date/time. dayDelta is difference of Date.UTC(local Y/M/D) day numbers, resistant to 23/25-hour DST days; hours/minutes are absolute millisecond remainder components. Do not concatenate as an exact absolute day/hour duration across DST. |
| Missing time | Actual combineDateTime defaults to 00:00; history uses target_time??00:00. Type comment says end-of-day/date-only, conflicting with actual midnight. Original v1 API says local midnight; V2 does not resolve new date-type design. Record discrepancy as CD-01 technical/contract dependency; do not silently switch to 23:59, invent zoned storage or promote the comment into product policy. Current explanation says device-local date difference, without promising a future date-type contract. |
| Equality / elapsed | isPast is diff<0, so exact instant is not past; later same calendar day can be “past” with absDays0. Progress clamps0..1 against start/target; absent/invalid start fallback differs from calendar days. Expiry triggers no event, extra history object, status change, sound or reminder. |
| Custom repetition | Custom record retains target_date until explicit user save/Restore; rendering crossing midnight, hidden-tab delay, remount or process reopen is not recurrence. Copy duplicates the same date as a new custom id, not a next occurrence. |
| Dynamic presets | IDs christmas/yuandan/new-year/spring-festival/month-end/next-month/next-year/quarter-end/year-end. Annual dates choose current/next year at local date boundary; month/quarter/year presets recompute current window. Existing duplicates are CD-02, not permission to remove any. CNY table2026–2036 and fallback Feb10 approximation are implementation limitations, not promised astronomical accuracy or a new accepted rule. |
| Hidden/deleted presets | Merge overlays current fields incl status/is_hidden, then overwrites target/start for source=preset even when hidden/deleted. Thus deleted marker is preserved and not resurrected, but historical preset date is not immutable. API says updates active presets; this discrepancy must remain explicit. Do not claim date-frozen archive or repair seed/history policy from CD-03 copy alone. |
| Restore | Explicit restore clears hidden/deleted state, sets start_date=today and for past targets calls bumpPastDateForward: current year same month/day, next year if <=today. This can move a historical year backwards to current cycle, overflow Feb29 to Mar1, or advance a same-day earlier time to next year. For source=preset subsequent merge may override target again. Existing code behavior is disclosed, not newly approved as universal repeat policy; any proposed algorithm change requires CD-01/02 owner review. |
| Persisted “completed” | CountdownStatus is active/deleted only. CompletedCount counts past rows in history, including hidden/deleted ones. “Completed” currently means date passed, not a completed task/action or job receipt. Proposed display uses “Date passed / 已到期” and explains history is a view of past/hidden/deleted records; do not migrate stored status or task data. |

Restore helper should be described cautiously: “Restore makes the card visible again and may move a past target date forward; check its date afterward.” / “重新启用会恢复显示，已过期的目标日期可能前移，请核对日期。” This avoids falsely guaranteeing identical dates or scheduling annual repeats, and does not approve changing the algorithm.

## 5. Host, process, account and source-failure contract

1. Actual App/route with full CSS: normal mounted page recalculates each minute and immediately on visible return. Hidden pages can be throttled; no timely background guarantee. Leaving route unmounts page interval/listener; reopening derives current values and may reconcile presets. Reload creates a new document; full browser-process exit stops JS. Reopen uses persisted cards/current local time, without catch-up jobs or reminder delivery. There is no fullscreen-only path to test; prove absent source registration, then cover real dialog and shell/zoom.
2. Countdown ignores xai_clock_tz/xai_clock_style. Browser-local date/time and Clock's selected IANA display timezone are separate. Clock preference changes must not rewrite card target_date, hidden/deleted markers or create a schedule. Cross-device zones do not preserve an absolute deadline because none is stored; CD-01 remains open.
3. Actual AccountDataGate keys business subtree by kind/id/generation/epoch. A→locked→B→A must not display A cards in B, allow stale Retry/export, or let late daily-effect callbacks write replacement generation. B's missing store has its own preset policy; no adoption of A data. Sign-out preflight/rail/Appearance/shared coordinator ordering stays unchanged.
4. Direct Countdown mutation is synchronous; it has no own awaited write queue. Deferred interval, visibility, React effect, URL revoke and retained event handlers still need disposal/scope coverage. Shared migration/deletion operations use their existing locks and generation guards. A test must not fabricate Countdown's Web Lock writer or claim sync raw comparison is multi-tab atomic.
5. getPref/readRawPref hide denied/malformed source as registry default; usePref metadata lacks coherent availability. merge filters invalid rows. Recovery rereads native raw and may reject parse/mismatch or read denial, but presentation can still synthesize presets. Valid absent/[] is different from unknown/unavailable source, stale account, malformed/null/wrong-root/mixed records. Display must not claim “no history”, “nothing due”, “saved presets”, or “no reminders scheduled for your account” from fallback.
6. The no-reminder disclosure is a feature-capability statement grounded in absent consumer/scheduler, independent of inaccessible card data. Where a data-specific assertion or safe continuation needs source availability, preserve raw and classify unavailable rather than seed/reset/write to probe. Existing public usePrefAsync offers source classification but also writer/Retry behavior; sibling DASH06 availability impact is PROPOSED, not an adopted shared API. Any needed stronger shared source contract requires separately registered independent impact/review/exact scope; this preparation cannot silently solve it.
7. Migration validator is registered by Countdown public index and uses Array.every(isCountdownCard), whose normalization may default optional fields; migration can preserve original raw bytes. Do not mistake validator admission for rich date-policy validation or import support. Account export uses captured-current-generation raw records with restoreSupported=false; device recovery is explicit separate legacy/archive export. Card soft delete retains history; account deletion erases captured owner generations and preserves tombstone, never all-device legacy or other accounts. No new schema/migration/cloud-sync is authorized.

## 6. Finite conditional paths and semantic locks

Current product write grant is **empty**. After independent contract review and qualified before evidence, root may activate only needed paths below with exact patch/row purpose. An actual algorithm/availability defect stops for separate impact, rather than expanding this list.

| Exact conditional path | Sole permitted purpose |
| --- | --- |
| packages/plugin-web-countdown/src/CountdownModule.tsx | Visible feature capability/repeat/expiry/history/restore explanation; relabel date-passed summary/history text, retain all writers and five views. |
| packages/plugin-web-countdown/src/CountdownCardView.tsx | Consistent elapsed/expiry date-difference labels only; no metric or action behavior change. |
| packages/plugin-web-countdown/src/internal/CountdownEditDialog.tsx | Accessible inline no-reminder/device-local/custom-no-repeat disclosure without changing validation, schema or submission. |
| packages/plugin-web-countdown/src/styles.css | Narrow package-scoped explanation/wrapping rules only if required by real host before; no global selector/token escape. |
| packages/plugin-web-countdown/src/__tests__/CountdownModule.test.tsx | Meaningful actual-view disclosure/non-side-effect and unchanged writer/lifetime assertions. |
| packages/plugin-web-countdown/src/__tests__/CountdownCardView.test.tsx | Actual rendered expired/date labels with unchanged computations. |
| packages/plugin-web-countdown/src/__tests__/CountdownEditDialog.test.tsx | Both-language accessible disclosure and retained validation/submit/cancel behavior. |
| packages/xai-web-countdown/docs/design.md | Current no-reminder/repetition/expiry semantics, observed discrepancies and explicit JOB future boundary. |
| packages/xai-web-countdown/docs/api.md | Clarify current public behavior without rewriting schema/date algorithms or old evidence. |
| packages/xai-web-countdown/docs/test.md | Full adopted CD03 semantic/evidence matrix and inherited gates. |
| packages/xai-web-countdown/docs/dev_log.md | Honest phase/evidence status; never mark full312/JOB/CD01/CD02 accepted. |

Exclusive semantic resources: Countdown rendered date/repeat/expiry copy and its package CSS/docs; one owner for any later CD-01/CD-02/REL05 writes to same package; immutable read locks on countdownMath/presetCards/cardsReducer/validate/useCountdownSaveRecovery, xai_countdowns raw/registry/account lifecycle, App provider/routes and shared CSS, CmdK reader, notification preferences/host capability/SW, canonical Clock methods and affected-caller suites. Different filenames/worktrees do not waive semantic conflicts. Source change from any sibling invalidates applicability and needs fixed integrated SHA verification.

Protected: all nonenumerated paths; Countdown schema/types/math/presets/reducers/recovery/migration/index/registration, storage engine/API/locks/generation/export/delete, account/host/router, notification permission/settings/JOB/SW, shared CSS/tokens/both Clock stylesheets, package configs/lockfile, original contracts/runners/logs/screenshots/cost records and global control/ledgers/inventory; other trees/main/dev/web/Desktop/D3/deploy/release. Conditional file list is not permission to manufacture local style/JS overrides during proof.

## 7. Complete business oracle matrix for before/fixed acceptance

| ID | Required source-qualified oracle |
| --- | --- |
| CD03-01 | Actual App EN/ZH visible/accessibly associated date-difference/local-time/no-reminder/no-closed-page-job explanation in all five views and editor. Original P0 lacks this clear capability explanation; freeze correct before failure without treating source search as UI evidence. |
| CD03-02 | Custom future, exact target instant, same-day just-past, past-day and leap/year/DST boundary records retain raw target/id/status; elapsed view changes without task completion/notification/job/recurrence writes. Distinguish calendar-day and absolute remainder assertions; preserve CD01 gap. |
| CD03-03 | Preset rollover across local day/month/quarter/year and annual/CNY boundaries: projected/current raw changes attributable solely to documented merge, stable IDs, hidden/deleted markers retained, failure not silently saved. Date-changing edit becomes custom. No claim of immutable deleted-preset date. |
| CD03-04 | Delete/hide/pin/copy/reorder/restore each preserves known semantics; custom elapsed appears in visible and history where applicable. Restore wording does not promise retained date/repeat. No added “completed” storage flag or card/job side effect. |
| CD03-05 | Actual new-document reload, route departure/remount, background/visible return and separate full browser-process close/reopen compare same raw custom cards/current now; lost memory draft limit explicit, no background delivery claim. No Countdown fullscreen fixture substitute. |
| CD03-06 | Native Notification absent/default/granted/denied plus settings on/off/DND: Countdown causes zero permission requests, Notification construction, showNotification, push subscription or scheduling calls across expiry/reopen. Fixture setup and host/sibling calls attributed separately; mere zero matching text insufficient. |
| CD03-07 | Actual host A→locked→B→A, signout, generation replacement, deletion tombstone and stale effect/Retry/export after disposal; no first-frame A data leak or old-generation mutation. Exact namespace/raw receipts, no mocked hook-only proof. |
| CD03-08 | Normal save/retry latest editor/id-stable action; quota/get-denial/parse/mixed-invalid/newer-tab conflicts and preset reconciliation failure; valid empty distinct from unavailable. Preserve raw, truthful no-save/no-empty claims; new shared-availability need freezes dependent assertion for separate impact. |
| CD03-09 | Real downloaded countdown-unsaved-change.json latestDraft/stored/pending and separate account export format; no save/guard release from export; caught Blob/URL/click errors, owner switch at boundary, raw-source denial and cleanup. Preserve REL05 limited evidence and any unproven download-phase gap. |
| CD03-10 | Legacy V1/V2 raw compatibility, explicit migration/rollback/delete/account export lifecycle plus read-only CmdK title identity; no new schema/importer, no source-error rewrite, no undeclared source writer. Sibling-reader mismatch is not a new recurrence owner. |
| CD03-11 | Production full CSS EN/ZH375/414/768/1024/1440, all five views/editor/error/empty-history/expiry disclosures, light/dark and zoom200%; pet-hidden at wide then resize/assert, pet-on changed controls, both Topbar statuses and shell overlays. Screenshots manually inspected; no overlap/occlusion/overflow; new targets44×44 if added. |
| CD03-12 | Trusted native Tab/ShiftTab/Enter/Space once/Escape, actual dialog focus trap/restore and readable accessible disclosure. Pipe CDP, isTrusted, passive key audit, no nativeVirtualKeyCode, qualified hash-bound per-stop pixelFocusWalk across themes/states. No DOM-click/calc-only replacement. |
| CD03-13 | Full package/type/lint/Web/CmdK/affected host and complete canonical r2 G1 with every judging copy and original predicted failure preserved; source/history/budget applicability per actual unit; no partial green accepted as full contract. |
| CD03-14 | New independent actual cross-vendor review of entire adopted obligation/evidence, then fresh non-author Astra full acceptance, sole-root unchanged-state evidence reconciliation, inventory and remote ancestry/sync receipt. No documentary or limited REL05 acceptance substitutes. |

Every row requires explicit before/fixed/reuse/blocked status and producing commit/hash; an unresolved dependent part remains blocking for full acceptance. No omission, duplicate attribution or blanket “out of scope” converts the full original item into a smaller display-only closure.

## 8. Gates and evidence production protocol

G0 fresh independent full contract review (existing-rule sufficiency, no question, exact11paths, fourteen oracles, source gaps and history). G1 separately registered finite source-only machinery, immutable fixtures/oracles, independent code review. G2 qualification plus permanent-unit admission. G3 complete valid P0 before. G4 bounded implementation by fresh author only after adopted scope. G5 independent unchanged-oracle fixed and affected/native proofs. G6 actual vendor. G7 fresh independent Astra all-row acceptance. G8 root evidence-only reconciliation with states unchanged. G9 fresh inventory and remote source/integration ancestry/sync. No gate inferred from author static PASS.

Each new run freezes requested/resolved full SHA, exact driver/fixture/dependency hash, streamed git archive, lockfile **df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9**, actual @repo exports/package-directory aliases, main-checkout read-only dependency root, and exclusive output reservation/launch ID. No imports from mutable sibling/root source, no main server. Capture stdout/stderr, actual code/signal, preconditions, partial launch, owned children/profile and bounded archive/build/CDP/exit/pipe/journal-close barriers. No terminal PASS before all owned cleanup/drainage and durable post-close receipt. Deadline or Promise.race is not cancellation. Never overwrite evidence, lose failures/refusals/calibration, force child exit0 or terminate unrelated browser.

Source-only prep can proceed while method work is blocked. Pixel/geometry evidence waits for qualified/adopted method or a separately reviewed lawful path. No browser, package, syntax-runner, build, test, lint, native, qualification, probe or vendor invocation is authorized here.

## 9. Complete canonical Clock r2 G1 dependency

Canonical **8bf613962517ee9b80bf51373e8ad88960c570cc**, `web-dashboard-clock-recovery-contract/contract.md`, SHA-256 **214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae**. Appendix A copies full §14, E1–E25, E24 rows and Rules byte-for-byte. This is a full dependency mapping, not authorization to rerun Clock or pretend CD03 produces Clock evidence. Root must assign every item to valid exact historic proof, outstanding Clock dependency, or separate affected CD03 run. None silently N/A.

More frozen boundaries plus **C-FB00210/10 judging**; Appearance frozen continuity-export24/26 cases006/007 plus **OE26/26 judging**; Features original13/15, **C-FD1 14/15 observed only**, **C-RD1 15/15 judging**. AppRail eight modes26/31/21/18/24/22/33/123, parent31, rail selfcheck165/rail104. F1 twelve originals + Appearance K-1selfcheck135/appearance123 + rail two =16, plus Clock c1–c5. Header controls/fixed/native18/Astra/Sol and frozen100MiB refusal/pre-registered capacity copies retained; no silent buffer edits. Accepted source equality enables justified reuse, not inherited UI acceptance for new copy.

Method status: correction review REVISE R1–R6/UNQUALIFIED, retention **3/3 exhausted** (145 assertions,41/42 case executions; final14/14/55), original Q1 focus1/3/other six0/3 and development2/83. B70 native12/6432, native development40/4884, visual3/3 exhausted, focusEN2/ZH2, F1formal2/180/development3/302 remain. No renamed fourth retry or actor/worktree/suffix reset. Full seven qualification units→freshQ2→rootadoption→Q3 valid originalP0before→M+G+B exactly-two-CSS geometry/G2/G3→versionedbaseline→E1–E5→Clock implementation/fixed/E1–E25/final remain conditional. CD03 may not weaken this chain.

## 10. Permanent running-unit census and reuse

Retained artifact index in Appendix B binds actual source, commands, modes, assertion counts and log correspondence; evidence files are not process counts. Historical before/after for author and independent runners are distinct launches. Their JSON and runner stdout describe the same author launches, not four launches. Logs lack complete PID/process admission/formal-vs-probe metadata; lifetime totals remain **unknown**, never0. Existing helper use, wrapper command, suffix, output path, fixture variant or new author cannot reset a permanent unit.

| Actual purpose/history | Available proof and admission |
| --- | --- |
| Original Countdown v1/V2/package | Owning dev_log records repeated110/110 suites,115/118 evolution, host135, build/smoke and temporary screenshots. Dates/labels/StrictMode/useDaysUntil math are not all actual current Module oracles. Missing raw launch identities/refusals are unknown, not successful0 or new capacity. |
| REL05 author native | `node docs/reviews/web-countdown-save-recovery/verify-native.mjs` defaults3cd8870 beforeFAIL; `COUNTDOWN_VERIFY_COMMIT=179e6d5 node ...` fixed7groupsPASS. Each writes before.log/after.log; before-runner.log/after-runner.log overlap same scenario records. Physical DOM click, esbuild fixture,390px/headlessChrome152/websocket,100MiB execSync archive, no pipe or trusted keyboard. Preserve original limits. |
| REL05 independent native | Same commands with `web-countdown-independent/verify-native.mjs`, beforeFAIL and fixed8groupsPASS, adds actual native preset failure/Retry. Accepted only save recovery; product source179e6d570fda291a58be2ed8972d151fb21e1cd6 compared to P0 below. Two known process purposes do not prove complete total; author+independent same original save-recovery assertions yield at least four retained launches in overlapping family. Cap compliance cannot be retroactively claimed. |
| REL05 package | tests.log128/14 and independent report rerun128/14; author describes initial restore fixture no-op corrected. That failed/adjusted attempt is retained as textual history without invented launch count. Typecheck/lint claimed exit0 but no complete raw-command family journal. |
| Shared storage/account/host/F1/vendor | Existing original families and canonical r2 G1 histories carry all prior launches/refusals/costs. Reuse source-qualified unchanged contracts; no package-wide “CD03 first run” allowance. Actual vendor history must be registered before launch, including refusals; new Codex instance is not vendor. |
| Genuinely new CD03 semantic purpose | Current Module/CardView/Dialog/test sources contain no complete visible no-reminder/custom-no-repeat/expiry-is-display disclosure or proof it remains true across permissions/closed process. The fourteen-row semantic oracle and disclosure-only assertion may be registered as a new narrow purpose after fresh source review. It does not rename REL05 native/package or inherited focus qualification as fresh0/3. |
| Future JOB reminder | Inactive authorization branch; a genuine new purpose only after separate authorized JOB scope, never obtained by relabeling existing elapsed display/reconciliation. |

For each needed run root must reconstruct permanent purpose↔command/mode↔all launches (including refusals, calibration/probe, aborted startup, duplicate logs, actual child units), source of census completeness, consumed/remaining≤3, fixed inputs and exact output reservation. Unknown inherited history blocks only that invocation; valid historical proof should be reused without recollection. Mixed old/new executions inherit each old unit they actually exercise. New-purpose source registration can proceed independently of a blocked old package/visual run; cannot reset its balance.

## 11. Disposition and next independent task

**PROPOSED / NEEDS_FRESH_FULL_REVIEW.** Existing rules support current no-reminder/date-difference explanation; no owner question sent. Reviewer must challenge the exact copy, entire recurrence/expiry branch, helper restore/preset discrepancies, source-error truth, historical applicability/caps and full canonical gates. A newly found contradiction in explicit owner authority may justify only a minimal question after that review; none is created merely because code has surprising behavior.

Remaining: fresh contract review/adoption, source machinery/review/qualification and actual permanent-unit admission, complete before, exact implementation, fixed/affected/account/disk/native/visual/trusted-keyboard proof, actual vendor, fresh full Astra acceptance, root unchanged-state evidence reconciliation and inventory/remote receipt. Source hypotheses are not reproduced product failures. Root handles remote preservation, receipt/cherry-pick, push/ancestry/sync and cleanup; child no push/fetch/sync. No unrelated worktree or branch touched.

Read-only discovery included guesses for nonexistent xai-web-data-actions/xai-web-notifications/xai-web-jobs/useAccountData and one guessed sibling contract path; corrected to actual storage/account/settings/capabilities/SW sources. These are file-discovery errors, not runtime probes or qualification. Commands were Git reads, rg/cat/sed/head and standard-library byte/JSON/census construction; no imported project runner or source execution. Memory quick search found no relevant entry and supplied no authority.

Preparation **1/3**; one concluding static document/input-integrity pass. Runtime/formal product/tests/build/lint/browser/native/qualification/probes/vendor/children/push **0**. Output hashes and commit are supplied externally to avoid self-reference.

## Appendix A — canonical r2 complete §14 verbatim

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


## Appendix B — retained actual Countdown artifacts and source applicability

All paths below are relative to docs/reviews at P; full hashes are in inputs.sha256. Unknown launch IDs/exits/formal-vs-probe status remain unknown. No report line is invented as an OS receipt.

| Artifact | Retained content / grouping |
| --- | --- |
| `web-countdown-independent/after.log` | 10 lines; {"name":"baseline","commit":"179e6d5","browser":"Chrome/152.0.7977.83"}; {"name":"PASS","scope":"Countdown save recovery","checks":8} |
| `web-countdown-independent/before.log` | 3 lines; {"name":"baseline","commit":"3cd8870","browser":"Chrome/152.0.7977.83"} |
| `web-countdown-save-recovery/after-runner.log` | 9 lines; baseline {"commit":"179e6d5","browser":"Chrome/152.0.7977.83"}; PASS {"scope":"Countdown save recovery","checks":7} |
| `web-countdown-save-recovery/after.log` | 9 lines; {"name":"baseline","commit":"179e6d5","browser":"Chrome/152.0.7977.83"}; {"name":"PASS","scope":"Countdown save recovery","checks":7} |
| `web-countdown-save-recovery/before-runner.log` | 21 lines; baseline {"commit":"3cd8870","browser":"Chrome/152.0.7977.83"}; AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `web-countdown-save-recovery/before.log` | 3 lines; {"name":"baseline","commit":"3cd8870","browser":"Chrome/152.0.7977.83"} |
| `web-countdown-save-recovery/tests.log` | 161 lines; Test Files  14 passed (14); Tests  128 passed (128) |

The before/after JSON logs and same-directory runner logs contain matching scenario observations; they are paired artifacts, not extra independent launches. Reports407259d and91f544e describe those runs; PID/complete parent-child census is absent. Unit assertions7/8 and package128 are not process counts; expected before assertion exit1 is evidenced by transcript/report, not retroactively a success.

| Historical source comparison | P0 applicability |
| --- | --- |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/AddCountdownCard.tsx` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/CountdownCardView.tsx` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/CountdownModule.tsx` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/__fixtures__/cards.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/index.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/CountdownEditDialog.tsx` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/accountMigration.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/cardsReducer.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/computeDaysUntil.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/countdownMath.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/formatTargetLabel.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/icons.tsx` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/options.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/presetCards.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/presets.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/useCountdownSaveRecovery.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/useDaysUntil.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/internal/validate.ts` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/registration.tsx` | byte-identical |
| `179e6d570fda291a58be2ed8972d151fb21e1cd6:packages/plugin-web-countdown/src/types.ts` | byte-identical |

Runtime package whole-tree equality179e6d5→P0: byte-identical. Shared host/storage/source and old esbuild harness limitations are not erased by leaf equality. Preserve original7/8-group bounded proof where applicable; it does not prove actual production host, trusted input, job non-delivery, current full CSS or fourteen CD03 rows.

## Appendix C — concluding static integrity receipt

One standard-library/Git-only static pass validated all **3326** manifest identities, amended and retained original task-card hashes, original goal, clean fixed parent, complete312 original field/order/unique attribution,39 reversible labels,933 original evidence plus exactly6TT08 additions/current939 and unchanged13/3/3/293 states/top-level execution metadata. Current TODO matches original; execution matches fixed discovery. Countdown/runtime owner docs, App source, storage source and lockfile match P0. Canonical full r2 hash and exact §14/E1–E25/E24/Rules copy checked. All14oracles and exact two new output paths built in memory before either write. This validates documentary identity/scope, not runtime, source machinery qualification, actual vendor or product acceptance. Preparation1/3/static1; all runtime categories0. A functions JavaScript orchestration parse error occurred before this pass launched; it performed no tool/filesystem actions, and was corrected before the single static execution.

## Appendix B — immutable full independent documentary review

# CD-03 contract review r1 — APPROVED, conditional documentary proposal only

## Disposition and authority

**APPROVED for the full proposed contract as a documentary basis, conditional on sole-root adoption and every retained evidence/dependency gate.** There are no blocking author-revision findings. This is neither implementation permission nor a product/runner/qualification/native/vendor PASS, reminder authorization, accepted date algorithm, caller acceptance, formal closure or release grant. The preparation remains UNADOPTED until the root explicitly adopts it. All fourteen business rows remain mandatory; none is closed by this review. Current product write grant remains empty.

Module **web**, workflow **D**, independent reviewer `/root/parallel_d_cd03_contract_review_r1`, never repair. This reviewer did not author the CD03 preparation and launched no children. Requested Astra identity is role configuration, not actual provider or cross-vendor attestation. Sole writable worktree `/Users/lijinlong/.codex/worktrees/audit-parallel-cd03-review1-20261010/XAI_Desktop`; detached fixed parent **2236ab6b87d2ec423e7e5920e6dfdd3ef0f7c8ad**. Fixed received input **a489adcb1205c56623738a8fa54696e40f22d17a**; original author source **2a35488361bfbad596473fc355bd18d8feb5b164**, exact parent **7eb8280736e0c30a908120704ea081d43cd12f16**; original scope **e041c2bc293b70db367444c62c4300231976dbf7**; product **f9eb4b1f207bc4b46f547b90afc250424b3c8695**. No moving controller HEAD was consumed.

Source contract SHA-256 **6ee52802a9cfe8ec74ab9726f5948c091817c5ed8ed8ff7ae27c6222b82d74d6**; source input manifest **5bb9d747f6271fca188fc97e3381e1d7cb9f43665ccb59166a59037aea67b3a3**; review task card **d4b65e89a4b6733550d93c96437e8f9d865203c4b24362649cbc02665a641140**. Source commit is exactly two ADD paths in `audit-parallel-cd03-preparation-r1/`, no other delta. Both source blobs match fixed input and reviewer parent. All **3326** inherited identities were independently hashed; this review manifest contains **3351** unique immutable identities. Corpus identity validation is complete, not a claim that every indexed file was semantically read or executed. Semantic review covered the complete proposed contract, original CD03 obligation, owning rules, actual relevant source graph, original REL05 history and complete canonical G1 text.

Original and corrected registration remain independently bound: original card at `11d1d67e67719cf331217786e60fa24ae487e12b` hash `d2413a79d1635264a86af9ef4fb7c63962bc7cc1fb8f3bace9116064460244e7`; explicit amendment at 7eb8280736e0c30a908120704ea081d43cd12f16 hash `c9afdcb0f8b29b0851b9426eb27ffc5f1b456734622e1839d641026d8a59e1da`. Stale POMO04 nested metadata was explicitly corrected, without replacing discovery/product identities, author1, or static1. Root receipt verification is not author semantic acceptance.

## Original obligation and no-owner-question challenge

Original CD-03 action **定义重复/到期动作及是否提供提醒** and acceptance **无后台动作时明确只是日期差展示；新增提醒接JOB统一机制** are retained exactly. The action does not compel implementation of reminders or recurrence. Its first acceptance branch explicitly permits date-difference presentation with clear disclosure. Owning `packages/xai-web-countdown/docs/design.md` Selected Option/frozen assumptions and Out of Scope explicitly exclude zero-day notification and countdown events; V2 adds dynamic presets, views and manual history operations without authorizing a scheduled reminder consumer. The original audit's Countdown row says date-difference display rather than reminder service and separately identifies local-time ambiguity. The visual recommendation to expose repetition rules does not override that selected design.

Therefore, the proposal's no-new-owner-question conclusion is supportable **for current capability disclosure** from existing authority plus source, not merely from missing code. Its full treatment of custom no-repeat, preset rollover, expiry-only projection, overlapping history and explicit Restore satisfies the repetition/due-action decision surface without inventing an occurrence writer. No current draft question is sent. A future operator-authorized reminder must enter the JOB mechanism with its own timezone/occurrence/cancellation/offline/closed-client/delivery and vendor gates. That branch remains inactive. A later actual conflict in explicit owner authority must return to independent review before a minimal owner question; this approval cannot select a new algorithm or substitute implementation accidents for owner acceptance.

## Complete semantic findings and protected dependencies

1. **Visible truthful copy is an actual remaining change, not existing UI proof.** Current Module/CardView/Dialog lack the complete no-reminder/custom-no-repeat/expiry explanation. EN/ZH proposed language accurately says device-local date difference/progress, no reminders or closed-page tasks, custom dates do not repeat, and preset dates refresh. “Date passed / 已到期” avoids task-completion semantics. Existing “completed/历史完成/已完成” and empty-history text must be checked at all five views and the actual dialog. Source absence establishes the before hypothesis only; actual UI before remains unrun.
2. **Automatic preset persistence remains explicit.** `CountdownModule.tsx` uses 60s wall-clock sampling, visible-return refresh and cleanup. Its todayKey effect calls `mergePresetCountdowns` and recovery.mutate on changed bytes; merge also runs during rendering and mutations. Hidden/deleted preset target/start dates can change while markers survive. Missing presets inject; failed writes can leave projected presets visible. Neither “never writes automatically”, “dates are archived unchanged” nor a background repeat job follows. Mount/StrictMode/no-op behavior needs actual attribution, not presumed one physical write.
3. **Expiry/history/Restore are bounded observations.** `isCardVisible` excludes hidden/deleted only; `isHistoryCard` also includes past values, so expired custom cards can be in both views. Persisted status is active/deleted, not completed. `restoreCard` explicitly restores visibility/start date and may invoke `bumpPastDateForward`; same-day earlier times, leap overflow, year normalization and subsequent preset merge remain observed behavior. The proposed cautious “may move…check its date afterward” wording neither promises unchanged dates nor approves a universal annual-repeat policy. Copy-as-new retains the date under a new custom identity.
4. **CD01/CD02 stay separate.** Runtime missing time resolves to midnight although the optional type comment says end-of-day/date-only. Calendar-day delta and absolute remainder are not one exact DST duration. Duplicate New Year presets remain CD02. CNY table 2026–2036 and February10 fallback do not establish astronomical accuracy. No schema/date algorithm/preset deduplication grant is hidden in wording or in this approval.
5. **Source availability is a protected unresolved dependency.** `getPref`/`readRawPref` can collapse denied/malformed reads into defaults; merge filters invalid records. Recovery's raw comparison is useful but not coherent availability, multi-tab CAS, or proof that malformed/mixed input cannot be rewritten. CD03-08/10 require preservation and truthful presentation; where the current source cannot establish this, dependent acceptance stays blocked pending separately registered impact/review/exact scope. The contract does not authorize seeding/resetting/writing to probe or silently importing a sibling proposed shared API.
6. **Export owner change is not waived.** `snapshot()` checks the captured owner before reading; Module then creates URL/anchor and clicks without another current-owner check. Prior A→B-before-snapshot evidence does not prove mid-export owner change, setup failure cleanup, physical download completion, or new-document isolation. CD03-07/09 explicitly retain those boundaries; no recovery/host/storage patch is authorized. General account export intentionally uses captured owner records and is distinct from Countdown unsaved-draft export; neither promises import restore (`restoreSupported=false`).
7. **Actual public ownership is preserved.** Public registration mounts at `/app/countdown` through shellRegistrations/App with full CSS and shell language. No own fullscreen/player or retained Countdown process exists; AccountStorageGate retains PomodoroSessionHost, while AccountDataGate keys the business subtree by kind/account/generation/epoch. All card writers route through Countdown recovery and captured usePref; shared migration/export/delete are separate legitimate owners. CmdK consumes committed title/identity and legacy targetDate rather than target_date; it cannot be a due-status oracle. Synchronous raw checks are not queued transactional writes. Account isolation, migration/raw compatibility, stale callbacks, tombstones and UI first-frame behavior remain required proof.
8. **No hidden scope or acceptance waiver.** Mid-export/source availability and method/budget limitations block implicated full rows; they do not disappear because the proposed product delta is copy-only. Every original row requires explicit before/fixed/reuse/blocked disposition and producing hash. Protected changes or genuinely reproduced defects trigger separate independent impact, not an author repair within this review.

No blocking contradiction was found in the documentary proposal. Findings 1–8 are explicit continuation boundaries, not residual product defects accepted as safe or assertions proven at runtime.

## Fourteen-row review coverage

| Row | Documentary review conclusion and retained proof |
| --- | --- |
| CD03-01 | Accept complete actual-App EN/ZH capability disclosure across five views/editor; source-based before hypothesis only. |
| CD03-02 | Accept future/equality/same-day-past/past/leap/year/DST raw invariance and no completion/job custom writes; CD01 dependency retained. |
| CD03-03 | Accept all daily/monthly/quarterly/yearly/annual/CNY preset transitions, stable IDs/markers and failed-save attribution; no immutable archive claim. |
| CD03-04 | Accept all explicit actions and visible/history overlap; Restore and copy semantics preserved without new status or recurring actions. |
| CD03-05 | Accept real route/reload/visibility/full-process close/reopen; in-memory draft loss and absent fullscreen preserved. |
| CD03-06 | Accept attributed zero Countdown scheduling/permission/delivery calls across real native permission/settings/DND states; no text-only proof. |
| CD03-07 | Accept full real account transition/generation/delete/stale work matrix, raw namespaces and first-frame oracle; source gaps stay blocking. |
| CD03-08 | Accept raw denial/parse/mixed/newer-tab/quota/preset failures and valid-empty versus unavailable; protected source-availability dependency unresolved. |
| CD03-09 | Accept actual disk payload, setup errors, owner-change boundary and cleanup; prior REL05 proof is narrower and cannot waive mid-export gap. |
| CD03-10 | Accept V1/V2 migration/export/delete compatibility and read-only CmdK identity; no new importer/schema/recurrence writer. |
| CD03-11 | Accept full production CSS, both languages/themes, five widths, zoom200%, pet/Topbar/overlays, inspected screenshots and added target sizing. |
| CD03-12 | Accept trusted pipe-CDP keyboard/dialog/focus with passive audit and qualified frozen pixelFocusWalk; no DOM-click substitute. |
| CD03-13 | Accept full package/type/lint/Web/CmdK/affected/native/canonical G1, with source-qualified reuse and permanent-unit admission; no green subset. |
| CD03-14 | Accept genuine actual-vendor review, fresh independent Astra full original acceptance, root reconciliation, inventory and remote receipt; this review supplies none. |

## Exact conditional surface and preserved gating

The eleven proposal paths below were checked, remain conditional, and confer **zero current product writes**:

- `packages/plugin-web-countdown/src/CountdownModule.tsx`
- `packages/plugin-web-countdown/src/CountdownCardView.tsx`
- `packages/plugin-web-countdown/src/internal/CountdownEditDialog.tsx`
- `packages/plugin-web-countdown/src/styles.css`
- `packages/plugin-web-countdown/src/__tests__/CountdownModule.test.tsx`
- `packages/plugin-web-countdown/src/__tests__/CountdownCardView.test.tsx`
- `packages/plugin-web-countdown/src/__tests__/CountdownEditDialog.test.tsx`
- `packages/xai-web-countdown/docs/design.md`
- `packages/xai-web-countdown/docs/api.md`
- `packages/xai-web-countdown/docs/test.md`
- `packages/xai-web-countdown/docs/dev_log.md`

Only visible capability/date/history/restore labels, narrowly required package CSS, meaningful scoped tests and four owning docs are contemplated. Math, presets, reducers, recovery, types/schema, migration, public registration, storage/source APIs, account/host/router, notifications/JOB/SW, shared CSS/tokens/Clock stylesheets, configs/lockfile, original methods/runners/logs and all control/ledger/inventory paths stay protected. CD01/CD02/REL05 concurrent source changes invalidate application of this review to an integrated SHA; semantic ownership is not bypassed by another path/worktree.

G0 adoption → independently authored/reviewed source-only machinery → qualified immutable oracles and permanent-unit admission → complete valid original P0 before → bounded fresh-author implementation → unchanged-oracle fixed/affected/native proof → actual vendor → fresh original full acceptance → sole-root evidence-only reconciliation → inventory/remote ancestry/sync remain mandatory. Before evidence cannot be skipped because source suggests the outcome. Method work may progress source-only while qualification is blocked; no measurement or product execution was authorized here.

Canonical Clock r2 **8bf613962517ee9b80bf51373e8ad88960c570cc**, hash `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`, full §14 including E1–E25/E24/Rules was compared against Appendix A and is identical after surrounding blank-line normalization. Preserve all judging C-FB00210/10, OE26/26, C-RD1 15/15, frozen failures and predicted-only C-FD1 14/15. Preserve F1 sixteen invocations plus Clock c1–c5, AppRail all eight mode counts/parent31/selfcheck165/rail104, Header host/native18/Astra/Sol controls and capacity-refusal copies; no terminal green or later evidence substitutes for missing earlier IDs. Rules for valid source-bound historic reuse and applicability-dependent non-reruns remain intact.

Inherited method status stays UNQUALIFIED / REVISE R1–R6, retention3/3 exhausted (145 assertions,41/42 cases; final14/14/55), Q1 focus1/3 and other six0/3, development2/83. B70 native12/6432, development40/4884, visual3/3, focusEN2/ZH2, F1formal2/180 and development3/302 remain. Full seven-unit qualification, freshQ2/root adoption, valid P0before, exact-two-CSS M+G+B geometry/G2/G3, versionedbaseline/E1–E5 and all fixed/final gates are not waived. These are retained source-bound histories, not new executions by this reviewer.

## Historical processes, counts and integrity result

REL05 author before at3cd8870 failed create/delete UI retention; fixed179e6d5 passed7 scenario groups. Independent before failed and fixed passed8, adding preset write failure/Retry. Before/after JSON logs and same-directory runner logs are paired observations, not extra independent processes. The command family uses `node docs/reviews/web-countdown-save-recovery/verify-native.mjs` or the independent counterpart, default before3cd8870 and `COUNTDOWN_VERIFY_COMMIT=179e6d5` fixed. The author before transcript retains AssertionError/nonzero; reports describe exits, while full PID/launch IDs/formal-versus-probe census remains unknown. Both runners use an esbuild fixture,390px headlessChrome152, websocket transport, DOM clicks and100MiB archive buffering. Their source and logs were read, never executed or edited.

At least four retained before/fixed launches overlap the original save-recovery assertion family. That is not evidence of cap compliance or permission for another run. Package128/14 author plus independent suite report and the earlier restore-fixture no-op correction remain, alongside owning110/115/118 tests, host135 and historical smoke/build claims. Assertion totals are not process totals. Unknown inherited launch/refusal/child-unit counts remain **unknown**, not0; CD03 evidence[] is not a fresh budget. Permanent cap3 cannot be reset by author, wrapper, suffix, worktree, reclassification or renamed caller. Genuinely novel disclosure semantics can have separately registered source-bound purpose admission, without resetting mixed inherited units. Reuse eligible exact historical proof instead of rerunning; no rerun approval is given here.

Single concluding standard-library/Git-only static pass succeeded: all3326 identity hashes; exact source two-ADD/parent; all312 original ordered fields and unique mapping;39 reversible module labels; original933 evidence preserved as ordered prefixes plus exactly6 TT08 additions =939; formal13 completed/3 verification_pending/3 in_progress/293 pending and299 unclosed unchanged; CD03 remains pending with empty evidence; task metadata hashes; canonical §14 copy;14 rows;11 paths; historical179e6d5→P0 whole Countdown runtime-package equality; source/fixed-parent binding and lockfile hash. Fixed-input ledgers/TODO equal reviewer-parent bytes.

**Product-boundary qualification:** P0→review-parent diff under `apps`, `packages`, root package.json and lockfile contains exactly four accepted TT08 owning documents: api.md, design.md, test.md and dev_log.md under `packages/plugin-web-time-tracker/docs/`. Actual runtime/test/CSS/host/storage/package/config/lockfile source boundaries are unchanged. This is not a claim that the entire apps/packages tree, including docs, is unchanged.

## Cost, limitations and next task

Review iteration **1/3**, prior source author **1/3**, concluding static integrity pass **1 consumed /1 permitted, PASS**. Runtime/formal product/tests/build/lint/browser/native/qualification/probes/vendor/children/push/fetch/sync **0**. No product code or runner was imported/executed. Read-only commands were Git, rg/cat/sed/head and standard-library byte/JSON analysis. One incorrect discovery path `apps/web/src/AccountDataGate.tsx` returned missing-file and was corrected by locating actual storage AccountDataGate; it is not a test or static-pass rerun. Some batched output was truncated; required proposal/critical source sections were read separately. The preparer's single orchestration JavaScript parse failure before any tool/static launch stays retained; this review does not erase it. No reviewer static check failed or was retried.

All runtime/business acceptance, complete historical process census, qualification, actual UI screenshots/input/native account/disk/failure proof, cross-vendor work, fresh caller acceptance and remote preservation remain unrun by this reviewer. All input validation and both complete output buffers were constructed before either authorized file write. Exactly review.md and inputs.sha256 are added; no protected/global/runtime file is modified. Output hashes, commit/parent and final clean-tree receipt follow externally to avoid self-reference.

Next: root may adopt this exact document proposal, then register a fresh finite source-machinery/impact task with all14rows,11conditional paths, full G1, protected source/export dependencies and permanent-purpose histories intact. No author2 correction is requested. No immediate product execution or rerun is authorized. Root alone preserves the original commit remotely, integrates, verifies ancestry and performs sync; this child does not push or reconcile ledgers.

## Appendix C — canonical r2 full §14 verbatim

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

## Appendix B - complete immutable impact review

# CD-03 complete source machinery impact review r1

**APPROVED — complete conditional technical basis only.** This reviews the entire b5e6843 proposal, including all fourteen CD rows, its S-CD source API, export boundary, twenty-three proposed product paths and eighteen machinery files. No row is accepted or closed. The proposal is source-feasible under its explicit prerequisite holds; it does not establish a current implementation/API grant, qualification, before/fixed evidence, product acceptance or release authority. Root adoption and new exact source contracts/cards remain separate. No blocking author-revision finding was found in this impact-level basis.

## Fixed identity and authority

Module **web**, workflow D, independent reviewer /root/parallel_d_cd03_machinery_full_review_r1. Sole checkout /Users/lijinlong/.codex/worktrees/audit-parallel-cd03-machinery-review1-20261010/XAI_Desktop. No prior CD03 author role, children, other-worktree writes or reviewer repairs. Requested Astra configuration is not provider attestation or actual cross-vendor proof.

- Direct parent P: **4d780b62f086c14de3bbf1255dd939342ffad692**.
- Fixed input I: **d75e4e1e619b36bc64f411f960603712df5479f1**.
- Reviewed source S: **b5e6843bce9a6feb62afb6c451451e626b51c999**, direct source parent **7b890e0f027c5a1d258954bfc002731b23950c15**.
- Full preparation **2a35488361bfbad596473fc355bd18d8feb5b164** and full documentary review **fda069eb300704f24384eccacfd74ffc147aef37**.
- Product P0 **f9eb4b1f207bc4b46f547b90afc250424b3c8695**; original O **e041c2bc293b70db367444c62c4300231976dbf7**.
- Canonical Clock r2 **8bf613962517ee9b80bf51373e8ad88960c570cc**, SHA-256 **214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae**.
- Lockfile **df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9**.
- Card: docs/reviews/20260908-full-product-audit/parallel-control-r1/task-cd03-source-machinery-impact-review-r1.json. Dynamic registration is in execution-state.tasks plus this card; the original task-registry is not a registry of every later dynamic ID.

AGENTS, CLAUDE, workflow/multi-machine rules, original goal attachment, authority overlay and goal-A/goal-D were read. Exact two-ADD/no-push/zero-runtime scope overrides generic handoff commands; root owns remote preservation/integration/sync. All nonallowed paths remain protected. No moving controller HEAD was used.

## Original obligation and complete technical judgment

Original action **定义重复/到期动作及是否提供提醒**; acceptance **无后台动作时明确只是日期差展示；新增提醒接JOB统一机制**. Owning design excludes zero-day notifications and countdown events. V2 presets/history do not supersede that authority with a reminder grant. Thus the existing date-difference/no-reminder capability rule is sufficient; no new owner question or recurrence policy is invented. Custom targets, local-midnight fallback, calendar-day versus absolute-remainder distinction, dynamic hidden/deleted presets, approximate CNY fallback and explicit Restore remain as documented. CD01/CD02 remain independently owned; explanation of source behavior does not approve their unresolved algorithms.

**Actual public host.** Public Countdown index registers migration validation and CSS; registration reads shell language and mounts the non-toggleable route through routes/modules/shellRegistrations. AppProviders owns live WebAuthSessionProvider, device transport, account deletion and Todo bridges. main.tsx runs registerServiceWorker then bootstrapObservability before StrictMode/AppProviders/RouterProvider. The proposed archived composition can preserve those real exports and startup functions. It cannot replace them with a private provider, config=null, mock authenticated client, direct accountScope activation or a Countdown fullscreen fixture. Managed SDK auth-generation storage and business generation/epoch are distinct, while language/theme/density are device keys. Public auth store createCandidate/setSessionItem/publish can establish a fixture; real coordinator/UI transitions must establish subsequent identity changes. Source auth-generation-client constructs the actual SDK with its generation-specific storage facade. Device RPC POST paths, headers and body in the proposal match device-transport; the Todo nonce lease request/response fields match AppProviders. Startup swallowed promise failures require explicit acquisition, not ready-selector inference. Actual SDK/Vite/browser condition and endpoint closure still need source binding and qualification.

**S-CD coherent read.** Storage owns codec/registry/account helpers and physical same-tab bus. An additive, xai_countdowns-only reader/hook can read one physical value, classify absent/valid/invalid/unavailable and check identity, marker and tombstone before/after without changing generic engines. Unchanged public helpers can establish physical ownership; isReady alone cannot. A predicate supplied by the owning Countdown package avoids reverse/deep imports from storage. Current required admission is exactly normalizeCountdownCard: nonnull object; nonempty id; bilingual string title; round-trip date; normalized light/image plus corresponding cover_url condition. Optional V2 fields normalize/default rather than reject. No stricter optional schema, prototype condition, unique-ID rule or Date.parse rewrite is implied. The callback must retain this admission and must not add raw-data diagnostic logging; existing validator DEV diagnostics are not a licence for new evidence logs containing user records.

Raw bytes remain separate from projected cards. No unavailable/invalid source may become [] or a synthetic empty-history/due/saved claim; genuine absent/[] is different. Whole-array checking covers invisible rows. Stable predicate/type/result/SSR behavior must be frozen in the new contract. Same-tab/native events invalidate and reread; post-subscribe reread, denied-key rebinding, marker/tombstone/clear handling, visible-return/explicit refresh and disposal tokens are necessary. No polling promise or arbitrary same-tab native-write notification is fabricated. Retaining usePref solely for its captured setter is compatible only when fallback values no longer decide truth. Recovery mutation/Retry must bind the validated observation, unchanged original raw baseline and current controlled editor; preserve latest draft, action IDs and visible counts. This is not CAS and does not solve arbitrary external ABA. DASH's sessions-only source draft does not grant a CD domain or API.

**Finite integration.** The eleven original conditional paths plus twelve proposed exceptions form twenty-three unique paths. Recovery/source/export changes require a semantic amendment even where Module/Dialog/tests already appeared in the copy-only list. The storage new internal reader, additive barrel, focused test, four persistence-contract docs, existing recovery hook, local predicate/export helper and their tests provide a finite credible route. No generic getPref/usePref/usePrefAsync/codec/registry/scope/lifecycle/migration/delete/export, host/router/startup, schema/date math, package/config/lock, shared CSS/Clock or notification/JOB/SW change is approved. Existing consumers, types/SSR/barrels and no-write behavior require compatibility proof; no blanket package-wide unchanged assertion. Shared storage/DASH writes serialize; CD01/CD02/REL05 require integrated fixed-SHA review. Insufficient scope means a fresh bounded impact, never an implicit extra path.

## Export boundary adjudication for full CD03-07/09

Current Module export builds JSON/Blob/URL/detached anchor, calls click, then schedules revoke; recovery.snapshot checks owner before the raw read. There is no current appendChild, post-setup owner check or actual disk acknowledgement. A throw after URL allocation can skip cleanup. These are static source gaps, not executed failures or permission to repair.

The proposed local helper is feasible for captured immutable payload, raw-read failure, owner checks after reentrant setup boundaries and immediately before click, ownership of allocated URL/anchor from allocation, once-only cleanup scheduling, and mounted/captured-owner error publication. It must retain actual current draft/stored/pending shape; invalid-but-readable raw may be exported without normalizing it. It never releases save/departure guards, clears B errors, rereads B, changes pending state, retries click or claims saved. Revoke-throw must be retained as failed cleanup; “exactly once” cannot mean that a throwing browser primitive successfully revoked a URL. Actual dispatch and cleanup outcome remain independently observable.

The full original rows require no stale export invocation after disposal/account transition and honest owner-change boundary evidence. They do **not** specify recalling an already activated download or durable in-memory drafts. That interpretation follows the full original contract's §5 and CD03-05/07/09, its explicit forced-loss limits, and the independent review's retained export gap. It is not a new policy exception. Bytes irrevocably handed to the browser remain captured A bytes; a later transition cannot be called proof of B access, nor may post-handoff persistence be labelled cancellation.

A guard before link.click does **not** establish atomicity inside a reentrant wrapper, event handler/default action or native handoff. Source must record and qualify pre-guard switch, actual click/default-action switch and post-handoff switch as separate causes. This review approves no expected PASS for an unobserved window. The source contract must bind actual event propagation, native delegation and causal control outcomes; stronger assertions remain BLOCKED until an equally strong bounded path is demonstrated. A future finding that dispatch can occur from a stale disposed instance cannot be waived with the post-handoff rule. No current row07/09 closure follows.

Actual disk evidence requires owned clean directory, action/document/owner/guid correlation, bounded actual completion, no pending partial file, safe regular-file open, size/hash/parsed latestDraft/raw/pending and exact file-count delta. Blob interception/click return is insufficient. Wrong/preexisting file, cancellation, destination denial and delayed completion controls must fail through the same path. Page code has no general disk-success/error channel and cannot claim completed download; setup errors are locally visible only to the same owner/instance. Cancel/scrim/Escape, route disposal, reload and process termination retain existing draft-loss limits. No new durability, import, route guard or sign-out coordinator policy is approved.

## Whole machinery, control and evidence review

All eighteen candidates are reviewed together: manifest.json, cases.json, controls.json, inputs.sha256, source.patch, README.md, root-supervisor.mjs, archive-command.mjs, local-services.mjs, public-host.tsx, passive-prelude.js, transition-capture.js, native-driver.mjs, download-observer.mjs, focus-adapter.mjs, command-lane.mjs, qualification.mjs, evidence-index.mjs. These are proposed ADDs under audit-parallel-cd03-machinery-r1, with no present writer card. Future patch representation must list the complete source set and serialize the other seventeen paths; self-referential patch bytes are not required. No permanently refusing mandatory skeleton qualifies as implementation.

The full source's C01–C14 relation is finite and keeps before/fixed/integrated obligations, unique concrete IDs, raw events and emitting files. Concrete expansion and exact SHA/output registration remain mandatory before source writes/runs; this review does not reserve runtime paths. Every failed/unrun/reused obligation remains indexed; no invented payload or placeholder PNG. K01–K14 name real package test/type/lint/build scripts, and full canonical E1–E25 supplies the additional actual command/mode families; original stdout/stderr and closure are required. Build is local only. Unknown command identity blocks admission. Q01–Q18 cover actual source/archive/SDK/account/read/property/reload/time/save/export/disk/zoom/focus/keys/process/CDP/journal/replay acquisition; parser-only reports cannot qualify any positive or fault control.

A root-reserved outer envelope precedes supervisor parsing/import and binds actual authority/lineage/purpose/history/resources. Builtins-only bootstrap, streamed git archive and both exits, consumed dependency bytes captured once and destination-rehashed, real Vite browser/SDK/module/CSS resolution and actual tool/cache closure are feasible. Local wx is not global anti-replay. One deadline includes bootstrap through cleanup/final writes; child PID/start/group acknowledgement, owned asynchronous work, actual stdout/stderr EOF, late errors, termination and joined writers precede sealing. Server/browser premature exit0 is failure. Quarantine cannot be promoted to immutable complete. No Promise.race cancellation fiction or manufactured durable record after a root/disk failure.

Shared I1 remains a dependency: proposal's synchronous property/event acquisition is a plausible design requirement, not proof of complete React/native paths. Exact own/inherited descriptors, receiver/return/throw/delegate-once, restoration, same-node same-task reversal, detached state, native edits and capture transparency need the full source/config table and genuine causal controls. Shared final **f667a0b6996b4039d2c4e5ca28657953703e830b** is a separately supplied, **UNADOPTED** prerequisite proposal; its absent consumed ReactDOM/SDK inputs and named outer machinery remain holds. Reading its fixed source does not repin this review or approve it. No shared final source3 dispatch is created here.

Focus retains the frozen bacdbbc file/block/function identities, original decoder/hue/scroll/stability/timing/predicate requirements, whole-document forward/reverse census and injective descriptors, every per-stop capture, outside shell/pet/status/overlay surfaces and independent screenshot judgment. Real Retina CSS/raster mapping, target revalidation after reload/resize/scroll and owned native menu200 cannot be replaced with CSS zoom, fake gradient or DPR override. Current shared successor and Clock methods remain unqualified; retention3/3 and visual3/3 remain exhausted. Production canonical activation remains closed and is irrelevant to inventing a Countdown queue.

## Fourteen-row full disposition

| Row | Complete retained scope and technical basis; no runtime acceptance |
| --- | --- |
| CD03-01 | Actual public App EN/ZH disclosure, five views/editor, correct association and removed-label negative; source absence is only the before hypothesis. |
| CD03-02 | All future/equal/same-day/past/leap/year/DST and four-zone cases, raw invariance and due-write attribution; current date semantics and CD01 gap retained. |
| CD03-03 | Every day/month/quarter/year/annual/CNY-table/fallback rollover with visible/hidden/deleted and quota, stable identity/markers; date/time edit becomes custom. |
| CD03-04 | Create/edit/delete/hide/pin/duplicate/reorder/restore, writable/quota, latest controlled draft and stable Retry IDs; overlapping expiry/history and Restore boundaries retained. |
| CD03-05 | Actual route out/back, new document reload, true background/return and full process reopen, clean/pending; forced-loss limitations explicit. |
| CD03-06 | All native Notification availability/permission × settings × DND × expiry/reopen; harmless causal observer controls and attribution, no synthetic permission or source-text PASS. |
| CD03-07 | Managed A–locked–B–A/signout/generation/tombstone/delete × real interval/visibility/preset/Retry/export causes; full first-frame/namespace/effect acquisition, I1 hold and export boundary above. |
| CD03-08 | Absent/empty/validV1/V2/denied/parse/null/wrong-root/mixed/newer-tab/quota/preset failure, initial/recovery; coherent source, truthful counts, raw/draft retention and no fallback proof. |
| CD03-09 | Full setup/reentrant-owner/click/revoke/disk error and actual payload matrix; append fault only if adopted helper appends; complete boundary adjudication above, no stale or disk-success waiver. |
| CD03-10 | V1/V2/malformed/mixed legacy import/rollback/export/delete plus CmdK read-only identity, exact owner namespaces; no schema, importer or account-export policy rewrite. |
| CD03-11 | Full EN/ZH/light/dark/five widths/100–200 zoom/views/editor/save-source-error/empty-history/pet plus both Topbar states/overlays; actual screenshots and geometry/manual review. |
| CD03-12 | All languages/themes/views/editor/error/zoom whole forward/reverse stops; trusted pipe CDP/isTrusted/no nativeVirtualKeyCode, once-only actions, dialog focus restore and qualified pixel pairs. |
| CD03-13 | K01–K14 plus complete canonical E1–E25/E24/Rules, original and judging copies, affected/integrated/native/closure receipts; each unit's real history controls admission. |
| CD03-14 | Actual independent different-vendor review and fresh non-author Astra entire original acceptance, then sole-root unchanged-state reconciliation/inventory/remote ancestry/sync. |

No CD03-08/10 omission, nor CD03-07/09 partial acceptance, is authorized. Future source dependencies are not present qualification or implementation. A newly exposed contradiction or protected requirement returns for precise independent technical review; no standards waiver or invented product choice.

## Histories and immutable controls

REL05 author before3cd8870 fails and fixed179e6d5 passes7 groups; independent before fails and fixed passes8 including preset Retry. Four retained launches overlap save-recovery purposes; JSON and same-directory runner logs are paired records, not extra independent launches. Their esbuild/private fixture, headless390px/websocket/DOM-click/100MiB archive and incomplete PID/probe/refusal census limit reuse. Package128/14, owning110/115/118 and host135 plus initial restore-fixture correction remain. Full leaf equality179e6d5→P0 does not prove actual managed host or all14 rows. Actual lifetime totals are unknown, never zero or inferred remaining cap.

Permanent cap3 includes aborted startup/refusal and follows assertion purpose across actor/path/worktree/source. A new source-grounded disclosure/coherent-source/mid-export assertion can be registered narrowly, but mixed suites inherit every old unit. No reset for a new caller/filename or qualification label. Unknown/exhausted histories block dependent invocation only. Source preparation is not runtime admission.

Full canonical §14 below is preserved verbatim, including E24 and Rules. More C-FB00210/10, OE26/26, C-RD1 15/15 judge; original frozen failures and predicted C-FD1 14/15 remain. F1 sixteen invocations, Clock c1–c5, AppRail eight mode counts and31/165/104, Header18/host/Astra/Sol/refusal-capacity copies, all package/reader/settings/downstream units remain. Full archive-copy diff/loaded closure is independent evidence, not a summary count.

Clock REVISE R1–R6/UNQUALIFIED remains: retention3/3 (145 assertions,41/42 cases, final14/14/55), Q1 focus1/3 and other six0/3, development2/83; B70 native12/6432, development40/4884, visual3/3, focusEN2/ZH2, F1formal2/180 and development3/302. Seven-unit qualification/freshQ2/root adoption/complete validP0before/exact-two-CSS M+G+B geometry/G2/G3/versionedbaseline/E1–E5/full fixed-final are not waived. REL and shared final-author3 holds remain.

## One static receipt, costs and next gate

PASS: all5807 immutable inherited identities verified, 206710010 byte reads including retained attachment aliases; full3351/full3326/shared2808/DASH649 manifest inclusion verified. Source S exactly two ADDs and source blobs equal fixed I/P; complete preparation and review copied unchanged;14 rows,11+12=23 product candidates,18 machinery candidates; canonical full section14 exact. Original312 ordered fields,39 exact reversible labels,933+6=939 evidence,13/3/3/293 states and CD03 pending/evidence[] unchanged. Runtime/product parity is distinct from exactly four accepted TT08 documentation exceptions. Registration checked via actual execution-state.tasks list and exact card. Output manifest 5857 unique immutable identities. Source impact SHA-256 7debf67ee86f11e0ee069ee6a13c5dc2dcfe24a81082844d50a1d86997263c6e; source manifest 6bee7d221e1454c9d6eef6df978043a7ebcec340f9efca2bbdd448ae914687fd; review card 6490eaf8cc41cdb56724f4a6bfac156a16d0bbb94259df6b6d3d48c286e76ee4. Concluding static1/1 consumed, PASS; no checker failure/retry.

Review iteration1/3; prior impact author1/3 preserved. Runtime/tests/typecheck/build/lint/browser/native/server/qualification/probes/vendor/children/push/fetch/sync **0**. No project module/runner imported or executed. Actual provider token/currency costs unavailable, not reported as zero. Only Git and standard-library/text reads plus exact documentary writes/commit occurred.

Read-discovery errors: a metadata-print helper assumed execution-state.tasks was a dict, raised AttributeError and was corrected to the observed list before the sole concluding checker; guessed separate managedAppProviders and root shellRegistrations paths were absent, actual AppProviders and routes/modules source read; f667 abbreviated object was ambiguous with a blob, resolved from Git's listed commit to full f667a0b6996b4039d2c4e5ca28657953703e830b. Oversized views were truncated and required sections reread. These are disclosed read errors, not static-integrity reruns or runtime probes. Memory search supplied no technical authority. No semantic/checker retry occurred.

All input validation and both complete UTF-8 output buffers precede either write. Only review.md and inputs.sha256 are ADDs. Review does not repair or amend the source. External receipt supplies output hashes/commit/parent/clean status without circular self-reference.

Next: root may adopt this entire conditional technical basis at exact hashes. Fresh finite source contract/amendment and independent full review must freeze the API/error/export/host/acquisition/emitter boundaries before exact source registration. Missing ReactDOM/SDK/outer machinery, shared I1, focus qualification and unknown/exhausted units remain blocking prerequisites. Then lawful source review/qualification/root adoption, complete valid original P0 before, bounded fresh implementation, full unchanged-oracle fixed/affected/integrated/native/G1, actual vendor, fresh entire original acceptance, root reconciliation/inventory/remote ancestry/sync. No source author or runtime run is dispatched by this review.

## Appendix — canonical Clock r2 full §14 verbatim

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

## Appendix C - complete shared prerequisite review (conditional, not qualification)

# SHARED / NATIVE-HOST-FOCUS-IMPACT-REVIEW2

Verdict: **APPROVED — complete five-row conditional technical basis only. FINAL CALLER SOURCE3 DISPATCH REMAINS BLOCKED pending the explicit consumed-source and root-capture prerequisites.** The exact author3 proposal provides a bounded design for I1's synchronous acquisition and preserves the four previously conditional bases. This approval does not attest a working collector, ReactDOM forwarding, an SDK endpoint implementation, focus calibration, method qualification/adoption, production activation, either caller's source approval or acceptance. It is not a request for author4.

## Fixed identity, independence and scope

Module **web (project-system)**; workflow responsibility D under the sole A-Codex root. Fresh independent reviewer `/root/parallel_d_shared_full_review_r2`, with no earlier authorship in this caller and no children. The card's Astra/gpt-6-astra configuration is not provider or actual cross-vendor attestation. Sole checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-shared-impact-full-review2-20261010/XAI_Desktop`.

- Clean direct parent R: `3ee736788a5d488505cd322a95ae61e2c0d76715`.
- Fixed input F: `4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d`; no input repin.
- Reviewed final source S: `f667a0b6996b4039d2c4e5ca28657953703e830b`, direct parent `43ba9fcfadb1075bc117b4d75f8888573d1ae2f2`.
- Product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Full impact1: `516495625056a6123f22ff67df61c9c34dff2484`; full review1: `b7e075c51e77fbf9c376ae33e3a9e2fb3b69fd06`.
- Task card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-shared-native-host-focus-impact-review-r2.json`.
- TASK source2/review2: `f8821c1bb99a51f07a3e6d077bc3391affde7a99` / `cd7be1409e6198e5032dceb85bad8cca2182c3ae`.
- MET source2/review2: `624e016359a0b48662828ffc9cc15db453792278` / `21519e7f55db4fa609e194e5d2a9bd622445107c`.

AGENTS, CLAUDE, shared workflow/multi-machine rules, original goal, authority overlay, goal-D and the exact card were read. The current task is dynamically registered in execution-state.tasks and its task card; the initial three-node task-registry is not required to duplicate every later task. Only the two exact ADD outputs in this card may be written. All source/product/tests/config/lockfile/CSS/storage/schema/host, protected original methods/contracts/runners/logs/evidence, global controls/ledgers/inventory and other worktrees remain untouched. Root retains integration, preservation/push and sync ownership under the explicit worker no-push scope.

## Complete integrity and obligation review

All **2842/2842 author3 immutable objects / 68,811,558 bytes** were read and SHA-256 verified, zero mismatches. Whole review1 **2821/2821** and impact1 **2808/2808** identities are hash-consistent subsets. TASK review2 **477 raw/477 unique** and MET **2663 raw/2651 unique** retain their twelve consistent aliases; union **2781**. This review manifest binds **2863 immutable objects / 71,675,457 bytes**, SHA-256 **fb357c8de96a333b89fccd879b6babfe6f7a78fc2f3fd91715535e921a0964d4**.

| Exact input | SHA-256 |
| --- | --- |
| Reviewed S impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| Reviewed S inputs.sha256 | a0ae1254c46e6bff30713cb3436b80bede46d1248ceaf925373164595de7aaad |
| Review2 card at R | c7db9dd03ee035b89e91527f67bcdb8f3061bc2b971c9a2827a0ab52835d0504 |
| Author3 card at43ba | 25fd81b588291013f8ee35fe62f30804e01a0e60c41abdd901f073c661449d4c |
| Corrected failure receipt at43ba | f2fd4c29ff8e1e1778fac3e49ec62279e7bf11ec9cc74b0412588a9a1a515f37 |
| Original receipt at2ce65ab | cf9402bab9f27765cb8f0a72847e0377657774dfd7de296a7759e223e452cb05 |
| Whole Appearance frozen file | 5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4 |
| Full Appearance block / 21749 bytes | e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43 |
| pixelFocusWalk / 6395 bytes | 1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620 |
| Original probes | 4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4 |
| Full canonical Clock r2 /152183 bytes | 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae |

All12 TASK and14 MET source2 ADDs equal their immutable source commits and this fixed checkout. Full binary/full-index patch reconstruction equals protected source.patch, including every non-patch output: TASK **1735850 bytes /648436d64cb21e552c8b057e8ecb76fa34cf1e5586e78a7769b8e18944982f4d**; MET **1541142 bytes /d895b2ba053b1b1d9f77d649f22f94ef97f5fadeb368747c6c4ea66d84224b85**. Original TASK case/command/variant/oracle/expected-result/path mappings and entire MET row/artifact/closure arrays were compared, not sampled. MET source2's2706 declarations/2705 unique paths remain historical; review does not silently repair the duplicate.

This is full immutable-byte validation, complete matrix/patch reconciliation and technical review of the full proposal, predecessors, reviews, governing contracts and relevant product paths. It is not behavioral review of every dependency/product byte or visual acceptance of historical images. The entire corpus, not only the I1 paragraphs, is retained.

The four P0→R apps/packages differences are exactly accepted TT08 owning documents `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md`; runtime paths remain unchanged. Whole apps/packages equality would be false and is not asserted. Original TODO.sections[].tasks preserves 312 ordered field records. EXECUTION.items retains 939 evidence references, formal13/3/3/293 and299 unclosed. The older scope-map snapshot retains933 references; that snapshot does not overwrite the six later references. Its39 routed labels remain exactly reversible via original_module (30 project-system and9 cross-module verification-index). TASK-06 and MET-05 remain separate workflow-C owners, pending and unaccepted.

## Five-row disposition and I1 reasoning

| Row | Review2 disposition | Binding condition |
| --- | --- | --- |
| P-HOST | APPROVED conditional technical basis | Real archived AppProviders/Router, non-null managed config, actual main startup, SDK and auxiliary bridges through the admitted local HTTP boundary; complete consumed-source/schema proof and actual correspondence qualification remain mandatory. |
| P-ACT | APPROVED qualification-only seam; production HOLD | Existing public test activation can qualify acquisition in disposable documents only. Actual P0 activation stays closed. A test-seam queue cannot satisfy production mutation/queued-writer acceptance. |
| P-LEDGER | APPROVED bounded synchronous-acquisition-v1 design; I1 design correction sufficient | Approval is conditional on exact pre-import descriptor/event/config/source closure, transparent implementation and all actual causal pairs. ReactDOM forwarding and SDK consumed-source proof are missing, so source3 is held. |
| P-FOCUS | APPROVED named native-focus-context-v1 successor basis only | Protected references/thresholds/context, authentic calibration and target revalidation, native Retina/actual menu200, full outside census/reverse/actions and per-stop capture must qualify independently. |
| P-OUTER | APPROVED enclosing supervision and finite representation basis only | Root pre-reserved, immutable identified machinery before inner parsing/import; actual streams and full descendant/write quiescence, source/command/browser closure and complete original-emitter relation. Missing root machinery is a source3 prerequisite, not a runtime placeholder. |

Review1 correctly rejected observer/Profiler/rAF-only acquisition: a value written and restored in one turn can leave no attribute mutation or later differing sample. S §3.3 now specifies an actual acquisition boundary. It captures native setter/method entry and exit synchronously before product/framework imports; window capture listeners acquire native edits before root-delegated React handlers; DOM remove/replace/insert boundaries freeze subtree values before destructive changes and after insertion. Detached nodes retain stable identity and copied historical scalar values. A same-node wrong value followed by restoration produces two entries; a removed subtree is serialized before removal rather than dereferenced when MutationObserver eventually runs. DocumentFragment contents are captured before native consumption. These mechanisms address the prior counterexamples as a design, subject to their source and native capability predicates.

The following are inseparable conditions of that approval, already required by S, not a new reviewer repair:

- Native getters are captured and invoked only on brand-checked native objects for snapshots. Snapshotting must not consult own/user getters, coercion hooks, live Event/DOM/session references or React tracker internals. Public getters delegate exactly once. Native setters/methods receive the original receiver and uncoerced arguments once and return the identical result/promise or rethrow the same object. Coercion must not happen earlier merely to log an argument.
- Collector faults cannot replace native returns/throws or alter storage/CSS/focus/events. A reserved sticky failure channel survives append/record limits, exceptions and unacknowledged tails. Failed native calls have attempt/throw records; they are not claimed successful mutations.
- Reentrant application writes during native conversion retain parent/child entry/exit order. Only collector-internal captured-native reads may be suppressed; an entire-call busy flag would erase A07 and violate the contract.
- React's instance value/checked tracker must retain its own semantics. The proposed preinstalled prototype wrapper is viable only if the exact consumed ReactDOM own descriptor forwards to it. Defining/deleting/replacing descriptors or prototypes cannot create a silent bypass interval. Captured setters from another realm, unwrapped cached functions, eval writers and unsupported editor/Range/indexed-option paths require complete source/config closure or a refusal before business admission.
- Native checkbox/radio/select/reset side effects need group snapshots and their genuine default-action ordering. Reading the final DOM, or one later input event, is insufficient by itself. Required trusted typing/reset/select/checkbox paths must actually be implemented and qualified; unsupported autofill/accessibility/realm paths cannot be allowed through merely because a later generic CAPTURE_INCOMPLETE might fire.
- Initial unknown auth identity remains unknown. Acquisition starts before coordinator construction; initial public snapshot/subscription epochs and subsequent marks must causally bind the interval. No late lookup may rewrite earlier records with final owner/epoch. Property operation, DOM mutation, React commit, pre-paint state and screenshot remain distinct truth categories. No claim of painted transient or speculative React commit follows merely from an intercepted setter.

The acquisitionContract in each future manifest must freeze the exact report/review/adoption, product/source/configuration, collector exports/digests, descriptor owners and supported operations/events, prelude order, source-path-to-boundary map, realm/frame policy, node/record/byte/chunk limits, terminal channel and fourteen control IDs. Missing consumed code/forwarding proof, unknown API/realm/config or imports before prelude trigger the specified refusal, not an intentionally incomplete last-slot skeleton. MutationObserver oldValue/takeRecords is a corroborating cross-check; quiet time and no observed mismatch cannot prove absence of unacquired activity.

All14 causal pairs are retained. A01 property-only write/restore and A02 detached-history subcases cover value/checked/selected wherever used; A03 text/attribute correction; A04 real browser edit before React restore; A05 peer selection/reset default paths; A06 unsupported own descriptor; A07 conversion reentrancy/receiver/throw; A08 loss/overflow/exception; A09 wrong epoch/remount; A10 locked insertion/removal; A11 stale A publication across A→B→A; A12 genuine reload identity; A13 real prelude/import/closure; A14 restoration conflict/late writer. Every negative needs an actual cause, observed invalid value, exact intended rejection, counter/raw order and separate cleanup result beside its successful positive. A mutated report or unrelated nonzero cannot qualify acquisition. All pairs remain UNRUN; all TASK59/MET33/original39 artifact controls and the missing original bad-source-hash pair remain additional obligations.

## Host, activation and caller completeness

The actual main source calls registerServiceWorker then bootstrapObservability before rendering StrictMode/AppProviders/RouterProvider. The former has real DEV unregister/cache deletion behavior; the latter initializes transport/controller and asynchronous web-vitals work. S preserves those calls and import ordering, source mount effects, genuine StrictMode duplicates, untouched-main correspondence and errors. A ready flag cannot replace this evidence.

AppProviders' live non-null config chooses managed generation persistence and includes AccountDeletionRecoveryBridge, DeviceSessionBridge and TodoWebRuntimeBridge. Source-level composition is feasible through public exports without a private provider or config=null. Auth generation and business storage generation are separate identities. Device language/theme/density/features keys must come from actual public physical-key resolution, not account:g1 convention. Complete initial/read/mount/action/drain phases and every attempted effect remain required.

The real local HTTP boundary must bind SDK method/path/query/body/header/response semantics, password/refresh/user/logout when consumed, real device register/heartbeat with Authorization/X-Device-Id/X-Sync-Version/device_id, and any declared Todo nonce lease types. Keep invalid/expired/wrong-owner/malformed session, device401 unknown_device/403 device_revoked, stale A response after B, separately scoped deletion cleanup, Todo owner/lock cleanup and undeclared calls. SDK package/version labels cannot prove its actual endpoint/token/storage behavior. Disposable transport isolation cannot suppress actual auxiliary startup or masquerade as production backend acceptance.

P0 canonicalCommandState defaults commandActivation=false and both mutation paths refuse before the lock. The exported test setter is a legitimate qualification seam, not a production call. In an admitted activation-capable specimen require an actual product-origin navigator.locks request pending behind the exact A lock, request/callback/promise identities and corroborating held/pending query. Retain that same operation through lock/owner revocation/B readiness/release/settlement, with nonempty B sentinels and all writes/removes/bus/draft/count/export/download/revision/receipt publications. Gate-off click plus held fixture lock and stale screen coordinates prove neither queue nor stale closure.

TASK retains all ten T06 obligations,111 original cases/4440 paths and added112/5072/64 visual/59 controls. Preserve original expected-P0-failure mappings literally: row0 calendar, row1 Completed, row2 Won't Do, row3 Trash, each language, footer-skipped and all empty-array positives. New child predicates cannot let a harness/parse/activation/selector failure satisfy an expected product red. Keep five completion seeds, eight source states, six recovery/lock/retry/export paths, actual source status, once-only smart Enter/neighbor actions, all original command arrays plus web-build and original seven future product paths. The full appendices below enumerate every active case and command.

MET retains all89 rows/2437 original artifact obligations/2497 closure entries. M2 has12 surfaces; M3 has48 pointer preservation cases with nonempty valid records/profile sentinels; M4 alone has2 empty-fixture real Weight save/reload cases; M5 has8 complete walks/actions; M6 has14 real route entries; M7 has2 source/account rows; M8 remains one blocked historical retry unit; M1/M9 source/qualification remain. Keep transient history/bus/modal effects, real rail/CmdK and correct non-null new-document/new-loader readiness. Weight stays implemented, Sleep/Water/Exercise Planned and Custom adjacent. No MET-01–04/REL acceptance is borrowed.

## Focus successor and protected environmental semantics

Whole frozen Appearance file, complete decoder/helper/selftest/walk block, function and surrounding probes were independently bound. The proposed successor retains the protected original; byte equality is identity evidence, not environmental equivalence.

The exact native-focus-context-v1 mapping is a bounded coordinate-domain change with original signed max-distance, offset−2..offset+width+2 band, own interior+band union, next-stop exclusion pad3 for outline none (otherwise max(0,offset)+width+3), and exact RGBA differences. At scale1 it must reproduce original per-stop predicates/failure classification and decoder/crop bytes. Keep sameSize, ownPixels>0, outline!=none, ownDiff>0. bandRatio<0.15 remains manual-review evidence, not a waiver or alternate threshold.

Retain original <0.01 CSS-px alignment, matching clip/scroll/hover, at most6 captures120ms apart until two consecutive byte-identical PNGs, fonts then at most120 double-rAF settlement iterations with only true Infinity excluded. Complete context includes native trusted press/anchor/parkMouse, pageOffset, dimensions, Buffer/inflate, evaluate/CDP, record/pre/observe/checkDeferred/saveShot and partial-failure flushing. Do not replace those functions with a callback or silently extend time/tolerance.

Authentic archived Appearance supplies real hue (>8 colors), browser-decoder equality and correctly mapped full-vs-clip/scrolled-coordinate checks. An unscrollable page cannot claim a scrolled negative. Target Tasks/Metrics independently revalidate actual content and page/nested-scroll mapping at every relevant reload/resize/menu/display change, including a genuine discriminating wrong-coordinate negative. No injected hue, preference transfer, resampling, guessed DPR or pixelSelfTested=true shortcut.

Full whole-document selector/filter and shell/rail/topbar/sidebar/filter/footer/dialog/pet/outside census remain. Descriptor↔node mapping is injective and source/AX bound before and after structural actions, independently of traversal. A repeated other:button cannot close a cycle. Unsupported reachable shadow/iframe scope refuses. Use actual nonfocusable anchor with measured hit, no forced focus/tabindex/inert/style. Full forward/reverse140-bound cycles, original body-crossing bound, every focused/moved-on pair and fatal deferred outcomes remain. Weight and Log Enter/Space each need true once-only behavior with real Close between trials; TASK actions need causal histories. Independent visual judgment remains.

TASK's factors1/2 map to100/200 only at real menu boundary. Use actual owned browser executable/PID/start/window/tab/CDP context identity and passive focus/visibility, not bundle ID alone; native helper is a supervised child. Measure real Retina DPR and effective viewport after genuine menu200 and invalidate calibration. No emulation/pinch/CSS zoom substitutes. The visible New task composer is a legitimate mobile dialog path; it does not satisfy separate desktop New list metadata obligations or make hidden-sidebar rows visible.

## Root supervision, exact emitters and missing-source prerequisites

P-OUTER requires serial root reservation/consumption of immutable task/card/review/adoption/actor lineage/permanent-family/resource paths before dispatch. An inner wx file cannot prove global anti-replay. Existing outer capture machinery must be named, inspectable and hash-bound before final source3, and capture actual supervisor stdout/stderr before inner card parsing/import. Missing machinery is an admission hold. Root cannot silently implement a new runner while recording adoption.

One total deadline includes archive/dependency snapshot/Vite/browser/native helper/action/capture/cancellation/finalization plus reserved teardown, preserving original case/outer bounds. Register every descendant/task/descriptor/write before work and acknowledge any detached ownership transfer. Distinguish successful short child exit0 from premature server/browser exit0. Join process and both stream EOF/close paths, retain late tails/parser/page/CDP/idle errors and retained-descriptor descendants, continue cleanup after individual failure. Track writes through write/fsync/close; seal only after actual quiescence. QUARANTINED_UNJOINED is partial mutable/unresolved evidence, never an immutable complete terminal.

Capture dependency bytes once, write/hash actual destination and derive versions from consumed metadata. Bind Node, pnpm launcher and implementation closure, git/tar/Chrome/osascript, PATH/env/cwd/cache/optimizer/temp. Actual Vite browser/import resolution, transforms/CSS/assets/loaded modules and actual command tool/source closure must be retained. Node require resolution and hashing node_modules alone do not prove browser or command provenance. Qualify actual React+SDK host success and configured partial import, wrong-root/cache/launcher failures, true late streams and terminal writers.

Every original obligation needs explicit original→lane→producer→applicability/disposition→terminal hash mapping. Keep actual build.stdout.log/build.stderr.log where the lane builds; exact approved reused build receipt is the only possible declared reuse. All original MET39 legacy control paths need emitters. Reconcile the duplicate source-observations declaration without deleting either historical obligation. For a successfully closed N-stop cycle, only N..139 may be UNUSED_RESERVED_SLOT with census proof; interrupted/unvisited expected stops are MISSING/BLOCKED. Save every observed pair and raw partial failure. No fake PNG, empty placeholder, wildcard producer or partial-lane caller PASS.

**Hard prerequisite disposition:** actual immutable ReactDOM/React and SDK consumed source bytes are absent from the author's worktree and are not established by this review. This reviewer also has no node_modules in the owned checkout; no dependency installation or other-worktree lookup was performed. The package lock identifies a selection, not the implementation of the forwarding, native write paths or SDK APIs. Actual source/config/forwarding proof, browser support constraints and existing root-capture closure remain unproven. Both final caller source3 slots stay HELD even after root records this conditional design approval.

A separately registered evidence-only source-byte collection can be a viable prerequisite because it can capture existing exact package/entrypoint metadata, dependency bytes and root machinery identities without changing S or product/method semantics. That possibility is not authorization or proof of availability. Root must first identify a permitted read-only source and exact finite output/verification scope; collection must preserve actual bytes and origins and expose absence/mismatch honestly. It cannot install/execute dependencies under this review, invent forwarding proof from versions, add capture design, repair S, widen supported surfaces or become author4 under another name. Actual evidence must then substantiate the already required source-to-boundary/SDK/root predicates before last-slot dispatch. If it reveals a semantic design gap or cannot be supplied within legitimate remaining scope, freeze affected descendants and continue other audit flows; do not consume final author3 on a partial skeleton.

## Finite source plans, immutable histories and complete downstream gates

Future TASK12 paths and MET16 paths remain exactly as S §7, enumerated below. These are proposed later registrations, not this review's write grant. TASK source.patch must serialize other11 paths; MET other15, full-index/binary, self-excluding only itself. Every collector/control and exact finite emitter relation must be complete before a source author writes. Concrete collector hashes arise from source3 and require source-review3 plus later qualification; unavailable external conditions require implemented admission refusals, not missing mandatory code.

Shared author3/3 is exhausted; NO author4 or disguised repair. Author2's FAILED1/1 raw-versus-unique assertion remains failed, with full hashes/patch comparison/both buffers/writes UNRUN. Original bad-metadata receipt at2ce65ab is retained; corrected43ba receipt binds exact P0 only and changes no budget. Review2/3 is consumed here. Both TASK and MET source-author2/3 and source-review2/3 remain consumed and their final3 held. MET's earlier author2 FAILED static also remains. Unlaunched TASK-only impact0 grants no new capacity.

M8 native lifetime remains UNKNOWN with known lower bound2, not exact used2/3. Clock retention3/3 and visual3/3 remain exhausted; REL02+REL03 V1 UNKNOWN remains a local hold. Map actual command/suite membership to actual families; a new name/source/worktree/actor/qualification label never resets a unit. Root alone may reconcile histories from complete immutable evidence.

The chain remains: conditional full impact review and exact root adoption plus all source prerequisites → separate complete final TASK/MET source authors → fresh source-review3 → independently budget-admitted actual acquisition qualification → fresh qualification review/root exact-hash adoption → separate complete valid original P0 before → authorized bounded TASK implementation or evidence-backed MET no-change/separately approved repair → complete fixed/candidate/integrated/native/visual/source/account/affected/full canonical G1 evidence → actual different-vendor raw verdict → fresh full Astra acceptance separately for each caller → root evidence-only reconciliation → fresh inventory and root remote preservation/ancestry/sync. No approval here skips any link.

Full canonical Clock r2 Required evidence §14, including heading/introduction/E1–E25/E24/Rules, is reproduced verbatim below. Keep original12 F1 plus Appearance K-1 and rail modes, Header host/native/Astra/Sol and each refusal/capacity-copy diff; full dashboard packages/Web/CmdK/storage; AppRail8 Sol+host; Appearance all/host/package+OE; Features all/host/readers/package+original+C-FD1+C-RD1; More all/host+original+C-FB002; Sticky, Notifications, Date & Time, Smart Lists, Collaborate, Pomodoro, settings-shell/rest. Conditional native exclusions require their exact empty-diff/invariance proof; affected shared changes need separately registered full native/F1/engine/hook/caller reruns. C-FB00210/10, OE26/26 and C-RD1 15/15 are judging expectations; original Appearance24/26, Features13/15 and diagnostic C-FD1 14/15 remain preserved. Historical expected counts are not fresh PASS. Every row is exact admitted reuse, new exact-SHA evidence or explicit BLOCKED/missing.

## Cost, errors and closeout

One bounded semantic static review pass1/1, review2/3. Runtime/tests/build/typecheck/lint/browser/native/server/qualification/probes/historical reruns/vendor/children/product or runner implementation/global writes/push all0. Provider token/currency billing unavailable, not zero. No reviewed module, test, parser, build or browser was executed.

One discovery command `9ac03f` exited1 because it guessed nonexistent `audit-parallel-shared-native-host-focus-impact-source-r2/report.md`; the preceding git stat succeeded. Actual paths were then discovered from the immutable commit. This was a read-only path lookup, not a semantic checker retry or runtime invocation. One tool-side JavaScript string-construction call raised SyntaxError before any exec command or semantic checker launched; the string quoting was corrected before the sole checker invocation. Several overlong read results were truncated and narrowed into section/schema reads. Memory keyword search returned no relevant task authority and was not used for conclusions. No input/hash/dirty/scope drift or semantic validation retry is claimed.

All inputs, both complete output buffers and their relations were validated before any write. The exact two ADDs are committed with command-local hooks disabled and Why/What/Scope/Risk/Docs/Tests. Only mechanical commit/hash/clean checks follow the one pass. Exact exec completion/session receipt is handed to root; no background completion is assumed. Root owns remote preservation, integration and sync. Formal13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed stays unchanged; overall goal incomplete.

## Appendix A. Exact later source sets and current protected outputs

Future TASK prefix docs/reviews/audit-parallel-task06-runner-source-r3/; exact12: `driver.mjs`, `fixture.tsx`, `host-fixture.tsx`, `vite.config.mjs`, `frozen-focus-adapter.mjs`, `browser-zoom-adapter.mjs`, `run-unit.mjs`, `qualification-controls.test.mjs`, `execution-manifest.json`, `qualification.md`, `inputs.sha256`, `source.patch`.

Future MET prefix docs/reviews/audit-parallel-met05-runner-source-r3/; exact16: `driver.mjs`, `fixture.tsx`, `vite.config.mjs`, `host-adapter.mjs`, `focus-adapter.mjs`, `focus-context.mjs`, `source-gate.mjs`, `browser-controls.mjs`, `root-supervisor.mjs`, `launch.mjs`, `qualification-runner.mjs`, `qualification-controls.test.mjs`, `execution-manifest.json`, `qualification.md`, `inputs.sha256`, `source.patch`.

Current protected source2 hashes:

| Caller | File | SHA-256 |
| --- | --- | --- |
| TASK | browser-zoom-adapter.mjs | 19e346df32cf5bc194971bb27660d921485783e60a0bdbb41892e71669dcbee0 |
| TASK | driver.mjs | 97e922fac08b2c0003b8ec75042db58d9d682ed00909071537edaad3fc5be727 |
| TASK | execution-manifest.json | 119b2034076db203c146ee526948bb7ee178b4018062da054e22970f268632c5 |
| TASK | fixture.tsx | a2321634a4da0eec0f29fce2e403d126df88ff93e87c3bd0a315dd816a81005c |
| TASK | frozen-focus-adapter.mjs | 771529809e16d8a7476ec805743d1926d6c5bb26ff800b077e08476f7ded57df |
| TASK | host-fixture.tsx | 66af650cde86ee551ffbba9d125756b6fa9916fe9aa3bcd466406c2c20876afe |
| TASK | inputs.sha256 | 32f8cc141bae8d3a3de4dd7645904926b5aa05b5807e193ef49ce8d6750a9730 |
| TASK | qualification-controls.test.mjs | c0d65412d5ec0f8ed67538251be5779e91e8875ef22f2e07d6f327aae842ab96 |
| TASK | qualification.md | 03742f66d38ac6581e49ce61d8602dbe0533c6b08f71b0893632310b188734e0 |
| TASK | run-unit.mjs | 03155f963569e1c576fc044eff4340256371e42dfbaa2956d83905bf522c470d |
| TASK | source.patch | 648436d64cb21e552c8b057e8ecb76fa34cf1e5586e78a7769b8e18944982f4d |
| TASK | vite.config.mjs | bae300e7cc3bc17d9b3612c9da48286b1ab356260e308707f94c60d829d027ff |
| MET | browser-controls.mjs | a2f24c0bbbd55252f87f1318a43bc50f324c11218de1be002445c81242df45af |
| MET | driver.mjs | dc966b17227096baf6c70d4b1114901566c13c4626090646599f93e59ac59b98 |
| MET | execution-manifest.json | 5fc9c44c269752fbac9cf7e9573b9c0c2c894ac932d2979d1b39a4220a0cbcd9 |
| MET | fixture.tsx | 20c1d146e90ad0883bf806b5366c52aecdebdcdb2a1616ef13ebf0cf7cc2a294 |
| MET | focus-adapter.mjs | 634c68a007dd9d226cb73be4854542e3c0ccb1c93f475bb49d6968a5075c35a7 |
| MET | host-adapter.mjs | 929a47746ae358ba2eb73f8c07110a4d200083caae0ad71cacf90cc7e22be7b0 |
| MET | inputs.sha256 | 1f0a8ec6f4589b9cdb15b1d9ef3bf71ffd9869482a4838d2c6f1bf05ed9e7ec4 |
| MET | launch.mjs | 154b191fdbda7a833e10df551dfd200cfc2558cc4f03f10a17096cc5c4840117 |
| MET | qualification-controls.test.mjs | c1c8723af480a8791f27b2da0b6534ca3050133c1793761cf3fb75c96fc13663 |
| MET | qualification-runner.mjs | 3379eae01bccc326cf925072e3c6164388ed87a75bf4970a464ea3508368959a |
| MET | qualification.md | 0a2e01854ac2cae5c40f8d39c867bdb33df80794c15df89dd5f9233eb98a4b51 |
| MET | source-gate.mjs | db956638e9d2a8632e873504473c56756e52d5dc1ad851b4c0a24d45d0f55033 |
| MET | source.patch | d895b2ba053b1b1d9f77d649f22f94ef97f5fadeb368747c6c4ea66d84224b85 |
| MET | vite.config.mjs | fb6ef283d36586b15b727d8755dc307ac1f11d90ff6921396a17aaf4c7e987a9 |

## Appendix B. Complete TASK active matrix

Original111 objects and command arrays remain normative; web-build is additive. All4440 historical and5072 active paths are verified in their fully bound manifests, not replaced by this compact table.

| Case | Lane/kind | Oracle rows | Original expected P0 failures |
| --- | --- | --- | --- |
| destinations-en | module/destinations | T06-1,T06-2 | ["destinations-en:row-0","destinations-en:row-1","destinations-en:row-2","destinations-en:row-3","destinations-en:footer-skipped"] |
| inert-en | module/inert | T06-2 | ["inert-en:footer-skipped"] |
| neighbor-en | module/neighbor | T06-3 | [] |
| destinations-zh | module/destinations | T06-1,T06-2 | ["destinations-zh:row-0","destinations-zh:row-1","destinations-zh:row-2","destinations-zh:row-3","destinations-zh:footer-skipped"] |
| inert-zh | module/inert | T06-2 | ["inert-zh:footer-skipped"] |
| neighbor-zh | module/neighbor | T06-3 | [] |
| completion-normal | module/completion | T06-4 | [] |
| completion-legacy-missing | module/completion | T06-4 | [] |
| completion-legacy-false | module/completion | T06-4 | [] |
| completion-dated | module/completion | T06-4 | [] |
| completion-undated | module/completion | T06-4 | [] |
| source-empty | module/source | T06-1,T06-2,T06-5 | ["source-empty:footer-skipped"] |
| source-envelope | module/source | T06-1,T06-2,T06-5 | ["source-envelope:footer-skipped"] |
| source-legacy | module/source | T06-1,T06-2,T06-5 | ["source-legacy:footer-skipped"] |
| source-stale-date | module/source | T06-1,T06-2,T06-5 | ["source-stale-date:footer-skipped"] |
| source-unknown-date | module/source | T06-1,T06-2,T06-5 | ["source-unknown-date:footer-skipped"] |
| source-corrupt | module/source | T06-1,T06-2,T06-5 | ["source-corrupt:footer-skipped"] |
| source-unsupported | module/source | T06-1,T06-2,T06-5 | ["source-unsupported:footer-skipped"] |
| source-read | module/source | T06-1,T06-2,T06-5 | ["source-read:footer-skipped"] |
| recovery-quota | module/recovery | T06-6 | [] |
| recovery-throw | module/recovery | T06-6 | [] |
| recovery-missing-lock | module/recovery | T06-6 | [] |
| recovery-rejected-lock | module/recovery | T06-6 | [] |
| recovery-held | module/recovery | T06-6 | [] |
| recovery-baseline | module/recovery | T06-6 | [] |
| account-a-to-b | host/account | T06-7 | [] |
| account-logout | host/account | T06-7 | [] |
| account-generation-revocation | host/account | T06-7 | [] |
| account-late-completion | host/account | T06-7 | [] |
| account-stale-retry-export | host/account | T06-7 | [] |
| host-route-default | host/route | T06-8 | [] |
| host-route-wildcard | host/route | T06-8 | [] |
| host-route-disabled | host/route | T06-8 | [] |
| host-focus-cycle | host/focus | T06-2,T06-8 | [] |
| visual-1440x900-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| tasks-test | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| tasks-typecheck | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| tasks-lint | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-host-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-types | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-lint | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| board-link | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| statistics-completion | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| storage-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| auth-provider-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| rel03-host-boundaries | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| actual-vendor | independent-actor/external | T06-10 | [] |
| fresh-final-astra | independent-actor/external | T06-10 | [] |
| web-build | archive-command/command | T06-8,T06-9 | [] |

All command arrays retained:

| Case | Exact pnpm arguments |
| --- | --- |
| tasks-test | `["--filter", "@repo/plugin-web-tasks", "test"]` |
| tasks-typecheck | `["--filter", "@repo/plugin-web-tasks", "typecheck"]` |
| tasks-lint | `["--filter", "@repo/plugin-web-tasks", "lint"]` |
| web-host-tests | `["--filter", "@repo/web", "test"]` |
| web-types | `["--filter", "@repo/web", "check-types"]` |
| web-lint | `["--filter", "@repo/web", "lint"]` |
| board-link | `["--filter", "@repo/plugin-web-board-workspaces", "test"]` |
| statistics-completion | `["--filter", "@repo/plugin-web-statistics", "test"]` |
| storage-tests | `["--filter", "@repo/plugin-web-storage", "test"]` |
| auth-provider-tests | `["--filter", "@repo/web-auth-device-session", "test"]` |
| rel03-host-boundaries | `["--dir", "packages/plugin-web-storage", "exec", "vitest", "run", "--config", "../../docs/reviews/web-account-data-isolation/host-review.config.mjs"]` |
| web-build | `["--filter", "@repo/web", "build"]` |

All59 control IDs: Q01, Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25, Q26, Q27, Q28, Q29, Q30, Q31, Q32, Q33, Q34, Q35, Q36, Q37, Q38, Q39, Q40, Q41, Q42, Q43, Q44, Q45, Q46, Q47, Q48, Q49, Q50, Q51, Q52, Q53, Q54, Q55, Q56, Q57, Q58, Q59.

## Appendix C. Complete MET matrix

All2437 original artifact obligations and2497 source closure entries remain normative in the fully verified manifests.

| Row | Contract | Kind | Permanent unit |
| --- | --- | --- | --- |
| M1-source | M1 | source | MET05/planned-source-qualification |
| M2-en-light-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-light-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-light-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M4-en-weight | M4 | weight-positive | MET05/planned-surface-pointer-positive |
| M4-zh-weight | M4 | weight-positive | MET05/planned-surface-pointer-positive |
| M5-en-light-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-light-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-dark-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-dark-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-light-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-light-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-dark-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-dark-1440 | M5 | keyboard | MET05/planned-keyboard |
| M6-en-direct | M6 | entry | MET05/planned-host-source-account |
| M6-en-rail | M6 | entry | MET05/planned-host-source-account |
| M6-en-cmdk | M6 | entry | MET05/planned-host-source-account |
| M6-en-sleep | M6 | entry | MET05/planned-host-source-account |
| M6-en-water | M6 | entry | MET05/planned-host-source-account |
| M6-en-exercise | M6 | entry | MET05/planned-host-source-account |
| M6-en-query | M6 | entry | MET05/planned-host-source-account |
| M6-zh-direct | M6 | entry | MET05/planned-host-source-account |
| M6-zh-rail | M6 | entry | MET05/planned-host-source-account |
| M6-zh-cmdk | M6 | entry | MET05/planned-host-source-account |
| M6-zh-sleep | M6 | entry | MET05/planned-host-source-account |
| M6-zh-water | M6 | entry | MET05/planned-host-source-account |
| M6-zh-exercise | M6 | entry | MET05/planned-host-source-account |
| M6-zh-query | M6 | entry | MET05/planned-host-source-account |
| M7-identity | M7 | account-source | MET05/planned-host-source-account |
| M7-mixed-source | M7 | account-source | MET05/planned-host-source-account |
| M8-retry | M8 | retry | REL-05/metrics-native-save-retry |
| M9-controls | M9 | qualification | MET05/planned-source-qualification |

All33 current control IDs: missing-sleep, missing-water, missing-exercise, enabled-sideeffect, suppressed-log, untrusted-dom, missing-weight, missing-log, selected-after, wrong-key, wrong-first-render, stale-document, noop-route, missing-rendered-record, normalization-write, archive-stream, archive-late-tar, resolver-name, resolver-outside, parser-idle, parser-truncated, page-exception, child-late-exit, child-retained-stream, task-cancel-join, partial-build, outer-wx, final-write, journal-flush, journal-close, artifact-missing, admission-replay, admission-m8. Original39 legacy artifact obligations, real corrupt-expected-source-hash and wrong-root pairs remain mandatory additions, not erased by this list.

## Appendix D. Complete canonical Clock r2 section14 (verbatim)

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

