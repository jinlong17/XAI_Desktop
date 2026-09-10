/**
 * CL1..CL4 — collaboratePane tests (test.md §3 P1)
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { collaboratePane } from "../panes/collaboratePane.js";
import { accountScope, generationMarkerKey, getPref } from "@repo/plugin-web-storage";
import { createSmartListsLockManager } from "./smartListsLockFixture.js";

beforeEach(() => {
  localStorage.clear();
  accountScope.activate(accountScope.lock("collaborate-test"), "g1");
  localStorage.setItem(generationMarkerKey("collaborate-test"), JSON.stringify({ generation: "g1", migrationId: "fixture", previous: null }));
  vi.stubGlobal("navigator", { locks: createSmartListsLockManager() });
});
afterEach(() => vi.unstubAllGlobals());

describe("collaboratePane", () => {
  it("CL1: renders without error", () => {
    const { container } = render(collaboratePane.render({ lang: "en" }));
    expect(container.querySelector(".collab-pane")).toBeTruthy();
  });

  it("CL2: bilingual — EN labels are present", () => {
    render(collaboratePane.render({ lang: "en" }));
    expect(screen.getByText("Show collaborator avatars")).toBeInTheDocument();
    expect(screen.getByText("Default share permission")).toBeInTheDocument();
    expect(screen.getByText("Notify on @ mentions")).toBeInTheDocument();
  });

  it("CL3: bilingual — ZH labels are present", () => {
    render(collaboratePane.render({ lang: "zh" }));
    expect(screen.getByText("显示协作者头像")).toBeInTheDocument();
    expect(screen.getByText("分享时默认权限")).toBeInTheDocument();
    expect(screen.getByText("接收 @ 提及通知")).toBeInTheDocument();
  });

  it("CL4: toggling avatars toggle persists its independent async pref", async () => {
    const { container } = render(collaboratePane.render({ lang: "en" }));
    // Default is true; find the toggle button for "show collaborator avatars"
    const toggleBtn = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show collaborator avatars"]',
    );
    expect(toggleBtn).not.toBeNull();
    expect(getPref("xai_pref_collab_show_avatars")).toBe(true);
    fireEvent.click(toggleBtn!);
    await waitFor(() => expect(getPref("xai_pref_collab_show_avatars")).toBe(false));
  });

  it("persists all three actual controls independently without seeding absent siblings", async () => {
    const ui = render(collaboratePane.render({ lang: "en" }));
    expect(localStorage.getItem("xai_pref_collab_show_avatars")).toBeNull();
    expect(localStorage.getItem("xai_pref_collab_mention_notify")).toBeNull();
    fireEvent.click(ui.getByRole("switch", { name: "Show collaborator avatars" }));
    fireEvent.change(ui.getByRole("combobox", { name: "Default share permission" }), { target: { value: "edit" } });
    fireEvent.click(ui.getByRole("switch", { name: "Notify on @ mentions" }));
    await waitFor(() => {
      expect(getPref("xai_pref_collab_show_avatars")).toBe(false);
      expect(getPref("xai_pref_collab_default_share")).toBe("edit");
      expect(getPref("xai_pref_collab_mention_notify")).toBe(false);
    });
  });
});
