# Smart Lists departure recovery implementation

Sol implementation report, 2026-09-09. Product commit under test: **115efb2** (parent baseline **6ddeac3**). This report is author evidence for independent Astra review; it does not claim acceptance or close the wider REL-05/REL-09 backlog.

## Implemented repair

- The Smart Lists pane now creates an immutable capability token for each account scope epoch. `isCurrent()` validates that binding independently from `isBlocking()`, and export/discard require the same captured token and live scope. A retained A guard cannot inspect, export, discard, or unregister B's draft.
- The composed Settings host now uses one captured departure intent for route and voluntary sign-out requests. The first intent owns its guard and continuation; incompatible later requests are refused, owner replacement cancels the original, and only the captured intent can be completed.
- Route intents retain the original React Router continuation, including POP history behavior. Save completion resumes that continuation only when its captured guard remains current and the latest draft has cleared; discard resumes it once. Stay cancels it.
- The custom dialog contains Tab and Shift+Tab focus within its actions, keeps Escape as Stay, and returns focus after cancellation.
- Existing App sign-out scope and auth-generation checks were preserved unchanged.

## Verification

The original reviewer runner was executed against the immutable git archive for `115efb2` with the original assertions unchanged:

| Suite | Result |
| --- | --- |
| Smart Lists export/unload | 8/8 PASS |
| Composed host departure | 10/10 PASS |
| Actual App sign-out boundary | 5/5 PASS |
| Original Smart Lists persistence contract | 39/39 PASS |
| Settings REST package | 286/286 PASS (43 files) |
| Settings REST types | PASS |
| Web types | PASS |

Parent-owned real-browser checks separately reported PASS at `115efb2` for programmatic replacement, owner-change sign-out cancellation, route/sign-out competition, focus trapping, Back/Forward preservation, and Back/programmatic competition. Those native fixtures and logs remain parent evidence and are not authored or committed here.

## Scope retained

No storage hook/engine, auth coordinator/provider, physical key, global reset, Tasks selector, production activation, or App sign-out implementation was changed. Forced revocation and crash durability, other callers' recovery, and the full 312-item product audit remain open for their independent gates.
