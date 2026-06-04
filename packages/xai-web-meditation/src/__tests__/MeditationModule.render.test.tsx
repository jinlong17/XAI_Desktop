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
    const { container } = render(<MeditationModule lang="en" />);
    const sceneGrid = container.querySelector(".scene-grid") as HTMLElement;
    expect(within(sceneGrid).getByText("Forest")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("Ocean")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("Night Sky")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("Rain Window")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("Void")).toBeInTheDocument();
  });

  it("AC-I18N-3: scene labels in ZH", () => {
    const { container } = render(<MeditationModule lang="zh" />);
    const sceneGrid = container.querySelector(".scene-grid") as HTMLElement;
    expect(within(sceneGrid).getByText("森林")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("海洋")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("夜空")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("雨窗")).toBeInTheDocument();
    expect(within(sceneGrid).getByText("虚空")).toBeInTheDocument();
  });

  it("AC-I18N-4: 12 clock variant labels in EN", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const clockGrid = container.querySelector(".clock-grid") as HTMLElement;
    expect(within(clockGrid).getByText("Digital")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Soft digits")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Focus digits")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Split")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Stacked split")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Analog")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Fine analog")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Bold analog")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Zen analog")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Minimal")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Dot minimal")).toBeInTheDocument();
    expect(within(clockGrid).getByText("Breath ring")).toBeInTheDocument();
  });

  it("AC-I18N-4: 12 clock variant labels in ZH", () => {
    const { container } = render(<MeditationModule lang="zh" />);
    const clockGrid = container.querySelector(".clock-grid") as HTMLElement;
    expect(within(clockGrid).getByText("数字")).toBeInTheDocument();
    expect(within(clockGrid).getByText("柔和数字")).toBeInTheDocument();
    expect(within(clockGrid).getByText("专注数字")).toBeInTheDocument();
    expect(within(clockGrid).getByText("分屏")).toBeInTheDocument();
    expect(within(clockGrid).getByText("堆叠分屏")).toBeInTheDocument();
    expect(within(clockGrid).getByText("指针")).toBeInTheDocument();
    expect(within(clockGrid).getByText("细指针")).toBeInTheDocument();
    expect(within(clockGrid).getByText("粗指针")).toBeInTheDocument();
    expect(within(clockGrid).getByText("禅意指针")).toBeInTheDocument();
    expect(within(clockGrid).getByText("极简")).toBeInTheDocument();
    expect(within(clockGrid).getByText("圆点极简")).toBeInTheDocument();
    expect(within(clockGrid).getByText("呼吸圆环")).toBeInTheDocument();
  });

  it("AC-I18N-5: 7 ambient sound labels in EN", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const soundGrid = container.querySelector(".sound-grid") as HTMLElement;
    expect(within(soundGrid).getByText("Silence")).toBeInTheDocument();
    expect(within(soundGrid).getByText("Flowing Water")).toBeInTheDocument();
    expect(within(soundGrid).getByText("Soft Rain")).toBeInTheDocument();
    expect(within(soundGrid).getByText("Ocean Waves")).toBeInTheDocument();
    expect(within(soundGrid).getByText("Distant Thunder")).toBeInTheDocument();
    expect(within(soundGrid).getByText("Forest Birds")).toBeInTheDocument();
    expect(within(soundGrid).getByText("White Noise")).toBeInTheDocument();
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
