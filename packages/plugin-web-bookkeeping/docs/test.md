# Bookkeeping Test Plan

Focused automated coverage:

- Shell registration shape and rail metadata.
- Local storage persistence for canonical state and mirrored preference keys.
- Corrupt/missing storage fallback to seeded data.
- Transaction add/delete balance effects.
- Derived totals, category totals, and calendar day totals.
- Natural-language draft parsing for deterministic expense/income candidates.
- Module render with Cloud Design tab set.
- Record modal interaction: calculator input, save, persisted transaction, and account balance update.

Release verification should also smoke `/app/bookkeeping` in the Web shell and confirm:

- rail entry opens the module;
- new record survives refresh;
- tabs switch without blank panels;
- dashboard, bills, insight, calendar, budget, assets, investment, and recurring surfaces render.

## REL-05 fault-injection regression

`src/__tests__/saveFailure.test.tsx` injects real `Storage.setItem` failures at exact canonical/device keys, without mocking the repository or hook. It checks no mirror/event after canonical failure; committed versus pending state; unchanged draft under attempted replacement; draft export; retry; partial-device retry without canonical rewrite; old A handles after B; newer canonical baseline conflict; retained record/ledger/account/category/recurring/investment forms; retained parsed CSV and single import; retained budget input. Existing account-isolation and ordinary business assertions stay intact.

The unchanged independent component probe in `docs/reviews/web-storage-write-results/independent-write-failure.test.tsx` and unchanged native Chrome probe now pass against the combined workspace (including the parallel Tasks fix). Those are fixer reruns of independently authored probes; a separate agent still owns final independent acceptance. No cross-vendor PASS is claimed.
