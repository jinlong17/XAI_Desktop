/**
 * Inline SVG icon component for @repo/xai-web-shell.
 *
 * Ported from web design/icons.jsx — subset used by the shell components.
 * All icons use 1.6px stroke, round cap/join, viewBox 0 0 24 24.
 *
 * To add icons: extend WebShellIconName in types.ts and add paths here.
 */

import type { WebShellIconName } from "./types.js";

interface IconProps {
  name: WebShellIconName;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const PATHS: Record<WebShellIconName, React.ReactNode> = {
  // Rail nav icons
  sparkle:   <><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M6 18l4-4" /></>,
  check:     <><path d="M9 11.5l2 2 4-4.5" /><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /></>,
  kanban:    <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M8 7v6M12 7v10M16 7v4" /></>,
  layout:    <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M3.5 9.5h17M10 9.5V20" /></>,
  calendar:  <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  grid4:     <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  timer:     <><circle cx="12" cy="13" r="7.5" /><path d="M12 13V8.5M9.5 3.5h5" /></>,
  wallet:    <><path d="M4 7h16v13H4z" /><path d="M4 7l3-3h13v3" /><path d="M16.5 13.5h.01" /></>,
  pin:       <><path d="M12 21v-6.5" /><path d="M8 9V4h8v5l3 4.5H5L8 9z" /></>,
  leaf:      <><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" /><path d="M5 19c4-4 8-8 14-14" /></>,
  countdown: <><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><path d="M4 9h16M9 13l2 2 4-4" /></>,
  search:    <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  chart:     <><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" /></>,
  sliders:   <><path d="M4 7h12M4 12h7M4 17h14" /><circle cx="18" cy="7" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="19" cy="17" r="2" /></>,
  // Rail-bottom icons
  paw:       <><circle cx="6.5" cy="10" r="2"/><circle cx="11" cy="6.5" r="2"/><circle cx="15.5" cy="6.5" r="2"/><circle cx="20" cy="10" r="2"/><path d="M9 19c0-3 1.5-5 4-5s4 2 4 5c0 1.5-1 2.5-2 2.5-1 0-1.5-.5-2-.5s-1 .5-2 .5c-1 0-2-1-2-2.5z"/></>,
  sync:      <><path d="M4 11a7 7 0 0 1 12-4.9L19 9" /><path d="M19 5v4h-4" /><path d="M20 13a7 7 0 0 1-12 4.9L5 15" /><path d="M5 19v-4h4" /></>,
  bell:      <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  help:      <><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8v.5M12 17.5v.01" /></>,
  // Topbar icons
  sun:       <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
  moon:      <><path d="M20 14a8 8 0 1 1-9-11 6 6 0 0 0 9 11z" /></>,
  monitor:   <><rect x="3" y="4.5" width="18" height="13" rx="2" /><path d="M8 21h8M12 17.5V21" /></>,
  // AvatarMenu / misc icons
  star:      <><path d="M12 4l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8L7 20l1-5.8-4.3-4.1 5.9-.8L12 4z" /></>,
  download:  <><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></>,
};

export function Icon({ name, size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
