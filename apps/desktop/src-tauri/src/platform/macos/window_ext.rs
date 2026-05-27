use cocoa::appkit::NSWindow;
use cocoa::base::{id, NO};

unsafe fn with_ns_window<F>(window: &tauri::WebviewWindow, name: &str, mut f: F)
where
    F: FnMut(id),
{
    let ns_window = match window.ns_window() {
        Ok(handle) => handle as id,
        Err(_) => {
            println!("⚠️ {name}: ns_window unavailable");
            return;
        }
    };
    f(ns_window);
}

/// Apply normal-window defaults for Phase 1 startup.
unsafe fn apply_standard_window_behavior(ns_window: id) {
    // Remove overlay assumptions: no click-through and no desktop-level pinning.
    ns_window.setIgnoresMouseEvents_(NO);
    ns_window.setLevel_(0);
}

pub fn configure_main_window(window: &tauri::WebviewWindow) {
    unsafe {
        with_ns_window(window, "configure_main_window", |ns_window| {
            apply_standard_window_behavior(ns_window);
            println!("🪟 Main window configured for standard app behavior");
        });
    }
}

pub fn configure_grid_window(window: &tauri::WebviewWindow) {
    unsafe {
        with_ns_window(window, "configure_grid_window", |ns_window| {
            apply_standard_window_behavior(ns_window);
            println!("🪟 Grid window configured for standard app behavior");
        });
    }
}
