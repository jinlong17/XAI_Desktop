import type { DataAdapter } from "../types";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export class LocalStorageAdapter<T extends { id: string }> implements DataAdapter<T> {
  constructor(private readonly storageKey: string, private readonly seed: T[] = []) {}

  async getAll(): Promise<T[]> {
    if (!canUseStorage()) return [...this.seed];
    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      await this.writeAll(this.seed);
      return [...this.seed];
    }
    try {
      const parsed = JSON.parse(raw) as T[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) ?? null;
  }

  async save(item: T): Promise<void> {
    const items = await this.getAll();
    const next = items.some((current) => current.id === item.id)
      ? items.map((current) => (current.id === item.id ? item : current))
      : [...items, item];
    await this.writeAll(next);
  }

  async delete(id: string): Promise<void> {
    const items = await this.getAll();
    await this.writeAll(items.filter((item) => item.id !== id));
  }

  private async writeAll(items: T[]): Promise<void> {
    if (!canUseStorage()) return;
    window.localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
