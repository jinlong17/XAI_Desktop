import { describe, expect, it } from "vitest";

import {
  classifyGridItem,
  defaultClassificationRules,
  fileExtension,
} from "./autoClassify";
import { createFileGridItem, createUrlGridItem } from "./gridItemFactory";
import type { GridEntity } from "@repo/core-data";

function grid(id: string, title: string): GridEntity {
  return {
    id,
    entityType: "organizer.grid",
    schemaVersion: 1,
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
    syncScope: "account-sync",
    title,
    rect: { x: 0, y: 0, width: 240, height: 320 },
    isLocked: false,
    isFolded: false,
    viewMode: "grid",
    itemIds: [],
  };
}

function fileItem(filepath: string) {
  return createFileGridItem(
    {
      gridId: "unassigned",
      filename: filepath.split("/").pop() ?? filepath,
      filepath,
    },
    { nowIso: () => "2026-05-20T00:00:00.000Z", newId: () => "x" },
  );
}

describe("fileExtension", () => {
  it("returns the lowercase extension when present", () => {
    expect(fileExtension(fileItem("/x/y/photo.JPG"))).toBe("jpg");
  });

  it("returns null when the basename has no extension", () => {
    expect(fileExtension(fileItem("/x/y/README"))).toBeNull();
  });

  it("ignores dots earlier in the path", () => {
    expect(fileExtension(fileItem("/x.y/file"))).toBeNull();
  });
});

describe("defaultClassificationRules", () => {
  const rules = defaultClassificationRules();

  it("matches kind keywords in the Grid title", () => {
    // .sh is not in any extension group, so only the kind-title rule fires.
    const ctx = {
      item: fileItem("/Users/me/Scripts/build.sh"),
      grids: [grid("g1", "Today"), grid("g2", "Files Drop")],
    };
    expect(classifyGridItem(rules, ctx)).toMatchObject({
      gridId: "g2",
      ruleId: "kind-title-match",
    });
  });

  it("prefers extension-group match over kind match", () => {
    const ctx = {
      item: fileItem("/Users/me/Downloads/screenshot.png"),
      grids: [
        grid("g-docs", "Docs"),
        grid("g-images", "Images Inbox"),
      ],
    };
    const result = classifyGridItem(rules, ctx);
    expect(result?.gridId).toBe("g-images");
    expect(result?.ruleId).toBe("extension-title-match");
  });

  it("prefers parent-folder match over both other rules", () => {
    const ctx = {
      item: fileItem("/Users/me/Photos/IMG_001.HEIC"),
      grids: [
        grid("g-images", "Images"),
        grid("g-photos", "Photos"),
      ],
    };
    const result = classifyGridItem(rules, ctx);
    expect(result?.gridId).toBe("g-photos");
    expect(result?.ruleId).toBe("parent-folder-title-match");
  });

  it("returns null when nothing matches", () => {
    const ctx = {
      item: fileItem("/Users/me/Misc/random.bin"),
      grids: [grid("g1", "Today")],
    };
    expect(classifyGridItem(rules, ctx)).toBeNull();
  });

  it("classifies url items via kind-title rule (Links / Bookmarks)", () => {
    const url = createUrlGridItem(
      { gridId: "unassigned", href: "https://example.com" },
      { nowIso: () => "x", newId: () => "x" },
    );
    const result = classifyGridItem(rules, {
      item: url,
      grids: [grid("g-links", "Bookmarks")],
    });
    expect(result?.gridId).toBe("g-links");
  });
});
