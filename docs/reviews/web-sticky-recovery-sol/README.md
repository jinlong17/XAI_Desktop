# Sticky recovery Sol before oracles (CP-STICKY-01, batch 4)

**Verdict: FROZEN.** This directory freezes the Sol jsdom business oracles for the Settings Sticky Note all5 caller before any implementation. It implements nothing, changes no product source or product test, accepts nothing, does not authorize Terra, and closes no 312 item (SET-12, REL-05, QA-01, QA-03, QA-04, QA-09 and D2/REL/AI stay open).

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role mapping, isolated worktree |
| Requested fixed revision | `2023526` |
| Resolved fixed commit | `20235269749dad514833d76c27b958f694d0e4e9` |
| Docs base (detached HEAD) | `39152bb9f3a7aaa5a8a1aec90c6fc744efa634da`; `git diff --name-only 2023526 HEAD -- apps packages package.json pnpm-lock.yaml` is empty |
| Authority | `../web-sticky-recovery-contract/contract.md` sections 2, 3, 5, 7, 8, 10 item 1, 12 and 13; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` "本轮唯一任务" |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for both the dependency checkout and `git show 2023526:pnpm-lock.yaml` |
| Diagnostic iterations | 1 of 3 (`before1`). No fixture correction was needed. `original` ran once. |

## Files and SHA-256

| File | SHA-256 |
| --- | --- |
| `fixture.tsx` | `8cc5993a08b4ccee7ff557601d2fe9085cd7f6e041940d5eeba64b3b62e390ca` |
| `bytes.test.tsx` | `3774dfa9703578ae22fed8d862441481226b0bf28c704cab0cc20672dfdf5da9` |
| `fields.test.tsx` | `2bf42fb6ddbe83bf54c574926fc8a7272bb6cdf073c746efea93012bbbd401bb` |
| `queues.test.tsx` | `258aec9e5247f7c75c8a5b997683c7b5aa58c8a8b98117dc86df9ffa975c4983` |
| `continuity-export.test.tsx` | `78f140f50306b91ff22eb116bc587ce30b2cac57390dcefc948e1f3e44ce828d` |
| `verify-fixed.mjs` | `3fba4b3b181d13431db9fe632fd68b70a4e51c6357168ec29aa89dd7977864c3` |
| `bytes-before1-2023526.log` | `1feda5e5fa7ae3074c5e6422d36ae531a06a73a8ace8511fc1f33eb9865a778c` |
| `fields-before1-2023526.log` | `a5c0efaaf74a8a9b70ca52912a8fe55eea0c597defe736eaf99b4ffd35611fe1` |
| `queues-before1-2023526.log` | `cdaded162b4d22cc40360af8630079db47fb74dbf9717d7f64b5cbb5e6d2c111` |
| `continuity-export-before1-2023526.log` | `35362e6f0315e8ce595ff41f6acc81d79d37e4875657877cf245a85076e68f48` |
| `original-before1-2023526.log` | `1a2265bcb60a6849103d3e7639a62a6a705eb6e204dbae1078a30008b605b3bd` |

Every log header records the oracle and runner hashes in force when it ran. All five headers carry the same `oracle_sha256` line, and it equals the table above, so the logs were produced by exactly these files.

## Commands

Run from the repository root of this worktree:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 2023526 bytes before1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 2023526 fields before1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 2023526 queues before1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 2023526 continuity-export before1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 2023526 original before1
```

Fixed reruns use the unchanged files and a new suffix, for example `... verify-fixed.mjs <fixed-sha> <mode> fixed1`, with an `XAI_DEPS_ROOT` checkout whose lockfile matches that SHA.

## Runner guarantees (`verify-fixed.mjs`)

