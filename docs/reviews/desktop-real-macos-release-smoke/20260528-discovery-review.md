# Discovery Review — desktop-real-macos-release-smoke

## Problem Framing

`desktop-phase1-rc-release-gate` already closed the repo-side automated Phase 1 RC matrix and shipped with the remaining risk narrowed to four real-macOS GUI checks:

- network-disabled bundled `/app` launch
- drag-install launch from `/Applications`
- native menu interactions
- relaunch behavior across monitor topology changes

Those checks were intentionally deferred because the prior sessions were non-interactive and could not provide trustworthy hardware evidence. The missing deliverable is not more implementation discovery. The missing deliverable is a disciplined real-macOS smoke gate that:

1. inherits the shipped repo-side baseline
2. runs the residual checks on actual macOS hardware
3. classifies each residual explicitly
4. reopens code only if one of those checks reproduces a repo-side defect against the current public contract

This row is therefore a release-smoke evidence feature, not a new Phase 1 implementation slice.

## External Research

No external research required. The decision is internal to the current repo, existing shipped evidence, and the Workflow V2 release-gate contract.

## Candidate Options

### Option A — Dedicated real-macOS residual smoke gate with minimal-fix escape hatch

Create one feature whose build/verify flow is organized around the four residual hardware checks and whose only code-change allowance is a minimal fix when a check reproduces a repo-side public-contract defect.

Pros:

- Matches the roadmap row and seed brief exactly
- Preserves the prior RC gate as the repo-side baseline instead of reopening it unnecessarily
- Produces an explicit classification ledger for every remaining manual residual
- Keeps environment limitations separate from repo blockers
- Preserves ADR-0011 Phase 1 boundaries and the quarantined overlay/control/grid code

Cons:

- Requires real hardware and operator participation for meaningful evidence
- May finish with `BLOCKED_ENVIRONMENT` rather than a clean pass if the runtime environment is unavailable
- If a repo defect is reproduced, the feature must stay disciplined and fix only the owning surface narrowly

### Option B — Reopen `desktop-phase1-rc-release-gate` and fold these checks into another repo-side verify pass

Treat the residuals as unfinished work in the prior RC-gate feature and re-run build/verify from there.

Pros:

- Reuses an existing feature directory
- Keeps all Phase 1 RC notes in one historical place

Cons:

- Conflicts with the roadmap, which explicitly treats this as a new row rather than a reopening
- Blurs the difference between repo-side integrated verification and real-hardware smoke classification
- Encourages unnecessary Phase 1 implementation churn

### Option C — Defer the residuals to `desktop-phase2-integrated-rc-gate`

Skip a dedicated Phase 1 smoke closure and allow the next integrated RC row to absorb these checks later.

Pros:

- Lowest short-term effort
- Avoids handling hardware-specific work now

Cons:

- Violates the acceptance requirement that no manual RC residual remain unclassified
- Leaves external-release confidence ambiguous
- Mixes Phase 1 residual closure with unrelated Phase 2 scope

## Recommendation

Choose Option A.

The repo already has enough automated evidence. What it lacks is a trustworthy manual classification pass on the remaining real-macOS release checks. Option A keeps that work narrowly scoped, keeps Phase 1 stable unless a concrete regression is reproduced, and produces the exact evidence ledger the roadmap row asks for.

## Selected Execution Notes

- The build sequence should map 1:1 to the four residual checks:
  1. network-disabled bundled `/app` launch
  2. drag-install launch from `/Applications`
  3. native menu interactions
  4. relaunch behavior across monitor topology changes plus final matrix
- Before each manual pass, the operator may reuse already-shipped bundle outputs or regenerate them with the canonical desktop commands if fresh artifacts are needed.
- If a manual check reproduces a repo-side defect:
  - classify it `BLOCKED_REPO`
  - fix only the minimal owning surface
  - rerun the smallest necessary automated regression set plus the affected manual smoke
- If the check cannot be executed because of missing hardware conditions, permissions, or environment setup:
  - classify it `BLOCKED_ENVIRONMENT`
  - record the exact limitation separately from repo status
- `DEFERRED_OUT_OF_SCOPE` remains available only for a genuine Phase 2/3 requirement or another condition outside this feature's charter. It must not be used to avoid one of the four named checks casually.

## Risks

- Real-macOS smoke evidence may be unavailable in an automated session, leaving the build step dependent on operator-run hardware checks
- A manual failure can tempt the workflow into a broad re-debug of Phase 1; the plan must resist that and isolate only the reproduced defect
- Monitor-topology relaunch behavior depends on an intentionally variable physical setup, so the evidence record must capture the exact topology used
- If the operator uses stale build artifacts, the classification can drift from current `dev` branch reality

## Open Questions

- Should the feature require fresh `.app` and `.dmg` outputs before manual smoke, or can it rely on the most recent shipped artifacts if the tree is unchanged? Recommendation: prefer fresh canonical outputs when practical; otherwise record the exact artifact provenance.
- If the network-disabled `/app` launch passes from the bundled app but the drag-installed `/Applications` copy cannot be exercised in the current environment, does the feature finish `BLOCKED_ENVIRONMENT` or partially `PASS`? Recommendation: classify per residual, not per feature, then let the final verdict summarize mixed outcomes.
- If monitor-topology relaunch exposes a geometry issue that only appears on a specific setup, should that be considered repo-side? Recommendation: yes if the app violates the shipped persistence contract on a valid topology; otherwise classify the environment constraint explicitly.

## Phased Build Outline

1. **Network-disabled Bundled `/app` Launch**
   - launch the bundled app with network disabled
   - confirm it reaches `/app` and does not bounce to `/auth/login`
   - confirm the normal-window host remains the only default surface
2. **Drag-install Launch from `/Applications`**
   - mount the DMG if needed
   - drag-install to `/Applications`
   - launch the installed copy and confirm the same startup contract
3. **Native Menu Interactions**
   - exercise top-level menu presence and standard actions
   - verify `Reveal Config Folder` and `Reset Main Window State`
4. **Relaunch Across Monitor Topology Changes**
   - validate relaunch behavior after topology change or fallback-to-default handling
   - publish one final residual matrix with explicit classifications and any repo/environment notes
