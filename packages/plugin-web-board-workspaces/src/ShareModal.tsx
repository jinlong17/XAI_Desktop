/**
 * ShareModal — native <dialog> share URL modal.
 *
 * Gap-closure row #6: Board Share feature (P4).
 * HC2: Mock URL only. No real backend.
 * HC9: Emit-before-close pattern (mirrors row #5 precedent).
 *
 * API contract: packages/xai-web-board-workspaces/docs/api.md §S15.2
 */

import { useEffect, useRef, useState } from "react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { Board } from "@repo/plugin-web-board-core";
import { generateShareUrl } from "./internal/shareUrl.js";

export interface ShareModalProps {
  board: Board;
  lang: "en" | "zh";
  onClose: () => void;
}

const STR = {
  heading: { en: "Share board", zh: "分享看板" },
  urlLabel: { en: "Share link", zh: "分享链接" },
  copy: { en: "Copy", zh: "复制" },
  copied: { en: "Copied!", zh: "已复制" },
  close: { en: "Close", zh: "关闭" },
  generating: { en: "Generating…", zh: "生成中…" },
} as const;

export function ShareModal({ board, lang, onClose }: ShareModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  // Open dialog on mount
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Generate share URL asynchronously
  useEffect(() => {
    let cancelled = false;
    generateShareUrl(board.id).then((generated) => {
      if (!cancelled) setUrl(generated);
    });
    return () => { cancelled = true; };
  }, [board.id]);

  const t = (key: keyof typeof STR) => STR[key][lang];

  function handleClose() {
    // Emit-before-close: fire event BEFORE calling dialog.close() and onClose()
    emitWebEvent("web:board:share-requested", {
      boardId: board.id,
      url: url ?? "",
      source: "header",
    });
    dialogRef.current?.close();
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Silently ignore clipboard errors (insecure context / permission denied)
    }
  }

  // Native ESC closes dialog via 'cancel' event → clean up
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(e: Event) {
      e.preventDefault(); // We handle close ourselves for emit-before-close
      handleClose();
    }
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <dialog
      ref={dialogRef}
      className="share-modal"
      data-testid="share-dialog"
      onClick={handleBackdropClick}
    >
      <div className="sm-body">
        <h2 className="sm-heading" data-testid="sm-heading">{t("heading")}</h2>

        <div className="sm-url-row">
          <label className="sm-url-label">{t("urlLabel")}</label>
          <input
            type="text"
            className="sm-url-input"
            data-testid="sm-url-input"
            value={url ?? t("generating")}
            readOnly
          />
        </div>

        <div className="sm-actions">
          <button
            type="button"
            className="sm-copy-btn"
            data-testid="sm-copy-btn"
            onClick={handleCopy}
            disabled={!url}
          >
            {copyState === "copied" ? t("copied") : t("copy")}
          </button>
          <button
            type="button"
            className="sm-close-btn"
            data-testid="sm-close-btn"
            onClick={handleClose}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
