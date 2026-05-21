import { describe, expect, it, vi } from "vitest";
import type { DesktopItem } from "./types";
import { clearThumbnailCache, getFileThumbnail, isThumbnailCandidate } from "./thumbnailCache";

function makeItem(filepath: string, type: DesktopItem["type"] = "file"): DesktopItem {
  return {
    id: "i1",
    filename: "sample",
    filepath,
    type,
    icon: "file",
    createdAt: Date.now(),
  };
}

describe("thumbnailCache", () => {
  it("detects thumbnail candidates by extension and absolute path", () => {
    expect(isThumbnailCandidate(makeItem("/Users/me/photo.png"))).toBe(true);
    expect(isThumbnailCandidate(makeItem("/Users/me/video.mp4"))).toBe(true);
    expect(isThumbnailCandidate(makeItem("/Users/me/doc.txt"))).toBe(false);
    expect(isThumbnailCandidate(makeItem("relative/path.png"))).toBe(false);
    expect(isThumbnailCandidate(makeItem("/Users/me/folder", "folder"))).toBe(false);
  });

  it("caches invoke calls per path:size key", async () => {
    clearThumbnailCache();
    const invoke = vi.fn(async () => "/tmp/thumbnail.png") as unknown as <T>(
      cmd: string,
      args?: Record<string, unknown>,
    ) => Promise<T>;

    const first = await getFileThumbnail(invoke, "/Users/me/photo.png", 256);
    const second = await getFileThumbnail(invoke, "/Users/me/photo.png", 256);

    expect(second).toBe(first);
    expect(invoke).toHaveBeenCalledTimes(1);
  });
});
