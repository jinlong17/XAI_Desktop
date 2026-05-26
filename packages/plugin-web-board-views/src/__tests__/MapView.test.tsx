/**
 * MapView tests — MAP-1..MAP-15
 * Gap-closure row #6 P5 REWRITE (replaces MV1..MV3 SVG placeholder tests)
 *
 * Strategy:
 * - Mock leafletLoader so tests never load real Leaflet.
 * - Spy on L.map, L.tileLayer, L.marker, L.latLngBounds to assert API calls.
 * - MapView directly imports the real component (bypasses React.lazy in index).
 */

import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { MapView } from "../MapView.js";
import type { BoardListData } from "@repo/plugin-web-board-core";

// ---- Leaflet mock (factory uses only vi.fn() — no outer variable references) ----
// vi.mock is hoisted; cannot reference module-level variables inside the factory.

vi.mock("../internal/leafletLoader.js", () => {
  const mockMarkerBindPopup = vi.fn().mockReturnThis();
  const mockMarkerAddTo = vi.fn().mockReturnThis();
  const mockMarkerOn = vi.fn();
  const mockMarkerRemove = vi.fn();

  const mockTileLayerAddTo = vi.fn().mockReturnThis();
  const mockTileLayer = { addTo: mockTileLayerAddTo };

  const mockMapSetView = vi.fn().mockReturnThis();
  const mockMapFitBounds = vi.fn().mockReturnThis();
  const mockMapRemove = vi.fn();

  const makeMarker = () => {
    const m = {
      on: mockMarkerOn,
      bindPopup: mockMarkerBindPopup,
      addTo: mockMarkerAddTo,
      remove: mockMarkerRemove,
    };
    mockMarkerBindPopup.mockReturnValue(m);
    mockMarkerAddTo.mockReturnValue(m);
    return m;
  };

  const makeMap = () => ({
    setView: mockMapSetView,
    fitBounds: mockMapFitBounds,
    remove: mockMapRemove,
  });

  const L = {
    map: vi.fn().mockImplementation(() => makeMap()),
    tileLayer: vi.fn().mockReturnValue(mockTileLayer),
    marker: vi.fn().mockImplementation(() => makeMarker()),
    latLngBounds: vi.fn().mockImplementation(() => ({ _isBounds: true })),
  };

  return {
    loadLeaflet: vi.fn().mockResolvedValue(L),
    _resetLeafletCache: vi.fn(),
    // Expose L so tests can inspect it
    __L: L,
    __mocks: {
      mapSetView: mockMapSetView,
      mapFitBounds: mockMapFitBounds,
      mapRemove: mockMapRemove,
      markerOn: mockMarkerOn,
      markerBindPopup: mockMarkerBindPopup,
      markerAddTo: mockMarkerAddTo,
    },
  };
});

// Import the mocked module to access exposed spies
import * as LeafletLoader from "../internal/leafletLoader.js";

// Type cast to access the exposed test helpers
const mockModule = LeafletLoader as unknown as {
  __L: {
    map: Mock;
    tileLayer: Mock;
    marker: Mock;
    latLngBounds: Mock;
  };
  __mocks: {
    mapSetView: Mock;
    mapFitBounds: Mock;
    mapRemove: Mock;
    markerOn: Mock;
    markerBindPopup: Mock;
    markerAddTo: Mock;
  };
};

// ---- Fixtures ---------------------------------------------------------------

const LIST_WITH_LOCATIONS: BoardListData = {
  id: "l-1",
  title: "Test List",
  color: null,
  cards: [
    {
      id: "c-1",
      title: "Tokyo",
      location: { lat: 35.6762, lng: 139.6503, label: "Tokyo HQ" },
      labels: [],
      members: [],
      checklist: [],
      dueDate: null,
    },
    {
      id: "c-2",
      title: "London",
      location: { lat: 51.5074, lng: -0.1278 },
      labels: [],
      members: [],
      checklist: [],
      dueDate: null,
    },
  ],
};

