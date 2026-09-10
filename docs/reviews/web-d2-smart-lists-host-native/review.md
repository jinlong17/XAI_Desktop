# Real composed Settings host departure baseline

Parent fixed40ffbe1 imports the actual host `composedSettingsRegistration.children[0].render`, actual composed pane registry, `createBrowserRouter` and `WebShellProvider`; it does not substitute the package placeholder SettingsModule or a test-only conditional pane. Isolated synthetic account, full styles and actual sidebar controls.

[Before](native-40ffbe1.log) correctly fails: after two quota-failed Smart Lists choices, clicking actual Notifications unmounts the dirty pane without a guard; clicking actual Smart Lists returns the first row to saved fallback `show`. This proves normal in-app sidebar navigation loses its in-memory draft on this version.

[Fixture](native.tsx), [runner](verify-native.mjs). The after entry assertion requires the dirty pane to remain mounted with a departure dialog. Detailed Stay/Export/Discard, Back, generic route exit, sign-out and stale-owner behavior require the forthcoming complete host contract, not just this first blocked transition. Browser beforeunload does not cover these router navigations.

The first build warned that the isolated app snapshot lacked its node_modules link for tsconfig extends; bundling and actual host execution completed, and the recorded failure is the observed navigation/selection result. Future runs link app dependencies explicitly; pinned @repo source imports still resolve into the archive.

## Fixed ef97c1f: initial guard passes, complete journey fails

The original [initial departure case](native-ef97c1f.log) now passes on fixed `ef97c1f`: actual Notifications sidebar navigation retains the Smart Lists pane and opens a dialog. Three separate expanded native modes expose remaining failures:

- [journey](native-ef97c1f-journey.log): actual dialog Export downloads the latest exact map and Stay preserves it, but a later real Chrome Escape key does not dismiss the decision. The remaining final-discard assertions are not reached.
- [intent](native-ef97c1f-intent.log): Notifications starts a blocked departure; a subsequent Appearance attempt replaces the captured destination. Explicit discard reaches Appearance instead of the original Notifications target.
- [focus](native-ef97c1f-focus.log): the dialog never receives focus. The fixture explicitly focuses the sidebar trigger before invoking its actual click handler, so this does not assume a programmatic click intrinsically focuses it. Focus-return assertion is not reached.

Run `node docs/reviews/web-d2-smart-lists-host-native/verify-native.mjs <fixed-sha> journey|intent|focus`. Separate filenames preserve the original initial-guard oracle and all before logs. These checks use the actual composed registration/data router and full module styles. They do not cover complete sign-out, owner-generation races, Back or AppRail yet. Terra is correcting the full contract; no acceptance or numbered closure follows from the four narrower native recovery passes.

## Fixed 6bf02de: original three native failures corrected

Unchanged `journey`, `intent`, and `focus` modes all pass on fixed `6bf02de`: [full sidebar decision journey](native-6bf02de-journey.log), [original sidebar destination](native-6bf02de-intent.log), [focus transfer/return](native-6bf02de-focus.log). Actual dialog export remains in place, Stay and real Escape preserve the map, explicit discard reaches Notifications without changing stored bytes. The original ef97c1f failures remain preserved. These three modes do not establish repeated **programmatic** destination safety, simultaneous sign-out/navigation, stale account decisions or the full8565ca6 contract. Astra is independently checking those remaining boundaries; this remains partial acceptance evidence.

## Fixed 6bf02de: programmatic destination replacement remains reproducible

A separate [programmatic mode](native-6bf02de-programmatic.log) uses the same real Notifications sidebar to start departure, then calls the actual data router's `navigate('/app/settings/appearance')` while blocked. Discard incorrectly goes to Appearance instead of the initial Notifications intent. This is a correct FAIL on6bf02de and shows why the sidebar-only intent pass does not prove route-level coalescing. The fixture exposes the real router method without mocking the blocker, guard, pane, or navigation implementation. Astra has this evidence for complete contract review.

## Fixed 6bf02de: native owner, mixed intent and keyboard failures

Three additional modes reproduce Astra's remaining host concerns in actual Chrome:

