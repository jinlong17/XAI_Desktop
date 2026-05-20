# Discovery Review — keychain-bridge-macos

> Workflow V2 feature-plan · Phase 1.5 Solution Scan (human review required)
> Feature: `keychain-bridge-macos` · sync-v1 #8 · wave W0 · Phase 0.3 · dev-plan T-10
> Date: 2026-05-19 · Branch: `refactor/microkernel-plugin-architecture`
> Brief: `docs/reviews/keychain-bridge-macos/20260519-feature-brief.md`
> Reviewer verdict: __PENDING__ (feature-review)

---

## 1. Problem Framing

Sync v1's zero-knowledge design needs four long-lived secrets to persist across
restarts with a hard guarantee that they are **inaccessible while the Mac is
locked** and **never leave the device via iCloud Keychain or Time Machine**:
`refresh_token`, `KEK` cache, `device_priv` (X25519), and the `nonce
high-water` rollback anchor (PRD §3, FR-AC-08, FR-SY-09, T3, T13, R-10.18).

The current Rust backend has **zero** secret-storage capability:
`Cargo.toml` has no `security-framework`; `platform/macos/` only contains
NSWindow click-through code; `commands/` has only `window`. This feature adds
the first secure-persistence seam. It is a **cross-cutting infra adapter**
(Rust platform + Tauri command + TS wrapper in `@repo/core-data`), not a
plugin slice — placement dictated by codebase-orientation §6 and ADR-0003.

**Feature classification (SOP §1.5):** Project-specific core capability
(macOS-native API bridge via Tauri). A standard secret-store *abstraction*
exists in the ecosystem, but the FR-AC-08 ACL + accessibility + iCloud-exclusion
constraints are project-specific and security-critical → Web research **was
required** for crate selection.

---

## 2. Candidate Options (with web evidence)

Web research performed 2026-05-19. Queries:
- "Rust security-framework crate macOS keychain kSecAttrAccessibleWhenUnlockedThisDeviceOnly SecAccess ACL 2026"
- "Rust keyring crate vs security-framework macOS keychain access control list trusted application"

### Option A — `security-framework` crate (direct Security.framework bindings)

- Direct, low-level bindings to Apple `Security.framework`: `SecKeychain`,
  `SecKeychainItem`, `os::macos::access::SecAccess`, generic-password APIs,
  and `kSecAttrAccessible*` constants.
- `core-foundation` (its dependency) is **already in `Cargo.toml`** under the
  macOS target block — minimal new dependency surface.
- Maintained binding (kornelski/rust-security-framework), MIT/Apache-2.0
  dual-license (ecosystem-standard, no copyleft risk), widely adopted
  (TLS + Keychain across the Rust/Apple ecosystem).
- Exposes the **`SecAccess` ACL surface** needed for the bundle-id
  trusted-application restriction (FR-AC-08) and the accessibility constant
  for `WhenUnlockedThisDeviceOnly` (T3/T13). Caveat surfaced in research: the
  high-level generic-password helpers do not all expose `SecAccess`; the ACL
  path likely needs the lower-level `SecKeychainItem` + `SecAccess` APIs (open
  question OQ-1).
- **Already the prescribed choice** in `docs/reviews/sync-v1/codebase-orientation.md`
  §5/§6 ("macOS Keychain via `security-framework` under `platform/macos/`")
  and the dev-plan §2 prereq table line 99.

### Option B — `keyring` crate (cross-platform credential abstraction)

- High-level cross-platform (`open-source-cooperative/keyring-rs`); macOS
  backend behind the `apple-native` feature.
- Maps `(service, user)` → generic password. Convenient, but **abstracts away
  the exact `kSecAttrAccessible*` and `SecAccess` ACL controls** that
  FR-AC-08 mandates. No first-class API to set
  `WhenUnlockedThisDeviceOnly` + bundle-id-only ACL + guarantee
  iCloud-Keychain exclusion.
- Cross-platform breadth is **a non-goal** here (Web has no Keychain → server
  nonce lease per PRD §1290-1293; this row is macOS-only by design).
