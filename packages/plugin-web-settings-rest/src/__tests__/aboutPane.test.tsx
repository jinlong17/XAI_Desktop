/**
 * AB1..AB6 — aboutPane tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const state = vi.hoisted(() => ({
  snapshot: {
    channel: "disabled" as const,
    currentVersion: "1.0.0-rc.1",
    availability: "disabled" as const,
    reasonCode: "channel_disabled" as const,
  },
  check: vi.fn(async () => undefined),
}));

vi.mock("@repo/desktop-auto-update-release-channel/web", () => ({
  useDesktopUpdaterSnapshot: () => state.snapshot,
  useDesktopUpdaterActions: () => ({ check: state.check }),
}));

import { aboutPane } from "../panes/aboutPane.js";

describe("aboutPane", () => {
  beforeEach(() => {
    state.check.mockReset();
    state.snapshot = {
      channel: "disabled",
      currentVersion: "1.0.0-rc.1",
      availability: "disabled",
      reasonCode: "channel_disabled",
    };
  });

  it("AB1: renders without error", () => {
    const { container } = render(aboutPane.render({ lang: "en" }));
    expect(container.querySelector(".about-pane")).toBeTruthy();
  });

  it("AB2: shows version string", () => {
    render(aboutPane.render({ lang: "en" }));
    expect(screen.getByText(/v 1\.2\.0/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.05\.23/)).toBeInTheDocument();
  });

  it("AB3: bilingual — EN shows English description", () => {
    render(aboutPane.render({ lang: "en" }));
    expect(screen.getByText("A focused, bilingual productivity workspace.")).toBeInTheDocument();
  });

  it("AB4: bilingual — ZH shows Chinese description", () => {
    render(aboutPane.render({ lang: "zh" }));
    expect(screen.getByText("一款轻盈、专注、面向中英双语用户的生产力工作台。")).toBeInTheDocument();
  });

  it("AB5: check button is disabled when updater is unavailable", () => {
    render(aboutPane.render({ lang: "en" }));
    expect(screen.getByRole("button", { name: "Check unavailable" })).toBeDisabled();
  });

  it("AB6: install unavailable copy is shown for update-available snapshot", () => {
    state.snapshot = {
      channel: "internal-rc",
      currentVersion: "1.0.0-rc.1",
      availability: "update-available",
      reasonCode: "install_unavailable",
      updateVersion: "1.0.0-rc.2",
    };

    render(aboutPane.render({ lang: "en" }));
    expect(screen.getByText("Update available")).toBeInTheDocument();
    expect(screen.getByText("1.0.0-rc.2")).toBeInTheDocument();
    expect(
      screen.getByText("Update metadata is available, but install is intentionally unavailable in this build."),
    ).toBeInTheDocument();
  });
});
