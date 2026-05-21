import Link from "next/link";
import { WebLayout } from "../components/WebLayout";

const steps = [
  "Install the signed DMG or MAS candidate after the release gate clears.",
  "Open XAI Desktop and keep local containers on the Mac as the source of truth.",
  "Sign in with the account page mock during RC testing; Supabase Auth replaces it for GA.",
  "Use Devices to revoke stale clients, then export an encrypted bundle before destructive account work.",
];

export default function DocsPage() {
  return (
    <WebLayout active="docs">
      <section className="page-stack">
        <div className="section-heading">
          <p className="eyebrow">Docs</p>
          <h1>Quick start</h1>
        </div>
        <div className="doc-steps">
          {steps.map((step, index) => (
            <div key={step} className="step-row">
              <strong>{index + 1}</strong>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <div className="link-grid">
          <Link href="/login">Account login</Link>
          <Link href="/devices">Device management</Link>
          <Link href="/export">Export data</Link>
          <Link href="/delete-account">Delete account</Link>
        </div>
      </section>
    </WebLayout>
  );
}
