# Dashboard Header departure recovery — author evidence

Product commits: `45a1c15`, `0f2d5a0`.

Implemented the package-level current-user recovery capability and app-owned
Dashboard route adapter. The Header now registers a token- and owner-bound
guard with the existing Web `DepartureCoordinator`; current note work and
device position work remain independent. Source-only failures remain visible
and reloadable but do not become departure drafts or beforeunload warnings.

The app adapter emits the existing mini-calendar event and calls the data-router
navigation path, so coordinator protection applies to widget navigation without
the package importing app code. Ordinary clicks no longer capture a pointer;
capture starts only once a gesture has crossed the existing movement threshold.

The second commit stabilizes guard actions with refs to the latest preference
results. This prevents coordinator registration from recursing through a new
hook-result object on every render. Frozen A copy distinguishes its retained,
intentionally refused legacy export from a current device-only export.

Author execution at `0f2d5a0`:

- `pnpm --filter @repo/plugin-web-dashboard-grid test` — 25 files, 220 tests passed.
- `pnpm --filter @repo/plugin-web-dashboard-grid lint` and `check-types` — passed.
- `pnpm --filter @repo/web lint` and `check-types` — passed.
- `pnpm --filter @repo/web test -- shellRegistrations.integration.test.tsx` — 11 passed.

Focused `DashHeader.departure.test.tsx` covers source-only unload truth,
current guard/discard behavior, old-account capability refusal, and ordinary
pointer click editing. These author checks do not replace parent real Shell /
Chrome evidence or Astra's complete matrix review. Parent-owned independent
and native evidence remains unmodified.
