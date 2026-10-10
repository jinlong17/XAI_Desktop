# CAL-01 + CAL-02 + CAL-04 + CAL-05 source discovery 1/3

## Scope and disposition

- Workflow C; primary workflow B; module `web` (project-system task partition); fresh bounded whole Calendar discovery, iteration 1 of 3.
- Exact parent: `6715c4367799366a10a9337a863f78036ec07ed9`. Product source: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Fixed control input: `851eb216fe29e6d102cc4fb83f02c6d93aee7186`.
- The initial worktree was clean at the exact parent. Product files below were read from the fixed product commit; governance and original-source files were byte-compared to the exact parent. Complete-file SHA-256 bindings are in `inputs.sha256`.
- Result: **source discovery complete for this iteration; no implementation, before-evidence, qualification, caller acceptance, or item closure.** Current code presence is not a runtime or requirement pass. Source history is not rerun or requalified here.
- Original owners and all formal states remain unchanged: 13 completed, 3 verification-pending, 3 in-progress, 293 pending; 299 unclosed. CAL-03 recurrence policy and its history remain immutable and separate. This report covers the four distinct original items CAL-01, CAL-02, CAL-04, CAL-05.

## Input and process record

- The original goal attachment hash matches the immutable hash recorded by the overlay. The entire current control plane, task card, authority overlay, execution state, scope map, AGENTS/CLAUDE rules, workflow, multi-machine rules, and both full source Markdown files were read and hashed before writing either output.
- Product-source buffers were obtained by `git show` at the fixed product SHA, with one Python capture routine using `Popen.communicate()` to capture each actual PID, exit code, stdout/stderr byte count, and EOF before printing. All 43 Git reads exited 0, stderr was empty, and both streams reached EOF; the 44th input row is the external goal attachment whose complete bytes match the pinned SHA-256. That capture routine took 1.1 seconds wall time; no source code was run.
- Earlier bounded path-resolution/read-only inspection calls were made through the command wrapper, which did not expose their child PIDs. Their per-command PIDs are **UNKNOWN**, not zero. They performed no tests, runtime, build, lint, browser, native, server, parser, generator, qualification, probe, vendor, network, or child-agent work.
- Budgets: discovery iteration 1/3; one static/source pass; static cap 120 seconds; overall wall cap 30 minutes; process drain cap 30 seconds. Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/network/children were 0. No measured runner or qualification budget was created.

## Original item origins and source findings

### CAL-01 — local date, default date, and long-lived Today

Origin: `02-tasks-time-boards.md` Calendar row and T06/T08 (`:86-102`, `:138`); `05-visual-ux-audit.md`; original B owner and the existing F-2 decision. The acceptance is one locally defined date across the main Calendar, mini Calendar, and event-record/default-date paths, with Today remaining current after a page stays open across midnight.

At the fixed source, `CalendarModule` consumes `useLocalDayClock().dayKey`; the hook resamples around local midnight and on focus/pageshow/visibility plus clock calibration. `activeDate` is initialized from `todayKey` once, while the Today action separately resets it from the current `todayKey`. The selected historical date therefore has an intentional preservation boundary; advancing Today must not silently replace a user-selected historical date. Event creation passes the current day key when opened from Today, but the composer also has its own local-Date fallback. The legacy `plugin-calendar` mini component has a distinct `useCalendarStore` with a mount-time `Date` and a separate local-date conversion. Its relationship to the active `xai-web-calendar` surface is unresolved; do not treat the two models as already aligned.

Gaps to resolve in a contract: define the shared date-key authority for main/mini/record creation; distinguish current Today indicators and quick-create defaults from a selected historical date; cover local midnight, month/year boundaries, DST and timezone changes, focus/resume, and preserving an explicit historical selection. The existing F-2 owner decision applies; no new preference decision is requested. Shared date-hook/token ownership remains locked.

### CAL-02 — user events and Board feed across views and back to source

Origin: `02-tasks-time-boards.md` Calendar and Board feed rows (`:138-139`, `:175`); `05-visual-ux-audit.md`. Acceptance: a card visible in a month cell is also present in day detail, across relevant views, and has a usable route back to its Board source.

At the fixed source, the read-only feed adapter reads `xai_boards_v2`, skips invalid storage and archived boards/lists/cards, and projects a card to `dueDate ?? startDate` with board/list/card IDs in a source object. `CalendarModule` merges that feed into month data and supplies feed data to week/day views. Its day-overview selector merges fixtures and user events only, omitting Board feed. Year view is also composed from fixture and user-event month data. Feed events carry `source`, while the user-event UI callbacks are keyed from `_source`/`_userId`; the source locator is not itself a rendered return-to-Board action. The adapter currently chooses one date rather than projecting an entire start/due range.

Contract gaps: define one shared projected-event union and date-key query for main, mini, month, week, day, year, and day detail; make user/fixture/Board source and permissions explicit; cover missing, valid-empty, invalid, and unavailable Board data; decide range display from existing owner rules; and prove a Board card can return to its source. Board storage/date model and account/storage ownership are read-only dependencies and remain locked. No bidirectional Board write or account-sync activation is authorized.

### CAL-04 — empty versus demo, all weeks, overflow, and mobile view

Origin: `02-tasks-time-boards.md` Calendar row and design recommendations (`:138`, `:183`); `05-visual-ux-audit.md`. Acceptance: lawful empty state is distinct from demo/sample mode; every desktop week row is reachable; an existing `+N` affordance is visible and opens the hidden events; mobile prioritizes agenda/week behavior.

