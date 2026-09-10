# Device offset migration: native browser baseline

Parent immutable archive `cbbbd8a`, actual DashHeader with project CSS, real Chrome/CDP pointer input and native Web Locks. Synthetic accounts use complete markers; the device position remains an unscoped physical key. [Before log](native-cbbbd8a.log).

All three expected failures corroborate the independent component baseline: mount writes absent offset to `0`; a real 40px drag persists `40` while its physical-key exclusive lock is held; after account A→B the mounted header refuses to persist the same device drag and stays `0`.

The [runner](verify-native.mjs) and [fixture](native.tsx) preserve these assertions for a fixed after revision. Successful drag cases will additionally reload and verify the saved device position. No successful after/reload or whole-process-reopen result is claimed for this failing baseline. CSS and real input are loaded to exercise the actual drag, not for a new aesthetic acceptance.

The fixture uses an isolated profile, creates only synthetic state, and cleans it after recording results. Account-note data and device position have separate ownership; this migration does not reopen accepted account-content behavior.

## Fixed Dv1 integration at 76edb0c

The unchanged native three now PASS at 76edb0c. Both drag cases preserve their saved device value after Page.reload. [After log](native-76edb0c.log). The original independent component three also PASS: [log](../web-d2-device-offset-independent/independent-after-76edb0c.log). These are fixed archives, not live worktree runs.

The separate account-note native four and whole-process saved reopen four remain PASS at the same product revision, PID68533→68601: [raw integration](../web-d2-dashboard-note-native/native-76edb0c-offset-integration.json). Its static legacy scope string says device protocol unchanged; this describes no exercised device assertion, and is not a valid source-diff claim for Dv1. The account probe's future scope text is corrected accordingly. The device tests here establish page reload, not whole-process persistence of an unsaved device draft.

Actual device-only export still downloads the expected JSON with latest offset40 and unchanged account note: [log](../web-d2-dashboard-device-export-native/native-76edb0c.log). Persistent offset is now null because absent mount no longer seeds0; the denied drag leaves that original absence unchanged. This expected protocol delta does not weaken the downloaded payload or account-data assertions.

Full Dv1 contract remains subject to Astra independent acceptance. No Dv2 or numbered-item closure.

## Expanded native gesture checks at 68ea7a3

The five-case probe at 68ea7a3 passes: original mount/lock/account controls, unfinished dirty gesture unload cancellation, and an earlier40 save followed by a still-active70 gesture with resize. The newer gesture remains70 and commits70 after release. Each of the four successful saved-position cases passes Page.reload. [After log](native-68ea7a3.log).

An attempted expanded76 before run produced original3 PASS and gesture-unload FAIL in tool stdout, then did not complete the overlapping-gestures check. The owned Node71387/Chrome71446 handles remained live; a second CDP connection returned “No dialog is showing”, while Runtime.evaluate timed out. The parent terminated only these owned processes after confirming the unfinished diagnostic and cleaned their isolated temporary directory. Root cause is undetermined; this is not an overlap PASS or an additional product defect. No final expanded-before file was emitted, and the original committed three-case native-76edb0c.log remains unchanged. The original Astra component overlap failure retains its separate valid evidence.

The runner now requires a new suffix if an evidence filename already exists, preventing accidental replacement. Source-feedback contract checks remain under Astra review; five native passes do not close the fullDv1 slice.
