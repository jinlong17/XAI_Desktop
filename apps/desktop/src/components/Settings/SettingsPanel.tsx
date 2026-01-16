import { useMemo } from "react";
import { AnchorPosition } from "../AiAssistant/AiCube";
import { useSettings } from "../../context/SettingsContext";

const MOCK_DATA = [
  { label: "Opacity", range: "0.15 — 0.85", note: "Keep the desktop visible" },
  { label: "Glass Effect", range: "On/Off", note: "Toggle macOS vibrancy" },
  { label: "Plugin Slot", range: "Reserved", note: "Inject plugin controls here" },
];

export interface SettingsPanelProps {
  isOpen: boolean;
  anchorPosition: AnchorPosition;
  onCreateGrid?: (x: number, y: number) => void;
}

/**
 * ## SettingsPanel (Glass Card)
 *
 * Shows canvas controls next to the AI cube. This popover stays thin on purpose
 * so new plugin settings can slot in without restructuring the host.
 */
export function SettingsPanel({ isOpen, anchorPosition, onCreateGrid }: SettingsPanelProps) {
  const {
    cubeColor,
    cubeTextColor,
    cubeOpacity,
    cubeSize,
    cubeFontSize,
    gridOpacity,
    gridBlur,
    setCubeColor,
    setCubeTextColor,
    setCubeOpacity,
    setCubeSize,
    setCubeFontSize,
    setGridOpacity,
    setGridBlur,
  } = useSettings();
  const handleCreateGrid = (x: number, y: number) => {
    onCreateGrid?.(x, y);
  };

  const panelStyle = useMemo(() => {
    const yOffset = 80;
    const clampedX = Math.max(12, Math.min(window.innerWidth - 280, anchorPosition.x + 72));
    const clampedY = Math.max(12, Math.min(window.innerHeight - 220, anchorPosition.y + yOffset));
    return { left: clampedX, top: clampedY };
  }, [anchorPosition.x, anchorPosition.y]);

  if (!isOpen) return null;

  return (
    <div className="settings-panel" style={panelStyle} role="dialog" aria-label="AI Assistant Settings">
      <div className="settings-row" style={{ marginTop: 6 }}>
        <strong className="settings-label">AI Icon Settings</strong>
      </div>
      <div className="settings-row">
        <button
          type="button"
          onClick={() => {
            handleCreateGrid(64, 120);
          }}
          style={{
            pointerEvents: "auto",
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(15,23,42,0.7)",
            color: "#e7ecf3",
            cursor: "pointer",
          }}
        >
          + New Grid
        </button>
      </div>

      <div className="settings-row">
        <span className="settings-label">Theme Color</span>
        <input
          type="color"
          value={cubeColor}
          onChange={(event) => {
            const next = event.target.value;
            setCubeColor(next);
          }}
          aria-label="AI Cube Theme Color"
          style={{ width: 48, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }}
        />
      </div>

      <div className="settings-row">
        <span className="settings-label">Text Color</span>
        <input
          type="color"
          value={cubeTextColor}
          onChange={(event) => {
            const next = event.target.value;
            setCubeTextColor(next);
          }}
          aria-label="AI Cube Text Color"
          style={{ width: 48, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }}
        />
      </div>

      <div className="settings-row">
        <span className="settings-label">Opacity</span>
        <div className="settings-slider">
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={cubeOpacity}
            onChange={(event) => {
              const next = Number(event.target.value);
              setCubeOpacity(next);
            }}
            aria-label="AI Cube Opacity"
          />
        </div>
      </div>

      <div className="settings-row">
        <span className="settings-label">Icon Size</span>
        <div className="settings-slider">
          <input
            type="range"
            min={40}
            max={120}
            step={4}
            value={cubeSize}
            onChange={(event) => {
              const next = Number(event.target.value);
              setCubeSize(next);
            }}
            aria-label="AI Cube Size"
          />
        </div>
      </div>

      <div className="settings-row">
        <span className="settings-label">Text Size</span>
        <div className="settings-slider">
          <input
            type="range"
            min={12}
            max={60}
            step={2}
            value={cubeFontSize}
            onChange={(event) => {
              const next = Number(event.target.value);
              setCubeFontSize(next);
            }}
            aria-label="AI Cube Text Size"
          />
        </div>
      </div>

      <div className="settings-row" style={{ marginTop: 6 }}>
        <strong className="settings-label">Grid Box Settings</strong>
      </div>
      <div className="settings-row">
        <span className="settings-label">Background Opacity</span>
        <div className="settings-slider">
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={gridOpacity}
            onChange={(event) => {
              const next = Number(event.target.value);
              setGridOpacity(next);
            }}
            aria-label="Grid Box Background Opacity"
          />
        </div>
      </div>
      <div className="settings-row">
        <span className="settings-label">Frosted Glass</span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={gridBlur}
            onChange={(event) => {
              setGridBlur(event.target.checked);
            }}
            aria-label="Toggle grid blur"
          />
          <span>{gridBlur ? "On" : "Off"}</span>
        </label>
      </div>

      {/* Plugin teams: inject plugin-specific controls below. E.g., color pickers or timers. */}
      <div className="debug-note">
        {MOCK_DATA.map((item) => (
          <div key={item.label}>
            <strong>{item.label}:</strong> {item.note}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsPanel;
