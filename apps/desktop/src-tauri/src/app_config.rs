use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime, WebviewWindow, WindowEvent};

use crate::error::{AppError, AppResult};

const CONFIG_FILENAME: &str = "app-config.json";
const SCHEMA_VERSION_V1: u32 = 1;
const MIN_WINDOW_WIDTH: f64 = 720.0;
const MIN_WINDOW_HEIGHT: f64 = 480.0;
const MAX_WINDOW_WIDTH: f64 = 8192.0;
const MAX_WINDOW_HEIGHT: f64 = 8192.0;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopAppConfigV1 {
    pub schema_version: u32,
    pub updated_at: String,
    pub window: DesktopWindowConfigV1,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct DesktopWindowConfigV1 {
    pub main: MainWindowStateV1,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MainWindowStateV1 {
    pub width: f64,
    pub height: f64,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub maximized: bool,
    pub fullscreen: bool,
}

#[derive(Clone, Copy, Debug)]
struct MonitorBounds {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    scale_factor: f64,
}

pub fn default_main_window_state() -> MainWindowStateV1 {
    MainWindowStateV1 {
        width: 1280.0,
        height: 720.0,
        x: None,
        y: None,
        maximized: false,
        fullscreen: false,
    }
}

pub fn default_config() -> DesktopAppConfigV1 {
    DesktopAppConfigV1 {
        schema_version: SCHEMA_VERSION_V1,
        updated_at: current_timestamp_tag(),
        window: DesktopWindowConfigV1 {
            main: default_main_window_state(),
        },
    }
}

pub fn ensure_config_dir<R: Runtime>(app: &AppHandle<R>) -> AppResult<PathBuf> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|error| AppError::Internal(format!("failed to resolve app config dir: {error}")))?;
    fs::create_dir_all(&config_dir)
        .map_err(|error| AppError::Internal(format!("failed to create app config dir: {error}")))?;
    Ok(config_dir)
}

fn config_file_path<R: Runtime>(app: &AppHandle<R>) -> AppResult<PathBuf> {
    Ok(ensure_config_dir(app)?.join(CONFIG_FILENAME))
}

pub fn load_config_or_default<R: Runtime>(app: &AppHandle<R>) -> AppResult<DesktopAppConfigV1> {
    let config_path = config_file_path(app)?;
    load_config_from_path(&config_path)
}

fn load_config_from_path(config_path: &Path) -> AppResult<DesktopAppConfigV1> {
    if !config_path.exists() {
        return Ok(default_config());
    }

    let raw = fs::read_to_string(&config_path)
        .map_err(|error| AppError::Internal(format!("failed to read app config: {error}")))?;

    let loaded: DesktopAppConfigV1 = match serde_json::from_str(&raw) {
        Ok(config) => config,
        Err(error) => {
            eprintln!(
                "⚠️ App config parse failed at {}: {error}. Falling back to defaults.",
                config_path.display()
            );
            return Ok(default_config());
        }
    };

    if loaded.schema_version != SCHEMA_VERSION_V1 {
        eprintln!(
            "⚠️ Unsupported app config schemaVersion {}. Falling back to defaults.",
            loaded.schema_version
        );
        return Ok(default_config());
    }

    Ok(loaded)
}

pub fn save_config<R: Runtime>(app: &AppHandle<R>, mut config: DesktopAppConfigV1) -> AppResult<()> {
    let config_path = config_file_path(app)?;
    save_config_to_path(&config_path, &mut config)
}

fn save_config_to_path(config_path: &Path, config: &mut DesktopAppConfigV1) -> AppResult<()> {
    config.updated_at = current_timestamp_tag();
    let temp_path = config_path.with_extension("json.tmp");
    let bytes = serde_json::to_vec_pretty(&config)
        .map_err(|error| AppError::Internal(format!("failed to serialize app config: {error}")))?;

    fs::write(&temp_path, &bytes)
        .map_err(|error| AppError::Internal(format!("failed to write temp app config: {error}")))?;
    fs::rename(&temp_path, &config_path)
        .map_err(|error| AppError::Internal(format!("failed to replace app config file: {error}")))?;
    Ok(())
}

