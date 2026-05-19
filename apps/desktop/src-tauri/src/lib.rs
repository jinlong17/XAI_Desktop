mod commands;
mod crypto;
mod error;
mod platform;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

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
    pub windows: Mutex<HashMap<String, GridWindowRect>>,
}

impl Default for GridWindowsState {
    fn default() -> Self {
        Self {
            windows: Mutex::new(HashMap::new()),
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(GridWindowsState::default())
        .invoke_handler(tauri::generate_handler![
            commands::window::create_grid_window,
            commands::window::update_grid_window,
            commands::window::close_grid_window,
        ])
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .expect("main window not found");

            #[cfg(target_os = "macos")]
            platform::macos::configure_main_window(&window);

            // Window chrome configuration
            let _ = window.set_decorations(false);
            let _ = window.set_shadow(false);
            let _ = window.set_resizable(false);
            let _ = window.set_always_on_top(false);

            // Size to full monitor
            if let Ok(Some(monitor)) = window.current_monitor() {
                let size = monitor.size();
                window
                    .set_size(tauri::Size::Physical(*size))
                    .expect("failed to set size");
                window
                    .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x: 0, y: 0 }))
                    .expect("failed to set position");
            }

            // Create control window (AI Cube)
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
                            platform::macos::configure_control_window(&window_clone);
                        });
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
