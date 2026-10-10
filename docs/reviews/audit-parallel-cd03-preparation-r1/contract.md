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
