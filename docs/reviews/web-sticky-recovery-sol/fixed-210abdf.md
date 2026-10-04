# Sticky recovery Sol fixed reruns at `210abdf` (CP-STICKY-01, batch 7)

**Verdict: PASS (independent rerun only).** The frozen Sol oracles ran unchanged against an immutable `git archive` of the fixed candidate `210abdf`. All 109 Sol cases pass, and the archive's own ST1–ST10 pass 10/10. Every one of the 93 correct before FAILs is now PASS. The 16 Sol fixture, positive-control and invariant cases stay PASS. No case still fails, and no case newly fails.

This receipt is independent verification only. It is **not acceptance**. It implements and fixes nothing and modifies no existing file. It closes no 312 item: SET-12, REL-05, QA-01, QA-03, QA-04, QA-09 and D2/REL/AI stay open. The Chrome host/native batch, the final regression and the independent final acceptance still remain (control plane, "后续顺序").

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol verifier role for batch 7, in an isolated worktree on a detached HEAD. It did not author the contract, the oracles, the host baseline or the implementation |
| Requested / resolved fixed revision | `210abdf` / `210abdf77562660372c47086db02bd21e870deb5`, as logged in every header |
| Fixed commit | Terra, `fix(settings): recover Sticky edits and departures`, parent `37a4d33` |
| Requested / resolved before revision | `2023526` / `20235269749dad514833d76c27b958f694d0e4e9`, from the frozen `before1` logs |
| Runner checkout | Detached `8db7d306dcd84c2090113019e1390635e05604ed`. The worktree was clean before the runs, and `git merge-base --is-ancestor 210abdf HEAD` succeeds |
| Authority | `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`, "本轮唯一任务" (batch 7) and the CP-STICKY-01 "允许修改文件" row; `README.md` in this directory; `../web-sticky-recovery-contract/contract.md` §10–§13 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for both `XAI_DEPS_ROOT` and `git show 210abdf:pnpm-lock.yaml`, the same as at `2023526` |
| Runtime | Node `v24.16.0`, Vitest `v3.2.7`, jsdom |
| Iterations | Each mode ran exactly once with suffix `fixed1`. No environment failure occurred, so there is no `fixed2` |

## Commands

