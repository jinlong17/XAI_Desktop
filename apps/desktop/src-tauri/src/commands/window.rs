use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use crate::platform;

use super::super::CommandError;
use super::super::ConsoleWindowFrame;
use super::super::ConsoleWindowFrameState;
use super::super::GridWindowRect;
use super::super::GridWindowSnapshot;
use super::super::GridWindowsState;

/// Windows allowed to invoke window lifecycle commands
/// (`create_grid_window` / `update_grid_window` / `close_grid_window` /
/// `list_grid_windows` / `focus_grid_window`).
///
/// Mirrors the `default.json` capability scope but is enforced as a
/// defence-in-depth runtime check: even if a future capability widening
/// granted `grid_*` / `widget_*` / `pet` access to the file scope, the
/// runtime layer still rejects them with `WINDOW_CAPABILITY_DENIED`.
///
/// `grid_*` windows are intentionally NOT in this list — grid windows
/// can request lifecycle changes for themselves via cross-window events
/// routed through `control`, but they cannot directly spawn / close
/// other grid windows.
pub(crate) const WINDOW_ALLOWED_WINDOWS: &[&str] = &["main", "control"];
pub(crate) const CONSOLE_WINDOW_ALLOWED_WINDOWS: &[&str] = &["main", "control", "console"];
const CONSOLE_WINDOW_LABEL: &str = "console";
const CONSOLE_WINDOW_URL: &str = "/#/console";

fn default_console_frame() -> ConsoleWindowFrame {
    ConsoleWindowFrame {
        x: 180.0,
        y: 120.0,
        width: 1240.0,
        height: 820.0,
        is_fullscreen: false,
        nav_state_version: 1,
    }
}

fn is_window_command_allowed(label: &str) -> bool {
    WINDOW_ALLOWED_WINDOWS.contains(&label)
}

fn ensure_window_command_allowed(label: &str) -> Result<(), CommandError> {
    if is_window_command_allowed(label) {
        Ok(())
    } else {
        Err(command_error(
            "WINDOW_CAPABILITY_DENIED",
            format!(
                "window `{label}` is not allowed to invoke window lifecycle commands"
            ),
            false,
        ))
    }
}

fn ensure_console_window_command_allowed(label: &str) -> Result<(), CommandError> {
    if CONSOLE_WINDOW_ALLOWED_WINDOWS.contains(&label) {
        Ok(())
    } else {
        Err(command_error(
            "WINDOW_CAPABILITY_DENIED",
            format!(
                "window `{label}` is not allowed to invoke console window lifecycle commands"
            ),
            false,
        ))
    }
}

fn grid_label(grid_id: &str) -> String {
    format!("grid_{}", grid_id)
}

