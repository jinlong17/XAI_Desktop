//! Finder collaboration commands (G3-E3).
//!
//! Three minimal user-initiated path actions:
//!
//! - `reveal_in_finder` — opens a Finder window highlighting the path.
//! - `open_path` — opens the path in its default handler (file → app).
//! - `remove_item_from_grid` — pure logical removal; does NOT touch the
//!   user's filesystem. The Organizer plugin owns the "send file to
//!   Trash" decision and must surface a confirmation UI before invoking
//!   any future destructive variant.
//!
//! All commands enforce a window-origin allow-list and validate the path
//! against the user-reachable root allow-list (see `validate_user_path`)
//! before touching the platform layer.

use std::path::{Component, Path, PathBuf};

use serde::Deserialize;

use crate::error::{AppError, AppResult};

const FINDER_ALLOWED_WINDOWS: &[&str] = &["main", "control", "console"];

/// User-reachable filesystem roots a desktop file/app drop or open-panel
/// selection can produce on macOS. Paths outside these roots are rejected
/// for now — full bookmark-store enforcement is a later gate. On non-macOS
/// targets only `/tmp/` is admitted, mirroring the existing macOS-only
/// behavior of the platform commands.
#[cfg(target_os = "macos")]
const USER_REACHABLE_ROOTS: &[&str] = &["/Users/", "/Applications/", "/Volumes/", "/tmp/"];

#[cfg(not(target_os = "macos"))]
const USER_REACHABLE_ROOTS: &[&str] = &["/tmp/"];

fn is_finder_window_allowed(label: &str) -> bool {
    if FINDER_ALLOWED_WINDOWS.contains(&label) {
        return true;
    }
    label.starts_with("grid_")
}

fn ensure_finder_window_allowed(label: &str) -> AppResult<()> {
    if is_finder_window_allowed(label) {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke Finder commands"
    )))
}

/// Validate `raw` looks like a user-authorized absolute path and return its
/// lexically-normalized canonical form.
///
/// Rules:
/// - rejects empty / NUL / whitespace-only input.
/// - rejects relative paths and any `..` parent-dir segment (even when the
///   raw string would normalize away, e.g. `/Users/me/../etc/passwd`).
/// - rejects paths whose normalized form does NOT start with one of the
///   allowed user-reachable roots (`/Users/`, `/Applications/`, `/Volumes/`,
///   `/tmp/` on macOS; only `/tmp/` on other targets).
///
/// Returns the normalized `PathBuf` on success. This is a *lexical*
/// normalization (`Path::components`) rather than `canonicalize()` because
/// `canonicalize` requires the path to exist on disk; that stricter check
/// is a follow-up once a bookmark store lands.
pub(crate) fn validate_user_path(raw: &str) -> AppResult<PathBuf> {
    if raw.trim().is_empty() {
        return Err(AppError::SyncInvalidInput(
            "path must be non-empty".into(),
        ));
    }
    if raw.contains('\0') {
        return Err(AppError::SyncInvalidInput(
            "path must not contain NUL".into(),
        ));
    }

    let path = Path::new(raw);
    if !path.is_absolute() {
        return Err(AppError::SyncInvalidInput(format!(
            "path must be absolute: `{raw}`"
        )));
    }

    // Walk components, refusing any `..` (parent) segment. This catches
    // both `/Users/me/../etc/passwd` and `/Applications/../etc/passwd`.
    let mut normalized = PathBuf::new();
    for component in path.components() {
        match component {
            Component::ParentDir => {
                return Err(AppError::SyncInvalidInput(format!(
                    "path must not contain `..` segments: `{raw}`"
                )));
            }
            Component::CurDir => {
                // Drop `.` — harmless lexical no-op.
            }
            other => normalized.push(other.as_os_str()),
        }
    }

    let normalized_str = normalized.to_string_lossy().to_string();
    let under_allowed_root = USER_REACHABLE_ROOTS
        .iter()
        .any(|root| normalized_str.starts_with(root));

    if !under_allowed_root {
        return Err(AppError::SyncCapabilityDenied(format!(
            "path `{normalized_str}` is not under a user-reachable root"
        )));
    }

    Ok(normalized)
}

#[derive(Debug, Deserialize)]
pub struct RevealInFinderInput {
    pub path: String,
}

#[tauri::command]
pub async fn reveal_in_finder(
    window: tauri::WebviewWindow,
    input: RevealInFinderInput,
) -> AppResult<()> {
    ensure_finder_window_allowed(window.label())?;
    let canonical = validate_user_path(&input.path)?;
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let status = Command::new("open")
            .arg("-R")
            .arg(&canonical)
            .status()
            .map_err(|err| AppError::Internal(format!("open -R failed: {err}")))?;
        if !status.success() {
            return Err(AppError::Internal(format!(
                "open -R exited with status {status}"
            )));
        }
        Ok(())
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = canonical;
        Err(AppError::Internal("reveal_in_finder is macOS-only".into()))
    }
}

