# REL-05 remaining consumer inventory — independent first pass

> Historical first-pass inventory below. Current follow-up: Meditation preference recovery has independent `28fe049`; Matrix creation/move recovery has independent `8e50d8f`; Calendar composer CRUD has independent `3cd8870`. Habits and Countdown work is in progress and is not accepted here. POMO timer completion does not close its preference autosaves; Calendar composer completion does not close view/week-start preferences or AI subscribers. See the execution ledger for exact current evidence and boundaries. The remaining original rows are not automatically closed by shared setter changes.

Web module. Read-only product audit at HEAD `419f941b7ec0391f157fa5f0e175b0a5cfbf9996`; POMO/controller/storage host files were concurrently dirty and are **not accepted** by this report. Evidence only. Initial contract: `../web-storage-write-results/20260909-rel05-diagnosis.md`.

A returned boolean in shared `usePref` does not close consumers that ignore it. This is a source inventory plus one independently reproduced MED defect, not a claim of native quota coverage for every feature. Each remaining row requires its own failure/retry/account-switch acceptance.

| Feature | Current boundary / disposition | Remaining minimal check / implementation |
|---|---|---|
| Tasks | bounded save recovery independently accepted, dd744f5; evidence 7102f22 | Keep scope limited: two-key list/tag deletion is not transactional; memory drafts do not survive closing the page. |
| Bookkeeping | bounded canonical/partial-mirror save recovery independently accepted, 9222519; evidence 7102f22, 9c974e7 | No cross-tab transaction or automatic draft persistence claim. |
| Metrics | bounded latest-draft, pending-action ownership, baseline/account guard accepted a61f92d; evidence 8c88842 | No cross-reload draft or cross-tab atomicity claim. |
| Statistics / STAT | Four usePref reads; **no business setter** in module or aggregators | N/A for save-result consumer. Read failures/corrupt fallback/source freshness remain separate REL07/STAT checks, not a missing save UI. |
| Meditation / MED | useMeditationPrefs.setSafe explicitly discards boolean; custom scene save/delete and preference picks cannot react to failure | **Reproduced defect below.** Return bool, advance editor identity only after commit, keep latest scene draft, visible error + retry/export scoped to owner. Preference failures should visibly preserve/revert selection. |
| Pomodoro / POMO | Concurrent new sessionController has settlement journal, guarded execute and retry; module's six usePrefAutosave calls still use void hook | Author owns implementation. Separately verify active/history settlement and preset/custom-minutes/style/theme/sound/mute failures. Timer durability PASS must not silently cover preference autosaves. No acceptance here of dirty controller. |
| Countdown | mutateCards discards setRawCards result; handleSave and handleDelete unconditionally closeModal (CountdownModule 119–138) | Quota during new countdown: require retained draft + error, then exactly one creation on retry. Close only when boolean true; same for edit/delete. |
| Calendar | useUserCalEvents.create/update return created/updated entity regardless of setEventsRaw boolean; remove returns void | Inject events-key failure, require callers do not close/claim entity created. Return explicit rejected result and retain form; test create/edit/delete and selected view/week-start separately. |
| Habits | usePersistedHabits public setter typed void; handleAddHabit changes selection and closes dialog unconditionally; diary uses blur persistence | Quota during add must preserve dialog; diary blur failure must retain latest text and expose retry/export. Check-in event must follow confirmed write, not proposed state. |
| Matrix | moveCard ignores setState result and emits priority-tagged afterward; addCard loses result | Deny key then move: no success event, old quadrant retained; add draft stays. Return commit result through hook/UI. |
| Board core / views / workspaces | Each owns direct setters; workspace multi-key board/workspace/panel/inbox/task/view/filter helpers discard write result | Test each editor and cross-feature transfer independently. A successful shared Tasks module does not validate Board's direct xai_task_cols write. Do not advance activeBoardId after failed board creation. Preserve multi-key partial status. |
| AI Chat | persistConvoMessages and create/rename/delete use direct setRawConvos without inspecting result; insights/voice preferences also setters | Deny conversation write during send/stream completion/rename: retain input and generated result, visible unsaved state, captured-owner export/retry. Distinguish remote stream success from local persistence. BYOK IDB has separate contract. |
| Dashboard | grid/order hook setters; DashHeader note and noteOffset use void autosave | Header note is user content: quota after edit must show unsaved and retain/export latest note. Grid reorder should visibly revert/fail and offer retry. |
| Widgets | clock style/timezone setters; Mail/MiniCal/Upcoming/StatPomos/StatStreak are data readers | Clock prefs failure feedback; no invented business-save requirement for read-only widgets. TT widget mutations follow TT repository scope. |
| Settings appearance / feature switches / rest | mixed direct setPref, usePref, autosave; appearance emits preference-changed after unchecked writes | Deny preference key: do not show committed/reset success based solely on React appearance. Device preference reset and account deletion/export are separate recovery contracts already partially tested, not whole-settings save PASS. |
| Shell rail / Pet | direct usePref setters for order, pet id, position | Quota drag/drop/pet picker: visible failure or explicit revert; account/device classification stays unchanged. |
| Time Tracker | dedicated repository/hook; TT01 report accounting acceptance does not verify save failure recovery | Independently inject entry/category write failure; inspect editor retention, visible error, timer start/stop/retry, exports and partial category deletion. Do not infer REL05 closure from thrown exceptions or TT01 PASS. |

## MED confirmed defect, severity P1

`MeditationModule.tsx:243–266` sets editingSceneId to a generated custom id **even when** setPrefs fails. `useMeditationPrefs.ts:25–27` swallows the boolean. Next Save treats it as an existing scene and maps the old empty customScenes; nothing is inserted.

Independent actual React component / native Storage prototype fault reproduction:

1. Activate synthetic account A, empty meditation key, render MeditationModule.
2. Enter `Independent unsaved scene` in custom-scene name.
3. Throw QuotaExceededError only for this account's meditation key; click Save.
4. Original key remains absent; editor retains text; **no role=alert**.
5. Restore storage, click the same Save again.
6. Storage write now succeeds but contains `customScenes: []` and `scene: custom:<id>` referencing no scene. Thus manual retry does not recover the proposal.

`consumer.test.tsx` asserts the defective observable outcome; its green status is **successful reproduction, not product PASS**. Run:

```
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-save-consumer-inventory/consumer.config.mjs
```

See `20260909-med-reproduction.log`. No real account/profile or service was used. No browser-level MED acceptance is claimed. Fix should add an inverse regression: failed save leaves editor new; restored Save inserts exactly one latest draft; repeated Save updates it; export/account switch cannot leak A's draft to B.

## Inventory completeness boundary

`consumer-call-sites.txt` preserves the source-search candidate set across Web-pref/setItem/repository save/write calls. Tests, docs, node_modules and desktop-only packages are excluded. Search candidates include read-only calls/helper definitions, so line counts are not feature/test coverage. Dynamic aliases and lower-level IndexedDB paths require targeted follow-up (notably auth/AI), and are not declared completely verified. This report reconciles all identified Web feature families; only MED received a new runtime reproduction in this pass.
