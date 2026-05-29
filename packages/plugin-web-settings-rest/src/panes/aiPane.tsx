/**
 * aiPane — Settings → AI pane.
 *
 * Controls:
 *   - Provider picker (anthropic / openai-compatible)
 *   - Conditional Base URL field (shown for openai-compatible only)
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
import {
  resolveWebRuntimeProfile,
} from "@repo/core";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import {
  aiKeyStorage,
  readBrowserOnlineState,
  resolveAiProviderPolicy,
} from "@repo/plugin-web-ai-chat";
import type {
  AiProvider,
  LlmError,
  AiProviderPolicySnapshot,
} from "@repo/plugin-web-ai-chat";

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
  const runtimeProfile = resolveWebRuntimeProfile(
    import.meta.env as Record<string, string | undefined>,
  );

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

  const resolvedProvider = (provider || "anthropic") as AiProvider;

  // Load current key presence when provider changes.
  useEffect(() => {
    void aiKeyStorage.loadKey(resolvedProvider).then((k) => {
      setHasSavedKey(k != null);
      setTestState({ status: "idle" });
    });
    return () => {
      if (savedTimer.current != null) clearTimeout(savedTimer.current);
    };
  }, [resolvedProvider]);

  const policy: AiProviderPolicySnapshot = resolveAiProviderPolicy({
    provider: resolvedProvider,
    baseUrl: baseUrl || "",
    hasSavedKey,
    runtimeProfile,
    isOnline: readBrowserOnlineState(),
  });

  // ---- Handlers ------------------------------------------------------------

  const handleSaveKey = useCallback(async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    await aiKeyStorage.saveKey(resolvedProvider, trimmed);
    setHasSavedKey(true);
    setKeyInput("");
    setSavedFlash(true);
    if (savedTimer.current != null) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedFlash(false), 1800);
  }, [keyInput, resolvedProvider]);

  const handleTestConnection = useCallback(async () => {
    setTestState({ status: "testing" });
    try {
      const result = await aiKeyStorage.testConnection(resolvedProvider);
      if (result.ok) {
        setTestState({ status: "ok" });
      } else {
        setTestState({ status: "error", error: result.error });
      }
    } catch {
      setTestState({ status: "error", error: { kind: "Network", cause: new Error("test failed") } });
    }
  }, [resolvedProvider]);

  const handleDeleteOpen = useCallback(() => {
    deleteDialogRef.current?.showModal();
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    await aiKeyStorage.clearKey(resolvedProvider);
    setHasSavedKey(false);
    setKeyInput("");
    setTestState({ status: "idle" });
    deleteDialogRef.current?.close();
  }, [resolvedProvider]);

  const handleDeleteCancel = useCallback(() => {
    deleteDialogRef.current?.close();
  }, []);

  const providerIsOai = provider === "openai-compatible";

  // ---- Test status copy ----------------------------------------------------
  let testCopy: string | null = null;
  if (policy.state === "network_required") {
    testCopy = policy.reason === "offline_runtime"
      ? (zh ? "桌面离线模式下需要联网环境" : "Desktop offline runtime requires network-enabled mode")
      : (zh ? "当前网络离线，无法测试连接" : "Browser is offline; network is required");
  } else if (policy.state === "key_required") {
    testCopy = zh ? "请先保存 API 密钥" : "Save an API key to enable send/test";
  } else if (policy.state === "base_url_required") {
    testCopy = zh ? "请先填写 OpenAI 兼容 Base URL" : "Base URL is required for OpenAI-compatible provider";
  } else if (policy.state === "local_provider_not_enabled") {
    testCopy = zh
      ? "本行功能未启用本地/回环地址 Provider（已延期）"
      : "Local/loopback provider execution is deferred and not enabled in this row";
  } else if (testState.status === "ok") {
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
            value={provider || "anthropic"}
            onChange={(e) => setProvider(e.target.value)}
            aria-label={zh ? "AI 服务商" : "Provider"}
            data-testid="ai-provider-picker"
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai-compatible">{zh ? "OpenAI 兼容" : "OpenAI-compatible"}</option>
          </select>
        </SettingRow>
        {providerIsOai && (
          <SettingRow label={zh ? "Base URL" : "Base URL"} desc={zh ? "例如：https://api.groq.com/openai/v1" : "e.g. https://api.groq.com/openai/v1"}>
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
              disabled={!policy.testEnabled || testState.status === "testing"}
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
            <option value="haiku">{zh ? "Haiku（快速）" : "Haiku (fast)"}</option>
            <option value="sonnet">{zh ? "Sonnet（均衡）" : "Sonnet (balanced)"}</option>
            <option value="opus">{zh ? "Opus（高级）" : "Opus (advanced)"}</option>
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
