# Habits HAB-01–HAB-05 whole independent source review 1/3

## Verdict and admission

**WHOLE VERDICT: REVISE.** This reviews all five original actions and acceptances, the complete 18,173-byte discovery and its full 61-row input manifest. It is a new independent source-only review, not a repair, accepted implementation contract, qualification, before execution, business acceptance, or a new historical test run. No product failure was reproduced here. Formal counts remain 13 completed / 3 verification_pending / 3 in_progress / 293 pending, 299 unclosed, 939 existing references; all five Habits items remain pending. This review changes none of those control records.

- Product module: web. Independent reviewer owned worktree: /Users/lijinlong/.codex/worktrees/audit-hab01-hab05-review1-20261010/XAI_Desktop; HEAD was detached and clean at 255c5200969843e519dfb108f993809bc73e429f.
- Review dispatch parent: 255c5200969843e519dfb108f993809bc73e429f. Frozen integration: f3c324179ff138c60c50e5f98c8334a48d113fa0.
- Discovery source: 7c6b867b046f82f7fa667edf187bc1cdda120ccd; actual source parent: 80cc49185310947d94c4f8f6339479551b71b7e4. Discovery's own earlier frozen input remains 4f988fe610b1c002b73ec3fbd915dd80fd88edcc.
- Product P0: f9eb4b1f207bc4b46f547b90afc250424b3c8695. Every Git input below is individually pinned; current control metadata is not treated as P0 product content.
- Process disposition: original static result remains REPORTED_PASS_WITH_UNKNOWN_RAW_PROVENANCE; not independently established execution PASS and not reclassified as exit zero. Binding disposition: declared-byte identity MATCHES at source parent, but source provenance/coverage NEEDS_REVISION before adoption. Metadata-only integration does not cure either hold.
- Independence: fresh Codex review of another actor's source. No child agents, vendor invocation, or cross-vendor result. Runtime-selected model identity beyond this session is UNKNOWN; task-card model is a request, not runtime evidence.

## Original whole scope

| Item | Original action | Original acceptance | Formal state |
|---|---|---|---|
| HAB-01 | 打卡、连续天、月完成率统一当地日期和应完成周期 | 频率/startDate生效；未来打卡不抬高结果；完成率不超过100% | pending |
| HAB-02 | 午夜/可见性恢复后更新今日状态并保留合法空习惯库 | 长开页面今天自动变化；清空后重开不注入样例 | pending |
| HAB-03 | 日记按变化保存durable draft并处理切习惯/外部更新冲突 | 直接关闭不丢输入；其他tab更新不静默覆盖草稿 | pending |
| HAB-04 | 突出今天打卡、应完成日和休息日，整理周标题与徽章 | 圆点不挤压文字；命中区44px；未来/历史补记含义清楚 | pending |
| HAB-05 | 校准可保存但不执行的提醒入口 | 显示实际支持/权限/已安排状态；关页提醒建设关联JOB组 | pending |

The task card at the actual dispatch parent and the original source-author card at its actual parent agree on these five rows. The bound original audit reports supply requirement origins: 02-tasks-time-boards.md T06/T08/T10 and the Habits rows, plus 05-visual-ux-audit.md Habits visual row. The May package plan is historical authority for F2 monthly diaries/C1 old streak behavior; the later local-time amendment supersedes its UTC statements. Implementation presence alone supplies no product requirement or acceptance.

## R1 — Correct source identity and bounded-diff statements; retain provenance limits

Discovery line 9 says a targeted P0-to-parent diff covering named audit/owning-doc paths reports only an added Time Tracker PRD. Independently comparing the exact 60 declared Git paths reports four control/document changes: modified ALL-TODO-CURRENT.md and CURRENT-CONTROL-PLANE.md, and added parallel-control-r1/execution-state.json and task-hab01-hab05-source-discovery-r1.json. This is expected control evolution, not product drift. All 46 declared apps/packages paths have identical full-byte SHA-256 at P0 and source parent. That supports only those named product paths. The Time Tracker PRD is not one of these declared paths; this review does not infer a whole apps/packages equality or challenge unrelated accepted TT08 owning-doc changes.

All original 61 hashes independently match: 60 Git blobs at 80cc49185310947d94c4f8f6339479551b71b7e4, and the external goal at its exact path. This proves a reproducible content interpretation. Original manifest rows contain bare paths without per-row source SHA, and acquisition chronology/actual per-read SHA cannot be reconstructed from matching bytes. A new correction should state actual source identities for each row, bind current parent metadata separately, correct the diff narrative, and distinguish root reconstruction from original acquisition evidence. This reviewer does not rewrite or retrovalidate the original manifest.

The two source files are byte-identical at original source and frozen integration (discovery SHA-256 1137e2a4785ce7ab9771897751b314c424a1c2e28b3e8e11c53e1451da3ae1ce; manifest 7711e4d3a24e07fb4f99bcd830ea758f8d1c4dd942a89b94a8d1e9196da9f1cd). Original commit body retains literal backslash-n separators. Integration has real newline Why/What/Scope/Risk/Docs/Tests fields. Raw commit-message bytes hash to 03cef11865da1adb815bd57ddf119b30bc7f5a91519cb37144d81ecc62d85a48; adding the pretty-format trailing LF yields reception's 8b38ae40f9840169571205928e2771544dabf7065a2c9e53fd85c67e9a7f1e98. This is an explicit serialization distinction, not content drift. Remote preservation is reported by the frozen reception record; no network verification occurred in this task.

## R2 — Bind and reconcile the actual accepted clock and mounted-recovery history

The source includes valid REL-01 amendments in Habits and tokens design/api/test docs, so its local-civil-day semantics have documentary basis. However its declared contract/remaining-writers pair under web-date-time-recovery-contract concerns Settings Date & Time's five device preferences and all-writer scheduling, not the six-consumer local-time contract. The actual references already exist and were omitted from the original manifest:

- web-local-time-contract/20260909-bug-diagnose.md and dev_log.md define browser/device civil-day identity, next-local-midnight arithmetic, midnight/focus/pageshow/visibility/calibration, immutable historical keys and historical-selection preservation.
- web-local-time-consumers-independent/20260909-review.md records the correct TT idle before failure and fixed 9149778 six-consumer midnight acceptance, including Habits header advancement. Its four-zone calculation-plus-Calendar evidence is explicitly narrower than six full walkthroughs per zone. This is historical accepted evidence, not a new execution in this review.
- web-habits-save-recovery/20260909-diagnosis-and-fix.md and web-habits-save-independent/review.md record accepted mounted-page save recovery at fixed 0b166054fecb51aa143edfddc88c1345a4955332. They explicitly retain close/crash/host-route draft-loss and compare/set non-atomicity boundaries.

The new correction must distinguish accepted existing behavior from remaining HAB-02 month-follow/empty-seed and HAB-03 durable-draft work. Do not ask again whether user-selected history should be preserved: the accepted local-time rule already answers that. A follow-current-month implementation must preserve explicit history and dirty diary identity. Existing acceptance does not establish automatic Habits displayed-month advancement, durability of uncommitted text, or a current all-surface PASS. No old valid clock or save-recovery runner may be rerun merely to fill this source document.

Also bind the actual live seam dependencies used in the new source map: Habits internal/monthGrid.ts, internal/validate.ts, internal/accountMigration.ts, index.ts; the host withDisabledFallback import and packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx; actual /sw.js if describing worker behavior; and package localDate/toggle/views fixture sources when proposed as existing anchors. The original list names several candidate files without reading/binding them. The old package test totals are neither current results nor an exhaustive future fixture map. The separate legacy ConsoleLayout source is not evidence for the actual Web shell's Habits lifecycle.

## R3 — Cover the complete owned statistics and click surfaces

HAB-01/HAB-04 are not fully mapped by computeMonthlyRate plus the weekly strip. HabitDetail.tsx:130–147 counts every matching key for an arbitrary displayed month; HabitStatsView:470–471 and AllHabitsView:574–575 independently divide aggregate counts by habit count times elapsed calendar days. They do not call computeMonthlyRate and do not enforce cadence/startDate/future exclusion. The all-view progress numerator, remaining count and width use the same calculation. HabitList's completed-today/weekly summary and HabitDetail's heatmap/rankings use all habits as the population. These are owned Habits surfaces, not the separate Statistics product. The correction must explicitly enumerate them and freeze compatible schedule-aware/future-exclusion fixtures; repairing one helper would leave these distinct source paths outside the evidence.

