# Discovery Review - account-sync-architecture-charter

| Field | Value |
|---|---|
| Feature | account-sync-architecture-charter |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #1 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for an architecture-first Account Cloud Sync
foundation that connects Web, Mac Desktop, Desktop Plugin, Site, Admin Dashboard,
and Workflow systems. The seed brief explicitly says Account Cloud Sync must be
infrastructure, not a standalone product.

Grounded constraints:

- `CLAUDE.md` and `docs/PRODUCT_MODULE_MAP.md` classify this as the `sync`
  product module.
- ADR-0013 D4 requires Web and App to sync through one account cloud layer, not
  each other.
- `docs/contracts/data-repository-v0.md` owns `RepoRecord` and `syncScope`.
- `docs/TECHNICAL_REQUIREMENTS.md` owns sync-v1 protocol and crypto invariants.
- `docs/workflow/roadmap/sync-v1.md` keeps runtime sync-v1 implementation
  paused until project unfreeze.

## 2. Selected output shape

Selected shape: a canonical contract document under `docs/contracts/`.

Reasoning:

- The output spans multiple product modules and should be treated as a shared
  engineering contract.
- It needs to cite existing contracts without redefining record or crypto
  internals.
- It must be stable enough for later Web/App/Plugin/Admin/Site/Workflow feature
  rows to consume.

Rejected shapes:

- New app/package implementation: rejected because sync-v1 runtime work is
  paused and this feature is architecture-only.
- Standalone product spec: rejected because Account Cloud Sync is an
  infrastructure layer, not a product surface.
- ADR replacement: rejected because ADR-0013 D4 already governs the topology.

## 3. Architecture risks

| Risk | Treatment |
|---|---|
| Accidentally redefining `RepoRecord`, `syncScope`, or crypto protocol | The charter references those sources as authorities and declares non-goals. |
| Admin Dashboard reading encrypted user payloads | The charter limits Admin to RBAC-guarded server read models and metadata. |
| Web/App direct state bridge | The charter repeats the D4 hub-and-spoke topology. |
| Workflow cloud state replacing repo truth | The charter keeps ADR/roadmap/dev_log/release-log files authoritative. |
| Site/Admin work starting without operator approval | The charter routes those follow-ups to proposed lanes only after confirmation. |

## 4. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Canonical architecture document exists | `docs/contracts/account-cloud-sync-architecture.md` |
| Topology | Charter sections 3 and 4 |
| Ownership and module boundaries | Charter sections 4, 7, and 9 |
| Source-of-truth hierarchy | Charter section 2 |
| Non-product positioning | Charter sections 1 and 11 |
| Future implementation routing | Charter section 9 |

## 5. Review verdict

APPROVED for docs-only build and verify.

This feature should stop at `READY_TO_SHIP`. Runtime implementation, Site branch
creation, Admin branch creation, and sync-v1 unfreeze remain out of scope.
