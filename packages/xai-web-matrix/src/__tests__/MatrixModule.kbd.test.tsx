/**
 * AC-KBD-1..6: Keyboard a11y fallback tests.
 */
import { describe, it, expect } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { matrixSlotRegistration } from "../registration.js";
import { MatrixModule } from "../MatrixModule.js";

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

async function waitForSeed() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe("MatrixModule keyboard a11y", () => {
  it("AC-KBD-1: card rows have tabIndex=0", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const cards = document.querySelectorAll(".m-row[tabindex='0']");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("AC-KBD-2: Ctrl+ArrowLeft from Q4 (col=1) wraps to Q3 (col=0)", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    expect(q4Cards.length).toBeGreaterThan(0);
    const firstCard = q4Cards[0] as HTMLElement;
    const cardId = firstCard.getAttribute("data-card-id")!;

    await act(async () => {
      fireEvent.keyDown(firstCard, { key: "ArrowLeft", ctrlKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });

    // Q4 col=1 → ArrowLeft → col=0 at row=1 → Q3
    const q3Cards = document.querySelectorAll("[data-quadrant='q3'] .m-row");
    const moved = Array.from(q3Cards).find((el) => el.getAttribute("data-card-id") === cardId);
    expect(moved).toBeTruthy();
  });

  it("AC-KBD-3: Cmd+ArrowLeft (metaKey) also moves the card", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const firstCard = q4Cards[0] as HTMLElement;
    const cardId = firstCard.getAttribute("data-card-id")!;
    const countBefore = q4Cards.length;

    await act(async () => {
      fireEvent.keyDown(firstCard, { key: "ArrowLeft", metaKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });

    const q4After = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    expect(q4After.length).toBe(countBefore - 1);

    const stillInQ4 = Array.from(q4After).find((el) => el.getAttribute("data-card-id") === cardId);
    expect(stillInQ4).toBeUndefined();
  });

  it("AC-KBD-4: ArrowLeft without modifier does NOT move the card", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const firstCard = q4Cards[0] as HTMLElement;
    const cardId = firstCard.getAttribute("data-card-id")!;
    const countBefore = q4Cards.length;

    await act(async () => {
      fireEvent.keyDown(firstCard, { key: "ArrowLeft" }); // no modifier
      await new Promise((r) => setTimeout(r, 0));
    });

    const q4After = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    expect(q4After.length).toBe(countBefore);
    const stillInQ4 = Array.from(q4After).find((el) => el.getAttribute("data-card-id") === cardId);
    expect(stillInQ4).toBeTruthy();
  });

  it("AC-KBD-5: wrap-around — Ctrl+ArrowRight from Q4 (col=1) wraps to Q3 (col=0)... then back", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const firstCard = q4Cards[0] as HTMLElement;
    const cardId = firstCard.getAttribute("data-card-id")!;

    // First move: Q4 col=1 → ArrowRight → col=0 (wrap) at row=1 → Q3
    await act(async () => {
      fireEvent.keyDown(firstCard, { key: "ArrowRight", ctrlKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });

    const q3Cards = document.querySelectorAll("[data-quadrant='q3'] .m-row");
    const inQ3 = Array.from(q3Cards).find((el) => el.getAttribute("data-card-id") === cardId);
    expect(inQ3).toBeTruthy();

    // Second move: from Q3 col=0 → ArrowRight → col=1 at row=1 → Q4
    await act(async () => {
      fireEvent.keyDown(inQ3 as HTMLElement, { key: "ArrowRight", ctrlKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });

    const q4CardsAfter = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const backInQ4 = Array.from(q4CardsAfter).find((el) => el.getAttribute("data-card-id") === cardId);
    expect(backInQ4).toBeTruthy();
  });

  it("AC-KBD-6: Ctrl+ArrowDown from Q1 (row=0) moves to Q3 (row=1)", async () => {
    // Pre-populate Q1 via localStorage
    const { MATRIX_STORAGE_KEY } = await import("../constants.js");
    localStorage.setItem(
      MATRIX_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        q1: [{ id: "kbd-test-card", title: { en: "Test", zh: "测试" } }],
        q2: [],
        q3: [],
        q4: [],
      })
    );

    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q1Cards = document.querySelectorAll("[data-quadrant='q1'] .m-row");
    expect(q1Cards.length).toBeGreaterThan(0);
    const card = q1Cards[0] as HTMLElement;

    // Q1 row=0 → ArrowDown → row=1 at col=0 → Q3
    await act(async () => {
      fireEvent.keyDown(card, { key: "ArrowDown", ctrlKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });

    const q3Cards = document.querySelectorAll("[data-quadrant='q3'] .m-row");
    const inQ3 = Array.from(q3Cards).find((el) => el.getAttribute("data-card-id") === "kbd-test-card");
    expect(inQ3).toBeTruthy();

    // Wrap back: Q3 row=1 → ArrowDown → row=0 at col=0 → Q1
    await act(async () => {
      fireEvent.keyDown(inQ3 as HTMLElement, { key: "ArrowDown", ctrlKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });

    const q1CardsAfter = document.querySelectorAll("[data-quadrant='q1'] .m-row");
    const backInQ1 = Array.from(q1CardsAfter).find((el) => el.getAttribute("data-card-id") === "kbd-test-card");
    expect(backInQ1).toBeTruthy();
  });
});
