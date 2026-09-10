# Dv1 Dashboard device offset caller verification

Fixed product revision: `76edb0c9b36ca7afee327e095840124ef208a94a`.

## Implementation scope

`DashHeader` now uses `usePrefAutosaveAsync` with the device-only JSON key
`xai_pref_dashboard_header_note_x`. A drag captures the physical raw baseline,
keeps pointer moves visual, and explicitly enqueues the final position on
pointer-up or pointer-cancel. Resize clamps only the visible value. Recovery
keeps the latest visible position, uses the hook token for an unchanged retry,
and exports a device-only recovery without requiring a note editor session.

## Author verification

- `pnpm --filter @repo/plugin-web-dashboard-grid test` — 24 files, 214 tests passed.
- `pnpm --filter @repo/plugin-web-dashboard-grid check-types` — passed.
- `pnpm --filter @repo/plugin-web-dashboard-grid lint` — passed.
- Unchanged `node docs/reviews/web-d2-device-offset-independent/verify-fixed.mjs 76edb0c9b36ca7afee327e095840124ef208a94a` — 3/3 passed. Its raw output is retained alongside this report.

The focused `DashHeader.recovery.test.tsx` additionally covers quota/latest retry,
newer physical raw refusal, pointer-cancel commit, and resize-only clamping.

## Remaining acceptance

The parent owns the unchanged native Chrome runner and Astra's final independent
acceptance. No shared storage hook or parent/Astra assertion was edited.
