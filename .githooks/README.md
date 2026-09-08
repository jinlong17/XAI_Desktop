# .githooks — dashboard auto-refresh (opt-in)

Tracked git hooks that refresh the dev-dashboard snapshot on the events that
actually change branch state, **without** breaking the existing cowork
workflow dispatcher.

| Hook | What it does |
|---|---|
| `post-merge` | Regenerate the dashboard snapshot after a merge. |
| `post-checkout` | Regenerate the snapshot after a real branch switch. |
| `post-commit` | Delegate to `scripts/cowork/git-post-commit` (the workflow Status dispatcher). **No** dashboard refresh — per-commit refresh is noise at this repo's cadence. |

## Why opt-in (not auto-enabled)

Enabling these flips `core.hooksPath`, which makes git ignore `.git/hooks` —
where the cowork dispatcher post-commit currently lives. The `post-commit`
here re-chains it, but flipping `core.hooksPath` affects **every** commit in
this clone (including any parallel agent session). So enable it deliberately,
when no other session is mid-commit.

## Enable (per machine — core.hooksPath is local, not committed)

```bash
chmod +x .githooks/*
git config core.hooksPath .githooks
```

Verify the cowork dispatcher still fires:

```bash
git config --get core.hooksPath          # -> .githooks
# commit a dev_log Status change and confirm the usual dispatch/notify runs
```

## Disable / revert

```bash
git config --unset core.hooksPath         # back to .git/hooks (cowork wrapper)
```

> Baseline without hooks is fine: `pnpm dashboard:serve` regenerates on start,
> and the dashboard has a manual 刷新 button (`/api/refresh`).