#[derive(Debug, Deserialize)]
pub struct OpenPathInput {
    pub path: String,
}

#[tauri::command]
pub async fn open_path(
    window: tauri::WebviewWindow,
    input: OpenPathInput,
) -> AppResult<()> {
    ensure_finder_window_allowed(window.label())?;
    let canonical = validate_user_path(&input.path)?;
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let status = Command::new("open")
            .arg(&canonical)
            .status()
            .map_err(|err| AppError::Internal(format!("open failed: {err}")))?;
        if !status.success() {
            return Err(AppError::Internal(format!(
                "open exited with status {status}"
            )));
        }
        Ok(())
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = canonical;
        Err(AppError::Internal("open_path is macOS-only".into()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allowlist_admits_documented_labels_and_grids() {
        for label in FINDER_ALLOWED_WINDOWS {
            assert!(ensure_finder_window_allowed(label).is_ok());
        }
        assert!(ensure_finder_window_allowed("grid_x").is_ok());
    }

    #[test]
    fn allowlist_rejects_widgets_pet_aicube() {
        for label in ["widget_clock", "pet", "ai_cube", "popup"] {
            assert!(ensure_finder_window_allowed(label).is_err());
        }
    }

    #[test]
    fn validate_user_path_rejects_empty_and_nul() {
        assert!(validate_user_path("").is_err());
        assert!(validate_user_path("   ").is_err());
        assert!(validate_user_path("/Users/me/file\0").is_err());
    }

    /// Any `..` parent-dir component must be rejected, even when the
    /// surrounding path lexically points back into an allowed root.
    #[test]
    fn validate_user_path_rejects_dotdot() {
        // direct parent-escape attempt
        let err = validate_user_path("/Users/me/../etc/passwd").unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("..") || msg.starts_with("E3005:"),
            "expected `..` rejection, got: {msg}"
        );

        // even nested deeper
        assert!(validate_user_path("/Users/me/sub/../../etc/passwd").is_err());

        // relative input should also fail (not absolute → E3005)
        assert!(validate_user_path("..").is_err());
        assert!(validate_user_path("relative/path").is_err());
    }

    /// Paths outside the user-reachable root allow-list (e.g. `/etc/...`,
    /// `/private/var/...`, `/System/...`) must be rejected.
    #[test]
    fn validate_user_path_rejects_etc_root() {
        for raw in [
            "/etc/passwd",
            "/private/var/db/secret",
            "/System/Library/CoreServices",
            "/var/log/system.log",
            "/bin/sh",
        ] {
            let result = validate_user_path(raw);
            let err = match result {
                Ok(ok) => panic!("expected `{raw}` to be rejected, got Ok({})", ok.display()),
                Err(e) => e,
            };
            let msg = err.to_string();
            assert!(
                msg.contains("not under a user-reachable root") || msg.starts_with("E3004:"),
                "expected user-reachable-root rejection for `{raw}`, got: {msg}"
            );
        }
    }

    /// Paths under `/Users/...` should be admitted. Note: this is a
    /// path-shape check; the function does NOT require the path to exist
    /// on disk (lexical normalization only — full `canonicalize()` is a
    /// follow-up once a bookmark store lands).
    #[test]
    fn validate_user_path_admits_user_home() {
        let out = validate_user_path("/Users/me/file.txt").expect("user-home path should be admitted");
        assert_eq!(out, PathBuf::from("/Users/me/file.txt"));

        // nested subpath
        let nested = validate_user_path("/Users/me/Documents/note.md").unwrap();
        assert_eq!(nested, PathBuf::from("/Users/me/Documents/note.md"));
    }

    /// Paths under `/Applications/...` should be admitted on macOS. On
    /// other targets the function only admits `/tmp/`, so we gate the
    /// assertion accordingly.
    #[test]
    fn validate_user_path_admits_applications() {
        #[cfg(target_os = "macos")]
        {
            let out = validate_user_path("/Applications/Safari.app")
                .expect("/Applications path should be admitted on macOS");
            assert_eq!(out, PathBuf::from("/Applications/Safari.app"));

            // /Volumes/ and /tmp/ also admitted on macOS
            assert!(validate_user_path("/Volumes/ExternalDrive/file").is_ok());
            assert!(validate_user_path("/tmp/scratch").is_ok());
        }
        #[cfg(not(target_os = "macos"))]
        {
            // /Applications/ is NOT a user-reachable root off macOS
            assert!(validate_user_path("/Applications/Safari.app").is_err());
            // /tmp/ still admitted everywhere
            assert!(validate_user_path("/tmp/scratch").is_ok());
        }
    }
}
