//! User-authorized path bookmark registry (G3-E3 P0 fix).
//!
//! Implements an in-memory `BookmarkRegistry` that records every path the
//! user has explicitly authorized via a drag-drop or open-panel selection.
//! `reveal_in_finder` / `open_path` consult this registry as the second
//! gate (after `validate_user_path`'s lexical shape check) so they cannot
//! be invoked against arbitrary paths inside the user-reachable roots.
//!
//! The contract in `docs/contracts/tauri-commands-v0.md` §4 requires that
//! "all path access must come from user drop/open panel or authorized
//! bookmark"; the lexical shape gate alone only narrowed the attack
//! surface — it did not constitute honest provenance. This module raises
//! the implementation to match the contract.
//!
//! Storage model: in-memory `HashSet<PathBuf>` keyed by the canonical
//! (lexically-normalized) form produced by `validate_user_path`. Each
//! session starts empty — the user must re-authorize every path after a
//! restart. This is intentionally more restrictive than the contract
//! promises: every authorized path has explicit, recent provenance.
//!
//! Tauri injects `window: tauri::WebviewWindow` automatically; JS callers
//! do NOT include it in the args payload (mirrors the existing crypto /
//! database / keychain / finder command pattern).

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::Deserialize;
use tauri::State;

use crate::commands::finder::validate_user_path;
use crate::error::{AppError, AppResult};

/// Windows allowed to invoke bookmark commands. Mirrors
/// `commands::finder::FINDER_ALLOWED_WINDOWS` because the bookmark
/// registry is a strict companion to the Finder commands — only the
/// surfaces that can call `reveal_in_finder` / `open_path` should be
/// allowed to register a path bookmark in the first place.
///
/// Duplicated (rather than shared via `pub`) intentionally: the finder
/// allow-list is `pub(crate)` only for `validate_user_path` re-use; a
/// minor copy here keeps the two modules independently auditable so a
/// future widening of one cannot silently widen the other.
const BOOKMARK_ALLOWED_WINDOWS: &[&str] = &["main", "control", "console"];

fn is_bookmark_window_allowed(label: &str) -> bool {
    if BOOKMARK_ALLOWED_WINDOWS.contains(&label) {
        return true;
    }
    label.starts_with("grid_")
}

fn ensure_bookmark_window_allowed(label: &str) -> AppResult<()> {
    if is_bookmark_window_allowed(label) {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke bookmark commands"
    )))
}

/// In-memory registry of user-authorized canonical paths.
///
/// Backed by a `Mutex<HashSet<PathBuf>>`. Each entry is the
/// lexically-normalized canonical form output by `validate_user_path`,
/// so the gate is consistent with the path used by the platform `open`
/// / `open -R` shell-out.
pub struct BookmarkRegistry {
    inner: Mutex<HashSet<PathBuf>>,
}

impl Default for BookmarkRegistry {
    fn default() -> Self {
        Self {
            inner: Mutex::new(HashSet::new()),
        }
    }
}

impl BookmarkRegistry {
    /// Insert a canonical path. Idempotent. Returns `Ok(())` on success.
    pub fn insert_canonical(&self, canonical: PathBuf) -> AppResult<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|err| AppError::Internal(format!("bookmark registry poisoned: {err}")))?;
        guard.insert(canonical);
        Ok(())
    }

    /// Remove a canonical path. Idempotent.
    pub fn remove_canonical(&self, canonical: &Path) -> AppResult<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|err| AppError::Internal(format!("bookmark registry poisoned: {err}")))?;
        guard.remove(canonical);
        Ok(())
    }

    /// Check whether a canonical path has been authorized.
    pub fn contains_canonical(&self, canonical: &Path) -> bool {
        let Ok(guard) = self.inner.lock() else {
            return false;
        };
        guard.contains(canonical)
    }
}

/// Rust-internal helper for callers (notably `commands::finder`) to
/// consult the registry without having to know the lock layout.
pub fn is_path_bookmarked(state: &BookmarkRegistry, canonical: &Path) -> bool {
    state.contains_canonical(canonical)
}

#[derive(Debug, Deserialize)]
pub struct RegisterPathBookmarkInput {
    pub path: String,
}

/// Register a user-authorized path bookmark.
///
/// Lexically validates the input first (`validate_user_path`), then
/// inserts the canonical form into the registry. Idempotent. Returns
/// `E3004` if the calling window is not in `BOOKMARK_ALLOWED_WINDOWS`,
/// `E3004` / `E3005` for path validation failures.
#[tauri::command]
pub async fn register_path_bookmark(
    window: tauri::WebviewWindow,
    state: State<'_, BookmarkRegistry>,
    input: RegisterPathBookmarkInput,
) -> AppResult<()> {
    ensure_bookmark_window_allowed(window.label())?;
    let canonical = validate_user_path(&input.path)?;
    state.insert_canonical(canonical)
}