- Expands `git archive <resolved commit>` into a temporary directory and copies the five oracle files into `docs/reviews/web-sticky-recovery-sol/` inside it.
- Creates private `node_modules` directories of read-only links from `XAI_DEPS_ROOT` (default: repository root). Workspace `@repo` links and `.vite`/`.vite-temp`/`.cache` are never linked. Every workspace package export is aliased to the archive's own source, so product code can only come from the archive.
- Asserts `sha256(<deps root>/pnpm-lock.yaml) === sha256(git show <sha>:pnpm-lock.yaml)` before running.
- Writes `requested_revision`, `resolved_commit`, both lockfile hashes, the oracle hashes and the exit status into each log header.
- Refuses to overwrite an existing log. Verified: rerunning `bytes before1` exited 1 with `Evidence exists; use a new suffix` before archiving anything.
- Exits with the first nonzero Vitest status (`fields`, `queues` and `continuity-export` exited 1; `bytes` and `original` exited 0).
- Uses a Vite cache inside the temporary directory and deletes the directory afterwards. The dependency checkout's cache directories were not modified (their mtimes predate this run), and no `xai-sticky-sol-*` temporary directory remains.
- Filters only React's "not wrapped in act(...)" console warning; all other console output is kept.

## Before results at `2023526`

| Mode | Passed | Failed | Total | `PRECONDITION` lines | Exit |
| --- | --- | --- | --- | --- | --- |
| `bytes` | 13 | 0 | 13 | 0 | 0 |
| `fields` | 0 | 47 | 47 | 0 | 1 |
| `queues` | 0 | 27 | 27 | 0 | 1 |
| `continuity-export` | 3 | 19 | 22 | 0 | 1 |
| `original` (ST1–ST10) | 10 | 0 | 10 | 0 | 0 |

The Sol matrix has 109 cases: 16 PASS (3 fixture-validity, 10 positive controls and 3 invariants) and 93 correct business FAILs. None of the 93 failures is a precondition, selector or fixture failure. No log reports an unhandled error or rejection. Vitest groups identical errors under one message, so 47 `FAIL` headers in `fields` map to 36 distinct error lines; every header is accounted for.

## Hypotheses H1–H8

Line numbers refer to the named `before1` log.

| ID | Disposition | Evidence | Notes |
| --- | --- | --- | --- |
| H1 | **confirmed** | `fields` L372: `H1: color keeps displaying the latest choice after its write failed: expected 'sky' to be 'mint'`; same for font L395, pin_default L418, restore_size L444, grid_spacing L470. Also `queues` L117, L127, L137, L226, L239 and `continuity-export` L159, L180, L190, L213, L224, L234, L248, L261, L274, L285. | The display stays on the old value after a failed `setItem`; the faulted write never reached storage. |
| H2 | **confirmed** | `fields` L382, L405, L431, L457, L480: the throwing-read source alert is missing for all five fields while the default is displayed. L538 (pin_default `"TRUE"`, `"1"`, `""`) and L553 (restore_size `"yes"`, `"0"`, `" false"`): the default displays, but there is no alert. L623 and L728: no `Reload` control. | The first display assertion passes at 2023526; the failure is the missing alert or Reload. |
| H3 | **confirmed** | `fields` L496: color `purple`, `Sun`, `" sun"`, `""` leave no pressed swatch. L511: font `huge`, `tiny`, `""` display `small` instead of the default `large`. L523: grid_spacing `huge`, `tiny`, `""` leave no pressed card. L600: a valid edit silently overwrote the invalid `purple` source with `mint`. | DOM nuance: for an unmatched value React selects the first enabled option, so the select shows "Small" rather than "no matching option". The substance holds: the out-of-domain bytes reach the control, the wrong value is displayed, and there is no alert. |
| H4 | **confirmed** | `fields` L566: the injected `huge` was persisted verbatim. L576 and L588: the empty and unmatched DOM values persisted `""`. | |
| H5 | **confirmed** | `queues` L368 (pin_default) and L381 (restore_size): after two same-turn activations, the final state is the opposite of the latest intent. | |
| H6 | **confirmed** | `queues` L308, L318, L328, L338, L348: all five fields changed bytes while the test exclusively held `prefMutationLockName("xai_pref_sticky_<field>")`. L358: coalesced A→B→C wrote immediately. L394: a held double activation wrote immediately. `fields` L659; L754 (the write never consulted a missing Web Lock capability); L760 (the write never requested the per-key lock). `continuity-export` L149, L170. | |
| H7 | **confirmed (pane layer)** | `fields` L766: `H7: StickyPaneContent registers the optional departure guard: expected null not to be null`. | Sol covers the pane half: no guard registration and no `beforeunload` warning. The sidebar, AppRail, Back, Forward, relative navigation and sign-out legs belong to the parent host baseline (batch 5, contract section 12) and were not run here. |
| H8 | **confirmed** | `fields` L702: no Saved status after a genuine success. L779: no `Retry` after an uncertain write. L741: no `Discard all changes`. L623 and L728: no `Reload`. `queues` L147, L180, L213, L252, L285. | |

