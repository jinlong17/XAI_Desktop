# HAB-01–HAB-05 whole technical contract candidate — correction 2/3

## Authority, scope and status

PROPOSED technical contract, pending a fresh independent WHOLE review and root-only scoped admission. Module: web (project-system audit); primary workflow B, documentary workflow C. Sole controller: /root. This author owns only the two new task-card paths, contract.md and inputs.sha256, in docs/reviews/audit-parallel-hab01-hab05-technical-contract-r2/. No canonical document, code, shared engine, ledger, control record, runner or old evidence is changed. No implementation or execution grant follows from this proposal.

Actual clean detached parent: ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7. Fixed input: 6715c4367799366a10a9337a863f78036ec07ed9. Product P0: f9eb4b1f207bc4b46f547b90afc250424b3c8695. Adopted source 2: e7d113e01bbe5b1df47d5fb51821779b30916bf0. Full D2: 2190bb260f521a8239c3a9482de4efa6a02bea95, source-discovery approval ONLY. Original source 1: 7c6b867b046f82f7fa667edf187bc1cdda120ccd. Full D1: 9c36ebcd1b647306fc6393ed5bb4310009615e7f (REVISE). Source 2/3 and source-review 2/3 capacities remain unchanged. This is fresh technical author 2/3; prior author 1's failed unit remains consumed. No family reset.

All five original actions and acceptance clauses are copied from the actual-parent task card below. They are the product requirements, together with the original audit and accepted owning decisions. Code proves current implementation structure only. Formal totals stay 13 completed / 3 verification_pending / 3 in_progress / 293 pending = 312, 299 unclosed, 939 existing references. Each Habits item remains pending with its retained empty evidence list. No duplicate or narrowed item is created.

| Item | Original action | Original acceptance | Formal state |
|---|---|---|---|
| HAB-01 | 打卡、连续天、月完成率统一当地日期和应完成周期 | 频率/startDate生效；未来打卡不抬高结果；完成率不超过100% | pending |
| HAB-02 | 午夜/可见性恢复后更新今日状态并保留合法空习惯库 | 长开页面今天自动变化；清空后重开不注入样例 | pending |
| HAB-03 | 日记按变化保存durable draft并处理切习惯/外部更新冲突 | 直接关闭不丢输入；其他tab更新不静默覆盖草稿 | pending |
| HAB-04 | 突出今天打卡、应完成日和休息日，整理周标题与徽章 | 圆点不挤压文字；命中区44px；未来/历史补记含义清楚 | pending |
| HAB-05 | 校准可保存但不执行的提醒入口 | 显示实际支持/权限/已安排状态；关页提醒建设关联JOB组 | pending |

## Input interpretation and evidence limits

Complete source 1, D1, source 2, D2 and each accompanying input manifest were acquired at their immutable commits. Current rules, original audit, owning package docs and actual-parent card/control/state are acquired at the actual parent, not mislabeled as product P0. The finite inventory is derived from actual git ls-tree output before blob acquisition. Complete acquired bytes are individually bound in inputs.sha256; narrative excerpts are not the hashed unit. The inventory appendix enumerates actual acquired paths. Parent-tree code observations below are corroboration of adopted source, not an assertion that every P0/control/doc file is byte-equal.

D1's distinction remains: the original declared 60 Git paths included four changed control/doc paths, while 46 declared product paths were byte-identical between P0 and source parent 80cc49185310947d94c4f8f6339479551b71b7e4. This is a bounded historical finding, not a repository-wide comparison performed now. The bare source-1 manifest's reproducible byte interpretation does not establish original acquisition chronology. Source-1 reported PASS retains UNKNOWN raw PID/exit/EOF/drain/session provenance. The original message's literal backslash-n and later integration's metadata normalization do not validate original execution.

REL-01 owning amendments in Habits and tokens docs, web-local-time-contract/20260909-bug-diagnose.md and dev_log.md govern local civil dates. web-local-time-consumers-independent/20260909-review.md records fixed 9149778 six-consumer midnight evidence and narrower four-zone calculation-plus-Calendar evidence. It is not six full native walkthroughs per zone. Settings Date & Time recovery is a separate five-device-preference caller, not the authority for habit date arithmetic.

web-habits-save-independent/review.md accepts mounted-page recovery at 0b166054fecb51aa143edfddc88c1345a4955332. Its add/check-in/diary retry, retained latest edits, external conflict refusal, captured account refusal, actual recovery downloads and recovery-layout checks remain useful limited history. It expressly excludes direct-close/crash/host-route latest-draft durability and atomic cross-tab transactions. This contract extends those unmet original obligations; it does not rerun or overstate that acceptance.

Original May accepted decisions A1/B1/C1/D3/E1/F2 are read with later audit and REL-01 amendments. In particular: one canonical account-owned xai_habits_state; immediate check-in persistence; strict C1 including today; weekStart prop sun/mon with Sunday default; year-scoped progress; per-habit per-month diaries. F2 here means the Habits diary decision. Controller F-2 is separately the SET-08/CAL-01 Date & Time week-start ruling; it is not a diary or weekly-quota decision. Likewise Habits C1 is not controller C-1 about integrations. The separate habits-basics brief belongs to plugin-productivity and supplies no missing Web weekly policy.

## Shared semantics and finite design boundary

The following API names describe proposed internal contracts, not new public exports or executed implementations. Keep imports through public package surfaces. Do not put business logic into host/core or infer account-sync activation.

CalendarContext = local current instant + immutable local todayKey + displayedMonth + weekStart + viewIntent. DateKey is a strictly valid Gregorian YYYY-MM-DD identity; MonthKey is local YYYY-MM. Historical stored keys never shift when a device timezone changes. ISO createdAt remains an instant and cannot be reinterpreted as an explicit startDate. Use accepted public localDateKey/parseLocalDateKey/addLocalDays/startOfLocalDay/nextLocalDayStart/useLocalDayClock; no fixed 86,400,000ms civil-day arithmetic.

ScheduleResult is a discriminated result: known eligible dates/periods, or policy-unresolved, or invalid-source. Never turn unresolved cadence or invalid source into daily/zero/100%. CheckInIntent carries captured owner identity, habitId, dateKey, baseline revision/raw bytes and operation id. Result is committed/noop/refused with reason. Persist success precedes event emission; refusal has zero recorded events. One logical successful toggle emits once with the accepted post-toggle streak; retry/noop/hydration is not an extra event.

All computed presentations consume one eligible population. A defensive 0..100 display clamp complements a correct numerator/denominator; it cannot mask an incorrect population. Raw future/pre-start/rest/invalid keys are preserved as source/recovery data, not counted as completed obligations or silently removed. There is no migration grant.

### HAB-01 — dates, cadence, startDate and all statistics

Current factual evidence: internal/dateKeys.ts delegates its legacy utcDateKey name to localDateKey. computeStreak.ts walks checked calendar days backward from today without habit cadence/startDate. computeStats.ts counts date prefixes, including future yearly keys. toggle.ts accepts arbitrary requested dates. HabitDetail.tsx has separate countForMonth/aggregateMonthCount, HabitStatsView and AllHabitsView rate paths, independent of computeMonthlyRate. HabitList and HabitRow expose further summary/total paths. types.ts and AddHabitDialog persist optional frequency/startDate; presence of those fields is not proof of their semantics being implemented.

Proposed known-cadence algorithm: for daily, each valid civil day is due; weekdays use Monday through Friday and weekends Saturday/Sunday, matching the named controls without introducing holiday calendars. An explicit valid startDate is inclusive. A missing legacy frequency uses the previously accepted daily model; a missing legacy startDate applies no new inferred lower bound, preserving old history. Do not silently convert createdAt into startDate. These compatibility rules preserve the prior accepted domain rather than backdating a new obligation. Invalid explicit frequency/startDate yields invalid-source and a visible unavailable explanation, not an invented fallback; validator acceptance requires the impact gate below.

For interval [a,b], use eligible civil dates d satisfying a<=d<=b, d<=todayKey and d>=explicit startDate when present, with the known cadence. Completed is the subset of those dates whose stored value is true. Monthly denominator is eligible days from the displayed month's first day through min(month end,today), inclusive; a future month or startDate after today has denominator zero. Monthly rate is round(100*completed/eligible) when eligible>0; otherwise display a defined no-due-days state and numeric zero for nonmisleading chart geometry. Aggregate monthly rates use sum(completed)/sum(eligible), not an average of percentages or habitCount*elapsedDay. Unknown-policy habits are disclosed as excluded/unresolved; an aggregate cannot present that partial population as complete.

Streak for decided daily/weekday/weekend cadence walks consecutive due opportunities, skips rest days, stops at the first unchecked past due day and never crosses explicit startDate. Preserve C1: on an unchecked due today, displayed numeric current streak is zero; status says Today pending, not Missed today. On a rest day, anchor at the most recent due day. A completed due today extends the due-opportunity run. A missed prior due opportunity breaks it. Do not add a 24-hour grace timer, one-skip exemption, or substitute yesterday's count as today's C1 count. The audit's pending-versus-broken distinction is represented explicitly by status; changing the numeric C1 grace policy would require a genuine later owner decision, not one invented here.

E1 annual progress retains a calendar-year denominator 365/366, and its label describes checked eligible days this year, not due-opportunity completion rate. Its numerator excludes future/pre-start/non-due keys and cannot exceed denominator; remaining is nonnegative. The monthly All progress uses its eligible monthly denominator and the same completed set. Yearly denominator policy is not silently repurposed into an unapproved weekly quota.

