/**
 * collaboratePane — Settings → Collaborate pane.
 *
 * 3 live-persist controls (no Save footer — source uses live onChange).
 * Port of web design/module-settings.jsx lines 878-895.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.8
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { usePref, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";
import type { DefaultShare } from "../types.js";

function isDefaultShare(value: unknown): value is DefaultShare {
  return value === "comment" || value === "edit" || value === "view";
}

function CollaboratePaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  const [showAvatars, setShowAvatars] = usePref(
    "xai_pref_collab_show_avatars" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const defaultSharePref = usePrefAutosaveAsync(
    "xai_pref_collab_default_share" as WebPrefKey,
    { validate: isDefaultShare },
  );

  const [mentionNotify, setMentionNotify] = usePref(
    "xai_pref_collab_mention_notify" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  return (
    <div className="collab-pane">
      <h3 className="pane-title">{s("settings.collaborate")}</h3>
      <SectionBlock>
        <SettingRow label={t("collab.showAvatars")}>
          <Toggle
            on={showAvatars}
            onChange={() => setShowAvatars(!showAvatars)}
            ariaLabel={t("collab.showAvatars")}
          />
        </SettingRow>
        <SettingRow label={t("collab.defaultShare")}>
          <div>
            <select
              className="sl-select"
              value={defaultSharePref.value as DefaultShare}
              onChange={(e) => { const next = e.target.value; if (next === "comment" || next === "edit" || next === "view") void defaultSharePref.edit(next); }}
              aria-label={t("collab.defaultShare")}
            >
              <option value="comment">{t("collab.canComment")}</option>
              <option value="edit">{t("collab.canEdit")}</option>
              <option value="view">{t("collab.viewOnly")}</option>
            </select>
            <span role="status" aria-live="polite">{defaultSharePref.meta.status === "pending" ? t("collab.saving") : defaultSharePref.meta.status === "saved" ? t("collab.saved") : defaultSharePref.meta.error ? t("collab.notSaved") : ""}</span>
            {(defaultSharePref.meta.status === "error" || defaultSharePref.meta.status === "conflict") && <button type="button" onClick={() => void defaultSharePref.meta.retry()}>{t("collab.retry")}</button>}
            {defaultSharePref.meta.status === "conflict" && <button type="button" onClick={defaultSharePref.meta.reload}>{t("collab.reload")}</button>}
          </div>
        </SettingRow>
        <SettingRow label={t("collab.mentionNotify")}>
          <Toggle
            on={mentionNotify}
            onChange={() => setMentionNotify(!mentionNotify)}
            ariaLabel={t("collab.mentionNotify")}
          />
        </SettingRow>
      </SectionBlock>
    </div>
  );
}

export const collaboratePane: Pane = {
  id: "collaborate",
  icon: "sliders",
  i18nKey: "settings.collaborate",
  render: (props: PaneRenderProps): React.ReactElement => (
    <CollaboratePaneContent {...props} />
  ),
};
