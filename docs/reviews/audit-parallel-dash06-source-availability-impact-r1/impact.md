# DASH-06 source availability — independent technical impact r1

**STATIC IMPACT COMPLETE; proposal only, awaiting fresh independent review. D06-08 remains unresolved and no implementation is authorized.** Module `web`; workflow A; sole controller remains root A-Codex. This actor never repairs. The existing source proves a bounded technical path worth preparing, without a new goal/default policy or an automatic shared-storage rewrite. No runtime observation or caller acceptance is claimed.

## 1. Fixed identity, authority and preservation

- Direct parent: **b142c8ebb8b16f42919f5f4b253d64e8994afd0b**. Task-card fixed input: **41295a0f57728d93bb764f3679f5e2f3dafb86d4**. Reviewed condition source: **c269ae212135f3b7729f843825ece70c7a00a724**, `docs/reviews/audit-parallel-dash06-contract-review-r1/review.md`, D06-08. No moving control HEAD or later DASH preparation revision is an input.
- Product P0: **f9eb4b1f207bc4b46f547b90afc250424b3c8695**. Original all-item source: **e041c2bc293b70db367444c62c4300231976dbf7**. Full Git identities and SHA-256s are in `inputs.sha256`; preserved prior identities are independently rehashed, not accepted merely because an old index exists.
- Exact card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-dash06-source-availability-impact-r1.json` at the direct parent. Exactly two ADD paths are authorized: this report and its input index. Initial worktree was clean at the exact parent, detached HEAD.
- Own worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-dash06-availability-impact-20261010/XAI_Desktop`; actor `/root/parallel_a_dash06_availability_impact_r1`. Model label in the card is `gpt-6-astra`; configuration is not independent provider attestation. No children or other checkout access.
- Original goal read first: `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md`, SHA-256 **40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615**. AGENTS/CLAUDE, shared workflow, multi-machine rules, current control-plane/parallel overlay, goal-A, adopted r2 scheduler and exact card govern. Parallel overlay supersedes only global serialization; the historical UNACCEPTED heading in r2 is superseded by the fixed P3 adoption receipt, not by this report.
- Root alone handles source remote preservation, receipt/integration, control, budget registration, adoption, reconciliation and inventory under recurring exclusive `controller-receipt-lock`. Worker does not acquire it. No push/fetch/sync-check/merge/rebase/promotion/deployment/release/D3 is performed. Local commit is not cross-machine preservation.

Original DASH-06 remains P2 / 决策 / `pending`, action **Stat Pomos的8点展示与真实目标接线或标为刻度**, acceptance **超目标/未设目标可理解，统计使用当地日**, module web/current scope, evidence `[]`. The independently established scale remedy needs no additional S/G owner question: source c269ae2 rejects that invented gate. G remains an inactive future feature requiring its own request/contract. This impact neither approves the display contract nor introduces a daily goal.

All 312 original task fields and order are preserved, with **39 reversible project-system→web normalizations and original_module retaining every original label**. The full scope-map fields match the readiness appendix; original ordered evidence **933**, current **939 = 933 + six TT-08 documentary entries**, statuses **13 completed / 3 verification_pending / 3 in_progress / 293 pending**, **299 unclosed**. No state/evidence/global file changes occur here. All original contract, runner, failure, refusal, source and hash histories remain.

## 2. Actual read/source chain and the precise loss of information

All product paths in this report refer to P0 blobs, verified equal at the dispatch parent; source line anchors are navigational, with full identity supplied by the index.

| Boundary | Actual source and consequence |
| --- | --- |
| Key/owner | `packages/plugin-web-storage/src/internal/registry.ts:370` registers `xai_pomodoro_sessions`, JSON, default[], schemaVersion1, owner xai-web-pomodoro, historical proposed flag. `accountOwnership.ts:41` makes it account-owned. Neither default[] nor proposed metadata proves a read succeeded or activates a new schema. History is a plain array, not a canonical command envelope. |
| Physical scope | `accountScope.ts` captures immutable kind/accountId/generation/epoch. `physicalKey` checks captured identity, rejects locked/stale scope, reads deletion tombstone, and constructs `xai:account:v1:<id>:<generation>:<key>` or separate demo prefix. A tombstone access denial can fail before history getItem. `isReady` alone is not a successful storage read or committed-marker inspection. |
| Imperative loss | `storage.ts:41` `readRawPref` returns null for missing key, SSR, scope rejection and any getItem exception. `getPref:135` returns registry default for SSR, exception, raw null and decode failure. `decodeStoredPrefValue` applies codec and special canonical handling only for tasks/calendar. `codec.ts` JSON.parse accepts wrong-root objects/scalars; JSON null is indistinguishable from its decode-failure sentinel. It does not validate the history schema. |
| Hook loss and split observation | `usePref.ts` calls getPref then readRawPref separately, plus a separate raw read for isDefault. Different observations can disagree under changed/denied reads. PrefMeta contains schemaVersion/isDefault/reset, not availability. Initial denied read therefore appears default. Same-tab bus uses published value plus another raw-default check. StorageEvent uses event.newValue directly (or default for null/clear), and decode failure falls back to the same lossy reader. Event removal is not proof that a fresh authoritative read succeeded. |
| Account visibility | usePref captures the initial scope; scope notification invalidates rendering, and stale/account-locked values are hidden behind effectiveDefault. The actual `AccountDataGate.tsx:99` keys children by kind/id/generation/epoch. `AccountStorageGate.tsx` wraps PomodoroSessionHost and business children; identity invalidation locks synchronously. Tests on a bare component do not establish this host/remount chain. A locked view is never proof of somebody's empty history. |
| Dashboard projection | `widgets/StatPomos.tsx:35` takes only usePref's value. `dataReads/pomoStats.ts` returns0 for nonarray and skips rows failing its local minimal predicate or finite finishedAt parsing. `isPomodoroSession.ts` checks only mode/finishedAt string/completed boolean. A mixed source yields a subset without an incompleteness flag. The visible number and PomoDots label can therefore assert zero or a complete subset with no source proof. |
| Domain mismatch | Owner `plugin-web-pomodoro/src/internal/validate.ts` also requires id, startedAt, finite positive durationMs, bounded elapsedMs and valid optional recordedAt/deadline. A row with valid counting fields but broken owner fields can currently be counted. The local selector's minimal validity is not owner-schema validity. Extra fields are permitted; no new version rejection, deduplication, duration conversion or future-timestamp policy can be inferred. |
| Existing stronger API | Public index already exports `usePrefAsync`, PrefSource, accountScope and readRawPref. `usePrefAsync.ts:66` private readSnapshot distinguishes absent/valid/invalid/unavailable and preserves raw on invalid. Optional validate can reject complete arrays; default JSON validator merely checks serializability. This is existing source capability, so claiming the repository has no availability channel would be incorrect. |
| Why async is not a drop-in read observer | `project()` rereads, but error/dirty/conflict states become conflict without adopting next source/raw/value. An invalid→valid external repair may remain the old source until reload. `retry()` without a failed request calls `perform(controller.value)` and can write fallback; reset removes, setter writes. `reload()` disposes/rebinds and rereads without a storage write, but choosing when to invoke it must honor account/recovery/event ordering. Never wire generic retry/reset into this informational widget. |

