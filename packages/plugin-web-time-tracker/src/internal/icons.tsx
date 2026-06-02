interface IconProps {
  readonly size?: number;
}

export type TimeTrackerIconName =
  | "alarm"
  | "book"
  | "briefcase"
  | "brain"
  | "calendar"
  | "chart"
  | "chartUp"
  | "check"
  | "chevD"
  | "chevL"
  | "chevR"
  | "clock"
  | "close"
  | "code"
  | "commute"
  | "coffee"
  | "course"
  | "design"
  | "development"
  | "dots"
  | "download"
  | "dumbbell"
  | "entertainment"
  | "edit"
  | "fitness"
  | "food"
  | "game"
  | "grid"
  | "grip"
  | "home"
  | "idea"
  | "leaf"
  | "life"
  | "list"
  | "meeting"
  | "music"
  | "pause"
  | "paper"
  | "pie"
  | "play"
  | "plus"
  | "reading"
  | "rest"
  | "search"
  | "shopping"
  | "sliders"
  | "stop"
  | "study"
  | "sun"
  | "sync"
  | "target"
  | "timer"
  | "trash"
  | "travel"
  | "writing"
  | "work";

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

export function IconTimer({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 13V8.5M9.5 3.5h5" />
    </svg>
  );
}

export function IconPlay({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <polygon points="8 5 19 12 8 19 8 5" />
    </svg>
  );
}

