# Pomodoro device controls: expanded native baseline

Parent fixed archive `edc185b`, isolated Chrome profile, actual Pomodoro DOM handlers and native Web Locks. This separate probe preserves the original two-case runner and logs.

[Before result](native-edc185b-before.json): five expected failures — absent mount seeds all six preferences, mute/preset/theme controls write before their respective device lock releases, and a clean theme update from another same-origin document does not project. The cross-document test stops at that failed assertion; its subsequent dirty-conflict checks have not passed on this baseline.

[Probe](native-probe.ts), [runner](verify-native.mjs). After implementation the same assertions also check lock-release persistence, idle account timer bytes, dirty theme retention with external bytes preserved, and visible conflict recovery. Only if all pass does the runner terminate Chrome and reopen the same profile to compare one final six-key physical checkpoint. This is not six independently saved choices, running-timer verification, automatic durable unsaved drafts, or visual acceptance; CSS is omitted. Before failure means no reopen acceptance is claimed.

## Fixed async caller 2b666ed

The unchanged five cases PASS, including the full clean projection then dirty conflict scenario (latest violet stays visible, external blue physical bytes preserved, recovery alert present). [After](native-2b666ed-after.json). Chrome80794 exits with SIGTERM and observed exit; fresh Chrome80899 reopens the same isolated profile and the final six physical keys match. This final checkpoint contains the externally accepted blue source; the unsaved violet intent is not claimed durable after process exit. Full Dv2 contract acceptance remains Astra's separate review.
