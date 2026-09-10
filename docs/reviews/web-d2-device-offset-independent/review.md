# Dashboard device offset: independent migration baseline

Parent fixed product `52a9207`, immutable git archive. Three assertions fail against the actual DashHeader and physical device key:

1. Absent position is seeded to `0` on mount without user action.
2. A drag displays and persists `40` while an exclusive lock for that physical device key is still held. The proposed visible offset is correct; missing coordinated wait is the failure.
3. After a clean A→B account switch in the mounted header, the same device position cannot be changed: bytes remain `0` and conflict feedback appears.

[Raw before log](independent-before-52a9207.log), [assertions](contracts.test.tsx), [fixed runner](verify-fixed.mjs). Real jsdom storage and a named shared/exclusive lock fixture are used; pointer events and deterministic lane geometry drive the real component handler. These are not native browser results. The shared hook's device branch has already been accepted, but this legacy caller is not yet using it.

The account note batch explicitly retained this device writer for later migration. These findings therefore define the next caller work, not a retraction of d129950/4a66e86 account-content acceptance. The coming device contract must also retain failed/latest offset recovery, raw-conflict refusal, actual export behavior, and account-independent device ownership. No product changed or numbered item closed.
