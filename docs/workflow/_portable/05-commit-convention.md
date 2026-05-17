# 05 — Commit Convention (Portable)

> **Portable layer.** Project-agnostic commit paradigm.
> Source: extracted from the original `COMMIT_CONVENTION.md` (the paradigm parts).
> Project-specific parts (the concrete `scope` naming registry, the layered-commit rules tied to a
> particular directory structure, the project's required doc-sync table) live in
> `../project/commit-convention.project.md`.
> Placeholders: see `00-PORTABLE-MANIFEST.md`.

---

## 1. Goal

A commit is not just a code snapshot. It is also:

- a unit of review
- a debug rollback point
- a multi-agent handoff summary

Every commit must follow: **small steps, single intent, explainable, reversible.**

---

## 2. Core principles

### 2.1 Small-step commits

Each commit should contain exactly one clear intent: one feature point, one API-contract
implementation, one batch of test additions, one single defect fix, one doc sync, one local refactor.

**Forbidden:** one commit mixing multiple features; one commit mixing feature + refactor + style + a
large test change; spanning multiple system layers without explaining why.

### 2.2 Single responsibility

A commit must clearly answer: Why (why the change), What (what changed), Scope (impact range), Risk
(potential risk), Tests (test situation).

### 2.3 Doc sync (mandatory)

If a commit changes a workflow/contract/test-strategy/progress/state, the corresponding docs must be
synced in the same commit. The exact doc-type → doc-file mapping is project-specific — see the project
layer for the concrete table — but the *principle* is universal: **a contract/behavior change and its
doc update ship together.**

---

## 3. Commit message format

### 3.1 Title format

```text
[type](scope): summary
```

### 3.2 type list

- `feat` — new feature
- `fix` — defect fix
- `refactor` — refactor (no behavior change)
- `test` — test additions or adjustments
- `docs` — doc updates
- `chore` — misc maintenance
- `perf` — performance optimization

### 3.3 scope

`scope` must reflect the **real architecture layer**, not a vague label. The concrete legal `scope`
registry (which module names / layer prefixes are allowed) is project-specific — see
`../project/commit-convention.project.md`. The *rule* is universal:

**Forbidden scopes:** `backend`, `frontend`, `misc`, `update`, or any meaningless scope. A scope must
name a real, specific module or layer.

---

## 4. Commit body template (strongly recommended)

```
Why:
<why this change is needed>

What:
<what was actually done>

Scope:
<affected modules / directories>

Risk:
<potential risk>

Docs:
<which md / config files were updated; "None" if none>

Tests:
<test coverage; explain the reason if none>
```

---

## 5. Recommended commit granularity

A common split order:

1. Doc initialization (design/api/test)
2. Config-manifest initialization
3. API-contract implementation
4. Core-logic implementation
5. Unit tests
6. E2E fixes
7. Doc and state sync

---

## 6. Review-friendliness requirements

A commit must be: quick for a reviewer to understand the purpose; clear change boundary; not spanning
unrelated modules; explicit risk points; quick to roll back.

---

## 7. Multi-agent collaboration requirement

A commit must work as a handoff carrier:

- the next agent can understand the change without reading the chat
- it can quickly locate: the reason for the change, the change scope, the next-step suggestion

Recommended: use commit + `dev_log.md` together.

---

## 8. Forbidden

- `update code`, `fix bugs`, `misc changes` as messages
- no scope description
- a large commit with no body
- one commit changing multiple unrelated features
- silently changing shared infra / SDK without explanation
- changing a config-manifest / API without updating docs

---

## 9. Definition of Done

A commit is acceptable only if it is: single-intent; understandable; reversible; docs synced; tests
covered or the reason explained; does not break architecture boundaries.