- [owner-signout](native-6bf02de-owner-signout.log): the actual host departure delegate opens A's sign-out decision. Replacing the synthetic active scope with B leaves A's Promise pending instead of cancelling it false. The later B-edit preservation assertions are not reached.
- [route-signout](native-6bf02de-route-signout.log): a Notifications route already awaiting a decision must refuse the unrelated subsequent sign-out. It instead leaves sign-out pending. The final original-route Discard assertion is not reached.
- [focus-trap](native-6bf02de-focus-trap.log): real Chrome Tab from the dialog's final action escapes instead of wrapping to its first action. The reverse Shift+Tab assertion is not reached.

All three correctly fail on6bf02de. The account transition is fixture setup through the actual accountScope; the host delegate and pane/router behavior are real, while no provider is contacted. The delegate import is included only for the two sign-out modes, so old initial-host baselines that predate the helper remain buildable. No App auth integration result is inferred from these host-only probes. Original assertions/logs remain unchanged; Sol owns product repair and Astra the complete23+39 acceptance chain.

## Original browser history semantics

Two `back` modes build the initial Notifications→Smart Lists history **through the actual router** before rendering. Fixed6bf02de [ordinary Back control](native-6bf02de-back-router-seeded.log) passes Back→Stay→Back→Discard→Forward, including return to Smart Lists on Forward. [Back plus competing programmatic navigation](native-6bf02de-back-programmatic-router-seeded.log) correctly fails: the original Back to Notifications is replaced by Appearance. Its Forward assertion is not reached. A repair must retain the original POP/history continuation, not synthesize a new push to a visually matching URL.

The initial unsuffixed [back diagnostic](native-6bf02de-back.log) and [competing diagnostic](native-6bf02de-back-programmatic.log) manually pushed browser history before creating the data router, leaving the earlier entry without the router index. Their unblocked transition is a **fixture initialization defect**, not an additional product failure. These logs are retained and superseded only for interpretation by the router-seeded executions; no original business assertion was weakened. The optional fourth runner argument selects a distinct evidence suffix and does not alter product behavior.

## Fixed 115efb2 native recovery after

Seven unchanged modes pass on fixed115efb2: [programmatic original intent](native-115efb2-programmatic.log), [owner cancels old sign-out](native-115efb2-owner-signout.log), [route refuses unrelated sign-out](native-115efb2-route-signout.log), [native Tab/Shift+Tab containment](native-115efb2-focus-trap.log), [Back/Forward control](native-115efb2-back.log), [Back preserved despite competing programmatic route](native-115efb2-back-programmatic.log), and [actual disk export/Stay/Escape/Discard journey](native-115efb2-journey.log). The earlier corrected router-seeded Back fixtures are retained unchanged in behavior. These native passes complement, rather than replace, the original export8/host10/App5/39 independent contract review. No production auth network or forced-loss durability acceptance is claimed.

## Fixed 115efb2 same-turn first-intent failures

Two additional native cases preserve the original first-intent requirement at the actual event boundary. Each issues both operations in one Chrome `Runtime.evaluate`, without yielding between them. [Two routes](native-115efb2-same-turn-routes.log): Notifications followed immediately by Appearance; Discard incorrectly navigates to Appearance. [Route then sign-out](native-115efb2-same-turn-route-signout.log): Notifications followed immediately by the real host sign-out request; the later sign-out claims a pending decision instead of being refused. The subsequent route assertion is not reached. Both are correct FAIL on115efb2. The prior seven host passes had intervening turns and remain valid; they did not cover this boundary. Astra separately reproduced the same original-contract gap. Complete recovery acceptance remains withheld.

## Fixed a2c0fe0: synchronous-entry native after

The unchanged [same-turn routes](native-a2c0fe0-same-turn-routes.log) and [same-turn route/sign-out](native-a2c0fe0-same-turn-route-signout.log) now pass. Five retained controls also pass: [Back/Forward](native-a2c0fe0-back.log), [Back with competing programmatic navigation](native-a2c0fe0-back-programmatic.log), [separated programmatic first intent](native-a2c0fe0-programmatic.log), [route refusing sign-out](native-a2c0fe0-route-signout.log), and [owner cancellation](native-a2c0fe0-owner-signout.log). All use fixed a2c0fe0 source in actual Chrome and preserve prior assertions/failure logs.

This is parent native evidence, not complete independent acceptance. The host now coordinates router.navigate through the data-router context; author/independent review must retain original entry3/export8/host10/App5/39/package/type contracts and assess registration/cleanup and original navigation parameters. Unchanged pane export/storage evidence from115efb2 remains separately versioned; no full crash recovery or numbered gate is closed.