Run from the repository root of the worktree:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 210abdf bytes fixed1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 210abdf fields fixed1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 210abdf queues fixed1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 210abdf continuity-export fixed1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 210abdf original fixed1
```

Console summaries; the runner exit status was 0 each time:

```text
bytes: exit=0  Test Files  1 passed (1) |       Tests  13 passed (13)
fields: exit=0  Test Files  1 passed (1) |       Tests  47 passed (47)
queues: exit=0  Test Files  1 passed (1) |       Tests  27 passed (27)
continuity-export: exit=0  Test Files  1 passed (1) |       Tests  22 passed (22)
original: exit=0  Test Files  1 passed (1) |       Tests  10 passed (10)
```

## Frozen integrity (checked before any run)

Every recomputed SHA-256 equals the value in `README.md`, "Files and SHA-256":

| File | SHA-256 (README = recomputed) | Result |
| --- | --- | --- |
| `fixture.tsx` | `8cc5993a08b4ccee7ff557601d2fe9085cd7f6e041940d5eeba64b3b62e390ca` | OK |
| `bytes.test.tsx` | `3774dfa9703578ae22fed8d862441481226b0bf28c704cab0cc20672dfdf5da9` | OK |
| `fields.test.tsx` | `2bf42fb6ddbe83bf54c574926fc8a7272bb6cdf073c746efea93012bbbd401bb` | OK |
| `queues.test.tsx` | `258aec9e5247f7c75c8a5b997683c7b5aa58c8a8b98117dc86df9ffa975c4983` | OK |
| `continuity-export.test.tsx` | `78f140f50306b91ff22eb116bc587ce30b2cac57390dcefc948e1f3e44ce828d` | OK |
| `verify-fixed.mjs` | `3fba4b3b181d13431db9fe632fd68b70a4e51c6357168ec29aa89dd7977864c3` | OK |
| `bytes-before1-2023526.log` | `1feda5e5fa7ae3074c5e6422d36ae531a06a73a8ace8511fc1f33eb9865a778c` | OK |
| `fields-before1-2023526.log` | `a5c0efaaf74a8a9b70ca52912a8fe55eea0c597defe736eaf99b4ffd35611fe1` | OK |
| `queues-before1-2023526.log` | `cdaded162b4d22cc40360af8630079db47fb74dbf9717d7f64b5cbb5e6d2c111` | OK |
| `continuity-export-before1-2023526.log` | `35362e6f0315e8ce595ff41f6acc81d79d37e4875657877cf245a85076e68f48` | OK |
| `original-before1-2023526.log` | `1a2265bcb60a6849103d3e7639a62a6a705eb6e204dbae1078a30008b605b3bd` | OK |

- The frozen files are byte-identical to their freeze commits:
  - `git diff --name-only 4e21e6d HEAD -- docs/reviews/web-sticky-recovery-sol` is empty;
  - `git diff --name-only 07784c4 HEAD` is empty for this directory, `../web-sticky-recovery-independent/` and `../web-sticky-recovery-contract/`;
  - the contract is unchanged since `70ff46a`.
- Every fixed log header carries the line `oracle_sha256 fixture.tsx=8cc5993a… … verify-fixed.mjs=3fba4b3b…`, identical to the table. The logs were therefore produced by exactly these files.
- The host oracle and runner hashes are checked in `../web-sticky-recovery-independent/fixed-210abdf.md`.

## New logs

| Log | SHA-256 | Lines | Header | Case lines | Summary | `stderr` |
| --- | --- | --- | --- | --- | --- | --- |
| `bytes-fixed1-210abdf.log` | `a1cb353a27fca13b8ee23a32bdf1305538fca2e3e62543d2d345d75532899cd3` | 35 | L1–L10 | L15–L27 | L29–L30 | L35, empty |
| `fields-fixed1-210abdf.log` | `56498c90014023dcddb38dc2c608cf844838e1597b3919aec51d8eb53dbf22e7` | 69 | L1–L10 | L15–L61 | L63–L64 | L69, empty |
| `queues-fixed1-210abdf.log` | `ee6d205a1d9a0aa047ebbfe7db935443b853f25bc74b7708fbc9bd9ddfdbd303` | 49 | L1–L10 | L15–L41 | L43–L44 | L49, empty |
| `continuity-export-fixed1-210abdf.log` | `979ee23efe6ea6d353805860fa0071f604540f2c817738b9f74baa7a8454e443` | 44 | L1–L10 | L15–L36 | L38–L39 | L44, empty |
| `original-fixed1-210abdf.log` | `580030e74938072810c21c3bc7f5b11fb228a91099ff540f93e596bf0aa871ca` | 32 | L1–L10 | L15–L24 | L26–L27 | L32, empty |

Each header records `requested_revision=210abdf`, `resolved_commit=210abdf77562660372c47086db02bd21e870deb5`, the mode and suffix, both lockfile hashes (`df05f2dd…`), the oracle hashes and `exit=0`.

## Results at `210abdf`, before → fixed

| Mode | Before P/F/T (exit) | Fixed P/F/T (exit) | FAIL→PASS | PASS→PASS | Still failing | Newly failing | `PRECONDITION:` lines |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bytes` | 13/0/13 (0) | 13/0/13 (0) | 0 | 13 | 0 | 0 | 0 |
| `fields` | 0/47/47 (1) | 47/0/47 (0) | 47 | 0 | 0 | 0 | 0 |
| `queues` | 0/27/27 (1) | 27/0/27 (0) | 27 | 0 | 0 | 0 | 0 |
| `continuity-export` | 3/19/22 (1) | 22/0/22 (0) | 19 | 3 | 0 | 0 | 0 |
| **Sol total** | **16/93/109** | **109/0/109** | **93** | **16** | **0** | **0** | **0** |
| `original` (ST1–ST10) | 10/0/10 (0) | 10/0/10 (0) | 0 | 10 | 0 | 0 | 0 |

- **Pairing.** Cases were paired by exact Vitest title, with the file prefix removed. Each mode has the same title set at both revisions: no duplicate, missing or new title.
- **Non-passing cases at `210abdf`: none.** There is therefore no first assertion message to report.
- **Positive controls stay PASS.** The 16 Sol PASS→PASS cases are:
  - 3 fixture-validity cases (`bytes` L15–L17 in both logs);
  - 10 positive controls (`bytes` L18–L27 in both logs), including the §10 item 1 cases for all 25 domain values with exact bytes;
  - 3 invariants (`continuity-export` before L21, L22, L33; fixed L18, L19, L25).

  ST1–ST10 also stay PASS (`original` L15–L24 in both logs).
- **Hypotheses.** The before first-assertion tags of the 93 FAIL→PASS cases are: H1 32, H6 20, H2 14, H3 10, H8 8, H4 3, H5 2, H7 1, H3/§5.2 1, H1/H2 1, and ZH source alert (§5) 1.
  - A tag names only the first assertion that failed at `2023526`.
  - A fixed PASS means every assertion in the case passed. That includes the deeper assertions that `README.md` lists as first executing on the fixed product: zero-attempt export counters, a single URL create and revoke, anchor removal, whole-envelope equality, and epoch and unmount cancellation.

