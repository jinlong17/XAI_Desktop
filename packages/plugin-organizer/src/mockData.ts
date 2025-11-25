import { DesktopItem, DesktopItemType, GridBox } from "./types";

const SAMPLE_NAMES = [
  { filename: "Report.pdf", type: "file" as DesktopItemType },
  { filename: "Design.sketch", type: "file" as DesktopItemType },
  { filename: "Screenshots", type: "folder" as DesktopItemType },
  { filename: "Notes.txt", type: "file" as DesktopItemType },
  { filename: "Music.app", type: "app" as DesktopItemType },
  { filename: "Budget.xlsx", type: "file" as DesktopItemType },
];

const sampleIcon = "data:image/svg+xml;base64,";

export function generateMockItems(count = 5, desktopPath = "/Users/you/Desktop"): DesktopItem[] {
  const items: DesktopItem[] = [];
  for (let i = 0; i < count; i += 1) {
    const pick = SAMPLE_NAMES[i % SAMPLE_NAMES.length];
    items.push({
      id: `item-${
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(16).slice(2)
      }`,
      filename: pick.filename,
      filepath: `${desktopPath}/${pick.filename}`,
      type: pick.type,
      icon: sampleIcon,
      size: Math.floor(Math.random() * 10_000_000),
      createdAt: Date.now() - i * 1000 * 60 * 60,
    });
  }
  return items;
}

export function defaultGrid(id: string, x = 64, y = 120): GridBox {
  return {
    id,
    title: "New Box",
    rect: { x, y, width: 220, height: 220 },
    isLocked: false,
    isFolded: false,
    viewMode: "grid",
    itemIds: [],
  };
}