Complete producer census to update or prove delegated to the same selector:
- Single habit four stat cards, cumulative total, annual numerator/remaining/progress width and 7/30/100 streak badges in HabitDetail.
- HabitRow Object.keys total and streak; each .hcell state.
- HabitList completedToday/eligibleToday and weekly completion levels across all habits.
- HabitDetail countForMonth/aggregateMonthCount, HabitsListView directory month count, streak and Today action.
- HabitStatsView completedToday, month checks/rate, ranking order and metrics, recent-day heatmap counts/levels/tooltips.
- AllHabitsView completedToday, badges, month checks/rate, progress numerator/remaining/width, each calendar day's dot states and denominators.
- MonthCalendar visible check state/action; toggle reducer and successful recorded-event postStreak.
A hidden aggregate path cannot retain prefix-count semantics while the single card is repaired. Separate Statistics/Dashboard products are read-only affected consumers, not brought into this writer by the census.

Future and history controls: choose the audit's permitted disabled-future option. Future dates and pre-start dates cannot add completion and do not emit. Existing out-of-domain keys remain recoverable and do not inflate results. Past eligible dates allow explicit add/remove labeled historical correction; rest dates show Rest day and no completion action. Cleanup of anomalous raw entries is not implicit in clicking a disabled control.

Smallest unresolved policy: weekly frequency has no approved quota, designated weekday, quota-week boundary, partial-start-week allocation, month-split allocation or weekly streak unit in the searched owning audit/seed/discovery/design/API/test/control sources. D3 establishes display week headers, not that quota periods must follow a mutable display preference. Options for later controller disposition: fixed weekday weekly obligation; N-in-a-fixed-civil-week quota with full/partial-week rule; or another explicitly specified weekly schedule. None is chosen. Block weekly due classifiers/rates/streaks and complete-population claims dependent on them, while continuing all decided date filtering, daily/weekday/weekend rows, empty/draft/reminder/geometry work. Preserve weekly records and show their unresolved calculation state. No user question is sent and no schema field is authorized by listing options.

### HAB-02 — live day, month intent and source health

Current facts: HabitList/HabitDetail call useLocalDayClock and HabitRow resamples through rendering. HabitsModule displayedMonth is independent state initialized once; it changes on selection/navigation. Header advancement alone does not prove month following. usePersistedHabits seeds on meta.isDefault OR habits.length===0; validateHabitsState collapses several invalid forms to an empty default.

Proposed DateView state machine:
- follow-current initially renders the current local month; one accepted clock snapshot drives list, row, detail, today actions and selector context.
- midnight, visible/focus/pageshow resume or accepted clock calibration resamples today. In follow-current mode the calendar moves across Dec/Jan and other month boundaries; no check-in or diary write is caused merely by clock advance.
- explicit previous/next/history selection enters pinned-month. Any later resample preserves that selected month and highlights today only if it belongs there. Explicit Return to today re-enters follow-current. Existing selecting-a-habit current-month behavior remains a deliberate navigation, subject to draft handoff.
- Editor identity is independent of calendar view identity. A draft opened in December for habit A remains A/December through January rollover. Keep its heading and editor pinned or complete a safe durable handoff before remounting another identity. Never relabel its text as A/January or habit B. Automatic follow cannot discard pending/conflict text.
- account/session transition invalidates async callbacks before any new projection; unmount cleans clock subscriptions. No closed-page tick promise: reopen recomputes now.

Proposed SourceState discriminant, before seed or selector use:
absent (successful read returned null under valid captured ownership); ready-nonempty; ready-empty (valid explicit stored empty collection); invalid (raw bytes present but invalid JSON/schema/domain); unavailable (read denied/error/locked owner); conflict/recovery (retained baseline and draft differ).
Only absent permits the existing first-launch seed policy, under the canonical writer and an absence recheck. A valid empty library renders lawful empty UI and performs zero sample writes on reopen/remount. Invalid/unavailable never seed, erase or auto-repair; preserve raw bytes where readable, show error/retry/export limits and refuse data mutation. Ready-empty is a success state, not an error. StorageEvent null is not automatically trusted absence during deletion/reset: lifecycle state decides before any seed. A committed reset/deletion generation must not be resurrected by an old seed effect.

The current boolean isDefault and lossy validator return cannot alone prove this partition. Proposed richer reader/validator result belongs to a separately reviewed exact impact; no shared API or validator change is granted by this contract. Raw source health must be known before implementing the seed distinction. Current invalid-source tests expecting reseed must be replaced under the original audit requirement, preserving malformed/unknown-schema fixtures as negative controls.

### HAB-03 — per-change durable diary, serial commit and both-byte recovery

Current facts: DiaryCard onChange sets localValue and calls onDraftChange; HabitsModule captures habit/month/text/first baseline in a ref, then flushes on internal navigation or blur. usePersistedHabits compares raw bytes and refuses observed conflicts, but compare-then-set is not atomic across tabs. The old successful mounted-page acceptance explicitly leaves close/crash/host-route durability open.

Required invariant: the latest accepted input change is retained durably before the event turn acknowledges it as saved/durably retained. Debouncing canonical consolidation is permitted only after lossless durable capture of every newest text value. Debouncing the sole durable write, or relying on blur/unload, violates the original direct-close acceptance. A status label cannot redefine accepted user input into an allowable loss window.

Proposed concrete design, subject to independent storage/lifecycle impact and single-writer grant:
1. A versioned registered account-owned recovery journal stores each editor identity's latest full text, sequence and exact base raw canonical bytes before any canonical mutation. A candidate logical key is xai_habits_recovery; it is NOT registered or admitted here. Do not use a hidden unregistered device key, dynamic key family, sessionStorage, or memory-only queue as durability.
2. Acquire coordinated lifecycle shared ownership and the Habits dataset/editor exclusive lease before enabling mutation. All seed/create/check-in/diary/retry/reset/migration/import/delete writers must obey one reviewed lock order: captured account lifecycle before Habits dataset/journal. A long-lived editor lease may support synchronous localStorage journal writes per change, while competing tabs remain read-only with visible ownership refusal. If the platform cannot uphold that admitted protocol, edit acquisition is refused; a non-atomic localStorage lock/CAS fallback is not permitted.
3. Within an admitted editor lease, each onChange synchronously persists the newest journal envelope and reads back exactly the written bytes before the UI can say Draft saved. Canonical consolidation can occur later under the same serialization. Awaited IndexedDB/Web Lock acquisition after freely accepting keystrokes is not a substitute for this per-change boundary. The final impact design must establish how the lease is acquired before input, renewed/released, and fenced from global reset/export/deletion. Current synchronous account helpers do not already prove this.
4. Recovery envelope fields: version, captured owner kind/accountId/generation and epoch/lease token, logical key, habitId, monthKey (F2), operationId, monotonic editSequence, latestText (including empty string), baseRaw and base revision/hash, observedExternalRaw plus hash if conflict, and canonicalCommit status. Full raw strings preserve both byte sets; hashes are identity checks, not recovery content. No private token/secrets are exported. Existing diary schema remains separate from the proposed journal schema; any schema change requires its own admission.
5. Before canonical write, revalidate captured owner/marker/tombstone/lease and reread canonical raw. If equal to base, apply only the diary slot to the current admitted state, preserving all other fields. If changed, refuse overwrite and persist conflict with both local latestText/base bytes and newer external bytes. Automatic last-write-wins and an unqualified retry of stale whole blobs are forbidden.
6. Canonical commit readback establishes Saved at editSequence N only if N is still latest. If N+1 arrived, keep Draft saved/Saving for N+1; an old callback cannot clear it. After canonical success, mark or remove the matching journal entry only under the same captured identity and sequence. If canonical success followed by journal cleanup failure, recovery recognizes matching bytes as already committed and never replays an older entry over newer data.
7. On reopen after a genuine page/browser close, read the admitted journal under the same owner/generation and valid schema before rendering the editor. Exact latest text, habitId and monthKey recover without blur. If canonical has advanced, show conflict, keeping both byte sets. Browser-process restart is a separate required fixture, not simulated by React unmount.
8. If durable write/readback fails, retain the latest attempted text and baseline in memory, show Not saved and the exact durability limit, stop further state-changing navigation/canonical overwrites and offer retry plus actual recovery export. Do not roll visible text back or claim close-safe. A failed-storage forced close cannot honestly guarantee survival; it is a failure condition, not an accepted carve-out. Full HAB-03 acceptance requires working per-change close survival in supported storage and explicit evidence of pending/fault handling, never a claim that a warning alone meets durability. At edit acquisition with unavailable durability, refuse editing with recovery information instead of inviting unretainable input.

Proposed state transitions: idle-clean -> acquiring-owner -> editing/durable-pending -> journal-retained -> canonical-pending -> saved. Failure branches: journal-failed, canonical-write-failed, conflict, ownership-revoked, source-invalid. Edits never change identity implicitly. Retry targets latest sequence and original captured identity; conflicts require explicit reload/discard after recovery is preserved or a separately reviewed merge, not blind overwrite. Explicit discard changes only the selected draft under its admitted lifecycle and never writes stale canonical state. Reload preserves recoverable local bytes until explicit disposition and adopts the verified external state. No success callback or event from a stale generation is accepted.

