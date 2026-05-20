import { useMemo } from 'react';
import type { WindowType, WindowLabel } from '../types/window';

/**
 * Detects current window type and label from the URL hash.
 * Window routing: /#/grid?id=xxx → grid window, /#/control → control window, etc.
 */
export function useWindow(): {
  windowLabel: WindowLabel;
  windowType: WindowType;
  isMainWindow: boolean;
  isControlWindow: boolean;
  isGridWindow: boolean;
} {
  return useMemo(() => {
    const hash = window.location.hash;

    if (hash.startsWith('#/grid')) {
      const params = new URLSearchParams(hash.split('?')[1] || '');
      const gridId = params.get('id') || 'unknown';
      return {
        windowLabel: `grid_${gridId}` as WindowLabel,
        windowType: 'grid' as const,
        isMainWindow: false,
        isControlWindow: false,
        isGridWindow: true,
      };
    }

    if (hash.startsWith('#/control')) {
      return {
        windowLabel: 'control' as WindowLabel,
        windowType: 'control' as const,
        isMainWindow: false,
        isControlWindow: true,
        isGridWindow: false,
      };
    }

    return {
      windowLabel: 'main' as WindowLabel,
      windowType: 'main' as const,
      isMainWindow: true,
      isControlWindow: false,
      isGridWindow: false,
    };
  }, []);
}
