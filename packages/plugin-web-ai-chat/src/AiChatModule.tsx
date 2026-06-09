/**
 * AiChatModule — root route component for the AI Chat module.
 *
 * Composes: AiSidebar + AiAurora + BreathingOrb + AiThread + AiComposer +
 * ErrorBanner.
 * Owns: usePref for the three persistence keys; local state for input,
 * attachments, messages, thinking, activeConvo, model, sidebar open,
 * errorBanner (LlmError | null).
 *
 * Send flow: append user bubble → clear input/attachments → flip thinking
 * on → seed new convo if first message → enqueue prompt onto a FIFO
 * pendingSendQueue → processQueue drains entries one-at-a-time through
 * streamCompleteChat, mutating an in-progress assistant bubble with each
 * yielded chunk; thinking stays true until the queue is fully drained.
 * mountedRef short-circuits if the component unmounted during the stream.
 *
 * Error handling: LlmError thrown by streamCompleteChat sets bannerError state,
 * which renders ErrorBanner. Listening to web:ai:rate-limited and
 * web:ai:request-failed via useWebEventListener also triggers the banner.
 * The in-progress assistant bubble is removed on error (no partial text left).
 *
 * Resend-while-thinking: per design.md state machine, a second `send()`
 * during an in-flight adapter call is queued behind the current promise
 * (FIFO). The user bubble appears immediately; the assistant bubble is
 * appended only after the previous queued item resolves. No race between
 * parallel streamCompleteChat calls.
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
import { emitWebEvent, useWebEventListener } from "@repo/xai-web-event-bus";
import { AiAurora } from "./AiAurora.js";
import { BreathingOrb } from "./BreathingOrb.js";
import { AiSidebar } from "./AiSidebar.js";
import { AiComposer } from "./AiComposer.js";
import { AiThread } from "./AiThread.js";
import { ErrorBanner } from "./ErrorBanner.js";
import { ConfirmationCard } from "./ConfirmationCard.js";
import { IconList, IconPlus, IconSparkle } from "./internal/icons.js";
import { streamCompleteChat } from "./internal/claudeStreamAdapter.js";
import { isAiConvoRecord } from "./internal/isAiConvoRecord.js";
import { makeConvoFromUserText } from "./internal/makeConvoFromUserText.js";
import type { LlmError } from "./internal/llmErrors.js";
import { AI_TOOLS, findTool } from "./internal/toolRegistry.js";
import type { ToolUseResult } from "./internal/toolUseTypes.js";
import { getPref } from "@repo/plugin-web-storage";
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

const SUMMARY_MAX_LEN = 140;

function compactText(text: string, maxLen = SUMMARY_MAX_LEN) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > maxLen ? `${oneLine.slice(0, maxLen - 1)}...` : oneLine;
}

function displayTime(lang: Lang) {
  return lang === "zh" ? "刚刚" : "Just now";
}

function normalizeMessage(message: AiMessage): AiMessage {
  return {
    role: message.role,
    text: message.text,
    attachments: Array.isArray(message.attachments)
      ? message.attachments.filter((a): a is string => typeof a === "string")
      : null,
  };
}

function normalizeMessages(messages: readonly AiMessage[]) {
  return messages.map(normalizeMessage);
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
  const [model] = useState<AiModelId>("haiku");
  /** Non-null when there is an active LlmError to display. */
  const [bannerError, setBannerError] = useState<LlmError | null>(null);

  /**
   * P3: pendingConfirmation — non-null when the model responded with a tool_use block.
   * The ConfirmationCard is rendered while this is set. The queue processor is PAUSED
   * until the user clicks Confirm or Cancel.
   * CRITICAL: no write event is emitted until the user explicitly clicks Confirm.
   */
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    toolUse: ToolUseResult;
    /** The placeholder bubble id to update with the preamble text. */
    preambleId: string;
    /** Text accumulated before the tool_use block (may be empty). */
    preambleText: string;
  } | null>(null);

  // ---- Refs ---------------------------------------------------------------
  const endRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  /** AbortController for the currently-active stream. Created per processQueue call. */
  const abortCtrlRef = useRef<AbortController | null>(null);
  /**
   * FIFO queue of prompts awaiting adapter completion.
   *
   * Per design.md state machine: "During thinking, the composer's send stays
   * usable but a re-send is queued behind the current promise." Each item is
   * the trimmed user prompt + the lang at the time of send (lang change while
   * a message is queued must not retroactively swap the demo language). The
   * `pendingSendQueueRef` is processed one entry at a time by `processQueue`;
   * `processingRef` guards against re-entry from a second `send` while the
   * first adapter call is still in flight.
   */
  const pendingSendQueueRef = useRef<Array<{ text: string; lang: Lang }>>([]);
  const processingRef = useRef(false);
  const hydratedActiveRef = useRef(false);
  const suppressNextPersistRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Abort any in-flight stream when component unmounts.
      abortCtrlRef.current?.abort();
    };
  }, []);

  const persistConvoMessages = useCallback(
    (id: string, nextMessages: readonly AiMessage[]) => {
      setRawConvos((prev) => {
        const safe: AiConvoRecord[] = Array.isArray(prev)
          ? (prev as unknown[]).filter(isAiConvoRecord)
          : [];
        const index = safe.findIndex((c) => c.id === id);
        if (index < 0) return safe;

        const storedMessages = normalizeMessages(nextMessages);
        const last = storedMessages[storedMessages.length - 1];
        const now = new Date().toISOString();
        const updated: AiConvoRecord = {
          ...safe[index]!,
          time: displayTime(lang),
          summary: last ? compactText(last.text) : safe[index]!.summary,
          updatedAt: now,
          messages: storedMessages,
        };

        return [updated, ...safe.filter((c) => c.id !== id)];
      });
    },
    [lang, setRawConvos],
  );

  useEffect(() => {
    if (hydratedActiveRef.current) return;
    hydratedActiveRef.current = true;
    if (convos.length === 0) return;

    const restored =
      [...convos].sort((a, b) => {
        const aTime = Date.parse(a.activeAt ?? a.updatedAt ?? "");
        const bTime = Date.parse(b.activeAt ?? b.updatedAt ?? "");
        return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
      })[0] ?? null;
    if (!restored || !restored.messages || restored.messages.length === 0) return;

    suppressNextPersistRef.current = true;
    setActiveConvo(restored.id);
    setMessages(normalizeMessages(restored.messages));
  }, [convos]);

  useEffect(() => {
    if (!activeConvo) return;
    if (suppressNextPersistRef.current) {
      suppressNextPersistRef.current = false;
      return;
    }
    persistConvoMessages(activeConvo, messages);
  }, [activeConvo, messages, persistConvoMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // ---- Error event listeners (from the stream adapter) --------------------
  // Note: these events are emitted by claudeStreamAdapter BEFORE throwing,
  // so the processQueue catch block also fires. The event listener path is
  // primarily for cases where the error is emitted outside processQueue
  // (e.g. external subscribers). Inside processQueue, bannerError is set
  // directly from the caught LlmError.
  useWebEventListener("web:ai:rate-limited", (e) => {
    const err: LlmError = {
      kind: "RateLimited",
      status: 429,
      retryAfterSec: e.retryAfterSec ?? 60,
    };
    setBannerError(err);
    setThinking(false);
  });

  useWebEventListener("web:ai:request-failed", (e) => {
    let err: LlmError;
    const rawStatus = e.status;
    if (e.kind === "bad-key") {
      const st = (rawStatus === 401 || rawStatus === 403 ? rawStatus : 401) as 401 | 403;
      err = { kind: "BadKey", status: st };
    } else if (e.kind === "network") {
      err = { kind: "Network", cause: new Error("request-failed event") };
    } else if (e.kind === "server") {
      err = { kind: "Server", status: rawStatus ?? 500 };
    } else {
      err = { kind: "Malformed", where: "shape", detail: "request-failed event" };
    }
    setBannerError(err);
    setThinking(false);
  });

  // ---- Queue processor (streaming) ----------------------------------------
  /**
   * Drains the FIFO queue one prompt at a time. Always called via a fresh
   * microtask after enqueue. If already processing OR queue empty, returns
   * immediately — every enqueue path is safe to re-call.
   *
   * Each queue item is streamed via streamCompleteChat. During streaming, a
   * placeholder assistant bubble is appended immediately (empty text) and then
   * mutated in place with each accumulated chunk. On LlmError, the placeholder
   * is removed and bannerError is set.
   *
   * `thinking` stays `true` until the queue is fully drained (so the UI
   * shows the orb continuously across queued resends).
   */
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    if (pendingSendQueueRef.current.length === 0) return;
    processingRef.current = true;
    try {
      while (pendingSendQueueRef.current.length > 0) {
        const next = pendingSendQueueRef.current[0];
        if (!next) break;

        // Create a new AbortController for this stream.
        const ctrl = new AbortController();
        abortCtrlRef.current = ctrl;

        // Read model preference (non-React context: direct localStorage read per Rec2).
        const modelPref = (getPref("xai_ai_model_default") as AiModelId) || model;

        // Placeholder ID for streaming bubble mutation. The placeholder is NOT
        // appended until the first chunk arrives (so user bubbles always precede
        // assistant bubbles in the message list, satisfying FIFO ordering).
        const placeholderId = `streaming-${Date.now()}`;
        let placeholderInserted = false;

        let accumulated = "";
        let streamError: LlmError | null = null;
        let toolUseResult: ToolUseResult | undefined;

        try {
          for await (const chunk of streamCompleteChat({
            text: next.text,
            lang: next.lang,
            model: modelPref,
            signal: ctrl.signal,
            // P3: send tool definitions on the Anthropic provider.
            tools: AI_TOOLS,
          })) {
            if (!mountedRef.current) return;
            accumulated = chunk.accumulated;

            if (!placeholderInserted) {
              // Insert the assistant bubble on the first chunk so DOM ordering is:
              // all queued user bubbles → then assistant bubbles in order.
              placeholderInserted = true;
              setMessages((m) => [
                ...m,
                { role: "assistant", text: accumulated, attachments: null, _id: placeholderId } as AiMessage & { _id: string },
              ]);
            } else {
              // Mutate the placeholder bubble in place for subsequent chunks.
              setMessages((m) =>
                m.map((msg) => {
                  const msgWithId = msg as AiMessage & { _id?: string };
                  return msgWithId._id === placeholderId
                    ? { ...msg, text: accumulated }
                    : msg;
                }),
              );
            }

            if (chunk.done) {
              toolUseResult = chunk.toolUse;
              break;
            }
          }
        } catch (err) {
          // streamCompleteChat throws LlmError on 4xx/5xx/network failure.
          streamError = err as LlmError;
        }

        if (!mountedRef.current) return;

        if (streamError != null) {
          // Remove any partial placeholder bubble and set error banner.
          if (placeholderInserted) {
            setMessages((m) =>
              m.filter((msg) => (msg as AiMessage & { _id?: string })._id !== placeholderId),
            );
          }
          setBannerError(streamError);
          setThinking(false);
          // Clear the queue — no point continuing after error.
          pendingSendQueueRef.current = [];
          return;
        }

        // If aborted (unmount or explicit abort) without error, just stop.
        if (ctrl.signal.aborted) {
          if (placeholderInserted) {
            setMessages((m) =>
              m.filter((msg) => (msg as AiMessage & { _id?: string })._id !== placeholderId),
            );
          }
          return;
        }

        // P3: If the model responded with a tool_use block, enter pendingConfirmation.
        // The queue is NOT advanced — the entry stays until Confirm/Cancel resolves it.
        if (toolUseResult) {
          setPendingConfirmation({
            toolUse: toolUseResult,
            preambleId: placeholderId,
            preambleText: accumulated,
          });
          // Exit processQueue — it will be re-kicked by handleConfirm or handleCancel in P4.
          // processingRef is reset in the finally block below.
          return;
        }

        pendingSendQueueRef.current.shift();
      }
      if (mountedRef.current) setThinking(false);
    } finally {
      processingRef.current = false;
      abortCtrlRef.current = null;
    }
  }, [model]);

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
          return [{ ...seed, messages: [userMsg] }, ...safe];
        });
      }

      // Enqueue → kick the processor. If already in-flight, the processor's
      // while-loop will pick this entry up after the current promise resolves.
      pendingSendQueueRef.current.push({ text, lang });
      void processQueue();
    },
    [input, attachments, activeConvo, lang, setRawConvos, processQueue],
  );

  const handleNewChat = useCallback(() => {
    abortCtrlRef.current?.abort();
    pendingSendQueueRef.current = [];
    processingRef.current = false;
    setActiveConvo(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
    setThinking(false);
    setPendingConfirmation(null);
    setBannerError(null);
  }, []);

  const handleSelectConvo = useCallback(
    (id: string) => {
      const selected = convos.find((c) => c.id === id);
      abortCtrlRef.current?.abort();
      pendingSendQueueRef.current = [];
      processingRef.current = false;
      suppressNextPersistRef.current = true;
      setActiveConvo(id);
      setMessages(selected?.messages ? normalizeMessages(selected.messages) : []);
      setInput("");
      setAttachments([]);
      setThinking(false);
      setPendingConfirmation(null);
      setBannerError(null);
      setRawConvos((prev) => {
        const safe: AiConvoRecord[] = Array.isArray(prev)
          ? (prev as unknown[]).filter(isAiConvoRecord)
          : [];
        const now = new Date().toISOString();
        return safe.map((c) => (c.id === id ? { ...c, activeAt: now } : c));
      });
    },
    [convos, setRawConvos],
  );

  const handleDeleteConvo = useCallback(
    (id: string) => {
      setRawConvos((prev) => {
        const safe: AiConvoRecord[] = Array.isArray(prev)
          ? (prev as unknown[]).filter(isAiConvoRecord)
          : [];
        return safe.filter((c) => c.id !== id);
      });
      if (activeConvo === id) {
        abortCtrlRef.current?.abort();
        pendingSendQueueRef.current = [];
        processingRef.current = false;
        setActiveConvo(null);
        setMessages([]);
        setInput("");
        setAttachments([]);
        setThinking(false);
        setPendingConfirmation(null);
        setBannerError(null);
      }
    },
    [activeConvo, setRawConvos],
  );

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

  const handleOpenSettings = useCallback(() => {
    emitWebEvent("web:shell:module-change", {
      moduleId: "settings",
      detailId: "ai",
      source: "programmatic",
    });
  }, []);

  /**
   * handleCancel — user declined the proposed action.
   * Clears pendingConfirmation, sends tool_result(is_error:true) back to LLM
   * for a bounded final acknowledgement stream, then sets idle.
   * INVARIANT: No write event emitted (IT-3 assertion).
   * The tool_result is conversational feedback to LLM only — NOT a write path.
   */
  const handleCancel = useCallback(() => {
    if (!pendingConfirmation) return;

    const snapshot = pendingConfirmation;
    setPendingConfirmation(null);
    pendingSendQueueRef.current.shift();

    // Send tool_result(is_error:true) to LLM for a bounded final acknowledgement.
    // This is LLM conversation only — does NOT trigger any store write.
    const queuedItem = { text: snapshot.preambleText || "(cancelled)", lang };
    void (async () => {
      if (!mountedRef.current) return;
      setThinking(true);

      const ctrl = new AbortController();
      abortCtrlRef.current = ctrl;
      const modelPref = (getPref("xai_ai_model_default") as AiModelId) || model;

      // Build Anthropic message history: user turn → assistant tool_use turn → user tool_result turn.
      const priorMessages = [
        { role: "user" as const, content: queuedItem.text },
        {
          role: "assistant" as const,
          content: [
            { type: "tool_use" as const, id: snapshot.toolUse.id, name: snapshot.toolUse.name, input: snapshot.toolUse.input },
          ],
        },
        {
          role: "user" as const,
          content: [
            { type: "tool_result" as const, tool_use_id: snapshot.toolUse.id, content: "user declined", is_error: true },
          ],
        },
      ];

      const cancelFinalId = `cancel-final-${Date.now()}`;
      let inserted = false;
      try {
        for await (const chunk of streamCompleteChat({
          text: queuedItem.text,
          lang: queuedItem.lang,
          model: modelPref,
          signal: ctrl.signal,
          priorMessages,
        })) {
          if (!mountedRef.current) return;
          if (!inserted) {
            inserted = true;
            setMessages((m) => [
              ...m,
              { role: "assistant", text: chunk.accumulated, attachments: null, _id: cancelFinalId } as AiMessage & { _id: string },
            ]);
          } else {
            setMessages((m) =>
              m.map((msg) => {
                const msgWithId = msg as AiMessage & { _id?: string };
                return msgWithId._id === cancelFinalId ? { ...msg, text: chunk.accumulated } : msg;
              }),
            );
          }
          if (chunk.done) break; // Bounded: stop after first final turn (ignore further tool_use).
        }
      } catch {
        // Cancel acknowledgement stream failed — tolerated (no UI impact; thinking clears below).
        if (inserted) {
          setMessages((m) => m.filter((msg) => (msg as AiMessage & { _id?: string })._id !== cancelFinalId));
        }
      }

      if (mountedRef.current) setThinking(false);
      abortCtrlRef.current = null;
    })();
  }, [pendingConfirmation, lang, model]);

  /**
   * handleConfirm — user explicitly approved the proposed action.
   * This is the ONLY place the write event is emitted (no-silent-write invariant).
   * Emits the typed write event → owning-module subscriber executes via reducer + setPref.
   * Then sends tool_result(content:"success") back to LLM for a bounded single
   * final acknowledgement stream (one round-trip, counter cap=1). If the final
   * turn again contains a tool_use, it is displayed as text but NOT executed
   * (no second round-trip — bounded invariant enforced).
   */
  const handleConfirm = useCallback(() => {
    if (!pendingConfirmation) return;

    const snapshot = pendingConfirmation;

    // Find the tool and compute the write event spec.
    const tool = findTool(snapshot.toolUse.name);
    if (tool) {
      const writeEvent = tool.toWriteEvent(
        snapshot.toolUse.input,
        snapshot.toolUse.id,
      );

      // CRITICAL: emit the write event EXACTLY ONCE, ONLY here (no-silent-write invariant).
      // The owning-module subscriber (mounted in App.tsx) consumes this event
      // and executes via its own pure reducer + setPref.
      // ED-8: 4 new delete/update channels follow the SAME single-emit-site pattern.
      if (writeEvent.channel === "web:tasks:create-requested") {
        const p = writeEvent.payload as {
          requestId: string;
          title: string;
          bucket: "overdue" | "next7" | "later" | "nodate";
          tag?: "study" | "work" | "personal" | "todo" | "other";
          requestedAt: string;
        };
        emitWebEvent("web:tasks:create-requested", p);
      } else if (writeEvent.channel === "web:calendar:create-requested") {
        const p = writeEvent.payload as {
          requestId: string;
          title: string;
          date: string;
          startTime: string;
          durationMin: number;
          requestedAt: string;
        };
        emitWebEvent("web:calendar:create-requested", p);
      } else if (writeEvent.channel === "web:tasks:delete-requested") {
        // P2 (xai-web-ai-tool-edit-delete): delete task branch
        const p = writeEvent.payload as {
          requestId: string;
          id: string;
          requestedAt: string;
        };
        emitWebEvent("web:tasks:delete-requested", p);
      } else if (writeEvent.channel === "web:calendar:delete-requested") {
        // P2 (xai-web-ai-tool-edit-delete): delete calendar event branch
        const p = writeEvent.payload as {
          requestId: string;
          id: string;
          requestedAt: string;
        };
        emitWebEvent("web:calendar:delete-requested", p);
      } else if (writeEvent.channel === "web:tasks:update-requested") {
        // P3 (xai-web-ai-tool-edit-delete): update task branch
        const p = writeEvent.payload as {
          requestId: string;
          id: string;
          patch: { title?: string; bucket?: "overdue" | "next7" | "later" | "nodate"; tag?: "study" | "work" | "personal" | "todo" | "other" };
          requestedAt: string;
        };
        emitWebEvent("web:tasks:update-requested", p);
      } else if (writeEvent.channel === "web:calendar:update-requested") {
        // P3 (xai-web-ai-tool-edit-delete): update calendar event branch
        const p = writeEvent.payload as {
          requestId: string;
          id: string;
          patch: { title?: string; date?: string; startTime?: string; durationMin?: number };
          requestedAt: string;
        };
        emitWebEvent("web:calendar:update-requested", p);
      }
    }

    // Clear the confirmation card and advance the queue.
    setPendingConfirmation(null);
    pendingSendQueueRef.current.shift();

    // Bounded single round-trip: send tool_result(success) back to LLM and
    // stream the final acknowledgement (e.g. "Created task 'X' for you.").
    // Counter cap = 1 — if the final turn again yields tool_use, we display
    // text only (no second execution, no second round-trip).
    const queuedItem = { text: snapshot.preambleText || snapshot.toolUse.name, lang };
    void (async () => {
      if (!mountedRef.current) return;
      setThinking(true);

      const ctrl = new AbortController();
      abortCtrlRef.current = ctrl;
      const modelPref = (getPref("xai_ai_model_default") as AiModelId) || model;

      // Build Anthropic message history: user turn → assistant tool_use turn → user tool_result turn.
      const priorMessages = [
        { role: "user" as const, content: queuedItem.text },
        {
          role: "assistant" as const,
          content: [
            { type: "tool_use" as const, id: snapshot.toolUse.id, name: snapshot.toolUse.name, input: snapshot.toolUse.input },
          ],
        },
        {
          role: "user" as const,
          content: [
            { type: "tool_result" as const, tool_use_id: snapshot.toolUse.id, content: `Tool '${snapshot.toolUse.name}' executed successfully.` },
          ],
        },
      ];

      const finalBubbleId = `confirm-final-${Date.now()}`;
      let inserted = false;
      try {
        for await (const chunk of streamCompleteChat({
          text: queuedItem.text,
          lang: queuedItem.lang,
          model: modelPref,
          signal: ctrl.signal,
          priorMessages,
        })) {
          if (!mountedRef.current) return;
          if (!inserted) {
            inserted = true;
            setMessages((m) => [
              ...m,
              { role: "assistant", text: chunk.accumulated, attachments: null, _id: finalBubbleId } as AiMessage & { _id: string },
            ]);
          } else {
            setMessages((m) =>
              m.map((msg) => {
                const msgWithId = msg as AiMessage & { _id?: string };
                return msgWithId._id === finalBubbleId ? { ...msg, text: chunk.accumulated } : msg;
              }),
            );
          }
          if (chunk.done) break; // Bounded: counter cap=1 — stop after one final turn.
        }
      } catch {
        // Final acknowledgement stream failed — tolerated (write event already emitted).
        if (inserted) {
          setMessages((m) => m.filter((msg) => (msg as AiMessage & { _id?: string })._id !== finalBubbleId));
        }
      }

      if (mountedRef.current) setThinking(false);
      abortCtrlRef.current = null;
    })();
  }, [pendingConfirmation, lang, model]);

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
        onDeleteConvo={handleDeleteConvo}
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

        {bannerError != null && (
          <ErrorBanner
            error={bannerError}
            lang={lang}
            onDismiss={() => setBannerError(null)}
            onRetry={() => {
              setBannerError(null);
            }}
            onOpenSettings={handleOpenSettings}
          />
        )}

        {/* P3: ConfirmationCard — shown when model returns a tool_use block.
            CRITICAL: rendering this card does NOT execute any write.
            Write event emitted ONLY on explicit Confirm click (P4). */}
        {pendingConfirmation != null && (() => {
          const tool = findTool(pendingConfirmation.toolUse.name);
          if (!tool) return null;
          const spec = tool.toConfirmation(pendingConfirmation.toolUse.input);
          return (
            <ConfirmationCard
              spec={spec}
              lang={lang}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          );
        })()}

        <AiComposer
          input={input}
          onInputChange={setInput}
          attachments={attachments}
          onAttachFiles={handleAttachFiles}
          onRemoveAttachment={handleRemoveAttachment}
          voiceOn={voiceOn}
          onVoiceToggle={handleVoiceToggle}
          onSend={() => send()}
          lang={lang}
        />
      </main>
    </div>
  );
}
