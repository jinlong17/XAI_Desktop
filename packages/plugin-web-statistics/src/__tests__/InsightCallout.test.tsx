import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsightCallout } from "../InsightCallout.js";

describe("InsightCallout", () => {
  it("IC1: renders h4 + p with the supplied copy", () => {
    render(
      <InsightCallout
        copy="You're sharpest around 09:00, +8% vs last week."
        lang="en"
      />,
    );
    expect(screen.getByText(/sharpest around 09:00/)).toBeInTheDocument();
    expect(screen.getByText("This week's insight")).toBeInTheDocument();
  });

  it("IC2: empty copy still renders the panel", () => {
    const { container } = render(<InsightCallout copy="" lang="en" />);
    expect(container.querySelector(".stats-insight")).not.toBeNull();
  });
});
