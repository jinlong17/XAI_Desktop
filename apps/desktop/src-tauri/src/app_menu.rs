use std::process::Command;

use tauri::menu::{Menu, MenuBuilder, MenuEvent, SubmenuBuilder};
use tauri::{AppHandle, Manager, Runtime};

use crate::app_config;
use crate::error::{AppError, AppResult};

pub const MENU_ID_HELP_REVEAL_CONFIG_FOLDER: &str = "help.reveal_config_folder";
pub const MENU_ID_HELP_RESET_MAIN_WINDOW_STATE: &str = "help.reset_main_window_state";

#[cfg(test)]
pub fn menu_top_level_labels() -> &'static [&'static str] {
    &["app", "File", "Edit", "View", "Window", "Help"]
}

#[cfg(test)]
pub fn menu_help_custom_item_ids() -> &'static [&'static str] {
    &[
        MENU_ID_HELP_REVEAL_CONFIG_FOLDER,
        MENU_ID_HELP_RESET_MAIN_WINDOW_STATE,
    ]
}

pub fn install_native_app_menu<R: Runtime>(app: &AppHandle<R>) -> AppResult<()> {
    let menu = build_native_app_menu(app)
        .map_err(|error| AppError::Internal(format!("failed to build native app menu: {error}")))?;
    app.set_menu(menu)
        .map_err(|error| AppError::Internal(format!("failed to install native app menu: {error}")))?;
    Ok(())
}

fn build_native_app_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let app_submenu = SubmenuBuilder::with_id(app, "app", app.package_info().name.clone())
        .about(None)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;

    let file_submenu = SubmenuBuilder::new(app, "File")
        .close_window()
        .build()?;

    let edit_submenu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let view_submenu = SubmenuBuilder::new(app, "View")
        .fullscreen()
        .build()?;

    let window_submenu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .maximize()
        .separator()
        .bring_all_to_front()
        .build()?;

    let help_submenu = SubmenuBuilder::new(app, "Help")
        .text(MENU_ID_HELP_REVEAL_CONFIG_FOLDER, "Reveal Config Folder")
        .text(MENU_ID_HELP_RESET_MAIN_WINDOW_STATE, "Reset Main Window State")
        .build()?;

    MenuBuilder::new(app)
        .item(&app_submenu)
        .item(&file_submenu)
        .item(&edit_submenu)
        .item(&view_submenu)
        .item(&window_submenu)
        .item(&help_submenu)
        .build()
}

pub fn handle_menu_event<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    let result = match event.id() {
        id if id == MENU_ID_HELP_REVEAL_CONFIG_FOLDER => reveal_config_folder(app),
        id if id == MENU_ID_HELP_RESET_MAIN_WINDOW_STATE => reset_main_window_state(app),
        _ => Ok(()),
    };

    if let Err(error) = result {
        eprintln!("⚠️ Native menu event failed: {error}");
    }
}

fn reveal_config_folder<R: Runtime>(app: &AppHandle<R>) -> AppResult<()> {
    let config_dir = app_config::ensure_config_dir(app)?;
    #[cfg(target_os = "macos")]
    {
        let status = Command::new("open")
            .arg(&config_dir)
            .status()
            .map_err(|error| AppError::Internal(format!("failed to open config folder: {error}")))?;
        if !status.success() {
            return Err(AppError::Internal(format!(
                "open config folder exited with status {status}"
            )));
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = config_dir;
    }
    Ok(())
}

fn reset_main_window_state<R: Runtime>(app: &AppHandle<R>) -> AppResult<()> {
    let default_state = app_config::reset_main_window_state(app)?;
    if let Some(window) = app.get_webview_window("main") {
        app_config::apply_main_window_state(&window, &default_state)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn menu_contract_has_expected_top_level_sections() {
        assert_eq!(
            menu_top_level_labels(),
            &["app", "File", "Edit", "View", "Window", "Help"]
        );
    }

    #[test]
    fn help_menu_custom_ids_are_stable() {
        assert_eq!(
            menu_help_custom_item_ids(),
            &[MENU_ID_HELP_REVEAL_CONFIG_FOLDER, MENU_ID_HELP_RESET_MAIN_WINDOW_STATE]
        );
    }
}
