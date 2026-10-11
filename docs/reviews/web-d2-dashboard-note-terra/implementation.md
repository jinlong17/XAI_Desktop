# Dashboard note async caller implementation

Terra, Web, 2026-09-09. This record covers only `dashboard_header_note` in `DashHeader`; it does not claim the device-owned `dashboard_header_note_x` migration or full D2 acceptance.

## Changed caller boundary

- The note binds through `usePrefAutosaveAsync("dashboard_header_note", { codec: "string", defaultValue: "", validate: isString })`.
- Typing remains local. Save, Enter, blur and Clear enqueue one explicit operation and await its actual mutation result. Clear sends `""`; it never uses `reset()`.
- An editor session captures account scope, physical key and raw baseline. Submission verifies those values and the hook raw snapshot immediately before enqueueing; the shared engine repeats the raw check inside its key lock.
- Pending saves leave the editor usable and show localized Saving feedback. Completion closes only the matching unchanged editor operation. A newer draft remains open and adopts the earlier verified raw result as its next baseline.
- Failed operations retain the draft. An unchanged draft uses hook retry; a changed draft creates a new operation. Account changes freeze and mask the old session; Retry and Export refuse old-account data.
- The existing device offset writer, raw conflict check, quota/latest retry and legacy absent-mount `0` behavior remain intentionally separate.

## Author verification

Fixed product revision: `f532ad5923fb459bce73c0471d31a43aa62dc73d`. Dependency API repair: `20a4591`; its independent final acceptance remains parent-owned.

| Layer | Command | Result |
| --- | --- | --- |
| Focused header behavior | `pnpm --filter @repo/plugin-web-dashboard-grid test -- DashHeader.test.tsx DashHeader.recovery.test.tsx` | 20 passed; quota logging is expected in recovery injection. |
| Operation ownership | `pnpm --filter @repo/plugin-web-dashboard-grid test -- DashHeader.async.test.tsx DashHeader.test.tsx DashHeader.recovery.test.tsx` | 24 passed: pending newer draft, uncertain-token retry, frozen external baseline and Escape-pending behavior. |
| Dashboard types | `pnpm --filter @repo/plugin-web-dashboard-grid check-types` | passed |
| Dashboard lint | `pnpm --filter @repo/plugin-web-dashboard-grid lint` | passed |
| Full Dashboard package | `pnpm --filter @repo/plugin-web-dashboard-grid test` | 212 passed across 24 files; expected quota logs come from existing recovery fault injection. |
| Unchanged parent component contract | `node docs/reviews/web-d2-dashboard-note-independent/verify-fixed.mjs f532ad5923fb459bce73c0471d31a43aa62dc73d` | 2 passed from an immutable archive: held account lock retains the draft/old bytes, and an absent note remains absent on mount. Raw log: `parent-contract-f532ad5923fb459bce73c0471d31a43aa62dc73d.log`. |

The unchanged parent account-lock/no-mount-write runner and the parent native runner must execute against the fixed commit. This author evidence is not independent acceptance and does not claim the shared-hook dependency accepted.

## Caller repair evidence

Fixed caller repair: `d12995059eb0388cdc2f5b34c18a3f0077681797`.

- Astra's unchanged independent caller suite passed 11/11, including frozen A-to-B masking, device-only recovery export and changed-draft retry normalization. Raw log: `astra-independent-d12995059eb0388cdc2f5b34c18a3f0077681797.log`.
- The unchanged parent two-case contract passed 2/2. Raw log: `astra-original-parent-d12995059eb0388cdc2f5b34c18a3f0077681797.log`.
- The full Dashboard package passed 213/213. Raw log: `astra-package-d12995059eb0388cdc2f5b34c18a3f0077681797.log`.

These are archive-based component checks. Native and final independent acceptance remain separate parent/Astra decisions.
