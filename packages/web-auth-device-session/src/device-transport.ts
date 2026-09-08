export type DeviceFailureReason = "unknown_device" | "device_revoked";

export class DeviceTransportError extends Error {
  reason?: DeviceFailureReason;
  status: number;

  constructor(message: string, status: number, reason?: DeviceFailureReason) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

export interface DeviceTransportRequest {
  accessToken: string;
  deviceId: string;
  syncVersion: string;
}

export interface DeviceTransport {
  register(input: DeviceTransportRequest): Promise<void>;
  heartbeat(input: DeviceTransportRequest): Promise<void>;
}

export interface CreateRestRpcDeviceTransportOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  endpointPrefix?: string;
}

const JSON_HEADERS = {
  "Content-Type": "application/json"
};

async function parseReason(response: Response): Promise<DeviceFailureReason | undefined> {
  if (response.status === 401) {
    return "unknown_device";
  }

  if (response.status !== 403) {
    return undefined;
  }

  try {
    const body = (await response.clone().json()) as { code?: string; error?: string; message?: string };
    if (body.code === "device_revoked" || body.error === "device_revoked") {
      return "device_revoked";
    }

    const text = body.message ?? "";
    if (text.includes("device_revoked")) {
      return "device_revoked";
    }
  } catch {
    // ignore JSON parse failures, fallback to status-only semantics.
  }

  return undefined;
}

async function callRpc(
  baseUrl: string,
  endpointPrefix: string,
  method: string,
  payload: DeviceTransportRequest,
  fetchImpl: typeof fetch
): Promise<void> {
  const response = await fetchImpl(`${baseUrl}${endpointPrefix}/${method}`, {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${payload.accessToken}`,
      "X-Device-Id": payload.deviceId,
      "X-Sync-Version": payload.syncVersion
    },
    body: JSON.stringify({ device_id: payload.deviceId })
  });

  if (response.ok) {
    return;
  }

  const reason = await parseReason(response);
  throw new DeviceTransportError(`device_${method}_failed`, response.status, reason);
}

export function createRestRpcDeviceTransport(options: CreateRestRpcDeviceTransportOptions): DeviceTransport {
  const fetchImpl = options.fetchImpl ?? fetch;
  const endpointPrefix = options.endpointPrefix ?? "/rest/v1/rpc";

  return {
    register(input) {
      return callRpc(options.baseUrl, endpointPrefix, "device_register", input, fetchImpl);
    },
    heartbeat(input) {
      return callRpc(options.baseUrl, endpointPrefix, "device_heartbeat", input, fetchImpl);
    }
  };
}
