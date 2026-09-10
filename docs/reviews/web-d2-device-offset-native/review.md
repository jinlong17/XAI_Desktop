# Device offset migration: native browser baseline

Parent immutable archive `cbbbd8a`, actual DashHeader with project CSS, real Chrome/CDP pointer input and native Web Locks. Synthetic accounts use complete markers; the device position remains an unscoped physical key. [Before log](native-cbbbd8a.log).

All three expected failures corroborate the independent component baseline: mount writes absent offset to `0`; a real 40px drag persists `40` while its physical-key exclusive lock is held; after account A→B the mounted header refuses to persist the same device drag and stays `0`.

The [runner](verify-native.mjs) and [fixture](native.tsx) preserve these assertions for a fixed after revision. Successful drag cases will additionally reload and verify the saved device position. No successful after/reload or whole-process-reopen result is claimed for this failing baseline. CSS and real input are loaded to exercise the actual drag, not for a new aesthetic acceptance.

The fixture uses an isolated profile, creates only synthetic state, and cleans it after recording results. Account-note data and device position have separate ownership; this migration does not reopen accepted account-content behavior.
