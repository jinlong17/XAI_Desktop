import { WebLayout } from "../components/WebLayout";

export default function PrivacyPage() {
  return (
    <WebLayout active="legal">
      <article className="legal-doc">
        <p className="eyebrow">Legal review required</p>
        <h1>Privacy Policy</h1>
        <p>
          This template describes XAI Desktop as a local-first macOS application with optional encrypted sync. It is not
          final legal advice and must be reviewed by counsel before public release.
        </p>
        <h2>Data we process</h2>
        <p>
          Account email, device metadata, support messages, crash diagnostics, and encrypted sync envelopes may be
          processed to provide the service. User content is designed to remain encrypted before it leaves the device.
        </p>
        <h2>Local data</h2>
        <p>
          Desktop and web clients store local state for offline operation. Export and delete-account controls are
          available from the account area.
        </p>
        <h2>Contact</h2>
        <p>Privacy requests route through support until a production privacy inbox is approved.</p>
      </article>
    </WebLayout>
  );
}
