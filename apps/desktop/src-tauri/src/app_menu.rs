use std::process::Command;

use tauri::menu::{Menu, MenuBuilder, MenuEvent, MenuItem, SubmenuBuilder};
use tauri::{AppHandle, Manager, Wry};

use crate::app_config;
use crate::commands::global_hotkey;
use crate::error::{AppError, AppResult};

pub const MENU_ID_HELP_REVEAL_CONFIG_FOLDER: &str = "help.reveal_config_folder";
pub const MENU_ID_HELP_RESET_MAIN_WINDOW_STATE: &str = "help.reset_main_window_state";
pub const MENU_ID_HELP_DISABLE_QUICK_OPEN_SHORTCUT: &str = "help.disable_quick_open_shortcut";
pub const MENU_ID_HELP_RESET_QUICK_OPEN_SHORTCUT: &str = "help.reset_quick_open_shortcut";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct AppMenuCustomEnabledState {
    reveal_config_folder: bool,
    reset_main_window_state: bool,
    disable_quick_open_shortcut: bool,
    reset_quick_open_shortcut: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct AppMenuRuntimeFacts {
    main_window_present: bool,
    config_dir_available: bool,
    quick_open_enabled: bool,
    quick_open_default_active: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum CustomMenuAction {
    RevealConfigFolder,
    ResetMainWindowState,
    DisableQuickOpenShortcut,
    ResetQuickOpenShortcut,
}

#[cfg(test)]
pub fn menu_top_level_labels() -> &'static [&'static str] {
    &["app", "File", "Edit", "View", "Window", "Help"]
}

#[cfg(test)]
pub fn menu_help_custom_item_ids() -> &'static [&'static str] {
    &[
        MENU_ID_HELP_REVEAL_CONFIG_FOLDER,
        MENU_ID_HELP_DISABLE_QUICK_OPEN_SHORTCUT,
        MENU_ID_HELP_RESET_QUICK_OPEN_SHORTCUT,
    ]
}

#[cfg(test)]
pub fn menu_window_custom_item_ids() -> &'static [&'static str] {
    &[MENU_ID_HELP_RESET_MAIN_WINDOW_STATE]
}

pub fn install_native_app_menu(app: &AppHandle<Wry>) -> AppResult<()> {
    let state = custom_enabled_state_for_app(app);
    let menu = build_native_app_menu(app, state)
        .map_err(|error| AppError::Internal(format!("failed to build native app menu: {error}")))?;
    app.set_menu(menu).map_err(|error| {
        AppError::Internal(format!("failed to install native app menu: {error}"))
    })?;
    Ok(())
}

fn custom_enabled_state_for_app(app: &AppHandle<Wry>) -> AppMenuCustomEnabledState {
    let (quick_open_enabled, quick_open_default_active) = global_hotkey::quick_open_menu_state_facts(app);
    custom_enabled_state_from_runtime_facts(AppMenuRuntimeFacts {
        main_window_present: app.get_webview_window("main").is_some(),
        config_dir_available: app.path().app_config_dir().is_ok(),
        quick_open_enabled,
        quick_open_default_active,
    })
}

fn custom_enabled_state_from_runtime_facts(
    facts: AppMenuRuntimeFacts,
) -> AppMenuCustomEnabledState {
    AppMenuCustomEnabledState {
        reveal_config_folder: facts.config_dir_available,
        reset_main_window_state: facts.main_window_present,
        disable_quick_open_shortcut: facts.quick_open_enabled,
        reset_quick_open_shortcut: !facts.quick_open_default_active,
    }
}

