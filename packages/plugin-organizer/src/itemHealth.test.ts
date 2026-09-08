import { describe, expect, it } from "vitest";

import {
  defaultEmptyStateActions,
  evaluateItemHealth,
} from "./itemHealth";
import {
  createFileGridItem,
  createUrlGridItem,
} from "./gridItemFactory";

const NEXT = { nowIso: () => "2026-05-20T00:00:00.000Z", newId: () => "id" };

describe("evaluateItemHealth", () => {
  it("reports healthy for an item with a populated filepath", () => {
    const item = createFileGridItem(
      {
        gridId: "g",
        filename: "a.md",
        filepath: "/Users/me/a.md",
      },
      NEXT,
    );
    expect(evaluateItemHealth(item)).toEqual({ status: "healthy" });
  });

  it("reports missing-path for an empty filepath", () => {
    const item = createFileGridItem(
      { gridId: "g", filename: "x", filepath: "" },
      NEXT,
    );
    expect(evaluateItemHealth(item).status).toBe("missing-path");
  });

  it("respects pathExists predicate when supplied", () => {
    const item = createFileGridItem(
      {
        gridId: "g",
        filename: "x.md",
        filepath: "/Users/me/x.md",
      },
      NEXT,
    );
    expect(
      evaluateItemHealth(item, { pathExists: () => false }).status,
    ).toBe("missing-path");
  });

  it("reports healthy for a well-formed URL item", () => {
    const item = createUrlGridItem(
      { gridId: "g", href: "https://example.com" },
      NEXT,
    );
    expect(evaluateItemHealth(item)).toEqual({ status: "healthy" });
  });

  it("reports broken-url for a corrupted url payload", () => {
    const item = createUrlGridItem(
      { gridId: "g", href: "https://example.com" },
      NEXT,
    );
    const broken = { ...item, url: { ...item.url!, href: "::not a url::" } };
    expect(evaluateItemHealth(broken).status).toBe("broken-url");
  });

  it("reports missing-protocol when url metadata is absent", () => {
    const item = createUrlGridItem(
      { gridId: "g", href: "https://example.com" },
      NEXT,
    );
    const without = { ...item, url: undefined } as typeof item;
    expect(evaluateItemHealth(without).status).toBe("missing-protocol");
  });
});

describe("defaultEmptyStateActions", () => {
  it("returns the four canonical CTAs", () => {
    const actions = defaultEmptyStateActions();
    expect(actions.map((a) => a.id)).toEqual([
      "create-grid",
      "drop-here",
      "add-url",
      "choose-folder",
    ]);
  });
});
