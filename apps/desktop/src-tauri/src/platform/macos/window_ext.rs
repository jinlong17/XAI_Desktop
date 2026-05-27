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

pub mod legacy_overlay {
    #![allow(dead_code)]

    use cocoa::appkit::{NSColor, NSWindow, NSWindowCollectionBehavior};
    use cocoa::base::{id, nil, NO, YES};

    extern "C" {
        fn CGWindowLevelForKey(key: i32) -> i32;
    }

    #[repr(i32)]
    enum CGWindowLevelKey {
        DesktopIconWindow = 18,
    }

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

    /// Get the macOS desktop icon window level + 1.
    pub fn desktop_icon_level_plus_one() -> i64 {
        let icon_level = unsafe { CGWindowLevelForKey(CGWindowLevelKey::DesktopIconWindow as i32) };
        (icon_level + 1) as i64
    }

    /// Apply the shared transparent-overlay collection behavior used by the
    /// legacy desktop asset. Inactive in Phase 1 default startup.
    unsafe fn apply_shared_behavior(ns_window: id) {
        let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle;
        ns_window.setCollectionBehavior_(behavior);
        ns_window.setBackgroundColor_(NSColor::clearColor(nil));
        ns_window.setOpaque_(NO);
    }

    pub fn configure_main_overlay_window(window: &tauri::WebviewWindow) {
        unsafe {
            with_ns_window(window, "legacy_overlay::configure_main_overlay_window", |ns_window| {
                apply_shared_behavior(ns_window);

                let level = desktop_icon_level_plus_one();
                ns_window.setLevel_(level);
                ns_window.setIgnoresMouseEvents_(YES);

                println!("🎯 Legacy main overlay configured: level={level}, click-through=YES");
            });
        }
    }

    pub fn configure_control_window(window: &tauri::WebviewWindow) {
        unsafe {
            with_ns_window(window, "legacy_overlay::configure_control_window", |ns_window| {
                apply_shared_behavior(ns_window);

                let level = desktop_icon_level_plus_one() + 3;
                ns_window.setLevel_(level);
                ns_window.setIgnoresMouseEvents_(NO);

                println!("🎛️ Legacy control window configured: level={level}, click-through=NO");
            });
        }
    }

    pub fn configure_grid_window(window: &tauri::WebviewWindow) {
        unsafe {
            with_ns_window(window, "legacy_overlay::configure_grid_window", |ns_window| {
                apply_shared_behavior(ns_window);

                let level = desktop_icon_level_plus_one() + 2;
                ns_window.setLevel_(level);
                ns_window.setIgnoresMouseEvents_(NO);

                println!("🎚️ Legacy grid window level set to {level}");
            });
        }
    }
}
