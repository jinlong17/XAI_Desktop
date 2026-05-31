# Discovery Review - account-sync-verification-gates

| Field | Value |
|---|---|
| Feature | account-sync-verification-gates |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #10 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for a docs-only governance and verification
authority that closes the Account Cloud Sync roadmap. It must cover entity
contracts, repository drivers, push/pull behavior, conflict handling, admin
read models, Site boundaries, workflow state, and two-device convergence.

Required constraints from the roadmap seed and shipped rows:

- ADR-0013 D4's 9-item completeness rule remains the base requirement for any
  account-sync feature;
- device-local regressions must prove that no remote outbox entry is produced;
- verification evidence must remain separated by environment and trust level:
  mocked contract, Docker/Postgres, browser IndexedDB, desktop SQLite/SQLCipher,
  and live external;
- observability must not capture payloads, private entity ids, raw device ids,
  provider secrets, or key material;
- the contract must preserve `RepoRecord`, `syncScope`, crypto invariants, and
  paused runtime `sync-v1`.

Grounded authorities:

- `docs/contracts/account-sync-surface-adapters.md` already freezes surface
  responsibilities for Web, App, Plugin, and downstream metadata consumers.
- `docs/contracts/account-sync-admin-read-models.md` already defines control-
  plane guardrails, admin audit separation, and workflow-truth inheritance.
- `docs/contracts/account-sync-site-entry-contract.md` already defines public-
  boundary constraints for Site pages and source-backed security claims.
- `docs/contracts/account-sync-workflow-state-contract.md` already defines
  repository-truth workflow governance and derived-only workflow snapshots.
- `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, and
  `docs/workflow/roadmap/sync-v1.md` remain the sole authorities for repository
  semantics, crypto, and runtime protocol behavior.

External research: not required. This row is fully constrained by repo-local
contracts and governance documents.

## 2. Canonical naming and output shape

Canonical feature name: `account-sync-verification-gates`.

Title: Account Sync verification gates.

Naming rationale:

- the row is not another surface contract; it is the umbrella gate authority
  that later rows cite at verify, ship, and rollout time;
- the slug stays narrower than "account-sync-acceptance-suite" and broader than
  any single runtime feature, which matches its governance role;
- the canonical build target is a shared contract doc at
  `docs/contracts/account-sync-verification-gates.md`.

Selected shape:

- planning artifacts remain under
  `docs/reviews/account-sync-verification-gates/`;
- the later build phase should add one canonical shared contract at
  `docs/contracts/account-sync-verification-gates.md`;
- the contract should be registered in `docs/contracts/README.md`.

## 3. Candidate options

### Option A - One shared master gate contract with evidence lanes

Create one canonical contract in
`docs/contracts/account-sync-verification-gates.md` containing:

- a master gate matrix by concern;
- separated evidence lanes by environment and trust level;
- stage checklists for design review, feature-plan intake, feature-verify,
  pre-ship, and live rollout;
- observability allowlist and denylist rules;
- rules for storing and citing verification receipts.

Pros:

- one authority for all later account-sync runtime rows;
- easy to trace against shipped rows #1-#9;
- makes negative proof and privacy rules explicit, not implied.

Cons:

- must stay governance-only and avoid drifting into runtime harness design.

### Option B - Extend ADR-0013 D4 only

Keep the final gate as an expanded ADR-0013 D4 checklist without a separate
contract doc.

Pros:

- fewer files;
- keeps all completeness discussion in one ADR.

Cons:

- ADR-0013 D4 is topology and completeness governance, not a full verify and
  observability authority;
- would force later features to infer environment-specific evidence lanes and
  stage checklists from prose;
- makes it harder to evolve verification policy without reopening the branch
  topology ADR.

### Option C - Distribute the gate across existing surface contracts

Leave each surface contract to define its own verify rules and let `feature-
verify` compose them case by case.

Pros:

- least up-front writing;
- keeps each surface close to its own rules.

Cons:

- no single definition of "ready to ship";
- high risk of inconsistent evidence standards;
- device-local negative proof and telemetry privacy would be easy to under-specify.

## 4. Recommendation

Recommend Option A: one shared master gate contract in `docs/contracts/`.

Why this is the right fit:

- row #10 exists specifically to close the roadmap with a cross-surface
  verification and governance suite;
- rows #6-#9 already define what each surface must preserve, so row #10 should
  define how later runtime rows prove they preserved it;
- the contract can stay docs-only while still being concrete enough to block
  over-broad claims of completeness, coverage, or observability safety.

## 5. Decisions to freeze

### 5.1 Evidence must be lane-separated

The contract should freeze five evidence lanes:

- mocked contract tests;
- local Docker/Postgres tests;
- browser IndexedDB tests;
- desktop SQLite/SQLCipher tests;
- live external and two-device gates.

A feature may defer one lane only by writing an explicit deferred gate or
blocker. Silent omission is forbidden.

### 5.2 Device-local requires negative proof

Any feature touching mixed or device-local classes must prove that device-local
mutations produce no remote outbox entry and no push envelope candidate.

### 5.3 Stage-specific checklists are required

The contract should define separate checklists for:

- design review and feature-plan intake;
- feature-verify;
- pre-ship;
- live rollout.

Each stage should name the minimum proofs and the acceptable deferral mode.

### 5.4 Observability is a gate, not an afterthought

The contract should define:

- allowed telemetry fields such as error code, entity type, retry count, batch
  size, HTTP status, duration, conflict flag, and hashed/scoped device handle;
- forbidden fields such as payload content, private entity ids, raw device ids,
  provider secrets, raw API keys, tokens, and key material.

### 5.5 Verification receipts remain repository-truth evidence

Verify outputs, deferred-gate notes, and ship-ready receipts must remain
git-tracked review artifacts. Live dashboards may summarize them but do not
become authoritative.

## 6. Build-shape recommendation

This feature should plan as one docs-only build phase:

1. add `docs/contracts/account-sync-verification-gates.md`;
2. register the contract in `docs/contracts/README.md`;
3. update `docs/reviews/account-sync-verification-gates/dev_log.md` to
   `READY_FOR_VERIFY`.

No runtime code, event contract, Tauri command, or roadmap manifest update is
required for the build phase.

## 7. Review focus

- complete coverage of rows #6-#9 boundary obligations;
- ADR-0013 D4 completeness traceability;
- explicit device-local outbox-negative proof requirement;
- explicit lane separation for mocked, local, browser, desktop, and live
  evidence;
- telemetry privacy and secret-exclusion rules;
- no implied runtime unpause or redefinition of `RepoRecord`, `syncScope`,
  crypto, or workflow truth.
