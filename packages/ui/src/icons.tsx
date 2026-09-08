import { SVGProps } from "react";

type IconNode = ReadonlyArray<{
  d: string;
}>;

function defineIconRegistry<T extends Record<string, IconNode>>(registry: T) {
  return registry;
}

export const desktopIconRegistry = defineIconRegistry({
  file: [{ d: "M8 2h5l5 5v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2" }],
  folder: [{ d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7" }],
  image: [
    { d: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2" },
    { d: "m7 15 3-3 2 2 4-4 3 5" },
    { d: "M8 9h.01" },
  ],
  video: [
    { d: "M4 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2" },
    { d: "m18 10 4-2v8l-4-2" },
  ],
  audio: [
    { d: "M11 5v14" },
    { d: "M7 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3l5 4V5z" },
    { d: "M16 9a4 4 0 0 1 0 6" },
    { d: "M18 7a7 7 0 0 1 0 10" },
  ],
  archive: [
    { d: "M4 4h16v4H4z" },
    { d: "M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" },
    { d: "M10 12h4" },
  ],
  link: [{ d: "m10 13 4-4" }, { d: "M8 8 5 11a3 3 0 1 0 4 4l3-3" }, { d: "m16 16 3-3a3 3 0 0 0-4-4l-3 3" }],
  task: [{ d: "M9 11l2 2 4-4" }, { d: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1" }],
  grid: [
    { d: "M4 4h7v7H4z" },
    { d: "M13 4h7v7h-7z" },
    { d: "M4 13h7v7H4z" },
    { d: "M13 13h7v7h-7z" },
  ],
  list: [{ d: "M8 6h13" }, { d: "M8 12h13" }, { d: "M8 18h13" }, { d: "M3 6h.01" }, { d: "M3 12h.01" }, { d: "M3 18h.01" }],
  lock: [{ d: "M7 11V8a5 5 0 0 1 10 0v3" }, { d: "M5 11h14v10H5z" }],
  unlock: [{ d: "M17 11V8a5 5 0 0 0-9-3" }, { d: "M5 11h14v10H5z" }],
  chevronDown: [{ d: "m6 9 6 6 6-6" }],
  chevronUp: [{ d: "m6 15 6-6 6 6" }],
  more: [{ d: "M5 12h.01" }, { d: "M12 12h.01" }, { d: "M19 12h.01" }],
  settings: [{ d: "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" }, { d: "M19.4 15a7.8 7.8 0 0 0 .1-1l2-1.2-2-3.4-2.3.5a8.5 8.5 0 0 0-.9-.5L14.8 7h-5.6l-.5 2.4a8.5 8.5 0 0 0-.9.5l-2.3-.5-2 3.4L5.6 14a7.8 7.8 0 0 0 .1 1l-2.1 1.2 2 3.4 2.3-.5c.3.2.6.3.9.5l.5 2.4h5.6l.5-2.4c.3-.1.6-.3.9-.5l2.3.5 2-3.4z" }],
});

export type DesktopIconName = keyof typeof desktopIconRegistry;

export const iconAliasMap = {
  "📁": "folder",
  folder: "folder",
  directory: "folder",
  "📄": "file",
  file: "file",
  document: "file",
  "🖼️": "image",
  image: "image",
  picture: "image",
  "🎬": "video",
  video: "video",
  movie: "video",
  "🎵": "audio",
  audio: "audio",
  music: "audio",
  "🗜️": "archive",
  archive: "archive",
  zip: "archive",
  "🔗": "link",
  link: "link",
  shortcut: "link",
  task: "task",
  todo: "task",
  grid: "grid",
  list: "list",
  lock: "lock",
  unlock: "unlock",
  expand: "chevronDown",
  collapse: "chevronUp",
  more: "more",
  settings: "settings",
} as const satisfies Record<string, DesktopIconName>;

export type DesktopIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: DesktopIconName;
  size?: number;
};

export function DesktopIcon({ name, size = 16, strokeWidth = 1.8, ...props }: DesktopIconProps) {
  const paths = desktopIconRegistry[name];

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {paths.map((path, index) => (
        <path key={`${name}-${index}`} d={path.d} />
      ))}
    </svg>
  );
}
