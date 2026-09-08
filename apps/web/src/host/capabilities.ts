import type {
  ConsoleCapabilityResult,
  ConsoleRouteState,
  ConsoleShortcutBinding,
  ConsoleViewCapabilities,
} from "@repo/core/types";

export interface CreateWebConsoleCapabilitiesOptions {
  navigateTo: (path: string, replace?: boolean) => void;
  onOpenSearch?: (query?: string) => void;
}

function ok<T>(value: T): ConsoleCapabilityResult<T> {
  return { ok: true, value };
}

function err(
  code: "unsupported_in_browser" | "permission_denied" | "not_configured" | "build_blocked",
  message: string
): ConsoleCapabilityResult<never> {
  return { ok: false, code, message };
}

function buildRoutePath(route: ConsoleRouteState): string {
  const segments = [route.listId, route.detailId].filter(Boolean).map((part) => String(part));
  return segments.length > 0 ? `/app/${route.moduleId}/${segments.join("/")}` : `/app/${route.moduleId}`;
}

function parseShortcut(binding: ConsoleShortcutBinding): {
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
} | null {
  const tokens = binding.combo
    .trim()
    .toLowerCase()
    .split("+")
    .map((token) => token.trim())
    .filter(Boolean);

  const key = tokens[tokens.length - 1];

  if (!key) {
    return null;
  }

  return {
    key,
    ctrl: tokens.includes("ctrl") || tokens.includes("control"),
    meta: tokens.includes("meta") || tokens.includes("cmd") || tokens.includes("command"),
    shift: tokens.includes("shift"),
    alt: tokens.includes("alt") || tokens.includes("option"),
  };
}

export function createWebConsoleCapabilities({ navigateTo, onOpenSearch }: CreateWebConsoleCapabilitiesOptions): ConsoleViewCapabilities {
  return {
    navigate: (route) => {
      navigateTo(buildRoutePath(route));
    },
    openSettings: (section) => {
      if (section) {
        navigateTo(`/app/settings/${section}`);
        return;
      }
      navigateTo("/app/settings");
    },
    openCommandPalette: (query) => {
      onOpenSearch?.(query);
    },
    focusPane: () => {},
    persistState: async () => {},
    requestReconcile: async () => {},
    download: async ({ blob, filename, mimeType }) => {
      if (typeof window === "undefined") {
        return err("not_configured", "window_unavailable");
      }

      const preparedBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;
      const objectUrl = window.URL.createObjectURL(preparedBlob);
      const anchor = window.document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      window.URL.revokeObjectURL(objectUrl);
      return ok(undefined);
    },
    notify: async ({ title, body, tag }) => {
      if (typeof window === "undefined" || typeof window.Notification === "undefined") {
        return err("unsupported_in_browser", "notification_api_unavailable");
      }

      if (window.Notification.permission === "default") {
        const permission = await window.Notification.requestPermission();
        if (permission !== "granted") {
          return err("permission_denied", "notification_permission_denied");
        }
      }

      if (window.Notification.permission !== "granted") {
        return err("permission_denied", "notification_permission_denied");
      }

      new window.Notification(title, { body, tag });
      return ok(undefined);
    },
    registerShortcut: (binding, handler) => {
      if (typeof window === "undefined") {
        return err("not_configured", "window_unavailable");
      }

      const parsed = parseShortcut(binding);
      if (!parsed) {
        return err("not_configured", "invalid_shortcut_combo");
      }

      const listener = (event: KeyboardEvent) => {
        const keyMatches = event.key.toLowerCase() === parsed.key;
        if (!keyMatches) {
          return;
        }

        const ctrlMatches = parsed.ctrl ? event.ctrlKey : true;
        const metaMatches = parsed.meta ? event.metaKey : true;
        const shiftMatches = parsed.shift ? event.shiftKey : true;
        const altMatches = parsed.alt ? event.altKey : true;

        if (ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          handler();
        }
      };

      window.addEventListener("keydown", listener);
      return ok(() => {
        window.removeEventListener("keydown", listener);
      });
    },
    beginDrag: async () => err("unsupported_in_browser", "browser_drag_stub_only"),
    invokeNativeCapability: async () => err("unsupported_in_browser", "native_capability_unavailable"),
    status: (capability) => {
      switch (capability) {
        case "download":
        case "notification":
        case "shortcut":
        case "search":
        case "settings":
          return "supported";
        case "native":
        case "desktop":
          return "unsupported";
        default:
          return "blocked";
      }
    },
  };
}