At the fixed source, `SAMPLE_EVENTS` are merged into Calendar views. `CalendarModule` shows the banner when there are no user events, so the predicate currently conflates “no user events” with whether samples are being shown. Month rows, cells, and event layout are implemented in the Calendar package and its stylesheet. Source inspection establishes the owners and DOM/CSS paths only; it cannot establish actual clipping, reachability, hit-target visibility, or responsive behavior.

Contract gaps: distinguish no data from sample/demo data and its entry/exit affordance; establish whether the existing banner and sample badge are the intended demo controls; verify all 5/6-row month shapes, event overflow and opening behavior, keyboard access, and mobile agenda/week at the project’s supported widths. No screenshot, browser, or geometry evidence was collected. Any layout verdict remains **UNKNOWN**.

### CAL-05 — saved reminder preference versus a scheduled system reminder

Origin: `02-tasks-time-boards.md` T06 (`:86-90`) and Calendar row (`:138`); `05-visual-ux-audit.md`. Acceptance: saving an event must not imply that a system reminder has been arranged; disclose the current capability boundary before any scheduler exists.

The event composer offers reminder presets and defaults to `none`; the Calendar event model stores the selected preset and merge/display code carries it as metadata. A fixed-tree source search for `EventReminderPreset`, `.reminder`, and `reminder:` in non-test/non-doc product files found only Calendar UI/model/pass-through uses plus unrelated pet/habit reminder concepts. No Calendar reminder scheduler or system-notification delivery consumer was found in this source search. This supports a source-level absence finding only; it does not prove runtime behavior or operating-system capability.

Contract gaps: keep saved selection, permission state, scheduling state, and delivery state distinct; truthfully represent unsupported/default, denied, granted, and unavailable cases; do not claim a positive scheduled/delivered state without a real consumer and evidence. JOB/scheduler work is a separate gate and remains unactivated. Notification preference UI is not evidence of Calendar delivery.

## Finite candidate writers and locked seams

This is an inventory for contract planning, not a write grant. The active Calendar candidate surface is `packages/xai-web-calendar/src/` (module state, toolbar, month rows/cells, year/day/week views, day overview, event composer, event-store/query helpers, date helpers, sample/banner semantics, and `styles.css`). A separate legacy candidate exists at `packages/plugin-calendar/src/` for `CalendarMini` and its independent store/date conversion; its active product relationship must be settled from the tracked host registration before anyone treats it as a required writer. The Calendar Board adapter is `packages/xai-web-calendar/src/internal/boardCalendarFeed.ts`; its read dependencies are `packages/plugin-web-board-core` Board storage/date/type owners. The Calendar event persistence adapter and validator are candidate read/write seams for CAL-05 field truth only.

Locked shared seams include `packages/plugin-web-tokens` local-date clock, `packages/plugin-web-storage` preference registry/account ownership and storage lifecycle, Board core storage/date/schema and `xai_boards_v2`, app route/module host and registration, and any notification/JOB scheduler. A future Calendar-only writer may not modify them without a separate impact review and writer grant. No native app, plugin platform, account-sync, schema, host, or JOB scope is activated.

## Future evidence needed before any fix can be reviewed

- Freeze the four business contracts against the existing task rows, owner decisions, and prior accepted REL-01/REL-05 scope. Distinguish accepted historical evidence from current-source presence; do not rerun or relabel accepted history.
- Before implementation, capture truthful failure oracles for local date rollover and record defaults; all-view Board projection and source return; empty/demo and row/overflow/mobile interaction; and reminder preference versus system delivery. Keep selected historical dates, missing/empty/invalid data, archived Board records, recurrence-family separation, and unsupported/denied notification cases in the negative controls.
- Future date regressions: local midnight, DST and timezone change, focus/pageshow/visibility recovery, month/year rollover, Today highlight/selection, mini-date selection, event default date, and preservation of a selected historical date.
- Future projection regressions: user, sample, and Board source identity in month/week/day/year/mini/day detail; due/start range boundaries; archive and invalid Board storage; visible-card/detail parity; source navigation and permission boundaries.
- Future layout regressions: all calendar row counts, event overflow/+N visibility and open action by pointer and keyboard, scroll/reachability, and mobile agenda/week at supported widths. Trust and geometry require browser evidence; source inspection cannot pass them.
- Future reminder regressions: persisted preset round-trip separately from actual schedule creation, permission denied/granted/unavailable, timezone/date changes, duplicate/retry/cancel behavior if a scheduler is separately authorized, and delivered versus merely queued UI. Until then no positive system-reminder claim.
- Whole-scope independent acceptance must check the four original B items and shared-seam impacts. Controller reconciliation and inventory refresh remain later gates; original ledger states stay unchanged until caller acceptance.

## Limitations and handoff

No product code, tests, fixtures, canonical ledger, control plane, contracts, runners, or source files were changed. No browser/native/trusted-interaction or runtime behavior was evaluated. No conclusion is made about actual active mini-calendar mounting, production scheduling, screen geometry, or complete scope beyond the fixed tracked source read. The 13/3/3/293 state remains unchanged.

Only the two card-authorized files are added. This draft requires a fresh independent whole-source review before root adoption or any follow-on contract/before/fix work.
