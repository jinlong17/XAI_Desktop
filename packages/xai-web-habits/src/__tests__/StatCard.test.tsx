/**
 * AC-TOKENS-2: StatCard icon background uses color-mix token pattern.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { StatCard } from "../StatCard.js";

describe("StatCard", () => {
  it("renders with label and value", () => {
    render(
      <StatCard
        icon="check"
        color="var(--accent)"
        label="Monthly check-ins"
        value={5}
        unit="Day"
      />
    );
    expect(document.querySelector(".stat-label")?.textContent).toBe("Monthly check-ins");
    expect(document.querySelector(".stat-value")?.textContent).toBe("5Day");
  });

  it("AC-TOKENS-2: stat-ico uses color-mix(in oklch, ...) inline style", () => {
    render(
      <StatCard
        icon="check"
        color="var(--accent)"
        label="Test"
        value={1}
        unit="x"
      />
    );
    const ico = document.querySelector(".stat-ico") as HTMLElement;
    expect(ico).toBeTruthy();
    const bg = ico.style.background;
    expect(bg).toMatch(/color-mix\(in oklch, var\(--\w+\) 14%, transparent\)/);
  });

  it("renders fire icon", () => {
    render(
      <StatCard icon="fire" color="var(--red)" label="Streak" value={3} unit="Day" />
    );
    expect(document.querySelector(".stat-card")).toBeTruthy();
  });
});
