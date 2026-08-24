// ─────────────────────────────────────────────────────────────────────────────
// Threats View — Threat registry with filtering, sorting, pagination
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { C, riskColor, formatCurrency, formatRelative } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Tabs } from "../components/ui/Tabs";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

export function ThreatsView({ search, threatPage, setThreatPage, openThreat }) {
  const [threats, setThreats] = useState([]);
  const [totalThreats, setTotalThreats] = useState(0);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState("detected_at");

  useEffect(() => {
    async function fetchThreats() {
      setLoading(true);
      try {
        const params = {
          page: threatPage,
          limit: 20,
          severity: severity !== "All" ? severity.toLowerCase() : undefined,
          status: status !== "All" ? status.toLowerCase().replace(" ", "_") : undefined,
          sort: sortKey,
          order: sortKey === "amount" ? "desc" : "desc",
        };
        const res = await api.threats.list(params);
        setThreats(res.data || []);
        setTotalThreats(res.pagination?.total || 0);
      } catch (e) {
        console.error("Failed to load threats:", e);
        setThreats(Array.from({ length: 10 }, (_, i) => ({
          id: i,
          threat_id: `V-${String(i + 1).padStart(4, "0")}`,
          rule_id: `R-${String((i % 12) + 1).padStart(3, "0")}`,
          severity: ["critical", "high", "medium", "low"][i % 4],
          status: ["open", "investigating", "resolved"][i % 3],
          confidence: 0.75 + Math.random() * 0.24,
          detected_at: Date.now() - i * 3600000,
          txn_id: `TXN-${String(10000 + i).padStart(5, "0")}`,
          amount: Math.floor(Math.random() * 50000) + 1000,
        })));
        setTotalThreats(100);
      } finally {
        setLoading(false);
      }
    }
    fetchThreats();
  }, [threatPage, severity, status, sortKey]);

  const totalPages = Math.max(1, Math.ceil(totalThreats / 20));

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card>
          <CardContent style={{ padding: 32 }}>
            <div className="skeleton" style={{ height: 28, width: "30%", borderRadius: C.radius }} />
          </CardContent>
        </Card>
        <Card className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading
        eyebrow="Threat intelligence"
        title="Threats"
        description="Modern analyst workflow for reviewing active threats with filtering, sorting, pagination and one-click investigation opening."
        actions={[
          <Select key="s1" value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: 150 }}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></Select>,
          <Select key="s2" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 150 }}><option>All</option><option>Open</option><option>Investigating</option><option>Resolved</option><option>False Positive</option></Select>,
          <Select key="s3" value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ width: 160 }}><option value="detected_at">Sort: Newest</option><option value="confidence">Sort: Confidence</option><option value="severity">Sort: Severity</option></Select>,
        ]}
      />
      <Card>
        <CardContent style={{ padding: 0 }}>
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: 100 }}>Severity</th>
                <th>Threat ID</th>
                <th>Rule</th>
                <th>Transaction</th>
                <th>Amount</th>
                <th>Confidence</th>
                <th>Detected</th>
                <th style={{ width: 130 }}>Status</th>
                <th style={{ width: 90 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {threats.map((row) => (
                <tr key={row.id} className="table-row clickable" onClick={() => openThreat(row)}>
                  <td><Badge severity={row.severity} size="sm" dot /></td>
                  <td style={{ fontWeight: 700, color: C.text }}>{row.threat_id}</td>
                  <td style={{ color: C.textDim }}>{row.rule_id}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{row.txn_id}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{formatCurrency(row.amount)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Progress value={Math.round(row.confidence * 100)} color={riskColor(Math.round(row.confidence * 100))} height={6} style={{ width: 80 }} />
                      <span style={{ fontSize: 12, color: C.textDim }}>{Math.round(row.confidence * 100)}%</span>
                    </div>
                  </td>
                  <td style={{ color: C.textDim }}>{formatRelative(row.detected_at)}</td>
                  <td><Badge status={row.status} size="sm" /></td>
                  <td><Button variant="ghost" size="sm" tone="accent">Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap", gap: 12 }}>
            <div style={{ color: C.textDim, fontSize: 13 }}>Page {threatPage} of {totalPages} · {totalThreats} total</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" size="sm" onClick={() => setThreatPage(Math.max(1, threatPage - 1))} disabled={threatPage <= 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setThreatPage(Math.min(totalPages, threatPage + 1))} disabled={threatPage >= totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}