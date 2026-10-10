# TT08 actual cross-vendor raw receipt iteration2

Controller persists literal external output; transport success is not business acceptance.

```json
{
  "actor": "external-cli/TT-08/verify/i2",
  "pid": 32336,
  "started_at": "2026-10-10T10:35:52.744669+00:00",
  "exit_code": 0,
  "elapsed_seconds": 185.167,
  "shutdown_events": [],
  "parse_errors": [],
  "result_subtype": "success",
  "result_is_error": false,
  "modelUsage": {
    "claude-opus-5-5": {
      "inputTokens": 32,
      "outputTokens": 19686,
      "cacheReadInputTokens": 1591466,
      "cacheCreationInputTokens": 166983,
      "webSearchRequests": 0,
      "costUSD": 2.0480052,
      "contextWindow": 1000000,
      "maxOutputTokens": 128000,
      "thinkingTokens": 7661,
      "canonicalModel": "claude-opus-5-5",
      "provider": "firstParty",
      "costBasis": "list"
    }
  },
  "total_cost_usd": 2.0480052,
  "reported_num_turns": 46,
  "init_tools": [
    "Glob",
    "Grep",
    "Read"
  ],
  "tool_call_count": 45,
  "tool_names": [
    "Glob",
    "Grep",
    "Read"
  ],
  "raw_stdout_sha256": "ac4b8d1ca52f4beb03a402f43f083939c08620aa8c7a5882cf6497ec785db920",
  "raw_stderr_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "business_verdict": "literal external finaltext below; controller does not adjudicate"
}
```

## Literal external final text

# TT-08/verify2: independent verification report (iteration 2/3)

## Verdict

**APPROVED.** This verdict covers only the exact documentation candidate `59809b32a4dc19dbdefff871cf9c60bb5b0b96b1`, at parent `47fed55c23113dc22cc158704b673c055c7101cb` and P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.

The two items that held up r1 are fixed:
- **F1:** the test map no longer claims coverage that doesn't exist. It now gives the actual test for each behaviour and says plainly that nothing tests the selector UI.
- **A1:** the unsourced Owner line is gone.

I reassessed all of D1–D7 against the actual source, tests and historical reports, not just the corrected lines. I found no blocking issue. Three non-blocking notes follow.

This report does not change any status:
- It publishes no READY_TO_SHIP, accepts nothing and changes no formal or ledger state.
- Formal counts stay at **13 completed / 3 verification_pending / 3 in_progress / 293 pending = 312; 299 unclosed**.
- Clock budgets and gates are unchanged.
- Still to follow: a separately registered status writer, then a fresh Astra full-chain acceptance, then root reconciliation and inventory.

## Identity and method

- **Actor:** this new Claude Code CLI session is the actual cross-tool run. Model: Opus 5.5 (`claude-opus-5-5`). I did not write any TT08 stage, and I am not the Codex writer or corrector.
- **Tools:** Read, Glob and Grep only. I used no Bash, children, MCP, hooks, browser, native tools, package/test/build/lint/typecheck, historical rerun or write. I repaired nothing.
- **Byte identity:** I could not hash or diff anything. Byte identity rests on root's preflight: 307 input rows verified, 5 output hashes, exact patch `90bc2ec9…`, and 30 unchanged package/host inputs. I read the files in this worktree, which root bound to the candidate.

### What I read

**Governance and task:**
- The original goal attachment (first), then `authority-overlay.md` in full.
- `workflow.md`, by grep only, for the cross-vendor, READY_TO_SHIP and dev_log rules.
- The task card `task-tt08-vendor-verify-r2.json` and this folder's `preflight.json` (all 408 lines).
- **Gap:** I did not read `AGENTS.md` or `CLAUDE.md` in this session, although the instructions asked for them. I relied on the overlay, the workflow grep and the authority already restated in the contract, review and before.

**TT08 chain, all complete:**
- The contract, the approval, the static before and the r1 BLOCKED receipt.

**Candidate docs, all five complete:**
- `prd.md` (55 lines), `design.md` (54), `api.md` (53), `test.md` (55) and `dev_log.md` (52).

**Source:**
- Read in full: `internal/storage.ts` (1–342), `index.ts`, `TimeTrackerWidget.tsx`.
- Read in part: `TimeTrackerModule.tsx` 505–804, `internal/time.ts` 110–154, `types.ts` 1–20.

**Tests:**
- Full bodies: `sessionEditor`, `sessionController`, `TimeTrackerModule` (1–677), `sessionInvariants`, `dayRollover`, `windowConsumers`, `accountIsolation`.
- Test titles only: `windowAccounting`, `localDate`.

**Historical reports, all four complete:** TT01, TT02, TT03 and REL01.

**Searches:**
- Mode symbols across `apps` and `packages`.
- Selector strings in the TT02 and invariants native harnesses.
- `Owner`/`Jinlong`, READY_TO_SHIP and PENDING in the five docs.

## Assessment of the r1 F1 and A1 fixes

