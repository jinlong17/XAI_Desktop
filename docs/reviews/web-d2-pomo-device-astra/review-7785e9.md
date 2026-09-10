# Dv2 final independent acceptance — 7785e9

Astra, Web, 2026-09-09. **Accept the complete six-device-preference Dv2 functional slice defined by [9f1b20a](../web-d2-device-autosave-contract/contract.md)** at product **7785e9227a7888d2db02fc3db457d55ce0727bc8**. This closes the two caller recovery findings in [the retained 2b666ed review](review-2b666ed.md); its original failed logs and complete scope matrix remain intact. This is not full D2, AI-02, REL-05, Pomodoro visual acceptance or account-timer lifecycle acceptance.

## Independent final execution

All executions below were run by Astra against immutable archives of this exact product revision, with unchanged independent business assertions. Runtime dependencies are reused; workspace source aliases point into the archive. No product overlay, shared dirty source, author execution or parent execution is counted as Astra's run.

| Fixed final execution | Result |
| --- | --- |
| Original complete preference matrix | [24/24 PASS](independent-astra-final-7785e9.log) |
| Actual running/reset and one-minute completion controls | [2/2 PASS](completion-astra-final-7785e9.log) |
| Original package, fixed package setup | [18 files / 146 tests PASS](package-astra-final-7785e9.log) |
| Fixed package typecheck | [PASS](independent-7785e9-pomodoro-types.log) |

Reproduction: `node docs/reviews/web-d2-pomo-device-astra/verify-fixed.mjs 7785e9 independent <fresh-suffix>`; substitute `completion` or `package` for those layers. Typecheck: `python3 docs/reviews/web-d2-pomo-device-astra/run-types.py 7785e9`. Do not overwrite retained evidence. The final identical 24 cases compare legacy 9424081 **13 FAIL / 11 PASS**, initial 2b666ed **2 FAIL / 22 PASS**, and final **24 PASS**. The earlier exploratory 21-case legacy execution is a different matrix, not a denominator to combine with these results.

## Repair review and full contract result

The narrow product diff adds two filtered recovery groups in `PomodoroModule.tsx`. The conflict action is available for bindings whose status is conflict; the source action reloads only invalid/unavailable bindings. Retry and its original token behavior are unchanged. No shared engine, timer controller, timer record or multi-key protocol is changed by this repair.

The former ordinary-theme conflict now has an explicit discard action: external violet remains physical while local blue is retained until the user discards, then violet is projected and recovery clears. The former invalid-sound recovery now projects repaired bell while preserving the unrelated latest quota-failed violet theme and its Retry; restoring writes and clicking Retry commits violet without changing bell. Both exact original failure assertions pass, along with all previous controls.

The complete prior scope matrix is satisfied: six independently exercised UI controls and six per-key fault/retry paths; absent mount without preference seeding; registered JSON/domain compatibility and unavailable-source refusal; independent partial success and sibling-preserving retry; clean external projection and dirty conflict refusal with explicit recovery; caught lock Promise rejection; one-write readback-uncertain retry; device A→B→locked independence; latest rapid toggles; and actual six-choice Blob export plus download setup failure retention. No new preference Reset button is required: existing timer Reset remains a timer action and preserves all device preference bytes.

The strict timer controls remain non-vacuous: actual Start produces a running record; appearance/mute changes preserve its raw record/history, with preset controls disabled. Actual one-minute completion produces exactly one completed history record with the original session ID, elapsed=duration=60000 and exactly one completion event. A fault only in next-preset storage leaves that completion durable and the preference draft recoverable; actual Retry saves the next preset without a second timer history write or completion event. These prove existing timer behavior survives this caller migration, not that timer account writers implement the remaining D2 lifecycle protocol.

## Separately attributed browser evidence

Parent **6f4140c** supplies fixed real-Chrome evidence, not an Astra browser execution:

- [Targeted source and conflict recovery](../web-d2-pomo-recovery-native/review.md): unchanged scenarios correctly fail at 2b666ed and pass at 7785e9. Explicit read/discard actions perform zero application writes; unrelated latest violet survives sound repair and actual Retry succeeds.
- [Expanded five native controls](../web-d2-pomo-controls-native/review.md): all pass at 7785e9, followed by observed Chrome exit **84552→84626** and the same final six-key physical checkpoint. This is not six independently saved browser choices or durable unsaved violet after process exit.
- [Actual disk JSON export and quota Retry](../web-d2-pomo-export-native/review.md): preserved at this final revision. The downloaded complete latest six-choice snapshot is checked on disk.

The earlier component/native before layers remain attributed to their own fixed revisions. Native recovery/export fixtures did not include the Pomodoro entry stylesheet; their behavioral input/raw/download assertions stand, while visual/style acceptance is separate. Parent is correcting the CSS fixture attribution and investigating the fully styled narrow recovery layout; those visual observations are not represented as a storage defect or a passing visual gate here.

## Remaining boundaries

Dv1, account note and the shared async-pref/engine accepted slices remain accepted. All seven direct legacy autosave device callers in 9f have now received their respective bounded functional acceptance. This does not close remaining synchronous `usePref` writers, raw/scoped account writers, secret/provider coordination, old-client activation/drain, account-timer lifecycle migration, or broad release numbers. Multi-key preference changes may partially commit and recover independently; no cross-key atomicity or persistent unsaved-draft guarantee is claimed.

Only this independent report and new-suffix raw logs are committed. No product, parent evidence or total ledger is changed; no push.
