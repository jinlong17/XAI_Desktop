use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Monitor, Runtime, WebviewWindow, WindowEvent};

use crate::error::{AppError, AppResult};

const CONFIG_FILENAME: &str = "app-config.json";
const SCHEMA_VERSION_V1: u32 = 1;
const SCHEMA_VERSION_V2: u32 = 2;
const SCHEMA_VERSION_V3: u32 = 3;
const MIN_WINDOW_WIDTH: f64 = 720.0;
const MIN_WINDOW_HEIGHT: f64 = 480.0;
const MAX_WINDOW_WIDTH: f64 = 8192.0;
const MAX_WINDOW_HEIGHT: f64 = 8192.0;
static MAIN_WINDOW_PERSISTENCE_PAUSE_COUNT: AtomicUsize = AtomicUsize::new(0);

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopAppConfig {
    pub schema_version: u32,
    pub updated_at: String,
    pub window: DesktopWindowConfigV1,
    pub quick_open: QuickOpenShortcutConfigV2,
    pub host_mode: DesktopHostMode,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DesktopHostMode {
    Normal,
    OverlayV2,
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

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct QuickOpenShortcutConfigV2 {
    pub preset_id: String,
    pub accelerator: Option<String>,
    pub enabled: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct DesktopAppConfigV1Legacy {
    pub schema_version: u32,
    pub updated_at: String,
    pub window: DesktopWindowConfigV1,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct DesktopAppConfigV2Legacy {
    pub schema_version: u32,
    pub updated_at: String,
    pub window: DesktopWindowConfigV1,
    pub quick_open: QuickOpenShortcutConfigV2,
}

#[derive(Clone, Copy, Debug)]
struct MonitorBounds {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    scale_factor: f64,
}

struct MainWindowPersistencePauseGuard;

impl Drop for MainWindowPersistencePauseGuard {
    fn drop(&mut self) {
        MAIN_WINDOW_PERSISTENCE_PAUSE_COUNT.fetch_sub(1, Ordering::SeqCst);
    }
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

pub fn default_quick_open_config() -> QuickOpenShortcutConfigV2 {
    QuickOpenShortcutConfigV2 {
        preset_id: "default".to_string(),
        accelerator: Some("CommandOrControl+Shift+Space".to_string()),
        enabled: true,
    }
}

pub fn default_host_mode() -> DesktopHostMode {
    DesktopHostMode::Normal
}

pub fn default_config() -> DesktopAppConfig {
    DesktopAppConfig {
        schema_version: SCHEMA_VERSION_V3,
        updated_at: current_timestamp_tag(),
        window: DesktopWindowConfigV1 {
            main: default_main_window_state(),
        },
        quick_open: default_quick_open_config(),
        host_mode: default_host_mode(),
    }
}

pub fn ensure_config_dir<R: Runtime>(app: &AppHandle<R>) -> AppResult<PathBuf> {
    let config_dir = app.path().app_config_dir().map_err(|error| {
        AppError::Internal(format!("failed to resolve app config dir: {error}"))
    })?;
    fs::create_dir_all(&config_dir)
        .map_err(|error| AppError::Internal(format!("failed to create app config dir: {error}")))?;
    Ok(config_dir)
}

fn config_file_path<R: Runtime>(app: &AppHandle<R>) -> AppResult<PathBuf> {
    Ok(ensure_config_dir(app)?.join(CONFIG_FILENAME))
}

pub fn load_config_or_default<R: Runtime>(app: &AppHandle<R>) -> AppResult<DesktopAppConfig> {
    let config_path = config_file_path(app)?;
    load_config_from_path(&config_path)
}

fn load_config_from_path(config_path: &Path) -> AppResult<DesktopAppConfig> {
    if !config_path.exists() {
        return Ok(default_config());
    }

    let raw = fs::read_to_string(&config_path)
        .map_err(|error| AppError::Internal(format!("failed to read app config: {error}")))?;

    if let Ok(config) = serde_json::from_str::<DesktopAppConfig>(&raw) {
        if config.schema_version == SCHEMA_VERSION_V3 {
            return Ok(config);
        }
    }

    if let Ok(legacy) = serde_json::from_str::<DesktopAppConfigV2Legacy>(&raw) {
        if legacy.schema_version == SCHEMA_VERSION_V2 {
            return Ok(DesktopAppConfig {
                schema_version: SCHEMA_VERSION_V3,
                updated_at: legacy.updated_at,
                window: legacy.window,
                quick_open: legacy.quick_open,
                host_mode: default_host_mode(),
            });
        }
    }

    if let Ok(legacy) = serde_json::from_str::<DesktopAppConfigV1Legacy>(&raw) {
        if legacy.schema_version == SCHEMA_VERSION_V1 {
            return Ok(DesktopAppConfig {
                schema_version: SCHEMA_VERSION_V3,
                updated_at: legacy.updated_at,
                window: legacy.window,
                quick_open: default_quick_open_config(),
                host_mode: default_host_mode(),
            });
        }
    }

    eprintln!(
        "⚠️ App config parse/migration failed at {}. Falling back to defaults.",
        config_path.display()
    );
    Ok(default_config())
}

pub fn save_config<R: Runtime>(app: &AppHandle<R>, mut config: DesktopAppConfig) -> AppResult<()> {
    let config_path = config_file_path(app)?;
    save_config_to_path(&config_path, &mut config)
}

fn save_config_to_path(config_path: &Path, config: &mut DesktopAppConfig) -> AppResult<()> {
    config.schema_version = SCHEMA_VERSION_V3;
    config.updated_at = current_timestamp_tag();
    let temp_path = config_path.with_extension("json.tmp");
    let bytes = serde_json::to_vec_pretty(&config)
        .map_err(|error| AppError::Internal(format!("failed to serialize app config: {error}")))?;

    fs::write(&temp_path, &bytes)
        .map_err(|error| AppError::Internal(format!("failed to write temp app config: {error}")))?;
    fs::rename(&temp_path, &config_path).map_err(|error| {
        AppError::Internal(format!("failed to replace app config file: {error}"))
    })?;
    Ok(())
}

pub fn apply_main_window_state<R: Runtime>(
    window: &WebviewWindow<R>,
    requested: &MainWindowStateV1,
) -> AppResult<MainWindowStateV1> {
    let monitors = collect_monitor_bounds(window)?;
    let normalized =
        normalize_main_window_state(requested, &monitors).unwrap_or_else(default_main_window_state);

    apply_normalized_main_window_state(window, &normalized)?;
    Ok(normalized)
}

fn apply_normalized_main_window_state<R: Runtime>(
    window: &WebviewWindow<R>,
    normalized: &MainWindowStateV1,
) -> AppResult<()> {
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
            .map_err(|error| {
                AppError::Internal(format!("failed to set main window position: {error}"))
            })?;
    }

    if normalized.fullscreen {
        window.set_fullscreen(true).map_err(|error| {
            AppError::Internal(format!("failed to set main window fullscreen: {error}"))
        })?;
    } else if normalized.maximized {
        window.maximize().map_err(|error| {
            AppError::Internal(format!("failed to set main window maximized: {error}"))
        })?;
    }

    Ok(())
}

pub fn persist_main_window_state<R: Runtime>(
    app: &AppHandle<R>,
    window: &WebviewWindow<R>,
) -> AppResult<MainWindowStateV1> {
    let current = capture_main_window_state(window)?;
    let monitors = collect_monitor_bounds(window)?;
    let normalized =
        normalize_main_window_state(&current, &monitors).unwrap_or_else(default_main_window_state);
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

pub fn load_quick_open_config<R: Runtime>(
    app: &AppHandle<R>,
) -> AppResult<QuickOpenShortcutConfigV2> {
    let config = load_config_or_default(app)?;
    Ok(config.quick_open)
}

pub fn save_quick_open_config<R: Runtime>(
    app: &AppHandle<R>,
    quick_open: QuickOpenShortcutConfigV2,
) -> AppResult<()> {
    let mut config = load_config_or_default(app)?;
    config.quick_open = quick_open;
    save_config(app, config)
}

pub fn load_host_mode<R: Runtime>(app: &AppHandle<R>) -> AppResult<DesktopHostMode> {
    let config = load_config_or_default(app)?;
    Ok(config.host_mode)
}

pub fn save_host_mode<R: Runtime>(app: &AppHandle<R>, host_mode: DesktopHostMode) -> AppResult<()> {
    let mut config = load_config_or_default(app)?;
    config.host_mode = host_mode;
    save_config(app, config)
}

pub fn reset_main_window_state_for_window<R: Runtime>(
    app: &AppHandle<R>,
    window: &WebviewWindow<R>,
) -> AppResult<MainWindowStateV1> {
    let _pause_persistence = pause_main_window_persistence();
    let reset_state = default_main_window_reset_state(window)?;
    apply_normalized_main_window_state(window, &reset_state)?;
    let mut config = load_config_or_default(app)?;
    config.window.main = reset_state.clone();
    save_config(app, config)?;
    Ok(reset_state)
}

pub fn attach_main_window_persistence<R: Runtime>(window: &WebviewWindow<R>, app: AppHandle<R>) {
    let main_window = window.clone();
    window.on_window_event(move |event| {
        if is_main_window_persistence_paused() {
            return;
        }

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

fn pause_main_window_persistence() -> MainWindowPersistencePauseGuard {
    MAIN_WINDOW_PERSISTENCE_PAUSE_COUNT.fetch_add(1, Ordering::SeqCst);
    MainWindowPersistencePauseGuard
}

fn is_main_window_persistence_paused() -> bool {
    MAIN_WINDOW_PERSISTENCE_PAUSE_COUNT.load(Ordering::SeqCst) > 0
}

fn default_main_window_reset_state<R: Runtime>(
    window: &WebviewWindow<R>,
) -> AppResult<MainWindowStateV1> {
    let monitor = current_or_first_monitor_bounds(window)?;
    Ok(center_default_main_window_state(monitor))
}

fn current_or_first_monitor_bounds<R: Runtime>(
    window: &WebviewWindow<R>,
) -> AppResult<Option<MonitorBounds>> {
    if let Some(monitor) = window
        .current_monitor()
        .map_err(|error| AppError::Internal(format!("failed to read current monitor: {error}")))?
    {
        return Ok(Some(monitor_bounds(&monitor)));
    }

    Ok(collect_monitor_bounds(window)?.into_iter().next())
}

fn capture_main_window_state<R: Runtime>(
    window: &WebviewWindow<R>,
) -> AppResult<MainWindowStateV1> {
    let physical_size = window
        .outer_size()
        .map_err(|error| AppError::Internal(format!("failed to read main window size: {error}")))?;
    let scale_factor = window.scale_factor().map_err(|error| {
        AppError::Internal(format!("failed to read main window scale factor: {error}"))
    })?;
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
    let maximized = if fullscreen {
        false
    } else {
        requested.maximized
    };

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
        bounds.push(monitor_bounds(&monitor));
    }

    Ok(bounds)
}

fn monitor_bounds(monitor: &Monitor) -> MonitorBounds {
    let work_area = monitor.work_area();
    let scale_factor = monitor.scale_factor();
    let logical_position =
        tauri::LogicalPosition::<f64>::from_physical(work_area.position, scale_factor);
    let logical_size = tauri::LogicalSize::<f64>::from_physical(work_area.size, scale_factor);
    MonitorBounds {
        x: logical_position.x,
        y: logical_position.y,
        width: logical_size.width,
        height: logical_size.height,
        scale_factor,
    }
}

fn center_default_main_window_state(monitor: Option<MonitorBounds>) -> MainWindowStateV1 {
    let mut state = default_main_window_state();
    let Some(monitor) = monitor else {
        return state;
    };

    state.width = state.width.min(monitor.width).max(1.0);
    state.height = state.height.min(monitor.height).max(1.0);
    state.x = Some(monitor.x + (monitor.width - state.width).max(0.0) / 2.0);
    state.y = Some(monitor.y + (monitor.height - state.height).max(0.0) / 2.0);
    state
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

    fn monitor_with_scale(
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        scale_factor: f64,
    ) -> MonitorBounds {
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
        assert!(
            normalize_main_window_state(&input, &[monitor(0.0, 0.0, 1920.0, 1080.0)]).is_none()
        );
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
        let output =
            normalize_main_window_state(&input, &[monitor(0.0, 0.0, 9000.0, 9000.0)]).unwrap();
        assert_eq!(
            output.width,
            5000.0_f64.clamp(MIN_WINDOW_WIDTH, MAX_WINDOW_WIDTH)
        );
        assert_eq!(
            output.height,
            3000.0_f64.clamp(MIN_WINDOW_HEIGHT, MAX_WINDOW_HEIGHT)
        );
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
        let output =
            normalize_main_window_state(&input, &[monitor(0.0, 0.0, 1920.0, 1080.0)]).unwrap();
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

    #[test]
    fn reset_default_centers_on_current_monitor() {
        let output = center_default_main_window_state(Some(monitor_with_scale(
            -1728.0, 0.0, 1728.0, 1117.0, 2.0,
        )));

        assert_eq!(output.width, 1280.0);
        assert_eq!(output.height, 720.0);
        assert_eq!(output.x, Some(-1504.0));
        assert_eq!(output.y, Some(198.5));
        assert!(!output.maximized);
        assert!(!output.fullscreen);
    }

    #[test]
    fn reset_default_without_monitor_keeps_unpositioned_state() {
        assert_eq!(
            center_default_main_window_state(None),
            default_main_window_state()
        );
    }

    fn unique_test_path(test_name: &str) -> PathBuf {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        env::temp_dir()
            .join(format!(
                "xai-desktop-app-config-{test_name}-{}-{now}",
                process::id()
            ))
            .join(CONFIG_FILENAME)
    }

    #[test]
    fn load_defaults_when_file_absent() {
        let path = unique_test_path("missing");
        let loaded = load_config_from_path(&path).expect("missing file should load defaults");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V3);
        assert_eq!(loaded.window.main, default_main_window_state());
        assert_eq!(loaded.quick_open, default_quick_open_config());
        assert_eq!(loaded.host_mode, default_host_mode());
    }

    #[test]
    fn save_and_load_round_trip_config() {
        let path = unique_test_path("roundtrip");
        let dir = path.parent().expect("config file should have parent dir");
        fs::create_dir_all(dir).expect("test dir should be creatable");

        let mut config = DesktopAppConfig {
            schema_version: SCHEMA_VERSION_V3,
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
            quick_open: QuickOpenShortcutConfigV2 {
                preset_id: "alt-1".to_string(),
                accelerator: Some("CommandOrControl+Shift+O".to_string()),
                enabled: true,
            },
            host_mode: DesktopHostMode::OverlayV2,
        };

        save_config_to_path(&path, &mut config).expect("save should succeed");
        let loaded = load_config_from_path(&path).expect("load should succeed");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V3);
        assert_eq!(loaded.window.main, config.window.main);
        assert_eq!(loaded.quick_open, config.quick_open);
        assert_eq!(loaded.host_mode, config.host_mode);
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
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V3);
        assert_eq!(loaded.window.main, default_main_window_state());
        assert_eq!(loaded.quick_open, default_quick_open_config());
        assert_eq!(loaded.host_mode, default_host_mode());

        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn v1_schema_migrates_forward_to_v3_with_default_quick_open_and_host_mode() {
        let path = unique_test_path("v1-migrate");
        let dir = path.parent().expect("config file should have parent dir");
        fs::create_dir_all(dir).expect("test dir should be creatable");
        let payload = r#"{
  "schemaVersion": 1,
  "updatedAt": "unix-seconds:7",
  "window": {
    "main": {
      "width": 1400,
      "height": 900,
      "x": 10,
      "y": 12,
      "maximized": false,
      "fullscreen": false
    }
  }
}"#;
        fs::write(&path, payload).expect("v1 payload should be writable");

        let loaded = load_config_from_path(&path).expect("v1 config should migrate");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V3);
        assert_eq!(loaded.window.main.width, 1400.0);
        assert_eq!(loaded.window.main.height, 900.0);
        assert_eq!(loaded.quick_open, default_quick_open_config());
        assert_eq!(loaded.host_mode, default_host_mode());

        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn v2_schema_migrates_forward_to_v3_with_default_host_mode() {
        let path = unique_test_path("v2-migrate");
        let dir = path.parent().expect("config file should have parent dir");
        fs::create_dir_all(dir).expect("test dir should be creatable");
        let payload = r#"{
  "schemaVersion": 2,
  "updatedAt": "unix-seconds:9",
  "window": {
    "main": {
      "width": 1366,
      "height": 768,
      "x": null,
      "y": null,
      "maximized": false,
      "fullscreen": false
    }
  },
  "quickOpen": {
    "presetId": "default",
    "accelerator": "CommandOrControl+Shift+Space",
    "enabled": true
  }
}"#;
        fs::write(&path, payload).expect("v2 payload should be writable");

        let loaded = load_config_from_path(&path).expect("v2 config should migrate");
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V3);
        assert_eq!(loaded.window.main.width, 1366.0);
        assert_eq!(loaded.window.main.height, 768.0);
        assert_eq!(loaded.quick_open.preset_id, "default");
        assert_eq!(loaded.host_mode, default_host_mode());

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
        assert_eq!(loaded.schema_version, SCHEMA_VERSION_V3);
        assert_eq!(loaded.window.main, default_main_window_state());
        assert_eq!(loaded.quick_open, default_quick_open_config());
        assert_eq!(loaded.host_mode, default_host_mode());

        let _ = fs::remove_dir_all(dir);
    }
}