| r1 item | Result | Evidence |
|---|---|---|
| F1: `test.md:39` claimed "mode selection" | **Fixed** | `test.md:39` now reads "Bilingual module and Start; multiple distinct sessions seeded with the raw `localStorage.setItem("xai_tt_mode", "multi")` fixture, without selector interaction." This matches `TimeTrackerModule.test.tsx:398`. That file never drives the `<select>`; its line 17 only checks that an unrelated "Time tracker mode" label is absent. |
| F1: the Start-confirmation test was missing | **Fixed** | `test.md:38` maps `sessionEditor.test.tsx` to "Default-Single End and start confirmation and atomic session switch". This matches `sessionEditor.test.tsx:8`, which sets no mode key (so the default is Single), confirms "End and start", and expects 2 rows with 1 unfinished. "Mounted editor retention on failed save" matches lines 7 and 9. |
| F1: selector coverage stated as static only | **Fixed** | `test.md:43` and `prd.md:19` say no automated or TT02 native test exercises the selector, and that selector correspondence is a static read of `TimeTrackerModule.tsx:789–791`. Verified: no package test contains `Timer mode`, `计时模式`, `Single task`, `Multiple tasks` or `tt-mode`. TT02 native `verify-native.mjs:56` sets the raw key with `localStorage.setItem('xai_tt_mode','single')`, and the TT02 evidence folder has 0 selector matches. |
| F1: `prd.md:20`, the optional qualification | **Fixed** (now at `prd.md:19`) | It reads "sessionEditor/module/controller tests cover default-Single confirmation and raw-key Multi fixtures". `sessionController.test.ts:9` also uses the raw key for Multi and the default for Single. Accurate. |
| A1: unsourced `Owner: Jinlong Li` | **Removed** | `prd.md:1–5` has no Owner field. Searching `Owner\|Jinlong` across the five docs finds nothing. Lowercase "owner decision" (`prd.md:36`) is the contract's own generic wording (§3). |

## D1–D7 coverage (all rows reassessed)

### D1: consumer truth — PASS

Source:
- **Mode type:** `types.ts:5` defines `single | multi`.
- **Read:** `storage.ts:124–127` reads only the literal `multi` as Multi.
- **Write:** `storage.ts:137–141` writes the unscoped key and dispatches the package event.
- **Hook:** `storage.ts:330–334` builds on the shared hook at `215–251`, with its `isReady(scope)` guard.
- **Page:** `TimeTrackerModule.tsx:520` uses the hook. The EN/ZH selector is at `789–791`, and Start plus confirmation at `606–622`.
- **Public surface:** `index.ts:5–35` matches `api.md:7–15` exactly, including the 9 time helpers and the key/event/`createTimeTrackerEntry` exports. Mode read/write/hook and `commitTimeTrackerEntries` are not exported, as `api.md:26` says.
- **Widget:** `TimeTrackerWidget.tsx:10–35` uses the snapshot only (today total, `runningCount`, top category) and calls `goTo("timetrack")`. It has no mode or timer commands, as stated at `prd.md:32`, `design.md:51` and `api.md:52`.
- **Other consumers:** there are no `apps/` mode consumers. The only other references are `accountOwnership.ts:114` and `dataExport.test.ts:79,83`, which are bookkeeping.

Docs: no present-tense "unused mode" claim anywhere. `design.md:43` labels the old audit finding as historical.

### D2: accepted decisions — PASS

- **Single default:** `storage.ts:126`.
- **Start:** runs only on selected Today (`module:607`). In Single with running rows it opens the EN/ZH confirmation (`611`: "Switch running task? / 切换计时任务？", "End and start / 结束并开始"). The captured running JSON is rechecked inside the updater (`613`), which runs inside the lock (`storage.ts:280–289`). The update finishes the running rows and appends a new row at one `stamp` (`614–615`).
- **Multi:** `620–621` appends with no dialog.
- **Running vs paused:** `time.ts:128–139` (active means unfinished; running means an open last segment; paused means active but not running).
- **Controller check:** `storage.ts:291–294` rejects only newly running IDs that would leave more than one running in Single. The error text ("…before starting or resuming another") supports the Resume-refusal claim.
- **Resume:** `module:630–634` calls the controller directly, with no dialog.
- **Stale or missing lock:** `storage.ts:277–278, 281–290`.

Docs restate these accurately at `prd.md:19–22`, `design.md:45–47` and `api.md:24, 48`. Conversion and preference-write limits are labelled as observations or limits, not owner policy (`prd.md:36–38`, `design.md:49`, `api.md:50`). The device-mode vs account-content distinction is at `api.md:26` and `prd.md:38`.

### D3: PRD and page trace — PASS

- `prd.md` is a bounded slice. It says it does not complete GOV05 (`:9`).
- Requirement rows TT-M01–TT-D01 (`:17–26`) carry source, historical evidence and remaining-boundary columns.
- The page is checked statically, with zero edits and no browser/visual/a11y claim (`:30`).
- The EN/ZH strings quoted at `design.md:45` match `module:789–790`.
- No widget commands are invented.

### D4: chronology and status — PASS

