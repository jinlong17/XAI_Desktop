import { useCallback, useEffect, useRef, useState } from "react";
import { getFileIcon, getFileInfoFromPath } from "./useFileDrop";
import type { DesktopItem } from "../types";

export interface FolderMappingSnapshot {
  folderPath: string;
  gridId: string;
  items: DesktopItem[];
  updatedAt: string;
}

function mockListFolder(folderPath: string): DesktopItem[] {
  const normalized = folderPath.replace(/\/+$/, "");
  const names = ["Notes.md", "Images", "Sprint.pdf"];
  return names.map((name, index) => {
    const path = `${normalized}/${name}`;
    const info = getFileInfoFromPath(path);
    return {
      id: `folder-map-${btoa(path).replace(/=+$/, "")}`,
      filename: info.name,
      filepath: path,
      type: info.type,
      icon: getFileIcon(info.extension, info.type),
      createdAt: Date.now() + index,
    };
  });
}

export function useFolderMapping(onSnapshot: (snapshot: FolderMappingSnapshot) => void) {
  const [active, setActive] = useState<FolderMappingSnapshot | null>(null);
  const callbackRef = useRef(onSnapshot);

  useEffect(() => {
    callbackRef.current = onSnapshot;
  }, [onSnapshot]);

  const startMapping = useCallback((folderPath: string, gridId: string) => {
    const snapshot: FolderMappingSnapshot = {
      folderPath,
      gridId,
      items: mockListFolder(folderPath),
      updatedAt: new Date().toISOString(),
    };
    setActive(snapshot);
    callbackRef.current(snapshot);
  }, []);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      const snapshot = {
        ...active,
        items: mockListFolder(active.folderPath),
        updatedAt: new Date().toISOString(),
      };
      setActive(snapshot);
      callbackRef.current(snapshot);
    }, 10_000);
    return () => window.clearInterval(interval);
  }, [active]);

  return {
    active,
    startMapping,
    stopMapping: () => setActive(null),
  };
}
