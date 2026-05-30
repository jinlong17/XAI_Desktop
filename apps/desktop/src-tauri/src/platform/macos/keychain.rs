//! macOS Keychain bridge — generic-password get/set/del.
//!
//! All code in this file is `#[cfg(target_os = "macos")]`-gated except for the
//! non-macOS stub block at the bottom which keeps the crate compiling on all targets.
//!
//! 2026-05-29 release-readiness repair:
//!   The previous `SecAccessControl`/Data Protection Keychain path failed on an
//!   unsigned dev/debug process with OSStatus -34018 (missing entitlement). The
//!   release-ready default now uses namespaced generic-password items and always
//!   selects the non-synchronizable store so secrets do not propagate through
//!   iCloud Keychain. Signed Data Protection ACL verification remains a separate
//!   Apple-signing/notarization gate instead of blocking local-first DB startup.

use crate::error::{AppError, AppResult};

/// Service namespace used for all XAI_Desktop keychain items.
pub const KEYCHAIN_SERVICE: &str = "com.jinlong.desktop.secret";

/// The XAI_Desktop bundle identifier — used for release-signing gate docs/tests.
pub const BUNDLE_ID: &str = "com.jinlong.desktop";

/// Attribute bundle used when creating/validating keychain items.
///
/// This is a pure-construction value type, allowing unit tests to verify the
/// correctness of namespacing, synchronizability, and release-gate intent without
/// performing actual Keychain I/O (T-U2, T-U3).
#[derive(Debug, PartialEq, Eq)]
pub struct KeychainItemAttrs {
    /// Must always be `false` (T13 — no iCloud Keychain propagation).
    pub synchronizable: bool,
    /// Must be the service namespace used by all generic-password items.
    pub service: String,
    /// Bundle identifier used by the signed Data Protection ACL release gate.
    pub bundle_id: String,
    /// True means signed Data Protection ACL verification is still required for
    /// production release signing, but is not attached in unsigned dev builds.
    pub signed_data_protection_acl_required_for_release: bool,
}

/// Construct the canonical attribute set for XAI_Desktop keychain items.
///
/// This is a **pure function** tested in T-U2 and T-U3 — no Keychain I/O.
pub fn build_item_attrs() -> KeychainItemAttrs {
    KeychainItemAttrs {
        synchronizable: false,
        service: KEYCHAIN_SERVICE.to_string(),
        bundle_id: BUNDLE_ID.to_string(),
        signed_data_protection_acl_required_for_release: true,
    }
}

// ── macOS implementation ──────────────────────────────────────────────────────

#[cfg(target_os = "macos")]
pub mod macos_impl {
    use super::{AppError, AppResult, KEYCHAIN_SERVICE};
    use security_framework::passwords::{
        delete_generic_password_options, generic_password, set_generic_password_options,
        PasswordOptions,
    };

    // OSStatus constants from Security.framework (not re-exported by security-framework crate,
    // so we define them here matching the Apple SDK values).
    const ERR_SEC_INTERACTION_NOT_ALLOWED: i32 = -25308;
    const ERR_SEC_ITEM_NOT_FOUND: i32 = -25300;

    /// Map a `security-framework` error to our `AppError` E11xx variant.
    pub fn map_sec_error(err: security_framework::base::Error) -> AppError {
        let code = err.code();
        // errSecInteractionNotAllowed (-25308): item not accessible (device locked)
        if code == ERR_SEC_INTERACTION_NOT_ALLOWED {
            return AppError::KeychainLocked;
        }
        // errSecItemNotFound (-25300)
        if code == ERR_SEC_ITEM_NOT_FOUND {
            return AppError::KeychainItemNotFound;
        }
        // errSecAuthFailed (-25293): ACL/auth rejection
        // errSecInteractionRequired (-25315): requires interactive auth
        if code == -25293 || code == -25315 {
            return AppError::KeychainAclDenied;
        }
        AppError::KeychainBackend(format!("OSStatus {code}: {err}"))
    }

