import type { ReactNode } from "react";
import type { BookkeepingCategory, BookkeepingKind, CurrencyCode } from "../types.js";
import { money } from "./money.js";
import { Icon } from "./icons.js";

export const GREEN = "oklch(58% 0.13 150)";
export const RED = "var(--red)";

export function ink(hue: number): string {
  return `oklch(58% 0.13 ${hue})`;
}

export function soft(hue: number): string {
  return `oklch(94% 0.05 ${hue})`;
}

export function CatCircle({ cat, size = 38 }: { readonly cat: BookkeepingCategory | null; readonly size?: number }) {
  if (!cat) return null;
  return (
    <span className="bk-cat-circle" style={{ width: size, height: size, background: soft(cat.hue), color: ink(cat.hue) }}>
      <Icon name={cat.icon} size={Math.max(14, size * 0.48)} />
    </span>
  );
}

export function Bar({ pct, hue, height = 5 }: { readonly pct: number; readonly hue: number; readonly height?: number }) {
  const over = pct > 100;
  return (
    <span className="bk-bar" style={{ height }}>
      <span style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: over ? RED : ink(hue) }} />
    </span>
  );
}

export function Donut({
  segs,
  size = 124,
  stroke = 14,
  children,
}: {
  readonly segs: readonly { readonly v: number; readonly color: string }[];
  readonly size?: number;
  readonly stroke?: number;
  readonly children?: ReactNode;
}) {
  const total = segs.reduce((sum, seg) => sum + Math.max(0, seg.v), 0) || 1;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;
  return (
    <span className="bk-donut" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-1)" strokeWidth={stroke} />
        {segs.map((seg, index) => {
          const len = (Math.max(0, seg.v) / total) * circumference;
          const offset = circumference - acc;
          acc += len;
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      {children ? <span className="bk-donut-center">{children}</span> : null}
    </span>
  );
}

export function MoneyText({
  amount,
  type,
  currency,
  size,
}: {
  readonly amount: number;
  readonly type: BookkeepingKind;
  readonly currency: CurrencyCode;
  readonly size?: string;
}) {
  const sign = type === "income" ? "+" : type === "transfer" ? "" : "-";
  const color = type === "income" ? GREEN : type === "transfer" ? "var(--text-2)" : "var(--text-1)";
  return (
    <span className="mono bk-money-text" style={{ color, fontSize: size }}>
      {sign}
      {money(amount, currency)}
    </span>
  );
}

export function Modal({
  title,
  icon,
  width = 520,
  children,
  footer,
  onClose,
  className = "",
}: {
  readonly title: string;
  readonly icon?: string;
  readonly width?: number;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly className?: string;
}) {
  return (
    <div className="bk-scrim" onMouseDown={onClose}>
      <section className={`bk-modal ${className}`} style={{ width }} onMouseDown={(event) => event.stopPropagation()}>
        <header className="bk-modal-head">
          {icon ? <Icon name={icon} size={18} /> : null}
          <h3>{title}</h3>
          <span className="grow" />
          <button type="button" className="icon-btn" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </header>
        <div className="bk-modal-body">{children}</div>
        {footer ? <footer className="bk-modal-foot">{footer}</footer> : null}
      </section>
    </div>
  );
}

export function Field({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <label className="bk-field">
      <span className="bk-field-label">{label}</span>
      {children}
    </label>
  );
}

export function Toggle({
  on,
  label,
  hint,
  onChange,
}: {
  readonly on: boolean;
  readonly label: string;
  readonly hint?: string;
  readonly onChange: (next: boolean) => void;
}) {
  return (
    <button type="button" className="bk-toggle-row" onClick={() => onChange(!on)}>
      <span className="bk-toggle-text">
        <span className="bk-toggle-label">{label}</span>
        {hint ? <span className="bk-toggle-hint">{hint}</span> : null}
      </span>
      <span className={`bk-toggle ${on ? "on" : ""}`}>
        <span />
      </span>
    </button>
  );
}
