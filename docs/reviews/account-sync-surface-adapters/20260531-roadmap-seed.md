# Roadmap Seed Brief - account-sync-surface-adapters

## Requirement

Design the Web, Mac Desktop, and Desktop Plugin adapter boundaries that consume Account Cloud Sync without turning it into a product surface. The adapters should explain how each product writes account-sync data, keeps local-first data local, and reacts to sync status/conflicts.

## Hard Constraints

- Web remains the P0 product surface and App UI source; Desktop-impacting Web changes still flow through D3 before reaching App.
- Desktop native/runtime work stays in `app`; plugin SDK/widget work stays in `plugin`; protocol/entity work stays in `sync`.
- Plugins declare entities and use repository APIs; they do not implement push/pull engines.
- Adapter plans must respect P2 paused status for plugin and sync-v1 runtime work.

## Acceptance Signal

- Adapter diagrams or tables exist for Web, Desktop, and Plugin responsibilities.
- Each adapter lists its writable entity classes, read models, offline behavior, conflict UI hooks, and verification gates.
