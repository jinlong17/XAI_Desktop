# web-sync-crypto-contract-preflight — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-sync-crypto-contract-preflight |
| Title | W1 Web Sync crypto and contract preflight |
| Roadmap | web-ticktick-parity · feature #3 · W1 |
| Status | BLOCKED |
| Current Phase | FEATURE_BUILD |
| Suggested Next | feature-auto-build |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (Codex gpt-5-codex) |
| Updated | 2026-05-21 12:18 PDT |
| Blockers | Live Supabase / Realtime / nonce-lease verification remains deferred by requirement; this row is docs-only and mock-first. Local Git index is currently not writable in this session (`.git/index.lock: Operation not permitted`), so phase commit is blocked. |

## Phase Plan

### Phase 1 — Freeze browser crypto choice and Web-facing Sync contract

Status: DONE.

- Created a formal feature brief from the roadmap seed.
- Compared Rust→WASM sharing vs independent browser crypto candidates with current source evidence.
- Selected browser-native hybrid crypto with shared RFC/vector gates.
- Froze `/sync/pull`, `/sync/push`, `commit_seq`/`sync_events.seq`, `blob_aad`, and `X-Device-Id` semantics against shipped Sync W0-W3 artifacts.
- Recorded local mock-only strategy and deferred live gates.

Gate:
- reviewer can judge later Web rows against one browser crypto stance and one Sync wire contract truth

## Risks

- Web PRD still contains older `since_seq` / split-blob language and will need downstream cleanup to avoid drift re-entry.
- Browser deterministic CBOR remains a byte-level drift risk until the runtime row adds fixture-backed tests.
- Recovery signing library/runtime choice is frozen only at the contract level here; the actual browser wiring still needs a focused implementation row.

## Suggested Review Focus

- Confirm Option B is the right browser runtime stance for this repo.
- Confirm the `since_commit_seq` / `commit_seq` correction should override older Web PRD language.
- Confirm `blob_aad` is correctly frozen as derived authenticated context, not a wire field.
- Confirm the mock/live boundary is strict enough for later Web rows.

## Review Notes

feature-review (Codex inline), 2026-05-21 12:11 PDT. Verdict: APPROVED.

Option B matches `ADR-0006` and the roadmap's existing browser runtime direction: independent Web implementation is allowed, but contract truth stays shared through shipped Sync semantics plus RFC/vector fixtures rather than source-level Rust reuse. The `since_commit_seq` / `commit_seq` correction and `blob_aad` treatment align with shipped W0-W3 evidence (`commit-seq-authority`, `sync-engine-pull`, `cipher-envelope-codec`, `deterministic-cbor-aad`, `crypto-tauri-commands`) and should override stale Web PRD wording. The local mock/live boundary is strict enough for downstream Web rows because it freezes exact wire shapes and explicitly defers live Supabase / Realtime / nonce-lease proof without permitting alternate local contracts.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 12:06 PDT | feature-plan (Codex inline) | Fresh plan: created the formal feature brief, wrote the discovery review with external browser-crypto evidence, and initialized design/api/test/dev_log docs that freeze the browser crypto choice, Sync wire semantics, and local mock strategy. | — | feature-review |
| 2026-05-21 12:11 PDT | feature-review (Codex inline) | Approved the docs-only preflight: Option B is consistent with ADR-0006 and roadmap direction; `since_commit_seq` / `commit_seq`, derived `blob_aad`, and the mock/live seam all align with shipped Sync authority. | — | feature-build |
| 2026-05-21 12:16 PDT | feature-auto-build (Codex gpt-5-codex) | Revalidated the docs-only acceptance package: confirmed Option B browser crypto choice, frozen `/sync/pull` + `/sync/push` payload/header semantics, required RFC vector gates (9106/8949/9180/8032), local mock plan, and deferred live gates across discovery + design/api/test docs. Attempted to stage the feature-scope docs for required phase commit, but Git failed with `.git/index.lock: Operation not permitted`; cannot complete commit step in this session. | — | feature-auto-build |
