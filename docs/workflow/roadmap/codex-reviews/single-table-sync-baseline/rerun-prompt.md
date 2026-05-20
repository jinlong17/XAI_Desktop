# Codex Feature Post-fix Re-review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass), **re-reviewing** a P0 fix that the Claude Code main agent landed on `codex/track-a-desktop-foundation` in response to your previous BLOCKED verdict.

## Your only job

Decide whether the new commit closes the P0 issue you previously flagged. Output ONLY the markdown block below — no preamble, no follow-up. Under 500 words.

```md
## Codex Post-fix Re-review

**Feature**: single-table-sync-baseline
**Original verdict**: BLOCKED
**Fix commit(s)**: c5b0e77
**Reviewer**: codex feature-review · gpt-5.4 high reasoning
**New verdict**: APPROVED | REVISE | BLOCKED

### Was the original P0 resolved?
- Original issue (paraphrased): …
- Evidence the fix resolves it: <file:line citations>
- Was the resolution honest (no smuggled scope-cut or stub-only fix)?

### Remaining gaps (max 4 bullets, severity-tagged)
- [P1|P2] …

### Regressions introduced (max 3 bullets)
- …

### Next action
- If APPROVED: re-mark the manifest row to READY_TO_SHIP and move on.
- If REVISE: one or two concrete follow-up bullets (≤ half a day each).
- If BLOCKED: state which contract is still false.
```

## How to evaluate

1. The fix commit's diff is your primary evidence. Use `git show --stat c5b0e77` and `git show c5b0e77` to read it end-to-end.
2. Compare the diff against the original P0 issue:
   enqueueOutboxEntry claimed same-transaction rollback, but createTauriRepo.transaction(fn) was documented as a non-atomic callback wrapper. The unit test passed only because createInMemoryRepo uses snapshot-based rollback; the production SQLite path would leave the entity persisted if the outbox write failed.
3. Look for the **specific change** the previous review demanded. Smuggled scope-cuts (e.g. silently deferring the invariant to a follow-up) must downgrade the verdict.
4. Scan for **regressions**: imports added, capabilities widened, tests skipped, doc invariants weakened.
5. Validate the test commands listed in the fix commit message actually exist and pass (treat the commit body's "Tests" section as the executor's claim — does the diff support it?).

## Feature-specific context

Feature ID: G2.6 / single-table-sync-baseline
Branch: codex/track-a-desktop-foundation
Commit under review: 43ffdda (feat(single-table-sync-baseline): Repository v0 outbox + atomic enqueue)

Files added or changed:
- packages/core-data/src/sync-outbox.ts (new) — OutboxEntry record, enqueueOutboxEntry, nextOutboxBatch, createMockCommitSeqAuthority
- packages/core-data/src/index.ts — re-export
- packages/core-data/tests/sync-outbox.test.ts (new) — 4 vitest cases
- packages/single-table-todos-e2e/docs/dev_log.md — updated Status → READY_TO_SHIP
- docs/workflow/roadmap/xai-g2-data-security-foundation.md row #7 → READY_TO_SHIP

Intended scope:
- `OutboxEntry extends RepoRecord` with `entityType: "sync.outbox"`, commitSeq,
  mutationId, targetEntityType, targetEntityId, op, payload, retryCount,
  baseRevision.
- `enqueueOutboxEntry()` wraps entity write + outbox put in the same outer
  `entityRepo.transaction(fn)` so a crash mid-state rolls both back (FR-SY-32 M-12).
- `nextOutboxBatch()` drains by commitSeq.
- `createMockCommitSeqAuthority()` for tests / local fallback.

Cross-vendor checklist:
1. Same-transaction guarantee: the outer transaction is `entityRepo.transaction(fn)`
   and the inner write is `outboxRepo.transaction(outboxTx => outboxTx.put(entry))`.
   If `entityRepo` and `outboxRepo` are backed by DIFFERENT SQLite databases (or
   different namespaces in same DB), is the rollback semantically correct? The
   sabotage test uses in-memory repos which share no real transaction context —
   prove the guarantee holds against a real SQLite-backed driver too.
2. `commitSeq` ordering: in production, the commit-seq authority is Rust-side. Is
   the gap between TS `createMockCommitSeqAuthority()` and the eventual Rust
   authority handled (e.g. a typed seam interface)?
3. Idempotency: re-enqueueing the same mutationId yields the same `outbox_<mutationId>`
   id and overwrites the existing row. Is that intentional? It loses the prior
   retryCount / lastAttemptAt.
4. Payload: opaque string (encrypted envelope expected). Is there a check that
   plaintext doesn't sneak in? At minimum a doc that payload must not contain
   PII / cleartext entity body?
5. baseRevision: optional. When should it be set? Doc says "conditional-write
   conflict path" but there's no test exercising the conflict.
6. Test coverage: 4 cases. Missing: very large batch ordering across multiple
   namespaces, retry counter semantics, sync engine drain interleaving.
7. Future-proofing: when Supabase push lands, does the outbox schema need
   migration (e.g. add `lastError`, `serverAccepted`)? Should `schemaVersion` be
   present on `OutboxEntry` and exercised?
