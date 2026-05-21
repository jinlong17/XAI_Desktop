"use client";

import { useState } from "react";
import { WebLayout } from "../components/WebLayout";
import { mockDevices, revokeMockDevice, type MockDevice } from "../lib/accountMocks";

export default function DevicesPage() {
  const [devices, setDevices] = useState<MockDevice[]>(mockDevices);
  const [message, setMessage] = useState("Remote revoke calls the G9 device_revoke contract through a mock adapter.");

  function revokeDevice(deviceId: string) {
    setDevices((current) => revokeMockDevice(current, deviceId));
    setMessage(`Device ${deviceId} revoked locally. Re-key and Supabase RPC execution are deferred gates.`);
  }

  return (
    <WebLayout active="devices">
      <section className="page-stack">
        <div className="section-heading">
          <p className="eyebrow">Devices</p>
          <h1>Paired devices</h1>
        </div>
        <div className="device-grid">
          {devices.map((device) => (
            <article className="device-card" key={device.deviceId}>
              <div className="card-heading">
                <div>
                  <h2>{device.name}</h2>
                  <p>{device.platform} - {device.appVersion}</p>
                </div>
                <span className={`state-pill ${device.status}`}>{device.status}</span>
              </div>
              <dl className="meta-list">
                <div>
                  <dt>Last seen</dt>
                  <dd>{formatDate(device.lastSeenAtIso)}</dd>
                </div>
                <div>
                  <dt>Paired</dt>
                  <dd>{formatDate(device.pairedAtIso)}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="danger-action"
                disabled={device.status !== "active"}
                onClick={() => revokeDevice(device.deviceId)}
              >
                {device.status === "active" ? "Revoke" : device.status === "current" ? "This device" : "Revoked"}
              </button>
            </article>
          ))}
        </div>
        <p className="status-note">{message}</p>
      </section>
    </WebLayout>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
