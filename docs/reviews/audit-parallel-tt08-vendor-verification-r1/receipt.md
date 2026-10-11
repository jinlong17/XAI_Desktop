# TT08 actual cross-vendor raw receipt

Controller persists external raw result without repair or business acceptance.

```json
{
  "actor": "external-cli/TT-08/verify/i1",
  "pid": 17860,
  "started_at": "2026-10-10T10:12:03.075907+00:00",
  "exit_code": 0,
  "elapsed_seconds": 227.612,
  "shutdown_events": [],
  "parse_errors": [],
  "result_subtype": "success",
  "result_is_error": false,
  "modelUsage": {
    "claude-opus-5-5": {
      "inputTokens": 54,
      "outputTokens": 21555,
      "cacheReadInputTokens": 3076138,
      "cacheCreationInputTokens": 159821,
      "webSearchRequests": 0,
      "costUSD": 2.3251116000000005,
      "contextWindow": 1000000,
      "maxOutputTokens": 128000,
      "thinkingTokens": 8259,
      "canonicalModel": "claude-opus-5-5",
      "provider": "firstParty",
      "costBasis": "list"
    }
  },
  "total_cost_usd": 2.3251116000000005,
  "reported_num_turns": 53,
  "raw_stdout_sha256": "f94cfe8100aba8dde8ea25bea83cb9fd412b941890f3d73e0260f1999ac1bf90",
  "raw_stderr_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "business_verdict": "literal external finaltext below; controller does not adjudicate here"
}
```

## Literal external final text

# TT-08/verify: independent vendor verification report (r1)

## Verdict

**BLOCKED.** This verdict covers only the exact documentation candidate `01efd359d910fbe5cd5092570fe9060ffc9d8ef7`.

One narrow evidence-traceability error blocks approval. In `packages/plugin-web-time-tracker/docs/test.md`, the test map says a test file covers mode selection when no package test does, and it leaves out the file that actually tests the Start confirmation (F1). Everything else in D1–D7 matches the actual P0 source and the accepted historical reports.

This report does not affect any status. It is not a PASS, it publishes no READY_TO_SHIP, it accepts nothing, and it changes no formal state. Formal counts stay at **13 completed / 3 verification_pending / 3 in_progress / 293 pending = 312; 299 unclosed**, and the Clock budgets and gates are unchanged.

## Identity and method

- **Actor:** a fresh Claude Code CLI session, which is the actual cross-tool run. Reported model: Opus 5.5 (`claude-opus-5-5`, CLI alias `opus`). I did not write any TT08 stage, and I am not the Codex writer.
- **Tools:** Read, Glob and Grep only. I did not use Bash, children, MCP, hooks, a browser, native tools, package/test/build/lint/typecheck, any historical rerun, or any write. Nothing was repaired.
- **Inputs I read:**
  - the original goal attachment, then `AGENTS.md`, `CLAUDE.md`, `workflow.md` (cross-vendor and READY_TO_SHIP rules) and `authority-overlay.md`
  - the task card `task-tt08-vendor-verify-r1.json` and this folder's `preflight.json` and `prompt.md`
  - the approved contract, the independent APPROVED review, and the complete static before
  - all five candidate docs
  - P0 `TimeTrackerModule.tsx:500–809`, all of `internal/storage.ts`, `internal/time.ts:115–149`, `types.ts`, `index.ts` and `TimeTrackerWidget.tsx`
  - the tests `sessionController.test.ts`, `TimeTrackerModule.test.tsx` (lines 1–60 and 250–424), and the test titles in `sessionEditor`, `sessionInvariants`, `dayRollover` and `windowConsumers`
  - the TT01, TT02, TT03 and REL01 independent reports, read by targeted search
  - original audit `02-tasks-time-boards.md:128`, `execution-state.json` (the TT-08/implement row) and `tasks-P4.json` (the TT-08/implement card)
- **Byte identity:** I could not compute hashes with the tools I have. I rely on the root preflight for byte identity: 307 input rows verified, 5 output hashes, `exact_patch_sha256 fdc0c619…`, and 30 protected package/host inputs. I did **not** independently hash, diff or run tests. I read the files in this worktree, which root bound to the candidate.
- **Cost:** about $2.2 of the $12 cap, with 0 runtime and 0 children. This is verification family iteration **1/3**.

