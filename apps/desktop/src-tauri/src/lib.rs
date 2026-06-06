mod app_config;
mod app_menu;
mod commands;
mod crypto;
mod error;
mod legacy_overlay;
mod platform;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::webview::PageLoadEvent;
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

/// Persisted frame snapshot for the Plugin Center window.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct PluginCenterWindowFrame {
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

pub struct PluginCenterWindowFrameState {
    pub frame: Mutex<PluginCenterWindowFrame>,
}

impl Default for PluginCenterWindowFrameState {
    fn default() -> Self {
        Self {
            frame: Mutex::new(PluginCenterWindowFrame {
                x: 220.0,
                y: 140.0,
                width: 860.0,
                height: 640.0,
                is_fullscreen: false,
                nav_state_version: 1,
            }),
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    const DESKTOP_NOTIFICATION_ADAPTER_SCRIPT: &str =
        include_str!("desktop_notification_adapter.js");
    const DESKTOP_STATUSBAR_ADAPTER_SCRIPT: &str = include_str!("desktop_statusbar_adapter.js");
    const DESKTOP_GLOBAL_HOTKEY_ADAPTER_SCRIPT: &str =
        include_str!("desktop_global_hotkey_adapter.js");
    const DESKTOP_UPDATER_ADAPTER_SCRIPT: &str = include_str!("desktop_updater_adapter.js");
    let desktop_adapter_script = [
        DESKTOP_NOTIFICATION_ADAPTER_SCRIPT,
        DESKTOP_STATUSBAR_ADAPTER_SCRIPT,
        DESKTOP_GLOBAL_HOTKEY_ADAPTER_SCRIPT,
        DESKTOP_UPDATER_ADAPTER_SCRIPT,
        "globalThis.dispatchEvent(new Event('xai:desktop-host-adapters-ready'));",
    ]
    .join("\n");
    let page_load_adapter_script = desktop_adapter_script.clone();

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(commands::global_hotkey::handle_global_shortcut_event)
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri::plugin::Builder::<tauri::Wry, ()>::new("xai-desktop-adapters")
                .js_init_script(desktop_adapter_script)
                .build(),
        )
        .append_invoke_initialization_script(&page_load_adapter_script)
        .manage(commands::crypto::CryptoCommandState::default())
        .manage(commands::menubar::SyncMenuBarState::default())
        .manage(commands::statusbar::DesktopStatusbarState::default())
        .manage(commands::global_hotkey::DesktopQuickOpenState::default())
        .manage(commands::updater::DesktopUpdaterState::default())
        .manage(commands::bookmarks::BookmarkRegistry::default())
        .manage(GridWindowsState::default())
        .manage(ConsoleWindowFrameState::default())
        .manage(PluginCenterWindowFrameState::default())
        .on_page_load(move |webview, payload| {
            if webview.label() == "main" && payload.event() == PageLoadEvent::Finished {
                let _ = webview.eval(&page_load_adapter_script);
            }
        });

    #[cfg(feature = "crypto")]
    let builder = builder.manage(commands::database::DatabaseState::default());

    builder
        .invoke_handler(tauri::generate_handler![
            commands::menubar::sync_set_menubar_status,
            commands::statusbar::statusbar_set_snapshot,
            commands::global_hotkey::desktop_global_hotkey_get_snapshot,
            commands::global_hotkey::desktop_global_hotkey_set_preference,
            commands::host_mode::desktop_host_mode_get,
            commands::host_mode::desktop_host_mode_set,
            commands::updater::desktop_updater_get_snapshot,
            commands::updater::desktop_updater_check,
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
            commands::window::open_plugin_center_window,
            commands::window::close_plugin_center_window,
            commands::window::focus_plugin_center_window,
            commands::window::get_plugin_center_window_frame,
            commands::window::set_plugin_center_window_frame,
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
            #[cfg(feature = "crypto")]
            commands::database::db_backup_write_bundle,
            #[cfg(feature = "crypto")]
            commands::database::db_backup_read_bundle,
            #[cfg(feature = "crypto")]
            commands::database::db_backup_verify_bundle,
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();
            app_menu::install_native_app_menu(&app_handle)?;
            app.on_menu_event(|app_handle, event| {
                if let Err(error) = commands::statusbar::handle_statusbar_menu_event(
                    app_handle,
                    event.id().as_ref(),
                ) {
                    eprintln!("⚠️ Status bar menu event failed: {error}");
                    return;
                }
                app_menu::handle_menu_event(app_handle, event);
            });

            let window = app
                .get_webview_window("main")
                .expect("main window not found");

            let loaded_config = app_config::load_config_or_default(&app_handle)?;
            let host_mode = loaded_config.host_mode;

            match host_mode {
                app_config::DesktopHostMode::Normal => {
                    #[cfg(target_os = "macos")]
                    platform::macos::configure_main_window(&window);

                    // Keep normal-window runtime as default.
                    let _ = window.set_decorations(true);
                    let _ = window.set_shadow(true);
                    let _ = window.set_resizable(true);
                    let _ = window.set_always_on_top(false);
                }
                app_config::DesktopHostMode::OverlayV2 => {
                    #[cfg(target_os = "macos")]
                    platform::macos::legacy_overlay::configure_main_overlay_window(&window);

                    // Overlay mode is explicit and opt-in.
                    let _ = window.set_decorations(false);
                    let _ = window.set_shadow(false);
                    let _ = window.set_resizable(true);
                    let _ = window.set_always_on_top(false);
                }
            }

            commands::statusbar::install_statusbar(&app_handle)?;

            let restored_state =
                app_config::apply_main_window_state(&window, &loaded_config.window.main)?;

            let quick_open_state = app.state::<commands::global_hotkey::DesktopQuickOpenState>();
            commands::global_hotkey::initialize_desktop_global_hotkey(
                &app_handle,
                quick_open_state.inner(),
            )?;

            let mut normalized_config = loaded_config;
            normalized_config.window.main = restored_state;
            app_config::save_config(&app_handle, normalized_config)?;
            app_config::attach_main_window_persistence(&window, app_handle.clone());

            if host_mode == app_config::DesktopHostMode::OverlayV2 {
                legacy_overlay::bootstrap_control_window(&app_handle);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
