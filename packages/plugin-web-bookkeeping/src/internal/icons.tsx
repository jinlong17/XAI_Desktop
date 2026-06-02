import type { CSSProperties, ReactNode } from "react";

interface IconProps {
  readonly name: string;
  readonly size?: number;
  readonly style?: CSSProperties;
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

const PATHS: Record<string, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  trash: <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />,
  edit: <><path d="M4 20h4l11-11a2.5 2.5 0 0 0-4-4L4 16v4z" /><path d="M13.5 5.5l3 3" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
  download: <><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>,
  wallet: <><path d="M4 7h16v14H4z" /><path d="M4 7l3-4h13v4" /><path d="M16 14h.01" /></>,
  bank: <><path d="M3 9l9-5 9 5" /><path d="M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  creditcard: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 15h2" /></>,
  money: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 9v.01M18 15v.01" /></>,
  coin: <><circle cx="12" cy="12" r="8" /><path d="M12 7v10M9 9.5c.7-.8 4-.8 4.7.2.8 1.2-.2 2.2-1.9 2.4-2 .3-3 .9-2.5 2 .5 1.2 3.8 1.1 4.7.1" /></>,
  chat: <><path d="M4 5h16v11H8l-4 4V5z" /><path d="M8 9h8M8 13h5" /></>,
  utensils: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10" /><path d="M16 3v18M16 3c3 2 4 5 4 8h-4" /></>,
  cart: <><path d="M4 5h2l2 11h11l2-8H8" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
  bus: <><rect x="5" y="4" width="14" height="14" rx="2" /><path d="M7 9h10M8 18v2M16 18v2" /><circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" /></>,
  car: <><path d="M5 16h14l-1.5-5h-11L5 16z" /><path d="M7 16v2M17 16v2" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /></>,
  bed: <><path d="M4 11V5M20 19v-6a3 3 0 0 0-3-3H4v9M4 15h16" /></>,
  ticket: <><path d="M5 7h14v4a2 2 0 0 0 0 4v2H5v-2a2 2 0 0 0 0-4V7z" /><path d="M10 9v6" /></>,
  phonecall: <><path d="M7 4l3 3-2 2c1 2 3 4 5 5l2-2 3 3-2 3c-7-1-12-6-13-13l3-2z" /></>,
  bag: <><path d="M6 8h12l-1 13H7L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  droplet: <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></>,
  gamepad: <><path d="M8 14h.01M16 14h.01M10 12H6M8 10v4" /><path d="M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5.2 2L15 16H9l-1.8 1A3 3 0 0 1 2 15v-3a4 4 0 0 1 4-4z" /></>,
  pill: <><path d="M10 21a5 5 0 0 1-7-7l7-7a5 5 0 0 1 7 7l-7 7z" /><path d="M8 8l8 8" /></>,
  wine: <><path d="M8 3h8l-1 8a4 4 0 0 1-6 0L8 3z" /><path d="M12 13v7M9 20h6" /></>,
  gift: <><path d="M4 9h16v12H4zM4 9h16M12 9v12M7 5c0-2 4-2 5 4M17 5c0-2-4-2-5 4" /></>,
  graduation: <><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M7 11v5c3 2 7 2 10 0v-5" /></>,
  trendUp: <><path d="M4 17l6-6 4 4 6-8" /><path d="M14 7h6v6" /></>,
  trendDown: <><path d="M4 7l6 6 4-4 6 8" /><path d="M14 17h6v-6" /></>,
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  heart: <><path d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-2 4 4 0 0 1 7 2z" /></>,
  tag: <><path d="M4 4h8l8 8-8 8-8-8V4z" /><path d="M8 8h.01" /></>,
  smile: <><circle cx="12" cy="12" r="8" /><path d="M9 10h.01M15 10h.01M8.5 14c1.5 2 5.5 2 7 0" /></>,
  paw: <><circle cx="7" cy="10" r="2" /><circle cx="12" cy="7" r="2" /><circle cx="17" cy="10" r="2" /><path d="M8 19c0-3 2-5 4-5s4 2 4 5c0 1.3-.9 2-2 2s-1.4-.5-2-.5-1 .5-2 .5-2-.7-2-2z" /></>,
  suitcase: <><rect x="4" y="7" width="16" height="14" rx="2" /><path d="M9 7V5h6v2M4 12h16" /></>,
  globe: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2 2 3 5 3 8s-1 6-3 8M12 4c-2 2-3 5-3 8s1 6 3 8" /></>,
  plane: <><path d="M3 12l19-8-8 19-3-8-8-3z" /><path d="M11 15l4-4" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></>,
  swap: <><path d="M7 7h12l-3-3M19 7l-3 3" /><path d="M17 17H5l3 3M5 17l3-3" /></>,
  repeat: <><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
  grid4: <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>,
  layout: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 10v10" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  chart: <><path d="M4 19V5M4 19h17" /><path d="M8 15l3-5 3 3 5-8" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></>,
  sparkle: <><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" /></>,
  check2: <path d="M5 13l4 4L19 7" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  bell: <><path d="M6 16v-5a6 6 0 0 1 12 0v5l2 3H4l2-3z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  doc: <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  arrowL: <path d="M19 12H5M12 5l-7 7 7 7" />,
  arrowR: <path d="M5 12h14M12 5l7 7-7 7" />,
  chevL: <path d="m15 18-6-6 6-6" />,
  chevR: <path d="m9 18 6-6-6-6" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  grip: <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" />,
};

export function Icon({ name, size = 16, style }: IconProps) {
  return (
    <svg {...base(size)} style={style}>
      {PATHS[name] ?? PATHS.wallet}
    </svg>
  );
}

export const ICON_OPTIONS = [
  "utensils",
  "coffee",
  "wine",
  "cart",
  "bag",
  "gift",
  "bus",
  "car",
  "plane",
  "suitcase",
  "bed",
  "home",
  "droplet",
  "pill",
  "heart",
  "graduation",
  "gamepad",
  "ticket",
  "phonecall",
  "paw",
  "smile",
  "wallet",
  "coin",
  "money",
  "card",
  "bank",
  "creditcard",
  "trendUp",
  "swap",
  "repeat",
  "calendar",
  "clock",
  "tag",
  "briefcase",
] as const;

export const HUE_OPTIONS = [25, 45, 70, 110, 150, 175, 195, 220, 245, 262, 290, 310, 330, 350, 0] as const;