## D1–D7 coverage

| Row | Result | Concrete evidence |
|---|---|---|
| **D1: consumer truth** | **FAIL on one row (F1); every other claim is correct** | **Mode type and default:** `types.ts:5` defines `single \| multi`. `storage.ts:124–127` reads only the literal `multi` as Multi. `storage.ts:137–141` writes the mode key and dispatches the event.<br>**Hook:** `storage.ts:330–334` builds on the shared hook at `215–251` and its `isReady` guard.<br>**Page:** `TimeTrackerModule.tsx:520` uses the hook. The EN/ZH selector is at `789–791`, and Start plus confirmation at `606–622`.<br>**Public surface:** `index.ts:5–35` matches the list at `api.md:5–15` exactly (key, event and creation exports; `isActiveEntry`/`isRunningEntry`). Mode read/write/hook and `commitTimeTrackerEntries` are not exported, as `api.md:26` says.<br>**Widget:** `TimeTrackerWidget.tsx:10–35` uses the snapshot only, shows `runningCount`, and calls `goTo("timetrack")`. It has no mode or timer commands, as stated at `prd.md:33`, `design.md:51` and `api.md:52`.<br>**Other mode consumers:** a search of apps/packages for mode symbols finds only storage, index, module, two tests, and the bookkeeping in `accountOwnership.ts` and `dataExport.test.ts`.<br>**Failure:** `test.md:39` (F1). |
| **D2: accepted decisions** | PASS | **Single default:** `storage.ts:126`.<br>**Start rule:** Start runs only on selected Today (`module:607`). Single mode with running rows opens the EN/ZH confirmation (`611`). The captured running JSON is rechecked inside the `setEntries` updater, which runs inside the lock (`storage.ts:280–289`). The update finishes the running rows and appends a new row at one `stamp` (`module:613–615`).<br>**Multi:** `module:620–621` appends with no dialog.<br>**Running vs paused:** `time.ts:128–139` (active means unfinished; running means an open last segment).<br>**Controller check:** `storage.ts:291–294` rejects only newly running IDs when Single would leave more than one running.<br>**Resume:** `module:630–634` calls the controller directly, with no dialog.<br>**Stale or missing lock refusal:** `storage.ts:278, 284–290`.<br>**Docs:** these are restated correctly at `prd.md:20–24`, `design.md:45–47` and `api.md:48`. Conversion and preference-write limits are labelled as observations, not owner policy (`prd.md:37–39`, `design.md:49`, `api.md:50`). |
| **D3: PRD and page trace** | PASS | The new PRD is a bounded slice. It explicitly says it is not GOV05 closure (`prd.md:10`), and it has requirement → source → historical evidence → boundary columns (`18–27`).<br>Page correspondence is checked statically with zero page edits, and the PRD claims no browser, visual or a11y acceptance (`prd.md:31`). The EN/ZH strings match `module:611, 777–791`.<br>No widget commands are invented. |
| **D4: chronology and status** | PASS | `dev_log.md:3–18` is the current TT08 iteration. It has `Status: PENDING_INDEPENDENT_VERIFICATION` and the full Workflow, Executor, Updated, Suggested Next and Work Log fields.<br>The June `READY_TO_SHIP`, merge suggestion, commands and environment note are kept as a labelled historical tail (`20–51`), which matches the before at lines 236–266.<br>Every READY_TO_SHIP mention in the candidate is negated or marked historical (`prd.md:53,55`; `dev_log.md:18,24`). |
| **D5: TT01/02/03/REL01** | PASS | **TT01:** 11 original assertions kept separate from the author's 63 tests; 20 Insights; five CSVs; Los_Angeles and Lord_Howe across four boundaries; completed-row-count residual (report lines 12, 19, 36–45, 49, 57).<br>**TT02:** 5/11/78/11 assertions, overlapping and not additive; 1440px viewport; no cross-vendor claim; the runner-resolution failure (report lines 11–14, 30, 39).<br>**TT03:** 29,875 ms / 40,875 ms; 11 files / 82 tests; TT01 reuse; replay then added assertions; empty stdout was not the oracle (report lines 3, 9, 20, 22).<br>**REL01:** `58f4076` idle failure, then `9149778`; six consumers; 2 targeted assertions with 4 filtered out (report lines 3, 13, 17, 27).<br>All of these are cited accurately at `prd.md:45–49` and `test.md:43–50`.<br>The candidate never claims a fresh P0 rerun, and it states that the TT02 package is not P0-identical. |
| **D6: adjacent callers** | PASS | DASH07, TT04–07, REL04, GOV04/05, cloud sync, transactions, performance, recovery and release are all bounded at `prd.md:41`, `test.md:50` and `design.md:51`. No source, schema or syncScope claim is made. |
| **D7: integration and global** | PASS (documentary) | The candidate states the order: fresh verifier and actual cross-tool gate → separate status writer → fresh Astra full-chain acceptance → root reconciliation and inventory (`prd.md:53–55`, `test.md:52`, `dev_log.md:9,18`).<br>Independent Codex actors and Claude availability are not counted as vendor evidence. The Clock and final-regression gates are neither run nor waived.<br>Root preflight covers the 5-path scope and 30 protected inputs, which I did not hash myself. |

