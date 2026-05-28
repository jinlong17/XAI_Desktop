import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { HabitsModule } from "../HabitsModule.js";
import { habitsSlotRegistration } from "../registration.js";
import { HABITS_STORAGE_KEY } from "../constants.js";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <WebShellProvider
      modules={[habitsSlotRegistration]}
      lang="en"
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {children}
    </WebShellProvider>
  );
}

describe("HabitsModule desktop offline fallback", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stays empty when desktop offline cache is absent", () => {
    render(
      <Wrapper>
        <HabitsModule lang="en" runtimeProfileOverride="desktop-phase1-offline" />
      </Wrapper>,
    );

    expect(document.querySelectorAll(".habit-row")).toHaveLength(0);
    expect(screen.queryByTestId("habits-cache-unreadable")).toBeNull();
  });

  it("shows unreadable copy for malformed desktop offline cache", () => {
    localStorage.setItem(HABITS_STORAGE_KEY, "{bad-json");

    render(
      <Wrapper>
        <HabitsModule lang="en" runtimeProfileOverride="desktop-phase1-offline" />
      </Wrapper>,
    );

    expect(document.querySelectorAll(".habit-row")).toHaveLength(0);
    expect(screen.getByTestId("habits-cache-unreadable")).toBeTruthy();
  });

  it("keeps seeded first-launch behavior in web-live", () => {
    render(
      <Wrapper>
        <HabitsModule lang="en" runtimeProfileOverride="web-live" />
      </Wrapper>,
    );

    expect(document.querySelectorAll(".habit-row").length).toBeGreaterThan(0);
  });
});