A read result must describe the **same physical key, captured scope/epoch and actual observation** as its value. A source channel cannot be inferred after the fact from `store.length`, `isDefault`, a separate successful probe, emitted completion event, or owner timer availability. Raw preservation is local evidence/recovery data, not permission to export account history through telemetry or logs.

| Authoritative observation | Permitted truth | P0 ambiguity / required distinction |
| --- | --- | --- |
| Current scope, successful getItem returns null | Verified absent; existing no-history contract permits0 | Distinct from locked/deleted/SSR/denied. No seed/reset/write. |
| Current scope, raw `[]`, successful parse and full array validation | Valid empty;0 | Retain absent vs stored-empty identity even if both display0. |
| Valid full history including completed focus, breaks and incomplete sessions | Complete committed N for browser-local finishedAt day | Breaks/incomplete sessions validly contribute0; exclusions are not corruption. True N may exceed8. |
| Security/getItem failure, including tombstone lookup | Unavailable; complete N unknown | Do not show fallback0 as verified history, perform a “test write”, or claim successful recovery. |
| Malformed JSON, JSON null, object/scalar root | Invalid source; complete N unknown | Original bytes retained; no normalization to[] or mount repair. |
| Array containing invalid mode/date/completed or owner-schema-invalid row | Invalid/incomplete source; complete N unknown | Valid subset is at most partial information; cannot silently present it as total or goal achievement. Even invalid break/old-date rows cannot simply be ignored to certify whole-source completeness. |
| Stale captured account/generation or locked/deleted owner | Unavailable/revoked view | Never transfer previous raw/value/closures to next account or substitute confirmed absence. |
| Event claims null while reread is denied; old event after newer commit | Notification is invalidation, not durable truth | Revalidate current scoped source; a stale event payload is not the latest complete store. |

This table preserves D06-08's existing honesty obligation. It selects neither a new partial-count display policy nor a new default; future contract must use the existing uncertainty/error rule and make no complete-count claim without proof.

## 3. Owner-produced history and host implications

`sessionController.ts:57` historyFor reads scoped native storage directly, parses once and requires every row to pass the owner guard. Invalid history raises recovery error; it is not silently rewritten. The owner is already the sole producer and its strict input refusal is materially stronger than Dashboard's filter.

Settlement: pending active state precedes history; record identity is stable sessionId, original finishedAt/deadline remains, recordedAt is committed observation time. The history write commits before lastCommitted/event notification and `changed(scope)`'s scoped StorageEvent; active cleanup follows. Thus pending/history write failure means no committed increment, but successful history followed by cleanup failure means one committed count. A notification/read failure after commit cannot erase durable history. Owner Retry/reconcile must preserve exactly-once identity and first committed times; Dashboard must not “help” by writing, retrying owner commands, clearing active or deduplicating data differently.

`SessionSnapshot.available` is based on `navigator.locks`, not history readability. `refresh()` reads activeFor; it does not routinely validate history. `lastCommitted` only describes a recent commit, is reset on scope change, and cannot enumerate all history. Consequently consuming owner snapshot/error alone does not solve D06-08.

Existing public `accountMigrationIssue(key, raw)` can use owner validators, but is a migration/quarantine contract, not a general reactive read channel. Pomodoro `index.ts` registers its validator by side effect; lightweight `session-host.tsx` imports only the controller, not that registration. Dashboard-first lazy route composition therefore cannot assume the owner validator is present merely because the host is mounted. Absent validator is an explicit validation-unavailable result, never valid empty. A proposal to rely on this mechanism must separately prove import order or add a reviewed owner registration/export path; no hidden route import, CSS-loading package import, deep owner import or host rewrite is authorized.

Actual consumer set for this history key:

| Consumer | Read and affected obligation |
| --- | --- |
| StatPomos / its drag ghost | usePref + minimal local filter. Sole proposed opt-in customer; both real render sites must remain zero writers. |
| PomodoroModule | usePref + owner guard filtering for its display/derived counters. Controller historyFor remains stricter. Availability work for Dashboard does not silently repair this module or declare it source-honest. |
| StatisticsModule | usePref + its own narrow selector/duration aggregation. Partial sessions legitimately affect time statistics, unlike completed Pomos count. Preserve that distinction. |
| CmdK readModuleStates / pomodoro adapter | getPref; its stale completedAt projection is already documented. It is an affected compatibility consumer, not an oracle or a repair target. |
| AI contextProvider | getPref followed by its own context projection. No source repairs, payload-policy changes or new outbound disclosures follow here. |
| Account migration/deletion/export and settings reset inventory | Ownership/registry/source bytes are lifecycle inputs. Preserve keys, defaults, names, export retention, migration validation and no-reset-of-entities protections. |