fn is_valid_grid_id(grid_id: &str) -> bool {
    !grid_id.is_empty()
        && grid_id.len() <= 128
        && grid_id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

fn command_error(
    code: impl Into<String>,
    message: impl Into<String>,
    recoverable: bool,
) -> CommandError {
    CommandError {
        code: code.into(),
        message: message.into(),
        recoverable,
        details: None,
    }
}

fn validate_grid_id(grid_id: &str) -> Result<(), CommandError> {
    if is_valid_grid_id(grid_id) {
        Ok(())
    } else {
        Err(command_error(
            "INVALID_GRID_ID",
            "gridId must be non-empty and contain only ASCII letters, numbers, '-' or '_'",
            true,
        ))
    }
}

fn window_snapshot(
    app: &AppHandle,
    grid_id: &str,
    rect: GridWindowRect,
) -> GridWindowSnapshot {
    let label = grid_label(grid_id);
    let visible = app
        .get_webview_window(&label)
        .and_then(|window| window.is_visible().ok())
        .unwrap_or(false);

    GridWindowSnapshot {
        grid_id: grid_id.to_string(),
        label,
        rect,
        visible,
    }
}

fn state_error(error: impl ToString) -> CommandError {
    command_error("WINDOW_STATE_LOCKED", error.to_string(), true)
}

fn native_error(message: impl Into<String>) -> CommandError {
    command_error("WINDOW_NATIVE_ERROR", message.into(), true)
}

fn read_console_frame(app: &AppHandle) -> Result<ConsoleWindowFrame, CommandError> {
    if let Some(state) = app.try_state::<ConsoleWindowFrameState>() {
        let frame = state.frame.lock().map_err(state_error)?;
        Ok(frame.clone())
    } else {
        Ok(default_console_frame())
    }
}

fn write_console_frame(app: &AppHandle, frame: ConsoleWindowFrame) -> Result<(), CommandError> {
    if let Some(state) = app.try_state::<ConsoleWindowFrameState>() {
        let mut stored = state.frame.lock().map_err(state_error)?;
        *stored = frame;
    }
    Ok(())
}

fn validate_console_frame(frame: &ConsoleWindowFrame) -> Result<(), CommandError> {
    if frame.width < 640.0 || frame.height < 480.0 {
        return Err(command_error(
            "INVALID_CONSOLE_FRAME",
            "console frame must be at least 640x480",
            true,
        ));
    }
    if frame.width > 8192.0 || frame.height > 8192.0 {
        return Err(command_error(
            "INVALID_CONSOLE_FRAME",
            "console frame dimensions exceed allowed maximum",
            true,
        ));
    }
    Ok(())
}

fn capture_console_window_frame(
    app: &AppHandle,
    default_frame: ConsoleWindowFrame,
) -> Result<ConsoleWindowFrame, CommandError> {
    let Some(window) = app.get_webview_window(CONSOLE_WINDOW_LABEL) else {
        return Ok(default_frame);
    };

    let position = window
        .outer_position()
        .map_err(|e| native_error(format!("Failed to read console position: {}", e)))?;
    let size = window
        .outer_size()
        .map_err(|e| native_error(format!("Failed to read console size: {}", e)))?;
    let is_fullscreen = window
        .is_fullscreen()
        .map_err(|e| native_error(format!("Failed to read console fullscreen state: {}", e)))?;

    Ok(ConsoleWindowFrame {
        x: position.x as f64,
        y: position.y as f64,
        width: size.width as f64,
        height: size.height as f64,
        is_fullscreen,
        nav_state_version: default_frame.nav_state_version,
    })
}

/// Create a new grid window at the specified position
#[tauri::command]
pub async fn create_grid_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
    rect: GridWindowRect,
) -> Result<GridWindowSnapshot, CommandError> {
    ensure_window_command_allowed(window.label())?;
    validate_grid_id(&gridId)?;

    println!("🪟 Creating grid window: {} at ({}, {}) size {}x{}",
             gridId, rect.x, rect.y, rect.width, rect.height);

    let label = grid_label(&gridId);
    let url = format!("/#/grid?id={}", gridId);

    // Check if window already exists
    if app.get_webview_window(&label).is_some() {
        println!("⚠️ Window {} already exists, updating instead", label);
        // Internal call after the caller's window-origin check already
        // passed — bypass the public allow-list by going through
        // `update_grid_window_internal`.
        return update_grid_window_internal(app, gridId, rect).await;
    }

    // Create the window with grid-specific settings.
    // `transparent(true)` is private-API gated on macOS, so the MAS dry-run
    // feature intentionally omits it and relies on the native fallback styling.
    let builder = WebviewWindowBuilder::new(&app, &label, WebviewUrl::App(url.into()))
        .title("")
        .inner_size(rect.width, rect.height)
        .position(rect.x, rect.y);

    #[cfg(not(feature = "mas-sandbox"))]
    let builder = builder.transparent(true);

    let window = builder
        .decorations(false)
        .shadow(false)
        .skip_taskbar(true)
        .resizable(false)
        .visible(true)
        .always_on_top(false)
        .build()
        .map_err(|e| native_error(format!("Failed to create window: {}", e)))?;

    // Configure macOS-specific window settings
    #[cfg(target_os = "macos")]
    {
        let window_clone = window.clone();
        let _ = window.run_on_main_thread(move || {
            platform::macos::configure_grid_window(&window_clone);
        });
    }

    // Store window state
    if let Some(state) = app.try_state::<GridWindowsState>() {
        let mut windows = state.windows.lock().map_err(state_error)?;
        windows.insert(gridId.clone(), rect.clone());
    }

    println!("✅ Grid window created successfully: {} at ({}, {}) size {}x{}",
             label, rect.x, rect.y, rect.width, rect.height);
    Ok(window_snapshot(&app, &gridId, rect))
}

/// Update an existing grid window's position and size
#[tauri::command]
pub async fn update_grid_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
    rect: GridWindowRect,
) -> Result<GridWindowSnapshot, CommandError> {
    ensure_window_command_allowed(window.label())?;
    update_grid_window_internal(app, gridId, rect).await
}

/// Internal update path used by both `update_grid_window` (with origin
/// check) and `create_grid_window` (which has already enforced its own
/// origin check before falling back to update).
async fn update_grid_window_internal(
    app: AppHandle,
    grid_id: String,
    rect: GridWindowRect,
) -> Result<GridWindowSnapshot, CommandError> {
    validate_grid_id(&grid_id)?;

    let label = grid_label(&grid_id);

    if let Some(window) = app.get_webview_window(&label) {
        window
            .set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: rect.x,
                y: rect.y,
            }))
            .map_err(|e| native_error(format!("Failed to set position: {}", e)))?;

        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: rect.width,
                height: rect.height,
            }))
            .map_err(|e| native_error(format!("Failed to set size: {}", e)))?;

        // Update stored state
        if let Some(state) = app.try_state::<GridWindowsState>() {
            let mut windows = state.windows.lock().map_err(state_error)?;
            windows.insert(grid_id.clone(), rect.clone());
        }

        println!("📐 Updated grid window: {} to ({}, {}) size {}x{}",
                 label, rect.x, rect.y, rect.width, rect.height);
        Ok(window_snapshot(&app, &grid_id, rect))
    } else {
        Err(command_error(
            "WINDOW_NOT_FOUND",
            format!("Window {} not found", label),
            true,
        ))
    }
}

