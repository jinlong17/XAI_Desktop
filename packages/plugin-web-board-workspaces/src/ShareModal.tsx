/**
 * ShareModal — native <dialog> share URL modal.
 *
 * Gap-closure row #6: Board Share feature (P4).
 * Row #11: explicit mock share contract. No real backend access grant.
 * HC9: Emit-before-close pattern (mirrors row #5 precedent).
 *
 * API contract: packages/xai-web-board-workspaces/docs/api.md §S15.2
 */

import { useEffect, useRef, useState } from "react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { Board, BoardVisibility } from "@repo/plugin-web-board-core";
import {
  createMockBoardShareEnvelope,
  type BoardShareEnvelope,
} from "./internal/shareContract.js";

export interface ShareModalProps {
  board: Board;
  visibility: BoardVisibility;
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
  stubBadge: { en: "Mock link", zh: "模拟链接" },
  stubMessage: {
    en: "Planning-only link. It does not grant access until sharing backend is connected.",
    zh: "仅用于规划展示。分享后端接入前，此链接不会授予访问权限。",
  },
  permission: { en: "Permission: view-only", zh: "权限：仅查看" },
  visibility: { en: "Visibility", zh: "可见性" },
  visibilityPrivate: { en: "Private", zh: "私有" },
  visibilityShared: { en: "Shared", zh: "共享" },
} as const;

export function ShareModal({ board, visibility, lang, onClose }: ShareModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [envelope, setEnvelope] = useState<BoardShareEnvelope | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  // Open dialog on mount
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Generate explicit mock share envelope asynchronously
  useEffect(() => {
    let cancelled = false;
    createMockBoardShareEnvelope(board.id, visibility).then((generated) => {
      if (!cancelled) setEnvelope(generated);
    });
    return () => { cancelled = true; };
  }, [board.id, visibility]);

  const t = (key: keyof typeof STR) => STR[key][lang];
  const visibilityLabel =
    visibility === "shared" ? t("visibilityShared") : t("visibilityPrivate");

  function handleClose() {
    // Emit-before-close: fire event BEFORE calling dialog.close() and onClose()
    emitWebEvent("web:board:share-requested", {
      boardId: board.id,
      url: envelope?.url ?? "",
      source: "header",
      mode: "mock",
      visibility,
      permission: "view",
      expiresAt: null,
      backend: "unimplemented",
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
    if (!envelope) return;
    try {
      await navigator.clipboard.writeText(envelope.url);
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
  }, [envelope]);

  return (
    <dialog
      ref={dialogRef}
      className="share-modal"
      data-testid="share-dialog"
      onClick={handleBackdropClick}
    >
      <div className="sm-body">
        <h2 className="sm-heading" data-testid="sm-heading">{t("heading")}</h2>

        <div className="sm-stub-banner" data-testid="sm-stub-banner">
          <strong data-testid="sm-stub-badge">{t("stubBadge")}</strong>
          <span>{t("stubMessage")}</span>
          <span className="mono" data-testid="sm-share-contract">
            {envelope
              ? `${envelope.mode}/${envelope.backend}/${envelope.permission}`
              : "mock/unimplemented/view"}
          </span>
        </div>

        <div className="sm-url-row">
          <label className="sm-url-label">{t("urlLabel")}</label>
          <input
            type="text"
            className="sm-url-input"
            data-testid="sm-url-input"
            value={envelope?.url ?? t("generating")}
            readOnly
          />
          <p className="sm-permission-note" data-testid="sm-permission-note">
            {t("permission")}
          </p>
          <p className="sm-permission-note" data-testid="sm-visibility-note">
            {t("visibility")}: {visibilityLabel}
          </p>
        </div>

        <div className="sm-actions">
          <button
            type="button"
            className="sm-copy-btn"
            data-testid="sm-copy-btn"
            onClick={handleCopy}
            disabled={!envelope}
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
