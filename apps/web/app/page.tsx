import { WebLayout } from "./components/WebLayout";

export default function Home() {
  return (
    <WebLayout active="home">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Browser safe console</p>
          <h1>XAI Desktop Web</h1>
          <p className="lead">
            A web-hosted control surface for desktop workflows, shared plugin previews, and offline-first sync prototypes.
          </p>
        </div>
        <div className="signal-grid" aria-label="System overview">
          <div>
            <strong>Local first</strong>
            <span>IndexedDB primary writes</span>
          </div>
          <div>
            <strong>Desktop aware</strong>
            <span>Tauri APIs degrade safely</span>
          </div>
          <div>
            <strong>AI guarded</strong>
            <span>Privacy and cost gates</span>
          </div>
        </div>
      </section>
    </WebLayout>
  );
}
