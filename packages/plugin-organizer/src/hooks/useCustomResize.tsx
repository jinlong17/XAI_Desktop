import { useCallback, useRef, CSSProperties } from 'react';

export type ResizeDirection = 's' | 'n' | 'e' | 'w' | 'se' | 'sw' | 'ne' | 'nw';

interface UseCustomResizeProps {
  onResize: (width: number, height: number, x?: number, y?: number) => void;
  minWidth?: number;
  minHeight?: number;
  disabled?: boolean;
}

export function useCustomResize({
  onResize,
  minWidth = 150,
  minHeight = 150,
  disabled = false,
}: UseCustomResizeProps) {
  const resizeStateRef = useRef<{
    isResizing: boolean;
    direction: ResizeDirection | null;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startPosX: number;
    startPosY: number;
  }>({
    isResizing: false,
    direction: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startPosX: 0,
    startPosY: 0,
  });

  const handleMouseDown = useCallback(
    (
      direction: ResizeDirection,
      event: React.MouseEvent,
      currentWidth: number,
      currentHeight: number,
      currentX: number,
      currentY: number
    ) => {
      if (disabled) return;

      // CRITICAL: Stop propagation to prevent Draggable from capturing
      event.stopPropagation();
      event.preventDefault();

      resizeStateRef.current = {
        isResizing: true,
        direction,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: currentWidth,
        startHeight: currentHeight,
        startPosX: currentX,
        startPosY: currentY,
      };

      const handleMouseMove = (e: MouseEvent) => {
        const state = resizeStateRef.current;
        if (!state.isResizing || !state.direction) return;

        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;

        let newWidth = state.startWidth;
        let newHeight = state.startHeight;
        let newX = state.startPosX;
        let newY = state.startPosY;

        // Calculate new dimensions based on direction
        if (state.direction.includes('e')) {
          newWidth = Math.max(minWidth, state.startWidth + deltaX);
        }
        if (state.direction.includes('w')) {
          const potentialWidth = state.startWidth - deltaX;
          if (potentialWidth >= minWidth) {
            newWidth = potentialWidth;
            newX = state.startPosX + deltaX;
          }
        }
        if (state.direction.includes('s')) {
          newHeight = Math.max(minHeight, state.startHeight + deltaY);
        }
        if (state.direction.includes('n')) {
          const potentialHeight = state.startHeight - deltaY;
          if (potentialHeight >= minHeight) {
            newHeight = potentialHeight;
            newY = state.startPosY + deltaY;
          }
        }

        // Call onResize with new dimensions (and position for n/w directions)
        if (state.direction.includes('n') || state.direction.includes('w')) {
          onResize(newWidth, newHeight, newX, newY);
        } else {
          onResize(newWidth, newHeight);
        }
      };

      const handleMouseUp = () => {
        resizeStateRef.current.isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = getComputedStyle(event.currentTarget as HTMLElement).cursor;
      document.body.style.userSelect = 'none';
    },
    [disabled, minWidth, minHeight, onResize]
  );

  return { handleMouseDown };
}

export const RESIZE_HANDLE_STYLES: Record<ResizeDirection, CSSProperties> = {
  s: { bottom: -10, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
  n: { top: -10, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
  e: { right: -10, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
  w: { left: -10, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
  se: { bottom: -10, right: -10, cursor: 'nwse-resize' },
  sw: { bottom: -10, left: -10, cursor: 'nesw-resize' },
  ne: { top: -10, right: -10, cursor: 'nesw-resize' },
  nw: { top: -10, left: -10, cursor: 'nwse-resize' },
};

