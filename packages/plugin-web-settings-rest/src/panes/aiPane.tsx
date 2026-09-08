/**
 * aiPane — Settings → AI pane.
 *
 * Controls:
 *   - Provider picker (Anthropic / Gemini / DeepSeek / custom OpenAI-compatible)
 *   - Conditional Base URL field (shown for custom OpenAI-compatible only)
 *   - API key paste input (password type) + Save + "Test Connection" + Delete
 *   - Model default picker (Haiku / Sonnet / Opus — bilingual labels)
 *   - Streaming toggle
 *   - Native <dialog> confirm for Delete API key
 *
 * Key storage: delegates to `aiKeyStorage` from @repo/plugin-web-ai-chat
 * (IndexedDB + WebCrypto AES-GCM-256). Key is NEVER written to localStorage.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-2 / FA-3 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §12.4 + §12.5
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.3 AP1..AP12
 */

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import {
  AI_PROVIDER_PRESETS,
  aiKeyStorage,
  getAiProviderPreset,
} from "@repo/plugin-web-ai-chat";
import type { AiProvider, LlmError } from "@repo/plugin-web-ai-chat";

// ---- Internal types ---------------------------------------------------------

type TestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "ok" }
  | { status: "error"; error: LlmError };

// ---- Component --------------------------------------------------------------

function AiPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const zh = lang === "zh";
  const { s } = useI18n(lang);

  // ---- Provider pref -------------------------------------------------------
  const [provider, setProvider] = usePref(
    "xai_ai_provider" as WebPrefKey,
  ) as readonly [string, (v: string) => void, unknown];

  const [baseUrl, setBaseUrl] = usePref(
    "xai_ai_base_url" as WebPrefKey,
  ) as readonly [string, (v: string) => void, unknown];

  const [modelDefault, setModelDefault] = usePref(
    "xai_ai_model_default" as WebPrefKey,
  ) as readonly [string, (v: string) => void, unknown];

  const [streaming, setStreaming] = usePref(
    "xai_ai_streaming" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  // ---- API key state -------------------------------------------------------
  const [keyInput, setKeyInput] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [testState, setTestState] = useState<TestState>({ status: "idle" });
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const selectedPreset = getAiProviderPreset(provider || "anthropic");

  // Load current key presence when the selected provider changes.
  useEffect(() => {
    const prov = getAiProviderPreset(provider || "anthropic").id as AiProvider;
    setKeyInput("");
    setTestState({ status: "idle" });
    void aiKeyStorage.loadKey(prov).then((k) => {
      setHasSavedKey(k != null);
    });
    return () => {
      if (savedTimer.current != null) clearTimeout(savedTimer.current);
    };
  }, [provider]);

  // ---- Handlers ------------------------------------------------------------

  const handleProviderChange = useCallback((next: string) => {
    const preset = getAiProviderPreset(next);
    setProvider(preset.id);
    setModelDefault(preset.defaultModel);
    if (preset.transport === "openai-compatible") {
      setBaseUrl(preset.baseUrl);
    } else {
      setBaseUrl("");
    }
  }, [setBaseUrl, setModelDefault, setProvider]);

  const handleSaveKey = useCallback(async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    const prov = getAiProviderPreset(provider || "anthropic").id as AiProvider;
    await aiKeyStorage.saveKey(prov, trimmed);
    setHasSavedKey(true);
    setKeyInput("");
    setSavedFlash(true);
    if (savedTimer.current != null) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedFlash(false), 1800);
  }, [keyInput, provider]);

  const handleTestConnection = useCallback(async () => {
    setTestState({ status: "testing" });
    const prov = getAiProviderPreset(provider || "anthropic").id as AiProvider;
    try {
      const result = await aiKeyStorage.testConnection(prov);
      if (result.ok) {
        setTestState({ status: "ok" });
      } else {
        setTestState({ status: "error", error: result.error });
      }
    } catch {
      setTestState({ status: "error", error: { kind: "Network", cause: new Error("test failed") } });
    }
  }, [provider]);

  const handleDeleteOpen = useCallback(() => {
    deleteDialogRef.current?.showModal();
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const prov = getAiProviderPreset(provider || "anthropic").id as AiProvider;
    await aiKeyStorage.clearKey(prov);
    setHasSavedKey(false);
    setKeyInput("");
    setTestState({ status: "idle" });
    deleteDialogRef.current?.close();
  }, [provider]);

  const handleDeleteCancel = useCallback(() => {
    deleteDialogRef.current?.close();
  }, []);

  const providerNeedsBaseUrl =
    selectedPreset.transport === "openai-compatible" && !selectedPreset.managedBaseUrl;

  // ---- Test status copy ----------------------------------------------------
  let testCopy: string | null = null;
  if (testState.status === "ok") {
    testCopy = zh ? "连接成功" : "Connection OK";
  } else if (testState.status === "error") {
    const err = testState.error;
    if (err.kind === "BadKey") {
      testCopy = zh ? "密钥无效" : "Invalid key";
    } else if (err.kind === "RateLimited") {
      testCopy = zh ? `频率超限，${err.retryAfterSec}s 后重试` : `Rate-limited, try again in ${err.retryAfterSec}s`;
    } else if (err.kind === "Network") {
      testCopy = zh ? "网络错误" : "Network error";
    } else {
      testCopy = zh ? "服务器错误" : "Server error";
    }
  }

  // Suppress unused s variable (pattern from sibling panes)
  void s("settings.ai");

  return (
    <div className="ai-settings-pane">
      <h3 className="pane-title">{zh ? "AI 设置" : "AI"}</h3>

      {/* Provider picker */}
      <SectionBlock>
        <SettingRow label={zh ? "AI 服务商" : "Provider"}>
          <select
            className="sl-select"
            value={selectedPreset.id}
            onChange={(e) => handleProviderChange(e.target.value)}
            aria-label={zh ? "AI 服务商" : "Provider"}
            data-testid="ai-provider-picker"
          >
            {AI_PROVIDER_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {zh ? preset.labelZh : preset.label}
              </option>
            ))}
          </select>
        </SettingRow>
        {providerNeedsBaseUrl && (
          <SettingRow
            label={zh ? "Base URL" : "Base URL"}
            desc={zh
              ? "自定义端点必须已在 CSP 放行"
              : "Custom endpoints must be allowlisted by CSP"}
          >
            <input
              type="url"
              className="sl-input"
              value={baseUrl || ""}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://..."
              aria-label={zh ? "Base URL" : "Base URL"}
              data-testid="ai-base-url-input"
            />
          </SettingRow>
        )}
      </SectionBlock>

      {/* API key */}
      <SectionBlock>
        <SettingRow
          label={zh ? "API 密钥" : "API Key"}
          desc={
            hasSavedKey
              ? zh ? "密钥已保存（加密存储）" : "Key saved (encrypted storage)"
              : zh ? "密钥通过 AES-GCM-256 加密后存储，不保存到 localStorage" : "Key is AES-GCM-256 encrypted at rest, never written to localStorage"
          }
        >
          <input
            type="password"
            className="sl-input ai-key-input"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={hasSavedKey ? (zh ? "重新粘贴以更换密钥" : "Paste to replace saved key") : (zh ? "粘贴密钥" : "Paste key")}
            aria-label={zh ? "API 密钥" : "API Key"}
            data-testid="ai-key-input"
          />
        </SettingRow>
        <SettingRow label="">
          <div className="ai-key-actions">
            <button
              type="button"
              className={"ai-key-save" + (savedFlash ? " saved" : "")}
              onClick={() => { void handleSaveKey(); }}
              disabled={!keyInput.trim()}
              aria-label={zh ? "保存密钥" : "Save key"}
              data-testid="ai-key-save"
            >
              {savedFlash ? (zh ? "已保存" : "Saved") : (zh ? "保存" : "Save")}
            </button>
            <button
              type="button"
              className={"ai-key-test" + (testState.status === "ok" ? " ok" : testState.status === "error" ? " error" : "")}
              onClick={() => { void handleTestConnection(); }}
              disabled={!hasSavedKey || testState.status === "testing"}
              aria-label={zh ? "测试连接" : "Test Connection"}
              data-testid="ai-key-test"
            >
              {testState.status === "testing"
                ? (zh ? "测试中…" : "Testing…")
                : (zh ? "测试连接" : "Test Connection")}
            </button>
            {hasSavedKey && (
              <button
                type="button"
                className="ai-key-delete"
                onClick={handleDeleteOpen}
                aria-label={zh ? "删除 API 密钥" : "Delete API key"}
                data-testid="ai-key-delete"
              >
                {zh ? "删除密钥" : "Delete API key"}
              </button>
            )}
          </div>
        </SettingRow>
        {testCopy != null && (
          <SettingRow label="">
            <span
              className={"ai-test-result " + testState.status}
              data-testid="ai-test-result"
            >
              {testCopy}
            </span>
          </SettingRow>
        )}
      </SectionBlock>

      {/* Model default picker */}
      <SectionBlock>
        <SettingRow
          label={zh ? "默认模型" : "Default model"}
          desc={zh ? "发送消息时使用的默认模型" : "Model used when sending messages"}
        >
          <select
            className="sl-select"
            value={modelDefault || "haiku"}
            onChange={(e) => setModelDefault(e.target.value)}
            aria-label={zh ? "默认模型" : "Default model"}
            data-testid="ai-model-picker"
          >
            {selectedPreset.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label} ({zh ? model.descZh : model.descEn})
              </option>
            ))}
          </select>
        </SettingRow>
      </SectionBlock>

      {/* Streaming toggle */}
      <SectionBlock>
        <SettingRow
          label={zh ? "流式输出" : "Streaming"}
          desc={zh ? "逐字输出 AI 回复（需要浏览器支持 SSE）" : "Stream tokens as they arrive (requires SSE support)"}
        >
          <Toggle
            on={streaming ?? true}
            onChange={() => setStreaming(!streaming)}
            ariaLabel={zh ? "流式输出" : "Streaming"}
            data-testid="ai-streaming-toggle"
          />
        </SettingRow>
      </SectionBlock>

      {/* Delete confirm dialog */}
      <dialog
        ref={deleteDialogRef}
        className="ai-delete-dialog"
        aria-label={zh ? "确认删除 API 密钥" : "Confirm delete API key"}
        data-testid="ai-delete-dialog"
      >
        <p>{zh ? "确定要删除已保存的 API 密钥吗？此操作不可撤销。" : "Are you sure you want to delete your saved API key? This cannot be undone."}</p>
        <div className="dialog-actions">
          <button
            type="button"
            onClick={() => { void handleDeleteConfirm(); }}
            data-testid="ai-delete-confirm"
          >
            {zh ? "删除" : "Delete"}
          </button>
          <button
            type="button"
            onClick={handleDeleteCancel}
            data-testid="ai-delete-cancel"
          >
            {zh ? "取消" : "Cancel"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export const aiPane: Pane = {
  id: "ai",
  icon: "sparkle",
  i18nKey: "settings.ai",
  render: (props: PaneRenderProps): React.ReactElement => (
    <AiPaneContent {...props} />
  ),
};
