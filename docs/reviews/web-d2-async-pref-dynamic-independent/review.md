# Open-ended async autosave: fixed parent integration checks

Product `69c8318`, immutable git archive; parent independent assertions **3/3 PASS**. [Raw log](independent-first-69c8318.log), [assertions](contracts.test.tsx), [runner](verify-fixed.mjs).

- Actual registered ownership for the open-ended `dashboard_header_note` suffix: no mount write, exact string roundtrip to account-scoped storage, no unscoped legacy write, successful reset removes physical bytes and restores the declared default.
- A JSON domain validator rejects an invalid stored object shape and prevents overwrite. Explicit reload adopts repaired physical data; a subsequent valid edit persists the expected structure.
- Changing suffix while queued behind an account lifecycle lock invalidates the old request. Neither old persisted source nor new source is overwritten by the abandoned draft; the new binding subsequently saves successfully.

These tests execute real hooks and storage against jsdom localStorage and a named shared/exclusive lock fixture. They do not use the real Dashboard component, native browser, or deployment. They are supplementary evidence for the new overload, not acceptance of all hooks. Astra's fixed d6184ee six failures remain open; author package results and these three controls cannot replace the unchanged failed oracles. Re-run against the eventual repair integration before final acceptance.
