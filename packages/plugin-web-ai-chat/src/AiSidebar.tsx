/**
 * AiSidebar — left conversation history panel.
 *
 * Renders the collapsible 248px sidebar with: collapse button, new-chat
 * button, search input (no-op onChange — matches artifact), and the
 * convo list under a "RECENT" label.
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §1
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { AiConvoRecord } from "./types.js";
import { IconClose, IconList, IconPlus, IconSearch, IconSparkle } from "./internal/icons.js";

export interface AiSidebarProps {
  convos: readonly AiConvoRecord[];
  activeConvo: string | null;
  open: boolean;
  lang: Lang;
  onSelectConvo: (id: string) => void;
  onDeleteConvo: (id: string) => void;
  onNewChat: () => void;
  onCollapse: () => void;
}

export function AiSidebar({
  convos,
  activeConvo,
  open,
  lang,
  onSelectConvo,
  onDeleteConvo,
  onNewChat,
  onCollapse,
}: AiSidebarProps) {
  const zh = lang === "zh";
  const className = "ai-side" + (open ? " open" : "");
  return (
    <aside className={className}>
      <header className="ai-side-head">
        <button
          type="button"
          className="ai-icon-round"
          onClick={onCollapse}
          aria-label={zh ? "收起" : "Collapse"}
          title={zh ? "收起" : "Collapse"}
        >
          <IconList size={16} />
        </button>
        <button type="button" className="ai-new-btn" onClick={onNewChat}>
          <IconPlus size={13} />
          <span>{zh ? "新对话" : "New chat"}</span>
        </button>
      </header>
      <div className="ai-search">
        <IconSearch size={13} />
        {/* Artifact parity: input has no onChange handler. */}
        <input
          type="text"
          placeholder={zh ? "搜索对话" : "Search chats"}
          aria-label={zh ? "搜索对话" : "Search chats"}
          readOnly
        />
      </div>
      <div className="ai-side-section">
        <div className="ai-side-label">{zh ? "最近" : "Recent"}</div>
        <ul className="ai-convos">
          {convos.map((c) => {
            const rowClass =
              "ai-convo-row" + (activeConvo === c.id ? " active" : "");
            return (
              <li
                key={c.id}
                className={rowClass}
                onClick={() => onSelectConvo(c.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectConvo(c.id);
                  }
                }}
              >
                <IconSparkle size={12} />
                <span className="ai-convo-main">
                  <span className="ai-convo-title">{c.title || (zh ? "未命名对话" : "Untitled chat")}</span>
                  {c.summary && <span className="ai-convo-summary">{c.summary}</span>}
                </span>
                <span className="ai-convo-time mono">{c.time}</span>
                <button
                  type="button"
                  className="ai-convo-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConvo(c.id);
                  }}
                  aria-label={zh ? `删除对话：${c.title}` : `Delete chat: ${c.title}`}
                  title={zh ? "删除对话" : "Delete chat"}
                >
                  <IconClose size={11} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
