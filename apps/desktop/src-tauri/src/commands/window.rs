use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use crate::platform;

use super::super::GridWindowRect;
use super::super::GridWindowsState;

/// Create a new grid window at the specified position
#[tauri::command]
pub async fn create_grid_window(
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
    rect: GridWindowRect,
) -> Result<(), String> {
    println!("🪟 Creating grid window: {} at ({}, {}) size {}x{}",
             gridId, rect.x, rect.y, rect.width, rect.height);

    let label = format!("grid_{}", gridId);
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
        .map_err(|e| format!("Failed to create window: {}", e))?;

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
        let mut windows = state.windows.lock().map_err(|e| e.to_string())?;
        windows.insert(gridId, rect.clone());
    }

    println!("✅ Grid window created successfully: {} at ({}, {}) size {}x{}",
             label, rect.x, rect.y, rect.width, rect.height);
    Ok(())
}

/// Update an existing grid window's position and size
#[tauri::command]
pub async fn update_grid_window(
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
    rect: GridWindowRect,
) -> Result<(), String> {
    let label = format!("grid_{}", gridId);

    if let Some(window) = app.get_webview_window(&label) {
        window
            .set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: rect.x,
                y: rect.y,
            }))
            .map_err(|e| format!("Failed to set position: {}", e))?;

        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: rect.width,
                height: rect.height,
            }))
            .map_err(|e| format!("Failed to set size: {}", e))?;

        // Update stored state
        if let Some(state) = app.try_state::<GridWindowsState>() {
            let mut windows = state.windows.lock().map_err(|e| e.to_string())?;
            windows.insert(gridId, rect.clone());
        }

        println!("📐 Updated grid window: {} to ({}, {}) size {}x{}",
                 label, rect.x, rect.y, rect.width, rect.height);
        Ok(())
    } else {
        Err(format!("Window {} not found", label))
    }
}

/// Close and destroy a grid window
#[tauri::command]
pub async fn close_grid_window(
    app: AppHandle,
    #[allow(non_snake_case)]
    gridId: String,
) -> Result<(), String> {
    let label = format!("grid_{}", gridId);

    if let Some(window) = app.get_webview_window(&label) {
        window.close().map_err(|e| format!("Failed to close window: {}", e))?;

        // Remove from stored state
        if let Some(state) = app.try_state::<GridWindowsState>() {
            let mut windows = state.windows.lock().map_err(|e| e.to_string())?;
            windows.remove(&gridId);
        }

        println!("🗑️ Closed grid window: {}", label);
        Ok(())
    } else {
        // Window doesn't exist, that's fine
        Ok(())
    }
}