## Findings

**F1 (BLOCKING): the test map claims coverage that does not exist.**

- `packages/plugin-web-time-tracker/docs/test.md:39` says `TimeTrackerModule.test.tsx` covers "Bilingual module, **mode selection**/Start and multiple distinct sessions." That file never drives the mode `<select>`. No package test anywhere references `Timer mode`, `计时模式`, `Single task` or `Multiple tasks`.
  - The multi test (`TimeTrackerModule.test.tsx:397–418`) sets the raw key `localStorage.setItem("xai_tt_mode","multi")` at line 398.
  - Line 17 only checks that an unrelated "Time tracker mode" label is absent.
- The only unit test of the single-mode **End and start** confirmation is `sessionEditor.test.tsx:8` ("single mode confirms switch and atomically ends old session before starting new"). `test.md:38` maps `sessionEditor.test.tsx` only to metadata edits and editor retention, so this test goes unmentioned.
- The TT02 native evidence covers single-mode starts, not selector interaction (TT02 report line 14).
- **Why it blocks:** this breaks contract D1 ("Every mode claim links to exact … test/report") and the card acceptance "Every claim matches fixed34 package/host inputs."
- **Correction needed:** a fresh scoped author should make these edits; the reviewer does not repair.
  1. `test.md:39`: describe the multi coverage as a raw-key fixture and drop "mode selection."
  2. `test.md:38`: add the single-mode confirmation and atomic switch.
  3. State that no existing automated or native test exercises the selector UI; selector correspondence is static source only.
  4. Optionally, `prd.md:20` (TT-M01): qualify "existing module/controller tests" to say they cover default-single and raw-key multi, not selector interaction.
- No source or test change is needed.

**A1 (non-blocking, recommended in the same correction): unsourced owner line.**
`docs/product/time-tracker/prd.md:6` says `Owner: Jinlong Li`. No contract, review, before, card or other canonical PRD has an Owner field, and the name appears nowhere else in tracked md/json. Remove it, or source it from an owner-confirmed record.

**A2 (informational, no change needed): dated section edited in place.**
`design.md:34`, `api.md:37` and `test.md:27` rewrite a stale sentence inside the dated "REL-01 amendment — 2026-09-09" section. The contract permits replacing stale TT01 follow-up text with accepted references, the new text is accurate, and the original wording is preserved in `before.md:144,188,228`.

All links I resolved exist: the test files, the contract/review/before, the four historical reports, `web-local-time-contract/dev_log.md`, the widget, and `index.ts`.

## Limitations

- I computed no hashes, ran no git commands, and could not independently confirm the candidate or worktree binding. That rests on the root preflight.
- I ran no tests. Test content was checked by reading only.
- I reviewed the historical reports by targeted search, not complete line-by-line reads.
- I did not read the full bodies of `windowAccounting`, `localDate` or `accountIsolation` tests.
- I did no screenshot or visual review.

## Next steps

These are root's actions, not mine:

1. Persist this report as written.
2. Count this verify iteration as 1/3.
3. Register a fresh scoped doc correction limited to `test.md` (and optionally `prd.md:6/20`).
4. Run a fresh exact-candidate re-verify.

The separate status writer, the fresh Astra full-chain acceptance and root reconciliation/inventory follow only after an actual PASS.
