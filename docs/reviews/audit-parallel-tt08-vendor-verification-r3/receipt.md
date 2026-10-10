# TT08 actual cross-vendor raw receipt iteration3

Controller persists literal external output; transport success is not business acceptance.

```json
{
  "actor": "external-cli/TT-08/verify/i3",
  "pid": 36897,
  "started_at": "2026-10-10T10:46:02.114579+00:00",
  "exit_code": 0,
  "elapsed_seconds": 263.388,
  "shutdown_events": [],
  "parse_errors": [],
  "result_subtype": "success",
  "result_is_error": false,
  "modelUsage": {
    "claude-opus-5-5": {
      "inputTokens": 46,
      "outputTokens": 27896,
      "cacheReadInputTokens": 3575497,
      "cacheCreationInputTokens": 244865,
      "webSearchRequests": 0,
      "costUSD": 3.2321234000000003,
      "contextWindow": 1000000,
      "maxOutputTokens": 128000,
      "thinkingTokens": 12701,
      "canonicalModel": "claude-opus-5-5",
      "provider": "firstParty",
      "costBasis": "list"
    }
  },
  "total_cost_usd": 3.2321234000000003,
  "reported_num_turns": 61,
  "init_tools": [
    "Glob",
    "Grep",
    "Read"
  ],
  "tool_call_count": 60,
  "tool_names": [
    "Glob",
    "Grep",
    "Read"
  ],
  "raw_stdout_sha256": "3196abdfb83ed45dddbb38df05e536d9950d2eb5cc02e5fec3b7b770d50505b1",
  "raw_stderr_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "business_verdict": "literal external finaltext below; controller does not adjudicate"
}
```

## Literal external final text

# TT-08/verify3 — independent cross-tool documentary verification (iteration 3/3)

## Verdict

