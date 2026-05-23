# Roadmap Seed — xai-web-board-workspaces

> xai-web-console roadmap · feature #9 · wave W2 · Module (split from board)
> Source PRD: web design/DESIGN.md §4.3 — Workspace + Switcher + Creator + PM Template + Status Overview + Multi-panel
> Source Code: web design/module-board.jsx (BoardSwitcher, BoardCreator, StatusOverviewBanner, InboxPanel, PlannerPanel)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the workspace + multi-board layer: colored Workspace chips (Personal / Team Workspace), board switcher modal (search + group by workspace + grid of board cards + "New board" entry), board creator with 3 templates (Basic Kanban / PM for Teams / Blank), Project-Management-for-Teams template (5 stages: To Do gray / In Progress blue / In Review yellow / Blocked red / Done green + label set Forms/Accounts/Feedback/Billing/Research + Status Overview banner with ring chart), and the bottom 4-button multi-panel mode (Inbox 260px / Planner 320px / Board flex / Switch Boards trigger).

## Hard constraints

- Multi-panel rule: at least one panel must stay open; single selection ⇒ full-width fill; 2 or 3 selected ⇒ side-by-side.
- Panel state persisted to `xai_board_panels`; Inbox cards to `xai_board_inbox`.
- PM Status Overview ring chart must reflect live card distribution per stage with percentages.
- All workspace + board names bilingual.

## Acceptance signal

Switcher opens, search filters across workspaces, create-new-board with all 3 templates produces valid Board records, PM template renders Status Overview + colored stages + label set, and the 4-button multi-panel toggling matches DESIGN.md §4.3 rules.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-board-core.
