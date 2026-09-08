# account-sync-verification-gates - Test Plan

## Planning-Phase Validation

This feature-plan run is docs-only. No runtime, unit, or manual product tests
are required at the planning step.

The planning artifacts should be reviewed for:

- authority traceability back to rows #6-#9, `data-repository-v0`,
  `TECHNICAL_REQUIREMENTS`, paused `sync-v1`, and ADR-0013 D4;
- complete coverage of the required gate surfaces: entity contracts,
  repository drivers, push/pull, conflict handling, admin, Site, workflow,
  two-device convergence, and observability privacy;
- explicit evidence-lane separation;
- explicit device-local outbox-negative proof requirement;
- absence of redefinition of `RepoRecord`, `syncScope`, crypto, device
  identity, admin guardrails, Site public-boundary, or workflow truth.

## Build-Phase Acceptance Checks

When the docs-only build phase creates
`docs/contracts/account-sync-verification-gates.md`, review it against these
gates:

- the contract contains one master verification gate matrix covering:
  - ADR-0013 D4 completeness;
  - repository driver/store mapping;
  - device-local outbox exclusion;
  - push/pull protocol invariants;
  - conflict shadow or explicit merge routing;
  - admin RBAC/audit/secret boundary;
  - Site public-boundary and claim traceability;
  - workflow repository-truth preservation;
  - two-device convergence;
  - observability privacy;
- the contract defines five evidence lanes and states that missing lanes must be
  marked deferred or blocked rather than silently skipped;
- the contract provides explicit checklists for design review, feature-plan
  intake, feature-verify, pre-ship, and live rollout;
- the contract names a telemetry allowlist and denylist and explicitly forbids
  payloads, private entity ids, raw device ids, secrets, tokens, and key
  material from observability output;
- the contract states that verify receipts and deferred-gate notes remain
  git-tracked repository-truth review artifacts;
- the contract is registered in `docs/contracts/README.md`.

## Later Runtime Verification Matrix

This row should require later runtime features to prove:

- entity completeness is evidenced against ADR-0013 D4's 9-item rule;
- device-local mutations produce no remote outbox entry and no push envelope;
- push/pull behavior matches existing protocol and crypto authorities;
- conflicts never degrade into silent last-write-wins;
- admin routes deny missing claims, append audit, and exclude secrets from
  browser-delivered code;
- Site routes remain public-boundary only and every sync/security claim is
  source-backed;
- workflow state remains repository-truth and later dashboards only expose
  derived snapshots;
- live two-device convergence is observed in a real environment or is carried as
  an explicit deferred gate;
- observability surfaces contain only allowlisted fields.

## Mock Strategy

- `Deferred Integration` for live runtime lanes: this row defines the rules,
  not the runtime harnesses.
- Mocked contract tests remain valid only for contract and shape proof; they do
  not satisfy browser, desktop, or live evidence lanes by themselves.

## Commands

No mandatory test command runs for the planning phase.

Recommended verification during later build and verify phases:

```bash
git diff --check -- docs/contracts/README.md docs/contracts/account-sync-verification-gates.md docs/reviews/account-sync-verification-gates
rg -n "device-local|outbox|Docker|IndexedDB|SQLCipher|two-device|conflict|RBAC|audit|workflow|telemetry|payload|device id|secret|key material" docs/contracts/account-sync-verification-gates.md docs/reviews/account-sync-verification-gates
```
