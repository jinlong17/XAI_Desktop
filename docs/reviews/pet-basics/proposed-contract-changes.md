## Propose: register `pet.pet` (2026-05-20)

Add to docs/contracts/data-repository-v0.md §3.1:

| `PetEntity` | `pet.pet` | `device-local` (forced) | `name`, `mood`, `energy`, `lastFed`, `personality`, `hidden`, `state` |

Rationale: PetEntity already extends RepoRecord with syncScope "device-local". Pet is intentionally local-only (does not enter outbox). schemaVersion 1.