Recovery/lifecycle requirements:
- Account A->B, locked state, same account with a new epoch, and committed generation switch revoke old callbacks and prohibit A writes/downloads through B. Recovery remains attributable to the captured owner; rediscovery after reauthentication is not cross-account export.
- Journal entries, canonical blob and pending work are covered together by owner-scoped export, confirmed reset, account deletion and migration. Export includes raw local/base/external recovery data under a declared schema/manifest or an explicit omission with a recovery path; it must not silently call a canonical-only export complete.
- Reset/delete must first coordinate live editors, preserve or obtain explicit lawful draft disposition, fence queued work, then clear the exactly captured owner/generation. A tombstone prevents old-tab resurrection. Failed cleanup retains a retryable receipt and cannot report completion. Do not delete another account or reinterpret a logout as deletion.
- Long-lived lease release/host route leave/logout must be designed with the actual App.tsx host guard order, not legacy ConsoleLayout alone. A new participant/global guard is a locked shared seam; no root/host repair is authorized here.
- All writer discovery, journal validator/size/quota envelope, lifecycle enumeration, recovery retention, lock availability and unsupported browser behavior need exact independent impact before implementation. This technical proposal intentionally exposes these dependencies rather than claiming the existing async-pref engine accepts Habits automatically.

### HAB-04 — correct producers, clear meaning and real 44px targets

Current source facts: HabitRow renders weekly .hcell buttons; MonthCalendar renders .cal-cell div role=button controls; HabitDetail's AllHabitsView renders separately actionable .all-habit-dot buttons, with a five-column 10px CSS grid and 10px button dimensions. Directory HabitsListView has .habit-today-btn. Earlier .hcell max-width 26px and later 30px minimum declarations are conflicting static constraints, not measured rendered sizes. Mobile .hcell overrides cannot establish All dot geometry.

Proposed interaction/layout contract:
- Weekly strip uses seven distinct >=44 by 44 CSS-pixel interactive boxes; painted circles stay small within them. Weekday headings align to those exact columns. Long title/category/frequency and numeric badges wrap/truncate with accessible full text without intruding into targets. Separate row-selection and check-in controls semantically; Space/Enter on a child triggers one toggle and cannot bubble into selecting a row or scrolling unexpectedly.
- MonthCalendar .cal-cell has one accessible button per eligible in-month day with >=44x44 actual hit box, localized full date/habit/status and visible focus. Padding cells are not actions. Do not rely on a div's keyboard handler and painted ring dimensions as proof.
- AllHabitsView cannot preserve twenty 10px independent hit targets and satisfy the acceptance. Proposed responsive presentation: day summary with an accessible >=44px day opener and a per-day expanded list of all habit actions, each separately >=44x44; wide layouts may show individual targets directly only when they fit without overlap. Painted summary dots are noninteractive. Preserve access to every habit beyond the current slice(0,20); no silent truncation. This remains the same check-in data/action and not a new product policy.
- Directory Today is the clear primary action with >=44x44 target and localized checked/undo/due/rest/pre-start/policy-unresolved state. Today highlight is distinct from completed. Future dates visibly say Future and do not write; eligible past dates explicitly say historical correction. Known rest days say Rest, not Missed. Weekly unresolved policy is explained without falsely showing due/missed or declaring full completion.
- Badge milestones and annual progress remain secondary to today's action. Color is not the sole status signal. EN/ZH accessible names, tab order, Space/Enter, screenreader role/state and visible focus cover every interactive surface. Disabled controls convey reason without deceptive enabled labels.
- Mobile 375/390, tablet 768/1024 and desktop 1440 CSS pixels, both languages, long titles, empty library, dense 20+ habit days and 200% zoom are future evidence cases. Actual viewport/DPR/zoom and bounding boxes must be recorded. No overlapping transparent hit-area expansion. Trusted pointer center/edge hits must resolve to the correct control, not neighboring dots, parent row, pet or overlay.
- Preserve accepted save-recovery controls, nonoverlap list/detail and recovery feedback under failure layout. Shared tokens/global selectors are read-only; scoped CSS changes require affected visual regression, not global min-height patches.

These are proposed layouts subject to independent whole visual contract review; no screenshots, native measurements or business PASS were produced here.

### HAB-05 — preference, capability, permission, schedule and JOB

Current facts: AddHabitDialog defaults reminder enabled and persists its enabled/time; HabitsListView in HabitDetail.tsx displays that saved preference. The producer is not AllHabitsView. Settings push_habit is a separate device preference. Host capabilities can request Notification permission and issue one immediate Notification; generic status(notification) is not proof of actual availability, permission or a durable job. The finite inspected sw.js only shows resource-worker behavior, not a Habits scheduling/delivery implementation.

Proposed state model, exposed as read-only capability/status facts to Habits:
- Preference: disabled, editing, saving, saved, failed. Only actual acknowledged persistence yields Saved preference.
- Support: unsupported, supported, unknown/unavailable, with scope browser-open/closed-page/native if actually established. Test actual API availability without throwing on missing globals; do not infer support from a constant host label.
- Permission: default/not-requested, denied, granted, unavailable/unknown. Recheck on explicit user-driven activation and visibility return; no automatic permission prompt on opening or saving a habit.
- Schedule: unavailable/no scheduler; not scheduled; requesting; acknowledged scheduled with jobId/revision/owner/generation/timezone/nextFireAt and current preference revision; refused; cancelled; stale/unknown. Only an actual scheduler acknowledgement matching current preference and identity yields Scheduled. Permission granted and saved preference do not.
- Delivery status is separate from Scheduled; acknowledge does not prove delivery. Cancellation/replacement changes status only on matching acknowledgement; permission loss and owner/revision change invalidate any stale claim.

Current scope can truthfully say Reminder preference saved; delivery is not available here, plus actual support/permission when a qualified read-only status source exists. An absent status API shows Unknown/unavailable, not presumed granted. EN/ZH copy must never promise foreground reminders merely because one-shot Notification exists. No live API was probed in this task.

Closed-page delivery belongs to existing JOB original rows, not a new duplicate Habits item. The JOB dependency must own scheduling idempotency, revisioned replacement/cancellation, timezone/DST and exact fire-time semantics, account lifecycle, permission loss, offline/delayed retries, duplicate suppression and actual closed-browser delivery evidence. Its future API path/provider/service worker source is UNKNOWN until a finite owning inventory and separate contract exist. HAB-05 calibration can be accepted for truthful current capability and linked JOB dependency without claiming JOB delivery completed or HAB-01..04 accepted. No notification prompt, host/service-worker change or job API execution is authorized here.

## Finite candidate writer map and protected dependencies

All paths in the next table are relative to packages/xai-web-habits/. They are candidate later writer scopes only. Actual current writer scope remains the exact two new documents.

| Item | Candidate existing implementation files | Existing fixture anchors, all under src/__tests__/ |
|---|---|---|
| HAB-01 | src/HabitsModule.tsx; src/HabitList.tsx; src/HabitRow.tsx; src/HabitDetail.tsx; src/MonthCalendar.tsx; src/types.ts; src/internal/dateKeys.ts; src/internal/computeStats.ts; src/internal/computeStreak.ts; src/internal/toggle.ts; src/internal/habitMeta.tsx | computeStats.test.ts; computeStreak.test.ts; dateKeys.test.ts; localDate.test.ts; toggle.test.ts; HabitsModule.toggle.test.tsx; HabitsModule.views.test.tsx; HabitsModule.events.test.tsx; MonthCalendar.test.tsx |
| HAB-02 | src/HabitsModule.tsx; src/HabitList.tsx; src/HabitDetail.tsx; src/internal/usePersistedHabits.ts; src/internal/seed.ts | HabitsModule.persist.test.tsx; HabitsModule.render.test.tsx; localDate.test.ts; dateKeys.test.ts |
| HAB-03 | src/DiaryCard.tsx; src/HabitsModule.tsx; src/internal/usePersistedHabits.ts; src/types.ts | DiaryCard.test.tsx; saveRecovery.test.tsx; HabitsModule.persist.test.tsx; HabitsModule.views.test.tsx |
| HAB-04 | src/HabitList.tsx; src/HabitRow.tsx; src/HabitDetail.tsx; src/MonthCalendar.tsx; src/styles.css | HabitsModule.render.test.tsx; HabitsModule.views.test.tsx; MonthCalendar.test.tsx; HabitsModule.i18n.test.tsx; styles.css.tokens.test.ts |
| HAB-05 | src/internal/AddHabitDialog.tsx; src/HabitDetail.tsx; src/types.ts | AddHabitDialog.test.tsx; HabitsModule.add.test.tsx; HabitsModule.views.test.tsx; HabitsModule.i18n.test.tsx |

Candidate owning documentation for all five: docs/design.md, docs/api.md, docs/test.md, docs/dev_log.md. Fixture helper identities _helpers/state.ts and _helpers/render.tsx are in the acquired inventory. Source anchors are not claims the suites passed now. No new runner/source file path is invented or automatically admitted. internal/validate.ts and validate.test.ts are separately impact-gated for source-health/domain changes even though they live in the Habits package. internal/accountMigration.ts/index.ts, internal/monthGrid.ts, internal/emit.ts and registration.tsx remain read-only until a precise need and grant are established.