### Clean-log checks

- **Preconditions.** All five fixed logs have zero `PRECONDITION:` lines.
  - The oracles' `fired(...)` helper is itself a `pre(...)` (`fixture.tsx` L197–L199). It has 16 call sites in `fields`, 9 in `queues` and 5 in `continuity-export`.
  - Zero precondition lines therefore means every guarded fault was armed and observed before the business assertions ran, and every held-lock precondition held.
- **Errors.** No unhandled error or rejection is reported, no line contains `Error`, and Vitest exited 0 in every mode.
- **Console output.** Every `---- stderr ----` section is empty, and stdout has no console blocks.
  - At `2023526`, the logs carried the legacy storage writer's warnings: `quota exceeded` 21/10/21 and `decode failed` 15/0/2 in `fields`/`queues`/`continuity-export`.
  - The fixed pane binds all five fields through `usePrefAutosaveAsync` and makes no `setPref`, `getPref`, `usePref(` or raw Storage call (see the D1 section). The legacy messages are therefore expected to be absent.
  - Their absence is not evidence of a missing fault. The preconditions above establish that each fault fired.

### Per-case before → fixed table

Line numbers refer to `<mode>-before1-2023526.log` and `<mode>-fixed1-210abdf.log`. The last column gives the hypothesis tag of the first failing assertion at `2023526`, or the role of a case that passed there.

#### `bytes`

| # | Case (exact Vitest title, file prefix removed) | Before `before1-2023526` | Fixed `fixed1-210abdf` | Before first-assertion tag |
| --- | --- | --- | --- | --- |
| 1 | FIXTURE storage injector logs every get/set/remove attempt before delegating; faults fire, count, arm and disarm | PASS (L15) | PASS (L15) | fixture validity |
| 2 | FIXTURE Web Lock fixture is exclusive, asynchronous and observable; deny and missing capability are explicit | PASS (L16) | PASS (L16) | fixture validity |
| 3 | FIXTURE real accountScope transitions keep Sticky keys unscoped; the host registry and download harness observe | PASS (L17) | PASS (L17) | fixture validity |
| 4 | PC §2/§10 registry codec, default, schema, category, device ownership, lifecycle and unscoped key for all five | PASS (L18) | PASS (L18) | positive control |
| 5 | PC §10.1 'color' > PC §10.1 color: every domain value persists exact codec bytes at the unscoped device key | PASS (L19) | PASS (L19) | positive control |
| 6 | PC §10.1 'font' > PC §10.1 font: every domain value persists exact codec bytes at the unscoped device key | PASS (L20) | PASS (L20) | positive control |
| 7 | PC §10.1 'pin_default' > PC §10.1 pin_default: every domain value persists exact codec bytes at the unscoped device key | PASS (L21) | PASS (L21) | positive control |
| 8 | PC §10.1 'restore_size' > PC §10.1 restore_size: every domain value persists exact codec bytes at the unscoped device key | PASS (L22) | PASS (L22) | positive control |
| 9 | PC §10.1 'grid_spacing' > PC §10.1 grid_spacing: every domain value persists exact codec bytes at the unscoped device key | PASS (L23) | PASS (L23) | positive control |
| 10 | PC §5.1 absent sources: registry defaults displayed, zero set/remove attempts on mount and rerenders, clean state | PASS (L24) | PASS (L24) | positive control |
| 11 | PC §5.1 valid non-default sources, including the random sentinel, display exactly with zero set/remove attempts | PASS (L25) | PASS (L25) | positive control |
| 12 | PC §5.4 choosing a value equal to the registry default stores it and never converts it to removal | PASS (L26) | PASS (L26) | positive control |
| 13 | PC §9 a standalone render({lang}) without a guard still renders and edits | PASS (L27) | PASS (L27) | positive control |

#### `fields`

