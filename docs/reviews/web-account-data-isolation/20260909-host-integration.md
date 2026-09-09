# REL-03 host and migration UI implementation evidence

The host injects synchronous identity invalidation into the auth provider, gates all business children by the authenticated account/generation, and drops old Todo runtime lease completions after scope changes. The auth route guard is outside the data gate, so an unauthenticated deep link can reach login before migration UI mounts.

The package-owned AccountDataGate offers explicit empty/import/postpone choices. Legacy private content is not rendered before a choice. A single generation marker controls visibility; failed/cancelled migration cannot mount business readers. Undo retains source bytes and archives. Cross-tab generation changes revoke old callbacks and remount readers. Same-account identity announcements are ignored, so opening another tab does not revoke the active workspace or an in-progress migration.

## Evidence gathered by parent

- Auth package: 13 files / 60 tests PASS, including six independently authored real React Provider lifecycle tests.
- AccountDataGate: five real component tests PASS (hidden legacy, A/B handle revocation, pending migration identity switch, rollback, cross-tab generation remount).
- Web host: 27 files / 143 tests PASS after updating old authenticated fixtures to include an actual account ID and committed generation. No data-gate bypass was added to those tests.
- Real Chromium probe `verify-browser-account-gate.mjs`: A/B/A business content and native IndexedDB encrypted-key isolation, A recovery, legacy retention, pre-choice reader exclusion and stale setter rejection PASS. The initial headless window was 500px, not 390px; a same-origin 390px iframe then verified the exact responsive viewport (scroll width390 and44px control heights). The iframe run polls for the asynchronous commit receipt rather than assuming70ms is enough.
- Independent review reproduced same-account metadata locking the workspace/migration handle; the parent fix then passed all three focused cases (ready A, pending A migration, real A→B).
- Independent review identified the original data gate blocking nested auth redirects; moved the existing guard outside App. Reviewer is recording real guard/router tests separately.

## Scope and remaining acceptance

These are local controlled tests using synthetic accounts; no hosted login, production deletion or cloud sync is claimed. Entire REL-03 still needs owner migration validators, current-account Settings/export/delete integration, broad consumer regression and independent joint acceptance. Cross-vendor review remains pending revoked Claude OAuth. Passing these layers does not close unrelated REL-04/05/06/08 requirements.
