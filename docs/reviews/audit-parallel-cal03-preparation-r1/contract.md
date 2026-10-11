# CAL-03 full original-obligation preparation r1

**PROPOSED / UNADOPTED / NEEDS FRESH FULL CONTRACT REVIEW.** Module web, workflow C, sole A-Codex root. Fresh preparer /root/parallel_c_cal03_prepare_r1; requested Astra role is not provider attestation or actual cross-vendor evidence. This packet is a complete source-grounded preparation, not an implementation, owner decision, qualified method, current production result or caller acceptance.

## 1. Fixed authority and unchanged original goal

Direct parent P = 7b890e0f027c5a1d258954bfc002731b23950c15; fixed input I = ead710ffa47c45f6d5e0ce3bad3c7fcdb4ff9473; original scope O = e041c2bc293b70db367444c62c4300231976dbf7; immutable runtime P0 = f9eb4b1f207bc4b46f547b90afc250424b3c8695. Sole writable checkout: /Users/lijinlong/.codex/worktrees/audit-parallel-cal03-preparation-20261010/XAI_Desktop. Exact card: docs/reviews/20260908-full-product-audit/parallel-control-r1/task-cal03-preparation-r1.json. Only this file and inputs.sha256 may be added. No other worktree writes, product/test/runner/config/CSS edits, global-control/ledger/inventory writes, children, push, merge/rebase, promotion, deployment, release or D3.

Original CAL-03 action verbatim: **补重复事件本次/此后/全部编辑语义、例外与跨日范围**.

Original acceptance verbatim: **重复编辑前给范围选择；daily/weekly及时区边界不误改其他发生项**.

P2 / 决策 / web / 当前范围 / pending. Sources: 02-tasks-time-boards.md;05-visual-ux-audit.md. Exact full original_item is reproduced in Appendix B. Empty item evidence[] is not zero historical executions. All 312 original fields/order and unique A29/B117/C126/D40 attribution, all 118 gated rows, 39 reversible labels, current 939 references (933 original plus six accepted TT-08 references), formal 13 completed / 3 verification_pending / 3 in_progress / 293 pending and 299 unclosed remain unchanged. Appendix C preserves full ordered original rows plus current execution records, not a sampled subset. The ranked inventory is static discovery only.

Read AGENTS.md, CLAUDE.md, shared workflow/multi-machine rules and immutable original goal attachment 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. Authority overlay changes parallel scheduling only. Worker no-push/no-runtime bounds govern; root owns remote preservation, serial receipt, ancestry and sync. P0→P under apps/packages contains exactly the four accepted plugin-web-time-tracker/docs/api.md, design.md, dev_log.md, test.md changes. Runtime remains P0; the entire package tree is NOT claimed unchanged.

## 2. Existing owner decisions before any new question

| Owning source | Established rule / limit |
| --- | --- |
| Calendar event-create operator brief §3, design §16.1–16.3, discovery Q2/Q3 | One local-clock series record; daily/weekly; no monthly/yearly/until/interval/byWeekday/exceptions; same-day events with >=5-minute wall-clock duration; external calendar/import/export and timezone-aware events excluded in that extension. |
| Calendar test.md AC-RECUR-6/7 | Edit of recurring event changes all rendered instances; deletion removes all instances. This whole-series behavior has explicit historical owner tests, not merely implementation precedent. |
| Calendar design §16.2 and test AC-DIALOG/EDIT | Native dialog, prefilled event; explicit Cancel/Escape/backdrop discards; sample records read-only. Later save-recovery contract supersedes unconditional close-on-save/delete with result-aware retention. |
| Calendar four docs REL-01 amendment + accepted local-time evidence | Browser/device zone; xai_pref_dt_timezone is display boolean, not IANA selection. Civil keys never shift; absolute timestamps retain instants. Natural day uses next local midnight (23/24/25/fractional hours). Floating ambiguous HH:MM chooses earlier fall-back occurrence. Historical navigation remains selected as today advances. |
| D1 ordinary-writer contract + bounded Calendar reviews | Canonical serialized writes preserve receipts; capture expected entity inside lock, reject newer target, retain latest draft/error; old pending completion must not close a new editor. Production activation remains closed pending separate rollout gate. |
| Original CAL-03 | Later audit requires explicit current / this-and-following / all editing semantics, exceptions and cross-day scope. Historical all-only tests do not discharge this newer full obligation. |

**Resolved without asking:** retain browser-local floating time and same-day rejection; do not invent IANA/fold storage, cross-day support, monthly/yearly rules, reminders, cloud-sync, external imports or a new global date owner. Actual allDay/tag/notes/reminder fields exist beyond the old brief; their presence is not an exception-series or reminder-delivery grant. Preserve them in compatibility and isolation checks.

**Unresolved owner delta, draft only:** current and following edits need exceptions/end boundaries absent from the previously accepted model. Neither original audit nor located owning design defines what happens to already moved/edited/deleted exceptions when all/following changes the recurrence anchor, time or frequency. An unreviewed implementation default could rewrite unintended occurrences.

Minimum question proposed for fresh independent review (not sent to the human; no answer assumed):

> 为完成 CAL-03，是否确认把既有“整组修改/删除”扩展为“本次 / 本次及以后 / 全部”，仍沿用设备当地时间与禁止跨日？在“此后/全部”修改日期、时刻或 daily/weekly 规则时，已有单次修改/删除应保留原发生项归属，还是由用户明确确认后按新规则重置？

The reviewer must first check for a later accepted owner decision. If located, use it and remove the redundant question in a new authorized revision. Otherwise root asks only the unresolved exception/rebase policy and explicit extension boundary. Cross-day remains a documented rejection boundary unless separately authorized; no repeated question about an already settled timezone policy. No default option is silently adopted. “All only” or disabling the other choices cannot be called full CAL-03 completion. Technical choice of exdates/overrides/series split layout, revision and IDs follows the chosen product semantics and independent impact review; it is not delegated to the user as schema design.

## 3. Actual writer → reader → consumer graph

Runtime/owning docs: packages/xai-web-calendar (public package @repo/plugin-web-calendar). Public index registers migration validation and CSS, exports recurrence/CRUD/hook/composer; registration reads shell language and routes /app/calendar and wildcard children. Production AppInner mounts both AI Calendar subscribers even while Calendar UI is absent. AppProviders/account gate/router/startup and full CSS must remain part of native host evidence.

| Source / role | Current trace and missing proof |
| --- | --- |
| CalendarModule | Loads xai_calendar_events through useUserCalEvents; keeps activeDate, view, overview and composer. handleUserEventClick receives userId only, calls getById, opens master anchor. Month/Week/Day, Year overflow and DayOverview clicks share that path. No selected occurrence date enters composer identity. |
| expandRecurrence | Pure window expansion, UTC-noon date carriers, +1/+7 civil dates, preserves HH:MM and master id, inclusive bounds, hard cap366. No exdates, overrides, until/split, occurrence revision or independent instance ID. Regex/date normalization is weaker than domain validation; unknown kind returns[], which is not proof invalid raw is safe to display. |
| mergeEventsForViewport | Projects instances to _userId master only, title/color/time/allDay/tag/reminder/notes; date survives in bucket, not callback identity. User rows iterate Object.values; a comment cites listEvents ordering but this function does not use that sorter. Do not promote incidental insertion order into accepted chronological-list semantics. |
| Composer | Prefills anchor date, captures owner and session, produces entire event proposal; Save/Delete have no scope selection. Same-day form/allDay00:00–23:59; pending prevents repeated action, latest form exported on failure. Scope must be chosen before any persistent mutation, including Retry; canceling scope choice must preserve source and not invent a commit. |
| useUserCalEvents | Captures accountScope once; canonical mutation validates full current and proposed store; creates random ID before queued commit; update/remove compare expected entity within mutation; scope/isReady plus storage writer guards. Pure helpers are not independent persistence routes. |
| Canonical store | xai_calendar_events envelope schema1: dataset revision, data and durable receipts. Shared account-lifecycle lock then named dataset lock; current scope/generation/tombstone checked inside and before commit; expectedRevision exists but Calendar uses per-entity expected JSON instead. No series-level incarnation field or split transaction yet. Receipt-only revision need not conflict when expected entity unchanged; concurrent delete/recreate with identical data still needs source-identity analysis for new semantics. |
| AI create/update/delete | Always-on executeToolWrite + commitCanonicalCommand, requestId/signature receipts. Create is nonrecurring; update patches master by id, date/start/duration/title; delete removes master. No occurrence/scope payload/confirmation exists. A UI-only selector would leave this alternate writer inconsistent. Freeze AI behavior and explicit series confirmation contract before allowing recurring mutations through it; separate event-bus/tool confirmation changes require exact reviewed scope. |
| Year/Month/Week/Day + DayOverview | Actual recurrence readers. Year date→overview/month and overview event selection must retain occurrence identity; date navigation is not an event edit or recurrence rewrite. No separate Calendar “list route” exists; DayOverview list and hook list are actual list surfaces. |
| Dashboard | MiniCal monthDots and Upcoming upcomingEvents independently expand daily/weekly. Their minimal validators and projection omit exception/split semantics. Upcoming ID is masterId + startISO, not a durable occurrence identity. Current index publicly exports expandRecurrence despite stale reader comments claiming unimportable internals; public reuse would require dependency/impact review, not unauthorized consolidation. |
| Board feed / sample | Read-only generated source, distinct _source. Month/Week/Day Board projection reads xai_boards_v2; never write Board data or attach Calendar exceptions to it. Sample remains read-only. |
| CmdK | readModuleStates.calendar={} at P0. Actual navigation may reach Calendar/date; there is no committed-event recurrence index to claim consistent or to add silently. |
| Migration/export/delete | Public index migration validator, shared account legacy adoption/rollback/current-generation export/tombstone deletion are legitimate additional producers/removers. They must preserve any adopted future series/exception identities atomically with account generation and receipts; no raw bypass or generic importer invented. |

**Production activation is a genuine prerequisite.** canonicalCommandState.ts initializes commandActivation=false; mutateCanonicalDataset and commitCanonicalCommand refuse before locks. No App startup activation call was found. Existing Calendar setup enables a test API; historical fixture success is not shipping activation evidence. A queued-lock oracle must prove an actual product request reached pending acquisition; a gate-off refusal cannot be relabelled successful concurrency coverage. Any qualification-only test activation must be explicitly reviewed and disclosed, never alter unchanged P0 production expectations. Shared native-host/focus proposal and BRD writer/lifecycle impact are UNADOPTED at this fixed source; the BRD impact records FAILED static, and none grants CAL-03 source, schema or runtime admission.

## 4. Full scope semantics to freeze after owner review

The following are obligation constraints, not adopted algorithms. An unresolved cell blocks its dependent implementation and acceptance, not unrelated preparation.

| Scope / boundary | Required full contract, source baseline and unresolved point |
| --- | --- |
| This occurrence edit | Selection identifies the original occurrence, including after an earlier move; only that occurrence changes. Previous/following, other series and account bytes remain stable. Date/time changes must not duplicate old occurrence or collide silently. Current source cannot encode it; exdate+override versus equivalent representation is a technical choice after review. |
| This occurrence delete | Only selected occurrence excluded; reload and forward/back navigation do not resurrect it. Undo/restore behavior must follow existing or explicitly adopted rule; no new undo promise here. Tombstone ownership ties to original series/incarnation and occurrence, not rendered position. |
| This and following edit | Inclusive original-occurrence boundary; earlier occurrences/earlier exceptions preserved. Define future series split/cutoff, transformed anchor/frequency, moved exceptions whose displayed date lies across boundary, stable identity and recurrence stop behavior. Exception rebase/reset policy awaits owner decision; no timestamp-relative “future from now” shortcut. |
| This and following delete | Selected original occurrence and later lineage disappear, earlier lineage persists. Split/stop must be atomic within canonical dataset, not delete old then create new with a partial failure window. |
| All edit | Explicit pre-mutation whole-series choice, including edits initiated from a later occurrence. Distinguish changing fields from shifting anchor/date/frequency and converting recurrence to none. Preserve existing exceptions or reset only under reviewed owner policy. Never treat selected occurrence's date as new anchor accidentally. |
| All delete | Explicit series-wide intent; remove series and its owned exceptions/splits as defined by adopted lineage. Do not delete independent other series or re-created same-ID incarnation. “All” across a previously split family versus only selected resulting series must be made explicit in reviewed identity contract, not inferred from a title. |
| No recurrence | Existing single-event semantics remain; no irrelevant scope prompt; toggling daily/weekly/none while editing a recurring event cannot bypass scope/exception decisions. |
| Daily/weekly expansion | Anchor-inclusive, no pre-anchor occurrences, stable HH:MM; inclusive displayed windows and bounded366 protection, leap/month/year/weekStart0/1, navigation backwards/forwards and windows after many skipped periods. Exceptions must not hide unrelated dates or silently fill a missing occurrence from defaults. |
| Timezone / DST | Use established browser-local civil keys. UTC, Los_Angeles, Shanghai, Lord_Howe, spring gap/fall fold/fractional DST and live zone/system-clock change. Preserve stored civil identity, use earlier fold rendering per REL-01; no absolute timezone conversion from Clock preference. Nonexistent gap HH:MM is currently accepted as floating text and layout-projected; this is not an owner promise of instant scheduling. Any newly required gap remapping needs exact review, not silent normalization. |
| Cross-day | Current owner forbids spans across dates and validates >=5min same-day. Test23:50–23:55 valid, end<=start/overnight/next-date invalid, allDay00:00–23:59 distinct. Multi-day malformed legacy records cannot be truncated, split or rewritten into apparent valid events on read. If owner requests true cross-day support, separate exact delta is required; this packet retains the original cross-day obligation through explicit supported/rejected boundaries. |
| Revision/incarnation | Carry chosen occurrence identity and captured entity/series version through scope dialog/save/Retry/late completion. Newer target, delete/recreate, split supersession and same-ID replacement must reject/resolve explicitly. Keep current receipt-only revision allowance where unchanged entity remains legitimate. Canonical dataset revision is not automatically a per-series incarnation. |
| List/navigation/reopen | Date overview, all real views, deep link and Today preserve selected identity; changing view/weekStart/today/Clock prefs cannot mutate event data. New-document reload and browser-process reopen reconstruct same adopted recurrence graph; no in-memory-only exception claim. |

No need to ask whether to preserve other occurrences, show scope before mutation, retain daily/weekly, or keep data isolated: those are already the original acceptance and established contracts. Only unsupported exception/lineage policy goes through the draft owner question.

## 5. Account, failure, export/import and lifecycle obligations

1. AccountDataGate keys business subtree by kind/accountId/generation/epoch. Cover actual A→locked→B→A, same account replacement generation, signout and deletion tombstone. Record first committed/visible frames, not merely final remount. Old scope dialogs, saved draft/export and queued operations cannot publish A into B or a replacement A. Browser Clock and business account generation are separate identities.
2. Real pending canonical save/delete/split must be causally held behind actual native Web Locks, then exposed to external valid target edit, receipt-only revision, invalid source, migration/rollback/deletion/account replacement. On release, join that exact request through settlement and publication. No synthetic stale coordinates or a held fixture lock with no product request. Current Module guards closing by composer object, deletion additionally checks Composer session; save continuation unconditionally setActiveDate and saveFailure/finally state can still touch a newer interaction. Record as source hypothesis requiring qualified before, not a newly reproduced failure.
3. Source availability: current usePref/getPref can return defaults for absent/denied/corrupt/unsupported raw; useUserCalEvents casts and lists them. Valid absent/{} differs from unavailable, malformed JSON/null/array/mixed records, invalid recurrence/time, unsupported envelope and locked scope. A source error cannot become “no events”, sample replacement, a writable empty series, success or data deletion. Read-only availability must be coherent with owner/generation and acquired before presenting edit scope. Shared usePrefAsync or DASH availability proposal is not an adopted Calendar fix. Separately reviewed finite read-only adapter/public API impact is required if existing result-bearing snapshot cannot satisfy UI truth without changing protected shared behavior.
4. Fail quota/read-denial/lock unavailable/activation-disabled/conflict/missing target/recovery-required before mutation or preserve exact committed bytes after a refused operation. Latest draft and selected scope remain truthful; Retry rereads owner and captured target; no duplicate split, orphan exception or changing occurrence target mid-retry. Cancel/Escape/backdrop retain current deliberate discard contract; do not promise durable draft or a new departure coordinator without scope review.
5. Real current draft export is calendar-unsaved-draft.json: version1, kind, operation, eventId, current form. It has no selected occurrence/scope/series revision fields because those do not exist. Future reviewed export must unambiguously carry enough chosen intent for human recovery, without claiming automatic restore/import. Export checks owner once before Blob/URL/anchor; mid-URL owner switch and cleanup require proof; no successful download claim from link.click alone or grant to release pending operation. Catch Blob/createObjectURL/click failures and source denial; verify actual downloaded bytes and no B leak.
6. Shared account export exports captured current generation raw records and a manifest with restoreSupported=false. Device recovery/legacy archives are distinct. Account deletion erases captured account namespaces under tombstone/lifecycle rules; never all accounts or device keys. Legacy adoption and rollback preserve original/archive bytes and committed generation markers. No Calendar user-facing general import/export currently exists; draft export and AccountDataGate migration are actual reachable routes. Do not invent ICS, external calendar connector or generic JSON import. If schema changes, validators/old clients/archive rollback/export/import all require independent exact impact before mutation authorization.
7. Canonical AI replay must preserve later human scope edits and not recreate deleted occurrences or overwrite split lineage from an old requestId. Input type/date/same-day limits remain. Existing receipts carry master target IDs; new recurrence semantics cannot silently reinterpret old signatures. All producers—not just human composer—must agree on schema and lineage; old-client quiescence/activation belongs to its current owner and cannot be bypassed by this preparation.

## 6. Finite conditional paths and protected semantic resources

Current product write grant **empty**. After owner semantics, impact, independent contract review, source qualification and valid before, root may register exact paths from the following finite candidate set. This is an impact map, not permission. No wildcard allows adding new files. Any needed path absent here requires separate exact reviewed amendment.

Calendar candidate paths (all under packages/xai-web-calendar/):
- src/CalendarModule.tsx; src/EventComposer.tsx; src/internal/strings.ts; src/styles.css: pre-mutation scope UI, bilingual/accessibility and result-aware occurrence intent only.
- src/internal/eventStore/types.ts; src/internal/eventStore/eventStore.ts; src/internal/eventStore/expandRecurrence.ts; src/internal/eventStore/useUserCalEvents.ts; src/internal/eventStore/mergeEventsForViewport.ts; src/internal/eventStore/validators.ts: adopted series/exception/identity model and atomic scoped transformation, bounded projection and validation.
- src/MonthCell.tsx; src/MonthGrid.tsx; src/MonthRow.tsx; src/YearView.tsx; src/DayOverview.tsx; src/WeekView.tsx; src/DayView.tsx; src/TimeGrid.tsx; src/TimeGridDayColumn.tsx; src/TimeGridAllDayStrip.tsx; src/EventBlock.tsx: selected occurrence context from real event entry to composer; preserve read-only sample/Board provenance.
- src/internal/aiCommandDomain.ts; src/internal/aiCreateSubscriber.ts; src/internal/aiMutateSubscriber.ts; src/internal/accountMigration.ts; src/index.ts: reviewed compatible producer/validator/public surface implications only; activation remains protected.
- src/__tests__/eventStore.test.ts; src/__tests__/expandRecurrence.test.ts; src/__tests__/useUserCalEvents.test.tsx; src/__tests__/EventComposer.test.tsx; src/__tests__/CalendarModule.recurrence.test.tsx; src/__tests__/CalendarModule.dst-recurrence.test.tsx; src/__tests__/CalendarModule.eventcrud.test.tsx; src/__tests__/CalendarModule.saveRecovery.test.tsx; src/__tests__/YearView.test.tsx; src/__tests__/mergeEventsForViewport.test.ts; src/__tests__/canonicalMigrationCompatibility.test.ts; src/__tests__/aiMutateSubscriber.test.tsx; src/__tests__/aiCalendarInputValidation.test.tsx: original assertions retained and reviewed additions only.
- docs/design.md; docs/api.md; docs/test.md; docs/dev_log.md: append accepted semantics, exact traceability and truthful gate state.

Shared/cross-caller conditional impact paths are finite but **separately blocked for impact approval**: packages/xai-web-dashboard-widgets/src/internal/dataReads/calUpcoming.ts, calMonthDots.ts, isUserCalEventMap.ts and their __tests__/calUpcoming.test.ts, calMonthDots.test.ts; packages/xai-web-event-bus/src/events.ts; packages/plugin-web-ai-chat/src/internal/toolRegistry.ts. Schema/AI tool change may require another exact owning path after discovery, never expand from this sentence. Public recurrence sharing must use barrel exports and separately reviewed package dependency changes.

Protected by default: all shared tokens/localDate/useLocalDayClock/timeGrid semantics; plugin-web-storage registry/canonicalCommandState/account lifecycle/activation; App/providers/auth/device/Topbar/rail/appearance/settings/departure engine; Board writers/import/export; CmdK; Clock/WorldClocks; CSS outside Calendar; package.json/lockfile/config; original tests, runners, failures and receipts. Required shared schema/storage/public AI changes must have fresh exact source impact and scope adoption before editing. The absence of permission does not make their required acceptance rows disappear.

Semantic locks: calendar-date = REL-01/CAL-01/02/03/DASH-09/12/SET-08/10. Proposed schema, AI or lifecycle work also intersects shared-persistence/account-lifecycle; root must serialize exact conflicting resources even across worktrees. Controller-receipt lock remains root-only. CAL-01/02 decisions, reminders/JOB and unrelated audit items retain their own attribution.

## 7. Complete original business oracle matrix

Each row must carry before / fixed / exact historic reuse / blocked, full source+runner+artifact hashes, actual producer and independent verdict. No N/A without source proof and fresh reviewer agreement; unresolved rows block full CAL-03 acceptance.

| ID | Required oracle |
| --- | --- |
| C03-01 | Real App EN/ZH: every recurring edit/delete entry identifies selected original occurrence and offers 本次 / 本次及以后 / 全部 before any mutation. Cancel/Escape/backdrop/close choice writes0; nonrecurring path retained; Retry cannot bypass intent. P0 absence is a source hypothesis until correct qualified before failure. |
| C03-02 | Daily and weekly “this” edit/delete on anchor/middle/later occurrence; compare complete before/after materialized graph and raw source, exactly intended occurrence affected; independent other series/earlier/later sentinels unchanged. Reload, reverse navigation, moves and repeated edit preserve original identity. |
| C03-03 | Daily/weekly following edit/delete inclusive original boundary across week/month/year/leap/DST; earlier lineage unchanged; atomic split/cutoff no gap/duplication/orphan, no partial commit on quota. Display-date moved exceptions obey reviewed original-identity partition policy. |
| C03-04 | All edit/delete at anchor and later entry, title/time/date/frequency/none changes, existing overrides/exdates and prior split lineage; full reviewed exception policy and explicit affected scope; no accidental anchor shift or unrelated deletion. |
| C03-05 | Daily/weekly render window bounds, cap366, long-lived fast forward, no pre-anchor occurrence, leap/low-year/impossible dates, weekStart0/1 and navigation list/Year/Month/Week/Day/DayOverview/deep link. Samples and Board rows remain read-only; no write from render. |
| C03-06 | UTC/Los_Angeles/Shanghai/Lord_Howe, spring gap/fall fold/fractional DST, before/after local midnight and browser zone/clock change, hidden→visible/focus/pageshow. Stored civil keys/HH:MM unchanged, earlier fold per REL-01, historical activeDate retained, Clock settings no event mutation. Gap policy limitation explicit. |
| C03-07 | Same-day >=5m,23:50–23:55 valid; overnight/end<=start/next-date rejected without mutation; allDay00:00–23:59 and recurrence; malformed legacy cross-day raw retained without silent truncation or invented support. |
| C03-08 | Quota/read denial/missing locks/activation-disabled/corrupt or unsupported source/valid-empty source; truthful availability and draft/error. Latest Retry + stable occurrence/split identity, no duplicate entities/receipts, no empty fallback writes or false saved claim. |
| C03-09 | Real public managed host A→locked→B→A, generation replacement/tombstone/signout, transition first committed frame; queued edit/delete/split released after transition, stale Retry/export and late completion. Preserve unrelated B and replacement A bytes/UI. Capture actual request before declaring queue evidence. |
| C03-10 | Cross-tab same-series and unrelated-series changes, old editor vs newer target, delete/recreate same ID, receipt-only revision, AI request replay after human scoped edit and concurrent account migration/rollback. Prove exact current owner/revision/incarnation under lock and no lost update, not only pre-await snapshots. |
| C03-11 | Actual draft download current fields+selected intent (after authorized change); failure/cancel/setup error and owner change during URL/download, export does not save/release pending mutation. Separate account export manifest/raw graph and restoreSupported=false, no automatic import claim. |
| C03-12 | Legacy plain records/canonical envelope/receipts/optional allDay-tag-notes-reminder, adopted schema compatibility, explicit legacy import/rollback/deletion/tombstone, old-client policy. Unknown schema preserved. No broad migration or cloud-sync grant. |
| C03-13 | All writer/consumer agreement: UI, always-on AI with explicit applicable scope, Dashboard upcoming/dots, samples/Board, route/deep-link/CmdK navigation. No exception reappearance in secondary readers; no invented CmdK event index. |
| C03-14 | New-document reload with new loader+document+ready identity, separate browser-process close/reopen and normal route remount. Durable committed exceptions/splits survive; unsaved draft loss remains explicit current behavior, no background/reminder execution claim. |
| C03-15 | Production CSS EN/ZH375/414/768/1024/1440 with recorded heights, light/dark/200% native zoom, chosen scope/error/draft/overflow/all views, pet-hidden setup at wide then resize/assert, pet-on changed controls and shell overlays. Actual inspected screenshots,44×44 new targets, no clipping/occlusion/overflow. |
| C03-16 | Trusted native Tab/ShiftTab/Enter/Space once/Escape, dialog/scope focus trap/return; hash-bound qualified per-stop pixelFocusWalk themes/states, pipe and passive key audit/no nativeVirtualKeyCode. No DOM click or fake focus certificate substitute. |
| C03-17 | Complete unchanged-oracle affected Calendar/storage/Web/Dashboard/AI/CmdK suites and full canonical r2 §14 E1–E25/E24/rules below; all original+judging copies and predicted failures retained; actual invocation census/cap admission before each needed new run. |
| C03-18 | Actual distinct-vendor complete review, fresh non-author Astra full original acceptance, sole-root append-only evidence reconciliation preserving states/fields/939 historical references, fresh inventory and source/integration remote ancestry/sync receipt. |

## 8. Gates, source admission and no evidence substitution

G0 fresh independent full preparation review (including minimum question necessity). G1 accepted owner amendment if needed, then finite schema/all-writer/lifecycle/availability/AI/reader impact, fresh review and root exact adoption. G2 separate complete source-only runner/oracle/fixture proposal plus independent review. G3 actual qualification and fresh independent qualification acceptance, permanent-unit budget admission. G4 full correct P0 before. G5 fresh implementation within exact adopted paths. G6 independent fixed/affected/native/account/disk/visual/keyboard proof with unchanged oracles. G7 actual vendor. G8 fresh full Astra acceptance. G9 root reconciliation/inventory/remote receipt. A source PASS skips none.

New machinery must freeze requested/resolved SHA, streamed immutable git archive, lockfile df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9, actual package exports/@repo archive guards, own-worktree server and read-only dependency root. Reserve unique outputs before launch; preserve stdout/stderr, code/signal, startup/refusal/calibration and actual launch identity. Native: CDP pipe, trusted input, passive key audit, no nativeVirtualKeyCode; full AppProviders/real managed coordinator/account gate/startup effects, not a fake gate or naked component. Complete outer supervision from bootstrap through capture and durable quiescent terminal, bounded children/profile/archive/build/CDP/exit/pipe/drain cleanup. Deadline/Promise.race is not cancellation; never terminate unrelated processes.

Source availability, production activation, exhausted Clock method units and unknown histories block only their dependent invocations. Preparation may continue; full acceptance remains blocked while required evidence is absent. Neither unadopted shared-host successor nor BRD capsule/migration proposal grants a Calendar method/schema. Separate independently reviewed equally strong method is possible only through exact authorization, full qualification and root adoption; no weaker standard or renamed fourth run.

## 9. Full inherited G1 and permanent execution history

Canonical Clock r2 source8bf613962517ee9b80bf51373e8ad88960c570cc, contract SHA-256214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. Appendix A is entire §14 verbatim including E1–E25, every E24 subrow and Rules. It remains a complete dependency, not permission to execute Clock here. Root maps every row to exact accepted applicable history, separately authorized affected run, or blocked dependency. Missing early evidence is never replaced by later or partial green.

Preserve C-FB00210/10, OE26/26, C-RD1 15/15 judging; original Features13/15, C-FD1 14/15 observed-only, Appearance24/26 cases006/007. Original12 F1 plus Appearance K-1selfcheck135/appearance123 and railselfcheck165/rail104 =16; Clockc1–c5 additional. Full Header host/native18/Astra/Sol, AppRail8 modes+host, complete accepted-caller/settings/package regressions and capacity refusals/copies remain as Appendix A and frozen receipt.

Clock inherited costs: B70 native12/6432, native development40/4884, visual3/3 exhausted, focusEN2/ZH2; F1formal2/180 and development3/302. Q1focus1/3, other six0/3, development2/83; retention3/3 exhausted,145 assertions/41 of42 case executions/final14/14 and55. Source correction REVISE R1–R6, UNQUALIFIED. Full seven qualification units→fresh Q2→root adoption→Q3 valid originalP0before→authorized M+G+B exactly-two-CSS geometry and independent acceptance→versioned baseline→E1–E5→Clock fixed/E1–E25 stays conditional. No current CAL-03 claim consumes or resets it.

| Permanent purpose | Historical actual commands / retained outcomes / admission |
| --- | --- |
| Calendar original package/recurrence/DST | pnpm --filter @repo/plugin-web-calendar test / check-types / lint / test:coverage. Owning dev_log preserves preexisting197,285,299,300 evolution, repeated runs, coverage timeout then isolated covered file and full rerun, deferred XVENDOR-CREATE1–6. Not zero new capacity; suite counts are assertions, not launch counts. |
| REL05 author recovery | Original rendered create/delete quota2FAIL then fixed46files343PASS/types/lint; latest draft/export and account/newer data added. No complete process journal; total/formal-vs-probe unknown. |
| REL05 independent native | node docs/reviews/web-calendar-independent/verify-native.mjs before default a452d40^; CALENDAR_VERIFY_COMMIT=a452d40 node same runner fixed8groups; node .../verify-tests.mjs fixed343. Earlier before at8e50d8f explicitly retained in report, then paired before rerun: at least3 native launches, total unknown. before.log+before-runner.log and after.log+after-runner.log are duplicate reporting of corresponding launches, not four launches. Source uses100MiB execFileSync archive,390×844,websocket/debug-port and DOM-generated input; limited actual download evidence, not complete host/trusted keyboard. |
| Calendar canonical D1 | node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs <SHA> [suite] [suffix]. 496039f12PASS/8FAIL original20; f764731original20PASS plus2PASS/2FAIL boundary; db1eddc24PASS plus reset1FAIL/1PASS; d8412d326PASS;9a7e66b26PASS;2fed98411+2publication independent and original parent26. Modes calendar-independent/shared-independent/calendar-pending/calendar-repair-boundaries/reset-outcome/publication are permanent assertion purposes, not new units per SHA or actor. At least six named independent revision campaigns, process launch total unknown; author HEAD logs separate. Full reports/log indices retained below. |
| Fixture full package | node .../verify-six-subscribers.mjs4202c79 six-calendar-full-rerun: initial harness-root attempt plus20 actualFAIL;9a7e66b same mode372PASS. Raw startup failure remains; no qualification inferred. |
| Web Locks shim | 8e12334 Calendar full372 had23FAIL, solo reproduced; source-bisect storage2fed984372PASS,e9ff40921FAIL,c201a1d/3472b69/5ed9329/20a4591/8e12334 each23FAIL. Fixed fixtures372PASS/types/lint. Temporary diagnostics and meditation probe retained textually, exact total/launch classification unknown. Not native runtime acceptance. |
| AI invalid-input A1 | node docs/reviews/web-ai-calendar-sol-independent/verify-native.mjs afd10ff:21/22invalidPASS,5positivePASS,1classificationFAIL;20a0748:22/22+5PASS and same-request correction/replay. Two retained launches lower bound, total unknown; deterministic provider, no real provider/production auth proof. |
| REL01 local-day | Four-zone focused/local-day/browser-six-date/day-recovery/metric-instant and consumer tests retain exact commands, failure/fix reports and logs in appendix/index. Source civil-time policy reusable; actual scope mutation/exception graph never tested there. Counts cannot reset under CAL03. |
| Shared F1/native/method/vendor | Full canonical r2 and AppRail/Clock histories preserved below. New Codex reviewer is not vendor. Former TT08 vendor attempts belong to that caller, do not establish a Calendar vendor PASS or new Calendar execution budget. |
| Genuinely new CAL03 purposes | Three-scope selection+occurrence identity, exception/split graph and all-writer/new-schema assertions may be separately source-registered only after scope review. They are not a renamed Calendar full package, DST, existing D1 recovery, account or pixel-focus run. Mixed new/old scripts retain every consumed old purpose. |

Permanent unit identity is semantic purpose+actual command/mode/acquisition path, never actor/worktree/path/SHA suffix. Root must reconcile ALL known starts/refusals/calibration/probes/children/abort records, exact launch IDs where recorded, completeness provenance and remaining<=3 before admission. Unknown is not0; lower bounds above do not certify a complete cap. Preserve failed assertions and source unchanged, no automatic replay to collect familiar greens. Valid exact historic evidence is reused only for its original meaning and consumed source closure; new semantics and changed dependencies need delta-specific independently reviewed evidence. Appendix D makes P0 applicability explicit; identical Calendar files do not erase changed storage or closed activation.

## 10. Preparation receipt and disposition

All input bytes are read/hash-validated and both complete output buffers constructed before first write. A single concluding static source/document/ledger-integrity pass is the entire static allowance. Failure stops without rerun. This is not qualification, business verification, owner approval or method admission.

Actual preparation1/3; static1/1; runtime/tests/build/typecheck/lint/browser/native/server/qualification/probes/vendor/children/push0. No project module/runner imported or executed. Token/provider cost unknown. Read-only discovery issues disclosed: initial long tool outputs were truncated; subsequent bounded reads and retained full bytes used. Guessed plugin-web-calendar directory, apps/web/src/account/AccountDataGate.tsx and internal/prefs.ts were absent; actual paths were resolved. One orchestration call failed ReferenceError before issuing its shell command because a node-session variable was referenced in a fresh isolate. JSON schema lookup found TODO.sections[].tasks and EXECUTION.items; parent confirmed its handoff filename mixup. Initial label lookup compared unchanged TODO to original; actual reversible normalization lives in scope-map.original_module. None was a semantic checker execution or a project probe; no failed semantic pass is relabelled.

Memory was consulted only to route the clock-history caution, then current immutable source controls every claim. No memory modifies task authority. Repository rules are hashed in the manifest; external memory is not a product input.

Next task is a fresh independent full contract review of this exact two-file commit: original complete obligation, prior owner decisions, necessity/minimality of question, eighteen rows, finite path/lock map, unavailable source and activation dependencies, exact inherited source/history/G1/caps. Reviewer writes separate allowed artifacts and never edits this source. Only root may adopt documentation, ask reviewed owner question, register impact/machinery, reconcile eventual acceptance and refresh inventory. CAL-03 remains pending; entire goal incomplete. Outputs' source commit, SHA-256, manifest count, static result and clean status are supplied externally to avoid self-reference.

## Appendix A — canonical r2 §14 verbatim

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


## Appendix B — exact original CAL-03 card and reversible labels

```json
{
  "id": "CAL-03",
  "priority": "P2",
  "kind": "决策",
  "action": "补重复事件本次/此后/全部编辑语义、例外与跨日范围",
  "acceptance": "重复编辑前给范围选择；daily/weekly及时区边界不误改其他发生项",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "CAL-03",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:CAL-03"
  ],
  "source_section": "CAL",
  "acceptance_evidence": {
    "business_acceptance": "重复编辑前给范围选择；daily/weekly及时区边界不误改其他发生项",
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
    "CAL-03/prepare",
    "CAL-03/contract-review",
    "CAL-03/before",
    "CAL-03/implement",
    "CAL-03/verify",
    "CAL-03/accept",
    "CAL-03/reconcile",
    "CAL-03/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

| ID | Original literal label | Normalized attribution |
| --- | --- | --- |
| GOV-01 | web（project-system） | web |
| GOV-02 | web（project-system） | web |
| GOV-03 | web（project-system） | web |
| GOV-04 | web（project-system） | web |
| GOV-05 | web（project-system） | web |
| GOV-06 | web（project-system） | web |
| GOV-07 | web（project-system） | web |
| GOV-08 | web（project-system） | web |
| GOV-09 | web（project-system） | web |
| GOV-10 | web（project-system） | web |
| GOV-11 | web（project-system） | web |
| GOV-12 | web（project-system） | web |
| GOV-13 | web（project-system） | web |
| GOV-14 | web（project-system） | web |
| GOV-15 | web（project-system） | web |
| GOV-16 | web（project-system） | web |
| SK-01 | web（project-system） | web |
| SK-02 | web（project-system） | web |
| SK-03 | web（project-system） | web |
| SK-04 | web（project-system） | web |
| SK-05 | web（project-system） | web |
| SK-06 | web（project-system） | web |
| SK-07 | web（project-system） | web |
| SK-08 | web（project-system） | web |
| SK-09 | web（project-system） | web |
| SK-10 | web（project-system） | web |
| SK-11 | web（project-system） | web |
| SK-12 | web（project-system） | web |
| SK-13 | web（project-system） | web |
| SK-14 | web（project-system） | web |
| QA-01 | web（跨模块验证索引） | web |
| QA-02 | web（跨模块验证索引） | web |
| QA-03 | web（跨模块验证索引） | web |
| QA-04 | web（跨模块验证索引） | web |
| QA-05 | web（跨模块验证索引） | web |
| QA-06 | web（跨模块验证索引） | web |
| QA-07 | web（跨模块验证索引） | web |
| QA-08 | web（跨模块验证索引） | web |
| QA-09 | web（跨模块验证索引） | web |

Literal totals: web（project-system）30; web（跨模块验证索引）9. Original module bytes remain reversible, not rewritten English labels.

## Appendix C — all 312 ordered original fields, attribution and current execution evidence

One JSON object per original row; complete fields and reference strings, not an implementation queue or new ledger.

```jsonl
{"original":{"id":"REL-01","priority":"P1","kind":"修复","action":"统一用户时区、自然日、全天事项、绝对时间与午夜刷新合同","acceptance":"Tasks/Habits/Calendar/Statistics/Metrics/Time Tracker同一时刻的今天一致；DST按下一自然日计算","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"REL-01","status":"completed","evidence":["commit:2f04bd4","../web-local-time-contract/20260909-bug-diagnose.md","commit:337d2b8","../web-local-time-contract/20260909-parent-verification.md","commit:8edd51d","commit:ca70f6f","../web-local-time-contract/20260909-independent-verification.md","commit:58e2757","commit:9149778","../web-local-time-contract/20260909-tt-idle-rollover-fix.md","commit:c02a09a","../web-local-time-consumers-independent/20260909-review.md"]}}
{"original":{"id":"REL-02","priority":"P1","kind":"修复","action":"修复Auth与device共用IndexedDB但分别初始化object store的冲突","acceptance":"全新profile中session→device、device→session和并发初始化均成功，老库迁移保留数据","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"REL-02","status":"verification_pending","evidence":["../web-auth-device-session/20260909-rel02-verification.md","../web-auth-device-session/verify-browser-idb.mjs","commit:0141ecb","commit:f578ae8","commit:f15aceb","../web-auth-device-session/rel02-queue-review.test.ts","commit:5803e86","../web-auth-store-independent/20260909-review.md"],"functional_status":"passed","workflow_status":"cross_tool_verification_pending"}}
{"original":{"id":"REL-03","priority":"P1","kind":"修复","action":"对业务内容和BYOK密钥按账户隔离，区分设备级偏好","acceptance":"A退出后B不读到A内容/key；未归属旧数据迁移有明确选择和回退","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"REL-03","status":"verification_pending","evidence":["commit:44fa05c","../web-account-data-isolation/20260909-rel03-diagnosis.md","commit:ebb91c2","commit:85451f6","commit:e1cbe5c","commit:575cfd9","commit:fae9398","commit:5ae7b7a","commit:23b83e4","commit:96d1914","../web-account-data-isolation/20260909-host-integration.md","commit:992f688","commit:9638dbe","../web-account-data-isolation/20260909-joint-independent-review.md","commit:f02ca28","../web-account-scope-current-independent/20260909-review.md"],"functional_status":"passed","workflow_status":"cross_tool_verification_pending"}}
{"original":{"id":"REL-04","priority":"P1","kind":"修复","action":"补全Time Tracker、记账及布局、Metrics等数据的清理/导出/迁移登记","acceptance":"实体到存储key的所有权清单完整；账号删除和导出覆盖所有声明数据","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"REL-04","status":"verification_pending","evidence":["commit:d266ab8","commit:55d826e","commit:60a1b6e","../web-data-lifecycle-registry/20260909-rel04-diagnosis.md","commit:d01b671","commit:f6b1d00","../web-data-lifecycle-registry/20260909-timer-lifecycle-check.md","commit:adf7485"]}}
{"original":{"id":"REL-05","priority":"P1","kind":"修复","action":"统一存储读写结果，禁止持久化失败后界面仍显示保存成功","acceptance":"quota/禁止访问/数据库不可用时保留草稿并显示未保存、重试和导出","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"REL-05","status":"in_progress","evidence":["commit:3399f88","../web-storage-write-results/20260909-rel05-diagnosis.md","commit:aff8175","../web-storage-write-results/independent-write-failure.test.tsx","commit:dd744f5","commit:9222519","commit:7102f22","commit:15be421","commit:a61f92d","commit:45d0665","commit:9c974e7","commit:8c88842","../web-save-recovery-independent/20260909-joint-verification.md","../web-metrics-save-independent/20260909-verification.md","commit:6fa451f","commit:da35b3b","../web-save-consumer-inventory/20260909-inventory.md","../../../packages/xai-web-meditation/docs/test.md","commit:28fe049","../web-save-consumer-inventory/20260909-med-after.md","commit:9ebc48c","commit:8e50d8f","../web-matrix-independent/20260909-independent-verification.md","commit:a452d40","../web-calendar-save-recovery/20260909-diagnosis-and-fix.md","commit:3cd8870","../web-calendar-independent/20260909-independent-verification.md","commit:45a2a06","../web-habits-save-recovery/20260909-diagnosis-and-fix.md","commit:394efad","../web-pomodoro-preference-recovery/20260909-fix.md","commit:179e6d5","commit:407259d","commit:91f544e","../web-countdown-independent/20260909-review.md","commit:dc86983","commit:88108ed","../web-pomodoro-prefs-independent/20260909-independent.md","commit:0b16605","commit:bc57f1f","../web-habits-save-independent/review.md","commit:885a111","commit:0223180","commit:8eb163d","commit:88fd5c1","../web-ai-save-recovery/20260909-diagnosis.md","commit:996199b","commit:81f5623","../web-board-card-save-recovery/20260909-diagnosis.md","commit:279a7f5","commit:dea0af6","commit:ec81440","../web-board-composer-independent/review.md","commit:d8fb98d","commit:650f59c","commit:81a2346","commit:3491540","../web-ai-save-independent/review.md","../web-ai-preference-discard/review.md","commit:72296ec","commit:33723a1","commit:187225e","../web-dashboard-grid-independent/review.md","commit:8865d17","commit:53854f4","../web-ai-toolbar-independent/review.md","commit:1277086","../web-ai-preference-independent/review.md","commit:32023cf","commit:e1e3697","../web-board-workspace-astra-review/20260909-astra-review.md","commit:1053463","commit:38c056e","commit:ac0e090","../web-board-workspace-astra-review/20260909-1053463-rereview.md","commit:a8774fd","../web-board-detail-save-diagnosis/review.md","commit:034ef46","commit:a81234e","commit:8045d5d","../web-board-workspace-astra-review/20260909-034ef46-rereview.md","commit:b353cbb","commit:944c5ef","commit:501feb7","../web-board-workspace-astra-review/20260909-b353cbb-acceptance.md","commit:863e738","commit:f764731","commit:e407967","../web-board-workspace-astra-review/20260909-d1-f764731-rereview.md","commit:db1eddc","commit:adc1202","commit:d8412d3","commit:c58a647","../web-board-workspace-astra-review/20260909-d1-d8412d3-reset-acceptance.md","commit:5c0f46d","commit:51338e0","commit:66a8488","commit:74565a6","commit:4584ceb","commit:35b4964","../web-tasks-canonical-ui-independent/review.md","commit:0a294bc","commit:8503b71","../web-tasks-canonical-ui-independent/tasks-ui-retry-35b4964.log","commit:1998df3","commit:9a7e66b","../web-calendar-d1-fixture-repair/20260909-calendar-fixture-repair.md","commit:1829c3a","../web-board-canonical-link-independent/review.md","commit:56f1aaf","commit:1660df9","../web-board-workspace-astra-review/20260909-calendar-fixtures-9a7e66b-acceptance.md","commit:b899396","../web-tasks-canonical-ui-native/review.md","commit:6a1adac","../web-board-canonical-link-independent/board-link-6a1adac.log","commit:3241529","commit:2ca5b93","commit:b4344a4","../web-board-workspace-astra-review/20260909-board-d1-6a1adac-review.md","commit:728822d","commit:ab3a150","commit:2fed984","commit:7f19aec","commit:0143952","../web-board-workspace-astra-review/20260909-tasks-d1-3241529-review.md","commit:0b3a043","commit:bf2935b","commit:4e9ff08","commit:54b422c","commit:170c526","commit:a4f6369","commit:8d1fb07","commit:f3a519c","commit:e9ff409","commit:45b83b6","commit:0c4b6b4","commit:aa747d4","commit:080f86b","commit:e9fb5e7","commit:40e4adb","commit:c201a1d","commit:96aa7b1","commit:dbc2e69","commit:33832b1","commit:ec8f86e","commit:0203c56","commit:ea5ba0b","commit:c5a4347","commit:fe2aa90","commit:8679232","commit:51ae929","commit:10c208e","commit:051d7fa","commit:a6ad06d","commit:cc70314","commit:c35898f","commit:95afb81","commit:3472b69","../web-board-workspace-astra-review/20260909-settings-a6ad06d-review.md","commit:f43dff6","commit:5adf530","commit:b152399","commit:8105cc9","commit:b484a6e","commit:a1f73c9","commit:0eec9a7","commit:5a97d53","commit:ce92c78","../web-board-workspace-astra-review/20260909-settings-a1f73c9-acceptance.md","commit:8ab38ed","commit:61f8fa5","commit:e5eb23f","commit:25dc196","commit:a82efa0","commit:99c02a3","commit:6b3f09b","../web-board-tasklink-astra-final/review.md","commit:5ed9329","commit:04d036b","commit:1becb16","commit:838396c","commit:825a926","commit:20da766","commit:2c5dc31","commit:242b75d","commit:6e21e48","../web-d2-async-pref-contract/acceptance-status.md","commit:35b4d0e","commit:3abca42","commit:6504589","commit:01fba63","commit:e75d5b3","commit:d6184ee","commit:8c49657","../web-d2-async-pref-native/parent-d6184ee-review.md","commit:2bd330a","../web-d2-async-pref-astra-hooks/review.md","commit:9557005","../web-d2-dashboard-note-independent/review.md","commit:69c8318","commit:d15aec5","commit:725d719","../web-d2-async-pref-dynamic-independent/review.md","commit:20a4591","commit:2c375a0","commit:41950a7","commit:a85fc9b","../web-d2-async-pref-native/parent-20a4591-review.md","commit:a25423c","../web-d2-async-pref-astra-hooks/review-20a4591.md","commit:f532ad5","commit:124cdc3","../web-d2-dashboard-note-native/native-f532ad5-final.json","commit:53fb95d","commit:d129950","commit:662ef40","commit:4a66e86","../web-d2-dashboard-note-astra/review-d129950.md","commit:56fe1de","commit:0320995","commit:9f1b20a","commit:9693b3e","commit:47e625b","../web-d2-device-autosave-contract/contract.md","commit:d79670f","commit:76edb0c","commit:546410d","commit:083d83d","../web-d2-device-offset-native/review.md","commit:b0b3016","commit:68ea7a3","commit:40e64af","commit:6265892","commit:830dd2b","commit:a6b50c3","commit:9424081","commit:1a99a2a","commit:0027a6c","commit:db5041f","../web-d2-device-offset-astra/review-830dd2b.md","commit:2b666ed","commit:6ff1a8d","commit:6c7e0fd","commit:6981111","commit:dfe0fce","../web-d2-pomo-controls-native/review.md","../web-d2-pomo-export-native/review.md","commit:7785e92","commit:ba9affc","commit:6f4140c","commit:03b0363","../web-d2-pomo-device-astra/review-7785e9.md","commit:b3ecc69","commit:d633e22","../web-d2-smart-lists-native/review.md","commit:1666f42","commit:40ffbe1","commit:aadf2a7","commit:c30c938","commit:1267f50","../web-d2-smart-lists-contract/contract.md","commit:a663891","commit:07bf394","commit:8565ca6","commit:26f8156","commit:ef97c1f","commit:6bf02de","commit:78bb812","../web-smart-lists-recovery-contract/contract.md","../web-d2-smart-lists-astra/review-40ffbe1.md","../web-d2-smart-lists-draft-native/review.md","../web-d2-smart-lists-host-native/review.md","commit:b18939e","commit:f27c6d1","../web-d2-async-pref-contract/caller-recovery-matrix.md","commit:286bcc7","../web-smart-lists-recovery-astra/review-6bf02de.md","commit:115efb2","commit:32862d5","commit:dc90d44","commit:6b3c044","commit:3e05d1b","../web-smart-lists-recovery-sol/review-115efb2.md","commit:3ddd9ff","commit:a3b3928","../web-smart-lists-recovery-astra/review-115efb2.md","commit:a2c0fe0","commit:4103ebf","commit:348a095","commit:3667985","../web-collaborate-recovery-native/review.md","../web-smart-lists-recovery-sol/review-a2c0fe0.md","commit:75aa0e8","commit:8d654ed","commit:5f4c4ff","../web-smart-lists-recovery-astra/review-a2c0fe0.md","../web-collaborate-recovery-contract/contract.md","commit:2bbc696","commit:2b02dd3","commit:394a4ba","commit:cdde1d0","commit:ae2d233","../web-collaborate-recovery-independent/review.md","../web-collaborate-recovery-terra/author-report.md","commit:977369e","commit:e08cd8c","commit:1e81df0","commit:2a536c1","commit:9f0385f","commit:c604951","commit:53a4d96","../web-collaborate-recovery-independent/acceptance-c604951.md","../web-pomodoro-departure-independent/review.md","../web-pomodoro-departure-contract/contract.md","commit:ad689dd","commit:f46b4b8","commit:6254cb4","commit:af32234","../web-collaborate-recovery-astra-final/acceptance-ad689dd.md","../web-departure-coordinator-independent/review-af32234.md","commit:ba7f0da","commit:0d7f885","commit:b01b67c","commit:e1a69fb","commit:6844ce1","commit:528ab18","../web-departure-coordinator-astra/review-af32234.md","../web-pomodoro-departure-native/review.md","commit:990ac52","commit:d504664","commit:00900dc","../web-pomodoro-departure-astra/review-e1a69fb.md","commit:2962b49","commit:f966da3","commit:2ae8272","commit:711ddbd","commit:051212a","../web-pomodoro-departure-astra/acceptance-2962b49.md","commit:ef722d8","commit:a62d8a2","commit:e4a32a1","../web-dashboard-header-departure-contract/contract.md","../web-dashboard-header-departure-independent/review.md","commit:45a1c15","commit:0f2d5a0","commit:3e11013","commit:1c2506b","commit:d6ac266","commit:772b702","../web-dashboard-header-departure-native/review.md","commit:41fb4d1","commit:17144da","commit:e6c52e1","commit:ddc1ff8","../web-dashboard-header-departure-sol/review-41fb4d1.md","commit:9193353","commit:4aecaa6","commit:9ba8655","commit:fd0e740","commit:b8cb6e4","../web-dashboard-header-departure-astra/coverage-41fb4d1.md","../web-dashboard-header-departure-native/supplemental-review.md","commit:c9a388d","commit:f6e1ff5","commit:1bdc844","commit:9fe3fad","commit:73b4eb9","commit:106f1d8","commit:c79ac8f","commit:3595cbd","commit:934430a","commit:4600368","commit:ccf72e3","commit:2ea710f","../web-dashboard-header-departure-astra/acceptance-73b4eb9.md","../web-dashboard-header-departure-sol/review-73b4eb9.md","commit:3638e21","commit:8c05c85","../web-date-time-recovery-contract/contract.md","../web-date-time-recovery-contract/remaining-writers.md","../web-date-time-recovery-independent/review.md","commit:2c09719","commit:e9213fb","commit:34cff59","commit:8407ab8","../web-date-time-recovery-native/review.md","commit:611062e","commit:3df3199","commit:6b0694b","commit:da6950a","../web-date-time-recovery-independent/current-611062e.md","commit:d0d934d","../web-date-time-recovery-astra/acceptance-d9d9fdd.md","../web-date-time-recovery-astra/next-notifications-contract.md","../web-notifications-recovery-independent/before-d9d9fdd.md","commit:f130cb0","commit:7ce03a5","commit:a41cd1d","commit:ad223a2","../web-notifications-recovery-astra/acceptance-afbfb24.md","../web-notifications-recovery-astra/next-more-contract.md","commit:fc56d5e","commit:f73b85f","../web-more-recovery-independent/before-afbfb24.md","commit:27efbf2","commit:f4c3c62","commit:982ab68","commit:7b216a3","../web-more-recovery-terra/implementation.md","commit:8e12334","../web-more-recovery-sol/README.md","../web-more-recovery-sol/review-7b216a3.md","commit:fe08254","../web-more-recovery-independent/fixed-7b216a3.md","commit:443be31","commit:8c07b57","commit:a6c7b57","commit:a9921b9","../web-more-recovery-native/review-controls-reset-7b216a3.md","../web-more-recovery-native/review-host-7b216a3.md","../web-more-recovery-native/review-recovery-owner-7b216a3.md","../web-more-recovery-native/review-visual-7b216a3.md","commit:7b9ef87","../web-more-recovery-final/review-final-regressions-7b216a3.md","commit:5ac1244","../web-more-recovery-astra/blocked-7b216a3.md","commit:c0c9ec5","../web-more-recovery-evidence/completion-7b216a3.md","commit:27adb10","../web-more-recovery-acceptance/acceptance-7b216a3.md","commit:019f451","../web-sticky-recovery-native/review-host-210abdf.md","commit:0ba68d7","../web-sticky-recovery-f1/impact-review.md","commit:e3db4e0","../web-sticky-recovery-f1/before-callers-210abdf.md","commit:f359be6","commit:3ea0310","../web-sticky-recovery-f1/post-f359be6.md","commit:f3a3c82","../web-sticky-recovery-f1/affected-callers-f359be6.md","commit:70ff46a","../web-sticky-recovery-contract/contract.md","commit:4e21e6d","../web-sticky-recovery-sol/README.md","commit:07784c4","../web-sticky-recovery-independent/before-2023526.md","commit:210abdf","commit:7ee8de6","../web-sticky-recovery-sol/fixed-210abdf.md","../web-sticky-recovery-independent/fixed-210abdf.md","commit:bc92561","../web-sticky-recovery-native/review-controls-export-210abdf.md","../web-sticky-recovery-sol/post-f359be6.md","../web-sticky-recovery-independent/post-f359be6.md","../web-sticky-recovery-native/post-f359be6.md","commit:98125c5","../web-sticky-recovery-native/review-visual-f359be6.md","commit:d7358b9","../web-sticky-recovery-final/review-final-regressions-f359be6.md","commit:47bbd58","../web-sticky-recovery-acceptance/blocked-f359be6.md","commit:3debd91","../web-sticky-recovery-final/widgets-f359be6.md","commit:699f6e6","../web-sticky-recovery-acceptance/acceptance-f359be6.md","commit:6ded3dc","../web-next-caller-selection/selection-f359be6.md","../web-features-recovery-contract/contract.md","commit:11e0afb","../web-features-recovery-sol/README.md","commit:b732c27","../web-features-recovery-independent/before-f359be6.md","commit:4c5323f","../web-features-recovery-native/before-f359be6.md","../web-features-recovery-f1/before-f359be6.md","commit:5cd63ff","commit:eb37a59","../web-features-recovery-sol/fixed-5cd63ff.md","../web-features-recovery-independent/fixed-5cd63ff.md","../web-features-recovery-f1/fixed-5cd63ff.md","commit:58a93ef","../web-features-recovery-native/review-controls-reset-export-5cd63ff.md","commit:312b27c","../web-features-recovery-native/review-host-downstream-5cd63ff.md","commit:5905e37","../web-features-recovery-native/review-visual-keyboard-5cd63ff.md","commit:0056299","../web-features-recovery-final/review-final-regressions-5cd63ff.md","commit:05b21f4","../web-more-recovery-fb002/review-fb002.md","commit:ec55f9e","../web-features-recovery-acceptance/acceptance-5cd63ff.md","commit:e9fbdb7","../web-next-caller-selection/selection-5cd63ff.md","../web-appearance-recovery-contract/contract.md","commit:b2e5eb2","commit:706c9a3","commit:bd09456","../web-appearance-recovery-sol/README.md","commit:b997235","../web-appearance-recovery-independent/README.md","commit:72538d1","../web-appearance-recovery-native/before-5cd63ff.md","../web-appearance-recovery-f1/before-5cd63ff.md","commit:24073b5","commit:4874170","../web-appearance-recovery-terra/implementation.md","commit:26cfce8","../web-appearance-recovery-oracle-erratum/review-oe.md","commit:31d6335","../web-appearance-recovery-sol/fixed-24073b5.md","commit:3419542","../web-appearance-recovery-native/review-controls-reset-export-24073b5.md","commit:6b9f0ee","../web-native-keyinput-k1/review-k1.md","commit:32e6753","../web-appearance-recovery-native/review-host-downstream-retryall-24073b5.md","commit:5307b6f","../web-appearance-recovery-native/review-visual-keyboard-24073b5.md","commit:5bbf473","commit:0d34bf2","../web-appearance-recovery-terra/implementation-r2.md","commit:bacdbbc","../web-appearance-recovery-native/review-visual-keyboard-5bbf473.md","commit:419e56d","commit:5766c1e","../web-appearance-recovery-terra/implementation-r3.md","commit:2696855","../web-appearance-recovery-native/review-visual-keyboard-419e56d.md","commit:c6d1ed4","../web-appearance-recovery-final/review-final-regressions-419e56d.md","commit:a560863","../web-appearance-recovery-acceptance/acceptance-419e56d.md","commit:2c35fee","../web-next-caller-selection/selection-419e56d.md","commit:f7726d7","../web-apprail-order-recovery-contract/contract.md","commit:d6ea500","../web-apprail-order-recovery-sol/README.md","commit:6e9ec9c","../web-apprail-order-recovery-independent/README.md","commit:04ee6a2","../web-apprail-order-recovery-native/before-419e56d.md","../web-apprail-order-recovery-f1/before-419e56d.md","commit:f9eb4b1","commit:0d440ca","../web-apprail-order-recovery-terra/implementation.md","commit:94b12ba","../web-apprail-order-recovery-sol/fixed-f9eb4b1.md","commit:ae7b69e","../web-apprail-order-recovery-native/review-controls-protection-export-f9eb4b1.md","commit:55cf1e9","../web-apprail-order-recovery-native/review-downstream-visual-f9eb4b1.md","commit:5c6bcd2","../web-apprail-order-recovery-native/review-keyboard-f9eb4b1.md","commit:ee60b48","../web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md","commit:efe05ea","../web-apprail-order-recovery-acceptance/acceptance-f9eb4b1.md"]}}
{"original":{"id":"REL-06","priority":"P1","kind":"修复","action":"把账号删除的IDB blocked/error作为真实失败处理","acceptance":"关闭相关连接、通知其他tab、可重试；只有完成清理才显示成功回执","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"REL-06","status":"in_progress","evidence":["commit:27b8925","commit:a1ed33a","commit:762778c","commit:35d7b11","../../../packages/plugin-web-settings-rest/src/__tests__/accountDeleteHttpFailure.test.tsx","commit:23bd23c","commit:65e87b7","../web-account-deletion-reliability/20260909-legacy-wipe-verification.md","commit:c0af11b","../web-auth-session-cleanup/20260909-rel06-independent-diagnosis.md","commit:2cec3c5","../web-auth-session-cleanup/20260909-generation-foundation.md","commit:498ceb9","commit:faecd79","commit:3d39533","../web-auth-session-cleanup/20260909-generation-client.md","commit:d801f5e","commit:4001170","commit:d895b0b","commit:23c3423","commit:cfc2d6d","commit:e1c3b01","../web-auth-session-cleanup/20260909-host-integration.md","commit:3637866","commit:10a90ce","commit:d8501f3","../web-auth-host-independent/20260909-independent-review.md","commit:ab8c35a","../web-account-deletion-auth-receipt/20260909-fix.md","commit:2274185","../web-account-deletion-auth-independent/20260909-review.md","commit:0ed1582","../web-canonical-migration-write-race/review.md","commit:fa90dae","commit:0203c56","commit:ea5ba0b","commit:c5a4347","commit:fe2aa90","commit:8679232","commit:51ae929","commit:10c208e","commit:051d7fa","commit:a6ad06d","commit:cc70314","commit:c35898f","commit:95afb81","commit:3472b69","../web-board-workspace-astra-review/20260909-settings-a6ad06d-review.md","commit:f43dff6","commit:5adf530","commit:b152399","commit:8105cc9","commit:b484a6e","commit:a1f73c9","commit:0eec9a7","commit:5a97d53","commit:ce92c78","../web-board-workspace-astra-review/20260909-settings-a1f73c9-acceptance.md"]}}
{"original":{"id":"REL-07","priority":"P2","kind":"修复","action":"区分未初始化、合法空数据、损坏数据和未知schema","acceptance":"删除所有内容后重开仍为空；坏数据保留可导出副本且不自动覆盖为样例","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"REL-07","status":"pending","evidence":[]}}
{"original":{"id":"REL-08","priority":"P2","kind":"核验","action":"复现并消除跨tab整对象最后写覆盖风险","acceptance":"两tab交错新增/修改不丢记录；实体事务/revision/冲突策略有真实浏览器证据","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"REL-08","status":"pending","evidence":[]}}
{"original":{"id":"REL-09","priority":"P2","kind":"修复","action":"统一可恢复草稿与提交边界","acceptance":"日记、AI输入、便签、账单等未提交内容能恢复；不只依赖blur或beforeunload","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"REL-09","status":"pending","evidence":[]}}
{"original":{"id":"REL-10","priority":"P2","kind":"修复","action":"限制resetAllPrefs公共默认实现只重置偏好","acceptance":"现有Appearance/Features安全行为保留；新面板默认重置不会清业务实体","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"REL-10","status":"pending","evidence":[]}}
{"original":{"id":"REL-11","priority":"P2","kind":"优化","action":"为本地repository补版本迁移、输入边界校验和容量策略","acceptance":"旧版本数据可升级并回退；非法字段、超限数据有稳定错误而非白屏","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"REL-11","status":"pending","evidence":[]}}
{"original":{"id":"REL-12","priority":"P2","kind":"决策","action":"明确关闭网页、退出账号、切换账号期间各活动会话是否继续计入","acceptance":"形成每类会话的恢复/修正规则；本地计时不以账号云同步为前提","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"REL-12","status":"pending","evidence":[]}}
{"original":{"id":"TT-01","priority":"P1","kind":"修复","action":"按查询窗口相交部分拆分时段，修复跨日/周/月漏算和未来记录污染","acceptance":"23:50至00:10总20分钟，两天各10分钟；未来1小时不计今日","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"TT-01","status":"completed","evidence":["commit:6cd137e","commit:c5b08a7","../web-time-tracker-window-accounting/20260909-tt01-diagnosis.md","../web-time-tracker-window-accounting/20260909-fix.md","commit:8d951e9","../web-time-window-independent/20260909-verification.md"]}}
{"original":{"id":"TT-02","priority":"P1","kind":"修复","action":"统一开放、暂停、继续、结束状态不变量和幂等操作","acceptance":"每个会话无重复开放segment；反复resume/end不多计；跨tab活动策略明确","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"TT-02","status":"completed","evidence":["commit:ba20658","commit:64caa5a","commit:082766b","../web-time-tracker-session-independent/20260909-report.md"]}}
{"original":{"id":"TT-03","priority":"P2","kind":"修复","action":"按小时拆分时段，统一Insights、CSV、图表与widget的聚合口径","acceptance":"跨小时/跨DST/部分相交记录各处总数一致，范围和时区可追溯","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"TT-03","status":"completed","evidence":["commit:c5b08a7","../web-time-tracker-window-accounting/20260909-fix.md","commit:8d951e9","../web-time-window-independent/20260909-verification.md","../web-time-hour-independent/20260909-review.md"]}}
{"original":{"id":"TT-04","priority":"P2","kind":"修复","action":"分类删除与记录变更事务化，保留历史名称和墓碑","acceptance":"删除前显示影响记录/时长，可撤销；失败不出现分类已删而记录未处理","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TT-04","status":"pending","evidence":[]}}
{"original":{"id":"TT-05","priority":"P2","kind":"优化","action":"将活动会话、分类和主操作前置，折叠日期进度辅助卡","acceptance":"390px首屏可识别正在计时内容；短记录显示秒，完整分类名称可读","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TT-05","status":"pending","evidence":[]}}
{"original":{"id":"TT-06","priority":"P2","kind":"优化","action":"增加重开恢复说明、离开时长修正和超长会话提示","acceptance":"用户可继续或修正离开时间；说明与实际记录相符","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TT-06","status":"pending","evidence":[]}}
{"original":{"id":"TT-07","priority":"P2","kind":"优化","action":"降低历史记录每秒全量聚合开销","acceptance":"一万时段测量基线；历史聚合按数据变更更新，仅活动段秒级刷新","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TT-07","status":"pending","evidence":[]}}
{"original":{"id":"TT-08","priority":"P2","kind":"文档","action":"核对single/multi mode实际语义并同步PRD、日志和页面","acceptance":"文档不再声明未消费的模式；独立verify后更新READY_TO_SHIP状态","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TT-08","status":"pending","evidence":["commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef","../audit-parallel-tt08-final-acceptance-r1/acceptance.md","sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca","commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056","../audit-parallel-tt08-vendor-verification-r3/receipt.md","commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"]}}
{"original":{"id":"POMO-01","priority":"P1","kind":"修复","action":"持久化活动会话、暂停信息和deadline，使用应用级会话控制","acceptance":"启动→切路由→刷新→关tab重开仍能继续或正确结算","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"POMO-01","status":"completed","evidence":["commit:b6cf0ee","../web-pomodoro-durable-session/20260909-diagnosis.md","commit:ce4b767","../web-pomodoro-durable-session/20260909-fix.md","commit:4868d0a","commit:53eda1b","../web-pomodoro-independent/20260909-independent-review.md"]}}
{"original":{"id":"POMO-02","priority":"P1","kind":"修复","action":"区分deadline、实际elapsed和recordedAt，完成结算按sessionId去重","acceptance":"晚回来不把真实到期时间改为回来时间；多次恢复只写一条","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"POMO-02","status":"completed","evidence":["commit:b6cf0ee","../web-pomodoro-durable-session/20260909-diagnosis.md","commit:ce4b767","../web-pomodoro-durable-session/20260909-fix.md","commit:4868d0a","commit:53eda1b","../web-pomodoro-independent/20260909-independent-review.md"]}}
{"original":{"id":"POMO-03","priority":"P1","kind":"修复","action":"统一提前结束与Statistics的数据合同","acceptance":"25分钟配置实做1分钟时记录及统计均为1分钟，并标记未完成","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"POMO-03","status":"completed","evidence":["commit:2b1759b","../web-statistics-time-contract/20260909-stat01-fix.md","commit:ab94f84","commit:666171d","commit:e747076","../web-statistics-time-independent/20260909-independent-review.md"]}}
{"original":{"id":"POMO-04","priority":"P2","kind":"决策","action":"明确Stop、Reset及中途离开的保存规则","acceptance":"每个按钮的保存/放弃含义清楚；Reset不静默丢失用户以为已保存的记录","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"POMO-04","status":"pending","evidence":[]}}
{"original":{"id":"POMO-05","priority":"P2","kind":"优化","action":"收起样式/配色/预设，突出模式、时间、开始与恢复动作","acceptance":"主要操作无需穿过大量设置；全局运行状态可达；声音能力说明真实","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"POMO-05","status":"pending","evidence":["commit:353e418","commit:40079c7","commit:03b0363","../web-d2-pomo-recovery-visual/review.md"]}}
{"original":{"id":"MED-01","priority":"P1","kind":"修复","action":"用绝对时间替代每次interval加一并持久活动会话","acceptance":"后台节流/锁屏后显示真实经过时长；重开有明确恢复状态","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"MED-01","status":"completed","evidence":["commit:6887879","../web-meditation-durable/20260909-author-verification.md","commit:797b4b4","../web-meditation-independent/20260909-independent-verification.md"]}}
{"original":{"id":"MED-02","priority":"P1","kind":"修复","action":"补到期结束状态并停止音频和timer","acceptance":"到00:00后仅完成一次，不继续播放或空转；播放错误可见","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"MED-02","status":"completed","evidence":["commit:6887879","../web-meditation-durable/20260909-author-verification.md","commit:797b4b4","../web-meditation-independent/20260909-independent-verification.md"]}}
{"original":{"id":"MED-03","priority":"P2","kind":"决策","action":"定义冥想历史记录、离开修正和重新播放规则","acceptance":"是否计入离开时长、是否续播和实际记录字段有可测试合同","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"MED-03","status":"pending","evidence":[]}}
{"original":{"id":"MED-04","priority":"P2","kind":"优化","action":"首屏围绕场景、时长和开始，外观设置移入抽屉","acceptance":"开始流程简短，静音/结束可达；文档更新为当前真实音频能力","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"MED-04","status":"pending","evidence":[]}}
{"original":{"id":"TASK-01","priority":"P1","kind":"修复","action":"用真实dueDate驱动Today/Tomorrow/Next7，计数与列表共用selector","acceptance":"跨午夜自动更新；今天包含定义内的今日/逾期，明天不等于未来7天","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"TASK-01","status":"completed","evidence":["commit:0a3a944","../web-tasks-date-independent/20260909-report.md"]}}
{"original":{"id":"TASK-02","priority":"P1","kind":"修复","action":"统一完成状态、completedAt和Board来源身份","acceptance":"移动任务/Board列、完成撤销、归档恢复后链接与状态不丢；不以listId作为永久身份","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"TASK-02","status":"completed","evidence":["commit:1b7c0e0","commit:d7d1733","commit:f3a75f1","commit:3c8e24f","commit:58f4076","../web-task-link-independent/20260909-review.md"]}}
{"original":{"id":"TASK-03","priority":"P2","kind":"修复","action":"清单/标签元数据订阅跨tab更新并允许合法空集合","acceptance":"删除最后标签后重开不回种默认；名称验证完整，删除影响已完成项有规则","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TASK-03","status":"pending","evidence":[]}}
{"original":{"id":"TASK-04","priority":"P2","kind":"修复","action":"补基础CRUD撤销、来源跳转和保存状态","acceptance":"批量完成/删除显示范围；失败不丢内容；来源Task/Board可互相定位","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TASK-04","status":"pending","evidence":[]}}
{"original":{"id":"TASK-05","priority":"P2","kind":"优化","action":"修复图标代码直接输出并收敛重复筛选导航","acceptance":"inbox/book/home显示真实图标；移动端列表和筛选可达","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TASK-05","status":"pending","evidence":[]}}
{"original":{"id":"TASK-06","priority":"P2","kind":"决策","action":"处置Local Calendars/已完成/不做/垃圾桶无动作入口","acceptance":"已实现则接真实数据与恢复路径；未实现则禁用/隐藏并说明，计数不写死","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"TASK-06","status":"pending","evidence":[]}}
{"original":{"id":"TASK-07","priority":"P2","kind":"优化","action":"改进横向列导航、列表/看板切换和多选控件","acceptance":"长清单有清晰滚动/列选择；键盘、触屏及空态流程可用","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"TASK-07","status":"pending","evidence":[]}}
{"original":{"id":"HAB-01","priority":"P1","kind":"修复","action":"打卡、连续天、月完成率统一当地日期和应完成周期","acceptance":"频率/startDate生效；未来打卡不抬高结果；完成率不超过100%","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"HAB-01","status":"pending","evidence":[]}}
{"original":{"id":"HAB-02","priority":"P2","kind":"修复","action":"午夜/可见性恢复后更新今日状态并保留合法空习惯库","acceptance":"长开页面今天自动变化；清空后重开不注入样例","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"HAB-02","status":"pending","evidence":[]}}
{"original":{"id":"HAB-03","priority":"P2","kind":"修复","action":"日记按变化保存durable draft并处理切习惯/外部更新冲突","acceptance":"直接关闭不丢输入；其他tab更新不静默覆盖草稿","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"HAB-03","status":"pending","evidence":[]}}
{"original":{"id":"HAB-04","priority":"P2","kind":"优化","action":"突出今天打卡、应完成日和休息日，整理周标题与徽章","acceptance":"圆点不挤压文字；命中区44px；未来/历史补记含义清楚","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"HAB-04","status":"pending","evidence":[]}}
{"original":{"id":"HAB-05","priority":"P1","kind":"文档","action":"校准可保存但不执行的提醒入口","acceptance":"显示实际支持/权限/已安排状态；关页提醒建设关联JOB组","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"HAB-05","status":"pending","evidence":[]}}
{"original":{"id":"CAL-01","priority":"P1","kind":"修复","action":"统一当地日期、默认日期和长驻页面Today更新","acceptance":"主日历、mini日历及记录日期一致；跨午夜后Today指向当天","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"CAL-01","status":"pending","evidence":[]}}
{"original":{"id":"CAL-02","priority":"P2","kind":"修复","action":"统一用户事件和Board feed在月格、日详情及各视图的投影","acceptance":"月格可见的卡片在详情中也可见，且可回到来源","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"CAL-02","status":"pending","evidence":[]}}
{"original":{"id":"CAL-03","priority":"P2","kind":"决策","action":"补重复事件本次/此后/全部编辑语义、例外与跨日范围","acceptance":"重复编辑前给范围选择；daily/weekly及时区边界不误改其他发生项","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"CAL-03","status":"pending","evidence":[]}}
{"original":{"id":"CAL-04","priority":"P2","kind":"优化","action":"明确空日历与演示模式，修复底部周行裁切和事件溢出","acceptance":"桌面全部周可达；已有+N可见可打开；移动优先议程/周视图","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"CAL-04","status":"pending","evidence":[]}}
{"original":{"id":"CAL-05","priority":"P1","kind":"文档","action":"提醒字段与真实通知能力分开显示","acceptance":"保存事件不等于已安排系统提醒；实现调度前明确限制","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"CAL-05","status":"pending","evidence":[]}}
{"original":{"id":"MAT-01","priority":"P2","kind":"修复","action":"补真实编辑、删除、完成动作和合法空态","acceptance":"装饰checkbox/更多按钮有真实语义或禁用；清空后不恢复8条样例","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"MAT-01","status":"pending","evidence":[]}}
{"original":{"id":"MAT-02","priority":"P2","kind":"决策","action":"确定Matrix是独立任务库还是Tasks优先级视图","acceptance":"PRD明确数据关系；若整合则共享taskId，不创建持续漂移副本","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"MAT-02","status":"pending","evidence":[]}}
{"original":{"id":"MAT-03","priority":"P2","kind":"优化","action":"保留Cmd/Ctrl+箭头移动，补触屏移动与未分类引导","acceptance":"键盘及触屏都有移动路径；四象限空态能引导设置重要/紧急","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"MAT-03","status":"pending","evidence":[]}}
{"original":{"id":"CD-01","priority":"P2","kind":"修复","action":"区分date-only倒计日与带时区deadline","acceptance":"重开、跨时区、DST和跨年显示符合定义；保存时保留日期类型","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"CD-01","status":"pending","evidence":[]}}
{"original":{"id":"CD-02","priority":"P2","kind":"优化","action":"去重节日预设、清理实现术语并整理卡片操作","acceptance":"重复New Year入口去重；隐藏/历史/到期/置顶含义清楚","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"CD-02","status":"pending","evidence":[]}}
{"original":{"id":"CD-03","priority":"P2","kind":"决策","action":"定义重复/到期动作及是否提供提醒","acceptance":"无后台动作时明确只是日期差展示；新增提醒接JOB统一机制","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"CD-03","status":"pending","evidence":[]}}
{"original":{"id":"STAT-01","priority":"P1","kind":"修复","action":"以elapsedMs统计专注，给旧schema明确兼容规则","acceptance":"提前结束、暂停、恢复的列表与KPI一致，不用配置时长代替实际时长","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"STAT-01","status":"completed","evidence":["commit:ed7009f","commit:2b1759b","../web-statistics-time-contract/20260909-stat01-fix.md","commit:ab94f84","commit:666171d","commit:e747076","../web-statistics-time-independent/20260909-independent-review.md"]}}
{"original":{"id":"STAT-02","priority":"P1","kind":"修复","action":"用真实completedAt生成任务时间序列","acceptance":"不把历史全部完成数塞到最后一天；无历史时间时只显示当前总数","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"STAT-02","status":"completed","evidence":["commit:ed7009f","../web-statistics-time-contract/20260909-diagnosis.md","commit:580bbde","../web-statistics-time-contract/20260909-stat02-consumer.md","commit:dafaf9e","commit:1b7c0e0","commit:b700096","commit:905abb7","../web-statistics-completion-independent/20260909-review.md"]}}
{"original":{"id":"STAT-03","priority":"P2","kind":"修复","action":"统一当地日/小时切片与跨午夜刷新","acceptance":"热图、小时分布、周月总计可从源记录复算","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"STAT-03","status":"pending","evidence":[]}}
{"original":{"id":"STAT-04","priority":"P2","kind":"优化","action":"明确来源、范围、分母和空态，区分专注与Time Tracker工时","acceptance":"各KPI可查看定义/明细；无数据不呈现误导性趋势或总工时承诺","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"STAT-04","status":"pending","evidence":[]}}
{"original":{"id":"BRD-01","priority":"P2","kind":"修复","action":"Kanban使用实体revision及原子移动，区分空板与模板","acceptance":"跨列移动不丢卡；同页/跨tab冲突可见；长板列头和落点清楚","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-01","status":"pending","evidence":[]}}
{"original":{"id":"BRD-02","priority":"P2","kind":"修复","action":"多看板搜索不改变删除资格，删除时清理活动板及视图引用","acceptance":"全局有多板但搜索只剩一板时仍按全局规则判断","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-02","status":"pending","evidence":[]}}
{"original":{"id":"BRD-03","priority":"P2","kind":"修复","action":"Workspace移动/删除事务化，并明确当前只是本地分组","acceptance":"移板失败可回退；Team文案不暗示已存在成员或租户授权","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-03","status":"pending","evidence":[]}}
{"original":{"id":"BRD-04","priority":"P2","kind":"修复","action":"List显示名称与语义状态分离，规范归档/恢复/删除","acceptance":"改名Done不意外改变规则；删列表前可见卡片影响及恢复路径","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-04","status":"pending","evidence":[]}}
{"original":{"id":"BRD-05","priority":"P2","kind":"修复","action":"Card归档/恢复/永久删除同步维护关联实体","acceptance":"不会遗留无法定位的Task链接；永久删除有影响说明","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-05","status":"pending","evidence":[]}}
{"original":{"id":"BRD-06","priority":"P2","kind":"修复","action":"卡片详情改局部patch和可恢复草稿，补字段错误反馈","acceptance":"不逐字符重写全部boards；非法URL/保存失败显示就地原因","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-06","status":"pending","evidence":["commit:5c6ed8e","commit:99c36b0","commit:14b044c","commit:c0cc12d","commit:97f89da","../web-board-detail-astra-final/review.md"],"partial_scope":"Three append recovery operations accepted; full card field patch and per-character whole-board rewrite requirement remains open."}}
{"original":{"id":"BRD-07","priority":"P2","kind":"修复","action":"Label目录与自动化引用保持完整","acceptance":"urgent等系统标签可识别；删标签同步处理筛选/规则/卡片引用","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-07","status":"pending","evidence":[]}}
{"original":{"id":"BRD-08","priority":"P2","kind":"文档","action":"Member目录明确为本地负责人标记","acceptance":"普通分配不显示账号邀请、在线或权限已生效；真实成员功能另走JOB","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-08","status":"pending","evidence":[]}}
{"original":{"id":"BRD-09","priority":"P2","kind":"修复","action":"统一Priority枚举、标签和筛选的组合语义","acceptance":"四级优先级一致；urgent标签与priority关系有明确规则","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-09","status":"pending","evidence":[]}}
{"original":{"id":"BRD-10","priority":"P2","kind":"修复","action":"对legacy日期做一次性可追溯迁移","acceptance":"保留原始Today/M-D值；不确定年份需确认；范围与时区校验完整","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-10","status":"pending","evidence":[]}}
{"original":{"id":"BRD-11","priority":"P2","kind":"修复","action":"Storage schema迁移允许合法空板并保留损坏副本","acceptance":"同步scope字段不被当作已接云；schema升级可复现","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-11","status":"pending","evidence":[]}}
{"original":{"id":"BRD-12","priority":"P2","kind":"决策","action":"Checklist旧计数迁移与Done自动勾选规则明确化","acceptance":"不生成看似真实的Item1标题；自动勾选可解释并可撤销","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"BRD-12","status":"pending","evidence":[]}}
{"original":{"id":"BRD-13","priority":"P2","kind":"优化","action":"Comments与activity区分人工评论和系统动态","acceptance":"标本地actor、不暗示@投递；分页/编辑/删除策略明确","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-13","status":"pending","evidence":[]}}
{"original":{"id":"BRD-14","priority":"P2","kind":"优化","action":"Attachments明确是外链并展示hostname及错误","acceptance":"不把provider标签当OAuth连接；错误链接可修正，协议限制保留","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-14","status":"pending","evidence":[]}}
{"original":{"id":"BRD-15","priority":"P1","kind":"文档","action":"Permissions/visibility明确只有本地元数据","acceptance":"Shared状态不被理解为真正授予访问；真实服务端ACL转JOB","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-15","status":"pending","evidence":[]}}
{"original":{"id":"BRD-16","priority":"P2","kind":"修复","action":"Share只在真实分享意图时发事件并处理剪贴板失败","acceptance":"关闭弹窗不记分享；mock链接边界清楚，有导出替代","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-16","status":"pending","evidence":[]}}
{"original":{"id":"BRD-17","priority":"P1","kind":"修复","action":"Automation Lite明确触发范围，修同日变更/午夜遗漏","acceptance":"显示规则、最近执行和影响；不隐式覆盖人工排序；关页调度转JOB","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-17","status":"pending","evidence":[]}}
{"original":{"id":"BRD-18","priority":"P1","kind":"修复","action":"完成Task link双向状态与生命周期合同","acceptance":"依赖TASK-02；移动、完成、撤销、删恢复、刷新全链不丢链接","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-18","status":"pending","evidence":[]}}
{"original":{"id":"BRD-19","priority":"P2","kind":"修复","action":"Saved filters清理失效引用并跟随日期变化","acceptance":"删除标签/成员后不保留坏筛选；多视图范围一致，零结果可清除","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-19","status":"pending","evidence":[]}}
{"original":{"id":"BRD-20","priority":"P2","kind":"优化","action":"Table补键盘网格、列控制与大数据性能","acceptance":"编辑持久化正确；排序/隐藏/列宽可用；达到测量阈值后虚拟化","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-20","status":"pending","evidence":[]}}
{"original":{"id":"BRD-21","priority":"P2","kind":"修复","action":"Board Calendar明确拖动修改due还是整个区间","acceptance":"日期范围合法；触屏可点选移动日期；跨月/DST回归通过","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-21","status":"pending","evidence":[]}}
{"original":{"id":"BRD-22","priority":"P1","kind":"修复","action":"Board Dashboard逾期统计排除已完成卡或明确范围","acceptance":"isOpen与列表过滤共用；KPI可钻取相同记录","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-22","status":"pending","evidence":[]}}
{"original":{"id":"BRD-23","priority":"P2","kind":"优化","action":"Timeline增加未排期/远期定位和键盘日期编辑","acceptance":"区间移动resize原子；远期卡不因30日窗口而失去访问路径","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-23","status":"pending","evidence":[]}}
{"original":{"id":"BRD-24","priority":"P2","kind":"修复","action":"Map支持当前语言、tile失败、离线和重试","acceptance":"地图不可用时有位置列表；保留视角且可取消加载","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-24","status":"pending","evidence":[]}}
{"original":{"id":"BRD-25","priority":"P2","kind":"修复","action":"Inbox转移到Board使用事务或可恢复命令","acceptance":"崩溃/重试不丢不重复，目标明确并可撤销","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-25","status":"pending","evidence":[]}}
{"original":{"id":"BRD-26","priority":"P1","kind":"修复","action":"Planner移除伪造9/11/13点安排和未标记样例","acceptance":"真实时间未建模前显示今日到期清单；超过6卡仍完整可达","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-26","status":"pending","evidence":[]}}
{"original":{"id":"BRD-27","priority":"P2","kind":"修复","action":"Board Calendar feed统一范围投影和来源跳转","acceptance":"依赖CAL-02；日详情不漏卡、起止范围完整；只读投影不暗示双向同步","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-27","status":"pending","evidence":[]}}
{"original":{"id":"BRD-28","priority":"P2","kind":"决策","action":"将Board导入导出合同接成可用备份入口或明确尚无UI","acceptance":"导出预览、schema/引用校验、试恢复和错误回滚可验证","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"BRD-28","status":"pending","evidence":[]}}
{"original":{"id":"BRD-29","priority":"P2","kind":"核验","action":"对Board所有视图补真实响应式及辅助技术验收","acceptance":"375/768/1440、200%缩放、软键盘、触屏、键盘DnD与多层弹窗焦点","status":"待复核/待办","module":"web","gate":"当前范围","source":"02-tasks-time-boards.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BRD-29","status":"pending","evidence":[]}}
{"original":{"id":"DASH-01","priority":"P2","kind":"修复","action":"Grid空态按visible order判定，补键盘重排/尺寸和Undo","acceptance":"删除最后组件后能添加；拖动仅提交时落盘；静态组件不随秒tick全量重算","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"DASH-01","status":"pending","evidence":[]}}
{"original":{"id":"DASH-02","priority":"P2","kind":"核验","action":"Clock明确选择时区、无效时区恢复及DST","acceptance":"系统时区与自选时区区分，半小时时区和跨日正确","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"DASH-02","status":"pending","evidence":[]}}
{"original":{"id":"DASH-03","priority":"P2","kind":"决策","action":"World Clocks允许清空或解释最后城市不可删","acceptance":"添加/删除/重开状态一致，日期差标签清楚","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"DASH-03","status":"pending","evidence":[]}}
{"original":{"id":"DASH-04","priority":"P2","kind":"优化","action":"Stat Tasks说明当前总量或今日范围并精确跳转","acceptance":"图中分母可解释；点击落到相同过滤条件","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-04","status":"pending","evidence":[]}}
{"original":{"id":"DASH-05","priority":"P2","kind":"优化","action":"Stat Streak显示所属习惯及连胜定义","acceptance":"最大单习惯连胜不被误读成全部习惯共同达成","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-05","status":"pending","evidence":[]}}
{"original":{"id":"DASH-06","priority":"P2","kind":"决策","action":"Stat Pomos的8点展示与真实目标接线或标为刻度","acceptance":"超目标/未设目标可理解，统计使用当地日","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"DASH-06","status":"pending","evidence":[]}}
{"original":{"id":"DASH-07","priority":"P2","kind":"修复","action":"Time Tracker widget与主体共用订阅和聚合","acceptance":"今日累计与当前总计分开；暂停/结束可达且遵守TT合同","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-07","status":"pending","evidence":[]}}
{"original":{"id":"DASH-08","priority":"P2","kind":"修复","action":"Weather增加可见时TTL检查、online重试和手动刷新","acceptance":"缓存陈旧/手动值/来源/更新时间始终可辨，失败可恢复","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-08","status":"pending","evidence":[]}}
{"original":{"id":"DASH-09","priority":"P2","kind":"修复","action":"Mini Calendar使用统一事件查询并定位所选日期","acceptance":"与主日历日期、周起始和事件点一致","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-09","status":"pending","evidence":[]}}
{"original":{"id":"DASH-10","priority":"P2","kind":"修复","action":"Stickies默认设置接线并恢复编辑草稿","acceptance":"颜色/字体等影响新便签；删除可撤销，拖动/resize有键盘替代","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-10","status":"pending","evidence":[]}}
{"original":{"id":"DASH-11","priority":"P2","kind":"优化","action":"Mail摘要明确非Push并加入来源定位/已读策略","acceptance":"点击定位实体；无数据为空态，不冒充邮件或系统通知","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-11","status":"pending","evidence":[]}}
{"original":{"id":"DASH-12","priority":"P2","kind":"修复","action":"Upcoming复用主日历重复事件查询和deep link","acceptance":"最多展示条数有说明；DST/例外规则一致，点击定位事件","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"DASH-12","status":"pending","evidence":[]}}
{"original":{"id":"AI-01","priority":"P1","kind":"修复","action":"普通多轮发送携带有预算的历史消息","acceptance":"第二轮请求包含第一轮信息；截断与工具往返保留原始用户意图","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-01","status":"pending","evidence":[]}}
{"original":{"id":"AI-02","priority":"P1","kind":"修复","action":"工具动作等待业务持久回执再向模型报告成功","acceptance":"quota/非法ID/不存在/无subscriber不报success；requestId幂等","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"AI-02","status":"in_progress","evidence":["commit:bce7fc8","../web-ai-tool-write-receipts/20260909-create-retry-fix.md","commit:e45f78e","commit:c353e71","commit:daff8ef","../web-ai-tool-receipt-fix/handoff.md","commit:905b116","../web-canonical-receipt-migration-inventory/review.md","commit:dd10cb8","../web-ai-calendar-invalid-date/review.md","commit:9df552e","../web-ai-tool-receipt-astra-review/review.md","commit:e50ca1c","../web-ai-calendar-validation-fix/review.md","commit:afd10ff","commit:2d74022","../web-ai-tool-receipt-sol-independent/review.md","commit:8bcd1d6","commit:fd1dce1","commit:20a0748","commit:ecb588c","commit:a9b88ba","commit:8045d5d","../web-board-workspace-astra-review/20260909-a1-astra-entry-gate.md","commit:3241ffd","../web-canonical-preflight-current/CHECKLIST.md","commit:1364de5","commit:501feb7","../web-board-workspace-astra-review/20260909-canonical-old-client-rollout-gate.md","commit:fb3ae2f","../web-ai-canonical-receipts-fix/20260909-b1-compatibility.md","commit:1831585","../web-canonical-remove-read-failure/review.md","commit:7c59d3f","commit:7b584b3","commit:96df149","commit:de3bf16","../web-board-workspace-astra-review/20260909-b1-decoder-review.md","commit:5c13fec","../web-ai-canonical-receipts-fix/20260909-b2-compatibility-callers.md","commit:b20c7ea","../web-board-workspace-astra-review/20260909-b2-compatibility-review.md","commit:aca0193","commit:19cfee4","../web-board-workspace-astra-review/20260909-b2-aca0193-acceptance.md","commit:0ed1582","../web-canonical-migration-write-race/review.md","commit:fa90dae","commit:946ded3","../web-board-workspace-astra-review/20260909-c-primitive-test-preparation.md","commit:37252bc","../web-ai-canonical-primitive-sol-fix/review.md","commit:782f7b7","commit:7d41627","../web-canonical-primitive-native/review.md","commit:7b95133","../web-board-workspace-astra-review/20260909-d1-ordinary-writer-contract.md","commit:113e12f","../web-canonical-primitive-browser-reopen/review.md","commit:3a764a1","commit:06e4a1b","../web-canonical-ordinary-writer-review/review.md","commit:151982b","commit:3e0b611","commit:496039f","commit:4c3832c","commit:a246836","../web-board-workspace-astra-review/20260909-d1-496039f-review.md","commit:863e738","commit:f764731","commit:e407967","../web-board-workspace-astra-review/20260909-d1-f764731-rereview.md","commit:db1eddc","commit:adc1202","commit:d8412d3","commit:4202c79","../web-ai-canonical-subscribers-sol-fix/review.md","commit:d24c564","commit:1d7773a","commit:646a539","../web-canonical-six-subscriber-native/review.md","../web-ai-canonical-continuation-native/review.md","commit:c58a647","../web-board-workspace-astra-review/20260909-d1-d8412d3-reset-acceptance.md","commit:5c0f46d","commit:51338e0","commit:66a8488","commit:74565a6","commit:4584ceb","commit:35b4964","../web-tasks-canonical-ui-independent/review.md","commit:45c74c3","../web-board-workspace-astra-review/20260909-six-subscribers-4202c79-review.md","commit:0a294bc","commit:8503b71","../web-tasks-canonical-ui-independent/tasks-ui-retry-35b4964.log","commit:6efba71","commit:1998df3","commit:9a7e66b","../web-calendar-d1-fixture-repair/20260909-calendar-fixture-repair.md","commit:1829c3a","../web-board-canonical-link-independent/review.md","commit:56f1aaf","commit:1660df9","../web-board-workspace-astra-review/20260909-calendar-fixtures-9a7e66b-acceptance.md","commit:b899396","../web-tasks-canonical-ui-native/review.md","commit:6a1adac","../web-board-canonical-link-independent/board-link-6a1adac.log","commit:3241529","commit:2ca5b93","commit:b4344a4","../web-board-workspace-astra-review/20260909-board-d1-6a1adac-review.md","commit:728822d","commit:ab3a150","commit:2fed984","commit:7f19aec","commit:0143952","../web-board-workspace-astra-review/20260909-tasks-d1-3241529-review.md","commit:0b3a043","commit:bf2935b","commit:4e9ff08","commit:54b422c","commit:170c526","commit:a4f6369","commit:8d1fb07","commit:f3a519c","commit:e9ff409","commit:45b83b6","commit:0c4b6b4","commit:aa747d4","commit:080f86b","commit:e9fb5e7","commit:40e4adb","commit:c201a1d","commit:96aa7b1","commit:dbc2e69","commit:33832b1","commit:ec8f86e","commit:0203c56","commit:ea5ba0b","commit:c5a4347","commit:fe2aa90","commit:8679232","commit:51ae929","commit:10c208e","commit:051d7fa","commit:a6ad06d","commit:cc70314"]}}
{"original":{"id":"AI-03","priority":"P1","kind":"修复","action":"为生成过程增加queued/running/completed/interrupted/failed状态","acceptance":"切路由/断网/重开保留已生成内容并标中断；不把partial当完整回答","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-03","status":"pending","evidence":[]}}
{"original":{"id":"AI-04","priority":"P2","kind":"修复","action":"输入改多行并处理中文IME、Shift+Enter、粘贴和高度","acceptance":"选候选不误发送；提示与真实快捷键一致","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-04","status":"pending","evidence":[]}}
{"original":{"id":"AI-05","priority":"P2","kind":"文档","action":"附件和语音未闭环时禁用或标明未支持","acceptance":"文件chip不暗示内容已发送；真实实现转JOB，不把metadata当附件处理","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-05","status":"pending","evidence":[]}}
{"original":{"id":"AI-06","priority":"P2","kind":"修复","action":"Provider切换和key读写增加错误/加载/取消与generation保护","acceptance":"旧provider响应不覆盖新状态；无未处理IDB异常，配置错误文案明确","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-06","status":"pending","evidence":[]}}
{"original":{"id":"AI-07","priority":"P2","kind":"优化","action":"消息分条存储、节流checkpoint并设容量策略","acceptance":"长会话不每chunk重写全部历史；保存失败可恢复且不泄露key","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-07","status":"pending","evidence":[]}}
{"original":{"id":"AI-08","priority":"P2","kind":"优化","action":"工具确认展示改前改后、来源、删除影响与撤销","acceptance":"刷新后未确认动作不自动执行；重试不能重复创建或删除","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-08","status":"pending","evidence":[]}}
{"original":{"id":"AI-09","priority":"P2","kind":"优化","action":"减弱装饰背景并让starter/洞察只指向真实能力","acceptance":"来源、范围、provider/model和浏览器本地BYOK边界清楚","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"AI-09","status":"pending","evidence":[]}}
{"original":{"id":"BK-01","priority":"P1","kind":"修复","action":"完善账本schema验证和保存失败反馈，分离空账本/演示数据","acceptance":"损坏数据不覆为样例；新用户净资产不混示例；遵守REL账户/存储合同","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-01","status":"pending","evidence":[]}}
{"original":{"id":"BK-02","priority":"P1","kind":"修复","action":"金额采用最小货币单位或decimal并集中校验","acceptance":"金额finite/正负语义/极大值/币种/账户校验一致，编辑撤销旧余额后准确重算","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-02","status":"pending","evidence":[]}}
{"original":{"id":"BK-03","priority":"P1","kind":"修复","action":"规则文本识别先预览，避免日期数字被当金额","acceptance":"9月8日午饭38元解析为38或要求确认；自定义账户引用有效，标明规则识别","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-03","status":"pending","evidence":[]}}
{"original":{"id":"BK-04","priority":"P2","kind":"优化","action":"看板、日历、明细共享账本和月份范围","acceptance":"来源/范围可见；点击某日展示同批交易；保存/错误/空态一致","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-04","status":"pending","evidence":[]}}
{"original":{"id":"BK-05","priority":"P2","kind":"修复","action":"搜索包含显示名称，优化大列表与过滤恢复","acceptance":"账户/分类中文名可搜索；无结果可清筛选，性能有测量基线","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-05","status":"pending","evidence":[]}}
{"original":{"id":"BK-06","priority":"P1","kind":"修复","action":"汇率和投资币种建模，修复非CNY一律按USD折算","acceptance":"EUR/JPY等用正确报价币种；历史汇率快照和手动估值日期明确","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-06","status":"pending","evidence":[]}}
{"original":{"id":"BK-07","priority":"P2","kind":"决策","action":"预算按账本与期间建实体并确定结转规则","acceptance":"不同账本/月份预算不串用；默认5000只存在明确示例模式","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"BK-07","status":"pending","evidence":[]}}
{"original":{"id":"BK-08","priority":"P1","kind":"决策","action":"确定删除账户/账本对历史与余额的规则并事务执行","acceptance":"优先归档；不无声改写历史账户或遗留余额；有invariant回归","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"BK-08","status":"pending","evidence":[]}}
{"original":{"id":"BK-09","priority":"P2","kind":"修复","action":"周期记账增加发生项去重，明确当前为手动模板","acceptance":"同一occurrence重试不重复入账；补记可预览；关页执行转JOB","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-09","status":"pending","evidence":[]}}
{"original":{"id":"BK-10","priority":"P1","kind":"修复","action":"CSV使用标准解析/转义、列映射、转账双边与重复检测","acceptance":"含逗号/换行、转账和多币种往返正确；微信/支付宝仅对实际支持格式声明","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-10","status":"pending","evidence":[]}}
{"original":{"id":"BK-11","priority":"P2","kind":"补全","action":"增加版本化完整备份及dry-run恢复","acceptance":"账户/交易/预算/规则/私密报销等声明字段完整，错误回滚、重复导入幂等","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-11","status":"pending","evidence":[]}}
{"original":{"id":"BK-12","priority":"P2","kind":"优化","action":"完善账单删除撤销、图表数据表和录入焦点","acceptance":"主录入入口集中；键盘可达，图表可钻取相同记录","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"BK-12","status":"pending","evidence":[]}}
{"original":{"id":"MET-01","priority":"P2","kind":"修复","action":"个人参数和体重初始为空，校验正数/finite并正确换算单位","acceptance":"示例独立；178/70不假装用户已设置；kg/斤切换保留原值，跨tab草稿不覆盖","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"MET-01","status":"pending","evidence":[]}}
{"original":{"id":"MET-02","priority":"P2","kind":"修复","action":"统一趋势范围、午夜刷新与无数据状态","acceptance":"列表/图表/分享范围分别标具体日期；长期打开不会停在旧日","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"MET-02","status":"pending","evidence":[]}}
{"original":{"id":"MET-03","priority":"P2","kind":"补全","action":"区分文字分享、图片分享与结构化数据备份","acceptance":"图片真正作为file分享或下载；JSON/CSV可恢复，空数据导出有说明","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"MET-03","status":"pending","evidence":[]}}
{"original":{"id":"MET-04","priority":"P2","kind":"优化","action":"共享可访问弹窗并补删除Undo和恢复草稿","acceptance":"Escape、焦点循环、背景inert可用；删除可撤销，不把指标趋势简单标为健康结论","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"MET-04","status":"pending","evidence":[]}}
{"original":{"id":"MET-05","priority":"P3","kind":"决策","action":"保留睡眠/饮水/运动Planned边界，另行确定扩展需求","acceptance":"未实现指标不改成可用入口，也不算本次bug必须补齐","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"MET-05","status":"pending","evidence":[]}}
{"original":{"id":"SET-01","priority":"P2","kind":"修复","action":"设置shell收敛host/package重复渲染并修共享Toggle","acceptance":"统一composition、nav及aria-current；44px点击外壳内轨道保持46×26；14面板回归","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-01","status":"pending","evidence":[]}}
{"original":{"id":"SET-02","priority":"P2","kind":"修复","action":"Appearance统一自动保存或编辑后保存语义，完成fontScale接线","acceptance":"实际正文随字号缩放；主题/语言/密度跨tab一致，非法值有fallback","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-02","status":"pending","evidence":["commit:2f728f1","commit:51db323","../web-appearance-recovery-contract/contract.md","commit:a560863","../web-appearance-recovery-acceptance/acceptance-419e56d.md"]}}
{"original":{"id":"SET-03","priority":"P2","kind":"决策","action":"Features目录由模块注册驱动并明确哪些可关闭","acceptance":"新增Time Tracker/Bookkeeping/Metrics处置明确；关闭后的rail/search/deep-link一致","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"SET-03","status":"pending","evidence":["commit:eabd47f","commit:f7726d7","../web-apprail-order-recovery-contract/contract.md","commit:ae7b69e","../web-apprail-order-recovery-native/review-controls-protection-export-f9eb4b1.md","commit:efe05ea","../web-apprail-order-recovery-acceptance/acceptance-f9eb4b1.md"]}}
{"original":{"id":"SET-04","priority":"P2","kind":"修复","action":"Account使用真实session资料并统一退出action","acceptance":"设置与头像菜单退出均有效；头像编辑/升级无能力时禁用；删除范围明确","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-04","status":"pending","evidence":[]}}
{"original":{"id":"SET-05","priority":"P1","kind":"文档","action":"Premium持续保留UX preview边界","acceptance":"session_id回调不当真实权益；支付未配置时禁用；生产计费转JOB","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-05","status":"pending","evidence":[]}}
{"original":{"id":"SET-06","priority":"P2","kind":"修复","action":"Smart Lists偏好接入真实任务selector和可见性","acceptance":"切换设置后任务列表和计数真实变化，重开保留","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-06","status":"pending","evidence":[]}}
{"original":{"id":"SET-07","priority":"P1","kind":"修复","action":"Notifications拆分应用内/浏览器/离页推送并显示能力状态","acceptance":"权限unsupported/denied/granted可见；勿扰跨夜正确；未安排不报成功","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-07","status":"pending","evidence":[]}}
{"original":{"id":"SET-08","priority":"P2","kind":"修复","action":"Date & Time接入日历/时钟统一合同","acceptance":"周起始/周数/节日等按支持范围生效；显示时区与IANA时区选择分开","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-08","status":"pending","evidence":[]}}
{"original":{"id":"SET-09","priority":"P2","kind":"修复","action":"More按host能力处理原生开关并接通任务默认值","acceptance":"Web不假装launch/tray可用；模板可应用或标示只读；伪checkbox改原生语义","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-09","status":"pending","evidence":[]}}
{"original":{"id":"SET-10","priority":"P1","kind":"文档","action":"Integrations对未配置clientId禁用连接并准确显示stub","acceptance":"不因本地connected布尔值宣称数据同步；失败可见；真实OAuth转JOB","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-10","status":"pending","evidence":[]}}
{"original":{"id":"SET-11","priority":"P2","kind":"文档","action":"Collaborate区分头像外观与成员/权限/mention通知","acceptance":"安全类偏好不假装已生效；真实权限接后端后验收","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-11","status":"pending","evidence":[]}}
{"original":{"id":"SET-12","priority":"P2","kind":"修复","action":"Sticky默认颜色/字体/间距/尺寸设置接入创建和渲染","acceptance":"新便签默认与已有便签批量应用分开；native pin能力按host说明","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-12","status":"pending","evidence":[]}}
{"original":{"id":"SET-13","priority":"P2","kind":"修复","action":"Hotkeys帮助从实际command registry生成","acceptance":"不宣传未实现的Cmd+C/T/P；按OS和焦点范围显示，避免浏览器保留键","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-13","status":"pending","evidence":[]}}
{"original":{"id":"SET-14","priority":"P2","kind":"补全","action":"About接真实build版本、帮助、反馈及政策入口","acceptance":"链接可达且中英一致，Coming soon不被当已上线服务","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-14","status":"pending","evidence":[]}}
{"original":{"id":"SET-15","priority":"P2","kind":"修复","action":"AI设置完善保存/测试/失败/取消状态","acceptance":"依赖AI-06和REL-02；快速切provider无竞态，测试连接的真实请求行为明确","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SET-15","status":"pending","evidence":[]}}
{"original":{"id":"SHELL-01","priority":"P2","kind":"优化","action":"主导航提供清晰模块名称和常用/更多入口","acceptance":"移动端账户/设置可达；图标不完全依赖hover记忆","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"SHELL-01","status":"pending","evidence":[]}}
{"original":{"id":"SHELL-02","priority":"P2","kind":"修复","action":"CmdK补日历事件、AI会话、时间记录、账单及指标实体索引","acceptance":"统一模块/记录分组，禁用功能不泄漏入口，结果定位实体","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"SHELL-02","status":"pending","evidence":[]}}
{"original":{"id":"SHELL-03","priority":"P2","kind":"优化","action":"CmdK定义索引更新和无结果策略","acceptance":"修改后重新打开结果最新；若需开着实时更新则订阅数据版本；键盘焦点回收正常","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"SHELL-03","status":"pending","evidence":[]}}
{"original":{"id":"SHELL-04","priority":"P2","kind":"修复","action":"统一root偏好值域校验与跨tab订阅","acceptance":"主题/语言/fontScale异常不抛出导致白屏；切tab后表现一致","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"SHELL-04","status":"pending","evidence":["commit:72538d1","../web-appearance-recovery-native/before-5cd63ff.md","commit:32e6753","../web-appearance-recovery-native/review-host-downstream-retryall-24073b5.md","commit:a560863","../web-appearance-recovery-acceptance/acceptance-419e56d.md","commit:04ee6a2","../web-apprail-order-recovery-native/before-419e56d.md","commit:55cf1e9","../web-apprail-order-recovery-native/review-downstream-visual-f9eb4b1.md","commit:efe05ea","../web-apprail-order-recovery-acceptance/acceptance-f9eb4b1.md"]}}
{"original":{"id":"SHELL-05","priority":"P2","kind":"修复","action":"Web Pet保存隐藏偏好并在拖动结束后持久化位置","acceptance":"重开不强制显示；位置不越安全区，不每pointermove同步写盘","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"SHELL-05","status":"pending","evidence":["commit:5905e37","../web-features-recovery-native/review-visual-keyboard-5cd63ff.md","commit:ec55f9e","../web-features-recovery-acceptance/acceptance-5cd63ff.md"]}}
{"original":{"id":"SHELL-06","priority":"P2","kind":"优化","action":"桌宠避让核心操作、支持键盘/关闭和reduced-motion","acceptance":"专注/录入不被遮挡；超时任务有清理，无障碍对话框可用","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"SHELL-06","status":"pending","evidence":[]}}
{"original":{"id":"SHELL-07","priority":"P3","kind":"决策","action":"区分静态鼓励文案、习惯徽章与统一成就系统","acceptance":"不宣传未实现的AI或成就账本；统一成就若立项需事件ID、重算与撤销规则","status":"待复核/待办","module":"web","gate":"当前范围","source":"03-web-data-ai-settings.md;05-visual-ux-audit.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"SHELL-07","status":"pending","evidence":[]}}
{"original":{"id":"UX-01","priority":"P2","kind":"优化","action":"建立统一页面标题、toolbar、表单、dialog和状态反馈规范","acceptance":"参考当前DESIGN与tokens；跨模块加载/空/错误/未保存/恢复状态一致","status":"待复核/待办","module":"web","gate":"当前范围","source":"05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"UX-01","status":"pending","evidence":[]}}
{"original":{"id":"UX-02","priority":"P2","kind":"优化","action":"重排看板标题和工具栏，收起归档/自动化/分享等次要动作","acceptance":"标题不挤成三行；主视图和过滤清楚；Archived两个入口含义区分","status":"待复核/待办","module":"web","gate":"当前范围","source":"05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web","normalized_module":"web","execution":{"id":"UX-02","status":"pending","evidence":[]}}
{"original":{"id":"UX-03","priority":"P2","kind":"优化","action":"加入全局活动会话入口并处理移动底栏/面板/宠物避让","acceptance":"开始、暂停、结束和回来源可达；不被浮层/软键盘盖住","status":"待复核/待办","module":"web","gate":"当前范围","source":"05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"UX-03","status":"pending","evidence":["commit:5905e37","../web-features-recovery-native/review-visual-keyboard-5cd63ff.md","commit:ec55f9e","../web-features-recovery-acceptance/acceptance-5cd63ff.md"]}}
{"original":{"id":"UX-04","priority":"P2","kind":"修复","action":"统一真实数据、样例、手动值、未实现与只读能力的标识","acceptance":"个人工作空间默认空态；未接线控件无成功假象，不泄漏开发术语","status":"待复核/待办","module":"web","gate":"当前范围","source":"05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"UX-04","status":"pending","evidence":[]}}
{"original":{"id":"UX-05","priority":"P2","kind":"核验","action":"完成键盘、焦点、触屏、大字号、暗色和对比度验收","acceptance":"375/390/768/1440、200%缩放、中英长文、读屏/键盘有实际证据","status":"待复核/待办","module":"web","gate":"当前范围","source":"05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"UX-05","status":"pending","evidence":["commit:bacdbbc","../web-appearance-recovery-native/review-visual-keyboard-5bbf473.md","commit:5766c1e","../web-appearance-recovery-terra/implementation-r3.md","commit:2696855","../web-appearance-recovery-native/review-visual-keyboard-419e56d.md","commit:55cf1e9","../web-apprail-order-recovery-native/review-downstream-visual-f9eb4b1.md","commit:5c6bcd2","../web-apprail-order-recovery-native/review-keyboard-f9eb4b1.md","commit:efe05ea","../web-apprail-order-recovery-acceptance/acceptance-f9eb4b1.md"]}}
{"original":{"id":"UX-06","priority":"P3","kind":"优化","action":"逐步减少808项历史颜色字面量并收敛过度blur/嵌套卡片","acceptance":"语义token覆盖实际元素；保持数据密度，不机械套营销页风格","status":"待复核/待办","module":"web","gate":"当前范围","source":"05-visual-ux-audit.md"},"primary_workflow":"A","original_module":"web","normalized_module":"web","execution":{"id":"UX-06","status":"pending","evidence":[]}}
{"original":{"id":"UX-07","priority":"P2","kind":"核验","action":"建立真实设备截图与交互回归基线","acceptance":"修复移动采集缩放条件；截图像素不误作CSS像素；关键交互不只做CSS断言","status":"待复核/待办","module":"web","gate":"当前范围","source":"05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"UX-07","status":"pending","evidence":[]}}
{"original":{"id":"DEP-01","priority":"P1","kind":"修复","action":"恢复Cloudflare token/账号/Pages权限并验证preview发布","acceptance":"实际credential检查与部署成功；不只因build通过就宣称发布正常","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-01","status":"pending","evidence":[]}}
{"original":{"id":"DEP-02","priority":"P1","kind":"核验","action":"确认真实生产部署ID、时间、source SHA和artifact hash","acceptance":"通过平台部署记录/版本端点核对，线上与待发差异可见","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-02","status":"pending","evidence":[]}}
{"original":{"id":"DEP-03","priority":"P1","kind":"修复","action":"统一GitHub构建环境变量来源并校验必需配置","acceptance":"direct upload前注入公开VITE配置；Pages后台变量不再被误认为可修改已构建JS","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-03","status":"pending","evidence":[]}}
{"original":{"id":"DEP-04","priority":"P1","kind":"文档","action":"明确production/preview分支及公开Demo auth边界","acceptance":"Web代码合入、main、preview和production状态分列；真实账号开放另走门槛","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-04","status":"pending","evidence":[]}}
{"original":{"id":"DEP-05","priority":"P1","kind":"修复","action":"Service Worker预缓存完整版本化HTML/JS/CSS等启动资源","acceptance":"真实浏览器断网冷启动各核心入口可用；缓存失败有恢复路径","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-05","status":"pending","evidence":[]}}
{"original":{"id":"DEP-06","priority":"P1","kind":"修复","action":"建立SW更新、旧HTML与chunk一致性及安全重载机制","acceptance":"新旧版本切换不白屏；草稿不丢；坏部署能回退可用壳","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-06","status":"pending","evidence":[]}}
{"original":{"id":"DEP-07","priority":"P2","kind":"决策","action":"明确公开sourcemap策略并接私有错误映射","acceptance":"若私有化则发布目录不含map；若保留公开则有明确决策和secret扫描","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-07","status":"pending","evidence":[]}}
{"original":{"id":"DEP-08","priority":"P1","kind":"修复","action":"校验生产CSP/headers与AI/Auth/地图等真实依赖域","acceptance":"构建预期与HTTP响应一致；允许/拒绝场景实测，启用auth不因域阻断","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-08","status":"pending","evidence":[]}}
{"original":{"id":"DEP-09","priority":"P1","kind":"补全","action":"部署gate串联类型检查、关键生命周期测试和build浏览器smoke","acceptance":"失败阻止发布；有并发发布控制、部署回执与回滚路径","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-09","status":"pending","evidence":[]}}
{"original":{"id":"DEP-10","priority":"P1","kind":"补全","action":"接通RUM/Sentry实际ingest、flush和release SHA","acceptance":"定时/pagehide批量发送有上限；真实错误在接收端可查，失败不悄悄丢弃","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-10","status":"pending","evidence":[]}}
{"original":{"id":"DEP-11","priority":"P1","kind":"核验","action":"修正Supabase runbook与可部署入口的差异","acceptance":"空staging可按文档完成迁移、functions与验证；501/无入口不能列为可用服务","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-11","status":"pending","evidence":[]}}
{"original":{"id":"DEP-12","priority":"P2","kind":"补全","action":"发布后按线上版本验证关键功能并回填开发看板","acceptance":"线上/验证/源码SHA一致可查；部署失败与待发功能明确显示","status":"待复核/待办","module":"web","gate":"当前范围","source":"04-deployment-platform.md"},"primary_workflow":"D","original_module":"web","normalized_module":"web","execution":{"id":"DEP-12","status":"pending","evidence":[]}}
{"original":{"id":"JOB-01","priority":"P1","kind":"决策","action":"为每类功能确定仅重开补算还是关页后准时执行","acceptance":"任务、习惯、番茄、日历、看板、记账、AI分别写合同；列支持浏览器/离线/退出情况","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-01","status":"pending","evidence":[]}}
{"original":{"id":"JOB-02","priority":"P1","kind":"建设","action":"建立持久jobs/outbox、状态查询、幂等、重试与死信","acceptance":"关闭客户端后任务仍可追踪；重复提交/执行不重复副作用，失败可恢复","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-02","status":"pending","evidence":[]}}
{"original":{"id":"JOB-03","priority":"P1","kind":"建设","action":"实现提醒调度与Web Push投递，消费权限及勿扰设置","acceptance":"关页真实投递、过期/取消/跨时区/跨夜勿扰可验证；不以SW常驻为假设","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-03","status":"pending","evidence":[]}}
{"original":{"id":"JOB-04","priority":"P1","kind":"建设","action":"把需要无人值守的Board自动化与周期记账接持久计划","acceptance":"每occurrence有执行记录；补跑/取消/重试不重复，影响记录可审计","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-04","status":"pending","evidence":[]}}
{"original":{"id":"JOB-05","priority":"P1","kind":"建设","action":"如需AI离页完成，任务先持久化再执行并支持重新订阅","acceptance":"重开按jobId/cursor获取结果；取消/重试/计费幂等明确","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-05","status":"pending","evidence":[]}}
{"original":{"id":"JOB-06","priority":"P2","kind":"建设","action":"如需真实附件与语音，完成读取/解析/上传和录音STT/TTS","acceptance":"mime/大小/权限/解析中/失败/取消、token预算和用户确认齐全","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-06","status":"pending","evidence":[]}}
{"original":{"id":"JOB-07","priority":"P1","kind":"建设","action":"如需真实协作，建设成员、ACL、分享token与撤销","acceptance":"权限在服务端强制；过期/跨账号/撤销/mention投递有正负例","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-07","status":"pending","evidence":[]}}
{"original":{"id":"JOB-08","priority":"P1","kind":"建设","action":"如需真实Notion/GCal/Linear集成，完成后端OAuth与数据同步","acceptance":"token交换/保存/刷新/撤销、provider错误、增量拉取和重试真实有效","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-08","status":"pending","evidence":[]}}
{"original":{"id":"JOB-09","priority":"P1","kind":"建设","action":"如需真实Premium，接服务端权益和支付webhook","acceptance":"签名验证、重放幂等、真实取消/对账可用；客户端session_id不能授予权益","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-09","status":"pending","evidence":[]}}
{"original":{"id":"JOB-10","priority":"P1","kind":"建设","action":"如需账号删除服务，建立持久删除任务及进度/完成回执","acceptance":"离页继续、失败重试、最终清理可查；本地与云删除范围独立确认","status":"受门禁约束/待办","module":"web","gate":"新增能力须先明确承诺和对应路线图","source":"02-tasks-time-boards.md;03-web-data-ai-settings.md;04-deployment-platform.md"},"primary_workflow":"C","original_module":"web","normalized_module":"web","execution":{"id":"JOB-10","status":"pending","evidence":[]}}
{"original":{"id":"GOV-01","priority":"P1","kind":"修复","action":"修dev_log解析器遗漏19项并保留不可解析记录","acceptance":"表格/bullet/纯文本/Status标题和多迭代fixture通过；discovered/parsed/unparsed逐文件对账","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-01","status":"pending","evidence":[]}}
{"original":{"id":"GOV-02","priority":"P2","kind":"修复","action":"修roadmap解析器漏3份AI文档，表头#可选","acceptance":"全部167个slug可解析；Slug/Status/Source/Depends On结构校验可见","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-02","status":"pending","evidence":[]}}
{"original":{"id":"GOV-03","priority":"P2","kind":"修复","action":"按Target及iteration定位状态并对账11项陈旧manifest","acceptance":"不再只取首个Status；对应SHIPPED证据、最新更新时间和历史迭代可追溯","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-03","status":"pending","evidence":[]}}
{"original":{"id":"GOV-04","priority":"P2","kind":"文档","action":"校准CmdK、Time Tracker、Bookkeeping、Metrics等状态和日志字段","acceptance":"实现/独立验证/发布分别记录；不因已合入倒推验证通过","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-04","status":"pending","evidence":[]}}
{"original":{"id":"GOV-05","priority":"P2","kind":"文档","action":"补AI、Countdown、Habits、Matrix、Meditation、Metrics、Pet、Statistics、Time Tracker九份canonical PRD","acceptance":"按用户能力而非npm包建档；需求→实现→测试→发布有链，未确认需求不臆造","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-05","status":"pending","evidence":[]}}
{"original":{"id":"GOV-06","priority":"P2","kind":"文档","action":"统一六模块、分支存在性、G1与Organizer冻结例外的authority镜像","acceptance":"CLAUDE/AGENTS/Cursor/模块图一致；独立web/dev正常分叉不当错误合并","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-06","status":"pending","evidence":[]}}
{"original":{"id":"GOV-07","priority":"P2","kind":"文档","action":"清理PLUGIN_MAP的旧Next.js、无音频、统计代理与陈旧状态描述","acceptance":"历史与当前分区；Stable和最新迭代状态分列；真实运行包和文档anchor区分","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-07","status":"pending","evidence":[]}}
{"original":{"id":"GOV-08","priority":"P2","kind":"修复","action":"区分package/roadmap/route/rail/panel并自动生成计数","acceptance":"24切片不称24模块；14设置面板及新增功能从registry得到","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-08","status":"pending","evidence":[]}}
{"original":{"id":"GOV-09","priority":"P2","kind":"修复","action":"Overview显示解析覆盖、冲突、验证SHA、线上SHA与近期失败","acceptance":"快照fresh仅代表采集时间；首屏阻塞优先，帮助说明折叠","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-09","status":"pending","evidence":[]}}
{"original":{"id":"GOV-10","priority":"P2","kind":"修复","action":"Testing按feature+workflow+ref组织当前和历史结果","acceptance":"pass/fail/partial/unknown含义明确；0失败不暗示验证完成，旧配置/运行记录去重","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-10","status":"pending","evidence":[]}}
{"original":{"id":"GOV-11","priority":"P2","kind":"治理","action":"登记全部延期gate的owner、截止日、环境和验证证据","acceptance":"24h carve-out不无限延期；到期显示overdue，未填checklist不算smoke","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-11","status":"pending","evidence":[]}}
{"original":{"id":"GOV-12","priority":"P2","kind":"优化","action":"Skill/Agent界面区分源维护完整度与生成补齐","acceptance":"66/66可展示与1/66源完整不混淆；65项补齐不是65个坏技能","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-12","status":"pending","evidence":[]}}
{"original":{"id":"GOV-13","priority":"P3","kind":"文档","action":"更新开发看板TEMPLATE/DESIGN及设计目录归档说明","acceptance":"历史提案不当现状；tracked active DESIGN与父目录历史原型分开","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-13","status":"pending","evidence":[]}}
{"original":{"id":"GOV-14","priority":"P2","kind":"核验","action":"测量dashboard生成约90秒线索并改善启动/错误反馈","acceptance":"profile确认瓶颈后优化；可显示生成中，失败不空白；不无证据声称普遍慢","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-14","status":"pending","evidence":[]}}
{"original":{"id":"GOV-15","priority":"P2","kind":"治理","action":"统一Feature/Bug/Roadmap/Fanout收口与superseded关系","acceptance":"各阶段receipt绑定feature/iteration/commit；同步消费者done/N-A/pending可重入","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-15","status":"pending","evidence":[]}}
{"original":{"id":"GOV-16","priority":"P2","kind":"治理","action":"保留跨机器可恢复检查点与安全环境恢复说明","acceptance":"精确stage、commit/push、sync-check通过；secret值不入Git，D3/D4不绕过","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md;05-visual-ux-audit.md"},"primary_workflow":"D","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"GOV-16","status":"pending","evidence":[]}}
{"original":{"id":"SK-01","priority":"P2","kind":"优化","action":"xai-feature-brief固定feature_id、范围及失败/恢复验收","acceptance":"后续dossier和迭代能追溯原brief","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-01","status":"pending","evidence":[]}}
{"original":{"id":"SK-02","priority":"P2","kind":"优化","action":"xai-feature-full-loop逐阶段输出Target/commit/验证receipt","acceptance":"收口检查registry解析和dossier增量，不只更新包状态","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-02","status":"pending","evidence":[]}}
{"original":{"id":"SK-03","priority":"P2","kind":"优化","action":"xai-roadmap-loop以统一manifest schema驱动并核对对应Target","acceptance":"emit/serial后不显示旧迭代状态","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-03","status":"pending","evidence":[]}}
{"original":{"id":"SK-04","priority":"P2","kind":"优化","action":"xai-release-log分change_kind、source/deployed commit、环境与artifact","acceptance":"纯文档更新不改变产品验证健康，SHIPPED不等deploy","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-04","status":"pending","evidence":[]}}
{"original":{"id":"SK-05","priority":"P2","kind":"优化","action":"xai-dev-dashboard-sync加源集合与生成集合覆盖断言","acceptance":"漏项/冲突/当前commit验证范围可见，关联GOV-01至03","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-05","status":"pending","evidence":[]}}
{"original":{"id":"SK-06","priority":"P2","kind":"优化","action":"xai-consistency-audit串联稳定ID与PRD/package/test/deploy双向映射","acceptance":"代码问题与记录漂移分别给证据","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-06","status":"pending","evidence":[]}}
{"original":{"id":"SK-07","priority":"P2","kind":"优化","action":"xai-module-classify结构化核对全部authority镜像","acceptance":"按产品职责分类，明确host物理位置与产品归属差异","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-07","status":"pending","evidence":[]}}
{"original":{"id":"SK-08","priority":"P2","kind":"优化","action":"xai-feature-dossier-sync按用户能力维护九份缺失档案","acceptance":"一个feature可映射多包/迭代，不从实现臆造已批准需求","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-08","status":"pending","evidence":[]}}
{"original":{"id":"SK-09","priority":"P2","kind":"优化","action":"xai-account-sync-scope-check提供实体级D4 scope和可执行负例","acceptance":"device-local永不入outbox；导出/App映射与双设备证据独立","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-09","status":"pending","evidence":[]}}
{"original":{"id":"SK-10","priority":"P2","kind":"优化","action":"xai-web-to-desktop-sync回执绑定两端SHA和runtime profile","acceptance":"D3包含跨页恢复及parity，合并/build不能代替运行验收","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-10","status":"pending","evidence":[]}}
{"original":{"id":"SK-11","priority":"P2","kind":"优化","action":"xai-sync-fanout-dispatch逐消费者记录结果与证据","acceptance":"失败可重入，pending进入任务页，避免口头宣布全部同步","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-11","status":"pending","evidence":[]}}
{"original":{"id":"SK-12","priority":"P2","kind":"优化","action":"xai-admin-control-plane-sync明确backend owner/RBAC/audit/secret边界","acceptance":"用户AI设置变化不被当成控制面已接通","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-12","status":"pending","evidence":[]}}
{"original":{"id":"SK-13","priority":"P2","kind":"优化","action":"xai-web-deploy-preflight核验线上版本与过期gate","acceptance":"预检pass与实际deploy分列，关联DEP收口证据","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-13","status":"pending","evidence":[]}}
{"original":{"id":"SK-14","priority":"P2","kind":"优化","action":"xai-desktop-release-gate绑定架构、artifact和真机证据","acceptance":"签名/公证/更新/回退/睡眠缺证据保持partial","status":"待复核/待办","module":"web（project-system）","gate":"当前范围","source":"01-inventory-governance.md"},"primary_workflow":"B","original_module":"web（project-system）","normalized_module":"web","execution":{"id":"SK-14","status":"pending","evidence":[]}}
{"original":{"id":"APP-01","priority":"P2","kind":"核验","action":"当前SHA的Web容器离线冷启动、老数据升级与路由恢复","acceptance":"真实打包App可离线启动；404/损坏包可恢复，保留产物及机器证据","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-01","status":"pending","evidence":[]}}
{"original":{"id":"APP-02","priority":"P2","kind":"修复","action":"normal/overlay profile及native能力、权限失败统一反馈","acceptance":"Web不调用原生专属能力；不同窗口身份负例通过","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-02","status":"pending","evidence":[]}}
{"original":{"id":"APP-03","priority":"P1","kind":"核验","action":"用当前HEAD生成可复现的签名app/DMG及artifact manifest","acceptance":"架构、hash、源码SHA可追溯；旧打包记录不代替当前成功","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-03","status":"pending","evidence":[]}}
{"original":{"id":"APP-04","priority":"P2","kind":"优化","action":"窗口Move/Resize配置写入合并、flush并保留旧配置","acceptance":"高频拖动不每事件刷盘；关闭/崩溃恢复位置可验证","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-04","status":"pending","evidence":[]}}
{"original":{"id":"APP-05","priority":"P1","kind":"决策","action":"分清mock离线入口与真实离线会话缓存","acceptance":"Demo不被当登录成功；真实账号模式拒绝mock bypass","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-05","status":"pending","evidence":[]}}
{"original":{"id":"APP-06","priority":"P2","kind":"核验","action":"更新5月Mac smoke为当前版本定向验收","acceptance":"Applications启动、菜单、重启、离线、新增plugin/存储有实际记录","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-06","status":"pending","evidence":[]}}
{"original":{"id":"APP-07","priority":"P1","kind":"补全","action":"原生提醒改用真实事件源、持久occurrence及OS调度","acceptance":"发送成功后ack；关窗/睡眠/重启不重复或无声遗漏，权限失败可见","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-07","status":"pending","evidence":[]}}
{"original":{"id":"APP-08","priority":"P1","kind":"修复","action":"托盘动作支持主窗销毁后create-or-focus并显示状态新鲜度","acceptance":"StartPomodoro/TodayTasks仍可用，不把静态托盘状态当后台执行","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-08","status":"pending","evidence":[]}}
{"original":{"id":"APP-09","priority":"P2","kind":"核验","action":"全局快捷键支持冲突反馈、重绑和多布局","acceptance":"其他App抢占、主窗已销毁等场景有明确结果","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-09","status":"pending","evidence":[]}}
{"original":{"id":"APP-10","priority":"P2","kind":"优化","action":"菜单命令保持中英、disabled理由及多窗口target一致","acceptance":"新插件菜单可用且不作用于错误窗口","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-10","status":"pending","evidence":[]}}
{"original":{"id":"APP-11","priority":"P1","kind":"补全","action":"配置真实签名updater feed、公钥、下载安装和回滚","acceptance":"placeholder明确未配置；真实双版本升级及失败回退通过","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-11","status":"pending","evidence":[]}}
{"original":{"id":"APP-12","priority":"P2","kind":"修复","action":"缓存可读性按schema校验，显示更新时间与损坏原因","acceptance":"存在key不等readable；支持修复/导出，不假报离线数据可用","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-12","status":"pending","evidence":[]}}
{"original":{"id":"APP-13","priority":"P1","kind":"治理","action":"Phase2/Phase3 RC分别列本地与云端及硬件gate","acceptance":"组合单测通过不自动关闭真实通知/更新/同步门槛","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-13","status":"pending","evidence":[]}}
{"original":{"id":"APP-14","priority":"P2","kind":"文档","action":"明确SQLite事实源、localStorage兼容层和实体owner","acceptance":"每实体syncScope、持久层、迁移/备份边界可查","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-14","status":"pending","evidence":[]}}
{"original":{"id":"APP-15","priority":"P2","kind":"核验","action":"SQLite/SQLCipher处理Keychain锁定、迁移中断、磁盘满和容量","acceptance":"区分无密钥/无权限/损坏；大namespace有分页或明确上限","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-15","status":"pending","evidence":[]}}
{"original":{"id":"APP-16","priority":"P1","kind":"修复","action":"repository bridge等待SQLite提交，串行化写入并报告pending/committed","acceptance":"退出重开不以旧SQLite覆盖新local值；乱序/写失败可恢复","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-16","status":"pending","evidence":[]}}
{"original":{"id":"APP-17","priority":"P2","kind":"核验","action":"Web数据迁移提供预览、幂等、断点续传与原数据保留","acceptance":"真实旧数据演练；Notes等不支持实体明确列出而非悄悄跳过","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-17","status":"pending","evidence":[]}}
{"original":{"id":"APP-18","priority":"P1","kind":"修复","action":"离线outbox仅记录实际变更并有合并、容量和坏记录隔离","acceptance":"整family重复写不无限膨胀；长期离线后可恢复处理","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-18","status":"pending","evidence":[]}}
{"original":{"id":"APP-19","priority":"P2","kind":"优化","action":"AI离线保留草稿并要求用户明确继续有费用的请求","acceptance":"恢复网络不自动重复收费；离线不可用原因清楚","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-19","status":"pending","evidence":[]}}
{"original":{"id":"APP-20","priority":"P1","kind":"文档","action":"日历连接状态、缓存和真实同步区别显示","acceptance":"lastSuccess/需刷新/错误可见；真实OAuth和数据同步关联SYN/JOB","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-20","status":"pending","evidence":[]}}
{"original":{"id":"APP-21","priority":"P1","kind":"补全","action":"备份显示所有覆盖/排除实体及待同步数量，并演练恢复","acceptance":"不将只支持9类record称整应用备份；pending数据有处理方案","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-21","status":"pending","evidence":[]}}
{"original":{"id":"APP-22","priority":"P2","kind":"决策","action":"将开机启动和系统Deep Link列独立新切片","acceptance":"确定权限/失败/协议安全语义后实现，不将现有目标文案当已交付","status":"受门禁约束/待办","module":"app","gate":"按App路线；新desktop-next、晋级dev及release需明确确认","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"app","normalized_module":"app","execution":{"id":"APP-22","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-01","priority":"P2","kind":"核验","action":"typed manifest/PluginInstance升级及旧实例迁移","acceptance":"中心显示available/planned/权限缺失的真实原因，默认配置可升级","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-01","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-02","priority":"P1","kind":"修复","action":"实例store采用提交成功后更新或失败rollback","acceptance":"磁盘失败不留内存成功假象；跨窗口revision一致","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-02","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-03","priority":"P1","kind":"修复","action":"add-to-desktop处理存储创建成功但窗口创建失败","acceptance":"实例有pending/created/failed状态，可重试、补偿或删除","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-03","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-04","priority":"P1","kind":"修复","action":"由host启动协调实例恢复，逐实例失败隔离","acceptance":"不开Plugin Center也能按合同恢复；一个失败不阻断其他实例","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-04","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-05","priority":"P1","kind":"核验","action":"placement/resize/opacity/pin/click-through/Spaces真机验证","acceptance":"requested/applied/unsupported明确；穿透有逃生方式，多屏/全屏不失控","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-05","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-06","priority":"P2","kind":"修复","action":"Plugin Center窗口状态由可靠原生事件持久化","acceptance":"不只依赖beforeunload异步保存；逻辑/物理坐标、多屏恢复正确","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-06","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-07","priority":"P1","kind":"核验","action":"完成sample-widget的Phase2全生命周期smoke","acceptance":"实际创建、重启、禁用、删除、resize、权限拒绝均有证据，PARTIAL才能收口","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-07","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-08","priority":"P2","kind":"核验","action":"Organizer验证真实文件引用、移动、权限、断链和撤销","acceptance":"旧mock读取与真实Finder流分开；批量结果及失败可见","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-08","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-09","priority":"P1","kind":"核验","action":"逐插件登记恢复矩阵，禁止由Organizer推广所有插件","acceptance":"每种实例成功/失败可查，新增sample-widget证据独立","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-09","status":"pending","evidence":[]}}
{"original":{"id":"PLAT-10","priority":"P2","kind":"决策","action":"Organizer closeout明确Finder tags和真实pin的后续范围","acceptance":"分别定义系统行为、权限和恢复验收，不只补按钮文案","status":"受门禁约束/待办","module":"plugin","gate":"G1平台门内推进；不得凭本清单解冻后续业务插件","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLAT-10","status":"pending","evidence":[]}}
{"original":{"id":"PLUG-01","priority":"P2","kind":"建设","action":"Widget Host与内置widgets接真实provider并限制独立timer","acceptance":"来源、刷新频率、实例配置和恢复明确，不继续用mock habit历史","status":"受门禁约束/待办","module":"plugin","gate":"具体业务插件等待G1及对应路线图门禁","source":"04-deployment-platform.md;01-inventory-governance.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLUG-01","status":"pending","evidence":[]}}
{"original":{"id":"PLUG-02","priority":"P1","kind":"建设","action":"Clipboard接真实系统监听与隐私边界","acceptance":"敏感应用排除、allow/deny、TTL、容量、权限和实体契约统一","status":"受门禁约束/待办","module":"plugin","gate":"具体业务插件等待G1及对应路线图门禁","source":"04-deployment-platform.md;01-inventory-governance.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLUG-02","status":"pending","evidence":[]}}
{"original":{"id":"PLUG-03","priority":"P1","kind":"建设","action":"OCR接真实识别并完善取消/失败/预览","acceptance":"mock按钮不当可用能力；隐私和权限在识别前清楚","status":"受门禁约束/待办","module":"plugin","gate":"具体业务插件等待G1及对应路线图门禁","source":"04-deployment-platform.md;01-inventory-governance.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLUG-03","status":"pending","evidence":[]}}
{"original":{"id":"PLUG-04","priority":"P2","kind":"建设","action":"Calendar Glance先完成provider与离线缓存一致性","acceptance":"样例不当个人事件，缓存时间和重连状态可见","status":"受门禁约束/待办","module":"plugin","gate":"具体业务插件等待G1及对应路线图门禁","source":"04-deployment-platform.md;01-inventory-governance.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLUG-04","status":"pending","evidence":[]}}
{"original":{"id":"PLUG-05","priority":"P2","kind":"建设","action":"Native Pet明确轻量窗口/节能/穿透逃生后再接AI","acceptance":"位置和生命周期可恢复；AI订阅真实接线后才宣传智能响应","status":"受门禁约束/待办","module":"plugin","gate":"具体业务插件等待G1及对应路线图门禁","source":"04-deployment-platform.md;01-inventory-governance.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLUG-05","status":"pending","evidence":[]}}
{"original":{"id":"PLUG-06","priority":"P2","kind":"决策","action":"Native Meditation先定义与Web的差异和共享模型","acceptance":"Web已实现不等native挂件完成；独立设计/验收后再建包","status":"受门禁约束/待办","module":"plugin","gate":"具体业务插件等待G1及对应路线图门禁","source":"04-deployment-platform.md;01-inventory-governance.md"},"primary_workflow":"C","original_module":"plugin","normalized_module":"plugin","execution":{"id":"PLUG-06","status":"pending","evidence":[]}}
{"original":{"id":"SYN-01","priority":"P1","kind":"修复","action":"服务端请求context验证签名/issuer/audience/expiry及设备状态","acceptance":"拒绝无Bearer和伪造header账号；撤销设备不能读写；不依赖未证明的gateway配置","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-01","status":"pending","evidence":[]}}
{"original":{"id":"SYN-02","priority":"P1","kind":"核验","action":"空staging完整执行schema迁移并归档版本/角色授权指纹","acceptance":"11份迁移、RLS和grants可复现，不能只看源码存在","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-02","status":"pending","evidence":[]}}
{"original":{"id":"SYN-03","priority":"P1","kind":"核验","action":"将双账号、撤销设备、普通/特权连接RLS测试接真实数据库CI","acceptance":"本次跳过的integration实际运行；负例不能越权读写","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-03","status":"pending","evidence":[]}}
{"original":{"id":"SYN-04","priority":"P1","kind":"修复","action":"sync-push把锁或原子CAS放到revision比较前并限制批量","acceptance":"两个同base并发请求仅一个成功；冲突结果和mutation重试幂等","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-04","status":"pending","evidence":[]}}
{"original":{"id":"SYN-05","priority":"P1","kind":"补全","action":"push引擎接真实持久outbox/transport/重试","acceptance":"401/429/网络中断/kill后结果可恢复；本地成功与云ack分开","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-05","status":"pending","evidence":[]}}
{"original":{"id":"SYN-06","priority":"P1","kind":"修复","action":"sync-pull校验active device并保证稳定分页/cursor边界","acceptance":"并发写入和重连补拉不丢不重复，跨账号cursor无效","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-06","status":"pending","evidence":[]}}
{"original":{"id":"SYN-07","priority":"P2","kind":"核验","action":"commit-seq authority实测真实隔离级别与并发语义","acceptance":"文档REPEATABLE READ与事务配置一致，seq单调且授权正确","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-07","status":"pending","evidence":[]}}
{"original":{"id":"SYN-08","priority":"P1","kind":"核验","action":"nonce租约、shadow/冲突路径及重启防重用","acceptance":"真实SQL事务证明消费；过期/时钟跳变/撤销设备负例通过","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-08","status":"pending","evidence":[]}}
{"original":{"id":"SYN-09","priority":"P1","kind":"修复","action":"明确used_nonces访问边界并检查实际grants","acceptance":"采用private schema或显式RLS/revoke；anon/authenticated无未授权读写","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-09","status":"pending","evidence":[]}}
{"original":{"id":"SYN-10","priority":"P1","kind":"补全","action":"recovery-proof绑定数据库和签名adapter替代501入口","acceptance":"过期、重放、错误账号、一次挑战消费与恢复链实测","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-10","status":"pending","evidence":[]}}
{"original":{"id":"SYN-11","priority":"P1","kind":"补全","action":"backfill补可部署入口及nonce/ack/DB接线","acceptance":"可实际部署，失败续进度和重复确认幂等","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-11","status":"pending","evidence":[]}}
{"original":{"id":"SYN-12","priority":"P1","kind":"核验","action":"rekey两阶段真实DB/设备中断恢复","acceptance":"部分batch、旧设备撤销、备份兼容、强杀重启不丢数据或密钥","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-12","status":"pending","evidence":[]}}
{"original":{"id":"SYN-13","priority":"P2","kind":"补全","action":"审计链接持久sink、查询、保留和权限","acceptance":"恢复可校验digest；仅内存hash合同不称生产审计","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-13","status":"pending","evidence":[]}}
{"original":{"id":"SYN-14","priority":"P1","kind":"补全","action":"Web/App sync blob driver及reconnect adapter真实接线","acceptance":"补transport缺口；timeout/lease/inflight锁、批次错误隔离；两端确实交换数据","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-14","status":"pending","evidence":[]}}
{"original":{"id":"SYN-15","priority":"P2","kind":"核验","action":"加密IDB缓存升级、quota、密钥不可用与老envelope恢复","acceptance":"不会因异常覆写原数据；加密不当作XSS或账户隔离替代","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-15","status":"pending","evidence":[]}}
{"original":{"id":"SYN-16","priority":"P1","kind":"修复","action":"验证Realtime当前平台迁移兼容并以cursor补拉恢复","acceptance":"staging核实schema约束；断连/漏推不丢数据，不依赖Realtime作持久队列","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-16","status":"pending","evidence":[]}}
{"original":{"id":"SYN-17","priority":"P1","kind":"核验","action":"完成真实两设备Tasks闭环及device-local负例","acceptance":"离线新增/编辑冲突/删除/重启/撤销通过；非同步实体不上传","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-17","status":"pending","evidence":[]}}
{"original":{"id":"SYN-18","priority":"P1","kind":"文档","action":"独立server工作区、deploy owner和runbook事实对齐","acceptance":"archive UI与仍使用的后端实现分离；每function有可部署入口和回执","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-18","status":"pending","evidence":[]}}
{"original":{"id":"SYN-19","priority":"P1","kind":"建设","action":"账号删除/延期清理服务与恢复机制闭环","acceptance":"关联JOB-10；无实际后台任务前不承诺关页继续删除","status":"受门禁约束/待办","module":"sync","gate":"账号云同步保持paused；仅解冻后实施且只同步account-sync实体","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"SYN-19","status":"pending","evidence":[]}}
{"original":{"id":"CRY-01","priority":"P1","kind":"核验","action":"aes-gcm-aead-core目标硬件benchmark和独立审查","acceptance":"nonce失败/corrupt tag及release性能有证据","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-01","status":"pending","evidence":[]}}
{"original":{"id":"CRY-02","priority":"P1","kind":"核验","action":"bip39-mnemonic-24w生成/输入/退出后恢复全流程","acceptance":"助记词有效性、离线备份确认与避免意外剪贴板暴露","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-02","status":"pending","evidence":[]}}
{"original":{"id":"CRY-03","priority":"P1","kind":"核验","action":"cipher-envelope-codec长时fuzz及恶意输入边界","acceptance":"截断/过大/版本/字节序拒绝稳定，补延期fuzz证据","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-03","status":"pending","evidence":[]}}
{"original":{"id":"CRY-04","priority":"P2","kind":"治理","action":"crypto-deps-lockdown受控刷新与feature组合CI","acceptance":"锁文件、版本风险和实际构建组合可追溯","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-04","status":"pending","evidence":[]}}
{"original":{"id":"CRY-05","priority":"P1","kind":"核验","action":"crypto-tauri-commands真实window身份和capability负例","acceptance":"错误窗口/未就绪keyvault无法调用，runtime gate实际闭合","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-05","status":"pending","evidence":[]}}
{"original":{"id":"CRY-06","priority":"P1","kind":"核验","action":"deterministic-cbor-aad Rust与真实浏览器双向字节对照","acceptance":"后续向量回填旧gate，互换blob通过","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-06","status":"pending","evidence":[]}}
{"original":{"id":"CRY-07","priority":"P1","kind":"核验","action":"ed25519-recovery-signing服务端挑战和独立审查","acceptance":"过期/一次性消费/replay/错误account/撤销全部拒绝","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-07","status":"pending","evidence":[]}}
{"original":{"id":"CRY-08","priority":"P1","kind":"核验","action":"hpke-per-device-wrap绑定RFC向量与新设备上传链","acceptance":"本地wrap成功之外有browser/native互操作和server ack","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-08","status":"pending","evidence":[]}}
{"original":{"id":"CRY-09","priority":"P1","kind":"核验","action":"kdf-primitives参数迁移、低内存和取消边界","acceptance":"不半写密钥；release耗时分布与独立review可查","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-09","status":"pending","evidence":[]}}
{"original":{"id":"CRY-10","priority":"P2","kind":"核验","action":"keychain-bridge-macos真实签名安装和权限变更","acceptance":"锁定/拒绝/重装/签名变更错误区分清楚","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-10","status":"pending","evidence":[]}}
{"original":{"id":"CRY-11","priority":"P1","kind":"核验","action":"keychain-opaque-handle目标sandbox/entitlement ACL","acceptance":"跨窗口禁止取值，handle失效可恢复，MAS前证据独立","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-11","status":"pending","evidence":[]}}
{"original":{"id":"CRY-12","priority":"P1","kind":"核验","action":"rust-keyvault-opaque-handle重启rehydrate与生命周期","acceptance":"过期/卸载后引用/无权限窗口拒绝，状态不泄漏","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-12","status":"pending","evidence":[]}}
{"original":{"id":"CRY-13","priority":"P1","kind":"核验","action":"x25519-device-keypair真实注册/撤销/轮换与上传","acceptance":"两设备完成，设备页展示真实ack和失败","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-13","status":"pending","evidence":[]}}
{"original":{"id":"CRY-14","priority":"P1","kind":"核验","action":"sqlcipher-local-db真实dump/restore/密钥损坏/重启","acceptance":"结合当前App数据库关闭重复旧gate，迁移前演练可恢复","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-14","status":"pending","evidence":[]}}
{"original":{"id":"CRY-15","priority":"P1","kind":"核验","action":"realtime-private-channel-config跨账号订阅与部署","acceptance":"关联SYN-16；普通用户不能订阅他人频道，cursor恢复完整","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-15","status":"pending","evidence":[]}}
{"original":{"id":"CRY-16","priority":"P2","kind":"治理","action":"rfc-test-vectors-gate固定向量版本及Rust/Web CI结果","acceptance":"向量通过与密钥生命周期验收分列","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-16","status":"pending","evidence":[]}}
{"original":{"id":"CRY-17","priority":"P2","kind":"核验","action":"tla-protocol-model在协议变更后重跑bounded TLC","acceptance":"保存配置/状态上限，不将有限模型当全部生产并发证明","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-17","status":"pending","evidence":[]}}
{"original":{"id":"CRY-18","priority":"P1","kind":"核验","action":"protocol-integrity-integration-tests接真实DB与恶意客户端","acceptance":"同账号多设备、隔离/事务/失败重试证据实际执行","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-18","status":"pending","evidence":[]}}
{"original":{"id":"CRY-19","priority":"P1","kind":"核验","action":"single-table-todos-e2e补live Supabase与两Mac smoke","acceptance":"关联SYN-17，关闭/离线冲突/重启链完整","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-19","status":"pending","evidence":[]}}
{"original":{"id":"CRY-20","priority":"P1","kind":"核验","action":"recovery-rehearsal-3-rekey-kill9四个中断点真机演练","acceptance":"当前BLOCKED必须用打包App实际kill/restart及数据校验收口","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-20","status":"pending","evidence":[]}}
{"original":{"id":"CRY-21","priority":"P1","kind":"核验","action":"web-browser-e2e-crypto-runtime补Safari/refresh/key恢复","acceptance":"跨Rust互操作、IDB quota和老envelope升级通过","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-21","status":"pending","evidence":[]}}
{"original":{"id":"CRY-22","priority":"P2","kind":"治理","action":"web-sync-crypto-contract-preflight合同版本与接线证据回填","acceptance":"mock-only与live gate独立，序列化schema一致","status":"受门禁约束/待办","module":"sync","gate":"同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"sync","normalized_module":"sync","execution":{"id":"CRY-22","status":"pending","evidence":[]}}
{"original":{"id":"ADM-01","priority":"P1","kind":"补全","action":"Shell在真实环境验证管理员身份，生产拒绝mock claim","acceptance":"服务端权限生效；Demo标识持续可见，路由绕过无权限也不能访问API","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-01","status":"pending","evidence":[]}}
{"original":{"id":"ADM-02","priority":"P1","kind":"补全","action":"Data contracts/RBAC接服务端授权及稳定错误码","acceptance":"每API校验role/scope/租户，浏览器guard不作为唯一防线","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-02","status":"pending","evidence":[]}}
{"original":{"id":"ADM-03","priority":"P1","kind":"补全","action":"Users/orgs/billing command替换模拟写入并返回真实回执","acceptance":"禁用/转移/套餐变更实际落库；模拟模式不能toast假成功","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-03","status":"pending","evidence":[]}}
{"original":{"id":"ADM-04","priority":"P1","kind":"补全","action":"Feature/AI provider control接版本化配置和真实路由","acceptance":"草稿/发布分明；有dry-run、回滚与审计，不向浏览器下发平台secret","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-04","status":"pending","evidence":[]}}
{"original":{"id":"ADM-05","priority":"P1","kind":"补全","action":"Audit/ops queue接持久服务端事件与事务outbox","acceptance":"刷新关页不丢审计；FNV mock不称防篡改审计；有retention","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-05","status":"pending","evidence":[]}}
{"original":{"id":"ADM-06","priority":"P1","kind":"核验","action":"Admin独立部署、auth、telemetry和全部页面smoke","acceptance":"域名/产物隔离，release SHA/告警可查，手工checklist实际执行","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-06","status":"pending","evidence":[]}}
{"original":{"id":"ADM-07","priority":"P2","kind":"优化","action":"总览/运营队列明确KPI口径、采样时间和数据新鲜度","acceptance":"优先可执行队列；空/失败/部分失败与mock数据区分","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-07","status":"pending","evidence":[]}}
{"original":{"id":"ADM-08","priority":"P2","kind":"补全","action":"用户管理保留筛选分页并提供批量逐项结果","acceptance":"服务端分页/租户scope/幂等command ID可验证，不全量前端过滤","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-08","status":"pending","evidence":[]}}
{"original":{"id":"ADM-09","priority":"P1","kind":"补全","action":"组织/空间转移保证最后owner不变量和事务回滚","acceptance":"新旧owner与影响明确；乐观锁、审计和失败回退有效","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-09","status":"pending","evidence":[]}}
{"original":{"id":"ADM-10","priority":"P1","kind":"补全","action":"功能灰度管理增加影响预览、revision与safe fallback","acceptance":"配置校验、冲突、发布回执和撤销齐全","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-10","status":"pending","evidence":[]}}
{"original":{"id":"ADM-11","priority":"P1","kind":"补全","action":"AI用量/配额使用权威账本与并发扣减","acceptance":"周期/时区/币种/估算结算明确，请求幂等和延迟费用校正","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-11","status":"pending","evidence":[]}}
{"original":{"id":"ADM-12","priority":"P1","kind":"补全","action":"Provider/模型路由接secret store、轮换、健康及熔断","acceptance":"密钥不回显，allowlisted egress和真实probe有效","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-12","status":"pending","evidence":[]}}
{"original":{"id":"ADM-13","priority":"P1","kind":"补全","action":"角色权限支持最小权限、差异预览与撤销即时生效","acceptance":"服务端permission authority、token更新及防管理员自锁验证","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-13","status":"pending","evidence":[]}}
{"original":{"id":"ADM-14","priority":"P1","kind":"补全","action":"订阅计费接真实webhook、账期指标和对账补偿","acceptance":"验签/重放幂等成立，MRR/ARPPU口径可解释","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-14","status":"pending","evidence":[]}}
{"original":{"id":"ADM-15","priority":"P1","kind":"补全","action":"审计日志可查actor/target/result并支持可验证导出","acceptance":"持久append、可信IP、访问/删除限制和关联operation可查","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-15","status":"pending","evidence":[]}}
{"original":{"id":"ADM-16","priority":"P1","kind":"补全","action":"系统设置的2FA/SSO/IP/Webhook由后端强制执行","acceptance":"敏感变更重新认证，Webhook防SSRF，secret不回显","status":"受门禁约束/待办","module":"admin","gate":"Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"admin","normalized_module":"admin","execution":{"id":"ADM-16","status":"pending","evidence":[]}}
{"original":{"id":"SITE-01","priority":"P2","kind":"决策","action":"激活官网范围并区分旧release-site archive与新官网","acceptance":"品牌、平台、版本、Demo/下载入口清楚，不把旧mock页当生产站","status":"受门禁约束/待办","module":"site","gate":"PROPOSED；未获得operator确认前不开site工作分支","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"site","normalized_module":"site","execution":{"id":"SITE-01","status":"pending","evidence":[]}}
{"original":{"id":"SITE-02","priority":"P1","kind":"建设","action":"签名/公证完成后建立DMG/MAS下载闭环","acceptance":"架构/版本/hash/安装说明/回退包真实可用，链接与artifact一致","status":"受门禁约束/待办","module":"site","gate":"PROPOSED；未获得operator确认前不开site工作分支","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"site","normalized_module":"site","execution":{"id":"SITE-02","status":"pending","evidence":[]}}
{"original":{"id":"SITE-03","priority":"P1","kind":"建设","action":"同一release源生成更新feed、下载页和用户变更说明","acceptance":"timestamp/channel/signature一致，官网与updater不指向不同版本","status":"受门禁约束/待办","module":"site","gate":"PROPOSED；未获得operator确认前不开site工作分支","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"site","normalized_module":"site","execution":{"id":"SITE-03","status":"pending","evidence":[]}}
{"original":{"id":"SITE-04","priority":"P2","kind":"建设","action":"正式账号/隐私/导入导出入口复用Web真实能力","acceptance":"历史mock参考页不作为用户中心；深链/重定向/访问保护有效","status":"受门禁约束/待办","module":"site","gate":"PROPOSED；未获得operator确认前不开site工作分支","source":"04-deployment-platform.md"},"primary_workflow":"C","original_module":"site","normalized_module":"site","execution":{"id":"SITE-04","status":"pending","evidence":[]}}
{"original":{"id":"QA-01","priority":"P1","kind":"核验","action":"实施每条前刷新所属分支并核对其他任务是否已修复","acceptance":"记录当前SHA、仍复现/已修待验/已关闭；不得把9月8日基线直接当今天线上状态","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-01","status":"pending","evidence":[]}}
{"original":{"id":"QA-02","priority":"P1","kind":"核验","action":"把10条审查行为复现转为正确预期的回归测试","acceptance":"修复后不继续断言缺陷应存在；时间、关联、空状态用业务预期验收","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-02","status":"pending","evidence":[]}}
{"original":{"id":"QA-03","priority":"P1","kind":"核验","action":"真实浏览器完成开始/暂停/换路由/刷新/关tab/重开矩阵","acceptance":"每类会话分别验证；后台冻结、系统睡眠、时钟跳变/DST有记录","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-03","status":"pending","evidence":[]}}
{"original":{"id":"QA-04","priority":"P1","kind":"核验","action":"完成新/旧profile、IDB初始化、quota、禁用存储及双tab测试","acceptance":"不丢数据、不假报保存成功、不串账号；恢复路径可用","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-04","status":"pending","evidence":[]}}
{"original":{"id":"QA-05","priority":"P1","kind":"核验","action":"真实离线冷启动、SW升级和线上发布后冒烟","acceptance":"缓存完整、版本一致、回退可用；用生产SHA绑定结果","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-05","status":"pending","evidence":[]}}
{"original":{"id":"QA-06","priority":"P1","kind":"核验","action":"AI真实provider和工具失败/中断做受控端到端验收","acceptance":"两轮上下文、slow stream、取消、工具失败不报成功；计费/确认边界明确","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-06","status":"pending","evidence":[]}}
{"original":{"id":"QA-07","priority":"P1","kind":"核验","action":"记账和指标真实导出导入往返及旧数据升级","acceptance":"转账、币种、逗号换行、重复导入和所有声明字段不丢，坏数据可回滚","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-07","status":"pending","evidence":[]}}
{"original":{"id":"QA-08","priority":"P1","kind":"核验","action":"按门禁完成Mac真机、真实RLS、两设备、恢复及支付验收","acceptance":"每个跳过/未知有owner和原因；mock绿不算live通过","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-08","status":"pending","evidence":[]}}
{"original":{"id":"QA-09","priority":"P2","kind":"治理","action":"逐任务保存实现/验证/发布证据并完成跨机器交接","acceptance":"提交SHA、命令、环境、artifact和缺口齐全；精准commit/push及sync-check","status":"受门禁约束/待办","module":"web（跨模块验证索引）","gate":"各验证随对应模块与外部环境门禁执行","source":"VERIFICATION.md;README.md"},"primary_workflow":"D","original_module":"web（跨模块验证索引）","normalized_module":"web","execution":{"id":"QA-09","status":"pending","evidence":[]}}
```

## Appendix D — historical source applicability

Compared against immutable P0, not moving parent. Byte identity of one file is necessary but insufficient for whole-host/current-runtime reuse. Calendar D1 files match2fed984 while canonical store differs, so new exception and present account/activation proof remain absent. Unchanged expandRecurrence math can support prior local-clock rendering semantics only, never new scope or exception behavior.

| Historical SHA | Path | P0 comparison |
| --- | --- | --- |
| a452d40c08da3a3c73a51fae5d7a7b89a3caa9bf | packages/xai-web-calendar/src/CalendarModule.tsx | DIFFERS; no current automatic reuse |
| a452d40c08da3a3c73a51fae5d7a7b89a3caa9bf | packages/xai-web-calendar/src/EventComposer.tsx | DIFFERS; no current automatic reuse |
| a452d40c08da3a3c73a51fae5d7a7b89a3caa9bf | packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts | DIFFERS; no current automatic reuse |
| a452d40c08da3a3c73a51fae5d7a7b89a3caa9bf | packages/xai-web-calendar/src/internal/eventStore/expandRecurrence.ts | byte-identical |
| 2fed98475ea6c3ba3943bb698c5e94ff7b4330c9 | packages/xai-web-calendar/src/CalendarModule.tsx | byte-identical |
| 2fed98475ea6c3ba3943bb698c5e94ff7b4330c9 | packages/xai-web-calendar/src/EventComposer.tsx | byte-identical |
| 2fed98475ea6c3ba3943bb698c5e94ff7b4330c9 | packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts | byte-identical |
| 2fed98475ea6c3ba3943bb698c5e94ff7b4330c9 | packages/xai-web-calendar/src/internal/eventStore/expandRecurrence.ts | byte-identical |
| 2fed98475ea6c3ba3943bb698c5e94ff7b4330c9 | packages/plugin-web-storage/src/internal/canonicalCommandState.ts | DIFFERS; no current automatic reuse |
| 9a7e66b20071b3041ee27f244237ae3ccde8f906 | packages/xai-web-calendar/src/CalendarModule.tsx | byte-identical |
| 9a7e66b20071b3041ee27f244237ae3ccde8f906 | packages/xai-web-calendar/src/EventComposer.tsx | byte-identical |
| 9a7e66b20071b3041ee27f244237ae3ccde8f906 | packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts | DIFFERS; no current automatic reuse |
| 9a7e66b20071b3041ee27f244237ae3ccde8f906 | packages/xai-web-calendar/src/internal/eventStore/expandRecurrence.ts | byte-identical |
| 9a7e66b20071b3041ee27f244237ae3ccde8f906 | packages/plugin-web-storage/src/internal/canonicalCommandState.ts | DIFFERS; no current automatic reuse |
| 20a07480b35d4a9af796b68601416edbeed84548 | packages/xai-web-calendar/src/CalendarModule.tsx | DIFFERS; no current automatic reuse |
| 20a07480b35d4a9af796b68601416edbeed84548 | packages/xai-web-calendar/src/EventComposer.tsx | DIFFERS; no current automatic reuse |
| 20a07480b35d4a9af796b68601416edbeed84548 | packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts | DIFFERS; no current automatic reuse |
| 20a07480b35d4a9af796b68601416edbeed84548 | packages/xai-web-calendar/src/internal/eventStore/expandRecurrence.ts | byte-identical |

## Appendix E — permanent historical reports, raw command/mode and launch provenance

The following are immutable historical source excerpts copied in full, not current verdicts or new commands to run. Original source path and hash are in inputs.sha256. Historical process launches, assertions, probes, refusals and unknown totals retain their distinct meanings. Any conflicting old procedure is superseded only by the explicit current gates above; neither historic PASS nor old sync writer text grants current activation.

### Historical source: docs/reviews/web-calendar-save-recovery/20260909-diagnosis-and-fix.md

<details><summary>Retained complete historical text</summary>

~~~~text
# REL-05 Calendar composer save recovery

Parent review of the current CalendarModule / useUserCalEvents found ignored boolean persistence results: create/update returned apparent success and the parent closed the composer; delete additionally closed in EventComposer itself. Original render assertions ran before the fix: create quota and delete quota both failed because the native-dialog shim reported `open=false` even though storage had not changed (2 FAIL, exit 1).

The mutation hook now propagates failure by throwing before returning success. It checks the captured account and current raw snapshot before writing. The composer catches errors and retains the form, displays a bilingual unsaved message, offers retry with current edited values and a JSON draft export, and never closes after a failed delete. Edit/delete compare the original editing entity with current state to reject newer changes. Export checks the captured owner, reports failures, and uses the current form rather than the first failed proposal. Recovery actions are at least44px.

Validation: Calendar full suite **46 files / 343 tests PASS**, check-types and lint exit0. The original two assertions remain unchanged and pass; two additional tests cover latest-form export contents, failed retry/export after account switch, and newer raw data preservation. Export unit evidence intercepts Blob/anchor; it is not claimed as a native download. Independent native before/after verification is assigned to a non-author and remains pending.

This is the composer CRUD sub-scope of REL-05, not closure of the whole feature or REL-05. Explicit Cancel/Escape/backdrop discards still apply. No cross-reload draft persistence, automatic import, cloud sync or cross-tab atomicity is added. Device view/week-start preferences and AI subscriber mutation contracts remain separate; damaged-schema rendering is also outside this repair. Synthetic storage faults do not constitute production service validation.

~~~~

</details>

### Historical source: docs/reviews/web-calendar-independent/20260909-independent-verification.md

<details><summary>Retained complete historical text</summary>

~~~~text
# REL05 Calendar composer CRUD 独立验收

独立固定产品 `a452d40`，基线 `a452d40^`。验收者未参与 Calendar 本轮实现；所有产品及 @repo 导入来自 Git archive，不使用作者工作区 WIP。

结论：本次 Calendar 创建、编辑、删除保存恢复子项 PASS。整体 REL05 保持 OPEN。

## 复现与验证

```sh
node docs/reviews/web-calendar-independent/verify-native.mjs
CALENDAR_VERIFY_COMMIT=a452d40 node docs/reviews/web-calendar-independent/verify-native.mjs
node docs/reviews/web-calendar-independent/verify-tests.mjs
```

第一条故意固定 before，以正确业务断言退出 1：quota 后创建与删除都关闭 dialog、没有可见错误，原存储字节未改。创建的隐藏表单仍有文本（draftRetained=true），不能把这个细节误报为所有内部表单状态都已清空；实际失败是编辑器关闭并伪装完成。

修复版真实 Chromium 8 组 PASS（after.log），同一固定版本原测试 **46 文件 / 343 tests PASS**（tests.log）。没有修改原测试或叠加数量冒充覆盖率。

| 场景 | 独立业务断言 |
| --- | --- |
| 创建 quota | 实际 CalendarModule / EventComposer 保存失败，dialog、输入稿与错误保留，原存储字节不变 |
| 删除 quota | 实际已存在事件的 Delete 失败后 dialog 保留，错误可见，原事件字节不变 |
| 删除 retry | 移除 Storage 故障后 Retry delete 成功，事件删除并关闭 dialog |
| 最新编辑导出 | 失败后改标题和标签；实际 Chrome 下载 calendar-unsaved-draft.json，读取下载文件验证 kind 与当前 form.title / form.tag；没有截获 Blob 或替换 anchor.click 代替下载 |
| 创建 retry | 提交最新标题/标签，只新增一条事件，原事件保留 |
| 编辑 retry | 旧事件修改保存失败仍保留编辑器；Retry 正确更新原 id |
| 新数据冲突 | 外部 raw 更新后旧编辑器不能覆盖；随后派发真实 StorageEvent 使 hook 接收更新，再 Retry 仍拒绝旧 editing entity，最新完整字节不变 |
| A → B | A 失败表单保留时切 B，旧 Retry / Export 拒绝，A/B 字节都不变，下载目录无新文件，导出失败消息可见 |

## 实现核对与边界

`useUserCalEvents.ts` 在捕获 owner 与当前 raw 检查通过后才写；失败抛出而不返回成功。`CalendarModule.tsx` 对旧 editing entity 加比较；`EventComposer.tsx` 捕获保存/删除错误，不关闭失败表单，并导出当前 form。

- 临时 Chrome profile 和下载目录，合成账户，无生产网络凭证。使用实际 DOM input/button/键盘事件与原生 dialog、Storage、下载，不声称人工鼠标或完整生产 Shell E2E。
- 这是同步冲突检测，不是跨标签事务；没有测试或承诺检查与写之间完全消除竞态。
- 明确 Cancel / Escape / backdrop 仍可丢弃稿；无跨刷新草稿持久化、自动导入、坏 schema 恢复或云同步。
- view / week-start 偏好及 AI subscriber 调用合同在本轮修复边界外，未因 composer PASS 一并关闭。
- 初次 before 已在更早且不含 Calendar WIP 的 8e50d8f 复现；最终保留日志重跑在 a452d40^，与 after 配对。所有 after 只在作者固定 hash 后运行。

~~~~

</details>

### Historical source: docs/reviews/web-board-workspace-astra-review/20260909-board728-calendar2fed-acceptance.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Board D1 repair and Calendar publication cleanup — bounded acceptance

Astra, non-author; Web; 2026-09-09. Product snapshots `728822d189c0d0c7ad2848ea562682a27046808a` (Board) and `2fed98475ea6c3ba3943bb698c5e94ff7b4330c9` (Calendar). Only independent review artifacts changed.

**Accept both bounded changes.** The three Board findings in `b4344a4` are repaired without changing their assertions. Calendar's redundant post-commit legacy setter is removed while actual domain publication, failure and UI behavior remain correct. This accepts Board's ordered intent → canonical Tasks → acknowledgement path and this Calendar cleanup; it does not close the whole Board feature, D1, AI-02 or REL-05.

## Board repair review

`taskLinkCommand.ts` now distinguishes physical presence from decoded value and requires a valid persisted Board source. JSON null and truly missing Board bytes cannot fabricate a source from defaults; legitimate absent Tasks still initializes under the shared canonical writer. `sameTaskLink` compares source, task ID, creation time, both localized pending title values and due date before the locked Task mutation and again before acknowledgement. An old operation therefore preserves the newer same-ID pending request and honestly reports acknowledgement failure after an already committed Task. The existing Task check also refuses a different pending payload instead of clearing it merely because a Task with that deterministic ID exists. No cross-key atomicity is claimed.

The Module resets the task-link error when the active-card session changes, alongside its existing operation counter/pending reset. Our actual UI tests prove both settled error isolation and old delayed completion isolation. Existing phase/quota/retry and stable-card move behavior remains covered. The added author tests supplement rather than replace the earlier assertions.

Fresh independent archive executions, all PASS:

| Own artifact | Coverage |
| --- | --- |
| `d1-board-parent-baseline-astra-728822d.log` | Original 4: absent/envelope Tasks success, durable receipt/idempotence, present null/envelope-null refusal |
| `d1-board-boundaries-astra-728822d.log` | Unchanged 15: prior three failures plus corrupt/queued source, ID, owner/generation, move, pending/quota/retry/session controls |
| `d1-board-repair-astra-728822d.log` | New 4: truly absent Board refusal; queued same-ID pending or creation-time replacement; existing Task versus different pending retry refusal |

The command is intentionally conservative when the retained pending payload differs from the existing Task: it refuses for review and does not overwrite that Task or silently acknowledge the newer payload. This is not automatic reconciliation of human edits. General concurrent Board whole-object writes and cross-key transactions remain outside this acceptance.

## Calendar cleanup review

The product diff only removes `setEventsRaw(result.data)` and its destructured setter/dependency from `useUserCalEvents`. It still awaits `mutateCanonicalDataset`, returns null on failure and returns committed domain data on success. Real domain validation, owner capture, absent initialization and locked entity preconditions are unchanged. Reactive projection continues through `usePref` and the canonical writer's same-tab publication.

| Own artifact | Coverage |
| --- | --- |
| `d1-calendar-independent-astra-2fed984.log` | Original 11: real Calendar domain validation, queued save/delete, create concurrency, quota/latest draft, Promise rejection, missing target and A→B |
| `d1-calendar-publication-astra-2fed984.log` | New 2: actual two-hook create/update/delete propagation, exactly one write/publication per success, retained receipt, zero legacy-write warnings; quota failure publishes nothing and preserves both hooks/raw bytes |

All 13 PASS. The publication test invokes the real hook and storage implementation; it does not replace the removed setter with a mock. Before logs, including Calendar warnings and earlier failures, remain intact.

## Reproduction and evidence boundaries

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 728822d d1-board-parent-baseline astra
node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 728822d d1-board-boundaries astra
node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 728822d d1-board-repair astra
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs 2fed984 d1-calendar-independent astra
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs 2fed984 d1-calendar-publication astra
```

Runners use fixed archives and new `astra` suffixes; parent logs were neither overwritten nor attributed to this reviewer. Parent `ab3a150` independently had Board's 4+15 PASS; `7f19aec` records Board package 318 PASS and Calendar 26 PASS. Author Calendar package 372/types/lint PASS remains author evidence. Those already sufficient broad repetitions were not rerun mechanically here; this review adds source analysis, unchanged critical independent assertions and targeted new checks. No native browser run or full Tasks repair acceptance is added.

Tasks' six failures in `0143952`, Board detail checklist/attachment/comment draft-loss work, account-wide D2, old-client rollout and production activation remain separate. D2 implementation entry requirements are specified in `20260909-d2-implementation-entry-contract.md`; the existing architecture is sufficient to begin that bounded work, not to claim its completion.

~~~~

</details>

### Historical source: docs/reviews/web-board-workspace-astra-review/20260909-calendar-fixtures-9a7e66b-acceptance.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Calendar fixture adaptation — independent bounded acceptance

Reviewer: Astra (non-author), 2026-09-09. Web module. Fixed snapshot `9a7e66b20071b3041ee27f244237ae3ccde8f906`, including `1998df335fd1e5b18e9b315f06769b1d0ea7bbba`.

**Verdict: accept this Calendar test adaptation.** The independent package rerun passes all 50 files / 372 tests; the unchanged independent D1 assertions pass 26 / 26. This resolves the previously reproduced Calendar fixture-suite failure at `4202c79`; its original 20 FAIL log and review `45c74c3` remain intact. This does not close full D1, AI-02, Board, D2 lifecycle coordination, or the old-client activation gate.

## Source review

The Calendar diff from `4202c79` to this snapshot contains exactly five test files: `CalendarModule.recurrence.test.tsx`, `CalendarModule.dst-recurrence.test.tsx`, `CalendarModule.eventcrud.test.tsx`, `CalendarModule.saveRecovery.test.tsx`, and `YearView.test.tsx`. Neither Calendar product code nor its setup/activation/storage mocks changed in this adaptation. The two requested commits contain those test changes plus the author's review document.

- All new `seedCalendarEvents` physical writes happen before render. They install existing legacy domain data as a fixture because the activated legacy setter now correctly refuses canonical writes. Real create, edit, recurring edit, delete, retry and export still use rendered UI interactions; no operation was replaced by a raw storage write.
- DST dates/times, recurrence instance counts, source-date/tag attributes, overlap layouts, year overflow/colors, deletion absence, draft text, quota failure alerts, exact prior bytes and old-account refusal assertions are retained. There are no skipped tests or relaxed expected counts.
- Successful async create uses `findByText`; recurring edit/delete and CRUD deletion wait for the actual rendered change. Failure tests wait for the failure alert or drain their fake timer/microtask turn with `advanceTimersByTimeAsync(0)`. Retry success waits for physical persistence and inspects `JSON.parse(raw).data`, asserting exactly the latest title rather than accidentally counting envelope metadata as events.
- The existing post-render `localStorage.setItem(key, newer)` in `saveRecovery` is unchanged external malformed-domain fault injection, not a substitute for the user's retry. The string contains an incomplete event, so this is corrupted-source preservation evidence, not evidence for merging a valid concurrent edit. The final negative `waitFor` checks bytes/editor invariants that can already hold before completion; it is not, by itself, a delayed-lock completion oracle. The separately rerun D1 queued save/delete/create, Promise rejection and session tests supply those narrower independent async checks. No new product defect is claimed from that limitation.

## Independent execution

Both runners extracted product, package tests and setup from `git archive 9a7e66b`; installed dependencies were linked, and package imports resolved to the archive. The full Calendar run used the Calendar package as both Vitest root and process working directory. No working-tree Tasks source or author logs were used as proof. Assertions/runners were not changed for this rerun.

```sh
node docs/reviews/web-board-workspace-astra-review/verify-six-subscribers.mjs 9a7e66b six-calendar-full-rerun
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs 9a7e66b
```

| Independently produced log | Result |
| --- | --- |
| `six-calendar-full-rerun-9a7e66b.log` | 50 files / 372 tests PASS |
| `d1-calendar-independent-9a7e66b.log` | 11 PASS: strict domain, queued target/source, quota/latest draft, rejected Promise, missing target, A→B |
| `d1-shared-independent-9a7e66b.log` | 8 PASS: receipt preservation, capacity clear/no-op, queued revision, same-tab publication, invalid seed, reset refusal |
| `d1-calendar-pending-9a7e66b.log` | 1 PASS: old create completion preserves new editor |
| `d1-calendar-repair-boundaries-9a7e66b.log` | 4 PASS: old delete/new session, protected reset, low-year leap day, receipt-only revision |
| `d1-reset-outcome-9a7e66b.log` | 2 PASS: actual failed-read refusal and normal removal control |

The 372 and 26 are different suites with overlapping contracts; they are not a combined product coverage total. Types/lint were author-reported, not independently rerun in this test-only batch. No native browser or provider-network claim is added.

## Known cleanup and remaining boundaries

The full log retains stderr `refusing legacy write over protected canonical xai_calendar_events` warnings. Fixed `src/internal/eventStore/useUserCalEvents.ts:69–72` awaits a successful canonical mutation, then redundantly calls `setEventsRaw(result.data)` through the protected legacy setter. The setter refuses that extra write; same-tab publication supplies the domain update. Successful physical persistence, rendering and receipt preservation are verified above. This is an existing cleanup item, not new evidence of data corruption or false save success, and warnings were not hidden to obtain PASS. A later owner can remove the redundant setter while retaining bus-driven updates.

Tasks normalization/composer changes and Board task-link integration remain separate pending batches. This review changes only its own evidence directory, preserves previous failures, and does not authorize production activation or release closure.

~~~~

</details>

### Historical source: docs/reviews/web-board-workspace-astra-review/20260909-d1-496039f-review.md

<details><summary>Retained complete historical text</summary>

~~~~text
# D1 shared writer and Calendar UI — Astra independent review

Web. Fixed product `496039f`, including shared writer `3a764a1`, repair `151982b`, sync guard `3e0b611`, and Calendar UI `496039f`. Product imports use immutable git archives. Sol's dirty event-bus/four-subscriber work was excluded. Review changes only this directory.

**Verdict: do not accept this Calendar D1 integration.** Shared writer preservation checks pass, but four distinct obligations remain blocked by actual independent failures. C primitive acceptance remains bounded and its 37 assertions still pass. Complete D1/AI-02/REL-05 and public activation remain open.

## Results

| Independent suite | Result | Evidence |
| --- | --- | --- |
| Calendar domain, real Module queued actions and recovery | 5 PASS / 6 correct FAIL | `d1-calendar-independent-496039f.log` |
| Ordinary writer, real human-edit replay, reset | 7 PASS / 1 correct FAIL | `d1-shared-independent-496039f.log` |
| Real Module old pending completion versus new editor | 1 correct FAIL | `d1-calendar-pending-496039f.log` |
| Original C contract | 29/29 PASS | `c-primitive-independent-496039f.log` |
| C actual helper/limits | 8/8 PASS | `c-primitive-boundaries-496039f.log` |

Run the D1 suites with `node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs 496039f [suite]`. Run each C suite with the existing `verify-c-primitive.mjs`. The 20 new D1 assertions yield 12 PASS / 8 correct FAIL; failures are retained without loosening the oracles. These are actual React/jsdom components, native jsdom Storage and controlled lock delays, not browser multi-tab evidence. Author 30-test results are not used as independent proof. Earlier B2 and Calendar recovery evidence remains unchanged; new async tests preserve the draft/byte/retry business oracles while using the new result contract.

## Confirmed findings and minimum ownership

1. **P1 — Calendar guard admits invalid domain data (four FAIL).** `internal/eventStore/useUserCalEvents.ts:66–73` checks strings, identity and color but omits the civil date, time/duration and recurrence rules. Real `create` succeeds and persists an impossible `2026-04-31`, a zero-duration event, and `recurrence:{kind:'garbage'}`. For each fixture, the existing Calendar owner migration validator independently rejects the same event shape. A fourth test seeds an impossible-date envelope and shows an update succeeds and rewrites those bytes. This is both output-validation and current-domain-validation failure, not merely an overly permissive display projection.

   Minimum owner: Calendar `useUserCalEvents.ts` plus a shared pure validator extracted/exported from the already implemented `accountMigration.ts` rules, and targeted tests. Reuse the same real domain guard for migration/current data/mutation output. Preserve A1 low years/leap days. Do not edit Sol's dirty `aiCommandDomain.ts` or four subscriber files concurrently; any later shared-validator convergence needs a handoff.

2. **P1 — queued edit/delete overwrites a newer target (two FAIL).** `CalendarModule.tsx:158–204` compares `getById` against the composer record before awaiting. The hook's `update/remove` mutation uses the latest locked target with no captured baseline/precondition. Tests open actual `CalendarModule`, edit the real event, click Save or Delete, hold the actual lock callback, replace physical bytes with a valid revision-2 envelope containing a newer external title, then release. Save overwrites that title; delete removes the updated target. Both report success by closing the editor.

   Minimum owner: `CalendarModule.tsx` + `useUserCalEvents.ts` API/tests. Capture the edited/deleted entity baseline and identity when the user submits and pass it into the mutation; compare it against the locked current entity before changing/removing it. A receipt-only revision change can be accepted if the target baseline still matches and latest receipts are retained. A mismatched target must return conflict and keep the editor/draft open. Do not weaken the oracle to accept any newer target simply because its ID matches. Preserve valid create merging: the independent queued-create control safely retains an external addition and creates one local event.

3. **P2 — an old pending completion closes a new editor (one FAIL).** The real sequence is Save new event A while its lock is pending → Cancel → Add event → type a new unsaved B draft → release A. `CalendarModule` unconditionally executes `setComposer(COMPOSER_CLOSED)` after A completes, closing B. The log explicitly shows B's draft text remains in the DOM while its dialog closes; this proves incorrect editor-session handling, not physical deletion of all draft bytes.

   Minimum owner: `CalendarModule.tsx` and `EventComposer.tsx`. Associate submit completion with its captured composer session/operation identity and only change that session's UI. Alternatively, consistently prevent dismissal/switch while pending (Cancel, ESC, backdrop and other close paths), while retaining a clear pending state. Blocking only Save/Delete does not protect the editor lifecycle. The oracle permits either safe policy.

4. **P2 — refused canonical reset still claims local success (one FAIL).** After a genuine ordinary canonical write, the real `usePref(...).meta.reset()` calls guarded removal, leaves raw bytes intact, then sets its local value to `{}` and `isDefault:true`. This known `usePref.ts:211–216` issue remains unfinished from the D1 contract. It is separate from the parent's fixed sync-guard data-preservation regression.

   Minimum owner: storage `usePref.ts` plus the targeted async reset/write surface and tests. Canonical clear/reset must await a real mutation, use a domain-valid empty value and retain receipts. A refused legacy reset must not change local value/default status. Keep unrelated preference reset signatures/behavior compatible; do not infer physical absence from a refused call.

## What passed and remains usable

- Shared writer performs a real ordinary human edit after AI commit; the durable AI receipt survives and replay keeps the newer human value with unchanged bytes. Clear retains all 512 existing receipts, and an unchanged result performs no write.
- Shared `expectedRevision` rejects a queued revision mismatch before invoking the mutator. The missing protection is Calendar caller preconditions, not evidence that this API's revision check is broken.
- Two real `usePref` hooks receive domain-only data after commit even when an earlier notification listener throws; the writer still returns success with one canonical write. Null/array/syntax-invalid physical data never invokes the initializer.
- Real Calendar queued creation preserves a legitimate external addition and sequential duplicate Save while pending creates one local event. Actual quota failure keeps the editor/form, then Retry saves the latest edited draft once. EventComposer catches an actually rejected Promise and permits retry. Missing update/delete refuses without creating a replacement record. A queued A→B create refuses and writes neither account.
- C's 29 original primitive assertions plus eight helper/capacity boundaries remain green against this exact product hash.

`useUserCalEvents.ts:77–79` calls `setEventsRaw(result.data)` after the shared writer already committed/published. With activation enabled the legacy setter correctly refuses. The independent same-tab check confirms bus projection works, and the hook ignores this false result, so no extra persisted write or false user failure was observed. Remove this redundant rejected legacy call when fixing the hook; do not restore a sync bypass to make it return true.

This review does not accept Tasks/Board ordinary caller conversion, their seed/normalization integration, native AI/UI concurrency, six subscriber durable replay, D2 account migration/rollback coordination, or the old-client activation gate. Parent's migration acknowledged-write FAIL evidence remains open. Preserve these D1 counterexamples and rerun the exact tests against the repair commit before reassessing bounded Calendar acceptance.

~~~~

</details>

### Historical source: docs/reviews/web-board-workspace-astra-review/20260909-d1-d8412d3-reset-acceptance.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Reset outcome repair — Astra bounded acceptance

Web. Fixed product `d8412d365f0d91b0ad7b97f0c2652a582b85b0f9`, isolated with git archive. **Accept the narrow reset repair and the previously tested Calendar recovery cases.** Original 24 plus reset-outcome two assertions pass unchanged: 26/26. This does not accept full D1, Tasks/Board caller integration, D2 or AI-02.

Independent command: `node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs d8412d3`.

| Suite | Result | Evidence |
| --- | --- | --- |
| Calendar domain/queue/recovery | 11/11 PASS | `d1-calendar-independent-d8412d3.log` |
| Shared writer | 8/8 PASS | `d1-shared-independent-d8412d3.log` |
| Pending create | 1/1 PASS | `d1-calendar-pending-d8412d3.log` |
| Repair boundaries | 4/4 PASS | `d1-calendar-repair-boundaries-d8412d3.log` |
| Actual reset outcome | 2/2 PASS | `d1-reset-outcome-d8412d3.log` |

Source now makes `removePref` return false for SSR/read refusal/protected data/removal failure and true only after physical removal returns. `usePref.reset` consumes that result for canonical keys rather than inferring success from `readRawPref`'s null fallback. The original injected failure now records two reads, zero removals, preserved local legacy value and `isDefault:false`; exact storage bytes remain unchanged. The real successful legacy removal control also passes.

Original `496039f`, `f764731` and `db1eddc` FAIL evidence is retained. Pre-existing author HEAD logs have `author-d8412d3-*` names and are not counted as independent evidence. This run used the original assertions and real jsdom Storage; no native/full-product result is inferred. The separate `4202c79` six-subscriber review is not included in this acceptance.

~~~~

</details>

### Historical source: docs/reviews/web-board-workspace-astra-review/20260909-d1-db1eddc-rereview.md

<details><summary>Retained complete historical text</summary>

~~~~text
# db1eddc narrow repair — independent follow-up

Web. Fixed product `db1eddccadfecdbea2e078e09c4b5808d25b0e56`; immutable git archive, excluding Sol subscriber changes and the parent's separate native harness. No product edits or push.

**Bounded result: the original 24 assertions pass, including both f764731 failures. Calendar's tested cross-editor delete completion is repaired. Keep one narrow storage reset outcome blocker.** Source review of the newly added reset postcondition warranted a direct read-failure test; it produces 1 correct FAIL and 1 normal-removal PASS. Complete D1/AI-02 remains open.

| Independent execution | Result | Evidence |
| --- | --- | --- |
| Calendar original domain/queue/recovery | 11/11 PASS | `d1-calendar-independent-db1eddc.log` |
| Shared writer original | 8/8 PASS | `d1-shared-independent-db1eddc.log` |
| Pending create/new editor | 1/1 PASS | `d1-calendar-pending-db1eddc.log` |
| Original repair boundaries | 4/4 PASS | `d1-calendar-repair-boundaries-db1eddc.log` |
| Reset actual-outcome read failure | 1 correct FAIL / 1 PASS | `d1-reset-outcome-db1eddc.log` |

Run `node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs db1eddc [suite]`. Original 20+4 assertion files were not changed. Their original `496039f`/`f764731` FAIL logs remain intact. Existing author runs were moved to `author-db1eddc-*` filenames before independent execution; HEAD-named author output is not fixed-hash acceptance evidence.

## Confirmed repairs

`EventComposer` now captures a session counter for deletion and checks it before calling `onClose` after the awaited result. In the original actual Module sequence (old Delete → Cancel → new create editor → old delete completion), the new editor and its current draft remain open. The old event deletion still commits as requested. The original pending-create, locked target-baseline, real Calendar schema, low-year, receipt-only revision and failure/retry checks also remain passing.

For reset, a preflight result-bearing snapshot now protects a readable envelope with activation closed, as well as corrupt/unsupported/unavailable states and the activated protocol. Both original reset cases pass. The additional post-removal check, however, uses the lossy `readRawPref` compatibility helper rather than a real removal outcome.

## Remaining P2: failed reset still claims success if outcome read is unavailable

The new focused test uses actual jsdom Storage, a captured account scope, a present legacy JSON preference and the real `usePref`/`removePref`. The first exact-key preflight read succeeds. Subsequent exact-key reads throw a synthetic `SecurityError`:

- `removePref`'s own protected read fails and correctly returns without calling removeItem.
- `usePref`'s new `readRawPref` postcheck catches the next read error and returns null.
- The hook interprets null as absence, sets local `{}` and `isDefault:true` while original physical bytes remain present.

The independent log records `reads:3`, `removeCalls:0`, `localValue:{}`, `isDefault:true`; after restoring the read method, exact original bytes are asserted. The readable legacy-removal control performs the real removal and resets successfully. This is a deterministic storage-fault seam, not a claim about browser permission timing or Calendar domain validation.

Minimum ownership remains storage `usePref.ts` plus an internal result-bearing removal helper if needed. Prefer propagating actual `removeItem` success/refusal to the hook. If a postcondition is used, require a result-bearing physical read that proves absence; an unavailable read must not authorize local reset. Avoid another lossy null check. Keep unrelated preference behavior and all 24 passing original assertions.

No additional product investigation was performed. Calendar's demonstrated repaired paths may proceed as bounded evidence, but this reset claim is not fully accepted. The shared ordinary clear API, Tasks/Board caller work, D2 lifecycle coordination and old-client activation gate remain separate; none is closed by this follow-up.

~~~~

</details>

### Historical source: docs/reviews/web-board-workspace-astra-review/20260909-d1-f764731-rereview.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Calendar repair f764731 — Astra independent follow-up

Web. Fixed product `f764731`, including committed pure Calendar guard `863e738`. All product imports came from git archives; Sol's dirty six-subscriber/event-bus work was excluded. No product edits.

**Verdict: original failures repaired in their tested cases, but retain two narrow Calendar/reset blockers.** The original 20 assertions pass unchanged. Four targeted tests of the new repair boundaries yield two PASS and two correct FAIL. This does not accept complete Calendar D1, all D1, AI-02, or production activation.

## Independently executed evidence

| Suite | Result | New log |
| --- | --- | --- |
| Original Calendar domain/queued/recovery | 11/11 PASS | `d1-calendar-independent-f764731.log` |
| Original shared writer/reset | 8/8 PASS | `d1-shared-independent-f764731.log` |
| Original pending-create editor session | 1/1 PASS | `d1-calendar-pending-f764731.log` |
| Repair-specific boundaries | 2 PASS / 2 correct FAIL | `d1-calendar-repair-boundaries-f764731.log` |

Run `node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs f764731 [suite]`. The original suites ran before adding the separate boundary suite; original assertion files were not altered. Original `496039f` FAIL logs remain unchanged. Existing author-generated output was renamed `author-run-d1-calendar-independent-HEAD.log`, `author-run-d1-calendar-pending-f764731.log`, and `author-run-d1-shared-independent-f764731.log` before my runs. Those files are preserved as author provenance only; the HEAD-named log is not treated as fixed-hash independent evidence.

## Confirmed repairs

- `useUserCalEvents` now uses the committed `isCalendarEventStore` civil-date/time/duration/recurrence guard. Original invalid input/current-domain tests now refuse without writes. New valid `0004-02-29` control successfully persists the exact civil date.
- Module passes its captured edited entity into hook update/remove; comparison occurs inside the shared writer's locked mutation. Original queued external-target save/delete cases preserve bytes and keep recovery open. A new receipt-only revision-change control still permits a legitimate edit while preserving the latest receipt map.
- Module's composer object identity check prevents an old pending **create** completion from closing the newly opened editor. The original create-session test now passes.
- With canonical activation enabled, refused legacy reset no longer changes local state. Shared writer receipt preservation, real later-human-edit replay, clear/no-op and notification tests still pass.

## Remaining repair-local failures

1. **P2 — delete completion still closes a different editor.** Actual Module test: open event → queue Delete → Cancel → open new create editor and type its draft → release old delete. The Module token check does not close the new editor, but `EventComposer.tsx`'s `handleDelete` still executes unconditional `onClose()` after `await onDelete(...)`. The log shows `oldEventDeleted:true`, `editorOpen:false`, and the new draft text still present in DOM. The pending old deletion committed as requested; the incorrect action is closing the new editor. This is the deletion counterpart of the repaired create-session contract, not an expanded feature request.

   Minimum ownership: `EventComposer.tsx` and its focused tests, with Module's session contract kept intact. Remove redundant unconditional close if the parent owns result-dependent closing, or gate all post-await UI effects by the captured composer session. Handle the failure path's state updates consistently too. Do not close whatever editor happens to be current when an older Promise settles.

2. **P2 — reset still claims success for a protected envelope when activation is closed.** The repair returns early only when `isCanonicalCommandActivationEnabled()` is true. With an already persisted valid envelope and activation false, protected `removePref` correctly refuses removal, but `usePref.meta.reset` sets `{}` and `isDefault:true`. The new test proves exact raw bytes survive while local value/default metadata falsely change. Closed activation is a supported compatibility state; it is not permission to present a failed reset as successful.

   Minimum ownership: storage `usePref.ts` plus any result-bearing removal/reset helper needed to express the actual outcome. Base local reset state on a real successful removal/canonical clear, or reject legacy reset for every protected canonical state. Do not replace the activation check with another lossy read/default assumption. Preserve unrelated preference behavior and the passing activation-enabled case.

The redundant postcommit `setEventsRaw(result.data)` remains in the hook; it is still refused by the activated sync guard after bus publication, and its result is ignored. As before, no additional physical overwrite or false failure is claimed from that call. Migration and mutation validators now differ in their optional-field strictness; this follow-up verifies the new mutation guard and previously required civil-date compatibility, not a full migration-schema consolidation.

These results are React/jsdom and controlled-lock tests, not native tabs or full six-subscriber acceptance. Preserve the two new FAIL assertions and rerun against the narrow repair. C primitive and previously accepted B1/B2 remain bounded; D2 lifecycle and old-client activation gates remain open.

~~~~

</details>

### Historical source: docs/reviews/web-calendar-lock-shim-regression/20260914-regression-and-fix.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Calendar canonical-write regression: stale Web Locks test shims

Parent session, 2026-09-14. Found while independently re-running the web package
suites after the 2026-09-08 full-product audit line paused at `8e12334`.

## Symptom

`pnpm --filter @repo/plugin-web-calendar test` at `8e12334`: **50 files, 23 of 372
tests failed**, reproducible on a solo run (not the parallel-load timeout flake
seen in `@repo/xai-web-shell`, `@repo/plugin-web-storage`, `@repo/plugin-web-ai-chat`,
`@repo/plugin-web-bookkeeping` and `@repo/plugin-web-countdown`, all of which pass
solo). Every account-scoped calendar write silently failed:

- `useUserCalEvents` create/update/remove/getById — `expected [] to have a length of 1`
- `aiCreateSubscriber` CS-1/CS-2/CS-3, `aiMutateSubscriber` CS-DEL-1, CS-UPD-1/2/3
- `CalendarModule` eventcrud / recurrence / saveRecovery, `aiCalendarInputValidation`

## Bisect

The calendar package's own last change is `2fed984` (2026-09-09 17:11). Holding the
working tree at `8e12334` and restoring only `packages/plugin-web-storage/src` to
each historical revision:

| `plugin-web-storage/src` at | calendar result |
| --- | --- |
| `2fed984` | 372/372 PASS |
| **`e9ff409`** (2026-09-09 17:40, `feat(storage): coordinate account lifecycle writers`) | **21 failed** |
| `c201a1d`, `3472b69`, `5ed9329`, `20a4591` | 23 failed |
| `8e12334` (HEAD) | 23 failed |

## Root cause

`e9ff409` wrapped `mutateCanonicalDataset` / `commitCanonicalCommand` in the shared
account lifecycle lock via `browserAccountLock`. That commit still tolerated the
two-argument test shim (`request.length < 3 ? request(name, run) : ...`). The
follow-up `e9fb5e7` (`fix(storage): call native account locks with receiver`)
removed the compatibility branch and now always issues the native three-argument
form `navigator.locks.request(name, { mode }, run)`.

Every other package's fixtures were updated to a signature-tolerant shim (see
`plugin-web-settings-rest/src/__tests__/{dateTimePane,notificationsPane,morePane,
accountDeletionRecovery,useAccountDeleteOrchestrator}.test.tsx`). Two calendar
fixtures were not:

- `src/__tests__/setup.ts` — `request: (name, callback) => callback()`
- `src/__tests__/canonicalSubscriberHarness.ts` — same two-argument form

With the three-argument call these shims invoke `{ mode: "shared" }` as the
callback, throw, and `mutateCanonicalDataset` returns `{ ok: false, reason:
"lock-failed" }`. Parent diagnostic at HEAD before the fix, run inside the calendar
jsdom environment:

```
SCOPE=   {"kind":"account","accountId":"consumer-test","generation":"fixture","epoch":2}
NAVLOCKS= object true 2      (navigator.locks present, request.length === 2)
RESULT=  {"ok":false,"reason":"lock-failed"}
```

Product source is not implicated: the three-argument form is the standard Web Locks
signature, and no `packages/**/src` non-test file was changed by this repair.

## Fix

Fixture-only, two files in `packages/xai-web-calendar/src/__tests__/`:

1. `setup.ts` — resolve the callback from either argument position.
2. `canonicalSubscriberHarness.ts` — same signature tolerance, **plus** replace the
   single global serialization queue with one queue per lock name. Account writes
   now nest (shared lifecycle lock held while the per-dataset lock is requested
   inside it); a single global queue makes the inner request await the outer
   request's own result and deadlocks. Same-name requests remain serialized, which
   is what the CS-2 / CS-UPD-3 idempotency and ordering cases depend on.
   `settleCanonicalCommands` drains repeatedly because one generation of queues can
   enqueue the next.

## Result

- `pnpm --filter @repo/plugin-web-calendar test` → **50 files, 372/372 PASS**, exit 0
- `pnpm --filter @repo/plugin-web-calendar check-types` → exit 0
- `pnpm --filter @repo/plugin-web-calendar lint --max-warnings 0` → exit 0

## Boundary

This restores test coverage that had been silently dead since `e9fb5e7`; it is not
independent proof that Calendar writes behave correctly in a real browser after the
account-lifecycle change. No audit item is closed by this repair, and no product
behaviour was modified.

## Process note

The audit's per-caller acceptance loop verifies the package under repair and its
named callers. `xai-web-calendar` was accepted at `2fed984` and never re-run across
the following 15 `plugin-web-storage` commits, so the break went unnoticed for the
rest of the audit line. A full web-package sweep after each shared storage batch
would have caught it the same day.

## Follow-up: meditation shim (2026-09-15)

`packages/xai-web-meditation/src/__tests__/setup.ts` carried the same
two-argument-only shim. It was not broken: `sessionController.ts:72` calls
`navigator.locks.request(name, run)`, the two-argument native form, so fixture and
product agreed. The trap was latent — it would fire the moment meditation joined
the account-scoped canonical write path that the D2 caller queue is migrating
packages onto.

Cleared preemptively with the same model as the calendar harness: resolve the
callback from either argument position, and queue per lock name instead of
globally so nested account locks cannot deadlock. Verified against the setup with
a temporary probe (since removed): `browserAccountLock("acct:lifecycle", "shared",
run)` with a nested different-name request resolved in outer-then-inner order, and
two same-name requests still ran serialized.

- `pnpm --filter @repo/plugin-web-meditation test` → 16 files / 134 passed, exit 0
  (unchanged from before the shim change — no test depended on global
  serialization across lock names)
- `check-types` exit 0; `lint --max-warnings 0` exit 0

No other package fixture installs a two-argument-only `navigator.locks` shim.

~~~~

</details>

### Historical source: docs/reviews/web-ai-calendar-sol-independent/review.md

<details><summary>Retained complete historical text</summary>

~~~~text
# AI Calendar input validation A1 — Sol independent native review

## Final bounded verdict at fixed `20a0748`

Fixed repaired revision: `20a07480b35d4a9af796b68601416edbeed84548`.

**PASS for the bounded A1 Calendar input-validation repair.** The exact unchanged runner and assertion matrix that produced the `afd10ff` failure now exits 0: all 22 invalid raw-input chains return `invalid`, perform zero canonical writes, preserve bytes and withhold model success; all five valid controls persist exactly once and receive a matching model continuation; the same-request invalid → corrected → replay sequence still commits exactly once.

The original failure below and `native-afd10ff.log` remain preserved. The independent after output is `native-20a0748.log`, produced by:

```bash
node docs/reviews/web-ai-calendar-sol-independent/verify-native.mjs 20a0748
# exit 0; 22/22 invalid and 5/5 valid controls pass
```

This independent PASS closes only the local A1 repair gate. It does not close complete AI-02, authorize phases B–D, or verify durable reload/new-epoch idempotency, cross-tab serialization, crash recovery, a real provider, hosted authentication or production deployment. Those remain subject to the Astra architecture/closure gate.

## Verdict at fixed `afd10ff`

Fixed revision: `afd10ff174cdb26e7f2b37202e8f41db58a2e623`.

**BLOCKED: 1 independently reproduced error-classification defect.** Twenty-one of twenty-two invalid raw-input chains pass, all five valid controls pass, and same-request correction/replay passes. However, an update `startTime` supplied as the one-element array `["09:00"]` returns `reason: "storage"` instead of `reason: "invalid"`. No data is written and no model success is sent, but a type error is misreported as a storage failure. A1 cannot pass until the unchanged native assertion passes on a fixed product commit.

This is a focused A1 review. It does not close AI-02 or its durable reload, new-epoch, cross-tab and crash-recovery scope.

## Reproduction

```bash
node docs/reviews/web-ai-calendar-sol-independent/verify-native.mjs afd10ff
# exit 1; 21/22 invalid cases pass, all positive controls pass
```

The runner expands the exact commit with `git archive`, resolves every `@repo/*` product import from that snapshot, launches native Google Chrome 152 with an isolated temporary profile, and replaces the provider adapter with a deterministic local stream. It uses synthetic accounts and actual `AiChatModule`, confirmation handlers, Calendar subscriber hooks, typed event bus, account-scoped native `localStorage`, receipt handling and model continuation. No real provider, credential, user profile or production endpoint is used.

## Correct failure

Raw model input:

```json
{ "id": "event", "startTime": ["09:00"] }
```

Observed full chain:

1. The actual confirmation renders `at: 09:00`.
2. The typed `web:calendar:update-requested` payload preserves `patch.startTime` as the array `["09:00"]`.
3. No canonical storage write occurs; preceding bytes remain unchanged.
4. The receipt is `{ ok: false, reason: "storage" }` and the UI displays the internal `storage` token.
5. Model call count remains one, so the system does not falsely report success.

The cause is coercive validation in the update subscriber: `HHMM_RE.test(p.startTime)` converts `["09:00"]` to the string `"09:00"`, so it passes. `buildISOTimes` then calls `.split()` on the array and throws. `executeToolWrite` catches that programming/type error and maps it to `storage`.

The minimal product repair is to require `typeof p.startTime === "string"` before applying `HHMM_RE`, matching the create subscriber's validation discipline. A regression should preserve this native input and require `invalid`, zero writes, unchanged bytes, retained confirmation and no second model call. The assertion in this review must not be weakened or rewritten to accept `storage`.

## Passing matrix at the blocked revision

The 21 correctly rejected raw inputs cover create and update impossible/non-leap dates, null and array dates, null/array/empty-array times other than the defect above, string/decimal/null/array durations, and requests crossing the 23:55 same-day boundary. For every passing invalid case, the actual confirmation includes the supplied value, the registry-to-event payload preserves its type/value, the receipt is `invalid`, canonical write count is zero, bytes are unchanged, the confirmation remains, and the model receives no success continuation. An update combining an impossible date with a valid new title also rejects the whole patch without changing the title.

Five actual UI positive controls each produce exactly one canonical commit, a success receipt with the correct target and one matching success continuation:

- leap-day create at `2024-02-29T10:15` for 30 minutes;
- create with omitted optional time/duration, confirmed and persisted as `09:00`/60 minutes;
- create at `23:50 + 5`, ending exactly at `23:55`;
- update to leap day while preserving the existing one-hour local time;
- update to `23:50 + 5`, ending exactly at `23:55`.

The same-request lifecycle uses one requestId for an invalid `2026-02-31` update, a corrected `2024-02-29` retry, and a successful replay. Receipts are `invalid`, `success`, `success`; only the corrected operation writes, and the replay leaves bytes unchanged. Final stored data contains the corrected title and `2024-02-29T09:00`–`10:00` exactly.

The compact failing output is preserved in `native-afd10ff.log`. The runner retains the full per-scenario confirmation, event payload, receipt, storage-write count and final-data assertions for deterministic reruns.

~~~~

</details>

### Historical source: docs/reviews/web-local-time-contract/dev_log.md

<details><summary>Retained complete historical text</summary>

~~~~text
# web-local-time-contract — Bugfix Work Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-local-time-contract (web) |
| Title | REL-01 六功能自然日、绝对时间与午夜刷新合同不一致 |
| Current Phase | BUG_VERIFY |
| Status | FIX_READY_FOR_VERIFY |
| Executor | Codex bug-fix |
| Updated | 2026-09-09 11:06 America/Los_Angeles |
| Suggested Next | bug-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |

## Reproduction Protocol

见 `20260909-bug-diagnose.md`。Pacific瞬间2026-09-09T06:30Z：Habits/Calendar为09-09，TT为09-08；DST自然日23/25小时，固定24小时端点错误。Calendar/Statistics/Metrics mount memo冻结；Tasks依赖分桶。

## Root Cause

日期身份与真实瞬间混用、UTC与设备本地口径不一致、React日期时钟没有生命周期调度、Tasks缺少真实dueDate。Calendar DST表仅覆盖2026 Pacific，冒充通用本地时间。

## Fix Rationale

以现有tokens公共API为统一owner，S1共享helper/hook→S2六包接线→S3Tasks真实日期闭环→S4文档/回归/独立verify。保留历史日期键和绝对时间，禁止猜年份或平移旧数据。详细API、修改清单、验收矩阵见诊断文件。

## Verification

- 当前Tasks两套31测试PASS；Calendar两套7测试PASS，验证的是旧行为。
- Node TZ=America/Los_Angeles独立日期表达式复现日键分歧与23/25小时边界。
- 尚未实施修复，未执行完整六包或浏览器修复验收。

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-09-09 10:55 America/Los_Angeles | Codex bug-diagnose | 核对六包当前API与测试、独立复现日键/DST、写入四阶段修复与验证合同 | — | bug-fix S1→S4 |

## S1/S2 implementation receipt

- Shared tokens public civil-date API and midnight/resume clock implemented; five consumer packages migrated to device-local day semantics.
- Calendar uses actual offset transitions, fractional row heights, elapsed-time now line; repeated floating HH:MM resolves to earlier occurrence.
- Metrics new/edit writes UTC ISO measuredAt and resolves today/yesterday at save. Existing offsetless strings remain unchanged because their original timezone is unknowable.
- Tasks S3 completed in `337d2b8` by the parallel `rel01_tasks_fix` worker; whole REL-01 is ready for independent verification, not yet verified/shipped.
- Full package runs: tokens 55, Habits 126, Calendar 338, Statistics 151, Metrics 14, TT 28 passed (712). Subsequently Calendar added one fractional-row render assertion (target 339); TT added one date-boundary test (target 29); focused suites passed. Final token resume tests and Metrics suite re-run passed.
- UTC / America/Los_Angeles / Asia/Shanghai / Australia/Lord_Howe focused localDate suites passed for tokens, Habits, Calendar, Statistics, Metrics; TT focused matrix also passed all four zones.
- `pnpm --filter @repo/web check-types` PASS. Product build/browser independent verification belongs to parent/bug-verify; no independent PASS claimed.

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-09-09 11:04 America/Los_Angeles | Codex bug-fix | S1/S2 public API + five consumers + TZ/DST/midnight tests + API/design/test amendments | 2f04bd4 | Combine Tasks S3, then bug-verify |

## S3/S4 completion receipt (implementation verification only)

- `2f04bd4` — shared contract and five consumer packages, 57 files.
- `337d2b8` — Tasks dueDate full flow, 21 files. Inputs/edit/move/Board linkage/persist, midnight reprojection, legacy fields and source retained; parent clock updates preserve detail drafts.
- Tasks full run: 16 files / 156 cases PASS; typecheck and lint PASS. UTC/Pacific/Shanghai focused date suite: 3 files / 32 cases PASS in each zone (repeat coverage, not extra unique cases).
- Remaining token test strengthens non-circular DST assertions with known Pacific23/25 and Lord_Howe24.5/23.5 values; all four zones passed. Calendar fractional-row render and fall-back earlier-occurrence tests passed.
- Implementation validation totals: 714 unique cases across tokens/five consumers, plus156 Tasks cases =870. The last-added two cases ran in focused follow-up suites; this is not a claim that a single 870-case command was run.
- Web typecheck PASS. Independent bug-verify must still inspect the combined commit range, re-run original reproductions, and run Web build/browser lifecycle checks. No account-cloud/native runtime behavior is introduced or claimed.

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-09-09 11:06 America/Los_Angeles | Codex bug-fix | Combine S1–S4 implementation receipts; Tasks closed; fixed-value DST matrix verified | 2f04bd4, 337d2b8 | bug-verify |

~~~~

</details>

### Historical source: docs/reviews/web-local-time-contract/20260909-independent-verification.md

<details><summary>Retained complete historical text</summary>

~~~~text
# REL-01 independent verification

Verdict: **PASS / READY_TO_SHIP for REL-01**, after the independently discovered Metrics instant-preservation defect was fixed in `8edd51d`. This is a feature-scoped verdict, not acceptance of all 312 tasks, current unfinished REL-03 integration, deployment, browser-closed background jobs, or account synchronization.

## Reviewed scope

Reviewed `2f04bd4`, `337d2b8`, `a81b1f9`, and follow-up `8edd51d`; checked the diagnosis, implementation receipts and parent integration receipt. The original UTC/local mismatch and fixed-24-hour expressions are replaced by local civil-day helpers, consumer clock subscriptions and actual local offset transitions. Public dependencies remain in tokens; no business code moved to core or host. Existing date identities are retained; Tasks legacy unknown-year records are not assigned guessed dates.

The parent reports 870 package tests and Web typecheck/build, but this verifier did not reuse that as an independent PASS. Independently reran tokens + Metrics: 55 + 16 tests passed (71 unique cases in this layer). Real Chromium probes below call source implementations and mount real React components with native localStorage. They use disposable profiles and local HTTP only; no user profile, production records or authenticated services were accessed.

## Found and repaired during verification

`MetricTrackerModule` originally reconstructed every edited record from HH:MM, even when only weight or notes changed. A real Chromium UI save converted Pacific fall-back `2026-11-01T09:30:00.000Z` into `08:30:00.000Z`; an ordinary `2026-09-09T18:30:45.123Z` became `18:30:00.000Z`. This broke the absolute-instant contract. See the preserved `verify-browser-metric-instant.log` before receipt.

Parent fixed this in `8edd51d`: retain original measuredAt when displayed civil date/time are unchanged. The after probe confirms both values now remain exactly equal, including fold choice and sub-minute precision. Explicitly changing time to 03:15 still writes the requested new instant: respectively `2026-11-01T11:15:00.000Z` and `2026-09-09T10:15:00.000Z`. See `verify-browser-metric-instant-after.log`; probe now throws on mismatch instead of relying on exit success alone.

## Independent browser acceptance

- `verify-browser-six-date-matrix.mjs` passed separately in UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Input is the same absolute instant `2026-09-09T06:30Z`; expected day is Sep 8 in Pacific and Sep 9 in the other three zones. It verifies Habits day keys, TT day keys, Statistics midnight, Metrics end-of-day, Tasks actual dueDate filtering, and Calendar rendered today cell. This is five consumer calculation paths plus a rendered Calendar, not six complete feature walkthroughs.
- Fixed known UTC boundary values independently anchor Statistics and Metrics assertions. Calendar DST day lengths are checked against known values: Pacific 23/25h; Lord Howe 24.5/23.5h; UTC/Shanghai 24h. Row durations sum to those values. Fold placement resolves 01:30 to the earlier occurrence; spring half-hour placement resolves 02:30 to elapsed row 2.
- The Calendar UI is then moved to Dec 31; after pageshow on Jan 1, it preserves the viewed December month. Clicking Today selects the rendered Jan 1 cell. This checks both resume freshness and preservation of user navigation.
- `verify-browser-day-recovery.mjs` passed in Pacific: actual Tasks Tomorrow contains the Jan 1 record on Dec 31, then excludes it after a Jan 1 focus event; Today contains it. Native persisted columns regroup it with dueDate and Board source intact. Legacy yearless record remains in its original column. Component unmount/remount restores the persisted task; a later pageshow refreshes the actual shared hook to Jan 4.
- The browser clock seam replaces Date only in the disposable fixture page; DOM rendering, React updates, event dispatch, date arithmetic and localStorage are real Chromium. Focus/pageshow are controlled events, not a claim that an OS background session or whole-browser shutdown was exercised. The probes do not validate UI styling because imported CSS is omitted from the test bundle.

## Baseline control and limitations

While reviewing REL-01, another worker modified plugin-web-storage for REL-03 in the shared worktree. The first Tasks fixture run read the new account scope instead of the intended legacy key. This was fixture/baseline contamination, not a REL-01 failure. Tasks and six-feature browser probes therefore pin **only plugin-web-storage source to `a81b1f9` using esbuild onLoad + git show**. Other product modules use current source, including the Metrics follow-up. This is explicitly not a full current-worktree integration PASS; the parent must run the combined integration gates after REL-03 completes.

The committed package suites cover Tasks create/edit/move/source preservation and legacy validation; browser probes independently cover its real persistence and date projection. Some broader per-feature business issues remain intentionally in separate TODOs: TT cross-midnight allocation, Pomodoro persisted runtime, account scope, gap-time event policy, and scheduled background execution. No deployment, native lifecycle or cross-vendor PASS is claimed. Claude OAuth was unavailable; this is a distinct Codex verifier.

## Evidence / commands

- `TZ=America/Los_Angeles node docs/reviews/web-local-time-contract/verify-browser-metric-instant.mjs`
- `TZ=America/Los_Angeles node docs/reviews/web-local-time-contract/verify-browser-day-recovery.mjs`
- `TZ=<UTC|America/Los_Angeles|Asia/Shanghai|Australia/Lord_Howe> node docs/reviews/web-local-time-contract/verify-browser-six-date-matrix.mjs`
- `pnpm --filter @repo/plugin-web-tokens --filter @repo/plugin-web-metric-tracker test`

Result logs are adjacent to the probe scripts. Esbuild warns that development-only import.meta guards are empty in an IIFE; the probes reach all assertions and produce explicit PASS JSON. No product code or workflow status file was edited by this verifier; the parent owns dev_log/TODO/commit updates.

~~~~

</details>

### Historical source: docs/reviews/web-local-time-consumers-independent/20260909-review.md

<details><summary>Retained complete historical text</summary>

~~~~text
# REL01 actual consumers — independent remaining blocker

Pinned `58f4076` as one complete Git archive, including current account-scoped storage. The former `ca70f6f` evidence used old storage source and five calculation helpers plus Calendar UI; its stated READY verdict did not establish current six-consumer midnight integration. This explains a material remaining verification gap rather than a cross-vendor requirement.

The new real Chrome probe mounts actual Tasks, Habits, Calendar, Statistics, Metrics and TimeTracker in a disposable localhost page, using actual module CSS and native scoped localStorage. At Pacific September12 23:59:59 it advances the synthetic Date to September13 00:00:01, waits for actual scheduled midnight timer, then separately dispatches focus and pageshow.

Correct acceptance FAIL at Time Tracker: with no active session its Current date remains `Saturday / September 2026 · Sep 12` through all three refresh paths. Habits' actual today header changes12→13, Calendar's actual today cell changes09-12→09-13, Statistics current-week task chart changes from dated Saturday to0, Metrics range includes the new natural day's row. Product source confirms TT nowMs only updates at mount, while a session is active, or through selected user actions; no idle midnight/resume subscription exists.

Before probe files and `before.log` / `20260909-before-failure.log` are preserved. This is a correct failing assertion, not a characterization PASS. Parent was notified and owns product repair; verifier does not edit product code. REL01 remains unaccepted until this blocker and remaining consumer assertions are verified.

## Fixed verification — REL-01 complete numbered acceptance PASS

Parent repaired the independently identified idle TT consumer in `9149778`. The original correct TT Current date assertion now passes against that complete pinned snapshot; `after.log` preserves the followup results. This is acceptance of REL-01's local-day/absolute-time/midnight contract, not a release approval.

### New actual-consumer evidence

All six actual modules are mounted at the same clock instant with current scoped storage. The true scheduled midnight callback (real browser timer with a controlled Date clock) changes Habits' today header12→13, Calendar's today date09-12→09-13, Statistics current-week timeline from one Saturday event to zero in the new week, Metrics rolling range to include September13, Tasks Tomorrow→empty with the due record now present in actual Today, and TT Current date/selected Today to September13. TT has no active entries. This closes the calculation-helper versus actual-consumer gap.

After choosing TT Previous day explicitly, advancing to September14 and dispatching focus updates Current date but preserves the selected historical day. Advancing again to September15 with pageshow updates TT, Habits and Calendar while still preserving history. Before results are not overwritten and still demonstrate the former idle failure.

Four independent known UTC bounds are checked using native Chrome timezone rules and current local-day helpers: Pacific spring23h/fall25h, Lord Howe fall24.5h/spring23.5h. Exact start/end UTC strings are predetermined expected values, not assertions that repeat the implementation expression.

### Reused and refreshed evidence, without claiming redundant coverage

The unchanged original four-zone matrix from `ca70f6f` is rerun by `verify-current-matrix.mjs` against **all source packages in the same 9149778 archive**, activating a synthetic current account. It no longer substitutes the old a81b1f9 storage package. All four receipts are PASS: UTC, Pacific, Shanghai and Lord Howe. The fixed absolute instant06:30Z is September8 in Pacific and September9 elsewhere; five consumer calculation paths and actual rendered Calendar agree. The original Calendar selected-month preservation / Today after pageshow and DST row extent expectations remain unchanged. These four-zone probes are explicitly calculation-plus-Calendar evidence, complemented by the new six actual UI midnight consumers rather than described as six full walkthroughs per zone.

Metrics original absolute-instant preservation evidence in `web-local-time-contract/verify-browser-metric-instant-after.log` is reused: it checks unchanged fold/seconds/milliseconds and explicit time changes. Review of current `measuredAtFromDraft` / edit draft confirms that preservation branch remains present. The current actual component regression was independently rerun:2 targeted assertions PASS,4 unrelated cases filtered out (`metrics-instant-regression.log`), not a six-test PASS. This supplements the earlier native evidence rather than relabelling it as a new native run. Shared localDate/useLocalDayClock, Calendar DST math and Habits date-key implementations have no differences from the prior verified sources; the found TT integration omission was repaired separately.

TASK-01/02 and their independent evidence already cover due-date identity, source-preserving movement and completion timestamps. Existing yearless dates are not backfilled with guessed years. TT-01 window allocation evidence remains separate; it is not confused with this clock refresh repair.

**Final REL-01 verdict: PASS; parent may mark this numbered TODO completed.** Browser timezone is the device/user timezone contract. Temporary native browser + synthetic clock/event seams do not prove operating-system background scheduling, server jobs, whole-browser notifications, production deployment, user-configured cloud timezone preferences, or cross-vendor verification. Those are not silently added to or closed by REL-01.

```
REL01_REF=9149778 REL01_LOG=after.log node docs/reviews/web-local-time-consumers-independent/verify-native.mjs
REL01_ZONE=America/Los_Angeles node docs/reviews/web-local-time-consumers-independent/verify-current-matrix.mjs
# Repeat matrix with UTC, Asia/Shanghai and Australia/Lord_Howe.
pnpm --filter @repo/plugin-web-metric-tracker exec vitest run src/__tests__/MetricTrackerModule.test.tsx -t 'editing keeps absolute measurement instants'
```

~~~~

</details>

### Historical source: docs/reviews/web-dashboard-clock-recovery-native/before-f9eb4b1.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Clock native BEFORE receipt — f9eb4b1

**Status: E4 BLOCKED.** CP-CLOCK-01 batch 70, contract r2 E4, independent `gpt-6-sol` BEFORE verifier in detached checkout `/Users/lijinlong/.codex/worktrees/audit-clock-b70-20261009/XAI_Desktop`, parent `b5688d8c952dbbb150bf69235493052ad776b832`. The frozen pixel oracle's full-cycle precondition cannot pass the protected WidgetShell resize control at 1440 in the production Dashboard; the focus matrix and E4 are therefore incomplete. E5 is separately harness-valid in `../web-dashboard-clock-recovery-f1/before-f9eb4b1.md`. This receipt does not establish fixed-product behavior, controller acceptance, or closure of any inventory item. The task is classified as `web`: the Dashboard widgets/grid and production Web `App` composition are its target. No product file was changed.

## Frozen inputs and source provenance

- Requested product `f9eb4b1`, resolved commit `f9eb4b1f207bc4b46f547b90afc250424b3c8695`, tree `05887cf113639116b228a25041a37b3d5c69a322`; docs HEAD `b5688d8c952dbbb150bf69235493052ad776b832`. The working tree's product tree equals the docs HEAD product tree. Contract r2 SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`, 50 contract source hashes with zero mismatches. Archived, extracted and read-only dependency lockfile SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- Every mode streams `git archive` from the resolved product commit, measuring 148,408,320 bytes and SHA-256 `bb468cede8a9659d9798bdb4c7f0a528faedf3ddfb344fb946f159ce6305a097`. The production `App` composition is bundled from that archive with only authentication synthesized. Of 1,022 bundle inputs, 630 are archive modules and 390 are third-party dependencies; none comes from a foreign checkout. The `@repo` guard records 319 pinned specifiers and zero violations. Chrome 155.0.8059.39 uses pipe CDP transport; every mode logs the K-1 trusted-key trace and omits `nativeVirtualKeyCode`.
- The frozen `pixelFocusWalk` comes from `bacdbbc:docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs`, whole-file SHA-256 `5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4`. Every mode verifies byte-identical block SHA-256 `e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43` and function SHA-256 `1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620`.
- Runner/fixture infrastructure was adapted from the tracked accepted AppRail and Appearance native evidence. Clock selectors, cases, positive controls and business oracles were authored against contract r2. An early developmental copy of uncommitted stopped half-work was removed **before any mode run** and is neither frozen nor committed evidence. The stopped checkout was `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/.claude/worktrees/agent-a5f481d9b8ded5030`. Its `docs/reviews/web-dashboard-clock-recovery-f1/{verify-f1-clock.mjs,f1-clock-host.tsx}` and `docs/reviews/web-dashboard-clock-recovery-native/{verify-native-before.mjs,native-before-app.tsx,native-before-prelude.js,native-clock-probes.js}` were subsequently used read-only for selector/scenario orientation. No stopped log, screenshot or verdict was reused.
- The only deliberate `console.error` is the prelude self-test trace `native apprail prelude self-test error trace` from `http://127.0.0.1:<runner-port>/__native/prelude.js`. The filter matches that exact kind, text and URL path; real product errors remain collected and judged by `run:zero-product-runtime-errors`. Quota warnings from the tested key-scoped fault path remain recorded, not silently suppressed.

## Mode invocations and outcomes

All commands below run in the detached checkout with `XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop` as **read-only dependencies**. The runners refuse log overwrite. Exit 2 means a harness-valid run observed contract-required BEFORE business failures; exit 1 means a harness precondition failure. Formal diagnostic suffixes are never reused.

| Invocation suffix | Exit | Checks | Interpretation |
| --- | ---: | ---: | --- |
| `fields before1` | 2 | 572 | Preserved first formal log, **diagnostic-only**: its embedded runner hash predates the final source, and the old runner bytes were not retained |
| `source before1` | 2 | 378 | Preserved first formal log, **diagnostic-only** for the same source-snapshot limitation |
| `focus-en before1` | 1 | 55 | Preserved harness refusal: 375 px style target centre was hit by the existing widget-shell remove control |
| `focus-zh before1` | 1 | 31 | Preserved harness refusal: fixture HTML `lang` was used in place of rendered Chinese Clock copy |
| `fields before2` | 2 | 572 | Final-source authoritative: H1–H3 EN/ZH expected BEFORE failures; twelve positive controls PASS |
| `source before2` | 2 | 378 | Final-source authoritative: 24 malformed source inputs and four key-scoped throwing reads, EN/ZH |
| `departure before1` | 2 | 352 | Final-source authoritative: H5 EN/ZH expected failures; Header-only row l/D1 positives PASS |
| `visual before1` | 2 | 262 | Final-source authoritative: ten EN/ZH width states, default widget/pet geometry and H1/H2 missing recovery |
| `geometry before2` | 2 | 1,858 | Harness-valid responsive visual iteration 2: 60 EN/ZH width/state cases; pet-hidden centre-hit FAIL in 48 cases at 375–1024, PASS in 12 at 1440; horizontal-overflow PASS 60/60 |
| `modal before3` | 2 | 190 | Harness-valid responsive visual iteration 3: four EN/ZH × 375/1440 Header+failed-Clock dialogs; expected Header-only label FAIL 4/4, modal containment/centre-hit and trusted Tab trap PASS 4/4 |
| `focus-en before2` | 1 | 892 | Frozen full-cycle PRECONDITION failure at first light 1440 style-split walk; prior 375/768 partial results are not authoritative E4 coverage |
| `focus-zh before2` | 1 | 892 | Same frozen full-cycle PRECONDITION failure with the identical outside-Clock resize geometry |
| `focus-state-en before3` | — | — | **Not launched** after the focus stop condition; new source retained but no formal business evidence |
| `focus-state-zh before3` | — | — | **Not launched** after the focus stop condition |

There were **12** native formal invocations with **6,432** recorded checks, including all four preserved first-iteration diagnostic logs and the two second-iteration focus refusals. The 40 external native developmental probes recorded **4,884** checks; their per-run costs appear below. The independent F1 receipt accounts for its two official invocations and three developmental probes.

The first focus refusals exposed two harness setup errors. The source was corrected before `before2`: rendered locale copy is now the locale gate, and trusted Tab+Enter selects a style where an existing 375 px widget-shell action covers the style button's centre. No product DOM, CSS, `tabindex`, click target, or input handler was changed. The overlap was then independently judged as an unexpected §9 **pet-hidden responsive geometry business FAIL** in `geometry before2`; keyboard selection did not erase it. The original `before1` runner hash is `862208c6e364c4bac587aa28c67c14e872a693987d55bdc80c9a26024439ec42`, but its byte snapshot is unavailable; those logs are diagnostic history only and are **not** accepted as frozen E4 business evidence. The final primary runner SHA-256 is `4a0b4342fdfe6114b84c048bb1cf3deef0f61b98cf2023fd3f00c796bd522976`.

The controller identified that the primary clean-state H9 matrix alone would omit §9 states 3–4. A separate supplemental runner was authored under the same allowed directory, reusing the final frozen App/prelude/focus fixtures and the byte-identical `bacdbbc` pixel oracle. It was prepared to cover failed-both closed, source-only style closed, and source-only timezone closed at EN/ZH × light/dark × 375/768/1440. It was reserved for the third formal focus iteration per language, not a reset of the ≤3 cap, but was **never launched** after the frozen-oracle stop. Its bounded developmental probes are disclosed below.

## Frozen-oracle stop condition and impact

The EN and ZH `focus before2` logs each completed 892 checks and then refused the **first** `light:1440:style:split` full walk. The frozen precondition `pixel-walk-completed-a-full-cycle-with-every-stop-captured-twice-in-stable-aligned-frames` was false despite `closed=true`, `rows=28`, and `inside=28`. The only misaligned descriptor in each log is `other:button.widget-shell__resize`, an outside-Clock WidgetShell control. Its focused frame was stable at rectangle `(left 716.3200073242188, top 293.57000732421875, right 751.6799926757812, bottom 328.92999267578125)` and clip `(706,283,56,56)`. After focus moved on, `placeAgain` found `(717,294.25,751,328.25)` and clip `(707,284,54,55)`, so the oracle correctly refused to take an aligned moved-on clip. Both frames had window scroll `(0,0)`, hovered `aside.app-rail`, and `stillFocused=false` after moving on. The two languages reproduced **identical** values. No Clock-owned stop caused the refusal.

The owning protected CSS is `packages/xai-web-dashboard-grid/src/styles.css` SHA-256 `d9e330e70a375b0579fcf3b98e3d9ea2c633fc4b498b4b3a66fda3df8db9fdc6`: lines 733 and 743–747 give `.widget-shell__resize` a transform transition and `transform: scale(1.04)` on `:focus-visible`. At ≤780 px, lines 1187–1192 set `transform: none`; the 375 and 768 walks had passed the frozen full-cycle gate. At 1440 the focused and moved-on rectangles intrinsically differ. Waiting for animation to settle cannot make them identical. Hiding, disabling or restyling this non-Clock control, editing the oracle, or intercepting its precondition would cross the contract's protected boundary or weaken the frozen method, so none was done.

The primary source at SHA-256 `4a0b4342fdfe6114b84c048bb1cf3deef0f61b98cf2023fd3f00c796bd522976` remains available byte-for-byte alongside the two full refusal logs. Each log has 17 light/375 and 17 light/768 completed walks (four closed selected-style and thirteen open active-timezone walks per width), with per-stop pixel and computed-outline values. These **34 partial walks per language** are diagnostic observations only; no dark, 1440 or formal failed/source-state matrix completed, and a harness-invalid run cannot establish full H9. The supplemental states-3/4 runner SHA-256 `c2c1a9127632a411dc9b501622591e2c60421ee352000f55285a128d7c76509f` passed bounded developmental probes but was **not launched formally** because the clean matrix could not pass the same frozen full-cycle gate. No fourth iteration was attempted. E4 is BLOCKED; E1–E5 cannot be declared collectively frozen, and this receipt authorizes no Terra implementation. The next step is an independent Astra impact and contract-oracle review, not a product fix in this window.

## Business coverage and positive controls

| Contract row | Evidence path | BEFORE result |
| --- | --- | --- |
| H1–H2 | `before2-fields`, `before1-visual` | EN/ZH quota and throwing `setItem` field failures lack per-field recovery; ten width captures lack both-failed blocks and Export |
| H3 | `before2-fields` | EN/ZH, both keys write early under their actual lock names; expected BEFORE failure |
| H4 | `before2-source` | 24 malformed exact-raw values and four throwing `getItem` cases show fallback without source-only Reload; expected BEFORE failure |
| H5 | `before1-departure` | EN/ZH single accessible-name rail click, mini-calendar `goTo`, live Back, sign-out, Clock-only unload/export entry all fail as expected before |
| H9 states 1–2 | `before2-focus-en`, `before2-focus-zh` | **BLOCKED:** both logs are harness-invalid at first 1440 walk; partial 375/768 per-stop measurements do not establish the required EN/ZH × light/dark × 375/768/1440 matrix |
| H9 states 3–4 | `verify-native-focus-states.mjs` and external developmental probes only | **NOT RUN formally:** failed-both/source-only closed matrix withheld after the frozen-oracle stop condition |
| H10 | `before1-visual` | Existing target sizes recorded at 375, 414, 768×1024, 1024 and 1440 in EN/ZH; this is observational, not a ≥44 px gate |
| §9 responsive centre hit | `before2-geometry` | **Unexpected product FAIL:** pet-hidden Clock control centre covered in all 48 states at 375–1024; 12 at 1440 PASS. All 60 no-horizontal-overflow checks PASS; pet-on occlusion recorded separately |
| §9 combined dialog | `before3-modal` | Four EN/ZH × 375/1440 captures: failed Header and Clock attempt gives expected BEFORE Header-only label, while dialog viewport/button centre-hit and trusted Tab focus trap PASS |
| §12 mount/ticks | `before2-fields`, `pc-{en,zh}-mount-defaults` | Absent defaults, three ticks and popover cause zero `SET`/`REMOVE`; storage reads remain recorded |
| §12 exact 17 values | `before2-fields`, `pc-{en,zh}-exact-17-values` | Trusted UI and CmdK selection, exact stored bytes and rendered values PASS; default selections were first changed so their write could be asserted |
| §12 lifecycle/locks | `before2-fields`, `pc-{en,zh}-device-lifecycle-and-lock-independence` | Device lifecycle declaration and unrelated rail/Appearance lock independence PASS |
| §12 second document | `before2-fields`, `pc-{en,zh}-idle-second-document` | Genuine second-document idle updates for both keys PASS |
| §12 widget ghost | `before2-fields`, `pc-{en,zh}-widget-ghost-zero-clock-writes` | Trusted Clock widget pointer drag, ghost zero `SET`/`REMOVE` on both keys PASS; reads recorded |
| §12 Header l/D1 | `before1-departure`, `pc-{en,zh}-Header-D1-row-l-{discard,retry}` | Header alone holds with Clock registered; one Header export file per language, Discard and Retry each release once PASS |
| §12 F1/selfcheck | `../web-dashboard-clock-recovery-f1/before-f9eb4b1.md` | Frozen F1 selfcheck and c1–c5 positive halves PASS, with the required BEFORE Clock failures |

The native `fields` K-1 audit records 397 trusted keydowns and 397 keyups, zero untrusted events, zero mismatches; other authoritative mode audits are in their logs. Every case gates network, production composition, source/archive identity, Topbar status census, and instrument validity before its business verdict. The default Dashboard order is the full registry order for pet-on captures. Pet hiding uses a trusted product rail click at 768 px, followed by a same-document resize; no pet storage seed is used.

The formal visual geometry is the same for EN and ZH at a given viewport. Coordinates and dimensions below are `(x,y,w,h)` CSS pixels; the 768 viewport is **768×1024**. The pet position is the actual rendered default, not a seeded override.

| Width × height | Clock widget | Default pet | Existing style button size | Existing timezone trigger |
| --- | --- | --- | --- | --- |
| 375×812 | `(12,289.25,341,166)` | `(267,704,56,56)` | `44×44` | EN `109.5×44`, ZH `97×44` |
| 414×896 | `(12,289.25,380,166)` | `(306,788,56,56)` | `44×44` | EN `109.5×44`, ZH `97×44` |
| 768×1024 | `(84,289.25,662,166)` | `(660,916,72,72)` | `44×44` | EN `109.5×44`, ZH `97×44` |
| 1024×768 | `(88,235.25,910,166)` | `(916,660,72,72)` | `44×44` | EN `109.5×44`, ZH `97×44` |
| 1440×900 | `(84,153.25,653,166)` | `(1332,792,84,84)` | `30×30` | EN `109.5×30`, ZH `97×30` |

The pet-on visual captures show false centre hits at the `minimal` and `analog` style controls at 375–1024, although their boxes measure 44×44. The separate pet-hidden §9 runner scrolls each control into view, records the exact centre hit and ancestor chain, and judges that rule as a **business requirement**; it is not an H10-only observation. The pre-existing 1440 controls are 30 px tall; H10 records size without applying the new-control ≥44 px gate.

At 375 px, the focus developmental setup measured the existing `minimal` style button at `{x:261,y:301.25,width:44,height:44}` and found its centre hit chain on `BUTTON.widget-shell__remove`, with scroll and visual offsets zero. The formal visual pet-on snapshot places it at `x:251` and also reports `analog` covered. The bounded pet-hidden clean geometry probe scrolled each control into view and still found `analog` covered by `BUTTON.widget-shell__appearance` at centre `(319,323.25)`, with all scroll offsets zero. Trusted Tab+Enter can select a style, but the centre-hit business requirement still fails. No pointer-activation PASS or product repair is claimed. The unchanged timezone popover Tab-out obstruction is recorded separately as UX-05, outside this caller's recovery-control gate; the primary focus runner retains 375 px EN/ZH frames.

## Development probes and formal-iteration boundary

Development probes wrote only to `/tmp/xai-clock-b70-probes`, outside Git, and were not substituted for formal evidence. Source/build setup probes are not formal diagnostic iterations. Their exact log names, process exit, checks and harness status are listed below. Probe failures drove selector, locale, pixel sample and trusted keyboard setup corrections; no product code was touched. The supplemental focus probes demonstrated all three states with full Tab-order and own-region pixel PASS and expected missing recovery controls before its source was frozen. Geometry probe2 exposed an invalid harness assumption that a failed style would remain rendered on the BEFORE product; the corrected source records the rendered value and gates the actual key-scoped denied write before the separate centre-hit business verdict. The modal probe showed Header-only BEFORE participation and passing production dialog containment, button hit-tests and trusted Tab trap.

| Developmental log | Exit | Checks | Harness valid | Business failures |
| --- | ---: | ---: | --- | ---: |
| `native-f9eb4b1-probe1-departure.log` | 1 | 26 | no | 0 |
| `native-f9eb4b1-probe1-fields.log` | 1 | 9 | no | 0 |
| `native-f9eb4b1-probe1-focus-en.log` | 1 | 37 | no | 0 |
| `native-f9eb4b1-probe1-focus-state-en.log` | 2 | 65 | yes | 1 |
| `native-f9eb4b1-probe1-focus-state-zh.log` | 2 | 58 | yes | 1 |
| `native-f9eb4b1-probe1-geometry.log` | 2 | 45 | yes | 1 |
| `native-f9eb4b1-probe1-modal.log` | 2 | 61 | yes | 1 |
| `native-f9eb4b1-probe1-source.log` | 2 | 373 | yes | 29 |
| `native-f9eb4b1-probe1-visual.log` | 1 | 10 | no | 0 |
| `native-f9eb4b1-probe10-fields.log` | 1 | 194 | no | 5 |
| `native-f9eb4b1-probe11-fields.log` | 2 | 487 | yes | 16 |
| `native-f9eb4b1-probe12-fields.log` | 2 | 571 | yes | 16 |
| `native-f9eb4b1-probe2-departure.log` | 1 | 110 | no | 3 |
| `native-f9eb4b1-probe2-fields.log` | 1 | 11 | no | 0 |
| `native-f9eb4b1-probe2-focus-en.log` | 1 | 139 | no | 1 |
| `native-f9eb4b1-probe2-focus-state-en.log` | 2 | 58 | yes | 1 |
| `native-f9eb4b1-probe2-geometry.log` | 1 | 27 | no | 0 |
| `native-f9eb4b1-probe2-visual.log` | 2 | 251 | yes | 10 |
| `native-f9eb4b1-probe3-departure.log` | 1 | 150 | no | 3 |
| `native-f9eb4b1-probe3-fields.log` | 1 | 14 | no | 0 |
| `native-f9eb4b1-probe3-focus-en.log` | 1 | 62 | no | 1 |
| `native-f9eb4b1-probe3-geometry.log` | 2 | 47 | yes | 2 |
| `native-f9eb4b1-probe3-visual.log` | 2 | 262 | yes | 10 |
| `native-f9eb4b1-probe4-departure.log` | 1 | 246 | no | 6 |
| `native-f9eb4b1-probe4-fields.log` | 1 | 50 | no | 0 |
| `native-f9eb4b1-probe4-focus-en.log` | 0 | 83 | yes | 0 |
| `native-f9eb4b1-probe4-geometry.log` | 2 | 53 | yes | 2 |
| `native-f9eb4b1-probe5-departure.log` | 2 | 303 | yes | 6 |
| `native-f9eb4b1-probe5-fields.log` | 1 | 50 | no | 0 |
| `native-f9eb4b1-probe5-focus-en.log` | 0 | 84 | yes | 0 |
| `native-f9eb4b1-probe6-departure.log` | 1 | 134 | no | 5 |
| `native-f9eb4b1-probe6-fields.log` | 1 | 50 | no | 0 |
| `native-f9eb4b1-probe6-focus-en.log` | 1 | 37 | no | 0 |
| `native-f9eb4b1-probe6-focus-zh.log` | 1 | 37 | no | 0 |
| `native-f9eb4b1-probe7-departure.log` | 2 | 351 | yes | 10 |
| `native-f9eb4b1-probe7-fields.log` | 1 | 51 | no | 0 |
| `native-f9eb4b1-probe7-focus-en.log` | 0 | 103 | yes | 0 |
| `native-f9eb4b1-probe7-focus-zh.log` | 0 | 84 | yes | 0 |
| `native-f9eb4b1-probe8-fields.log` | 1 | 51 | no | 0 |
| `native-f9eb4b1-probe9-fields.log` | 1 | 50 | no | 0 |

## Complete SHA-256 table

Every committed runner, fixture, authoritative or diagnostic formal log, screenshot and exported JSON is listed here. The receipt cannot hash itself without a recursive value. Development probes under `/tmp` are excluded from the committed evidence table.

| File | SHA-256 |
| --- | --- |
| `native-before-app.tsx` | `e3a407c44e93b1ff2aa762e077a0df71458f624f0731242aeb66108cc7fcd9b4` |
| `native-before-prelude.js` | `4d731278ce6b88a9fa9304926177b248e307341bae180cbe59749bbac2eeb239` |
| `native-clock-focus-probes.js` | `10191c2d8a367544e9b3182f0c6bbf18e4c34307910a56ba39242ad8920c78fb` |
| `native-f9eb4b1-before1-departure-pc-en-Header-D1-row-l-discard-header-export.json` | `bc944954215e991f8aa1a36263b906d545ec6c2b5858219edeb877cc68515baa` |
| `native-f9eb4b1-before1-departure-pc-zh-Header-D1-row-l-discard-header-export.json` | `bc944954215e991f8aa1a36263b906d545ec6c2b5858219edeb877cc68515baa` |
| `native-f9eb4b1-before1-departure.log` | `5bed3851824896418c961137532268123094dfe05f05746effd488bb9b54494b` |
| `native-f9eb4b1-before1-fields.log` | `493bbe1bd24fefc394ccf5dd5c53754258c2e95a809053339aaecf7c44550d7e` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-widget-shell-appearance-focused.png` | `d14b99a312e4a0039e85b241e3b96f4eae4837924c37927136be3e6ac53417e1` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-widget-shell-appearance-moved-on.png` | `225b45ee1f200f5d8f45fb60af459ccf87315553980a5cf91a3e08f42abff69d` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-widget-shell-remove-focused.png` | `6a128ba59b28555e4d7c8c398cefee46332f0ae2e72f50b6f5d006fe6d3d9811` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-widget-shell-remove-moved-on.png` | `6bc305188c261f1cf3a12c24e8edcc88c83312141d9bc1b87cc2ffe78861f685` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before1-focus-en-pixel-light-375-style-split-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before1-focus-en.log` | `db6e7cf4ed0f6313cf8fed3308ab4149955962a215fad4d4eeebcd10611bb627` |
| `native-f9eb4b1-before1-focus-zh.log` | `524de6d6d6693d6eac12b8ca0bbe06400aa5dc66d3a1d898484fb19dae4a06fa` |
| `native-f9eb4b1-before1-source-en-375-source-only-style.png` | `f8b6910b470a8a1dd3a546cebba75772de5058a10853fa2bd0363b8f0c3e1db1` |
| `native-f9eb4b1-before1-source-zh-375-source-only-style.png` | `a3335666b8d33af36c48c5900edf1aaf768d050ac43e9f87acbbf15a0c2cf8b8` |
| `native-f9eb4b1-before1-source.log` | `5f9bb1ed0e5c216b742ed04835524a028ba302fae5ac197c61fdb69b8a44f877` |
| `native-f9eb4b1-before1-visual-en-1024-both-failed-pet-on.png` | `d3079a41f3fc2796c11f4d1d8f37c575e5eb6bcfee36cab883031c75982033d1` |
| `native-f9eb4b1-before1-visual-en-1440-both-failed-pet-on.png` | `a9a0c69da9d849420ee014033327e455f3692991b7ce74893d60fb404968d195` |
| `native-f9eb4b1-before1-visual-en-375-both-failed-pet-hidden-after-768-toggle.png` | `a1d71421a30aa2a85ca617b3099006c6589421895bef5e4ace52671c4180aa75` |
| `native-f9eb4b1-before1-visual-en-375-both-failed-pet-on.png` | `1b161df0ff236f4ac17993c5f3229e58342cc6067b282b8c282226e496f064e0` |
| `native-f9eb4b1-before1-visual-en-414-both-failed-pet-on.png` | `6fb50ae76b55e6bd84999f3330e3f742fe23536b24fab5fbe02b938bc591b08e` |
| `native-f9eb4b1-before1-visual-en-768-both-failed-pet-on.png` | `2083f5eaa68bce29e762b04c42273a535b7e2ec52cca6c4cf1b7da34ae3b281d` |
| `native-f9eb4b1-before1-visual-zh-1024-both-failed-pet-on.png` | `5f0033e996240e7f1d068f21ee446db86c8d619450010bd080bbc4f70003a80a` |
| `native-f9eb4b1-before1-visual-zh-1440-both-failed-pet-on.png` | `a037fd094467277be17ee57306028280f35396e8004e36b76335b7f9fb791780` |
| `native-f9eb4b1-before1-visual-zh-375-both-failed-pet-hidden-after-768-toggle.png` | `56745ebcfc7899194f8123f4887badd5a467e06de96d80a350d686e5c4d38d9f` |
| `native-f9eb4b1-before1-visual-zh-375-both-failed-pet-on.png` | `21bf0396dd30d0bc2462be95041caf18a4dcb8809fa4f1651c8ab47ee1be6dc7` |
| `native-f9eb4b1-before1-visual-zh-414-both-failed-pet-on.png` | `f77fd5bac3102009823e89085b4bf60c3086ed2e9fac5b695153e66223073a18` |
| `native-f9eb4b1-before1-visual-zh-768-both-failed-pet-on.png` | `3bcc0eb8286d0c137a20506118cd9a5e2718c61c8250e0788ba9370d511aaf58` |
| `native-f9eb4b1-before1-visual.log` | `7f20e4b7562fff7b61fbb34652053c587a21e74c7e704ac24c85673b0b6b6cbd` |
| `native-f9eb4b1-before2-fields.log` | `3c1955cc4bc3713d5ac961f2f5ef84241033d8049bc4127971512e88a9506551` |
| `native-f9eb4b1-before2-focus-en-en-light-375-open-popover-Tab-out.png` | `518fbc16df60bf3e33034d5a0d89b9c9c373ad6494daee7083a0fb0e331f5e27` |
| `native-f9eb4b1-before2-focus-en-pixel-light-1440-style-split-other-button-dash-note-display-focused.png` | `d2440420799446929354d6c6922fbad80e37f425747bc6222e929b304d840bdf` |
| `native-f9eb4b1-before2-focus-en-pixel-light-1440-style-split-other-button-dash-note-display-moved-on.png` | `25c5f878427958ec093dd2331df089256ea3a486d93c248df5457354130494dd` |
| `native-f9eb4b1-before2-focus-en-pixel-light-1440-style-split-other-button-widget-shell-appearance-focused.png` | `440f75eb359bbebb253b364bfd5ace1b7ee0b92fa58d0ff6dffb3da221fda682` |
| `native-f9eb4b1-before2-focus-en-pixel-light-1440-style-split-other-button-widget-shell-appearance-moved-on.png` | `05a3f027959ddca1c7953f63fb87be0f1ad8a3cae30f74be1f998eddbf3cdcc8` |
| `native-f9eb4b1-before2-focus-en-pixel-light-1440-style-split-other-button-widget-shell-remove-focused.png` | `6d5411e1755e65c3d62117da49cb7ac5cc189216d2df46ff550d8c72fc0c5410` |
| `native-f9eb4b1-before2-focus-en-pixel-light-1440-style-split-other-button-widget-shell-remove-moved-on.png` | `3d9ad9121185c54772c09041d16e75bc7fa4579ecb8a53e0f2ebeba974a50e87` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-widget-shell-appearance-focused.png` | `9a557391bccce820cdd932ea0a3f51133f70de2df1774cd50dd12cd45366bc0a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-widget-shell-appearance-moved-on.png` | `666ce24f33f292f6fb5131e83de3b136f033bffa8d68e86eb4fe4a8a536b1d0a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-widget-shell-remove-focused.png` | `4ec32aef078d05c6bd6332e6687c5e2dbb28951c9c1a0404890f7dd3243d1375` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-widget-shell-remove-moved-on.png` | `f32bb91adfe4a08a8eb5b112f7ff021fc8fd55ea574c2a03db153ff6f9e50405` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-analog-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-widget-shell-appearance-focused.png` | `d14b99a312e4a0039e85b241e3b96f4eae4837924c37927136be3e6ac53417e1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-widget-shell-appearance-moved-on.png` | `225b45ee1f200f5d8f45fb60af459ccf87315553980a5cf91a3e08f42abff69d` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-widget-shell-remove-focused.png` | `83f4051ef18bb266a4903bc0bb8ce30d48fc7aed3d69a33e96a7bb6063364f63` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-widget-shell-remove-moved-on.png` | `c5f726ad858f330590f0010c916a8b2f6a6699beedf04b78e6d94415394d9017` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-classic-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-widget-shell-appearance-focused.png` | `5688517619a4cda0e95f3a486ffd7e14b52f45ebe2180fc51803be95f5297516` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-widget-shell-appearance-moved-on.png` | `9a66e2d0b9bc54115dd04facbc55b3bfe342e2f3fea16074ac29bab84ccb2ccd` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-widget-shell-remove-focused.png` | `1bc10a3d440afef279800982ac13e2e5a069e261585e36f60425251c3856756d` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-widget-shell-remove-moved-on.png` | `27bab0ea62576fdaaa1d65479c48b5246ebd058e2e7cde3c5662e0a8de978f55` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-minimal-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-widget-shell-appearance-focused.png` | `d14b99a312e4a0039e85b241e3b96f4eae4837924c37927136be3e6ac53417e1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-widget-shell-appearance-moved-on.png` | `225b45ee1f200f5d8f45fb60af459ccf87315553980a5cf91a3e08f42abff69d` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-widget-shell-remove-focused.png` | `dd39d342ec98a401b2944b5d6254d0dece7eb2fcbd0415784561f7aa92bd9c37` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-widget-shell-remove-moved-on.png` | `bab4312358774b51c3c77a746c6198d82c9390e530cea1e520ab0c30676a9fa5` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-style-split-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-berlin-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-dubai-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-hk-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-la-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-local-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-london-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-new_york-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-paris-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sf-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-shanghai-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-singapore-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-sydney-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-dash-note-display-focused.png` | `fdaa9cb6d94d0287d15b81655f271db6e390b1dcdb4c3e5bdd6735badc3a9110` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-dash-note-display-moved-on.png` | `99f67272cadd0687eb027410fbda6f9270a7f9c5d56be159a1a2b2c35ef83129` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-375-timezone-tokyo-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-widget-shell-appearance-focused.png` | `ce3c654ede3668ee03e965294e7b5fbd1613dad84c9cfdd22766508786bc0202` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-widget-shell-appearance-moved-on.png` | `a602a8fa18dadb96558ee15e117862a61fceb346ad8df2e10370d7bb0291b65f` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-widget-shell-remove-focused.png` | `ccd8f0f2bd1f68cba7dbb0c7c4364b19e4fea28c6e10707b7c1e34c1539434d5` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-widget-shell-remove-moved-on.png` | `14808e3dcde86b485ef609b67f4989c8c6e7669c37b8916e7311cc884acbdbcd` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-analog-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-widget-shell-appearance-focused.png` | `fe8be4eb49d4b2fd67a61c1524f874952a13466c4c5f6dc99d6b97f87563f756` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-widget-shell-appearance-moved-on.png` | `c03ac1cd1df5151d44552c3b6b064b148a47f5445703dc6b500423f51054ddc0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-widget-shell-remove-focused.png` | `4d4e3a4a411edfd49a61d2d77ff2ec86650f6d4fd22b04a9d42b90ffc7fc3097` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-widget-shell-remove-moved-on.png` | `418d6e22c8726259fcc412896c57f83d50b5d642f7ceaaecd8355ed9af21b819` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-classic-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-widget-shell-appearance-focused.png` | `25538247a704f70cb374f48fa3ea010f5c50611778a56ea125d2263ea33124fc` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-widget-shell-appearance-moved-on.png` | `b2eb5becbf9b30333a7d3ec3c53e2cf178f6ea68d4f075f657bdd2f63f71c316` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-widget-shell-remove-focused.png` | `38279b97b1da8d35dd463c94516dd024bd2b066827956a0955ab715339504b09` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-widget-shell-remove-moved-on.png` | `9b172669b9262bfce145b06556d3528ba993e63449a429ec10da7e2758d1841c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-minimal-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-widget-shell-appearance-focused.png` | `fe8be4eb49d4b2fd67a61c1524f874952a13466c4c5f6dc99d6b97f87563f756` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-widget-shell-appearance-moved-on.png` | `c03ac1cd1df5151d44552c3b6b064b148a47f5445703dc6b500423f51054ddc0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-widget-shell-remove-focused.png` | `e9ff5642be1c4215e50312702d54ed3c121e24784baad141f30f6cf11a411cd6` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-widget-shell-remove-moved-on.png` | `5f38dcb60851e64b8ffb1cfaa5dca92104a407fb1d5568c4aa9d494514b37482` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-style-split-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-berlin-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-dubai-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-hk-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-la-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-local-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-london-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-new_york-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-paris-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sf-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-shanghai-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-singapore-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-sydney-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-dash-note-display-focused.png` | `77d92b8f66843f60f3af20f144e304080bda6f53dd0a72874fa4bea73cda3530` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-dash-note-display-moved-on.png` | `1acf697b30948076c5992dc1888c8189e2d9867b8e33ab2060478210bac3d184` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-en-pixel-light-768-timezone-tokyo-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-en.log` | `e466f9b15c4e3fc134869c6c39833535482b15a9e71ff270e4fb05ae6f1329e6` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-1440-style-split-other-button-dash-note-display-focused.png` | `5a16ff31969828ae0ad36171bbeb9958fda9c2d7da353004bb2c7c1c2c4b281e` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-1440-style-split-other-button-dash-note-display-moved-on.png` | `3e6a1cb8399c45e6ec2afa20778c482fc0a4452ae04335a0f5d5cd8161da8bfd` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-1440-style-split-other-button-widget-shell-appearance-focused.png` | `440f75eb359bbebb253b364bfd5ace1b7ee0b92fa58d0ff6dffb3da221fda682` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-1440-style-split-other-button-widget-shell-appearance-moved-on.png` | `05a3f027959ddca1c7953f63fb87be0f1ad8a3cae30f74be1f998eddbf3cdcc8` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-1440-style-split-other-button-widget-shell-remove-focused.png` | `6d5411e1755e65c3d62117da49cb7ac5cc189216d2df46ff550d8c72fc0c5410` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-1440-style-split-other-button-widget-shell-remove-moved-on.png` | `3d9ad9121185c54772c09041d16e75bc7fa4579ecb8a53e0f2ebeba974a50e87` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-widget-shell-appearance-focused.png` | `9a557391bccce820cdd932ea0a3f51133f70de2df1774cd50dd12cd45366bc0a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-widget-shell-appearance-moved-on.png` | `666ce24f33f292f6fb5131e83de3b136f033bffa8d68e86eb4fe4a8a536b1d0a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-widget-shell-remove-focused.png` | `4ec32aef078d05c6bd6332e6687c5e2dbb28951c9c1a0404890f7dd3243d1375` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-widget-shell-remove-moved-on.png` | `f32bb91adfe4a08a8eb5b112f7ff021fc8fd55ea574c2a03db153ff6f9e50405` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-analog-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-widget-shell-appearance-focused.png` | `d14b99a312e4a0039e85b241e3b96f4eae4837924c37927136be3e6ac53417e1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-widget-shell-appearance-moved-on.png` | `225b45ee1f200f5d8f45fb60af459ccf87315553980a5cf91a3e08f42abff69d` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-widget-shell-remove-focused.png` | `83f4051ef18bb266a4903bc0bb8ce30d48fc7aed3d69a33e96a7bb6063364f63` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-widget-shell-remove-moved-on.png` | `c5f726ad858f330590f0010c916a8b2f6a6699beedf04b78e6d94415394d9017` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-classic-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-widget-shell-appearance-focused.png` | `5688517619a4cda0e95f3a486ffd7e14b52f45ebe2180fc51803be95f5297516` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-widget-shell-appearance-moved-on.png` | `9a66e2d0b9bc54115dd04facbc55b3bfe342e2f3fea16074ac29bab84ccb2ccd` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-widget-shell-remove-focused.png` | `1bc10a3d440afef279800982ac13e2e5a069e261585e36f60425251c3856756d` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-widget-shell-remove-moved-on.png` | `27bab0ea62576fdaaa1d65479c48b5246ebd058e2e7cde3c5662e0a8de978f55` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-minimal-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-widget-shell-appearance-focused.png` | `d14b99a312e4a0039e85b241e3b96f4eae4837924c37927136be3e6ac53417e1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-widget-shell-appearance-moved-on.png` | `225b45ee1f200f5d8f45fb60af459ccf87315553980a5cf91a3e08f42abff69d` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-widget-shell-remove-focused.png` | `dd39d342ec98a401b2944b5d6254d0dece7eb2fcbd0415784561f7aa92bd9c37` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-widget-shell-remove-moved-on.png` | `bab4312358774b51c3c77a746c6198d82c9390e530cea1e520ab0c30676a9fa5` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-widget-shell-resize-focused.png` | `390c58ba2aab1b1376a7ce2b8e6d86e8068471aa8784be72d86de59f5af78252` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-style-split-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-berlin-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-dubai-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-hk-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-la-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-local-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-london-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-new_york-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-paris-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sf-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-shanghai-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-singapore-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-sydney-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-dash-note-display-focused.png` | `0b50a00b3b5a25e15b9cff64aa2ddf3ff310e40b1570c82ce6ff96792f016a4c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-dash-note-display-moved-on.png` | `bf5acb795178f84f4355a514ba912748271e85a16cf7dd66d70d9c7c6c030731` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-widget-shell-appearance-focused.png` | `34d7df677bc4507c5ebf3bade5b8a71559971205283e0a3dfa04cb5b988195fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-widget-shell-appearance-moved-on.png` | `9ff7dc2b57c0bfebc6624589f51f64a031f22edb37edca77378e1d629d309ddb` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-widget-shell-remove-focused.png` | `103336384317439a098e851cf100328d3b805de9daa8057e78fc1df687bd49f1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-widget-shell-remove-moved-on.png` | `5e53d7baa09de725325ae5e3bc0109299546d99be448faf410f0ab3ea33faef1` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-375-timezone-tokyo-other-button-widget-shell-resize-moved-on.png` | `f555a241d1c47cd1858821841943e7706466697399cd68bde231d0681d0a47c7` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-widget-shell-appearance-focused.png` | `ce3c654ede3668ee03e965294e7b5fbd1613dad84c9cfdd22766508786bc0202` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-widget-shell-appearance-moved-on.png` | `a602a8fa18dadb96558ee15e117862a61fceb346ad8df2e10370d7bb0291b65f` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-widget-shell-remove-focused.png` | `ccd8f0f2bd1f68cba7dbb0c7c4364b19e4fea28c6e10707b7c1e34c1539434d5` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-widget-shell-remove-moved-on.png` | `14808e3dcde86b485ef609b67f4989c8c6e7669c37b8916e7311cc884acbdbcd` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-analog-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-widget-shell-appearance-focused.png` | `fe8be4eb49d4b2fd67a61c1524f874952a13466c4c5f6dc99d6b97f87563f756` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-widget-shell-appearance-moved-on.png` | `c03ac1cd1df5151d44552c3b6b064b148a47f5445703dc6b500423f51054ddc0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-widget-shell-remove-focused.png` | `4d4e3a4a411edfd49a61d2d77ff2ec86650f6d4fd22b04a9d42b90ffc7fc3097` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-widget-shell-remove-moved-on.png` | `418d6e22c8726259fcc412896c57f83d50b5d642f7ceaaecd8355ed9af21b819` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-classic-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-widget-shell-appearance-focused.png` | `25538247a704f70cb374f48fa3ea010f5c50611778a56ea125d2263ea33124fc` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-widget-shell-appearance-moved-on.png` | `b2eb5becbf9b30333a7d3ec3c53e2cf178f6ea68d4f075f657bdd2f63f71c316` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-widget-shell-remove-focused.png` | `38279b97b1da8d35dd463c94516dd024bd2b066827956a0955ab715339504b09` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-widget-shell-remove-moved-on.png` | `9b172669b9262bfce145b06556d3528ba993e63449a429ec10da7e2758d1841c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-minimal-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-widget-shell-appearance-focused.png` | `fe8be4eb49d4b2fd67a61c1524f874952a13466c4c5f6dc99d6b97f87563f756` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-widget-shell-appearance-moved-on.png` | `c03ac1cd1df5151d44552c3b6b064b148a47f5445703dc6b500423f51054ddc0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-widget-shell-remove-focused.png` | `e9ff5642be1c4215e50312702d54ed3c121e24784baad141f30f6cf11a411cd6` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-widget-shell-remove-moved-on.png` | `5f38dcb60851e64b8ffb1cfaa5dca92104a407fb1d5568c4aa9d494514b37482` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-widget-shell-resize-focused.png` | `7f015129a40fbe4667f1cc6ad422ea00669a698ab2fe46ef3c632d7fba0de0aa` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-style-split-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-berlin-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-dubai-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-hk-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-la-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-local-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-london-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-new_york-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-paris-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sf-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-shanghai-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-singapore-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-sydney-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-dash-note-display-focused.png` | `b8162b58ccde31eb32de6b5c386a3e859f8b9ec46e546078751dbb630c885b66` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-dash-note-display-moved-on.png` | `5be771c72b82231fd442a5e8de960c991f8a000529d29463aff18b11ba96fb30` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-widget-shell-appearance-focused.png` | `575ddd66fdda2eee2e858e72684b0f3021e5d6e1a467cc2b4c72c42018c7599c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-widget-shell-appearance-moved-on.png` | `60dd3ca6ce3ae41ad7c5f41355c82486fc0d9cef703527de3cf9d2eec599075c` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-widget-shell-remove-focused.png` | `50fa54f8c966b565a2f086ee70b68c6b72e02794790d100cd4f9b7c48b13a96a` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-widget-shell-remove-moved-on.png` | `50f9670bc2fea549ce582602420ef97210be80e4bc3dc723f69cb5e641db9426` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-widget-shell-resize-focused.png` | `1945d5a5786af76bddbf41f6336301b85bce806dcfcb6739eb3fdeb0390a1930` |
| `native-f9eb4b1-before2-focus-zh-pixel-light-768-timezone-tokyo-other-button-widget-shell-resize-moved-on.png` | `2592bd73b1018213546cf49dc53727d320f4ca9bf34144368bd29644e27f56f0` |
| `native-f9eb4b1-before2-focus-zh-zh-light-375-open-popover-Tab-out.png` | `969112b52cc5d2b7c4c9594432bc0040bbc71487e46ec9660e5c85944e2aab07` |
| `native-f9eb4b1-before2-focus-zh.log` | `c50da2fd0b3d71bddf99ddc5a00584f8338022e7f961de0f51d76a0557865c1e` |
| `native-f9eb4b1-before2-geometry-en-1024-both-failed-pet-hidden.png` | `5796a3142d3a347b946eced6868eddda6d6fe27a80ffddce67805d756eff4f15` |
| `native-f9eb4b1-before2-geometry-en-1024-both-failed-pet-on.png` | `e32466fb28c259c08b8f682a2035620e0946365496b728fb39ebb8afa9f45fc3` |
| `native-f9eb4b1-before2-geometry-en-1024-clean-pet-hidden.png` | `364b58860ca5b8cbb53f21af681d072e51cca40741ab6f049684a3190c5b791f` |
| `native-f9eb4b1-before2-geometry-en-1024-clean-pet-on.png` | `1528a91498ae175ecf612996e9b71b02060bd7b82d44316400811cc4448c3b6f` |
| `native-f9eb4b1-before2-geometry-en-1024-source-style-pet-hidden.png` | `c40bc9247c25544705b6146d1767b146c5996dc276ae2c199dc06e4dabde6435` |
| `native-f9eb4b1-before2-geometry-en-1024-source-style-pet-on.png` | `457778676e33bb10af33c34225391ec50b94865b1e9834775957fe81c35fff21` |
| `native-f9eb4b1-before2-geometry-en-1024-source-timezone-pet-hidden.png` | `7189a3cbad453f8c683fa24ef8eaa09594bee786e7b097234c9195fa5a037a19` |
| `native-f9eb4b1-before2-geometry-en-1024-source-timezone-pet-on.png` | `e35a6824582f16532a0be79b88eda57681fbca9028ac110e76680f159405a1a1` |
| `native-f9eb4b1-before2-geometry-en-1024-style-failed-pet-hidden.png` | `e02cdb2ba496af19282c4f7ff6bc6f30ff5a9aa079c3b1be01e9d4611b842ee3` |
| `native-f9eb4b1-before2-geometry-en-1024-style-failed-pet-on.png` | `b85d861e455ed99d5b4001f54f4db9f31ba946a1f30b8c1e37ca4b5adca716b4` |
| `native-f9eb4b1-before2-geometry-en-1024-timezone-failed-pet-hidden.png` | `1c105f4573a9e3109bf5ae58fc791b693455e31b5a620261d838dfbd1d1abe06` |
| `native-f9eb4b1-before2-geometry-en-1024-timezone-failed-pet-on.png` | `32a39abe68b3db1afc12b276372062e4da393dd0ac019fa56a37f5c47896fd3c` |
| `native-f9eb4b1-before2-geometry-en-1440-both-failed-pet-hidden.png` | `628615c0a8f36a22de6f659076290c36b06b7fc2e237b70d647896c1764ba8d0` |
| `native-f9eb4b1-before2-geometry-en-1440-both-failed-pet-on.png` | `08b3fc4d999da9f552fcd985cea0f66fa11872d2fc419f02621feb6159394859` |
| `native-f9eb4b1-before2-geometry-en-1440-clean-pet-hidden.png` | `faa5d082aceeedd767ed302ba4f0ba27ab9e553d31e3cf61fedb32e64aca374c` |
| `native-f9eb4b1-before2-geometry-en-1440-clean-pet-on.png` | `39b91e7a5f71b6ce4f1875981e0e189d3074a685354f01e0b21dcabbe8eb0145` |
| `native-f9eb4b1-before2-geometry-en-1440-source-style-pet-hidden.png` | `943b22447d87f9df5d3b3b73b8a1a84588ac12be0e149bdca8a6bf04f9382b6f` |
| `native-f9eb4b1-before2-geometry-en-1440-source-style-pet-on.png` | `22893f55d78176b4e2769744f8a8821c936f6c9207dbec99cbe3af369b266750` |
| `native-f9eb4b1-before2-geometry-en-1440-source-timezone-pet-hidden.png` | `95a3508e01bfae9ef49901516b25b20307af685d1ab3c04969cfb36e59ff3dce` |
| `native-f9eb4b1-before2-geometry-en-1440-source-timezone-pet-on.png` | `c186068342fe92563175f2f3d258841195860e9649f137055792a36adb463b0e` |
| `native-f9eb4b1-before2-geometry-en-1440-style-failed-pet-hidden.png` | `500794fe3fceda5427aa320bffe42bd8ee6c52cab6006566dc1b941c793b2df2` |
| `native-f9eb4b1-before2-geometry-en-1440-style-failed-pet-on.png` | `30379673aed8b961117f1d6035aa205208cedc8b30dc03a93e65cef52d4d84aa` |
| `native-f9eb4b1-before2-geometry-en-1440-timezone-failed-pet-hidden.png` | `e7cdbaecbd386dcc4ac2b2877cca9f0e90caf2e2da3254aa4227e5dc86c2ed5a` |
| `native-f9eb4b1-before2-geometry-en-1440-timezone-failed-pet-on.png` | `e21cc4b66cc5491d9bca28645695bea49c76c116efe1a0548b3e81a85ed144f5` |
| `native-f9eb4b1-before2-geometry-en-375-both-failed-pet-hidden.png` | `2ccda5a9f03217b4b5a33f459421c46cdb3cc53b1f638e293ec27cf619d34889` |
| `native-f9eb4b1-before2-geometry-en-375-both-failed-pet-on.png` | `d62a72976cefaf21fd4706c4594e133f57cb42596624bece6858cb3d9fca1601` |
| `native-f9eb4b1-before2-geometry-en-375-clean-pet-hidden.png` | `857b603ea707f2ce1be3a9921a34a158b6e616043026494599aaab5c58979ddf` |
| `native-f9eb4b1-before2-geometry-en-375-clean-pet-on.png` | `2697fd23a40b57fd13f7ef8088009eb8e84f43dab4777d737da0baeb6f490490` |
| `native-f9eb4b1-before2-geometry-en-375-source-style-pet-hidden.png` | `20a56e9f5c85cf6fbbc100e55af2e5a8fd60ea3f1bf83d860c27a68a48b59529` |
| `native-f9eb4b1-before2-geometry-en-375-source-style-pet-on.png` | `d8de69aa3f6de46e92dc9c8c5676d3a7454a1e7b84ca3f43014720e995500631` |
| `native-f9eb4b1-before2-geometry-en-375-source-timezone-pet-hidden.png` | `efbff6594d9b7437dca6f02a3a0cbc7819baa25cae75295e254ccbf99493a2f8` |
| `native-f9eb4b1-before2-geometry-en-375-source-timezone-pet-on.png` | `4ba7b97d29d21dd446affadc8e3497dbf098f0f3c27dcbd71c7f4edc1f79fffb` |
| `native-f9eb4b1-before2-geometry-en-375-style-failed-pet-hidden.png` | `bc24688113d3ee3b97c3f1db498361676f407501429a5de8844d5c57c9b72808` |
| `native-f9eb4b1-before2-geometry-en-375-style-failed-pet-on.png` | `5aacc8632579ce23aa4695ba07c126f3b2dce8279bdee668287a4cac535050ef` |
| `native-f9eb4b1-before2-geometry-en-375-timezone-failed-pet-hidden.png` | `1df88264460a2f558204f6b648e2b4cd54d8d73aea73e3879a3d9be6ee87dbda` |
| `native-f9eb4b1-before2-geometry-en-375-timezone-failed-pet-on.png` | `24df24a593de0343db90a9e0af4e003e4cc259ae7ada565e564745fde01f86f3` |
| `native-f9eb4b1-before2-geometry-en-414-both-failed-pet-hidden.png` | `b38061073dd33e8cfb92f527b131823e655ad99bbd95fc1218eabfe6f0a80b3a` |
| `native-f9eb4b1-before2-geometry-en-414-both-failed-pet-on.png` | `36f44744fe07a350ac6291f4feeb4d04361412396805d0457ed658a50a73dc86` |
| `native-f9eb4b1-before2-geometry-en-414-clean-pet-hidden.png` | `87508816b75d18b21256aee47fee68e74ac2c311d9b9c1d13f56ce8610069fe8` |
| `native-f9eb4b1-before2-geometry-en-414-clean-pet-on.png` | `8dd3b633036cc8249fce6b32afe2320f252117991965bea64d612adaaf1967d1` |
| `native-f9eb4b1-before2-geometry-en-414-source-style-pet-hidden.png` | `156d4f991d92f00dbc5d824b72a4f5c9afc0efa42f54a524d11359de2cf13d99` |
| `native-f9eb4b1-before2-geometry-en-414-source-style-pet-on.png` | `0a1cc8e4ee02a823d23ef2ef80ea441bfd2ff4f1bf645c7bca10dbb139f4ed39` |
| `native-f9eb4b1-before2-geometry-en-414-source-timezone-pet-hidden.png` | `c7fc73039b34f53a702cc7ae7276780245db647bf38ba720af43b53cfb244ca0` |
| `native-f9eb4b1-before2-geometry-en-414-source-timezone-pet-on.png` | `be0351ecde20b080fa92449eb9115cea94c3e17427a7db63b52d112a8a996c9f` |
| `native-f9eb4b1-before2-geometry-en-414-style-failed-pet-hidden.png` | `410f1410ac46f7a99a53f55ac41f0f2e76aa682b5b3dadb476f8feef54f47d63` |
| `native-f9eb4b1-before2-geometry-en-414-style-failed-pet-on.png` | `033dcadaf0f5c93704ef56346045a113030af4cf3f8418da197d1a6a78a336d8` |
| `native-f9eb4b1-before2-geometry-en-414-timezone-failed-pet-hidden.png` | `3f22117015df74ed4c7f2435856044e2262d689b1007ffbe6969b895a8bdb87a` |
| `native-f9eb4b1-before2-geometry-en-414-timezone-failed-pet-on.png` | `249835fd01181777749b78ccff67ee478f6c0860444db2266b3b9a3de87fca54` |
| `native-f9eb4b1-before2-geometry-en-768-both-failed-pet-hidden.png` | `9890602fb5606d5016db54b70d4d3dc9d05d604d65782b701028f370d8abb1c7` |
| `native-f9eb4b1-before2-geometry-en-768-both-failed-pet-on.png` | `3213be4d39cda6802cafb5fb219d0cfd6f20510344c94964c92ccee6e3296f4e` |
| `native-f9eb4b1-before2-geometry-en-768-clean-pet-hidden.png` | `061ada7a62dd91e436cc30c8a80e21e5a64b37190c455ed24129c5bd6f803fc7` |
| `native-f9eb4b1-before2-geometry-en-768-clean-pet-on.png` | `f14340aa00f8c8b25b664fae0b7987bded597ab5b2a6dcbdc5ad7b1d1ed0d721` |
| `native-f9eb4b1-before2-geometry-en-768-source-style-pet-hidden.png` | `12b9f3ac98f0b5e23f0f77149b20b834f887354c3440667ead9130cd4ae5d6d4` |
| `native-f9eb4b1-before2-geometry-en-768-source-style-pet-on.png` | `289c51bcdb2777fa177c9af1a385c58757f4e232e9569cc38a060c1b4c0ee0a1` |
| `native-f9eb4b1-before2-geometry-en-768-source-timezone-pet-hidden.png` | `0ab82d69a838cfb4f29cbc1b7c9120b943f1aceab23cd4a08b94b8380697dd7c` |
| `native-f9eb4b1-before2-geometry-en-768-source-timezone-pet-on.png` | `fb6c89668f546c82879c9ea3ea75f740f90019d032220fefa2fd70f9dc1014c8` |
| `native-f9eb4b1-before2-geometry-en-768-style-failed-pet-hidden.png` | `5e984573465d01f726c0cb499067bf946fc97969af95bd77860e60f47dc235ad` |
| `native-f9eb4b1-before2-geometry-en-768-style-failed-pet-on.png` | `0f9fdff15ef3995e3deb8be73c687b211a34a9740dc9debd1d87ae6c598f7037` |
| `native-f9eb4b1-before2-geometry-en-768-timezone-failed-pet-hidden.png` | `243dad2efb7b13064fd65b7d88b79a11fc66b51b34f3a2de1bddae0f5bcfe32e` |
| `native-f9eb4b1-before2-geometry-en-768-timezone-failed-pet-on.png` | `10d94ed4dffd62916cbad837b42b35c2c31dbaeea217434afe5a1ce580aaec69` |
| `native-f9eb4b1-before2-geometry-zh-1024-both-failed-pet-hidden.png` | `ad3053859c7501d2b5a765aa2fe44afaad1309fcc4a001b4c5867a690fe6e970` |
| `native-f9eb4b1-before2-geometry-zh-1024-both-failed-pet-on.png` | `b0041bdfa176fcb6af8d7eb086f319eb2057645542a881917d03a0121b26dc36` |
| `native-f9eb4b1-before2-geometry-zh-1024-clean-pet-hidden.png` | `82cf873cbc7927ccefbef1190cc57f418faa69b785bc4a1aacd97dfcb72cae5e` |
| `native-f9eb4b1-before2-geometry-zh-1024-clean-pet-on.png` | `e62226b3685ec58982839a488c3d605b95c66d7165735b8b10c7518911b2acd6` |
| `native-f9eb4b1-before2-geometry-zh-1024-source-style-pet-hidden.png` | `59d49050987e35ecdd64dd78f54a77b806f2aa1e688243c90ae0dec3f1c1705a` |
| `native-f9eb4b1-before2-geometry-zh-1024-source-style-pet-on.png` | `1cf89ac780a53183c42b9ec732c24cfca96df4c374c6dffb410e2ad835dba9f5` |
| `native-f9eb4b1-before2-geometry-zh-1024-source-timezone-pet-hidden.png` | `e6c7cb076b1ce2740d0602d39efc7c21c680193b35e151971f6b46ca635a4779` |
| `native-f9eb4b1-before2-geometry-zh-1024-source-timezone-pet-on.png` | `34f488691200f042051471d06018275ef7e25499cc5a19a758ad51b3f04b8fa5` |
| `native-f9eb4b1-before2-geometry-zh-1024-style-failed-pet-hidden.png` | `5c963efd9fe0776939553d671efa9e69b739893889293bd04f3bb48cec9d706d` |
| `native-f9eb4b1-before2-geometry-zh-1024-style-failed-pet-on.png` | `3171e8cb300c32cdf5eddbd03824302f44cc3516e13f8ff5c5cf6e7c48ba9e6d` |
| `native-f9eb4b1-before2-geometry-zh-1024-timezone-failed-pet-hidden.png` | `5c410770fc0fd4cec5f8c7129b0bcf534e83937a102153b3c6851aadfbac3be9` |
| `native-f9eb4b1-before2-geometry-zh-1024-timezone-failed-pet-on.png` | `1c485fbe86731823b1a9f3ad5c9c956356585447711cf78f85c984c661b9c403` |
| `native-f9eb4b1-before2-geometry-zh-1440-both-failed-pet-hidden.png` | `5656f23c54ed00e9159fe4b4c48528eabea241eef7a15cd002ec7659b56aee01` |
| `native-f9eb4b1-before2-geometry-zh-1440-both-failed-pet-on.png` | `5488cff4344e48b249cec3dc0539ae760e293da0db2fc71362cb47b475670ffc` |
| `native-f9eb4b1-before2-geometry-zh-1440-clean-pet-hidden.png` | `34fba1af8cbb75b893219fb162a841deb9e8090b97f6794f9f0e64630b0b1a3a` |
| `native-f9eb4b1-before2-geometry-zh-1440-clean-pet-on.png` | `1bb4c04fbb1877eec94ea7d67b76d4517f9e2ac3cfc0268d70566aa36e5a9b3b` |
| `native-f9eb4b1-before2-geometry-zh-1440-source-style-pet-hidden.png` | `c77ea2e410c1dcdeb994e58b53539ad7cbdbb036b2282898f1fb6e65ee2580b1` |
| `native-f9eb4b1-before2-geometry-zh-1440-source-style-pet-on.png` | `3f6e89000bcec10c778f57718f9d8a34bc96194a9a6a08f0896a64d27ad67bfe` |
| `native-f9eb4b1-before2-geometry-zh-1440-source-timezone-pet-hidden.png` | `6feff653cad064e60ad8c10bf34883bfe235d3e420107dfb048b3d8fa19d82ed` |
| `native-f9eb4b1-before2-geometry-zh-1440-source-timezone-pet-on.png` | `e826a7ac8cf89cd05bc5aa1f8cec871c75479240ce91d4fe2d6bfccc2e997fde` |
| `native-f9eb4b1-before2-geometry-zh-1440-style-failed-pet-hidden.png` | `34daee5f24a2b452f2327aab7d2df8e34639a1bf7f8c8ed040d40bebf898cfd9` |
| `native-f9eb4b1-before2-geometry-zh-1440-style-failed-pet-on.png` | `8d0a8654b0cbf8826805cc9a2d636fd8e6011b411e9de0f37961e6a4793572f5` |
| `native-f9eb4b1-before2-geometry-zh-1440-timezone-failed-pet-hidden.png` | `5e5d770d870706dc4d6b163fd901833c31c08a519c99b0bfb1950f1f89ced188` |
| `native-f9eb4b1-before2-geometry-zh-1440-timezone-failed-pet-on.png` | `70b9b3ec48df3d9a325e3cb56d541e2dbdfb6940d3ab648b92408059c8fb1a1e` |
| `native-f9eb4b1-before2-geometry-zh-375-both-failed-pet-hidden.png` | `bb85cabaede4ec97c7b6d2bf88702f950ebef70a26c5ca4a5565f524d0b4f55f` |
| `native-f9eb4b1-before2-geometry-zh-375-both-failed-pet-on.png` | `961975d6f80f861971d1e85ef417cea8338cc9f02136b559f837827077dfe4a0` |
| `native-f9eb4b1-before2-geometry-zh-375-clean-pet-hidden.png` | `2b598a1bea618b399e65a1ea2a63fee66843f530519e01a10ad83264b6e7fe83` |
| `native-f9eb4b1-before2-geometry-zh-375-clean-pet-on.png` | `f01fe1acc483b994ff3fc40b91b8d51d5b6a2ef198ab7848ceea2677cb132a99` |
| `native-f9eb4b1-before2-geometry-zh-375-source-style-pet-hidden.png` | `0f98b6a30e9bf77543cec91f9d42c5d5e2f03c1834f96d4919c7546055b608ea` |
| `native-f9eb4b1-before2-geometry-zh-375-source-style-pet-on.png` | `1a3540fb1d436927c559c868c767e833991e8ba625204063fae9f7f6017365d9` |
| `native-f9eb4b1-before2-geometry-zh-375-source-timezone-pet-hidden.png` | `797c71348e880d4542252e1aba3a0041dc2f8b8d8dde52ffcddc33945368221a` |
| `native-f9eb4b1-before2-geometry-zh-375-source-timezone-pet-on.png` | `3909978d075f680ab57feacb0e34cb9c509f8c96009c6fb70cc4490f4638a025` |
| `native-f9eb4b1-before2-geometry-zh-375-style-failed-pet-hidden.png` | `47f507b3a90b8f9d7172405ba4c3a591f43884e3a8c0c3299d3aa4e7ec069a3e` |
| `native-f9eb4b1-before2-geometry-zh-375-style-failed-pet-on.png` | `668c4b324be18a022e10c14b5881ac9251c2a22fd6b071ca40276e6839646ddc` |
| `native-f9eb4b1-before2-geometry-zh-375-timezone-failed-pet-hidden.png` | `698259fc91d387fb6e7533499845f673e0e7a28395cbb706b91c9d13b7f064a8` |
| `native-f9eb4b1-before2-geometry-zh-375-timezone-failed-pet-on.png` | `72fc6f55251e7e4f57f13fc7ffc25afa3a16fcb042ba43def924d7cc11936fcf` |
| `native-f9eb4b1-before2-geometry-zh-414-both-failed-pet-hidden.png` | `0403ff801e0f5b11971c84c0877afee699711380552dea27a292f9884bd312fa` |
| `native-f9eb4b1-before2-geometry-zh-414-both-failed-pet-on.png` | `f800cc6bbbb6c28efbe3bd77c72aa190d92b853719dc4adae3f20e05d960d82a` |
| `native-f9eb4b1-before2-geometry-zh-414-clean-pet-hidden.png` | `420c4edd23055228ef9bf86f09495f388982e3812e8e06f4000357535517975c` |
| `native-f9eb4b1-before2-geometry-zh-414-clean-pet-on.png` | `d17af7795ee750a7972966a3eae7ae26c66bf6b2625fd9f735a0c94783008319` |
| `native-f9eb4b1-before2-geometry-zh-414-source-style-pet-hidden.png` | `5c0a02e1520290d4682549f313955d6672c6575a0938ab9808dcf2ddefbd9d68` |
| `native-f9eb4b1-before2-geometry-zh-414-source-style-pet-on.png` | `38fd6a63735537353d23c2b4d41079f3c496c8fd1ab974c2fe50b4e57aef1224` |
| `native-f9eb4b1-before2-geometry-zh-414-source-timezone-pet-hidden.png` | `5a5ba2b9d55b0c81de55c8375e62174c4f53d551da9111d0dcb87209ab9fca87` |
| `native-f9eb4b1-before2-geometry-zh-414-source-timezone-pet-on.png` | `77234c64b21fc0d2f35f307af2070fe9b2ba9591c8395f67d3cce2c45e763c24` |
| `native-f9eb4b1-before2-geometry-zh-414-style-failed-pet-hidden.png` | `e66e99711aee64ab5a3ee5b53ef5faf31acec0fd2befd44fb4a02051c018b118` |
| `native-f9eb4b1-before2-geometry-zh-414-style-failed-pet-on.png` | `c9fbda5d9d03bb02f1d94f4eeb05a509ec6890647455607e6fd23dcd84af3995` |
| `native-f9eb4b1-before2-geometry-zh-414-timezone-failed-pet-hidden.png` | `fe00e5d556e3f806357ec0e2beecf81ced4b289c0077565bf7a49fb8a9762a61` |
| `native-f9eb4b1-before2-geometry-zh-414-timezone-failed-pet-on.png` | `119870ff31fb492af83d6668769fa9816b6affca31ed86e7f33d9c282f9947c2` |
| `native-f9eb4b1-before2-geometry-zh-768-both-failed-pet-hidden.png` | `b65f44badc47233a86e9b4545a1bb6de0267514d64711726f87705c899b7b5f5` |
| `native-f9eb4b1-before2-geometry-zh-768-both-failed-pet-on.png` | `2c10149830fae461bb86388e447a8401afa51aaa99262219fc7d5eabce1c4395` |
| `native-f9eb4b1-before2-geometry-zh-768-clean-pet-hidden.png` | `20a237f8acf48a6c2f815f5e294092e4d31379fbb173df9f37eab234c25281fc` |
| `native-f9eb4b1-before2-geometry-zh-768-clean-pet-on.png` | `196119569f29600d59c6d49efc7a3db2047ee9b056e69a962538042682ddd9ea` |
| `native-f9eb4b1-before2-geometry-zh-768-source-style-pet-hidden.png` | `514c44703deeb0c0d4b9319e2bbf562539bbfec0d159c46da75f2ef51d3950a6` |
| `native-f9eb4b1-before2-geometry-zh-768-source-style-pet-on.png` | `3a544dd336e9bd24edb32190d6fb5f20689ffbfab38db4e015cd28d94b73705e` |
| `native-f9eb4b1-before2-geometry-zh-768-source-timezone-pet-hidden.png` | `8d3afd215e6686d5c6a10ddad762a4d060b4cd7c389aaacb752b1ed3454c8223` |
| `native-f9eb4b1-before2-geometry-zh-768-source-timezone-pet-on.png` | `629fd8981686e83d5d0455827d96055ea38a50fad9094ba53878a3af6441caa1` |
| `native-f9eb4b1-before2-geometry-zh-768-style-failed-pet-hidden.png` | `08549ecb26e12bda1fec50d9bd5233aeb20058bffb6d318b8df3ff34eecada54` |
| `native-f9eb4b1-before2-geometry-zh-768-style-failed-pet-on.png` | `dc5e6df44fff7cc21490aafccd635f56d001336000c52925ec9e72a065f4a8df` |
| `native-f9eb4b1-before2-geometry-zh-768-timezone-failed-pet-hidden.png` | `0ad50290c2c94f2e0f04b9b26aa442af974ba7c233a047a37882ab42d9e6dfe3` |
| `native-f9eb4b1-before2-geometry-zh-768-timezone-failed-pet-on.png` | `03cb7ed019e598b771b61614a17d06fc27b2881301ca4d41b66347f5e6e1699a` |
| `native-f9eb4b1-before2-geometry.log` | `4b0fa1508ba2d35d3c3973bcfa131f91eccb44561320aed9378eadf116d44daf` |
| `native-f9eb4b1-before2-source-en-375-source-only-style.png` | `479053e8ca497732577aa8984899ba1be9290c76671d4cd97510a21d4972c705` |
| `native-f9eb4b1-before2-source-zh-375-source-only-style.png` | `f5d3557893f31415c96efd90692a59fe0007eba6836bc01301a7f189abb40ff1` |
| `native-f9eb4b1-before2-source.log` | `3fff3210c4792c96c9ccd2ee11bb56f5f411e6a2230d61faba9677a8142a0b36` |
| `native-f9eb4b1-before3-modal-en-1440-Header-plus-failed-Clock-modal.png` | `87b488b8285e66638003be3de84884108fc141a6005e214ee04b92db2e506b4d` |
| `native-f9eb4b1-before3-modal-en-375-Header-plus-failed-Clock-modal.png` | `9777cb8a7051effdf06525ee621d9c252b5f80c9de7b2192007382e119f98c01` |
| `native-f9eb4b1-before3-modal-zh-1440-Header-plus-failed-Clock-modal.png` | `e1c5dbfc49cc2a85c7a6faab36c3e6d74127e1328cd33d7eefd275c6b249bcc3` |
| `native-f9eb4b1-before3-modal-zh-375-Header-plus-failed-Clock-modal.png` | `bf85c2edb7bb6bf8587970626c9fb353382f3c3327799c6b1a4ddd034da1d25d` |
| `native-f9eb4b1-before3-modal.log` | `66699f3de09cc67d88d860414c61afa5cbab8dedbf236778e29a788df025121b` |
| `verify-native-before.mjs` | `4a0b4342fdfe6114b84c048bb1cf3deef0f61b98cf2023fd3f00c796bd522976` |
| `verify-native-focus-states.mjs` | `c2c1a9127632a411dc9b501622591e2c60421ee352000f55285a128d7c76509f` |
| `verify-native-geometry.mjs` | `d0b8b8fbe9295a45aa1d01718db02f3a8ca87eeb93b8b57352256c8b054733d5` |
| `verify-native-modal.mjs` | `f3722ad8531e3a45d612d42262c58f77b6e9bc62a73b6fa866a1fb736d327ec9` |

~~~~

</details>

### Historical source: docs/reviews/web-dashboard-clock-recovery-f1/before-f9eb4b1.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Clock F1-shape BEFORE receipt — f9eb4b1

**Scope:** CP-CLOCK-01 batch 70, contract r2 E5. Independent Sol executor (`gpt-6-sol`) in detached checkout `/Users/lijinlong/.codex/worktrees/audit-clock-b70-20261009/XAI_Desktop`, parent `b5688d8c952dbbb150bf69235493052ad776b832`. This is a frozen BEFORE oracle only. It does not establish fixed-product behavior, controller acceptance, or closure of any inventory item.

## Immutable inputs and provenance

- Requested revision `f9eb4b1`; resolved commit `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Each log records both, the tree, source hashes, measured streamed archive byte count and SHA-256, bundle inputs, archive `@repo` pin and checkout guard, browser version, pipe transport and K-1 key trace.
- The immutable archive measured 148,408,320 bytes, SHA-256 `bb468cede8a9659d9798bdb4c7f0a528faedf3ddfb344fb946f159ce6305a097`, tree `05887cf113639116b228a25041a37b3d5c69a322`; the browser was Chrome 155.0.8059.39. Of 1,022 bundle inputs, 630 were loaded from that archive, 390 from third-party dependencies, and zero from a foreign checkout.
- Contract r2 SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`; dependency, extracted and archived lockfile SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- The F1 prelude is the accepted read-only `docs/reviews/web-sticky-recovery-f1/f1-prelude.js` (`67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670`). The runner verifies both working and committed hashes. Production `App` composition is bundled from the immutable archive; the only synthetic product input is authentication.
- Runner and fixture infrastructure was adapted from the tracked, accepted AppRail F1-shape runner and fixture; Clock c1–c5 assertions were authored from contract r2. An early developmental copy of uncommitted stopped half-work was removed before any mode run and is not frozen or committed evidence. The stopped files were then consulted read-only for selector/scenario orientation only; no stopped log, screenshot or verdict was reused.

The stopped checkout was `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/.claude/worktrees/agent-a5f481d9b8ded5030`. The six source files involved in that discarded developmental copy/read-only orientation were `web-dashboard-clock-recovery-f1/{verify-f1-clock.mjs,f1-clock-host.tsx}` and `web-dashboard-clock-recovery-native/{verify-native-before.mjs,native-before-app.tsx,native-before-prelude.js,native-clock-probes.js}` under its `docs/reviews/` tree. Its logs, screenshots and verdicts were never used as evidence.

## Commands and outcomes

From the detached checkout, with `XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop` as read-only third-party dependencies:

| Command suffix | Log | Exit | Checks | Outcome |
| --- | --- | ---: | ---: | --- |
| `node docs/reviews/web-dashboard-clock-recovery-f1/verify-f1-clock.mjs f9eb4b1 selfcheck before1` | `f1-f9eb4b1-selfcheck-before1.log` | 0 | 30 | Harness-valid; nested-storage spy self-check and positive controls PASS |
| `node docs/reviews/web-dashboard-clock-recovery-f1/verify-f1-clock.mjs f9eb4b1 clock before1` | `f1-f9eb4b1-clock-before1.log` | 2 | 150 | Harness-valid, five expected BEFORE business failures; no precondition failure |

The runner deliberately returns exit 2 when the correctly failing BEFORE business oracle is observed. It refuses to overwrite a log and preserves the nonzero process exit.

| Case | Correct BEFORE result | Required positive part |
| --- | --- | --- |
| c1, Clock draft + live POP | `before-not-held` | Clean coordinator/F1 signature gate PASS |
| c2, Clock draft + accessible-name AppRail click | `before-not-held` | Single trusted click, zero F1 signature/runtime errors PASS |
| c3, Header + Clock drafts | `before-header-only` | Header Retry auto-release once PASS |
| c4, Clock draft + sign-out | `before-not-held` | Rail and Appearance zero-confirm recorder PASS |
| c5, rail draft + Clock draft + sign-out | `before-rail-only` | Trusted intercepted rail drag; Cancel touches neither Clock nor coordinator; rail-first confirm PASS |

The five business failures are the contract's proposed Clock-only differences at `f9eb4b1`. Every case's preconditions passed. The frozen runner also contains the fixed-product c1–c5 branch and exact §11 changed-file gate for a later unchanged E16 rerun; **only BEFORE was executed here**.

## Frozen SHA-256 table

| File | SHA-256 |
| --- | --- |
| `verify-f1-clock.mjs` | `2645d99ea39afa7ab79f235a25ca0e5c7db38be6fc25cae3ef9abbe5c9df938e` |
| `f1-clock-host.tsx` | `f5fa29ac494e2f4da30b064aab802ca84c4df8cd943efc064af8aac8d1ff6e0c` |
| `f1-f9eb4b1-selfcheck-before1.log` | `6a227ced58c5c2b4121f3d45829b754086253517f06d4e7a18c3440e37a8e74b` |
| `f1-f9eb4b1-clock-before1.log` | `2f39b77a2fc456bc0491d06f8fde83d42cd808988ffea8d00a59f759887c4c1b` |

Development probes were external to Git under `/tmp/xai-clock-b70-probes` and were not used as final evidence:

| Probe log | Exit | Checks | Outcome |
| --- | ---: | ---: | --- |
| `f1-f9eb4b1-selfcheck-probe1.log` | 0 | 30 | Harness-valid |
| `f1-f9eb4b1-clock-probe1.log` | 1 | 122 | Harness-invalid selector correction, retained externally |
| `f1-f9eb4b1-clock-probe2.log` | 2 | 150 | Harness-valid, expected BEFORE business failures |

These are distinct from the two official `before1` invocations (180 checks total). No F1 `before2` or `before3` iteration was needed.

~~~~

</details>

### Historical source: docs/reviews/web-dashboard-clock-recovery-qualification-r1/qualification.md

<details><summary>Retained complete historical text</summary>

~~~~text
# Q1 author receipt — BLOCKED / UNQUALIFIED

This bounded batch stopped after **focus-controls formal i1, exit1**. No author PASS, Q2 PASS, method adoption, E4 evidence, product acceptance or item closure is claimed. Counts remain **13/312 completed, 299 unclosed**. No push, merge, promotion, deployment or release.

Parent is `710fd8421ed651ec366c5bb5e3b15fa5151ec7e6`; P0 is `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Frozen executable manifest SHA-256 is `680084ed7ed5ac0609c5a991615994d3c0d0021b796f2591518ca8a117446b47`. Controller scheduling PASS authorized only the first serial iteration. All 51 files in its machine freeze still match their hashes. No source or fixture changed after formal launch.

## Actual invocation and stop

```sh
XAI_Q1_FORMAL_AUTH=680084ed7ed5ac0609c5a991615994d3c0d0021b796f2591518ca8a117446b47 node docs/reviews/web-dashboard-clock-recovery-qualification-r1/verify-qualification.mjs --formal focus-controls 1
```

The formal reservation passed the source/input/authorization guards and consumes **1/3**, including this failed diagnostic. Unified exec session38781 returned exit1. Its complete runtime error output is retained in `q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-stderr-i1.log`. No application stdout was emitted; the corresponding stdout log is zero bytes.

`browser.close()` called Chrome close and then synchronous profile removal before awaiting process exit. `rmSync` threw `ENOTEMPTY` for the task profile's `Default` directory at verify-qualification.mjs:149:160. This unexpected cleanup error interrupted the `finally` block **before it wrote the accumulated raw records, inner controls log and result JSON**. Those in-memory records are missing and cannot be recreated from screenshots or labels. The preceding in-memory case outcome/error is unknown; cleanup error does not establish a pixel or business cause. The missing `...-controls-i1.log` and `...-controls-i1.json` are explicitly recorded in `...-controls-partial-i1.json`. No fabricated replacement inner records are supplied.

**221 native PNG files** from original/candidate captures are retained with full hashes, byte counts and write-order final filenames in the partial receipt. The last written frames prove only the `en-light-375-next-only-style` scenario was being captured. They do not establish that scenario's final assertion disposition, control coverage, intended-negative cause or any subsequent state. One transformed focused native frame was visually inspected: it shows a blue rectangular target focus outline at native375×900. This visual observation is not qualification PASS. Full registered controls coverage remains unproved; no expected-invalid cause is claimed validated without the missing raw metadata.

At UTC2026-10-10T08:58:29.640567, the task profile `/var/folders/zk/bxw8sv_15xx51q2mf6xhdb8c0000gn/T/xai-q1-inert-profile-WW9hzT` still existed, and an exact `--user-data-dir` process query found no matching Chrome processes. The runner had exited1. Read-only residue/path/process observations are retained in `...-controls-residue-i1.json`. No residue was deleted, no cleanup repair or source change was attempted, and no formal retry was launched.

## Costs and unexecuted scope

| Registered unit | Formal used / cap | Actual disposition |
| --- | --- | --- |
| focus-controls | 1/3 | BLOCKED; unexpected cleanup exception; missing inner raw records |
| reload-controls | 0/3 | Unrun full EN/ZH×light/dark×375/768/1440×both fields×14 cases |
| appearance-fapp1 | 0/3 | Unrun both complete matching historical focus matrices |
| appearance-fapp2 | 0/3 | Unrun both complete matching historical focus matrices |
| appearance-accepted | 0/3 | Unrun both complete matching historical focus matrices |
| apprail-accepted | 0/3 | Unrun both complete matching historical focus matrices |
| geometry-reload-p0 | 0/3 | Unrun original/corrected full60-case geometry/reload matrix |

Exactly **two isolated development calibrations /83 checks** remain separately disclosed: i1 17checks (positive fixture margin-clipping refusal), i2 66checks (three EN/light/375 cases). Both source snapshots/logs/native frames are retained. They predate the final candidate and are not formal qualification, historical reproduction or product evidence. No extra probe/batch or recovery implementation was made. Original frozen formal failures with missing bytes remain diagnostics. B70 visual3/3, EN2/ZH2 focus and both unlaunched third focus runs are untouched.

All historical old outcomes, accepted outcomes, next-stop attribution/unknown clipping, field-local visible-and-accessible reload discrimination, complete native census and P0 48-obstruction/30+20-missing/60-overflow equivalence obligations remain **unqualified and unexecuted** for this batch. Static syntax/hash/source preparation is not runtime evidence. Independent impact review must define the scope for a new correcting author before any cleanup/record-retention change or continuation; this author stopped on the controller's instruction. Q2 remains pending and cannot approve adoption from this partial batch.

## Retained provenance and verification

The first preflight `db1d41191f02aeab592249292a7bebb62a6c74d8e0b8777ef58edabc18f8e319` is retained in the full snapshot-i1 with 48 file identities, exact manifest/patch/inputs and seven complete source bytes. Controller found stale inline candidate assertion literals. Only those identity literals changed before the second freeze; actual candidate block/function stayed `0aed2a037e67ce781c89eee46591221d576fb41725ebbad07b492b0985e99266` / `76584fcc9111b2ca0764011ff9704a2ff6cd480939eccfec59a3ef6c1d0fc62f`. Independent static inline/module byte/literal comparison, decoder/aligned comparison byte identity, unchanged native probe identity and eleven executable syntax checks are retained in static-i2. Four historical and two geometry orchestration identities/diffs, all354 historical and737 immutable-parent input hashes, requested/resolved product and full trees, lock/protected roots and empty product/document deltas are retained in inputs-i1/i2. Their historical native reproductions were never launched.

Tracked existing files remain unchanged (`git diff --exit-code HEAD` succeeded). Only the authorized Q1 directory is staged. Full staged whitespace check exits2 solely on literal unified-patch context/original whitespace lines; frozen source-diff.patch bytes are preserved. The check excluding that evidence patch exits0; both exact outputs/exits are retained in final-static-i1.log. Candidate/fixture/driver source diffs are retained in source-diff.patch; the original r2, approved proposals, B70 receipts, products, ledgers and control plane stay intact. Fresh author requested/configured gpt-6.1-sol; accepted dispatch, no independent provider actual-model attestation or fallback assumption, no children.

## Full retained output hash index

This index includes every staged source/helper/fixture/runner/receipt/log/frame/diff and the frozen manifest, excluding only this self-referential qualification.md. Its final SHA-256 is reported with the exact commit receipt externally. Commit and parent establish all file identities; no draft is amended away.

```json
{
  "focus-controls.html": {
    "sha256": "10584e8f18121822bc78318bb3d1badfb937665d3878519ff33cc6dcd90b144e",
    "bytes": 4827
  },
  "manifest.md": {
    "sha256": "680084ed7ed5ac0609c5a991615994d3c0d0021b796f2591518ca8a117446b47",
    "bytes": 23832
  },
  "native-clock-focus-probes-r1.js": {
    "sha256": "10191c2d8a367544e9b3182f0c6bbf18e4c34307910a56ba39242ad8920c78fb",
    "bytes": 44921
  },
  "pixel-focus-qualified-r1.mjs": {
    "sha256": "19c40aecbbd8f442f455a836e2e91694976b08fe842f1969295389161dfed1bc",
    "bytes": 32324
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-0-clock-target-active-focused-i1.png": {
    "sha256": "b517b750a0bf7b79ce155bba80b698da45840fe4dac91feaa79c09bc8474c5ed",
    "bytes": 1275
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-0-clock-target-active-moved-on-i1.png": {
    "sha256": "e80321563fd9c65729e52dd956a1696aa2c5ddd25f95298c67e8e5a8e835bf2b",
    "bytes": 1230
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "a557d89e2cab3eb60dd80039589579a8374d18535d767b4fa8a9996b58dbc117",
    "bytes": 13035
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "a557d89e2cab3eb60dd80039589579a8374d18535d767b4fa8a9996b58dbc117",
    "bytes": 13035
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-initial-i1.png": {
    "sha256": "54b917f4b70f429b0d84c4e5ff99f2b6aa7fbcd818aa38cd10d3b72c59374a14",
    "bytes": 12980
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-2-i1.png": {
    "sha256": "54b917f4b70f429b0d84c4e5ff99f2b6aa7fbcd818aa38cd10d3b72c59374a14",
    "bytes": 12980
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-5-i1.png": {
    "sha256": "b517b750a0bf7b79ce155bba80b698da45840fe4dac91feaa79c09bc8474c5ed",
    "bytes": 1275
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-6-i1.png": {
    "sha256": "b517b750a0bf7b79ce155bba80b698da45840fe4dac91feaa79c09bc8474c5ed",
    "bytes": 1275
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-7-i1.png": {
    "sha256": "e80321563fd9c65729e52dd956a1696aa2c5ddd25f95298c67e8e5a8e835bf2b",
    "bytes": 1230
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-8-i1.png": {
    "sha256": "e80321563fd9c65729e52dd956a1696aa2c5ddd25f95298c67e8e5a8e835bf2b",
    "bytes": 1230
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-active-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-0-clock-target-inactive-focused-i1.png": {
    "sha256": "1c05ab1ba8d4e17d7b098e02fe2e65ab2c804dca6333d6854e8258124439e790",
    "bytes": 1172
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-0-clock-target-inactive-moved-on-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-initial-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-2-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-5-i1.png": {
    "sha256": "1c05ab1ba8d4e17d7b098e02fe2e65ab2c804dca6333d6854e8258124439e790",
    "bytes": 1172
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-6-i1.png": {
    "sha256": "1c05ab1ba8d4e17d7b098e02fe2e65ab2c804dca6333d6854e8258124439e790",
    "bytes": 1172
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-7-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-8-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-inactive-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-0-clock-target-masked-focused-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-0-clock-target-masked-moved-on-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "cafc0e54d7a67b7d249d6e38d40539dc33bf251f46a23c4c5796d4211f612dad",
    "bytes": 12952
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "cafc0e54d7a67b7d249d6e38d40539dc33bf251f46a23c4c5796d4211f612dad",
    "bytes": 12952
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-initial-i1.png": {
    "sha256": "d630794bb1bac8354f2501afa4d7f7d97b797db8c21b1c5e90d3f3153fb8dd2e",
    "bytes": 12909
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-2-i1.png": {
    "sha256": "d630794bb1bac8354f2501afa4d7f7d97b797db8c21b1c5e90d3f3153fb8dd2e",
    "bytes": 12909
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-5-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-6-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-7-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-8-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-pixel--clock-target-masked-focused-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-masked-style-original-pixel--clock-target-masked-moved-on-i1.png": {
    "sha256": "6b95496c12118da21fdb245f59f9581ee501317c424e735358955ee250f3979e",
    "bytes": 1173
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-0-outside-target-focused-i1.png": {
    "sha256": "0bd15f30706c4ee3a372524e997f970154192705edff6470fe5eee61fb8e2712",
    "bytes": 1159
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-0-outside-target-moved-on-i1.png": {
    "sha256": "30e2b85d090187c861304970488f2105cef99752b0cd8c590a682b9ad3ccaaa2",
    "bytes": 1145
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-0-outside-target-outside-native-context-i1.png": {
    "sha256": "5d3be402e735e962bc8c17776607b25e20d5c01d6ef0c93cb601554cd33f3ace",
    "bytes": 12900
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-0-outside-target-outside-native-context-repeat-i1.png": {
    "sha256": "5d3be402e735e962bc8c17776607b25e20d5c01d6ef0c93cb601554cd33f3ace",
    "bytes": 12900
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "7b465cf92f1d3997581982c9c86ee656de5e2c4465f92b9a37b297691a04a534",
    "bytes": 12938
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "7b465cf92f1d3997581982c9c86ee656de5e2c4465f92b9a37b297691a04a534",
    "bytes": 12938
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-initial-i1.png": {
    "sha256": "72305fb72ab8af0036262f11179741a50a527102e2d2bed6621c94c67104d91e",
    "bytes": 12889
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-2-i1.png": {
    "sha256": "72305fb72ab8af0036262f11179741a50a527102e2d2bed6621c94c67104d91e",
    "bytes": 12889
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-5-i1.png": {
    "sha256": "0bd15f30706c4ee3a372524e997f970154192705edff6470fe5eee61fb8e2712",
    "bytes": 1159
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-6-i1.png": {
    "sha256": "0bd15f30706c4ee3a372524e997f970154192705edff6470fe5eee61fb8e2712",
    "bytes": 1159
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-7-i1.png": {
    "sha256": "30e2b85d090187c861304970488f2105cef99752b0cd8c590a682b9ad3ccaaa2",
    "bytes": 1145
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-8-i1.png": {
    "sha256": "30e2b85d090187c861304970488f2105cef99752b0cd8c590a682b9ad3ccaaa2",
    "bytes": 1145
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-next-only-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-0-clock-target-no-focus-focused-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-0-clock-target-no-focus-moved-on-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-initial-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-2-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-5-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-6-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-7-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-8-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-pixel--clock-target-no-focus-focused-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-no-focus-style-original-pixel--clock-target-no-focus-moved-on-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-0-clock-target-occluded-focused-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-0-clock-target-occluded-moved-on-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-1-outside-next-focused-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-1-outside-next-moved-on-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "07f0beb7a46f300b9d90a07496956cedb18c075097a5a665f98b4ace3a37d914",
    "bytes": 11365
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "07f0beb7a46f300b9d90a07496956cedb18c075097a5a665f98b4ace3a37d914",
    "bytes": 11365
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-initial-i1.png": {
    "sha256": "07f0beb7a46f300b9d90a07496956cedb18c075097a5a665f98b4ace3a37d914",
    "bytes": 11365
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-10-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-11-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-12-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-2-i1.png": {
    "sha256": "07f0beb7a46f300b9d90a07496956cedb18c075097a5a665f98b4ace3a37d914",
    "bytes": 11365
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-5-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-6-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-7-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-8-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-native-frame-9-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-pixel--clock-target-occluded-focused-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-pixel--clock-target-occluded-moved-on-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-pixel--outside-next-focused-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-occluded-style-original-pixel--outside-next-moved-on-i1.png": {
    "sha256": "f6269454dd16c35695ae3877957190a803c0f82c08557d7af8a76d2ac63f695d",
    "bytes": 240
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-0-clock-target-outline-none-focused-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-0-clock-target-outline-none-moved-on-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-initial-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-2-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-5-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-6-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-7-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-8-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-pixel--clock-target-outline-none-focused-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-outline-none-style-original-pixel--clock-target-outline-none-moved-on-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-0-clock-target-selected-focused-i1.png": {
    "sha256": "b517b750a0bf7b79ce155bba80b698da45840fe4dac91feaa79c09bc8474c5ed",
    "bytes": 1275
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-0-clock-target-selected-moved-on-i1.png": {
    "sha256": "e80321563fd9c65729e52dd956a1696aa2c5ddd25f95298c67e8e5a8e835bf2b",
    "bytes": 1230
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "a557d89e2cab3eb60dd80039589579a8374d18535d767b4fa8a9996b58dbc117",
    "bytes": 13035
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "a557d89e2cab3eb60dd80039589579a8374d18535d767b4fa8a9996b58dbc117",
    "bytes": 13035
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-initial-i1.png": {
    "sha256": "54b917f4b70f429b0d84c4e5ff99f2b6aa7fbcd818aa38cd10d3b72c59374a14",
    "bytes": 12980
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-2-i1.png": {
    "sha256": "54b917f4b70f429b0d84c4e5ff99f2b6aa7fbcd818aa38cd10d3b72c59374a14",
    "bytes": 12980
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-5-i1.png": {
    "sha256": "b517b750a0bf7b79ce155bba80b698da45840fe4dac91feaa79c09bc8474c5ed",
    "bytes": 1275
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-6-i1.png": {
    "sha256": "b517b750a0bf7b79ce155bba80b698da45840fe4dac91feaa79c09bc8474c5ed",
    "bytes": 1275
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-7-i1.png": {
    "sha256": "e80321563fd9c65729e52dd956a1696aa2c5ddd25f95298c67e8e5a8e835bf2b",
    "bytes": 1230
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-8-i1.png": {
    "sha256": "e80321563fd9c65729e52dd956a1696aa2c5ddd25f95298c67e8e5a8e835bf2b",
    "bytes": 1230
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-selected-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-0-outside-target-focused-i1.png": {
    "sha256": "2bd8eca8b54726523040d8787c5e999c41fefde155a56a2333422d9ca2ccd5ea",
    "bytes": 12923
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-0-outside-target-focused-repeat-i1.png": {
    "sha256": "2bd8eca8b54726523040d8787c5e999c41fefde155a56a2333422d9ca2ccd5ea",
    "bytes": 12923
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-0-outside-target-moved-on-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-0-outside-target-moved-on-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-initial-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-10-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-2-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-5-i1.png": {
    "sha256": "e5c9a639044980520b55e40b7672e0dd5b60890bd2b7b9d0527b4d9c583f29e4",
    "bytes": 1188
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-6-i1.png": {
    "sha256": "e5c9a639044980520b55e40b7672e0dd5b60890bd2b7b9d0527b4d9c583f29e4",
    "bytes": 1188
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-7-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-8-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-next-only-style-original-native-frame-9-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-0-outside-target-focused-i1.png": {
    "sha256": "9ccf091f9583096451a77615c02f622768ad2493a4c93671d02239bdf6f4b038",
    "bytes": 13074
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-0-outside-target-focused-repeat-i1.png": {
    "sha256": "9ccf091f9583096451a77615c02f622768ad2493a4c93671d02239bdf6f4b038",
    "bytes": 13074
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-0-outside-target-moved-on-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-0-outside-target-moved-on-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-initial-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-10-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-2-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-5-i1.png": {
    "sha256": "ca3440ad943fe61e5e68e9dff54c6fd02c839efc3955fad8209b360ab3fc1210",
    "bytes": 1296
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-6-i1.png": {
    "sha256": "ca3440ad943fe61e5e68e9dff54c6fd02c839efc3955fad8209b360ab3fc1210",
    "bytes": 1296
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-7-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-8-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-transformed-style-original-native-frame-9-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-0-clock-target-unselected-focused-i1.png": {
    "sha256": "1c05ab1ba8d4e17d7b098e02fe2e65ab2c804dca6333d6854e8258124439e790",
    "bytes": 1172
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-0-clock-target-unselected-moved-on-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-1-outside-next-focused-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-1-outside-next-moved-on-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-1-outside-next-outside-native-context-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-1-outside-next-outside-native-context-repeat-i1.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-initial-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-1-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-10-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-11-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-12-i1.png": {
    "sha256": "58cdf181284b6804cc32baacb3b14348c5d9cbd35527d786be5e69a012c68c14",
    "bytes": 884
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-2-i1.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-3-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-4-i1.png": {
    "sha256": "c98881cc796311a32f1457e82ceaa53f93eb9002723ea29638ceab94bbe60a6a",
    "bytes": 5849
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-5-i1.png": {
    "sha256": "1c05ab1ba8d4e17d7b098e02fe2e65ab2c804dca6333d6854e8258124439e790",
    "bytes": 1172
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-6-i1.png": {
    "sha256": "1c05ab1ba8d4e17d7b098e02fe2e65ab2c804dca6333d6854e8258124439e790",
    "bytes": 1172
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-7-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-8-i1.png": {
    "sha256": "f7bf78858bd510dd1fd7bfb42cb3e183b4ca96ef95003726c4611283de5ea0a6",
    "bytes": 1127
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-en-light-375-unselected-style-original-native-frame-9-i1.png": {
    "sha256": "2134e0b57221313bc4ec44c375dd0f73269e42d919e280af242f2b48d5b20fa4",
    "bytes": 930
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-partial-i1.json": {
    "sha256": "815eb667a52fd72c42c869a0e35b9134ae07ac8ba8ecde9adb5d8a15370668fd",
    "bytes": 61276
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-residue-i1.json": {
    "sha256": "d52041ebfe04915bcbaa407854513446fc47b48666019926bcd5a500c1d4f4ed",
    "bytes": 1399
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-stderr-i1.log": {
    "sha256": "b46ef1ca23fb5e7f33e33a47f37bc3e9fbe8d2ffbfaa5a7335165ba0ddaae22e",
    "bytes": 988
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-controls-stdout-i1.log": {
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "bytes": 0
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-0-outside-target-focused-i2.png": {
    "sha256": "bb177e31f9e3708afd6679835de3c95429674abe3bc122d52657821c86461c8e",
    "bytes": 14718
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-0-outside-target-focused-repeat-i2.png": {
    "sha256": "bb177e31f9e3708afd6679835de3c95429674abe3bc122d52657821c86461c8e",
    "bytes": 14718
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-0-outside-target-moved-on-i2.png": {
    "sha256": "34e3314bda0931e806a1b2ccd3794909bde028d5f7c21b3a2c3fa5fcaad977de",
    "bytes": 14720
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-0-outside-target-moved-on-repeat-i2.png": {
    "sha256": "34e3314bda0931e806a1b2ccd3794909bde028d5f7c21b3a2c3fa5fcaad977de",
    "bytes": 14720
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-1-outside-next-focused-i2.png": {
    "sha256": "34e3314bda0931e806a1b2ccd3794909bde028d5f7c21b3a2c3fa5fcaad977de",
    "bytes": 14720
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-1-outside-next-focused-repeat-i2.png": {
    "sha256": "34e3314bda0931e806a1b2ccd3794909bde028d5f7c21b3a2c3fa5fcaad977de",
    "bytes": 14720
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-1-outside-next-moved-on-i2.png": {
    "sha256": "96407211584297c2b9de8c10abcb045b553c404f001cb9c49015e84dd190bad2",
    "bytes": 14669
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-1-outside-next-moved-on-repeat-i2.png": {
    "sha256": "96407211584297c2b9de8c10abcb045b553c404f001cb9c49015e84dd190bad2",
    "bytes": 14669
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-partial-occluded-style-initial-i2.png": {
    "sha256": "96407211584297c2b9de8c10abcb045b553c404f001cb9c49015e84dd190bad2",
    "bytes": 14669
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-0-outside-target-focused-i2.png": {
    "sha256": "49073267691ae5a891833eff309083f75cad520d1aaf48d834c0903f2aa052d4",
    "bytes": 14977
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-0-outside-target-focused-repeat-i2.png": {
    "sha256": "49073267691ae5a891833eff309083f75cad520d1aaf48d834c0903f2aa052d4",
    "bytes": 14977
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-0-outside-target-moved-on-i2.png": {
    "sha256": "c72c195bac5c9fdd77462da6a9ecd503c4cfce5a29b15b55e48f76e74d9343d7",
    "bytes": 14959
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-0-outside-target-moved-on-repeat-i2.png": {
    "sha256": "c72c195bac5c9fdd77462da6a9ecd503c4cfce5a29b15b55e48f76e74d9343d7",
    "bytes": 14959
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-1-outside-next-focused-i2.png": {
    "sha256": "c72c195bac5c9fdd77462da6a9ecd503c4cfce5a29b15b55e48f76e74d9343d7",
    "bytes": 14959
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-1-outside-next-focused-repeat-i2.png": {
    "sha256": "c72c195bac5c9fdd77462da6a9ecd503c4cfce5a29b15b55e48f76e74d9343d7",
    "bytes": 14959
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-1-outside-next-moved-on-i2.png": {
    "sha256": "d5b496d8bccf7f120e27ddb9c5556c8ba34ba73c832c265332751cdc20a995f0",
    "bytes": 14909
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-1-outside-next-moved-on-repeat-i2.png": {
    "sha256": "d5b496d8bccf7f120e27ddb9c5556c8ba34ba73c832c265332751cdc20a995f0",
    "bytes": 14909
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-ring-occluded-style-initial-i2.png": {
    "sha256": "d5b496d8bccf7f120e27ddb9c5556c8ba34ba73c832c265332751cdc20a995f0",
    "bytes": 14909
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-0-outside-target-focused-i1.png": {
    "sha256": "5324aedb76044a47c9e2c10c632222438b27c8487afffa088be0d16db21ec535",
    "bytes": 13067
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-0-outside-target-focused-i2.png": {
    "sha256": "9ccf091f9583096451a77615c02f622768ad2493a4c93671d02239bdf6f4b038",
    "bytes": 13074
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-0-outside-target-focused-repeat-i1.png": {
    "sha256": "5324aedb76044a47c9e2c10c632222438b27c8487afffa088be0d16db21ec535",
    "bytes": 13067
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-0-outside-target-focused-repeat-i2.png": {
    "sha256": "9ccf091f9583096451a77615c02f622768ad2493a4c93671d02239bdf6f4b038",
    "bytes": 13074
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-0-outside-target-moved-on-i2.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-0-outside-target-moved-on-repeat-i2.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-1-outside-next-focused-i1.png": {
    "sha256": "3d039b49efe4e885b62e75c8807acdad9a87248388f27c648581629940d146e9",
    "bytes": 12915
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-1-outside-next-focused-i2.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-1-outside-next-focused-repeat-i1.png": {
    "sha256": "3d039b49efe4e885b62e75c8807acdad9a87248388f27c648581629940d146e9",
    "bytes": 12915
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-1-outside-next-focused-repeat-i2.png": {
    "sha256": "23b776862ec3da92b1f7ff28a3e2743560e1ef7740609430fcfb632102a0e80e",
    "bytes": 12911
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-1-outside-next-moved-on-i2.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-1-outside-next-moved-on-repeat-i2.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-initial-i1.png": {
    "sha256": "f5518c30d9ea156536a56ed2b1630f9775a12df7efb4684071cbfa401c59032c",
    "bytes": 12866
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-en-light-375-transformed-style-initial-i2.png": {
    "sha256": "75f84e05e93b4fed8cffda22e5b6fbdb1a7a559cfbdb4ab623c82c6f50634744",
    "bytes": 12858
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-i1.json": {
    "sha256": "26fa46be94b98a67a9cf7385266c1e3cb19a27c5c1297f07f3d400edc66aa11e",
    "bytes": 3579
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-i1.log": {
    "sha256": "1e8e0e5cef4bf1541c893d32ef03cbbc082d3786c4c53664311a5a6fb0003085",
    "bytes": 176661
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-i2.json": {
    "sha256": "d9e7701cbf5bb1e9aef7ca1c79585dfc19350e48aef54c93b614a65a3e180930",
    "bytes": 16814
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-i2.log": {
    "sha256": "ebcdf9668504694b15fa6ee480c5bab4276ce3c6b432267b007810e6b1716f8d",
    "bytes": 381853
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-source-i1.json": {
    "sha256": "9a9fe4823a1d15117f217799cc5640178cb0b7b8f96f2046379774b82457cf3f",
    "bytes": 210945
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-development-calibration-source-i2.json": {
    "sha256": "e80af342915149c8e4ce32e9999769accfec554a29c1301438ea1a8c791ce556",
    "bytes": 210867
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-final-static-i1.log": {
    "sha256": "02e1882fca0ae05cca5aad0ac835683b9d360ee31e0b30854222d287aa29dfc6",
    "bytes": 1950
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-preflight-inputs-i1.json": {
    "sha256": "cc30f412835fc67ebce91793757cf93c2dd28d3c6588c3b68d6bf28c574bbeae",
    "bytes": 2952404
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-preflight-inputs-i2.json": {
    "sha256": "cc30f412835fc67ebce91793757cf93c2dd28d3c6588c3b68d6bf28c574bbeae",
    "bytes": 2952404
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-preflight-snapshot-i1.json": {
    "sha256": "fa0332e77d0981b9358ea6197de1f9d5290307fd883474a68475f2de8d6cdaf0",
    "bytes": 3823119
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-preflight-static-i1.log": {
    "sha256": "feeaf5818123b74801d239038a2faece022373886b2ec85e159fdee126561f02",
    "bytes": 2162
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-preflight-static-i2.log": {
    "sha256": "287950cfeec0a2de7348f61d23a020ba877e83eabae3301926f12c9b15fe2934",
    "bytes": 2421
  },
  "q1-focus-controls-f9eb4b1f207bc4b46f547b90afc250424b3c8695-reservation-i1.json": {
    "sha256": "b4df7b0acca6d207c1286c3bd3e0451d63b0888daf543e98fb40dc76c0bf98a3",
    "bytes": 325
  },
  "reload-controls.html": {
    "sha256": "0ea778c7738ad77e99e6d5300349b75b14ba595446e214856e8f7f5467b02ba4",
    "bytes": 2280
  },
  "source-diff.patch": {
    "sha256": "3192d40a55b275dd33db409688e6737f9700307d61aef3cb92ea68878d51a50d",
    "bytes": 275026
  },
  "verify-native-focus-qualified-r1.mjs": {
    "sha256": "00f2ccea4fbcbd51ef5d1f2fda5179e9c5e76031219e8adda19dd554d9ce95ca",
    "bytes": 148914
  },
  "verify-native-geometry-reload-r1.mjs": {
    "sha256": "38da53144d5137b531edbbd6c5dcb0cb38702c70e8e0b14a475dbf9b8e731759",
    "bytes": 150165
  },
  "verify-qualification.mjs": {
    "sha256": "4caf717a8f28f69ff2504b5632719b76809df735f3fd2fad03dd8a6e793d74d4",
    "bytes": 45931
  }
}
```

~~~~

</details>

### Historical source: docs/reviews/web-dashboard-clock-recovery-qualification-r2/qualification.md

<details><summary>Retained complete historical text</summary>

~~~~text
# CLOCK/CORRECT-IMPL correction-validation receipt — UNQUALIFIED

Module web. Fresh independent Sol lifecycle corrector `/root/parallel_a_clock_retention_corrector`, configured `gpt-6.1-sol`; no independent provider actual-model attestation, no children. Sole writable worktree `/Users/lijinlong/.codex/worktrees/audit-parallel-clock-retention-20261010/XAI_Desktop`, clean starting parent `fb95dd39117ca98a9b5a038a29b40d015936fe85`. Other writers were not touched. This is correction validation, not formal qualification, method adoption, business acceptance, READY_TO_SHIP, cross-vendor evidence, release, or audit closure.

## Validation and retained failures

Only deterministic owned Node subprocess/filesystem work plus immutable Git reads and source-only Node syntax checks were executed. All three commands: `node docs/reviews/web-dashboard-clock-recovery-qualification-r2/verify-evidence-retention.mjs 1`, then `2`, then `3`. Every invocation opens its exclusive append journal before acquisition and embeds exact current helper/driver/test source bytes. i1 preserves its failure and source hashes; i2/i3 preserve complete generated-source/inventory snapshots and raw synthetic files before removal of their exact newly allocated scratch directory.

| Suite | Exit | Cases | Assertions | Disposition |
| --- | --- | --- | --- | --- |
| i1 | 1 | 13/14 | 39 | Static generated adapter could not match AppRail's different exact overwrite guard. All eleven retention fault families, ownership and causal rejection passed. |
| i2 | 0 | 14/14 | 51 | Six generated adapters syntax checked; full raw synthetic files/events/dispositions retained. |
| i3 | 0 | 14/14 | 55 | Actual nested ancestor-scroll metadata and window/ancestor cross-cause rejection added after static inspection. |

Cumulative **3/3 validation invocations, 145 assertions, 41/42 case executions passing; one retained failed invocation**. Validation budget exhausted; source/test bytes freeze at i3. i1→i2 supported AppRail's exact guard, handled absent profile canonicalization without losing startup ownership, and gave secondary finalization a distinct record name to preserve original historical `result`. i2→i3 fixed nested `ancestors[].scroll.{x,y}` predicates, recorded actual trusted mouse dispatch metadata, and moved independent-review refusal into the durable reservation preflight. No failing evidence was amended away. The per-run source snapshots are authoritative for these iterations.

All eleven required faults were exercised: primary+cleanup; cleanup-only; slow/no-exit owned child (TERM ignored, then KILL and actual close); CDP-close rejection; startup ENOENT before handle return; injected journal/result write failures with continued finalizers; child partial stdout/stderr and exact exit2; checkout cleanup failure; overwrite refusal; interrupted tail; inherited cumulative reservation. Additional exact-owner/symlink rejection and wrong-cause rejection were checked. Every generated historical/geometry adapter received a source-only syntax check in i2 and i3 (12 checks total); none was executed. No browser, native, probe, product, package, server, formal seven-unit or calibration invocation occurred. Formal new=0; development probes new=0. Expected injected persistence stderr is part of the exercised fault, not an undisclosed native failure.

## Limits and frozen next step

Retention validation passes on the final candidate, but **the method remains UNQUALIFIED and formal continuation is BLOCKED**. Protected pixel helper :350 stores first/again/comparison invalid rows, omitting bounded stable-capture attempts/hash outcomes when comparison is null; :370 may throw before :371's walk record. That cannot establish the required instability causal proof. `inducedCause('unstable',...)` explicitly refuses; exact impact/source review is required before diagnostics can expand. No protected helper, fixture or pixel algorithm was changed. Other causal predicates are conservative and must still survive independent actual correction source review and the full original runtime matrix; synthetic checks prove neither pixels nor business behavior. Any insufficient metadata or contradictory fixture stays BLOCKED with raw data retained, and cannot be rescued by an unrelated refusal.

The helper intentionally retains exact task profiles/directories when descendant quiescence is uncertain. Close-command and TERM/KILL waits are bounded (default0.5+1.5+1.5s, each operation<=5s; lifecycle<=15s); signals address only owned synthetic children in these tests. Browser policy exists as unexecuted source. No historical Q1 residue or user profile was inspected/deleted; no glob/global kill. Successful process-close observations do not establish Chrome descendant quiescence. Permanent formal counts import exact r1 focus1, others0 and refuse skips/duplicates/caps; no new-directory reset. Q1 development2/83 and original Q1 failed focus1 are preserved. B70 native12/6432, development40/4884, visual3/3 exhausted, focusEN2/ZH2; F1 formal2/180, development3/302 are immutable historical receipts. Formal audit13 completed/3 verification_pending/3 in_progress/293 pending;299 unclosed unchanged.

All six copied dependencies equal Q1 686e98b bytes; all280 retained Q1 paths and51 manifest entries verified; original bacdbbc file/block/function and candidate copy identities remain frozen. Product/apps/packages/lock/protected-contract/proposals/r1/control diff is empty. Only exact registered r2 outputs are added. A single local intent commit follows with per-command hooks disabled; no push/merge/rebase/deploy/release/promotion/D3. Root owns durable remote preservation, receipt/integration/sync-check and fresh independent correction review. Request root receipt/source review, then separate fresh diagnostic-impact review for the instability gap; do not launch formal qualification from this receipt.

~~~~

</details>

### Historical source: docs/reviews/web-dashboard-clock-recovery-correction-impact-r2/impact.md

<details><summary>Retained complete historical text</summary>

~~~~text
# CLOCK/CORRECT-IMPACT2 — independent static technical impact

2026-10-10 · Module **web** (qualification evidence / project-system) · Workflow A.

**Static impact complete. R1–R6 are substantiated; the candidate remains REVISE / UNQUALIFIED. Continuation is hard-budget BLOCKED.** There is a technically bounded additive correction design, but no valid path to validate and adopt that correction under the remaining retention budget: **3/3 used, zero remaining**. This report does not authorize repair, a fourth run, metadata adoption, qualification, or a budget exception. It records the smallest concrete future scope and the external condition preventing its execution. All existing failures, source bytes and costs remain evidence.

## 1. Authority, independence and fixed inputs

Fresh independent reviewer `/root/parallel_a_clock_impact2`; not the Q1, correction, prior impact or source-review author; no children. Requested Astra role is dispatch information, not independently attested provider model or cross-vendor verification. Sole writable worktree `/Users/lijinlong/.codex/worktrees/audit-parallel-clock-impact2-20261010/XAI_Desktop`; initial status clean, fixed parent **683d3b1ea5e824170d00cb0b09364df29271d181**. Ownership is exactly this report and sibling `inputs.sha256`; no other worktree, source, product or control writes.

Read the original goal first (SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`), then AGENTS, CLAUDE, shared workflow/multi-machine rules, authority overlay, r2 scheduler and the exact parent `parallel-control-r1/task-clock-impact2.json`. The scheduler resource is not adopted merely by this read. Root owns adoption, global state, receipt, remote preservation, push and sync-check. The approved M+G+B scope and parallel overlay do not waive caps or acceptance.

| Input | Exact commit / significance |
| --- | --- |
| Independent REVISE | `cbf18b491ef10941d396bc9655d10c8beed4a68b` |
| Correction candidate | `a6a78097120094464701bf833a51bf0014d1d8d0`; 18 additions |
| Accepted prior impact | `f37c8607ef30fc5bd927425ae1ee6837f7276c53`; its geometry exit0 statement is specifically contradicted below |
| Original Q1 | `686e98b6251364aee1fa26c63ad30e6af15c3b25` |
| Approved proposal/plan | `213aafd92e4ea3a43d943fb766efa73fb4cbbe96` |
| Original authorization / geometry source | `710fd8421ed651ec366c5bb5e3b15fa5151ec7e6` |
| Product | `f9eb4b1f207bc4b46f547b90afc250424b3c8695`, tree `05887cf113639116b228a25041a37b3d5c69a322` |
| Canonical r2 | `8bf613962517ee9b80bf51373e8ad88960c570cc`, contract hash `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae` |

## 2. Complete provenance recheck

Independently rehashed **all 368 source-review inputs**: **316 fixed Git blobs + 51 embedded UTF-8 fields + original attachment**, with zero mismatch. The 51 fields are not guessed paths: for each exact `retention-checks-iN.log`, select `validation-source-freeze.sources[filename].source` (9 fields); select each named `generated-unit-source` unit's `source` and `original` (24 fields); select `synthetic-raw-files.files` by unique `Path(path).name`, hash its `text` verbatim (18 fields). Symlink records are not misrepresented as raw file text. Each embedded digest also equals the record's own stored digest. i1 has no retained synthetic-raw-files snapshot; that absence is preserved.

The index adds 12 identities for the review outputs, current authority/card and original geometry source/log/receipt: **380 total**. The 328 fixed Git blobs read cover all 280 original Q1 files, all 18 correction outputs, original provenance and governing sources. Six dependency copies remain byte-identical to Q1. All nine recorded non-equal source line maps independently match Python `SequenceMatcher(..., autojunk=False)` against actual original driver / empty added source / original generated source and the retained candidate. Generated sources were read as data, never imported, generated anew or syntax-executed.

Each retained final JSON equals the terminal journal record: i1 31 records/39 checks/13 of 14 cases passing; i2 47/51/14 of 14; i3 47/55/14 of 14. Thus **145 assertions, 41/42 case executions passing, 3 invocations consumed**. The i1 missing-anchor failure survives. i2/i3 passing synthetic receipts are unqualified observations, not proof of the untested integration boundaries below. Hash equality does not prove runtime behavior.

## 3. Independent causal trace and smallest correction boundaries

Unless otherwise stated, ordinary coordinates below mean files under `web-dashboard-clock-recovery-qualification-r2/` at a6a7809. Generated coordinates mean the exact i3 journal `generated-unit-source.source` string. Original/generated bytes remain immutable.

| Finding | Actual source trace and consequence | Narrow future correction |
| --- | --- | --- |
| **R1: terminal/callback persistence** | Driver `retentionSource`:145–159 makes every original `record` invoke throwing `journal.record` (helper:14), but starts the protected replacement only at the old final `writeFileSync`. Every original terminal `record("result")` remains outside it. A measurement/write failure enters `finally`; another write failure escapes before owned browsers/server and terminal outcome are attempted. Appearance fapp1 generated:438 also records pipe closure before rejecting pending requests: a synchronous persistence throw in that event callback bypasses the awaited catch and pending rejection. | Establish the lifecycle/error accumulator before resource acquisition. Freeze original primary outcome before any terminal I/O. Put terminal record construction/write and owned cleanup inside an outer guaranteed finalization path; each event callback records errors without throwing out of the event dispatcher, always settles pending operations, and routes failure to the owned run. Keep the failure fatal; never swallow it into PASS or replace the first primary cause. Test generated call sites, not only the helper. |
| **R2: independent streams** | Helper:53–62 records real child code/signal then returns through unguarded stdout/stderr fsync/close. stdout fsync/close throwing skips stderr and replaces the child result; driver:291–295/301–305 never receives it. Data-write errors are collected at:57 but terminal fsync/close errors are not. Startup/open failures can also leave only partial acquisition. | Keep structured `exit`, `signal`, startup error, partial bytes and per-stream persistence/close outcomes in a result object independent of finalizer success. Guard stdout flush, stdout close, stderr flush and stderr close separately; attempt every acquired descriptor exactly once, even after prior faults. Record missing acquisition explicitly. Return child outcome plus separate errors; outer gate remains nonzero for any persistence fault. |
| **R3: finite composed lifecycle** | Helper:61 awaits `owner.closedPromise` indefinitely. `subprocess`:265 does not expose ownership/deadlines to `composedUnit`. `closeOwned`:28–37 is not on this await path. A hung child or an inherited writer keeping pipes open strands the outer primary snapshot/finalizers. Generated fapp1:445–450 and geometry-new:317–322 retain unbounded pending CDP requests; archive joins at driver:113–114,254–259 also precede completion. | Register each acquired child immediately; separate run allowance, process exit, pipe close and finalization barriers. Bound archive/git/tar startup and exit without changing streamed bytes/hash guards. On deadline record partial state, fence further acceptance, close only verified owned handles, and return BLOCKED/incomplete rather than waiting forever. Preserve full long matrices; no five-second overall qualification cap. See §4. |
| **R4: cause exclusivity** | Helper:73 checks only the count of aggregate failed preconditions. At:84, same window/hover plus changed ancestor scroll succeeds even if both `running=1` or an ancestor transform also changes. At:85 hover dispatch similarly ignores animation. Yet protected `stableContext`:272–274 independently requires zero running animations, exact window/hover/scroll/ancestor agreement. One invalid aggregate can have several causes. | Use complete raw invariants; exact target/stage, trusted dispatch, census/closure and intended change must match while every unrelated context field passes. For ancestor-scroll, node/order/rect/transform and all non-scroll properties must agree; allow only attributable intended scroll change. For hover, window/scroll/ancestors/geometry remain invariant, running zero, exact intended dispatch observed. Missing fields, multiple unexplained causes or extra failed checks => BLOCKED. Apply the same exclusion discipline to all existing negative predicates, not just two sample rows. |
| **R5: late close durability** | Helper:47–50 persists terminal-looking result/summary before `journal.close`. A late fsync/close error changes only memory to BLOCKED; on disk may remain `AUTHOR_*_PASS_UNQUALIFIED` with empty persistenceErrors. `createJournal.close`:16 records fsync failure but its finally close can replace that exception without a failure record. `exclusiveWrite`:7 has the same error-overwrite risk. | Treat pre-close result as provisional, preserve it unchanged, aggregate fsync and close faults independently, and publish a separate exclusive post-close receipt through the next owning layer. An absent/truncated/unclosed terminal channel can never imply success. Parent records actual child exit and both stream closures before authorizing acceptance. See §5. |
| **R6: geometry inherited contradiction** | Outer driver:305 requires child code0 and 48/30/20 negative counts. Generated old:1765,1780 and new:1804,1819 set code2 whenever `productFailures` is nonempty; both preserve it as `q1PrimaryExit`. Original frozen before log has `harnessValid=true`, **98 requirementFailures**, and exact 48/30/20/60 census. This is inherited from r1/prior impact, not a new retention regression. | Future additive erratum changes the outer expectation to real child code2 **with** harness valid, no startup/persistence/cleanup/incomplete errors, complete exact per-case old/new comparison and preserved 98 failures/60 overflow positives. Parent equivalence may then return0 only for successful comparison. Never force child0, delete failures, repair P0, accept counts alone or edit old impact prose. |

The generated R1 terminal boundary map is explicit for all six outputs:

| i3 log line / generated unit | original result call | primary exit | guarded finalize call |
| --- | --- | --- | --- |
| 37 / appearance-fapp1 | 2236 | 2244 | 2247 |
| 38 / appearance-fapp2 | 2972 | 2980 | 2983 |
| 39 / appearance-accepted | 3467 | 3475 | 3478 |
| 40 / apprail-accepted | 1872 | 1880 | 1883 |
| 41 / geometry-old | 1771 | 1780 | 1783 |
| 42 / geometry-new | 1810 | 1819 | 1822 |

All six must receive the same proved lifecycle adapter contract, with exact unique anchors and old/new source hashes. Actual original result/business assertions stay intact. Generated AppRail:1886 and geometry old:1787/new:1826 have delayed `process.exit`; they may not cut off final receipts. A future adapter must gate that exit behind completed or explicitly failed terminal barriers, preserving the original primary exit separately.

The geometry result is **source-grounded**, not a new run: the old source's exit expression plus the retained 98-item failure array requires exit2. No new actual OS exit was observed here. A future qualification must retain actual OS exit/signal beside the child primary result, full ordered case identifiers/verdicts, both old/new inner logs and finalization records. Merely changing `!==0` to `!==2` is insufficient without these completeness and clean-finalization checks.

## 4. Bounded full-matrix execution and ownership design

This is a future design constraint, not an implementation or permission. Distinguish (a) full run, (b) exit after completion/cancellation, (c) stdout/stderr end/close, (d) each fsync/close and final receipt. The helper's existing ≤5000 ms operation helper must not wrap an entire long matrix.

Before dispatch, freeze a per-unit/per-language manifest with the complete original cases and a finite source-derived upper bound: enumerate maximum command count from all nested loops/census bounds, retained fixed waits/settling/capture attempts, bounded startup/archive operations and finalizer count. Use `T_run = sum(command limits) + sum(existing waits) + sum(startup/archive limits) + explicit scheduling margin`, with its numeric operands, units and source line derivation in the manifest. This static pass does not invent an empirically safe full-run number. Any unbounded loop/promise prevents freezing the bound and must be resolved inside lifecycle scope before a runtime card is eligible. Progress may record stage/case/command deadlines but must never reset the absolute cap. This retains all 24 focus cases, 14 Reload cases, historical full focus states and both geometry phases.

For the separate exit barrier, retain bounded CDP close ≤500 ms, task-owned TERM grace ≤1500 ms and KILL grace ≤1500 ms as starting source limits; after process exit allow an explicitly frozen ≤5000 ms pipe-drain barrier. These limits are cleanup bounds, not measurement/settling changes. A changed cleanup allowance requires a disclosed finite rationale, not a retry loop. Persist timeout, last completed case, actual exit if known, pipe states and partial byte hashes. Missing process exit remains unknown, never code0. Block the unit even if it emitted a promising result before hanging.

A process handle returned by this task's spawn establishes direct-child ownership; record PID plus launch identity, spawn error and task-specific paths immediately. A child PID alone is not proof that all descendants stopped or safe authority to signal a reused PID. Do not signal unrelated processes, enumerate/kill all Chrome instances or clean historical profiles. Use a separately owned process group only if its creation and membership are positively recorded; otherwise signal only the owned live handle and retain uncertain descendants/profiles. At drain deadline close this task's read handles, record incomplete/orphan state, preserve all received bytes, and deny acceptance. Local read closure is not proof of producer termination.

Promise races do not cancel losing operations. On a deadline, fence late callbacks from changing the settled verdict, reject pending command entries once, and preserve late events as supplemental observations until the owned channel closes. Remove timers/listeners only after their terminal state has been recorded. An unresolved writer prevents cleanup/adoption, not an indefinite active lease. Startup failure before a returned browser handle, archive/tar errors, server-close rejection and partial acquisition all still reach independent finalizers.

## 5. Post-close evidence and future discrimination cases

Freeze three distinguishable layers: immutable primary observations; provisional finalization journal; exclusive post-close receipt containing primary exit/error, cleanup errors, every persistence operation/error, last durable sequence/hash, child process exit and both stream dispositions. The receipt names the exact provisional artifact and cannot overwrite it. Parent consumes a success candidate only after observed child close, stream drain/close, valid complete receipt and its own independently closed receipt. A receipt-write/flush/close failure emits best-effort stderr and nonzero exit; missing post-close proof means BLOCKED even if a complete-looking file exists. Do not claim that a file can self-prove its own successful close; the observing parent or outer controller supplies that fact. Failure of all durable channels means evidence unavailable/BLOCKED, not a fabricated durable record.

Any future authorized validation must retain the original eleven fault families and reservation/ownership controls and add concrete integration cases:

1. For each of six generated templates: write/fsync fault during a business record, terminal result record and event callback; primary measurement failure combined with each fault. Pending requests reject, all acquired finalizers are attempted, first primary cause and independent persistence errors survive.
2. Real child exit2 with partial stdout/stderr; independently injected stdout fsync, stdout close, stderr fsync and stderr close failures, plus paired failures. Both streams attempted and actual exit2 survives separately. Include first/second file open failure and spawn failure before a usable handle.
3. Child never exits; child exits while descendant holds a pipe; pipe closes before exit; late data/late close after timeout; archive or CDP command stalls. Test completed long unit exceeding a cleanup grace but below its full-run budget, proving no accidental five-second matrix truncation. Verify cancellation/fencing and no unrelated signal/delete.
4. Journal final fsync failure, journal close failure, both; exclusive summary/receipt write, fsync and close faults after a successful provisional result. Contradictory PASS-looking earlier bytes must fail outer admission; each surviving record explains its provisional status and retained errors.
5. Intended ancestor scroll alone; plus running animation; plus transform/ancestor identity drift. Intended hover alone; plus animation; plus window/ancestor/target drift. For every other negative family include exact positive causal specimen, wrong target/stage, missing metadata and mixed unrelated failure. All mixed/unknown cases refuse.
6. Geometry old/new: complete harness-valid code2 with exact 98 known failures and 60 overflow positives is equivalence-eligible; code0 with those failures, code2 with an extra failure, truncated/missing result, shifted case IDs, harness invalid, cleanup/persistence fault or absent close receipt refuses. The original 98 negatives remain unchanged.
7. Diagnostic metadata success/early-stable/deadline/throw paths, interrupted attempt tail, census refusal before final walk record, and late persistence failure. No manufactured attempt or frame, no generic “unstable” fallback.

These are acceptance obligations for a future frozen candidate, **not runs performed or authorized now**. Existing i1–i3 have no generated runtime fault injection, no independent failing stream-finalizer coverage, no late-close terminal-admission coverage and no mixed-cause controls sufficient to validate the new design. Static source review cannot substitute for these executable obligations.

## 6. Separate protected-helper diagnostic scope

The helper `pixel-focus-qualified-r1.mjs` is protected and byte-identical across r1/r2. Existing aligned `stableViewportClip`:170–178 permits at most six captures with unchanged 120 ms waits and byte-equality stopping; native regional path:256–269 likewise caps six and compares cropped RGBA plus metadata. Rows:350–351 do not retain full attempt histories or explicit failed-stage stability; `comparison=null` does not identify cause. Census/closure precondition:370 can throw before the walk record:371, whereas the invalidity check:372 occurs after that record. Do not claim all invalid rows are lost.

A separately registered **new** helper copy may add only observations: capture ID, walk/stop/node identity, focused/moved phase, method/clip, attempt index, monotonic start/end timestamps, original PNG hash, existing region hash/comparison result, target/ancestor geometry and window/hover/scroll/census snapshot identity, animation observations, stable/unstable/not-attempted/error disposition, existing limit and actual stopping reason. Preserve each actual attempt's screenshot/reference and history before returning or throwing; retain a partial walk checkpoint before census/closure can throw. An observer persistence fault is a separate fatal evidence error. Do not add capture attempts or change measurement verdicts to obtain diagnostic data.

Re-use already observed `metadataAgain` in the native path. Any additional diagnostic reads must be read-only, must not feed the measurement's original stable decision, and their observation interval must be disclosed. To attribute animation, global `running` count alone is insufficient: record animation identity, affected target/ancestor node, play state, finite/infinite timing and observed effect properties without pausing, cancelling, finishing or editing it. No new DOM tags or focus manipulation for identification.

The existing fixture has an infinite target animation (`focus-controls.html`:3). Its settle hook:15 counts running **finite** animations, while helper metadata counts all running animations and `stableContext` rejects any. Consequently the same intended target animation can invalidate context at more than one stop, and capture can stop early on apparently identical sampled frames. The diagnostic revision must preserve these observations, not guarantee a six-attempt instability result, not disregard unrelated animations, and not relax context or invalid-row requirements merely to pass this case. If existing flow never captures a moved phase because context already fails, record `not-attempted` and that reason; never synthesize a history. A future exact causal predicate can accept only a complete documented intended-cause proof for every invalid row, with no unexplained failures; if current control cannot supply it under unchanged semantics, it remains BLOCKED for another impact decision. No fixture/calibration/settling exception is granted here.

Decoder, comparison thresholds/margins, six-capture/120 ms bounds, aligned byte equality, regional equality, union eligibility and clipping, next-stop exclusion, Clock/outside ownership, native dimensions/no resampling, trusted input, census/closure and all existing fixtures remain invariant. This diagnostic scope is distinct from R1–R6 and must have its own diff/line proof; its existence would still require full method qualification and independent Q2.

## 7. Conditional future exact write and review map

No implementation is authorized by this report. If the external budget condition in §8 is explicitly resolved and root registers a fresh author, the smallest source/doc allowlist is seven new paths under **`docs/reviews/web-dashboard-clock-recovery-qualification-r3/`**:

| Exact new basename | Source map / allowed change |
| --- | --- |
| `verify-qualification.mjs` | Copy r2 driver; lifecycle adapter:139–163 and callbacks; child ownership/bounds:167–180,199–265,279–312; geometry expected exit/completeness:301–305; imports/source binding and cumulative reservations:314–335. Preserve original matrices/guards; read unchanged fixture/Reload/native-probe dependencies from frozen r2 explicitly. |
| `evidence-retention.mjs` | Copy r2 helper; independent persistence:6–16,40–62; owned run/exit/stream barriers:20–38,53–62; stronger cause predicates:71–93. No measurement algorithm. |
| `pixel-focus-diagnostic-r1.mjs` | New versioned copy of r2 protected helper; observational fields/hooks only at metadata:101–139, capture:170–178/256–269, row/partial-walk boundaries:350–372. All measurement expressions remain identical. |
| `verify-evidence-retention.mjs` | Frozen validation source retaining prior families plus §5 generated integration/stream/deadline/post-close/mixed-cause/diagnostic cases. Creating source does not authorize execution. |
| `manifest.md` | All fixed source/input hashes, unchanged dependency hashes, all six generated complete-source hashes, full seven matrices, derived full-run bounds, original reservations and permanently inherited counters. |
| `correction.md` | Narrow R1–R6 + separate diagnostics mapping, additive geometry exit erratum, limits, exact commands/results and no self-acceptance. |
| `source-diff.patch` | Exact original→candidate hunks and line maps for three runtime source files, test source and all six generated outputs. In-memory reverse reconstruction must recover original bytes. |

No six-copy duplication is necessary: read-only dependencies are hash-bound to r2/r1, and generated archive helpers use the registered diagnostic source explicitly. Any location adjustment is exact-path orchestration only. Protect originals, canonical r2, old manifest/logs, product/CSS/fixtures, lockfile and all global control/ledger files. The future manifest must bind itself to a later controller scheduling receipt; neither review flag may be self-enabled by the author.

Runtime artifact paths are **not** granted by this seven-file source proposal. If and only if the original retention account receives explicit new authorization, root must add exactly the cumulative next `retention-checks-i4.log` and `retention-checks-i4.json` in that new directory to the card, bind source hashes and cap, and retain all old i1–i3 identities. No `i1` reset, alternate family or probe name. These names describe the currently prohibited next attempt so its accounting cannot be hidden; no files or reservation were created. Subsequent full Q1 output names require a separate exact controller card, not a wildcard write grant here.

Fresh author must be distinct from this reviewer, Q1/correction authors and prior same-caller actors. Then a fresh uninvolved actual-source reviewer examines all changed lines, raw integration evidence, geometry mapping and diagnostic invariance (source review **next 2/3**, previous REVISE1 remains). No self-review, no repair by reviewer, no passing by tests alone. Cross-vendor remains an actual evidence requirement where applicable; fresh Codex identity is not that evidence.

## 8. Hard budget conclusion and preserved continuation

**No valid execution/qualification path exists within the remaining retention-validation budget.** R1–R5 fix real untested lifecycle/callback/descriptor/late-close paths; source maps or the retained 145 checks cannot validate changed behavior. Q1 focus's remaining two attempts, other units' three attempts, Q2, development counters or a renamed directory cannot be used as a fourth retention invocation. No formal qualification may consume a reservation while these prerequisite gates remain false.

The smallest genuine external decision for sole root to centralize is whether the owner explicitly allows **one additional attempt on the same retention account (cumulative attempt4; original 3/3 exhausted history retained)** for one frozen candidate and the complete fault matrix in §5. This is a proposed minimal bounded decision, **not an exception already granted, a request issued by this child, or a claim one attempt will succeed**. Without that explicit decision the node stays hard-budget BLOCKED. If authorized and failed, freeze immediately; no fifth run, automatic extension, dropped case or reclassification. M+G+B need not be re-asked; it does not supply this missing validation budget.

Historical counts remain: Q1 focus-controls **1/3**, other six **0/3**; Q1 development **2/83**; retention **3/3,145 checks,41/42 case executions passing**; B70 native formal **12/6432**, native development **40/4884**, responsive visual **3/3 exhausted**, focus **EN2/ZH2**; F1 formal **2/180**, development **3/302**. This task used **one static impact pass; zero runtime, browser, native, probe, package, synthetic-suite or syntax-check invocations**. It neither consumes source review2 nor qualification attempts.

After any future budget resolution, corrected-source review and diagnostic qualification prerequisites, full Q1 remains all seven units: focus-controls EN/ZH × both themes × 375/768/1440 ×24 controls; Reload same 12 viewports ×both fields ×14 controls; each full historical Appearance FAPP1/FAPP2/accepted and AppRail matrix; both original/corrected geometry with 48/30/20/60 and complete per-case equality. Preserve original five FAPP1/FAPP2 failures per language and actual child exit2, accepted historical child exit0, original selection/disabled/source/open-panel/full-cycle states and all declared unrerun limits. Geometry child2/outer-equivalence0 are distinct outcomes. No narrower smoke set substitutes.

Fresh independent **Q2** then performs its original full qualification review/reruns and pixel/source inspection. Only accepted Q2 plus controller adoption permits Q3 complete valid P0 before, strictly two-CSS geometry/G2/G3, accepted versioned baseline addendum, E1–E5 reconciliation, original recovery implementation and complete fixed/affected/final E1–E25 acceptance. Required C-FB002, OE, C-RD1 and original/C-FD1 observations remain. Neither this static impact nor future retention PASS is caller acceptance, E4, H9 resolution, deployment or release readiness.

Audit counts/states unchanged: **13 completed /3 verification_pending /3 in_progress /293 pending;299 unclosed**. No ledger/control/inventory adoption, push, merge, rebase, deploy, release, promotion or D3 occurred. Static checks used Git reads, Python standard-library SHA/JSON/source comparisons and report construction only. Memory quick-pass guidance merely cautioned against treating old in-progress observations as complete; all findings use fixed current inputs. Root receives the two-path local commit and owns any global receipt/remote preservation. Output hashes and commit SHA are supplied externally to avoid self-reference.

~~~~

</details>

### Historical source: docs/reviews/web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md

<details><summary>Retained complete historical text</summary>

~~~~text
# AppRail order final regression receipt (E18–E25) at `f9eb4b1`

- **Caller:** CP-APPRAIL-01, AppRail order (`xai_rail_order`), its drag writer and its App-lifetime protection; module `web`; control-plane batch 64.
- **Contract:** `../web-apprail-order-recovery-contract/contract.md` r1 (`f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, re-derived): §10 items 8–12, §11, §13, §14 gate 9, §15 E18–E25 and Rules.
- **Fixed product:** `f9eb4b1f207bc4b46f547b90afc250424b3c8695` (tree `05887cf113639116b228a25041a37b3d5c69a322`). **Before:** `419e56de9f23e4467fea806fbd4a990e1f429941`.
- **Verifier:** independent final-regression verifier (Sol role), Claude Opus 5.5, worktree `.claude/worktrees/agent-a6a467b4a410199bc`, detached at control-plane commit `9aeec39ecc3d9da70837e97b9660837fe887b765` after `git fetch origin codex/web/full-product-audit-20260908`; `git status` clean. I am not the contract author, not Terra, and did not execute any earlier batch of this caller. I wrote no oracle; I wrote the new runners, copies and tools listed in §2.2.

**This receipt is the final-regression gate only.** It is not caller acceptance (batch 65). It closes no 312 item (SET-03, SHELL-01/03/04/05/06, REL-05/07/09/10, UX-03/04/05, QA-01/03/04/09, D2/REL/AI stay open) and authorizes no deployment, release, branch promotion or Web→Desktop sync.

## Verdict

**PASS for E18–E25, with one disclosed harness deviation that needs a controller ruling (§2.3 item 1): the four older host-suite runners named in contract §13 cannot read the current repository archive (100 MiB buffer, `ENOBUFS`) at either revision, so E23's host-suite rows ran through copies that change only the buffer size and the root depth.** No product failure was observed anywhere. Every count equals its accepted receipt (85 MATCH, 0 DIFF), every judging copy passes, and every frozen original falls exactly as §13 predicts.

| Item | Result at `f9eb4b1` | Accepted / control | Exit | Verdict |
| --- | --- | --- | --- | --- |
| **E18** §10.9 search | 26 patterns; 51 delta rows, all in §11 files; shell product source 0 × each of `localStorage`, `usePref(`, `setPref(`, `removePref(`, `new StorageEvent`, `dispatchEvent(`; `AppRail.tsx` 0 storage-API spellings, imports only React, tokens, unchanged shell modules and the new controller/model; `App.tsx` 0 `xai_rail_order`, 0 `usePref(`, `localStorage` lines 4 = 4, `readLocalPref` byte-identical (`419e56d` L87–97 → L90–100, `3675ffe3…`), the other two `localStorage` lines are comments | per-file counts at `419e56d` (same log) | 0 | **PASS** (140/140 assertions, 56/56 harness, shared with E19) |
| **E19** §10.8 protected paths | 14/14 fully protected paths identical object ids and empty diff; `xai-web-shell` 17 changed, all §11, every non-§11 path identical; 15 §11-protected shell files and `__fixtures__/` identical; `apps` 2 changed, 268/268 others identical; product diff and full diff outside `docs/` = exactly the 19 §11 files (+2960/−76), 4 new internal modules; all 24 existing Topbar case blocks and 23 "Unchanged" test files byte-identical | contract §10.8, §11 | 0 | **PASS** |
| **E20** storage check-types | `tsc --noEmit` exit 0, 0 diagnostics, 315 program files (46 archive / 269 store / 0 elsewhere) | Appearance final `419e56d` 315/46/269 | 0 | **PASS** |
| **E20** Sol lifecycle | AppRail Sol `bytes` 26/26; case 007 "PC §2/§10.11 lifecycle classification, registry entry, device ownership and the per-key lock name are unchanged" PASSED (also in E7 `fixed1` and E2 `before1`) | names/statuses equal to E7 | 0 | **PASS** |
| **E21** shell | test 12 files / 205 / 205 (per file equal to Terra); check-types exit 0 (363/68); lint exit 0 (32 files, 0/0) | Terra 205; Appearance final 9/115 + 3 new files (88) + Topbar 24→26 | 0/0/0 | **PASS** |
| **E21** before control | 8 unchanged files 91/91 and the 24 existing Topbar cases 24/24, identical names and statuses at `f9eb4b1` and `419e56d` (and equal to the Appearance final at `419e56d`) | same | 0 | **PASS** |
| **E22** web | test 30 / 196 / 196 (per file equal to Terra; every §10.10 file ran; `App.railorder` 18); check-types exit 0 (1389/672); lint exit 0 (84 files) | control `419e56d` 29 / 178, per file equal to the accepted Appearance final; delta exactly `App.railorder.test.tsx` (18) | 0/0/0 | **PASS** |
| **E22** before control | the 13 §10.10 web files 118/118 and the storage `imperative` + `registry` tests 31/31, identical at both revisions | same | 0 | **PASS** |
| **E23** accepted callers | 85 MATCH / 0 DIFF (`compare-accepted-apprail-final-v1.log`); §13 prediction table §4 all matched | accepted receipts | see §3 | **PASS** (host-suite rows via copies, §2.3) |
| **E24** Features native | frozen host and downstream runners refuse only at `baseline:fixed-delta-only-in-features-package` (exit 1, expected); copy: host **PASS** 751 checks (750 + K-1 audit), 341/341 product; downstream **PASS** 344 checks, 140/140 product; 0 runtime errors, 0 console warnings, K-1 audits 1 = 1 and 7 = 7 | host `5cd63ff` 750/341; downstream Appearance final `419e56d` 344/140 | 1,1 / 0,0 | **PASS** |
| **E25** | this receipt; G1 §5 | — | — | **PASS** (complete, 0 missing IDs) |

## 1. Fixed points and execution rules

- `git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (every native log also records `productDeltaVsDocsHead: ""`).
- **Dependencies.** `XAI_DEPS_ROOT` = this worktree after `pnpm install --frozen-lockfile --offline` (599 packages, 0 downloaded; lockfile `df05f2dd…aeab9`, unchanged; `git status` clean afterwards). The main checkout was never used: not as a dependency root, not read by any runner, nothing written, no server or preview started there.
- **Every execution** (except the older host-suite runners, §2.3): an immutable `git archive` of the requested SHA in a fresh temporary directory, deleted afterwards; lockfile gate for the dependency root, `git show <rev>:pnpm-lock.yaml` and the extracted archive; `@repo/*` pinned into the archive with that runner's guard (Vitest exact-match aliases + guard plugin, `pin_unaliased_repo_imports=0`; tsc `--listFiles` with `elsewhere=0`; ESLint resolution hook, `pin_violations=0`; esbuild exact-export pin + checkout guard); requested and resolved SHA in every log; refusal to overwrite; nonzero exits preserved (Appearance `continuity-export` 1, Features `downstream` frozen 1 at both revisions, C-FD1 at `f9eb4b1` 1, frozen native host and downstream 1, frozen host-suite runners 1).
- **Native:** Chrome 155.0.8059.39 headless. No runner I invoked sends `nativeVirtualKeyCode`; the E24 copy keeps the K-1 key audit (passes). Transport: the frozen DevTools WebSocket (§2.3 item 2). No headless Chrome, Vitest process or `xai-*` temporary directory remained; the native temp directory (session scratchpad) is empty.
- **Runtime:** Node v24.16.0, Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, TypeScript 5.9.2, ESLint 9.39.1, esbuild 0.28.1, macOS arm64, tz America/Los_Angeles. Official runs 2026-10-09 14:51:13Z–15:10:32Z, strictly sequential.

## 2. Runners

### 2.1 Reused unchanged (hash = its accepted receipt, re-derived)

| Runner | SHA-256 | Used for |
| --- | --- | --- |
| `../web-features-recovery-final/verify-packages.mjs` | `f7758f28fd98cba9…` | E20 storage; E23 settings-shell, settings-rest, Features package and reader tests |
| `../web-apprail-order-recovery-sol/verify-fixed.mjs` | `e944cb226e3fa342…` | E20 lifecycle (`bytes`) |
| `../web-appearance-recovery-final/verify-packages.mjs` | `8f9fb90f38717515…` | E23 Appearance package |
| `../web-appearance-recovery-sol/verify-fixed.mjs`, `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs`, `../web-appearance-recovery-independent/verify-fixed.mjs` | `a451df6a…`, `354c220b…`, `6aac3563…` | E23 Appearance Sol 8 modes, OE, parent host |
| `../web-features-recovery-sol/verify-fixed.mjs`, `../web-features-recovery-independent/verify-fixed.mjs` | `b5ac75fa…`, `d92901b4…` | E23 Features Sol 7 modes (downstream at both revisions), host |
| `../web-appearance-recovery-final/diag-features-sol-corrected.mjs` (C-FD1) | `cfe596be41218d28…` | C-FD1 at both revisions |
| `../web-apprail-order-recovery-sol/diag-features-sol-c-rd1.mjs` (C-RD1) | `7d6e8c3fdce61fb6…` | C-RD1 at both revisions |
| `../web-features-recovery-final/verify-callers.mjs` | `7e1aa8b244ed9f63…` | E23 More, Notifications, Date & Time (17 modes) |
| `../web-more-recovery-fb002/verify-fb002.mjs` | `d2150cd4794f7a51…` | C-FB002 |
| `../web-sticky-recovery-sol/verify-fixed.mjs`, `../web-sticky-recovery-independent/verify-fixed.mjs` | `3fba4b3b…`, `5a8ea1dd…` | E23 Sticky |
| `../web-features-recovery-native/verify-native-{host,downstream}.mjs` + `native-host-harness.mjs` | `9688043d…`, `82df2961…` + `499fca4c…` | E24 frozen attempts (refusals) |
| `../web-{smart-lists-recovery-astra,collaborate-recovery-independent,pomodoro-departure-independent,dashboard-header-departure-independent}/verify-fixed.mjs` | `f79c2dff…`, `ac9a8fdc…`, `ca14e264…`, `840225ac…` | E23 host suites, frozen attempts (refusals, §2.3) |

### 2.2 New in this directory

Runner hashes were recorded at 14:50:35Z, before the first official run (host-suite copies at 15:05Z, before their official run), and are unchanged (re-checked after all runs).

| File | SHA-256 | Covers |
| --- | --- | --- |
| `verify-static.mjs` | `c7dea48432c8568c64f91fe590fca1656c44674c0790f79ccb74d12f3690a47c` | E18, E19, E6 §11 hashes, Topbar and "Unchanged" file dispositions. A copy of the Appearance final `verify-static.mjs` (`8f6352fd…`) with AppRail tables and §10.9 gated zeros |
| `verify-packages.mjs` | `fd9d9988c8c38c904555c4a539836db62aceda005098919d02bba4daf53dde15` | E21, E22, §10.10 storage controls: a copy of the Appearance final package runner with a shell/web/storage mode table |
| `verify-native-host.mjs`, `native-host-matrix.tsx`, `verify-native-downstream.mjs`, `native-downstream.tsx`, `native-host-prelude.js` | `9688043d…`, `819573b0…`, `82df2961…`, `9b77055e…`, `01acaa5d…` (byte-identical to the frozen Features files) | E24 copy |
| `native-host-harness.mjs` | `87049b7c956b17f15c9021d3ab17090eaa77c199f46ae7748e5d1ead79ba3539` | E24 copy: the accepted Appearance E25 copy (`afa313f8…`) with one precondition changed; diffs `native-host-harness.e24-vs-appearance-copy.diff` (`05fe1fe1…`) and `native-host-harness.e24-vs-frozen.diff` (`48a511aa…`) |
| `host-suites/<caller>/verify-fixed.mjs` (4) + 13 byte-identical test/fixture files + 4 `verify-fixed.copy.diff` | `4160d9cf…` (Smart Lists), `44738ec8…` (Collaborate), `e5ebd841…` (Pomodoro), `56645cbb…` (Header); diffs `828f37e5…`, `27c5bf37…`, `27a76966…`, `f3cddf53…` | E23 host suites (§2.3 item 1) |
| `compare-accepted.mjs`, `hash-evidence.mjs` | `d54a2420…`, `3b0d2b70…` | read-only comparison and G1 tools (no product code) |

### 2.3 Deviations (each needs controller acknowledgement; acceptance reviews them)

1. **E23 host suites through copies (needs a ruling).** The four older runners of contract §13's last row read `git archive <rev>` into a 100 MiB buffer. The archive is 74,393,600 bytes at `f359be6` (where their last accepted logs ran) but 125,992,960 at `419e56d` and 148,408,320 at `f9eb4b1` (growth is `docs/reviews/` evidence, not product). Run unchanged, all 31 invocations (17 at `f9eb4b1`, 14 `419e56d` controls) abort with `spawnSync git ENOBUFS` at line 14, before any test runs, writing no evidence log; the transcript is `frozen-host-suite-refusals-apprail-final-v1.log` (`df41ffac…`). This is not an explicit SHA precondition, but it is SHA-bound in the same way (it holds only for older, smaller archives) and is not caused by this caller (`419e56d` fails identically). I therefore applied the batch's copy procedure: `host-suites/<caller>/verify-fixed.mjs` differs from the frozen runner only in the archive buffer (1 GiB) and `root` (two more `../`, because the copy sits two directories deeper), plus a header comment; the staged test files are byte-identical and staged at the frozen runner's own archive path. The first copy attempt had `root` one level short (git archived only `docs/`, every run aborted at `readdir packages`, no evidence written); it was corrected and rerun once (diagnostic iteration 2 of 3 for this unit). If the controller does not accept this reading of the stop rule, these 31 logs are void and E23 lacks only this row.
2. **Transport.** The batch asks for pipe transport where a runner supports it. The only native runners here are the frozen Features harness and its copy, which use the DevTools WebSocket they were frozen with; changing transport would widen the E24 copy beyond "only the product-delta precondition". A dropped socket can only surface as a harness error; none occurred.
3. **E24 copy base.** The copy derives from the accepted Appearance E25 copy (which already carries the K-1 audit), not directly from the frozen Features harness, so that it differs from an accepted runner by exactly one precondition; both diffs are recorded. The frozen Features `verify-native-host.mjs` had not been rerun since `5cd63ff`; its E24 comparison is against the accepted Features E12 log `native-5cd63ff-fixed1-host.log` (`f025b831…`).
4. **New runners for E18–E22,** as in batches 30 and 51: the precedent runners hard-code the Appearance caller. Fidelity: same code paths; controls reproduce accepted counts (web `419e56d` 29/178 and shell unchanged 91 equal the Appearance final per file and per case).
5. **§10.9 "App.tsx contains no `localStorage`" read as "adds none"**: `readLocalPref` (byte-identical, required by the same item) itself reads `localStorage`; the gate checks the count is unchanged (4 = 4) and that every line outside `readLocalPref` is a comment.
6. **Hash-class nit:** `hash-evidence.mjs` classifies by first match, so `compare-accepted-apprail-final-v1.log` is listed under class "E23" rather than "E25 tools". Hashes are unaffected.

## 3. Reproduction (official runs, in order) and exit codes

From the worktree root, `XAI_DEPS_ROOT=<this worktree>`, `XAI_NATIVE_TMPDIR=<session scratchpad>/native-tmp`, suffix `apprail-final-v1`:

```sh
node docs/reviews/web-apprail-order-recovery-final/verify-static.mjs f9eb4b1 419e56d apprail-final-v1                                   # 0
node docs/reviews/web-apprail-order-recovery-final/verify-packages.mjs f9eb4b1 <shell-test|shell-unchanged-files|shell-topbar-unchanged|shell-check-types|shell-lint|web-test|web-unchanged-files|web-check-types|web-lint|storage-unchanged> apprail-final-v1   # 0 each
node docs/reviews/web-apprail-order-recovery-final/verify-packages.mjs 419e56d <shell-unchanged-files|shell-topbar-unchanged|web-test|web-unchanged-files|storage-unchanged> apprail-final-v1   # 0 each
node docs/reviews/web-features-recovery-final/verify-packages.mjs f9eb4b1 <storage-check-types|settings-shell-test|settings-rest-test|features-test|features-readers> apprail-final-v1   # 0 each
node docs/reviews/web-apprail-order-recovery-sol/verify-fixed.mjs f9eb4b1 bytes apprail-final-v1                                    # 0
node docs/reviews/web-appearance-recovery-final/verify-packages.mjs f9eb4b1 appearance-test apprail-final-v1                       # 0
node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs f9eb4b1 <mode> apprail-final-v1         # bytes fields reset queues host retry-all original: 0; continuity-export: 1 (OE-1/OE-2, predicted)
node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs f9eb4b1 corrected apprail-final-v1                     # 0
node docs/reviews/web-appearance-recovery-independent/verify-fixed.mjs f9eb4b1 host apprail-final-v1                               # 0
node docs/reviews/web-features-recovery-sol/verify-fixed.mjs f9eb4b1 <mode> apprail-final-v1           # bytes fields reset queues continuity-export original: 0; downstream: 1 (predicted)
node docs/reviews/web-appearance-recovery-final/diag-features-sol-corrected.mjs f9eb4b1 downstream apprail-final-v1                # 1 (C-FD1, predicted)
node docs/reviews/web-apprail-order-recovery-sol/diag-features-sol-c-rd1.mjs f9eb4b1 downstream apprail-final-v1                   # 0 (C-RD1)
node docs/reviews/web-features-recovery-sol/verify-fixed.mjs 419e56d downstream apprail-final-v1                                   # 1 (F-FD1, predicted)
node docs/reviews/web-appearance-recovery-final/diag-features-sol-corrected.mjs 419e56d downstream apprail-final-v1                # 0
node docs/reviews/web-apprail-order-recovery-sol/diag-features-sol-c-rd1.mjs 419e56d downstream apprail-final-v1                   # 0
node docs/reviews/web-features-recovery-independent/verify-fixed.mjs f9eb4b1 host apprail-final-v1                                 # 0
node docs/reviews/web-features-recovery-final/verify-callers.mjs f9eb4b1 all apprail-final-v1                                     # 0 (17 modes)
node docs/reviews/web-more-recovery-fb002/verify-fb002.mjs f9eb4b1 corrected full apprail-final-v1                                 # 0
node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs f9eb4b1 <bytes|fields|queues|continuity-export|original> apprail-final-v1   # 0 each
node docs/reviews/web-sticky-recovery-independent/verify-fixed.mjs f9eb4b1 host apprail-final-v1                                   # 0
node docs/reviews/<host-suite dir>/verify-fixed.mjs <f9eb4b1|419e56d> <mode> apprail-final-v1           # 31 invocations, 1 each (ENOBUFS refusal, §2.3)
node docs/reviews/web-apprail-order-recovery-final/host-suites/<host-suite dir>/verify-fixed.mjs <f9eb4b1|419e56d> <mode> apprail-final-v1   # 31 invocations, 0 each
node docs/reviews/web-features-recovery-native/verify-native-host.mjs f9eb4b1 host apprail-final-v1                                # 1 (expected refusal)
node docs/reviews/web-features-recovery-native/verify-native-downstream.mjs f9eb4b1 downstream apprail-final-v1                    # 1 (expected refusal)
node docs/reviews/web-apprail-order-recovery-final/verify-native-host.mjs f9eb4b1 host apprail-final-v1                            # 0
node docs/reviews/web-apprail-order-recovery-final/verify-native-downstream.mjs f9eb4b1 downstream apprail-final-v1                # 0
node docs/reviews/web-apprail-order-recovery-final/compare-accepted.mjs apprail-final-v1                                         # 0: 85 MATCH, 0 DIFF
node docs/reviews/web-apprail-order-recovery-final/hash-evidence.mjs apprail-final-v1                                            # 0: 0 failures
```

Host-suite modes: Smart Lists `export host host-entry host-wrapper app original39 original-parent package`; Collaborate `contracts host package`; Pomodoro `departure advanced package`; Dashboard Header `departure advanced followon`. The `419e56d` controls run every mode except `package`.

**Iterations.** One official run per unit. The host-suite unit used 2 of 3 diagnostic iterations on the copy (root-depth defect, §2.3 item 1). No log is superseded; the defective copy wrote no log.

## 4. Contract §13 prediction table, observed

| Oracle | Predicted at `419e56d` | Observed at `419e56d` | Predicted at `f9eb4b1` | Observed at `f9eb4b1` | Judges | Match |
| --- | --- | --- | --- | --- | --- | --- |
| Features Sol `downstream`, frozen | 14/15 (012 PRECONDITION, F-FD1) | **14/15**, only 012 PRECONDITION (`bgTone` null for seeded `sage`) — `95ca0bf7…` | 13/15 (012 F-FD1; 014 PRECONDITION, A7) | **13/15**, exactly 012 (same F-FD1 signature) and 014 "PRECONDITION: the drag-reorder persisted a changed rail order" — `3ae4d8a4…` | No | yes |
| C-FD1 copy (`7bb5ad3c…`) | 15/15 | **15/15** — `29ab19f1…` | 14/15 (014 PRECONDITION, A7) | **14/15**, only 014, same signature — `8aeb6462…` | No | yes |
| C-RD1 copy (`6c57164e…`) | 15/15 | **15/15** — `41f97ecc…` | 15/15 | **15/15** — `a2428179…` | **Yes** | yes |
| More `boundaries`, frozen | as it falls | not run (not required) | as it falls | **10/10** (recorded; F-B002 nondeterministic) — `5ba53c5c…` | No | n/a |
| More `boundaries`, corrected (C-FB002) | 10/10 | not run (accepted `419e56d` 10/10) | 10/10 | **10/10**, RangeError 0/0 — `06726b6e…` | **Yes** | yes |
| Appearance `continuity-export`, frozen | 24/26 (006, 007) | accepted `419e56d` 24/26 | 24/26 | **24/26**, exactly 006 and 007, names/statuses equal to `419e56d` — `ea440fac…` | No | yes |
| Appearance `continuity-export.corrected` (OE) | 26/26 | accepted `419e56d` 26/26 | 26/26 | **26/26** — `8da0b9c7…` | **Yes** | yes |

**C-RD1 condition (controller confirmation item 7) holds:** the frozen original fails only on its predicted signatures (012 F-FD1 at both revisions, plus 014 A7 at the fixed SHA), and the corrected copy passes at both before and fixed. All other rail-truth and isolation cases (003, 006–011, 013, 015) pass in every run. Every other §13 row: Appearance Topbar and App tests unchanged and passing (E21, E22); the Appearance Sol/host suites equal the accepted counts; Features Sol/host/package/reader tests equal; More, Sticky, Notifications, Date & Time equal; Smart Lists, Collaborate, Pomodoro, Dashboard Header host suites equal (no oracle correction needed, as predicted); Features native host and downstream pass through the one harness copy (no oracle correction, as predicted).

## 5. G1: enumeration of E1–E25

**Method** (`hashes-apprail-final-v1.log`, SHA-256 `5e8fa755d0a7e0fd06470cc13ec7eb2aa3550d2de9054d4d0dc1a993fd18d84d`, written by `hash-evidence.mjs`): each committed item's artifact list is every file its producing commit added under the item's directory (filtered by name), so nothing is listed by hand; **every** file's SHA-256 was re-derived (296 committed artifacts: 276 for E1–E17 and 20 supplementary; the 19 E6 product files at `f9eb4b1`; and the 141 new files present at hashing time); for every committed artifact the producing commit is the last commit to touch it and the file is unchanged since; every hash was looked up in the item's receipt and the control plane. Result: 0 failures, 0 missing IDs, 0 unclassified new files, 0 tracked files modified. Each item's only non-listed file is its own receipt (a receipt cannot carry its own hash). Paths below are relative to `docs/reviews/`.

| ID | Producing commit | Principal artifacts and SHA-256 (re-derived; receipt match) | Verdict |
| --- | --- | --- | --- |
| E1 | `d6ea500` | `web-apprail-order-recovery-sol/`: `README.md` `2a0a547763f60d1882fd912cf70f121836ee0c47daa7d795598784f7f6deb815`, `verify-fixed.mjs` `e944cb226e3fa342727c913547ff5084e0ad38fad5293ed306cb512bf9f5a4e8`, C-RD1 `features-downstream.c-rd1.test.tsx` `6c57164ef5040444dad96fbf5933e90b095d465c64bdd6e8e5f3dcb6be2d1c7a`, both C-RD1 diffs, the staging-runner copy and 7 oracles + fixture. 15 files, 14 full | frozen |
| E2 | `d6ea500` | 17 logs, e.g. `bytes-before1-419e56d.log` `94c87889a14f0a6097b6ad2c70fa92dd145f654d0fa53f0449aa86e4c7ffcc1b`, Features downstream frozen `85695562…`, C-FD1 `dbfc3a73…`, C-RD1 `c8f5ff44…`. 17/17 full | PASS (correct before FAILs) |
| E3 | `6e9ec9c` | `web-apprail-order-recovery-independent/README.md` `85f9d9b707839ddeb1b339ee9ff68bc4bf5c7b42769b379b9e48bad9d0f69026`, `host-before1-419e56d.log` `ee5f6e1d2aaafabec04f961ab5f1d091a1bb5ad47fe1794e8e6fa1a96812ebb3`, runner `646bf047…`. 5 files, 4 full | PASS |
| E4 | `04ee6a2` | `web-apprail-order-recovery-native/before-419e56d.md` `8253c075f386f07128a0e630fe51409ba9edd8cd3428b0a0e1734a4e3a5b1c2e`, `native-419e56d-before1-h1.log` `a222683d5b706d7129c70dabe3aa1b948d97bf5029fddd2d6c22493bbdd83d6f`, runner `ccabd500…`, 51 PNGs. 61 files, 60 full | PASS |
| E5 | `04ee6a2` | `web-apprail-order-recovery-f1/before-419e56d.md` `e010bb6a0d93183e4703a1297c055124672e0745c5177dc461eed1e67c9b90a5`, `f1-419e56d-railorder-before1.log` `3108774b08a066e8aa1584e576d97e154c892a92513006f6cc8c1b5902f064cd`, runner `6385b648…`. 5 files, 4 full | PASS |
| E6 | `f9eb4b1` (product) + `0d440ca` (run record) | Product: the 19 §11 files at `f9eb4b1`, 19/19 equal to the E19 log, e.g. `AppRail.tsx` `fe789078fecc60936d3e6c5fc2b203001a15490aecf30f3a0ca301da1399fb44`, `internal/railOrderController.tsx` `d7f2f0b6…`, `App.tsx` `f644e78e…`. Record: `web-apprail-order-recovery-terra/implementation.md` `fe7bc377e09e9088163411a29fe3f2b81771bc07a5c00ac718f5880865d09086`, `shell-test-f9eb4b1.log` `72876c4e…`, `web-test-f9eb4b1.log` `98f9673a…`; 7 files, 6 full. Diff = exactly the 19 §11 files (E19) | PASS |
| E7 | `94b12ba` | `web-apprail-order-recovery-sol/fixed-f9eb4b1.md` `e49a8fd8b2d1c8c07fd2c0654a2b18e0f8e30e29100ff200da6c330b0384f990`, `bytes-apprail-fixed1-f9eb4b1.log` `68faf686902a88131d48adee20efe26b873a1c12fe670f6b2cbdc70eaf18a442`, `host-apprail-fixed1-f9eb4b1.log` `da51f57a…`. 9 files, 8 full | PASS |
| E8 | `94b12ba` | `web-apprail-order-recovery-independent/host-apprail-fixed1-f9eb4b1.log` `ba3c1bd4da61e26e14b7baa7ed8cf0717b29a79df610884c9f60a5b7199d86e5` (1/1 full) | PASS |
| E9 | `ae7b69e` | `review-controls-protection-export-f9eb4b1.md` `8667cacf3c7325f37f82ab91b0e4bc4a42189a6037d22c65dd2ae02bcc848ddf`, `native-f9eb4b1-fixed1-controls.log` `c416cf3f1d9daa26238bb6fa43486b34cd0319cb0e827c0d8b0ca66f0ad281bf`, runner `f062e723…`, fixture, prelude, 32 PNGs. 37 files, 36 full | PASS |
| E10 | `ae7b69e` | `native-f9eb4b1-fixed1-protection.log` `6dc38387527ebb2b6f5da71c189cd6142b0c3a1fcd12ef0b4846607cc93288d2` + 2 JSON + PNGs. 10/10 full | PASS |
| E11 | `ae7b69e` | `native-f9eb4b1-fixed1-export.log` `0172a752fa5da085a9d9a01681679ab6c8842a48473cef7c13642948be6aaa02`, x1 `d4d7f01f…` + 6 JSON + PNGs. 10/10 full | PASS |
| E12 | `55cf1e9` | `review-downstream-visual-f9eb4b1.md` `0376f2ab9d9091ca0eb87d4e8a5bcb05269517669e6dea76d322e9a6578b0c7e`, `native-f9eb4b1-fixed1-downstream.log` `0da57fcf6c0ba55a1b224904bf454cab8dc46011bce7364ff3440b13a923d789`, runner `55b49d11…`, 14 chrome PNGs, 2 JSON. 20 files, 19 full | PASS (clean-chrome invariance holds, so §13's "not rerun" rows stand) |
| E13 | `55cf1e9` | `native-f9eb4b1-fixed1-visual-en.log` `3c42c0a1efcc9b509d1422aaa2ef3c76a8b376dc2317b5d8394722526da78345`, `-visual-zh.log`, 27 PNGs. 29/29 full | PASS |
| E14 | `5c6bcd2` | `review-keyboard-f9eb4b1.md` `f48d091c7eb895e118ae037a855037a2b884022411c109afa12ad4a25d8924d0`, `native-f9eb4b1-fixed1-keyboard-en.log` `b5414fcd713a7db5865b7db8c68384c5177c32f8ac1cee90387c8249dbfdfdf3`, `-keyboard-zh.log`, runner, 30 PNGs. 34 files, 33 full | PASS |
| E15 | `94b12ba` | 10 `web-sticky-recovery-f1/f1-f9eb4b1-*-apprail-fixed1.log` (e.g. `sticky` `dd7e7eb0c9c898c93ac8130a8a9e8782efe51ec61d9be92f6609133fbebf7848`) + 2 `web-features-recovery-f1/` (`features` `bb8a138e…`). 12/12 full | PASS |
| E16 | `94b12ba` | `web-apprail-order-recovery-f1/f1-f9eb4b1-railorder-apprail-fixed1.log` `d4aae5fdf2a93b7dda8908ab7122d19a43d51865e244f5d75d6de40bd6a8e4b5`, selfcheck. 2/2 full | PASS |
| E17 | `94b12ba` | `web-native-keyinput-k1/f1-f9eb4b1-appearance-apprail-fixed1.log` `5e7667df608159d5374a58bf21fc3fecc45c0f7ab4dba04f4f0bf3ea62698104`, selfcheck. 2/2 full | PASS |
| E18 | this batch | `web-apprail-order-recovery-final/search-apprail-final-v1-f9eb4b1.log` `368ba9e6a5bd58f7182736395932febc1d55e748b47af83c0f132ef138ade3b3`; runner `verify-static.mjs` `c7dea484…` | PASS |
| E19 | this batch | `protected-diff-apprail-final-v1-f9eb4b1.log` `5a0ef354a8a08573ee071b3b0625985e95b030d7522342c2b65244dc7075b729` | PASS |
| E20 | this batch | `../web-features-recovery-final/storage-check-types-apprail-final-v1-f9eb4b1.log` `a0b00ec439810bbfb8cd8e5c6305325ff610249eda6f8168893f37ae708273eb`; `../web-apprail-order-recovery-sol/bytes-apprail-final-v1-f9eb4b1.log` `6a9d290f0f3d8f321caca0070beda1d6110762cd219569ebdeb8552a88c49fe5` | PASS |
| E21 | this batch | `shell-test-apprail-final-v1-f9eb4b1.log` `4aa2586c4bafb3788b03bf934bfdfa4f3deab0fd5207d1efbc5a9603c663e7b8`, check-types `f89fe39b…`, lint `c5d6114b…`; controls `shell-unchanged-files` and `shell-topbar-unchanged` at both revisions (hashes log, class E21); runner `verify-packages.mjs` `fd9d9988…` | PASS |
| E22 | this batch | `web-test-apprail-final-v1-f9eb4b1.log` `8560b7e54374b72c4538b5750841a5097c96541b34fc8ab986d8c458f573dd44`, check-types `6dd00b22…`, lint `c90b33fa…`; control `web-test-…-419e56d.log` `5f04fa5d…`; `web-unchanged-files` and `storage-unchanged` at both revisions | PASS |
| E23 | this batch | 84 logs (hashes log class "E23"), e.g. C-RD1 `a2428179491794154bbed3bfa133b4e2ea8a15de4bc5f34d24ccf1d85f8f0730`, OE `8da0b9c7…`, C-FB002 `06726b6e…`; host-suite copies (22 files) and the refusal transcript `df41ffac…`; comparison `compare-accepted-apprail-final-v1.log` `aef27ba00afd51a34948b5dc8df62e4dd9d8dbcc3ef0bb79630bea6a35556cab` (85 MATCH, 0 DIFF) | PASS (host suites via copies, §2.3) |
| E24 | this batch | copy logs `native-f9eb4b1-apprail-final-v1-host.log` `20f6273e43758aa8f7f84994f5839bba99e2139570b1c98a9a4ab8bed15e0522` and `-downstream.log` `4efcab6bc4c3a5222e2c34ad2c91bc6033b1121aa5914f835ecd1e14e91a7c55`; frozen refusals `../web-features-recovery-native/native-f9eb4b1-apprail-final-v1-host.log` `ffdb8f74…` and `-downstream.log` `350d8e8a…`; harness copy `87049b7c…` and its two diffs | PASS |
| E25 | this batch | this receipt; `hashes-apprail-final-v1.log` `5e8fa755…` | PASS |

**Supplementary items re-derived** (same log): K-1 `../web-native-keyinput-k1/review-k1.md` `18a98325b5ff04960087967260017237fda9d2be67ef97f91bffa26e14eaf04b` and the K-1 copy `e9fbc590…`; OE `review-oe.md` `63e7eed0…` and `continuity-export.corrected.test.tsx` `6e9c7def…`; C-FB002 `review-fb002.md` `d1fa0e42…` and `boundaries.corrected.test.tsx` `2e88c1db…`; C-FD1 `features-downstream.corrected.test.tsx` `7bb5ad3c…` (`c6d1ed4`).

## 6. E23 detail

- **Appearance (accepted `a560863`).** Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48: names, statuses and `oracle_sha256` equal to the Appearance final at `419e56d`. Frozen `continuity-export` 24/26 (006, 007), OE copy 26/26. `original` 187/187 = the accepted 185 plus exactly the two additive §11 cases `[shell-topbar] Topbar TP-RAIL-1/2`, all others same order and status. Parent host 33/33; package 11 files / 137, per file equal.
- **Features (accepted `ec55f9e`).** Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26, `original` 6: names and statuses equal; `downstream` per §4. Host 40/40, package 7/45 and reader tests 5/17 per file equal (readers against the Features final `5cd63ff`, the last run).
- **More (accepted `27adb10`).** `fields` 22, `reset` 20, `queues` 14, `owner-export` 13, `original` 15, `host` 11 equal; `boundaries` frozen 10/10 (recorded), corrected (C-FB002) 10/10, 0 RangeError.
- **Notifications (`ad223a2`) and Date & Time (`d0d934d`).** 11 + 3 + 2 + 4 + 10 + 11 = 41 Sol, Astra boundaries 24, Astra host 15, parent host 12; Date & Time 7. All equal.
- **Sticky (`699f6e6`).** 13 + 47 + 27 + 22 = 109, original 10, host 28; ordered titles and `oracle_sha256` equal.
- **Smart Lists, Collaborate, Pomodoro, Dashboard Header** (copies, §2.3): Smart Lists export 8, host 10, host-entry 3, host-wrapper 5, app 5, original39 39, original-parent 4, package 44/314; Collaborate contracts 37, host 8 (accepted `c604951`: 37, 8), package 314; Pomodoro departure 9, advanced 8, package 314; Header departure 5, advanced 5, followon 2. Per file equal to their accepted logs and to the `419e56d` controls.
- **settings-shell 11/54, settings-rest 44/314,** per file equal.

## 7. Required references

- **D1** (controller ruling at E6, dragenter accepts and the following dragover moves the preview): consistent with everything here. C-RD1 passes at `f9eb4b1` with its added `drop`; frozen case 014 fails only at its A7 precondition ("the drag-reorder persisted a changed rail order", i.e. no write without `drop`). The native D1 observation (E9, `ae7b69e`: 78 trusted drags, the preview never changes on `dragenter`) stands; the E24 native downstream drag (with `drop`, all modules visible, P6) passes with the accepted sequence.
- **F-E14-1** (non-blocking UX-05 follow-up: the 375 px source panel covers focused Settings sidebar rows): not re-judged; nothing in this batch observes it. The receipt `review-keyboard-f9eb4b1.md` hash is re-derived (E14).
- **K-1:** `review-k1.md` (`18a98325…`). No runner here sends `nativeVirtualKeyCode`; the E24 copy keeps the K-1 audit (1 = 1, 7 = 7).
- **OE / C-FB002 / C-FD1 / C-RD1:** §4. Judging copies OE, C-FB002 and C-RD1 all pass; C-FD1 runs beside them with its predicted outcome at both revisions.
- **R-PET:** judged in E13 (`55cf1e9`; new controls never covered, open panel never overlaps the pet). The E24 runs use the accepted Features harness with its pet handling unchanged; no product check failed. The rule itself is for final acceptance to confirm.

## 8. Development probes (disclosed; not gate evidence)

All in the session scratchpad: `verify-static` and three `verify-packages` smoke runs (shell-topbar-unchanged, storage-unchanged, shell-test at `f9eb4b1`; all passed first time); dry runs of `hash-evidence` and `compare-accepted` (the latter led to one fix before the official run: Appearance `original` now admits exactly the two additive TP-RAIL cases instead of requiring identical case lists); `probe-tar.mjs` (confirmed a 148 MB archive extracts with a large buffer, diagnosing the copy's root-depth defect). The first E23 host-suite copy attempt is described in §2.3 item 1.

## 9. New files (this commit; additions only)

143 files: the 141 classified in the hashes log, the hashes log itself and this receipt. By class (hashes log): E18 2, E19 1, E20 2, E21 7, E22 8, E21–E22 runner 1, E23 84 logs (including the comparison log), E23 host-suite copies and refusal transcript 22, E24 12, tools 2.
- **In this directory (87):** runners, copies, tools, `host-suites/`, logs, the hashes log and this receipt.
- **In existing runners' directories,** suffix `apprail-final-v1`: `web-appearance-recovery-sol` 8, `web-appearance-recovery-oracle-erratum` 1, `web-appearance-recovery-independent` 1, `web-appearance-recovery-final` 1 (+ 2 in `diagnostics/`), `web-features-recovery-sol` 8, `web-features-recovery-independent` 1, `web-features-recovery-final` 22, `web-features-recovery-native` 2, `web-apprail-order-recovery-sol` 3, `web-more-recovery-fb002/logs` 1, `web-sticky-recovery-sol` 5, `web-sticky-recovery-independent` 1.
- No existing file was modified or deleted (`tracked_files_modified=0`).

## 10. Not verified / limitations

- jsdom and headless Chrome only; synthetic auth; development build without StrictMode; not Tauri. The lockfile gate is a consistency check.
- E1–E17 are cited and hash-checked, not rerun (E15–E17 ran at `f9eb4b1` in `94b12ba`; E9–E14 native in `ae7b69e`, `55cf1e9`, `5c6bcd2`). Their screenshots were hash-checked, not re-inspected.
- Single runs per unit; timing-dependent defects cannot be excluded by one pass; the frozen More `boundaries` oracle remains nondeterministic (F-B002).
- The older host-suite runners have no lockfile gate or `@repo` guard of their own (unchanged in the copies); they resolved dependencies from this worktree's frozen-lockfile install.

## 11. Remaining boundary

CP-APPRAIL-01 stays `implementation_ready_for_review` until independent final acceptance (batch 65), which must reconcile every §14 gate and §15 item and confirm or overturn: the E23 host-suite copy (§2.3 item 1), the transport and E24 copy base, the §10.9 `localStorage` reading, D1, F-E14-1, R-PET and the earlier batch rulings. Acceptance would not close any 312 item and would not authorize deployment, release or Web→Desktop sync; any Desktop flow needs the ADR-0013 D3 gate.

~~~~

</details>

### Calendar raw artifact/source index

- docs/reviews/xai-web-calendar-event-create/20260527-feature-brief.md
- docs/reviews/web-calendar-save-recovery/20260909-diagnosis-and-fix.md
- docs/reviews/web-calendar-independent/20260909-independent-verification.md
- docs/reviews/web-calendar-lock-shim-regression/20260914-regression-and-fix.md
- docs/reviews/web-ai-calendar-sol-independent/review.md
- docs/reviews/web-calendar-d1-fixture-repair/20260909-calendar-fixture-repair.md
- docs/reviews/web-board-workspace-astra-review/20260909-board728-calendar2fed-acceptance.md
- docs/reviews/web-board-workspace-astra-review/20260909-calendar-fixtures-9a7e66b-acceptance.md
- docs/reviews/web-ai-calendar-invalid-date/before.log
- docs/reviews/web-ai-calendar-invalid-date/date-contract.test.tsx
- docs/reviews/web-ai-calendar-invalid-date/review.md
- docs/reviews/web-ai-calendar-invalid-date/verify.config.mjs
- docs/reviews/web-ai-calendar-sol-independent/native-20a0748.log
- docs/reviews/web-ai-calendar-sol-independent/native-afd10ff.log
- docs/reviews/web-ai-calendar-sol-independent/native-probe.tsx
- docs/reviews/web-ai-calendar-sol-independent/verify-native.mjs
- docs/reviews/web-ai-calendar-validation-fix/registry-subscriber-after-afd10ff.log
- docs/reviews/web-ai-calendar-validation-fix/registry-subscriber-before-e50ca1c.log
- docs/reviews/web-ai-calendar-validation-fix/registry-subscriber-contract.test.tsx
- docs/reviews/web-ai-calendar-validation-fix/review.md
- docs/reviews/web-ai-calendar-validation-fix/update-array-time-after.log
- docs/reviews/web-ai-calendar-validation-fix/update-array-time-before.log
- docs/reviews/web-ai-calendar-validation-fix/verify.config.mjs
- docs/reviews/web-calendar-independent/after-runner.log
- docs/reviews/web-calendar-independent/after.log
- docs/reviews/web-calendar-independent/before-runner.log
- docs/reviews/web-calendar-independent/before.log
- docs/reviews/web-calendar-independent/native.tsx
- docs/reviews/web-calendar-independent/test-runner.log
- docs/reviews/web-calendar-independent/tests.log
- docs/reviews/web-calendar-independent/verify-native.mjs
- docs/reviews/web-calendar-independent/verify-tests.mjs
- docs/reviews/web-local-time-consumers-independent/20260909-before-failure.log
- docs/reviews/web-local-time-consumers-independent/20260909-review.md
- docs/reviews/web-local-time-consumers-independent/after.log
- docs/reviews/web-local-time-consumers-independent/before.log
- docs/reviews/web-local-time-consumers-independent/matrix-America_Los_Angeles.log
- docs/reviews/web-local-time-consumers-independent/matrix-Asia_Shanghai.log
- docs/reviews/web-local-time-consumers-independent/matrix-Australia_Lord_Howe.log
- docs/reviews/web-local-time-consumers-independent/matrix-UTC.log
- docs/reviews/web-local-time-consumers-independent/metrics-instant-regression.log
- docs/reviews/web-local-time-consumers-independent/native.tsx
- docs/reviews/web-local-time-consumers-independent/verify-current-matrix.mjs
- docs/reviews/web-local-time-consumers-independent/verify-native.mjs
- docs/reviews/web-local-time-contract/20260909-bug-diagnose.md
- docs/reviews/web-local-time-contract/20260909-independent-verification.md
- docs/reviews/web-local-time-contract/20260909-parent-verification.md
- docs/reviews/web-local-time-contract/20260909-tt-idle-rollover-fix.md
- docs/reviews/web-local-time-contract/dev_log.md
- docs/reviews/web-local-time-contract/verify-browser-day-recovery.log
- docs/reviews/web-local-time-contract/verify-browser-day-recovery.mjs
- docs/reviews/web-local-time-contract/verify-browser-metric-instant-after.log
- docs/reviews/web-local-time-contract/verify-browser-metric-instant.log
- docs/reviews/web-local-time-contract/verify-browser-metric-instant.mjs
- docs/reviews/web-local-time-contract/verify-browser-six-date-Asia_Shanghai.log
- docs/reviews/web-local-time-contract/verify-browser-six-date-Australia_Lord_Howe.log
- docs/reviews/web-local-time-contract/verify-browser-six-date-Pacific.log
- docs/reviews/web-local-time-contract/verify-browser-six-date-UTC.log
- docs/reviews/web-local-time-contract/verify-browser-six-date-matrix.mjs
- docs/reviews/web-local-time-contract/verify-tokens-metrics-tests.log
- docs/reviews/xai-web-calendar-event-create/20260527-discovery-review.md
- docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md
- docs/reviews/web-board-workspace-astra-review/author-d8412d3-d1-calendar-independent-HEAD.log
- docs/reviews/web-board-workspace-astra-review/author-d8412d3-d1-calendar-pending-HEAD.log
- docs/reviews/web-board-workspace-astra-review/author-d8412d3-d1-calendar-repair-boundaries-HEAD.log
- docs/reviews/web-board-workspace-astra-review/author-db1eddc-d1-calendar-independent-HEAD.log
- docs/reviews/web-board-workspace-astra-review/author-db1eddc-d1-calendar-pending-HEAD.log
- docs/reviews/web-board-workspace-astra-review/author-db1eddc-d1-calendar-repair-boundaries-db1eddc.log
- docs/reviews/web-board-workspace-astra-review/author-run-d1-calendar-independent-HEAD.log
- docs/reviews/web-board-workspace-astra-review/author-run-d1-calendar-pending-f764731.log
- docs/reviews/web-board-workspace-astra-review/b2-calendar-5c13fec.log
- docs/reviews/web-board-workspace-astra-review/b2-calendar-aca0193.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-contract.test.tsx
- docs/reviews/web-board-workspace-astra-review/d1-calendar-independent-2fed984.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-independent-496039f.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-independent-9a7e66b.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-independent-astra-2fed984.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-independent-d8412d3.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-independent-db1eddc.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-independent-f764731.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-pending-2fed984.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-pending-496039f.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-pending-9a7e66b.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-pending-d8412d3.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-pending-db1eddc.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-pending-f764731.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-publication-astra-2fed984.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-publication.test.tsx
- docs/reviews/web-board-workspace-astra-review/d1-calendar-repair-boundaries-2fed984.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-repair-boundaries-9a7e66b.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-repair-boundaries-d8412d3.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-repair-boundaries-db1eddc.log
- docs/reviews/web-board-workspace-astra-review/d1-calendar-repair-boundaries-f764731.log
- docs/reviews/web-board-workspace-astra-review/six-calendar-full-rerun-4202c79-harness-root-attempt.log
- docs/reviews/web-board-workspace-astra-review/six-calendar-full-rerun-4202c79.log
- docs/reviews/web-board-workspace-astra-review/six-calendar-full-rerun-9a7e66b.log
- docs/reviews/web-board-workspace-astra-review/verify-d1.mjs
- docs/reviews/web-board-workspace-astra-review/verify-six-subscribers.mjs

Owning package dev_log.md is also fully hash-bound; its source-era tests and deferred vendor history are preserved, not reset. Missing launch IDs remain unknown and block affected admission.

## Appendix F — static receipt boundary

The sole static pass validates all 3634 input identities, exact original/current ledgers and attribution, literal labels, inherited gate bytes, output scope and fixed product delta. Its result is reported with the immutable commit; it is not native evidence, qualification or acceptance. All current execution categories remain zero. Both buffers existed before any write.
