/**
 * CL1..CL4 — collaboratePane tests (test.md §3 P1)
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import * as React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { collaboratePane } from "../panes/collaboratePane.js";
import { accountScope, generationMarkerKey, getPref } from "@repo/plugin-web-storage";
import type { PaneDepartureGuard } from "@repo/plugin-web-settings-shell";
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

  it("registers a stable guard with a stateful host callback", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    function StatefulHost(): React.ReactElement {
      const [, setVersion] = React.useState(0);
      const register = React.useCallback(() => {
        setVersion(version => version + 1);
        return () => undefined;
      }, []);
      return collaboratePane.render({ lang: "en", registerDepartureGuard: register });
    }
    const ui = render(<StatefulHost />);
    await waitFor(() => expect(ui.getByText("Collaborate")).toBeInTheDocument());
    expect(errors.mock.calls.join(" ")).not.toContain("Maximum update depth");
    errors.mockRestore();
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

  it("offers a memory export while a current device edit is pending", async () => {
    const locks = createSmartListsLockManager();
    vi.stubGlobal("navigator", { locks });
    let release!: () => void;
    const held = locks.request("xai:pref:v1:xai_pref_collab_show_avatars", { mode: "exclusive" }, () => new Promise<void>(resolve => { release = resolve; }));
    const ui = render(collaboratePane.render({ lang: "en" }));
    fireEvent.click(ui.getByRole("switch", { name: "Show collaborator avatars" }));
    await waitFor(() => expect(ui.getByRole("button", { name: "Export current draft" })).toBeInTheDocument());
    release();
    await held;
  });

  it("keeps a pending device draft and reports a failed export setup", async () => {
    const locks = createSmartListsLockManager();
    vi.stubGlobal("navigator", { locks });
    vi.stubGlobal("URL", { createObjectURL: () => { throw new Error("denied"); }, revokeObjectURL: vi.fn() });
    let release!: () => void;
    const held = locks.request("xai:pref:v1:xai_pref_collab_show_avatars", { mode: "exclusive" }, () => new Promise<void>(resolve => { release = resolve; }));
    const ui = render(collaboratePane.render({ lang: "en" }));
    fireEvent.click(ui.getByRole("switch", { name: "Show collaborator avatars" }));
    const exportButton = await ui.findByRole("button", { name: "Export current draft" });
    fireEvent.click(exportButton);
    expect(await ui.findByText("Could not export the draft. Your local changes remain available.")).toBeInTheDocument();
    expect(ui.getByRole("switch", { name: "Show collaborator avatars" })).toHaveAttribute("aria-checked", "false");
    release();
    await held;
  });

  it("makes an old guard inert after an account epoch while keeping a device draft", async () => {
    const locks = createSmartListsLockManager();
    vi.stubGlobal("navigator", { locks });
    let captured: PaneDepartureGuard | null = null;
    const register = (guard: PaneDepartureGuard) => {
      captured = guard;
      return () => undefined;
    };
    let release!: () => void;
    const held = locks.request("xai:pref:v1:xai_pref_collab_show_avatars", { mode: "exclusive" }, () => new Promise<void>(resolve => { release = resolve; }));
    const ui = render(collaboratePane.render({ lang: "en", registerDepartureGuard: register }));
    await waitFor(() => expect(captured).not.toBeNull());
    fireEvent.click(ui.getByRole("switch", { name: "Show collaborator avatars" }));
    await waitFor(() => expect(captured?.isBlocking()).toBe(true));
    const oldGuard = captured!;
    await act(async () => {
      accountScope.activate(accountScope.lock("B"), "g2");
      localStorage.setItem(generationMarkerKey("B"), JSON.stringify({ generation: "g2", migrationId: "fixture", previous: null }));
    });
    expect(oldGuard.isCurrent()).toBe(false);
    expect(oldGuard.isBlocking()).toBe(false);
    oldGuard.discardDraft();
    expect(ui.getByRole("switch", { name: "Show collaborator avatars" })).toHaveAttribute("aria-checked", "false");
    release();
    await held;
  });

  it("keeps a same-value successor draft when its second write is rejected", async () => {
    let keyAttempts = 0;
    let admitFirst: (() => void) | null = null;
    vi.stubGlobal("navigator", { locks: {
      request(name: string, _options: unknown, run: () => unknown) {
        if (!name.startsWith("xai:pref:v1:")) return Promise.resolve(run());
        keyAttempts += 1;
        if (keyAttempts === 1) return new Promise((resolve, reject) => {
          admitFirst = () => { Promise.resolve(run()).then(resolve, reject); };
        });
        return Promise.reject(new Error("lock unavailable"));
      },
    }});
    const ui = render(collaboratePane.render({ lang: "en" }));
    const select = ui.getByRole("combobox", { name: "Default share permission" });
    fireEvent.change(select, { target: { value: "edit" } });
    await waitFor(() => expect(admitFirst).not.toBeNull());
    fireEvent.change(select, { target: { value: "view" } });
    fireEvent.change(select, { target: { value: "edit" } });
    admitFirst!();
    await waitFor(() => expect(ui.getByRole("alert")).toHaveTextContent("Not saved"));
    expect(select).toHaveValue("edit");
    expect(ui.getByRole("button", { name: "Export current draft" })).toBeInTheDocument();
  });
});
