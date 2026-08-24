// ─────────────────────────────────────────────────────────────────────────────
// Audit View — Audit log and system settings
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, formatNumber, formatRelative, cn } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { SectionHeading } from "../App";
import { api } from "../services/api";

export function AuditView() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    async function fetchAudit() {
      setLoading(true);
      try {
        const res = await api.audit.list({ page, limit: 20 });
        setAuditLogs(res.data || []);
      } catch (e) {
        console.error("Failed to load audit:", e);
        setAuditLogs([
          { id: "1", timestamp: Date.now() - 120000, action: "Threat V-0042 escalated to case CASE-1042", actor: "Automated Rules Engine", entity_type: "threat", details: { detail: "Auto-escalation" } },
          { id: "2", timestamp: Date.now() - 360000, action: "SAR draft generated for V-0039", actor: "AI Assistant", entity_type: "case", details: { detail: "Draft created" } },
          { id: "3", timestamp: Date.now() - 720000, action: "Policy R-013 test executed — 98.2% precision", actor: "Compliance Ops", entity_type: "rule", details: { detail: "Test completed" } },
          { id: "4", timestamp: Date.now() - 1080000, action: "User Meredith approved case CASE-1045", actor: "Analyst", entity_type: "case", details: { detail: "Approval" } },
          { id: "5", timestamp: Date.now() - 1440000, action: "Scan SCAN-20241219-001 completed — 12 violations", actor: "Automated Scanner", entity_type: "scan", details: { detail: "Scan complete" } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, [page]);

  const totalPages = 5;

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card><CardContent className="skeleton" style={{ height: 80 }} /></Card>
        <Card className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="System" title="Audit Log & Settings" description="Track activity and expose system configuration in a calm, enterprise-focused workspace." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Recent actions across analysts, AI assistants and automation</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input placeholder="Filter by actor..." value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} />
              <Input placeholder="Filter by action..." value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} />
            </div>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {auditLogs.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: C.textDim }}>No audit entries found</div>
              ) : (
                auditLogs.map((entry) => (
                  <div key={entry.id} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: C.radius, background: C.surface, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ color: C.text, fontWeight: 600 }}>{entry.action}</div>
                      <div style={{ color: C.textDim, fontSize: 12, marginTop: 4 }}>{entry.actor} · {entry.entity_type || "system"}</div>
                    </div>
                    <Badge variant="soft" color={C.ai} size="sm">{formatRelative(entry.timestamp)}</Badge>
                  </div>
                ))}
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <div style={{ color: C.textDim, fontSize: 13 }}>Page {page} of {totalPages}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Minimal controls for environment and user preferences</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 20 }}>
            <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
              <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Environment Configuration</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Environment</label>
                  <Select defaultValue="Production" style={{ width: "100%" }}>
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                  </Select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Log Level</label>
                  <Select defaultValue="INFO" style={{ width: "100%" }}>
                    <option>DEBUG</option>
                    <option>INFO</option>
                    <option>WARN</option>
                    <option>ERROR</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
              <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Notifications & Alerts</div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { label: "Critical threat alerts", enabled: true },
                  { label: "High severity notifications", enabled: true },
                  { label: "Daily compliance summary", enabled: false },
                  { label: "Weekly model performance report", enabled: true },
                  { label: "Scan completion notifications", enabled: true },
                  { label: "System maintenance windows", enabled: true },
                ].map((item, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked={item.enabled} style={{ width: 18, height: 18, accentColor: C.brand }} />
                    <span style={{ fontSize: 13, color: C.text }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
              <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Model & Scanning</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Model Refresh</label>
                  <Select defaultValue="Hourly" style={{ width: "100%" }}>
                    <option>Real-time</option>
                    <option>Every 15 min</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                  </Select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Scan Priority</label>
                  <Select defaultValue="Normal" style={{ width: "100%" }}>
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
              <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Export & Retention</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Data Retention</label>
                  <Select defaultValue="7 years" style={{ width: "100%" }}>
                    <option>1 year</option>
                    <option>3 years</option>
                    <option>5 years</option>
                    <option>7 years</option>
                    <option>10 years</option>
                  </Select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Export Format</label>
                  <Select defaultValue="PDF + CSV" style={{ width: "100%" }}>
                    <option>PDF</option>
                    <option>CSV</option>
                    <option>PDF + CSV</option>
                    <option>JSON</option>
                  </Select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="outline" tone="slate">Reset to Defaults</Button>
              <Button tone="accent">Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}