import { accountScope } from "@repo/plugin-web-storage";
/**
 * P3 Edge case tests:
 * - Empty all four quadrants (drag only card out of each) → empty-state hint
 * - Drag from Q4 (--accent) into Q1 (--red) → no token leakage
 * - 100-card stress test
 */
import { describe, it, expect } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { matrixSlotRegistration } from "../registration.js";
import { MatrixModule } from "../MatrixModule.js";
import { MATRIX_STORAGE_KEY } from "../constants.js";
import { createDataTransferShim } from "./_helpers/dataTransfer.js";
import type { MatrixState, MatrixCard } from "../types.js";

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

/** Pre-load a state with exactly one card in each quadrant. */
function setupOneCardPerQuadrant() {
  const state: MatrixState = {
    schemaVersion: 1,
    q1: [{ id: "e1", title: { en: "Card Q1", zh: "Q1卡片" } }],
    q2: [{ id: "e2", title: { en: "Card Q2", zh: "Q2卡片" } }],
    q3: [{ id: "e3", title: { en: "Card Q3", zh: "Q3卡片" } }],
    q4: [{ id: "e4", title: { en: "Card Q4", zh: "Q4卡片" } }],
  };
  localStorage.setItem(accountScope.physicalKey(MATRIX_STORAGE_KEY), JSON.stringify(state));
}

describe("MatrixModule edge cases", () => {
  it("P3-EDGE-1: emptying Q1 (drag only card out) shows q-empty hint", async () => {
    setupOneCardPerQuadrant();
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q1Card = document.querySelector("[data-quadrant='q1'] .m-row") as HTMLElement;
    expect(q1Card).toBeTruthy();
    const dt = createDataTransferShim();

    fireEvent.dragStart(q1Card, { dataTransfer: dt });
    const q2Body = document.querySelector("[data-quadrant='q2'].q-body") as HTMLElement;
    fireEvent.dragOver(q2Body, { dataTransfer: dt });
    await act(async () => {
      fireEvent.drop(q2Body, { dataTransfer: dt });
    });

    const q1Body = document.querySelector("[data-quadrant='q1'] .q-body");
    const empty = q1Body?.querySelector(".q-empty");
    expect(empty).toBeTruthy();
    expect(empty?.textContent).toBe("No tasks");
  });

  it("P3-EDGE-2: drag from Q4 (--accent) to Q1 (--red) — tokens remain distinct", async () => {
    setupOneCardPerQuadrant();
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    // Verify Q4 has --accent, Q1 has --red before drag
    const q4Section = document.querySelector("section[data-quadrant='q4']") as HTMLElement;
    const q1Section = document.querySelector("section[data-quadrant='q1']") as HTMLElement;
    expect(q4Section.style.getPropertyValue("--qc")).toBe("var(--accent)");
    expect(q1Section.style.getPropertyValue("--qc")).toBe("var(--red)");

    const q4Card = document.querySelector("[data-quadrant='q4'] .m-row") as HTMLElement;
    const dt = createDataTransferShim();
    fireEvent.dragStart(q4Card, { dataTransfer: dt });
    const q1Body = document.querySelector("[data-quadrant='q1'].q-body") as HTMLElement;
    fireEvent.dragOver(q1Body, { dataTransfer: dt });
    await act(async () => {
      fireEvent.drop(q1Body, { dataTransfer: dt });
    });

    // Tokens must still be correct after drag (no leakage)
    expect(q4Section.style.getPropertyValue("--qc")).toBe("var(--accent)");
    expect(q1Section.style.getPropertyValue("--qc")).toBe("var(--red)");

    // Q4 shows empty state; Q1 shows the moved card
    const q4Empty = q4Section.querySelector(".q-empty");
    expect(q4Empty).toBeTruthy();
    const q1Cards = q1Section.querySelectorAll(".m-row");
    expect(q1Cards.length).toBe(2); // e1 was already there, e4 added
  });

  it("P3-EDGE-3: 100-card stress — drag completes without quadratic slowdown", async () => {
    // Seed 25 cards per quadrant
    const makeCards = (prefix: string, count: number): MatrixCard[] =>
      Array.from({ length: count }, (_, i) => ({
        id: `${prefix}-${i}`,
        title: { en: `${prefix} ${i}`, zh: `${prefix} ${i}` },
      }));

    const state: MatrixState = {
      schemaVersion: 1,
      q1: makeCards("q1c", 25),
      q2: makeCards("q2c", 25),
      q3: makeCards("q3c", 25),
      q4: makeCards("q4c", 25),
    };
    localStorage.setItem(accountScope.physicalKey(MATRIX_STORAGE_KEY), JSON.stringify(state));

    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const allCards = document.querySelectorAll(".m-row");
    expect(allCards.length).toBe(100);

    const start = performance.now();

    const q1Card = document.querySelector("[data-quadrant='q1'] .m-row") as HTMLElement;
    const dt = createDataTransferShim();
    fireEvent.dragStart(q1Card, { dataTransfer: dt });
    const q2Body = document.querySelector("[data-quadrant='q2'].q-body") as HTMLElement;
    fireEvent.dragOver(q2Body, { dataTransfer: dt });
    await act(async () => {
      fireEvent.drop(q2Body, { dataTransfer: dt });
    });

    const elapsed = performance.now() - start;
    // 16ms budget in jsdom (generous; real browser perf measured manually)
    expect(elapsed).toBeLessThan(200); // jsdom allowance
  });
});
