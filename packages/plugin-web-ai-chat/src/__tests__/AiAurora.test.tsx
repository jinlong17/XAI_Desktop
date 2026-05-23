/**
 * AiAurora component tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — AA
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AiAurora } from "../AiAurora.js";
import { getStarInstances } from "../internal/starInstances.js";

describe("AiAurora (AA)", () => {
  it("AA1: renders the wrapper with class ai-aurora and no thinking modifier", () => {
    const { container } = render(<AiAurora thinking={false} />);
    const root = container.querySelector(".ai-aurora");
    expect(root).not.toBeNull();
    expect(root?.className).toBe("ai-aurora");
  });

  it("AA2: adds .thinking modifier class when thinking=true", () => {
    const { container } = render(<AiAurora thinking={true} />);
    const root = container.querySelector(".ai-aurora");
    expect(root?.className).toBe("ai-aurora thinking");
  });

  it("AA3: contains 3 aurora-stream and 5 aurora-blob elements", () => {
    const { container } = render(<AiAurora thinking={false} />);
    expect(container.querySelectorAll(".aurora-stream").length).toBe(3);
    expect(container.querySelectorAll(".aurora-blob").length).toBe(5);
    expect(container.querySelector(".as-1")).not.toBeNull();
    expect(container.querySelector(".as-2")).not.toBeNull();
    expect(container.querySelector(".as-3")).not.toBeNull();
    expect(container.querySelector(".ab-1")).not.toBeNull();
    expect(container.querySelector(".ab-5")).not.toBeNull();
  });

  it("AA4: contains exactly 60 .star children inside .ai-stars", () => {
    const { container } = render(<AiAurora thinking={false} />);
    const stars = container.querySelector(".ai-stars");
    expect(stars).not.toBeNull();
    expect(container.querySelectorAll(".ai-stars > .star").length).toBe(60);
  });

  it("AA5: contains an .ai-grain element", () => {
    const { container } = render(<AiAurora thinking={false} />);
    expect(container.querySelector(".ai-grain")).not.toBeNull();
  });

  it("AA6: star inline styles match getStarInstances() for first 5 entries", () => {
    const { container } = render(<AiAurora thinking={false} />);
    const stars = container.querySelectorAll<HTMLElement>(".ai-stars > .star");
    const golden = getStarInstances();
    for (let i = 0; i < 5; i += 1) {
      const el = stars[i];
      const g = golden[i];
      expect(el).toBeDefined();
      expect(g).toBeDefined();
      expect(el?.style.left).toBe(g?.left);
      expect(el?.style.top).toBe(g?.top);
      expect(el?.style.animationDelay).toBe(g?.animationDelay);
      expect(el?.style.animationDuration).toBe(g?.animationDuration);
    }
  });
});
