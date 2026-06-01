# Discovery Review - account-sync-workflow-state-contract

| Field | Value |
|---|---|
| Feature | account-sync-workflow-state-contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #9 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for a docs-only contract that lets Workflow
systems, roadmap manifests, release logs, verification receipts, and developer
dashboards share account/sync status without creating a second mutable source of
truth beside the repository.

Required coverage from the roadmap seed and reviewed feature brief:

- repository-truth artifacts such as roadmap manifests, `dev_log.md`, release
  logs, ADRs, and dashboard source snapshots remain authoritative and must not
  be overwritten by Account Cloud Sync;
- user/product account data and developer workflow state are separated
  explicitly;
- any read model or dashboard that mixes product usage and workflow execution
  state must declare source, refresh cadence, and authority;
- workflow-visible state excludes secrets, raw logs, private user payloads,
  encrypted payload plaintext, service-role credentials, and provider raw
  secrets;
- future release-log, roadmap-state, and sync-health aggregation hooks remain
  read-only derived exposures and are deferred from implementation in this row.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` already fixes sync as
  shared infrastructure and makes downstream surfaces consumers rather than
  payload authorities.
- `docs/contracts/account-sync-surface-adapters.md` already states that
  Workflow is a downstream metadata consumer and not an adapter or payload
  authority.
- `docs/contracts/account-sync-admin-read-models.md` already freezes that
  workflow and release state may only appear as derived snapshots in
  control-plane read models.
- `docs/contracts/data-repository-v0.md` already owns `RepoRecord`,
  `syncScope`, and repository behavior; workflow artifacts are not repository
  records to be pushed through account-sync outboxes.
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
  remain the authority for crypto, encrypted blobs, device identity binding,
  nonce lease, and paused runtime sync behavior.
- ADR-0013 D4 already freezes the account-cloud topology and says new
  account-sync work builds on `syncScope` rather than replacing development
  workflow governance.

## 2. Canonical naming and output shape

Canonical feature name: `account-sync-workflow-state-contract`.

Title: Account Sync workflow state contract.

Naming rationale:

- the row is specifically about the workflow-state boundary inside the wider
  account-cloud planning stack;
- the slug stays narrower than the later verification-gates row and broader
  than any one future dashboard or release-log implementation row;
- the canonical build target is a shared contract doc at
  `docs/contracts/account-sync-workflow-state-contract.md`, which matches the
  cross-surface governance nature of the work.

External research: not required. This row is fully constrained by repo-local
contracts, the roadmap manifest, ADR-0013 governance, and the sync technical
requirements.

Selected shape:

- planning artifacts remain under
  `docs/reviews/account-sync-workflow-state-contract/`;
- the later build phase should add one canonical shared contract at
  `docs/contracts/account-sync-workflow-state-contract.md`.

Reasoning:

- the workflow-state rules are a cross-surface authority and belong in
  `docs/contracts/`;
- this row is docs-only and should not scatter normative workflow-state rules
  across dashboard prototypes, release-log docs, or roadmap files themselves;
- later implementation rows can consume one stable contract instead of
  inferring behavior from several partially overlapping workflow artifacts.

## 3. Candidate options

### Option A - One shared workflow-state contract with a separation matrix

Create one canonical contract in
`docs/contracts/account-sync-workflow-state-contract.md` with:

- a separation matrix for workflow artifact classes;
- a source/cadence/authority schema for mixed-domain read models;
- a deferred hook-point catalog for release-log, roadmap-state, verify, and
  sync-health aggregation.

Pros:

- one authority for workflow-state governance;
- cleanly composes on top of the shipped adapter and admin contracts;
- gives later dashboard and control-plane work a precise review gate.

Cons:

- must be scoped carefully so it does not drift into runtime implementation or
  try to solve the later verification-gates row.

### Option B - Fold workflow-state rules into the admin read-model contract

Expand `docs/contracts/account-sync-admin-read-models.md` instead of adding a
new row #9 contract.

Pros:

- fewer contract files;
- workflow snapshots already appear there as a domain.

Cons:

- admin read-model rules and workflow-state truth rules are adjacent but not the
  same concern;
- row #9 exists specifically to stop Workflow from becoming a parallel state
  system, which is broader than admin exposure alone;
- would blur the difference between source-of-truth governance and control-plane
  consumption.

### Option C - Leave workflow-state rules distributed across roadmap and review docs

Keep the rules implicit in the roadmap manifest, earlier contracts, and future
dashboard rows.

Pros:

- no new contract file;
- least up-front writing.

Cons:

- no single reviewable authority;
- highest risk of drift or accidental cloud-owned workflow state;
- forces later rows to reverse-engineer policy from several documents.

## 4. Recommendation

Recommend Option A: one shared workflow-state contract in `docs/contracts/`
with a separation matrix, source/cadence/authority rules, and deferred hook
catalog.

Why this is the correct fit:

- row #9 is the point where workflow-truth must be frozen explicitly before the
  final verification-gates row can test it;
- the earlier adapter and admin contracts already prove Workflow is a downstream
  metadata consumer, so this row should convert that implication into a direct
  governance contract;
- the contract can stay docs-only while being concrete enough to block future
  attempts to route workflow artifacts through account-sync semantics.

## 5. Decisions to freeze

### 5.1 Workflow artifacts remain repository truth

The contract should state that these artifacts remain git-tracked repository
truth and must not be replaced by cloud-owned or outbox-driven state:

- roadmap manifests;
- `dev_log.md` status panels and work logs;
- release logs and feature shipping receipts;
- ADRs and contract docs;
- dashboard source snapshots or generated documentation committed to the repo.

Derived views may summarize them, but derived views do not become authoritative.

### 5.2 Workflow state is not account-sync payload data

The contract should freeze that developer workflow state:

- is not a `RepoRecord`;
- is not eligible for `syncScope: account-sync`;
- must not enter account-sync outboxes, encrypted blobs, or sync cursors;
- may only be exported as explicitly derived metadata or summaries for operator
  visibility.

### 5.3 Cross-domain read models need source/cadence/authority declarations

Any view that mixes workflow status with account, device, usage, quota,
provider, or sync-health metadata must declare:

- the authoritative source for each field or domain;
- the refresh cadence or snapshot model;
- whether the field is repository-truth, server-truth, or derived-only.

This row should freeze the declaration rule, not invent a runtime API.

### 5.4 Workflow-visible state has a strict exclusion list

Workflow-visible state must not contain:

- secrets or raw secret handles beyond safe presence/health summaries;
- provider raw keys or service-role credentials;
- raw logs or unbounded log payloads;
- private user payloads or encrypted payload plaintext;
- device private key, DEK, KEK, recovery material, or nonce-level protocol
  details.

### 5.5 Deferred hook points stay read-only

The contract should name future hook points for:

- release-log status aggregation;
- roadmap-state snapshots;
- verification receipt summaries;
- sync-health snapshots for workflow-facing dashboards.

All of these remain deferred implementation and read-only derived exposures in
this row.

## 6. Build-shape recommendation

This feature should plan as one docs-only build phase:

1. add `docs/contracts/account-sync-workflow-state-contract.md`;
2. register the contract in `docs/contracts/README.md`;
3. update `docs/reviews/account-sync-workflow-state-contract/dev_log.md` to
   `READY_FOR_VERIFY`.

No runtime code, event contract, Tauri command, or roadmap manifest change is
required for the build phase.

## 7. Review focus

- repository-truth preservation for all workflow artifacts;
- explicit prohibition of workflow artifact entry into account-sync transport;
- quality of the source/cadence/authority declaration rules;
- strict exclusion of secrets, raw logs, and private payload data from
  workflow-visible state;
- no implied unpause of runtime `sync-v1`, `plugin`, `admin`, or `site`
  implementation tracks.
