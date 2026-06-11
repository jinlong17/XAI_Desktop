use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::image::Image;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, State, Wry};

const TRAY_ID: &str = "desktop-statusbar-quick-actions";
const ICON_SIZE: u32 = 18;

pub const MENU_ID_OPEN_APP: &str = "statusbar.open-app";
pub const MENU_ID_START_POMODORO: &str = "statusbar.start-pomodoro";
pub const MENU_ID_VIEW_TODAY_TASKS: &str = "statusbar.view-today-tasks";

const MENU_ID_STATUS_SUMMARY: &str = "statusbar.status-summary";
const MENU_ID_STATUS_POMODORO: &str = "statusbar.status-pomodoro";
const MENU_ID_STATUS_TASKS: &str = "statusbar.status-tasks";

const ACTION_EVENT_NAME: &str = "xai:desktop-statusbar-quick-action";

fn ensure_statusbar_window_allowed(label: &str) -> AppResult<()> {
    if label == "main" {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke statusbar_set_snapshot"
    )))
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum DesktopStatusbarQuickAction {
    OpenApp,
    StartPomodoro,
    ViewTodayTasks,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DesktopStatusbarAvailabilityReason {
    Ready,
    FeatureDisabled,
    RouteContractMissing,
    BridgeNotReady,
    UnsupportedRuntime,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopStatusbarQuickActionState {
    pub enabled: bool,
    pub reason: DesktopStatusbarAvailabilityReason,
    pub label: String,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopStatusbarSnapshot {
    pub app_status: DesktopStatusbarAppStatus,
    pub summary_label: String,
    pub quick_actions: DesktopStatusbarQuickActionsSnapshot,
    pub notifications_status: Option<DesktopStatusbarNotificationsStatus>,
}

impl Default for DesktopStatusbarSnapshot {
    fn default() -> Self {
        Self {
            app_status: DesktopStatusbarAppStatus::Loading,
            summary_label: "Loading".to_string(),
            quick_actions: DesktopStatusbarQuickActionsSnapshot {
                start_pomodoro: DesktopStatusbarQuickActionState {
                    enabled: false,
                    reason: DesktopStatusbarAvailabilityReason::BridgeNotReady,
                    label: "Start Pomodoro".to_string(),
                },
                view_today_tasks: DesktopStatusbarQuickActionState {
                    enabled: false,
                    reason: DesktopStatusbarAvailabilityReason::BridgeNotReady,
                    label: "Today's Tasks".to_string(),
                },
            },
            notifications_status: None,
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum DesktopStatusbarAppStatus {
    Loading,
    Ready,
    Degraded,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum DesktopStatusbarNotificationsStatus {
    Ready,
    Disabled,
    Denied,
    Unsupported,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopStatusbarQuickActionsSnapshot {
    pub start_pomodoro: DesktopStatusbarQuickActionState,
    pub view_today_tasks: DesktopStatusbarQuickActionState,
}

struct DesktopStatusbarMenuHandles {
    start_pomodoro: MenuItem<Wry>,
    view_today_tasks: MenuItem<Wry>,
    status_summary: MenuItem<Wry>,
    status_pomodoro: MenuItem<Wry>,
    status_tasks: MenuItem<Wry>,
}

#[derive(Default)]
pub struct DesktopStatusbarState {
    tray: Mutex<Option<TrayIcon<Wry>>>,
    menu_handles: Mutex<Option<DesktopStatusbarMenuHandles>>,
    snapshot: Mutex<DesktopStatusbarSnapshot>,
}

pub fn install_statusbar(app: &AppHandle) -> AppResult<()> {
    let state = app.state::<DesktopStatusbarState>();
    let snapshot = state
        .snapshot
        .lock()
        .map_err(|error| AppError::Internal(error.to_string()))?
        .clone();

    let (menu, menu_handles) = build_statusbar_menu(app, &snapshot)?;

    let tray = TrayIconBuilder::with_id(TRAY_ID)
        .icon(statusbar_icon())
        .tooltip(tooltip_for(&snapshot))
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Down,
                    ..
                }
            ) {
                let _ = focus_main_window(tray.app_handle());
            }
        })
        .build(app)
        .map_err(|error| AppError::Internal(error.to_string()))?;

    {
        let mut tray_guard = state
            .tray
            .lock()
            .map_err(|error| AppError::Internal(error.to_string()))?;
        *tray_guard = Some(tray);
    }

    {
        let mut handles_guard = state
            .menu_handles
            .lock()
            .map_err(|error| AppError::Internal(error.to_string()))?;
        *handles_guard = Some(menu_handles);
    }

    Ok(())
}

pub fn handle_statusbar_menu_event(app: &AppHandle, menu_id: &str) -> AppResult<bool> {
    let action = match menu_id {
        MENU_ID_OPEN_APP => Some(DesktopStatusbarQuickAction::OpenApp),
        MENU_ID_START_POMODORO => Some(DesktopStatusbarQuickAction::StartPomodoro),
        MENU_ID_VIEW_TODAY_TASKS => Some(DesktopStatusbarQuickAction::ViewTodayTasks),
        _ => None,
    };

    let Some(action) = action else {
        return Ok(false);
    };

    focus_main_window(app)?;

    if action == DesktopStatusbarQuickAction::OpenApp {
        return Ok(true);
    }

    let snapshot = app
        .state::<DesktopStatusbarState>()
        .snapshot
        .lock()
        .map_err(|error| AppError::Internal(error.to_string()))?
        .clone();

    let enabled = match action {
        DesktopStatusbarQuickAction::OpenApp => true,
        DesktopStatusbarQuickAction::StartPomodoro => snapshot.quick_actions.start_pomodoro.enabled,
        DesktopStatusbarQuickAction::ViewTodayTasks => {
            snapshot.quick_actions.view_today_tasks.enabled
        }
    };

    if enabled {
        dispatch_quick_action(app, action)?;
    }

    Ok(true)
}

#[tauri::command]
pub async fn statusbar_set_snapshot(
    window: tauri::WebviewWindow,
    state: State<'_, DesktopStatusbarState>,
    payload: DesktopStatusbarSnapshot,
) -> AppResult<()> {
    ensure_statusbar_window_allowed(window.label())?;

    {
        let mut snapshot = state
            .snapshot
            .lock()
            .map_err(|error| AppError::Internal(error.to_string()))?;
        *snapshot = payload.clone();
    }

    {
        let tray_guard = state
            .tray
            .lock()
            .map_err(|error| AppError::Internal(error.to_string()))?;
        if let Some(tray) = tray_guard.as_ref() {
            tray.set_tooltip(Some(tooltip_for(&payload)))
                .map_err(|error| AppError::Internal(error.to_string()))?;
        }
    }

    {
        let handles_guard = state
            .menu_handles
            .lock()
            .map_err(|error| AppError::Internal(error.to_string()))?;
        if let Some(handles) = handles_guard.as_ref() {
            apply_snapshot_to_menu(handles, &payload)?;
        }
    }

    Ok(())
}

fn build_statusbar_menu(
    app: &AppHandle,
    snapshot: &DesktopStatusbarSnapshot,
) -> AppResult<(Menu<Wry>, DesktopStatusbarMenuHandles)> {
    let open_app = MenuItem::with_id(app, MENU_ID_OPEN_APP, "Open X Desktop", true, None::<&str>)
        .map_err(|error| AppError::Internal(error.to_string()))?;
    let start_pomodoro = MenuItem::with_id(
        app,
        MENU_ID_START_POMODORO,
        snapshot.quick_actions.start_pomodoro.label.as_str(),
        snapshot.quick_actions.start_pomodoro.enabled,
        None::<&str>,
    )
    .map_err(|error| AppError::Internal(error.to_string()))?;
    let view_today_tasks = MenuItem::with_id(
        app,
        MENU_ID_VIEW_TODAY_TASKS,
        snapshot.quick_actions.view_today_tasks.label.as_str(),
        snapshot.quick_actions.view_today_tasks.enabled,
        None::<&str>,
    )
    .map_err(|error| AppError::Internal(error.to_string()))?;

    let status_summary = MenuItem::with_id(
        app,
        MENU_ID_STATUS_SUMMARY,
        format!("Status: {}", snapshot.summary_label),
        false,
        None::<&str>,
    )
    .map_err(|error| AppError::Internal(error.to_string()))?;
    let status_pomodoro = MenuItem::with_id(
        app,
        MENU_ID_STATUS_POMODORO,
        format!(
            "Pomodoro: {}",
            availability_reason_text(
                snapshot.quick_actions.start_pomodoro.enabled,
                snapshot.quick_actions.start_pomodoro.reason
            )
        ),
        false,
        None::<&str>,
    )
    .map_err(|error| AppError::Internal(error.to_string()))?;
    let status_tasks = MenuItem::with_id(
        app,
        MENU_ID_STATUS_TASKS,
        format!(
            "Tasks: {}",
            availability_reason_text(
                snapshot.quick_actions.view_today_tasks.enabled,
                snapshot.quick_actions.view_today_tasks.reason
            )
        ),
        false,
        None::<&str>,
    )
    .map_err(|error| AppError::Internal(error.to_string()))?;

    let separator_top = PredefinedMenuItem::separator(app)
        .map_err(|error| AppError::Internal(error.to_string()))?;
    let separator_bottom = PredefinedMenuItem::separator(app)
        .map_err(|error| AppError::Internal(error.to_string()))?;

    let menu = Menu::with_items(
        app,
        &[
            &open_app,
            &separator_top,
            &start_pomodoro,
            &view_today_tasks,
            &separator_bottom,
            &status_summary,
            &status_pomodoro,
            &status_tasks,
        ],
    )
    .map_err(|error| AppError::Internal(error.to_string()))?;

    Ok((
        menu,
        DesktopStatusbarMenuHandles {
            start_pomodoro,
            view_today_tasks,
            status_summary,
            status_pomodoro,
            status_tasks,
        },
    ))
}

fn apply_snapshot_to_menu(
    handles: &DesktopStatusbarMenuHandles,
    snapshot: &DesktopStatusbarSnapshot,
) -> AppResult<()> {
    handles
        .start_pomodoro
        .set_text(snapshot.quick_actions.start_pomodoro.label.as_str())
        .map_err(|error| AppError::Internal(error.to_string()))?;
    handles
        .start_pomodoro
        .set_enabled(snapshot.quick_actions.start_pomodoro.enabled)
        .map_err(|error| AppError::Internal(error.to_string()))?;

    handles
        .view_today_tasks
        .set_text(snapshot.quick_actions.view_today_tasks.label.as_str())
        .map_err(|error| AppError::Internal(error.to_string()))?;
    handles
        .view_today_tasks
        .set_enabled(snapshot.quick_actions.view_today_tasks.enabled)
        .map_err(|error| AppError::Internal(error.to_string()))?;

    handles
        .status_summary
        .set_text(format!("Status: {}", snapshot.summary_label))
        .map_err(|error| AppError::Internal(error.to_string()))?;

    handles
        .status_pomodoro
        .set_text(format!(
            "Pomodoro: {}",
            availability_reason_text(
                snapshot.quick_actions.start_pomodoro.enabled,
                snapshot.quick_actions.start_pomodoro.reason
            )
        ))
        .map_err(|error| AppError::Internal(error.to_string()))?;

    handles
        .status_tasks
        .set_text(format!(
            "Tasks: {}",
            availability_reason_text(
                snapshot.quick_actions.view_today_tasks.enabled,
                snapshot.quick_actions.view_today_tasks.reason
            )
        ))
        .map_err(|error| AppError::Internal(error.to_string()))?;

    Ok(())
}

fn focus_main_window(app: &AppHandle) -> AppResult<()> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| AppError::Internal("main window not found".to_string()))?;
    window
        .show()
        .map_err(|error| AppError::Internal(error.to_string()))?;
    window
        .set_focus()
        .map_err(|error| AppError::Internal(error.to_string()))?;
    Ok(())
}

fn dispatch_quick_action(app: &AppHandle, action: DesktopStatusbarQuickAction) -> AppResult<()> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| AppError::Internal("main window not found".to_string()))?;

    let action_json =
        serde_json::to_string(&action).map_err(|error| AppError::Internal(error.to_string()))?;

    let script = format!(
        "window.dispatchEvent(new CustomEvent({event_name:?}, {{ detail: {action_json} }}));",
        event_name = ACTION_EVENT_NAME,
    );

    window
        .eval(script.as_str())
        .map_err(|error| AppError::Internal(error.to_string()))?;
    Ok(())
}

