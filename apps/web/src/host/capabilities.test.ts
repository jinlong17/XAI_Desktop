import { describe, expect, it, vi } from "vitest";
import { createWebConsoleCapabilities } from "./capabilities";

describe("createWebConsoleCapabilities", () => {
  it("maps navigate route state into /app path", () => {
    const navigateTo = vi.fn<(path: string, replace?: boolean) => void>();
    const capabilities = createWebConsoleCapabilities({ navigateTo });

    capabilities.navigate({ moduleId: "todos", listId: "inbox", detailId: "item-1" });

    expect(navigateTo).toHaveBeenCalledWith("/app/todos/inbox/item-1");
  });

  it("returns unsupported result for native capability in browser host", async () => {
    const navigateTo = vi.fn<(path: string, replace?: boolean) => void>();
    const capabilities = createWebConsoleCapabilities({ navigateTo });

    const result = await capabilities.invokeNativeCapability("desktop-window-focus");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("unsupported_in_browser");
    }
  });

  it("reports supported and unsupported status families", () => {
    const navigateTo = vi.fn<(path: string, replace?: boolean) => void>();
    const capabilities = createWebConsoleCapabilities({ navigateTo });

    expect(capabilities.status("download")).toBe("supported");
    expect(capabilities.status("native")).toBe("unsupported");
    expect(capabilities.status("unknown")).toBe("blocked");
  });
});
