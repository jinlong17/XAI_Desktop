/**
 * Component tests for MapView — MV1..MV3
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.8
 */

import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MapView } from "../MapView.js";

describe("MapView", () => {
  test("MV1 renders an SVG with 6 decorative pins", () => {
    render(<MapView lang="en" />);
    const pins = screen.getAllByTestId("map-pin");
    expect(pins).toHaveLength(6);
  });

  test("MV2 overlay card with explanatory text is visible", () => {
    render(<MapView lang="en" />);
    expect(screen.getByTestId("map-overlay-card")).toBeInTheDocument();
    expect(screen.getByTestId("map-overlay-text")).toBeInTheDocument();
  });

  test("MV3 bilingual: overlay text switches en to zh", () => {
    const { rerender } = render(<MapView lang="en" />);
    expect(screen.getByTestId("map-overlay-text").textContent).toContain(
      "Visualize cards",
    );
    rerender(<MapView lang="zh" />);
    // The p element shows the zh description; the h3 shows the zh title
    expect(screen.getByTestId("map-overlay-text").textContent).toContain(
      "地理位置",
    );
  });
});
