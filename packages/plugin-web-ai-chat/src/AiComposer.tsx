/**
 * AiComposer — composer pill containing: attach button, hidden file input,
 * text input (Enter to send / Shift+Enter newline), voice mic toggle, send
 * arrow button. Optional attachments row above.
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §1
 */

import React, { useRef } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { AiAttachment } from "./types.js";
import {
  IconArrowR,
  IconClose,
  IconPaperclip,
  IconPlus,
  IconSound,
  IconSoundOff,
} from "./internal/icons.js";

export interface AiComposerProps {
  input: string;
  onInputChange: (next: string) => void;
  attachments: readonly AiAttachment[];
  onAttachFiles: (files: File[]) => void;
  onRemoveAttachment: (index: number) => void;
  voiceOn: boolean;
  onVoiceToggle: () => void;
  onSend: () => void;
  lang: Lang;
}

const MAX_ATTACHMENTS = 4;

export function AiComposer({
  input,
  onInputChange,
  attachments,
  onAttachFiles,
  onRemoveAttachment,
  voiceOn,
  onVoiceToggle,
  onSend,
  lang,
}: AiComposerProps) {
  const zh = lang === "zh";
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim().length > 0) onSend();
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const next: File[] = [];
    for (let i = 0; i < list.length && next.length < MAX_ATTACHMENTS; i += 1) {
      const f = list.item(i);
      if (f) next.push(f);
    }
    onAttachFiles(next);
    e.target.value = "";
  };

  const canSend = input.trim().length > 0;

  return (
    <div className="ai-composer-wrap">
      {attachments.length > 0 && (
        <div className="ai-attach-row">
          {attachments.map((a, i) => (
            <span key={`${a.name}-${i}`} className="ai-attach-chip">
              <IconPaperclip size={11} />
              <span>{a.name}</span>
              <button
                type="button"
                onClick={() => onRemoveAttachment(i)}
                aria-label={zh ? "移除附件" : "Remove attachment"}
              >
                <IconClose size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="ai-composer">
        <button
          type="button"
          className="ai-icon-round"
          onClick={() => fileRef.current?.click()}
          aria-label={zh ? "附件" : "Attach"}
          title={zh ? "附件" : "Attach"}
        >
          <IconPlus size={16} />
        </button>
        <input
          type="file"
          ref={fileRef}
          hidden
          multiple
          onChange={handleFiles}
          aria-hidden="true"
        />
        <input
          className="ai-input"
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={zh ? "询问 XAI" : "Ask XAI"}
          aria-label={zh ? "询问 XAI" : "Ask XAI"}
        />
        <button
          type="button"
          className={"ai-icon-round" + (voiceOn ? "" : " muted")}
          onClick={onVoiceToggle}
          aria-label={voiceOn ? (zh ? "语音已开" : "Voice on") : zh ? "语音已关" : "Voice off"}
          title={voiceOn ? (zh ? "语音已开" : "Voice on") : zh ? "语音已关" : "Voice off"}
          aria-pressed={voiceOn}
        >
          {voiceOn ? <IconSound size={15} /> : <IconSoundOff size={15} />}
        </button>
        <button
          type="button"
          className="ai-send"
          onClick={onSend}
          disabled={!canSend}
          aria-label={zh ? "发送" : "Send"}
        >
          <IconArrowR size={14} />
        </button>
      </div>
      <div className="ai-foot-hint">
        {zh ? "按 Enter 发送 · Shift + Enter 换行" : "Enter to send · Shift+Enter for newline"}
      </div>
    </div>
  );
}
