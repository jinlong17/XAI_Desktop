# Habits HAB-01–HAB-05 source discovery 1/3

## Fixed inputs and interpretation

- Dispatched parent: `80cc49185310947d94c4f8f6339479551b71b7e4`.
- Frozen integration input: `4f988fe610b1c002b73ec3fbd915dd80fd88edcc`.
- Product source baseline: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Product module: Web (`packages/xai-web-habits`, registered by `apps/web`). The source-only review read the exact task card, current audit control/state excerpts, the original goal, project rules, owning Habits docs, current audit source sections, the accepted REL-01 local-civil-time contract, and the storage/account ownership sources. `inputs.sha256` binds the complete bytes of each used input.
- A targeted `git diff` from product baseline through the dispatched parent over Habits, its host, the relevant token/storage/notification sources, and the named audit/owning-doc paths reports only the added Time Tracker PRD; this is a scoped source observation, not a whole-`apps/` or whole-`packages/` parity assertion. The audited Habits and relevant helper sources used below are at the pinned product baseline. The actual tree contains `packages/core-data`, but the Habits package does not import it; `packages/plugin-sdk` is absent from this product tree.
- The actual tree has the Habits source package, its `docs/design.md`, `api.md`, `test.md`, and `dev_log.md`, the May 2026 Habits seed/discovery records, and the audit source documents. No canonical `docs/product/habits/prd.md` exists in this baseline. This discovery does not create or backfill one, and it does not borrow the separate `packages/plugin-productivity` Habits implementation as Web evidence.
- Current formal states remain the five original pending items. This artifact is a candidate source map only: no item acceptance, before result, runtime qualification, implementation, or formal-state change is claimed. The old package test totals and historic audit observations are not re-labelled as current verification.

## Original scope retained

| Item | Original action | Original acceptance (preserved in full) |
|---|---|---|
| HAB-01 | 打卡、连续天、月完成率统一当地日期和应完成周期 | 频率/startDate生效；未来打卡不抬高结果；完成率不超过100%。 |
| HAB-02 | 午夜/可见性恢复后更新今日状态并保留合法空习惯库 | 长开页面今天自动变化；清空后重开不注入样例。 |
| HAB-03 | 日记按变化保存durable draft并处理切习惯/外部更新冲突 | 直接关闭不丢输入；其他tab更新不静默覆盖草稿。 |
| HAB-04 | 突出今天打卡、应完成日和休息日，整理周标题与徽章 | 圆点不挤压文字；命中区44px；未来/历史补记含义清楚。 |
| HAB-05 | 校准可保存但不执行的提醒入口 | 显示实际支持/权限/已安排状态；关页提醒建设关联JOB组。 |

## Source inventory and evidence limits

The finite owned implementation surface is `packages/xai-web-habits/src/` and its existing `src/__tests__/` files. Its declared dependencies are `@repo/core`, `@repo/plugin-web-storage`, `@repo/plugin-web-tokens`, `@repo/xai-web-event-bus`, and `@repo/xai-web-shell`; the live host import/registration is `apps/web/src/routes/modules/shellRegistrations.tsx`. The relevant shared sources were read-only: `plugin-web-tokens` local date helpers/clock, `plugin-web-storage` `usePref`/account scope/ownership, Settings Notifications, the web host notification capability, and service-worker registration. No shared source is part of the future writer surface by this discovery.

Requirement origins are the current audit's Habits rows in `02-tasks-time-boards.md` and `05-visual-ux-audit.md`, plus `docs/reviews/xai-web-habits/20260523-roadmap-seed.md`, `20260523-discovery-review.md`, and the package docs. The later accepted package design records F2 monthly diary keys; the earlier seed text says per-date. HAB-03's current wording does not reopen diary granularity, so preserve the implemented `YYYY-MM` key unless the product owner explicitly changes it. The approved REL-01 docs supersede old UTC/fixed-day assumptions: keys are device-local civil-date identities, `useLocalDayClock` refreshes on midnight/focus/pageshow/visible, and no closed-page execution is promised.

