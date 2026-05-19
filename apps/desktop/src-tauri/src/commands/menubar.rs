use crate::error::{AppError, AppResult};
use serde::Deserialize;
use std::sync::Mutex;
use tauri::image::Image;
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, State, Wry};

const TRAY_ID: &str = "sync-status";
const ICON_SIZE: u32 = 18;

#[derive(Default)]
pub struct SyncMenuBarState {
    tray: Mutex<Option<TrayIcon<Wry>>>,
    status: Mutex<SyncMenuBarStatus>,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SyncMenuBarStatus {
    #[default]
    Idle,
    Syncing,
    Success,
    Error,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncMenuBarPayload {
    status: SyncMenuBarStatus,
    kind: Option<String>,
    message: Option<String>,
    frame: Option<u8>,
}

pub fn install_sync_menubar(app: &AppHandle) -> AppResult<()> {
    let tray = TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon_for(SyncMenuBarStatus::Idle, 0))
        .tooltip(tooltip_for(SyncMenuBarStatus::Idle, None, None))
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if is_error_click(&event) && tray_is_error(tray.app_handle()) {
                if let Some(window) = tray.app_handle().get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)
        .map_err(|error| AppError::Internal(error.to_string()))?;

    let state = app.state::<SyncMenuBarState>();
    let mut guard = state
        .tray
        .lock()
        .map_err(|error| AppError::Internal(error.to_string()))?;
    *guard = Some(tray);
    Ok(())
}

#[tauri::command]
pub async fn sync_set_menubar_status(
    state: State<'_, SyncMenuBarState>,
    payload: SyncMenuBarPayload,
) -> AppResult<()> {
    {
        let mut status = state
            .status
            .lock()
            .map_err(|error| AppError::Internal(error.to_string()))?;
        *status = payload.status;
    }

    let guard = state
        .tray
        .lock()
        .map_err(|error| AppError::Internal(error.to_string()))?;
    if let Some(tray) = guard.as_ref() {
        tray.set_icon(Some(icon_for(payload.status, payload.frame.unwrap_or(0))))
            .map_err(|error| AppError::Internal(error.to_string()))?;
        tray.set_tooltip(Some(tooltip_for(
            payload.status,
            payload.kind.as_deref(),
            payload.message.as_deref(),
        )))
        .map_err(|error| AppError::Internal(error.to_string()))?;
    }

    Ok(())
}

fn is_error_click(event: &TrayIconEvent) -> bool {
    matches!(
        event,
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Down,
            ..
        }
    )
}

fn tray_is_error(app: &AppHandle) -> bool {
    app.try_state::<SyncMenuBarState>()
        .and_then(|state| state.status.lock().ok().map(|status| *status))
        == Some(SyncMenuBarStatus::Error)
}

fn icon_for(status: SyncMenuBarStatus, frame: u8) -> Image<'static> {
    let rgba = match status {
        SyncMenuBarStatus::Idle => dot_icon([132, 142, 154, 255], None),
        SyncMenuBarStatus::Syncing => spinner_icon(frame, [37, 99, 235, 255]),
        SyncMenuBarStatus::Success => dot_icon([34, 197, 94, 255], Some([15, 118, 110, 255])),
        SyncMenuBarStatus::Error => error_icon([220, 38, 38, 255]),
    };
    Image::new_owned(rgba, ICON_SIZE, ICON_SIZE)
}

fn tooltip_for(status: SyncMenuBarStatus, kind: Option<&str>, message: Option<&str>) -> String {
    match status {
        SyncMenuBarStatus::Idle => "Sync idle".to_string(),
        SyncMenuBarStatus::Syncing => format!("Syncing {}", kind.unwrap_or("changes")),
        SyncMenuBarStatus::Success => message.unwrap_or("Sync completed").to_string(),
        SyncMenuBarStatus::Error => format!(
            "Sync error: {}. Click to focus X Desktop.",
            message.unwrap_or("unknown error")
        ),
    }
}

fn dot_icon(primary: [u8; 4], accent: Option<[u8; 4]>) -> Vec<u8> {
    let mut rgba = vec![0; (ICON_SIZE * ICON_SIZE * 4) as usize];
    let center = (ICON_SIZE as f32 - 1.0) / 2.0;
    let radius = 6.2;
    let accent_radius = 2.4;

    for y in 0..ICON_SIZE {
        for x in 0..ICON_SIZE {
            let dx = x as f32 - center;
            let dy = y as f32 - center;
            let distance = (dx * dx + dy * dy).sqrt();
            if distance <= radius {
                set_pixel(&mut rgba, x, y, primary);
            }
            if let Some(color) = accent {
                let adx = x as f32 - (center + 2.5);
                let ady = y as f32 - (center - 2.5);
                if (adx * adx + ady * ady).sqrt() <= accent_radius {
                    set_pixel(&mut rgba, x, y, color);
                }
            }
        }
    }

    rgba
}

fn spinner_icon(frame: u8, primary: [u8; 4]) -> Vec<u8> {
    let mut rgba = vec![0; (ICON_SIZE * ICON_SIZE * 4) as usize];
    let center = (ICON_SIZE as f32 - 1.0) / 2.0;
    let bright_index = (frame % 4) as usize;
    let points = [(9, 2), (16, 9), (9, 16), (2, 9)];

    for (index, (x, y)) in points.iter().enumerate() {
        let alpha = if index == bright_index { 255 } else { 90 };
        let color = [primary[0], primary[1], primary[2], alpha];
        draw_disc(&mut rgba, *x, *y, 2.5, color);
    }
    draw_disc(
        &mut rgba,
        center.round() as u32,
        center.round() as u32,
        1.7,
        [primary[0], primary[1], primary[2], 130],
    );

    rgba
}

fn error_icon(primary: [u8; 4]) -> Vec<u8> {
    let mut rgba = dot_icon(primary, None);
    for y in 5..12 {
        draw_disc(&mut rgba, 9, y, 1.0, [255, 255, 255, 255]);
    }
    draw_disc(&mut rgba, 9, 14, 1.2, [255, 255, 255, 255]);
    rgba
}

fn draw_disc(rgba: &mut [u8], center_x: u32, center_y: u32, radius: f32, color: [u8; 4]) {
    for y in 0..ICON_SIZE {
        for x in 0..ICON_SIZE {
            let dx = x as f32 - center_x as f32;
            let dy = y as f32 - center_y as f32;
            if (dx * dx + dy * dy).sqrt() <= radius {
                set_pixel(rgba, x, y, color);
            }
        }
    }
}

fn set_pixel(rgba: &mut [u8], x: u32, y: u32, color: [u8; 4]) {
    let index = ((y * ICON_SIZE + x) * 4) as usize;
    rgba[index..index + 4].copy_from_slice(&color);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generated_icons_have_expected_dimensions() {
        for status in [
            SyncMenuBarStatus::Idle,
            SyncMenuBarStatus::Syncing,
            SyncMenuBarStatus::Success,
            SyncMenuBarStatus::Error,
        ] {
            let icon = icon_for(status, 2);
            assert_eq!(icon.width(), ICON_SIZE);
            assert_eq!(icon.height(), ICON_SIZE);
            assert_eq!(icon.rgba().len(), (ICON_SIZE * ICON_SIZE * 4) as usize);
            assert!(icon.rgba().iter().any(|channel| *channel != 0));
        }
    }

    #[test]
    fn error_tooltip_is_clickable_instruction() {
        let tooltip = tooltip_for(SyncMenuBarStatus::Error, Some("pull"), Some("E3015"));
        assert!(tooltip.contains("E3015"));
        assert!(tooltip.contains("Click"));
    }
}
