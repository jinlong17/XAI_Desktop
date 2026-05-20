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
   * Deprecated parameter kept for backwards compatibility. The hook
   * NO LONGER calls `registerBookmark` itself.
   *
   * Why: `useFileDrop` is mounted on the click-through transparent
   * `main` window which cannot receive native drag-drop (AppKit's
   * `setIgnoresMouseEvents_(YES)` routes the drag session to whatever
   * window is behind us, e.g. Finder). The HTML5 fallback this hook
   * uses NEVER produces absolute filesystem paths — browsers only
   * surface `File.name` (basename) for security. Passing those
   * basenames to `register_path_bookmark` deterministically fails the
   * Rust-side `validate_user_path` lexical check (basenames are not
   * absolute), so the hook's previous bookmark wiring was a no-op
   * that masqueraded as honest provenance.
   *
   * Honest bookmark registration is performed in
   * `OrganizerGridContent.handleFileDrop`, which is mounted on `grid_*`
   * windows and receives the Tauri `tauri://drag-drop` event with real
   * `paths: string[]`. See
   * `docs/workflow/roadmap/codex-reviews/p0-foxtrot-native-dnd/SPIKE-FINDINGS.md`
   * for the full rationale.
   *
   * Callers that still pass this prop will see it accepted-but-ignored.
   * Remove the prop in a follow-up cleanup PR.
   *
   * @deprecated since P0-Foxtrot — bookmark registration moved to
   *   `OrganizerGridContent`. This field is accepted but never used.
   */
  finderClient?: FinderClient;
}

/**
 * `useFileDrop` — HTML5 drag-over visual indicator for the click-through
 * `main` window.
 *
 * SCOPE (post P0-Foxtrot):
 * - Visual-only. The hook listens to HTML5 `dragenter` / `dragover` /
 *   `dragleave` / `drop` events to drive the dashed-outline animation
 *   on the `main` window's desktop overlay.
 * - The `onDrop` callback fires with the HTML5 `File.name` basenames
 *   (not absolute paths), preserved only to keep existing legacy code
 *   compiling. Any caller that treats `onDrop` output as filesystem
 *   paths is wrong.
 *
 * REAL PATHS COME FROM ELSEWHERE:
 * - `grid_*` windows have native Tauri DnD enabled by default and
 *   receive `tauri://drag-drop` with absolute `paths: string[]`.
 *   `OrganizerGridContent` listens to that event and registers each
 *   path with the Rust `BookmarkRegistry` via `register_path_bookmark`
 *   before forwarding the drop cross-window.
 * - The `main` window CANNOT receive native drag-drop because it is
 *   click-through (`setIgnoresMouseEvents_(YES)` on macOS). HTML5 drops
 *   inside its WebView surface produce only basenames.
 *
 * EVENTS DRIVEN:
 * - dragenter: Files have entered the window area
 * - dragover: Files are being dragged over the window (with position)
 * - drop: Files were dropped (with File objects and position) — basenames only
 * - dragleave: Drag operation cancelled or files left window
 */
export function useFileDrop({ onDrop, onHover, onEnter, onLeave, enabled = true, finderClient: _deprecatedFinderClient }: UseFileDropOptions) {
  // Acknowledge the deprecated prop to silence the unused-var lint
  // without emitting it into the runtime path. The hook intentionally
  // does NOT call `_deprecatedFinderClient.registerBookmark(...)` —
  // see the JSDoc on `finderClient` for the full rationale.
  void _deprecatedFinderClient;
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
        // HTML5 API only exposes basenames (not absolute paths) for
        // security reasons. These are NOT honest path provenance — the
        // grid window's `tauri://drag-drop` event is.
        const fileNames = Array.from(files).map(f => f.name);
        const position = { x: e.clientX, y: e.clientY };

        console.log('📂 [useFileDrop] Files dropped (basenames only):', fileNames, 'at', position);

        // Preserve legacy File-object cache so existing organizer logic
        // that maps the basename back to a File handle keeps working.
        const fileMap = (window as unknown as { __droppedFiles?: Map<string, File> }).__droppedFiles || new Map<string, File>();
        Array.from(files).forEach(file => {
          fileMap.set(file.name, file);
        });
        (window as unknown as { __droppedFiles: Map<string, File> }).__droppedFiles = fileMap;

        onDropRef.current(fileNames, position);

        // No bookmark registration here. See `finderClient` JSDoc and
        // `OrganizerGridContent.handleFileDrop` for where honest
        // provenance is recorded.
      }
    };

    // Add listeners to document for global drag-drop
    document.addEventListener('dragenter', handleDragEnter, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    console.log('✅ [useFileDrop] HTML5 drag-drop listeners registered (visual-only on `main`)');

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
