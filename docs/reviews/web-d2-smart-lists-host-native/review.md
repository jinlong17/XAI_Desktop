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