| # | Case (exact Vitest title, file prefix removed) | Before `before1-2023526` | Fixed `fixed1-210abdf` | Before first-assertion tag |
| --- | --- | --- | --- | --- |
| 1 | 'color' > H1 color: a failed write keeps the latest choice with failed feedback, Retry, Discard, guard and warning; Retry saves exact bytes | FAIL (L15) | PASS (L15) | H1 |
| 2 | 'color' > H2 color: a throwing read shows the default with a Reload-only source alert; Reload repairs with zero writes and no Saved | FAIL (L17) | PASS (L16) | H2 |
| 3 | 'font' > H1 font: a failed write keeps the latest choice with failed feedback, Retry, Discard, guard and warning; Retry saves exact bytes | FAIL (L19) | PASS (L17) | H1 |
| 4 | 'font' > H2 font: a throwing read shows the default with a Reload-only source alert; Reload repairs with zero writes and no Saved | FAIL (L21) | PASS (L18) | H2 |
| 5 | 'pin_default' > H1 pin_default: a failed write keeps the latest choice with failed feedback, Retry, Discard, guard and warning; Retry saves exact bytes | FAIL (L23) | PASS (L19) | H1 |
| 6 | 'pin_default' > H2 pin_default: a throwing read shows the default with a Reload-only source alert; Reload repairs with zero writes and no Saved | FAIL (L25) | PASS (L20) | H2 |
| 7 | 'restore_size' > H1 restore_size: a failed write keeps the latest choice with failed feedback, Retry, Discard, guard and warning; Retry saves exact bytes | FAIL (L27) | PASS (L21) | H1 |
| 8 | 'restore_size' > H2 restore_size: a throwing read shows the default with a Reload-only source alert; Reload repairs with zero writes and no Saved | FAIL (L29) | PASS (L22) | H2 |
| 9 | 'grid_spacing' > H1 grid_spacing: a failed write keeps the latest choice with failed feedback, Retry, Discard, guard and warning; Retry saves exact bytes | FAIL (L31) | PASS (L23) | H1 |
| 10 | 'grid_spacing' > H2 grid_spacing: a throwing read shows the default with a Reload-only source alert; Reload repairs with zero writes and no Saved | FAIL (L33) | PASS (L24) | H2 |
| 11 | H2/H3 color="purple": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L35) | PASS (L25) | H3 |
| 12 | H2/H3 color="Sun": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L37) | PASS (L26) | H3 |
| 13 | H2/H3 color=" sun": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L39) | PASS (L27) | H3 |
| 14 | H2/H3 color="": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L41) | PASS (L28) | H3 |
| 15 | H2/H3 font="huge": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L43) | PASS (L29) | H3 |
| 16 | H2/H3 font="tiny": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L45) | PASS (L30) | H3 |
| 17 | H2/H3 font="": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L47) | PASS (L31) | H3 |
| 18 | H2/H3 grid_spacing="huge": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L49) | PASS (L32) | H3 |
| 19 | H2/H3 grid_spacing="tiny": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L51) | PASS (L33) | H3 |
| 20 | H2/H3 grid_spacing="": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L53) | PASS (L34) | H3 |
| 21 | H2/H3 pin_default="TRUE": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L55) | PASS (L35) | H2 |
| 22 | H2/H3 pin_default="1": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L57) | PASS (L36) | H2 |
| 23 | H2/H3 pin_default="": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L59) | PASS (L37) | H2 |
| 24 | H2/H3 restore_size="yes": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L61) | PASS (L38) | H2 |
| 25 | H2/H3 restore_size="0": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L63) | PASS (L39) | H2 |
| 26 | H2/H3 restore_size=" false": out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them | FAIL (L65) | PASS (L40) | H2 |
| 27 | H4 font injected option value: the prior value stays with an independent input error; zero writes; sibling work untouched | FAIL (L67) | PASS (L41) | H4 |
| 28 | H4 font empty option value: the prior value stays with an independent input error; zero writes; sibling work untouched | FAIL (L69) | PASS (L42) | H4 |
| 29 | H4 font unmatched option value: the prior value stays with an independent input error; zero writes; sibling work untouched | FAIL (L71) | PASS (L43) | H4 |
| 30 | H3 §5.2 a valid choice over invalid color bytes is a failed draft that never overwrites them; Discard is zero-write and returns to Reload-only | FAIL (L73) | PASS (L44) | H3/§5.2 |
| 31 | H2 §5.2 a valid toggle over an unavailable pin source is a failed draft; bytes untouched; Discard returns to Reload-only | FAIL (L75) | PASS (L45) | H1/H2 |
| 32 | §5.8 Reload refuses at invocation time to erase the same field's actual draft | FAIL (L77) | PASS (L46) | H2 |
| 33 | §5.7 all five unresolved at once; a targeted Retry never touches siblings; Discard all is zero-write and visits only drafts | FAIL (L79) | PASS (L47) | H1 |
| 34 | §5.7 a color conflict coexists with an unrelated font quota failure; each settles independently and Retry never overwrites the conflict | FAIL (L81) | PASS (L48) | H6 |
| 35 | §5.7 a failed string field and a successful boolean settle independently | FAIL (L83) | PASS (L49) | H1 |
| 36 | §5.7 a failed boolean field and a successful string settle independently | FAIL (L85) | PASS (L50) | H1 |
| 37 | §5.8 a targeted Discard is zero-write, rereads only its field and leaves sibling work exportable | FAIL (L87) | PASS (L51) | H1 |
| 38 | H8 §5.7 Saved appears only after a genuine latest success with no pending work or input error | FAIL (L89) | PASS (L52) | H8 |
| 39 | H2 §5.7 a sibling source error suppresses Saved even after a successful edit | FAIL (L91) | PASS (L53) | H2 |
| 40 | §5.7/§5.8 a sibling source-only Reload repair clears its alert without claiming Saved or acknowledging failed work | FAIL (L93) | PASS (L54) | H2 |
| 41 | §5.8 Discard all visits only actual drafts: source-only and input-error siblings are untouched | FAIL (L95) | PASS (L55) | H8 |
| 42 | H6 §5.5 a missing Web Lock capability keeps the latest color with failed feedback and no write; Retry after restoration saves | FAIL (L97) | PASS (L56) | H6 |
| 43 | H6 §5.5 a rejected Web Lock capability keeps the latest color with failed feedback and no write; Retry after restoration saves | FAIL (L99) | PASS (L57) | H6 |
| 44 | H7 a failed choice registers a blocking Sticky Note guard and a beforeunload warning; source-only and input-error-only states never warn | FAIL (L101) | PASS (L58) | H7 |
| 45 | H8 an uncertain write exposes Retry, Discard, Export and Discard all instead of a silent success | FAIL (L103) | PASS (L59) | H8 |
| 46 | §5 ZH wording: source alert, failed feedback, per-field and pane actions, input error, Saved, pending and guard label | FAIL (L105) | PASS (L60) | ZH source alert (§5) |
| 47 | §5 ZH export failure status | FAIL (L107) | PASS (L61) | H1 |

