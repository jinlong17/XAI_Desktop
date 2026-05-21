import { createDeviceIdentityStore, type DeviceIdentityStore } from "./device-store";
import type { DeviceFailureReason, DeviceTransport } from "./device-transport";

export interface DeviceSessionState {
  accessToken: string;
  syncVersion: string;
}

export interface DeviceSessionController {
  ensureRegistered(state: DeviceSessionState): Promise<string>;
  heartbeat(state: DeviceSessionState): Promise<string>;
  buildContext(state: DeviceSessionState): Promise<{ accessToken: string; deviceId: string; syncVersion: string }>;
  handleDeviceFailure(reason: DeviceFailureReason): Promise<void>;
}

export interface CreateDeviceSessionControllerOptions {
  transport: DeviceTransport;
  deviceStore?: DeviceIdentityStore;
  onFailureCleanup?: (reason: DeviceFailureReason) => Promise<void> | void;
}

export function createDeviceSessionController(options: CreateDeviceSessionControllerOptions): DeviceSessionController {
  const deviceStore = options.deviceStore ?? createDeviceIdentityStore();

  async function resolveDeviceId(): Promise<string> {
    return deviceStore.ensure();
  }

  return {
    async ensureRegistered(state) {
      const deviceId = await resolveDeviceId();
      await options.transport.register({
        accessToken: state.accessToken,
        deviceId,
        syncVersion: state.syncVersion
      });
      return deviceId;
    },
    async heartbeat(state) {
      const deviceId = await resolveDeviceId();
      await options.transport.heartbeat({
        accessToken: state.accessToken,
        deviceId,
        syncVersion: state.syncVersion
      });
      return deviceId;
    },
    async buildContext(state) {
      const deviceId = await resolveDeviceId();
      return {
        accessToken: state.accessToken,
        deviceId,
        syncVersion: state.syncVersion
      };
    },
    async handleDeviceFailure(reason) {
      await deviceStore.clear();
      await options.onFailureCleanup?.(reason);
    }
  };
}
