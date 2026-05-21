import { createHash } from 'node:crypto';

export type AuditEventType =
  | 'push'
  | 'pull'
  | 'conflict'
  | 'rekey_start'
  | 'rekey_complete'
  | 'device_revoke'
  | 'account_delete'
  | 'quota_exceeded'
  | 'rate_limited';

export interface AuditLogEntry {
  sequence: number;
  accountId: string;
  eventType: AuditEventType;
  timestampMs: number;
  previousHash: string | null;
  hash: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface PrivacySafeTelemetryEvent {
  eventType: AuditEventType;
  timestampMs: number;
}

export class AuditLogIntegrityError extends Error {
  readonly code = 'E3025';

  constructor(message: string) {
    super(`E3025: ${message}`);
    this.name = 'AuditLogIntegrityError';
  }
}

export class AuditLogHashChain {
  private readonly entries: AuditLogEntry[] = [];

  append(input: {
    accountId: string;
    eventType: AuditEventType;
    timestampMs: number;
    metadata?: Record<string, string | number | boolean | null>;
  }): AuditLogEntry {
    const previous = this.entries.at(-1);
    const sequence = this.entries.length + 1;
    const previousHash = previous?.hash ?? null;
    const hash = hashEntry({
      sequence,
      accountId: input.accountId,
      eventType: input.eventType,
      timestampMs: input.timestampMs,
      previousHash,
      metadata: input.metadata,
    });
    const entry: AuditLogEntry = {
      sequence,
      accountId: input.accountId,
      eventType: input.eventType,
      timestampMs: input.timestampMs,
      previousHash,
      hash,
      metadata: input.metadata ? { ...input.metadata } : undefined,
    };
    this.entries.push(entry);
    return { ...entry };
  }

  list(): AuditLogEntry[] {
    return this.entries.map((entry) => ({ ...entry, metadata: entry.metadata ? { ...entry.metadata } : undefined }));
  }

  verify(entries: readonly AuditLogEntry[] = this.entries): void {
    let previousHash: string | null = null;
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index]!;
      if (entry.sequence !== index + 1) {
        throw new AuditLogIntegrityError('audit sequence gap detected');
      }
      if (entry.previousHash !== previousHash) {
        throw new AuditLogIntegrityError('audit previous_hash mismatch');
      }
      const expected = hashEntry(entry);
      if (entry.hash !== expected) {
        throw new AuditLogIntegrityError('audit hash mismatch');
      }
      previousHash = entry.hash;
    }
  }

  telemetry(): PrivacySafeTelemetryEvent[] {
    return this.entries.map((entry) => ({
      eventType: entry.eventType,
      timestampMs: entry.timestampMs,
    }));
  }
}

export function createSentryBreadcrumb(entry: AuditLogEntry): PrivacySafeTelemetryEvent {
  return {
    eventType: entry.eventType,
    timestampMs: entry.timestampMs,
  };
}

export function withAuditErrorBoundary<T>(fn: () => T, onError: (event: PrivacySafeTelemetryEvent) => void): T | null {
  try {
    return fn();
  } catch {
    onError({ eventType: 'conflict', timestampMs: Date.now() });
    return null;
  }
}

function hashEntry(input: {
  sequence: number;
  accountId: string;
  eventType: AuditEventType;
  timestampMs: number;
  previousHash: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}): string {
  return createHash('sha256')
    .update(canonicalJson({
      sequence: input.sequence,
      accountId: input.accountId,
      eventType: input.eventType,
      timestampMs: input.timestampMs,
      previousHash: input.previousHash,
      metadata: input.metadata ?? {},
    }))
    .digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
    .join(',')}}`;
}
