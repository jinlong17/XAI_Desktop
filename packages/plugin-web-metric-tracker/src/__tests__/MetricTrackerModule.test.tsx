import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricTrackerModule } from "../MetricTrackerModule.js";
import { readMetricTrackerState } from "../internal/storage.js";

describe("MetricTrackerModule", () => {
  it("renders the V1 goal-progress tracker surface", () => {
    render(<MetricTrackerModule lang="zh" />);
    expect(screen.getByText("指标追踪")).toBeInTheDocument();
    expect(screen.getByText("目标进度")).toBeInTheDocument();
    expect(screen.getByText("体重记录")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "记一下" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("导出与分享")).toBeInTheDocument();
  });

  it("lets the data preview use its own range and exposes chart point values", () => {
    render(<MetricTrackerModule lang="zh" />);
    const previewRange = screen.getByRole("tablist", { name: "数据预览时间范围" });
    expect(within(previewRange).getByRole("button", { name: "今年" })).toBeInTheDocument();
    expect(within(previewRange).getByRole("button", { name: "全部" })).toBeInTheDocument();
    expect(within(previewRange).getByRole("button", { name: "上个月" })).toBeInTheDocument();
    expect(within(previewRange).getByRole("button", { name: "近三个月" })).toBeInTheDocument();

    fireEvent.click(within(previewRange).getByRole("button", { name: "自定义" }));
    expect(screen.getByLabelText("预览开始日期")).toBeInTheDocument();
    expect(screen.getByLabelText("预览结束日期")).toBeInTheDocument();

    fireEvent.click(within(previewRange).getByRole("button", { name: "全部" }));
    expect(screen.getByLabelText("5月7日 · 74.5 kg")).toBeInTheDocument();
  });

  it("opens a quick-log dialog and creates a new weight record", () => {
    render(<MetricTrackerModule lang="zh" />);
    fireEvent.click(screen.getByRole("button", { name: "记一下" }));
    expect(screen.getByRole("dialog", { name: "记一下" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("体重数值"), { target: { value: "71.8" } });
    fireEvent.change(screen.getByPlaceholderText("例如：早餐前、运动后、睡前等…"), { target: { value: "测试新增" } });
    fireEvent.click(screen.getByText("保存记录"));
    const state = readMetricTrackerState();
    expect(state.records.some((record) => record.value === 71.8 && record.note === "测试新增")).toBe(true);
    expect(state.records.find((record) => record.note === "测试新增")?.measuredAt).toMatch(/Z$/);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("edits and soft-deletes an existing record", () => {
    render(<MetricTrackerModule lang="zh" />);
    fireEvent.click(screen.getAllByLabelText("编辑记录")[0]!);
    expect(screen.getByRole("dialog", { name: "更新记录" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("体重数值"), { target: { value: "72.1" } });
    fireEvent.click(screen.getByText("保存修改"));
    expect(readMetricTrackerState().records.find((record) => record.id === "mw_20260525")?.value).toBe(72.1);

    fireEvent.click(screen.getAllByLabelText("删除记录")[0]!);
    expect(readMetricTrackerState().records.find((record) => record.id === "mw_20260525")?.deleted).toBe(true);
  });
});

describe('editing keeps absolute measurement instants', () => {
  it.each(['2026-11-01T09:30:00.000Z', '2026-09-09T18:30:45.123Z'])(
    'retains %s when only weight changes', original => {
      const state = readMetricTrackerState();
      localStorage.setItem('xai_metric_tracker_state_v1', JSON.stringify({
        ...state, records: [{ ...state.records[0], id: 'instant-test', measuredAt: original }],
      }));
      render(<MetricTrackerModule lang="en" />);
      fireEvent.click(within(screen.getByRole('tablist', { name: 'Record range' })).getByRole('button', { name: 'All time' }));
      fireEvent.click(screen.getByLabelText('Edit record'));
      fireEvent.change(screen.getByLabelText('Weight value'), { target: { value: '73.2' } });
      fireEvent.click(screen.getByText('Save changes'));
      expect(readMetricTrackerState().records[0]?.measuredAt).toBe(original);
      expect(readMetricTrackerState().records[0]?.value).toBe(73.2);
    },
  );
});
