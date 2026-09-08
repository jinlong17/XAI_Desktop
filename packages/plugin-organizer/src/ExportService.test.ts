import type { RepoRecord } from "@repo/core-data";
import { describe, expect, it } from "vitest";

import {
  ExportImportError,
  exportEntities,
  importEntities,
  type DataAdapter,
  type ExportBundle,
  type ExportSource,
} from "./ExportService";

class MemoryAdapter<T extends RepoRecord> implements DataAdapter<T> {
  private readonly records = new Map<string, T>();

  async getAll(): Promise<T[]> {
    return [...this.records.values()];
  }

  async getById(id: string): Promise<T | null> {
    return this.records.get(id) ?? null;
  }

  async save(item: T): Promise<void> {
    this.records.set(item.id, item);
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }
}

const PASSPHRASE = "correct horse battery staple";

function sampleRecord(overrides: Partial<RepoRecord> = {}): RepoRecord {
  return {
    id: "todo-1",
    entityType: "productivity.todo",
    schemaVersion: 1,
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
    syncScope: "account-sync",
    ...overrides,
  };
}

async function encryptBundleRecords(records: unknown, passphrase: string): Promise<ExportBundle> {
  const encoded = new TextEncoder().encode(JSON.stringify({ records }));
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("xai-desktop-export-v1"),
      iterations: 100_000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  return {
    format: "xai.desktop.bundle.v1",
    exportedAt: "2026-05-20T00:00:00.000Z",
    encrypted: true,
    payload: `${toBase64(iv)}.${toBase64(new Uint8Array(encrypted))}`,
  };
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

describe("ExportService", () => {
  it("imports a valid exported record", async () => {
    const exportAdapter = new MemoryAdapter<RepoRecord>();
    const importAdapter = new MemoryAdapter<RepoRecord>();
    const record = sampleRecord();
    await exportAdapter.save(record);

    const sources: readonly ExportSource<RepoRecord>[] = [
      { entityType: "productivity.todo", adapter: exportAdapter },
    ];
    const bundle = await exportEntities(sources, PASSPHRASE);

    const result = await importEntities(
      bundle,
      [{ entityType: "productivity.todo", adapter: importAdapter }],
      PASSPHRASE,
    );

    expect(result).toEqual({ imported: 1, skipped: 0, errors: [] });
    await expect(importAdapter.getAll()).resolves.toEqual([record]);
  });

  it("rejects records with invalid shape before save", async () => {
    const adapter = new MemoryAdapter<RepoRecord>();
    const bundle = await encryptBundleRecords(
      [
        {
          id: "todo-1",
          schemaVersion: 1,
          createdAt: "2026-05-20T00:00:00.000Z",
          updatedAt: "2026-05-20T00:00:00.000Z",
          syncScope: "account-sync",
        },
      ],
      PASSPHRASE,
    );

    const result = await importEntities(
      bundle,
      [{ entityType: "productivity.todo", adapter }],
      PASSPHRASE,
    );

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("missing entityType");
    await expect(adapter.getAll()).resolves.toEqual([]);
  });

  it("skips valid records when no adapter matches entityType", async () => {
    const adapter = new MemoryAdapter<RepoRecord>();
    const bundle = await encryptBundleRecords(
      [sampleRecord({ entityType: "unknown.entity" })],
      PASSPHRASE,
    );

    const result = await importEntities(
      bundle,
      [{ entityType: "productivity.todo", adapter }],
      PASSPHRASE,
    );

    expect(result).toEqual({ imported: 0, skipped: 1, errors: [] });
    await expect(adapter.getAll()).resolves.toEqual([]);
  });

  it("throws when the passphrase is wrong", async () => {
    const adapter = new MemoryAdapter<RepoRecord>();
    const bundle = await encryptBundleRecords([sampleRecord()], PASSPHRASE);

    await expect(
      importEntities(
        bundle,
        [{ entityType: "productivity.todo", adapter }],
        "wrong passphrase",
      ),
    ).rejects.toThrow();
  });

  it("throws ExportImportError when the payload shape is invalid", async () => {
    const adapter = new MemoryAdapter<RepoRecord>();
    const bundle = await encryptBundleRecords({ nope: [] }, PASSPHRASE);

    await expect(
      importEntities(
        bundle,
        [{ entityType: "productivity.todo", adapter }],
        PASSPHRASE,
      ),
    ).rejects.toThrow(ExportImportError);
  });
});
