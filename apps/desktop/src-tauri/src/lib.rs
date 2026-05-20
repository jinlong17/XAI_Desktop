mod commands;
mod crypto;
mod error;
mod platform;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

/// Grid window position and size data.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct GridWindowRect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

/// Stable Grid window lifecycle snapshot returned by window commands.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct GridWindowSnapshot {
    #[serde(rename = "gridId")]
    pub grid_id: String,
    pub label: String,
    pub rect: GridWindowRect,
    pub visible: bool,
}

/// Structured command error shape for UI-safe handling.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct CommandError {
    pub code: String,
    pub message: String,
    pub recoverable: bool,
    pub details: Option<serde_json::Value>,
}

/// State to track all grid windows.
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
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(commands::crypto::CryptoCommandState::default())
        .manage(commands::menubar::SyncMenuBarState::default())
        .manage(commands::bookmarks::BookmarkRegistry::default())
        .manage(GridWindowsState::default());

    #[cfg(feature = "crypto")]
    let builder = builder.manage(commands::database::DatabaseState::default());

    builder
        .invoke_handler(tauri::generate_handler![
            commands::window::create_grid_window,
            commands::window::update_grid_window,
            commands::window::close_grid_window,
            commands::window::list_grid_windows,
            commands::window::focus_grid_window,
            commands::menubar::sync_set_menubar_status,
            commands::crypto::crypto_encrypt_for,
            commands::crypto::crypto_unwrap_dek_for_device,
            commands::crypto::crypto_wrap_dek_for_devices,
            commands::crypto::crypto_recovery_sign,
            commands::keychain::secret_set,
            commands::keychain::secret_get,
            commands::keychain::secret_del,
            commands::finder::reveal_in_finder,
            commands::finder::open_path,
            commands::bookmarks::register_path_bookmark,
            commands::bookmarks::clear_path_bookmark,
            #[cfg(feature = "crypto")]
            commands::database::db_init,
            #[cfg(feature = "crypto")]
            commands::database::db_put,
            #[cfg(feature = "crypto")]
            commands::database::db_get,
            #[cfg(feature = "crypto")]
            commands::database::db_list,
            #[cfg(feature = "crypto")]
            commands::database::db_delete,
            #[cfg(feature = "crypto")]
            commands::database::db_put_batch,
        ])
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .expect("main window not found");

            commands::menubar::install_sync_menubar(app.handle())?;

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

            // Create control window (AI Cube).
            // The initial inner_size matches CONTROL_CLOSED_SIZE in ControlWindow.tsx
            // so the transparent hit-test surface doesn't blanket the area where
            // Grid windows spawn. React will expand the window when the settings
            // panel opens and shrink it back when it closes.
            if app.get_webview_window("control").is_none() {
                // `transparent(true)` is private-API gated on macOS. The
                // `mas-sandbox` feature keeps the control window buildable
                // without that constructor for non-private fallback dry-runs.
                let control_builder =
                    WebviewWindowBuilder::new(app, "control", WebviewUrl::App("/#/control".into()))
                        .title("")
                        .inner_size(96.0, 96.0)
                        .position(24.0, 80.0);

                #[cfg(not(feature = "mas-sandbox"))]
                let control_builder = control_builder.transparent(true);

                let control_window = control_builder
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
