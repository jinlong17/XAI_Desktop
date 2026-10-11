# Pomodoro device preferences: fixed migration baseline

Parent independent actual PomodoroModule at `52a9207`, immutable git archive. [Two-case raw log](independent-before-52a9207.log), [assertions](contracts.test.tsx), [runner](verify-fixed.mjs).

- Mount seeds all six device defaults without a user edit: preset, custom minutes, display style, theme, sound and muted. The assertion preserves absence for every one of these keys and currently fails for all six.
- An actual mute click persists `true` while the exclusive lock for its physical device key is still held. The final desired `true` value and unchanged account active/session bytes are passing controls in this idle fixture; the missing coordinated wait is the failure.

Real jsdom storage and the accepted named lock fixture are used. The two tests do not exercise native browsers, running timer rollover, every preference interaction or full Pomodoro acceptance. The timer-data control is limited to the idle snapshots captured after mount; it must not be interpreted as running-timer persistence proof. The upcoming Dv2 contract must preserve existing JSON codecs and domain rules, six-key fault/retry/export behavior and true timer-completion semantics.

No product source changed. This prepares the remaining device callers without retracting previously accepted timer or shared async-hook slices.
