import { convertFileSrc } from "@tauri-apps/api/core";
import type { DesktopItem } from "./types";

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

const THUMBNAIL_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".heic",
  ".heif",
  ".bmp",
  ".tiff",
  ".pdf",
  ".mov",
  ".mp4",
  ".m4v",
  ".avi",
  ".mkv",
  ".webm",
]);

const thumbnailPromises = new Map<string, Promise<string | null>>();

function extension(path: string): string {
  const index = path.lastIndexOf(".");
  if (index < 0) return "";
  return path.slice(index).toLowerCase();
}

export function isThumbnailCandidate(item: DesktopItem): boolean {
  if (!item.filepath || !item.filepath.startsWith("/")) return false;
  if (item.type !== "file" && item.type !== "app") return false;
  return THUMBNAIL_EXTENSIONS.has(extension(item.filepath));
}

export async function getFileThumbnail(
  invoke: InvokeFn,
  path: string,
  maxSize: number = 256,
): Promise<string | null> {
  const key = `${path}:${maxSize}`;
  const cached = thumbnailPromises.get(key);
  if (cached) {
    return cached;
  }

  const promise = invoke<string | null>("generate_file_thumbnail", {
    input: { path, maxSize },
  })
    .then((thumbnailPath) => {
      if (!thumbnailPath) return null;
      try {
        return convertFileSrc(thumbnailPath);
      } catch {
        return thumbnailPath;
      }
    })
    .catch(() => null);

  thumbnailPromises.set(key, promise);
  return promise;
}

export function clearThumbnailCache(): void {
  thumbnailPromises.clear();
}
