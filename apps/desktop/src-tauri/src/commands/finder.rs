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
//! All commands enforce a window-origin allow-list and validate that
//! the path is non-empty before touching the platform layer.

use serde::Deserialize;

use crate::error::{AppError, AppResult};

const FINDER_ALLOWED_WINDOWS: &[&str] = &["main", "control", "console"];

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

fn validate_path(path: &str) -> AppResult<()> {
    if path.trim().is_empty() {
        return Err(AppError::SyncInvalidInput(
            "path must be non-empty".into(),
        ));
    }
    if path.contains('\0') {
        return Err(AppError::SyncInvalidInput(
            "path must not contain NUL".into(),
        ));
    }
    Ok(())
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
    validate_path(&input.path)?;
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let status = Command::new("open")
            .arg("-R")
            .arg(&input.path)
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
        let _ = input;
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
    validate_path(&input.path)?;
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let status = Command::new("open")
            .arg(&input.path)
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
        let _ = input;
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
    fn path_validation_rejects_empty_and_nul() {
        assert!(validate_path("").is_err());
        assert!(validate_path("   ").is_err());
        assert!(validate_path("/Users/me/file\0").is_err());
        assert!(validate_path("/Users/me/file").is_ok());
    }
}
