# Discovery Review - xai-web-board-comments-activity

| Field | Value |
|---|---|
| Feature | `xai-web-board-comments-activity` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #16 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- `BoardCard.activity?: BoardCardActivityEntry[]` already exists in
  `@repo/plugin-web-board-core`.
- The current activity entry is narrow: `kind: "note"`, `body`, `createdAt`,
  and optional `authorId`.
- Board card detail already has a lightweight "Activity" section with a text
  input and "Add note" button.
- The UI renders only body + localized date; there is no comment kind, author
  display, stable timeline badge, mention parsing, notification event, or
  collaboration settings integration.

## Problem

The Project PRD asks for comments and an activity log. The current note field is
useful but underspecified: it cannot distinguish a user comment from a system
note, does not carry author display metadata, and is not documented as the
formal comment/activity contract. Future sync/export and collaboration work need
a stable shape before adding mentions or notifications.

## Selected Direction

Make `BoardCardActivityEntry` a small discriminated union and wire the current
card-detail section to create real comments:

- keep `kind: "note"` valid for backward compatibility
- add `kind: "comment"`
- add optional `authorName`
- expose pure board-core helpers for creating comments and notes
- render the detail timeline with kind labels and author metadata
- keep mention notification explicitly out of scope

## Acceptance

- Board-core types accept `note` and `comment` activity entries.
- Board-core helpers create valid note/comment entries and reject empty bodies.
- Runtime guards accept valid comment metadata and reject malformed activity
  entries.
- Board card detail adds comments through the activity section and persists them
  in `xai_boards_v2`.
- Existing note entries still render and remain valid.
- Tests cover helpers, guards, barrel exports, and detail persistence.

## Out of Scope

- real-time collaboration
- mention parsing or user lookup
- notification fanout
- activity entries for every card/list mutation
- editing/deleting comments
- backend sync conflict policy beyond stable ids
