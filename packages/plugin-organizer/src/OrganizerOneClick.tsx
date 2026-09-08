import { useMemo, useState } from "react";
import { getFileIcon, getFileInfoFromPath } from "./hooks/useFileDrop";
import { useAutoClassifier } from "./useAutoClassifier";
import type { DesktopItem, GridBox } from "./types";

export interface OrganizerOneClickProps {
  grids: GridBox[];
  onEnsureGrid(x: number, y: number, title?: string): string;
  onAddItem(item: DesktopItem, gridId: string): void;
}

const MOCK_DESKTOP_PATHS = [
  "/Users/me/Desktop/Notes.md",
  "/Users/me/Desktop/Screenshot.png",
  "/Users/me/Desktop/Prototype.app",
  "/Users/me/Desktop/Archive.zip",
];

function desktopItemFromPath(path: string, index: number): DesktopItem {
  const info = getFileInfoFromPath(path);
  return {
    id: `desktop-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    filename: info.name,
    filepath: path,
    type: info.type,
    icon: getFileIcon(info.extension, info.type),
    createdAt: Date.now(),
  };
}

export function OrganizerOneClick({ grids, onEnsureGrid, onAddItem }: OrganizerOneClickProps) {
  const [confirming, setConfirming] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const classifier = useAutoClassifier();
  const targetSummary = useMemo(() => `${MOCK_DESKTOP_PATHS.length} desktop items`, []);

  const run = () => {
    const fallbackGridId = grids[0]?.id ?? onEnsureGrid(72, 128, "Desktop");
    const scanned = MOCK_DESKTOP_PATHS.map(desktopItemFromPath);
    scanned.forEach((item) => {
      const gridId = classifier.classify(item, grids, fallbackGridId) ?? fallbackGridId;
      onAddItem(item, gridId);
    });
    setLastCount(scanned.length);
    setConfirming(false);
  };

  return (
    <div style={{ display: "inline-flex", gap: 8, pointerEvents: "auto" }}>
      <button type="button" onClick={() => setConfirming(true)} style={buttonStyle}>
        Organize Desktop
      </button>
      {lastCount > 0 ? <span style={statusStyle}>{lastCount} sorted</span> : null}
      {confirming ? (
        <div role="dialog" aria-modal="true" style={dialogStyle}>
          <div style={{ fontWeight: 700 }}>Organize {targetSummary}?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={run} style={buttonStyle}>Confirm</button>
            <button type="button" onClick={() => setConfirming(false)} style={buttonStyle}>Cancel</button>
          </div>
        </div>
      ) : null}
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

const statusStyle = {
  alignSelf: "center",
  color: "#d1fae5",
  fontSize: 12,
};

const dialogStyle = {
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 8,
  color: "#f8fafc",
  display: "grid",
  gap: 10,
  left: 0,
  padding: 12,
  position: "absolute" as const,
  top: 42,
  width: 220,
};
