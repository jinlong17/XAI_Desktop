# Real composed Settings host departure baseline

Parent fixed40ffbe1 imports the actual host `composedSettingsRegistration.children[0].render`, actual composed pane registry, `createBrowserRouter` and `WebShellProvider`; it does not substitute the package placeholder SettingsModule or a test-only conditional pane. Isolated synthetic account, full styles and actual sidebar controls.

[Before](native-40ffbe1.log) correctly fails: after two quota-failed Smart Lists choices, clicking actual Notifications unmounts the dirty pane without a guard; clicking actual Smart Lists returns the first row to saved fallback `show`. This proves normal in-app sidebar navigation loses its in-memory draft on this version.

[Fixture](native.tsx), [runner](verify-native.mjs). The after entry assertion requires the dirty pane to remain mounted with a departure dialog. Detailed Stay/Export/Discard, Back, generic route exit, sign-out and stale-owner behavior require the forthcoming complete host contract, not just this first blocked transition. Browser beforeunload does not cover these router navigations.

The first build warned that the isolated app snapshot lacked its node_modules link for tsconfig extends; bundling and actual host execution completed, and the recorded failure is the observed navigation/selection result. Future runs link app dependencies explicitly; pinned @repo source imports still resolve into the archive.