Code presence and historical documentation establish static facts only. No tests, builds, lint, browser/native runs, screenshots, server, probes, generator, vendor calls, or runtime checks were run. Existing test files below are future fixture anchors, not passing evidence.

## Per-item source findings

### HAB-01 — local day, schedule, and capped completion

**Requirement origin and current source.** The audit requires schedule-aware start dates, future exclusion, and a capped rate. `internal/dateKeys.ts` delegates date keys to the accepted `localDateKey`; `HabitList` and `HabitDetail` consume `useLocalDayClock`. `types.ts` already stores `startDate` and `frequency` (`daily`, `weekdays`, `weekends`, `weekly`), and the creation dialog collects them. `HabitRow`/`HabitDetail` render the frequency label, but check-in handlers and calendar cells do not gate on start date or due days. `computeMonthlyRate` counts all matching month keys over elapsed calendar days without excluding future keys or clamping; the year count and total count likewise count matching stored keys without a future-date filter. `computeStreak` is C1 strict calendar-day streak ending today; it does not use frequency or start date. The audit also identifies future cells as clickable. These are source observations, not a reproduced business failure.

**Whole-item gap and finite candidate paths.** A future implementation candidate is limited to `packages/xai-web-habits/src/{HabitsModule.tsx,HabitList.tsx,HabitRow.tsx,HabitDetail.tsx,MonthCalendar.tsx,types.ts,internal/dateKeys.ts,internal/computeStats.ts,internal/computeStreak.ts,internal/toggle.ts,internal/habitMeta.tsx,internal/validate.ts}` and its existing tests `computeStats.test.ts`, `computeStreak.test.ts`, `dateKeys.test.ts`, `HabitsModule.toggle.test.tsx`, `HabitsModule.views.test.tsx`, `MonthCalendar.test.tsx`. Reuse the existing local-date API/clock by import; changes to `plugin-web-tokens` or its time contract require a separate impact grant. Keep event and statistics consumers outside this item's asserted acceptance.

**Future fixture requirements; cost unknown.** Freeze cases for each existing frequency and start-date boundary, local midnight/DST boundaries, unchecked due day versus non-due day, past correction, future stored key exclusion from every affected statistic, and a completion rate capped at 100%. Exercise both pure calculations and rendered controls so date identity and button affordance agree. Exact test/runtime cost is unknown and not authorized here.

**Decision basis and stop conditions.** `weekly` currently has only a label/type, with no target weekday or times-per-week field; C1 also treats every civil day as required. Before implementation, resolve whether a weekly habit means one check per local week and how rest days affect streaks. Resolve whether future dates are disabled or separately represented as planned; the accepted minimum is that a future check-in does not inflate results. Stop if a schema/migration, cross-package date contract change, or additional product rule is required.

### HAB-02 — day rollover and a valid empty library

**Requirement origin and current source.** `HabitList` and `HabitDetail` already use `useLocalDayClock`, whose source refreshes on midnight, focus, pageshow, visible state, and periodic clock/time-zone calibration. This is an existing static path for today labels and today-dependent rendering; no integration/runtime result is claimed. `displayedMonth` is initialized once in `HabitsModule` and reset on habit selection/month navigation, so a long-lived view crossing a month boundary needs an explicit follow-today versus user-selected-history rule. More directly, `internal/usePersistedHabits.ts` seeds when `meta.isDefault || state.habits.length === 0`; a stored, intentional empty collection therefore enters the seed branch on remount. Existing persistence fixtures assert first-launch seed and do not establish preservation of a valid empty value.

**Whole-item gap and finite candidate paths.** Candidate package paths: `HabitsModule.tsx`, `HabitList.tsx`, `HabitDetail.tsx`, `internal/usePersistedHabits.ts`, and `internal/seed.ts`. Existing fixture anchors: `HabitsModule.persist.test.tsx`, `HabitsModule.render.test.tsx`, `dateKeys.test.ts`; shared clock fixtures, if needed, stay read-only in `plugin-web-tokens` unless separately granted.