HAB-04's other direct producer is HabitDetail.tsx:661–672: each AllHabits day renders up to twenty independently clickable .all-habit-dot buttons. styles.css:817–835 defines 5 columns of 10px dots with 10px rows and 10px button width/height; the mobile/tablet .hcell overrides do not target .all-habit-dot. The discovery discusses small desktop .hcell and mobile 44px overrides but misses this all-width click surface. Desktop .hcell has later min-width and min-height 30px as well as the earlier max-width 26px, so do not report 26px as a measured rendered width. CSS presence is a static risk and cannot decide computed geometry under all host styles. A complete future visual contract must include single-habit calendar, weekly strip, directory Today buttons, AllHabits dots, title/badge/weekday alignment, mobile/tablet/desktop, EN/ZH, focus and keyboard affordances. Smaller painted dots may be retained inside separate >=44px hit targets; overlapping invisible targets do not satisfy the acceptance.

HAB-05 line 75 also mislocates the saved reminder display: HabitDetail.tsx:426 is HabitsListView, not AllHabitsView. Correct the producer name so later truthful-capability checks exercise the actual UI. These fixes are source-map corrections, not current runtime failure verdicts.

## Whole five-item assessment and finite future contract needs

All candidate paths below are existing repository paths unless a future contract explicitly introduces a new path. All are proposals, not writer grants. The common existing test root is packages/xai-web-habits/src/__tests__/; the common source root is packages/xai-web-habits/src/. Shared packages remain read-only.

### HAB-01

Accepted goal: local dates, cadence/startDate, future exclusion and rate <=100. Static facts: dateKeys.ts uses public localDateKey; computeStreak.ts anchors at today and walks calendar days, with no habit schedule; computeStats.ts counts prefix keys; toggle.ts accepts an arbitrary date key and emits its computed post-streak via HabitsModule after successful save. types.ts and AddHabitDialog store daily/weekdays/weekends/weekly plus startDate; labels do not establish schedule semantics. Historical C1 is not proof of the new due-cycle rule.

Finite candidate source set: HabitsModule.tsx, HabitList.tsx, HabitRow.tsx, HabitDetail.tsx, MonthCalendar.tsx, types.ts, internal/dateKeys.ts, internal/computeStats.ts, internal/computeStreak.ts, internal/toggle.ts, internal/habitMeta.tsx, internal/validate.ts. Read-only dependencies: internal/monthGrid.ts, internal/emit.ts, public tokens helpers/clock, account storage/validation and actual host registration. Existing fixture anchors: computeStats.test.ts, computeStreak.test.ts, dateKeys.test.ts, localDate.test.ts, toggle.test.ts, HabitsModule.toggle.test.tsx, HabitsModule.views.test.tsx, HabitsModule.events.test.tsx, MonthCalendar.test.tsx. Include all in-package aggregate surfaces from R3; external STAT/DASH consumers remain separately unqualified.

Future oracle matrix: each frequency, missing legacy frequency/startDate, startDate before/on/after today and month boundaries, due versus rest days, current day pending versus missed due day, historic correction, future stored keys, zero eligible denominator, leap/year/month boundaries and <=100 in single/All/Stats views. Same accepted local-day key at UTC-boundary/DST/resume conditions; preserve existing keys instead of timezone shifting them. Test future value in compute365 is currently explicitly counted by AC-STAT-5; future corrected expectations need the original HAB-01 requirement as authority, not deleting that case.

Minimum genuinely unresolved product basis: the audited sources specify weekly only as a type/label, without quota/week-boundary/partial-week/streak policy; no approved exact weekly denominator or current-due-day grace was found. Future contract must cite an existing decision or bring only this narrow basis to controller. Choosing helper factoring, disabling future check-in controls under the audit's offered alternative, and fixture layout are engineering choices; no automatic worker question. Stop on new schema/migration or shared date changes outside a separate impact grant.

### HAB-02

Accepted goal: live today and lawful empty persistence. HabitList.tsx/HabitDetail.tsx consume useLocalDayClock; HabitRow samples new Date on parent render. HabitsModule.tsx displayedMonth is initialized once and reset on selection/manual navigation, so header today and displayed month are distinct states. usePersistedHabits.ts seeds on meta.isDefault OR habits.length===0; a valid stored empty library reaches the seed branch. validate.ts maps invalid shapes to an empty default and existing persistence tests expect corruption/schema mismatch seeding, so valid-empty, absent, invalid and unavailable must not be conflated.

Finite candidate source set: HabitsModule.tsx, HabitList.tsx, HabitDetail.tsx, internal/usePersistedHabits.ts, internal/seed.ts; inspect internal/validate.ts as a locked dependency before any expansion. Fixture anchors: HabitsModule.persist.test.tsx, HabitsModule.render.test.tsx, localDate.test.ts, dateKeys.test.ts. Preserve the accepted clock contract and reuse old evidence only as historical source. New future evidence must separately cover valid-empty remount and no sample writes, genuinely absent first launch positive control, invalid/unavailable source preservation under the accepted storage contract, midnight and visible recovery of today controls, and Dec→Jan/current-month following versus explicit historical selection. Do not silently discard an old-month diary draft during automatic month advance. If source-health repair requires validator/shared storage changes, stop for explicit affected-path review rather than broaden this source-only scope.

### HAB-03

Accepted goal: per-change durable draft, direct-close survival, object-switch safety and no silent external overwrite. F2 per-habit/per-month remains accepted. DiaryCard.tsx onChange updates local state and calls onDraftChange; HabitsModule holds habit/month/text/baseline in a ref and flushes on habit/month/view/add/check-in navigation. usePersistedHabits compares raw baseline, retains pending/error, and rejects changed bytes. These are static current paths supported by prior bounded mounted-session acceptance, not a new durability PASS. Direct close/crash or host unmount can lose the in-memory latest draft. Current baseline compare then synchronous set is not cross-document atomicity.

Finite candidate source set: DiaryCard.tsx, HabitsModule.tsx, internal/usePersistedHabits.ts, types.ts. Fixture anchors: DiaryCard.test.tsx, saveRecovery.test.tsx, HabitsModule.persist.test.tsx, HabitsModule.views.test.tsx. Account ownership xai_habits_state is fixed (accountOwnership.ts:34). internal/accountMigration.ts currently validates canonical habits/checkIns/diaries; index.ts registers it. Any new durable key/schema requires exact ownership, lifecycle/export/deletion/migration and dependency review. Read-only shared foundations include usePref-write-results.md, the REL-03/04 persistence docs and D2 entry/async contract/acceptance status. Their availability is not automatic Habits conversion, lock admission or crash guarantee.

Future contract must specify when input becomes durably acknowledged, any bounded debounce loss window, identity across habit/month/owner/generation, pending/failure/retry/discard semantics, source-state handling, serialized conflict refusal and recovery bytes. Closing immediately after typing and before blur is a distinct fixture from blur-save; a React unmount alone is not proof of full browser/process close. Cover actual close/reopen after the defined acknowledgement, pending/fault close without false Saved, change habit/month without text reassignment, same-key external update preserving both external bytes and local text, account A→B/locked/same-account epoch, and lifecycle/export as applicable. Storage representation and debounce mechanism are contract engineering; they need scoped design/review, not a gratuitous product question. The accepted 'direct close does not lose input' cannot be weakened silently to a debounce window.

### HAB-04

Accepted goal: today/due/rest distinction, weekday/badge clarity, >=44px hit areas, future/history semantics. Current code marks today but not schedule eligibility; future in-month/weekly/All buttons remain actionable. Full producer map and CSS caveats are R3. Finite candidate source set: HabitList.tsx, HabitRow.tsx, HabitDetail.tsx, MonthCalendar.tsx, styles.css. Fixture anchors: HabitsModule.render.test.tsx, HabitsModule.views.test.tsx, MonthCalendar.test.tsx. Schedule semantics depend on HAB-01's reviewed contract; no shared global CSS/token changes are authorized.