#### `queues`

| # | Case (exact Vitest title, file prefix removed) | Before `before1-2023526` | Fixed `fixed1-210abdf` | Before first-assertion tag |
| --- | --- | --- | --- | --- |
| 1 | 'palette' > Q1 palette: the predecessor succeeds while the latest fails; Retry settles only the latest | FAIL (L15) | PASS (L15) | H6 |
| 2 | 'palette' > Q2 palette: a failed predecessor blocks the queued latest; repeated predecessor failure; Retry advances the predecessor without acknowledging the latest | FAIL (L17) | PASS (L16) | H1 |
| 3 | 'palette' > Q3 palette: a Retry while the field is pending is inert | FAIL (L19) | PASS (L17) | H1 |
| 4 | 'palette' > Q4 palette: an equal-value successor after intervening input stays its own operation | FAIL (L21) | PASS (L18) | H1 |
| 5 | 'palette' > Q5 palette: uncertainty keeps its grant across a denied read and a denied lock and reconciles with exactly one total write | FAIL (L23) | PASS (L19) | H8 |
| 6 | 'palette' > Q6 palette: an external replacement stays a preserved conflict; repeated Retry never overwrites; Discard rereads with zero writes | FAIL (L25) | PASS (L20) | H6 |
| 7 | 'palette' > Q7 palette: an external removal stays a preserved conflict; Retry never recreates the key; Discard shows the default | FAIL (L27) | PASS (L21) | H6 |
| 8 | 'palette' > Q8 palette: an uncertain write whose original bytes are externally restored stays a conflict; a distinct new choice is a new operation | FAIL (L29) | PASS (L22) | H8 |
| 9 | 'palette' > Q9 palette: new work after a discard survives; the discarded held operation never writes | FAIL (L31) | PASS (L23) | H6 |
| 10 | 'switch' > Q1 switch: the predecessor succeeds while the latest fails; Retry settles only the latest | FAIL (L33) | PASS (L24) | H6 |
| 11 | 'switch' > Q2 switch: a failed predecessor blocks the queued latest; repeated predecessor failure; Retry advances the predecessor without acknowledging the latest | FAIL (L35) | PASS (L25) | H8 |
| 12 | 'switch' > Q3 switch: a Retry while the field is pending is inert | FAIL (L37) | PASS (L26) | H1 |
| 13 | 'switch' > Q4 switch: an equal-value successor after intervening input stays its own operation | FAIL (L39) | PASS (L27) | H1 |
| 14 | 'switch' > Q5 switch: uncertainty keeps its grant across a denied read and a denied lock and reconciles with exactly one total write | FAIL (L41) | PASS (L28) | H8 |
| 15 | 'switch' > Q6 switch: an external replacement stays a preserved conflict; repeated Retry never overwrites; Discard rereads with zero writes | FAIL (L43) | PASS (L29) | H6 |
| 16 | 'switch' > Q7 switch: an external removal stays a preserved conflict; Retry never recreates the key; Discard shows the default | FAIL (L45) | PASS (L30) | H6 |
| 17 | 'switch' > Q8 switch: an uncertain write whose original bytes are externally restored stays a conflict; a distinct new choice is a new operation | FAIL (L47) | PASS (L31) | H8 |
| 18 | 'switch' > Q9 switch: new work after a discard survives; the discarded held operation never writes | FAIL (L49) | PASS (L32) | H6 |
| 19 | H6 'color' > H6 color: a held per-key lock serializes the write while the latest choice shows immediately and controls stay enabled | FAIL (L51) | PASS (L33) | H6 |
| 20 | H6 'font' > H6 font: a held per-key lock serializes the write while the latest choice shows immediately and controls stay enabled | FAIL (L53) | PASS (L34) | H6 |
| 21 | H6 'pin_default' > H6 pin_default: a held per-key lock serializes the write while the latest choice shows immediately and controls stay enabled | FAIL (L55) | PASS (L35) | H6 |
| 22 | H6 'restore_size' > H6 restore_size: a held per-key lock serializes the write while the latest choice shows immediately and controls stay enabled | FAIL (L57) | PASS (L36) | H6 |
| 23 | H6 'grid_spacing' > H6 grid_spacing: a held per-key lock serializes the write while the latest choice shows immediately and controls stay enabled | FAIL (L59) | PASS (L37) | H6 |
| 24 | H6 coalesced palette choices A→B→C during a held lock settle only the latest | FAIL (L61) | PASS (L38) | H6 |
| 25 | H5 'pin_default': two same-turn activations invert the latest intent and return to the original through two operations | FAIL (L63) | PASS (L39) | H5 |
| 26 | H5 'restore_size': two same-turn activations invert the latest intent and return to the original through two operations | FAIL (L65) | PASS (L40) | H5 |
| 27 | H5/H6 two Pin by Default activations during a held lock return to the original through two operations | FAIL (L67) | PASS (L41) | H6 |

