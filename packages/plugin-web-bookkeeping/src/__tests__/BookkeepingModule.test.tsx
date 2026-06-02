import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookkeepingModule } from "../BookkeepingModule.js";
import { readBookkeepingState } from "../internal/storage.js";

describe("BookkeepingModule", () => {
  it("renders the Cloud Design tabs and can add a persisted expense record", () => {
    render(<BookkeepingModule lang="zh" />);

    expect(screen.getByTestId("bookkeeping-module")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "总看板" })).toHaveClass("on");
    expect(screen.getByRole("button", { name: "日历" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "预算" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /记一笔/ })[0]!);
    expect(screen.getByRole("heading", { name: "记一笔" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.change(screen.getByPlaceholderText("点下方模板或手动输入"), { target: { value: "测试午餐" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    const state = readBookkeepingState();
    expect(state.tx[0]).toMatchObject({ note: "测试午餐", amount: 12, type: "expense", ledger: "daily" });
    expect(state.accounts.find((account) => account.id === "wx")?.balance).toBe(3268);
  });
});
