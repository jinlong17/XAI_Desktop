use crate::app_config::{self, QuickOpenShortcutConfigV2};
use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, Runtime, State, Wry};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

const SNAPSHOT_EVENT_NAME: &str = "xai:desktop-global-hotkey-snapshot";
const DEFAULT_ACCELERATOR: &str = "CommandOrControl+Shift+Space";
const ALT_1_ACCELERATOR: &str = "CommandOrControl+Shift+O";
const ALT_2_ACCELERATOR: &str = "CommandOrControl+Option+O";

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum DesktopQuickOpenPresetId {
    Default,
    Alt1,
    Alt2,
    Disabled,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DesktopQuickOpenRuntimeState {
    Ready,
    Disabled,
    Conflict,
    InvalidConfig,
    NativeError,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopQuickOpenPreference {
    pub preset_id: DesktopQuickOpenPresetId,
    pub accelerator: Option<String>,
    pub enabled: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopQuickOpenRuntime {
    pub state: DesktopQuickOpenRuntimeState,
    pub label: String,
    pub error_code: Option<String>,
    pub recoverable: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopQuickOpenSnapshot {
    pub preference: DesktopQuickOpenPreference,
    pub runtime: DesktopQuickOpenRuntime,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopQuickOpenPreferenceInput {
    pub preset_id: DesktopQuickOpenPresetId,
    pub enabled: bool,
}

#[derive(Clone, Debug)]
struct DesktopQuickOpenRuntimeStore {
    active_accelerator: Option<String>,
    snapshot: DesktopQuickOpenSnapshot,
}

pub struct DesktopQuickOpenState {
    inner: Mutex<DesktopQuickOpenRuntimeStore>,
}

impl Default for DesktopQuickOpenState {
    fn default() -> Self {
        Self {
            inner: Mutex::new(DesktopQuickOpenRuntimeStore {
                active_accelerator: None,
                snapshot: default_snapshot(),
            }),
        }
    }
}

fn default_snapshot() -> DesktopQuickOpenSnapshot {
    DesktopQuickOpenSnapshot {
        preference: DesktopQuickOpenPreference {
            preset_id: DesktopQuickOpenPresetId::Default,
            accelerator: Some(DEFAULT_ACCELERATOR.to_string()),
            enabled: true,
        },
        runtime: DesktopQuickOpenRuntime {
            state: DesktopQuickOpenRuntimeState::Disabled,
            label: "Disabled".to_string(),
            error_code: None,
            recoverable: true,
        },
    }
}

fn preference_to_config(preference: &DesktopQuickOpenPreference) -> QuickOpenShortcutConfigV2 {
    QuickOpenShortcutConfigV2 {
        preset_id: match preference.preset_id {
            DesktopQuickOpenPresetId::Default => "default".to_string(),
            DesktopQuickOpenPresetId::Alt1 => "alt-1".to_string(),
            DesktopQuickOpenPresetId::Alt2 => "alt-2".to_string(),
            DesktopQuickOpenPresetId::Disabled => "disabled".to_string(),
        },
        accelerator: preference.accelerator.clone(),
        enabled: preference.enabled,
    }
}

fn input_from_config(
    config: &QuickOpenShortcutConfigV2,
) -> Option<DesktopQuickOpenPreferenceInput> {
    let preset_id = match config.preset_id.as_str() {
        "default" => DesktopQuickOpenPresetId::Default,
        "alt-1" => DesktopQuickOpenPresetId::Alt1,
        "alt-2" => DesktopQuickOpenPresetId::Alt2,
        "disabled" => DesktopQuickOpenPresetId::Disabled,
        _ => return None,
    };
    Some(DesktopQuickOpenPreferenceInput {
        preset_id,
        enabled: config.enabled,
    })
}

fn ensure_global_hotkey_window_allowed(label: &str) -> AppResult<()> {
    if label == "main" {
        return Ok(());
    }

    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke desktop_global_hotkey commands"
    )))
}

fn resolve_accelerator(preference: &DesktopQuickOpenPreferenceInput) -> Option<&'static str> {
    if !preference.enabled || preference.preset_id == DesktopQuickOpenPresetId::Disabled {
        return None;
    }

    match preference.preset_id {
        DesktopQuickOpenPresetId::Default => Some(DEFAULT_ACCELERATOR),
        DesktopQuickOpenPresetId::Alt1 => Some(ALT_1_ACCELERATOR),
        DesktopQuickOpenPresetId::Alt2 => Some(ALT_2_ACCELERATOR),
        DesktopQuickOpenPresetId::Disabled => None,
    }
}

fn runtime_snapshot(
    preference: DesktopQuickOpenPreference,
    state: DesktopQuickOpenRuntimeState,
    label: impl Into<String>,
    error_code: Option<&'static str>,
) -> DesktopQuickOpenSnapshot {
    DesktopQuickOpenSnapshot {
        preference,
        runtime: DesktopQuickOpenRuntime {
            state,
            label: label.into(),
            error_code: error_code.map(ToString::to_string),
            recoverable: true,
        },
    }
}

fn publish_snapshot<R: Runtime>(
    app: &AppHandle<R>,
    snapshot: &DesktopQuickOpenSnapshot,
) -> AppResult<()> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| AppError::Internal("main window not found".to_string()))?;

    let snapshot_json =
        serde_json::to_string(snapshot).map_err(|error| AppError::Internal(error.to_string()))?;
    let script = format!(
        "window.dispatchEvent(new CustomEvent({event_name:?}, {{ detail: {snapshot_json} }}));",
        event_name = SNAPSHOT_EVENT_NAME,
    );

    window
        .eval(script.as_str())
        .map_err(|error| AppError::Internal(error.to_string()))?;
    Ok(())
}

