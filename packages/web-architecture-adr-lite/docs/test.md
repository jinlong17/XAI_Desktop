# web-architecture-adr-lite — Test Plan

## Automated Checks

```bash
test -f docs/adr/0006-web-face-hybrid-reuse-boundary.md
test -f docs/reviews/web-architecture-adr-lite/20260521-feature-brief.md
test -f docs/reviews/web-architecture-adr-lite/20260521-discovery-review.md
rg -n "ADR-0006|hybrid rule|Console PRD" docs/planning/sub-prds/web/PRD.md docs/reviews/web-ticktick-parity/20260521-feature-brief.md docs/workflow/roadmap/web-ticktick-parity.md docs/adr/0003-three-faces-architecture.md
```

## Manual Verification

- Confirm the ADR states one clear implementation stance for future Web rows.
- Confirm the stance explicitly addresses plugin reuse vs Web-specific rewrite, UI truth source, drift risk, shared contracts, and maintenance cost.
- Confirm no product code paths were changed.

## Mock Strategy

None. This slice is document-only.

## Acceptance Focus

- Reviewer can determine whether future Web rows should be judged by source reuse or by contract/behavior consistency.
- The accepted ADR is easy to discover from the Web PRD, feature brief, and roadmap manifest.
