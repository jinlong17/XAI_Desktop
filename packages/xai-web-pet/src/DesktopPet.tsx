/**
 * DesktopPet — floating desktop pet component.
 *
 * P2 implementation (replaces P1 null stub).
 * Implements drag, persistence (xai_pet_pos + xai_pet_id), click happy state,
 * tip rotation, and web:shell:pet-toggle event subscription.
 *
 * PetPicker is still the P1 stub in P2; real picker lands in P3.
 *
 * Mount: top-level sibling of <Shell> in apps/web/src/App.tsx (D1 Option B).
 * Position: position:fixed via .pet-wrap, transform:translate(x,y) inline.
 *
 * Port of web design/pet.jsx lines 191-300.
 */

import { useState, useEffect, useCallback, type JSX } from "react";
import { usePref } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import { PetArtRenderers } from "./PetArt.js";
import { PetPicker } from "./PetPicker.js";
import { PET_DEFS } from "./internal/petDefs.js";
import { clampPos } from "./internal/drag.js";
import { useTipRotation } from "./internal/useTipRotation.js";
import { useToggleSync } from "./internal/useToggleSync.js";
import {
  HAPPY_DURATION_MS,
  BUBBLE_GUARD_PX,
  PET_BODY_PX,
} from "./internal/timing.js";
import type { DesktopPetProps } from "./types.js";
import type { PetId, PetPos } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DragState {
  ox: number;
  oy: number;
  moved: boolean;
}

export function resolveDefaultPetPos(): PetPos {
  if (typeof window === "undefined") {
    return { x: 280, y: 640 };
  }

  return clampPos(
    {
      x: window.innerWidth - PET_BODY_PX - 24,
      y: window.innerHeight - PET_BODY_PX - 24,
    },
    {
      w: window.innerWidth,
      h: window.innerHeight,
    },
  );
}

// ---------------------------------------------------------------------------
// Inline sparkle SVG (private — avoids extending WebShellIconName per api.md §3.5)
// ---------------------------------------------------------------------------

function SparkleIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" aria-hidden="true">
      <path
        d="M6 1 L6.8 4.5 L10 5 L6.8 5.5 L6 9 L5.2 5.5 L2 5 L5.2 4.5 Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DesktopPet
// ---------------------------------------------------------------------------

export function DesktopPet({ on, lang }: DesktopPetProps): JSX.Element | null {
  // ---- Persistence ---------------------------------------------------------
  const [petId, setPetId] = usePref("xai_pet_id");
  const [pos, setPos] = usePref("xai_pet_pos", resolveDefaultPetPos());

  // ---- Local state ---------------------------------------------------------
  const [drag, setDrag] = useState<DragState | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [mood, setMood] = useState<"idle" | "happy">("idle");
  const [pickerOpen, setPickerOpen] = useState(false);

  // ---- Toggle sync (event bus + prop reconcile) ----------------------------
  const internalOn = useToggleSync(on);

  // ---- Tip rotation --------------------------------------------------------
  useTipRotation({ on: internalOn, lang, pickerOpen, setBubble });

  // ---- i18n (for click tips + bubble link) ---------------------------------
  const { s } = useI18n(lang);

  // ---- Pointer handlers (drag + click) ------------------------------------

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Store offset from current pos so we can compute new pos on move
      setDrag({ ox: e.clientX - pos.x, oy: e.clientY - pos.y, moved: false });
      setBubble(null);
    },
    [pos],
  );

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      const raw: PetPos = {
        x: e.clientX - drag.ox,
        y: e.clientY - drag.oy,
      };
      const clamped = clampPos(raw, {
        w: window.innerWidth,
        h: window.innerHeight,
      });
      setPos(clamped);
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 1) {
        setDrag((d) => (d ? { ...d, moved: true } : null));
      }
    };

    const onUp = () => {
      if (drag && !drag.moved) {
        // Click (no drag movement) → happy mood + random tip
        const clickTips = [
          s("pet.tip1"),
          s("pet.tip2"),
          s("pet.tip3"),
          s("pet.tip4"),
          s("pet.working"),
        ];
        const pick = clickTips[Math.floor(Math.random() * clickTips.length)];
        setBubble(pick ?? null);
        setMood("happy");
        setTimeout(() => setMood("idle"), HAPPY_DURATION_MS);
      }
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, s, setPos]);

  // ---- Window resize: re-clamp position -----------------------------------

  useEffect(() => {
    const clampCurrentPosition = () => {
      const clamped = clampPos(pos, {
        w: window.innerWidth,
        h: window.innerHeight,
      });
      // Only persist if something actually changed
      if (clamped.x !== pos.x || clamped.y !== pos.y) {
        setPos(clamped);
      }
    };

    clampCurrentPosition();
    window.addEventListener("resize", clampCurrentPosition);
    return () => window.removeEventListener("resize", clampCurrentPosition);
  }, [pos, setPos]);

  // ---- Resolve active pet def (fallback to mochi for corrupted storage) ---

  const def = PET_DEFS.find((p) => p.id === petId) ?? PET_DEFS[0];
  if (!def) return null; // should never happen

  // ---- Render --------------------------------------------------------------

  // When fully hidden: return only the picker (allows choosing pet while hidden)
  if (!internalOn) {
    return (
      <PetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        current={def.id as PetId}
        onSelect={setPetId}
        lang={lang}
      />
    );
  }

  const bubbleSide: "left" | "right" =
    pos.x > window.innerWidth - BUBBLE_GUARD_PX ? "left" : "right";

  const ArtRenderer = PetArtRenderers[def.id];

  return (
    <>
      <div
        className="pet-wrap"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          cursor: drag ? "grabbing" : "grab",
        }}
      >
        {bubble && (
          <div className={`pet-bubble pet-bubble-${bubbleSide}`}>
            <p className="pet-bubble-text">{bubble}</p>
            <button
              className="pet-change-link"
              onClick={() => {
                setPickerOpen(true);
                setBubble(null);
              }}
            >
              {lang === "zh"
                ? `🐾 换一只 (${def.name.zh})`
                : `🐾 Change pet (${def.name.en})`}
            </button>
          </div>
        )}

        <div
          className={`pet-body pet-anim-${def.anim} mood-${mood}`}
          onPointerDown={handlePointerDown}
        >
          {ArtRenderer ? ArtRenderer(mood) : null}
          <div className="pet-shadow" />
        </div>

        <button
          className="pet-swap-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setPickerOpen(true)}
          title={lang === "zh" ? "更换桌宠" : "Change pet"}
        >
          <SparkleIcon />
        </button>
      </div>

      <PetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        current={def.id as PetId}
        onSelect={setPetId}
        lang={lang}
      />
    </>
  );
}
