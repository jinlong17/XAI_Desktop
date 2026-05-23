/**
 * @internal — codec.ts
 * Encode / decode helpers for the four supported codecs.
 * All functions are pure; they never touch localStorage directly.
 */

import type { PrefCodec } from "./registry.js";

// ---------------------------------------------------------------------------
// encode
// ---------------------------------------------------------------------------

/**
 * Serialize a value to the string that will be written to localStorage.
 * Returns `null` if the value cannot be encoded (should not happen in v1
 * because TypeScript prevents bad-codec calls at compile time, but we guard
 * anyway for runtime safety).
 */
export function encode(codec: PrefCodec, value: unknown): string | null {
  try {
    switch (codec) {
      case "string":
        return String(value);
      case "number":
        return String(value);
      case "boolean":
        return value ? "true" : "false";
      case "json":
        return JSON.stringify(value);
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// decode
// ---------------------------------------------------------------------------

/**
 * Deserialize a localStorage string back to a typed value.
 * Returns `null` on any decode failure (caller falls back to default).
 */
export function decode(codec: PrefCodec, raw: string): unknown {
  switch (codec) {
    case "string":
      return raw;
    case "number": {
      const n = Number(raw);
      if (Number.isNaN(n)) return null;
      return n;
    }
    case "boolean":
      if (raw === "true") return true;
      if (raw === "false") return false;
      return null;
    case "json": {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
}
