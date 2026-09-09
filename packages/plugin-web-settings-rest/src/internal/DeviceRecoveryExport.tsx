import { useState } from "react";
import { accountScope, exportDeviceRecoveryData } from "@repo/plugin-web-storage";

/** Device-wide data is an explicit, separate download, never an account export. */
export function DeviceRecoveryExport({ lang }: { lang: "en" | "zh" }) {
  const [scope] = useState(() => accountScope.capture());
  const [includeLegacy, setIncludeLegacy] = useState(false);
  const [includeArchives, setIncludeArchives] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const zh = lang === "zh";

  function download() {
    let url: string | undefined;
    try {
      accountScope.assertCurrent(scope);
      const data = exportDeviceRecoveryData({ includeLegacy, includeArchives });
      url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `xai-device-recovery-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      try { link.click(); } finally { link.remove(); }
      setFailed(false);
      const omitted = data.manifest.omitted.length;
      setMessage(omitted > 0
        ? (zh ? `已请求下载；有 ${omitted} 项因凭据保护或格式无法确认而未包含，详情见文件内范围清单。原数据未更改。` : `Download requested; ${omitted} items were excluded to protect credentials or because their format could not be verified. See the file's scope manifest. Original data is unchanged.`)
        : (zh ? "已请求下载，请检查浏览器下载记录。原数据未更改。" : "Download requested. Check your browser downloads. Original data is unchanged."));
    } catch {
      setFailed(true);
      setMessage(zh ? "无法导出。请检查浏览器存储权限；账户已切换时请重新打开设置。" : "Could not export. Check browser storage access; reopen settings if your account changed.");
    } finally {
      if (url) { const completedUrl = url; setTimeout(() => URL.revokeObjectURL(completedUrl), 1000); }
    }
  }

  return <details className="device-recovery-export">
    <summary>{zh ? "单独导出此浏览器的设置与历史数据" : "Export this browser's settings and history separately"}</summary>
    <p>{zh ? "默认只包含此浏览器的外观、布局和设备偏好，包括记账布局及计时显示设置。它们由此浏览器的账户共用。" : "Includes this browser's appearance, layout and device preferences, including bookkeeping layout and timer display settings. These settings are shared by accounts using this browser."}</p>
    <p>{zh ? "以下历史数据可能来自其他账户。只有确实需要保留时才选择；下载文件可能包含私密内容，请妥善保存。" : "The optional history below may belong to other accounts. Include it only when needed; the downloaded file may contain private content, so store it securely."}</p>
    <label><input type="checkbox" checked={includeLegacy} onChange={event => setIncludeLegacy(event.target.checked)} />{zh ? "包含未归属账户的旧本地数据" : "Include old local data without an assigned account"}</label>
    <label><input type="checkbox" checked={includeArchives} onChange={event => setIncludeArchives(event.target.checked)} />{zh ? "包含迁移前保留的历史归档" : "Include historical archives retained before migration"}</label>
    <p>{zh ? "不包含登录凭据或 AI 密钥，也不包含当前账户的业务数据。此文件用于保存原始数据，暂不支持直接导入恢复。" : "Excludes login credentials, AI keys and current account content. This file preserves raw data; direct import and restore are not currently supported."}</p>
    <button type="button" className="btn ghost" onClick={download}>{zh ? "下载设备数据文件" : "Download device data file"}</button>
    {message && <p role={failed ? "alert" : "status"}>{message}</p>}
  </details>;
}
