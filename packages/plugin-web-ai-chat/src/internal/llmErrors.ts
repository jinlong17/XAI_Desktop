/**
 * llmErrors — LlmError discriminated union + classifyError function.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-5 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §12.3
 */

// ---- Public types ----------------------------------------------------------

export type LlmErrorKind =
  | "BadKey"
  | "RateLimited"
  | "Network"
  | "Server"
  | "Malformed";

export type LlmError =
  | { kind: "BadKey"; status: 401 | 403; detail?: string }
  | { kind: "RateLimited"; status: 429; retryAfterSec: number; detail?: string }
  | { kind: "Network"; cause: Error; detail?: string }
  | { kind: "Server"; status: number; body?: string; detail?: string }
  | { kind: "Malformed"; where: "sse-parse" | "json-parse" | "shape"; detail: string };

// Re-export type so it is accessible via the `type` export keyword trick used
// in secretStore.ts dynamic import.
export const type = "llmErrors" as const;

// ---- classifyError ---------------------------------------------------------

/**
 * Maps an HTTP Response or an Error to an LlmError.
 * Returns a Promise because it may need to await `response.text()`.
 */
export async function classifyError(input: Response | Error): Promise<LlmError> {
  if (input instanceof Response) {
    const status = input.status;

    if (status === 401 || status === 403) {
      let detail: string | undefined;
      try {
        const body = await input.text();
        if (body) detail = body.slice(0, 200);
      } catch {
        // ignore
      }
      return { kind: "BadKey", status: status as 401 | 403, detail };
    }

    if (status === 429) {
      let retryAfterSec = 60; // sensible default
      const retryAfterHeader = input.headers.get("retry-after");
      if (retryAfterHeader) {
        const numeric = Number(retryAfterHeader);
        if (!isNaN(numeric) && isFinite(numeric)) {
          retryAfterSec = Math.max(0, Math.min(3600, Math.round(numeric)));
        } else {
          // HTTP date string
          const parsed = Date.parse(retryAfterHeader);
          if (!isNaN(parsed)) {
            retryAfterSec = Math.max(
              0,
              Math.min(3600, Math.round((parsed - Date.now()) / 1000)),
            );
          }
        }
      }
      let detail: string | undefined;
      try {
        const body = await input.text();
        if (body) detail = body.slice(0, 200);
      } catch {
        // ignore
      }
      return { kind: "RateLimited", status: 429, retryAfterSec, detail };
    }

    if (status >= 500 && status < 600) {
      let body: string | undefined;
      try {
        body = (await input.text()).slice(0, 500);
      } catch {
        // ignore
      }
      return { kind: "Server", status, body };
    }

    // Unknown status (e.g. 418 I'm a teapot)
    let body: string | undefined;
    try {
      body = (await input.text()).slice(0, 500);
    } catch {
      // ignore
    }
    return { kind: "Server", status, body };
  }

  // Error branch
  const err = input as Error;

  // TypeError: Failed to fetch → Network
  if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
    return { kind: "Network", cause: err };
  }

  // SyntaxError from JSON.parse → Malformed json-parse
  if (err instanceof SyntaxError) {
    return { kind: "Malformed", where: "json-parse", detail: err.message };
  }

  // Generic fallback → Server with status 0
  return { kind: "Server", status: 0, body: err.message };
}
