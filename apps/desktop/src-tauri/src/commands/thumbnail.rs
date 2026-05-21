use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Deserialize;
use tauri::{Runtime, State};

use crate::commands::bookmarks::{is_path_bookmarked, BookmarkRegistry};
use crate::commands::finder::validate_user_path;
use crate::error::{AppError, AppResult};

const THUMBNAIL_ALLOWED_WINDOWS: &[&str] = &["main", "control", "console"];

fn is_thumbnail_window_allowed(label: &str) -> bool {
    if THUMBNAIL_ALLOWED_WINDOWS.contains(&label) {
        return true;
    }
    label.starts_with("grid_")
}

fn ensure_thumbnail_window_allowed(label: &str) -> AppResult<()> {
    if is_thumbnail_window_allowed(label) {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke thumbnail commands"
    )))
}

fn ensure_thumbnail_path_authorized(
    raw: &str,
    registry: &BookmarkRegistry,
) -> AppResult<PathBuf> {
    let canonical = validate_user_path(raw)?;
    if !is_path_bookmarked(registry, &canonical) {
        return Err(AppError::SyncCapabilityDenied(format!(
            "path `{}` has no user-authorized bookmark",
            canonical.display()
        )));
    }
    Ok(canonical)
}

fn is_supported_thumbnail_path(path: &Path) -> bool {
    let ext = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .unwrap_or_default();

    matches!(
        ext.as_str(),
        "png"
            | "jpg"
            | "jpeg"
            | "gif"
            | "webp"
            | "heic"
            | "heif"
            | "bmp"
            | "tiff"
            | "pdf"
            | "mov"
            | "mp4"
            | "m4v"
            | "avi"
            | "mkv"
            | "webm"
    )
}

fn cleanup_old_cache_dirs(base_dir: &Path) {
    let Ok(entries) = fs::read_dir(base_dir) else {
        return;
    };

    let now = SystemTime::now();
    for entry in entries.flatten() {
        let path = entry.path();
        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        if !metadata.is_dir() {
            continue;
        }
        let Ok(modified) = metadata.modified() else {
            continue;
        };
        let Ok(age) = now.duration_since(modified) else {
            continue;
        };
        if age.as_secs() > 600 {
            let _ = fs::remove_dir_all(path);
        }
    }
}

#[cfg(target_os = "macos")]
fn generate_thumbnail_path(canonical: &Path, max_size: u32) -> Option<String> {
    if !is_supported_thumbnail_path(canonical) {
        return None;
    }

    let cache_root = std::env::temp_dir().join("xai-organizer-thumbnails");
    if fs::create_dir_all(&cache_root).is_err() {
        return None;
    }
    cleanup_old_cache_dirs(&cache_root);

    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or(0);
    let output_dir = cache_root.join(format!("{}-{}", std::process::id(), nonce));
    if fs::create_dir_all(&output_dir).is_err() {
        return None;
    }

    let status = Command::new("qlmanage")
        .arg("-t")
        .arg("-s")
        .arg(max_size.to_string())
        .arg("-o")
        .arg(&output_dir)
        .arg(canonical)
        .status();

    if status.as_ref().map(|value| !value.success()).unwrap_or(true) {
        let _ = fs::remove_dir_all(&output_dir);
        return None;
    }

    let mut latest_png: Option<(PathBuf, SystemTime)> = None;
    if let Ok(entries) = fs::read_dir(&output_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path
                .extension()
                .and_then(|value| value.to_str())
                .map(|value| value.eq_ignore_ascii_case("png"))
                .unwrap_or(false)
            {
                let modified = entry
                    .metadata()
                    .and_then(|meta| meta.modified())
                    .unwrap_or(UNIX_EPOCH);
                match &latest_png {
                    Some((_, current)) if modified <= *current => {}
                    _ => latest_png = Some((path, modified)),
                }
            }
        }
    }

    latest_png.and_then(|(path, _)| path.to_str().map(str::to_owned))
}

#[cfg(not(target_os = "macos"))]
fn generate_thumbnail_path(_canonical: &Path, _max_size: u32) -> Option<String> {
    None
}

#[derive(Debug, Deserialize)]
pub struct GenerateFileThumbnailInput {
    pub path: String,
    #[serde(rename = "maxSize")]
    pub max_size: Option<u32>,
}

#[tauri::command]
pub async fn generate_file_thumbnail<R: Runtime>(
    window: tauri::WebviewWindow<R>,
    registry: State<'_, BookmarkRegistry>,
    input: GenerateFileThumbnailInput,
) -> AppResult<Option<String>> {
    ensure_thumbnail_window_allowed(window.label())?;
    let canonical = ensure_thumbnail_path_authorized(&input.path, &registry)?;
    let max_size = input.max_size.unwrap_or(256).clamp(64, 1024);

    Ok(generate_thumbnail_path(&canonical, max_size))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allowlist_admits_documented_labels_and_grids() {
        for label in THUMBNAIL_ALLOWED_WINDOWS {
            assert!(ensure_thumbnail_window_allowed(label).is_ok());
        }
        assert!(ensure_thumbnail_window_allowed("grid_abcd").is_ok());
    }

    #[test]
    fn allowlist_rejects_others() {
        for label in ["widget_clock", "pet", "ai_cube", "account"] {
            assert!(ensure_thumbnail_window_allowed(label).is_err());
        }
    }

    #[test]
    fn supported_extensions_cover_media_and_pdf() {
        assert!(is_supported_thumbnail_path(Path::new("/Users/me/a.png")));
        assert!(is_supported_thumbnail_path(Path::new("/Users/me/b.mp4")));
        assert!(is_supported_thumbnail_path(Path::new("/Users/me/c.pdf")));
        assert!(!is_supported_thumbnail_path(Path::new("/Users/me/d.txt")));
    }
}