#### `continuity-export`

| # | Case (exact Vitest title, file prefix removed) | Before `before1-2023526` | Fixed `fixed1-210abdf` | Before first-assertion tag |
| --- | --- | --- | --- | --- |
| 1 | §7 A→B→locked→A: a held device operation survives; old guards refuse before and after rerender; fresh guards export | FAIL (L15) | PASS (L15) | H6 |
| 2 | §7 old inline Retry, Discard, Discard all and Export callbacks refuse before rerender; device work survives under fresh permission | FAIL (L17) | PASS (L16) | H1 |
| 3 | §7 same-account epoch change with a held device lock: old guard refuses; fresh guard exports and discards with zero writes | FAIL (L19) | PASS (L17) | H6 |
| 4 | INV §7 edits across A→B→locked→A never touch account keys, markers or lifecycle locks | PASS (L21) | PASS (L18) | invariant |
| 5 | INV §7 an unrelated held account lifecycle lock never delays a device edit | PASS (L22) | PASS (L19) | invariant |
| 6 | §8 a sparse one-field export is memory-only under total storage denial | FAIL (L23) | PASS (L20) | H1 |
| 7 | §8 the all-five export (three strings, two booleans) equals the contract envelope under total storage denial | FAIL (L25) | PASS (L21) | H1 |
| 8 | §8 a dialog export through the registered guard is memory-only and changes nothing | FAIL (L27) | PASS (L22) | H1 |
| 9 | §8 an export while one operation is held behind a real lock includes it and releases, saves or retries nothing | FAIL (L29) | PASS (L23) | H1 |
| 10 | §8 the export excludes saved, default, source-only and input-error-only fields | FAIL (L31) | PASS (L24) | H1 |
| 11 | INV §8 without an actual draft there is no Export control and no empty download | PASS (L33) | PASS (L25) | invariant |
| 12 | §8 a blob setup failure shows the localized export error, keeps drafts and guard, and cleans up | FAIL (L34) | PASS (L26) | H1 |
| 13 | §8 a url setup failure shows the localized export error, keeps drafts and guard, and cleans up | FAIL (L36) | PASS (L27) | H1 |
| 14 | §8 a append setup failure shows the localized export error, keeps drafts and guard, and cleans up | FAIL (L38) | PASS (L28) | H1 |
| 15 | §8 a click setup failure shows the localized export error, keeps drafts and guard, and cleans up | FAIL (L40) | PASS (L29) | H1 |
| 16 | §8 an epoch change during blob cancels the click and cleans up; fresh permission exports | FAIL (L42) | PASS (L30) | H1 |
| 17 | §8 an epoch change during url cancels the click and cleans up; fresh permission exports | FAIL (L44) | PASS (L31) | H1 |
| 18 | §8 an epoch change during append cancels the click and cleans up; fresh permission exports | FAIL (L46) | PASS (L32) | H1 |
| 19 | §8 an unmount during blob cancels the click and cleans up | FAIL (L48) | PASS (L33) | H1 |
| 20 | §8 an unmount during url cancels the click and cleans up | FAIL (L50) | PASS (L34) | H1 |
| 21 | §8 an unmount during append cancels the click and cleans up | FAIL (L52) | PASS (L35) | H1 |
| 22 | §7/§9 unmount removes the guard and the beforeunload listener and detaches old callbacks | FAIL (L54) | PASS (L36) | H1 |

