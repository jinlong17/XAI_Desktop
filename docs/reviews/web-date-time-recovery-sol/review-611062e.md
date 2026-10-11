# Sol independent Date & Time caller verification — `611062e`

## Verdict and exact attribution

The preserved immutable-archive run at `611062ee2eb80727440c731c62a09626ca87d8eb` exits zero in all five modes. The current execution is **46/46**, not 45/45:

- committed product pane suite: 7/7 (`DT1`–`DT7`)
- Sol-owned core caller assertions: 5/5
- Sol-owned recovery/owner/export assertions: 5/5
- Sol-owned operation/conflict/targeted-recovery assertions: 8/8
- Sol-owned expanded field/source/lock/Retry/export/disposal assertions: 21/21

The historical 45/45 result at `96c4915` consisted of the then-current six product assertions plus the same 39 Sol-owned assertions. `DT7`, added by the `611062e` product commit, is the forty-sixth current test; it proves that an actual same-field draft does not expose the source Reload button. It is product-authored regression evidence and is not relabelled as a Sol-authored assertion.

`verify-fixed.mjs` archives the requested Git revision, reconstructs package aliases from that archive, and copies the committed, clean Sol fixture and four verifier files into the temporary archive. The five preserved logs identify the complete fixed SHA and `exit=0`; another run would add no newer product coverage, so this review does not manufacture a duplicate execution.

## What the 39 Sol assertions establish

The unchanged Sol matrix exercises all five public controls and physical device keys. It covers normal and absent-source mount behavior, invalid input, invalid/unavailable sources, every field's rejected write and targeted Retry, all three start-week values, both boolean directions, five simultaneous held key locks, both partial-success directions, lock rejection, source-error editing, exact sparse and all-five export, all-discard and targeted discard, owner/locked/disposal capability boundaries, uncertainty one-write verification, changed-external conflict, and export setup/click failures.

The current run also regresses the post-`96c4915` implementation against those cases. The shared `b9ae2d9` empty-token presence correction has a dedicated storage oracle outside this Sol caller matrix; these logs exercise only normal generated uncertainty tokens and must not be cited as the empty-token proof.

## Coverage boundary discovered after the original 45

The 39 Sol assertions do not contain Astra's two later exact same-field sequences:

1. Sol's repeated-Retry test invokes Retry while the predecessor is pending **before** creating the newer choice. It does not test two queued choices followed by Retry, where a predecessor success could previously clear a later failed draft.
2. Sol's source-only repair test reloads one field while a different field has a failed draft. It does not test a same-field source Reload capability surviving into a newer actual draft and then acknowledging repaired source bytes as that draft.

Source inspection at `611062e` finds the narrow caller protections for both gaps: Retry is admitted only after the matching latest draft has settled failure and is not already retrying; source Reload checks that the field has no current draft, and the recovery UI hides Reload whenever that draft is active. `DT7` covers current visibility, but the complete four-sequence public acceptance and stale-action boundary remain Astra-owned evidence and are not claimed by this Sol report.

The passing recovery, advanced, and boundary logs contain React `act(...)` warnings (10, 9, and 10 warning instances across 3, 4, and 3 named tests respectively). Their awaited business assertions still pass with exit zero, but the output is warning-bearing rather than terminal-clean.

## Reused regression and acceptance boundary

The Header Sol matrix remains exactly attributed to `96c4915`: 42/42 (component 5, export/owner 5, operations 4, account-note 11, device-offset 13, source feedback 3, reload/pending 1). The later Date & Time caller changes do not touch Header. The `b9ae2d9` shared delta changes only the explicitly supplied empty-token presence edge; normal generated Header tokens are non-empty, so this review does not relabel or rerun the historical Header execution.

This is a bounded independent caller PASS at `611062e`. Parent-owned real Settings host/native/types evidence and Astra-owned caller-four/shared-engine acceptance remain separate. This report does not accept the complete Date & Time contract by itself and does not close full312, REL, D2, all Settings writers, calendar propagation, or production release readiness.
