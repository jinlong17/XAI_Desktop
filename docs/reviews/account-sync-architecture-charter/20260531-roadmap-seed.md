# Roadmap Seed Brief - account-sync-architecture-charter

## Requirement

Design the Account Cloud Sync architecture charter as the shared infrastructure layer for Web, Mac Desktop, Desktop Plugin, Site, Admin Dashboard, and Workflow systems. The output must make clear that Account Cloud Sync is not a standalone product surface: it is the account, device, repository, push/pull, conflict, and read-model substrate that other product modules consume.

## Hard Constraints

- Read and preserve `CLAUDE.md` product module routing, `docs/PRODUCT_MODULE_MAP.md`, ADR-0013 D4, `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, and `docs/workflow/roadmap/sync-v1.md`.
- Do not redefine the `RepoRecord` model, `syncScope`, or the sync-v1 crypto protocol.
- Treat `sync-v1` implementation work as paused until the project unfreezes it; this slice is architecture and contract planning only.
- Preserve the D3 rule: Web and App never sync to each other directly.

## Acceptance Signal

- A canonical architecture document exists with topology, ownership, module boundaries, source-of-truth hierarchy, and non-product positioning.
- The document explicitly routes future implementation work into `codex/sync/<feature>` and cross-module follow-ups into the owning module.
