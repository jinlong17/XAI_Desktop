import { useState } from 'react';
import { accountScope, type AccountScope } from '@repo/plugin-web-storage';
import type { Lang } from '@repo/plugin-web-tokens';

/** Export is explicit and bound to the editor's original account, never the next user. */
export function TaskSaveFailure({ lang, owner, draft }: { lang: Lang; owner: AccountScope; draft: unknown }) {
  const [exportFailed, setExportFailed] = useState(false);
  function exportDraft() {
    try {
      accountScope.assertCurrent(owner);
      if (!accountScope.isReady(owner)) throw new Error('Account changed');
      const blob = new Blob([JSON.stringify({ version: 1, type: 'xai-task-draft', draft }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const revoke = URL.revokeObjectURL.bind(URL);
      const link = document.createElement('a');
      link.href = url; link.download = 'xai-task-draft.json'; link.click();
      setTimeout(() => revoke(url), 1000);
      setExportFailed(false);
    } catch { setExportFailed(true); }
  }
  return <div className="task-save-failure" role="alert">
    <p>{lang === 'zh' ? '保存失败，修改仍保留在此处。请重试保存，或先导出草稿。' : 'Could not save. Your changes are still here. Try saving again, or export this draft.'}</p>
    <button type="button" className="task-composer__btn" onClick={exportDraft}>{lang === 'zh' ? '导出草稿' : 'Export draft'}</button>
    {exportFailed && <p>{lang === 'zh' ? '无法导出。请确认仍在原账户中，且浏览器允许下载。' : 'Could not export. Check that you are still in the original account and browser downloads are allowed.'}</p>}
  </div>;
}