**Future fixture requirements; cost unknown.** Keep first-launch absent-key seeding as a positive control; separately persist a valid empty habit list, unmount/remount, and confirm it remains empty. Exercise a long-lived page across local midnight and a visibility return, checking the current-day marker and current-day action. Cross a month boundary in follow-today mode, then navigate to a historical month and prove rollover preserves that explicit history selection, consistent with the REL-01 contract. Test setup and runtime cost are unknown and not granted here.

**Stop conditions.** Stop if the fix requires changing shared clock semantics, account ownership, persistence reset/migration, or historic-month behavior beyond the accepted REL-01 rule. Do not solve legal empty state by changing the accepted seed for a genuinely absent first-launch key.

### HAB-03 — durable diary draft and external-update conflict

**Requirement origin and current source.** Diary grain is currently per habit/per month (`MonthKey`), and committed text is written on blur. `DiaryCard` holds keystrokes in component state and invokes a draft callback; `HabitsModule` holds the draft and baseline in refs, flushes on habit/month navigation and before other actions, and uses `usePersistedHabits` to refuse changed stored bytes and expose conflict/retry/export/discard feedback. The package has a source fixture for cross-tab dirty-text preservation/conflict. This is stronger than blur-only behavior for mounted navigation, but the uncommitted text is memory-only; closing/crashing before a successful blur/flush cannot rely on an unload event to persist it. The canonical `xai_habits_state` key is account-owned in `accountOwnership.ts`; its account scope and recovery boundary must be preserved.

**Whole-item gap and finite candidate paths.** Candidate owned paths: `DiaryCard.tsx`, `HabitsModule.tsx`, `internal/usePersistedHabits.ts`, `types.ts`; existing test anchors `DiaryCard.test.tsx`, `saveRecovery.test.tsx`, `HabitsModule.persist.test.tsx`. Any new key, schema, account-ownership entry, export/deletion/migration registration, or shared storage behavior needs its own exact impact review and writer grant. The current source map does not choose a storage representation for a durable draft.

**Future fixture requirements; cost unknown.** Type text without blurring, close/unmount, remount, and recover the exact latest draft; verify switch-habit/month flush behavior and existing committed-text round trip; inject a cross-tab replacement while a local draft is dirty and prove the newer external bytes remain intact while the user's text stays recoverable and the conflict is visible. Add account A→B/locked ownership cases if the selected storage path crosses those lifecycle boundaries. Exact environment/cost is unknown and not granted here.

**Decision basis and stop conditions.** The product acceptance requires durable draft recovery and no silent conflict overwrite; it does not approve a new key/schema or lifecycle policy. Stop before implementation until the storage target and its account/export/delete/migration ownership are specified and reviewed. Stop if any external update can be silently selected over either the user's draft or the stored source.

### HAB-04 — today/due/rest affordances and hit area

**Requirement origin and current source.** The visual audit asks for aligned weekday labels, readable badges, a prominent today action, due/rest distinction, and clear future/history meaning, with a 44px hit target. Current weekly controls derive dates from local day and week start. Frequency labels exist, but the view does not distinguish due and rest days. Calendar controls expose in-month cells across past/current/future dates; future cells are not disabled. CSS has mobile 44px control overrides; the desktop `.hcell` rule is smaller (26px max width with a 30px minimum height override). Source text cannot establish whether the visual dots overlap labels or whether every rendered target achieves the requested area at every size/language.

**Whole-item gap and finite candidate paths.** Candidate paths: `HabitList.tsx`, `HabitRow.tsx`, `HabitDetail.tsx`, `MonthCalendar.tsx`, and package `styles.css`; existing fixtures `HabitsModule.render.test.tsx`, `HabitsModule.views.test.tsx`, `MonthCalendar.test.tsx`. Keep schedule logic tied to the HAB-01 accepted rule and avoid changing shared global CSS. Any new visual-runner or screenshot path must be named in a later fixed task manifest rather than guessed here.

