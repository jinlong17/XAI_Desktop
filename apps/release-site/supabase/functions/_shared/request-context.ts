export interface SyncRequestContext {
  accountId?: string;
  deviceId?: string;
}

export function resolveSyncRequestContext(
  request: Request,
  context: SyncRequestContext = {},
): SyncRequestContext {
  return {
    accountId:
      context.accountId ??
      readJwtSubject(request.headers.get('authorization')) ??
      request.headers.get('x-account-id') ??
      undefined,
    deviceId:
      context.deviceId ??
      request.headers.get('x-device-id') ??
      undefined,
  };
}

function readJwtSubject(authorization: string | null): string | undefined {
  const prefix = 'Bearer ';
  if (!authorization?.startsWith(prefix)) {
    return undefined;
  }

  const token = authorization.slice(prefix.length);
  const payload = token.split('.')[1];
  if (!payload) {
    return undefined;
  }

  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as { sub?: unknown };
    return typeof decoded.sub === 'string' && decoded.sub.length > 0
      ? decoded.sub
      : undefined;
  } catch {
    return undefined;
  }
}

function decodeBase64Url(input: string): string {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  return globalThis.atob(padded);
}
