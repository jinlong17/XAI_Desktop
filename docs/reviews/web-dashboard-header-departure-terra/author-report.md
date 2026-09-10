# Dashboard Header departure recovery — author evidence

Product commits: `45a1c15`, `0f2d5a0`, `3e11013`, `41fb4d1`.

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
intentionally refused legacy export from a current device-only export. The
final two fixes retain the registered capability while an editor opens, then
defer an input blur save by one turn so a real route/sign-out/widget departure
can reserve its intent before the blur becomes an implicit persistence write.

Author execution at `0f2d5a0`:

- `pnpm --filter @repo/plugin-web-dashboard-grid test` — 25 files, 220 tests passed.
- `pnpm --filter @repo/plugin-web-dashboard-grid lint` and `check-types` — passed.
- `pnpm --filter @repo/web lint` and `check-types` — passed.
- `pnpm --filter @repo/web test -- shellRegistrations.integration.test.tsx` — 11 passed.

Focused `DashHeader.departure.test.tsx` covers source-only unload truth,
current guard/discard behavior, old-account capability refusal, and ordinary
pointer click editing. It additionally checks that a pre-registered guard stays
current through the edit turn and that dialog-focus blur leaves the physical
note unchanged.

Final author execution at `41fb4d1`:

- `pnpm --filter @repo/plugin-web-dashboard-grid test` — 25 files, 222 tests passed;
  package lint and typecheck passed.
- `pnpm --filter @repo/web test -- shellRegistrations.integration.test.tsx` — 11
  tests passed; Web lint and typecheck passed.
- Shared caller regression: `@repo/plugin-web-pomodoro` — 18 files, 148 tests,
  lint and typecheck passed.
- Shared caller regression: `@repo/plugin-web-settings-rest` — 43 files, 293
  tests, lint and typecheck passed. The test output retained existing React
  `act(...)` warnings in MorePane tests; there were no test failures.

Parent independently reported fixed `41fb4d1` actual Host departure 5/5 and
advanced 5/5 passing, plus native unsubmitted and widget paths passing with
the original physical note retained and no runtime error. Sol independently
reported 42/42 passing at `e6c52e1`. These results are attribution records,
not an Astra final acceptance. Parent-owned independent and native evidence
remains unmodified.
