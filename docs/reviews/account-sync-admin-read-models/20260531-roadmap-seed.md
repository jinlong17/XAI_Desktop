# Roadmap Seed Brief - account-sync-admin-read-models

## Requirement

Define how Admin Dashboard obtains a unified data source from the Account Cloud Sync and account infrastructure layers. The design must provide admin read models for accounts, devices, organizations, usage, quotas, billing state, feature flags, provider status, sync health, audit, and operational queues.

## Hard Constraints

- Admin Dashboard is PROPOSED and must remain an isolated control-plane surface until operator activation.
- Browser code must never receive service-role credentials, provider secrets, or user encrypted payload plaintext.
- Admin audit is append-only and separate from user sync audit, while reusing the existing audit-log-integrity precedent where practical.
- Admin mutations require RBAC check, high-risk confirmation, audit append, and explicit success/failure result.

## Acceptance Signal

- A typed admin read-model catalog exists with data source, freshness, privacy boundary, RBAC scope, and mutation/audit requirements per page.
- The design states which data comes from account/sync server metadata, which comes from billing/AI telemetry, and which remains deferred.
