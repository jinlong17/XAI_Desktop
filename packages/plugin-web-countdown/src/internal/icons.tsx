import React from "react";
import type { CountdownIconId } from "../types.js";

interface IconProps {
  readonly name: CountdownIconId | "plus" | "dots" | "edit" | "trash" | "copy" | "eye" | "eyeOff" | "restore" | "check" | "chevL" | "chevR" | "grip";
  readonly size?: number;
  readonly className?: string;
}

export function IconGlyph({ name, size = 16, className }: IconProps) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "calendar":
      return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
    case "gift":
      return <svg {...common}><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7M3 8h18v4H3zM12 8v13M12 8H8.5A2.5 2.5 0 1 1 12 4.5V8ZM12 8h3.5A2.5 2.5 0 1 0 12 4.5V8Z" /></svg>;
    case "spark":
      return <svg {...common}><path d="M12 3l1.8 5.1L19 10l-5.2 1.9L12 17l-1.8-5.1L5 10l5.2-1.9L12 3ZM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16Z" /></svg>;
    case "flag":
      return <svg {...common}><path d="M6 21V4M6 5h11l-1.5 4L17 13H6" /></svg>;
    case "moon":
      return <svg {...common}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a7 7 0 1 0 11.5 11.5Z" /></svg>;
    case "ring":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 8 8" /></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>;
    case "pin":
      return <svg {...common}><path d="M14.5 4.5l5 5-2.2 2.2-1.6-.5-4.5 4.5.5 2.1-1.1 1.1-5.5-5.5 1.1-1.1 2.1.5 4.5-4.5-.5-1.6 2.2-2.2Z" /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "dots":
      return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
    case "edit":
      return <svg {...common}><path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="M13.5 6.5l4 4" /></svg>;
    case "trash":
      return <svg {...common}><path d="M5 7h14M9 7V5h6v2M8 10v9M12 10v9M16 10v9M7 7l1 14h8l1-14" /></svg>;
    case "copy":
      return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" /></svg>;
    case "eye":
      return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "eyeOff":
      return <svg {...common}><path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 15.4 15.4M7.2 7.5C4.3 9.2 2.5 12 2.5 12s3.5 6 9.5 6c1.7 0 3.2-.5 4.5-1.2M12 6c6 0 9.5 6 9.5 6a16.4 16.4 0 0 1-2.8 3.4" /></svg>;
    case "restore":
      return <svg {...common}><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5" /><path d="M12 8v5l3 2" /></svg>;
    case "check":
      return <svg {...common}><path d="M20 6L9 17l-5-5" /></svg>;
    case "chevL":
      return <svg {...common}><path d="M15 18l-6-6 6-6" /></svg>;
    case "chevR":
      return <svg {...common}><path d="M9 18l6-6-6-6" /></svg>;
    case "grip":
      return <svg {...common}><path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" /></svg>;
    default:
      return null;
  }
}
