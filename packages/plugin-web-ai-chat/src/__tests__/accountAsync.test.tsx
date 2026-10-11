import { expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { AiChatModule } from "../AiChatModule.js";
import { aiKeyStorage } from "../internal/secretStore.js";
import * as stream from "../internal/claudeStreamAdapter.js";
import * as bus from "@repo/xai-web-event-bus";
function switchAccount() {
  const locked = accountScope.lock("async-B");
  localStorage.setItem(
    generationMarkerKey("async-B"),
    JSON.stringify({ generation: "g1", migrationId: "g1", previous: null }),
  );
  accountScope.activate(locked, "g1");
}
it("does not issue a request if owner changes while key loading is pending", async () => {
  let release!: (key: string) => void;
  const gate = new Promise<string>((resolve) => (release = resolve));
  vi.spyOn(aiKeyStorage, "loadKey").mockReturnValueOnce(gate);
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  const iterator = stream
    .streamCompleteChat({
      text: "private A prompt",
      lang: "en",
      model: "haiku",
    })
    [Symbol.asyncIterator]();
  const next = iterator.next();
  switchAccount();
  release("private-A-key");
  expect((await next).done).toBe(true);
  expect(fetchSpy).not.toHaveBeenCalled();
});
it("clears pending tool confirmation and cannot emit A action after an account switch", async () => {
  vi.spyOn(stream, "streamCompleteChat").mockImplementation(async function* () {
    yield {
      accumulated: "A action",
      done: true,
      toolUse: {
        id: "tool-A",
        name: "create_task",
        input: { title: "A private task" },
      },
    };
  });
  const emit = vi.spyOn(bus, "emitWebEvent");
  const view = render(<AiChatModule lang="en" />);
  const input = view.container.querySelector<HTMLInputElement>(".ai-input")!;
  fireEvent.change(input, { target: { value: "create A task" } });
  fireEvent.keyDown(input, { key: "Enter" });
  await waitFor(() =>
    expect(
      view.container.querySelector(".ai-confirmation-confirm"),
    ).not.toBeNull(),
  );
  const oldButton = view.container.querySelector<HTMLButtonElement>(
    ".ai-confirmation-confirm",
  )!;
  act(() => switchAccount());
  fireEvent.click(oldButton);
  expect(view.container.querySelector(".ai-confirmation-card")).toBeNull();
  expect(view.container.textContent).not.toContain("A action");
  expect(
    emit.mock.calls.filter(([event]) => event === "web:tasks:create-requested"),
  ).toHaveLength(0);
  view.unmount();
});
it("does not render delayed chunks from the old account even if the transport ignores abort", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  vi.spyOn(stream, "streamCompleteChat").mockImplementation(async function* () {
    await gate;
    yield { accumulated: "A private completion", done: true };
  });
  const view = render(<AiChatModule lang="en" />);
  const input = view.container.querySelector<HTMLInputElement>(".ai-input")!;
  fireEvent.change(input, { target: { value: "A question" } });
  fireEvent.keyDown(input, { key: "Enter" });
  act(() => switchAccount());
  await act(async () => {
    release();
    await gate;
  });
  expect(view.container.textContent).not.toContain("A private completion");
  expect(view.container.textContent).not.toContain("A question");
  view.unmount();
});

it("clears an unsent private draft on account invalidation", () => {
 const view=render(<AiChatModule lang="en"/>);
 const input=view.container.querySelector<HTMLInputElement>(".ai-input")!;
 fireEvent.change(input,{target:{value:"A unsent private draft"}});
 act(()=>switchAccount());expect(input.value).toBe("");view.unmount();
});
