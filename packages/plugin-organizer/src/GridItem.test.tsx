// @vitest-environment jsdom
import { DndContext } from "@dnd-kit/core";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GridItem } from "./GridItem";
import type { DesktopItem } from "./types";

vi.mock("@repo/core/hooks", () => ({
  useTauriInvoke: () => ({
    invoke: vi.fn(async () => []),
  }),
}));

afterEach(() => {
  cleanup();
});

function makeItem(filename: string): DesktopItem {
  return {
    id: "item-1",
    filename,
    filepath: "/Users/me/example.webloc",
    type: "file",
    icon: "file",
    createdAt: 1,
  };
}

describe("GridItem", () => {
  it("keeps long grid filenames constrained so ellipsis can apply", () => {
    const filename = "上海驿飞国际货运代理有限公司-非常非常长的文件名.webloc";
    const { getByTitle } = render(
      <DndContext>
        <GridItem item={makeItem(filename)} variant="grid" />
      </DndContext>,
    );

    const filenameNode = getByTitle(filename);
    const textBox = filenameNode.parentElement as HTMLElement;
    const root = textBox.parentElement as HTMLElement;

    expect(root.style.minWidth).toBe("0px");
    expect(textBox.style.minWidth).toBe("0px");
    expect(textBox.style.width).toBe("100%");
    expect(filenameNode.style.overflow).toBe("hidden");
    expect(filenameNode.style.textOverflow).toBe("ellipsis");
    expect(filenameNode.style.whiteSpace).toBe("nowrap");
  });
});
