mod commands;
mod crypto;
mod error;
mod platform;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::Manager;

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

/// Persisted frame snapshot for the Console window.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct ConsoleWindowFrame {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    #[serde(rename = "isFullscreen")]
    pub is_fullscreen: bool,
    #[serde(rename = "navStateVersion")]
    pub nav_state_version: u32,
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

pub struct ConsoleWindowFrameState {
    pub frame: Mutex<ConsoleWindowFrame>,
}

impl Default for ConsoleWindowFrameState {
    fn default() -> Self {
        Self {
            frame: Mutex::new(ConsoleWindowFrame {
                x: 180.0,
                y: 120.0,
                width: 1240.0,
                height: 820.0,
                is_fullscreen: false,
                nav_state_version: 1,
            }),
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
        .manage(GridWindowsState::default())
        .manage(ConsoleWindowFrameState::default());

    #[cfg(feature = "crypto")]
    let builder = builder.manage(commands::database::DatabaseState::default());

    builder
        .invoke_handler(tauri::generate_handler![
            commands::window::create_grid_window,
            commands::window::update_grid_window,
            commands::window::close_grid_window,
            commands::window::list_grid_windows,
            commands::window::focus_grid_window,
            commands::window::open_console_window,
            commands::window::close_console_window,
            commands::window::focus_console_window,
            commands::window::get_console_window_frame,
            commands::window::set_console_window_frame,
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
            commands::thumbnail::generate_file_thumbnail,
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

            // Force normal-window runtime behavior even if legacy overlay
            // config remains in tauri.conf during the migration phases.
            let _ = window.set_decorations(true);
            let _ = window.set_shadow(true);
            let _ = window.set_resizable(true);
            let _ = window.set_always_on_top(false);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
