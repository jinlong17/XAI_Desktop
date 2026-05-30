# Roadmap Seed - desktop-real-macos-release-smoke

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Release-Gate
> Branch: dev

## Requirement

Close the manual hardware residuals carried forward from `desktop-phase1-rc-release-gate`: network-disabled bundled `/app` launch, drag-install launch from `/Applications`, native menu interactions, and relaunch behavior across monitor topology changes.

## Hard constraints

- Do not reopen Phase 1 implementation unless a residual reproduces a repo-side defect against the shipped public contract.
- Keep this as a real-macOS release smoke gate; document environment limitations separately from repo blockers.
- Preserve the normal-window app host and quarantined overlay/control/grid boundary.

## Acceptance signal

Evidence exists for all four residual checks, with each classified as PASS, BLOCKED_REPO, BLOCKED_ENVIRONMENT, or DEFERRED_OUT_OF_SCOPE, and no unclassified manual RC residual remains.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-phase1-rc-release-gate` SHIPPED.
