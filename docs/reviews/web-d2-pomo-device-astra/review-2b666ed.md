# Dv2 Pomodoro device preferences — independent before/after review

Astra, Web, 2026-09-09. [9f1b20a Dv2 contract](../web-d2-device-autosave-contract/contract.md), all six enumerated device preferences. Product reviewed: **2b666eda345268efe9e0697bfc1fc8dc4474dc63**, with fixed legacy baseline **9424081**. **Not accepted yet: two recovery UI defects remain.** These affect the caller, not the accepted engine, timer protocol or Dv1.

## Execution/provenance

[Runner](verify-fixed.mjs) imports product exclusively from immutable git archives; runtime dependencies are reused, while all workspace aliases resolve to archived source. The actual PomodoroModule, real jsdom Storage and name/mode-aware locks run. No product overlay or authored PASS substitutes for these executions. Physical fixture seeding/fault injection/external replacement are explicit, never a user-save replacement.

| Independent execution | Evidence |
| --- | --- |
| Same final 24 preference cases at legacy 9424081 | **13 FAIL / 11 PASS**, [before](independent-astra-full-before-9424081.log) |
| Same 24 cases at 2b666ed | **2 FAIL / 22 PASS**, [after](independent-astra-full-contract-2b666ed.log) |
| Strict actual running/reset and real completion controls | **2/2 PASS at both revisions**, [before](completion-astra-before-9424081.log), [after](completion-astra-after-2b666ed.log) |
| Fixed 2b666ed original package | **18 files / 145 tests PASS**, [log](package-astra-after-2b666ed.log) |
| Fixed 2b666ed types | **PASS**, [log](independent-2b666ed-pomodoro-types.log) |

The author's 146 count includes later test-only 6ff1a8d; the fixed product archive here has 145. Neither count is represented as the other. The earlier 21-case exploratory legacy log and duplicate full 24-case after log remain intact; only the identical final 24-case pair is compared above. Fixtures: [business matrix](contracts.test.tsx), [strict timer controls](completion.test.tsx), [setup/real actions](fixture.tsx). No conditional `if(history)` assertions: the completion control requires exactly one durable record and one event.

Parent existing evidence stays independently attributed: component before 47e625b and native baselines 6265892/6981111 identify absent mount and early unlocked writers, including clean cross-document projection. Parent **dfe0fce** at 2b666ed records original native two and expanded native five PASS, plus their separately scoped whole-Chrome final checkpoints (PID 80779→80879 and 80794→80899); actual disk six-choice export preserves the previous behavior. Those do not replace six individual caller checks, partial recovery or running timer proof, and are not executions by Astra.

## P2 — ordinary conflict has no explicit recovery choice

Actual fixture: keep a valid theme source, hold its physical key lock, choose blue, externally replace it with violet and deliver a storage event, then release the lock. The engine correctly preserves external violet and the UI retains the local blue with an unsaved alert. **There is no Reload/Discard action**. Retry cannot and must not overwrite the external source, leaving no in-page explicit conflict recovery path.

Source: `PomodoroModule.tsx:223` computes `preferenceSourceProblem` only for invalid/unavailable sources; line 485 renders Reload only for that boolean. A normal `meta.status === "conflict"` with a valid source does not qualify. This violates the existing 9f explicit reload/discard requirement.

Repair: expose a clear explicit reload/discard choice for the conflicted binding(s), adopting the external value only after that user choice. Do not turn Retry into unconditional overwrite or implicit rebase. Scope of a plural action must be truthful about which bindings it discards.

## P1 — repairing one invalid source discards another preference's latest failed draft

Actual fixture: sound starts at JSON null; theme starts at coral. Inject theme setItem quota, select blue then violet. Violet remains selected and physical theme remains coral. Externally repair only sound to JSON `"bell"`, then click Reload preferences. Sound correctly becomes bell, but **theme is reset to coral, violet disappears, and the preference alert/Retry disappears**. There was no request to discard theme, no theme commit, and no exported recovery. The test's two assertions prove lost selection and hidden recovery; the physical bytes had not changed.

