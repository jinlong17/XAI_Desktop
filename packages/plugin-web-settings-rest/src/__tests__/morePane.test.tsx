import { accountScope, generationKey } from "@repo/plugin-web-storage";
/**
 * MP1..MP10 — morePane tests (test.md §3 P2)
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { morePane } from "../panes/morePane.js";
import { getPref, setPref } from "@repo/plugin-web-storage";

describe("morePane", () => {
  it("MP1: renders without error", () => {
    const { container } = render(morePane.render({ lang: "en" }));
    expect(container.querySelector(".more-pane")).toBeTruthy();
  });

  it("MP2: bilingual — EN labels", () => {
    render(morePane.render({ lang: "en" }));
    expect(screen.getByText("Smart Recognition")).toBeInTheDocument();
    expect(screen.getByText("Task Default")).toBeInTheDocument();
    expect(screen.getByText("Task Template")).toBeInTheDocument();
  });

  it("MP3: bilingual — ZH labels", () => {
    render(morePane.render({ lang: "zh" }));
    expect(screen.getByText("智能识别")).toBeInTheDocument();
    expect(screen.getByText("任务默认值")).toBeInTheDocument();
    expect(screen.getByText("任务模板")).toBeInTheDocument();
  });

  it("MP4: SettingRow label for Remove text is a plain string (not ReactNode — chassis contract)", () => {
    const { container } = render(morePane.render({ lang: "en" }));
    // Find the row that contains "Remove text in tasks"
    const rows = container.querySelectorAll(".setting-row");
    const targetRow = Array.from(rows).find((r) =>
      r.textContent?.includes("Remove text in tasks"),
    );
    expect(targetRow).toBeTruthy();
    // The sr-label should contain a text node, not an arbitrary ReactNode
    const label = targetRow?.querySelector(".sr-label");
    expect(label?.textContent).toBe("Remove text in tasks");
  });

  it("MP5: language select is read-only (only one option: Follow System)", () => {
    const { container } = render(morePane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>('select[aria-label="Language"]');
    expect(sel).not.toBeNull();
    expect(sel!.options.length).toBe(1);
    expect(sel!.options[0]!.value).toBe("follow");
  });

  it("MP6: window type select persists xai_pref_more_win_type", () => {
    const { container } = render(morePane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>('select[aria-label="Choose window type when launching"]');
    fireEvent.change(sel!, { target: { value: "tray" } });
    expect(getPref("xai_pref_more_win_type")).toBe("tray");
  });

  it("MP7: 3 template cards rendered", () => {
    const { container } = render(morePane.render({ lang: "en" }));
    const cards = container.querySelectorAll(".template-card");
    expect(cards.length).toBe(3);
  });

  it("MP8: Reset Default clears More-owned keys and leaves other keys untouched", () => {
    // Pre-set some More keys and a non-More key
    setPref("xai_pref_more_win_type", "tray");
    setPref("xai_pref_more_launch_at_login", true);
    setPref("xai_pref_notif_enabled", false); // NOT a More key

    render(morePane.render({ lang: "en" }));
    const resetLink = screen.getByTestId("more-reset-default");
    fireEvent.click(resetLink);

    // More keys should return to defaults
    expect(getPref("xai_pref_more_win_type")).toBe("window");
    expect(getPref("xai_pref_more_launch_at_login")).toBe(false);
    // Non-More key must be untouched
    expect(getPref("xai_pref_notif_enabled")).toBe(false);
  });

  it("MP9: bilingual template names (ZH)", () => {
    render(morePane.render({ lang: "zh" }));
    expect(screen.getByText("每天工作前要做的几件事")).toBeInTheDocument();
    expect(screen.getByText("每日记录")).toBeInTheDocument();
    expect(screen.getByText("旅行必备物品")).toBeInTheDocument();
  });

  it("MP10: pane id, icon, i18nKey are correct", () => {
    expect(morePane.id).toBe("more");
    expect(morePane.icon).toBe("help");
    expect(morePane.i18nKey).toBe("settings.more");
  });
});


it("REL-03 More reset preserves B and unowned defaults while resetting the selected account", () => {
  const current = accountScope.capture();
  setPref("xai_pref_more_default_list", "today");
  const keyB = generationKey("B", "g-b", "xai_pref_more_default_list");
  localStorage.setItem(keyB, "today");
  localStorage.setItem("xai_pref_more_default_list", "unowned-list");
  render(morePane.render({ lang: "en" }));
  fireEvent.click(screen.getByTestId("more-reset-default"));
  expect(getPref("xai_pref_more_default_list")).toBe("inbox");
  expect(localStorage.getItem(keyB)).toBe("today");
  expect(localStorage.getItem("xai_pref_more_default_list")).toBe("unowned-list");
  expect(accountScope.capture()).toBe(current);
});

it("REL-03 a stale reset callback cannot reset B or device settings", () => {
  render(morePane.render({ lang: "en" }));
  accountScope.activate(accountScope.lock("B"), "g-b");
  setPref("xai_pref_more_default_list", "today");
  setPref("xai_pref_more_win_type", "tray");
  fireEvent.click(screen.getByTestId("more-reset-default"));
  expect(getPref("xai_pref_more_default_list")).toBe("today");
  expect(getPref("xai_pref_more_win_type")).toBe("tray");
  expect(screen.getByRole("alert")).toHaveTextContent("Account changed");
});
