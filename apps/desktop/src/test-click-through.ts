// Simple test script for click-through functionality
// Add this to App.tsx temporarily to debug

import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function testClickThrough() {
  try {
    const appWindow = getCurrentWebviewWindow();
    
    console.log("🧪 Testing click-through...");
    
    // Test 1: Enable click-through
    await appWindow.setIgnoreCursorEvents(true);
    console.log("✅ Step 1: setIgnoreCursorEvents(true) called");
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Disable click-through
    await appWindow.setIgnoreCursorEvents(false);
    console.log("✅ Step 2: setIgnoreCursorEvents(false) called");
    
    // Final: Re-enable
    await appWindow.setIgnoreCursorEvents(true);
    console.log("✅ Step 3: Re-enabled click-through");
    
    console.log("✅ All tests passed! API is working.");
    console.log("Now try clicking desktop files...");
    
  } catch (error) {
    console.error("❌ Click-through test failed:", error);
  }
}

// Call this in App.tsx useEffect:
// testClickThrough();

