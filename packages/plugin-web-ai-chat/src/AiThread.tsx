/**
 * AiThread — welcome state (with optional starter prompts) OR message
 * thread renderer (with typing-dots bubble when thinking).
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §1
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { AiMessage } from "./types.js";
import { STARTERS_EN, STARTERS_ZH } from "./internal/starters.js";
import { IconPaperclip, IconSparkle } from "./internal/icons.js";

export interface AiThreadProps {
  messages: readonly AiMessage[];
  thinking: boolean;
  showInsights: boolean;
  lang: Lang;
  onStarter: (prompt: string) => void;
  /** Forwarded to the bottom sentinel div for scrollIntoView. */
  endRef: React.RefObject<HTMLDivElement | null>;
}

export function AiThread({
  messages,
  thinking,
  showInsights,
  lang,
  onStarter,
  endRef,
}: AiThreadProps) {
  const zh = lang === "zh";
  const starters = zh ? STARTERS_ZH : STARTERS_EN;
  const empty = messages.length === 0;

  if (empty) {
    return (
      <div className="ai-welcome">
        <h1>{zh ? "今天想从哪里开始？" : "Where should we start?"}</h1>
        {showInsights && (
          <div className="ai-starters">
            {starters.map((p) => (
              <button
                key={p}
                type="button"
                className="ai-starter"
                onClick={() => onStarter(p)}
              >
                <IconSparkle size={13} />
                <span>{p}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ai-thread">
      {messages.map((m, i) => (
        <div key={i} className={"ai-msg ai-msg-" + m.role}>
          {m.role === "assistant" && (
            <span className="ai-avatar">
              <IconSparkle size={13} />
            </span>
          )}
          <div className="ai-bubble">
            {m.text}
            {m.attachments && m.attachments.length > 0 && (
              <div className="ai-msg-attach">
                {m.attachments.map((a, j) => (
                  <span key={`${a}-${j}`} className="ai-pill">
                    <IconPaperclip size={10} /> {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      {thinking && (
        <div className="ai-msg ai-msg-assistant">
          <span className="ai-avatar">
            <IconSparkle size={13} />
          </span>
          <div className="ai-bubble ai-typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
