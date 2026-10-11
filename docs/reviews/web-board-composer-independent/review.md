# Independent Board composer recovery verification

PASS for mounted-page new-card/new-list save recovery and the separately corrected BoardCreator deleted-key boundary. Fixed product `dea0af6`, including `279a7f5`. Parent did not author these product changes; parent source review identified the null-deletion defect and requested its correction before this acceptance.

Native Chrome, isolated git archive and temporary profiles/download directories; actual BoardWorkspacesModule and native Storage. Reused author runner infrastructure and original business assertions in a separate directory, adding assertions that downloaded proposal.baseline equals the original bytes and that first-submit external deletion is rejected for the list composer too. No tests or product code were weakened.

Passed checks:
- Card and list quota failures retain editor/error and unchanged raw data.
- Repeated failed attempts preserve candidate id, actual JSON files contain latest text, id, original baseline and current stored data.
- Restoring storage commits exactly one entity with that id, then closes the editor.
- External canonical deletion before first card submission and before first list submission cannot resurrect old boards.
- Newer raw data survives retry; the latest local draft remains visible.
- Old A callbacks after B activation neither write either account nor download; export error is visible.
- Separate actual BoardCreator flow rejects canonical deletion before first create and leaves the key absent.

Commands: `node docs/reviews/web-board-composer-independent/verify-native.mjs dea0af6` and `node docs/reviews/web-board-composer-independent/verify-native-creator-null.mjs dea0af6`. Both exit 0 with structured PASS logs. Author's earlier correct FAIL evidence remains in web-board-composer-save-fix and the original parent failing contract in web-board-card-save-recovery.

Boundaries: no full Board/REL-05 closure. Other writeLists callers still ignore save results; workspace mutations, normal selection, cross-tab atomicity and browser-close draft durability remain open. Native clicks use DOM events, not a comprehensive pointer/accessibility audit. No real account/provider/deployment used.
