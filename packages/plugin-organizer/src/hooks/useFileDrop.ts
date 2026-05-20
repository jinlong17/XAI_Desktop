import { useEffect, useRef } from 'react';

import type { FinderClient } from '../finderClient';

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
  /**
   * Optional Finder client used to register a user-authorized path
   * bookmark for every dropped path (G3-E3 P0 — honest provenance).
   *
   * When omitted, the hook logs a warning once and skips bookmark
   * registration; subsequent `reveal_in_finder` / `open_path` calls
   * for those paths will be rejected by the Rust side with
   * `E3004 sync capability denied — no user-authorized bookmark`.
   *
   * Production callers SHOULD pass a `FinderClient` built via
   * `createFinderClient(invoke)`. The optionality exists so existing
   * unit tests that exercise the drag-drop event plumbing without a
   * Tauri bridge keep working without modification.
   *
   * TODO: extend the hook to also register paths surfaced by a
   * user-initiated `Open…` panel (not in scope for this PR).
   */
  finderClient?: FinderClient;
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
export function useFileDrop({ onDrop, onHover, onEnter, onLeave, enabled = true, finderClient }: UseFileDropOptions) {
  const onDropRef = useRef(onDrop);
  const onHoverRef = useRef(onHover);
  const onEnterRef = useRef(onEnter);
  const onLeaveRef = useRef(onLeave);
  const finderClientRef = useRef(finderClient);
  const finderClientMissingWarnedRef = useRef(false);
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

  useEffect(() => {
    finderClientRef.current = finderClient;
  }, [finderClient]);

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

        // G3-E3 P0: register every dropped path as a user-authorized
        // bookmark so subsequent reveal_in_finder / open_path calls are
        // admitted by the Rust side. We fire-and-forget per path —
        // individual failures (validator rejection, IPC down) are
        // logged and do NOT abort the drop UX.
        const client = finderClientRef.current;
        if (client) {
          for (const path of fileNames) {
            void client.registerBookmark(path).catch((err: unknown) => {
              console.warn(
                '[useFileDrop] register_path_bookmark failed for',
                path,
                err,
              );
            });
          }
        } else if (!finderClientMissingWarnedRef.current) {
          finderClientMissingWarnedRef.current = true;
          console.warn(
            '[useFileDrop] no finderClient provided; reveal_in_finder / open_path will be rejected with E3004 until paths are bookmarked',
          );
        }
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
