import { describe, expect, it, vi } from "vitest";

import { createFinderClient } from "./finderClient";

describe("createFinderClient", () => {
  it("revealInFinder calls invoke('reveal_in_finder', ...)", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createFinderClient(invoke);
    await client.revealInFinder("/Users/me/file.txt");
    expect(invoke).toHaveBeenCalledWith("reveal_in_finder", {
      input: { path: "/Users/me/file.txt" },
    });
  });

  it("openPath calls invoke('open_path', ...)", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createFinderClient(invoke);
    await client.openPath("/Users/me/file.txt");
    expect(invoke).toHaveBeenCalledWith("open_path", {
      input: { path: "/Users/me/file.txt" },
    });
  });

  it("registerBookmark calls invoke('register_path_bookmark', { input: { path } })", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createFinderClient(invoke);
    await client.registerBookmark("/Users/me/Documents/photo.jpg");
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith("register_path_bookmark", {
      input: { path: "/Users/me/Documents/photo.jpg" },
    });
  });

  it("clearBookmark calls invoke('clear_path_bookmark', { input: { path } })", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createFinderClient(invoke);
    await client.clearBookmark("/Users/me/Documents/photo.jpg");
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith("clear_path_bookmark", {
      input: { path: "/Users/me/Documents/photo.jpg" },
    });
  });
});