pub fn apply_main_window_state<R: Runtime>(
    window: &WebviewWindow<R>,
    requested: &MainWindowStateV1,
) -> AppResult<MainWindowStateV1> {
    let monitors = collect_monitor_bounds(window)?;
    let normalized =
        normalize_main_window_state(requested, &monitors).unwrap_or_else(default_main_window_state);

    let _ = window.set_fullscreen(false);
    let _ = window.unmaximize();

    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize::new(
            normalized.width,
            normalized.height,
        )))
        .map_err(|error| AppError::Internal(format!("failed to set main window size: {error}")))?;

    if let (Some(x), Some(y)) = (normalized.x, normalized.y) {
        window
            .set_position(tauri::Position::Logical(tauri::LogicalPosition::new(x, y)))
            .map_err(|error| AppError::Internal(format!("failed to set main window position: {error}")))?;
    }

    if normalized.fullscreen {
        window
            .set_fullscreen(true)
            .map_err(|error| AppError::Internal(format!("failed to set main window fullscreen: {error}")))?;
    } else if normalized.maximized {
        window
            .maximize()
            .map_err(|error| AppError::Internal(format!("failed to set main window maximized: {error}")))?;
    }

    Ok(normalized)
}

pub fn persist_main_window_state<R: Runtime>(
    app: &AppHandle<R>,
    window: &WebviewWindow<R>,
) -> AppResult<MainWindowStateV1> {
    let current = capture_main_window_state(window)?;
    let monitors = collect_monitor_bounds(window)?;
    let normalized = normalize_main_window_state(&current, &monitors)
        .unwrap_or_else(default_main_window_state);
    let mut config = load_config_or_default(app)?;
    config.window.main = normalized.clone();
    save_config(app, config)?;
    Ok(normalized)
}

pub fn reset_main_window_state<R: Runtime>(app: &AppHandle<R>) -> AppResult<MainWindowStateV1> {
    let default_state = default_main_window_state();
    let mut config = load_config_or_default(app)?;
    config.window.main = default_state.clone();
    save_config(app, config)?;
    Ok(default_state)
}

pub fn attach_main_window_persistence<R: Runtime>(window: &WebviewWindow<R>, app: AppHandle<R>) {
    let main_window = window.clone();
    window.on_window_event(move |event| {
        let should_persist = matches!(
            event,
            WindowEvent::Moved(_)
                | WindowEvent::Resized(_)
                | WindowEvent::CloseRequested { .. }
                | WindowEvent::Destroyed
                | WindowEvent::ScaleFactorChanged { .. }
        );
        if !should_persist {
            return;
        }

        if let Err(error) = persist_main_window_state(&app, &main_window) {
            eprintln!("⚠️ Failed to persist main window state: {error}");
        }
    });
}

fn capture_main_window_state<R: Runtime>(window: &WebviewWindow<R>) -> AppResult<MainWindowStateV1> {
    let physical_size = window
        .outer_size()
        .map_err(|error| AppError::Internal(format!("failed to read main window size: {error}")))?;
    let scale_factor = window
        .scale_factor()
        .map_err(|error| AppError::Internal(format!("failed to read main window scale factor: {error}")))?;
    let logical_size = tauri::LogicalSize::<f64>::from_physical(physical_size, scale_factor);
    let logical_position = window
        .outer_position()
        .ok()
        .map(|point| tauri::LogicalPosition::<f64>::from_physical(point, scale_factor));
    let maximized = window.is_maximized().unwrap_or(false);
    let fullscreen = window.is_fullscreen().unwrap_or(false);

    Ok(MainWindowStateV1 {
        width: logical_size.width,
        height: logical_size.height,
        x: logical_position.map(|point| point.x),
        y: logical_position.map(|point| point.y),
        maximized,
        fullscreen,
    })
}

fn normalize_main_window_state(
    requested: &MainWindowStateV1,
    monitors: &[MonitorBounds],
) -> Option<MainWindowStateV1> {
    if !requested.width.is_finite()
        || !requested.height.is_finite()
        || requested.width <= 0.0
        || requested.height <= 0.0
    {
        return None;
    }

    let width = requested.width.clamp(MIN_WINDOW_WIDTH, MAX_WINDOW_WIDTH);
    let height = requested.height.clamp(MIN_WINDOW_HEIGHT, MAX_WINDOW_HEIGHT);
    let fullscreen = requested.fullscreen;
    let maximized = if fullscreen { false } else { requested.maximized };

    if monitors.is_empty() {
        return Some(MainWindowStateV1 {
            width,
            height,
            x: requested.x,
            y: requested.y,
            maximized,
            fullscreen,
        });
    }

    if has_mixed_scale_factors(monitors) {
        return Some(MainWindowStateV1 {
            width,
            height,
            x: None,
            y: None,
            maximized,
            fullscreen,
        });
    }

    let (x, y) = match (requested.x, requested.y) {
        (Some(x), Some(y)) => fit_position_into_monitors(x, y, width, height, monitors)?,
        _ => (None, None),
    };

    Some(MainWindowStateV1 {
        width,
        height,
        x,
        y,
        maximized,
        fullscreen,
    })
}

