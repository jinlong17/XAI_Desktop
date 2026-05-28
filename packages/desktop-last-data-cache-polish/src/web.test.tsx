import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  DesktopLastDataCacheBadge,
  readDesktopLastDataCacheSnapshot,
} from "./web.js";

describe("desktop-last-data-cache-polish web snapshot", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns hidden in web-live runtime", () => {
    const snapshot = readDesktopLastDataCacheSnapshot({
      VITE_WEB_RUNTIME_PROFILE: "web-live",
    });
    expect(snapshot.bannerMode).toBe("hidden");
  });

  it("returns empty in desktop offline runtime with no tracked keys", () => {
    const snapshot = readDesktopLastDataCacheSnapshot({
      VITE_WEB_RUNTIME_PROFILE: "desktop-phase1-offline",
    });
    expect(snapshot.bannerMode).toBe("empty");
  });

  it("returns cached when tracked keys are present and readable", () => {
    localStorage.setItem("xai_task_cols", JSON.stringify([
      { id: "overdue", key: "overdue", count: 0, tasks: [] },
      { id: "next7", key: "next_7_days", count: 0, tasks: [] },
      { id: "later", key: "later", count: 0, tasks: [] },
      { id: "nodate", key: "no_date", count: 0, tasks: [], completed: [] },
    ]));

    const snapshot = readDesktopLastDataCacheSnapshot({
      VITE_WEB_RUNTIME_PROFILE: "desktop-phase1-offline",
    });
    expect(snapshot.bannerMode).toBe("cached");
    expect(snapshot.readableSurfacesPresent).toContain("tasks");
  });

  it("returns unreadable when a targeted payload is malformed", () => {
    localStorage.setItem("xai_task_cols", "{not-json");
    localStorage.setItem("xai_pomodoro_sessions", JSON.stringify([]));

    const snapshot = readDesktopLastDataCacheSnapshot({
      VITE_WEB_RUNTIME_PROFILE: "desktop-phase1-offline",
    });
    expect(snapshot.bannerMode).toBe("unreadable");
    expect(snapshot.unreadableSurfaces).toContain("tasks");
  });

  it("badge renders only in desktop-phase1-offline", () => {
    const { rerender } = render(
      <DesktopLastDataCacheBadge
        lang="en"
        runtimeEnv={{ VITE_WEB_RUNTIME_PROFILE: "web-live" }}
      />,
    );
    expect(screen.queryByTestId("desktop-last-data-cache-badge")).toBeNull();

    rerender(
      <DesktopLastDataCacheBadge
        lang="en"
        runtimeEnv={{ VITE_WEB_RUNTIME_PROFILE: "desktop-phase1-offline" }}
      />,
    );
    expect(screen.getByTestId("desktop-last-data-cache-badge")).toBeInTheDocument();
  });
});
