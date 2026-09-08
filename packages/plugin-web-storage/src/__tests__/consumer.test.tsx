/**
 * Consumer smoke tests — AC-E2E-1..3
 * Validates that downstream W2 rows can import and use the package.
 *
 * Environment: jsdom (default, from vitest.config.ts)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { createElement, useState } from "react";
import { usePref } from "../index.js";
import { _clearAllListeners } from "../internal/storage.js";

// ---------------------------------------------------------------------------
// AC-E2E-1: Import resolves (type-check pass)
// This test passes if the file compiles and imports correctly.
// ---------------------------------------------------------------------------

describe("AC-E2E-1: import from package resolves", () => {
  it("usePref, setPref, isPrefKey, type WebPrefKey all import cleanly", async () => {
    const api = await import("../index.js");
    expect(typeof api.usePref).toBe("function");
    expect(typeof api.setPref).toBe("function");
    expect(typeof api.isPrefKey).toBe("function");
    expect(typeof api.PREF_REGISTRY).toBe("object");
  });
});

// ---------------------------------------------------------------------------
// AC-E2E-2: Note — Vite build sanity (AC-E2E-2) is checked by
// `pnpm --filter @repo/web build` as part of P3 gates (see dev_log.md).
// That gate requires apps/web/package.json to add this package as a dep,
// which is row #5 (xai-web-shell)'s responsibility.
// We document this here for the verify agent.
// ---------------------------------------------------------------------------

describe("AC-E2E-2: Vite build sanity gate", () => {
  it("(deferred to feature-verify) pnpm --filter @repo/web build must exit 0", () => {
    // This test documents the manual gate; the verify agent runs the build command.
    // Row #5 (xai-web-shell) adds the dep; this test serves as documentation.
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-E2E-3: Mock consumer using usePref("xai_pet_id") mounts in jsdom
// ---------------------------------------------------------------------------

describe("AC-E2E-3: consumer component mounts without error", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
    _clearAllListeners();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("PetPicker mock component using usePref('xai_pet_id') mounts and renders", async () => {
    let renderedPetId: string | undefined;

    function PetPicker() {
      const [petId] = usePref("xai_pet_id");
      renderedPetId = petId as string;
      return createElement("div", { "data-testid": "pet-picker" }, petId as string);
    }

    await act(async () => {
      root.render(createElement(PetPicker));
    });

    expect(renderedPetId).toBe("mochi"); // registry default
    expect(container.querySelector("[data-testid='pet-picker']")).not.toBeNull();
  });

  it("multi-key consumer mounts cleanly", async () => {
    function MultiKeyConsumer() {
      const [hue] = usePref("xai_accent_hue");
      const [pos] = usePref("xai_rail_pos");
      return createElement("div", null, `${hue}-${pos}`);
    }

    await act(async () => {
      root.render(createElement(MultiKeyConsumer));
    });

    expect(container.textContent).toBe("165-left");
  });
});
