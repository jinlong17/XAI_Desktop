# Discovery Review - xai-web-board-responsive-smoke

## Scope

Roadmap row #12 is a verification and polish slice for the Web Project module
currently exposed at `/app/board`.

The target surfaces are:

- Board view
- Table view
- Calendar view
- Timeline view
- Card detail modal

Dashboard and Map remain useful secondary surfaces, but this row is explicitly
bounded to the five surfaces named in the roadmap note.

## Current Code Truth

- The runtime module is `packages/plugin-web-board-workspaces`.
- The shipped route is `/app/board`; `/app/projects` is still only a future
  alias/deep-link decision.
- `BoardWorkspacesModule` composes board-core Kanban plus board-views Table,
  Calendar, Dashboard, Timeline, and Map.
- The view picker exposes stable test ids: `vp-btn-board`, `vp-btn-table`,
  `vp-btn-calendar`, `vp-btn-timeline`.
- Core view surfaces expose stable test ids: `board-lists`,
  `board-table-wrap`, `board-cal`, `board-timeline`.
- Card detail exposes `card-detail-modal` and editable field hooks.

## Layout Observations

- The global board canvas (`packages/plugin-web-tokens/src/layout.css`) allows
  horizontal and vertical scrolling, which is acceptable for dense table and
  timeline views.
- Board detail already collapses to a single column at `max-width: 900px`.
- The top toolbar and bottom switcher do not have a dedicated responsive smoke
  contract yet; real-browser evidence is required before marking this row
  shipped.
- Table and Timeline intentionally remain dense data surfaces and may scroll
  horizontally on mobile. The acceptance criterion is no broken app shell, no
  framework overlay, no clipped modal controls, and reachable core controls.

## Selected Verification Model

Use a browser smoke matrix with seeded default local board data:

| Viewport | Width x Height | Required surfaces |
|---|---:|---|
| desktop | 1440 x 900 | Board, Table, Calendar, Timeline, Detail |
| mobile | 390 x 844 | Board, Table, Calendar, Timeline, Detail |

Each surface must pass:

- route identity is `/app/board`
- page is not blank
- no framework error overlay
- no relevant console error
- target test id is visible or reachable
- screenshot evidence captured
- at least one interaction opens card detail

## Out Of Scope

- Cross-browser Safari/Firefox parity.
- Real share backend, sync, export/import, permissions, automation, comments.
- `/app/projects` alias.
- Redesigning Board into a mobile-native stacked board unless smoke exposes a
  concrete blocker.

## Recommendation

Create a lightweight smoke artifact and record the browser evidence in
`packages/xai-web-board-responsive-smoke/docs/dev_log.md`. If the first smoke
run exposes header/switcher wrapping or modal clipping, fix only the CSS needed
to make the named surfaces reachable at 390px width.