export function IconPause({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}

export function IconStop({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export function IconPlus({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconChart({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l3-4 3 2 4-7" />
    </svg>
  );
}

export function IconCategory({ kind, size = 16 }: IconProps & { readonly kind: string }) {
  if (kind === "work" || kind === "briefcase") {
    return (
      <svg {...base(size)}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5h6v2" />
      </svg>
    );
  }
  if (kind === "life" || kind === "home") {
    return (
      <svg {...base(size)}>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    );
  }
  if (kind === "rest" || kind === "leaf") {
    return (
      <svg {...base(size)}>
        <path d="M5 21c8-2 13-7 14-18C12 4 6 9 5 21z" />
        <path d="M5 21c3-5 7-8 12-10" />
      </svg>
    );
  }
  return (
    <svg {...base(size)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
    </svg>
  );
}

export function IconGlyph({ name, size = 16 }: IconProps & { readonly name: string }) {
  if (name === "play") return <IconPlay size={size} />;
  if (name === "pause") return <IconPause size={size} />;
  if (name === "stop" || name === "check") return <IconStop size={size} />;
  if (name === "plus") return <IconPlus size={size} />;
  if (name === "chart" || name === "chartUp") return <IconChart size={size} />;
  if (name === "timer" || name === "clock" || name === "alarm") return <IconTimer size={size} />;
  if (name === "search") {
    return (
      <svg {...base(size)}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg {...base(size)}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    );
  }
  if (name === "trash") {
    return (
      <svg {...base(size)}>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
      </svg>
    );
  }
  if (name === "download") {
    return (
      <svg {...base(size)}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    );
  }
  if (name === "edit" || name === "sliders" || name === "dots") {
    return (
      <svg {...base(size)}>
        <path d="M4 7h10M4 17h10" />
        <circle cx="17" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </svg>
    );
  }
  if (name === "chevL" || name === "chevR" || name === "chevD") {
    const d = name === "chevL" ? "m15 18-6-6 6-6" : name === "chevR" ? "m9 18 6-6-6-6" : "m6 9 6 6 6-6";
    return (
      <svg {...base(size)}>
        <path d={d} />
      </svg>
    );
  }
  if (name === "grip") {
    return (
      <svg {...base(size)}>
        <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" />
      </svg>
    );
  }
  if (name === "sync") {
    return (
      <svg {...base(size)}>
        <path d="M20 7h-5V2" />
        <path d="M4 17h5v5" />
        <path d="M7.5 7.5a7 7 0 0 1 11.5 2" />
        <path d="M16.5 16.5a7 7 0 0 1-11.5-2" />
      </svg>
    );
  }
  if (name === "target") {
    return (
      <svg {...base(size)}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg {...base(size)}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (name === "pie") {
    return (
      <svg {...base(size)}>
        <path d="M12 3v9h9" />
        <path d="M20.5 14a8.5 8.5 0 1 1-10-10" />
      </svg>
    );
  }
  if (name === "list") {
    return (
      <svg {...base(size)}>
        <path d="M8 6h12M8 12h12M8 18h12" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" />
      </svg>
    );
  }
  if (name === "grid") {
    return (
      <svg {...base(size)}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );
  }
  if (name === "sun") {
    return (
      <svg {...base(size)}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (name === "code") {
    return (
      <svg {...base(size)}>
        <path d="m8 16-4-4 4-4M16 8l4 4-4 4M14 4l-4 16" />
      </svg>
    );
  }
  if (name === "paper" || name === "writing") {
    return (
      <svg {...base(size)}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </svg>
    );
  }
  if (name === "reading" || name === "book") {
    return (
      <svg {...base(size)}>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 4H20v16H7.5A3.5 3.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 8h8M8 12h7" />
      </svg>
    );
  }
  if (name === "course") {
    return (
      <svg {...base(size)}>
        <path d="M4 6h16v12H4z" />
        <path d="M8 20h8M12 18v2M8 10h8M8 14h5" />
      </svg>
    );
  }
  if (name === "meeting") {
    return (
      <svg {...base(size)}>
        <path d="M7 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M3.5 20a4.5 4.5 0 0 1 9 0M12 20a4.5 4.5 0 0 1 8.5 0" />
      </svg>
    );
  }
  if (name === "design" || name === "art") {
    return (
      <svg {...base(size)}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
      </svg>
    );
  }
  if (name === "development") {
    return (
      <svg {...base(size)}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M8 10l-2 2 2 2M16 10l2 2-2 2M13 8l-2 8" />
      </svg>
    );
  }
  if (name === "coffee") {
    return (
      <svg {...base(size)}>
        <path d="M5 8h12v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z" />
        <path d="M17 10h1a3 3 0 0 1 0 6h-1M8 3v2M12 3v2" />
      </svg>
    );
  }
  if (name === "dumbbell" || name === "fitness") {
    return (
      <svg {...base(size)}>
        <path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />
      </svg>
    );
  }
  if (name === "shopping") {
    return (
      <svg {...base(size)}>
        <path d="M6 8h16l-2 9H8z" />
        <path d="M6 8 5 4H2M9 21h.01M18 21h.01" />
      </svg>
    );
  }
  if (name === "commute" || name === "travel") {
    return (
      <svg {...base(size)}>
        <path d="M6 17h12l1-7a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4z" />
        <path d="M7 17l-1 3M18 17l1 3M8 12h8M8 20h.01M16 20h.01" />
      </svg>
    );
  }
  if (name === "entertainment" || name === "game") {
    return (
      <svg {...base(size)}>
        <path d="M7 16h10a4 4 0 0 0 3.8-5.3l-.9-2.6A3 3 0 0 0 17.1 6H6.9a3 3 0 0 0-2.8 2.1l-.9 2.6A4 4 0 0 0 7 16Z" />
        <path d="M8 11h4M10 9v4M16 10h.01M18 12h.01" />
      </svg>
    );
  }
  if (name === "music") {
    return (
      <svg {...base(size)}>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </svg>
    );
  }
  if (name === "food") {
    return (
      <svg {...base(size)}>
        <path d="M6 3v8M10 3v8M6 7h4M8 11v10M17 3v18M14 3v6a3 3 0 0 0 6 0V3" />
      </svg>
    );
  }
  if (name === "brain" || name === "idea") {
    return (
      <svg {...base(size)}>
        <path d="M9 18h6M10 22h4" />
        <path d="M8 14a6 6 0 1 1 8 0c-1 1-1.5 1.8-1.5 3h-5c0-1.2-.5-2-1.5-3Z" />
      </svg>
    );
  }
  return <IconCategory kind={name} size={size} />;
}
