/**
 * AC-FB-1..AC-FB-3 (test.md §A4).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisabledFeatureFallback } from "../DisabledFeatureFallback.js";

describe("DisabledFeatureFallback", () => {
  it("AC-FB-1: renders module name + body copy + CTA hint", () => {
    render(<DisabledFeatureFallback moduleId="board" lang="en" />);
    expect(screen.getByText("Boards")).toBeInTheDocument();
    expect(screen.getByTestId("dff-title")).toHaveTextContent(/turned off/i);
    expect(screen.getByTestId("dff-body")).toHaveTextContent(/Re-enable/i);
  });

  it("AC-FB-2: bilingual — ZH variant", () => {
    render(<DisabledFeatureFallback moduleId="board" lang="zh" />);
    expect(screen.getByText("项目板")).toBeInTheDocument();
    expect(screen.getByTestId("dff-title")).toHaveTextContent("此模块已关闭");
    expect(screen.getByTestId("dff-body")).toHaveTextContent("设置 → 功能");
  });

  it("AC-FB-3: unknown moduleId warns in DEV and falls back to generic copy", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Cast through unknown — the runtime guard handles the bad input.
    render(
      <DisabledFeatureFallback
        moduleId={"bogus" as unknown as "board"}
        lang="en"
      />,
    );
    expect(warnSpy).toHaveBeenCalled();
    // "this module" generic copy renders.
    expect(screen.getByText("this module")).toBeInTheDocument();
    warnSpy.mockRestore();
  });
});
