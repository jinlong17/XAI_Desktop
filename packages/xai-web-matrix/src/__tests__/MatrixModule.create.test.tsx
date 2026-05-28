/**
 * T-MWIRE-1..2, T-MCR-1..3, T-MNOEMIT-1 — MatrixModule card create tests (EP2).
 *
 * Tests: M-01/M-03 wire → composer open, save → card appears + persists,
 *        create does NOT emit web:matrix:priority-tagged.
 * Design: design.md §E.1
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { matrixSlotRegistration } from "../registration.js";
import { MatrixModule } from "../MatrixModule.js";
import * as EventBus from "@repo/xai-web-event-bus";

// jsdom requires mocking showModal/close on HTMLDialogElement
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <WebShellProvider
      modules={[matrixSlotRegistration]}
      lang="en"
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {children}
    </WebShellProvider>
  );
}

function renderMatrix(lang: "en" | "zh" = "en") {
  return render(
    <Wrapper>
      <MatrixModule lang={lang} />
    </Wrapper>,
  );
}

/** Wait for seed hydration (useEffect on first mount) */
async function waitForSeed() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
}

/** Open the composer by clicking the header + button (M-01) */
async function openComposerViaHeader() {
  // The module header has an "Add" button (M-01); use hidden:false since the dialog is not open yet
  // We match the aria-label on the header + button
  const headerAddBtn = screen.getByRole("button", { name: /^add$/i });
  await act(async () => { fireEvent.click(headerAddBtn); });
}

/** Fill title input and click Add */
async function submitComposer(title: string) {
  // Find the title input inside the dialog
  const titleInput = document.querySelector(".matrix-composer__input") as HTMLInputElement;
  expect(titleInput).toBeTruthy();
  await act(async () => {
    fireEvent.change(titleInput, { target: { value: title } });
  });

  const addBtn = document.querySelector(".matrix-composer__btn--primary") as HTMLButtonElement;
  expect(addBtn).toBeTruthy();
  await act(async () => { fireEvent.click(addBtn); });
}

describe("MatrixModule card create", () => {
  it("T-MWIRE-1: clicking M-01 header + opens the composer with defaultQuadrant=q1", async () => {
    renderMatrix();
    await waitForSeed();

    // Composer should not be visible before click
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();

    await openComposerViaHeader();

    // showModal was called (composer opened)
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();

    // Verify q1 radio is selected (aria-checked=true) in quadrant radiogroup
    // Dialog is hidden in jsdom; query DOM directly
    const allRadios = document.querySelectorAll(".matrix-composer [role='radio']");
    const q1Radio = Array.from(allRadios).find(
      (el) => el.getAttribute("aria-checked") === "true" &&
        el.textContent?.includes("Urgent & Important")
    );
    expect(q1Radio).toBeTruthy();
  });

  it("T-MWIRE-2: clicking M-03 quadrant + opens composer with defaultQuadrant=that quadrant", async () => {
    renderMatrix();
    await waitForSeed();

    // Click the Q3 quadrant's + button (aria-label "Add card" inside data-quadrant=q3 section)
    const q3Section = document.querySelector("[data-quadrant='q3']") as HTMLElement;
    expect(q3Section).toBeTruthy();
    // Within q3's header, find the "Add card" button (icon-btn with PlusIcon)
    const q3AddBtn = q3Section.querySelector(".q-head .icon-btn") as HTMLButtonElement;
    expect(q3AddBtn).toBeTruthy();
    await act(async () => { fireEvent.click(q3AddBtn); });

    // Composer opened
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();

    // The q3 radio should be selected — query DOM directly since dialog is jsdom-hidden
    const allRadios = document.querySelectorAll(".matrix-composer [role='radio']");
    const q3Radio = Array.from(allRadios).find(
      (el) => el.getAttribute("aria-checked") === "true" &&
        el.textContent?.includes("Unimportant") &&
        el.textContent?.includes("Urgent")
    );
    expect(q3Radio).toBeTruthy();
  });

  it("T-MCR-1: save creates a card; it renders in the correct quadrant; count increments", async () => {
    renderMatrix();
    await waitForSeed();

    // Count cards in q1 before (seed puts none in q1)
    const q1Before = document.querySelectorAll("[data-quadrant='q1'] .m-row").length;

    await openComposerViaHeader(); // opens with q1 default
    await submitComposer("My brand new card");

    // Card should appear in q1
    const q1After = document.querySelectorAll("[data-quadrant='q1'] .m-row").length;
    expect(q1After).toBe(q1Before + 1);

    // The new card title should be visible
    expect(screen.getByText("My brand new card")).toBeTruthy();
  });

  it("T-MCR-2: created card is written to localStorage xai_matrix_state", async () => {
    renderMatrix();
    await waitForSeed();

    await openComposerViaHeader(); // opens with q1 default
    await submitComposer("Persisted card test");

    // Read localStorage
    const raw = localStorage.getItem("xai_matrix_state");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as { q1: Array<{ title: { en: string } }> };
    const q1Cards = parsed.q1;
    const found = q1Cards.some((c) => c.title.en === "Persisted card test");
    expect(found).toBe(true);
  });

  it("T-MCR-3: create into a PREVIOUSLY EMPTY quadrant — card appears + empty-state hint disappears", async () => {
    renderMatrix();
    await waitForSeed();

    // q1 starts empty (seed puts everything in q4)
    const q1Empty = document.querySelector("[data-quadrant='q1'] .q-empty");
    expect(q1Empty).toBeTruthy();

    await openComposerViaHeader(); // opens with q1 default
    await submitComposer("First card in empty q1");

    // Empty hint should be gone
    const q1EmptyAfter = document.querySelector("[data-quadrant='q1'] .q-empty");
    expect(q1EmptyAfter).toBeNull();

    // Card should be visible
    expect(screen.getByText("First card in empty q1")).toBeTruthy();
  });

  it("T-MNOEMIT-1: creating a card does NOT emit web:matrix:priority-tagged (spy emitWebEvent; assert 0 calls)", async () => {
    // Spy on emitWebEvent BEFORE render
    const emitSpy = vi.spyOn(EventBus, "emitWebEvent").mockImplementation(() => {});

    renderMatrix();
    await waitForSeed();

    // Clear any calls that might happen during seed
    emitSpy.mockClear();

    await openComposerViaHeader();
    await submitComposer("Card that should not emit");

    // Assert: emitWebEvent was NOT called on the create path
    const priorityTaggedCalls = emitSpy.mock.calls.filter(
      (args) => args[0] === "web:matrix:priority-tagged",
    );
    expect(priorityTaggedCalls.length).toBe(0);
    expect(emitSpy).not.toHaveBeenCalledWith("web:matrix:priority-tagged", expect.anything());
  });
});