Future acceptance: all four views, mobile/tablet/desktop EN/ZH, weekday alignment, readable badges and crowded multi-habit days, today action prominence, due/rest/past/future states, >=44px actual distinct targets and trusted hit checks, keyboard/focus/accessible labels. Native/browser screenshot plus measured geometry and visual review must be separately qualified/funded; source styles or historical recovery-row geometry are not that evidence. Keep the accepted recovery layout regression protected.

### HAB-05

Accepted goal: distinguish persisted preference, browser support, permission and acknowledged scheduling; closed-page work belongs to JOB. AddHabitDialog starts reminderEnabled=true and stores time; HabitsListView displays the preference; types.ts says scheduling belongs to future notification rows. Settings push_habit is a distinct device preference. capabilities.ts can prompt and send a one-shot Notification; its generic status('notification') returns supported without checking actual browser API/permission, so that status alone is insufficient truth. register.ts points at /sw.js; the bound actual worker handles install/activate/fetch only. This is a finite inspected-path observation, not a global absence proof.

Finite candidate source set: internal/AddHabitDialog.tsx, HabitDetail.tsx, types.ts; exact owning documentation set packages/xai-web-habits/docs/design.md, api.md, test.md, dev_log.md. Fixture anchors: AddHabitDialog.test.tsx, HabitsModule.add.test.tsx, HabitsModule.views.test.tsx. This replaces discovery's open-ended 'package docs/tests' candidate with a reviewable future set; it grants no changes. Shared Settings/host/worker/JOB remain read-only and need their own implementation gate.

Future state matrix must cover unsupported/default/denied/granted, preference-save failure/success, unavailable or unimplemented scheduling, accepted/refused/cancelled/stale schedule acknowledgement, truthful EN/ZH display and local time meaning. With no scheduler, show that fact and do not manufacture a positive scheduled state. JOB-01 defines reopen versus closed-client execution; JOB-02 durable jobs/outbox and JOB-03 permission/DND/Web Push execution remain separate gates in ALL-TODO-CURRENT.md. Their eventual true positive requires an actual qualified job service and closed-client delivery evidence. A saved preference, permission grant, one-shot notify or SW registration proves none of those. No permission prompt, service worker change, network/vendor call, sync activation or platform promise is authorized here.

## Future order, dependencies and stop conditions

1. Controller may schedule a fresh whole-source correction within the existing discovery family budget, addressing R1–R3 and all five sections; this review neither launches it nor resets an exhausted/unknown historical purpose. Preserve the original source, source process unknowns and independent failure history.
2. Fresh whole independent review of the corrected full report plus source bindings is required. Source adoption remains separate from an accepted implementation contract, source qualification, business before, implementation and final acceptance.
3. Freeze a finite five-item contract with exact file sets, fixture/oracle sources, captured dependency SHAs, qualification prerequisites and separately allocated before/implementation/verification budgets. Current future execution costs and external/core/REL histories not supplied by actual receipts remain UNKNOWN, never zero. No measurement standard is relaxed.
4. Reuse accepted local-clock and mounted-recovery rules; resolve only genuinely missing cadence policy via the controller. HAB-01 precedes HAB-04 schedule UI; HAB-02 month-follow must coordinate with HAB-03 draft identity; HAB-03 durable storage needs lifecycle/owner compatibility; HAB-05 capability text is bounded while JOB delivery remains separately gated.
5. External TT/calendar/STAT/DASH/date consumers are referenced only through the real local-time history, audit rows and typed event contract. They acquire no new qualification or closure from Habits source review. Account-local ownership does not unfreeze account cloud-sync; Web→Desktop still requires D3. Core-data is not a direct Habits dependency and no core implementation is evaluated here.
6. Stop on actual input/hash/dirty/protected drift, unauthorized execution or shared writes, genuinely undecided product behavior that prevents the next bounded step, or the sole concluding static FAIL/UNKNOWN. No retry, materialization or commit after that failure. Reviewer never repairs product or author artifacts. Other worktrees/control/canonical docs/old contracts/skills/registries stay protected.

## Binding grammar, acquisition and process limits

inputs.sha256 uses '<sha256>  <40-hex Git commit>:<repository path>' for complete Git blobs, and '<sha256>  external:<absolute path>' for the immutable external goal. It binds 161 complete input identities, including both source files at source and integration, actual parent task/control/overlay/reception metadata, all 61 original inputs, exact P0 copies of the 46 declared product paths, additionally inspected owned sources/fixtures and actual dependency/history docs. Whole bytes were acquired before any filesystem output. Large control JSON/Markdown was retained fully in memory for binding; review claims are limited to relevant scope/metadata, not a new semantic acceptance of unrelated control history. No repository parser, generator, audited runtime, business validator, old author checker or test module was imported or executed.

The original author reported 'PREWRITE_STATIC_PASS inputs=61 items=5 outputs=2' once. Original raw PID, numeric exit, session, chunk, EOF/drain, elapsed and total wall remain UNKNOWN. Preparation records list zsh unmatched quote, literal P0 revision failure and rg against absent packages/plugin-sdk. A generic 'no child' claim cannot cover executed Git/rg processes; original raw error provenance is UNKNOWN. The present review does not fabricate exits or infer an additional original checker pass/failure.

Current acquisition used read-only Git children and initial shell reads. Git process results were stored in memory before presentation and pipe-close records below establish stdout/stderr EOF. Initial exec chunks: d9b453 exit0 wall0.096480583; 9c1d8c exit0 wall0.000010625; 226d0f exit0 wall0.000010125; b6a244 exit0 wall0.000006917; d41903 memory-registry rg exit1/no matches wall0.035761833. Initial process PIDs and precise shell stdout/stderr split are UNKNOWN; initial tool output truncation was a display limitation, not a source hash mismatch. The first batched memory-rg receipt was not retained visibly and remains UNKNOWN; no memory source contributed facts. Repeated reads for visible source coverage were not tests or concluding-check retries.

One own-document concluding static invocation is permitted after both entire output buffers are frozen in memory. It independently checks every input hash/source identity, original-manifest interpretation, original five-row coverage, source/integration bytes, actual parent/clean state, allowed-output absence and output/manifest consistency. It does not execute business code or infer semantic correctness from keywords/counts. The actual result, PID, exit, full stdout/stderr drain and elapsed are retained in the tool return and final Handoff; this pre-check buffer does not preclaim that outcome. On PASS only, materialize these exact two buffers, stage exact paths and create one hooks-disabled commit using a temporary body file with real newlines. No amend, push, network or cleanup. Reviewer total wall before acquisition instrumentation is UNKNOWN; measured acquisition/finalization elapsed is reported separately, and the task's 30-minute wall/120-second static/30-second drain ceilings remain mandatory.

New audited runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/network/child-agent executions: 0. Read-only Git processes are real children and are enumerated rather than hidden under that zero. The Node host process identity is UNKNOWN. No app worktree recreation/reattachment/cleanup was attempted.

## Read-only Git acquisition receipt

Each row records actual PID, exit and EOF. stdout bytes are fully retained as bound input bytes or in-memory Git metadata; checksums below preserve the exact output representation. Stderr was captured separately. These are provenance receipts, not business results.