Read-only locked dependencies, acquired at the actual parent and enumerated in inputs:
- Date owner: packages/plugin-web-tokens/src/localDate.ts, useLocalDayClock.ts and its docs/tests. Display weekStart/default and controller F-2 do not authorize a shared preference redesign.
- Storage: packages/plugin-web-storage/src/internal/usePref.ts, prefMutation.ts, registry.ts, accountScope.ts, accountOwnership.ts, accountCoordination.ts, accountDataLifecycle.ts, accountDeletionReceipt.ts, lifecycleDeclaration.ts and dataExport.ts. The journal proposal requires schema/codec/validator/ownership/export/reset/delete/migration/lock impact across this finite seam; exact edit subset and any additional discovered callers must be reviewed before a writer grant.
- Current canonical xai_habits_state ownership, physical generation keys, account marker/tombstone, REL03/04 persistence docs, accepted D2 entry contract and async-pref contract/acceptance-status stay protected. Existing async acceptance explicitly excludes unconverted legacy synchronous writers.
- Host and consumers: apps/web/src/App.tsx, routes/modules/shellRegistrations.tsx, withDisabledFallback integration, legacy ConsoleLayout (not whole-host proof), host/capabilities.ts, service-worker/register.ts, public/sw.js, and Settings notificationsPane.tsx. Public event semantics remain unchanged; Statistics/Dashboard and JOB have separate ownership.
- All canonical audit/control/ledger/rules/registry/skills/generators, other worktrees, old forensic logs and historical runners are protected. No source-only task author may repair them.

Cross-item order: HAB-01 decided schedule selectors precede HAB-04 due/rest presentation. HAB-02 source-state and month-intent work must preserve HAB-03 editor identity. HAB-03 journal/lifecycle/all-writer impact and admission precede durability implementation. HAB-05 capability truth can progress independently; actual scheduling remains a JOB gate. A shared seam discovered necessary expands only a proposed impact inventory, never the current writer scope.

## Future oracle matrix and complete evidence chain

Each case below is a requirement-driven proposed fixture, not an executed test. Preserve positive and negative controls and freeze exact source/oracle identities before any run. Existing anchors above identify where package assertions belong; separate future native/host runners need their own immutable task manifests and qualification.

| Case family | Positive control | Negative/adversarial control and exact expected invariant |
|---|---|---|
| H01-DATE | Same instant maps to local expected day; eligible past/today toggles round-trip | UTC boundary, Pacific 23/25h, Lord Howe fractional DST, Shanghai, leap/year edges, invalid keys: no date shift, no fixed-ms extra day |
| H01-DUE | Daily and weekday/weekend with inclusive startDate; completed eligible subsets give <=100 | Before/on/after start, rest days, future stored keys, missing legacy versus invalid explicit fields; all single/All/Stats/heatmap/ranking/totals agree and raw bytes remain |
| H01-RATE | Full eligible current/past month and mixed cadence aggregate | Zero due days, future month, mixed unknown weekly: no NaN/Infinity/false100/full-population claim; aggregate uses sum eligible |
| H01-STREAK | Completed consecutive due opportunities, skipped rest days | Missing today uses C1 zero plus pending status; missed past due breaks; start boundary stops; no unauthorized grace; weekly unresolved held |
| H01-YEAR/EVENT | E1 eligible year numerator with 365/366; exactly one after-success event | Original AC-STAT-5 future December key in May must remain a scenario but be excluded under HAB-01; failure/retry/hydration cannot emit duplicate success |
| H02-DAY | Real mounted today controls advance at midnight/resume | Follow-current Dec->Jan versus pinned history; draft A/December text never becomes B/January; clock causes zero persistence writes |
| H02-SOURCE | Genuine absent first launch seed; explicit valid empty survives remount | Invalid JSON/schema/domain, denied read, locked owner and deletion/reset null cause zero sample writes and retain available raw bytes |
| H03-CLOSE | Type before blur, per-change journal readback, close tab/reopen and exit/restart browser recover exact latest text/identity | Close immediately after latest input; distinguish React unmount, page close and process restart; debounce-only implementation must fail |
| H03-FAULT | Successful retry uses newest sequence, actual downloaded recovery envelope matches whole expected bytes | Quota/readback/cleanup failure, further text, pending close, stale callback, source invalid: no false Saved/close-safe; failure remains visible and latest text retained pending recovery |
| H03-CONFLICT | Clean tab adopts external source; one admitted writer commits | Two real tabs interleave, external same-slot/other-slot changes, same-tab update, missing StorageEvent: refuse overwrite, recover both exact byte sets, not hash-only |
| H03-OWNER | Same valid owner/generation restart recovery | A->B/locked/same-account epoch, reset/delete/migration/export interleave, stale lease, browser crash release: no cross-owner writes/downloads or resurrection |
| H04-HIT | Real weekly .hcell, MonthCalendar .cal-cell, All expanded actions and directory Today >=44x44 | Dense20+, long EN/ZH,375/390/768/1024/1440,200%zoom, adjacent targets/pet/recovery: no overlap or dropped actions; trusted hit resolves correct target |
| H04-KEYBOARD | Visible focus and one Enter/Space activation per allowed target | Future/rest/pre-start/policy-unresolved actions do not write; child key event cannot select row too; history labels and weekday columns align |
| H05-TRUTH | Save acknowledgement shows preference success; actual permission/support facts separately | Unsupported/default/denied/granted, missing status API, save failure, stale/forged schedule acknowledgement: never equate saved/granted with scheduled |
| H05-JOB | Separately admitted job acknowledgement for matching owner/revision | Replace/cancel/permission loss/offline/close/account deletion; actual delivery is separate JOB evidence, not a Habits document PASS |

Meaningful semantic reconciliation: H01 fixes every owned population rather than hiding overflow with a clamp; H02 distinguishes evidence of absence from failed reads; H03 requires latest-input durability and all-writer serialization instead of accepting blur or compare/set; H04 changes the impossible 10px interactive layout into independent targets; H05 requires actual acknowledgement for scheduled claims. These conclusions are prose judgments, not inferred from string-presence assertions.

Mandatory future gates, with explicit nonexecution now:
1. Fresh WHOLE independent technical review of all five original rows, input identities, ownership, proposed state machines, unresolved policy boundaries and full oracle map. Root may adopt only the reviewed exact scope. No automatic canonical amendment.
2. Exact independent impacts for validator/source-health, journal/schema/lifecycle/all writers and any host/notification seam. Reconcile existing accepted owner rules first; reserve smallest truly unresolved weekly policy to controller. Every required writer grant and shared lock owner precedes code.
3. Future source/runner qualification and complete valid original P0 before at f9eb4b1f207bc4b46f547b90afc250424b3c8695 for each authorized running unit. Register requested/resolved SHA, immutable archive/dependency roots, fixtures, complete controls and budgets. Source-only approval is not qualification or valid before. Failure of a prerequisite is not a product FAIL.
4. Bounded implementation on an isolated exact baseline with single writer per admitted path; preserve failures and raw source fixtures. Patch/source/doc changes must follow reviewed contract. A red real-product oracle freezes reproduction and opens an independent repair task; reviewer never fixes.
5. Independent fixed verification using identical qualified oracle and declared before/fixed inputs. Whole package fixtures plus affected shared/date/storage/event/host callers. G1 means the full Required evidence checklist, not one convenient test: unchanged relevant suites run from both P0 and fixed archives, and every required row has a producing commit/artifact/hash.
6. Native complete Web-host lifecycle, two actual documents, page/browser close/restart, actual disk downloads and visual/keyboard/trusted-pointer evidence at the stated widths/languages. Capture real process/exit/EOF/drain and explain unsupported or unobserved rows as UNKNOWN/BLOCKED. Synthetic StorageEvent and jsdom are complementary, never replacements for actual close/concurrency.
7. Retain canonical clock r2 contract sections 12–14/E1–E25 and accepted original-goal regression boundaries for affected shared changes. The future regression manifest must enumerate the full applicable Required evidence, with an explicit reviewed applicability decision for every row; it cannot silently skip G1. Judging copies C-FB002 More boundaries, OE Appearance continuity-export and C-RD1 Features downstream remain paired with frozen originals; C-FD1 records its predicted nonjudging outcome. No old valid run is rerun here, no old budget is replenished, no canonical oracle is weakened. Any necessary new copy must have independent qualification first.
8. Fresh independent Astra WHOLE acceptance reconciles all five original actions, every mandatory case and blocked descendant, implementation limits, native evidence and regression ledger. A green package suite or one row's completion never implies all five or global REL01/REL05/D2 acceptance.
9. Root-only evidence reconciliation and inventory/remote ancestry/sync receipt follow acceptance. Only append authorized evidence, preserve formal states until separately entitled to close an item; keep formal 13/3/3/293 and 939 references unchanged here. Local commit is not remote preservation, product deployment, D3 or release.

## Budget, forensics and process contract

Author capacity is contract iteration 2/cap 3 from card.budgets.contract_iteration and contract_cap; earlier acceptance text saying phase1/3 is historical wording overridden by the explicit correction role and nested budget. Exactly one own meaningful concluding prewrite static invocation is permitted, <=120 seconds; task wall <=30 minutes; owned-process drain <=30 seconds. Prior technical author1 actual Python decode exit1/chunk039b74 consumed one failed intended prewrite unit. Its inputs/buffer/checker/materialization body was UNRUN, not a pure transport exemption. Earlier pre-tool JS backtick SyntaxError is separately retained. Root interruption prevented retry; no prior output/commit was accepted.

The original raw failed records at parallel-control-r1/hab-contract1-p88-original-failed-tool-records.json are acquired as inert forensic data, complete SHA-256 24fd9e76904b2d792ce687f893ac409ff64e422c95616e60f88f66f3e893cd91. Its stored 45k unvalidated draft and script are neither imported, executed, copied as an accepted contract nor used as this checker. This document is written fresh from original requirements and complete source review. Previous checker PID/session/outer split streams/EOF/drain remain UNKNOWN; inner checker UNRUN. Original failure accounting is not reset by this fresh actor.

