/**
 * EmptyState — bilingual "no widgets yet" placeholder.
 *
 * Rendered by DashboardModule when widgets.length === 0. Meets the
 * acceptance signal "Dashboard route renders an empty grid" for v1 ship
 * (this row solo, before row #11 ships).
 *
 * CTA button click handler is wired in P3 to emit
 * `web:dashboard:add-widget-clicked` with `source: 'empty-state-cta'`.
 */
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";

export interface EmptyStateProps {
  /** Active language. */
  lang: Lang;
  /** Click handler for the CTA button. Wired in P3. */
  onAddWidget?: () => void;
}

export function EmptyState({ lang, onAddWidget }: EmptyStateProps) {
  const { s } = useI18n(lang);

  const title = s("dashboard.empty_title");
  const subtitle = s("dashboard.empty_subtitle");
  const cta = s("dashboard.add_widget");
  const ariaLabel = s("dashboard.add_widget_aria");

  return (
    <div className="dash-empty" role="status">
      <div className="dash-empty__title">{title}</div>
      <div className="dash-empty__subtitle">{subtitle}</div>
      <button
        type="button"
        className="btn dash-empty__cta"
        aria-label={ariaLabel}
        onClick={onAddWidget}
      >
        {cta}
      </button>
    </div>
  );
}
