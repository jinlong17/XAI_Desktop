/**
 * AC-PARITY-1..2: Byte-for-byte parity between PREF_REGISTRY and DESIGN.md §9.2
 *
 * This test reads "web design/DESIGN.md" at test-time and parses the §9.2
 * table to extract xai_* keys. It then asserts:
 *   - PARITY-1: every key extracted from §9.2 is in PREF_REGISTRY
 *   - PARITY-2: every PREF_REGISTRY key (excluding proposed + xai_pref_*)
 *               is in the §9.2 extracted set
 *
 * If §9.2 is edited (adding or renaming a key), this test catches the drift.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { PREF_REGISTRY } from "../internal/registry.js";

// ---------------------------------------------------------------------------
// Resolve DESIGN.md path relative to monorepo root
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// From packages/plugin-web-storage/src/__tests__/:
//   ../../..  → packages/plugin-web-storage/
//   ../../../../ → monorepo root (XAI_Desktop/)
const MONOREPO_ROOT = resolve(__dirname, "../../../..");
const DESIGN_MD_PATH = resolve(MONOREPO_ROOT, "web design/DESIGN.md");

function loadDesignMd(): string {
  return readFileSync(DESIGN_MD_PATH, "utf-8");
}

// ---------------------------------------------------------------------------
// Extract xai_* keys from §9.2 section of DESIGN.md
// ---------------------------------------------------------------------------

function extractSection92Keys(content: string): string[] {
  // Find the §9.2 section
  const sectionMatch = content.match(
    /###\s*9\.2[^#]*?\n([\s\S]*?)(?=\n###|\n##|\n#|$)/,
  );
  if (!sectionMatch) {
    throw new Error(
      "Could not find §9.2 section in DESIGN.md. Test infrastructure broken.",
    );
  }

  const section = sectionMatch[1] ?? "";

  // Extract all `xai_*` key tokens from the table (backtick-quoted)
  // The table uses format: | `xai_key` / `xai_key2` | description |
  // We need to match all xai_* tokens (not xai_pref_* which is a prefix family)
  const rawKeys: string[] = [];
  const regex = /`(xai_[a-z_0-9]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(section)) !== null) {
    const key = match[1];
    // Exclude the prefix family placeholder
    if (key && key !== "xai_pref_*" && !key.endsWith("_*")) {
      rawKeys.push(key);
    }
  }

  return [...new Set(rawKeys)];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AC-PARITY-1: all §9.2 keys are in PREF_REGISTRY", () => {
  it("every xai_* key in DESIGN.md §9.2 table exists in PREF_REGISTRY", () => {
    const content = loadDesignMd();
    const designKeys = extractSection92Keys(content);
    const registryKeys = new Set(Object.keys(PREF_REGISTRY));

    expect(designKeys.length, "No keys extracted from §9.2 — check regex or section header").toBeGreaterThan(0);

    const missing: string[] = [];
    for (const key of designKeys) {
      if (!registryKeys.has(key)) {
        missing.push(key);
      }
    }

    expect(
      missing,
      `PREF_REGISTRY is missing keys from DESIGN.md §9.2: ${missing.join(", ")}`,
    ).toHaveLength(0);
  });
});

describe("AC-PARITY-2: all PREF_REGISTRY explicit keys are in §9.2", () => {
  it("no PREF_REGISTRY key (excluding proposed) is missing from §9.2", () => {
    const content = loadDesignMd();
    const designKeys = new Set(extractSection92Keys(content));
    const registryEntries = Object.entries(PREF_REGISTRY);

    // Exclude proposed keys — they may not appear literally in the §9.2 table
    // (they come from ADR-0007 §S8 which adds them separately)
    const nonProposedKeys = registryEntries
      .filter(([, entry]) => !(entry as { proposed?: true }).proposed)
      .map(([key]) => key);

    const missing: string[] = [];
    for (const key of nonProposedKeys) {
      if (!designKeys.has(key)) {
        missing.push(key);
      }
    }

    expect(
      missing,
      `PREF_REGISTRY has keys not found in DESIGN.md §9.2: ${missing.join(", ")}`,
    ).toHaveLength(0);
  });
});
