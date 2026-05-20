/// Unified error type for Tauri IPC commands.
///
/// Serde-serialized as an externally-tagged enum so the JS caller receives a
/// stable JSON shape. Every variant's `Display` begins with its `E<family><nnn>`
/// code prefix so JavaScript can parse a stable error-code from the string.
///
/// Error families:
///   E1xxx — system / internal
///     E1000   — generic internal error
///     E11xx   — macOS Keychain bridge (keychain-bridge-macos feature #8)
///   E2xxx — business logic  (documented, not populated yet)
///   E3xxx — sync            (concretely populated in scaffold)
///   E4xxx — AI              (documented, not populated yet)
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    // ── E1xxx: System ───────────────────────────────────────────────────────
    #[error("E1000: internal error: {0}")]
    Internal(String),

    // ── E11xx: Keychain bridge (additive — must not alter E1000/E3xxx shape) ─
    /// E1100 — Device locked / item not accessible (FR-AC-08 unlock pre-check).
    /// Caller should prompt unlock and retry; must not treat as data loss.
    #[error("E1100: keychain locked — device must be unlocked to access this item")]
    KeychainLocked,

    /// E1101 — `secret_get` on an absent key.
    /// First-run / post-logout expected path; caller decides behaviour.
    #[error("E1101: keychain item not found")]
    KeychainItemNotFound,

    /// E1102 — ACL rejected (non-bundle-id process or signature mismatch).
    /// Security-relevant; must be surfaced, not silently retried.
    #[error("E1102: keychain ACL denied — process identity rejected")]
    KeychainAclDenied,

    /// E1103 — Underlying Security.framework OSStatus / unexpected error.
    /// Payload contains the OSStatus integer and human-readable description.
    #[error("E1103: keychain backend error: {0}")]
    KeychainBackend(String),

    /// E1104 — Non-macOS target (compile-stub path).
    /// Web / non-macOS path should use the server nonce-lease seam instead.
    #[error("E1104: keychain unsupported on this platform")]
    KeychainUnsupportedPlatform,

    // ── E3xxx: Sync ─────────────────────────────────────────────────────────
    #[error("E3000: sync not initialized")]
    SyncNotInitialized,

    #[error("E3001: sync auth required")]
    SyncAuthRequired,

    #[error("E3002: sync transport failed: {0}")]
    SyncTransport(String),

    #[error("E3003: sync conflict")]
    SyncConflict,

    #[error("E3004: sync capability denied: {0}")]
    SyncCapabilityDenied(String),

    #[error("E3005: sync invalid input: {0}")]
    SyncInvalidInput(String),

    #[error("E3010: sync crypto not initialized")]
    SyncCryptoNotInitialized,

    #[error("E3011: sync crypto operation failed: {0}")]
    SyncCrypto(String),

    // ── E13xx: Repository v0 SQLite driver (G2.2) ────────────────────────────
    /// E1300 — `db_init` not yet called on this AppHandle.
    #[error("E1300: database not initialized — call db_init first")]
    DatabaseNotInitialized,

    /// E1301 — invalid namespace or id input.
    #[error("E1301: database invalid input: {0}")]
    DatabaseInvalidInput(String),

    /// E1302 — underlying SQLite / FS error.
    #[error("E1302: database backend error: {0}")]
    DatabaseBackend(String),
    // E2xxx and E4xxx families are documented in api.md §3; not populated yet.
}

/// Convenience alias used by IPC command handlers.
pub type AppResult<T> = Result<T, AppError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn e1000_display_prefix() {
        let err = AppError::Internal("something bad".to_string());
        let s = err.to_string();
        assert!(s.starts_with("E1000:"), "expected E1000: prefix, got: {s}");
    }

    #[test]
    fn e3000_display_prefix() {
        let err = AppError::SyncNotInitialized;
        let s = err.to_string();
        assert!(s.starts_with("E3000:"), "expected E3000: prefix, got: {s}");
    }

    #[test]
    fn e3001_display_prefix() {
        let err = AppError::SyncAuthRequired;
        let s = err.to_string();
        assert!(s.starts_with("E3001:"), "expected E3001: prefix, got: {s}");
    }

    #[test]
    fn e3002_display_prefix() {
        let err = AppError::SyncTransport("timeout".to_string());
        let s = err.to_string();
        assert!(s.starts_with("E3002:"), "expected E3002: prefix, got: {s}");
    }

    #[test]
    fn e3003_display_prefix() {
        let err = AppError::SyncConflict;
        let s = err.to_string();
        assert!(s.starts_with("E3003:"), "expected E3003: prefix, got: {s}");
    }

    /// Advisory A2 compliance: confirms JS-parseable prefix contract is locked.
    #[test]
    fn all_e3xxx_variants_have_correct_prefix() {
        let cases: Vec<(AppError, &str)> = vec![
            (AppError::SyncNotInitialized, "E3000:"),
            (AppError::SyncAuthRequired, "E3001:"),
            (AppError::SyncTransport("x".into()), "E3002:"),
            (AppError::SyncConflict, "E3003:"),
            (AppError::SyncCapabilityDenied("x".into()), "E3004:"),
            (AppError::SyncInvalidInput("x".into()), "E3005:"),
            (AppError::SyncCryptoNotInitialized, "E3010:"),
            (AppError::SyncCrypto("x".into()), "E3011:"),
        ];
        for (err, expected_prefix) in cases {
            let s = err.to_string();
            assert!(
                s.starts_with(expected_prefix),
                "variant should start with {expected_prefix}, got: {s}"
            );
        }
    }

    // ── T-U1: E11xx variants Display prefix contract ─────────────────────────

    /// T-U1: every new E11xx variant's Display begins with its E11xx: prefix
    /// and all existing E1000/E3xxx prefixes still hold (regression — additive-only).
    #[test]
    fn t_u1_all_e11xx_display_prefixes() {
        let cases: Vec<(AppError, &str)> = vec![
            (AppError::KeychainLocked, "E1100:"),
            (AppError::KeychainItemNotFound, "E1101:"),
            (AppError::KeychainAclDenied, "E1102:"),
            (AppError::KeychainBackend("test".into()), "E1103:"),
            (AppError::KeychainUnsupportedPlatform, "E1104:"),
        ];
        for (err, expected_prefix) in cases {
            let s = err.to_string();
            assert!(
                s.starts_with(expected_prefix),
                "E11xx variant should start with {expected_prefix}, got: {s}"
            );
        }
    }

    /// Regression guard: existing E1000/E3xxx prefixes must remain unchanged.
    #[test]
    fn t_u1_existing_prefixes_regression() {
        let cases: Vec<(AppError, &str)> = vec![
            (AppError::Internal("x".into()), "E1000:"),
            (AppError::SyncNotInitialized, "E3000:"),
            (AppError::SyncAuthRequired, "E3001:"),
            (AppError::SyncTransport("x".into()), "E3002:"),
            (AppError::SyncConflict, "E3003:"),
            (AppError::SyncCapabilityDenied("x".into()), "E3004:"),
            (AppError::SyncInvalidInput("x".into()), "E3005:"),
            (AppError::SyncCryptoNotInitialized, "E3010:"),
            (AppError::SyncCrypto("x".into()), "E3011:"),
        ];
        for (err, expected_prefix) in cases {
            let s = err.to_string();
            assert!(
                s.starts_with(expected_prefix),
                "Existing variant should start with {expected_prefix}, got: {s}"
            );
        }
    }
}
