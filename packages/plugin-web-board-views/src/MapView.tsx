/**
 * MapView — decorative SVG placeholder (verbatim port from module-board.jsx
 * lines 1056–1088). Renders a static dot-pattern map with 6 mock pins.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §7
 *
 * NOTE: BoardCard.location field does not yet exist in the schema.
 * This view stays a placeholder until the schema is extended in a future row.
 */

import type { Lang } from "./internal/i18n.js";

export interface MapViewProps {
  lang: Lang;
}

const PIN_POSITIONS: [number, number][] = [
  [120, 120],
  [280, 130],
  [420, 200],
  [520, 150],
  [200, 260],
  [380, 290],
];

export function MapView({ lang }: MapViewProps) {
  return (
    <div className="board-map panel" data-testid="board-map">
      <div className="bm-svg">
        <svg
          viewBox="0 0 600 360"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          data-testid="map-svg"
        >
          <defs>
            <pattern id="mapDots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="oklch(80% 0.04 165)" />
            </pattern>
          </defs>
          <rect width="600" height="360" fill="oklch(96% 0.02 165)" />
          <rect width="600" height="360" fill="url(#mapDots)" />
          <path
            d="M 50 200 Q 150 80 280 130 T 540 110"
            stroke="oklch(70% 0.06 165)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="3 6"
          />
          <path
            d="M 30 280 Q 200 240 350 280 T 580 250"
            stroke="oklch(70% 0.06 165)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="3 6"
          />
          {PIN_POSITIONS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="14" fill="var(--accent)" opacity={0.25} />
              <circle cx={x} cy={y} r="6" fill="var(--accent)" data-testid="map-pin" />
              <text
                x={x + 12}
                y={y - 4}
                fontSize="11"
                fill="var(--text-2)"
                fontWeight="600"
              >
                {`Pin ${i + 1}`}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="bm-overlay">
        <div className="bm-card" data-testid="map-overlay-card">
          <span className="bm-icon" aria-hidden="true">🌐</span>
          <h3>{lang === "zh" ? "地图视图" : "Map view"}</h3>
          <p data-testid="map-overlay-text">
            {lang === "zh"
              ? "将带地理位置的卡片可视化在地图上。给卡片设置地点字段后即可显示。"
              : "Visualize cards with locations on a map. Add a location field to your cards to populate it."}
          </p>
        </div>
      </div>
    </div>
  );
}