fn build_native_app_menu(
    app: &AppHandle<Wry>,
    state: AppMenuCustomEnabledState,
) -> tauri::Result<Menu<Wry>> {
    let reveal_config_folder = MenuItem::with_id(
        app,
        MENU_ID_HELP_REVEAL_CONFIG_FOLDER,
        "Reveal Config Folder",
        state.reveal_config_folder,
        None::<&str>,
    )?;
    let reset_main_window_state = MenuItem::with_id(
        app,
        MENU_ID_HELP_RESET_MAIN_WINDOW_STATE,
        "Reset Main Window State",
        state.reset_main_window_state,
        None::<&str>,
    )?;
    let disable_quick_open_shortcut = MenuItem::with_id(
        app,
        MENU_ID_HELP_DISABLE_QUICK_OPEN_SHORTCUT,
        "Disable Quick Open Shortcut",
        state.disable_quick_open_shortcut,
        None::<&str>,
    )?;
    let reset_quick_open_shortcut = MenuItem::with_id(
        app,
        MENU_ID_HELP_RESET_QUICK_OPEN_SHORTCUT,
        "Reset Quick Open Shortcut to Default",
        state.reset_quick_open_shortcut,
        None::<&str>,
    )?;

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

    let file_submenu = SubmenuBuilder::new(app, "File").close_window().build()?;

    let edit_submenu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let view_submenu = SubmenuBuilder::new(app, "View").fullscreen().build()?;

    let window_submenu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .maximize()
        .separator()
        .bring_all_to_front()
        .separator()
        .item(&reset_main_window_state)
        .build()?;

    let help_submenu = SubmenuBuilder::new(app, "Help")
        .item(&reveal_config_folder)
        .separator()
        .item(&disable_quick_open_shortcut)
        .item(&reset_quick_open_shortcut)
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

pub fn handle_menu_event(app: &AppHandle<Wry>, event: MenuEvent) {
    let action = match event.id() {
        id if id == MENU_ID_HELP_REVEAL_CONFIG_FOLDER => Some(CustomMenuAction::RevealConfigFolder),
        id if id == MENU_ID_HELP_RESET_MAIN_WINDOW_STATE => {
            Some(CustomMenuAction::ResetMainWindowState)
        }
        id if id == MENU_ID_HELP_DISABLE_QUICK_OPEN_SHORTCUT => {
            Some(CustomMenuAction::DisableQuickOpenShortcut)
        }
        id if id == MENU_ID_HELP_RESET_QUICK_OPEN_SHORTCUT => {
            Some(CustomMenuAction::ResetQuickOpenShortcut)
        }
        _ => None,
    };

    let Some(action) = action else {
        return;
    };

    if let Err(error) = dispatch_custom_menu_action(app, action) {
        eprintln!("⚠️ Native menu event failed: {error}");
    }

    if let Err(error) = install_native_app_menu(app) {
        eprintln!("⚠️ Native menu state refresh failed: {error}");
    }
}

fn dispatch_custom_menu_action(app: &AppHandle<Wry>, action: CustomMenuAction) -> AppResult<()> {
    match action {
        CustomMenuAction::RevealConfigFolder => reveal_config_folder(app),
        CustomMenuAction::ResetMainWindowState => reset_main_window_state(app),
        CustomMenuAction::DisableQuickOpenShortcut => global_hotkey::disable_quick_open_from_menu(app),
        CustomMenuAction::ResetQuickOpenShortcut => {
            global_hotkey::reset_quick_open_to_default_from_menu(app)
        }
    }
}

fn reveal_config_folder(app: &AppHandle<Wry>) -> AppResult<()> {
    let config_dir = app_config::ensure_config_dir(app)?;
    #[cfg(target_os = "macos")]
    {
        let status = Command::new("open")
            .arg(&config_dir)
            .status()
            .map_err(|error| {
                AppError::Internal(format!("failed to open config folder: {error}"))
            })?;
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

fn reset_main_window_state(app: &AppHandle<Wry>) -> AppResult<()> {
    if let Some(window) = app.get_webview_window("main") {
        app_config::reset_main_window_state_for_window(app, &window)?;
    } else {
        app_config::reset_main_window_state(app)?;
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
            &[
                MENU_ID_HELP_REVEAL_CONFIG_FOLDER,
                MENU_ID_HELP_DISABLE_QUICK_OPEN_SHORTCUT,
                MENU_ID_HELP_RESET_QUICK_OPEN_SHORTCUT
            ]
        );
    }

    #[test]
    fn window_menu_custom_ids_are_stable() {
        assert_eq!(
            menu_window_custom_item_ids(),
            &[MENU_ID_HELP_RESET_MAIN_WINDOW_STATE]
        );
    }

    #[test]
    fn custom_enabled_state_uses_narrow_runtime_facts() {
        let state = custom_enabled_state_from_runtime_facts(AppMenuRuntimeFacts {
            main_window_present: true,
            config_dir_available: true,
            quick_open_enabled: true,
            quick_open_default_active: true,
        });
        assert_eq!(
            state,
            AppMenuCustomEnabledState {
                reveal_config_folder: true,
                reset_main_window_state: true,
                disable_quick_open_shortcut: true,
                reset_quick_open_shortcut: false,
            }
        );

        let state = custom_enabled_state_from_runtime_facts(AppMenuRuntimeFacts {
            main_window_present: false,
            config_dir_available: false,
            quick_open_enabled: false,
            quick_open_default_active: false,
        });
        assert_eq!(
            state,
            AppMenuCustomEnabledState {
                reveal_config_folder: false,
                reset_main_window_state: false,
                disable_quick_open_shortcut: false,
                reset_quick_open_shortcut: true,
            }
        );
    }
}
