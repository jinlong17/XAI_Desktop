#![allow(dead_code)]

//! Quarantined legacy overlay bootstrap helpers.
//!
//! Phase 1 must not start control/grid/overlay surfaces by default, but the
//! old implementation remains useful for P3+ overlay revival work. Keep it here
//! as an inactive boundary instead of deleting it from history.

use tauri::{Manager, Runtime, WebviewUrl, WebviewWindowBuilder};

use crate::{ConsoleWindowFrameState, GridWindowsState};

pub fn register_state<R: Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    builder
        .manage(GridWindowsState::default())
        .manage(ConsoleWindowFrameState::default())
}

pub fn bootstrap_control_window(app: &tauri::AppHandle) {
    if app.get_webview_window("control").is_some() {
        return;
    }

    // The initial inner_size matches CONTROL_CLOSED_SIZE in ControlWindow.tsx
    // so the transparent hit-test surface does not blanket the area where
    // Grid windows spawn. React expands/shrinks the window as the panel opens.
    let control_builder = WebviewWindowBuilder::new(
        app,
        "control",
        WebviewUrl::App("/desktop-host/index.html#/control".into()),
    )
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
                crate::platform::macos::legacy_overlay::configure_control_window(&window_clone);
            });
        }
    }
}
