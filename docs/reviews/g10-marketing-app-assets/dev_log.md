# G10-E3/E4 Marketing Site and App Assets Dev Log

Workflow: Feature Dev

Executor: Track F Codex worker

Updated: 2026-05-21

Suggested Next: feature-verify after final screenshots are captured

## Work Log

- Brief: landing, docs, app icon inventory, and App Store listing draft.
- Implementation: rebuilt `/` as an RC landing page, added `/docs`, and added `docs/release/app-store-listing.md`.
- Verification: `pnpm --filter web build` passed; `GET /` and `GET /docs` returned 200; icon files exist in `apps/desktop/src-tauri/icons/`.
- Deferred: final signed screenshots, listing review, and App Store privacy labels.
