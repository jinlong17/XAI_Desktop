/**
 * AP1..AP12 — aiPane tests
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.3
 *
 * All aiKeyStorage calls are mocked via vi.mock to avoid real IndexedDB.
 * The pane itself is a React component; we test its shape, bilingual labels,
 * and UI interactions against the mocked storage layer.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { aiPane } from "../panes/aiPane.js";

// ---- Mock aiKeyStorage from @repo/plugin-web-ai-chat ----------------------
// Use vi.hoisted so variables are initialized before vi.mock's hoisted call.

const { mockLoadKey, mockSaveKey, mockClearKey, mockTestConnection } =
  vi.hoisted(() => ({
    mockLoadKey: vi.fn<() => Promise<string | null>>(),
    mockSaveKey: vi.fn<() => Promise<void>>(),
    mockClearKey: vi.fn<() => Promise<void>>(),
    mockTestConnection: vi.fn<() => Promise<{ ok: boolean; error?: unknown }>>(),
  }));

vi.mock("@repo/plugin-web-ai-chat", () => ({
  aiKeyStorage: {
    loadKey: mockLoadKey,
    saveKey: mockSaveKey,
    clearKey: mockClearKey,
    testConnection: mockTestConnection,
  },
}));

beforeEach(() => {
  mockLoadKey.mockResolvedValue(null);
  mockSaveKey.mockResolvedValue(undefined);
  mockClearKey.mockResolvedValue(undefined);
  mockTestConnection.mockResolvedValue({ ok: true });
});

// ---- Tests ------------------------------------------------------------------

describe("aiPane — shape (AP1..AP2)", () => {
  it("AP1: pane metadata — id, icon, i18nKey are correct", () => {
    expect(aiPane.id).toBe("ai");
    expect(aiPane.icon).toBe("sparkle");
    expect(aiPane.i18nKey).toBe("settings.ai");
  });

  it("AP2: render function returns a React element without throwing", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    expect(document.querySelector(".ai-settings-pane")).toBeTruthy();
  });
});

describe("aiPane — bilingual (AP3..AP4)", () => {
  it("AP3: EN labels — Provider, API Key, Default model, Streaming", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    expect(screen.getByText("Provider")).toBeInTheDocument();
    expect(screen.getByText("API Key")).toBeInTheDocument();
    expect(screen.getByText("Default model")).toBeInTheDocument();
    expect(screen.getByText("Streaming")).toBeInTheDocument();
  });

  it("AP4: ZH labels — AI 服务商, API 密钥, 默认模型, 流式输出", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "zh" }));
    });
    expect(screen.getByText("AI 服务商")).toBeInTheDocument();
    expect(screen.getByText("API 密钥")).toBeInTheDocument();
    expect(screen.getByText("默认模型")).toBeInTheDocument();
    expect(screen.getByText("流式输出")).toBeInTheDocument();
  });
});

describe("aiPane — provider picker (AP5)", () => {
  it("AP5: provider picker has two options: anthropic + openai-compatible", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const picker = screen.getByTestId<HTMLSelectElement>("ai-provider-picker");
    expect(picker).toBeInTheDocument();
    expect(picker.options.length).toBe(2);
    const values = Array.from(picker.options).map((o) => o.value);
    expect(values).toContain("anthropic");
    expect(values).toContain("openai-compatible");
  });
});

describe("aiPane — base URL field (AP6)", () => {
  it("AP6: base URL field is hidden for anthropic, shown for openai-compatible", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    // Hidden by default (anthropic selected)
    expect(screen.queryByTestId("ai-base-url-input")).toBeNull();

    // Switch to openai-compatible
    const picker = screen.getByTestId("ai-provider-picker");
    fireEvent.change(picker, { target: { value: "openai-compatible" } });
    expect(screen.getByTestId("ai-base-url-input")).toBeInTheDocument();
  });
});

describe("aiPane — API key input + Save (AP7..AP8)", () => {
  it("AP7: Save button is disabled when key input is empty", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const saveBtn = screen.getByTestId<HTMLButtonElement>("ai-key-save");
    expect(saveBtn).toBeDisabled();
  });

  it("AP8: typing a key enables Save; clicking Save calls aiKeyStorage.saveKey", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const keyInput = screen.getByTestId<HTMLInputElement>("ai-key-input");
    fireEvent.change(keyInput, { target: { value: "sk-test-key" } });
    const saveBtn = screen.getByTestId<HTMLButtonElement>("ai-key-save");
    expect(saveBtn).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockSaveKey).toHaveBeenCalledWith("anthropic", "sk-test-key");
  });
});

describe("aiPane — Test Connection (AP9..AP10)", () => {
  it("AP9: Test Connection button is disabled when no key is saved", async () => {
    mockLoadKey.mockResolvedValue(null);
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const testBtn = screen.getByTestId<HTMLButtonElement>("ai-key-test");
    expect(testBtn).toBeDisabled();
  });

  it("AP10: Test Connection ok shows 'Connection OK'", async () => {
    // Pre-load a saved key
    mockLoadKey.mockResolvedValue("sk-existing-key");
    mockTestConnection.mockResolvedValue({ ok: true });
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const testBtn = screen.getByTestId<HTMLButtonElement>("ai-key-test");
    // Button is enabled because hasSavedKey=true
    expect(testBtn).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(testBtn);
    });
    expect(screen.getByTestId("ai-test-result")).toHaveTextContent("Connection OK");
  });
});

describe("aiPane — model picker (AP11)", () => {
  it("AP11: model picker has three options: haiku, sonnet, opus", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const picker = screen.getByTestId<HTMLSelectElement>("ai-model-picker");
    expect(picker).toBeInTheDocument();
    const values = Array.from(picker.options).map((o) => o.value);
    expect(values).toEqual(["haiku", "sonnet", "opus"]);
  });
});

describe("aiPane — key input type (AP12 — HC1 guard)", () => {
  it("AP12: API key input has type=password (never plaintext)", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const keyInput = screen.getByTestId<HTMLInputElement>("ai-key-input");
    expect(keyInput.type).toBe("password");
  });
});