/// Close and destroy a grid window
#[tauri::command]
pub async fn close_grid_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
) -> Result<(), CommandError> {
    ensure_window_command_allowed(window.label())?;
    validate_grid_id(&gridId)?;

    let label = grid_label(&gridId);

    if let Some(window) = app.get_webview_window(&label) {
        window
            .close()
            .map_err(|e| native_error(format!("Failed to close window: {}", e)))?;

        // Remove from stored state
        if let Some(state) = app.try_state::<GridWindowsState>() {
            let mut windows = state.windows.lock().map_err(state_error)?;
            windows.remove(&gridId);
        }

        println!("🗑️ Closed grid window: {}", label);
        Ok(())
    } else {
        // Window doesn't exist, that's fine
        Ok(())
    }
}

/// List known grid windows and their latest rect snapshots.
#[tauri::command]
pub async fn list_grid_windows(
    window: tauri::WebviewWindow,
    app: AppHandle,
) -> Result<Vec<GridWindowSnapshot>, CommandError> {
    ensure_window_command_allowed(window.label())?;
    let Some(state) = app.try_state::<GridWindowsState>() else {
        return Ok(Vec::new());
    };

    let windows = state.windows.lock().map_err(state_error)?;
    let mut snapshots = windows
        .iter()
        .map(|(grid_id, rect)| window_snapshot(&app, grid_id, rect.clone()))
        .collect::<Vec<_>>();
    snapshots.sort_by(|a, b| a.grid_id.cmp(&b.grid_id));
    Ok(snapshots)
}

/// Focus an existing grid window.
#[tauri::command]
pub async fn focus_grid_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
) -> Result<GridWindowSnapshot, CommandError> {
    ensure_window_command_allowed(window.label())?;
    validate_grid_id(&gridId)?;

    let label = grid_label(&gridId);
    let Some(window) = app.get_webview_window(&label) else {
        return Err(command_error(
            "WINDOW_NOT_FOUND",
            format!("Window {} not found", label),
            true,
        ));
    };

    window
        .set_focus()
        .map_err(|e| native_error(format!("Failed to focus window: {}", e)))?;

    let rect = if let Some(state) = app.try_state::<GridWindowsState>() {
        let windows = state.windows.lock().map_err(state_error)?;
        windows.get(&gridId).cloned().unwrap_or(GridWindowRect {
            x: 0.0,
            y: 0.0,
            width: 0.0,
            height: 0.0,
        })
    } else {
        GridWindowRect {
            x: 0.0,
            y: 0.0,
            width: 0.0,
            height: 0.0,
        }
    };

    Ok(window_snapshot(&app, &gridId, rect))
}

/// Open or focus the dedicated Console window.
#[tauri::command]
pub async fn open_console_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
) -> Result<ConsoleWindowFrame, CommandError> {
    ensure_console_window_command_allowed(window.label())?;
    let stored = read_console_frame(&app)?;
    validate_console_frame(&stored)?;

    if let Some(existing) = app.get_webview_window(CONSOLE_WINDOW_LABEL) {
        existing
            .show()
            .map_err(|e| native_error(format!("Failed to show console window: {}", e)))?;
        existing
            .set_focus()
            .map_err(|e| native_error(format!("Failed to focus console window: {}", e)))?;
        let live = capture_console_window_frame(&app, stored)?;
        write_console_frame(&app, live.clone())?;
        return Ok(live);
    }

    let builder = WebviewWindowBuilder::new(
        &app,
        CONSOLE_WINDOW_LABEL,
        WebviewUrl::App(CONSOLE_WINDOW_URL.into()),
    )
    .title("XAI Console")
    .inner_size(stored.width, stored.height)
    .position(stored.x, stored.y)
    .decorations(true)
    .resizable(true)
    .visible(true);

    let created = builder
        .build()
        .map_err(|e| native_error(format!("Failed to create console window: {}", e)))?;

    if stored.is_fullscreen {
        created
            .set_fullscreen(true)
            .map_err(|e| native_error(format!("Failed to set console fullscreen: {}", e)))?;
    }

    created
        .set_focus()
        .map_err(|e| native_error(format!("Failed to focus console window: {}", e)))?;

    let live = capture_console_window_frame(&app, stored)?;
    write_console_frame(&app, live.clone())?;
    Ok(live)
}