No hypothesis was refuted. Each confirmed failure is a requirement that still binds the fixed product, and the same unchanged assertions must PASS there.

## Positive controls PASS at `2023526`

- `bytes` L18–L27:
  - registry codec, default, schema version and category; device ownership; `device-recovery`/`retain`/`retain-on-device` lifecycle; unscoped physical key and per-key lock name for all five fields;
  - section 10 item 1: all 25 domain values (13 + 4 + 2 + 2 + 4) written through the UI with exact bytes at the unscoped device key, no removal and no scoped copy;
  - absent mount with registry defaults and zero set/remove attempts across rerenders and EN/ZH switches;
  - valid non-default mount, including the literal `random` sentinel, with zero writes;
  - a choice equal to the default is stored, never removed;
  - a standalone `render({lang})` without a guard renders and edits;
  - clean state: no recovery controls, no block, no warning, no Saved claim.
- `continuity-export` L21, L22, L33 (invariants):
  - edits across A→B→locked→A touch no account key, marker or lifecycle lock;
  - an unrelated held account lifecycle lock does not delay a device edit;
  - with no draft there is no Export control and no empty download.
- `original` L15–L24: ST1–ST10, 10/10.

Clean navigation and clean sign-out positive controls belong to the parent host baseline (batch 5).

## Fixture validity proof

- **Storage injector.** FIXTURE case at `bytes` L15 proves:
  - get/set/remove attempts are logged in call order before delegation;
  - a faulted `setItem` is logged with `threw` and never reaches storage;
  - `afterSet` read faults stay unarmed until their write and then fire once;
  - a disarmed fault stops firing;
  - total denial fires for all three operations;
  - only `localStorage` is counted.

  In the business cases, every `fired(...)` precondition held: zero `PRECONDITION` lines across all 109 cases.
- **Web Lock fixture.** FIXTURE case at `bytes` L16 proves:
  - grants are asynchronous;
  - a held name keeps exactly one queued product waiter, which is granted only after release, while an independent name is granted at once;
  - shared holders coexist while an exclusive request waits;
  - deny rejects with a lock error and is recorded;
  - the missing capability is explicit;
  - no unsupported request shape was seen.

  In every held-lock business case, the precondition "the test exclusively holds <name>" held while the 2023526 product wrote anyway (H6). Teardown turns any unsupported lock request into a `PRECONDITION` failure; none occurred, so no accidental `lock-unavailable` is possible.
- **accountScope.** FIXTURE case at `bytes` L17 drives the real controller through A→B→locked→A and a same-account generation change. The epoch advances each time, the Sticky keys stay unscoped, and an account-owned control key is scoped under the real A scope. The same case proves the host registry keeps the coordinator's token semantics, and that the download harness observes URL creation, append, click and revoke and reads Blob contents.

## Oracle inventory by contract gate

| Gate (section 13) | Oracle file and cases |
| --- | --- |
| All5 ordinary fields | `fields.test.tsx` (47):<ul><li>latest-choice failure and Retry, per field (5);</li><li>throwing read with Reload-only, per field (5);</li><li>16 out-of-domain sources;</li><li>3 malformed font DOM inputs;</li><li>a valid edit over an invalid source and over an unavailable source;</li><li>same-turn Reload refusal;</li><li>all five unresolved, with a targeted Retry and Discard all;</li><li>a conflict plus an unrelated quota failure;</li><li>string/boolean failure in both directions;</li><li>targeted zero-write Discard;</li><li>truthful Saved (2 cases);</li><li>source-repair isolation;</li><li>Discard all visiting only drafts;</li><li>missing and rejected Web Lock;</li><li>guard and `beforeunload`;</li><li>H8 controls;</li><li>EN/ZH wording.</li></ul>Plus the `bytes.test.tsx` positive controls. |
| Same-field queue attribution | `queues.test.tsx` (27):<ul><li>Q1–Q9 for both the palette and Pin by Default: predecessor success with latest failure; predecessor failure with the latest queued; repeated predecessor failure; pending Retry inert; equal-value successor; uncertainty settled with one write across a denied read and a denied lock; external replacement; external removal; uncertain write plus restored original bytes; new work surviving a discard;</li><li>held per-key lock for all five fields;</li><li>coalesced A→B→C;</li><li>same-turn double activation for both switches;</li><li>double activation during a held lock.</li></ul> |
| Device continuity and export | `continuity-export.test.tsx` (22):<ul><li>A→B→locked→A with a real held device lock: old guards refuse before and after rerender; fresh B, locked and A guards guard and export;</li><li>old inline Retry, Discard, Discard all and Export callbacks refuse before rerender;</li><li>a same-account epoch change with a fresh export and a zero-write discard;</li><li>two invariants;</li><li>memory-only export under total denial with attempt counters: sparse, all five, dialog, held, exclusions;</li><li>no empty download;</li><li>Blob, URL, append and click setup failures;</li><li>epoch change and unmount at the Blob, URL and append stages;</li><li>unmount cleanup.</li></ul> |
| Section 10 item 1 (Sol layer) | `bytes.test.tsx` PC section 10.1, one case per field, 25 values. |

