interface IconProps {
  readonly size?: number;
}

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
  if (kind === "work") {
    return (
      <svg {...base(size)}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5h6v2" />
      </svg>
    );
  }
  if (kind === "life") {
    return (
      <svg {...base(size)}>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    );
  }
  if (kind === "rest") {
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
