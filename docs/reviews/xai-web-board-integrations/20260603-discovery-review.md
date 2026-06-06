# Discovery Review - xai-web-board-integrations

| Field | Value |
|---|---|
| Feature | `xai-web-board-integrations` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #15 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- Settings already owns an OAuth stub surface for Notion, Google Calendar, and
  Linear through `@repo/plugin-web-settings-rest`.
- The stub connection prefs are registered in `@repo/plugin-web-storage`:
  `xai_pref_integrations_connected_notion`,
  `xai_pref_integrations_connected_gcal`, and
  `xai_pref_integrations_connected_linear`.
- Board detail already supports manual link attachments as
  `BoardCardAttachmentLink { id, url, title? }`.
- Board storage guards accept only the plain attachment shape; there is no
  provider/source metadata, no adapter catalog, and no Board UI that explains
  whether a link came from Calendar, GitHub, Linear, or Drive.
- There is no real third-party token storage, sync worker, webhook receiver,
  external API client, or backend integration path for Board.

## Problem

The Project PRD asks for Trello-style Power-Up/integration readiness. The
current Board can store a generic URL, but it cannot classify links by provider
or give future adapters a stable data contract. If future Calendar/GitHub/
Linear/Drive work stores ad hoc fields on cards, import/export, guards, and
detail rendering will drift.

## Options Considered

### Option A - Wire real third-party sync now

Rejected. Real sync would require OAuth client ids, token exchange/storage,
refresh semantics, backend secrets, API clients, conflict handling, and likely
CSP/security review. Settings explicitly labels the current provider state as a
stub.

### Option B - Add a Board-owned integration adapter contract

Selected. Board-core can expose provider ids, provider metadata, and a typed
attachment metadata helper without depending on Settings internals. Board
Workspaces can render a small card-detail integration link surface that creates
typed external links while preserving the existing attachment array.

### Option C - Depend directly on `plugin-web-settings-rest`

Rejected for this row. Board should not import Settings internal provider
definitions, and the Settings public provider export is intentionally narrow.
Board can still document that the GCal/Linear adapters align with the existing
Settings stub prefs.

## Selected Direction

Use Option B.

This row makes Board integration-ready by adding a stable adapter metadata
contract and a visible card-detail link creation surface. It does not pretend to
perform live third-party synchronization.

## Acceptance

- Board-core exports a provider catalog for Google Calendar, GitHub, Linear,
  Google Drive, and generic link attachments.
- `BoardCardAttachmentLink` remains backward compatible while accepting optional
  provider metadata.
- Board-core helper can create integration-backed attachment links from valid
  HTTP(S) URLs and rejects invalid URLs.
- Storage guards preserve valid provider metadata and reject malformed metadata.
- Board card detail lets the user choose a provider and add a typed integration
  link without breaking existing manual attachments.
- Tests cover the helper, guards, public barrel, and card-detail persistence.

## Out of Scope

- real OAuth token exchange or token persistence
- reading Google Calendar events into Board
- syncing Board cards to Google Calendar/GitHub/Linear
- uploading files to Drive
- Slack notifications
- webhooks
- backend integration jobs
- route alias `/app/projects`
