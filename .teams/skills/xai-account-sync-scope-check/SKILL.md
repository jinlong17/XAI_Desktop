---
name: xai-account-sync-scope-check
description: Classify an XAI persisted-entity change against ADR-0013 D4 and the account-sync verification gates, then emit a D4 scope check receipt. Use for account-sync completeness checks, device-local-never-syncs (outbox-exclusion) proofs, entityType/syncScope drift detection, syncScope classification, the D4 9-item gate, and routing entity changes before they reach the paused sync line. Receipt-only — it does not implement sync, unpause sync-v1, merge, ship, or write entities.ts / plugin types.ts.
---

# xai-account-sync-scope-check

Project-layer gate for ADR-0013 **D4** (account cloud-sync per-feature contract). Use this skill
when a persisted entity (`RepoRecord` / `syncScope` / `entityType`) is added or changed, to classify
its sync scope and prove completeness, then emit the **D4 scope check receipt**.

This skill is a **classifier and check-receipt emitter only**. It does not implement runtime sync,
unpause `sync-v1`, write `packages/core-data/src/entities.ts` or any plugin `types.ts`, merge
branches, run `ship`, or bypass `feature-verify` / `bug-verify`. The `sync` and `plugin` lines are
P2 PAUSED (ADR-0010); landing entity source is a separate operator-confirmed step.

## Read First

- `docs/adr/0013-branch-sync-governance.md` D4 (the 9-item completeness rule + device-local-never-syncs)
- `docs/contracts/account-sync-verification-gates.md` (the authority for §3 evidence lanes + §4 gate matrix + stage checklists + §9 observability allow/denylist)
- `docs/contracts/account-sync-entity-scope-matrix.md` (CANONICAL scope per entityType — which entities are account-sync vs device-local vs mixed)
- `docs/contracts/data-repository-v0.md` (sole authority for `RepoRecord`, `syncScope`, outbox ownership — do not redefine)
- `CLAUDE.md` Agent / Skill Tracking Contract when changing this skill or its mirrors
- `AGENTS.md` Workflow V2 Handoff Display rules when this gate is executed by a spawned agent

## Inputs

```text
/xai-account-sync-scope-check
Entity delta: <commit | range | PR | changed paths | entityType | surface summary>
Mode: dry-run | gate
```

If `Entity delta:` is omitted, infer the smallest current delta from `HEAD`, the current branch diff,
or named files. If the entity / scope cannot be proven from repo evidence, stop with `Verdict: BLOCKED`.

## Hard Constraints

1. **Receipt-only.** Emit a D4 scope check receipt under `docs/reviews/<feature>/`. Do not implement
   the sync pipeline (push/pull/conflict/migration) — that is paused runtime work.
2. **Do not write entity source.** Never modify `packages/core-data/src/entities.ts`,
   `RepoEntityTypeMap`, the `assertRepoRecord` guard, or any plugin `src/types.ts`. Registering or
   renaming an `entityType` is source landing on the paused `sync`/`plugin` line and needs operator
   unfreeze.
3. **Do not redefine contracts.** `RepoRecord`, `syncScope`, crypto, envelope, nonce, and device
   identity are owned by `data-repository-v0.md` / `TECHNICAL_REQUIREMENTS.md` / `sync-v1.md`.
