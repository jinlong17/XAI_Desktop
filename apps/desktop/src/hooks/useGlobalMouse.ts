import { useEffect, useRef, useCallback } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

interface MousePosition {
  x: number;
  y: number;
  is_dragging: boolean; // True if mouse button is held
}

interface InteractiveElement {
  selector: string;
  padding?: number; // Extra padding around element for easier interaction
}

// Interactive elements that should capture mouse events
const INTERACTIVE_ELEMENTS: InteractiveElement[] = [
  { selector: '.ai-cube', padding: 5 },
  { selector: '.settings-panel', padding: 0 },
  { selector: '.smart-container', padding: 0 },
  { selector: '[data-interactive="true"]', padding: 0 },
];

// Note: Drag-drop events are now handled by useFileDrop in plugin-organizer
// The DragDropEventPayload type was removed as it's no longer used here

/**
 * Check if a point is inside any interactive element
 */
function isPointInInteractiveElement(x: number, y: number): boolean {
  for (const { selector, padding = 0 } of INTERACTIVE_ELEMENTS) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const expandedRect = {
        left: rect.left - padding,
        right: rect.right + padding,
        top: rect.top - padding,
        bottom: rect.bottom + padding,
      };

      if (
        x >= expandedRect.left &&
        x <= expandedRect.right &&
        y >= expandedRect.top &&
        y <= expandedRect.bottom
      ) {
        return true;
      }
    }
  }
  return false;
}

// Suppress unused function warning - will be used when click-through is re-enabled
void isPointInInteractiveElement;

/**
 * Hook to handle dynamic click-through based on global mouse position.
 *
 * Uses Rust-side global mouse tracking to detect mouse position even when
 * the window has setIgnoreCursorEvents(true).
 *
 * When mouse is over an interactive element:
 *   - setIgnoreCursorEvents(false) -> window receives events
 * When mouse is over empty space:
 *   - setIgnoreCursorEvents(true) -> clicks pass through to desktop
 */
export function useGlobalMouse(enabled: boolean = true) {
  const unlistenMouseRef = useRef<UnlistenFn | null>(null);
  const isIgnoringRef = useRef<boolean>(true); // Start with click-through enabled

  const updateClickThrough = useCallback(async (shouldIgnore: boolean, reason?: string) => {
    if (isIgnoringRef.current === shouldIgnore) return;

    try {
      const appWindow = getCurrentWebviewWindow();
      await appWindow.setIgnoreCursorEvents(shouldIgnore);
      isIgnoringRef.current = shouldIgnore;

      if (!shouldIgnore) {
        console.log(`🖱️ Window capturing events - ${reason || 'interactive element'}`);
      } else {
        console.log('🖱️ Click-through enabled - mouse over empty space');
      }
    } catch (error) {
      console.error('Failed to update click-through state:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let isMounted = true;

    const setup = async () => {
      try {
        // TEMPORARY: Start with click-through DISABLED for testing file drop
        // TODO: Re-enable dynamic click-through after file drop is confirmed working
        const appWindow = getCurrentWebviewWindow();
        await appWindow.setIgnoreCursorEvents(false);
        isIgnoringRef.current = false;
        console.log('⚠️ TESTING MODE: Click-through DISABLED - testing file drop');

        // TEMPORARILY DISABLED: Dynamic click-through based on mouse position
        // We need to first confirm file drop works without click-through
        //
        // Listen for mouse position events from Rust
        unlistenMouseRef.current = await listen<MousePosition>('mouse-position', (_event) => {
          if (!isMounted) return;

          // DISABLED FOR TESTING - just log the position occasionally
          // const { x, y, is_dragging } = _event.payload;
          // console.log(`Mouse: ${x}, ${y}, dragging: ${is_dragging}`);
        });

        console.log('✅ Mouse tracking active (click-through switching DISABLED for testing)');

        // DISABLED: Don't register drag-drop listener here
        // useFileDrop in OrganizerLayer handles drag-drop events
        // Having two listeners may cause conflicts
        console.log('ℹ️ Drag-drop events handled by useFileDrop (not here)');
      } catch (error) {
        console.error('Failed to setup global mouse tracking:', error);
      }
    };

    setup();

    return () => {
      isMounted = false;
      if (unlistenMouseRef.current) {
        unlistenMouseRef.current();
        unlistenMouseRef.current = null;
      }
      // unlistenDragDropRef not used anymore - drag-drop handled by useFileDrop
    };
  }, [enabled, updateClickThrough]);
}

export default useGlobalMouse;
