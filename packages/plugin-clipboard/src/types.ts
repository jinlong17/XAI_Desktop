export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export type ClipboardEntryType = "text" | "url" | "code" | "image" | "file";

export interface ClipboardEntry {
  id: string;
  content: string;
  type: ClipboardEntryType;
  source?: string;
  pinned: boolean;
  createdAt: string;
}

export interface ClipboardDraft {
  content: string;
  type?: ClipboardEntryType;
  source?: string;
  pinned?: boolean;
}

export interface ClipboardPrivacySettings {
  redactEnabled: boolean;
  redactPatterns: string[];
  autoClearMinutes: number | null;
}

export interface OcrTextBlock {
  id: string;
  text: string;
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OcrResult {
  entryId: string;
  status: "idle" | "processing" | "ready" | "failed";
  text: string;
  confidence: number;
  blocks: OcrTextBlock[];
  engine: "mock" | "macos-vision" | "ai";
}

export type PasteQueueStatus = "idle" | "running" | "paused" | "completed";

export interface PasteQueueState {
  entryIds: string[];
  currentIndex: number;
  status: PasteQueueStatus;
  completedIds: string[];
}
