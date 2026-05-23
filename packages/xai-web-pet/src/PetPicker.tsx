/**
 * PetPicker — modal overlay for choosing a desktop pet.
 *
 * P3 implementation (replaces P1/P2 null stubs).
 *
 * Port of web design/pet.jsx lines 303-339.
 *
 * Structure:
 *   .pet-picker-scrim (fixed, click → onClose)
 *     .pet-picker (card, click stops propagation)
 *       .pp-head (title + close button)
 *       .pp-list (8 .pp-row buttons — each with live animation)
 *       .pp-foot (hint text)
 *
 * Each .pp-row's .pp-avatar gets class `pet-anim-<animid>` so animations
 * are live in the picker (D3 Option A, AC-PET-8).
 *
 * Close glyph is a private inline SVG (<CloseGlyph>) — does NOT extend
 * WebShellIconName (Frozen Assumption §4).
 */

import type { JSX } from "react";
import { PET_DEFS } from "./internal/petDefs.js";
import { PetArtRenderers } from "./PetArt.js";
import type { PetPickerProps } from "./types.js";

// ---------------------------------------------------------------------------
// Private close glyph SVG (per api.md §3.6 + plan P3 scope)
// ---------------------------------------------------------------------------

function CloseGlyph(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M6 6 L18 18 M18 6 L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PetPicker
// ---------------------------------------------------------------------------

export function PetPicker({
  open,
  onClose,
  current,
  onSelect,
  lang,
}: PetPickerProps): JSX.Element | null {
  if (!open) return null;

  return (
    <div className="pet-picker-scrim" onClick={onClose}>
      <div className="pet-picker" onClick={(e) => e.stopPropagation()}>
        <header className="pp-head">
          <div>
            <h3>{lang === "zh" ? "选择你的桌宠" : "Choose your companion"}</h3>
            <p>
              {lang === "zh"
                ? "每只小伙伴都有自己的小动作。"
                : "Each has its own little animation."}
            </p>
          </div>
          <button className="pp-close-btn" onClick={onClose} aria-label="Close picker">
            <CloseGlyph />
          </button>
        </header>

        <div className="pp-list">
          {PET_DEFS.map((p) => {
            const isCurrent = current === p.id;
            const ArtRenderer = PetArtRenderers[p.id];
            return (
              <button
                key={p.id}
                className={`pp-row${isCurrent ? " current" : ""}`}
                onClick={() => {
                  onSelect(p.id);
                  onClose();
                }}
              >
                <div className={`pp-avatar pet-anim-${p.anim}`}>
                  {ArtRenderer ? ArtRenderer("idle") : null}
                </div>
                <div className="pp-meta">
                  <div className="pp-name">{p.name[lang]}</div>
                  <div className="pp-desc">{p.desc[lang]}</div>
                </div>
                <span className={`pp-btn${isCurrent ? " selected" : ""}`}>
                  {isCurrent
                    ? lang === "zh"
                      ? "已选"
                      : "Selected"
                    : lang === "zh"
                      ? "选择"
                      : "Select"}
                </span>
              </button>
            );
          })}
        </div>

        <footer className="pp-foot">
          <span>
            {lang === "zh"
              ? "拖动桌宠到任何位置 · 点击查看小贴士"
              : "Drag the pet anywhere · Click for a tip"}
          </span>
        </footer>
      </div>
    </div>
  );
}