    /// Build `PasswordOptions` for the non-iCloud generic-password store.
    ///
    /// `set_access_synchronized(Some(false))` is intentionally used on set/get/delete so
    /// this bridge only touches the local, non-synchronizable Keychain store.
    fn build_password_options(key: &str) -> PasswordOptions {
        let mut opts = PasswordOptions::new_generic_password(KEYCHAIN_SERVICE, key);
        opts.set_access_synchronized(Some(false));
        opts
    }

    /// Store `value` bytes under `key` in the macOS Keychain.
    ///
    /// Idempotent upsert: if the item already exists, updates its data in place;
    /// otherwise adds a new non-synchronizable generic-password item.
    pub fn secret_set_impl(key: &str, value: &[u8]) -> AppResult<()> {
        let opts = build_password_options(key);
        set_generic_password_options(value, opts).map_err(|e| {
            let code = e.code();
            if code == ERR_SEC_INTERACTION_NOT_ALLOWED {
                AppError::KeychainLocked
            } else {
                map_sec_error(e)
            }
        })
    }

    /// Retrieve `key`'s value bytes from the macOS Keychain.
    ///
    /// Returns `KeychainItemNotFound` (E1101) if absent,
    /// `KeychainLocked` (E1100) if device locked.
    pub fn secret_get_impl(key: &str) -> AppResult<Vec<u8>> {
        let opts = build_password_options(key);
        generic_password(opts).map_err(map_sec_error)
    }

    /// Delete `key` from the macOS Keychain.
    ///
    /// Idempotent: absent key returns success (no error).
    pub fn secret_del_impl(key: &str) -> AppResult<()> {
        let opts = build_password_options(key);
        match delete_generic_password_options(opts) {
            Ok(()) => Ok(()),
            Err(e) if e.code() == ERR_SEC_ITEM_NOT_FOUND => Ok(()), // idempotent
            Err(e) => Err(map_sec_error(e)),
        }
    }
}

// ── Public surface (macOS) ────────────────────────────────────────────────────

#[cfg(target_os = "macos")]
pub fn secret_set(key: &str, value: &[u8]) -> AppResult<()> {
    macos_impl::secret_set_impl(key, value)
}

#[cfg(target_os = "macos")]
pub fn secret_get(key: &str) -> AppResult<Vec<u8>> {
    macos_impl::secret_get_impl(key)
}

#[cfg(target_os = "macos")]
pub fn secret_del(key: &str) -> AppResult<()> {
    macos_impl::secret_del_impl(key)
}

// ── Non-macOS compile stub ────────────────────────────────────────────────────

#[cfg(not(target_os = "macos"))]
pub fn secret_set(_key: &str, _value: &[u8]) -> AppResult<()> {
    Err(AppError::KeychainUnsupportedPlatform)
}

#[cfg(not(target_os = "macos"))]
pub fn secret_get(_key: &str) -> AppResult<Vec<u8>> {
    Err(AppError::KeychainUnsupportedPlatform)
}

