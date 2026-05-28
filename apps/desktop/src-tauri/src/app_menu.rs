use tauri::menu::{Menu, MenuBuilder, MenuEvent, SubmenuBuilder};
use tauri::{AppHandle, Runtime};

use crate::error::{AppError, AppResult};

#[cfg(test)]
pub fn menu_top_level_labels() -> &'static [&'static str] {
    &["app", "File", "Edit", "View", "Window", "Help"]
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
        .text("help.about", "X Desktop Help")
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

pub fn handle_menu_event<R: Runtime>(_app: &AppHandle<R>, _event: MenuEvent) {}

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
}
