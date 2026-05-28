import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { TasksModule } from "../TasksModule.js";

describe("TasksModule desktop offline cache fallback", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses safe empty state for absent cache in desktop-phase1-offline", () => {
    render(
      <TasksModule
        lang="en"
        runtimeProfileOverride="desktop-phase1-offline"
      />,
    );

    expect(document.querySelectorAll(".task-card")).toHaveLength(0);
    expect(screen.queryByTestId("tasks-cache-unreadable")).toBeNull();
  });

  it("shows unreadable cache copy for malformed cache in desktop-phase1-offline", () => {
    localStorage.setItem("xai_task_cols", "{not-json");
    render(
      <TasksModule
        lang="en"
        runtimeProfileOverride="desktop-phase1-offline"
      />,
    );

    expect(document.querySelectorAll(".task-card")).toHaveLength(0);
    expect(screen.getByTestId("tasks-cache-unreadable")).toBeInTheDocument();
  });

  it("keeps seed fallback in web-live for malformed cache", () => {
    localStorage.setItem("xai_task_cols", "{not-json");

    render(<TasksModule lang="en" runtimeProfileOverride="web-live" />);

    expect(document.querySelectorAll(".task-card").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("tasks-cache-unreadable")).toBeNull();
  });
});
