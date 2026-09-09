# REL-05 POMO preference independent native verification

Scope: independently verify parent-authored commit `394efad` for preset, custom minutes, display style, theme, sound and muted preference persistence. No product changes were made by this verifier. Earlier timer implementation/verification is not counted as independent evidence here.

## Fixed-source method

Run `node docs/reviews/web-pomodoro-prefs-independent/verify-native-prefs.mjs <revision>`. The runner uses `git show <revision>:<path>` for every loaded repository packages/apps source file and stylesheet; dependencies come from installed node_modules. Both runs froze 42 source files. This prevents concurrent shared-worktree changes from contaminating the before/after comparison. Actual PomodoroModule is rendered in native headless Chrome with a fresh temporary profile, native localStorage and native Web Locks, on a loopback HTTP server with synthetic account A. No production endpoint, real profile or real account is used.

Native Storage.prototype.setItem throws QuotaExceededError only for the six resolved preference keys. The business oracle requires visible preference failure, retry/export actions, unchanged persisted original bytes, latest draft values, and no timer corruption. A failed business oracle exits nonzero; reproduction is not called a fix PASS.

## Results

- Before `45a2a06`, Chrome PID60563: **FAIL**, as expected. All six quota paths executed; original bytes remained. Visible failure, retry and export were all absent.
- After `394efad`, Chrome PID61117: **PASS** on the identical probe. All original assertions pass. While storage remains denied, change minutes to61, display to digital, theme to violet and sound to digital; actual exported Blob contains `{preset:"custom",customMinutes:61,displayStyle:"digital",theme:"violet",sound:"digital",muted:true}`. Restore native writes and retry; all six persisted JSON values exactly match.
- Start an actual timer, capture active/history raw bytes, fail a theme change, then restore writes and retry. Both failure and retry preserve active/history raw bytes. Retry writes exactly one key, the failed theme; successful preferences are not rewritten.

Logs: `20260909-before.log` and `20260909-after.log`. The runner's existing import.meta/IIFE warnings concern development i18n flags; they are retained, not treated as test failures. Native JSON export is inspected through the actual Blob; anchor download is suppressed to avoid writing into the user's Downloads folder. This does not prove filesystem download completion.

## Limits and disposition

Scoped preference fix passes independent native acceptance. This probe does not repeat timer close/reopen, background expiry or audio acceptance; active timer checks cover only preference non-interference. It does not establish cross-tab conflict resolution, automatic draft survival after leaving the page, cloud durability, or production deployment. Existing device-local preference ownership policy is unchanged. Other autosave consumers remain outside this scope, so REL-05 as a whole remains open.
