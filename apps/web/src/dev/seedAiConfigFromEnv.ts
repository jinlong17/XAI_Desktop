/**
 * useDevAiConfigSeed — DEV-ONLY: seed AI provider config + key from
 * `apps/web/.env.local` into the runtime stores, so `.env.local` is the single
 * local source of truth for the Gemini (openai-compatible) configuration.
 *
 * Reads (all `VITE_`-prefixed, from the gitignored `.env.local`):
 *   - VITE_GEMINI_API_KEY  — the API key (REQUIRED to seed; blank → no-op)
 *   - VITE_AI_PROVIDER     — default "openai-compatible"
 *   - VITE_AI_BASE_URL     — default Gemini OpenAI-compatible endpoint
 *   - VITE_AI_MODEL        — default "gemini-3.1-flash-lite"
 *
 * Writes:
 *   - xai_ai_provider / xai_ai_base_url / xai_ai_model_default prefs
 *   - aiKeyStorage.saveKey("openai-compatible", key) → encrypted secretStore
 *
 * SECURITY — why this never leaks the key into production:
 *   The entire effect body is gated behind `import.meta.env.DEV`. Vite
 *   statically replaces `import.meta.env.DEV` with the literal `false` in a
 *   production build, making the body unreachable; the minifier then
 *   dead-code-eliminates it, so the `import.meta.env.VITE_GEMINI_API_KEY`
 *   reference is removed and never inlined into the production bundle. The key
 *   lives ONLY in `.env.local` (gitignored — never committed/pushed).
 *   Verified at build time: a production `vite build` + grep of `dist/` for
 *   `VITE_GEMINI_API_KEY` / `seedAiConfigFromEnv` returns zero hits (recorded in
 *   the carve-out evidence). Re-run that grep if this file changes.
 *
 * env is AUTHORITATIVE in DEV: each dev load re-seeds from `.env.local` so the
 * file is the single source. To use a different key transiently, edit
 * `.env.local` (do NOT commit) — or clear it and use Settings → AI.
 *
 * Carve-out: docs/reviews/_p0-carve-outs/20260529-gemini-provider-enablement.md §6
 */
import { useEffect } from "react";
import { setPref } from "@repo/plugin-web-storage";
import { aiKeyStorage } from "@repo/plugin-web-ai-chat";

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_MODEL = "gemini-3.1-flash-lite";

export function useDevAiConfigSeed(): void {
  useEffect(() => {
    // Production builds: `import.meta.env.DEV` is statically `false` → this
    // whole block is dead-code-eliminated (key reference never bundled).
    if (!import.meta.env.DEV || import.meta.env.MODE === "test") return;

    const env = import.meta.env as Record<string, string | undefined>;
    const key = (env.VITE_GEMINI_API_KEY ?? "").trim();
    if (!key) return; // no key configured in .env.local → nothing to seed

    const provider = (env.VITE_AI_PROVIDER ?? "openai-compatible").trim();
    const baseUrl = (env.VITE_AI_BASE_URL ?? DEFAULT_BASE_URL).trim();
    const model = (env.VITE_AI_MODEL ?? DEFAULT_MODEL).trim();

    let cancelled = false;
    void (async () => {
      try {
        setPref("xai_ai_provider", provider);
        setPref("xai_ai_base_url", baseUrl);
        setPref("xai_ai_model_default", model);
        await aiKeyStorage.saveKey("openai-compatible", key);
        if (!cancelled) {
          console.info(
            `[dev] AI config seeded from .env.local (provider=${provider}, model=${model}); key length=${key.length}`,
          );
        }
      } catch (err) {
        console.warn("[dev] AI config seed from .env.local failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
}