4. **Check both layers.** The central registry (`entities.ts` `RepoEntityTypeMap` + `assertRepoRecord`)
   AND the runtime declaration (each plugin's `src/types.ts` + its repo adapter) must agree on
   `entityType`, `syncScope`, and `schemaVersion`. A mismatch is `DRIFT`, not `SCOPE_OK`.
5. **device-local proof is mandatory.** A `device-local` entity must be shown to never produce a
   remote outbox entry or push envelope candidate (the central `assertRepoRecord` invariant, not just
   an adapter-set field).
6. **Base on real evidence.** Cite changed paths, the entity interface, the adapter, the
   `assertRepoRecord` guard, and tests. If impact is unprovable, use `Verdict: BLOCKED`.

## Check Workflow

1. Identify the entity delta and changed paths:
   - `git show --name-status --stat <commit>` / `git diff --name-status <base>...<head>` / `git status --short`.
   - Find every `entityType:` declaration for the concept: `rg "entityType" packages apps -g '*.ts'`.
2. Cross-check the two layers:
   - central: `packages/core-data/src/entities.ts` (`RepoEntityTypeMap`, the entity interface) + `repo-utils.ts` `assertRepoRecord` (the E3005 invariant);
   - runtime: the owning plugin's `src/types.ts` interface + its repo adapter (`save()` syncScope, `entityType` literal).
   - If the central `entityType` string differs from the runtime one, or `assertRepoRecord` does not enforce this entity's `syncScope`, that is **DRIFT**.
3. Classify the scope tier (S0-S3) using `account-sync-entity-scope-matrix.md` as the canonical source.
4. Run the **9-item completeness check** (mark device-local exemptions explicitly).
5. Map evidence lanes (§3) and the relevant §4 gates; mark any missing lane `deferred_gate` with reason + owner (never silent).
6. Emit the receipt in the output format below.

## Scope Tiers

| Tier | Use When | Required Action |
|---|---|---|
| S0 device-local | Matrix says device-local (e.g. `clipboard.item`, planned `widgets.widget`). Must never sync. | Prove items 1-3 + 7 + outbox-exclusion. Items 4-6, 8-9 are exempt (must NOT exist). |
| S1 account-sync | Matrix says account-sync (e.g. `organizer.grid`, `labels.label`, `productivity.todo/habit`, `project.board/card`). | All 9 items required or explicit `deferred_gate`. |
| S2 mixed | Record splits a syncable subset + local-only fields (e.g. `organizer.item`). | D4 full suite for the syncable subset; local-only tests for the downgraded fields. |
| S3 unregistered-drift | `entityType` used at runtime but absent from `RepoEntityTypeMap`, OR central vs runtime `entityType`/`syncScope`/`schemaVersion` mismatch, OR `assertRepoRecord` does not enforce its scope. | `Verdict: DRIFT`. Name the canonical string (per matrix) and the reconcile action; do NOT land the fix here (paused line). |

## D4 9-Item Completeness

1. `entityType` — dotted slug `^[a-z]+\.[a-z_]+$`, registered in `RepoEntityTypeMap`.
2. `schemaVersion` — pinned, with a migration plan if changing an existing entity.
3. local store mapping — Web IndexedDB ↔ App SQLite/SQLCipher columns.
4. push mutation format — outbox → `/sync/push` envelope. *(device-local: exempt — must not exist)*
5. pull apply rule — `/sync/pull` PullRecord → upsert/conflict route. *(device-local: exempt)*
6. conflict policy — flag or explicit merge; never silent last-write-wins. *(device-local: exempt)*
7. Web IndexedDB test.
8. App SQLite/outbox test. *(device-local: replace with an outbox-exclusion proof)*
9. two-device convergence smoke (A writes → B converges). *(device-local: exempt)*

## Verdict Mapping

- All required items present + central guard enforces scope -> `SCOPE_OK`, `Next workflow: record-only`.
- Registered + scoped but missing >=1 required item (no exemption) -> `INCOMPLETE`, `Next workflow: feature-plan (define missing items)`.
- Central vs runtime mismatch / unregistered / guard gap -> `DRIFT`, `Next workflow: reconcile-then-operator-unfreeze`.
- device-local entity that can reach the outbox / push candidate -> `BLOCKED` (device-local-never-syncs violated).
- Evidence ambiguous or unprovable -> `BLOCKED`.

## Output Format

The final response must contain the receipt. Keep field names and value domains intact.

```text
D4 Scope Check Receipt
  Verdict:          SCOPE_OK | INCOMPLETE | DRIFT | BLOCKED
  Entity delta:     <entityType(s) / changed paths / surface summary>
  Scope tier:       S0 device-local | S1 account-sync | S2 mixed | S3 unregistered-drift
  Canonical scope:  <device-local | account-sync | mixed>  (source: entity-scope-matrix.md)
  Layer agreement:  central(entities.ts): <entityType/syncScope/schemaVersion>
                    runtime(plugin types.ts): <entityType/syncScope/schemaVersion>
                    guard(assertRepoRecord): enforces-scope: yes|no
  9-item:           1.entityType:   ok|missing|exempt
                    2.schemaVersion: ok|missing|exempt
                    3.local mapping: ok|missing|exempt
                    4.push format:   ok|missing|exempt
                    5.pull apply:    ok|missing|exempt
                    6.conflict:      ok|missing|exempt
                    7.web test:      ok|missing|exempt
                    8.app test:      ok|missing|exempt
                    9.two-device:    ok|missing|exempt
  Evidence lanes:   mocked:<present|deferred_gate|n/a> docker:<...> browser-idb:<...> desktop-sqlcipher:<...> live:<...>
  device-local proof: <n/a | outbox-exclusion proven | NOT proven>
  Required action:  <none | define missing D4 items | reconcile entityType/syncScope drift | block: device-local can sync>
  Next workflow:    record-only | feature-plan (define missing items) | reconcile-then-operator-unfreeze
  Scope status:     compliant | incomplete | drift | blocked
```

If executed as a Workflow V2 spawned agent, wrap only this receipt in the required `## Handoff`
block and do not append a conversational follow-up after it.
