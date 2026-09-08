/**
 * AvatarMenu — direction-aware popover for the rail avatar button.
 *
 * Port of web design/shell.jsx lines 19-67.
 * Reads lang + railPos from useWebShell().
 * Popover direction per DESIGN.md §4.14:
 *   left   → data-anchor="left-top-right"   (top-right 展开)
 *   right  → data-anchor="right-top-left"   (top-left 展开)
 *   top    → data-anchor="top-bottom-left"  (左下 展开)
 *   bottom → data-anchor="bottom-top-left"  (左上 展开)
 *
 * API contract: packages/xai-web-shell/docs/api.md §2.4
 */

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { Icon } from "./icons.js";
import { useWebShell } from "./registry.js";
import { SignOutConfirmDialog } from "./SignOutConfirmDialog.js";
import type { AvatarMenuProps, RailPos } from "./types.js";

// ---- Popover anchor mapping (DESIGN.md §4.14) ------------------------------

function railPosToAnchor(pos: RailPos): string {
  switch (pos) {
    case "left":   return "left-top-right";
    case "right":  return "right-top-left";
    case "top":    return "top-bottom-left";
    case "bottom": return "bottom-top-left";
    default:       return "left-top-right";
  }
}

// ---- AvatarMenu component --------------------------------------------------

export function AvatarMenu({
  open,
  onClose,
  onOpenSettings,
  onOpenStatistics,
  onSignOut,
}: AvatarMenuProps): ReactElement | null {
  const { lang, railPos } = useWebShell();
  const { s } = useI18n(lang);

  // Controls the sign-out confirmation dialog (Option C)
  const [dialogOpen, setDialogOpen] = useState(false);

  // Escape key handler (B1: cleanup before re-attach)
  // Note: only handle ESC on the popover when the dialog is NOT open
  // (the dialog handles its own ESC via the native cancel event)
  useEffect(() => {
    if (!open || dialogOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, dialogOpen]);

  // Reset dialog state when popover closes
  useEffect(() => {
    if (!open) setDialogOpen(false);
  }, [open]);

  if (!open) return null;

  const anchor = railPosToAnchor(railPos);

  return (
    <>
      <div className="avatar-menu-scrim" onClick={onClose} />
      <div className="avatar-menu" role="menu" data-anchor={anchor}>
        <div className="avm-header">
          <div className="avm-avatar">
            <svg viewBox="0 0 40 40" width="36" height="36">
              <defs>
                <linearGradient id="avmg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#d8c8b7" />
                  <stop offset="1" stopColor="#a08877" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" fill="url(#avmg)" />
              <circle cx="20" cy="16" r="6" fill="#fff" opacity=".7" />
              <ellipse cx="20" cy="32" rx="11" ry="7" fill="#fff" opacity=".55" />
            </svg>
            <span className="avm-crown">
              <Icon name="star" size={10} />
            </span>
          </div>
          <div className="avm-id">
            <div className="avm-name">{lang === "zh" ? "百事可爱" : "Aki Chen"}</div>
            <div className="avm-mail">aki.chen@xai.app</div>
          </div>
        </div>

        <div className="avm-items">
          <button
            type="button"
            className="avm-item"
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
          >
            <Icon name="sliders" size={16} />
            <span>{s("avatar.settings")}</span>
          </button>
          <button
            type="button"
            className="avm-item"
            onClick={() => {
              onOpenStatistics();
              onClose();
            }}
          >
            <Icon name="chart" size={16} />
            <span>{s("avatar.statistics")}</span>
          </button>
          <div className="avm-divider" />
          <button
            type="button"
            className="avm-item danger"
            onClick={() => {
              if (onSignOut) {
                // Option C: open confirmation dialog instead of calling directly
                setDialogOpen(true);
              } else {
                // DEV-only warn when onSignOut prop is not wired (backward-compatible)
                if (
                  typeof import.meta !== "undefined" &&
                  (import.meta as { env?: { DEV?: boolean } }).env?.DEV
                ) {
                  console.warn("[xai-web-shell] sign-out not wired");
                }
                onClose();
              }
            }}
          >
            <Icon
              name="download"
              size={16}
              style={{ transform: "rotate(180deg)" }}
            />
            <span>{s("avatar.sign_out")}</span>
          </button>
        </div>

        {/* Sign-out confirmation dialog (Option C) — shown when onSignOut is wired */}
        <SignOutConfirmDialog
          open={dialogOpen}
          onConfirm={() => {
            setDialogOpen(false);
            onSignOut?.();
          }}
          onCancel={() => setDialogOpen(false)}
        />
      </div>
    </>
  );
}
