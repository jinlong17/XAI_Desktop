/**
 * AC-REG-1..AC-REG-3 (test.md §A6).
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { featuresPane } from "../index.js";

describe("featuresPane registry entry", () => {
  it("AC-REG-1: id === 'features'", () => {
    expect(featuresPane.id).toBe("features");
  });

  it("AC-REG-2: i18nKey === 'settings.features'", () => {
    expect(featuresPane.i18nKey).toBe("settings.features");
  });

  it("AC-REG-3: render({ lang }) returns a renderable React element", () => {
    const element = featuresPane.render({ lang: "en" });
    expect(element).toBeTruthy();
    const { container } = render(element);
    expect(container.querySelector(".features-pane")).not.toBeNull();
    expect(container.querySelector(".pane-title")).not.toBeNull();
  });
});
