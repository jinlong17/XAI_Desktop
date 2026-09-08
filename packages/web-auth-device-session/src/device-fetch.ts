import type { DeviceFailureReason } from "./device-transport";

export class DeviceAuthError extends Error {
  reason: DeviceFailureReason;

  constructor(reason: DeviceFailureReason) {
    super(reason === "device_revoked" ? "device_revoked" : "unknown_device");
    this.reason = reason;
  }
}

export interface DeviceBoundContext {
  accessToken: string;
  deviceId: string;
  syncVersion: string;
}

export interface CreateDeviceBoundFetchOptions {
  getContext(): Promise<DeviceBoundContext>;
  fetchImpl?: typeof fetch;
  onDeviceAuthFailure?: (reason: DeviceFailureReason) => Promise<void> | void;
}

async function parseFailureReason(response: Response): Promise<DeviceFailureReason | null> {
  if (response.status === 401) {
    return "unknown_device";
  }

  if (response.status !== 403) {
    return null;
  }

  try {
    const body = (await response.clone().json()) as { code?: string; error?: string; message?: string };
    if (body.code === "device_revoked" || body.error === "device_revoked") {
      return "device_revoked";
    }

    if ((body.message ?? "").includes("device_revoked")) {
      return "device_revoked";
    }
  } catch {
    // no-op
  }

  return null;
}

export function createDeviceBoundFetch(options: CreateDeviceBoundFetchOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;

  return async function deviceBoundFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const context = await options.getContext();

    const headers = new Headers(init.headers ?? {});
    headers.set("Authorization", `Bearer ${context.accessToken}`);
    headers.set("X-Device-Id", context.deviceId);
    headers.set("X-Sync-Version", context.syncVersion);

    const response = await fetchImpl(input, {
      ...init,
      headers
    });

    const failure = await parseFailureReason(response);
    if (failure) {
      await options.onDeviceAuthFailure?.(failure);
      throw new DeviceAuthError(failure);
    }

    return response;
  };
}