#### `original`

| # | Case (exact Vitest title, file prefix removed) | Before `before1-2023526` | Fixed `fixed1-210abdf` | Before first-assertion tag |
| --- | --- | --- | --- | --- |
| 1 | stickyPane > ST1: renders without error | PASS (L15) | PASS (L15) | positive control (ST) |
| 2 | stickyPane > ST2: 13 color swatch buttons rendered | PASS (L16) | PASS (L16) | positive control (ST) |
| 3 | stickyPane > ST3: 12 non-random swatches use var(--sticky-note-color-&lt;id>) background | PASS (L17) | PASS (L17) | positive control (ST) |
| 4 | stickyPane > ST4: random swatch uses conic-gradient | PASS (L18) | PASS (L18) | positive control (ST) |
| 5 | stickyPane > ST5: no hex literals in swatch inline styles | PASS (L19) | PASS (L19) | positive control (ST) |
| 6 | stickyPane > ST6: clicking a swatch persists xai_pref_sticky_color | PASS (L20) | PASS (L20) | positive control (ST) |
| 7 | stickyPane > ST7: 4 spacing buttons rendered | PASS (L21) | PASS (L21) | positive control (ST) |
| 8 | stickyPane > ST8: clicking a spacing button persists xai_pref_sticky_grid_spacing | PASS (L22) | PASS (L22) | positive control (ST) |
| 9 | stickyPane > ST9: bilingual — ZH font size options | PASS (L23) | PASS (L23) | positive control (ST) |
| 10 | stickyPane > ST10: pane id, icon, i18nKey are correct | PASS (L24) | PASS (L24) | positive control (ST) |

## Boundary (contract §11 and §10 item 2)

- **Changed product files.** `git diff --name-status 2023526 210abdf -- apps packages package.json pnpm-lock.yaml` lists exactly the eight §11 files, all under `packages/plugin-web-settings-rest/`:
  - `M docs/api.md`, `M docs/test.md`;
  - `M src/__tests__/stickyPane.test.tsx`, `A src/__tests__/stickyPaneRecovery.test.tsx`;
  - `M src/internal/StickyColorPalette.tsx`, `M src/internal/localI18n.ts`;
  - `M src/panes/stickyPane.tsx`, `M src/styles.css`.
- **Terra commit.** `git diff 37a4d33 210abdf` touches the same eight files (+955/−48). No new `src/internal/` helper was added.
- **Per-file §11 limits**, read from the diff:
  - `localI18n.ts`: +15/−0. It adds exactly 11 `sticky.*` keys (`retry`, `discard`, `reload`, `exportDraft`, `discardAll`, `saving`, `notSaved`, `unavailable`, `invalid`, `saved`, `exportFailed`) and changes no other key.
  - `styles.css`: +42/−0. Every new selector is a `.sticky-recovery-*` selector, including one `@media (min-width: 768px)` block over the same selectors.
  - `StickyColorPalette.tsx`: +2/−1. It only exports the existing 13-id list and adds a comment.
- **§10 item 2.** `git diff 2023526 210abdf -- packages/plugin-web-storage packages/plugin-web-settings-shell packages/xai-web-dashboard-widgets packages/xai-web-cmdk apps package.json pnpm-lock.yaml` is empty. Settings-rest `src/types.ts` and `src/index.ts` are also unchanged.

**Result: PASS.**

## D1 search at `210abdf` (contract §4 D1 and §10 item 3)

`git grep` over `apps/` and `packages/`, run at both revisions:

