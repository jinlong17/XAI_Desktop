# Dv1 Dashboard device offset gesture repair

Fixed product revision: `68ea7a35b8d0755c18f9d65c1c1bfcea43ae41c8`.

## Repair

A moved but uncommitted gesture is now recovery-dirty, so `beforeunload` warns
before pointer-up. A successful predecessor updates a newer active gesture's
captured raw baseline only if the raw is exactly the predecessor's own baseline.
It never replaces the newer visible/desired offset. An unrelated external raw
continues to produce a conflict.

## Verification

- Astra immutable device contract: 13/13 passed; raw output retained here.
- Original parent device contract: 3/3 passed; raw output retained here.
- Retained original account-note contract: 2/2 passed; raw output retained here.
- `pnpm --filter @repo/plugin-web-dashboard-grid test`: 24 files, 214 tests passed.
- `check-types` and `lint`: passed.

Native Chrome/reload verification and Astra final acceptance remain parent-owned.
