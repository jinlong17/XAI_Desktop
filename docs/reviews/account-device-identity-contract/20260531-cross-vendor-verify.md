# Cross-vendor Verify - account-device-identity-contract

| Field | Value |
|---|---|
| Feature | account-device-identity-contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #3 |
| Build commit | `9fd1cb7` |
| Verifier | Cursor Agent |
| Mode | `agent -p --mode ask --trust` |
| Date | 2026-05-31 |
| Verdict | PASS - READY_TO_SHIP |

## Scope

The verifier performed a read-only cold read of these files:

- `docs/contracts/account-device-identity-contract.md`
- `docs/contracts/README.md`
- `docs/reviews/account-device-identity-contract/20260531-roadmap-seed.md`
- `docs/reviews/account-device-identity-contract/20260531-discovery-review.md`
- `docs/reviews/account-device-identity-contract/dev_log.md`
- `docs/contracts/account-cloud-sync-architecture.md`
- `docs/contracts/account-sync-entity-scope-matrix.md`
- `docs/contracts/data-repository-v0.md`
- `docs/TECHNICAL_REQUIREMENTS.md`
- `packages/web-auth-device-session/docs/api.md`
- `packages/plugin-account/src/account.ts`
- `packages/plugin-account/src/device-management.ts`
- `packages/plugin-account/src/rekey.ts`
- ADR-0013 D4 in `docs/adr/0013-branch-sync-governance.md`
- roadmap row #3 in `docs/workflow/roadmap/account-cloud-sync-foundation.md`
- `git show --stat 9fd1cb7`

## Gate Results

| Gate | Result | Evidence summary |
|---|---|---|
| G1 — Shared infrastructure positioning preserved | PASS | `account-device-identity-contract.md` §1 explicitly states it builds on `account-cloud-sync-architecture.md`. The architecture charter §1 fixes Account Cloud Sync as shared infrastructure and the new contract cites it as a required authority. `docs/contracts/README.md` now registers the contract alongside the two prior charter rows. The hub-and-spoke topology (`Web ⇄ account cloud ⇄ App`) and the no-direct-Web-to-App-sync rule are carried through unmodified from the charter. |
| G2 — `account.device` resolved without redefining `RepoRecord`/`syncScope` | PASS | Contract §2.1 explicitly resolves `account.device` as server-authoritative metadata plus local secure material in v1, not a first-class user-payload `RepoRecord`. §10 lists "No new `RepoRecord` or `syncScope` definition" as a non-goal. `data-repository-v0` §2.1 deferred-entities table entry for `account.device` is unchanged. The entity scope matrix §3.2 deferred row for `account.device` is unchanged. No new `syncScope` value is introduced. |
| G3 — Existing device model preserved | PASS | Contract §4 (Device model invariants table) and §5 (Lifecycle contract) reproduce the full model: client `device_id` as surface-local anchor; server `encryption_device_id` as server-assigned sync identifier; per-device keypair (private key in local secure storage only, public key server-side); per-device DEK wrap with no plaintext DEK transfer; `active`/`revoked` minimum status states; `Authorization` + `X-Device-Id` + `X-Sync-Version` device-bound headers through one canonical seam; revocation forces cleanup and rekey. These map 1:1 to `@repo/plugin-account/src/device-management.ts` (`AccountDeviceStatus`, `DeviceRevokeResult.rekeyRequired`), `rekey.ts` (`RekeyDeviceGrant.status`, `assertCanPushWithKey`), and `web-auth-device-session` api.md (RPCs, `device_revoked` error semantic). |
| G4 — Web/Desktop session ownership stays surface-local under one shared account authority | PASS | Contract §2.2 and §6 state explicitly that Web and Mac Desktop each maintain their own local session material and local device identity; neither becomes the other's upstream session authority. Both remain clients of the shared account cloud layer. `account.ts` on the desktop side uses `KeychainClient` for refresh token persistence (surface-local), and the browser side (`web-auth-device-session` api.md) uses IndexedDB-backed custom `SupportedStorage`. No Web-to-App shortcut is introduced. |
| G5 — Admin claims stay separate from ordinary product sessions | PASS | Contract §2.3, §3 (Admin claim row), §6 (Surface responsibility matrix), and §9 (Verification gates) all state that Admin Dashboard uses dedicated admin claims plus server/admin APIs and must not be inferred from ordinary product login state. Ordinary Web Console and Desktop sessions do not gain admin powers. The seam map §8 records future Admin APIs as a gap to be filled with proper claim issuance, not inherited from product sessions. |
| G6 — Site limited to account entry/status; cannot bypass auth/device/admin contract | PASS | Contract §2.3 explicitly forbids Site from bypassing account, device, or admin claim checks. §6 Surface responsibility matrix row for Site: allowed = "Offer account entry links, release/status messaging, curated public account/security documentation"; must not = "bypass auth/device checks, host private account data, or act as an admin surface". This is consistent with the architecture charter §4 and §6. |
| G7 — Browser-visible secret leakage explicitly forbidden for all required material | PASS | Contract §7 (Secret and credential boundary rules) provides a complete table. Service-role credentials: never browser-visible. Provider raw secrets: never browser-visible. Master password: never persisted in browser-visible state. Secret key: never persisted in browser-visible state. KEK/DEK raw material: never browser-visible. Device private key: never browser-visible. Refresh token: browser JS must not read HttpOnly-only variants; no unrelated storage mirrors. Recovery seed/proof secret: never browser-visible. All six required material classes from the gate specification are covered in the table. |
| G8 — Seam map correctly identifies current gaps | PASS | Contract §8 (Current package seam map and gaps) has four rows: `@repo/web-auth-device-session` owns browser auth/session/device with explicit stop-before boundary at DEK/KEK/admin; `@repo/plugin-account` owns desktop credential/revoke/rekey types with explicit note that transport remains mock/deferred until staging APIs are provisioned; sync-v1 docs own `encryption_device_id`/wrap/rekey/RLS invariants; future Admin APIs are recorded as not yet stable. These map accurately to the code read: `device-management.ts` `DeviceRevokeResult.transport: 'mock' | 'supabase-rpc'` and `deferredGate` field confirm the mock/deferred state; `web-auth-device-session` api.md stops before DEK/KEK as stated. |
| G9 — Build commit `9fd1cb7` is docs-only, reviewable, and scoped | PASS | `git show --stat 9fd1cb7` shows exactly four files changed, all under `docs/`: `docs/contracts/README.md` (+1 line), `docs/contracts/account-device-identity-contract.md` (+161 lines), `docs/reviews/account-device-identity-contract/20260531-discovery-review.md` (+154 lines), `docs/reviews/account-device-identity-contract/dev_log.md` (+83 lines). No source code, no runtime packages, no test files. 399 insertions, 0 deletions. Commit message type is `docs(sync)` with scope, risk, and test notes as required by convention. |
| G10 — Runtime sync-v1 remains paused | PASS | Contract §10 non-goals list "No runtime sync-v1 unpause" as item #1. §1 (Purpose) states this document does not redefine `RepoRecord`, `syncScope`, `/sync/push`, `/sync/pull`, DEK/KEK cryptography, or sync-v1 runtime sequencing. ADR-0013 §D4 states "sync-v1 stays PAUSED. D4 is a governance contract for when line-4 work resumes (post-G1 per ADR-0010)." The commit diff contains no changes to any sync-v1 runtime files, transport code, or Supabase RPC implementations. |

## Verdict

PASS - READY_TO_SHIP.

No blockers remain. The verifier did not run `ship`.
