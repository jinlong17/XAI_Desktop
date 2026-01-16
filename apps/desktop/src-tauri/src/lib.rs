use tauri::Manager;
use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Grid window position and size data
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct GridWindowRect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

/// State to track all grid windows
pub struct GridWindowsState {
    windows: Mutex<HashMap<String, GridWindowRect>>,
}

impl Default for GridWindowsState {
    fn default() -> Self {
        Self {
            windows: Mutex::new(HashMap::new()),
        }
    }
}

/// Create a new grid window at the specified position
#[tauri::command]
async fn create_grid_window(
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

    // Create the window with grid-specific settings
    let window = WebviewWindowBuilder::new(
        &app,
        &label,
        WebviewUrl::App(url.into()),
    )
    .title("")
    .inner_size(rect.width, rect.height)
    .position(rect.x, rect.y)
    .transparent(true)
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
            configure_grid_window_macos(&window_clone);
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
async fn update_grid_window(
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
async fn close_grid_window(
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

#[cfg(target_os = "macos")]
extern "C" {
    fn CGWindowLevelForKey(key: i32) -> i32;
}

#[cfg(target_os = "macos")]
#[repr(i32)]
enum CGWindowLevelKey {
    DesktopIconWindow = 18,
}

#[cfg(target_os = "macos")]
fn desktop_icon_level_plus_one() -> i64 {
    let icon_level = unsafe { CGWindowLevelForKey(CGWindowLevelKey::DesktopIconWindow as i32) };
    (icon_level + 1) as i64
}

/// Configure macOS-specific settings for a grid window
#[cfg(target_os = "macos")]
fn configure_grid_window_macos(window: &tauri::WebviewWindow) {
    use cocoa::appkit::{NSColor, NSWindow, NSWindowCollectionBehavior};
    use cocoa::base::{id, nil, NO};

    unsafe {
        let ns_window = match window.ns_window() {
            Ok(handle) => handle as id,
            Err(_) => {
                println!("⚠️ configure_grid_window_macos: ns_window unavailable");
                return;
            }
        };

        let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle;
        ns_window.setCollectionBehavior_(behavior);

        let level = desktop_icon_level_plus_one() + 2;
        ns_window.setLevel_(level);
        ns_window.setIgnoresMouseEvents_(NO);
        println!("🎚️ Grid window level set to {}", level);

        // Ensure transparency
        ns_window.setBackgroundColor_(NSColor::clearColor(nil));
        ns_window.setOpaque_(NO);
    }
}

#[cfg(target_os = "macos")]
fn configure_control_window_macos(window: &tauri::WebviewWindow) {
    use cocoa::appkit::{NSColor, NSWindow, NSWindowCollectionBehavior};
    use cocoa::base::{id, nil, NO};

    unsafe {
        let ns_window = match window.ns_window() {
            Ok(handle) => handle as id,
            Err(_) => {
                println!("⚠️ configure_control_window_macos: ns_window unavailable");
                return;
            }
        };

        let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle;
        ns_window.setCollectionBehavior_(behavior);

        let level = desktop_icon_level_plus_one();
        ns_window.setLevel_(level);
        ns_window.setIgnoresMouseEvents_(NO);

        ns_window.setBackgroundColor_(NSColor::clearColor(nil));
        ns_window.setOpaque_(NO);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(GridWindowsState::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            create_grid_window,
            update_grid_window,
            close_grid_window
        ])
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .expect("main window not found");

            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow, NSWindowCollectionBehavior};
                use cocoa::base::{id, nil, NO, YES};

                // MULTI-WINDOW ARCHITECTURE:
                // Main window is now a background/control window that's always click-through
                // Grid windows are created dynamically and placed just above desktop icons
                unsafe {
                    let ns_window = window.ns_window().expect("ns_window") as id;

                    let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                        | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
                        | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle;
                    ns_window.setCollectionBehavior_(behavior);

                    let level = desktop_icon_level_plus_one();
                    ns_window.setLevel_(level);
                    ns_window.setIgnoresMouseEvents_(YES);

                    // Ensure transparency
                    ns_window.setBackgroundColor_(NSColor::clearColor(nil));
                    ns_window.setOpaque_(NO);

                    println!("🎯 MULTI-WINDOW MODE: Main window configured");
                    println!("   - Window level: {} (desktop icon level + 1)", level);
                    println!("   - Behavior: CanJoinAllSpaces, Stationary, IgnoresCycle");
                    println!("   - Mouse events: ignored");
                    println!("   - Grids will be created as separate windows");
                }
            }

            // Window chrome and transparency configuration
            let _ = window.set_decorations(false);
            let _ = window.set_shadow(false);
            let _ = window.set_resizable(false);
            let _ = window.set_always_on_top(false);

            if let Ok(Some(monitor)) = window.current_monitor() {
                let size = monitor.size();
                window
                    .set_size(tauri::Size::Physical(*size))
                    .expect("failed to set size");
                window
                    .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x: 0, y: 0 }))
                    .expect("failed to set position");
            }

            // Control window: interactive UI for creating grids
            if app.get_webview_window("control").is_none() {
                let control_window = WebviewWindowBuilder::new(
                    app,
                    "control",
                    WebviewUrl::App("/#/control".into()),
                )
                .title("")
                .inner_size(360.0, 360.0)
                .position(24.0, 80.0)
                .transparent(true)
                .decorations(false)
                .shadow(false)
                .skip_taskbar(true)
                .resizable(false)
                .visible(true)
                .always_on_top(false)
                .build();

                if let Ok(window) = control_window {
                    #[cfg(target_os = "macos")]
                    {
                        let window_clone = window.clone();
                        let _ = window.run_on_main_thread(move || {
                            configure_control_window_macos(&window_clone);
                        });
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
