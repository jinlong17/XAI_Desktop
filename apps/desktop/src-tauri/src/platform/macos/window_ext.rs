use cocoa::appkit::{NSColor, NSWindow, NSWindowCollectionBehavior};
use cocoa::base::{id, nil, NO, YES};

extern "C" {
    fn CGWindowLevelForKey(key: i32) -> i32;
}

#[repr(i32)]
enum CGWindowLevelKey {
    DesktopIconWindow = 18,
}

/// Get the macOS desktop icon window level + 1
pub fn desktop_icon_level_plus_one() -> i64 {
    let icon_level = unsafe { CGWindowLevelForKey(CGWindowLevelKey::DesktopIconWindow as i32) };
    (icon_level + 1) as i64
}

/// Apply shared collection behavior for all XAI Desktop windows.
/// All windows join all Spaces, are stationary, and ignore Cmd+Tab cycle.
unsafe fn apply_shared_behavior(ns_window: id) {
    let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
        | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
        | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle;
    ns_window.setCollectionBehavior_(behavior);

    // Ensure transparency
    ns_window.setBackgroundColor_(NSColor::clearColor(nil));
    ns_window.setOpaque_(NO);
}

/// Configure the main (transparent overlay) window.
/// Always click-through, positioned at desktop icon level + 1.
pub fn configure_main_window(window: &tauri::WebviewWindow) {
    unsafe {
        let ns_window = match window.ns_window() {
            Ok(handle) => handle as id,
            Err(_) => {
                println!("⚠️ configure_main_window: ns_window unavailable");
                return;
            }
        };

        apply_shared_behavior(ns_window);

        let level = desktop_icon_level_plus_one();
        ns_window.setLevel_(level);
        ns_window.setIgnoresMouseEvents_(YES);

        println!("🎯 Main window configured: level={}, click-through=YES", level);
    }
}

/// Configure the control (AI Cube) window.
/// Interactive, positioned above Grid windows so the controller remains usable.
pub fn configure_control_window(window: &tauri::WebviewWindow) {
    unsafe {
        let ns_window = match window.ns_window() {
            Ok(handle) => handle as id,
            Err(_) => {
                println!("⚠️ configure_control_window: ns_window unavailable");
                return;
            }
        };

        apply_shared_behavior(ns_window);

        let level = desktop_icon_level_plus_one() + 3;
        ns_window.setLevel_(level);
        ns_window.setIgnoresMouseEvents_(NO);
        println!("🎛️ Control window configured: level={}, click-through=NO", level);
    }
}

/// Configure a grid window.
/// Interactive, positioned at desktop icon level + 3 (above icons).
pub fn configure_grid_window(window: &tauri::WebviewWindow) {
    unsafe {
        let ns_window = match window.ns_window() {
            Ok(handle) => handle as id,
            Err(_) => {
                println!("⚠️ configure_grid_window: ns_window unavailable");
                return;
            }
        };

        apply_shared_behavior(ns_window);

        let level = desktop_icon_level_plus_one() + 2;
        ns_window.setLevel_(level);
        ns_window.setIgnoresMouseEvents_(NO);
        println!("🎚️ Grid window level set to {}", level);
    }
}
