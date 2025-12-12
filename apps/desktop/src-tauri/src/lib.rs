use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg(target_os = "macos")]
use cocoa::{
    appkit::{NSColor, NSWindow, NSWindowCollectionBehavior},
    base::{id, nil, NO},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .expect("main window not found");

            #[cfg(target_os = "macos")]
            {
                // Configure window to be BELOW all other windows (desktop layer)
                unsafe {
                    let ns_window = window.ns_window().expect("ns_window") as id;
                    
                    // Only use CanJoinAllSpaces - remove Stationary
                    // Stationary may prevent proper layering
                    let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces;
                    ns_window.setCollectionBehavior_(behavior);
                    
                    // Use the absolute LOWEST window level
                    // CGShieldingWindowLevel() - 1 ensures we're below everything
                    const K_CG_DESKTOP_WINDOW_LEVEL: i64 = i32::MIN as i64;
                    ns_window.setLevel_(K_CG_DESKTOP_WINDOW_LEVEL);
                    
                    // Ensure transparency
                    ns_window.setBackgroundColor_(NSColor::clearColor(nil));
                    ns_window.setOpaque_(NO);
                    
                    println!("✅ macOS window configured (LOWEST level):");
                    println!("   - Window level: {} (i32::MIN - absolute lowest)", K_CG_DESKTOP_WINDOW_LEVEL);
                    println!("   - Behavior: CanJoinAllSpaces only");
                    println!("   - Should be below ALL windows");
                }
            }

            // Window chrome and transparency configuration
            let _ = window.set_decorations(false);
            let _ = window.set_shadow(false);
            let _ = window.set_resizable(false);
            let _ = window.set_always_on_top(false);

            if let Ok(Some(monitor)) = window.current_monitor() {
                let size = monitor.size();
                window
                    .set_size(tauri::Size::Physical(*size))
                    .expect("failed to set size");
                window
                    .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x: 0, y: 0 }))
                    .expect("failed to set position");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
