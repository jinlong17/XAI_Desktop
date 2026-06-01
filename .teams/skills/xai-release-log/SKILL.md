---
name: xai-release-log
description: Maintain XAI release logs and developer-facing change notes. Use when the user asks for 发布 log, 更新日志, changelog, release notes, what shipped, today changed, or wants a commit/feature/system-governance delta recorded with date, product line, verification, and risk.
---

# xai-release-log

Project-layer skill for maintaining `docs/workflow/project/release-log.md`.
Use it after a ship, a scoped feature completion, a workflow/agent/skill change,
or a cross-machine governance update that future sessions need to understand.

This skill records facts. It does not ship, tag, push, create branches, or
invent verification evidence.

## Read First

- `docs/workflow/project/release-log.md`
- `docs/workflow/project/handbook.md`
- `docs/adr/0013-branch-sync-governance.md` for product-line and branch terms
- `AGENTS.md` Agent / skill tracking rules before finishing project-level skill changes

## Inputs

Preferred invocation:

```text
/xai-release-log
Scope: <commit | branch diff | feature name | system docs change>
Product line: <web | desktop-app | desktop-plugin | account-sync | official-site | admin-dashboard | project-system>
Mode: append | draft
```

If the user omits `Scope`, infer the smallest current delta from `git status`,
recent commits, or the named files. If the delta is unclear, draft the entry and
mark unknown fields instead of guessing.

## Entry Workflow

1. Inspect repo evidence:
   - `git status --short`
   - `git log --oneline -5 --decorate`
   - `git diff --stat` or `git show --stat <commit>` for the target delta
2. Classify the product line using the handbook's six-line product map.
3. Record the branch or commit range. If not committed, write `local working tree`.
4. Separate user-visible changes from developer/system changes.
5. Record verification exactly:
   - command and result if run;
   - `not run` with a short reason if not run;
   - `partial` if the evidence is incomplete.
6. Record risks and next steps only when they are concrete.
7. Append to `docs/workflow/project/release-log.md` under the newest date first.

## Entry Format

Use Chinese first. Keep the format compact and scan-friendly.

```md
## YYYY-MM-DD

### <Short Title>

- Product line: <web | desktop-app | desktop-plugin | account-sync | official-site | admin-dashboard | project-system>
- Branch / commit: `<branch>` / `<commit or range>`
- User-visible change: <what a user/operator can see>
- Developer/system delta: <docs, skills, branch rules, automation, tests, contracts>
- Verification: <command/result | not run: reason | partial: reason>
- Risk / follow-up: <none | concrete item>
```

## Quality Rules

- Do not write marketing copy.
- Do not claim something shipped if it is only documented, prototyped, or local.
- Do not hide blockers. Name the exact manual gate, credential, backend, browser,
  or branch dependency.
- If a release entry affects Desktop from Web, include the D3 tier or parity
  receipt status when known.
- If two machines are involved, note which branch line owns the entry and what
  must be relayed to the other machine.

## Output

When appending succeeds, summarize the entry title, date, product line, and
verification status. If the user asked only for a draft, return the markdown
entry without editing files.