**APPROVED.** This verdict covers only the exact documentation candidate `59809b32a4dc19dbdefff871cf9c60bb5b0b96b1`. Its parent is `6db0903f966b49d4c9cfeb099db5885d5ec76758` and the product baseline P0 is `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.

- The r1 F1 blocker is corrected and matches the actual tests.
- The r1 A1 Owner line is removed.
- I reassessed all of D1–D7 against the actual source, the test bodies and the four complete historical reports. None of the seven rows is blocking.
- There are four non-blocking notes (N1–N4) and one informational item.

What this verdict does not do:
- It publishes no READY_TO_SHIP, current or otherwise. It accepts nothing for the audit, closes no GOV04/GOV05 item, and updates no formal state.
- Formal counts stay at **13 completed / 3 verification_pending / 3 in_progress / 293 pending = 312; 299 unclosed**.
- Clock budgets and gates (C-FB002, OE, C-RD1, predicted C-FD1, and Required evidence) are unchanged, neither run nor waived.

Still to follow, in order: a separately registered status writer, then a fresh Astra full-chain acceptance, then root reconciliation and inventory.

## Identity, independence and method

- **Actor:** this new Claude Code CLI session is the actual cross-tool run. Model: Opus 5.5 (`claude-opus-5-5`). I did not author, correct or verify any earlier TT08 stage, and I am not the Codex writer.
- **Tools:** Read, Glob and Grep only. I used no Bash, children, MCP, hooks, browser or native tools. I ran no package, test, build, lint or typecheck, no historical runtime rerun, and made no write. I repaired nothing.
- **Byte identity:** I could not hash or run git. Candidate binding rests on the root preflight (`preflight.json`):
  - 307 before-input identities verified (`:325`)
  - five output hashes (`:8–14`)
  - full patch `90bc2ec9…` (`:15`)
  - 30 protected package/host inputs (`:326–357`)
  
  I read the files in this worktree, which root bound to the candidate. I did not independently hash, diff or test anything.
- **Cost:** about $3 of the $12 cap, from about 60 Read/Glob/Grep calls. Zero runtime, zero children. Root's stream records the exact cost, wall time and `modelUsage`.

### Governance and input census

**Original goal:** read first, by tool, in full: `goal-objective.md`, lines 1–111.

**The four governance inputs** were each read twice, completely:
- **Provided text:** I read each `<provided_complete_governance_input>` block in the prompt:
  - `AGENTS.md` (`519c72bc…`)
  - `CLAUDE.md` (`6597e484…`)
  - `workflow.md` (`99bb429d…`)
  - `authority-overlay.md` (`184ebab8…`)
- **Tool read:** I also read all four files completely from the worktree:
  - `AGENTS.md`: lines 1–252
  - `CLAUDE.md`: lines 1–370
  - `workflow.md`: lines 1–316
  - `authority-overlay.md`: lines 1–12
- **Comparison:** reading by eye, the tool-read text matches the provided blocks. I computed no hashes, so byte equality rests on root.
- **Gap from attempt 2:** that run skipped `AGENTS.md` and `CLAUDE.md` and read `workflow.md` only by grep. That gap does not recur here.

**Also read completely:**
- `multi-machine-development.md`, lines 1–126
- the task card `task-tt08-vendor-verify-r3.json`
- `preflight.json`, all 429 lines
- the correction card `task-tt08-doc-correct2.json`
- the `TT-08/implement` card, `tasks-P4.json:20–68`

**Not read:**
- `CURRENT-CONTROL-PLANE.md`. That is the controller's entry point and is not required for this verifier.
- This folder's `prompt.md`.

**TT08 chain, all read completely:**
- the approved contract (133 lines)
- the APPROVED review (93 lines)
- the static before (267 lines, including its four literal before-documents)
- the r1 BLOCKED receipt
- the r2 receipt, for context only; I did not rely on its findings

**The five candidate docs, all read completely:**
- `prd.md` (55 lines)
- `design.md` (54)
- `api.md` (53)
- `test.md` (55)
- `dev_log.md` (52)

**Source:**
- Read in full: `internal/storage.ts` (1–342), `internal/time.ts` (1–181), `types.ts`, `index.ts` and `TimeTrackerWidget.tsx`.
- `TimeTrackerModule.tsx`: read lines 1–70 and 480–1065, the whole main component through the confirm and focus wiring. Also read 2730–2769 (entry editor) and 3020–3059 (the "current" Insight card), plus grep of every mode, confirm, Resume and running reference.
- Not read line by line: the editor, Insights and CSV internals.

**Tests, all full bodies:**
- `sessionEditor`
- `sessionController`
- `sessionInvariants`
- `TimeTrackerModule` (1–677)
- `dayRollover`
- `windowConsumers`
- `windowAccounting`
- `localDate`
- `accountIsolation`
- `time`
- `registration`

**Historical reports, all four read in full:**
- **TT01:** `web-time-window-independent/20260909-verification.md`
- **TT02:** `web-time-tracker-session-independent/20260909-report.md`
- **TT03:** `web-time-hour-independent/20260909-review.md`
- **REL01:** `web-local-time-consumers-independent/20260909-review.md`

**Searches:**
- Mode symbols across `apps/` and `packages/`.
- Selector strings across `packages/` and the TT02 and invariant native harnesses.
- `Owner`, `READY_TO_SHIP` and `owner` in the five docs.
- Original audit `02-tasks-time-boards.md:128`.

## r1 F1 and A1 correction check

**F1 part 1 — the "mode selection" overclaim: fixed.**
- `test.md:39` now reads: "Bilingual module and Start; multiple distinct sessions seeded with the raw `localStorage.setItem("xai_tt_mode", "multi")` fixture, without selector interaction".
- That matches `TimeTrackerModule.test.tsx:398`. The file never drives the `<select>`. Its line 17 checks that an unrelated "Time tracker mode" label is absent.

**F1 part 2 — the Start-confirmation test was missing: fixed.**
- `test.md:38` now names "Default-Single End and start confirmation and atomic session switch" for `sessionEditor.test.tsx`.
- That matches `sessionEditor.test.tsx:8`. The test sets no mode key, so Single is the default. Clicking a second Start leaves 1 row. Confirming "End and start" then leaves 2 rows, 1 unfinished.
- The doc's "mounted editor retention on failed save" matches lines 7 and 9.

**F1 part 3 — selector UI coverage stated as static only: fixed.**
- `test.md:43` and `prd.md:19` now state this.
- I confirmed no package test contains `Timer mode`, `计时模式`, `Single task`, `Multiple tasks` or `tt-mode`.
- The TT02 native harness sets the raw key instead (`verify-native.mjs:56`: `localStorage.setItem('xai_tt_mode','single')`).

**F1 part 4 — the optional TT-M01 qualification: fixed.**
- `prd.md:19` reads "sessionEditor/module/controller tests cover default-Single confirmation and raw-key Multi fixtures".
- `sessionController.test.ts:9` likewise uses the default for Single and the raw key for Multi.

**A1 — the unsourced Owner line: removed.**
- `prd.md:1–5` has no Owner field.
- The remaining "owner" words are generic. "Owner decision" appears at `:36`. "Captured owner" appears at `api.md:26` and `:41`. "Shared owner" in the REL-01 sections names a package (`@repo/plugin-web-tokens`), not a person. No owner name is invented.

## D1–D7 coverage

| Row | Result | Concrete evidence (P0 source / test / report ↔ candidate) |
|---|---|---|
| **D1: consumer truth** | PASS | **Mode type, default and write:** `types.ts:5` defines `single \| multi`. `storage.ts:124–127` reads only the literal `multi` as Multi. `storage.ts:137–141` writes the unscoped key and dispatches the event.<br>**Hook:** `storage.ts:330–334` builds on the shared hook at `215–251`, with its `isReady` guard.<br>**Page:** `TimeTrackerModule.tsx:520` consumes the hook. The EN/ZH selector is at `789–791`. Start is `startCategory` at `606–622`, and it is also reached from `CategoryGrid` (`867`) and category detail (`1032–1033`).<br>**Public surface:** `index.ts:5–35` matches `api.md:7–15`. Mode read/write/hook and `commitTimeTrackerEntries` are not exported, as `api.md:26` says.<br>**Widget:** `TimeTrackerWidget.tsx:10–35` uses only the snapshot: today total, `runningCount` and top category. It calls `goTo("timetrack")` and has no mode or timer command. The docs say the same (`prd.md:32`, `design.md:51`, `api.md:52`).<br>**Other consumers:** none in `apps/`. The only extra references are `accountOwnership.ts:114` and `dataExport.test.ts:79,83`, which are bookkeeping.<br>**Old finding:** the original audit (`02-tasks-time-boards.md:128`) is labelled historical at `design.md:43`. No doc claims the mode is unused today. |
| **D2: accepted decisions** | PASS | **Single default:** `storage.ts:126` ↔ `prd.md:19`, `api.md:26`.<br>**Start:** runs only on selected Today (`module:607`). In Single with running rows it shows the EN/ZH confirmation (`611`). The captured JSON is rechecked inside the updater (`613`), which runs inside the lock (`storage.ts:280–289`). The update finishes all running rows and appends at one `stamp` (`614–615`) ↔ `prd.md:20`, `design.md:45`, `api.md:48`.<br>**Multi:** `620–621` appends with no dialog ↔ `prd.md:21`.<br>**Running vs paused:** `time.ts:128–139` ↔ `api.md:24`, `design.md:47`, `prd.md:22`.<br>**Controller check:** `storage.ts:291–294` rejects only newly running IDs when Single would leave more than 1 running. The error text says "…starting or resuming another".<br>**Resume:** `module:630–634` calls the controller directly, with no dialog ↔ `design.md:47`, `api.md:48`.<br>**Stale owner, missing lock, malformed or changed source, failed write:** `storage.ts:277–290, 295`, plus `sessionController.test.ts:7–12`.<br>**Limits kept as observations:** conversion and preference-write limits are labelled as observations or limits, not owner policy (`prd.md:36–38`, `design.md:49`, `api.md:50`). Device mode versus account content is at `api.md:26` and `prd.md:38`. |
| **D3: PRD and page trace** | PASS | **Bounded slice:** `prd.md:9` says it does not complete GOV05. Rows TT-M01 to TT-D01 (`:17–26`) carry requirement, source, historical-evidence and boundary columns. Every link resolves to an existing file.<br>**Page:** the selector, confirmation, and error/export surface (`module:777–791, 611`) match `prd.md:30` and `design.md:45, 51`. Zero page or source edits. No browser, visual, keyboard or accessibility claim.<br>**Widget:** no widget commands are invented. |
| **D4: chronology and status** | PASS | `dev_log.md:3–18` holds the dated current iteration. It has `Status: PENDING_INDEPENDENT_VERIFICATION` and all required fields: Workflow, Executor, Updated, Suggested Next and Work Log.<br>The June `READY_TO_SHIP`, merge suggestion, 13 command bullets, smoke line and environment note are retained verbatim under a labelled historical heading (`:20–51`). They match before `:238–265`.<br>Every READY_TO_SHIP mention is negated, conditional or historical (`prd.md:52,54`; `test.md:54`; `dev_log.md:18,24`). |
| **D5: TT01/02/03/REL01** | PASS | Checked against the complete reports:<br>**TT01** (`:3,12,18–20,40–45,49,53–58`): 11 original assertions kept apart from 63 author tests; 20 Insights; five CSVs; Los Angeles and Lord Howe across four boundaries; the completed-row-count residual; TT04 is transactions and TT07 is performance; no multi-segment, quota, performance or cross-vendor claim.<br>**TT02** (`:3,11–14,18,30,39`): 5/11/78/11 assertions, overlapping and not additive; the 1,201,250 ms fixture (I also checked the arithmetic in `sessionEditor.test.tsx:5`); 1440px viewport; no mobile or cross-vendor claim; no import/repair; the runner-resolution failure.<br>**TT03** (`:3,9,13,19–22,26`): 29,875 ms / 40,875 ms; 11 files / 82 tests; TT01 reuse; replay then added assertions; empty stdout was not the oracle.<br>**REL01** (`:3–9,13,17–19,25–27,31`): the `58f4076` failure, then `9149778`; six consumers; the four-zone calculation-plus-Calendar matrix; 2 targeted assertions with 4 filtered out.<br>**Where cited:** `prd.md:44–48`, `test.md:47–52`, `design.md:34,53`, `api.md:37`.<br>**No rerun claimed:** the docs never claim a fresh P0 run. They state that TT02→P0 differs only in the module's day refresh plus `dayRollover`, and that the TT02 package is not P0-identical. I took that lineage from the contract and the before, not from my own diff. |
| **D6: adjacent callers** | PASS | DASH07, TT04, TT05–07, REL04, GOV04/05, cloud sync, account-wide isolation, quota, transactions, performance, recovery/import and release are all bounded at `prd.md:23,38,40`, `design.md:51,53`, `api.md:52` and `test.md:52`.<br>No source, schema, syncScope, export or widget change is claimed. |
| **D7: integration and global** | PASS (documentary) | The order is stated: fresh verifier and the actual cross-tool gate → separate status writer → fresh Astra full chain → root reconciliation and inventory (`prd.md:52–54`, `test.md:54`, `dev_log.md:9,18`).<br>Independent Codex actors and Claude availability are explicitly not vendor evidence. Clock and affected-runtime/final regressions are neither run nor waived.<br>The 5-path scope, full patch and protected bytes rest on root's preflight. The correction card limited the correction to `test.md` and `prd.md` (`task-tt08-doc-correct2.json:16–19`). |

## Findings (none blocking)

**N1 — the correction lineage is not recorded in `dev_log.md` or the PRD provenance.**
- These lines describe only the original author pass:
  - `dev_log.md:7` (Executor)
  - `dev_log.md:13–17` ("One bounded author pass", "no candidate verification consumed")
  - `prd.md:11` ("Author parent: c7df572…")
- They do not record:
  - the r1 BLOCKED verification `68ac65f…`, or
  - the `TT-08/DOC-CORRECT2` corrector, who produced the current `test.md` and `prd.md` bytes.
- Nothing stated is false for the pass it describes, and the correction card barred any `dev_log.md` edit.
- **Recommendation:** when the registered status writer appends to `dev_log.md`, it should record r1 BLOCKED → correction → this r3 receipt. The reviewer does not repair this.

**N2 — `prd.md:22` (TT-S01): the Single-mode Resume refusal is source-only.**
- The clause "Resume that adds conflicting running work in Single is rejected" is correct per `storage.ts:291–294`.
- However, no package test and no TT02 native assertion exercises it. Neither does any test for keeping unchanged pre-existing running IDs.
- The row's historical column does not claim that coverage, and `design.md:47` presents it as source behaviour. Consider labelling it "static source" if the PRD is edited again.

**N3 — `prd.md:21` (TT-M03): loose phrase "TT02 native session invariants".**
- TT02's 5/5 invariant assertions are the `cd2b699` reproduction. The native 11/11 separately cover replay, terminal duration and Single starts (TT02 report `:11,14`).
- `prd.md:22` and `test.md:48` state this precisely, so nothing is misattributed overall.

**N4 — informational: one assertion in the multi-session test is vacuous.**
- `TimeTrackerModule.test.tsx:413` asserts that `/Switch from/` does not appear. The current dialog title is "Switch running task?", so this check can never fail.
- Absence of the dialog is actually shown by the 2-entry length check (`:411`).
- The candidate does not rely on that assertion: `test.md:39` claims only distinct sessions from the raw-key fixture. The test itself is protected and is not changed.

**Informational (r1 A2):** `design.md:34`, `api.md:37` and `test.md:27` edit a stale TT01 sentence inside the dated "REL-01 amendment" section.
- The contract permits this.
- The new text is accurate.
- The original wording is preserved in before `:144,188,228`.

## Limitations

- **No hashing or git:** I computed no hashes and ran no git, diff or tests. Candidate and worktree binding, the patch hash, the 307/30 identities and the TT02→P0 lineage come from the root preflight and the contract/review/before, not from my own observation.
- **Module only partly read:** `TimeTrackerModule.tsx` was not read line by line outside 1–70, 480–1065, 2730–2769 and 3020–3059. Those other areas are the editor, Insights and CSV internals, which the candidate cites only as historical TT01/TT03 evidence.
- **Not read:** the widget test, the native harnesses beyond targeted grep, the raw historical logs and screenshots. I did no visual review.
- **Historical results:** these are readings of frozen reports, not reruns. The r1 and r2 receipts and raw logs remain immutable. This is iteration 3/3 of the verification family; no fourth automatic attempt follows.
- **Cross-vendor gate:** this session is an actual different-tool run. Whether it satisfies the `Verify Cross-vendor: yes` gate is for root and the Astra acceptance to decide from the raw stream, exit code and `modelUsage`. My verdict here is documentary only.
