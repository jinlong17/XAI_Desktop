import { useState } from 'react';
import type { Lang } from '@repo/plugin-web-tokens';
export interface DashboardRecovery {
  error: string | null;
  retry: () => boolean;
  discard: () => void;
  snapshot: () => unknown;
}
export function DashboardSaveRecovery({ recovery, lang, label }: { recovery: DashboardRecovery; lang: Lang; label: string }) {
  const [exportFailed, setExportFailed] = useState(false);
  if (!recovery.error) return null;
  return <section role="alert" className="dash-grid-recovery">
    <p>{lang === 'zh' ? '更改未保存；草稿仅保留在此页面。' : 'Changes were not saved; drafts stay on this page only.'} {label}: {recovery.error}</p>
    <button type="button" onClick={() => recovery.retry()}>{lang === 'zh' ? '重试更改' : 'Retry changes'}</button>
    <button type="button" onClick={() => {
      try {
        const blob = new Blob([JSON.stringify(recovery.snapshot(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob), anchor = document.createElement('a');
        anchor.href = url; anchor.download = 'dashboard-grid-recovery.json'; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000); setExportFailed(false);
      } catch { setExportFailed(true); }
    }}>{lang === 'zh' ? '导出更改' : 'Export changes'}</button>
    <button type="button" onClick={() => { recovery.discard(); setExportFailed(false); }}>{lang === 'zh' ? '放弃并重新加载' : 'Discard and reload saved data'}</button>
    {exportFailed && <p>{lang === 'zh' ? '导出失败或账户已更改。' : 'Export failed or the account changed.'}</p>}
  </section>;
}
