export type CapabilityStatus = "available" | "degraded" | "unavailable";

export interface CapabilityResponse<T = unknown> {
  command: string;
  status: CapabilityStatus;
  available: boolean;
  message: string;
  data?: T;
}

const webSafeCommands = new Set(["clipboard_read_text", "clipboard_write_text"]);
const degradedCommands = new Set(["organize_desktop", "focus_window", "list_windows", "fs_pick_file"]);

export function createTauriCapabilityStub() {
  return {
    async invoke<T = unknown>(command: string, payload?: unknown): Promise<CapabilityResponse<T>> {
      if (webSafeCommands.has(command)) {
        if (typeof navigator === "undefined" || !navigator.clipboard) {
          return {
            command,
            status: "degraded",
            available: false,
            message: "Clipboard API not available in this runtime.",
          };
        }

        try {
          const data =
            command === "clipboard_read_text"
              ? await navigator.clipboard.readText()
              : await navigator.clipboard.writeText(payload as string);
          return {
            command,
            status: "available",
            available: true,
            message: "Used navigator.clipboard.",
            data: data as T,
          };
        } catch (error) {
          return {
            command,
            status: "degraded",
            available: false,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      }
      if (degradedCommands.has(command)) {
        return {
          command,
          status: "degraded",
          available: false,
          message: `${command} requires desktop capabilities and is mocked in the web host.`,
          data: payload as T,
        };
      }
      return {
        command,
        status: "unavailable",
        available: false,
        message: `${command} is unavailable in browser runtime.`,
      };
    },
  };
}