An additive opt-in API leaves all old reader contracts intact. A global getPref/usePref signature or default/metadata semantic change instead affects the entire reader surface (including dynamic keys and .ts wrappers); the historical 47 direct .tsx bindings alone are not a full census. Appendix D freezes a conservative source-text candidate set, including comments/internal definitions; it is not advertised as 82 active call sites. Each candidate must receive a real call/import disposition if global changes are ever proposed.

## 4. Bounded alternatives, not implementation permission

**A — additive public read-only observation path (recommended for the next contract preparation).** Add a registered-pref read hook whose returned surface has value/source/raw and a read-only refresh; no setter/retry/reset/dirty queue. Reuse unchanged codec/account ownership/scope and same-tab bus inside storage, while reading authoritative bytes on relevant invalidations instead of accepting event payload as data. Atomically associate classification/value/raw with scope and reject stale publication; catch storage-access failures both during reading and event filtering. Optional caller validation supplies domain completeness; no generic schema/default changes. Make absence, invalid, unavailable and valid explicit; source-error recovery reobserves and only then promotes healthy state. No new network, business event, write, polling SLA or account transition policy is implied.

For Pomodoro, keep countTodaysFocus and the minimal historical predicate behavior intact as low-level functions. Add a separately named full-source guard/projection alongside them, with parity to the existing owner validator (including optional row fields and accepted extra fields). Only validated complete arrays or confirmed absence may feed the definitive displayed number. This local copied validation is a maintenance risk and requires cross-owner parity fixtures; it does not become a second writer or change the owner's schema. If independent review rejects maintaining the projection, choose the separate owner-public alternative below, not a deep import.

**B — opt-in local adapter over existing usePrefAsync.** No shared product edit needed for the API itself. The adapter must keep setter/retry/reset inaccessible and use only reload for read recovery; supply whole-source validation; prove event repair after error, same-tab owner notification, account revocation and source/value consistency. It must not present old `source=valid` on conflict as new truth. Automatic reload, explicit user reload or render-triggered refresh is a contract detail requiring source review; adding a new focusable recovery control conflicts with the current informational-dot/no-new-stop assumptions and must be explicitly reviewed, not smuggled through copy. This option has fewer storage edits but inherits a writer controller's conflict/lifetime machinery and all corresponding budgets. No claim it is already correct under D06-08/09/10.

**C — owner-public validated history snapshot.** A narrow pure validator/snapshot export can eliminate schema duplication, but introduces a reviewed cross-package dependency/public-surface or registration contract. Owner snapshot.available/lastCommitted is insufficient; controller commands/settlement must stay untouched. Lazy registration is a real host-order prerequisite. Exact candidate files are listed below; if export requires package export-map/config/lock changes, stop and prepare another finite impact. Host change is not presumed necessary.

**D — change legacy getPref/readRawPref/usePref globally.** Reject as this task's minimal candidate. Changing return types/default semantics/isDefault or writer-state recovery would force the whole consumer/mocks/API migration and accepted-caller regression analysis. No finite global implementation allowance follows from this impact. Generic “all necessary files” is not an alternative.

## 5. Exact proposed file maps and protected boundaries

**Nothing in this section is currently writable.** These are minimum finite candidates for independent technical scope review. The nine display-only S files remain their own unapproved candidate. Availability work cannot silently expand them.