Preparation uses read-only Git and text acquisition only. Initial shell read commands have actual tool chunks/exits but uninstrumented per-child PID/stream-split/EOF/drain are UNKNOWN. One later in-memory presentation lookup used an unavailable actual-parent copy of source2 and returned a TypeError; no checker, write or product operation ran. The preserved immutable source2 bytes were subsequently printed using their correct source identity. This is a read/presentation error, not a hidden concluding-check retry. Memory-registry search supplied no product fact and is not a product authority.

Both entire final buffers, every complete actual input and manifest row are assembled in memory before any filesystem write, including draft/index/commit-body files. The single new checker will use standard hashlib SHA-256 and exact git show bytes, ignore comment/blank manifest lines, validate exact original card-derived rows and current clean parent/allowed absence, and verify both frozen output hashes/UTF-8/newlines and full input identity coverage. No guessed minimum length, guessed filename/cardinality, P0/doc equality or prose keyword test replaces reasoning. Actual FAIL or UNKNOWN freezes: no retry, materialization or commit. The document does not preclaim this pending result; actual raw receipt belongs in the final Handoff.

Capture actual process PID, numeric exit, stdout/stderr bytes and EOF/drain BEFORE presentation; use Popen/spawn process handles, never CompletedProcess.pid. Read-only Git children are real processes and have separate receipts. Tool session/chunk not available through node remain UNKNOWN, not zero. Use direct UTF-8 stdin JSON and ASCII checker source without shell interpolation/backticks. After actual PASS only, materialize exactly the two allowed ADDs, then one hooks-disabled conventional commit with real newline Why/What/Scope/Risk/Docs/Tests. No amend/push/sync/network/cleanup or attachment retry; root owns reception.

New runtime/tests/build/lint/browser/native/server/business-parser/generator/product-import/qualification/before/probe/vendor/network/delegation executions are all 0. Own document JSON/hash processing and read-only Git are disclosed separately. Future implementation, qualification, native/browser/platform support, historical unobserved unit counts, total future cost and actual provider billing remain UNKNOWN, not zero. No future running-unit allowance is allocated by this contract. One remaining technical-author slot after this 2/3 attempt is capacity only, not permission for same-actor retry; independent whole review needs its own root task and card. Source/source-review families remain 2/3 and all other original caps and protected gates remain intact.

## Immutable input and acquisition appendix

The companion manifest contains complete individually hashed input bytes. The following actual-parent acquired paths form the finite inspected inventory (source-commit reports/manifests and external goal have their own exact identities in the manifest). Acquisition Git stdout hashes below identify full captured bytes, with the manifest binding blob reads; no tool-output truncation changes stored buffers.

- AGENTS.md
- CLAUDE.md
- apps/web/public/sw.js
- apps/web/src/App.tsx
- apps/web/src/host/capabilities.ts
- apps/web/src/routes/modules/shellRegistrations.tsx
- apps/web/src/service-worker/register.ts
- docs/reviews/20260908-full-product-audit/02-tasks-time-boards.md
- docs/reviews/20260908-full-product-audit/05-visual-ux-audit.md
- docs/reviews/20260908-full-product-audit/ALL-TODO-CURRENT.md
- docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md
- docs/reviews/20260908-full-product-audit/EXECUTION.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/authority-overlay.md
- docs/reviews/20260908-full-product-audit/parallel-control-r1/execution-state.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/hab-and-whole-supplement-review2-p75-reception.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/hab-contract1-p88-original-failed-tool-records.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-r1.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-r2.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-review-r1.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-technical-contract-r2.json
- docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/discovery.md
- docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/inputs.sha256
- docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r1/inputs.sha256
- docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r1/review.md
- docs/reviews/habits-basics/feature-brief.md
- docs/reviews/web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md
- docs/reviews/web-d2-async-pref-contract/acceptance-status.md
- docs/reviews/web-d2-async-pref-contract/contract.md
- docs/reviews/web-dashboard-clock-recovery-contract/contract.md
- docs/reviews/web-date-time-recovery-contract/contract.md
- docs/reviews/web-date-time-recovery-contract/remaining-writers.md
- docs/reviews/web-habits-save-independent/review.md
- docs/reviews/web-habits-save-recovery/20260909-diagnosis-and-fix.md
- docs/reviews/web-local-time-consumers-independent/20260909-review.md
- docs/reviews/web-local-time-contract/20260909-bug-diagnose.md
- docs/reviews/web-local-time-contract/dev_log.md
- docs/reviews/xai-web-habits/20260523-discovery-review.md
- docs/reviews/xai-web-habits/20260523-roadmap-seed.md
- docs/workflow/project/multi-machine-development.md
- docs/workflow/project/workflow.md
- packages/plugin-console/src/components/ConsoleLayout.tsx
- packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx
- packages/plugin-web-storage/docs/usePref-write-results.md
- packages/plugin-web-storage/src/internal/accountCoordination.ts
- packages/plugin-web-storage/src/internal/accountDataLifecycle.ts
- packages/plugin-web-storage/src/internal/accountDeletionReceipt.ts
- packages/plugin-web-storage/src/internal/accountOwnership.ts
- packages/plugin-web-storage/src/internal/accountScope.ts
- packages/plugin-web-storage/src/internal/dataExport.ts
- packages/plugin-web-storage/src/internal/lifecycleDeclaration.ts
- packages/plugin-web-storage/src/internal/prefMutation.ts
- packages/plugin-web-storage/src/internal/registry.ts
- packages/plugin-web-storage/src/internal/usePref.ts
- packages/plugin-web-tokens/docs/api.md
- packages/plugin-web-tokens/docs/design.md
- packages/plugin-web-tokens/docs/test.md
- packages/plugin-web-tokens/src/__tests__/localDate.test.tsx
- packages/plugin-web-tokens/src/localDate.ts
- packages/plugin-web-tokens/src/useLocalDayClock.ts
- packages/xai-web-habits/docs/api.md
- packages/xai-web-habits/docs/design.md
- packages/xai-web-habits/docs/dev_log.md
- packages/xai-web-habits/docs/test.md
- packages/xai-web-habits/eslint.config.js
- packages/xai-web-habits/manifest.json
- packages/xai-web-habits/package.json
- packages/xai-web-habits/src/DiaryCard.tsx
- packages/xai-web-habits/src/HabitDetail.tsx
- packages/xai-web-habits/src/HabitList.tsx
- packages/xai-web-habits/src/HabitRow.tsx
- packages/xai-web-habits/src/HabitsModule.tsx
- packages/xai-web-habits/src/MonthCalendar.tsx
- packages/xai-web-habits/src/StatCard.tsx
- packages/xai-web-habits/src/__tests__/AddHabitDialog.test.tsx
- packages/xai-web-habits/src/__tests__/DiaryCard.test.tsx
- packages/xai-web-habits/src/__tests__/HabitsModule.add.test.tsx
- packages/xai-web-habits/src/__tests__/HabitsModule.events.test.tsx
- packages/xai-web-habits/src/__tests__/HabitsModule.i18n.test.tsx
- packages/xai-web-habits/src/__tests__/HabitsModule.persist.test.tsx
- packages/xai-web-habits/src/__tests__/HabitsModule.render.test.tsx
- packages/xai-web-habits/src/__tests__/HabitsModule.toggle.test.tsx
- packages/xai-web-habits/src/__tests__/HabitsModule.views.test.tsx
- packages/xai-web-habits/src/__tests__/MonthCalendar.test.tsx
- packages/xai-web-habits/src/__tests__/StatCard.test.tsx
- packages/xai-web-habits/src/__tests__/_helpers/render.tsx
- packages/xai-web-habits/src/__tests__/_helpers/state.ts
- packages/xai-web-habits/src/__tests__/computeStats.test.ts
- packages/xai-web-habits/src/__tests__/computeStreak.test.ts
- packages/xai-web-habits/src/__tests__/dateKeys.test.ts
- packages/xai-web-habits/src/__tests__/index-barrel.test.ts
- packages/xai-web-habits/src/__tests__/localDate.test.ts
- packages/xai-web-habits/src/__tests__/registration.test.tsx
- packages/xai-web-habits/src/__tests__/registry-presence.test.ts
- packages/xai-web-habits/src/__tests__/saveRecovery.test.tsx
- packages/xai-web-habits/src/__tests__/setup.ts
- packages/xai-web-habits/src/__tests__/styles.css.tokens.test.ts
- packages/xai-web-habits/src/__tests__/toggle.test.ts
- packages/xai-web-habits/src/__tests__/types.test-d.ts
- packages/xai-web-habits/src/__tests__/validate.test.ts
- packages/xai-web-habits/src/constants.ts
- packages/xai-web-habits/src/index.ts
- packages/xai-web-habits/src/internal/AddHabitDialog.tsx
- packages/xai-web-habits/src/internal/TooltipLayer.tsx
- packages/xai-web-habits/src/internal/accountMigration.ts
- packages/xai-web-habits/src/internal/computeStats.ts
- packages/xai-web-habits/src/internal/computeStreak.ts
- packages/xai-web-habits/src/internal/createId.ts
- packages/xai-web-habits/src/internal/dateKeys.ts
- packages/xai-web-habits/src/internal/emit.ts
- packages/xai-web-habits/src/internal/habitMeta.tsx
- packages/xai-web-habits/src/internal/icons.tsx
- packages/xai-web-habits/src/internal/monthGrid.ts
- packages/xai-web-habits/src/internal/seed.ts
- packages/xai-web-habits/src/internal/toggle.ts
- packages/xai-web-habits/src/internal/usePersistedHabits.ts
- packages/xai-web-habits/src/internal/validate.ts
- packages/xai-web-habits/src/registration.tsx
- packages/xai-web-habits/src/styles.css
- packages/xai-web-habits/src/types.ts
- packages/xai-web-habits/tsconfig.json
- packages/xai-web-habits/vitest.config.ts
- packages/xai-web-persistence-contract/docs/api.md
- packages/xai-web-persistence-contract/docs/design.md
- packages/xai-web-persistence-contract/docs/dev_log.md
- packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx

