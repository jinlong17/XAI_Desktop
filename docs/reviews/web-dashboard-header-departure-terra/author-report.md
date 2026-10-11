# Dashboard Header departure recovery — author evidence

Final product SHA for this author handoff: `73b4eb9`.

The Dashboard Header registers an owner-bound, current-draft guard with the
accepted app coordinator. Note and device position remain separate recovery
fields. Source-only health failures remain visible and reloadable without
becoming host drafts or unload warnings. The app-owned Dashboard adapter keeps
the package standalone while routing AppRail, mini-calendar, Topbar Settings,
and avatar Settings/Statistics pointer intents through the coordinator's
existing route path.

The final fixes preserve a slow navigation pointer's draft until its matching
pointer release, while ordinary Tab/blur saves after its own turn. Blur save
callbacks are stable across preference-state rerenders and verify the captured
session, revision, and account scope before writing. Position retry now moves
the current failed identity to its active retry attempt: that completion clears
only itself, while predecessor callbacks cannot erase a newer preflight
failure. An unavailable note source, unavailable position source, both sources,
and frozen-account recovery now use separate EN/ZH messages.

Author execution at `73b4eb9`:

- `pnpm --filter @repo/plugin-web-dashboard-grid test` — 25 files, 228 tests
  passed. Raw output: `dashboard-package-73b4eb9.log`.
- `pnpm --filter @repo/plugin-web-dashboard-grid lint` and `check-types` —
  passed. Raw output: `dashboard-lint-73b4eb9.log` and
  `dashboard-typecheck-73b4eb9.log`.
- `pnpm --filter @repo/web lint` and `check-types` — passed. Raw output:
  `web-lint-73b4eb9.log` and `web-typecheck-73b4eb9.log`.
- `pnpm --filter @repo/web test -- shellRegistrations.integration.test.tsx` —
  11 tests passed. Raw output: `web-shell-registration-73b4eb9.log`.
- Focused Header departure, recovery, and async suites — 24 tests passed,
  including ordinary Tab blur, source-only/frozen recovery copy, preflight
  failure, and current-draft retry paths.

The Dashboard package prints expected quota and duplicate-widget diagnostics in
its recovery fixtures; the run has no failed tests. Pomodoro, Settings, Smart,
and Collaborate product sources were not modified after their parent-reported
shared gate at `1bdc844`, so their author suites were not repeated for this
Dashboard-only delta.

This is author evidence only. Astra, parent, and Sol retain independent host,
native, source-copy, and historical failure records and determine acceptance.
