/**
 * ErrorBanner — in-chat error notification strip.
 *
 * Renders a dismissible banner for each LlmError kind:
 *   BadKey (not-set)   → "Please configure your API key" + "Open Settings → AI" link
 *   BadKey (rejected)  → "Your API key was rejected" + "Open Settings → AI" link
 *   RateLimited        → countdown then "Retry" button
 *   Network            → network copy + immediate "Retry" button
 *   Server             → server copy + "Retry" button
 *   Malformed          → malformed copy
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-5 / FA-8 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §12.3
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 EB1..EB5
 */

import React, { useEffect, useRef, useState } from "react";
import type { LlmError } from "./internal/llmErrors.js";

export interface ErrorBannerProps {
  error: LlmError;
  /** Language for bilingual copy. */
  lang?: "en" | "zh";
  /** Called when the user clicks the Retry button (Network / Server / RateLimited). */
  onRetry?: () => void;
  /** Called when the user dismisses the banner. */
  onDismiss?: () => void;
  /** Called when the user clicks "Open Settings → AI". */
  onOpenSettings?: () => void;
}

export function ErrorBanner({
  error,
  lang = "en",
  onRetry,
  onDismiss,
  onOpenSettings,
}: ErrorBannerProps) {
  const zh = lang === "zh";
  const [secondsLeft, setSecondsLeft] = useState<number>(
    error.kind === "RateLimited" ? error.retryAfterSec : 0,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (error.kind !== "RateLimited") return;
    setSecondsLeft(error.retryAfterSec);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  }, [error]);

  const canRetry = error.kind !== "RateLimited" || secondsLeft === 0;

  // ---- Copy -----------------------------------------------------------------
  let title: string;
  let body: string | null = null;
  let showSettingsLink = false;
  let showRetry = false;

  switch (error.kind) {
    case "BadKey":
      showSettingsLink = true;
      if (error.detail === "not-set") {
        title = zh ? "请配置您的 API 密钥" : "Please configure your API key";
        body = zh
          ? "AI 功能需要 Anthropic 或兼容 OpenAI 的密钥。"
          : "AI features require an Anthropic or OpenAI-compatible key.";
      } else {
        title = zh ? "API 密钥无效" : "Your API key was rejected";
        body = zh
          ? "请检查密钥是否正确，然后重试。"
          : "Please check your key and try again.";
      }
      break;
    case "RateLimited":
      showRetry = true;
      title = zh ? "请求频率超限" : "Rate limited";
      body =
        secondsLeft > 0
          ? zh
            ? `${secondsLeft} 秒后重试`
            : `Retry in ${secondsLeft}s`
          : zh
            ? "现在可以重试"
            : "Ready to retry";
      break;
    case "Network":
      showRetry = true;
      title = zh ? "网络不可用" : "Network unavailable";
      body = zh
        ? "请检查网络连接后重试。"
        : "Check your connection and try again.";
      break;
    case "Server":
      showRetry = true;
      title = zh ? "服务器错误" : "Server error";
      body = zh
        ? `服务器返回 ${error.status}，请稍后重试。`
        : `Server returned ${error.status}. Please try again later.`;
      break;
    case "Malformed":
      showRetry = false;
      title = zh ? "响应格式异常" : "Malformed response";
      body = zh ? "收到意外的响应格式。" : "Received an unexpected response format.";
      break;
    default:
      title = zh ? "发生错误" : "An error occurred";
  }

  return (
    <div className="ai-error-banner" role="alert" aria-live="polite">
      <div className="ai-error-content">
        <strong className="ai-error-title">{title}</strong>
        {body != null && <span className="ai-error-body"> {body}</span>}
        {showSettingsLink && (
          <button
            type="button"
            className="ai-error-settings-link"
            onClick={onOpenSettings}
          >
            {zh ? "打开设置 → AI" : "Open Settings → AI"}
          </button>
        )}
        {showRetry && (
          <button
            type="button"
            className="ai-error-retry"
            onClick={canRetry ? onRetry : undefined}
            disabled={!canRetry}
            aria-disabled={!canRetry}
          >
            {zh ? "重试" : "Retry"}
          </button>
        )}
      </div>
      <button
        type="button"
        className="ai-error-dismiss"
        aria-label={zh ? "关闭" : "Dismiss"}
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
