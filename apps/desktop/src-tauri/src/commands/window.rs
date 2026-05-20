use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use crate::platform;

use super::super::CommandError;
use super::super::GridWindowRect;
use super::super::GridWindowSnapshot;
use super::super::GridWindowsState;

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

/// Create a new grid window at the specified position
#[tauri::command]
pub async fn create_grid_window(
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
    rect: GridWindowRect,
) -> Result<GridWindowSnapshot, CommandError> {
    validate_grid_id(&gridId)?;

    println!("🪟 Creating grid window: {} at ({}, {}) size {}x{}",
             gridId, rect.x, rect.y, rect.width, rect.height);

    let label = grid_label(&gridId);
    let url = format!("/#/grid?id={}", gridId);

    // Check if window already exists
    if app.get_webview_window(&label).is_some() {
        println!("⚠️ Window {} already exists, updating instead", label);
        return update_grid_window(app, gridId, rect).await;
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
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
    rect: GridWindowRect,
) -> Result<GridWindowSnapshot, CommandError> {
    validate_grid_id(&gridId)?;

    let label = grid_label(&gridId);

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
            windows.insert(gridId.clone(), rect.clone());
        }

        println!("📐 Updated grid window: {} to ({}, {}) size {}x{}",
                 label, rect.x, rect.y, rect.width, rect.height);
        Ok(window_snapshot(&app, &gridId, rect))
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
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
) -> Result<(), CommandError> {
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
    app: AppHandle,
) -> Result<Vec<GridWindowSnapshot>, CommandError> {
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
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
) -> Result<GridWindowSnapshot, CommandError> {
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
