# Roadmap Seed Brief - account-sync-workflow-state-contract

## Requirement

Define how Workflow systems, release logs, roadmap manifests, and developer dashboards can share account/sync status without creating a parallel state system. This slice should connect project workflow state to the same account and sync vocabulary while preserving repository-truth for development artifacts.

## Hard Constraints

- Roadmap manifests, dev logs, release logs, and dashboard snapshots remain repository-truth for development workflow; Account Cloud Sync must not overwrite them.
- User/product account data and developer workflow state must be clearly separated.
- Any dashboard/control-plane read model that spans product usage and workflow status must state its source, refresh cadence, and authority.
- Do not store secrets, raw logs, or private user payloads in workflow-visible state.

## Acceptance Signal

- A workflow-state contract explains what can be account-scoped, what remains repo-local, and how Admin/dev dashboards read status without inventing independent state.
- The plan names future hooks for release-log, roadmap-state, and sync-health aggregation.
