/**
 * AC-DIARY-1..2, AC-DIARY-4: DiaryCard tests.
 */
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { DiaryCard } from "../DiaryCard.js";
import * as storageModule from "@repo/plugin-web-storage";

describe("DiaryCard", () => {
  it("AC-DIARY-1: typing updates the controlled value", async () => {
    render(
      <DiaryCard
        habitId="h_1"
        monthKey="2026-05"
        value=""
        setValue={() => {}}
        emptyHint="No entries yet."
        lang="en"
      />
    );
    const textarea = document.querySelector("textarea")!;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "hello" } });
    });
    expect((textarea as HTMLTextAreaElement).value).toBe("hello");
  });

  it("AC-DIARY-2: blur calls setValue with new text", async () => {
    const setValueMock = vi.fn();
    render(
      <DiaryCard
        habitId="h_1"
        monthKey="2026-05"
        value=""
        setValue={setValueMock}
        emptyHint="No entries yet."
        lang="en"
      />
    );
    const textarea = document.querySelector("textarea")!;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "hello" } });
      fireEvent.blur(textarea);
    });
    expect(setValueMock).toHaveBeenCalledWith("h_1", "2026-05", "hello");
  });

  it("AC-DIARY-4: blur with unchanged value does not call setValue", async () => {
    const setValueMock = vi.fn();
    // Spy on setPref from plugin-web-storage to ensure no extra writes
    const setPrefSpy = vi.spyOn(storageModule, "setPref");

    render(
      <DiaryCard
        habitId="h_1"
        monthKey="2026-05"
        value="existing text"
        setValue={setValueMock}
        emptyHint="No entries yet."
        lang="en"
      />
    );
    const textarea = document.querySelector("textarea")!;
    await act(async () => {
      fireEvent.focus(textarea);
      fireEvent.blur(textarea);
    });
    // value hasn't changed, so setValue should NOT be called
    expect(setValueMock).not.toHaveBeenCalled();
    setPrefSpy.mockRestore();
  });

  it("shows empty-state hint when no text", () => {
    render(
      <DiaryCard
        habitId="h_1"
        monthKey="2026-05"
        value=""
        setValue={() => {}}
        emptyHint="No entries yet."
        lang="en"
      />
    );
    expect(document.querySelector(".log-empty")?.textContent).toBe("No entries yet.");
  });

  it("hides empty-state hint when text exists", () => {
    render(
      <DiaryCard
        habitId="h_1"
        monthKey="2026-05"
        value="some diary text"
        setValue={() => {}}
        emptyHint="No entries yet."
        lang="en"
      />
    );
    expect(document.querySelector(".log-empty")).toBeFalsy();
  });
});
