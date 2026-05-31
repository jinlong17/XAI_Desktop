# Roadmap Seed Brief - account-sync-verification-gates

## Requirement

Define the verification, observability, and governance gates for Account Cloud Sync as a shared infrastructure layer. The gate suite must cover entity contracts, repository drivers, push/pull behavior, conflict handling, admin read models, site boundaries, workflow state, and two-device convergence.

## Hard Constraints

- Every account-sync feature must satisfy ADR-0013 D4's 9-item completeness rule.
- Device-local regressions must prove no remote outbox entry is produced.
- Verification must separate mocked contract tests, local Docker/Postgres tests, browser IndexedDB tests, desktop SQLite/SQLCipher tests, and live external gates.
- Security and privacy telemetry must not include payloads, entity ids that expose private content, raw device ids, provider secrets, or key material.

## Acceptance Signal

- A gate checklist exists for design review, feature-plan intake, feature-verify, pre-ship, and live rollout.
- The checklist includes two-device smoke, conflict shadow evidence, admin RBAC/audit tests, and sync health/observability criteria.