fn focus_main_window<R: Runtime>(app: &AppHandle<R>) -> AppResult<()> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| AppError::Internal("main window not found".to_string()))?;

    let _ = window.unminimize();
    window
        .show()
        .map_err(|error| AppError::Internal(error.to_string()))?;
    window
        .set_focus()
        .map_err(|error| AppError::Internal(error.to_string()))?;
    Ok(())
}

pub fn handle_global_shortcut_event(
    app: &AppHandle<Wry>,
    shortcut: &Shortcut,
    event: tauri_plugin_global_shortcut::ShortcutEvent,
) {
    if event.state != ShortcutState::Pressed {
        return;
    }

    if let Err(error) = focus_main_window(app) {
        eprintln!(
            "⚠️ Desktop quick-open shortcut `{}` failed: {}",
            shortcut.into_string(),
            error
        );
    }
}

fn parse_shortcut_or_none(value: Option<&str>) -> AppResult<Option<Shortcut>> {
    let Some(raw) = value else {
        return Ok(None);
    };

    let parsed = raw
        .parse::<Shortcut>()
        .map_err(|error| AppError::Internal(format!("invalid shortcut `{raw}`: {error}")))?;
    Ok(Some(parsed))
}

fn map_registration_error(
    err: &str,
    preference: DesktopQuickOpenPreference,
) -> DesktopQuickOpenSnapshot {
    let lowered = err.to_ascii_lowercase();
    if lowered.contains("hotkey")
        || lowered.contains("already")
        || lowered.contains("exists")
        || lowered.contains("register")
    {
        return runtime_snapshot(
            preference,
            DesktopQuickOpenRuntimeState::Conflict,
            "Shortcut unavailable (conflict)",
            Some("conflict"),
        );
    }

    runtime_snapshot(
        preference,
        DesktopQuickOpenRuntimeState::NativeError,
        "Shortcut unavailable",
        Some("native_error"),
    )
}

