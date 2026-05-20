import { useState } from "react";
import { useFolderMapping } from "./hooks/useFolderMapping";
import type { DesktopItem, GridBox } from "./types";

export interface FolderGridProps {
  grids: GridBox[];
  onEnsureGrid(x: number, y: number, title?: string): string;
  onAddItem(item: DesktopItem, gridId: string): void;
}

export function FolderGrid({ grids, onEnsureGrid, onAddItem }: FolderGridProps) {
  const [folderPath, setFolderPath] = useState("~/Desktop");
  const mapping = useFolderMapping((snapshot) => {
    snapshot.items.forEach((item) => onAddItem(item, snapshot.gridId));
  });

  const start = () => {
    const gridId = grids[0]?.id ?? onEnsureGrid(96, 160, "Folder");
    mapping.startMapping(folderPath.replace(/^~/, "/Users/me"), gridId);
  };

  return (
    <div style={{ display: "inline-flex", gap: 8, pointerEvents: "auto" }}>
      <input
        aria-label="Folder path"
        value={folderPath}
        onChange={(event) => setFolderPath(event.target.value)}
        style={{ borderRadius: 8, border: "1px solid #475569", fontSize: 12, padding: "7px 8px", width: 180 }}
      />
      <button type="button" onClick={start} style={buttonStyle}>
        Map Folder
      </button>
      {mapping.active ? <button type="button" onClick={mapping.stopMapping} style={buttonStyle}>Stop</button> : null}
    </div>
  );
}

const buttonStyle = {
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 8,
  background: "rgba(15,23,42,0.88)",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: 12,
  padding: "7px 10px",
};
