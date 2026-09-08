/**
 * CL1..CL4 — collaboratePane tests (test.md §3 P1)
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { collaboratePane } from "../panes/collaboratePane.js";
import { getPref } from "@repo/plugin-web-storage";

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

  it("CL4: toggling avatars toggle persists pref", () => {
    const { container } = render(collaboratePane.render({ lang: "en" }));
    // Default is true; find the toggle button for "show collaborator avatars"
    const toggleBtn = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show collaborator avatars"]',
    );
    expect(toggleBtn).not.toBeNull();
    expect(getPref("xai_pref_collab_show_avatars")).toBe(true);
    fireEvent.click(toggleBtn!);
    expect(getPref("xai_pref_collab_show_avatars")).toBe(false);
  });
});
