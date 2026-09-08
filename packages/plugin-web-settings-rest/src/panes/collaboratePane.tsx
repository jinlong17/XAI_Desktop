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
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";
import type { DefaultShare } from "../types.js";

function CollaboratePaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  const [showAvatars, setShowAvatars] = usePref(
    "xai_pref_collab_show_avatars" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [defaultShare, setDefaultShare] = usePref(
    "xai_pref_collab_default_share" as WebPrefKey,
  ) as readonly [DefaultShare, (v: DefaultShare) => void, unknown];

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
          <select
            className="sl-select"
            value={defaultShare}
            onChange={(e) => setDefaultShare(e.target.value as DefaultShare)}
            aria-label={t("collab.defaultShare")}
          >
            <option value="comment">{t("collab.canComment")}</option>
            <option value="edit">{t("collab.canEdit")}</option>
            <option value="view">{t("collab.viewOnly")}</option>
          </select>
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
