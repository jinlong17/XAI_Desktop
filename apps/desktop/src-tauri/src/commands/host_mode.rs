use crate::app_config::{self, DesktopHostMode};
use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopHostModeSnapshot {
    pub host_mode: DesktopHostMode,
    pub requires_restart: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopHostModeSetInput {
    pub host_mode: DesktopHostMode,
}

fn ensure_host_mode_command_allowed(label: &str) -> AppResult<()> {
    if label == "main" {
        return Ok(());
    }

    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke desktop_host_mode commands"
    )))
}

fn snapshot(host_mode: DesktopHostMode) -> DesktopHostModeSnapshot {
    DesktopHostModeSnapshot {
        host_mode,
        requires_restart: true,
    }
}

#[tauri::command]
pub fn desktop_host_mode_get(
    window: tauri::WebviewWindow,
    app: AppHandle,
) -> AppResult<DesktopHostModeSnapshot> {
    ensure_host_mode_command_allowed(window.label())?;
    let host_mode = app_config::load_host_mode(&app)?;
    Ok(snapshot(host_mode))
}

#[tauri::command]
pub fn desktop_host_mode_set(
    window: tauri::WebviewWindow,
    app: AppHandle,
    input: DesktopHostModeSetInput,
) -> AppResult<DesktopHostModeSnapshot> {
    ensure_host_mode_command_allowed(window.label())?;
    app_config::save_host_mode(&app, input.host_mode)?;
    Ok(snapshot(input.host_mode))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn snapshot_marks_restart_required() {
        let current = snapshot(DesktopHostMode::Normal);
        assert_eq!(current.host_mode, DesktopHostMode::Normal);
        assert!(current.requires_restart);
    }

    #[test]
    fn host_mode_allowlist_rejects_non_main_windows() {
        let err = ensure_host_mode_command_allowed("control").unwrap_err();
        assert!(err.to_string().contains("desktop_host_mode"));
    }
}
