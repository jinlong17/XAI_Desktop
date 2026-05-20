# Codex Fix Dispatch — Track B Cross-Review Follow-up

**Date**: 2026-05-19
**Reviewer**: Claude (cross-vendor)
**Source review**: `docs/reviews/track-b-cross-review/claude-review.md`
**Scope**: P0 + P1 + P2 across 5 Track B plugins
**Execution mode**: Sequential (labels → console → productivity → clipboard → project)

## Dispatch order and rationale

1. **plugin-labels** — smallest blast radius; canonical adapter-loop fix pattern that the next 4 sessions can reference.
2. **plugin-console** — has a real cross-plugin API contract (`ConsoleDesktopBridge`) that other plugins might pull in; resolve singleton shape before others compile against it.
3. **plugin-productivity** — heaviest internal work (Pomodoro persistence + schema additions).
4. **plugin-clipboard** — security-sensitive (redact-on-store); benefits from console's bridge decision being settled.
5. **plugin-project** — biggest persistence rework; runs last so any infrastructure shifts upstream are visible.

## Per-plugin briefs

| # | Plugin | Brief | Branch |
|---|---|---|---|
| 1 | labels | `docs/reviews/track-b-cross-review/codex-fix-plugin-labels.md` | `codex/track-b-fix-labels` |
| 2 | console | `docs/reviews/track-b-cross-review/codex-fix-plugin-console.md` | `codex/track-b-fix-console` |
| 3 | productivity | `docs/reviews/track-b-cross-review/codex-fix-plugin-productivity.md` | `codex/track-b-fix-productivity` |
| 4 | clipboard | `docs/reviews/track-b-cross-review/codex-fix-plugin-clipboard.md` | `codex/track-b-fix-clipboard` |
| 5 | project | `docs/reviews/track-b-cross-review/codex-fix-plugin-project.md` | `codex/track-b-fix-project` |

## Worktree setup (one-time, before launching first session)

The repo has had parallel-window branch-switching incidents (documented in `docs/workflow/roadmap/xai-v1.track-b-log.md`). To avoid that, each Codex session runs in its own worktree on its own branch.

```bash
# Run from repo root. Creates 5 worktrees + 5 fix branches off the Track B tip.
BASE=codex/track-b-productivity-console
for p in labels console productivity clipboard project; do
  git worktree add -b "codex/track-b-fix-${p}" "/tmp/codex-fix-plugin-${p}" "${BASE}"
done
```

Verify:
```bash
git worktree list
# expect 6 entries: the main repo + 5 /tmp/codex-fix-plugin-*
```

## Sequential dispatch (one terminal at a time)

Each invocation reads its brief via stdin and runs in workspace-write sandbox. Adjust `--model` if the project default doesn't match what `.codex/config.toml` declares.

```bash
# 1. plugin-labels
codex exec \
  -C /tmp/codex-fix-plugin-labels \
  --sandbox workspace-write \
  -o /tmp/codex-fix-plugin-labels/.codex-out.txt \
  "$(cat docs/reviews/track-b-cross-review/codex-fix-plugin-labels.md)"

# When step 1 reports completion AND check-types passes, proceed:

# 2. plugin-console
codex exec \
  -C /tmp/codex-fix-plugin-console \
  --sandbox workspace-write \
  -o /tmp/codex-fix-plugin-console/.codex-out.txt \
  "$(cat docs/reviews/track-b-cross-review/codex-fix-plugin-console.md)"

# 3. plugin-productivity
codex exec \
  -C /tmp/codex-fix-plugin-productivity \
  --sandbox workspace-write \
  -o /tmp/codex-fix-plugin-productivity/.codex-out.txt \
  "$(cat docs/reviews/track-b-cross-review/codex-fix-plugin-productivity.md)"

# 4. plugin-clipboard
codex exec \
  -C /tmp/codex-fix-plugin-clipboard \
  --sandbox workspace-write \
  -o /tmp/codex-fix-plugin-clipboard/.codex-out.txt \
  "$(cat docs/reviews/track-b-cross-review/codex-fix-plugin-clipboard.md)"

# 5. plugin-project
codex exec \
  -C /tmp/codex-fix-plugin-project \
  --sandbox workspace-write \
  -o /tmp/codex-fix-plugin-project/.codex-out.txt \
  "$(cat docs/reviews/track-b-cross-review/codex-fix-plugin-project.md)"
```

## Per-session acceptance gate

After each session, BEFORE launching the next, the dispatcher (Claude or human) verifies:

```bash
cd /tmp/codex-fix-plugin-<name>
pnpm install --prefer-offline   # only on the first run; subsequent worktrees reuse the lockfile-installed pnpm cache
pnpm --filter @repo/plugin-<name> check-types
git log --oneline codex/track-b-productivity-console..HEAD   # expect 1+ commits, no unrelated files
git diff --name-only codex/track-b-productivity-console..HEAD | grep -v "^packages/plugin-<name>/"
# expect empty output — only the target plugin should be modified
```

If any check fails → mark plugin `BLOCKED` in `dev_log.md`, do not advance to the next session.

## Final merge (after all 5 pass)

```bash
# Sequential FF / rebase merge back to the integration branch
git checkout codex/track-b-productivity-console
for p in labels console productivity clipboard project; do
  git merge --no-ff "codex/track-b-fix-${p}" -m "merge(track-b-fix): ${p}"
  # if conflict: STOP, resolve manually, then continue
done

# Clean up worktrees
for p in labels console productivity clipboard project; do
  git worktree remove "/tmp/codex-fix-plugin-${p}" --force
done

# Final verify
pnpm --filter @repo/plugin-labels check-types && \
pnpm --filter @repo/plugin-console check-types && \
pnpm --filter @repo/plugin-productivity check-types && \
pnpm --filter @repo/plugin-clipboard check-types && \
pnpm --filter @repo/plugin-project check-types
```

## Open decisions before dispatch

These are flagged in the briefs but warrant human sign-off:

1. **plugin-console** — `ConsoleDesktopBridge` exported as class only (Host instantiates), OR moved to `@repo/core` entirely. Brief defaults to keeping it in plugin as a class export (cheaper). Confirm.
2. **plugin-clipboard** — Redact-on-store is **irreversible**. Confirm UI warning is enough, or require an explicit "I understand" checkbox.
3. **plugin-clipboard** — `usePasteQueue.start` decision: auto-step with a default `delayMs` (more autonomous) vs. rename to `arm` and require caller-driven loop (more explicit). Brief lets the Codex agent choose.

## Cost / time envelope

- Per session: ~10–30 min wall time, ~$0.50–$2 in tokens (Codex/GPT-5 family per `.codex/config.toml`).
- Total: 1.5–2.5 hours, ~$2.50–$10.
- Sequential mode: ~1 retry buffer per session before manual intervention.
