import type { ReactNode } from "react";

interface IconProps {
  readonly name: string;
  readonly size?: number;
}

const PATHS: Record<string, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M4 20h4l11-11a2.5 2.5 0 0 0-4-4L4 16v4z" /><path d="M13.5 5.5l3 3" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></>,
  chart: <><path d="M4 19V5M4 19h17" /><path d="M8 15l3-5 3 3 5-8" /></>,
  heart: <><path d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-2 4 4 0 0 1 7 2z" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  download: <><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>,
  share: <><path d="M16 8l-8 4 8 4" /><circle cx="18" cy="7" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="17" r="3" /></>,
  droplet: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  moon: <path d="M20 14a8 8 0 1 1-9-11 6 6 0 0 0 9 11z" />,
  activity: <path d="M4 13h4l2-6 4 12 2-6h4" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
};

export function Icon({ name, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name] ?? PATHS.target}
    </svg>
  );
}
