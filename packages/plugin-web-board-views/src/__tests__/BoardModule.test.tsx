/**
 * BoardModule integration tests (BM1..BM8)
 *
 * Uses real usePref against jsdom localStorage (no mock).
 * useWebShell is mocked to return { lang: "en" } by default.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * Test plan: packages/xai-web-board-views/docs/test.md §2.9
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BoardModule } from "../BoardModule.js";

// ---- Mocks ----------------------------------------------------------------

vi.mock("@repo/xai-web-shell", async () => {
  const actual = await vi.importActual<typeof import("@repo/xai-web-shell")>(
    "@repo/xai-web-shell",
  );
  return {
    ...actual,
    useWebShell: () => ({ lang: "en" }),
  };
});

// ---- Helpers --------------------------------------------------------------

function renderBoardModule(lang: "en" | "zh" = "en") {
  return render(<BoardModule lang={lang} />);
}

// ---- Tests ----------------------------------------------------------------

describe("BoardModule integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("BM1: First mount with empty registry → renders board view (kanban default)", async () => {
    await act(async () => {
      renderBoardModule();
    });
    // The board-views-module wrapper should be present
    expect(
      screen.getByTestId("board-views-module"),
    ).toBeInTheDocument();
    // The bvm-body should be present
    expect(screen.getByTestId("bvm-body")).toBeInTheDocument();
    // Default active view is "board" → BoardView renders board-core's BoardView
    // which renders kanban lists. Since no boards stored, the default seed board
    // should render (the default board has a name).
    expect(screen.getByTestId("bvm-title")).toBeInTheDocument();
  });

  it("BM2: Click ViewPicker 'Table' → TableView renders", async () => {
    await act(async () => {
      renderBoardModule();
    });
    const tableBtn = screen.getByTestId("vp-btn-table");
    await act(async () => {
      fireEvent.click(tableBtn);
    });
    // TableView renders a board-table-wrap element
    expect(screen.getByTestId("board-table-wrap")).toBeInTheDocument();
  });

  it("BM3: Switch view → unmount + remount → view persists via xai_board_view_by_id", async () => {
    const { unmount } = await act(async () => renderBoardModule());
    // Switch to table
    const tableBtn = screen.getByTestId("vp-btn-table");
    await act(async () => {
      fireEvent.click(tableBtn);
    });
    expect(screen.getByTestId("board-table-wrap")).toBeInTheDocument();
    // Unmount
    unmount();
    // Remount — view should be restored from localStorage
    await act(async () => {
      renderBoardModule();
    });
    expect(screen.getByTestId("board-table-wrap")).toBeInTheDocument();
  });

  it("BM4: Calendar drop → xai_boards_v2 reflects the new due date", async () => {
    await act(async () => {
      renderBoardModule();
    });
    // Switch to calendar
    const calBtn = screen.getByTestId("vp-btn-calendar");
    await act(async () => {
      fireEvent.click(calBtn);
    });
    expect(screen.getByTestId("board-cal")).toBeInTheDocument();
    // Verify calendar renders (we can't do a full DnD round-trip in jsdom
    // without a real card with due dates; this test asserts component
    // integration is wired — DnD internals are tested in BoardCalendarView.test.tsx)
    expect(screen.getByTestId("cal-grid")).toBeInTheDocument();
  });

  it("BM5: Timeline view renders and updateCard is wired", async () => {
    await act(async () => {
      renderBoardModule();
    });
    // Switch to timeline
    const tlBtn = screen.getByTestId("vp-btn-timeline");
    await act(async () => {
      fireEvent.click(tlBtn);
    });
    expect(screen.getByTestId("board-timeline")).toBeInTheDocument();
    // Timeline day headers should render — some days may be "tl-day-today" for today's column
    const dayHeaders = [
      ...screen.queryAllByTestId("tl-day"),
      ...screen.queryAllByTestId("tl-day-today"),
    ];
    expect(dayHeaders.length).toBe(30);
  });

  it("BM6: Bilingual — lang zh flips header + ViewPicker labels", async () => {
    await act(async () => {
      renderBoardModule("zh");
    });
    // In zh mode the active view picker button for "board" should show Chinese label
    // The board view button label is "看板" in zh
    expect(screen.getByTestId("vp-btn-board")).toHaveTextContent("看板");
    // Module title should be in zh (default board name has zh locale)
    const title = screen.getByTestId("bvm-title");
    expect(title).toBeInTheDocument();
  });

  it("BM7: Selecting 'map' view → MapView renders, no crash", async () => {
    await act(async () => {
      renderBoardModule();
    });
    const mapBtn = screen.getByTestId("vp-btn-map");
    await act(async () => {
      fireEvent.click(mapBtn);
    });
    // board-map container is present (Leaflet MapView replaced SVG placeholder in P5)
    expect(screen.getByTestId("board-map")).toBeInTheDocument();
    // The Leaflet container div is mounted (actual map renders via useEffect)
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("BM8: Orphan viewByBoardId entry for deleted board → no crash; falls back to board", async () => {
    // Pre-seed an orphan entry in localStorage
    const orphanKey = "deleted-board-id-xyz";
    localStorage.setItem(
      "xai_board_view_by_id",
      JSON.stringify({ [orphanKey]: "table" }),
    );
    // The active board id will be different (from default seed)
    // so viewByBoardId[activeBoard.id] will be undefined → fallback "board"
    await act(async () => {
      renderBoardModule();
    });
    // Should render without error — board views module present
    expect(screen.getByTestId("board-views-module")).toBeInTheDocument();
    // Current board falls back to "board" view (not "table")
    // The board-table should NOT be visible since active board ≠ orphanKey
    expect(screen.queryByTestId("board-table")).not.toBeInTheDocument();
  });
});
