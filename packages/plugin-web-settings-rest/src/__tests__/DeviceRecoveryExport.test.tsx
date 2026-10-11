import { accountScope, generationKey } from "@repo/plugin-web-storage";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeviceRecoveryExport } from "../internal/DeviceRecoveryExport.js";

function captureDownload() {
  let blob: Blob;
  const create = vi.fn((value: Blob) => { blob = value; return "blob:device"; });
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: create });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  return { create, text: () => new Promise<string>((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blob);
  }) };
}

describe("device recovery download", () => {
  it("defaults to device settings and never attaches A/B content or legacy data", async () => {
    localStorage.setItem("xai_bk_dash_order", "quick-first");
    localStorage.setItem(accountScope.physicalKey("xai_task_cols"), "private-A");
    localStorage.setItem(generationKey("B", "g-b", "xai_task_cols"), "private-B");
    localStorage.setItem("xai_task_cols", "old-private");
    const download = captureDownload();
    render(<DeviceRecoveryExport lang="en" />);
    for (const input of screen.getAllByRole("checkbox", { hidden: true })) expect(input).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Download device data file", hidden: true }));
    const text = await download.text();
    expect(JSON.parse(text)).toMatchObject({ kind: "device-recovery", device: { records: { xai_bk_dash_order: "quick-first" } }, legacy: { records: {} }, archives: { records: {} }, manifest: { restoreSupported: false } });
    expect(text).not.toContain("private-A"); expect(text).not.toContain("private-B"); expect(text).not.toContain("old-private");
  });

  it("includes explicitly selected old business bytes without altering originals", async () => {
    const raw = '  {broken business JSON\n';
    localStorage.setItem("xai_task_cols", raw);
    const download = captureDownload();
    render(<DeviceRecoveryExport lang="en" />);
    fireEvent.click(screen.getByLabelText("Include old local data without an assigned account"));
    fireEvent.click(screen.getByRole("button", { name: "Download device data file", hidden: true }));
    expect(JSON.parse(await download.text()).legacy.records.xai_task_cols).toBe(raw);
    expect(localStorage.getItem("xai_task_cols")).toBe(raw);
  });

  it("does not download using a stale account pane", () => {
    const download = captureDownload();
    render(<DeviceRecoveryExport lang="zh" />);
    accountScope.activate(accountScope.lock("new-account"), "new-generation");
    fireEvent.click(screen.getByRole("button", { name: "下载设备数据文件", hidden: true }));
    expect(download.create).not.toHaveBeenCalled();
    expect(screen.getByRole("alert", { hidden: true })).toHaveTextContent("无法导出");
  });

  it("reports excluded history without revealing its contents", async () => {
    localStorage.setItem("xai_pref_access_token", "sensitive-token-fixture");
    const download = captureDownload();
    render(<DeviceRecoveryExport lang="en" />);
    fireEvent.click(screen.getByLabelText("Include old local data without an assigned account"));
    fireEvent.click(screen.getByRole("button", { name: "Download device data file", hidden: true }));
    expect(screen.getByRole("status", { hidden: true })).toHaveTextContent("1 items were excluded");
    expect(await download.text()).not.toContain("sensitive-token-fixture");
    expect(localStorage.getItem("xai_pref_access_token")).toBe("sensitive-token-fixture");
  });
});
