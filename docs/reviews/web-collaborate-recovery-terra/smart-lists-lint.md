# Smart Lists callback dependency lint repair

`changeVisibility` reads only `editable`, `editSmartLists`, and stable refs.
It does not capture `scope`: account epoch/session behavior remains owned by
the surrounding binding ref and the accepted storage hook. Removing the unused
dependency stops the sole Settings-rest lint warning without changing guard,
draft, ownership, or storage behavior.

Verification: Settings-rest lint, typecheck, and `smartListsRecovery.test.tsx`
all pass. This is a lint-gate repair only; it does not accept unrelated
Collaborate recovery contracts.
