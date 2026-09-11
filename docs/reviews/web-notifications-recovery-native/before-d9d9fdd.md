# Notifications native before verification

Fixed product d9d9fdd via git archive. Real Chrome 153 isolated profile, localhost synthetic device state, actual composed Settings and Shell, real navigator.locks, trusted CDP mouse and keyboard. No production accounts or services.

- Normal eight-field edits persist physical bytes; new-document reload retains them. `clean-setup1` establishes native control setup; `clean-trusted-control` reruns the final event-based oracle.
- `controls-trusted-before`: all eight fields lose latest valid intent on quota denial. For time inputs, compare the displayed value against that field's last trusted input event, not the cumulative intended keyboard sequence. Source rollback means repeated ArrowUp generates repeated 22:01 / 07:01 events; those actual latest values are still lost. Initial `before-controls` used cumulative 23:15 / 06:30 assumptions and is retained as superseded diagnostic, not the final time oracle.
- route, signout, unload: failed actual work permits departure or omits warning. All three correct before assertions fail; no Runtime exceptions.

These are before failures, not acceptance. The full eight-field recovery, hidden fields, owner/export/uncertainty/queue, native visual and host matrix in the complete Notifications contract remains open. `beforeunload` is a dispatched cancelable event check, not proof of crash persistence or background notification delivery.

Run: `node docs/reviews/web-notifications-recovery-native/verify-native.mjs <fixed-sha> <controls|clean|route|signout|unload> <unique-evidence-tag>`.
