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
        return {
          command,
          status: "degraded",
          available: true,
          message: `${command} is using a browser-safe substitute.`,
          data: payload as T,
        };
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
