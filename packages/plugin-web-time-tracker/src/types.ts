import type { Lang } from "@repo/plugin-web-tokens";

export type { Lang };

export type TimeTrackerMode = "single" | "multi";

export interface LocalizedText {
  readonly en: string;
  readonly zh: string;
}

export interface TimeTrackerSubcategory {
  readonly id: string;
  readonly name: LocalizedText;
  readonly color?: string;
  readonly icon?: string;
}

export interface TimeTrackerCategory {
  readonly id: string;
  readonly name: LocalizedText;
  readonly color: string;
  readonly icon: string;
  readonly goalMin: number;
  readonly subs: readonly TimeTrackerSubcategory[];
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly deleted?: boolean;
}

export interface TimeTrackerSegment {
  readonly start: number;
  readonly end: number | null;
}

export interface TimeTrackerEntry {
  readonly id: string;
  readonly categoryId: string;
  readonly subId: string | null;
  readonly segments: readonly TimeTrackerSegment[];
  readonly note: LocalizedText;
  readonly done: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly deleted?: boolean;
}

export interface TimeTrackerSnapshot {
  readonly todayTotalMs: number;
  readonly weekTotalMs: number;
  readonly runningCount: number;
  readonly activeTotalMs: number;
  readonly entriesToday: number;
  readonly topCategoryName: LocalizedText | null;
}
