/**
 * MapView — real Leaflet map with OSM tiles + card location pins.
 *
 * Gap-closure row #6 P5 REWRITE (replaces SVG placeholder from row #8).
 *
 * Behaviour:
 * - Mounts an L.map on a container <div> via useEffect.
 * - Adds an OSM tile layer (https://tile.openstreetmap.org/{z}/{x}/{y}.png).
 * - Iterates cards in `lists`; renders an L.marker for each card whose
 *   `location` field passes isValidLocation().
 * - Popup content = card title + optional location label.
 * - If no cards have valid locations → renders empty-state overlay (no error).
 * - Calls onSelectCard(cardId, listId) when a marker is clicked.
 * - Cleans up map + markers on unmount.
 *
 * HC5: lazy-loaded via React.lazy in index.ts.
 * HC6: OSM tile origin must be present in connect-src + img-src (ADR-0008 §S3 D3).
 * HC4: cards without location → empty-state, NOT error.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §7 + §S15.4
 */

import { useEffect, useRef, useState } from "react";
import type { BoardListData } from "@repo/plugin-web-board-core";
import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import type { Lang } from "./internal/i18n.js";
import { isValidLocation } from "./internal/location.js";
import { loadLeaflet } from "./internal/leafletLoader.js";

const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const DEFAULT_LAT = 35.6762;
const DEFAULT_LNG = 139.6503;
const DEFAULT_ZOOM = 2;
const PIN_ZOOM = 12;

export interface MapViewProps {
  lang: Lang;
  /** Board lists whose cards may have optional location. */
  lists?: readonly BoardListData[];
  /** Callback when a pin is clicked. */
  onSelectCard?: (cardId: string, listId: string) => void;
}

interface PinData {
  cardId: string;
  listId: string;
  lat: number;
  lng: number;
  title: string;
  label?: string;
}

function extractPins(lists: readonly BoardListData[]): PinData[] {
  const pins: PinData[] = [];
  for (const list of lists) {
    for (const card of list.cards) {
      if (card.location && isValidLocation(card.location)) {
        pins.push({
          cardId: card.id,
          listId: list.id,
          lat: card.location.lat,
          lng: card.location.lng,
          title: typeof card.title === "string" ? card.title : (card.title as { en: string; zh: string }).en ?? String(card.title),
          label: card.location.label,
        });
      }
    }
  }
  return pins;
}

const STR = {
  emptyHeading: { en: "No location pins", zh: "没有位置标记" },
  emptyBody: {
    en: "Cards with a location field will appear as pins on the map.",
    zh: "为卡片添加位置字段后，它们会在地图上显示为图钉。",
  },
  loadingText: { en: "Loading map…", zh: "加载地图中…" },
  offlineHeading: { en: "Map unavailable offline", zh: "离线模式下地图不可用" },
  offlineBody: {
    en: "Desktop offline mode does not load online map tiles.",
    zh: "桌面离线模式不会加载在线地图瓦片。",
  },
};

export function MapView({ lang, lists = [], onSelectCard }: MapViewProps) {
  const runtimeProfile = resolveWebRuntimeProfile(
    import.meta.env as Record<string, string | undefined>,
  );
  const isDesktopOfflineRuntime =
    isDesktopPhase1OfflineRuntime(runtimeProfile);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const pins = extractPins(lists);
  const hasPins = pins.length > 0;

  useEffect(() => {
    if (isDesktopOfflineRuntime) {
      return;
    }
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;

        // Prevent double-init if effect runs twice (React strict mode)
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(containerRef.current!, {
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer(OSM_TILE_URL, {
          attribution: OSM_ATTRIBUTION,
          maxZoom: 19,
        }).addTo(map);

        const markers: import("leaflet").Marker[] = [];

        if (hasPins) {
          const latlngs: [number, number][] = [];
          for (const pin of pins) {
            const marker = L.marker([pin.lat, pin.lng]);
            const popupContent =
              `<strong>${pin.title}</strong>` +
              (pin.label ? `<br/><span>${pin.label}</span>` : "");
            marker.bindPopup(popupContent);
            marker.on("click", () => {
              onSelectCard?.(pin.cardId, pin.listId);
            });
            marker.addTo(map);
            markers.push(marker);
            latlngs.push([pin.lat, pin.lng]);
          }

          if (latlngs.length === 1) {
            map.setView(latlngs[0]!, PIN_ZOOM);
          } else {
            map.fitBounds(L.latLngBounds(latlngs), { padding: [32, 32] });
          }
        } else {
          map.setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
        }

        mapRef.current = map;
        if (!cancelled) setIsReady(true);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(String(err));
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setIsReady(false);
    };
  // Only re-run if the serialised pins change or onSelectCard changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pins), isDesktopOfflineRuntime, onSelectCard]);

  if (isDesktopOfflineRuntime) {
    return (
      <div className="board-map panel" data-testid="board-map">
        <div className="bm-empty-state" data-testid="map-offline-state">
          <span className="bm-icon" aria-hidden="true">🌐</span>
          <h3>{STR.offlineHeading[lang]}</h3>
          <p>{STR.offlineBody[lang]}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="board-map panel" data-testid="board-map">
        <div className="bm-empty-state" data-testid="map-empty-state">
          <span aria-hidden="true">⚠️</span>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board-map panel" data-testid="board-map">
      {/* Leaflet container — must have explicit height via CSS */}
      <div
        ref={containerRef}
        className="bm-leaflet-container"
        data-testid="map-container"
        style={{ width: "100%", height: "100%", minHeight: 320 }}
      />

      {/* Loading indicator until Leaflet is ready */}
      {!isReady && (
        <div className="bm-loading" data-testid="map-loading">
          {STR.loadingText[lang]}
        </div>
      )}

      {/* Empty-state overlay — shown on top of the (blank) map when no pins */}
      {isReady && !hasPins && (
        <div className="bm-empty-state" data-testid="map-empty-state">
          <span className="bm-icon" aria-hidden="true">🌐</span>
          <h3 data-testid="map-empty-heading">{STR.emptyHeading[lang]}</h3>
          <p data-testid="map-empty-body">{STR.emptyBody[lang]}</p>
        </div>
      )}
    </div>
  );
}
