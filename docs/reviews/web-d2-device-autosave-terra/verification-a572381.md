# Dv1 Dashboard device source recovery

Fixed product revision: `a57238107b83be71e8aca0cc5cb84b16f71ba42a`.

`DashHeader` now treats the async device preference source states `invalid` and
`unavailable` as recovery-dirty. It exposes an explicit reload action that calls
the hook's read-only `meta.reload()` path; it never resets or writes a fallback.
A normal absent key remains healthy and unseeded.

## Verification

- Immutable source-feedback contract: 3/3 passed (`null`, read failure, absent).
- Immutable Astra device contract: 13/13 passed.
- Original device contract: 3/3 passed.
- Accepted account-note contract: 11/11 passed.
- Dashboard package: 24 files, 215 tests passed; types and lint passed.

Raw archive-runner output is retained alongside this report. Native Chrome and
Astra final acceptance remain parent-owned.