Read-only Git acquisition receipts (stdout full bytes retained in memory; stderr as reported; exit and EOF explicit):

- PID 54995; exit 0; stdout 743586 bytes sha256 e218327f25b98786e1e8456b1d6a0ccf5c79cf3c4b9933df14a76444097bdf4d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 587ms; ls-tree -r --name-only ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7
- PID 55160; exit 0; stdout 18173 bytes sha256 1137e2a4785ce7ab9771897751b314c424a1c2e28b3e8e11c53e1451da3ae1ce; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 26ms; show 7c6b867b046f82f7fa667edf187bc1cdda120ccd:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/discovery.md
- PID 55172; exit 0; stdout 7182 bytes sha256 7711e4d3a24e07fb4f99bcd830ea758f8d1c4dd942a89b94a8d1e9196da9f1cd; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show 7c6b867b046f82f7fa667edf187bc1cdda120ccd:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/inputs.sha256
- PID 55184; exit 0; stdout 93608 bytes sha256 7bc4921a527747fc3d9a5a4a73372020c3bfef4533cade073a4626d8469c1f88; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 16ms; show 9c36ebcd1b647306fc6393ed5bb4310009615e7f:docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r1/review.md
- PID 55196; exit 0; stdout 25773 bytes sha256 97e0f5e72fc537d08a3689939fb687a32e0aa011cd6c36303cec6121e6f0598d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show 9c36ebcd1b647306fc6393ed5bb4310009615e7f:docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r1/inputs.sha256
- PID 55208; exit 0; stdout 23773 bytes sha256 135a45503c8d3b1142c4c49e8ed56784f66164a66fb8d7708b6c428d88137b47; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 16ms; show e7d113e01bbe5b1df47d5fb51821779b30916bf0:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r2/discovery.md
- PID 55220; exit 0; stdout 27439 bytes sha256 0d0ee64b01305334870ff879d0c9455cea6385b1c794f15cb3d812bc50ad6ad1; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show e7d113e01bbe5b1df47d5fb51821779b30916bf0:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r2/inputs.sha256
- PID 55232; exit 0; stdout 28375 bytes sha256 30aef323076f912032888723ce57cb9faa884a096cb95e5d414462a4c30217a6; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show 2190bb260f521a8239c3a9482de4efa6a02bea95:docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r2/review.md
- PID 55244; exit 0; stdout 29827 bytes sha256 e90112a5ea8f7e92f19fd027638a59667831241d42397e33073c3a2463de0b2b; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show 2190bb260f521a8239c3a9482de4efa6a02bea95:docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r2/inputs.sha256
- PID 55256; exit 0; stdout 13273 bytes sha256 519c72bcbdd1018af9a369614b9db04a674bf91870d99dcca03665dabe162100; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:AGENTS.md
- PID 55268; exit 0; stdout 22269 bytes sha256 6597e484cb5bde938fadb3c728f2e76c6228364584306a453655eeebd1e61ffb; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:CLAUDE.md
- PID 55280; exit 0; stdout 1032 bytes sha256 ae7bc15d75bcc603d470fc1199a71fa93a4cda448e01cacb378b08c8b3fffa6e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:apps/web/public/sw.js
- PID 55292; exit 0; stdout 212664 bytes sha256 6a044b3f994ffb5b9049c80a73bf13a1bb4eba42afba96c2587091691e87439e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md
- PID 55304; exit 0; stdout 2051 bytes sha256 184ebab89778a4ebfd837d72bd299f882d8b121893c1b897e8ba8482c3f49583; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/authority-overlay.md
- PID 55316; exit 0; stdout 329118 bytes sha256 04a00dd59eea8cef8addb7b94daaa492c0d35584a6c5bc7aa085949e0c6b48eb; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/execution-state.json
- PID 55328; exit 0; stdout 8461 bytes sha256 fc69993b66ebec393084232fb59711b1b0397c7b001cff677bd64aaf79e121f6; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/hab-and-whole-supplement-review2-p75-reception.json
- PID 55340; exit 0; stdout 22416 bytes sha256 4607760c6afaebcd387532a825460b283e29fa5c989de7be2ada9b92e3f6ffd6; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-review-r1.json
- PID 55353; exit 0; stdout 9478 bytes sha256 a21c96eea03bd95693190cd8d0f248793ea778daf0441ed2fe8a7748f216176d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md
- PID 55365; exit 0; stdout 2516 bytes sha256 9265b6f0eeb9605afaea35995c50061d803e9b1d9c76324674ec0fcd115dd65f; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 18ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-d2-async-pref-contract/acceptance-status.md
- PID 55377; exit 0; stdout 19685 bytes sha256 ccc57b63cd165d013ffc25011dd71cee6bfc262797e2668a36e549593eed3b7c; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-d2-async-pref-contract/contract.md
- PID 55389; exit 0; stdout 4706 bytes sha256 48e8076a75ea06ddd7d7a05d6a006d9373d3d9f3681ecbd97a64fdc086144d08; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-habits-save-independent/review.md
- PID 55401; exit 0; stdout 4058 bytes sha256 707dd86b72ce9bebaf251a83394f22cb8c7b0bf2cefca942008a5aa0e834a45e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-habits-save-recovery/20260909-diagnosis-and-fix.md
- PID 55413; exit 0; stdout 6127 bytes sha256 7763126516e5e30b6b654319ff9ffaac66c69709164addd6bd9f005389f0c422; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-local-time-consumers-independent/20260909-review.md
- PID 55425; exit 0; stdout 9738 bytes sha256 8a118f44ba3e2ab02c39f5d27b58160468c8d8f9c2d79be3879d14a9ad804157; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-local-time-contract/20260909-bug-diagnose.md
- PID 55437; exit 0; stdout 4826 bytes sha256 e38ed4adc5a50b4a6861c2ee9552132b644707ec5cc040f46d128238483a9736; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-local-time-contract/dev_log.md
- PID 55449; exit 0; stdout 6390 bytes sha256 92572a6ea33865753d3a461d96830d38e1dbcded58e684114eab450c81ab4b59; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/workflow/project/multi-machine-development.md
- PID 55461; exit 0; stdout 12660 bytes sha256 99bb429d2a9facd7cebfbcb52e97c7ccea648d19953e05e10f824189f6b9f050; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/workflow/project/workflow.md
- PID 55473; exit 0; stdout 32284 bytes sha256 dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/registry.ts
- PID 55485; exit 0; stdout 22024 bytes sha256 e011d2c69cf7853fa39bc2265432d2f2c2c85549074f45250fd5e0b87cee0445; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-persistence-contract/docs/api.md
- PID 55497; exit 0; stdout 11694 bytes sha256 b383850eb86e74f7de05d38d16ea8e374426db181b052fe38efd74cf958ada58; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-persistence-contract/docs/design.md
- PID 55509; exit 0; stdout 50515 bytes sha256 c1f8b995c1c4739611b97432dc1a453a490632659ee88906f6af578fa4c51e4d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-persistence-contract/docs/dev_log.md
- PID 55521; exit 0; stdout 2368 bytes sha256 92551e48490317dc5af7b6034f244ec26e12118d6f86750d2a4562b274d006b9; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx
- PID 55533; exit 0; stdout 18173 bytes sha256 1137e2a4785ce7ab9771897751b314c424a1c2e28b3e8e11c53e1451da3ae1ce; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 17ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/discovery.md
- PID 55545; exit 0; stdout 7182 bytes sha256 7711e4d3a24e07fb4f99bcd830ea758f8d1c4dd942a89b94a8d1e9196da9f1cd; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/inputs.sha256
- PID 55557; exit 0; stdout 4903 bytes sha256 8536a4f15ae016f8b395b09edf48c3256da832de76871aac9e5b6316c5c2abba; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:apps/web/src/host/capabilities.ts
- PID 55569; exit 0; stdout 7209 bytes sha256 c003c499ca3330ff6e3b7e738df4e3366d0daca141d65327dacc3d3665e1b8fe; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:apps/web/src/routes/modules/shellRegistrations.tsx
- PID 55581; exit 0; stdout 1028 bytes sha256 6cd222339c98ef1a8c741685c4b3b3e8a30f1df58baef3f3de21ec259a6d520b; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 23ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:apps/web/src/service-worker/register.ts
- PID 55593; exit 0; stdout 38235 bytes sha256 7eb1df2b7173949a3171e7cbafa467839b2ae2c515c86a6850980a0b9e36c1da; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/02-tasks-time-boards.md
- PID 55605; exit 0; stdout 15524 bytes sha256 06fd804b06fa0425fe472f333e5a4f0b3e11e3cae75b9274f34eee2894488129; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/05-visual-ux-audit.md
- PID 55617; exit 0; stdout 93710 bytes sha256 59bf980531bfe869597aa0db9f1a7f09a850a7c9d03483e61e98f09ace1e5cf2; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/ALL-TODO-CURRENT.md
- PID 55629; exit 0; stdout 15253 bytes sha256 d9d41f936954ad95eaffdeb9f02a499d3c4b5259dcc15b42b4e12f5d00ae7d0e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-r1.json
- PID 55641; exit 0; stdout 16282 bytes sha256 fb5195ba540de3fa46abacbced01a1d57c2387460f1e14812625e6abbae4e30c; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-date-time-recovery-contract/contract.md
- PID 55653; exit 0; stdout 6537 bytes sha256 ad23909c043cc14f47578666581d14bffc2f835d2251c482dfd0829251c1358e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-date-time-recovery-contract/remaining-writers.md
- PID 55665; exit 0; stdout 39147 bytes sha256 30fd07c6b0635ebe496c0caafd1c48b3e24d4a01f33b82597236008d87ae3bcf; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/xai-web-habits/20260523-discovery-review.md
- PID 55677; exit 0; stdout 1146 bytes sha256 9e33923fe5699cc8c10850f3869c1007608c77d8e5661006687db6157c583520; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/xai-web-habits/20260523-roadmap-seed.md
- PID 55689; exit 0; stdout 23706 bytes sha256 fd628638fd31a1e964ced77dd1690a378277113c5d8c0813c56a4901fca598d0; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-console/src/components/ConsoleLayout.tsx
- PID 55701; exit 0; stdout 15724 bytes sha256 04930bd98b4ba05346f1472cc70f849238db14ce6cb5b4d1165132719ffbc87f; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx
- PID 55713; exit 0; stdout 1763 bytes sha256 dcdc3da332f77ede6c1b2e9565c59563ff8f4c1fffe6284941f5ffd6f7dc79b1; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 17ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/docs/usePref-write-results.md
- PID 55725; exit 0; stdout 5153 bytes sha256 8d5b7fef04a014044b81cb95d56eaf084bfc306d7c8b9a27540b6caa3a2bef20; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/accountOwnership.ts
- PID 55738; exit 0; stdout 6636 bytes sha256 ca9d79b2188e1a2b011a4c41038019659b43e03127bc8bd876cffafe2e489e36; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/accountScope.ts
- PID 55751; exit 0; stdout 8308 bytes sha256 e1f2c9131cb9a00a2dff3951f4c95b2a7ad68692d0bf409b0ef511df137fa188; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/usePref.ts
- PID 55763; exit 0; stdout 1271 bytes sha256 b9dc4ffe7723ecdf11b0b1edb942406acf56a2a69eecba7aa378e05312d90e62; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 21ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-tokens/docs/api.md
- PID 55775; exit 0; stdout 1274 bytes sha256 dc3f8a18f008382d6d1b41114964e146fbcee5655b8337cd94ea0171cf1fcd09; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-tokens/docs/design.md
- PID 55787; exit 0; stdout 1272 bytes sha256 e7b1d0bb3d302dc3ca89a2b1b561564b75ce3958f73e22ade1ef897557a56909; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-tokens/docs/test.md
- PID 55799; exit 0; stdout 2901 bytes sha256 12115368db75d0a70e7ab4cb28842c5ae7503d429e08808e4f3d4c7b45179910; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-tokens/src/__tests__/localDate.test.tsx
- PID 55811; exit 0; stdout 1073 bytes sha256 c499e101ba384766df3939a95edce57f27862ef8fdd3553eb80a0907ed4a7264; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-tokens/src/localDate.ts
- PID 55823; exit 0; stdout 1181 bytes sha256 3b0b9e03d361b24aa62fae17bd44bf66d92c5537155972f22324b4f8b83f9dd7; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 11ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-tokens/src/useLocalDayClock.ts
- PID 55835; exit 0; stdout 19049 bytes sha256 d227445351ebed809dd87a8180cf47fdbe2b70d208682b5cd45ec7873b10e40e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/docs/api.md
- PID 55847; exit 0; stdout 29222 bytes sha256 783d30f336e1615bb96c2a402b6f1aa3d1c58737a1cd2154e439f6411f3e444b; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/docs/design.md
- PID 55859; exit 0; stdout 36762 bytes sha256 dffe4c14943d71495ac18ddbc8472558551c8a0faae1ebc180b1c31fc479f725; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/docs/dev_log.md
- PID 55871; exit 0; stdout 28569 bytes sha256 c8da8454c65df82c9b9321eed4dbc8b296fc3061c0bcba1e9b965b85f040b845; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 11ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/docs/test.md
- PID 55883; exit 0; stdout 1377 bytes sha256 e7a78e026e326a421084cc3425a17b5c0aa3ff4291f9aeff2bfd0ac055b7ed5e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/package.json
- PID 55895; exit 0; stdout 2610 bytes sha256 2602ef2ec6453407d70ce79b220228a8bb5dd6300e162276f3453d4db886eb74; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 11ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/DiaryCard.tsx
- PID 55907; exit 0; stdout 25016 bytes sha256 69790213ec8d26ac002df28709987235084b6de980d6499ef41811fcde327338; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/HabitDetail.tsx
- PID 55919; exit 0; stdout 6152 bytes sha256 7f1bdf47d5a06ed98c8c9a82ccf2679ec5f411b5c35229f96138dd99bbf07e4f; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/HabitList.tsx
- PID 55931; exit 0; stdout 3408 bytes sha256 5402b4e79b39dce0283c0e83114a14b070b97e8e3c3162ff9568db78383fea47; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 11ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/HabitRow.tsx
- PID 55943; exit 0; stdout 9739 bytes sha256 5be9d1461daedc724ac85341a54b744db3376c5cf80a3a938f223d5fa502c45c; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/HabitsModule.tsx
- PID 55955; exit 0; stdout 4676 bytes sha256 e9683a2dc5bdcea15d952e5be8ff5615282a3b42430e9a083bc3f137240a606b; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/MonthCalendar.tsx
- PID 55967; exit 0; stdout 1301 bytes sha256 543a5a9a02a479849023b6b2ae0ce90caebaabac54367ad90361b9d65f65d3a6; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/StatCard.tsx
- PID 55979; exit 0; stdout 3727 bytes sha256 862a5f4b2496e0914b774673f7240a655d90c380b409bd6e5e18ff0111474076; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/AddHabitDialog.test.tsx
- PID 55991; exit 0; stdout 2843 bytes sha256 7ab58d8c0250c456081709377ea236f65881b46193e57d9fff24ca92868a08fc; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/DiaryCard.test.tsx
- PID 56003; exit 0; stdout 2964 bytes sha256 220d44571370bd0d2cebb70098524059aa311c11696a7403800c69dc3755ef8d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/HabitsModule.add.test.tsx
- PID 56015; exit 0; stdout 5304 bytes sha256 371a1cac4ebffede520d380b6184066c312beb70a2491298ffd3d6b73f8206b4; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/HabitsModule.events.test.tsx
- PID 56027; exit 0; stdout 4116 bytes sha256 72b0ac98395e4fddfb3e339f6133eab91e6a332ced08bb5e50b561fdedcd42c8; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/HabitsModule.i18n.test.tsx
- PID 56039; exit 0; stdout 4120 bytes sha256 7b141c972357161f3d7bebaf5ba057c149340ff1a34b984cc3e8522837fe4e5c; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/HabitsModule.persist.test.tsx
- PID 56051; exit 0; stdout 5326 bytes sha256 6eb8d6bf4e6b5e6669884de0aca18d0fc5bdb60f93a867740ac52e591a16c00e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/HabitsModule.render.test.tsx
- PID 56063; exit 0; stdout 4977 bytes sha256 adf09b71a07873ce134e6e1cf4353982f78217a9eadd8c501067cf27a00f295b; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/HabitsModule.toggle.test.tsx
- PID 56075; exit 0; stdout 3976 bytes sha256 d149e2ab69d4457098dd9b4e806ab0072a5cf19ba676c2115c361e29413ce2ec; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 23ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/HabitsModule.views.test.tsx
- PID 56087; exit 0; stdout 5192 bytes sha256 9854ddbcd3274a607e21aa8913a9b0e9c07de1883c23a722280e9251fca6da86; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/MonthCalendar.test.tsx
- PID 56099; exit 0; stdout 1326 bytes sha256 b4b9a78114c1f7e6c8f2ea01ec65f31b92e8d52cb2d94a77fa8ddb753df13b1e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/StatCard.test.tsx
- PID 56111; exit 0; stdout 765 bytes sha256 9f63735f2e78e18a1361a224f7240fabfe5d117cc60f71d365014daa4194fd26; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/_helpers/render.tsx
- PID 56123; exit 0; stdout 592 bytes sha256 e972c05370f4009448386588101e409c1f88ea0e0b079ade0a63d65326c161b9; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/_helpers/state.ts
- PID 56135; exit 0; stdout 2386 bytes sha256 57df4ee2d2e2132b4b7225a4810449419e5ae1964961f80fe6563a60878fc814; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/computeStats.test.ts
- PID 56147; exit 0; stdout 2151 bytes sha256 1aecf28874250c10fa4dc472ca1aa44e3b2da78f0f6aa19b8c385ecc4d7db43a; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/computeStreak.test.ts
- PID 56159; exit 0; stdout 2676 bytes sha256 2a84ae1ffdbd84f9e49ac33802b6ec8fbfbcacd82a19956ec5112aaf52e2507d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/dateKeys.test.ts
- PID 56171; exit 0; stdout 636 bytes sha256 5dea80ae3cff0886778c945097332708913df9c0726662a1b1a22832b1e758e8; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/index-barrel.test.ts
- PID 56183; exit 0; stdout 645 bytes sha256 926453063353193874bb219fee57a86b5b61007764909c8a57795fdf2d4bf114; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/localDate.test.ts
- PID 56195; exit 0; stdout 1259 bytes sha256 c96edfe2ac469b1be9160fe140c2eee77eb67d2c24ea529ca7993dfb4a578afa; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/registration.test.tsx
- PID 56207; exit 0; stdout 1090 bytes sha256 2957ec2b5a0ee7843a573564efe05d68e537e3e0d3acb949d486f9db8750d6cc; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/registry-presence.test.ts
- PID 56219; exit 0; stdout 5840 bytes sha256 8219f2e6da60ee0b0fa41aa24ff2b050c236f74702da4418495f5a5e93f21085; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/saveRecovery.test.tsx
- PID 56231; exit 0; stdout 607 bytes sha256 ef053cd9f5b706158f5e688f12c7102584fab14af5dd825c5c12f6916264719f; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/setup.ts
- PID 56243; exit 0; stdout 1243 bytes sha256 3a4ced43da639ffc4124a970593cda15328ffd9580c8a831336da9e9b37daac1; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/styles.css.tokens.test.ts
- PID 56255; exit 0; stdout 2576 bytes sha256 ec991115becf3cf1a41cb774caa30ee271daeb926abbea2d5a49b80aebc7f993; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/toggle.test.ts
- PID 56267; exit 0; stdout 1881 bytes sha256 9995384ac6b3e155eb6f75b6cff215f5f97cbe96737d9ce51fcadff1d11ae2db; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/types.test-d.ts
- PID 56279; exit 0; stdout 2067 bytes sha256 67f4c3877f99a22462b15223d515ed45ecc5f7173bb22c258883787fb6e1385d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/__tests__/validate.test.ts
- PID 56291; exit 0; stdout 415 bytes sha256 dfb8a020a14243db945c65bbac729a7412db991330a9d8e0ab09eb48c4aa44f7; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/constants.ts
- PID 56303; exit 0; stdout 1101 bytes sha256 b058f2c1635c8cc0093e0c725976df72645c9a41873b286192716150b81ce794; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/index.ts
- PID 56315; exit 0; stdout 10047 bytes sha256 87316195e6b3c69ee2b168d3e713e9c47d1d5dc1ce24daa8b0364b968a6fac1f; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/AddHabitDialog.tsx
- PID 56327; exit 0; stdout 4750 bytes sha256 99ba7298cfd6ce30cd9786a917a0f453b326a92339f877fa112167e8c5675fda; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/TooltipLayer.tsx
- PID 56339; exit 0; stdout 954 bytes sha256 21216b988678a7b82a066e45effb85697e3b5446918098165267659d519715fc; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/accountMigration.ts
- PID 56351; exit 0; stdout 1536 bytes sha256 14ffea2f046e60115de100e3ddc747e1d52602eca050ef18145719e1c6e551ab; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/computeStats.ts
- PID 56363; exit 0; stdout 1324 bytes sha256 684cd49084d8c82dfdb5e09a03f1436b628533b530eb454a9db4d69dc1fea418; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/computeStreak.ts
- PID 56375; exit 0; stdout 756 bytes sha256 d790f12de51912467d24bf3b8935bceb0128f4481e71ea3423638309fb8bbffb; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/createId.ts
- PID 56387; exit 0; stdout 2493 bytes sha256 4aea06b535811f9b2306d6c2414136103a4d5994c36054af463c9316577fb131; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/dateKeys.ts
- PID 56399; exit 0; stdout 1008 bytes sha256 a3120fac67c029276857a2ca883ba935a04196746bb4637630eb6d982a59a1a0; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/emit.ts
- PID 56411; exit 0; stdout 11305 bytes sha256 b510651524bccfd386fdb81bc56d574f45a6161ab541027d91ca77a26787dcdd; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/habitMeta.tsx
- PID 56423; exit 0; stdout 4863 bytes sha256 1ad518e62ba165ec1c0186d9b31c2a2bfa9f14ed1222f532b54da7bffbfd556d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 18ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/icons.tsx
- PID 56436; exit 0; stdout 1670 bytes sha256 51896134dab536db2c15f1535df41c90538d34370f2c9e160fb145a9d760e43a; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/monthGrid.ts
- PID 56452; exit 0; stdout 2252 bytes sha256 50b5e26af3bc6b3f57071bc3d96156a5371f3e6f4212ab9e9284fe0b1d60c05a; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/seed.ts
- PID 56468; exit 0; stdout 1470 bytes sha256 caca88431eb391df5da97f944f199e85dc189680f369773693058381744881a8; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/toggle.ts
- PID 56480; exit 0; stdout 4255 bytes sha256 d16113dac02a23f3b3228e5b47d7d5d0d48164b0ea8c61a3f00daf182bb61a57; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/usePersistedHabits.ts
- PID 56492; exit 0; stdout 2193 bytes sha256 32ceb5afaa1c1e55f65e832b8568f51413e96d1a2f61b3ba2779374ff1229ccf; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/internal/validate.ts
- PID 56504; exit 0; stdout 1372 bytes sha256 830c62e07f7c866a43c84ceee0d399f7af0106bc1b86a778e126e6f029ca9d7b; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/registration.tsx
- PID 56516; exit 0; stdout 26995 bytes sha256 5cc348a8bde447783d4e4c26df4e607cb8bbed229c89d537d6e7e8bfcf6cd6a5; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/styles.css
- PID 56528; exit 0; stdout 3674 bytes sha256 086bb20c356cf8bdc326b314d0fea732e0697d7c48b6cee4cc375e49e6b05958; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 18ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/src/types.ts
- PID 56540; exit 0; stdout 17259 bytes sha256 27265e21b19eec1558c85bdd5054cd34dc7354fe0eac7f5b872eb9b329d63b23; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-r2.json
- PID 56554; exit 0; stdout 25773 bytes sha256 97e0f5e72fc537d08a3689939fb687a32e0aa011cd6c36303cec6121e6f0598d; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r1/inputs.sha256
- PID 56567; exit 0; stdout 93608 bytes sha256 7bc4921a527747fc3d9a5a4a73372020c3bfef4533cade073a4626d8469c1f88; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/audit-parallel-hab01-hab05-source-discovery-review-r1/review.md
- PID 56580; exit 0; stdout 20190 bytes sha256 bdb21c63a5404f5adbaffa553cd56b9ce533bbf8d930a92cef20163f41f4cfc9; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 15ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-technical-contract-r2.json
- PID 56593; exit 0; stdout 69715 bytes sha256 24fd9e76904b2d792ce687f893ac409ff64e422c95616e60f88f66f3e893cd91; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 17ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/parallel-control-r1/hab-contract1-p88-original-failed-tool-records.json
- PID 56605; exit 0; stdout 63469 bytes sha256 b11bd620c608b9d56ea1f0f879e0705278a1bda86f09cd09675f598552d181fc; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/20260908-full-product-audit/EXECUTION.json
- PID 56617; exit 0; stdout 499 bytes sha256 044e1ff87025b746fcc3da6f222f5c9058f3b5442b20264e95b2b52dd94326c7; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 16ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/habits-basics/feature-brief.md
- PID 56629; exit 0; stdout 315 bytes sha256 e5fd80cab496575b6978b55d18244da722c48ad0e917a1a1149337612ae14bb3; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 17ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/eslint.config.js
- PID 56641; exit 0; stdout 553 bytes sha256 e31f296daa9555fc0bd1070efaa9e3732995fcfe4526710269c797e5111d124e; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/manifest.json
- PID 56653; exit 0; stdout 172 bytes sha256 d6ed012dbb7ba814d3ad10969827e9e91ca33dc1c5a292550967032d367dca1a; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 13ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/tsconfig.json
- PID 56665; exit 0; stdout 212 bytes sha256 eb5a6cb8b379f81249d42bfe773bb1e1962b31213bbac9f12ec877b7a95bd2dc; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/xai-web-habits/vitest.config.ts
- PID 56996; exit 0; stdout 152183 bytes sha256 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 23ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:docs/reviews/web-dashboard-clock-recovery-contract/contract.md
- PID 57011; exit 0; stdout 13261 bytes sha256 f644e78ec482c0b9b66f9702407eb34e1dcd110e837293e4a736964bfe7ac408; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 20ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:apps/web/src/App.tsx
- PID 57023; exit 0; stdout 820 bytes sha256 d669fe47d22f6d9f4b5c56b24ca60eb68dee9fc6877de4901d328ffdd7e50e1c; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 19ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/accountCoordination.ts
- PID 57035; exit 0; stdout 9496 bytes sha256 94af1eb77dc83d8e74598cde15c7316f2c50825457f290d8775df0beff255931; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/accountDataLifecycle.ts
- PID 57047; exit 0; stdout 1566 bytes sha256 3544a1cd5ef66881e460f470cb4ceb7e34528d4e4732c23e85eed6ab98d9c705; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 16ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/accountDeletionReceipt.ts
- PID 57233; exit 0; stdout 6044 bytes sha256 ec207ff6a20d64491559f603364ea222a724ab6656862268b2117b0b24fbf255; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 34ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/dataExport.ts
- PID 57245; exit 0; stdout 4728 bytes sha256 f292de4ec2e44d0fe75dde836fb360cfc2c292ceeaa47b2c107036765cd5b922; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 14ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/lifecycleDeclaration.ts
- PID 57257; exit 0; stdout 13994 bytes sha256 3f8840ac8e7e824ddc9aacb6839d19a0602244235dbfd542f686ca749125ec00; stderr ""; stdoutEOF=true stderrEOF=true; elapsed 12ms; show ac6d1e7daf5d26a7c0cfa244620f5bd2514035a7:packages/plugin-web-storage/src/internal/prefMutation.ts
