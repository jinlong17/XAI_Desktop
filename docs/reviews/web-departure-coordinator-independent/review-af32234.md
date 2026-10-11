# Host departure coordinator extraction — parent independent checks

Fixed productaf32234 mechanically moves the already accepted Composed Settings first-intent machinery into `apps/web/src/routes/modules/departureCoordinator.tsx`, keeping Settings as its current participant. Parent independently inspected the diff and executed fixed git archives after the author commit:

| Layer | Fixed parent result |
| --- | --- |
| Smart Lists host |10/10 PASS, `../web-smart-lists-recovery-astra/host-parent-extract-af32234.log` |
| Same-turn entry |3/3 PASS, `../web-smart-lists-recovery-astra/host-entry-parent-extract-af32234.log` |
| Router wrapper options/relative/POP/cleanup/latest |5/5 PASS, `../web-smart-lists-recovery-astra/host-wrapper-parent-extract-af32234.log` |
| App original sign-out preflight |5/5 PASS, `../web-smart-lists-recovery-astra/app-parent-extract-af32234.log` |
| Actual Collaborate mixed-scope host |8/8 PASS, `../web-collaborate-recovery-independent/host-parent-extract-af32234.log` |

These are overlapping behavior suites, not a combined coverage percentage. Sol separately reports author Web types/lint,27 files/146 Web tests, and archived Smart host/entry/wrapper/export/App PASS; those author checks are not labelled parent execution.

The data router wrapper, first-intent state, guard checks, option replay, numeric POP handling and focus/disposal move together. Registration callback is stable, children receive the same guard registration seam, and Settings retains its own sidebar selection logic. The helper still uses structural PaneDepartureGuard typing; it introduces no runtime plugin-to-app dependency. Scope/auth/storage/timer semantics are untouched by this two-file commit.

Astra is independently reviewing the extraction in its own directory. This checkpoint permits the authorized next caller integration to proceed but does not itself accept Pomodoro recovery: its actual original9/advanced8/native3 baselines still expose missing caller protection. Those must pass after real app registration is connected, with existing Settings/App gates retained.