#[derive(Debug, Deserialize)]
pub struct ClearPathBookmarkInput {
    pub path: String,
}

/// Clear a user-authorized path bookmark.
///
/// Idempotent: removing an absent path is not an error. Lexically
/// validates the input first (`validate_user_path`) for symmetry with
/// `register_path_bookmark`, so callers cannot use this command to
/// probe arbitrary paths against the validator.
#[tauri::command]
pub async fn clear_path_bookmark(
    window: tauri::WebviewWindow,
    state: State<'_, BookmarkRegistry>,
    input: ClearPathBookmarkInput,
) -> AppResult<()> {
    ensure_bookmark_window_allowed(window.label())?;
    let canonical = validate_user_path(&input.path)?;
    state.remove_canonical(&canonical)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Allow-list admits the documented labels and any `grid_*`.
    #[test]
    fn allowlist_admits_documented_labels_and_grids() {
        for label in BOOKMARK_ALLOWED_WINDOWS {
            assert!(ensure_bookmark_window_allowed(label).is_ok());
        }
        assert!(ensure_bookmark_window_allowed("grid_a1b2").is_ok());
    }

    /// Allow-list rejects widget / pet / ai-cube / unknown.
    #[test]
    fn allowlist_rejects_widget_pet_aicube() {
        for label in ["widget_clock", "pet", "ai_cube", "popup", "account"] {
            assert!(ensure_bookmark_window_allowed(label).is_err());
        }
    }

    /// Lookup returns false before register, true after, false after clear.
    #[test]
    fn register_then_lookup_then_clear() {
        let registry = BookmarkRegistry::default();
        let canonical = validate_user_path("/Users/me/file.txt").expect("valid path");

        assert!(
            !is_path_bookmarked(&registry, &canonical),
            "fresh registry must not contain any path"
        );

        registry
            .insert_canonical(canonical.clone())
            .expect("insert");
        assert!(
            is_path_bookmarked(&registry, &canonical),
            "registry must contain the path after register"
        );

        registry.remove_canonical(&canonical).expect("remove");
        assert!(
            !is_path_bookmarked(&registry, &canonical),
            "registry must not contain the path after clear"
        );
    }

    /// `clear_path_bookmark` is idempotent — removing absent is OK.
    #[test]
    fn clear_is_idempotent() {
        let registry = BookmarkRegistry::default();
        let canonical = validate_user_path("/Users/me/missing.txt").expect("valid path");

        // remove without register must not error
        registry.remove_canonical(&canonical).expect("remove absent");
        assert!(!is_path_bookmarked(&registry, &canonical));

        // double-register is idempotent (no count exposed, but no error)
        registry.insert_canonical(canonical.clone()).expect("first");
        registry
            .insert_canonical(canonical.clone())
            .expect("second");
        assert!(is_path_bookmarked(&registry, &canonical));

        // double-remove is idempotent
        registry.remove_canonical(&canonical).expect("first remove");
        registry
            .remove_canonical(&canonical)
            .expect("second remove");
        assert!(!is_path_bookmarked(&registry, &canonical));
    }

    /// Invalid paths are rejected by `validate_user_path` and never reach
    /// the registry. We exercise this through the validator directly so
    /// the test does not need a `WebviewWindow`.
    #[test]
    fn invalid_path_is_rejected_before_registry() {
        let registry = BookmarkRegistry::default();

        // `..` in the path → SyncInvalidInput
        let bad_dotdot = validate_user_path("/Users/me/../etc/passwd");
        assert!(bad_dotdot.is_err());

        // outside user-reachable root → SyncCapabilityDenied
        let bad_root = validate_user_path("/etc/passwd");
        assert!(bad_root.is_err());

        // empty / whitespace → SyncInvalidInput
        assert!(validate_user_path("").is_err());
        assert!(validate_user_path("   ").is_err());

        // Confirm none of the above leaked into the registry. They never
        // produced a canonical PathBuf, so there is nothing to look up;
        // but we verify by enumerating a couple of would-be canonical
        // forms and asserting absence.
        for raw in [
            PathBuf::from("/etc/passwd"),
            PathBuf::from("/Users/me/etc/passwd"),
        ] {
            assert!(
                !is_path_bookmarked(&registry, &raw),
                "registry must remain empty when validator rejects input"
            );
        }
    }
}
