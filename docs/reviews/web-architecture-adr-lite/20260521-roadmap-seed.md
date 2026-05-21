# Roadmap Seed — web-architecture-adr-lite

> web-ticktick-parity roadmap · feature #1 · wave W0 · ADR-lite gate
> Source PRD: docs/planning/sub-prds/web/PRD.md §1.1, §4, §7.3 · ADR: docs/adr/0003-three-faces-architecture.md
> Status hint: ADR drafted in `docs/adr/0006-web-face-hybrid-reuse-boundary.md`; workflow review pending

## Requirement

Resolve the Web architecture conflict before implementation starts. The user chose a clean Web-specific rewrite, but ADR-0003 is Accepted and requires plugin reuse across overlay, console, and Web; this feature must produce a decision record that either supersedes/revises ADR-0003 or explicitly narrows the clean rewrite into a hybrid rule.

## Hard constraints

- Do not modify product code in this feature unless a tiny doc-link fix is unavoidable.
- The decision must explicitly address plugin reuse vs Web-specific rewrite, Console PRD as UI truth source, drift risk, data-contract sharing, and future maintenance cost.
- Record the chosen stance in a new ADR or an ADR-0003 revision, and update references in the Web brief/roadmap notes if needed.

## Acceptance signal

An accepted decision record exists and the roadmap reviewer can tell exactly which implementation stance future rows must follow.

## Dependencies (advisory — manifest is authoritative)

Depends On: none.
