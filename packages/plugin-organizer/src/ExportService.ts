import type { RepoRecord } from "@repo/core-data";

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

export async function exportEntities(sources: readonly ExportSource<RepoRecord>[], passphrase: string): Promise<ExportBundle> {
  const records = (await Promise.all(sources.map((source) => source.adapter.getAll()))).flat();
  return {
    format: "xai.desktop.bundle.v1",
    exportedAt: new Date().toISOString(),
    encrypted: true,
    payload: await encryptJson({ records }, passphrase),
  };
}

export async function importEntities(bundle: ExportBundle, sources: readonly ExportSource<RepoRecord>[], passphrase: string): Promise<number> {
  const decoded = await decryptJson<{ records: RepoRecord[] }>(bundle.payload, passphrase);
  const byEntityType = new Map(sources.map((source) => [source.entityType, source.adapter] as const));
  let count = 0;
  for (const record of decoded.records) {
    const adapter = byEntityType.get(record.entityType);
    if (!adapter) continue;
    await adapter.save(record);
    count += 1;
  }
  return count;
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