- Pulls a wider dependency tree than needed for a 3-command bridge.

### Option C — `keychain-services.rs` (iqlusioninc, experimental)

- Higher-level idiomatic wrapper over Keychain Services with explicit access
  control support.
- Repo **self-describes as experimental**; lower adoption, uncertain
  maintenance cadence for a P0 security-critical wave-W0 dependency.
- Supply-chain caution: T10 (PRD §2) — wave-W0 must minimize unvetted
  dependency risk on the secret-storage path.

### Option D — hand-rolled FFI to `Security.framework`

- Maximum control, zero new crate.
- Rejected: large unsafe surface for a P0 security path; reimplements what a
  vetted, dual-licensed binding already provides; violates "minimize bespoke
  unsafe on the key path" intent of T6/T10.

---

## 3. Tradeoffs

| Dimension | A `security-framework` | B `keyring` | C `keychain-services.rs` | D hand-FFI |
|---|---|---|---|---|
| FR-AC-08 ACL + accessibility control | Direct (SecAccess + kSecAttr*) | Abstracted away ✗ | Supported | Full but bespoke |
| Architecture fit (codebase-orientation §6 prescribes it) | Exact match | Mismatch | Partial | N/A |
| New dependency surface | Minimal (core-foundation already present) | Wider | Medium | None |
| Maintenance / adoption | High, standard | High | Experimental ✗ | N/A |
| License | MIT/Apache-2.0 ✓ | MIT/Apache-2.0 ✓ | Apache-2.0 ✓ | N/A |
| Supply-chain risk (T10, P0 path) | Low | Low-Med | Med ✗ | N/A (unsafe risk) |
| iCloud-Keychain exclusion guarantee (T13) | Explicit via accessibility const | Not exposed ✗ | Possible | Full |
| Tauri 2 / pnpm monorepo compat | Backend-only crate, no FE impact | Same | Same | Same |

---

## 4. Recommendation

**Adopt Option A — `security-framework`.** It is the only candidate that
exposes the exact `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` +
`SecAccess` bundle-id ACL controls FR-AC-08/T3/T13 require, is the choice the
sync-v1 codebase-orientation already prescribes, adds minimal dependency
surface (`core-foundation` already vendored), and carries the lowest
supply-chain risk for a P0 wave-W0 secret-storage path.

- **Conclusion type:** Direct adoption.
- Add `security-framework` under the existing
  `[target.'cfg(target_os = "macos")'.dependencies]` block; keep all keychain
  code behind `#[cfg(target_os = "macos")]` with a typed
  "unsupported-platform" stub for other targets (keeps CI/web compiling).
- Use `os::macos::access::SecAccess` to build a trusted-application list
  containing only the XAI_Desktop bundle id; set
  `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`; never set the
  synchronizable attribute (T13 regression test).
