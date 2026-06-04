/**
 * CountdownModule.test.tsx — Tests M1..M10
 *
 * M1: empty state shows only AddCountdownCard
 * M2: adds card → persists to xai_countdowns
 * M3: edit existing → persists patch
 * M4: delete → persists removal
 * M5: midnight tick recomputes all days (via fake timer)
 * M6: lang switch re-renders labels
 * M7: corrupted localStorage entry is filtered & DEV warn
 * M8: StrictMode no double-persist (not easily testable in unit; covered by H4)
 * M9: cards survive remount
 * M10: header + opens create modal
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { CountdownModule } from "../CountdownModule.js";
import { FIXTURE_FUTURE, FIXTURE_LIGHT } from "../__fixtures__/cards.js";
import type { CountdownCard } from "../types.js";

// Seed localStorage before a test
function seedStorage(cards: CountdownCard[]) {
  localStorage.setItem("xai_countdowns", JSON.stringify(cards));
}

describe("CountdownModule — M1 empty state", () => {
  it("M1: shows preset countdowns and AddCountdownCard when no cards stored", () => {
    render(<CountdownModule lang="en" />);
    expect(screen.getByText("Add Countdown")).toBeInTheDocument();
    expect(screen.getByText("Christmas")).toBeInTheDocument();
    expect(screen.getByText("End of this year")).toBeInTheDocument();
    expect(screen.queryByText("Weekend")).not.toBeInTheDocument();
  });
});

describe("CountdownModule — M2 add card", () => {
  it("M2: clicking AddCountdownCard opens modal and saving persists card", async () => {
    render(<CountdownModule lang="en" />);
    // Click the add button
    const addBtn = screen.getByText("Add Countdown");
    fireEvent.click(addBtn);
    // Modal should open
    expect(screen.getByText("New Countdown")).toBeInTheDocument();
    // Fill form
    fireEvent.change(screen.getByLabelText("Title (English)"), {
      target: { value: "New Event" },
    });
    fireEvent.change(screen.getByLabelText("Title (Chinese)"), {
      target: { value: "新事件" },
    });
    fireEvent.change(screen.getByLabelText("Target date"), {
      target: { value: "2026-12-25" },
    });
    fireEvent.change(screen.getByLabelText("Target time"), {
      target: { value: "09:30" },
    });
    // Click Save
    const saveBtn = screen.getByText("Save");
    expect(saveBtn).not.toBeDisabled();
    act(() => {
      fireEvent.click(saveBtn);
    });
    // Card should appear in grid
    expect(screen.getByText("New Event")).toBeInTheDocument();
    // localStorage should contain the new card
    const stored = JSON.parse(localStorage.getItem("xai_countdowns") ?? "[]");
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.length).toBeGreaterThan(0);
    expect(stored.some((card: CountdownCard) => card.title.en === "New Event")).toBe(true);
  });
});

describe("CountdownModule — M3 edit card", () => {
  it("M3: clicking an existing card opens modal pre-filled; saving persists patch", async () => {
    seedStorage([FIXTURE_FUTURE]);
    render(<CountdownModule lang="en" />);
    // Find and click the card
    const titleEl = screen.getByText("Weekend");
    fireEvent.click(titleEl.closest("[role='button']") ?? titleEl);
    // Modal should open in edit mode
    expect(screen.getByText("Edit Countdown")).toBeInTheDocument();
    // EN input should be pre-filled
    const enInput = screen.getByLabelText("Title (English)") as HTMLInputElement;
    expect(enInput.value).toBe("Weekend");
    // Update title
    fireEvent.change(enInput, { target: { value: "Weekend Updated" } });
    fireEvent.change(screen.getByLabelText("Target time"), {
      target: { value: "10:00" },
    });
    act(() => {
      fireEvent.click(screen.getByText("Save"));
    });
    expect(screen.getByText("Weekend Updated")).toBeInTheDocument();
    // Verify localStorage
    const stored = JSON.parse(localStorage.getItem("xai_countdowns") ?? "[]");
    const updated = stored.find((card: CountdownCard) => card.id === FIXTURE_FUTURE.id);
    expect(updated.title.en).toBe("Weekend Updated");
  });
});

describe("CountdownModule — M4 delete", () => {
  it("M4: deleting a card hides it from active view and stores history state", async () => {
    seedStorage([FIXTURE_FUTURE]);
    render(<CountdownModule lang="en" />);
    // Open edit modal
    const titleEl = screen.getByText("Weekend");
    fireEvent.click(titleEl.closest("[role='button']") ?? titleEl);
    expect(screen.getByText("Edit Countdown")).toBeInTheDocument();
    // Click Delete
    const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
    act(() => {
      fireEvent.click(deleteButtons[deleteButtons.length - 1]!);
    });
    expect(screen.queryByText("Weekend")).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("xai_countdowns") ?? "[]");
    const deleted = stored.find((card: CountdownCard) => card.id === FIXTURE_FUTURE.id);
    expect(deleted.status).toBe("deleted");
    expect(deleted.is_hidden).toBe(true);
  });
});

describe("CountdownModule — M5 midnight tick", () => {
  it("M5: midnight timer recomputes days for all cards", async () => {
    seedStorage([FIXTURE_FUTURE]); // 7 days away from 2026-05-23
    render(<CountdownModule lang="en" />);
    expect(screen.getByText("7")).toBeInTheDocument();

    // Advance to just after midnight (2026-05-23 14:30 → 2026-05-24 00:00:01)
    // ms to midnight from setup time: 9h 30m = 34200000ms + 1001ms buffer
    const msToMidnight = (9.5 * 3600000) + 1001;
    act(() => {
      vi.setSystemTime(new Date(2026, 4, 24, 0, 0, 1));
      vi.advanceTimersByTime(msToMidnight);
    });

    expect(screen.getByText("6")).toBeInTheDocument();
  });
});

describe("CountdownModule — M6 lang switch", () => {
  it("M6: lang switch re-renders labels", () => {
    function Wrapper() {
      const [lang, setLang] = React.useState<"en" | "zh">("en");
      return (
        <>
          <CountdownModule lang={lang} />
          <button onClick={() => setLang("zh")}>switch</button>
        </>
      );
    }
    render(<Wrapper />);
    expect(screen.getByText("Countdown")).toBeInTheDocument();
    fireEvent.click(screen.getByText("switch"));
    expect(screen.getByText("倒计时")).toBeInTheDocument();
  });
});

describe("CountdownModule — M7 corrupted entry", () => {
  it("M7: corrupted entry is filtered out", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Store one valid card and one invalid entry
    localStorage.setItem(
      "xai_countdowns",
      JSON.stringify([FIXTURE_FUTURE, { id: "bad", title: { en: "Only EN" } }]),
    );
    render(<CountdownModule lang="en" />);
    // Only FIXTURE_FUTURE should render
    expect(screen.getByText("Weekend")).toBeInTheDocument();
    // The invalid entry should not render
    expect(screen.queryByText("Only EN")).not.toBeInTheDocument();
    warnSpy.mockRestore();
  });
});

describe("CountdownModule — M9 remount round-trip", () => {
  it("M9: cards survive unmount and remount", () => {
    seedStorage([FIXTURE_FUTURE, FIXTURE_LIGHT]);
    const { unmount } = render(<CountdownModule lang="en" />);
    expect(screen.getByText("Weekend")).toBeInTheDocument();
    unmount();
    render(<CountdownModule lang="en" />);
    expect(screen.getByText("Weekend")).toBeInTheDocument();
    expect(screen.getAllByText("Spring Festival").length).toBeGreaterThan(0);
  });
});

describe("CountdownModule — M10 header + button", () => {
  it("M10: header + button opens create modal", () => {
    render(<CountdownModule lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: /New countdown/i }));
    expect(screen.getByText("New Countdown")).toBeInTheDocument();
  });
});

describe("CountdownModule — V2 interaction polish", () => {
  it("keeps overview and view tabs available in subviews and can return to board", () => {
    render(<CountdownModule lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Compact list" }));
    expect(screen.getByLabelText("Countdown overview")).toBeInTheDocument();
    expect(screen.getByLabelText("Countdown views")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to board/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back to board/i }));
    expect(screen.getByText("Add Countdown")).toBeInTheDocument();
  });

  it("persists drag-reordered card order", () => {
    seedStorage([
      { ...FIXTURE_FUTURE, id: "cd_alpha", title: { en: "Alpha", zh: "甲" }, sort_order: 20 },
      { ...FIXTURE_LIGHT, id: "cd_beta", title: { en: "Beta", zh: "乙" }, sort_order: 21 },
    ]);
    render(<CountdownModule lang="en" />);

    const alpha = screen.getByText("Alpha").closest("article")!;
    const beta = screen.getByText("Beta").closest("article")!;
    const dragData = new Map<string, string>();
    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn((key: string, value: string) => dragData.set(key, value)),
      getData: vi.fn((key: string) => dragData.get(key) ?? ""),
    };

    fireEvent.dragStart(beta, { dataTransfer });
    fireEvent.dragEnter(alpha, { dataTransfer });
    fireEvent.dragOver(alpha, { dataTransfer });
    fireEvent.drop(alpha, { dataTransfer });
    fireEvent.dragEnd(beta, { dataTransfer });

    const stored = JSON.parse(localStorage.getItem("xai_countdowns") ?? "[]") as CountdownCard[];
    const alphaStored = stored.find((card) => card.id === "cd_alpha")!;
    const betaStored = stored.find((card) => card.id === "cd_beta")!;
    expect(betaStored.sort_order ?? Number.MAX_SAFE_INTEGER).toBeLessThan(alphaStored.sort_order ?? Number.MAX_SAFE_INTEGER);
  });
});
