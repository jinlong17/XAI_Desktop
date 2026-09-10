# Dv2 Pomodoro device preference caller

Functional implementation: `2b666eda345268efe9e0697bfc1fc8dc4474dc63`.
Focused producer test: current successor commit.

`PomodoroModule` now binds all six device preferences through dynamic JSON
`usePrefAutosaveAsync` hooks. Controls and the committed timer-completion
callback issue explicit hook edits; idle mount, timer reset, rendering and
source projection never seed defaults. The recovery section aggregates pending,
error/conflict and invalid/unavailable source states, retries only failed
operations, reloads sources without reset, and exports the latest six choices.

Verification at the functional revision:

- Unchanged parent component contract: 2/2 passed (no seed; held mute key).
- Pomodoro package: 18 files, 145 tests passed.
- Typecheck and lint passed.

The raw parent-runner output is retained beside this report. Native Chrome and
Astra independent acceptance remain parent-owned.
