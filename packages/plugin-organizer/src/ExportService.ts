import { assertRepoRecord, type RepoRecord } from "@repo/core-data";

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ExportSource<T extends RepoRecord> {
  entityType: string;
  adapter: DataAdapter<T>;
}

export interface ExportBundle {
  format: "xai.desktop.bundle.v1";
  exportedAt: string;
  encrypted: true;
  payload: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export class ExportImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportImportError";
  }
}

export async function exportEntities(sources: readonly ExportSource<RepoRecord>[], passphrase: string): Promise<ExportBundle> {
  const records = (await Promise.all(sources.map((source) => source.adapter.getAll()))).flat();
  return {
    format: "xai.desktop.bundle.v1",
    exportedAt: new Date().toISOString(),
    encrypted: true,
    payload: await encryptJson({ records }, passphrase),
  };
}

/**
 * Import an encrypted export bundle.
 *
 * Each decoded record passes through `assertRepoRecord` before being
 * written to its plugin's adapter. AES-GCM auth tag guarantees
 * cryptographic integrity, but a valid-passphrase payload with a
 * tampered shape (e.g. missing `entityType`) would otherwise corrupt
 * the repo. Records with unknown `entityType` are silently skipped
 * (no matching adapter); records that fail shape validation are
 * collected in `errors` and the caller must surface them.
 */
export async function importEntities(
  bundle: ExportBundle,
  sources: readonly ExportSource<RepoRecord>[],
  passphrase: string,
): Promise<ImportResult> {
  const decoded = await decryptJson<{ records: unknown }>(bundle.payload, passphrase);
  if (!decoded || !Array.isArray(decoded.records)) {
    throw new ExportImportError("Invalid bundle payload: records is not an array");
  }

  const byEntityType = new Map(sources.map((source) => [source.entityType, source.adapter] as const));
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const raw of decoded.records) {
    try {
      assertRepoRecord(raw as RepoRecord);
    } catch (error) {
      errors.push(`record rejected: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const record = raw as RepoRecord;
    const adapter = byEntityType.get(record.entityType);
    if (!adapter) {
      skipped += 1;
      continue;
    }

    await adapter.save(record);
    imported += 1;
  }

  return { imported, skipped, errors };
}

async function encryptJson(value: unknown, passphrase: string): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const key = await deriveKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${base64(iv)}.${base64(new Uint8Array(encrypted))}`;
}

async function decryptJson<T>(payload: string, passphrase: string): Promise<T> {
  const [ivPart, dataPart] = payload.split(".");
  if (!ivPart || !dataPart) throw new Error("Invalid export bundle payload");
  const key = await deriveKey(passphrase);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(fromBase64(ivPart)) }, key, toArrayBuffer(fromBase64(dataPart)));
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new TextEncoder().encode("xai-desktop-export-v1"), iterations: 100_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function base64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function toArrayBuffer(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}
