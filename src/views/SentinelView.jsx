// ─────────────────────────────────────────────────────────────────────────────
// Sentinel View — Live monitoring dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, cn } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import { Badge } from "../components/ui/Badge";
import { SectionHeading } from "../components/shared";

export function SentinelView() {
  const [health, setHealth] = useState({
    system_health: 99.8,
    model_status: "Healthy",
    pipeline_status: "Stable",
    latency: 128,
    queue_count: 0,
    cpu_usage: 30,
    memory_usage: 45,
    disk_io: 10,
    network_usage: 5,
  });
  const [detectionStats, setDetectionStats] = useState({
    ingestion: 95,
    alerts: 72,
    latency_pct: 44,
    model_update: 88,
  });
  const [liveFeed, setLiveFeed] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setHealth(prev => ({
        ...prev,
        system_health: Math.max(99.5, Math.min(100, prev.system_health + (Math.random() - 0.5) * 0.4)),
        model_status: Math.random() > 0.02 ? "Healthy" : "Degraded",
        pipeline_status: Math.random() > 0.05 ? "Stable" : "Backlog",
        latency: Math.floor(100 + Math.random() * 100),
        queue_count: Math.max(0, Math.min(100, prev.queue_count + Math.floor((Math.random() - 0.5) * 10))),
        cpu_usage: Math.max(10, Math.min(80, prev.cpu_usage + Math.floor((Math.random() - 0.5) * 10))),
        memory_usage: Math.max(20, Math.min(90, prev.memory_usage + Math.floor((Math.random() - 0.5) * 10))),
        disk_io: Math.max(0, Math.min(50, prev.disk_io + Math.floor((Math.random() - 0.5) * 10))),
        network_usage: Math.max(0, Math.min(30, prev.network_usage + Math.floor((Math.random() - 0.5) * 5))),
      }));
      setDetectionStats(prev => ({
        ingestion: Math.max(80, Math.min(100, prev.ingestion + (Math.random() - 0.5) * 10)),
        alerts: Math.max(50, Math.min(95, prev.alerts + (Math.random() - 0.5) * 20)),
        latency_pct: Math.max(20, Math.min(80, prev.latency_pct + (Math.random() - 0.5) * 15)),
        model_update: Math.max(70, Math.min(100, prev.model_update + (Math.random() - 0.5) * 5)),
      }));

      // Add live transaction
      const formats = ["WIRE", "TRANSFER", "CASH_OUT", "PAYMENT", "ACH", "SWIFT"];
      const newTxn = {
        id: Date.now(),
        txn_id: `TXN-${String(Date.now()).slice(-5)}${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
        from: `ACC-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        to: `ACC-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        amount: Math.floor(Math.random() * 50000) + 100,
        format: formats[Math.floor(Math.random() * formats.length)],
        timestamp: Date.now(),
        flagged: Math.random() < 0.05,
      };
      setLiveFeed(prev => [newTxn, ...prev.slice(0, 19)]);
    }, 3000);

    // Set connected after first interval tick
    const connectTimer = setTimeout(() => setConnected(true), 100);
    return () => { clearInterval(interval); clearTimeout(connectTimer); setConnected(false); };
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="Operational monitoring" title="Sentinel" description="Continuous monitoring for model health, ingestion latency, processing backlog and alert generation." actions={[
        <Badge variant={connected ? "soft" : "outline"} color={connected ? C.resolved : C.high} size="sm" dot>
          {connected ? "Connected" : "Disconnected"}
        </Badge>,
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <Card>
          <CardContent style={{ padding: 20, display: "grid", gap: 8 }}>
            <div style={{ color: C.textDim, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>System Health</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ color: health.system_health >= 99.5 ? C.resolved : health.system_health >= 99 ? C.high : C.critical, fontSize: 36, fontWeight: 800 }}>{health.system_health.toFixed(1)}%</div>
              <Badge variant="soft" color={health.system_health >= 99.5 ? C.resolved : C.high} size="sm">Operational</Badge>
            </div>
            <Progress value={health.system_health} color={health.system_health >= 99.5 ? C.resolved : C.high} height={6} />
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: 20, display: "grid", gap: 8 }}>
            <div style={{ color: C.textDim, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Model Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: health.model_status === "Healthy" ? C.resolved : C.critical }} />
              <div style={{ color: health.model_status === "Healthy" ? C.resolved : C.critical, fontSize: 20, fontWeight: 700 }}>{health.model_status}</div>
            </div>
            <div style={{ color: C.textDim, fontSize: 12 }}>v2.4.1 · Updated 2h ago</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: 20, display: "grid", gap: 8 }}>
            <div style={{ color: C.textDim, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pipeline Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: health.pipeline_status === "Stable" ? C.resolved : C.high }} />
              <div style={{ color: health.pipeline_status === "Stable" ? C.resolved : C.high, fontSize: 20, fontWeight: 700 }}>{health.pipeline_status}</div>
            </div>
            <div style={{ color: C.textDim, fontSize: 12 }}>Queue: {health.queue_count} pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: 20, display: "grid", gap: 8 }}>
            <div style={{ color: C.textDim, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Latency</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ color: health.latency <= 150 ? C.resolved : health.latency <= 300 ? C.high : C.critical, fontSize: 36, fontWeight: 800 }}>{health.latency}ms</div>
              <Badge variant="soft" color={health.latency <= 150 ? C.resolved : health.latency <= 300 ? C.high : C.critical} size="sm">
                {health.latency <= 150 ? "Optimal" : health.latency <= 300 ? "Elevated" : "Degraded"}
              </Badge>
            </div>
            <Progress value={Math.min(100, health.latency / 5)} color={health.latency <= 150 ? C.resolved : C.high} height={6} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detection Engine Status</CardTitle>
          <CardDescription>Transaction ingestion, alerts generated, processing latency and last model update</CardDescription>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 16 }}>
          {[
            { label: "Transaction Ingestion", value: detectionStats.ingestion, color: C.brand, icon: "📥" },
            { label: "Alerts Generated", value: detectionStats.alerts, color: C.high, icon: "🔔" },
            { label: "Processing Latency", value: detectionStats.latency_pct, color: C.ai, icon: "⚡" },
            { label: "Last Model Update", value: detectionStats.model_update, color: C.resolved, icon: "🧠" },
          ].map((item) => (
            <div key={item.label} style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: C.text, fontSize: 13.5, fontWeight: 600 }}>{item.label}</span>
                </div>
                <div style={{ color: item.color, fontSize: 24, fontWeight: 800 }}>{item.value}%</div>
              </div>
              <Progress value={item.value} color={item.color} height={8} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Live Transaction Feed</CardTitle>
            <CardDescription>Real-time transaction stream with AML flagging</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: 0, maxHeight: 350, overflowY: "auto" }}>
            <div style={{ display: "grid", gap: 0 }}>
              {liveFeed.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: C.textDim }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.5 }}><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                  <div>Waiting for live transactions...</div>
                </div>
              ) : (
                liveFeed.map((txn) => (
                  <div key={txn.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: txn.flagged ? C.criticalSoft : "transparent", transition: "background 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Badge variant={txn.flagged ? "solid" : "soft"} color={txn.flagged ? C.critical : C.resolved} size="xs">{txn.flagged ? "FLAGGED" : "CLEAN"}</Badge>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text }}>{txn.txn_id}</div>
                      <div style={{ color: C.textDim, fontSize: 12 }}>{txn.from} → {txn.to}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: C.text }}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(txn.amount)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textDim, fontSize: 11.5 }}>
                      <Badge variant="outline" size="xs">{txn.format}</Badge>
                      <span>{new Date(txn.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Live performance indicators</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>CPU Usage</div>
              <div style={{ color: C.brand, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{health.cpu_usage}%</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Memory</div>
              <div style={{ color: C.ai, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{health.memory_usage}%</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Disk I/O</div>
              <div style={{ color: C.high, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{health.disk_io}%</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Network</div>
              <div style={{ color: C.resolved, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{health.network_usage}%</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}