fn tooltip_for(snapshot: &DesktopStatusbarSnapshot) -> String {
    format!("X Desktop — {}", snapshot.summary_label)
}

fn availability_reason_text(
    enabled: bool,
    reason: DesktopStatusbarAvailabilityReason,
) -> &'static str {
    if enabled {
        return "Ready";
    }

    match reason {
        DesktopStatusbarAvailabilityReason::Ready => "Ready",
        DesktopStatusbarAvailabilityReason::FeatureDisabled => "Disabled in Settings",
        DesktopStatusbarAvailabilityReason::RouteContractMissing => "Route Contract Missing",
        DesktopStatusbarAvailabilityReason::BridgeNotReady => "Bridge Not Ready",
        DesktopStatusbarAvailabilityReason::UnsupportedRuntime => "Unsupported Runtime",
    }
}

fn statusbar_icon() -> Image<'static> {
    let mut rgba = vec![0; (ICON_SIZE * ICON_SIZE * 4) as usize];
    let center = (ICON_SIZE as f32 - 1.0) / 2.0;
    let radius = 6.2;

    for y in 0..ICON_SIZE {
        for x in 0..ICON_SIZE {
            let dx = x as f32 - center;
            let dy = y as f32 - center;
            if (dx * dx + dy * dy).sqrt() <= radius {
                let index = ((y * ICON_SIZE + x) * 4) as usize;
                rgba[index..index + 4].copy_from_slice(&[32, 32, 32, 255]);
            }
        }
    }

    Image::new_owned(rgba, ICON_SIZE, ICON_SIZE)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn statusbar_menu_ids_are_stable() {
        assert_eq!(MENU_ID_OPEN_APP, "statusbar.open-app");
        assert_eq!(MENU_ID_START_POMODORO, "statusbar.start-pomodoro");
        assert_eq!(MENU_ID_VIEW_TODAY_TASKS, "statusbar.view-today-tasks");
    }

    #[test]
    fn availability_reason_text_matches_contract() {
        assert_eq!(
            availability_reason_text(false, DesktopStatusbarAvailabilityReason::FeatureDisabled),
            "Disabled in Settings"
        );
        assert_eq!(
            availability_reason_text(false, DesktopStatusbarAvailabilityReason::BridgeNotReady),
            "Bridge Not Ready"
        );
        assert_eq!(
            availability_reason_text(true, DesktopStatusbarAvailabilityReason::UnsupportedRuntime),
            "Ready"
        );
    }

    #[test]
    fn statusbar_window_allowlist_is_main_only() {
        assert!(ensure_statusbar_window_allowed("main").is_ok());
        let error = ensure_statusbar_window_allowed("control").unwrap_err();
        match error {
            AppError::SyncCapabilityDenied(message) => {
                assert!(message.contains("control"));
                assert!(message.contains("statusbar_set_snapshot"));
            }
            other => panic!("unexpected error: {other:?}"),
        }
    }
}
