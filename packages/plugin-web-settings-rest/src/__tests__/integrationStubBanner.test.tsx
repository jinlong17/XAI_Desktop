/**
 * SB1..SB2 — IntegrationStubBanner tests (test.md §5.3 P4)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegrationStubBanner } from "../internal/integrationStubBanner.js";

describe("IntegrationStubBanner", () => {
  it("SB1: renders with EN copy", () => {
    render(<IntegrationStubBanner lang="en" />);
    expect(
      screen.getByText(
        /Integrations are in v1 stub mode/i,
      ),
    ).toBeInTheDocument();
  });

  it("SB2: renders with ZH copy", () => {
    render(<IntegrationStubBanner lang="zh" />);
    expect(screen.getByText(/v1 演示模式/)).toBeInTheDocument();
  });
});