const LIST_WITHOUT_LOCATIONS: BoardListData = {
  id: "l-2",
  title: "No location",
  color: null,
  cards: [
    {
      id: "c-3",
      title: "No location card",
      labels: [],
      members: [],
      checklist: [],
      dueDate: null,
    },
  ],
};

// ---- Tests ------------------------------------------------------------------

describe("MapView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-configure L mock to return fresh map/marker instances on each test
    mockModule.__L.map.mockImplementation(() => ({
      setView: mockModule.__mocks.mapSetView,
      fitBounds: mockModule.__mocks.mapFitBounds,
      remove: mockModule.__mocks.mapRemove,
    }));
    mockModule.__L.tileLayer.mockReturnValue({ addTo: vi.fn().mockReturnThis() });
    mockModule.__L.marker.mockImplementation(() => ({
      on: mockModule.__mocks.markerOn,
      bindPopup: mockModule.__mocks.markerBindPopup.mockReturnThis(),
      addTo: mockModule.__mocks.markerAddTo.mockReturnThis(),
    }));
    mockModule.__L.latLngBounds.mockImplementation(() => ({ _isBounds: true }));
    (LeafletLoader.loadLeaflet as Mock).mockResolvedValue(mockModule.__L);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- Mount / DOM ---

  test("MAP-1 mounts outer panel container with data-testid='board-map'", async () => {
    render(<MapView lang="en" />);
    expect(screen.getByTestId("board-map")).toBeInTheDocument();
  });

  test("MAP-2 renders map-container div for Leaflet to attach to", async () => {
    render(<MapView lang="en" />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  test("MAP-3 shows loading indicator before Leaflet resolves", () => {
    render(<MapView lang="en" />);
    expect(screen.getByTestId("map-loading")).toBeInTheDocument();
  });

  // --- Leaflet init ---

  test("MAP-4 calls L.map() on the container element", async () => {
    render(<MapView lang="en" />);
    await act(async () => { await Promise.resolve(); });
    expect(mockModule.__L.map).toHaveBeenCalledOnce();
    const firstArg = mockModule.__L.map.mock.calls[0]![0];
    expect(firstArg instanceof HTMLElement).toBe(true);
  });

  test("MAP-5 calls L.tileLayer with OSM URL + attribution", async () => {
    render(<MapView lang="en" />);
    await act(async () => { await Promise.resolve(); });
    expect(mockModule.__L.tileLayer).toHaveBeenCalledOnce();
    const url = mockModule.__L.tileLayer.mock.calls[0]![0] as string;
    expect(url).toContain("tile.openstreetmap.org");
    const opts = mockModule.__L.tileLayer.mock.calls[0]![1] as Record<string, unknown>;
    expect(opts.attribution).toContain("OpenStreetMap");
  });

  // --- Pins ---

  test("MAP-6 creates one marker per card with a valid location", async () => {
    render(<MapView lang="en" lists={[LIST_WITH_LOCATIONS]} />);
    await act(async () => { await Promise.resolve(); });
    // LIST_WITH_LOCATIONS has 2 located cards
    expect(mockModule.__L.marker).toHaveBeenCalledTimes(2);
  });

  test("MAP-7 marker for first pin uses correct lat/lng", async () => {
    render(<MapView lang="en" lists={[LIST_WITH_LOCATIONS]} />);
    await act(async () => { await Promise.resolve(); });
    const firstCall = mockModule.__L.marker.mock.calls[0]![0] as [number, number];
    expect(firstCall[0]).toBeCloseTo(35.6762, 3);
    expect(firstCall[1]).toBeCloseTo(139.6503, 3);
  });

  test("MAP-8 marker popup content includes card title + label when present", async () => {
    render(<MapView lang="en" lists={[LIST_WITH_LOCATIONS]} />);
    await act(async () => { await Promise.resolve(); });
    const firstPopupContent = mockModule.__mocks.markerBindPopup.mock.calls[0]![0] as string;
    expect(firstPopupContent).toContain("Tokyo");
    expect(firstPopupContent).toContain("Tokyo HQ");
  });

  test("MAP-9 marker popup for pin without label omits label span", async () => {
    render(<MapView lang="en" lists={[LIST_WITH_LOCATIONS]} />);
    await act(async () => { await Promise.resolve(); });
    const secondPopupContent = mockModule.__mocks.markerBindPopup.mock.calls[1]![0] as string;
    expect(secondPopupContent).toContain("London");
    expect(secondPopupContent).not.toContain("<span>");
  });

  test("MAP-10 onSelectCard callback fires on marker click", async () => {
    const onSelect = vi.fn();
    render(<MapView lang="en" lists={[LIST_WITH_LOCATIONS]} onSelectCard={onSelect} />);
    await act(async () => { await Promise.resolve(); });
    // Get the 'click' handler registered on the first marker
    const clickCall = mockModule.__mocks.markerOn.mock.calls.find((c: unknown[]) => c[0] === "click");
    expect(clickCall).toBeDefined();
    act(() => { (clickCall![1] as () => void)(); });
    expect(onSelect).toHaveBeenCalledWith("c-1", "l-1");
  });

  // --- Bounds / view ---

  test("MAP-11 with 2+ pins calls fitBounds (not setView)", async () => {
    render(<MapView lang="en" lists={[LIST_WITH_LOCATIONS]} />);
    await act(async () => { await Promise.resolve(); });
    expect(mockModule.__mocks.mapFitBounds).toHaveBeenCalledOnce();
    expect(mockModule.__mocks.mapSetView).not.toHaveBeenCalled();
  });

  test("MAP-12 with exactly 1 pin calls setView at PIN_ZOOM=12", async () => {
    const singlePinList: BoardListData = {
      ...LIST_WITH_LOCATIONS,
      cards: [LIST_WITH_LOCATIONS.cards[0]!],
    };
    render(<MapView lang="en" lists={[singlePinList]} />);
    await act(async () => { await Promise.resolve(); });
    expect(mockModule.__mocks.mapSetView).toHaveBeenCalledOnce();
    const zoom = mockModule.__mocks.mapSetView.mock.calls[0]![1];
    expect(zoom).toBe(12);
    expect(mockModule.__mocks.mapFitBounds).not.toHaveBeenCalled();
  });

  test("MAP-13 with no pins calls setView at DEFAULT_ZOOM=2", async () => {
    render(<MapView lang="en" lists={[LIST_WITHOUT_LOCATIONS]} />);
    await act(async () => { await Promise.resolve(); });
    expect(mockModule.__mocks.mapSetView).toHaveBeenCalledOnce();
    const zoom = mockModule.__mocks.mapSetView.mock.calls[0]![1];
    expect(zoom).toBe(2);
    expect(mockModule.__L.marker).not.toHaveBeenCalled();
  });

  // --- Empty state (HC4) ---

  test("MAP-14 empty-state overlay appears when no valid location pins", async () => {
    render(<MapView lang="en" lists={[LIST_WITHOUT_LOCATIONS]} />);
    await waitFor(() => {
      expect(screen.getByTestId("map-empty-state")).toBeInTheDocument();
    });
    expect(screen.getByTestId("map-empty-heading")).toBeInTheDocument();
    expect(screen.getByTestId("map-empty-body")).toBeInTheDocument();
  });

  // --- Bilingual ---

  test("MAP-15 bilingual zh: empty-state heading and body show Chinese text", async () => {
    render(<MapView lang="zh" lists={[]} />);
    await waitFor(() => {
      expect(screen.getByTestId("map-empty-state")).toBeInTheDocument();
    });
    expect(screen.getByTestId("map-empty-heading").textContent).toBe("没有位置标记");
    expect(screen.getByTestId("map-empty-body").textContent).toContain("位置字段");
  });
});