- TS wrapper exported from `@repo/core-data`, invoked through the
  `@repo/core/hooks` `useTauriInvoke` chokepoint (red line #4).

### Frozen Assumptions (→ design.md)

1. Crate: `security-framework` (Option A), macOS-only, `#[cfg]`-gated.
2. Storage primitive: generic-password keychain items keyed by a namespaced
   string (`xai.<purpose>.<account_id>[.<sub>]`, per PRD §234 / §1292 naming).
3. Accessibility: `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`,
   synchronizable never true (T13).
4. ACL: trusted-application list = only bundle id `com.jinlong.desktop`
   (from `tauri.conf.json` `identifier`).
5. Error family: **E1xxx system** (Keychain is infra, not sync); JS-parseable
   `E1xxx:` Display prefix per the existing `AppError` contract.
6. Three commands only: `secret_set` / `secret_get` / `secret_del`. No
   enumerate/list (least-surface; not needed by callers).
7. Real signed-build ACL + MAS-sandbox verification is a **documented
   follow-up gated by `apple-developer-account` (#10)** — NOT a ship blocker
   for this feature.
8. Bytes-in / bytes-out: the bridge stores opaque `Vec<u8>` values; no
   crypto/derivation here (separated from `aes-gcm-aead-core` / KeyVault).

---

## 5. Risks & Open Questions

| ID | Risk / Question | Severity | Mitigation |
|---|---|---|---|
| R-1 | `security-framework` high-level generic-password helpers may not expose `SecAccess`; ACL path may need lower-level `SecKeychainItem` + `SecAccess`. | High | OQ-1 below; spike the ACL-attach path in Phase 1 before the command layer; design.md records the chosen API path. |
| R-2 | ACL bundle-id binding only takes real effect on a **codesigned** build; an unsigned dev build cannot fully prove cross-process rejection. | Med | Scope = attributes correct in code + unit/integration; real cross-process rejection is the documented `apple-developer-account` (#10) follow-up. Recorded in test.md §deferred. |
| R-3 | CI / headless test runners cannot reach a login keychain → round-trip integration test cannot run unattended. | Med | Gate round-trip behind `#[ignore]` / a `keychain-it` feature; attribute + error-mapping assertions remain in normal `cargo test`. |
| R-4 | macOS native-API change in the Rust backend (`platform/macos/` + new Tauri commands) → real-hardware verification required pre-ship. | Med (gate) | dev_log Risks records the multi-window / macOS native-API gate; feature-verify must run real-hardware smoke; ship is human-gated. |
| R-5 | Capability allowlist mis-scope could expose `secret_*` to unintended windows/plugins (parallels FR-SY-75). | Med | Add a scoped capability entry restricting `secret_*` to the plugin-account-hosting window; reviewed in feature-review; assert in api.md §capabilities. |
| R-6 | New `AppError` E1xxx variants must not disturb existing E1000/E3xxx serde shape / Display-prefix contract (`error.rs`). | Low | Additive variants only; keep externally-tagged enum + `E1xxx:` prefix; add prefix `#[test]` mirroring existing pattern. |
| OQ-1 | Which `security-framework` API path attaches `SecAccess` ACL + `WhenUnlockedThisDeviceOnly` to a generic-password item (high-level vs `SecKeychainItem`/`SecItemAdd` with attributes dict)? | — | Resolve in Phase 1 spike; freeze the path in design.md before Phase 2 command wiring. |
| OQ-2 | Item update semantics: does `secret_set` on an existing key update-in-place (preserving ACL) or delete+re-add? Update-in-place avoids ACL drift. | — | Decide in api.md (idempotency note); prefer find-then-update, fall back to add. |
| OQ-3 | Should the docs-only anchor `packages/keychain-bridge-macos/` be a real (empty) directory with only `docs/`, or fold into `@repo/core-data/docs/`? | — | Recommend dedicated docs anchor (precedent: `packages/roadmap-kickoff/docs/`); confirmed in design.md §Docs Home. feature-review to ratify. |

---

## 6. Sources

- [kSecAttrAccessibleWhenUnlockedThisDeviceOnly — Apple Developer Documentation](https://developer.apple.com/documentation/security/ksecattraccessiblewhenunlockedthisdeviceonly)
- [security_framework::os::macos::keychain — Rust docs](https://docs.rs/security-framework/latest/security_framework/os/macos/keychain/struct.SecKeychain.html)
- [SecAccess in security_framework::os::macos::access — Rust docs](https://docs.rs/security-framework/latest/security_framework/os/macos/access/struct.SecAccess.html)
- [security-framework — crates.io](https://crates.io/crates/security-framework)
- [kornelski/rust-security-framework — GitHub](https://github.com/kornelski/rust-security-framework)
- [keyring — crates.io](https://crates.io/crates/keyring)
- [open-source-cooperative/keyring-rs — GitHub](https://github.com/hwchen/keyring-rs)
- [iqlusioninc/keychain-services.rs — GitHub](https://github.com/iqlusioninc/keychain-services.rs)
- Internal: `docs/reviews/sync-v1/codebase-orientation.md` §5/§6; `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT §3/§5 (FR-AC-08, FR-SY-09), §2 (T3/T13), §10/R-10.18; `docs/planning/sub-prds/sync/dev-plan.md` §2/§3 (T-10)