/// Close the dedicated Console window and persist its latest frame.
#[tauri::command]
pub async fn close_console_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
) -> Result<(), CommandError> {
    ensure_console_window_command_allowed(window.label())?;
    let stored = read_console_frame(&app)?;
    if let Some(existing) = app.get_webview_window(CONSOLE_WINDOW_LABEL) {
        let live = capture_console_window_frame(&app, stored)?;
        write_console_frame(&app, live)?;
        existing
            .close()
            .map_err(|e| native_error(format!("Failed to close console window: {}", e)))?;
    }
    Ok(())
}

/// Focus the dedicated Console window, creating it if needed.
#[tauri::command]
pub async fn focus_console_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
) -> Result<ConsoleWindowFrame, CommandError> {
    ensure_console_window_command_allowed(window.label())?;
    if app.get_webview_window(CONSOLE_WINDOW_LABEL).is_none() {
        return open_console_window(window, app).await;
    }
    let existing = app
        .get_webview_window(CONSOLE_WINDOW_LABEL)
        .ok_or_else(|| native_error("Console window not found after open check"))?;
    existing
        .set_focus()
        .map_err(|e| native_error(format!("Failed to focus console window: {}", e)))?;

    let stored = read_console_frame(&app)?;
    let live = capture_console_window_frame(&app, stored)?;
    write_console_frame(&app, live.clone())?;
    Ok(live)
}

/// Return the latest persisted Console frame snapshot.
#[tauri::command]
pub async fn get_console_window_frame(
    window: tauri::WebviewWindow,
    app: AppHandle,
) -> Result<ConsoleWindowFrame, CommandError> {
    ensure_console_window_command_allowed(window.label())?;
    let stored = read_console_frame(&app)?;
    let live = capture_console_window_frame(&app, stored)?;
    write_console_frame(&app, live.clone())?;
    Ok(live)
}

/// Persist and apply a Console frame snapshot.
#[tauri::command]
pub async fn set_console_window_frame(
    window: tauri::WebviewWindow,
    app: AppHandle,
    frame: ConsoleWindowFrame,
) -> Result<ConsoleWindowFrame, CommandError> {
    ensure_console_window_command_allowed(window.label())?;
    validate_console_frame(&frame)?;

    if let Some(existing) = app.get_webview_window(CONSOLE_WINDOW_LABEL) {
        existing
            .set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: frame.x,
                y: frame.y,
            }))
            .map_err(|e| native_error(format!("Failed to set console position: {}", e)))?;
        existing
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: frame.width,
                height: frame.height,
            }))
            .map_err(|e| native_error(format!("Failed to set console size: {}", e)))?;
        existing
            .set_fullscreen(frame.is_fullscreen)
            .map_err(|e| native_error(format!("Failed to set console fullscreen: {}", e)))?;
    }

    write_console_frame(&app, frame.clone())?;
    Ok(frame)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn window_allowlist_admits_main_control() {
        for label in WINDOW_ALLOWED_WINDOWS {
            assert!(
                is_window_command_allowed(label),
                "expected `{label}` to be admitted"
            );
            assert!(ensure_window_command_allowed(label).is_ok());
        }
    }

    #[test]
    fn window_allowlist_rejects_grid_widget() {
        // Grid windows themselves are NOT allowed to invoke window lifecycle
        // commands — they must route through `control`. Widgets / pet /
        // ai-cube / console are also rejected.
        for label in [
            "grid_xxx",
            "grid_",
            "widget_clock",
            "pet",
            "ai_cube",
            "console",
            "account",
            "unknown",
        ] {
            assert!(
                !is_window_command_allowed(label),
                "expected `{label}` to be rejected"
            );
            let err = ensure_window_command_allowed(label).unwrap_err();
            assert_eq!(err.code, "WINDOW_CAPABILITY_DENIED");
            assert!(
                err.message.contains(label),
                "error message `{}` should mention `{label}`",
                err.message
            );
        }
    }

    #[test]
    fn console_window_allowlist_admits_console_label() {
        for label in CONSOLE_WINDOW_ALLOWED_WINDOWS {
            assert!(ensure_console_window_command_allowed(label).is_ok());
        }
    }

    #[test]
    fn console_frame_validation_rejects_too_small_frames() {
        let mut frame = default_console_frame();
        frame.width = 320.0;
        let err = validate_console_frame(&frame).unwrap_err();
        assert_eq!(err.code, "INVALID_CONSOLE_FRAME");
    }

    #[test]
    fn console_frame_validation_accepts_default_frame() {
        let frame = default_console_frame();
        assert!(validate_console_frame(&frame).is_ok());
    }
}