- `dev_log.md:3–18` is the current iteration. It has `Status: PENDING_INDEPENDENT_VERIFICATION` and all the required fields: Workflow, Executor, Updated, Suggested Next and Work Log.
- The June READY_TO_SHIP, merge suggestion, commands and environment note are kept under a labelled historical heading (`:20–51`). They match before lines 238–265.
- Every READY_TO_SHIP mention in the candidate is negated, conditional or historical (`prd.md:52, 54`; `test.md:54`; `dev_log.md:18, 24`).

### D5: TT01/02/03/REL01 — PASS

Checked against the complete reports:

- **TT01** (`verification.md:12, 19–20, 36–45, 49, 53–58`): 11 original assertions kept separate from the 63 author tests; 20 Insights; five CSVs; Los Angeles and Lord Howe across four boundaries; the completed-row-count residual; no multi-segment, performance or cross-vendor claim.
- **TT02** (`report.md:3, 11–14, 18, 30, 39`): 5/11/78/11 assertions, overlapping and not additive; the 1,201,250 ms note-only fixture; 1440px viewport; no mobile or cross-vendor claim; the runner-resolution failure; no import/repair; multi-segment interval edit disabled.
- **TT03** (`review.md:3, 9, 19–22, 26`): 29,875 ms / 40,875 ms; 11 files / 82 tests; TT01 reuse; initial replay then added assertions; empty stdout was not the oracle.
- **REL01** (`review.md:3–9, 13, 17–19, 25–27, 31`): the `58f4076` idle failure, then `9149778`; six consumers; four-zone calculation-plus-Calendar evidence; 2 targeted assertions with 4 filtered out.

These are cited correctly at `prd.md:44–48` and `test.md:47–52`. The candidate never claims a fresh P0 rerun, and it says the TT02 package is not P0-identical (`prd.md:48`, `design.md:53`, `test.md:52`).

### D6: adjacent callers — PASS

DASH07, TT04–07, REL04, GOV04/05, cloud sync, account-wide isolation, quota, transactions, performance, recovery and release are bounded at:
- `prd.md:23, 38, 40`
- `design.md:51`
- `test.md:52`
- `api.md:52` (no exports, schema, widget control or runtime change)

### D7: integration and global obligations — PASS (documentary)

- The order is stated: verifier and actual cross-tool gate → separate status writer → Astra full chain → root reconciliation and inventory (`prd.md:52–54`, `test.md:54`, `dev_log.md:9, 18`).
- Codex actors and Claude availability are explicitly not vendor evidence.
- Clock and final-regression gates are neither run nor waived.
- The five-path scope and 30 protected inputs rest on root's preflight, not my own hashing.

## Findings (none blocking)

**N1 — dev_log omits the correction history.**
- `packages/plugin-web-time-tracker/docs/dev_log.md:7, 13–17` records only the original author pass.
- It does not mention:
  - the r1 BLOCKED verification (`68ac65f…`), or
  - the TT-08/DOC-CORRECT2 two-document correction, which actually produced the current `test.md` and `prd.md` bytes.
- The phrase "no candidate verification consumed" at `:17` is true only for the author pass it describes.
- Nothing stated is false, and the correction card was limited to exactly two docs. However, workflow.md treats dev_log as the handoff authority.
- **Recommendation:** when the separately registered status writer appends its entry, it should record this sequence: r1 BLOCKED → correction → r2 verdict. The reviewer does not repair this.

**N2 — loose wording in `prd.md:21` (TT-M03), "TT02 native session invariants".**
- TT02's 5/5 invariant assertions come from the original `cd2b699` unit reproduction (TT02 report line 11).
- The native 11/11 assertions separately cover replay, terminal finite duration and Single starts (line 14).
- The next row, `prd.md:22`, and `test.md:48` state this precisely, so nothing is misattributed overall. Tighten the wording if the PRD is edited again.

**N3 — informational: r1's A2 still stands.**
- `design.md:34`, `api.md:37` and `test.md:27` rewrite a stale TT01 sentence inside the dated "REL-01 amendment" section.
- The contract permits this, the new text is accurate, and the original wording is preserved in before lines 144, 188 and 228.

**Links:** every relative link resolves to an existing file. This includes the four reports, the contract, review and before, `web-local-time-contract/dev_log.md`, all six mapped test files, the widget, `index.ts`, `storage.ts`, `time.ts` and the module.

## Limitations and cost

- I computed no hashes and ran no git, diff or tests. Candidate binding, the patch hash and the TT02→P0 diff (only the module's day refresh plus `dayRollover`) are taken from the root preflight and the contract/review/before. I did not observe them myself.
- `TimeTrackerModule.tsx` was read only at lines 505–804. Other parts (editor and Insights internals) were not read line by line. `windowAccounting.test.ts` and `localDate.test.ts`: titles only.
- `AGENTS.md` and `CLAUDE.md` were not read in this session (see the Identity and method section). `workflow.md` was read by grep only.
- No screenshot, visual or native review.
- **Cost:** about $1.9 of the $12 cap, with 0 runtime and 0 children. My own wall time is not measured. This is verification iteration **2/3**. The r1 BLOCKED receipt and its raw logs stay immutable.
