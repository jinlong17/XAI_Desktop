/**
 * MarkdownMessage tests.
 */

import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownMessage } from "../MarkdownMessage.js";

describe("MarkdownMessage", () => {
  it("renders headings, lists, strong text, code, quotes, tables, and links", () => {
    render(
      <MarkdownMessage
        text={[
          "## Plan",
          "",
          "- **High** priority",
          "- Use `pnpm test`",
          "",
          "> Keep it focused",
          "",
          "| Task | Owner |",
          "| --- | --- |",
          "| Chat | Web |",
          "",
          "Open [docs](https://example.com).",
          "",
          "```ts",
          "const ok = true;",
          "```",
        ].join("\n")}
      />,
    );

    expect(screen.getByRole("heading", { name: "Plan" })).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("pnpm test")).toBeInTheDocument();
    expect(screen.getByText("Keep it focused")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("const ok = true;")).toBeInTheDocument();
  });
});