fn apply_invalid_config<R: Runtime>(
    app: &AppHandle<R>,
    state: &DesktopQuickOpenState,
    config: QuickOpenShortcutConfigV2,
) -> AppResult<()> {
    let mut guard = state
        .inner
        .lock()
        .map_err(|error| AppError::Internal(error.to_string()))?;
    guard.active_accelerator = None;
    guard.snapshot = DesktopQuickOpenSnapshot {
        preference: DesktopQuickOpenPreference {
            preset_id: DesktopQuickOpenPresetId::Default,
            accelerator: config.accelerator,
            enabled: config.enabled,
        },
        runtime: DesktopQuickOpenRuntime {
            state: DesktopQuickOpenRuntimeState::InvalidConfig,
            label: "Invalid shortcut configuration".to_string(),
            error_code: Some("invalid_config".to_string()),
            recoverable: true,
        },
    };
    let snapshot = guard.snapshot.clone();
    drop(guard);
    publish_snapshot(app, &snapshot)?;
    Ok(())
}

fn apply_preference(
    app: &AppHandle<Wry>,
    state: &DesktopQuickOpenState,
    input: DesktopQuickOpenPreferenceInput,
) -> AppResult<DesktopQuickOpenSnapshot> {
    let resolved = resolve_accelerator(&input).map(ToString::to_string);
    let preference = DesktopQuickOpenPreference {
        preset_id: input.preset_id,
        accelerator: resolved.clone(),
        enabled: input.enabled && input.preset_id != DesktopQuickOpenPresetId::Disabled,
    };

    let mut guard = state
        .inner
        .lock()
        .map_err(|error| AppError::Internal(error.to_string()))?;

    if let Some(previous) = parse_shortcut_or_none(guard.active_accelerator.as_deref())? {
        let _ = app.global_shortcut().unregister(previous);
    }

    let snapshot = if let Some(next) = parse_shortcut_or_none(resolved.as_deref())? {
        match app
            .global_shortcut()
            .on_shortcut(next, handle_global_shortcut_event)
        {
            Ok(()) => runtime_snapshot(
                preference,
                DesktopQuickOpenRuntimeState::Ready,
                "Shortcut active",
                None,
            ),
            Err(error) => map_registration_error(error.to_string().as_str(), preference),
        }
    } else {
        runtime_snapshot(
            preference,
            DesktopQuickOpenRuntimeState::Disabled,
            "Shortcut disabled",
            None,
        )
    };

    guard.active_accelerator = if snapshot.runtime.state == DesktopQuickOpenRuntimeState::Ready {
        snapshot.preference.accelerator.clone()
    } else {
        None
    };
    guard.snapshot = snapshot.clone();
    drop(guard);

    publish_snapshot(app, &snapshot)?;
    Ok(snapshot)
}

pub fn initialize_desktop_global_hotkey(
    app: &AppHandle<Wry>,
    state: &DesktopQuickOpenState,
) -> AppResult<()> {
    let config = app_config::load_quick_open_config(app)?;
    if let Some(input) = input_from_config(&config) {
        let snapshot = apply_preference(app, state, input)?;
        app_config::save_quick_open_config(app, preference_to_config(&snapshot.preference))?;
    } else {
        apply_invalid_config(app, state, config)?;
    }
    Ok(())
}

pub fn disable_quick_open_from_menu(app: &AppHandle<Wry>) -> AppResult<()> {
    let input = DesktopQuickOpenPreferenceInput {
        preset_id: DesktopQuickOpenPresetId::Disabled,
        enabled: false,
    };
    let preference = DesktopQuickOpenPreference {
        preset_id: input.preset_id,
        accelerator: None,
        enabled: false,
    };
    app_config::save_quick_open_config(app, preference_to_config(&preference))?;
    let state = app.state::<DesktopQuickOpenState>();
    let _ = apply_preference(app, state.inner(), input)?;
    Ok(())
}

