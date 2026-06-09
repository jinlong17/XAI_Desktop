import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricTrackerModule } from "../MetricTrackerModule.js";
import { readMetricTrackerState } from "../internal/storage.js";

describe("MetricTrackerModule", () => {
  it("renders the V1 goal-progress tracker surface", () => {
    render(<MetricTrackerModule lang="zh" />);
    expect(screen.getByText("指标追踪")).toBeInTheDocument();
    expect(screen.getByText("目标进度")).toBeInTheDocument();
    expect(screen.getByText("体重记录")).toBeInTheDocument();
    expect(screen.getAllByText("记一下")).toHaveLength(2);
    expect(screen.getByText("导出与分享")).toBeInTheDocument();
  });

  it("creates a new weight record from the quick-log form", () => {
    render(<MetricTrackerModule lang="zh" />);
    fireEvent.change(screen.getByLabelText("体重数值"), { target: { value: "71.8" } });
    fireEvent.change(screen.getByPlaceholderText("例如：早餐前、运动后、睡前等…"), { target: { value: "测试新增" } });
    fireEvent.click(screen.getByText("保存记录"));
    const state = readMetricTrackerState();
    expect(state.records.some((record) => record.value === 71.8 && record.note === "测试新增")).toBe(true);
  });

  it("edits and soft-deletes an existing record", () => {
    render(<MetricTrackerModule lang="zh" />);
    fireEvent.click(screen.getAllByLabelText("编辑记录")[0]!);
    fireEvent.change(screen.getByLabelText("体重数值"), { target: { value: "72.1" } });
    fireEvent.click(screen.getByText("保存修改"));
    expect(readMetricTrackerState().records.find((record) => record.id === "mw_20260525")?.value).toBe(72.1);

    fireEvent.click(screen.getAllByLabelText("删除记录")[0]!);
    expect(readMetricTrackerState().records.find((record) => record.id === "mw_20260525")?.deleted).toBe(true);
  });
});
