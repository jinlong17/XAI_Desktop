# Pomodoro device controls: expanded native baseline

Parent fixed archive `edc185b`, isolated Chrome profile, actual Pomodoro DOM handlers and native Web Locks. This separate probe preserves the original two-case runner and logs.

[Before result](native-edc185b-before.json): five expected failures — absent mount seeds all six preferences, mute/preset/theme controls write before their respective device lock releases, and a clean theme update from another same-origin document does not project. The cross-document test stops at that failed assertion; its subsequent dirty-conflict checks have not passed on this baseline.

[Probe](native-probe.ts), [runner](verify-native.mjs). After implementation the same assertions also check lock-release persistence, idle account timer bytes, dirty theme retention with external bytes preserved, and visible conflict recovery. Only if all pass does the runner terminate Chrome and reopen the same profile to compare one final six-key physical checkpoint. This is not six independently saved choices, running-timer verification, automatic durable unsaved drafts, or visual acceptance; CSS is omitted. Before failure means no reopen acceptance is claimed.
