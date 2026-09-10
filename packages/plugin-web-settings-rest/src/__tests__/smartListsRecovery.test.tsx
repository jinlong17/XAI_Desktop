import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { SMART_LIST_IDS } from "../internal/smartListsPreference.js";
import { smartListsPane } from "../panes/smartListsPane.js";
import { createSmartListsLockManager } from "./smartListsLockFixture.js";

const owner = "smart-lists-settings-test";
let key: string;

async function flush(): Promise<void> {
  await act(async () => { for (let index = 0; index < 12; index += 1) await Promise.resolve(); });
}

function mount() {
  return render(smartListsPane.render({ lang: "en" }));
}

beforeEach(() => {
  localStorage.clear();
  accountScope.activate(accountScope.lock(owner), "g1");
  localStorage.setItem(generationMarkerKey(owner), JSON.stringify({ generation: "g1", migrationId: "fixture", previous: null }));
  key = accountScope.physicalKey("xai_pref_smart_lists");
  vi.stubGlobal("navigator", { locks: createSmartListsLockManager() });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Smart Lists async map recovery", () => {
  it("persists all twelve DOM producers as one valid sparse map and retains an unknown extension", async () => {
    localStorage.setItem(key, '{"extension":"future-string","__proto__":"future-prototype","assigned":"hide"}'); // fixture raw write
    const ui = mount();
    await flush();
    const selects = ui.getAllByRole("combobox") as HTMLSelectElement[];
    const values = ["show", "if-not-empty", "hide"] as const;
    for (const [index, select] of selects.entries()) {
      fireEvent.change(select, { target: { value: values[index % values.length] } });
      await flush();
    }
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem(key)!);
      expect(persisted.extension).toBe("future-string");
      expect(Object.hasOwn(persisted, "__proto__")).toBe(true);
      expect(persisted.__proto__).toBe("future-prototype");
      const expected = Object.fromEntries(SMART_LIST_IDS.map((id, index) => [id, values[index % values.length]]));
      expect(selects.map(select => select.value)).toEqual(SMART_LIST_IDS.map((_id, index) => values[index % values.length]));
      expect(persisted).toMatchObject(expected);
    });
  });

  it("refuses an invalid source without writing, then reloads an externally repaired map", async () => {
    localStorage.setItem(key, '{"all":null}'); // fixture raw write
    const ui = mount();
    await flush();
    expect(ui.getByRole("alert")).toHaveTextContent("not saved");
    expect((ui.getAllByRole("combobox")[0] as HTMLSelectElement).disabled).toBe(true);
    const writes = vi.spyOn(Storage.prototype, "setItem");
    fireEvent.change(ui.getAllByRole("combobox")[0]!, { target: { value: "hide" } });
    expect(writes.mock.calls.filter(([writtenKey]) => writtenKey === key)).toHaveLength(0);
    writes.mockRestore();

    localStorage.setItem(key, JSON.stringify({ all: "hide", extension: "repaired" })); // external repair
    const afterRepairWrites = vi.spyOn(Storage.prototype, "setItem");
    fireEvent.click(ui.getByRole("button", { name: "Reload saved choices" }));
    await waitFor(() => expect((ui.getAllByRole("combobox")[0] as HTMLSelectElement).value).toBe("hide"));
    expect(afterRepairWrites.mock.calls.filter(([writtenKey]) => writtenKey === key)).toHaveLength(0);
  });

  it("keeps the combined latest draft after a failed write and retries it as one map", async () => {
    localStorage.setItem(key, JSON.stringify({ all: "show", today: "show" })); // fixture raw write
    const ui = mount();
    await flush();
    const nativeSet = Storage.prototype.setItem;
    const failure = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, writtenKey: string, value: string) {
      if (writtenKey === key) throw new Error("quota");
      nativeSet.call(this, writtenKey, value);
    });
    const selects = ui.getAllByRole("combobox");
    fireEvent.change(selects[0]!, { target: { value: "hide" } });
    await flush();
    fireEvent.change(selects[1]!, { target: { value: "if-not-empty" } });
    await flush();
    expect((selects[0] as HTMLSelectElement).value).toBe("hide");
    expect((selects[1] as HTMLSelectElement).value).toBe("if-not-empty");
    expect(ui.getByRole("alert")).toHaveTextContent("not saved");
    failure.mockRestore();
    fireEvent.click(ui.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(key)!)).toMatchObject({ all: "hide", today: "if-not-empty" }));
  });

  it("keeps a dirty map through an external replacement until explicit full-map discard", async () => {
    const original = JSON.stringify({ all: "show", extension: "future-string" });
    const external = JSON.stringify({ all: "if-not-empty", extension: "external-value" });
    localStorage.setItem(key, original); // fixture raw write
    const locks = createSmartListsLockManager();
    vi.stubGlobal("navigator", { locks });
    const ui = mount();
    await flush();
    let release!: () => void;
    const held = locks.request(`xai:pref:v1:${encodeURIComponent(key)}`, { mode: "exclusive" }, () => new Promise<void>(resolve => { release = resolve; }));
    await flush();
    fireEvent.change(ui.getAllByRole("combobox")[0]!, { target: { value: "hide" } });
    await flush();
    localStorage.setItem(key, external); // external document replacement
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: external, storageArea: localStorage }));
    await act(async () => { release(); await held; });
    await waitFor(() => expect(ui.getByRole("alert")).toHaveTextContent("changed elsewhere"));
    expect((ui.getAllByRole("combobox")[0] as HTMLSelectElement).value).toBe("hide");
    const reloadWrites = vi.spyOn(Storage.prototype, "setItem");
    fireEvent.click(ui.getByRole("button", { name: /Discard local Smart Lists changes/i }));
    await waitFor(() => expect((ui.getAllByRole("combobox")[0] as HTMLSelectElement).value).toBe("if-not-empty"));
    expect(reloadWrites.mock.calls.filter(([writtenKey]) => writtenKey === key)).toHaveLength(0);
  });
});
