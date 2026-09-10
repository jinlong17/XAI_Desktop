# Smart Lists draft export and browser-leave baseline

Parent fixed40ffbe1 with actual pane, full token/layout/settings styles, isolated Chrome account. Actual first two choices fail under quota while latest choices remain in memory and physical map remains the seeded unknown extension.

Two expected failures: [export](native-40ffbe1-export.log) has no actual draft download control; [unload](native-40ffbe1-unload.log) has no cancelable beforeunload protection for these unsaved edits. The defined after export oracle reads actual `smart-lists-draft.json` from disk and expects `{version:1,kind:"smart-lists-draft",values:{extension:"future-value",all:"hide",today:"if-not-empty"}}`, preserving save error/physical bytes. The after unload oracle expects protection before Retry and no stale protection after verified Retry; neither after branch passes on this baseline.

[Fixture](native.tsx), [runner](verify-native.mjs). A cancelable event in Chrome verifies the registered handler only; it does not promise all OS/browser terminations fire beforeunload or display a dialog. Actual in-app host navigation is a separate fixture, and full storage denial/owner boundaries remain separate contract cases. The original39 storage-caller acceptance remains valid and was never fullREL-05 recovery acceptance.

## Full storage-denial extension

The separate `export-denied` mode first performs the same two real user edits under quota, then denies **all** `Storage.prototype.getItem` and `setItem` calls before clicking Export. Its fixed40ffbe1 [before log](native-40ffbe1-export-denied.log) correctly fails because the export control is absent. The after oracle requires the same actual disk payload, unchanged physical bytes read only through the fixture's captured native getter, and an unsaved beforeunload guard after export. Application export cannot use that fixture getter. This adds a recovery-fault case; it does not prove stale-owner, prototype-field, or sign-out boundaries, which still require the full contract suite. Original export/unload logs remain unchanged.
