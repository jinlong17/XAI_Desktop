// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TagPicker } from "./TagPicker";

afterEach(() => {
  cleanup();
});

describe("TagPicker", () => {
  it("hides the input row when readOnly is true", () => {
    const { queryByLabelText } = render(<TagPicker tags={[{ name: "Focus", color: "blue" }]} readOnly />);

    expect(queryByLabelText("Finder tag")).toBeNull();
    expect(queryByLabelText("Finder tag color")).toBeNull();
  });

  it("does not trigger onChange when readOnly tag badges are clicked", () => {
    const onChange = vi.fn();
    const { getByText } = render(<TagPicker tags={[{ name: "Focus", color: "blue" }]} onChange={onChange} readOnly />);

    fireEvent.click(getByText("Focus"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the disabled helper copy when readOnly is true", () => {
    const { getByText } = render(<TagPicker tags={[]} readOnly />);

    expect(getByText("Finder tag write is disabled until the platform command lands.")).toBeTruthy();
  });

  it("keeps the writable flow when readOnly is omitted", () => {
    const onChange = vi.fn();
    const { getByLabelText, getByText } = render(<TagPicker tags={[{ name: "Focus", color: "blue" }]} onChange={onChange} />);

    fireEvent.change(getByLabelText("Finder tag"), { target: { value: "Inbox" } });
    fireEvent.change(getByLabelText("Finder tag color"), { target: { value: "green" } });
    fireEvent.click(getByText("+"));

    expect(onChange).toHaveBeenCalledWith([
      { name: "Focus", color: "blue" },
      { name: "Inbox", color: "green" },
    ]);
  });
});
