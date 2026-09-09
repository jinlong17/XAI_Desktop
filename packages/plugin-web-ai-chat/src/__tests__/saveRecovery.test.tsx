import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { accountScope } from "@repo/plugin-web-storage";
import { AiChatModule } from "../AiChatModule.js";
import * as stream from "../internal/claudeStreamAdapter.js";
import { resetAccountFixture } from "./accountTestSetup.js";

beforeEach(() => {
  resetAccountFixture();
  vi.spyOn(stream, "streamCompleteChat").mockImplementation(async function* (r) {
    yield { accumulated: `answer ${r.text}`, done: true };
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function setup() {
  const key = accountScope.physicalKey("xai_ai_convos");
  const { container } = render(<AiChatModule lang="en" />);
  let deny = false;
  const set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, k, v) {
    if (deny && k === key) throw new DOMException("quota", "QuotaExceededError");
    set.call(this, k, v);
  });
  const send = async (text: string) => act(async () => {
    fireEvent.change(container.querySelector(".ai-input")!, { target: { value: text } });
    fireEvent.keyDown(container.querySelector(".ai-input")!, { key: "Enter" });
  });
  return { key, container, send, deny: (value: boolean) => { deny = value; }, records: () => JSON.parse(localStorage.getItem(key) ?? "[]") };
}
it("failed seed keeps latest complete transcript and retries one stable conversation", async () => {
  const s = setup(); s.deny(true); await s.send("first");
  expect(screen.getByRole("alert").textContent).toContain("Unsaved");
  s.deny(false); fireEvent.click(screen.getByText("Retry save"));
  const id = s.records()[0].id;
  s.deny(true); await s.send("second");
  s.deny(false); fireEvent.click(screen.getByText("Retry save"));
  expect(s.records()).toHaveLength(1); expect(s.records()[0].id).toBe(id);
  expect(s.records()[0].messages.map((m: { text: string }) => m.text)).toEqual(["first", "answer first", "second", "answer second"]);
});
it("new chat cannot replace failed message draft; export contains latest transcript and input", async () => {
  const s = setup(); s.deny(true); await s.send("retained");
  fireEvent.change(s.container.querySelector(".ai-input")!, { target: { value: "not sent yet" } });
  fireEvent.click(screen.getAllByRole("button", { name: "New chat" })[0]!);
  expect(s.container.querySelector(".ai-input")).toHaveValue("not sent yet");
  let blob: Blob | undefined;
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: (value: Blob) => { blob = value; return "blob:test"; } });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => {} });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  fireEvent.click(screen.getByText("Export draft"));
  const text = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob!); });
  const data = JSON.parse(text); expect(data.input).toBe("not sent yet");
  expect(data.records[0].messages.at(-1).text).toBe("answer retained");
});
it("failed delete retains current conversation until successful retry", async () => {
  const s = setup(); await s.send("keep until deleted"); const before = localStorage.getItem(s.key);
  s.deny(true); fireEvent.click(screen.getByRole("button", { name: /Delete chat:/ }));
  expect(localStorage.getItem(s.key)).toBe(before); expect(s.container.querySelectorAll(".ai-msg")).toHaveLength(2);
  s.deny(false); fireEvent.click(screen.getByText("Retry save"));
  expect(s.records()).toEqual([]); expect(s.container.querySelectorAll(".ai-msg")).toHaveLength(0);
});
it("external raw change blocks retry and later sends rather than overwriting", async () => {
  const s = setup(); s.deny(true); await s.send("local"); s.deny(false);
  const external = '[{"id":"external","opaque":"preserve raw"}]'; localStorage.setItem(s.key, external);
  fireEvent.click(screen.getByText("Retry save")); await s.send("newest local");
  expect(localStorage.getItem(s.key)).toBe(external); expect(screen.getByRole("alert").textContent).toContain("newer stored data");
  expect(s.container.textContent).toContain("newest local");
});
it("old A retry and export cannot act under B", async () => {
  const s = setup(); s.deny(true); await s.send("A private"); s.deny(false);
  act(() => { accountScope.activate(accountScope.lock("B"), "b1"); });
  const bKey = accountScope.physicalKey("xai_ai_convos");
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  fireEvent.click(screen.getByText("Retry save")); fireEvent.click(screen.getByText("Export draft"));
  expect(click).not.toHaveBeenCalled(); expect(localStorage.getItem(bKey)).toBeNull(); expect(localStorage.getItem(s.key)).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain("Export failed");
});

it("first save refuses changed canonical bytes even before their storage event arrives", async () => {
  const s = setup();
  const external = { id: "external", title: "Other tab", time: "now", messages: [] };
  localStorage.setItem(s.key, JSON.stringify([external]));
  await s.send("new local");
  expect(s.records()).toEqual([external]);
  expect(screen.getByRole("alert").textContent).toContain("newer stored data");
  expect(s.container.textContent).toContain("new local");
});
it("failed selection keeps active transcript and activates target only after retry", async () => {
  const s = setup(); await s.send("first chat");
  fireEvent.click(screen.getAllByRole("button", { name: "New chat" })[0]!);
  await s.send("second chat");
  const before = localStorage.getItem(s.key); s.deny(true);
  fireEvent.click(screen.getByText("first chat", { selector: ".ai-convo-title" }));
  expect(s.container.querySelector(".ai-content")?.textContent).toContain("second chat");
  expect(localStorage.getItem(s.key)).toBe(before);
  s.deny(false); fireEvent.click(screen.getByText("Retry save"));
  expect(s.container.querySelector(".ai-content")?.textContent).toContain("first chat");
  expect(s.container.querySelector(".ai-content")?.textContent).not.toContain("second chat");
});
it("late stream callback cannot write after account replacement", async () => {
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  vi.mocked(stream.streamCompleteChat).mockImplementation(async function* () { await wait; yield { accumulated: "late A response", done: true }; });
  const s = setup(); await s.send("A request"); const a = localStorage.getItem(s.key);
  act(() => { accountScope.activate(accountScope.lock("B"), "b1"); });
  const key = accountScope.physicalKey("xai_ai_convos");
  await act(async () => { release(); });
  expect(localStorage.getItem(s.key)).toBe(a); expect(localStorage.getItem(key)).toBeNull();
  expect(s.container.textContent).not.toContain("late A response");
});
it.each(["Hide insights", "Voice off"])("device preference failure is visible and retry does not toggle twice: %s", name => {
  const s = setup(); const key = name === "Hide insights" ? "xai_ai_insights" : "xai_ai_voice";
  const before = localStorage.getItem(key); const write = Storage.prototype.setItem; let deny = true;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, k, v) { if (k === key && deny) throw new DOMException("quota", "QuotaExceededError"); write.call(this, k, v); });
  fireEvent.click(screen.getByRole("button", { name }));
  expect(localStorage.getItem(key)).toBe(before); expect(screen.getByRole("alert")).toBeInTheDocument();
  deny = false; fireEvent.click(screen.getByText("Retry save"));
  expect(localStorage.getItem(key)).not.toBe(before);
  expect(s.container.querySelector(".ai-save-recovery")).toBeNull();
});
