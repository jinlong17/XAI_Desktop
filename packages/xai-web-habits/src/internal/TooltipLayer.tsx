import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AnchorRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

type TooltipState = {
  text: string;
  rect: AnchorRect;
};

type TooltipPosition = {
  top: number;
  left: number;
  ready: boolean;
};

interface TooltipLayerProps {
  rootRef: React.RefObject<HTMLElement | null>;
}

function readRect(element: HTMLElement): AnchorRect {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function findTooltipTarget(target: EventTarget | null, root: HTMLElement): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement>("[data-tooltip]");
  if (!element || !root.contains(element)) return null;
  return element.dataset.tooltip ? element : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function TooltipLayer({ rootRef }: TooltipLayerProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0, ready: false });

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return undefined;
    const root: HTMLElement = rootElement;

    function showFor(element: HTMLElement) {
      activeElementRef.current = element;
      setTooltip({ text: element.dataset.tooltip ?? "", rect: readRect(element) });
    }

    function hide() {
      activeElementRef.current = null;
      setTooltip(null);
      setPosition({ top: 0, left: 0, ready: false });
    }

    function handlePointerOver(event: PointerEvent) {
      const element = findTooltipTarget(event.target, root);
      if (!element || element === activeElementRef.current) return;
      showFor(element);
    }

    function handlePointerOut(event: PointerEvent) {
      const active = activeElementRef.current;
      if (!active) return;
      if (event.relatedTarget instanceof Node && active.contains(event.relatedTarget)) return;
      hide();
    }

    function handleFocusIn(event: FocusEvent) {
      const element = findTooltipTarget(event.target, root);
      if (element) showFor(element);
    }

    function handleFocusOut(event: FocusEvent) {
      const active = activeElementRef.current;
      if (!active) return;
      if (event.relatedTarget instanceof Node && active.contains(event.relatedTarget)) return;
      hide();
    }

    root.addEventListener("pointerover", handlePointerOver);
    root.addEventListener("pointerout", handlePointerOut);
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);
    root.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);

    return () => {
      root.removeEventListener("pointerover", handlePointerOver);
      root.removeEventListener("pointerout", handlePointerOut);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      root.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [rootRef]);

  useLayoutEffect(() => {
    if (!tooltip) return;
    const node = tooltipRef.current;
    if (!node) return;

    const margin = 8;
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const anchorCenter = tooltip.rect.left + tooltip.rect.width / 2;
    const left = clamp(anchorCenter - width / 2, margin, Math.max(margin, viewportWidth - width - margin));
    const preferredTop = tooltip.rect.top - height - margin;
    const top = preferredTop >= margin
      ? preferredTop
      : clamp(tooltip.rect.bottom + margin, margin, Math.max(margin, viewportHeight - height - margin));

    setPosition({ top, left, ready: true });
  }, [tooltip]);

  if (!tooltip || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      className="habit-tooltip-layer"
      style={{
        top: position.top,
        left: position.left,
        opacity: position.ready ? 1 : 0,
      }}
    >
      {tooltip.text}
    </div>,
    document.body,
  );
}