1. **Literal and suffix forms.** Pattern: `xai_pref_sticky|pref_sticky|sticky_(color|font|pin_default|restore_size|grid_spacing)|_pin_default|_restore_size|_grid_spacing|"pin_default"|"restore_size"|"grid_spacing"`.
   - Per-file hit counts are identical at `2023526` and `210abdf`, with two exceptions:
     - `src/panes/stickyPane.tsx` goes from 6 to 18 hits: the pane's own field tables and its five `usePrefAutosaveAsync("xai_pref_sticky_<field>", { validate })` bindings (L86–L90);
     - the new Sticky-local test `src/__tests__/stickyPaneRecovery.test.tsx` has 5 hits, its key constants.
   - Every other hit is unchanged and is not a production reader or writer:
     - the storage `registry.ts` (10) and `accountOwnership.ts` (5) tables, and two storage tests;
     - Settings-rest `docs/{api,design,test}.md` and the original Sticky test;
     - the dashboard-widgets `docs/dev_log.md`, and the comment at `stickiesStore/types.ts:25`.
2. **Raw-storage and legacy-setter forms.** Pattern: `localStorage|sessionStorage|getItem|setItem|removeItem|setPref|removePref|getPref|usePref(|meta.reset|.reset(|resetAllPrefs`. The four changed production files (`stickyPane.tsx`, `StickyColorPalette.tsx`, `localI18n.ts`, `styles.css`) have zero hits.
3. **Dynamic prefix constructions** (`"xai_pref_"`, `` `xai_pref_ ``, `xai_pref_${`, `"sticky_"`): the same 67 files, with identical per-file counts at both revisions.
4. **Rust, JSON and TOML** files under `apps/` and `packages/` contain no Sticky key form. Their only `sticky` mentions are the description strings in the Settings-rest `package.json` and `manifest.json`.

No file outside the eight §11 files changed. The table-driven lifecycle, export and reset code noted in contract §2 is therefore byte-identical to `2023526`.

**Result: PASS.** No new reader or writer of the five keys exists outside `stickyPane.tsx`.

## Runner behaviour observed

- **Archive.** Each run expanded `git archive 210abdf77562660372c47086db02bd21e870deb5` into `$TMPDIR/xai-sticky-sol-*` and deleted it afterwards. No `xai-sticky-*` directory remains.
- **Dependency checkout.** It was only read. The mtimes of its existing `.vite`, `.vite-temp` and `.cache` directories (root, `apps/web` and Settings-rest) were identical before and after all six runs of this batch.
- **Working tree.** After the runs, `git status` showed only the new logs.
- **Overwrite refusal** was not re-exercised in this batch, so that each mode had exactly one invocation. Batch 4 verified it.

## Observation: the `original` mode runs the archive's own test file

`original` executes `packages/plugin-web-settings-rest/src/__tests__/stickyPane.test.tsx` from the archive. At `210abdf` it therefore runs Terra's edited copy (+15/−6), which is a §11 file:
- a file-level `beforeEach`/`afterEach` pair installs `createSmartListsLockManager()`, from the unchanged `smartListsLockFixture.ts`, as `navigator.locks` and removes it afterwards;
- ST6 and ST8 become `async`. Their expectations are unchanged (`"mint"` and `"xl"`, read through `getPref`) and are now wrapped in `await waitFor(...)`.

All ten titles are unchanged, so the by-title mapping is exact. The control plane's batch-6 note leaves to the final reviewer whether this edit stays within §11 ("ST6 and ST8 may only await real async completion"). This receipt reports only that the archive's ST1–ST10 pass.

## Limitations

- **jsdom only.**
  - The exclusive lock fixture does not reproduce browser lock-manager timing.
  - Input is synthetic. There is no trusted input, hit-testing, keyboard, focus or responsive check.
  - jsdom has no `BeforeUnloadEvent`, so a warning is detected as a canceled cancelable event.
  - Downloads are observed through the harness, not saved to disk.
- **Chrome/native evidence belongs to the next batch (batch 8).** This covers:
  - contract §8: native disk JSON for every required shape, and one native setup failure;
  - contract §9: trusted input for all 25 values, the hit-tested sidebar, guarded Forward with key identity, same-field exactly-once release with history counters;
  - a native held lock and native uncertainty, a second-document conflict, and a new-document reload with zero mount writes;
  - EN/ZH at five widths, 44 px targets, keyboard checks and screenshots.
- **Not run here:** §10 items 4–5 (the dashboard-widgets tests and storage check-types from the fixed archive), and the §13 final-regression rows.
- **Dependencies** are reused read-only from `XAI_DEPS_ROOT`. The lockfile gate is a consistency check only.
- **Accepted alternative renderings** (`README.md`) still apply. A PASS does not record which permitted rendering the product chose.
- **Shared-engine coupling** (`README.md`): the encoded attempt sequences, for example `["coral","navy"]`, passed as written, so no adjudication was needed.

**Status.** This is independent verification only, not acceptance. No product, oracle, runner, before log, contract, ledger or control-plane file was modified, and no 312 item is closed.
