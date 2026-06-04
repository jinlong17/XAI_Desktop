# Design - xai-web-board-responsive-smoke

## Intent

This row formalizes responsive smoke coverage for the Web Project module. It is
not a new user-facing feature; it is the validation layer that makes the shipped
Project/Board module credible across desktop and mobile widths.

## Surface Contract

The smoke matrix covers:

- Board view: Kanban columns render and at least one card can open detail.
- Table view: table surface renders and title interaction can open detail.
- Calendar view: calendar surface renders with dated cards or empty state.
- Timeline view: timeline surface renders with scrollable schedule tracks.
- Detail modal: title, description, dates, labels/members, task, checklist,
  attachments, and activity sections remain reachable on desktop and mobile.

## Responsive Expectations

- Desktop `1440x900`: all target surfaces should fit the shell without obvious
  overlap in the first viewport.
- Mobile `390x844`: dense surfaces may use horizontal scrolling. This is
  acceptable for Board columns, Table, and Timeline.
- Mobile detail must collapse to one column and keep close/edit controls
  reachable without horizontal page overflow.
- The bottom Board switcher must not prevent opening or closing detail.
- The toolbar must preserve access to the view picker and Share/Filter controls
  either directly or through horizontal page/canvas scroll if needed.

## Browser Path

Preferred path is the Codex in-app Browser. If the browser runtime is not
callable in the current session, use local Playwright and record the fallback
reason in the dev log.

## Ownership

- `packages/plugin-web-board-workspaces` owns the composed board shell and
  detail modal.
- `packages/plugin-web-board-views` owns Table, Calendar, and Timeline view
  internals.
- `packages/plugin-web-board-core` owns Kanban Board/List/Card rendering.
- This row adds no storage key and no event contract.

## Future Work

- Dedicated mobile board navigation if manual smoke shows horizontal-scroll
  board management is not good enough for daily mobile use.
- Cross-browser Safari/Firefox verification.
- `/app/projects` alias smoke after route decision.
