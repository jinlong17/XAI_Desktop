/**
 * AC-EVENT-1..5: web:matrix:priority-tagged event emission tests.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { onWebEvent } from "@repo/xai-web-event-bus";
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

describe("MatrixModule event emission", () => {
  let received: unknown[] = [];
  let unsubscribe: () => void;

  beforeEach(() => {
    received = [];
    unsubscribe = onWebEvent("web:matrix:priority-tagged", (payload) => {
      received.push(payload);
    });
  });

  afterEach(() => {
    unsubscribe?.();
  });

  it("AC-EVENT-1: drag-between emits exactly one web:matrix:priority-tagged", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

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

    expect(received).toHaveLength(1);
    const ev = received[0] as { cardId: string; from: string; to: string; taggedAt: string };
    expect(ev.cardId).toBe(cardId);
    expect(ev.from).toBe("q4");
    expect(ev.to).toBe("q1");
  });

  it("AC-EVENT-2: no event on drag within same quadrant", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const firstCard = q4Cards[0] as HTMLElement;
    const dt = createDataTransferShim();

    fireEvent.dragStart(firstCard, { dataTransfer: dt });
    const q4Body = document.querySelector("[data-quadrant='q4'].q-body") as HTMLElement;
    fireEvent.dragOver(q4Body, { dataTransfer: dt });
    await act(async () => {
      fireEvent.drop(q4Body, { dataTransfer: dt });
    });

    expect(received).toHaveLength(0);
  });

  it("AC-EVENT-3: no event on cross-tab storage hydration", async () => {
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

    const newState: MatrixState = {
      schemaVersion: 1,
      q1: [{ id: "cross-tab", title: { en: "Tab", zh: "标签" } }],
      q2: [], q3: [], q4: [],
    };

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: MATRIX_STORAGE_KEY,
          newValue: JSON.stringify(newState),
          storageArea: localStorage,
        })
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(received).toHaveLength(0);
  });

  it("AC-EVENT-4: keyboard-move emits the event", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const firstCard = q4Cards[0] as HTMLElement;
    const cardId = firstCard.getAttribute("data-card-id")!;

    await act(async () => {
      fireEvent.keyDown(firstCard, { key: "ArrowLeft", ctrlKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(received).toHaveLength(1);
    const ev = received[0] as { cardId: string; to: string };
    expect(ev.cardId).toBe(cardId);
    // Q4 is at row=1,col=1; ArrowLeft wraps to col=0 → Q3
    expect(["q1", "q2", "q3"].includes(ev.to)).toBe(true);
  });

  it("AC-EVENT-5: taggedAt is a parseable ISO timestamp within 1s of now", async () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    await waitForSeed();

    const before = Date.now();

    const q4Cards = document.querySelectorAll("[data-quadrant='q4'] .m-row");
    const firstCard = q4Cards[0] as HTMLElement;
    const dt = createDataTransferShim();

    fireEvent.dragStart(firstCard, { dataTransfer: dt });
    const q1Body = document.querySelector("[data-quadrant='q1'].q-body") as HTMLElement;
    fireEvent.dragOver(q1Body, { dataTransfer: dt });
    await act(async () => {
      fireEvent.drop(q1Body, { dataTransfer: dt });
    });

    const after = Date.now();

    expect(received).toHaveLength(1);
    const ev = received[0] as { taggedAt: string };
    const ts = Date.parse(ev.taggedAt);
    expect(isFinite(ts)).toBe(true);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after + 1000);
  });
});