fn has_mixed_scale_factors(monitors: &[MonitorBounds]) -> bool {
    if monitors.len() < 2 {
        return false;
    }
    let baseline = monitors[0].scale_factor;
    monitors
        .iter()
        .skip(1)
        .any(|monitor| (monitor.scale_factor - baseline).abs() > 0.01)
}

fn fit_position_into_monitors(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    monitors: &[MonitorBounds],
) -> Option<(Option<f64>, Option<f64>)> {
    let mut candidate: Option<(f64, f64, f64)> = None;

    for monitor in monitors {
        if width > monitor.width || height > monitor.height {
            continue;
        }

        let min_x = monitor.x;
        let max_x = monitor.x + (monitor.width - width).max(0.0);
        let min_y = monitor.y;
        let max_y = monitor.y + (monitor.height - height).max(0.0);
        let clamped_x = x.clamp(min_x, max_x);
        let clamped_y = y.clamp(min_y, max_y);
        let penalty = (clamped_x - x).abs() + (clamped_y - y).abs();

        match candidate {
            Some((_, _, best_penalty)) if penalty >= best_penalty => {}
            _ => candidate = Some((clamped_x, clamped_y, penalty)),
        }
    }

    candidate.map(|(best_x, best_y, _)| (Some(best_x), Some(best_y)))
}

fn collect_monitor_bounds<R: Runtime>(window: &WebviewWindow<R>) -> AppResult<Vec<MonitorBounds>> {
    let monitors = window
        .available_monitors()
        .map_err(|error| AppError::Internal(format!("failed to read monitors: {error}")))?;
    let mut bounds = Vec::with_capacity(monitors.len());

    for monitor in monitors {
        let work_area = monitor.work_area();
        let scale_factor = monitor.scale_factor();
        let logical_position =
            tauri::LogicalPosition::<f64>::from_physical(work_area.position, scale_factor);
        let logical_size = tauri::LogicalSize::<f64>::from_physical(work_area.size, scale_factor);
        bounds.push(MonitorBounds {
            x: logical_position.x,
            y: logical_position.y,
            width: logical_size.width,
            height: logical_size.height,
            scale_factor,
        });
    }

    Ok(bounds)
}

