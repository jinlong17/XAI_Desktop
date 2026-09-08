"use client";

import { useMemo, useState } from "react";
import { WebLayout } from "../components/WebLayout";
import { createMockExportBundle } from "../lib/accountMocks";

export default function ExportPage() {
  const [status, setStatus] = useState("Encrypted export bundle is ready to generate.");
  const bundle = useMemo(() => JSON.stringify(createMockExportBundle(), null, 2), []);

  function downloadBundle() {
    const blob = new Blob([bundle], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "xai-account-export.mock.xaibundle";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded mock encrypted bundle using the plugin-account v2 export envelope.");
  }

  return (
    <WebLayout active="data">
      <section className="page-stack">
        <div className="section-heading">
          <p className="eyebrow">Data</p>
          <h1>Export</h1>
        </div>
        <div className="workspace-panel">
          <h2>Encrypted bundle</h2>
          <p>
            The browser UI emits the same `xai.encrypted-export.v2` envelope used by plugin-account. Real HMAC and
            Supabase-backed records remain deferred to the provisioned Auth gate.
          </p>
          <button type="button" onClick={downloadBundle}>
            Download bundle
          </button>
        </div>
        <pre className="code-block">{bundle}</pre>
        <p className="status-note">{status}</p>
      </section>
    </WebLayout>
  );
}
