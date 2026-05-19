/// Unified error type for Tauri IPC commands.
///
/// Serde-serialized as an externally-tagged enum so the JS caller receives a
/// stable JSON shape. Every variant's `Display` begins with its `E<family><nnn>`
/// code prefix so JavaScript can parse a stable error-code from the string.
///
/// Error families:
///   E1xxx — system / internal (generic fallback, scaffold only)
///   E2xxx — business logic  (documented, not populated in scaffold)
///   E3xxx — sync            (concretely populated in scaffold)
///   E4xxx — AI              (documented, not populated in scaffold)
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    // ── E1xxx: System ───────────────────────────────────────────────────────
    #[error("E1000: internal error: {0}")]
    Internal(String),

    // ── E3xxx: Sync ─────────────────────────────────────────────────────────
    #[error("E3000: sync not initialized")]
    SyncNotInitialized,

    #[error("E3001: sync auth required")]
    SyncAuthRequired,

    #[error("E3002: sync transport failed: {0}")]
    SyncTransport(String),

    #[error("E3003: sync conflict")]
    SyncConflict,
    // E2xxx and E4xxx families are documented in api.md §3; not populated in scaffold.
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
        assert!(
            s.starts_with("E1000:"),
            "expected E1000: prefix, got: {s}"
        );
    }

    #[test]
    fn e3000_display_prefix() {
        let err = AppError::SyncNotInitialized;
        let s = err.to_string();
        assert!(
            s.starts_with("E3000:"),
            "expected E3000: prefix, got: {s}"
        );
    }

    #[test]
    fn e3001_display_prefix() {
        let err = AppError::SyncAuthRequired;
        let s = err.to_string();
        assert!(
            s.starts_with("E3001:"),
            "expected E3001: prefix, got: {s}"
        );
    }

    #[test]
    fn e3002_display_prefix() {
        let err = AppError::SyncTransport("timeout".to_string());
        let s = err.to_string();
        assert!(
            s.starts_with("E3002:"),
            "expected E3002: prefix, got: {s}"
        );
    }

    #[test]
    fn e3003_display_prefix() {
        let err = AppError::SyncConflict;
        let s = err.to_string();
        assert!(
            s.starts_with("E3003:"),
            "expected E3003: prefix, got: {s}"
        );
    }

    /// Advisory A2 compliance: confirms JS-parseable prefix contract is locked.
    #[test]
    fn all_e3xxx_variants_have_correct_prefix() {
        let cases: Vec<(AppError, &str)> = vec![
            (AppError::SyncNotInitialized, "E3000:"),
            (AppError::SyncAuthRequired, "E3001:"),
            (AppError::SyncTransport("x".into()), "E3002:"),
            (AppError::SyncConflict, "E3003:"),
        ];
        for (err, expected_prefix) in cases {
            let s = err.to_string();
            assert!(
                s.starts_with(expected_prefix),
                "variant should start with {expected_prefix}, got: {s}"
            );
        }
    }
}
