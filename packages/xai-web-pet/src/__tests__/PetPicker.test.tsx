/**
 * PetPicker.test.tsx — AC-PET-7, AC-PET-9, AC-PET-15 tests.
 *
 * Covers:
 * - Open/close behavior
 * - 8 rows rendered with correct names
 * - Current row gets .current class + "Selected" label
 * - Row click calls onSelect(id) THEN onClose()
 * - Scrim click → onClose()
 * - Close button click → onClose()
 * - .pet-swap-btn opens picker (AC-PET-15) — tested via DesktopPet
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { PetPicker } from "../PetPicker.js";
import { PET_DEFS } from "../internal/petDefs.js";
import type { PetId } from "../types.js";

const ALL_IDS = PET_DEFS.map((p) => p.id);

function makeProps(overrides?: Partial<Parameters<typeof PetPicker>[0]>) {
  const props = {
    open: true,
    onClose: vi.fn() as () => void,
    current: "mochi" as PetId,
    onSelect: vi.fn() as (next: PetId) => void,
    lang: "en" as const,
    ...overrides,
  };
  return props;
}

describe("PetPicker", () => {
  it("returns null when open=false", () => {
    const { container } = render(
      <PetPicker {...makeProps({ open: false })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the modal scrim when open=true", () => {
    const { container } = render(<PetPicker {...makeProps()} />);
    expect(container.querySelector(".pet-picker-scrim")).not.toBeNull();
  });

  it("renders 8 .pp-row buttons (one per PET_DEF)", () => {
    const { container } = render(<PetPicker {...makeProps()} />);
    const rows = container.querySelectorAll(".pp-row");
    expect(rows).toHaveLength(8);
  });

  it("renders each pet's name in EN", () => {
    const { container } = render(<PetPicker {...makeProps({ lang: "en" }) } />);
    for (const def of PET_DEFS) {
      const row = Array.from(container.querySelectorAll(".pp-name")).find(
        (el) => el.textContent === def.name.en,
      );
      expect(row).toBeDefined();
    }
  });

  it("renders each pet's name in ZH when lang=zh", () => {
    const { container } = render(<PetPicker {...makeProps({ lang: "zh" })} />);
    for (const def of PET_DEFS) {
      const row = Array.from(container.querySelectorAll(".pp-name")).find(
        (el) => el.textContent === def.name.zh,
      );
      expect(row).toBeDefined();
    }
  });

  it("current row has .current class", () => {
    const { container } = render(<PetPicker {...makeProps({ current: "pip" })} />);
    const currentRow = container.querySelector(".pp-row.current");
    expect(currentRow).not.toBeNull();
    // The current row should contain pip's name
    expect(currentRow?.textContent).toContain("Pip");
  });

  it("current row's .pp-btn has .selected class and shows 'Selected'", () => {
    const { container } = render(<PetPicker {...makeProps({ current: "mochi" })} />);
    const selectedBtn = container.querySelector(".pp-btn.selected");
    expect(selectedBtn).not.toBeNull();
    expect(selectedBtn?.textContent).toBe("Selected");
  });

  it("non-current rows show 'Select' label (EN)", () => {
    const { container } = render(<PetPicker {...makeProps({ current: "mochi" })} />);
    const unselectedBtns = container.querySelectorAll(".pp-btn:not(.selected)");
    for (const btn of unselectedBtns) {
      expect(btn.textContent).toBe("Select");
    }
  });

  it("row click calls onSelect(id) then onClose() synchronously", () => {
    const callOrder: string[] = [];
    const onSelect = vi.fn(() => { callOrder.push("select"); });
    const onClose = vi.fn(() => { callOrder.push("close"); });
    const { container } = render(
      <PetPicker
        open={true}
        onClose={onClose}
        current="mochi"
        onSelect={onSelect}
        lang="en"
      />,
    );

    // Click the "pip" row
    const rows = container.querySelectorAll(".pp-row");
    const pipRow = Array.from(rows).find((r) => r.textContent?.includes("Pip"));
    expect(pipRow).toBeDefined();
    fireEvent.click(pipRow!);

    expect(onSelect).toHaveBeenCalledWith("pip");
    expect(onClose).toHaveBeenCalledTimes(1);
    // Both called, select before close
    expect(callOrder).toEqual(["select", "close"]);
  });

  it("scrim click calls onClose()", () => {
    const props = makeProps();
    const { container } = render(<PetPicker {...props} />);
    const scrim = container.querySelector(".pet-picker-scrim") as HTMLElement;
    fireEvent.click(scrim);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("close button click calls onClose()", () => {
    const props = makeProps();
    const { container } = render(<PetPicker {...props} />);
    const closeBtn = container.querySelector(".pp-close-btn") as HTMLElement;
    fireEvent.click(closeBtn);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("card click does NOT call onClose (stops propagation)", () => {
    const props = makeProps();
    const { container } = render(<PetPicker {...props} />);
    const card = container.querySelector(".pet-picker") as HTMLElement;
    fireEvent.click(card);
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it("renders all 8 pet ids via rows", () => {
    const { container } = render(<PetPicker {...makeProps()} />);
    const rows = container.querySelectorAll(".pp-row");
    // Each row should have an avatar with one of the 8 pet anim classes
    for (const id of ALL_IDS) {
      const def = PET_DEFS.find((p) => p.id === id)!;
      const avatar = container.querySelector(`.pet-anim-${def.anim}`);
      expect(avatar).not.toBeNull();
    }
  });

  it("footer renders hint text in English", () => {
    const { container } = render(<PetPicker {...makeProps({ lang: "en" })} />);
    const footer = container.querySelector(".pp-foot");
    expect(footer?.textContent).toContain("Drag the pet anywhere");
  });

  it("footer renders hint text in Chinese", () => {
    const { container } = render(<PetPicker {...makeProps({ lang: "zh" })} />);
    const footer = container.querySelector(".pp-foot");
    expect(footer?.textContent).toContain("拖动桌宠");
  });

  it("renders heading in English", () => {
    const { container } = render(<PetPicker {...makeProps({ lang: "en" })} />);
    const h3 = container.querySelector(".pp-head h3");
    expect(h3?.textContent).toBe("Choose your companion");
  });

  it("renders heading in Chinese", () => {
    const { container } = render(<PetPicker {...makeProps({ lang: "zh" })} />);
    const h3 = container.querySelector(".pp-head h3");
    expect(h3?.textContent).toBe("选择你的桌宠");
  });
});

// ---------------------------------------------------------------------------
// AC-PET-15: swap button opens picker without triggering drag
// ---------------------------------------------------------------------------

describe("DesktopPet .pet-swap-btn opens picker (AC-PET-15)", () => {
  it("click on .pet-swap-btn opens picker (no drag triggered)", async () => {
    const { DesktopPet } = await import("../DesktopPet.js");
    const { container } = render(<DesktopPet on={true} lang="en" />);

    const swapBtn = container.querySelector(".pet-swap-btn") as HTMLElement;
    expect(swapBtn).not.toBeNull();

    // pointerDown should stopPropagation so drag is not started
    fireEvent.pointerDown(swapBtn, { clientX: 50, clientY: 50 });

    // Click should open the picker
    fireEvent.click(swapBtn);

    const scrim = container.querySelector(".pet-picker-scrim");
    expect(scrim).not.toBeNull();
  });
});
