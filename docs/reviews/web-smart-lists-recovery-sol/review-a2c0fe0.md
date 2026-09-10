# Smart Lists same-turn departure admission repair

Sol author report, 2026-09-09. Product commit under test: **a2c0fe0**. This is implementation evidence for independent Astra review and does not claim acceptance.

## Repair

The composed Settings host now reserves the first route departure synchronously. Its data-router `navigate` seam captures the original invocation before React Router can replace a blocked transition, and refuses later programmatic calls while that intent owns the current pane capability. A concurrent sign-out therefore observes the existing route intent and returns false immediately.

Browser history transitions remain on `useBlocker`: the predicate only reserves the immutable guard in a ref, without a React update, and the router's original `proceed`/`reset` continuation is attached on the blocked render. This retains POP and Forward semantics instead of reconstructing a destination with PUSH. The seam restores the original router method only when it still owns the installed wrapper.

`UNSAFE_DataRouterContext` is an explicit dependency risk. It is used narrowly because `useNavigate` cannot intercept external `router.navigate` calls and `useBlocker` alone exposes the original continuation after same-turn replacement is already possible. Independent review should retain coverage for router method cleanup, original navigate options, browser POP, programmatic numeric navigation, and a future React Router upgrade.

## Verification

All assertions ran from immutable archive **a2c0fe0** without changing the independent tests:

| Suite | Result |
| --- | --- |
| Same-turn host entry | 3/3 PASS |
| Existing composed host | 10/10 PASS |
| Export/unload and immutable capability | 8/8 PASS |
| Actual App sign-out boundary | 5/5 PASS |
| Original persistence contract | 39/39 PASS |
| Settings REST package | 43 files, 286/286 PASS |
| Settings REST types | PASS |
| Web types | PASS |

Parent-owned real Chrome checks separately reported PASS for both same-turn modes plus Back/Forward, Back with a competing programmatic route, ordinary programmatic replacement, route/sign-out competition, and owner/sign-out cancellation. Those native fixtures and logs remain parent evidence.

No storage, auth, schema, physical-key, global-reset, Tasks, or production-activation code changed. The wider 312-item audit and REL-05/REL-09 work remain open.
