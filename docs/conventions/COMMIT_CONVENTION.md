# Commit Convention

## Format

```
type(scope): summary

Why: <motivation>
What: <change description>
Scope: <affected areas>
Risk: <potential risks, or "low">
Docs: <documentation changes, or "—">
Tests: <test changes, or "—">
```

## Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, CI, tooling, dependencies |
| `style` | Formatting, whitespace (no logic change) |
| `perf` | Performance improvement |

## Scopes

Use the most specific applicable scope:
- `plugin-organizer` — Smart Container / grid system
- `desktop` — Tauri host / windowing
- `tauri` — Rust backend
- `ui` — Shared UI components
- `workflow` — Subagent / workflow infrastructure
- `docs` — Documentation

## Rules

1. Each commit = single intent
2. Summary line under 72 characters
3. Body explains Why, not just What
4. Reference phase number for feature-build commits: `feat(plugin-organizer): Phase 2 — add resize handles`
5. Record commit hash in `dev_log.md` after each commit
