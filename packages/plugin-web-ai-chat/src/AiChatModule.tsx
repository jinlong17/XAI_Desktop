/**
 * AiChatModule — root route component for the AI Chat module.
 *
 * Composes: AiSidebar + AiAurora + BreathingOrb + AiThread + AiComposer.
 * Owns: usePref for the three persistence keys; local state for input,
 * attachments, messages, thinking, activeConvo, model, sidebar open.
 *
 * Send flow: append user bubble → clear input/attachments → flip thinking
 * on → seed new convo if first message → await claudeAdapter → append
 * assistant bubble → flip thinking off. mountedRef short-circuits if the
 * component unmounted during the await.
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §1
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { AiAurora } from "./AiAurora.js";
import { BreathingOrb } from "./BreathingOrb.js";
import { AiSidebar } from "./AiSidebar.js";
import { AiComposer } from "./AiComposer.js";
import { AiThread } from "./AiThread.js";
import { IconList, IconPlus, IconSparkle } from "./internal/icons.js";
import { completeChat } from "./internal/claudeAdapter.js";
import { isAiConvoRecord } from "./internal/isAiConvoRecord.js";
import { makeConvoFromUserText } from "./internal/makeConvoFromUserText.js";
import type {
  AiAttachment,
  AiConvoRecord,
  AiMessage,
  AiModelId,
} from "./types.js";

export interface AiChatModuleProps {
  /** Active language. Drives useI18n bundle + inline bilingual literals. */
  lang: Lang;
}

export function AiChatModule({ lang }: AiChatModuleProps) {
  const zh = lang === "zh";

  // ---- Persistence: usePref + boundary predicate filter ------------------
  const [rawConvos, setRawConvos] = usePref("xai_ai_convos");
  const convos: AiConvoRecord[] = useMemo(() => {
    if (!Array.isArray(rawConvos)) return [];
    const out: AiConvoRecord[] = [];
    let dropped = 0;
    for (const x of rawConvos as unknown[]) {
      if (isAiConvoRecord(x)) out.push(x);
      else dropped += 1;
    }
    if (dropped > 0 && process.env["NODE_ENV"] !== "production") {
      console.warn(
        "[plugin-web-ai-chat] Dropped invalid convo record(s):",
        dropped,
      );
    }
    return out;
  }, [rawConvos]);

  const [showInsights, setShowInsights] = usePref("xai_ai_insights");
  const [voiceOn, setVoiceOn] = usePref("xai_ai_voice");

  // ---- Local (non-persisted) state ----------------------------------------
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AiAttachment[]>([]);
  const [thinking, setThinking] = useState(false);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [model, setModel] = useState<AiModelId>("haiku");

  // ---- Refs ---------------------------------------------------------------
  const endRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // ---- Send flow ----------------------------------------------------------
  const send = useCallback(
    (textOverride?: string) => {
      const text = (textOverride ?? input).trim();
      if (!text) return;
      const userMsg: AiMessage = {
        role: "user",
        text,
        attachments: attachments.length > 0 ? attachments.map((a) => a.name) : null,
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setAttachments([]);
      setThinking(true);
      if (!activeConvo) {
        const seed = makeConvoFromUserText(text, lang);
        setActiveConvo(seed.id);
        setRawConvos((prev) => {
          const safe: AiConvoRecord[] = Array.isArray(prev)
            ? (prev as unknown[]).filter(isAiConvoRecord)
            : [];
          return [seed, ...safe];
        });
      }

      (async () => {
        let reply: string;
        try {
          reply = await completeChat(text, lang);
        } catch {
          reply = zh
            ? "（演示）我会综合你的任务、专注数据与习惯进度，给你一份贴近实际的建议。当前网络暂不可用，请稍后再试。"
            : "(Demo) I'd weave your tasks, focus data, and habit streaks into a tailored plan. Network unavailable right now — try again in a moment.";
        }
        if (!mountedRef.current) return;
        setMessages((m) => [...m, { role: "assistant", text: reply, attachments: null }]);
        setThinking(false);
      })();
    },
    [input, attachments, activeConvo, lang, zh, setRawConvos],
  );

  const handleNewChat = useCallback(() => {
    setActiveConvo(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
  }, []);

  const handleSelectConvo = useCallback((id: string) => {
    setActiveConvo(id);
    setMessages([]);
  }, []);

  const handleAttachFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setAttachments((prev) => {
      const merged: AiAttachment[] = [...prev];
      for (const f of files) {
        if (merged.length >= 4) break;
        merged.push({ name: f.name, size: f.size });
      }
      return merged;
    });
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleInsightsToggle = useCallback(() => {
    setShowInsights((v) => !v);
  }, [setShowInsights]);

  const handleVoiceToggle = useCallback(() => {
    setVoiceOn((v) => !v);
  }, [setVoiceOn]);

  const handleStarter = useCallback(
    (prompt: string) => {
      send(prompt);
    },
    [send],
  );

  const stageClass =
    "ai-stage" + (thinking ? " thinking" : "") + (messages.length === 0 ? " empty" : " chatting");
  const mainClass = "ai-main" + (sidebarOpen ? " with-side" : "");

  return (
    <div className="module module-ai">
      <AiSidebar
        convos={convos}
        activeConvo={activeConvo}
        open={sidebarOpen}
        lang={lang}
        onSelectConvo={handleSelectConvo}
        onNewChat={handleNewChat}
        onCollapse={() => setSidebarOpen(false)}
      />
      <main className={mainClass}>
        {!sidebarOpen && (
          <button
            type="button"
            className="ai-open-side"
            onClick={() => setSidebarOpen(true)}
            aria-label={zh ? "打开侧栏" : "Open sidebar"}
            title={zh ? "打开侧栏" : "Open sidebar"}
          >
            <IconList size={16} />
          </button>
        )}
        <button
          type="button"
          className="ai-new-corner"
          onClick={handleNewChat}
          aria-label={zh ? "新对话" : "New chat"}
          title={zh ? "新对话" : "New chat"}
        >
          <IconPlus size={14} />
        </button>
        <button
          type="button"
          className={"ai-insights-toggle" + (showInsights ? " on" : "")}
          onClick={handleInsightsToggle}
          aria-pressed={showInsights}
          aria-label={
            showInsights
              ? zh
                ? "隐藏洞察"
                : "Hide insights"
              : zh
                ? "显示洞察"
                : "Show insights"
          }
          title={
            showInsights
              ? zh
                ? "隐藏洞察"
                : "Hide insights"
              : zh
                ? "显示洞察"
                : "Show insights"
          }
        >
          <IconSparkle size={13} />
          <span className="ait-label">
            {showInsights ? (zh ? "洞察已开" : "Insights on") : zh ? "洞察" : "Insights"}
          </span>
          <span className="ait-dot" />
        </button>

        <div className={stageClass}>
          <AiAurora thinking={thinking} />
          <BreathingOrb thinking={thinking} />
        </div>

        <div className="ai-content">
          <AiThread
            messages={messages}
            thinking={thinking}
            showInsights={showInsights}
            lang={lang}
            onStarter={handleStarter}
            endRef={endRef}
          />
        </div>

        <AiComposer
          input={input}
          onInputChange={setInput}
          attachments={attachments}
          onAttachFiles={handleAttachFiles}
          onRemoveAttachment={handleRemoveAttachment}
          model={model}
          onModelChange={setModel}
          voiceOn={voiceOn}
          onVoiceToggle={handleVoiceToggle}
          onSend={() => send()}
          lang={lang}
        />
      </main>
    </div>
  );
}
