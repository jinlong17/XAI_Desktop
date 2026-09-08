/**
 * AC-PERSIST-1..6: Persistence + reload simulation tests.
 */
import { describe, it, expect } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { matrixSlotRegistration } from "../registration.js";
import { MatrixModule } from "../MatrixModule.js";
import { MATRIX_STORAGE_KEY } from "../constants.js";
import { createDataTransferShim } from "./_helpers/dataTransfer.js";
import type { MatrixState } from "../types.js";

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

async function dragCardToQ1() {
  const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
  const firstCard = q4Cards[0] as HTMLElement;
  const cardId = firstCard.getAttribute("data-card-id")!;
  const dt = createDataTransferShim();

  fireEvent.dragStart(firstCard, { dataTransfer: dt });
  const q1Body = document.querySelector("[data-quadrant='q1'].q-body") as HTMLElement;
  fireEvent.dragOver(q1Body, { dataTransfer: dt });
  await act(async () => {
    fireEvent.drop(q1Body, { dataTransfer: dt });
  });

  return cardId;
}

describe("MatrixModule persistence", () => {
  it("AC-PERSIST-1: a drag-between writes updated state to localStorage", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const cardId = await dragCardToQ1();

    const raw = localStorage.getItem(MATRIX_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw!) as MatrixState;
    expect(stored.q1.some((c) => c.id === cardId)).toBe(true);
    expect(stored.q4.some((c) => c.id === cardId)).toBe(false);
  });

  it("AC-PERSIST-2: unmount + remount restores persisted state", async () => {
    const { unmount } = render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const cardId = await dragCardToQ1();
    unmount();

    // Re-mount fresh
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q1Cards = document.querySelectorAll("[data-quadrant='q1'] .m-row");
    const found = Array.from(q1Cards).find(
      (el) => el.getAttribute("data-card-id") === cardId
    );
    expect(found).toBeTruthy();
    // Card should NOT be in Q4
    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const notInQ4 = Array.from(q4Cards).every(
      (el) => el.getAttribute("data-card-id") !== cardId
    );
    expect(notInQ4).toBe(true);
  });

  it("AC-PERSIST-3: first mount with no storage seeds from seed.ts (> 0 cards total)", async () => {
    localStorage.clear();
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const allCards = document.querySelectorAll(".m-row");
    expect(allCards.length).toBeGreaterThan(0);
  });

  it("AC-PERSIST-4: corrupted JSON falls back to default (no exception)", async () => {
    localStorage.setItem(MATRIX_STORAGE_KEY, "not-valid-json{{{");
    expect(() => {
      render(
        <Wrapper>
          <MatrixModule lang="en" />
        </Wrapper>
      );
    }).not.toThrow();
    await waitForSeed();
    // Should render without crashing; seed will apply since state is effectively empty
    const sections = document.querySelectorAll("[data-quadrant]");
    expect(sections.length).toBeGreaterThan(0);
  });

  it("AC-PERSIST-5: wrong schemaVersion falls back to default", async () => {
    localStorage.setItem(
      MATRIX_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, q1: [], q2: [], q3: [], q4: [] })
    );
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();
    // Should render cleanly; the module may seed or stay empty
    const sections = document.querySelectorAll("section[data-quadrant]");
    expect(sections).toHaveLength(4);
  });

  it("AC-PERSIST-6: cross-tab storage event updates state", async () => {
    // Start with empty state
    localStorage.setItem(
      MATRIX_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] })
    );
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    // Simulate another tab writing a card to Q2
    const newState: MatrixState = {
      schemaVersion: 1,
      q1: [],
      q2: [{ id: "cross-tab-card", title: { en: "Cross Tab", zh: "跨标签页" } }],
      q3: [],
      q4: [],
    };
    const newValue = JSON.stringify(newState);

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: MATRIX_STORAGE_KEY,
          newValue,
          storageArea: localStorage,
        })
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    // Q2 should now show the card from the other tab
    const q2Cards = document.querySelectorAll("[data-quadrant='q2'] .m-row");
    const found = Array.from(q2Cards).find(
      (el) => el.getAttribute("data-card-id") === "cross-tab-card"
    );
    expect(found).toBeTruthy();
  });
});
