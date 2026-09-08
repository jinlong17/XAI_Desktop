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

const { mockLoadKey, mockSaveKey, mockClearKey, mockTestConnection, mockProviderPresets } =
  vi.hoisted(() => ({
    mockLoadKey: vi.fn<() => Promise<string | null>>(),
    mockSaveKey: vi.fn<() => Promise<void>>(),
    mockClearKey: vi.fn<() => Promise<void>>(),
    mockTestConnection: vi.fn<() => Promise<{ ok: boolean; error?: unknown }>>(),
    mockProviderPresets: [
      {
        id: "anthropic",
        label: "Anthropic",
        labelZh: "Anthropic",
        transport: "anthropic",
        baseUrl: "",
        defaultModel: "haiku",
        managedBaseUrl: true,
        models: [
          { id: "haiku", label: "Haiku", descEn: "fast", descZh: "快速" },
          { id: "sonnet", label: "Sonnet", descEn: "balanced", descZh: "均衡" },
          { id: "opus", label: "Opus", descEn: "advanced", descZh: "高级" },
        ],
      },
      {
        id: "gemini",
        label: "Google Gemini",
        labelZh: "Google Gemini",
        transport: "openai-compatible",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
        defaultModel: "gemini-3.1-flash-lite",
        managedBaseUrl: true,
        models: [
          {
            id: "gemini-3.5-flash",
            label: "Gemini 3.5 Flash",
            descEn: "Stable",
            descZh: "稳定",
          },
          {
            id: "gemini-3.1-flash-lite",
            label: "Gemini 3.1 Flash Lite",
            descEn: "Google",
            descZh: "Google",
          },
        ],
      },
      {
        id: "deepseek",
        label: "DeepSeek",
        labelZh: "DeepSeek",
        transport: "openai-compatible",
        baseUrl: "https://api.deepseek.com",
        defaultModel: "deepseek-v4-flash",
        managedBaseUrl: true,
        models: [
          {
            id: "deepseek-v4-flash",
            label: "DeepSeek V4 Flash",
            descEn: "fast",
            descZh: "快速",
          },
          {
            id: "deepseek-v4-pro",
            label: "DeepSeek V4 Pro",
            descEn: "advanced",
            descZh: "高级",
          },
        ],
      },
      {
        id: "openai-compatible",
        label: "Custom OpenAI-compatible",
        labelZh: "自定义 OpenAI 兼容",
        transport: "openai-compatible",
        baseUrl: "",
        defaultModel: "haiku",
        managedBaseUrl: false,
        models: [
          { id: "haiku", label: "Haiku", descEn: "fast", descZh: "快速" },
          { id: "sonnet", label: "Sonnet", descEn: "balanced", descZh: "均衡" },
          { id: "opus", label: "Opus", descEn: "advanced", descZh: "高级" },
        ],
      },
    ],
  }));

vi.mock("@repo/plugin-web-ai-chat", () => ({
  AI_PROVIDER_PRESETS: mockProviderPresets,
  getAiProviderPreset: (input: string) => {
    return (
      mockProviderPresets.find((preset) => preset.id === input) ??
      mockProviderPresets[0]
    );
  },
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
  it("AP5: provider picker has Anthropic, Gemini, and DeepSeek options", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const picker = screen.getByTestId<HTMLSelectElement>("ai-provider-picker");
    expect(picker).toBeInTheDocument();
    const values = Array.from(picker.options).map((o) => o.value);
    expect(values).toContain("anthropic");
    expect(values).toContain("gemini");
    expect(values).toContain("deepseek");
  });
});

describe("aiPane — base URL field (AP6)", () => {
  it("AP6: base URL field is hidden for managed Gemini and DeepSeek presets", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    expect(screen.queryByTestId("ai-base-url-input")).toBeNull();

    const picker = screen.getByTestId("ai-provider-picker");
    await act(async () => {
      fireEvent.change(picker, { target: { value: "gemini" } });
    });
    expect(screen.queryByTestId("ai-base-url-input")).toBeNull();

    await act(async () => {
      fireEvent.change(picker, { target: { value: "deepseek" } });
    });
    expect(screen.queryByTestId("ai-base-url-input")).toBeNull();
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

  it("AP8b: Gemini and DeepSeek save to independent key slots", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const picker = screen.getByTestId("ai-provider-picker");
    const keyInput = screen.getByTestId<HTMLInputElement>("ai-key-input");
    const saveBtn = screen.getByTestId<HTMLButtonElement>("ai-key-save");

    fireEvent.change(picker, { target: { value: "gemini" } });
    fireEvent.change(keyInput, { target: { value: "gemini-key" } });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockSaveKey).toHaveBeenLastCalledWith("gemini", "gemini-key");

    fireEvent.change(picker, { target: { value: "deepseek" } });
    fireEvent.change(keyInput, { target: { value: "deepseek-key" } });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockSaveKey).toHaveBeenLastCalledWith("deepseek", "deepseek-key");
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
  it("AP11: model picker follows the selected provider preset", async () => {
    await act(async () => {
      render(aiPane.render({ lang: "en" }));
    });
    const picker = screen.getByTestId<HTMLSelectElement>("ai-model-picker");
    expect(picker).toBeInTheDocument();
    expect(Array.from(picker.options).map((o) => o.value)).toEqual([
      "haiku",
      "sonnet",
      "opus",
    ]);

    await act(async () => {
      fireEvent.change(screen.getByTestId("ai-provider-picker"), {
        target: { value: "gemini" },
      });
    });
    expect(Array.from(picker.options).map((o) => o.value)).toEqual([
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
    ]);

    await act(async () => {
      fireEvent.change(screen.getByTestId("ai-provider-picker"), {
        target: { value: "deepseek" },
      });
    });
    expect(Array.from(picker.options).map((o) => o.value)).toEqual([
      "deepseek-v4-flash",
      "deepseek-v4-pro",
    ]);
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