pub fn reset_quick_open_to_default_from_menu(app: &AppHandle<Wry>) -> AppResult<()> {
    let input = DesktopQuickOpenPreferenceInput {
        preset_id: DesktopQuickOpenPresetId::Default,
        enabled: true,
    };
    let preference = DesktopQuickOpenPreference {
        preset_id: input.preset_id,
        accelerator: Some(DEFAULT_ACCELERATOR.to_string()),
        enabled: true,
    };
    app_config::save_quick_open_config(app, preference_to_config(&preference))?;
    let state = app.state::<DesktopQuickOpenState>();
    let _ = apply_preference(app, state.inner(), input)?;
    Ok(())
}

#[tauri::command]
pub async fn desktop_global_hotkey_get_snapshot(
    window: tauri::WebviewWindow,
    state: State<'_, DesktopQuickOpenState>,
) -> AppResult<DesktopQuickOpenSnapshot> {
    ensure_global_hotkey_window_allowed(window.label())?;
    let snapshot = state
        .inner
        .lock()
        .map_err(|error| AppError::Internal(error.to_string()))?
        .snapshot
        .clone();
    Ok(snapshot)
}

#[tauri::command]
pub async fn desktop_global_hotkey_set_preference(
    window: tauri::WebviewWindow,
    app: AppHandle<Wry>,
    state: State<'_, DesktopQuickOpenState>,
    input: DesktopQuickOpenPreferenceInput,
) -> AppResult<DesktopQuickOpenSnapshot> {
    ensure_global_hotkey_window_allowed(window.label())?;
    let preference = DesktopQuickOpenPreference {
        preset_id: input.preset_id,
        accelerator: resolve_accelerator(&input).map(ToString::to_string),
        enabled: input.enabled && input.preset_id != DesktopQuickOpenPresetId::Disabled,
    };
    app_config::save_quick_open_config(&app, preference_to_config(&preference))?;
    apply_preference(&app, &state, input)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preset_to_accelerator_mapping_matches_contract() {
        assert_eq!(
            resolve_accelerator(&DesktopQuickOpenPreferenceInput {
                preset_id: DesktopQuickOpenPresetId::Default,
                enabled: true,
            }),
            Some(DEFAULT_ACCELERATOR)
        );
        assert_eq!(
            resolve_accelerator(&DesktopQuickOpenPreferenceInput {
                preset_id: DesktopQuickOpenPresetId::Alt1,
                enabled: true,
            }),
            Some(ALT_1_ACCELERATOR)
        );
        assert_eq!(
            resolve_accelerator(&DesktopQuickOpenPreferenceInput {
                preset_id: DesktopQuickOpenPresetId::Alt2,
                enabled: true,
            }),
            Some(ALT_2_ACCELERATOR)
        );
        assert_eq!(
            resolve_accelerator(&DesktopQuickOpenPreferenceInput {
                preset_id: DesktopQuickOpenPresetId::Disabled,
                enabled: true,
            }),
            None
        );
        assert_eq!(
            resolve_accelerator(&DesktopQuickOpenPreferenceInput {
                preset_id: DesktopQuickOpenPresetId::Default,
                enabled: false,
            }),
            None
        );
    }

    #[test]
    fn main_window_allowlist_is_enforced() {
        assert!(ensure_global_hotkey_window_allowed("main").is_ok());
        let error = ensure_global_hotkey_window_allowed("control").unwrap_err();
        match error {
            AppError::SyncCapabilityDenied(message) => {
                assert!(message.contains("control"));
                assert!(message.contains("desktop_global_hotkey"));
            }
            other => panic!("unexpected error: {other:?}"),
        }
    }

    #[test]
    fn conflict_errors_are_mapped_to_recoverable_state() {
        let preference = DesktopQuickOpenPreference {
            preset_id: DesktopQuickOpenPresetId::Default,
            accelerator: Some(DEFAULT_ACCELERATOR.to_string()),
            enabled: true,
        };

        let snapshot =
            map_registration_error("already registered by another application", preference);
        assert_eq!(
            snapshot.runtime.state,
            DesktopQuickOpenRuntimeState::Conflict
        );
        assert_eq!(snapshot.runtime.error_code.as_deref(), Some("conflict"));
        assert!(snapshot.runtime.recoverable);
    }
}
