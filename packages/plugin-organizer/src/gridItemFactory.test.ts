import { describe, expect, it } from "vitest";

import {
  InvalidUrlError,
  createAppGridItem,
  createFileGridItem,
  createFolderGridItem,
  createGridItemsFromFinderDrop,
  createUrlGridItem,
  inferKindFromPath,
} from "./gridItemFactory";

const FIXED_NOW = "2026-05-20T01:10:00.000Z";

let counter = 0;
function nextId(kind: string) {
  counter += 1;
  return `${kind}_${counter}`;
}

describe("inferKindFromPath", () => {
  it.each([
    ["/Applications/Safari.app", "app"],
    ["/Users/me/Documents/file.txt", "file"],
    ["/Users/me/Photos/", "folder"],
    ["/Users/me/UPPER.APP", "app"],
  ])("infers %s → %s", (path, expected) => {
    expect(inferKindFromPath(path)).toBe(expected);
  });
});

describe("file/folder/app factories", () => {
  it("createFileGridItem emits a typed organizer.item record", () => {
    counter = 0;
    const item = createFileGridItem(
      {
        gridId: "grid-1",
        filename: "report.md",
        filepath: "/Users/me/Documents/report.md",
        size: 1024,
      },
      { nowIso: () => FIXED_NOW, newId: nextId },
    );
    expect(item).toEqual({
      id: "file_1",
      entityType: "organizer.item",
      schemaVersion: 1,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
      syncScope: "account-sync",
      gridId: "grid-1",
      filename: "report.md",
      filepath: "/Users/me/Documents/report.md",
      kind: "file",
      icon: "doc.text",
      size: 1024,
    });
  });

  it("createFolderGridItem assigns the folder icon", () => {
    counter = 10;
    const item = createFolderGridItem(
      {
        gridId: "grid-2",
        name: "Notes",
        filepath: "/Users/me/Notes",
      },
      { nowIso: () => FIXED_NOW, newId: nextId },
    );
    expect(item).toMatchObject({
      id: "folder_11",
      kind: "folder",
      icon: "folder",
      gridId: "grid-2",
    });
  });

  it("createAppGridItem assigns the app icon", () => {
    counter = 99;
    const item = createAppGridItem(
      {
        gridId: "grid-3",
        name: "Safari",
        filepath: "/Applications/Safari.app",
      },
      { nowIso: () => FIXED_NOW, newId: nextId },
    );
    expect(item).toMatchObject({
      id: "app_100",
      kind: "app",
      icon: "app.dashed",
    });
  });
});

describe("createUrlGridItem", () => {
  it("normalises the href and derives filename from hostname when title missing", () => {
    counter = 0;
    const item = createUrlGridItem(
      {
        gridId: "grid-1",
        href: "https://example.com/path/?q=1",
      },
      { nowIso: () => FIXED_NOW, newId: nextId },
    );
    expect(item).toMatchObject({
      kind: "url",
      filename: "example.com",
      url: { href: "https://example.com/path/?q=1" },
    });
  });

  it("uses the provided title and trims whitespace", () => {
    const item = createUrlGridItem(
      {
        gridId: "grid-1",
        href: "https://example.com",
        title: "  Example  ",
        description: " Sample ",
        favicon: "https://example.com/favicon.ico",
      },
      { nowIso: () => FIXED_NOW, newId: () => "url_x" },
    );
    expect(item.filename).toBe("Example");
    expect(item.url).toEqual({
      href: "https://example.com/",
      title: "Example",
      description: "Sample",
      favicon: "https://example.com/favicon.ico",
    });
  });

  it("rejects non-http(s) protocols", () => {
    expect(() =>
      createUrlGridItem({ gridId: "grid-1", href: "file:///etc/passwd" }),
    ).toThrow(InvalidUrlError);
    expect(() =>
      createUrlGridItem({ gridId: "grid-1", href: "javascript:alert(1)" }),
    ).toThrow(InvalidUrlError);
  });

  it("rejects unparseable URLs", () => {
    expect(() =>
      createUrlGridItem({ gridId: "grid-1", href: "::nope::" }),
    ).toThrow(InvalidUrlError);
  });
});

describe("createGridItemsFromFinderDrop", () => {
  it("maps each entry to a typed item using kind inference", () => {
    counter = 0;
    const items = createGridItemsFromFinderDrop(
      "grid-1",
      [
        { filename: "doc.md", filepath: "/Users/me/doc.md" },
        { filename: "Photos", filepath: "/Users/me/Photos/" },
        { filename: "Safari", filepath: "/Applications/Safari.app" },
      ],
      { nowIso: () => FIXED_NOW, newId: nextId },
    );
    expect(items.map((item) => item.kind)).toEqual([
      "file",
      "folder",
      "app",
    ]);
    expect(items[0]?.filepath).toBe("/Users/me/doc.md");
  });

  it("honors kindOverride when caller pins the type", () => {
    const items = createGridItemsFromFinderDrop(
      "grid-1",
      [
        {
          filename: "Notes",
          filepath: "/Users/me/Notes",
          kindOverride: "folder",
        },
      ],
      { nowIso: () => FIXED_NOW, newId: () => "x_1" },
    );
    expect(items[0]?.kind).toBe("folder");
  });
});
