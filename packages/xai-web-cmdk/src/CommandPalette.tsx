/**
 * CommandPalette — modal renderer + keyboard listener.
 *
 * Mounted ONCE at app shell level as a sibling of <Shell/>.
 * The global keyboard listener (Cmd+K / Ctrl+K) lives inside this component
 * via useEffect.
 *
 * State machine (design.md §State machine):
 * - closed (default)
 * - Cmd+K OR topbar click → open, query=""
 * - query changes → buildIndex runs synchronously (memoized)
 * - ↑/↓ → activeIndex updates
 * - Enter / click row → navigateToHit → emit web:search:jump → close
 * - Esc / scrim click → close
 * - Cmd+Enter → aliased to Enter (no-op for v1, per HC5)
 *
 * O1 resolution: lang is optional prop. When absent, reads from useWebShell().lang.
 *
 * design.md §"Component graph" + §"Phase P3"
 * api.md §1.5
 * test.md CP1..CP18
 */

import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { useWebShell } from "@repo/xai-web-shell";
import type { Lang } from "@repo/plugin-web-tokens";
import type { CommandPaletteProps, SearchHit } from "./types.js";
import { useCommandPaletteContext } from "./CommandPaletteProvider.js";
import { matchesCmdK } from "./internal/keyboardCombo.js";
import { buildIndex } from "./internal/buildIndex.js";
import { readModuleStates } from "./internal/readModuleStates.js";
import { navigateToHit } from "./internal/navigateToHit.js";
import { PaletteInput } from "./PaletteInput.js";
import { PaletteList } from "./PaletteList.js";
// Side-effect: register all 11 adapters when this module is imported
import "./adapters/index.js";
// Side-effect: import styles
import "./styles.css";

export function CommandPalette({ lang: langProp, navigate: navigateProp }: CommandPaletteProps) {
  const { isOpen, open, close, query, setQuery } = useCommandPaletteContext();
  const [activeIndex, setActiveIndex] = useState(0);

  // O1: lang from prop (test-override) or from useWebShell()
  const shell = useWebShell();
  const lang: Lang = langProp ?? shell.lang;

  // React Router navigate (or test override) — stable reference
  const routerNavigate = useNavigate();
  const routerNavigateRef = useRef(routerNavigate);
  routerNavigateRef.current = routerNavigate;
  const navigatePropRef = useRef(navigateProp);
  navigatePropRef.current = navigateProp;

  const navigate = useCallback((path: string) => {
    const prop = navigatePropRef.current;
    if (prop) {
      prop(path);
    } else {
      void routerNavigateRef.current(path);
    }
  }, []);

  // Capture module states ONCE at open time (design.md §State machine step 2)
  const [moduleStates] = useState(() => readModuleStates());

  // Build index memoized on query + open state
  const hits: readonly SearchHit[] = useMemo(() => {
    if (!isOpen) return [];
    return buildIndex(query, moduleStates);
  }, [isOpen, query, moduleStates]);

  // Reset activeIndex when hits change
  useEffect(() => {
    setActiveIndex(0);
  }, [hits]);

  // Global keyboard listener: Cmd+K / Ctrl+K opens palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (matchesCmdK(e)) {
        e.preventDefault();
        if (!isOpen) {
          open({ source: "shortcut" });
          emitWebEvent("web:search:invoked", {
            source: "shortcut",
            openedAt: new Date().toISOString(),
          });
        }
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [isOpen, open]);

  // Handle keyboard navigation within the palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => (hits.length === 0 ? 0 : (i + 1) % hits.length));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) =>
            hits.length === 0 ? 0 : (i - 1 + hits.length) % hits.length,
          );
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "Enter": {
          // Cmd+Enter aliased to Enter for v1 (HC5: no native new-tab semantics)
          e.preventDefault();
          const hit = hits[activeIndex];
          if (hit) {
            handleSelectHit(hit);
          }
          break;
        }
        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hits, activeIndex, close],
  );

  const handleSelectHit = useCallback(
    (hit: SearchHit) => {
      navigateToHit(hit, navigate, emitWebEvent, query);
      close();
    },
    [navigate, close, query],
  );

  if (!isOpen) return null;

  return (
    // Scrim: backdrop blur, click-to-close
    <div
      className="cmdk-scrim"
      role="presentation"
      onClick={(e) => {
        // Only close if the scrim itself (not the modal) was clicked
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      {/* Modal: role=dialog per HC6 + ARIA spec */}
      <div
        className="cmdk-modal"
        role="dialog"
        aria-modal="true"
        aria-label={lang === "zh" ? "全局搜索" : "Global search"}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <PaletteInput
          query={query}
          setQuery={setQuery}
          lang={lang}
          onKeyDown={handleKeyDown}
        />
        <PaletteList
          hits={hits}
          activeIndex={activeIndex}
          query={query}
          lang={lang}
          onSelect={handleSelectHit}
        />
      </div>
    </div>
  );
}
