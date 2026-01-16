import { useEffect, useRef } from 'react';

export interface FileDropPayload {
  paths: string[];
  position: { x: number; y: number };
}

export interface UseFileDropOptions {
  onDrop: (paths: string[], position: { x: number; y: number }) => void;
  onHover?: (hovering: boolean) => void;
  onEnter?: () => void;  // Called when files enter the window
  onLeave?: () => void;  // Called when files leave or drop is cancelled
  enabled?: boolean;
}

/**
 * Hook to handle file drops from the operating system into the Tauri window.
 *
 * Uses HTML5 Drag & Drop API (with dragDropEnabled: false in tauri.conf.json).
 * This approach works better with transparent windows on macOS.
 *
 * Note: HTML5 API provides File objects, not file paths. For security reasons,
 * browsers don't expose full file paths. We use file.name as the identifier.
 *
 * Events:
 * - dragenter: Files have entered the window area
 * - dragover: Files are being dragged over the window (with position)
 * - drop: Files were dropped (with File objects and position)
 * - dragleave: Drag operation cancelled or files left window
 */
export function useFileDrop({ onDrop, onHover, onEnter, onLeave, enabled = true }: UseFileDropOptions) {
  const onDropRef = useRef(onDrop);
  const onHoverRef = useRef(onHover);
  const onEnterRef = useRef(onEnter);
  const onLeaveRef = useRef(onLeave);
  const isDraggingRef = useRef(false);
  const dragCounterRef = useRef(0); // Track nested drag enter/leave

  // Keep refs updated
  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  // Setup HTML5 drag-drop event listeners
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) {
      return;
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounterRef.current++;

      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        console.log('📂 [useFileDrop] Files entered window');
        onHoverRef.current?.(true);
        onEnterRef.current?.();
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Allow drop
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounterRef.current--;

      // Only trigger leave when all nested elements have been left
      if (dragCounterRef.current === 0 && isDraggingRef.current) {
        isDraggingRef.current = false;
        console.log('📂 [useFileDrop] Drag left window');
        onHoverRef.current?.(false);
        onLeaveRef.current?.();
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounterRef.current = 0;
      isDraggingRef.current = false;
      onHoverRef.current?.(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        // HTML5 API doesn't provide full paths for security reasons
        // We'll use file names as identifiers
        // For a real desktop app, you might need to use Tauri's file dialog
        // or save files to a temp location first
        const fileNames = Array.from(files).map(f => f.name);
        const position = { x: e.clientX, y: e.clientY };

        console.log('📂 [useFileDrop] Files dropped:', fileNames, 'at', position);

        // Store File objects in a global map so they can be accessed later
        // This is needed because we can't pass File objects through the path string
        const fileMap = (window as unknown as { __droppedFiles?: Map<string, File> }).__droppedFiles || new Map<string, File>();
        Array.from(files).forEach(file => {
          fileMap.set(file.name, file);
        });
        (window as unknown as { __droppedFiles: Map<string, File> }).__droppedFiles = fileMap;

        onDropRef.current(fileNames, position);
      }
    };

    // Add listeners to document for global drag-drop
    document.addEventListener('dragenter', handleDragEnter, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    console.log('✅ [useFileDrop] HTML5 drag-drop listeners registered');

    return () => {
      document.removeEventListener('dragenter', handleDragEnter, true);
      document.removeEventListener('dragover', handleDragOver, true);
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, [enabled]);
}

/**
 * Utility to extract file information from a path or filename
 */
export function getFileInfoFromPath(filePath: string): {
  name: string;
  extension: string;
  type: 'file' | 'folder' | 'app';
} {
  const parts = filePath.split('/');
  const name = parts[parts.length - 1] || 'Unknown';
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : '';

  // Determine type
  let type: 'file' | 'folder' | 'app' = 'file';
  if (extension === 'app') {
    type = 'app';
  } else if (!extension && !name.includes('.')) {
    // No extension might be a folder (heuristic)
    type = 'folder';
  }

  return { name, extension, type };
}

/**
 * Get an appropriate icon for a file type
 */
export function getFileIcon(extension: string, type: 'file' | 'folder' | 'app'): string {
  if (type === 'folder') return '📁';
  if (type === 'app') return '📦';

  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📃',
    md: '📃',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
    svg: '🖼️',
    mp4: '🎬',
    mov: '🎬',
    avi: '🎬',
    mp3: '🎵',
    wav: '🎵',
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    js: '📜',
    ts: '📜',
    tsx: '📜',
    jsx: '📜',
    json: '📜',
    html: '🌐',
    css: '🎨',
  };

  return iconMap[extension] || '📄';
}

/**
 * Get a dropped File object by name
 */
export function getDroppedFile(fileName: string): File | undefined {
  const fileMap = (window as unknown as { __droppedFiles?: Map<string, File> }).__droppedFiles;
  return fileMap?.get(fileName);
}

export default useFileDrop;
