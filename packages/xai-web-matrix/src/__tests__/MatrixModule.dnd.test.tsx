/**
 * AC-DND-1..5: HTML5 Drag-and-drop tests.
 */
import { describe, it, expect } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { matrixSlotRegistration } from "../registration.js";
import { MatrixModule } from "../MatrixModule.js";
import { createDataTransferShim } from "./_helpers/dataTransfer.js";

const MATRIX_MIME = "application/x-xai-matrix-card";

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

function renderMatrix() {
  return render(
    <Wrapper>
      <MatrixModule lang="en" />
    </Wrapper>
  );
}

/** Wait for seed hydration (happens in useEffect on first mount) */
async function waitForSeed() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe("MatrixModule DnD", () => {
  it("AC-DND-1: dragging a card from Q4 to Q1 moves it", async () => {
    renderMatrix();
    await waitForSeed();

    // Get first card in Q4 (seed puts cards in Q4)
    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    expect(q4Cards.length).toBeGreaterThan(0);
    const firstCard = q4Cards[0] as HTMLElement;
    const cardId = firstCard.getAttribute("data-card-id")!;
    expect(cardId).toBeTruthy();

    const dt = createDataTransferShim();

    // Drag start on the card
    fireEvent.dragStart(firstCard, { dataTransfer: dt });

    // DragOver on Q1 body
    const q1Body = document.querySelector("[data-quadrant='q1'].q-body") as HTMLElement;
    fireEvent.dragOver(q1Body, { dataTransfer: dt });

    // Drop on Q1 body
    await act(async () => {
      fireEvent.drop(q1Body, { dataTransfer: dt });
    });

    // Card should now be in Q1
    const q1Cards = document.querySelectorAll("[data-quadrant='q1'] .m-row");
    const movedCard = Array.from(q1Cards).find(
      (el) => el.getAttribute("data-card-id") === cardId
    );
    expect(movedCard).toBeTruthy();
  });

  it("AC-DND-2: dragging within the same quadrant is a no-op", async () => {
    renderMatrix();
    await waitForSeed();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const countBefore = q4Cards.length;
    expect(countBefore).toBeGreaterThan(0);

    const firstCard = q4Cards[0] as HTMLElement;
    const cardId = firstCard.getAttribute("data-card-id")!;
    const dt = createDataTransferShim();

    fireEvent.dragStart(firstCard, { dataTransfer: dt });

    const q4Body = document.querySelector("[data-quadrant='q4'].q-body") as HTMLElement;
    fireEvent.dragOver(q4Body, { dataTransfer: dt });
    await act(async () => {
      fireEvent.drop(q4Body, { dataTransfer: dt });
    });

    // Count should be unchanged
    const q4CardsAfter = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    expect(q4CardsAfter.length).toBe(countBefore);

    // Card should still be in Q4
    const stillThere = Array.from(q4CardsAfter).find(
      (el) => el.getAttribute("data-card-id") === cardId
    );
    expect(stillThere).toBeTruthy();
  });

  it("AC-DND-3: drop with empty dataTransfer is a no-op", async () => {
    renderMatrix();
    await waitForSeed();

    const countBefore = document.querySelectorAll(".m-row").length;
    const emptyDt = createDataTransferShim(); // no card id set

    const q1Body = document.querySelector("[data-quadrant='q1'].q-body") as HTMLElement;
    await act(async () => {
      fireEvent.drop(q1Body, { dataTransfer: emptyDt });
    });

    const countAfter = document.querySelectorAll(".m-row").length;
    expect(countAfter).toBe(countBefore);
  });

  it("AC-DND-4: onDragOver renders data-dragover=true only when matrix MIME is present (implicit preventDefault check)", async () => {
    // jsdom does not support DragEvent constructor; we use fireEvent from
    // @testing-library/react which calls preventDefault internally.
    // We verify the side-effect: data-dragover="true" is set only when
    // the matrix MIME is present in the dataTransfer.
    renderMatrix();
    await waitForSeed();

    const q1Body = document.querySelector("[data-quadrant='q1'].q-body") as HTMLElement;

    // Drag with matrix MIME → highlight should appear
    const dtWith = createDataTransferShim({ [MATRIX_MIME]: "any-card-id" });
    fireEvent.dragOver(q1Body, { dataTransfer: dtWith });
    expect(q1Body.getAttribute("data-dragover")).toBe("true");
    fireEvent.dragLeave(q1Body);

    // Drag without matrix MIME → no highlight (preventDefault not called,
    // handler returns early before setIsDragOver(true))
    const dtWithout = createDataTransferShim({ "text/plain": "non-matrix" });
    fireEvent.dragOver(q1Body, { dataTransfer: dtWithout });
    expect(q1Body.getAttribute("data-dragover")).toBeNull();
  });

  it("AC-DND-5: q-body gets data-dragover='true' during dragover, removed after dragleave", async () => {
    renderMatrix();
    await waitForSeed();

    const q1Body = document.querySelector("[data-quadrant='q1'].q-body") as HTMLElement;
    const dt = createDataTransferShim({ [MATRIX_MIME]: "some-id" });

    expect(q1Body.getAttribute("data-dragover")).toBeNull();

    fireEvent.dragOver(q1Body, { dataTransfer: dt });
    expect(q1Body.getAttribute("data-dragover")).toBe("true");

    fireEvent.dragLeave(q1Body);
    expect(q1Body.getAttribute("data-dragover")).toBeNull();
  });
});
