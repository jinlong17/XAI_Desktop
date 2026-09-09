# TT-02 independent diagnosis — BLOCKED

Web module; source pinned `28fe049706c828d93e5611e227f31bd2a62660a4`. No Time Tracker source edits. TODO TT-02 explicitly requires no duplicate open segment, idempotent resume/end, and a declared cross-tab activity policy. TT-01 window accounting remains independently accepted by `8d951e9` against `c5b08a7`; these findings concern persisted source state, not that accounting algorithm. TT-04 is category deletion transaction; TT-07 is performance.

## Reproduced findings

| Severity / issue | Independent evidence | Impact |
|---|---|---|
| P1 repeated resume adds open intervals | `resumeTimeTrackerEntry` unconditionally appends. Two real Chrome tabs use actual useTimeTrackerEntries; B first receives A's storage refresh, then a replayed resume maps over that current value. Open count becomes 2. | Duplicate commands corrupt a single session even without stale storage or a simultaneous write race. |
| P1 ended session keeps accruing | finish closes only last open interval. After the above, A then B end commands yield done=true with one earlier interval open. Advancing observer time one second increases persisted session duration by 1000ms. | User sees ended state while stats can keep growing. Ordinary repeated end of a valid session does conserve time; that happy path passes. |
| P1 source editor destroys pause intervals | Actual module record Edit, change only note, Save: original two precise intervals totaling 1,201,250ms become one rounded interval totaling 4,200,000ms. | Paused gap becomes work time; seconds/milliseconds disappear. TT01's earlier single minute-aligned source edit case never claimed this case passed. |
| P1 single-task policy not enforced | Set existing device mode key to single, click actual category Start button in tab A then another category's Start in tab B after native storage propagation. Two running sessions persist. | design.md promises single/multi modes and switch confirmation; module neither reads mode nor checks an active session. |
| P2 invalid ordering / stale terminal command | Correct-expectation unit regressions show resume(done) still appends an open interval; end before segment start persists negative ordering. | Helpers cannot serve as trusted state transitions; UI visibility alone cannot enforce replay safety. |

## Correct-expectation regression status

```
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-time-tracker-session-invariants/invariants.config.mjs
```

Five tests: **4 FAIL, 1 PASS**, saved `20260909-invariants-before.log`. Failed tests assert the desired invariant; they deliberately remain red on this baseline. Normal start→pause→resume→finish excludes the pause gap and repeated end does not increase duration.

Native:

```
node docs/reviews/web-time-tracker-session-invariants/verify-native-session.mjs
```

`20260909-native-session-before.log` reports four failed business assertions and BLOCKED. This diagnosis probe exits normally after recording known defects; it is not a green acceptance runner. Actual Chrome 152, temporary isolated profile, synthetic localhost, two real tabs, shared localStorage, native storage events, source pinned through git archive and @repo resolver; no user data/profile or service touched. Source edit and Start use actual module DOM handlers. Resume/end replay uses a small harness around the **actual hook and reducers**, executing the same mapping operation as module handlers, so it proves command-boundary idempotency failure; it is not represented as a human clicking a currently hidden Resume button or a probabilistic simultaneous click race. Simultaneous lost updates are a distinct untested risk here.

## Storage contract and minimum correction

- Persistence is one account/generation-scoped `xai_tt_entries_v2` JSON array, with separate category data and device `xai_tt_mode`. Each mutation currently transforms hook `valueRef`, writes the entire array, then emits a custom event; other tabs refresh on native storage events. There is no transaction/lock/revision check. valueRef advances before write success (REL05 separately).
- Declare states from one invariant: running = not done and exactly one open **last** interval; paused = not done, all intervals closed; done = all closed and terminal. Deleted rows cannot resume. Reject nonfinite times, negative ordering, out-of-order or overlapping segments. Resume running/terminal should be no-op/rejected, not append; repeated pause/end must preserve totals and ideally revision. A command earlier than its open start must reject rather than persist negative time.
- Use one shared controller for module/widget/public command entry points. In a per-account/per-generation lock, reread canonical data, check captured owner, target session and expected revision/state, apply one command, commit, then notify. This prevents a delayed resume from resurrecting an ended/changed record and avoids overwriting another session. Unsupported locking must visibly disallow unsafe concurrent commands or provide a tested alternative; it must not silently claim single mode.
- Enforce the already documented single-mode policy inside that controller, across tabs, with the specified switch confirmation. Multi mode permits distinct sessions, never duplicate open segments within one session. Confirmation must bind to the observed active session/revision; recheck under lock when confirming.
- Note/category-only edits must retain exact original source segments (including pauses, seconds, milliseconds and absolute fold instants). Separate explicit time edits from metadata edits; if multiple segments are not yet editable, preserve them and provide a clear supported editing path rather than flattening them.
- Existing malformed multiple-open records need explicit detection/recovery. Merely closing every open interval freezes future growth but may still double-count historical overlap. Do not silently discard original segments or invent repair durations; preserve/export raw source and choose a documented repair/quarantine policy. Repair/write failure is not empty state.

## Required after evidence

Rerun the five desired assertions unchanged. Add rapid duplicate command ids, resume-after-end revision rejection, two-tab same-session resume/end, simultaneous different-session starts under single/multi modes, lock unavailable/account switch, editor note-only and explicit multi-segment changes, and quota on transition. Verify reload restores valid terminal state and total remains finite. Re-run TT01 original 11 window assertions to ensure state fixes do not regress report semantics. Cross-tab eventual event refresh alone does not prove atomicity.

This report does not close TT-02, TT-03, REL05, REL07, REL08, or any release gate. Product fix is intentionally deferred to the parent/assigned author.