```json
[
  {
    "args": [
      "show",
      "7c6b867b046f82f7fa667edf187bc1cdda120ccd:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/inputs.sha256"
    ],
    "pid": 13257,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 7182,
    "stdout_sha256": "7711e4d3a24e07fb4f99bcd830ea758f8d1c4dd942a89b94a8d1e9196da9f1cd",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 60
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:AGENTS.md"
    ],
    "pid": 13269,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 13273,
    "stdout_sha256": "519c72bcbdd1018af9a369614b9db04a674bf91870d99dcca03665dabe162100",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 45
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:CLAUDE.md"
    ],
    "pid": 13281,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 22269,
    "stdout_sha256": "6597e484cb5bde938fadb3c728f2e76c6228364584306a453655eeebd1e61ffb",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 26
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/workflow/project/workflow.md"
    ],
    "pid": 13293,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 12660,
    "stdout_sha256": "99bb429d2a9facd7cebfbcb52e97c7ccea648d19953e05e10f824189f6b9f050",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 45
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/workflow/project/multi-machine-development.md"
    ],
    "pid": 13305,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6390,
    "stdout_sha256": "92572a6ea33865753d3a461d96830d38e1dbcded58e684114eab450c81ab4b59",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 43
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-r1.json"
    ],
    "pid": 13317,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 15253,
    "stdout_sha256": "d9d41f936954ad95eaffdeb9f02a499d3c4b5259dcc15b42b4e12f5d00ae7d0e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 26
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/20260908-full-product-audit/parallel-control-r1/execution-state.json"
    ],
    "pid": 13329,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 280743,
    "stdout_sha256": "50ff524adfa403b3eeadadd2b2ea3c00f0c73b8bdc79452be42cd4ffab3d0453",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 23
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md"
    ],
    "pid": 13341,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 195591,
    "stdout_sha256": "58879e83730ed2e8353dabc26e05f3351a4913e5f50d41391a1fe03550b516aa",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 19
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/20260908-full-product-audit/ALL-TODO-CURRENT.md"
    ],
    "pid": 13353,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 93710,
    "stdout_sha256": "59bf980531bfe869597aa0db9f1a7f09a850a7c9d03483e61e98f09ace1e5cf2",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/20260908-full-product-audit/02-tasks-time-boards.md"
    ],
    "pid": 13365,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 38235,
    "stdout_sha256": "7eb1df2b7173949a3171e7cbafa467839b2ae2c515c86a6850980a0b9e36c1da",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/20260908-full-product-audit/05-visual-ux-audit.md"
    ],
    "pid": 13377,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 15524,
    "stdout_sha256": "06fd804b06fa0425fe472f333e5a4f0b3e11e3cae75b9274f34eee2894488129",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 46
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/xai-web-habits/20260523-roadmap-seed.md"
    ],
    "pid": 13389,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1146,
    "stdout_sha256": "9e33923fe5699cc8c10850f3869c1007608c77d8e5661006687db6157c583520",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 20
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/xai-web-habits/20260523-discovery-review.md"
    ],
    "pid": 13401,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 39147,
    "stdout_sha256": "30fd07c6b0635ebe496c0caafd1c48b3e24d4a01f33b82597236008d87ae3bcf",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 19
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/web-date-time-recovery-contract/contract.md"
    ],
    "pid": 13413,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 16282,
    "stdout_sha256": "fb5195ba540de3fa46abacbced01a1d57c2387460f1e14812625e6abbae4e30c",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:docs/reviews/web-date-time-recovery-contract/remaining-writers.md"
    ],
    "pid": 13425,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6537,
    "stdout_sha256": "ad23909c043cc14f47578666581d14bffc2f835d2251c482dfd0829251c1358e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/package.json"
    ],
    "pid": 13437,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1377,
    "stdout_sha256": "e7a78e026e326a421084cc3425a17b5c0aa3ff4291f9aeff2bfd0ac055b7ed5e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/docs/design.md"
    ],
    "pid": 13449,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 29222,
    "stdout_sha256": "783d30f336e1615bb96c2a402b6f1aa3d1c58737a1cd2154e439f6411f3e444b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/docs/api.md"
    ],
    "pid": 13461,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 19049,
    "stdout_sha256": "d227445351ebed809dd87a8180cf47fdbe2b70d208682b5cd45ec7873b10e40e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/docs/test.md"
    ],
    "pid": 13473,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 28569,
    "stdout_sha256": "c8da8454c65df82c9b9321eed4dbc8b296fc3061c0bcba1e9b965b85f040b845",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/docs/dev_log.md"
    ],
    "pid": 13485,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 36762,
    "stdout_sha256": "dffe4c14943d71495ac18ddbc8472558551c8a0faae1ebc180b1c31fc479f725",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/HabitsModule.tsx"
    ],
    "pid": 13497,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 9739,
    "stdout_sha256": "5be9d1461daedc724ac85341a54b744db3376c5cf80a3a938f223d5fa502c45c",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/HabitList.tsx"
    ],
    "pid": 13509,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6152,
    "stdout_sha256": "7f1bdf47d5a06ed98c8c9a82ccf2679ec5f411b5c35229f96138dd99bbf07e4f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/HabitRow.tsx"
    ],
    "pid": 13521,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 3408,
    "stdout_sha256": "5402b4e79b39dce0283c0e83114a14b070b97e8e3c3162ff9568db78383fea47",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/HabitDetail.tsx"
    ],
    "pid": 13533,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 25016,
    "stdout_sha256": "69790213ec8d26ac002df28709987235084b6de980d6499ef41811fcde327338",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/DiaryCard.tsx"
    ],
    "pid": 13545,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2610,
    "stdout_sha256": "2602ef2ec6453407d70ce79b220228a8bb5dd6300e162276f3453d4db886eb74",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/MonthCalendar.tsx"
    ],
    "pid": 13557,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4676,
    "stdout_sha256": "e9683a2dc5bdcea15d952e5be8ff5615282a3b42430e9a083bc3f137240a606b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/styles.css"
    ],
    "pid": 13569,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 26995,
    "stdout_sha256": "5cc348a8bde447783d4e4c26df4e607cb8bbed229c89d537d6e7e8bfcf6cd6a5",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/types.ts"
    ],
    "pid": 13581,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 3674,
    "stdout_sha256": "086bb20c356cf8bdc326b314d0fea732e0697d7c48b6cee4cc375e49e6b05958",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/registration.tsx"
    ],
    "pid": 13593,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1372,
    "stdout_sha256": "830c62e07f7c866a43c84ceee0d399f7af0106bc1b86a778e126e6f029ca9d7b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/AddHabitDialog.tsx"
    ],
    "pid": 13605,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 10047,
    "stdout_sha256": "87316195e6b3c69ee2b168d3e713e9c47d1d5dc1ce24daa8b0364b968a6fac1f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/computeStats.ts"
    ],
    "pid": 13617,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1536,
    "stdout_sha256": "14ffea2f046e60115de100e3ddc747e1d52602eca050ef18145719e1c6e551ab",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/computeStreak.ts"
    ],
    "pid": 13629,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1324,
    "stdout_sha256": "684cd49084d8c82dfdb5e09a03f1436b628533b530eb454a9db4d69dc1fea418",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/dateKeys.ts"
    ],
    "pid": 13641,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2493,
    "stdout_sha256": "4aea06b535811f9b2306d6c2414136103a4d5994c36054af463c9316577fb131",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 19
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/habitMeta.tsx"
    ],
    "pid": 13653,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 11305,
    "stdout_sha256": "b510651524bccfd386fdb81bc56d574f45a6161ab541027d91ca77a26787dcdd",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/toggle.ts"
    ],
    "pid": 13665,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1470,
    "stdout_sha256": "caca88431eb391df5da97f944f199e85dc189680f369773693058381744881a8",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/usePersistedHabits.ts"
    ],
    "pid": 13709,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4255,
    "stdout_sha256": "d16113dac02a23f3b3228e5b47d7d5d0d48164b0ea8c61a3f00daf182bb61a57",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/seed.ts"
    ],
    "pid": 13721,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2252,
    "stdout_sha256": "50b5e26af3bc6b3f57071bc3d96156a5371f3e6f4212ab9e9284fe0b1d60c05a",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/computeStreak.test.ts"
    ],
    "pid": 13733,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2151,
    "stdout_sha256": "1aecf28874250c10fa4dc472ca1aa44e3b2da78f0f6aa19b8c385ecc4d7db43a",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/computeStats.test.ts"
    ],
    "pid": 13745,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2386,
    "stdout_sha256": "57df4ee2d2e2132b4b7225a4810449419e5ae1964961f80fe6563a60878fc814",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/dateKeys.test.ts"
    ],
    "pid": 13757,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2676,
    "stdout_sha256": "2a84ae1ffdbd84f9e49ac33802b6ec8fbfbcacd82a19956ec5112aaf52e2507d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/DiaryCard.test.tsx"
    ],
    "pid": 13769,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2843,
    "stdout_sha256": "7ab58d8c0250c456081709377ea236f65881b46193e57d9fff24ca92868a08fc",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/saveRecovery.test.tsx"
    ],
    "pid": 13781,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5840,
    "stdout_sha256": "8219f2e6da60ee0b0fa41aa24ff2b050c236f74702da4418495f5a5e93f21085",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/HabitsModule.persist.test.tsx"
    ],
    "pid": 13793,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4120,
    "stdout_sha256": "7b141c972357161f3d7bebaf5ba057c149340ff1a34b984cc3e8522837fe4e5c",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/HabitsModule.render.test.tsx"
    ],
    "pid": 13805,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5326,
    "stdout_sha256": "6eb8d6bf4e6b5e6669884de0aca18d0fc5bdb60f93a867740ac52e591a16c00e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/HabitsModule.add.test.tsx"
    ],
    "pid": 13817,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2964,
    "stdout_sha256": "220d44571370bd0d2cebb70098524059aa311c11696a7403800c69dc3755ef8d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/MonthCalendar.test.tsx"
    ],
    "pid": 13829,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5192,
    "stdout_sha256": "9854ddbcd3274a607e21aa8913a9b0e9c07de1883c23a722280e9251fca6da86",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-tokens/src/localDate.ts"
    ],
    "pid": 13841,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1073,
    "stdout_sha256": "c499e101ba384766df3939a95edce57f27862ef8fdd3553eb80a0907ed4a7264",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-tokens/src/useLocalDayClock.ts"
    ],
    "pid": 13853,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1181,
    "stdout_sha256": "3b0b9e03d361b24aa62fae17bd44bf66d92c5537155972f22324b4f8b83f9dd7",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-tokens/src/__tests__/localDate.test.tsx"
    ],
    "pid": 13865,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2901,
    "stdout_sha256": "12115368db75d0a70e7ab4cb28842c5ae7503d429e08808e4f3d4c7b45179910",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-tokens/docs/design.md"
    ],
    "pid": 13877,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1274,
    "stdout_sha256": "dc3f8a18f008382d6d1b41114964e146fbcee5655b8337cd94ea0171cf1fcd09",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-tokens/docs/api.md"
    ],
    "pid": 13889,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1271,
    "stdout_sha256": "b9dc4ffe7723ecdf11b0b1edb942406acf56a2a69eecba7aa378e05312d90e62",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-tokens/docs/test.md"
    ],
    "pid": 13901,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1272,
    "stdout_sha256": "e7b1d0bb3d302dc3ca89a2b1b561564b75ce3958f73e22ade1ef897557a56909",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-storage/src/internal/usePref.ts"
    ],
    "pid": 13913,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 8308,
    "stdout_sha256": "e1f2c9131cb9a00a2dff3951f4c95b2a7ad68692d0bf409b0ef511df137fa188",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-storage/src/internal/accountScope.ts"
    ],
    "pid": 13925,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6636,
    "stdout_sha256": "ca9d79b2188e1a2b011a4c41038019659b43e03127bc8bd876cffafe2e489e36",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-storage/src/internal/accountOwnership.ts"
    ],
    "pid": 13937,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5153,
    "stdout_sha256": "8d5b7fef04a014044b81cb95d56eaf084bfc306d7c8b9a27540b6caa3a2bef20",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-storage/docs/usePref-write-results.md"
    ],
    "pid": 13949,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1763,
    "stdout_sha256": "dcdc3da332f77ede6c1b2e9565c59563ff8f4c1fffe6284941f5ffd6f7dc79b1",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx"
    ],
    "pid": 13961,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 15724,
    "stdout_sha256": "04930bd98b4ba05346f1472cc70f849238db14ce6cb5b4d1165132719ffbc87f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:apps/web/src/host/capabilities.ts"
    ],
    "pid": 13973,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4903,
    "stdout_sha256": "8536a4f15ae016f8b395b09edf48c3256da832de76871aac9e5b6316c5c2abba",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:apps/web/src/service-worker/register.ts"
    ],
    "pid": 13985,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1028,
    "stdout_sha256": "6cd222339c98ef1a8c741685c4b3b3e8a30f1df58baef3f3de21ec259a6d520b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/plugin-console/src/components/ConsoleLayout.tsx"
    ],
    "pid": 13997,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 23706,
    "stdout_sha256": "fd628638fd31a1e964ced77dd1690a378277113c5d8c0813c56a4901fca598d0",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:apps/web/src/routes/modules/shellRegistrations.tsx"
    ],
    "pid": 14009,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 7209,
    "stdout_sha256": "c003c499ca3330ff6e3b7e738df4e3366d0daca141d65327dacc3d3665e1b8fe",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "7c6b867b046f82f7fa667edf187bc1cdda120ccd:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/discovery.md"
    ],
    "pid": 14021,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 18173,
    "stdout_sha256": "1137e2a4785ce7ab9771897751b314c424a1c2e28b3e8e11c53e1451da3ae1ce",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:AGENTS.md"
    ],
    "pid": 14036,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 13273,
    "stdout_sha256": "519c72bcbdd1018af9a369614b9db04a674bf91870d99dcca03665dabe162100",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 27
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:CLAUDE.md"
    ],
    "pid": 14048,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 22269,
    "stdout_sha256": "6597e484cb5bde938fadb3c728f2e76c6228364584306a453655eeebd1e61ffb",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 36
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/workflow/project/workflow.md"
    ],
    "pid": 14060,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 12660,
    "stdout_sha256": "99bb429d2a9facd7cebfbcb52e97c7ccea648d19953e05e10f824189f6b9f050",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 25
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/workflow/project/multi-machine-development.md"
    ],
    "pid": 14072,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6390,
    "stdout_sha256": "92572a6ea33865753d3a461d96830d38e1dbcded58e684114eab450c81ab4b59",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-review-r1.json"
    ],
    "pid": 14084,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 22416,
    "stdout_sha256": "4607760c6afaebcd387532a825460b283e29fa5c989de7be2ada9b92e3f6ffd6",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 19
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/20260908-full-product-audit/parallel-control-r1/hab-and-whole-supplement-review2-p75-reception.json"
    ],
    "pid": 14096,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 8461,
    "stdout_sha256": "fc69993b66ebec393084232fb59711b1b0397c7b001cff677bd64aaf79e121f6",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/20260908-full-product-audit/parallel-control-r1/authority-overlay.md"
    ],
    "pid": 14108,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2051,
    "stdout_sha256": "184ebab89778a4ebfd837d72bd299f882d8b121893c1b897e8ba8482c3f49583",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 28
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/20260908-full-product-audit/parallel-control-r1/execution-state.json"
    ],
    "pid": 14120,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 292916,
    "stdout_sha256": "ed9eca3c61967f06c36d461ec23b98f40066a53841240e99ce3fb1f1df48e9f6",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md"
    ],
    "pid": 14132,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 200037,
    "stdout_sha256": "fe3cbbaf7a114400f7639a24e82498f3cfcae622896f2823c7af80bf38955cdd",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "ls-tree",
      "-r",
      "--name-only",
      "255c5200969843e519dfb108f993809bc73e429f"
    ],
    "pid": 14976,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 738585,
    "stdout_sha256": "5aaf5235bcee74a4c375c4fd60fd06143bf38772a1a1ed823a7492a45c845a54",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 120
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/StatCard.tsx"
    ],
    "pid": 15467,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1301,
    "stdout_sha256": "543a5a9a02a479849023b6b2ae0ce90caebaabac54367ad90361b9d65f65d3a6",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 21
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/AddHabitDialog.test.tsx"
    ],
    "pid": 15479,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 3727,
    "stdout_sha256": "862a5f4b2496e0914b774673f7240a655d90c380b409bd6e5e18ff0111474076",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/HabitsModule.events.test.tsx"
    ],
    "pid": 15491,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5304,
    "stdout_sha256": "371a1cac4ebffede520d380b6184066c312beb70a2491298ffd3d6b73f8206b4",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/HabitsModule.i18n.test.tsx"
    ],
    "pid": 15503,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4116,
    "stdout_sha256": "72b0ac98395e4fddfb3e339f6133eab91e6a332ced08bb5e50b561fdedcd42c8",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/HabitsModule.toggle.test.tsx"
    ],
    "pid": 15515,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4977,
    "stdout_sha256": "adf09b71a07873ce134e6e1cf4353982f78217a9eadd8c501067cf27a00f295b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/HabitsModule.views.test.tsx"
    ],
    "pid": 15527,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 3976,
    "stdout_sha256": "d149e2ab69d4457098dd9b4e806ab0072a5cf19ba676c2115c361e29413ce2ec",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/StatCard.test.tsx"
    ],
    "pid": 15539,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1326,
    "stdout_sha256": "b4b9a78114c1f7e6c8f2ea01ec65f31b92e8d52cb2d94a77fa8ddb753df13b1e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/_helpers/render.tsx"
    ],
    "pid": 15551,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 765,
    "stdout_sha256": "9f63735f2e78e18a1361a224f7240fabfe5d117cc60f71d365014daa4194fd26",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/_helpers/state.ts"
    ],
    "pid": 15563,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 592,
    "stdout_sha256": "e972c05370f4009448386588101e409c1f88ea0e0b079ade0a63d65326c161b9",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/index-barrel.test.ts"
    ],
    "pid": 15575,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 636,
    "stdout_sha256": "5dea80ae3cff0886778c945097332708913df9c0726662a1b1a22832b1e758e8",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/localDate.test.ts"
    ],
    "pid": 15587,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 645,
    "stdout_sha256": "926453063353193874bb219fee57a86b5b61007764909c8a57795fdf2d4bf114",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/registration.test.tsx"
    ],
    "pid": 15599,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1259,
    "stdout_sha256": "c96edfe2ac469b1be9160fe140c2eee77eb67d2c24ea529ca7993dfb4a578afa",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/registry-presence.test.ts"
    ],
    "pid": 15611,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1090,
    "stdout_sha256": "2957ec2b5a0ee7843a573564efe05d68e537e3e0d3acb949d486f9db8750d6cc",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/setup.ts"
    ],
    "pid": 15623,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 607,
    "stdout_sha256": "ef053cd9f5b706158f5e688f12c7102584fab14af5dd825c5c12f6916264719f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/styles.css.tokens.test.ts"
    ],
    "pid": 15635,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1243,
    "stdout_sha256": "3a4ced43da639ffc4124a970593cda15328ffd9580c8a831336da9e9b37daac1",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/toggle.test.ts"
    ],
    "pid": 15647,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2576,
    "stdout_sha256": "ec991115becf3cf1a41cb774caa30ee271daeb926abbea2d5a49b80aebc7f993",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/types.test-d.ts"
    ],
    "pid": 15659,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1881,
    "stdout_sha256": "9995384ac6b3e155eb6f75b6cff215f5f97cbe96737d9ce51fcadff1d11ae2db",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/__tests__/validate.test.ts"
    ],
    "pid": 15671,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2067,
    "stdout_sha256": "67f4c3877f99a22462b15223d515ed45ecc5f7173bb22c258883787fb6e1385d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/constants.ts"
    ],
    "pid": 15683,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 415,
    "stdout_sha256": "dfb8a020a14243db945c65bbac729a7412db991330a9d8e0ab09eb48c4aa44f7",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/index.ts"
    ],
    "pid": 15695,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1101,
    "stdout_sha256": "b058f2c1635c8cc0093e0c725976df72645c9a41873b286192716150b81ce794",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/TooltipLayer.tsx"
    ],
    "pid": 15707,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4750,
    "stdout_sha256": "99ba7298cfd6ce30cd9786a917a0f453b326a92339f877fa112167e8c5675fda",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/accountMigration.ts"
    ],
    "pid": 15719,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 954,
    "stdout_sha256": "21216b988678a7b82a066e45effb85697e3b5446918098165267659d519715fc",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/createId.ts"
    ],
    "pid": 15731,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 756,
    "stdout_sha256": "d790f12de51912467d24bf3b8935bceb0128f4481e71ea3423638309fb8bbffb",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/emit.ts"
    ],
    "pid": 15743,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1008,
    "stdout_sha256": "a3120fac67c029276857a2ca883ba935a04196746bb4637630eb6d982a59a1a0",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/icons.tsx"
    ],
    "pid": 15755,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4863,
    "stdout_sha256": "1ad518e62ba165ec1c0186d9b31c2a2bfa9f14ed1222f532b54da7bffbfd556d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/monthGrid.ts"
    ],
    "pid": 15767,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1670,
    "stdout_sha256": "51896134dab536db2c15f1535df41c90538d34370f2c9e160fb145a9d760e43a",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "show",
      "80cc49185310947d94c4f8f6339479551b71b7e4:packages/xai-web-habits/src/internal/validate.ts"
    ],
    "pid": 15779,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2193,
    "stdout_sha256": "32ceb5afaa1c1e55f65e832b8568f51413e96d1a2f61b3ba2779374ff1229ccf",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-local-time-contract/20260909-bug-diagnose.md"
    ],
    "pid": 15791,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 9738,
    "stdout_sha256": "8a118f44ba3e2ab02c39f5d27b58160468c8d8f9c2d79be3879d14a9ad804157",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 24
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-local-time-contract/dev_log.md"
    ],
    "pid": 15803,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4826,
    "stdout_sha256": "e38ed4adc5a50b4a6861c2ee9552132b644707ec5cc040f46d128238483a9736",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-local-time-consumers-independent/20260909-review.md"
    ],
    "pid": 15815,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6127,
    "stdout_sha256": "7763126516e5e30b6b654319ff9ffaac66c69709164addd6bd9f005389f0c422",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-habits-save-recovery/20260909-diagnosis-and-fix.md"
    ],
    "pid": 15827,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4058,
    "stdout_sha256": "707dd86b72ce9bebaf251a83394f22cb8c7b0bf2cefca942008a5aa0e834a45e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-habits-save-independent/review.md"
    ],
    "pid": 15839,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4706,
    "stdout_sha256": "48e8076a75ea06ddd7d7a05d6a006d9373d3d9f3681ecbd97a64fdc086144d08",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:packages/xai-web-persistence-contract/docs/design.md"
    ],
    "pid": 15851,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 11694,
    "stdout_sha256": "b383850eb86e74f7de05d38d16ea8e374426db181b052fe38efd74cf958ada58",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:packages/xai-web-persistence-contract/docs/api.md"
    ],
    "pid": 15863,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 22024,
    "stdout_sha256": "e011d2c69cf7853fa39bc2265432d2f2c2c85549074f45250fd5e0b87cee0445",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:packages/xai-web-persistence-contract/docs/dev_log.md"
    ],
    "pid": 15875,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 50515,
    "stdout_sha256": "c1f8b995c1c4739611b97432dc1a453a490632659ee88906f6af578fa4c51e4d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "diff",
      "--name-status",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
      "80cc49185310947d94c4f8f6339479551b71b7e4",
      "--",
      "AGENTS.md",
      "CLAUDE.md",
      "docs/workflow/project/workflow.md",
      "docs/workflow/project/multi-machine-development.md",
      "docs/reviews/20260908-full-product-audit/parallel-control-r1/task-hab01-hab05-source-discovery-r1.json",
      "docs/reviews/20260908-full-product-audit/parallel-control-r1/execution-state.json",
      "docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md",
      "docs/reviews/20260908-full-product-audit/ALL-TODO-CURRENT.md",
      "docs/reviews/20260908-full-product-audit/02-tasks-time-boards.md",
      "docs/reviews/20260908-full-product-audit/05-visual-ux-audit.md",
      "docs/reviews/xai-web-habits/20260523-roadmap-seed.md",
      "docs/reviews/xai-web-habits/20260523-discovery-review.md",
      "docs/reviews/web-date-time-recovery-contract/contract.md",
      "docs/reviews/web-date-time-recovery-contract/remaining-writers.md",
      "packages/xai-web-habits/package.json",
      "packages/xai-web-habits/docs/design.md",
      "packages/xai-web-habits/docs/api.md",
      "packages/xai-web-habits/docs/test.md",
      "packages/xai-web-habits/docs/dev_log.md",
      "packages/xai-web-habits/src/HabitsModule.tsx",
      "packages/xai-web-habits/src/HabitList.tsx",
      "packages/xai-web-habits/src/HabitRow.tsx",
      "packages/xai-web-habits/src/HabitDetail.tsx",
      "packages/xai-web-habits/src/DiaryCard.tsx",
      "packages/xai-web-habits/src/MonthCalendar.tsx",
      "packages/xai-web-habits/src/styles.css",
      "packages/xai-web-habits/src/types.ts",
      "packages/xai-web-habits/src/registration.tsx",
      "packages/xai-web-habits/src/internal/AddHabitDialog.tsx",
      "packages/xai-web-habits/src/internal/computeStats.ts",
      "packages/xai-web-habits/src/internal/computeStreak.ts",
      "packages/xai-web-habits/src/internal/dateKeys.ts",
      "packages/xai-web-habits/src/internal/habitMeta.tsx",
      "packages/xai-web-habits/src/internal/toggle.ts",
      "packages/xai-web-habits/src/internal/usePersistedHabits.ts",
      "packages/xai-web-habits/src/internal/seed.ts",
      "packages/xai-web-habits/src/__tests__/computeStreak.test.ts",
      "packages/xai-web-habits/src/__tests__/computeStats.test.ts",
      "packages/xai-web-habits/src/__tests__/dateKeys.test.ts",
      "packages/xai-web-habits/src/__tests__/DiaryCard.test.tsx",
      "packages/xai-web-habits/src/__tests__/saveRecovery.test.tsx",
      "packages/xai-web-habits/src/__tests__/HabitsModule.persist.test.tsx",
      "packages/xai-web-habits/src/__tests__/HabitsModule.render.test.tsx",
      "packages/xai-web-habits/src/__tests__/HabitsModule.add.test.tsx",
      "packages/xai-web-habits/src/__tests__/MonthCalendar.test.tsx",
      "packages/plugin-web-tokens/src/localDate.ts",
      "packages/plugin-web-tokens/src/useLocalDayClock.ts",
      "packages/plugin-web-tokens/src/__tests__/localDate.test.tsx",
      "packages/plugin-web-tokens/docs/design.md",
      "packages/plugin-web-tokens/docs/api.md",
      "packages/plugin-web-tokens/docs/test.md",
      "packages/plugin-web-storage/src/internal/usePref.ts",
      "packages/plugin-web-storage/src/internal/accountScope.ts",
      "packages/plugin-web-storage/src/internal/accountOwnership.ts",
      "packages/plugin-web-storage/docs/usePref-write-results.md",
      "packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx",
      "apps/web/src/host/capabilities.ts",
      "apps/web/src/service-worker/register.ts",
      "packages/plugin-console/src/components/ConsoleLayout.tsx",
      "apps/web/src/routes/modules/shellRegistrations.tsx"
    ],
    "pid": 15914,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 320,
    "stdout_sha256": "0c51e40eda5ff24a7db2f2eb6358943b65c329cac9da8dafa6bf5f7545a62bea",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 22
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md"
    ],
    "pid": 20141,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 9478,
    "stdout_sha256": "a21c96eea03bd95693190cd8d0f248793ea778daf0441ed2fe8a7748f216176d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 24
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-d2-async-pref-contract/contract.md"
    ],
    "pid": 20153,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 19685,
    "stdout_sha256": "ccc57b63cd165d013ffc25011dd71cee6bfc262797e2668a36e549593eed3b7c",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:docs/reviews/web-d2-async-pref-contract/acceptance-status.md"
    ],
    "pid": 20165,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2516,
    "stdout_sha256": "9265b6f0eeb9605afaea35995c50061d803e9b1d9c76324674ec0fcd115dd65f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx"
    ],
    "pid": 20177,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2368,
    "stdout_sha256": "92551e48490317dc5af7b6034f244ec26e12118d6f86750d2a4562b274d006b9",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:packages/plugin-web-storage/src/internal/registry.ts"
    ],
    "pid": 20189,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 32284,
    "stdout_sha256": "dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "255c5200969843e519dfb108f993809bc73e429f:apps/web/public/sw.js"
    ],
    "pid": 20201,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1032,
    "stdout_sha256": "ae7bc15d75bcc603d470fc1199a71fa93a4cda448e01cacb378b08c8b3fffa6e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "ls-tree",
      "-r",
      "--name-only",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695"
    ],
    "pid": 20247,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 503017,
    "stdout_sha256": "7d0fb0c6cdddcc562acd90ebfe9855e382d137d51bed2d25c49464e010222884",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 204
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/package.json"
    ],
    "pid": 20259,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1377,
    "stdout_sha256": "e7a78e026e326a421084cc3425a17b5c0aa3ff4291f9aeff2bfd0ac055b7ed5e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/docs/design.md"
    ],
    "pid": 20271,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 29222,
    "stdout_sha256": "783d30f336e1615bb96c2a402b6f1aa3d1c58737a1cd2154e439f6411f3e444b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/docs/api.md"
    ],
    "pid": 20283,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 19049,
    "stdout_sha256": "d227445351ebed809dd87a8180cf47fdbe2b70d208682b5cd45ec7873b10e40e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/docs/test.md"
    ],
    "pid": 20295,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 28569,
    "stdout_sha256": "c8da8454c65df82c9b9321eed4dbc8b296fc3061c0bcba1e9b965b85f040b845",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 21
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/docs/dev_log.md"
    ],
    "pid": 20308,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 36762,
    "stdout_sha256": "dffe4c14943d71495ac18ddbc8472558551c8a0faae1ebc180b1c31fc479f725",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 22
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/HabitsModule.tsx"
    ],
    "pid": 20320,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 9739,
    "stdout_sha256": "5be9d1461daedc724ac85341a54b744db3376c5cf80a3a938f223d5fa502c45c",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/HabitList.tsx"
    ],
    "pid": 20332,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6152,
    "stdout_sha256": "7f1bdf47d5a06ed98c8c9a82ccf2679ec5f411b5c35229f96138dd99bbf07e4f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 46
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/HabitRow.tsx"
    ],
    "pid": 20344,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 3408,
    "stdout_sha256": "5402b4e79b39dce0283c0e83114a14b070b97e8e3c3162ff9568db78383fea47",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 28
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/HabitDetail.tsx"
    ],
    "pid": 20356,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 25016,
    "stdout_sha256": "69790213ec8d26ac002df28709987235084b6de980d6499ef41811fcde327338",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 33
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/DiaryCard.tsx"
    ],
    "pid": 20371,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2610,
    "stdout_sha256": "2602ef2ec6453407d70ce79b220228a8bb5dd6300e162276f3453d4db886eb74",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 20
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/MonthCalendar.tsx"
    ],
    "pid": 20383,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4676,
    "stdout_sha256": "e9683a2dc5bdcea15d952e5be8ff5615282a3b42430e9a083bc3f137240a606b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/styles.css"
    ],
    "pid": 20395,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 26995,
    "stdout_sha256": "5cc348a8bde447783d4e4c26df4e607cb8bbed229c89d537d6e7e8bfcf6cd6a5",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/types.ts"
    ],
    "pid": 20407,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 3674,
    "stdout_sha256": "086bb20c356cf8bdc326b314d0fea732e0697d7c48b6cee4cc375e49e6b05958",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/registration.tsx"
    ],
    "pid": 20419,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1372,
    "stdout_sha256": "830c62e07f7c866a43c84ceee0d399f7af0106bc1b86a778e126e6f029ca9d7b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/AddHabitDialog.tsx"
    ],
    "pid": 20431,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 10047,
    "stdout_sha256": "87316195e6b3c69ee2b168d3e713e9c47d1d5dc1ce24daa8b0364b968a6fac1f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/computeStats.ts"
    ],
    "pid": 20443,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1536,
    "stdout_sha256": "14ffea2f046e60115de100e3ddc747e1d52602eca050ef18145719e1c6e551ab",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 29
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/computeStreak.ts"
    ],
    "pid": 20455,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1324,
    "stdout_sha256": "684cd49084d8c82dfdb5e09a03f1436b628533b530eb454a9db4d69dc1fea418",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/dateKeys.ts"
    ],
    "pid": 20467,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2493,
    "stdout_sha256": "4aea06b535811f9b2306d6c2414136103a4d5994c36054af463c9316577fb131",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/habitMeta.tsx"
    ],
    "pid": 20479,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 11305,
    "stdout_sha256": "b510651524bccfd386fdb81bc56d574f45a6161ab541027d91ca77a26787dcdd",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/toggle.ts"
    ],
    "pid": 20491,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1470,
    "stdout_sha256": "caca88431eb391df5da97f944f199e85dc189680f369773693058381744881a8",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/usePersistedHabits.ts"
    ],
    "pid": 20503,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4255,
    "stdout_sha256": "d16113dac02a23f3b3228e5b47d7d5d0d48164b0ea8c61a3f00daf182bb61a57",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/internal/seed.ts"
    ],
    "pid": 20515,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2252,
    "stdout_sha256": "50b5e26af3bc6b3f57071bc3d96156a5371f3e6f4212ab9e9284fe0b1d60c05a",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/computeStreak.test.ts"
    ],
    "pid": 20527,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2151,
    "stdout_sha256": "1aecf28874250c10fa4dc472ca1aa44e3b2da78f0f6aa19b8c385ecc4d7db43a",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/computeStats.test.ts"
    ],
    "pid": 20539,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2386,
    "stdout_sha256": "57df4ee2d2e2132b4b7225a4810449419e5ae1964961f80fe6563a60878fc814",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/dateKeys.test.ts"
    ],
    "pid": 20551,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2676,
    "stdout_sha256": "2a84ae1ffdbd84f9e49ac33802b6ec8fbfbcacd82a19956ec5112aaf52e2507d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/DiaryCard.test.tsx"
    ],
    "pid": 20563,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2843,
    "stdout_sha256": "7ab58d8c0250c456081709377ea236f65881b46193e57d9fff24ca92868a08fc",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 18
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/saveRecovery.test.tsx"
    ],
    "pid": 20575,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5840,
    "stdout_sha256": "8219f2e6da60ee0b0fa41aa24ff2b050c236f74702da4418495f5a5e93f21085",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/HabitsModule.persist.test.tsx"
    ],
    "pid": 20587,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4120,
    "stdout_sha256": "7b141c972357161f3d7bebaf5ba057c149340ff1a34b984cc3e8522837fe4e5c",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/HabitsModule.render.test.tsx"
    ],
    "pid": 20599,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5326,
    "stdout_sha256": "6eb8d6bf4e6b5e6669884de0aca18d0fc5bdb60f93a867740ac52e591a16c00e",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/HabitsModule.add.test.tsx"
    ],
    "pid": 20611,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2964,
    "stdout_sha256": "220d44571370bd0d2cebb70098524059aa311c11696a7403800c69dc3755ef8d",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/xai-web-habits/src/__tests__/MonthCalendar.test.tsx"
    ],
    "pid": 20623,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5192,
    "stdout_sha256": "9854ddbcd3274a607e21aa8913a9b0e9c07de1883c23a722280e9251fca6da86",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-tokens/src/localDate.ts"
    ],
    "pid": 20635,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1073,
    "stdout_sha256": "c499e101ba384766df3939a95edce57f27862ef8fdd3553eb80a0907ed4a7264",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-tokens/src/useLocalDayClock.ts"
    ],
    "pid": 20647,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1181,
    "stdout_sha256": "3b0b9e03d361b24aa62fae17bd44bf66d92c5537155972f22324b4f8b83f9dd7",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-tokens/src/__tests__/localDate.test.tsx"
    ],
    "pid": 20659,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 2901,
    "stdout_sha256": "12115368db75d0a70e7ab4cb28842c5ae7503d429e08808e4f3d4c7b45179910",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-tokens/docs/design.md"
    ],
    "pid": 20671,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1274,
    "stdout_sha256": "dc3f8a18f008382d6d1b41114964e146fbcee5655b8337cd94ea0171cf1fcd09",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-tokens/docs/api.md"
    ],
    "pid": 20683,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1271,
    "stdout_sha256": "b9dc4ffe7723ecdf11b0b1edb942406acf56a2a69eecba7aa378e05312d90e62",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-tokens/docs/test.md"
    ],
    "pid": 20695,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1272,
    "stdout_sha256": "e7b1d0bb3d302dc3ca89a2b1b561564b75ce3958f73e22ade1ef897557a56909",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-storage/src/internal/usePref.ts"
    ],
    "pid": 20707,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 8308,
    "stdout_sha256": "e1f2c9131cb9a00a2dff3951f4c95b2a7ad68692d0bf409b0ef511df137fa188",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 17
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-storage/src/internal/accountScope.ts"
    ],
    "pid": 20719,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 6636,
    "stdout_sha256": "ca9d79b2188e1a2b011a4c41038019659b43e03127bc8bd876cffafe2e489e36",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-storage/src/internal/accountOwnership.ts"
    ],
    "pid": 20731,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 5153,
    "stdout_sha256": "8d5b7fef04a014044b81cb95d56eaf084bfc306d7c8b9a27540b6caa3a2bef20",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-storage/docs/usePref-write-results.md"
    ],
    "pid": 20743,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1763,
    "stdout_sha256": "dcdc3da332f77ede6c1b2e9565c59563ff8f4c1fffe6284941f5ffd6f7dc79b1",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx"
    ],
    "pid": 20755,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 15724,
    "stdout_sha256": "04930bd98b4ba05346f1472cc70f849238db14ce6cb5b4d1165132719ffbc87f",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:apps/web/src/host/capabilities.ts"
    ],
    "pid": 20767,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 4903,
    "stdout_sha256": "8536a4f15ae016f8b395b09edf48c3256da832de76871aac9e5b6316c5c2abba",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:apps/web/src/service-worker/register.ts"
    ],
    "pid": 20779,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 1028,
    "stdout_sha256": "6cd222339c98ef1a8c741685c4b3b3e8a30f1df58baef3f3de21ec259a6d520b",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:packages/plugin-console/src/components/ConsoleLayout.tsx"
    ],
    "pid": 20791,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 23706,
    "stdout_sha256": "fd628638fd31a1e964ced77dd1690a378277113c5d8c0813c56a4901fca598d0",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "show",
      "f9eb4b1f207bc4b46f547b90afc250424b3c8695:apps/web/src/routes/modules/shellRegistrations.tsx"
    ],
    "pid": 20803,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 7209,
    "stdout_sha256": "c003c499ca3330ff6e3b7e738df4e3366d0daca141d65327dacc3d3665e1b8fe",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "cat-file",
      "commit",
      "7c6b867b046f82f7fa667edf187bc1cdda120ccd"
    ],
    "pid": 20815,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 903,
    "stdout_sha256": "9fb6b84732ef3d0964f76e615959c9aa5ec779cf68cb7c8813ff1af860a044b8",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 16
  },
  {
    "args": [
      "cat-file",
      "commit",
      "f3c324179ff138c60c50e5f98c8334a48d113fa0"
    ],
    "pid": 20827,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 874,
    "stdout_sha256": "9a508b8df5afb403a194d5224327bbb77ab30684edb0a1dbd90c7ec43842cbf5",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 15
  },
  {
    "args": [
      "show",
      "f3c324179ff138c60c50e5f98c8334a48d113fa0:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/discovery.md"
    ],
    "pid": 20839,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 18173,
    "stdout_sha256": "1137e2a4785ce7ab9771897751b314c424a1c2e28b3e8e11c53e1451da3ae1ce",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 14
  },
  {
    "args": [
      "show",
      "f3c324179ff138c60c50e5f98c8334a48d113fa0:docs/reviews/audit-parallel-hab01-hab05-source-discovery-r1/inputs.sha256"
    ],
    "pid": 20851,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 7182,
    "stdout_sha256": "7711e4d3a24e07fb4f99bcd830ea758f8d1c4dd942a89b94a8d1e9196da9f1cd",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 13
  },
  {
    "args": [
      "rev-parse",
      "f3c324179ff138c60c50e5f98c8334a48d113fa0^{commit}"
    ],
    "pid": 20863,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 41,
    "stdout_sha256": "eef334bd89fb501acd663665bb7a53c575e689a3fe6dc85e0f67178031374977",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 12
  },
  {
    "args": [
      "branch",
      "--show-current"
    ],
    "pid": 21365,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 0,
    "stdout_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 40
  },
  {
    "args": [
      "status",
      "--porcelain=v1",
      "--untracked-files=all"
    ],
    "pid": 21377,
    "numeric_exit": 0,
    "signal": null,
    "stdout_bytes": 0,
    "stdout_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "stderr": "",
    "EOF": true,
    "elapsed_ms": 209
  }
]
```