## Precondition policy

- A `PRECONDITION:` error marks a fixture or selector failure, never a product failure. Preconditions cover:
  - control found, through the stable selectors only: `[data-color-id]`, `[data-spacing-id]`, the font select's `aria-label`, and the switch names;
  - seeded bytes present;
  - the injector and the lock fixture installed;
  - an armed fault observed through the counter, or a test-held lock confirmed.
- Recovery UI is found only by role and contract section 5 EN/ZH names. Messages are matched as visible text.
- The lock-capability faults are the one exception. Whether the product consults `navigator.locks`, or requests the per-key lock at all, is itself the H6 requirement. Those checks are therefore business assertions tagged `H6`, not preconditions.
- No case uses private calls. The only malformed value comes from the specified malformed DOM input on the font select.

## Contract/source mismatches

None blocks freezing. Observations:

1. H3 DOM nuance, described in the H3 row above.
2. H7 bundles pane and host behavior. Sol covers the pane layer only, as section 12 assigns host navigation and sign-out to the parent host baseline.
3. The section 5 wording table has no conflict-specific message. The conflict oracles therefore assert recovery controls, preserved bytes, the guard and the absence of Saved, but no message text.

## Retained limitations

- **jsdom only.**
  - The exclusive asynchronous lock fixture does not reproduce browser lock-manager timing.
  - Downloads are observed, not saved; native disk JSON for the section 8 shapes belongs to the parent and native batches.
  - jsdom has no `BeforeUnloadEvent`. A warning is detected as a canceled cancelable event (`preventDefault`), matching the accepted callers. A handler that only assigns a non-empty `returnValue` string would not be detected.
  - Keyboard, trusted input, responsive hit-tests and 44 px targets (section 9) are out of Sol scope.
- **Export assertions not yet reached.** At 2023526 no failed draft can be retained, so the export cases first fail on H1 or H8. Their deeper assertions (zero-attempt counters, single URL create and revoke, anchor removal, whole-envelope equality, epoch and unmount cancellation) will first execute on the fixed product. Their harness paths are proven by the FIXTURE cases.
- **Coupling to the shared engine.** Some oracles encode the contract's requirement to preserve the shared queue, coalescing and baseline semantics as observable attempt sequences:
  - `["coral","navy"]` for coalescing;
  - `["true","false"]` for two operations;
  - exactly one write for an uncertainty;
  - zero sibling attempts.

  Under section 12, any later fixture correction must use a new suffix and must not weaken a business assertion.
- **Accepted alternative renderings.** Where the contract says "or", both renderings pass:
  - Reload may be hidden, or may refuse, while a draft exists;
  - a pending Retry may be removed, or may be inert;
  - a held operation may finish, or keep its own recovery, after A→B→locked→A.
- **Guard registration timing.** The guard is required to exist, be current and block once an actual draft exists. Registration at a clean mount is not required.
- **Unhandled rejections** are observed through the Vitest worker's Node `unhandledRejection` event.
- **Dependency reuse.** Dependencies come read-only from `XAI_DEPS_ROOT`. The lockfile gate is a consistency check only.
- **Pre-run check.** Before `before1`, a static esbuild syntax transform of the oracle files executed no product or oracle code.
