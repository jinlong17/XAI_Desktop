/**
 * AC-I18N-1..3: Bilingual rendering correctness.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { matrixSlotRegistration } from "../registration.js";
import { MatrixModule } from "../MatrixModule.js";

function Wrapper({ children, lang = "en" }: { children: React.ReactNode; lang?: "en" | "zh" }) {
  return (
    <WebShellProvider
      modules={[matrixSlotRegistration]}
      lang={lang}
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {children}
    </WebShellProvider>
  );
}

describe("MatrixModule i18n", () => {
  it("AC-I18N-1: EN quadrant titles match expected strings", () => {
    render(
      <Wrapper lang="en">
        <MatrixModule lang="en" />
      </Wrapper>
    );
    const headings = Array.from(document.querySelectorAll(".q-title")).map(
      (h) => h.textContent
    );
    expect(headings).toEqual([
      "Urgent & Important",
      "Not Urgent & Important",
      "Urgent & Unimportant",
      "Not Urgent & Unimportant",
    ]);
  });

  it("AC-I18N-1: ZH quadrant titles match expected strings", () => {
    render(
      <Wrapper lang="zh">
        <MatrixModule lang="zh" />
      </Wrapper>
    );
    const headings = Array.from(document.querySelectorAll(".q-title")).map(
      (h) => h.textContent
    );
    expect(headings).toEqual([
      "紧急 · 重要",
      "不紧急 · 重要",
      "紧急 · 不重要",
      "不紧急 · 不重要",
    ]);
  });

  it("AC-I18N-2: empty q1 shows common.no_tasks in EN", () => {
    // q1 starts empty (seed puts cards in q4)
    render(
      <Wrapper lang="en">
        <MatrixModule lang="en" />
      </Wrapper>
    );
    const q1 = document.querySelector("[data-quadrant='q1'] .q-body");
    const empty = q1?.querySelector(".q-empty");
    expect(empty?.textContent).toBe("No tasks");
  });

  it("AC-I18N-2: empty q1 shows common.no_tasks in ZH", () => {
    render(
      <Wrapper lang="zh">
        <MatrixModule lang="zh" />
      </Wrapper>
    );
    const q1 = document.querySelector("[data-quadrant='q1'] .q-body");
    const empty = q1?.querySelector(".q-empty");
    expect(empty?.textContent).toBe("暂无任务");
  });

  it("AC-I18N-3: module title renders from matrix.title (EN)", () => {
    render(
      <Wrapper lang="en">
        <MatrixModule lang="en" />
      </Wrapper>
    );
    const title = document.querySelector("h1.module-title");
    expect(title?.textContent).toBe("Eisenhower Matrix");
  });

  it("AC-I18N-3: module title renders from matrix.title (ZH)", () => {
    render(
      <Wrapper lang="zh">
        <MatrixModule lang="zh" />
      </Wrapper>
    );
    const title = document.querySelector("h1.module-title");
    expect(title?.textContent).toBe("四象限");
  });
});
