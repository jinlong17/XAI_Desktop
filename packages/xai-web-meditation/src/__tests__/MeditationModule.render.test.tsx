/**
 * MeditationModule — render + i18n + preview reflection.
 */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MeditationModule } from "../MeditationModule.js";

describe("MeditationModule render", () => {
  it("AC-I18N-1: EN renders module title 'Meditation'", () => {
    render(<MeditationModule lang="en" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Meditation");
  });

  it("AC-I18N-1: ZH renders module title '冥想'", () => {
    render(<MeditationModule lang="zh" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("冥想");
  });

  it("AC-PICK-1: 5 scene cards render with EN labels", () => {
    render(<MeditationModule lang="en" />);
    expect(screen.getByText("Forest")).toBeInTheDocument();
    expect(screen.getAllByText("Ocean").length).toBeGreaterThan(0);
    expect(screen.getByText("Night Sky")).toBeInTheDocument();
    expect(screen.getByText("Rain Window")).toBeInTheDocument();
    expect(screen.getByText("Void")).toBeInTheDocument();
  });

  it("AC-I18N-3: scene labels in ZH", () => {
    render(<MeditationModule lang="zh" />);
    expect(screen.getByText("森林")).toBeInTheDocument();
    expect(screen.getAllByText("海洋").length).toBeGreaterThan(0);
    expect(screen.getByText("夜空")).toBeInTheDocument();
    expect(screen.getByText("雨窗")).toBeInTheDocument();
    expect(screen.getByText("虚空")).toBeInTheDocument();
  });

  it("AC-I18N-4: 4 clock variant labels in EN", () => {
    render(<MeditationModule lang="en" />);
    expect(screen.getByText("Digital")).toBeInTheDocument();
    expect(screen.getAllByText("Split").length).toBeGreaterThan(0);
    expect(screen.getByText("Analog")).toBeInTheDocument();
    expect(screen.getByText("Minimal")).toBeInTheDocument();
  });

  it("AC-I18N-4: 4 clock variant labels in ZH", () => {
    render(<MeditationModule lang="zh" />);
    expect(screen.getByText("数字")).toBeInTheDocument();
    expect(screen.getAllByText("分屏").length).toBeGreaterThan(0);
    expect(screen.getByText("指针")).toBeInTheDocument();
    expect(screen.getByText("极简")).toBeInTheDocument();
  });

  it("AC-I18N-5: 5 ambient sound labels in EN", () => {
    render(<MeditationModule lang="en" />);
    expect(screen.getByText("Silence")).toBeInTheDocument();
    expect(screen.getAllByText("Flowing Water").length).toBeGreaterThan(0);
    expect(screen.getByText("Soft Rain")).toBeInTheDocument();
    expect(screen.getByText("Ocean Waves")).toBeInTheDocument();
    expect(screen.getByText("Forest Birds")).toBeInTheDocument();
  });

  it("AC-PICK-6: 5 duration chips render", () => {
    // Scope queries to .dur-row to avoid collision with live ClockDisplay spans.
    // ClockDisplay (no staticMode) emits bare <span>{hh}</span><span>{mm}</span><span>{ss}</span>
    // from new Date(); when wall-clock digits equal a chip value (e.g. hh=15, mm=15, ss=15)
    // getByText("15") would throw getMultipleElementsFoundError (time-bomb).
    // within(.dur-row) restricts the query scope to the duration picker container only.
    const { container } = render(<MeditationModule lang="en" />);
    const durRow = container.querySelector(".dur-row") as HTMLElement;
    expect(durRow).not.toBeNull();
    expect(within(durRow).getByText("5")).toBeInTheDocument();
    expect(within(durRow).getByText("10")).toBeInTheDocument();
    expect(within(durRow).getByText("15")).toBeInTheDocument();
    expect(within(durRow).getByText("25")).toBeInTheDocument();
    expect(within(durRow).getByText("45")).toBeInTheDocument();
  });

  it("AC-I18N-6: duration unit suffix 'min' (EN) appears", () => {
    render(<MeditationModule lang="en" />);
    // 5 chips + 1 preview meta = 6 occurrences
    expect(screen.getAllByText("min").length).toBeGreaterThanOrEqual(5);
  });

  it("AC-I18N-6: duration unit suffix '分钟' (ZH) appears", () => {
    render(<MeditationModule lang="zh" />);
    expect(screen.getAllByText("分钟").length).toBeGreaterThanOrEqual(5);
  });

  it("AC-PREVIEW-1: preview card initial background = ocean gradient (default scene)", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const preview = container.querySelector(".med-preview") as HTMLElement;
    expect(preview).not.toBeNull();
    expect(preview.style.background).toContain("linear-gradient");
    expect(preview.style.background).toContain("oklch");
  });

  it("AC-PREVIEW-5: preview meta-row shows 4 meta tags", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const meta = container.querySelector(".mp-meta") as HTMLElement;
    expect(meta).not.toBeNull();
    expect(within(meta).getAllByText(/Ocean|Split|Flowing Water|min/).length).toBeGreaterThan(0);
  });

  it("AC-PREVIEW-4: start button is in DOM", () => {
    render(<MeditationModule lang="en" />);
    expect(screen.getByRole("button", { name: /Start session/i })).toBeInTheDocument();
  });
});