fn current_timestamp_tag() -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    format!("unix-seconds:{}", now.as_secs())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::process;

    fn monitor(x: f64, y: f64, width: f64, height: f64) -> MonitorBounds {
        MonitorBounds {
            x,
            y,
            width,
            height,
            scale_factor: 2.0,
        }
    }

    fn monitor_with_scale(x: f64, y: f64, width: f64, height: f64, scale_factor: f64) -> MonitorBounds {
        MonitorBounds {
            x,
            y,
            width,
            height,
            scale_factor,
        }
    }

    #[test]
    fn normalize_rejects_invalid_dimensions() {
        let mut input = default_main_window_state();
        input.width = 0.0;
        assert!(normalize_main_window_state(&input, &[monitor(0.0, 0.0, 1920.0, 1080.0)]).is_none());
    }

    #[test]
    fn normalize_clamps_and_fits_to_monitor() {
        let input = MainWindowStateV1 {
            width: 5000.0,
            height: 3000.0,
            x: Some(-4000.0),
            y: Some(-2000.0),
            maximized: false,
            fullscreen: false,
        };
        let output = normalize_main_window_state(&input, &[monitor(0.0, 0.0, 9000.0, 9000.0)]).unwrap();
        assert_eq!(output.width, 5000.0_f64.clamp(MIN_WINDOW_WIDTH, MAX_WINDOW_WIDTH));
        assert_eq!(output.height, 3000.0_f64.clamp(MIN_WINDOW_HEIGHT, MAX_WINDOW_HEIGHT));
        assert_eq!(output.x, Some(0.0));
        assert_eq!(output.y, Some(0.0));
    }

    #[test]
    fn normalize_falls_back_when_monitor_layout_cannot_fit() {
        let input = MainWindowStateV1 {
            width: 3200.0,
            height: 2200.0,
            x: Some(100.0),
            y: Some(100.0),
            maximized: false,
            fullscreen: false,
        };
        let result = normalize_main_window_state(&input, &[monitor(0.0, 0.0, 1920.0, 1080.0)]);
        assert!(result.is_none());
    }

    #[test]
    fn normalize_keeps_unpositioned_state() {
        let input = MainWindowStateV1 {
            width: 1280.0,
            height: 720.0,
            x: None,
            y: None,
            maximized: false,
            fullscreen: false,
        };
        let output = normalize_main_window_state(&input, &[monitor(0.0, 0.0, 1920.0, 1080.0)]).unwrap();
        assert_eq!(output.x, None);
        assert_eq!(output.y, None);
    }

    #[test]
    fn normalize_drops_position_on_mixed_scale_monitors() {
        let input = MainWindowStateV1 {
            width: 1280.0,
            height: 720.0,
            x: Some(640.0),
            y: Some(360.0),
            maximized: false,
            fullscreen: false,
        };
        let output = normalize_main_window_state(
            &input,
            &[
                monitor_with_scale(0.0, 0.0, 1728.0, 1117.0, 2.0),
                monitor_with_scale(1728.0, 0.0, 1920.0, 1040.0, 1.0),
            ],
        )
        .unwrap();
        assert_eq!(output.x, None);
        assert_eq!(output.y, None);
    }

    fn unique_test_path(test_name: &str) -> PathBuf {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        env::temp_dir()
            .join(format!("xai-desktop-app-config-{test_name}-{}-{now}", process::id()))
            .join(CONFIG_FILENAME)
    }

    #[test]
    fn load_defaults_when_file_absent() {
        let path = unique_test_path("missing");
        let loaded = load_config_from_path(&path).expect("missing file should load defaults");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V1);
        assert_eq!(loaded.window.main, default_main_window_state());
    }

    #[test]
    fn save_and_load_round_trip_config() {
        let path = unique_test_path("roundtrip");
        let dir = path.parent().expect("config file should have parent dir");
        fs::create_dir_all(dir).expect("test dir should be creatable");

        let mut config = DesktopAppConfigV1 {
            schema_version: SCHEMA_VERSION_V1,
            updated_at: "unix-seconds:0".to_string(),
            window: DesktopWindowConfigV1 {
                main: MainWindowStateV1 {
                    width: 1440.0,
                    height: 900.0,
                    x: Some(120.0),
                    y: Some(88.0),
                    maximized: true,
                    fullscreen: false,
                },
            },
        };

        save_config_to_path(&path, &mut config).expect("save should succeed");
        let loaded = load_config_from_path(&path).expect("load should succeed");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V1);
        assert_eq!(loaded.window.main, config.window.main);
        assert!(loaded.updated_at.starts_with("unix-seconds:"));

        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn corrupt_json_falls_back_to_defaults() {
        let path = unique_test_path("corrupt");
        let dir = path.parent().expect("config file should have parent dir");
        fs::create_dir_all(dir).expect("test dir should be creatable");
        fs::write(&path, "{not-valid-json").expect("corrupt file should be writable");

        let loaded = load_config_from_path(&path).expect("corrupt config should still resolve");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V1);
        assert_eq!(loaded.window.main, default_main_window_state());

        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn unsupported_schema_falls_back_to_defaults() {
        let path = unique_test_path("schema");
        let dir = path.parent().expect("config file should have parent dir");
        fs::create_dir_all(dir).expect("test dir should be creatable");
        let payload = r#"{
  "schemaVersion": 999,
  "updatedAt": "unix-seconds:0",
  "window": {
    "main": {
      "width": 9999,
      "height": 9999,
      "x": 1,
      "y": 1,
      "maximized": true,
      "fullscreen": true
    }
  }
}"#;
        fs::write(&path, payload).expect("schema test payload should be writable");

        let loaded = load_config_from_path(&path).expect("unsupported schema should still resolve");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V1);
        assert_eq!(loaded.window.main, default_main_window_state());

        let _ = fs::remove_dir_all(dir);
    }
}
