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
