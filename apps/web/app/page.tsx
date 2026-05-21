import Link from "next/link";
import { WebLayout } from "./components/WebLayout";

const featureItems = [
  "Transparent desktop containers with native macOS windows",
  "Offline-first plugin data through Repository v0",
  "Zero-knowledge sync baseline with account, device, export, and delete controls",
  "DMG and MAS release tracks with separate deferred gates",
];

export default function Home() {
  return (
    <WebLayout active="home">
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">1.0 release candidate</p>
          <h1>XAI Desktop</h1>
          <p className="lead">
            A macOS smart desktop for organizing files, tasks, projects, and sync-safe account data from one local-first
            control surface.
          </p>
          <div className="action-row">
            <Link className="primary-action" href="#release-downloads">
              Download RC
            </Link>
            <Link className="secondary-link" href="/docs">
              Quick start
            </Link>
          </div>
        </div>
        <div className="product-shot" aria-label="Product screenshot placeholder">
          <div className="shot-titlebar">
            <span />
            <span />
            <span />
          </div>
          <div className="shot-body">
            <aside>
              <strong>XAI</strong>
              <span>Console</span>
              <span>Devices</span>
              <span>Export</span>
            </aside>
            <main>
              <div className="shot-toolbar">
                <span>Today</span>
                <span>Sync ready</span>
              </div>
              <div className="shot-grid">
                <div />
                <div />
                <div />
                <div />
              </div>
            </main>
          </div>
        </div>
      </section>
      <section className="feature-band" id="release-downloads">
        <div className="download-panel">
          <h2>Release downloads</h2>
          <p>DMG and MAS artifacts are RC-gated until Apple Developer signing, notarization, and App Review checks run.</p>
        </div>
        <div className="feature-list">
          {featureItems.map((item) => (
            <div key={item} className="feature-row">
              <span aria-hidden="true" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </WebLayout>
  );
}