Source: line 485 calls `meta.reload()` on **all six hooks**, regardless of which source needed recovery. Reload disposes that hook's draft/error/token; it is not a harmless refresh for an unrelated dirty/failed binding.

Minimal repair ownership for both failures: **`packages/plugin-web-pomodoro/src/PomodoroModule.tsx` recovery action eligibility/target selection, its focused tests and narrow existing labels**. Target the selected invalid/unavailable/conflicted preferences; preserve unrelated pending, quota-failed, uncertain and newer local intents. Keep their original hook Retry/token and group unsaved state until those intents actually succeed. Do not modify shared hooks/engine or timer controllers. A targeted group action may remain a group action if it only includes the explicitly recoverable bindings; it must not reload every unrelated preference.

## Whole Dv2 scope matrix at this fixed revision

| Requirement | Result / evidence scope |
| --- | --- |
| Six actual keys, JSON representation, UI action writes | Six parameterized controls each independently wait for their own physical lock, retain current UI and preserve idle account bytes; all PASS. Preset/custom/style/theme/sound/muted actions use actual DOM handlers. |
| Six independent write faults and Retry | Each key tested with its own physical setItem fault: old bytes/current choice/error retained, actual Retry writes intended JSON and clears only resolved state. All PASS. |
| Domain and unavailable source | Invalid inputs for every key retain exact raw with zero default writes and show preference recovery. Unavailable theme preserves original raw. Both PASS. Numeric compatibility still uses finite-number validator and presentation clamp; enums and boolean are typed. |
| No ordinary mount seed | Parent original/native evidence passes; no legacy autosave write effect remains. User preset/minutes choices and actual committed completion are explicit producers. |
| Multiple keys / partial success | Minutes failure with successful preset=`custom`, followed by external preset change, retries minutes only and preserves external sibling. PASS. No multi-key atomicity claim. |
| Cross-document behavior | Clean theme projects without writing; dirty theme preserves its draft and refuses external replacement, including Retry. PASS. Explicit conflict recovery is the first defect above. |
| Async/rejection/uncertainty | Native lock Promise rejection becomes visible retryable failure without fallback write; unchanged readback-uncertain retry verifies one physical write. PASS. The public hook returns typed results; these real rejection paths produce no unhandled Vitest rejection. No arbitrary replacement hook mock is used. |
| Device ownership and ordering | Pending latest theme survives A→B→locked; two rapid mute clicks finish at latest false. PASS. No account key retargeting. |
| Export and current-page behavior | Actual Blob has version/kind and all latest six values, including failed violet. Download setup failure preserves selection/error. PASS. Mixed-source reload recovery is the second defect above. |
| Active timer/reset separation | Real Start produces a running active session; appearance/mute changes keep its account raw and history unchanged. Preset remains disabled; timer Reset removes active through its existing action and preserves all six device bytes. PASS. |
| True completion producer | Real one-minute timer writes exactly one completed history record with the original session ID and elapsed=duration=60000, and emits exactly one completion event. Fault only the next `break-5` preset write: session remains durable, timer advances locally to Short Break and preference error stays visible. Retry saves `break-5` without another history write/event. PASS before and after. |
| Original product/fixture boundaries | Package regressions pass; the native-compatible test lock signature was added without a product arity fallback. Timer source/history/controller are not modified by this product diff. |

The retained account-scope timer lock/controller is an existing protocol: its preservation here does not make it D2-account-coordinated or close timer/lifecycle work. Native input/reopen, component matrices and fake-clock true completion are separate layers.

## Minimal next acceptance

Keep the 24 preference assertions and two strict timer controls; resolve both failures without losing the 22 passing preference controls. Rerun fixed package/types and parent original/native scope after repair. The existing `ordinary theme conflict…` and `reloading repaired invalid sound…` tests are the exact repair oracles. Preserve old logs with fresh suffixes. No new global preference reset, provider, account history migration or unrelated timer-domain change is requested.

This task writes only its own review fixtures, logs and report, with no push or ledger edit. Dv2 remains open on this version. Dv1, account-note and shared async-pref acceptance stand; full D2/AI-02/REL-05 remain open.