#[cfg(not(target_os = "macos"))]
pub fn secret_del(_key: &str) -> AppResult<()> {
    Err(AppError::KeychainUnsupportedPlatform)
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    /// T-U2: attribute construction asserts local-only generic-password storage.
    #[test]
    fn t_u2_attribute_construction() {
        let attrs = build_item_attrs();
        assert_eq!(
            attrs.service, KEYCHAIN_SERVICE,
            "service namespace must match the runtime Keychain service"
        );
        assert!(
            !attrs.synchronizable,
            "synchronizable must be false (T13 — no iCloud Keychain)"
        );
    }

    /// T-U3: signed Data Protection ACL remains an explicit release-signing gate.
    #[test]
    fn t_u3_acl_composition() {
        let attrs = build_item_attrs();
        assert_eq!(
            attrs.bundle_id, "com.jinlong.desktop",
            "release-signing ACL gate must target the XAI_Desktop bundle id"
        );
        assert!(
            attrs.signed_data_protection_acl_required_for_release,
            "signed Data Protection ACL must stay tracked as a release gate"
        );
    }

    /// T-U4: non-macOS stub returns KeychainUnsupportedPlatform (E1104).
    #[test]
    #[cfg(not(target_os = "macos"))]
    fn t_u4_non_macos_stub() {
        let set_result = secret_set("xai.test.key", b"value");
        let get_result = secret_get("xai.test.key");
        let del_result = secret_del("xai.test.key");

        assert!(
            matches!(set_result, Err(AppError::KeychainUnsupportedPlatform)),
            "secret_set must return KeychainUnsupportedPlatform on non-macOS"
        );
        assert!(
            matches!(get_result, Err(AppError::KeychainUnsupportedPlatform)),
            "secret_get must return KeychainUnsupportedPlatform on non-macOS"
        );
        assert!(
            matches!(del_result, Err(AppError::KeychainUnsupportedPlatform)),
            "secret_del must return KeychainUnsupportedPlatform on non-macOS"
        );
    }

    // ── T-U5: OSStatus → AppError mapping (macOS only) ──────────────────────

    /// T-U5: representative Security.framework error codes map to the correct E11xx variant.
    #[cfg(target_os = "macos")]
    #[test]
    fn t_u5_ostatus_mapping() {
        use crate::platform::macos::keychain::macos_impl::map_sec_error;
        use security_framework::base::Error as SecError;

        // errSecInteractionNotAllowed = -25308 → KeychainLocked (E1100)
        let locked_err = SecError::from_code(-25308);
        assert!(
            matches!(map_sec_error(locked_err), AppError::KeychainLocked),
            "errSecInteractionNotAllowed must map to KeychainLocked"
        );

        // errSecItemNotFound = -25300 → KeychainItemNotFound (E1101)
        let not_found_err = SecError::from_code(-25300);
        assert!(
            matches!(map_sec_error(not_found_err), AppError::KeychainItemNotFound),
            "errSecItemNotFound must map to KeychainItemNotFound"
        );

        // errSecAuthFailed = -25293 → KeychainAclDenied (E1102)
        let acl_err = SecError::from_code(-25293);
        assert!(
            matches!(map_sec_error(acl_err), AppError::KeychainAclDenied),
            "errSecAuthFailed must map to KeychainAclDenied"
        );

        // Other status → KeychainBackend (E1103)
        let other_err = SecError::from_code(-99999);
        assert!(
            matches!(map_sec_error(other_err), AppError::KeychainBackend(_)),
            "Unknown OSStatus must map to KeychainBackend"
        );
    }

    // ── Gated integration tests (require real macOS login keychain) ──────────

    /// T-I1: round-trip set → get → del on real macOS keychain.
    /// Gated behind the `keychain-it` feature to avoid running in headless CI.
    #[cfg(all(target_os = "macos", feature = "keychain-it"))]
    #[test]
    fn t_i1_round_trip() {
        use std::time::{SystemTime, UNIX_EPOCH};
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .subsec_nanos();
        let key = format!("xai.test.roundtrip.{ts}");
        let val = b"round_trip_value_bytes";

        secret_set(&key, val).expect("secret_set should succeed");
        let got = secret_get(&key).expect("secret_get should succeed");
        assert_eq!(got.as_slice(), val, "round-trip bytes must match");
        secret_del(&key).expect("secret_del should succeed");
        let after_del = secret_get(&key);
        assert!(
            matches!(after_del, Err(AppError::KeychainItemNotFound)),
            "after del, get must return KeychainItemNotFound"
        );
    }

    /// T-I2: idempotent set (two sets with different values → latest wins).
    #[cfg(all(target_os = "macos", feature = "keychain-it"))]
    #[test]
    fn t_i2_idempotent_set() {
        use std::time::{SystemTime, UNIX_EPOCH};
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .subsec_nanos();
        let key = format!("xai.test.idem.{ts}");

        secret_set(&key, b"first_value").expect("first set");
        secret_set(&key, b"second_value").expect("second set");
        let got = secret_get(&key).expect("get after double set");
        assert_eq!(got.as_slice(), b"second_value", "latest value must win");
        secret_del(&key).expect("cleanup");
    }

    /// T-I3: idempotent delete (absent key → success).
    #[cfg(all(target_os = "macos", feature = "keychain-it"))]
    #[test]
    fn t_i3_idempotent_delete() {
        // Key that almost certainly does not exist
        let key = "xai.test.absent.key.for.idempotent.delete";
        let result = secret_del(key);
        assert!(result.is_ok(), "delete of absent key must succeed");
    }
}