Storage implementation lives in plugin-web-storage; its four owning workflow documents live in **packages/xai-web-persistence-contract/docs/** (confirmed by the design snapshot). These are explicit protected-document exceptions, not new duplicate docs.

A's proposed **availability core** set (14 paths):

| Exact path | Proposed scope |
| --- | --- |
| `packages/plugin-web-storage/src/internal/usePrefRead.ts` (ADD) | Read-only hook, scoped coherent observation, same-tab/native invalidation and read-only refresh. Private read helper only; do not refactor legacy hooks or mutate engine. |
| `packages/plugin-web-storage/src/index.ts` | Additive export of hook/result types only. |
| `packages/plugin-web-storage/src/__tests__/usePrefRead.test.tsx` (ADD) | Real public API, denied/absent/invalid/repair/mixed events/scope revocation/SSR and zero writes. |
| `packages/xai-web-persistence-contract/docs/design.md` | Additive scoped read result and legacy compatibility decision. |
| `packages/xai-web-persistence-contract/docs/api.md` | Additive public read-only result/lifetime contract. |
| `packages/xai-web-persistence-contract/docs/test.md` | Full source-state/account/reactivity obligations and history mapping. |
| `packages/xai-web-persistence-contract/docs/dev_log.md` | Bounded pending work/independent gates, no self-acceptance. |
| `packages/xai-web-dashboard-widgets/src/widgets/StatPomos.tsx` | Explicit opt-in source truth gate; only count proven source, no owner command. |
| `packages/xai-web-dashboard-widgets/src/internal/dataReads/isPomodoroSession.ts` | Add full-source/owner-parity guard without altering existing minimal guard or count policy. |
| `packages/xai-web-dashboard-widgets/src/__tests__/StatPomos.test.tsx` | Availability and complete-count assertions; preserve frozen P0 tests and diagnose minimal fixture changes honestly. |
| `packages/xai-web-dashboard-widgets/src/internal/dataReads/__tests__/pomoStats.test.ts` | Add full-source validation distinction, owner parity and valid exclusions; retain low-level historical tests. |
| `packages/xai-web-dashboard-widgets/docs/design.md` | Add explicit source-honesty boundary to old defensive-empty wording. |
| `packages/xai-web-dashboard-widgets/docs/api.md` | Complete-count versus unavailable/invalid source contract. |
| `packages/xai-web-dashboard-widgets/docs/test.md` | Map D06-08/09/10 and all dependent evidence. |

Core integration also requires **exactly two existing local paths**: `packages/xai-web-dashboard-widgets/src/internal/strings.ts` for bilingual neutral source-state explanation and `packages/xai-web-dashboard-widgets/docs/dev_log.md` for pending author/verification state. Thus A's total candidate is **16 paths**, not a 14-file authorization. It deliberately excludes PomoDots and its test: the separate nine-file S display candidate owns scale/AX changes there. If combined later, union the exact reviewed sets (18 unique paths) and single-writer locks; neither task may independently overwrite shared strings/docs/StatPomos/tests. No runtime-output paths are granted by this source map.

B uses the nine widget-side paths from A (StatPomos, predicate, two tests, strings, four docs), plus exact ADD `packages/xai-web-dashboard-widgets/src/internal/dataReads/usePomoSource.ts` and exact ADD `packages/xai-web-dashboard-widgets/src/internal/dataReads/__tests__/usePomoSource.test.tsx`: **11 paths**. Storage public files remain untouched. This exact candidate is subject to the error/conflict/reload feasibility proof above; inability to pass that proof blocks B, it does not authorize changing usePrefAsync.ts.

C is a separate alternative to A's copied guard, not cumulative authorization: potential owner-only preparation identifies `packages/plugin-web-pomodoro/src/index.ts`, `src/__tests__/index-barrel.test.ts`, `src/__tests__/validate.test.ts`, and `docs/design.md`, `docs/api.md`, `docs/test.md`, `docs/dev_log.md` under that same package. Existing validate.ts would be exported unchanged; if the chosen strategy instead ensures migration-validator registration at startup, the exact extra candidate is `packages/plugin-web-pomodoro/src/session-host.tsx` plus `packages/plugin-web-pomodoro/src/__tests__/registration.test.tsx`, with explicit import-order tests and separate owner review. These owner deltas alone do not wire Dashboard or authorize package manifests. Because current widget design forbids cross-plugin data imports, a dependency-based version of C is **not implementation-ready**; root needs a precise reviewed dependency/config allowance before it can be a full candidate. No host App.tsx/AccountStorageGate/AccountDataGate edit is currently justified by source evidence.

Protected for every alternative: all nonenumerated files; `storage.ts`, `usePref.ts`, `usePrefAsync.ts`, codec, registry/default/schema, ownership/scope/account lifecycle, mutation/locks and bus; Pomodoro timer/controller/settlement/migrations and owner bytes; apps/Web auth host and route registration; countTodaysFocus/local-day formula unless a separate actual defect is established; other widgets/modules; both Dashboard stylesheets, all shared CSS/tokens/inline style escape hatches; Clock/WorldClocks/canonical r2; config/package manifests/lockfile; every original contract/runner/log/failure; root control/ledgers/inventory and unrelated worktrees. A proposed exception in the table requires independent review and a root card; this report does not remove protection.

## 6. Ownership, collision/resource locks and necessary future verification

| Resource | Scope and lock consequence |
| --- | --- |
| Storage public export/new hook/docs/tests | Exclusive storage API author; read-lock exact existing codec/scope/bus/async source. Existing Clock/REL/other storage work invalidates source reuse if changed. Additive exports still require package/barrel compatibility and bundle/SSR checks. |
| Widget StatPomos/strings/docs/tests/predicate | Exclusive widget writer, coordinated with display S, WorldClocks and Clock shared local strings/docs. Different worktrees do not eliminate these file/semantic collisions. |
| Pomodoro sessions/active plus account generation | Product read dependency only; freeze owner/controller/validator/host hashes. Owner repair is separate author/allowance; concurrent changed producer invalidates integrated evidence. No new lock or writer on history is introduced by a reader. |
| Full host/grid/local-day | Pin exact combined source; retain real App remount, tick/background/resume, owner visit-order and ghost attribution. REL six-consumer acceptance does not include StatPomos. |
| CSS/focus/native | Native full-host method and geometry dependencies remain Clock-gated. Source/API/contract inspection can proceed independently. Later runtime card must reserve own server/port/origin/profile/output/device and bounded shutdown; no shared browser contamination. |
| Root controls | Sole root recurring exclusive receipt/adoption resource; no worker token, no waiting on workers while held, exact source→integration mapping and uncertain partial-state handling preserved. |

Future verification must discriminate absent vs raw[] vs SecurityError at physical-key/tombstone/history reads, malformed/null/wrong-root JSON, all-invalid and mixed arrays, owner-valid incomplete/break/other-day rows, invalid optional owner fields, unknown extra fields, and successful parse followed by account change. Record original bytes; setter/remove/write spies must distinguish fixture setup, owner writes and widget writes. No source probe may write merely to test availability.

For reactivity cover actual same-tab set/remove notification and owner's synthetic scoped StorageEvent, real second-tab update/removal/clear, stale payload after newer write, foreign key/account/generation, denied read during a null event, invalid→valid and denied→restored repair, generation marker and tombstone changes, scope A→locked→B→A, unmount/remount/ghost, and read-only recovery without a retry write. SSR absent-window must be unavailable, never a successful empty browser read. Freeze the precise refresh triggers instead of inventing a polling/SLA policy. If the contract needs deletion/marker handling beyond current host gates, hold that subnode for separate scope review.

Full source parity uses the actual owner guard against the candidate projection on a finite table of real v1/v2 valid and invalid records. Existing widget tests use minimal three-field records and expect a stale completedAt-only row to show0; stricter source truth legitimately exposes their limitation. Preserve frozen P0 outcomes, retain low-level selector controls, add owner-valid integration fixtures and an explicit invalid-source assertion. Never weaken new truth checks to make old characterization tests green, nor declare a revised test oracle independently accepted by its author.

Compatibility: run meaningful original storage imperative/usePref/account/async/SSR/public-barrel tests unchanged, widgets and grid full package checks, Web/account host, Pomodoro owner/settlement/recovery/account tests, Statistics/CmdK/AI source projections as applicable, and the full retained G1/final caller matrix. Exact scripts/filters/output paths and actual-unit budgets belong in later cards. No tests are run here. Additive API doesn't waive full original regression; global API changes would additionally require a complete candidate-consumer disposition.

## 7. Permanent purpose/source correspondence and remaining budget

The new source availability **assertion purpose** is: a read-only Dashboard complete-count claim carries a contemporaneous scoped source result and rejects denied, malformed or partial history while retaining owner bytes. Its novelty is tied to P0 StatPomos/pomoStats and their tests: they assert fallback0/filtered counts and true10/dots8, but no availability-conditioned complete-count oracle. It is not inferred from evidence[] or a new filename. Existing usePrefAsync source-state tests prove that the underlying classification mechanism is **not** novel. No old same-purpose Dashboard source-truth execution was located in the bound corpus; root may register a finite new source-author/review purpose without a generic caller-wide unknown barrier. This is not a declaration that every new combined executable unit has lifetime0.

| Permanent actual purpose | Corresponding source/history and admission |
| --- | --- |
| This impact | Card explicitly assigns technical impact1/3; one static pass. No runtime family consumed. Next fresh independent impact review is separate, root-registered, not this author self-accepting. |
| New complete-count availability assertion | StatPomos/pomoStats tests and old defensive-empty design lack it. Register explicit novel assertion source, while separating invocation inheritance below. New scale/localized AX D06-02/03 is a different novel purpose already established by c269ae2. |
| Generic read classification/async source recovery | `usePrefAsync.ts`, `usePrefAsync.contract.test.tsx`, imperative/usePref/accountHooks/prefAutosave-readpath tests; REL-05, accepted Appearance/AppRail/More/Features/other callers and shared read/mutation history. Actual cumulative invocations unknown here, **not0**; source-state names reused do not grant a fresh cap. B inherits its writer-engine lifetime even if it never calls a setter. |
| Count/domain/day/package | AC-RD-POMO and AC-STATS-REAL-POMOS; widgets real-data docs/history, owner validate/counters tests. Existing invalid→0 and true10/dots8 are actual old purposes. Preserve original invocations and P0 controls; new guard assertion does not reset a package run. |
| Owner settlement/recovery/closed process/two tabs | POMO independent source/receipt at4868d0a682e27a7789fe58168ee6f7006e5946bb; original stale-revision and competing-Start failures, pending/history/cleanup cuts, process close/reopen, locked account queue and stale export retained. `web-pomodoro-durable-session/dev_log.md` reports old package140/143 and8-reproduction/3-native/lifecycle/crash evidence, not cumulative remaining tries. Exact permanent invocation count unknown, never0. |
| Account/storage/real host | accountScope/accountHooks/AccountDataGate/App signout source and historical REL-02/03/04/shared caller receipts. A/B/A or namespace reuse remains inherited; blocked unknown REL V1 counts cannot be erased by a Dashboard label. Read-only static source work does not consume/reopen that vendor gate. |
| Midnight/background/host | REL-01 actual six consumers and four-zone matrix, Dashboard tick/ctx.now path. New actual StatPomos assertion is not a transitive REL pass; shared host/time instrument units retain histories. Do not charge unrelated six-consumer business failures as this new assertion's attempts. |
| Visual/focus/qualification/final G1 | Old full-host pixel/retention/native/accepted-caller units remain inherited, including refusal. New text/source error surface does not reset Clock geometry/focus qualification or use a new probe name for the fourth retention run. |
| Source review, qualification, before/fixed, vendor and acceptance | Each later finite unit must map actual source/purpose/commands/history and cap before dispatch. Actual cross-vendor evidence is required where the original gate requires it; another Codex instance is not that evidence. Unknown inherited count holds only that unit/descendants, not unrelated preparation. |

Caps remain **≤3 per actual permanent unit, including refusals**, across actors/paths/worktrees. Development probes are separately disclosed; no probe may replace a refused formal run. Budget reconciliation must bind original run source/arguments/refusals/remaining cap, not divide aggregate assertion totals by three or treat absence of a log as zero.

Clock retained: Q1 focus-controls1/3, six explicitly registered other units0/3, development2/83. Retention i1/i2/i3 **3/3,145 assertions,41/42 cases**, original failure and fresh REVISE preserved; **no valid remaining validation path** absent the separately authorized exception recorded as pending at this parent. B70 fields/source2 each, departure1; responsive3/3 exhausted; focus EN2/ZH2 with supplemental third source unlaunched; native12 formal/6432 and40 development/4884. F1 selfcheck1 + clock1 =2/180, development3/302. TT vendor3 historical runs are not DASH-06 vendor qualification. No new runtime costs or implied exception.

## 8. Full original acceptance remains mandatory

The next table is copied from the fixed original preparation to preserve **all sixteen rows**, not to resurrect its rejected S/G owner gate. Apply c269ae2 R1/R2: S is the existing-rule remedy; G is inactive; genuine new semantic purposes are distinguished from inherited machinery. Source-error impact does not approve display semantics, qualify instrumentation or waive any row.

| ID / permanent purpose | Finite required evidence and oracle |
| --- | --- |
| D06-01 real count | At local noon seed valid owner-schema histories containing 0,1,7,8,9,10 completed focus records today; separate prior/next local date, both break modes and early-ended focus controls. Compare widget number to independent fixture truth. Count is full N, never duration/25, dot count, event count, prototype6, recordedAt or stale completedAt. Valid empty is 0; early endings don't increment although owner's duration view may include them. B/F unchanged count positives retained. |
| D06-02 display and unset | S: eight bounded dots, true number and visible/localized scale-not-goal explanation; no assertion user set eight, no 100% target claim; no goal inferred from missing data. G: explicit unavailable-until-owner-contract gate, then unset and valid goal states; never invent a default. Existing P0 ambiguous explanation is expected source-level gap to reproduce, not yet a runtime FAIL. |
| D06-03 above-scale/above-goal AX | S: count10 remains10 and accessible text says10 completed today plus scale capped8/not a goal, or hides decorative dots while equivalent truthful text remains exposed. It must not independently announce misleading8-of8. EN/ZH AX names/description and reading order. G: below/equal/above actual persisted goal and clear/unset match its approved representation, with N preserved. A synthetic G reference cannot prove a source absent from P0. |
| D06-04 local-date oracle | Same known instant `2026-09-09T06:30:00Z`: Los Angeles local Sep8 versus UTC/Shanghai/Lord Howe Sep9. Seed unique IDs on both sides of exact known local midnight; check finishedAt assignment including finishedAt yesterday/recordedAt today. Use predetermined UTC bounds for Pacific spring23h/fall25h and Lord Howe23.5h/24.5h; no division by86400000 or oracle calling the product selector. Source fields remain unchanged. No new global timezone behavior. |
| D06-05 actual rollover/resume | Real Dashboard route with stat-pomos mounted across local23:59:59→00:00:01, real parent tick observed; separately hidden-to-visible/pageshow/background timer resumption. Old-day count drops, new-day committed count appears at next real resumed render. Record timer/visibility events rather than imposing an invented500ms SLA. Also direct route reload and remove/re-add via real WidgetShell/AddWidgetPicker. P0 registry ignoring ctx.now is disclosed; no test-only `now` prop substitutes for host proof. |
| D06-06 owner-produced data | Actual archived PomodoroSessionHost/controller + product module completes one short controlled focus session using declared synthetic clock seam and trusted Start; then actual Dashboard displays one. Completion created through owner, not only raw fixture seeding. Visit-order independence: dashboard-first/pomodoro-first and re-entry retain count; no sample data created by dashboard. End-early/break positive exclusions. Exact duration seam is qualified and identified, not fake production outcome. |
| D06-07 settlement/error/recovery | Three scoped cuts: pending-active write denied (no committed record/count), history write denied (no count, owner error/recovery retained), active cleanup denied after history commit (count1 despite cleanup error). Restore and owner Retry/reconcile/reload yields exactly one same ID and first finishedAt/recordedAt, including two tabs. Export/refusal follows existing owner semantics. Widget never writes/retries/clears sessions itself and must not count in-memory uncommitted intention. Preserve related historical POMO results and failures; new same-purpose runs inherit budgets. |
| D06-08 source unavailable/malformed | Distinguish verified absent/valid[] from denied getItem, malformed JSON, wrong root/object, invalid finishedAt/mode/completed, mixed valid+invalid records. Snapshot original bytes; no mount repair/reset/discard. P0 may show default0 or valid subset: record that actual limitation, never call it confirmed empty/complete. Unknown/partial availability must not assert target achieved or successful recovery. Any required display/read repair outside §5 triggers independent source-bound correction before affected acceptance; it does not authorize replacing storage or weakening this row. |
| D06-09 reactive source | Same-tab actual owner settlement, second-tab history update/removal, unrelated-account StorageEvent, unrelated key; read current account generation only. New valid committed data updates visible true count; foreign data cannot replace it. Removed confirmed source becomes honest zero; revoked/unreadable source is not equivalent to removal. Real event sequencing and raw storage establish causality. |
| D06-10 account/lifecycle | Actual App/AccountStorageGate A→locked→B→A with synthetic accounts, current-generation sentinels and actual remount; late A settlement queued behind lock cannot mutate/publish into B; stale export/retry revoked. Test demo and account namespace identities distinctly. A direct component mock is not a whole-host account proof. No real auth credentials, production data or cloud sync claim. |
| D06-11 readonly/ghost and neighbors | Count/dots mount, rerender, real drag ghost, language/theme/date change and reload attempt zero StatPomos-attributed set/remove on any key, zero new network/business event. Exclude fixture setup and precisely recorded owner/grid writes by settled action boundary; never assert whole App has zero writes. Grid remove/re-add/reorder/resize and nearby StatTasks/StatStreak/Clock remain functional with actual trusted input where claimed. No goal activation from clicks/Enter/Space on informational dots. |
| D06-12 visual | Actual full App, EN/ZH × light/dark × CSS375×812,414×896,768×1024,1024×768,1440×900, at default density100% =20 configurations and40 captures (true0 and10 separately); extra EN/ZH compact200% at375/1440 light/dark =8 configurations. Record effective CSS viewport after zoom/DPR; no silent substitution. True count and explanation legible/unclipped; bounded dots, visible neighbors, document overflow and pet-hidden center hits, separately pet-on R-PET baseline. Real CSS/font/token bytes preserved; no screenshot-only geometry claim or layout relaxation. |
| D06-13 trusted keyboard/AX | EN/ZH × light/dark ×375/768/1440 full-host walks, no interactive stop added for decorative dots; test neighboring widget controls pointer/Tab/Shift+Tab/Enter/Space once, real focus pixels every applicable stop. AX communicates localized count and scale/unset/over-limit. Don't claim complete assistive-technology certification from AX snapshots. Frozen pixelFocusWalk or adopted independently-qualified successor only; full-cycle refusal remains refusal. |
| D06-14 affected tests/source | Widgets full tests/check-types/lint, grid full tests/check-types/lint, unchanged-test P0 controls; Pomodoro actual existing owner/settlement/recovery/account/counter tests, storage check-types/account/reactivity controls, Web test/check-types/lint, CmdK/Statistics projections relevant to source; complete inherited accepted-caller/final G1 list in §9. Package tests execute real APIs, don't mirror a hand-coded selector. Protected path diff and full source/import hash audit required. |
| D06-15 instrumentation | Qualified source/seed/attempt recorder rejects wrong SHA, wrong @repo root, unexpected write, wrong account/generation, stale count/8-of8, wrong local-day comparison, unavailable-as-empty assertion and synthetic click substituted for trusted input. Positive controls must pass. Fixture mutations only in isolated oracle qualification; never injected into product PASS. Separate source author, fresh reviewer and root adoption before runtime evidence. |
| D06-16 acceptance | Actual cross-vendor raw result (not another Codex instance) then fresh independent Astra reconciles every original clause, B/F row, source/account/error/recovery/visual/native/final regression, residual and permanent counter. A numeric-count unit PASS cannot close the decision. Caller acceptance distinct from formal item completion and deployment. |

Only truly dependent nodes hold: source-truth before/fixed admission needs a reviewed source contract/instrument; implementation needs valid before, exact allowance and budgets; source-dependent acceptance waits D06-08/09/10; full-host native/focus waits applicable qualified method/geometry; final acceptance waits every required row. Other contract/static source work proceeds. There is no new global stop or global caller-budget barrier.

## 9. Full canonical Clock r2 G1 and judging copies retained

Canonical SHA-256 **214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae**. The following entire E1–E25/E24 block is byte-matched to the canonical contract. It is an obligation index, not authorization to rerun Clock or an assertion of completion.

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


Retain C-FB002 corrected full10/10 beside frozen More; OE corrected26/26 beside frozen24/26; C-RD1 Features downstream15/15 as case014 judge beside frozen13/15 and predicted C-FD1 14/15. Preserve all16 F1 invocations, rail selfcheck/order, K-1 Appearance, Header host/native/Astra/Sol plus lawfully preregistered capacity copies, and E25 per-item full source/hash/verdict. Reuse requires proven unchanged source, oracle, environment and applicability; no blanket rerun or blanket waiver.

MGB remains M full seven-unit qualification → independent Q2/root adoption → complete valid original P0 before → only the permitted two Clock CSS geometry repairs → independent geometry acceptance → versioned baseline addendum and E1–E5 reconciliation → original full Clock r2 implementation/fixed/native/affected/final acceptance. Current unqualified/retention3/3 state is not solved here.

## 10. Precise next cards and adoption path

1. Root may register **DASH-06/SOURCE-AVAILABILITY-IMPACT-REVIEW1**, fresh independent actor who authored neither this impact nor any same-caller prior stage. Fixed inputs: this final source commit (resolved after commit), b142c8ebb8b16f42919f5f4b253d64e8994afd0b, c269ae212135f3b7729f843825ece70c7a00a724 and P0. Proposed exact two ADD outputs: `docs/reviews/audit-parallel-dash06-source-availability-impact-review-r1/review.md` and `docs/reviews/audit-parallel-dash06-source-availability-impact-review-r1/inputs.sha256`. Static1, runtime/tests/browser/native/qualification/vendor/probes0; reviewer never repairs. These paths are a next-card proposal, not files created or authority granted here.
2. Review must independently challenge A vs existing async B, validate full-source guard parity and whether C is needed, the exact16/11/conditional-owner maps and display union18, every actual consumer/host implication, all16 rows/G1, no new behavior/default, account/event ordering, all inherited permanent budgets and no standard waiver. APPROVED here means only an impact/scope basis; REVISE goes to a fresh bounded impact corrector within remaining impact cap, with original source preserved.
3. After fresh impact review, root can register **DASH-06/SOURCE-AVAILABILITY-CONTRACT1**, exact ADD `docs/reviews/audit-parallel-dash06-source-availability-contract-r1/contract.md` and `docs/reviews/audit-parallel-dash06-source-availability-contract-r1/inputs.sha256`. Fresh author freezes one chosen technical alternative, exact result/refresh/validation semantics and finite allowed files, source-state/account/event matrix, consumer regression, locks, row dependencies and actual-unit histories. It must reconcile with a separately reviewed current display contract without silently consuming a later moving proposal. Then a fresh independent contract review binds the exact source before root adopts it. These steps require no repeated S/G question; an actual conflicting owner mandate would instead be preserved for the smallest genuine decision.
4. Subsequent evidence-source author card enumerates every runner/fixture/raw log/screenshot/receipt/hash path and exact immutable input, source review, qualification/negative controls and adoption. Execution admission requires remaining inherited cap; unknown is not0 and only the corresponding unit is held. Complete P0 before establishes actual failure with valid oracle; this static source trace is not before. No “all necessary files” or directory wildcard grant.
5. Fresh implementation author only after reviewed contract, before, exact allowance and semantic locks. A affects the16 candidate paths only if explicitly registered; display S remains separate unless an exact18-path union is independently approved. Independent source/fixed/integrated verification, real vendor gate and fresh Astra full-original acceptance follow, with every missing row still blocking relevant acceptance. Product or oracle failures go to distinct repair actors under original counters.
6. Root receives/preserves original commits remotely, integrates only verified disjoint exact changes, records source→integration mappings, then adopts reviewed method/contract separately under its resource. After caller acceptance only, append evidence to all three ledgers with unchanged312 states, refresh inventory, verify remote ancestry and sync. No full-goal completion, release or D3 inference.

Viable next action is the static independent impact review. Product implementation/runtime remains **NOT ADMITTED** because no chosen availability contract, approved exception to protected read paths, valid before, frozen source instrument or complete inherited execution-budget map exists. Native method-dependent rows additionally retain Clock's explicit hard-budget block. These are precise local prerequisites, not grounds to stop other workflows.

## 11. Work, commands and limitations

One technical impact iteration **1/3**, one bounded static pass. Product/test/runner/config edits0; tests/build/typecheck/lint0; runtime/browser/native0; qualification0; vendor0; development probes0; formal diagnostic launches0; children0; push/fetch/sync-check0. Reads use cat/sed/rg and immutable git show/rev-parse; Python standard-library SHA/JSON/text comparisons and report assembly are documentary operations, not runtime qualification. Exact-path git diff checks/staging and command-scoped `git -c core.hooksPath=/dev/null commit` finish the local receipt; no hooks/config policy change.

A few initial path lookups used src rather than src/internal, and one TODO parser assumed a flat items array before following its actual sections/tasks shape; these stopped before writes and were corrected by source inspection. Some overly large terminal views truncated and were narrowed. The final document path-existence check caught the storage workflow docs living in xai-web-persistence-contract rather than plugin-web-storage; the proposed map was corrected before commit and the actual owning docs were bound. No new product scope was silently introduced. A hash comparison command exceeded the initial shell yield with no immediate text; final explicit bounded receipt provides the completed hash results. None is a product test, evidence replay, or source failure. Memory quick-pass only supplied the historical caution to reconcile evidence before closure; all substantive findings are fixed-source verified here.

No actual denial, DOM, browser/native, timing, accessibility, account-switch, owner settlement, test or vendor execution took place. Observed code permits the documented false-empty/partial outcomes; exact real-host behavior is still for qualified before/fixed evidence. No claim that a newly proposed hook is correct, approved, implemented or that every imported consumer was semantically reviewed. No later DASH revision is required or implicitly adopted.

Documentary checks completed: **556/556 inherited manifest identities rehashed**, **633 total input identities**, **478 P0 identities byte-equal at parent**, c269 review byte-equal, original312/all scope-map fields/39 reversible normalizations verified, original933 ordered evidence prefixes plus six TT entries preserved, formal13/3/3/293 unchanged. Full16-row and canonical full G1 copied blocks checked. Manifest hashes itself/output neither as input; final output hashes and commit/parent/clean state follow in the handoff.

## Appendix D. Frozen broader API-impact candidate census

Source-text search of apps/packages .ts/.tsx for getPref/readRawPref/usePref/usePrefAsync/usePrefAutosaveAsync, excluding __tests__, .test., .spec., vitest paths. Includes comments/type documentation/definitions; **82 candidate files, not active-call count**. This bounded conservative list and each P0 byte identity preserve the global-change impact surface; option A does not migrate them.

- `packages/plugin-web-ai-chat/src/AiChatModule.tsx`
- `packages/plugin-web-ai-chat/src/internal/claudeAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/contextProvider.ts`
- `packages/plugin-web-ai-chat/src/internal/llmProvider.ts`
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
- `packages/plugin-web-ai-chat/src/internal/useChatPreference.ts`
- `packages/plugin-web-ai-chat/src/internal/useConversationRecovery.ts`
- `packages/plugin-web-board-core/src/BoardModule.tsx`
- `packages/plugin-web-board-core/src/internal/persistence.ts`
- `packages/plugin-web-board-core/src/internal/seed/board-data.ts`
- `packages/plugin-web-board-views/src/BoardModule.tsx`
- `packages/plugin-web-board-views/src/internal/persistence.ts`
- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`
- `packages/plugin-web-countdown/src/internal/useCountdownSaveRecovery.ts`
- `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`
- `packages/plugin-web-pomodoro/src/internal/durations.ts`
- `packages/plugin-web-pomodoro/src/internal/notifications.ts`
- `packages/plugin-web-pomodoro/src/internal/sessionsReducer.ts`
- `packages/plugin-web-pomodoro/src/internal/validate.ts`
- `packages/plugin-web-pomodoro/src/types.ts`
- `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
- `packages/plugin-web-settings-rest/src/internal/usePremiumTier.ts`
- `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx`
- `packages/plugin-web-settings-rest/src/panes/dateTimePane.tsx`
- `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/morePane.tsx`
- `packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/stickyPane.tsx`
- `packages/plugin-web-settings-shell/src/internal/defaults.ts`
- `packages/plugin-web-statistics/src/StatisticsModule.tsx`
- `packages/plugin-web-statistics/src/internal/narrowTaskCols.ts`
- `packages/plugin-web-storage/src/index.ts`
- `packages/plugin-web-storage/src/internal/storage.ts`
- `packages/plugin-web-storage/src/internal/usePref.ts`
- `packages/plugin-web-storage/src/internal/usePrefAsync.ts`
- `packages/plugin-web-storage/src/internal/usePrefAutosave.ts`
- `packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts`
- `packages/xai-web-calendar/src/CalendarModule.tsx`
- `packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts`
- `packages/xai-web-cmdk/src/CommandPalette.tsx`
- `packages/xai-web-cmdk/src/internal/readModuleStates.ts`
- `packages/xai-web-dashboard-grid/src/DashHeader.tsx`
- `packages/xai-web-dashboard-grid/src/DashboardModule.tsx`
- `packages/xai-web-dashboard-grid/src/internal/useDashOrder.ts`
- `packages/xai-web-dashboard-widgets/src/StickyComposer.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/calMonthDots.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/calUpcoming.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/habitStreak.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/isHabitsState.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/isTaskColsRecord.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/isUserCalEventMap.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/notifications.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/pomoStats.ts`
- `packages/xai-web-dashboard-widgets/src/internal/stickiesStore/useStickies.ts`
- `packages/xai-web-dashboard-widgets/src/internal/weatherStore/useWeather.ts`
- `packages/xai-web-dashboard-widgets/src/internal/weatherStore/weatherStore.ts`
- `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/MailWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/MiniCalWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatPomos.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatStreak.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatTasks.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/UpcomingWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/WorldClocks.tsx`
- `packages/xai-web-habits/src/internal/usePersistedHabits.ts`
- `packages/xai-web-matrix/src/MatrixModule.tsx`
- `packages/xai-web-matrix/src/internal/usePersistedMatrix.ts`
- `packages/xai-web-meditation/src/internal/useMeditationPrefs.ts`
- `packages/xai-web-meditation/src/internal/validate.ts`
- `packages/xai-web-meditation/src/types.ts`
- `packages/xai-web-pet/src/DesktopPet.tsx`
- `packages/xai-web-settings-appearance/src/internal/appearanceController.tsx`
- `packages/xai-web-settings-appearance/src/types.ts`
- `packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts`
- `packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts`
- `packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx`
- `packages/xai-web-shell/src/internal/railOrderController.tsx`
- `packages/xai-web-tasks/src/TasksModule.tsx`
- `packages/xai-web-tasks/src/internal/validate.ts`
