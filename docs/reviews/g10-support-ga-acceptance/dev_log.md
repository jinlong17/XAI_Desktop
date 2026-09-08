# G10-E5/E6 Support Ops and GA Acceptance Dev Log

Workflow: Feature Dev

Executor: Track F Codex worker

Updated: 2026-05-21

Suggested Next: feature-verify after release QA owns the acceptance checklist

## Work Log

- Brief: support SOP and GA acceptance plan.
- Implementation: added `docs/release/support-sop.md` and `docs/release/ga-acceptance.md`.
- Verification: `pnpm --filter desktop build`, `pnpm --filter web build`, `pnpm --filter @repo/core-data test`, `pnpm --filter @repo/plugin-account test`, `cargo check --release`, and `cargo test` passed. Exact `pnpm check` is unavailable; `pnpm typecheck` fails in out-of-scope `plugin-labels`/`plugin-widgets` test type resolution.
- Deferred: Sentry production setup, support inbox, signed distribution smoke, and long-run stability.
