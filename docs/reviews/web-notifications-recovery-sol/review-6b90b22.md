# Sol independent Notifications caller verification — `6b90b22`

## Current verdict

`6b90b220459facdc80a42e4de6c4073c2b57f1eb` is **not accepted** by this matrix: **28 PASS / 1 correct FAIL** across 29 archived tests.

- original product NF1–NF9: 9/9 PASS
- Sol core: 11/11 PASS
- Sol recovery: 3/3 PASS
- Sol operations/owner: 2/2 PASS
- Sol boundaries: 3/4 PASS

The sole remaining failure is a caller-owned malformed-input attribution defect. The pane stores only one `inputError: FieldId | null`. After valid native quiet controls are proven, an invalid start value (`7:00`) creates the Start error, but a subsequent invalid end value (`24:00`) replaces it, so the Start feedback disappears. `putDraft` also calls `setInputError(null)`, allowing any unrelated valid edit, such as Sound, to clear every unresolved format error. The unchanged public oracle requires both field-labelled errors to remain until each corresponding field receives valid input and forbids global Saved while either field error remains.

Evidence: `boundaries-after2-6b90b22.log` is 1 FAIL / 3 PASS. The failure is the missing text `Quiet hours start has an invalid format.` after the second malformed field event. The three passing boundaries independently establish targeted hidden-time discard with one-field read and zero writes, external sound conflict preservation, and duplicate pending Retry producing one authorized write.

## Frozen before attribution

The final unchanged baseline archive at `d9d9fdde211e19fc258f97e7184a8ee77338d80c` records **10 PASS / 19 correct FAIL**:

- original NF1–NF9: 9/9 PASS
- healthy public sound/time domain control: 1/1 PASS
- eight latest-choice failure/recovery cases: 8 FAIL
- strict malformed native values and hidden invalid/unavailable time source health: 2 FAIL
- hidden-time recovery/export, all-eight pending export and uncertainty recovery: 3 FAIL
- predecessor-failure queue recovery and A→B→locked device ownership: 2 FAIL
- expanded malformed-field, targeted discard, external conflict and pending Retry boundaries: 4 FAIL

These failures use the real Notifications controls, storage codecs, shared async hook in the fixed archive, physical device-key locks and public departure capability. They do not mock the product hook or inject private caller state. The old pane's original behavior and normal native controls pass first, so the red results are product recovery failures rather than broken selectors or malformed setup.

## Coverage established at the first fixed revision

The 28 passing fixed tests cover all eight fields' latest-choice failure and per-field Retry, all five Sound values, strict `HH:mm` boundary/midnight/overnight/equal times, invalid native input refusal, hidden invalid/unavailable source Reload, quiet=false retention and exact hidden-time export, targeted Retry/discard, exact all-eight device-only pending export, one-write uncertainty through temporary denied Retry, both queue-failure directions, external conflict, duplicate pending Retry and device draft continuity through A→B→locked with stale/fresh permission separation.

The immutable runner archives the requested Git revision, reconstructs package aliases from that archive and copies only this Sol verifier source into the temporary tree. The authoritative logs are the `before3-d9d9fdd` and `after2-6b90b22` sets. Earlier exploratory logs are preserved but are not used for these counts.

Some passing modes emit React `act(...)` warnings from late asynchronous state updates. Business assertions and exit status remain authoritative, but those logs are warning-bearing rather than terminal-clean.

This report is a bounded caller checkpoint. Parent-owned actual Settings/Shell/native/types and Astra-owned supplemental boundaries/final source reconciliation remain separate evidence. It does not accept Notifications, notification delivery/permission/scheduling, all Settings writers, full312, D2, REL, or release readiness. The malformed-field oracle must rerun unchanged against a new fixed product SHA before Sol can issue a bounded all-green caller result.