**Future fixture requirements; cost unknown.** At narrow/mobile and desktop widths, in EN and ZH, verify weekday/column alignment, visible dot separation from text, today/due/rest/future/past states, and click targets at least 44px wherever the acceptance applies. Include keyboard operation for enabled cells and ensure non-action dates are not misleadingly announced as actionable. Native/browser screenshot and geometry budget is unknown and not granted here.

**Decision basis and stop conditions.** Preserve explicit historical correction as an allowed candidate from the audit; resolve the future-date affordance (disabled versus separately planned) alongside HAB-01 before UI design. Stop on a need for new global CSS/token rules or visual acceptance by source-only inspection.

### HAB-05 — saved reminder versus permission and scheduled job

**Requirement origin and current source.** `AddHabitDialog` saves `reminder.enabled` and a local time; `types.ts` explicitly says scheduling belongs to future notification rows, and the all-habits display shows the saved preference. Settings separately stores a global `push_habit` preference. The host capability can request browser permission and issue a one-shot `Notification`; this does not establish a persisted schedule or closed-page delivery. The web service-worker entry only registers the asset service worker. In the finite Habits/host/Settings source inventory, no habit-reminder scheduler/permission consumer was found. This is a static source finding, not a runtime or whole-repository absence proof.

**Whole-item gap and finite candidate paths.** Documentation/UI calibration can be scoped to `packages/xai-web-habits/src/internal/AddHabitDialog.tsx`, `HabitDetail.tsx`, `types.ts` and the package docs/tests. The existing external read-only evidence paths are `packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx`, `apps/web/src/host/capabilities.ts`, and `apps/web/src/service-worker/register.ts`. A closed-page reminder requires a separately owned JOB/notification capability group with its own permission, scheduling, cancellation, delivery, and recovery contract; no current job path is assumed or named here. Modifying shared notification/host/job sources requires its own impact grant.

**Future fixture requirements; cost unknown.** Distinguish persisted reminder preference from browser support, current permission, and an acknowledged scheduled job. Cover unsupported/default/denied/granted permission and schedule refusal/acceptance; never show “scheduled” on preference save or permission alone. If closed-page delivery remains a product promise, the separate JOB group must include an actual closed-page delivery fixture and its lifecycle/permission failure cases. Costs and platform support are unknown and not granted here.

**Decision basis and stop conditions.** Keep this item a truthful capability/documentation boundary until the separate JOB group is accepted. Stop before adding an execution claim, permission prompt, service-worker behavior, or job API without that contract and writer grant. Saved preferences do not imply delivery.

## Cross-item locks, future order, and acceptance boundary

- Candidate implementation ownership stays inside the existing Habits package and only the source/test paths listed per item. Shared date/time, storage, account-ownership, host notification, Settings, event, statistics, and job sources remain read-only. If a shared file must change, first obtain an exact affected-path impact review and separate writer grant; preserve account-owned `xai_habits_state` lifecycle/export semantics.
- HAB-01 schedule semantics precede HAB-04 due/rest/future UI. HAB-02 uses the existing REL-01 clock and resolves follow-today versus explicitly selected history. HAB-03 storage ownership is a prerequisite to choosing a durable-draft implementation. HAB-05 UI claims depend on the separately accepted JOB capability if delivery is promised.
- Future independent verification, affected regressions, native/browser evidence, full five-item acceptance, formal ledger reconciliation, and inventory/ancestry checks retain their own gates and unknown costs. This discovery grants none of those actions and does not refresh/reset another caller's budgets.
- Stop on dirty/hash/protected-path drift, any source mismatch, an undecided product rule outside the minimal decision basis above, need for unauthorized shared writes or execution, or a failed pre-write static check. Do not retry a failed checker, materialize after its failure, or infer zero/unknown from absent history.

## Handoff state

`HAB-01` through `HAB-05` remain formally pending. The present result is one source-only discovery candidate in iteration 1/3; no runtime, test, browser, native, server, qualification, or business acceptance was performed. A fresh whole-scope review is required before adoption or implementation planning.
